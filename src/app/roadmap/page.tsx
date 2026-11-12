import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  FolderGit2,
  ArrowRight,
  Layers,
} from "lucide-react";
import { getAllVolumes } from "@/registry/index";
import { KaTeXMath } from "@/components/math/KaTeXMath";

export default function RoadmapPage() {
  const volumes = getAllVolumes();

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
          6-Volume Textbook Architecture &amp; Curriculum Matrix
        </span>
      </nav>

      {/* Header */}
      <section className="max-w-3xl space-y-3">
        <span className="px-2.5 py-1 border border-[var(--border-strong)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[#AAA36D] inline-block">
          4-TIER PEDAGOGICAL TAXONOMY • VOL → MOD → CH → LAB
        </span>
        <h1 className="font-math-serif text-4xl sm:text-5xl font-semibold text-[var(--text-primary)]">
          6-Volume Engineering Mathematics Master Syllabus
        </h1>
        <p className="font-math-serif text-lg text-[var(--text-secondary)] leading-relaxed">
          <strong>wanna math</strong> is architected as a complete 6-Volume
          interactive Engineering Mathematics textbook. Every volume, module,
          chapter, and laboratory is registered in{" "}
          <code>src/registry/</code> and tracked in{" "}
          <code>archive/01_GLOBAL_STATUS.md</code>.
        </p>
      </section>

      {/* Complete 6-Volume Matrix */}
      <section className="space-y-8">
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

          return (
            <div
              key={vol.id}
              id={vol.slug}
              className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6 scroll-mt-24"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-tabular-mono font-semibold px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                      style={{ color: vol.accentHex }}
                    >
                      VOLUME {vol.volumeNumber} • {vol.modules.length} MODULES •{" "}
                      {totalChapters} CHAPTERS
                    </span>
                    <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
                      {publishedChapters > 0
                        ? `${publishedChapters} Chapters Published Live`
                        : "Syllabus & Route Shells Active"}
                    </span>
                  </div>
                  <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
                    <Link
                      href={`/${vol.slug}`}
                      className="hover:underline underline-offset-4"
                    >
                      Volume {vol.volumeNumber}: {vol.title}
                    </Link>
                  </h2>
                  <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
                    {vol.description}
                  </p>
                </div>

                <Link
                  href={`/${vol.slug}`}
                  className="px-3.5 py-2 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono text-[var(--text-primary)] flex items-center gap-1.5 shrink-0"
                >
                  <span>Open Volume {vol.volumeNumber}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>

              {/* Modules inside Volume */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {vol.modules.map((mod) => (
                  <div
                    key={mod.id}
                    className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-tabular-mono font-semibold"
                          style={{ color: mod.accentHex ?? vol.accentHex }}
                        >
                          MODULE {mod.numberLabel}
                        </span>
                        <Link
                          href={`/${vol.slug}/${mod.slug}`}
                          className="text-[11px] font-tabular-mono text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                          View Module →
                        </Link>
                      </div>

                      <h3 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
                        {mod.title}
                      </h3>

                      <ul className="space-y-2 pt-1">
                        {mod.chapters.map((ch) => {
                          const chRoute = `/${vol.slug}/${mod.slug}/${ch.slug}`;
                          const isPub = ch.status === "published";
                          return (
                            <li
                              key={ch.id}
                              className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <Link
                                  href={chRoute}
                                  className="text-xs font-medium text-[var(--text-primary)] hover:underline truncate"
                                >
                                  <span
                                    className="font-tabular-mono mr-1.5"
                                    style={{
                                      color: ch.accentHex ?? vol.accentHex,
                                    }}
                                  >
                                    {ch.id}
                                  </span>
                                  {ch.title}
                                </Link>
                                {isPub ? (
                                  <CheckCircle2
                                    className="w-3.5 h-3.5 text-[#96B898] shrink-0"
                                    aria-label="Published"
                                  />
                                ) : (
                                  <Clock
                                    className="w-3.5 h-3.5 text-[#FBEAA4] shrink-0"
                                    aria-label="Planned"
                                  />
                                )}
                              </div>
                              {ch.keyEquationsLatex[0] && (
                                <div className="text-[11px] text-[var(--text-secondary)] overflow-x-auto">
                                  <KaTeXMath math={ch.keyEquationsLatex[0]} />
                                </div>
                              )}
                              <div className="flex items-center justify-between text-[10px] font-tabular-mono text-[var(--text-muted)]">
                                <span className="flex items-center gap-1 truncate">
                                  <Layers className="w-3 h-3 shrink-0" />
                                  {ch.labs.map((l) => l.componentKey).join(", ")}
                                </span>
                                <span>{ch.estimatedMinutes}m</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
              All architectural plans (<code>00_MASTER_TEXTBOOK_PLAN.md</code>),
              global status matrices (<code>01_GLOBAL_STATUS.md</code>), design
              tokens, and volume logs are stored in <code>/archive</code> for
              seamless multi-agent handoff.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
