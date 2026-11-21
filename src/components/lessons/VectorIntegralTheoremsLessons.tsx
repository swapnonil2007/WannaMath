import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";

const VECTOR_THEOREM_TABS = [
  {
    id: "3.3.7",
    slug: "stokes-divergence-theorems",
    label: "3.3.7 Overview",
  },
  {
    id: "3.3.7a",
    slug: "stokes-theorem",
    label: "3.3.7a Stokes' Theorem",
  },
  {
    id: "3.3.7b",
    slug: "divergence-theorem",
    label: "3.3.7b Divergence Theorem",
  },
] as const;

export function VectorTheoremsFamilyNav({
  activeSlug,
}: {
  activeSlug: string;
}) {
  return (
    <nav
      aria-label="Vector Integral Theorems Sub-Navigation"
      className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-3 flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)]">
          Vector Integral Theorems
        </span>
        <Link
          href="/multivariable-calculus/vector-calculus/greens-theorem"
          className="px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[11px] font-tabular-mono text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          Ch. 3.3.5 Green&apos;s Theorem
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {VECTOR_THEOREM_TABS.map((tab) => {
          const active = tab.slug === activeSlug;
          return (
            <Link
              key={tab.slug}
              href={`/multivariable-calculus/vector-calculus/${tab.slug}`}
              aria-current={active ? "page" : undefined}
              className={`px-3 py-1.5 text-xs font-tabular-mono border transition-colors ${
                active
                  ? "border-[var(--math-ink-sweep)] bg-[var(--bg-canvas)] text-[var(--math-ink-sweep)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function VectorTheoremsOverviewContent() {
  return (
    <div className="space-y-10">
      {/* Unified Dimensional Ladder */}
      <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <div>
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
              Unified Boundary-to-Interior Principle
            </span>
            <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
              One Idea Across Dimensions: FTC → Green&apos;s → Stokes&apos; → Gauss&apos;s Divergence
            </h2>
          </div>
          <Link
            href="/formulas/vector-calculus"
            className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-sweep)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-sweep)] transition-colors shrink-0"
          >
            Open Vector Calculus Formula Sheet →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs font-math-serif text-[var(--text-secondary)]">
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
            <span className="font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
              1D • FTC &amp; LINE INTEGRAL
            </span>
            <p>
              Integrating <KaTeXMath math="\nabla f \cdot d\mathbf{r}" /> along curve{" "}
              <KaTeXMath math="C" /> cancels interior increments, leaving endpoint values{" "}
              <KaTeXMath math="f(B) - f(A)" />.
            </p>
          </div>

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
            <span className="font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
              2D • GREEN&apos;S THEOREM
            </span>
            <p>
              Cancels interior edge loops over flat <KaTeXMath math="D \subset \mathbb{R}^2" />,
              equating <KaTeXMath math="\iint_D (Q_x - P_y)\,dA" /> with CCW circulation{" "}
              <KaTeXMath math="\oint_{\partial D} \mathbf{F}\cdot d\mathbf{r}" />.
            </p>
          </div>

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
            <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
              3D SURFACE • STOKES&apos; THEOREM
            </span>
            <p>
              Bends Green&apos;s planar region into any orientable 3D cap{" "}
              <KaTeXMath math="S" />: surface curl flux{" "}
              <KaTeXMath math="\iint_S (\nabla\times\mathbf{F})\cdot d\mathbf{S}" /> equals rim
              work <KaTeXMath math="\oint_{\partial S}\mathbf{F}\cdot d\mathbf{r}" />.
            </p>
          </div>

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
            <span className="font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
              3D SOLID • GAUSS DIVERGENCE
            </span>
            <p>
              Cancels internal cube-face fluxes inside solid <KaTeXMath math="E" />: volume
              divergence <KaTeXMath math="\iiint_E (\nabla\cdot\mathbf{F})\,dV" /> equals outward
              shell flux <KaTeXMath math="\oiint_{\partial E}\mathbf{F}\cdot d\mathbf{S}" />.
            </p>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison Matrix */}
      <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
        <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
          Side-by-Side Comparison: Green vs. Stokes vs. Gauss Divergence
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[var(--border-strong)] bg-[var(--bg-canvas)] font-tabular-mono text-xs uppercase text-[var(--text-muted)]">
                <th scope="col" className="px-3.5 py-2.5">Theorem</th>
                <th scope="col" className="px-3.5 py-2.5">Domain &amp; Boundary</th>
                <th scope="col" className="px-3.5 py-2.5">Identity Equation</th>
                <th scope="col" className="px-3.5 py-2.5">Orientation &amp; Smoothness Trap</th>
              </tr>
            </thead>
            <tbody className="font-math-serif text-[var(--text-secondary)]">
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="px-3.5 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                  3.3.5 Green&apos;s
                </td>
                <td className="px-3.5 py-3">
                  Flat 2D domain <KaTeXMath math="D" /> bounded by closed curve{" "}
                  <KaTeXMath math="\partial D" />
                </td>
                <td className="px-3.5 py-3">
                  <KaTeXMath math="\oint_{\partial D}\mathbf{F}\cdot d\mathbf{r} = \iint_D (Q_x - P_y)\,dA" />
                </td>
                <td className="px-3.5 py-3">
                  CCW outer boundary (region on left); holes require excising singularity{" "}
                  <KaTeXMath math="(0,0)" />.
                </td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="px-3.5 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                  3.3.7a Stokes&apos;
                </td>
                <td className="px-3.5 py-3">
                  Curved 3D cap <KaTeXMath math="S" /> bounded by closed space rim{" "}
                  <KaTeXMath math="\partial S" />
                </td>
                <td className="px-3.5 py-3">
                  <KaTeXMath math="\iint_S (\nabla\times\mathbf{F})\cdot d\mathbf{S} = \oint_{\partial S}\mathbf{F}\cdot d\mathbf{r}" />
                </td>
                <td className="px-3.5 py-3">
                  Right-hand rule pairs <KaTeXMath math="\partial S" /> with{" "}
                  <KaTeXMath math="\hat{\mathbf{n}}" />; fails if cap is non-orientable or crosses a
                  vortex line.
                </td>
              </tr>
              <tr>
                <td className="px-3.5 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                  3.3.7b Gauss Divergence
                </td>
                <td className="px-3.5 py-3">
                  Closed 3D solid <KaTeXMath math="E" /> enclosed by surface{" "}
                  <KaTeXMath math="\partial E" />
                </td>
                <td className="px-3.5 py-3">
                  <KaTeXMath math="\oiint_{\partial E}\mathbf{F}\cdot\hat{\mathbf{n}}\,dS = \iiint_E (\nabla\cdot\mathbf{F})\,dV" />
                </td>
                <td className="px-3.5 py-3">
                  Outward normal <KaTeXMath math="\hat{\mathbf{n}}" />; an interior{" "}
                  <KaTeXMath math="1/r^2" /> point charge gives{" "}
                  <KaTeXMath math="4\pi" /> flux despite <KaTeXMath math="\nabla\cdot\mathbf{F}=0" />{" "}
                  for <KaTeXMath math="r>0" />.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Launch Cards to Dedicated Interactive Chapters */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
            Explore Dedicated Interactive Theorem Pages
          </h2>
          <span className="text-xs font-tabular-mono text-[var(--math-ink-y)] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            All Theorem Labs Live
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/multivariable-calculus/vector-calculus/greens-theorem"
            className="border border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] p-5 flex flex-col justify-between gap-4 transition-colors"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-y)] font-semibold">CHAPTER 3.3.5</span>
                <span className="px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--math-ink-y)]">
                  LIVE LAB
                </span>
              </div>
              <h3 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
                Green&apos;s Theorem (Flat 2D)
              </h3>
              <p className="font-math-serif text-sm text-[var(--text-secondary)]">
                Watch <KaTeXMath math="N\times N" /> internal CCW loop edges cancel cleanly inside
                domain <KaTeXMath math="D" />.
              </p>
            </div>
            <span className="text-xs font-tabular-mono text-[var(--math-ink-y)] flex items-center gap-1.5">
              Open Green&apos;s Lab <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </Link>

          <Link
            href="/multivariable-calculus/vector-calculus/stokes-theorem"
            className="border border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] p-5 flex flex-col justify-between gap-4 transition-colors"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-sweep)] font-semibold">CHAPTER 3.3.7a</span>
                <span className="px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--math-ink-sweep)]">
                  LIVE LAB
                </span>
              </div>
              <h3 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
                Stokes&apos; Theorem (3D Cap &amp; Rim)
              </h3>
              <p className="font-math-serif text-sm text-[var(--text-secondary)]">
                Switch between 4 surface caps sharing rim <KaTeXMath math="\partial S" /> and test
                the punctured vortex trap.
              </p>
            </div>
            <span className="text-xs font-tabular-mono text-[var(--math-ink-sweep)] flex items-center gap-1.5">
              Open Stokes&apos; Lab <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </Link>

          <Link
            href="/multivariable-calculus/vector-calculus/divergence-theorem"
            className="border border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] p-5 flex flex-col justify-between gap-4 transition-colors"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-z)] font-semibold">CHAPTER 3.3.7b</span>
                <span className="px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--math-ink-z)]">
                  LIVE LAB
                </span>
              </div>
              <h3 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
                Gauss&apos;s Divergence Theorem
              </h3>
              <p className="font-math-serif text-sm text-[var(--text-secondary)]">
                Inspect Cube, Sphere &amp; Cylinder flux budgets against{" "}
                <KaTeXMath math="\iiint_E (\nabla\cdot\mathbf{F})\,dV" /> and origin point charges.
              </p>
            </div>
            <span className="text-xs font-tabular-mono text-[var(--math-ink-z)] flex items-center gap-1.5">
              Open Divergence Lab <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export function StokesTheoremLesson() {
  return (
    <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
            Proof of Surface Invariance &amp; Physics Connections
          </span>
          <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
            Why Any Smooth Cap <KaTeXMath math="S" /> on Rim <KaTeXMath math="\partial S" /> Collects Identical Curl Flux
          </h2>
        </div>
        <Link
          href="/multivariable-calculus/vector-calculus/divergence-theorem"
          className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-z)] transition-colors shrink-0"
        >
          Next: Ch. 3.3.7b Gauss&apos;s Divergence Theorem →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
            1. SURFACE-INVARIANCE PROOF
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\oiint_{S_1 \cup (-S_2)} (\nabla\times\mathbf{F})\cdot d\mathbf{S} = \iiint_E \nabla\cdot(\nabla\times\mathbf{F})\,dV = 0"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Glue two smooth caps <KaTeXMath math="S_1" /> and <KaTeXMath math="-S_2" /> along their
            common rim <KaTeXMath math="\partial S" /> to enclose volume <KaTeXMath math="E" />. Since{" "}
            <KaTeXMath math="\nabla\cdot(\nabla\times\mathbf{F}) = 0" /> identically, Gauss&apos;s
            Theorem forces <KaTeXMath math="\iint_{S_1}(\nabla\times\mathbf{F})\cdot d\mathbf{S} = \iint_{S_2}(\nabla\times\mathbf{F})\cdot d\mathbf{S}" />!
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
            2. FARADAY &amp; AMPÈRE–MAXWELL LAWS
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\oint_{\partial S}\mathbf{E}\cdot d\mathbf{r} = -\frac{d}{dt}\iint_S \mathbf{B}\cdot d\mathbf{S}"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Stokes&apos; Theorem converts Maxwell&apos;s differential equation{" "}
            <KaTeXMath math="\nabla\times\mathbf{E} = -\partial\mathbf{B}/\partial t" /> directly
            into Faraday&apos;s EMF loop law: induced loop voltage equals the negative rate of change
            of magnetic flux through any spanning loop surface.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-upper)] block">
            3. ORIENTABILITY &amp; SINGULARITY TRAPS
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\nabla\times\mathbf{F} = \mathbf{0} \text{ away from } z\text{-axis}, \quad \oint_C \mathbf{F}\cdot d\mathbf{r} = 2\pi"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            A one-sided Möbius strip cannot assign a continuous unit normal{" "}
            <KaTeXMath math="\hat{\mathbf{n}}" />, and if cap <KaTeXMath math="S" /> crosses a
            singularity where <KaTeXMath math="\mathbf{F}" /> blows up, Stokes&apos; equality fails
            unless a small hole is excised around the puncture!
          </p>
        </div>
      </div>
    </section>
  );
}

export function DivergenceTheoremLesson() {
  return (
    <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
            Control-Volume Proof, Conservation &amp; Point Charges
          </span>
          <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
            Micro-Cube Telescoping Cancellation, Continuity &amp; Gauss&apos;s Law
          </h2>
        </div>
        <Link
          href="/multivariable-calculus/vector-calculus/stokes-theorem"
          className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-sweep)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-sweep)] transition-colors shrink-0"
        >
          ← Compare Ch. 3.3.7a Stokes&apos; Theorem
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
            1. TELESCOPING CONTROL VOLUMES
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\sum_{\text{cells}} \oiint_{\partial E_i} \mathbf{F}\cdot d\mathbf{S} = \oiint_{\partial E} \mathbf{F}\cdot d\mathbf{S}"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Slice solid <KaTeXMath math="E" /> into tiny voxels. On every shared interior face, flow
            exiting cell A is simultaneously flow entering cell B with opposite outward normal—so
            internal fluxes cancel identically, leaving only outer boundary <KaTeXMath math="\partial E" />.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
            2. MASS CONTINUITY &amp; CONSERVATION
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\frac{\partial \rho}{\partial t} + \nabla\cdot(\rho\mathbf{v}) = 0"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Setting outflow rate <KaTeXMath math="\oiint_{\partial E}\rho\mathbf{v}\cdot d\mathbf{S}" />{" "}
            equal to <KaTeXMath math="-\frac{d}{dt}\iiint_E \rho\,dV" /> and applying Gauss&apos;s
            Theorem yields the local PDE governing incompressible fluid flow, heat diffusion, and
            CFD solvers.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-upper)] block">
            3. GAUSS&apos;S LAW &amp; DIRAC DELTA BRIDGE
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\oiint_{\partial E} \frac{\mathbf{r}}{\|\mathbf{r}\|^3}\cdot d\mathbf{S} = 4\pi \quad (\mathbf{0} \in E)"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Because <KaTeXMath math="1/r^2" /> blows up at <KaTeXMath math="\mathbf{0}" />,{" "}
            <KaTeXMath math="\nabla\cdot(\mathbf{r}/r^3) = 0" /> for <KaTeXMath math="r>0" /> yet
            carries concentrated point divergence <KaTeXMath math="4\pi\delta^{(3)}(\mathbf{r})" />—excising
            a small inner sphere <KaTeXMath math="S_\varepsilon" /> restores exactness between shells!
          </p>
        </div>
      </div>
    </section>
  );
}
