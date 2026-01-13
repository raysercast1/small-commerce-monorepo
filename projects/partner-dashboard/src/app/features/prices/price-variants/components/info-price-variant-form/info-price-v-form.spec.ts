import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { InfoPriceVComponent } from './info-price-v-form';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

function getByTestId(el: HTMLElement, id: string): HTMLElement | null {
  return el.querySelector(`[data-testid="${id}"]`);
}

describe('InfoPriceVComponent', () => {
  it('shows variant info fields in variant mode', async () => {
    await TestBed.configureTestingModule({
      imports: [InfoPriceVComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: { value: { id: '1', type: 'VIP', cost: 9, price: 10 }, variantId: 'v1', productId:'p1' } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(InfoPriceVComponent);

    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(getByTestId(root, 'variant-info')).not.toBeNull();
    expect(getByTestId(root, 'variantId')?.textContent).toContain('v1');
    expect(getByTestId(root, 'cost')).not.toBeNull();
    expect(getByTestId(root, 'price')).not.toBeNull();
    expect(getByTestId(root, 'type')).not.toBeNull();
  });
});
