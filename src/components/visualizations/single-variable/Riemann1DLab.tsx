"use client";

import React, { useState, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  SvgCoordinatePlane2D,
  integrate1DGaussLegendre,
} from "@/components/visualizations/primitives/core2d";

type RiemannMethod = "left" | "right" | "midpoint" | "trapezoid" | "darboux";

interface RiemannPreset {
  id: string;
  label: string;
  expr: string;
  a: number;
  b: number;
  yRange: [number, number];
  note: string;
}

const RIEMANN_PRESETS: RiemannPreset[] = [
  {
    id: "parabola",
    label: "Monotone Smooth: 0.25x² + 0.6",
    expr: "0.25*x^2 + 0.6",
    a: 0.0,
    b: 3.0,
    yRange: [-0.5, 3.4],
    note: "Because f is increasing on [0, 3], Left Sum = Lower Darboux L(f, P) and Right Sum = Upper Darboux U(f, P), giving exact error telescope U - L = (f(b) - f(a))Δx.",
  },
  {
    id: "signed-wave",
    label: "Signed Cancellation: sin(2x) + 0.2x",
    expr: "sin(2*x) + 0.2*x",
    a: 0.0,
    b: 3.6,
    yRange: [-1.4, 1.8],
    note: "Intervals below the x-axis contribute NEGATIVE signed area (Crimson). Notice how Midpoint and Trapezoidal rules beat Left/Right endpoints dramatically as N grows.",
  },
  {
    id: "exponential",
    label: "Steep Growth: exp(0.45*x) - 0.5",
    expr: "exp(0.45*x) - 0.5",
    a: 0.0,
    b: 3.2,
    yRange: [-0.5, 4.2],
    note: "Darboux bounds sandwich the true definite integral between inscribed L(f,P) and circumscribed U(f,P) rectangles. Refining N → ∞ squeezes U - L → 0.",
  },
];

