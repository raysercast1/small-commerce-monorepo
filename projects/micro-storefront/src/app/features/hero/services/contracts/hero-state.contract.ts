import { Signal } from '@angular/core';
import { HeroConfig } from '../../types/hero-types';

export abstract class HeroStateContract {
  abstract readonly config: Signal<HeroConfig | null>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly error: Signal<string | null>;

  abstract load(storeId: string): void;
}
