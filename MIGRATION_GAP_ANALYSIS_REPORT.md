# MIGRATION GAP ANALYSIS REPORT

_Last updated: 2025-11-14_

---

## 1. Active Components Extracted from `react-app/src/App.jsx`

| # | Component | Import Path | Load Type |
|---|-----------|-------------|-----------|
| 1 | `ProductsGrid` | `./components/ProductsGrid` | direct |
| 2 | `FilterBar` | `./components/FilterBar` | direct |
| 3 | `Header` | `./components/Header` | direct |
| 4 | `Footer` | `./components/Footer` | direct |
| 5 | `TrustBanner` | `./components/TrustBanner` | direct |
| 6 | `OrdersBadge` | `./components/CheckoutModal/OrdersBadge` | direct |
| 7 | `EnergyBridgeTransition` | `./components/EnergyBridgeTransion` | direct |
| 8 | `MarqueeSwiper` | `./components/MarqueeSwiper` | direct |
| 9 | `ToastContainer` | `./components/Toast/ToastContainer` | direct |
| 10 | `LoadingScreen` | `./components/LoadingScreen/LoadingScreen` | direct |
| 11 | `AnimatedBackground` | `./components/AnimatedBackground/AnimatedBackground` | direct |
| 12 | `ProductModal` | `./components/ProductModal` | lazy |
| 13 | `CartModal` | `./components/CartModal` | lazy |
| 14 | `CheckoutModal` | `./components/CheckoutModal` | lazy |
| 15 | `MyOrdersModal` | `./components/CheckoutModal/MyOrdersModal` | lazy |
| 16 | `TrackingModal` | `./components/CheckoutModal/TrackingModal` | lazy |
| 17 | `Sidebar` | `./components/Sidebar` | lazy |
| 18 | `StorytellingHero` | `./components/StorytellingHero` | lazy |

> Commented imports (e.g., `FeaturedSwiper`) were ignored per instructions.

---

## 2. Component Comparison Snapshot

