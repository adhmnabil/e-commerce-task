import { cn } from '@/utils/cn';

export function Logo({ className, href = '/' }: { className?: string; href?: string }) {
  return (
    <a href={href} className={cn('inline-flex shrink-0', className)}>
      <img src="/logo.png" alt="John Lewis & Partners" width={170} height={32} className="h-[26px] w-auto lg:h-8" />
    </a>
  );
}
