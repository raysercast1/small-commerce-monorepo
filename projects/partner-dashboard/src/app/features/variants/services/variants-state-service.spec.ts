import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import { expect, vi, describe, it, beforeEach } from 'vitest';

import { ApiResponse, MakeRequestService } from '../../../shared/services/make-request.service';
import { Variant } from '../../../shared/types/shared-types';
import { VariantStateContract } from './contracts/variant-state-contract';
import { VariantStateImpl } from './variants-state-service';

// Helper to build a response shape similar to the service's expectations
function buildPagedResponse(items: Variant[]): ApiResponse<{ content: Variant[] }> {
  return { data: { content: items } } as any;
}

describe('VariantStateImpl', () => {
  let service: VariantStateImpl;
  let makeRequest: { get: ReturnType<typeof vi.fn> };

  const variantsRaw: Variant[] = [
    {
      id: 'v1',
      variantName: 'Red S',
      name: 'Red S',
      // service.safeParse expects strings and parses them
      attributes: JSON.stringify([{ attributeKey: 'color', attributeValue: 'red' }]) as any,
      variantMetadata: JSON.stringify({ material: 'cotton' }) as any,
      tags: JSON.stringify({ season: 'summer' }) as any,
    } as any,
    {
      id: 'v2',
      variantName: 'Blue L',
      name: 'Blue L',
      attributes: JSON.stringify([{ attributeKey: 'color', attributeValue: 'blue' }]) as any,
      variantMetadata: JSON.stringify({ material: 'denim' }) as any,
      tags: JSON.stringify({ season: 'winter' }) as any,
    } as any,
  ];

  beforeEach(() => {
    makeRequest = { get: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MakeRequestService, useValue: makeRequest },
        { provide: VariantStateContract, useClass: VariantStateImpl },
        VariantStateImpl,
      ],
    });

    vi.clearAllMocks();
    service = TestBed.inject(VariantStateImpl);
  });

  it('exposes initial state: variants=[], loading=false, error=null', () => {
    expect(service.variants()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('load() with missing productId clears variants via update and does not call API', () => {
    const updateSpy = vi.spyOn((service as any).state, 'update');

    service.load(null, 'partner-1');

    expect(makeRequest.get).not.toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(service.variants()).toEqual([]);
  });

  it('load() with missing partnerId clears variants via update and does not call API', () => {
    const updateSpy = vi.spyOn((service as any).state, 'update');

    service.load('product-1', null);

    expect(makeRequest.get).not.toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(service.variants()).toEqual([]);
  });

  it('load() with valid args: calls API, sets loading=true and error=null initially, then stores parsed variants and sets loading=false', () => {
    const subject = new Subject<ApiResponse<any>>();
    makeRequest.get.mockReturnValue(subject.asObservable());

    // Call load: should set loading=true and error=null before any emission
    service.load('product-1', 'partner-1');
    expect(makeRequest.get).toHaveBeenCalledTimes(1);
    expect(service.loading()).toBe(true);
    expect(service.error()).toBeNull();

    // Emit a paged response and complete
    subject.next(buildPagedResponse(variantsRaw));
    subject.complete();

    // After finalize, loading should be false and variants parsed
    expect(service.loading()).toBe(false);
    const v = service.variants();
    expect(v.length).toBe(2);
    // attributes should have been parsed into array of objects
    expect(Array.isArray(v[0].attributes)).toBe(true);
    expect((v[0].attributes as any[])[0]).toMatchObject({ attributeKey: 'color', attributeValue: 'red' });
    expect(service.error()).toBeNull();
  });

  it('load() handles error: sets error message and loading=false', () => {
    makeRequest.get.mockReturnValue(throwError(() => new Error('network')));

    service.load('product-1', 'partner-1');

    expect(makeRequest.get).toHaveBeenCalledTimes(1);
    expect(service.error()).toBe('Failed to load variants');
    expect(service.loading()).toBe(false);
    expect(service.variants()).toEqual([]);
  });

  it('remove() removes variant by id, sets loading=false and error=null', () => {
    // Pre-populate the state directly through private signal for simplicity
    (service as any).state.update((s: any) => ({ ...s, variants: [
      { id: 'v1', variantName: 'A' } as any,
      { id: 'v2', variantName: 'B' } as any,
    ] }));

    service.remove('v1');

    expect(service.variants().map(v => v.id)).toEqual(['v2']);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });
});
