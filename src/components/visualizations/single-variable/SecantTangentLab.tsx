"use client";

import React, { useState, useMemo } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

interface SecantPreset {
  id: string;
  label: string;
  expr: string;
  defaultX0: number;
  defaultH: number;
  xRange: [number, number];
  yRange: [number, number];
  differentiableAtDefault: boolean;
  note: string;
}

const SECANT_PRESETS: SecantPreset[] = [
  {
    id: "cubic",
    label: "Smooth Cubic: 0.4x³ - x + 1",
    expr: "0.4*x^3 - x + 1",
    defaultX0: 1.0,
    defaultH: 0.9,
    xRange: [-2.2, 2.6],
    yRange: [-2.0, 4.5],
    differentiableAtDefault: true,
    note: "As h → 0, the secant chord rotates smoothly into the tangent line, and zooming into (x₀, f(x₀)) makes the cubic visually indistinguishable from a straight line.",
  },
  {
    id: "sine",
    label: "Oscillatory: sin(2x) + 0.3x",
    expr: "sin(2*x) + 0.3*x",
    defaultX0: 0.4,
    defaultH: 0.75,
    xRange: [-2.5, 2.5],
    yRange: [-2.0, 2.2],
    differentiableAtDefault: true,
    note: "Observe the synchronized derivative graph f'(x) = 2cos(2x) + 0.3 below: the tangent slope at x₀ traces out the exact height on the derivative curve.",
  },
  {
    id: "corner-abs",
    label: "Corner Non-Differentiable: |x - 0.5| + 0.5",
    expr: "abs(x - 0.5) + 0.5",
    defaultX0: 0.5,
    defaultH: 0.6,
    xRange: [-1.5, 2.5],
    yRange: [-0.5, 3.0],
    differentiableAtDefault: false,
    note: "Toggle h from positive (+0.6) to negative (-0.6) at x₀ = 0.5: the right-hand slope stays +1 while the left-hand slope stays -1! Even under extreme zoom, the corner never flattens.",
  },
  {
    id: "cusp-root",
    label: "Vertical Cusp: (x²)^(1/3)",
    expr: "(x^2)^(1/3)",
    defaultX0: 0.0,
    defaultH: 0.5,
    xRange: [-2.0, 2.0],
    yRange: [-0.5, 2.2],
    differentiableAtDefault: false,
    note: "Near x₀ = 0, secant chords steepen without bound (slope ~ h^(-1/3) → ±∞) from opposite signs, forming a sharp vertical cusp where no finite tangent exists.",
  },
];

