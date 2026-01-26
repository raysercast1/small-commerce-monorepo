import {ApiResponse, PartnerAndStoreParameters} from 'shared-core';
import {Observable} from 'rxjs';
import {Variant} from '../../../shared/types/shared-types';
import {
  AdditionalVariantParameters,
  MainVariantParameters,
  VariantDTO,
  VariantUpdateDTO
} from '../../../features/variants/types/variant-types';

export abstract class VariantServiceContract {
  abstract createProductVariant(createVariantInput: PartnerAndStoreParameters, variant: VariantDTO): Observable<ApiResponse<Variant>>;
  abstract updateProductVariant(updateVariantInput: MainVariantParameters, payload: VariantUpdateDTO): Observable<ApiResponse<Variant>>;
  abstract deleteProductVariant(deleteVariantInput: AdditionalVariantParameters): Observable<ApiResponse<boolean>>;
}
