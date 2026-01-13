import { Directive, inject, ElementRef, Renderer2, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {StateServiceContract} from '../services/global-state/contracts/state-service.contract';

@Directive({
  selector: '[appLoadingIndicator]',
  standalone: true,
})
export class LoadingDirective {
  private stateService = inject(StateServiceContract);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);
  private overlay!: HTMLElement;

  constructor() {
    // Only run DOM manipulation in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.initOverlay();
      effect(() => {
        const isLoading = this.stateService.loading();
        this.toggleOverlay(isLoading);
      });
    }
  }

  private initOverlay(): void {
    this.overlay = this.renderer.createElement('div');
    this.renderer.addClass(this.overlay, 'loading-overlay');

    const spinner = this.renderer.createElement('div');
    this.renderer.addClass(spinner, 'spinner');

    this.renderer.appendChild(this.overlay, spinner);
    this.renderer.appendChild(this.el.nativeElement, this.overlay);
  }

  private toggleOverlay(isLoading: boolean): void {
    if (isLoading) {
      this.renderer.setStyle(this.overlay, 'display', 'flex');
    } else {
      this.renderer.setStyle(this.overlay, 'display', 'none');
    }
  }
}
