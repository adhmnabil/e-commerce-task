import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { useCartStore } from '@/features/cart/store/cartStore';
import { makeProduct, renderWithClient } from '@/test/utils';
import { resetReviewService, setReviewServiceLatency } from '../api/reviewsService';
import { ProductDetailPage } from './ProductDetailPage';

function mockFetch(response: () => Response) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async () => response());
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
  resetReviewService();
  setReviewServiceLatency(0);
});
afterAll(() => setReviewServiceLatency(450));

describe('ProductDetailPage', () => {
  it('requests the product by slug with reviews joined', async () => {
    const fetchSpy = mockFetch(() => json(makeProduct()));
    renderWithClient(<ProductDetailPage slug="Sneakers12" />);

    await screen.findByRole('heading', { level: 1 });
    expect(String(fetchSpy.mock.calls[0]![0])).toBe(
      'https://api.easy-orders.net/api/v1/products/slug/clear-theme/Sneakers12?join=reviews',
    );
  });

  it('renders product data, pricing, sanitized description and reviews', async () => {
    mockFetch(() => json(makeProduct()));
    renderWithClient(<ProductDetailPage slug="Sneakers12" />);

    expect(await screen.findByRole('heading', { level: 1, name: /achilles pro/i })).toBeInTheDocument();
    expect(screen.getByText('EGP 160.00')).toBeInTheDocument();
    expect(screen.getByText('EGP 190.00')).toBeInTheDocument();
    expect(screen.getByText(/made with cowhide leather/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent(/Homepage.*Mules.*Achilles Pro/);
    const reviews = await screen.findByRole('region', { name: 'Product Reviews' });
    expect(await within(reviews).findAllByRole('article')).toHaveLength(4);
    expect(within(reviews).getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('adds the selected variant to the cart and opens the drawer', async () => {
    const user = userEvent.setup();
    mockFetch(() => json(makeProduct()));
    renderWithClient(
      <>
        <ProductDetailPage slug="Sneakers12" />
        <CartDrawer />
      </>,
    );

    await screen.findByRole('heading', { level: 1 });
    await user.click(screen.getByRole('radio', { name: 'Black' }));
    await user.click(screen.getByRole('radio', { name: '42' }));
    await user.click(screen.getByRole('button', { name: 'Add To Cart' }));

    const dialog = await screen.findByRole('dialog', { name: /your cart/i });
    expect(within(dialog).getByText('Color: Black · Size: 42')).toBeInTheDocument();
    expect(useCartStore.getState().items[0]).toMatchObject({
      variantId: '98928d6f-ca48-4c82-ac80-4f0653acdf82',
      quantity: 1,
      unitPrice: 160,
    });
  });

  it('shows a not-found state for 404 responses without retrying', async () => {
    const fetchSpy = mockFetch(() => json({ message: 'not found' }, 404));
    renderWithClient(<ProductDetailPage slug="missing" />);

    expect(await screen.findByRole('heading', { name: /product not found/i })).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('retries network failures, then shows a retryable error', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    renderWithClient(<ProductDetailPage slug="Sneakers12" />);

    expect(await screen.findByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
