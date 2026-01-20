export enum ImageStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED'
}

export enum PriceType {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  VIP = 'VIP',
}

export enum Currency {
  USD = 'USD',
  CAD = 'CAD',
  EUR = 'EUR',
  COP = 'COP',
  VEF = 'VEF',
  MXN = 'MXN',
  ARS = 'ARS',
  BRL = 'BRL',
  CLP = 'CLP',
  UYU = 'UYU',
  PYG = 'PYG',
  PEN = 'PEN',
  BOB = 'BOB',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  CASH = 'CASH',
}

export enum ShippingType {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  FREE_SHIPPING = 'FREE_SHIPPING',
}

export enum CheckoutStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

export enum CustomerType {
  WANDERER = 'WANDERER',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  VIP = 'VIP',
  UNKNOWN = 'UNKNOWN',
}

