# Phase 5 Log — Topic 04: Jacobians & Change of Variables (`/calculus/jacobians`)

- **Date:** 2026-11-13
- **Phase:** Phase 5 of 6
- **Git Branch:** `main` (`https://github.com/swapnonil2007/WannaMath.git`)

## Completed Deliverables
1. **Laboratory 04.1 & 04.2 — Dual-Space $(u, v) \leftrightarrow (x, y)$ Transformation, Continuous Homotopy Morphing & Tangent Parallelogram (`src/components/visualizations/jacobians/DualGridMorphingAndTangentLab.tsx`):**
   - Built side-by-side Parameter Space $(u, v)$ and Physical Space $(x, y)$ interactive SVG viewports with a continuous homotopy slider $t \in [0, 1]$ ($T_t(u,v) = (1-t)(u,v) + t(x(u,v), y(u,v))$) and Play/Pause morph animation.
   - Implemented an interactive local patch $(u_0, v_0)$ of size $\Delta u \times \Delta v$ that users can move by clicking directly in the $(u,v)$ canvas or scrubbing sliders.
   - Built a Local Linearization Magnifier comparing the true curved image patch $T([u_0, u_0+\Delta u]\times[v_0, v_0+\Delta v])$ against the tangent parallelogram spanned by $\mathbf{r}_u\,\Delta u$ and $\mathbf{r}_v\,\Delta v$, with live central-difference evaluation of the $2 \times 2$ Jacobian matrix $J(u_0, v_0)$, determinant $\det J$, orientation status, and exact vs. linearized patch areas.
   - Integrated 4 canonical presets (`Polar Mapping`, `Affine Shear & Stretch`, `Parabolic Coordinates`, `Isoparametric Curved Grid`) plus `<MathExpressionInput />` custom math typing for custom transformations $x(u,v), y(u,v)$ and all 4 parameter domain bounds $u_{\min}, u_{\max}, v_{\min}, v_{\max}$.
2. **Laboratory 04.3 — Integral Domain Pullback $R_{xy} \longleftarrow T(R_{uv})$ & 2D/3D Jacobian Matrix Explorer (`src/components/visualizations/jacobians/JacobianIntegralPullbackLab.tsx`):**
   - Built an interactive 2D Change-of-Variables Domain Pullback solver with 4 presets (`Slanted Parallelogram`, `Elliptical Lamina`, `Hyperbolic First-Quadrant Region`, `Rotated Diamond / Rhombus`).
   - Added `<MathExpressionInput />` widgets for custom physical integrands $f(x, y)$, custom forward transformations $x(u, v), y(u, v)$, and all 4 pulled-back $(u, v)$ integration limits ($u_{\min}, u_{\max}, v_{\min}(u), v_{\max}(u)$).
   - Rendered side-by-side pulled-back $(u, v)$ and physical $(x, y)$ meshes with cells color-coded by local Jacobian distortion $|\det J(u, v)|$, comparing the true integral (with $|\det J|$) against the unweighted integral (omitting $|\det J|$).
   - Added an interactive 3D $3 \times 3$ Jacobian Matrix Explorer (`Cylindrical`, `Spherical`, and `Ellipsoidal Scaling`).
3. **Route, Curriculum & Archive Updates:**
   - Wired both laboratories and a 1D/2D/3D Jacobian geometric summary into `/calculus/jacobians` (`src/app/calculus/jacobians/page.tsx`).
   - Marked `jacobians` as `"available"` in `src/registry/curriculum.ts` (all 4 v1.0 Multivariable Calculus topics are now live!) and updated `/roadmap` and `archive/01_CURRENT_STATUS.md`.
