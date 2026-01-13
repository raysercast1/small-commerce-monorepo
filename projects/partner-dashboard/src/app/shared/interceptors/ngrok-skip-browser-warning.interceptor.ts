
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class NgrokSkipBrowserWarningInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request and add the custom header
    const clonedReq = req.clone({
      headers: req.headers.set('ngrok-skip-browser-warning', 'true'),
    });
    // Pass the cloned request instead of the original
    return next.handle(clonedReq);
  }
}