export function SecantTangentLab() {
  const [presetId, setPresetId] = useState<string>("cubic");
  const preset = useMemo(
    () => SECANT_PRESETS.find((p) => p.id === presetId) ?? SECANT_PRESETS[0],
    [presetId]
  );

  const [expr, setExpr] = useState<string>(preset.expr);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [x0, setX0] = useState<number>(preset.defaultX0);
  const [stepH, setStepH] = useState<number>(preset.defaultH);
  const [zoomFactor, setZoomFactor] = useState<number>(4);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  React.useEffect(() => {
    if (!isAnimating) return;
    const id = window.setInterval(() => {
      setStepH((prev) => {
        const next = prev * 0.91;
        if (Math.abs(next) < 0.015) {
          setIsAnimating(false);
          return prev >= 0 ? 0.01 : -0.01;
        }
        return Number(next.toFixed(4));
      });
    }, 55);
    return () => window.clearInterval(id);
  }, [isAnimating]);

  const handleSelectPreset = (p: SecantPreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setX0(p.defaultX0);
    setStepH(p.defaultH);
    setIsCustom(false);
    setIsAnimating(false);
  };

  const compiled = useMemo(() => compileMathExpression(expr, ["x"]), [expr]);
  const evalF = useMemo(() => {
    return (x: number): number => {
      if (!compiled.valid) return NaN;
      return compiled.evaluate({ x });
    };
  }, [compiled]);

  const metrics = useMemo(() => {
    const safeH = Math.abs(stepH) < 0.005 ? (stepH >= 0 ? 0.005 : -0.005) : stepH;
    const y0 = evalF(x0);
    const x1 = x0 + safeH;
    const y1 = evalF(x1);
    const mSec =
      Number.isFinite(y0) && Number.isFinite(y1) ? (y1 - y0) / safeH : NaN;

    const eps = 1e-4;
    const fPlus = evalF(x0 + eps);
    const fMinus = evalF(x0 - eps);
    const leftSlope =
      Number.isFinite(y0) && Number.isFinite(fMinus)
        ? (y0 - fMinus) / eps
        : NaN;
    const rightSlope =
      Number.isFinite(y0) && Number.isFinite(fPlus)
        ? (fPlus - y0) / eps
        : NaN;
    const hasCornerOrCusp =
      !Number.isFinite(leftSlope) ||
      !Number.isFinite(rightSlope) ||
      Math.abs(leftSlope - rightSlope) > 0.25 ||
      Math.abs(leftSlope) > 30;
    const tangentSlope = hasCornerOrCusp
      ? NaN
      : 0.5 * (leftSlope + rightSlope);

    // Curves
    const [xMin, xMax] = preset.xRange;
    const steps = 200;
    const fPts: [number, number][] = [];
    const dfPts: [number, number][] = [];

    for (let i = 0; i <= steps; i++) {
      const x = xMin + ((xMax - xMin) * i) / steps;
      const y = evalF(x);
      if (Number.isFinite(y) && Math.abs(y) < 12) fPts.push([x, y]);
      const lp = evalF(x + 2e-3);
      const lm = evalF(x - 2e-3);
      const d = (lp - lm) / 4e-3;
      if (Number.isFinite(d) && Math.abs(d) < 12) dfPts.push([x, d]);
    }

    return {
      safeH,
      y0,
      x1,
      y1,
      mSec,
      leftSlope,
      rightSlope,
      hasCornerOrCusp,
      tangentSlope,
      fPts,
      dfPts,
    };
  }, [evalF, x0, stepH, preset.xRange]);

  const toPoly = (
    pts: [number, number][],
    toSvgX: (x: number) => number,
    toSvgY: (y: number) => number,
    yR: [number, number]
  ) =>
    pts
      .map(([px, py]) => {
        const cy = Math.max(yR[0] - 0.5, Math.min(yR[1] + 0.5, py));
        return `${toSvgX(px).toFixed(1)},${toSvgY(cy).toFixed(1)}`;
      })
      .join(" ");

  const halfSpanX = (preset.xRange[1] - preset.xRange[0]) / (2 * zoomFactor);
  const halfSpanY = (preset.yRange[1] - preset.yRange[0]) / (2 * zoomFactor);
  const centerY = Number.isFinite(metrics.y0) ? metrics.y0 : 0;
  const zoomXRange: [number, number] = [x0 - halfSpanX, x0 + halfSpanX];
  const zoomYRange: [number, number] = [centerY - halfSpanY, centerY + halfSpanY];

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)]">
            <span>Lab 1.2.1A</span>
            <span>•</span>
            <span>Secant-to-Tangent Homotopy</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            Secant Chord to Tangent Derivative Magnifier
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Animate the perturbation step <KaTeXMath math="h \to 0" /> and zoom
            into <KaTeXMath math="(x_0, f(x_0))" /> to watch smooth curves flatten
            into their tangent line while corners and cusps stay crooked.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (Math.abs(stepH) < 0.03) setStepH(0.9);
              setIsAnimating((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--math-ink-sweep)] bg-[var(--bg-canvas)] text-[var(--math-ink-sweep)]"
          >
            {isAnimating ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause h → 0
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Animate h → 0
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {SECANT_PRESETS.map((p) => {
          const active = !isCustom && p.id === preset.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                active
                  ? "border-[var(--math-ink-sweep)] bg-[var(--bg-canvas)] text-[var(--math-ink-sweep)] font-medium"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <MathExpressionInput
          label="Function f(x)"
          prefixLatex="f(x) ="
          value={expr}
          onChange={(val) => {
            setExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x"]}
        />

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Anchor x₀</span>
            <span className="font-tabular-mono text-[var(--math-ink-x)]">
              x₀ = {x0.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={preset.xRange[0] + 0.2}
            max={preset.xRange[1] - 0.2}
            step={0.05}
            value={x0}
            onChange={(e) => setX0(Number(e.target.value))}
            aria-label="Anchor point x0"
            className="w-full accent-[#8D9FCE]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Step h (x₁ - x₀)</span>
            <span className="font-tabular-mono text-[var(--math-ink-sweep)]">
              h = {stepH.toFixed(3)}
            </span>
          </div>
          <input
            type="range"
            min={-1.2}
            max={1.2}
            step={0.02}
            value={stepH}
            onChange={(e) => {
              setIsAnimating(false);
              setStepH(Number(e.target.value));
            }}
            aria-label="Secant step h"
            className="w-full accent-[#D35323]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Micro-Zoom Level</span>
            <span className="font-tabular-mono text-[var(--math-ink-z)]">
              {zoomFactor.toFixed(1)}×
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={25}
            step={0.5}
            value={zoomFactor}
            onChange={(e) => setZoomFactor(Number(e.target.value))}
            aria-label="Zoom magnification"
            className="w-full accent-[#029091]"
          />
        </div>
      </div>

      {/* Three Synchronized Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Curve + Secant & Tangent */}
        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            1. Secant Chord vs. Tangent on <KaTeXMath math="f(x)" />
          </span>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.yRange}
            width={360}
            height={260}
            xLabel="x"
            yLabel="f(x)"
            xColor="#8D9FCE"
            yColor="#FBEAA4"
            ariaLabel="Secant chord and tangent line on curve"
            onSelectPoint={(wx) => setX0(Number(wx.toFixed(2)))}
            className="w-full h-60 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const xL = preset.xRange[0];
              const xR = preset.xRange[1];
              return (
                <>
                  {metrics.fPts.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#FBEAA4"
                      strokeWidth={2.2}
                      points={toPoly(metrics.fPts, toSvgX, toSvgY, preset.yRange)}
                    />
                  )}
                  {/* Tangent line */}
                  {Number.isFinite(metrics.tangentSlope) &&
                    Number.isFinite(metrics.y0) && (
                      <line
                        x1={toSvgX(xL)}
                        y1={toSvgY(
                          metrics.y0 + metrics.tangentSlope * (xL - x0)
                        )}
                        x2={toSvgX(xR)}
                        y2={toSvgY(
                          metrics.y0 + metrics.tangentSlope * (xR - x0)
                        )}
                        stroke="#029091"
                        strokeWidth={1.8}
                      />
                    )}
                  {/* Secant line */}
                  {Number.isFinite(metrics.mSec) && Number.isFinite(metrics.y0) && (
                    <line
                      x1={toSvgX(xL)}
                      y1={toSvgY(metrics.y0 + metrics.mSec * (xL - x0))}
                      x2={toSvgX(xR)}
                      y2={toSvgY(metrics.y0 + metrics.mSec * (xR - x0))}
                      stroke="#D35323"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                    />
                  )}
                  {Number.isFinite(metrics.y0) && (
                    <circle
                      cx={toSvgX(x0)}
                      cy={toSvgY(metrics.y0)}
                      r={4.5}
                      fill="#8D9FCE"
                      stroke="#1E1F22"
                      strokeWidth={1.2}
                    />
                  )}
                  {Number.isFinite(metrics.y1) && (
                    <circle
                      cx={toSvgX(metrics.x1)}
                      cy={toSvgY(metrics.y1)}
                      r={4.2}
                      fill="#D35323"
                      stroke="#1E1F22"
                      strokeWidth={1.2}
                    />
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* 2. Local Straightness Micro-Zoom */}
        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            2. Local Straightness Zoom ({zoomFactor.toFixed(1)}×)
          </span>
          <SvgCoordinatePlane2D
            xRange={zoomXRange}
            yRange={zoomYRange}
            width={360}
            height={260}
            xLabel="x"
            yLabel="y"
            xColor="#8D9FCE"
            yColor="#029091"
            ariaLabel="Magnified view testing local linearity"
            className="w-full h-60 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const pts: [number, number][] = [];
              for (let i = 0; i <= 120; i++) {
                const zx =
                  zoomXRange[0] + ((zoomXRange[1] - zoomXRange[0]) * i) / 120;
                const zy = evalF(zx);
                if (Number.isFinite(zy)) pts.push([zx, zy]);
              }
              return (
                <>
                  {pts.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#FBEAA4"
                      strokeWidth={2.5}
                      points={toPoly(pts, toSvgX, toSvgY, zoomYRange)}
                    />
                  )}
                  {Number.isFinite(metrics.tangentSlope) &&
                    Number.isFinite(metrics.y0) && (
                      <line
                        x1={toSvgX(zoomXRange[0])}
                        y1={toSvgY(
                          metrics.y0 +
                            metrics.tangentSlope * (zoomXRange[0] - x0)
                        )}
                        x2={toSvgX(zoomXRange[1])}
                        y2={toSvgY(
                          metrics.y0 +
                            metrics.tangentSlope * (zoomXRange[1] - x0)
                        )}
                        stroke="#029091"
                        strokeWidth={1.6}
                        strokeDasharray="4 3"
                      />
                    )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* 3. Synchronized Derivative Curve f'(x) */}
        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            3. Derivative Curve <KaTeXMath math="f'(x)" />
          </span>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={[-4.0, 4.0]}
            width={360}
            height={260}
            xLabel="x"
            yLabel="f'(x)"
            xColor="#8D9FCE"
            yColor="#029091"
            ariaLabel="Synchronized derivative graph f prime of x"
            className="w-full h-60 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {metrics.dfPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#029091"
                    strokeWidth={2.2}
                    points={toPoly(metrics.dfPts, toSvgX, toSvgY, [-4.0, 4.0])}
                  />
                )}
                {Number.isFinite(metrics.tangentSlope) && (
                  <circle
                    cx={toSvgX(x0)}
                    cy={toSvgY(
                      Math.max(-3.9, Math.min(3.9, metrics.tangentSlope))
                    )}
                    r={4.8}
                    fill="#029091"
                    stroke="#FBEAA4"
                    strokeWidth={1.5}
                  />
                )}
                {Number.isFinite(metrics.mSec) && (
                  <circle
                    cx={toSvgX(x0)}
                    cy={toSvgY(Math.max(-3.9, Math.min(3.9, metrics.mSec)))}
                    r={4.0}
                    fill="#D35323"
                  />
                )}
              </>
            )}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Live Slopes Readout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono">
        <div>
          <span className="text-[var(--text-secondary)] block font-sans">
            Secant Slope m_sec
          </span>
          <span className="text-[var(--math-ink-sweep)] text-sm font-semibold">
            {Number.isFinite(metrics.mSec) ? metrics.mSec.toFixed(4) : "NaN"}
          </span>
        </div>
        <div>
          <span className="text-[var(--text-secondary)] block font-sans">
            True Derivative f&apos;(x₀)
          </span>
          <span className="text-[var(--math-ink-z)] text-sm font-semibold">
            {Number.isFinite(metrics.tangentSlope)
              ? metrics.tangentSlope.toFixed(4)
              : "DNE (Corner/Cusp)"}
          </span>
        </div>
        <div>
          <span className="text-[var(--text-secondary)] block font-sans">
            Left Slope f&apos;_-(x₀)
          </span>
          <span className="text-[var(--math-ink-x)] text-sm">
            {Number.isFinite(metrics.leftSlope)
              ? metrics.leftSlope.toFixed(3)
              : "∞"}
          </span>
        </div>
        <div>
          <span className="text-[var(--text-secondary)] block font-sans">
            Right Slope f&apos;_+(x₀)
          </span>
          <span className="text-[var(--math-ink-y)] text-sm">
            {Number.isFinite(metrics.rightSlope)
              ? metrics.rightSlope.toFixed(3)
              : "∞"}
          </span>
        </div>
      </div>

      {!isCustom && (
        <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
          <strong className="text-[var(--text-primary)] font-sans">
            Differentiability Insight:
          </strong>{" "}
          {preset.note}
        </div>
      )}
    </section>
  );
}
