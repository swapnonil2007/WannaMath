import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllResolvedChapters, getChapterBySlugs } from "@/registry/index";
import { TopicPageShell } from "@/components/layout/TopicPageShell";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { JsonLd } from "@/components/seo/JsonLd";
import { DynamicLabRenderer } from "@/components/visualizations/DynamicLabRenderer";
import { buildChapterJsonLd } from "@/lib/seo/structuredData";
import { buildPageMetadata } from "@/lib/seo/siteConfig";
import { getAdaptiveAccentInk } from "@/lib/accentInk";

export function generateStaticParams() {
  return getAllResolvedChapters().map((item) => ({
    volume: item.volume.slug,
    module: item.module.slug,
    chapter: item.chapter.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ volume: string; module: string; chapter: string }>;
}): Promise<Metadata> {
  const {
    volume: volumeSlug,
    module: moduleSlug,
    chapter: chapterSlug,
  } = await params;

  const resolved = getChapterBySlugs(volumeSlug, moduleSlug, chapterSlug);
  if (!resolved) {
    return {
      title: "Chapter Not Found",
      robots: { index: false, follow: false },
    };
  }

  const { chapter, volume, module: mod } = resolved;
  const labSummary =
    chapter.labs.length > 0
      ? `Includes ${chapter.labs.length} interactive 2D/3D visualization${chapter.labs.length > 1 ? "s" : ""}.`
      : "";
  const description = [
    chapter.subtitle,
    chapter.engineeringContext,
    labSummary,
    `From ${volume.title} (${mod.title}).`,
  ]
    .filter(Boolean)
    .join(" ");

  return buildPageMetadata({
    title: `${chapter.title} (${chapter.id})`,
    description,
    path: `/${volume.slug}/${mod.slug}/${chapter.slug}`,
    type: "article",
  });
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ volume: string; module: string; chapter: string }>;
}) {
  const {
    volume: volumeSlug,
    module: moduleSlug,
    chapter: chapterSlug,
  } = await params;

  const resolved = getChapterBySlugs(volumeSlug, moduleSlug, chapterSlug);
  if (!resolved) {
    notFound();
  }

  const { chapter, volume, module: mod } = resolved;

  return (
    <>
      <JsonLd data={buildChapterJsonLd(resolved)} />
      <TopicPageShell chapterId={chapter.id}>
      {chapter.slug === "epsilon-delta-limits" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="EpsilonDeltaCorridorLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              Formal Limit Anatomy &amp; Non-Existence Signatures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. PUNCTURED NEIGHBORHOOD
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="0 < |x - a| < \delta" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Strict inequality <KaTeXMath math="0 < |x-a|" /> ignores{" "}
                  <KaTeXMath math="f(a)" /> completely—removable holes do not alter the limit.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  2. SQUEEZE ENVELOPE
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="g(x) \le f(x) \le h(x),\; \lim g = \lim h = L \implies \lim f = L"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Even fast oscillation like <KaTeXMath math="x\sin(8/x)" /> converges to{" "}
                  <KaTeXMath math="0" /> because <KaTeXMath math="-|x| \le f(x) \le |x|" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. THREE FAILURE MODES
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\lim_{x\to a^-} f \neq \lim_{x\to a^+} f \;\lor\; \pm\infty \;\lor\; \sin(1/x)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Jumps, vertical poles, and bounded non-decaying oscillation fail to fit inside
                  small <KaTeXMath math="\varepsilon" />-bands for any <KaTeXMath math="\delta > 0" />.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "continuity-ivt" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="IVTBisectionLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              Continuity Checklist &amp; Discontinuity Taxonomy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  1. THREE-PART CONTINUITY TEST
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="f(a) \text{ defined},\; \exists\lim_{x\to a}f(x),\; \lim_{x\to a}f(x)=f(a)"
                    block
                  />
                </div>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  2. REMOVABLE VS. JUMP VS. INFINITE
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  <strong>Removable:</strong> two-sided limit exists cleanly.{" "}
                  <strong>Jump:</strong> finite left/right limits disagree.{" "}
                  <strong>Infinite:</strong> at least one side diverges toward <KaTeXMath math="\pm\infty" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. BISECTION ERROR BOUND
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="|c - m_k| \le \frac{b_0 - a_0}{2^k}" block />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "secant-tangent-homotopy" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="SecantTangentLab" />
        </div>
      )}

      {chapter.slug === "local-linearity-differentials" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="NewtonRaphsonLab" />
        </div>
      )}

      {chapter.slug === "chain-rule-kinematics" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="ChainRulePropagatorLab" />
        </div>
      )}

      {chapter.slug === "taylor-polynomials-curvature" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="TaylorCurvatureLab" />
        </div>
      )}

      {chapter.slug === "riemann-sums-1d" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="Riemann1DLab" />
        </div>
      )}

      {chapter.slug === "fundamental-theorem-calculus" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="FTCAccumulationLab" />
        </div>
      )}

      {chapter.slug === "substitution-integration-by-parts" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="SubstitutionIBPLab" />
        </div>
      )}

      {chapter.slug === "solids-of-revolution" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="SolidOfRevolutionLab" />
        </div>
      )}

      {chapter.slug === "sequences-partial-sums" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="PartialSumSeriesLab" />
        </div>
      )}

      {chapter.slug === "power-series-convergence" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="PowerSeriesConvergenceLab" />
        </div>
      )}

      {chapter.slug === "surfaces-level-curves" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="SurfaceContourSlicerLab" />
        </div>
      )}

      {chapter.slug === "partial-derivatives-tangent-planes" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="PartialDerivativeTangentPlaneLab" />
          <DynamicLabRenderer name="HigherOrderChainImplicitLab" />
        </div>
      )}

      {chapter.slug === "gradient-directional-derivatives" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="GradientDirectionalDerivativeLab" />
          <DynamicLabRenderer name="GradientAscentAndLevelSurfaceLab" />

          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
                  First-Principles Proofs &amp; Geometric Intuition
                </span>
                <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                  Why the Gradient <KaTeXMath math="\nabla f" /> Governs Directional Slope, Contours &amp; Surface Normals
                </h2>
              </div>
              <Link
                href="/multivariable-calculus/vector-calculus/vector-fields-divergence-curl"
                className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-z)] transition-colors shrink-0"
              >
                Continue to Vector Fields &amp; Del Quartet (3.3.3) →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. FROM TOTAL DIFFERENTIAL TO DOT PRODUCT
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\frac{d}{dt}f(\mathbf{r}_0 + t\mathbf{u})\Big|_{t=0} = \nabla f(\mathbf{r}_0) \cdot \mathbf{u} = \|\nabla f\|\cos\theta"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Walking along unit direction <KaTeXMath math="\mathbf{u}" /> (<KaTeXMath math="\|\mathbf{u}\|=1" />)
                  applies the multivariable Chain Rule. By Cauchy–Schwarz, the directional slope{" "}
                  <KaTeXMath math="D_{\mathbf{u}}f" /> is bounded strictly inside{" "}
                  <KaTeXMath math="[-\|\nabla f\|, +\|\nabla f\|]" />, peaking when{" "}
                  <KaTeXMath math="\theta = 0^\circ" /> (<KaTeXMath math="\mathbf{u} \parallel \nabla f" />).
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  2. CONTOUR &amp; LEVEL-SURFACE ORTHOGONALITY
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="f(\mathbf{r}(t)) = c \implies \nabla f(\mathbf{r}(t)) \cdot \mathbf{r}'(t) = 0"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Moving along a level curve in <KaTeXMath math="\mathbb{R}^2" /> or level surface{" "}
                  <KaTeXMath math="F(x,y,z)=c" /> in <KaTeXMath math="\mathbb{R}^3" /> keeps height
                  constant (<KaTeXMath math="df/dt = 0" />). Hence every tangent vector{" "}
                  <KaTeXMath math="\mathbf{r}'(t)" /> makes a <KaTeXMath math="90^\circ" /> angle
                  with <KaTeXMath math="\nabla f" />—turning gradients into outward surface normals.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. CRITICAL VECTOR VS. SCALAR DISTINCTION
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\nabla f \in \mathbb{R}^n \text{ (vector field)}, \quad D_{\mathbf{u}}f \in \mathbb{R} \text{ (scalar slope)}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Never confuse the two: <KaTeXMath math="\nabla f" /> points in domain space{" "}
                  <KaTeXMath math="(x,y)" /> (or <KaTeXMath math="(x,y,z)" />) where growth is fastest
                  and spawns a <strong>conservative vector field</strong>, whereas{" "}
                  <KaTeXMath math="D_{\mathbf{u}}f" /> is a single signed number measuring slice slope.
                </p>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1.5">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  ENGINEERING BRIDGE • FOURIER HEAT &amp; GRADIENT DESCENT
                </span>
                <p>
                  Thermal flux follows Fourier&apos;s law{" "}
                  <KaTeXMath math="\mathbf{q} = -k\nabla T" />: heat always flows orthogonal to
                  isotherms from hot to cold. In numerical optimization, discrete updates{" "}
                  <KaTeXMath math="\mathbf{x}_{k+1} = \mathbf{x}_k - \eta \nabla f(\mathbf{x}_k)" />{" "}
                  approximate continuous gradient flow; if <KaTeXMath math="\eta" /> exceeds{" "}
                  <KaTeXMath math="2/\lambda_{\max}(H)" />, iterates zigzag across narrow canyons.
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  COMMON PITFALLS TO WATCH FOR IN COMPUTATIONS
                </span>
                <p>
                  (1) Always normalize direction <KaTeXMath math="\mathbf{v}" /> into{" "}
                  <KaTeXMath math="\mathbf{u} = \mathbf{v}/\|\mathbf{v}\|" /> before dotting with{" "}
                  <KaTeXMath math="\nabla f" />. (2) If <KaTeXMath math="f" /> is not differentiable at{" "}
                  <KaTeXMath math="(x_0, y_0)" /> (e.g., sharp corner or saddle crease), partials may
                  exist while <KaTeXMath math="D_{\mathbf{u}}f \neq \nabla f \cdot \mathbf{u}" />.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "lagrange-multipliers" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="LagrangeMultipliersLab" />
        </div>
      )}

      {chapter.slug === "limits-and-differentiability" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="MultivariableLimitsPathsLab" />
          <DynamicLabRenderer name="DifferentiabilityErrorConeLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              The Implication Chain &amp; Non-Differentiability Pitfalls in ℝ²
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. DISPROVING A LIMIT (TWO-PATH TEST)
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="L_{\text{path}_1} \neq L_{\text{path}_2} \implies \lim_{(x,y)\to(a,b)} f \text{ DNE}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Checking all lines <KaTeXMath math="y = mx" /> is never enough to prove a limit exists—curved
                  paths like <KaTeXMath math="y = kx^2" /> can still disagree!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. PROVING A LIMIT (POLAR SQUEEZE)
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="|f(r\cos\theta, r\sin\theta) - L| \le g(r) \xrightarrow{r\to 0} 0"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Convert to polar coordinates around <KaTeXMath math="(a,b)" /> and bound away any{" "}
                  <KaTeXMath math="\theta" />-dependence using <KaTeXMath math="|\sin\theta|, |\cos\theta| \le 1" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. SUFFICIENT C¹ CRITERION
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="f_x, f_y \text{ continuous near }(a,b) \implies f\text{ differentiable}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Partial derivatives merely test two orthogonal axes; continuity of{" "}
                  <KaTeXMath math="f_x, f_y" /> guarantees every oblique angle collapses cleanly onto the tangent plane.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}


      {chapter.slug === "taylor-expansions" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="SingleVariableTaylorLab" />
          <DynamicLabRenderer name="MultivariableTaylorHessianLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              Taylor Reference: 1D Remainder, 2D Hessian Quadratic Form &amp; Classical Maclaurin Series
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  1. LAGRANGE REMAINDER THEOREM
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="R_n(x) = \frac{f^{(n+1)}(\xi)}{(n+1)!}(x - x_0)^{n+1}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  For some intermediate <KaTeXMath math="\xi" /> between <KaTeXMath math="x_0" /> and{" "}
                  <KaTeXMath math="x" />, the truncation error scales with <KaTeXMath math="|x-x_0|^{n+1}" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. MULTIVARIABLE 2ND-ORDER TAYLOR
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="T_2(x_0+h,y_0+k) = f + (h\partial_x + k\partial_y)f + \frac{1}{2!}(h\partial_x + k\partial_y)^2 f"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Expands cleanly using the binomial operator <KaTeXMath math="(h\partial_x + k\partial_y)^m f" />{" "}
                  when Clairaut symmetry <KaTeXMath math="f_{xy} = f_{yx}" /> holds.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  3. CONVERGENCE DISK BOUNDARY
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\frac{1}{1+x^2} = \sum_{k=0}^\infty (-1)^k x^{2k} \quad (|x|<1)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Even if smooth on ℝ, complex singularities (e.g. <KaTeXMath math="x = \pm i" />) limit the
                  real Maclaurin radius of convergence to <KaTeXMath math="R = 1" />.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "homogeneous-functions-eulers-theorem" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="HomogeneousScalingRayLab" />
          <DynamicLabRenderer name="EulersTheoremSecondOrderLab" />
        </div>
      )}

      {chapter.slug === "maxima-minima-extrema" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="HessianSecondDerivativeTestLab" />
          <DynamicLabRenderer name="GeneralMethodDegenerateExtremaLab" />
        </div>
      )}

      {chapter.slug === "first-order-lde-bernoulli" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="LinearOdeIntegratingFactorLab" />
          <DynamicLabRenderer name="BernoulliReductionLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              First-Order Solution Cookbook: LDE in y, LDE in x, and Bernoulli Reduction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  1. STANDARD LDE IN y
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\frac{dy}{dx} + P(x)y = Q(x) \implies \mu(x) = e^{\int P(x)\,dx}"
                    block
                  />
                </div>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. REVERSED LDE IN x
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\frac{dx}{dy} + P(y)x = Q(y) \implies x\,\mu(y) = \int \mu(y)Q(y)\,dy + C"
                    block
                  />
                </div>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  3. BERNOULLI REDUCTION
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="y^{-n}y' + P y^{1-n} = Q \xrightarrow{v = y^{1-n}} \frac{dv}{dx} + (1-n)Pv = (1-n)Q"
                    block
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "linear-odes-wronskian-roots" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="WronskianPhaseAreaLab" />
          <DynamicLabRenderer name="CharacteristicRootsSolutionLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              Second-Order Characteristic Root Atlas (<KaTeXMath math="\Delta = b^2 - 4ac" />)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. DISTINCT REAL ROOTS (Δ &gt; 0)
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="y_c(x) = C_1 e^{r_1 x} + C_2 e^{r_2 x} \quad (W(x) \propto e^{(r_1+r_2)x})"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Two independent exponential modes produce overdamped decay when{" "}
                  <KaTeXMath math="r_1, r_2 < 0" /> or a hyperbolic saddle when signs oppose.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. REPEATED ROOT (Δ = 0)
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="y_c(x) = (C_1 + C_2 x)e^{rx} \quad \Bigl(x e^{rx} = \lim_{\varepsilon\to 0}\frac{e^{(r+\varepsilon)x}-e^{rx}}{\varepsilon}\Bigr)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Critical damping returns fastest without oscillation while preserving{" "}
                  <KaTeXMath math="W(e^{rx}, xe^{rx}) = e^{2rx} \neq 0" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. COMPLEX CONJUGATE ROOTS (Δ &lt; 0)
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="r = \alpha \pm i\beta \implies y_c(x) = e^{\alpha x}(C_1\cos\beta x + C_2\sin\beta x)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Euler&apos;s formula converts complex exponential poles into damped oscillations
                  of envelope <KaTeXMath math="e^{\alpha x}" /> and angular frequency{" "}
                  <KaTeXMath math="\beta" />.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "operator-variation-cauchy-euler" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="OperatorMethodTutorialLab" />
          <DynamicLabRenderer name="VariationOfParametersCauchyEulerLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              Particular Integrals &amp; Variable-Coefficient Quick Reference
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  1. INVERSE OPERATOR RULES 1/f(D)
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\frac{1}{f(D)}e^{ax} = \frac{e^{ax}}{f(a)}, \quad \frac{1}{f(D^2)}\sin(\omega x) = \frac{\sin(\omega x)}{f(-\omega^2)}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  When <KaTeXMath math="f(a) = 0" />, multiply by <KaTeXMath math="x" /> and
                  replace <KaTeXMath math="f(a)" /> with <KaTeXMath math="f'(a)" /> (or use the
                  shift theorem <KaTeXMath math="D \mapsto D + a" />).
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. VARIATION OF PARAMETERS
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="y_p = -y_1\!\int \frac{y_2 g}{W}\,dx + y_2\!\int \frac{y_1 g}{W}\,dx"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Works for any continuous forcing <KaTeXMath math="g(x)" />—even{" "}
                  <KaTeXMath math="\sec x" />, <KaTeXMath math="\tan x" />, or{" "}
                  <KaTeXMath math="e^x/x" />—given <KaTeXMath math="y_1, y_2" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. CAUCHY-EULER LOG PULLBACK
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="x = e^t \implies x y' = \theta y,\quad x^2 y'' = \theta(\theta - 1)y"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Maps variable-coefficient <KaTeXMath math="x^k y^{(k)}" /> equations onto
                  constant-coefficient linear ODEs in <KaTeXMath math="t = \ln x" />.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "double-integrals" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="RiemannVolumeLab" />
          <DynamicLabRenderer name="IteratedOrderChangeLab" />
        </div>
      )}

      {chapter.slug === "triple-integrals" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="TripleIntegralOrderLab" />
          <DynamicLabRenderer name="TripleVoxelDensityLab" />
        </div>
      )}

      {chapter.slug === "coordinate-systems" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="PolarCoordinateAreaLab" />
          <DynamicLabRenderer name="Curvilinear3DSurfacesAndElementLab" />

          {/* Orthogonal Curvilinear Scale-Factor Reference Sheet */}
          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-5">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-grid)] block">
                Orthogonal Curvilinear Reference Sheet
              </span>
              <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                Scale Factors <KaTeXMath math="(h_1, h_2, h_3)" />, Basis Vectors &amp; Volume Elements
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)]">
                    CARTESIAN (x, y, z)
                  </span>
                  <span className="text-[11px] font-tabular-mono text-[var(--text-muted)]">
                    h₁ = 1, h₂ = 1, h₃ = 1
                  </span>
                </div>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\begin{aligned} d\mathbf{r} &= dx\,\hat{\mathbf{i}} + dy\,\hat{\mathbf{j}} + dz\,\hat{\mathbf{k}} \\ dV &= dx\,dy\,dz \end{aligned}"
                    block
                  />
                </div>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)]">
                    CYLINDRICAL (r, θ, z)
                  </span>
                  <span className="text-[11px] font-tabular-mono text-[var(--text-muted)]">
                    hᵣ = 1, h_θ = r, h_z = 1
                  </span>
                </div>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\begin{aligned} d\mathbf{r} &= dr\,\hat{\mathbf{e}}_r + r\,d\theta\,\hat{\mathbf{e}}_\theta + dz\,\hat{\mathbf{e}}_z \\ dV &= r\,dr\,d\theta\,dz \end{aligned}"
                    block
                  />
                </div>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-lower)]">
                    SPHERICAL (ρ, φ, θ)
                  </span>
                  <span className="text-[11px] font-tabular-mono text-[var(--text-muted)]">
                    h_ρ = 1, h_φ = ρ, h_θ = ρ sin φ
                  </span>
                </div>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\begin{aligned} d\mathbf{r} &= d\rho\,\hat{\mathbf{e}}_\rho + \rho\,d\phi\,\hat{\mathbf{e}}_\phi + \rho\sin\phi\,d\theta\,\hat{\mathbf{e}}_\theta \\ dV &= \rho^2\sin\phi\,d\rho\,d\phi\,d\theta \end{aligned}"
                    block
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}


      {chapter.slug === "jacobians" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="DualGridMorphingAndTangentLab" />
          <DynamicLabRenderer name="JacobianIntegralPullbackLab" />

          {/* Geometric Summary: Why the Determinant Appears */}
          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-5">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
                Unifying Principle Across Multivariable Integration
              </span>
              <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                Why the Jacobian Determinant <KaTeXMath math="\left|\det J\right|" /> Governs Area &amp; Volume Scaling
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. 1D U-SUBSTITUTION ANALOGUE
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\int_{x(a)}^{x(b)} f(x)\,dx = \int_{a}^{b} f(x(u))\,\left|\frac{dx}{du}\right|\,du"
                    block
                  />
                </div>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. 2D TANGENT CROSS PRODUCT
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="dA = \|\mathbf{r}_u \times \mathbf{r}_v\|\,du\,dv = \left|\frac{\partial(x,y)}{\partial(u,v)}\right|\,du\,dv"
                    block
                  />
                </div>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. 3D SCALAR TRIPLE PRODUCT
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="dV = |\mathbf{r}_u \cdot (\mathbf{r}_v \times \mathbf{r}_w)|\,du\,dv\,dw = \left|\frac{\partial(x,y,z)}{\partial(u,v,w)}\right|du\,dv\,dw"
                    block
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}


      {chapter.slug === "convergence-and-divergence" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="ImproperIntegralConvergenceLab" />
          <DynamicLabRenderer name="ConvergenceTestsTutorialLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              Decision Hierarchy: Which Convergence Test Should You Reach For First?
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-serif leading-relaxed">
              Before expanding algebra, scan the structural shape of <KaTeXMath math="a_n" /> or{" "}
              <KaTeXMath math="f(x)" />. Following this three-second triage resolves almost every
              engineering convergence problem without wasted calculation:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  1. DIVERGENCE SCREENING
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\lim_{n\to\infty} a_n \neq 0 \implies \sum a_n\text{ diverges}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Always check this first—but remember that <KaTeXMath math="a_n \to 0" /> is only
                  necessary, never sufficient!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. ALGEBRAIC POWERS &amp; RATIOS
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="a_n \sim \frac{1}{n^p} \quad\text{or}\quad b_n = \frac{\text{leading numerator}}{\text{leading denominator}}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Compare polynomials/roots against a <KaTeXMath math="p" />-series via the{" "}
                  <strong className="text-[var(--text-primary)]">Limit Comparison Test</strong>; handle
                  decreasing positive tails with the <strong className="text-[var(--text-primary)]">Integral Test</strong>.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  3. FACTORIALS &amp; n-TH POWERS
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="L = \lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right| \;\;\text{or}\;\; \lim_{n\to\infty}\sqrt[n]{|a_n|}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  Use <strong className="text-[var(--text-primary)]">Ratio Test</strong> when{" "}
                  <KaTeXMath math="n!" /> or exponentials appear; use{" "}
                  <strong className="text-[var(--text-primary)]">Root Test</strong> for{" "}
                  <KaTeXMath math="(\cdot)^n" /> structures; use Leibniz when signs strictly alternate.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}


      {chapter.slug === "gamma-and-beta-functions" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="GammaFunctionLab" />
          <DynamicLabRenderer name="BetaFunctionLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              Eulerian Reduction Toolkit: Turning Hard Integrals into Instant Arithmetic
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  1. EXPONENTIAL SUBSTITUTION
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\int_0^\infty x^a e^{-bx^c}\,dx = \frac{1}{c\,b^{(a+1)/c}}\,\Gamma\!\left(\frac{a+1}{c}\right)"
                    block
                  />
                </div>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. WALLIS TRIGONOMETRIC FORM
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\int_0^{\pi/2} \sin^m\theta \cos^n\theta\,d\theta = \frac{\Gamma\!\left(\frac{m+1}{2}\right)\Gamma\!\left(\frac{n+1}{2}\right)}{2\,\Gamma\!\left(\frac{m+n+2}{2}\right)}"
                    block
                  />
                </div>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. EULER REFLECTION &amp; INFINITE TAIL
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\Gamma(z)\Gamma(1-z) = \frac{\pi}{\sin(\pi z)}, \qquad \int_0^\infty \frac{x^{p-1}}{(1+x)^{p+q}}\,dx = \mathrm{B}(p,q)"
                    block
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}


      {chapter.slug === "gradient-of-scalar-fields" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="VectorGradientCalculatorLab" />

          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
                  Vector Differential Foundations • Module 3.3.1
                </span>
                <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                  The Gradient Operator <KaTeXMath math="\nabla \phi" />, Level Surfaces &amp; Surface Normals
                </h2>
              </div>
              <Link
                href="/multivariable-calculus/vector-calculus/directional-derivatives"
                className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-x)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-x)] transition-colors shrink-0"
              >
                Continue to Directional Derivatives (3.3.2) →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  1. SCALAR FIELD TO VECTOR FIELD (DEL ∇)
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\nabla\phi = \frac{\partial\phi}{\partial x}\mathbf{i} + \frac{\partial\phi}{\partial y}\mathbf{j} + \frac{\partial\phi}{\partial z}\mathbf{k}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Applying the vector differential operator <KaTeXMath math="\nabla" /> to any smooth
                  scalar point function <KaTeXMath math="\phi(x,y,z)" /> produces a vector whose
                  components measure coordinate-wise rates of change at <KaTeXMath math="P(x_0, y_0, z_0)" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  2. ORTHOGONALITY &amp; TANGENT PLANES
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\nabla\phi(P)\cdot d\mathbf{r} = d\phi = 0 \implies \nabla\phi(P) \perp S_c"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Along any curve <KaTeXMath math="\mathbf{r}(t)" /> lying inside the level surface{" "}
                  <KaTeXMath math="\phi(x,y,z) = c" />, <KaTeXMath math="\phi(\mathbf{r}(t))" /> is
                  constant, forcing <KaTeXMath math="\nabla\phi(P)" /> to stand normal to the golden tangent plane.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. PHYSICAL GRADIENTS &amp; ANGLE BETWEEN SURFACES
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\cos\psi = \frac{\nabla\phi_1 \cdot \nabla\phi_2}{\|\nabla\phi_1\|\,\|\nabla\phi_2\|}, \quad \mathbf{E} = -\nabla V"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  The angle between two intersecting surfaces <KaTeXMath math="\phi_1 = c_1" /> and{" "}
                  <KaTeXMath math="\phi_2 = c_2" /> at a shared point equals the angle between their
                  gradients <KaTeXMath math="\nabla\phi_1" /> and <KaTeXMath math="\nabla\phi_2" />.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "directional-derivatives" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="DirectionalDerivativeCalculatorLab" />

          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
                  Directional Rate of Change • Module 3.3.2
                </span>
                <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                  Directional Derivatives <KaTeXMath math="D_{\hat{\mathbf{u}}}\phi" />, Normalization &amp; Steepest Bounds
                </h2>
              </div>
              <Link
                href="/multivariable-calculus/vector-calculus/vector-fields-divergence-curl"
                className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-z)] transition-colors shrink-0"
              >
                Continue to Vector Fields, Div &amp; Curl (3.3.3) →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. ALWAYS NORMALIZE v → û FIRST
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\hat{\mathbf{u}} = \frac{\mathbf{v}}{\|\mathbf{v}\|}, \qquad \|\hat{\mathbf{u}}\| = 1"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Directional derivative measures rate of change <em>per unit arc length</em>.
                  If you are given a non-unit vector <KaTeXMath math="\mathbf{v}" />, dividing by{" "}
                  <KaTeXMath math="\|\mathbf{v}\|" /> prevents scaling artifacts in{" "}
                  <KaTeXMath math="D_{\hat{\mathbf{u}}}\phi" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. SCALAR PROJECTION FORMULA
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="D_{\hat{\mathbf{u}}}\phi(P) = \nabla\phi(P)\cdot\hat{\mathbf{u}} = \left.\frac{d}{ds}\phi(P + s\hat{\mathbf{u}})\right|_{s=0}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Restricting <KaTeXMath math="\phi" /> to the ray{" "}
                  <KaTeXMath math="\mathbf{r}(s) = P + s\hat{\mathbf{u}}" /> reduces 3D differentiation
                  to the slope of the single-variable 1D slice curve <KaTeXMath math="\phi(P + s\hat{\mathbf{u}})" /> at <KaTeXMath math="s=0" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. CAUCHY–SCHWARZ EXTREMES (±‖∇φ‖)
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="D_{\hat{\mathbf{u}}}\phi = \|\nabla\phi\|\cos\theta \in \big[-\|\nabla\phi\|,\; +\|\nabla\phi\|\big]"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Maximum increase (<KaTeXMath math="+\|\nabla\phi\|" />) occurs at{" "}
                  <KaTeXMath math="\theta = 0" /> along <KaTeXMath math="+\nabla\phi" />; steepest
                  drop occurs at <KaTeXMath math="\theta = \pi" />; zero change occurs along the level tangent plane (<KaTeXMath math="\theta = \pi/2" />).
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "vector-fields-divergence-curl" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="DivCurlProbeLab" />
          <DynamicLabRenderer name="VectorFieldStreamlineExplorerLab" />
          <DynamicLabRenderer name="DivCurlDecompositionLab" />

          {/* Comprehensive Vector Calculus Explanation Guide */}
          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
                  The Del (∇) Operator Quartet &amp; Coordinate-Free Geometry
                </span>
                <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                  Unifying Gradient, Directional Derivatives, Vector Fields, Divergence &amp; Curl
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Link
                  href="/multivariable-calculus/vector-calculus/gradient-of-scalar-fields"
                  className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-sweep)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-sweep)] transition-colors"
                >
                  ← Gradient ∇φ (3.3.1)
                </Link>
                <Link
                  href="/multivariable-calculus/vector-calculus/directional-derivatives"
                  className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-x)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-x)] transition-colors"
                >
                  ← Directional D_û f (3.3.2)
                </Link>
              </div>
            </div>

            {/* 4-Card Del Operator Quartet */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  1. GRADIENT: ∇f (Scalar → Vector)
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\nabla f = \left\langle \frac{\partial f}{\partial x}, \frac{\partial f}{\partial y}, \frac{\partial f}{\partial z} \right\rangle"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Converts a scalar height/potential field <KaTeXMath math="f" /> into the vector
                  field of steepest ascent, always orthogonal to level surfaces <KaTeXMath math="f=c" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. DIRECTIONAL DERIVATIVE: D_u f
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="D_{\mathbf{u}}f = \mathbf{u}\cdot\nabla f = \|\nabla f\|\cos\theta"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Projects <KaTeXMath math="\nabla f" /> along any unit compass vector{" "}
                  <KaTeXMath math="\mathbf{u}" /> to recover instantaneous slope along that ray
                  or <KaTeXMath math="0" /> along contours.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. DIVERGENCE: ∇·F (Vector → Scalar)
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\nabla\cdot\mathbf{F} = \lim_{|V|\to 0}\frac{1}{|V|}\oiint_{\partial V}\mathbf{F}\cdot d\mathbf{S}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Measures net outward flux per unit volume around a point: positive at fluid
                  sources, negative at sinks, zero for incompressible flow.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  4. CURL: ∇×F (Vector → Vector)
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="(\nabla\times\mathbf{F})\cdot\hat{\mathbf{n}} = \lim_{|A|\to 0}\frac{1}{|A|}\oint_{\partial A}\mathbf{F}\cdot d\mathbf{r}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Measures local circulation density around axis <KaTeXMath math="\hat{\mathbf{n}}" />:
                  twice the angular velocity vector <KaTeXMath math="2\boldsymbol{\omega}" /> of an
                  infinitesimal paddlewheel.
                </p>
              </div>
            </div>

            {/* Vector Field Paradoxes & Tensor Decomposition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  PARADOX 1 • STRAIGHT LINES WITH SPIN
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\mathbf{F} = \langle y, 0, 0 \rangle \implies \nabla\cdot\mathbf{F} = 0,\; (\nabla\times\mathbf{F})_z = -1"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Streamlines never curve, yet faster upper layers exert greater clockwise torque on
                  a paddlewheel than slower lower layers—proving curl detects shear, not just visible
                  swirls.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  PARADOX 2 • CURVED ORBITS WITH ZERO CURL
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\mathbf{F} = \frac{\langle -y, x \rangle}{x^2+y^2} \implies \nabla\times\mathbf{F} = \mathbf{0} \;\;(\mathbf{r}\neq\mathbf{0})"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Outer arc speed drops as <KaTeXMath math="1/r" />, balancing the shorter inner
                  radius so local rotation cancels everywhere outside the origin singularity!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  EXACT SECOND-ORDER DEL IDENTITIES
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\nabla\times(\nabla f) = \mathbf{0}, \quad \nabla\cdot(\nabla\times\mathbf{F}) = 0, \quad \nabla^2 f = \nabla\cdot(\nabla f)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Every conservative gradient field is curl-free, and every curl field is
                  divergence-free (solenoidal)—the backbone of Helmholtz&apos;s theorem and Maxwell&apos;s
                  equations.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "line-integrals-work" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="LineIntegralWorkLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Work Integrals vs. Scalar Line Integrals &amp; Path Independence Criterion
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. TANGENTIAL PROJECTION WORK
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="W = \int_C \mathbf{F}\cdot \hat{\mathbf{T}}\,ds = \int_a^b \mathbf{F}(\mathbf{r}(t))\cdot\mathbf{r}'(t)\,dt"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Accumulates only the component of force pushing along the curve&apos;s tangent
                  <KaTeXMath math="\mathbf{r}'(t)\,dt = d\mathbf{r}" />; reversing orientation flips{" "}
                  <KaTeXMath math="W \to -W" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. FUNDAMENTAL THEOREM FOR LINE INTEGRALS
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\mathbf{F} = \nabla f \implies \int_A^B \nabla f\cdot d\mathbf{r} = f(B) - f(A)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  In conservative fields (where <KaTeXMath math="\mathbf{F}" /> is a gradient),
                  work collapses to potential difference between endpoints alone.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. CURL SCREEN FOR CONSERVATIVE FIELDS
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\nabla\times\mathbf{F} = \mathbf{0} \text{ on simply connected domain} \iff \oint_C \mathbf{F}\cdot d\mathbf{r} = 0"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Any loop enclosing non-zero curl extracts or loses net energy—watch out for
                  punctured domains like <KaTeXMath math="\langle -y, x \rangle / r^2" />!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "greens-theorem" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="GreensTheoremLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Two Forms of Green&apos;s Theorem: Tangential Circulation vs. Normal 2D Flux
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  1. CIRCULATION–CURL FORM (TANGENTIAL)
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\oint_{\partial D} \mathbf{F}\cdot\hat{\mathbf{T}}\,ds = \oint_{\partial D} (P\,dx + Q\,dy) = \iint_D \left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right) dA"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Adjacent interior sub-squares traverse shared walls in opposite directions and
                  cancel, leaving only outer boundary circulation balanced by summed z-curl.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  2. FLUX–DIVERGENCE FORM (OUTWARD NORMAL)
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\oint_{\partial D} \mathbf{F}\cdot\hat{\mathbf{n}}\,ds = \oint_{\partial D} (P\,dy - Q\,dx) = \iint_D \left(\frac{\partial P}{\partial x} + \frac{\partial Q}{\partial y}\right) dA"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Rotating the tangent by <KaTeXMath math="-90^\circ" /> yields the outward normal{" "}
                  <KaTeXMath math="\hat{\mathbf{n}}\,ds = \langle dy, -dx\rangle" />, turning
                  Green&apos;s Theorem directly into 2D Gauss Divergence!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "surface-integrals-flux" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="SurfaceFluxLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Parameterizing Oriented Surfaces &amp; Vector Area Elements <KaTeXMath math="d\mathbf{S}" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. PARAMETRIC VECTOR ELEMENT
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="d\mathbf{S} = \hat{\mathbf{n}}\,dS = \pm(\mathbf{r}_u \times \mathbf{r}_v)\,du\,dv"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  The cross product <KaTeXMath math="\mathbf{r}_u\times\mathbf{r}_v" /> simultaneously
                  measures patch area stretching and points normal to the surface.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. EXPLICIT GRAPH z = g(x, y)
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\iint_S \mathbf{F}\cdot d\mathbf{S} = \iint_{R_{xy}} (-P g_x - Q g_y + R)\,dx\,dy"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  For upward orientation, <KaTeXMath math="\mathbf{r}_x\times\mathbf{r}_y" />{" "}
                  simplifies directly to <KaTeXMath math="\langle -g_x, -g_y, 1\rangle" />—the exact
                  gradient <KaTeXMath math="\nabla(z - g(x,y))" />!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. ORIENTATION REVERSAL SIGN
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\hat{\mathbf{n}} \mapsto -\hat{\mathbf{n}} \implies \Phi \mapsto -\Phi"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Unlike scalar surface area, flux is signed: always check whether the normal is
                  outward/upward or inward/downward before integrating.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "stokes-divergence-theorems" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="StokesDivergenceLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              The Grand Unification Across Dimensions: FTC → Green → Stokes → Gauss
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  1. STOKES&apos; SURFACE INVARIANCE
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\iint_{S_1} (\nabla\times\mathbf{F})\cdot d\mathbf{S} = \oint_{\partial S} \mathbf{F}\cdot d\mathbf{r} = \iint_{S_2} (\nabla\times\mathbf{F})\cdot d\mathbf{S}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Any orientable surface spanned on the same oriented rim <KaTeXMath math="\partial S" />{" "}
                  collects identical curl flux—replace tricky domes with flat disk caps!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  2. GAUSS&apos;S CONTROL-VOLUME LAW
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\oiint_{\partial E} \mathbf{F}\cdot\hat{\mathbf{n}}\,dS = \iiint_E (\nabla\cdot\mathbf{F})\,dV"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Closed-surface outward flux equals the sum of every microscopic source and sink{" "}
                  <KaTeXMath math="\nabla\cdot\mathbf{F}" /> trapped inside solid <KaTeXMath math="E" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  3. GENERALIZED STOKES PRINCIPLE
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\int_{\Omega} d\omega = \int_{\partial\Omega} \omega"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Every integral theorem equates the total microscopic derivative (<KaTeXMath math="f'" />,{" "}
                  <KaTeXMath math="\nabla f" />, <KaTeXMath math="\nabla\times\mathbf{F}" />, or{" "}
                  <KaTeXMath math="\nabla\cdot\mathbf{F}" />) inside domain <KaTeXMath math="\Omega" />{" "}
                  to evaluation on its boundary <KaTeXMath math="\partial\Omega" />.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "direction-fields-integral-curves" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="SlopeFieldTracerLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Direction-Field Geometry, Isoclines &amp; The Picard–Lindelöf Uniqueness Guarantee
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. TANGENT VECTOR FIELD INTERPRETATION
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\frac{dy}{dt} = f(t,y) \iff \text{tangent direction } \langle 1,\; f(t,y) \rangle"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Every integral curve <KaTeXMath math="y(t)" /> threads smoothly through the grid
                  of slope ticks; curves along a level set <KaTeXMath math="f(t,y) = c" /> share an
                  identical inclination angle <KaTeXMath math="\arctan(c)" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  2. EULER VS. 4TH-ORDER RUNGE–KUTTA
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="y_{n+1}^{\text{Euler}} = y_n + h f(t_n, y_n) \;\text{ vs. }\; \mathcal{O}(h^4)\text{ weighted slopes}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Explicit Euler holds the initial tangent constant across the full step{" "}
                  <KaTeXMath math="h" />, drifting off concave bends unless <KaTeXMath math="h" />{" "}
                  is tiny or higher-order mid-interval sampling (RK4) is used.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. PICARD–LINDELÖF UNIQUENESS RULE
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="f,\; \frac{\partial f}{\partial y} \text{ continuous near } (t_0, y_0) \implies \exists!\; y(t)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Unique trajectories never intersect! Only when Lipschitz continuity breaks (such
                  as <KaTeXMath math="y'=1.4|y|^{2/3}" /> along <KaTeXMath math="y=0" />) can two
                  distinct solutions branch from one initial seed.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "separable-linear-odes" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="AutonomousPhaseLineLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              1D Autonomous Stability Classification &amp; Classical Bifurcation Normal Forms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  1. LINEARIZATION STABILITY CRITERION
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="f(y^*)=0 \implies \begin{cases} f'(y^*) < 0 & \text{Sink (Stable)} \\ f'(y^*) > 0 & \text{Source (Unstable)} \end{cases}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Expanding <KaTeXMath math="y = y^* + \eta" /> yields{" "}
                  <KaTeXMath math="\dot{\eta} \approx f'(y^*)\eta" />; negative slope pulls nearby
                  states inward exponentially while positive slope amplifies perturbations.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  2. THREE FUNDAMENTAL 1D BIFURCATIONS
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\underbrace{r + y^2}_{\text{Saddle-Node}}, \quad \underbrace{ry - y^2}_{\text{Transcritical}}, \quad \underbrace{ry - y^3}_{\text{Pitchfork}}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Tipping points arise exactly when <KaTeXMath math="f(y^*) = 0" /> and{" "}
                  <KaTeXMath math="f'(y^*) = 0" /> simultaneously—creating, swapping, or splitting
                  steady states.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  3. SEPARABLE &amp; ANALYTICAL TOOLKIT
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\int \frac{dy}{g(y)} = \int h(t)\,dt + C"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Autonomous flows <KaTeXMath math="\dot{y}=f(y)" /> are always separable by
                  quadrature away from equilibria; see Chapter{" "}
                  <Link
                    href="/multivariable-calculus/differential-calculus/first-order-lde-bernoulli"
                    className="text-[var(--math-ink-x)] underline"
                  >
                    3.1.9 (Integrating Factors &amp; Bernoulli)
                  </Link>{" "}
                  for exact linear integration.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "damped-harmonic-oscillators" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="HarmonicOscillatorLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Harmonic Regimes: Complex Root Geometry, Mechanical–RLC Analogy &amp; Quality Factor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. DAMPING RATIO ζ &amp; COMPLEX S-PLANE CIRCLE
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="s_{1,2} = \omega_n\bigl(-\zeta \pm i\sqrt{1-\zeta^2}\bigr) \implies |s_{1,2}| = \omega_n"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  While underdamped (<KaTeXMath math="0 \le \zeta &lt; 1" />), the roots travel along
                  a semicircle of radius <KaTeXMath math="\omega_n = \sqrt{k/m}" /> until they
                  coalesce at <KaTeXMath math="s = -\omega_n" /> (<KaTeXMath math="\zeta = 1" />).
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. MECHANICAL ↔ SERIES RLC ANALOGY
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="m\ddot{x}+c\dot{x}+kx=0 \;\longleftrightarrow\; L\ddot{q}+R\dot{q}+\frac{1}{C}q=0"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Inductance <KaTeXMath math="L" /> plays the role of inertia <KaTeXMath math="m" />,
                  resistance <KaTeXMath math="R" /> dissipates energy like dashpot friction{" "}
                  <KaTeXMath math="c" />, and <KaTeXMath math="1/C" /> acts as spring stiffness{" "}
                  <KaTeXMath math="k" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. CRITICAL VS. OVERDAMPED BOTTLENECK
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="Q = \frac{1}{2\zeta}, \qquad T_s^{(2\%)} \approx \frac{4}{\zeta\omega_n}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Beyond <KaTeXMath math="\zeta = 1" />, one real root pushes rightward toward{" "}
                  <KaTeXMath math="0" />, slowing recovery drastically—which is why critical damping
                  (<KaTeXMath math="\zeta = 1" />) settles fastest without ringing.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "forced-oscillations-resonance" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="ForcedResonanceLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Phasor Steady State, Acoustic Beats &amp; Resonance Peak Shift
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  1. ACOUSTIC BEATS IDENTITY (ζ = 0)
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\cos(\omega t) - \cos(\omega_n t) = 2\sin\!\left(\frac{\omega_n-\omega}{2}t\right)\sin\!\left(\frac{\omega_n+\omega}{2}t\right)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  When <KaTeXMath math="\omega \approx \omega_n" />, fast oscillations at{" "}
                  <KaTeXMath math="(\omega_n+\omega)/2" /> pulse slowly inside the amplitude
                  envelope of beat half-frequency <KaTeXMath math="|\omega_n - \omega|/2" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. COMPLEX PHASOR TRANSFER GAIN H(iω)
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="H(i\omega) = \frac{1/k}{(1 - r^2) + i(2\zeta r)}, \quad r = \frac{\omega}{\omega_n}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  In steady state, <KaTeXMath math="x_p(t)" /> trails driving force by{" "}
                  <KaTeXMath math="\phi(\omega) = \operatorname{atan2}(2\zeta r,\, 1-r^2)" />,
                  passing cleanly through <KaTeXMath math="90^\circ" /> at <KaTeXMath math="r = 1" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-upper)] block">
                  3. WHY PEAK RESONANCE SITS BELOW ω_n
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\frac{d}{dr}\bigl[(1-r^2)^2 + 4\zeta^2 r^2\bigr] = 0 \implies \omega_{\text{res}} = \omega_n\sqrt{1 - 2\zeta^2}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Viscous drag pulls maximum displacement slightly left of{" "}
                  <KaTeXMath math="\omega_n" />; once <KaTeXMath math="\zeta \ge 1/\sqrt{2}" />, the
                  peak vanishes altogether!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "linear-phase-portraits" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="TraceDeterminantPhaseLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Poincaré Stability Classification, Matrix Exponential <KaTeXMath math="e^{At}" /> &amp; Eigenvector Decoupling
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. INVARIANT TRACE &amp; DETERMINANT
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\det(A - \lambda I) = \lambda^2 - \tau\lambda + \Delta = 0"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Sum of eigenvalues <KaTeXMath math="\lambda_1 + \lambda_2 = \tau" /> tracks phase-area
                  divergence rate (<KaTeXMath math="\nabla\cdot(A\mathbf{x}) = \tau" />), while{" "}
                  <KaTeXMath math="\Delta = \lambda_1\lambda_2" /> catches opposite-sign saddle splits.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. STRAIGHT-LINE EIGENVECTOR RAYS
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\mathbf{x}(t) = c_1 e^{\lambda_1 t}\mathbf{v}_1 + c_2 e^{\lambda_2 t}\mathbf{v}_2"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Any seed placed on eigenvector line <KaTeXMath math="\mathbf{v}_i" /> moves purely
                  radially along it; trajectories between two negative nodes curve toward whichever
                  mode decays slower.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. MATRIX EXPONENTIAL &amp; STABILITY QUADRANT
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\mathbf{x}(t) = e^{At}\mathbf{x}_0 \xrightarrow{t\to\infty} \mathbf{0} \iff \tau < 0 \;\land\; \Delta > 0"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  The upper-left open quadrant of the Poincaré diagram collects every asymptotically
                  stable node and spiral regardless of matrix rotation.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "nonlinear-nullclines-limit-cycles" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="NonlinearPhasePortraitLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Nullclines, Hartman–Grobman Linearization &amp; Limit Cycles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. NULLCLINE SIGN QUADRANTS
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="f(x,y) = 0 \text{ (vertical flow)}, \qquad g(x,y) = 0 \text{ (horizontal flow)}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Nullclines slice the plane into directional quadrants before solving a single
                  differential equation; intersections where both vanish simultaneously pin fixed
                  equilibria <KaTeXMath math="(x^*, y^*)" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. HARTMAN–GROBMAN THEOREM
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\operatorname{Re}(\lambda_i(J)) \neq 0 \implies \text{Nonlinear Flow} \simeq \text{Linear } J\mathbf{u}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Saddles, sinks, and sources preserve their qualitative geometry locally, whereas
                  non-hyperbolic centers (<KaTeXMath math="\operatorname{Re}(\lambda) = 0" />) are
                  fragile unless protected by a conserved energy integral.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  3. SELF-SUSTAINED LIMIT CYCLES
                </span>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\text{Poincaré–Bendixson: Trapped Annulus } (\text{No Equilibria}) \implies \text{Closed Orbit}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Unlike fragile linear centers that scale with initial amplitude, nonlinear limit
                  cycles (like Van der Pol) actively pump small vibrations outward and damp large
                  swings inward onto one fixed loop.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "heat-equation-diffusion" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="HeatEquationDiffusionLab" />

          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-upper)] block">
                Parabolic PDE Theory • Module 4.4.1
              </span>
              <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                Curvature Smoothing, Separation of Variables &amp; Boundary Equilibrium
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  1. CONCAVITY DRIVES TEMPERATURE RATE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\frac{\partial u}{\partial t} = \alpha \frac{\partial^2 u}{\partial x^2}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  At local spikes where <KaTeXMath math="u_{xx} < 0" />, temperature immediately
                  drops (<KaTeXMath math="u_t < 0" />); at troughs where{" "}
                  <KaTeXMath math="u_{xx} > 0" />, neighboring heat raises temperature until all
                  curvature vanishes (<KaTeXMath math="u_{xx} = 0" />).
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. n² EXPONENTIAL MODE FILTERING
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="b_n(t) = b_n(0)\,e^{-\alpha (n\pi/L)^2 t}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Higher harmonic mode <KaTeXMath math="n = 10" /> decays{" "}
                  <KaTeXMath math="100\times" /> faster than the fundamental mode{" "}
                  <KaTeXMath math="n = 1" />, explaining why discontinuous step profiles become
                  infinitely differentiable for every <KaTeXMath math="t > 0" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  3. DIRICHLET VS. NEUMANN STEADY STATE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="u(0,t)=u(L,t)=0 \implies 0; \quad u_x=0 \implies \bar{u}_0" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Ice-bath Dirichlet boundaries drain all thermal energy to zero, whereas insulated
                  Neumann boundaries trap all heat so temperature equalizes at the initial spatial
                  average <KaTeXMath math="a_0/2" />.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "wave-equation-normal-modes" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="WaveEquationModesLab" />

          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
                Hyperbolic PDE Theory • Module 4.4.2
              </span>
              <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                Characteristic Coordinates, Energy Conservation &amp; Chladni Degeneracy
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. FACTORIZATION INTO LEFT/RIGHT WAVES
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="(\partial_t - c\partial_x)(\partial_t + c\partial_x)u = 0 \implies u = F(x-ct) + G(x+ct)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Unlike heat diffusion, the 1D wave operator factors into two transport equations,
                  splitting initial shape <KaTeXMath math="f(x)" /> into two un-attenuated
                  half-pulses <KaTeXMath math="\tfrac{1}{2}\tilde{f}(x\mp ct)" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. PHASE INVERSION AT PINNED ENDS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\tilde{f}(-s) = -\tilde{f}(s), \quad u(0,t)=u(L,t)=0" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Extending <KaTeXMath math="f(x)" /> asymmetrically across <KaTeXMath math="x=0" />{" "}
                  and <KaTeXMath math="x=L" /> causes reflected waves to invert amplitude by{" "}
                  <KaTeXMath math="180^\circ" />, cancelling out exactly at pinned boundary clamps.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  3. 2D CHLADNI NODAL LINES
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\omega_{mn} = c\pi\sqrt{m^2+n^2} \implies \omega_{12} = \omega_{21}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  On a square plate, symmetric pairs <KaTeXMath math="(m,n)" /> and{" "}
                  <KaTeXMath math="(n,m)" /> vibrate at identical frequency, combining into tilted,
                  curved, or loop-shaped stationary Chladni nodal contours.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "vectors-linear-combinations" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="VectorSpanExplorerLab" />

          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
                Linear Space Foundations • Module 2.1.1
              </span>
              <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                Linear Combinations, Subspace Span &amp; Linear Dependence
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. COLUMN PICTURE OF Ax = b
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="c_1\mathbf{v}_1 + c_2\mathbf{v}_2 = \mathbf{b}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Solving a linear system asks which scalar weights{" "}
                  <KaTeXMath math="(c_1, c_2)" /> blend the columns{" "}
                  <KaTeXMath math="\mathbf{v}_1, \mathbf{v}_2" /> tip-to-tail to hit target{" "}
                  <KaTeXMath math="\mathbf{b}" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. DIMENSION OF SPAN
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\dim\operatorname{span}\{\mathbf{v}_1,\dots,\mathbf{v}_k\} = \operatorname{rank}([\mathbf{v}_1\cdots\mathbf{v}_k])" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Each genuinely new direction adds one degree of freedom: one non-zero vector gives
                  a line, two non-collinear give a plane, and three non-coplanar fill{" "}
                  <KaTeXMath math="\mathbb{R}^3" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-upper)] block">
                  3. REDUNDANCY &amp; COLLAPSE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\det[\mathbf{v}_1\;\mathbf{v}_2] = 0 \implies \text{Dependent}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Whenever one vector already lies inside the span of the others, signed area/volume
                  drops to zero and targets outside that collapsed line or plane have no solution.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "basis-change-of-basis" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="ChangeOfBasisLab" />

          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
                Coordinate Frames • Module 2.1.2
              </span>
              <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                Why Every Basis Defines a Custom Coordinate Grid
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. BASIS MATRIX P (ℬ → STANDARD)
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\mathbf{x} = P[\mathbf{x}]_{\mathcal{B}}, \qquad P = [\mathbf{b}_1\mid \mathbf{b}_2]" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Placing basis vectors <KaTeXMath math="\mathbf{b}_1, \mathbf{b}_2" /> as the
                  columns of <KaTeXMath math="P" /> converts custom grid counts{" "}
                  <KaTeXMath math="(c_1, c_2)" /> back into standard physical coordinates.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. INVERSE TRANSLATION (STANDARD → ℬ)
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="[\mathbf{x}]_{\mathcal{B}} = P^{-1}\mathbf{x}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Solving for how many oblique grid tiles reach a physical point requires multiplying
                  by <KaTeXMath math="P^{-1}" />, which exists if and only if{" "}
                  <KaTeXMath math="\det(P)\neq 0" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  3. ORTHONORMAL ADVANTAGE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="Q^T Q = I \implies Q^{-1} = Q^T" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  When basis vectors are unit length and perpendicular, matrix inversion collapses to
                  a simple dot-product transpose <KaTeXMath math="[\mathbf{x}]_Q = Q^T\mathbf{x}" />.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "four-fundamental-subspaces" && (
        <div className="space-y-10">
          <DynamicLabRenderer name="FourSubspacesLab" />

          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
                Fundamental Theorem of Linear Algebra • Module 2.1.3
              </span>
              <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                Row Space, Nullspace, Column Space &amp; Orthogonal Complements
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. ORTHOGONAL SPLITTING
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\mathcal{R}(A^T) \perp \mathcal{N}(A), \qquad \mathcal{C}(A) \perp \mathcal{N}(A^T)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  By definition <KaTeXMath math="A\mathbf{x}_n = \mathbf{0}" /> means{" "}
                  <KaTeXMath math="\mathbf{x}_n" /> is dot-product zero against every row of{" "}
                  <KaTeXMath math="A" />—splitting <KaTeXMath math="\mathbb{R}^n" /> at{" "}
                  <KaTeXMath math="90^\circ" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. RANK–NULLITY BALANCE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\dim\mathcal{C}(A) + \dim\mathcal{N}(A) = n" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Every input dimension either survives bijectively from Row Space into Column Space
                  (<KaTeXMath math="r" /> dimensions) or collapses completely into Nullspace (
                  <KaTeXMath math="n - r" /> dimensions).
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-upper)] block">
                  3. COMPLETE SOLUTION STRUCTURE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\mathbf{x}_{\text{complete}} = \mathbf{x}_{\text{row}} + \mathbf{x}_{\text{null}}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Adding any vector from <KaTeXMath math="\mathcal{N}(A)" /> moves{" "}
                  <KaTeXMath math="\mathbf{x}" /> along a hidden fiber while keeping{" "}
                  <KaTeXMath math="A\mathbf{x}" /> completely stationary in <KaTeXMath math="\mathcal{C}(A)" />.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "matrix-transformations-2d-3d" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="MatrixTransformationLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Column-Picture Theory: Matrix Multiplication as Transformation Composition
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  1. COLUMNS TRACK BASIS VECTORS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="A = [\,T(\hat{\imath}) \;\mid\; T(\hat{\jmath})\,] = [\,\mathbf{a}_1 \;\mid\; \mathbf{a}_2\,]" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Linearity means knowing where <KaTeXMath math="\hat{\imath}" /> and{" "}
                  <KaTeXMath math="\hat{\jmath}" /> land uniquely determines where every grid line in{" "}
                  <KaTeXMath math="\mathbb{R}^2" /> travels.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. LINEAR COMBINATION ACTION
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="A\mathbf{x} = x\,\mathbf{a}_1 + y\,\mathbf{a}_2" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Multiplying <KaTeXMath math="A" /> by <KaTeXMath math="\mathbf{x}=[x,y]^T" /> blends the
                  transformed columns with the exact original weights <KaTeXMath math="x,y" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. NON-COMMUTATIVE COMPOSITION
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="(BA)\mathbf{x} = B(A\mathbf{x}) \neq (AB)\mathbf{x}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  The product <KaTeXMath math="BA" /> applies <KaTeXMath math="A" /> first and{" "}
                  <KaTeXMath math="B" /> second (right-to-left); swapping order rotates or shears along different axes.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "determinants-volume-scaling" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="DeterminantVolumeLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Signed Measure Theory: Orientation, Cross Products & Singularity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. AREA & VOLUME SCALING FACTOR
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\text{Vol}(A(\Omega)) = |\det A|\cdot\text{Vol}(\Omega)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Any unit square or unit cube is stretched uniformly in measure by{" "}
                  <KaTeXMath math="|\det A|" />, making <KaTeXMath math="\det" /> the linear core of the Jacobian.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-upper)] block">
                  2. HANDEDNESS & ORIENTATION FLIP
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\det[\mathbf{a}_1\;\mathbf{a}_2\;\mathbf{a}_3] = \mathbf{a}_1\cdot(\mathbf{a}_2\times\mathbf{a}_3)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Positive determinants preserve right-handed orientation; negative determinants turn space inside-out
                  through a mirror reflection.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. SINGULAR COLLAPSE & PRODUCTS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\det(A)=0 \iff \text{rank}(A) < n" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  When columns become linearly dependent, the parallelepiped flattens to zero volume and{" "}
                  <KaTeXMath math="A^{-1}" /> ceases to exist.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "orthogonality-least-squares" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="LeastSquaresProjectionLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Projection & Normal Equations: Orthogonal Decomposition in Overdetermined Systems
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. PERPENDICULAR RESIDUAL
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\mathbf{e} = \mathbf{b} - A\hat{\mathbf{x}} \in \mathcal{C}(A)^\perp = \mathcal{N}(A^T)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  The shortest distance from an unreachable target <KaTeXMath math="\mathbf{b}" /> to{" "}
                  <KaTeXMath math="\mathcal{C}(A)" /> drops orthogonally onto the subspace plane.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. THE NORMAL EQUATIONS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="A^T A\,\hat{\mathbf{x}} = A^T\mathbf{b}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Setting <KaTeXMath math="A^T(\mathbf{b}-A\hat{\mathbf{x}})=\mathbf{0}" /> converts an unsolvable{" "}
                  <KaTeXMath math="m\times n" /> system into a square symmetric system.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. PROJECTION OPERATOR
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="P = A(A^T A)^{-1}A^T,\quad P^2 = P" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Idempotency (<KaTeXMath math="P^2=P" />) and symmetry (<KaTeXMath math="P^T=P" />) ensure projecting
                  an already projected vector leaves it unchanged.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "eigenvalues-eigenvectors" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="EigenvectorCompassLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Eigen-Analysis Theory: Invariant Directions, Characteristic Polynomial & Trace–Determinant Plane
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. INVARIANT EIGENRAYS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="A\mathbf{v} = \lambda\mathbf{v} \iff (A - \lambda I)\mathbf{v} = \mathbf{0}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Nonzero solutions exist precisely when <KaTeXMath math="A - \lambda I" /> collapses space,
                  forcing <KaTeXMath math="\det(A - \lambda I) = 0" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. TRACE & DETERMINANT INVARIANTS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\operatorname{tr}(A) = \lambda_1 + \lambda_2,\qquad \det(A) = \lambda_1 \lambda_2" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Sum and product of eigenvalues stay identical across any change of basis{" "}
                  <KaTeXMath math="P^{-1}AP" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-upper)] block">
                  3. ROTATION VS. DEFECTIVE SHEAR
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\Delta = \operatorname{tr}(A)^2 - 4\det(A)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Negative discriminant yields complex conjugate rotations (<KaTeXMath math="\Delta < 0" />);
                  repeated roots can lose an independent eigenvector.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "quadratic-forms-spectral" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="QuadraticFormLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Spectral Theorem: Orthogonal Diagonalization & Quadratic Curvature
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. REAL SYMMETRIC DECOMPOSITION
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="A = A^T \implies A = Q\Lambda Q^T,\quad Q^T Q = I" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Distinct eigenvalues of any symmetric matrix force perpendicular eigenvectors{" "}
                  <KaTeXMath math="\mathbf{q}_1 \perp \mathbf{q}_2" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. ERASING CROSS-TERMS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\mathbf{x}^T A \mathbf{x} = \lambda_1 y_1^2 + \lambda_2 y_2^2,\quad \mathbf{y}=Q^T\mathbf{x}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Rotating into the principal frame decouples <KaTeXMath math="2bxy" /> into pure squared
                  curvatures weighted by eigenvalues.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. DEFINITENESS SIGN TEST
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\lambda_1,\lambda_2 > 0 \;\text{(Bowl)},\quad \lambda_1\lambda_2 < 0 \;\text{(Saddle)}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Eigenvalue signs classify energy bowls, valleys (<KaTeXMath math="\lambda_2=0" />), and unstable
                  saddle critical points directly.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "singular-value-decomposition" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="SVDThreeStageLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Universal Matrix Anatomy: Singular Value Decomposition & Low-Rank Approximation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. ROTATE → STRETCH → ROTATE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="A = U\Sigma V^T,\qquad A\mathbf{v}_i = \sigma_i\mathbf{u}_i" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Every matrix—even non-square or defective—maps an orthonormal input basis{" "}
                  <KaTeXMath math="\{\mathbf{v}_i\}" /> onto orthogonal semi-axes <KaTeXMath math="\{\sigma_i\mathbf{u}_i\}" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. SYMMETRIC GRAM CONNECTION
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="A^T A = V\Sigma^T\Sigma V^T,\qquad \sigma_i = \sqrt{\lambda_i(A^T A)}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Right singular vectors diagonalize <KaTeXMath math="A^TA" />, guaranteeing orthogonal principal
                  directions with non-negative stretches <KaTeXMath math="\sigma_i \ge 0" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  3. ECKART–YOUNG BEST RANK-1
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="A_1 = \sigma_1\mathbf{u}_1\mathbf{v}_1^T,\qquad \|A - A_1\|_2 = \sigma_2" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Dropping smaller singular terms yields the provably optimal low-rank compression across image, PCA,
                  and recommender pipelines.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "euler-formula-complex-plane" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="EulerHelixPhasorLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Euler&apos;s Formula & Complex Exponential Geometry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  1. TAYLOR SERIES BRIDGE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="e^{i\theta} = \cos\theta + i\sin\theta" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Splitting even and odd powers of <KaTeXMath math="\sum (i\theta)^n / n!" /> unifies exponential
                  growth with circular trigonometry.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. ROTATION + SCALING MULTIPLICATION
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="z_1 z_2 = (r_1 r_2)e^{i(\theta_1 + \theta_2)}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Multiplying by a complex number scales radii radially and adds phase angles cleanly counterclockwise.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  3. COMPLEX FREQUENCY SPIRAL
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="e^{(\sigma+i\omega)t} = e^{\sigma t}\cos\omega t + i\,e^{\sigma t}\sin\omega t" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Real decay rate <KaTeXMath math="\sigma" /> sets the envelope radius while imaginary frequency{" "}
                  <KaTeXMath math="\omega" /> drives steady rotation.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "cauchy-riemann-conformal" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="ConformalMappingLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Analyticity & Angle-Preserving Conformal Theory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. CAUCHY–RIEMANN INVARIANCE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="u_x = v_y, \qquad u_y = -v_x" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Complex differentiability forces real and imaginary limits along <KaTeXMath math="\Delta x" /> and{" "}
                  <KaTeXMath math="i\Delta y" /> to agree identically.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  2. SCALED ROTATION JACOBIAN
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="J_f = |f'(z)|\begin{bmatrix} \cos\alpha & -\sin\alpha \\ \sin\alpha & \cos\alpha \end{bmatrix}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Locally, any analytic map with <KaTeXMath math="f'(z)\neq 0" /> acts as a pure isotropic zoom +
                  rigid rotation, preserving 90° intersections.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  3. HARMONIC CONJUGATES
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\nabla^2 u = 0,\quad \nabla^2 v = 0,\quad \nabla u \cdot \nabla v = 0" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Both real and imaginary parts solve Laplace&apos;s equation automatically, yielding orthogonal
                  equipotential and flow streamlines.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "cauchy-integral-formula" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="CauchyContourLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Contour Homotopy, Green&apos;s Theorem & Cauchy&apos;s Integral Formula
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-upper)] block">
                  1. CAUCHY–GOURSAT INVARIANCE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\oint_C (u + iv)(dx + i\,dy) = 0 \iff u_x = v_y,\, u_y = -v_x" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  When a domain is analytic throughout its interior, Green&apos;s Theorem reduces both real and
                  imaginary curls to zero by Cauchy–Riemann symmetry.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  2. TOPOLOGICAL WINDING NUMBER
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\oint_C \frac{dz}{z - z_0} = 2\pi i \cdot W(C, z_0)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Stretching the path across open analytic regions leaves the integral completely untouched—only crossing
                  the pole <KaTeXMath math="z_0" /> jumps the winding integer <KaTeXMath math="W" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  3. BOUNDARY RECONSTRUCTION
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="f(z_0) = \frac{1}{2\pi i}\oint_C \frac{f(z)}{z - z_0}\,dz" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Every analytic function&apos;s interior value <KaTeXMath math="f(z_0)" /> is uniquely locked and
                  computable from its boundary values along <KaTeXMath math="C" />.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "poles-residue-theorem" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="ResidueTheoremLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Laurent Principal Parts, Residues & Real Improper Integrals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-upper)] block">
                  1. LAURENT SERIES RESIDUE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="f(z) = \sum_{n=-\infty}^{\infty} a_n (z-z_0)^n \implies \oint_C f\,dz = 2\pi i\,a_{-1}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Every power <KaTeXMath math="(z-z_0)^n" /> except <KaTeXMath math="n = -1" /> possesses an
                  antiderivative on punctured circles and integrates to zero around closed loops.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  2. RESIDUE SUMMATION LAW
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\oint_C f(z)\,dz = 2\pi i \sum_{z_k \in \operatorname{int}(C)} \operatorname{Res}(f, z_k)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Higher-order poles of order <KaTeXMath math="m" /> extract <KaTeXMath math="a_{-1}" /> via{" "}
                  <KaTeXMath math="\frac{1}{(m-1)!}\lim_{z\to z_0}\frac{d^{m-1}}{dz^{m-1}}[(z-z_0)^m f(z)]" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. UPPER-HALF-PLANE CLOSURE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\int_{-\infty}^{\infty} \frac{dx}{x^2+1} = 2\pi i\,\operatorname{Res}\!\left(f, +i\right) = \pi" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Closing the real axis with a large upper semicircle whose arc contribution vanishes as{" "}
                  <KaTeXMath math="R \to \infty" /> evaluates improper real integrals algebraically.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "s-plane-poles-zeros" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="LaplaceSPlane3DLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              s-Plane Geometry: Poles, Zeros, ROC & The jω Bode Ridge
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. COMPLEX FREQUENCY FACTOR
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="F(s) = \int_{0}^{\infty} f(t)e^{-\sigma t}e^{-i\omega t}\,dt,\quad s = \sigma + i\omega" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Multiplying by <KaTeXMath math="e^{-\sigma t}" /> acts as an adjustable exponential damper that
                  forces even growing time signals to converge inside the ROC.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. REGION OF CONVERGENCE & STABILITY
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\text{Causal ROC: }\operatorname{Re}(s) > \max_k \operatorname{Re}(p_k)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  A causal LTI system is BIBO stable if and only if all poles lie strictly in the left half-plane so
                  the imaginary axis <KaTeXMath math="\sigma = 0" /> sits inside the ROC.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  3. BODE FREQUENCY SLICE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="|H(i\omega)| = |K|\frac{\prod |i\omega - z_i|}{\prod |i\omega - p_j|}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Evaluating the 3D surface along <KaTeXMath math="s = i\omega" /> equals dividing geometric vector
                  distances from zeros by vector distances from poles!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "impulse-response-convolution" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="ConvolutionFlipSlideLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Impulse Response Superposition & The Convolution Theorem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. LTI SUPERPOSITION SUM
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="y(t) = (x * h)(t) = \int_{0}^{t} x(\tau)\,h(t - \tau)\,d\tau" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Every input value <KaTeXMath math="x(\tau)\,d\tau" /> triggers a scaled, delayed impulse echo{" "}
                  <KaTeXMath math="h(t-\tau)" /> that adds linearly at observation time <KaTeXMath math="t" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. WHY KERNELS FLIP BACKWARD
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\text{Age of impulse emitted at }\tau\text{ equals }t - \tau" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Reversing <KaTeXMath math="h(\tau) \mapsto h(t-\tau)" /> lines up recent inputs with fresh impulse
                  peaks and older inputs with decayed kernel tails.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. ALGEBRAIC s-DOMAIN PRODUCT
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\mathcal{L}\{(x * h)(t)\} = X(s)\,H(s)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Transforming to <KaTeXMath math="s" />-space replaces the sliding integral completely with simple
                  pointwise transfer-function multiplication.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "fourier-series-gibbs" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="FourierSeriesGibbsLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Orthogonal Function Spaces, Parseval Energy & Wilbraham–Gibbs Overshoot
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  1. INNER-PRODUCT PROJECTION
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\int_{-\pi}^{\pi} \sin(nt)\sin(mt)\,dt = \pi\,\delta_{nm}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Harmonic sinusoids act like infinite-dimensional orthogonal unit vectors, isolating each{" "}
                  <KaTeXMath math="a_n, b_n" /> independently via projection.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  2. PARSEVAL ENERGY CONSERVATION
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\frac{1}{\pi}\int_{-\pi}^{\pi} |f(t)|^2\,dt = \frac{a_0^2}{2} + \sum_{n=1}^{\infty} (a_n^2 + b_n^2)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Total waveform power equals the sum of squared harmonic amplitudes cleanly across time and frequency.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. INVARIANT GIBBS OVERSHOOT
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\frac{1}{\pi}\int_0^{\pi} \frac{\sin u}{u}\,du - \frac{1}{2} \approx 8.95\%" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Jump discontinuities compress ringing closer to the edge as <KaTeXMath math="N \to \infty" />, yet
                  the spike height never drops below ~8.95% of the jump size.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "fourier-transform-spectra" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="FourierTransformWindingLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Continuous Fourier Integral, Scaling Duality & Heisenberg–Gabor Uncertainty
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. COMPLEX WINDING CENTROID
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\hat{f}(\omega) = \int_{-\infty}^{\infty} f(t)e^{-i\omega t}\,dt" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Wrapping <KaTeXMath math="f(t)" /> around the origin at rate <KaTeXMath math="\omega" /> cancels
                  off-resonance cycles symmetrically while snapping outward whenever <KaTeXMath math="\omega" />{" "}
                  matches a carrier tone.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. RECIPROCAL TIME–FREQUENCY SCALING
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\mathcal{F}\{f(at)\} = \frac{1}{|a|}\hat{f}\!\left(\frac{\omega}{a}\right)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Compressing a waveform in time (<KaTeXMath math="a &gt; 1" />) stretches its Fourier spectrum
                  proportionally wider across frequency.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  3. UNCERTAINTY PRINCIPLE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\Delta t \cdot \Delta\omega \ge \frac{1}{2}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  No signal can be simultaneously ultra-narrow in time and ultra-narrow in frequency; Gaussian pulses
                  uniquely achieve equality at <KaTeXMath math="1/2" />.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "continuous-pdfs-cdfs" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="PDFCDFMomentLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Probability Density, Cumulative Integrals & Mechanical Moments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-grid)] block">
                  1. INTERVAL PROBABILITY MASS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="P(a \le X \le b) = \int_a^b f_X(x)\,dx = F_X(b) - F_X(a)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Density <KaTeXMath math="f_X(x)" /> can exceed <KaTeXMath math="1" /> over narrow intervals so long
                  as its total integral across <KaTeXMath math="\mathbb{R}" /> normalizes to unity.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. DERIVATIVE DUALITY
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="F_X(x) = \int_{-\infty}^x f_X(t)\,dt \iff F'_X(x) = f_X(x)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Every peak in the PDF creates the steepest upward slope in the monotonically non-decreasing CDF.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  3. BALANCE FULCRUM & INERTIA
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\mu = \int x f_X(x)\,dx,\qquad \sigma^2 = \int (x-\mu)^2 f_X(x)\,dx" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Expectation acts as the horizontal center-of-mass pivot while variance equals the rotational moment
                  of inertia around <KaTeXMath math="\mu" />.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "joint-bivariate-distributions" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="BivariateGaussianLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Marginalization, Conditional Slicing & Covariance Ellipses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. MARGINAL PROJECTION
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="f_X(x) = \int_{-\infty}^{\infty} f_{X,Y}(x,y)\,dy" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Crushing all probability mass perpendicularly onto a coordinate wall integrates out the unwanted
                  nuisance variable.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. CONDITIONAL SLICE & SHRINKAGE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="Y \mid (X=x_0) \sim \mathcal{N}\!\left(\rho\frac{\sigma_y}{\sigma_x}x_0,\; \sigma_y^2(1-\rho^2)\right)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Observing correlated <KaTeXMath math="X=x_0" /> narrows the conditional bell width by factor{" "}
                  <KaTeXMath math="\sqrt{1-\rho^2}" /> along the regression mean.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  3. MAHALANOBIS CONFIDENCE ELLIPSE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\mathbf{x}^T \Sigma^{-1} \mathbf{x} = k^2 \quad (k = 1, 2)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Spectral eigenvectors of <KaTeXMath math="\Sigma" /> orient the uncertainty ellipses dynamically as{" "}
                  <KaTeXMath math="\rho" /> varies.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "numerical-quadrature-error" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="NumericalQuadratureLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Newton–Cotes Error Cancellation &amp; Legendre Orthogonality
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. SECOND-ORDER NEWTON–COTES
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="E_{\text{Trap}} = -\frac{(b-a)}{12}h^2 f''(\xi) = O(h^2)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Both Midpoint and Trapezoidal fit constant or linear segments, leaving quadratic curvature errors
                  whose magnitude halves by 4× whenever step size <KaTeXMath math="h" /> is halved.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  2. SIMPSON&apos;S BONUS ORDER O(h⁴)
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\frac{1}{3}T + \frac{2}{3}M = S \implies E_S = -\frac{(b-a)}{180}h^4 f^{(4)}(\xi)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Symmetric weighting cancels cubic error terms automatically, integrating degree-3 cubics exactly
                  with parabolic arcs.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. GAUSS–LEGENDRE DEGREE 2n−1
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="P_n(x_i) = 0 \implies \int_{-1}^{1} p_{2n-1}(x)\,dx = \sum_{i=1}^n w_i p_{2n-1}(x_i)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Freeing node locations doubles polynomial exactness from <KaTeXMath math="n-1" /> to{" "}
                  <KaTeXMath math="2n-1" />, clustering points near <KaTeXMath math="\pm 1" /> to tame endpoint oscillations.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "runge-kutta-ode-solvers" && (
        <div className="space-y-8">
          <DynamicLabRenderer name="RungeKuttaSlopeLab" />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Taylor Matching, Simpson Equivalence &amp; Step Stability
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. EULER VS. HEUN PREDICTOR
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="y_{n+1}^{\text{Heun}} = y_n + \frac{h}{2}\!\left(f(t_n,y_n) + f(t_{n+1}, y_n + h k_1)\right)" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Euler freezes the left-edge slope across the entire interval (<KaTeXMath math="O(h)" /> global error),
                  whereas Heun averages start and predicted-end tangents (<KaTeXMath math="O(h^2)" />).
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  2. BUTCHER WEIGHTS &amp; SIMPSON LINK
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="\bar{k} = \frac{1}{6}(k_1 + 2k_2 + 2k_3 + k_4) \xrightarrow{f(t)} \text{Simpson's } \frac{1}{3}" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Sampling two refined midpoint slopes (<KaTeXMath math="k_2, k_3" />) doubles midpoint weight to match
                  exact Taylor derivatives through <KaTeXMath math="h^4" /> (<KaTeXMath math="O(h^4)" /> global).
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. NUMERICAL STABILITY REGION
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath math="y' = \lambda y \implies |1 + h\lambda| \le 1 \;\;(\text{Euler}), \quad |R_{\text{RK4}}(h\lambda)| \le 1" block />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Stiff equations force explicit Euler below <KaTeXMath math="h = 2/|\lambda|" />; exceeding this threshold
                  triggers exponentially growing sign-flipping oscillations.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "data-types-histograms-eda" && (
        <div className="space-y-8">
          {/* Plain-English Story & Data Type Map */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
              FIRST-TIMER GUIDE • BEFORE YOU TOUCH A FORMULA, LOOK AT THE DATA
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Why Lists of Numbers Lie to Our Eyes—and How Histograms Reveal the Story
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              Imagine a teacher hands you 35 commute times in minutes:{" "}
              <code>14, 41, 12, 39, 16, 43, ...</code>. Staring at a spreadsheet column, your brain
              can barely tell whether everyone lives 25 minutes away or nobody does! In reality,
              maybe half the class bikes 14 minutes while the other half rides a 41-minute highway bus.
              <strong> Exploratory Data Analysis (EDA)</strong> solves this by sorting numbers into
              buckets (bins) and stacking bars so the invisible <em>shape</em> of the crowd jumps right off the page.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. NOMINAL (LABELS)
                </span>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  Pure categories with no order: blood types (<code>A, B, O</code>) or bus routes. Use bar charts, never histograms.
                </p>
              </div>
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. ORDINAL (RANKED)
                </span>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  Ordered labels with uneven gaps: star ratings (<code>1★–5★</code>) or shirt sizes (<code>S, M, L</code>).
                </p>
              </div>
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  3. DISCRETE (COUNTS)
                </span>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  Countable whole steps with gaps between them: number of defects, coin heads, or siblings (<code>0, 1, 2, ...</code>).
                </p>
              </div>
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  4. CONTINUOUS (MEASURED)
                </span>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  Smooth values along a ruler: height, voltage, latency (<code>12.47 ms</code>). Histograms and density curves shine here!
                </p>
              </div>
            </div>
          </section>

          <DynamicLabRenderer name="HistogramBinningShapeLab" />

          {/* Why Does This Formula Work? + Tiny Worked Example */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Why Does Density Scaling Divide by Both <KaTeXMath math="n" /> and <KaTeXMath math="\Delta x" />?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. AREA = PROBABILITY SHARE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\text{Height}_j = \frac{n_j}{n \cdot \Delta x} \implies \text{Area}_j = \text{Height}_j \cdot \Delta x = \frac{n_j}{n}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  If you double bin width <KaTeXMath math="\Delta x" />, each bin catches roughly twice as many points.
                  Dividing height by <KaTeXMath math="\Delta x" /> cancels that stretch so the histogram&apos;s total area
                  always equals <code>1.000</code>—matching smooth probability curves!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. KERNEL DENSITY (KDE) SMOOTHING
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\hat{f}_h(x) = \frac{1}{n h}\sum_{i=1}^n K\!\left(\frac{x - x_i}{h}\right)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Think of placing a tiny soft sandpile (Gaussian bell of width <KaTeXMath math="h" />) at every single
                  observed dot <KaTeXMath math="x_i" />, then summing all sandpiles together. Unlike rigid bins, KDE never
                  depends on where bin edges happen to start.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-grid)] block">
                  3. TINY WORKED MICRO-EXAMPLE
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Suppose <KaTeXMath math="n = 10" /> quiz scores fall into bin <code>[60, 70)</code> with width{" "}
                  <KaTeXMath math="\Delta x = 10" /> and count <KaTeXMath math="n_j = 3" />:
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\text{Density} = \frac{3}{10 \times 10} = 0.03, \quad \text{Area} = 0.03 \times 10 = 30\%"
                    block
                  />
                </div>
              </div>
            </div>

            {/* Common Beginner Traps */}
            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  TRAP 1 • CHERRY-PICKING BIN WIDTHS
                </span>
                <p>
                  Try setting <strong>Bin Count k = 3</strong> on the <em>Commute Times</em> preset above: the two distinct
                  14-min and 41-min groups merge into one flat plateau! Conversely, setting <strong>k = 24</strong> creates
                  artificial empty gaps. Always inspect multiple bin widths or overlay a KDE + rug plot.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  TRAP 2 • BAR CHARTS VS. HISTOGRAMS
                </span>
                <p>
                  Bar charts plot <em>categories</em> with gaps between bars (order can often be swapped). Histograms plot
                  <em>continuous intervals</em> touching edge-to-edge with zero gaps—unless a bin genuinely holds zero data!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "central-tendency-mean-median-mode" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
              FIRST-TIMER GUIDE • WHAT DOES &ldquo;TYPICAL&rdquo; ACTUALLY MEAN?
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              The Billionaire in the Coffee Shop: Mean vs. Median vs. Mode
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              Picture 11 students sitting in a café, each with roughly \$5,000 in savings. Both their{" "}
              <strong>Mean</strong> and <strong>Median</strong> savings sit around \$5,500. Now imagine one billionaire
              walks through the door. Nobody else&apos;s bank account changed by a single cent—yet the{" "}
              <strong>arithmetic mean</strong> skyrockets, while the <strong>median</strong> (the person standing in the exact
              middle of the line) barely moves one spot! In the interactive seesaw below, the Mean is literally a{" "}
              <em>center-of-mass pivot</em> where distance from the pivot multiplies a point&apos;s pull.
            </p>
          </section>

          <DynamicLabRenderer name="MeanMedianSeesawLab" />

          {/* Why Does This Formula Work? + Tiny Worked Example */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Why Squaring Errors Gives Outliers Quadratic Power
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. THE MEAN BALANCES TORQUE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\sum_{i=1}^n (x_i - \bar{x}) = 0 \iff \bar{x} = \frac{1}{n}\sum_{i=1}^n x_i"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Just like a seesaw balances when left-side torque equals right-side torque, a single point 10 units to the
                  right pulls as hard as ten points 1 unit to the left. That is also the exact bottom of the smooth{" "}
                  <KaTeXMath math="L_2(c) = \sum (x_i - c)^2" /> parabola!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-grid)] block">
                  2. THE MEDIAN ONLY COUNTS SIDES
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\frac{d}{dc}\sum_{i=1}^n |x_i - c| = (\#\text{left}) - (\#\text{right}) = 0"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  In <KaTeXMath math="L_1(c)" /> absolute loss, moving a point from <code>15</code> to{" "}
                  <code>10,000</code> doesn&apos;t change its pull on the slope—it still counts as just <em>one vote</em> on
                  the right! That makes the Median immune to extreme outliers (50% breakdown point).
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  3. TINY WORKED MICRO-EXAMPLE
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Take 5 numbers: <code>2, 4, 5, 5, 24</code>.
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\bar{x} = \frac{2+4+5+5+24}{5} = 8, \quad \text{Med} = 5, \quad \text{Mode} = 5"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  One outlier (<code>24</code>) pushed Mean above <strong>4 of the 5 numbers</strong>!
                </p>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  SKEWNESS COMPASS • MEAN VS. MEDIAN
                </span>
                <p>
                  Because the Mean chases tails harder than the Median: <strong>Right-skewed</strong> data gives{" "}
                  <KaTeXMath math="\text{Mean} > \text{Median}" />; <strong>Left-skewed</strong> data gives{" "}
                  <KaTeXMath math="\text{Mean} < \text{Median}" />; symmetric unimodal data keeps{" "}
                  <KaTeXMath math="\text{Mean} \approx \text{Median}" />.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  THE BIMODAL TRAP • &ldquo;AVERAGE&rdquo; IN AN EMPTY VALLEY
                </span>
                <p>
                  Select the <strong>Two-Peak Split</strong> preset above: both Mean and Median land around <code>11</code>,
                  where <em>not a single observation exists</em>! Never report a center without checking the distribution shape first.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "dispersion-variance-iqr-boxplots" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
              FIRST-TIMER GUIDE • WHY CENTER ALONE CAN BE DEADLY
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              The River That Averages 3 Feet Deep: Spread, Deviation Squares &amp; Why (n − 1)
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              An old statistics joke warns: <em>never try to wade across a river whose average depth is 3 feet</em>—it
              might be 1 foot at the edges and 12 feet in the middle! Center tells you where the middle sits;{" "}
              <strong>dispersion (spread)</strong> tells you how wildly individual points wander around that middle.
              Below, you can literally <em>see</em> variance as the average area of geometric squares built on each
              point&apos;s distance from <KaTeXMath math="\bar{x}" />, compare it to outlier-proof{" "}
              <strong>IQR boxplots</strong>, and run a live simulation proving why sample variance divides by{" "}
              <code>n − 1</code> instead of <code>n</code>.
            </p>
          </section>

          <DynamicLabRenderer name="SpreadBoxplotBesselLab" />

          {/* Why Does This Formula Work? + Tiny Worked Example */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Three Beginner Questions Answered From First Principles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. WHY SQUARE DEVIATIONS?
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\sum (x_i - \bar{x}) = 0 \;\text{always!}\quad s = \sqrt{\frac{\sum(x_i-\bar{x})^2}{n-1}}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Averaging plain signed deviations gives zero every single time because positives cancel negatives.
                  Squaring makes every area positive, stays smooth for calculus, and taking <KaTeXMath math="\sqrt{\,\cdot\,}" />{" "}
                  brings units right back from squared meters to meters!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. WHY DIVIDE BY (n − 1)?
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\sum_{i=1}^n (x_i - \bar{x})^2 = \sum_{i=1}^n (x_i - \mu)^2 - n(\bar{x} - \mu)^2"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  When true <KaTeXMath math="\mu" /> is unknown, we plug in sample <KaTeXMath math="\bar{x}" />—which
                  is fitted to minimize squared distance to <em>its own sample</em>! That shrinks the sum by{" "}
                  <KaTeXMath math="n(\bar{x}-\mu)^2" /> (worth <KaTeXMath math="\sigma^2" /> on average), leaving only{" "}
                  <KaTeXMath math="(n-1)\sigma^2" />. Dividing by <KaTeXMath math="n-1" /> restores exact unbiasedness!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-grid)] block">
                  3. TINY WORKED MICRO-EXAMPLE
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Data: <code>2, 4, 6</code> (<KaTeXMath math="n = 3, \;\bar{x} = 4" />):
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="s^2 = \frac{(2-4)^2 + (4-4)^2 + (6-4)^2}{3 - 1} = \frac{4 + 0 + 4}{2} = 4,\; s = 2"
                    block
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  ROBUST PAIRINGS • MATCH YOUR CENTER TO YOUR SPREAD
                </span>
                <p>
                  Pair <strong>Mean + Standard Deviation</strong> for roughly symmetric, outlier-free data. Pair{" "}
                  <strong>Median + IQR (<KaTeXMath math="Q_3 - Q_1" />)</strong> for skewed incomes, latencies, or datasets
                  with extreme outliers beyond the <KaTeXMath math="1.5\times\text{IQR}" /> Tukey fences.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  WHAT EXCESS KURTOSIS (<KaTeXMath math="\gamma_2" />) WARNS ABOUT
                </span>
                <p>
                  While skewness (<KaTeXMath math="\gamma_1" />) measures asymmetry, <strong>excess kurtosis</strong>{" "}
                  measures tail heaviness relative to a Normal bell (<KaTeXMath math="\gamma_2 = 0" />). Positive{" "}
                  <KaTeXMath math="\gamma_2 \gg 0" /> warns of rare, extreme black-swan spikes!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "sample-spaces-venn-axioms" && (
        <div className="space-y-8">
          {/* Plain-English Story & Kolmogorov's 3 Rules */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
              FIRST-TIMER GUIDE • PROBABILITY IS JUST NORMALIZED AREA
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Throwing Darts at the Universe: Outcomes, Events &amp; Kolmogorov&apos;s Three Rules
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              Forget scary symbols for a second. Imagine a flat square tabletop{" "}
              <KaTeXMath math="\Omega" /> (<strong>the Sample Space</strong>) whose total surface area is
              exactly <code>1.000</code>. Every single pinpoint dot on the board is one{" "}
              <strong>Outcome</strong>, and any painted shape <KaTeXMath math="A" /> on the board is an{" "}
              <strong>Event</strong>. The probability <KaTeXMath math="P(A)" /> is simply the painted{" "}
              <em>area</em> of shape <KaTeXMath math="A" />! Almost every law of probability—even{" "}
              <em>&ldquo;not A&rdquo;</em> and <em>&ldquo;A or B&rdquo;</em>—comes straight from
              measuring overlapping shapes on this <code>1×1</code> tabletop.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  AXIOM 1 • NON-NEGATIVITY
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs">
                  <KaTeXMath math="P(A) \ge 0" block />
                </div>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  No painted shape can ever have negative area. Impossible events have area{" "}
                  <code>0</code>.
                </p>
              </div>
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  AXIOM 2 • NORMALIZATION
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs">
                  <KaTeXMath math="P(\Omega) = 1" block />
                </div>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  Something in the sample space is guaranteed to happen, so the whole tabletop equals{" "}
                  <code>100% = 1</code>.
                </p>
              </div>
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  AXIOM 3 • DISJOINT ADDITIVITY
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs">
                  <KaTeXMath math="A \cap B = \emptyset \implies P(A \cup B) = P(A) + P(B)" block />
                </div>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  When two painted shapes do not overlap at all, their combined area is just their sum!
                </p>
              </div>
            </div>
          </section>

          <DynamicLabRenderer name="VennProbabilityAreaLab" />

          {/* Why Inclusion-Exclusion, De Morgan, and Worked Example */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Preventing Double-Counting &amp; Breaking the #1 Beginner Trap
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. INCLUSION–EXCLUSION EXPLAINED
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="P(A \cup B) = P(A) + P(B) - P(A \cap B)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  If you paint shape <KaTeXMath math="A" /> and then paint shape <KaTeXMath math="B" />, the
                  overlapping middle lens <KaTeXMath math="A \cap B" /> got <em>two coats of paint</em>!
                  Subtracting <KaTeXMath math="P(A \cap B)" /> once gives the exact true union area.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-grid)] block">
                  2. DE MORGAN&apos;S FLIP LAWS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="(A \cup B)^c = A^c \cap B^c, \quad (A \cap B)^c = A^c \cup B^c"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  &ldquo;Neither rain nor wind&rdquo; is the exact same event as &ldquo;not rain{" "}
                  <strong>AND</strong> not wind&rdquo;—and makes finding{" "}
                  <KaTeXMath math="\text{at least one} = 1 - P(\text{none})" /> effortless!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  3. TINY WORKED DICE EXAMPLE
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Roll 1 fair die (<KaTeXMath math="\{1,2,3,4,5,6\}" />). Let{" "}
                  <KaTeXMath math="A = \{2,4,6\}" /> (Even, <KaTeXMath math="3/6" />) and{" "}
                  <KaTeXMath math="B = \{5,6\}" /> (<KaTeXMath math=">4" />, <KaTeXMath math="2/6" />):
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="P(A \cup B) = \frac{3}{6} + \frac{2}{6} - \frac{1}{6} = \frac{4}{6} = \frac{2}{3}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Check independence: <KaTeXMath math="P(A)P(B) = \frac{1}{2}\cdot\frac{1}{3} = \frac{1}{6} = P(A\cap B)" />!
                  On a die, Even and <KaTeXMath math=">4" /> happen to be independent!
                </p>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  TRAP 1 • DISJOINT ≠ INDEPENDENT!
                </span>
                <p>
                  Many beginners think &ldquo;no overlap&rdquo; sounds &ldquo;independent.&rdquo; Click the{" "}
                  <strong>Mutually Exclusive (Disjoint)</strong> preset above and look at the Unit Square: when{" "}
                  <KaTeXMath math="A" /> and <KaTeXMath math="B" /> cannot happen together, knowing{" "}
                  <KaTeXMath math="A" /> happened drops <KaTeXMath math="P(B)" /> instantly to <code>0%</code>!
                  True independence means the vertical share of <KaTeXMath math="B" /> is identical inside{" "}
                  <KaTeXMath math="A" /> and <KaTeXMath math="A^c" />.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  BRIDGE TO S.2.2 • ZOOMING IN ON CONDITIONING
                </span>
                <p>
                  Look at that horizontal line <KaTeXMath math="P(B \mid A)" /> on the Unit Square. What happens
                  when new evidence arrives and we throw away <KaTeXMath math="A^c" />? Chapter{" "}
                  <strong>S.2.2</strong> turns that slice-and-zoom into <strong>Bayes&apos; Theorem</strong>.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "conditional-probability-bayes-theorem" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-lower)] block">
              FIRST-TIMER GUIDE • CONDITIONING SHRINKS THE UNIVERSE
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Why 95% Test Accuracy Still Gives Only a 16% Chance: Bayes&apos; Theorem From First Principles
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              Suppose a rare condition affects only <strong>1%</strong> of people, and a screening test
              correctly spots <strong>95%</strong> of sick people (with a <strong>5%</strong> false-positive
              rate on healthy people). You test positive! How worried should you be? Most people guess{" "}
              <em>95%</em>—yet the true answer is only <strong>16.1%</strong>! Why? Because there are so many
              more healthy people than sick people that even a tiny 5% false alarm produces roughly{" "}
              <strong>50 healthy positives</strong> alongside only <strong>10 true positives</strong>.
              Click <strong>Zoom Into Evidence E⁺</strong> in the 1,000-person grid below to see conditioning
              literally erase everyone who tested negative!
            </p>
          </section>

          <DynamicLabRenderer name="BayesMosaicTreeLab" />

          {/* Derivation, Tiny Worked Example & Traps */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Where Bayes&apos; Formula Comes From (One Line of Logic)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  1. CONDITIONING = NEW DENOMINATOR
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="P(H \mid E) = \frac{P(H \cap E)}{P(E)}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Read <KaTeXMath math="H \mid E" /> as &ldquo;Hypothesis <KaTeXMath math="H" />,{" "}
                  <em>given</em> we already know Evidence <KaTeXMath math="E" /> happened.&rdquo; We throw out
                  all non-<KaTeXMath math="E" /> outcomes and divide the remaining{" "}
                  <KaTeXMath math="H \cap E" /> slice by the new shrunk universe <KaTeXMath math="P(E)" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. FLIPPING BOTH WAYS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="P(H \mid E) = \frac{P(E \mid H)P(H)}{P(E \mid H)P(H) + P(E \mid H^c)P(H^c)}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Since <KaTeXMath math="P(H \cap E) = P(E \mid H)P(H)" />, Bayes simply splits all ways
                  evidence <KaTeXMath math="E" /> can happen into two tree branches: True Positives plus False
                  Positives (the Law of Total Probability).
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. TINY 1,000-PERSON CALCULATION
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Out of <code>1,000</code> people at <code>1%</code> prevalence:
                </p>
                <ul className="text-xs font-tabular-mono text-[var(--text-secondary)] space-y-0.5 pl-3 list-disc">
                  <li>10 sick → 9.5 test E⁺ (TP)</li>
                  <li>990 healthy → 49.5 test E⁺ (FP)</li>
                  <li>Total E⁺ = 9.5 + 49.5 = 59.0</li>
                </ul>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="P(\text{Sick} \mid +) = \frac{9.5}{59.0} \approx 16.1\%"
                    block
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  TRAP • CONFUSING P(E | H) WITH P(H | E)
                </span>
                <p>
                  This mistake is so dangerous in courtrooms it is called the{" "}
                  <strong>Prosecutor&apos;s Fallacy</strong>: &ldquo;Probability of a random DNA match if innocent
                  = 0.5%&rdquo; is <KaTeXMath math="P(E \mid H^c)" />, NOT &ldquo;chance the defendant is
                  innocent given a DNA match&rdquo; <KaTeXMath math="P(H^c \mid E)" />! Always pause and draw the
                  1,000-person tree first.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  SEQUENTIAL LEARNING • POSTERIOR BECOMES NEXT PRIOR
                </span>
                <p>
                  Click <strong>+ Apply 2nd Independent Positive Test</strong> above: your updated{" "}
                  <code>16.1%</code> becomes the brand-new Prior, and a second positive leaps to{" "}
                  <code>~78.4%</code>! Updating beliefs continuously as data arrives is the heartbeat of modern
                  Bayesian AI.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "discrete-distributions-binomial-poisson" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
              FIRST-TIMER GUIDE • FROM MESSY STORIES TO NUMBERED BARS
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              What Is a Random Variable? Four Discrete Laws That Power Counting &amp; Arrivals
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              A <strong>Random Variable</strong> <KaTeXMath math="X" /> is just a translator turning messy
              real-world outcomes (<code>H, T, H, H</code>) into clean numbers you can average (<code>3 heads</code>).
              Drop balls through the <strong>Galton Pegboard</strong> below: at every brass peg, a bead bounces
              right with chance <KaTeXMath math="p" /> or left with chance <KaTeXMath math="1-p" />. Watching
              beads pile up turns abstract factorial formulas into living geometry!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. BERNOULLI(p)
                </span>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  One single yes/no coin flip (<KaTeXMath math="X \in \{0, 1\}" />). Example: does one user
                  click the button?
                </p>
              </div>
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  2. BINOMIAL(n, p)
                </span>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  Total successes out of <KaTeXMath math="n" /> independent Bernoulli flips. Example: defective
                  chips in a batch of 20.
                </p>
              </div>
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  3. GEOMETRIC(p)
                </span>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  How many trials until your <strong>first</strong> success (<KaTeXMath math="k = 1, 2, 3, \dots" />).
                  Memoryless!
                </p>
              </div>
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  4. POISSON(λ)
                </span>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  Number of rare, independent arrivals in a fixed window (emails per minute, photons per second).
                </p>
              </div>
            </div>
          </section>

          <DynamicLabRenderer name="GaltonBoardDiscreteLab" />

          {/* Symbol Breakdown, Worked Example & Traps */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Why Binomial Counts Paths &amp; Morphs Into Poisson
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. PASCAL&apos;S PATH MULTIPLIER
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="P(X=k) = \underbrace{\binom{n}{k}}_{\text{\# paths}} \cdot \underbrace{p^k(1-p)^{n-k}}_{\text{prob per path}}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  To land in bin <KaTeXMath math="k" /> on the Galton board, a bead must bounce right{" "}
                  <KaTeXMath math="k" /> times and left <KaTeXMath math="n-k" /> times. Every specific path
                  has probability <KaTeXMath math="p^k(1-p)^{n-k}" />, and there are{" "}
                  <KaTeXMath math="\binom{n}{k}" /> routes!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. LAW OF RARE EVENTS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\lim_{n\to\infty,\, np=\lambda} \binom{n}{k}p^k(1-p)^{n-k} = \frac{\lambda^k e^{-\lambda}}{k!}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Try clicking <strong>Rare-Event Limit (30, 0.06)</strong> above! Slice one minute into
                  millions of millisecond coin flips with tiny click chance <KaTeXMath math="p=\lambda/n" />,
                  and the Binomial pins snap right onto the Poisson diamonds.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. TINY WORKED EXAMPLE
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Suppose an API sees <KaTeXMath math="\lambda = 2" /> timeouts per hour. Chance of{" "}
                  <KaTeXMath math="0" /> or <KaTeXMath math="1" /> timeout next hour:
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="P(X=0) = e^{-2} \approx 0.135, \quad P(X=1) = 2e^{-2} \approx 0.271"
                    block
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  TRAP 1 • STEP-CDF OPEN VS. CLOSED CIRCLES
                </span>
                <p>
                  Switch the chart to <strong>Step-CDF P(X ≤ x)</strong>: notice how every bar turns into a flat
                  staircase! The solid dot marks <KaTeXMath math="F(k)" /> (including <KaTeXMath math="k" />), while
                  the hollow dot sits below at <KaTeXMath math="F(k-1)" />. The vertical jump height at{" "}
                  <KaTeXMath math="k" /> is literally <KaTeXMath math="P(X=k)" />.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  BRIDGE TO MODULE S.3 • SMOOTH BELL CURVES
                </span>
                <p>
                  Look at the Binomial pins when <KaTeXMath math="n = 16, p = 0.5" />: that symmetric dome is
                  already screaming to become a continuous <strong>Normal Bell Curve</strong>—our starting point
                  in <strong>Module S.3</strong>!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "normal-distribution-z-scores-68-95-997" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
              FIRST-TIMER GUIDE • ONE UNIVERSAL RULER FOR EVERY BELL CURVE
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Comparing Apples, Bolts &amp; Exam Scores: Why Z-Scores Replace Infinity With One Table
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              Imagine you scored <code>130</code> on a test with mean <KaTeXMath math="\mu = 100" /> and spread{" "}
              <KaTeXMath math="\sigma = 15" />, while your friend stands <code>186 cm</code> tall in a class of
              average <code>170 cm</code> (<KaTeXMath math="\sigma = 8" />). Who is more unusual? Subtracting the
              average and dividing by one standard deviation step turns both into the exact same{" "}
              <strong>Standard Score</strong>: <KaTeXMath math="Z = +2.0\sigma" />! On the interactive curves
              below, shifting <KaTeXMath math="\mu" /> slides the upper bell curve while stretching{" "}
              <KaTeXMath math="\sigma" /> flattens it—yet the shaded probability area{" "}
              <KaTeXMath math="\Phi(z_2) - \Phi(z_1)" /> stays glued identically onto{" "}
              <KaTeXMath math="\mathcal{N}(0, 1)" />!
            </p>
          </section>

          <DynamicLabRenderer name="NormalZScoreQQPlotLab" />

          {/* Symbol Breakdown, Worked Example, Q-Q & Traps */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Understanding Standardization, Empirical Bands &amp; Reading Q-Q Bends
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. THE Z-SCORE TRANSLATION
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="Z = \frac{X - \mu}{\sigma} \quad (\text{unitless steps of }\sigma)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  First subtract <KaTeXMath math="\mu" /> (centering the peak at <code>0</code>); then divide by{" "}
                  <KaTeXMath math="\sigma" /> (canceling centimeters, grams, or dollars into pure{" "}
                  <em>&ldquo;standard deviations above average&rdquo;</em>).
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. THE 68–95–99.7 EMPIRICAL RULE
                </span>
                <ul className="text-xs font-tabular-mono text-[var(--text-secondary)] space-y-1">
                  <li>
                    <KaTeXMath math="\mu \pm 1\sigma" /> → <strong>68.27%</strong> of data
                  </li>
                  <li>
                    <KaTeXMath math="\mu \pm 2\sigma" /> → <strong>95.45%</strong> of data
                  </li>
                  <li>
                    <KaTeXMath math="\mu \pm 3\sigma" /> → <strong>99.73%</strong> of data
                  </li>
                </ul>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Anything beyond <KaTeXMath math="|Z| &gt; 3" /> happens under <code>0.3%</code> of the time in a
                  true Gaussian bell!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-grid)] block">
                  3. TINY WORKED EXAMPLE
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Coffee packs average <KaTeXMath math="\mu = 250\text{ g}" /> with{" "}
                  <KaTeXMath math="\sigma = 4\text{ g}" />. A pack weighs <code>242 g</code>:
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="Z = \frac{242 - 250}{4} = -2.0 \implies P(X \le 242) \approx 2.28\%"
                    block
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  TRAP • ASSUMING REAL DATA IS NORMAL WITHOUT CHECKING Q-Q
                </span>
                <p>
                  The 68–95–99.7 rule ONLY holds for bell-shaped Normal distributions! Use the{" "}
                  <strong>Normal Q-Q Plot</strong> above: an <strong>S-curve</strong> warns of fat outlier
                  tails (like stock crashes), while a <strong>U-bend</strong> warns of strong skew (like incomes).
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  BRIDGE TO S.3.2 • WHY BELL CURVES ARE EVERYWHERE ANYWAY
                </span>
                <p>
                  Even when raw data looks wildly skewed or U-shaped, Chapter <strong>S.3.2</strong> reveals the
                  miracle of the <strong>Central Limit Theorem</strong>: their sample averages STILL snap into a
                  Normal bell!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "law-of-large-numbers-central-limit-theorem" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
              FIRST-TIMER GUIDE • THE CROWN JEWEL OF ALL STATISTICS
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Why Skewed Waiting Times Turn Into a Symmetric Bell When Averaged: LLN &amp; CLT
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              Individual customer calls might be horribly right-skewed: most last 2 minutes, a few drag on for 9!
              Now suppose you record the <em>average</em> of <code>n = 25</code> random calls, repeat that
              hundreds of times, and make a histogram of those <strong>sample averages</strong>{" "}
              <KaTeXMath math="\bar{X}" />. Even though the individual calls looked nothing like a bell curve,
              extreme low and high calls inside each batch cancel each other out—causing the averages{" "}
              <KaTeXMath math="\bar{X}" /> to pile symmetrically around true <KaTeXMath math="\mu" /> in a clean{" "}
              <strong>Gaussian Bell Curve</strong>! Select <strong>U-Shaped (Arcsine)</strong> or{" "}
              <strong>Heavily Right-Skewed</strong> below and hit <strong>Simulate +1,000</strong> to watch it happen live!
            </p>

            {/* The 3 Distributions Distinction */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. POPULATION DISTRIBUTION
                </span>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  Shape of ALL individual measurements (<KaTeXMath math="X" />). Can be flat, skewed, U-shaped,
                  or bimodal—increasing <KaTeXMath math="n" /> never changes its parent shape!
                </p>
              </div>
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. ONE SAMPLE OF SIZE n
                </span>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  The <KaTeXMath math="n" /> teal dots drawn right now. It gives us ONE sample mean{" "}
                  <KaTeXMath math="\bar{x}" /> (vertical orange pin).
                </p>
              </div>
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. SAMPLING DISTRIBUTION OF X̄
                </span>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  The histogram of MANY sample means <KaTeXMath math="\bar{X}" /> across repeated surveys.{" "}
                  <strong>THIS</strong> is what turns Normal with spread <KaTeXMath math="\sigma/\sqrt{n}" />!
                </p>
              </div>
            </div>
          </section>

          <DynamicLabRenderer name="CentralLimitTheoremAnimatorLab" />

          {/* Why sqrt(n), LLN vs CLT, and Worked Example */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Why Standard Error Shrinks by <KaTeXMath math="1/\sqrt{n}" /> (Not <KaTeXMath math="1/n" />)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. VARIANCE ADDS, SO SD GROWS AS √n
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\operatorname{Var}\!\left(\frac{1}{n}\sum_{i=1}^n X_i\right) = \frac{n\sigma^2}{n^2} = \frac{\sigma^2}{n} \implies \operatorname{SE} = \frac{\sigma}{\sqrt{n}}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Because independent random draws fluctuate in opposite directions, <em>variances</em> add
                  linearly (<KaTeXMath math="n\sigma^2" />), making the average&apos;s standard error shrink at the
                  square-root rate <KaTeXMath math="\sigma/\sqrt{n}" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  2. LLN VS. CLT IN ONE BREATH
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  <strong>Law of Large Numbers (LLN):</strong> tells you <em>where</em> the running mean goes (it
                  locks onto true <KaTeXMath math="\mu" /> as draws grow).
                  <br />
                  <strong>Central Limit Theorem (CLT):</strong> tells you the <em>bell-curve shape and width</em>{" "}
                  (<KaTeXMath math="\sigma/\sqrt{n}" />) of those sample means at moderate/large{" "}
                  <KaTeXMath math="n" />!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-grid)] block">
                  3. TINY WORKED POLLING EXAMPLE
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Suppose individual daily noise has <KaTeXMath math="\sigma = 10" />. Compare averaging{" "}
                  <code>n = 4</code> vs <code>n = 100</code> measurements:
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\operatorname{SE}(4) = \frac{10}{\sqrt{4}} = 5, \qquad \operatorname{SE}(100) = \frac{10}{\sqrt{100}} = 1"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif">
                  Need <strong>4× more data</strong> just to cut error in half!
                </p>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  TRAP • CLT DOES NOT MAKE INDIVIDUAL RAW DATA NORMAL!
                </span>
                <p>
                  Look at the upper plot above: the parent population stays skewed even at <code>n = 50</code>.
                  Only the <em>averages</em> (lower plot) turn Normal—and if the population has infinite variance
                  (like heavy-tailed Cauchy), even CLT fails!
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  BRIDGE TO S.3.3 • WHEN TRUE σ IS UNKNOWN
                </span>
                <p>
                  Real life never hands us true <KaTeXMath math="\sigma" />—we must plug in noisy sample{" "}
                  <KaTeXMath math="s" />. Chapter <strong>S.3.3</strong> shows how that extra wobble births{" "}
                  <strong>Student&apos;s t</strong>, <KaTeXMath math="\chi^2" />, and <KaTeXMath math="F" />!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "sampling-distributions-student-t-chi2-f" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
              FIRST-TIMER GUIDE • WHERE DO t, χ² &amp; F TABLES COME FROM?
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Building Student&apos;s t, Chi-Square &amp; F Straight Out of Plain Normal Noise
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              In 1908, Guinness brewery chemist William Gosset (pen name <em>&ldquo;Student&rdquo;</em>) tested
              small batches of barley (<KaTeXMath math="n = 4" />). He noticed something crucial: when you
              standardize a sample mean using the <em>sample</em> standard deviation{" "}
              <KaTeXMath math="s" /> instead of the unknown true <KaTeXMath math="\sigma" />, occasionally a
              small batch happens to look suspiciously tight (<KaTeXMath math="s" /> lands way too tiny!), making{" "}
              <KaTeXMath math="(\bar{X}-\mu)/(s/\sqrt{n})" /> blow up far outside normal Z bounds! That accidental
              denominator wobble stretches the Normal bell into heavier tails—creating{" "}
              <strong>Student&apos;s t</strong>, while squaring and dividing those Normal deviations creates{" "}
              <KaTeXMath math="\chi^2" /> and <KaTeXMath math="F" />!
            </p>
          </section>

          <DynamicLabRenderer name="SamplingDistributionsTChi2FLab" />

          {/* Symbol Breakdown, Degrees of Freedom & Traps */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              The Big Three Sampling Families Constructed From <KaTeXMath math="Z_i \sim \mathcal{N}(0, 1)" />
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. STUDENT&apos;S t (MEAN WITH UNKNOWN σ)
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="t_\nu = \frac{\bar{X} - \mu}{S/\sqrt{n}} = \frac{Z}{\sqrt{\chi^2_\nu / \nu}}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Top is standard Normal <KaTeXMath math="Z" />; bottom is noisy sample SD{" "}
                  <KaTeXMath math="S/\sigma = \sqrt{\chi^2_{n-1}/(n-1)}" />. As{" "}
                  <KaTeXMath math="\nu = n-1 \to \infty" />, <KaTeXMath math="S \to \sigma" /> and{" "}
                  <KaTeXMath math="t_\nu" /> merges smoothly into <KaTeXMath math="\mathcal{N}(0,1)" />!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. CHI-SQUARE χ² (SUM OF SQUARES)
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\chi^2_k = \sum_{i=1}^k Z_i^2, \qquad \mathbb{E}[\chi^2_k] = k"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Since every squared error <KaTeXMath math="Z_i^2 \ge 0" />, <KaTeXMath math="\chi^2_k" />{" "}
                  lives strictly on <KaTeXMath math="[0, \infty)" />, leans right, and powers variance intervals
                  and Chi-square goodness-of-fit tests!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  3. FISHER&apos;S F (RATIO OF VARIANCES)
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="F_{d_1, d_2} = \frac{\chi^2_{d_1}/d_1}{\chi^2_{d_2}/d_2} = \frac{S_1^2 / \sigma_1^2}{S_2^2 / \sigma_2^2}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Compares two scaled variance estimates (Signal-to-Noise!). Notice a neat identity: squaring a{" "}
                  <KaTeXMath math="t_\nu" /> statistic gives <KaTeXMath math="t_\nu^2 = F_{1, \nu}" />!
                </p>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  WORKED INTUITION • WHY t HAS FAT TAILS AT ν = 2
                </span>
                <p>
                  Suppose <KaTeXMath math="n = 3" /> (<KaTeXMath math="\nu = 2" />). You happen to draw{" "}
                  <code>10.1, 10.1, 10.2</code> when true <KaTeXMath math="\mu = 8" />: sample{" "}
                  <KaTeXMath math="s \approx 0.058" /> makes <KaTeXMath math="t = (10.13-8)/(0.058/\sqrt{3}) \approx +64" />!
                  Even though Gaussian outliers never hit <KaTeXMath math="64\sigma" />, noisy tiny{" "}
                  <KaTeXMath math="s" /> easily produces huge <KaTeXMath math="t" /> values.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  BRIDGE TO MODULE S.4 • ENTER STATISTICAL INFERENCE!
                </span>
                <p>
                  With Normal, <KaTeXMath math="t" />, <KaTeXMath math="\chi^2" />, and <KaTeXMath math="F" />{" "}
                  sampling distributions unlocked, <strong>Module S.4</strong> flips probability backwards:
                  estimating unknown parameters, building <strong>Confidence Intervals</strong>, and testing
                  hypotheses!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "point-estimation-mle-bias-variance" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
              FIRST-TIMER GUIDE • REASONING BACKWARDS FROM OBSERVED DATA
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Probability Looks Forward; Likelihood Looks Backward: Climbing the MLE Peak
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              In <strong>Probability</strong>, someone hands you a known coin bias (<KaTeXMath math="p = 0.7" />)
              and asks how likely 8 heads in 12 flips are. In real science, it&apos;s backwards: you already
              observed <code>8 heads in 12 flips</code>, and you want to guess the hidden parameter{" "}
              <KaTeXMath math="\theta" />! <strong>Maximum Likelihood Estimation (MLE)</strong> slides every
              candidate bell curve or coin bias over your frozen dots and asks:{" "}
              <em>&ldquo;Which parameter makes the data we actually witnessed look least miraculous?&rdquo;</em>{" "}
              Then check the <strong>Bias–Variance Dartboard</strong> right beside it to discover why
              accepting a tiny bias can sometimes slash your overall prediction error!
            </p>
          </section>

          <DynamicLabRenderer name="MaximumLikelihoodBiasVarianceLab" />

          {/* Symbol Breakdown, Worked Example & Traps */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Why We Maximize Log-Likelihood &amp; How Bias² + Variance Governs Accuracy
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  1. WHY LOGARITHM TURNS PRODUCTS INTO SUMS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\ell(\theta) = \ln \prod_{i=1}^n f(x_i \mid \theta) = \sum_{i=1}^n \ln f(x_i \mid \theta)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Multiplying 1,000 tiny numbers like <code>0.08 × 0.12 × ...</code> underflows computers to
                  zero! Taking <KaTeXMath math="\ln" /> never moves the peak, prevents underflow, and turns hard
                  products into clean sums for derivatives.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. MSE = BIAS² + VARIANCE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\operatorname{MSE}(\hat{\theta}) = \mathbb{E}\!\left[(\hat{\theta}-\theta)^2\right] = \operatorname{Bias}(\hat{\theta})^2 + \operatorname{Var}(\hat{\theta})"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  <strong>Bias</strong> is how far your darts land off bullseye on average;{" "}
                  <strong>Variance</strong> is how wildly scattered they are around their own cluster. Try{" "}
                  <strong>Zero Bias + High Var</strong> vs. <strong>Small Bias + Low Var</strong> above!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  3. TINY BERNOULLI MLE PROOF
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  With <code>k = 8</code> heads in <code>n = 12</code> flips, maximize{" "}
                  <KaTeXMath math="\ell(p) = 8\ln p + 4\ln(1-p)" />:
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\frac{d\ell}{dp} = \frac{8}{p} - \frac{4}{1-p} = 0 \implies \hat{p}_{\text{MLE}} = \frac{8}{12} \approx 0.67"
                    block
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  SUBTLE TRAP • WHY GAUSSIAN MLE VARIANCE IS BIASED (÷ n)
                </span>
                <p>
                  Maximizing Gaussian <KaTeXMath math="\ell(\mu, \sigma)" /> yields{" "}
                  <KaTeXMath math="\hat{\sigma}^2_{\text{MLE}} = \frac{1}{n}\sum (x_i - \bar{x})^2" />—which, as
                  we saw in Bessel&apos;s Correction (<strong>S.1.3</strong>), underestimates true{" "}
                  <KaTeXMath math="\sigma^2" />! MLE is consistent as <KaTeXMath math="n \to \infty" />, not
                  necessarily unbiased at tiny <KaTeXMath math="n" />.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-grid)] block">
                  BRIDGE TO S.4.2 • FROM ONE GUESS TO AN UNCERTAINTY BRACKET
                </span>
                <p>
                  A single point estimate <KaTeXMath math="\hat{\mu} = 5.2" /> never says whether your margin of
                  error is <KaTeXMath math="\pm 0.1" /> or <KaTeXMath math="\pm 4.0" />! Chapter{" "}
                  <strong>S.4.2</strong> wraps point guesses in calibrated <strong>Confidence Intervals</strong>.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "confidence-intervals-coverage" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-grid)] block">
              FIRST-TIMER GUIDE • FIXED TARGET VS. RANDOM NETS
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Throwing 100 Rings at a Stationary Stake: What &ldquo;95% Confidence&rdquo; Truly Means
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              Picture a fixed tent stake hammered into the ground at <KaTeXMath math="\mu = 50" />. You stand
              blindfolded and toss 100 circular hoops (<KaTeXMath math="[\bar{x}_i - \text{ME},\; \bar{x}_i + \text{ME}]" />).
              Once ONE hoop lands on the grass—say <code>[46.2, 54.8]</code>—it either trapped the stake{" "}
              (<strong>100%</strong>) or missed it (<strong>0%</strong>); the stake never hops in or out! What{" "}
              <strong>&ldquo;95% confidence&rdquo;</strong> promises is about the <em>throwing method</em>: in the
              long run, <strong>95 out of every 100 intervals</strong> tossed this way capture fixed{" "}
              <KaTeXMath math="\mu" />!
            </p>
          </section>

          <DynamicLabRenderer name="ConfidenceIntervalCoverageLab" />

          {/* Anatomy, Scaling Law & Traps */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Anatomy of a Confidence Interval &amp; Why Sample Size Must Quadruple
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  1. THE UNIVERSAL 3-PART FORMULA
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\underbrace{\bar{x}}_{\text{Center}} \;\pm\; \underbrace{t_{\alpha/2,\, n-1}}_{\text{Multiplier}} \cdot \underbrace{\frac{s}{\sqrt{n}}}_{\text{SE}}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Higher confidence (95% → 99%) stretches the multiplier wider. Larger{" "}
                  <KaTeXMath math="n" /> shrinks <KaTeXMath math="s/\sqrt{n}" /> narrower!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. QUADRUPLE DATA TO HALVE WIDTH
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\text{ME}(4n) = t^*\frac{s}{\sqrt{4n}} = \frac{1}{2}\text{ME}(n)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Want to cut your poll&apos;s <KaTeXMath math="\pm 4\%" /> error bar in half down to{" "}
                  <KaTeXMath math="\pm 2\%" />? Because of <KaTeXMath math="\sqrt{n}" />, you must interview{" "}
                  <strong>4× as many people</strong>!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  3. TINY WORKED EXAMPLE
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Sample <KaTeXMath math="n = 16" />, <KaTeXMath math="\bar{x} = 52" />,{" "}
                  <KaTeXMath math="s = 8" />, <KaTeXMath math="t_{0.025, 15} = 2.131" />:
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="52 \pm 2.131 \cdot \frac{8}{\sqrt{16}} = 52 \pm 4.26 = [47.74,\, 56.26]"
                    block
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  TRAP • OVER-OPTIMISTIC SMALL-n Z INTERVALS
                </span>
                <p>
                  Try switching the method above to <strong>Naive Z with s (Trap!)</strong> at{" "}
                  <code>n = 4</code>: coverage collapses below <code>90%</code> because <code>1.96</code>{" "}
                  pretends sample <KaTeXMath math="s" /> has zero uncertainty! Always use{" "}
                  <strong>Student&apos;s t</strong> whenever <KaTeXMath math="\sigma" /> is unknown.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  BRIDGE TO S.4.3 • TESTING SHARP HYPOTHESES
                </span>
                <p>
                  Notice a neat duality: if a null value like <KaTeXMath math="\mu_0 = 50" /> falls{" "}
                  <em>outside</em> your 95% CI, a two-tailed hypothesis test at <KaTeXMath math="\alpha = 0.05" />{" "}
                  will reject <KaTeXMath math="H_0" />! Chapter <strong>S.4.3</strong> unpacks{" "}
                  <KaTeXMath math="p" />-values and Power.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "hypothesis-testing-p-values-power" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-diff)] block">
              FIRST-TIMER GUIDE • THE COURTROOM LOGIC OF HYPOTHESIS TESTING
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Presumed Innocent Until Proven Otherwise: Decoding p-Values, Errors (α, β) &amp; Power
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              Null Hypothesis Significance Testing works just like a courtroom trial: start assuming the
              skeptical status quo <strong><KaTeXMath math="H_0" /> (&ldquo;no real effect / innocent&rdquo;)</strong> is
              true. Then compute the <strong><KaTeXMath math="p" />-value</strong>: if{" "}
              <KaTeXMath math="H_0" /> really <em>were</em> true, how bizarre would it be to witness data at least
              as extreme as ours? If <KaTeXMath math="p \le \alpha" /> (typically <code>0.05</code>), the verdict
              crosses beyond reasonable doubt and we reject <KaTeXMath math="H_0" />. Click right along the axis
              below to shade live <KaTeXMath math="p" />-values and see why low sample size hides genuine
              breakthroughs (<KaTeXMath math="\beta" /> Miss Rate)!
            </p>
          </section>

          <DynamicLabRenderer name="HypothesisPowerOverlapLab" />

          {/* Four-quadrant Decision Matrix, Worked Example & Traps */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              The 2×2 Decision Matrix &amp; Stopping the Two Biggest <KaTeXMath math="p" />-Value Myths
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                  1. TYPE I ERROR (α) VS. TYPE II ERROR (β)
                </span>
                <ul className="text-xs font-math-serif text-[var(--text-secondary)] space-y-1.5 leading-relaxed">
                  <li>
                    <strong>Type I Error (<KaTeXMath math="\alpha" />):</strong> Convicting an innocent null
                    (&ldquo;False Alarm&rdquo; when <KaTeXMath math="H_0" /> is true).
                  </li>
                  <li>
                    <strong>Type II Error (<KaTeXMath math="\beta" />):</strong> Letting a real effect walk free
                    (&ldquo;Missed Discovery&rdquo; when <KaTeXMath math="H_1" /> is true).
                  </li>
                  <li>
                    <strong>Power (<KaTeXMath math="1 - \beta" />):</strong> Probability of catching a real
                    effect of size <KaTeXMath math="\delta" />! Target <KaTeXMath math="\ge 80\%" />.
                  </li>
                </ul>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. WHAT p = 0.03 ACTUALLY SAYS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="p = P(\text{extreme data} \mid H_0) \;\neq\; P(H_0 \mid \text{data})"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Remember <strong>Bayes (S.2.2)</strong>! A 3% <KaTeXMath math="p" />-value does NOT mean
                  &ldquo;3% chance the null is true&rdquo;—it assumes the null is true and scores how weird
                  your data looks under that assumption!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. TINY WORKED POWER CHECK
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  With <KaTeXMath math="\sigma = 10" />, <KaTeXMath math="n = 25" /> (<KaTeXMath math="\text{SE}=2" />),
                  two-tailed <KaTeXMath math="\alpha = 0.05" /> sets rejection cutoff at{" "}
                  <KaTeXMath math="1.96 \times 2 = 3.92" />. If true <KaTeXMath math="\delta = 4" />:
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="Z_{\text{pow}} = \frac{3.92 - 4}{2} = -0.04 \implies \text{Power} \approx 51.6\%"
                    block
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  TRAP • STATISTICAL SIGNIFICANCE ≠ PRACTICAL IMPORTANCE
                </span>
                <p>
                  Slide <strong>n = 200</strong> with a tiny <strong>δ = 0.8</strong> (<code>d = 0.08</code>) and
                  click at <code>1.5</code>: you can easily hit <KaTeXMath math="p &lt; 0.05" /> for a trivially
                  useless effect! Always report <strong>Confidence Intervals + Effect Size</strong> alongside{" "}
                  <KaTeXMath math="p" />.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  BRIDGE TO MODULE S.5 • COMPARING MULTIPLE REAL GROUPS
                </span>
                <p>
                  Real A/B experiments rarely test against a fixed textbook <KaTeXMath math="\mu_0" />—they
                  compare Group A vs. Group B, contingency tables, and multi-treatment{" "}
                  <strong>ANOVA</strong> in <strong>Module S.5</strong>!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "two-sample-tests-paired-welch" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
              FIRST-TIMER GUIDE • TWO-GROUP COMPARISONS &amp; EFFECT SIZES
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Why Pairing Cancels Human Noise—And Why Welch&apos;s Test Outsmarts Student&apos;s Equal-Variance t-Test
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              Suppose you test whether a sleep workshop lowers resting heart rate. You measure 12 people{" "}
              <strong>before</strong> and <strong>after</strong>. One runner starts at 48 bpm, while a stressed
              coder starts at 82 bpm—that giant 34-bpm gap between people has nothing to do with your workshop!
              When you <strong>pair</strong> each person with their own baseline (<KaTeXMath math="d_i = \text{After}_i - \text{Before}_i" />),
              every person&apos;s natural baseline subtracts cleanly to zero. On the flip side, if Group A and
              Group B are <em>two completely separate sets of people</em>,{" "}
              <strong>Welch&apos;s independent t-test</strong> safely handles unequal spreads without forcing
              artificial variance pooling.
            </p>
          </section>

          <DynamicLabRenderer name="TwoSamplePairedWelchLab" />

          {/* Symbol Breakdown, Why-It-Works Intuition & Worked Example */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Paired Noise Cancellation, Welch&apos;s Formula &amp; Measuring Practical Impact (Cohen&apos;s d)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. PAIRED VS. UNPAIRED STANDARD ERROR
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="t_{\text{paired}} = \frac{\bar{d}}{s_d / \sqrt{n}}, \quad \text{df} = n - 1"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Because <KaTeXMath math="\text{Var}(X - Y) = \text{Var}(X) + \text{Var}(Y) - 2\,\text{Cov}(X,Y)" />,
                  positive correlation between Before &amp; After shrinks the difference variance dramatically!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  2. WELCH&apos;S UNEQUAL-VARIANCE T-TEST
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="t_{\text{Welch}} = \frac{\bar{x}_2 - \bar{x}_1}{\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Welch&apos;s denominator weights each sample&apos;s own variance by its own sample size, and uses
                  the <strong>Welch–Satterthwaite fractional <KaTeXMath math="\nu" /></strong> so noisy small groups
                  never inflate false positives.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  3. TINY WORKED COHEN&apos;S d EXAMPLE
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  If Group 2 averages <KaTeXMath math="\bar{x}_2 = 54" />, Group 1 averages{" "}
                  <KaTeXMath math="\bar{x}_1 = 50" />, and pooled spread is <KaTeXMath math="s_p = 5" />:
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="d = \frac{54 - 50}{5} = 0.80 \;\text{(Large effect!)}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Unlike <KaTeXMath math="p" />-values, <strong>Cohen&apos;s <KaTeXMath math="d" /></strong> does NOT
                  shrink just by recruiting 10,000 people—it measures how many standard deviations apart the two clouds sit.
                </p>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  TRAP • NEVER POOL UNEQUAL VARIANCES BLINDLY
                </span>
                <p>
                  In <strong>Independent Welch</strong> mode above, set <KaTeXMath math="n_1 = 8, s_1 = 2" /> and{" "}
                  <KaTeXMath math="n_2 = 40, s_2 = 9" />. Student&apos;s equal-variance test over-trusts the big sample
                  and understates uncertainty, whereas Welch adjusts <KaTeXMath math="\nu" /> down safely—make Welch
                  your modern default!
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  BRIDGE TO S.5.2 • WHAT ABOUT YES/NO COUNTS &amp; CATEGORIES?
                </span>
                <p>
                  Both <KaTeXMath math="t" />-tests compare numerical group averages. When your outcomes are{" "}
                  <strong>counts across categories</strong> (&ldquo;recovered vs. didn&apos;t recover&rdquo;, or die rolls),
                  we switch to <strong>Chi-Square (<KaTeXMath math="\chi^2" />)</strong> in <strong>S.5.2</strong>!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "chi-square-goodness-of-fit-independence" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-lower)] block">
              FIRST-TIMER GUIDE • CATEGORICAL COUNTS &amp; CONFOUNDING
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Comparing Real Counts Against a Fair Baseline—And Catching Simpson&apos;s Paradox Red-Handed
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              Imagine rolling a board-game die 120 times and getting thirty 6s instead of the expected twenty. Is the die
              rigged, or just lucky? Karl Pearson&apos;s <strong>Chi-Square (<KaTeXMath math="\chi^2" />)</strong> test
              scores every category by how far <strong>Observed (<KaTeXMath math="O" />)</strong> counts drift from{" "}
              <strong>Expected (<KaTeXMath math="E" />)</strong> counts—measured relative to <KaTeXMath math="E" />.
              Even more eye-opening: in real hospitals or admissions offices, pooling two unequal sub-groups into one{" "}
              <KaTeXMath math="2 \times 2" /> table can completely reverse which option wins—that optical illusion is{" "}
              <strong>Simpson&apos;s Paradox</strong>!
            </p>
          </section>

          <DynamicLabRenderer name="ChiSquareContingencySimpsonLab" />

          {/* Symbol Breakdown, Why-It-Works Intuition & Worked Example */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              The Chi-Square Formula, Expected Independence Counts &amp; Confounding Traps
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  1. PEARSON&apos;S CHI-SQUARE STATISTIC
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\chi^2 = \sum \frac{(O - E)^2}{E}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Why divide by <KaTeXMath math="E" />? Being off by 5 counts out of{" "}
                  <KaTeXMath math="E = 10" /> is huge, whereas being off by 5 counts out of{" "}
                  <KaTeXMath math="E = 1{,}000" /> is tiny! Degrees of freedom are{" "}
                  <KaTeXMath math="(r - 1)(c - 1)" /> for a table or <KaTeXMath math="k - 1" /> for goodness-of-fit.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  2. EXPECTED COUNTS UNDER INDEPENDENCE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="E_{ij} = \frac{\text{Row Total}_i \times \text{Col Total}_j}{N}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  From <strong>S.2.1</strong>, two events are independent when <KaTeXMath math="P(A \cap B) = P(A)P(B)" />.
                  Multiplying by <KaTeXMath math="N" /> gives the exact counts we expect if row &amp; column are unrelated!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  3. TINY WORKED GOODNESS-OF-FIT CHECK
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Toss a coin 100 times (<KaTeXMath math="E = 50" /> Heads, <KaTeXMath math="E = 50" /> Tails) and observe
                  60 Heads, 40 Tails:
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\chi^2 = \frac{(60 - 50)^2}{50} + \frac{(40 - 50)^2}{50} = 2 + 2 = 4.00"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  With <KaTeXMath math="\text{df} = 1" />, <KaTeXMath math="\chi^2 = 4.00 > 3.84" />, giving{" "}
                  <KaTeXMath math="p \approx 0.0455" />!
                </p>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  TRAP 1 &amp; 2 • PERCENTAGES LIE &amp; SIMPSON&apos;S PARADOX
                </span>
                <p>
                  Never feed percentages into <KaTeXMath math="\chi^2" />—always feed <strong>raw counts</strong> (and
                  switch to Fisher&apos;s Exact Test whenever any <KaTeXMath math="E_{ij} &lt; 5" />). Second, always
                  inspect sub-group strata: Treatment A can lose overall only because doctors gave it to harder cases!
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  BRIDGE TO S.5.3 • COMPARING 3+ NUMERICAL GROUPS AT ONCE
                </span>
                <p>
                  Chi-Square compares counts across multiple categories. What if you want to compare{" "}
                  <strong>numerical averages across 3 or 4 treatments simultaneously</strong> without triggering false
                  alarms? Welcome to <strong>One-Way ANOVA</strong> in <strong>S.5.3</strong>!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "one-way-anova-f-test-variance-decomposition" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
              FIRST-TIMER GUIDE • SIGNAL-TO-NOISE ACROSS 3+ GROUPS
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              One-Way ANOVA: Testing Many Group Means by Splitting Total Variation into Signal vs. Noise
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              Wait—why is a test for <strong>means</strong> called <strong>Analysis of Variance (ANOVA)</strong>?
              Imagine 3 study groups taking the same exam. Even if every group learns identically, dots bounce up and down
              inside each group (that&apos;s background <strong>Within-Group Noise</strong>). If the study methods actually
              differ, the group centers pull far apart from the overall average (that&apos;s{" "}
              <strong>Between-Group Signal</strong>). Ronald Fisher realized you can compare all groups in{" "}
              <em>one single shot</em> by taking the ratio <KaTeXMath math="F = \text{Signal Variance} / \text{Noise Variance}" />—dodging
              the false-alarm explosion you&apos;d get from running lots of separate <KaTeXMath math="t" />-tests!
            </p>
          </section>

          <DynamicLabRenderer name="AnovaBetweenWithinLab" />

          {/* Symbol Breakdown, Why-It-Works Intuition & Worked Example */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              The Variance Identity, Mean Squares &amp; Multiple-Comparison Protection
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  1. PYTHAGOREAN VARIANCE SPLIT
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\text{SST} = \text{SSB} + \text{SSW}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Every point&apos;s total distance from the grand mean splits cleanly:{" "}
                  <KaTeXMath math="(y_{gi} - \bar{y}) = (\bar{y}_g - \bar{y}) + (y_{gi} - \bar{y}_g)" />. Squaring and
                  summing cancels the cross-term cleanly to zero!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  2. FISHER&apos;S F-RATIO &amp; η² EFFECT SIZE
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="F = \frac{\text{SSB} / (k - 1)}{\text{SSW} / (N - k)} = \frac{\text{MSB}}{\text{MSW}}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Under <KaTeXMath math="H_0" />, both <KaTeXMath math="\text{MSB}" /> and{" "}
                  <KaTeXMath math="\text{MSW}" /> estimate the exact same <KaTeXMath math="\sigma^2" />, so{" "}
                  <KaTeXMath math="F \approx 1" />. Meanwhile, <KaTeXMath math="\eta^2 = \text{SSB}/\text{SST}" /> tells
                  you what fraction of total score variance the groups explain!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  3. TINY WORKED ANOVA CHECK
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Suppose <KaTeXMath math="k = 3" /> groups (<KaTeXMath math="N = 30" />) give{" "}
                  <KaTeXMath math="\text{SSB} = 180" /> and <KaTeXMath math="\text{SSW} = 540" />:
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="F = \frac{180 / 2}{540 / 27} = \frac{90}{20} = 4.50 \;\;(p \approx 0.020)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  And <KaTeXMath math="\eta^2 = 180 / (180 + 540) = 25\%" /> of total score variation comes from group choice!
                </p>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  TRAP • ANOVA ONLY SAYS &ldquo;AT LEAST ONE DIFFERS&rdquo;
                </span>
                <p>
                  A tiny ANOVA <KaTeXMath math="p" />-value does NOT tell you <em>which</em> pair differs (A vs. B, or C vs.
                  the rest)! Once <KaTeXMath math="F" /> rejects <KaTeXMath math="H_0" />, run <strong>Tukey HSD</strong>{" "}
                  or <strong>Bonferroni (<KaTeXMath math="\alpha/m" />)</strong> post-hoc comparisons to pinpoint the culprit
                  without false alarms.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  BRIDGE TO MODULE S.6 • LINEAR REGRESSION IS CONTINUOUS ANOVA!
                </span>
                <p>
                  Notice <KaTeXMath math="\eta^2 = \text{SSB}/\text{SST}" />? In <strong>Module S.6 (S.6.1)</strong>, when
                  group categories turn into a continuous predictor <KaTeXMath math="x" />,{" "}
                  <KaTeXMath math="\text{SST} = \text{SSR} + \text{SSE}" /> turns straight into{" "}
                  <strong>Ordinary Least Squares Regression &amp; <KaTeXMath math="R^2" /></strong>!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "correlation-ols-linear-regression" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
              FIRST-TIMER GUIDE • LINEAR TREND FITTING &amp; VISUAL DIAGNOSTICS
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Drawing Literal Residual Squares: What Least Squares Minimizes—And Why Anscombe&apos;s Quartet Demands Plotting
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              Every straight line misses data points by a vertical gap called a{" "}
              <strong>residual (<KaTeXMath math="e_i = y_i - \hat{y}_i" />)</strong>. Turn each gap into a
              literal square of area <KaTeXMath math="e_i^2" />: <strong>Ordinary Least Squares (OLS)</strong>{" "}
              picks the unique slope and intercept that make the <em>total inked yellow area</em> as small as
              mathematically possible! Even more astonishingly, load <strong>Anscombe&apos;s Quartet</strong> below:
              four completely different datasets share the <em>exact same</em> mean, slope, <KaTeXMath math="r = 0.816" />,
              and <KaTeXMath math="R^2 = 66.7\%" />—proving why summary statistics never replace looking at residuals.
            </p>
          </section>

          <DynamicLabRenderer name="OLSRegressionAnscombeLab" />

          {/* Symbol Breakdown, Why-It-Works Intuition & Worked Example */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Slope vs. Correlation (<KaTeXMath math="b_1" /> vs. <KaTeXMath math="r" />), Variance Explained (<KaTeXMath math="R^2" />) &amp; Regression Toward the Mean
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. CORRELATION r VS. OLS SLOPE b₁
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="b_1 = r\,\frac{s_y}{s_x}, \qquad b_0 = \bar{y} - b_1\bar{x}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  <strong>Pearson <KaTeXMath math="r \in [-1, 1]" /></strong> is unit-free tightness around a line;
                  multiplying by <KaTeXMath math="s_y / s_x" /> converts SD-units into real <KaTeXMath math="y" />-per-<KaTeXMath math="x" /> units!
                  Notice the line <em>always</em> passes through the centroid <KaTeXMath math="(\bar{x}, \bar{y})" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. PROPORTION OF VARIANCE EXPLAINED (R²)
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="R^2 = 1 - \frac{\text{SSE}}{\text{SST}} = r^2"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Remember <KaTeXMath math="\text{SST} = \text{SSB} + \text{SSW}" /> from ANOVA (<strong>S.5.3</strong>)?
                  In regression, <KaTeXMath math="R^2" /> measures how much of <KaTeXMath math="y" />&apos;s vertical spread
                  your line explains compared to predicting a flat average <KaTeXMath math="\bar{y}" />!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  3. TINY WORKED SLOPE &amp; REGRESSION CHECK
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  If <KaTeXMath math="r = 0.60" />, <KaTeXMath math="s_x = 4" />, <KaTeXMath math="s_y = 10" />, and{" "}
                  <KaTeXMath math="(\bar{x}, \bar{y}) = (10, 50)" />:
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="b_1 = 0.60 \times \frac{10}{4} = 1.50 \implies \hat{y}(14) = 50 + 1.5(4) = 56"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  A parent +2 SDs above average predicts a child only <KaTeXMath math="r \times 2 = +1.2" /> SDs above average—that&apos;s{" "}
                  <strong>Regression Toward the Mean</strong>!
                </p>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  TRAP • CORRELATION ≠ CAUSATION &amp; EXTRAPOLATION
                </span>
                <p>
                  High <KaTeXMath math="r" /> never proves <KaTeXMath math="x" /> causes <KaTeXMath math="y" /> (hidden
                  confounders like season can drive both ice-cream sales and sunburns), and dragging a single{" "}
                  <strong>high-leverage corner outlier</strong> can flip a slope from negative to positive!
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  BRIDGE TO S.6.2 • MULTIPLE PREDICTORS IN 3D &amp; REGULARIZATION
                </span>
                <p>
                  Real systems depend on dozens of predictors (<KaTeXMath math="x_1, x_2, \dots" />). In{" "}
                  <strong>S.6.2</strong>, our OLS line lifts into a <strong>3D Plane</strong>—and we see why correlated
                  features need <strong>Ridge (<KaTeXMath math="L_2" />)</strong> or <strong>Lasso (<KaTeXMath math="L_1" />)</strong>!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "multiple-regression-diagnostics-regularization" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
              FIRST-TIMER GUIDE • 3D PLANES, MULTICOLLINEARITY &amp; REGULARIZATION
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Fitting a 3D Plane to Two Predictors—And Why Lasso&apos;s Diamond Snaps Useless Weights to Exact Zero
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              With two predictors (<KaTeXMath math="x_1, x_2" />), OLS no longer fits a line—it tilts a rigid{" "}
              <strong>3D plane</strong> (<KaTeXMath math="\hat{y} = \beta_0 + \beta_1 x_1 + \beta_2 x_2" />) to minimize
              vertical drop-lines! Trouble strikes when <KaTeXMath math="x_1" /> and <KaTeXMath math="x_2" /> move together
              (<strong>multicollinearity</strong>): OLS gets confused about who deserves credit and explodes into{" "}
              <KaTeXMath math="+50 x_1 - 49 x_2" />, failing badly on new test data. Adding a penalty{" "}
              <KaTeXMath math="\lambda" /> shrinks weights smoothly toward stability—and changing the budget shape from a
              smooth <strong>Ridge Circle</strong> to a pointy <strong>Lasso Diamond</strong> makes ellipses hit a corner
              and kill redundant features!
            </p>
          </section>

          <DynamicLabRenderer name="MultipleRegression3DRegularizationLab" />

          {/* Symbol Breakdown, Why-It-Works Intuition & Worked Example */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Normal Equations Projection, Multicollinearity &amp; Ridge vs. Lasso Geometry
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  1. NORMAL EQUATIONS PROJECTION
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\hat{\boldsymbol{\beta}}_{\text{OLS}} = (X^T X)^{-1} X^T \mathbf{y}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Directly from <strong>Linear Algebra (2.2.3)</strong>: <KaTeXMath math="\hat{\mathbf{y}} = X\hat{\boldsymbol{\beta}}" />{" "}
                  is the orthogonal shadow of <KaTeXMath math="\mathbf{y}" /> onto <KaTeXMath math="\operatorname{Col}(X)" />!
                  When <KaTeXMath math="x_1 \approx x_2" />, <KaTeXMath math="X^T X" /> becomes nearly singular and its inverse explodes.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  2. RIDGE (L₂) VS. LASSO (L₁) CORNERS
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\min_{\boldsymbol{\beta}} \;\|\mathbf{y} - X\boldsymbol{\beta}\|_2^2 + \lambda \|\boldsymbol{\beta}\|_p^p"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  A <strong>Ridge Circle (<KaTeXMath math="p=2" />)</strong> is smoothly round, so ellipses touch off-axis and
                  shrink coefficients evenly without zeroing. A <strong>Lasso Diamond (<KaTeXMath math="p=1" />)</strong> has
                  sharp vertices sitting right on <KaTeXMath math="\beta_1 = 0" /> or <KaTeXMath math="\beta_2 = 0" />—causing
                  automatic sparse feature selection!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  3. TINY WORKED TRAIN VS. TEST CHECK
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Notice in the 3D footer readout: adding noise predictors ALWAYS raises{" "}
                  <strong>Train <KaTeXMath math="R^2" /></strong>, even while <strong>Test CV <KaTeXMath math="R^2" /></strong> drops!
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="R^2_{\text{adj}} = 1 - \frac{\text{SSE}/(n - p - 1)}{\text{SST}/(n - 1)}"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Always tune <KaTeXMath math="\lambda" /> using held-out <strong>Cross-Validation</strong>, never raw
                  training <KaTeXMath math="R^2" />!
                </p>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  TRAP • STANDARDIZE FEATURES BEFORE REGULARIZING!
                </span>
                <p>
                  Never apply <KaTeXMath math="\lambda(\beta_1^2 + \beta_2^2)" /> if <KaTeXMath math="x_1" /> is in{" "}
                  <em>millimeters</em> and <KaTeXMath math="x_2" /> is in <em>kilometers</em>—unit scaling changes{" "}
                  <KaTeXMath math="\beta" /> magnitudes! Convert every predictor to <KaTeXMath math="Z" />-scores first.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  BRIDGE TO S.6.3 • THE BAYESIAN SECRET BEHIND RIDGE!
                </span>
                <p>
                  Cool mathematical plot twist: adding Ridge penalty <KaTeXMath math="\lambda \|\boldsymbol{\beta}\|_2^2" /> is{" "}
                  <em>mathematically identical</em> to placing a zero-centered Gaussian prior{" "}
                  <KaTeXMath math="\boldsymbol{\beta} \sim \mathcal{N}(0, \tau^2 I)" /> in <strong>Bayesian Inference (S.6.3)</strong>!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.slug === "bayesian-updating-bootstrap-mcmc" && (
        <div className="space-y-8">
          {/* Plain-English Story */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
              FIRST-TIMER GUIDE • BAYESIAN BELIEF UPDATING &amp; COMPUTER-AGE RESAMPLING
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Updating Beliefs Continuously With Data—And Measuring Uncertainty Without Any Bell-Curve Formula
            </h2>
            <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
              Classical frequentist statistics treats an unknown conversion rate <KaTeXMath math="p" /> as a fixed
              number and only describes how random samples wobble. <strong>Bayesian inference</strong> treats your
              knowledge about <KaTeXMath math="p" /> as a living probability curve: start with a{" "}
              <strong>Prior (<KaTeXMath math="\operatorname{Beta}(\alpha_0, \beta_0)" />)</strong>, multiply by observed{" "}
              <strong>Likelihood</strong>, and watch the <strong>Posterior</strong> narrow around the truth! Meanwhile, in{" "}
              <strong>Mode B (Efron&apos;s Bootstrap)</strong>, when messy small datasets have wild skew and zero closed-form
              median formula, simply let the computer resample your own sample <em>with replacement</em> 1,000 times!
            </p>
          </section>

          <DynamicLabRenderer name="BayesianUpdatingAndBootstrapLab" />

          {/* Symbol Breakdown, Why-It-Works Intuition & Worked Example */}
          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Conjugate Beta–Binomial Learning, Credible vs. Confidence Intervals &amp; Efron&apos;s Plug-In Principle
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  1. SEQUENTIAL BAYES CONJUGACY
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="\operatorname{Beta}(\alpha_0, \beta_0) \xrightarrow{k \text{ hits in } n} \operatorname{Beta}(\alpha_0 + k,\; \beta_0 + n - k)"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Think of <KaTeXMath math="\alpha_0, \beta_0" /> as &ldquo;virtual prior observations&rdquo;! Starting
                  from <KaTeXMath math="\operatorname{Beta}(4,4)" /> acts like 4 heads + 4 tails of healthy skepticism
                  before observing Trial #1, preventing wild 100% swings on tiny samples.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                  2. CREDIBLE VS. CONFIDENCE INTERVAL
                </span>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="P(L \le p \le U \mid \text{data}) = 95\%"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  A <strong>Bayesian 95% Credible Interval</strong> really <em>does</em> mean &ldquo;95% posterior
                  probability <KaTeXMath math="p" /> lies inside here given my prior &amp; data&rdquo;—matching what
                  humans naturally want a Confidence Interval to mean!
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                  3. BOOTSTRAP PLUG-IN PRINCIPLE
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Can&apos;t sample from the true universe? Treat your observed sample <KaTeXMath math="\hat{F}_n" /> as
                  a mini-universe! Draw <KaTeXMath math="n" /> values <strong>with replacement</strong> 1,000 times:
                </p>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                  <KaTeXMath
                    math="95\%\;\text{Percentile CI} = \bigl[\hat{\theta}^*_{(0.025)},\;\hat{\theta}^*_{(0.975)}\bigr]"
                    block
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
                  Works cleanly for skewed medians, quantiles, correlations, or complex ML predictions!
                </p>
              </div>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-math-serif text-[var(--text-secondary)]">
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                  TRAP • BOOTSTRAP DOES NOT INVENT MISSING DATA
                </span>
                <p>
                  Resampling <KaTeXMath math="10{,}000" /> times measures uncertainty <em>accurately</em>, it does NOT add
                  new information! If your original sample has <KaTeXMath math="n = 4" /> heavily biased points, your
                  bootstrap interval still reflects a biased sample of size 4.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-tabular-mono font-semibold text-[var(--math-ink-lower)] block">
                  CONGRATULATIONS • STATISTICS VOLUME COMPLETE (S.1.1 → S.6.3)!
                </span>
                <p>
                  You&apos;ve bridged exploratory histograms (<strong>S.1</strong>), probability &amp; Bayes (
                  <strong>S.2</strong>), CLT &amp; exact sampling distributions (<strong>S.3</strong>), MLE, CIs &amp;
                  Power (<strong>S.4</strong>), ANOVA &amp; Simpson&apos;s Paradox (<strong>S.5</strong>), all the way to
                  regularized 3D regression, Bayesian updating, and Bootstrap resampling (<strong>S.6</strong>)!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {chapter.status !== "published" && (
        <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
            <div>
              <span
                className="text-xs font-tabular-mono uppercase tracking-wider block"
                style={{
                  color: getAdaptiveAccentInk(chapter.accentHex ?? volume.accentHex),
                }}
              >
                Volume {volume.volumeNumber} • Module {mod.numberLabel} •
                Chapter {chapter.id} Architecture Ready
              </span>
              <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
                Interactive Laboratory Workspace Scheduled for Buildout
              </h2>
            </div>
            <span className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-diff)]">
              Status: {chapter.status.toUpperCase()}
            </span>
          </div>

          <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
            This chapter route (<code>/{volume.slug}/{mod.slug}/{chapter.slug}</code>) is
            registered in the 6-Volume Textbook Taxonomy and wired with its
            governing equations, prerequisite chain, and interactive laboratory
            specifications:{" "}
            {chapter.labs.map((l) => l.componentKey).join(", ")}.
          </p>
        </section>
      )}
    </TopicPageShell>
    </>
  );
}
