import {Observable} from 'rxjs';
import {PartnerAndStoreParameters, Store, ApiResponse} from 'shared-core';
import {StoreDTO} from '../../../features/stores/types/store-types';

export abstract class StoreServiceContract {
  abstract createStore(partnerId: string, store: any): Observable<ApiResponse<Store>>
  abstract getStores(partnerId: string): Observable<ApiResponse<Store[]>>;
  abstract addProductsToStore(addProductsToStoreInput: PartnerAndStoreParameters, productIds: string[]): Observable<ApiResponse<Store>>;
  abstract addInventoriesToStore(addInventoriesToStoreInput: PartnerAndStoreParameters, inventoryIds: string[]): Observable<ApiResponse<Store>>;
  abstract updateStore(updateStoreInput: PartnerAndStoreParameters, store: StoreDTO): Observable<ApiResponse<Store>>;
  abstract deleteStore(deleteStoreInput: PartnerAndStoreParameters): Observable<ApiResponse<boolean>>;
}
