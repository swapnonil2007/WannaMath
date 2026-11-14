"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";
import {
  buildHistogramBins,
  gaussianKernelDensity,
  sampleMean,
  sampleMedian,
  sampleSkewness,
  sampleStdDev,
} from "./statMath";

type PresetId = "exam" | "commute" | "income" | "latency";
type YScaleMode = "density" | "count";

interface PresetDataset {
  id: PresetId;
  label: string;
  unit: string;
  dataType: string;
  xRange: [number, number];
  defaultBins: number;
  defaultBw: number;
  values: number[];
  story: string;
}

const PRESETS: PresetDataset[] = [
  {
    id: "exam",
    label: "Exam Scores (Symmetric)",
    unit: "pts",
    dataType: "Continuous / Ratio",
    xRange: [30, 100],
    defaultBins: 10,
    defaultBw: 4.5,
    values: [
      51, 55, 58, 60, 62, 63, 64, 66, 67, 68, 68, 69, 70, 70, 71, 71, 72, 72,
      73, 73, 74, 74, 75, 75, 76, 77, 78, 79, 80, 81, 83, 84, 86, 89, 92,
    ],
    story:
      "Most students cluster symmetrically around 72 pts with balanced tails on both sides.",
  },
  {
    id: "commute",
    label: "Commute Times (Bimodal)",
    unit: "min",
    dataType: "Continuous / Ratio",
    xRange: [0, 60],
    defaultBins: 12,
    defaultBw: 2.8,
    values: [
      8, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 18, 19, 21, 24, 34,
      36, 37, 38, 39, 40, 40, 41, 41, 42, 43, 43, 44, 45, 46, 48, 51,
    ],
    story:
      "Two distinct groups—local cyclists (~14 min) and highway commuters (~41 min)—appear clearly at k = 12, but vanish into one flat lump if k = 3!",
  },
  {
    id: "income",
    label: "Household Income (Right-Skewed)",
    unit: "$k",
    dataType: "Continuous / Ratio",
    xRange: [15, 165],
    defaultBins: 11,
    defaultBw: 9.0,
    values: [
      24, 28, 30, 32, 34, 35, 36, 38, 39, 41, 42, 43, 44, 45, 46, 48, 50, 52,
      54, 56, 58, 61, 65, 68, 72, 76, 82, 88, 95, 104, 115, 128, 142, 155,
    ],
    story:
      "A crowded lower-middle cluster plus a long right tail of high earners pulls Mean noticeably above Median.",
  },
  {
    id: "latency",
    label: "API Latency (Spike + Outliers)",
    unit: "ms",
    dataType: "Continuous / Ratio",
    xRange: [0, 80],
    defaultBins: 14,
    defaultBw: 3.2,
    values: [
      9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 17, 18,
      19, 21, 22, 24, 27, 30, 35, 42, 56, 68, 74,
    ],
    story:
      "Fast cache hits pile up near 12 ms while occasional garbage-collection pauses stretch a heavy tail toward 74 ms.",
  },
];

function fmt(n: number, digits = 2): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.1.1 — Interactive Histogram Binning, Density & KDE Shape Explorer.
 * Helps beginners understand bin width sensitivity, frequency vs. area-1 density,
 * KDE smoothing, rug plots, and cumulative ogives.
 */
