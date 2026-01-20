import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { expect, vi, describe, it, beforeEach } from 'vitest';

import { ApiResponse, MakeRequestService, PagedResponse } from 'shared-core';
import { RouteContextService } from '../../../shared/services/route-context.service';
import { Inventory } from '../types/inventory-types';
import { InventoryStateContract } from './contracts/Inventory-state.contract';
import { InventoryStateImpl } from './inventory-state.impl';

function buildPagedResponse(items: Inventory[]): ApiResponse<PagedResponse<Inventory>> {
  return { data: { content: items } } as any;
}

describe('InventoryStateImpl', () => {
  let service: InventoryStateImpl;
  let makeRequest: { get: ReturnType<typeof vi.fn> };

  const partnerIdSignal = signal<string | null>(null);
  const routeContextMock = { partnerId: partnerIdSignal } as Pick<RouteContextService, 'partnerId'>;

  const inventoriesMock: Inventory[] = [
    {
      id: 'inv1',
      sku: 'SKU-1',
      quantity: 5,
      metadata: 'm' as any,
      productVariant: { id: 'v1', name: 'Var 1', sku: 'SKU-1' } as any,
      updatedBy: 'u1',
    },
    {
      id: 'inv2',
      sku: 'SKU-2',
      quantity: 8,
      metadata: 'm' as any,
      productVariant: { id: 'v2', name: 'Var 2', sku: 'SKU-2' } as any,
      updatedBy: 'u2',
    },
  ];

  beforeEach(() => {
    makeRequest = { get: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MakeRequestService, useValue: makeRequest },
        { provide: RouteContextService, useValue: routeContextMock },
        { provide: InventoryStateContract, useClass: InventoryStateImpl },
        InventoryStateImpl,
      ],
    });

    vi.clearAllMocks();
    // Reset partnerId signal between tests
    routeContextMock.partnerId.set(null);

    service = TestBed.inject(InventoryStateImpl);
  });

  it('initial state: inventories=[], loading=false, error=null', () => {
    expect(service.inventories()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('reacts to partnerId changes by calling load with new partnerId', () => {
    makeRequest.get.mockReturnValue(of(buildPagedResponse(inventoriesMock)));
    const loadSpy = vi.spyOn(service, 'load');

    routeContextMock.partnerId.set('partner-123');

    TestBed.tick();

    expect(loadSpy).toHaveBeenCalledTimes(1);
    expect(loadSpy).toHaveBeenCalledWith('partner-123');
  });

  it('load(): on success sets loading=false, error=null, and populates inventories (paged)', () => {
    makeRequest.get.mockReturnValue(of(buildPagedResponse(inventoriesMock)));

    service.load('partner-1');

    expect(makeRequest.get).toHaveBeenCalledTimes(1);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.inventories().map(i => i.id)).toEqual(['inv1', 'inv2']);
  });

  it('load(): supports direct array response shape', () => {
    makeRequest.get.mockReturnValue(of({ data: inventoriesMock } as ApiResponse<Inventory[]>));

    service.load('partner-1');

    expect(service.inventories().map(i => i.id)).toEqual(['inv1', 'inv2']);
  });

  it('getInventoryById returns the correct inventory, or undefined for invalid id', () => {
    makeRequest.get.mockReturnValue(of(buildPagedResponse(inventoriesMock)));

    service.load('partner-1');

    expect(service.getInventoryById('inv2')?.sku).toBe('SKU-2');
    expect(service.getInventoryById('nope')).toBeUndefined();
  });

  it('remove(): removes the correct inventory by id', () => {
    makeRequest.get.mockReturnValue(of({ data: inventoriesMock } as ApiResponse<Inventory[]>));
    service.load('partner-1');

    expect(service.inventories().length).toBe(2);

    service.remove('inv1');

    expect(service.inventories().map(i => i.id)).toEqual(['inv2']);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('remove() with invalid id does not change state', () => {
    makeRequest.get.mockReturnValue(of({ data: inventoriesMock } as ApiResponse<Inventory[]>));
    service.load('partner-1');

    const before = service.inventories();

    service.remove('invalid');

    expect(service.inventories()).toEqual(before);
  });

  it('load() with empty/invalid partnerId clears inventories and does not call API', () => {
    service.load('');
    expect(makeRequest.get).not.toHaveBeenCalled();
    expect(service.inventories()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('load() handles error: sets error message and finalizes loading=false', () => {
    makeRequest.get.mockReturnValue(throwError(() => new Error('network')));

    service.load('partner-1');

    expect(makeRequest.get).toHaveBeenCalledTimes(1);
    expect(service.error()).toBe('Failed to load inventory');
    expect(service.loading()).toBe(false);
    expect(service.inventories()).toEqual([]);
  });
});
