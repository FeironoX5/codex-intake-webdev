import { Component, effect, inject, viewChildren } from '@angular/core';
import { ApiService, UIEvent } from '../../../services/api.service';
import { MessageComponent } from '../message/message.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-feed-component',
  imports: [MessageComponent, LucideAngularModule],
  template: `
    @for (m of api.messages(); track m().id) {
      <app-message [message]="m()" />
    }
  `,
  styleUrl: './feed.component.css',
})
export class FeedComponent {
  protected readonly api = inject(ApiService);
  protected readonly messageComponents = viewChildren(MessageComponent);

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
  }

  private processMessage(e: UIEvent, streamedMessage: MessageComponent): void {
    if (e === 'startReasoning') {
      streamedMessage.startReasoning();
    }
    if (e === 'collapseReasoning') {
      streamedMessage.collapseReasoning();
    }
  }
}
