# wanna math (`WannaMath`)

> **Math ain't scary (not anymore)** — Interactive Engineering Mathematics Playground (`v2.0`)

An open-source, interactive **6-Volume Engineering Mathematics Textbook & Visualization Platform** built to make university-level mathematics intuitive, visual, and fast to grasp for students and engineers. Every chapter pairs traditional $\KaTeX$ symbolic notation with synchronized 2D SVG plots and 3D WebGL viewports inside a structured **Volume → Module → Chapter → Lab** architecture across **`113` statically generated routes**.

---

## Documentation Hub

| Guide | What It Covers |
| :--- | :--- |
| **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)** | 4-tier Next.js 15 App Router architecture, static generation (`113/113` routes), typed registry (`vol1`–`vol6`), `TopicPageShell`, legacy redirects, and `next/dynamic` lab splitting |
| **[`docs/CURRICULUM_CATALOG.md`](./docs/CURRICULUM_CATALOG.md)** | Complete index of all **6 Volumes, 20 Modules, 65 Chapters, and 82 Interactive Labs** with canonical URLs, study estimates, and component keys |
| **[`docs/VISUALIZATION_AND_MATH_ENGINE.md`](./docs/VISUALIZATION_AND_MATH_ENGINE.md)** | Butterfly palette tokens, zero-gradient flat design, Light/Dark WCAG AA adaptive inks (`--math-ink-*`), tree-shaken `mathjs/number` compiler, and shared 2D/3D primitives |
| **[`docs/SEO_GEO_PERFORMANCE.md`](./docs/SEO_GEO_PERFORMANCE.md)** | Technical SEO (`sitemap.xml`, `robots.txt`, OG/Twitter, PWA icons), GEO (`/llms.txt`, `/llms-full.txt`, Schema.org JSON-LD `@graph`), CWV/CLS engineering, & Lighthouse/AST verification benchmarks |
| **[`docs/CONTRIBUTING_AND_DEPLOYMENT.md`](./docs/CONTRIBUTING_AND_DEPLOYMENT.md)** | Local setup, environment variables (`NEXT_PUBLIC_SITE_URL`), chapter/lab authoring workflow, accessibility/design rules, and Vercel production deployment checklist |

*(Internal architectural rules and historical milestone logs remain preserved in [`AGENTS.md`](./AGENTS.md) and [`archive/`](./archive/).)*

---

## Textbook Scope (100% Complete: 6 Volumes • 20 Modules • 65 Chapters • 82 Labs)

| Volume | Route Base | Topics Covered | Modules | Chapters | Interactive Labs |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Vol. I: Single-Variable Calculus** | `/single-variable-calculus` | $\varepsilon$-$\delta$ limits, continuity & IVT, secant/tangent homotopy, Newton–Raphson, chain rule, Taylor curvature, Riemann sums, FTC, $u$-sub & IBP, solids of revolution, series & power series | 4 | 12 | 12 |
| **Vol. II: Linear Algebra & Space Geometry** | `/linear-algebra` | Vector span, change of basis, four fundamental subspaces, matrix transformations, determinants & volume scaling, least-squares projection, eigenvectors, quadratic forms, 3-stage SVD | 3 | 9 | 9 |
| **Vol. III: Multivariable & Vector Calculus** | `/multivariable-calculus` | Surfaces & level curves, partial derivatives & tangent planes, Taylor & Hessian extrema, Euler's theorem, first/higher-order ODEs, double/triple integrals, curvilinear coordinates, Jacobians, improper integrals, Gamma/Beta, $\nabla\phi$, directional derivatives, divergence & curl, line/surface/Green's/Stokes'/Divergence theorems | 3 | 24 | 41 |
| **Vol. IV: Differential Equations & Dynamical Systems** | `/differential-equations` | Direction fields & Picard iterates, phase lines & bifurcations, damped/forced resonance, trace–determinant portraits, nonlinear nullclines & limit cycles, 1D heat diffusion & 1D/2D wave normal modes | 4 | 8 | 8 |
| **Vol. V: Transforms & Complex Analysis** | `/transforms-complex-analysis` | Euler helix & phasors, conformal mapping, Cauchy integral theorem, Laurent poles & residues, 3D Laplace $s$-plane surfaces, convolution, Fourier series & Gibbs phenomenon, Fourier transform winding | 4 | 8 | 8 |
| **Vol. VI: Probability, Statistics & Numerical Methods** | `/probability-numerical-methods` | Continuous PDFs/CDFs & moments, 3D bivariate Gaussian marginals & covariance ellipses, Midpoint/Trapezoidal/Simpson/Gauss–Legendre quadrature with log–log error slopes, Euler/Heun/RK4 slope probes | 2 | 4 | 4 |
| **Total** | **`/[volume]/[module]/[chapter]`** | **Full 6-Volume Engineering Mathematics Curriculum** | **20** | **65** | **82** |

