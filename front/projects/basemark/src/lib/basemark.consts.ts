import { ListNode, RulesRegistry } from './basemark.types';
import { CharUtils } from './basemark.utils';

export const rulesRegistry: RulesRegistry = {
  root: {
    createNode: () => ({
      type: 'root' as const,
      children: [{ type: 'paragraph', value: '' }],
    }),
  },
  blockquote: {
    openCondition: (line) => {
      if (line.startsWith('> ')) return 2;
      return -1;
    },
    continueCondition: (line) => {
      if (line.startsWith('> ')) return 2;
      if (line.startsWith('>')) return 1;
      return -1;
    },
    createNode: () => ({
      type: 'blockquote' as const,
      children: [
        {
          type: 'paragraph',
          value: '',
        },
      ],
    }),
  },
  listItem: {
    openCondition: (line, parent) => {
      if (parent.type !== 'list') return -1;
      const expectedIndent = (parent as ListNode).level;
      if (line.slice(expectedIndent).startsWith('- '))
        return expectedIndent + 2;
      return -1;
    },
    continueCondition: () => -1,
    createNode: () => ({
      type: 'listItem' as const,
      children: [
        {
          type: 'paragraph',
          value: '',
        },
      ],
    }),
  },
  list: {
    openCondition: (line, parent) => {
      const indent = CharUtils.countSpaces(line);
      const expectedIndent =
        parent.type === 'list' ? (parent as ListNode).level + 1 : 0;
      if (indent === expectedIndent) {
        line = line.slice(indent);
        return line.startsWith('- ') ? indent + 2 : -1;
      }
      return -1;
    },
    continueCondition: (line, _, self) => {
      const indent = CharUtils.countSpaces(line);
      const expectedIndent = (self as ListNode).level;
      if (indent >= expectedIndent) {
        return 0;
      }
      return -1;
    },
    createNode: () => ({
      type: 'list' as const,
      level: 0,
      children: [rulesRegistry.listItem.createNode()],
    }),
    createNodeFrom: (line) => ({
      ...rulesRegistry.list.createNode(),
      level: CharUtils.countSpaces(line),
    }),
  },
  codeBlock: {
    openCondition: (line) => (/^```\w+/.test(line) ? line.length : -1),
    continueCondition: (line) => (line.startsWith('```') ? -1 : 0),
    createNode: () => ({
      type: 'codeBlock' as const,
      value: '',
    }),
    createNodeFrom: (line) => ({
      ...rulesRegistry.codeBlock.createNode(),
      language: line.slice(3),
    }),
  },
  heading: {
    openCondition: (line) => (/^#{1,6} .*/.test(line) ? line.length : -1),
    continueCondition: () => -1,
    createNode: () => ({
      type: 'heading' as const,
      level: 1,
      value: '',
    }),
    createNodeFrom: (line) => {
      const i = line.lastIndexOf('#') + 1;
      const level = [1, 2, 3, 4, 5, 6].includes(i)
        ? (i as 1 | 2 | 3 | 4 | 5 | 6)
        : 1;
      return {
        ...rulesRegistry.heading.createNode(),
        level: level,
        value: line.slice(level + 1),
      };
    },
  },
  paragraph: {
    openCondition: () => 0,
    continueCondition: (line) => (line.trim().length === 0 ? -1 : 0),
    createNode: () => ({
      type: 'paragraph' as const,
      value: '',
    }),
    createNodeFrom: (line) => ({
      ...rulesRegistry.paragraph.createNode(),
      value: line,
    }),
  },
};
