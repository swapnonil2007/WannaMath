# Volume II — Linear Algebra & Space Geometry (`linear-algebra`) 3-Phase Plan

> **Scope:** Build and publish all 3 modules and 9 chapters of **Volume II: Linear Algebra & Space Geometry** (`/linear-algebra`, Accent: `#96B898` Sage Green) following the `wanna math` 4-tier taxonomy and visual standards.
> **Registry Target:** [`src/registry/vol2-linear-algebra.ts`](../../../src/registry/vol2-linear-algebra.ts)
> **Visualization Directory:** `src/components/visualizations/linear-algebra/`

---

## Architecture & Semantic Butterfly Color Roles (Zero Gradients)

- `#8D9FCE` (Periwinkle) for first basis/column vector ($\mathbf{v}_1, \hat{\mathbf{i}}, \mathbf{a}_1$), domain row space $\mathcal{R}(A^T)$, and input direction $\mathbf{v}$.
- `#96B898` (Sage Green) for second basis/column vector ($\mathbf{v}_2, \hat{\mathbf{j}}, \mathbf{a}_2$), column space $\mathcal{C}(A)$, and Volume II accent.
- `#029091` (Deep Teal) for 3D span planes, transformed grids, 3D parallelepipeds, and quadratic form surfaces.
- `#D35323` (Persimmon) for linear combination target $\mathbf{w} = c_1\mathbf{v}_1 + c_2\mathbf{v}_2$, transformed vector $A\mathbf{x}$, primary eigenvector, and singular collapse warnings.
- `#FBEAA4` (Buttermilk Cream) for unit circle/cube highlights, projection residual $\mathbf{e} = \mathbf{b} - \mathbf{p}$, and left nullspace $\mathcal{N}(A^T)$.
- `#B95869` (Crimson) for nullspace $\mathcal{N}(A)$, negative orientation flips ($\det A < 0$), and saddle eigendirections.

---

## Phase-by-Phase Execution Blueprint

### Phase 1 — Module 2.1: Vectors, Span & The Fundamental Subspaces (`vectors-subspaces`)
1. **Chapter `2.1.1` (`vectors-linear-combinations`) — Vectors, Linear Combinations & Span in 2D/3D:**
   - **Lab (`VectorSpanExplorerLab.tsx`):** Toggle between **2D Plane** and **3D Space (`ThreeOrbitViewport`)**; drag/edit vectors $\mathbf{v}_1, \mathbf{v}_2$ (and $\mathbf{v}_3$ in 3D) plus scalar weights $c_1, c_2$ ($c_3$), inspect span geometry (point, 1D line, 2D translucent span plane, or full $\mathbb{R}^3$), solve $\mathbf{b} = x_1\mathbf{v}_1 + x_2\mathbf{v}_2$ for a clicked target $\mathbf{b}$, and detect collinear/coplanar rank collapse.
   - **Written Guide (`page.tsx`):** Geometric linear combinations, span classification by rank, and linear dependence as redundant volume.
2. **Chapter `2.1.2` (`basis-change-of-basis`) — Linear Independence, Basis & Change of Basis:**
   - **Lab (`ChangeOfBasisLab.tsx`):** Dual overlaid coordinate grids combining Cartesian axes $(\hat{\mathbf{i}}, \hat{\mathbf{j}})$ with an oblique basis matrix $P = [\mathbf{b}_1 \mid \mathbf{b}_2]$; click physical points $\mathbf{x}$ or scrub basis coordinates $(c_1, c_2)$ to compute $\mathbf{x} = P[\mathbf{x}]_{\mathcal{B}}$ and $[\mathbf{x}]_{\mathcal{B}} = P^{-1}\mathbf{x}$ simultaneously.
   - **Written Guide (`page.tsx`):** Basis matrix $P$, coordinate invariance of physical points, and why $\det(P) = 0$ breaks unique coordinates.
