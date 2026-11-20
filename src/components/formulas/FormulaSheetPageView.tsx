import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  BookOpen,
  ChevronRight,
  FileText,
  Hash,
} from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathRichText } from "@/components/math/MathRichText";
import { getAdaptiveAccentInk } from "@/lib/accentInk";
import { getFormulaSheetBySlug } from "@/lib/formulas";
import type { FormulaSheetDefinition } from "@/lib/formulas/types";

interface FormulaSheetPageViewProps {
  sheet: FormulaSheetDefinition;
}

export function FormulaSheetPageView({ sheet }: FormulaSheetPageViewProps) {
  const accentInk = getAdaptiveAccentInk(sheet.accentHex) ?? "var(--math-ink-x)";
  const relatedSheets = sheet.relatedSlugs
    .map((slug) => getFormulaSheetBySlug(slug))
    .filter((s): s is FormulaSheetDefinition => Boolean(s));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb + Back to Chapter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs font-tabular-mono text-[var(--text-muted)]"
        >
          <Link href="/" className="hover:text-[var(--text-primary)]">
            wanna math
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <Link href="/formulas" className="hover:text-[var(--text-primary)]">
            Formula Sheets
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="text-[var(--text-primary)] font-semibold">
            {sheet.shortTitle}
          </span>
        </nav>

        <Link
          href={sheet.backChapterRoute}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono font-medium text-[var(--text-primary)] transition-colors shrink-0"
        >
          <ArrowLeft
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: accentInk }}
            aria-hidden="true"
          />
          <span>{sheet.backChapterLabel}</span>
        </Link>
      </div>

      {/* Header */}
      <header className="space-y-4 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className="px-2.5 py-0.5 text-xs font-tabular-mono font-semibold border border-[var(--border-strong)] bg-[var(--bg-panel)]"
            style={{ color: accentInk }}
          >
            {sheet.badge}
          </span>
          <span className="px-2.5 py-0.5 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-muted)]">
            {sheet.sections.length} Reference Sections
          </span>
        </div>

        <h1 className="font-math-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--text-primary)] tracking-tight leading-tight">
          {sheet.title}
        </h1>

        <p className="font-math-serif text-lg text-[var(--text-secondary)] leading-relaxed">
          {sheet.subtitle}
        </p>
      </header>

      {/* Mathematical Rigor & Verification Notes */}
      {sheet.accuracyNotes && sheet.accuracyNotes.length > 0 && (
        <section
          aria-label="Mathematical Rigor and Verification Notes"
          className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)]">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Mathematical Rigor &amp; Accuracy Notes</span>
          </div>
          <ul className="space-y-2 text-sm font-math-serif text-[var(--text-secondary)] leading-relaxed">
            {sheet.accuracyNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  className="font-tabular-mono text-xs mt-1 shrink-0"
                  style={{ color: accentInk }}
                  aria-hidden="true"
                >
                  •
                </span>
                <span>
                  <MathRichText text={note} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Quick Section Jump Bar */}
      <nav
        aria-label="Formula sections"
        className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4 space-y-2.5"
      >
        <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
          <Hash className="w-3.5 h-3.5" style={{ color: accentInk }} aria-hidden="true" />
          <span>Jump to Formula Section</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sheet.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)] text-xs font-sans text-[var(--text-primary)] transition-colors"
            >
              {section.title}
            </a>
          ))}
        </div>
      </nav>

      {/* Formula Sections */}
      <div className="space-y-12">
        {sheet.sections.map((section) => {
          const secInk =
            getAdaptiveAccentInk(section.accentHex) ?? "var(--math-ink-x)";
          return (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 space-y-4"
            >
              <div className="border-b border-[var(--border-subtle)] pb-2.5 space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 inline-block border border-[var(--border-strong)] shrink-0"
                    style={{ backgroundColor: section.accentHex }}
                    aria-hidden="true"
                  />
                  <h2
                    className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {section.title}
                  </h2>
                </div>
                {section.intro && (
                  <p className="font-math-serif text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-4xl">
                    <MathRichText text={section.intro} />
                  </p>
                )}
              </div>

              {/* Formulas Grid */}
              {section.formulas && section.formulas.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {section.formulas.map((entry, idx) => (
                    <article
                      key={idx}
                      className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2.5">
                        {entry.label && (
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span
                              className="text-xs font-tabular-mono font-semibold uppercase tracking-wider"
                              style={{ color: secInk }}
                            >
                              {entry.label}
                            </span>
                          </div>
                        )}
                        <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] overflow-x-auto">
                          <KaTeXMath math={entry.latex} block />
                        </div>
                      </div>

                      {(entry.condition || entry.note) && (
                        <div className="space-y-1 text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed pt-1 border-t border-[var(--border-subtle)]">
                          {entry.condition && (
                            <p>
                              <span className="font-tabular-mono uppercase text-[11px] text-[var(--text-muted)] mr-1.5">
                                Condition:
                              </span>
                              <MathRichText text={entry.condition} />
                            </p>
                          )}
                          {entry.note && (
                            <p className="text-[var(--text-secondary)]">
                              <MathRichText text={entry.note} />
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}

              {/* Worked Examples */}
              {section.examples && section.examples.length > 0 && (
                <div className="space-y-4">
                  {section.examples.map((ex, idx) => (
                    <article
                      key={idx}
                      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 space-y-3"
                    >
                      <h3
                        className="font-math-serif text-lg font-semibold"
                        style={{ color: secInk }}
                      >
                        Worked Example: {ex.title}
                      </h3>
                      <div className="space-y-2">
                        {ex.stepsLatex.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] overflow-x-auto"
                          >
                            <KaTeXMath math={step} block />
                          </div>
                        ))}
                      </div>
                      {ex.takeaway && (
                        <p className="text-sm font-math-serif text-[var(--text-secondary)] leading-relaxed">
                          <MathRichText text={ex.takeaway} />
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}

              {/* Reference Table */}
              {section.table && (
                <div className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 space-y-3">
                  <h3 className="font-math-serif text-base font-semibold text-[var(--text-primary)]">
                    {section.table.title}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border-strong)] bg-[var(--bg-canvas)]">
                          {section.table.headers.map((header, hIdx) => (
                            <th
                              key={hIdx}
                              scope="col"
                              className="px-3.5 py-2.5 font-tabular-mono text-xs uppercase tracking-wider text-[var(--text-muted)]"
                            >
                              <MathRichText text={header} />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="border-b border-[var(--border-subtle)] last:border-b-0"
                          >
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="px-3.5 py-3 font-math-serif text-[var(--text-primary)] align-middle"
                              >
                                <MathRichText text={cell} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bulleted Notes */}
              {section.bulletNotes && section.bulletNotes.length > 0 && (
                <div className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5">
                  <ul className="space-y-2.5 text-sm font-math-serif text-[var(--text-secondary)] leading-relaxed">
                    {section.bulletNotes.map((item, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5">
                        <span
                          className="font-tabular-mono text-xs mt-1 shrink-0"
                          style={{ color: secInk }}
                          aria-hidden="true"
                        >
                          →
                        </span>
                        <span>
                          <MathRichText text={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Sibling Formula Sheets Footer Navigation */}
      <section
        aria-label="Other Formula Sheets"
        className="pt-8 border-t border-[var(--border-subtle)] space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <BookOpen
              className="w-5 h-5"
              style={{ color: accentInk }}
              aria-hidden="true"
            />
            <span>Related Volume I Formula Reference Sheets</span>
          </h2>
          <Link
            href="/formulas"
            className="text-xs font-tabular-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
          >
            <span>All Formula Sheets</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {relatedSheets.map((rel) => {
            const relInk =
              getAdaptiveAccentInk(rel.accentHex) ?? "var(--math-ink-x)";
            return (
              <Link
                key={rel.slug}
                href={`/formulas/${rel.slug}`}
                className="p-4 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-panel)] flex flex-col justify-between gap-2 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-tabular-mono">
                    <span style={{ color: relInk }}>{rel.shortTitle}</span>
                    <FileText
                      className="w-3.5 h-3.5 text-[var(--text-muted)]"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="font-math-serif text-sm font-semibold text-[var(--text-primary)]">
                    {rel.title}
                  </p>
                </div>
                <span className="text-xs font-tabular-mono text-[var(--text-muted)] flex items-center gap-1">
                  <span>Open Sheet</span>
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
