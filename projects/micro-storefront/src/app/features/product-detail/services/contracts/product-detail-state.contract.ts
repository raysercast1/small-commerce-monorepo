import { Signal } from '@angular/core';
import { StorefrontProduct } from '../../../../shared/types/storefront-types';

export abstract class ProductDetailStateContract {
  abstract readonly product: Signal<StorefrontProduct | null>;
  abstract readonly selectedVariantId: Signal<string | null>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly error: Signal<string | null>;

  abstract loadProduct(storeId: string, productId: string): void;
  abstract selectVariant(variantId: string): void;
}
