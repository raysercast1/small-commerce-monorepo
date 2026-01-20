import { Order } from '../../../shared/types/storefront-types';

export interface ICheckoutState {
  order: Order | null;
  loading: boolean;
  error: string | null;
  validationErrors: string[];
}
