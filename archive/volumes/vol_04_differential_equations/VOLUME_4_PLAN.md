# Volume IV — Differential Equations & Dynamical Systems (`differential-equations`) 4-Phase Plan

> **Scope:** Build and publish all 4 modules and 8 chapters of **Volume IV: Differential Equations & Dynamical Systems** (`/differential-equations`, Accent: `#D35323` Persimmon) following the `wanna math` 4-tier architecture and visual standards.
> **Existing Bridge:** Analytical solution techniques for first- and second-order scalar ODEs already live in Volume III Chapters `3.1.9`–`3.1.11` (`Differential Equations` sub-parent under `differential-calculus`). Volume IV expands forward into **direction-field geometry, autonomous phase lines & bifurcations, mechanical/RLC damping & resonance, 2D linear/nonlinear phase portraits, and physical PDEs (Heat & Wave equations)**.
> **Status:** Planned & Ready for Phase-by-Phase Execution (Phases 1–4).

---

## Architecture & Visual Standards

- **Registry Target:** [`src/registry/vol4-differential-equations.ts`](../../../src/registry/vol4-differential-equations.ts)
- **Visualization Directory:** `src/components/visualizations/differential-equations/`
- **Color Roles (Butterfly Palette, Zero Gradients):**
  - `#8D9FCE` (Periwinkle) for $t / x$ axis, primary eigenvectors, input signals, and $x$-nullclines.
  - `#96B898` (Sage Green) for $y$ axis, stable equilibria / sinks, secondary eigenvectors, and $y$-nullclines.
  - `#029091` (Deep Teal) for frequency / wave / 3D field surfaces and invariant manifolds.
  - `#D35323` (Persimmon) for active trajectories, unstable sources, resonance peaks, and divergence handles.
  - `#FBEAA4` (Buttermilk Cream) for initial seed markers, isoclines, nodal lines, and differential elements.
  - `#B95869` / `#D5658B` (Crimson / Dusty Rose) for envelopes, upper/lower bounds, and bifurcation branches.
- **Shared Primitives:** `SvgCoordinatePlane2D`, `ThreeOrbitViewport`, `createParametricSurfaceMesh`, `extractLevelCurveSegments`, `computePartialDerivatives2D`, `mathToThreeVec3`, `compileMathExpression`, `<MathExpressionInput />`, `<KaTeXMath />`.

---

## Phase-by-Phase Execution Blueprint

