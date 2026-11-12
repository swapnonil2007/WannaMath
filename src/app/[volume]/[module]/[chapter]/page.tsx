import React from "react";
import { notFound } from "next/navigation";
import { getAllResolvedChapters, getChapterBySlugs } from "@/registry/index";
import { TopicPageShell } from "@/components/layout/TopicPageShell";
import { KaTeXMath } from "@/components/math/KaTeXMath";

// Existing 8 Live Laboratories (Module 3.2: Multiple Integrals & Coordinate Pullbacks)
import { RiemannVolumeLab } from "@/components/visualizations/double-integrals/RiemannVolumeLab";
import { IteratedOrderChangeLab } from "@/components/visualizations/double-integrals/IteratedOrderChangeLab";
import { TripleIntegralOrderLab } from "@/components/visualizations/triple-integrals/TripleIntegralOrderLab";
import { TripleVoxelDensityLab } from "@/components/visualizations/triple-integrals/TripleVoxelDensityLab";
import { PolarCoordinateAreaLab } from "@/components/visualizations/coordinate-systems/PolarCoordinateAreaLab";
import { Curvilinear3DSurfacesAndElementLab } from "@/components/visualizations/coordinate-systems/Curvilinear3DSurfacesAndElementLab";
import { DualGridMorphingAndTangentLab } from "@/components/visualizations/jacobians/DualGridMorphingAndTangentLab";
import { JacobianIntegralPullbackLab } from "@/components/visualizations/jacobians/JacobianIntegralPullbackLab";

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
