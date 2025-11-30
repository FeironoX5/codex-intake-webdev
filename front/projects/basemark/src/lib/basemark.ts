import { Observable, Subject } from 'rxjs';
import {
  BaseMarkEvent,
  BlockNode,
  BlockRule,
  ContainerNode,
  TextNode,
} from './basemark.types';
import { BaseMarkTree, CharUtils } from './basemark.utils';
import { rulesRegistry } from './basemark.consts';

export class BaseMark {
  public readonly sout = new Subject<BaseMarkEvent>();
  private lineBuffer = '';
  private tree = new BaseMarkTree();

  constructor(oin?: Observable<string>, initialText?: string) {
    if (initialText) {
      this.processChunk(initialText);
      if (this.lineBuffer) this.processLine(this.getLineBuffer());
    }
    if (oin) {
      oin.subscribe({
        next: (chunk) => this.processChunk(chunk),
        error: (err) => console.error(err),
        complete: () => this.onComplete(),
      });
    }
  }

  public getTree(): BaseMarkTree {
    return this.tree;
  }

  private processChunk(chunk: string): void {
    for (const c of chunk) {
      console.log('!!!BM (processChunk):', c);
      if (CharUtils.isLineEnding(c)) {
        this.processLine(this.getLineBuffer());
      } else {
        this.lineBuffer += c;
      }
    }
  }

  private processLine(line: string): void {
    console.log('!!!BM (processLine):', line);
    let lineRest = line;
    let isFirstTry = true;
    while (lineRest.length > 0 || isFirstTry) {
      const info = this.tree.getLastOpenNode(line);
      const lastOpenNode = info.lastOpenNode;
      let rest = info.rest;
      if (BaseMarkTree.isTextNode(lastOpenNode)) {
        this.updateNode(lastOpenNode, lineRest);
        return;
      } else if (BaseMarkTree.isContainerNode(lastOpenNode)) {
        for (const rule of Object.values(rulesRegistry)) {
          if (!rule.openCondition) continue;
          const matchLength = rule.openCondition(rest, lastOpenNode);
          if (matchLength < 0) continue;
          this.createNode(lastOpenNode, rule, rest);
          rest = rest.slice(matchLength);
          break;
        }
      }
      lineRest = rest;
      isFirstTry = false;
    }
  }

  private createNode(
    parentNode: ContainerNode,
    rule: BlockRule<BlockNode>,
    line: string,
  ): void {
    const node = rule.createNodeFrom
      ? rule.createNodeFrom(line)
      : rule.createNode();
    parentNode.children.push(node);
    this.sout.next({
      type: 'create',
      node,
    });
  }

  private updateNode(node: TextNode, line: string): void {
    node.value += line;
    this.sout.next({
      type: 'update',
      value: node.value,
    });
  }

  private getLineBuffer(): string {
    const line = this.lineBuffer;
    this.lineBuffer = '';
    return line;
  }

  private onComplete(): void {
    if (this.lineBuffer) this.processLine(this.getLineBuffer());
    this.sout.complete();
  }
}
