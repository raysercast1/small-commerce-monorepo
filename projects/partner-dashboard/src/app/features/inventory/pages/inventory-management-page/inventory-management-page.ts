import { Component, ChangeDetectionStrategy, Signal, computed, inject, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CardGrid } from '../../../../shared/components/card-grid/card-grid';
import { CrossFunctionalActions } from '../../../../shared/components/cross-functional-actions/cross-functional-actions';
import { RouteContextService } from '../../../../shared/services/route-context.service';
import { CreateInventoryForm } from '../../components/create-inventory-form/create-inventory-form';
import { EditInventoryForm } from '../../components/edit-inventory-form/edit-inventory-form';
import { RemoveInventoryForm } from '../../components/remove-inventory-form/remove-inventory-form';
import { InfoInventoryForm } from '../../components/info-inventory-form/info-inventory-form';
import { I18nService, ApiResponse} from 'shared-core';
import {InventoryStateContract} from '../../services/contracts/Inventory-state.contract';
import {
  CreateInventoryDialogData,
  DeleteInventoryDialogData,
  InfoInventoryDialogData,
  Inventory,
  UpdateInventoryDialogData
} from '../../types/inventory-types';
import {ProductStateContract} from '../../../products/services/contracts/products-state-contract';
import {isObjectNotEmpty} from '../../../../shared/helpers/helpers';

@Component({
  selector: 'app-inventory-management-page',
  standalone: true,
  imports: [CommonModule, CardGrid, CrossFunctionalActions],
  templateUrl: './inventory-management-page.html',
  styleUrls: ['./inventory-management-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryManagementPage {
  private readonly dialog = inject(MatDialog);
  private readonly routeContext = inject(RouteContextService);
  private readonly i18nService = inject(I18nService);
  private readonly inventoryState = inject(InventoryStateContract);
  private readonly productState = inject(ProductStateContract);

  private injector = inject(Injector);

  readonly partnerId: Signal<string | null> = this.routeContext.partnerId

  readonly loading = this.inventoryState.loading;

  readonly inventories = computed(() => this.inventoryState.inventories().map(inv => ({
    title: `${inv.sku} (${inv.quantity})`,
    ...inv
  })));

  readonly products = computed(() => this.productState.products().map(product => ({
    title: product.name,
    ...product
  })));

  private handleActionCompletion(code: number, partnerId: string | null) {
    if (!partnerId) {
      return;
    }
    this.inventoryState.load(partnerId);
  }

  handleCreateInventory() {
    const dialogRef = this.dialog.open(CreateInventoryForm, {
      data: {
        partnerId: this.partnerId(),
        products: this.products(),
      } satisfies CreateInventoryDialogData,
      injector: this.injector
    });
    dialogRef.afterClosed().subscribe(result => {
      if (isObjectNotEmpty(result)) {
        this.handleActionCompletion(200, this.partnerId());
      }
    });
  }

  handleEditInventory(inventory?: Inventory) {
    const dialogRef = this.dialog.open(EditInventoryForm, {
      data: {
        partnerId: this.partnerId(),
        products: this.products(),
        inventory: inventory,
        inventories: inventory ? undefined : this.inventories(),
      } satisfies UpdateInventoryDialogData,
      injector: this.injector
    });
    dialogRef.afterClosed().subscribe(result => {
      if (isObjectNotEmpty(result)) {
        this.handleActionCompletion(200, this.partnerId());
      }
    });
  }

  handleRemoveInventory(inventory?: Inventory) {
    const dialogRef = this.dialog.open(RemoveInventoryForm, {
      data: {
        partnerId: this.partnerId(),
        products: this.products(),
        inventory: inventory,
        inventories: inventory ? undefined : this.inventories(),
      } satisfies DeleteInventoryDialogData,
      injector: this.injector
    });
    dialogRef.afterClosed().subscribe((result: { response: ApiResponse<boolean>, inventoryId: string}) => {
      if (isObjectNotEmpty(result)) {
        this.inventoryState.remove(result.inventoryId);
      }
    });
  }

  handleInfoInventory(inventory: Inventory) {
    this.dialog.open(InfoInventoryForm, {
      data: { inventory } satisfies InfoInventoryDialogData,
      injector: this.injector
    });
  }

  handleHowTo() {
    console.log('How-to clicked for Inventory');
  }
}
