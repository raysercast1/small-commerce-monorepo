import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { expect, describe, it, beforeEach } from 'vitest';
import { of } from 'rxjs';

import { MakeRequestService } from '../../../shared/services/make-request.service';
import { PriceServiceImpl } from './price-service';

describe('PriceServiceImpl argument validation', () => {
  let service: PriceServiceImpl;
  let makeRequest: { post: any; patch: any; get: any; delete: any };

  beforeEach(() => {
    makeRequest = { post: () => of({}), patch: () => of({}), get: () => of({}), delete: () => of({}) } as any;

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MakeRequestService, useValue: makeRequest },
        PriceServiceImpl,
      ],
    });

    service = TestBed.inject(PriceServiceImpl);
  });

  it('createPriceForProduct returns BAD_PARAMETERS when args missing', () => {
    service.createPriceForProduct('', null as any).subscribe({
      next: () => new Error('Expected error'),
      error: (err) => { expect(err.code).toBe('BAD_PARAMETERS');}
    });
  });

  it('createPriceForVariant returns BAD_PARAMETERS when args missing', () => {
    service.createPriceForVariant('', null as any).subscribe({
      next: () => new Error('Expected error'),
      error: (err) => { expect(err.code).toBe('BAD_PARAMETERS');}
    });
  });

  it('updatePriceForProduct returns BAD_PARAMETERS when args missing', () => {
    service.updatePriceForProduct('', null as any).subscribe({
      next: () => new Error('Expected error'),
      error: (err) => { expect(err.code).toBe('BAD_PARAMETERS');}
    });
  });

  it('updatePriceForVariant returns BAD_PARAMETERS when args missing', () => {
    service.updatePriceForVariant('', null as any).subscribe({
      next: () => new Error('Expected error'),
      error: (err) => { expect(err.code).toBe('BAD_PARAMETERS'); }
    });
  });

  it('getPriceForProduct returns BAD_PARAMETERS when args missing', () => {
    service.getPriceForProduct('', '', null as any).subscribe({
      next: () => new Error('Expected error'),
      error: (err) => { expect(err.code).toBe('BAD_PARAMETERS');}
    });
  });

  it('getPriceForVariant returns BAD_PARAMETERS when args missing', () => {
    service.getPriceForVariant('', '', '', null as any).subscribe({
      next: () => new Error('Expected error'),
      error: (err) => { expect(err.code).toBe('BAD_PARAMETERS');}
    });
  });

  it('getPricesForVariant returns BAD_PARAMETERS when args missing', () => {
    service.getPricesForVariant('', '', '', null as any).subscribe({
      next: () => new Error('Expected error'),
      error: (err) => { expect(err.code).toBe('BAD_PARAMETERS');}
    });
  });

  it('getPricesForProduct returns BAD_PARAMETERS when args missing', () => {
    service.getPricesForProduct('', '', null as any).subscribe({
      next: () => new Error('Expected error'),
      error: (err) => { expect(err.code).toBe('BAD_PARAMETERS');}
    });
  });

  it('deletePriceForVariant returns BAD_PARAMETERS when args missing', () => {
    service.deletePriceForVariant('', '', '', null as any).subscribe({
      next: () => new Error('Expected error'),
      error: (err) => { expect(err.code).toBe('BAD_PARAMETERS');}
    });
  });

  it('deletePriceForProduct returns BAD_PARAMETERS when args missing', () => {
    service.deletePriceForProduct('', '', null as any).subscribe({
      next: () => new Error('Expected error'),
      error: (err) => { expect(err.code).toBe('BAD_PARAMETERS');}
    });
  });
});
