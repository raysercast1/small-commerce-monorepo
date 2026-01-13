import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { RemovePriceVComponent } from './remove-price-v-form';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {PriceVServiceContract} from '../../../../../api/price/contracts/price-v-service.contract';

function getByTestId(el: HTMLElement, id: string): HTMLElement | null {
  return el.querySelector(`[data-testid="${id}"]`);
}

class PriceVServiceMock {
  deletePriceForVariant = vi.fn();
}

describe('RemovePriceVComponent', () => {
  it('renders variant confirmation text in variant mode', async () => {
    await TestBed.configureTestingModule({
      imports: [RemovePriceVComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'variant', partnerId: 'p', productId: 'prod-1', variantId: 'v1', type: 'STANDARD' } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: PriceVServiceContract, useValue: PriceVServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RemovePriceVComponent);

    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(getByTestId(root, 'title')).not.toBeNull();
    expect(getByTestId(root, 'cancel')).not.toBeNull();
    expect(getByTestId(root, 'confirm')).not.toBeNull();
  });
});
