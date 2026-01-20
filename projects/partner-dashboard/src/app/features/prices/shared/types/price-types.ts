import {Metadata} from '../../../../shared/types/shared-types';

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

// ResponsePriceR
export interface Price {
  id: string;
  type: PriceType;
  cost: number;
  price: number;
  priceOverride?: number;
  currency?: Currency; // optional for variant price per OpenAPI
  profit?: number;
  margin?: number; // float
  metadata?: Metadata;
}

// Creation payloads
export interface PricePCreateDTO {
  cost: number;
  price: number;
  priceOverride?: number | null;
  currency: Currency;
  type: PriceType;
  metadata?: Metadata;
}

export interface IdentifiersPricePCR {
  productId: string;
  storeId: string;
  partnerId: string;
}

export interface PricePCreationRequestBody {
  priceDTO: PricePCreateDTO;
  identifiers: IdentifiersPricePCR;
}

export interface PriceVCreateR {
  cost: number;
  price: number;
  priceOverride?: number | null;
  type: PriceType;
  metadata?: Metadata;
}

export interface IdentifiersPriceVCR {
  variantId: string;
  productId: string;
  storeId: string;
  type: PriceType; // Price Type assigned to the Product Parent of the Variant.
  partnerId: string;
}

export interface PriceVCreationRequestBody {
  priceVCreateR: PriceVCreateR;
  identifiers: IdentifiersPriceVCR;
}

// Update payloads
export interface IdentifiersPriceVUR {
  variantId?: string;
  productId?: string;
  partnerId?: string;
  type: PriceType;
}

export interface PriceVUpdateR {
  cost: number;
  price: number;
  priceOverride?: number | null;
  metadata?: Metadata;
}

export interface PriceVUpdateRequestBody {
  priceVUpdateR: PriceVUpdateR;
  identifiersPVUR: IdentifiersPriceVUR;
}

export interface IdentifiersPricePUR {
  productId?: string;
  partnerId?: string;
  type: PriceType;
}

export interface PricePUpdateDTO {
  cost: number;
  price: number;
  priceOverride?: number | null;
  currency?: Currency; // optional for variant price per OpenAPI
  metadata?: Metadata;
}

export interface PricePUpdateRequestBody {
  pricePUpdateDTO: PricePUpdateDTO;
  identifiersPricePUR: IdentifiersPricePUR;
}

export interface ListResponsePrice {
  prices: Price[];
}

// State model for prices UI
export interface IPricesState {
  prices: Price[];
  loading: boolean;
  error: string | null;
}

export interface PriceFormValue {
  id: string;
  cost: number | null;
  price: number | null;
  priceOverride: number | null;
  currency?: Currency | null; // currency is only required for product mode per API
  type: PriceType | null;
  metadata?: Metadata | null;
}
