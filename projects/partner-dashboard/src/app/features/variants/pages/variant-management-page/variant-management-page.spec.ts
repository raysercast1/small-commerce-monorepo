import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { convertToParamMap } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { describe, test, expect, beforeEach, vi, Mock } from 'vitest';

import { MatDialog } from '@angular/material/dialog';
import { VariantManagementPageComponent } from './variant-management-page';
import { CrossFunctionalActions } from '../../../../shared/components/cross-functional-actions/cross-functional-actions';
import { CardGrid } from '../../../../shared/components/card-grid/card-grid';
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
    productId: 'p1'
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
    store: { id: 's1', name: 'Store 1', domain: 'd1' },
    images: [],
    categories: null,
    prices: null,
    variants: null,
  },
];

describe('VariantManagementPageComponent (Unit Test)', () => {
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

  test('should create the component', () => {
    expect(component).toBeTruthy();
  });

  test('should render child components when variants are available', async () => {
    variantState.setLoading(true);
    variantState.setVariants(mockVariantsData);
    variantState.setLoading(false);

    await fixture.whenStable();

    const crossFunctionalActions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    expect(crossFunctionalActions).not.toBeNull();
    const cardGrid = fixture.debugElement.query(By.directive(CardGrid));
    expect(cardGrid).not.toBeNull();
  });

  test('should open the CreateVariantForm dialog when create is clicked', async () => {
    variantState.setVariants(mockVariantsData);
    const dialogSpy = dialog.open;

    await fixture.whenStable();

    const crossFunctionalActions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    crossFunctionalActions.triggerEventHandler('createClicked', null);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });

  test('should open the EditVariantForm dialog when edit is clicked', async () => {
    variantState.setVariants(mockVariantsData);
    const dialogSpy = dialog.open;

    await fixture.whenStable();

    const crossFunctionalActions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    crossFunctionalActions.triggerEventHandler('editClicked', mockVariantsData[0]);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });

  test('should open the RemoveVariantForm dialog when remove is clicked', async () => {
    variantState.setVariants(mockVariantsData);
    const dialogSpy = dialog.open;

    await fixture.whenStable();

    const crossFunctionalActions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    crossFunctionalActions.triggerEventHandler('removeClicked', mockVariantsData[0]);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });

  test('should open the InfoVariantDialog when info is clicked on a card', async () => {
    variantState.setVariants(mockVariantsData);
    const dialogSpy = dialog.open;
    await fixture.whenStable();

    const cardGrid = fixture.debugElement.query(By.directive(CardGrid));
    cardGrid.triggerEventHandler('infoClicked', mockVariantsData[0]);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });
});
