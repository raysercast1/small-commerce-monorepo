import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SearchBar } from './layout/search-bar/search-bar';
import { ProfileButton } from './layout/profile-button/profile-button';
import { BottomNavBar } from './layout/bottom-nav-bar/bottom-nav-bar';
import { CommonModule } from '@angular/common';
import { LoadingDirective } from './shared/directives/loading.directive';
import { ErrorDirective } from './shared/directives/error.directive';
import {StateServicePartnerContract} from './shared/services/global-state/contracts/state-service-partner.contract';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SearchBar,
    ProfileButton,
    BottomNavBar,
    LoadingDirective,
    ErrorDirective
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private route = inject(ActivatedRoute);
  private stateService = inject(StateServicePartnerContract);
  private router = inject(Router);

  private readonly destroyRef = inject(DestroyRef);

  protected title = 'myapp';
  isAuthPage = signal(false);

  ngOnInit(): void {
    // Logic to capture partnerId from URL
    this.route.queryParamMap.subscribe(params => {
      const partnerId = params.get('partnerId');
      if (partnerId) {
        this.stateService.setPartnerId(partnerId);
      }
    });

    // Subscribe to router events to check the current route
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: NavigationEnd) => {
      // Set the signal to true if the URL is the auth page
      this.isAuthPage.set(event.urlAfterRedirects.startsWith('/auth'));
    });
  }
}
