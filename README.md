# wanna math (`WannaMath`)

**Wanna Math — Interactive Engineering Mathematics Playground** (`v2.0`)

An open-source, interactive **6-Volume Engineering Mathematics Textbook & Visualization Platform** built to make university-level mathematics intuitive, visual, and fast to grasp for students and engineers. Every chapter pairs traditional $\KaTeX$ symbolic notation with synchronized 2D SVG plots and 3D WebGL viewports inside a structured **Volume → Module → Chapter → Lab** architecture.

---

## Textbook Scope (100% Complete: 6 Volumes • 20 Modules • 65 Chapters • 82 Labs)

| Volume | Route Base | Topics Covered | Modules | Chapters | Interactive Labs |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Vol. I: Single-Variable Calculus** | `/single-variable-calculus` | $\varepsilon$-$\delta$ limits, continuity & IVT, secant/tangent homotopy, Newton–Raphson, chain rule, Taylor curvature, Riemann sums, FTC, $u$-sub & IBP, solids of revolution, series & power series | 4 | 12 | 12 |
| **Vol. II: Linear Algebra & Space Geometry** | `/linear-algebra` | Vector span, change of basis, four fundamental subspaces, matrix transformations, determinants & volume scaling, least-squares projection, eigenvectors, quadratic forms, 3-stage SVD | 3 | 9 | 9 |
| **Vol. III: Multivariable & Vector Calculus** | `/multivariable-calculus` | Surfaces & level curves, partial derivatives & tangent planes, Taylor & Hessian extrema, Euler's theorem, double/triple integrals, curvilinear coordinates, Jacobians, improper integrals, Gamma/Beta, $\nabla\phi$, directional derivatives, divergence & curl, line/surface/Green's/Stokes'/Divergence theorems | 3 | 24 | 41 |
| **Vol. IV: Differential Equations & Dynamical Systems** | `/differential-equations` | Direction fields & Picard iterates, phase lines & bifurcations, damped/forced resonance, trace–determinant portraits, nonlinear nullclines & limit cycles, 1D heat diffusion & 1D/2D wave normal modes | 4 | 8 | 8 |
| **Vol. V: Transforms & Complex Analysis** | `/transforms-complex-analysis` | Euler helix & phasors, conformal mapping, Cauchy integral theorem, Laurent poles & residues, 3D Laplace $s$-plane surfaces, convolution, Fourier series & Gibbs phenomenon, Fourier transform winding | 4 | 8 | 8 |
| **Vol. VI: Probability, Statistics & Numerical Methods** | `/probability-numerical-methods` | Continuous PDFs/CDFs & moments, 3D bivariate Gaussian marginals & covariance ellipses, Midpoint/Trapezoidal/Simpson/Gauss–Legendre quadrature with log–log error slopes, Euler/Heun/RK4 slope probes | 2 | 4 | 4 |
| **Total** | **`/[volume]/[module]/[chapter]`** | **Full 6-Volume Engineering Mathematics Curriculum** | **20** | **65** | **82** |

---

## Key Features

- **Synchronized 2D + 3D Laboratories:** Interact directly with sliders, draggable domain probes, clickable 2D planes, and orbitable 3D WebGL geometry rendered via shared primitives (`ThreeOrbitViewport`, `SvgCoordinatePlane2D`, marching squares/tetrahedra level extractors, and Gauss–Legendre quadrature).
- **Live Symbolic Expression Parsing:** Custom function inputs (`MathExpressionInput` powered by `mathjs` + `KaTeX`) validate and typeset user equations across multivariable calculators and integrators.
- **4-Step Pedagogical Chapter Rhythm:** Each published chapter guides learners through *(1) Core Geometric Question → (2) Interactive Discovery → (3) Symbolic Formalization → (4) Edge Cases & Next-Chapter Bridge*, alongside prerequisite chips and step-by-step worked derivations.
- **Traditional Academic Typography & Eye-Comfortable Themes:** Combines `Newsreader` serif prose, `KaTeX` computer-modern equations, `IBM Plex Sans` UI controls, and `JetBrains Mono` (`tabular-nums`) readouts across **Drafting Slate Dark Mode** (`#1E1F22`) and **Warm Paper Light Mode** (`#FFFBE4`), built strictly with flat surfaces and a semantic Butterfly color palette (zero decorative gradients).
- **Global Navigation:** Quick access to the **6-Volume TOC** `<dialog>` drawer, the complete **Syllabus Matrix** (`/roadmap`), and **About** (`/about`).

