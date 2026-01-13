import {signal, WritableSignal} from '@angular/core';
import {VitestUtils} from 'vitest';
import {StoreStateContract} from '../../../features/stores/services/contracts/store-state.contract';
import {Store} from '../../types/shared-types';

export class StoreStateMock extends StoreStateContract {
  // internal writable signals
  private _stores: WritableSignal<Store[]> = signal<Store[]>([]);
  private _loading: WritableSignal<boolean> = signal(false);
  private _error: WritableSignal<string | null> = signal(null);

  // public read-only signals
  readonly stores = this._stores.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(vi: VitestUtils) {
    super();
    this.load = vi.fn<(partnerId: string) => void>();
    this.getStoreById = vi.fn<(storeId: string) => Store | undefined>((id) =>
      this._stores().find(s => s.id === id)
    );
    this.remove = vi.fn<(storeId: string) => void>((id) => {
      this._stores.update(list => list.filter(s => s.id !== id));
    });
  }

  // spy-able methods with realistic behavior
  load: (partnerId: string) => void;
  getStoreById: (storeId: string) => Store | undefined;
  remove: (storeId: string) => void;

  // test helpers (not part of contract)
  setStores(stores: Store[]) { this._stores.set(stores); }
  setLoading(v: boolean) { this._loading.set(v); }
  setError(e: string | null) { this._error.set(e); }
}
