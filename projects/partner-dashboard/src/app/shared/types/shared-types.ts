import {Currency, PriceType} from '../../features/prices/shared/types/price-types';

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

export interface StoreEmbedded {
  id: string;
  name: string;
  domain: string;
}

export interface VariantEmbedded {
  id: string;
  sku: string;
  productId?: string;
  variantName: string;
}

interface CategoryEmbedded {
  id: string;
  name: string;
}

export interface PriceEmbedded {
  id: string;
  type: PriceType;
  price: number;
  currency: Currency;
}

export interface ImageEmbedded {
  id: string;
  name: string;
  isMain: boolean;
  url: string;
  thumbnailUrl: string;
}

export interface Variant {
  id: string;
  productId: string;
  variantName?: string; // backend sometimes returns `name`; keep both optional
  name?: string;
  attributes?: Attribute | Attribute[];
  sku?: string;
  weight?: number;
  dimensions?: string;
  barcode?: string;
  imageUrl?: string;
  videoUrl?: string;
  variantMetadata?: Metadata;
  tags?: Tag;
  product: ProductEmbedded;
  images: ImageEmbedded[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  brand?: string;
  metadata?: string;
  sku?: string;
  title?: string;
  store: StoreEmbedded;
  images: ImageEmbedded[];
  categories: CategoryEmbedded[] | null;
  prices?: PriceEmbedded[] | null;
  variants: VariantEmbedded[] | null;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  domain: string;
  currency: string;
  locale: string;
  settings: string;
  metadata?: string;
  title?: string;
}

export type Metadata = Record<string, unknown>;
export type Tag = Record<string, unknown>;
export type Attribute = {
  attributeKey: string;
  attributeValue: unknown;
};

export type VariantPayload = {
  id?: string;
  productId: string;
  sku: string;
  variantName: string;
  enabled?: boolean;
  name?: string;
  attributes?: string | Attribute | Attribute[];
  weight?: number;
  dimensions?: string;
  barcode?: string;
  imageUrl?: string;
  videoUrl?: string;
  variantMetadata?: string | Metadata;
  tags?: string | Tag;
}

export type PaginationParameters = {
  page?: number;
  size?: number;
  sortBy?: string;
}

export type PartnerAndStoreParameters = {
  partnerId: string;
  storeId: string;
}