→ See [`docs/CURRICULUM_CATALOG.md`](./docs/CURRICULUM_CATALOG.md) for every chapter URL and lab component key.

---

## Key Platform Capabilities

- **Synchronized 2D + 3D Interactive Laboratories:** Manipulate bounds, sliders, 2D clickable SVG coordinate planes (`SvgCoordinatePlane2D`), and orbitable Three.js WebGL viewports (`ThreeOrbitViewport`) powered by demand-driven rendering (`createDemandDrivenRenderLoop` — zero idle animation loop burn).
- **Live Symbolic Expression Parsing:** Custom equation inputs (`MathExpressionInput`) powered by a tree-shaken `mathjs/number` compiler (`compileMathExpression`) validate domains cleanly and typeset into adaptive-contrast `KaTeXMath` (`role="math"`).
- **4-Step Pedagogical Chapter Rhythm:** Every chapter flows through *(1) Core Geometric Question → (2) Interactive Discovery → (3) Symbolic Formalization → (4) Edge Cases & Next-Chapter Bridge*, paired with prerequisite chips and adjacent-chapter navigation (`TopicPageShell`).
- **Academic Typography & Accessible Light/Dark Themes:** Combines `Newsreader` prose, `KaTeX` equations, `IBM Plex Sans` controls, and `JetBrains Mono` (`tabular-nums`) readouts across **Drafting Dark Mode** (`#1E1F22`) and **Warm Textbook Paper Light Mode** (`#FFFBE4`), enforcing flat solid surfaces (zero decorative gradients) and WCAG-tuned `--math-ink-*` variable remapping.
- **SEO, GEO & Agentic Discovery Ready:** Emits Schema.org `@graph` JSON-LD across every route, auto-generated `/sitemap.xml` & `/robots.txt`, static `/llms.txt` & `/llms-full.txt` Markdown feeds, dynamic Satori `/opengraph-image` & `/twitter-image` previews, and `/manifest.webmanifest` + `/pwa-icon/[size]`.

