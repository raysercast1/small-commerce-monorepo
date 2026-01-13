import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auths/auth.service';
import { map } from 'rxjs/operators';

export const PartnerStoreGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const partnerId = route.paramMap.get('partnerId');

  if (!partnerId) {
    return router.parseUrl('/main');
  }

  return authService.isUserAuthorizedForPartner(partnerId).pipe(
    map(isAuthorized => {
      if (!isAuthorized) {
        return router.parseUrl('/main');
      }
      return true;
    })
  );
};
