import { Directive, ElementRef, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective {
  @Input() appTooltip: string = '';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.setAttribute('title', this.appTooltip);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.removeAttribute('title');
  }
}