import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { InfoPricePComponent } from './info-price-p-form';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

function getByTestId(el: HTMLElement, id: string): HTMLElement | null {
  return el.querySelector(`[data-testid="${id}"]`);
}

describe('InfoPricePComponent', () => {
  it('shows product info fields in product mode', async () => {
    await TestBed.configureTestingModule({
      imports: [InfoPricePComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: { value: { currency: 'USD', type: 'STANDARD', cost: 1, price: 2 }, productId: 'p1'} },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(InfoPricePComponent);

    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(getByTestId(root, 'product-info')).not.toBeNull();
    expect(getByTestId(root, 'cost')).not.toBeNull();
    expect(getByTestId(root, 'price')).not.toBeNull();
    expect(getByTestId(root, 'currency')?.textContent).toContain('USD');
    expect(getByTestId(root, 'productId')?.textContent).toContain('p1');
    expect(getByTestId(root, 'type')?.textContent).toContain('STANDARD');
  });
});
