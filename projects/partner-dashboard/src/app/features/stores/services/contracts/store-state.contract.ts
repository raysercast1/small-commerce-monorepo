import {Signal} from '@angular/core';
import { Store } from "../../../../shared/types/shared-types";

export abstract class StoreStateContract {
  abstract readonly stores: Signal<Store[]>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly error: Signal<string | null>;

  abstract load(partnerId: string): void;
  abstract getStoreById(storeId: string): Store | undefined;
  abstract remove(storeId: string): void;
}
