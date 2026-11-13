import { memo, useRef, type KeyboardEvent } from 'react';
import type { Variation, VariantSelection } from '../types/product.types';
import { getSwatchColor, isColorVariation } from '../lib/colorSwatches';
import { cn } from '@/utils/cn';
import { capitalize } from '@/utils/format';

export interface VariantSelectorProps {
  variations: Variation[];
  selection: VariantSelection;
  onSelect: (variationName: string, propName: string) => void;
  isAvailable: (variationName: string, propName: string) => boolean;
  onSizeChartClick?: () => void;
}

interface OptionGroupProps {
  variation: Variation;
  selected: string | undefined;
  onSelect: VariantSelectorProps['onSelect'];
  isAvailable: VariantSelectorProps['isAvailable'];
  onSizeChartClick?: () => void;
}

const isSizeVariation = (name: string) => /size|مقاس/i.test(name);

function OptionGroup({ variation, selected, onSelect, isAvailable, onSizeChartClick }: OptionGroupProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const labelId = `variation-${variation.id}`;
  const isSwatch = isColorVariation(variation) || variation.type === 'image';
  const enabledProps = variation.props.filter((prop) => isAvailable(variation.name, prop.name));

  // WAI-ARIA radio group: arrows move + select among enabled options, Tab leaves the group.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
    if (!keys.includes(event.key) || enabledProps.length === 0) return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const current = enabledProps.findIndex((prop) => prop.name === selected);
    const next = enabledProps[(current + step + enabledProps.length) % enabledProps.length];
    if (!next) return;
    onSelect(variation.name, next.name);
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [];
    Array.from(buttons).find((button) => button.dataset.value === next.name)?.focus();
  };

  return (
    <div>
      <div className="mb-[18px] flex items-center justify-between">
        <p
          id={labelId}
          className={cn(
            'font-raleway font-semibold leading-[1.2] text-[#8f8f8f] lg:text-xl',
            isSwatch ? 'text-lg' : 'text-xl',
          )}
        >
          {capitalize(variation.name)}:{' '}
          <span className="font-sans font-semibold text-[#292929]">{selected ? capitalize(selected) : '—'}</span>
        </p>
        {isSizeVariation(variation.name) && onSizeChartClick && (
          <button type="button" onClick={onSizeChartClick} className="hidden text-base font-medium leading-[1.2] text-[#525252] underline underline-offset-4 hover:text-ink sm:inline">
            View Size Chart
          </button>
        )}
      </div>

      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={handleKeyDown}
        className="grid grid-cols-4 gap-x-3 gap-y-[21px] sm:flex sm:flex-wrap sm:gap-3.5"
      >
        {variation.props.map((prop) => {
          const checked = prop.name === selected;
          const available = isAvailable(variation.name, prop.name);
          const isTabStop = checked || (!selected && prop === enabledProps[0]);
          const label = capitalize(prop.name);
          const swatchColor = isSwatch ? getSwatchColor(variation, prop) : null;

          return (
            <button
              key={prop.id}
              type="button"
              role="radio"
              data-value={prop.name}
              aria-checked={checked}
              aria-disabled={!available || undefined}
              aria-label={available ? label : `${label} (unavailable)`}
              title={label}
              tabIndex={isTabStop ? 0 : -1}
              onClick={() => available && onSelect(variation.name, prop.name)}
              className={cn(
                'relative h-10 rounded-md transition-all sm:w-[75px] lg:rounded-lg',
                isSwatch
                  ? cn('overflow-hidden border', checked ? 'border-ink bg-white' : 'border-transparent hover:border-ink-subtle')
                  : cn(
                      'border text-xl font-semibold leading-[1.2]',
                      checked ? 'border-[#333] bg-[#ebebeb] text-ink' : 'border-[#e6e6e6] text-[#525252] hover:border-ink-muted',
                    ),
                !available && 'cursor-not-allowed opacity-40 hover:border-transparent',
              )}
            >
              {isSwatch ? (
                <span
                  aria-hidden
                  className={cn(
                    'absolute overflow-hidden transition-all',
                    checked ? 'inset-[5px] rounded-[5px]' : 'inset-0 rounded-[5px] lg:rounded-[7px]',
                  )}
                  style={swatchColor ? { backgroundColor: swatchColor } : undefined}
                >
                  {!swatchColor && prop.value && (
                    <img src={prop.value} alt="" loading="lazy" className="size-full object-cover" />
                  )}
                </span>
              ) : (
                label
              )}
              {!available && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 m-auto h-px w-[120%] -translate-x-[8%] rotate-[-20deg] bg-ink-muted"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const VariantSelector = memo(function VariantSelector({
  variations,
  selection,
  onSelect,
  isAvailable,
  onSizeChartClick,
}: VariantSelectorProps) {
  if (variations.length === 0) return null;

  return (
    <div className="mt-8 space-y-8 lg:mt-10 lg:space-y-10">
      {variations.map((variation) => (
        <OptionGroup
          key={variation.id}
          variation={variation}
          selected={selection[variation.name]}
          onSelect={onSelect}
          isAvailable={isAvailable}
          onSizeChartClick={onSizeChartClick}
        />
      ))}
    </div>
  );
});
