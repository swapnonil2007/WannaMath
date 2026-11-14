"use client";

import React, { useState, useMemo } from "react";
import { StepForward, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

interface NewtonPreset {
  id: string;
  label: string;
  expr: string;
  defaultX0: number;
  defaultAnchorA: number;
  defaultDx: number;
  xRange: [number, number];
  yRange: [number, number];
  note: string;
}

const NEWTON_PRESETS: NewtonPreset[] = [
  {
    id: "sqrt2",
    label: "Quadratic Convergence: x² - 2",
    expr: "x^2 - 2",
    defaultX0: 2.3,
    defaultAnchorA: 1.0,
    defaultDx: 0.6,
    xRange: [-0.5, 2.8],
    yRange: [-2.5, 4.5],
    note: "Starting near x₀ = 2.3, Newton tangents double correct decimal digits every iteration—reaching √2 ≈ 1.414214 in just 4 steps.",
  },
  {
    id: "dottie",
    label: "Transcendental: cos(x) - x",
    expr: "cos(x) - x",
    defaultX0: 1.8,
    defaultAnchorA: 0.5,
    defaultDx: 0.5,
    xRange: [-0.5, 2.4],
    yRange: [-2.5, 2.0],
    note: "Whereas bisection shrinks error linearly by 1/2 per step, tangent shooting locks onto the fixed point 0.739085 rapidly.",
  },
  {
    id: "stationary-trap",
    label: "Stationary Trap & Cycle: x³ - 2x + 2",
    expr: "x^3 - 2*x + 2",
    defaultX0: 0.05,
    defaultAnchorA: 0.8,
    defaultDx: 0.4,
    xRange: [-2.4, 1.8],
    yRange: [-2.5, 4.5],
    note: "Starting near x₀ = 0 or x₀ = 1 traps Newton-Raphson in a perpetual 0 ↔ 1 oscillation! Slide x₀ < -1.2 to escape into the real root x ≈ -1.769.",
  },
];

interface NewtonStepRow {
  n: number;
  xn: number;
  fxn: number;
  dfxn: number;
  xNext: number;
}

export function NewtonRaphsonLab() {
  const [presetId, setPresetId] = useState<string>("sqrt2");
  const preset = useMemo(
    () => NEWTON_PRESETS.find((p) => p.id === presetId) ?? NEWTON_PRESETS[0],
    [presetId]
  );

  const [expr, setExpr] = useState<string>(preset.expr);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [x0, setX0] = useState<number>(preset.defaultX0);
  const [maxIters, setMaxIters] = useState<number>(4);

  // Differential error comparison anchor a + Δx
  const [anchorA, setAnchorA] = useState<number>(preset.defaultAnchorA);
  const [deltaX, setDeltaX] = useState<number>(preset.defaultDx);

  const handleSelectPreset = (p: NewtonPreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setX0(p.defaultX0);
    setAnchorA(p.defaultAnchorA);
    setDeltaX(p.defaultDx);
    setMaxIters(4);
    setIsCustom(false);
  };

  const compiled = useMemo(() => compileMathExpression(expr, ["x"]), [expr]);
  const evalF = useMemo(() => {
    return (x: number) => (compiled.valid ? compiled.evaluate({ x }) : NaN);
  }, [compiled]);

  const derivF = (x: number) => {
    const h = 1e-4;
    const fp = evalF(x + h);
    const fm = evalF(x - h);
    return (fp - fm) / (2 * h);
  };

  const model = useMemo(() => {
    // 1. Differential dy vs Δy at anchorA
    const fa = evalF(anchorA);
    const dfa = derivF(anchorA);
    const fNext = evalF(anchorA + deltaX);
    const trueDeltaY = fNext - fa;
    const diffDy = dfa * deltaX;
    const linError = trueDeltaY - diffDy;

    // 2. Newton-Raphson Cobweb iterations
    const rows: NewtonStepRow[] = [];
    let curX = x0;
    for (let n = 0; n < maxIters; n++) {
      const fxn = evalF(curX);
      const dfxn = derivF(curX);
      if (!Number.isFinite(fxn) || !Number.isFinite(dfxn) || Math.abs(dfxn) < 1e-7) {
        break;
      }
      const xNext = curX - fxn / dfxn;
      rows.push({ n, xn: curX, fxn, dfxn, xNext });
      curX = xNext;
      if (Math.abs(curX) > 25) break;
    }

    // 3. Curve polyline
    const [xMin, xMax] = preset.xRange;
    const curvePts: [number, number][] = [];
    for (let i = 0; i <= 180; i++) {
      const px = xMin + ((xMax - xMin) * i) / 180;
      const py = evalF(px);
      if (Number.isFinite(py) && Math.abs(py) < 15) curvePts.push([px, py]);
    }

    return { fa, dfa, fNext, trueDeltaY, diffDy, linError, rows, curvePts };
  }, [evalF, anchorA, deltaX, x0, maxIters, preset.xRange]);

  const toPoly = (
    pts: [number, number][],
    toSvgX: (x: number) => number,
    toSvgY: (y: number) => number
  ) =>
    pts
      .map(([px, py]) => {
        const cy = Math.max(
          preset.yRange[0] - 0.5,
          Math.min(preset.yRange[1] + 0.5, py)
        );
        return `${toSvgX(px).toFixed(1)},${toSvgY(cy).toFixed(1)}`;
      })
      .join(" ");

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)]">
            <span>Lab 1.2.2A</span>
            <span>•</span>
            <span>Local Linearity &amp; Root Shooting</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            Differential Error (<KaTeXMath math="\Delta y \approx dy" />) &amp;
            Newton-Raphson Iteration Lab
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Compare the tangent differential{" "}
            <KaTeXMath math="dy = f'(a)\,\Delta x" /> against true increment{" "}
            <KaTeXMath math="\Delta y" /> (Left), and step through tangent-line
            root finding <KaTeXMath math="x_{n+1} = x_n - f(x_n)/f'(x_n)" />{" "}
            (Right).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMaxIters((m) => Math.min(8, m + 1))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-[var(--math-ink-z)]"
          >
            <StepForward className="w-3.5 h-3.5" /> Add Newton Step
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
        {NEWTON_PRESETS.map((p) => {
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
            <span className="text-[var(--text-secondary)]">Linearization Anchor a</span>
            <span className="font-tabular-mono text-[var(--math-ink-x)]">
              a = {anchorA.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={preset.xRange[0] + 0.3}
            max={preset.xRange[1] - 0.5}
            step={0.05}
            value={anchorA}
            onChange={(e) => setAnchorA(Number(e.target.value))}
            aria-label="Linearization anchor a"
            className="w-full accent-[#8D9FCE]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Perturbation Δx</span>
            <span className="font-tabular-mono text-[var(--math-ink-y)]">
              Δx = {deltaX.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={-0.8}
            max={1.0}
            step={0.02}
            value={deltaX}
            onChange={(e) => setDeltaX(Number(e.target.value))}
            aria-label="Perturbation delta x"
            className="w-full accent-[#96B898]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Newton Initial Seed x₀</span>
            <span className="font-tabular-mono text-[var(--math-ink-sweep)]">
              x₀ = {x0.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={preset.xRange[0] + 0.1}
            max={preset.xRange[1] - 0.1}
            step={0.05}
            value={x0}
            onChange={(e) => setX0(Number(e.target.value))}
            aria-label="Newton initial seed x0"
            className="w-full accent-[#D35323]"
          />
        </div>
      </div>

      {/* Dual Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Differential dy vs Δy */}
        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            1. Tangent Differential <KaTeXMath math="dy" /> vs. True Increment{" "}
            <KaTeXMath math="\Delta y" />
          </span>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.yRange}
            width={460}
            height={290}
            xLabel="x"
            yLabel="y"
            xColor="#8D9FCE"
            yColor="#96B898"
            ariaLabel="Comparison between linear differential dy and true increment delta y"
            className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const xL = preset.xRange[0];
              const xR = preset.xRange[1];
              const xNext = anchorA + deltaX;
              const linYNext = model.fa + model.diffDy;
              return (
                <>
                  {model.curvePts.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#FBEAA4"
                      strokeWidth={2.2}
                      points={toPoly(model.curvePts, toSvgX, toSvgY)}
                    />
                  )}
                  {Number.isFinite(model.dfa) && Number.isFinite(model.fa) && (
                    <line
                      x1={toSvgX(xL)}
                      y1={toSvgY(model.fa + model.dfa * (xL - anchorA))}
                      x2={toSvgX(xR)}
                      y2={toSvgY(model.fa + model.dfa * (xR - anchorA))}
                      stroke="#029091"
                      strokeWidth={1.8}
                    />
                  )}
                  {/* Horizontal base & vertical Δx / dy / residual */}
                  {Number.isFinite(model.fa) && Number.isFinite(model.fNext) && (
                    <>
                      <line
                        x1={toSvgX(anchorA)}
                        y1={toSvgY(model.fa)}
                        x2={toSvgX(xNext)}
                        y2={toSvgY(model.fa)}
                        stroke="#8D9FCE"
                        strokeDasharray="4 3"
                      />
                      {/* dy segment */}
                      <line
                        x1={toSvgX(xNext)}
                        y1={toSvgY(model.fa)}
                        x2={toSvgX(xNext)}
                        y2={toSvgY(linYNext)}
                        stroke="#029091"
                        strokeWidth={3}
                      />
                      {/* Residual Δy - dy */}
                      <line
                        x1={toSvgX(xNext)}
                        y1={toSvgY(linYNext)}
                        x2={toSvgX(xNext)}
                        y2={toSvgY(model.fNext)}
                        stroke="#B95869"
                        strokeWidth={3.2}
                      />
                      <circle
                        cx={toSvgX(anchorA)}
                        cy={toSvgY(model.fa)}
                        r={4.2}
                        fill="#8D9FCE"
                      />
                      <circle
                        cx={toSvgX(xNext)}
                        cy={toSvgY(model.fNext)}
                        r={4.2}
                        fill="#FBEAA4"
                      />
                    </>
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>

          <div className="grid grid-cols-3 gap-2 p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono">
            <div>
              Δy = <span className="text-[var(--math-ink-diff)]">{model.trueDeltaY.toFixed(4)}</span>
            </div>
            <div>
              dy = <span className="text-[var(--math-ink-z)]">{model.diffDy.toFixed(4)}</span>
            </div>
            <div>
              err = <span className="text-[var(--math-ink-upper)]">{model.linError.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* Right: Newton-Raphson Tangent Shooting */}
        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            2. Newton-Raphson Tangent Steps ({maxIters} iterations)
          </span>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.yRange}
            width={460}
            height={290}
            xLabel="x"
            yLabel="f(x)"
            xColor="#8D9FCE"
            yColor="#D35323"
            ariaLabel="Newton-Raphson tangent iterations converging toward zero crossing"
            onSelectPoint={(wx) => setX0(Number(wx.toFixed(2)))}
            className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {model.curvePts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#FBEAA4"
                    strokeWidth={2.2}
                    points={toPoly(model.curvePts, toSvgX, toSvgY)}
                  />
                )}
                {model.rows.map((r) => {
                  const clX = Math.max(
                    preset.xRange[0],
                    Math.min(preset.xRange[1], r.xn)
                  );
                  const clNext = Math.max(
                    preset.xRange[0],
                    Math.min(preset.xRange[1], r.xNext)
                  );
                  const clY = Math.max(
                    preset.yRange[0],
                    Math.min(preset.yRange[1], r.fxn)
                  );
                  return (
                    <g key={r.n}>
                      {/* Vertical drop from (xn, 0) to (xn, f(xn)) */}
                      <line
                        x1={toSvgX(clX)}
                        y1={toSvgY(0)}
                        x2={toSvgX(clX)}
                        y2={toSvgY(clY)}
                        stroke="#8D9FCE"
                        strokeDasharray="3 3"
                        strokeWidth={1.2}
                      />
                      {/* Tangent shot from (xn, f(xn)) to (x_{n+1}, 0) */}
                      <line
                        x1={toSvgX(clX)}
                        y1={toSvgY(clY)}
                        x2={toSvgX(clNext)}
                        y2={toSvgY(0)}
                        stroke="#D35323"
                        strokeWidth={1.8}
                      />
                      <circle
                        cx={toSvgX(clX)}
                        cy={toSvgY(clY)}
                        r={3.5}
                        fill="#029091"
                      />
                      <circle
                        cx={toSvgX(clNext)}
                        cy={toSvgY(0)}
                        r={3.2}
                        fill="#D35323"
                      />
                    </g>
                  );
                })}
              </>
            )}
          </SvgCoordinatePlane2D>

          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] max-h-28 overflow-y-auto">
            <table className="w-full text-left border-collapse text-[11px] font-tabular-mono">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)]">
                <tr>
                  <th className="p-1.5">n</th>
                  <th className="p-1.5">x_n</th>
                  <th className="p-1.5">f(x_n)</th>
                  <th className="p-1.5 text-[var(--math-ink-sweep)]">x_{"{n+1}"}</th>
                </tr>
              </thead>
              <tbody>
                {model.rows.map((r) => (
                  <tr key={r.n} className="border-b border-[var(--border-subtle)] last:border-b-0">
                    <td className="p-1.5">{r.n}</td>
                    <td className="p-1.5 text-[var(--math-ink-x)]">{r.xn.toFixed(6)}</td>
                    <td className="p-1.5">{r.fxn.toExponential(2)}</td>
                    <td className="p-1.5 text-[var(--math-ink-sweep)] font-semibold">
                      {r.xNext.toFixed(6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {!isCustom && (
        <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
          <strong className="text-[var(--text-primary)] font-sans">
            Convergence Note:
          </strong>{" "}
          {preset.note}
        </div>
      )}
    </section>
  );
}
