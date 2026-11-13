import type { ReactNode } from 'react';
import { Heading } from '@/components/atoms';
import { cn } from '@/utils/cn';

export interface SectionHeaderProps {
  id?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ id, title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-10 flex items-end justify-between gap-4 lg:mb-6', className)}>
      <Heading id={id} as="h2">
        {title}
      </Heading>
      {action}
    </div>
  );
}
