import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductListingStateContract } from '../../services/contracts/product-listing-state.contract';
import { FiltersComponent } from '../../components/filters/filters';
import { SortOptionsComponent } from '../../components/sort-options/sort-options';
import { ProductGridComponent } from '../../components/product-grid/product-grid';
import { FilterParams } from '../../../../shared/types/storefront-types';

@Component({
  selector: 'app-collection-page',
  imports: [
    FiltersComponent,
    SortOptionsComponent,
    ProductGridComponent
  ],
  templateUrl: './collection-page.html',
  styleUrls: ['./collection-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productListingState = inject(ProductListingStateContract);

  readonly products = this.productListingState.products;
  readonly loading = this.productListingState.loading;
  readonly error = this.productListingState.error;
  readonly filters = this.productListingState.filters;
  readonly sortBy = this.productListingState.sortBy;
  readonly currentPage = this.productListingState.currentPage;
  readonly totalPages = this.productListingState.totalPages;

  constructor() {
    const storeId = this.route.snapshot.paramMap.get('storeId') || 'default';
    this.productListingState.loadProducts(storeId);
  }

  handleFiltersChange(filters: FilterParams): void {
    this.productListingState.applyFilters(filters);
  }

  handleSortChange(sortBy: string): void {
    this.productListingState.applySorting(sortBy);
  }

  handleProductClick(productId: string): void {
    const storeId = this.route.snapshot.paramMap.get('storeId') || 'default';
    this.router.navigate(['/store', storeId, 'product', productId]);
  }

  handlePageChange(page: number): void {
    this.productListingState.goToPage(page);
  }
}
