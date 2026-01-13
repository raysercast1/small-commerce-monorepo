import {Component, inject, signal, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatOptionModule} from '@angular/material/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {VariantServiceContract} from '../../../../api/variant/contracts/variant-service.contract';
import {Attribute, Metadata, StoreEmbedded, Tag, Variant} from '../../../../shared/types/shared-types';
import {EditVariantDialogData, VariantUpdateDTO} from '../../types/variant-types';
import {ImageManagementPage} from '../../../image/pages/image-management-page/image-management-page';
import {ImageServiceContract} from '../../../../api/image/contracts/image-service.contract';
import {catchError, defer, finalize, Observable, of, take} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {AssignImageToVariantsParams} from '../../../image/types/image-types';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-edit-variant-form',
  standalone: true,
  templateUrl: './edit-variant-form.html',
  styleUrls: ['./edit-variant-form.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ImageManagementPage,
    MatOptionModule,
    MatProgressSpinner
  ],
})
export class EditVariantForm {
  variantForm: FormGroup;
  public dialogRef = inject(MatDialogRef<EditVariantForm>);
  public data: EditVariantDialogData = inject(MAT_DIALOG_DATA);

  @ViewChild(ImageManagementPage) imageManagementPage?: ImageManagementPage;

  readonly hideTagAndMetadata = signal(true);
  readonly submitting = signal(false);

  private fb = inject(FormBuilder);
  private variantService = inject(VariantServiceContract);
  private imageService = inject(ImageServiceContract);

  get attributesFA(): FormArray { return this.variantForm.get('attributes') as FormArray; }
  get metadataFA(): FormArray { return this.variantForm.get('metadata') as FormArray; }
  get tagsFA(): FormArray { return this.variantForm.get('tags') as FormArray; }

  constructor() {
    this.variantForm = this.fb.group({
      selectedVariantId: ['', Validators.required],
      variantName: ['', Validators.required],
      attributes: this.fb.array([this.createAttributeGroup()], Validators.required),
      metadata: this.fb.array([]),
      tags: this.fb.array([]),
      sku: [''],
      weight: [0],
      dimensions: [''],
      barcode: [''],
      images: [[], Validators.required],
    });

    this.variantForm.get('selectedVariantId')?.valueChanges.subscribe(variantId => {
      if (variantId) {
        const variant = this.data.variants?.find(v => v.id === variantId);
        if (variant) {
          this.populateFormFromVariant(variant);
          this.enableEditingControls();
        } else {
          this.resetFormToDefaults();
          this.disableEditingControls();
        }
      }
    })

    if (this.data.variant?.id) {
      this.variantForm.get('selectedVariantId')?.disable();
      this.populateFormFromVariant(this.data.variant)
      this.enableEditingControls();
    } else {
      this.disableEditingControls();
    }
  }

  createAttributeGroup(): FormGroup {
    return this.fb.group({
      attributeKey: ['', Validators.required],
      attributeValue: ['', Validators.required]
    });
  }

  createKeyValueGroup(): FormGroup {
    return this.fb.group({ key: ['', Validators.required], value: ['', Validators.required] });
  }

  addAttribute(): void { this.attributesFA.push(this.createAttributeGroup()); }
  removeAttribute(index: number): void { if (this.attributesFA.length > 1) { this.attributesFA.removeAt(index); } }
  addMetadata(): void { this.metadataFA.push(this.createKeyValueGroup()); }
  removeMetadata(index: number): void { this.metadataFA.removeAt(index); }
  addTag(): void { this.tagsFA.push(this.createKeyValueGroup()); }
  removeTag(index: number): void { this.tagsFA.removeAt(index); }