export function HistogramBinningShapeLab() {
  const [presetId, setPresetId] = useState<PresetId>("commute");
  const [customPoints, setCustomPoints] = useState<number[]>([]);
  const [clearedBase, setClearedBase] = useState<boolean>(false);
  const [numBins, setNumBins] = useState<number>(12);
  const [yScaleMode, setYScaleMode] = useState<YScaleMode>("density");
  const [showKde, setShowKde] = useState<boolean>(true);
  const [bandwidth, setBandwidth] = useState<number>(2.8);
  const [showRug, setShowRug] = useState<boolean>(true);

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId]
  );

  const handleSelectPreset = (id: PresetId) => {
    const next = PRESETS.find((p) => p.id === id) ?? PRESETS[0];
    setPresetId(id);
    setCustomPoints([]);
    setClearedBase(false);
    setNumBins(next.defaultBins);
    setBandwidth(next.defaultBw);
  };

  const basePoints = clearedBase ? [] : preset.values;
  const allPoints = useMemo(
    () => [...basePoints, ...customPoints],
    [basePoints, customPoints]
  );

  const [xMin, xMax] = preset.xRange;
  const xSpan = xMax - xMin;
  const maxBw = Number((xSpan / 4).toFixed(1));
  const minBw = Number(Math.max(0.4, xSpan / 45).toFixed(1));

  const analytics = useMemo(() => {
    const { bins, binWidth } = buildHistogramBins(allPoints, numBins, xMin, xMax);
    const gridSteps = 120;
    const gridX = Array.from(
      { length: gridSteps + 1 },
      (_, i) => xMin + (i / gridSteps) * xSpan
    );
    const kdeDensity = gaussianKernelDensity(allPoints, gridX, bandwidth);
    const kdeY =
      yScaleMode === "density"
        ? kdeDensity
        : kdeDensity.map((d) => d * allPoints.length * binWidth);

    const maxBarY = bins.reduce(
      (acc, b) => Math.max(acc, yScaleMode === "density" ? b.density : b.count),
      0
    );
    const maxKdeY = showKde
      ? kdeY.reduce((acc, v) => Math.max(acc, v), 0)
      : 0;
    const yMax = Math.max(
      yScaleMode === "density" ? 0.04 : 4,
      Math.max(maxBarY, maxKdeY) * 1.18
    );

    const totalArea = bins.reduce((acc, b) => acc + b.density * binWidth, 0);
    const mean = sampleMean(allPoints);
    const median = sampleMedian(allPoints);
    const sd = sampleStdDev(allPoints, 1);
    const skew = sampleSkewness(allPoints);

    const sorted = [...allPoints].sort((a, b) => a - b);
    const ecdfPoints = sorted.map((val, idx) => ({
      x: val,
      y: (idx + 1) / sorted.length,
    }));

    return {
      bins,
      binWidth,
      gridX,
      kdeY,
      yMax,
      totalArea,
      mean,
      median,
      sd,
      skew,
      ecdfPoints,
    };
  }, [allPoints, numBins, xMin, xMax, xSpan, bandwidth, yScaleMode, showKde]);

  const handlePlotClick = (worldX: number) => {
    const rounded = Number(worldX.toFixed(1));
    setCustomPoints((prev) => [...prev, rounded]);
  };

  const shapeLabel = useMemo(() => {
    if (allPoints.length < 4) return "Add ≥ 4 points to classify shape";
    if (presetId === "commute" && customPoints.length === 0 && !clearedBase) {
      return "Bimodal (Two Distinct Peaks)";
    }
    if (analytics.skew > 0.55) return "Right-Skewed (Positive Tail)";
    if (analytics.skew < -0.55) return "Left-Skewed (Negative Tail)";
    return "Roughly Symmetric";
  }, [allPoints.length, analytics.skew, presetId, customPoints.length, clearedBase]);

  return (
    <section
      id="histogram-binning-kde-explorer"
      aria-label="Interactive Histogram Binning, Density and KDE Shape Explorer"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 sm:p-6 space-y-6"
    >
      {/* Header & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
            LAB S.1.1 • VISUALIZING EMPIRICAL DISTRIBUTIONS
          </span>
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
            Histogram Binning, Density Scaling &amp; KDE Shape Explorer
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif">
            {preset.story} <strong>Click anywhere inside the left plot</strong>{" "}
            to drop custom observations into the sample.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => {
            const active = p.id === presetId && !clearedBase;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`px-3 py-1.5 text-xs font-tabular-mono border transition-colors cursor-pointer ${
                  active
                    ? "bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-strong)] font-semibold"
                    : "bg-[var(--bg-panel-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4">
        {/* Bin Count k */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <label htmlFor="s11-bins" className="text-[var(--text-secondary)]">
              Bin Count <span className="text-[var(--math-ink-x)]">k</span>
            </label>
            <span className="text-[var(--text-primary)] font-semibold">
              {numBins} bins (Δx = {fmt(analytics.binWidth, 1)} {preset.unit})
            </span>
          </div>
          <input
            id="s11-bins"
            type="range"
            min={3}
            max={24}
            step={1}
            value={numBins}
            onChange={(e) => setNumBins(Number(e.target.value))}
            className="w-full accent-[#8D9FCE] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-tabular-mono text-[var(--text-muted)]">
            <span>3 (Oversmoothed)</span>
            <span>12 (Balanced)</span>
            <span>24 (Noisy)</span>
          </div>
        </div>

        {/* KDE Bandwidth h */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <label htmlFor="s11-bw" className="text-[var(--text-secondary)]">
              KDE Bandwidth <span className="text-[var(--math-ink-y)]">h</span>
            </label>
            <span className="text-[var(--text-primary)] font-semibold">
              {fmt(bandwidth, 1)} {preset.unit}
            </span>
          </div>
          <input
            id="s11-bw"
            type="range"
            min={minBw}
            max={maxBw}
            step={0.2}
            value={bandwidth}
            disabled={!showKde}
            onChange={(e) => setBandwidth(Number(e.target.value))}
            className="w-full accent-[#96B898] cursor-pointer disabled:opacity-40"
          />
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setShowKde((v) => !v)}
              className={`px-2 py-0.5 text-[11px] font-tabular-mono border cursor-pointer ${
                showKde
                  ? "border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[var(--bg-panel)]"
                  : "border-[var(--border-subtle)] text-[var(--text-muted)] bg-[var(--bg-panel)]"
              }`}
            >
              {showKde ? "KDE Curve: ON" : "KDE Curve: OFF"}
            </button>
            <button
              type="button"
              onClick={() => setShowRug((v) => !v)}
              className={`px-2 py-0.5 text-[11px] font-tabular-mono border cursor-pointer ${
                showRug
                  ? "border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[var(--bg-panel)]"
                  : "border-[var(--border-subtle)] text-[var(--text-muted)] bg-[var(--bg-panel)]"
              }`}
            >
              {showRug ? "Rug Ticks: ON" : "Rug Ticks: OFF"}
            </button>
          </div>
        </div>

        {/* Vertical Scale Toggle */}
        <div className="space-y-2">
          <span className="text-xs font-tabular-mono text-[var(--text-secondary)] block">
            Vertical Axis Mode
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setYScaleMode("density")}
              className={`px-2.5 py-1.5 text-xs font-tabular-mono border cursor-pointer ${
                yScaleMode === "density"
                  ? "border-[var(--math-ink-x)] bg-[var(--bg-panel)] text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-muted)]"
              }`}
            >
              Density (Area=1)
            </button>
            <button
              type="button"
              onClick={() => setYScaleMode("count")}
              className={`px-2.5 py-1.5 text-xs font-tabular-mono border cursor-pointer ${
                yScaleMode === "count"
                  ? "border-[var(--math-ink-x)] bg-[var(--bg-panel)] text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-muted)]"
              }`}
            >
              Raw Count
            </button>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-math-serif leading-snug">
            Density divides count by <KaTeXMath math="n \cdot \Delta x" /> so changing{" "}
            <KaTeXMath math="k" /> keeps total shaded area fixed at <code>1.000</code>.
          </p>
        </div>

        {/* Sample Mutation Actions */}
        <div className="space-y-2">
          <span className="text-xs font-tabular-mono text-[var(--text-secondary)] block">
            Interactive Sample ({allPoints.length} pts)
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCustomPoints((prev) => prev.slice(0, -1))}
              disabled={customPoints.length === 0}
              className="px-2.5 py-1 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-40 cursor-pointer"
            >
              Undo Point
            </button>
            <button
              type="button"
              onClick={() => {
                setClearedBase(false);
                setCustomPoints([]);
              }}
              className="px-2.5 py-1 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] hover:border-[var(--border-strong)] cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                setClearedBase(true);
                setCustomPoints([
                  Number((xMin + xSpan * 0.35).toFixed(1)),
                  Number((xMin + xSpan * 0.48).toFixed(1)),
                  Number((xMin + xSpan * 0.55).toFixed(1)),
                ]);
              }}
              className="px-2.5 py-1 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--math-ink-sweep)] hover:border-[var(--border-strong)] cursor-pointer"
            >
              Build Custom
            </button>
          </div>
          <span className="text-[11px] font-tabular-mono text-[var(--text-muted)] block">
            +{customPoints.length} user-clicked point(s)
          </span>
        </div>
      </div>

      {/* Synchronized Dual Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Histogram + KDE + Rug */}
        <div className="lg:col-span-7 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <span className="text-[var(--text-primary)] font-semibold">
              1. {yScaleMode === "density" ? "Probability Density Histogram" : "Frequency Count Histogram"} (Click to Add Point)
            </span>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="text-[var(--math-ink-x)]">■ Bars</span>
              {showKde && <span className="text-[var(--math-ink-y)]">━ Smooth KDE</span>}
              <span className="text-[var(--math-ink-z)]">┆ Mean</span>
              <span className="text-[var(--math-ink-grid)]">│ Median</span>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={[xMin, xMax]}
            yRange={[-0.08 * analytics.yMax, analytics.yMax]}
            width={560}
            height={320}
            padding={38}
            xLabel={preset.unit}
            yLabel={yScaleMode === "density" ? "f(x)" : "n"}
            ariaLabel="Interactive histogram showing binned data, optional smooth kernel density curve, mean and median lines, and bottom rug plot"
            onSelectPoint={handlePlotClick}
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-panel)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const baseLineY = toSvgY(0);
              const kdePath =
                showKde && allPoints.length > 0
                  ? analytics.gridX
                      .map((gx, i) => {
                        const sx = toSvgX(gx);
                        const sy = toSvgY(analytics.kdeY[i]);
                        return `${i === 0 ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
                      })
                      .join(" ")
                  : "";

              return (
                <g>
                  {/* Histogram Bars */}
                  {analytics.bins.map((bin, idx) => {
                    const val = yScaleMode === "density" ? bin.density : bin.count;
                    const x0 = toSvgX(bin.x0);
                    const x1 = toSvgX(bin.x1);
                    const yTop = toSvgY(val);
                    const barHeight = Math.max(0, baseLineY - yTop);
                    return (
                      <g key={idx}>
                        <rect
                          x={x0 + 0.75}
                          y={yTop}
                          width={Math.max(1, x1 - x0 - 1.5)}
                          height={barHeight}
                          fill="#8D9FCE"
                          fillOpacity={0.32}
                          stroke="#8D9FCE"
                          strokeWidth={1.25}
                        />
                        {bin.count > 0 && x1 - x0 >= 22 && (
                          <text
                            x={(x0 + x1) / 2}
                            y={Math.max(yTop - 5, 42)}
                            textAnchor="middle"
                            fill="var(--text-muted)"
                            fontSize="9.5"
                            fontFamily="var(--font-mono)"
                          >
                            {bin.count}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Smooth KDE Curve */}
                  {kdePath && (
                    <path
                      d={kdePath}
                      fill="none"
                      stroke="#96B898"
                      strokeWidth={2.5}
                    />
                  )}

                  {/* Mean & Median Vertical Markers */}
                  {allPoints.length > 0 && (
                    <>
                      <line
                        x1={toSvgX(analytics.mean)}
                        y1={baseLineY}
                        x2={toSvgX(analytics.mean)}
                        y2={toSvgY(analytics.yMax * 0.94)}
                        stroke="#029091"
                        strokeWidth={2}
                        strokeDasharray="5 3"
                      />
                      <line
                        x1={toSvgX(analytics.median)}
                        y1={baseLineY}
                        x2={toSvgX(analytics.median)}
                        y2={toSvgY(analytics.yMax * 0.94)}
                        stroke="#AAA36D"
                        strokeWidth={2}
                      />
                    </>
                  )}

                  {/* Bottom Rug Ticks */}
                  {showRug &&
                    basePoints.map((pt, idx) => (
                      <line
                        key={`b-${idx}`}
                        x1={toSvgX(pt)}
                        y1={baseLineY + 2}
                        x2={toSvgX(pt)}
                        y2={baseLineY + 12}
                        stroke="#8D9FCE"
                        strokeOpacity={0.75}
                        strokeWidth={1.3}
                      />
                    ))}
                  {showRug &&
                    customPoints.map((pt, idx) => (
                      <circle
                        key={`c-${idx}`}
                        cx={toSvgX(pt)}
                        cy={baseLineY + 8}
                        r={3.5}
                        fill="#D35323"
                        stroke="#1E1F22"
                        strokeWidth={1}
                      />
                    ))}

                  {/* X-axis Min / Mid / Max Numeric Ticks */}
                  {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                    const tickVal = xMin + frac * xSpan;
                    return (
                      <text
                        key={frac}
                        x={toSvgX(tickVal)}
                        y={baseLineY + 24}
                        textAnchor="middle"
                        fill="var(--text-muted)"
                        fontSize="10"
                        fontFamily="var(--font-mono)"
                      >
                        {fmt(tickVal, 0)}
                      </text>
                    );
                  })}
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: Empirical Cumulative Ogive F_n(x) */}
        <div className="lg:col-span-5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <span className="text-[var(--text-primary)] font-semibold">
              2. Cumulative Ogive <KaTeXMath math="F_n(x)" />
            </span>
            <span className="text-[var(--math-ink-y)]">0.00 → 1.00</span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[xMin, xMax]}
            yRange={[0, 1.08]}
            width={420}
            height={320}
            padding={38}
            xLabel={preset.unit}
            yLabel="F(x)"
            ariaLabel="Empirical cumulative distribution ogive curve climbing from 0 to 1 across sample observations"
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-panel)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              // Binned cumulative polygon (ogive)
              const ogivePts: [number, number][] = [[xMin, 0]];
              for (const bin of analytics.bins) {
                ogivePts.push([bin.x1, bin.cumulativeFraction]);
              }
              const ogivePath = ogivePts
                .map(
                  ([x, y], i) =>
                    `${i === 0 ? "M" : "L"} ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)}`
                )
                .join(" ");

              // Exact step ECDF
              let ecdfPath = "";
              if (analytics.ecdfPoints.length > 0) {
                const segs: string[] = [`M ${toSvgX(xMin).toFixed(1)} ${toSvgY(0).toFixed(1)}`];
                let prevY = 0;
                for (const pt of analytics.ecdfPoints) {
                  const sx = toSvgX(pt.x).toFixed(1);
                  segs.push(`L ${sx} ${toSvgY(prevY).toFixed(1)}`);
                  segs.push(`L ${sx} ${toSvgY(pt.y).toFixed(1)}`);
                  prevY = pt.y;
                }
                segs.push(`L ${toSvgX(xMax).toFixed(1)} ${toSvgY(1).toFixed(1)}`);
                ecdfPath = segs.join(" ");
              }

              return (
                <g>
                  {/* 25%, 50%, 75% Reference Lines */}
                  {[0.25, 0.5, 0.75, 1.0].map((q) => (
                    <g key={q}>
                      <line
                        x1={toSvgX(xMin)}
                        y1={toSvgY(q)}
                        x2={toSvgX(xMax)}
                        y2={toSvgY(q)}
                        stroke="var(--border-subtle)"
                        strokeDasharray="3 3"
                        strokeWidth={1}
                      />
                      <text
                        x={toSvgX(xMin) - 5}
                        y={toSvgY(q) + 3}
                        textAnchor="end"
                        fill="var(--text-muted)"
                        fontSize="9.5"
                        fontFamily="var(--font-mono)"
                      >
                        {Math.round(q * 100)}%
                      </text>
                    </g>
                  ))}

                  {/* ECDF Step Function */}
                  {ecdfPath && (
                    <path
                      d={ecdfPath}
                      fill="none"
                      stroke="#96B898"
                      strokeWidth={1.75}
                      strokeOpacity={0.85}
                    />
                  )}

                  {/* Binned Ogive Curve */}
                  <path
                    d={ogivePath}
                    fill="none"
                    stroke="#8D9FCE"
                    strokeWidth={2.25}
                  />

                  {/* Median 50% Crosshair */}
                  {allPoints.length > 0 && (
                    <circle
                      cx={toSvgX(analytics.median)}
                      cy={toSvgY(0.5)}
                      r={4.5}
                      fill="#AAA36D"
                      stroke="#1E1F22"
                      strokeWidth={1.2}
                    />
                  )}
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Live Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
          <span className="text-[10px] font-tabular-mono uppercase text-[var(--text-muted)] block">
            Variable Type
          </span>
          <span className="text-xs font-tabular-mono font-semibold text-[var(--text-primary)]">
            {preset.dataType}
          </span>
        </div>
        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
          <span className="text-[10px] font-tabular-mono uppercase text-[var(--text-muted)] block">
            Total Shaded Area
          </span>
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)]">
            {yScaleMode === "density"
              ? `${fmt(analytics.totalArea, 3)} (Always 1)`
              : `${allPoints.length} obs`}
          </span>
        </div>
        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
          <span className="text-[10px] font-tabular-mono uppercase text-[var(--text-muted)] block">
            Sample Mean (x̄)
          </span>
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)]">
            {fmt(analytics.mean, 2)} {preset.unit}
          </span>
        </div>
        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
          <span className="text-[10px] font-tabular-mono uppercase text-[var(--text-muted)] block">
            Sample Median
          </span>
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-grid)]">
            {fmt(analytics.median, 2)} {preset.unit}
          </span>
        </div>
        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
          <span className="text-[10px] font-tabular-mono uppercase text-[var(--text-muted)] block">
            Skewness (γ₁)
          </span>
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)]">
            {analytics.skew >= 0 ? "+" : ""}
            {fmt(analytics.skew, 2)}
          </span>
        </div>
        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
          <span className="text-[10px] font-tabular-mono uppercase text-[var(--text-muted)] block">
            Empirical Shape
          </span>
          <span className="text-xs font-tabular-mono font-semibold text-[var(--text-primary)]">
            {shapeLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
