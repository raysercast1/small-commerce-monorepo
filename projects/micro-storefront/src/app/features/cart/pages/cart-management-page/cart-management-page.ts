import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CartStateContract } from '../../services/contracts/cart-state.contract';
import {CreateCartItem} from '../../components/create-cart-item/create-cart-item';
import { CartSummaryComponent } from '../../components/info-cart-item/cart-summary';

@Component({
  selector: 'app-cart-management-page',
  imports: [CreateCartItem, CartSummaryComponent],
  templateUrl: './cart-management-page.html',
  styleUrls: ['./cart-management-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartManagementPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cartState = inject(CartStateContract);

  readonly cart = this.cartState.cart;
  readonly loading = this.cartState.loading;
  readonly error = this.cartState.error;
  readonly storeId = this.route.snapshot.paramMap.get('storeId') || 'default';
  readonly sessionId = this.getSessionId();

  constructor() {
    const storeId = this.route.snapshot.paramMap.get('storeId') || 'default';
    const sessionId = this.getSessionId();
    this.cartState.loadCart(this.storeId, this.sessionId);
  }

  handleQuantityChange(storeId: string, sessionId: string, itemId: string, quantity: number): void {
    this.cartState.updateItemQuantity(storeId, sessionId, itemId, quantity);
  }

  handleRemoveItem(storeId: string, sessionId: string, itemId: string): void {
    this.cartState.removeItem(storeId, sessionId, itemId);
  }

  handleProceedToCheckout(): void {
    const storeId = this.route.snapshot.paramMap.get('storeId') || 'default';
    this.router.navigate(['/store', storeId, 'checkout']);
  }

  handleContinueShopping(): void {
    const storeId = this.route.snapshot.paramMap.get('storeId') || 'default';
    this.router.navigate(['/store', storeId, 'products']);
  }

  private getSessionId(): string {
    // In a real application, this would retrieve or generate a session ID
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
