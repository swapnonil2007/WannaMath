import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ExternalLink,
  GitBranch,
  Globe,
  Map,
  Compass,
  Clock,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About | wanna math",
  description:
    "About wanna math — an open-source interactive 6-volume engineering mathematics resource created by Swapnonil Nath (IIT Kharagpur) to make math intuitive and time-efficient.",
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-tabular-mono text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-4"
      >
        <Link href="/" className="hover:text-[var(--text-primary)]">
          wanna math
        </Link>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-[var(--text-primary)] font-medium">About</span>
      </nav>

      {/* Hero / Project Mission */}
      <section className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="px-2.5 py-1 border border-[var(--border-strong)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[#AAA36D] inline-block">
            OPEN-SOURCE PROJECT • VOLUMES I–VI
          </span>
          <h1 className="font-math-serif text-4xl sm:text-5xl font-semibold text-[var(--text-primary)]">
            About wanna math
          </h1>
          <p className="font-math-serif text-lg text-[var(--text-secondary)] leading-relaxed">
            <strong>wanna math</strong> is an open-source, interactive
            engineering mathematics textbook organized across six core volumes —
            spanning 65 chapters and 82 synchronized 2D/3D laboratories from
            single-variable calculus through multivariable vector calculus,
            linear algebra, differential equations, complex transforms, and
            numerical methods.
          </p>
        </div>

        {/* Mission & Open Source Goal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-tabular-mono text-[#8D9FCE]">
              <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>01. INTUITIVE GEOMETRY</span>
            </div>
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Easier Mathematical Intuition
            </h2>
            <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
              Instead of treating theorems as static equations on paper, each
              chapter pairs formal symbolic notation with interactive visual
              experiments so learners can see directly why formulas work.
            </p>
          </article>

          <article className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-tabular-mono text-[#96B898]">
              <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>02. PRACTICAL EFFICIENCY</span>
            </div>
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Saving Time for Engineers
            </h2>
            <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
              Built to save study and reference time for everyone — especially
              engineering students and practitioners who want quick visual
              verification alongside clean derivations.
            </p>
          </article>

          <article className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-tabular-mono text-[#029091]">
              <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>03. OPEN COLLABORATION</span>
            </div>
            <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              Open Source by Intent
            </h2>
            <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
              The project is intentionally open source so students, educators,
              and developers can inspect the math, suggest improvements, or
              contribute new interactive labs and explanations.
            </p>
          </article>
        </div>

        {/* Open Source Contribute Bar */}
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              Explore the Syllabus or Contribute on GitHub
            </h2>
            <p className="font-math-serif text-sm text-[var(--text-secondary)]">
              Every chapter, visualization primitive, and syllabus registry
              manifest is open for inspection, bug fixes, and pull requests.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/swapnonil2007/WannaMath"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[38px] px-4 py-2 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono font-medium text-[var(--text-primary)] flex items-center gap-2 transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#029091]" aria-hidden="true" />
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" aria-hidden="true" />
            </a>
            <Link
              href="/roadmap"
              className="min-h-[38px] px-4 py-2 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono font-medium text-[var(--text-primary)] flex items-center gap-2 transition-colors"
            >
              <Map className="w-3.5 h-3.5 text-[#AAA36D]" aria-hidden="true" />
              <span>Open Syllabus Matrix</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Creator & Developer Section */}
      <section className="space-y-4">
        <div className="border-b border-[var(--border-subtle)] pb-3">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#96B898] block">
            Creator &amp; Developer
          </span>
          <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] mt-1">
            About the Creator
          </h2>
        </div>

        <div className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Portrait Frame */}
            <div className="md:col-span-4 lg:col-span-3 flex justify-start">
              <figure className="w-full max-w-[230px] border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-2 space-y-2">
                <Image
                  src="/images/swapnonil-nath.jpg"
                  alt="Swapnonil Nath"
                  width={338}
                  height={448}
                  priority
                  className="w-full h-auto aspect-[338/448] object-cover object-top block"
                />
                <figcaption className="text-[11px] font-tabular-mono text-[var(--text-muted)] px-1 pb-0.5">
                  Swapnonil Nath • IIT Kharagpur
                </figcaption>
              </figure>
            </div>

            {/* Minimalistic Factual Bio */}
            <div className="md:col-span-8 lg:col-span-9 space-y-5">
              <div className="space-y-1">
                <h3 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
                  Swapnonil Nath
                </h3>
                <p className="text-xs font-tabular-mono text-[var(--text-secondary)]">
                  1st-Year UG • B.Tech in Ocean Engineering and Naval Architecture, IIT Kharagpur
                </p>
              </div>

              <div className="space-y-3 font-math-serif text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                <p>
                  I am a first-year undergraduate pursuing a B.Tech in{" "}
                  <strong className="text-[var(--text-primary)] font-medium">
                    Ocean Engineering and Naval Architecture
                  </strong>{" "}
                  at{" "}
                  <strong className="text-[var(--text-primary)] font-medium">
                    IIT Kharagpur
                  </strong>
                  . I started building <strong>wanna math</strong> to connect
                  standard engineering coursework with direct visual intuition
                  and keep a straightforward, open resource useful for students
                  and engineers.
                </p>
                <p>
                  Outside coursework and open-source math tools, I am a
                  co-founder at{" "}
                  <a
                    href="https://spotmybusiness.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-primary)] underline underline-offset-4 hover:text-[#8D9FCE]"
                  >
                    Spot My Business
                  </a>
                  , an internet marketing agency focused on local SEO, web
                  development, and search visibility for businesses.
                </p>
              </div>

              {/* Clean Minimal Links */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap gap-3">
                <a
                  href="https://github.com/swapnonil2007"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[36px] px-3.5 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono text-[var(--text-primary)] flex items-center gap-2 transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5 text-[#8D9FCE]" aria-hidden="true" />
                  <span>GitHub (@swapnonil2007)</span>
                  <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" aria-hidden="true" />
                </a>

                <a
                  href="https://www.linkedin.com/in/swapnonil-nath-gmb-expert/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[36px] px-3.5 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono text-[var(--text-primary)] flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#96B898]" aria-hidden="true" />
                  <span>LinkedIn</span>
                </a>

                <a
                  href="https://spotmybusiness.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[36px] px-3.5 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono text-[var(--text-primary)] flex items-center gap-2 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-[#AAA36D]" aria-hidden="true" />
                  <span>spotmybusiness.in</span>
                  <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
