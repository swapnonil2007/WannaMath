import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  FolderGit2,
  ArrowRight,
} from "lucide-react";
import { CURRICULUM_DOMAINS } from "@/registry/curriculum";
import { KaTeXMath } from "@/components/math/KaTeXMath";

const PHASE_TIMELINE = [
  {
    phase: "Phase 1",
    title: "Foundation, Archive System, Design System & Multi-Page Shell",
    status: "Completed",
    accent: "#96B898",
    details:
      "Next.js + TypeScript + Three.js + KaTeX setup, butterfly palette semantic tokens, traditional serif typography, /archive agent handoff system, and multi-page routing.",
  },
  {
    phase: "Phase 2",
    title: "Topic 01: Double Integration, Limits & Order Change Laboratory",
    status: "Completed",
    accent: "#8D9FCE",
    route: "/calculus/double-integrals",
    details:
      "Full 2D/3D Riemann sum prism convergence, iterated cross-sectional slicing (dy dx vs dx dy), Type I/II boundary curve explorer, and Fubini order-reversal lab.",
  },
  {
    phase: "Phase 3",
    title: "Topic 02: Triple Integration, Shadow Projections & 6 Permutations",
    status: "Next Phase",
    accent: "#029091",
    route: "/calculus/triple-integrals",
    details:
      "3D solid regions E, 1D ray → 2D curtain → 3D solid scrubber, orthographic coordinate-wall shadow projections, and all 6 integration orders.",
  },
  {
    phase: "Phase 4",
    title: "Topic 03: Coordinate Systems Interactive Laboratory",
    status: "Planned",
    accent: "#AAA36D",
    route: "/calculus/coordinate-systems",
    details:
      "2D Polar/Cartesian dA wedge and 3D Cartesian, Cylindrical (r,θ,z), and Spherical (ρ,φ,θ) intersecting coordinate surfaces, basis triads, and zoomable dV element.",
  },
  {
    phase: "Phase 5",
    title: "Topic 04: Jacobians & Change of Variables",
    status: "Planned",
    accent: "#D35323",
    route: "/calculus/jacobians",
    details:
      "Dual (u,v) ↔ (x,y) continuous grid morphing, draggable local patch with tangent vectors ru and rv, 2D/3D Jacobian matrices, and domain pullback solver.",
  },
  {
    phase: "Phase 6",
    title: "Cross-Topic Deep Linking, Performance Optimization & QA",
    status: "Planned",
    accent: "#B95869",
    details:
      "Contextual links uniting polar/spherical integrals with Jacobians and coordinate systems, 60 FPS WebGL tuning, and complete archive handoff documentation.",
  },
];

export default function RoadmapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">
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
          Architecture &amp; Multi-Domain Roadmap
        </span>
      </nav>

      {/* Header */}
      <section className="max-w-3xl space-y-3">
        <span className="px-2.5 py-1 border border-[var(--border-strong)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[#AAA36D] inline-block">
          LIVING ARCHITECTURE PLAN • /archive SYNCED
        </span>
        <h1 className="font-math-serif text-4xl sm:text-5xl font-semibold text-[var(--text-primary)]">
          Phased Engineering &amp; Curriculum Roadmap
        </h1>
        <p className="font-math-serif text-lg text-[var(--text-secondary)] leading-relaxed">
          <strong>wanna math</strong> is built phase-by-phase for maximum
          mathematical accuracy and long-term extensibility across engineering
          disciplines. All architectural state is persisted in{" "}
          <code>/archive</code> and <code>AGENTS.md</code>.
        </p>
      </section>

      {/* v1.0 6-Phase Execution Timeline */}
      <section className="space-y-5">
        <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
          v1.0 Multivariable Calculus — 6-Phase Build Plan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PHASE_TIMELINE.map((item) => (
            <div
              key={item.phase}
              className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-tabular-mono font-semibold px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                    style={{ color: item.accent }}
                  >
                    {item.phase}
                  </span>
                  <span className="text-xs font-tabular-mono text-[var(--text-muted)] flex items-center gap-1">
                    {item.status === "Completed" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#96B898]" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-[#FBEAA4]" />
                    )}
                    <span>{item.status}</span>
                  </span>
                </div>

                <h3 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h3>

                <p className="text-sm font-math-serif text-[var(--text-secondary)] leading-relaxed">
                  {item.details}
                </p>
              </div>

              {item.route && (
                <Link
                  href={item.route}
                  className="px-3 py-2 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono text-[var(--text-primary)] flex items-center justify-between"
                >
                  <span>View Route Shell</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Future Expansion Domains */}
      <section className="space-y-6">
        <div className="border-b border-[var(--border-subtle)] pb-3">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#029091] block">
            Future Expansion Architecture
          </span>
          <h2 className="font-math-serif text-3xl font-semibold text-[var(--text-primary)] mt-1">
            Upcoming Engineering Mathematics Domains
          </h2>
        </div>

        <div className="space-y-6">
          {CURRICULUM_DOMAINS.filter((d) => d.status === "upcoming").map(
            (domain) => (
              <div
                key={domain.id}
                id={domain.id}
                className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-5 scroll-mt-24"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                  <div>
                    <span
                      className="text-xs font-tabular-mono font-semibold"
                      style={{ color: domain.accentHex }}
                    >
                      {domain.code} • FUTURE MODULE
                    </span>
                    <h3 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                      {domain.title}
                    </h3>
                  </div>
                  <span className="text-xs font-tabular-mono px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)]">
                    Registry Ready in src/registry/curriculum.ts
                  </span>
                </div>

                <p className="font-math-serif text-base text-[var(--text-secondary)] max-w-3xl">
                  {domain.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {domain.upcomingTopicsPreview?.map((preview) => (
                    <div
                      key={preview.title}
                      className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <h4 className="font-math-serif text-base font-semibold text-[var(--text-primary)]">
                          {preview.title}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {preview.summary}
                        </p>
                      </div>
                      <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs">
                        <KaTeXMath math={preview.formulaLatex} block />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Agent Archive Notice */}
      <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <FolderGit2
            className="w-6 h-6 text-[#FBEAA4] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Agent Continuity Archive (<code>/archive</code> &amp;{" "}
              <code>AGENTS.md</code>)
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              All architectural plans, phase completion logs, design tokens, and
              topic extension guides are stored in the repository{" "}
              <code>/archive</code> directory for seamless multi-agent handoff.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
