import {Signal} from '@angular/core';
import {Variant} from '../../../../shared/types/shared-types';

export abstract class VariantStateContract {
  abstract readonly variants: Signal<Variant[]>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly error: Signal<string | null>;

  abstract load(productId: string | null, partnerId: string | null): void;
  abstract remove(variantId: string): void;
}
