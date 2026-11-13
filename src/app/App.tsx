import { ProductDetailPage } from '@/features/product/components/ProductDetailPage';
import { AppLayout } from './AppLayout';
import { AppProviders } from './providers';

const PRODUCT_SLUG = import.meta.env.VITE_PRODUCT_SLUG ?? 'Sneakers12';

export function App() {
  return (
    <AppProviders>
      <AppLayout slug={PRODUCT_SLUG}>
        <ProductDetailPage slug={PRODUCT_SLUG} />
      </AppLayout>
    </AppProviders>
  );
}
