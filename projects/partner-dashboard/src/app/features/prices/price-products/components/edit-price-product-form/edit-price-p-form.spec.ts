import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EditPricePComponent } from './edit-price-p-form';
import {PricePServiceContract} from '../../../../../api/price/contracts/price-p-service.contract';

function getByTestId(el: HTMLElement, id: string): HTMLElement | null {
  return el.querySelector(`[data-testid="${id}"]`);
}

class PricePServiceMock {
  updatePriceForProduct = vi.fn();
}

describe('EditPricePComponent', () => {
  it('renders Product fields when mode="product"', async () => {
    await TestBed.configureTestingModule({
      imports: [EditPricePComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'product', value: {} } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: PricePServiceContract, useValue: PricePServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditPricePComponent);

    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(getByTestId(root, 'product-p-form')).toBeNull();
    expect(getByTestId(root, 'cost')).not.toBeNull();
    expect(getByTestId(root, 'price')).not.toBeNull();
    expect(getByTestId(root, 'priceOverride')).not.toBeNull();
  });
});
