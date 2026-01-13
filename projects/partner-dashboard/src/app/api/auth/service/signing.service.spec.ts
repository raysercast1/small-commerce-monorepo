// import { TestBed } from '@angular/core/testing';
// import { provideHttpClient } from '@angular/common/http';
// import { HttpErrorResponse } from '@angular/common/http';
// import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
// import { provideZonelessChangeDetection } from '@angular/core';
// import { afterEach, describe, it, expect, vi, beforeEach } from 'vitest';
//
// import { SigningService } from './signing.service';
// import { StateService } from '../../../shared/services/global-state/state.service';
// import { FirebaseAuthService } from '../../../shared/services/auths/third-parties-auth/firebase-auth.service';
// import { I18nService } from '../../../shared/services/i18n.service';
// import { environment } from '../../../../environments/environment';
//
// describe('SigningService', () => {
//   let service: SigningService;
//   let httpMock: HttpTestingController;
//   let stateServiceMock: Partial<StateService>;
//   let firebaseAuthServiceMock: Partial<FirebaseAuthService>;
//   let i18nServiceMock: Partial<I18nService>;
//   const apiUrl = `${environment.baseUrl}${environment.domain}auth`;
//
//   vi.useFakeTimers({ toFake: ['setTimeout'] });
//
//   beforeEach(() => {
//     stateServiceMock = {
//       setAuthToken: vi.fn(),
//       clearAuth: vi.fn(),
//     };
//
//     firebaseAuthServiceMock = {
//       signInWithCustomToken: vi.fn(),
//       signOut: vi.fn(),
//     };
//
//     i18nServiceMock = {
//       getErrorMessage: vi.fn((key) => `Translated: ${key}`),
//     };
//
//     TestBed.configureTestingModule({
//       providers: [
//         SigningService,
//         { provide: StateService, useValue: stateServiceMock },
//         { provide: FirebaseAuthService, useValue: firebaseAuthServiceMock },
//         { provide: I18nService, useValue: i18nServiceMock },
//         provideZonelessChangeDetection(),
//         provideHttpClient(),
//         provideHttpClientTesting(),
//       ],
//     });
//
//     service = TestBed.inject(SigningService);
//     httpMock = TestBed.inject(HttpTestingController);
//   });
//
//   afterEach(() => {
//     httpMock.verify();
//   });
//
//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
//
//   describe('registerAndSignIn', () => {
//     it('should register and sign in a user successfully', async () => {
//       const registrationData = { email: 'test@example.com', password: 'password' };
//       const customToken = 'customToken';
//       const firebaseIdToken = 'firebaseIdToken';
//       const finalAuthToken = 'finalAuthToken';
//       const userCredential = { user: { getIdToken: () => Promise.resolve(firebaseIdToken) } };
//
//       (firebaseAuthServiceMock.signInWithCustomToken as any).mockReturnValue(Promise.resolve(userCredential));
//
//       service.registerAndSignIn(registrationData).subscribe(response => {
//         expect(response.data).toBe(finalAuthToken);
//       });
//
//       const req1 = httpMock.expectOne(`${apiUrl}/sign-up`);
//       expect(req1.request.method).toBe('POST');
//       req1.flush({ data: customToken });
//
//       await vi.advanceTimersByTimeAsync(1000);
//
//       const req2 = httpMock.expectOne(`${apiUrl}/admin/register?firebaseToken=${firebaseIdToken}`);
//       expect(req2.request.method).toBe('POST');
//       req2.flush({ data: finalAuthToken });
//
//       await vi.advanceTimersByTimeAsync(1000);
//
//       expect(firebaseAuthServiceMock.signInWithCustomToken).toHaveBeenCalledWith(customToken);
//       expect(stateServiceMock.setAuthToken).toHaveBeenCalledWith(finalAuthToken);
//     });
//
//     it('should handle http error on registration', () => {
//       const registrationData = { email: 'test@example.com', password: 'password' };
//       const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error', error: { errorCode: 'server_error' } });
//
//       service.registerAndSignIn(registrationData).subscribe({
//         error: (err) => {
//           expect(err.message).toBe('Translated: server_error');
//         }
//       });
//
//       const req = httpMock.expectOne(`${apiUrl}/sign-up`);
//       req.flush(errorResponse.error, { status: errorResponse.status, statusText: errorResponse.statusText });
//       expect(i18nServiceMock.getErrorMessage).toHaveBeenCalledWith('server_error');
//     });
//
//     it('should handle firebase error on signInWithCustomToken', async () => {
//       const registrationData = { email: 'test@example.com', password: 'password' };
//       const customToken = 'customToken';
//       const firebaseError = { code: 'auth/invalid-custom-token' };
//       (firebaseAuthServiceMock.signInWithCustomToken as any).mockReturnValue(Promise.reject(firebaseError));
//
//       service.registerAndSignIn(registrationData).subscribe({
//         error: (err) => {
//           expect(err.message).toBe('Translated: auth/invalid-custom-token');
//         }
//       });
//
//       const req = httpMock.expectOne(`${apiUrl}/sign-up`);
//       req.flush({ data: customToken });
//
//       await vi.advanceTimersByTimeAsync(1000);
//
//       expect(i18nServiceMock.getErrorMessage).toHaveBeenCalledWith('auth/invalid-custom-token');
//     });
//   });
//
//   describe('signIn', () => {
//     it('should sign in a user successfully', async () => {
//       const credentials = { email: 'test@example.com', password: 'password' };
//       const customToken = 'customToken';
//       const firebaseIdToken = 'firebaseIdToken';
//       const finalAuthToken = 'finalAuthToken';
//       const userCredential = { user: { getIdToken: () => Promise.resolve(firebaseIdToken) } };
//
//       (firebaseAuthServiceMock.signInWithCustomToken as any).mockReturnValue(Promise.resolve(userCredential));
//
//       service.signIn(credentials).subscribe(response => {
//         expect(response.data).toBe(finalAuthToken);
//       });
//
//       const req1 = httpMock.expectOne(`${apiUrl}/access-token`);
//       expect(req1.request.method).toBe('POST');
//       req1.flush({ data: customToken });
//
//       await vi.advanceTimersByTimeAsync(1000);
//
//       const req2 = httpMock.expectOne(`${apiUrl}/sign-in?firebaseToken=${firebaseIdToken}`);
//       expect(req2.request.method).toBe('POST');
//       req2.flush({ data: finalAuthToken });
//
//       await vi.advanceTimersByTimeAsync(1000);
//
//       expect(firebaseAuthServiceMock.signInWithCustomToken).toHaveBeenCalledWith(customToken);
//       expect(stateServiceMock.setAuthToken).toHaveBeenCalledWith(finalAuthToken);
//     });
//
//     it('should handle http error on getting access token', () => {
//       const credentials = { email: 'test@example.com', password: 'password' };
//       const errorResponse = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized', error: { errorCode: 'unauthorized' } });
//
//       service.signIn(credentials).subscribe({
//         error: (err) => {
//           expect(err.message).toBe('Translated: unauthorized');
//         }
//       });
//
//       const req = httpMock.expectOne(`${apiUrl}/access-token`);
//       req.flush(errorResponse.error, { status: errorResponse.status, statusText: errorResponse.statusText });
//       expect(i18nServiceMock.getErrorMessage).toHaveBeenCalledWith('unauthorized');
//     });
//   });
//
//   describe('signOut', () => {
//     it('should sign out a user successfully', async () => {
//       (firebaseAuthServiceMock.signOut as any).mockReturnValue(Promise.resolve());
//
//       service.signOut().subscribe(() => {
//         expect(firebaseAuthServiceMock.signOut).toHaveBeenCalled();
//         expect(stateServiceMock.clearAuth).toHaveBeenCalled();
//       });
//
//       await vi.advanceTimersByTimeAsync(1000);
//     });
//
//     it('should handle error on sign out', async () => {
//       const firebaseError = { code: 'auth/error' };
//       (firebaseAuthServiceMock.signOut as any).mockReturnValue(Promise.reject(firebaseError));
//
//       service.signOut().subscribe({
//         error: () => {
//           expect(firebaseAuthServiceMock.signOut).toHaveBeenCalled();
//           expect(stateServiceMock.clearAuth).not.toHaveBeenCalled();
//         }
//       });
//
//       await vi.advanceTimersByTimeAsync(1000);
//     });
//   });
// });
