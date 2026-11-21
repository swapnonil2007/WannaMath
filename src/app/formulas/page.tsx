import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, FileText } from "lucide-react";
import {
  getAllFormulaSheets,
  getFormulaSheetsByVolume,
  type FormulaSheetDefinition,
} from "@/lib/formulas";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildFormulasIndexJsonLd } from "@/lib/seo/structuredData";
import { buildPageMetadata } from "@/lib/seo/siteConfig";
import { getAdaptiveAccentInk } from "@/lib/accentInk";

export const metadata: Metadata = buildPageMetadata({
  title: "Calculus & Engineering Math Formula Reference Sheets",
  description:
    "Verified reference formula sheets across Single-Variable Calculus (Volume I) and Multivariable & Vector Calculus (Volume III)—covering Limits, Derivatives, Taylor Expansions, Integrals, Multivariable Calculus, ODEs, Jacobians, Convergence, Gamma/Beta, and Vector Calculus.",
  path: "/formulas",
});

function FormulaSheetGroup({
  heading,
  volumeRoute,
  volumeAccentHex,
  subtitle,
  sheets,
}: {
  heading: string;
  volumeRoute: string;
  volumeAccentHex: string;
  subtitle: string;
  sheets: FormulaSheetDefinition[];
}) {
  const volumeInk =
    getAdaptiveAccentInk(volumeAccentHex) ?? "var(--math-ink-x)";
  if (sheets.length === 0) return null;

  return (
    <section aria-label={heading} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <span
            className="text-xs font-tabular-mono uppercase tracking-wider font-semibold block"
            style={{ color: volumeInk }}
          >
            {sheets.length} Verified Sheets
          </span>
          <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] mt-0.5">
            {heading}
          </h2>
          <p className="font-math-serif text-sm text-[var(--text-secondary)] mt-1">
            {subtitle}
          </p>
        </div>

        <Link
          href={volumeRoute}
          className="text-xs font-tabular-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1.5"
        >
          <span>Explore Volume</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sheets.map((sheet) => {
          const accentInk =
            getAdaptiveAccentInk(sheet.accentHex) ?? "var(--math-ink-x)";
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

                <h3 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                  <Link
                    href={`/formulas/${sheet.slug}`}
                    className="hover:underline underline-offset-4"
                  >
                    {sheet.title}
                  </Link>
                </h3>

                <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
                  {sheet.subtitle}
                </p>

                {sheet.previewLatex && (
                  <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-x-auto">
                    <KaTeXMath math={sheet.previewLatex} block />
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
      </div>
    </section>
  );
}

export default function FormulasIndexPage() {
  const allSheets = getAllFormulaSheets();
  const vol1Sheets = getFormulaSheetsByVolume("vol-1");
  const vol3Sheets = getFormulaSheetsByVolume("vol-3");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <JsonLd data={buildFormulasIndexJsonLd(allSheets)} />

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
      <header className="space-y-3 max-w-4xl">
        <span className="px-2.5 py-0.5 border border-[var(--border-strong)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[var(--math-ink-x)] inline-block">
          FORMULA REFERENCE LIBRARY • {allSheets.length} VERIFIED SHEETS
        </span>
        <h1 className="font-math-serif text-4xl sm:text-5xl font-semibold text-[var(--text-primary)] tracking-tight leading-tight">
          Calculus &amp; Engineering Math Formula Sheets
        </h1>
        <p className="font-math-serif text-lg text-[var(--text-secondary)] leading-relaxed">
          Clean, domain-checked reference sheets organized by textbook volume—with
          explicit convergence intervals, hypothesis caveats, and direct links
          back to the interactive 2D and 3D labs.
        </p>
      </header>

      <div className="space-y-12">
        <FormulaSheetGroup
          heading="Volume I: Single-Variable Calculus"
          volumeRoute="/single-variable-calculus"
          volumeAccentHex="#8D9FCE"
          subtitle="Limits, differentiation rules, Taylor & Maclaurin series expansions, and single-variable integration."
          sheets={vol1Sheets}
        />

        <FormulaSheetGroup
          heading="Volume III: Multivariable & Vector Calculus"
          volumeRoute="/multivariable-calculus"
          volumeAccentHex="#029091"
          subtitle="Partial derivatives, Euler's theorem, Hessian extrema, ODE operator methods, multiple integrals, Jacobians, convergence tests, Gamma/Beta functions, Del, and integral theorems."
          sheets={vol3Sheets}
        />
      </div>
    </div>
  );
}
