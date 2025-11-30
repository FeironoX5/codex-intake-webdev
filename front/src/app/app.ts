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
  protected readonly chatValue = signal('');
}
