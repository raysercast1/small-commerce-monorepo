import { Component, inject, OnInit, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {Store} from '../../../../shared/types/shared-types';
import {StoreServiceContract} from '../../../../api/store/contracts/store-service.contract';
import {StoreDTO} from '../../types/store-types';

@Component({
  selector: 'app-edit-store-form',
  templateUrl: './edit-store-form.html',
  styleUrls: ['./edit-store-form.css'],
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
  ]
})
export class EditStoreForm implements OnInit {
  storeForm: FormGroup;
  stores: Store[] | undefined;
  selectedStore: Store | undefined;

  private fb = inject(FormBuilder);
  private storeService = inject(StoreServiceContract);
  public dialogRef = inject(MatDialogRef<EditStoreForm>);
  public data: { partnerId: Signal<string | null>, store?: Store, stores?: Store[] } = inject(MAT_DIALOG_DATA);

  constructor() {
    this.storeForm = this.fb.group({
      storeSelection: [''],
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.stores = this.data.stores;
    if (this.data.store) {
      this.selectedStore = this.data.store;
      this.storeForm.patchValue(this.data.store);
    } else if (this.stores) {
      this.storeForm.get('name')?.disable();
      this.storeForm.get('slug')?.disable();
      this.storeForm.get('description')?.disable();
    }
  }

  onStoreSelectionChange(storeId: string): void {
    this.selectedStore = this.stores?.find(s => s.id === storeId);
    if (this.selectedStore) {
      this.storeForm.patchValue(this.selectedStore);
      this.storeForm.get('name')?.enable();
      this.storeForm.get('slug')?.enable();
      this.storeForm.get('description')?.enable();
    }
  }

  onSubmit() {
    if (!this.storeForm.valid) {
      return; //TODO: Notify invalid form.
    }

    const partnerId = this.data.partnerId();
    if (!partnerId || !this.selectedStore) {
      return; //TODO: Notify missing partnerId and selectedStore.
    }

    const storeSelected = {
      metadata: this.selectedStore?.metadata,
      settings: this.selectedStore.settings,
      ...this.storeForm.value} satisfies StoreDTO

    this.storeService.updateStore({storeId: this.selectedStore.id, partnerId}, storeSelected).subscribe(result => {
      this.dialogRef.close(result);
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
