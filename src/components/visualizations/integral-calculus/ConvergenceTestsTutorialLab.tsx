"use client";

import React, { useState, useMemo } from "react";
import { BookOpen, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";
import { getAdaptiveAccentInk } from "@/lib/accentInk";

type TestId =
  | "nth-term"
  | "integral"
  | "comparison"
  | "ratio"
  | "root"
  | "alternating";

interface ConvergenceTestSpec {
  id: TestId;
  shortName: string;
  fullTitle: string;
  whenToUse: string;
  hypothesisLatex: string;
  verdictLatex: string;
  pitfallWarning: string;
  workedExampleTitle: string;
  workedStepsLatex: string[];
  accentHex: string;
  evalTerm: (n: number, param: number) => number;
  evalComparisonOrCurve?: (x: number, param: number) => number;
  paramLabel: string;
  paramMin: number;
  paramMax: number;
  paramStep: number;
  defaultParam: number;
  isConvergent: (param: number) => "converges" | "diverges" | "inconclusive";
  metricLabel: (n: number, param: number) => string;
}

const CONVERGENCE_TESTS: ConvergenceTestSpec[] = [
  {
    id: "nth-term",
    shortName: "1. n-th Term Test",
    fullTitle: "Test for Divergence (n-th Term Necessary Condition)",
    whenToUse:
      "ALWAYS check first! Whenever lim_{n→∞} aₙ ≠ 0 (or does not exist), the series diverges immediately.",
    hypothesisLatex: "\\sum_{n=1}^{\\infty} a_n \\text{ converges} \\implies \\lim_{n\\to\\infty} a_n = 0",
    verdictLatex:
      "\\lim_{n\\to\\infty} a_n \\neq 0 \\implies \\sum a_n \\text{ DIVERGES}",
    pitfallWarning:
      "CRITICAL TRAP: If lim aₙ = 0, the test is INCONCLUSIVE! Example: Harmonic series ∑ 1/n has 1/n → 0, yet it still DIVERGES.",
    workedExampleTitle: "Example: Test ∑ n / (2n + 3) vs. Harmonic ∑ 1/n",
    workedStepsLatex: [
      "\\lim_{n\\to\\infty} \\frac{n}{2n+3} = \\frac{1}{2} \\neq 0 \\implies \\text{Diverges by } n\\text{-th Term Test.}",
      "\\text{Counterexample: } a_n = \\frac{1}{n} \\to 0, \\text{ but } S_N = \\sum_{k=1}^N \\frac{1}{k} > \\ln(N+1) \\to \\infty.",
    ],
    accentHex: "#D35323",
    evalTerm: (n, p) => (p >= 1 ? n / (2 * n + 3) : 1 / n),
    paramLabel: "Mode (0 = Harmonic 1/n [Pitfall], 1 = n/(2n+3))",
    paramMin: 0,
    paramMax: 1,
    paramStep: 1,
    defaultParam: 1,
    isConvergent: () => "diverges",
    metricLabel: (n, p) =>
      p >= 1
        ? `a_${n} → 0.500 (Diverges)`
        : `a_${n} → 0, yet S_${n} keeps growing (Diverges)`,
  },
  {
    id: "integral",
    shortName: "2. Integral & p-Test",
    fullTitle: "Cauchy–Maclaurin Integral Test & p-Series Benchmark",
    whenToUse:
      "When aₙ = f(n) comes from a positive, continuous, decreasing function that you can integrate easily (e.g., 1/nᵖ, 1/(n ln n)).",
    hypothesisLatex:
      "f(x) \\ge 0,\\; \\text{continuous & decreasing on } [1, \\infty)",
    verdictLatex:
      "\\sum_{n=1}^{\\infty} f(n) \\text{ converges} \\iff \\int_{1}^{\\infty} f(x)\\,dx \\text{ converges}",
    pitfallWarning:
      "Note: The value of ∫₁^∞ f(x) dx is NOT equal to the sum ∑ aₙ—it only tells you whether both converge or both diverge, bounding the remainder by ∫_N^∞ f(x) dx.",
    workedExampleTitle: "p-Series Proof via Integral Test: ∑ 1 / nᵖ",
    workedStepsLatex: [
      "\\int_1^\\infty x^{-p}\\,dx = \\left[\\frac{x^{1-p}}{1-p}\\right]_1^\\infty = \\frac{1}{p-1} < \\infty \\iff p > 1",
      "\\sum_{n=1}^\\infty \\frac{1}{n^p} \\text{ converges } \\iff p > 1",
    ],
    accentHex: "#029091",
    evalTerm: (n, p) => 1 / Math.pow(n, p),
    evalComparisonOrCurve: (x, p) => 1 / Math.pow(Math.max(0.5, x), p),
    paramLabel: "Exponent p in p-Series ∑ 1 / nᵖ",
    paramMin: 0.5,
    paramMax: 2.5,
    paramStep: 0.1,
    defaultParam: 1.5,
    isConvergent: (p) => (p > 1 ? "converges" : "diverges"),
    metricLabel: (n, p) =>
      `p = ${p.toFixed(1)} (${p > 1 ? "p > 1 → Converges" : "p ≤ 1 → Diverges"})`,
  },
  {
    id: "comparison",
    shortName: "3. Comparison Tests",
    fullTitle: "Direct Comparison & Limit Comparison Test (LCT)",
    whenToUse:
      "When aₙ is rational/algebraic (like (n+1)/(n³+2n)) and looks asymptotically like a clean p-series bₙ = 1/nᵖ.",
    hypothesisLatex:
      "\\text{Direct: } 0 \\le a_n \\le b_n \\quad\\big|\\quad \\text{Limit: } L = \\lim_{n\\to\\infty} \\frac{a_n}{b_n}",
    verdictLatex:
      "0 < L < \\infty \\implies \\sum a_n \\text{ and } \\sum b_n \\text{ share identical fate!}",
    pitfallWarning:
      "In Direct Comparison, knowing aₙ ≤ bₙ where ∑ bₙ DIVERGES tells you NOTHING! Use Limit Comparison whenever awkward +1/-1 constants flip the inequality.",
    workedExampleTitle: "Example: ∑ 1 / (nᵖ + 0.6n) compared to bₙ = 1 / nᵖ",
    workedStepsLatex: [
      "\\text{Compare } a_n = \\frac{1}{n^p + 0.6n} \\text{ with } b_n = \\frac{1}{n^p}",
      "\\lim_{n\\to\\infty} \\frac{a_n}{b_n} = \\lim_{n\\to\\infty} \\frac{n^p}{n^p + 0.6n} = 1 \\;(p > 1)",
    ],
    accentHex: "#96B898",
    evalTerm: (n, p) => 1 / (Math.pow(n, p) + 0.5),
    evalComparisonOrCurve: (n, p) => 1 / Math.pow(n, p),
    paramLabel: "Dominant Decay Exponent p",
    paramMin: 0.6,
    paramMax: 2.4,
    paramStep: 0.1,
    defaultParam: 1.7,
    isConvergent: (p) => (p > 1 ? "converges" : "diverges"),
    metricLabel: (n, p) => `a_${n}/b_${n} → 1.000 (bₙ = 1/n^${p.toFixed(1)})`,
  },
  {
    id: "ratio",
    shortName: "4. Ratio Test",
    fullTitle: "D'Alembert Ratio Test (Factorials & Exponentials)",
    whenToUse:
      "GO-TO TEST whenever terms contain factorials (n!), exponentials (rⁿ), or products where consecutive terms cancel cleanly.",
    hypothesisLatex:
      "L = \\lim_{n\\to\\infty} \\left|\\frac{a_{n+1}}{a_n}\\right|",
    verdictLatex:
      "L < 1 \\text{ (Abs. Convergent)}, \\quad L > 1 \\text{ (Divergent)}, \\quad L = 1 \\text{ (Inconclusive)}",
    pitfallWarning:
      "NEVER rely on Ratio Test for pure rational polynomials or p-series ∑ 1/nᵖ—for every polynomial/p-series, L = 1 (inconclusive)!",
    workedExampleTitle: "Geometric/Factorial Benchmark: ∑ n · rⁿ",
    workedStepsLatex: [
      "\\left|\\frac{a_{n+1}}{a_n}\\right| = \\frac{(n+1)\\,r^{n+1}}{n\\,r^n} = \\left(1 + \\frac{1}{n}\\right) r \\xrightarrow{n\\to\\infty} r",
      "r < 1 \\implies \\text{Converges}; \\qquad r \\ge 1 \\implies \\text{Diverges}",
    ],
    accentHex: "#8D9FCE",
    evalTerm: (n, r) => n * Math.pow(r, n),
    paramLabel: "Asymptotic Ratio r in ∑ n · rⁿ",
    paramMin: 0.45,
    paramMax: 1.25,
    paramStep: 0.05,
    defaultParam: 0.7,
    isConvergent: (r) =>
      r < 1 ? "converges" : r > 1 ? "diverges" : "diverges",
    metricLabel: (n, r) => `L = lim |a_{n+1}/a_n| = ${r.toFixed(2)}`,
  },
  {
    id: "root",
    shortName: "5. Root Test",
    fullTitle: "Cauchy n-th Root Test (Powers of n)",
    whenToUse:
      "Best when the entire general term aₙ is raised to an n-th power: aₙ = [g(n)]ⁿ (e.g., ((2n+1)/(3n+4))ⁿ).",
    hypothesisLatex: "L = \\lim_{n\\to\\infty} \\sqrt[n]{|a_n|}",
    verdictLatex:
      "L < 1 \\text{ (Abs. Convergent)}, \\quad L > 1 \\text{ (Divergent)}, \\quad L = 1 \\text{ (Inconclusive)}",
    pitfallWarning:
      "Strictly stronger than the Ratio Test (whenever Ratio converges, Root converges to the same L), yet L = 1 remains inconclusive.",
    workedExampleTitle: "Example: ∑ [ (k·n) / (n + 1) ]ⁿ",
    workedStepsLatex: [
      "\\sqrt[n]{|a_n|} = \\frac{k\\,n}{n+1} \\xrightarrow{n\\to\\infty} k",
      "k < 1 \\implies \\text{Converges}; \\qquad k > 1 \\implies \\text{Diverges}",
    ],
    accentHex: "#AAA36D",
    evalTerm: (n, k) => Math.pow((k * n) / (n + 1), n),
    paramLabel: "Root Limit k = lim ⁿ√|aₙ|",
    paramMin: 0.5,
    paramMax: 1.25,
    paramStep: 0.05,
    defaultParam: 0.8,
    isConvergent: (k) =>
      k < 1 ? "converges" : k > 1 ? "diverges" : "inconclusive",
    metricLabel: (n, k) => `ⁿ√|a_${n}| → ${k.toFixed(2)}`,
  },
  {
    id: "alternating",
    shortName: "6. Alternating Test",
    fullTitle: "Leibniz Alternating Series Test & Error Bound",
    whenToUse:
      "Series whose signs strictly alternate: ∑ (-1)ⁿ⁻¹ bₙ with bₙ > 0 (e.g., Alternating Harmonic ∑ (-1)ⁿ⁻¹ / n).",
    hypothesisLatex:
      "1)\\; b_{n+1} \\le b_n \\text{ (decreasing)}, \\qquad 2)\\; \\lim_{n\\to\\infty} b_n = 0",
    verdictLatex:
      "\\sum_{n=1}^{\\infty} (-1)^{n-1} b_n \\text{ CONVERGES, and } |S - S_N| \\le b_{N+1}",
    pitfallWarning:
      "Distinguish Absolute vs. Conditional Convergence! Alternating Harmonic ∑ (-1)ⁿ⁻¹/n converges conditionally to ln(2), even though ∑ |aₙ| = ∑ 1/n diverges.",
    workedExampleTitle: "Alternating p-Series: ∑ (-1)ⁿ⁻¹ / nᵖ",
    workedStepsLatex: [
      "b_n = \\frac{1}{n^p} \\text{ decreases monotonically to } 0 \\text{ for all } p > 0",
      "0 < p \\le 1 \\implies \\text{Conditionally Convergent}; \\qquad p > 1 \\implies \\text{Absolutely Convergent}",
    ],
    accentHex: "#D5658B",
    evalTerm: (n, p) => Math.pow(-1, n - 1) / Math.pow(n, p),
    paramLabel: "Exponent p in ∑ (-1)ⁿ⁻¹ / nᵖ",
    paramMin: 0.3,
    paramMax: 2.0,
    paramStep: 0.1,
    defaultParam: 1.0,
    isConvergent: () => "converges",
    metricLabel: (n, p) =>
      p > 1
        ? `Abs. Convergent (|R_${n}| ≤ ${Math.pow(n + 1, -p).toFixed(3)})`
        : `Conditionally Convergent (|R_${n}| ≤ ${Math.pow(n + 1, -p).toFixed(3)})`,
  },
];

export function ConvergenceTestsTutorialLab() {
  const [selectedTestId, setSelectedTestId] = useState<TestId>("integral");
  const [paramVal, setParamVal] = useState<number>(
    CONVERGENCE_TESTS[1].defaultParam
  );
  const [maxN, setMaxN] = useState<number>(18);

  const activeSpec = useMemo(
    () =>
      CONVERGENCE_TESTS.find((t) => t.id === selectedTestId) ??
      CONVERGENCE_TESTS[1],
    [selectedTestId]
  );

  const handleSelectTest = (spec: ConvergenceTestSpec) => {
    setSelectedTestId(spec.id);
    setParamVal(spec.defaultParam);
  };

  // Compute terms a_1..a_maxN and partial sums S_1..S_maxN
  const seriesData = useMemo(() => {
    const terms: { n: number; a: number; S: number; comp?: number }[] = [];
    let runningSum = 0;
    let yMin = 0;
    let yMax = 1;

    for (let n = 1; n <= maxN; n++) {
      const a = activeSpec.evalTerm(n, paramVal);
      runningSum += a;
      const comp = activeSpec.evalComparisonOrCurve
        ? activeSpec.evalComparisonOrCurve(n, paramVal)
        : undefined;
      terms.push({ n, a, S: runningSum, comp });
      yMin = Math.min(yMin, a, runningSum);
      yMax = Math.max(yMax, a, runningSum, comp ?? 0);
    }

    const curvePts: [number, number][] = [];
    if (activeSpec.evalComparisonOrCurve) {
      const steps = 60;
      for (let i = 0; i <= steps; i++) {
        const x = 1 + (i / steps) * (maxN - 0.5);
        const y = activeSpec.evalComparisonOrCurve(x, paramVal);
        if (Number.isFinite(y)) {
          curvePts.push([x, y]);
          yMax = Math.max(yMax, y);
        }
      }
    }

    const verdict = activeSpec.isConvergent(paramVal);
    return {
      terms,
      curvePts,
      yMin: yMin - 0.2,
      yMax: Math.min(18, yMax + 0.35),
      lastSum: runningSum,
      verdict,
    };
  }, [activeSpec, paramVal, maxN]);

  return (
    <section
      aria-label="Convergence Tests Interactive Tutorial and Simulator"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header + Test Selector Tabs */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 space-y-3 bg-[var(--bg-elevated)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-diff)] text-[var(--math-ink-diff)] bg-[var(--bg-canvas)]">
              LAB 3.2.5B • CONVERGENCE TEST TUTORIALS &amp; SEQUENCE VISUALIZER
            </span>
            <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
              Complete Convergence Decision Toolkit: Six Classical Tests with Live Visualizations
            </h2>
          </div>

          <span
            className={`px-3 py-1 text-xs font-tabular-mono border inline-flex items-center gap-1.5 ${
              seriesData.verdict === "converges"
                ? "border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[#96B898]/15"
                : seriesData.verdict === "diverges"
                ? "border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[#D35323]/15"
                : "border-[var(--math-ink-diff)] text-[var(--math-ink-diff)] bg-[#FBEAA4]/15"
            }`}
          >
            {seriesData.verdict === "converges" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            Verdict: {seriesData.verdict.toUpperCase()}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CONVERGENCE_TESTS.map((spec) => {
            const active = spec.id === selectedTestId;
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => handleSelectTest(spec)}
                className={`px-3 py-1.5 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "bg-[var(--bg-canvas)] text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
                style={
                  active
                    ? { borderColor: getAdaptiveAccentInk(spec.accentHex) }
                    : undefined
                }
              >
                {spec.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Detailed Tutorial & Worked Proof */}
        <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-6 space-y-5 bg-[var(--bg-canvas)]">
          <div className="space-y-1.5">
            <div
              className="flex items-center gap-2 text-xs font-tabular-mono"
              style={{ color: getAdaptiveAccentInk(activeSpec.accentHex) }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>STEP-BY-STEP TEST TUTORIAL</span>
            </div>
            <h3 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
              {activeSpec.fullTitle}
            </h3>
            <p className="font-math-serif text-sm text-[var(--text-secondary)] leading-relaxed">
              <strong>When to Use:</strong> {activeSpec.whenToUse}
            </p>
          </div>

          {/* Hypothesis & Theorem Verdict Box */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-3">
            <div>
              <span className="text-[10px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                REQUIRED HYPOTHESIS / LIMIT
              </span>
              <div className="overflow-x-auto">
                <KaTeXMath math={activeSpec.hypothesisLatex} block />
              </div>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-[10px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block mb-1">
                CONCLUSION RULE
              </span>
              <div className="overflow-x-auto">
                <KaTeXMath math={activeSpec.verdictLatex} block />
              </div>
            </div>
          </div>

          {/* Worked Example */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2.5">
            <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
              {activeSpec.workedExampleTitle}
            </span>
            <div className="space-y-2 overflow-x-auto">
              {activeSpec.workedStepsLatex.map((st, idx) => (
                <div key={idx} className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                  <KaTeXMath math={st} block />
                </div>
              ))}
            </div>
          </div>

          {/* Pitfall / Common Mistake Callout */}
          <div className="p-3.5 border border-[var(--math-ink-sweep)]/60 bg-[#D35323]/10 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-[var(--math-ink-sweep)] shrink-0 mt-0.5" />
            <p className="font-math-serif text-xs text-[var(--text-primary)] leading-relaxed">
              {activeSpec.pitfallWarning}
            </p>
          </div>
        </div>

        {/* Right: Interactive Sequence & Partial-Sum Visualizer */}
        <div className="lg:col-span-6 p-6 space-y-4 bg-[var(--bg-panel)]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-x)]">
              Bars = Terms <KaTeXMath math="a_n" /> • Step Curve = Partial Sums <KaTeXMath math="S_N" />
            </span>
            <span className="text-[var(--math-ink-diff)] font-semibold">
              S_{maxN} = {seriesData.lastSum.toFixed(4)}
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[0.5, maxN + 1]}
            yRange={[seriesData.yMin, seriesData.yMax]}
            xLabel="n"
            yLabel="aₙ / Sₙ"
            height={305}
            ariaLabel="Interactive Partial Sums and Term Decay Visualizer"
          >
            {({ toSvgX, toSvgY }) => {
              const sumPath = seriesData.terms
                .map(
                  (pt, idx) =>
                    `${idx === 0 ? "M" : "L"} ${toSvgX(pt.n).toFixed(1)} ${toSvgY(pt.S).toFixed(1)}`
                )
                .join(" ");
              const compCurve = seriesData.curvePts
                .map(
                  ([cx, cy], idx) =>
                    `${idx === 0 ? "M" : "L"} ${toSvgX(cx).toFixed(1)} ${toSvgY(cy).toFixed(1)}`
                )
                .join(" ");
              const zeroY = toSvgY(0);

              return (
                <g>
                  {/* Term rectangles */}
                  {seriesData.terms.map((pt) => {
                    const xLeft = toSvgX(pt.n);
                    const xRight = toSvgX(pt.n + 0.85);
                    const yTop = toSvgY(pt.a);
                    const rectY = Math.min(zeroY, yTop);
                    const rectH = Math.abs(zeroY - yTop);
                    return (
                      <rect
                        key={pt.n}
                        x={xLeft}
                        y={rectY}
                        width={Math.max(3, xRight - xLeft)}
                        height={rectH}
                        fill="#029091"
                        fillOpacity="0.35"
                        stroke="#8D9FCE"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Optional continuous curve (Integral Test) */}
                  {compCurve && (
                    <path
                      d={compCurve}
                      fill="none"
                      stroke="#D35323"
                      strokeWidth="2.2"
                    />
                  )}

                  {/* Partial sum trajectory S_N */}
                  {sumPath && (
                    <path
                      d={sumPath}
                      fill="none"
                      stroke="#FBEAA4"
                      strokeWidth="2.5"
                    />
                  )}

                  {seriesData.terms.map((pt) => (
                    <circle
                      key={`dot-${pt.n}`}
                      cx={toSvgX(pt.n)}
                      cy={toSvgY(pt.S)}
                      r="3"
                      fill="#FBEAA4"
                    />
                  ))}
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          {/* Parameter & Horizon Sliders */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-diff)]">
                <span>{activeSpec.paramLabel}</span>
                <span>{paramVal.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={activeSpec.paramMin}
                max={activeSpec.paramMax}
                step={activeSpec.paramStep}
                value={paramVal}
                onChange={(e) => setParamVal(parseFloat(e.target.value))}
                className="w-full accent-[#FBEAA4]"
                aria-label={activeSpec.paramLabel}
              />
            </div>

            <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-x)]">
                <span>Number of Partial Sum Terms N</span>
                <span>N = {maxN}</span>
              </div>
              <input
                type="range"
                min={6}
                max={32}
                step={1}
                value={maxN}
                onChange={(e) => setMaxN(parseInt(e.target.value, 10))}
                className="w-full accent-[#8D9FCE]"
                aria-label="Number of partial sum terms N"
              />
            </div>
          </div>

          {/* Live Diagnostic Readout */}
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono flex flex-wrap items-center justify-between gap-2">
            <span className="text-[var(--text-secondary)]">
              {activeSpec.metricLabel(maxN, paramVal)}
            </span>
            <span className="text-[var(--math-ink-y)]">
              Final Term a_{maxN} = {seriesData.terms[seriesData.terms.length - 1]?.a.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
