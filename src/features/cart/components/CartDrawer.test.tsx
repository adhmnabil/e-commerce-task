import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore, type AddCartItemInput } from '../store/cartStore';
import { AddToCartButton } from './AddToCartButton';
import { CartDrawer } from './CartDrawer';

const item = (overrides: Partial<AddCartItemInput> = {}): AddCartItemInput => ({
  productId: 'p1',
  variantId: 'v1',
  slug: 'Sneakers12',
  name: 'Achilles Pro Sneakers',
  image: 'https://cdn/x.webp',
  currency: 'EGP',
  options: { color: 'brown', size: '40' },
  unitPrice: 160,
  compareAtPrice: 190,
  ...overrides,
});

const openWith = (...entries: [AddCartItemInput, number][]) =>
  act(() => {
    for (const [entry, qty] of entries) useCartStore.getState().addItem(entry, qty);
    useCartStore.getState().openCart();
  });

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
});

describe('CartDrawer', () => {
  it('renders nothing while closed', () => {
    render(<CartDrawer />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the empty state', () => {
    act(() => useCartStore.getState().openCart());
    render(<CartDrawer />);
    const dialog = screen.getByRole('dialog', { name: /your cart/i });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('lists items with option details, subtotal and savings', () => {
    openWith([item(), 2]);
    render(<CartDrawer />);

    const line = screen.getByRole('listitem', { name: 'Achilles Pro Sneakers' });
    expect(within(line).getByText('Color: Brown · Size: 40')).toBeInTheDocument();
    expect(screen.getByText('Subtotal').nextElementSibling).toHaveTextContent('EGP 320.00');
    expect(screen.getByText('You save').nextElementSibling).toHaveTextContent('EGP 60.00');
  });

  it('increments and decrements quantity, updating the subtotal', async () => {
    const user = userEvent.setup();
    openWith([item(), 1]);
    render(<CartDrawer />);

    const increase = screen.getByRole('button', { name: /increase quantity/i });
    const decrease = screen.getByRole('button', { name: /decrease quantity/i });
    expect(decrease).toBeDisabled();

    await user.click(increase);
    await user.click(increase);
    expect(useCartStore.getState().items[0]!.quantity).toBe(3);
    expect(screen.getByText('Subtotal').nextElementSibling).toHaveTextContent('EGP 480.00');

    await user.click(decrease);
    expect(useCartStore.getState().items[0]!.quantity).toBe(2);
  });

  it('disables increment at the line maximum', async () => {
    const user = userEvent.setup();
    openWith([item({ maxQuantity: 2 }), 1]);
    render(<CartDrawer />);

    const increase = screen.getByRole('button', { name: /increase quantity/i });
    await user.click(increase);
    expect(increase).toBeDisabled();
    expect(useCartStore.getState().items[0]!.quantity).toBe(2);
  });

  it('removes an item and falls back to the empty state', async () => {
    const user = userEvent.setup();
    openWith([item(), 1], [item({ options: { color: 'black', size: '40' }, name: 'Black Sneakers' }), 1]);
    render(<CartDrawer />);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Remove Achilles Pro Sneakers' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Remove Black Sneakers' }));
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('closes via the close button and the Escape key', async () => {
    const user = userEvent.setup();
    openWith([item(), 1]);
    render(<CartDrawer />);

    await user.click(screen.getByRole('button', { name: /close cart/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => useCartStore.getState().openCart());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('moves focus into the dialog, traps Tab, and locks body scroll', async () => {
    const user = userEvent.setup();
    openWith([item(), 1]);
    render(<CartDrawer />);

    const dialog = screen.getByRole('dialog');
    expect(screen.getByRole('button', { name: /close cart/i })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    for (let i = 0; i < 12; i += 1) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it('opens with the new line when AddToCartButton is clicked', async () => {
    const user = userEvent.setup();
    render(
      <>
        <AddToCartButton item={item()} quantity={2} />
        <CartDrawer />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Add To Cart' }));

    const dialog = screen.getByRole('dialog', { name: /your cart/i });
    expect(within(dialog).getByRole('listitem', { name: 'Achilles Pro Sneakers' })).toBeInTheDocument();
    expect(within(dialog).getByRole('spinbutton', { name: /quantity for/i })).toHaveValue(2);
    expect(screen.getByRole('button', { name: /added/i })).toBeInTheDocument();
  });

  it('keeps AddToCartButton disabled without a purchasable item', () => {
    render(<AddToCartButton item={null} quantity={1} />);
    expect(screen.getByRole('button', { name: 'Add To Cart' })).toBeDisabled();
  });
});
