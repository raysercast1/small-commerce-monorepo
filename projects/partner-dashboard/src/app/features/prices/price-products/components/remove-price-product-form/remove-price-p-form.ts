import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PricePServiceContract } from '../../../../../api/price/contracts/price-p-service.contract';
import {Price, PriceType} from '../../../shared/types/price-types';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';

export interface RemovePricePDialogData {
  partnerId: string | null;
  productId: string;
  type?: PriceType;
  prices?: Price[]
}

@Component({
  selector: 'app-remove-price-p-form',
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
  templateUrl: './remove-price-p-form.html',
  styleUrls: ['./remove-price-p-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemovePricePComponent implements OnInit {
  private readonly priceService = inject(PricePServiceContract);
  public dialogRef = inject(MatDialogRef<RemovePricePComponent>);
  public data: RemovePricePDialogData = inject(MAT_DIALOG_DATA);

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
    const { partnerId, productId } = this.data || {} as RemovePricePDialogData;
    const type = this.selectedPriceType;

    if (!partnerId || !productId || !type) { return; }

    this.priceService.deletePriceForProduct(productId, partnerId, type).subscribe(res => {
      this.dialogRef.close({ response: res, id: productId, type });
    });

  }

  onCancel() { this.dialogRef.close(); }
}
