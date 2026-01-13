import { Component, Input, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button [type]="type">{{ text }}</button>
  `,
  styles: [
    `
      button {
        /* Your button styles here */
      }
    `,
  ],
  standalone: true,
})
export class ButtonComponent {
  @Input({ required: true }) set text(value: string) {
    this.textSignal.set(value);
  }
  @Input() set type(value: 'button' | 'submit' | 'reset') {
    this.typeSignal.set(value);
  }

  textSignal: WritableSignal<string> = signal('');
  typeSignal: WritableSignal<'button' | 'submit' | 'reset'> = signal('button');
}