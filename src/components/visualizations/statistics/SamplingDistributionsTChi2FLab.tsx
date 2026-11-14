"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  buildHistogramBins,
  chiSquarePdf,
  createSeededRng,
  fisherFPdf,
  normalPdf,
  sampleMean,
  sampleNormal,
  sampleStdDev,
  studentTPdf,
} from "./statMath";

type FamilyTab = "student_t" | "chi2" | "fisher_f";

function fmt(n: number, digits = 3): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.3.3 — Exact Sampling Distributions Builder: Student's t, Chi-Square (χ²), and Fisher's F.
 * Generates live standard Normal draws Z_i ~ N(0, 1) to empirically construct
 * t_ν, χ²_k, and F_{d₁,d₂} and overlay them on the exact analytical PDFs.
 */
export function SamplingDistributionsTChi2FLab() {
  const [tab, setTab] = useState<FamilyTab>("student_t");
  const [nuT, setNuT] = useState<number>(3);
  const [kChi2, setKChi2] = useState<number>(4);
  const [d1F, setD1F] = useState<number>(4);
  const [d2F, setD2F] = useState<number>(12);
  const [showNormalRef, setShowNormalRef] = useState<boolean>(true);
  const [samples, setSamples] = useState<number[]>([]);
  const [lastRecipe, setLastRecipe] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const rngRef = useRef<() => number>(createSeededRng(20260303));

  const clearSamples = () => {
    setIsStreaming(false);
    setSamples([]);
    setLastRecipe("");
  };

  const domain = useMemo(() => {
    if (tab === "student_t") {
      return { xMin: -5.5, xMax: 5.5, bins: 44 };
    }
    if (tab === "chi2") {
      const upper = Math.max(16, Math.ceil(kChi2 + 4 * Math.sqrt(2 * kChi2)));
      return { xMin: 0, xMax: upper, bins: 38 };
    }
    return { xMin: 0, xMax: 6.5, bins: 38 };
  }, [tab, kChi2]);

  const drawSamples = (count: number) => {
    const rng = rngRef.current;
    const out: number[] = [];
    let recipeText = "";

    for (let m = 0; m < count; m++) {
      if (tab === "student_t") {
        // Draw n = nuT + 1 IID Standard Normals, form t = (xbar - 0) / (s / sqrt(n))
        const n = nuT + 1;
        const draws = Array.from({ length: n }, () => sampleNormal(rng, 0, 1));
        const xbar = sampleMean(draws);
        const s = Math.max(1e-5, sampleStdDev(draws, 1));
        const tStat = xbar / (s / Math.sqrt(n));
        out.push(tStat);
        if (m === count - 1) {
          recipeText = `n=${n} Z-draws → x̄=${fmt(xbar, 2)}, s=${fmt(s, 2)} ⇒ t=${fmt(tStat, 2)}`;
        }
      } else if (tab === "chi2") {
        let sumSq = 0;
        const sqParts: number[] = [];
        for (let i = 0; i < kChi2; i++) {
          const z = sampleNormal(rng, 0, 1);
          const z2 = z * z;
          sumSq += z2;
          if (i < 3) sqParts.push(z2);
        }
        out.push(sumSq);
        if (m === count - 1) {
          recipeText = `Σ Zᵢ² (${kChi2} terms: ${sqParts.map((v) => fmt(v, 2)).join(" + ")}${kChi2 > 3 ? " + …" : ""}) = ${fmt(sumSq, 2)}`;
        }
      } else {
        // Numerator chi2/d1 and denominator chi2/d2
        let num = 0;
        for (let i = 0; i < d1F; i++) {
          const z = sampleNormal(rng, 0, 1);
          num += z * z;
        }
        let den = 0;
        for (let i = 0; i < d2F; i++) {
          const z = sampleNormal(rng, 0, 1);
          den += z * z;
        }
        const fStat = (num / d1F) / Math.max(1e-6, den / d2F);
        out.push(fStat);
        if (m === count - 1) {
          recipeText = `(χ²/${d1F}) / (χ²/${d2F}) = ${fmt(num / d1F, 2)} / ${fmt(den / d2F, 2)} = ${fmt(fStat, 2)}`;
        }
      }
    }

    setSamples((prev) => [...prev, ...out].slice(-2500));
    if (recipeText) setLastRecipe(recipeText);
  };

  useEffect(() => {
    if (!isStreaming) return;
    let rafId = 0;
    let lastTick = performance.now();
    const tick = (now: number) => {
      if (now - lastTick >= 70) {
        lastTick = now;
        drawSamples(12);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isStreaming, tab, nuT, kChi2, d1F, d2F]);

  const evalPdf = (x: number): number => {
    if (tab === "student_t") return studentTPdf(x, nuT);
    if (tab === "chi2") return chiSquarePdf(x, kChi2);
    return fisherFPdf(x, d1F, d2F);
  };

  const svgW = 580;
  const svgH = 265;
  const padL = 46;
  const padR = 20;
  const padT = 22;
  const padB = 34;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const plotData = useMemo(() => {
    const steps = 180;
    const pts: Array<{ x: number; y: number; refY: number }> = [];
    let theoPeak = 0.25;
    for (let i = 0; i <= steps; i++) {
      const x = domain.xMin + (i / steps) * (domain.xMax - domain.xMin);
      const safeX = (tab !== "student_t" && x === 0) ? 0.02 : x;
      const y = Math.min(2.5, evalPdf(safeX));
      const refY = tab === "student_t" ? normalPdf(safeX, 0, 1) : 0;
      pts.push({ x, y, refY });
      theoPeak = Math.max(theoPeak, y, refY);
    }

    const { bins } = buildHistogramBins(
      samples,
      domain.bins,
      domain.xMin,
      domain.xMax
    );
    const histPeak = bins.reduce((m, b) => Math.max(m, b.density), 0);
    const yMax = Math.max(0.28, theoPeak * 1.15, Math.min(2.5, histPeak * 1.1));

    const toX = (x: number) =>
      padL + ((x - domain.xMin) / (domain.xMax - domain.xMin)) * plotW;
    const toY = (d: number) =>
      padT + plotH - Math.min(1, d / yMax) * plotH;

    let mainPath = "";
    let refPath = "";
    pts.forEach((pt, idx) => {
      const cmd = idx === 0 ? "M" : "L";
      mainPath += `${cmd} ${toX(pt.x).toFixed(1)} ${toY(pt.y).toFixed(1)} `;
      if (tab === "student_t") {
        refPath += `${cmd} ${toX(pt.x).toFixed(1)} ${toY(pt.refY).toFixed(1)} `;
      }
    });

    return { bins, yMax, toX, toY, mainPath, refPath };
  }, [tab, nuT, kChi2, d1F, d2F, samples, domain]);

  const theoreticalSummary = useMemo(() => {
    if (tab === "student_t") {
      return {
        mean: "0",
        variance:
          nuT > 2
            ? `${fmt(nuT / (nuT - 2), 2)} (ν/(ν−2))`
            : nuT === 2
            ? "∞ (heavy tails!)"
            : "Undefined (Cauchy)",
        formula: `t_{${nuT}} = \\frac{Z}{\\sqrt{\\chi^2_{${nuT}} / ${nuT}}}`,
      };
    }
    if (tab === "chi2") {
      return {
        mean: `${kChi2} (k)`,
        variance: `${2 * kChi2} (2k)`,
        formula: `\\chi^2_{${kChi2}} = \\sum_{i=1}^{${kChi2}} Z_i^2`,
      };
    }
    return {
      mean: d2F > 2 ? `${fmt(d2F / (d2F - 2), 2)} (d₂/(d₂−2))` : "∞ (d₂ ≤ 2)",
      variance:
        d2F > 4
          ? `${fmt(
              (2 * d2F * d2F * (d1F + d2F - 2)) /
                (d1F * (d2F - 2) * (d2F - 2) * (d2F - 4)),
              2
            )}`
          : "∞ (d₂ ≤ 4)",
      formula: `F_{${d1F},${d2F}} = \\frac{\\chi^2_{${d1F}}/${d1F}}{\\chi^2_{${d2F}}/${d2F}}`,
    };
  }, [tab, nuT, kChi2, d1F, d2F]);

  return (
    <section
      aria-label="Exact Sampling Distributions Student t, Chi-Square and Fisher F Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-6 space-y-5"
    >
      {/* Header + Family Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
            Interactive Laboratory S.3.3 • Built Directly From Zᵢ ~ N(0, 1)
          </span>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Exact Sampling Laws: Student&apos;s <KaTeXMath math="t_\nu" />,{" "}
            <KaTeXMath math="\chi^2_k" /> &amp; Fisher&apos;s <KaTeXMath math="F_{d_1,d_2}" />
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "student_t" as const, label: "Student's t (t_ν)" },
            { id: "chi2" as const, label: "Chi-Square (χ²_k)" },
            { id: "fisher_f" as const, label: "Fisher's F (F_{d₁,d₂})" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTab(item.id);
                clearSamples();
              }}
              className={`px-3 py-1.5 border text-xs font-tabular-mono cursor-pointer transition-colors ${
                tab === item.id
                  ? "border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {tab === "student_t" && (
            <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
              <div className="flex items-center justify-between text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-z)] font-semibold">
                  Degrees of Freedom (ν = n − 1)
                </span>
                <span className="tabular-nums font-semibold">ν = {nuT}</span>
              </div>
              <input
                type="range"
                min={1}
                max={40}
                step={1}
                value={nuT}
                onChange={(e) => {
                  setNuT(Number(e.target.value));
                  clearSamples();
                }}
                aria-label="Student t degrees of freedom nu"
                className="w-full accent-[#029091] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] font-tabular-mono text-[var(--text-muted)]">
                <span>Try ν=1 (fat tails) vs ν=30</span>
                <button
                  type="button"
                  onClick={() => setShowNormalRef((v) => !v)}
                  className="text-[var(--math-ink-grid)] underline cursor-pointer"
                >
                  {showNormalRef ? "Hide N(0,1)" : "Show N(0,1)"}
                </button>
              </div>
            </label>
          )}

          {tab === "chi2" && (
            <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
              <div className="flex items-center justify-between text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-z)] font-semibold">
                  Squared Z Terms (df k)
                </span>
                <span className="tabular-nums font-semibold">k = {kChi2}</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={kChi2}
                onChange={(e) => {
                  setKChi2(Number(e.target.value));
                  clearSamples();
                }}
                aria-label="Chi-square degrees of freedom k"
                className="w-full accent-[#029091] cursor-pointer"
              />
              <span className="text-[11px] font-tabular-mono text-[var(--text-muted)] block">
                Right-skew vanishes slowly as k grows (CLT on Σ Zᵢ²)
              </span>
            </label>
          )}

          {tab === "fisher_f" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-x)] font-semibold">Num df₁</span>
                  <span className="tabular-nums font-semibold">{d1F}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={d1F}
                  onChange={(e) => {
                    setD1F(Number(e.target.value));
                    clearSamples();
                  }}
                  aria-label="Numerator degrees of freedom d1"
                  className="w-full accent-[#8D9FCE] cursor-pointer"
                />
              </label>

              <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-y)] font-semibold">Den df₂</span>
                  <span className="tabular-nums font-semibold">{d2F}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={30}
                  step={1}
                  value={d2F}
                  onChange={(e) => {
                    setD2F(Number(e.target.value));
                    clearSamples();
                  }}
                  aria-label="Denominator degrees of freedom d2"
                  className="w-full accent-[#96B898] cursor-pointer"
                />
              </label>
            </div>
          )}

          {/* Sampling Trigger Bar */}
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => drawSamples(1)}
                className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--math-ink-z)] text-xs font-tabular-mono cursor-pointer"
              >
                Sample 1 Draw
              </button>
              <button
                type="button"
                onClick={() => drawSamples(250)}
                className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--math-ink-z)] text-xs font-tabular-mono cursor-pointer"
              >
                +250 Draws
              </button>
              <button
                type="button"
                onClick={() => setIsStreaming((v) => !v)}
                className="px-2.5 py-1 border border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] cursor-pointer"
              >
                {isStreaming ? "Pause" : "Animate Stream"}
              </button>
              {samples.length > 0 && (
                <button
                  type="button"
                  onClick={clearSamples}
                  className="px-2 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[var(--text-muted)] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="text-[11px] font-tabular-mono tabular-nums text-[var(--text-secondary)] truncate">
              {lastRecipe || `Click Sample 1 Draw to generate raw Z ~ N(0,1) building blocks`}
            </div>
          </div>

          {/* Governing Equation */}
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
            <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
              <KaTeXMath math={theoreticalSummary.formula} block />
            </div>
            <div className="flex items-center justify-between text-xs font-tabular-mono tabular-nums text-[var(--text-secondary)]">
              <span>Mean: {theoreticalSummary.mean}</span>
              <span>Var: {theoreticalSummary.variance}</span>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Exact PDF + Empirical Z-Constructed Histogram */}
        <div className="lg:col-span-7 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--text-secondary)]">
              Analytical PDF (Solid Teal) vs. Live Z-Built Histogram ({samples.length} draws)
            </span>
            {tab === "student_t" && showNormalRef && (
              <span className="text-[var(--math-ink-grid)]">Dashed Gold = N(0, 1)</span>
            )}
          </div>

          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            role="img"
            aria-label={`Sampling distribution density plot for ${tab} with ${samples.length} empirical draws simulated from standard Normal variables.`}
            className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
          >
            {/* Axis */}
            <line
              x1={padL}
              x2={svgW - padR}
              y1={padT + plotH}
              y2={padT + plotH}
              stroke="var(--border-strong)"
              strokeWidth={1.2}
            />

            {/* Empirical Bars */}
            {plotData.bins.map((bin, i) => {
              if (bin.density <= 0) return null;
              const x0 = plotData.toX(bin.x0);
              const x1 = plotData.toX(bin.x1);
              const yTop = plotData.toY(bin.density);
              return (
                <rect
                  key={i}
                  x={x0}
                  y={yTop}
                  width={Math.max(1, x1 - x0 - 0.5)}
                  height={Math.max(0.5, padT + plotH - yTop)}
                  fill="#8D9FCE"
                  fillOpacity={0.38}
                  stroke="#8D9FCE"
                  strokeWidth={0.6}
                />
              );
            })}

            {/* Standard Normal Reference (dashed gold on t-tab) */}
            {tab === "student_t" && showNormalRef && plotData.refPath && (
              <path
                d={plotData.refPath}
                fill="none"
                stroke="#AAA36D"
                strokeWidth={1.8}
                strokeDasharray="5 3"
              />
            )}

            {/* Main Exact PDF Curve */}
            <path d={plotData.mainPath} fill="none" stroke="#029091" strokeWidth={2.4} />

            {/* X Ticks */}
            {Array.from({ length: 6 }, (_, i) => {
              const xv = domain.xMin + (i / 5) * (domain.xMax - domain.xMin);
              const px = plotData.toX(xv);
              return (
                <g key={i}>
                  <line
                    x1={px}
                    x2={px}
                    y1={padT + plotH}
                    y2={padT + plotH + 4}
                    stroke="var(--border-strong)"
                    strokeWidth={1}
                  />
                  <text
                    x={px}
                    y={padT + plotH + 17}
                    textAnchor="middle"
                    fontSize={9.5}
                    fontFamily="JetBrains Mono, monospace"
                    fill="var(--text-secondary)"
                  >
                    {xv.toFixed(1)}
                  </text>
                </g>
              );
            })}
          </svg>

          <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
            {tab === "student_t"
              ? "Notice how at ν = 1–4, Student's t has visibly fatter tails than the dashed N(0, 1) bell because dividing by a noisy small-sample standard deviation s occasionally creates huge ratios! Slide ν → 30 to watch the curves fuse together."
              : tab === "chi2"
              ? "Every sample above is generated solely by drawing k independent Standard Normal numbers Zᵢ and summing Zᵢ². Because squares cannot be negative, χ² starts at 0 and leans right."
              : "Every F sample compares two independent sample variances scaled by their true variance—forming the exact engine behind One-Way ANOVA in Module S.5!"}
          </p>
        </div>
      </div>
    </section>
  );
}
