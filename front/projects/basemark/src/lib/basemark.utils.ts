import {
  BlockNode,
  ContainerNode,
  RootNode,
  RulesRegistry,
} from './basemark.types';
import { rulesRegistry } from './basemark.consts';

export class CharUtils {
  private static Zs = [
    0x0020,
    0x00a0,
    0x1680,
    ...Array.from({ length: 11 }, (_, i) => 0x2000 + i),
    0x202f,
    0x205f,
    0x3000,
  ];

  public static is(char: string, unicodeSpec: number): boolean {
    return char.codePointAt(0) === unicodeSpec;
  }

  public static isLineEnding(c: string): boolean {
    return this.is(c, 0x000a) || this.is(c, 0x000d);
  }

  public static isSpace(char: string): boolean {
    return this.is(char, 0x0020);
  }

  public static isTab(char: string): boolean {
    return this.is(char, 0x0009);
  }

  public static isBlankLine(line: string): boolean {
    for (const c of line) {
      if (!this.isSpace(c) && !this.isTab(c)) return false;
    }
    return true;
  }

  public static countSpaces(line: string): number {
    let count = 0;
    for (const c of line) {
      if (!this.isSpace(c) && !this.isTab(c)) return count;
      count++;
    }
    return count;
  }

  public static isWhitespace(char: string): boolean {
    return char in this.Zs;
  }

  public static isWhitespaceLine(line: string): boolean {
    for (const c of line) {
      if (!this.isWhitespace(c)) return false;
    }
    return true;
  }
}

export class BaseMarkTree {
  private readonly root: RootNode = rulesRegistry.root.createNode();

  public getLastOpenContainerNode(line: string): {
    lastOpenContainerNode: ContainerNode;
    lineRest: string;
  } {
    let lineBuffer = line;
    let currentNode: ContainerNode = this.root;
    while (true) {
      if (currentNode.children.length === 0) break;
      const lastChild = this.getLastNode(currentNode);
      if (!this.isContainerNode(lastChild)) break;
      const rule = rulesRegistry[lastChild.type as keyof RulesRegistry];
      if (!rule) break;
      if (!rule.continueCondition) {
        currentNode = lastChild;
        continue;
      }
      const sliceLength = rule.continueCondition(
        lineBuffer,
        currentNode,
        lastChild,
      );
      if (sliceLength < 0) break;
      lineBuffer = lineBuffer.slice(sliceLength);
      currentNode = lastChild;
    }
    return {
      lastOpenContainerNode: currentNode,
      lineRest: lineBuffer,
    };
  }

  public getLastOpenNode(): BlockNode {
    let currentNode: BlockNode = this.root;
    while (
      this.isContainerNode(currentNode) &&
      currentNode.children.length > 0
    ) {
      currentNode = this.getLastNode(currentNode);
    }
    return currentNode;
  }

  public getRoot(): RootNode {
    return this.root;
  }

  private getLastNode(node: ContainerNode): BlockNode {
    return node.children[node.children.length - 1];
  }

  private isContainerNode(node: BlockNode): node is ContainerNode {
    return 'children' in node;
  }
}
