import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Layers,
  Box,
  Compass,
  Grid,
  GitBranch,
} from "lucide-react";
import { MULTIVARIABLE_CALCULUS_TOPICS } from "@/registry/curriculum";
import { KaTeXMath } from "@/components/math/KaTeXMath";

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  "double-integrals": <Layers className="w-5 h-5" aria-hidden="true" />,
  "triple-integrals": <Box className="w-5 h-5" aria-hidden="true" />,
  "coordinate-systems": <Compass className="w-5 h-5" aria-hidden="true" />,
  jacobians: <Grid className="w-5 h-5" aria-hidden="true" />,
};

export default function CalculusDomainPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
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
          MATH-01: Multivariable &amp; Integral Calculus
        </span>
      </nav>

      {/* Domain Header */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <span className="px-2.5 py-1 border border-[var(--border-strong)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[#8D9FCE] inline-block">
            DOMAIN MATH-01 • 4 DEDICATED TOPIC LABORATORIES
          </span>
          <h1 className="font-math-serif text-4xl sm:text-5xl font-semibold text-[var(--text-primary)] tracking-tight">
            Multivariable &amp; Integral Calculus
          </h1>
          <p className="font-math-serif text-lg text-[var(--text-secondary)] leading-relaxed">
            In single-variable calculus, integration accumulates area over a 1D
            interval <KaTeXMath math="[a,b]" />. In engineering multivariable
            calculus, the domain of integration becomes a 2D planar region{" "}
            <KaTeXMath math="R \subset \mathbb{R}^2" /> or a 3D solid{" "}
            <KaTeXMath math="E \subset \mathbb{R}^3" />—where choosing the
            right integration order, coordinate system, and Jacobian scaling
            determines whether an integral is solvable.
          </p>
        </div>

        {/* Conceptual Synthesis Box */}
        <div className="lg:col-span-5 border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[#FBEAA4]">
            <GitBranch className="w-4 h-4" aria-hidden="true" />
            <span>How the 4 Topics Unify Mathematically</span>
          </div>
          <p className="text-sm font-math-serif text-[var(--text-secondary)] leading-relaxed">
            Every coordinate change in a double or triple integral is a special
            case of the <strong>Jacobian transformation</strong>:
          </p>
          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm">
            <KaTeXMath
              block
              math={`dA = dx\\,dy = \\underbrace{\\left|\\frac{\\partial(x,y)}{\\partial(r,\\theta)}\\right|}_{r}\\,dr\\,d\\theta`}
            />
          </div>
          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm">
            <KaTeXMath
              block
              math={`dV = dx\\,dy\\,dz = \\underbrace{\\left|\\frac{\\partial(x,y,z)}{\\partial(\\rho,\\phi,\\theta)}\\right|}_{\\rho^2\\sin\\phi}\\,d\\rho\\,d\\phi\\,d\\theta`}
            />
          </div>
        </div>
      </section>

      {/* Full Topic Directory */}
      <section className="space-y-6">
        <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-3">
          Dedicated Topic Pages in This Domain
        </h2>

        <div className="space-y-6">
          {MULTIVARIABLE_CALCULUS_TOPICS.map((topic) => (
            <article
              key={topic.id}
              className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-9 h-9 flex items-center justify-center border border-[var(--border-strong)] bg-[var(--bg-canvas)]"
                    style={{ color: topic.accentHex }}
                  >
                    {TOPIC_ICONS[topic.id]}
                  </span>
                  <div>
                    <span className="text-xs font-tabular-mono text-[var(--text-muted)] block">
                      TOPIC {topic.number} • {topic.dimensionBadge}
                    </span>
                    <h3 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                      {topic.title}
                    </h3>
                  </div>
                </div>

                <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
                  {topic.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {topic.subtopics.map((sub, i) => (
                    <div
                      key={sub.id}
                      className="px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] flex items-center gap-2"
                    >
                      <span
                        className="font-tabular-mono font-semibold"
                        style={{ color: topic.accentHex }}
                      >
                        §{topic.number}.{i + 1}
                      </span>
                      <span className="truncate">{sub.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between gap-4 border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)] pt-4 lg:pt-0 lg:pl-6">
                <div className="p-3.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                  <KaTeXMath math={topic.keyFormulaLatex} block />
                </div>

                <Link
                  href={topic.route}
                  className="w-full px-4 py-3 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-sm font-tabular-mono font-medium text-[var(--text-primary)] flex items-center justify-between transition-colors"
                >
                  <span>Launch Topic {topic.number} Laboratory</span>
                  <ArrowRight
                    className="w-4 h-4"
                    style={{ color: topic.accentHex }}
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
