// import { TestBed } from '@angular/core/testing';
// import { provideHttpClient } from '@angular/common/http';
// import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
// import { MakeRequestService } from './make-request.service';
// import { provideZonelessChangeDetection } from '@angular/core';
// import { vi, describe, it, expect, beforeEach } from 'vitest';
// import {StateServiceAuthContract} from './global-state/contracts/state-service-auth.contract';
// import {StateServiceInterface} from '../global-state/contracts/state-service.contract';
//
// class MockStateService {
//   setLoading = vi.fn();
//   setError = vi.fn();
//   clearError = vi.fn();
// }
//
// describe('makeRequestService', () => {
//   let service: MakeRequestService;
//   let httpMock: HttpTestingController;
//   let stateService: MockStateService;
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [
//         MakeRequestService,
//         { provide: StateServiceAuthContract, useExisting: MockStateService },
//         { provide: StateServiceInterface, useClass: MockStateService },
//         provideZonelessChangeDetection(),
//         provideHttpClient(),
//         provideHttpClientTesting(),
//       ],
//     });
//
//     service = TestBed.inject(MakeRequestService);
//     httpMock = TestBed.inject(HttpTestingController);
//     stateService = TestBed.inject(StateServiceContract) as unknown as MockStateService;
//   });
//
//   it('should set loading to true and clear error on request start', () => {
//     service.get('/test').subscribe();
//     const req = httpMock.expectOne('/test');
//     expect(stateService.setLoading).toHaveBeenCalledWith(true);
//     expect(stateService.clearError).toHaveBeenCalled();
//     req.flush({});
//   });
//
//   it('should set loading to false on request success', () => {
//     service.get('/test').subscribe();
//     const req = httpMock.expectOne('/test');
//     req.flush({});
//     expect(stateService.setLoading).toHaveBeenCalledWith(false);
//   });
//
//   it('should set loading to false on request error', () => {
//     service.get('/test').subscribe({
//       error: () => {},
//     });
//     const req = httpMock.expectOne('/test');
//     req.flush({}, { status: 500, statusText: 'Server Error' });
//     expect(stateService.setLoading).toHaveBeenCalledWith(false);
//   });
//
//   it('should set error on request error', () => {
//     const expectedErrorMessage = 'A server-side error occurred.';
//     service.get('/test').subscribe({
//       error: () => {},
//     });
//     const req = httpMock.expectOne('/test');
//     req.flush({}, { status: 500, statusText: 'Server Error' });
//     expect(stateService.setError).toHaveBeenCalledWith(expectedErrorMessage);
//   });
// });
