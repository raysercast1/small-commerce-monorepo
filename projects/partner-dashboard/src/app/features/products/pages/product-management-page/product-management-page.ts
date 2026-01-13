import {Component, inject, computed, Injector, ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CardGrid } from '../../../../shared/components/card-grid/card-grid';
import { CrossFunctionalActions } from '../../../../shared/components/cross-functional-actions/cross-functional-actions';
import { RouteContextService } from '../../../../shared/services/route-context.service';
import { CreateProductForm } from '../../components/create-product-form/create-product-form';
import { EditProductForm } from '../../components/edit-product-form/edit-product-form';
import { RemoveProductForm } from '../../components/remove-product-form/remove-product-form';
import { InfoProductDialog } from '../../components/info-product-form/info-product-form';
import { Router } from '@angular/router';
import {ProductStateContract} from '../../services/contracts/products-state-contract';
import {Product} from '../../../../shared/types/shared-types';
import {StoreStateContract} from '../../../stores/services/contracts/store-state.contract';
import {ApiResponse} from '../../../../shared/services/make-request.service';
import {isObjectNotEmpty} from '../../../../shared/helpers/helpers';

@Component({
  selector: 'app-product-management-page',
  standalone: true,
  imports: [CommonModule, CardGrid, CrossFunctionalActions],
  templateUrl: './product-management-page.html',
  styleUrls: ['./product-management-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductManagementPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly routeContext = inject(RouteContextService);
  private readonly productState = inject(ProductStateContract);
  private readonly storeState = inject(StoreStateContract);
  private readonly router = inject(Router);

  private injector = inject(Injector);

  readonly products = computed(() => this.productState.products());

  readonly stores = computed(() => this.storeState.stores());

  readonly loading = this.productState.loading;

  constructor() {
    const partnerId = this.routeContext.partnerId();
    if (partnerId) {
      this.productState.load(partnerId);
    }
  }

  private handleActionCompletion(code: number, partnerId: string | null): void {
    if (!partnerId) {
      return;
    }
    this.productState.load(partnerId);
  }

  handleCreateProduct() {
    const dialogRef = this.dialog.open(CreateProductForm, {
      data: {
        partnerId: this.routeContext.partnerId,
        stores: this.stores(),
      },
      injector: this.injector
    });
    dialogRef.afterClosed().subscribe(result => {
      if (isObjectNotEmpty(result)) {
        this.handleActionCompletion(200, this.routeContext.partnerId());
      }
    });
  }

  handleEditProduct(product?: Product) {
    const dialogRef = this.dialog.open(EditProductForm, {
      data: {
        partnerId: this.routeContext.partnerId,
        product: product,
        products: product ? undefined : this.products()
      },
      injector: this.injector
    });

    dialogRef.afterClosed().subscribe(result => {
      if (isObjectNotEmpty(result)) {
        this.handleActionCompletion(200, this.routeContext.partnerId());
      }
    });
  }

  handleRemoveProduct(product?: Product) {
    const dialogRef = this.dialog.open(RemoveProductForm, {
      data: {
        partnerId: this.routeContext.partnerId,
        storeId: product?.store?.id,
        product: product,
        products: product ? undefined : this.products()
      },
      injector: this.injector
    });
    dialogRef.afterClosed().subscribe((result: { response: ApiResponse<boolean>, productId: string}) => {
      if (isObjectNotEmpty(result)) {
        this.productState.remove(result.productId);
      }
    });
  }

  handleInfoProduct(product: Product) {
    this.dialog.open(InfoProductDialog, {
      data: { product },
      injector: this.injector
    });
  }

  goToVariantPage(product: Product) {
    const partnerId = this.routeContext.partnerId();
    if (!partnerId || !product?.id) {
      return;
    }
    this.router.navigate(['partner', partnerId, 'product', product.id, 'variants'], {
      queryParams: {
        storeId: product.store?.id
      },
    });
  }

  goToPricePage(product: Product) {
    const partnerId = this.routeContext.partnerId();
    if (!partnerId || !product?.id) {
      return;
    }

    this.router.navigate(['partner', partnerId, 'product', product.id, 'prices'], {
      queryParams: {
        storeId: product.store?.id
      },
    });
  }

  handleHowTo() {
    console.log('How-to clicked');
  }
}
