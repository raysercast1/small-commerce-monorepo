import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CartItem } from '../../../../shared/types/storefront-types';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-create-cart-item',
  imports: [CurrencyPipe],
  templateUrl: './create-cart-item.html',
  styleUrls: ['./create-cart-item.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateCartItem {
  item = input.required<CartItem>();

  quantityChanged = output<{ itemId: string; quantity: number }>();
  removeClicked = output<string>();

  onQuantityChange(quantity: number): void {
    if (quantity > 0) {
      this.quantityChanged.emit({ itemId: this.item().id, quantity });
    }
  }

  onRemove(): void {
    this.removeClicked.emit(this.item().id);
  }

  get totalPrice(): number {
    return this.item().unitPrice * this.item().quantity;
  }
}
