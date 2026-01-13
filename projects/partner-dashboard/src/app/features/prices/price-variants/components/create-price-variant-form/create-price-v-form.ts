import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  IdentifiersPriceVCR,
  PriceFormValue,
  PriceType, PriceVCreateR,
  PriceVCreationRequestBody
} from '../../../shared/types/price-types';
import {PriceVServiceContract} from '../../../../../api/price/contracts/price-v-service.contract';
import {createKeyValueGroup} from '../../../shared/utils/form-fields';
import {Metadata, PriceEmbedded} from '../../../../../shared/types/shared-types';

export interface CreatePriceVDialogData {
  parentPrices: PriceEmbedded[];
  partnerId: string;
  productId: string;
  variantId: string;
  storeId: string;
}

@Component({
  selector: 'app-create-price-v-form',
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
  templateUrl: './create-price-v-form.html',
  styleUrls: ['./create-price-v-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePriceVComponent {
  priceForm: FormGroup;

  private fb = new FormBuilder();
  private readonly priceService = inject(PriceVServiceContract);
  public dialogRef = inject(MatDialogRef<CreatePriceVComponent>);
  public data: CreatePriceVDialogData = inject(MAT_DIALOG_DATA);

  get metadataFA(): FormArray { return this.priceForm.get('metadata') as FormArray; }

  constructor() {
    this.priceForm = this.fb.group({
      cost: [null as number | null, [Validators.required, Validators.min(0)]],
      price: [null as number | null, [Validators.required, Validators.min(0)]],
      priceOverride: [null as number | null, [Validators.min(0)]],
      type: [null as PriceType | null, Validators.required],
      productPriceTypeSelected: [null as PriceType | null, Validators.required],
      metadata: this.fb.array([]),
    });
  }

  addMetadata(): void { this.metadataFA.push(createKeyValueGroup(this.fb)); }
  removeMetadata(index: number): void { this.metadataFA.removeAt(index); }

  onSubmit() {
    if (!this.priceForm.valid) {
      return;
    }

    const formValue = this.priceForm.value as PriceFormValue & {productPriceTypeSelected: PriceType};
    const productId = this.data?.productId;
    const variantId = this.data?.variantId;
    const storeId = this.data?.storeId;
    const partnerId = this.data?.partnerId

    if (!productId || !variantId || !storeId || !partnerId) { return; }

    const parentPriceType = this.findParentPriceType(this.data.parentPrices, formValue.productPriceTypeSelected);
    if (!parentPriceType) { return; } //ProductType is required in the endpoint.

    const payload = this.constructPayload(formValue);

    const identifiers = 'identifiers';
    payload[identifiers] = {} as IdentifiersPriceVCR;
    payload[identifiers]['type'] = parentPriceType;
    payload[identifiers]['productId'] = productId;
    payload[identifiers]['variantId'] = variantId;
    payload[identifiers]['storeId'] = storeId;
    payload[identifiers]['partnerId'] = partnerId;

    this.priceService.createPriceForVariant(partnerId, payload).subscribe((res) => {
      this.dialogRef.close(res);
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  private constructPayload(formValue: PriceFormValue): PriceVCreationRequestBody {
    const body = {} as PriceVCreationRequestBody;
    const priceVCreateR = 'priceVCreateR';

    body[priceVCreateR] = {} as PriceVCreateR;
    body[priceVCreateR]['cost'] = formValue.cost!;
    body[priceVCreateR]['price'] = formValue.price!;
    body[priceVCreateR]['priceOverride'] = formValue?.priceOverride ?? null;
    body[priceVCreateR]['type'] = formValue.type!;

    const variantMetadataEntries = (this.metadataFA.value as Metadata[])
      .filter(m => m?.["key"])
      .reduce((acc: any, curr: any) => { acc[curr.key] = curr.value; return acc; }, {} as Record<string, unknown>);
    body[priceVCreateR]['metadata'] = Object.keys(variantMetadataEntries).length ? variantMetadataEntries : undefined;

    return body;
  }

  private findParentPriceType(parentPrices: PriceEmbedded[], productPriceTypeSelected: PriceType): PriceType | null {
    for (const price of parentPrices) {
      if (price.type === productPriceTypeSelected) {
        return price.type;
      }
    }
    return null;
  }
}
