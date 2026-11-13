import { memo } from 'react';
import { Star } from 'lucide-react';
import { RatingStars } from '@/components/atoms';
import { formatCompactNumber, formatNumber } from '@/utils/format';
import type { RatingSummary } from '../types/product.types';

const RING_RADIUS = 38;

export const RatingSummaryCard = memo(function RatingSummaryCard({ summary }: { summary: RatingSummary }) {
  const { average, total, distribution } = summary;
  const circumference = 2 * Math.PI * RING_RADIUS;
  const progress = (average / 5) * circumference;
  return (
    <div className="flex flex-col gap-6 rounded-lg dash-box px-[17px] py-4 md:flex-row md:items-start md:gap-[120px] md:p-6">
      <div className="flex shrink-0 items-center gap-4">
        <div className="relative size-16 shrink-0 md:size-[84px]">
          <svg viewBox="0 0 84 84" className="size-full -rotate-90" aria-hidden>
            <circle cx="42" cy="42" r={RING_RADIUS} fill="none" strokeWidth="6" className="stroke-[#e4e9ee]" />
            <circle
              cx="42"
              cy="42"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              className="stroke-star transition-[stroke-dasharray] duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-[#0b0f0e] md:text-xl">
            {average.toFixed(1)}
          </span>
        </div>
        <div>
          <RatingStars value={average} size="md" />
          <p className="mt-1 text-xs font-medium leading-[1.6] text-[#0b0f0e] md:mt-2 md:text-base md:font-normal md:text-[#525252]">
            from {formatCompactNumber(total)} reviews
          </p>
        </div>
      </div>

      <ul className="flex-1 space-y-3" aria-label="Rating distribution">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star - 1] ?? 0;
          const percent = total ? (count / total) * 100 : 0;
          return (
            <li key={star} className="flex items-center gap-6 text-xs font-medium leading-[1.6] text-[#0b0f0e] md:text-base">
              <span className="flex w-[38px] shrink-0 items-center gap-1 tabular-nums md:w-[49px]">
                {star}.0
                <Star aria-hidden strokeWidth={0} className="size-4 fill-star md:size-5" />
              </span>
              <span
                role="meter"
                aria-label={`${star} star reviews`}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={count}
                className="h-1.5 flex-1 overflow-hidden rounded-lg bg-[#e4e9ee] md:h-2"
              >
                <span className="block h-full rounded-lg bg-[#292929] transition-[width] duration-500" style={{ width: `${percent}%` }} />
              </span>
              <span className="w-10 shrink-0 text-right tabular-nums">{formatNumber(count)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
});
