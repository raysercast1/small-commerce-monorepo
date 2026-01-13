import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {PriceFormValue} from '../../../shared/types/price-types';

export interface InfoPricePDialogData {
  value: Partial<PriceFormValue>;
  productId: string;
}

@Component({
  selector: 'app-info-price-p-form',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
  ],
  templateUrl: './info-price-p-form.html',
  styleUrls: ['./info-price-p-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoPricePComponent {
  public dialogRef = inject(MatDialogRef<InfoPricePComponent>);
  public data: InfoPricePDialogData = inject(MAT_DIALOG_DATA);

  onClose(): void {
    this.dialogRef.close();
  }
}
