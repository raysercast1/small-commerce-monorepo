import { signal, WritableSignal } from '@angular/core';
import { VitestUtils } from 'vitest';
import { Variant } from '../../types/shared-types';
import { VariantStateContract } from '../../../features/variants/services/contracts/variant-state-contract';

export class VariantStateMock extends VariantStateContract {
  private _variants: WritableSignal<Variant[]> = signal<Variant[]>([]);
  private _loading: WritableSignal<boolean> = signal(false);
  private _error: WritableSignal<string | null> = signal(null);

  readonly variants = this._variants.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(vi: VitestUtils) {
    super();
    this.load = vi.fn<(productId: string | null, partnerId: string | null) => void>();
    this.remove = vi.fn<(variantId: string) => void>((id) => {
      this._variants.update(list => list.filter(v => v.id !== id));
    });
  }

  load: (productId: string | null, partnerId: string | null) => void;
  remove: (variantId: string) => void;

  setVariants(list: Variant[]) { this._variants.set(list); }
  setLoading(v: boolean) { this._loading.set(v); }
  setError(e: string | null) { this._error.set(e); }
}
