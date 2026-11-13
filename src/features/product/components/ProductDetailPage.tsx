import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Skeleton } from '@/components/atoms';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/molecules';
import { AddToCartButton } from '@/features/cart/components/AddToCartButton';
import type { AddCartItemInput } from '@/features/cart/store/cartStore';
import { DEFAULT_CURRENCY } from '@/utils/format';
import { ApiError, useProduct, useProductReviews, useRelatedProducts } from '../api/productApi';
import { CATALOG } from '../api/catalogFixture';
import { useVariantSelection } from '../hooks/useVariantSelection';
import { getGalleryImages, summarizeRatings } from '../lib/productLogic';
import type { Product } from '../types/product.types';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductRail } from './ProductRail';
import { ProductReviews, REVIEWS_SECTION_ID } from './ProductReviews';
import { SizeChartDialog } from './SizeChartDialog';
import { VariantSelector } from './VariantSelector';

const Divider = () => <div role="separator" className="dash-b my-14 h-px lg:my-20" />;

function buildBreadcrumbs(product: Product): BreadcrumbItem[] {
  const category = product.categories?.[0];
  return [
    { label: 'Homepage', href: '/' },
    ...(category ? [{ label: category.name, href: `/collections/${category.slug}` }] : []),
    { label: product.name },
  ];
}

function ProductDetailView({ product }: { product: Product }) {
  const { selection, select, isAvailable, variant, pricing, maxQuantity, selectionImage, isComplete } =
    useVariantSelection(product);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const { data: reviews, isPending: reviewsPending } = useProductReviews(product.id);
  const related = useRelatedProducts(product.slug);

  const currency = product.custom_currency || DEFAULT_CURRENCY;
  const inStock = maxQuantity > 0;
  const images = useMemo(() => getGalleryImages(product), [product]);
  const breadcrumbs = useMemo(() => buildBreadcrumbs(product), [product]);
  const rating = useMemo(() => (reviews ? summarizeRatings(reviews) : undefined), [reviews]);
  const soldCount = useMemo(() => CATALOG.find((item) => item.slug === product.slug)?.sold, [product.slug]);
  const popular = useMemo(() => (related.data ? [...related.data].reverse() : undefined), [related.data]);

  const cartItem = useMemo<AddCartItemInput | null>(() => {
    if (!isComplete || !inStock) return null;
    return {
      productId: product.id,
      variantId: variant?.id ?? null,
      slug: product.slug,
      name: product.name,
      image: selectionImage ?? images[0] ?? '',
      currency,
      options: selection,
      unitPrice: pricing.price,
      compareAtPrice: pricing.compareAt ?? pricing.price,
      maxQuantity,
    };
  }, [isComplete, inStock, product, variant, selectionImage, images, currency, selection, pricing, maxQuantity]);

  const scrollToReviews = useCallback(() => {
    document.getElementById(REVIEWS_SECTION_ID)?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  const openSizeChart = useCallback(() => setSizeChartOpen(true), []);

  const unavailableReason = !isComplete
    ? 'This combination is unavailable. Please choose another option.'
    : !inStock
      ? 'This item is currently out of stock.'
      : null;

  return (
    <>
      <Breadcrumbs items={breadcrumbs} className="pb-7 pt-6 lg:py-[31px]" />

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[545fr_520fr] lg:gap-12 xl:gap-[135px]">
        <ProductGallery productId={product.id} productName={product.name} images={images} focusImage={selectionImage} />

        <ProductInfo
          brand={product.categories?.[0]?.name ?? 'John Lewis'}
          name={product.name}
          descriptionHtml={product.description}
          pricing={pricing}
          currency={currency}
          sold={soldCount}
          rating={rating}
          ratingLoading={reviewsPending}
          onRatingClick={scrollToReviews}
        >
          <VariantSelector
            variations={product.variations ?? []}
            selection={selection}
            onSelect={select}
            isAvailable={isAvailable}
            onSizeChartClick={openSizeChart}
          />

          <div className="mt-12 flex flex-col items-start gap-[18px] sm:flex-row sm:gap-6 lg:mt-14">
            <AddToCartButton
              item={cartItem}
              quantity={1}
              className="h-14 w-[296px] max-w-full rounded-md text-lg font-semibold sm:h-[58px] sm:rounded-lg sm:text-xl"
            />
            <AddToCartButton
              item={cartItem}
              quantity={1}
              variant="outline"
              label="Checkout Now"
              className="h-14 w-[187px] max-w-full rounded-md border-[#b8b8b8] text-lg font-medium text-[#333] sm:h-[58px] sm:w-[200px] sm:rounded-lg sm:text-xl"
            />
          </div>
          {unavailableReason && (
            <p role="status" className="mt-3 text-xs text-danger">
              {unavailableReason}
            </p>
          )}

          <a
            href="#delivery"
            className="mt-[38px] hidden self-start text-base font-medium leading-[1.2] text-[#7a7a7a] underline underline-offset-4 hover:text-ink sm:inline"
          >
            Delivery T&amp;C
          </a>
        </ProductInfo>
      </div>

      <Divider />
      <ProductRail id="related-title" title="Related Product" products={related.data} loading={related.isPending} currency={currency} />
      <Divider />
      <ProductReviews productId={product.id} />
      <Divider />
      <ProductRail id="popular-title" title="Popular this week" products={popular} loading={related.isPending} currency={currency} />

      <SizeChartDialog open={sizeChartOpen} onClose={() => setSizeChartOpen(false)} highlight={selection.size} />
    </>
  );
}

function ProductDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product">
      <Skeleton className="my-6 h-4 w-64 lg:my-[31px]" />
      <div className="grid gap-14 lg:grid-cols-[545fr_520fr] lg:gap-12 xl:gap-[135px]">
        <div>
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="mt-5 grid grid-cols-5 gap-[15px] lg:mt-6 lg:gap-5">
            {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="aspect-[76/100]" />)}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-64" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailPage({ slug }: { slug: string }) {
  const { data: product, isPending, isError, error, refetch, isRefetching } = useProduct(slug);

  useEffect(() => {
    if (product) document.title = `${product.name} | John Lewis & Partners`;
  }, [product]);

  if (isPending) return <ProductDetailSkeleton />;

  if (isError) {
    const notFound = error instanceof ApiError && error.isNotFound;
    return (
      <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-xl font-bold">{notFound ? 'Product not found' : 'Something went wrong'}</h1>
        <p className="text-sm text-ink-muted">
          {notFound ? 'This product may have been removed or the link is incorrect.' : error.message}
        </p>
        {!notFound && (
          <Button variant="outline" loading={isRefetching} onClick={() => refetch()}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  return <ProductDetailView key={product.id} product={product} />;
}
