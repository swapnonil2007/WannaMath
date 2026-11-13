# Module 3.1 — Differential Calculus Expansion Plan (`differential-calculus`)

> **Scope:** Unify Volume III Module `3.1` under one parent **"Differential Calculus"** (`/multivariable-calculus/differential-calculus`, permanently redirecting legacy `/multivariable-calculus/multivariable-differentiation/*`) before moving to Volume I (`Single-Variable Calculus`).
> **Status:** Planned & Approved for Phase-by-Phase Execution (6 Phases).
> **Existing Published Chapters Retained Without Regression:** `3.1.1` (`SurfaceContourSlicerLab`), `3.1.2` (`PartialDerivativeTangentPlaneLab` — deepened in Phase 2), `3.1.3` (`GradientDirectionalDerivativeLab`), `3.1.4` (`LagrangeMultipliersLab`).

---

## 1. Parent Taxonomy & URL Architecture

To keep the 4-tier routing invariant (`/[volume]/[module]/[chapter]`) intact while representing **Differential Equations** as a grouped sub-parent under **Differential Calculus**, Module `3.1` adds an optional `subParent?: { slug: string; title: string; badge?: string }` grouping metadata field on `ChapterMetadata` (`src/registry/types.ts`):

- **Module 3.1 Parent:** **Differential Calculus** (`slug: "differential-calculus"`, Accent: `#8D9FCE`)
  - **Core Multivariable Differentiation (`3.1.1` – `3.1.8`)**
    - `3.1.1` — Surfaces, Level Curves & Contour Maps *(Published)*
    - `3.1.2` — Partial Derivatives (1st/2nd Order, Clairaut Symmetry, Chain Rule & Implicit Functions) *(Published + Deepened in Phase 2)*
    - `3.1.3` — The Gradient Vector & Directional Derivatives *(Published)*
    - `3.1.4` — Lagrange Multipliers & Constrained Optimization *(Published)*
    - `3.1.5` — **Multivariable Limits, Continuity & Total Differentiability** *(Phase 1)*
    - `3.1.6` — **Taylor Expansions (Single-Variable & Multivariable)** *(Phase 2)*
    - `3.1.7` — **Homogeneous Functions & Euler's Theorems ($1^{\text{st}}$ & $2^{\text{nd}}$ Order)** *(Phase 3)*
    - `3.1.8` — **Maxima & Minima (General Method & Second Derivative Test)** *(Phase 3)*
  - **Nested Sub-Parent under Differential Calculus: Differential Equations (`3.1.9` – `3.1.11`)**
    - `3.1.9` — **First-Order ODEs: LDE, Integrating Factors & Bernoulli's Equation** *(Phase 4)*
    - `3.1.10` — **Linear ODEs: Linear Independence, Wronskian & Distinct/Repeated/Complex Roots** *(Phase 5)*
    - `3.1.11` — **Particular Integrals & Variable Coefficients: Operator Method ($D$), Variation of Parameters & Cauchy-Euler** *(Phase 6)*

*(Note: Volume I [`single-variable-calculus`] stays `planned` until all 6 phases of Differential Calculus in Volume III are completed.)*

---

## 2. Phase-by-Phase Execution Blueprint

### Phase 1 — Parent Unification & Multivariable Limits and Differentiability (`3.1.5`)
- **Registry, Routing & Navigation Scaffolding:**
  - Rename Module `3.1` in `src/registry/vol3-multivariable.ts` from `multivariable-differentiation` to `differential-calculus` (`Differential Calculus`).
  - Add permanent redirects in `next.config.ts`: `/multivariable-calculus/multivariable-differentiation` $\to$ `/multivariable-calculus/differential-calculus` and `/:chapter` variants.
  - Add optional `subParent?: { slug: string; title: string; badge?: string }` to `ChapterMetadata` (`src/registry/types.ts`), and render collapsible/grouped sub-parent headers inside `src/app/[volume]/[module]/page.tsx` and `src/components/layout/TextbookSidebar.tsx`.
  - Pre-register all planned Differential Calculus chapters (`3.1.5`–`3.1.11`) in `vol3-multivariable.ts` (`3.1.5` as `'published'`, `3.1.6`–`3.1.11` as `'planned'` until each subsequent phase lands).
