import { MAX_LINE_QUANTITY } from '@/features/cart/store/cartStore';
import type {
  Product,
  ProductVariant,
  RatingSummary,
  Review,
  ReviewFilters,
  VariantSelection,
} from '../types/product.types';

function variantMatches(variant: ProductVariant, selection: VariantSelection): boolean {
  return Object.entries(selection).every(([variation, prop]) =>
    variant.variation_props.some((vp) => vp.variation === variation && vp.variation_prop === prop),
  );
}

export function isVariantInStock(product: Product, variant: ProductVariant): boolean {
  return !product.track_stock || variant.quantity > 0;
}

/** Exact variant for a complete selection, or `null` while the selection is partial. */
export function findVariant(product: Product, selection: VariantSelection): ProductVariant | null {
  const variations = product.variations ?? [];
  if (variations.length === 0) return null;
  if (!variations.every((v) => selection[v.name])) return null;
  return (product.variants ?? []).find((variant) => variantMatches(variant, selection)) ?? null;
}

/**
 * Whether picking `propName` for `variationName` (keeping the rest of the current
 * selection) leads to at least one purchasable variant.
 */
export function isOptionAvailable(
  product: Product,
  selection: VariantSelection,
  variationName: string,
  propName: string,
): boolean {
  const variants = product.variants ?? [];
  if (variants.length === 0) return true;
  const candidate = { ...selection, [variationName]: propName };
  return variants.some((variant) => variantMatches(variant, candidate) && isVariantInStock(product, variant));
}

/** First purchasable combination, falling back to the first prop of each variation. */
export function getDefaultSelection(product: Product): VariantSelection {
  const variations = product.variations ?? [];
  const inStock = (product.variants ?? []).find((variant) => isVariantInStock(product, variant));

  return Object.fromEntries(
    variations.map((variation) => {
      const fromVariant = inStock?.variation_props.find((vp) => vp.variation === variation.name)?.variation_prop;
      return [variation.name, fromVariant ?? variation.props[0]?.name ?? ''];
    }),
  );
}

export interface Pricing {
  /** Price the customer pays. */
  price: number;
  /** Original price when discounted, otherwise `null`. */
  compareAt: number | null;
  discountPercent: number;
}

/** A `sale_price` of `0` from the API means "not on sale". */
export function getPricing(product: Product, variant: ProductVariant | null): Pricing {
  const base = variant?.price || product.price;
  const sale = variant?.sale_price || product.sale_price;
  const onSale = sale > 0 && sale < base;
  return {
    price: onSale ? sale : base,
    compareAt: onSale ? base : null,
    discountPercent: onSale ? Math.round(((base - sale) / base) * 100) : 0,
  };
}

export function getMaxPurchasable(product: Product, variant: ProductVariant | null): number {
  if (!product.track_stock) return MAX_LINE_QUANTITY;
  const stock = variant ? variant.quantity : product.quantity;
  return Math.max(0, Math.min(stock, MAX_LINE_QUANTITY));
}

export function getGalleryImages(product: Product): string[] {
  const variationImages = (product.variations ?? [])
    .filter((variation) => variation.type === 'image')
    .flatMap((variation) => variation.props.map((prop) => prop.value ?? ''));
  return Array.from(new Set([product.thumb, ...(product.images ?? []), ...variationImages].filter(Boolean)));
}

/** Image associated with the currently selected image-type option, if any. */
export function getSelectionImage(product: Product, selection: VariantSelection): string | null {
  for (const variation of product.variations ?? []) {
    if (variation.type !== 'image') continue;
    const prop = variation.props.find((p) => p.name === selection[variation.name]);
    if (prop?.value) return prop.value;
  }
  return null;
}

export function summarizeRatings(reviews: readonly Review[]): RatingSummary {
  const distribution: RatingSummary['distribution'] = [0, 0, 0, 0, 0];
  let sum = 0;
  for (const review of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(review.rating)));
    const index = (star - 1) as 0 | 1 | 2 | 3 | 4;
    distribution[index] += 1;
    sum += star;
  }
  const total = reviews.length;
  return { total, distribution, average: total ? Math.round((sum / total) * 10) / 10 : 0 };
}

export function filterReviews(reviews: readonly Review[], filters: ReviewFilters): Review[] {
  return reviews.filter((review) => {
    if (filters.tab === 'media' && !review.has_media) return false;
    if (filters.tab === 'description' && !review.body.trim()) return false;
    if (filters.ratings.length && !filters.ratings.includes(Math.round(review.rating))) return false;
    if (filters.topics.length && !filters.topics.some((topic) => review.topics.includes(topic))) return false;
    return true;
  });
}