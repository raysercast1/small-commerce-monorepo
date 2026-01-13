import { Signal } from '@angular/core';
import {Price} from '../../../shared/types/price-types';

export abstract class PriceStateVContract {
  abstract readonly prices: Signal<Price[]>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly error: Signal<string | null>;

  abstract loadForVariant(variantId: string | null, productId: string | null, partnerId: string | null): void;
  abstract remove(priceId: string): void;
  abstract clearPrices(): void;
}
