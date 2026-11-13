import { memo } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface RatingStarsProps {
  value: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'responsive';
  className?: string;
}

const sizeClasses = { xs: 'size-3', sm: 'size-4', md: 'size-5', responsive: 'size-[18px] lg:size-5' } as const;

/** Read-only star display supporting fractional values via a clipped overlay. */
export const RatingStars = memo(function RatingStars({ value, max = 5, size = 'sm', className }: RatingStarsProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const iconClass = sizeClasses[size];

  return (
    <span
      role="img"
      aria-label={`Rated ${clamped.toFixed(1)} out of ${max}`}
      className={cn('inline-flex items-center gap-1', className)}
    >
      {Array.from({ length: max }, (_, i) => {
        const fill = Math.max(0, Math.min(1, clamped - i));
        return (
          <span key={i} aria-hidden className={cn('relative inline-flex', iconClass)}>
            <Star className={cn('absolute inset-0 fill-line text-line', iconClass)} strokeWidth={0} />
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={cn('fill-star text-star', iconClass)} strokeWidth={0} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
});
