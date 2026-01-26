import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {Subject} from 'rxjs';
import { expect, vi, describe, it, beforeEach } from 'vitest';

import { ApiResponse, MakeRequestService } from 'shared-core';
import { Price } from '../../shared/types/price-types';
import { PricesStatePImpl } from './price-state-p-service';

function buildListResponse(items: Price[]): ApiResponse<Price[]> {
  return { data: items, message: 'prices fetched successfully', timestamp: new Date().toISOString() }
}

describe('PricesStatePImpl', () => {
  let service: PricesStatePImpl;
  let makeRequest: { get: ReturnType<typeof vi.fn> };

  const pricesRaw: Price[] = [
    { id: 'p1', type: 'STANDARD' as any, cost: 10, price: 20, currency: 'USD' as any },
    { id: 'p2', type: 'VIP' as any, cost: 15, price: 40, currency: 'USD' as any },
  ];

  beforeEach(() => {
    makeRequest = { get: vi.fn() } as any;

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MakeRequestService, useValue: makeRequest },
        PricesStatePImpl,
      ],
    });

    vi.clearAllMocks();
    service = TestBed.inject(PricesStatePImpl);
  });

  it('exposes initial state: prices=[], loading=false, error=null', () => {
    expect(service.prices()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('loadForProduct() with missing args clears prices and does not call API', () => {
    const updateSpy = vi.spyOn((service as any).state, 'update');

    service.loadForProduct(null, 'partner-1');
    service.loadForProduct('product-1', null);

    expect(makeRequest.get).not.toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(service.prices()).toEqual([]);
  });

  it('loadForProduct() with valid args: calls API, sets loading true then stores items and sets loading false', () => {
    const subject = new Subject<ApiResponse<any>>();
    makeRequest.get.mockReturnValue(subject.asObservable());

    service.loadForProduct('product-1', 'partner-1');

    expect(makeRequest.get).toHaveBeenCalledTimes(1);
    expect(service.loading()).toBe(true);
    expect(service.error()).toBeNull();

    subject.next(buildListResponse(pricesRaw));
    subject.complete();

    expect(service.loading()).toBe(false);
    const p = service.prices();
    expect(p.length).toBe(2);
    expect(p[0].id).toBe('p1');
    expect(service.error()).toBeNull();
  });

  it('remove() removes price by id and clears loading/error', () => {
    (service as any).state.update((s: any) => ({ ...s, prices: [
      { id: 'p1', type: 'STANDARD', cost: 10, price: 20 } as any,
      { id: 'p2', type: 'VIP', cost: 15, price: 40 } as any,
    ] }));

    service.remove('p1');

    expect(service.prices().map(v => v.id)).toEqual(['p2']);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });
});