---

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, `generateStaticParams` SSG, `next/dynamic` lab chunk splitting)
- **UI & Language:** [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **3D & 2D Graphics:** [Three.js](https://threejs.org/) (`OrbitControls` + recursive GPU resource disposal) & custom accessible SVG geometry
- **Math Typesetting & Parsing:** [KaTeX](https://katex.org/) & [mathjs](https://mathjs.org/) (`mathjs/number` tree-shaken scope)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## Project Structure

```text
├── docs/                                   # GitHub engineering & curriculum documentation
│   ├── ARCHITECTURE.md                     # 4-tier routing, SSG registry, shell & code-splitting
│   ├── CURRICULUM_CATALOG.md               # Complete 6-Vol, 20-Mod, 65-Ch, 82-Lab directory
│   ├── VISUALIZATION_AND_MATH_ENGINE.md    # Butterfly palette, light-dark inks, mathParser & primitives
│   ├── SEO_GEO_PERFORMANCE.md              # SEO/GEO endpoints, JSON-LD, CWV/CLS & Lighthouse results
│   └── CONTRIBUTING_AND_DEPLOYMENT.md      # Local dev, adding topics, env vars & deployment checklist
├── src/
│   ├── app/
│   │   ├── [volume]/[module]/[chapter]/    # 4-tier Volume → Module → Chapter dispatcher
│   │   ├── calculus/                       # Permanent-redirected v1.0 static fallback routes
│   │   ├── roadmap/                        # Master 6-Volume Syllabus Matrix (/roadmap)
│   │   ├── about/                          # Project mission, open-source overview & creator bio (/about)
│   │   ├── llms.txt/ & llms-full.txt/      # Static machine-readable GEO textbook feeds
│   │   ├── opengraph-image.tsx             # Satori 1200×630 OpenGraph social card (+ twitter-image.tsx)
│   │   ├── pwa-icon/[size]/                # Static 192×192 & 512×512 PNG app icons
│   │   ├── robots.ts, sitemap.ts, manifest.ts
│   │   ├── layout.tsx                      # Root fonts, color-scheme boot script & site metadata
│   │   └── globals.css                     # Butterfly tokens, light-dark() overrides & CLS containment
│   ├── components/
│   │   ├── layout/                         # Navbar, TextbookSidebar (<dialog>), TopicPageShell, Footer
│   │   ├── math/                           # KaTeXMath (role="math") & MathExpressionInput
│   │   ├── seo/                            # JsonLd (<script type="application/ld+json">)
│   │   └── visualizations/
│   │       ├── DynamicLabRenderer.tsx      # 82 next/dynamic lazy-loaded lab chunks
│   │       ├── HeroIntegralPreviewLoader.tsx / HeroIntegral3DViewport.tsx / LabLoadingSkeleton.tsx
│   │       ├── primitives/                 # ThreeOrbitViewport, demandRenderLoop, threeScenePrimitives,
│   │       │                               # core2d, SvgCoordinatePlane2D, contourMarchingSquares, quadrature
│   │       ├── single-variable/            # Volume I labs
│   │       ├── linear-algebra/             # Volume II labs
│   │       ├── multivariable-differentiation/, integral-calculus/, double-integrals/,
│   │       │   triple-integrals/, coordinate-systems/, jacobians/, vector-calculus/  # Volume III labs
│   │       ├── differential-equations/     # Volume IV labs
│   │       ├── transforms-complex/         # Volume V labs
│   │       └── probability-numerical/      # Volume VI labs
│   ├── lib/
│   │   ├── seo/                            # siteConfig.ts & structuredData.ts
│   │   ├── accentInk.ts                    # Adaptive WCAG AA Butterfly ink mapping
│   │   └── mathParser.ts                   # Tree-shaken mathjs/number expression compiler
│   └── registry/                           # 6-volume typed curriculum manifests (vol1..vol6) & helpers
├── public/images/                          # Static image assets
├── archive/                                # Internal design tokens, topic guide & milestone logs
└── AGENTS.md                               # AI/developer handoff & architectural rules
```

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/swapnonil2007/WannaMath.git
cd WannaMath

# 2. Install dependencies
npm install

# 3. Start the development server (http://localhost:3000)
npm run dev

# 4. Run typecheck, lint, and production build
npx tsc --noEmit
npm run lint
npm run build
```

Optional environment variable (for custom production domains outside `https://wannamath.vercel.app`):
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## Contributing

Contributions, bug fixes, visual polish, and new interactive laboratories are welcome. Before submitting a PR, read [`docs/CONTRIBUTING_AND_DEPLOYMENT.md`](./docs/CONTRIBUTING_AND_DEPLOYMENT.md) and [`AGENTS.md`](./AGENTS.md) to verify color-token, zero-gradient, accessibility (`aria-label` / `role="math"` / `role="img"`), and `CLS` standards.

---

## Creator

Developed by **Swapnonil Nath** — 1st-year UG B.Tech in Ocean Engineering and Naval Architecture at IIT Kharagpur.

- Website: [spotmybusiness.in](https://spotmybusiness.in)
- GitHub: [@swapnonil2007](https://github.com/swapnonil2007)
- LinkedIn: [Swapnonil Nath](https://www.linkedin.com/in/swapnonil-nath-gmb-expert/)
