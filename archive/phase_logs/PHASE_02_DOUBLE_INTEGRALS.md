# Phase 2 Log — Topic 01: Double Integration, Limits & Order Change (`/calculus/double-integrals`)

- **Date:** 2026-11-12
- **Phase:** Phase 2 of 6
- **Git Branch:** `main` (`https://github.com/swapnonil2007/WannaMath.git`)

## Completed Deliverables
1. **Laboratory 01.1 — 2D Domain & 3D Riemann Volume Convergence (`src/components/visualizations/double-integrals/RiemannVolumeLab.tsx`):**
   - Built synchronized 3D Three.js Riemann column array and clickable 2D SVG partition grid.
   - Included 4 engineering surfaces (Paraboloid Dome, Hydrostatic Pressure Plane, Hyperbolic Twist Saddle, Harmonic Standing Mode) and 3 domain shapes (Rectangle, Triangle $y \le x$, Quarter Disk).
   - Added $N_x, N_y \in [2, 22]$ subdivision sliders, sample point rule selector (Midpoint, Lower-Left, Upper-Right), smooth surface overlay toggle, clickable cell inspector ($\Delta A_{ij}, \Delta V_{ij}$), and 2D Gauss-Legendre quadrature reference volume comparison.
2. **Laboratory 01.2–01.4 — Iterated Slicing, Boundary Limits & Order Change (`src/components/visualizations/double-integrals/IteratedOrderChangeLab.tsx`):**
   - Built synchronized 3D cross-sectional curtain sweeper + partial accumulated volume mesh ($\int_a^{x_0} A(x)\,dx$) and 2D entry/exit ray diagram.
   - Added 5 curated domain presets:
     1. Non-Elementary Integral $\int_0^1 \int_x^1 e^{y^2}\,dy\,dx \leftrightarrow \int_0^1 \int_0^y e^{y^2}\,dx\,dy$
     2. Parabolic Spandrel ($x^2 \le y \le 1$)
     3. Lens Region between $y = x^2$ and $y = x$
     4. Quarter Circular Sector ($x^2 + y^2 \le 1$)
     5. Split-Boundary Triangle ($0 \le y \le 1, y \le x \le 2-y$) demonstrating 1 unified integral in Type II ($dx\,dy$) vs. 2 split integrals at $x=1$ in Type I ($dy\,dx$).
   - Implemented accessible `<details>` step-by-step algebraic bound inversion disclosures.
3. **Route & Archive Updates:**
   - Wired both laboratories into `/calculus/double-integrals` (`src/app/calculus/double-integrals/page.tsx`).
   - Updated `src/registry/curriculum.ts`, `src/app/roadmap/page.tsx`, and `archive/01_CURRENT_STATUS.md`.
