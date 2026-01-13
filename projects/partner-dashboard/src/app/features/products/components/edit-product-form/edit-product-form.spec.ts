import { ComponentFixture, TestBed } from '@angular/core/testing';
import {Component, forwardRef, input, provideZonelessChangeDetection, signal} from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { EditProductForm } from './edit-product-form';
import { Product } from '../../../../shared/types/shared-types';
import { ProductServiceContract } from '../../../../api/product/contracts/product-service.contract';
import {ImageServiceContract} from '../../../../api/image/contracts/image-service.contract';
import {ImageAssignResponse} from '../../../image/types/image-types';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ImageManagementPage} from '../../../image/pages/image-management-page/image-management-page';

const mockProducts: Product[] = [
  { id: 'p1', name: 'Product 1', description: 'D1', brand: 'B1', images: [], metadata: 'm', sku: 'sku1', title: 'T1', store: { id: 's1', name: 'Store 1', domain: 'd1' }, categories: null, prices: null, variants: null },
  { id: 'p2', name: 'Product 2', description: 'D2', brand: 'B2', images: [], metadata: 'm2', sku: 'sku2', title: 'T2', store: { id: 's2', name: 'Store 2', domain: 'd2' }, categories: null, prices: null, variants: null },
];

const mockImages: ImageAssignResponse = {
  imagesUpdated: ['1'],
  itemsUpdated: ['4']
}

const partnerIdSig = signal<string | null>('p1');

@Component({
  selector: 'app-image-management-page',
  standalone: true,
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageManagementPageStub),
      multi: true,
    },
  ],
})
class ImageManagementPageStub implements ControlValueAccessor {
  targetId = input<string | null | undefined>(null);
  triggerUpload = vi.fn().mockReturnValue(of([]));

  writeValue(value: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}
}

describe('EditProductForm', () => {
  let fixture: ComponentFixture<EditProductForm>;
  let component: EditProductForm;

  const mockDialogRef = { close: vi.fn() };

  const productServiceMock = {
    updateProduct: vi.fn().mockReturnValue(of({ data: mockProducts[0] })),
  } as unknown as ProductServiceContract;

  const imageServiceMock = {
    assignImagesToProduct: vi.fn().mockReturnValue(of({ data: mockImages })),
  } as unknown as ImageServiceContract;

  async function setup(data: any) {
    await TestBed.configureTestingModule({
      imports: [EditProductForm],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: ProductServiceContract, useValue: productServiceMock },
        { provide: ImageServiceContract, useValue: imageServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).overrideComponent(EditProductForm, {
      remove: { imports: [ImageManagementPage] },
      add: { imports: [ImageManagementPageStub] }
    }).compileComponents();

    fixture = TestBed.createComponent(EditProductForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when editing a single product', () => {
    beforeEach(async () => {
      await setup({ product: mockProducts[0], partnerId: partnerIdSig });
    });

    it('should not show the product selection dropdown', () => {
      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select).toBeNull();
    });

    it('should populate the form with the product data', () => {
      const nameInputEl = fixture.debugElement.query(By.css('input[formControlName="name"]')).nativeElement as HTMLInputElement;
      expect(nameInputEl.value).toBe(mockProducts[0].name);
    });

    it('should call updateProduct on submit', async () => {
      component.imageManagementPage = {
        triggerUpload: vi.fn().mockReturnValue(of([]))
      } as unknown as any

      component.productForm.patchValue({
        name: 'Updated Name',
        images: ['existing.png']
      });

      component.productForm.markAsDirty();

      await fixture.whenStable();

      const saveBtn = fixture.debugElement.query(By.css('mat-dialog-actions button:last-child'));
      expect(saveBtn).toBeTruthy();
      saveBtn.nativeElement.click();
      await fixture.whenStable();

      expect(productServiceMock.updateProduct).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(component.imageManagementPage?.triggerUpload).toHaveBeenCalledTimes(1);
      expect(imageServiceMock.assignImagesToProduct).not.toHaveBeenCalled();
    });
  });

  describe('when editing from a list of products', () => {
    beforeEach(async () => {
      await setup({ products: mockProducts, partnerId: partnerIdSig });
    });

    it('should show the product selection dropdown with product options', async () => {
      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select).not.toBeNull();

      (select.nativeElement as HTMLElement).click();
      await fixture.whenStable();

      const options = document.querySelectorAll('mat-option');
      expect(options.length).toBe(mockProducts.length);
      const optionTexts = Array.from(options).map(o => o.textContent?.trim());
      expect(optionTexts).toContain('Product 1');
      expect(optionTexts).toContain('Product 2');
    });

    it('should disable form fields initially', () => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]')).nativeElement as HTMLInputElement;
      const descTextarea = fixture.debugElement.query(By.css('textarea[formControlName="description"]')).nativeElement as HTMLTextAreaElement;
      const brandInput = fixture.debugElement.query(By.css('input[formControlName="brand"]')).nativeElement as HTMLInputElement;

      expect(nameInput.disabled).toBe(true);
      expect(descTextarea.disabled).toBe(true);
      expect(brandInput.disabled).toBe(true);
    });

    it('should call onProductSelectionChange and enable/populate fields on selection', async () => {
      const spy = vi.spyOn(component, 'onProductSelectionChange');

      const selectTrigger = fixture.debugElement.query(By.css('.mat-mdc-select-trigger')).nativeElement as HTMLElement;
      selectTrigger.click();
      await fixture.whenStable();

      const options = document.querySelectorAll('mat-option');
      (options[1] as HTMLElement).click();
      await fixture.whenStable();

      expect(spy).toHaveBeenCalledWith('p2');

      const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]')).nativeElement as HTMLInputElement;
      expect(nameInput.disabled).toBe(false);
      expect(nameInput.value).toBe('Product 2');
    });

    it('should call updateProduct on submit after selection', async () => {
      // select a product first
      const selectTrigger = fixture.debugElement.query(By.css('.mat-mdc-select-trigger')).nativeElement as HTMLElement;
      selectTrigger.click();
      await fixture.whenStable();
      const firstOption = document.querySelector('mat-option') as HTMLElement;
      firstOption.click();
      await fixture.whenStable();

      component.imageManagementPage = {
        triggerUpload: vi.fn().mockReturnValue(of([]))
      } as unknown as any

      component.productForm.patchValue({
        name: 'Changed',
        images: ['img-1.png']
      });
      component.productForm.markAsDirty();

      await fixture.whenStable();

      const saveBtn = fixture.debugElement.query(By.css('mat-dialog-actions button:last-child'));
      saveBtn.nativeElement.click();
      await fixture.whenStable();

      expect(productServiceMock.updateProduct).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(component.imageManagementPage?.triggerUpload).toHaveBeenCalledTimes(1);
      expect(imageServiceMock.assignImagesToProduct).not.toHaveBeenCalled();
    });
  });
});
