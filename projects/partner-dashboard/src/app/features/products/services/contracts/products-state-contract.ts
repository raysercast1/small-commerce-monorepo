import {Signal} from '@angular/core';
import {Product} from '../../../../shared/types/shared-types';

export abstract class ProductStateContract {
  abstract readonly products: Signal<Product[]>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly error: Signal<string | null>;

  abstract load(partnerId: string): void;
  abstract getProductById(productId: string | null): Product | undefined;
  abstract remove(productId: string): void;
}
