import { Observable, Subject } from 'rxjs';
import { BaseMarkEvent, TextNode } from './basemark.types';
import { BaseMarkTree, CharUtils } from './basemark.utils';
import { rulesRegistry } from './basemark.consts';

export class BaseMark {
  public readonly sout = new Subject<BaseMarkEvent>();
  private lineBuffer = '';
  private tree = new BaseMarkTree();

  constructor(oin: Observable<string>) {
    oin.subscribe({
      next: (chunk) => this.processChunk(chunk),
      error: (err) => console.error(err),
      complete: () => this.onComplete(),
    });
  }

  private processChunk(chunk: string): void {
    for (const c of chunk) {
      if (CharUtils.isLineEnding(c)) {
        this.processLine(this.getLineBuffer());
      } else {
        this.lineBuffer += c;
      }
    }
  }

  private processLine(line: string): void {
    console.log('(>)', line);
    const info = this.tree.getLastOpenContainerNode(line);
    const lastOpenContainerNode = info[0];
    let lineRest = info[1];
    // console.log('(<)', lastOpenContainerNode, '|||||', lineRest);
    for (const rule of Object.values(rulesRegistry)) {
      if (!rule.openCondition) continue;
      const matchLength = rule.openCondition(lineRest, lastOpenContainerNode);
      if (matchLength >= 0) {
        lastOpenContainerNode.children.push(
          rule.createNodeFrom
            ? rule.createNodeFrom(lineRest)
            : rule.createNode(),
        );
        lineRest = lineRest.slice(matchLength);
        // console.log('(!)', rule.createNode().type, lastOpenContainerNode);
        break;
      }
    }
    const lastOpenNode = this.tree.getLastOpenNode() as TextNode;
    lastOpenNode.value += lineRest;
    console.log('(E)', JSON.stringify(this.tree));
  }

  private getLineBuffer(): string {
    const line = this.lineBuffer;
    this.lineBuffer = '';
    return line;
  }

  private onComplete(): void {
    if (this.lineBuffer) {
      this.processLine(this.getLineBuffer());
    }
    this.sout.next({
      type: 'create',
      node: this.tree.getRoot(),
    });
    this.sout.complete();
  }
}
