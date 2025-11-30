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
export interface TableNode extends ContainerNode {
  type: 'table';
}
export interface TableRowNode extends ContainerNode {
  type: 'tableRow';
}
export interface ListNode extends ContainerNode {
  type: 'list';
  level: number;
}
export interface OrderedListNode extends ContainerNode {
  type: 'orderedList';
  level: number;
}
export interface TaskListNode extends ContainerNode {
  type: 'taskList';
  level: number;
}
export type ContainerNodes =
  | RootNode
  | BlockquoteNode
  | TableNode
  | TableRowNode
  | ListNode
  | OrderedListNode
  | TaskListNode;
// -----
export interface BlockRule<T extends BlockNode> {
  // returns -1 if condition not satisfied
  openCondition?: (line: string, parent: ContainerNode) => number;
  continueCondition?: (
    line: string,
    parent: ContainerNode,
    self: BlockNode,
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
export interface ListItemNode extends TextNode {
  type: 'listItem';
}
export interface OrderedListItemNode extends TextNode {
  type: 'orderedListItem';
}
export interface TaskListItemNode extends TextNode {
  type: 'taskListItem';
}
export interface TableCellNode extends TextNode {
  type: 'tableCell';
}
type TextNodes =
  | ParagraphNode
  | HeadingNode
  | CodeBlockNode
  | ListItemNode
  | OrderedListItemNode
  | TaskListItemNode
  | TableCellNode;
// -----
export interface HorizontalRuleNode extends BlockNode {
  type: 'horizontalRule';
}
export type OtherNodes = HorizontalRuleNode;
// -----
export type ASTNodes = ContainerNodes | TextNodes | OtherNodes;
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
