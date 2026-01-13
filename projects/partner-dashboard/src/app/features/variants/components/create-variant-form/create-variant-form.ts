import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {VariantServiceContract} from '../../../../api/variant/contracts/variant-service.contract';
import {Attribute, Metadata, Tag, Variant} from '../../../../shared/types/shared-types';
import {map, switchMap} from 'rxjs/operators';
import {ProductServiceContract} from '../../../../api/product/contracts/product-service.contract';
import {ProductAndVariantInput} from '../../../products/types/product-types';
import {CreateVariantDialogData, VariantDTO} from '../../types/variant-types';

@Component({
  selector: 'app-create-variant-form',
  templateUrl: './create-variant-form.html',
  styleUrls: ['./create-variant-form.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateVariantForm {
  variantForm: FormGroup;

  readonly hideTagAndMetadata = signal(true);

  private fb = inject(FormBuilder);
  private readonly variantService = inject(VariantServiceContract);
  private readonly productService = inject(ProductServiceContract);
  public dialogRef = inject(MatDialogRef<CreateVariantForm>);
  public data: CreateVariantDialogData = inject(MAT_DIALOG_DATA);

  constructor() {
    this.variantForm = this.fb.group({
      variantName: ['', Validators.required],
      attributes: this.fb.array([this.createAttributeGroup()], Validators.required),
      metadata: this.fb.array([]),
      tags: this.fb.array([]),
      sku: [''],
      weight: [0],
      dimensions: [''],
      barcode: [''],
      imageUrl: [''],
      videoUrl: ['']
    });
  }

  get attributesFA(): FormArray { return this.variantForm.get('attributes') as FormArray; }
  get metadataFA(): FormArray { return this.variantForm.get('metadata') as FormArray; }
  get tagsFA(): FormArray { return this.variantForm.get('tags') as FormArray; }

  createAttributeGroup(): FormGroup {
    return this.fb.group({
      attributeKey: ['', Validators.required],
      attributeValue: ['', Validators.required]
    });
  }

  createKeyValueGroup(): FormGroup {
    return this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required]
    });
  }

  addAttribute(): void { this.attributesFA.push(this.createAttributeGroup()); }
  removeAttribute(index: number): void { if (this.attributesFA.length > 1) { this.attributesFA.removeAt(index); } }

  addMetadata(): void { this.metadataFA.push(this.createKeyValueGroup()); }
  removeMetadata(index: number): void { this.metadataFA.removeAt(index); }

  addTag(): void { this.tagsFA.push(this.createKeyValueGroup()); }
  removeTag(index: number): void { this.tagsFA.removeAt(index); }

  onSubmit() {
    if (!this.variantForm.valid) {
      return;
    }

    const productId = this.data.productId;
    const storeId = this.data.storeId;
    const partnerId = this.data.partnerId;

    if (!partnerId || !storeId) { return; } //TODO: Notify missing partnerId or storeId

    const payload = this.constructPayload(this.variantForm, productId);

    this.variantService.createProductVariant({partnerId, storeId}, payload).pipe(
      switchMap(response => {
        const variant: Variant = response.data;
        return this.productService.addVariantsToProducts(
          {
            productIds: [productId],
            variantIds: [variant.id],
            storeId
          } satisfies ProductAndVariantInput,
          partnerId
        ).pipe(
          map(result => ({ variant, result }))
        );
      })
    ).subscribe(result => {
      this.dialogRef.close(result);
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private constructPayload(formGroup: FormGroup, productId: string): VariantDTO {
    const indexedSignature = "key";
    const formValue = formGroup.value as VariantDTO;

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
      sku: formValue.sku,
      variantName: formValue.variantName,
      attributes,
      weight: formValue?.weight,
      dimensions: formValue?.dimensions,
      barcode: formValue?.barcode,
      ...(variantMetadata ? { variantMetadata } : {}),
      ...(tags ? { tags } : {}),
      imageUrl: formValue?.imageUrl,
      videoUrl: formValue?.videoUrl,
    } satisfies VariantDTO;
  }
}
