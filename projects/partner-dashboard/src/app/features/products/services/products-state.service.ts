import {Injectable, computed, inject, signal, effect} from '@angular/core';
import {EMPTY, catchError, tap, finalize} from 'rxjs';
import {IProductsState} from '../types/product-types';
import {ApiResponse, MakeRequestService, PagedResponse} from 'shared-core';
import {ProductStateContract} from './contracts/products-state-contract';
import {environment} from '../../../../environments/environment';
import {Product} from '../../../shared/types/shared-types';
import {RouteContextService} from '../../../shared/services/route-context.service';

@Injectable()
export class ProductStateImpl extends ProductStateContract {
  private readonly makeRequest = inject(MakeRequestService);
  private readonly routeContext = inject(RouteContextService);

  private readonly partnerId = this.routeContext.partnerId;

  private readonly apiUrl = `${environment.baseUrl}${environment.domain}`;

  // --- Private Writable State ---
  // This is the single source of truth, hidden from the outside world.
  private state = signal<IProductsState>({
    products: [],
    loading: false,
    error: null,
  });

  // --- Fulfilling the Public Contract ---
  // We use `computed` to create readonly signals derived from our private state.
  readonly products = computed(() => this.state().products);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  constructor() {
    super();
    effect(() => {
      const partnerId = this.partnerId();
      if (partnerId) {
        this.load(partnerId);
      } else {
        this.state.update((s) => ({ ...s, products: [] }));
      }
    });
  }

  load(partnerId: string) {
    if (!partnerId) {
      this.state.update((s) => ({ ...s, products: [] }));
      return;
    }

    this.state.update((s) => ({ ...s, loading: true }));

    const page = 0;
    const size = 50;
    const sortBy = 'name';
    const url = `${this.apiUrl}products/product-by-partner?partnerId=${partnerId}&page=${page}&size=${size}&sortBy=${sortBy}`;

    this.makeRequest
      .get<ApiResponse<PagedResponse<Product>>>(url)
      .pipe(
        tap((response) => {
          const list = response.data;
          const items = Array.isArray(list) ? list : (list?.content ?? []);

          const addTitleProperty = items.map((product: Product) => ({
            title: product.name,
            ...product,
          }));

          this.state.update((s) => ({
            ...s,
            products: addTitleProperty,
            error: null,
          }));
        }),
        catchError(() => {
          this.state.update((s) => ({ ...s, error: 'Failed to load products' }));
          return EMPTY;
        }),
        finalize(() => {
          this.state.update((s) => ({ ...s, loading: false }));
        })
      )
      .subscribe();
  }

  getProductById(id: string | null): Product | undefined {
    return this.products().find((p) => p.id === id);
  }

  remove(productId: string): void {
    this.state.update((s) => ({
      ...s,
      products: s.products.filter(p => p.id !== productId),
      loading: false,
      error: null,
    }));
  }
}
