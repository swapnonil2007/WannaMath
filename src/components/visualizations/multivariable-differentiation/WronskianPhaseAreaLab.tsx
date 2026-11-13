"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Play, Pause, RotateCcw, Sparkles } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives";

interface WronskianPreset {
  id: string;
  label: string;
  y1Expr: string;
  y2Expr: string;
  odeLatex: string;
  pValue: number | null; // constant p in y'' + p y' + q y = 0 for Abel check
  xRange: [number, number];
  yRange: [number, number];
  phaseRange: [number, number];
  defaultX0: number;
  note: string;
}

const WRONSKIAN_PRESETS: WronskianPreset[] = [
  {
    id: "harmonic",
    label: "Harmonic Basis: cos(2x), sin(2x)",
    y1Expr: "cos(2*x)",
    y2Expr: "sin(2*x)",
    odeLatex: "y'' + 4y = 0 \\quad (p = 0)",
    pValue: 0,
    xRange: [-0.5, 4.5],
    yRange: [-2.6, 2.6],
    phaseRange: [-2.6, 2.6],
    defaultX0: 0.6,
    note: "Because p(x) = 0, Abel's identity keeps the parallelogram area W(x) = 2 strictly constant even as Y₁ and Y₂ rotate around the origin.",
  },
  {
    id: "damped-abel",
    label: "Damped Decay: e^(-0.4x)cos(2x), e^(-0.4x)sin(2x)",
    y1Expr: "exp(-0.4*x)*cos(2*x)",
    y2Expr: "exp(-0.4*x)*sin(2*x)",
    odeLatex: "y'' + 0.8y' + 4.16y = 0 \\quad (p = 0.8)",
    pValue: 0.8,
    xRange: [-0.5, 4.5],
    yRange: [-2.5, 3.0],
    phaseRange: [-2.6, 2.6],
    defaultX0: 0.4,
    note: "Damping p = 0.8 shrinks the phase-plane parallelogram exponentially at rate W(x) = 2e^(-0.8x), yet W(x) > 0 everywhere so independence never breaks.",
  },
  {
    id: "distinct-real",
    label: "Distinct Exponentials: e^(-0.6x), e^(0.5x)",
    y1Expr: "exp(-0.6*x)",
    y2Expr: "exp(0.5*x)",
    odeLatex: "y'' + 0.1y' - 0.3y = 0 \\quad (p = 0.1)",
    pValue: 0.1,
    xRange: [-1.5, 2.6],
    yRange: [-1.2, 4.2],
    phaseRange: [-2.5, 4.0],
    defaultX0: 0.2,
    note: "Distinct roots r₁ = -0.6 and r₂ = 0.5 point into different phase-plane quadrants, guaranteeing nonzero area W(x) = 1.1e^(-0.1x).",
  },
  {
    id: "repeated-root",
    label: "Repeated Root Pair: e^(-0.7x), x·e^(-0.7x)",
    y1Expr: "exp(-0.7*x)",
    y2Expr: "x*exp(-0.7*x)",
    odeLatex: "y'' + 1.4y' + 0.49y = 0 \\quad (p = 1.4)",
    pValue: 1.4,
    xRange: [-0.8, 3.5],
    yRange: [-1.5, 2.5],
    phaseRange: [-2.0, 2.2],
    defaultX0: 0.8,
    note: "Multiplying e^(-0.7x) by x twists Y₂'s derivative component so W(x) = e^(-1.4x) > 0 everywhere—establishing linear independence at a double root.",
  },
  {
    id: "dependent-collapse",
    label: "Dependent Collapse: sin²(x), 1 - cos(2x)",
    y1Expr: "(sin(x))^2",
    y2Expr: "1 - cos(2*x)",
    odeLatex: "\\text{Trigonometric Identity: } y_2(x) = 2y_1(x)",
    pValue: null,
    xRange: [-1.0, 4.0],
    yRange: [-1.5, 2.8],
    phaseRange: [-2.6, 2.6],
    defaultX0: 0.9,
    note: "Since 1 - cos(2x) = 2sin²(x), Y₂ stays strictly collinear with 2·Y₁ at every x. The parallelogram collapses flat with W(x) ≡ 0.",
  },
];

