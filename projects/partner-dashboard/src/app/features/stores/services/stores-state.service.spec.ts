import {provideZonelessChangeDetection, signal} from '@angular/core';
import {Store} from '../../../shared/types/shared-types';
import {TestBed} from '@angular/core/testing';
import {ApiResponse, MakeRequestService} from 'shared-core';
import {RouteContextService} from '../../../shared/services/route-context.service';
import {StoreStateContract} from './contracts/store-state.contract';
import {StoreStateImpl} from './stores-state.service';
import {of, throwError} from 'rxjs';
import {expect, vi} from 'vitest';

describe('StoreStateImpl', () => {
  let service: StoreStateImpl;
  let makeRequest: { get: ReturnType<typeof vi.fn> };

  const partnerIdSignal = signal<string | null>(null);
  const routeContextMock = { partnerId: partnerIdSignal };

  const storesMock: Store[] = [
    { id: '1', name: 'S1', title: 'S1', description: '', slug: 's1', domain: 'd1', currency: 'US', locale: 'en-US', settings: 's', metadata: 'm' },
    { id: '2', name: 'S2', title: 'S2', description: '', slug: 's2', domain: 'd2', currency: 'US', locale: 'en-US', settings: 's', metadata: 'm' },
  ];

  beforeEach(() => {
    makeRequest = {
      get: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MakeRequestService, useValue: makeRequest },
        { provide: RouteContextService, useValue: routeContextMock },
        { provide: StoreStateContract, useClass: StoreStateImpl },
        StoreStateImpl,
      ],
    });

    vi.clearAllMocks();
    service = TestBed.inject(StoreStateImpl);
  });

  it('should be created and expose initial state', () => {
    expect(service).toBeTruthy();
    expect(service.stores()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('auto-loads when partnerId signal becomes available', () => {
    makeRequest.get.mockReturnValue(of({ data: storesMock } as ApiResponse<Store[]>));
    routeContextMock.partnerId.set('p1');

    // Trigger effect dependency and flush microtasks
    TestBed.tick();

    void service.loading();

    expect(makeRequest.get).toHaveBeenCalledTimes(1);
    // loading toggles to false after finalize
    expect(service.stores().map(s => s.id)).toEqual(['1', '2']);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('clears stores when partnerId becomes null', () => {
    makeRequest.get.mockReturnValue(of({ data: storesMock } as ApiResponse<Store[]>));
    routeContextMock.partnerId.set('p1');

    TestBed.tick();

    expect(service.stores().length).toBe(2);

    // Then set partnerId to null -> effect should clear list
    routeContextMock.partnerId.set(null);

    TestBed.tick();

    expect(service.stores()).toEqual([]);
  });

  it('load() sets loading, stores result on success, clears error, finalizes loading=false', () => {
    makeRequest.get.mockReturnValue(of({ data: storesMock } as ApiResponse<Store[]>));

    service.load('p1');

    expect(makeRequest.get).toHaveBeenCalledTimes(1);
    expect(service.stores().length).toBe(2);
    expect(service.error()).toBeNull();
    expect(service.loading()).toBe(false);
  });

  it('load() with empty/invalid partnerId clears stores and does not call API', () => {
    service.load('');
    expect(makeRequest.get).not.toHaveBeenCalled();
    expect(service.stores()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('load() handles error: sets error message and finalizes loading=false', () => {
    makeRequest.get.mockReturnValue(throwError(() => new Error('network')));

    service.load('p1');

    expect(makeRequest.get).toHaveBeenCalledTimes(1);
    expect(service.error()).toBe('Failed to load stores');
    expect(service.loading()).toBe(false);
  });

  it('getStoreById returns store if present, undefined otherwise', () => {
    makeRequest.get.mockReturnValue(of({ data: storesMock } as ApiResponse<Store[]>));
    service.load('p1');

    expect(service.getStoreById('1')?.name).toBe('S1');
    expect(service.getStoreById('x')).toBeUndefined();
  });

  it('remove() filters out the store by id and clears error/loading', () => {
    makeRequest.get.mockReturnValue(of({ data: storesMock } as ApiResponse<Store[]>));
    service.load('p1');
    expect(service.stores().length).toBe(2);

    service.remove('1');

    expect(service.stores().map(s => s.id)).toEqual(['2']);
    expect(service.stores().length).toBe(1);
    expect(service.error()).toBeNull();
    expect(service.loading()).toBe(false);
  });
});
