import React from "react";
import Link from "next/link";
import { ExternalLink, GitBranch, Globe, Linkedin } from "lucide-react";
import { SEMANTIC_MATH_PALETTE } from "@/registry/curriculum";
import { getTextbookVolumes } from "@/registry/index";
import {
  BRAND_DISPLAY_NAME,
  BRAND_TAGLINE,
  CREATOR,
  REPO_ISSUES_URL,
  REPO_URL,
} from "@/lib/seo/siteConfig";

const INTERNAL_EXPLORE_LINKS = [
  { href: "/", label: "Home Overview" },
  { href: "/roadmap", label: "Syllabus Matrix (65 Chapters)" },
  { href: "/about", label: "About & Open Source" },
  {
    href: "/multivariable-calculus/integral-calculus/double-integrals",
    label: "Double Integrals Lab",
  },
  {
    href: "/multivariable-calculus/integral-calculus/triple-integrals",
    label: "Triple Integrals Lab",
  },
  {
    href: "/multivariable-calculus/integral-calculus/coordinate-systems",
    label: "Curvilinear Coordinates",
  },
  {
    href: "/multivariable-calculus/integral-calculus/jacobians",
    label: "Jacobian Determinants",
  },
] as const;

const EXTERNAL_RESOURCE_LINKS = [
  { href: REPO_URL, label: "WannaMath on GitHub" },
  { href: REPO_ISSUES_URL, label: "Issues & Contribute" },
  { href: "https://katex.org/", label: "KaTeX Typesetting" },
  { href: "https://threejs.org/", label: "Three.js WebGL Engine" },
] as const;

export function Footer() {
  const volumes = getTextbookVolumes();

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] mt-20">
      {/* Subtle Semantic Butterfly Palette Strip (Solid Flat Swatches, Zero Gradients) */}
      <div className="grid grid-cols-8 h-1.5 w-full" aria-hidden="true">
        {SEMANTIC_MATH_PALETTE.map((swatch) => (
          <div
            key={swatch.token}
            style={{ backgroundColor: swatch.hex }}
            title={`${swatch.name} (${swatch.hex}): ${swatch.meaning}`}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Col 1: Brand Lockup & Developed By */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <span
                className="w-9 h-9 shrink-0 flex items-center justify-center border border-[var(--border-strong)] bg-[var(--bg-canvas)] font-math-serif text-lg font-semibold tracking-tight text-[var(--math-ink-x)]"
                aria-hidden="true"
              >
                ∬
              </span>
              <span className="flex flex-col justify-center">
                <span className="font-math-serif text-xl font-semibold tracking-tight text-[var(--text-primary)] leading-none">
                  {BRAND_DISPLAY_NAME}
                </span>
                <span className="text-[11px] font-sans font-medium tracking-normal text-[var(--text-muted)] leading-[1.25] mt-1">
                  {BRAND_TAGLINE}
                </span>
              </span>
            </Link>

            <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed max-w-md">
              Interactive 6-Volume Engineering Mathematics Textbook—bridging
              symbolic <span className="font-tabular-mono text-xs">TeX</span>{" "}
              equations, coordinate transformations, and synchronized 2D/3D
              spatial geometry across 65 chapters and 82 labs.
            </p>

            {/* Developed by Field + Creator Social Links */}
            <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2.5 max-w-md">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Developed by
                </span>
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  {CREATOR.name}{" "}
                  <span className="text-[var(--text-muted)] font-normal">
                    ({CREATOR.affiliation})
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={CREATOR.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[32px] px-2.5 py-1 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono text-[var(--text-primary)] inline-flex items-center gap-1.5 transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5 text-[var(--math-ink-x)]" aria-hidden="true" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" aria-hidden="true" />
                </a>

                <a
                  href={CREATOR.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[32px] px-2.5 py-1 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono text-[var(--text-primary)] inline-flex items-center gap-1.5 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[var(--math-ink-z)]" aria-hidden="true" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" aria-hidden="true" />
                </a>

                <a
                  href={CREATOR.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[32px] px-2.5 py-1 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono text-[var(--text-primary)] inline-flex items-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-[var(--math-ink-grid)]" aria-hidden="true" />
                  <span>{CREATOR.websiteLabel}</span>
                  <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Internal Links — Textbook Volumes */}
          <nav
            aria-label="Textbook volumes"
            className="lg:col-span-3 space-y-3"
          >
            <h2 className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              6-Volume Textbook Index
            </h2>
            <ul className="space-y-1 text-sm">
              {volumes.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/${v.slug}`}
                    className="min-h-[26px] py-0.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-2 transition-colors"
                  >
                    <span
                      className="w-2 h-2 inline-block shrink-0"
                      style={{ backgroundColor: v.accentHex }}
                      aria-hidden="true"
                    />
                    <span className="font-tabular-mono text-xs text-[var(--text-muted)] shrink-0">
                      Vol. {v.volumeNumber}
                    </span>
                    <span>{v.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 3: Internal Links — Explore & Featured Chapters */}
          <nav
            aria-label="Explore textbook and key chapters"
            className="lg:col-span-3 space-y-3"
          >
            <h2 className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              Explore &amp; Key Labs
            </h2>
            <ul className="space-y-1 text-sm">
              {INTERNAL_EXPLORE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="min-h-[26px] py-0.5 inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 4: External Links — Open Source & Stack */}
          <nav
            aria-label="External resources and source code"
            className="sm:col-span-2 lg:col-span-2 space-y-3"
          >
            <h2 className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              Project &amp; External
            </h2>
            <ul className="space-y-1 text-sm">
              {EXTERNAL_RESOURCE_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[26px] py-0.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>{item.label}</span>
                    <ExternalLink
                      className="w-3 h-3 text-[var(--text-muted)] shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom Legal / Status Row */}
        <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-tabular-mono text-[var(--text-muted)]">
          <p>
            Wanna Math v2.0 • 6 Volumes • 20 Modules • 65 Chapters • 82 Interactive Labs
          </p>
          <p>
            Developed by{" "}
            <a
              href={CREATOR.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-[24px] py-0.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-4"
            >
              {CREATOR.name}
            </a>{" "}
            • Open-Source Engineering Math
          </p>
        </div>
      </div>
    </footer>
  );
}
