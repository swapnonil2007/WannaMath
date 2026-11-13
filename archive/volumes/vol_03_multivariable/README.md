# Volume III — Multivariable & Vector Calculus (`multivariable-calculus`)

## Module 3.1 Build Index (`differential-calculus` / legacy `multivariable-differentiation`)
All 4 foundational chapters of **Module 3.1** are live, and a **6-Phase Differential Calculus Expansion** ([`DIFFERENTIAL_CALCULUS_PLAN.md`](./DIFFERENTIAL_CALCULUS_PLAN.md)) is queued next to unify Module `3.1` under **Differential Calculus** (`3.1.1`–`3.1.11`) including a nested **Differential Equations** sub-parent (`3.1.9`–`3.1.11`):

1. **Chapter `3.1.1` — Surfaces, Level Curves & Contour Maps (`surfaces-level-curves`)** *(Published)*
   - Lab: `SurfaceContourSlicerLab` (`src/components/visualizations/multivariable-differentiation/SurfaceContourSlicerLab.tsx`)
2. **Chapter `3.1.2` — Partial Derivatives, Mixed Partials, Chain Rule & Tangent Planes (`partial-derivatives-tangent-planes`)** *(Published — Deepened in Phase 2)*
   - Labs: `PartialDerivativeTangentPlaneLab`, `HigherOrderChainImplicitLab` (`src/components/visualizations/multivariable-differentiation/`)
3. **Chapter `3.1.3` — The Gradient Vector & Directional Derivatives (`gradient-directional-derivatives`)** *(Published)*
   - Lab: `GradientDirectionalDerivativeLab` (`src/components/visualizations/multivariable-differentiation/GradientDirectionalDerivativeLab.tsx`)
4. **Chapter `3.1.4` — Lagrange Multipliers & Constrained Optimization (`lagrange-multipliers`)** *(Published)*
   - Lab: `LagrangeMultipliersLab` (`src/components/visualizations/multivariable-differentiation/LagrangeMultipliersLab.tsx`)
5. **Chapter `3.1.5` — Multivariable Limits, Continuity & Differentiability (`limits-and-differentiability`)** *(Published — Phase 1)*
   - Labs: `MultivariableLimitsPathsLab`, `DifferentiabilityErrorConeLab` (`src/components/visualizations/multivariable-differentiation/`)
6. **Chapter `3.1.6` — Taylor Expansions: Single-Variable & Multivariable (`taylor-expansions`)** *(Published — Phase 2)*
   - Labs: `SingleVariableTaylorLab`, `MultivariableTaylorHessianLab` (`src/components/visualizations/multivariable-differentiation/`)
7. **Chapter `3.1.7` — Homogeneous Functions & Euler's Theorems (`homogeneous-functions-eulers-theorem`)** *(Published — Phase 3)*
   - Labs: `HomogeneousScalingRayLab`, `EulersTheoremSecondOrderLab` (`src/components/visualizations/multivariable-differentiation/`)
8. **Chapter `3.1.8` — Maxima & Minima: General Method & Second Derivative Test (`maxima-minima-extrema`)** *(Published — Phase 3)*
   - Labs: `HessianSecondDerivativeTestLab`, `GeneralMethodDegenerateExtremaLab` (`src/components/visualizations/multivariable-differentiation/`)
9. **Queued Expansion Chapters (`3.1.9` – `3.1.11`, Nested Differential Equations Sub-Parent):** See [`DIFFERENTIAL_CALCULUS_PLAN.md`](./DIFFERENTIAL_CALCULUS_PLAN.md) Phases 4–6.

---

## Module 3.3 Build Index (`vector-calculus` — PUBLISHED)
All 5 chapters and 5 interactive laboratories of **Module 3.3 (`Vector Calculus & Integral Theorems`)** are live under `/multivariable-calculus/vector-calculus/[chapter]`:

1. **Chapter `3.3.1` — Vector Fields, Divergence & Curl (`vector-fields-divergence-curl`)**
   - Lab: `DivCurlProbeLab` (`src/components/visualizations/vector-calculus/DivCurlProbeLab.tsx`)
2. **Chapter `3.3.2` — Line Integrals: Work & Circulation (`line-integrals-work`)**
   - Lab: `LineIntegralWorkLab` (`src/components/visualizations/vector-calculus/LineIntegralWorkLab.tsx`)
3. **Chapter `3.3.3` — Green's Theorem (`greens-theorem`)**
   - Lab: `GreensTheoremLab` (`src/components/visualizations/vector-calculus/GreensTheoremLab.tsx`)
4. **Chapter `3.3.4` — Surface Integrals & Flux (`surface-integrals-flux`)**
   - Lab: `SurfaceFluxLab` (`src/components/visualizations/vector-calculus/SurfaceFluxLab.tsx`)
5. **Chapter `3.3.5` — Stokes' Theorem & The Divergence Theorem (`stokes-divergence-theorems`)**
   - Lab: `StokesDivergenceLab` (`src/components/visualizations/vector-calculus/StokesDivergenceLab.tsx`)

---

## Module 3.2 Build Index (`integral-calculus` — PUBLISHED)
All 6 chapters and 12 interactive laboratories of **Module 3.2 (`Integral Calculus`)** are live under `/multivariable-calculus/integral-calculus/[chapter]` (with permanent redirects from `/multivariable-calculus/multiple-integrals/*`):

1. **Chapter `3.2.1` — Double Integrals & Fubini's Theorem (`double-integrals`)**
   - Labs: `RiemannVolumeLab`, `IteratedOrderChangeLab`
   - Historical Log: [`../../phase_logs/PHASE_02_DOUBLE_INTEGRALS.md`](../../phase_logs/PHASE_02_DOUBLE_INTEGRALS.md)
2. **Chapter `3.2.2` — Triple Integrals, 6-Order Slicing & Density (`triple-integrals`)**
   - Labs: `TripleIntegralOrderLab`, `TripleVoxelDensityLab`
   - Historical Log: [`../../phase_logs/PHASE_03_TRIPLE_INTEGRALS.md`](../../phase_logs/PHASE_03_TRIPLE_INTEGRALS.md)
3. **Chapter `3.2.3` — Curvilinear Coordinates: Polar, Cylindrical & Spherical (`coordinate-systems`)**
   - Labs: `PolarCoordinateAreaLab`, `Curvilinear3DSurfacesAndElementLab`
   - Historical Log: [`../../phase_logs/PHASE_04_COORDINATE_SYSTEMS.md`](../../phase_logs/PHASE_04_COORDINATE_SYSTEMS.md)
4. **Chapter `3.2.4` — The Jacobian & Change of Variables Pullback (`jacobians`)**
   - Labs: `DualGridMorphingAndTangentLab`, `JacobianIntegralPullbackLab`
   - Historical Log: [`../../phase_logs/PHASE_05_JACOBIANS.md`](../../phase_logs/PHASE_05_JACOBIANS.md)
5. **Chapter `3.2.5` — Convergence & Divergence (`convergence-and-divergence`)**
   - Labs: `ImproperIntegralConvergenceLab`, `ConvergenceTestsTutorialLab` (`src/components/visualizations/integral-calculus/`)
6. **Chapter `3.2.6` — Gamma & Beta Functions (`gamma-and-beta-functions`)**
   - Labs: `GammaFunctionLab`, `BetaFunctionLab` (`src/components/visualizations/integral-calculus/`)
7. **Foundation & Design System Log:**
   - Historical Log: [`../../phase_logs/PHASE_01_FOUNDATION.md`](../../phase_logs/PHASE_01_FOUNDATION.md)
