import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import {describe, test, expect, beforeEach, vi, Mock} from 'vitest';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

// Component, Services, and Types
import { StoreManagementPageComponent } from './store-management-page';

// Child Components and Dependencies
import { CrossFunctionalActions } from '../../../../shared/components/cross-functional-actions/cross-functional-actions';
import { CardGrid } from '../../../../shared/components/card-grid/card-grid';
import { MatDialog } from '@angular/material/dialog';
import {Store} from '../../../../shared/types/shared-types';
import {StoreStateContract} from '../../services/contracts/store-state.contract';
import {StoreStateMock} from '../../../../shared/test-helpers/store/store-state.mock';


// Mock for MatDialog, a required dependency of the component
class MatDialogMock {
  constructor(private v = vi) {
    this.open = this.v.fn().mockReturnValue({ afterClosed: () => of({}) });
  }
  open: Mock;
}

const mockStoresData: Store[] = [
  { id: '1',
    name: 'My Store',
    description: 'Mall',
    slug: 'slug-sample',
    domain: 'domain-sample',
    currency: 'US',
    locale: 'en-US',
    settings: 'setting-sample',
    metadata: 'metadata-sample'}];

describe('StoreManagementPageComponent (Unit Test)', () => {
  let fixture: ComponentFixture<StoreManagementPageComponent>;
  let component: StoreManagementPageComponent;
  let storeState: StoreStateMock;
  let dialog: MatDialogMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreManagementPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideHttpClientTesting(),
        { provide: MatDialog, useFactory: () => new MatDialogMock(vi) },
        { provide: StoreStateContract, useFactory: () => new StoreStateMock(vi) },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: new Map(),
              queryParamMap: new Map(),
            },
            paramMap: of(new Map()),
            queryParamMap: of(new Map()),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreManagementPageComponent);
    component = fixture.componentInstance;

    storeState = TestBed.inject(StoreStateContract) as unknown as StoreStateMock;
    dialog = TestBed.inject(MatDialog) as unknown as MatDialogMock;

    vi.clearAllMocks();
    storeState.setStores([]);
    storeState.setLoading(false);
    storeState.setError(null);
  });

  test('should create the component', () => {
    expect(component).toBeTruthy();
  });

  test('should render child components when stores are available', async () => {
    // Arrange
    storeState.setLoading(true);
    storeState.setStores(mockStoresData);
    storeState.setLoading(false);

    // Act
    await fixture.whenStable();

    // Assert
    const crossFunctionalActions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    expect(crossFunctionalActions).not.toBeNull();
    const cardGrid = fixture.debugElement.query(By.directive(CardGrid));
    expect(cardGrid).not.toBeNull();
  });

  test('should open the CreateStoreForm dialog when create is clicked', async () => {
    // Arrange
    storeState.setLoading(true);
    storeState.setStores(mockStoresData);
    storeState.setLoading(false);
    const dialogSpy = dialog.open;
    await fixture.whenStable();

    const crossFunctionalActions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    crossFunctionalActions.triggerEventHandler('createClicked', null);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });

  test('should open the EditStoreForm dialog when edit is clicked', async () => {
    // Arrange
    storeState.setLoading(true);
    storeState.setStores(mockStoresData);
    storeState.setLoading(false);

    const dialogSpy = dialog.open;

    await fixture.whenStable();

    const crossFunctionalActions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    crossFunctionalActions.triggerEventHandler('editClicked', mockStoresData[0]);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });

  test('should open the RemoveStoreForm dialog when remove is clicked', async () => {
    // Arrange
    storeState.setLoading(true);
    storeState.setStores(mockStoresData);
    storeState.setLoading(false);

    const dialogSpy = dialog.open;
    await fixture.whenStable();

    const crossFunctionalActions = fixture.debugElement.query(By.directive(CrossFunctionalActions));
    crossFunctionalActions.triggerEventHandler('removeClicked', mockStoresData[0]);

    await fixture.whenStable();
    expect(dialogSpy).toHaveBeenCalled();
  });

  test('should open the InfoStoreDialog when info is clicked on a card', async () => {
    // Arrange
    storeState.setLoading(true);
    storeState.setStores(mockStoresData);
    storeState.setLoading(false);

    const dialogSpy = dialog.open;
    await fixture.whenStable();

    // Act
    const cardGrid = fixture.debugElement.query(By.directive(CardGrid));
    cardGrid.triggerEventHandler('infoClicked', mockStoresData[0]);
    await fixture.whenStable();

    // Assert
    expect(dialogSpy).toHaveBeenCalled();
  });
});
