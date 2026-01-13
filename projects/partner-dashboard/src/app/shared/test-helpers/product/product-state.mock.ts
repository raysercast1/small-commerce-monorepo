import { signal, WritableSignal } from '@angular/core';
import { VitestUtils } from 'vitest';
import { Product } from '../../types/shared-types';
import { ProductStateContract } from '../../../features/products/services/contracts/products-state-contract';

export class ProductStateMock extends ProductStateContract {
  // internal writable signals
  private _products: WritableSignal<Product[]> = signal<Product[]>([]);
  private _loading: WritableSignal<boolean> = signal(false);
  private _error: WritableSignal<string | null> = signal(null);

  // public read-only signals
  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(vi: VitestUtils) {
    super();
    this.load = vi.fn<(partnerId: string) => void>();
    this.getProductById = vi.fn<(productId: string | null) => Product | undefined>((id) =>
      this._products().find(p => p.id === id)
    );
    this.remove = vi.fn<(productId: string) => void>((id) => {
      this._products.update(list => list.filter(p => p.id !== id));
    });
  }

  // spy-able methods
  load: (partnerId: string) => void;
  getProductById: (productId: string | null) => Product | undefined;
  remove: (productId: string) => void;

  // helpers
  setProducts(products: Product[]) { this._products.set(products); }
  setLoading(v: boolean) { this._loading.set(v); }
  setError(e: string | null) { this._error.set(e); }
}
