import { Observable } from 'rxjs';
import { Cart, CartItem } from '../../../shared/types/storefront-types';
import { ApiResponse } from 'shared-core';

export abstract class CartServiceContract {
  abstract getCart(storeId: string, sessionId: string): Observable<ApiResponse<Cart>>;

  abstract addToCart(
    storeId: string,
    sessionId: string,
    item: Omit<CartItem, 'id'>
  ): Observable<ApiResponse<Cart>>;

  abstract updateCartItem(
    storeId: string,
    sessionId: string,
    itemId: string,
    quantity: number
  ): Observable<ApiResponse<Cart>>;

  abstract removeFromCart(
    storeId: string,
    sessionId: string,
    itemId: string
  ): Observable<ApiResponse<Cart>>;

  abstract clearCart(storeId: string, sessionId: string): Observable<ApiResponse<boolean>>;
}
