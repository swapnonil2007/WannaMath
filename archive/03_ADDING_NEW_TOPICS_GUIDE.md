# 03 — Guide for Adding New Math Topics (`wanna math`)

**wanna math** is built to expand continuously across engineering mathematics (Linear Algebra, Vector Calculus, Differential Equations, Fluid Dynamics, Complex Analysis, etc.). Follow this 4-step workflow whenever adding a new topic or domain.

---

## Step 1: Register the Domain or Topic in `src/registry/curriculum.ts`
Open `src/registry/curriculum.ts`. Every domain (`MathDomain`) contains an array of topics (`MathTopic`).
Add your new topic entry with:
- `id`: unique slug (e.g., `'surface-integrals'`)
- `title`: human-readable title
- `shortTitle`: concise title for sidebar/navbar
- `route`: URL path (e.g., `'/vector-calculus/surface-integrals'`)
- `domainId`: parent domain ID
- `status`: `'available' | 'in-development' | 'planned'`
- `accentColor`: one of the semantic palette hex codes (`#8D9FCE`, `#96B898`, `#029091`, `#B95869`, `#D35323`, `#AAA36D`)
- `summary`: 1-2 sentence mathematical summary
- `keyFormulaLatex`: representative LaTeX string rendered on topic cards
- `subtopics`: list of interactive modules covered on the page

---

## Step 2: Create the Next.js Route Page
Create `src/app/<domain>/<topic-slug>/page.tsx` and wrap the content in `<TopicPageShell topicId="<id>">`.
This automatically provides:
- Breadcrumb navigation (`Home -> Domain -> Topic`)
- Academic header with KaTeX signature equation and learning objectives
- Section jump bar
- Semantic color legend
- Previous / Next topic sequential navigation footer

---

## Step 3: Build Interactive Modules Using Shared Primitives
Place topic-specific visualization components in `src/components/visualizations/<topic-slug>/`.
Use our standardized building blocks:
- `<InteractiveLabLayout>`: Provides the responsive split-screen workspace (Left/Center: 2D & 3D viewports; Right: parameter controls & live KaTeX formula card; Bottom: collapsible mathematical derivation).
- `<KaTeXMath>`: Synchronous, zero-layout-shift LaTeX renderer supporting `\color{...}` macros matching the butterfly palette.
- `useThemeMode()`: Hook to read the active color scheme so Three.js/Canvas backgrounds adapt seamlessly between Dark Drafting Slate (`#1E1F22`) and Warm Paper (`#FFFBE4`).

---

## Step 4: Update the Archive
After verifying `npm run build` succeeds:
1. Update `archive/01_CURRENT_STATUS.md`.
2. Add a completion log in `archive/phase_logs/`.
3. Commit and push using the `swapnonil2007` git identity.
