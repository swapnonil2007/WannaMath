# 00 — Master 6-Volume Textbook Architecture & Pedagogical Plan (`wanna math` v2.0)

## 1. Architectural Vision
**WannaMath (`wanna math`)** is a self-contained, multi-volume interactive Engineering Mathematics textbook built with Next.js 15 (App Router), TypeScript, KaTeX, Math.js, and synchronized 2D SVG / 3D WebGL (`Three.js`) interactive laboratories.

Version 2 scales the platform from a 4-topic multivariable integration prototype into a comprehensive **6-Volume Engineering Mathematics Textbook** governed by a strict **4-Tier Pedagogical Taxonomy**:

```text
Tier 1: Volume   (/[volume])                      -> Major university engineering mathematics course
Tier 2: Module   (/[volume]/[module])             -> Cohesive unit of 3–6 chapters sharing geometric intuition
Tier 3: Chapter  (/[volume]/[module]/[chapter])   -> Single self-contained lesson page rendered inside TopicPageShell
Tier 4: Lab      (#section-slug)                  -> Interactive 2D/3D visualization laboratory inside a chapter
```

---

## 2. Non-Negotiable Visual & Technical Invariants
1. **Strict Butterfly Palette & Zero Gradients (`archive/02_DESIGN_SYSTEM_TOKENS.md`):**
   - Dark Drafting Slate (`#1E1F22` canvas, `#26282C` panel, `#35383F` `1px` borders) and Warm Textbook Paper (`#FFFBE4` canvas, `#F6F0D0` panel, `#D5CEB2` borders).
   - Zero decorative multi-stop gradients on cards, headers, or backgrounds.
   - Semantic mathematical color mapping across all 2D/3D canvases and KaTeX equations (`#8D9FCE` Periwinkle, `#96B898` Sage Green, `#029091` Deep Teal, `#B95869` Crimson, `#D5658B` Dusty Rose, `#D35323` Persimmon, `#FBEAA4` Buttermilk Cream, `#AAA36D` Olive Khaki, `#976434` Ochre).
2. **Traditional Eye-Comfortable Math Typography:**
   - Academic prose in `Newsreader` serif, equations in `KaTeX_Main` (Computer Modern), UI labels in `IBM Plex Sans`, and live numerical readouts in `JetBrains Mono` (`tabular-nums`).
3. **Deterministic Math Engine & Custom Equation Typing:**
   - Every interactive laboratory integrates `src/lib/mathParser.ts` (`compileMathExpression` with `REAL_MATH_SCOPE`), `KaTeXMath.tsx`, and `MathExpressionInput.tsx` so learners can type custom equations and custom integration/domain bounds.

---

## 3. The 4-Step Pedagogical Chapter Rhythm
Every chapter page (`/[volume]/[module]/[chapter]`) follows a unified 4-step pedagogical rhythm:
1. **Step 1 — Physical & Geometric Question:** Plain-English engineering motivation and geometric hook framing *why* the mathematical tool exists before introducing notation.
2. **Step 2 — Interactive Visual Laboratory:** Hands-on 2D/3D parameter manipulation, slicing, homotopy morphing, and custom equation typing (`<MathExpressionInput />`).
3. **Step 3 — Color-Coded Symbolic Formalization:** Rigorous `KaTeX` definitions, theorems, and boundary derivations whose `\color{...}` macros directly mirror the Butterfly palette elements in the viewport.
4. **Step 4 — Edge Cases & Bridge to Next Chapter:** Singularities, orientation/domain pitfalls, engineering applications, and conceptual bridge to the next sequential chapter.

---

## 4. Complete 6-Volume Engineering Mathematics Curriculum Map

### Volume I: Single-Variable Calculus (`single-variable-calculus`) — Accent: `#8D9FCE`
- **Module 1.1: Limits & Continuity (`limits-continuity`)**
  - `1.1.1` $\varepsilon$-$\delta$ Neighborhoods & One-Sided Limits (`epsilon-delta-limits`)
  - `1.1.2` Continuity, Intermediate Value Theorem & Asymptotes (`continuity-ivt`)
- **Module 1.2: Differential Calculus (`differential-calculus`)**
  - `1.2.1` Secant-to-Tangent Homotopy & Instantaneous Rate (`secant-tangent-homotopy`)
  - `1.2.2` Local Linearity, Differentials & Newton-Raphson (`local-linearity-differentials`)
  - `1.2.3` Chain Rule, Implicit Differentiation & Related Rates (`chain-rule-kinematics`)
  - `1.2.4` Taylor Polynomials & Curvature Osculating Circles (`taylor-polynomials-curvature`)
