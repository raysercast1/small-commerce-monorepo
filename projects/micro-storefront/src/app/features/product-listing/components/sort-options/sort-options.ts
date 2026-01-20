import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SortOption } from '../../types/product-listing-types';

@Component({
  selector: 'app-sort-options',
  imports: [FormsModule],
  templateUrl: './sort-options.html',
  styleUrls: ['./sort-options.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortOptionsComponent {
  currentSort = input.required<string>();
  sortChanged = output<string>();

  sortOptions: SortOption[] = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'newest', label: 'Newest First' }
  ];

  onSortChange(sortValue: string): void {
    this.sortChanged.emit(sortValue);
  }
}
