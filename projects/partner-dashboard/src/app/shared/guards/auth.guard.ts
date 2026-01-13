import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import {StateServiceAuthContract} from '../services/global-state/contracts/state-service-auth.contract';

export const authGuard: CanActivateFn = () => {
  const stateService = inject(StateServiceAuthContract);
  const router = inject(Router);

  // We need to use an observable to work with the guard's return type.
  // toObservable will emit the current value of the signal and any subsequent changes.
  return toObservable(stateService.authToken).pipe(
    map(token => {
      if (token) {
        // User is authenticated, allow access to the route.
        return true;
      } else {
        // User is not authenticated, redirect to the auth page.
        // The UrlTree will cancel the current navigation and start a new one.
        return router.createUrlTree(['/auth']);
      }
    })
  );
};
