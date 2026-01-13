import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreatePriceVComponent } from './create-price-v-form';
import {PriceVServiceContract} from '../../../../../api/price/contracts/price-v-service.contract';

function getByTestId(el: HTMLElement, id: string): HTMLElement | null {
  return el.querySelector(`[data-testid="${id}"]`);
}

class PriceVServiceMock {
  createPriceForVariant = vi.fn();
}

describe('CreatePriceFormComponent', () => {
  it('renders Variant form fields when mode="variant"', async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePriceVComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'variant', value: {} } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: PriceVServiceContract, useValue: PriceVServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreatePriceVComponent);

    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(getByTestId(root, 'price-v-type')).not.toBeNull();
    expect(getByTestId(root, 'cost')).not.toBeNull();
    expect(getByTestId(root, 'price')).not.toBeNull();
    expect(getByTestId(root, 'priceOverride')).not.toBeNull();
    expect(getByTestId(root, 'price-p-type')).not.toBeNull();
  });
});
