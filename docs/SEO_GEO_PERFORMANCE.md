# SEO, Generative Engine Optimization (GEO), Performance & Accessibility

This document details how **wanna math** achieves search-engine indexability, LLM/agentic discoverability (GEO), minimal Cumulative Layout Shift (`CLS`), on-demand WebGL efficiency, and accessible Light/Dark WCAG compliance.

---

## 1. Technical SEO & Social Preview Infrastructure

| Feature | Implementation | Behavior |
| :--- | :--- | :--- |
| **Central Metadata Config** | [`src/lib/seo/siteConfig.ts`](../src/lib/seo/siteConfig.ts) | Resolves `SITE_URL` (`NEXT_PUBLIC_SITE_URL`, `SITE_URL`, or `VERCEL_PROJECT_PRODUCTION_URL`, defaulting to `https://wannamath.vercel.app`), normalizes canonical URLs (`absoluteUrl`), trims descriptions cleanly (`cleanMetadataText`), and defines `buildPageMetadata()`. |
| **Root Metadata Defaults** | [`src/app/layout.tsx`](../src/app/layout.tsx) | Sets `metadataBase`, title template `%s | Wanna Math`, `robots` (`max-image-preview: "large"`, `max-snippet: -1`, `max-video-preview: -1`), viewport `themeColor` for light (`#FFFBE4`) and dark (`#1E1F22`), and `<link rel="alternate" type="text/plain">` discovery links. |
| **Crawler Directives** | [`src/app/robots.ts`](../src/app/robots.ts) | Generates static `/robots.txt` allowing `/` (`disallow: ["/api/"]`) with explicit `sitemap` and `host`. |
| **Dynamic Sitemap** | [`src/app/sitemap.ts`](../src/app/sitemap.ts) | Generates `/sitemap.xml` dynamically from `getAllVolumes()` covering `/`, `/roadmap`, `/about`, all 6 volumes, 20 modules, and 65 chapters. |
| **OG & Twitter Images** | [`src/app/opengraph-image.tsx`](../src/app/opengraph-image.tsx), [`src/app/twitter-image.tsx`](../src/app/twitter-image.tsx) | Static `1200×630` PNG Satori social cards built on `#1E1F22` drafting slate using bundled KaTeX fonts and Butterfly palette swatches. |
| **PWA Manifest & Icons** | [`src/app/manifest.ts`](../src/app/manifest.ts), [`src/app/pwa-icon/[size]/route.tsx`](../src/app/pwa-icon/%5Bsize%5D/route.tsx) | Exposes `/manifest.webmanifest` and statically pre-rendered `192×192` and `512×512` PNG double-integral app icons (`/pwa-icon/192`, `/pwa-icon/512`). |

---

## 2. Generative Engine Optimization (GEO / AI Search)

To make structured mathematical knowledge directly machine-readable for LLM crawlers, retrieval agents, and answer engines:

1. **Summary & Full Markdown Textbook Feeds:**
   - **[`/llms.txt`](../src/app/llms.txt/route.ts) (`force-static`):** Concise AI index listing canonical entry points, creator provenance, all 6 volumes & 20 modules, and flagship chapter deep-links.
   - **[`/llms-full.txt`](../src/app/llms-full.txt/route.ts) (`force-static`):** Complete machine-readable catalog containing every volume's engineering applications, all 65 chapters' URLs, estimated study times, summaries, engineering contexts, prerequisites, LaTeX key equations, and 82 interactive lab specs.
   - Linked in `<head>` via `alternates.types["text/plain"]`.
2. **Schema.org `@graph` JSON-LD ([`src/lib/seo/structuredData.ts`](../src/lib/seo/structuredData.ts) & [`src/components/seo/JsonLd.tsx`](../src/components/seo/JsonLd.tsx)):**
   - Serializes structured graphs safely (escaping `<` to `\u003c` so mathematical inequality expressions cannot break inline script tags):
     - `Home`: `Person` (`@id: /#creator`), `EducationalOrganization` (`@id: /#organization`), `WebSite`, `WebPage`, and free online `["Course", "LearningResource"]`.
     - `Roadmap`: `BreadcrumbList` + `CollectionPage` + `ItemList` of volumes.
     - `About`: `BreadcrumbList` + `["AboutPage", "ProfilePage"]` linked to `Person`.
     - `Volume` & `Module`: Connected `["Course", "LearningResource"]` and `["CollectionPage", "LearningResource"]` graphs with `hasPart` links.
     - `Chapter`: `["LearningResource", "TechArticle"]` including `timeRequired` (`PT...M`), `interactivityType: "active"`, `educationalUse`, `keywords`, `abstract`, and child `["WebApplication", "LearningResource"]` objects for every interactive lab.

---

## 3. Core Web Vitals, Bundle Splitting & HTTP Headers

1. **Bundle Optimization:**
   - Removed unused `framer-motion` from [`package.json`](../package.json).
   - Configured `experimental.optimizePackageImports: ["lucide-react"]`, `compress: true`, `poweredByHeader: false`, and `images.formats: ["image/avif", "image/webp"]` in [`next.config.ts`](../next.config.ts).
   - Used tree-shaken `mathjs/number` imports inside [`src/lib/mathParser.ts`](../src/lib/mathParser.ts).
