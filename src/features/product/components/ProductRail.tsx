import { memo } from 'react';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/atoms';
import { SectionHeader } from '@/components/molecules';
import { formatCurrency, formatNumber } from '@/utils/format';
import type { ProductSummary } from '../types/product.types';

export const ProductCard = memo(function ProductCard({ product, currency }: { product: ProductSummary; currency: string }) {
  return (
    <article className="group relative">
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface">
        <img
          src={product.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 lg:mt-4">
        <p className="text-sm font-semibold leading-[1.4] tracking-[-0.2px] text-[#292929] lg:text-lg">{product.brand}</p>
        <p className="mt-1.5 text-base font-semibold leading-[1.4] tracking-[-0.2px] text-ink tabular-nums lg:text-xl">
          {formatCurrency(product.price, currency)}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-[13px] font-normal leading-[1.2] text-[#7a7a7a] lg:text-base">
          <a href={`#${product.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </a>
        </h3>
      </div>
      <p className="mt-2 flex items-center gap-2 text-xs leading-[1.6] text-[#666] lg:text-base">
        <Star aria-hidden strokeWidth={0} className="size-4 fill-star lg:size-6" />
        <span className="text-[#0b0f0e]">{product.rating.toFixed(1)}</span>
        <span aria-hidden className="size-1 rounded-full bg-[#e0e0e0]" />
        {formatNumber(product.sold)} Sold
      </p>
    </article>
  );
});

export interface ProductRailProps {
  id: string;
  title: string;
  products: ProductSummary[] | undefined;
  loading?: boolean;
  currency: string;
}

export function ProductRail({ id, title, products, loading, currency }: ProductRailProps) {
  if (!loading && (!products || products.length === 0)) return null;

  return (
    <section aria-labelledby={id}>
      <SectionHeader
        id={id}
        title={title}
        action={
          <a href="#" className="text-base font-medium leading-[1.2] text-[#525252] underline underline-offset-4 hover:text-ink">
            View All
          </a>
        }
      />
      <ul className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-[35px]">
        {loading
          ? Array.from({ length: 5 }, (_, i) => (
              <li key={i} aria-hidden className="space-y-2">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </li>
            ))
          : products?.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} currency={currency} />
              </li>
            ))}
      </ul>
    </section>
  );
}
