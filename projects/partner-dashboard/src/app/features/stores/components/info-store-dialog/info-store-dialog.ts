import { Component, inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {Store} from '../../../../shared/types/shared-types';

@Component({
  selector: 'app-info-store-dialog',
  templateUrl: './info-store-dialog.html',
  styleUrls: ['./info-store-dialog.css'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class InfoStoreDialog {
  public data: { store: Store } = inject(MAT_DIALOG_DATA);
  public dialogRef = inject(MatDialogRef<InfoStoreDialog>);

  onClose(): void {
    this.dialogRef.close();
  }
}
