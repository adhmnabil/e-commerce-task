export const DEFAULT_LOCALE = 'en-GB';
export const DEFAULT_CURRENCY = 'EGP';

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: string, locale: string): Intl.NumberFormat {
  const key = `${locale}|${currency}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    currencyFormatters.set(key, formatter);
  }
  return formatter;
}

export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  try {
    return getCurrencyFormatter(currency || DEFAULT_CURRENCY, locale).format(safeAmount);
  } catch {
    // Unknown ISO code (e.g. a free-text `custom_currency` from the API).
    return `${safeAmount.toFixed(2)} ${currency}`;
  }
}

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 2,
});
const integerFormatter = new Intl.NumberFormat('en');

/** `1250` -> `1.25K`. */
export function formatCompactNumber(value: number): string {
  return compactFormatter.format(value);
}

/** `1238` -> `1,238`. */
export function formatNumber(value: number): string {
  return integerFormatter.format(value);
}

export function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

/** `2020-07-02T15:29:00` -> `July 2, 2020 03:29 PM` (in the viewer's time zone). */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
}
