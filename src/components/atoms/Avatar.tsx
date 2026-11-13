import { memo, useState } from 'react';
import { cn } from '@/utils/cn';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const PALETTE = ['bg-amber-200', 'bg-sky-200', 'bg-emerald-200', 'bg-rose-200', 'bg-violet-200', 'bg-stone-300'];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '?';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

function paletteFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length] ?? 'bg-stone-300';
}

export const Avatar = memo(function Avatar({ name, src, size = 'sm', className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const dimension = size === 'sm' ? 'size-6 text-[10px]' : 'size-9 text-xs';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-ink',
        dimension,
        paletteFor(name),
        className,
      )}
    >
      {src && !failed ? (
        <img src={src} alt="" decoding="async" className="size-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  );
});