| Component | React SPA Path | Next.js Path | CSS Source(s) | Dependencies & Props | Status |
|-----------|----------------|--------------|---------------|-----------------------|--------|
| Header | `react-app/src/components/Header.jsx` | `soft-cream-nextjs/src/components/client/Header.tsx` | global Tailwind (inline), shared CSS vars | React version receives callbacks + theme/lang props; Next version relies on `useTheme`/`useCart` and drops animated background hooks. | ⚠ Simplified (logic partially migrated) |
| StorytellingHero → Hero | `./components/StorytellingHero` | `src/components/server/Hero.tsx` | CSS module + background video in SPA vs Tailwind-only gradient in Next | SPA used imagery/video and narrative text; Next hero is static text, no `<Image>` or `<video>`. | ⚠ Replaced with simplified hero |
| EnergyBridgeTransition | `./components/EnergyBridgeTransion.jsx` | _missing_ | Inline framer-motion gradients | Uses `framer-motion`, scroll transforms, trust badge wave. | ❌ Missing |
| MarqueeSwiper | `./components/MarqueeSwiper.jsx` + `MarqueeSwiper.module.css` | `src/components/client/MarqueeSwiper.tsx` (no CSS file) | SPA CSS module controls height + gradients | Next lacks fixed-height marquee styling and pagination overrides. | ⚠ Simplified (needs CSS port) |
| TrustBanner | `./components/TrustBanner.jsx` + module CSS | `src/components/client/TrustBanner.tsx` (inline Tailwind) | SPA gradient/dark-mode CSS | Next misses responsive tweaks from module. | ⚠ Simplified |
| OrdersBadge | `./components/CheckoutModal/OrdersBadge.jsx` | _missing_ | Tailwind + floating styles | SPA listens to orders storage; Next sidebar still dispatches events but no badge UI. | ❌ Missing |
| AnimatedBackground | `./components/AnimatedBackground/AnimatedBackground.jsx` + CSS module | _missing_ | gradient animation CSS | Not implemented in Next. | ❌ Missing |
| LoadingScreen | `./components/LoadingScreen/LoadingScreen.jsx` + CSS module | _missing_ | spinner CSS | Not ported; Next uses Suspense fallback divs instead. | ❌ Missing |
| ToastContainer | `./components/Toast/ToastContainer.jsx` + module CSS | _missing_ | toast positioning CSS | ThemeProvider exposes toast state but no UI renderer. | ❌ Missing |
| ProductsGrid | `./components/ProductsGrid.jsx` + module CSS | `src/components/client/ProductsGrid.tsx` (client) + server version | SPA uses context filters & onAddToCart prop; Next version only groups `initialProducts`, no filters or cart add, missing CSS bullet styles. | ⚠ Simplified |
| ProductCard | `./components/ProductCard.jsx` | `src/components/client/ProductCard.tsx` | uses global CSS + animations | SPA card handles modal open, quick add, skeleton state; Next card has inline quantity controls and no energy overlays. | ⚠ Divergent |
| CartModal | `./components/CartModal.jsx` | `src/components/client/CartModal.tsx` | Tailwind + gradient backgrounds | SPA uses `useProductsData`, API nutrition summary, alerts; Next version relies on `onCheckout` prop + local nutrition calc and doesn’t hit API. | ⚠ Simplified |
| CheckoutModal | `./components/CheckoutModal/index.jsx` and child files | `src/components/client/CheckoutModal.tsx` | multi-step CSS files | SPA integrates phone validation, delivery method, API submission; Next version fakes payment and clears cart locally. | ⚠ Simplified |
| MyOrdersModal | `./components/CheckoutModal/MyOrdersModal.jsx` | _missing_ | Tailwind + timeline styling | Sidebar still dispatches `open-my-orders-modal`; listener absent. | ❌ Missing |
| TrackingModal | `./components/CheckoutModal/TrackingModal.jsx` | `src/components/client/TrackingModal.tsx` | Tailwind | Next version exists but uses mock props; lacks API tracking integration. | ⚠ Simplified |
| Sidebar | `./components/Sidebar.jsx` | `src/components/client/Sidebar.tsx` | Tailwind | Next sidebar still depends on events (`open-react-cart`, `open-my-orders-modal`) without handlers. | ⚠ Needs orchestration |
| ProductModal | `./components/ProductModal.jsx` | `src/components/client/ProductModal.tsx` | Tailwind | Functional parity largely maintained (view-only). | ✅ Exists |
| Tracking / Toast / Orders events | SPA handles via contexts | Next lacks event bus | n/a | `PageContentClient` sets modal booleans but never subscribes to sidebar events. | ⚠ Broken wiring |

---

## 3. CSS & Styling Analysis

- **Global stylesheet:** SPA uses `react-app/src/styles/index.css` (213 lines) with CSS variables (`--sidebar-width`, `--z-*`), scrollbar themes, RTL overrides, animation keyframes, and Swiper bullet overrides. Next’s `src/app/globals.css` (157 lines) contains only basic scrollbar + utility classes; none of the SPA variables or animations were migrated, leaving ~200 lines of base styling missing.
- **Component CSS modules (not ported):**
  - `FeaturedSwiper.module.css` (568 lines)
  - `MarqueeSwiper.module.css` (45 lines)
  - `ProductsGrid.module.css` (138 lines)
  - `TrustBanner.module.css` (82 lines)
  - `AnimatedBackground.module.css` (71 lines)
  - `LoadingScreen.module.css` (52 lines)
  - `Toast/Toast.module.css` (~80 lines)
  - Net loss: **~1,000+ lines of scoped styling** controlling gradients, Swiper pagination, skeletons, toast positioning, etc.
- **Next.js state:** relies solely on Tailwind classes inside components. Many interactive visual cues (shimmer, glow, z-index system) are missing until CSS is ported.

