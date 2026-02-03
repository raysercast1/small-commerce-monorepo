import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { StorefrontProduct } from '../../../../shared/types/storefront-types';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-info',
  imports: [CurrencyPipe],
  templateUrl: './product-info.html',
  styleUrls: ['./product-info.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductInfoComponent {
  product = input.required<StorefrontProduct>();
  selectedVariantId = input<string | null>(null);

  variantSelected = output<string>();
  addToCart = output<void>();
  buyWithChat = output<void>();

  onVariantChange(variantId: string): void {
    this.variantSelected.emit(variantId);
  }

  onAddToCart(): void {
    this.addToCart.emit();
  }

  onBuyWithChat(): void {
    this.buyWithChat.emit();
  }

  get currentPrice() {
    const product = this.product();
    return product.prices?.[0]?.amount || 0;
  }

  get compareAtPrice() {
    const product = this.product();
    return product.prices?.[0]?.compareAtPrice;
  }
}
