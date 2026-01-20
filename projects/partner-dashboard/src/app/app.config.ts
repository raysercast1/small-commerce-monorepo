import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import {HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { NgrokSkipBrowserWarningInterceptor } from './shared/interceptors/ngrok-skip-browser-warning.interceptor';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import {StateServiceContract} from './shared/services/global-state/contracts/state-service.contract';
import {StateServiceImpl} from './shared/services/global-state/state.service';
import {StateServiceAuthContract} from './shared/services/global-state/contracts/state-service-auth.contract';
import {StateServicePartnerContract} from './shared/services/global-state/contracts/state-service-partner.contract';
import {STATE_SERVICE_TOKEN} from 'shared-core';

export const appConfig: ApplicationConfig = {
  providers: [
    // Existing Providers
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),

    // HttpClient with a chain of Interceptors
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NgrokSkipBrowserWarningInterceptor,
      multi: true
    },

    // Firebase Providers
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    {
      provide: StateServicePartnerContract, useClass: StateServiceImpl
    },
    {
      provide: STATE_SERVICE_TOKEN, useExisting: StateServiceImpl
    },
    {
      provide: StateServiceContract, useExisting: StateServicePartnerContract,
    },
    {
      provide: StateServiceAuthContract, useExisting: StateServicePartnerContract,
    }
  ]
};
