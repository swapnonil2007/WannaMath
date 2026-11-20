# Visualization Engine, Design System & Symbolic Math Compiler

This document covers the mathematical rendering pipeline, Light/Dark Butterfly palette tokens, adaptive WCAG AA math ink system, live symbolic expression parser, and shared 2D/3D numerical visualization primitives.

---

## 1. Visual System & Strict No-Gradient Policy

Defined in [`src/app/globals.css`](../src/app/globals.css) and [`archive/02_DESIGN_SYSTEM_TOKENS.md`](../archive/02_DESIGN_SYSTEM_TOKENS.md):

1. **Flat Technical Surfaces:** No decorative multi-stop gradients are used on cards, headers, buttons, or viewports. Panels use solid hex surfaces paired with crisp `1px` structural borders (`--border-subtle`, `--border-strong`) over an orthogonal `28px × 28px` hairline drafting grid.
2. **Dual Color Schemes via `light-dark()` & `<meta name="color-scheme">`:**
   - **Drafting Dark Mode:** `#1E1F22` canvas, `#27292E` grid, `#25272C` panels, `#2D3037` elevated surfaces, `#FFFBE4` primary text.
   - **Warm Textbook Paper Light Mode:** `#FFFBE4` canvas, `#EFE8C8` grid, `#F6F0D2` panels, `#EDE4BE` elevated surfaces, `#1E1F22` primary text.
   - Theme switching in [`Navbar.tsx`](../src/components/layout/Navbar.tsx) writes `"dark"` / `"light"` (or follows system preference) to `localStorage` and updates `<meta name="color-scheme">`, matched immediately by CSS `&:has(> head > meta[name="color-scheme"][content="..."])`.
3. **High-Contrast Keyboard & Forced Colors:** Implements `:focus-visible` outlines (`2px solid var(--accent-color)`) and `@media (forced-colors: active)` border/indicator rules.

### Semantic Mathematical Butterfly Palette & Adaptive Inks

Every variable and geometric object keeps a consistent mathematical color identity defined in `SEMANTIC_MATH_PALETTE` ([`src/registry/curriculum.ts`](../src/registry/curriculum.ts)) and mapped to theme-adaptive WCAG AA text inks via [`src/lib/accentInk.ts`](../src/lib/accentInk.ts) (`getAdaptiveAccentInk`):

| Semantic Token | Geometry Hex | Adaptive Dark Ink | Adaptive Light Ink | Mathematical Meaning |
| :--- | :--- | :--- | :--- | :--- |
| `--math-var-x` | `#8D9FCE` | `#8D9FCE` | `#3B4D7A` | Primary $x$-axis, outer variable ($u$), Type I vertical slices |
| `--math-var-y` | `#96B898` | `#96B898` | `#325B36` | Primary $y$-axis, middle variable ($v$), Type II horizontal slices |
| `--math-var-z` | `#029091` | `#28B7B8` | `#016869` | Primary $z$-axis, inner variable ($\rho$), 3D interior volume / rays |
| `--math-bound-upper` | `#B95869` | `#DF7E90` | `#8A3242` | Upper / exit boundary curves $g_2(x)$, $u_2(x,y)$ |
| `--math-bound-lower` | `#D5658B` | `#E37CA0` | `#932D52` | Lower / entry boundary curves $g_1(x)$, angular sweeps $\theta, \phi$ |
| `--math-active-sweep` | `#D35323` | `#EF7547` | `#9E360E` | Active sweep planes, Jacobian determinants $\det(J)$, handle probes |
| `--math-diff-element` | `#FBEAA4` | `#FBEAA4` | `#6D5810` | Differential elements $dA, dV$ |
| `--math-grid-accent` | `#AAA36D` | `#B2AB75` | `#5E582A` | Coordinate grids, reference frames, tangent triads ($\mathbf{r}_u, \mathbf{r}_v$) |
| `--math-earth-accent` | `#976434` | `#D5995E` | `#764A1F` | Secondary ochre / earth annotation markers |

> **Always-Dark Container Override:** 3D Three.js containers (`#18191C`, `#1E1F22`, `#25272C`, `#26282C`, `#35383F`) in `globals.css` scope `--math-ink-*` back to their dark-mode tokens so overlay legends inside WebGL viewports retain high contrast even when Reading Light Mode is active.

---

## 2. Typography & Adaptive KaTeX Pipeline

Root fonts are configured in [`src/app/layout.tsx`](../src/app/layout.tsx) and [`src/app/globals.css`](../src/app/globals.css):

