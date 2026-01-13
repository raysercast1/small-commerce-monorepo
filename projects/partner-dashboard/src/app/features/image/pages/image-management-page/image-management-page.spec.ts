import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ImageManagementPage} from './image-management-page';
import {provideZonelessChangeDetection, signal, WritableSignal} from '@angular/core';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {ImageStateContract} from '../../services/contracts/image-state.contract';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Image, ImageStatus} from '../../types/image-types';
import {of} from 'rxjs';
import {By} from '@angular/platform-browser';

class ImageStateMock extends ImageStateContract {
  private _images: WritableSignal<Image[]> = signal<Image[]>([]);
  private _loading: WritableSignal<boolean> = signal(false);
  private _progress: WritableSignal<number> = signal(0);
  private _error: WritableSignal<string | null> = signal(null);

  readonly images = this._images.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly progress = this._progress.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    super();
    this.setContext = vi.fn();
    this.initialize = vi.fn((imgs: Image[]) => this._images.set(imgs));
    this.loadImages = vi.fn();
    this.uploadImageFiles = vi.fn();
    this.uploadPendingImages = vi.fn(() => of([]));
    this.deleteImage = vi.fn((id: string) => {
      this._images.update(list => list.filter(i => i.id !== id));
    });
  }

  override setContext: (targetId: string | null | undefined) => void;
  override initialize: (images: Image[]) => void;
  override loadImages: (imageStatus: any, partnerId: string, targetProductOrVariantId: string) => void;
  override uploadImageFiles: (files: File[]) => void;
  override uploadPendingImages: () => any;
  override deleteImage: (imageId: string) => void;
}

describe('ImageManagementPage', () => {
  let component: ImageManagementPage;
  let fixture: ComponentFixture<ImageManagementPage>;
  let imageStateMock: ImageStateMock;

  beforeEach(async () => {
    imageStateMock = new ImageStateMock();

    await TestBed.configureTestingModule({
      imports: [ImageManagementPage],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
      ],
    })
    .overrideComponent(ImageManagementPage, {
      set: {
        providers: [
          { provide: ImageStateContract, useValue: imageStateMock }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageManagementPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Rendering', () => {
    it('should render the drop zone', () => {
      const dropZone = fixture.debugElement.query(By.css('.drop-zone'));
      expect(dropZone).toBeTruthy();
      expect(dropZone.nativeElement.textContent).toContain('Drag and drop images here or click to upload');
    });
  });

  describe('Interactions', () => {
    it('should handle onDragOver', () => {
      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as any;
      component.onDragOver(event);
      expect(component.isDragOver).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should handle onDragLeave', () => {
      component.isDragOver = true;
      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as any;
      component.onDragLeave(event);
      expect(component.isDragOver).toBe(false);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should handle onDrop with valid image files', () => {
      const onTouchedSpy = vi.spyOn(component, 'onTouched');
      const file = new File([''], 'test.png', { type: 'image/png' });
      const event = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: {
          files: [file]
        }
      } as any;

      component.onDrop(event);

      expect(component.isDragOver).toBe(false);
      expect(imageStateMock.uploadImageFiles).toHaveBeenCalledWith([file]);
      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('should not call uploadImageFiles onDrop if disabled', () => {
      component.isDisabled = true;
      const file = new File([''], 'test.png', { type: 'image/png' });
      const event = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: {
          files: [file]
        }
      } as any;

      component.onDrop(event);

      expect(imageStateMock.uploadImageFiles).not.toHaveBeenCalled();
    });

    it('should handle onFileSelected', () => {
      const onTouchedSpy = vi.spyOn(component, 'onTouched');
      const file = new File([''], 'test.png', { type: 'image/png' });
      const event = {
        target: {
          files: [file],
          value: 'test'
        }
      } as any;

      component.onFileSelected(event);

      expect(imageStateMock.uploadImageFiles).toHaveBeenCalledWith([file]);
      expect(onTouchedSpy).toHaveBeenCalled();
      expect(event.target.value).toBe('');
    });

    it('should handle onDeleteImage', () => {
      const onTouchedSpy = vi.spyOn(component, 'onTouched');
      const imageId = '123';

      component.onDeleteImage(imageId);

      expect(imageStateMock.deleteImage).toHaveBeenCalledWith(imageId);
      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('should not call deleteImage if disabled', () => {
      component.isDisabled = true;
      component.onDeleteImage('123');
      expect(imageStateMock.deleteImage).not.toHaveBeenCalled();
    });
  });

  describe('ControlValueAccessor', () => {
    it('should call initialize on writeValue', () => {
      const mockImages: Image[] = [{ id: '1', isMain: true,  name: 'img1', thumbnailUrl: 'url1', url: 'url1', status: ImageStatus.PENDING }];
      component.writeValue(mockImages);
      expect(imageStateMock.initialize).toHaveBeenCalledWith(mockImages);
    });

    it('should set onChange callback', () => {
      const fn = vi.fn();
      component.registerOnChange(fn);
      expect(component.onChange).toBe(fn);
    });

    it('should set onTouched callback', () => {
      const fn = vi.fn();
      component.registerOnTouched(fn);
      expect(component.onTouched).toBe(fn);
    });

    it('should update isDisabled on setDisabledState', () => {
      component.setDisabledState(true);
      expect(component.isDisabled).toBe(true);
      component.setDisabledState(false);
      expect(component.isDisabled).toBe(false);
    });
  });

  describe('Other Methods', () => {
    it('should call uploadPendingImages on triggerUpload', () => {
      component.triggerUpload();
      expect(imageStateMock.uploadPendingImages).toHaveBeenCalled();
    });

    it('should call deleteImage on triggerDelete', () => {
      const imageId = '123';
      component.triggerDelete(imageId);
      expect(imageStateMock.deleteImage).toHaveBeenCalledWith(imageId);
    });
  });

  describe('Effects', () => {
    it('should call setContext when targetId changes', async () => {
      fixture.componentRef.setInput('targetId', 'new-id');
      await fixture.whenStable();
      expect(imageStateMock.setContext).toHaveBeenCalledWith('new-id');
    });
  });
});
