import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { RemovePricePComponent } from './remove-price-p-form';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {PricePServiceContract} from '../../../../../api/price/contracts/price-p-service.contract';

function getByTestId(el: HTMLElement, id: string): HTMLElement | null {
  return el.querySelector(`[data-testid="${id}"]`);
}

class PricePServiceMock {
  deletePriceForProduct = vi.fn();
}

describe('RemovePricePComponent', () => {
  it('renders product confirmation text in product mode', async () => {
    await TestBed.configureTestingModule({
      imports: [RemovePricePComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'product', partnerId: 'p', productId: 'prod-1', type: 'STANDARD' } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: PricePServiceContract, useValue: PricePServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RemovePricePComponent);

    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(getByTestId(root, 'title')).not.toBeNull();
  });
});
