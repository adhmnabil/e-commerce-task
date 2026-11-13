import { beforeEach, describe, expect, it } from 'vitest';
import {
  CART_STORAGE_KEY,
  MAX_LINE_QUANTITY,
  buildLineId,
  selectItemCount,
  selectSavings,
  selectSubtotal,
  useCartStore,
  type AddCartItemInput,
} from './cartStore';

const shoe = (overrides: Partial<AddCartItemInput> = {}): AddCartItemInput => ({
  productId: 'p1',
  variantId: 'v-brown-40',
  slug: 'Sneakers12',
  name: 'Achilles Pro',
  image: 'https://cdn/x.webp',
  currency: 'EGP',
  options: { color: 'brown', size: '40' },
  unitPrice: 160,
  compareAtPrice: 190,
  ...overrides,
});

const state = () => useCartStore.getState();

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
  localStorage.clear();
});

describe('buildLineId', () => {
  it('is independent of option key order', () => {
    expect(buildLineId('p1', { size: '40', color: 'brown' })).toBe(buildLineId('p1', { color: 'brown', size: '40' }));
  });

  it('falls back to the product id when there are no options', () => {
    expect(buildLineId('p1', {})).toBe('p1');
  });
});

describe('addItem', () => {
  it('adds a new line with the requested quantity', () => {
    state().addItem(shoe(), 2);
    expect(state().items).toHaveLength(1);
    expect(state().items[0]).toMatchObject({ productId: 'p1', quantity: 2, lineId: 'p1::color=brown|size=40' });
  });

  it('merges quantities for the same product + options', () => {
    state().addItem(shoe(), 1);
    state().addItem(shoe(), 3);
    expect(state().items).toHaveLength(1);
    expect(state().items[0]!.quantity).toBe(4);
  });

  it('keeps different variants on separate lines', () => {
    state().addItem(shoe());
    state().addItem(shoe({ variantId: 'v-brown-42', options: { color: 'brown', size: '42' } }));
    expect(state().items).toHaveLength(2);
  });

  it('clamps to the global per-line maximum', () => {
    state().addItem(shoe(), MAX_LINE_QUANTITY + 5);
    expect(state().items[0]!.quantity).toBe(MAX_LINE_QUANTITY);
  });

  it('respects a lower stock-based maximum when merging', () => {
    state().addItem(shoe({ maxQuantity: 3 }), 2);
    state().addItem(shoe({ maxQuantity: 3 }), 2);
    expect(state().items[0]!.quantity).toBe(3);
  });

  it('refreshes prices on an existing line', () => {
    state().addItem(shoe());
    state().addItem(shoe({ unitPrice: 150 }));
    expect(state().items[0]!.unitPrice).toBe(150);
  });

  it('ignores non-positive quantities', () => {
    state().addItem(shoe(), 0);
    state().addItem(shoe(), -2);
    expect(state().items).toHaveLength(0);
  });
});

describe('updateQuantity', () => {
  it('sets an exact quantity', () => {
    state().addItem(shoe());
    const { lineId } = state().items[0]!;
    state().updateQuantity(lineId, 5);
    expect(state().items[0]!.quantity).toBe(5);
  });

  it('clamps above the line maximum', () => {
    state().addItem(shoe({ maxQuantity: 4 }));
    state().updateQuantity(state().items[0]!.lineId, 50);
    expect(state().items[0]!.quantity).toBe(4);
  });

  it('removes the line when quantity drops to zero', () => {
    state().addItem(shoe());
    state().updateQuantity(state().items[0]!.lineId, 0);
    expect(state().items).toHaveLength(0);
  });

  it('is a no-op for unknown lines', () => {
    state().addItem(shoe());
    const before = state().items;
    state().updateQuantity('missing', 3);
    expect(state().items).toBe(before);
  });
});

describe('removeItem / clearCart', () => {
  it('removes only the targeted line', () => {
    state().addItem(shoe());
    state().addItem(shoe({ options: { color: 'black', size: '40' } }));
    state().removeItem(state().items[0]!.lineId);
    expect(state().items).toHaveLength(1);
    expect(state().items[0]!.options.color).toBe('black');
  });

  it('clears all lines', () => {
    state().addItem(shoe());
    state().addItem(shoe({ options: { color: 'black', size: '40' } }));
    state().clearCart();
    expect(state().items).toEqual([]);
  });
});

describe('drawer visibility', () => {
  it('opens and closes', () => {
    state().openCart();
    expect(state().isOpen).toBe(true);
    state().closeCart();
    expect(state().isOpen).toBe(false);
  });
});

describe('selectors', () => {
  it('derive count, subtotal and savings', () => {
    state().addItem(shoe(), 2);
    state().addItem(shoe({ options: { color: 'black', size: '40' }, unitPrice: 100, compareAtPrice: 100 }), 1);
    expect(selectItemCount(state())).toBe(3);
    expect(selectSubtotal(state())).toBe(160 * 2 + 100);
    expect(selectSavings(state())).toBe(30 * 2);
  });
});

describe('persistence', () => {
  it('writes cart lines to localStorage but never the drawer state', () => {
    state().addItem(shoe(), 2);
    state().openCart();
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '{}');
    expect(stored.version).toBe(1);
    expect(stored.state.items).toHaveLength(1);
    expect(stored.state.items[0].quantity).toBe(2);
    expect(stored.state).not.toHaveProperty('isOpen');
  });

  it('rehydrates cart lines from storage', async () => {
    state().addItem(shoe(), 3);
    const snapshot = localStorage.getItem(CART_STORAGE_KEY)!;

    useCartStore.setState({ items: [], isOpen: false });
    localStorage.setItem(CART_STORAGE_KEY, snapshot);
    await useCartStore.persist.rehydrate();

    expect(state().items).toHaveLength(1);
    expect(state().items[0]!.quantity).toBe(3);
    expect(state().isOpen).toBe(false);
  });
});
