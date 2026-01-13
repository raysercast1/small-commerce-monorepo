
import {Component, ChangeDetectionStrategy, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {DeleteInventoryDialogData, Inventory} from '../../types/inventory-types';
import {InventoryServiceContract} from '../../../../api/inventory/contracts/inventory-service.contract';
import {findVariantStore} from '../../helpers/inventory-helpers';

@Component({
  selector: 'app-remove-inventory-form',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './remove-inventory-form.html',
  styleUrls: ['./remove-inventory-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoveInventoryForm implements OnInit {
  private readonly inventoryService = inject(InventoryServiceContract)
  public dialogRef = inject(MatDialogRef<RemoveInventoryForm>);
  public data: DeleteInventoryDialogData = inject(MAT_DIALOG_DATA);

  inventories: Inventory[] | undefined;
  selectedInventory: Inventory | undefined;

  ngOnInit(): void {
    this.inventories = this.data.inventories;
    if (this.data.inventory) {
      this.selectedInventory = this.data.inventory;
    }
  }

  onInventorySelectionChange(inventoryId: string): void {
    this.selectedInventory = this.inventories?.find(inv => inv.id === inventoryId);
  }

  onConfirm() {
    const partnerId = this.data.partnerId;
    const inventoryId = this.selectedInventory?.id;
    if (!inventoryId || !partnerId) {
      return; //TODO: Notify missing inventoryId and partnerId.
    }
    const storeId = findVariantStore({
      products: this.data.products, inventory: this.data.inventory, inventories: this.data.inventories, inventoryId});

    if (!storeId) {
      return; //TODO: Notify missing storeId.
    }

    this.inventoryService.delete({partnerId, inventoryId, storeId}).subscribe(response => {
      this.dialogRef.close({response, inventoryId});
    })
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
