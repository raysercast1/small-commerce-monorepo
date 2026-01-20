import {Currency, PriceType} from '../types/main-enums';

export interface ImageEmbedded {
  id: string;
  name: string;
  isMain: boolean;
  url: string;
  thumbnailUrl: string;
}

export interface PriceEmbedded {
  id: string;
  type: PriceType;
  price: number;
  currency: Currency;
}

interface CategoryEmbedded {
  id: string;
  name: string;
}

export interface VariantEmbedded {
  id: string;
  sku: string;
  productId?: string;
  variantName: string;
}

export interface StoreEmbedded {
  id: string;
  name: string;
  domain: string;
}

export interface ProductEmbedded {
  id: string;
  name: string;
  sku: string;
  inventory: number;
  metadata: string;
  images: ImageEmbedded[];
  prices: PriceEmbedded[];
  store: StoreEmbedded;
}
