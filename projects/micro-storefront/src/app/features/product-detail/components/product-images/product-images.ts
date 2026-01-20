import { Component, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { ProductImage } from '../../../../shared/types/storefront-types';

@Component({
  selector: 'app-product-images',
  imports: [],
  templateUrl: './product-images.html',
  styleUrls: ['./product-images.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductImagesComponent {
  images = input.required<ProductImage[]>();
  selectedImageIndex = signal(0);

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  get selectedImage(): ProductImage | undefined {
    return this.images()[this.selectedImageIndex()];
  }
}
