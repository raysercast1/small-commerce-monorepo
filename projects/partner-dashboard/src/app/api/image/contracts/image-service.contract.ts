import {
  AssignImageToProductsParams,
  AssignImageToVariantsParams,
  Image,
  ImageAssignResponse,
  ImageDTO,
  ImageRecord,
  ImageStatus
} from '../../../features/image/types/image-types';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../shared/services/make-request.service';

export abstract class ImageServiceContract {
  abstract generateSignedUrl(imageDTO: ImageDTO, partnerId: string): Observable<ApiResponse<ImageRecord>>;
  abstract uploadToGcs(signedUrl: string, file: File): Observable<void>;
  abstract activateImage(imageId: string, partnerId: string, ImageStatus: ImageStatus): Observable<ApiResponse<boolean>>;
  abstract deleteImageProduct(imageId: string, partnerId: string, productId: string): Observable<ApiResponse<boolean>>;
  abstract deleteImageVariant(imageId: string, partnerId: string, variantId: string): Observable<ApiResponse<boolean>>;
  abstract getImagesByProductStatus(partnerId: string, status: ImageStatus, productId: string): Observable<ApiResponse<Image[]>>;
  abstract getImagesByVariantStatus(partnerId: string, status: ImageStatus, variantId: string): Observable<ApiResponse<Image[]>>;
  abstract assignImagesToProduct(partnerId: string, params: AssignImageToProductsParams): Observable<ApiResponse<ImageAssignResponse>>;
  abstract assignImagesToVariant(partnerId: string, params: AssignImageToVariantsParams): Observable<ApiResponse<ImageAssignResponse>>;
}
