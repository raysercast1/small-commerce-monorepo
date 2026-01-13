import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auths/auth.service'; // Assuming AuthService is in shared services

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private authService: AuthService // Inject your AuthService
  ) {}

  @Input() set appHasRole(roles: string | string[]) {
    if (this.authService.hasRole(roles)) {
      if (!this.hasView) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
        this.hasView = true;
      }
    } else {
      if (this.hasView) {
        this.viewContainerRef.clear();
        this.hasView = false;
      }
    }
  }
}
