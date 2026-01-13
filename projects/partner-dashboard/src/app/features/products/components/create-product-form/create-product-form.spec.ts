import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CreateProductForm } from './create-product-form';
import { Store } from '../../../../shared/types/shared-types';
import { ProductServiceContract } from '../../../../api/product/contracts/product-service.contract';
import { StoreServiceContract } from '../../../../api/store/contracts/store-service.contract';

const mockStores: Store[] = [
  { id: 's1', name: 'Store 1', slug: 'store-1', description: 'D1', domain: 'd1', currency: 'US', locale: 'en-US', settings: 'st', metadata: 'm' },
  { id: 's2', name: 'Store 2', slug: 'store-2', description: 'D2', domain: 'd2', currency: 'US', locale: 'en-US', settings: 'st', metadata: 'm' },
];

const partnerIdSig = signal<string | null>('p1');

describe('CreateProductForm', () => {
  let fixture: ComponentFixture<CreateProductForm>;
  let component: CreateProductForm;

  const mockDialogRef = { close: vi.fn() };

  const productServiceMock = {
    createProduct: vi.fn().mockReturnValue(of({ data: { id: 'p100', name: 'New', description: 'Desc', store: { id: 's1', name: 'Store 1', domain: 'd1' }, categories: null, prices: null, variants: null } })),
    assignProductToDefaultCategory: vi.fn().mockReturnValue(of({ data: { ok: true } })),
    updateProduct: vi.fn(),
    getProductsByPartner: vi.fn(),
    getProductsByStore: vi.fn(),
    deleteProduct: vi.fn(),
    addVariantsToProducts: vi.fn(),
  } as unknown as ProductServiceContract;

  const storeServiceMock = {
    addProductsToStore: vi.fn().mockReturnValue(of({ data: { id: 's1' } })),
  } as unknown as StoreServiceContract;

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [CreateProductForm],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: ProductServiceContract, useValue: productServiceMock },
        { provide: StoreServiceContract, useValue: storeServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: { partnerId: partnerIdSig, stores: mockStores } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProductForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    await setup();
  });

  it('should render expected fields and stores dropdown', async () => {
    const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]'));
    const descTextarea = fixture.debugElement.query(By.css('textarea[formControlName="description"]'));
    const brandInput = fixture.debugElement.query(By.css('input[formControlName="brand"]'));
    const skuInput = fixture.debugElement.query(By.css('input[formControlName="sku"]'));
    const storeSelect = fixture.debugElement.query(By.css('mat-select[formControlName="storeId"]'));

    expect(nameInput).toBeTruthy();
    expect(descTextarea).toBeTruthy();
    expect(brandInput).toBeTruthy();
    expect(skuInput).toBeTruthy();
    expect(storeSelect).toBeTruthy();

    // open dropdown and ensure options correspond to stores
    const trigger = fixture.debugElement.query(By.css('mat-select'));
    (trigger.nativeElement as HTMLElement).click();
    await fixture.whenStable();

    const options = document.querySelectorAll('mat-option');
    expect(options.length).toBe(mockStores.length);
    const optionTexts = Array.from(options).map(o => o.textContent?.trim());
    expect(optionTexts).toContain('Store 1');
    expect(optionTexts).toContain('Store 2');
  });

  it('should have submit disabled initially (invalid form)', async () => {
    const createBtn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]'));
    expect(createBtn.nativeElement.disabled).toBe(true);
  });

  it('enables submit when required fields are valid', async () => {
    // fill required fields: name, description, storeId
    component.productForm.patchValue({ name: 'My Product', description: 'Some', storeId: 's1' });
    await fixture.whenStable();

    const createBtn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]'));
    expect(createBtn.nativeElement.disabled).toBe(false);
  });
});
