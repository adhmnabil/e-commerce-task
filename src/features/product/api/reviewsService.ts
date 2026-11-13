/**
 * In-memory reviews backend.
 *
 * The Easy Orders endpoint returns `reviews: null` for this store and exposes no
 * review vote endpoint, so this service stands in for them behind the same
 * async contract a real REST client would have. Swap the bodies of `listReviews`
 * and `voteReview` for `fetch` calls once endpoints exist.
 */
import type { Review, ReviewTopic, ReviewVoteInput } from '../types/product.types';
import { REVIEW_TOPICS } from '../types/product.types';

export class ReviewServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ReviewServiceError';
  }
}

const db = new Map<string, Review[]>();
let latencyMs = 450;

/** Test hook: make the fake network instant (or slower). */
export function setReviewServiceLatency(ms: number): void {
  latencyMs = ms;
}

export function resetReviewService(): void {
  db.clear();
}

function delay(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, latencyMs);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

/* ---------- Deterministic seed data ---------- */

const AUTHORS = [
  'Darrell Steward',
  'Darlene Robertson',
  'Kathryn Murphy',
  'Ronald Richards',
  'Jenny Wilson',
  'Cody Fisher',
  'Esther Howard',
  'Guy Hawkins',
  'Savannah Nguyen',
  'Brooklyn Simmons',
];

const BODIES = [
  'Fits true to size and the suede feels premium. Comfortable from the very first wear.',
  'Great stitching and the sole has real grip. Delivery was quicker than expected.',
  '',
  'Colour is exactly as pictured. I sized up half a size and it was perfect.',
  'Lovely finish, though the insole took a couple of days to break in.',
  '',
  'Second pair I have bought — consistent quality and well packaged.',
];

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return hash >>> 0;
}

const SEED_COUNT = 38;
const SEED_ANCHOR = Date.UTC(2025, 6, 2, 16, 40);

export function generateSeedReviews(productId: string, count = SEED_COUNT): Review[] {
  const random = mulberry32(hashString(productId));
  return Array.from({ length: count }, (_, i) => {
    const roll = random();
    const rating = roll < 0.72 ? 5 : roll < 0.9 ? 4 : roll < 0.97 ? 3 : 2;
    const topics = REVIEW_TOPICS.filter(() => random() < 0.35) as ReviewTopic[];
    return {
      id: `seed-${productId.slice(0, 8)}-${i}`,
      product_id: productId,
      author: AUTHORS[i % AUTHORS.length]!,
      avatar: `https://i.pravatar.cc/64?img=${(i % AUTHORS.length) + 11}`,
      rating,
      title: 'This is amazing product I have.',
      body: BODIES[i % BODIES.length]!,
      created_at: new Date(SEED_ANCHOR - i * 36 * 3600 * 1000).toISOString(),
      helpful_count: Math.floor(random() * 140),
      unhelpful_count: Math.floor(random() * 6),
      has_media: random() < 0.25,
      topics,
    };
  });
}

function ensureSeeded(productId: string): Review[] {
  let reviews = db.get(productId);
  if (!reviews) {
    reviews = generateSeedReviews(productId);
    db.set(productId, reviews);
  }
  return reviews;
}

/** Called by the product fetcher when the API does return reviews. */
export function seedReviewsFromApi(productId: string, reviews: Review[]): void {
  if (reviews.length > 0 && !db.has(productId)) db.set(productId, [...reviews]);
}

/* ---------- Public async contract ---------- */

export async function listReviews(productId: string, signal?: AbortSignal): Promise<Review[]> {
  await delay(signal);
  return [...ensureSeeded(productId)].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function voteReview({ productId, reviewId, direction }: ReviewVoteInput): Promise<Review> {
  await delay();
  const review = ensureSeeded(productId).find((r) => r.id === reviewId);
  if (!review) throw new ReviewServiceError('Review not found.', 404);
  if (direction === 'up') review.helpful_count += 1;
  else review.unhelpful_count += 1;
  return { ...review };
}
