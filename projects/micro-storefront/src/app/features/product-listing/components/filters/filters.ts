import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterParams } from '../../../../shared/types/storefront-types';

@Component({
  selector: 'app-filters',
  imports: [FormsModule],
  templateUrl: './filters.html',
  styleUrls: ['./filters.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersComponent {
  currentFilters = input.required<FilterParams>();
  filtersChanged = output<FilterParams>();

  minPrice = signal<number | undefined>(undefined);
  maxPrice = signal<number | undefined>(undefined);
  selectedBrand = signal<string | undefined>(undefined);
  inStockOnly = signal<boolean>(false);

  applyFilters(): void {
    const filters: FilterParams = {
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      brand: this.selectedBrand(),
      inStock: this.inStockOnly()
    };
    this.filtersChanged.emit(filters);
  }

  clearFilters(): void {
    this.minPrice.set(undefined);
    this.maxPrice.set(undefined);
    this.selectedBrand.set(undefined);
    this.inStockOnly.set(false);
    this.filtersChanged.emit({});
  }
}
