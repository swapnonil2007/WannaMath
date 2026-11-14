"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";
import {
  computeFiveNumberSummary,
  createSeededRng,
  sampleExcessKurtosis,
  sampleMean,
  sampleNormal,
  sampleSkewness,
  sampleStdDev,
  sampleVariance,
} from "./statMath";

type SpreadPresetId = "balanced" | "outlier" | "tight" | "skewed";

interface SpreadPreset {
  id: SpreadPresetId;
  label: string;
  points: number[];
  note: string;
}

const SPREAD_PRESETS: SpreadPreset[] = [
  {
    id: "balanced",
    label: "Balanced (n = 8)",
    points: [6.5, 8.0, 9.0, 9.5, 10.5, 11.0, 12.0, 13.5],
    note: "Each square has side |xᵢ − x̄| and area (xᵢ − x̄)². Variance s² averages these areas (dividing by n − 1); SD s is the Teal reference square's side.",
  },
  {
    id: "outlier",
    label: "1.5×IQR Outlier Trap",
    points: [7.0, 7.5, 8.0, 8.5, 8.5, 9.0, 9.5, 18.5],
    note: "One distant point at 18.5 creates a huge Persimmon deviation square that inflates SD s, while Q1, Median, and Q3 (IQR) stay rock-steady!",
  },
  {
    id: "tight",
    label: "Tight Precision",
    points: [8.8, 9.2, 9.6, 10.0, 10.1, 10.4, 10.7, 11.2],
    note: "Low scatter produces tiny deviation squares, narrow IQR box, and small standard deviation.",
  },
  {
    id: "skewed",
    label: "Right-Skewed Spread",
    points: [4.5, 5.0, 5.5, 6.0, 7.0, 9.5, 13.0, 16.5],
    note: "Notice the asymmetric right whisker and positive skewness γ₁ > 0 stretching the upper tail.",
  },
];

const TRUE_POP_MU = 10;
const TRUE_POP_SIGMA = 2; // sigma^2 = 4.00
const TRUE_POP_VAR = TRUE_POP_SIGMA * TRUE_POP_SIGMA;

interface SimRun {
  sample: number[];
  sampleMeanVal: number;
  varN: number;
  varN1: number;
  runningAvgN: number;
  runningAvgN1: number;
}

function fmt(n: number, digits = 2): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.1.3 — Deviation Squares, Tukey Boxplot & Bessel (n - 1) Simulator.
 * Makes variance tangible as literal average square area and proves empirically
 * why sample variance divides by (n - 1) instead of n.
 */
