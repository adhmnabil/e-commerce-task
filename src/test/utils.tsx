import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { Product } from '@/features/product/types/product.types';
import rawProduct from './fixtures/product.json';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0, gcTime: Infinity, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
}

export function renderWithClient(ui: ReactElement, client = createTestQueryClient(), options?: RenderOptions) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...render(ui, { wrapper, ...options }) };
}

/** Real `GET /products/slug/clear-theme/Sneakers12?join=reviews` payload. */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  const base = structuredClone(rawProduct) as unknown as Product;
  return { ...base, ...overrides };
}
