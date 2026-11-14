"use client";

import React, { useState, useMemo } from "react";
import { Crosshair, Eye, Trash2, GitBranch } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  SvgCoordinatePlane2D,
  extractLevelCurveSegments,
} from "@/components/visualizations/primitives/core2d";

interface SlopeFieldPreset {
  id: string;
  name: string;
  badge: string;
  expr: string;
  defaultSeeds: [number, number][];
  formulaLatex: string;
  insight: string;
}

const SLOPE_PRESETS: SlopeFieldPreset[] = [
  {
    id: "ac-forced-linear",
    name: "RC Circuit / Forced Linear: y' = cos(2t) - 0.6y",
    badge: "Transient → Steady State",
    expr: "cos(2 * t) - 0.6 * y",
    defaultSeeds: [
      [-1.5, 1.8],
      [-1.5, -1.6],
      [-1.5, 0.2],
    ],
    formulaLatex: "\\frac{dy}{dt} + 0.6y = \\cos(2t)",
    insight:
      "Every initial condition forgets its past via the homogeneous decay exp(-0.6t) and funnels cleanly onto the same steady-state sinusoidal attractor.",
  },
  {
    id: "logistic-capacity",
    name: "Logistic Carrying Capacity: y' = 0.9y(1 - y/1.8)",
    badge: "Autonomous Funnel",
    expr: "0.9 * y * (1 - y / 1.8)",
    defaultSeeds: [
      [-1.6, 0.2],
      [-1.6, 2.3],
      [-1.6, -0.35],
    ],
    formulaLatex: "\\frac{dy}{dt} = 0.9y\\left(1 - \\frac{y}{1.8}\\right)",
    insight:
      "Notice horizontal isoclines: trajectories never cross the equilibrium ceilings y = 1.8 (stable) and y = 0 (unstable), satisfying Picard–Lindelöf uniqueness everywhere.",
  },
  {
    id: "saddle-hyperbolic",
    name: "Time-Varying Saddle Field: y' = t² - y²",
    badge: "Nonlinear Nullclines",
    expr: "t^2 - y^2",
    defaultSeeds: [
      [-1.2, 0.3],
      [0.2, 1.1],
      [-1.8, -1.2],
    ],
    formulaLatex: "\\frac{dy}{dt} = t^2 - y^2 = (t - y)(t + y)",
    insight:
      "Zero-slope isoclines (c = 0) trace the crossing lines y = ±t where trajectories briefly turn horizontal before diverging or funneling toward a common asymptote.",
  },
  {
    id: "picard-nonunique",
    name: "Picard Breakdown (Peano Funnel): y' = 1.4 · abs(y)^(2/3)",
    badge: "Non-Unique at y = 0!",
    expr: "1.4 * abs(y)^(2/3)",
    defaultSeeds: [
      [-0.8, 0.0],
      [-1.4, -0.5],
      [0.2, 0.45],
    ],
    formulaLatex:
      "\\frac{dy}{dt} = 1.4|y|^{2/3}, \\qquad \\frac{\\partial f}{\\partial y} \\to \\infty \\text{ as } y\\to 0",
    insight:
      "Continuity of f ensures at least one solution through y(t₀) = 0, but ∂f/∂y blows up along y = 0—breaking Lipschitz uniqueness so y(t) ≡ 0 and cubic branches peel off the axis!",
  },
];

