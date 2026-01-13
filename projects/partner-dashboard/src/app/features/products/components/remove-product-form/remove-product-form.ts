import {ChangeDetectionStrategy, Component, inject, OnInit, Signal} from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import {ProductServiceContract} from '../../../../api/product/contracts/product-service.contract';
import {Product} from '../../../../shared/types/shared-types';

@Component({
  selector: 'app-remove-product-form',
  templateUrl: './remove-product-form.html',
  styleUrls: ['./remove-product-form.css'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoveProductForm implements OnInit {
  private productService = inject(ProductServiceContract);
  public dialogRef = inject(MatDialogRef<RemoveProductForm>);
  public data: { partnerId: Signal<string | null>, storeId: string, product?: Product, products?: Product[] } = inject(MAT_DIALOG_DATA);

  products: Product[] | undefined;
  selectedProduct: Product | undefined;

  ngOnInit(): void {
    this.products = this.data.products;
    if (this.data.product) {
      this.selectedProduct = this.data.product;
    }
  }

  onProductSelectionChange(productId: string): void {
    this.selectedProduct = this.products?.find(p => p.id === productId);
  }

  onConfirm(): void {
    let storeId: string | undefined = this.data.storeId;
    if (!storeId) {
      storeId = this.selectedProduct?.store?.id;
    }

    const partnerId = this.data.partnerId();
    const productId = this.selectedProduct?.id;
    if (!productId || !partnerId || !storeId) {
      return; //TODO: Notify missing productId, partnerId and storeId.
    }

    this.productService.deleteProduct({productId, partnerId, storeId}).subscribe(result => {
      this.dialogRef.close({ response: result, productId });
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
