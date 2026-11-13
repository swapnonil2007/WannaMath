# Volume VI — Probability, Statistics & Numerical Methods (`probability-numerical-methods`) 2-Phase Plan

> **Scope:** Build and publish all 2 modules and 4 chapters of **Volume VI: Probability, Statistics & Numerical Methods** (`/probability-numerical-methods`, Accent: `#AAA36D` Olive Gold) following the `wanna math` 4-tier architecture and visual standards — completing all 6 Volumes of the Engineering Mathematics Textbook.
> **Registry Target:** [`src/registry/vol6-probability-numerical.ts`](../../../src/registry/vol6-probability-numerical.ts)
> **Visualization Directory:** `src/components/visualizations/probability-numerical/`
> **Status:** Planned & Ready for Phase-by-Phase Execution (Phases 1–2).

---

## Architecture & Visual Standards

- **Butterfly Semantic Color Palette (Zero Gradients):**
  - `#8D9FCE` (Periwinkle) for probability density $f_X(x)$, quadrature polynomials / Trapezoidal panels, primary Euler steps, and $x$-marginal curves.
  - `#96B898` (Sage Green) for cumulative distribution $F_X(x)$, $y$-marginal curves, conditional slice planes, and Heun ($O(h^2)$) trajectories.
  - `#029091` (Deep Teal) for 3D bivariate Gaussian bell $f_{X,Y}(x,y)$, Simpson parabolic panels, and RK4 exact/4th-order solution paths.
  - `#D35323` (Persimmon) for probability quantile handles $(a, b)$, Gauss–Legendre optimal nodes $x_i$, active slope probes ($k_1, k_2, k_3, k_4$), and Monte Carlo hits.
  - `#FBEAA4` (Buttermilk Cream) for shaded integral intervals $P(a \le X \le b)$, covariance ellipse $1\sigma / 2\sigma$ contours, and exact benchmark trajectories.
  - `#AAA36D` (Olive Gold) for Volume VI accent token, moment/expectation balance fulcrums ($\mu = \mathbb{E}[X]$), and Legendre node weights.
  - `#B95869` / `#D5658B` (Crimson / Dusty Rose) for truncation error residuals and numerical stability boundaries.
- **Shared Primitives:** `ThreeOrbitViewport`, `SvgCoordinatePlane2D`, `createParametricSurfaceMesh`, `extractLevelCurveSegments`, `integrate1DGaussLegendre`, `mathToThreeVec3`, `<KaTeXMath />`.

---

## Phase-by-Phase Execution Blueprint

### Phase 1 — Module 6.1: Engineering Probability & Joint Distributions (`probability-distributions`)
1. **Chapter `6.1.1` (`continuous-pdfs-cdfs`) — Continuous PDFs, CDFs & Expectation Integrals:**
   - **Lab (`PDFCDFMomentLab.tsx`):**
     - Continuous distribution families with live parameter sliders: **Gaussian $\mathcal{N}(\mu, \sigma^2)$**, **Exponential $\operatorname{Exp}(\lambda)$**, **Weibull($k, \lambda$)**, and **Beta($\alpha, \beta$)**.
     - Synchronized 2-panel `SvgCoordinatePlane2D`: **(a) Density $f_X(x)$** with draggable interval bounds $[a, b]$ shading probability mass $P(a \le X \le b)$ (`#FBEAA4`) + mean balance fulcrum $\mathbb{E}[X]$ & standard deviation bracket $\mu \pm \sigma$; **(b) Cumulative $F_X(x)$** proving $P(a \le X \le b) = F_X(b) - F_X(a)$ and $F'_X(x) = f_X(x)$ at any clicked quantile $x$.
   - **Written Guide (`page.tsx`):** Probability density vs. point probability ($P(X=x)=0$), Fundamental Theorem link between PDF and CDF, and mechanical center-of-mass / moment-of-inertia analogy for $\mu, \sigma^2$.
