import {
  ListResponsePrice,
  Price, PriceType,
  PriceVCreationRequestBody,
  PriceVUpdateRequestBody
} from '../../../features/prices/shared/types/price-types';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/services/make-request.service';

export abstract class PriceVServiceContract {
  abstract createPriceForVariant(partnerId: string, body: PriceVCreationRequestBody): Observable<ApiResponse<Price>>;
  abstract updatePriceForVariant(partnerId: string, body: PriceVUpdateRequestBody): Observable<ApiResponse<Price>>;
  abstract getPriceForVariant(partnerId: string, variantId: string, productId: string, type: PriceType): Observable<ApiResponse<Price>>;
  abstract getPricesForVariant(variantId: string, productId: string, partnerId: string, type: PriceType): Observable<ApiResponse<ListResponsePrice>>;
  abstract deletePriceForVariant(variantId: string, productId: string, partnerId: string, type: PriceType): Observable<ApiResponse<boolean>>;
}
