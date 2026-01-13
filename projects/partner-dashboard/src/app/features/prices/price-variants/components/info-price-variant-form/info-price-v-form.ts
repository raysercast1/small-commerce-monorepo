import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {PriceFormValue} from '../../../shared/types/price-types';

export interface InfoPriceVDialogData {
  value: Partial<PriceFormValue>;
  variantId: string;
  productId: string;
}

@Component({
  selector: 'app-info-price-v-form',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
  ],
  templateUrl: './info-price-v-form.html',
  styleUrls: ['./info-price-v-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoPriceVComponent {
  public dialogRef = inject(MatDialogRef<InfoPriceVComponent>);
  public data: InfoPriceVDialogData = inject(MAT_DIALOG_DATA);

  onClose(): void {
    this.dialogRef.close();
  }
}
