import {VariantEmbedded} from './shared-embedded';

export interface Inventory {
  id: string;
  sku: string;
  quantity: number;
  metadata: string;
  productVariant: VariantEmbedded;
  updatedBy: string;
}
