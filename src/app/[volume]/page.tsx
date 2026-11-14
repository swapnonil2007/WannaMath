import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Layers,
} from "lucide-react";
import { getAllVolumes, getVolumeBySlug } from "@/registry/index";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildVolumeJsonLd } from "@/lib/seo/structuredData";
import { buildPageMetadata } from "@/lib/seo/siteConfig";
import { getAdaptiveAccentInk } from "@/lib/accentInk";

export function generateStaticParams() {
  return getAllVolumes().map((vol) => ({
    volume: vol.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ volume: string }>;
}): Promise<Metadata> {
  const { volume: volumeSlug } = await params;
  const volume = getVolumeBySlug(volumeSlug);
  if (!volume) {
    return {
      title: "Volume Not Found",
      robots: { index: false, follow: false },
    };
  }
  const totalChapters = volume.modules.reduce(
    (acc, m) => acc + m.chapters.length,
    0
  );
  return buildPageMetadata({
    title: `Vol. ${volume.volumeNumber}: ${volume.title}`,
    description: `${volume.description} Explore ${volume.modules.length} modules and ${totalChapters} interactive chapters with 2D/3D visualizations.`,
    path: `/${volume.slug}`,
  });
}

export default async function VolumePage({
  params,
}: {
  params: Promise<{ volume: string }>;
}) {
  const { volume: volumeSlug } = await params;
  const volume = getVolumeBySlug(volumeSlug);

  if (!volume) {
    notFound();
  }

  const totalChapters = volume.modules.reduce(
    (acc, m) => acc + m.chapters.length,
    0
  );
  const publishedChapters = volume.modules.reduce(
    (acc, m) =>
      acc + m.chapters.filter((c) => c.status === "published").length,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <JsonLd data={buildVolumeJsonLd(volume)} />
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs font-tabular-mono text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-4"
      >
        <Link href="/" className="hover:text-[var(--text-primary)]">
          wanna math
        </Link>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-[var(--text-primary)] font-medium">
          Volume {volume.volumeNumber}: {volume.title}
        </span>
      </nav>

      {/* Volume Header */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="px-2.5 py-1 border border-[var(--border-strong)] bg-[var(--bg-panel)] text-xs font-tabular-mono font-semibold"
              style={{ color: getAdaptiveAccentInk(volume.accentHex) }}
            >
              TEXTBOOK VOLUME {volume.volumeNumber} • {volume.modules.length}{" "}
              MODULES • {totalChapters} CHAPTERS
            </span>
            <span className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[var(--text-secondary)]">
              {publishedChapters > 0
                ? `${publishedChapters} Chapters Published Live`
                : "Structured Curriculum Syllabus"}
            </span>
          </div>

          <h1 className="font-math-serif text-4xl sm:text-5xl font-semibold text-[var(--text-primary)] tracking-tight leading-tight">
            Volume {volume.volumeNumber}: {volume.title}
          </h1>

          <p className="font-math-serif text-lg text-[var(--text-secondary)] leading-relaxed">
            {volume.description}
          </p>
        </div>

        {/* Engineering Applications Card */}
        <div className="lg:col-span-4 border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-2">
            <Cpu
              className="w-3.5 h-3.5"
              style={{ color: getAdaptiveAccentInk(volume.accentHex) }}
              aria-hidden="true"
            />
            <span>Core Engineering Applications</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
            {volume.engineeringApplications.map((app) => (
              <li key={app} className="flex items-start gap-2">
                <span style={{ color: getAdaptiveAccentInk(volume.accentHex) }}>•</span>
                <span>{app}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Modules & Chapters Directory */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] flex items-center gap-2.5">
            <BookOpen
              className="w-6 h-6"
              style={{ color: getAdaptiveAccentInk(volume.accentHex) }}
              aria-hidden="true"
            />
            <span>Modules &amp; Chapters in Volume {volume.volumeNumber}</span>
          </h2>
          <Link
            href="/roadmap"
            className="text-xs font-tabular-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
          >
            <span>All 6 Volumes</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="space-y-8">
          {volume.modules.map((mod, modIdx) => {
            const modAccent = mod.accentHex ?? volume.accentHex;
            const modInk = getAdaptiveAccentInk(modAccent);
            const modRoute = `/${volume.slug}/${mod.slug}`;
            return (
              <div
                key={mod.id}
                className={`border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-5 ${
                  modIdx > 0 ? "below-fold-section" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 text-xs font-tabular-mono font-semibold border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                        style={{ color: modInk }}
                      >
                        MODULE {mod.numberLabel}
                      </span>
                      <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
                        {mod.chapters.length} Chapters
                      </span>
                    </div>
                    <h3 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                      <Link
                        href={modRoute}
                        className="hover:underline underline-offset-4"
                      >
                        {mod.title}
                      </Link>
                    </h3>
                    <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <Link
                    href={modRoute}
                    className="px-3.5 py-2 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono text-[var(--text-primary)] flex items-center gap-1.5 shrink-0"
                  >
                    <span>Open Module {mod.numberLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>

                {/* Chapters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mod.chapters.map((chapter) => {
                    const chRoute = `/${volume.slug}/${mod.slug}/${chapter.slug}`;
                    const chAccent = chapter.accentHex ?? modAccent;
                    const chInk = getAdaptiveAccentInk(chAccent);
                    const isPublished = chapter.status === "published";
                    return (
                      <article
                        key={chapter.id}
                        className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="text-xs font-tabular-mono font-semibold"
                              style={{ color: chInk }}
                            >
                              CHAPTER {chapter.id} •{" "}
                              {chapter.dimensionBadge ?? "2D + 3D"}
                            </span>
                            <span className="text-[11px] font-tabular-mono flex items-center gap-1 text-[var(--text-muted)]">
                              {isPublished ? (
                                <>
                                  <CheckCircle2
                                    className="w-3.5 h-3.5 text-[var(--math-ink-y)]"
                                    aria-hidden="true"
                                  />
                                  <span className="text-[var(--math-ink-y)]">
                                    Published ({chapter.labs.length} Labs)
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Clock
                                    className="w-3.5 h-3.5 text-[var(--math-ink-diff)]"
                                    aria-hidden="true"
                                  />
                                  <span>Syllabus Ready</span>
                                </>
                              )}
                            </span>
                          </div>

                          <h4 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
                            <Link
                              href={chRoute}
                              className="hover:underline underline-offset-4"
                            >
                              {chapter.title}
                            </Link>
                          </h4>

                          <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
                            {chapter.subtitle}
                          </p>
                        </div>

                        <div className="space-y-2.5 pt-2 border-t border-[var(--border-subtle)]">
                          {chapter.keyEquationsLatex[0] && (
                            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
                              <KaTeXMath
                                math={chapter.keyEquationsLatex[0]}
                                block
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-tabular-mono text-[var(--text-muted)] flex items-center gap-1">
                              <Layers className="w-3 h-3" aria-hidden="true" />
                              {chapter.labs.map((l) => l.componentKey).join(", ")}
                            </span>

                            <Link
                              href={chRoute}
                              className="px-2.5 py-1 border border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono text-[var(--text-primary)] flex items-center gap-1 shrink-0"
                            >
                              <span>
                                {isPublished ? "Launch Labs" : "View Chapter"}
                              </span>
                              <ArrowRight
                                className="w-3 h-3"
                                aria-hidden="true"
                              />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
