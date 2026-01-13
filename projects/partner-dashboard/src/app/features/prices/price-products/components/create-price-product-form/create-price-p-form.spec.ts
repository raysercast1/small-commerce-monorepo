import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreatePricePComponent } from './create-price-p-form';
import {PricePServiceContract} from '../../../../../api/price/contracts/price-p-service.contract';

function getByTestId(el: HTMLElement, id: string): HTMLElement | null {
  return el.querySelector(`[data-testid="${id}"]`);
}

class PricePServiceMock {
  createPriceForProduct = vi.fn();
}

describe('CreatePricePComponent', () => {
  it('renders Product form fields when mode="product"', async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePricePComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'product', value: {} } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: PricePServiceContract, useValue: PricePServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreatePricePComponent);

    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(getByTestId(root, 'price-form')).not.toBeNull();
    expect(getByTestId(root, 'type')).not.toBeNull();
    expect(getByTestId(root, 'cost')).not.toBeNull();
    expect(getByTestId(root, 'price')).not.toBeNull();
    expect(getByTestId(root, 'priceOverride')).not.toBeNull();
  });
});
