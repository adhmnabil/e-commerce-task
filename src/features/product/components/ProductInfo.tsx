import { useId, useMemo, useState, type ReactNode } from 'react';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/atoms';
import { formatCurrency, formatNumber } from '@/utils/format';
import { sanitizeHtml, stripHtml } from '@/utils/html';
import type { Pricing } from '../lib/productLogic';

export interface ProductInfoProps {
  brand: string;
  name: string;
  descriptionHtml: string;
  pricing: Pricing;
  currency: string;
  sold?: number | undefined;
  rating?: { average: number; total: number } | undefined;
  ratingLoading?: boolean;
  onRatingClick?: () => void;
  children?: ReactNode;
}

const PREVIEW_CHARS = 240;

function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 0)).replace(/[\s,.;:]+$/, '');
}

function ExpandableDescription({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const safeHtml = useMemo(() => sanitizeHtml(html), [html]);
  const plainText = useMemo(
    () =>
      stripHtml(safeHtml.replace(/(<br\s*\/?>|<\/(?:p|li|h3|h4)>)/gi, ' $1'))
        .replace(/\s+/g, ' ')
        .trim(),
    [safeHtml],
  );
  const isLong = plainText.length > PREVIEW_CHARS;

  if (!plainText) return null;

  const toggle = (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={contentId}
      onClick={() => setExpanded((v) => !v)}
      className="font-medium text-black hover:underline"
    >
      {expanded ? 'See Less' : 'See More....'}
    </button>
  );

  return (
    <div className="mt-6 lg:mt-7">
      <h2 className="mb-2.5 font-raleway text-lg font-bold leading-[1.2] text-[#292929] lg:text-xl">Description:</h2>
      <div id={contentId} className="text-sm font-normal leading-[1.3] text-[#666] lg:text-base">
        {isLong && !expanded ? (
          <p>
            {truncateAtWord(plainText, PREVIEW_CHARS)}. {toggle}
          </p>
        ) : (
          <>
            <div className="rich-text" dangerouslySetInnerHTML={{ __html: safeHtml }} />
            {isLong && <p className="mt-1">{toggle}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export function ProductInfo({
  brand,
  name,
  descriptionHtml,
  pricing,
  currency,
  sold,
  rating,
  ratingLoading,
  onRatingClick,
  children,
}: ProductInfoProps) {
  return (
    <div className="flex flex-col">
      <div>
        <p className="text-[13px] font-medium leading-[1.2] tracking-[0.01em] text-[#8f8f8f] lg:text-base">{brand}</p>
        <h1 className="mt-2 text-[23px] font-semibold leading-[1.2] tracking-[-0.005em] text-[#292929] lg:mt-3 lg:text-[36px]">
          {name}
        </h1>

        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 lg:mt-5">
          <p className="flex items-center gap-4" aria-live="polite">
            {pricing.compareAt !== null && (
              <span className="text-sm font-medium leading-[1.2] text-[#666] line-through lg:text-lg">
                <span className="sr-only">Was </span>
                {formatCurrency(pricing.compareAt, currency)}
              </span>
            )}
            <span className="text-xl font-semibold leading-[1.2] text-ink lg:text-[28px]">
              {pricing.compareAt !== null && <span className="sr-only">Now </span>}
              {formatCurrency(pricing.price, currency)}
            </span>
          </p>

          <div className="flex items-center gap-2 text-base leading-none text-[#666] lg:text-xl">
            {sold !== undefined && (
              <>
                <span>{formatNumber(sold)} Sold</span>
                <span aria-hidden className="size-1.5 rounded-full bg-[#e0e0e0]" />
              </>
            )}
            {ratingLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : rating && rating.total > 0 ? (
              <button
                type="button"
                onClick={onRatingClick}
                className="flex items-center gap-1 rounded-sm"
                aria-label={`Rated ${rating.average.toFixed(1)} out of 5 from ${rating.total} reviews. Go to reviews`}
              >
                <Star aria-hidden strokeWidth={0} className="size-5 fill-star lg:size-6" />
                <span aria-hidden className="text-xl font-semibold text-ink lg:text-2xl">{rating.average.toFixed(1)}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div role="separator" className="dash-b mt-7 h-px" />

      <ExpandableDescription html={descriptionHtml} />

      {children}
    </div>
  );
}
