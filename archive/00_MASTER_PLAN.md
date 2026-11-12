# 00 — Master Architecture & Phased Development Plan (`wanna math`)

## 1. Project Overview
**wanna math** is a multi-page interactive engineering mathematics visualization platform. It is designed to build deep geometric intuition for advanced university/engineering mathematics—starting with **Multivariable Calculus** (Double Integrals, Triple Integrals, Coordinate Systems, and Jacobians) and architected to scale into **Linear Algebra**, **Vector Calculus**, **Differential Equations**, and **Fluid Dynamics**.

---

## 2. Technology Stack
- **Framework:** Next.js (App Router) + React + TypeScript
- **3D Rendering Engine:** Three.js (`three` + `@types/three`) with reusable declarative React viewport wrappers (`OrbitControls`, parametric surface builders, dynamic slicing planes, 3D wireframe/solid volume elements)
- **2D Interactive Graphs:** Custom precision SVG & HTML5 Canvas coordinate planes for Type I/II domains, polar grids, shadow projections, and $(u,v) \leftrightarrow (x,y)$ Jacobian grid morphing
- **Mathematical Typesetting:** `katex` (synchronous LaTeX rendering with semantic color macros)
- **Numerical Computation:** `mathjs` + custom Gauss-Legendre numerical quadrature for real-time integral evaluation
- **Styling & Icons:** Tailwind CSS v4 + CSS custom properties (`light-dark()` with `@media (prefers-color-scheme: dark)` fallbacks) + `lucide-react`

---

## 3. Multi-Page Route Structure

```text
/                                   -> Hub Page: Interactive 3D/2D Hero Preview, Domain Directory, v1.0 Topic Cards, Color-to-Math Legend
/calculus                           -> Domain Hub: Multivariable & Vector Calculus Overview & Concept Dependency Graph
/calculus/double-integrals          -> Topic 1: Double Integration (Riemann Prisms, Iterated Slicing, Type I/II Limits, Order Change dy dx <-> dx dy)
/calculus/triple-integrals          -> Topic 2: Triple Integration (3D Solids, 1D Ray -> 2D Curtain -> 3D Volume Collapse, 2D Shadow Projections, All 6 Orders)
/calculus/coordinate-systems        -> Topic 3: Coordinate Systems (2D Cartesian/Polar dA, 3D Cartesian/Cylindrical/Spherical Intersecting Surfaces, Basis Vectors, dV Inspector)
/calculus/jacobians                 -> Topic 4: Jacobians (Dual (u,v) <-> (x,y) Morphing Grid, Tangent Parallelogram, 2D/3D Jacobian Matrix Explorer, Integral Change of Variables)
/roadmap                            -> Living Curriculum Roadmap (Upcoming Domains: Linear Algebra, Vector Fields, PDEs, Fluid Dynamics)
```

---

## 4. Phased Execution Plan

### Phase 1: Project Foundation, Archive System, Design System & Multi-Page Shell
- Set up Git remote (`https://github.com/swapnonil2007/WannaMath.git`) with identity `swapnonil2007`.
- Create `AGENTS.md` and `/archive` documentation system.
- Initialize Next.js + TypeScript + Tailwind CSS + Three.js + KaTeX + Math.js.
- Implement butterfly color palette tokens, light/dark drafting theme support, traditional math typography, global navigation, curriculum registry (`src/registry/curriculum.ts`), interactive Landing Hub (`/`), Domain Overview (`/calculus`), Roadmap (`/roadmap`), and structured route shells for the 4 v1.0 topics.

### Phase 2: Topic 1 — Double Integration (`/calculus/double-integrals`)
- **Module 2A:** 2D Domain + 3D Surface & Riemann Sum Prisms ($N_x \times N_y$ resolution control, signed volume readout).
- **Module 2B:** Iterated Integrals & Cross-Sectional Slicing ($\int [\int f\,dy]\,dx$ vertical slice vs. $\int [\int f\,dx]\,dy$ horizontal slice with synchronized 2D strip and 3D glowing cross-section curtain).
- **Module 2C:** Order Change of Integration Laboratory (Fubini's Theorem) — interactive toggle between Type I ($dy\,dx$) and Type II ($dx\,dy$) for classic engineering domains (triangle, parabola, quarter-disk, non-elementary $\int_0^1 \int_x^1 e^{y^2}\,dy\,dx$), dynamically updating boundary curve colors and step-by-step KaTeX limits.

### Phase 3: Topic 2 — Triple Integration (`/calculus/triple-integrals`)
- **Module 3A:** 3D Solid Bounded Region Visualizer & 3-Stage Collapse Scrubber (Stage 1: 1D inner ray $\rightarrow$ Stage 2: 2D middle curtain slice $\rightarrow$ Stage 3: 3D outer solid accumulation).
- **Module 3B:** Synchronized 3D Solid + 2D Shadow Projection Viewport (automatic projection onto $xy$, $yz$, or $xz$ coordinate walls).
- **Module 3C:** All 6 Orders of Integration Engine ($dz\,dy\,dx$, $dz\,dx\,dy$, $dy\,dz\,dx$, $dy\,dx\,dz$, $dx\,dz\,dy$, $dx\,dy\,dz$) across multiple 3D solids (Tetrahedron, Paraboloid Cap, Cylindrical Wedge, First-Octant Sphere) with live color-coded limit derivation.

### Phase 4: Topic 3 — Coordinate Systems (`/calculus/coordinate-systems`)
- **Module 4A:** 2D Cartesian $(x,y)$ vs. Polar $(r,\theta)$ interactive comparator and $dA = r\,dr\,d\theta$ geometric area wedge inspector.
- **Module 4B:** 3D Coordinate Systems Stage — Cartesian $(x,y,z)$, Cylindrical $(r,\theta,z)$, and Spherical $(\rho,\phi,\theta)$ with toggleable intersecting coordinate surfaces (planes, cylinders, cones, spheres) and rotating local orthonormal basis vectors.
- **Module 4C:** Infinitesimal Volume Element ($dV$) 3D Magnifier — interactive zoomable 3D differential element proving $dV = dx\,dy\,dz$, $dV = r\,dr\,d\theta\,dz$, and $dV = \rho^2\sin\phi\,d\rho\,d\phi\,d\theta$.

### Phase 5: Topic 4 — Jacobians & Change of Variables (`/calculus/jacobians`)
- **Module 5A:** Synchronized Dual-Viewport $(u,v)$ Parameter Space and $(x,y)$ Physical Space with continuous Grid Morphing slider $t \in [0,1]$.
- **Module 5B:** Draggable Infinitesimal Patch & Local Linearization — visualizing partial derivative tangent vectors $\mathbf{r}_u\,\Delta u$ and $\mathbf{r}_v\,\Delta v$, the spanned parallelogram, and local area scaling factor $|\det J(u,v)|$.
- **Module 5C:** Interactive Jacobian Matrix Inspector (2D & 3D) and Change-of-Variables Integral Solver walkthrough.

### Phase 6: Cross-Topic Deep Linking, Polish & Final Verification
- Connect all 4 topics with contextual cross-links (e.g., jumping from Double Integral Polar Mode directly to the Coordinate Systems $dA$ proof or Jacobian $|J|=r$ derivation).
- Full accessibility, contrast, performance, and build verification.
