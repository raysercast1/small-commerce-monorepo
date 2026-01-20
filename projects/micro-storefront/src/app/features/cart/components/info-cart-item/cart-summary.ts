import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Cart } from '../../../../shared/types/storefront-types';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-info-cart-summary',
  imports: [CurrencyPipe],
  templateUrl: './cart-summary.html',
  styleUrls: ['./cart-summary.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartSummaryComponent {
  cart = input.required<Cart>();

  proceedToCheckout = output<void>();

  onProceedToCheckout(): void {
    this.proceedToCheckout.emit();
  }
}