export function Riemann1DLab() {
  const [presetId, setPresetId] = useState<string>("signed-wave");
  const preset = useMemo(
    () => RIEMANN_PRESETS.find((p) => p.id === presetId) ?? RIEMANN_PRESETS[0],
    [presetId]
  );

  const [expr, setExpr] = useState<string>(preset.expr);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [boundA, setBoundA] = useState<number>(preset.a);
  const [boundB, setBoundB] = useState<number>(preset.b);
  const [numPartitions, setNumPartitions] = useState<number>(10);
  const [method, setMethod] = useState<RiemannMethod>("midpoint");

  const handleSelectPreset = (p: RiemannPreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setBoundA(p.a);
    setBoundB(p.b);
    setIsCustom(false);
  };

  const compiled = useMemo(() => compileMathExpression(expr, ["x"]), [expr]);
  const evalF = useMemo(() => {
    return (x: number) => (compiled.valid ? compiled.evaluate({ x }) : NaN);
  }, [compiled]);

  const analysis = useMemo(() => {
    const a = Math.min(boundA, boundB);
    const b = Math.max(boundA, boundB);
    const span = Math.max(1e-4, b - a);
    const dx = span / numPartitions;

    const exactSigned = integrate1DGaussLegendre(evalF, a, b, 24);
    const exactUnsigned = integrate1DGaussLegendre(
      (x) => Math.abs(evalF(x)),
      a,
      b,
      24
    );

    const bars: {
      x0: number;
      x1: number;
      y0: number;
      y1: number;
      minY: number;
      maxY: number;
      sampleY: number;
    }[] = [];

    let approxSum = 0;
    let darbouxLower = 0;
    let darbouxUpper = 0;

    for (let i = 0; i < numPartitions; i++) {
      const x0 = a + i * dx;
      const x1 = x0 + dx;
      const y0 = evalF(x0);
      const y1 = evalF(x1);
      const yMid = evalF(0.5 * (x0 + x1));

      // Sample 7 points per subinterval to find subinterval inf/sup cleanly
      let minY = Math.min(y0, y1, yMid);
      let maxY = Math.max(y0, y1, yMid);
      for (let s = 1; s < 6; s++) {
        const sy = evalF(x0 + (s / 6) * dx);
        if (Number.isFinite(sy)) {
          if (sy < minY) minY = sy;
          if (sy > maxY) maxY = sy;
        }
      }

      darbouxLower += minY * dx;
      darbouxUpper += maxY * dx;

      let sampleY = yMid;
      if (method === "left") sampleY = y0;
      else if (method === "right") sampleY = y1;
      else if (method === "trapezoid") sampleY = 0.5 * (y0 + y1);

      if (method === "darboux") {
        approxSum += 0.5 * (minY + maxY) * dx;
      } else {
        approxSum += sampleY * dx;
      }

      bars.push({ x0, x1, y0, y1, minY, maxY, sampleY });
    }

    const curvePts: [number, number][] = [];
    const pad = 0.3;
    for (let i = 0; i <= 200; i++) {
      const x = a - pad + ((b - a + 2 * pad) * i) / 200;
      const y = evalF(x);
      if (Number.isFinite(y) && Math.abs(y) < 15) curvePts.push([x, y]);
    }

    return {
      a,
      b,
      dx,
      bars,
      approxSum,
      darbouxLower,
      darbouxUpper,
      exactSigned,
      exactUnsigned,
      curvePts,
    };
  }, [evalF, boundA, boundB, numPartitions, method]);

  const xRange: [number, number] = [analysis.a - 0.25, analysis.b + 0.25];
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
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)]">
            <span>Lab 1.3.1A</span>
            <span>•</span>
            <span>Riemann &amp; Darboux Integration</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            1D Riemann Sums &amp; Darboux Partition Explorer
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Refine partition count <KaTeXMath math="N" /> and switch quadrature
            rules to observe Left, Right, Midpoint, Trapezoidal, and Darboux
            inscribed/circumscribed bounds squeeze toward{" "}
            <KaTeXMath math="\int_a^b f(x)\,dx" />.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSelectPreset(preset)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {RIEMANN_PRESETS.map((p) => {
          const active = !isCustom && p.id === preset.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                active
                  ? "border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-[var(--math-ink-z)] font-medium"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Method Tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["left", "Left Endpoint"],
            ["right", "Right Endpoint"],
            ["midpoint", "Midpoint"],
            ["trapezoid", "Trapezoidal"],
            ["darboux", "Darboux Upper/Lower"],
          ] as [RiemannMethod, string][]
        ).map(([mKey, mLabel]) => (
          <button
            key={mKey}
            type="button"
            onClick={() => setMethod(mKey)}
            className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
              method === mKey
                ? "border-[#9E360E] bg-[#9E360E] text-[#FFFBE4] font-medium"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {mLabel}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <MathExpressionInput
          label="Integrand f(x)"
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
            <span className="text-[var(--text-secondary)]">Partitions N</span>
            <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)]">
              N = {numPartitions} (Δx = {analysis.dx.toFixed(3)})
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={60}
            step={1}
            value={numPartitions}
            onChange={(e) => setNumPartitions(Number(e.target.value))}
            aria-label="Number of partitions N"
            className="w-full accent-[#D35323]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Lower Bound a</span>
            <span className="font-tabular-mono text-[var(--math-ink-x)]">
              a = {boundA.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={-1.0}
            max={boundB - 0.4}
            step={0.1}
            value={boundA}
            onChange={(e) => setBoundA(Number(e.target.value))}
            aria-label="Lower integration bound a"
            className="w-full accent-[#8D9FCE]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Upper Bound b</span>
            <span className="font-tabular-mono text-[var(--math-ink-y)]">
              b = {boundB.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={boundA + 0.4}
            max={4.5}
            step={0.1}
            value={boundB}
            onChange={(e) => setBoundB(Number(e.target.value))}
            aria-label="Upper integration bound b"
            className="w-full accent-[#96B898]"
          />
        </div>
      </div>

      {/* Plot + Readouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SvgCoordinatePlane2D
            xRange={xRange}
            yRange={preset.yRange}
            width={560}
            height={320}
            xLabel="x"
            yLabel="f(x)"
            xColor="#8D9FCE"
            yColor="#029091"
            ariaLabel="1D Riemann and Darboux partition plot"
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const zeroY = toSvgY(0);
              return (
                <>
                  {analysis.bars.map((bar, idx) => {
                    const sx0 = toSvgX(bar.x0);
                    const sx1 = toSvgX(bar.x1);
                    const w = Math.max(1, sx1 - sx0);

                    if (method === "trapezoid") {
                      const sy0 = toSvgY(bar.y0);
                      const sy1 = toSvgY(bar.y1);
                      const isNeg = bar.sampleY < 0;
                      return (
                        <polygon
                          key={idx}
                          points={`${sx0},${zeroY} ${sx0},${sy0} ${sx1},${sy1} ${sx1},${zeroY}`}
                          fill={
                            isNeg
                              ? "rgba(185, 88, 105, 0.30)"
                              : "rgba(2, 144, 145, 0.30)"
                          }
                          stroke={isNeg ? "#B95869" : "#029091"}
                          strokeWidth={1}
                        />
                      );
                    }

                    if (method === "darboux") {
                      const topU = Math.min(zeroY, toSvgY(bar.maxY));
                      const hU = Math.abs(toSvgY(bar.maxY) - zeroY);
                      const topL = Math.min(zeroY, toSvgY(bar.minY));
                      const hL = Math.abs(toSvgY(bar.minY) - zeroY);
                      return (
                        <g key={idx}>
                          <rect
                            x={sx0}
                            y={topU}
                            width={w}
                            height={hU}
                            fill="rgba(211, 83, 35, 0.16)"
                            stroke="#D35323"
                            strokeWidth={0.9}
                          />
                          <rect
                            x={sx0}
                            y={topL}
                            width={w}
                            height={hL}
                            fill="rgba(2, 144, 145, 0.30)"
                            stroke="#029091"
                            strokeWidth={0.9}
                          />
                        </g>
                      );
                    }

                    const sy = toSvgY(bar.sampleY);
                    const top = Math.min(zeroY, sy);
                    const h = Math.abs(sy - zeroY);
                    const isNeg = bar.sampleY < 0;
                    return (
                      <rect
                        key={idx}
                        x={sx0}
                        y={top}
                        width={w}
                        height={h}
                        fill={
                          isNeg
                            ? "rgba(185, 88, 105, 0.32)"
                            : "rgba(2, 144, 145, 0.30)"
                        }
                        stroke={isNeg ? "#B95869" : "#029091"}
                        strokeWidth={1}
                      />
                    );
                  })}

                  {analysis.curvePts.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#FBEAA4"
                      strokeWidth={2.4}
                      points={toPoly(analysis.curvePts, toSvgX, toSvgY)}
                    />
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Live Telemetry Cards */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
            <span className="text-xs font-sans text-[var(--text-secondary)] block">
              Exact Signed Integral <KaTeXMath math="\int_a^b f(x)\,dx" />
            </span>
            <span className="text-lg font-tabular-mono font-semibold text-[var(--math-ink-diff)] block">
              {analysis.exactSigned.toFixed(5)}
            </span>
            <span className="text-[11px] font-tabular-mono text-[var(--text-secondary)] block">
              Total Unsigned Area ∫|f|dx = {analysis.exactUnsigned.toFixed(5)}
            </span>
          </div>

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
            <span className="text-xs font-sans text-[var(--text-secondary)] block">
              {method === "darboux"
                ? "Darboux Bounds [L(f,P), U(f,P)]"
                : `Partition Estimate (${method})`}
            </span>
            {method === "darboux" ? (
              <>
                <div className="text-xs font-tabular-mono text-[var(--math-ink-z)]">
                  L(f, P) = {analysis.darbouxLower.toFixed(5)}
                </div>
                <div className="text-xs font-tabular-mono text-[var(--math-ink-sweep)]">
                  U(f, P) = {analysis.darbouxUpper.toFixed(5)}
                </div>
                <div className="text-xs font-tabular-mono text-[var(--text-primary)] pt-1">
                  Discrepancy U - L ={" "}
                  {(analysis.darbouxUpper - analysis.darbouxLower).toFixed(5)}
                </div>
              </>
            ) : (
              <>
                <span className="text-lg font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
                  {analysis.approxSum.toFixed(5)}
                </span>
                <span className="text-[11px] font-tabular-mono text-[var(--math-ink-sweep)] block">
                  |Error| ={" "}
                  {Math.abs(analysis.approxSum - analysis.exactSigned).toExponential(2)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {!isCustom && (
        <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
          <strong className="text-[var(--text-primary)] font-sans">
            Partition Note:
          </strong>{" "}
          {preset.note}
        </div>
      )}
    </section>
  );
}
