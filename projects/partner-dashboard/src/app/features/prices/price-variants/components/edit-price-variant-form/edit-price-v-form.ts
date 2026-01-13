import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  IdentifiersPriceVUR,
  Price,
  PriceFormValue, PriceVUpdateR,
  PriceVUpdateRequestBody
} from '../../../shared/types/price-types';
import {PriceVServiceContract} from '../../../../../api/price/contracts/price-v-service.contract';
import {
  createKeyValueGroup,
  disableEditingControls,
  enableEditingControls,
  populateFormFromPrice,
  resetFormToDefaults
} from '../../../shared/utils/form-fields';
import {Metadata} from '../../../../../shared/types/shared-types';

export interface EditPriceVDialogData {
  value?: Price;
  prices?: Price[];
  partnerId: string;
  productId: string;
  variantId: string;
}

@Component({
  selector: 'app-edit-price-v-form',
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
  templateUrl: './edit-price-v-form.html',
  styleUrls: ['./edit-price-v-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPriceVComponent {
  priceForm: FormGroup;
  private fb = new FormBuilder();

  private readonly priceService = inject(PriceVServiceContract);
  public dialogRef = inject(MatDialogRef<EditPriceVComponent>);
  public data: EditPriceVDialogData = inject(MAT_DIALOG_DATA);

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

    const formValue = this.priceForm.value as PriceFormValue;
    const partnerId = this.data.partnerId;
    const productId = this.data?.productId;
    const variantId = this.data?.variantId;

    if (!partnerId || !productId || !variantId) { return; }

    const payload = this.constructPayload(formValue);

    if (!payload) { return; }

    const identifiersPVUR = 'identifiersPVUR';
    payload[identifiersPVUR]['partnerId'] = partnerId;
    payload[identifiersPVUR]['productId'] = productId;
    payload[identifiersPVUR]['variantId'] = variantId;

    this.priceService.updatePriceForVariant(partnerId, payload).subscribe((res) => {
      this.dialogRef.close(res);
    });
  }

  onCancel() { this.dialogRef.close(); }

  private constructPayload(formValue: PriceFormValue): PriceVUpdateRequestBody | null {
    const body = {} as PriceVUpdateRequestBody;
    const priceVUpdateR = 'priceVUpdateR';
    const identifiersPVUR = 'identifiersPVUR';

    body[priceVUpdateR] = {} as PriceVUpdateR;
    body[identifiersPVUR] = {} as IdentifiersPriceVUR;

    body[priceVUpdateR]['cost'] = formValue.cost!;
    body[priceVUpdateR]['price'] = formValue.price!;
    body[priceVUpdateR]['priceOverride'] = formValue.priceOverride ?? null;

    const variantMetadataEntries = (this.metadataFA.value as Metadata[])
      .filter(m => m?.["key"])
      .reduce((acc: any, curr: any) => { acc[curr.key] = curr.value; return acc; }, {} as Record<string, unknown>);

    body[priceVUpdateR]['metadata'] = Object.keys(variantMetadataEntries).length ? variantMetadataEntries : undefined;

    if (this.data.value?.id) {
      body[identifiersPVUR]['type'] = this.data.value.type;
    } else {
      const priceId = (formValue as PriceFormValue & {selectedPriceId?: string})?.selectedPriceId;
      const price = this.data.prices?.find(p => p.id === priceId);

      if (!price) return null;

      body[identifiersPVUR]['type'] = price.type;
    }

    return body;
  }
}
