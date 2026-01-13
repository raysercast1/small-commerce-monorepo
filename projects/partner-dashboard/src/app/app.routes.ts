import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { PartnerStoreGuard } from './shared/guards/partner-store.guard';
import {InventoryStateContract} from './features/inventory/services/contracts/Inventory-state.contract';
import {InventoryStateImpl} from './features/inventory/services/inventory-state.impl';
import {InventoryServiceContract} from './api/inventory/contracts/inventory-service.contract';
import {InventoryServiceImpl} from './api/inventory/service/inventory.service';
import {VariantStateContract} from './features/variants/services/contracts/variant-state-contract';
import {VariantStateImpl} from './features/variants/services/variants-state-service';
import {VariantServiceContract} from './api/variant/contracts/variant-service.contract';
import {VariantServiceImpl} from './api/variant/service/variant.service';
import {ProductServiceContract} from './api/product/contracts/product-service.contract';
import {ProductServiceImpl} from './api/product/service/product.service';
import {ProductStateContract} from './features/products/services/contracts/products-state-contract';
import {ProductStateImpl} from './features/products/services/products-state.service';
import {StoreStateContract} from './features/stores/services/contracts/store-state.contract';
import {StoreStateImpl} from './features/stores/services/stores-state.service';
import {StoreServiceContract} from './api/store/contracts/store-service.contract';
import {StoreServiceImpl} from './api/store/service/store.service';
import {SignInServiceImpl} from './api/auth/service/signing.service';
import {SignInServiceContract} from './api/auth/contracts/signin-service.contract';
import {PriceStatePContract} from './features/prices/price-products/services/contracts/price-state-p-contract';
import {PricesStatePImpl} from './features/prices/price-products/services/price-state-p-service';
import {PricePServiceContract} from './api/price/contracts/price-p-service.contract';
import {PriceServiceImpl} from './api/price/service/price-service';
import {PricesStateVImpl} from './features/prices/price-variants/services/prices-state-v-service';
import {PriceStateVContract} from './features/prices/price-variants/services/contracts/price-state-v-contract';
import {PriceVServiceContract} from './api/price/contracts/price-v-service.contract';
import {ImageServiceContract} from './api/image/contracts/image-service.contract';
import {ImageServiceImpl} from './api/image/services/image.service';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent),
    providers: [
      { provide: SignInServiceContract, useClass: SignInServiceImpl }
    ]
  },
  {
    path: 'main',
    loadComponent: () => import('./features/main/main-section/main-section').then(m => m.MainSection),
    canActivate: [authGuard],
    providers: [
      { provide: SignInServiceContract, useClass: SignInServiceImpl }
    ]
  },
  {
    path: 'how-to',
    loadComponent: () => import('./features/how-to/how-to-section/how-to-section').then(m => m.HowToSection),
    canActivate: [authGuard]
  },
  {
    path: 'sales',
    loadComponent: () => import('./features/sales/sales-section/sales-section').then(m => m.SalesSection),
    canActivate: [authGuard]
  },
  {
    path: 'partner/:partnerId',
    canActivate: [authGuard, PartnerStoreGuard],
    children: [
      {
        path: 'stores',
        loadComponent: () => import('./features/stores/pages/store-management-page/store-management-page')
          .then(m => m.StoreManagementPageComponent),
        providers: [
          { provide: StoreStateContract, useClass: StoreStateImpl},
          { provide: StoreServiceContract, useClass: StoreServiceImpl}
        ]
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/pages/product-management-page/product-management-page')
          .then(m => m.ProductManagementPageComponent),
        providers: [
          { provide: VariantStateContract, useClass: VariantStateImpl},
          { provide: ProductServiceContract, useClass: ProductServiceImpl},
          { provide: ProductStateContract, useClass: ProductStateImpl},
          { provide: StoreStateContract, useClass: StoreStateImpl},
          { provide: StoreServiceContract, useClass: StoreServiceImpl},
          { provide: ImageServiceContract, useClass: ImageServiceImpl}
        ]
      },
      {
        path: 'product/:productId/variants',
        loadComponent: () => import('./features/variants/pages/variant-management-page/variant-management-page')
          .then(m => m.VariantManagementPageComponent),
        providers: [
          { provide: VariantServiceContract, useClass: VariantServiceImpl},
          { provide: ProductServiceContract, useClass: ProductServiceImpl},
          { provide: ProductStateContract, useClass: ProductStateImpl},
          { provide: VariantStateContract, useClass: VariantStateImpl},
          { provide: ImageServiceContract, useClass: ImageServiceImpl}
        ]
      },
      {
        path: 'product/:productId/prices',
        loadComponent: () => import('./features/prices/price-products/pages/price-management-p-page/price-management-p-page')
          .then(m => m.PriceManagementPPage),
        providers: [
          { provide: ProductStateContract, useClass: ProductStateImpl},
          { provide: PriceStatePContract, useClass: PricesStatePImpl},
          { provide: PricePServiceContract, useClass: PriceServiceImpl},
        ]
      },
      {
        path: 'variant/:variantId/prices',
        loadComponent: () => import('./features/prices/price-variants/pages/price-management-v-page/price-management-v-page')
          .then(m => m.PriceManagementVPage),
        providers: [
          { provide: ProductStateContract, useClass: ProductStateImpl},
          { provide: PriceStateVContract, useClass: PricesStateVImpl},
          { provide: PriceVServiceContract, useClass: PriceServiceImpl},
        ]
      },
      {
        path: 'inventory',
        loadComponent: () => import('./features/inventory/pages/inventory-management-page/inventory-management-page')
          .then(m => m.InventoryManagementPage),
        providers: [
          { provide: InventoryStateContract, useClass: InventoryStateImpl },
          { provide: InventoryServiceContract, useClass: InventoryServiceImpl },
          { provide: VariantStateContract, useClass: VariantStateImpl},
          { provide: ProductServiceContract, useClass: ProductServiceImpl},
          { provide: ProductStateContract, useClass: ProductStateImpl},
          { provide: StoreServiceContract, useClass: StoreServiceImpl},
        ]
      },
    ]
  },
  {
    // Redirect unauthenticated users to the auth page
    path: '',
    redirectTo: 'main', // The guard will intercept this and redirect to /auth if needed
    pathMatch: 'full'
  },
  {
    // Optional: A catch-all route to redirect to main, which will then be guarded
    path: '**',
    redirectTo: 'main'
  }
];
