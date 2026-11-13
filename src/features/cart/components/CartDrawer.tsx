import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingBasket, X } from 'lucide-react';
import { Button, IconButton } from '@/components/atoms';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { formatCurrency } from '@/utils/format';
import {
  selectCurrency,
  selectIsOpen,
  selectItemCount,
  selectItems,
  selectSavings,
  selectSubtotal,
  useCartStore,
} from '../store/cartStore';
import { CartItemCard } from './CartItemCard';

export interface CartDrawerProps {
  checkoutHref?: string;
}

export function CartDrawer({ checkoutHref = '/checkout' }: CartDrawerProps) {
  const isOpen = useCartStore(selectIsOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useLockBodyScroll(isOpen);
  useFocusTrap(panelRef, isOpen, closeCart);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div aria-hidden className="absolute inset-0 animate-fade-in bg-black/40" onClick={closeCart} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-md animate-drawer-in flex-col bg-white shadow-2xl focus:outline-none"
      >
        <CartDrawerContent titleId={titleId} onClose={closeCart} checkoutHref={checkoutHref} />
      </div>
    </div>,
    document.body,
  );
}

function CartDrawerContent({
  titleId,
  onClose,
  checkoutHref,
}: {
  titleId: string;
  onClose: () => void;
  checkoutHref: string;
}) {
  const items = useCartStore(selectItems);
  const count = useCartStore(selectItemCount);
  const subtotal = useCartStore(selectSubtotal);
  const savings = useCartStore(selectSavings);
  const currency = useCartStore(selectCurrency);
  const clearCart = useCartStore((s) => s.clearCart);

  return (
    <>
      <header className="flex items-center justify-between dash-b px-5 py-4">
        <h2 id={titleId} className="text-base font-bold">
          Your Cart {count > 0 && <span className="font-normal text-ink-muted">({count})</span>}
        </h2>
        <IconButton label="Close cart" icon={<X aria-hidden className="size-5" />} onClick={onClose} />
      </header>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-surface">
            <ShoppingBasket aria-hidden strokeWidth={1.5} className="size-7 text-ink-muted" />
          </span>
          <p className="font-semibold">Your cart is empty</p>
          <p className="text-sm text-ink-muted">Items you add will appear here.</p>
          <Button variant="outline" className="mt-2" onClick={onClose}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          <ul aria-label="Cart items" className="flex-1 overflow-y-auto [&>li:not(:last-child)]:dash-b px-5">
            {items.map((item) => (
              <CartItemCard key={item.lineId} item={item} />
            ))}
          </ul>

          <footer className="space-y-3 dash-t px-5 py-4">
            <dl className="space-y-1.5 text-sm">
              {savings > 0 && (
                <div className="flex justify-between text-success">
                  <dt>You save</dt>
                  <dd className="tabular-nums">-{formatCurrency(savings, currency)}</dd>
                </div>
              )}
              <div className="flex justify-between text-base font-bold">
                <dt>Subtotal</dt>
                <dd className="tabular-nums" aria-live="polite">
                  {formatCurrency(subtotal, currency)}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-ink-muted">Shipping and taxes calculated at checkout.</p>
            <a
              href={checkoutHref}
              className="flex h-12 w-full items-center justify-center rounded-md bg-ink text-sm font-semibold text-white transition-colors hover:bg-black/85"
            >
              Checkout Now
            </a>
            <div className="flex justify-between">
              <Button variant="link" size="sm" onClick={onClose}>
                Continue Shopping
              </Button>
              <Button variant="link" size="sm" onClick={clearCart} className="text-ink-muted">
                Clear cart
              </Button>
            </div>
          </footer>
        </>
      )}
    </>
  );
}
