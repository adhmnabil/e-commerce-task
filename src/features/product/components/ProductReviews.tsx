import { useCallback, useMemo, useState } from 'react';
import { Filter, Star } from 'lucide-react';
import { Button, IconButton, Skeleton } from '@/components/atoms';
import { Pagination, ReviewFilter, SectionHeader, type FilterGroup } from '@/components/molecules';
import { cn } from '@/utils/cn';
import { useProductReviews } from '../api/productApi';
import { useReviewVoteMutation } from '../api/useReviewMutation';
import { filterReviews, summarizeRatings } from '../lib/productLogic';
import { REVIEW_TOPICS, type ReviewFilters, type ReviewTab, type ReviewTopic } from '../types/product.types';
import { RatingSummaryCard } from './RatingSummaryCard';
import { ReviewCard } from './ReviewCard';

export const REVIEWS_PAGE_SIZE = 4;
export const REVIEWS_SECTION_ID = 'product-reviews';

const TABS: { id: ReviewTab; label: string }[] = [
  { id: 'all', label: 'All Reviews' },
  { id: 'media', label: 'With Photo & Video' },
  { id: 'description', label: 'With Description' },
];

const INITIAL_FILTERS: ReviewFilters = { tab: 'all', ratings: [], topics: [] };

const RATING_OPTIONS = [5, 4, 3, 2, 1].map((star) => ({
  value: String(star),
  label: (
    <span className="inline-flex items-center gap-1">
      <Star aria-hidden strokeWidth={0} className="size-[18px] fill-star" />
      {star}
    </span>
  ),
}));
const TOPIC_OPTIONS = REVIEW_TOPICS.map((topic) => ({ value: topic, label: topic }));

function toggle<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-36 w-full" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-40" />
        </div>
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const { data: reviews = [], isPending, isError, refetch } = useProductReviews(productId);
  const voteMutation = useReviewVoteMutation(productId);
  const [filters, setFilters] = useState<ReviewFilters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const summary = useMemo(() => summarizeRatings(reviews), [reviews]);
  const filtered = useMemo(() => filterReviews(reviews, filters), [reviews, filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / REVIEWS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * REVIEWS_PAGE_SIZE, currentPage * REVIEWS_PAGE_SIZE);
  const hasActiveFilters = filters.tab !== 'all' || filters.ratings.length > 0 || filters.topics.length > 0;

  const updateFilters = useCallback((updater: (f: ReviewFilters) => ReviewFilters) => {
    setFilters(updater);
    setPage(1);
  }, []);

  const handleFilterToggle = useCallback(
    (groupId: string, value: string) =>
      updateFilters((f) =>
        groupId === 'rating'
          ? { ...f, ratings: toggle(f.ratings, Number(value)) }
          : { ...f, topics: toggle(f.topics, value as ReviewTopic) },
      ),
    [updateFilters],
  );

  const filterGroups = useMemo<FilterGroup[]>(
    () => [
      { id: 'rating', title: 'Rating', options: RATING_OPTIONS, selected: filters.ratings.map(String) },
      { id: 'topics', title: 'Review Topics', options: TOPIC_OPTIONS, selected: filters.topics },
    ],
    [filters.ratings, filters.topics],
  );

  const { mutate: vote } = voteMutation;
  const handleVote = useCallback(
    (reviewId: string, direction: 'up' | 'down') => vote({ reviewId, direction }),
    [vote],
  );

  const handlePageChange = useCallback((next: number) => {
    setPage(next);
    document.getElementById(`${REVIEWS_SECTION_ID}-list`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <section id={REVIEWS_SECTION_ID} aria-labelledby={`${REVIEWS_SECTION_ID}-title`} className="scroll-mt-24">
      <SectionHeader id={`${REVIEWS_SECTION_ID}-title`} title="Product Reviews" />

      {isPending ? (
        <ReviewsSkeleton />
      ) : isError ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-lg dash-box p-5 text-sm">
          <p>We couldn&apos;t load reviews right now.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <RatingSummaryCard summary={summary} />

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[278px_minmax(0,1fr)] lg:gap-10">
            <ReviewFilter
              groups={filterGroups}
              onToggle={handleFilterToggle}
              className={cn('self-start', !mobileFiltersOpen && 'hidden lg:block')}
            />

            <div id={`${REVIEWS_SECTION_ID}-list`} className="min-w-0 scroll-mt-24">
              <h3 className="mb-4 text-base font-semibold leading-[1.4] tracking-[-0.2px] text-ink lg:text-xl lg:text-[#292929]">
                Review Lists
              </h3>

              <div className="mb-8 flex items-start justify-between gap-3 lg:mb-[34px]">
                <div role="group" aria-label="Review type" className="flex flex-wrap gap-3">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      aria-pressed={filters.tab === tab.id}
                      onClick={() => updateFilters((f) => ({ ...f, tab: tab.id }))}
                      className={cn(
                        'h-[30px] rounded-md border px-2.5 text-xs font-medium leading-[1.6] transition-colors lg:h-[42px] lg:rounded-lg lg:px-4 lg:text-sm',
                        filters.tab === tab.id
                          ? 'border-[#333] bg-[#ebebeb] text-ink lg:px-5'
                          : 'border-[#e6e6e6] bg-white text-[#0b0f0e] hover:border-ink-subtle',
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <IconButton
                  variant="outlined"
                  label={mobileFiltersOpen ? 'Hide filters' : 'Show filters'}
                  aria-expanded={mobileFiltersOpen}
                  icon={<Filter aria-hidden strokeWidth={1.5} className="size-5" />}
                  onClick={() => setMobileFiltersOpen((v) => !v)}
                  className="size-[30px] rounded-md border-[#e6e6e6] lg:hidden"
                />
              </div>

              <p className="sr-only" role="status">
                {`${filtered.length} review${filtered.length === 1 ? '' : 's'} shown`}
              </p>

              {visible.length === 0 ? (
                <div className="rounded-lg dash-box px-4 py-10 text-center text-sm text-ink-muted">
                  <p>No reviews match these filters.</p>
                  {hasActiveFilters && (
                    <Button variant="link" size="sm" className="mt-2" onClick={() => updateFilters(() => INITIAL_FILTERS)}>
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <div>
                  {visible.map((review) => (
                    <ReviewCard key={review.id} review={review} onVote={handleVote} />
                  ))}
                </div>
              )}

              <Pagination className="mt-9 lg:mt-8" page={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
