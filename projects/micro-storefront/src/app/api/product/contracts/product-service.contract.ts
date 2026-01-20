import { Observable } from 'rxjs';
import { FilterParams } from '../../../shared/types/storefront-types';
import {ApiResponse, PagedResponse, PaginationParams, Product} from 'shared-core';

export abstract class ProductServiceContract {
  abstract getProducts(
    storeId: string,
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Observable<ApiResponse<PagedResponse<Product>>>;

  abstract getProductById(
    storeId: string,
    productId: string
  ): Observable<ApiResponse<Product>>;

  abstract getProductBySlug(
    storeId: string,
    slug: string
  ): Observable<ApiResponse<Product>>;

  abstract searchProducts(
    storeId: string,
    query: string,
    pagination?: PaginationParams
  ): Observable<ApiResponse<PagedResponse<Product>>>;

  abstract getProductsByCategory(
    storeId: string,
    categoryId: string,
    pagination?: PaginationParams
  ): Observable<ApiResponse<PagedResponse<Product>>>;
}
