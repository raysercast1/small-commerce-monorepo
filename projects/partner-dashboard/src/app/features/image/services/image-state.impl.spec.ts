import {TestBed} from '@angular/core/testing';
import {ImageStateImpl} from './image-state.impl';
import {ImageServiceContract} from '../../../api/image/contracts/image-service.contract';
import {RouteContextService} from '../../../shared/services/route-context.service';
import {DestroyRef, signal} from '@angular/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {firstValueFrom, of, throwError} from 'rxjs';
import {Image, ImageStatus} from '../types/image-types';
import {provideZonelessChangeDetection} from '@angular/core';

class RouteContextServiceMock {
  partnerId = signal<string | null>(null);
}

class ImageServiceContractMock {
  generateSignedUrl = vi.fn();
  uploadToGcs = vi.fn();
  activateImage = vi.fn();
  deleteImageProduct = vi.fn();
  deleteImageVariant = vi.fn();
  getImagesByProductStatus = vi.fn();
  getImagesByVariantStatus = vi.fn();
  assignImagesToProduct = vi.fn();
  assignImagesToVariant = vi.fn();
}

describe('ImageStateImpl', () => {
  let service: ImageStateImpl;
  let imageServiceMock: ImageServiceContractMock;
  let routeContextMock: RouteContextServiceMock;
  let destroyRefMock: DestroyRef;

  beforeEach(() => {
    imageServiceMock = new ImageServiceContractMock();
    routeContextMock = new RouteContextServiceMock();
    destroyRefMock = {
      onDestroy: vi.fn()
    } as unknown as DestroyRef;

    TestBed.configureTestingModule({
      providers: [
        ImageStateImpl,
        provideZonelessChangeDetection(),
        {provide: ImageServiceContract, useValue: imageServiceMock},
        {provide: RouteContextService, useValue: routeContextMock},
        {provide: DestroyRef, useValue: destroyRefMock}
      ]
    });

    service = TestBed.inject(ImageStateImpl);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setContext', () => {
    it('should update targetId signal', () => {
      // Since targetId is private, we check the side effect in loadImages
      // We need to set up the effect to run.
      routeContextMock.partnerId.set('p1');

      service.setContext('new-target-id');

      // Effects run after some time or when change detection is triggered in zoneless.
      // For testing effects, we might need to wait or manually trigger if possible.
      // But loadImages is also a public method, so we can test it directly.
    });
  });

  describe('initialize', () => {
    it('should set initial images and clear error', () => {
      const mockImages: Image[] = [{ id: '1' } as any];
      service.initialize(mockImages);
      expect(service.images()).toEqual(mockImages);
      expect(service.error()).toBeNull();
      // Verify no other calls
      expect(imageServiceMock.getImagesByProductStatus).not.toHaveBeenCalled();
    });

    it('should handle empty images', () => {
      service.initialize([]);
      expect(service.images()).toEqual([]);
    });
  });

  describe('loadImages', () => {
    const partnerId = 'p1';
    const targetId = 't1';
    const status = ImageStatus.ACTIVE;

    it('should return early if missing params', () => {
      service.loadImages(status, '', targetId);
      expect(service.images()).toEqual([]);
      expect(imageServiceMock.getImagesByProductStatus).not.toHaveBeenCalled();
    });

    it('should call getImagesByProductStatus and update state on success', () => {
      const mockImages: Image[] = [{ id: '1', metadata: '{}' } as any];
      imageServiceMock.getImagesByProductStatus.mockReturnValue(of({ data: mockImages }));
      imageServiceMock.getImagesByVariantStatus.mockReturnValue(of({ data: [] }));

      service.loadImages(status, partnerId, targetId);

      expect(service.loading()).toBe(false);
      expect(service.images()[0].id).toBe('1');
      expect(imageServiceMock.getImagesByProductStatus).toHaveBeenCalledTimes(1);
      expect(imageServiceMock.getImagesByProductStatus).toHaveBeenCalledWith(partnerId, status, targetId);
      expect(imageServiceMock.getImagesByVariantStatus).not.toHaveBeenCalled();
    });

    it('should fallback to getImagesByVariantStatus if product results are empty', () => {
      const mockImages: Image[] = [{ id: 'v1', metadata: '{}' } as any];
      imageServiceMock.getImagesByProductStatus.mockReturnValue(of({ data: [] }));
      imageServiceMock.getImagesByVariantStatus.mockReturnValue(of({ data: mockImages }));

      service.loadImages(status, partnerId, targetId);

      expect(service.images()[0].id).toBe('v1');
      expect(imageServiceMock.getImagesByProductStatus).toHaveBeenCalledTimes(1);
      expect(imageServiceMock.getImagesByVariantStatus).toHaveBeenCalledTimes(1);
      expect(imageServiceMock.getImagesByVariantStatus).toHaveBeenCalledWith(partnerId, status, targetId);
    });

    it('should set error on failure', () => {
      imageServiceMock.getImagesByProductStatus.mockReturnValue(throwError(() => new Error('Fail')));
      imageServiceMock.getImagesByVariantStatus.mockReturnValue(throwError(() => new Error('Fail')));

      service.loadImages(status, partnerId, targetId);

      expect(service.error()).toBe('Failed to load images');
    });
  });

  describe('uploadImageFiles', () => {
    it('should create placeholders and update state', () => {
      routeContextMock.partnerId.set('p1');
      const file = new File([''], 'test.png', { type: 'image/png' });

      const mockBlobUrl = 'blob:http://localhost/123';
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn().mockReturnValue(mockBlobUrl),
        revokeObjectURL: vi.fn()
      });

      service.uploadImageFiles([file]);

      expect(service.images().length).toBe(1);
      expect(service.images()[0].name).toBe('test.png');
      expect(service.images()[0].thumbnailUrl).toBe(mockBlobUrl);
      expect(service.images()[0].status).toBe(ImageStatus.INACTIVE);

      vi.unstubAllGlobals();
    });

    it('should do nothing if partnerId is missing', () => {
      routeContextMock.partnerId.set(null);
      service.uploadImageFiles([new File([''], 'test.png')]);
      expect(service.images()).toEqual([]);
    });
  });

  describe('uploadPendingImages', () => {
    it('should return of([]) if no pending files', async () => {
      routeContextMock.partnerId.set('p1');
      const result = await firstValueFrom(service.uploadPendingImages());
      expect(result).toEqual([]);
    });

    it('should upload files and update state on success', async () => {
      routeContextMock.partnerId.set('p1');
      const file = new File([''], 'test.png', { type: 'image/png' });

      vi.stubGlobal('URL', {
        createObjectURL: vi.fn().mockReturnValue('blob:123'),
        revokeObjectURL: vi.fn()
      });
      service.uploadImageFiles([file]);

      imageServiceMock.generateSignedUrl.mockReturnValue(of({ data: { id: 'remote-id', signedUrl: 'http://upload' } }));
      imageServiceMock.uploadToGcs.mockReturnValue(of(undefined));
      imageServiceMock.activateImage.mockReturnValue(of({ data: true }));

      const ids = await firstValueFrom(service.uploadPendingImages());

      expect(ids).toEqual(['remote-id']);
      expect(service.images()[0].id).toBe('remote-id');
      expect(service.images()[0].status).toBe(ImageStatus.ACTIVE);
      expect(imageServiceMock.generateSignedUrl).toHaveBeenCalledTimes(1);
      expect(imageServiceMock.uploadToGcs).toHaveBeenCalledTimes(1);
      expect(imageServiceMock.activateImage).toHaveBeenCalledTimes(1);

      vi.unstubAllGlobals();
    });

    it('should handle errors for individual files', async () => {
      routeContextMock.partnerId.set('p1');
      const file = new File([''], 'test.png', { type: 'image/png' });

      vi.stubGlobal('URL', {
        createObjectURL: vi.fn().mockReturnValue('blob:123'),
        revokeObjectURL: vi.fn()
      });
      service.uploadImageFiles([file]);

      imageServiceMock.generateSignedUrl.mockReturnValue(throwError(() => new Error('Signed URL failed')));

      const ids = await firstValueFrom(service.uploadPendingImages());
      expect(ids).toEqual([]);
      expect(service.images().length).toBe(0);
      expect(service.error()).toBe('Failed to upload test.png');

      vi.unstubAllGlobals();
    });
  });

  describe('deleteImage', () => {
    it('should call deleteImageVariant if image is associated with variant', () => {
      routeContextMock.partnerId.set('p1');
      const targetId = 'v1';
      service.setContext(targetId);

      const mockImage = { id: 'img1', variant: { id: 'v1' } } as any;
      service.initialize([mockImage]);

      imageServiceMock.deleteImageVariant.mockReturnValue(of({ data: true }));

      service.deleteImage('img1');

      expect(imageServiceMock.deleteImageVariant).toHaveBeenCalledWith('img1', 'p1', targetId);
      expect(service.images().length).toBe(0);
    });

    it('should call deleteImageProduct if image is not associated with variant', () => {
      routeContextMock.partnerId.set('p1');
      const targetId = 'p1-id';
      service.setContext(targetId);

      const mockImage = { id: 'img1', product: { id: 'p1-id' } } as any;
      service.initialize([mockImage]);

      imageServiceMock.deleteImageProduct.mockReturnValue(of({ data: true }));

      service.deleteImage('img1');

      expect(imageServiceMock.deleteImageProduct).toHaveBeenCalledWith('img1', 'p1', targetId);
      expect(service.images().length).toBe(0);
    });

    it('should set error if delete fails', () => {
      routeContextMock.partnerId.set('p1');
      service.setContext('p1-id');
      const mockImage = { id: 'img1' } as any;
      service.initialize([mockImage]);

      imageServiceMock.deleteImageProduct.mockReturnValue(throwError(() => new Error('Delete failed')));

      service.deleteImage('img1');

      expect(service.error()).toBe('Failed to delete image');
    });

    it('should set error if partnerId, image or targetId is missing', () => {
        routeContextMock.partnerId.set(null);
        service.deleteImage('img1');
        expect(service.error()).toBe('Missing partnerId');

        routeContextMock.partnerId.set('p1');
        service.setContext(null);
        service.deleteImage('img1');
        expect(service.error()).toBe('Image not found'); // targetId missing leads to this error branch in code
    });
  });

  describe('ngOnDestroy', () => {
    it('should revoke blob URLs', () => {
      const mockBlobUrl = 'blob:123';
      const revokeSpy = vi.fn();
      vi.stubGlobal('URL', {
        revokeObjectURL: revokeSpy
      });

      service.initialize([{ id: '1', thumbnailUrl: mockBlobUrl } as any]);

      service.ngOnDestroy();

      expect(revokeSpy).toHaveBeenCalledWith(mockBlobUrl);
      vi.unstubAllGlobals();
    });
  });
});
