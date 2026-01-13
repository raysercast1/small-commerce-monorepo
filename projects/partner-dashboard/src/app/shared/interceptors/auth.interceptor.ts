import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import {StateServiceAuthContract} from '../services/global-state/contracts/state-service-auth.contract';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private stateService = inject(StateServiceAuthContract);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.stateService.authToken();

    if (authToken) {
      // Clone the request to add the new header.
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`)
      });

      // Pass on the cloned request instead of the original request.
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
