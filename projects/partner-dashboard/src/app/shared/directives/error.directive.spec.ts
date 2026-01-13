// import { Component, signal } from '@angular/core';
// import { TestBed, ComponentFixture } from '@angular/core/testing';
// import { provideZonelessChangeDetection } from '@angular/core';
// import { ErrorDirective } from './error.directive';
// import { StateService } from '../services/global-state/state.service';
// import { vi, describe, it, expect, beforeEach } from 'vitest';
//
// @Component({
//   template: `<div appErrorDisplay></div>`,
//   standalone: true,
//   imports: [ErrorDirective],
// })
// class TestComponent {}
//
// class MockStateService {
//   error = signal<string | null>(null);
//   clearError = vi.fn(() => this.error.set(null));
// }
//
// describe('ErrorDirective', () => {
//   let fixture: ComponentFixture<TestComponent>;
//   let stateService: MockStateService;
//   let errorContainer: HTMLElement | null;
//
//   beforeEach(async () => {
//     TestBed.configureTestingModule({
//       imports: [TestComponent],
//       providers: [
//         { provide: StateService, useClass: MockStateService },
//         provideZonelessChangeDetection(),
//       ],
//     });
//
//     fixture = TestBed.createComponent(TestComponent);
//     stateService = TestBed.inject(StateService) as unknown as MockStateService;
//     await fixture.whenStable();
//     errorContainer = fixture.nativeElement.querySelector('.error-container');
//   });
//
//   it('should be created and hidden by default', () => {
//     expect(errorContainer).not.toBeNull();
//     expect(errorContainer?.style.display).toBe('none');
//   });
//
//   it('should be visible and display the correct message when an error is set', async () => {
//     const errorMessage = 'A test error occurred';
//     stateService.error.set(errorMessage);
//     await fixture.whenStable();
//
//     expect(errorContainer?.style.display).toBe('flex');
//     const messageElement = errorContainer?.querySelector('span');
//     expect(messageElement?.textContent).toContain(errorMessage);
//   });
//
//   it('should become hidden again when the error is cleared', async () => {
//     // Start as visible
//     stateService.error.set('An error');
//     await fixture.whenStable();
//     expect(errorContainer?.style.display).toBe('flex');
//
//     // Clear the error
//     stateService.clearError();
//     await fixture.whenStable();
//     expect(errorContainer?.style.display).toBe('none');
//   });
//
//   it('should call clearError when the close button is clicked', async () => {
//     stateService.error.set('An error to be cleared');
//     await fixture.whenStable();
//
//     const closeButton = errorContainer?.querySelector('button');
//     expect(closeButton).not.toBeNull();
//
//     closeButton?.click();
//
//     expect(stateService.clearError).toHaveBeenCalled();
//   });
// });
