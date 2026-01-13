import {Metadata, Product, VariantEmbedded} from '../../../shared/types/shared-types';

export interface InventoryState {
  inventories: Inventory[];
  loading: boolean;
  error: string | null;
}

export interface Inventory {
  id: string;
  sku: string;
  quantity: number;
  metadata: Metadata;
  productVariant: VariantEmbedded;
  updatedBy: string;
}

export interface InventoryDTO {
  sku: string;
  quantity: number;
  metadata?: Metadata;
}

export interface InventoryUpdateDTO extends InventoryDTO {
  reservedQuantity: number;
}

export type AddVariantsToInvRequestBody = {
  parentProductIds: {
    partnerId: string;
    productId: string;
    storeId: string;
  };
  varAndInvIds: VariantAndInventoryIdentifiers[];
};

type VariantAndInventoryIdentifiers = {
  variantId: string;
  inventoryId: string;
}

// Dialog data shape
export interface CreateInventoryDialogData {
  partnerId: string | null;
  products: Product[];
}

export interface UpdateInventoryDialogData extends CreateInventoryDialogData {
  inventory?: Inventory;
  inventories?: Inventory[];
}

export interface DeleteInventoryDialogData extends UpdateInventoryDialogData {
}

export interface InfoInventoryDialogData {
  inventory: Inventory;
}

export type InventoryPayload = {
  inventoryId: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  metadata?: Metadata | string;
}
