import {ChangeDetectionStrategy, Component, inject, OnInit, signal, Signal, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {ProductServiceContract} from '../../../../api/product/contracts/product-service.contract';
import {Product} from '../../../../shared/types/shared-types';
import {ImageManagementPage} from '../../../image/pages/image-management-page/image-management-page';
import {ImageServiceContract} from '../../../../api/image/contracts/image-service.contract';
import {AssignImageToProductsParams} from '../../../image/types/image-types';
import {catchError, defer, finalize, Observable, of, take} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-edit-product-form',
  templateUrl: './edit-product-form.html',
  styleUrls: ['./edit-product-form.css'],
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
    ImageManagementPage,
    MatProgressSpinner
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditProductForm implements OnInit {
  productForm: FormGroup;
  products: Product[] | undefined;
  selectedProduct?: Product | null;

  @ViewChild(ImageManagementPage) imageManagementPage?: ImageManagementPage;

  readonly submitting = signal(false);

  private fb = inject(FormBuilder);
  private productService = inject(ProductServiceContract);
  private imageService = inject(ImageServiceContract);
  public dialogRef = inject(MatDialogRef<EditProductForm>);
  public data: { partnerId: Signal<string | null>, product?: Product, products?: Product[] } = inject(MAT_DIALOG_DATA);

  constructor() {
    this.productForm = this.fb.group({
      productSelection: [''],
      name: ['', [Validators.required, Validators.pattern("^[a-zA-Z\\s\\u00C0-\\u017F]*$")]],
      description: ['', Validators.required],
      brand: [''],
      images: [[], Validators.required],
      metadata: ['']
    });
  }

  ngOnInit(): void {
    this.products = this.data.products;
    if (this.data.product) {
      this.selectedProduct = this.data.product;
      this.productForm.patchValue(this.data.product);
    } else if (this.products) {
      // Disable fields until a selection is made
      this.productForm.get('name')?.disable();
      this.productForm.get('description')?.disable();
      this.productForm.get('brand')?.disable();
      this.productForm.get('images')?.disable();
    }
  }

  onProductSelectionChange(productId: string): void {
    this.selectedProduct = this.products?.find(p => p.id === productId);
    if (this.selectedProduct) {
      this.productForm.patchValue(this.selectedProduct);
      this.productForm.get('name')?.enable();
      this.productForm.get('description')?.enable();
      this.productForm.get('brand')?.enable();
      this.productForm.get('images')?.enable();
    }
  }

  onSubmit() {
    if (this.submitting() || !this.productForm.valid) {
      console.log("Skipping submit due to invalid form or submitting state")
      return;
    }

    this.submitting.set(true);

    const partnerId = this.data.partnerId();
    if (!partnerId || !this.selectedProduct) {
      this.submitting.set(false);
      return; //TODO: Notify missing partnerId and selectedProduct.
    }

    const storeId = this.getStoreIdFromProduct(this.selectedProduct);
    if (!storeId) {
      this.submitting.set(false);
      console.warn("Canceling submit without changes due to missing storeId.")
      return;
    }

    const uploadAndAssign$: Observable<unknown> = defer(() => {
      if (!this.imageManagementPage) {
        return of(null);
      }

      return this.imageManagementPage.triggerUpload().pipe(
        take(1),
        map((imageIds) => Array.isArray(imageIds) ? imageIds : []),
        switchMap((imageIds) => {
          if (imageIds.length === 0) {
            console.log("Skipping image uploading missing images array")
            return of(null);
          }

          const assignImagesToProductParams: AssignImageToProductsParams = {
            imageIds,
            productId: this.selectedProduct!.id,
            storeId,
          };

          return this.imageService.assignImagesToProduct(partnerId, assignImagesToProductParams);
        })
      );
    });

    uploadAndAssign$.pipe(
      switchMap((assignResult) => {
        if (!this.productForm.dirty) {
          console.warn("Closing dialog without changes after image assignment")
          this.dialogRef.close(assignResult);
          return of(null);
        }

        const product = this.productForm.getRawValue() as Product;
        return this.productService
          .updateProduct({partnerId, storeId, productId: this.selectedProduct!.id}, product)
          .pipe(map(updateResult => ({ assignResult, updateResult })));
      }),
      catchError((error) => {
        console.error("Submit pipeline failed:", error);

        if (!this.productForm.dirty) {
          this.dialogRef.close();
          console.log("Closing dialog without changes after product update")
        }

        // Keep dialog open when dirty so the user can fix/retry:
        return of(null);

        // If you prefer to fail hard and show error state, use:
        // return throwError(() => error);
      }),
      finalize(() => {
        this.submitting.set(false);
      })
    ).subscribe((result) => {
      if (result?.updateResult) {
        console.log("Image and Edit Product - Succeed")
        this.dialogRef.close(result.updateResult);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private getStoreIdFromProduct(product: Product): string | undefined {
    return product?.store?.id;
  }
}
