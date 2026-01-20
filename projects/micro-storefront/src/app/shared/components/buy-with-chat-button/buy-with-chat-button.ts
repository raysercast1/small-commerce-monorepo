import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-buy-with-chat-button',
  imports: [],
  templateUrl: './buy-with-chat-button.html',
  styleUrls: ['./buy-with-chat-button.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyWithChatButtonComponent {
  productId = input.required<string>();
  productName = input.required<string>();
  disabled = input<boolean>(false);
  size = input<'small' | 'medium' | 'large'>('medium');
  fullWidth = input<boolean>(false);

  clicked = output<{ productId: string; productName: string }>();

  onClick(): void {
    if (!this.disabled()) {
      this.clicked.emit({
        productId: this.productId(),
        productName: this.productName()
      });
    }
  }

  get buttonClasses(): string {
    const classes = ['buy-with-chat-btn', `size-${this.size()}`];
    if (this.fullWidth()) {
      classes.push('full-width');
    }
    return classes.join(' ');
  }
}
