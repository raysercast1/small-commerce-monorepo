import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {PricePServiceContract} from '../../../../../api/price/contracts/price-p-service.contract';
import {
  IdentifiersPricePUR,
  Price,
  PriceFormValue,
  PricePUpdateDTO,
  PricePUpdateRequestBody,
} from '../../../shared/types/price-types';
import {Metadata} from '../../../../../shared/types/shared-types';
import {
  createKeyValueGroup,
  disableEditingControls,
  enableEditingControls,
  populateFormFromPrice,
  resetFormToDefaults
} from '../../../shared/utils/form-fields';

export interface EditPricePDialogData {
  value?: Price;
  prices?: Price[];
  partnerId: string | null;
  productId: string;
  variantId?: string | null;
}

@Component({
  selector: 'app-edit-price-p-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './edit-price-p-form.html',
  styleUrls: ['./edit-price-p-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPricePComponent {
  priceForm: FormGroup;
  private fb = new FormBuilder();

  private readonly priceService = inject(PricePServiceContract);
  public dialogRef = inject(MatDialogRef<EditPricePComponent>);
  public data: EditPricePDialogData = inject(MAT_DIALOG_DATA);

  get metadataFA(): FormArray { return this.priceForm.get('metadata') as FormArray; }

  constructor() {
    this.priceForm = this.fb.group({
      selectedPriceId: ['', Validators.required],
      cost: [null as number | null, [Validators.required, Validators.min(0)]],
      price: [null as number | null, [Validators.required, Validators.min(0)]],
      priceOverride: [null as number | null, [Validators.min(0)]],
      metadata: this.fb.array([]),
    });

    this.priceForm.get('selectedPriceId')?.valueChanges.subscribe(priceId => {
      if (priceId) {
        const price = this.data.prices?.find(p => p.id === priceId);
        if (price) {
          populateFormFromPrice(price, this.fb, this.priceForm);
          enableEditingControls(this.priceForm);
        } else {
          resetFormToDefaults(this.priceForm, this.metadataFA);
          disableEditingControls(this.priceForm);
        }
      }
    });

    if (this.data.value?.id) {
      this.priceForm.get('selectedPriceId')?.disable();
      populateFormFromPrice(this.data.value, this.fb, this.priceForm);
      enableEditingControls(this.priceForm);
    } else {
      disableEditingControls(this.priceForm);
    }
  }

  addMetadata(): void { this.metadataFA.push(createKeyValueGroup(this.fb)); }
  removeMetadata(index: number): void { this.metadataFA.removeAt(index); }

  onSubmit() {
    if (!this.priceForm.valid) { return; }

    const partnerId = this.data.partnerId;
    const productId = this.data?.productId;

    if (!partnerId || !productId) { return; }

    const payload = this.constructPayload(this.priceForm.value as PriceFormValue);

    if (!payload) { return; }

    const identifiersPricePUR = 'identifiersPricePUR';
    payload[identifiersPricePUR]['productId'] = productId;
    payload[identifiersPricePUR]['partnerId'] = partnerId;

    this.priceService.updatePriceForProduct(partnerId, payload).subscribe((res) => {
      this.dialogRef.close(res);
    });
  }

  onCancel() { this.dialogRef.close(); }

  private constructPayload(formValue: PriceFormValue): PricePUpdateRequestBody | null {
    const body = {} as PricePUpdateRequestBody;
    const pricePUpdateDTO = 'pricePUpdateDTO';
    const identifiersPricePUR = 'identifiersPricePUR';

    body[pricePUpdateDTO] = {} as PricePUpdateDTO;
    body[identifiersPricePUR] = {} as IdentifiersPricePUR;

    body[pricePUpdateDTO]['cost'] = formValue.cost!;
    body[pricePUpdateDTO]['price'] = formValue.price!;
    body[pricePUpdateDTO]['priceOverride'] = formValue.priceOverride ?? null;

    const variantMetadataEntries = (this.metadataFA.value as Metadata[])
      .filter(m => m?.["key"])
      .reduce((acc: any, curr: any) => { acc[curr.key] = curr.value; return acc; }, {} as Record<string, unknown>);

    body[pricePUpdateDTO]['metadata'] = Object.keys(variantMetadataEntries).length ? variantMetadataEntries : undefined;

    if (this.data.value?.id) {
      body[pricePUpdateDTO]['currency'] = this.data.value.currency;
      body[identifiersPricePUR]['type'] = this.data.value.type;
    } else {
      const priceId = (formValue as PriceFormValue & {selectedPriceId?: string})?.selectedPriceId;
      const price = this.data.prices?.find(p => p.id === priceId);

      if (!price) return null;

      body[pricePUpdateDTO]['currency'] = price.currency;
      body[identifiersPricePUR]['type'] = price.type;
    }

    return body;
  }
}
