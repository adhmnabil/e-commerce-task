import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export type PageToken = number | 'ellipsis-start' | 'ellipsis-end';

/**
 * Produces a compact page list such as `1 2 … 19` or `1 … 7 8 9 … 19`.
 * `siblings` controls how many pages are shown on each side of the current one.
 */
export function getPageTokens(current: number, total: number, siblings = 1): PageToken[] {
  if (total <= 0) return [];
  const windowSize = siblings * 2 + 5;
  if (total <= windowSize) return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(current - siblings, 2);
  const right = Math.min(current + siblings, total - 1);
  const tokens: PageToken[] = [1];

  if (left > 2) tokens.push('ellipsis-start');
  for (let page = left; page <= right; page += 1) tokens.push(page);
  if (right < total - 1) tokens.push('ellipsis-end');
  tokens.push(total);

  return tokens;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const cellBase =
  'inline-flex size-9 items-center justify-center rounded-md text-[11.5px] font-medium leading-[1.6] transition-colors lg:size-11 lg:rounded-lg lg:text-sm';
const arrowClass =
  'inline-flex size-9 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface lg:size-11 lg:rounded-lg';

export const Pagination = memo(function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const tokens = getPageTokens(page, totalPages, 1);

  return (
    <nav aria-label="Pagination" className={cn('flex justify-center', className)}>
      <ul className="flex items-center gap-[6.5px] lg:gap-2">
        {page > 1 && (
          <li>
            <button type="button" aria-label="Previous page" onClick={() => onPageChange(page - 1)} className={arrowClass}>
              <ChevronLeft aria-hidden strokeWidth={1.5} className="size-5 lg:size-6" />
            </button>
          </li>
        )}
        {tokens.map((token) =>
          typeof token === 'number' ? (
            <li key={token}>
              <button
                type="button"
                aria-label={`Page ${token}`}
                aria-current={token === page ? 'page' : undefined}
                onClick={() => onPageChange(token)}
                className={cn(
                  cellBase,
                  'border',
                  token === page
                    ? 'border-[#333] bg-white text-ink'
                    : 'border-[#e4e9ee] text-[#7a7a7a] hover:border-ink-subtle hover:text-ink',
                )}
              >
                {token}
              </button>
            </li>
          ) : (
            <li key={token} aria-hidden className={cn(cellBase, 'border border-[#e4e9ee] text-[#7a7a7a]')}>
              ...
            </li>
          ),
        )}
        {page < totalPages && (
          <li>
            <button type="button" aria-label="Next page" onClick={() => onPageChange(page + 1)} className={arrowClass}>
              <ChevronRight aria-hidden strokeWidth={1.5} className="size-5 lg:size-6" />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
});
