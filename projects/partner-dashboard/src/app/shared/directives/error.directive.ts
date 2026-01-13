import { Directive, inject, Renderer2, effect, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {StateServiceContract} from '../services/global-state/contracts/state-service.contract';

@Directive({
  selector: '[appErrorDisplay]',
  standalone: true,
})
export class ErrorDirective implements OnDestroy {
  private stateService = inject(StateServiceContract);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);
  private errorContainer!: HTMLElement;
  private errorMessage!: HTMLElement;

  constructor() {
    // Only run DOM manipulation in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.initErrorDisplay();
      effect(() => {
        const error = this.stateService.error();
        this.toggleErrorDisplay(error);
      });
    }
  }

  private initErrorDisplay(): void {
    this.errorContainer = this.renderer.createElement('div');
    this.renderer.addClass(this.errorContainer, 'error-container');

    this.errorMessage = this.renderer.createElement('span');
    this.renderer.appendChild(this.errorContainer, this.errorMessage);

    const closeButton = this.renderer.createElement('button');
    this.renderer.addClass(closeButton, 'close-button');
    this.renderer.listen(closeButton, 'click', () => this.stateService.clearError());
    this.renderer.appendChild(closeButton, this.renderer.createText('×'));
    this.renderer.appendChild(this.errorContainer, closeButton);

    this.renderer.appendChild(document.body, this.errorContainer);
  }

  private toggleErrorDisplay(error: string | null): void {
    if (error) {
      this.renderer.setProperty(this.errorMessage, 'textContent', error);
      this.renderer.setStyle(this.errorContainer, 'display', 'flex');
      // When showing the container, ensure it is NOT inert.
      this.renderer.removeAttribute(this.errorContainer, 'inert');
    } else {
      this.renderer.setStyle(this.errorContainer, 'display', 'none');
      // When hiding the container, set it to inert.
      // This prevents focus from being trapped inside and fixes the warning.
      this.renderer.setAttribute(this.errorContainer, 'inert', 'true');
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.errorContainer) {
      this.renderer.removeChild(document.body, this.errorContainer);
    }
  }
}
