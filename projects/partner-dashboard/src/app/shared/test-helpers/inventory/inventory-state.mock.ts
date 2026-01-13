import { signal, WritableSignal } from '@angular/core';
import { VitestUtils } from 'vitest';
import { Inventory } from '../../../features/inventory/types/inventory-types';
import { InventoryStateContract } from '../../../features/inventory/services/contracts/Inventory-state.contract';

export class InventoryStateMock extends InventoryStateContract {
  // internal writable signals
  private _inventories: WritableSignal<Inventory[]> = signal<Inventory[]>([]);
  private _loading: WritableSignal<boolean> = signal(false);
  private _error: WritableSignal<string | null> = signal(null);

  // public read-only signals
  readonly inventories = this._inventories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(vi: VitestUtils) {
    super();
    this.load = vi.fn<(partnerId: string) => void>();
    this.getInventoryById = vi.fn<(inventoryId: string) => Inventory | undefined>((id) =>
      this._inventories().find(i => i.id === id)
    );
    this.remove = vi.fn<(inventoryId: string) => void>((id) => {
      this._inventories.update(list => list.filter(i => i.id !== id));
    });
  }

  // spy-able methods
  load: (partnerId: string) => void;
  getInventoryById: (inventoryId: string) => Inventory | undefined;
  remove: (inventoryId: string) => void;

  // helpers
  setInventories(inventories: Inventory[]) { this._inventories.set(inventories); }
  setLoading(v: boolean) { this._loading.set(v); }
  setError(e: string | null) { this._error.set(e); }
}
