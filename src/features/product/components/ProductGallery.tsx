import { memo, useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, Heart, Share } from 'lucide-react';
import { IconButton } from '@/components/atoms';
import { selectIsWishlisted, useWishlistStore } from '@/features/wishlist/store/wishlistStore';
import { cn } from '@/utils/cn';

export interface ProductGalleryProps {
  productId: string;
  productName: string;
  images: string[];
  /** When set (e.g. a colour was picked) the gallery jumps to this image. */
  focusImage?: string | null;
}

const SIDE_BUTTON = 'size-11 rounded-md lg:size-[52px] lg:rounded-lg';

export const ProductGallery = memo(function ProductGallery({
  productId,
  productName,
  images,
  focusImage,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const thumbsRef = useRef<HTMLUListElement>(null);
  const isWishlisted = useWishlistStore(selectIsWishlisted(productId));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const count = images.length;
  const safeIndex = Math.min(activeIndex, Math.max(0, count - 1));
  const activeImage = images[safeIndex];

  useEffect(() => {
    if (!focusImage) return;
    const index = images.indexOf(focusImage);
    if (index !== -1) setActiveIndex(index);
  }, [focusImage, images]);

  useEffect(() => {
    const thumb = thumbsRef.current?.children[safeIndex] as HTMLElement | undefined;
    thumb?.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [safeIndex]);

  const go = useCallback(
    (delta: number) => setActiveIndex((i) => (count ? (i + delta + count) % count : 0)),
    [count],
  );

  const handleZoomMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: productName, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareStatus('copied');
      window.setTimeout(() => setShareStatus('idle'), 2000);
    } catch {
      // User dismissed the share sheet or clipboard is unavailable; nothing to do.
    }
  };

  return (
    <section aria-label="Product images" className="w-full">
      <div className="flex gap-3 lg:gap-[35px]">
        <div
          className="relative aspect-[3/4] flex-1 cursor-zoom-in overflow-hidden rounded-lg bg-surface"
          onMouseMove={handleZoomMove}
          onMouseLeave={() => setZoom(null)}
        >
          {activeImage ? (
            <img
              key={activeImage}
              src={activeImage}
              alt={`${productName} — image ${safeIndex + 1} of ${count}`}
              fetchPriority="high"
              decoding="async"
              className="size-full animate-fade-in object-cover mix-blend-multiply transition-transform duration-200 ease-out will-change-transform"
              style={zoom ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-ink-subtle">No image available</div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div className="flex flex-col gap-5">
            <IconButton
              variant="filled"
              className={SIDE_BUTTON}
              label={shareStatus === 'copied' ? 'Link copied' : 'Share product'}
              icon={<Share aria-hidden strokeWidth={1.5} className="size-5" />}
              onClick={handleShare}
            />
            <IconButton
              variant="filled"
              className={SIDE_BUTTON}
              label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={isWishlisted}
              icon={<Heart aria-hidden strokeWidth={1.5} className={cn('size-5', isWishlisted && 'fill-ink')} />}
              onClick={() => toggleWishlist(productId)}
            />
            <span role="status" className="sr-only">
              {shareStatus === 'copied' ? 'Link copied to clipboard' : ''}
            </span>
          </div>
          {count > 1 && (
            <div className="flex flex-col gap-4 lg:gap-5">
              <IconButton
                variant="filled"
                className={SIDE_BUTTON}
                label="Previous image"
                icon={<ChevronLeft aria-hidden strokeWidth={1.5} className="size-5" />}
                onClick={() => go(-1)}
              />
              <IconButton
                variant="filled"
                className={SIDE_BUTTON}
                label="Next image"
                icon={<ChevronRight aria-hidden strokeWidth={1.5} className="size-5" />}
                onClick={() => go(1)}
              />
            </div>
          )}
        </div>
      </div>

      {count > 1 && (
        <ul
          ref={thumbsRef}
          aria-label="Image thumbnails"
          className="mt-5 flex snap-x gap-[15px] overflow-x-auto [scrollbar-width:none] lg:mt-6 lg:mr-[87px] lg:gap-5"
        >
          {images.map((src, index) => {
            const selected = index === safeIndex;
            return (
              <li key={src} className="aspect-[76/100] w-[calc((100%-60px)/5)] shrink-0 snap-start lg:w-[calc((100%-80px)/5)]">
                <button
                  type="button"
                  aria-label={`Show image ${index + 1} of ${count}`}
                  aria-current={selected || undefined}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'size-full overflow-hidden rounded-md border bg-surface transition-colors lg:rounded-lg',
                    selected ? 'border-ink' : 'border-transparent hover:border-[#d1d1d1]',
                  )}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" className="size-full object-cover mix-blend-multiply" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
});
