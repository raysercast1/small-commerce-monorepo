import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-add-to-cart-button',
  imports: [],
  templateUrl: './add-to-cart-button.html',
  styleUrls: ['./add-to-cart-button.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddToCartButtonComponent {
  productId = input.required<string>();
  disabled = input<boolean>(false);
  size = input<'small' | 'medium' | 'large'>('medium');
  fullWidth = input<boolean>(false);
  variant = input<'primary' | 'secondary'>('primary');

  clicked = output<string>();

  isAdding = signal(false);

  async onClick(): Promise<void> {
    if (!this.disabled() && !this.isAdding()) {
      this.isAdding.set(true);
      this.clicked.emit(this.productId());

      // Simulate adding animation
      setTimeout(() => {
        this.isAdding.set(false);
      }, 1000);
    }
  }

  get buttonClasses(): string {
    const classes = [
      'add-to-cart-btn',
      `size-${this.size()}`,
      `variant-${this.variant()}`
    ];
    if (this.fullWidth()) {
      classes.push('full-width');
    }
    if (this.isAdding()) {
      classes.push('adding');
    }
    return classes.join(' ');
  }
}