2. **Dynamic Client Hydration & Geometry Reservation:**
   - Heavy WebGL labs and `three` modules load strictly per-route via `next/dynamic` inside [`DynamicLabRenderer.tsx`](../src/components/visualizations/DynamicLabRenderer.tsx) and [`HeroIntegral3DViewport.tsx`](../src/components/visualizations/HeroIntegral3DViewport.tsx).
   - [`LabLoadingSkeleton.tsx`](../src/components/visualizations/LabLoadingSkeleton.tsx) reserves fixed frame height (`min-h-[500px]` / `min-h-[540px]`) during dynamic chunk resolution.
3. **Zero Idle GPU/CPU Burn:** [`createDemandDrivenRenderLoop`](../src/components/visualizations/primitives/demandRenderLoop.ts) halts `requestAnimationFrame` loops when cameras settle, viewports scroll off-screen (`IntersectionObserver`), or tabs go inactive (`document.hidden`).
4. **CLS Hardening:**
   - [`globals.css`](../src/app/globals.css) applies `contain: layout style;` on `.below-fold-section` (avoiding `content-visibility: auto` estimation jumps on mobile).
   - [`TopicPageShell.tsx`](../src/components/layout/TopicPageShell.tsx) uses non-wrapping breadcrumb/prerequisite chip rows (`lg:flex-nowrap`, `md:flex-nowrap md:overflow-x-auto`) and `min-h-[82px]` containers for Governing Mathematical Formulation KaTeX blocks so webfont swap (`JetBrains Mono`, `KaTeX_*`) does not shift downstream layout blocks.
5. **Security & Crawler Cache Headers ([`next.config.ts`](../next.config.ts)):**
   - Global security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `X-DNS-Prefetch-Control: on`).
   - `Cache-Control` and `X-Robots-Tag: all` tuned for `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, and `/pwa-icon/:path*`.

---

## 4. Accessibility (`a11y`) & Contrast Architecture

- Every mathematical `<KaTeXMath />` formula exposes `role="math"` with descriptive LaTeX `aria-label` text and theme-aware `--math-ink-*` variable remapping (`>= 4.5:1` contrast on both Light Paper and Dark Slate backgrounds).
- Native `<details>/<summary>` disclosures and `<dialog>` (`TextbookSidebar`) preserve native keyboard Escape/focus behavior.
- Interactive controls across all 2D/3D labs carry explicit accessible names (`aria-label`), SVG diagrams carry `role="img"` and `aria-label`, icon-only reset buttons include explicit labels & minimum hit area, and mobile links provide touch target padding.

---

## 5. Verified Benchmark & Audit Results

All checks below were executed on commit `469a153` (or immediately after the final code edit):

- **TypeScript & Production Build:** `npx.cmd tsc --noEmit` + `npm run build` exited `0`, compiled in `9.9s`, and statically generated **`113/113`** routes.
- **Static AST Accessibility Audit (`111` TSX/JSX files, `272` controls):**
  - Unlabelled controls: **`0`** · Wrapped-no-text controls: **`0`** · Unmarked DOM SVGs: **`0`** (2 Satori server image routes excluded)
  - Prohibited ARIA on generic tags: **`0`** · Unlabelled icon buttons: **`0`** · Dimmed opacity contrast hits: **`0`**
- **Live Chrome DevTools / Lighthouse Audits (`next start -p 3030`):**
  - `/multivariable-calculus/integral-calculus/double-integrals` (**Light Desktop**): `100` Accessibility · `100` Best Practices · `100` SEO · `100` Agentic Browsing (`53/53` passed, `CLS: 0.033`, `0` console/network errors across `50` HTTP `200` requests).
  - `/multivariable-calculus/integral-calculus/double-integrals` (**Dark Desktop**): `100 / 100 / 100 / 100` (`53/53` passed, `CLS: 0.034`, `0` console/network errors).
  - `/multivariable-calculus/integral-calculus/double-integrals` (**Throttled `1350×940` `4x CPU + Slow 4G` cold-cache trace**): **`CLS: 0.02`** (`0.0193`), **`LCP: 2078 ms`**.
  - `/single-variable-calculus/limits-continuity/epsilon-delta-limits` (**Desktop**): `100 / 100 / 100 / 100` (`53/53` passed, `CLS: 0.024`, `0` errors across `36` HTTP `200` requests).
  - `/` (**Desktop**): `100 / 100 / 100 / 100` (`54/54` passed, `CLS: 0.003`, `0` errors across `40` HTTP `200` requests).
  - *(Note: `/about`, `/roadmap`, and Mobile Light/Dark viewports also audited `100 / 100 / 100 / 100` with `CLS: 0.00` prior to the final `TopicPageShell.tsx` Desktop CLS adjustment; `/about` and `/roadmap` do not render `TopicPageShell`.)*
