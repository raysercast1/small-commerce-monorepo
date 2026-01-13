import {Metadata, ProductEmbedded, VariantEmbedded} from '../../../shared/types/shared-types';

export interface ImagesState {
  images: Image[];
  loading: boolean;
  progress: number;
  error: string | null;
}

export interface ImageDTO {
  name: string;
  isMain: boolean;
  metadata: string;
}

export interface ImageUpdateDTO extends ImageDTO {
  status: ImageStatus;
  imageId: string;
  targetProductOrVariantId: string;
}

export enum ImageStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED'
}

export type Image = {
  id: string;
  name: string;
  isMain: boolean;
  description?: string;
  url: string;
  thumbnailUrl: string;
  status: ImageStatus;
  metadata?: Metadata;
  product?: ProductEmbedded;
  variant?: VariantEmbedded
}

export type ImageRecord = Image & {signedUrl: string}


// Params and response types aligned with OpenAPI components
export interface AssignImageToProductsParams {
  imageIds: string[];
  productId: string;
  storeId: string;
}

export interface AssignImageToVariantsParams {
  variantId: string;
  imageIds: string[];
  productId: string;
  storeId: string;
}

export interface ImageAssignResponse {
  itemsUpdated: string[];
  imagesUpdated: string[];
}
