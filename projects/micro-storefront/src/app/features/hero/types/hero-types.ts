export interface HeroConfig {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  overlayOpacity?: number;
}

export interface IHeroState {
  config: HeroConfig | null;
  loading: boolean;
  error: string | null;
}
