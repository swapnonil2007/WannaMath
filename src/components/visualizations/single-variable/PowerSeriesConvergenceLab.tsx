"use client";

import React, { useState, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives";

interface PowerSeriesPreset {
  id: string;
  label: string;
  formulaLatex: string;
  radius: number | null; // null = Infinity
  intervalText: string;
  leftEndpointStatus: string;
  rightEndpointStatus: string;
  polesComplex: [number, number][];
  xRange: [number, number];
  yRange: [number, number];
  evalExact: (x: number) => number;
  evalPartial: (x: number, nTerms: number) => number;
  note: string;
}

const POWER_SERIES_PRESETS: PowerSeriesPreset[] = [
  {
    id: "witch",
    label: "1/(1 + x²) = Σ (-1)^n x^(2n)  [R = 1]",
    formulaLatex: "\\frac{1}{1+x^2} = \\sum_{n=0}^{\\infty} (-1)^n x^{2n}",
    radius: 1.0,
    intervalText: "(-1, 1) — Open at Both Endpoints",
    leftEndpointStatus: "x = -1: Σ(-1)^n Diverges (Oscillates)",
    rightEndpointStatus: "x = +1: Σ(-1)^n Diverges (Oscillates)",
    polesComplex: [
      [0, 1],
      [0, -1],
    ],
    xRange: [-1.45, 1.45],
    yRange: [-0.8, 2.2],
    evalExact: (x) => 1 / (1 + x * x),
    evalPartial: (x, N) => {
      let s = 0;
      for (let n = 0; n <= N; n++) s += (n % 2 === 0 ? 1 : -1) * Math.pow(x, 2 * n);
      return s;
    },
    note: "Even though 1/(1+x²) is perfectly smooth everywhere on the real line ℝ, its complex poles at z = ±i sit at distance R = 1 from the origin—blocking real convergence past |x| = 1!",
  },
  {
    id: "geom",
    label: "1/(1 - x) = Σ x^n  [R = 1]",
    formulaLatex: "\\frac{1}{1-x} = \\sum_{n=0}^{\\infty} x^n",
    radius: 1.0,
    intervalText: "(-1, 1) — Open at Both Endpoints",
    leftEndpointStatus: "x = -1: Σ(-1)^n Diverges",
    rightEndpointStatus: "x = +1: Real Pole Blow-Up",
    polesComplex: [[1, 0]],
    xRange: [-1.4, 1.4],
    yRange: [-1.5, 5.0],
    evalExact: (x) => (Math.abs(1 - x) > 0.03 ? 1 / (1 - x) : NaN),
    evalPartial: (x, N) => {
      let s = 0;
      for (let n = 0; n <= N; n++) s += Math.pow(x, n);
      return s;
    },
    note: "A direct real pole at x = 1 truncates convergence on both sides to the symmetric circle |z| < 1.",
  },
  {
    id: "log",
    label: "ln(1 + x) = Σ (-1)^(n-1) x^n/n  [(-1, 1]]",
    formulaLatex: "\\ln(1+x) = \\sum_{n=1}^{\\infty} \\frac{(-1)^{n-1}}{n} x^n",
    radius: 1.0,
    intervalText: "(-1, 1] — Half-Open (Converges at +1 only)",
    leftEndpointStatus: "x = -1: -Σ(1/n) Diverges (Log Pole)",
    rightEndpointStatus: "x = +1: Alternating Harmonic → ln(2)",
    polesComplex: [[-1, 0]],
    xRange: [-1.35, 1.5],
    yRange: [-2.2, 1.6],
    evalExact: (x) => (x > -0.99 ? Math.log(1 + x) : NaN),
    evalPartial: (x, N) => {
      let s = 0;
      for (let n = 1; n <= Math.max(1, N); n++) {
        s += ((n % 2 === 1 ? 1 : -1) * Math.pow(x, n)) / n;
      }
      return s;
    },
    note: "Inspect the two endpoints! At x = -1 it hits the logarithmic singularity, whereas at x = +1 the alternating harmonic series converges conditionally to ln(2) ≈ 0.693.",
  },
  {
    id: "exp",
    label: "e^x = Σ x^n / n!  [R = ∞]",
    formulaLatex: "e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}",
    radius: null,
    intervalText: "(-∞, +∞) — Entire Analytic Function",
    leftEndpointStatus: "No Finite Left Boundary",
    rightEndpointStatus: "No Finite Right Boundary",
    polesComplex: [],
    xRange: [-3.5, 3.5],
    yRange: [-0.5, 10.0],
    evalExact: (x) => Math.exp(x),
    evalPartial: (x, N) => {
      let s = 1;
      let term = 1;
      for (let n = 1; n <= N; n++) {
        term *= x / n;
        s += term;
      }
      return s;
    },
    note: "Because n! grows faster than any power a^n, the Ratio Test gives R = lim (n+1) = ∞. The power series converges across the entire real line and complex plane.",
  },
];

export function PowerSeriesConvergenceLab() {
  const [presetId, setPresetId] = useState<string>("witch");
  const preset = useMemo(
    () =>
      POWER_SERIES_PRESETS.find((p) => p.id === presetId) ??
      POWER_SERIES_PRESETS[0],
    [presetId]
  );

  const [degreeN, setDegreeN] = useState<number>(8);
  const [probeX, setProbeX] = useState<number>(0.8);

  const handleSelectPreset = (p: PowerSeriesPreset) => {
    setPresetId(p.id);
    setProbeX(p.radius ? 0.8 : 1.5);
  };

  const model = useMemo(() => {
    const [xMin, xMax] = preset.xRange;
    const exactPts: [number, number][] = [];
    const partialPts: [number, number][] = [];

    for (let i = 0; i <= 200; i++) {
      const x = xMin + ((xMax - xMin) * i) / 200;
      const ev = preset.evalExact(x);
      const pv = preset.evalPartial(x, degreeN);
      if (Number.isFinite(ev) && Math.abs(ev) < 18) exactPts.push([x, ev]);
      if (Number.isFinite(pv) && Math.abs(pv) < 18) partialPts.push([x, pv]);
    }

    const probeExact = preset.evalExact(probeX);
    const probePartial = preset.evalPartial(probeX, degreeN);
    const probeErr =
      Number.isFinite(probeExact) && Number.isFinite(probePartial)
        ? Math.abs(probeExact - probePartial)
        : NaN;

    return { exactPts, partialPts, probeExact, probePartial, probeErr };
  }, [preset, degreeN, probeX]);

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

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[#D5658B]">
            <span>Lab 1.4.2A</span>
            <span>•</span>
            <span>Power Series &amp; Complex Disks</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            Power Series Radius of Convergence &amp; Endpoint Inspector
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Scrub partial-sum order <KaTeXMath math="N" /> and test probe{" "}
            <KaTeXMath math="x_0" /> inside vs. outside <KaTeXMath math="(-R, R)" />{" "}
            while observing why complex poles pin the convergence disk.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDegreeN(8);
            setProbeX(preset.radius ? 0.8 : 1.5);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {POWER_SERIES_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelectPreset(p)}
            className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
              p.id === preset.id
                ? "border-[#D5658B] bg-[var(--bg-canvas)] text-[#D5658B] font-medium"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Partial Sum Degree N</span>
            <span className="font-tabular-mono font-semibold text-[#D35323]">
              N = {degreeN}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={degreeN}
            onChange={(e) => setDegreeN(Number(e.target.value))}
            aria-label="Power series partial sum degree N"
            className="w-full accent-[#D35323]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Probe Point x₀</span>
            <span className="font-tabular-mono text-[#8D9FCE]">
              x₀ = {probeX.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={preset.xRange[0] + 0.05}
            max={preset.xRange[1] - 0.05}
            step={0.02}
            value={probeX}
            onChange={(e) => setProbeX(Number(e.target.value))}
            aria-label="Test probe x0"
            className="w-full accent-[#8D9FCE]"
          />
        </div>

        <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto flex items-center">
          <KaTeXMath math={preset.formulaLatex} />
        </div>
      </div>

      {/* Dual Real Plot + Complex Disk Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="font-medium text-[var(--text-primary)]">
              1. Real Line Partial Sum <KaTeXMath math={`S_{${degreeN}}(x)`} /> vs.{" "}
              <KaTeXMath math="f(x)" />
            </span>
            <span className="font-tabular-mono text-[#029091]">
              {preset.intervalText}
            </span>
          </div>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.yRange}
            width={500}
            height={300}
            xLabel="x"
            yLabel="y"
            xColor="#8D9FCE"
            yColor="#D5658B"
            ariaLabel="Power series partial sum vs exact function on real line"
            onSelectPoint={(wx) => setProbeX(Number(wx.toFixed(2)))}
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {preset.radius !== null && (
                  <rect
                    x={toSvgX(-preset.radius)}
                    y={32}
                    width={Math.abs(
                      toSvgX(preset.radius) - toSvgX(-preset.radius)
                    )}
                    height={300 - 64}
                    fill="rgba(2, 144, 145, 0.12)"
                    stroke="#029091"
                    strokeDasharray="4 3"
                  />
                )}
                {model.exactPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#8D9FCE"
                    strokeWidth={2.5}
                    points={toPoly(model.exactPts, toSvgX, toSvgY, preset.yRange)}
                  />
                )}
                {model.partialPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#D35323"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    points={toPoly(model.partialPts, toSvgX, toSvgY, preset.yRange)}
                  />
                )}
                <line
                  x1={toSvgX(probeX)}
                  y1={32}
                  x2={toSvgX(probeX)}
                  y2={300 - 32}
                  stroke="#FBEAA4"
                  strokeDasharray="3 3"
                />
              </>
            )}
          </SvgCoordinatePlane2D>
        </div>

        {/* Complex Plane Disk |z| < R + Telemetry */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            2. Complex Plane <KaTeXMath math="\mathbb{C}" /> Convergence Disk &amp;
            Endpoint Tests
          </span>
          <SvgCoordinatePlane2D
            xRange={[-1.6, 1.6]}
            yRange={[-1.6, 1.6]}
            width={340}
            height={220}
            xLabel="Re(z)"
            yLabel="Im(z)"
            xColor="#8D9FCE"
            yColor="#96B898"
            ariaLabel="Complex convergence disk and singularity locations"
            className="w-full h-48 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const cx = toSvgX(0);
              const cy = toSvgY(0);
              const rx = Math.abs(toSvgX(1.0) - cx);
              const ry = Math.abs(toSvgY(1.0) - cy);
              return (
                <>
                  {preset.radius !== null ? (
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={rx}
                      ry={ry}
                      fill="rgba(2, 144, 145, 0.16)"
                      stroke="#029091"
                      strokeDasharray="4 3"
                      strokeWidth={1.6}
                    />
                  ) : (
                    <rect
                      x={32}
                      y={32}
                      width={340 - 64}
                      height={220 - 64}
                      fill="rgba(2, 144, 145, 0.1)"
                    />
                  )}
                  {preset.polesComplex.map(([px, py], idx) => (
                    <g key={idx}>
                      <circle
                        cx={toSvgX(px)}
                        cy={toSvgY(py)}
                        r={5}
                        fill="#B95869"
                        stroke="#FBEAA4"
                        strokeWidth={1.4}
                      />
                      <text
                        x={toSvgX(px) + 7}
                        y={toSvgY(py) - 4}
                        fill="#B95869"
                        fontSize="10"
                        fontFamily="IBM Plex Sans, sans-serif"
                      >
                        Pole
                      </text>
                    </g>
                  ))}
                  {Math.abs(probeX) <= 1.55 && (
                    <circle
                      cx={toSvgX(probeX)}
                      cy={cy}
                      r={4.2}
                      fill="#FBEAA4"
                    />
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 text-xs font-tabular-mono">
            <div>
              {preset.leftEndpointStatus}
            </div>
            <div>
              {preset.rightEndpointStatus}
            </div>
            <div className="border-t border-[var(--border-subtle)] pt-1.5 text-[#D35323]">
              |f({probeX.toFixed(2)}) - S_{degreeN}({probeX.toFixed(2)})| ={" "}
              {Number.isFinite(model.probeErr)
                ? model.probeErr.toExponential(2)
                : "NaN"}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
        <strong className="text-[var(--text-primary)] font-sans">
          Analytic Convergence Insight:
        </strong>{" "}
        {preset.note}
      </div>
    </section>
  );
}
