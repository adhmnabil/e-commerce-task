import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react';
import { ChevronDown, Heart, Menu, Search, ShoppingBasket, User, X } from 'lucide-react';
import { Badge, IconButton } from '@/components/atoms';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/utils/cn';
import { Logo } from './Logo';

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface SearchSuggestion {
  id: string;
  label: string;
  href: string;
}

export interface HeaderProps {
  categories: NavLink[];
  cartCount: number;
  wishlistCount: number;
  onCartClick: () => void;
  getSuggestions?: (query: string) => SearchSuggestion[];
}

/** 32px tap target that lays out like the design's bare 20px icon. */
const ICON_HIT_AREA = 'size-8 -m-1.5';
const COUNTER_POSITION = 'right-[3px] top-[2px] h-[13px] min-w-[13px] px-0.5 text-[8px] font-medium leading-[13px]';

function useOutsideClose(ref: RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, open, close]);
}

function SearchBox({ getSuggestions, className }: { getSuggestions?: HeaderProps['getSuggestions']; className?: string }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query.trim(), 250);
  const containerRef = useRef<HTMLFormElement>(null);
  const listId = useId();
  const suggestions = useMemo(
    () => (debounced.length >= 2 && getSuggestions ? getSuggestions(debounced).slice(0, 6) : []),
    [debounced, getSuggestions],
  );
  useOutsideClose(containerRef, open, () => setOpen(false));

  const showList = open && suggestions.length > 0;

  return (
    <form ref={containerRef} role="search" action="/search" className={cn('relative', className)}>
      <label className="relative block">
        <span className="sr-only">Search products</span>
        <Search aria-hidden strokeWidth={1.5} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          name="q"
          value={query}
          placeholder="Search products"
          autoComplete="off"
          autoFocus
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          className="h-9 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-ink-subtle focus:border-ink focus:bg-white focus:outline-none"
        />
      </label>
      <ul
        id={listId}
        role="listbox"
        hidden={!showList}
        className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-line bg-white py-1 shadow-lg"
      >
        {suggestions.map((s) => (
          <li key={s.id} role="option" aria-selected={false}>
            <a href={s.href} className="block truncate px-3 py-2 text-sm hover:bg-surface" onClick={() => setOpen(false)}>
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </form>
  );
}

export function Header({ categories, cartCount, wishlistCount, onCartClick, getSuggestions }: HeaderProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const mobileMenuId = useId();
  useOutsideClose(categoriesRef, categoriesOpen, () => setCategoriesOpen(false));

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="dash-b mx-auto flex h-[75px] max-w-(--container-page) items-center gap-5 bg-clip-content bg-origin-content px-5 sm:px-6 lg:h-[94px] lg:gap-8">
        <Logo className="mr-auto" />

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          <IconButton
            label={searchOpen ? 'Close search' : 'Open search'}
            aria-expanded={searchOpen}
            icon={<Search aria-hidden strokeWidth={1.5} className="size-5" />}
            onClick={() => setSearchOpen((v) => !v)}
            className={ICON_HIT_AREA}
          />
          <div ref={categoriesRef} className="relative">
            <button
              type="button"
              aria-expanded={categoriesOpen}
              aria-controls={menuId}
              onClick={() => setCategoriesOpen((v) => !v)}
              className="flex items-center gap-1 text-base font-medium leading-[1.6] hover:text-ink-muted"
            >
              Categories
              <ChevronDown aria-hidden strokeWidth={1.5} className={cn('size-5 transition-transform', categoriesOpen && 'rotate-180')} />
            </button>
            <ul
              id={menuId}
              hidden={!categoriesOpen}
              className="absolute right-0 top-full z-30 mt-3 w-52 rounded-md border border-line bg-white py-1 shadow-lg"
            >
              {categories.map((c) => (
                <li key={c.id}>
                  <a href={c.href} className="block px-4 py-2 text-sm hover:bg-surface">
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <a href="#signin" className="flex items-center gap-1 text-base font-medium leading-[1.6] hover:text-ink-muted">
            <User aria-hidden strokeWidth={1.5} className="size-5" />
            Sign in
          </a>
        </nav>

        <div className="flex items-center gap-5 lg:gap-8">
          <IconButton
            className={cn(ICON_HIT_AREA, 'lg:hidden')}
            label={searchOpen ? 'Close search' : 'Open search'}
            aria-expanded={searchOpen}
            icon={<Search aria-hidden strokeWidth={1.5} className="size-5" />}
            onClick={() => setSearchOpen((v) => !v)}
          />
          <a
            href="#wishlist"
            aria-label={`Wishlist, ${wishlistCount} items`}
            className={cn(ICON_HIT_AREA, 'relative hidden items-center justify-center rounded-md hover:bg-surface lg:inline-flex')}
          >
            <Heart aria-hidden strokeWidth={1.5} className="size-5" />
            {wishlistCount > 0 && <Badge variant="counter" className={COUNTER_POSITION}>{wishlistCount}</Badge>}
          </a>
          <IconButton
            className={ICON_HIT_AREA}
            label={`Open cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            icon={
              <>
                <ShoppingBasket aria-hidden strokeWidth={1.5} className="size-5" />
                {cartCount > 0 && (
                  <Badge variant="counter" className={COUNTER_POSITION} aria-hidden>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                )}
              </>
            }
            onClick={onCartClick}
          />
          <IconButton
            className={cn(ICON_HIT_AREA, 'lg:hidden')}
            label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            icon={mobileOpen ? <X aria-hidden strokeWidth={1.5} className="size-5" /> : <Menu aria-hidden strokeWidth={1.5} className="size-5" />}
            onClick={() => setMobileOpen((v) => !v)}
          />
        </div>
      </div>

      {searchOpen && (
        <div className="dash-b mx-auto max-w-(--container-page) bg-clip-content bg-origin-content px-5 sm:px-6">
          <div className="py-3 lg:flex lg:justify-end">
            <SearchBox getSuggestions={getSuggestions} className="lg:w-80" />
          </div>
        </div>
      )}

      <nav id={mobileMenuId} aria-label="Mobile" hidden={!mobileOpen} className="dash-b mx-5 py-3 sm:mx-6 lg:hidden">
        <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">Categories</p>
        <ul>
          {categories.map((c) => (
            <li key={c.id}>
              <a href={c.href} className="block rounded-md px-2 py-2 text-sm hover:bg-surface">
                {c.label}
              </a>
            </li>
          ))}
          <li className="mt-1 dash-t pt-1">
            <a href="#signin" className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium hover:bg-surface">
              <User aria-hidden strokeWidth={1.5} className="size-4" /> Sign in
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
