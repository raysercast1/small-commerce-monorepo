export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  domain: string;
  currency: string;
  locale: string;
  settings: string;
  metadata?: string;
  title?: string;
}
