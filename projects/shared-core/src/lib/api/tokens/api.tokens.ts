import {InjectionToken} from '@angular/core';
import {StateServiceInterface} from '../services/global-state/contracts/state-service.contract';

export const STATE_SERVICE_TOKEN = new InjectionToken<StateServiceInterface>('STATE_SERVICE_TOKEN');
