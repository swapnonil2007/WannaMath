"use client";

import React, { useState, useMemo, useCallback } from "react";
import { RotateCcw, Sparkles, Compass } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

interface LdePreset {
  id: string;
  label: string;
  pExpr: string;
  qExpr: string;
  xRange: [number, number];
  yRange: [number, number];
  defaultX0: number;
  defaultY0: number;
  muLatex: string;
  solutionLatex: string;
  note: string;
}

const LDE_PRESETS: LdePreset[] = [
  {
    id: "rc-decay",
    label: "Constant Decay: y' + 1.5y = 3",
    pExpr: "1.5",
    qExpr: "3",
    xRange: [-1.0, 3.6],
    yRange: [-1.5, 4.5],
    defaultX0: 0,
    defaultY0: 0.2,
    muLatex: "\\mu(x) = e^{\\int 1.5\\,dx} = e^{1.5x}",
    solutionLatex:
      "(e^{1.5x}y)' = 3e^{1.5x} \\implies y(x) = 2 + (y_0 - 2)e^{-1.5(x-x_0)}",
    note: "All initial curves exponentially relax toward the steady-state equilibrium y = 2 as the homogeneous transient dies out.",
  },
  {
    id: "euler-tank",
    label: "Variable Coefficient: y' + (2/x)y = x (x > 0)",
    pExpr: "2 / x",
    qExpr: "x",
    xRange: [0.3, 3.8],
    yRange: [-2.0, 4.5],
    defaultX0: 1.0,
    defaultY0: 1.25,
    muLatex: "\\mu(x) = e^{\\int \\frac{2}{x}dx} = x^2",
    solutionLatex:
      "(x^2 y)' = x^3 \\implies y(x) = \\frac{x^2}{4} + \\frac{C}{x^2}",
    note: "Multiplying by μ(x) = x² collapses y' + (2/x)y into the exact product derivative d/dx(x²y) = x³.",
  },
  {
    id: "sinusoidal-forcing",
    label: "Driven Forcing: y' + 0.8y = 2cos(2x)",
    pExpr: "0.8",
    qExpr: "2*cos(2*x)",
    xRange: [-1.5, 4.5],
    yRange: [-2.5, 3.0],
    defaultX0: 0.0,
    defaultY0: 2.0,
    muLatex: "\\mu(x) = e^{0.8x}",
    solutionLatex:
      "y(x) = y_h(x) + \\frac{0.8\\cos(2x)+2\\sin(2x)}{0.8^2+2^2}\\cdot 2",
    note: "Regardless of initial value (x₀, y₀), the e^(-0.8x) homogeneous term decays leaving a phase-shifted sinusoidal steady state.",
  },
  {
    id: "gaussian-if",
    label: "Gaussian Factor: y' + 2xy = 2x",
    pExpr: "2*x",
    qExpr: "2*x",
    xRange: [-2.2, 2.2],
    yRange: [-1.5, 3.5],
    defaultX0: -1.0,
    defaultY0: 2.4,
    muLatex: "\\mu(x) = e^{\\int 2x\\,dx} = e^{x^2}",
    solutionLatex:
      "(e^{x^2}y)' = 2x e^{x^2} \\implies y(x) = 1 + C e^{-x^2}",
    note: "Because μ(x) = e^(x²) grows like a reverse Gaussian, trajectories hug y = 1 away from the center.",
  },
];

