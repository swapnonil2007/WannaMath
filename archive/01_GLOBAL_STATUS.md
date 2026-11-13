# 01 — Global 6-Volume Curriculum & Build Status (`wanna math` v2.0)

> **Last Updated:** Phase A, Track 1, Track 2, Track 3 & Integral Calculus Expansion Completed — **Volume III (`15/15` Chapters, `21` Interactive Labs) 100% PUBLISHED**
> **Active Branch:** `main` (`https://github.com/swapnonil2007/WannaMath.git`)
> **Master Architecture Plan:** [`archive/00_MASTER_TEXTBOOK_PLAN.md`](./00_MASTER_TEXTBOOK_PLAN.md)

---

## 1. Executive Summary of Volumes I–VI

| Volume | Slug | Accent Token | Modules | Chapters | Status |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Volume I: Single-Variable Calculus** | `/single-variable-calculus` | `#8D9FCE` (Periwinkle) | 4 | 12 | `planned` |
| **Volume II: Linear Algebra & Space Geometry** | `/linear-algebra` | `#96B898` (Sage Green) | 3 | 9 | `planned` |
| **Volume III: Multivariable & Vector Calculus** | `/multivariable-calculus` | `#029091` (Deep Teal) | 3 | 15 | **`published` (15/15 Chapters — 21 Labs Live)** |
| **Volume IV: Differential Equations & Dynamical Systems** | `/differential-equations` | `#D35323` (Persimmon) | 4 | 8 | `planned` |
| **Volume V: Transforms & Complex Analysis** | `/transforms-complex-analysis` | `#D5658B` (Dusty Rose) | 4 | 8 | `planned` |
| **Volume VI: Probability, Statistics & Numerical Methods** | `/probability-numerical-methods` | `#AAA36D` (Olive Gold) | 2 | 4 | `planned` |

---

## 2. Detailed Chapter Status Matrix — Volume III: Multivariable & Vector Calculus (`/multivariable-calculus`)

### Module 3.1: 3D Geometry & Multivariable Differentiation (`/multivariable-calculus/multivariable-differentiation`) — **ALL PUBLISHED**
| Chapter ID | Canonical Route | Title | Status | Live Interactive Component Keys |
| :--- | :--- | :--- | :--- | :--- |
| `3.1.1` | `/multivariable-calculus/multivariable-differentiation/surfaces-level-curves` | Surfaces, Level Curves & Contour Maps | **`published`** | `SurfaceContourSlicerLab` |
| `3.1.2` | `/multivariable-calculus/multivariable-differentiation/partial-derivatives-tangent-planes` | Partial Derivatives & Tangent Planes | **`published`** | `PartialDerivativeTangentPlaneLab` |
| `3.1.3` | `/multivariable-calculus/multivariable-differentiation/gradient-directional-derivatives` | The Gradient Vector & Directional Derivatives | **`published`** | `GradientDirectionalDerivativeLab` |
| `3.1.4` | `/multivariable-calculus/multivariable-differentiation/lagrange-multipliers` | Lagrange Multipliers & Constrained Optimization | **`published`** | `LagrangeMultipliersLab` |

### Module 3.2: Integral Calculus (`/multivariable-calculus/integral-calculus`) — **ALL PUBLISHED**
| Chapter ID | Canonical Route | Title | Status | Live Interactive Component Keys |
| :--- | :--- | :--- | :--- | :--- |
| `3.2.1` | `/multivariable-calculus/integral-calculus/double-integrals` | Double Integrals & Fubini's Theorem | **`published`** | `RiemannVolumeLab`, `IteratedOrderChangeLab` |
| `3.2.2` | `/multivariable-calculus/integral-calculus/triple-integrals` | Triple Integrals, 6-Order Slicing & Density | **`published`** | `TripleIntegralOrderLab`, `TripleVoxelDensityLab` |
| `3.2.3` | `/multivariable-calculus/integral-calculus/coordinate-systems` | Curvilinear Coordinates: Polar, Cylindrical & Spherical | **`published`** | `PolarCoordinateAreaLab`, `Curvilinear3DSurfacesAndElementLab` |
| `3.2.4` | `/multivariable-calculus/integral-calculus/jacobians` | The Jacobian & Change of Variables Pullback | **`published`** | `DualGridMorphingAndTangentLab`, `JacobianIntegralPullbackLab` |
| `3.2.5` | `/multivariable-calculus/integral-calculus/convergence-and-divergence` | Convergence & Divergence (Improper Integrals & Series Tests) | **`published`** | `ImproperIntegralConvergenceLab`, `ConvergenceTestsTutorialLab` |
| `3.2.6` | `/multivariable-calculus/integral-calculus/gamma-and-beta-functions` | Gamma & Beta Functions | **`published`** | `GammaFunctionLab`, `BetaFunctionLab` |

