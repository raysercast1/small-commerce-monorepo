import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {catchError, from, Observable, throwError} from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { FirebaseAuthService } from '../../../shared/services/auths/third-parties-auth/firebase-auth.service';
import {
  AUTH_FIREBASE_ERROR_CODE,
  DEFAULT_ERROR_CODE,
  I18nService,
  SERVER_ERROR_CODE
} from '../../../shared/services/i18n.service';
import {CredentialsParameters, SignInServiceContract} from '../contracts/signin-service.contract';
import {MakeRequestService} from '../../../shared/services/make-request.service';
import {StateServiceAuthContract} from '../../../shared/services/global-state/contracts/state-service-auth.contract';

@Injectable({
  providedIn: 'root'
})
export class SignInServiceImpl extends SignInServiceContract {
  private stateService = inject(StateServiceAuthContract);
  private i18n = inject(I18nService);
  private firebaseAuthService = inject(FirebaseAuthService);
  private makeRequest = inject(MakeRequestService);
  private apiUrl = `${environment.baseUrl}${environment.domain}auth`;

  registerAndSignIn(registrationData: CredentialsParameters): Observable<any> {
    return this.makeRequest.post<any>(`${this.apiUrl}/sign-up`, registrationData).pipe(
      switchMap(response => from(this.firebaseAuthService.signInWithCustomToken(response.data))),
      switchMap(userCredential => from(userCredential.user.getIdToken())),
      switchMap(firebaseIdToken => this.makeRequest.post<any>(`${this.apiUrl}/admin/register?firebaseToken=${firebaseIdToken}`, {})),
      tap(finalResponse => {
        if (finalResponse && finalResponse.data) {
          this.stateService.setAuthToken(finalResponse.data);
        }
      }),
      catchError(err => this.handleAuthError(err))
    );
  }

  signIn(credentials: CredentialsParameters): Observable<string> {
    return this.makeRequest.post<any>(`${this.apiUrl}/access-token`, credentials).pipe(
      switchMap(response => from(this.firebaseAuthService.signInWithCustomToken(response.data))),
      switchMap(userCredential => from(userCredential.user.getIdToken())),
      switchMap(firebaseIdToken => this.makeRequest.post<any>(`${this.apiUrl}/sign-in?firebaseToken=${firebaseIdToken}`, {})),
      tap((finalResponse: any) => {
        if (finalResponse && finalResponse.data) {
          this.stateService.setAuthToken(finalResponse.data);
        }
      }),
      catchError(err => this.handleAuthError(err))
    );
  }

  signOut(): Observable<void> {
    return from(this.firebaseAuthService.signOut()).pipe(
      tap(() => this.stateService.clearAuth())
    );
  }

  private handleAuthError(err: any) {
    let errorCode = DEFAULT_ERROR_CODE;

    if (err instanceof HttpErrorResponse) {
      errorCode = err.error?.errorCode || SERVER_ERROR_CODE;
    } else if (err.code) {
      errorCode = AUTH_FIREBASE_ERROR_CODE;
    }

    const errorMessage = this.i18n.getErrorMessage(errorCode);
    return throwError(() => new Error(errorMessage));
  }
}
