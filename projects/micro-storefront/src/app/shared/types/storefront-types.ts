/**
 * Storefront Domain Types
 * These types are specific to the micro-storefront application
 */

export interface StorefrontProduct {
  id: string;
  name: string;
  description: string;
  brand?: string;
  sku: string;
  images: ProductImage[];
  prices: ProductPrice[];
  variants?: ProductVariant[];
  categories?: Category[];
  metadata?: Record<string, unknown>;
  inStock: boolean;
  stockQuantity?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  altText?: string;
  isMain: boolean;
}

export interface ProductPrice {
  id: string;
  type: PriceType;
  amount: number;
  currency: string;
  compareAtPrice?: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  attributes?: VariantAttribute[];
  images?: ProductImage[];
  price?: ProductPrice;
  inStock: boolean;
}

export interface VariantAttribute {
  key: string;
  value: string | number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  sku: string;
  variantName?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  currency: string;
  itemCount: number;
}

export interface CheckoutFormData {
  customer: CustomerInfo;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentMethod {
  type: 'whatsapp' | 'cash_on_delivery';
  details?: Record<string, unknown>;
}

export interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  estimatedDays?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  customer: CustomerInfo;
  shippingAddress: Address;
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: Date;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type PriceType = 'base' | 'sale' | 'special';

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface FilterParams {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  inStock?: boolean;
  search?: string;
}

export interface StoreConfig {
  storeId: string;
  storeName: string;
  domain: string;
  currency: string;
  locale: string;
  theme?: ThemeConfig;
  whatsappNumber?: string;
}

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  logo?: string;
  customStyles?: Record<string, unknown>;
}
