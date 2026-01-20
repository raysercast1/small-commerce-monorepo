import {Component, inject, computed, Injector} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CardGrid } from '../../../../shared/components/card-grid/card-grid';
import { CreateStoreForm } from '../../components/create-store-form/create-store-form';
import { EditStoreForm } from '../../components/edit-store-form/edit-store-form';
import { RemoveStoreForm } from '../../components/remove-store-form/remove-store-form';
import { InfoStoreDialog } from '../../components/info-store-dialog/info-store-dialog';
import { CrossFunctionalActions } from '../../../../shared/components/cross-functional-actions/cross-functional-actions';
import { RouteContextService } from '../../../../shared/services/route-context.service';
import {StoreStateContract} from '../../services/contracts/store-state.contract';
import {ApiResponse, Store} from 'shared-core';
import {isObjectNotEmpty} from '../../../../shared/helpers/helpers';
import {Router} from '@angular/router';

@Component({
  selector: 'app-store-management-page',
  standalone: true,
  imports: [CommonModule, CardGrid, CrossFunctionalActions],
  templateUrl: './store-management-page.html',
  styleUrls: ['./store-management-page.css'],
})
export class StoreManagementPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly routeContext = inject(RouteContextService);
  private readonly storeState = inject(StoreStateContract);
  private readonly router = inject(Router);

  private injector = inject(Injector);

  readonly stores = computed(() => this.storeState.stores());

  readonly loading = this.storeState.loading;

  private handleActionCompletion(code: number, partnerId: string | null): void {
    if (!partnerId) {
      return;
    }
    this.storeState.load(partnerId);
  }

  handleCreateStore() {
    const dialogRef = this.dialog.open(CreateStoreForm, {
      data: {
        partnerId: this.routeContext.partnerId
      },
      injector: this.injector
    });
    dialogRef.afterClosed().subscribe((result: ApiResponse<Store>) => {
      if (isObjectNotEmpty(result)) {
        this.handleActionCompletion(200, this.routeContext.partnerId());
      }
    });
  }

  handleEditStore(store?: Store) {
    const dialogRef = this.dialog.open(EditStoreForm, {
      data: {
        partnerId: this.routeContext.partnerId,
        store: store,
        stores: store ? undefined : this.stores(),
      },
      injector: this.injector
    });
    dialogRef.afterClosed().subscribe((result: ApiResponse<Store>) => {
      if (isObjectNotEmpty(result)) {
        this.handleActionCompletion(200, this.routeContext.partnerId());
      }
    });
  }

  handleRemoveStore(store?: Store) {
    const dialogRef = this.dialog.open(RemoveStoreForm, {
      data: {
        partnerId: this.routeContext.partnerId,
        store: store,
        stores: store ? undefined : this.stores(),
      },
      injector: this.injector
    });
    dialogRef.afterClosed().subscribe((result: { response: ApiResponse<boolean>, storeId: string }) => {
      if (isObjectNotEmpty(result)) {
        this.storeState.remove(result.storeId);
      }
    });
  }

  handleInfoStore(store: Store) {
    this.dialog.open(InfoStoreDialog, {
      data: { store },
      injector: this.injector
    });
  }

  handleHowTo() {
    // Logic for how-to will be implemented in a later step
    console.log('How-to clicked');
  }

  goToProduct(store: Store): void {
    const partnerId = this.routeContext.partnerId();
    if (!partnerId) {
      return;
    }
    this.router.navigate(['partner', partnerId, 'products'], {
      queryParams: {
        storeId: store.id
      },
    });
  }
}
