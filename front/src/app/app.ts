import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { FeedComponent } from './components/blocks/feed/feed.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [FormsModule, FeedComponent],
})
export class App {
  protected readonly api = inject(ApiService);
  protected readonly chatValue = signal(
    'Hello! Show me a little amount of markdown possibilities',
  );

  constructor() {
    // this.dataService.getMessageStream().subscribe({
    //   next: (m) => {
    //     switch (m.type) {
    //       case 'start':
    //         this.chatValue.set('');
    //         this.messageFeed().createResponse();
    //         break;
    // case 'reasoning-start':
    //   this.messageFeed.startReasoning();
    //   break;
    // case 'reasoning-delta':
    //   this.messageFeed.addReasoningDelta(m.delta);
    //   break;
    // case 'reasoning-end':
    //   this.messageFeed.collapseReasoning();
    //   break;
    // case 'text-delta':
    //   this.messageFeed.addDelta(m.delta);
    //   break;
    // case 'finish':
    //   this.messageFeed.finishResponse();
    //   break;
    // default:
    //   break;
    // }
    // },
    // error: (e) => {
    //   console.error(e);
    //   this.messageFeed.finishResponse();
    // },
    // });
  }

  // submit(): void {
  //   this.messageFeed().createResponse();
  //   setTimeout(() => this.messageFeed().startReasoning(), 1000);
  //   setTimeout(() => this.messageFeed().addReasoningDelta('hello'), 1500);
  //   setTimeout(() => this.messageFeed().addReasoningDelta('boy'), 2000);
  //   setTimeout(() => this.messageFeed().endReasoning(), 2500);
  //   setTimeout(() => this.messageFeed().addDelta('hi'), 3000);
  //   setTimeout(() => this.messageFeed().addDelta('my'), 3500);
  //   setTimeout(() => this.messageFeed().addDelta('guy'), 4000);
  //   setTimeout(() => this.messageFeed().finishResponse(), 4500);
  // }
}
