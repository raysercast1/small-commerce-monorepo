import { Observable } from 'rxjs';
import { ApiResponse } from 'shared-core';
import {
  Price,
  PricePUpdateRequestBody,
  PricePCreationRequestBody,
  PriceType,
  ListResponsePrice,
} from '../../../features/prices/shared/types/price-types';

export abstract class PricePServiceContract {
  abstract createPriceForProduct(partnerId: string, body: PricePCreationRequestBody): Observable<ApiResponse<Price>>;
  abstract updatePriceForProduct(partnerId: string, body: PricePUpdateRequestBody): Observable<ApiResponse<Price>>;
  abstract getPriceForProduct(id: string, partnerId: string, type: PriceType): Observable<ApiResponse<Price>>;
  abstract getPricesForProduct(productId: string, partnerId: string, type: PriceType): Observable<ApiResponse<ListResponsePrice>>;
  abstract deletePriceForProduct(productId: string, partnerId: string, type: PriceType): Observable<ApiResponse<boolean>>;
}