export function SlopeFieldTracerLab() {
  const [presetId, setPresetId] = useState<string>("ac-forced-linear");
  const [expr, setExpr] = useState<string>(SLOPE_PRESETS[0].expr);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [seeds, setSeeds] = useState<[number, number][]>(
    SLOPE_PRESETS[0].defaultSeeds
  );
  const [keepMultiple, setKeepMultiple] = useState<boolean>(true);
  const [showIsoclines, setShowIsoclines] = useState<boolean>(true);
  const [isoclineSlopeC, setIsoclineSlopeC] = useState<number>(0);
  const [showEulerCompare, setShowEulerCompare] = useState<boolean>(true);
  const [eulerStepH, setEulerStepH] = useState<number>(0.45);

  const activePreset = useMemo(
    () => SLOPE_PRESETS.find((p) => p.id === presetId) ?? SLOPE_PRESETS[0],
    [presetId]
  );

  const compiledFn = useMemo(
    () => compileMathExpression(expr, ["t", "y"]),
    [expr]
  );

  const bounds = { tMin: -2.4, tMax: 2.4, yMin: -2.4, yMax: 2.4 };

  const handleSelectPreset = (p: SlopeFieldPreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setSeeds(p.defaultSeeds);
    setIsCustom(false);
  };

  // Evaluate slope ticks, RK4 trajectories, Euler comparison path, and Isocline segments
  const labData = useMemo(() => {
    const evalF = (t: number, y: number) => {
      const val = compiledFn.evaluate({ t, y });
      return Number.isFinite(val) ? Math.max(-25, Math.min(25, val)) : 0;
    };

    // 1. Slope Field Grid Ticks (15 x 15)
    const ticks: {
      t: number;
      y: number;
      dt: number;
      dy: number;
      slope: number;
    }[] = [];
    const nGrid = 14;
    for (let i = 0; i <= nGrid; i++) {
      const t = -2.15 + (i / nGrid) * 4.3;
      for (let j = 0; j <= nGrid; j++) {
        const y = -2.15 + (j / nGrid) * 4.3;
        const slope = evalF(t, y);
        const norm = Math.hypot(1, slope);
        const halfLen = 0.11;
        ticks.push({
          t,
          y,
          dt: (1 / norm) * halfLen,
          dy: (slope / norm) * halfLen,
          slope,
        });
      }
    }

    // 2. RK4 Integral Curve Builder (forward + backward from seed)
    const integrateRK4 = (t0: number, y0: number) => {
      const march = (dir: 1 | -1) => {
        const pts: [number, number][] = [[t0, y0]];
        let t = t0;
        let y = y0;
        const h = 0.035 * dir;
        for (let k = 0; k < 145; k++) {
          const k1 = evalF(t, y);
          const k2 = evalF(t + 0.5 * h, y + 0.5 * h * k1);
          const k3 = evalF(t + 0.5 * h, y + 0.5 * h * k2);
          const k4 = evalF(t + h, y + h * k3);
          t += h;
          y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
          if (
            !Number.isFinite(y) ||
            t < bounds.tMin - 0.1 ||
            t > bounds.tMax + 0.1 ||
            y < bounds.yMin - 0.35 ||
            y > bounds.yMax + 0.35
          ) {
            break;
          }
          pts.push([t, y]);
        }
        return pts;
      };
      return {
        fwd: march(1),
        bwd: march(-1),
      };
    };

    const rk4Curves = seeds.map(([t0, y0], idx) => ({
      idx,
      seed: [t0, y0] as [number, number],
      ...integrateRK4(t0, y0),
    }));

    // 3. Explicit Euler Comparison for Primary Seed (seeds[0])
    const primarySeed = seeds[0] ?? [-1.2, 0.8];
    const eulerFwd: [number, number][] = [[primarySeed[0], primarySeed[1]]];
    if (showEulerCompare) {
      let t = primarySeed[0];
      let y = primarySeed[1];
      const h = eulerStepH;
      for (let k = 0; k < 30; k++) {
        const s = evalF(t, y);
        t += h;
        y += h * s;
        if (
          !Number.isFinite(y) ||
          t > bounds.tMax + 0.1 ||
          y < bounds.yMin - 0.5 ||
          y > bounds.yMax + 0.5
        ) {
          break;
        }
        eulerFwd.push([t, y]);
      }
    }

    // Compare Euler vs RK4 at the last valid Euler t inside bounds
    const lastEuler = eulerFwd[eulerFwd.length - 1];
    const rkCurvesPrimary = rk4Curves[0]?.fwd ?? [];
    let rkAtEulerT = primarySeed[1];
    if (lastEuler && rkCurvesPrimary.length > 0) {
      let bestDist = Infinity;
      for (const [rt, ry] of rkCurvesPrimary) {
        const d = Math.abs(rt - lastEuler[0]);
        if (d < bestDist) {
          bestDist = d;
          rkAtEulerT = ry;
        }
      }
    }
    const eulerDrift = lastEuler ? Math.abs(lastEuler[1] - rkAtEulerT) : 0;

    // 4. Marching Squares Isocline f(t, y) = c
    const isoclineSegs = showIsoclines
      ? extractLevelCurveSegments(
          evalF,
          bounds.tMin,
          bounds.tMax,
          bounds.yMin,
          bounds.yMax,
          isoclineSlopeC,
          36,
          36
        )
      : [];

    // 5. Local Seed Slope & Lipschitz ∂f/∂y Diagnostics
    const [pt, py] = primarySeed;
    const fVal = evalF(pt, py);
    const angleDeg = (Math.atan(fVal) * 180) / Math.PI;
    const eps = 1e-4;
    const dfdy = (evalF(pt, py + eps) - evalF(pt, py - eps)) / (2 * eps);

    return {
      ticks,
      rk4Curves,
      eulerFwd,
      eulerDrift,
      isoclineSegs,
      primarySeed,
      fVal,
      angleDeg,
      dfdy,
    };
  }, [compiledFn, seeds, showIsoclines, isoclineSlopeC, showEulerCompare, eulerStepH]);

  return (
    <section
      id="slope-field-particle-tracer"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
            Laboratory 4.1.1.1 • Direction Fields, Isoclines &amp; Numerical Integration
          </span>
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
            Interactive Slope Field, Picard Funnel &amp; RK4 vs. Euler Trajectory Lab
          </h2>
          <p className="text-sm font-math-serif text-[var(--text-secondary)]">
            Click anywhere in the <KaTeXMath math="(t, y)" /> plane to launch forward/backward
            integral curves, toggle constant-slope isoclines{" "}
            <KaTeXMath math="f(t,y) = c" />, and observe explicit Euler overshoot against RK4.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setKeepMultiple((v) => !v)}
            className={`px-3 py-1.5 text-xs font-tabular-mono border transition-colors ${
              keepMultiple
                ? "border-[var(--math-ink-y)] bg-[#96B898]/15 text-[var(--math-ink-y)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)]"
            }`}
          >
            {keepMultiple ? "Multi-Curve Family: ON" : "Single Curve Only"}
          </button>
          <button
            type="button"
            onClick={() => setSeeds((prev) => [prev[0] ?? [0, 0]])}
            className="px-3 py-1.5 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Extras</span>
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {SLOPE_PRESETS.map((p) => {
          const selected = !isCustom && presetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`p-3 border text-left transition-colors ${
                selected
                  ? "border-[var(--math-ink-sweep)] bg-[var(--bg-canvas)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 hover:border-[var(--border-strong)]"
              }`}
            >
              <span className="text-[11px] font-tabular-mono text-[var(--math-ink-sweep)] font-semibold block mb-1">
                {p.badge}
              </span>
              <div className="text-xs font-math-serif text-[var(--text-primary)] leading-snug">
                {p.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Equation Input + Formula Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-6">
          <MathExpressionInput
            label="First-Order ODE Right-Hand Side f(t, y)"
            prefixLatex="\frac{dy}{dt} ="
            value={expr}
            allowedVars={["t", "y"]}
            onChange={(val) => {
              setExpr(val);
              setIsCustom(true);
            }}
          />
        </div>
        <div className="lg:col-span-6 p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
          {!isCustom && (
            <div className="text-xs overflow-x-auto">
              <KaTeXMath math={activePreset.formulaLatex} />
            </div>
          )}
          <p className="text-xs font-math-serif text-[var(--text-secondary)]">
            {isCustom
              ? "Click anywhere on the plane to drop an initial condition (t₀, y₀) and integrate forward/backward using 4th-order Runge–Kutta."
              : activePreset.insight}
          </p>
        </div>
      </div>

      {/* Main Canvas & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-[var(--math-ink-sweep)]" />
              <span>
                Click plane to place (t₀, y₀) = ({labData.primarySeed[0].toFixed(2)},{" "}
                {labData.primarySeed[1].toFixed(2)})
              </span>
            </span>
            <span>{seeds.length} Active Seed(s)</span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[bounds.tMin, bounds.tMax]}
            yRange={[bounds.yMin, bounds.yMax]}
            xLabel="t"
            yLabel="y"
            width={460}
            height={380}
            ariaLabel="Slope field tangent ticks, isoclines, and integral trajectories"
            onSelectPoint={(t, y) => {
              const pt: [number, number] = [Number(t.toFixed(2)), Number(y.toFixed(2))];
              setSeeds((prev) =>
                keepMultiple ? [pt, ...prev.slice(0, 5)] : [pt]
              );
            }}
            className="w-full h-[380px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] cursor-crosshair select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const pathStr = (pts: [number, number][]) =>
                pts
                  .map(
                    ([pt, py], i) =>
                      `${i === 0 ? "M" : "L"}${toSvgX(pt).toFixed(1)},${toSvgY(py).toFixed(1)}`
                  )
                  .join(" ");

              return (
                <g>
                  {/* Slope Field Direction Ticks */}
                  {labData.ticks.map((tk, idx) => (
                    <line
                      key={`tk-${idx}`}
                      x1={toSvgX(tk.t - tk.dt)}
                      y1={toSvgY(tk.y - tk.dy)}
                      x2={toSvgX(tk.t + tk.dt)}
                      y2={toSvgY(tk.y + tk.dy)}
                      stroke="#8D9FCE"
                      strokeOpacity="0.62"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                  ))}

                  {/* Isocline Level Curve f(t, y) = c */}
                  {labData.isoclineSegs.map((seg, idx) => (
                    <line
                      key={`iso-${idx}`}
                      x1={toSvgX(seg.x1)}
                      y1={toSvgY(seg.y1)}
                      x2={toSvgX(seg.x2)}
                      y2={toSvgY(seg.y2)}
                      stroke="#FBEAA4"
                      strokeWidth="1.75"
                      strokeOpacity="0.82"
                      strokeDasharray="4 3"
                    />
                  ))}

                  {/* RK4 Integral Trajectories */}
                  {labData.rk4Curves.map((c) => {
                    const isPrimary = c.idx === 0;
                    const color = isPrimary ? "#D35323" : "#96B898";
                    return (
                      <g key={`rk-${c.idx}`}>
                        <path
                          d={pathStr(c.fwd)}
                          fill="none"
                          stroke={color}
                          strokeWidth={isPrimary ? "2.6" : "1.8"}
                        />
                        <path
                          d={pathStr(c.bwd)}
                          fill="none"
                          stroke={color}
                          strokeWidth={isPrimary ? "2.1" : "1.5"}
                          strokeOpacity="0.72"
                        />
                        <circle
                          cx={toSvgX(c.seed[0])}
                          cy={toSvgY(c.seed[1])}
                          r={isPrimary ? "5" : "3.8"}
                          fill={color}
                          stroke="#1E1F22"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  })}

                  {/* Explicit Euler Stepwise Polyline Overlay */}
                  {showEulerCompare && labData.eulerFwd.length > 1 && (
                    <g>
                      <path
                        d={pathStr(labData.eulerFwd)}
                        fill="none"
                        stroke="#D5658B"
                        strokeWidth="2"
                        strokeDasharray="5 3"
                      />
                      {labData.eulerFwd.map(([et, ey], i) => (
                        <circle
                          key={`eu-${i}`}
                          cx={toSvgX(et)}
                          cy={toSvgY(ey)}
                          r="3"
                          fill="#D5658B"
                        />
                      ))}
                    </g>
                  )}
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-[11px] font-tabular-mono text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#D35323] inline-block" />
              <span>Primary RK4 Solution</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#96B898] inline-block" />
              <span>Companion Family Curves</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#D5658B] inline-block" />
              <span>Explicit Euler (h = {eulerStepH.toFixed(2)})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#FBEAA4] inline-block" />
              <span>Isocline (y&apos; = {isoclineSlopeC.toFixed(1)})</span>
            </span>
          </div>
        </div>

        {/* Right Controls & Diagnostics */}
        <div className="lg:col-span-5 space-y-4">
          {/* Isocline Controls */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>ISOCLINE INSPECTOR: f(t, y) = c</span>
              </span>
              <button
                type="button"
                onClick={() => setShowIsoclines((v) => !v)}
                className={`px-2 py-0.5 text-[11px] font-tabular-mono border ${
                  showIsoclines
                    ? "border-[var(--math-ink-diff)] text-[var(--math-ink-diff)]"
                    : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                }`}
              >
                {showIsoclines ? "Visible" : "Hidden"}
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-tabular-mono text-[var(--text-secondary)]">
                <span>Constant Slope Value c</span>
                <span>c = {isoclineSlopeC.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={-2.5}
                max={2.5}
                step={0.1}
                value={isoclineSlopeC}
                onChange={(e) => setIsoclineSlopeC(parseFloat(e.target.value))}
                className="w-full accent-[#FBEAA4]"
                aria-label="Isocline constant slope value c"
              />
            </div>
            <p className="text-[11px] font-math-serif text-[var(--text-secondary)]">
              When <KaTeXMath math="c = 0" />, the dashed yellow curve traces the{" "}
              <strong>nullcline</strong> where solutions cross horizontally (<KaTeXMath math="y'=0" />).
            </p>
          </div>

          {/* Euler vs RK4 Numerical Method Comparison */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-lower)] flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" />
                <span>EULER STEP-SIZE DRIFT VS. RK4</span>
              </span>
              <button
                type="button"
                onClick={() => setShowEulerCompare((v) => !v)}
                className={`px-2 py-0.5 text-[11px] font-tabular-mono border ${
                  showEulerCompare
                    ? "border-[var(--math-ink-lower)] text-[var(--math-ink-lower)]"
                    : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                }`}
              >
                {showEulerCompare ? "Compare ON" : "Compare OFF"}
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-lower)]">
                <span>Euler Step Size h</span>
                <span>h = {eulerStepH.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.85}
                step={0.05}
                value={eulerStepH}
                onChange={(e) => setEulerStepH(parseFloat(e.target.value))}
                className="w-full accent-[#D5658B]"
                aria-label="Euler step size h"
              />
            </div>
          </div>

          {/* Picard & Local Slope Telemetry */}
          <div className="grid grid-cols-2 gap-2.5 text-xs font-tabular-mono">
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <span className="text-[var(--math-ink-x)] text-[10px] block">
                SLOPE AT SEED f(t₀, y₀)
              </span>
              <span className="text-[var(--text-primary)] font-semibold">
                {labData.fVal.toFixed(3)} ({labData.angleDeg.toFixed(1)}°)
              </span>
            </div>
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <span className="text-[var(--math-ink-sweep)] text-[10px] block">
                LIPSCHITZ ∂f/∂y AT SEED
              </span>
              <span className="text-[var(--text-primary)] font-semibold">
                {Math.abs(labData.dfdy) > 20
                  ? "Unbounded / Singular!"
                  : labData.dfdy.toFixed(3)}
              </span>
            </div>
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] col-span-2 flex justify-between items-center">
              <span className="text-[var(--math-ink-lower)] text-[11px]">
                Endpoint Drift |y_Euler - y_RK4|
              </span>
              <span className="text-[var(--text-primary)] font-semibold">
                {labData.eulerDrift.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
