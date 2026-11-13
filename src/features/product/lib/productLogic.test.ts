import { describe, expect, it } from 'vitest';
import { makeProduct } from '@/test/utils';
import type { Review } from '../types/product.types';
import {
  filterReviews,
  findVariant,
  getDefaultSelection,
  getGalleryImages,
  getMaxPurchasable,
  getPricing,
  getSelectionImage,
  isOptionAvailable,
  summarizeRatings,
} from './productLogic';

describe('variant resolution (real API payload)', () => {
  const product = makeProduct();

  it('finds the exact variant for a complete selection', () => {
    expect(findVariant(product, { color: 'brown', size: '42' })?.id).toBe('b957f85d-84bc-4c3a-a107-6d52ab1614aa');
  });

  it('returns null for a partial selection', () => {
    expect(findVariant(product, { color: 'brown' })).toBeNull();
  });

  it('defaults to the first variant combination', () => {
    expect(getDefaultSelection(product)).toEqual({ color: 'brown', size: '38' });
  });

  it('treats every option as available when stock is not tracked', () => {
    expect(isOptionAvailable(product, { color: 'brown', size: '38' }, 'size', '42')).toBe(true);
  });

  it('marks options unavailable when tracked stock is exhausted', () => {
    const tracked = makeProduct({ track_stock: true });
    tracked.variants = tracked.variants!.map((v) => ({ ...v, quantity: v.id === 'b957f85d-84bc-4c3a-a107-6d52ab1614aa' ? 0 : 5 }));
    expect(isOptionAvailable(tracked, { color: 'brown', size: '38' }, 'size', '42')).toBe(false);
    expect(isOptionAvailable(tracked, { color: 'black', size: '38' }, 'size', '42')).toBe(true);
  });

  it('caps purchasable quantity by tracked stock', () => {
    const tracked = makeProduct({ track_stock: true });
    const variant = { ...tracked.variants![0]!, quantity: 2 };
    expect(getMaxPurchasable(tracked, variant)).toBe(2);
    expect(getMaxPurchasable(product, variant)).toBe(10);
  });

  it('resolves the image tied to the selected colour', () => {
    expect(getSelectionImage(product, { color: 'black', size: '40' })).toMatch(/1735836957769748053/);
  });

  it('builds a de-duplicated gallery from thumb, images and colour swatches', () => {
    const images = getGalleryImages(product);
    expect(images).toHaveLength(5);
    expect(new Set(images).size).toBe(images.length);
  });
});

describe('getPricing', () => {
  const product = makeProduct();

  it('falls back to product sale price when the variant has none (sale_price 0)', () => {
    expect(getPricing(product, product.variants![0]!)).toEqual({ price: 160, compareAt: 190, discountPercent: 16 });
  });

  it('reports no discount when there is no sale', () => {
    expect(getPricing(makeProduct({ sale_price: 0 }), null)).toEqual({ price: 190, compareAt: null, discountPercent: 0 });
  });

  it('ignores a sale price that is not lower than the base price', () => {
    expect(getPricing(makeProduct({ sale_price: 250 }), null).compareAt).toBeNull();
  });
});

const review = (overrides: Partial<Review>): Review => ({
  id: Math.random().toString(36),
  product_id: 'p1',
  author: 'A',
  rating: 5,
  title: 't',
  body: '',
  created_at: '2025-01-01T00:00:00Z',
  helpful_count: 0,
  unhelpful_count: 0,
  has_media: false,
  topics: [],
  ...overrides,
});

describe('summarizeRatings', () => {
  it('computes average and 1→5 distribution', () => {
    const summary = summarizeRatings([review({ rating: 5 }), review({ rating: 4 }), review({ rating: 4 }), review({ rating: 1 })]);
    expect(summary).toEqual({ total: 4, average: 3.5, distribution: [1, 0, 0, 2, 1] });
  });

  it('handles an empty list', () => {
    expect(summarizeRatings([])).toEqual({ total: 0, average: 0, distribution: [0, 0, 0, 0, 0] });
  });
});

describe('filterReviews', () => {
  const reviews = [
    review({ id: 'a', rating: 5, has_media: true }),
    review({ id: 'b', rating: 4, body: 'Great', topics: ['Shipment'] }),
    review({ id: 'c', rating: 3, body: 'Ok', topics: ['Product Price'] }),
  ];
  const ids = (list: Review[]) => list.map((r) => r.id);

  it('filters by tab', () => {
    expect(ids(filterReviews(reviews, { tab: 'media', ratings: [], topics: [] }))).toEqual(['a']);
    expect(ids(filterReviews(reviews, { tab: 'description', ratings: [], topics: [] }))).toEqual(['b', 'c']);
  });

  it('combines rating and topic filters', () => {
    expect(ids(filterReviews(reviews, { tab: 'all', ratings: [4, 3], topics: ['Shipment'] }))).toEqual(['b']);
  });
});
