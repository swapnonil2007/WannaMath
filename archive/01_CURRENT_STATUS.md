# 01 — Current Project Status (`wanna math`)

> **Last Updated:** Phase 1 Implementation
> **Active Branch:** `main` (`https://github.com/swapnonil2007/WannaMath.git`)

---

## Phase Progress Overview

| Phase | Title | Status | Summary |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Foundation, Archive System, Design System & Multi-Page Shell** | **COMPLETED** | Next.js + TS + Tailwind + Three.js + KaTeX initialized; `/archive` & `AGENTS.md` created; Butterfly palette tokens & traditional serif/math typography applied; Multi-page navigation, Curriculum Registry, Interactive Landing Hub (`/`), Calculus Hub (`/calculus`), Roadmap (`/roadmap`), and all 4 topic route shells built. |
| **Phase 2** | **Topic 1: Double Integration (`/calculus/double-integrals`)** | **NEXT UP** | Full 2D/3D Riemann sum visualizer, iterated cross-sectional slicing ($dy\,dx$ vs $dx\,dy$), Type I/II boundary explorer, and Fubini order-reversal lab. |
| **Phase 3** | **Topic 2: Triple Integration (`/calculus/triple-integrals`)** | PLANNED | 3D solid regions, 1D ray $\rightarrow$ 2D curtain $\rightarrow$ 3D volume scrubber, 2D shadow projections, and all 6 orders of integration ($dz\,dy\,dx$, etc.). |
| **Phase 4** | **Topic 3: Coordinate Systems (`/calculus/coordinate-systems`)** | PLANNED | 2D Polar/Cartesian & 3D Cartesian/Cylindrical/Spherical intersecting coordinate surfaces, local basis triads, and 3D zoomable $dV$ volume element inspector. |
| **Phase 5** | **Topic 4: Jacobians (`/calculus/jacobians`)** | PLANNED | Dual $(u,v) \leftrightarrow (x,y)$ grid morphing, draggable local patch with tangent vectors $\mathbf{r}_u, \mathbf{r}_v$, interactive Jacobian matrix, and integral substitution walkthrough. |
| **Phase 6** | **Cross-Linking, Performance Audit & Final Polish** | PLANNED | Deep pedagogical links across all 4 topics, 60 FPS WebGL optimization, and final QA. |

---

## How to Run & Verify Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build & typecheck verification
npm run build
```

---

## Immediate Next Step for the Agent (Phase 2)
Build the complete interactive visualization suite inside `src/app/calculus/double-integrals/page.tsx` and `src/components/visualizations/double-integrals/`:
1. **Riemann Volume & Surface Lab** (2D domain + 3D surface $z = f(x,y)$ with $N_x, N_y$ subdivisions).
2. **Iterated Slicing Explorer** (synchronized 2D strip & 3D cross-sectional area $A(x)$ or $A(y)$ sweep).
3. **Order Change of Integration Laboratory** (interactive toggle swapping $dy\,dx \leftrightarrow dx\,dy$ with animated strip rotation, color-coded boundary curves, and step-by-step KaTeX limit conversion).
