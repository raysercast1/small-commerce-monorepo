import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {ApiResponse, MakeRequestService, PartnerAndStoreParameters} from 'shared-core';
import {VariantServiceContract} from '../contracts/variant-service.contract';
import {Variant, VariantPayload} from '../../../shared/types/shared-types';
import {
  AdditionalVariantParameters,
  MainVariantParameters,
  VariantDTO,
  VariantUpdateDTO
} from '../../../features/variants/types/variant-types';
import {isObjectNotEmpty} from '../../../shared/helpers/helpers';

@Injectable({
  providedIn: 'root'
})
export class VariantServiceImpl extends VariantServiceContract {
  private makeRequest = inject(MakeRequestService);
  private apiUrl = `${environment.baseUrl}${environment.domain}`;

  createProductVariant(createVariantInput: PartnerAndStoreParameters, payload: VariantDTO): Observable<ApiResponse<Variant>> {
    const modifiedPayload = this.stringifyRequiredObject(payload);
    const url = `${this.apiUrl}product-variant?partnerId=${createVariantInput.partnerId}&storeId=${createVariantInput.storeId}`;
    return this.makeRequest.post(url, modifiedPayload);
  }

  updateProductVariant(updateVariantInput: MainVariantParameters, payload: VariantUpdateDTO): Observable<ApiResponse<Variant>> {
    const modifiedPayload = this.stringifyRequiredObject(payload);
    const url = `${this.apiUrl}product-variant/${updateVariantInput.variantId}?partnerId=${updateVariantInput.partnerId}`;
    return this.makeRequest.patch(url, modifiedPayload);
  }

  deleteProductVariant(deleteVariantInput: AdditionalVariantParameters): Observable<ApiResponse<boolean>> {
    const url = `${this.apiUrl}product-variant/${deleteVariantInput.variantId}?partnerId=${deleteVariantInput.partnerId}&productId=${deleteVariantInput.productId}`;
    return this.makeRequest.delete(url);
  }

  addVariantsToInventories(partnerId: string, inventory: any): Observable<ApiResponse<Variant[]>> {
    const url = `${this.apiUrl}inventories/add-variants-to-inventories?partnerId=${partnerId}`;
    return this.makeRequest.post(url, inventory);
  }

  createPriceVariant(partnerId: string, price: any): Observable<any> {
    const url = `${this.apiUrl}prices/variants?partnerId=${partnerId}`;
    return this.makeRequest.post(url, price);
  }

  private stringifyRequiredObject(payloadBase: VariantDTO | VariantUpdateDTO): VariantPayload {
    const modifiedPayload = {...payloadBase} as VariantPayload;
    try {
      modifiedPayload.attributes = JSON.stringify(payloadBase.attributes);
      modifiedPayload.variantMetadata = (payloadBase.variantMetadata !== undefined && isObjectNotEmpty(payloadBase.variantMetadata)) ? JSON.stringify(payloadBase.variantMetadata) : '{}';
      modifiedPayload.tags = (payloadBase.tags !== undefined && isObjectNotEmpty(payloadBase.tags)) ? JSON.stringify(payloadBase.tags) : '{}';
    } catch (error) {
      console.error('Error while stringify-ing Variant:', error);
      throw error;
    }

    return modifiedPayload;
  }
}
