# Vector Calculus & Del Operator Expansion Plan (`gradient`, `directional-derivatives`, `vector-fields`, `divergence`, `curl`)

> **Scope:** Deepen both written pedagogical explanations and hands-on interactive exploration across the five foundational pillars of Vector Calculus and Differential Spatial Analysis: **Gradient ($\nabla f$)**, **Directional Derivatives ($D_{\mathbf{u}} f$)**, **Vector Fields ($\mathbf{F}$)**, **Divergence ($\nabla \cdot \mathbf{F}$)**, and **Curl ($\nabla \times \mathbf{F}$)**.
> **Target Chapters:** Chapter `3.1.3` (`gradient-directional-derivatives`) and Module `3.3` (`vector-calculus`, centered on Chapter `3.3.1` `vector-fields-divergence-curl` plus cross-chapter theorem summaries in `3.3.2`–`3.3.5`).
> **Status:** Planned & Executing Phase-by-Phase (4 Phases).

---

## Architecture & Visual Standards

- Strictly preserve the **Butterfly Semantic Color Palette** (`#8D9FCE` $x$ / tangent heading, `#96B898` $y$ / accumulation, `#029091` $z$ / normal & flux, `#B95869` & `#D5658B` upper/lower boundaries & curl faces, `#D35323` gradient / divergence / active handle, `#FBEAA4` curl paddlewheel / differential element, `#AAA36D` reference axes).
- **Zero decorative gradients** (`#1E1F22` / `var(--bg-canvas)` and `#26282C` / `var(--bg-panel)` flat drafting surfaces).
- Shared primitives from `@/components/visualizations/primitives`: `ThreeOrbitViewport`, `SvgCoordinatePlane2D`, `createParametricSurfaceMesh`, `createVectorArrow3D`, `extractLevelCurveSegments`, `computePartialDerivatives2D`, `mathToThreeVec3`.
- Custom equations parsed via `compileMathExpression` and `<MathExpressionInput />`, rendered in `KaTeXMath`.

---

## Phase-by-Phase Execution Blueprint

### Phase 1 — Gradient ($\nabla f$) & Directional Derivatives ($D_{\mathbf{u}} f$) Exploration + Explanations (`3.1.3`)
1. **New Interactive Lab (`GradientAscentAndLevelSurfaceLab.tsx`):**
   - **Mode A — 2D Gradient Flow, Contour Orthogonality & Optimization Explorer:**
     - Interactive click-to-move seed $(x_0, y_0)$ over level curves $f(x,y) = c$.
     - RK4 continuous **Steepest Ascent ($+\nabla f$)** and **Steepest Descent ($-\nabla f$)** integral trajectories compared against discrete **Gradient Descent steps** with adjustable learning rate $\eta$ (exposing step-size zigzagging and divergence).
     - Live **360° Polar Slope Rose ($D_{\mathbf{u}} f(\alpha)$ vs $\alpha$)** showing why the locus of $D_{\mathbf{u}} f = \|\nabla f\|\cos\theta$ forms dual tangent circles passing through the origin along $\pm\nabla f$.
   - **Mode B — 3D Implicit Level Surface $F(x,y,z)=c$, Normal $\nabla F$ & 3D Directional Slope:**
     - Interactive `ThreeOrbitViewport` rendering 3D level surfaces (ellipsoid, hyperboloid, paraboloid, wave-front) with probe $(x_0,y_0,z_0)$, live 3D gradient normal $\nabla F$, orthogonal tangent plane patch, and rotatable 3D probe vector $\mathbf{u}$ displaying $D_{\mathbf{u}}F = \nabla F \cdot \mathbf{u}$.
