import { Component, input } from '@angular/core';
import * as bm from 'basemark';

@Component({
  selector: 'app-markdown-node',
  imports: [],
  template: `
    @let n = node();
    @switch (n.type) {
      @case ('root') {
        <div class="md-root md-container">
          @for (child of asContainer(n).children; track child) {
            <app-markdown-node [node]="child" />
          }
        </div>
      }
      @case ('blockquote') {
        <blockquote class="md-blockquote md-container">
          @for (child of asContainer(n).children; track child) {
            <app-markdown-node [node]="child" />
          }
        </blockquote>
      }
      @case ('list') {
        <ul class="md-list">
          @for (child of asContainer(n).children; track child) {
            <app-markdown-node [node]="child" />
          }
        </ul>
      }
      @case ('listItem') {
        <li class="md-list-item" [innerHTML]="asText(n).value"></li>
      }
      @case ('orderedList') {
        <ol class="md-ordered-list">
          @for (child of asContainer(n).children; track child) {
            <app-markdown-node [node]="child" />
          }
        </ol>
      }
      @case ('orderedListItem') {
        <li class="md-ordered-list-item" [innerHTML]="asText(n).value"></li>
      }
      @case ('taskList') {
        <ul class="md-task-list">
          @for (child of asContainer(n).children; track child) {
            <app-markdown-node [node]="child" />
          }
        </ul>
      }
      @case ('taskListItem') {
        <li class="md-task-list-item">
          <input
            disabled
            type="checkbox"
            [checked]="asTaskListItem(n).checked" />
          <span [innerHTML]="asText(n).value"></span>
        </li>
      }
      @case ('table') {
        <div class="md-table-container">
          <table class="md-table">
            <tbody>
              @for (child of asContainer(n).children; track child) {
                <app-markdown-node [node]="child" />
              }
            </tbody>
          </table>
        </div>
      }
      @case ('tableRow') {
        <tr class="md-table-row">
          @for (child of asContainer(n).children; track child) {
            <app-markdown-node [node]="child" />
          }
        </tr>
      }
      @case ('tableCell') {
        <td class="md-table-cell" [innerHTML]="asText(n).value"></td>
      }
      @case ('horizontalRule') {
        <hr class="md-divider" />
      }
      @case ('codeBlock') {
        <pre class="md-code-block"><code>{{ asText(n).value }}</code></pre>
      }
      @case ('paragraph') {
        @if (asText(n).value; as value) {
          <p class="md-paragraph" [innerHTML]="value"></p>
        }
      }
      @case ('heading') {
        @if (asHeading(n).level === 1) {
          <h1 [innerHTML]="asText(n).value"></h1>
        } @else if (asHeading(n).level === 2) {
          <h2 [innerHTML]="asText(n).value"></h2>
        } @else if (asHeading(n).level === 3) {
          <h3 [innerHTML]="asText(n).value"></h3>
        } @else {
          <h4 [innerHTML]="asText(n).value"></h4>
        }
      }
    }
  `,
  styleUrl: './markdown-node.component.css',
})
export class MarkdownNodeComponent {
  readonly node = input.required<bm.BlockNode>();

  asContainer(node: bm.BlockNode): bm.ContainerNode {
    return node as bm.ContainerNode;
  }

  asText(node: bm.BlockNode): bm.TextNode {
    return node as bm.TextNode;
  }

  asHeading(node: bm.BlockNode): bm.HeadingNode {
    return node as bm.HeadingNode;
  }

  asTaskListItem(node: bm.BlockNode): { checked: boolean } {
    return node as any;
  }
}
