import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {InventoryServiceContract} from '../../../../api/inventory/contracts/inventory-service.contract';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions} from '@angular/material/dialog';
import {
  AddVariantsToInvRequestBody,
  CreateInventoryDialogData,
  InventoryDTO,
} from '../../types/inventory-types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { switchMap, map } from 'rxjs/operators';
import {Metadata, Product, VariantEmbedded} from '../../../../shared/types/shared-types';
import {StoreServiceContract} from '../../../../api/store/contracts/store-service.contract';

@Component({
  selector: 'app-create-inventory-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './create-inventory-form.html',
  styleUrls: ['./create-inventory-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateInventoryForm {
  inventoryForm: FormGroup;

  private fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryServiceContract);
  private readonly storeService = inject(StoreServiceContract);
  public dialogRef = inject(MatDialogRef<CreateInventoryForm>);
  public data: CreateInventoryDialogData  = inject(MAT_DIALOG_DATA);

  // Flattened variant options derived from the provided products
  get variantOptions() {
    const products: Product[] = this.data?.products ?? [];
    return products.flatMap(p => (p.variants ?? []).map((v: Partial<VariantEmbedded>) => ({
      id: v.id,
      name: v.variantName,
      sku: v.sku,
      productId: p.id,
      storeId: p.store.id
    }))).filter(opt => !!opt.id && !!opt.storeId);
  }

  constructor() {
    this.inventoryForm = this.fb.group({
      sku: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      metadata: this.fb.array([]),
      variantId: ['', Validators.required],
    });
  }

  get metadataFA(): FormArray { return this.inventoryForm.get('metadata') as FormArray; }

  createKeyValueGroup(): FormGroup {
    return this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required]
    });
  }

  addMetadata(): void { this.metadataFA.push(this.createKeyValueGroup()); }
  removeMetadata(index: number): void { this.metadataFA.removeAt(index); }

  onSubmit() {
    if (this.inventoryForm.invalid) return;
    const partnerId = this.data.partnerId;
    if (!partnerId) return;

    const formValue = this.inventoryForm.getRawValue() as { sku: string; quantity: number; metadata: Metadata[]; variantId: string };
    const payload = this.constructPayload(this.inventoryForm);

    const selectedVariantId = formValue.variantId;
    if (!selectedVariantId) return;

    const selectedVariant = this.variantOptions.find(o => o.id === selectedVariantId);
    if (!selectedVariant || !selectedVariant.storeId || !selectedVariant.productId) return;

    this.inventoryService.create({partnerId, storeId: selectedVariant.storeId}, payload).pipe(
      switchMap(resp => {
        const inventory = resp.data;
        const newInventoryId = inventory.id;
        const body = {
          parentProductIds: {
            partnerId,
            productId: selectedVariant.productId,
            storeId: selectedVariant.storeId
          },
          varAndInvIds: [{ inventoryId: newInventoryId, variantId: selectedVariantId }]
        } satisfies AddVariantsToInvRequestBody;
        return this.inventoryService.addVariantsToInventories(partnerId, body).pipe(
          map(inventoryList => ({ inventory, inventoryList }))
        );
      }),
      switchMap(({ inventory, inventoryList }) => {
        const inventoryIds = inventoryList.data.map(inv => inv.id);
        return this.storeService.addInventoriesToStore({partnerId, storeId: selectedVariant.storeId}, inventoryIds).pipe(
          map(store => ({ inventoryList, store }))
        )
      }),
      map(({ inventoryList, store }) => ({
        inventoryList,
        store
      }))
    ).subscribe(result => {
      this.dialogRef.close(result);
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private constructPayload(formGroup: FormGroup): InventoryDTO {
    const formValue = formGroup.value as InventoryDTO;

    const metadataEntries = (this.metadataFA.value as Metadata[])
      .filter(m => m?.["key"])
      .reduce((acc: any, curr: any) => { acc[curr.key] = curr.value; return acc; }, {} as Record<string, unknown>);
    const metadata = Object.keys(metadataEntries).length ? metadataEntries : undefined;

    return  {
      sku: formValue.sku,
      quantity: formValue.quantity,
      ...(metadata ? { metadata } : {}),
    } satisfies InventoryDTO
  }
}
