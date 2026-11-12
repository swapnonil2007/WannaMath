import React from "react";
import Link from "next/link";
import {
  MULTIVARIABLE_CALCULUS_TOPICS,
  SEMANTIC_MATH_PALETTE,
  getAllVolumes,
} from "@/registry/curriculum";

export function Footer() {
  const volumes = getAllVolumes();

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] mt-20">
      {/* Subtle Semantic Butterfly Palette Strip (Solid Flat Swatches, Zero Gradients) */}
      <div
        className="grid grid-cols-8 h-1.5 w-full"
        aria-label="Semantic Butterfly Color Palette Swatches"
      >
        {SEMANTIC_MATH_PALETTE.map((swatch) => (
          <div
            key={swatch.token}
            style={{ backgroundColor: swatch.hex }}
            title={`${swatch.name} (${swatch.hex}): ${swatch.meaning}`}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <span
                className="w-7 h-7 flex items-center justify-center border border-[var(--border-strong)] bg-[var(--bg-canvas)] font-math-serif font-semibold"
                style={{ color: "#8D9FCE" }}
              >
                ∬
              </span>
              <span className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
                wanna math
              </span>
            </div>
            <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
              Interactive 6-Volume Engineering Mathematics Textbook—bridging
              symbolic equations, coordinate transformations, and 2D/3D spatial
              geometry with eye-comfortable academic typography.
            </p>
            <p className="text-xs font-tabular-mono text-[var(--text-muted)]">
              Repository Archive: <code>/archive</code> &amp;{" "}
              <code>AGENTS.md</code> synced for multi-phase agent continuity.
            </p>
          </div>

          {/* Col 2: Volume III Live Chapters */}
          <div className="md:col-span-4 space-y-2.5">
            <h2 className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              Vol. III, Module 3.2 Published Labs
            </h2>
            <ul className="space-y-1.5 text-sm">
              {MULTIVARIABLE_CALCULUS_TOPICS.map((topic) => (
                <li key={topic.id}>
                  <Link
                    href={topic.route}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors"
                  >
                    <span
                      className="w-2 h-2 inline-block shrink-0"
                      style={{ backgroundColor: topic.accentHex }}
                      aria-hidden="true"
                    />
                    <span className="font-tabular-mono text-xs text-[var(--text-muted)]">
                      {topic.number}
                    </span>
                    <span>{topic.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: 6-Volume Textbook Index */}
          <div className="md:col-span-4 space-y-2.5">
            <h2 className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              6-Volume Textbook Index
            </h2>
            <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
              {volumes.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/${v.slug}`}
                    className="hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors"
                  >
                    <span
                      className="font-tabular-mono text-xs"
                      style={{ color: v.accentHex }}
                    >
                      Vol. {v.volumeNumber}
                    </span>
                    <span>{v.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
