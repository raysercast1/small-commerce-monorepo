import {signal, Injectable, inject, computed, effect} from '@angular/core';
import {InventoryStateContract} from './contracts/Inventory-state.contract';
import { MakeRequestService, ApiResponse, PagedResponse } from 'shared-core';
import {environment} from '../../../../environments/environment';
import {Inventory, InventoryState} from '../types/inventory-types';
import {catchError, EMPTY, finalize, tap} from 'rxjs';
import {RouteContextService} from '../../../shared/services/route-context.service';

@Injectable()
export class InventoryStateImpl extends InventoryStateContract {
  private readonly makeRequest = inject(MakeRequestService);
  private readonly routeContext = inject(RouteContextService);

  private readonly partnerId = this.routeContext.partnerId;

  private readonly apiUrl = `${environment.baseUrl}${environment.domain}`;

  // --- Private Writable State ---
  // This is the single source of truth, hidden from the outside world.
  private state = signal<InventoryState> ({
    inventories: [],
    loading: false,
    error: null,
  });

  // --- Fulfilling the Public Contract ---
  // We use `computed` to create readonly signals derived from our private state.
  readonly inventories = computed(() => this.state().inventories);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  constructor() {
    super();
    effect(() => {
      const partnerId = this.partnerId();
      if (partnerId) {
        this.load(partnerId);
      } else {
        this.state.update((s) => ({ ...s, inventories: [] }));
      }
    });
  }

  load(partnerId: string): void {
    if (!partnerId) {
      this.state.update((s) => ({ ...s, inventories: [] }));
      return;
    }

    this.state.update((s) => ({ ...s, loading: true }));

    const page = 0;
    const size = 50;
    const sortBy = 'name';
    const url = `${this.apiUrl}inventories/inventory-by-partner?partnerId=${partnerId}&page=${page}&size=${size}&sortBy=${sortBy}`;

    this.makeRequest
      .get<ApiResponse<PagedResponse<Inventory>>>(url)
      .pipe(tap((response) => {
        const list = (response as any).data;
        const items = Array.isArray(list) ? list : (list?.content ?? []);
        this.state.update((s) => ({
          ...s,
          inventories: items,
          error: null,
        }));
      }),
        catchError(() => {
          this.state.update((s) => ({ ...s, error: 'Failed to load inventory' }));
          return EMPTY;
        }),
        finalize(() => {
          this.state.update((s) => ({ ...s, loading: false }));
        })
      )
      .subscribe();
  }

  getInventoryById(inventoryId: string): Inventory | undefined {
    return this.inventories().find((inv) => inv.id === inventoryId);
  }

  remove(inventoryId: string): void {
    this.state.update((s) => ({
      ...s,
      inventories: s.inventories.filter(inv => inv.id !== inventoryId),
      loading: false,
      error: null,
    }));
  }
}
