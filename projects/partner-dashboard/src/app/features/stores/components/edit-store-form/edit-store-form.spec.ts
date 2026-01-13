import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { EditStoreForm } from './edit-store-form';
import { By } from '@angular/platform-browser';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {StoreServiceContract} from '../../../../api/store/contracts/store-service.contract';

const mockStores = [
  { id: '1', name: 'Store 1', slug: 'store-1', description: 'Description 1', partnerId: 'p1' },
  { id: '2', name: 'Store 2', slug: 'store-2', description: 'Description 2', partnerId: 'p1' },
];

describe('EditStoreForm', () => {
  let component: EditStoreForm;
  let fixture: ComponentFixture<EditStoreForm>;

  const mockDialogRef = {
    close: vi.fn(),
  };

  const mockStoreService = {
    updateStore: vi.fn().mockReturnValue(of({})),
  };

  async function setup(data: any) {
    await TestBed.configureTestingModule({
      imports: [EditStoreForm],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: StoreServiceContract, useValue: mockStoreService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditStoreForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when editing a single store', () => {
    beforeEach(async () => {
      await setup({ store: mockStores[0], partnerId: () => 'p1' });
    });

    it('should not show the store selection dropdown', () => {
      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select).toBeNull();
    });

    it('should populate the form with the store data', () => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]')).nativeElement;
      expect(nameInput.value).toBe(mockStores[0].name);
    });
  });

  describe('when editing from a list of stores', () => {
    beforeEach(async () => {
      await setup({ stores: mockStores, partnerId: () => 'p1' });
    });

    it('should show the store selection dropdown', () => {
      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select).not.toBeNull();
    });

    it('should disable form fields initially', () => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]')).nativeElement;
      expect(nameInput.disabled).toBe(true);
    });

    it('should enable and populate form fields on store selection', async () => {
      const selectTrigger = fixture.debugElement.query(By.css('.mat-mdc-select-trigger')).nativeElement;
      selectTrigger.click();
      await fixture.whenStable();

      const options = document.querySelectorAll('mat-option');
      (options[1] as HTMLElement).click();
      await fixture.whenStable();

      const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]')).nativeElement;
      expect(nameInput.disabled).toBe(false);
      expect(nameInput.value).toBe(mockStores[1].name);
    });

    it('should call updateStore on submit', async () => {
      // Arrange: Select a store to enable the form
      const selectTrigger = fixture.debugElement.query(By.css('.mat-mdc-select-trigger')).nativeElement;
      selectTrigger.click();
      await fixture.whenStable();

      const matOption = document.querySelector('mat-option');
      (matOption as HTMLElement).click();
      await fixture.whenStable();

      // Act: Update the form's value directly on the component model
      component.storeForm.patchValue({ name: 'Updated Store Name' });
      await fixture.whenStable();

      // Find the save button and ensure it exists and is enabled
      const saveButtonDebugEl = fixture.debugElement.query(
        By.css('mat-dialog-actions button:last-child')
      );

      expect(saveButtonDebugEl).toBeTruthy();
      expect(saveButtonDebugEl.nativeElement.disabled).toBe(false);

      // Trigger the click
      saveButtonDebugEl.nativeElement.click();
      await fixture.whenStable();

      // Assert
      expect(mockStoreService.updateStore).toHaveBeenCalledWith(
        expect.objectContaining({ partnerId: 'p1', storeId: '1' }),
        expect.objectContaining({ name: 'Updated Store Name' }),
      );
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});
