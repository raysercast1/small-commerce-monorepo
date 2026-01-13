import {Component, ChangeDetectionStrategy, inject} from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {Inventory} from '../../types/inventory-types';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-info-inventory-form',
  standalone: true,
  imports: [CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule],
  templateUrl: './info-inventory-form.html',
  styleUrls: ['./info-inventory-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoInventoryForm {
  public dialogRef = inject(MatDialogRef<InfoInventoryForm>);
  public data: { inventory: Inventory } = inject(MAT_DIALOG_DATA);

  onClose(): void {
    this.dialogRef.close();
  }
}
