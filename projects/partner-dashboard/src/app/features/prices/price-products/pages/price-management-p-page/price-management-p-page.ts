import { Component, computed, effect, inject, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { CardGrid } from '../../../../../shared/components/card-grid/card-grid';
import { CrossFunctionalActions } from '../../../../../shared/components/cross-functional-actions/cross-functional-actions';
import { RouteContextService } from '../../../../../shared/services/route-context.service';
import { isObjectNotEmpty } from '../../../../../shared/helpers/helpers';

import { ProductStateContract } from '../../../../products/services/contracts/products-state-contract';
import { PriceStatePContract } from '../../services/contracts/price-state-p-contract';
import {Price, PriceType} from '../../../shared/types/price-types';

import {CreatePricePDialogData, CreatePricePComponent} from '../../components/create-price-product-form/create-price-p-form';
import {EditPricePDialogData, EditPricePComponent} from '../../components/edit-price-product-form/edit-price-p-form';
import { InfoPricePComponent } from '../../components/info-price-product-form/info-price-p-form';
import {
  RemovePricePComponent,
  RemovePricePDialogData
} from '../../components/remove-price-product-form/remove-price-p-form';
import {ApiResponse} from 'shared-core';

@Component({
  selector: 'app-price-management-p-page',
  standalone: true,
  imports: [CommonModule, CardGrid, CrossFunctionalActions],
  templateUrl: './price-management-p-page.html',
  styleUrls: ['./price-management-p-page.css'],
})
export class PriceManagementPPage {
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly routeContext = inject(RouteContextService);

  private readonly productState = inject(ProductStateContract);
  private readonly priceState = inject(PriceStatePContract);

  private injector = inject(Injector);

  readonly isLoading = this.priceState.loading;

  readonly prices = computed(() => this.priceState.prices());

  private readonly productId = toSignal(this.route.paramMap.pipe(map((pm) => pm.get('productId'))), { initialValue: null });

  constructor() {
    effect(() => {
      const partnerId = this.routeContext.partnerId();
      if (!partnerId) { return; }

      const pid = this.productId();
      if (!pid) { return; }

      this.priceState.loadForProduct(pid, partnerId);
    });
  }

  private handleActionCompletion(code: number): void {
    const partnerId = this.routeContext.partnerId();
    const productId = this.productId();

    if (!partnerId || !productId) { return; }

    this.priceState.loadForProduct(productId, partnerId);
  }

  create() {
    const productId = this.productId();
    const partnerId = this.routeContext.partnerId();
    const storeId = this.productState?.getProductById(productId)?.store?.id;

    if (!productId || !partnerId || !storeId) {return;}

    const data: CreatePricePDialogData = {
      partnerId,
      productId,
      storeId
    }

    const dialogRef = this.dialog.open(CreatePricePComponent, { data, injector: this.injector });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (isObjectNotEmpty(result)) {
        this.handleActionCompletion(200);
      }
    });
  }

  edit(price?: Price) {
    const productId = this.productId();
    const partnerId = this.routeContext.partnerId();

    if (!productId || !partnerId) { return; }

    const data: EditPricePDialogData = {
      productId,
      value: price,
      prices: price ? undefined : this.prices(),
      partnerId,
    };

    const dialogRef = this.dialog.open(EditPricePComponent, { data, injector: this.injector });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (isObjectNotEmpty(result)) {
        this.handleActionCompletion(200);
      }
    });
  }

  info(price: Price) {
    const productId = this.productId();
    if (!productId) { return; }

    this.dialog.open(InfoPricePComponent, {
      data: {
        value: {
          ...price,
          productId
        }
        },
      injector: this.injector,
    });
  }

  remove(price?: Price) {
    const partnerId = this.routeContext.partnerId();
    const productId = this.productId();

    if (!partnerId || !productId) { return; }

    const dialogRef = this.dialog.open(RemovePricePComponent, {
      data: {
        partnerId,
        productId,
        type: price?.type,
        prices: price ? undefined : this.prices(),
      } satisfies RemovePricePDialogData,
      injector: this.injector,
    });

    dialogRef.afterClosed().subscribe((result: { response: ApiResponse<boolean>, id: string, type: PriceType }) => {
      if (isObjectNotEmpty(result)) {
        this.priceState.remove(result.id);
        const reloaded = this.routeContext.reloadCurrentRouteIfNeeded();
        if (reloaded) {
          console.log('Reloaded'); // Send event to a logging service
        } else {
          console.log('Not reloaded'); // Send event to a logging service
        }
      }
    });
  }

  howTo() {
    console.log('How-to clicked');
  }

  goToProductPage(price: Price) {
    const partnerId = this.routeContext.partnerId();
    const productId = this.productId();

    if (!partnerId || !productId) {
      return;
    }

    this.router.navigate(['partner', partnerId, 'products'], {
      queryParams: {
        priceId: price.id,
        productId: productId,
      },
    });
  }
}
