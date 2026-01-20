import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {ApiResponse, MakeRequestService, PartnerAndStoreParameters, Store} from 'shared-core';
import {StoreServiceContract} from '../contracts/store-service.contract';
import {StoreDTO} from '../../../features/stores/types/store-types';

@Injectable({
  providedIn: 'root'
})
export class StoreServiceImpl extends StoreServiceContract {

  private makeRequest = inject(MakeRequestService);
  private apiUrl = `${environment.baseUrl}${environment.domain}store`;

  createStore(partnerId: string, store: any): Observable<ApiResponse<Store>> {
    const url = `${this.apiUrl}?partnerId=${partnerId}`;
    return this.makeRequest.post<ApiResponse<Store>>(url, store);
  }

  getStores(partnerId: string): Observable<ApiResponse<Store[]>> {
    const url = `${this.apiUrl}/many-stores?partnerId=${partnerId}`;
    return this.makeRequest.get<ApiResponse<Store[]>>(url);
  }

  addProductsToStore(addProductsToStoreInput: PartnerAndStoreParameters, productIds: string[]): Observable<ApiResponse<Store>> {
    const url = `${this.apiUrl}/add-products-to-store?partnerId=${addProductsToStoreInput.partnerId}&storeId=${addProductsToStoreInput.storeId}`;
    return this.makeRequest.patch<ApiResponse<Store>>(url, productIds);
  }

  addInventoriesToStore(addInventoriesToStoreInput: PartnerAndStoreParameters, inventoryIds: string[]): Observable<ApiResponse<Store>> {
    const url = `${this.apiUrl}/add-inventories-to-store?partnerId=${addInventoriesToStoreInput.partnerId}&storeId=${addInventoriesToStoreInput.storeId}`;
    return this.makeRequest.patch<ApiResponse<Store>>(url, inventoryIds);
  }

  updateStore(updateStoreInput: PartnerAndStoreParameters, store: StoreDTO): Observable<ApiResponse<Store>> {
    const url = `${this.apiUrl}/${updateStoreInput.storeId}?partnerId=${updateStoreInput.partnerId}`;
    return this.makeRequest.patch<ApiResponse<Store>>(url, store);
  }

  deleteStore(deleteStoreInput: PartnerAndStoreParameters): Observable<ApiResponse<boolean>> {
    const url = `${this.apiUrl}/${deleteStoreInput.storeId}?partnerId=${deleteStoreInput.partnerId}`;
    return this.makeRequest.delete<ApiResponse<boolean>>(url);
  }
}
