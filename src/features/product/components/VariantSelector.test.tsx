import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeProduct } from '@/test/utils';
import { useVariantSelection } from '../hooks/useVariantSelection';
import type { Product } from '../types/product.types';
import { VariantSelector } from './VariantSelector';

function Harness({ product }: { product: Product }) {
  const { selection, select, isAvailable, variant, pricing } = useVariantSelection(product);
  return (
    <>
      <VariantSelector
        variations={product.variations ?? []}
        selection={selection}
        onSelect={select}
        isAvailable={isAvailable}
        onSizeChartClick={() => {}}
      />
      <output data-testid="variant">{variant?.id ?? 'none'}</output>
      <output data-testid="price">{pricing.price}</output>
    </>
  );
}

const getGroup = (name: RegExp) => screen.getByRole('radiogroup', { name });

describe('VariantSelector', () => {
  it('renders a radio group per variation with the default selection checked', () => {
    render(<Harness product={makeProduct()} />);

    const colors = getGroup(/color/i);
    const sizes = getGroup(/size/i);
    expect(within(colors).getAllByRole('radio')).toHaveLength(3);
    expect(within(sizes).getAllByRole('radio')).toHaveLength(3);
    expect(within(colors).getByRole('radio', { name: 'Brown' })).toHaveAttribute('aria-checked', 'true');
    expect(within(sizes).getByRole('radio', { name: '38' })).toHaveAttribute('aria-checked', 'true');
  });

  it('updates the selection, label and resolved variant when options are clicked', async () => {
    const user = userEvent.setup();
    render(<Harness product={makeProduct()} />);

    await user.click(within(getGroup(/color/i)).getByRole('radio', { name: 'Black' }));
    await user.click(within(getGroup(/size/i)).getByRole('radio', { name: '42' }));

    expect(within(getGroup(/color/i)).getByRole('radio', { name: 'Black' })).toHaveAttribute('aria-checked', 'true');
    expect(within(getGroup(/color/i)).getByRole('radio', { name: 'Brown' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText(/^Size:/)).toHaveTextContent('Size: 42');
    // black / 42 in the real payload
    expect(screen.getByTestId('variant')).toHaveTextContent('98928d6f-ca48-4c82-ac80-4f0653acdf82');
  });

  it('supports arrow-key navigation with a single tab stop per group', async () => {
    const user = userEvent.setup();
    render(<Harness product={makeProduct()} />);

    const sizes = within(getGroup(/size/i));
    const tabStops = sizes.getAllByRole('radio').filter((el) => el.tabIndex === 0);
    expect(tabStops).toHaveLength(1);

    sizes.getByRole('radio', { name: '38' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(sizes.getByRole('radio', { name: '40' })).toHaveAttribute('aria-checked', 'true');
    expect(sizes.getByRole('radio', { name: '40' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(sizes.getByRole('radio', { name: '42' })).toHaveAttribute('aria-checked', 'true');
  });

  it('marks out-of-stock options as disabled and ignores clicks on them', async () => {
    const user = userEvent.setup();
    const product = makeProduct({ track_stock: true });
    // Only brown/38 and brown/40 are in stock.
    product.variants = product.variants!.map((v) => {
      const props = Object.fromEntries(v.variation_props.map((p) => [p.variation, p.variation_prop]));
      return { ...v, quantity: props.color === 'brown' && props.size !== '42' ? 5 : 0 };
    });
    render(<Harness product={product} />);

    const size42 = within(getGroup(/size/i)).getByRole('radio', { name: /42 \(unavailable\)/ });
    expect(size42).toHaveAttribute('aria-disabled', 'true');

    await user.click(size42);
    expect(size42).toHaveAttribute('aria-checked', 'false');
    expect(within(getGroup(/size/i)).getByRole('radio', { name: '38' })).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onSelect with the variation and prop names', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const product = makeProduct();
    render(
      <VariantSelector
        variations={product.variations!}
        selection={{ color: 'brown', size: '38' }}
        onSelect={onSelect}
        isAvailable={() => true}
      />,
    );

    await user.click(screen.getByRole('radio', { name: 'Biege' }));
    expect(onSelect).toHaveBeenCalledWith('color', 'biege');
  });

  it('shows the size chart link only when a handler is provided', async () => {
    const user = userEvent.setup();
    const onSizeChartClick = vi.fn();
    const product = makeProduct();
    const { rerender } = render(
      <VariantSelector variations={product.variations!} selection={{}} onSelect={vi.fn()} isAvailable={() => true} />,
    );
    expect(screen.queryByRole('button', { name: /size chart/i })).not.toBeInTheDocument();

    rerender(
      <VariantSelector
        variations={product.variations!}
        selection={{}}
        onSelect={vi.fn()}
        isAvailable={() => true}
        onSizeChartClick={onSizeChartClick}
      />,
    );
    await user.click(screen.getByRole('button', { name: /size chart/i }));
    expect(onSizeChartClick).toHaveBeenCalledOnce();
  });

  it('renders nothing for products without variations', () => {
    const { container } = render(
      <VariantSelector variations={[]} selection={{}} onSelect={vi.fn()} isAvailable={() => true} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
