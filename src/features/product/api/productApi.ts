import { queryOptions, useQuery } from '@tanstack/react-query';
import type { Product, ProductSummary, Review } from '../types/product.types';
import { CATALOG } from './catalogFixture';
import { listReviews, seedReviewsFromApi } from './reviewsService';

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.easy-orders.net/api/v1';
export const STORE_SLUG: string = import.meta.env.VITE_STORE_SLUG ?? 'clear-theme';
const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** 4xx errors (other than throttling) are deterministic; retrying won't help. */
  get isRetryable(): boolean {
    return this.status === 0 || this.status === 408 || this.status === 429 || this.status >= 500;
  }
}

function withTimeout(signal: AbortSignal | undefined, ms: number): AbortSignal {
  const timeout = AbortSignal.timeout(ms);
  return signal && 'any' in AbortSignal ? AbortSignal.any([signal, timeout]) : (signal ?? timeout);
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: withTimeout(signal, REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
    throw new ApiError(timedOut ? 'The request timed out.' : 'Network error. Check your connection.', timedOut ? 408 : 0, url);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404 ? 'Product not found.' : `Request failed (${response.status}).`,
      response.status,
      url,
    );
  }
  return (await response.json()) as T;
}

/** The API returns `null` for empty collections; normalise so consumers never branch on it. */
function normalizeProduct(raw: Product): Product {
  return {
    ...raw,
    images: raw.images ?? [],
    variations: raw.variations ?? [],
    variants: raw.variants ?? [],
    categories: raw.categories ?? [],
    reviews: raw.reviews ?? [],
  };
}

export async function fetchProduct(slug: string, signal?: AbortSignal): Promise<Product> {
  const raw = await request<Product>(
    `/products/slug/${encodeURIComponent(STORE_SLUG)}/${encodeURIComponent(slug)}?join=reviews`,
    signal,
  );
  const product = normalizeProduct(raw);
  seedReviewsFromApi(product.id, product.reviews ?? []);
  return product;
}

export async function fetchRelatedProducts(): Promise<ProductSummary[]> {
  return CATALOG;
}

/* ---------- Query keys & options ---------- */

export const productKeys = {
  all: ['product'] as const,
  detail: (slug: string) => [...productKeys.all, 'detail', slug] as const,
  reviews: (productId: string) => [...productKeys.all, 'reviews', productId] as const,
  related: (slug: string) => [...productKeys.all, 'related', slug] as const,
};

export const productQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: productKeys.detail(slug),
    queryFn: ({ signal }) => fetchProduct(slug, signal),
    staleTime: 60_000,
    retry: (failureCount, error) =>
      failureCount < 2 && (!(error instanceof ApiError) || error.isRetryable),
  });

export const reviewsQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: productKeys.reviews(productId),
    queryFn: ({ signal }): Promise<Review[]> => listReviews(productId, signal),
    staleTime: 30_000,
  });

export function useProduct(slug: string) {
  return useQuery(productQueryOptions(slug));
}

export function useProductReviews(productId: string | undefined) {
  return useQuery({ ...reviewsQueryOptions(productId ?? ''), enabled: Boolean(productId) });
}

export function useRelatedProducts(slug: string) {
  return useQuery({
    queryKey: productKeys.related(slug),
    queryFn: fetchRelatedProducts,
    staleTime: Infinity,
  });
}