> **Legacy Route Redirects:** `/calculus` $\rightarrow$ `/multivariable-calculus`, `/calculus/:slug` $\rightarrow$ `/multivariable-calculus/integral-calculus/:slug`, and `/multivariable-calculus/multiple-integrals(/*)` $\rightarrow$ `/multivariable-calculus/integral-calculus(/*)` are permanently redirected in `next.config.ts`.
> **Historical Build Logs:** Preserved in [`archive/phase_logs/`](./phase_logs/) and indexed in [`archive/volumes/vol_03_multivariable/README.md`](./volumes/vol_03_multivariable/README.md).

### Module 3.3: Vector Calculus & Integral Theorems (`/multivariable-calculus/vector-calculus`) — **ALL PUBLISHED**
| Chapter ID | Canonical Route | Title | Status | Live Interactive Component Keys |
| :--- | :--- | :--- | :--- | :--- |
| `3.3.1` | `/multivariable-calculus/vector-calculus/vector-fields-divergence-curl` | Vector Fields, Divergence & Curl | **`published`** | `DivCurlProbeLab` |
| `3.3.2` | `/multivariable-calculus/vector-calculus/line-integrals-work` | Line Integrals (Work & Circulation) | **`published`** | `LineIntegralWorkLab` |
| `3.3.3` | `/multivariable-calculus/vector-calculus/greens-theorem` | Green's Theorem | **`published`** | `GreensTheoremLab` |
| `3.3.4` | `/multivariable-calculus/vector-calculus/surface-integrals-flux` | Surface Integrals & Flux | **`published`** | `SurfaceFluxLab` |
| `3.3.5` | `/multivariable-calculus/vector-calculus/stokes-divergence-theorems` | Stokes' Theorem & The Divergence Theorem | **`published`** | `StokesDivergenceLab` |

---

## 3. Shared Visualization Primitives & Completed Volume III Tracks
1. **Track 1 (COMPLETED — `4747a9f`):** Extracted shared visualization & numerical quadrature primitives inside [`src/components/visualizations/primitives/`](../src/components/visualizations/primitives/index.ts):
   - `ThreeOrbitViewport.tsx` — Reusable React + Three.js WebGL stage with `OrbitControls`, camera reset, and coordinate frame badge.
   - `threeScenePrimitives.ts` — `mathToThreeVec3`, `disposeThreeObject`, `createCoordinateAxesAndGrid`, `createParametricSurfaceMesh`, and `createVectorArrow3D`.
   - `SvgCoordinatePlane2D.tsx` — Accessible 2D SVG coordinate plane with `worldToSvgX/Y`, grid lines, and click-to-world coordinates.
   - `contourMarchingSquares.ts` — `extractLevelCurveSegments` marching-squares 2D contour solver.
   - `quadrature.ts` — `integrate1DGaussLegendre`, `integrate2DIterated`, `integrate3DIterated`, `computePartialDerivatives2D`, and `computeJacobian2D`.
2. **Track 2 (COMPLETED — `c6d4bc1`):** Built **Volume III, Module 3.1 (`multivariable-differentiation`)** — Chapters `3.1.1` through `3.1.4` (`SurfaceContourSlicerLab`, `PartialDerivativeTangentPlaneLab`, `GradientDirectionalDerivativeLab`, `LagrangeMultipliersLab`).
3. **Track 3 (COMPLETED — `5aa336c`):** Built **Volume III, Module 3.3 (`vector-calculus`)** — Chapters `3.3.1` through `3.3.5` (`DivCurlProbeLab`, `LineIntegralWorkLab`, `GreensTheoremLab`, `SurfaceFluxLab`, `StokesDivergenceLab`).
4. **Module 3.2 Integral Calculus Expansion (COMPLETED):** Unified Module `3.2` under **Integral Calculus (`/multivariable-calculus/integral-calculus`)** and published Chapter `3.2.5` (`convergence-and-divergence`: `ImproperIntegralConvergenceLab`, `ConvergenceTestsTutorialLab`) and Chapter `3.2.6` (`gamma-and-beta-functions`: `GammaFunctionLab`, `BetaFunctionLab`), bringing **Volume III to `15/15` chapters (`21` interactive labs)**.
5. **Next Textbook Expansion Options:** **Volume I (`Single-Variable Calculus`)** or **Volume II (`Linear Algebra & Space Geometry`)**.
