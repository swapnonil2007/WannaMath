import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllResolvedChapters, getChapterBySlugs } from "@/registry/index";
import { TopicPageShell } from "@/components/layout/TopicPageShell";
import { KaTeXMath } from "@/components/math/KaTeXMath";

// Volume I — Module 1.1 Live Laboratories (Limits & Continuity)
import { EpsilonDeltaCorridorLab } from "@/components/visualizations/single-variable/EpsilonDeltaCorridorLab";
import { IVTBisectionLab } from "@/components/visualizations/single-variable/IVTBisectionLab";

// Volume I — Module 1.2 Live Laboratories (Differential Calculus & Local Linearity)
import { SecantTangentLab } from "@/components/visualizations/single-variable/SecantTangentLab";
import { NewtonRaphsonLab } from "@/components/visualizations/single-variable/NewtonRaphsonLab";
import { ChainRulePropagatorLab } from "@/components/visualizations/single-variable/ChainRulePropagatorLab";
import { TaylorCurvatureLab } from "@/components/visualizations/single-variable/TaylorCurvatureLab";

// Volume I — Module 1.3 Live Laboratories (Single-Variable Integration & Accumulation)
import { Riemann1DLab } from "@/components/visualizations/single-variable/Riemann1DLab";
import { FTCAccumulationLab } from "@/components/visualizations/single-variable/FTCAccumulationLab";
import { SubstitutionIBPLab } from "@/components/visualizations/single-variable/SubstitutionIBPLab";
import { SolidOfRevolutionLab } from "@/components/visualizations/single-variable/SolidOfRevolutionLab";

// Volume I — Module 1.4 Live Laboratories (Infinite Series & Power Series Convergence)
import { PartialSumSeriesLab } from "@/components/visualizations/single-variable/PartialSumSeriesLab";
import { PowerSeriesConvergenceLab } from "@/components/visualizations/single-variable/PowerSeriesConvergenceLab";

// Module 3.1 Live Laboratories (Differential Calculus)
import { SurfaceContourSlicerLab } from "@/components/visualizations/multivariable-differentiation/SurfaceContourSlicerLab";
import { PartialDerivativeTangentPlaneLab } from "@/components/visualizations/multivariable-differentiation/PartialDerivativeTangentPlaneLab";
import { GradientDirectionalDerivativeLab } from "@/components/visualizations/multivariable-differentiation/GradientDirectionalDerivativeLab";
import { GradientAscentAndLevelSurfaceLab } from "@/components/visualizations/multivariable-differentiation/GradientAscentAndLevelSurfaceLab";
import { LagrangeMultipliersLab } from "@/components/visualizations/multivariable-differentiation/LagrangeMultipliersLab";
import { MultivariableLimitsPathsLab } from "@/components/visualizations/multivariable-differentiation/MultivariableLimitsPathsLab";
import { DifferentiabilityErrorConeLab } from "@/components/visualizations/multivariable-differentiation/DifferentiabilityErrorConeLab";
import { HigherOrderChainImplicitLab } from "@/components/visualizations/multivariable-differentiation/HigherOrderChainImplicitLab";
import { SingleVariableTaylorLab } from "@/components/visualizations/multivariable-differentiation/SingleVariableTaylorLab";
import { MultivariableTaylorHessianLab } from "@/components/visualizations/multivariable-differentiation/MultivariableTaylorHessianLab";
import { HomogeneousScalingRayLab } from "@/components/visualizations/multivariable-differentiation/HomogeneousScalingRayLab";
import { EulersTheoremSecondOrderLab } from "@/components/visualizations/multivariable-differentiation/EulersTheoremSecondOrderLab";
import { HessianSecondDerivativeTestLab } from "@/components/visualizations/multivariable-differentiation/HessianSecondDerivativeTestLab";
import { GeneralMethodDegenerateExtremaLab } from "@/components/visualizations/multivariable-differentiation/GeneralMethodDegenerateExtremaLab";
import { LinearOdeIntegratingFactorLab } from "@/components/visualizations/multivariable-differentiation/LinearOdeIntegratingFactorLab";
import { BernoulliReductionLab } from "@/components/visualizations/multivariable-differentiation/BernoulliReductionLab";
import { WronskianPhaseAreaLab } from "@/components/visualizations/multivariable-differentiation/WronskianPhaseAreaLab";
import { CharacteristicRootsSolutionLab } from "@/components/visualizations/multivariable-differentiation/CharacteristicRootsSolutionLab";
import { OperatorMethodTutorialLab } from "@/components/visualizations/multivariable-differentiation/OperatorMethodTutorialLab";
import { VariationOfParametersCauchyEulerLab } from "@/components/visualizations/multivariable-differentiation/VariationOfParametersCauchyEulerLab";

