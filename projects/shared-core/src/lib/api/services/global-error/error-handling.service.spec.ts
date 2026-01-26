// import { TestBed } from '@angular/core/testing';
// import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
// import { HttpErrorResponse } from '@angular/common/http';
// import { provideZonelessChangeDetection } from '@angular/core';
//
// // Service under test
// import { ErrorHandlingService } from './error-handling.service';
//
// // Mocked dependencies
// import { LoggingService } from '../logging.service';
// import { StateService } from '../global-state/state.service';
// import {
//   I18nService,
//   CLIENT_NETWORK_ERROR_CODE,
//   RESOURCE_NOT_FOUND_CODE,
//   SERVER_ERROR_CODE
// } from '../i18n.service';
//
// // --- Mocks ---
//
// class MockLoggingService {
//   error = vi.fn();
// }
//
// class MockStateService {
//   setError = vi.fn();
// }
//
// class MockI18nService {
//   messages: Record<string, string> = {
//     [RESOURCE_NOT_FOUND_CODE]: 'The requested resource was not found.',
//     [SERVER_ERROR_CODE]: 'A server-side error occurred.',
//     [CLIENT_NETWORK_ERROR_CODE]: 'A client-side or network error occurred.',
//   };
//
//   getErrorMessage = vi.fn((code: string) => {
//     return this.messages[code] || 'An unexpected error occurred.';
//   });
// }
//
// describe('ErrorHandlingService', () => {
//   let service: ErrorHandlingService;
//   let loggingService: MockLoggingService;
//   let stateService: MockStateService;
//   let i18nService: MockI18nService;
//
//   beforeAll(() => {
//     TestBed.configureTestingModule({
//       providers: [
//         ErrorHandlingService,
//         provideZonelessChangeDetection(),
//         { provide: LoggingService, useClass: MockLoggingService },
//         { provide: StateService, useClass: MockStateService },
//         { provide: I18nService, useClass: MockI18nService },
//       ],
//     });
//     service = TestBed.inject(ErrorHandlingService);
//     loggingService = TestBed.inject(LoggingService) as unknown as MockLoggingService;
//     stateService = TestBed.inject(StateService) as unknown as MockStateService;
//     i18nService = TestBed.inject(I18nService) as unknown as MockI18nService;
//   });
//
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });
//
//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
//
//   describe('handleHttpError', () => {
//     it('should handle a 404 error', () => {
//       const errorResponse = new HttpErrorResponse({
//         error: 'Not Found',
//         status: 404,
//         statusText: 'Not Found',
//       });
//       const expectedErrorMessage = 'The requested resource was not found.';
//
//       service.handleHttpError(errorResponse).subscribe({
//         error: (err) => {
//           expect(err).toBeInstanceOf(Error);
//           expect(err.message).toBe(expectedErrorMessage);
//         },
//       });
//
//       expect(stateService.setError).toHaveBeenCalledWith(expectedErrorMessage);
//       expect(loggingService.error).toHaveBeenCalledWith('API Error: 404 Not Found', errorResponse);
//       expect(i18nService.getErrorMessage).toHaveBeenCalledWith(RESOURCE_NOT_FOUND_CODE);
//     });
//
//     it('should handle a 500 error', () => {
//       const errorResponse = new HttpErrorResponse({
//         error: 'Internal Server Error',
//         status: 500,
//         statusText: 'Server Error',
//       });
//       const expectedErrorMessage = 'A server-side error occurred.';
//
//       service.handleHttpError(errorResponse).subscribe({
//         error: (err) => {
//           expect(err).toBeInstanceOf(Error);
//           expect(err.message).toBe(expectedErrorMessage);
//         },
//       });
//
//       expect(stateService.setError).toHaveBeenCalledWith(expectedErrorMessage);
//       expect(loggingService.error).toHaveBeenCalledWith('API Error: 500 Server Error', errorResponse);
//       expect(i18nService.getErrorMessage).toHaveBeenCalledWith(SERVER_ERROR_CODE);
//     });
//
//     it('should handle a client-side or network error', () => {
//       const errorEvent = new ErrorEvent('Network error', {
//         message: 'A network error occurred',
//       });
//       const errorResponse = new HttpErrorResponse({ error: errorEvent, status: 0, statusText: 'Unknown Error' });
//       const expectedErrorMessage = 'A client-side or network error occurred.';
//
//       service.handleHttpError(errorResponse).subscribe({
//         error: (err) => {
//           expect(err).toBeInstanceOf(Error);
//           expect(err.message).toBe(expectedErrorMessage);
//         },
//       });
//
//       expect(stateService.setError).toHaveBeenCalledWith(expectedErrorMessage);
//       expect(loggingService.error).toHaveBeenCalledWith(`Client-side Error: ${errorResponse.message} `, errorResponse);
//       expect(i18nService.getErrorMessage).toHaveBeenCalledWith(CLIENT_NETWORK_ERROR_CODE);
//     });
//   });
//
//   describe('handleError (Global ErrorHandler)', () => {
//     it('should log an unexpected error', () => {
//       const testError = new Error('Unexpected error');
//       service.handleError(testError);
//       expect(loggingService.error).toHaveBeenCalledWith('An unexpected application error occurred:', testError);
//     });
//   });
// });
