import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface WishlistStore {
  productIds: string[];
  toggle: (productId: string) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    immer((set) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => {
          const index = state.productIds.indexOf(productId);
          if (index === -1) state.productIds.push(productId);
          else state.productIds.splice(index, 1);
        }),
    })),
    { name: 'jl-wishlist', version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);

export const selectWishlistCount = (state: WishlistStore) => state.productIds.length;
export const selectIsWishlisted = (productId: string) => (state: WishlistStore) =>
  state.productIds.includes(productId);