- **Academic Prose:** `.font-math-serif` (`Newsreader` via `next/font/google`, fallback `"STIX Two Text", Georgia, Cambria, serif`)
- **UI Controls & Navigation:** `IBM_Plex_Sans`
- **Live Numerical Telemetry:** `.font-tabular-mono` (`JetBrains_Mono` with `font-variant-numeric: tabular-nums` so interactive slider readouts never cause horizontal jitter)
- **Equations & Symbols (`KaTeXMath`):** [`src/components/math/KaTeXMath.tsx`](../src/components/math/KaTeXMath.tsx) runs `katex.renderToString`, rewrites inline `\textcolor{#HEX}` spans through `KATEX_COLOR_TOKEN_MAP` / `adaptKatexInkColors()` to `var(--math-ink-*)`, and wraps outputs with `role="math"` and explicit `aria-label`.

---

## 3. Live Symbolic Expression Parser (`mathParser.ts`)

User-editable equation inputs across calculators and integrators use [`MathExpressionInput.tsx`](../src/components/math/MathExpressionInput.tsx) backed by [`src/lib/mathParser.ts`](../src/lib/mathParser.ts):

- **Tree-Shaken `mathjs/number` Build:** Imports only discrete arithmetic, comparison, logical, factorial, and `parseDependencies` from `mathjs/number` to avoid pulling complex/matrix runtime bloat into client bundles.
- **Safe Real-Valued Domain Evaluation (`REAL_MATH_SCOPE`):** `ln(` normalizes to `log(`; domain boundary expressions such as `sqrt(1 - x^2 - y^2)` outside the disk smoothly clamp to `0` rather than throwing `Complex` errors or `NaN` spikes during mesh/contour generation.
- **Symbol Whitelisting:** `compileMathExpression(expressionStr, allowedVars, fallbackValue)` validates symbol nodes against `allowedVars` plus `ALLOWED_FUNCTIONS_AND_CONSTANTS` (`sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`, `sqrt`, `cbrt`, `exp`, `log`, `ln`, `abs`, `min`, `max`, `pow`, `pi`, `e`) and returns `{ raw, tex, valid, error, evaluate }`.

---

## 4. Shared Visualization & Numerical Primitives (`src/components/visualizations/primitives/`)

All 82 interactive laboratories import reusable 2D, 3D, and numerical routines from [`primitives/index.ts`](../src/components/visualizations/primitives/index.ts) (with lightweight 2D-only imports available via [`core2d.ts`](../src/components/visualizations/primitives/core2d.ts)):

### A. 3D WebGL & Demand-Driven Scheduling
- **[`ThreeOrbitViewport.tsx`](../src/components/visualizations/primitives/ThreeOrbitViewport.tsx):** Managed WebGL viewport with `THREE.PerspectiveCamera`, `OrbitControls` damping, pixel ratio clamping (`Math.min(window.devicePixelRatio, 2)`), reset control, and automatic disposal.
- **[`demandRenderLoop.ts`](../src/components/visualizations/primitives/demandRenderLoop.ts) (`createDemandDrivenRenderLoop`):** Renders frames only while `OrbitControls` are dragging/damping, `requestRender(frames)` is triggered by slider/scene changes, or resize occurs; pauses automatically when idle, off-screen (`IntersectionObserver`), or tab-hidden (`document.hidden`).
- **[`threeScenePrimitives.ts`](../src/components/visualizations/primitives/threeScenePrimitives.ts):**
  - `mathToThreeVec3(x, y, z)` — Converts mathematical right-handed $z$-up coordinates $(x, y, z)$ into Three.js $y$-up world space $(x, z, -y)$.
  - `disposeThreeObject(root)` — Recursively disposes `BufferGeometry` and `Material` instances on scene rebuild or unmount.
  - `createCoordinateAxesAndGrid()`, `createParametricSurfaceMesh()`, `createVectorArrow3D()`, and `createImplicitLevelSurfaceMesh()` (3D level-surface extractor).

### B. 2D Plotting, Contours & Quadrature
- **[`SvgCoordinatePlane2D.tsx`](../src/components/visualizations/primitives/SvgCoordinatePlane2D.tsx):** Accessible interactive 2D SVG plane (`xRange`, `yRange`, `onSelectPoint` click-to-world probing, `toSvgX`, `toSvgY`, `toSvgPoint`, configurable `ariaLabel`).
- **[`contourMarchingSquares.ts`](../src/components/visualizations/primitives/contourMarchingSquares.ts):** `extractLevelCurveSegments()` marching-squares solver for extracting $f(x,y) = c$ contours over arbitrary rectangular domains.
- **[`quadrature.ts`](../src/components/visualizations/primitives/quadrature.ts):**
  - `integrate1DGaussLegendre()` — 1D composite 5-point Gauss–Legendre integrator.
  - `integrate2DIterated()` & `integrate3DIterated()` — Iterated variable-bound midpoint solvers.
  - `computePartialDerivatives2D()` & `computePartialDerivatives3D()` — Central finite-difference derivative estimators.
  - `computeJacobian2D()` — Finite-difference $2\times 2$ Jacobian determinant solver.
  - `gammaReal()` & `betaReal()` — Real-valued Eulerian Gamma and Beta evaluators.
