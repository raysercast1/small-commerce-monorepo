import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ChangeDetectionStrategy, Component, effect, inject, input} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatIconModule} from '@angular/material/icon';
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import {ImageStateContract} from '../../services/contracts/image-state.contract';
import {ImageStateImpl} from '../../services/image-state.impl';
import {Image} from '../../types/image-types';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-image-management-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './image-management-page.html',
  styleUrls: ['./image-management-page.css'],
  providers: [
    { // Register as a Form Control
      provide: NG_VALUE_ACCESSOR,
      useExisting: ImageManagementPage,
      multi: true
    },
    {
      provide: ImageStateContract,
      useClass: ImageStateImpl
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageManagementPage implements ControlValueAccessor {
  private readonly imageState = inject(ImageStateContract);

  targetId = input<string | null | undefined>(null);

  readonly images= this.imageState.images;
  readonly error= this.imageState.error;
  readonly loading= this.imageState.loading;
  readonly progress= this.imageState.progress;

  isDragOver = false;

  //ControlValueAccessor callbacks
  onChange: (value: Image[]) => void = () => {};
  onTouched: () => void = () => {};
  isDisabled = false;

  constructor() {
    effect(() => {
      const tid = this.targetId();
      this.imageState.setContext(tid);
    });

    // Sync internal state changes to the parent Form Control
    effect(() => {
      const currentImages = this.images();
      if (this.onChange) {
        this.onChange(currentImages);
      }
    });
  }

  // Drag and Drop Events
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (this.isDisabled) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (validFiles.length > 0) {
        this.imageState.uploadImageFiles(validFiles);
        this.onTouched();
      }
    }
  }

  onFileSelected(event: Event): void {
    const inputFile = event.target as HTMLInputElement;
    if (!inputFile.files?.length) {
      return; //Should I send an error to the parent Form Control? or to sentry? or UI?
    }

    const files = Array.from(inputFile.files);
    this.imageState.uploadImageFiles(files);
    this.onTouched(); // Mark parent Form Control as touched to trigger validation.

    inputFile.value = '';
  }

  onDeleteImage(imageId: string): void {
    if (this.isDisabled) {
      return; // Should I send a type of notification to UI or somewhere else?
    }
    this.imageState.deleteImage(imageId);
    this.onTouched();
  }

  /**
   * Triggers the upload of any pending images.
   * Can be called by the parent component when the form is valid.
   */
  triggerUpload(): Observable<string[]> {
    return this.imageState.uploadPendingImages();
  }

  triggerDelete(imageId: string): void {
    this.imageState.deleteImage(imageId);
  }

  // --- ControlValueAccessor Implementation ---
  // Called by Angular Framework when the parent form writes a value (e.g., loading existing product images)
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(images: Image[]): void {
    this.imageState.initialize(images);
  }
}
