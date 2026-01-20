import {Currency, PriceType} from '../types/main-enums';

export interface Price {
  id: string;
  type: PriceType;
  cost: number;
  price: number;
  priceOverride: number;
  currency: Currency;
  profit: number;
  margin: number;
  metadata: string;
}
