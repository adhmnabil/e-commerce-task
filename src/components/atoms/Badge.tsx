import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'muted' | 'counter';
}

const variantClasses = {
  solid: 'bg-ink text-white px-2 py-0.5 rounded',
  muted: 'bg-surface text-ink-muted px-2 py-0.5 rounded',
  counter:
    'absolute -right-1 -top-1 min-w-4 h-4 px-1 rounded-full bg-ink text-white text-[10px] leading-4 tabular-nums',
} as const;

export function Badge({ variant = 'solid', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center justify-center text-xs font-semibold', variantClasses[variant], className)}
      {...rest}
    />
  );
}