// Module 3.2 Live Laboratories (Integral Calculus: Multiple Integrals, Convergence & Eulerian Functions)
import { RiemannVolumeLab } from "@/components/visualizations/double-integrals/RiemannVolumeLab";
import { IteratedOrderChangeLab } from "@/components/visualizations/double-integrals/IteratedOrderChangeLab";
import { TripleIntegralOrderLab } from "@/components/visualizations/triple-integrals/TripleIntegralOrderLab";
import { TripleVoxelDensityLab } from "@/components/visualizations/triple-integrals/TripleVoxelDensityLab";
import { PolarCoordinateAreaLab } from "@/components/visualizations/coordinate-systems/PolarCoordinateAreaLab";
import { Curvilinear3DSurfacesAndElementLab } from "@/components/visualizations/coordinate-systems/Curvilinear3DSurfacesAndElementLab";
import { DualGridMorphingAndTangentLab } from "@/components/visualizations/jacobians/DualGridMorphingAndTangentLab";
import { JacobianIntegralPullbackLab } from "@/components/visualizations/jacobians/JacobianIntegralPullbackLab";
import { ImproperIntegralConvergenceLab } from "@/components/visualizations/integral-calculus/ImproperIntegralConvergenceLab";
import { ConvergenceTestsTutorialLab } from "@/components/visualizations/integral-calculus/ConvergenceTestsTutorialLab";
import { GammaFunctionLab } from "@/components/visualizations/integral-calculus/GammaFunctionLab";
import { BetaFunctionLab } from "@/components/visualizations/integral-calculus/BetaFunctionLab";

// Module 3.3 Live Laboratories (Vector Calculus & Integral Theorems)
import { DivCurlProbeLab } from "@/components/visualizations/vector-calculus/DivCurlProbeLab";
import { VectorFieldStreamlineExplorerLab } from "@/components/visualizations/vector-calculus/VectorFieldStreamlineExplorerLab";
import { DivCurlDecompositionLab } from "@/components/visualizations/vector-calculus/DivCurlDecompositionLab";
import { LineIntegralWorkLab } from "@/components/visualizations/vector-calculus/LineIntegralWorkLab";
import { GreensTheoremLab } from "@/components/visualizations/vector-calculus/GreensTheoremLab";
import { SurfaceFluxLab } from "@/components/visualizations/vector-calculus/SurfaceFluxLab";
import { StokesDivergenceLab } from "@/components/visualizations/vector-calculus/StokesDivergenceLab";

// Volume IV — Module 4.1 Live Laboratories (First-Order ODEs & Slope Fields)
import { SlopeFieldTracerLab } from "@/components/visualizations/differential-equations/SlopeFieldTracerLab";
import { AutonomousPhaseLineLab } from "@/components/visualizations/differential-equations/AutonomousPhaseLineLab";

// Volume IV — Module 4.2 Live Laboratories (Second-Order Linear ODEs & Oscillations)
import { HarmonicOscillatorLab } from "@/components/visualizations/differential-equations/HarmonicOscillatorLab";
import { ForcedResonanceLab } from "@/components/visualizations/differential-equations/ForcedResonanceLab";

