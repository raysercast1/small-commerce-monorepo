import { Signal } from '@angular/core';
import { Price } from '../../../shared/types/price-types';

export abstract class PriceStatePContract {
  abstract readonly prices: Signal<Price[]>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly error: Signal<string | null>;

  abstract loadForProduct(productId: string | null, partnerId: string | null): void;
  abstract remove(priceId: string): void;
  abstract clearPrices(): void;
}
