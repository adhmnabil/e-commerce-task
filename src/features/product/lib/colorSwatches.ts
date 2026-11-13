import type { Variation, VariationProp } from '../types/product.types';

const NAMED_COLORS: Record<string, string> = {
  brown: '#5a4632',
  'royal brown': '#5a4632',
  khaki: '#6b5d3f',
  black: '#14181c',
  white: '#ececec',
  beige: '#d9c7ab',
  biege: '#d9c7ab',
  cream: '#efe6d2',
  grey: '#9a9a9a',
  gray: '#9a9a9a',
  blue: '#456b92',
  navy: '#1f2a44',
  green: '#4a6b4a',
  olive: '#6b6b3a',
  red: '#a3302b',
  pink: '#e8b7c0',
  yellow: '#e8c95a',
};

export function isColorVariation(variation: Variation): boolean {
  return variation.type === 'color' || /colou?r|لون/i.test(variation.name);
}

/** Solid fill for a colour option, or `null` when only an image is available. */
export function getSwatchColor(variation: Variation, prop: VariationProp): string | null {
  if (variation.type === 'color' && prop.value) return prop.value;
  return NAMED_COLORS[prop.name.trim().toLowerCase()] ?? null;
}
