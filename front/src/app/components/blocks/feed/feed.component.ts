import {
  Component,
  effect,
  ElementRef,
  inject,
  output,
  viewChildren,
} from '@angular/core';
import { ApiService, UIEvent } from '../../../services/api.service';
import { MessageComponent } from '../message/message.component';
import { LucideAngularModule } from 'lucide-angular';
import { NgStyle } from '@angular/common';
import { PROMPT_PLACEHOLDERS, randomPick, randomRGB } from '../../../utils';

@Component({
  selector: 'app-feed-component',
  imports: [MessageComponent, LucideAngularModule, NgStyle],
  template: `
    @if (api.messages().length === 0) {
      <div class="filler-container">
        <h2>Welcome</h2>
        <span>Pick some ideas:</span>
        <div class="placeholder-buttons">
          @for (prompt of randomPick(PROMPT_PLACEHOLDERS, 5); track $index) {
            @let color = randomRGB();
            <button
              class="lighted"
              [ngStyle]="{ background: color }"
              (click)="output.emit(prompt.message)">
              {{ prompt.title }}
            </button>
          }
        </div>
      </div>
    }
    @for (m of api.messages(); track m().id) {
      <app-message [message]="m()" />
    }
  `,
  styleUrl: './feed.component.css',
})
export class FeedComponent {
  public readonly output = output<string>();
  protected readonly api = inject(ApiService);
  protected readonly messageComponents = viewChildren(MessageComponent);
  protected readonly randomRGB = randomRGB;
  protected readonly randomPick = randomPick;

  private processMessage(e: UIEvent, streamedMessage: MessageComponent): void {
    if (e === 'startReasoning') {
      streamedMessage.startReasoning();
    }
    if (e === 'collapseReasoning') {
      streamedMessage.collapseReasoning();
    }
  }
  protected readonly PROMPT_PLACEHOLDERS = PROMPT_PLACEHOLDERS;
  private readonly host = inject(ElementRef<HTMLElement>);

  constructor() {
    effect((onCleanup) => {
      const eventStream$ = this.api.eventStream();
      if (!eventStream$) return;
      const sub = eventStream$.subscribe((e) => {
        const components = this.messageComponents();
        const activeComponent = components[components.length - 1];
        if (activeComponent) {
          this.processMessage(e, activeComponent);
        }
      });
      onCleanup(() => {
        sub.unsubscribe();
      });
    });
    // effect(() => {
    //   const lastMessage = this.api.lastMessage();
    //   if (!this.host) return;
    //   queueMicrotask(() => {
    //     this.host.nativeElement.scrollTop =
    //       this.host.nativeElement.scrollHeight;
    //   });
    // });
  }
}