2. **Chapter `6.1.2` (`joint-bivariate-distributions`) — Joint Bivariate Distributions, Marginalization & Covariance:**
   - **Lab (`BivariateGaussianLab.tsx`):**
     - Interactive sliders for correlation $\rho \in (-0.95, 0.95)$, $\sigma_x, \sigma_y$, and slice position $x = x_0$.
     - Synchronized **3D Joint Bell $z = f_{X,Y}(x, y)$** (`ThreeOrbitViewport`) with projected marginal wall curves $f_X(x), f_Y(y)$ and conditional slice plane $x = x_0$ alongside **2D $1\sigma$ / $2\sigma$ Covariance Confidence Ellipses & Conditional Density $f_{Y|X}(y \mid x_0)$** (`SvgCoordinatePlane2D`), demonstrating $\rho$-driven conditional mean shift $\mathbb{E}[Y \mid x_0] = \rho \frac{\sigma_y}{\sigma_x} x_0$ and conditional variance shrinkage $\sigma_y^2(1 - \rho^2)$ + spectral covariance eigenvectors from `2.3.2`.
   - **Written Guide (`page.tsx`):** Double-integral normalization, marginal projection collapse, conditional slicing Bayes normalization, and correlation vs. statistical independence.

### Phase 2 — Module 6.2: Numerical Quadrature, Root-Finding & ODE Solvers (`numerical-methods`) & Textbook Completion
1. **Chapter `6.2.1` (`numerical-quadrature-error`) — Trapezoidal, Simpson's & Gauss–Legendre Quadrature:**
   - **Lab (`NumericalQuadratureLab.tsx`):**
     - Integrand benchmarks (`Smooth Cosine`, `Oscillatory Chirp`, `Runge Rational 1/(1+4x²)`, `Polynomial Degree 5`) with node count slider $N \in [2, 16]$ and rule selector (**Midpoint**, **Trapezoidal**, **Simpson's 1/3**, **Gauss–Legendre**).
     - Synchronized **(a) Function & Shaded Quadrature Panels (`SvgCoordinatePlane2D`)** showing exact linear chords, parabolic arcs, or unevenly spaced Gauss–Legendre roots $P_n(x_i) = 0$ with weighted vertical needles $w_i f(x_i)$; **(b) Log–Log Convergence Slope Plot ($\log_{10} |\text{Error}|$ vs $\log_{10} N$)** proving $O(h^2)$, $O(h^4)$, and spectral exponential convergence!
   - **Written Guide (`page.tsx`):** Newton–Cotes degree truncation, why composite Simpson achieves $O(h^4)$ via symmetry cancellation, and Legendre orthogonal polynomial node optimality ($\text{exact up to degree } 2n-1$).
2. **Chapter `6.2.2` (`runge-kutta-ode-solvers`) — Euler, Heun & Runge–Kutta (RK4) Trajectory Stepping:**
   - **Lab (`RungeKuttaSlopeLab.tsx`):**
     - ODE testbench presets (`Exponential Growth y'=y`, `Logistic S-Curve`, `Oscillating Decay y'=cos(2t)-0.4y`, `Stiff Test y'=-4y+sin(t)`) with coarse step size slider $h \in [0.15, 1.2]$.
     - Synchronized **(a) Global Trajectory Comparator (`SvgCoordinatePlane2D`)** plotting Exact analytic curve vs. **Forward Euler ($O(h)$)**, **Heun / RK2 ($O(h^2)$)**, and **Classic RK4 ($O(h^4)$)** across $t \in [0, 6]$; **(b) Single-Step Magnifying Glass $[t_n, t_n + h]$** rendering all four individual RK4 slope probes ($k_1$ start, $k_2$ first midpoint, $k_3$ corrected midpoint, $k_4$ endpoint) and weighted average slope $\frac{1}{6}(k_1 + 2k_2 + 2k_3 + k_4)$.
   - **Written Guide (`page.tsx`):** Taylor expansion error matching, Butcher tableau weights $(1, 2, 2, 1)/6$, Simpson's Rule correspondence when $f(t, y) = f(t)$, and global accumulated error order $O(h^p)$.
3. **Volume VI & 6-Volume Textbook Completion Sync:** Update `archive/volumes/vol_06_probability_numerical/README.md`, `archive/01_GLOBAL_STATUS.md`, `archive/01_CURRENT_STATUS.md`, and `AGENTS.md` to mark **all 6 Volumes (`65/65` Chapters, `82` Live Labs — 100% Complete)**, verify `npx tsc --noEmit` + clean `npm run build`, and commit/push each phase cleanly to `origin/main`.
