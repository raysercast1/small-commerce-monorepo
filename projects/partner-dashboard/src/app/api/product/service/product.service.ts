import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {ApiResponse, MakeRequestService, PagedResponse} from '../../../shared/services/make-request.service';
import {ProductServiceContract} from '../contracts/product-service.contract';
import {PaginationParameters, PartnerAndStoreParameters, Product} from '../../../shared/types/shared-types';
import {
  AdditionalProductParameters,
  MainProductParameters,
  ProductAndVariantInput
} from '../../../features/products/types/product-types';

@Injectable({
  providedIn: 'root'
})
export class ProductServiceImpl extends ProductServiceContract {

  private makeRequest = inject(MakeRequestService);
  private apiUrl = `${environment.baseUrl}${environment.domain}`;

  createProduct(createProductInput:  PartnerAndStoreParameters, product: Partial<Product>): Observable<ApiResponse<Product>> {
    const url = `${this.apiUrl}products?partnerId=${createProductInput.partnerId}&storeId=${createProductInput.storeId}`;
    return this.makeRequest.post<ApiResponse<Product>>(url, product);
}

  getProductsByPartner(partnerId: string, {page = 0, size = 50, sortBy = 'name'}: PaginationParameters):
    Observable<ApiResponse<PagedResponse<Product>>> {
    const url = `${this.apiUrl}products/product-by-partner?partnerId=${partnerId}&page=${page}&size=${size}&sortBy=${sortBy}`;
    return this.makeRequest.get<ApiResponse<PagedResponse<Product>>>(url);
  }

  getProductsByStore(getProductsByStoreInput: PartnerAndStoreParameters, {page = 0, size = 50, sortBy = 'name'}: PaginationParameters):
    Observable<ApiResponse<PagedResponse<Product>>> {
    const url = `${this.apiUrl}products/product-by-store?partnerId=${getProductsByStoreInput.partnerId}&storeId=${getProductsByStoreInput.storeId}&page=${page}&size=${size}&sortBy=${sortBy}`;
    return this.makeRequest.get<ApiResponse<PagedResponse<Product>>>(url);
  }

  updateProduct(updateProductInput: AdditionalProductParameters, product: Partial<Product>): Observable<ApiResponse<Product>> {
    const url = `${this.apiUrl}products/${updateProductInput.productId}?partnerId=${updateProductInput.partnerId}&storeId=${updateProductInput.storeId}`;
    return this.makeRequest.patch<ApiResponse<Product>>(url, product);
  }

  deleteProduct(deleteProductInput: AdditionalProductParameters): Observable<ApiResponse<boolean>> {
    const url = `${this.apiUrl}products/${deleteProductInput.productId}?partnerId=${deleteProductInput.partnerId}&storeId=${deleteProductInput.storeId}`;
    return this.makeRequest.delete<ApiResponse<boolean>>(url);
  }

  createPriceForProduct(partnerId: string, price: any): Observable<any> {
    const url = `${this.apiUrl}prices?partnerId=${partnerId}`;
    return this.makeRequest.post(url, price);
  }

  assignProductToDefaultCategory(assignProductToCategoryInput: MainProductParameters): Observable<any> { //TODO: Move this method to Category Module. For now will be in the ProductServiceContract
    console.log(`Placeholder for assigning product ${assignProductToCategoryInput.productId} to a universal category for partner ${assignProductToCategoryInput.partnerId}.`);
    return of({ success: true });
  }

  addVariantsToProducts(payload: ProductAndVariantInput, partnerId: string): Observable<ApiResponse<Product[]>> {
    const url = `${this.apiUrl}products/add-product-to-variants?partnerId=${partnerId}`;
    return this.makeRequest.patch<ApiResponse<Product[]>>(url, payload);
  }
}
