import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CreateInventoryForm } from './create-inventory-form';
import { InventoryServiceContract } from '../../../../api/inventory/contracts/inventory-service.contract';
import { StoreServiceContract } from '../../../../api/store/contracts/store-service.contract';
import { Product } from '../../../../shared/types/shared-types';

const dialogData = {
  partnerId: 'partner-1',
  products: [
    {
      id: 'prod-1',
      name: 'Product 1',
      store: { id: 'store-1' },
      variants: [
        { id: 'v1', variantName: 'Red', sku: 'RS' },
        { id: 'v2', variantName: 'Blue', sku: 'BS' },
      ],
    },
  ],
} as unknown as { partnerId: string; products: Product[] };

describe('CreateInventoryForm', () => {
  let fixture: ComponentFixture<CreateInventoryForm>;
  let component: CreateInventoryForm;

  const mockDialogRef = { close: vi.fn() } as unknown as MatDialogRef<CreateInventoryForm>;

  const inventoryServiceMock = {
    create: vi.fn().mockReturnValue(of({ data: { id: 'inv-1', sku: 'RS', quantity: 5 } })),
    addVariantsToInventories: vi.fn().mockReturnValue(of({ data: [{ id: 'inv-1' }] })),
  } as unknown as InventoryServiceContract;

  const storeServiceMock = {
    addInventoriesToStore: vi.fn().mockReturnValue(of({ data: { ok: true } })),
  } as unknown as StoreServiceContract;

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [CreateInventoryForm],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: InventoryServiceContract, useValue: inventoryServiceMock },
        { provide: StoreServiceContract, useValue: storeServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateInventoryForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    await setup();
  });

  it('should render all expected form fields initially', () => {
    const sku = fixture.debugElement.query(By.css('input[formControlName="sku"]'));
    const qty = fixture.debugElement.query(By.css('input[formControlName="quantity"]'));
    const select = fixture.debugElement.query(By.css('mat-select[formControlName="variantId"]'));

    expect(sku).toBeTruthy();
    expect(qty).toBeTruthy();
    expect(select).toBeTruthy();
  });

  it('should have Create button disabled at initial state', () => {
    const createBtn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]')).nativeElement as HTMLButtonElement;
    expect(createBtn.disabled).toBe(true);
  });

  it('sku, quantity and variantId are required (Create enables when valid)', async () => {
    component.inventoryForm.patchValue({ sku: 'SKU-1', quantity: 3 });
    // open and select a variant
    const select = fixture.debugElement.query(By.css('mat-select'));
    (select.nativeElement as HTMLElement).click();
    await fixture.whenStable();

    const options = document.querySelectorAll('mat-option');
    (options[0] as HTMLElement).click();
    await fixture.whenStable();

    const createBtn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]')).nativeElement as HTMLButtonElement;
    expect(createBtn.disabled).toBe(false);
  });

  it('dropdown options are not displayed initially, but appear after opening select', async () => {
    expect(document.querySelectorAll('mat-option').length).toBe(0);
    const select = fixture.debugElement.query(By.css('mat-select'));
    (select.nativeElement as HTMLElement).click();
    await fixture.whenStable();
    const options = document.querySelectorAll('mat-option');
    expect(options.length).toBe(2);
  });

  it('should call create with correct args and close dialog on success', async () => {
    // Fill required fields and select first variant (belongs to store-1 and product prod-1)
    component.inventoryForm.patchValue({ sku: 'SKU-2', quantity: 10 });
    const select = fixture.debugElement.query(By.css('mat-select'));
    (select.nativeElement as HTMLElement).click();
    await fixture.whenStable();
    const options = document.querySelectorAll('mat-option');
    (options[1] as HTMLElement).click(); // choose v2
    await fixture.whenStable();

    const createBtnDe = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]'));
    (createBtnDe.nativeElement as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(inventoryServiceMock.create).toHaveBeenCalled();
    const [firstArg, payload] = (inventoryServiceMock.create as any).mock.calls[0];
    expect(firstArg).toEqual({ partnerId: dialogData.partnerId, storeId: 'store-1' });
    expect(payload).toMatchObject({ sku: 'SKU-2', quantity: 10 });

    expect(inventoryServiceMock.addVariantsToInventories).toHaveBeenCalled();
    expect(storeServiceMock.addInventoriesToStore).toHaveBeenCalled();
    expect((mockDialogRef as any).close).toHaveBeenCalled();
  });

  it('should close dialog on cancel', async () => {
    const cancelBtn = fixture.debugElement.query(By.css('mat-dialog-actions button:not([color])'));
    (cancelBtn.nativeElement as HTMLButtonElement).click();
    await fixture.whenStable();
    expect((mockDialogRef as any).close).toHaveBeenCalled();
  });
});