export function SpreadBoxplotBesselLab() {
  const [presetId, setPresetId] = useState<SpreadPresetId>("balanced");
  const [points, setPoints] = useState<number[]>(SPREAD_PRESETS[0].points);
  const [divisorMode, setDivisorMode] = useState<"n-1" | "n">("n-1");

  // Bessel Simulator State
  const [simN, setSimN] = useState<number>(3);
  const [simSeed, setSimSeed] = useState<number>(104729);
  const [simRuns, setSimRuns] = useState<SimRun[]>(() => {
    const rng = createSeededRng(104729);
    const initial: SimRun[] = [];
    let sumN = 0;
    let sumN1 = 0;
    for (let k = 0; k < 15; k++) {
      const sample = Array.from({ length: 3 }, () =>
        sampleNormal(rng, TRUE_POP_MU, TRUE_POP_SIGMA)
      );
      const vN = sampleVariance(sample, 0);
      const vN1 = sampleVariance(sample, 1);
      sumN += vN;
      sumN1 += vN1;
      initial.push({
        sample,
        sampleMeanVal: sampleMean(sample),
        varN: vN,
        varN1: vN1,
        runningAvgN: sumN / (k + 1),
        runningAvgN1: sumN1 / (k + 1),
      });
    }
    return initial;
  });

  const activePreset = useMemo(
    () => SPREAD_PRESETS.find((p) => p.id === presetId) ?? SPREAD_PRESETS[0],
    [presetId]
  );

  const selectPreset = (id: SpreadPresetId) => {
    const p = SPREAD_PRESETS.find((item) => item.id === id) ?? SPREAD_PRESETS[0];
    setPresetId(id);
    setPoints([...p.points]);
  };

  const stats = useMemo(() => {
    const mean = sampleMean(points);
    const varUnbiased = sampleVariance(points, 1);
    const varBiased = sampleVariance(points, 0);
    const sdUnbiased = sampleStdDev(points, 1);
    const sdBiased = sampleStdDev(points, 0);
    const fiveNum = computeFiveNumberSummary(points);
    const skew = sampleSkewness(points);
    const kurt = sampleExcessKurtosis(points);

    return {
      mean,
      varUnbiased,
      varBiased,
      sdUnbiased,
      sdBiased,
      activeVar: divisorMode === "n-1" ? varUnbiased : varBiased,
      activeSd: divisorMode === "n-1" ? sdUnbiased : sdBiased,
      fiveNum,
      skew,
      kurt,
    };
  }, [points, divisorMode]);

  const handleAddPoint = (worldX: number) => {
    const clamped = Math.max(0.5, Math.min(19.5, Number(worldX.toFixed(1))));
    setPoints((prev) => [...prev, clamped]);
  };

  const appendSamples = (count: number, overrideN?: number) => {
    const nVal = overrideN ?? simN;
    setSimRuns((prev) => {
      const baseList = overrideN !== undefined ? [] : prev;
      const rng = createSeededRng(simSeed + baseList.length * 7919 + nVal * 31);
      let sumN =
        baseList.length > 0
          ? baseList[baseList.length - 1].runningAvgN * baseList.length
          : 0;
      let sumN1 =
        baseList.length > 0
          ? baseList[baseList.length - 1].runningAvgN1 * baseList.length
          : 0;
      const next = [...baseList];
      for (let i = 0; i < count; i++) {
        const sample = Array.from({ length: nVal }, () =>
          sampleNormal(rng, TRUE_POP_MU, TRUE_POP_SIGMA)
        );
        const vN = sampleVariance(sample, 0);
        const vN1 = sampleVariance(sample, 1);
        sumN += vN;
        sumN1 += vN1;
        const totalCount = next.length + 1;
        next.push({
          sample,
          sampleMeanVal: sampleMean(sample),
          varN: vN,
          varN1: vN1,
          runningAvgN: sumN / totalCount,
          runningAvgN1: sumN1 / totalCount,
        });
      }
      return next;
    });
    setSimSeed((s) => s + count * 17 + 1);
  };

  const handleSimNChange = (newN: number) => {
    setSimN(newN);
    appendSamples(15, newN);
  };

  const latestSim = simRuns[simRuns.length - 1];
  const expectedBiased = TRUE_POP_VAR * ((simN - 1) / simN);

  return (
    <section
      id="spread-boxplot-bessel-simulator"
      aria-label="Deviation Squares, Tukey Boxplot and Bessel n-1 Simulator"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 sm:p-6 space-y-6"
    >
      {/* Header & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
            LAB S.1.3 • MEASURING SPREAD &amp; DEGREES OF FREEDOM
          </span>
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
            Deviation Squares, Tukey Boxplots &amp; Bessel&apos;s (n − 1) Simulator
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif">
            {activePreset.note}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SPREAD_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPreset(p.id)}
              className={`px-3 py-1.5 text-xs font-tabular-mono border transition-colors cursor-pointer ${
                presetId === p.id
                  ? "bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-strong)] font-semibold"
                  : "bg-[var(--bg-panel-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Part 1: Deviation Squares & Aligned Boxplot */}
      <div className="space-y-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-tabular-mono font-semibold text-[var(--text-primary)] block">
              1. Geometric Variance Squares &amp; Aligned 1.5×IQR Boxplot (Click axis to add point)
            </span>
            <span className="text-[11px] font-tabular-mono text-[var(--text-muted)]">
              Squares above axis show (xᵢ − x̄)² • Boxplot below shows Q1, Median, Q3, 1.5×IQR fences &amp; outliers
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              <button
                type="button"
                onClick={() => setDivisorMode("n-1")}
                className={`px-2.5 py-1 text-xs font-tabular-mono cursor-pointer ${
                  divisorMode === "n-1"
                    ? "bg-[var(--bg-panel-elevated)] text-[var(--math-ink-y)] font-semibold"
                    : "text-[var(--text-muted)]"
                }`}
              >
                Sample ÷(n−1)
              </button>
              <button
                type="button"
                onClick={() => setDivisorMode("n")}
                className={`px-2.5 py-1 text-xs font-tabular-mono cursor-pointer ${
                  divisorMode === "n"
                    ? "bg-[var(--bg-panel-elevated)] text-[var(--math-ink-upper)] font-semibold"
                    : "text-[var(--text-muted)]"
                }`}
              >
                Biased ÷n
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                setPoints((prev) => (prev.length > 3 ? prev.slice(0, -1) : prev))
              }
              className="px-2.5 py-1 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] hover:border-[var(--border-strong)] cursor-pointer"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => selectPreset(presetId)}
              className="px-2.5 py-1 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] hover:border-[var(--border-strong)] cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Equal aspect-ratio plane [0,20] x [-5.5, 9.5] so |x_i - xbar| makes true geometric squares */}
        <SvgCoordinatePlane2D
          xRange={[0, 20]}
          yRange={[-5.2, 8.2]}
          width={900}
          height={360}
          padding={36}
          xLabel="x"
          yLabel="|x−x̄|"
          gridDivisions={10}
          ariaLabel="Geometric variance squares of side |x_i - x_bar| drawn above an aligned Tukey boxplot showing Q1, median, Q3, whiskers, and 1.5xIQR outliers"
          onSelectPoint={handleAddPoint}
          className="w-full h-80 border border-[var(--border-subtle)] bg-[var(--bg-panel)] select-none"
        >
          {({ toSvgX, toSvgY, innerWidth, innerHeight }) => {
            const xScale = innerWidth / 20;
            const yScale = innerHeight / 13.4;
            const baseAxisY = toSvgY(0);
            const meanSvgX = toSvgX(stats.mean);
            const { fiveNum } = stats;

            return (
              <g>
                {/* Deviation Squares above y = 0 */}
                {points.map((x, idx) => {
                  const dev = x - stats.mean;
                  const absDev = Math.abs(dev);
                  const wPx = absDev * xScale;
                  const hPx = absDev * xScale; // True geometric pixel square!
                  const leftPx = dev >= 0 ? meanSvgX : meanSvgX - wPx;
                  const topPx = Math.max(12, baseAxisY - hPx);
                  const isOutlier =
                    x < fiveNum.lowerFence || x > fiveNum.upperFence;
                  const color = isOutlier ? "#D35323" : "#8D9FCE";

                  return (
                    <g key={`${idx}-${x}`}>
                      <rect
                        x={leftPx}
                        y={topPx}
                        width={Math.max(1, wPx)}
                        height={Math.max(1, baseAxisY - topPx)}
                        fill={color}
                        fillOpacity={isOutlier ? 0.18 : 0.1}
                        stroke={color}
                        strokeOpacity={0.75}
                        strokeWidth={1.2}
                      />
                      <circle
                        cx={toSvgX(x)}
                        cy={baseAxisY}
                        r={4.2}
                        fill={color}
                        stroke="#1E1F22"
                        strokeWidth={1.1}
                      />
                    </g>
                  );
                })}

                {/* Average Deviation Square (Side = active SD s) */}
                {(() => {
                  const sidePx = stats.activeSd * xScale;
                  const topPx = Math.max(12, baseAxisY - sidePx);
                  return (
                    <rect
                      x={meanSvgX}
                      y={topPx}
                      width={Math.max(1, sidePx)}
                      height={Math.max(1, baseAxisY - topPx)}
                      fill="#029091"
                      fillOpacity={0.14}
                      stroke="#029091"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                    />
                  );
                })()}

                {/* Mean Fulcrum Line & Label */}
                <line
                  x1={meanSvgX}
                  y1={toSvgY(7.8)}
                  x2={meanSvgX}
                  y2={toSvgY(-1.2)}
                  stroke="#029091"
                  strokeWidth={2}
                />
                <text
                  x={meanSvgX}
                  y={toSvgY(7.9)}
                  textAnchor="middle"
                  fill="var(--math-ink-z)"
                  fontSize="10.5"
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                >
                  x̄={fmt(stats.mean, 2)} | SD={fmt(stats.activeSd, 2)}
                </text>

                {/* SD Bracket [x̄ - s, x̄ + s] at y = -0.9 */}
                <line
                  x1={toSvgX(Math.max(0, stats.mean - stats.activeSd))}
                  y1={toSvgY(-0.9)}
                  x2={toSvgX(Math.min(20, stats.mean + stats.activeSd))}
                  y2={toSvgY(-0.9)}
                  stroke="#029091"
                  strokeWidth={2.5}
                />

                {/* Tukey Boxplot Band at y = -3.1 */}
                {(() => {
                  const boxMidY = toSvgY(-3.1);
                  const boxHalfH = 1.15 * yScale;
                  const q1X = toSvgX(fiveNum.q1);
                  const medX = toSvgX(fiveNum.median);
                  const q3X = toSvgX(fiveNum.q3);
                  const lowWX = toSvgX(fiveNum.lowerWhisker);
                  const highWX = toSvgX(fiveNum.upperWhisker);

                  return (
                    <g>
                      {/* Whisker Stems */}
                      <line
                        x1={lowWX}
                        y1={boxMidY}
                        x2={q1X}
                        y2={boxMidY}
                        stroke="#96B898"
                        strokeWidth={2}
                      />
                      <line
                        x1={q3X}
                        y1={boxMidY}
                        x2={highWX}
                        y2={boxMidY}
                        stroke="#96B898"
                        strokeWidth={2}
                      />
                      {/* Whisker Caps */}
                      <line
                        x1={lowWX}
                        y1={boxMidY - boxHalfH * 0.55}
                        x2={lowWX}
                        y2={boxMidY + boxHalfH * 0.55}
                        stroke="#96B898"
                        strokeWidth={2}
                      />
                      <line
                        x1={highWX}
                        y1={boxMidY - boxHalfH * 0.55}
                        x2={highWX}
                        y2={boxMidY + boxHalfH * 0.55}
                        stroke="#96B898"
                        strokeWidth={2}
                      />

                      {/* IQR Box */}
                      <rect
                        x={q1X}
                        y={boxMidY - boxHalfH}
                        width={Math.max(2, q3X - q1X)}
                        height={boxHalfH * 2}
                        fill="#FBEAA4"
                        fillOpacity={0.28}
                        stroke="#AAA36D"
                        strokeWidth={2}
                      />

                      {/* Median Line inside Box */}
                      <line
                        x1={medX}
                        y1={boxMidY - boxHalfH}
                        x2={medX}
                        y2={boxMidY + boxHalfH}
                        stroke="#AAA36D"
                        strokeWidth={3}
                      />

                      {/* 1.5xIQR Fence Ticks */}
                      {[fiveNum.lowerFence, fiveNum.upperFence].map((f, idx) =>
                        f >= 0 && f <= 20 ? (
                          <line
                            key={idx}
                            x1={toSvgX(f)}
                            y1={boxMidY - boxHalfH * 1.15}
                            x2={toSvgX(f)}
                            y2={boxMidY + boxHalfH * 1.15}
                            stroke="#B95869"
                            strokeDasharray="3 2"
                            strokeWidth={1.3}
                          />
                        ) : null
                      )}

                      {/* Outlier Diamonds */}
                      {fiveNum.outliers.map((o, idx) => {
                        const ox = toSvgX(o);
                        return (
                          <polygon
                            key={idx}
                            points={`${ox},${boxMidY - 6} ${ox + 6},${boxMidY} ${ox},${boxMidY + 6} ${ox - 6},${boxMidY}`}
                            fill="#D35323"
                            stroke="#1E1F22"
                            strokeWidth={1}
                          />
                        );
                      })}

                      <text
                        x={toSvgX(0.3)}
                        y={boxMidY - boxHalfH - 4}
                        fill="var(--text-muted)"
                        fontSize="9.5"
                        fontFamily="var(--font-mono)"
                      >
                        IQR BOXPLOT (Q1={fmt(fiveNum.q1, 1)}, Med={fmt(fiveNum.median, 1)}, Q3={fmt(fiveNum.q3, 1)})
                      </text>
                    </g>
                  );
                })()}

                {/* Axis Number Ticks */}
                {[0, 4, 8, 12, 16, 20].map((t) => (
                  <text
                    key={t}
                    x={toSvgX(t)}
                    y={baseAxisY + 13}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="9.5"
                    fontFamily="var(--font-mono)"
                  >
                    {t}
                  </text>
                ))}
              </g>
            );
          }}
        </SvgCoordinatePlane2D>

        {/* Telemetry Readout Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
            <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
              {divisorMode === "n-1" ? "Sample Var s² (n−1)" : "Biased Var σ̂² (n)"}
            </span>
            <span className="text-sm font-tabular-mono font-semibold text-[var(--math-ink-z)]">
              {fmt(stats.activeVar, 2)}
            </span>
          </div>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
            <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
              Std. Dev. ({divisorMode === "n-1" ? "s" : "σ̂"})
            </span>
            <span className="text-sm font-tabular-mono font-semibold text-[var(--math-ink-x)]">
              {fmt(stats.activeSd, 2)}
            </span>
          </div>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
            <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
              IQR (Q3 − Q1)
            </span>
            <span className="text-sm font-tabular-mono font-semibold text-[var(--math-ink-grid)]">
              {fmt(stats.fiveNum.iqr, 2)}
            </span>
          </div>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
            <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
              Full Range
            </span>
            <span className="text-sm font-tabular-mono font-semibold text-[var(--text-primary)]">
              {fmt(stats.fiveNum.max - stats.fiveNum.min, 2)}
            </span>
          </div>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
            <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
              Skewness (γ₁)
            </span>
            <span className="text-sm font-tabular-mono font-semibold text-[var(--math-ink-sweep)]">
              {stats.skew >= 0 ? "+" : ""}
              {fmt(stats.skew, 2)}
            </span>
          </div>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
            <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
              Excess Kurtosis (γ₂)
            </span>
            <span className="text-sm font-tabular-mono font-semibold text-[var(--math-ink-lower)]">
              {stats.kurt >= 0 ? "+" : ""}
              {fmt(stats.kurt, 2)}
            </span>
          </div>
        </div>
      </div>

      {/* Part 2: Bessel's (n - 1) Bias Simulator */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <div className="space-y-1">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
              2. BESSEL&apos;S CORRECTION SIMULATOR • WHY WE DIVIDE BY (n − 1)
            </span>
            <p className="text-xs font-math-serif text-[var(--text-secondary)]">
              True population is <KaTeXMath math="\mathcal{N}(10,\; \sigma^2 = 4.00)" />. Because sample mean{" "}
              <KaTeXMath math="\bar{x}" /> hugs its own sample closer than true{" "}
              <KaTeXMath math="\mu" />, dividing by <KaTeXMath math="n" /> systematically underestimates{" "}
              <KaTeXMath math="\sigma^2" /> by factor <KaTeXMath math="(n-1)/n" />!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => appendSamples(1)}
              className="px-3 py-1.5 text-xs font-tabular-mono border border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] cursor-pointer"
            >
              Draw 1 Sample
            </button>
            <button
              type="button"
              onClick={() => appendSamples(50)}
              className="px-3 py-1.5 text-xs font-tabular-mono border border-[var(--math-ink-y)] bg-[var(--bg-panel)] text-[var(--math-ink-y)] hover:bg-[var(--bg-panel-elevated)] font-semibold cursor-pointer"
            >
              Simulate +50
            </button>
            <button
              type="button"
              onClick={() => appendSamples(250)}
              className="px-3 py-1.5 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] hover:border-[var(--border-strong)] cursor-pointer"
            >
              +250
            </button>
            <button
              type="button"
              onClick={() => appendSamples(15, simN)}
              className="px-2.5 py-1.5 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Convergence Chart */}
          <div className="lg:col-span-8 space-y-2">
            <div className="flex flex-wrap items-center justify-between text-xs font-tabular-mono">
              <span className="text-[var(--text-secondary)]">
                Running Average Variance over {simRuns.length} Samples (n = {simN} each)
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-[var(--math-ink-grid)]">┆ True σ² = 4.00</span>
                <span className="text-[var(--math-ink-y)]">━ Avg s² (÷ n−1)</span>
                <span className="text-[var(--math-ink-upper)]">━ Avg σ̂² (÷ n)</span>
              </div>
            </div>

            <SvgCoordinatePlane2D
              xRange={[1, Math.max(15, simRuns.length)]}
              yRange={[0, 7.5]}
              width={600}
              height={210}
              padding={34}
              xLabel="Runs"
              yLabel="Avg Var"
              ariaLabel="Convergence chart comparing running average of unbiased sample variance divided by n-1 against biased variance divided by n"
              className="w-full h-52 border border-[var(--border-subtle)] bg-[var(--bg-panel)] select-none"
            >
              {({ toSvgX, toSvgY }) => {
                const maxRun = Math.max(15, simRuns.length);
                const pathN1 = simRuns
                  .map(
                    (r, i) =>
                      `${i === 0 ? "M" : "L"} ${toSvgX(i + 1).toFixed(1)} ${toSvgY(Math.min(7.3, r.runningAvgN1)).toFixed(1)}`
                  )
                  .join(" ");
                const pathN = simRuns
                  .map(
                    (r, i) =>
                      `${i === 0 ? "M" : "L"} ${toSvgX(i + 1).toFixed(1)} ${toSvgY(Math.min(7.3, r.runningAvgN)).toFixed(1)}`
                  )
                  .join(" ");

                return (
                  <g>
                    {/* True sigma^2 = 4.00 line */}
                    <line
                      x1={toSvgX(1)}
                      y1={toSvgY(TRUE_POP_VAR)}
                      x2={toSvgX(maxRun)}
                      y2={toSvgY(TRUE_POP_VAR)}
                      stroke="#AAA36D"
                      strokeDasharray="5 3"
                      strokeWidth={1.8}
                    />
                    {/* Expected Biased line = 4 * (n-1)/n */}
                    <line
                      x1={toSvgX(1)}
                      y1={toSvgY(expectedBiased)}
                      x2={toSvgX(maxRun)}
                      y2={toSvgY(expectedBiased)}
                      stroke="#B95869"
                      strokeDasharray="2 3"
                      strokeWidth={1.2}
                    />

                    {pathN1 && (
                      <path d={pathN1} fill="none" stroke="#96B898" strokeWidth={2.3} />
                    )}
                    {pathN && (
                      <path d={pathN} fill="none" stroke="#B95869" strokeWidth={2.1} />
                    )}

                    {[0, 2, 4, 6].map((v) => (
                      <text
                        key={v}
                        x={toSvgX(1) - 6}
                        y={toSvgY(v) + 3}
                        textAnchor="end"
                        fill="var(--text-muted)"
                        fontSize="9.5"
                        fontFamily="var(--font-mono)"
                      >
                        {v}
                      </text>
                    ))}
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>
          </div>

          {/* Sample Size Slider & Running Readouts */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
              <div className="flex justify-between text-xs font-tabular-mono">
                <label htmlFor="s13-sim-n" className="text-[var(--text-secondary)]">
                  Sample Size <span className="text-[var(--math-ink-x)]">n</span>
                </label>
                <span className="font-semibold text-[var(--text-primary)]">
                  n = {simN} (df = {simN - 1})
                </span>
              </div>
              <input
                id="s13-sim-n"
                type="range"
                min={2}
                max={12}
                step={1}
                value={simN}
                onChange={(e) => handleSimNChange(Number(e.target.value))}
                className="w-full accent-[#96B898] cursor-pointer"
              />
              <p className="text-[11px] font-math-serif text-[var(--text-muted)]">
                At <KaTeXMath math={`n=${simN}`} />, dividing by <KaTeXMath math="n" /> loses{" "}
                <span className="font-tabular-mono text-[var(--math-ink-upper)] font-semibold">
                  {Math.round((1 / simN) * 100)}%
                </span>{" "}
                of true variance (<KaTeXMath math={`E[\\hat{\\sigma}^2]=${fmt(expectedBiased, 2)}`} />).
              </p>
            </div>

            {latestSim && (
              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2 text-xs font-tabular-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">True Pop. σ²:</span>
                  <span className="text-[var(--math-ink-grid)] font-semibold">
                    {fmt(TRUE_POP_VAR, 2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--math-ink-y)]">Running Avg (÷ n−1):</span>
                  <span className="text-[var(--math-ink-y)] font-semibold">
                    {fmt(latestSim.runningAvgN1, 3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--math-ink-upper)]">Running Avg (÷ n):</span>
                  <span className="text-[var(--math-ink-upper)] font-semibold">
                    {fmt(latestSim.runningAvgN, 3)}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                  Latest sample x̄ = {fmt(latestSim.sampleMeanVal, 2)} (vs μ = 10.00)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
