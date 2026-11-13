import type { ProductSummary } from '../types/product.types';

/**
 * The Easy Orders API exposes no related/popular listing for this store, so the
 * merchandising rails use this static catalogue (images are the store's own CDN assets).
 */
const CDN = 'https://easyorders.fra1.digitaloceanspaces.com';

export const CATALOG: ProductSummary[] = [
  { id: 'c1', slug: 'Sneakers12', brand: 'Achilles', name: 'Achilles Pro Suede Sneakers — Brown', image: `${CDN}/1735836944747077894.webp`, price: 160, rating: 4.5, sold: 1238 },
  { id: 'c2', slug: 'Sneakers12', brand: 'Achilles', name: 'Achilles Pro Leather Sneakers — Black', image: `${CDN}/1735836957769748053.webp`, price: 160, rating: 4.6, sold: 1120 },
  { id: 'c3', slug: 'Sneakers12', brand: 'Achilles', name: 'Achilles Pro Suede Sneakers — Beige', image: `${CDN}/1735836966489475540.jpg`, price: 175, rating: 4.4, sold: 876 },
  { id: 'c4', slug: 'Sneakers12', brand: 'Achilles', name: 'Achilles Pro Signature Edition', image: `${CDN}/1735836892282056854.webp`, price: 190, rating: 4.7, sold: 512 },
  { id: 'c5', slug: 'Sneakers12', brand: 'Achilles', name: 'Achilles Classic Low Top', image: `${CDN}/1734958738245433660.webp`, price: 150, rating: 4.3, sold: 954 },
];