2. **Written Pedagogical Reference Section (`page.tsx` under `gradient-directional-derivatives`):**
   - Total Differential $df = \nabla f \cdot d\mathbf{r}$, Cauchy–Schwarz optimality proof, Level-Curve/Surface orthogonality proof ($\nabla f \cdot \mathbf{r}'(t) = 0$), and Physical/Engineering Bridges (Heat flux $\mathbf{q} = -k\nabla T$, ML Gradient Descent, Potential Fields $\mathbf{F} = -\nabla \phi$).
3. **Registry Update (`vol3-multivariable.ts`):** Register `lab-3-1-3b` (`GradientAscentAndLevelSurfaceLab`).

### Phase 2 — Vector Fields ($\mathbf{F}$) Anatomy, Streamlines & Velocity Gradient Matrix (`3.3.1`)
1. **New Interactive Lab (`VectorFieldStreamlineExplorerLab.tsx`):**
   - Presets: Conservative Gradient Potential ($\mathbf{F} = \nabla \phi$ overlaid on contours), 2D Free Vortex ($\langle -y, x\rangle/(x^2+y^2)$), Dipole Source-Sink Pair, Damped Phase Spiral, 3D Helical Swirl, plus live custom $\mathbf{F}(x,y,z) = \langle P, Q, R\rangle$ inputs.
   - **Interactive Click-to-Seed Streamlines** (forward & backward RK4 particle integration in 2D SVG + 3D `ThreeOrbitViewport` streamlines), arrow normalization toggle (true length vs unit direction with magnitude readout), and optional scalar potential contour overlay.
   - **Local Jacobian Decomposition ($D\mathbf{F}$ Matrix):** Live $2\times 2$ / $3\times 3$ velocity-gradient matrix separating **Isotropic Expansion** ($\frac{1}{2}(\nabla\cdot\mathbf{F})I$), **Antisymmetric Spin** (driven by $\nabla\times\mathbf{F}$), and **Pure Shear Strain**.
2. **Registry Update (`vol3-multivariable.ts`):** Register `lab-3-3-1b` (`VectorFieldStreamlineExplorerLab`).

### Phase 3 — Divergence ($\nabla\cdot\mathbf{F}$) & Curl ($\nabla\times\mathbf{F}$) Flux-Torque Budget, 3D Curl Axis & Identities (`3.3.1`)
1. **New Interactive Lab (`DivCurlDecompositionLab.tsx`):**
   - **Component-Wise Flux & Circulation Budget:** Visually decomposes $\nabla\cdot\mathbf{F} = \frac{\partial P}{\partial x} + \frac{\partial Q}{\partial y} + \frac{\partial R}{\partial z}$ into directional inflow/outflow bars on opposite faces ($x_{\pm}, y_{\pm}, z_{\pm}$), and decomposes $(\nabla\times\mathbf{F})_z = \frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}$ into vertical-shear vs horizontal-shear torques.
   - **3D Tiltable Curl Vector & Orthogonal Spin Plane:** `ThreeOrbitViewport` displaying the full 3D vector $\boldsymbol{\omega} = \nabla\times\mathbf{F}$ together with a spinning paddlewheel disk aligned perpendicular to $\boldsymbol{\omega}$ and 3D flux cube face arrows.
   - **Vector Identity Numerical Verifier:** Interactive check of $\nabla\times(\nabla f) = \mathbf{0}$ and $\nabla\cdot(\nabla\times\mathbf{F}) = 0$ at any probe $(x_0, y_0, z_0)$, plus spotlight presets for classic paradoxes (**Shear Flow $\langle y, 0, 0\rangle$** and **Free Vortex $\langle -y, x\rangle/r^2$**).
2. **Deep Written Explanations (`page.tsx` under `vector-fields-divergence-curl`):**
   - The **Del ($\nabla$) Operator Quartet** card suite connecting $\nabla f$, $D_{\mathbf{u}} f = \mathbf{u}\cdot\nabla f$, $\nabla\cdot\mathbf{F}$, and $\nabla\times\mathbf{F}$ (with a direct navigation link back to Chapter `3.1.3`).
   - Coordinate-Free Geometric Limit Definitions (flux-per-volume and circulation-per-area), Helmholtz Decomposition intuition (Curl-Free vs Divergence-Free), Classic Paradoxes table, and Exact Del Calculus Identities.
3. **Registry Update (`vol3-multivariable.ts`):** Register `lab-3-3-1c` (`DivCurlDecompositionLab`).

### Phase 4 — Vector Calculus Module (`3.3.2`–`3.3.5`) Explanatory Polish, Archive Sync & Build Verification
1. Add concise worked explanation & theorem-summary reference blocks to Chapters `3.3.2` (`line-integrals-work`), `3.3.3` (`greens-theorem`), `3.3.4` (`surface-integrals-flux`), and `3.3.5` (`stokes-divergence-theorems`) in `src/app/[volume]/[module]/[chapter]/page.tsx` so every chapter in Module `3.3` shares the same textbook-grade explanatory depth.
2. Synchronize `archive/volumes/vol_03_multivariable/README.md`, `archive/01_GLOBAL_STATUS.md`, `archive/01_CURRENT_STATUS.md`, and `AGENTS.md`.
3. Verify zero TypeScript or Next.js build errors (`npx tsc --noEmit` + clean `npm run build`), then commit & push to `origin/main`.
