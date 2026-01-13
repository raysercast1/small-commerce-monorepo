import { Component, inject, OnInit, Signal } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import {Store} from '../../../../shared/types/shared-types';
import {StoreServiceContract} from '../../../../api/store/contracts/store-service.contract';

@Component({
  selector: 'app-remove-store-form',
  templateUrl: './remove-store-form.html',
  styleUrls: ['./remove-store-form.css'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule, CommonModule]
})
export class RemoveStoreForm implements OnInit {
  private storeService = inject(StoreServiceContract);
  public dialogRef = inject(MatDialogRef<RemoveStoreForm>);
  public data: { partnerId: Signal<string | null>, store?: Store, stores?: Store[] } = inject(MAT_DIALOG_DATA);

  stores: Store[] | undefined;
  selectedStore: Store | undefined;

  ngOnInit(): void {
    this.stores = this.data.stores;
    if (this.data.store) {
      this.selectedStore = this.data.store;
    }
  }

  onStoreSelectionChange(storeId: string): void {
    this.selectedStore = this.stores?.find(s => s.id === storeId);
  }

  onConfirm(): void {
    const partnerId = this.data.partnerId();
    const storeId = this.selectedStore?.id;

    if (!storeId || !partnerId) {
      return; //TODO: Notify missing storeId and partnerId.
    }

    this.storeService.deleteStore({storeId, partnerId}).subscribe(result => {
      this.dialogRef.close({ response: result, storeId });
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
