import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/atoms';
import { useCartStore, type AddCartItemInput } from '../store/cartStore';

export interface AddToCartButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  item: AddCartItemInput | null;
  quantity: number;
  /** Open the drawer after adding (default `true`). */
  openOnAdd?: boolean;
  label?: string;
  onAdded?: () => void;
}

export function AddToCartButton({
  item,
  quantity,
  openOnAdd = true,
  label = 'Add To Cart',
  onAdded,
  disabled,
  ...buttonProps
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleClick = () => {
    if (!item) return;
    addItem(item, quantity);
    onAdded?.();
    if (openOnAdd) openCart();
    setJustAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <Button
      size="lg"
      disabled={disabled || !item || quantity < 1}
      onClick={handleClick}
      leftIcon={justAdded ? <Check aria-hidden className="size-4" /> : undefined}
      {...buttonProps}
    >
      {justAdded ? 'Added' : label}
    </Button>
  );
}
