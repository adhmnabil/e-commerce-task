import { memo, useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Avatar, RatingStars } from '@/components/atoms';
import { cn } from '@/utils/cn';
import { formatDateTime, formatNumber } from '@/utils/format';
import type { Review } from '../types/product.types';

export interface ReviewCardProps {
  review: Review;
  onVote: (reviewId: string, direction: 'up' | 'down') => void;
}

const voteButton =
  'inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#e4e9ee] bg-white text-xs leading-[1.6] tabular-nums text-[#0b0f0e] transition-colors enabled:hover:border-ink-subtle disabled:cursor-default lg:h-[50px] lg:rounded-lg lg:text-base';

export const ReviewCard = memo(function ReviewCard({ review, onVote }: ReviewCardProps) {
  const [myVote, setMyVote] = useState<'up' | 'down' | null>(null);
  const canVote = myVote === null;

  const vote = (direction: 'up' | 'down') => {
    if (!canVote) return;
    setMyVote(direction);
    onVote(review.id, direction);
  };

  return (
    <article className="dash-b flex items-end justify-between gap-4 py-6 first:pt-0 last:bg-none last:pb-0 lg:py-8">
      <div className="min-w-0">
        <RatingStars value={review.rating} size="responsive" />
        <h4 className="mt-4 text-sm font-semibold leading-[1.4] tracking-[-0.2px] text-ink lg:text-lg">{review.title}</h4>
        <p className="mt-1 text-xs leading-[1.6] text-[#818b9c] lg:text-base">
          <time dateTime={review.created_at}>{formatDateTime(review.created_at)}</time>
        </p>
        {review.body && <p className="mt-2 text-sm leading-[1.4] text-[#666] lg:text-base">{review.body}</p>}

        <div className="mt-4 flex items-center gap-3 lg:mt-6">
          <Avatar name={review.author} src={review.avatar} className="size-6 lg:size-8 lg:text-xs" />
          <span className="text-xs font-medium leading-[1.6] text-[#0b0f0e] lg:text-base">{review.author}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 lg:gap-4" role="group" aria-label="Was this review helpful?">
        <button
          type="button"
          onClick={() => vote('up')}
          disabled={!canVote}
          aria-pressed={myVote === 'up'}
          aria-label={`Helpful (${review.helpful_count})`}
          className={cn(voteButton, 'px-2.5 lg:px-3', myVote === 'up' && 'border-ink')}
        >
          <ThumbsUp aria-hidden strokeWidth={1.5} className={cn('size-5 lg:size-6', myVote === 'up' && 'fill-ink')} />
          {formatNumber(review.helpful_count)}
        </button>
        <button
          type="button"
          onClick={() => vote('down')}
          disabled={!canVote}
          aria-pressed={myVote === 'down'}
          aria-label={`Not helpful (${review.unhelpful_count})`}
          className={cn(voteButton, 'w-9 lg:w-12', myVote === 'down' && 'border-ink')}
        >
          <ThumbsDown aria-hidden strokeWidth={1.5} className={cn('size-5 lg:size-6', myVote === 'down' && 'fill-ink')} />
        </button>
      </div>
    </article>
  );
});
