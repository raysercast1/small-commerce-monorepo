import {ChangeDetectionStrategy, Component, inject, Signal} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {switchMap, map} from 'rxjs/operators';
import {ProductServiceContract} from '../../../../api/product/contracts/product-service.contract';
import {Store} from '../../../../shared/types/shared-types';
import {StoreServiceContract} from '../../../../api/store/contracts/store-service.contract';

@Component({
  selector: 'app-create-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './create-product-form.html',
  styleUrls: ['./create-product-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateProductForm {
  productForm: FormGroup;

  private fb = inject(FormBuilder);
  private productService = inject(ProductServiceContract);
  private storeService = inject(StoreServiceContract);
  public dialogRef = inject(MatDialogRef<CreateProductForm>);
  public data: { partnerId: Signal<string | null>, stores: Store[] } = inject(MAT_DIALOG_DATA);

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern("^[a-zA-Z\\s\\u00C0-\\u017F]*$")]],
      description: ['', Validators.required],
      brand: [''],
      metadata: [''],
      sku: [''],
      storeId: ['', Validators.required]
    });
  }

  onSubmit() {
    if (!this.productForm.valid) {
      return;
    }

    const { storeId, ...productValue } = this.productForm.value;
    const partnerId = this.data.partnerId();

    if (!partnerId || !storeId) {
      return;
    }

    const productData = {
        ...productValue,
        partnerId,
        metadata: JSON.stringify({})
      }

    this.productService.createProduct({partnerId, storeId}, productData).pipe(
      switchMap(response => {
        const newProduct = response.data;
        return this.storeService.addProductsToStore({partnerId, storeId}, [newProduct.id]).pipe(
          map(associationResult => ({ newProduct, associationResult }))
        );
      }),
      switchMap(({ newProduct, associationResult }) => {
        return this.productService.assignProductToDefaultCategory({partnerId, productId: newProduct.id}).pipe(
          map(categoryResult => ({ newProduct, categoryResult }))
        );
      }),
      map(({ newProduct, categoryResult }) => ({
        ...newProduct,
        storeId: storeId,
        categoryId: 'universal-category-placeholder'
      }))
    ).subscribe(enrichedProduct => {
      this.dialogRef.close(enrichedProduct);
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
