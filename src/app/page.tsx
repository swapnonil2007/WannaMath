import React from "react";
import type { Metadata } from "next";
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
  MULTIVARIABLE_CALCULUS_TOPICS,
  getAllVolumes,
} from "@/registry/curriculum";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { HeroIntegralPreviewLoader } from "@/components/visualizations/HeroIntegralPreviewLoader";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildHomeJsonLd } from "@/lib/seo/structuredData";
import {
  SITE_DESCRIPTION,
  SITE_TITLE_DEFAULT,
  buildPageMetadata,
} from "@/lib/seo/siteConfig";
import { getAdaptiveAccentInk } from "@/lib/accentInk";

export const metadata: Metadata = buildPageMetadata({
  title: "Home",
  absoluteTitle: SITE_TITLE_DEFAULT,
  description: SITE_DESCRIPTION,
  path: "/",
});

const TOPIC_ICON_MAP: Record<string, React.ReactNode> = {
  "double-integrals": <Layers className="w-5 h-5" aria-hidden="true" />,
  "triple-integrals": <Box className="w-5 h-5" aria-hidden="true" />,
  "coordinate-systems": <Compass className="w-5 h-5" aria-hidden="true" />,
  jacobians: <Grid className="w-5 h-5" aria-hidden="true" />,
};

