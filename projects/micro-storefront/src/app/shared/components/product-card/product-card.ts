import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { StorefrontProduct } from '../../types/storefront-types';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  product = input.required<StorefrontProduct>();
  showActions = input<boolean>(true);

  productClicked = output<string>();
  addToCart = output<string>();
  buyWithChat = output<string>();

  onCardClick(): void {
    this.productClicked.emit(this.product().id);
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(this.product().id);
  }

  onBuyWithChat(event: Event): void {
    event.stopPropagation();
    this.buyWithChat.emit(this.product().id);
  }

  get mainImage() {
    const images = this.product().images;
    return images.find(img => img.isMain) || images[0];
  }

  get currentPrice() {
    const prices = this.product().prices;
    return prices?.[0]?.amount || 0;
  }

  get currency() {
    const prices = this.product().prices;
    return prices?.[0]?.currency || 'USD';
  }

  get hasDiscount() {
    const prices = this.product().prices;
    return prices?.[0]?.compareAtPrice !== undefined;
  }

  get compareAtPrice() {
    const prices = this.product().prices;
    return prices?.[0]?.compareAtPrice;
  }
}
