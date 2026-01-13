import { Injectable, signal, WritableSignal } from '@angular/core';

// --- Exported Constants for Success Codes ---
export const DEFAULT_SUCCESS_CODE = 201;

// --- Exported Constants for UI Text Keys ---
export const UI_HELLO_KEY = 'hello';
export const UI_WELCOME_KEY = 'welcome';

// --- Exported Constants for Error Codes ---
export const DEFAULT_ERROR_CODE = 'default';
export const SERVER_ERROR_CODE = 'server_error';
export const RESOURCE_NOT_FOUND_CODE = 'resource_not_found';
export const API_UNEXPECTED_ERROR_CODE = 'api_unexpected';
export const CLIENT_NETWORK_ERROR_CODE = 'client_network_error';

// Auth-related error codes
export const AUTH_INVALID_CREDENTIAL_CODE = 'auth/invalid-credential';
export const AUTH_USER_NOT_FOUND_CODE = 'auth/user-not-found';
export const AUTH_WRONG_PASSWORD_CODE = 'auth/wrong-password';
export const AUTH_FIREBASE_ERROR_CODE = 'auth/firebase-error';

// --- Exported Constants for Form Validation Error Keys ---
export const VALIDATION_REQUIRED_KEY = 'validation/required';
export const VALIDATION_EMAIL_KEY = 'validation/email';
export const VALIDATION_MINLENGTH_KEY = 'validation/minlength';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private currentLanguage: WritableSignal<string> = signal('en');

  // --- UI Translations ---
  private translations: { [key: string]: { [lang: string]: string } } = {
    [UI_HELLO_KEY]: { 'en': 'Hello', 'es': 'Hola' },
    [UI_WELCOME_KEY]: { 'en': 'Welcome', 'es': 'Bienvenido' },
  };

  // --- Centralized Error Messages ---
  private errorMessages: { [errorCode: string]: { [lang: string]: string } } = {
    [DEFAULT_ERROR_CODE]: { 'en': 'An unknown error occurred. Please try again.', 'es': 'Ocurrió un error desconocido. Por favor, inténtalo de nuevo.' },
    [SERVER_ERROR_CODE]: { 'en': 'A server-side error occurred.', 'es': 'Ocurrió un error en el servidor.' },
    [CLIENT_NETWORK_ERROR_CODE]: { 'en': 'A client-side or network error occurred.', 'es': 'Ocurrió un error de red o del lado del cliente.' },
    [RESOURCE_NOT_FOUND_CODE]: { 'en': 'The requested resource was not found.', 'es': 'No se encontró el recurso solicitado.' },
    [API_UNEXPECTED_ERROR_CODE]: { 'en': 'An unexpected API error occurred.', 'es': 'Ocurrió un error inesperado en la API.' },

    // Auth messages
    [AUTH_INVALID_CREDENTIAL_CODE]: { 'en': 'Invalid credentials. Please check your email and password.', 'es': 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.' },
    [AUTH_USER_NOT_FOUND_CODE]: { 'en': 'Invalid credentials. Please check your email and password.', 'es': 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.' },
    [AUTH_WRONG_PASSWORD_CODE]: { 'en': 'Invalid credentials. Please check your email and password.', 'es': 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.' },
    [AUTH_FIREBASE_ERROR_CODE]: { 'en': 'Firebase error credentials. Please check your email and password.', 'es': 'Credenciales inválidas para Firebase. Por favor, verifica tu correo y contraseña.' },

    // Form Validation Errors
    [VALIDATION_REQUIRED_KEY]: { 'en': 'This field is required.', 'es': 'Este campo es obligatorio.' },
    [VALIDATION_EMAIL_KEY]: { 'en': 'Please enter a valid email address.', 'es': 'Por favor, introduce una dirección de correo válida.' },
    [VALIDATION_MINLENGTH_KEY]: { 'en': 'Password must be at least 8 characters long.', 'es': 'La contraseña debe tener al menos 8 caracteres.' }
  };

  private successMessages: { [successCode: number]: { [lang: string]: string } } = {
    [DEFAULT_SUCCESS_CODE]: { 'en': 'Resource successfully created.' },
  }

  setLanguage(lang: string): void {
    this.currentLanguage.set(lang);
  }

  getTranslation(key: string): string {
    const lang = this.currentLanguage();
    const message = this.translations[key]?.[lang];
    return message || key; // Fallback to key if translation not found
  }

  getErrorMessage(errorCode: string): string {
    const lang = this.currentLanguage();
    const message = this.errorMessages[errorCode]?.[lang];
    return message || this.errorMessages[DEFAULT_ERROR_CODE][lang];
  }

  getCurrentLanguage(): string {
    return this.currentLanguage();
  }

  getSuccessMessage(successCode: number): string {
    const lang = this.currentLanguage();
    const message = this.successMessages[successCode]?.[lang];
    return message || this.successMessages[DEFAULT_SUCCESS_CODE]?.[lang];
  }
}