export function generateStaticParams() {
  return getAllResolvedChapters().map((item) => ({
    volume: item.volume.slug,
    module: item.module.slug,
    chapter: item.chapter.slug,
  }));
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
    <TopicPageShell chapterId={chapter.id}>
      {chapter.slug === "epsilon-delta-limits" && (
        <div className="space-y-10">
          <EpsilonDeltaCorridorLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              Formal Limit Anatomy &amp; Non-Existence Signatures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#029091] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
          <IVTBisectionLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              Continuity Checklist &amp; Discontinuity Taxonomy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#96B898] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#FBEAA4] block">
                  2. REMOVABLE VS. JUMP VS. INFINITE
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-serif">
                  <strong>Removable:</strong> two-sided limit exists cleanly.{" "}
                  <strong>Jump:</strong> finite left/right limits disagree.{" "}
                  <strong>Infinite:</strong> at least one side diverges toward <KaTeXMath math="\pm\infty" />.
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
          <SecantTangentLab />
        </div>
      )}

      {chapter.slug === "local-linearity-differentials" && (
        <div className="space-y-10">
          <NewtonRaphsonLab />
        </div>
      )}

      {chapter.slug === "chain-rule-kinematics" && (
        <div className="space-y-10">
          <ChainRulePropagatorLab />
        </div>
      )}

      {chapter.slug === "taylor-polynomials-curvature" && (
        <div className="space-y-10">
          <TaylorCurvatureLab />
        </div>
      )}

      {chapter.slug === "riemann-sums-1d" && (
        <div className="space-y-10">
          <Riemann1DLab />
        </div>
      )}

      {chapter.slug === "fundamental-theorem-calculus" && (
        <div className="space-y-10">
          <FTCAccumulationLab />
        </div>
      )}

      {chapter.slug === "substitution-integration-by-parts" && (
        <div className="space-y-10">
          <SubstitutionIBPLab />
        </div>
      )}

      {chapter.slug === "solids-of-revolution" && (
        <div className="space-y-10">
          <SolidOfRevolutionLab />
        </div>
      )}

      {chapter.slug === "sequences-partial-sums" && (
        <div className="space-y-10">
          <PartialSumSeriesLab />
        </div>
      )}

      {chapter.slug === "power-series-convergence" && (
        <div className="space-y-10">
          <PowerSeriesConvergenceLab />
        </div>
      )}

      {chapter.slug === "surfaces-level-curves" && (
        <div className="space-y-10">
          <SurfaceContourSlicerLab />
        </div>
      )}

      {chapter.slug === "partial-derivatives-tangent-planes" && (
        <div className="space-y-10">
          <PartialDerivativeTangentPlaneLab />
          <HigherOrderChainImplicitLab />
        </div>
      )}

      {chapter.slug === "gradient-directional-derivatives" && (
        <div className="space-y-10">
          <GradientDirectionalDerivativeLab />
          <GradientAscentAndLevelSurfaceLab />

          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#D35323] block">
                  First-Principles Proofs &amp; Geometric Intuition
                </span>
                <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                  Why the Gradient <KaTeXMath math="\nabla f" /> Governs Directional Slope, Contours &amp; Surface Normals
                </h2>
              </div>
              <Link
                href="/multivariable-calculus/vector-calculus/vector-fields-divergence-curl"
                className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[#029091] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[#029091] transition-colors shrink-0"
              >
                Continue to Vector Fields &amp; Del Quartet (3.3.1) →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#FBEAA4] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
                <span className="font-tabular-mono font-semibold text-[#96B898] block">
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
                <span className="font-tabular-mono font-semibold text-[#D5658B] block">
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
          <LagrangeMultipliersLab />
        </div>
      )}

      {chapter.slug === "limits-and-differentiability" && (
        <div className="space-y-10">
          <MultivariableLimitsPathsLab />
          <DifferentiabilityErrorConeLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              The Implication Chain &amp; Non-Differentiability Pitfalls in ℝ²
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#96B898] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
          <SingleVariableTaylorLab />
          <MultivariableTaylorHessianLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              Taylor Reference: 1D Remainder, 2D Hessian Quadratic Form &amp; Classical Maclaurin Series
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#FBEAA4] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
          <HomogeneousScalingRayLab />
          <EulersTheoremSecondOrderLab />
        </div>
      )}

      {chapter.slug === "maxima-minima-extrema" && (
        <div className="space-y-10">
          <HessianSecondDerivativeTestLab />
          <GeneralMethodDegenerateExtremaLab />
        </div>
      )}

      {chapter.slug === "first-order-lde-bernoulli" && (
        <div className="space-y-10">
          <LinearOdeIntegratingFactorLab />
          <BernoulliReductionLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              First-Order Solution Cookbook: LDE in y, LDE in x, and Bernoulli Reduction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#96B898] block">
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
          <WronskianPhaseAreaLab />
          <CharacteristicRootsSolutionLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              Second-Order Characteristic Root Atlas (<KaTeXMath math="\Delta = b^2 - 4ac" />)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#029091] block">
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
          <OperatorMethodTutorialLab />
          <VariationOfParametersCauchyEulerLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              Particular Integrals &amp; Variable-Coefficient Quick Reference
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#D5658B] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#029091] block">
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
          <RiemannVolumeLab />
          <IteratedOrderChangeLab />
        </div>
      )}

      {chapter.slug === "triple-integrals" && (
        <div className="space-y-10">
          <TripleIntegralOrderLab />
          <TripleVoxelDensityLab />
        </div>
      )}

      {chapter.slug === "coordinate-systems" && (
        <div className="space-y-10">
          <PolarCoordinateAreaLab />
          <Curvilinear3DSurfacesAndElementLab />

          {/* Orthogonal Curvilinear Scale-Factor Reference Sheet */}
          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-5">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#AAA36D] block">
                Orthogonal Curvilinear Reference Sheet
              </span>
              <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                Scale Factors <KaTeXMath math="(h_1, h_2, h_3)" />, Basis Vectors &amp; Volume Elements
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE]">
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
                  <span className="text-xs font-tabular-mono font-semibold text-[#96B898]">
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
                  <span className="text-xs font-tabular-mono font-semibold text-[#D5658B]">
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
          <DualGridMorphingAndTangentLab />
          <JacobianIntegralPullbackLab />

          {/* Geometric Summary: Why the Determinant Appears */}
          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-5">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#D35323] block">
                Unifying Principle Across Multivariable Integration
              </span>
              <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                Why the Jacobian Determinant <KaTeXMath math="\left|\det J\right|" /> Governs Area &amp; Volume Scaling
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#96B898] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#029091] block">
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
          <ImproperIntegralConvergenceLab />
          <ConvergenceTestsTutorialLab />

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
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#96B898] block">
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
          <GammaFunctionLab />
          <BetaFunctionLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
              Eulerian Reduction Toolkit: Turning Hard Integrals into Instant Arithmetic
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#029091] block">
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


      {chapter.slug === "vector-fields-divergence-curl" && (
        <div className="space-y-10">
          <DivCurlProbeLab />
          <VectorFieldStreamlineExplorerLab />
          <DivCurlDecompositionLab />

          {/* Comprehensive Vector Calculus Explanation Guide */}
          <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#029091] block">
                  The Del (∇) Operator Quartet &amp; Coordinate-Free Geometry
                </span>
                <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                  Unifying Gradient, Directional Derivatives, Vector Fields, Divergence &amp; Curl
                </h2>
              </div>
              <Link
                href="/multivariable-calculus/differential-calculus/gradient-directional-derivatives"
                className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[#D35323] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[#D35323] transition-colors shrink-0"
              >
                ← Explore Gradient &amp; Directional Slopes (3.1.3)
              </Link>
            </div>

            {/* 4-Card Del Operator Quartet */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#029091] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#FBEAA4] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#D5658B] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#96B898] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
          <LineIntegralWorkLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Work Integrals vs. Scalar Line Integrals &amp; Path Independence Criterion
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#96B898] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
          <GreensTheoremLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Two Forms of Green&apos;s Theorem: Tangential Circulation vs. Normal 2D Flux
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#96B898] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#029091] block">
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
          <SurfaceFluxLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Parameterizing Oriented Surfaces &amp; Vector Area Elements <KaTeXMath math="d\mathbf{S}" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#029091] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
          <StokesDivergenceLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              The Grand Unification Across Dimensions: FTC → Green → Stokes → Gauss
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#029091] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#FBEAA4] block">
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
          <SlopeFieldTracerLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Direction-Field Geometry, Isoclines &amp; The Picard–Lindelöf Uniqueness Guarantee
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#D5658B] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
          <AutonomousPhaseLineLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              1D Autonomous Stability Classification &amp; Classical Bifurcation Normal Forms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#96B898] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#FBEAA4] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                    className="text-[#8D9FCE] underline"
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
          <HarmonicOscillatorLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Harmonic Regimes: Complex Root Geometry, Mechanical–RLC Analogy &amp; Quality Factor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#8D9FCE] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#96B898] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
          <ForcedResonanceLab />

          <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
            <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
              Phasor Steady State, Acoustic Beats &amp; Resonance Peak Shift
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <span className="text-xs font-tabular-mono font-semibold text-[#FBEAA4] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#D35323] block">
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
                <span className="text-xs font-tabular-mono font-semibold text-[#B95869] block">
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

      {chapter.status !== "published" && (
        <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
            <div>
              <span
                className="text-xs font-tabular-mono uppercase tracking-wider block"
                style={{ color: chapter.accentHex ?? volume.accentHex }}
              >
                Volume {volume.volumeNumber} • Module {mod.numberLabel} •
                Chapter {chapter.id} Architecture Ready
              </span>
              <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
                Interactive Laboratory Workspace Scheduled for Buildout
              </h2>
            </div>
            <span className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[#FBEAA4]">
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
  );
}
