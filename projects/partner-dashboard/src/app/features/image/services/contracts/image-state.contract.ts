import {Signal} from '@angular/core';
import {Image, ImageStatus} from '../../types/image-types';
import {Observable} from 'rxjs';

export abstract class ImageStateContract {
  abstract readonly images: Signal<Image[]>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly progress: Signal<number>;
  abstract readonly error: Signal<string | null>;

  // Context setters
  abstract setContext(targetId: string | null | undefined): void;

  // Required for ControlValueAccessor to inject data
  abstract initialize(images: Image[]): void;

  abstract loadImages(imageStatus: ImageStatus, partnerId: string, targetProductOrVariantId: string): void;
  abstract uploadImageFiles(files: File[]): void;

  /**
   * Triggers the upload process for files that have been added via uploadImageFiles but have not yet been sent to the server.
   */
  abstract uploadPendingImages(): Observable<string[]>;

  abstract deleteImage(imageId: string): void;
}
