import React from "react";
import { TopicPageShell } from "@/components/layout/TopicPageShell";
import { KaTeXMath } from "@/components/math/KaTeXMath";

export default function JacobiansPage() {
  return (
    <TopicPageShell topicId="jacobians">
      <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div>
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#D35323] block">
              Phase 5 Laboratory Workspace • Architecture Ready
            </span>
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Dual-Space Grid Morphing, Tangent Parallelograms &amp; Jacobian
              Determinants
            </h2>
          </div>
          <span className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--text-secondary)]">
            Scheduled: Phase 5
          </span>
        </div>

        <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
          This dedicated topic page is wired into the curriculum registry and
          ready for Phase 5 implementation. It will provide side-by-side{" "}
          <KaTeXMath math="(u,v)" /> parameter space and{" "}
          <KaTeXMath math="(x,y)" /> physical space viewports, a continuous
          homotopy morphing slider <KaTeXMath math="t \in [0,1]" />, draggable
          infinitesimal patches with tangent vectors{" "}
          <KaTeXMath math="\mathbf{r}_u\,\Delta u" /> and{" "}
          <KaTeXMath math="\mathbf{r}_v\,\Delta v" />, and an interactive 2D/3D
          Jacobian matrix explorer.
        </p>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
          <KaTeXMath
            block
            math={`dA_{xy} = \\left|\\det \\begin{bmatrix} \\partial x / \\partial u & \\partial x / \\partial v \\\\ \\partial y / \\partial u & \\partial y / \\partial v \\end{bmatrix}\\right| du\\,dv = \\|\\mathbf{r}_u \\times \\mathbf{r}_v\\|\\,du\\,dv`}
          />
        </div>
      </section>
    </TopicPageShell>
  );
}