function centralDerivative(fn: (x: number) => number, x: number, h = 1e-4): number {
  const fp = fn(x + h);
  const fm = fn(x - h);
  if (!Number.isFinite(fp) || !Number.isFinite(fm)) return NaN;
  return (fp - fm) / (2 * h);
}

export function WronskianPhaseAreaLab() {
  const [presetId, setPresetId] = useState<string>("damped-abel");
  const preset = useMemo(
    () => WRONSKIAN_PRESETS.find((p) => p.id === presetId) ?? WRONSKIAN_PRESETS[0],
    [presetId]
  );

  const [y1Expr, setY1Expr] = useState<string>(preset.y1Expr);
  const [y2Expr, setY2Expr] = useState<string>(preset.y2Expr);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [x0, setX0] = useState<number>(preset.defaultX0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleSelectPreset = (p: WronskianPreset) => {
    setPresetId(p.id);
    setY1Expr(p.y1Expr);
    setY2Expr(p.y2Expr);
    setX0(p.defaultX0);
    setIsCustom(false);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const [xMin, xMax] = preset.xRange;
    const id = window.setInterval(() => {
      setX0((prev) => {
        const next = prev + (xMax - xMin) * 0.012;
        return next > xMax ? xMin : Number(next.toFixed(3));
      });
    }, 45);
    return () => window.clearInterval(id);
  }, [isPlaying, preset.xRange]);

  const compiledY1 = useMemo(() => compileMathExpression(y1Expr, ["x"]), [y1Expr]);
  const compiledY2 = useMemo(() => compileMathExpression(y2Expr, ["x"]), [y2Expr]);

  const evalPair = useMemo(() => {
    const f1 = (x: number) =>
      compiledY1.valid ? compiledY1.evaluate({ x }) : NaN;
    const f2 = (x: number) =>
      compiledY2.valid ? compiledY2.evaluate({ x }) : NaN;
    return {
      y1: f1,
      y2: f2,
      dy1: (x: number) => centralDerivative(f1, x),
      dy2: (x: number) => centralDerivative(f2, x),
      w: (x: number) => {
        const v1 = f1(x);
        const v2 = f2(x);
        const d1 = centralDerivative(f1, x);
        const d2 = centralDerivative(f2, x);
        if (
          !Number.isFinite(v1) ||
          !Number.isFinite(v2) ||
          !Number.isFinite(d1) ||
          !Number.isFinite(d2)
        ) {
          return NaN;
        }
        return v1 * d2 - v2 * d1;
      },
    };
  }, [compiledY1, compiledY2]);

  const sampledCurves = useMemo(() => {
    const [xMin, xMax] = preset.xRange;
    const steps = 160;
    const y1Pts: [number, number][] = [];
    const y2Pts: [number, number][] = [];
    const wPts: [number, number][] = [];
    const phase1Pts: [number, number][] = [];
    const phase2Pts: [number, number][] = [];

    for (let i = 0; i <= steps; i++) {
      const x = xMin + ((xMax - xMin) * i) / steps;
      const v1 = evalPair.y1(x);
      const v2 = evalPair.y2(x);
      const d1 = evalPair.dy1(x);
      const d2 = evalPair.dy2(x);
      const wv = evalPair.w(x);

      if (Number.isFinite(v1) && Math.abs(v1) <= 12) y1Pts.push([x, v1]);
      if (Number.isFinite(v2) && Math.abs(v2) <= 12) y2Pts.push([x, v2]);
      if (Number.isFinite(wv) && Math.abs(wv) <= 12) wPts.push([x, wv]);

      if (x <= x0) {
        if (
          Number.isFinite(v1) &&
          Number.isFinite(d1) &&
          Math.abs(v1) <= 8 &&
          Math.abs(d1) <= 8
        ) {
          phase1Pts.push([v1, d1]);
        }
        if (
          Number.isFinite(v2) &&
          Number.isFinite(d2) &&
          Math.abs(v2) <= 8 &&
          Math.abs(d2) <= 8
        ) {
          phase2Pts.push([v2, d2]);
        }
      }
    }

    return { y1Pts, y2Pts, wPts, phase1Pts, phase2Pts };
  }, [evalPair, preset.xRange, x0]);

  const probe = useMemo(() => {
    const v1 = evalPair.y1(x0);
    const v2 = evalPair.y2(x0);
    const d1 = evalPair.dy1(x0);
    const d2 = evalPair.dy2(x0);
    const wVal =
      Number.isFinite(v1) &&
      Number.isFinite(v2) &&
      Number.isFinite(d1) &&
      Number.isFinite(d2)
        ? v1 * d2 - v2 * d1
        : NaN;

    const wAtZero = evalPair.w(0);
    const abelPred =
      preset.pValue !== null && !isCustom && Number.isFinite(wAtZero)
        ? wAtZero * Math.exp(-preset.pValue * x0)
        : null;

    return { v1, v2, d1, d2, wVal, wAtZero, abelPred };
  }, [evalPair, x0, preset.pValue, isCustom]);

  const isZeroWronskian =
    Number.isFinite(probe.wVal) && Math.abs(probe.wVal) < 1e-4;
  const maxAbsW = useMemo(() => {
    let m = 0;
    for (const [, val] of sampledCurves.wPts) {
      if (Math.abs(val) > m) m = Math.abs(val);
    }
    return m;
  }, [sampledCurves.wPts]);

  const clampPolyY = (y: number) =>
    Math.max(preset.yRange[0] - 0.3, Math.min(preset.yRange[1] + 0.3, y));

  const buildPolyline = (
    pts: [number, number][],
    toSvgX: (x: number) => number,
    toSvgY: (y: number) => number,
    clampYFn?: (y: number) => number
  ) =>
    pts
      .map(
        ([px, py]) =>
          `${toSvgX(px).toFixed(1)},${toSvgY(clampYFn ? clampYFn(py) : py).toFixed(1)}`
      )
      .join(" ");

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[#96B898]">
            <span>Lab 3.1.10A</span>
            <span>•</span>
            <span>Wronskian &amp; Linear Independence</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            Wronskian Determinant as Signed Phase-Plane Parallelogram Area
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Two functions <KaTeXMath math="y_1(x)" /> and <KaTeXMath math="y_2(x)" />{" "}
            form state vectors{" "}
            <KaTeXMath math="\mathbf{Y}_k(x) = (y_k(x),\, y_k'(x))" /> in the{" "}
            <KaTeXMath math="(y, y')" /> phase plane. Their determinant{" "}
            <KaTeXMath math="W(x) = y_1 y_2' - y_2 y_1'" /> equals the signed area
            spanned by <KaTeXMath math="\mathbf{Y}_1" /> and{" "}
            <KaTeXMath math="\mathbf{Y}_2" />.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:border-[#96B898]"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#D35323]" /> Pause Sweep
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#96B898]" /> Animate x₀
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {WRONSKIAN_PRESETS.map((p) => {
          const active = !isCustom && p.id === preset.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                active
                  ? "border-[#96B898] bg-[var(--bg-canvas)] text-[#96B898] font-medium"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Function Inputs & Probe Scrubber */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <MathExpressionInput
          label="First Solution y₁(x)"
          prefixLatex="y_1(x) ="
          value={y1Expr}
          onChange={(val) => {
            setY1Expr(val);
            setIsCustom(true);
          }}
          allowedVars={["x"]}
        />
        <MathExpressionInput
          label="Second Solution y₂(x)"
          prefixLatex="y_2(x) ="
          value={y2Expr}
          onChange={(val) => {
            setY2Expr(val);
            setIsCustom(true);
          }}
          allowedVars={["x"]}
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">
              Evaluation Point <KaTeXMath math="x_0" />
            </span>
            <span className="font-tabular-mono font-semibold text-[#D35323]">
              x₀ = {x0.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={preset.xRange[0]}
            max={preset.xRange[1]}
            step={0.02}
            value={x0}
            onChange={(e) => {
              setIsPlaying(false);
              setX0(Number(e.target.value));
            }}
            aria-label="Evaluation point x0"
            className="w-full accent-[#D35323]"
          />
          <p className="text-[11px] text-[var(--text-secondary)] font-sans">
            Click anywhere on the left time-domain plot or drag <KaTeXMath math="x_0" />{" "}
            to watch the phase parallelogram evolve.
          </p>
        </div>
      </div>

      {/* Synchronized Dual Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Functions & W(x) vs x */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="font-medium text-[var(--text-primary)]">
              1. Time Domain: <KaTeXMath math="y_1(x),\, y_2(x)" /> &amp;{" "}
              <KaTeXMath math="W(x)" />
            </span>
            <span className="font-tabular-mono text-[var(--text-secondary)]">
              Click plot to move x₀
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.yRange}
            width={460}
            height={310}
            xLabel="x"
            yLabel="value"
            xColor="#8D9FCE"
            yColor="#AAA36D"
            ariaLabel="Plot of y1(x), y2(x), and Wronskian W(x)"
            onSelectPoint={(wx) => {
              setIsPlaying(false);
              setX0(Number(wx.toFixed(2)));
            }}
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const probeX = toSvgX(x0);
              return (
                <>
                  {/* Wronskian W(x) curve */}
                  {sampledCurves.wPts.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#D35323"
                      strokeWidth={2.4}
                      points={buildPolyline(
                        sampledCurves.wPts,
                        toSvgX,
                        toSvgY,
                        clampPolyY
                      )}
                    />
                  )}
                  {/* y1(x) */}
                  {sampledCurves.y1Pts.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#8D9FCE"
                      strokeWidth={2}
                      points={buildPolyline(
                        sampledCurves.y1Pts,
                        toSvgX,
                        toSvgY,
                        clampPolyY
                      )}
                    />
                  )}
                  {/* y2(x) */}
                  {sampledCurves.y2Pts.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#96B898"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      points={buildPolyline(
                        sampledCurves.y2Pts,
                        toSvgX,
                        toSvgY,
                        clampPolyY
                      )}
                    />
                  )}

                  {/* Probe vertical line */}
                  <line
                    x1={probeX}
                    y1={32}
                    x2={probeX}
                    y2={310 - 32}
                    stroke="#FBEAA4"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />

                  {/* Dots at x0 */}
                  {Number.isFinite(probe.v1) && (
                    <circle
                      cx={probeX}
                      cy={toSvgY(clampPolyY(probe.v1))}
                      r={4.2}
                      fill="#8D9FCE"
                      stroke="#1E1F22"
                      strokeWidth={1.2}
                    />
                  )}
                  {Number.isFinite(probe.v2) && (
                    <circle
                      cx={probeX}
                      cy={toSvgY(clampPolyY(probe.v2))}
                      r={4.2}
                      fill="#96B898"
                      stroke="#1E1F22"
                      strokeWidth={1.2}
                    />
                  )}
                  {Number.isFinite(probe.wVal) && (
                    <circle
                      cx={probeX}
                      cy={toSvgY(clampPolyY(probe.wVal))}
                      r={5}
                      fill="#D35323"
                      stroke="#FBEAA4"
                      strokeWidth={1.5}
                    />
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>

          <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#8D9FCE] inline-block" /> y₁(x)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-[#96B898] inline-block" />{" "}
              y₂(x)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#D35323] inline-block" /> W(x)
            </span>
          </div>
        </div>

        {/* Right: Phase Plane (y, y') Parallelogram */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="font-medium text-[var(--text-primary)]">
              2. Phase Plane <KaTeXMath math="(y, y')" /> Parallelogram at{" "}
              <KaTeXMath math={`x_0=${x0.toFixed(2)}`} />
            </span>
            <span
              className={`font-tabular-mono text-xs px-2 py-0.5 border ${
                isZeroWronskian
                  ? "border-[#B95869] text-[#B95869] bg-[var(--bg-canvas)]"
                  : "border-[#96B898] text-[#96B898] bg-[var(--bg-canvas)]"
              }`}
            >
              {isZeroWronskian ? "COLLINEAR (W ≈ 0)" : "NON-ZERO AREA (W ≠ 0)"}
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={preset.phaseRange}
            yRange={preset.phaseRange}
            width={460}
            height={310}
            xLabel="y"
            yLabel="y'"
            xColor="#8D9FCE"
            yColor="#96B898"
            ariaLabel="Phase plane parallelogram spanned by state vectors Y1 and Y2"
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const ox = toSvgX(0);
              const oy = toSvgY(0);
              const validVectors =
                Number.isFinite(probe.v1) &&
                Number.isFinite(probe.d1) &&
                Number.isFinite(probe.v2) &&
                Number.isFinite(probe.d2);

              const p1x = validVectors ? toSvgX(probe.v1) : ox;
              const p1y = validVectors ? toSvgY(probe.d1) : oy;
              const p2x = validVectors ? toSvgX(probe.v2) : ox;
              const p2y = validVectors ? toSvgY(probe.d2) : oy;
              const sumX = validVectors ? toSvgX(probe.v1 + probe.v2) : ox;
              const sumY = validVectors ? toSvgY(probe.d1 + probe.d2) : oy;

              const polyFill =
                probe.wVal >= 0
                  ? "rgba(251, 234, 164, 0.24)"
                  : "rgba(185, 88, 105, 0.24)";
              const polyStroke = probe.wVal >= 0 ? "#FBEAA4" : "#B95869";

              return (
                <>
                  <defs>
                    <marker
                      id="w-arrow-1"
                      markerWidth="7"
                      markerHeight="7"
                      refX="5"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 7 3.5, 0 7" fill="#8D9FCE" />
                    </marker>
                    <marker
                      id="w-arrow-2"
                      markerWidth="7"
                      markerHeight="7"
                      refX="5"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 7 3.5, 0 7" fill="#96B898" />
                    </marker>
                  </defs>

                  {/* Historical Phase Trails */}
                  {sampledCurves.phase1Pts.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#8D9FCE"
                      strokeOpacity={0.35}
                      strokeWidth={1.3}
                      points={buildPolyline(
                        sampledCurves.phase1Pts,
                        toSvgX,
                        toSvgY
                      )}
                    />
                  )}
                  {sampledCurves.phase2Pts.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#96B898"
                      strokeOpacity={0.35}
                      strokeWidth={1.3}
                      strokeDasharray="4 3"
                      points={buildPolyline(
                        sampledCurves.phase2Pts,
                        toSvgX,
                        toSvgY
                      )}
                    />
                  )}

                  {/* Parallelogram Area */}
                  {validVectors && (
                    <polygon
                      points={`${ox},${oy} ${p1x},${p1y} ${sumX},${sumY} ${p2x},${p2y}`}
                      fill={polyFill}
                      stroke={polyStroke}
                      strokeWidth={1.3}
                    />
                  )}

                  {/* State Vector Y1 */}
                  {validVectors && (
                    <>
                      <line
                        x1={ox}
                        y1={oy}
                        x2={p1x}
                        y2={p1y}
                        stroke="#8D9FCE"
                        strokeWidth={2.4}
                        markerEnd="url(#w-arrow-1)"
                      />
                      <text
                        x={p1x + 6}
                        y={p1y - 6}
                        fill="#8D9FCE"
                        fontSize="11"
                        fontFamily="IBM Plex Sans, sans-serif"
                        fontWeight="600"
                      >
                        Y₁
                      </text>
                    </>
                  )}

                  {/* State Vector Y2 */}
                  {validVectors && (
                    <>
                      <line
                        x1={ox}
                        y1={oy}
                        x2={p2x}
                        y2={p2y}
                        stroke="#96B898"
                        strokeWidth={2.4}
                        markerEnd="url(#w-arrow-2)"
                      />
                      <text
                        x={p2x + 6}
                        y={p2y + 12}
                        fill="#96B898"
                        fontSize="11"
                        fontFamily="IBM Plex Sans, sans-serif"
                        fontWeight="600"
                      >
                        Y₂
                      </text>
                    </>
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>

          <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 border border-[#FBEAA4] bg-[#FBEAA4]/25 inline-block" />{" "}
              Positive Area (<KaTeXMath math="W > 0" />)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 border border-[#B95869] bg-[#B95869]/25 inline-block" />{" "}
              Negative Orientation (<KaTeXMath math="W < 0" />)
            </span>
          </div>
        </div>
      </div>

      {/* Live Wronskian Matrix & Abel's Identity Readout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-tabular-mono uppercase text-[#8D9FCE]">
            <Sparkles className="w-3.5 h-3.5" /> Live Determinant Matrix
          </div>
          <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math={`W(${x0.toFixed(2)}) = \\begin{vmatrix} ${
                Number.isFinite(probe.v1) ? probe.v1.toFixed(3) : "\\text{NaN}"
              } & ${
                Number.isFinite(probe.v2) ? probe.v2.toFixed(3) : "\\text{NaN}"
              } \\\\ ${
                Number.isFinite(probe.d1) ? probe.d1.toFixed(3) : "\\text{NaN}"
              } & ${
                Number.isFinite(probe.d2) ? probe.d2.toFixed(3) : "\\text{NaN}"
              } \\end{vmatrix} = ${
                Number.isFinite(probe.wVal) ? probe.wVal.toFixed(4) : "\\text{NaN}"
              }`}
              block
            />
          </div>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono uppercase text-[#D35323] block">
            Independence Verdict
          </span>
          <p className="text-sm font-serif font-semibold text-[var(--text-primary)]">
            {maxAbsW > 1e-4
              ? "Linearly Independent Basis"
              : "W(x) ≡ 0 Across Sample Window"}
          </p>
          <p className="text-xs text-[var(--text-secondary)] font-serif">
            {maxAbsW > 1e-4
              ? `Since max |W(x)| = ${maxAbsW.toFixed(4)} ≠ 0, no non-trivial constants satisfy c₁y₁ + c₂y₂ ≡ 0.`
              : "Both state vectors stay parallel everywhere sampled; y₂ is a scalar multiple of y₁ if both solve the same regular linear ODE."}
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono uppercase text-[#96B898] block">
            Abel&apos;s Identity Check
          </span>
          {!isCustom && probe.abelPred !== null ? (
            <>
              <div className="text-xs overflow-x-auto">
                <KaTeXMath math={preset.odeLatex} block />
              </div>
              <p className="text-xs font-tabular-mono text-[var(--text-secondary)]">
                Abel Prediction: W(0)e^(-px₀) ={" "}
                <span className="text-[#FBEAA4] font-semibold">
                  {probe.abelPred.toFixed(4)}
                </span>
              </p>
            </>
          ) : (
            <p className="text-xs text-[var(--text-secondary)] font-serif">
              {!isCustom ? preset.note : "Custom basis active — W(x) is evaluated via central finite difference derivatives (h = 10⁻⁴)."}
            </p>
          )}
        </div>
      </div>

      {!isCustom && (
        <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
          <strong className="text-[var(--text-primary)] font-sans">
            Geometric Insight:
          </strong>{" "}
          {preset.note}
        </div>
      )}
    </section>
  );
}
