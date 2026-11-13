# AGENTS.md — WannaMath (`wanna math` v2.0) Agent Handoff & Engineering Guide

Welcome! If you are a new AI agent or developer taking over this repository, **read this file first**. It is designed so you can understand the entire 6-Volume Engineering Mathematics Textbook architecture, 4-tier taxonomy, design constraints, git workflow, and current development phase within 60 seconds.

---

## 1. Quick Orientation & Archive Links

All project plans, design tokens, and volume/phase progress logs are stored in the [`/archive`](./archive) directory:

1. **[`archive/00_MASTER_TEXTBOOK_PLAN.md`](./archive/00_MASTER_TEXTBOOK_PLAN.md)** — **v2.0 MASTER PLAN:** 4-Tier Pedagogical Taxonomy (`Volume → Module → Chapter → Section/Lab`), complete 6-Volume Curriculum Map, 4-Step Chapter Rhythm, and folder architecture.
2. **[`archive/01_GLOBAL_STATUS.md`](./archive/01_GLOBAL_STATUS.md)** & **[`archive/01_CURRENT_STATUS.md`](./archive/01_CURRENT_STATUS.md)** — **READ THIS FIRST** to see which Volumes, Modules, and Chapters are `published`, `in-progress`, or `planned`.
3. **[`archive/02_DESIGN_SYSTEM_TOKENS.md`](./archive/02_DESIGN_SYSTEM_TOKENS.md)** — Strict color palette hex codes (from the user's butterfly reference sheet), semantic mathematical color roles, traditional math typography rules, and the **strict no-gradient policy**.
4. **[`archive/03_ADDING_NEW_TOPICS_GUIDE.md`](./archive/03_ADDING_NEW_TOPICS_GUIDE.md)** — Step-by-step guide for registering new chapters in `src/registry/volX-*.ts`, using shared visualization primitives (`src/components/visualizations/primitives/`), and building 4-tier chapter pages (`/[volume]/[module]/[chapter]`).
5. **[`archive/volumes/`](./archive/volumes/)** & **[`archive/phase_logs/`](./archive/phase_logs/)** — Volume-specific completion logs and preserved v1.0 Phase 1–5 logs.

---

## 2. Git & Repository Rules

- **Remote Repository:** `https://github.com/swapnonil2007/WannaMath.git`
- **Branch:** `main`
- **Commit Author & Push Identity (Mandatory):**
  - `user.name`: `swapnonil2007`
  - `user.email`: `swapnonil2007@gmail.com`
  - `credential.https://github.com.username`: `swapnonil2007` (configured so Git Credential Manager selects `swapnonil2007` when pushing to `origin/main`)
- **Workflow:** At the end of every phase or chapter milestone, update `archive/01_GLOBAL_STATUS.md` and `archive/01_CURRENT_STATUS.md`, verify `npm run build` passes with zero errors, and commit & push to `origin/main`.

---

## 3. Non-Negotiable Visual & Pedagogical Rules

1. **No Unnecessary Gradients:**
   - Do **not** use decorative multi-stop color gradients on backgrounds, cards, buttons, or headers.
   - Use flat, solid surfaces (`#1E1F22` dark drafting canvas, `#26282C` elevated panels, `#35383F` crisp `1px` borders in Dark Mode; `#FFFBE4` warm textbook ivory canvas, `#F6F0D0` panels in Light Mode).
2. **Restrained Semantic Color Palette:**
   - Use only the approved hex codes from the user's butterfly palette (documented in `archive/02_DESIGN_SYSTEM_TOKENS.md`).
   - Colors in visualizations must carry **consistent mathematical meaning** (`#8D9FCE` Periwinkle for $x$ / first variable / outer bound; `#96B898` Sage Green for $y$ / second variable / middle bound; `#029091` Deep Teal for $z$ / third variable / volume interior; `#B95869` Crimson & `#D5658B` Dusty Rose for upper/lower boundary curves; `#D35323` Persimmon for active sweep handles and Jacobian vectors; `#FBEAA4` Buttermilk Cream for differential elements $dA, dV$; `#AAA36D` Olive Gold for coordinate cages).
   - Never use color alone to convey UI state—always pair color highlights with explicit mathematical symbols ($x, y, z, u, v, J$), labels, or icons.
3. **Traditional & Eye-Comfortable Math Typography:**
   - **Prose / Explanations:** Academic serif (`Newsreader` / `Georgia` fallback).
   - **Equations & Symbols:** `KaTeX` (`KaTeX_Main` Computer Modern serif).
   - **UI Controls & Labels:** `IBM Plex Sans`.
   - **Numerical Readouts:** `JetBrains Mono` with `tabular-nums` so slider changes never cause layout shift.
4. **4-Tier Multi-Volume Textbook Architecture:**
   - Every chapter lives at `/[volume]/[module]/[chapter]` (for example, `/multivariable-calculus/multiple-integrals/double-integrals`) and is registered in `src/registry/vol1-single-variable.ts` through `src/registry/vol6-probability-numerical.ts` (aggregated in `src/registry/index.ts`).
   - Legacy `/calculus/*`, `/multivariable-calculus/multiple-integrals/*`, and `/multivariable-calculus/multivariable-differentiation/*` URLs redirect permanently to `/multivariable-calculus/integral-calculus/*` and `/multivariable-calculus/differential-calculus/*` via `next.config.ts` (the legacy route files in `src/app/calculus/*` also remain valid static fallbacks).

---

## 4. Key Folder Paths & Shared Primitives Conventions (v2.0)

- **Curriculum Registry (`src/registry/`):**
  - `src/registry/types.ts` — `VolumeMetadata`, `ModuleMetadata`, `ChapterMetadata`, `LabMetadata`, and `PedagogicalRhythm`.
  - `src/registry/vol1-single-variable.ts` .. `vol6-probability-numerical.ts` — Per-volume curriculum manifests.
  - `src/registry/index.ts` — Lookup helpers (`getVolumeBySlug`, `getModuleBySlugs`, `getChapterBySlugs`, `getChapterById`, `getAdjacentChapters`, `getAllResolvedChapters`).
- **4-Tier App Router Pages (`src/app/`):**
  - `src/app/[volume]/page.tsx` — Tier 1 Volume Overview.
  - `src/app/[volume]/[module]/page.tsx` — Tier 2 Module Overview.
  - `src/app/[volume]/[module]/[chapter]/page.tsx` — Tier 3 Chapter Lesson & Interactive Lab dispatcher wrapped in `TopicPageShell.tsx`.
- **Shared Visualization Primitives (`src/components/visualizations/primitives/`):**
  - Always import shared 3D/2D/numerical helpers from `@/components/visualizations/primitives`:
    - `ThreeOrbitViewport` — WebGL `OrbitControls` stage with camera reset and automatic geometry/material disposal.
    - `mathToThreeVec3`, `disposeThreeObject`, `createCoordinateAxesAndGrid`, `createParametricSurfaceMesh`, `createVectorArrow3D`.
    - `SvgCoordinatePlane2D` — Accessible 2D SVG coordinate plane with `toSvgX`, `toSvgY`, and click-to-world probing.
    - `extractLevelCurveSegments` — Marching-squares 2D level curve extractor.
    - `integrate1DGaussLegendre`, `integrate2DIterated`, `integrate3DIterated`, `computePartialDerivatives2D`, `computeJacobian2D`.
- **Math Expression Input (`src/components/math/MathExpressionInput.tsx`):**
  - Pass `allowedVars: string[]` and `prefixLatex?: string` (e.g., `prefixLatex="f(x,y) ="`).
  - `compileMathExpression(expr, allowedVars)` returns `{ raw, tex, valid, error, evaluate }` (use `.tex` for KaTeX strings).

---

## 5. Immediate Handoff Checkpoint (Next Step for Incoming Agent)

- **Completed & Pushed (`origin/main`):**
  - **v2.0 Phase A (`f849ddc`):** 6-Volume modular registry, 4-tier routing (`/[volume]/[module]/[chapter]`), `TopicPageShell.tsx` upgrade, and `TextbookSidebar.tsx` TOC drawer.
  - **v2.0 Track 1 (`4747a9f`):** Shared visualization & quadrature primitives in `src/components/visualizations/primitives/`.
  - **v2.0 Track 2 (`c6d4bc1`):** **Volume III, Module 3.1 (`multivariable-differentiation`)** — All 4 chapters (`3.1.1`–`3.1.4`) and 4 labs published.
  - **v2.0 Track 3 (Phase D — `5aa336c`):** **Volume III, Module 3.3 (`vector-calculus`)** — All 5 chapters (`3.3.1`–`3.3.5`) and 5 labs (`DivCurlProbeLab`, `LineIntegralWorkLab`, `GreensTheoremLab`, `SurfaceFluxLab`, `StokesDivergenceLab`) published.
  - **Module 3.2 Integral Calculus Expansion (`ec1ff6b`):** Unified Module `3.2` under **Integral Calculus (`integral-calculus`)** (`3.2.1`–`3.2.6`) with `gammaReal`/`betaReal` primitives and published Chapter `3.2.5` (`convergence-and-divergence`) and Chapter `3.2.6` (`gamma-and-beta-functions`).
  - **Module 3.1 Differential Calculus Expansion — Phase 1 (`da64a67`):** Unified Module `3.1` under **Differential Calculus (`differential-calculus`)**, added optional `subParent` grouping metadata (`Differential Equations` sub-parent for `3.1.9`–`3.1.11`), and published Chapter `3.1.5` (`limits-and-differentiability`).
  - **Module 3.1 Differential Calculus Expansion — Phase 2 (`319c9f9`):** Published Chapter `3.1.6` (`taylor-expansions`) and deepened Chapter `3.1.2` (`partial-derivatives-tangent-planes`).
  - **Module 3.1 Differential Calculus Expansion — Phase 3 (`8e321bc`):** Published Chapter `3.1.7` (`homogeneous-functions-eulers-theorem`: `HomogeneousScalingRayLab`, `EulersTheoremSecondOrderLab`) and Chapter `3.1.8` (`maxima-minima-extrema`: `HessianSecondDerivativeTestLab`, `GeneralMethodDegenerateExtremaLab`), bringing Volume III to `19` published chapters (`30` interactive labs).
  - **Module 3.1 Differential Calculus Expansion — Phase 4 (`9cd85f8`):** Published Chapter `3.1.9` (`first-order-lde-bernoulli`: `LinearOdeIntegratingFactorLab`, `BernoulliReductionLab`) under the nested **Differential Equations** sub-parent, bringing Volume III to `20` published chapters (`32` interactive labs).
  - **Module 3.1 Differential Calculus Expansion — Phase 5 (`9980bff`):** Published Chapter `3.1.10` (`linear-odes-wronskian-roots`: `WronskianPhaseAreaLab`, `CharacteristicRootsSolutionLab`) under the nested **Differential Equations** sub-parent, bringing Volume III to `21` published chapters (`34` interactive labs).
  - **Module 3.1 Differential Calculus Expansion — Phase 6:** Published Chapter `3.1.11` (`operator-variation-cauchy-euler`: `OperatorMethodTutorialLab`, `VariationOfParametersCauchyEulerLab`) under the nested **Differential Equations** sub-parent, completing **all `22/22` chapters (`36` interactive labs) of Volume III (`multivariable-calculus`)**.
- **Immediate Next Phase:**
  - **Volume I: Single-Variable Calculus (`single-variable-calculus`)** in [`src/registry/vol1-single-variable.ts`](./src/registry/vol1-single-variable.ts) — starting with **Module 1.1: Limits & Continuity (`epsilon-delta-limits`, `continuity-ivt`)**.
