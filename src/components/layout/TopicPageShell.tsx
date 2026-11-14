import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Cpu,
  Layers,
  BookOpen,
  Clock,
  CheckCircle2,
  GitBranch,
  HelpCircle,
} from "lucide-react";
import {
  getAdjacentChapters,
  getChapterById,
  getPrerequisiteChapters,
} from "@/registry/index";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { getAdaptiveAccentInk } from "@/lib/accentInk";

interface TopicPageShellProps {
  topicId?: string;
  chapterId?: string;
  children?: React.ReactNode;
}

export function TopicPageShell({
  topicId,
  chapterId,
  children,
}: TopicPageShellProps) {
  const lookupKey = chapterId ?? topicId ?? "";
  const resolved = getChapterById(lookupKey);

  if (!resolved) {
    return null;
  }

  const { volume, module: mod, chapter } = resolved;
  const { prev, next } = getAdjacentChapters(chapter.id);
  const prereqs = getPrerequisiteChapters(chapter.id);
  const accentHex = chapter.accentHex ?? mod.accentHex ?? volume.accentHex;
  const accentInk = getAdaptiveAccentInk(accentHex);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 4-Tier Textbook Breadcrumb & Module Chapter Switcher Bar */}
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs font-sans font-medium text-[var(--text-muted)]"
        >
          <Link
            href="/"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            wanna math
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <Link
            href={`/${volume.slug}`}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Vol. {volume.volumeNumber}: {volume.shortTitle ?? volume.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <Link
            href={`/${volume.slug}/${mod.slug}`}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Mod. {mod.numberLabel}: {mod.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="text-[var(--text-primary)] font-semibold">
            Ch. {chapter.id}: {chapter.title}
          </span>
        </nav>

        {/* Sibling Chapters Quick Pill Switcher within Current Module */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {mod.chapters.map((sibling) => {
            const active = sibling.id === chapter.id;
            const siblingRoute = `/${volume.slug}/${mod.slug}/${sibling.slug}`;
            const siblingAccent = sibling.accentHex ?? accentHex;
            return (
              <Link
                key={sibling.id}
                href={siblingRoute}
                aria-current={active ? "page" : undefined}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] border-[var(--border-strong)] font-semibold"
                    : "bg-[var(--bg-panel)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span
                  className="inline-block w-1.5 h-1.5 mr-1.5 align-middle"
                  style={{ backgroundColor: siblingAccent }}
                  aria-hidden="true"
                />
                {sibling.id}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Prerequisite Chips Bar */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] px-4 py-2.5 md:overflow-x-auto">
        <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mr-1 whitespace-nowrap shrink-0">
          <GitBranch
            className="w-3.5 h-3.5 text-[var(--math-ink-grid)]"
            aria-hidden="true"
          />
          <span>Prerequisite Chapters:</span>
        </span>
        {prereqs.length === 0 ? (
          <span className="text-xs font-tabular-mono text-[var(--text-secondary)] px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] whitespace-nowrap">
            Foundational Entry Chapter (No prior chapters required)
          </span>
        ) : (
          prereqs.map((p) => (
            <Link
              key={p.chapter.id}
              href={p.route}
              className="px-2.5 py-1 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-sans font-medium text-[var(--text-primary)] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <span
                className="w-1.5 h-1.5 inline-block shrink-0"
                style={{
                  backgroundColor:
                    p.chapter.status === "published" ? "#96B898" : "#AAA36D",
                }}
                aria-hidden="true"
              />
              <span className="font-tabular-mono text-[var(--text-muted)]">{p.chapter.id}</span>
              <span>{p.chapter.title}</span>
            </Link>
          ))
        )}
      </div>

      {/* Academic Chapter Header */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="px-2.5 py-0.5 text-xs font-tabular-mono font-semibold border border-[var(--border-strong)] bg-[var(--bg-panel)]"
              style={{ color: accentInk }}
            >
              CHAPTER {chapter.id} • {chapter.dimensionBadge ?? "2D + 3D"}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] flex items-center gap-1">
              {chapter.status === "published" ? (
                <>
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-[var(--math-ink-y)]"
                    aria-hidden="true"
                  />
                  <span>Published Interactive Labs</span>
                </>
              ) : (
                <>
                  <Clock
                    className="w-3.5 h-3.5 text-[var(--math-ink-diff)]"
                    aria-hidden="true"
                  />
                  <span>Curriculum Syllabus Ready</span>
                </>
              )}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-muted)]">
              ~{chapter.estimatedMinutes} min study
            </span>
          </div>

          <h1 className="font-math-serif text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] tracking-tight leading-tight">
            {chapter.title}
          </h1>

          <p className="font-math-serif text-lg text-[var(--text-secondary)] leading-relaxed">
            {chapter.subtitle}
          </p>

          {chapter.engineeringContext && (
            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
                <Cpu
                  className="w-3.5 h-3.5 text-[var(--math-ink-y)]"
                  aria-hidden="true"
                />
                <span>Engineering &amp; Physical Application Context</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {chapter.engineeringContext}
              </p>
            </div>
          )}
        </div>

        {/* Right: Governing Equations Card */}
        <div className="lg:col-span-5 border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              Governing Mathematical Formulation
            </span>
            <span
              className="w-3 h-3 inline-block border border-[var(--border-strong)]"
              style={{ backgroundColor: accentHex }}
              aria-hidden="true"
            />
          </div>

          {chapter.keyEquationsLatex.map((eq, idx) => (
            <div
              key={idx}
              className="p-3 min-h-[88px] flex items-center bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] overflow-x-auto"
            >
              <KaTeXMath math={eq} block className="w-full" />
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[var(--text-muted)] font-tabular-mono">
            <span>
              Volume {volume.volumeNumber} • Module {mod.numberLabel}
            </span>
            <span>{chapter.labs.length} Interactive Lab(s)</span>
          </div>
        </div>
      </section>

      {/* Step 1 of 4-Step Pedagogical Chapter Rhythm: Physical & Geometric Question */}
      {chapter.pedagogicalRhythm && (
        <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2">
              <HelpCircle
                className="w-4 h-4 text-[var(--math-ink-diff)]"
                aria-hidden="true"
              />
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-diff)]">
                4-Step Pedagogical Chapter Rhythm • Geometric Intuition First
              </span>
            </div>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              Ch. {chapter.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
              <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                STEP 1 • GEOMETRIC QUESTION
              </span>
              <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
                {chapter.pedagogicalRhythm.question}
              </p>
            </div>

            <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
              <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                STEP 2 • INTERACTIVE LAB EXPLORATION
              </span>
              <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
                {chapter.pedagogicalRhythm.labInteraction}
              </p>
            </div>

            <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 overflow-x-auto">
              <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
                STEP 3 • SYMBOLIC FORMALIZATION
              </span>
              <div className="text-xs pt-1">
                <KaTeXMath
                  math={chapter.pedagogicalRhythm.symbolicFormalizationLatex}
                />
              </div>
            </div>

            <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
              <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                STEP 4 • EDGE CASES &amp; NEXT BRIDGE
              </span>
              <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
                {chapter.pedagogicalRhythm.edgeCasesAndBridge}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Laboratory Jump Bar */}
      {chapter.labs.length > 0 && (
        <section
          aria-label="Chapter Interactive Laboratories"
          className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4"
        >
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] mb-3">
            <Layers
              className="w-3.5 h-3.5"
              style={{ color: accentInk }}
              aria-hidden="true"
            />
            <span>Interactive Laboratories in Chapter {chapter.id}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chapter.labs.map((lab, idx) => (
              <a
                key={lab.id}
                href={`#${lab.slug}`}
                className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)] transition-colors flex flex-col justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
                    <span>
                      LAB {chapter.id}.{idx + 1} • {lab.componentKey}
                    </span>
                    <span style={{ color: accentInk }}>
                      {lab.dimensionBadge ?? "2D + 3D"}
                    </span>
                  </div>
                  <h2 className="font-math-serif text-base font-semibold text-[var(--text-primary)] leading-snug">
                    {lab.title}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {lab.summary}
                  </p>
                </div>
                {lab.formulaLatex && (
                  <div className="text-xs text-[var(--text-secondary)] pt-1.5 border-t border-[var(--border-subtle)] overflow-x-auto">
                    <KaTeXMath math={lab.formulaLatex} />
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Main Interactive Workspace Slot */}
      {children}

      {/* Detailed Laboratory & Section Breakdown */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-2.5">
            <BookOpen
              className="w-5 h-5"
              style={{ color: accentInk }}
              aria-hidden="true"
            />
            <span>Chapter {chapter.id} Laboratory Specifications</span>
          </h2>
          <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
            {chapter.labs.length} Interactive Lab(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {chapter.labs.map((lab, index) => (
            <article
              key={lab.id}
              className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-tabular-mono font-semibold px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                    style={{ color: accentInk }}
                  >
                    LAB {chapter.id}.{index + 1}
                  </span>
                  <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
                    Component: {lab.componentKey}
                  </span>
                </div>

                <h3 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
                  {lab.title}
                </h3>

                <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
                  {lab.summary}
                </p>
              </div>

              {lab.formulaLatex && (
                <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] overflow-x-auto">
                  <KaTeXMath math={lab.formulaLatex} block />
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Sequential Prev / Next Chapter Footer Navigation Across Modules & Volumes */}
      <nav
        aria-label="Adjacent Chapters"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[var(--border-subtle)]"
      >
        {prev ? (
          <Link
            href={prev.route}
            className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-strong)] transition-colors flex items-center gap-3"
          >
            <ArrowLeft
              className="w-5 h-5 shrink-0"
              style={{
                color: getAdaptiveAccentInk(
                  prev.chapter.accentHex ?? prev.volume.accentHex
                ),
              }}
              aria-hidden="true"
            />
            <div>
              <span className="text-xs font-tabular-mono uppercase text-[var(--text-muted)] block">
                Previous Chapter ({prev.chapter.id} • Vol.{" "}
                {prev.volume.volumeNumber})
              </span>
              <span className="font-math-serif text-base font-semibold text-[var(--text-primary)]">
                {prev.chapter.title}
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href={`/${volume.slug}`}
            className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-strong)] transition-colors flex items-center gap-3"
          >
            <ArrowLeft
              className="w-5 h-5 shrink-0 text-[var(--math-ink-x)]"
              aria-hidden="true"
            />
            <div>
              <span className="text-xs font-tabular-mono uppercase text-[var(--text-muted)] block">
                Volume Index
              </span>
              <span className="font-math-serif text-base font-semibold text-[var(--text-primary)]">
                Volume {volume.volumeNumber}: {volume.title}
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
                Next Chapter ({next.chapter.id} • Vol.{" "}
                {next.volume.volumeNumber})
              </span>
              <span className="font-math-serif text-base font-semibold text-[var(--text-primary)]">
                {next.chapter.title}
              </span>
            </div>
            <ArrowRight
              className="w-5 h-5 shrink-0"
              style={{
                color: getAdaptiveAccentInk(
                  next.chapter.accentHex ?? next.volume.accentHex
                ),
              }}
              aria-hidden="true"
            />
          </Link>
        ) : (
          <Link
            href={volume.slug === "statistics" ? "/statistics" : "/roadmap"}
            className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-strong)] transition-colors flex items-center justify-end gap-3 text-right"
          >
            <div>
              <span className="text-xs font-tabular-mono uppercase text-[var(--text-muted)] block">
                {volume.slug === "statistics"
                  ? "Statistics Curriculum"
                  : "Master Curriculum"}
              </span>
              <span className="font-math-serif text-base font-semibold text-[var(--text-primary)]">
                {volume.slug === "statistics"
                  ? "Explore All Statistics Modules"
                  : "Explore All 6 Textbook Volumes"}
              </span>
            </div>
            <ArrowRight
              className="w-5 h-5 shrink-0 text-[var(--math-ink-grid)]"
              aria-hidden="true"
            />
          </Link>
        )}
      </nav>
    </div>
  );
}
