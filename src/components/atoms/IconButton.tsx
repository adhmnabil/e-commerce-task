import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Required: icon-only controls have no visible text. */
  label: string;
  icon: ReactNode;
  variant?: 'plain' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, variant = 'plain', size = 'md', className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40',
        size === 'sm' ? 'size-8' : size === 'lg' ? 'size-12 rounded-lg' : 'size-10',
        variant === 'outlined' && 'border border-line bg-white',
        variant === 'filled' && 'bg-surface hover:bg-[#e8e8e8] active:bg-[#e0e0e0]',
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
});
