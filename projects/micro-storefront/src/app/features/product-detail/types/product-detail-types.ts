import { StorefrontProduct } from '../../../shared/types/storefront-types';

export interface IProductDetailState {
  product: StorefrontProduct | null;
  selectedVariantId: string | null;
  loading: boolean;
  error: string | null;
}
