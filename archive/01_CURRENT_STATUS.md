# 01 — Current Project Status (`wanna math` v2.0)

> **Last Updated:** Version 2.0 Phase A, Track 1 & Track 2 Completed — Volume III Modules 3.1 & 3.2 (`8/13` Chapters, `12` Interactive Labs) Live
> **See Full 6-Volume Matrix:** [`archive/01_GLOBAL_STATUS.md`](./01_GLOBAL_STATUS.md) & [`archive/00_MASTER_TEXTBOOK_PLAN.md`](./00_MASTER_TEXTBOOK_PLAN.md)
> **Active Branch:** `main` (`https://github.com/swapnonil2007/WannaMath.git`)

---

## v2.0 Architecture & v1.0 Migration Summary

| Milestone | Title | Status | Summary |
| :--- | :--- | :--- | :--- |
| **v1.0 Phases 1–5** | **Volume III, Module 3.2 (`multiple-integrals`) — 8 Interactive Labs** | **PUBLISHED** | All 8 interactive labs (`RiemannVolumeLab`, `IteratedOrderChangeLab`, `TripleIntegralOrderLab`, `TripleVoxelDensityLab`, `PolarCoordinateAreaLab`, `Curvilinear3DSurfacesAndElementLab`, `DualGridMorphingAndTangentLab`, `JacobianIntegralPullbackLab`) + `HeroIntegralPreview` and `<MathExpressionInput />` custom equation/limit typing are live under `/multivariable-calculus/multiple-integrals/[chapter]`. |
| **v2.0 Phase A** | **6-Volume Modular Registry, 4-Tier Routing & Textbook Navigation UI** | **COMPLETED** | Built `src/registry/types.ts`, `vol1`–`vol6` registry modules, `src/registry/index.ts`, hierarchical routes `/[volume]`, `/[volume]/[module]`, `/[volume]/[module]/[chapter]`, permanent `/calculus/*` redirects, 4-tier `TopicPageShell.tsx` with Prerequisite Chips, and collapsible 6-Volume `TextbookSidebar.tsx` TOC drawer. |
| **Track 1 (Phase B)** | **Shared Visualization Primitives (`src/components/visualizations/primitives/`)** | **COMPLETED** | Extracted `ThreeOrbitViewport.tsx`, `threeScenePrimitives.ts` (`mathToThreeVec3`, `disposeThreeObject`, `createCoordinateAxesAndGrid`, `createParametricSurfaceMesh`, `createVectorArrow3D`), `SvgCoordinatePlane2D.tsx`, `contourMarchingSquares.ts`, and `quadrature.ts` (`integrate1DGaussLegendre`, `integrate2DIterated`, `integrate3DIterated`, `computePartialDerivatives2D`, `computeJacobian2D`). |
| **Track 2 (Phase C)** | **Volume III, Module 3.1 (`multivariable-differentiation`) — 4 Interactive Labs** | **PUBLISHED** | Built Chapters `3.1.1` (`SurfaceContourSlicerLab.tsx`), `3.1.2` (`PartialDerivativeTangentPlaneLab.tsx`), `3.1.3` (`GradientDirectionalDerivativeLab.tsx`), and `3.1.4` (`LagrangeMultipliersLab.tsx`) with custom math expression typing and synchronized 2D/3D canvases. |
| **Track 3 (Next Option)** | **Volume III, Module 3.3 (`vector-calculus`)** | READY | Build Chapters `3.3.1` (Vector Fields, Div & Curl), `3.3.2` (Line Integrals), `3.3.3` (Green's Theorem), `3.3.4` (Surface Integrals & Flux), and `3.3.5` (Stokes' & Divergence Theorems). |
