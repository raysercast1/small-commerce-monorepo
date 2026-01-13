import { ComponentFixture, TestBed } from '@angular/core/testing';
import {Component, forwardRef, input, provideZonelessChangeDetection} from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { EditVariantForm } from './edit-variant-form';
import { Variant } from '../../../../shared/types/shared-types';
import { VariantServiceContract } from '../../../../api/variant/contracts/variant-service.contract';
import {ImageServiceContract} from '../../../../api/image/contracts/image-service.contract';
import {ImageManagementPage} from '../../../image/pages/image-management-page/image-management-page';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

const variants: Variant[] = [
  { id: 'v1', variantName: 'Red Small', name: 'Red Small', sku: 'RS', attributes: [{ attributeKey: 'color', attributeValue: 'red' }, { attributeKey: 'size', attributeValue: 'S' }] } as any,
  { id: 'v2', variantName: 'Blue Large', name: 'Blue Large', sku: 'BL', attributes: [{ attributeKey: 'color', attributeValue: 'blue' }, { attributeKey: 'size', attributeValue: 'L' }] } as any,
];

const partnerId = 'p1';
const productId = 'prod-1';

@Component({
  selector: 'app-image-management-page',
  standalone: true,
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageManagementPageStub),
      multi: true,
    },
  ],
})
class ImageManagementPageStub implements ControlValueAccessor {
  targetId = input<string | null | undefined>(null);
  triggerUpload = vi.fn().mockReturnValue(of([]));

  writeValue(value: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}
}

