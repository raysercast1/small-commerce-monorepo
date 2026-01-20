import {CheckoutStatus, Currency, PaymentMethod, ShippingType} from '../types/main-enums';

export interface CheckoutDraft {
  shippingAddress: string;
  billingAddress: string;
  subtotal: number;
  discount?: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  status: CheckoutStatus;
  currency: Currency;
  shippingMethod: ShippingType;
  paymentMethod: PaymentMethod;
}
