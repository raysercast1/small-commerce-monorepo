import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LoadingDirective } from './loading.directive';
import { describe, it, expect, beforeEach } from 'vitest';
import {StateServiceContract} from '../services/global-state/contracts/state-service.contract';

@Component({
  template: `<div appLoadingIndicator></div>`,
  standalone: true,
  imports: [LoadingDirective],
})
class TestComponent {}

class MockStateService {
  loading = signal(false);
}

describe('LoadingDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let stateService: MockStateService;
  let loadingOverlay: HTMLElement | null;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        { provide: StateServiceContract, useClass: MockStateService },
        provideZonelessChangeDetection(),
      ],
    });

    fixture = TestBed.createComponent(TestComponent);
    stateService = TestBed.inject(StateServiceContract) as unknown as MockStateService;
    // The directive initializes the overlay immediately. We wait for it to be stable.
    await fixture.whenStable();
    loadingOverlay = fixture.nativeElement.querySelector('.loading-overlay');
  });

  it('should be created and hidden by default', () => {
    expect(loadingOverlay).not.toBeNull();
    expect(loadingOverlay?.style.display).toBe('none');
  });

  it('should be visible when loading is true', async () => {
    stateService.loading.set(true);
    await fixture.whenStable();
    expect(loadingOverlay?.style.display).toBe('flex');
  });

  it('should become hidden again when loading becomes false', async () => {
    // Start as visible
    stateService.loading.set(true);
    await fixture.whenStable();
    expect(loadingOverlay?.style.display).toBe('flex');

    // Change to hidden
    stateService.loading.set(false);
    await fixture.whenStable();
    expect(loadingOverlay?.style.display).toBe('none');
  });
});
