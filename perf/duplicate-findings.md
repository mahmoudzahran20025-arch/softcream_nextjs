# Bundle Duplication Findings

## Top 20 Parsed Modules
1. **static/chunks/4bd1b696-deba172d32c79f82.js** (chunk: static/chunks/4bd1b696-deba172d32c79f82.js) — 194.0 KB
2. **./node_modules/next/dist/compiled/react-dom/cjs** (chunk: static/chunks/4bd1b696-deba172d32c79f82.js) — 193.9 KB
3. **./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.production.js** (chunk: node_modules/next/dist/compiled/react-dom/cjs) — 193.9 KB
4. **static/chunks/794-f56a6ade4cfe539e.js** (chunk: static/chunks/794-f56a6ade4cfe539e.js) — 190.1 KB
5. **./node_modules** (chunk: static/chunks/794-f56a6ade4cfe539e.js) — 189.2 KB
6. **./node_modules/next/dist** (chunk: node_modules) — 188.5 KB
7. **static/chunks/framework-86a364e9483bf768.js** (chunk: static/chunks/framework-86a364e9483bf768.js) — 136.5 KB
8. **./node_modules** (chunk: static/chunks/framework-86a364e9483bf768.js) — 136.4 KB
9. **./node_modules/next/dist/client** (chunk: next/dist) — 133.0 KB
10. **./node_modules/react-dom** (chunk: node_modules) — 125.9 KB
11. **./node_modules/react-dom/cjs** (chunk: react-dom) — 125.6 KB
12. **./node_modules/react-dom/cjs/react-dom.production.min.js** (chunk: cjs) — 125.6 KB
13. **static/chunks/main-45164db9e82abe6e.js** (chunk: static/chunks/main-45164db9e82abe6e.js) — 120.7 KB
14. **./node_modules** (chunk: static/chunks/main-45164db9e82abe6e.js) — 120.0 KB
15. **./node_modules/next/dist** (chunk: node_modules) — 119.3 KB
16. **./node_modules/next/dist/client/components** (chunk: client) — 114.7 KB
17. **static/chunks/577.fdb994fdafb374d9.js** (chunk: static/chunks/577.fdb994fdafb374d9.js) — 111.3 KB
18. **./node_modules** (chunk: static/chunks/577.fdb994fdafb374d9.js) — 111.0 KB
19. **./node_modules/framer-motion/dist/es** (chunk: node_modules) — 97.9 KB
20. **./node_modules/framer-motion/dist/es/render/components/motion** (chunk: framer-motion/dist/es) — 97.5 KB

## Duplicate Libraries
- **framer-motion** appears in 53 chunks (316 modules), total size 803.9 KB. Chunks: node_modules, framer-motion/dist/es, render/components/motion, proxy.mjs + 204 modules (concatenated), motion-dom/dist/es, projection, node, gestures, render, drag, animation, utils, motion, generators, render/dom/scroll, spring, html, keyframes, pan, features, layout, value, svg, motion-utils/dist/es, geometry, interfaces, shared, dom, press, offsets, viewport, types, components/AnimatePresence, styles, easing, components, waapi, supports, context, maps, complex, use-will-change, reduced-motion, MotionContext, drivers, drag/state, animators/waapi/utils, animate, events, modifiers, optimized-appear, frameloop, stats
- **swiper** appears in 11 chunks (58 modules), total size 483.9 KB. Chunks: static/chunks/620.238654156c228253.js, node_modules/swiper, swiper-react.mjs + 3 modules (concatenated), shared, modules, index.mjs + 27 modules (concatenated), src/components/client, MarqueeSwiper.tsx + 1 modules (concatenated), node_modules/lucide-react/dist/esm/icons, node_modules, swiper/modules
- **motion-dom** appears in 40 chunks (177 modules), total size 164.4 KB. Chunks: node_modules, motion-dom/dist/es, animation, value, generators, utils, mix, index.mjs + 5 modules (concatenated), node_modules/motion-dom/dist/es, spring, types, keyframes, gestures, frameloop, batcher.mjs + 2 modules (concatenated), complex, index.mjs + 1 modules (concatenated), node_modules/motion-dom/dist/es/value/types, utils/mix, press, render, node_modules/motion-dom/dist/es/frameloop, dom, resize, color, utils.mjs + 2 modules (concatenated), waapi, supports, value/types/color, numbers, maps, easing, keyframes/offsets, default.mjs + 1 modules (concatenated), scroll, drivers, drag/state, node_modules/motion-dom/dist/es/animation/keyframes/offsets, stats, offsets
- **next runtime chunks** appears in 50 chunks (339 modules), total size 2.1 MB. Chunks: static/chunks/4bd1b696-deba172d32c79f82.js, node_modules/next/dist/compiled/react-dom/cjs, node_modules, next/dist, react-dom, cjs, client, shared/lib, components, router, compiled, react-server-dom-webpack, segment-cache, router-reducer, static/chunks/app/not-found-a7e71c2249105820.js, react, lib, path-to-regexp, static/chunks/899.1813981119fa1f8a.js, node_modules/next/dist, utils, reducers, scheduler, app-dir, pages, process, http-access-fallback, router/utils, build, polyfills, builtin, errors, tracing, react-client-callbacks, lazy-dynamic, server/app-render, framework, static/chunks/585.1079105c1db21c5a.js, node_modules/next/dist/pages, portal, request, i18n, page-path, static/chunks/next/dist/client/components/builtin/global-error-e630379ae9b096e3.js, metadata/generate, static/chunks/next/dist/client/components/builtin/app-error-b62023a1978bc555.js, static/chunks/next/dist/client/components/builtin/forbidden-b62023a1978bc555.js, static/chunks/next/dist/client/components/builtin/unauthorized-b62023a1978bc555.js, api, compiled/client-only
