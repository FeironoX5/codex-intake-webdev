import { Observable } from 'rxjs';
import { BaseMark } from './basemark';
import { CreateElementEvent } from './basemark.types';

describe('BaseMark', () => {
  const tests = [
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
    {
      inp: `- point 0
- point 1
 - point 1.1
 - point 1.2
  - point 1.2.1
  - point 1.2.2
 - point 1.3
- point 2
 - point 2.1
 - point 2.2
- point 3`,
      expected: {
        type: 'root',
        children: [
          {
            type: 'list',
            level: 0,
            children: [
              {
                type: 'listItem',
                children: [{ type: 'paragraph', value: 'point 0' }],
              },
              {
                type: 'listItem',
                children: [{ type: 'paragraph', value: 'point 1' }],
              },
              {
                type: 'list',
                level: 1,
                children: [
                  {
                    type: 'listItem',
                    children: [{ type: 'paragraph', value: 'point 1.1' }],
                  },
                  {
                    type: 'listItem',
                    children: [{ type: 'paragraph', value: 'point 1.2' }],
                  },
                  {
                    type: 'list',
                    level: 2,
                    children: [
                      {
                        type: 'listItem',
                        children: [{ type: 'paragraph', value: 'point 1.2.1' }],
                      },
                      {
                        type: 'listItem',
                        children: [{ type: 'paragraph', value: 'point 1.2.2' }],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    children: [{ type: 'paragraph', value: 'point 1.3' }],
                  },
                ],
              },
              {
                type: 'listItem',
                children: [{ type: 'paragraph', value: 'point 2' }],
              },
              {
                type: 'list',
                level: 1,
                children: [
                  {
                    type: 'listItem',
                    children: [{ type: 'paragraph', value: 'point 2.1' }],
                  },
                  {
                    type: 'listItem',
                    children: [{ type: 'paragraph', value: 'point 2.2' }],
                  },
                ],
              },
              {
                type: 'listItem',
                children: [{ type: 'paragraph', value: 'point 3' }],
              },
            ],
          },
        ],
      },
    },
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
