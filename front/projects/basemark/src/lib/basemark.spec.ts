import { Observable } from 'rxjs';
import { BaseMark } from './basemark';
import { CreateElementEvent } from './basemark.types';

describe('BaseMark', () => {
  const tests: { inp: string; expected: any }[] = [
    {
      inp: `- Unordered list item
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

This shows basic text formatting, lists, links, images, code, tables, and more!`,
      expected: {
        root: {
          type: 'root',
          children: [],
        },
      },
    },
    {
      inp: `fdsfjdlsfjl jflkdsjf lfjdslkj
fjdslkjflkdsjflds

fdsfslkdjfldsfjlkdsfj

> # Heading
> - option 1
>  - option 1.2
> - option 2
`,
      expected: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              value: 'fdsfjdlsfjl jflkdsjf lfjdslkjfjdslkjflkdsjflds',
            },
            { type: 'paragraph', value: 'fdsfslkdjfldsfjlkdsfj' },
            { type: 'paragraph', value: '' },
            {
              type: 'blockquote',
              children: [
                { type: 'heading', level: 1, value: 'Heading' },
                {
                  type: 'list',
                  level: 0,
                  children: [
                    { type: 'listItem', value: 'option 1' },
                    { type: 'listItem', value: 'option 1' },
                    {
                      type: 'list',
                      level: 1,
                      children: [
                        { type: 'listItem', value: 'option 1.2' },
                        { type: 'listItem', value: 'option 1.2' },
                      ],
                    },
                    { type: 'listItem', value: 'option 2' },
                  ],
                },
              ],
            },
            { type: 'paragraph', value: '' },
          ],
        },
      },
    },
    {
      inp: '```python\nprint("Hello")\n```\nBye',
      expected: {
        type: 'root',
        children: [
          {
            type: 'codeBlock',
            language: 'python',
            children: [{ type: 'paragraph', value: 'print("Hello")' }],
          },
          {
            type: 'paragraph',
            value: 'Bye',
          },
        ],
      },
    },
    //     {
    //       inp: `- point 0
    // - point 1
    //  - point 1.1
    //  - point 1.2
    //   - point 1.2.1
    //   - point 1.2.2
    //  - point 1.3
    // - point 2
    //  - point 2.1
    //  - point 2.2
    // - point 3`,
    //       expected: {
    //         type: 'root',
    //         children: [
    //           {
    //             type: 'list',
    //             level: 0,
    //             children: [
    //               {
    //                 type: 'listItem',
    //                 children: [{ type: 'paragraph', value: 'point 0' }],
    //               },
    //               {
    //                 type: 'listItem',
    //                 children: [{ type: 'paragraph', value: 'point 1' }],
    //               },
    //               {
    //                 type: 'list',
    //                 level: 1,
    //                 children: [
    //                   {
    //                     type: 'listItem',
    //                     children: [{ type: 'paragraph', value: 'point 1.1' }],
    //                   },
    //                   {
    //                     type: 'listItem',
    //                     children: [{ type: 'paragraph', value: 'point 1.2' }],
    //                   },
    //                   {
    //                     type: 'list',
    //                     level: 2,
    //                     children: [
    //                       {
    //                         type: 'listItem',
    //                         children: [{ type: 'paragraph', value: 'point 1.2.1' }],
    //                       },
    //                       {
    //                         type: 'listItem',
    //                         children: [{ type: 'paragraph', value: 'point 1.2.2' }],
    //                       },
    //                     ],
    //                   },
    //                   {
    //                     type: 'listItem',
    //                     children: [{ type: 'paragraph', value: 'point 1.3' }],
    //                   },
    //                 ],
    //               },
    //               {
    //                 type: 'listItem',
    //                 children: [{ type: 'paragraph', value: 'point 2' }],
    //               },
    //               {
    //                 type: 'list',
    //                 level: 1,
    //                 children: [
    //                   {
    //                     type: 'listItem',
    //                     children: [{ type: 'paragraph', value: 'point 2.1' }],
    //                   },
    //                   {
    //                     type: 'listItem',
    //                     children: [{ type: 'paragraph', value: 'point 2.2' }],
    //                   },
    //                 ],
    //               },
    //               {
    //                 type: 'listItem',
    //                 children: [{ type: 'paragraph', value: 'point 3' }],
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //     },
  ];
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    it(`should transform the observable stream into the expected AST structure, #${i + 1}`, (done) => {
      const sourceStream = new Observable<string>((sub) => {
        setTimeout(() => {
          const slicedtin = t.inp.split('\n');
          for (const sltin of slicedtin) {
            sub.next(sltin + '\n');
          }
          sub.complete();
        }, 10);
      });
      const basemark = new BaseMark(sourceStream);
      basemark.sout.asObservable().subscribe({
        next: (result) => {
          expect(result.type === 'create');
          expect((result as CreateElementEvent).node).toEqual(t.expected);
          done();
        },
        error: (err) => {
          fail(err);
        },
      });
    });
  }
});
