# 01 — Global 6-Volume Curriculum & Build Status (`wanna math` v2.0)

> **Last Updated:** Phase A, Track 1 & Track 2 Completed — Volume III Modules 3.1 & 3.2 (`8/13` Chapters & `12` Interactive Labs) Live
> **Active Branch:** `main` (`https://github.com/swapnonil2007/WannaMath.git`)
> **Master Architecture Plan:** [`archive/00_MASTER_TEXTBOOK_PLAN.md`](./00_MASTER_TEXTBOOK_PLAN.md)

---

## 1. Executive Summary of Volumes I–VI

| Volume | Slug | Accent Token | Modules | Chapters | Status |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Volume I: Single-Variable Calculus** | `/single-variable-calculus` | `#8D9FCE` (Periwinkle) | 4 | 12 | `planned` |
| **Volume II: Linear Algebra & Space Geometry** | `/linear-algebra` | `#96B898` (Sage Green) | 3 | 9 | `planned` |
| **Volume III: Multivariable & Vector Calculus** | `/multivariable-calculus` | `#029091` (Deep Teal) | 3 | 13 | **`in-progress` (Modules 3.1 & 3.2 `published` — 12 Labs Live)** |
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

### Module 3.2: Multiple Integrals & Coordinate Pullbacks (`/multivariable-calculus/multiple-integrals`) — **ALL PUBLISHED**
| Chapter ID | Canonical Route | Title | Status | Live Interactive Component Keys |
| :--- | :--- | :--- | :--- | :--- |
| `3.2.1` | `/multivariable-calculus/multiple-integrals/double-integrals` | Double Integrals & Fubini's Theorem | **`published`** | `RiemannVolumeLab`, `IteratedOrderChangeLab` |
| `3.2.2` | `/multivariable-calculus/multiple-integrals/triple-integrals` | Triple Integrals, 6-Order Slicing & Density | **`published`** | `TripleIntegralOrderLab`, `TripleVoxelDensityLab` |
| `3.2.3` | `/multivariable-calculus/multiple-integrals/coordinate-systems` | Curvilinear Coordinates: Polar, Cylindrical & Spherical | **`published`** | `PolarCoordinateAreaLab`, `Curvilinear3DSurfacesAndElementLab` |
| `3.2.4` | `/multivariable-calculus/multiple-integrals/jacobians` | The Jacobian & Change of Variables Pullback | **`published`** | `DualGridMorphingAndTangentLab`, `JacobianIntegralPullbackLab` |

> **Legacy Route Redirects:** `/calculus` $\rightarrow$ `/multivariable-calculus` and `/calculus/:slug` $\rightarrow$ `/multivariable-calculus/multiple-integrals/:slug` are permanently redirected in `next.config.ts`.
> **Historical Build Logs:** Preserved in [`archive/phase_logs/`](./phase_logs/) and indexed in [`archive/volumes/vol_03_multivariable/README.md`](./volumes/vol_03_multivariable/README.md).

### Module 3.3: Vector Calculus & Integral Theorems (`/multivariable-calculus/vector-calculus`)
| Chapter ID | Slug | Title | Status | Interactive Labs |
| :--- | :--- | :--- | :--- | :--- |
| `3.3.1` | `vector-fields-divergence-curl` | Vector Fields, Divergence & Curl | `planned` | 2D/3D Flux Box & Paddlewheel Curl Probe |
| `3.3.2` | `line-integrals-work` | Line Integrals (Work & Circulation) | `planned` | Tangential Work Accumulator & Conservative Potential Lab |
| `3.3.3` | `greens-theorem` | Green's Theorem | `planned` | Microscopic Curl Cancellation Grid |
| `3.3.4` | `surface-integrals-flux` | Surface Integrals & Flux | `planned` | Oriented Normal Flux Canopy Inspector |
| `3.3.5` | `stokes-divergence-theorems` | Stokes' Theorem & The Divergence Theorem | `planned` | Boundary Rim Circulation & 3D Gauss Flux Balance |

---

## 3. Shared Visualization Primitives & Next Expansion Tracks
1. **Track 1 (COMPLETED):** Extracted shared visualization & numerical quadrature primitives inside [`src/components/visualizations/primitives/`](../src/components/visualizations/primitives/index.ts):
   - `ThreeOrbitViewport.tsx` — Reusable React + Three.js WebGL stage with `OrbitControls`, camera reset, and coordinate frame badge.
   - `threeScenePrimitives.ts` — `mathToThreeVec3`, `disposeThreeObject`, `createCoordinateAxesAndGrid`, `createParametricSurfaceMesh`, and `createVectorArrow3D`.
   - `SvgCoordinatePlane2D.tsx` — Accessible 2D SVG coordinate plane with `worldToSvgX/Y`, grid lines, and click-to-world coordinates.
   - `quadrature.ts` — `integrate1DGaussLegendre`, `integrate2DIterated`, `integrate3DIterated`, `computePartialDerivatives2D`, and `computeJacobian2D`.
2. **Track 2 (COMPLETED):** Built **Volume III, Module 3.1 (`multivariable-differentiation`)** — Chapters `3.1.1` through `3.1.4` (`SurfaceContourSlicerLab`, `PartialDerivativeTangentPlaneLab`, `GradientDirectionalDerivativeLab`, `LagrangeMultipliersLab`).
3. **Track 3 (Ready):** Build **Volume III, Module 3.3 (`vector-calculus`)** — Chapters `3.3.1` through `3.3.5`.
