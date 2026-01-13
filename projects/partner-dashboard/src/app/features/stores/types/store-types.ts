import {Store} from '../../../shared/types/shared-types';

export interface IStoresState {
  stores: Store[];
  loading: boolean;
  error: string | null;
}

export interface StoreDTO {
  name: string;
  slug: string;
  description: string;
  domain: string;
  currency: Currency;
  locale: Locale;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

enum Locale {
  CANADA_EN = 'en-CA',
  CANADA_FR = 'fr-CA',
  COLOMBIA_ES = 'es-CO',
  MEXICO_ES = 'es-MX',
  ARGENTINA_ES = 'es-AR',
  CHILE_ES = 'es-CL',
  BRAZIL_PT = 'pt-BR',
  VENEZUELA_ES = 'es-VE'
}

enum Currency {
  USD = 'USD',
  CAD = 'CAD',
  COP = 'COP',
  MXN = 'MXN',
  EUR = 'EUR',
  VEF = 'VEF',
  ARS = 'ARS',
  CLP = 'CLP',
  PEN = 'PEN',
  BRL = 'BRL'
}
