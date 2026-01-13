import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { describe, test, expect, beforeEach, vi, Mock } from 'vitest';

import { MatDialog } from '@angular/material/dialog';
import { ProductManagementPageComponent } from './product-management-page';
import { CrossFunctionalActions } from '../../../../shared/components/cross-functional-actions/cross-functional-actions';
import { CardGrid } from '../../../../shared/components/card-grid/card-grid';
import { Product } from '../../../../shared/types/shared-types';
import { ProductStateContract } from '../../services/contracts/products-state-contract';
import { ProductStateMock } from '../../../../shared/test-helpers/product/product-state.mock';
import { StoreStateContract } from '../../../stores/services/contracts/store-state.contract';
import { StoreStateMock } from '../../../../shared/test-helpers/store/store-state.mock';

class MatDialogMock {
  constructor(private v = vi) {
    this.open = this.v.fn().mockReturnValue({ afterClosed: () => of({}) });
  }
  open: Mock;
}

const mockProductsData: Product[] = [
  {
    id: 'p1',
    name: 'Product 1',
    description: 'Desc',
    sku: 'sku1',
    title: 'Product 1',
    metadata: 'm',
    images: [],
    store: { id: 's1', name: 'Store 1', domain: 'd1' },
    categories: null,
    prices: null,
    variants: null,
  },
];

const mockStores = [
  { id: 's1', name: 'Store 1', slug: 's1', description: '', domain: 'd1', currency: 'US', locale: 'en-US', settings: 's', metadata: 'm' },
];

describe('ProductManagementPageComponent (Unit Test)', () => {
  let fixture: ComponentFixture<ProductManagementPageComponent>;
  let component: ProductManagementPageComponent;
  let productState: ProductStateMock;
  let storeState: StoreStateMock;
  let dialog: MatDialogMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductManagementPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialog, useFactory: () => new MatDialogMock(vi) },
        { provide: ProductStateContract, useFactory: () => new ProductStateMock(vi) },
        { provide: StoreStateContract, useFactory: () => new StoreStateMock(vi) },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map(), queryParamMap: new Map() },
            paramMap: of(new Map()),
            queryParamMap: of(new Map()),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductManagementPageComponent);
    component = fixture.componentInstance;

    productState = TestBed.inject(ProductStateContract) as unknown as ProductStateMock;
    storeState = TestBed.inject(StoreStateContract) as unknown as StoreStateMock;
    dialog = TestBed.inject(MatDialog) as unknown as MatDialogMock;

    vi.clearAllMocks();
    productState.setProducts([]);
    productState.setLoading(false);
    productState.setError(null);

    storeState.setStores(mockStores);
    storeState.setLoading(false);
    storeState.setError(null);
  });

  test('should create the component', () => {
    expect(component).toBeTruthy();
  });

  test('should render child components when products are available', async () => {
    productState.setLoading(true);
    productState.setProducts(mockProductsData);
    productState.setLoading(false);

    await fixture.whenStable();

    const crossFunctionalActions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    expect(crossFunctionalActions).not.toBeNull();
    const cardGrid = fixture.debugElement.query(By.directive(CardGrid));
    expect(cardGrid).not.toBeNull();
  });

  test('should open the CreateProductForm dialog when create is clicked', async () => {
    productState.setProducts(mockProductsData);
    const dialogSpy = dialog.open;

    await fixture.whenStable();

    const crossFunctionalActions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    crossFunctionalActions.triggerEventHandler('createClicked', null);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });

  test('should open the EditProductForm dialog when edit is clicked', async () => {
    productState.setProducts(mockProductsData);
    const dialogSpy = dialog.open;

    await fixture.whenStable();

    const crossFunctionalActions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    crossFunctionalActions.triggerEventHandler('editClicked', mockProductsData[0]);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });

  test('should open the RemoveProductForm dialog when remove is clicked', async () => {
    productState.setProducts(mockProductsData);
    const dialogSpy = dialog.open;
    await fixture.whenStable();

    const crossFunctionalActions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    crossFunctionalActions.triggerEventHandler('removeClicked', mockProductsData[0]);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });

  test('should open the InfoProductDialog when info is clicked on a card', async () => {
    productState.setProducts(mockProductsData);
    const dialogSpy = dialog.open;
    await fixture.whenStable();

    const cardGrid = fixture.debugElement.query(By.directive(CardGrid));
    cardGrid.triggerEventHandler('infoClicked', mockProductsData[0]);
    await fixture.whenStable();

    expect(dialogSpy).toHaveBeenCalled();
  });
});
