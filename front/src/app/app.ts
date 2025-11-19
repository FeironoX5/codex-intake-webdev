import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [FormsModule],
})
export class App {
  readonly chatValue = signal('');
  protected readonly console = console;
}
