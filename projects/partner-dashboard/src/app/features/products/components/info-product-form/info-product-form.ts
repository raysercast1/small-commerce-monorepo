import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import {Product} from '../../../../shared/types/shared-types';

@Component({
  selector: 'app-info-product-dialog',
  templateUrl: './info-product-form.html',
  styleUrls: ['./info-product-form.css'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    CommonModule,
    CurrencyFormatPipe,
    DateFormatPipe,
    NgOptimizedImage
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoProductDialog {
  public data: { product: Product } = inject(MAT_DIALOG_DATA);
  public dialogRef = inject(MatDialogRef<InfoProductDialog>);

  onClose(): void {
    this.dialogRef.close();
  }
}
