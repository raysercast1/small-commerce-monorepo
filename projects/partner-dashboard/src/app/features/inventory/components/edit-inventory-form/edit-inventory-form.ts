import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { InventoryServiceContract } from '../../../../api/inventory/contracts/inventory-service.contract';
import {Inventory, InventoryUpdateDTO, UpdateInventoryDialogData} from '../../types/inventory-types';
import {findVariantStore} from '../../helpers/inventory-helpers';

@Component({
  selector: 'app-edit-inventory-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './edit-inventory-form.html',
  styleUrls: ['./edit-inventory-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditInventoryForm {
  inventoryForm: FormGroup;

  private fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryServiceContract);
  public dialogRef = inject(MatDialogRef<EditInventoryForm>);
  public data: UpdateInventoryDialogData = inject(MAT_DIALOG_DATA);

  constructor() {
    this.inventoryForm = this.fb.group({
      selectedInventoryId: [''],
      sku: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      reservedQuantity: [0, [Validators.min(0)]],
      metadata: ['']
    });

    this.inventoryForm.get('selectedInventoryId')?.valueChanges.subscribe(invId => {
      if (invId) {
        const inventory = this.data.inventories?.find(inv => inv.id === invId);
        if (inventory) {
          this.populateFormFromInventory(inventory);
          this.enableEditingControls();
        } else {
          this.resetFormToDefaults();
          this.disableEditingControls();
        }
      }
    });

    if (this.data.inventory?.id) {
      this.inventoryForm.get('selectedInventoryId')?.disable();
      this.populateFormFromInventory(this.data.inventory);
      this.enableEditingControls();
    } else {
      this.disableEditingControls();
    }
  }

  onSubmit() {
    if (this.inventoryForm.invalid) return;

    const selectedInventoryId = this.inventoryForm.value.selectedInventoryId;
    const partnerId = this.data.partnerId;

    const inventoryId = selectedInventoryId ? selectedInventoryId : this.data.inventory?.id;
    if (!partnerId || !inventoryId) return;

    const storeId = findVariantStore({
      products: this.data.products, inventory: this.data.inventory, inventories: this.data.inventories, inventoryId});

    if (!storeId) return;

    const payload = this.constructPayload(this.inventoryForm);
    this.inventoryService.update({partnerId, storeId, inventoryId}, payload).subscribe(response => {
      this.dialogRef.close(response);
    })
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private populateFormFromInventory(inv: Inventory) {
    this.inventoryForm.patchValue({
      sku: inv.sku ?? '',
      quantity: inv.quantity ?? 0,
      metadata: inv.metadata ?? ''
    }, { emitEvent: false });
  }

  private enableEditingControls(): void {
    Object.keys(this.inventoryForm.controls).forEach(key => {
      if (key !== 'selectedInventoryId') { this.inventoryForm.controls[key].enable(); }
    });
  }

  private disableEditingControls(): void {
    Object.keys(this.inventoryForm.controls).forEach(key => {
      if (key !== 'selectedInventoryId') { this.inventoryForm.controls[key].disable(); }
    });
  }

  private resetFormToDefaults(): void {
    this.inventoryForm.patchValue({
      sku: '',
      quantity: 0,
      metadata: '',
    })
  }

  private constructPayload(formGroup: FormGroup): InventoryUpdateDTO {
    const { sku, quantity, metadata } = formGroup.value as InventoryUpdateDTO;
    return  {
      sku,
      quantity,
      reservedQuantity: 0, // Temporary flag to disable reserved quantity update for now.
      metadata: metadata ?? {}
    };
  }
}
