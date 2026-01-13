import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { expect, beforeEach, vi, Mock } from 'vitest';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { ProductManagementPageComponent } from './product-management-page';
import { Product } from '../../../../shared/types/shared-types';
import { ProductStateContract } from '../../services/contracts/products-state-contract';
import { ProductStateMock } from '../../../../shared/test-helpers/product/product-state.mock';
import { StoreStateContract } from '../../../stores/services/contracts/store-state.contract';
import { StoreStateMock } from '../../../../shared/test-helpers/store/store-state.mock';
import { RouteContextService } from '../../../../shared/services/route-context.service';

class MatDialogMock {
  constructor(private v = vi) {
    this.open = this.v.fn().mockReturnValue({ afterClosed: () => of({}) });
  }
  open: Mock;
}

class RouteContextServiceMock {
  constructor() {}
  partnerId = vi.fn().mockReturnValue('partner-id-sample');
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

describe('ProductManagementPageComponent (Integration)', () => {
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
        { provide: RouteContextService, useClass: RouteContextServiceMock },
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

  it('exposes products and loading from state', async () => {
    productState.setLoading(true);
    productState.setProducts(mockProductsData);
    productState.setLoading(false);
    await fixture.whenStable();

    expect(component.loading()).toBe(false);
    expect(component.products().map(p => p.id)).toEqual(['p1']);
  });

  it('reloads after create dialog success', async () => {
    dialog.open.mockReturnValue({ afterClosed: () => of({ data: { ok: true } }) });
    component.handleCreateProduct();
    await fixture.whenStable();

    expect(productState.load).toHaveBeenCalledTimes(1);
  });

  it('reloads after edit dialog success', async () => {
    dialog.open.mockReturnValue({ afterClosed: () => of({ data: { ok: true } }) });
    component.handleEditProduct(mockProductsData[0]);
    await fixture.whenStable();

    expect(productState.load).toHaveBeenCalledTimes(1);
  });

  it('removes after remove dialog success', async () => {
    productState.setProducts(mockProductsData);
    dialog.open.mockReturnValue({ afterClosed: () => of({ response: { data: true }, productId: 'p1' }) });

    component.handleRemoveProduct(mockProductsData[0]);
    await fixture.whenStable();

    expect(productState.remove).toHaveBeenCalledWith('p1');
    expect(productState.products().length).toBe(0);
  });
});
