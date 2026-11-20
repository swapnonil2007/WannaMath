import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, FileText } from "lucide-react";
import { getAllFormulaSheets } from "@/lib/formulas";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildFormulasIndexJsonLd } from "@/lib/seo/structuredData";
import { buildPageMetadata } from "@/lib/seo/siteConfig";
import { getAdaptiveAccentInk } from "@/lib/accentInk";

export const metadata: Metadata = buildPageMetadata({
  title: "Volume I Formula Reference Sheets",
  description:
    "Verified reference formula sheets for Limits, Derivatives, Taylor & Maclaurin Expansions, and Integrals—linked directly from Volume I: Single-Variable Calculus chapters.",
  path: "/formulas",
});

const PREVIEW_EQUATIONS: Record<string, string> = {
  limits: "\\lim_{x \\to a} f(x) = L \\iff \\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x) = L",
  derivatives: "\\frac{d}{dx}\\bigl[f(g(x))\\bigr] = f'(g(x))\\,g'(x)",
  "taylor-expansions": "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x - a)^n",
  integrals: "\\int_a^b f(x)\\,dx = F(b) - F(a), \\qquad \\int u\\,dv = uv - \\int v\\,du",
};

export default function FormulasIndexPage() {
  const sheets = getAllFormulaSheets();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <JsonLd data={buildFormulasIndexJsonLd(sheets)} />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs font-tabular-mono text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-4"
      >
        <Link href="/" className="hover:text-[var(--text-primary)]">
          wanna math
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="text-[var(--text-primary)] font-semibold">
          Formula Reference Sheets
        </span>
      </nav>

      {/* Header */}
      <header className="space-y-3 max-w-3xl">
        <span className="px-2.5 py-0.5 border border-[var(--border-strong)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[var(--math-ink-x)] inline-block">
          VOLUME I QUICK REFERENCE • 4 VERIFIED SHEETS
        </span>
        <h1 className="font-math-serif text-4xl sm:text-5xl font-semibold text-[var(--text-primary)] tracking-tight leading-tight">
          Calculus Formula Reference Sheets
        </h1>
        <p className="font-math-serif text-lg text-[var(--text-secondary)] leading-relaxed">
          Clean, domain-checked reference sheets covering Limits, Derivatives,
          Taylor &amp; Maclaurin Expansions, and Integrals—built to accompany
          your interactive exploration in Volume I.
        </p>
      </header>

      {/* Cards Grid */}
      <section
        aria-label="Available Formula Sheets"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {sheets.map((sheet) => {
          const accentInk =
            getAdaptiveAccentInk(sheet.accentHex) ?? "var(--math-ink-x)";
          const previewLatex = PREVIEW_EQUATIONS[sheet.slug];
          return (
            <article
              key={sheet.slug}
              className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono font-semibold"
                    style={{ color: accentInk }}
                  >
                    {sheet.badge}
                  </span>
                  <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
                    {sheet.sections.length} Sections
                  </span>
                </div>

                <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                  <Link
                    href={`/formulas/${sheet.slug}`}
                    className="hover:underline underline-offset-4"
                  >
                    {sheet.title}
                  </Link>
                </h2>

                <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
                  {sheet.subtitle}
                </p>

                {previewLatex && (
                  <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-x-auto">
                    <KaTeXMath math={previewLatex} block />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={sheet.backChapterRoute}
                  className="text-xs font-tabular-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
                >
                  {sheet.backChapterLabel}
                </Link>

                <Link
                  href={`/formulas/${sheet.slug}`}
                  className="px-3.5 py-2 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono font-medium text-[var(--text-primary)] inline-flex items-center gap-1.5"
                >
                  <FileText
                    className="w-3.5 h-3.5"
                    style={{ color: accentInk }}
                    aria-hidden="true"
                  />
                  <span>Open {sheet.shortTitle}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
