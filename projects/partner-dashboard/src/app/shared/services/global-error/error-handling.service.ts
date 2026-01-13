import { Injectable, ErrorHandler, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoggingService } from '../logging.service';
import {
  I18nService,
  API_UNEXPECTED_ERROR_CODE,
  CLIENT_NETWORK_ERROR_CODE,
  RESOURCE_NOT_FOUND_CODE,
  SERVER_ERROR_CODE
} from '../i18n.service';
import {StateServiceContract} from '../global-state/contracts/state-service.contract';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService implements ErrorHandler {
  private loggingService = inject(LoggingService);
  private stateService = inject(StateServiceContract);
  private i18n = inject(I18nService);

  handleHttpError(error: HttpErrorResponse): Observable<never> {
    let errorCode: string;

    if (error.error instanceof ErrorEvent) {
      errorCode = CLIENT_NETWORK_ERROR_CODE;
      this.loggingService.error(`Client-side Error: ${error.message} `, error);
    } else {
      this.loggingService.error(`API Error: ${error.status} ${error.statusText}`, error);

      if (error.error && typeof error.error === 'object') {
        this.loggingService.error('Full API Response Error Body:', error.error);
      } else if (typeof error.error === 'string') {
        this.loggingService.error('API Response Error:', error.error);
      }

      if (error.status === 404) {
        errorCode = RESOURCE_NOT_FOUND_CODE;
      } else if (error.status >= 500) {
        errorCode = SERVER_ERROR_CODE;
      } else {
        errorCode = API_UNEXPECTED_ERROR_CODE;
      }
    }

    const userMessage = this.i18n.getErrorMessage(errorCode);
    this.stateService.setError(userMessage);
    return throwError(() => new Error(userMessage));
  }

  /**
   * This is for non-HTTP errors, such as application-level errors.
   * @param error The error object
   * @returns void
   */
  handleError(error: any): void {
    this.loggingService.error('An unexpected application error occurred:', error);
    //TODO: Set a generic error in the state here as well.
  }
}
