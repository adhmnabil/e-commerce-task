import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Review, ReviewVoteInput } from '../types/product.types';
import { productKeys } from './productApi';
import { voteReview } from './reviewsService';

interface VoteContext {
  previous: Review[] | undefined;
}

export function useReviewVoteMutation(productId: string) {
  const queryClient = useQueryClient();
  const queryKey = productKeys.reviews(productId);

  return useMutation<Review, Error, Omit<ReviewVoteInput, 'productId'>, VoteContext>({
    mutationKey: [...queryKey, 'vote'],
    mutationFn: (input) => voteReview({ ...input, productId }),

    onMutate: async ({ reviewId, direction }) => {
      // Stop in-flight refetches from overwriting the optimistic count.
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Review[]>(queryKey);
      queryClient.setQueryData<Review[]>(queryKey, (old = []) =>
        old.map((review) =>
          review.id !== reviewId
            ? review
            : direction === 'up'
              ? { ...review, helpful_count: review.helpful_count + 1 }
              : { ...review, unhelpful_count: review.unhelpful_count + 1 },
        ),
      );
      return { previous };
    },

    onError: (_error, _input, context) => {
      if (context) queryClient.setQueryData(queryKey, context.previous);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
