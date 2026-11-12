import React from "react";
import { TopicPageShell } from "@/components/layout/TopicPageShell";
import { PolarCoordinateAreaLab } from "@/components/visualizations/coordinate-systems/PolarCoordinateAreaLab";
import { Curvilinear3DSurfacesAndElementLab } from "@/components/visualizations/coordinate-systems/Curvilinear3DSurfacesAndElementLab";
import { KaTeXMath } from "@/components/math/KaTeXMath";

export default function CoordinateSystemsPage() {
  return (
    <TopicPageShell topicId="coordinate-systems">
      <div className="space-y-10">
        {/* Lab 1: 2D Polar vs Cartesian & Area Element dA = r dr dθ */}
        <PolarCoordinateAreaLab />

        {/* Lab 2: 3D Intersecting Coordinate Surfaces, Local Basis Triads & dV Magnifier */}
        <Curvilinear3DSurfacesAndElementLab />

        {/* Comparative Reference Sheet: Scale Factors & Differential Elements */}
        <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-5">
          <div className="border-b border-[var(--border-subtle)] pb-3">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#AAA36D] block">
              Orthogonal Curvilinear Reference Sheet
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              Scale Factors <KaTeXMath math="(h_1, h_2, h_3)" />, Basis Vectors &amp; Volume Elements
            </h2>
          </div>

          <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
            In any orthogonal curvilinear coordinate system{" "}
            <KaTeXMath math="(q_1, q_2, q_3)" />, an infinitesimal displacement{" "}
            <KaTeXMath math="d\mathbf{r}" /> along coordinate curve{" "}
            <KaTeXMath math="q_i" /> has arc length{" "}
            <KaTeXMath math="ds_i = h_i\,dq_i" />, where{" "}
            <KaTeXMath math="h_i = \left\|\frac{\partial \mathbf{r}}{\partial q_i}\right\|" />{" "}
            is the Lamé scale factor. Because the local unit basis vectors{" "}
            <KaTeXMath math="(\hat{\mathbf{e}}_1, \hat{\mathbf{e}}_2, \hat{\mathbf{e}}_3)" />{" "}
            are mutually perpendicular, the differential volume box has volume{" "}
            <KaTeXMath math="dV = ds_1\,ds_2\,ds_3 = h_1 h_2 h_3\,dq_1\,dq_2\,dq_3" />.
          </p>

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
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Constant coordinate planes; basis vectors{" "}
                <KaTeXMath math="(\hat{\mathbf{i}}, \hat{\mathbf{j}}, \hat{\mathbf{k}})" />{" "}
                remain fixed in direction everywhere in space.
              </p>
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
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Azimuthal arc length stretches proportionally to axial distance{" "}
                <KaTeXMath math="r" />, producing the Jacobian factor{" "}
                <KaTeXMath math="|J| = r" />.
              </p>
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
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Both meridional arc <KaTeXMath math="\rho\,d\phi" /> and latitude
                ring arc <KaTeXMath math="\rho\sin\phi\,d\theta" /> scale with
                radius, yielding <KaTeXMath math="|J| = \rho^2\sin\phi" />.
              </p>
            </div>
          </div>
        </section>
      </div>
    </TopicPageShell>
  );
}
