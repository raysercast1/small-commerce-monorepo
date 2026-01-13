import { Component, Signal, computed, effect, inject, Injector } from '@angular/core';
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
import { PriceStateVContract } from '../../services/contracts/price-state-v-contract';

import {
  CreatePriceVComponent,
  CreatePriceVDialogData
} from '../../components/create-price-variant-form/create-price-v-form';
import {
  EditPriceVComponent,
  EditPriceVDialogData
} from '../../components/edit-price-variant-form/edit-price-v-form';
import {
  InfoPriceVComponent,
  InfoPriceVDialogData
} from '../../components/info-price-variant-form/info-price-v-form';
import {
  RemovePriceVComponent,
  RemovePriceVDialogData
} from '../../components/remove-price-variant-form/remove-price-v-form';
import {Price, PriceType} from '../../../shared/types/price-types';
import {ApiResponse} from '../../../../../shared/services/make-request.service';

@Component({
  selector: 'app-price-management-v-page',
  standalone: true,
  imports: [CommonModule, CardGrid, CrossFunctionalActions],
  templateUrl: './price-management-v-page.html',
  styleUrls: ['./price-management-v-page.css'],
})
export class PriceManagementVPage {
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly routeContext = inject(RouteContextService);

  private readonly productState = inject(ProductStateContract);
  private readonly priceState = inject(PriceStateVContract);

  private injector = inject(Injector);

  readonly isLoading = this.priceState.loading;

  readonly prices = computed(() => this.priceState.prices());

  private readonly productId: Signal<string | null> = toSignal(this.route.queryParams.pipe(map((qp) => qp['productId'])), { initialValue: null });
  private readonly variantId = toSignal(this.route.paramMap.pipe(map((pm) => pm.get('variantId'))), { initialValue: null });

  constructor() {
    effect(() => {
      const partnerId = this.routeContext.partnerId();
      const pid = this.productId();
      const vid = this.variantId();

      if (!partnerId || !pid || !vid) { return; }

      this.productState.load(partnerId);
      this.priceState.loadForVariant(vid, pid, partnerId);
    });
  }

  private handleActionCompletion(code: number): void {
    const partnerId = this.routeContext.partnerId();
    if (!partnerId) { return; }

    const vid = this.variantId();
    const pid = this.productId();

    if (!vid || !pid) { return; }

    this.priceState.loadForVariant(vid, pid, partnerId);
  }

  create() {
    const productId = this.productId();
    const variantId = this.variantId();
    const partnerId = this.routeContext.partnerId();

    if (!productId || !variantId || !partnerId) {
      return;
    }

    const product = this.productState.getProductById(productId);

    if (!product || !product?.prices || !product.prices.length) { return; } // Product is needed to get the parent prices.

    const storeId = product?.store?.id;
    if (!storeId) { return; }

    const data: CreatePriceVDialogData = {
      parentPrices: product.prices,
      productId,
      variantId,
      partnerId,
      storeId
    };

    const dialogRef = this.dialog.open(CreatePriceVComponent, { data, injector: this.injector });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (isObjectNotEmpty(result)) {
        this.handleActionCompletion(200);
      }
    });
  }

  edit(price?: Price) {
    const productId = this.productId();
    const variantId = this.variantId();
    const partnerId = this.routeContext.partnerId();

    if (!productId || !variantId || !partnerId) { return; }

    const data: EditPriceVDialogData = {
      value: price,
      prices: price ? undefined : this.prices(),
      variantId,
      productId,
      partnerId,
    };

    const dialogRef = this.dialog.open(EditPriceVComponent, { data, injector: this.injector });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (isObjectNotEmpty(result)) {
        this.handleActionCompletion(200);
      }
    });
  }

  info(price: Price) {
    const productId = this.productId();
    const variantId = this.variantId();

    if (!productId || !variantId) { return; }

    this.dialog.open(InfoPriceVComponent, {
      data: {
        value: {
          ...price,
        },
        variantId,
        productId,
      } satisfies InfoPriceVDialogData,
      injector: this.injector,
    });
  }

  remove(price?: Price) {
    const partnerId = this.routeContext.partnerId();
    if (!partnerId) { return; }

    const vid = this.variantId();
    const productId = this.productId();

    if (!productId || !vid) { return; }

    const dialogRef = this.dialog.open(RemovePriceVComponent, {
      data: {
        partnerId,
        productId,
        variantId: vid,
        type: price?.type,
        prices: price ? undefined : this.prices(),
      } satisfies RemovePriceVDialogData,
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

  // navigation helpers if needed by parent pages
  goToVariantPage(price: Price) {
    const partnerId = this.routeContext.partnerId();
    const productId = this.productId();
    const variantId = this.variantId();

    if (!partnerId || !productId || !variantId) {
      return;
    }

    this.router.navigate(['partner', partnerId, 'product', productId, 'variants'], {
      queryParams: {
        priceId: price.id,
        variantId: variantId,
      },
    });
  }
}
