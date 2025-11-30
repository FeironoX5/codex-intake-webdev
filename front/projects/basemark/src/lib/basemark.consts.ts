import { ListNode, RulesRegistry } from './basemark.types';
import { CharUtils } from './basemark.utils';

// todo inline text decorations parsing
export const rulesRegistry: RulesRegistry = {
  root: {
    createNode: () => ({
      type: 'root' as const,
      children: [],
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
      children: [],
    }),
  },
  listItem: {
    openCondition: (line, parent) => {
      if (parent.type !== 'list') return -1;
      const expectedIndent = (parent as ListNode).level;
      if (line.slice(expectedIndent).startsWith('- ')) return line.length;
      // return expectedIndent + 2;
      return -1;
    },
    continueCondition: () => -1,
    createNode: () => ({
      type: 'listItem' as const,
      value: '',
    }),
    createNodeFrom: (line) => ({
      ...rulesRegistry.listItem.createNode(),
      value: line.slice(CharUtils.countSpaces(line) + 2),
    }),
  },
  // todo double indent instead of single indent
  list: {
    openCondition: (line, parent) => {
      const indent = CharUtils.countSpaces(line);
      const expectedIndent =
        parent.type === 'list' ? (parent as ListNode).level + 1 : 0;
      if (indent === expectedIndent) {
        return line.slice(indent).startsWith('- ') ? line.length : -1;
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
      children: [rulesRegistry.listItem.createNodeFrom!(line)],
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
    openCondition: (line) => line.length,
    continueCondition: (line) => {
      for (const [ruleKey, rule] of Object.entries(rulesRegistry)) {
        if (ruleKey === 'paragraph') continue;
        if (!rule.openCondition) continue;
        const matchLength = rule.openCondition(line, {
          type: 'root',
          children: [],
          // todo openCondition > openCondition?
        });
        if (matchLength >= 0) return -1;
      }
      return line.trim().length === 0 ? -1 : line.length;
    },
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
