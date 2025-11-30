import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  signal,
} from '@angular/core';
import { Message } from '../../../services/api.service';
import { MarkdownNodeComponent } from '../markdown-node/markdown-node.component';
import { NgClass } from '@angular/common';
import { BrainIcon, LucideAngularModule } from 'lucide-angular';
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  RefreshCcwIcon,
} from 'lucide-angular/src/icons';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-message',
  imports: [
    MarkdownNodeComponent,
    NgClass,
    LucideAngularModule,
    CdkCopyToClipboard,
  ],
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
          <span>
            {{ m.reasoningText }}
          </span>
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
        <button
          class="filled"
          [cdkCopyToClipboard]="message().text"
          (cdkCopyToClipboardCopied)="isCopied.set(true)">
          <lucide-angular
            size="13"
            strokeWidth="1.3"
            [absoluteStrokeWidth]="true"
            [img]="isCopied() ? checkIcon : copyIcon" />
          @if (message().type === 'model') {
            {{ isCopied() ? 'Copied' : 'Copy' }}
          }
        </button>
      </div>
    </div>
  `,
  styleUrl: './message.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageComponent {
  readonly brainIcon = BrainIcon;
  readonly chevronIcon = ChevronDownIcon;
  readonly checkIcon = CheckIcon;
  readonly copyIcon = CopyIcon;
  readonly reloadIcon = RefreshCcwIcon;

  readonly isCopied = signal(false);
  readonly message = input.required<Message>();
  readonly reasoningText = signal('');
  readonly reasoningCollapsed = signal<boolean>(false);

  private timeoutId = 0;

  constructor() {
    effect(() => {
      const isCopied = this.isCopied();
      if (isCopied) {
        this.timeoutId = setTimeout(() => this.isCopied.set(false), 1000);
      } else {
        clearTimeout(this.timeoutId);
      }
    });
  }

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
}
