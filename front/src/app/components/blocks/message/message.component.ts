import { Component, input, signal } from '@angular/core';
import { Message } from '../../../services/api.service';
import { MarkdownNodeComponent } from '../markdown-node/markdown-node.component';
import { NgClass } from '@angular/common';
import { BrainIcon, LucideAngularModule } from 'lucide-angular';
import {
  ChevronDownIcon,
  CopyIcon,
  RefreshCcwIcon,
} from 'lucide-angular/src/icons';

@Component({
  selector: 'app-message',
  imports: [MarkdownNodeComponent, NgClass, LucideAngularModule],
  template: `
    @let m = message();
    <div class="message" [ngClass]="m.type">
      @if ('reasoningText' in m) {
        <details [open]="!reasoningCollapsed()">
          <summary>
            <lucide-angular
              size="13"
              strokeWidth="1.3"
              [absoluteStrokeWidth]="true"
              [img]="brainIcon" />
            {{ reasoningText() }}
            <lucide-angular
              class="chevron"
              size="14"
              strokeWidth="1.3"
              [absoluteStrokeWidth]="true"
              [img]="chevronIcon" />
          </summary>
          <p>
            {{ m.reasoningText }}
          </p>
        </details>
      }
      @if ('rootNode' in m) {
        <app-markdown-node [node]="m.rootNode" />
      } @else {
        {{ m.text }}
      }
      <div class="actions">
        @if (message().type === 'error') {
          <button class="filled">
            <lucide-angular
              size="13"
              strokeWidth="1.3"
              [absoluteStrokeWidth]="true"
              [img]="reloadIcon" />
            @if (message().type === 'model') {
              Retry
            }
          </button>
        }
        <button class="filled">
          <lucide-angular
            size="13"
            strokeWidth="1.3"
            [absoluteStrokeWidth]="true"
            [img]="copyIcon" />
          @if (message().type === 'model') {
            Copy
          }
        </button>
      </div>
    </div>
  `,
  styleUrl: './message.component.css',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageComponent {
  readonly brainIcon = BrainIcon;
  readonly chevronIcon = ChevronDownIcon;
  readonly copyIcon = CopyIcon;
  readonly reloadIcon = RefreshCcwIcon;

  readonly message = input.required<Message>();
  readonly reasoningText = signal('');
  readonly reasoningCollapsed = signal<boolean>(false);

  public startReasoning(): void {
    this.reasoningText.set('Thinking...');
    this.reasoningCollapsed.set(false);
  }

  public collapseReasoning(): void {
    const delta =
      new Date().getSeconds() - this.message().timestamp.getSeconds();
    this.reasoningText.set(`Thought for ${delta} seconds`);
    this.reasoningCollapsed.set(true);
  }

  public toggleReasoning(): void {
    this.reasoningCollapsed.update((v) => !v);
  }
}
