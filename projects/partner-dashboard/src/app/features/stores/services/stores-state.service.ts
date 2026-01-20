import {Injectable, computed, inject, signal, effect} from '@angular/core';
import { EMPTY, catchError, tap, finalize } from 'rxjs';
import {StoreStateContract} from './contracts/store-state.contract';
import {ApiResponse, MakeRequestService, Store} from 'shared-core';
import {environment} from '../../../../environments/environment';
import {IStoresState} from '../types/store-types';
import {RouteContextService} from '../../../shared/services/route-context.service';

@Injectable()
export class StoreStateImpl extends StoreStateContract {
  private readonly makeRequest = inject(MakeRequestService);
  private readonly routeContext = inject(RouteContextService);

  private readonly apiUrl = `${environment.baseUrl}${environment.domain}`;

  // --- Private Writable State ---
  // This is the single source of truth, hidden from the outside world.
  private state = signal<IStoresState>({
    stores: [],
    loading: false,
    error: null,
  });

  // --- Fulfilling the Public Contract ---
  // We use `computed` to create readonly signals derived from our private state.
  readonly stores = computed(() => this.state().stores);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  constructor() {
    super();
    effect(() => {
      const partnerId = this.routeContext.partnerId();
      if (partnerId !== null && partnerId.length > 0) {
        this.load(partnerId);
      } else {
        this.state.update((s) => ({ ...s, stores: [] }));
      }
    });
  }

  load(partnerId: string) {
    if (!partnerId) {
      this.state.update((state) => ({ ...state, stores: [] }));
      return;
    }

    this.state.update((state) => ({ ...state, loading: true }));

    const url = `${this.apiUrl}store/many-stores?partnerId=${partnerId}`;
    this.makeRequest
      .get<ApiResponse<Store[]>>(url)
      .pipe(
        tap((response) => {
          const list = (response as ApiResponse<Store[]>).data;
          const items = Array.isArray(list) ? list : [];

          const addTitleProperty = items.map((store: Store) => ({
            title: store.name,
            ...store,
          }));

          this.state.update((state) => ({
            ...state,
            stores: addTitleProperty,
            error: null,
          }));
        }),
        catchError(() => {
          this.state.update((state) => ({ ...state, error: 'Failed to load stores' }));
          return EMPTY;
        }),
        finalize(() => {
          this.state.update((state) => ({ ...state, loading: false }));
        })
      )
      .subscribe();
  }

  getStoreById(storeId: string): Store | undefined {
    return this.stores().find(store => store.id === storeId);
  }

  remove(storeId: string): void {
     this.state.update((state) => ({
      ...state,
      stores: state.stores.filter(store => store.id !== storeId),
      loading: false,
      error: null,
     }));
  }
}
