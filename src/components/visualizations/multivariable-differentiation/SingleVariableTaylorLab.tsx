"use client";

import React, { useState, useMemo } from "react";
import { Layers, RotateCcw, Sparkles } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives";

interface Taylor1DPreset {
  id: string;
  label: string;
  expr: string;
  xRange: [number, number];
  yRange: [number, number];
  defaultX0: number;
  x0Bounds: [number, number];
  radiusNote: string;
  exactSeriesLatex: string;
  /** Exact k-th derivative at x0 for machine-precision Taylor coefficients (k = 0..6) */
  derivAt: (x0: number, k: number) => number;
}

const TAYLOR_1D_PRESETS: Taylor1DPreset[] = [
  {
    id: "sin",
    label: "sin(x) (Entire: R = ∞)",
    expr: "sin(x)",
    xRange: [-6.5, 6.5],
    yRange: [-2.6, 2.6],
    defaultX0: 0,
    x0Bounds: [-3.0, 3.0],
    radiusNote: "Alternating odd powers give infinite radius of convergence R = ∞ across ℝ.",
    exactSeriesLatex:
      "\\sin(x) = \\sum_{m=0}^{\\infty} \\frac{(-1)^m}{(2m+1)!}\\,x^{2m+1} \\quad (R=\\infty)",
    derivAt: (x0, k) => {
      const rem = k % 4;
      if (rem === 0) return Math.sin(x0);
      if (rem === 1) return Math.cos(x0);
      if (rem === 2) return -Math.sin(x0);
      return -Math.cos(x0);
    },
  },
  {
    id: "exp",
    label: "eˣ (Entire: R = ∞)",
    expr: "exp(x)",
    xRange: [-3.2, 3.2],
    yRange: [-1.5, 10.0],
    defaultX0: 0,
    x0Bounds: [-1.8, 1.8],
    radiusNote: "Every derivative reproduces eˣ⁰, yielding the sharpest exponential benchmark on ℝ.",
    exactSeriesLatex:
      "e^x = \\sum_{k=0}^{\\infty} \\frac{e^{x_0}}{k!}(x - x_0)^k \\quad (R=\\infty)",
    derivAt: (x0) => Math.exp(x0),
  },
  {
    id: "ln1px",
    label: "ln(1 + x) (Finite: |x| < 1)",
    expr: "ln(1 + x)",
    xRange: [-1.15, 2.6],
    yRange: [-2.6, 1.8],
    defaultX0: 0,
    x0Bounds: [-0.5, 1.5],
    radiusNote:
      "Notice the vertical asymptote at x = -1: Taylor series around x₀ = 0 diverge past |x| > 1!",
    exactSeriesLatex:
      "\\ln(1+x) = \\sum_{k=1}^{\\infty} \\frac{(-1)^{k-1}}{k}x^k \\quad (-1 < x \\le 1)",
    derivAt: (x0, k) => {
      if (k === 0) return Math.log(1 + x0);
      let fact = 1;
      for (let i = 1; i < k; i++) fact *= i;
      const sign = k % 2 === 1 ? 1 : -1;
      return (sign * fact) / Math.pow(1 + x0, k);
    },
  },
  {
    id: "geom",
    label: "1 / (1 - x) (Pole at x = 1)",
    expr: "1 / (1 - x)",
    xRange: [-1.8, 1.8],
    yRange: [-2.5, 5.5],
    defaultX0: 0,
    x0Bounds: [-1.2, 0.5],
    radiusNote:
      "Geometric series converges strictly inside |x - x₀| < |1 - x₀|; higher degree blows up outside the pole disk.",
    exactSeriesLatex:
      "\\frac{1}{1-x} = \\sum_{k=0}^{\\infty} \\frac{(x - x_0)^k}{(1 - x_0)^{k+1}} \\quad (|x-x_0| < |1-x_0|)",
    derivAt: (x0, k) => {
      let fact = 1;
      for (let i = 2; i <= k; i++) fact *= i;
      return fact / Math.pow(1 - x0, k + 1);
    },
  },
];

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/** Central finite-difference derivatives up to order 4 for arbitrary custom expressions */
function estimateDerivativesCustom(
  fn: (x: number) => number,
  x0: number,
  maxOrder: number
): number[] {
  const f0 = fn(x0);
  const h1 = 0.004;
  const h2 = 0.015;
  const h3 = 0.035;
  const h4 = 0.06;

  const d0 = f0;
  const d1 = (fn(x0 + h1) - fn(x0 - h1)) / (2 * h1);
  const d2 = (fn(x0 + h2) - 2 * f0 + fn(x0 - h2)) / (h2 * h2);
  const d3 =
    (fn(x0 + 2 * h3) - 2 * fn(x0 + h3) + 2 * fn(x0 - h3) - fn(x0 - 2 * h3)) /
    (2 * Math.pow(h3, 3));
  const d4 =
    (fn(x0 + 2 * h4) -
      4 * fn(x0 + h4) +
      6 * f0 -
      4 * fn(x0 - h4) +
      fn(x0 - 2 * h4)) /
    Math.pow(h4, 4);

  const all = [d0, d1, d2, d3, d4, 0, 0];
  return all.slice(0, maxOrder + 1);
}

