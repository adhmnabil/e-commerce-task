# Product Detail Page — John Lewis & Partners

A responsive e-commerce product detail page built against the Easy Orders API (product `Sneakers12`), matched to the
[Ecommerce – Product Detail Page (Community)](https://www.figma.com/design/b4iHFiwykhwvQ92LlSzTGU/Ecommerce--Product-Detail-Page--Community-)
Figma file (desktop frame 1512px, mobile frame 375px).

## Tech stack

- **React 19 + TypeScript** (strict, `noUnusedLocals`, `verbatimModuleSyntax`, `@/*` path alias) on **Vite**
- **Tailwind CSS v4** with `@theme` design tokens and custom `@utility` classes
- **TanStack Query** for server state, including optimistic mutations with rollback
- **Zustand** (`immer` + `persist`) for the cart and wishlist
- **Lucide** icons
- **Vitest + React Testing Library** (67 tests across 7 files)

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start the dev server                |
| `npm run build`      | Type-check and build for production |
| `npm run typecheck`  | Strict `tsc --noEmit`               |
| `npm test`           | Run the Vitest suite once           |
| `npm run test:watch` | Vitest in watch mode                |

Optional `.env` overrides:

```
VITE_API_BASE_URL=https://api.easy-orders.net/api/v1
VITE_STORE_SLUG=clear-theme
VITE_PRODUCT_SLUG=Sneakers12
```

## Architecture

Atomic design for shared UI, feature folders for domain logic:

```
src/
├── app/          providers, layout, root, global styles (Tailwind theme + dashed-line utilities)
├── components/
│   ├── atoms/      Badge, Button, Checkbox, IconButton, RatingStars, Avatar, Skeleton, SocialIcon, Typography
│   ├── molecules/  Breadcrumbs, Pagination, ReviewFilter, SectionHeader, QuantitySelector
│   └── organisms/  AnnouncementBar, Header, Footer, Logo
├── features/
│   ├── product/  api (client, queries, optimistic vote mutation), components, hooks, lib, types
│   ├── cart/     Zustand store, cart drawer, add-to-cart button
│   └── wishlist/ Zustand store
├── hooks/        useDebounce, useWindowSize, useFocusTrap, useLockBodyScroll
└── utils/        cn (clsx + tailwind-merge), formatters, HTML sanitizer
```

## Features

- **Announcement bar** with a live countdown pill.
- **Header** with logo, search panel with debounced suggestions, categories dropdown, sign in, wishlist and cart counters, and a mobile menu.
- **Gallery** with a 3:4 main image, hover zoom, thumbnails, previous/next, share (Web Share API with clipboard fallback) and wishlist toggle.
- **Product info**: brand, title, sale/compare-at price, sold count, rating (scrolls to reviews) and an expandable, sanitized HTML description.
- **Variant selector**: colour swatches and size pills as accessible radio groups (arrow-key navigation, unavailable combinations disabled), plus a size chart dialog on larger screens.
- **Add To Cart / Checkout Now**, which add the selected variant to a persisted cart and open the cart drawer.
- **Related Product** and **Popular this week** rails.
- **Reviews**: rating summary ring and distribution bars, tabs, rating/topic filters, pagination, and helpful/not-helpful voting with optimistic updates that roll back on error.
- **Footer** with newsletter form (email validation), social links, link columns, and language/currency selectors.

## Design system

| Token / rule      | Value                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| Font              | Clash Grotesk (Fontshare) everywhere; Raleway for "Description:" and the Color/Size labels |
| Ink               | `#141414`                                                                    |
| Image surface     | `#F2F2F2` behind all product images (`mix-blend-multiply` removes white backgrounds) |
| Star              | `#FFA439`                                                                    |
| Content width     | 1200px (container 1248px with 24px gutters; 20px gutters on mobile)          |
| Dashed lines      | 6px dash / 6px gap via `dash-t`, `dash-b`, `dash-box` utilities (native `dashed` borders can't control dash length) |
| Section spacing   | 80px desktop, 56px mobile, with a dashed divider between sections           |

## Project history

The page was built first, then refined step by step to match the design screenshots and finally audited against the Figma file.

1. **Initial build.** Wrote the full PDP on the stack above: API client, TanStack Query hooks, Zustand cart/wishlist, the atomic component library and tests.
2. **Screenshot matching.**
   - Colour picker, product icons (mapped to Lucide equivalents), reviews, pagination and footer were restyled to match the screenshots.
   - The variant/CTA area was reduced to exactly what the design shows. The quantity selector and extra delivery info were removed, and the buttons are now **Add To Cart**, **Checkout Now** and a **Delivery T&C** link.
   - Search became a header icon that opens a search panel.
   - All borders became dashed, and the header line spans only the navbar width.
   - The description block was rebuilt with price, sold count, rating and divider, plus a "See More..." toggle.
   - Switched the font to Clash Grotesk, and set the image backgrounds to `#F2F2F2`.
   - Removed **Write a review** together with `ReviewForm`, `RatingInput`, `Input` and the create-review service code.
   - Hid **View Size Chart** on mobile.
3. **Figma audit.** Pulled exact specs from the Figma file through the REST API and aligned every section, desktop and mobile:
   - Logo image instead of text (170×32, 140×26 on mobile).
   - Header at 94px desktop / 75px mobile, with 20px icons and 16/500 nav text. The heart icon is hidden on mobile, as in the mobile frame.
   - Announcement bar with a countdown pill and no close button.
   - Breadcrumbs: 16/500 `#8F8F8F`, 12px arrows. On mobile they wrap and the current page sits on its own line.
   - Product grid 545px / 520px with a 135px gap. Gallery 3:4 with 8px radius, 52px side buttons and 76×100 thumbnails.
   - Info typography from Figma:
     - Title 36/600 (23 on mobile).
     - Price 28/600, old price 18/500 `#666`.
     - Sold count 20/400, rating 24/600.
     - Description 16/400 with 1.3 line height.
   - Variant options 75×40 with 8px radius and 14px gaps (4 per row on mobile). The CTAs are 296×58 and 200×58, stacked on mobile.
   - Section titles 28/600 (24 on mobile). "View All" links are 16/500 `#525252`.
   - Product cards: brand 18/600, price 20/600, name 16/400 `#7A7A7A`, then a rating and sold row.
   - Reviews:
     - Summary card with an 84px ring and 8px bars.
     - Filter panel 278px wide.
     - Tabs 42px tall; review cards with 20px stars and 50px vote buttons.
     - Pagination 44px.
   - Footer: `#F2F2F2` background with 72px top padding, a 298px newsletter field, 36px social circles, and 134px columns with 120px gaps. On mobile the columns become a two-column grid.

## API notes and stand-ins

- Product data comes from `GET /products/slug/{store}/{slug}?join=reviews`.
- Reviews and votes are seeded data:
  - The endpoint currently returns `reviews: null` and exposes no review vote endpoint.
  - `features/product/api/reviewsService.ts` stands in for both behind the same async contract. It is seeded from the API whenever the API does return reviews.
  - Only that file needs to change once real endpoints exist.
- There is no related-products endpoint. The "Related Product" and "Popular this week" rails, and the product's sold count, come from `catalogFixture.ts`.
- The language and currency selectors in the footer are cosmetic.