---

## 4. Context & State Providers

| Concern | React SPA | Next.js | Gap |
|---------|-----------|---------|-----|
| Global/i18n/Theme | `GlobalProvider.jsx` handles language, theme, toasts, translations using `localStorage`. | `ThemeProvider.tsx` replicates language + theme + toast APIs with `storage.client.ts`. | ✅ Parity achieved.
| Products data | `ProductsDataContext.jsx` manages fetch, filters, selected product, translations, caching; exposes `productsMap`, `filteredProducts`, `openProduct`. | **Missing**. Next relies on `PageContentClient` local state and mock `initialProducts`; no shared provider or real fetch. | ❌ Need Products provider + hooks.
| Cart | `CartContext.jsx` stores cart in `sessionStorage`, exposes totals, dispatches DOM events. | `CartProvider.tsx` implements similar API but doesn’t expose totals maps or `getCartTotal`. Some SPA helpers (max quantity alert translations) were dropped. | ⚠ Partial parity.

Effects/useEffect differences:
- SPA contexts emit DOM custom events for Vanilla zones; Next removed listeners except sidebar still emits events with no subscribers.
- SPA `ProductsDataProvider` fetches from API and populates filters; Next has no fetch and uses static mock data.

---

## 5. API Layer Comparison

| Aspect | React SPA (`services/api.js`) | Next.js (`lib/api.ts`) | Gap |
|--------|------------------------------|------------------------|-----|
| Base URL detection | Auto-detects local/netlify/production, handles rate limiting, retries, analytics, coupon validation, nutrition summary, branches, tracking. | Simple fetch wrapper to Workers API; no retries or client-side guards. | ⚠ Missing resilience features.
| Usage | SPA contexts/components call `api.getProducts`, `api.validateCoupon`, `api.submitOrder`, etc. | **Not used anywhere yet.** `page.tsx` injects mock products; Checkout/Cart modals never call API. | ❌ API integration pending.
| Endpoints | SPA implements `submitOrder`, `calculateOrderPrices`, `validateCoupon`, `getNutritionSummary`, `getBranches`, etc. | Next exposes similar functions but returns raw responses; some endpoints (analytics, discover) absent. | ⚠ Equivalent coverage but unused.

---

## 6. Deep Dive – Critical Components

1. **ProductCard**
   - React: receives `product`, `onAddToCart`; uses `useProductsData` to open modal, includes skeleton loading, energy overlay, quick-add button with ripple, fallback image.
   - Next: maintains local quantity state, always renders quantity controls, no modal open, no energy overlay, uses `<img>` without placeholders.
   - Needed: reintroduce modal open callback, energy badges, skeleton states, Next `<Image>` integration.

2. **ProductsGrid**
   - React: consumes `filteredProducts` from context, supports loading/error states, uses CSS module for Swiper bullets.
   - Next: accepts `initialProducts` prop only, groups by category once, lacks filters/search state, no Swiper styling (default blue bullets reappear).
   - Needed: connect to Products provider/API, port CSS module, wire `FilterBar` outputs.

3. **CartModal**
   - React: uses contexts for translations and API-driven nutrition summary; renders macros from backend.
   - Next: calculates macros locally from `allProducts` prop, no API call, no translation toggles, but UI mostly there.
   - Needed: integrate `lib/api.getNutritionSummary`, translations via `useTheme().t`, align event handling.

4. **CheckoutModal**
   - React: multi-step checkout (Delivery info → Pricing → Payment) with validation, coupon support, API submission, order tracking integration; includes subcomponents per step.
   - Next: two-step mock (info, payment) with `setTimeout` to simulate success; no API call, coupon, or delivery modes.
   - Needed: hook into `cart`, call `calculateOrderPrices`/`submitOrder`, persist orders via `storage`.

