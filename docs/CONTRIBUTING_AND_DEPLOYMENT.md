# Developer Setup, Contributing & Deployment Guide

This guide covers running **wanna math** (`WannaMath`) locally, configuring environment variables, adding new chapters or laboratories without breaking design or accessibility invariants, and deploying to production.

---

## 1. Local Development Setup

### Prerequisites
- **Node.js** (v20+ / v22+ recommended) & **npm**

### Commands
```bash
# 1. Clone the repository
git clone https://github.com/swapnonil2007/WannaMath.git
cd WannaMath

# 2. Install dependencies
npm install

# 3. Start local development server (http://localhost:3000)
npm run dev

# 4. Run ESLint / Next.js lint checks
npm run lint

# 5. Typecheck & build all 113 static routes
npx tsc --noEmit
npm run build

# 6. Serve the production build locally
npm run start
```

---

## 2. Environment Variables

All canonical URLs, `sitemap.xml`, `robots.txt`, JSON-LD `@id`s, OpenGraph URLs, and `/llms.txt` feeds resolve `SITE_URL` in [`src/lib/seo/siteConfig.ts`](../src/lib/seo/siteConfig.ts) using the following fallback chain:

1. `NEXT_PUBLIC_SITE_URL` *(recommended override for custom domains)*
2. `SITE_URL`
3. `VERCEL_PROJECT_PRODUCTION_URL` *(automatically prefixed with `https://` on Vercel)*
4. Default fallback: `https://wannamath.vercel.app`

Example `.env.local` for a custom production domain:
```env
NEXT_PUBLIC_SITE_URL=https://your-custom-domain.com
```

---

## 3. Adding or Updating Chapters & Laboratories

For full step-by-step instructions and curriculum templates, also see [`archive/03_ADDING_NEW_TOPICS_GUIDE.md`](../archive/03_ADDING_NEW_TOPICS_GUIDE.md) and [`AGENTS.md`](../AGENTS.md).

### Architectural Workflow
1. **Register Metadata:** Add or update the chapter and its `labs[]` entry (`componentKey`, `dimensionBadge`, `prerequisites`, `keyEquationsLatex`, optional `pedagogicalRhythm`) inside the target manifest (`src/registry/vol1-*.ts` .. `vol6-*.ts`).
2. **Build the Laboratory Component:** Place interactive components in `src/components/visualizations/<domain>/` using shared helpers from [`src/components/visualizations/primitives/`](../src/components/visualizations/primitives/index.ts):
   - Use `ThreeOrbitViewport` (or `createDemandDrivenRenderLoop` + `disposeThreeObject`) for 3D WebGL viewports.
   - Use `SvgCoordinatePlane2D` / `core2d` for interactive 2D SVG geometry.
   - Use `MathExpressionInput` + `compileMathExpression` for user-editable formulas.
3. **Register Dynamic Import:** Map the new `componentKey` via `next/dynamic` inside `LAB_COMPONENTS` in [`src/components/visualizations/DynamicLabRenderer.tsx`](../src/components/visualizations/DynamicLabRenderer.tsx) with `{ loading: renderLabLoading }` (`LabLoadingSkeleton`).
4. **Update Chapter Route Dispatcher:** If a chapter renders bespoke rich educational sections alongside `TopicPageShell`, wire it inside [`src/app/[volume]/[module]/[chapter]/page.tsx`](../src/app/%5Bvolume%5D/%5Bmodule%5D/%5Bchapter%5D/page.tsx).

### Non-Negotiable UI, Design & Accessibility Standards
- **Zero Gradients:** Flat solid hex surfaces (`#1E1F22` / `#25272C` Dark; `#FFFBE4` / `#F6F0D2` Light) and crisp `1px` borders only.
- **WCAG AA Adaptive Ink Tokens:** Use `var(--math-ink-*)` (or `getAdaptiveAccentInk(hex)` from `src/lib/accentInk.ts`) for text, badges, and headings—never raw pastel hex codes directly on Light Mode paper backgrounds.
- **Explicit Accessibility Semantics:**
  - Every `<input>`, `<select>`, `<textarea>`, and icon-only `<button>` must have an accessible label (`aria-label` or associated `<label>`).
  - Decorative Lucide icons inside labeled buttons must include `aria-hidden="true"`.
  - All `<KaTeXMath />` renders retain `role="math"`, and domain SVG diagrams declare `role="img"` + descriptive `aria-label`.
  - Keep fixed minimum heights or skeletons on dynamic blocks to preserve near-zero `CLS`.

---

## 4. Git & Maintenance Workflow

Per [`AGENTS.md`](../AGENTS.md):
1. Verify clean typechecking and static generation after changes (`npx tsc --noEmit` and `npm run build`).
2. Update milestone records in [`archive/01_CURRENT_STATUS.md`](../archive/01_CURRENT_STATUS.md) and [`archive/01_GLOBAL_STATUS.md`](../archive/01_GLOBAL_STATUS.md) when shipping significant curriculum or platform changes.
3. Commit cleanly on `main` and push to `origin/main`.

---

## 5. Production Deployment Checklist

1. Set `NEXT_PUBLIC_SITE_URL` in your hosting provider (e.g., Vercel) if deploying to a custom domain other than `https://wannamath.vercel.app`.
2. Deploy from branch `main`.
3. Verify live HTTP responses on the deployed origin for:
   - `/robots.txt`
   - `/sitemap.xml`
   - `/llms.txt` & `/llms-full.txt`
   - `/manifest.webmanifest`, `/opengraph-image`, `/twitter-image`, and `/pwa-icon/192`
4. Submit `/sitemap.xml` in Google Search Console and validate production Core Web Vitals via Google PageSpeed Insights.
