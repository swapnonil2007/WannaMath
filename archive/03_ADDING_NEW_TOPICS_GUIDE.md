# 03 — Guide for Adding New Volumes, Modules, Chapters & Labs (`wanna math` v2.0)

**wanna math** is organized as a **6-Volume Engineering Mathematics Textbook** using a strict **4-Tier Pedagogical Taxonomy**:
`Volume (/[volume]) → Module (/[volume]/[module]) → Chapter (/[volume]/[module]/[chapter]) → Section/Lab (#lab-slug)`.

Follow this 4-step workflow whenever building a new chapter or interactive laboratory.

---

## Step 1: Register or Update the Chapter in `src/registry/volX-*.ts`
Open the corresponding volume registry file in `src/registry/`:
- `src/registry/vol1-single-variable.ts`
- `src/registry/vol2-linear-algebra.ts`
- `src/registry/vol3-multivariable.ts`
- `src/registry/vol4-differential-equations.ts`
- `src/registry/vol5-transforms-complex.ts`
- `src/registry/vol6-probability-numerical.ts`

Each `ChapterMetadata` entry (defined in `src/registry/types.ts`) contains:
- `id`: Hierarchical numeric ID (e.g., `"3.1.1"`, `"3.2.1"`, `"3.3.1"`)
- `slug`: URL-safe chapter slug (e.g., `"surfaces-level-curves"`, `"double-integrals"`)
- `title` & `subtitle`: Academic title and concise geometric summary
- `status`: `'published' | 'in-progress' | 'planned'`
- `estimatedMinutes`: Typical study duration
- `prerequisites`: Array of chapter IDs (e.g., `["3.1.1", "3.2.1"]`) resolved automatically into clickable Prerequisite Chips by `getPrerequisiteChapters()`
- `keyEquationsLatex`: Array of governing LaTeX formulas rendered in the chapter header
- `pedagogicalRhythm`: The 4-step chapter narrative (*Physical/Geometric Question*, *Interactive Visual Lab*, *Color-Coded Symbolic Formalization*, *Edge Cases & Bridge*)
- `labs`: Array of `LabMetadata` items (`id`, `slug`, `title`, `componentKey`, `summary`, `dimensionBadge`, `formulaLatex`)

---

## Step 2: Build Interactive Laboratories in `src/components/visualizations/`
1. Place chapter-specific visualization components in `src/components/visualizations/<chapter-or-module-slug>/` and shared canvas primitives in `src/components/visualizations/primitives/`.
2. Always integrate:
   - `<KaTeXMath />` (`src/components/math/KaTeXMath.tsx`) for Computer Modern math rendering.
   - `<MathExpressionInput />` (`src/components/math/MathExpressionInput.tsx`) + `compileMathExpression` (`src/lib/mathParser.ts`) so learners can type custom equations and custom domain/integral bounds.
   - Semantic Butterfly palette hex codes from `archive/02_DESIGN_SYSTEM_TOKENS.md` with zero decorative gradients.

---

## Step 3: Wire Component Keys into the Chapter Renderer
In `src/app/[volume]/[module]/[chapter]/page.tsx` (or the chapter lab dispatcher), map each `LabMetadata.componentKey` to its React component and wrap the chapter in `<TopicPageShell />`.
`<TopicPageShell />` automatically renders:
- 4-tier breadcrumbs (`wanna math → Volume → Module → Chapter`)
- Clickable Prerequisite Chips
- The 4-Step Pedagogical Chapter Rhythm callouts
- Section jump-bar for all `labs` in the chapter
- Sequential Previous / Next Chapter navigation across modules and volumes

---

## Step 4: Verify Build & Update Archive
1. Run `npm run build` and verify zero TypeScript, ESLint, or routing errors.
2. Update `archive/01_GLOBAL_STATUS.md` and `archive/01_CURRENT_STATUS.md` (changing the chapter status to `'published'`).
3. Commit and push to `origin/main` using the `swapnonil2007` git identity.
