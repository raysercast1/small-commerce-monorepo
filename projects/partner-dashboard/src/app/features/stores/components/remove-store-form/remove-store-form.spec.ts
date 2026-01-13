import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { RemoveStoreForm } from './remove-store-form';
import { By } from '@angular/platform-browser';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {StoreServiceContract} from '../../../../api/store/contracts/store-service.contract';

const mockStores = [
  { id: '1', name: 'Store 1', slug: 'store-1', description: 'Description 1', partnerId: 'p1' },
  { id: '2', name: 'Store 2', slug: 'store-2', description: 'Description 2', partnerId: 'p1' },
];

describe('RemoveStoreForm', () => {
  let fixture: ComponentFixture<RemoveStoreForm>;

  const mockDialogRef = {
    close: vi.fn(),
  };

  const mockStoreService = {
    deleteStore: vi.fn().mockReturnValue(of({data: true, message: 'Store remove successfully', timestamp: 'random-time'})),
  };

  async function setup(data: any) {
    await TestBed.configureTestingModule({
      imports: [RemoveStoreForm],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: StoreServiceContract, useValue: mockStoreService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveStoreForm);
    await fixture.whenStable();
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when removing a single store', () => {
    beforeEach(async () => {
      await setup({ store: mockStores[0], partnerId: () => 'p1' });
    });

it('should not show the store selection dropdown', () => {
      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select).toBeNull();
    });

    it('should show the confirmation message for the specific store', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Are you sure you want to remove the store "Store 1"?');
    });
  });

  describe('when removing from a list of stores', () => {
    beforeEach(async () => {
      await setup({ stores: mockStores, partnerId: () => 'p1' });
    });

    it('should show the store selection dropdown', () => {
      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select).not.toBeNull();
    });

    it('should disable the remove button initially', () => {
      const removeButton = fixture.debugElement.query(By.css('button[color="warn"]')).nativeElement;
      expect(removeButton.disabled).toBe(true);
    });

    it('should enable the remove button and show confirmation on store selection', async () => {
      const selectTrigger = fixture.debugElement.query(By.css('.mat-mdc-select-trigger')).nativeElement;
      selectTrigger.click();
      await fixture.whenStable();

      const options = document.querySelectorAll('mat-option');
      (options[1] as HTMLElement).click();
      await fixture.whenStable();

      const removeButton = fixture.debugElement.query(By.css('button[color="warn"]')).nativeElement;
      expect(removeButton.disabled).toBe(false);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Are you sure you want to remove the store "Store 2"?');
    });

    it('should call deleteStore on confirm', async () => {
      // Arrange: Select a store to enable the button
      const selectTrigger = fixture.debugElement.query(By.css('.mat-mdc-select-trigger')).nativeElement;
      selectTrigger.click();
      await fixture.whenStable();

      const matOption = document.querySelector('mat-option');
      (matOption as HTMLElement).click();
      await fixture.whenStable();

      // Act: Find the remove button and click it
      const removeButtonDebugEl = fixture.debugElement.query(By.css('button[color="warn"]'));

      expect(removeButtonDebugEl).toBeTruthy();
      expect(removeButtonDebugEl.nativeElement.disabled)
        .toBe(false);

      removeButtonDebugEl.nativeElement.click();
      await fixture.whenStable();

      // Assert
      expect(mockStoreService.deleteStore).toHaveBeenCalledWith({storeId: '1', partnerId: 'p1'});

      const expectedResponse = { response: { data: true, message: 'Store remove successfully', timestamp: 'random-time' }, storeId: '1' };
      expect(mockDialogRef.close).toHaveBeenCalledWith(expectedResponse);
    });
  });
});
