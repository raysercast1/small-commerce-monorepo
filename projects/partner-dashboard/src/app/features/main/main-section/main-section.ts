import { Component, computed, inject } from '@angular/core';
import { NavigationalCardGrid, NavCardData } from '../../../shared/components/navigational-card-grid/navigational-card-grid';
import {StateServiceContract} from '../../../shared/services/global-state/contracts/state-service.contract';

@Component({
  selector: 'app-main-section',
  standalone: true,
  imports: [NavigationalCardGrid],
  templateUrl: './main-section.html',
  styleUrl: './main-section.css'
})
export class MainSection {
  private readonly stateService = inject(StateServiceContract);

  // The main page won't have the partnerId in its URL,
  // so we get it from the global StateService, which holds the logged-in user's context.
  private readonly partnerId = this.stateService.partnerId;

  readonly mainCards = computed<NavCardData[]>(() => {
    const currentPartnerId = this.partnerId();

    // If there's no partnerId available in the state, the user can't navigate to partner-specific pages.
    // The links will be disabled in the template.
    const storesRoute = currentPartnerId ? `/partner/${currentPartnerId}/stores` : '';
    const productsRoute = currentPartnerId ? `/partner/${currentPartnerId}/products` : '';
    const pricesRoute = currentPartnerId ? `/partner/${currentPartnerId}/prices` : '';
    const inventoryRoute = currentPartnerId ? `/partner/${currentPartnerId}/inventory` : '';

    return [
      { title: 'Stores', itemType: 'store', route: storesRoute },
      { title: 'Products', itemType: 'products', route: productsRoute },
      { title: 'Price', itemType: 'price', route: pricesRoute },
      { title: 'Inventory', itemType: 'inventory', route: inventoryRoute }
    ];
  });
}
