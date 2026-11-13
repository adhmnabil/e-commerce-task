import { useCallback, useMemo, type ReactNode } from 'react';
import { AnnouncementBar, Footer, Header, type NavLink, type SearchSuggestion } from '@/components/organisms';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { selectItemCount, useCartStore } from '@/features/cart/store/cartStore';
import { CATALOG } from '@/features/product/api/catalogFixture';
import { useProduct } from '@/features/product/api/productApi';
import { selectWishlistCount, useWishlistStore } from '@/features/wishlist/store/wishlistStore';

function searchCatalog(query: string): SearchSuggestion[] {
  const needle = query.toLowerCase();
  return CATALOG.filter((p) => p.name.toLowerCase().includes(needle)).map((p) => ({
    id: p.id,
    label: p.name,
    href: `#${p.slug}`,
  }));
}

export function AppLayout({ slug, children }: { slug: string; children: ReactNode }) {
  const cartCount = useCartStore(selectItemCount);
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore(selectWishlistCount);
  // Shares the page's cached query; no extra request.
  const { data: product } = useProduct(slug);

  const categories = useMemo<NavLink[]>(() => {
    const seen = new Set<string>();
    return (product?.categories ?? [])
      .filter((c) => c.show_in_header && !seen.has(c.slug) && seen.add(c.slug))
      .map((c) => ({ id: c.id, label: c.name, href: `/collections/${c.slug}` }));
  }, [product?.categories]);

  const handleCartClick = useCallback(() => openCart(), [openCart]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <AnnouncementBar message="New season coming!  Discount 10% for all product!  Checkout Now!" />
      <Header
        categories={categories}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onCartClick={handleCartClick}
        getSuggestions={searchCatalog}
      />
      <main id="main" className="mx-auto w-full max-w-(--container-page) flex-1 px-5 sm:px-6">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
