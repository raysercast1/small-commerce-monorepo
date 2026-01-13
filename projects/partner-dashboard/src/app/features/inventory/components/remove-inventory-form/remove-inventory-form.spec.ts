import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RemoveInventoryForm } from './remove-inventory-form';
import { InventoryServiceContract } from '../../../../api/inventory/contracts/inventory-service.contract';
import { Inventory } from '../../types/inventory-types';
import { Product } from '../../../../shared/types/shared-types';

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

describe('RemoveInventoryForm', () => {
  let fixture: ComponentFixture<RemoveInventoryForm>;
  let component: RemoveInventoryForm;

  const mockDialogRef = { close: vi.fn() } as unknown as MatDialogRef<RemoveInventoryForm>;

  const inventoryServiceMock = {
    delete: vi.fn().mockReturnValue(of({ data: { ok: true } })),
  } as unknown as InventoryServiceContract;

  async function setup(data: any) {
    await TestBed.configureTestingModule({
      imports: [RemoveInventoryForm],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: InventoryServiceContract, useValue: inventoryServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveInventoryForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    await setup({ partnerId, products, inventories });
  });

  it('dropdown options are not displayed at initial state', () => {
    expect(document.querySelectorAll('mat-option').length).toBe(0);
  });

  it('dropdown options are displayed after opening the select', async () => {
    const select = fixture.debugElement.query(By.css('mat-select'));
    (select.nativeElement as HTMLElement).click();
    await fixture.whenStable();
    const options = document.querySelectorAll('mat-option');
    expect(options.length).toBe(inventories.length);
  });

  it('should call delete with correct args and close dialog on confirm', async () => {
    // select first inventory
    const select = fixture.debugElement.query(By.css('mat-select'));
    (select.nativeElement as HTMLElement).click();
    await fixture.whenStable();
    const firstOption = document.querySelector('mat-option') as HTMLElement;
    firstOption.click();
    await fixture.whenStable();

    const removeBtn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="warn"]'));
    (removeBtn.nativeElement as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(inventoryServiceMock.delete).toHaveBeenCalled();
    const [args] = (inventoryServiceMock.delete as any).mock.calls[0];
    expect(args).toEqual({ partnerId, inventoryId: 'inv-1', storeId: 'store-1' });
    expect((mockDialogRef as any).close).toHaveBeenCalled();
  });
});
