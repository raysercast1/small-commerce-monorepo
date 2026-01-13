import {Observable} from 'rxjs';
import {ApiResponse, PagedResponse} from '../../../shared/services/make-request.service';
import {PaginationParameters, PartnerAndStoreParameters, Product} from '../../../shared/types/shared-types';
import {
  AdditionalProductParameters,
  MainProductParameters,
  ProductAndVariantInput
} from '../../../features/products/types/product-types';

export abstract class ProductServiceContract {
  abstract createProduct(createProductInput: PartnerAndStoreParameters, product: Partial<Product>): Observable<ApiResponse<Product>>;
  abstract getProductsByPartner(partnerId: string, paginationInput: PaginationParameters): Observable<ApiResponse<PagedResponse<Product>>>;
  abstract getProductsByStore(getProductsByStoreInput: PartnerAndStoreParameters, paginationInput: PaginationParameters): Observable<ApiResponse<PagedResponse<Product>>>;
  abstract updateProduct(updateProductInput: AdditionalProductParameters, product: Partial<Product>): Observable<ApiResponse<Product>>;
  abstract deleteProduct(deleteProductInput: AdditionalProductParameters): Observable<ApiResponse<boolean>>;
  abstract assignProductToDefaultCategory(assignProductToCategoryInput: MainProductParameters): Observable<any>;
  abstract addVariantsToProducts(payload: ProductAndVariantInput, partnerId: string): Observable<ApiResponse<Product[]>>;
}
