import {Product} from '../../../shared/types/shared-types';

export interface IProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export type ProductAndVariantInput = {
  productIds: string[];
  variantIds: string[];
  storeId: string;
}

export interface MainProductParameters {
  partnerId: string;
  productId: string;
}

export interface AdditionalProductParameters extends MainProductParameters {
  storeId: string;
}
