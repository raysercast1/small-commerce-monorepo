import {ImageServiceContract} from '../contracts/image-service.contract';
import {
  AssignImageToProductsParams,
  AssignImageToVariantsParams,
  Image,
  ImageAssignResponse,
  ImageDTO,
  ImageRecord,
  ImageStatus
} from '../../../features/image/types/image-types';
import {Observable, map} from 'rxjs';
import {ApiResponse, MakeRequestService} from 'shared-core';
import {inject, Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpBackend, HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImageServiceImpl extends ImageServiceContract {
  private makeRequest = inject(MakeRequestService);
  private httpBackend = inject(HttpBackend);
  private apiUrl = `${environment.baseUrl}${environment.domain}images`;

  activateImage(imageId: string, partnerId: string, ImageStatus: ImageStatus): Observable<ApiResponse<boolean>> {
    const url = `${this.apiUrl}/status?partnerId=${partnerId}&imageId=${imageId}&status=${ImageStatus}`;
    return this.makeRequest.patch<ApiResponse<boolean>>(url, {});
  }

  deleteImageProduct(imageId: string, partnerId: string, productId: string): Observable<ApiResponse<boolean>> {
    const url = `${this.apiUrl}/by-product?partnerId=${partnerId}&imageId=${imageId}&targetProductOrVariantId=${productId}`;
    return this.makeRequest.delete<ApiResponse<boolean>>(url);
  }

  deleteImageVariant(imageId: string, partnerId: string, variantId: string): Observable<ApiResponse<boolean>> {
    const url = `${this.apiUrl}/by-variant?partnerId=${partnerId}&imageId=${imageId}&targetProductOrVariantId=${variantId}`;
    return this.makeRequest.delete<ApiResponse<boolean>>(url);
  }

  generateSignedUrl(imageDTO: ImageDTO, partnerId: string): Observable<ApiResponse<ImageRecord>> {
    const url = `${this.apiUrl}?partnerId=${partnerId}`;
    return this.makeRequest.post<ApiResponse<Image & {signedUrl: string, url: string, thumbnailUrl: string}>>(url, imageDTO);
  }

  getImagesByProductStatus(partnerId: string, status: ImageStatus, productId: string): Observable<ApiResponse<Image[]>> {
    const url = `${this.apiUrl}/by-product/status?partnerId=${partnerId}&status=${status}&targetProductOrVariantId=${productId}`;
    return this.makeRequest.get<ApiResponse<Image[]>>(url);
  }

  getImagesByVariantStatus(partnerId: string, status: ImageStatus, variantId: string): Observable<ApiResponse<Image[]>> {
    const url = `${this.apiUrl}/by-variant/status?partnerId=${partnerId}&status=${status}&targetProductOrVariantId=${variantId}`;
    return this.makeRequest.get<ApiResponse<Image[]>>(url);
  }

  // Upload to GCS using a raw HttpClient to avoid attaching Bearer tokens to external domains
  uploadToGcs(signedUrl: string, file: File): Observable<void> {
    const bareHttp = new HttpClient(this.httpBackend);
    const headers = new HttpHeaders({
      'Content-Type': file.type || 'application/octet-stream',
    });

    return bareHttp.put(signedUrl, file, { headers, responseType: 'text' }).pipe(map(() => void 0));
  }

  assignImagesToProduct(partnerId: string, params: AssignImageToProductsParams): Observable<ApiResponse<ImageAssignResponse>> {
    const imageIds = params.imageIds.join(',');
    const url = `${this.apiUrl}/assign-images-to-product?partnerId=${partnerId}&imageIds=${imageIds}&productId=${params.productId}&storeId=${params.storeId}`;
    return this.makeRequest.patch<ApiResponse<ImageAssignResponse>>(url, {});
  }

  assignImagesToVariant(partnerId: string, params: AssignImageToVariantsParams): Observable<ApiResponse<ImageAssignResponse>> {
    const imageIds = params.imageIds.join(',');
    const url = `${this.apiUrl}/assign-images-to-variant?partnerId=${partnerId}&variantId=${params.variantId}&imageIds=${imageIds}&productId=${params.productId}&storeId=${params.storeId}`;
    return this.makeRequest.patch<ApiResponse<ImageAssignResponse>>(url, {});
  }

}