---

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Static Site Generation via `generateStaticParams`)
- **UI & Language:** [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **3D & 2D Graphics:** [Three.js](https://threejs.org/) (`OrbitControls` + WebGL geometry disposal) & accessible custom SVG planes
- **Math Typesetting & Parsing:** [KaTeX](https://katex.org/) & [mathjs](https://mathjs.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## Project Structure

```text
├── src/
│   ├── app/
│   │   ├── [volume]/[module]/[chapter]/   # 4-tier Volume → Module → Chapter dispatcher
│   │   ├── calculus/                       # Permanent-redirected v1.0 fallback routes
│   │   ├── roadmap/                        # Master 6-Volume Syllabus Matrix
│   │   ├── about/                          # Project mission, open-source overview & creator bio
│   │   ├── layout.tsx                      # Root fonts, theme initialization & site metadata
│   │   └── globals.css                     # Butterfly palette tokens, light-dark() & focus rules
│   ├── components/
│   │   ├── layout/                         # Navbar, TextbookSidebar (<dialog>), TopicPageShell, Footer
│   │   ├── math/                           # KaTeXMath & live MathExpressionInput compiler
│   │   └── visualizations/
│   │       ├── primitives/                 # Shared 3D WebGL, 2D SVG, contour & quadrature helpers
│   │       ├── single-variable/            # Volume I labs
│   │       ├── linear-algebra/             # Volume II labs
│   │       ├── multivariable-differentiation/, integral-calculus/, double-integrals/,
│   │       │   triple-integrals/, coordinate-systems/, jacobians/, vector-calculus/  # Volume III labs
│   │       ├── differential-equations/     # Volume IV labs
│   │       ├── transforms-complex/         # Volume V labs
│   │       └── probability-numerical/      # Volume VI labs
│   └── registry/                           # 6-volume typed curriculum manifests (vol1..vol6)
├── public/images/                          # Static image assets
├── archive/                                # Master plan, design tokens, adding-topics guide & logs
└── AGENTS.md                               # Architectural rules & engineering handoff guide
```

---

## Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/swapnonil2007/WannaMath.git
cd WannaMath

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Run typecheck and production build
npx tsc --noEmit
npm run build
```

Open `http://localhost:3000` in your browser.

---

## Contributing & Documentation

**wanna math** is open source so students, educators, and engineers can inspect implementations, fix bugs, refine explanations, or contribute new interactive laboratories.

Before contributing a new chapter or visualization, review:
- [`AGENTS.md`](./AGENTS.md) — Engineering constraints, color tokens, and git workflow
- [`archive/00_MASTER_TEXTBOOK_PLAN.md`](./archive/00_MASTER_TEXTBOOK_PLAN.md) — 4-tier pedagogical taxonomy
- [`archive/02_DESIGN_SYSTEM_TOKENS.md`](./archive/02_DESIGN_SYSTEM_TOKENS.md) — Semantic Butterfly palette rules
- [`archive/03_ADDING_NEW_TOPICS_GUIDE.md`](./archive/03_ADDING_NEW_TOPICS_GUIDE.md) — Step-by-step guide to registering chapters and labs

---

## Creator

Built by **Swapnonil Nath** — 1st-year UG B.Tech in Ocean Engineering and Naval Architecture at IIT Kharagpur, and co-founder at [Spot My Business](https://spotmybusiness.in).

- GitHub: [@swapnonil2007](https://github.com/swapnonil2007)
- LinkedIn: [Swapnonil Nath](https://www.linkedin.com/in/swapnonil-nath-gmb-expert/)
