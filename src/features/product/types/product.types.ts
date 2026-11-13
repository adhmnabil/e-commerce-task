/** Raw shapes returned by `GET /products/slug/:store/:slug?join=reviews`. */

export type VariationType = 'image' | 'color' | 'button' | 'text';

export interface VariationProp {
  id: string;
  name: string;
  variation_id: string;
  /** Image URL for `image` variations, hex for `color`, absent for `button`. */
  value?: string;
}

export interface Variation {
  id: string;
  name: string;
  product_id: string;
  type: VariationType;
  props: VariationProp[];
}

export interface VariantProp {
  id: string;
  variation: string;
  variation_prop: string;
  product_variant_id: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  price: number;
  /** `0` means "no sale price"; callers must fall back to `price`. */
  sale_price: number;
  quantity: number;
  taager_code: string;
  variation_props: VariantProp[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  thumb: string;
  show_in_header: boolean;
  position: number;
}

export interface Review {
  id: string;
  product_id: string;
  author: string;
  avatar?: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  helpful_count: number;
  unhelpful_count: number;
  has_media: boolean;
  topics: ReviewTopic[];
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number;
  thumb: string;
  images: string[];
  quantity: number;
  track_stock: boolean;
  disable_orders_for_no_stock: boolean;
  is_quantity_hidden: boolean;
  is_free_shipping: boolean;
  custom_currency: string;
  buy_now_text: string;
  variations: Variation[] | null;
  variants: ProductVariant[] | null;
  categories: ProductCategory[] | null;
  reviews?: Review[] | null;
  created_at: string;
  updated_at: string;
}

/** Variation name -> selected prop name, e.g. `{ color: 'brown', size: '40' }`. */
export type VariantSelection = Record<string, string>;

export const REVIEW_TOPICS = [
  'Product Quality',
  'Seller Services',
  'Product Price',
  'Shipment',
  'Match with Description',
] as const;

export type ReviewTopic = (typeof REVIEW_TOPICS)[number];

export type ReviewTab = 'all' | 'media' | 'description';

export interface ReviewFilters {
  tab: ReviewTab;
  ratings: number[];
  topics: ReviewTopic[];
}

export interface RatingSummary {
  average: number;
  total: number;
  /** Index 0 holds the 1-star count, index 4 the 5-star count. */
  distribution: [number, number, number, number, number];
}

export interface ReviewVoteInput {
  productId: string;
  reviewId: string;
  direction: 'up' | 'down';
}

export interface ProductSummary {
  id: string;
  slug: string;
  brand: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  sold: number;
}