- **Module 1.3: Single-Variable Integration (`integral-calculus`)**
  - `1.3.1` 1D Riemann Sums, Darboux Bounds & Definite Area (`riemann-sums-1d`)
  - `1.3.2` The Fundamental Theorem of Calculus: Accumulation vs. Slope (`fundamental-theorem-calculus`)
  - `1.3.3` Substitution ($u$-Sub) & Integration by Parts Geometry (`substitution-integration-by-parts`)
  - `1.3.4` Solids of Revolution: Disks, Washers & Cylindrical Shells (`solids-of-revolution`)
- **Module 1.4: Infinite Series & Power Series Convergence (`infinite-series`)**
  - `1.4.1` Sequences, Partial Sums & Geometric Convergence (`sequences-partial-sums`)
  - `1.4.2` Power Series, Radius of Convergence & Analytic Functions (`power-series-convergence`)

### Volume II: Linear Algebra & Space Geometry (`linear-algebra`) — Accent: `#96B898`
- **Module 2.1: Vectors, Span & Subspaces (`vectors-subspaces`)**
  - `2.1.1` Vectors, Linear Combinations & Span in 2D/3D (`vectors-linear-combinations`)
  - `2.1.2` Linear Independence, Basis & Change of Basis (`basis-change-of-basis`)
  - `2.1.3` The Four Fundamental Subspaces & Rank-Nullity (`four-fundamental-subspaces`)
- **Module 2.2: Matrices as Linear Transformations & Determinants (`linear-transformations`)**
  - `2.2.1` Matrix Multiplication as Composition of Transformations (`matrix-transformations-2d-3d`)
  - `2.2.2` Determinants as Oriented Area & Volume Scaling (`determinants-volume-scaling`)
  - `2.2.3` Orthogonality, Projections & Least-Squares Fitting (`orthogonality-least-squares`)
- **Module 2.3: Eigen-Systems, Diagonalization & SVD (`eigen-systems-svd`)**
  - `2.3.1` Eigenvalues, Eigenvectors & Invariant Directions (`eigenvalues-eigenvectors`)
  - `2.3.2` Spectral Theorem, Quadratic Forms & Principal Axes (`quadratic-forms-spectral`)
  - `2.3.3` Singular Value Decomposition (SVD) Geometry (`singular-value-decomposition`)

### Volume III: Multivariable & Vector Calculus (`multivariable-calculus`) — Accent: `#029091` *(ACTIVE VOLUME)*
- **Module 3.1: 3D Geometry & Multivariable Differentiation (`multivariable-differentiation`)**
  - `3.1.1` Surfaces, Level Curves & Contour Maps (`surfaces-level-curves`)
  - `3.1.2` Partial Derivatives & Tangent Planes (`partial-derivatives-tangent-planes`)
  - `3.1.3` The Gradient Vector & Directional Derivatives (`gradient-directional-derivatives`)
  - `3.1.4` Lagrange Multipliers & Constrained Optimization (`lagrange-multipliers`)
- **Module 3.2: Multiple Integrals & Coordinate Pullbacks (`multiple-integrals`)** *(PUBLISHED — 8 LIVE LABS)*
  - `3.2.1` Double Integrals & Fubini's Theorem (`double-integrals`) — Labs: `RiemannVolumeLab`, `IteratedOrderChangeLab`
  - `3.2.2` Triple Integrals, 6-Order Slicing & Density (`triple-integrals`) — Labs: `TripleIntegralOrderLab`, `TripleVoxelDensityLab`
  - `3.2.3` Curvilinear Coordinates: Polar, Cylindrical & Spherical (`coordinate-systems`) — Labs: `PolarCoordinateAreaLab`, `Curvilinear3DSurfacesAndElementLab`
  - `3.2.4` The Jacobian & Change of Variables Pullback (`jacobians`) — Labs: `DualGridMorphingAndTangentLab`, `JacobianIntegralPullbackLab`
- **Module 3.3: Vector Calculus & Integral Theorems (`vector-calculus`)**
  - `3.3.1` Vector Fields, Divergence & Curl (`vector-fields-divergence-curl`)
  - `3.3.2` Line Integrals: Work, Circulation & Conservative Fields (`line-integrals-work`)
  - `3.3.3` Green's Theorem: Microscopic Curl to Macroscopic Circulation (`greens-theorem`)
  - `3.3.4` Parametric Surfaces, Surface Integrals & Flux (`surface-integrals-flux`)
  - `3.3.5` Stokes' Theorem & Gauss's Divergence Theorem (`stokes-divergence-theorems`)

