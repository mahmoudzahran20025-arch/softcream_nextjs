# Performance Fix Recommendations

## 1. Dynamic imports for heavy libraries
- **Issue:** `framer-motion`, `motion-dom`, and `swiper` each appear across dozens of chunks (>0.8 MB combined) (@perf/duplicate-findings.md).
- **Action:** Wrap hero/animation components with `next/dynamic({ ssr: false })` so framer-motion & swiper load only when the section enters viewport.
- **Commit message:** `perf: lazy load animation libraries to cut main bundle`

## 2. Consolidate motion helpers
- **Issue:** Multiple files import framer-motion primitives separately, inflating client bundle (same finding above).
- **Action:** Add `src/lib/motion-shared.ts` exporting configured motion primitives and reuse everywhere.
- **Commit message:** `refactor: centralize motion imports to avoid duplication`

## 3. Improve LCP hero media
- **Issue:** LCP is 5.56 s with video background; CLS acceptable but hero image lacks `<Image priority>`.
- **Action:** Preload the top hero poster via `next/image` with fixed width/height, `priority`, and CSS aspect ratio placeholders.
- **Commit message:** `perf: stabilize hero media for faster LCP`

## 4. Gate animations until hydration
- **Issue:** Animations trigger pre-hydration causing extra work & potential layout thrash.
- **Action:** Use `useEffect` or `useReducedMotion` to start motion sequences only after `isHydrated` flag flips.
- **Commit message:** `perf: defer client animations until hydrated`

## 5. Modernize JS target / remove legacy polyfills
- **Issue:** Bundle includes `next/dist/build/polyfills` and SWC helpers for old targets.
- **Action:** Update `tsconfig` + `browserslist` to target modern evergreen browsers and drop unused polyfills.
- **Commit message:** `chore(build): target modern browsers and drop legacy polyfills`

## 6. Batch DOM reads & writes
- **Issue:** Trace shows hydration tasks (though long-task log empty) spending ~5s TBT; current components read/write layout inside scroll/resize handlers individually.
- **Action:** Create `src/utils/batch-dom.ts` wrapping `requestAnimationFrame` to separate read/write phases and use inside scroll or animation hooks.
- **Commit message:** `perf: batch DOM mutations to avoid reflow penalties`

## 7. (Optional) Web Worker for pricing calculations
- **Issue:** Checkout repeatedly runs price calculations & coupon validation on main thread.
- **Action:** Move heavy calculation logic (`calculateOrderPrices`) to a worker and postMessage results.
- **Commit message:** `perf(worker): offload order pricing calculations`
