import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CreateVariantForm } from './create-variant-form';
import { VariantServiceContract } from '../../../../api/variant/contracts/variant-service.contract';
import { ProductServiceContract } from '../../../../api/product/contracts/product-service.contract';

const dialogData = { partnerId: 'p1', productId: 'prod-1', storeId: 'store-1' } as const;

describe('CreateVariantForm', () => {
  let fixture: ComponentFixture<CreateVariantForm>;
  let component: CreateVariantForm;

  const mockDialogRef = { close: vi.fn() } as unknown as MatDialogRef<CreateVariantForm>;

  const variantServiceMock = {
    createProductVariant: vi.fn().mockReturnValue(of({ data: { id: 'v1', variantName: 'Blue Shirt' } })),
  } as unknown as VariantServiceContract;

  const productServiceMock = {
    addVariantsToProducts: vi.fn().mockReturnValue(of({ data: { ok: true } })),
  } as unknown as ProductServiceContract;

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [CreateVariantForm],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: VariantServiceContract, useValue: variantServiceMock },
        { provide: ProductServiceContract, useValue: productServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateVariantForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    await setup();
  });

  it('should render all expected form fields', () => {
    const nameInput = fixture.debugElement.query(By.css('input[formControlName="variantName"]'));
    const attrKey = fixture.debugElement.query(By.css('input[formControlName="attributeKey"]'));
    const attrVal = fixture.debugElement.query(By.css('input[formControlName="attributeValue"]'));
    const sku = fixture.debugElement.query(By.css('input[formControlName="sku"]'));
    const weight = fixture.debugElement.query(By.css('input[formControlName="weight"]'));
    const dimensions = fixture.debugElement.query(By.css('input[formControlName="dimensions"]'));
    const barcode = fixture.debugElement.query(By.css('input[formControlName="barcode"]'));
    const imageUrl = fixture.debugElement.query(By.css('input[formControlName="imageUrl"]'));
    const videoUrl = fixture.debugElement.query(By.css('input[formControlName="videoUrl"]'));

    expect(nameInput).toBeTruthy();
    expect(attrKey).toBeTruthy();
    expect(attrVal).toBeTruthy();
    expect(sku).toBeTruthy();
    expect(weight).toBeTruthy();
    expect(dimensions).toBeTruthy();
    expect(barcode).toBeTruthy();
    expect(imageUrl).toBeTruthy();
    expect(videoUrl).toBeTruthy();
  });

  it('should have submit disabled initially', () => {
    const submitBtn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]')).nativeElement as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('variantName and attributes are required (enables when valid)', async () => {
    component.variantForm.patchValue({ variantName: 'Variant A' });
    // attributes form array exists with one group; set both controls
    const attrGroup = component.attributesFA.at(0);
    attrGroup.patchValue({ attributeKey: 'color', attributeValue: 'blue' });
    await fixture.whenStable();

    const submitBtn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]')).nativeElement as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);
  });

  it('should call createProductVariant with correct args and close dialog on success', async () => {
    // fill minimal valid form
    component.variantForm.patchValue({ variantName: 'Blue Shirt', sku: 'SKU-1' });
    const attrGroup = component.attributesFA.at(0);
    attrGroup.patchValue({ attributeKey: 'color', attributeValue: 'blue' });
    await fixture.whenStable();

    const submitBtn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]'));
    (submitBtn.nativeElement as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(variantServiceMock.createProductVariant).toHaveBeenCalled();
    const [firstArg, payload] = (variantServiceMock.createProductVariant as any).mock.calls[0];

    expect(firstArg).toEqual({ partnerId: dialogData.partnerId, storeId: dialogData.storeId });
    expect(payload).toMatchObject({
      productId: dialogData.productId,
      variantName: 'Blue Shirt',
      attributes: { attributeKey: 'color', attributeValue: 'blue' },
    });

    expect(productServiceMock.addVariantsToProducts).toHaveBeenCalled();
    expect((mockDialogRef as any).close).toHaveBeenCalled();
  });

  it('should close dialog on cancel', async () => {
    const cancelBtn = fixture.debugElement.query(By.css('mat-dialog-actions button:not([color])'));
    (cancelBtn.nativeElement as HTMLButtonElement).click();
    await fixture.whenStable();
    expect((mockDialogRef as any).close).toHaveBeenCalled();
  });
});
