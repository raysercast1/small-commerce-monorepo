import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { expect, vi, describe, it, beforeEach } from 'vitest';

import { MakeRequestService } from '../../../../shared/services/make-request.service';
import { PricesStateVImpl } from './prices-state-v-service';
import { Price } from '../../shared/types/price-types';

describe('PricesStateVImpl - unit tests', () => {
  let service: PricesStateVImpl;
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
        PricesStateVImpl
      ],
    });

    vi.clearAllMocks();
    service = TestBed.inject(PricesStateVImpl);
  });

  it('exposes initial state: prices=[], loading=false, error=null', () => {
    expect(service.prices()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('loadForVariant() with missing args clears prices and does not call API', () => {
    const updateSpy = vi.spyOn((service as any).state, 'update');

    service.loadForVariant(null, 'product-1', 'partner-1');
    service.loadForVariant('variant-1', null, 'partner-1');
    service.loadForVariant('variant-1', 'product-1', null);

    expect(makeRequest.get).not.toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(service.prices()).toEqual([]);
  });

  it('loadForVariant() handles error: sets error message and loading=false', () => {
    makeRequest.get.mockReturnValue(throwError(() => new Error('network')));

    service.loadForVariant('v1', 'product-1', 'partner-1');

    expect(makeRequest.get).toHaveBeenCalledTimes(1);
    expect(service.error()).toBe('Failed to load prices');
    expect(service.loading()).toBe(false);
    expect(service.prices()).toEqual([]);
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