  onSave(): void {
    if (this.submitting() || !this.variantForm.valid) {
      console.warn('Form is invalid or submitting. Skipping submit.');
      return;
    }

    const selectedVariantId = this.variantForm.value.selectedVariantId;
    const partnerId = this.data.partnerId;
    const variantId = selectedVariantId ? selectedVariantId : this.data.variant?.id;

    if (!partnerId || !variantId) {
      console.warn('Missing partnerId or variantId. Skipping submit.');
      this.submitting.set(false);
      return;
    }

    const store = this.findStore(this.data, variantId);
    if (!store) {
      console.warn('No store found. Skipping onSave execution.');
      this.submitting.set(false);
      return;
    }

    const storeId = store?.id;
    this.submitting.set(true);

    const uploadAndAssign$: Observable<unknown> = defer(() => {
      if(!this.imageManagementPage) {
        console.warn('ImageManagementPage not found. Skipping image upload.');
        return of(null);
      }

      return this.imageManagementPage.triggerUpload().pipe(
        take(1),
        map((imageIds) => Array.isArray(imageIds) ? imageIds : []),
        switchMap((imageIds) => {
          if (!imageIds.length) {
            console.warn('No images uploaded. Returning null Observable.');
            return of(null);
          }

          const params: AssignImageToVariantsParams = {
            imageIds,
            variantId,
            productId: this.data.productId,
            storeId
          };

          return this.imageService.assignImagesToVariant(partnerId, params)
        })
      );
    });

    uploadAndAssign$.pipe(
      switchMap((assignResult) => {
        if (!this.variantForm.dirty) {
          console.warn('No changes detected. Returning null Observable and closing dialog');
          this.dialogRef.close(assignResult);
          return of(null);
        }

        const payload = this.constructPayload(this.variantForm, this.data.productId);
        return this.variantService
          .updateProductVariant({partnerId, variantId}, payload)
          .pipe(map(updateResult => ({ updateResult, assignResult })));
      }),
      catchError((err) => {
        console.error('Variant submit pipeline failed:', err);
        if (!this.variantForm.dirty) {
          console.warn('Closing dialog and returning null Observable.')
          this.dialogRef.close();
        }

        // Keep dialog open when dirty so the user can fix/retry:
        return of(null);

        // If you prefer to fail hard and show error state, use:
        // return throwError(() => error);
      }),
      finalize(() => {
        this.submitting.set(false);
      })
    ).subscribe((result) => {
      if (result?.updateResult) {
        console.log('Variant and Image updated successful.');
        this.dialogRef.close(result.updateResult);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private resetFormToDefaults(): void {
    this.attributesFA.clear();
    this.attributesFA.push(this.createAttributeGroup());

    this.metadataFA.clear();
    this.tagsFA.clear();

    this.variantForm.patchValue({
      variantName: '',
      sku: '',
      weight: 0,
      dimensions: '',
      barcode: '',
      imageUrl: '',
      videoUrl: ''
    });
  }

  private populateFormFromVariant(v: Variant): void {
    let attributeControls: FormGroup[];
    const attrs: Attribute[] = Array.isArray(v.attributes) ? v.attributes : (v.attributes ? [v.attributes] : []);
    if (attrs.length) {
      attributeControls = attrs.map(a => this.fb.group({
        attributeKey: (a as Attribute).attributeKey ?? '',
        attributeValue: (a as Attribute).attributeValue ?? ''
      }))
    } else {
      attributeControls = [this.createAttributeGroup()];
    }
    this.variantForm.setControl('attributes', this.fb.array(attributeControls));


    const metaObj: Metadata = v.variantMetadata ?? {};
    const metadataControls = Object.entries(metaObj).map(([k, v]) => this.fb.group({ key: k, value: v as unknown }));
    this.variantForm.setControl('metadata', this.fb.array(metadataControls));

    const tagsObj: Tag = v.tags ?? {};
    const tagControls = Object.entries(tagsObj).map(([k, v]) => this.fb.group({ key: k, value: v as unknown }));
    this.variantForm.setControl('tags', this.fb.array(tagControls));

    this.variantForm.patchValue({
      variantName: v.variantName ?? v.name ?? '',
      sku: v.sku ?? '',
      weight: v.weight ?? 0,
      dimensions: v.dimensions ?? '',
      barcode: v.barcode ?? '',
      imageUrl: v.imageUrl ?? '',
      videoUrl: v.videoUrl ?? ''
    }, { emitEvent: false }); // Use emitEvent: false to prevent infinite loops with valueChanges.
  }

  private constructPayload(formGroup: FormGroup, productId: string): VariantUpdateDTO {
    const indexedSignature = "key";
    const formValue = formGroup.value as VariantUpdateDTO;

    const attrArray = (this.attributesFA.value as Attribute[])
      .filter(a => a?.attributeKey)
      .map(a => ({ attributeKey: a.attributeKey, attributeValue: a.attributeValue }));
    const attributes = attrArray.length === 1 ? attrArray[0] : attrArray;

    const variantMetadataEntries = (this.metadataFA.value as Metadata[])
      .filter(m => m?.[indexedSignature])
      .reduce((acc: any, curr: any) => { acc[curr.key] = curr.value; return acc; }, {} as Record<string, unknown>);
    const variantMetadata = Object.keys(variantMetadataEntries).length ? variantMetadataEntries : undefined;

    const tagsEntries = (this.tagsFA.value as Tag[])
      .filter(t => t?.[indexedSignature])
      .reduce((acc: any, curr: any) => { acc[curr.key] = curr.value; return acc; }, {} as Record<string, unknown>);
    const tags = Object.keys(tagsEntries).length ? tagsEntries : undefined;

    return {
      productId,
      variantName: formValue.variantName,
      enabled: true, // temporary flag. This option should be added in the form.
      attributes,
      sku: formValue.sku,
      weight: formValue?.weight,
      dimensions: formValue?.dimensions,
      barcode: formValue?.barcode,
      imageUrl: formValue?.imageUrl,
      videoUrl: formValue?.videoUrl,
      ...(variantMetadata ? { variantMetadata } : {}),
      ...(tags ? { tags } : {}),
    } satisfies VariantUpdateDTO;
  }

  private enableEditingControls(): void {
    Object.keys(this.variantForm.controls).forEach(key => {
      if (key !== 'selectedVariantId') { this.variantForm.controls[key].enable(); }
    });
  }

  private disableEditingControls(): void {
    Object.keys(this.variantForm.controls).forEach(key => {
      if (key !== 'selectedVariantId') { this.variantForm.controls[key].disable(); }
    });
  }

  private findStore(data: EditVariantDialogData, variantId: string): StoreEmbedded | undefined {
    const store = data.variant?.product.store;
    return store ? store : data.variants?.find(v => v.id === variantId)?.product.store;
  }
}
