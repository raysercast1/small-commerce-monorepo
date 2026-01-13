
import { Injectable, signal, WritableSignal, Signal, PLATFORM_ID, inject, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { I18nService, API_UNEXPECTED_ERROR_CODE } from '../i18n.service';
import {StateServiceAuthContract} from './contracts/state-service-auth.contract';

// Define a more specific type for the decoded token payload
interface AppTokenPayload {
  partnerId: string;
  sub: string; // Subject, typically the user's email or ID
  iat: number; // Issued at
  exp: number; // Expiration time
}

interface User {
  id: number; // We might not get this from the token, adjust as needed
  name: string; // The email will stand in for the name
  role: string; // Role information may not be in this token
}

type ThemePreference = 'light' | 'dark' | 'system';

const AUTH_TOKEN_KEY = 'auth_token';

@Injectable({
  providedIn: 'root'
})
export class StateServiceImpl extends StateServiceAuthContract {
  private platformId = inject(PLATFORM_ID);
  private i18n = inject(I18nService);
  private errorTimeout: any = null; // Holds the timer for auto-dismissing errors

  // --- State Signals ---
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  private currentUserSignal: WritableSignal<User | null> = signal(null);
  private themePreferenceSignal: WritableSignal<ThemePreference> = signal('system');

  private readonly _partnerId: WritableSignal<string | null> = signal(null);
  private readonly _storeId: WritableSignal<string | null> = signal(null);
  private readonly _userId: WritableSignal<string | null> = signal(null);
  private readonly _authToken: WritableSignal<string | null> = signal(null);

  // --- Readonly Signals for Public Consumption ---
  public readonly loading: Signal<boolean> = this._loading.asReadonly();
  public readonly error: Signal<string | null> = this._error.asReadonly();

  public readonly partnerId: Signal<string | null> = this._partnerId.asReadonly();
  public readonly storeId: Signal<string | null> = this._storeId.asReadonly();
  public readonly userId: Signal<string | null> = this._userId.asReadonly();
  public readonly authToken: Signal<string | null> = this._authToken.asReadonly();

  public readonly state = computed(() => ({
    partnerId: this._partnerId(),
    storeId: this._storeId(),
    userId: this._userId(),
    authToken: this._authToken(),
    loading: this._loading(),
    error: this._error()
  }));

  constructor() {
    super();
    this.loadInitialToken();
  }

  // --- Public Methods for State Mutation ---
  setLoading(isLoading: boolean): void {
    this._loading.set(isLoading);
  }

  setError(errorMessage: string | null): void {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }

    this._error.set(errorMessage);

    // Get the translated message for the specific error we want to auto-dismiss.
    const autoDismissMessage = this.i18n.getErrorMessage(API_UNEXPECTED_ERROR_CODE);

    // Only set a timer if the incoming message matches the one we want to auto-dismiss.
    if (errorMessage === autoDismissMessage) {
      this.errorTimeout = setTimeout(() => {
        this.clearError();
      }, 3000); // 3 seconds
    }
  }

  clearError(): void {
    this._error.set(null);
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
  }

  private loadInitialToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        this.setAuthToken(token);
      }
    }
  }

  setAuthToken(token: string | null): void {
    this._authToken.set(token);
    if (isPlatformBrowser(this.platformId)) {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        try {
          const decodedToken = jwtDecode<AppTokenPayload>(token);
          this.setPartnerId(decodedToken.partnerId || null);
          this.setUserId(decodedToken.sub || null);

          this.setCurrentUser({
            id: 0,
            name: decodedToken.sub,
            role: 'admin'
          });

        } catch (error) {
          console.error('Failed to decode application token:', error);
          this.clearAuth();
        }
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        this.clearAuth();
      }
    }
  }

  clearAuth(): void {
    this._authToken.set(null);
    this.clearUser();
    this.setPartnerId(null);
    this.setStoreId(null);
    this.setUserId(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }

  getCurrentUser(): User | null { return this.currentUserSignal(); }
  setCurrentUser(user: User | null): void { this.currentUserSignal.set(user); }
  clearUser(): void { this.currentUserSignal.set(null); }
  getThemePreference(): ThemePreference { return this.themePreferenceSignal(); }
  setThemePreference(preference: ThemePreference): void { this.themePreferenceSignal.set(preference); }
  setStoreId(id: string | null): void { this._storeId.set(id); }
  setPartnerId(id: string | null): void { this._partnerId.set(id); }
  setUserId(id: string | null): void { this._userId.set(id); }
}
