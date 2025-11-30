import {
  computed,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as bm from 'basemark';
import { STREAM_PROVIDER, StreamFunction } from '../tokens/stream.token';

type NDJSONMessage = {
  type:
    | 'start'
    | 'reasoning-start'
    | 'reasoning-delta'
    | 'reasoning-end'
    | 'text-start'
    | 'text-delta'
    | 'text-end'
    | 'finish'
    | 'error';
  delta?: string;
};

export type UIEvent = 'startReasoning' | 'collapseReasoning';

export type UserMessage = {
  id: number;
  type: 'user';
  text: string;
  timestamp: Date;
  rootNode: bm.RootNode;
};
export type ModelMessage = {
  id: number;
  type: 'model';
  text: string;
  reasoningText?: string;
  timestamp: Date;
  rootNode: bm.RootNode;
};
export type ErrorMessage = {
  id: number;
  type: 'error';
  text: string;
  timestamp: Date;
};
export type Message = UserMessage | ModelMessage | ErrorMessage;
type MessagePatch = Partial<Message>;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  readonly messages = signal<WritableSignal<Message>[]>([]);
  readonly lastMessage = computed(() => {
    const messages = this.messages();
    return messages[messages.length - 1];
  });
  readonly eventStream = signal<Observable<UIEvent> | null>(null);
  private lastMessageId = 0;
  private streamProvider: StreamFunction = inject(STREAM_PROVIDER);

  public async submitUserMessage(text: string): Promise<void> {
    if (this.eventStream()) return;
    this.pushMessage({
      id: this.lastMessageId++,
      type: 'user',
      text: text,
      timestamp: new Date(),
      rootNode: new bm.BaseMark(undefined, text).getTree().getRoot(),
    });
    await this.streamResponse(text);
  }

  private pushMessage(message: Message): void {
    this.messages.update((msgs) => [...msgs, signal(message)]);
  }

  private updateMessage(f: (m: Message) => MessagePatch): void {
    const streamingMessageSignal = this.lastMessage();
    if (!streamingMessageSignal) return;
    streamingMessageSignal.update((m: Message) => {
      if (m.type !== 'model') return m;
      return { ...m, ...f(m) };
    });
  }

  private async streamResponse(prompt: string): Promise<void> {
    const markdownInput$ = new Subject<string>();
    const uiEvents$ = new Subject<UIEvent>();

    const basemark = new bm.BaseMark(markdownInput$);
    // notify signal when ast changes
    const bmSub = basemark.sout.subscribe(() => {
      this.updateMessage(() => ({}));
    });

    try {
      const stream = await this.streamProvider(prompt);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const msg = JSON.parse(line) as NDJSONMessage;
          this.processEvent(msg, markdownInput$, uiEvents$, basemark);
        }
      }
    } catch (e) {
      this.handleError(e);
    } finally {
      this.finalizeStream();
      markdownInput$.complete();
      uiEvents$.complete();
      bmSub.unsubscribe();
    }
  }

  private processEvent(
    msg: NDJSONMessage,
    markdownInput$: Subject<string>,
    uiEvents$: Subject<UIEvent>,
    basemark: bm.BaseMark,
  ): void {
    if (msg.type === 'start') {
      this.pushMessage({
        id: this.lastMessageId++,
        type: 'model',
        text: '',
        timestamp: new Date(),
        rootNode: basemark.getTree().getRoot(),
      });
      this.eventStream.set(uiEvents$.asObservable());
      return;
    }

    const streamingMessageSignal = this.lastMessage();
    if (!streamingMessageSignal || streamingMessageSignal().type !== 'model') {
      return;
    }

    switch (msg.type) {
      case 'reasoning-start':
        uiEvents$.next('startReasoning');
        this.updateMessage(() => ({ reasoningText: '' }));
        break;
      case 'reasoning-delta':
        this.updateMessage((m) => ({
          reasoningText:
            ((m as ModelMessage).reasoningText ?? '') + (msg.delta ?? ''),
        }));
        break;
      case 'reasoning-end':
        uiEvents$.next('collapseReasoning');
        break;
      case 'text-delta':
        if (msg.delta) {
          this.updateMessage((m) => ({
            text: (m.text ?? '') + (msg.delta ?? ''),
          }));
          markdownInput$.next(msg.delta);
        }
        break;
      case 'error':
        throw new Error(msg.delta || 'Unknown server error');
    }
  }

  private finalizeStream(): void {
    this.eventStream.set(null);
  }

  private handleError(e: unknown): void {
    const errorText = e instanceof Error ? e.message : String(e);
    this.updateMessage(() => ({
      type: 'error',
      text: `Error occurred: ${errorText}`,
    }));
    this.eventStream.set(null);
  }
}
