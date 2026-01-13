import { Injectable, computed, inject } from '@angular/core';
import { of } from 'rxjs';
import {StateServiceAuthContract} from '../global-state/contracts/state-service-auth.contract';

interface User {
  id: string | null;
  username: string;
  partnerId: string | null;
  roles: string[];
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly stateService = inject(StateServiceAuthContract);

  // Derive the user's login status and current user data directly
  // from the authToken signal in the StateService.
  isLoggedIn = computed(() => !!this.stateService.authToken());
  currentUser = computed<User | null>(() => {
    // If the user is logged in, we can construct a user object.
    // This could be enhanced to decode the token if more info is needed.
    if (this.isLoggedIn()) {
      return {
        id: this.stateService.userId(),
        username: 'user-from-token', // Placeholder, consider decoding token for real username
        partnerId: this.stateService.partnerId(),
        roles: ['user'], // Placeholder, consider decoding token for roles
        permissions: [] // Explicitly typed as string[]
      };
    }
    return null;
  });

  // The login and logout logic is now primarily handled by the StateService
  // when the auth token is set or cleared. These methods can be simplified
  // or removed if direct interaction is no longer needed in this service.

  login(username: string, password: string): Promise<boolean> {
    // This method would now likely call a service that authenticates
    // and then calls `stateService.setAuthToken(token)`.
    // For now, we'll leave it as a placeholder.
    console.warn('Login method in AuthService should be updated to use SigningService.');
    return Promise.resolve(false);
  }

  logout(): void {
    // The actual clearing of the token and state is done in StateService.
    this.stateService.clearAuth();
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  // hasRole and hasPermission can be adapted if roles/permissions are
  // added to the decoded token in StateService.

  hasRole(roles: string | string[]): boolean {
    const user = this.currentUser();
    if (!user || !user.roles) {
      return false;
    }
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.some(role => user.roles.includes(role));
  }

  hasPermission(permissions: string | string[]): boolean {
    const user = this.currentUser();
    if (!user || !user.permissions) {
      return false;
    }
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    return requiredPermissions.some(permission => user.permissions.includes(permission));
  }

  isUserAuthorizedForPartner(partnerIdFromRoute: string) {
    // Get the partnerId from the state service, which is derived from the token.
    const userPartnerId = this.stateService.partnerId();

    // Check if the user is logged in and their partnerId matches the one from the URL.
    const isAuthorized = !!userPartnerId && userPartnerId === partnerIdFromRoute;

    // Return the result as an observable, which guards expect.
    return of(isAuthorized);
  }
}