describe('EditVariantForm', () => {
  let fixture: ComponentFixture<EditVariantForm>;
  let component: EditVariantForm;

  const mockDialogRef = { close: vi.fn() } as unknown as MatDialogRef<EditVariantForm>;

  const variantServiceMock = {
    updateProductVariant: vi.fn().mockReturnValue(of({ data: { id: 'v1' } })),
  } as unknown as VariantServiceContract;

  const imageServiceMock = {
    assignImagesToVariant: vi.fn().mockReturnValue(of({ data: { success: true } })),
  } as unknown as ImageServiceContract;

  async function setup(data: any) {
    await TestBed.configureTestingModule({
      imports: [EditVariantForm],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: VariantServiceContract, useValue: variantServiceMock },
        { provide: ImageServiceContract, useValue: imageServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).overrideComponent(EditVariantForm, {
      remove: { imports: [ImageManagementPage] },
      add: { imports: [ImageManagementPageStub] }
    }).compileComponents();

    fixture = TestBed.createComponent(EditVariantForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list mode (no initial variant selected)', () => {
    beforeEach(async () => {
      await setup({ partnerId, productId, variants });
    });

    it('should render all expected form fields', () => {
      const select = fixture.debugElement.query(By.css('mat-select'));
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="variantName"]'));
      const attrKey = fixture.debugElement.query(By.css('input[formControlName="attributeKey"]'));
      const attrVal = fixture.debugElement.query(By.css('input[formControlName="attributeValue"]'));
      const sku = fixture.debugElement.query(By.css('input[formControlName="sku"]'));
      const barcode = fixture.debugElement.query(By.css('input[formControlName="barcode"]'));

      expect(select).toBeTruthy();
      expect(nameInput).toBeTruthy();
      expect(attrKey).toBeTruthy();
      expect(attrVal).toBeTruthy();
      expect(sku).toBeTruthy();
      expect(barcode).toBeTruthy();
    });

    it('should have submit disabled at initial state', () => {
      const saveBtn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]')).nativeElement as HTMLButtonElement;
      expect(saveBtn.disabled).toBe(true);
    });

    it('dropdown options should not be displayed initially, but appear on click', async () => {
      // no options panel before click
      expect(document.querySelectorAll('mat-option').length).toBe(0);

      const trigger = fixture.debugElement.query(By.css('mat-select'));
      (trigger.nativeElement as HTMLElement).click();
      await fixture.whenStable();

      const options = document.querySelectorAll('mat-option');
      expect(options.length).toBe(variants.length);
      const texts = Array.from(options).map(o => o.textContent?.trim());
      expect(texts).toContain('Red Small');
      expect(texts).toContain('Blue Large');
    });

    it('should pre-fill form when a variant is selected', async () => {
      const trigger = fixture.debugElement.query(By.css('mat-select'));
      (trigger.nativeElement as HTMLElement).click();
      await fixture.whenStable();
      const options = document.querySelectorAll('mat-option');
      (options[1] as HTMLElement).click(); // select Blue Large
      await fixture.whenStable();

      const nameInputEl = fixture.debugElement.query(By.css('input[formControlName="variantName"]')).nativeElement as HTMLInputElement;
      expect(nameInputEl.value).toBe('Blue Large');
    });

    it('should require variantName and attributes; enable submit when valid and call updateProductVariant', async () => {
      // select first variant to enable fields
      const trigger = fixture.debugElement.query(By.css('mat-select'));
      (trigger.nativeElement as HTMLElement).click();
      await fixture.whenStable();
      const options = document.querySelectorAll('mat-option');
      (options[0] as HTMLElement).click();
      await fixture.whenStable();

      // should be enabled now and valid if required fields present
      component.variantForm.patchValue({
        variantName: 'Changed Name',
        images: ['img.png']
      });
      component.variantForm.markAsDirty();
      await fixture.whenStable();

      const saveBtnDe = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]'));
      const saveBtn = saveBtnDe.nativeElement as HTMLButtonElement;
      expect(saveBtn.disabled).toBe(false);

      saveBtn.click();
      await fixture.whenStable();

      expect(variantServiceMock.updateProductVariant).toHaveBeenCalled();
      const [firstArg, payload] = (variantServiceMock.updateProductVariant as any).mock.calls[0];
      // selected variant id is v1
      expect(firstArg).toEqual({ partnerId, variantId: 'v1' });
      expect(payload).toMatchObject({ productId, variantName: 'Changed Name' });
      expect((mockDialogRef as any).close).toHaveBeenCalled();
    });

    it('should close dialog on cancel', async () => {
      const cancelBtn = fixture.debugElement.query(By.css('mat-dialog-actions button:not([color])'));
      (cancelBtn.nativeElement as HTMLButtonElement).click();
      await fixture.whenStable();
      expect((mockDialogRef as any).close).toHaveBeenCalled();
    });
  });

  describe('single variant mode (pre-selected variant)', () => {
    beforeEach(async () => {
      await setup({ partnerId, productId, variant: variants[0] });
    });

    it('should not show mat-option panel initially (closed)', () => {
      expect(document.querySelectorAll('mat-option').length).toBe(0);
    });

    it('should call updateProductVariant on save', async () => {
      component.variantForm.patchValue({ variantName: 'Updated', images: ['img31.png'] });
      component.variantForm.markAsDirty();
      await fixture.whenStable();

      const saveBtn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]'));
      saveBtn.nativeElement.click();
      await fixture.whenStable();

      expect(variantServiceMock.updateProductVariant).toHaveBeenCalledWith(
        { partnerId, variantId: 'v1' },
        expect.objectContaining({
          variantName: 'Updated'
        })
      );
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('upload image to variant', () => {
    beforeEach(async () => {
      const variantWithStore = {
        ...variants[0],
        product: { store: { id: 's1'} }
      };
      await setup({ partnerId, productId, variant: variantWithStore });
    });

    it('should render the image management should require variantName and attributes; enable submit when valid and call updateProductVariantnt component', () => {
      const imageModule = fixture.debugElement.query(By.css('app-image-management-page'));
      expect(imageModule).toBeTruthy();
      expect(imageModule.attributes['formControlName']).toBe('images');
    });

    it('should show a progress spinner when submitting', async () => {
      component.submitting.set(true);
      await fixture.whenStable();

      const overlay = fixture.debugElement.query(By.css('.blocking-overlay'));
      expect(overlay).toBeTruthy();

      const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should trigger image upload and assign images before updating variant', async () => {
      const mockImageIds = ['img-123'];
      const triggerUploadSpy = vi.fn().mockReturnValue(of(mockImageIds));

      component.imageManagementPage = {
        triggerUpload: triggerUploadSpy
      } as unknown as ImageManagementPage;

      component.variantForm.patchValue({
        variantName: 'Updated with Images',
        images: mockImageIds
      });
      component.variantForm.markAsDirty();
      await fixture.whenStable();

      const saveBtn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]'));
      (saveBtn.nativeElement as HTMLButtonElement).click();

      await fixture.whenStable();

      expect(triggerUploadSpy).toHaveBeenCalled();
      expect(imageServiceMock.assignImagesToVariant).toHaveBeenCalled();
      expect(variantServiceMock.updateProductVariant).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle cases where no images are uploaded', async () => {
      const triggerUploadSpy = vi.fn().mockReturnValue(of([]));
      component.imageManagementPage = { triggerUpload: triggerUploadSpy } as unknown as ImageManagementPage;

      component.variantForm.patchValue({ variantName: 'Updated with Images', images: ['random-img.jpeg']});
      component.variantForm.markAsDirty();

      await fixture.whenStable();

      const saveBtn = fixture.debugElement.query(By.css('mat-dialog-actions button[color="primary"]'));
      (saveBtn.nativeElement as HTMLButtonElement).click();

      await fixture.whenStable();

      expect(imageServiceMock.assignImagesToVariant).not.toHaveBeenCalled();
      expect(variantServiceMock.updateProductVariant).toHaveBeenCalled();
    });
  });
});
