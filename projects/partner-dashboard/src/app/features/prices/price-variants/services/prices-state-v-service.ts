import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, catchError, finalize, tap } from 'rxjs';
import { ApiResponse, MakeRequestService } from '../../../../shared/services/make-request.service';
import { environment } from '../../../../../environments/environment';
import { PriceStateVContract } from './contracts/price-state-v-contract';
import {IPricesState, Price} from '../../shared/types/price-types';
import {safeParseForPriceMetadata} from '../../shared/utils/form-fields';

@Injectable()
export class PricesStateVImpl extends PriceStateVContract {
  private readonly makeRequest = inject(MakeRequestService);
  private readonly apiUrl = `${environment.baseUrl}${environment.domain}`;

  // --- Private Writable State ---
  // This is the single source of truth, hidden from the outside world.
  private state = signal<IPricesState>({
    prices: [],
    loading: false,
    error: null
  });

  // --- Fulfilling the Public Contract ---
  // We use `computed` to create readonly signals derived from our private state.
  readonly prices = computed(() => this.state().prices);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  loadForVariant(variantId: string | null, productId: string | null, partnerId: string | null) {
    if (!variantId || !productId || !partnerId) {
      this.state.update(s => ({ ...s, prices: [] }));
      return;
    }

    this.state.update(s => ({ ...s, loading: true, error: null }));

    const url = `${this.apiUrl}prices/all-prices-variant?variantId=${variantId}&productId=${productId}&partnerId=${partnerId}`;
    this.makeRequest
      .get<ApiResponse<any>>(url)
      .pipe(
        tap((response) => {
          const data = (response as any)?.data;
          const items: Price[] = Array.isArray(data) ? data : (data?.prices ?? []);

          const modifiedPriceObj = items.map((price: Price) => ({
            ...price,
            title: `${price.type} - ${price.price}`,
            metadata: price?.metadata ? safeParseForPriceMetadata(price.metadata as unknown as string) : {},
          }));

          this.state.update(s => ({ ...s, prices: modifiedPriceObj, error: null }));
        }),
        catchError(() => {
          this.state.update(s => ({ ...s, prices: [], error: 'Failed to load prices' }));
          return EMPTY;
        }),
        finalize(() => this.state.update(s => ({ ...s, loading: false })))
      )
      .subscribe();
  }

  clearPrices() {
    this.state.update(s => ({ ...s, prices: [] }));
  }

  remove(priceId: string): void {
    this.state.update((s) => ({
      ...s,
      prices: s.prices.filter(p => p.id !== priceId),
      loading: false,
      error: null,
    }));
  }
}
