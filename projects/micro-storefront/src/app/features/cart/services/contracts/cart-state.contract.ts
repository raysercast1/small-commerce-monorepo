import { Signal } from '@angular/core';
import { Cart, CartItem } from '../../../../shared/types/storefront-types';

export abstract class CartStateContract {
  abstract readonly cart: Signal<Cart | null>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly error: Signal<string | null>;

  abstract loadCart(storeId: string, sessionId: string): void;
  abstract addItem(storeId: string, sessionId: string, item: Omit<CartItem, 'id'>): void;
  abstract updateItemQuantity(storeId: string, sessionId: string, itemId: string, quantity: number): void;
  abstract removeItem(storeId: string, sessionId: string, itemId: string): void;
  abstract clearCart(storeId: string, sessionId: string): void;
}
