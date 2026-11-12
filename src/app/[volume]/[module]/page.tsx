import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
} from "lucide-react";
import { getAllVolumes, getModuleBySlugs } from "@/registry/index";
import { KaTeXMath } from "@/components/math/KaTeXMath";

export function generateStaticParams() {
  const params: { volume: string; module: string }[] = [];
  for (const vol of getAllVolumes()) {
    for (const mod of vol.modules) {
      params.push({ volume: vol.slug, module: mod.slug });
    }
  }
  return params;
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ volume: string; module: string }>;
}) {
  const { volume: volumeSlug, module: moduleSlug } = await params;
  const resolved = getModuleBySlugs(volumeSlug, moduleSlug);

  if (!resolved) {
    notFound();
  }

  const { volume, module: mod } = resolved;
  const modAccent = mod.accentHex ?? volume.accentHex;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs font-tabular-mono text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-4"
      >
        <Link href="/" className="hover:text-[var(--text-primary)]">
          wanna math
        </Link>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <Link
          href={`/${volume.slug}`}
          className="hover:text-[var(--text-primary)]"
        >
          Volume {volume.volumeNumber}: {volume.title}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-[var(--text-primary)] font-medium">
          Module {mod.numberLabel}: {mod.title}
        </span>
      </nav>

      {/* Module Header */}
      <section className="space-y-3 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="px-2.5 py-1 border border-[var(--border-strong)] bg-[var(--bg-panel)] text-xs font-tabular-mono font-semibold"
            style={{ color: modAccent }}
          >
            VOLUME {volume.volumeNumber} • MODULE {mod.numberLabel}
          </span>
          <span className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[var(--text-secondary)]">
            {mod.chapters.length} Chapters in Unit
          </span>
        </div>

        <h1 className="font-math-serif text-4xl sm:text-5xl font-semibold text-[var(--text-primary)] tracking-tight leading-tight">
          {mod.title}
        </h1>

        <p className="font-math-serif text-lg text-[var(--text-secondary)] leading-relaxed">
          {mod.description}
        </p>
      </section>

      {/* Chapters List */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mod.chapters.map((chapter) => {
          const chRoute = `/${volume.slug}/${mod.slug}/${chapter.slug}`;
          const chAccent = chapter.accentHex ?? modAccent;
          const isPublished = chapter.status === "published";

          return (
            <article
              key={chapter.id}
              className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono font-semibold"
                    style={{ color: chAccent }}
                  >
                    CHAPTER {chapter.id} • {chapter.dimensionBadge ?? "2D + 3D"}
                  </span>

                  <span className="text-xs font-tabular-mono flex items-center gap-1 text-[var(--text-muted)]">
                    {isPublished ? (
                      <>
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-[#96B898]"
                          aria-hidden="true"
                        />
                        <span className="text-[#96B898]">
                          Published ({chapter.labs.length} Labs)
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock
                          className="w-3.5 h-3.5 text-[#FBEAA4]"
                          aria-hidden="true"
                        />
                        <span>Planned Syllabus</span>
                      </>
                    )}
                  </span>
                </div>

                <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                  <Link
                    href={chRoute}
                    className="hover:underline underline-offset-4"
                  >
                    {chapter.title}
                  </Link>
                </h2>

                <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
                  {chapter.subtitle}
                </p>

                {chapter.keyEquationsLatex[0] && (
                  <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-x-auto">
                    <KaTeXMath math={chapter.keyEquationsLatex[0]} block />
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Interactive Laboratories:</span>
                  </span>
                  <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                    {chapter.labs.map((lab, idx) => (
                      <li key={lab.id} className="flex items-start gap-2">
                        <span
                          className="font-tabular-mono"
                          style={{ color: chAccent }}
                        >
                          {chapter.id}.{idx + 1}
                        </span>
                        <span>
                          {lab.title} (<code>{lab.componentKey}</code>)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
                  ~{chapter.estimatedMinutes} min • Prereqs:{" "}
                  {chapter.prerequisites.length > 0
                    ? chapter.prerequisites.join(", ")
                    : "None"}
                </span>

                <Link
                  href={chRoute}
                  className="px-3.5 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono font-medium text-[var(--text-primary)] flex items-center gap-1.5"
                >
                  <span>{isPublished ? "Open Chapter Labs" : "View Syllabus"}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      {/* Back to Volume Link */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <Link
          href={`/${volume.slug}`}
          className="inline-flex items-center gap-2 text-xs font-tabular-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>
            Back to Volume {volume.volumeNumber}: {volume.title}
          </span>
        </Link>
      </div>
    </div>
  );
}
