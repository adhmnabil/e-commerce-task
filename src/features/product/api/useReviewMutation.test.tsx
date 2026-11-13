import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestQueryClient } from '@/test/utils';
import type { Review } from '../types/product.types';
import { productKeys } from './productApi';
import { listReviews, resetReviewService, setReviewServiceLatency } from './reviewsService';
import { useReviewVoteMutation } from './useReviewMutation';

const PRODUCT_ID = 'product-under-test';
const key = productKeys.reviews(PRODUCT_ID);

const existing: Review = {
  id: 'existing-1',
  product_id: PRODUCT_ID,
  author: 'Darrell Steward',
  rating: 4,
  title: 'Solid pair',
  body: '',
  created_at: '2025-07-01T10:00:00Z',
  helpful_count: 3,
  unhelpful_count: 0,
  has_media: false,
  topics: [],
};

function setup(initial: Review[]) {
  const client = createTestQueryClient();
  client.setQueryData<Review[]>(key, initial);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

// Long enough that the optimistic state is observable before the server settles.
beforeEach(() => {
  resetReviewService();
  setReviewServiceLatency(250);
});
afterAll(() => setReviewServiceLatency(450));

describe('useReviewVoteMutation', () => {
  it('optimistically increments the helpful count before the server responds', async () => {
    const seeded = await listReviews(PRODUCT_ID);
    const target = seeded[0]!;
    const { client, wrapper } = setup(seeded);
    const { result } = renderHook(() => useReviewVoteMutation(PRODUCT_ID), { wrapper });

    act(() => result.current.mutate({ reviewId: target.id, direction: 'up' }));

    await waitFor(() => expect(client.getQueryData<Review[]>(key)![0]!.helpful_count).toBe(target.helpful_count + 1));
    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('rolls back to the previous cache when the server rejects the vote', async () => {
    const { client, wrapper } = setup([existing]);
    const { result } = renderHook(() => useReviewVoteMutation(PRODUCT_ID), { wrapper });

    // `existing-1` is not in the service DB, so the server responds 404.
    act(() => result.current.mutate({ reviewId: 'existing-1', direction: 'up' }));
    await waitFor(() => expect(client.getQueryData<Review[]>(key)![0]!.helpful_count).toBe(4));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(client.getQueryData<Review[]>(key)![0]!.helpful_count).toBe(3);
  });

  it('invalidates the reviews query once settled', async () => {
    const { client, wrapper } = setup([existing]);
    const { result } = renderHook(() => useReviewVoteMutation(PRODUCT_ID), { wrapper });

    act(() => result.current.mutate({ reviewId: 'existing-1', direction: 'down' }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
  });
});