### Volume IV: Differential Equations & Dynamical Systems (`differential-equations`) — Accent: `#D35323`
- **Module 4.1: First-Order ODEs & Slope Fields (`first-order-odes`)**
  - `4.1.1` Direction Fields, Integral Curves & Picard Existence (`direction-fields-integral-curves`)
  - `4.1.2` Separable, Linear & Exact ODE Models (`separable-linear-odes`)
- **Module 4.2: Second-Order Linear ODEs & Oscillations (`second-order-oscillations`)**
  - `4.2.1` Harmonic Oscillators: Undamped, Underdamped & Overdamped (`damped-harmonic-oscillators`)
  - `4.2.2` Forced Oscillations, Resonance & Frequency Response (`forced-oscillations-resonance`)
- **Module 4.3: Systems of ODEs & Phase Plane Portraits (`phase-plane-systems`)**
  - `4.3.1` 2D Linear Phase Portraits: Nodes, Saddles, Spirals & Centers (`linear-phase-portraits`)
  - `4.3.2` Nonlinear Stability, Nullclines & Limit Cycles (`nonlinear-nullclines-limit-cycles`)
- **Module 4.4: Partial Differential Equations (`partial-differential-equations`)**
  - `4.4.1` The 1D/2D Heat Equation & Diffusive Smoothing (`heat-equation-diffusion`)
  - `4.4.2` The Wave Equation, Normal Modes & D'Alembert's Solution (`wave-equation-normal-modes`)

### Volume V: Transforms & Complex Analysis (`transforms-complex-analysis`) — Accent: `#D5658B`
- **Module 5.1: Complex Numbers & Conformal Mappings (`complex-functions-conformal`)**
  - `5.1.1` Complex Plane, Euler's Formula & Roots of Unity (`euler-formula-complex-plane`)
  - `5.1.2` Analyticity, Cauchy-Riemann Equations & Conformal Grids (`cauchy-riemann-conformal`)
- **Module 5.2: Contour Integration & Residue Theorem (`contour-integration`)**
  - `5.2.1` Complex Line Integrals & Cauchy's Integral Formula (`cauchy-integral-formula`)
  - `5.2.2` Poles, Essential Singularities & Residue Calculus (`poles-residue-theorem`)
- **Module 5.3: Laplace Transforms & s-Plane Poles/Zeros (`laplace-transforms`)**
  - `5.3.1` The $s$-Plane Surface, Poles/Zeros & Region of Convergence (`s-plane-poles-zeros`)
  - `5.3.2` Impulse Response, Step Response & Convolution (`impulse-response-convolution`)
- **Module 5.4: Fourier Series & Fourier Transforms (`fourier-analysis`)**
  - `5.4.1` Orthogonal Harmonics, Epicycles & Gibbs Phenomenon (`fourier-series-gibbs`)
  - `5.4.2` Continuous Fourier Transform & Time-Frequency Duality (`fourier-transform-spectra`)

### Volume VI: Probability, Statistics & Numerical Methods (`probability-numerical-methods`) — Accent: `#AAA36D`
- **Module 6.1: Engineering Probability & Joint Distributions (`probability-distributions`)**
  - `6.1.1` Continuous PDFs, CDFs & Expectation Integrals (`continuous-pdfs-cdfs`)
  - `6.1.2` Joint Bivariate Distributions, Marginalization & Covariance (`joint-bivariate-distributions`)
- **Module 6.2: Numerical Quadrature, Root-Finding & ODE Solvers (`numerical-methods`)**
  - `6.2.1` Trapezoidal, Simpson's & Gauss-Legendre Quadrature (`numerical-quadrature-error`)
  - `6.2.2` Euler, Heun & Runge-Kutta (RK4) Trajectory Stepping (`runge-kutta-ode-solvers`)

---

## 5. Target Folder & Module Layout

