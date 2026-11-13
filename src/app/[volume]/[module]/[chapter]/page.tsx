import React from "react";
import { notFound } from "next/navigation";
import { getAllResolvedChapters, getChapterBySlugs } from "@/registry/index";
import { TopicPageShell } from "@/components/layout/TopicPageShell";
import { KaTeXMath } from "@/components/math/KaTeXMath";

// Module 3.1 Live Laboratories (Differential Calculus)
import { SurfaceContourSlicerLab } from "@/components/visualizations/multivariable-differentiation/SurfaceContourSlicerLab";
import { PartialDerivativeTangentPlaneLab } from "@/components/visualizations/multivariable-differentiation/PartialDerivativeTangentPlaneLab";
import { GradientDirectionalDerivativeLab } from "@/components/visualizations/multivariable-differentiation/GradientDirectionalDerivativeLab";
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
import { LineIntegralWorkLab } from "@/components/visualizations/vector-calculus/LineIntegralWorkLab";
import { GreensTheoremLab } from "@/components/visualizations/vector-calculus/GreensTheoremLab";
import { SurfaceFluxLab } from "@/components/visualizations/vector-calculus/SurfaceFluxLab";
import { StokesDivergenceLab } from "@/components/visualizations/vector-calculus/StokesDivergenceLab";

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
        </div>
      )}

      {chapter.slug === "line-integrals-work" && (
        <div className="space-y-10">
          <LineIntegralWorkLab />
        </div>
      )}

      {chapter.slug === "greens-theorem" && (
        <div className="space-y-10">
          <GreensTheoremLab />
        </div>
      )}

      {chapter.slug === "surface-integrals-flux" && (
        <div className="space-y-10">
          <SurfaceFluxLab />
        </div>
      )}

      {chapter.slug === "stokes-divergence-theorems" && (
        <div className="space-y-10">
          <StokesDivergenceLab />
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
