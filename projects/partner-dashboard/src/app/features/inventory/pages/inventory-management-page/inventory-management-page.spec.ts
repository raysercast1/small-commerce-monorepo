import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { expect, beforeEach, vi, Mock } from 'vitest';

import { MatDialog } from '@angular/material/dialog';
import { InventoryManagementPage } from './inventory-management-page';
import { CrossFunctionalActions } from '../../../../shared/components/cross-functional-actions/cross-functional-actions';
import { CardGrid } from '../../../../shared/components/card-grid/card-grid';
import { Product } from '../../../../shared/types/shared-types';
import { Inventory } from '../../types/inventory-types';
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
  partnerId = vi.fn().mockReturnValue('partner-id-sample');
}

const mockInventoriesData: Inventory[] = [
  {
    id: 'i1',
    sku: 'SKU-1',
    quantity: 10,
    metadata: {},
    productVariant: { id: 'v1', name: 'Variant 1' } as any,
    updatedBy: 'u1',
  },
];

const mockProductsData: Product[] = [
  {
    id: 'p1',
    name: 'Product 1',
    description: 'Desc',
    sku: 'sku1',
    title: 'Product 1',
    metadata: 'm' as any,
    store: { id: 's1', name: 'Store 1', domain: 'd1' },
    categories: null,
    prices: null,
    variants: null,
  },
];

describe('InventoryManagementPage (Unit Test)', () => {
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

  test('should create the component', () => {
    expect(component).toBeTruthy();
  });

  test('renders Loading paragraph when loading is true', async () => {
    inventoryState.setLoading(true);
    await fixture.whenStable();

    const loadingP: HTMLParagraphElement | null = fixture.debugElement.nativeElement.querySelector('p');
    expect(loadingP?.textContent?.trim()).toBe('Loading inventory...');
  });

  test('renders CardGrid when loading is false and inventories exist', async () => {
    inventoryState.setLoading(true);
    inventoryState.setInventories(mockInventoriesData);
    inventoryState.setLoading(false);

    await fixture.whenStable();

    const crossFunctionalActions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    expect(crossFunctionalActions).not.toBeNull();
    const cardGrid = fixture.debugElement.query(By.directive(CardGrid));
    expect(cardGrid).not.toBeNull();
  });

  test('renders No inventory records found paragraph when empty', async () => {
    inventoryState.setInventories([]);
    inventoryState.setLoading(false);

    await fixture.whenStable();

    // It shows: "No inventory records found. Create the first one!" in template.
    const paragraphs: HTMLParagraphElement[] = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('p')
    );
    const emptyMsg = paragraphs.map(p => p.textContent?.trim() || '').find(t => t.includes('No inventory records found.'));
    expect(emptyMsg).toBeTruthy();
  });

  test('opens CreateInventoryForm dialog on create button', async () => {
    inventoryState.setInventories(mockInventoriesData);
    const dialogSpy = dialog.open;

    await fixture.whenStable();

    const actions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    actions.triggerEventHandler('createClicked', null);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });

  test('opens EditInventoryForm dialog on edit button', async () => {
    inventoryState.setInventories(mockInventoriesData);
    const dialogSpy = dialog.open;

    await fixture.whenStable();

    const actions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    actions.triggerEventHandler('editClicked', mockInventoriesData[0]);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });

  test('opens RemoveInventoryForm dialog on remove button', async () => {
    inventoryState.setInventories(mockInventoriesData);
    const dialogSpy = dialog.open;

    await fixture.whenStable();

    const actions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    actions.triggerEventHandler('removeClicked', mockInventoriesData[0]);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });

  test('opens InfoInventory dialog when info is clicked on a card', async () => {
    inventoryState.setInventories(mockInventoriesData);
    const dialogSpy = dialog.open;

    await fixture.whenStable();

    const grid = fixture.debugElement.query(By.directive(CardGrid));
    grid.triggerEventHandler('infoClicked', mockInventoriesData[0]);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });
});