### Phase 1 — Module 4.1: First-Order ODEs & Slope Fields (`first-order-odes`)
1. **Chapter `4.1.1` (`direction-fields-integral-curves`) — Direction Fields, Integral Curves & Picard Existence:**
   - **Lab (`SlopeFieldTracerLab.tsx`):**
     - Presets covering separable, linear-forced, logistic, and non-Lipschitz ($y' = y^{2/3}$) fields + custom `dy/dt = f(t, y)` expression input.
     - Click-to-drop `(t₀, y₀)` initial conditions integrating forward/backward RK4 trajectories, comparing against explicit Euler step size `h` error, plus **Isocline ($f(t,y)=c$)** marching-squares overlay and **Picard–Lindelöf uniqueness boundary** callouts.
   - **Written Guide (`page.tsx`):** Geometric tangent-field interpretation $(1, f(t,y))$, Isocline sketching method, Euler vs. RK4 truncation accuracy, and Picard–Lindelöf non-uniqueness failure modes.
2. **Chapter `4.1.2` (`separable-linear-odes`) — Separable, Linear & Autonomous Phase-Line Models:**
   - **Lab (`AutonomousPhaseLineLab.tsx`):**
     - Synchronized 3-panel explorer: **Slope Curve $\dot{y} = f(y)$**, **1D Phase Line** with stability-colored equilibria (Sink `#96B898`, Source `#D35323`, Semi-Stable `#FBEAA4`), and **Time Trajectories $y(t)$** + **Control Parameter $r$ Bifurcation Diagram ($y^*$ vs $r$)** for Saddle-Node, Transcritical, Pitchfork, and Logistic Harvesting models.
   - **Written Guide (`page.tsx`):** Cross-link to integrating factors (`3.1.9`), 1D Linearization Stability Criterion ($f'(y^*) \lessgtr 0$), and normal-form bifurcation equations.

### Phase 2 — Module 4.2: Second-Order Linear ODEs & Oscillations (`second-order-oscillations`)
1. **Chapter `4.2.1` (`damped-harmonic-oscillators`) — Harmonic Oscillators: Undamped, Underdamped & Overdamped:**
   - **Lab (`HarmonicOscillatorLab.tsx`):**
     - Live physical sliders ($m, c, k, x_0, v_0$) synchronized across three views: **(a) Complex $s$-Plane Root Locus** showing $s_{1,2}$ sweeping from the imaginary axis along radius $\omega_n$ to the negative real axis as $\zeta$ crosses $1$; **(b) Time Response $x(t)$ with Exponential Envelope $\pm A e^{-\zeta\omega_n t}$**; **(c) Velocity-Position $(x, \dot{x})$ Phase Portrait** + settling time / logarithmic decrement telemetry.
   - **Written Guide (`page.tsx`):** Mechanical-electrical analogy ($m, c, k \leftrightarrow L, R, 1/C$), damping ratio $\zeta$ derivation, and Quality Factor $Q$.
2. **Chapter `4.2.2` (`forced-oscillations-resonance`) — Forced Oscillations, Beats & Resonance Frequency Response:**
   - **Lab (`ForcedResonanceLab.tsx`):**
     - Scrub driving frequency $\omega$, natural frequency $\omega_n$, and damping $\zeta$ across **(a) Transient + Steady-State Waveform $x(t)$** (highlighting **Acoustic Beats** and **Undamped Secular Growth** $t\sin(\omega_n t)$); **(b) Frequency-Response Gain $|H(i\omega)|$** peaking at $\omega_{\text{res}} = \omega_n\sqrt{1-2\zeta^2}$; **(c) Phase Lag Curve $\phi(\omega)$**.
   - **Written Guide (`page.tsx`):** Phasor steady-state solution, beat-envelope trigonometric proof, and peak-shift formula $\omega_{\text{res}} < \omega_n$.

### Phase 3 — Module 4.3: Systems of ODEs & Phase Plane Portraits (`phase-plane-systems`)
1. **Chapter `4.3.1` (`linear-phase-portraits`) — 2D Linear Phase Portraits: Nodes, Saddles, Spirals & Centers:**
   - **Lab (`TraceDeterminantPhaseLab.tsx`):**
     - **Dual 2D Interactive Plane:** Click/drag directly in the **Poincaré Trace-Determinant $(\tau, \Delta)$ Bifurcation Diagram** (with $\Delta = \tau^2/4$ parabola) OR edit $2\times 2$ matrix entries `[[a,b],[c,d]]` directly; instantaneously morphs the live **$(x,y)$ Phase Portrait**, plots **Real Eigenvector Manifolds**, integrates click-to-drop RK4 trajectories, and computes eigenvalues $\lambda_{1,2}$ & regime classification.
   - **Written Guide (`page.tsx`):** Matrix exponential $e^{At}$, trace/determinant identities ($\tau = \lambda_1 + \lambda_2$, $\Delta = \lambda_1\lambda_2$), and Poincaré stability chart.
2. **Chapter `4.3.2` (`nonlinear-nullclines-limit-cycles`) — Nonlinear Stability, Nullclines & Limit Cycles:**
   - **Lab (`NonlinearPhasePortraitLab.tsx`):**
     - Presets for **Nonlinear Pendulum**, **Van der Pol Limit Cycle**, **Lotka–Volterra Predator-Prey**, and **Bistable Toggle Switch**, plus custom $(\dot{x}=f(x,y), \dot{y}=g(x,y))$ inputs.
     - Displays marching-squares **$x$-Nullclines ($f=0$)** and **$y$-Nullclines ($g=0$)**, click-to-seed RK4 trajectories, coupled **$x(t), y(t)$ time waveforms**, and a live **Jacobian Linearization Inspector $J(x^*, y^*)$** computing eigenvalues at equilibrium intersections.
   - **Written Guide (`page.tsx`):** Nullcline sign-quadrant analysis, Hartman–Grobman Linearization Theorem, non-hyperbolic center fragility, and Poincaré–Bendixson Limit Cycles.

### Phase 4 — Module 4.4: Partial Differential Equations (`partial-differential-equations`) & Volume Completion
1. **Chapter `4.4.1` (`heat-equation-diffusion`) — The 1D/2D Heat Equation & Diffusive Smoothing:**
   - **Lab (`HeatEquationDiffusionLab.tsx`):**
     - Initial temperature profiles (**Square Pulse**, **Triangle Pluck**, **Dual Hotspots**, **Smooth Sinusoid**) under Dirichlet ($u=0$) or Insulated Neumann ($u_x=0$) boundaries with diffusivity $\alpha$, time $t \ge 0$, Play/Pause toggle, and mode truncation $N$.
     - Synchronized **2D Profile $u(x,t)$**, **Exponential Mode Spectrum $|b_n|e^{-\alpha(n\pi/L)^2 t}$**, and **3D Space-Time Diffusion Surface $u(x,t)$** in `ThreeOrbitViewport`.
   - **Written Guide (`page.tsx`):** Conservation law derivation ($u_t = \alpha u_{xx}$), Separation of Variables, $n^2$-frequency smoothing, and Laplace steady state ($\nabla^2 u = 0$).
2. **Chapter `4.4.2` (`wave-equation-normal-modes`) — The Wave Equation, Normal Modes & D'Alembert's Solution:**
   - **Lab (`WaveEquationModesLab.tsx`):**
     - Switch between **(a) 1D Vibrating String (`D'Alembert Traveling Pulses` $\frac{1}{2}[f(x-ct) + f(x+ct)]$ + Standing Modes)** showing odd-extension boundary reflections and **(b) 2D Rectangular Drumhead (`Chladni Eigenmodes` $(m, n)$)** in `ThreeOrbitViewport` with nodal line visualization.
   - **Written Guide (`page.tsx`):** Hyperbolic wave transport vs. parabolic diffusion, D'Alembert characteristic coordinates $\xi = x - ct, \eta = x + ct$, and Chladni nodal curves.
3. **Volume IV Completion Sync:** Update `archive/volumes/vol_04_differential_equations/README.md`, `archive/01_GLOBAL_STATUS.md`, `archive/01_CURRENT_STATUS.md`, and `AGENTS.md`, verify `npx tsc --noEmit` + clean `npm run build`, and commit/push each phase cleanly to `origin/main`.
