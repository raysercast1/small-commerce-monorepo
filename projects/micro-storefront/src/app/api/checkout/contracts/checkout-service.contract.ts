import { Observable } from 'rxjs';
import { Order, CheckoutFormData } from '../../../shared/types/storefront-types';
import { ApiResponse } from 'shared-core';

export abstract class CheckoutServiceContract {
  abstract createOrder(
    storeId: string,
    sessionId: string,
    checkoutData: CheckoutFormData
  ): Observable<ApiResponse<Order>>;

  abstract getOrder(storeId: string, orderId: string): Observable<ApiResponse<Order>>;

  abstract validateCheckout(
    storeId: string,
    sessionId: string
  ): Observable<ApiResponse<{ valid: boolean; errors?: string[] }>>;
}
