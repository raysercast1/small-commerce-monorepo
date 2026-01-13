import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, MakeRequestService } from '../../../shared/services/make-request.service';
import {
  ListResponsePrice,
  Price,
  PricePCreationRequestBody,
  PricePUpdateRequestBody,
  PriceType,
  PriceVCreationRequestBody,
  PriceVUpdateRequestBody,
} from '../../../features/prices/shared/types/price-types';
import { PricePServiceContract } from '../contracts/price-p-service.contract';
import {PriceVServiceContract} from '../contracts/price-v-service.contract';
import {isObjectNotEmpty} from '../../../shared/helpers/helpers';
import {Metadata} from '../../../shared/types/shared-types';

@Injectable({ providedIn: 'root' })
export class PriceServiceImpl implements PricePServiceContract, PriceVServiceContract {
  private readonly makeRequest = inject(MakeRequestService);
  private readonly apiUrl = `${environment.baseUrl}${environment.domain}`;

  private badParams<T>(message = 'Bad parameters request'): Observable<T> {
    const error = { code: 'BAD_PARAMETERS', message } as any;
    return throwError(() => error);
  }

  private stringifyMetadata(metadata?: Metadata): string {
    if (!metadata) { return '{}' }

    let newMetadata = {...metadata};
    try {
      (newMetadata as unknown as string) = isObjectNotEmpty(metadata) ? JSON.stringify(metadata) : '{}';
      return newMetadata as unknown as string;
    } catch (error) {
      console.error('Error while stringify-ing Price:', error);
      throw error;
    }
  }

  createPriceForProduct(partnerId: string, body: PricePCreationRequestBody): Observable<ApiResponse<Price>> {
    if (!partnerId || !body || !body.priceDTO || !body.identifiers) {
      return this.badParams();
    }
    const url = `${this.apiUrl}prices?partnerId=${partnerId}`;
    const newPayload = {...body};
    (newPayload.priceDTO.metadata as unknown as string) = this.stringifyMetadata(body.priceDTO.metadata);

    return this.makeRequest.post<ApiResponse<Price>>(url, newPayload);
  }

  createPriceForVariant(partnerId: string, body: PriceVCreationRequestBody): Observable<ApiResponse<Price>> {
    if (!partnerId || !body || !body.priceVCreateR || !body.identifiers) {
      return this.badParams();
    }
    const url = `${this.apiUrl}prices/variants?partnerId=${partnerId}`;
    const newPayload = {...body};
    (newPayload.priceVCreateR.metadata as unknown as string) = this.stringifyMetadata(body.priceVCreateR.metadata);

    return this.makeRequest.post<ApiResponse<Price>>(url, newPayload);
  }

  updatePriceForProduct(partnerId: string, body: PricePUpdateRequestBody): Observable<ApiResponse<Price>> {
    if (!partnerId || !body || !body.pricePUpdateDTO || !body.identifiersPricePUR) {
      return this.badParams();
    }
    const url = `${this.apiUrl}prices/update-price-product?partnerId=${partnerId}`;
    const newPayload = {...body};
    (newPayload.pricePUpdateDTO.metadata as unknown as string) = this.stringifyMetadata(body.pricePUpdateDTO.metadata);

    return this.makeRequest.patch<ApiResponse<Price>>(url, newPayload);
  }

  updatePriceForVariant(partnerId: string, body: PriceVUpdateRequestBody): Observable<ApiResponse<Price>> {
    if (!partnerId || !body || !body.priceVUpdateR || !body.identifiersPVUR) {
      return this.badParams();
    }
    const url = `${this.apiUrl}prices/update-price-variant?partnerId=${partnerId}`;
    const newPayload = {...body};
    (newPayload.priceVUpdateR.metadata as unknown as string) = this.stringifyMetadata(body.priceVUpdateR.metadata);

    return this.makeRequest.patch<ApiResponse<Price>>(url, newPayload);
  }

  getPriceForProduct(id: string, partnerId: string, type: PriceType): Observable<ApiResponse<Price>> {
    if (!id || !partnerId || !type) { return this.badParams(); }
    const url = `${this.apiUrl}prices/${id}?partnerId=${partnerId}&type=${type}`;
    return this.makeRequest.get<ApiResponse<Price>>(url);
  }

  getPriceForVariant(partnerId: string, variantId: string, productId: string, type: PriceType): Observable<ApiResponse<Price>> {
    if (!partnerId || !variantId || !productId || !type) { return this.badParams(); }
    const url = `${this.apiUrl}prices/variant?partnerId=${partnerId}&variantId=${variantId}&productId=${productId}&type=${type}`;
    return this.makeRequest.get<ApiResponse<Price>>(url);
  }

  getPricesForVariant(variantId: string, productId: string, partnerId: string, type: PriceType): Observable<ApiResponse<ListResponsePrice>> {
    if (!variantId || !productId || !partnerId || !type) { return this.badParams(); }
    const url = `${this.apiUrl}prices/all-prices-variant?variantId=${variantId}&productId=${productId}&partnerId=${partnerId}&type=${type}`;
    return this.makeRequest.get<ApiResponse<ListResponsePrice>>(url);
  }

  getPricesForProduct(productId: string, partnerId: string, type: PriceType): Observable<ApiResponse<ListResponsePrice>> {
    if (!productId || !partnerId || !type) { return this.badParams(); }
    const url = `${this.apiUrl}prices/all-prices-product?productId=${productId}&partnerId=${partnerId}&type=${type}`;
    return this.makeRequest.get<ApiResponse<ListResponsePrice>>(url);
  }

  deletePriceForVariant(variantId: string, productId: string, partnerId: string, type: PriceType): Observable<ApiResponse<boolean>> {
    if (!variantId || !productId || !partnerId || !type) { return this.badParams(); }
    const url = `${this.apiUrl}prices/price-variant?variantId=${variantId}&productId=${productId}&partnerId=${partnerId}&type=${type}`;
    return this.makeRequest.delete<ApiResponse<boolean>>(url);
  }

  deletePriceForProduct(productId: string, partnerId: string, type: PriceType): Observable<ApiResponse<boolean>> {
    if (!productId || !partnerId || !type) { return this.badParams(); }
    const url = `${this.apiUrl}prices/price-product?productId=${productId}&partnerId=${partnerId}&type=${type}`;
    return this.makeRequest.delete<ApiResponse<boolean>>(url);
  }
}
