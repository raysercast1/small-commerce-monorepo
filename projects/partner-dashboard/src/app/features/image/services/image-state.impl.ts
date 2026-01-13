import {computed, DestroyRef, effect, inject, Injectable, OnDestroy, signal, Signal} from '@angular/core';
import {ImageStateContract} from './contracts/image-state.contract';
import {Image, ImageRecord, ImagesState, ImageStatus} from '../types/image-types';
import {RouteContextService} from '../../../shared/services/route-context.service';
import {ImageServiceContract} from '../../../api/image/contracts/image-service.contract';
import {catchError, concatMap, defer, finalize, from, Observable, of, tap, toArray} from 'rxjs';
import {Metadata} from '../../../shared/types/shared-types';
import {filter, map, switchMap} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Injectable()
export class ImageStateImpl extends ImageStateContract implements OnDestroy {
  private readonly routeContext = inject(RouteContextService);
  private readonly imageService = inject(ImageServiceContract);
  private readonly destroyRef = inject(DestroyRef);

  // --- Private Writable State ---
  // This is the single source of truth, hidden from the outside world.
  private state = signal<ImagesState>({
    images: [],
    loading: false,
    progress: 0,
    error: null
  });

  // --- Fulfilling the Public Contract ---
  // We use `computed` to create readonly signals derived from our private state.
  readonly images: Signal<Image[]> = computed(() => this.state().images);
  readonly loading: Signal<boolean> = computed(() => this.state().loading);
  readonly progress: Signal<number> = computed(() => this.state().progress);
  readonly error: Signal<string | null> = computed(() => this.state().error);

  // Context Signal
  private targetId = signal<string | null | undefined>(null);

  private pendingFiles = new Map<string, File>();

  constructor() {
    super();
    effect(() => {
      const partnerId = this.routeContext.partnerId();
      const tid = this.targetId();
      if (partnerId && tid) {
        this.loadImages(ImageStatus.ACTIVE, partnerId, tid);
      } else {
        // Don't clear images if we just lack ID (maybe we are in create mode and images are local only initially)
        // verify requirement: if we are in "create mode", we might not want to load anything from server yet.
        // this.state.update(s => ({ ...s, images: [] }));
      }
    });
  }

  setContext(targetId: string | null | undefined): void {
    this.targetId.set(targetId);
  }

  initialize(images: Image[]): void {
    this.state.update(s => ({ ...s, images: images || [], error: null}));
  }

