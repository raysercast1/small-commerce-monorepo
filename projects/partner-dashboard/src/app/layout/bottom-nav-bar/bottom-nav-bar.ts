import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {StateServiceContract} from '../../shared/services/global-state/contracts/state-service.contract';

@Component({
  standalone: true,
  selector: 'app-bottom-nav-bar',
  imports: [RouterLink],
  templateUrl: './bottom-nav-bar.html',
  styleUrl: './bottom-nav-bar.css'
})
export class BottomNavBar {
  private readonly stateService = inject(StateServiceContract);

  private readonly partnerId = this.stateService.partnerId;

  readonly storesRoute = computed(() => {
    const currentPartnerId = this.partnerId();
    // If partnerId is not available, this link could be disabled or hidden,
    // but for now, we'll just not construct a valid route.
    return currentPartnerId ? ['/partner', currentPartnerId, 'stores'] : [];
  });
}
