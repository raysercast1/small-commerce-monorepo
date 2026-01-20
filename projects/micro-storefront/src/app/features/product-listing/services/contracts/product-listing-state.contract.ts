import { Signal } from '@angular/core';
import { StorefrontProduct, FilterParams } from '../../../../shared/types/storefront-types';

export abstract class ProductListingStateContract {
  abstract readonly products: Signal<StorefrontProduct[]>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly error: Signal<string | null>;
  abstract readonly totalProducts: Signal<number>;
  abstract readonly currentPage: Signal<number>;
  abstract readonly totalPages: Signal<number>;
  abstract readonly filters: Signal<FilterParams>;
  abstract readonly sortBy: Signal<string>;

  abstract loadProducts(storeId: string, page?: number): void;
  abstract applyFilters(filters: FilterParams): void;
  abstract applySorting(sortBy: string): void;
  abstract goToPage(page: number): void;
}
