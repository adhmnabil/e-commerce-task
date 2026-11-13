import type { ElementType, HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

const headingClasses: Record<HeadingLevel, string> = {
  h1: 'text-[28px] font-semibold leading-[1.2] sm:text-[36px]',
  h2: 'text-2xl font-semibold leading-[1.2] lg:text-[28px]',
  h3: 'text-base font-semibold',
  h4: 'text-sm font-semibold',
};

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  /** Render with another level's visual style while keeping semantic `as`. */
  look?: HeadingLevel;
}

export function Heading({ as: Tag = 'h2', look, className, ...rest }: HeadingProps) {
  return <Tag className={cn('text-ink', headingClasses[look ?? Tag], className)} {...rest} />;
}

type TextTone = 'default' | 'muted' | 'subtle';
type TextSize = 'xs' | 'sm' | 'base';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  tone?: TextTone;
  size?: TextSize;
}

const toneClasses: Record<TextTone, string> = {
  default: 'text-ink',
  muted: 'text-ink-muted',
  subtle: 'text-ink-subtle',
};

const sizeClasses: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
};

export function Text({ as: Tag = 'p', tone = 'default', size = 'sm', className, ...rest }: TextProps) {
  return <Tag className={cn(toneClasses[tone], sizeClasses[size], className)} {...rest} />;
}
