import React from "react";
import { TopicPageShell } from "@/components/layout/TopicPageShell";
import { KaTeXMath } from "@/components/math/KaTeXMath";

export default function CoordinateSystemsPage() {
  return (
    <TopicPageShell topicId="coordinate-systems">
      <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div>
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#AAA36D] block">
              Phase 4 Laboratory Workspace • Architecture Ready
            </span>
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Cartesian, Polar, Cylindrical &amp; Spherical Coordinate
              Inspector
            </h2>
          </div>
          <span className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--text-secondary)]">
            Scheduled: Phase 4
          </span>
        </div>

        <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
          This dedicated topic page is wired into the curriculum registry and
          ready for Phase 4 implementation. It will feature interactive 2D Polar
          vs. Cartesian area wedges (<KaTeXMath math="dA = r\,dr\,d\theta" />
          ), 3D intersecting coordinate surfaces (planes, cylinders, cones,
          spheres), local orthonormal basis triads, and the zoomable{" "}
          <KaTeXMath math="dV" /> differential volume element inspector.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
            <span className="text-xs font-tabular-mono text-[#8D9FCE] block">
              CARTESIAN (x, y, z)
            </span>
            <KaTeXMath math="dV = dx\,dy\,dz" block />
          </div>
          <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
            <span className="text-xs font-tabular-mono text-[#96B898] block">
              CYLINDRICAL (r, θ, z)
            </span>
            <KaTeXMath math="dV = r\,dr\,d\theta\,dz" block />
          </div>
          <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
            <span className="text-xs font-tabular-mono text-[#D5658B] block">
              SPHERICAL (ρ, φ, θ)
            </span>
            <KaTeXMath math="dV = \rho^2\sin\phi\,d\rho\,d\phi\,d\theta" block />
          </div>
        </div>
      </section>
    </TopicPageShell>
  );
}
