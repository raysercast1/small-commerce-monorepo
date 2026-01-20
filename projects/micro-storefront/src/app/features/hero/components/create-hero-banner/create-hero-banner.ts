import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { HeroConfig } from '../../types/hero-types';

@Component({
  selector: 'app-create-hero-banner',
  imports: [],
  templateUrl: './create-hero-banner.html',
  styleUrls: ['./create-hero-banner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateHeroBannerComponent {
  config = input.required<HeroConfig>();
  ctaClick = output<void>();

  onCtaClick(): void {
    this.ctaClick.emit();
  }
}
