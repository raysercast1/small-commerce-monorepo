import {ProductEmbedded} from './shared-embedded';
import {Image} from './image';
import {Price} from './price';
import {Inventory} from './inventory';

export interface Variant {
  id: string;
  sku: string;
  productId: string;
  variantName: string;
  attributes: string;
  weight: number;
  dimensions: string;
  barcode: string;
  variantMetadata: string;
  tags: string;
  imageUrl: string;
  videoUrl: string;
  product: ProductEmbedded;
  images: Image[];
  inventory: Inventory[];
  prices: Price[];
}
