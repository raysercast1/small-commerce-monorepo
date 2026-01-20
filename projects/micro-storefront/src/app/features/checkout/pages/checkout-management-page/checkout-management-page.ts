import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CheckoutStateContract } from '../../services/contracts/checkout-state.contract';
import { CartStateContract } from '../../../cart/services/contracts/cart-state.contract';
import { CreateCheckoutForm } from '../../components/create-checkout-form/create-checkout-form';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary';
import { CheckoutFormData } from '../../../../shared/types/storefront-types';

@Component({
  selector: 'app-checkout-management-page',
  imports: [CreateCheckoutForm, OrderSummaryComponent],
  templateUrl: './checkout-management-page.html',
  styleUrls: ['./checkout-management-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutManagementPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly checkoutState = inject(CheckoutStateContract);
  private readonly cartState = inject(CartStateContract);

  readonly cart = this.cartState.cart;
  readonly order = this.checkoutState.order;
  readonly loading = this.checkoutState.loading;
  readonly error = this.checkoutState.error;
  readonly validationErrors = this.checkoutState.validationErrors;

  constructor() {
    const storeId = this.route.snapshot.paramMap.get('storeId') || 'default';
    const sessionId = this.getSessionId();

    // Validate that cart has items before allowing checkout
    this.checkoutState.validateCheckout(storeId, sessionId);
  }

  handleFormSubmit(formData: CheckoutFormData): void {
    const storeId = this.route.snapshot.paramMap.get('storeId') || 'default';
    const sessionId = this.getSessionId();
    this.checkoutState.createOrder(storeId, sessionId, formData);
  }

  private getSessionId(): string {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
