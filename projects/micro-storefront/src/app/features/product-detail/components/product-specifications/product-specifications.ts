import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { StorefrontProduct } from '../../../../shared/types/storefront-types';

@Component({
  selector: 'app-product-specifications',
  imports: [],
  templateUrl: './product-specifications.html',
  styleUrls: ['./product-specifications.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSpecificationsComponent {
  product = input.required<StorefrontProduct>();

  get specifications(): Array<{ key: string; value: unknown }> {
    const metadata = this.product().metadata;
    if (!metadata) return [];

    return Object.entries(metadata).map(([key, value]) => ({
      key: this.formatKey(key),
      value
    }));
  }

  private formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
