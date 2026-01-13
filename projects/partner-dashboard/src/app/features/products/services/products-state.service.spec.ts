import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { expect, vi } from 'vitest';

import { ApiResponse, MakeRequestService, PagedResponse } from '../../../shared/services/make-request.service';
import { RouteContextService } from '../../../shared/services/route-context.service';
import { Product } from '../../../shared/types/shared-types';
import { ProductStateContract } from './contracts/products-state-contract';
import { ProductStateImpl } from './products-state.service';

describe('ProductStateImpl', () => {
  let service: ProductStateImpl;
  let makeRequest: { get: ReturnType<typeof vi.fn> };

  const partnerIdSignal = signal<string | null>(null);
  const routeContextMock = { partnerId: partnerIdSignal } as Pick<RouteContextService, 'partnerId'>;

  const productsMock: Product[] = [
    {
      id: 'p1',
      name: 'Prod 1',
      description: 'd1',
      sku: 'sku1',
      store: { id: 's1', name: 'Store 1', domain: 'd1' },
      categories: null,
      prices: null,
      variants: null,
      title: 'Prod 1',
      metadata: 'm'
    },
    {
      id: 'p2',
      name: 'Prod 2',
      description: 'd2',
      sku: 'sku2',
      store: { id: 's1', name: 'Store 1', domain: 'd1' },
      categories: null,
      prices: null,
      variants: null,
      title: 'Prod 2',
      metadata: 'm'
    },
  ];

  beforeEach(() => {
    makeRequest = { get: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MakeRequestService, useValue: makeRequest },
        { provide: RouteContextService, useValue: routeContextMock },
        { provide: ProductStateContract, useClass: ProductStateImpl },
        ProductStateImpl,
      ],
    });

    vi.clearAllMocks();
    service = TestBed.inject(ProductStateImpl);
  });

  it('should be created and expose initial state', () => {
    expect(service).toBeTruthy();
    expect(service.products()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('auto-loads when partnerId signal becomes available', () => {
    const paged: PagedResponse<Product> = { content: productsMock } as any;
    makeRequest.get.mockReturnValue(of({ data: paged } as ApiResponse<PagedResponse<Product>>));

    routeContextMock.partnerId.set('partner-1');

    TestBed.tick();

    void service.loading();

    expect(makeRequest.get).toHaveBeenCalledTimes(1);
    expect(service.products().map(p => p.id)).toEqual(['p1', 'p2']);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('clears products when partnerId becomes null', () => {
    makeRequest.get.mockReturnValue(of({ data: { content: productsMock } }));
    routeContextMock.partnerId.set('p1');

    TestBed.tick();

    expect(service.products().length).toBe(2);

    routeContextMock.partnerId.set(null);

    TestBed.tick();

    expect(service.products()).toEqual([]);
  });

  it('load() sets loading, stores result on success, clears error, finalizes loading=false (paged)', () => {
    makeRequest.get.mockReturnValue(of({ data: { content: productsMock } }));

    service.load('p1');

    expect(makeRequest.get).toHaveBeenCalledTimes(1);
    expect(service.products().length).toBe(2);
    expect(service.error()).toBeNull();
    expect(service.loading()).toBe(false);
  });

  it('load() supports direct array response', () => {
    makeRequest.get.mockReturnValue(of({ data: productsMock } as ApiResponse<Product[]>));

    service.load('p1');

    expect(service.products().map(p => p.id)).toEqual(['p1', 'p2']);
  });

  it('load() with empty/invalid partnerId clears products and does not call API', () => {
    service.load('');
    expect(makeRequest.get).not.toHaveBeenCalled();
    expect(service.products()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('load() handles error: sets error message and finalizes loading=false', () => {
    makeRequest.get.mockReturnValue(throwError(() => new Error('network')));

    service.load('p1');

    expect(makeRequest.get).toHaveBeenCalledTimes(1);
    expect(service.error()).toBe('Failed to load products');
    expect(service.loading()).toBe(false);
  });

  it('getProductById returns product if present, undefined otherwise', () => {
    makeRequest.get.mockReturnValue(of({ data: { content: productsMock } }));
    service.load('p1');

    expect(service.getProductById('p1')?.name).toBe('Prod 1');
    expect(service.getProductById('x')).toBeUndefined();
  });

  it('remove() filters out the product by id and clears error/loading', () => {
    makeRequest.get.mockReturnValue(of({ data: { content: productsMock } }));
    service.load('p1');
    expect(service.products().length).toBe(2);

    service.remove('p1');

    expect(service.products().map(p => p.id)).toEqual(['p2']);
    expect(service.products().length).toBe(1);
    expect(service.error()).toBeNull();
    expect(service.loading()).toBe(false);
  });
});