- **Chapter `3.1.5` (`limits-and-differentiability`) Interactive Labs:**
  1. **`MultivariableLimitsPathsLab`**:
     - Inspects path-dependent limits $(x,y)\to(0,0)$ along linear rays $y = mx$, parabolic paths $y = kx^2$, and polar coordinates $(r, \theta)$ vs. true convergent limits via Squeeze Theorem.
     - Synchronized 2D domain path plotter + 3D surface trace showing height values $z(t)$ as the probe slides toward the origin; presets including $\frac{xy}{x^2+y^2}$ (ray-dependent), $\frac{x^2 y}{x^4+y^2}$ (equal along all lines, fails along $y=x^2$), and $\frac{x^3}{x^2+y^2}$ (Squeeze convergent).
  2. **`DifferentiabilityErrorConeLab`**:
     - Compares **Existence of Partials $f_x, f_y$** vs. **Total Differentiability** ($\lim_{(h,k)\to(0,0)} \frac{|f(x_0+h,y_0+k) - L(x_0+h,y_0+k)|}{\sqrt{h^2+k^2}} = 0$).
     - Plots normalized linear approximation error cone/ridge as step radius $r = \sqrt{h^2+k^2}$ shrinks, proving why piecewise/ridged functions with $f_x(0,0)=f_y(0,0)=0$ can fail total differentiability.

---

### Phase 2 — Taylor Expansions (1D & 2D) (`3.1.6`) + Deepened Partial Derivatives (`3.1.2`)
- **Chapter `3.1.6` (`taylor-expansions`) Interactive Labs:**
  1. **`SingleVariableTaylorLab`**:
     - Interactive expansion center $x_0$ and degree $n \in \{0,\dots,6\}$ comparing $f(x)$ vs. $T_n(x) = \sum_{k=0}^n \frac{f^{(k)}(x_0)}{k!}(x-x_0)^k$.
     - Visualizes **Lagrange Remainder** error envelope $|R_n(x)| = |f(x) - T_n(x)|$, osculating tangency order at $x_0$, term-by-term coefficient contribution cards, and convergence interval comparison ($\sin x, e^x, \ln(1+x), \frac{1}{1-x}$) plus custom `<MathExpressionInput />`.
  2. **`MultivariableTaylorHessianLab`**:
     - Live 3D WebGL viewport overlaying $z = f(x,y)$, $1^{\text{st}}$-order tangent plane $T_1(x,y)$, and $2^{\text{nd}}$-order quadratic Hessian surface $T_2(x,y) = f(\mathbf{p}_0) + \nabla f \cdot \mathbf{h} + \frac{1}{2}\mathbf{h}^T \mathbf{H}_f \mathbf{h}$.
     - Displays explicit $2\times 2$ Hessian matrix readout $[f_{xx}, f_{xy}; f_{yx}, f_{yy}]$, movable expansion point $(x_0, y_0)$, and residual error heatmap toggle.
- **Chapter `3.1.2` (`partial-derivatives-tangent-planes`) Deepening:**
  - Retain `PartialDerivativeTangentPlaneLab` untouched.
  - Add **`HigherOrderChainImplicitLab`**:
    - Higher-order partials ($f_{xx}, f_{xy}, f_{yx}, f_{yy}$) inspector with **Clairaut/Schwarz Theorem** verification ($f_{xy} = f_{yx}$ when continuous) AND a switchable mixed-partial counterexample ($f(x,y) = xy\frac{x^2-y^2}{x^2+y^2}$, where $f_{xy}(0,0)=-1 \neq +1 = f_{yx}(0,0)$).
    - Interactive **Multivariable Chain Rule Dependency Tree** ($\frac{dz}{dt} = f_x x'(t) + f_y y'(t)$ and $\frac{\partial z}{\partial u}, \frac{\partial z}{\partial v}$) with live vector/curve readout.
    - **Implicit Differentiation** visualizer for $F(x,y,z)=0 \implies \frac{\partial z}{\partial x} = -\frac{F_x}{F_z}$, $\frac{\partial z}{\partial y} = -\frac{F_y}{F_z}$ on level surfaces.

