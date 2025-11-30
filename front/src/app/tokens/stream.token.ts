import { InjectionToken } from '@angular/core';

export type StreamFunction = (
  prompt: string,
) => Promise<ReadableStream<Uint8Array>>;

export const STREAM_PROVIDER = new InjectionToken<StreamFunction>(
  'STREAM_PROVIDER',
);

export const realStreamProvider: StreamFunction = async (prompt: string) => {
  const response = await fetch('http://localhost:3000/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!response.body) throw new Error('No response body');
  return response.body;
};

export const MOCK_REASONING = `Okay, the user wants to see a small amount of Markdown possibilities. Let me think about what to include. They probably want a quick overview, not an exhaustive list. I should cover the basics but also show a few different features. First, headers are essential. Maybe show levels 1 to 3. Then some text formatting: bold, italic, maybe both. Lists are important too—both ordered and unordered. A link and an image would be good. Code snippets, inline and block. Tables are useful but a bit more complex. Blockquotes and horizontal rules can add structure. Oh, and checkboxes for task lists. Let me make sure each example is clear and concise. I'll organize them with headings and examples. Keep it simple so it's easy to follow. Alright, let's put that together.`;
export const MOCK_MESSAGE = `- Unordered list item
- Another item
 - Sub-item
 - Sub-item

Here's a quick overview of some Markdown formatting options:

# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~

- Unordered list item
- Another item
  - Sub-item
  - Sub-item

1. Ordered list
2. Second item
3. Third item

[Link text](https://www.example.com)

![Alt text](https://tinyurl.com/placeholder-image "Image title")

\`Inline code\`

\`\`\`python
# Code block
def hello():
    print("Hello World!")
\`\`\`

| Table | Syntax |
|-------|--------|
| Row 1 | Data 1 |
| Row 2 | Data 2 |

> Blockquote text

Horizontal rule:

---

- [x] Completed task
- [ ] Incomplete task

*Emoji*: :smile: :rocket: :+1:

This shows basic text formatting, lists, links, images, code, tables, and more!`;

export const fakeStreamProvider: StreamFunction = async () => {
  const encoder = new TextEncoder();

  const createChunk = (type: string, delta?: string): string =>
    JSON.stringify({ type, delta }) + '\n';

  return new ReadableStream({
    async start(controller): Promise<void> {
      const enqueue = (str: string): void =>
        controller.enqueue(encoder.encode(str));
      const delay = (ms: number): Promise<unknown> =>
        new Promise((r) => setTimeout(r, ms));
      enqueue(createChunk('start'));
      await delay(100);
      enqueue(createChunk('reasoning-start'));
      const rChunks = MOCK_REASONING.match(/.{1,20}/g) || []; // Split into chunks of 20 chars
      for (const chunk of rChunks) {
        enqueue(createChunk('reasoning-delta', chunk));
        await delay(50);
      }
      enqueue(createChunk('reasoning-end'));
      await delay(200);
      enqueue(createChunk('text-start'));
      const tChunks = MOCK_MESSAGE.match(/.{1,15}/gs) || [];
      for (const chunk of tChunks) {
        enqueue(createChunk('text-delta', chunk));
        await delay(80);
      }
      enqueue(createChunk('text-end'));
      enqueue(createChunk('finish'));
      controller.close();
    },
  });
};
