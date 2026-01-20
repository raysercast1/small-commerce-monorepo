import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CreateHeroBannerComponent } from '../../components/create-hero-banner/create-hero-banner';
import { HeroStateContract } from '../../services/contracts/hero-state.contract';

@Component({
  selector: 'app-hero-management-page',
  imports: [CreateHeroBannerComponent],
  templateUrl: './hero-management-page.html',
  styleUrls: ['./hero-management-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroManagementPageComponent {
  private readonly router = inject(Router);
  private readonly heroState = inject(HeroStateContract);

  readonly config = this.heroState.config;
  readonly loading = this.heroState.loading;

  handleCtaClick(): void {
    const ctaLink = this.config()?.ctaLink;
    if (ctaLink) {
      this.router.navigate([ctaLink]);
    }
  }
}
