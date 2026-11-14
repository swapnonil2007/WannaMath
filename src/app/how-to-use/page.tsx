import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Box,
  ChevronRight,
  Compass,
  Layers,
  MousePointerClick,
  Palette,
  SlidersHorizontal,
  Sparkles,
  SunMoon,
} from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { JsonLd } from "@/components/seo/JsonLd";
import { DynamicLabRenderer } from "@/components/visualizations/DynamicLabRenderer";
import { getAdaptiveAccentInk } from "@/lib/accentInk";
import { buildPageMetadata } from "@/lib/seo/siteConfig";
import { buildHowToUseJsonLd } from "@/lib/seo/structuredData";
import { SEMANTIC_MATH_PALETTE } from "@/registry/curriculum";
import { getChapterById } from "@/registry/index";

export const metadata: Metadata = buildPageMetadata({
  title: "How to Use Wanna Math",
  description:
    "Quick-start orientation for wanna math: navigate the 6-Volume TOC and Statistics TOC, type live math expressions, orbit 3D WebGL surfaces, read the semantic Butterfly color palette, and pick your starting track.",
  path: "/how-to-use",
});

const FORMULA_SYNTAX_ROWS = [
  {
    syntax: "x^2, x^3, (x + 1)^2",
    latex: "x^2,\\; x^3,\\; (x + 1)^2",
    meaning: "Exponents and grouped powers (use parentheses cleanly).",
  },
  {
    syntax: "sqrt(x), cbrt(x), abs(x)",
    latex: "\\sqrt{x},\\; \\sqrt[3]{x},\\; |x|",
    meaning: "Roots and absolute values (out-of-domain sqrt smoothly clamps to 0).",
  },
  {
    syntax: "sin(x), cos(x), tan(x), atan(x)",
    latex: "\\sin x,\\; \\cos x,\\; \\tan x,\\; \\arctan x",
    meaning: "Trigonometric and inverse-trig functions in radians.",
  },
  {
    syntax: "exp(x), ln(x), log(x)",
    latex: "e^x,\\; \\ln(x),\\; \\log(x)",
    meaning: "Natural exponential and natural logarithm.",
  },
  {
    syntax: "pi, e",
    latex: "\\pi \\approx 3.14159,\\; e \\approx 2.71828",
    meaning: "Built-in mathematical constants.",
  },
  {
    syntax: "x, y, z, r, theta, phi, u, v",
    latex: "(x, y, z),\\; (r, \\theta),\\; (\\rho, \\theta, \\phi),\\; (u, v)",
    meaning: "Allowed coordinate variables depend on each lab's dimension tag.",
  },
] as const;

const STATISTICS_COLOR_MEANINGS: Record<string, string> = {
  "--math-var-x":
    "Observed raw data dots, histograms, null hypothesis H₀ curve, and Group 1 samples.",
  "--math-var-y":
    "Theoretical PDF overlays, alternative H₁ curve, Group 2 samples, and 95% CI coverage hits.",
  "--math-var-z":
    "Sample mean x̄, test statistic readout, OLS fitted line/plane, and Bayesian Posterior curve.",
  "--math-bound-upper":
    "Rejection tail p-values, Type I (α) & Type II (β) error regions, and missed CIs.",
  "--math-bound-lower":
    "Categorical contingency comparisons, subgroup splits, and Statistics navigation accents.",
  "--math-active-sweep":
    "Active dragged outlier/leverage point, critical cutoff handle, and residual spikes.",
  "--math-diff-element":
    "Highlighted confidence intervals, IQR boxes, squared residuals eᵢ², and shaded regions.",
  "--math-grid-accent":
    "Population ground truth (μ, θ), sample median markers, prior curves, and reference baselines.",
};

function resolveTrackLinks(
  items: Array<{ id: string; label: string }>
): Array<{ id: string; label: string; href: string }> {
  return items.map((item) => ({
    ...item,
    href: getChapterById(item.id)?.route ?? "/roadmap",
  }));
}

