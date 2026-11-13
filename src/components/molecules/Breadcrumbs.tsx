import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-[18px] gap-y-0.5 text-[13px] font-medium leading-[1.6] text-[#8f8f8f] lg:gap-x-2 lg:text-base">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className={cn(isLast && 'basis-full lg:basis-auto')}>
                {isLast || !item.href ? (
                  <span aria-current={isLast ? 'page' : undefined} className={cn(isLast && 'text-sm text-[#292929] lg:text-base')}>
                    {item.label}
                  </span>
                ) : (
                  <a href={item.href} className="transition-colors hover:text-ink">
                    {item.label}
                  </a>
                )}
              </li>
              {!isLast && (
                <li aria-hidden>
                  <ChevronRight strokeWidth={1.5} className="size-3" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