  loadImages(imageStatus: ImageStatus, partnerId: string, targetProductOrVariantId: string): void {
    if (!partnerId || !targetProductOrVariantId || !imageStatus) {
      this.state.update(s => ({ ...s, images: [], error: null }));
      return;
    }

    this.state.update(s => ({ ...s, loading: true, error: null }));

    const normalize = (data: Image[]): Image[] => {
      const list = Array.isArray(data) ? data : [];
      return list.map((img: any) => ({
        ...img,
        metadata: this.parseMetadataFromString(img?.metadata)
      } as Image));
    };

    const fallback$ = defer(() => this.imageService.getImagesByVariantStatus(partnerId, imageStatus, targetProductOrVariantId).pipe(
      map(resp => normalize(resp?.data))
    ));

    this.imageService.getImagesByProductStatus(partnerId, imageStatus, targetProductOrVariantId).pipe(
      map(resp => normalize(resp?.data)),
      catchError(() => of([])), // Treat the error as an empty list to trigger fallback.
      switchMap(images => (images.length > 0 ? of(images) : fallback$)),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.state.update(s => ({ ...s, loading: false })))
    ).subscribe({
      next: (images: Image[]) => this.state.update(s => ({ ...s, images, error: null })),
      error: () => this.state.update(s => ({ ...s, error: 'Failed to load images' })),
    });
  }

  uploadImageFiles(files: File[]): void {
    const partnerId = this.routeContext.partnerId();
    if (!partnerId || !files.length) {
      return; // TODO: should we notify the UI?
    }

    const hadImages = this.state().images.length > 0;
    const placeholders: Image[] = [];

    files.forEach((file, index) => {
      const isMain = !hadImages && index === 0;
      const placeholder = this.createPlaceholder(file, isMain);
      this.pendingFiles.set(placeholder.id, file);
      placeholders.push(placeholder);
    })

    this.state.update(s => ({
      ...s,
      loading: false,
      images: [...s.images, ...placeholders]
    }));
  }

  uploadPendingImages(): Observable<string[]> {
    const partnerId = this.routeContext.partnerId();
    if (!partnerId || this.pendingFiles.size === 0) return of([]);

    this.state.update(s => ({ ...s, loading: true, progress: 0, error: null }));

    const filesToUpload = Array.from(this.pendingFiles.entries());
    const totalCount = filesToUpload.length;
    let completedCount = 0;

    return from(filesToUpload).pipe(
      concatMap(([placeholderId, file]) => {
        const currentImageState = this.state().images.find(img => img.id === placeholderId);
        const isMain = currentImageState ? currentImageState.isMain : false;

        return this.getSignedUrl(file, partnerId, isMain).pipe(
          concatMap(signedImage => this.uploadAndActivate(signedImage, file, partnerId)),
          tap(activeImage => {
            completedCount++;
            console.log('Completed count: ', completedCount)
            this.pendingFiles.delete(placeholderId);

            // We keep the local Blob URL in the 'thumbnailUrl' field to prevent UI flickering (<img> src change).
            this.state.update(s => ({
              ...s,
              images: s.images.map(img => img.id === placeholderId ? {
                ...activeImage,
                thumbnailUrl: img.thumbnailUrl
              } : img),
              progress: (completedCount / totalCount) * 100
            }));
          }),
          catchError(err => {// Handle individual file errors without breaking the stream
            console.error(`Failed to upload ${file.name}`, err);

            const placeholder = this.state().images.find(i => i.id === placeholderId);
            if (placeholder?.thumbnailUrl.startsWith('blob:')) {
              URL.revokeObjectURL(placeholder?.thumbnailUrl);
            }

            this.pendingFiles.delete(placeholderId);

            this.state.update(s => ({
              ...s,
              images: s.images.filter(img => img.id !== placeholderId),
              error: `Failed to upload ${file.name}`
            }));
            return of(null);
          })
        );
      }),
      filter(img => img !== null),
      map((img) => img?.id),
      toArray(),
      finalize(() => {
        if (this.pendingFiles.size === 0) {
          this.state.update(s => ({ ...s, loading: false }));
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.state().images.forEach(img => {
      if (img.thumbnailUrl && img.thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.thumbnailUrl);
      }
    });
  }

  private getSignedUrl(file: File, partnerId: string, isMain: boolean): Observable<ImageRecord> {
    const dto = {
      name: file.name,
      isMain,
      metadata: this.parseMetadataToString({})
    } as const;

    return this.imageService.generateSignedUrl(dto, partnerId).pipe(
      map(resp => {
        const img = resp.data;
        if (!img?.signedUrl || !img?.id) {
          throw new Error('Invalid response from generateSignedUrl');
        }
        return img;
      })
    );
  }

  private uploadAndActivate(signedImage: ImageRecord, file: File, partnerId: string): Observable<ImageRecord> {
    return this.imageService.uploadToGcs(signedImage.signedUrl, file).pipe(
      concatMap(() => {
        console.log("Activating Image")
        return this.imageService.activateImage(signedImage.id, partnerId, ImageStatus.ACTIVE).pipe(
          map(() => ({...signedImage, status: ImageStatus.ACTIVE} as ImageRecord))
        );
      })
    );
  }

  private createPlaceholder(file: File, isMain: boolean): Image {
    return {
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      isMain,
      description: 'For UI feedback effect.',
      url: '',
      thumbnailUrl: URL.createObjectURL(file),
      status: ImageStatus.INACTIVE,
      metadata: {} as Metadata,
      product: null as any,
      variant: null as any
    };
  }

  deleteImage(imageId: string): void {
    const partnerId = this.routeContext.partnerId();
    const imageToDelete = this.images().find(i => i.id === imageId);
    const targetId = this.targetId();

    if (!partnerId || !imageToDelete || !targetId) {
      this.state.update(s => ({ ...s, error: !partnerId ? 'Missing partnerId' : 'Image not found' }));
      return;
    }

    this.state.update(s => ({ ...s, loading: true, error: null }));

    of(imageToDelete).pipe(
      concatMap(img => {
        const isVariant = img.variant?.id === targetId;

        return isVariant
          ? this.imageService.deleteImageVariant(imageId, partnerId, targetId)
          : this.imageService.deleteImageProduct(imageId, partnerId, targetId);
      }),
      tap(() => {
        this.state.update(s => ({
          ...s,
          images: s.images.filter(i => i.id !== imageId)
        }));
      }),
      catchError(err => {
        console.error('Failed to delete image', err);
        this.state.update(s => ({ ...s, error: 'Failed to delete image' }));
        return of(null); // to avoid breaking the stream
      }),
      finalize( () => {
        this.state.update(s => ({ ...s, loading: false }));
      })
    ).subscribe();
  }



  // --- Helpers ---
  private parseMetadataToString(metadata: Metadata | string | null | undefined): string {
    if (!metadata) return '';
    if (typeof metadata === 'string') return metadata;
    try {
      return JSON.stringify(metadata);
    } catch {
      return '';
    }
  }

  private parseMetadataFromString(metadata: string | Metadata | null | undefined): Metadata {
    if (!metadata) return {} as Metadata;
    if (typeof metadata === 'string') {
      try {
        const parsed = JSON.parse(metadata);
        return typeof parsed === 'object' && parsed !== null ? (parsed as Metadata) : ({} as Metadata);
      } catch {
        return {} as Metadata;
      }
    }
    return metadata as Metadata;
  }
}
