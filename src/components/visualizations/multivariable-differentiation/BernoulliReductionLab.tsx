"use client";

import React, { useState, useMemo } from "react";
import { ArrowRightLeft, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives";

interface BernoulliPreset {
  id: string;
  label: string;
  n: number;
  pFn: (x: number) => number;
  qFn: (x: number) => number;
  xRange: [number, number];
  yRange: [number, number];
  vRange: [number, number];
  defaultX0: number;
  defaultY0: number;
  eqLatex: string;
  reducedLatex: string;
  note: string;
}

const BERNOULLI_PRESETS: BernoulliPreset[] = [
  {
    id: "logistic-n2",
    label: "Logistic Saturation (n = 2): y' - y = -y²",
    n: 2,
    pFn: () => -1,
    qFn: () => -1,
    xRange: [-1.5, 3.5],
    yRange: [-0.2, 2.5],
    vRange: [-0.2, 5.0],
    defaultX0: 0,
    defaultY0: 0.25,
    eqLatex: "y' - y = -y^2 \\qquad (n = 2)",
    reducedLatex: "v = y^{-1} \\implies v' + v = 1 \\implies y(x) = \\frac{1}{1 + C e^{-x}}",
    note: "Setting v = 1/y transforms the nonlinear logistic S-curve into a completely standard constant-coefficient exponential LDE v' + v = 1!",
  },
  {
    id: "power-n2",
    label: "Variable Growth (n = 2): y' + (1/x)y = x·y²",
    n: 2,
    pFn: (x) => 1 / Math.max(0.25, x),
    qFn: (x) => x,
    xRange: [0.4, 3.2],
    yRange: [-0.2, 2.2],
    vRange: [-0.5, 5.0],
    defaultX0: 1.0,
    defaultY0: 0.5,
    eqLatex: "y' + \\frac{1}{x}y = x y^2 \\qquad (n = 2)",
    reducedLatex:
      "v = y^{-1} \\implies v' - \\frac{1}{x}v = -x \\implies \\frac{1}{y} = -x^2 + Cx",
    note: "Bernoulli exponent n = 2 maps curvature in (x, y) into simple integrating-factor factor μ(x) = 1/x in the linear (x, v) plane.",
  },
  {
    id: "sqrt-n05",
    label: "Square-Root Damping (n = 1/2): y' + y = √y",
    n: 0.5,
    pFn: () => 1,
    qFn: () => 1,
    xRange: [-1.0, 3.5],
    yRange: [-0.2, 2.8],
    vRange: [-0.2, 2.2],
    defaultX0: 0,
    defaultY0: 2.2,
    eqLatex: "y' + y = y^{1/2} \\qquad (n = \\tfrac{1}{2})",
    reducedLatex:
      "v = y^{1-1/2} = \\sqrt{y} \\implies v' + \\frac{1}{2}v = \\frac{1}{2}",
    note: "Fractional power n = 1/2 collapses smoothly when v = √y: all positive solutions relax symmetrically toward equilibrium y = v² = 1.",
  },
  {
    id: "cubic-n3",
    label: "Cubic Dissipation (n = 3): y' + 0.5y = 0.5y³",
    n: 3,
    pFn: () => 0.5,
    qFn: () => 0.5,
    xRange: [-1.5, 2.5],
    yRange: [0.1, 1.8],
    vRange: [0.1, 6.0],
    defaultX0: 0,
    defaultY0: 0.5,
    eqLatex: "y' + 0.5y = 0.5 y^3 \\qquad (n = 3)",
    reducedLatex: "v = y^{-2} \\implies v' - v = -1 \\implies y^{-2} = 1 + C e^{x}",
    note: "Since 1 - n = -2, substitution v = y⁻² flips sign on P(x) and straightens the cubic blow-up threshold y = 1 into linear stability.",
  },
];

function rk4Step(
  slope: (x: number, val: number) => number,
  x0: number,
  val0: number,
  xMin: number,
  xMax: number
): [number, number][] {
  const step = 0.025;
  const back: [number, number][] = [];
  let cx = x0;
  let cv = val0;
  for (let i = 0; i < 200 && cx > xMin; i++) {
    const h = -Math.min(step, cx - xMin);
    const k1 = slope(cx, cv);
    const k2 = slope(cx + h / 2, cv + (h / 2) * k1);
    const k3 = slope(cx + h / 2, cv + (h / 2) * k2);
    const k4 = slope(cx + h, cv + h * k3);
    const dv = (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    if (!Number.isFinite(dv) || Math.abs(cv + dv) > 15 || cv + dv <= 0.005) break;
    cx += h;
    cv += dv;
    back.push([cx, cv]);
  }
  back.reverse();

  const fwd: [number, number][] = [[x0, val0]];
  cx = x0;
  cv = val0;
  for (let i = 0; i < 200 && cx < xMax; i++) {
    const h = Math.min(step, xMax - cx);
    const k1 = slope(cx, cv);
    const k2 = slope(cx + h / 2, cv + (h / 2) * k1);
    const k3 = slope(cx + h / 2, cv + (h / 2) * k2);
    const k4 = slope(cx + h, cv + h * k3);
    const dv = (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    if (!Number.isFinite(dv) || Math.abs(cv + dv) > 15 || cv + dv <= 0.005) break;
    cx += h;
    cv += dv;
    fwd.push([cx, cv]);
  }
  return [...back, ...fwd];
}

export function BernoulliReductionLab() {
  const [presetId, setPresetId] = useState<string>(BERNOULLI_PRESETS[0].id);
  const [x0, setX0] = useState<number>(BERNOULLI_PRESETS[0].defaultX0);
  const [y0, setY0] = useState<number>(BERNOULLI_PRESETS[0].defaultY0);

  const preset = useMemo(
    () =>
      BERNOULLI_PRESETS.find((p) => p.id === presetId) ?? BERNOULLI_PRESETS[0],
    [presetId]
  );

  const selectPreset = (p: BernoulliPreset) => {
    setPresetId(p.id);
    setX0(p.defaultX0);
    setY0(p.defaultY0);
  };

  const sim = useMemo(() => {
    const { n, pFn, qFn, xRange, yRange, vRange } = preset;
    const oneMinusN = 1 - n;
    const v0 = Math.pow(Math.max(0.05, y0), oneMinusN);

    const bernoulliSlope = (x: number, y: number) =>
      qFn(x) * Math.pow(Math.max(0.01, y), n) - pFn(x) * y;
    const linearSlope = (x: number, v: number) =>
      oneMinusN * qFn(x) - oneMinusN * pFn(x) * v;

    const yCurve = rk4Step(bernoulliSlope, x0, y0, xRange[0], xRange[1]);
    const vCurve = rk4Step(linearSlope, x0, v0, xRange[0], xRange[1]);

    // Check reconstruction accuracy at the right end of yCurve via y_from_v = v^(1/(1-n))
    const sampleRight = vCurve[vCurve.length - 1];
    const yFromVRight = sampleRight
      ? Math.pow(Math.max(1e-6, sampleRight[1]), 1 / oneMinusN)
      : NaN;
    const yDirectRight = yCurve.find(
      (pt) => sampleRight && Math.abs(pt[0] - sampleRight[0]) < 0.02
    )?.[1];

    // Slope ticks for both planes
    const buildTicks = (
      xr: [number, number],
      yr: [number, number],
      sFn: (x: number, y: number) => number
    ) => {
      const out: { x: number; y: number; dx: number; dy: number }[] = [];
      const nx = 11;
      const ny = 9;
      const len = Math.min((xr[1] - xr[0]) / nx, (yr[1] - yr[0]) / ny) * 0.4;
      for (let ix = 0; ix < nx; ix++) {
        const gx = xr[0] + ((ix + 0.5) / nx) * (xr[1] - xr[0]);
        for (let iy = 0; iy < ny; iy++) {
          const gy = yr[0] + ((iy + 0.5) / ny) * (yr[1] - yr[0]);
          if (gy <= 0.04) continue;
          const m = sFn(gx, gy);
          if (Number.isFinite(m)) {
            const norm = Math.hypot(1, m);
            out.push({ x: gx, y: gy, dx: (1 / norm) * len, dy: (m / norm) * len });
          }
        }
      }
      return out;
    };

    return {
      oneMinusN,
      v0,
      yCurve,
      vCurve,
      yTicks: buildTicks(xRange, yRange, bernoulliSlope),
      vTicks: buildTicks(xRange, vRange, linearSlope),
      yFromVRight,
      yDirectRight,
    };
  }, [preset, x0, y0]);

  return (
    <section
      aria-label="Bernoulli Equation Nonlinear-to-Linear Substitution Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#8D9FCE] text-[#8D9FCE] bg-[var(--bg-canvas)]">
              LAB 3.1.9B • BERNOULLI&apos;S EQUATION &amp; v = y^(1−n) LINEARIZATION
            </span>
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono border border-[#96B898] text-[#96B898] bg-[#96B898]/10 inline-flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3" />
              v₀ = y₀^({sim.oneMinusN.toFixed(1)}) = {sim.v0.toFixed(3)}
            </span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
            Pulling Back Nonlinear Bernoulli Flows into Linear Slope Fields
          </h3>
        </div>

        <button
          type="button"
          onClick={() => selectPreset(BERNOULLI_PRESETS[0])}
          className="px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-canvas)] inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Controls */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 space-y-4 bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap gap-2">
          {BERNOULLI_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                p.id === presetId
                  ? "border-[#8D9FCE] bg-[#8D9FCE]/15 text-[var(--text-primary)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Initial x₀</span>
              <span className="font-tabular-mono text-[#8D9FCE]">
                x₀ = {x0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={preset.xRange[0] + 0.15}
              max={preset.xRange[1] - 0.3}
              step={0.05}
              value={x0}
              aria-label="Bernoulli x0"
              onChange={(e) => setX0(parseFloat(e.target.value))}
              className="w-full accent-[#8D9FCE]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Initial y₀ &gt; 0</span>
              <span className="font-tabular-mono text-[#D35323]">
                y₀ = {y0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.15}
              max={preset.yRange[1] - 0.2}
              step={0.05}
              value={y0}
              aria-label="Bernoulli y0"
              onChange={(e) => setY0(parseFloat(e.target.value))}
              className="w-full accent-[#D35323]"
            />
          </div>
        </div>
      </div>

      {/* Synchronized Planes: Original (x, y) vs Transformed Linear (x, v) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              1. Nonlinear Bernoulli Space <KaTeXMath math="(x, y)" />
            </span>
            <KaTeXMath math={preset.eqLatex} />
          </div>

          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.yRange}
            width={460}
            height={280}
            xLabel="x"
            yLabel="y"
            xColor="#8D9FCE"
            yColor="#D35323"
            ariaLabel="Nonlinear Bernoulli slope field"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {sim.yTicks.map((t, i) => (
                  <line
                    key={i}
                    x1={toSvgX(t.x - t.dx / 2)}
                    y1={toSvgY(t.y - t.dy / 2)}
                    x2={toSvgX(t.x + t.dx / 2)}
                    y2={toSvgY(t.y + t.dy / 2)}
                    stroke="#8D9FCE"
                    opacity={0.4}
                    strokeWidth={1.1}
                  />
                ))}
                <polyline
                  points={sim.yCurve
                    .filter(([, py]) => py >= preset.yRange[0] && py <= preset.yRange[1])
                    .map(([px, py]) => `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`)
                    .join(" ")}
                  fill="none"
                  stroke="#D35323"
                  strokeWidth={2.5}
                />
                <circle cx={toSvgX(x0)} cy={toSvgY(y0)} r={5} fill="#FBEAA4" />
              </>
            )}
          </SvgCoordinatePlane2D>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              2. Linearized LDE Space <KaTeXMath math={`(x, v = y^{${sim.oneMinusN.toFixed(1)}})`} />
            </span>
            <span className="text-[11px] font-tabular-mono text-[#96B898]">
              Linear LDE!
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.vRange}
            width={460}
            height={280}
            xLabel="x"
            yLabel="v"
            xColor="#8D9FCE"
            yColor="#96B898"
            ariaLabel="Linearized transformed v slope field"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {sim.vTicks.map((t, i) => (
                  <line
                    key={i}
                    x1={toSvgX(t.x - t.dx / 2)}
                    y1={toSvgY(t.y - t.dy / 2)}
                    x2={toSvgX(t.x + t.dx / 2)}
                    y2={toSvgY(t.y + t.dy / 2)}
                    stroke="#96B898"
                    opacity={0.4}
                    strokeWidth={1.1}
                  />
                ))}
                <polyline
                  points={sim.vCurve
                    .filter(([, pv]) => pv >= preset.vRange[0] && pv <= preset.vRange[1])
                    .map(([px, pv]) => `${toSvgX(px).toFixed(1)},${toSvgY(pv).toFixed(1)}`)
                    .join(" ")}
                  fill="none"
                  stroke="#96B898"
                  strokeWidth={2.5}
                />
                <circle
                  cx={toSvgX(x0)}
                  cy={toSvgY(Math.min(preset.vRange[1], sim.v0))}
                  r={5}
                  fill="#FBEAA4"
                />
              </>
            )}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Verification & Derivation Footer */}
      <div className="border-t border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-elevated)] space-y-3">
        <div className="p-3 border border-[#8D9FCE]/40 bg-[var(--bg-canvas)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs font-serif text-[var(--text-secondary)]">
            {preset.note}
          </p>
          <div className="shrink-0 px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
            <KaTeXMath math={preset.reducedLatex} />
          </div>
        </div>

        {sim.yDirectRight !== undefined && Number.isFinite(sim.yFromVRight) && (
          <div className="text-xs font-tabular-mono text-[var(--text-muted)] flex justify-between px-1">
            <span>
              End-of-window consistency check: Direct Bernoulli y = {sim.yDirectRight.toFixed(4)}
            </span>
            <span className="text-[#96B898]">
              Reconstructed v^(1/(1−n)) = {sim.yFromVRight.toFixed(4)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
