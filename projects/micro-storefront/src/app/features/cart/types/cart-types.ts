import { Cart } from '../../../shared/types/storefront-types';

export interface ICartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}