export function SingleVariableTaylorLab() {
  const [presetId, setPresetId] = useState<string>(TAYLOR_1D_PRESETS[0].id);
  const [expr, setExpr] = useState<string>(TAYLOR_1D_PRESETS[0].expr);
  const [degreeN, setDegreeN] = useState<number>(3);
  const [centerX0, setCenterX0] = useState<number>(0);
  const [probeX, setProbeX] = useState<number>(1.8);

  const preset = useMemo(
    () => TAYLOR_1D_PRESETS.find((p) => p.id === presetId) ?? null,
    [presetId]
  );

  const compiled = useMemo(() => compileMathExpression(expr, ["x"]), [expr]);
  const maxAllowedDegree = preset ? 6 : 4;
  const effDegree = Math.min(degreeN, maxAllowedDegree);

  const selectPreset = (p: Taylor1DPreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setCenterX0(p.defaultX0);
    setProbeX(p.defaultX0 + 0.8);
  };

  const resetDefaults = () => {
    selectPreset(TAYLOR_1D_PRESETS[0]);
    setDegreeN(3);
    setProbeX(1.8);
  };

  const xRange: [number, number] = preset ? preset.xRange : [-4.0, 4.0];
  const yRange: [number, number] = preset ? preset.yRange : [-4.0, 4.0];
  const x0Bounds: [number, number] = preset ? preset.x0Bounds : [-2.5, 2.5];

  const data = useMemo(() => {
    const fn = (x: number): number => {
      if (!compiled.valid) return NaN;
      const v = compiled.evaluate({ x });
      return Number.isFinite(v) ? v : NaN;
    };

    const derivs: number[] = preset
      ? Array.from({ length: effDegree + 1 }, (_, k) => preset.derivAt(centerX0, k))
      : estimateDerivativesCustom(fn, centerX0, effDegree);

    const coeffs = derivs.map((dk, k) => dk / factorial(k));

    const evalTaylor = (x: number): number => {
      const dx = x - centerX0;
      let sum = 0;
      for (let k = 0; k <= effDegree; k++) {
        sum += coeffs[k] * Math.pow(dx, k);
      }
      return sum;
    };

    const fPts: [number, number][] = [];
    const tPts: [number, number][] = [];
    const errPts: [number, number][] = [];
    const steps = 160;
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const fv = fn(x);
      const tv = evalTaylor(x);

      if (Number.isFinite(fv) && fv >= yMin - 1.5 && fv <= yMax + 1.5) {
        fPts.push([x, Math.max(yMin - 0.5, Math.min(yMax + 0.5, fv))]);
      }
      if (Number.isFinite(tv) && tv >= yMin - 2.0 && tv <= yMax + 2.0) {
        tPts.push([x, Math.max(yMin - 0.5, Math.min(yMax + 0.5, tv))]);
      }
      if (Number.isFinite(fv) && Number.isFinite(tv)) {
        const rem = Math.abs(fv - tv);
        errPts.push([x, Math.min(2.5, rem)]);
      }
    }

    const fAtProbe = fn(probeX);
    const tAtProbe = evalTaylor(probeX);
    const remAtProbe =
      Number.isFinite(fAtProbe) && Number.isFinite(tAtProbe)
        ? Math.abs(fAtProbe - tAtProbe)
        : NaN;

    const polyTerms = coeffs.slice(0, effDegree + 1).map((c, k) => ({
      k,
      coeff: c,
    }));

    return {
      fPts,
      tPts,
      errPts,
      fAtProbe,
      tAtProbe,
      remAtProbe,
      polyTerms,
      fAtCenter: fn(centerX0),
    };
  }, [compiled, preset, effDegree, centerX0, probeX, xRange, yRange]);

  return (
    <section
      aria-label="Single-Variable Taylor Polynomial and Lagrange Remainder Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#FBEAA4] text-[#FBEAA4] bg-[var(--bg-canvas)]">
              LAB 3.1.6A • 1D TAYLOR POLYNOMIAL Tₙ(x) &amp; REMAINDER
            </span>
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono border border-[#8D9FCE] text-[#8D9FCE] bg-[#8D9FCE]/10">
              Degree n = {effDegree} around x₀ = {centerX0.toFixed(2)}
            </span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
            Osculating Polynomial Convergence &amp; Lagrange Remainder Error |Rₙ(x)|
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

      {/* Presets & Sliders */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 space-y-4 bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap gap-2">
          {TAYLOR_1D_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                presetId === p.id
                  ? "border-[#FBEAA4] bg-[#FBEAA4]/15 text-[var(--text-primary)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <MathExpressionInput
          label="Custom Function f(x) (Custom mode uses degree ≤ 4 numerical stencils)"
          value={expr}
          onChange={(nextExpr) => {
            setExpr(nextExpr);
            setPresetId("custom");
          }}
          allowedVars={["x"]}
          prefixLatex="f(x) ="
          compact
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#D35323]" />
                Polynomial Degree n
              </span>
              <span className="font-tabular-mono text-[#D35323]">
                n = {effDegree}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={maxAllowedDegree}
              step={1}
              value={effDegree}
              aria-label="Taylor degree n"
              onChange={(e) => setDegreeN(parseInt(e.target.value, 10))}
              className="w-full accent-[#D35323]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Expansion Center <strong className="text-[#8D9FCE] font-mono">x₀</strong>
              </span>
              <span className="font-tabular-mono text-[#8D9FCE]">
                x₀ = {centerX0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={x0Bounds[0]}
              max={x0Bounds[1]}
              step={0.05}
              value={centerX0}
              aria-label="Expansion center x0"
              onChange={(e) => setCenterX0(parseFloat(e.target.value))}
              className="w-full accent-[#8D9FCE]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Evaluation Probe <strong className="text-[#96B898] font-mono">x</strong>
              </span>
              <span className="font-tabular-mono text-[#96B898]">
                x = {probeX.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={xRange[0] + 0.15}
              max={xRange[1] - 0.15}
              step={0.05}
              value={probeX}
              aria-label="Probe coordinate x"
              onChange={(e) => setProbeX(parseFloat(e.target.value))}
              className="w-full accent-[#96B898]"
            />
          </div>
        </div>
      </div>

      {/* Dual Viewports: Function + Taylor Approximation | Remainder Error Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
        <div className="lg:col-span-7 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              1. Exact Curve <KaTeXMath math="f(x)" /> (Teal) vs.{" "}
              <KaTeXMath math={`T_{${effDegree}}(x)`} /> (Persimmon)
            </span>
            <span className="text-[11px] font-tabular-mono text-[#FBEAA4]">
              x₀ = {centerX0.toFixed(2)}
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={xRange}
            yRange={yRange}
            width={540}
            height={300}
            xLabel="x"
            yLabel="y"
            xColor="#8D9FCE"
            yColor="#029091"
            ariaLabel="Taylor polynomial approximation graph"
          >
            {({ toSvgX, toSvgY }) => {
              const fLine = data.fPts
                .map(([x, y]) => `${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`)
                .join(" ");
              const tLine = data.tPts
                .map(([x, y]) => `${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`)
                .join(" ");

              return (
                <>
                  {fLine && (
                    <polyline
                      points={fLine}
                      fill="none"
                      stroke="#029091"
                      strokeWidth={2.4}
                    />
                  )}
                  {tLine && (
                    <polyline
                      points={tLine}
                      fill="none"
                      stroke="#D35323"
                      strokeWidth={2.0}
                      strokeDasharray="6 3"
                    />
                  )}
                  {/* Expansion Center Dot */}
                  {Number.isFinite(data.fAtCenter) && (
                    <circle
                      cx={toSvgX(centerX0)}
                      cy={toSvgY(data.fAtCenter)}
                      r={5}
                      fill="#8D9FCE"
                    />
                  )}
                  {/* Remainder vertical gap bar at probeX */}
                  {Number.isFinite(data.fAtProbe) && Number.isFinite(data.tAtProbe) && (
                    <g>
                      <line
                        x1={toSvgX(probeX)}
                        y1={toSvgY(
                          Math.max(yRange[0], Math.min(yRange[1], data.fAtProbe))
                        )}
                        x2={toSvgX(probeX)}
                        y2={toSvgY(
                          Math.max(yRange[0], Math.min(yRange[1], data.tAtProbe))
                        )}
                        stroke="#FBEAA4"
                        strokeWidth={2.2}
                      />
                      <circle
                        cx={toSvgX(probeX)}
                        cy={toSvgY(
                          Math.max(yRange[0], Math.min(yRange[1], data.fAtProbe))
                        )}
                        r={4}
                        fill="#96B898"
                      />
                    </g>
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        <div className="lg:col-span-5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              2. Lagrange Remainder Error{" "}
              <KaTeXMath math={`|R_{${effDegree}}(x)| = |f(x) - T_{${effDegree}}(x)|`} />
            </span>
            <span className="text-[11px] font-tabular-mono text-[#B95869]">
              |R({probeX.toFixed(1)})| ={" "}
              {Number.isFinite(data.remAtProbe)
                ? data.remAtProbe.toFixed(4)
                : "NaN"}
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={xRange}
            yRange={[-0.1, 2.5]}
            width={400}
            height={300}
            xLabel="x"
            yLabel="|Rₙ(x)|"
            xColor="#8D9FCE"
            yColor="#B95869"
            ariaLabel="Taylor remainder error plot"
          >
            {({ toSvgX, toSvgY }) => {
              const errLine = data.errPts
                .map(([x, y]) => `${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`)
                .join(" ");
              return (
                <>
                  {errLine && (
                    <polyline
                      points={errLine}
                      fill="none"
                      stroke="#B95869"
                      strokeWidth={2.2}
                    />
                  )}
                  <line
                    x1={toSvgX(centerX0)}
                    y1={toSvgY(0)}
                    x2={toSvgX(centerX0)}
                    y2={toSvgY(2.3)}
                    stroke="#8D9FCE"
                    strokeDasharray="3 3"
                    strokeWidth={1.2}
                  />
                  {Number.isFinite(data.remAtProbe) && (
                    <circle
                      cx={toSvgX(probeX)}
                      cy={toSvgY(Math.min(2.45, data.remAtProbe))}
                      r={4.8}
                      fill="#FBEAA4"
                    />
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Term Breakdown & Telemetry */}
      <div className="border-t border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-elevated)] space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans text-[var(--text-muted)]">
              Exact f({probeX.toFixed(2)})
            </div>
            <div className="mt-1 text-base font-tabular-mono text-[#029091]">
              {Number.isFinite(data.fAtProbe) ? data.fAtProbe.toFixed(5) : "NaN"}
            </div>
          </div>
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans text-[var(--text-muted)]">
              Taylor T_{effDegree}({probeX.toFixed(2)})
            </div>
            <div className="mt-1 text-base font-tabular-mono text-[#D35323]">
              {Number.isFinite(data.tAtProbe) ? data.tAtProbe.toFixed(5) : "NaN"}
            </div>
          </div>
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans text-[var(--text-muted)]">
              Remainder |R_{effDegree}|
            </div>
            <div className="mt-1 text-base font-tabular-mono text-[#B95869]">
              {Number.isFinite(data.remAtProbe)
                ? data.remAtProbe.toExponential(2)
                : "NaN"}
            </div>
          </div>
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans text-[var(--text-muted)]">
              Term Coefficients c_k
            </div>
            <div className="mt-1 text-[11px] font-tabular-mono text-[#FBEAA4] truncate">
              {data.polyTerms.map((t) => t.coeff.toFixed(2)).join(", ")}
            </div>
          </div>
        </div>

        {preset && (
          <div className="p-3 border border-[#FBEAA4]/40 bg-[var(--bg-canvas)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-sans font-semibold text-[#FBEAA4] inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {preset.label}
              </div>
              <p className="text-xs font-serif text-[var(--text-secondary)]">
                {preset.radiusNote}
              </p>
            </div>
            <div className="shrink-0 px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
              <KaTeXMath math={preset.exactSeriesLatex} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
