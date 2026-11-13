import { memo, useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface QuantitySelectorProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

export const QuantitySelector = memo(function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  label = 'Quantity',
  className,
}: QuantitySelectorProps) {
  const clamp = useCallback((n: number) => Math.min(max, Math.max(min, n)), [min, max]);
  const canDecrement = value > min;
  const canIncrement = value < max;
  const cell = size === 'sm' ? 'size-8' : 'size-10';

  return (
    <div
      role="group"
      aria-label={label}
      className={cn('inline-flex items-center rounded-md border border-line bg-white', className)}
    >
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        disabled={!canDecrement}
        onClick={() => onChange(clamp(value - 1))}
        className={cn(cell, 'inline-flex items-center justify-center text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:text-ink-subtle disabled:hover:bg-transparent')}
      >
        <Minus aria-hidden className="size-3.5" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          if (!Number.isNaN(parsed)) onChange(clamp(parsed));
        }}
        className={cn(
          'w-10 appearance-none bg-transparent text-center text-sm font-semibold tabular-nums focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]',
          size === 'sm' && 'w-8',
        )}
      />
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        disabled={!canIncrement}
        onClick={() => onChange(clamp(value + 1))}
        className={cn(cell, 'inline-flex items-center justify-center text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:text-ink-subtle disabled:hover:bg-transparent')}
      >
        <Plus aria-hidden className="size-3.5" />
      </button>
    </div>
  );
});
