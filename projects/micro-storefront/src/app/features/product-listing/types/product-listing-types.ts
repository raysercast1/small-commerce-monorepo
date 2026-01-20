import { StorefrontProduct, FilterParams } from '../../../shared/types/storefront-types';

export interface IProductListingState {
  products: StorefrontProduct[];
  loading: boolean;
  error: string | null;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  filters: FilterParams;
  sortBy: string;
}

export interface SortOption {
  value: string;
  label: string;
}
