import {Injectable, computed, inject, signal} from '@angular/core';
import {EMPTY, catchError, tap, finalize} from 'rxjs';
import {ApiResponse, MakeRequestService, Tag, Metadata} from 'shared-core';
import { environment } from '../../../../environments/environment';
import {IVariantsState} from '../types/variant-types';
import {VariantStateContract} from './contracts/variant-state-contract';
import {Attribute, Variant} from '../../../shared/types/shared-types';

Injectable()
export class VariantStateImpl extends VariantStateContract {
  private readonly makeRequest = inject(MakeRequestService);

  private readonly apiUrl = `${environment.baseUrl}${environment.domain}`;

  // --- Private Writable State ---
  // This is the single source of truth, hidden from the outside world.
  private state = signal<IVariantsState>({
    variants: [],
    loading: false,
    error: null,
  });

  // --- Fulfilling the Public Contract ---
  // We use `computed` to create readonly signals derived from our private state.
  readonly variants = computed(() => this.state().variants);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  load(productId: string | null, partnerId: string | null) {
    if (!partnerId || !productId) {
      this.state.update((s) => ({ ...s, variants: [] }));
      return;
    }

    this.state.update((s) => ({ ...s, loading: true }));

    const url = `${this.apiUrl}product-variant/variants?partnerId=${partnerId}&productId=${productId}`;

    this.makeRequest
      .get<ApiResponse<Variant[]>>(url)
      .pipe(
        tap((response) => {
          const list = (response as any)?.data;
          const items = Array.isArray(list) ? list : (list?.content ?? []);

          const parsedVariants: Variant[] = items.map((variant: Variant) => ({
            title: variant?.variantName ?? variant?.name ?? 'Variant',
            ...variant,
            attributes: this.safeParse(variant.attributes as unknown as string),
            variantMetadata: this.safeParse(variant.variantMetadata as unknown as string),
            tags: this.safeParse(variant.tags as unknown as string),
          }));

          this.state.update((s) => ({
            ...s,
            variants: parsedVariants,
            error: null,
          }));
        }),
        catchError(() => {
          this.state.update((s) => ({
            ...s,
            variants: [],
            error: 'Failed to load variants'
          }));
          return EMPTY;
        }),
        finalize(() => {
          this.state.update((s) => ({ ...s, loading: false }));
        })
      )
      .subscribe();
  }

 private safeParse(jsonString: string): Metadata | Tag | Attribute | Attribute[] {
   try {
     return JSON.parse(jsonString);
   } catch (e) {
     console.error('Failed to parse JSON string:', jsonString, e);
     return {};
   }
 }

  // Clears variants to avoid showing stale data when no product context is present
  clearVariants() {
    this.state.update((s) => ({ ...s, variants: [] }));
  }

  remove(variantId: string): void {
    this.state.update((s) => ({
      ...s,
      variants: s.variants.filter(p => p.id !== variantId),
      loading: false,
      error: null,
    }));
  }
}
