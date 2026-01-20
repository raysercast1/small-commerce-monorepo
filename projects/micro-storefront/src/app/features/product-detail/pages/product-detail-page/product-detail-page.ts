import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductDetailStateContract } from '../../services/contracts/product-detail-state.contract';
import { ProductImagesComponent } from '../../components/product-images/product-images';
import { ProductInfoComponent } from '../../components/product-info/product-info';
import { ProductSpecificationsComponent } from '../../components/product-specifications/product-specifications';

@Component({
  selector: 'app-product-detail-page',
  imports: [
    ProductImagesComponent,
    ProductInfoComponent,
    ProductSpecificationsComponent
  ],
  templateUrl: './product-detail-page.html',
  styleUrls: ['./product-detail-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productDetailState = inject(ProductDetailStateContract);

  readonly product = this.productDetailState.product;
  readonly selectedVariantId = this.productDetailState.selectedVariantId;
  readonly loading = this.productDetailState.loading;
  readonly error = this.productDetailState.error;

  constructor() {
    const productId = this.route.snapshot.paramMap.get('productId');
    const storeId = this.route.snapshot.paramMap.get('storeId') || 'default';

    if (productId) {
      this.productDetailState.loadProduct(storeId, productId);
    }
  }

  handleVariantSelection(variantId: string): void {
    this.productDetailState.selectVariant(variantId);
  }

  handleAddToCart(): void {
    // This will be implemented when cart state is created
    console.log('Add to cart clicked');
  }

  handleBuyWithChat(): void {
    // This will be implemented with WhatsApp integration
    console.log('Buy with chat clicked');
  }
}
