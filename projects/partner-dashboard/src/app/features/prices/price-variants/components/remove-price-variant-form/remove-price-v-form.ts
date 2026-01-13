import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {Price, PriceType} from '../../../shared/types/price-types';
import {PriceVServiceContract} from '../../../../../api/price/contracts/price-v-service.contract';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';

export interface RemovePriceVDialogData {
  partnerId: string | null;
  productId: string;
  type?: PriceType;
  variantId: string;
  prices?: Price[];
}

@Component({
  selector: 'app-remove-price-v-form',
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
  templateUrl: './remove-price-v-form.html',
  styleUrls: ['./remove-price-v-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemovePriceVComponent implements OnInit {
  private readonly priceService = inject(PriceVServiceContract);
  public dialogRef = inject(MatDialogRef<RemovePriceVComponent>);
  public data: RemovePriceVDialogData = inject(MAT_DIALOG_DATA);

  prices: Price[] | undefined;
  selectedPriceType: PriceType | undefined;

  ngOnInit(): void {
    this.prices = this.data?.prices;
    if (this.data?.type) {
      this.selectedPriceType = this.data.type;
    }
  }

  onPriceTypeSelectionChange(priceType: PriceType) {
    this.selectedPriceType = this.prices?.find(p => p.type === priceType)?.type;
  }

  onConfirm() {
    const { partnerId, productId, variantId } = this.data || {} as RemovePriceVDialogData;
    const type = this.selectedPriceType;

    if (!partnerId || !productId || !variantId || !type) { return; }

    this.priceService.deletePriceForVariant(variantId, productId, partnerId, type).subscribe(res => {
      this.dialogRef.close({ response: res, id: variantId, productId, type });
    });
  }

  onCancel() { this.dialogRef.close(); }
}
