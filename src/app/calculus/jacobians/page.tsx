import React from "react";
import type { Metadata } from "next";
import { TopicPageShell } from "@/components/layout/TopicPageShell";
import { DynamicLabRenderer } from "@/components/visualizations/DynamicLabRenderer";
import { KaTeXMath } from "@/components/math/KaTeXMath";

export const metadata: Metadata = {
  title: "Jacobian Matrix & Change of Variables (3.2.4)",
  alternates: {
    canonical: "/multivariable-calculus/integral-calculus/jacobians",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function JacobiansPage() {
  return (
    <TopicPageShell topicId="jacobians">
      <div className="space-y-10">
        {/* Lab 1: Dual-Space (u,v) ↔ (x,y) Grid Morphing & Tangent Parallelogram */}
        <DynamicLabRenderer name="DualGridMorphingAndTangentLab" />

        {/* Lab 2: Integral Domain Pullback & 2D/3D Jacobian Matrix Explorer */}
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
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                In single-variable calculus, a small interval <KaTeXMath math="\Delta u" />{" "}
                stretches by the local derivative <KaTeXMath math="|dx/du|" />.
              </p>
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
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                In 2D, the sides of a <KaTeXMath math="du \times dv" /> cell map
                to tangent vectors <KaTeXMath math="\mathbf{r}_u\,du" /> and{" "}
                <KaTeXMath math="\mathbf{r}_v\,dv" /> whose spanned parallelogram
                area equals the <KaTeXMath math="2 \times 2" /> determinant.
              </p>
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
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                In 3D, the three tangent edges span a parallelepiped whose volume
                is the <KaTeXMath math="3 \times 3" /> Jacobian determinant,
                recovering <KaTeXMath math="r" /> in cylindrical and{" "}
                <KaTeXMath math="\rho^2\sin\phi" /> in spherical coordinates.
              </p>
            </div>
          </div>
        </section>
      </div>
    </TopicPageShell>
  );
}
