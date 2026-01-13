import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { expect, beforeEach, vi, Mock} from 'vitest';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

// Services, Component, and Types under test
import { StoreManagementPageComponent } from './store-management-page';

// Dependencies that need mocking
import { MatDialog } from '@angular/material/dialog';
import {StoreStateMock} from '../../../../shared/test-helpers/store/store-state.mock';
import {Store} from '../../../../shared/types/shared-types';
import {StoreStateContract} from '../../services/contracts/store-state.contract';
import {RouteContextService} from '../../../../shared/services/route-context.service';

// Mock for MatDialog, a required dependency of the component
class MatDialogMock {
  constructor(private v = vi) {
    this.open = this.v.fn().mockReturnValue({ afterClosed: () => of({}) });
  }
  open: Mock;
}

class RouteContextServiceMock {
  constructor(private v = vi) {
    this.partnerId = this.v.fn().mockReturnValue('partner-id-sample');
  }
  partnerId: Mock;
}

describe('StoreManagementPageComponent (Integration)', () => {
  let fixture: ComponentFixture<StoreManagementPageComponent>;
  let component: StoreManagementPageComponent;
  let storeState: StoreStateMock;
  let dialog: MatDialogMock;

  const mockStoresData: Store[] = [
    { id: '1',
      name: 'My Store',
      title: 'My Store',
      description: 'Mall',
      slug: 'slug-sample',
      domain: 'domain-sample',
      currency: 'US',
      locale: 'en-US',
      settings: 'setting-sample',
      metadata: 'metadata-sample'}
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreManagementPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialog, useFactory: () => new MatDialogMock(vi) },
        { provide: StoreStateContract, useFactory: () => new StoreStateMock(vi) },
        { provide: RouteContextService, useFactory: () => new RouteContextServiceMock() },
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

  it('exposes stores and loading from state', async () => {
    storeState.setLoading(true);
    storeState.setStores(mockStoresData);
    storeState.setLoading(false);
    await fixture.whenStable();

    expect(component.loading()).toBe(false);
    expect(component.stores().map(s => s.id)).toEqual(['1']);
  });

  it('reloads after create dialog success', async () => {
    dialog.open.mockReturnValue({ afterClosed: () => of({ data: { ok: true } }) });
    component.handleCreateStore();
    await fixture.whenStable();

    expect(storeState.load).toHaveBeenCalledTimes(1);
  });

  it('reloads after edit dialog success', async () => {
    dialog.open.mockReturnValue({ afterClosed: () => of({ data: { ok: true } }) });
    component.handleEditStore(mockStoresData[0]);
    await fixture.whenStable();

    expect(storeState.load).toHaveBeenCalledTimes(1);
  });

  it('removes after remove dialog success', async () => {
    storeState.setStores(mockStoresData);
    dialog.open.mockReturnValue({ afterClosed: () => of({ response: { data: true }, storeId: '1' }) });

    component.handleRemoveStore(mockStoresData[0]);
    await fixture.whenStable();

    expect(storeState.remove).toHaveBeenCalledWith('1');
    expect(storeState.stores().length).toBe(0);
  });
});