3. **Chapter `2.1.3` (`four-fundamental-subspaces`) — The Four Fundamental Subspaces & Rank–Nullity:**
   - **Lab (`FourSubspacesLab.tsx`):** Interactive **Strang Four Fundamental Subspaces Action Diagram** pairing the domain $\mathbb{R}^n$ ($\mathcal{R}(A^T) \perp \mathcal{N}(A)$) with the codomain $\mathbb{R}^m$ ($\mathcal{C}(A) \perp \mathcal{N}(A^T)$) across rank-2, rank-1, and 3×2/2×3 matrices; click or scrub any input $\mathbf{x}$ to split $\mathbf{x} = \mathbf{x}_r + \mathbf{x}_n$ and watch $A\mathbf{x}_n = \mathbf{0}$ while $A\mathbf{x}_r$ maps bijectively onto $\mathcal{C}(A)$.
   - **Written Guide (`page.tsx`):** Rank–Nullity Theorem, orthogonal complements, and solvability $A\mathbf{x} = \mathbf{b} \iff \mathbf{b} \in \mathcal{C}(A) \perp \mathcal{N}(A^T)$.

### Phase 2 — Module 2.2: Matrices as Linear Transformations & Determinants (`linear-transformations`)
1. **Chapter `2.2.1` (`matrix-transformations-2d-3d`) — Matrix Multiplication as Composition of Transformations:**
   - **Lab (`MatrixTransformationLab.tsx`):** Continuous grid homotopy $t \in [0,1]$ morphing unit square and basis vectors $(\hat{\mathbf{i}}, \hat{\mathbf{j}}) \to (\mathbf{a}_1, \mathbf{a}_2)$, plus two-matrix composition comparer demonstrating $BA \neq AB$.
2. **Chapter `2.2.2` (`determinants-volume-scaling`) — Determinants as Oriented Area & Parallelepiped Volume Scaling:**
   - **Lab (`DeterminantVolumeLab.tsx`):** Switch between 2D oriented parallelogram area $\det[\mathbf{a}_1\;\mathbf{a}_2]$ and 3D parallelepiped volume $\mathbf{a}_1 \cdot (\mathbf{a}_2 \times \mathbf{a}_3)$ in `ThreeOrbitViewport`, highlighting orientation reversal ($\det < 0$) and singular collapse ($\det = 0$).
3. **Chapter `2.2.3` (`orthogonality-least-squares`) — Orthogonality, Projections & Least-Squares Fitting:**
   - **Lab (`LeastSquaresProjectionLab.tsx`):** Synchronize 3D subspace projection $\mathbf{p} = A\hat{\mathbf{x}}$ minimizing $\|\mathbf{b} - \mathbf{p}\|_2$ with a clickable 2D scatter-plot linear/quadratic regression fitter driven by normal equations $A^T A \hat{\mathbf{x}} = A^T \mathbf{b}$.

### Phase 3 — Module 2.3: Eigen-Systems, Diagonalization & SVD (`eigen-systems-svd`)
1. **Chapter `2.3.1` (`eigenvalues-eigenvectors`) — Eigenvalues, Eigenvectors & Invariant Directions:**
   - **Lab (`EigenvectorCompassLab.tsx`):** Sweep angle $\theta$ around unit circle comparing $\mathbf{v}$ vs. $A\mathbf{v}$, highlight collinear eigenvector rays, and plot $\det(A - \lambda I) = 0$ characteristic parabola.
2. **Chapter `2.3.2` (`quadratic-forms-spectral`) — Spectral Theorem, Quadratic Forms & Principal Axes:**
   - **Lab (`QuadraticFormLab.tsx`):** 3D surface $q(\mathbf{x}) = \mathbf{x}^T A \mathbf{x}$ with contour principal axes rotated by orthogonal matrix $Q$ (`A = Q Λ Qᵀ`).
3. **Chapter `2.3.3` (`singular-value-decomposition`) — Singular Value Decomposition (SVD) Geometry:**
   - **Lab (`SVDThreeStageLab.tsx`):** Interactive stepper stepping unit circle through $V^T$ (input rotation), $\Sigma$ (axis stretch by $\sigma_1, \sigma_2$), and $U$ (output rotation), plus rank-1 outer product $\sigma_1 \mathbf{u}_1 \mathbf{v}_1^T$ overlay.
