import {Component, Signal, computed, inject, Injector, effect} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CardGrid } from '../../../../shared/components/card-grid/card-grid';
import { CrossFunctionalActions } from '../../../../shared/components/cross-functional-actions/cross-functional-actions';
import {ActivatedRoute, Router} from '@angular/router';
import { RouteContextService } from '../../../../shared/services/route-context.service';
import { CreateVariantForm } from '../../components/create-variant-form/create-variant-form';
import { InfoVariantDialog } from '../../components/info-variant-form/info-variant-form';
import { EditVariantForm } from '../../components/edit-variant-form/edit-variant-form';
import { RemoveVariantForm } from '../../components/remove-variant-form/remove-variant-form';
import {VariantStateContract} from '../../services/contracts/variant-state-contract';
import {ProductStateContract} from '../../../products/services/contracts/products-state-contract';
import {Product, Variant} from '../../../../shared/types/shared-types';
import {isObjectNotEmpty} from '../../../../shared/helpers/helpers';
import {ApiResponse} from 'shared-core';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-variant-management-page',
  standalone: true,
  imports: [CommonModule, CardGrid, CrossFunctionalActions],
  templateUrl: './variant-management-page.html',
  styleUrls: ['./variant-management-page.css'],
})
export class VariantManagementPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly routeContext = inject(RouteContextService);
  private readonly variantState = inject(VariantStateContract);
  private readonly productState = inject(ProductStateContract);
  private readonly router = inject(Router);

  private injector = inject(Injector);

  readonly isLoading = this.variantState.loading;

  readonly showPriceGoTo = computed(() => {
    const p = this.product();
    return !!p?.prices && p.prices.length > 0;
  })

  readonly variants = computed(() => this.variantState.variants());

  readonly products = computed(() => this.productState.products());

  private readonly productId = toSignal(this.route.paramMap.pipe(
    map(pm => pm.get('productId'))
  ), { initialValue: null });

  private readonly queryParamStoreId = toSignal(this.route.queryParams.pipe(map((qa) => qa['storeId'])), { initialValue: null });

  readonly product: Signal<Product | undefined> = computed(() => {
    const pid = this.productId();
    return pid ? this.getProductById(pid) : undefined;
  });

  readonly storeId: Signal<string | null> = computed(() => this.product()?.store?.id ?? null);

  // The constructor is used to initialize the component with the correct set of variants that belong to the product.
  constructor() {
    effect(() => {
      const partnerId = this.routeContext.partnerId();
      if (partnerId) {
        this.variantState.load(this.productId(), partnerId);
        this.productState.load(partnerId);
      }
    });
  }

  private handleActionCompletion(code: number, partnerId: string | null): void {
    const productId = this.productId();
    if (!partnerId || !productId) {
      return;
    }

    this.variantState.load(productId, partnerId);
  }

  handleCreateVariant() {
    const dialogRef = this.dialog.open(CreateVariantForm, {
      data: {
        partnerId: this.routeContext.partnerId(),
        productId: this.productId(),
        storeId: this.storeId() ? this.storeId() : this.queryParamStoreId(),
      },
      injector: this.injector
    });
    dialogRef.afterClosed().subscribe(result => {
      if (isObjectNotEmpty(result)) {
        this.handleActionCompletion(200, this.routeContext.partnerId());
      }
    });
  }

  handleEditVariant(variant?: Variant) {
    const dialogRef = this.dialog.open(EditVariantForm, {
      data: {
        partnerId: this.routeContext.partnerId(),
        productId: this.productId(),
        variant: variant,
        variants: variant ? undefined : this.variants()
      },
      injector: this.injector
    });

    dialogRef.afterClosed().subscribe(result => {
      if (isObjectNotEmpty(result)) {
        this.handleActionCompletion(200, this.routeContext.partnerId());
      }
    });
  }

  handleRemoveVariant(variant?: Variant) {
    const dialogRef = this.dialog.open(RemoveVariantForm, {
      data: {
        partnerId: this.routeContext.partnerId(),
        productId: this.productId(),
        storeId: this.storeId() ? this.storeId() : this.queryParamStoreId(),
        variant: variant,
        variants: variant ? undefined : this.variants(),
      },
      injector: this.injector
    });
    dialogRef.afterClosed().subscribe((result: { response: ApiResponse<boolean>, variantId: string }) => {
      if (isObjectNotEmpty(result)) {
        this.variantState.remove(result.variantId);
      }
    });
  }

  handleInfoVariant(variant: Variant) {
    this.dialog.open(InfoVariantDialog, {
      data: { variant },
      injector: this.injector
    });
  }

  handleHowTo() {
    // TODO: Open how-to guide for managing variants
    console.log('How-to clicked for Variants');
  }

  goToPricePage(variant: Variant) {
    const partnerId = this.routeContext.partnerId();
    if (!partnerId || !variant?.id) {
      return;
    }

    this.router.navigate(['partner', partnerId, 'variant', variant.id, 'prices'], {
      queryParams: {
        productId: this.productId()
      },
    });
  }

  goToParent(variant: Variant) {
    const partnerId = this.routeContext.partnerId();
    const productId = this.productId();
    if (!partnerId || !productId) {
      return;
    }

    this.router.navigate(['partner', partnerId, 'products'], {
      queryParams: {
        productId: productId,
        variantId: variant.id
      },
    });
  }

  private getProductById(id: string): Product | undefined {
    return this.products().find((p) => p.id === id);
  }
}