---

### Phase 3 — Homogeneous Functions, Euler's Theorems (`3.1.7`) & Maxima/Minima (`3.1.8`)
- **Chapter `3.1.7` (`homogeneous-functions-eulers-theorem`) Interactive Labs:**
  1. **`HomogeneousScalingRayLab`**:
     - Interactive radial scaling slider $t \in [0.25, 2.5]$ demonstrating $f(tx, ty) = t^n f(x, y)$ on rays from the origin in 2D contours and 3D heightcones, reporting live degree $n$.
     - Interactive verification of **1st-Order Euler's Theorem** ($x f_x + y f_y = n f$) across sample points $(x_0, y_0)$.
  2. **`EulersTheoremSecondOrderLab`**:
     - Evaluates **2nd-Order Euler's Identity** $x^2 f_{xx} + 2xy f_{xy} + y^2 f_{yy} = n(n-1)f$ numerically term-by-term alongside its analytical formula.
     - Dedicated **Composite / Disguised Homogeneous Deduction Lab** ($u = g^{-1}(f(x,y))$ such as $\sin^{-1}\!\bigl(\frac{x+y}{\sqrt{x}+\sqrt{y}}\bigr)$ and $\tan^{-1}\!\bigl(\frac{x^3+y^3}{x-y}\bigr)$), displaying both $x u_x + y u_y = n \frac{g(u)}{g'(u)}$ and the resulting 2nd-order PDE identity.
- **Chapter `3.1.8` (`maxima-minima-extrema`) Interactive Labs:**
  1. **`HessianSecondDerivativeTestLab`**:
     - Critical point explorer ($\nabla f = \mathbf{0}$) plotting 3D neighborhood geometry together with $r = f_{xx}$, $s = f_{xy}$, $t = f_{yy}$, discriminant $D = rt - s^2$, and Hessian eigenvalues $\lambda_1, \lambda_2$ showing principal curvature directions.
     - Covers Local Minimum ($D>0, r>0$), Local Maximum ($D>0, r<0$), Saddle Point ($D<0$), and Discriminant Degeneracy ($D=0$).
  2. **`GeneralMethodDegenerateExtremaLab`**:
     - Built specifically for the **$D = 0$ Inconclusive Regime** and boundary checks: tests **General Sign-Change Analysis** $\Delta f = f(x_0+h, y_0+k) - f(x_0, y_0)$ along sweeping radial angles $\theta \in [0, 2\pi)$ and parabolic curves $y = k x^2$.
     - Presets covering true minimum with $D=0$ ($x^4 + y^4$), saddle with $D=0$ ($x^2 - y^4$), monkey saddle ($x^3 - 3xy^2$), and **Peano's Counterexample** $(y - x^2)(y - 2x^2)$ (minimum along every straight line, yet NOT a 2D local minimum!).

---

### Phase 4 — Differential Equations Sub-Parent Setup & First-Order LDE / Bernoulli (`3.1.9`)
- **Nested Parent Activation:**
  - Group Chapters `3.1.9`–`3.1.11` under `subParent: { slug: "differential-equations", title: "Differential Equations", badge: "ODE Sub-Parent" }` inside Module `3.1` (`Differential Calculus`).
- **Chapter `3.1.9` (`first-order-lde-bernoulli`) Interactive Labs:**
  1. **`LinearOdeIntegratingFactorLab`**:
     - Interactive LDE solver for $y' + P(x)y = Q(x)$ (and switchable linear-in-$x$ mode $x' + P(y)x = Q(y)$).
     - Displays the **Integrating Factor** $\mu(x) = e^{\int P(x)\,dx}$ curve, slope field arrows, multiplicative exactness step $\frac{d}{dx}[\mu(x)y] = \mu(x)Q(x)$, initial condition scrubber $(x_0, y_0)$, and transient vs. particular response curves.
  2. **`BernoulliReductionLab`**:
     - Interactive visualizer for **Bernoulli's Equation** $y' + P(x)y = Q(x)y^n$ with adjustable nonlinearity exponent $n \notin \{0, 1\}$.
     - Synchronized dual coordinate planes: (Left) nonlinear $(x, y)$ slope field & trajectories vs. (Right) linearized $(x, v)$ slope field under $v = y^{1-n}$ showing straightened solution families!

