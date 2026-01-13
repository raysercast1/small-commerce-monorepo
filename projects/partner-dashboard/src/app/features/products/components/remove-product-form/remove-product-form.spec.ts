import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RemoveProductForm } from './remove-product-form';
import { Product } from '../../../../shared/types/shared-types';
import { ProductServiceContract } from '../../../../api/product/contracts/product-service.contract';

const mockProducts: Product[] = [
  { id: 'p1', name: 'Product 1', description: 'D1', brand: 'B1', imageUrl: 'img', metadata: 'm', sku: 'sku1', title: 'T1', store: { id: 's1', name: 'Store 1', domain: 'd1' }, categories: null, prices: null, variants: null },
  { id: 'p2', name: 'Product 2', description: 'D2', brand: 'B2', imageUrl: 'img2', metadata: 'm2', sku: 'sku2', title: 'T2', store: { id: 's2', name: 'Store 2', domain: 'd2' }, categories: null, prices: null, variants: null },
];

const partnerIdSig = signal<string | null>('p1');

describe('RemoveProductForm', () => {
  let fixture: ComponentFixture<RemoveProductForm>;

  const mockDialogRef = { close: vi.fn() };

  const productServiceMock = {
    deleteProduct: vi.fn().mockReturnValue(of({ data: true, message: 'Product removed successfully', timestamp: 'now' })),
  } as unknown as ProductServiceContract;

  async function setup(data: any) {
    await TestBed.configureTestingModule({
      imports: [RemoveProductForm],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: ProductServiceContract, useValue: productServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveProductForm);
    await fixture.whenStable();
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when removing a single product', () => {
    beforeEach(async () => {
      await setup({ product: mockProducts[0], partnerId: partnerIdSig, storeId: mockProducts[0].store.id });
    });

    it('should not show the product selection dropdown', () => {
      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select).toBeNull();
    });

    it('should show the confirmation message for the specific product', () => {
      const content = fixture.nativeElement.textContent as string;
      expect(content).toContain('Are you sure you want to remove the product "Product 1"?');
    });
  });

  describe('when removing from a list of products', () => {
    beforeEach(async () => {
      await setup({ products: mockProducts, partnerId: partnerIdSig, storeId: mockProducts[0].store.id });
    });

    it('should show the product selection dropdown', () => {
      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select).not.toBeNull();
    });

    it('should disable the remove button initially', () => {
      const removeButton = fixture.debugElement.query(By.css('button[color="warn"]')).nativeElement as HTMLButtonElement;
      expect(removeButton.disabled).toBe(true);
    });

    it('should enable the remove button and show confirmation on product selection', async () => {
      const trigger = fixture.debugElement.query(By.css('.mat-mdc-select-trigger')).nativeElement as HTMLElement;
      trigger.click();
      await fixture.whenStable();

      const options = document.querySelectorAll('mat-option');
      (options[1] as HTMLElement).click();
      await fixture.whenStable();

      const removeButton = fixture.debugElement.query(By.css('button[color="warn"]')).nativeElement as HTMLButtonElement;
      expect(removeButton.disabled).toBe(false);

      const content = fixture.nativeElement.textContent as string;
      expect(content).toContain('Are you sure you want to remove the product "Product 2"?');
    });

    it('should call deleteProduct on confirm', async () => {
      const trigger = fixture.debugElement.query(By.css('.mat-mdc-select-trigger')).nativeElement as HTMLElement;
      trigger.click();
      await fixture.whenStable();

      const firstOption = document.querySelector('mat-option') as HTMLElement;
      firstOption.click();
      await fixture.whenStable();

      const removeButton = fixture.debugElement.query(By.css('button[color="warn"]'));
      expect(removeButton).toBeTruthy();
      expect((removeButton.nativeElement as HTMLButtonElement).disabled).toBe(false);

      (removeButton.nativeElement as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(productServiceMock.deleteProduct).toHaveBeenCalledWith({ productId: 'p1', partnerId: 'p1', storeId: 's1' });

      const expectedResponse = { response: { data: true, message: 'Product removed successfully', timestamp: 'now' }, productId: 'p1' };
      expect(mockDialogRef.close).toHaveBeenCalledWith(expectedResponse);
    });
  });
});