5. **Header**
   - React: receives theme/lang/callbacks via props (controlled by GlobalProvider). Animated background, cart badge, orders counter.
   - Next: uses context directly, but brand section uses remote image URL and lacks fallback, no event bridging for Vanilla sections.
   - Needed: convert hero assets to local `/public`, ensure toggles dispatch events if Vanilla zones still exist.

---

## 7. Missing vs Existing Components

| Component | Status |
|-----------|--------|
| ProductsGrid, ProductCard, FilterBar, Header, Footer, TrustBanner, MarqueeSwiper, CartModal, CheckoutModal, TrackingModal, Sidebar, ProductModal | ✅ Exists but several marked ⚠ for reduced functionality.
| OrdersBadge, EnergyBridgeTransition, AnimatedBackground, LoadingScreen, ToastContainer, MyOrdersModal | ❌ Missing entirely in Next.
| StorytellingHero | ⚠ Replaced by simplified `Hero` (no imagery/video).

Missing components count: **6**
Incomplete/simplified components count: **9+** (including the five deep-dive targets).

---

## 8. Gap Metrics & Priority

1. **Missing Components:** 6
2. **Incomplete Components:** 9 (major ones listed above)
3. **Missing CSS:** ~1,000 lines (index + 6 CSS modules) covering gradients, Swiper controls, skeletons.
4. **API Connection:** Not wired – `lib/api.ts` unused; checkout/cart rely on mock data.
5. **Context Differences:** Products provider absent; cart/provider parity partial; DOM bridge events still referenced but unhandled.
6. **Styling Differences:** No CSS variables, z-index scale, or Swiper overrides; many gradients/time-based animations removed.

**Overall completion estimate:** ~60% of SPA functionality present in Next shell (UI scaffolding exists but lacks data + animations).
**Priority level:** 🔴 High – production features (orders history, checkout API, toast feedback) are non-functional.

---

## 9. Actionable Fix Plan

1. **Restore shared data layer (Products provider):** Port `ProductsDataContext` logic to `src/providers/ProductsProvider.tsx`, fetch real data via `lib/api.getProducts`, expose filters/search states for `FilterBar`, `ProductsGrid`, `ProductModal`.
2. **Port missing components:** Recreate `EnergyBridgeTransition`, `OrdersBadge`, `AnimatedBackground`, `LoadingScreen`, `ToastContainer`, `MyOrdersModal` under `src/components/client/` and wire events (e.g., `window.addEventListener('open-my-orders-modal', ...)`).
3. **Rewire sidebar/modal events:** Replace DOM events with React state in `PageContentClient` to open cart/orders/checkout, ensuring Sidebar buttons trigger state setters instead of window events.
4. **Integrate API calls:**
   - `page.tsx` should call `getProducts` (server-side) instead of using `mockProducts`.
   - `CartModal` should request nutrition summaries from the API when cart changes.
   - `CheckoutModal` must call `calculateOrderPrices` and `submitOrder` and persist orders via `storage`.
5. **Migrate CSS:**
   - Copy `src/styles/index.css` content into `src/app/globals.css` (preserve Tailwind layers) and port module CSS as CSS Modules or Tailwind plugin equivalents.
   - Ensure Swiper pagination styles are scoped (e.g., using `@layer components`).
6. **Image & asset optimization (Phase 3 prep):** replace remote header logo and hero imagery with `/public` assets, wrap in Next `<Image>`, and plan for background video using `<video>` or `next-video` once assets are available.
7. **Toast UI:** Implement a client-side toast portal that consumes `useTheme().toasts` and renders them, similar to SPA’s `ToastContainer`.
8. **Order history & badges:** Port `storage` order helpers + `MyOrdersModal` and ensure new orders are saved after checkout success; show `OrdersBadge` and connect `Sidebar` “My Orders” action.
9. **Documentation & testing:** After parity achieved, add integration tests (Playwright) for add-to-cart → checkout → orders history, and unit tests for providers.

---
