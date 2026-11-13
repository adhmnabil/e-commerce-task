import { useCallback, useMemo, useState } from 'react';
import type { Product, VariantSelection } from '../types/product.types';
import {
  findVariant,
  getDefaultSelection,
  getMaxPurchasable,
  getPricing,
  getSelectionImage,
  isOptionAvailable,
} from '../lib/productLogic';

export function useVariantSelection(product: Product) {
  const [selection, setSelection] = useState<VariantSelection>(() => getDefaultSelection(product));

  const select = useCallback((variationName: string, propName: string) => {
    setSelection((current) =>
      current[variationName] === propName ? current : { ...current, [variationName]: propName },
    );
  }, []);

  const isAvailable = useCallback(
    (variationName: string, propName: string) => isOptionAvailable(product, selection, variationName, propName),
    [product, selection],
  );

  const variant = useMemo(() => findVariant(product, selection), [product, selection]);
  const pricing = useMemo(() => getPricing(product, variant), [product, variant]);
  const maxQuantity = useMemo(() => getMaxPurchasable(product, variant), [product, variant]);
  const selectionImage = useMemo(() => getSelectionImage(product, selection), [product, selection]);

  const variations = product.variations ?? [];
  const allChosen = variations.every((v) => Boolean(selection[v.name]));
  // Products may declare variations without a variant matrix; any full selection is then valid.
  const isComplete =
    variations.length === 0 || variant !== null || ((product.variants ?? []).length === 0 && allChosen);

  return { selection, select, isAvailable, variant, pricing, maxQuantity, selectionImage, isComplete };
}
