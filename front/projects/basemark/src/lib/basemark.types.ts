export interface BlockNode {
  type: string;
}
// -----
export interface ContainerNode extends BlockNode {
  children: BlockNode[];
}
export interface TextNode extends BlockNode {
  value: string;
}
// -----
export interface RootNode extends ContainerNode {
  type: 'root';
}
export interface BlockquoteNode extends ContainerNode {
  type: 'blockquote';
}
export interface ListNode extends ContainerNode {
  type: 'list';
  level: number;
}
export interface ListItemNode extends ContainerNode {
  type: 'listItem';
}
export type ContainerNodes =
  | RootNode
  | BlockquoteNode
  | ListNode
  | ListItemNode;
// -----
export interface BlockRule<T extends BlockNode> {
  // returns -1 if condition not satisfied
  openCondition?: (line: string, parent: ContainerNode) => number;
  continueCondition?: (
    line: string,
    parent: ContainerNode,
    self: ContainerNode,
  ) => number;
  createNode: () => T;
  createNodeFrom?: (line: string) => T;
}
export type RulesRegistry = {
  [K in ASTNodes['type']]: BlockRule<Extract<ASTNodes, { type: K }>>;
};
// -----
export interface ParagraphNode extends TextNode {
  type: 'paragraph';
}
export interface HeadingNode extends TextNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
}
export interface CodeBlockNode extends TextNode {
  type: 'codeBlock';
  language?: string;
}
type TextNodes = ParagraphNode | HeadingNode | CodeBlockNode;
// -----
export type ASTNodes = ContainerNodes | TextNodes;
// -----
export interface CreateElementEvent {
  type: 'create';
  node: BlockNode;
}
export interface UpdateContentEvent {
  type: 'update';
  value: string;
}
export type BaseMarkEvent = CreateElementEvent | UpdateContentEvent;
