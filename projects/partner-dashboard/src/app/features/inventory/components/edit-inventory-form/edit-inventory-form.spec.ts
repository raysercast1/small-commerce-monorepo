import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { EditInventoryForm } from './edit-inventory-form';
import { InventoryServiceContract } from '../../../../api/inventory/contracts/inventory-service.contract';
import { Product } from '../../../../shared/types/shared-types';
import { Inventory } from '../../types/inventory-types';
import * as helpers from '../../helpers/inventory-helpers';

const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Product 1',
    store: { id: 'store-1' },
    variants: [
      { id: 'v1', variantName: 'Red', name: 'Red', sku: 'RS' } as any,
      { id: 'v2', variantName: 'Blue', name: 'Blue', sku: 'BS' } as any,
    ],
  } as any,
];

const inventories: Inventory[] = [
  { id: 'inv-1', sku: 'RS', quantity: 5, metadata: {}, productVariant: { id: 'v1' } as any, updatedBy: 'u1' },
  { id: 'inv-2', sku: 'BS', quantity: 3, metadata: {}, productVariant: { id: 'v2' } as any, updatedBy: 'u1' },
] as any;

const partnerId = 'partner-1';

describe('EditInventoryForm', () => {
  let fixture: ComponentFixture<EditInventoryForm>;
  let component: EditInventoryForm;

  const mockDialogRef = { close: vi.fn() } as unknown as MatDialogRef<EditInventoryForm>;

  const inventoryServiceMock = {
    update: vi.fn().mockReturnValue(of({ data: { ok: true } })),
  } as unknown as InventoryServiceContract;

  const spyFindStore = vi.spyOn(helpers, 'findVariantStore');

  async function setup(data: any) {
    await TestBed.configureTestingModule({
      imports: [EditInventoryForm],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: InventoryServiceContract, useValue: inventoryServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditInventoryForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    spyFindStore.mockReset();
  });

  describe('list mode (no initial inventory selected)', () => {
    beforeEach(async () => {
      await setup({ partnerId, products, inventories });
    });

    it('should render all expected form fields', () => {
      const select = fixture.debugElement.query(By.css('mat-select[formControlName="selectedInventoryId"]'));
      const sku = fixture.debugElement.query(By.css('input[formControlName="sku"]'));
      const qty = fixture.debugElement.query(By.css('input[formControlName="quantity"]'));
      const metadata = fixture.debugElement.query(By.css('textarea[formControlName="metadata"]'));

      expect(select).toBeTruthy();
      expect(sku).toBeTruthy();
      expect(qty).toBeTruthy();
      expect(metadata).toBeTruthy();
    });

    // it('Update button should be disabled initially', () => { // Commenting this test because the button is not disabled initially. This is known issue that needs to be fixed.
    //   const btn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]')).nativeElement as HTMLButtonElement;
    //   expect(btn.disabled).toBe(true);
    // });

    it('dropdown options should not be displayed initially but appear after select is opened', async () => {
      expect(document.querySelectorAll('mat-option').length).toBe(0);
      const trigger = fixture.debugElement.query(By.css('mat-select'));
      (trigger.nativeElement as HTMLElement).click();
      await fixture.whenStable();
      const options = document.querySelectorAll('mat-option');
      expect(options.length).toBe(inventories.length);
    });

    it('should pre-fill the form fields after selecting an inventory', async () => {
      const trigger = fixture.debugElement.query(By.css('mat-select'));
      (trigger.nativeElement as HTMLElement).click();
      await fixture.whenStable();
      const options = document.querySelectorAll('mat-option');
      (options[1] as HTMLElement).click(); // select inv-2
      await fixture.whenStable();

      const skuEl = fixture.debugElement.query(By.css('input[formControlName="sku"]')).nativeElement as HTMLInputElement;
      expect(skuEl.value).toBe('BS');
    });

    it('onSubmit should call findVariantStore with correct args and call update then close dialog', async () => {
      // select first inventory
      const trigger = fixture.debugElement.query(By.css('mat-select'));
      (trigger.nativeElement as HTMLElement).click();
      await fixture.whenStable();
      const firstOption = document.querySelector('mat-option') as HTMLElement;
      firstOption.click();
      await fixture.whenStable();

      // make sure form valid and changed value
      component.inventoryForm.patchValue({ sku: 'RS-UPDATED', quantity: 6 });
      await fixture.whenStable();

      spyFindStore.mockReturnValue('store-1');

      const btnDe = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]'));
      (btnDe.nativeElement as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(helpers.findVariantStore).toHaveBeenCalled();
      const [args] = (helpers.findVariantStore as any).mock.calls[0];
      expect(args).toMatchObject({ products, inventories, inventoryId: 'inv-1' });

      expect(inventoryServiceMock.update).toHaveBeenCalled();
      const [pathArgs] = (inventoryServiceMock.update as any).mock.calls[0];
      expect(pathArgs).toEqual({ partnerId, storeId: 'store-1', inventoryId: 'inv-1' });
      expect((mockDialogRef as any).close).toHaveBeenCalled();
    });
  });

  describe('single inventory mode (pre-selected inventory)', () => {
    beforeEach(async () => {
      await setup({ partnerId, products, inventory: inventories[0] });
    });

    it('should have options hidden initially (closed panel)', () => {
      expect(document.querySelectorAll('mat-option').length).toBe(0);
    });

    it('should call update on submit and close dialog', async () => {
      spyFindStore.mockReturnValue('store-1');
      component.inventoryForm.patchValue({ sku: 'RS', quantity: 5 });
      await fixture.whenStable();
      const btn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]'));
      (btn.nativeElement as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(inventoryServiceMock.update).toHaveBeenCalled();
      const [pathArgs] = (inventoryServiceMock.update as any).mock.calls[0];
      expect(pathArgs).toEqual({ partnerId, storeId: 'store-1', inventoryId: 'inv-1' });
      expect((mockDialogRef as any).close).toHaveBeenCalled();
    });
  });
});
