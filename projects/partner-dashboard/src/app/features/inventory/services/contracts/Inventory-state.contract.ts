import {Signal} from '@angular/core';
import {Inventory} from '../../types/inventory-types';

export abstract class InventoryStateContract {
  abstract readonly inventories: Signal<Inventory[]>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly error: Signal<string | null>;

  abstract load(partnerId: string): void;
  abstract getInventoryById(inventoryId: string): Inventory | undefined;
  abstract remove(inventoryId: string): void;
}
