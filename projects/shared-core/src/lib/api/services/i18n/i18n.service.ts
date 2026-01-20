import { Injectable, signal, WritableSignal } from '@angular/core';
import {
  API_UNEXPECTED_ERROR_CODE,
  AUTH_FIREBASE_ERROR_CODE, AUTH_INVALID_CREDENTIAL_CODE, AUTH_USER_NOT_FOUND_CODE, AUTH_WRONG_PASSWORD_CODE,
  CLIENT_NETWORK_ERROR_CODE,
  DEFAULT_ERROR_CODE, DEFAULT_SUCCESS_CODE, RESOURCE_NOT_FOUND_CODE, SERVER_ERROR_CODE,
  UI_HELLO_KEY, UI_WELCOME_KEY, VALIDATION_EMAIL_KEY, VALIDATION_MINLENGTH_KEY, VALIDATION_REQUIRED_KEY
} from './i18n-types'
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
