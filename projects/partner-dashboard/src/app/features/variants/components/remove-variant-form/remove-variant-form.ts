import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {VariantServiceContract} from '../../../../api/variant/contracts/variant-service.contract';
import {Variant} from '../../../../shared/types/shared-types';
import {RemoveVariantDialogData} from '../../types/variant-types';

@Component({
  selector: 'app-remove-variant-form',
  standalone: true,
  templateUrl: './remove-variant-form.html',
  styleUrls: ['./remove-variant-form.css'],
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoveVariantForm implements OnInit {
  private readonly variantService = inject(VariantServiceContract);
  public dialogRef = inject(MatDialogRef<RemoveVariantForm>);
  public data: RemoveVariantDialogData = inject(MAT_DIALOG_DATA);

  variants: Variant[] | undefined;
  selectedVariant: Variant | undefined;

  ngOnInit(): void {
    this.variants = this.data.variants;
    if (this.data.variant) {
      this.selectedVariant = this.data.variant;
    }
  }

  onVariantSelectionChange(variantId: string): void {
    this.selectedVariant = this.variants?.find(v => v.id === variantId);
  }

  onConfirm(): void {
    const partnerId = this.data.partnerId;
    const productId = this.data.productId;
    const variantId = this.selectedVariant?.id;

    if (!partnerId || !variantId) {
      return; //TODO: Notify missing partnerId, productId, or variantId.
    }

    this.variantService.deleteProductVariant({partnerId, productId, variantId}).subscribe(result => {
      this.dialogRef.close({ response: result, variantId });
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
