import {Signal} from '@angular/core';
import {StateServicePartnerContract} from './state-service-partner.contract';
import {
  StateServiceInterface
} from 'shared-core';

export type AggregateState = {
  [key: string]: string | boolean | null;
}

export abstract class StateServiceContract extends StateServicePartnerContract implements StateServiceInterface {
  abstract readonly loading: Signal<boolean>;
  abstract readonly error: Signal<string | null>;
  abstract readonly partnerId: Signal<string | null>;
  abstract readonly storeId: Signal<string | null>;
  abstract readonly userId: Signal<string | null>;
  abstract readonly authToken: Signal<string | null>;
  abstract readonly state: Signal<AggregateState>;

  abstract setError(error: string | null): void;
  abstract clearError(): void;
  abstract setLoading(loading: boolean): void;
}
