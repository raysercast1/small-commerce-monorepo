import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RemoveVariantForm } from './remove-variant-form';
import { Variant } from '../../../../shared/types/shared-types';
import { VariantServiceContract } from '../../../../api/variant/contracts/variant-service.contract';

const variants: Variant[] = [
  { id: 'v1', variantName: 'Red Small', name: 'Red Small' } as any,
  { id: 'v2', variantName: 'Blue Large', name: 'Blue Large' } as any,
];

const partnerId = 'p1';
const productId = 'prod-1';

describe('RemoveVariantForm', () => {
  let fixture: ComponentFixture<RemoveVariantForm>;
  let component: RemoveVariantForm;

  const mockDialogRef = { close: vi.fn() } as unknown as MatDialogRef<RemoveVariantForm>;

  const variantServiceMock = {
    deleteProductVariant: vi.fn().mockReturnValue(of({ data: { ok: true } })),
  } as unknown as VariantServiceContract;

  async function setup(data: any) {
    await TestBed.configureTestingModule({
      imports: [RemoveVariantForm],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: VariantServiceContract, useValue: variantServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveVariantForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    await setup({ partnerId, productId, variants });
  });

  it('should call onVariantSelectionChange with correct argument on selection', async () => {
    const spy = vi.spyOn(component, 'onVariantSelectionChange');

    const select = fixture.debugElement.query(By.css('mat-select'));
    (select.nativeElement as HTMLElement).click();
    await fixture.whenStable();

    const options = document.querySelectorAll('mat-option');
    (options[1] as HTMLElement).click();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledWith('v2');
  });

  it('should call deleteProductVariant with correct args and close dialog on confirm', async () => {
    // select variant first
    const select = fixture.debugElement.query(By.css('mat-select'));
    (select.nativeElement as HTMLElement).click();
    await fixture.whenStable();
    const firstOption = document.querySelector('mat-option') as HTMLElement;
    firstOption.click();
    await fixture.whenStable();

    const removeBtn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="warn"]'));
    (removeBtn.nativeElement as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(variantServiceMock.deleteProductVariant).toHaveBeenCalled();
    const [args] = (variantServiceMock.deleteProductVariant as any).mock.calls[0];
    expect(args).toEqual({ partnerId, productId, variantId: 'v1' });

    expect((mockDialogRef as any).close).toHaveBeenCalled();
  });
});
