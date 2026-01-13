import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { expect, beforeEach, vi, Mock } from 'vitest';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {ActivatedRoute, convertToParamMap} from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { VariantManagementPageComponent } from './variant-management-page';
import { Variant, Product } from '../../../../shared/types/shared-types';
import { VariantStateContract } from '../../services/contracts/variant-state-contract';
import { VariantStateMock } from '../../../../shared/test-helpers/variant/variant-state.mock';
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

const mockVariantsData: Variant[] = [
  {
    id: 'v1',
    name: 'Variant 1',
    variantName: 'Variant 1',
    attributes: {},
    variantMetadata: {},
    tags: {},
    productId: 'p1',
  } as any,
];

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

describe('VariantManagementPageComponent (Integration)', () => {
  let fixture: ComponentFixture<VariantManagementPageComponent>;
  let component: VariantManagementPageComponent;
  let variantState: VariantStateMock;
  let productState: ProductStateMock;
  let dialog: MatDialogMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantManagementPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialog, useFactory: () => new MatDialogMock(vi) },
        { provide: VariantStateContract, useFactory: () => new VariantStateMock(vi) },
        { provide: ProductStateContract, useFactory: () => new ProductStateMock(vi) },
        { provide: RouteContextService, useClass: RouteContextServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}) },
            paramMap: of(convertToParamMap({ productId: 'p1' })),
            params: of({ productId: 'p1' }),
            queryParamMap: of(convertToParamMap({})),
            queryParams: of({ storeId: 's1' }),
           },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VariantManagementPageComponent);
    component = fixture.componentInstance;

    variantState = TestBed.inject(VariantStateContract) as unknown as VariantStateMock;
    productState = TestBed.inject(ProductStateContract) as unknown as ProductStateMock;
    dialog = TestBed.inject(MatDialog) as unknown as MatDialogMock;

    vi.clearAllMocks();

    variantState.setVariants([]);
    variantState.setLoading(false);
    variantState.setError(null);

    productState.setProducts(mockProductsData);
    productState.setLoading(false);
    productState.setError(null);
  });

  it('exposes variants and loading from state', async () => {
    variantState.setLoading(true);
    variantState.setVariants(mockVariantsData);
    variantState.setLoading(false);
    await fixture.whenStable();

    expect(component.isLoading()).toBe(false);
    expect(component.variants().map(v => v.id)).toEqual(['v1']);
  });

  it('reloads after create dialog success', async () => {
    dialog.open.mockReturnValue({ afterClosed: () => of({ data: { ok: true } }) });
    component.handleCreateVariant();
    await fixture.whenStable();

    //Imperative call after the dialog is closed (handleActionCompletion), and reactive call from an effect when productId changes.
    expect(variantState.load).toHaveBeenCalledTimes(2);
  });

  it('reloads after edit dialog success', async () => {
    dialog.open.mockReturnValue({ afterClosed: () => of({ data: { ok: true } }) });
    component.handleEditVariant(mockVariantsData[0]);
    await fixture.whenStable();

    //Imperative call after the dialog is closed (handleActionCompletion), and reactive call from an effect when productId changes.
    expect(variantState.load).toHaveBeenCalledTimes(2);
  });

  it('removes after remove dialog success', async () => {
    variantState.setVariants(mockVariantsData);
    dialog.open.mockReturnValue({ afterClosed: () => of({ response: { data: true }, variantId: 'v1' }) });

    component.handleRemoveVariant(mockVariantsData[0]);
    await fixture.whenStable();

    expect(variantState.remove).toHaveBeenCalledWith('v1');
    expect(variantState.variants().length).toBe(0);
  });
});
