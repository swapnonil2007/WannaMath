import React from "react";
import { TopicPageShell } from "@/components/layout/TopicPageShell";
import { KaTeXMath } from "@/components/math/KaTeXMath";

export default function TripleIntegralsPage() {
  return (
    <TopicPageShell topicId="triple-integrals">
      <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div>
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#029091] block">
              Phase 3 Laboratory Workspace • Architecture Ready
            </span>
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              3D Bounded Solids, Shadow Projections &amp; All 6 Orders of
              Integration
            </h2>
          </div>
          <span className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--text-secondary)]">
            Scheduled: Phase 3
          </span>
        </div>

        <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
          This dedicated topic page is wired into the curriculum registry and
          ready for Phase 3 implementation. It will house the interactive 3-stage
          collapse scrubber (1D inner ray{" "}
          <KaTeXMath math="\to" /> 2D middle curtain{" "}
          <KaTeXMath math="\to" /> 3D solid <KaTeXMath math="E" />
          ), orthographic shadow projections onto the{" "}
          <KaTeXMath math="xy, yz, xz" /> walls, and the 6-permutation order
          selector.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
          {[
            "dz\\,dy\\,dx",
            "dz\\,dx\\,dy",
            "dy\\,dz\\,dx",
            "dy\\,dx\\,dz",
            "dx\\,dz\\,dy",
            "dx\\,dy\\,dz",
          ].map((perm, idx) => (
            <div
              key={perm}
              className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-center space-y-1"
            >
              <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
                ORDER 0{idx + 1}
              </span>
              <div className="text-sm text-[#029091]">
                <KaTeXMath math={perm} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </TopicPageShell>
  );
}
