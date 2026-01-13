import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PricePServiceContract } from '../../../../../api/price/contracts/price-p-service.contract';
import {
  Currency, IdentifiersPricePCR,
  PriceFormValue, PricePCreateDTO,
  PricePCreationRequestBody,
  PriceType,
} from '../../../shared/types/price-types';
import {createKeyValueGroup} from '../../../shared/utils/form-fields';
import {Metadata} from '../../../../../shared/types/shared-types';

export interface CreatePricePDialogData {
  partnerId: string | null;
  productId: string;
  storeId?: string;
}

@Component({
  selector: 'app-create-price-p-form',
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
  templateUrl: './create-price-p-form.html',
  styleUrls: ['./create-price-p-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePricePComponent {
  priceForm: FormGroup;

  private fb = new FormBuilder();
  private readonly priceService = inject(PricePServiceContract);
  public dialogRef = inject(MatDialogRef<CreatePricePComponent>);
  public data: CreatePricePDialogData = inject(MAT_DIALOG_DATA);


  get metadataFA(): FormArray { return this.priceForm.get('metadata') as FormArray; }

  constructor() {
    this.priceForm = this.fb.group({
      cost: [null as number | null, [Validators.required, Validators.min(0)]],
      price: [null as number | null, [Validators.required, Validators.min(0)]],
      priceOverride: [null as number | null, [Validators.min(0)]],
      currency: [null as Currency| null, [Validators.required]],
      type: [null as PriceType | null, [Validators.required]],
      metadata: this.fb.array([]),
    });
  }

  addMetadata(): void { this.metadataFA.push(createKeyValueGroup(this.fb)); }
  removeMetadata(index: number): void { this.metadataFA.removeAt(index); }

  onSubmit() {
    if (!this.priceForm.valid) {
      return;
    }

    const formValue = this.priceForm.value as PriceFormValue;
    const productId = this.data?.productId;
    const currency = formValue.currency ;

    const partnerId = this.data?.partnerId
    const storeId = this.data?.storeId;

    if (!formValue.type || !productId || !currency || !partnerId || !storeId) { return; }

    const payload = this.constructPayload(formValue);

    const priceDTO = 'priceDTO';
    payload[priceDTO]['type'] = formValue.type;
    payload[priceDTO]['currency'] = currency;

    const identifiers = 'identifiers';
    payload[identifiers] = {} as IdentifiersPricePCR
    payload[identifiers]['productId'] = productId;
    payload[identifiers]['storeId'] = storeId;
    payload[identifiers]['partnerId'] = partnerId;

    this.priceService.createPriceForProduct(partnerId, payload).subscribe((res) => {
      this.dialogRef.close(res);
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  private constructPayload(formValue: PriceFormValue): PricePCreationRequestBody {
    const body = {} as PricePCreationRequestBody;
    const priceDTO = 'priceDTO';
    body[priceDTO] = {} as PricePCreateDTO;

    body[priceDTO]['cost'] = formValue.cost!;
    body[priceDTO]['price'] = formValue.price!;
    body[priceDTO]['priceOverride'] = formValue?.priceOverride ?? null;

    const variantMetadataEntries = (this.metadataFA.value as Metadata[])
      .filter(m => m?.["key"])
      .reduce((acc: any, curr: any) => { acc[curr.key] = curr.value; return acc; }, {} as Record<string, unknown>);
    body[priceDTO]['metadata'] = Object.keys(variantMetadataEntries).length ? variantMetadataEntries : undefined;

    return body;
  }
}