---

### Phase 5 — Higher-Order Linear ODEs: Wronskian & Characteristic Root Cases (`3.1.10`)
- **Chapter `3.1.10` (`linear-odes-wronskian-roots`) Interactive Labs:**
  1. **`WronskianPhaseAreaLab`**:
     - Computes and animates $W(y_1, y_2)(x) = y_1(x)y_2'(x) - y_2(x)y_1'(x)$ dynamically over sliding $x$, plotting the state vectors $\mathbf{Y}_1(x)=(y_1, y_1')$ and $\mathbf{Y}_2(x)=(y_2, y_2')$ in the $(y, y')$ phase plane whose signed parallelogram area equals $W(x)$ (verifying Linear Independence when $W \neq 0$ vs. Linear Dependence collapse when $W \equiv 0$, plus Abel's Identity).
  2. **`CharacteristicRootsSolutionLab`**:
     - Interactive $2^{\text{nd}}$-order Linear ODE studio ($a y'' + b y' + c y = 0$): scrub $a, b, c$ across discriminant signs $b^2 - 4ac$ to explore:
       - **Distinct Real Roots** ($r_1 \neq r_2$): $y_c = C_1 e^{r_1 x} + C_2 e^{r_2 x}$.
       - **Repeated Roots** ($r_1 = r_2 = r$): visual limit morphing $\frac{e^{r_2 x} - e^{r_1 x}}{r_2 - r_1} \to x e^{rx}$ showing why the $x$ factor emerges!
       - **Complex Conjugate Roots** ($r = \alpha \pm i\beta$): coupled complex $s$-plane root plot, decaying/growing $e^{\alpha x}\cos(\beta x)$ waveform, and $(y, y')$ phase spiral.
     - Includes initial-value solver ($y(0), y'(0)$) updating $C_1, C_2$ live and previewing complementary + particular superposition.

---

### Phase 6 — Particular Integrals & Variable Coefficients: Operator Method, Variation of Parameters & Cauchy-Euler (`3.1.11`)
- **Chapter `3.1.11` (`operator-variation-cauchy-euler`) Interactive Labs:**
  1. **`OperatorMethodTutorialLab`**:
     - Step-by-step tutorial & interactive symbolic/numerical lab for **Inverse Differential Operators** $y_p = \frac{1}{f(D)}g(x)$ across all five engineering forcing forms:
       - $e^{ax}$ (including resonance exception $f(a)=0 \implies x\frac{1}{f'(a)}e^{ax}$ / $x^k$ multiplicity).
       - $\sin(\omega x), \cos(\omega x)$ ($D^2 \mapsto -\omega^2$ and undamped resonance case).
       - Polynomial $x^m$ (binomial series truncation in powers of $D$).
       - Exponential shift $e^{ax} V(x) \implies e^{ax}\frac{1}{f(D+a)}V(x)$.
       - Overlay plots verifying $f(D)[y_p] = g(x)$ to machine precision.
  2. **`VariationOfParametersCauchyEulerLab`**:
     - Dual-mode laboratory:
       - **Mode A — Variation of Parameters**: solves $y'' + p y' + q y = g(x)$ for general continuous forcings ($g(x) = \tan x, \sec x, e^x/x$) via $y_p = u_1(x)y_1(x) + u_2(x)y_2(x)$, visualizing $u_1'(x) = -\frac{y_2 g}{W}$, $u_2'(x) = \frac{y_1 g}{W}$, Wronskian scaling, and synthesized $y_p(x)$.
       - **Mode B — Cauchy-Euler Equations**: $a x^2 y'' + b x y' + c y = g(x)$ on $x > 0$, showing side-by-side logarithmic pullback $t = \ln x$ ($\theta = x\frac{d}{dx}$) transforming $\{x^{r_1}, x^{r_2}\}$, $\{x^r, x^r\ln x\}$, and $\{x^\alpha\cos(\beta\ln x), x^\alpha\sin(\beta\ln x)\}$ into straight constant-coefficient exponential/trigonometric curves in $(t, y)$.
