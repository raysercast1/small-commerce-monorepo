import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { expect, beforeEach, vi, Mock, it, describe } from 'vitest';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { InventoryManagementPage } from './inventory-management-page';
import { InventoryStateContract } from '../../services/contracts/Inventory-state.contract';
import { InventoryStateMock } from '../../../../shared/test-helpers/inventory/inventory-state.mock';
import { ProductStateContract } from '../../../products/services/contracts/products-state-contract';
import { ProductStateMock } from '../../../../shared/test-helpers/product/product-state.mock';
import { RouteContextService } from '../../../../shared/services/route-context.service';

class MatDialogMock {
  constructor(private v = vi) {
    this.open = this.v.fn().mockReturnValue({ afterClosed: () => of({}) });
  }
  open!: Mock;
}

class RouteContextServiceMock {
  constructor() {}
  partnerId = vi.fn().mockReturnValue('partner-id-sample');
}

const mockInventoriesData: any[] = [
  {
    id: 'i1',
    sku: 'SKU-1',
    quantity: 10,
    metadata: {},
    productVariant: { id: 'v1', name: 'Variant 1' },
    updatedBy: 'u1',
  },
];

const mockProductsData: any[] = [
  {
    id: 'p1',
    name: 'Product 1',
    description: 'Desc',
    sku: 'sku1',
    title: 'Product 1',
    metadata: 'm',
    store: { id: 's1', name: 'Store 1', domain: 'd1' },
    categories: null,
    prices: null,
    variants: null,
  },
];

describe('InventoryManagementPage (Integration)', () => {
  let fixture: ComponentFixture<InventoryManagementPage>;
  let component: InventoryManagementPage;
  let inventoryState: InventoryStateMock;
  let productState: ProductStateMock;
  let dialog: MatDialogMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryManagementPage],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialog, useFactory: () => new MatDialogMock(vi) },
        { provide: InventoryStateContract, useFactory: () => new InventoryStateMock(vi) },
        { provide: ProductStateContract, useFactory: () => new ProductStateMock(vi) },
        { provide: RouteContextService, useClass: RouteContextServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map(), queryParamMap: new Map() },
            paramMap: of(new Map([['productId', 'p1']])),
            queryParamMap: of(new Map()),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryManagementPage);
    component = fixture.componentInstance;

    inventoryState = TestBed.inject(InventoryStateContract) as unknown as InventoryStateMock;
    productState = TestBed.inject(ProductStateContract) as unknown as ProductStateMock;
    dialog = TestBed.inject(MatDialog) as unknown as MatDialogMock;

    vi.clearAllMocks();

    inventoryState.setInventories([]);
    inventoryState.setLoading(false);
    inventoryState.setError(null);

    productState.setProducts(mockProductsData);
    productState.setLoading(false);
    productState.setError(null);
  });

  it('exposes inventories and loading from state', async () => {
    inventoryState.setLoading(true);
    inventoryState.setInventories(mockInventoriesData);
    inventoryState.setLoading(false);
    await fixture.whenStable();

    expect(component.loading()).toBe(false);
    expect(component.inventories().map(i => i.id)).toEqual(['i1']);
  });

  it('calls load with partnerId after create dialog success (non-empty result)', async () => {
    dialog.open.mockReturnValue({ afterClosed: () => of({ data: { ok: true } }) });
    component.handleCreateInventory();
    await fixture.whenStable();

    expect(inventoryState.load).toHaveBeenCalledTimes(1);
    expect(inventoryState.load).toHaveBeenCalledWith('partner-id-sample');
  });

  it('does not call load after create dialog close with empty result', async () => {
    dialog.open.mockReturnValue({ afterClosed: () => of({}) });
    component.handleCreateInventory();
    await fixture.whenStable();

    expect(inventoryState.load).not.toHaveBeenCalled();
  });

  it('calls load with partnerId after edit dialog success (non-empty result)', async () => {
    dialog.open.mockReturnValue({ afterClosed: () => of({ data: { ok: true } }) });
    component.handleEditInventory(mockInventoriesData[0]);
    await fixture.whenStable();

    expect(inventoryState.load).toHaveBeenCalledTimes(1);
    expect(inventoryState.load).toHaveBeenCalledWith('partner-id-sample');
  });

  it('does not call load after edit dialog close with empty result', async () => {
    dialog.open.mockReturnValue({ afterClosed: () => of({}) });
    component.handleEditInventory(mockInventoriesData[0]);
    await fixture.whenStable();

    expect(inventoryState.load).not.toHaveBeenCalled();
  });

  it('removes after remove dialog success', async () => {
    inventoryState.setInventories(mockInventoriesData);
    dialog.open.mockReturnValue({ afterClosed: () => of({ response: { data: true }, inventoryId: 'i1' }) });

    component.handleRemoveInventory(mockInventoriesData[0]);
    await fixture.whenStable();

    expect(inventoryState.remove).toHaveBeenCalledWith('i1');
    expect(inventoryState.inventories().length).toBe(0);
  });
});
