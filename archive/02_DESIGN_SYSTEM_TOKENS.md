# 02 — Design System Tokens & Visual Rules (`wanna math`)

## 1. Source Butterfly Palette (From Reference Sheet)

The visual identity of **wanna math** is derived strictly from the 4 butterfly triads and dark drafting-grid background provided by the user:

### Triad 1 (Periwinkle / Soft Cream / Muted Crimson)
- `#8D9FCE` — Soft Periwinkle Blue
- `#FBEAA4` — Warm Pastel Cream
- `#B95869` — Muted Crimson / Terracotta Rose

### Triad 2 (Sage Green / Pale Lemon / Persimmon Orange)
- `#96B898` — Muted Sage Green
- `#FFF7C2` — Soft Buttermilk / Pale Lemon
- `#D35323` — Warm Persimmon / Burnt Vermilion

### Triad 3 (Dusty Rose / Peach Cream / Deep Teal)
- `#D5658B` — Dusty Rose Pink
- `#FCDCC7` — Warm Peach Cream
- `#029091` — Deep Cyan / Teal

### Triad 4 (Olive Gold / Warm Ivory / Ochre Brown)
- `#AAA36D` — Warm Olive Khaki / Gold
- `#FFFBE4` — Warm Ivory Chalk / Textbook Paper
- `#976434` — Earthy Ochre / Bronze Brown

---

## 2. Surface & Theme Tokens (Zero Gradients)

### Dark Drafting Slate Mode (Default / Dark System Preference)
- `--bg-canvas`: `#1E1F22` (Deep drafting-grid slate)
- `--bg-grid-line`: `#27292E` (Subtle `24px` engineering graph grid lines)
- `--bg-panel`: `#25272C` (Flat elevated card background)
- `--bg-panel-muted`: `#2C2F36` (Secondary interactive control background)
- `--border-subtle`: `#383B43` (`1px solid` crisp border)
- `--border-strong`: `#555963` (3:1+ non-text contrast boundary for inputs/controls)
- `--text-primary`: `#FFFBE4` (Triad 4 Warm Ivory — comfortable high-contrast chalk text)
- `--text-secondary`: `#C9C5B5` (Muted warm parchment gray)
- `--text-muted`: `#969283` (Captions, axis tick numbers, metadata)

### Warm Textbook Paper Mode (Light System Preference / Override)
- `--bg-canvas`: `#FFFBE4` (Triad 4 Warm Ivory Paper)
- `--bg-grid-line`: `#EFE9CE` (Subtle warm drafting paper grid lines)
- `--bg-panel`: `#F7F1D4` (Elevated callout/panel surface)
- `--bg-panel-muted`: `#EFE7C2` (Control panel surface)
- `--border-subtle`: `#D6CEAD` (`1px solid` warm paper border)
- `--border-strong`: `#8E8668` (3:1+ non-text contrast boundary)
- `--text-primary`: `#1E1F22` (Deep charcoal ink)
- `--text-secondary`: `#43444A` (Secondary ink)
- `--text-muted`: `#68675E` (Captions & axis ticks)

---

## 3. Semantic Mathematical Color Mapping

Across every 2D canvas, 3D WebGL scene, and KaTeX equation, colors carry fixed mathematical meanings:

| CSS Variable | Hex (Dark / Base) | Mathematical Meaning |
| :--- | :--- | :--- |
| `--math-var-x` | `#8D9FCE` | Primary $x$-axis, variable $x$ or $u$, outer integral bound, Type I vertical slice |
| `--math-var-y` | `#96B898` | Primary $y$-axis, variable $y$ or $v$, middle integral bound, Type II horizontal slice |
| `--math-var-z` | `#029091` | Primary $z$-axis, variable $z$ or $w$, inner integral bound, 3D volume interior |
| `--math-bound-upper` | `#B95869` | Upper/exit boundary curve $y=g_2(x)$, $z=u_2(x,y)$ & upper integral limit |
| `--math-bound-lower` | `#D5658B` | Lower/entry boundary curve $y=g_1(x)$, $z=u_1(x,y)$, or angular coordinate $(\theta, \phi)$ |
| `--math-active-sweep` | `#D35323` | Active scrubber plane, Jacobian determinant scaling vector, order-swap highlight |
| `--math-diff-element` | `#FBEAA4` | Infinitesimal area/volume element highlight ($dA$, $dV$, Riemann prism top) |
| `--math-grid-accent` | `#AAA36D` | Coordinate grid cages, reference planes, tangent vectors $(\mathbf{r}_u, \mathbf{r}_v)$ |
| `--math-earth-accent` | `#976434` | Secondary basis vectors, wireframe cages, structural annotations |

---

## 4. Typography System
- **Heading & Mathematical Prose (`--font-serif`):** `Newsreader` (Google Font) with fallback to `STIX Two Text, Georgia, Cambria, serif`.
- **Mathematical Equations (`KaTeX`):** Standard `KaTeX_Main` (Computer Modern serif) rendered via `katex.renderToString`.
- **UI Controls & Navigation (`--font-sans`):** `IBM Plex Sans` with fallback to `system-ui, sans-serif`.
- **Numeric Readouts & Coordinates (`--font-mono`):** `JetBrains Mono` with `font-variant-numeric: tabular-nums`.
