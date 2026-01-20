import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { StorefrontProduct } from '../../../../shared/types/storefront-types';

@Component({
  selector: 'app-product-grid',
  imports: [],
  templateUrl: './product-grid.html',
  styleUrls: ['./product-grid.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductGridComponent {
  products = input.required<StorefrontProduct[]>();
  productClicked = output<string>();

  onProductClick(productId: string): void {
    this.productClicked.emit(productId);
  }
}