export default function HomePage() {
  const volumes = getAllVolumes();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <JsonLd data={buildHomeJsonLd(volumes)} />
      {/* Hero Section */}
      <section className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--border-strong)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[var(--text-secondary)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--math-ink-diff)]" aria-hidden="true" />
              <span>
                wanna math v2.0 • 6-Volume Interactive Engineering Mathematics Textbook
              </span>
            </div>

            <h1 className="font-math-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[var(--text-primary)] tracking-tight leading-[1.08]">
              See the geometry behind every integral, coordinate frame, and
              transformation.
            </h1>

            <p className="font-math-serif text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed max-w-3xl">
              Traditional textbooks present engineering mathematics as static
              algebraic formulas. <strong>wanna math</strong> pairs traditional{" "}
              <KaTeXMath math="\TeX" /> typesetting with synchronized 2D domain
              plots and 3D spatial viewports across a structured{" "}
              <strong>Volume → Module → Chapter → Lab</strong> curriculum.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              href="/multivariable-calculus/integral-calculus/double-integrals"
              className="px-5 py-3.5 border border-[var(--border-strong)] bg-[#8D9FCE] text-[#1E1F22] font-medium text-sm flex items-center justify-between hover:opacity-95 transition-opacity"
            >
              <span>Start Chapter 3.2.1: Double Integration</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            <Link
              href="/multivariable-calculus"
              className="px-5 py-3.5 border border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] font-medium text-sm flex items-center justify-between transition-colors"
            >
              <span>Explore Volume III: Multivariable &amp; Vector</span>
              <BookOpen className="w-4 h-4 text-[var(--math-ink-z)]" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Interactive 2D/3D Synchronized Preview Widget */}
        <HeroIntegralPreviewLoader />
      </section>

      {/* Section 2: Volume III, Module 3.2 Live Interactive Showcase (Integral Calculus) */}
      <section className="space-y-6 below-fold-section">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
              Volume III • Module 3.2 Live Showcase • Integral Calculus &amp; Special Functions
            </span>
            <h2 className="font-math-serif text-3xl font-semibold text-[var(--text-primary)] mt-1">
              Integral Calculus (Chapters 3.2.1–3.2.6)
            </h2>
          </div>
          <Link
            href="/multivariable-calculus/integral-calculus"
            className="text-sm font-tabular-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5"
          >
            <span>Open Module 3.2: Integral Calculus</span>
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
                      style={{ color: getAdaptiveAccentInk(topic.accentHex) }}
                    >
                      {TOPIC_ICON_MAP[topic.id]}
                    </span>
                    <div>
                      <span className="text-xs font-tabular-mono text-[var(--text-muted)] block">
                        CHAPTER {topic.number} • VOL. III
                      </span>
                      <span
                        className="text-xs font-tabular-mono font-semibold"
                        style={{ color: getAdaptiveAccentInk(topic.accentHex) }}
                      >
                        {topic.dimensionBadge}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={topic.route}
                    className="px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono font-medium text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
                  >
                    <span>Open Chapter Labs</span>
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
                <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)] overflow-x-auto">
                  <KaTeXMath math={topic.keyFormulaLatex} block />
                </div>

                {/* Subtopics List */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
                    Interactive Sections &amp; Labs Included:
                  </span>
                  <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                    {topic.subtopics.map((sub, i) => (
                      <li key={sub.id} className="flex items-start gap-2">
                        <span
                          className="font-tabular-mono text-xs mt-0.5"
                          style={{ color: getAdaptiveAccentInk(topic.accentHex) }}
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

      {/* Section 3: The Complete 6-Volume Engineering Mathematics Textbook Index */}
      <section className="space-y-6 below-fold-section">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-grid)] block">
              4-Tier Pedagogical Taxonomy • Volume → Module → Chapter → Lab
            </span>
            <h2 className="font-math-serif text-3xl font-semibold text-[var(--text-primary)] mt-1">
              The 6-Volume Engineering Mathematics Textbook
            </h2>
          </div>
          <Link
            href="/roadmap"
            className="text-sm font-tabular-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5"
          >
            <span>Explore Full 6-Volume Curriculum Matrix</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {volumes.map((vol) => {
            const totalChapters = vol.modules.reduce(
              (acc, m) => acc + m.chapters.length,
              0
            );
            const publishedChapters = vol.modules.reduce(
              (acc, m) =>
                acc + m.chapters.filter((c) => c.status === "published").length,
              0
            );
            const isActive = publishedChapters > 0;

            return (
              <div
                key={vol.id}
                className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-tabular-mono font-semibold px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                      style={{ color: getAdaptiveAccentInk(vol.accentHex) }}
                    >
                      VOLUME {vol.volumeNumber} • {vol.modules.length} MODULES
                    </span>
                    <span className="text-xs font-tabular-mono flex items-center gap-1 text-[var(--text-muted)]">
                      {isActive ? (
                        <>
                          <CheckCircle2
                            className="w-3.5 h-3.5 text-[var(--math-ink-y)]"
                            aria-hidden="true"
                          />
                          <span className="text-[var(--math-ink-y)]">
                            {publishedChapters}/{totalChapters} Live
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock
                            className="w-3.5 h-3.5 text-[var(--math-ink-grid)]"
                            aria-hidden="true"
                          />
                          <span>{totalChapters} Chapters</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
                    <Link
                      href={`/${vol.slug}`}
                      className="inline-block py-1 hover:underline underline-offset-4"
                    >
                      {vol.title}
                    </Link>
                  </h3>

                  <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
                    {vol.description}
                  </p>

                  {/* Module Pills */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-tabular-mono uppercase text-[var(--text-muted)] block">
                      Modules in Volume {vol.volumeNumber}:
                    </span>
                    <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                      {vol.modules.map((m) => (
                        <li key={m.id} className="flex items-center justify-between gap-2">
                          <Link
                            href={`/${vol.slug}/${m.slug}`}
                            className="inline-flex items-center min-h-[24px] py-0.5 hover:text-[var(--text-primary)] truncate"
                          >
                            <span
                              className="font-tabular-mono mr-1.5"
                              style={{ color: getAdaptiveAccentInk(vol.accentHex) }}
                            >
                              {m.numberLabel}
                            </span>
                            {m.title}
                          </Link>
                          <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] shrink-0 ml-2">
                            {m.chapters.length} ch
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)]">
                  <Link
                    href={`/${vol.slug}`}
                    className="w-full px-3 py-2 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono text-[var(--text-primary)] flex items-center justify-between transition-colors"
                  >
                    <span>
                      Open Volume {vol.volumeNumber}: {vol.shortTitle ?? vol.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
