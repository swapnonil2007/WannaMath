# Volume V — Transforms & Complex Analysis (`transforms-complex-analysis`) 4-Phase Plan

> **Scope:** Build and publish all 4 modules and 8 chapters of **Volume V: Transforms & Complex Analysis** (`/transforms-complex-analysis`, Accent: `#D5658B` Dusty Rose) following the `wanna math` 4-tier architecture and visual standards.
> **Registry Target:** [`src/registry/vol5-transforms-complex.ts`](../../../src/registry/vol5-transforms-complex.ts)
> **Visualization Directory:** `src/components/visualizations/transforms-complex/`
> **Status:** Planned & Ready for Phase-by-Phase Execution (Phases 1–4).

---

## Architecture & Visual Standards

- **Butterfly Semantic Color Palette (Zero Gradients):**
  - `#8D9FCE` (Periwinkle) for real axes ($\operatorname{Re} z$, $\sigma$, $t$), input grid curves ($x = c$), cosine components, and system zeros ($\circ$).
  - `#96B898` (Sage Green) for imaginary axes ($\operatorname{Im} z$, $\omega$), orthogonal curves ($y = c$), Fourier time-signal profiles, and ROC stability regions.
  - `#029091` (Deep Teal) for 3D complex/Laplace magnitude surfaces ($|f(z)|$, $|F(s)|$), Cauchy contours, and harmonic spectra.
  - `#D35323` (Persimmon) for active pole singularities ($\times$), active frequency/time scrubbers, phase arrows, and convolution overlap areas.
  - `#FBEAA4` (Buttermilk Cream) for 3D Euler helix projection traces, unit circle $|z| = 1$, Gibbs overshoot markers, and complex centroids.
  - `#D5658B` / `#B95869` (Dusty Rose / Crimson) for Volume V accent, unstable right half-plane $\operatorname{Re}(s) > 0$, residue loops, and phase lag plots.
- **Shared Primitives:** `ThreeOrbitViewport`, `SvgCoordinatePlane2D`, `createParametricSurfaceMesh`, `createVectorArrow3D`, `extractLevelCurveSegments`, `integrate1DGaussLegendre`, `mathToThreeVec3`, `<KaTeXMath />`.

---

## Phase-by-Phase Execution Blueprint

### Phase 1 — Module 5.1: Complex Numbers & Conformal Mappings (`complex-functions-conformal`)
1. **Chapter `5.1.1` (`euler-formula-complex-plane`) — Complex Plane, Euler's Formula & Phasor Geometry:**
   - **Lab (`EulerHelixPhasorLab.tsx`):**
     - Synchronized **3D Complex Exponential Helix $(t, \operatorname{Re} z, \operatorname{Im} z)$** (`ThreeOrbitViewport`) for $z(t) = A e^{(\sigma + i\omega)t}$ casting orthogonal shadows onto the real cosine wall ($\operatorname{Re}(z) = A e^{\sigma t}\cos\omega t$) and imaginary sine wall ($\operatorname{Im}(z) = A e^{\sigma t}\sin\omega t$).
     - Synchronized **2D Argand Phasor Multiplier** showing $z_1 = r_1 e^{i\theta_1}$, $z_2 = r_2 e^{i\theta_2}$, and geometric product $z_1 z_2 = r_1 r_2 e^{i(\theta_1+\theta_2)}$ + $e^{i\theta}$ unit circle slider.
   - **Written Guide (`page.tsx`):** Taylor derivation of Euler's formula, polar multiplication geometry, and damped spiral phasors $\sigma \lessgtr 0$.
