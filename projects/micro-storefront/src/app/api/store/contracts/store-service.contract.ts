import { Observable } from 'rxjs';
import { StoreConfig } from '../../../shared/types/storefront-types';
import {ApiResponse} from 'shared-core';


export abstract class StoreServiceContract {
  abstract getStoreConfig(storeId: string): Observable<ApiResponse<StoreConfig>>;

  abstract getStoreByDomain(domain: string): Observable<ApiResponse<StoreConfig>>;
}
