import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class RouteContextService {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  // A signal to hold the set of URLs that have already been reloaded this session.
  private readonly reloadedRoutes = signal<Set<string>>(new Set());

  readonly partnerId = signal<string | null>(null);
  readonly storeId = signal<string | null>(null);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(route => {
      this.partnerId.set(route.snapshot.paramMap.get('partnerId'));
      this.storeId.set(route.snapshot.paramMap.get('storeId'));
    });
  }

  /**
   * Checks if the current route needs a one-time reload and performs it.
   * This is a workaround for components that don't correctly initialize or
   * refresh data on their first load after a programmatic action.
   * @returns {boolean} - True if a reload was performed, false otherwise.
   *
   * e.g.,
    {
      // Ask the service to reload the page if it's the first time.
      const reloaded = this.routeContext.reloadCurrentRouteIfNeeded();

      // If no reload was performed (meaning it's a later action),
      // then just do an efficient local data refresh.
      if (!reloaded) {
        this.refresh();
      }
    }

   */
  public reloadCurrentRouteIfNeeded(): boolean {
    const currentUrl = this.router.url;

    if (!this.reloadedRoutes().has(currentUrl)) {
      // The route has not been reloaded yet this session.

      // 1. Mark this route as "reloaded" to prevent infinite loops.
      this.reloadedRoutes.update(routes => routes.add(currentUrl));

      // 2. Perform the reload.
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigateByUrl(currentUrl);
      });
      return true; // A reload was performed. The caller should send an event to any logging service.
    }

    return false; // No reload was needed. The caller should send an event to any logging service.
  }
}
