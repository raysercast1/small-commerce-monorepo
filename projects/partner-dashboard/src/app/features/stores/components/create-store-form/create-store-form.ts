import { Component, inject, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {StoreServiceContract} from '../../../../api/store/contracts/store-service.contract';

@Component({
  selector: 'app-create-store-form',
  templateUrl: './create-store-form.html',
  styleUrls: ['./create-store-form.css'],
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
export class CreateStoreForm {
  storeForm: FormGroup;
  currencies = ['USD', 'CAD', 'EUR', 'COP', 'VEF', 'MXN', 'ARS', 'BRL', 'CLP', 'UYU', 'PYG', 'PEN', 'BOB'];
  locales = [
    'CANADA_EN',
    'CANADA_FR',
    'USA_EN',
    'MEXICO_ES',
    'COLOMBIA_ES',
    'VENEZUELA_ES',
    'PERU_ES',
    'SPAIN_ES',
    'ARGENTINA_ES',
    'URUGUAY_ES',
    'PARAGUAY_ES',
    'CHILE_ES',
    'BRAZIL_PT'];

  private fb = inject(FormBuilder);
  private storeService = inject(StoreServiceContract);
  public dialogRef = inject(MatDialogRef<CreateStoreForm>);
  public data: { partnerId: Signal<string | null> } = inject(MAT_DIALOG_DATA);

  constructor() {
    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: [''],
      domain: ['', Validators.required],
      currency: ['', Validators.required],
      locale: ['', Validators.required]
    });
  }

  onSubmit() {
    if (!this.storeForm.valid) {
      return; //TODO: Notify invalid form.
    }

    const partnerId = this.data.partnerId();
    if (!partnerId) {
      return; //TODO: Notify missing partnerId.
    }

    const storeData = {
      ...this.storeForm.value,
      settings: JSON.stringify({ //TODO: This should be a StoreSetting in the UI.
        themeConfig: {},
        mainColor: '#000000'
      }),
      metadata: JSON.stringify({})
    };

    this.storeService.createStore(partnerId, storeData).subscribe(result => {
      this.dialogRef.close(result);
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
