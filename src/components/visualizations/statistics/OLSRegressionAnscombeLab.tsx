"use client";

import React, { useMemo, useRef, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { sampleMean, studentTInvCdf } from "./statMath";

interface Point2D {
  x: number;
  y: number;
}

type DatasetPreset =
  | "sandbox"
  | "anscombe-1"
  | "anscombe-2"
  | "anscombe-3"
  | "anscombe-4";

const SANDBOX_DEFAULT: Point2D[] = [
  { x: 3.0, y: 4.1 },
  { x: 4.5, y: 5.2 },
  { x: 6.0, y: 5.0 },
  { x: 7.5, y: 6.9 },
  { x: 9.0, y: 7.1 },
  { x: 10.5, y: 8.6 },
  { x: 12.0, y: 8.2 },
  { x: 13.5, y: 9.8 },
  { x: 15.0, y: 10.1 },
  { x: 16.5, y: 11.4 },
];

const ANSCOMBE_PRESETS: Record<
  Exclude<DatasetPreset, "sandbox">,
  { label: string; story: string; points: Point2D[] }
> = {
  "anscombe-1": {
    label: "Anscombe I (Clean Linear)",
    story: "Textbook linear trend with mild, evenly scattered vertical noise.",
    points: [
      { x: 10, y: 8.04 },
      { x: 8, y: 6.95 },
      { x: 13, y: 7.58 },
      { x: 9, y: 8.81 },
      { x: 11, y: 8.33 },
      { x: 14, y: 9.96 },
      { x: 6, y: 7.24 },
      { x: 4, y: 4.26 },
      { x: 12, y: 10.84 },
      { x: 7, y: 4.82 },
      { x: 5, y: 5.68 },
    ],
  },
  "anscombe-2": {
    label: "Anscombe II (Curved Arc)",
    story:
      "Exact quadratic parabola! R² = 0.67 hides zero linear noise—the residual plot screams 'curve'!",
    points: [
      { x: 10, y: 9.14 },
      { x: 8, y: 8.14 },
      { x: 13, y: 8.74 },
      { x: 9, y: 8.77 },
      { x: 11, y: 9.26 },
      { x: 14, y: 8.1 },
      { x: 6, y: 6.13 },
      { x: 4, y: 3.1 },
      { x: 12, y: 9.13 },
      { x: 7, y: 7.26 },
      { x: 5, y: 4.74 },
    ],
  },
  "anscombe-3": {
    label: "Anscombe III (1 Vertical Outlier)",
    story:
      "10 points sit on a tighter line, but 1 single outlier yanks the entire OLS slope upward!",
    points: [
      { x: 10, y: 7.46 },
      { x: 8, y: 6.77 },
      { x: 13, y: 12.74 },
      { x: 9, y: 7.11 },
      { x: 11, y: 7.81 },
      { x: 14, y: 8.84 },
      { x: 6, y: 6.08 },
      { x: 4, y: 5.39 },
      { x: 12, y: 8.15 },
      { x: 7, y: 6.42 },
      { x: 5, y: 5.73 },
    ],
  },
  "anscombe-4": {
    label: "Anscombe IV (High-Leverage Point)",
    story:
      "Zero relationship at x=8! One extreme x=19 point dictates the entire slope single-handedly.",
    points: [
      { x: 8, y: 6.58 },
      { x: 8, y: 5.76 },
      { x: 8, y: 7.71 },
      { x: 8, y: 8.84 },
      { x: 8, y: 8.47 },
      { x: 8, y: 7.04 },
      { x: 8, y: 5.25 },
      { x: 19, y: 12.5 },
      { x: 8, y: 5.56 },
      { x: 8, y: 7.91 },
      { x: 8, y: 6.89 },
    ],
  },
};

function fmt(n: number, digits = 2): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.6.1 — Interactive OLS Linear Regression, Squared Residuals,
 * Confidence vs. Prediction Bands, Residual Plot, and Anscombe's Quartet.
 */
export function OLSRegressionAnscombeLab() {
  const [preset, setPreset] = useState<DatasetPreset>("sandbox");
  const [points, setPoints] = useState<Point2D[]>(SANDBOX_DEFAULT);
  const [showSquares, setShowSquares] = useState<boolean>(true);
  const [showConfBand, setShowConfBand] = useState<boolean>(true);
  const [showPredBand, setShowPredBand] = useState<boolean>(false);
  const [manualSlopeEnabled, setManualSlopeEnabled] = useState<boolean>(false);
  const [manualSlope, setManualSlope] = useState<number>(0.15);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const dragMovedRef = useRef<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const stats = useMemo(() => {
    const n = points.length;
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const xBar = sampleMean(xs);
    const yBar = sampleMean(ys);

    let sxx = 0;
    let syy = 0;
    let sxy = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - xBar;
      const dy = ys[i] - yBar;
      sxx += dx * dx;
      syy += dy * dy;
      sxy += dx * dy;
    }

    const olsSlope = sxx > 1e-8 ? sxy / sxx : 0;
    const olsIntercept = yBar - olsSlope * xBar;
    const r =
      sxx > 1e-8 && syy > 1e-8 ? sxy / Math.sqrt(sxx * syy) : 0;

    const activeSlope = manualSlopeEnabled ? manualSlope : olsSlope;
    const activeIntercept = yBar - activeSlope * xBar;

    let sseOls = 0;
    let sseActive = 0;
    const residuals = points.map((pt) => {
      const yHatOls = olsIntercept + olsSlope * pt.x;
      const yHat = activeIntercept + activeSlope * pt.x;
      const resOls = pt.y - yHatOls;
      const res = pt.y - yHat;
      sseOls += resOls * resOls;
      sseActive += res * res;
      return { x: pt.x, y: pt.y, yHat, res };
    });

    const sst = syy;
    const rSquaredOls = sst > 1e-8 ? 1 - sseOls / sst : 0;
    const rSquaredActive = sst > 1e-8 ? 1 - sseActive / sst : 0;
    const se = n > 2 ? Math.sqrt(sseOls / (n - 2)) : 0;
    const tCrit = n > 2 ? studentTInvCdf(0.975, n - 2) : 1.96;

    return {
      n,
      xBar,
      yBar,
      sxx,
      sst,
      r,
      olsSlope,
      olsIntercept,
      activeSlope,
      activeIntercept,
      sseOls,
      sseActive,
      rSquaredOls,
      rSquaredActive,
      se,
      tCrit,
      residuals,
    };
  }, [points, manualSlopeEnabled, manualSlope]);

  // SVG Scatter geometry
  const svgW = 520;
  const svgH = 310;
  const padL = 44;
  const padR = 20;
  const padT = 18;
  const padB = 34;
  const xMin = 0;
  const xMax = 21;
  const yMin = 0;
  const yMax = 14.5;

  const toSvgX = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * (svgW - padL - padR);
  const toSvgY = (y: number) =>
    svgH - padB - ((y - yMin) / (yMax - yMin)) * (svgH - padT - padB);
  const fromSvgX = (px: number) =>
    xMin + ((px - padL) / (svgW - padL - padR)) * (xMax - xMin);
  const fromSvgY = (py: number) =>
    yMin + ((svgH - padB - py) / (svgH - padT - padB)) * (yMax - yMin);

  const clientToWorld = (clientX: number, clientY: number): Point2D | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * svgW;
    const py = ((clientY - rect.top) / rect.height) * svgH;
    const wx = Math.max(1.2, Math.min(20.0, fromSvgX(px)));
    const wy = Math.max(1.0, Math.min(13.8, fromSvgY(py)));
    return {
      x: Math.round(wx * 20) / 20,
      y: Math.round(wy * 20) / 20,
    };
  };

  // Confidence & Prediction bands along x grid
  const bands = useMemo(() => {
    if (stats.n < 3 || stats.sxx <= 1e-8) return null;
    const steps = 48;
    const confUpper: string[] = [];
    const confLower: string[] = [];
    const predUpper: string[] = [];
    const predLower: string[] = [];

    for (let i = 0; i <= steps; i++) {
      const x = 1.5 + (i / steps) * 18.5;
      const yHat = stats.olsIntercept + stats.olsSlope * x;
      const levTerm = (x - stats.xBar) ** 2 / stats.sxx;
      const confHalf =
        stats.tCrit * stats.se * Math.sqrt(1 / stats.n + levTerm);
      const predHalf =
        stats.tCrit * stats.se * Math.sqrt(1 + 1 / stats.n + levTerm);

      const sx = toSvgX(x).toFixed(1);
      confUpper.push(`${sx},${toSvgY(yHat + confHalf).toFixed(1)}`);
      confLower.unshift(`${sx},${toSvgY(yHat - confHalf).toFixed(1)}`);
      predUpper.push(`${sx},${toSvgY(yHat + predHalf).toFixed(1)}`);
      predLower.unshift(`${sx},${toSvgY(yHat - predHalf).toFixed(1)}`);
    }

    return {
      confPoly: [...confUpper, ...confLower].join(" "),
      predPoly: [...predUpper, ...predLower].join(" "),
    };
  }, [stats]);

  const selectPreset = (next: DatasetPreset) => {
    setPreset(next);
    setManualSlopeEnabled(false);
    if (next === "sandbox") {
      setPoints(SANDBOX_DEFAULT);
    } else {
      setPoints(ANSCOMBE_PRESETS[next].points.map((p) => ({ ...p })));
    }
  };

  // Residual plot SVG dimensions
  const resW = 340;
  const resH = 220;
  const maxAbsRes = Math.max(
    2.5,
    ...stats.residuals.map((r) => Math.abs(r.res) * 1.15)
  );
  const yHats = stats.residuals.map((r) => r.yHat);
  const yHatMin = Math.min(...yHats, 3);
  const yHatMax = Math.max(...yHats, 12);
  const yHatSpan = Math.max(2, yHatMax - yHatMin);

  return (
    <div className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4 sm:p-5 space-y-5">
      {/* Preset Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div className="space-y-0.5">
          <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] font-semibold block">
            Interactive OLS Least-Squares &amp; Anscombe&apos;s Quartet Lab
          </span>
          <p className="text-xs font-math-serif text-[var(--text-secondary)]">
            {preset === "sandbox"
              ? "Drag any point (or click empty space to add a point) and watch squared residual boxes update live."
              : ANSCOMBE_PRESETS[preset].story}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => selectPreset("sandbox")}
            className={`px-2.5 py-1 text-xs font-tabular-mono border ${
              preset === "sandbox"
                ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--bg-canvas)] font-semibold"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
            }`}
          >
            Interactive Sandbox
          </button>
          {(
            ["anscombe-1", "anscombe-2", "anscombe-3", "anscombe-4"] as const
          ).map((key, idx) => (
            <button
              key={key}
              type="button"
              onClick={() => selectPreset(key)}
              className={`px-2.5 py-1 text-xs font-tabular-mono border ${
                preset === key
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--bg-canvas)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
              }`}
            >
              Anscombe {["I", "II", "III", "IV"][idx]}
            </button>
          ))}
        </div>
      </div>

      {/* Controls & Sandbox Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-tabular-mono">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showSquares}
              onChange={(e) => setShowSquares(e.target.checked)}
              className="accent-[#D35323]"
            />
            <span>Squared Residuals ∑eᵢ²</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showConfBand}
              onChange={(e) => setShowConfBand(e.target.checked)}
              className="accent-[#029091]"
            />
            <span>95% Confidence Band</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showPredBand}
              onChange={(e) => setShowPredBand(e.target.checked)}
              className="accent-[#8D9FCE]"
            />
            <span>95% Prediction Band</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-[var(--math-ink-sweep)] font-semibold">
            <input
              type="checkbox"
              checked={manualSlopeEnabled}
              onChange={(e) => {
                const next = e.target.checked;
                setManualSlopeEnabled(next);
                if (next) setManualSlope(Math.round((stats.olsSlope - 0.35) * 100) / 100);
              }}
              className="accent-[#D35323]"
            />
            <span>Manual Slope Challenge</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setPreset("sandbox");
              setPoints((prev) => [...prev, { x: 19.0, y: 2.8 }]);
            }}
            className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)]"
          >
            + Add Leverage Outlier
          </button>
          <button
            type="button"
            disabled={points.length <= 3}
            onClick={() => setPoints((prev) => prev.slice(0, -1))}
            className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] disabled:opacity-40"
          >
            Remove Last
          </button>
          <button
            type="button"
            onClick={() => selectPreset(preset)}
            className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Optional Manual Slope Challenge Slider */}
      {manualSlopeEnabled && (
        <div className="p-3 border border-[#D35323] bg-[#D35323]/10 flex flex-wrap items-center justify-between gap-4">
          <label className="flex-1 min-w-[220px] space-y-1 block">
            <div className="flex justify-between text-xs font-tabular-mono tabular-nums">
              <span className="font-semibold text-[var(--math-ink-sweep)]">
                Try Tilting Slope Manually: b₁ = {manualSlope.toFixed(2)} (OLS optimal:{" "}
                {stats.olsSlope.toFixed(2)})
              </span>
              <span>
                Your ∑eᵢ² = <strong>{fmt(stats.sseActive, 1)}</strong> vs. OLS Minimum ={" "}
                <strong className="text-[var(--math-ink-z)]">{fmt(stats.sseOls, 1)}</strong>
              </span>
            </div>
            <input
              type="range"
              min={-0.6}
              max={1.4}
              step={0.01}
              value={manualSlope}
              onChange={(e) => setManualSlope(Number(e.target.value))}
              aria-label="Manual regression slope challenge"
              className="w-full accent-[#D35323] cursor-pointer"
            />
          </label>
          <button
            type="button"
            onClick={() => setManualSlope(Number(stats.olsSlope.toFixed(2)))}
            className="px-3 py-1.5 text-xs font-tabular-mono border border-[#029091] bg-[#029091]/15 text-[var(--math-ink-z)] font-semibold"
          >
            Snap to OLS Best Fit
          </button>
        </div>
      )}

      {/* Main Split View: Scatter + Residual Diagnostics */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Scatter + Squared Residual Boxes */}
        <div className="xl:col-span-7 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-auto block select-none cursor-crosshair"
            role="img"
            aria-label={`OLS regression scatterplot with ${stats.n} points, slope ${fmt(
              stats.activeSlope
            )}, and R-squared ${fmt(stats.rSquaredOls, 3)}`}
            onPointerMove={(e) => {
              if (draggingIdx === null) return;
              const world = clientToWorld(e.clientX, e.clientY);
              if (!world) return;
              dragMovedRef.current = true;
              setPoints((prev) =>
                prev.map((pt, i) => (i === draggingIdx ? world : pt))
              );
            }}
            onPointerUp={() => setDraggingIdx(null)}
            onPointerLeave={() => setDraggingIdx(null)}
            onClick={(e) => {
              if (dragMovedRef.current) {
                dragMovedRef.current = false;
                return;
              }
              if (points.length >= 28) return;
              const world = clientToWorld(e.clientX, e.clientY);
              if (!world) return;
              setPoints((prev) => [...prev, world]);
            }}
          >
            {/* Grid */}
            {[4, 8, 12, 16, 20].map((gx) => (
              <g key={`gx-${gx}`}>
                <line
                  x1={toSvgX(gx)}
                  x2={toSvgX(gx)}
                  y1={padT}
                  y2={svgH - padB}
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 3"
                  strokeWidth={0.7}
                />
                <text
                  x={toSvgX(gx)}
                  y={svgH - padB + 14}
                  textAnchor="middle"
                  fontSize={9.5}
                  fontFamily="JetBrains Mono, monospace"
                  fill="var(--text-muted)"
                >
                  {gx}
                </text>
              </g>
            ))}
            {[2, 4, 6, 8, 10, 12, 14].map((gy) => (
              <g key={`gy-${gy}`}>
                <line
                  x1={padL}
                  x2={svgW - padR}
                  y1={toSvgY(gy)}
                  y2={toSvgY(gy)}
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 3"
                  strokeWidth={0.7}
                />
                <text
                  x={padL - 6}
                  y={toSvgY(gy) + 3}
                  textAnchor="end"
                  fontSize={9.5}
                  fontFamily="JetBrains Mono, monospace"
                  fill="var(--text-muted)"
                >
                  {gy}
                </text>
              </g>
            ))}

            {/* 95% Prediction Band (wider) */}
            {showPredBand && bands && (
              <polygon
                points={bands.predPoly}
                fill="#8D9FCE"
                fillOpacity={0.14}
                stroke="#8D9FCE"
                strokeOpacity={0.45}
                strokeDasharray="4 3"
                strokeWidth={1}
              />
            )}

            {/* 95% Confidence Band (narrower around mean line) */}
            {showConfBand && bands && (
              <polygon
                points={bands.confPoly}
                fill="#029091"
                fillOpacity={0.18}
                stroke="#029091"
                strokeOpacity={0.55}
                strokeWidth={1.1}
              />
            )}

            {/* Ghost OLS line when comparing manual line */}
            {manualSlopeEnabled && (
              <line
                x1={toSvgX(0.5)}
                x2={toSvgX(20.5)}
                y1={toSvgY(stats.olsIntercept + stats.olsSlope * 0.5)}
                y2={toSvgY(stats.olsIntercept + stats.olsSlope * 20.5)}
                stroke="#029091"
                strokeWidth={1.6}
                strokeDasharray="5 4"
                strokeOpacity={0.7}
              />
            )}

            {/* Squared Residual Boxes */}
            {showSquares &&
              stats.residuals.map((item, idx) => {
                const px = toSvgX(item.x);
                const py = toSvgY(item.y);
                const pyHat = toSvgY(item.yHat);
                const side = Math.abs(py - pyHat);
                const topY = Math.min(py, pyHat);
                const boxX = item.res >= 0 ? px : px - side;
                return (
                  <rect
                    key={`sq-${idx}`}
                    x={boxX}
                    y={topY}
                    width={side}
                    height={side}
                    fill={manualSlopeEnabled ? "#D35323" : "#FBEAA4"}
                    fillOpacity={0.28}
                    stroke={manualSlopeEnabled ? "#D35323" : "#AAA36D"}
                    strokeWidth={1.1}
                  />
                );
              })}

            {/* Residual vertical lines */}
            {stats.residuals.map((item, idx) => (
              <line
                key={`resline-${idx}`}
                x1={toSvgX(item.x)}
                x2={toSvgX(item.x)}
                y1={toSvgY(item.y)}
                y2={toSvgY(item.yHat)}
                stroke="#D35323"
                strokeWidth={1.3}
                strokeOpacity={0.75}
              />
            ))}

            {/* Active Regression Line */}
            <line
              x1={toSvgX(0.5)}
              x2={toSvgX(20.5)}
              y1={toSvgY(stats.activeIntercept + stats.activeSlope * 0.5)}
              y2={toSvgY(stats.activeIntercept + stats.activeSlope * 20.5)}
              stroke={manualSlopeEnabled ? "#D35323" : "#029091"}
              strokeWidth={2.5}
            />

            {/* Centroid (xBar, yBar) */}
            <circle
              cx={toSvgX(stats.xBar)}
              cy={toSvgY(stats.yBar)}
              r={5}
              fill="#FBEAA4"
              stroke="#1E1F22"
              strokeWidth={1.5}
            />

            {/* Draggable Scatter Points */}
            {points.map((pt, idx) => (
              <circle
                key={`pt-${idx}`}
                cx={toSvgX(pt.x)}
                cy={toSvgY(pt.y)}
                r={draggingIdx === idx ? 6.5 : 5}
                fill="#8D9FCE"
                stroke="#1E1F22"
                strokeWidth={1.2}
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  dragMovedRef.current = false;
                  setDraggingIdx(idx);
                }}
              />
            ))}
          </svg>
        </div>

        {/* Right Column: Live Readouts + Residual Plot */}
        <div className="xl:col-span-5 flex flex-col justify-between gap-3">
          {/* Metrics */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] font-semibold">
                OLS Fit Summary (n = {stats.n})
              </span>
              <span className="text-xs font-tabular-mono tabular-nums font-semibold">
                ŷ = {fmt(stats.activeIntercept, 2)}{" "}
                {stats.activeSlope >= 0 ? "+" : "−"}{" "}
                {fmt(Math.abs(stats.activeSlope), 2)}x
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-2 text-xs font-tabular-mono tabular-nums">
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="block text-[var(--text-muted)] text-[10px]">
                  Correlation r
                </span>
                <strong>{fmt(stats.r, 3)}</strong>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="block text-[var(--text-muted)] text-[10px]">
                  OLS R² (Explained)
                </span>
                <strong className="text-[var(--math-ink-z)]">
                  {(stats.rSquaredOls * 100).toFixed(1)}%
                </strong>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="block text-[var(--text-muted)] text-[10px]">
                  Total Squared Error ∑eᵢ²
                </span>
                <strong className="text-[var(--math-ink-sweep)]">
                  {fmt(stats.sseActive, 2)}
                </strong>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="block text-[var(--text-muted)] text-[10px]">
                  Means (x̄, ȳ)
                </span>
                <strong>
                  ({fmt(stats.xBar, 1)}, {fmt(stats.yBar, 1)})
                </strong>
              </div>
            </div>
          </div>

          {/* Residual Diagnostic Plot */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-1.5">
            <div className="flex justify-between text-[11px] font-tabular-mono">
              <span className="uppercase tracking-wider text-[var(--math-ink-sweep)] font-semibold">
                Residual Diagnostic Plot (eᵢ vs. Fitted ŷᵢ)
              </span>
              <span className="text-[var(--text-muted)]">Goal: Random cloud</span>
            </div>
            <svg
              viewBox={`0 0 ${resW} ${resH}`}
              className="w-full h-auto block"
              role="img"
              aria-label="Residual diagnostic scatter plot showing residuals versus fitted values"
            >
              <line
                x1={38}
                x2={resW - 14}
                y1={resH / 2}
                y2={resH / 2}
                stroke="#AAA36D"
                strokeDasharray="4 3"
                strokeWidth={1.3}
              />
              <text
                x={32}
                y={resH / 2 + 3}
                textAnchor="end"
                fontSize={9}
                fontFamily="JetBrains Mono, monospace"
                fill="var(--text-muted)"
              >
                0
              </text>
              {stats.residuals.map((item, idx) => {
                const cx =
                  44 + ((item.yHat - yHatMin) / yHatSpan) * (resW - 64);
                const cy =
                  resH / 2 - (item.res / maxAbsRes) * (resH / 2 - 22);
                const big = Math.abs(item.res) > 2 * Math.max(0.4, stats.se);
                return (
                  <g key={`diag-${idx}`}>
                    <line
                      x1={cx}
                      x2={cx}
                      y1={resH / 2}
                      y2={cy}
                      stroke={big ? "#B95869" : "#96B898"}
                      strokeOpacity={0.55}
                      strokeWidth={1.1}
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={big ? "#B95869" : "#96B898"}
                    />
                  </g>
                );
              })}
            </svg>
            <p className="text-[11px] font-math-serif text-[var(--text-muted)]">
              Notice how the <strong>Confidence Band</strong> hugs the average line tightly, while the{" "}
              <strong>Prediction Band</strong> is much wider because one future observation carries extra{" "}
              <KaTeXMath math="s_e" /> noise!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
