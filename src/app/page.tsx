import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  Compass,
  Grid,
  Layers,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  CURRICULUM_DOMAINS,
  MULTIVARIABLE_CALCULUS_TOPICS,
  SEMANTIC_MATH_PALETTE,
} from "@/registry/curriculum";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { HeroIntegralPreview } from "@/components/visualizations/HeroIntegralPreview";

const TOPIC_ICON_MAP: Record<string, React.ReactNode> = {
  "double-integrals": <Layers className="w-5 h-5" aria-hidden="true" />,
  "triple-integrals": <Box className="w-5 h-5" aria-hidden="true" />,
  "coordinate-systems": <Compass className="w-5 h-5" aria-hidden="true" />,
  jacobians: <Grid className="w-5 h-5" aria-hidden="true" />,
};

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Section */}
      <section className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--border-strong)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[var(--text-secondary)]">
              <Sparkles className="w-3.5 h-3.5 text-[#FBEAA4]" aria-hidden="true" />
              <span>
                wanna math • Engineering Mathematics Visualized in 2D &amp; 3D
              </span>
            </div>

            <h1 className="font-math-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[var(--text-primary)] tracking-tight leading-[1.08]">
              See the geometry behind every integral, coordinate frame, and
              transformation.
            </h1>

            <p className="font-math-serif text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed max-w-3xl">
              Traditional textbooks present multivariable calculus as static
              algebraic bounds. <strong>wanna math</strong> pairs traditional{" "}
              <KaTeXMath math="\TeX" /> typesetting with synchronized 2D domain
              plots and 3D spatial viewports—built for engineering accuracy and
              visual comfort.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              href="/calculus/double-integrals"
              className="px-5 py-3.5 border border-[var(--border-strong)] bg-[#8D9FCE] text-[#1E1F22] font-medium text-sm flex items-center justify-between hover:opacity-95 transition-opacity"
            >
              <span>Start Topic 01: Double Integration</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            <Link
              href="/calculus"
              className="px-5 py-3.5 border border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] font-medium text-sm flex items-center justify-between transition-colors"
            >
              <span>Explore Multivariable Calculus Hub</span>
              <BookOpen className="w-4 h-4 text-[#96B898]" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Interactive 2D/3D Synchronized Preview Widget */}
        <HeroIntegralPreview />
      </section>

      {/* Section 2: v1.0 Core Topic Pages (4 Dedicated Multi-Page Laboratories) */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#96B898] block">
              v1.0 Core Curriculum • Dedicated Topic Pages
            </span>
            <h2 className="font-math-serif text-3xl font-semibold text-[var(--text-primary)] mt-1">
              Multivariable &amp; Integral Calculus Laboratories
            </h2>
          </div>
          <Link
            href="/calculus"
            className="text-sm font-tabular-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5"
          >
            <span>View Full Domain Structure</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MULTIVARIABLE_CALCULUS_TOPICS.map((topic) => (
            <article
              key={topic.id}
              className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-4">
                {/* Top Metadata Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-9 h-9 flex items-center justify-center border border-[var(--border-strong)] bg-[var(--bg-canvas)]"
                      style={{ color: topic.accentHex }}
                    >
                      {TOPIC_ICON_MAP[topic.id]}
                    </span>
                    <div>
                      <span className="text-xs font-tabular-mono text-[var(--text-muted)] block">
                        TOPIC {topic.number} • PHASE {topic.phaseNumber}
                      </span>
                      <span
                        className="text-xs font-tabular-mono font-semibold"
                        style={{ color: topic.accentHex }}
                      >
                        {topic.dimensionBadge}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={topic.route}
                    className="px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono font-medium text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
                  >
                    <span>Open Topic Page</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>

                {/* Title & Summary */}
                <div className="space-y-2">
                  <h3 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                    <Link
                      href={topic.route}
                      className="hover:underline underline-offset-4"
                    >
                      {topic.title}
                    </Link>
                  </h3>
                  <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
                    {topic.summary}
                  </p>
                </div>

                {/* Signature KaTeX Equation Box */}
                <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)]">
                  <KaTeXMath math={topic.keyFormulaLatex} block />
                </div>

                {/* Subtopics List */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
                    Interactive Modules Included:
                  </span>
                  <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                    {topic.subtopics.map((sub, i) => (
                      <li key={sub.id} className="flex items-start gap-2">
                        <span
                          className="font-tabular-mono text-xs mt-0.5"
                          style={{ color: topic.accentHex }}
                        >
                          {topic.number}.{i + 1}
                        </span>
                        <span>{sub.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Engineering Context Footer */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="truncate">{topic.engineeringContext}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section 3: Scalable Multi-Domain Engineering Curriculum */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#AAA36D] block">
              Scalable Multi-Page Architecture
            </span>
            <h2 className="font-math-serif text-3xl font-semibold text-[var(--text-primary)] mt-1">
              Engineering Mathematics Domains
            </h2>
          </div>
          <Link
            href="/roadmap"
            className="text-sm font-tabular-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5"
          >
            <span>Explore Full Development Roadmap</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {CURRICULUM_DOMAINS.map((domain) => {
            const isActive = domain.status === "active";
            return (
              <div
                key={domain.id}
                className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-tabular-mono font-semibold px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                      style={{ color: domain.accentHex }}
                    >
                      {domain.code}
                    </span>
                    <span className="text-xs font-tabular-mono flex items-center gap-1 text-[var(--text-muted)]">
                      {isActive ? (
                        <>
                          <CheckCircle2
                            className="w-3.5 h-3.5 text-[#96B898]"
                            aria-hidden="true"
                          />
                          <span>v1.0 Active</span>
                        </>
                      ) : (
                        <>
                          <Clock
                            className="w-3.5 h-3.5 text-[#AAA36D]"
                            aria-hidden="true"
                          />
                          <span>Planned Module</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
                    {domain.title}
                  </h3>

                  <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
                    {domain.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                  <div className="space-y-1">
                    <span className="text-[11px] font-tabular-mono uppercase text-[var(--text-muted)] block">
                      Engineering Applications:
                    </span>
                    <ul className="text-xs text-[var(--text-secondary)] space-y-0.5">
                      {domain.engineeringApplications.slice(0, 3).map((app) => (
                        <li key={app}>• {app}</li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={domain.route}
                    className="w-full px-3 py-2 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono text-[var(--text-primary)] flex items-center justify-between transition-colors"
                  >
                    <span>
                      {isActive ? "Enter Domain Hub" : "Preview Planned Topics"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Semantic Color-to-Math System */}
      <section
        id="semantic-palette"
        className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 sm:p-8 space-y-6 scroll-mt-20"
      >
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#FBEAA4] block">
            Visual Pedagogical System • Zero Gradients
          </span>
          <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            Semantic Color-to-Math Mapping
          </h2>
          <p className="font-math-serif text-base text-[var(--text-secondary)] leading-relaxed">
            Every color in <strong>wanna math</strong> is drawn from our four
            muted butterfly triads and assigned a strict mathematical role.
            When a boundary curve or differential element appears in a 2D or 3D
            viewport, its exact color is mirrored in the corresponding{" "}
            <KaTeXMath math="\TeX" /> equation limit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SEMANTIC_MATH_PALETTE.map((item) => (
            <div
              key={item.token}
              className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 inline-block border border-[var(--border-strong)]"
                    style={{ backgroundColor: item.hex }}
                    aria-hidden="true"
                  />
                  <span className="font-tabular-mono text-xs font-semibold text-[var(--text-primary)]">
                    {item.hex}
                  </span>
                </div>
                <span className="text-[11px] font-tabular-mono text-[var(--text-muted)]">
                  {item.triad}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-1.5">
                <span className="font-math-serif text-sm font-semibold text-[var(--text-primary)]">
                  {item.name}
                </span>
                <span
                  className="text-xs"
                  style={{ color: item.hex }}
                >
                  <KaTeXMath math={item.symbol} />
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {item.meaning}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
