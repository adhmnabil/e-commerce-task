import { describe, expect, it } from 'vitest';
import { getPageTokens } from '@/components/molecules/Pagination';
import { formatCompactNumber, formatCurrency } from './format';
import { sanitizeHtml } from './html';

describe('sanitizeHtml', () => {
  it('drops scripts, event handlers and unsafe links', () => {
    const out = sanitizeHtml(
      '<p onclick="x()">Hi<script>alert(1)</script></p><a href="javascript:alert(1)">bad</a><img src=x onerror=alert(1)>',
    );
    expect(out).toBe('<p>Hi</p><a target="_blank" rel="noopener noreferrer">bad</a>');
  });

  it('unwraps disallowed wrappers while sanitizing their children', () => {
    expect(sanitizeHtml('<div><section><strong style="color:red">ok</strong><iframe></iframe></section></div>')).toBe(
      '<strong>ok</strong>',
    );
  });

  it('collapses empty editor paragraphs', () => {
    expect(sanitizeHtml('<p>a</p><p><br></p><p><br></p><p>b</p>')).toBe('<p>a</p><p>b</p>');
  });
});

describe('getPageTokens', () => {
  it('matches the design at page 1 of 19', () => {
    expect(getPageTokens(1, 19)).toEqual([1, 2, 'ellipsis-end', 19]);
  });

  it('shows both ellipses in the middle', () => {
    expect(getPageTokens(10, 19)).toEqual([1, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 19]);
  });

  it('lists all pages when they fit', () => {
    expect(getPageTokens(2, 4)).toEqual([1, 2, 3, 4]);
    expect(getPageTokens(1, 0)).toEqual([]);
  });
});

describe('formatters', () => {
  it('formats currency and falls back for unknown codes', () => {
    expect(formatCurrency(160, 'EGP').replace(/\s/g, ' ')).toBe('EGP 160.00');
    expect(formatCurrency(28, 'GBP')).toBe('£28.00');
    expect(formatCurrency(10, 'not-a-code')).toBe('10.00 not-a-code');
  });

  it('formats compact numbers', () => {
    expect(formatCompactNumber(1250)).toBe('1.25K');
  });
});
