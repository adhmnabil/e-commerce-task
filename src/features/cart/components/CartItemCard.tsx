import { memo, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { IconButton } from '@/components/atoms';
import { QuantitySelector } from '@/components/molecules';
import { capitalize, formatCurrency } from '@/utils/format';
import { useCartStore, type CartItem } from '../store/cartStore';

export interface CartItemCardProps {
  item: CartItem;
}

export const CartItemCard = memo(function CartItemCard({ item }: CartItemCardProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const handleQuantity = useCallback((qty: number) => updateQuantity(item.lineId, qty), [updateQuantity, item.lineId]);
  const optionText = Object.entries(item.options)
    .map(([key, value]) => `${capitalize(key)}: ${capitalize(value)}`)
    .join(' · ');
  const onSale = item.compareAtPrice > item.unitPrice;

  return (
    <li className="flex gap-3 py-4" aria-label={item.name}>
      <img src={item.image} alt="" loading="lazy" className="size-20 shrink-0 rounded-md bg-surface object-cover mix-blend-multiply" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-semibold">{item.name}</p>
          <IconButton
            size="sm"
            label={`Remove ${item.name}`}
            icon={<Trash2 aria-hidden className="size-4" />}
            onClick={() => removeItem(item.lineId)}
            className="-mr-1.5 -mt-1 text-ink-muted hover:text-danger"
          />
        </div>
        {optionText && <p className="text-xs text-ink-muted">{optionText}</p>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <QuantitySelector
            size="sm"
            value={item.quantity}
            max={item.maxQuantity}
            onChange={handleQuantity}
            label={`Quantity for ${item.name}`}
          />
          <div className="text-right">
            {onSale && (
              <p className="text-xs text-ink-subtle line-through">
                {formatCurrency(item.compareAtPrice * item.quantity, item.currency)}
              </p>
            )}
            <p className="text-sm font-semibold tabular-nums">{formatCurrency(item.unitPrice * item.quantity, item.currency)}</p>
          </div>
        </div>
      </div>
    </li>
  );
});