function integrateTrajectoryRK4(
  slopeFn: (x: number, y: number) => number,
  x0: number,
  y0: number,
  xMin: number,
  xMax: number,
  step = 0.03
): [number, number][] {
  const backward: [number, number][] = [];
  let cx = x0;
  let cy = y0;
  for (let i = 0; i < 220 && cx > xMin; i++) {
    const h = -Math.min(step, cx - xMin);
    const k1 = slopeFn(cx, cy);
    const k2 = slopeFn(cx + h / 2, cy + (h / 2) * k1);
    const k3 = slopeFn(cx + h / 2, cy + (h / 2) * k2);
    const k4 = slopeFn(cx + h, cy + h * k3);
    const dy = (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    if (!Number.isFinite(dy) || Math.abs(cy + dy) > 25) break;
    cx += h;
    cy += dy;
    backward.push([cx, cy]);
  }
  backward.reverse();

  const forward: [number, number][] = [[x0, y0]];
  cx = x0;
  cy = y0;
  for (let i = 0; i < 220 && cx < xMax; i++) {
    const h = Math.min(step, xMax - cx);
    const k1 = slopeFn(cx, cy);
    const k2 = slopeFn(cx + h / 2, cy + (h / 2) * k1);
    const k3 = slopeFn(cx + h / 2, cy + (h / 2) * k2);
    const k4 = slopeFn(cx + h, cy + h * k3);
    const dy = (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    if (!Number.isFinite(dy) || Math.abs(cy + dy) > 25) break;
    cx += h;
    cy += dy;
    forward.push([cx, cy]);
  }

  return [...backward, ...forward];
}

export function LinearOdeIntegratingFactorLab() {
  const [presetId, setPresetId] = useState<string>(LDE_PRESETS[0].id);
  const [pExpr, setPExpr] = useState<string>(LDE_PRESETS[0].pExpr);
  const [qExpr, setQExpr] = useState<string>(LDE_PRESETS[0].qExpr);
  const [x0, setX0] = useState<number>(LDE_PRESETS[0].defaultX0);
  const [y0, setY0] = useState<number>(LDE_PRESETS[0].defaultY0);
  const [showFamily, setShowFamily] = useState<boolean>(true);

  const preset = useMemo(
    () => LDE_PRESETS.find((p) => p.id === presetId) ?? null,
    [presetId]
  );

  const compiledP = useMemo(() => compileMathExpression(pExpr, ["x"]), [pExpr]);
  const compiledQ = useMemo(() => compileMathExpression(qExpr, ["x"]), [qExpr]);

  const xRange: [number, number] = preset ? preset.xRange : [-2.5, 3.5];
  const yRange: [number, number] = preset ? preset.yRange : [-2.5, 4.5];

  const selectPreset = (p: LdePreset) => {
    setPresetId(p.id);
    setPExpr(p.pExpr);
    setQExpr(p.qExpr);
    setX0(p.defaultX0);
    setY0(p.defaultY0);
  };

  const resetDefaults = () => selectPreset(LDE_PRESETS[0]);

  const evalP = useCallback(
    (x: number) => {
      if (!compiledP.valid) return 0;
      const v = compiledP.evaluate({ x });
      return Number.isFinite(v) ? v : 0;
    },
    [compiledP]
  );

  const evalQ = useCallback(
    (x: number) => {
      if (!compiledQ.valid) return 0;
      const v = compiledQ.evaluate({ x });
      return Number.isFinite(v) ? v : 0;
    },
    [compiledQ]
  );

  const slopeFn = useCallback(
    (x: number, y: number) => evalQ(x) - evalP(x) * y,
    [evalP, evalQ]
  );

  const sim = useMemo(() => {
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;

    // Active initial-value trajectory through (x0, y0)
    const activeCurve = integrateTrajectoryRK4(slopeFn, x0, y0, xMin, xMax);

    // 4 Ghost family curves for varying C
    const ghostOffsets = [-1.6, -0.8, 0.8, 1.6];
    const ghostCurves = showFamily
      ? ghostOffsets.map((dy) =>
          integrateTrajectoryRK4(slopeFn, x0, y0 + dy, xMin, xMax)
        )
      : [];

    // Integrating factor μ(x) normalized so μ(x0) = 1: μ(x) = exp(∫_{x0}^x P(s) ds)
    const muSamples: [number, number][] = [];
    const muProdSamples: [number, number][] = [];
    const steps = 90;

    const evalMu = (xTarget: number): number => {
      const segs = 28;
      const dx = (xTarget - x0) / segs;
      let area = 0;
      for (let i = 0; i < segs; i++) {
        const xm = x0 + (i + 0.5) * dx;
        area += evalP(xm) * dx;
      }
      return Math.exp(Math.max(-6, Math.min(4.5, area)));
    };

    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const mu = evalMu(x);
      muSamples.push([x, Math.min(8, mu)]);
      const q = evalQ(x);
      muProdSamples.push([x, Math.max(-6, Math.min(8, mu * q))]);
    }

    // Slope field arrows grid
    const arrows: { x: number; y: number; dx: number; dy: number }[] = [];
    const nx = 13;
    const ny = 11;
    const cellLen = Math.min((xMax - xMin) / nx, (yMax - yMin) / ny) * 0.42;
    for (let ix = 0; ix < nx; ix++) {
      const gx = xMin + ((ix + 0.5) / nx) * (xMax - xMin);
      for (let iy = 0; iy < ny; iy++) {
        const gy = yMin + ((iy + 0.5) / ny) * (yMax - yMin);
        const m = slopeFn(gx, gy);
        if (Number.isFinite(m)) {
          const norm = Math.hypot(1, m);
          arrows.push({
            x: gx,
            y: gy,
            dx: (1 / norm) * cellLen,
            dy: (m / norm) * cellLen,
          });
        }
      }
    }

    const slopeAtInit = slopeFn(x0, y0);
    const pAtInit = evalP(x0);
    const qAtInit = evalQ(x0);

    return {
      activeCurve,
      ghostCurves,
      muSamples,
      muProdSamples,
      arrows,
      slopeAtInit,
      pAtInit,
      qAtInit,
    };
  }, [evalP, evalQ, showFamily, slopeFn, x0, xRange, y0, yRange]);

  return (
    <section
      aria-label="First-Order Linear Differential Equation and Integrating Factor Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[var(--bg-canvas)]">
              LAB 3.1.9A • LINEAR ODE y&apos; + P(x)y = Q(x) &amp; INTEGRATING FACTOR μ(x)
            </span>
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono border border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[#96B898]/10">
              IVP: y({x0.toFixed(2)}) = {y0.toFixed(2)}
            </span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
            Slope Fields, Integrating Factor Collapse (μy)&apos; = μQ &amp; Solution Families
          </h3>
        </div>

        <button
          type="button"
          onClick={resetDefaults}
          className="px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-canvas)] inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Presets & Custom P(x), Q(x) */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 space-y-4 bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap gap-2">
          {LDE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                p.id === presetId
                  ? "border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-[var(--text-primary)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MathExpressionInput
            label="Coefficient Function P(x)"
            value={pExpr}
            onChange={(v) => {
              setPExpr(v);
              setPresetId("custom");
            }}
            allowedVars={["x"]}
            prefixLatex="P(x) ="
            compact
          />
          <MathExpressionInput
            label="Forcing Function Q(x)"
            value={qExpr}
            onChange={(v) => {
              setQExpr(v);
              setPresetId("custom");
            }}
            allowedVars={["x"]}
            prefixLatex="Q(x) ="
            compact
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Initial <strong className="text-[var(--math-ink-x)] font-mono">x₀</strong> (or click graph)
              </span>
              <span className="font-tabular-mono text-[var(--math-ink-x)]">
                x₀ = {x0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={xRange[0] + 0.1}
              max={xRange[1] - 0.1}
              step={0.05}
              value={x0}
              aria-label="Initial x0"
              onChange={(e) => setX0(parseFloat(e.target.value))}
              className="w-full accent-[#8D9FCE]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Initial <strong className="text-[var(--math-ink-sweep)] font-mono">y₀</strong>
              </span>
              <span className="font-tabular-mono text-[var(--math-ink-sweep)]">
                y₀ = {y0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={yRange[0] + 0.2}
              max={yRange[1] - 0.2}
              step={0.05}
              value={y0}
              aria-label="Initial y0"
              onChange={(e) => setY0(parseFloat(e.target.value))}
              className="w-full accent-[#D35323]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex items-center justify-between">
            <span className="text-xs font-sans text-[var(--text-secondary)] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[var(--math-ink-z)]" />
              Show Family Curves (varying C)
            </span>
            <input
              type="checkbox"
              checked={showFamily}
              onChange={(e) => setShowFamily(e.target.checked)}
              aria-label="Show solution family curves"
            />
          </div>
        </div>
      </div>

      {/* Dual Viewports: Slope Field + Solution Family | Integrating Factor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
        <div className="lg:col-span-7 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              1. Slope Field y&apos; = Q(x) − P(x)y &amp; Integral Curves (Click to Place IVP)
            </span>
            <span className="text-[11px] font-tabular-mono text-[var(--math-ink-sweep)]">
              y&apos;(x₀) = {sim.slopeAtInit.toFixed(3)}
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={xRange}
            yRange={yRange}
            width={520}
            height={310}
            xLabel="x"
            yLabel="y(x)"
            xColor="#8D9FCE"
            yColor="#D35323"
            ariaLabel="Linear ODE slope field and integral curves"
            onSelectPoint={(wx, wy) => {
              setX0(Number(wx.toFixed(2)));
              setY0(Number(wy.toFixed(2)));
            }}
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {/* Slope field ticks */}
                {sim.arrows.map((a, idx) => (
                  <line
                    key={idx}
                    x1={toSvgX(a.x - a.dx / 2)}
                    y1={toSvgY(a.y - a.dy / 2)}
                    x2={toSvgX(a.x + a.dx / 2)}
                    y2={toSvgY(a.y + a.dy / 2)}
                    stroke="#8D9FCE"
                    strokeWidth={1.1}
                    opacity={0.45}
                  />
                ))}

                {/* Ghost solution family */}
                {sim.ghostCurves.map((pts, idx) => {
                  const str = pts
                    .filter(([, py]) => py >= yRange[0] - 0.5 && py <= yRange[1] + 0.5)
                    .map(([px, py]) => `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`)
                    .join(" ");
                  return (
                    str && (
                      <polyline
                        key={idx}
                        points={str}
                        fill="none"
                        stroke="#029091"
                        strokeWidth={1.3}
                        opacity={0.55}
                      />
                    )
                  );
                })}

                {/* Active particular solution */}
                <polyline
                  points={sim.activeCurve
                    .filter(([, py]) => py >= yRange[0] - 0.5 && py <= yRange[1] + 0.5)
                    .map(([px, py]) => `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`)
                    .join(" ")}
                  fill="none"
                  stroke="#D35323"
                  strokeWidth={2.6}
                />

                {/* IVP dot */}
                <circle
                  cx={toSvgX(x0)}
                  cy={toSvgY(y0)}
                  r={5.5}
                  fill="#FBEAA4"
                  stroke="#D35323"
                  strokeWidth={1.6}
                />
              </>
            )}
          </SvgCoordinatePlane2D>
        </div>

        <div className="lg:col-span-5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              2. Integrating Factor <KaTeXMath math="\mu(x)" /> (Gold) &amp;{" "}
              <KaTeXMath math="\mu Q(x)" /> (Sage)
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={xRange}
            yRange={[-2.5, 6.0]}
            width={400}
            height={310}
            xLabel="x"
            yLabel="μ(x)"
            xColor="#8D9FCE"
            yColor="#FBEAA4"
            ariaLabel="Integrating factor and weighted forcing plot"
          >
            {({ toSvgX, toSvgY }) => {
              const muStr = sim.muSamples
                .map(([px, py]) => `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`)
                .join(" ");
              const prodStr = sim.muProdSamples
                .map(([px, py]) => `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`)
                .join(" ");
              return (
                <>
                  <polyline
                    points={muStr}
                    fill="none"
                    stroke="#FBEAA4"
                    strokeWidth={2.2}
                  />
                  <polyline
                    points={prodStr}
                    fill="none"
                    stroke="#96B898"
                    strokeWidth={1.9}
                    strokeDasharray="5 3"
                  />
                  <circle cx={toSvgX(x0)} cy={toSvgY(1)} r={4.2} fill="#D35323" />
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Solution & Note Footer */}
      {preset && (
        <div className="border-t border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-elevated)]">
          <div className="p-3 border border-[var(--math-ink-sweep)]/40 bg-[var(--bg-canvas)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-sans font-semibold text-[var(--math-ink-sweep)] inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <KaTeXMath math={preset.muLatex} />
              </div>
              <p className="text-xs font-serif text-[var(--text-secondary)]">
                {preset.note}
              </p>
            </div>
            <div className="shrink-0 px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
              <KaTeXMath math={preset.solutionLatex} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
