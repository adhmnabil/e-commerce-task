import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { VariantSelection } from '@/features/product/types/product.types';

export const MAX_LINE_QUANTITY = 10;
export const CART_STORAGE_KEY = 'jl-cart';

export interface CartItem {
  /** Stable line identifier: product + chosen options. */
  lineId: string;
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  image: string;
  currency: string;
  options: VariantSelection;
  /** Price actually charged per unit. */
  unitPrice: number;
  /** Pre-discount price per unit; equals `unitPrice` when not on sale. */
  compareAtPrice: number;
  quantity: number;
  maxQuantity: number;
}

export type AddCartItemInput = Omit<CartItem, 'lineId' | 'quantity' | 'maxQuantity'> & {
  maxQuantity?: number;
};

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

interface CartActions {
  addItem: (input: AddCartItemInput, quantity?: number) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export type CartStore = CartState & CartActions;

export function buildLineId(productId: string, options: VariantSelection): string {
  const optionKey = Object.keys(options)
    .sort()
    .map((key) => `${key}=${options[key]}`)
    .join('|');
  return optionKey ? `${productId}::${optionKey}` : productId;
}

function clampQuantity(quantity: number, max: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(Math.max(Math.trunc(quantity), 1), max);
}

const initialState: CartState = { items: [], isOpen: false };

export const useCartStore = create<CartStore>()(
  persist(
    immer((set) => ({
      ...initialState,

      addItem: (input, quantity = 1) =>
        set((state) => {
          if (quantity <= 0) return;
          const lineId = buildLineId(input.productId, input.options);
          const maxQuantity = Math.max(1, Math.min(input.maxQuantity ?? MAX_LINE_QUANTITY, MAX_LINE_QUANTITY));
          const existing = state.items.find((item) => item.lineId === lineId);

          if (existing) {
            existing.quantity = clampQuantity(existing.quantity + quantity, existing.maxQuantity);
            // Prices may have changed since the line was first added.
            existing.unitPrice = input.unitPrice;
            existing.compareAtPrice = input.compareAtPrice;
            return;
          }

          state.items.push({
            ...input,
            lineId,
            maxQuantity,
            quantity: clampQuantity(quantity, maxQuantity),
          });
        }),

      updateQuantity: (lineId, quantity) =>
        set((state) => {
          const index = state.items.findIndex((item) => item.lineId === lineId);
          if (index === -1) return;
          if (quantity <= 0) {
            state.items.splice(index, 1);
            return;
          }
          const item = state.items[index]!;
          item.quantity = clampQuantity(quantity, item.maxQuantity);
        }),

      removeItem: (lineId) =>
        set((state) => {
          state.items = state.items.filter((item) => item.lineId !== lineId);
        }),

      clearCart: () =>
        set((state) => {
          state.items = [];
        }),

      openCart: () =>
        set((state) => {
          state.isOpen = true;
        }),

      closeCart: () =>
        set((state) => {
          state.isOpen = false;
        }),
    })),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Drawer visibility is session UI state; never restore it on reload.
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/* ---------- Selectors (stable, primitive-returning to avoid re-renders) ---------- */

export const selectItems = (state: CartStore) => state.items;
export const selectIsOpen = (state: CartStore) => state.isOpen;
export const selectItemCount = (state: CartStore) =>
  state.items.reduce((total, item) => total + item.quantity, 0);
export const selectSubtotal = (state: CartStore) =>
  state.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
export const selectSavings = (state: CartStore) =>
  state.items.reduce((total, item) => total + Math.max(0, item.compareAtPrice - item.unitPrice) * item.quantity, 0);
export const selectCurrency = (state: CartStore) => state.items[0]?.currency;
