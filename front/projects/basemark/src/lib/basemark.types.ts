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
interface BlockRule<T extends ContainerNode> {
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
  [K in ContainerNodes['type']]: BlockRule<
    Extract<ContainerNodes, { type: K }>
  >;
};
// -----
interface ParagraphNode extends TextNode {
  type: 'paragraph';
}
interface HeadingNode extends TextNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
}
type TextNodes = ParagraphNode | HeadingNode;
// -----
export type ASTNode = ContainerNodes | TextNodes;
// -----
export interface CreateElementEvent {
  type: 'create';
  node: BlockNode;
}
export interface UpdateContentEvent {
  type: 'update';
  id: number;
}
export type BaseMarkEvent = CreateElementEvent | UpdateContentEvent;