2. **Chapter `5.1.2` (`cauchy-riemann-conformal`) — Analyticity, Cauchy-Riemann Equations & Conformal Grids:**
   - **Lab (`ConformalMappingLab.tsx`):**
     - Dual-pane **Input $z$-Plane** & **Output $w = f(z)$ Plane** across analytic presets ($z^2$, $e^z$, $1/z$ Möbius inversion, Joukowski airfoil $z + a^2/z$) plus a **Non-Analytic Contrast** ($w = \bar{z}$ or $2x + iy$) violating Cauchy–Riemann!
     - Click any cell `(x₀, y₀)` to inspect the orthogonal tangent vectors $\partial w/\partial x$ and $\partial w/\partial y$, intersection angle $\angle(\mathbf{T}_u, \mathbf{T}_v) = 90^\circ$, local Jacobian amplification $|f'(z_0)|$, and harmonic level contours $u(x,y)=c_1 \perp v(x,y)=c_2$.
   - **Written Guide (`page.tsx`):** Complex derivative existence $\implies$ Cauchy–Riemann equations ($u_x = v_y, u_y = -v_x$), conformal angle preservation wherever $f'(z) \ne 0$, and Laplace harmonicity $\nabla^2 u = \nabla^2 v = 0$.

### Phase 2 — Module 5.2: Contour Integration & The Residue Theorem (`contour-integration`)
1. **Chapter `5.2.1` (`cauchy-integral-formula`) — Complex Line Integrals & Cauchy's Integral Theorem:**
   - **Lab (`CauchyContourLab.tsx`):**
     - Interactive draggable/resizable circular or rectangular contour $C$ in the $z$-plane over functions $1/(z - z_0)$, $1/(z^2 + 1)$, or $e^z / (z - z_0)$, with live numerical Riemann/Gauss-Legendre complex line integral $\oint_C f(z)\,dz = \text{Re} + i\,\text{Im}$.
     - Displays **Winding Number $W(C, z_0)$**, path-deformation homotopy sliders confirming $\oint_C f(z)\,dz = 0$ inside simply-connected analytic domains, and instant jump to $2\pi i f(z_0)$ when $C$ crosses $z_0$.
   - **Written Guide (`page.tsx`):** Splitting $\oint (u+iv)(dx+i\,dy)$ into real Green's Theorem curls (whose zero divergence/curl equals Cauchy–Riemann), topological winding, and Cauchy's Integral Formula.
2. **Chapter `5.2.2` (`poles-residue-theorem`) — Poles, Laurent Series & The Residue Theorem:**
   - **Lab (`ResidueTheoremLab.tsx`):**
     - Synchronized **3D Analytic Landscape $|f(z)|$** (`ThreeOrbitViewport`) revealing asymptotic pole chimneys & zeros alongside a **2D Contour & Pole Encloser** ($z$-plane with interactive contour center/radius and pole selection across rational, trigonometric, and double-pole functions).
     - Computes exact local Laurent residues $\operatorname{Res}(f, z_k)$, sums $2\pi i \sum_{z_k \in \text{int}(C)} \operatorname{Res}(f, z_k)$, and links to real improper integral evaluation $\int_{-\infty}^\infty f(x)\,dx$.
   - **Written Guide (`page.tsx`):** Principal-part Laurent coefficient $a_{-1}$, simple vs. order-$m$ pole formulas, and Jordan semicircle real-integral closing tricks.

### Phase 3 — Module 5.3: Laplace Transforms & s-Plane Poles/Zeros (`laplace-transforms`)
1. **Chapter `5.3.1` (`s-plane-poles-zeros`) — The s-Plane Surface, Poles/Zeros & Region of Convergence:**
   - **Lab (`LaplaceSPlane3DLab.tsx`):**
     - Interactive **$s$-Plane Pole-Zero Designer** (drag conjugate pole pair $\sigma_p \pm i\omega_p$ and zero locations, or choose Underdamped, Critically Damped, Marginal Oscillator, Bandpass Filter, Unstable RHP).
     - Synchronized **3D Surface $|H(\sigma + i\omega)|$** (`ThreeOrbitViewport`) sliced cleanly along the $\sigma = 0$ imaginary axis (`iω` Bode Tent!) together with shaded **ROC ($\operatorname{Re}(s) > \max\sigma_p$)**, **Bode Magnitude $|H(i\omega)|$**, and **Step/Impulse Time Response $h(t)$**.
   - **Written Guide (`page.tsx`):** Bromwich complex frequency $s = \sigma + i\omega$, RHP vs. LHP pole stability, why ROC must avoid poles, and $j\omega$-slice Bode interpretation.
