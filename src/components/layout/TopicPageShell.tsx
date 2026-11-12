import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Cpu,
  Layers,
  BookOpen,
} from "lucide-react";
import {
  getAdjacentTopics,
  getTopicById,
  MULTIVARIABLE_CALCULUS_TOPICS,
} from "@/registry/curriculum";
import { KaTeXMath } from "@/components/math/KaTeXMath";

interface TopicPageShellProps {
  topicId: string;
  children?: React.ReactNode;
}

export function TopicPageShell({ topicId, children }: TopicPageShellProps) {
  const topic = getTopicById(topicId);
  const { prev, next } = getAdjacentTopics(topicId);

  if (!topic) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb & Topic Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-tabular-mono text-[var(--text-muted)]"
        >
          <Link
            href="/"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            wanna math
          </Link>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          <Link
            href="/calculus"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Multivariable Calculus
          </Link>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="text-[var(--text-primary)] font-medium">
            {topic.number}. {topic.shortTitle}
          </span>
        </nav>

        {/* Quick Pill Switcher across the 4 Calculus Topics */}
        <div className="flex flex-wrap items-center gap-1.5">
          {MULTIVARIABLE_CALCULUS_TOPICS.map((item) => {
            const active = item.id === topic.id;
            return (
              <Link
                key={item.id}
                href={item.route}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] border-[var(--border-strong)] font-semibold"
                    : "bg-[var(--bg-panel)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span
                  className="inline-block w-1.5 h-1.5 mr-1.5 align-middle"
                  style={{ backgroundColor: item.accentHex }}
                  aria-hidden="true"
                />
                {item.number} {item.shortTitle}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Academic Topic Header */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="px-2.5 py-0.5 text-xs font-tabular-mono font-semibold border border-[var(--border-strong)] bg-[var(--bg-panel)]"
              style={{ color: topic.accentHex }}
            >
              TOPIC {topic.number} • {topic.dimensionBadge}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)]">
              Roadmap Phase {topic.phaseNumber}
            </span>
          </div>

          <h1 className="font-math-serif text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] tracking-tight leading-tight">
            {topic.title}
          </h1>

          <p className="font-math-serif text-lg text-[var(--text-secondary)] leading-relaxed">
            {topic.summary}
          </p>

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              <Cpu className="w-3.5 h-3.5 text-[#96B898]" aria-hidden="true" />
              <span>Engineering &amp; Physical Application Context</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {topic.engineeringContext}
            </p>
          </div>
        </div>

        {/* Right: Governing Equations Card */}
        <div className="lg:col-span-5 border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              Governing Mathematical Formulation
            </span>
            <span
              className="w-3 h-3 inline-block border border-[var(--border-strong)]"
              style={{ backgroundColor: topic.accentHex }}
              aria-hidden="true"
            />
          </div>

          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
            <KaTeXMath math={topic.keyFormulaLatex} block />
          </div>

          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-sm">
            <KaTeXMath math={topic.secondaryFormulaLatex} block />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[var(--text-muted)] font-tabular-mono">
            <span>Prerequisites: {topic.prerequisites.join(" • ")}</span>
          </div>
        </div>
      </section>

      {/* Subtopic Interactive Module Navigation Strip */}
      <section
        aria-label="Topic Interactive Modules"
        className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4"
      >
        <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] mb-3">
          <Layers className="w-3.5 h-3.5" style={{ color: topic.accentHex }} />
          <span>Interactive Sections in This Topic</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {topic.subtopics.map((sub, idx) => (
            <a
              key={sub.id}
              href={`#${sub.id}`}
              className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)] transition-colors flex flex-col justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
                  <span>
                    §{topic.number}.{idx + 1}
                  </span>
                  <span style={{ color: topic.accentHex }}>
                    {sub.dimensionBadge}
                  </span>
                </div>
                <h2 className="font-math-serif text-sm font-semibold text-[var(--text-primary)] leading-snug">
                  {sub.title}
                </h2>
              </div>
              <div className="text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)] truncate">
                <KaTeXMath math={sub.formulaLatex} />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Main Interactive Workspace Slot */}
      {children}

      {/* Detailed Module Architecture Breakdown */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-2.5">
            <BookOpen
              className="w-5 h-5"
              style={{ color: topic.accentHex }}
              aria-hidden="true"
            />
            <span>Section-by-Section Mathematical Breakdown</span>
          </h2>
          <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
            {topic.subtopics.length} Interactive Labs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {topic.subtopics.map((sub, index) => (
            <article
              key={sub.id}
              id={sub.id}
              className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5 space-y-3 flex flex-col justify-between scroll-mt-24"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-tabular-mono font-semibold px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                    style={{ color: topic.accentHex }}
                  >
                    MODULE {topic.number}.{index + 1}
                  </span>
                  <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
                    Viewport: {sub.dimensionBadge}
                  </span>
                </div>

                <h3 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
                  {sub.title}
                </h3>

                <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
                  {sub.description}
                </p>
              </div>

              <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                <KaTeXMath math={sub.formulaLatex} block />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Sequential Prev / Next Topic Footer Navigation */}
      <nav
        aria-label="Adjacent Topics"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[var(--border-subtle)]"
      >
        {prev ? (
          <Link
            href={prev.route}
            className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-strong)] transition-colors flex items-center gap-3"
          >
            <ArrowLeft
              className="w-5 h-5 shrink-0"
              style={{ color: prev.accentHex }}
              aria-hidden="true"
            />
            <div>
              <span className="text-xs font-tabular-mono uppercase text-[var(--text-muted)] block">
                Previous Topic ({prev.number})
              </span>
              <span className="font-math-serif text-base font-semibold text-[var(--text-primary)]">
                {prev.title}
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href="/calculus"
            className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-strong)] transition-colors flex items-center gap-3"
          >
            <ArrowLeft
              className="w-5 h-5 shrink-0 text-[#8D9FCE]"
              aria-hidden="true"
            />
            <div>
              <span className="text-xs font-tabular-mono uppercase text-[var(--text-muted)] block">
                Domain Hub
              </span>
              <span className="font-math-serif text-base font-semibold text-[var(--text-primary)]">
                Multivariable Calculus Overview
              </span>
            </div>
          </Link>
        )}

        {next ? (
          <Link
            href={next.route}
            className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-strong)] transition-colors flex items-center justify-end gap-3 text-right"
          >
            <div>
              <span className="text-xs font-tabular-mono uppercase text-[var(--text-muted)] block">
                Next Topic ({next.number})
              </span>
              <span className="font-math-serif text-base font-semibold text-[var(--text-primary)]">
                {next.title}
              </span>
            </div>
            <ArrowRight
              className="w-5 h-5 shrink-0"
              style={{ color: next.accentHex }}
              aria-hidden="true"
            />
          </Link>
        ) : (
          <Link
            href="/roadmap"
            className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-strong)] transition-colors flex items-center justify-end gap-3 text-right"
          >
            <div>
              <span className="text-xs font-tabular-mono uppercase text-[var(--text-muted)] block">
                Future Curriculum
              </span>
              <span className="font-math-serif text-base font-semibold text-[var(--text-primary)]">
                Explore Upcoming Math Domains
              </span>
            </div>
            <ArrowRight
              className="w-5 h-5 shrink-0 text-[#AAA36D]"
              aria-hidden="true"
            />
          </Link>
        )}
      </nav>
    </div>
  );
}