```text
Integral_vis/
├── AGENTS.md
├── archive/
│   ├── 00_MASTER_TEXTBOOK_PLAN.md      # This master v2.0 6-Volume textbook architecture plan
│   ├── 01_GLOBAL_STATUS.md             # 6-Volume status matrix (published / in-progress / planned)
│   ├── 02_DESIGN_SYSTEM_TOKENS.md      # Butterfly palette & typography rules
│   ├── 03_ADDING_NEW_TOPICS_GUIDE.md   # 4-tier chapter & lab authoring guide
│   ├── phase_logs/                     # Historical v1.0 Phase 1–5 logs
│   └── volumes/
│       └── vol_03_multivariable/       # Volume III module logs & migration records
└── src/
    ├── registry/
    │   ├── types.ts                    # Strict 4-Tier TypeScript interfaces (Volume, Module, Chapter, Lab)
    │   ├── vol1-single-variable.ts     # Volume I registry
    │   ├── vol2-linear-algebra.ts      # Volume II registry
    │   ├── vol3-multivariable.ts       # Volume III registry (3.1, 3.2 published, 3.3)
    │   ├── vol4-differential-equations.ts # Volume IV registry
    │   ├── vol5-transforms-complex.ts  # Volume V registry
    │   ├── vol6-probability-numerical.ts  # Volume VI registry
    │   ├── index.ts                    # Unified lookup & traversal helpers
    │   └── curriculum.ts               # Backwards-compatible exports + semantic palette
    ├── app/
    │   ├── page.tsx                    # 6-Volume Textbook Hub + Live Volume III Showcase
    │   ├── roadmap/page.tsx            # Full 6-Volume Curriculum Matrix & Track Status
    │   ├── [volume]/
    │   │   ├── page.tsx                # Tier 1: Volume Overview Page
    │   │   └── [module]/
    │   │       ├── page.tsx            # Tier 2: Module Overview Page
    │   │       └── [chapter]/
    │   │           └── page.tsx        # Tier 3: Chapter Page (renders published labs or structured syllabus shell)
    │   └── calculus/                   # Legacy routes redirected via next.config.ts to /multivariable-calculus/...
    └── components/
        ├── layout/
        │   ├── Navbar.tsx              # Header with 6-Volume Textbook Drawer trigger & theme toggle
        │   ├── TextbookSidebar.tsx     # Collapsible 6-Volume Table of Contents Drawer
        │   ├── TopicPageShell.tsx      # 4-Tier Breadcrumbs, Prerequisite Chips, Labs, Prev/Next Chapter Nav
        │   └── Footer.tsx              # 6-Volume Index & Archive Reference Footer
        └── visualizations/
            ├── primitives/             # Shared 2D/3D canvas primitives (Track 1)
            ├── double-integrals/       # Chapter 3.2.1 Labs
            ├── triple-integrals/       # Chapter 3.2.2 Labs
            ├── coordinate-systems/     # Chapter 3.2.3 Labs
            └── jacobians/              # Chapter 3.2.4 Labs
```

---

## 6. Phased v2.0 Expansion Roadmap

- **Phase A (Current): Modular 6-Volume Registry, 4-Tier Routing & Textbook Navigation UI**
  - Create `src/registry/types.ts`, `vol1`–`vol6` registry modules, and `src/registry/index.ts`.
  - Implement `/[volume]`, `/[volume]/[module]`, and `/[volume]/[module]/[chapter]` routes with permanent `/calculus/*` redirects.
  - Upgrade `TopicPageShell.tsx` with 4-tier breadcrumbs, prerequisite chips, and cross-module Prev/Next navigation, and add `TextbookSidebar.tsx`.
- **Phase B (Track 1): Shared Visualization Primitives (`src/components/visualizations/primitives/`)**
  - Extract reusable 3D Orbit stage, coordinate axes/cages, 2D SVG coordinate plane, and numerical quadrature helpers.
- **Phase C (Track 2): Volume III, Module 3.1 (`multivariable-differentiation`)**
  - Build interactive laboratories for Chapters `3.1.1` (Surfaces & Contours), `3.1.2` (Partial Derivatives & Tangent Planes), `3.1.3` (Gradient & Directional Derivatives), and `3.1.4` (Lagrange Multipliers).
- **Phase D (Track 3): Volume III, Module 3.3 (`vector-calculus`)**
  - Build interactive laboratories for Chapters `3.3.1` (Vector Fields, Div & Curl), `3.3.2` (Line Integrals), `3.3.3` (Green's Theorem), `3.3.4` (Surface Flux Integrals), and `3.3.5` (Stokes' & Divergence Theorems).
- **Subsequent Phases:** Volumes I, II, IV, V, and VI module buildouts.
