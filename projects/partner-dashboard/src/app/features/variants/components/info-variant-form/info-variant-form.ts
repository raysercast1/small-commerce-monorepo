import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {Variant} from '../../../../shared/types/shared-types';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  selector: 'app-info-variant-dialog',
  standalone: true,
  templateUrl: './info-variant-form.html',
  styleUrls: ['./info-variant-form.css'],
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatDividerModule,
    NgOptimizedImage
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoVariantDialog {
  public dialogRef = inject(MatDialogRef<InfoVariantDialog>);
  public data: { variant: Variant } = inject(MAT_DIALOG_DATA);

  onClose(): void {
    this.dialogRef.close();
  }
}
