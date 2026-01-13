import {Attribute, Metadata, Tag, Variant} from '../../../shared/types/shared-types';

export interface IVariantsState {
  variants: Variant[];
  loading: boolean;
  error: string | null;
}

export interface VariantDTO {
  productId: string;
  sku: string;
  variantName: string;
  attributes: Attribute | Attribute[];
  weight?: number;
  dimensions?: string;
  barcode?: string;
  variantMetadata?: Metadata;
  tags?: Tag;
  imageUrl?: string;
  videoUrl?: string;
}

export interface VariantUpdateDTO extends VariantDTO {
  enabled: boolean;
}

export interface MainVariantParameters  {
  partnerId: string;
  variantId: string;
}

export interface AdditionalVariantParameters extends MainVariantParameters {
  productId: string;
}

export interface CreateVariantDialogData {
  partnerId: string | null;
  productId: string;
  storeId?: string;
}

export interface EditVariantDialogData {
  partnerId: string | null;
  productId: string;
  variant?: Variant;
  variants?: Variant[];
}

export interface RemoveVariantDialogData extends EditVariantDialogData {}
