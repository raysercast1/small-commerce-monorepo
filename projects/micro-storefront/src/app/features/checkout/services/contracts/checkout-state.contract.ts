import { Signal } from '@angular/core';
import { Order, CheckoutFormData } from '../../../../shared/types/storefront-types';

export abstract class CheckoutStateContract {
  abstract readonly order: Signal<Order | null>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly error: Signal<string | null>;
  abstract readonly validationErrors: Signal<string[]>;

  abstract createOrder(storeId: string, sessionId: string, formData: CheckoutFormData): void;
  abstract validateCheckout(storeId: string, sessionId: string): void;
}