2. **Chapter `5.3.2` (`impulse-response-convolution`) — Impulse Response, Step Response & Convolution Integral:**
   - **Lab (`ConvolutionFlipSlideLab.tsx`):**
     - Scrub output time $t \in [0, 8]$ to watch input $x(\tau)$ stay fixed while the flipped, shifted impulse kernel $h(t - \tau)$ slides across it, shading their live product overlap $x(\tau)h(t - \tau)$ and integrating step-by-step into $y(t) = (x * h)(t)$.
     - Presets covering **Boxcar * Boxcar → Triangle**, **Exponential Decay Low-Pass Filtering of Step/Pulse**, and **Damped Oscillator Impulse Echoes**, plus algebraic verification $Y(s) = X(s)H(s)$.
   - **Written Guide (`page.tsx`):** Flip-shift geometry of $\tau$ vs. $t$, impulse sifting property, and why convolution in time equals pointwise multiplication in the Laplace $s$-domain.

### Phase 4 — Module 5.4: Fourier Series & Fourier Transforms (`fourier-analysis`) & Volume Completion
1. **Chapter `5.4.1` (`fourier-series-gibbs`) — Orthogonal Harmonics, Epicycles & Gibbs Phenomenon:**
   - **Lab (`FourierSeriesGibbsLab.tsx`):**
     - Wave presets (**Square Wave**, **Sawtooth**, **Triangle Wave**, **Half-Wave Rectifier**, **Sharp Pulse Train**) with harmonic truncation slider $N \in [1, 50]$.
     - Displays **Partial Sum Synthesis $S_N(t)$** overlaid on true $f(t)$ with zoomed **~9% Gibbs Overshoot Callout** at discontinuities, **Complex Rotating Epicycle Chain** tracing $f(t)$, and **Discrete Harmonic Magnitude Spectrum $|c_n|$**.
   - **Written Guide (`page.tsx`):** $L^2$ orthogonal basis projection $\langle e^{in\omega_0 t}, e^{im\omega_0 t}\rangle = T\delta_{nm}$, Parseval energy identity, and why $1/n$ vs. $1/n^2$ tail decay controls continuity vs. Gibbs ringing.
2. **Chapter `5.4.2` (`fourier-transform-spectra`) — Continuous Fourier Transform & Time-Frequency Uncertainty:**
   - **Lab (`FourierTransformWindingLab.tsx`):**
     - Interactive **Complex Winding Machine**: wrap signal $f(t)$ (Gaussian Pulse, Rectangular Gate, Morlet Wavelet, Dual-Tone Beat) around the origin along $f(t)e^{-i\omega t}$ as winding frequency $\omega$ sweeps.
     - Synchronized 3-panel display: **(a) Time Signal $f(a t)$** with adjustable width $a$, **(b) Complex Winding Coil & Center-of-Mass $\hat{f}(\omega)$**, and **(c) Magnitude Spectrum $|\hat{f}(\omega)|$** proving $\Delta t \cdot \Delta \omega \ge \frac{1}{2}$.
   - **Written Guide (`page.tsx`):** Limiting $T \to \infty$ passage from discrete series to continuous integral, center-of-mass frequency resonance intuition, and Heisenberg–Gabor Uncertainty Principle.
3. **Volume V Completion Sync:** Update `archive/volumes/vol_05_transforms_complex/README.md`, `archive/01_GLOBAL_STATUS.md`, `archive/01_CURRENT_STATUS.md`, and `AGENTS.md`, verify `npx tsc --noEmit` + clean `npm run build`, and commit/push each phase cleanly to `origin/main`.
