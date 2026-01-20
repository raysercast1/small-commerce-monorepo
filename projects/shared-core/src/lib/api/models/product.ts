import {StoreEmbedded, VariantEmbedded} from './shared-embedded';
import {Image} from './image';
import {Category} from './category';
import {Price} from './price';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  rating: number;
  brand: string;
  imageUrl: string;
  inventory: number;
  metadata: string;
  Store: StoreEmbedded;
  images: Image[];
  categories: Category[];
  prices: Price[];
  variants: VariantEmbedded[];
}
