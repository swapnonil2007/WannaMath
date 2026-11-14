"use client";

import React, { useMemo, useState } from "react";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { compileMathExpression } from "@/lib/mathParser";
import { integrate1DGaussLegendre } from "@/components/visualizations/primitives/core2d";

const SAMPLE_PRESETS = [
  { label: "Parabola + Wave", expr: "0.35*x^2 + sin(x) + 1.4" },
  { label: "Inverted Bowl", expr: "3.2 - 0.3*x^2" },
  { label: "Damped Cosine", expr: "2.4*exp(-0.18*x^2)*cos(1.4*x) + 1.2" },
  { label: "Square Root Ramp", expr: "sqrt(abs(x) + 0.5) + 0.2*x" },
] as const;

function fmt(n: number, digits = 3): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * Interactive Practice Sandbox for `/how-to-use`:
 * Demonstrates `<MathExpressionInput />`, live KaTeX preview, numeric probe slider x₀,
 * tangent line slope, and Gauss-Legendre definite integral accumulation on a flat SVG canvas.
 */
export function HowToUseInteractiveDemo() {
  const [expr, setExpr] = useState<string>("0.35*x^2 + sin(x) + 1.4");
  const [probeX, setProbeX] = useState<number>(0.8);
  const [upperBound, setUpperBound] = useState<number>(1.8);
  const lowerBound = -2.0;

  const compiled = useMemo(
    () => compileMathExpression(expr, ["x"]),
    [expr]
  );

  const analysis = useMemo(() => {
    const evalX = (x: number) => {
      if (!compiled.valid) return 0;
      const v = compiled.evaluate({ x });
      return Number.isFinite(v) ? Math.max(-25, Math.min(25, v)) : 0;
    };

    const h = 1e-3;
    const fx0 = evalX(probeX);
    const slope = (evalX(probeX + h) - evalX(probeX - h)) / (2 * h);
    const area = integrate1DGaussLegendre(evalX, lowerBound, upperBound, 16);

    const xMin = -3.2;
    const xMax = 3.2;
    const steps = 128;
    const curvePts: Array<{ x: number; y: number }> = [];
    let minY = -0.5;
    let maxY = 4.5;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evalX(x);
      curvePts.push({ x, y });
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    const padY = Math.max(0.6, (maxY - minY) * 0.14);
    const yLo = Math.max(-12, minY - padY);
    const yHi = Math.min(16, maxY + padY);

    return {
      evalX,
      fx0,
      slope,
      area,
      curvePts,
      xMin,
      xMax,
      yLo,
      yHi,
    };
  }, [compiled, probeX, upperBound]);

  const svgW = 540;
  const svgH = 290;
  const padL = 44;
  const padR = 20;
  const padT = 20;
  const padB = 34;

  const toSvgX = (x: number) =>
    padL +
    ((x - analysis.xMin) / (analysis.xMax - analysis.xMin)) *
      (svgW - padL - padR);
  const toSvgY = (y: number) => {
    const clamped = Math.max(analysis.yLo, Math.min(analysis.yHi, y));
    return (
      svgH -
      padB -
      ((clamped - analysis.yLo) /
        Math.max(1e-4, analysis.yHi - analysis.yLo)) *
        (svgH - padT - padB)
    );
  };

  const curvePath = analysis.curvePts
    .map(
      (pt, idx) =>
        `${idx === 0 ? "M" : "L"}${toSvgX(pt.x).toFixed(1)},${toSvgY(
          pt.y
        ).toFixed(1)}`
    )
    .join(" ");

  // Shaded area polygon between x = lowerBound and x = upperBound
  const areaPath = useMemo(() => {
    const a = Math.min(lowerBound, upperBound);
    const b = Math.max(lowerBound, upperBound);
    if (b - a < 0.02) return "";
    const steps = 64;
    const baseY = toSvgY(0);
    const pts: string[] = [`M${toSvgX(a).toFixed(1)},${baseY.toFixed(1)}`];
    for (let i = 0; i <= steps; i++) {
      const x = a + (i / steps) * (b - a);
      pts.push(
        `L${toSvgX(x).toFixed(1)},${toSvgY(analysis.evalX(x)).toFixed(1)}`
      );
    }
    pts.push(`L${toSvgX(b).toFixed(1)},${baseY.toFixed(1)} Z`);
    return pts.join(" ");
  }, [analysis, lowerBound, upperBound]);

  // Tangent segment centered at probeX
  const tanSpan = 1.15;
  const tX1 = Math.max(analysis.xMin, probeX - tanSpan);
  const tX2 = Math.min(analysis.xMax, probeX + tanSpan);
  const tY1 = analysis.fx0 + analysis.slope * (tX1 - probeX);
  const tY2 = analysis.fx0 + analysis.slope * (tX2 - probeX);

  return (
    <div className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div className="space-y-0.5">
          <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] font-semibold block">
            Practice Sandbox • Try Typing Equations &amp; Scrubbing Sliders
          </span>
          <p className="text-xs font-math-serif text-[var(--text-secondary)]">
            Every custom-equation chapter uses this exact live formula box, tangent probe, and numerical readout style.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setExpr(preset.expr)}
              className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors cursor-pointer ${
                expr === preset.expr
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--bg-canvas)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Formula Box */}
      <MathExpressionInput
        label="Try editing f(x) or clicking quick-insert symbols:"
        value={expr}
        onChange={setExpr}
        allowedVars={["x"]}
        prefixLatex="f(x) ="
        placeholder="e.g. 0.35*x^2 + sin(x) + 1.4"
        accentHex="#029091"
      />

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex justify-between text-xs font-tabular-mono tabular-nums">
            <span className="text-[var(--math-ink-sweep)] font-semibold">
              Tangent Probe Point x₀
            </span>
            <strong>{probeX.toFixed(1)}</strong>
          </div>
          <input
            type="range"
            min={-2.8}
            max={2.8}
            step={0.1}
            value={probeX}
            onChange={(e) => setProbeX(Number(e.target.value))}
            aria-label="Tangent probe point x0"
            className="w-full accent-[#D35323] cursor-pointer"
          />
        </label>

        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex justify-between text-xs font-tabular-mono tabular-nums">
            <span className="text-[var(--math-ink-z)] font-semibold">
              Integral Upper Limit b (from a = −2.0)
            </span>
            <strong>{upperBound.toFixed(1)}</strong>
          </div>
          <input
            type="range"
            min={-2.0}
            max={3.0}
            step={0.1}
            value={upperBound}
            onChange={(e) => setUpperBound(Number(e.target.value))}
            aria-label="Upper integration limit b"
            className="w-full accent-[#029091] cursor-pointer"
          />
        </label>
      </div>

      {/* Synchronized SVG Plot + Readouts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-auto block"
            role="img"
            aria-label={`Interactive practice plot of f(x) = ${expr} with tangent line at x0 = ${probeX.toFixed(
              1
            )} and shaded integral from -2.0 to ${upperBound.toFixed(1)}`}
          >
            {/* Grid */}
            {[-3, -2, -1, 0, 1, 2, 3].map((gx) => (
              <g key={`gx-${gx}`}>
                <line
                  x1={toSvgX(gx)}
                  x2={toSvgX(gx)}
                  y1={padT}
                  y2={svgH - padB}
                  stroke={gx === 0 ? "#AAA36D" : "var(--border-subtle)"}
                  strokeDasharray={gx === 0 ? undefined : "3 3"}
                  strokeWidth={gx === 0 ? 1.1 : 0.7}
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

            {/* Zero horizontal axis */}
            <line
              x1={padL}
              x2={svgW - padR}
              y1={toSvgY(0)}
              y2={toSvgY(0)}
              stroke="#AAA36D"
              strokeWidth={1.2}
            />

            {/* Definite integral shaded area */}
            {areaPath && (
              <path
                d={areaPath}
                fill="#029091"
                fillOpacity={0.22}
                stroke="#029091"
                strokeOpacity={0.5}
                strokeWidth={1}
              />
            )}

            {/* Function curve */}
            <path
              d={curvePath}
              fill="none"
              stroke="#8D9FCE"
              strokeWidth={2.5}
            />

            {/* Tangent line at x0 */}
            <line
              x1={toSvgX(tX1)}
              y1={toSvgY(tY1)}
              x2={toSvgX(tX2)}
              y2={toSvgY(tY2)}
              stroke="#D35323"
              strokeWidth={2.1}
            />

            {/* Probe vertical drop & dot */}
            <line
              x1={toSvgX(probeX)}
              x2={toSvgX(probeX)}
              y1={toSvgY(0)}
              y2={toSvgY(analysis.fx0)}
              stroke="#D35323"
              strokeDasharray="4 3"
              strokeWidth={1.2}
            />
            <circle
              cx={toSvgX(probeX)}
              cy={toSvgY(analysis.fx0)}
              r={5}
              fill="#D35323"
              stroke="#1E1F22"
              strokeWidth={1.4}
            />
          </svg>
        </div>

        {/* Numerical Telemetry Panel */}
        <div className="xl:col-span-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 flex flex-col justify-between space-y-3">
          <div className="space-y-2.5 text-xs font-tabular-mono tabular-nums">
            <span className="text-[11px] uppercase tracking-wider text-[var(--math-ink-y)] font-semibold block">
              Live Tabular Readouts
            </span>

            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
              <span className="text-[10px] text-[var(--math-ink-x)] block">
                Curve Height f(x₀)
              </span>
              <strong className="text-sm">
                f({probeX.toFixed(1)}) = {fmt(analysis.fx0)}
              </strong>
            </div>

            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
              <span className="text-[10px] text-[var(--math-ink-sweep)] block">
                Tangent Slope f&apos;(x₀)
              </span>
              <strong className="text-sm">
                f&apos;({probeX.toFixed(1)}) = {fmt(analysis.slope)}
              </strong>
            </div>

            <div className="p-2.5 border border-[var(--math-ink-z)] bg-[#029091]/10 space-y-1">
              <span className="text-[10px] text-[var(--math-ink-z)] block">
                Shaded Definite Integral Area
              </span>
              <div className="pt-0.5 overflow-x-auto">
                <KaTeXMath
                  math={`\\int_{-2.0}^{${upperBound.toFixed(1)}} f(x)\\,dx = ${fmt(
                    analysis.area
                  )}`}
                />
              </div>
            </div>
          </div>

          <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
            Notice zero jitter when scrubbing: every readout uses fixed-width{" "}
            <code className="font-tabular-mono">JetBrains Mono</code> numerals (
            <code className="font-tabular-mono">tabular-nums</code>) and pure flat surfaces.
          </p>
        </div>
      </div>
    </div>
  );
}
