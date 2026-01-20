import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ErrorHandlingService } from '../global-error/error-handling.service';
import {STATE_SERVICE_TOKEN} from '../../tokens/api.tokens';

@Injectable({
  providedIn: 'root'
})
export class MakeRequestService {
  private http = inject(HttpClient);
  private stateService = inject(STATE_SERVICE_TOKEN);
  private errorHandlingService = inject(ErrorHandlingService);

  private handleRequest<T>(request: Observable<T>): Observable<T> {
    this.stateService.setLoading(true);
    this.stateService.clearError();
    return request.pipe(
      catchError(error => this.errorHandlingService.handleHttpError(error)),
      finalize(() => {
        this.stateService.setLoading(false);
      })
    );
  }

  get<T>(url: string, params: HttpParams = new HttpParams(), headers: HttpHeaders = new HttpHeaders()): Observable<T> {
    const request = this.http.get<T>(url, { params, headers });
    return this.handleRequest(request);
  }

  post<T>(url: string, body: any = {}, headers: HttpHeaders = new HttpHeaders()): Observable<T> {
    const request = this.http.post<T>(url, body, { headers });
    return this.handleRequest(request);
  }

  put<T>(url: string, body: any = {}, headers: HttpHeaders = new HttpHeaders()): Observable<T> {
    const request = this.http.put<T>(url, body, { headers });
    return this.handleRequest(request);
  }

  patch<T>(url: string, body: any = {}, headers: HttpHeaders = new HttpHeaders()): Observable<T> {
    const request = this.http.patch<T>(url, body, { headers });
    return this.handleRequest(request);
  }

  delete<T>(url: string, params: HttpParams = new HttpParams(), headers: HttpHeaders = new HttpHeaders()): Observable<T> {
    const request = this.http.delete<T>(url, { params, headers });
    return this.handleRequest(request);
  }
}