export default function HowToUsePage() {
  const starterTracks = [
    {
      title: "Calculus From Scratch",
      badge: "Volume I • Foundations",
      accentHex: "#8D9FCE",
      description:
        "Start at the very beginning of single-variable analysis and watch secants melt into tangents and Riemann rectangles.",
      steps: resolveTrackLinks([
        { id: "1.1.1", label: "1.1.1 ε–δ Limits" },
        { id: "1.2.1", label: "1.2.1 Secant–Tangent Homotopy" },
        { id: "1.3.1", label: "1.3.1 1D Riemann Sums" },
      ]),
    },
    {
      title: "Statistics Zero to Data Science",
      badge: "Volume S • Dedicated Statistics TOC",
      accentHex: "#D5658B",
      description:
        "Learn histograms and outlier balance beams first, then conquer Bayes' Theorem, the CLT, and 3D Lasso/OLS.",
      steps: resolveTrackLinks([
        { id: "S.1.1", label: "S.1.1 Histograms" },
        { id: "S.1.2", label: "S.1.2 Mean/Median Seesaw" },
        { id: "S.2.2", label: "S.2.2 Bayes' Theorem" },
        { id: "S.3.2", label: "S.3.2 Central Limit Theorem" },
        { id: "S.6.1", label: "S.6.1 OLS & Anscombe's Quartet" },
      ]),
    },
    {
      title: "3D Multivariable & Vector Flagships",
      badge: "Volume III • 3D Spatial Geometry",
      accentHex: "#029091",
      description:
        "Slice 3D surfaces, pull curvilinear domains through Jacobians, and verify Stokes' and Divergence theorems interactively.",
      steps: resolveTrackLinks([
        { id: "3.1.1", label: "3.1.1 Surfaces & Level Curves" },
        { id: "3.2.1", label: "3.2.1 Double Integrals" },
        { id: "3.2.4", label: "3.2.4 Jacobians" },
        { id: "3.3.1", label: "3.3.1 Gradient Vector Field" },
        { id: "3.3.7", label: "3.3.7 Stokes' & Divergence" },
      ]),
    },
    {
      title: "Linear Algebra, ODEs & Transforms",
      badge: "Volumes II, IV & V • Applied Systems",
      accentHex: "#D35323",
      description:
        "Orbit 3D vector spans and SVD ellipsoids, damp harmonic oscillators, and wind frequencies into Fourier spectra.",
      steps: resolveTrackLinks([
        { id: "2.1.1", label: "2.1.1 Vector Span" },
        { id: "2.3.3", label: "2.3.3 SVD" },
        { id: "4.2.1", label: "4.2.1 Harmonic Oscillators" },
        { id: "5.4.2", label: "5.4.2 Fourier Spectra" },
      ]),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <JsonLd data={buildHowToUseJsonLd()} />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-tabular-mono text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-4"
      >
        <Link href="/" className="hover:text-[var(--text-primary)]">
          wanna math
        </Link>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-[var(--text-primary)] font-medium">
          How to Use Wanna Math
        </span>
      </nav>

      {/* Section 1: Hero & 60-Second Quick Start */}
      <section className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="px-2.5 py-1 border border-[var(--border-strong)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[var(--math-ink-y)] inline-block">
            USER GUIDE • 6 CORE VOLUMES + DEDICATED STATISTICS VOLUME
          </span>
          <h1 className="font-math-serif text-4xl sm:text-5xl font-semibold text-[var(--text-primary)] tracking-tight">
            How to Use Wanna Math
          </h1>
          <p className="font-math-serif text-lg text-[var(--text-secondary)] leading-relaxed">
            <strong>wanna math</strong> combines <strong>6 Core Engineering Mathematics Volumes</strong>{" "}
            (65 chapters, 82 interactive labs) and a standalone{" "}
            <strong>Interactive Statistics Volume</strong> (18 chapters, 18 labs)—giving you{" "}
            <strong>83 chapters and 100 live simulations</strong> built so you can poke, stretch,
            and verify every theorem visually before memorizing a single symbol.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-tabular-mono text-[var(--math-ink-x)]">
              <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>01. DUAL-DRAWER NAVIGATION</span>
            </div>
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              6-Volume TOC vs. Statistics TOC
            </h2>
            <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
              Use the top-left <strong>6-Volume TOC</strong> button for Calculus, Linear Algebra,
              ODEs, Transforms, and Numerical Methods. Open <strong>Statistics TOC</strong> right
              beside it for Descriptive Stats through Bayes &amp; Bootstrap, or browse every link at once
              in <Link href="/roadmap" className="underline underline-offset-4 text-[var(--math-ink-x)]">Syllabus Matrix</Link>.
            </p>
          </article>

          <article className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-tabular-mono text-[var(--math-ink-y)]">
              <Layers className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>02. 4-STEP CHAPTER RHYTHM</span>
            </div>
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Intuition → Lab → Formula → Bridge
            </h2>
            <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
              Every chapter opens with a plain-English visual question, drops you straight into a
              synchronized 2D/3D workbench, breaks symbols down with a tiny hand-checkable numerical
              example, and flags traps or paradoxes before bridging to the next chapter.
            </p>
          </article>

          <article className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-tabular-mono text-[var(--math-ink-sweep)]">
              <MousePointerClick className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>03. BREAK THE THEOREM ON PURPOSE</span>
            </div>
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Test Boundary &amp; Null Extremes
            </h2>
            <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
              Don&apos;t just skim! Drag an outlier across a balance beam, set ANOVA group signal to{" "}
              <code className="font-tabular-mono">0.0</code>, load Anscombe&apos;s Quartet, or type
              weird corner functions into custom equation boxes to watch edge cases snap into focus.
            </p>
          </article>
        </div>
      </section>

      {/* Section 2: Interactive Practice Sandbox & Equation Typing Cheat Sheet */}
      <section className="space-y-6">
        <div className="border-b border-[var(--border-subtle)] pb-3 space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Step 2 • Live Practice Workbench</span>
          </span>
          <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            Try Typing Equations &amp; Inspecting Readouts Right Here
          </h2>
        </div>

        <DynamicLabRenderer name="HowToUseInteractiveDemo" />

        {/* Keyboard Syntax Cheat Sheet */}
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5 space-y-3">
          <h3 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
            Custom Equation Syntax Cheat Sheet (<code className="font-tabular-mono text-sm">MathExpressionInput</code>)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-strong)] font-tabular-mono text-[var(--text-muted)] uppercase">
                  <th className="py-2 pr-4">What You Type</th>
                  <th className="py-2 pr-4">Typeset Preview</th>
                  <th className="py-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {FORMULA_SYNTAX_ROWS.map((row) => (
                  <tr key={row.syntax}>
                    <td className="py-2.5 pr-4 font-tabular-mono text-[var(--math-ink-x)] whitespace-nowrap">
                      {row.syntax}
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      <KaTeXMath math={row.latex} />
                    </td>
                    <td className="py-2.5 font-math-serif text-sm text-[var(--text-secondary)]">
                      {row.meaning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 3: Mastering 2D & 3D Laboratory Controls */}
      <section className="space-y-4">
        <div className="border-b border-[var(--border-subtle)] pb-3 space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Step 3 • Spatial &amp; Simulation Controls</span>
          </span>
          <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            Mastering 3D Viewports &amp; Interactive Statistical Simulators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)]">
              <Box className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>3D WEBGL VIEWPORTS (THREE.JS Z-UP COORDINATES)</span>
            </div>
            <ul className="space-y-2 text-sm font-math-serif text-[var(--text-secondary)] leading-relaxed">
              <li>
                <strong>Orbit 360°:</strong> Left-click and drag (or drag with one finger on touch
                devices) to inspect volumes, planes, and vector curls from underneath or side-on.
              </li>
              <li>
                <strong>Zoom &amp; Pan:</strong> Scroll your mouse wheel / pinch to zoom tightly into
                differential wedges; right-click and drag (or two-finger drag) to pan across space.
              </li>
              <li>
                <strong>Reset Framing &amp; Low GPU Idle:</strong> Click the reset button in the top-right
                corner of any 3D stage to snap back cleanly. Viewports only re-render on demand when you
                orbit or drag sliders—saving battery.
              </li>
            </ul>
          </div>

          <div className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)]">
              <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>2D SVG PLANES, DIRECT CANVAS CLICKS &amp; MONTE CARLO BUTTONS</span>
            </div>
            <ul className="space-y-2 text-sm font-math-serif text-[var(--text-secondary)] leading-relaxed">
              <li>
                <strong>Click or Drag Directly Inside Plots:</strong> Drop sample points onto balance
                beams (<code className="font-tabular-mono text-xs">S.1.2</code>), drag regression dots
                (<code className="font-tabular-mono text-xs">S.6.1</code>), or click the test axis to shade live{" "}
                <KaTeXMath math="p" />-values (<code className="font-tabular-mono text-xs">S.4.3</code>).
              </li>
              <li>
                <strong>Step-by-Step vs. Bulk Sampling:</strong> Watch <em>one</em> sample drop first
                (<code className="font-tabular-mono text-xs">+1 Trial</code> / <code className="font-tabular-mono text-xs">Draw 1</code>) so you grasp the mechanic, then click{" "}
                <code className="font-tabular-mono text-xs">+50</code> or <code className="font-tabular-mono text-xs">1,000 Replicates</code> to watch Laws of Large Numbers converge.
              </li>
              <li>
                <strong>Sibling Pill Switcher &amp; Prerequisites:</strong> Every chapter header shows clickable
                prerequisite pills and numbered chapter pills across its module.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4: Semantic Butterfly Color Palette & Theme Toggle */}
      <section className="space-y-5">
        <div className="border-b border-[var(--border-subtle)] pb-3 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-lower)] flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Step 4 • Consistent Mathematical Color Language</span>
            </span>
            <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
              Visual Dictionary: The Semantic Butterfly Palette
            </h2>
          </div>

          <div className="px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex items-center gap-2 text-xs font-tabular-mono text-[var(--text-secondary)]">
            <SunMoon className="w-4 h-4 text-[var(--math-ink-y)] shrink-0" aria-hidden="true" />
            <span>
              Tip: Toggle <strong>Drafting Dark (#1E1F22)</strong> ↔{" "}
              <strong>Paper Light (#FFFBE4)</strong> anytime in the top-right navbar.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SEMANTIC_MATH_PALETTE.map((swatch) => (
            <article
              key={swatch.token}
              className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 border border-[var(--border-strong)] inline-block shrink-0"
                      style={{ backgroundColor: swatch.hex }}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-tabular-mono font-semibold text-[var(--text-primary)]">
                      {swatch.hex}
                    </span>
                  </div>
                  <div className="text-xs">
                    <KaTeXMath math={swatch.symbol} />
                  </div>
                </div>

                <h3 className="font-math-serif text-base font-semibold text-[var(--text-primary)]">
                  {swatch.name}
                </h3>

                <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
                  <strong>Calculus &amp; Systems:</strong> {swatch.meaning}
                </p>
              </div>

              <p className="text-xs font-math-serif text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)] leading-relaxed">
                <strong>Statistics (Vol. S):</strong>{" "}
                {STATISTICS_COLOR_MEANINGS[swatch.token] ?? swatch.meaning}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Section 5: Curated Starter Paths */}
      <section className="space-y-5">
        <div className="border-b border-[var(--border-subtle)] pb-3 space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
            Recommended Routes • Pick One and Dive In
          </span>
          <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            Where Should I Begin?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {starterTracks.map((track) => (
            <article
              key={track.title}
              className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 space-y-3"
              style={{ boxShadow: `inset 3px 0 0 ${track.accentHex}` }}
            >
              <div className="space-y-1">
                <span
                  className="text-[11px] font-tabular-mono font-semibold uppercase tracking-wider block"
                  style={{ color: getAdaptiveAccentInk(track.accentHex) }}
                >
                  {track.badge}
                </span>
                <h3 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
                  {track.title}
                </h3>
                <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
                  {track.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {track.steps.map((step) => (
                  <Link
                    key={step.id}
                    href={step.href}
                    className="px-2.5 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--text-primary)] inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>{step.label}</span>
                    <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
