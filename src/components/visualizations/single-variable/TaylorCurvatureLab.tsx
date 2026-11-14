"use client";

import React, { useState, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

interface TaylorCurvPreset {
  id: string;
  label: string;
  xRange: [number, number];
  yRange: [number, number];
  defaultA: number;
  note: string;
  /** Returns exact k-th derivative f^(k)(a) for k = 0..12 */
  derivAt: (a: number, k: number) => number;
  evalF: (x: number) => number;
}

const TAYLOR_CURV_PRESETS: TaylorCurvPreset[] = [
  {
    id: "sin",
    label: "sin(x) (Infinite Radius R = ∞)",
    xRange: [-4.5, 4.5],
    yRange: [-2.2, 2.2],
    defaultA: 0.6,
    note: "Every higher degree hugs sin(x) across a wider interval! Notice how at any inflection point (x = 0, π), f'' = 0 so curvature κ = 0 and the osculating circle flattens into a straight line (R → ∞).",
    evalF: (x) => Math.sin(x),
    derivAt: (a, k) => {
      const m = ((k % 4) + 4) % 4;
      if (m === 0) return Math.sin(a);
      if (m === 1) return Math.cos(a);
      if (m === 2) return -Math.sin(a);
      return -Math.cos(a);
    },
  },
  {
    id: "exp",
    label: "e^(0.7x) (Positive Concavity)",
    xRange: [-2.5, 3.0],
    yRange: [-0.5, 5.0],
    defaultA: 0.5,
    note: "For exponential functions, odd and even Taylor terms reinforce smoothly on the right. Drag degree n from 1 → 2 to watch the quadratic term match the osculating circle's curvature κ(a)!",
    evalF: (x) => Math.exp(0.7 * x),
    derivAt: (a, k) => Math.pow(0.7, k) * Math.exp(0.7 * a),
  },
  {
    id: "witch",
    label: "Witch of Agnesi: 1/(1 + x²) (Radius Barrier)",
    xRange: [-2.5, 2.5],
    yRange: [-0.6, 1.8],
    defaultA: 0.0,
    note: "Complex poles at x = ±i restrict convergence centered at a = 0 to |x| < √(1 + a²)! Even at n = 12, approximations violently diverge past |x| > 1.",
    evalF: (x) => 1 / (1 + x * x),
    derivAt: (a, k) => {
      // f(z) = Re(1 / (1 - i z)), so d^k/dz^k = k! * Re( i^k / (1 - i a)^(k+1) )
      // Compute (i^k) / (1 - i a)^(k+1) iteratively in complex arithmetic:
      let re = 1 / (1 + a * a);
      let im = a / (1 + a * a); // 1 / (1 - i a) = (1 + i a)/(1 + a^2)
      let fact = 1;
      for (let j = 1; j <= k; j++) {
        fact *= j;
        // multiply by i / (1 - i a): first multiply (re, im) by (re0, im0) = 1/(1-ia)
        const r0 = 1 / (1 + a * a);
        const i0 = a / (1 + a * a);
        const nr = re * r0 - im * i0;
        const ni = re * i0 + im * r0;
        // then multiply by i: (x, y) -> (-y, x)
        re = -ni;
        im = nr;
      }
      return fact * re;
    },
  },
  {
    id: "ln",
    label: "ln(1.5 + x) (Pole at x = -1.5)",
    xRange: [-1.3, 3.2],
    yRange: [-2.0, 2.5],
    defaultA: 0.5,
    note: "Approaching x = -1.5 hits a logarithmic pole, limiting convergence to distance |x - a| < |a + 1.5|.",
    evalF: (x) => (x > -1.49 ? Math.log(1.5 + x) : NaN),
    derivAt: (a, k) => {
      const u = 1.5 + a;
      if (k === 0) return Math.log(u);
      let fact = 1;
      for (let j = 1; j < k; j++) fact *= j;
      return (k % 2 === 1 ? 1 : -1) * fact / Math.pow(u, k);
    },
  },
];

export function TaylorCurvatureLab() {
  const [presetId, setPresetId] = useState<string>("sin");
  const preset = useMemo(
    () =>
      TAYLOR_CURV_PRESETS.find((p) => p.id === presetId) ??
      TAYLOR_CURV_PRESETS[0],
    [presetId]
  );

  const [degreeN, setDegreeN] = useState<number>(3);
  const [centerA, setCenterA] = useState<number>(preset.defaultA);
  const [showOsculating, setShowOsculating] = useState<boolean>(true);

  const handleSelectPreset = (p: TaylorCurvPreset) => {
    setPresetId(p.id);
    setCenterA(p.defaultA);
  };

  const model = useMemo(() => {
    const coeffs: number[] = [];
    let fact = 1;
    for (let k = 0; k <= degreeN; k++) {
      if (k > 0) fact *= k;
      coeffs.push(preset.derivAt(centerA, k) / fact);
    }

    const evalPn = (x: number) => {
      const dx = x - centerA;
      let sum = 0;
      let pow = 1;
      for (let k = 0; k <= degreeN; k++) {
        sum += coeffs[k] * pow;
        pow *= dx;
      }
      return sum;
    };

    const y0 = preset.derivAt(centerA, 0);
    const yp = preset.derivAt(centerA, 1);
    const ypp = preset.derivAt(centerA, 2);
    const speedSq = 1 + yp * yp;
    const kappa = Math.abs(ypp) / Math.pow(speedSq, 1.5);
    const radius = kappa > 1e-4 ? 1 / kappa : Infinity;

    // Osculating circle center: P + R * unit_normal where unit normal points in sign(y'') * (-y', 1)/sqrt(1 + y'^2)
    let oscPts: [number, number][] = [];
    let oscCenter: [number, number] | null = null;
    if (Number.isFinite(radius) && radius < 20) {
      const normScale = (ypp >= 0 ? 1 : -1) * (radius / Math.sqrt(speedSq));
      const cx = centerA - yp * normScale;
      const cy = y0 + 1 * normScale;
      oscCenter = [cx, cy];
      for (let i = 0; i <= 96; i++) {
        const theta = (2 * Math.PI * i) / 96;
        oscPts.push([
          cx + radius * Math.cos(theta),
          cy + radius * Math.sin(theta),
        ]);
      }
    }

    const [xMin, xMax] = preset.xRange;
    const fPts: [number, number][] = [];
    const pPts: [number, number][] = [];
    const remPts: [number, number][] = [];

    for (let i = 0; i <= 200; i++) {
      const px = xMin + ((xMax - xMin) * i) / 200;
      const fv = preset.evalF(px);
      const pv = evalPn(px);
      if (Number.isFinite(fv) && Math.abs(fv) < 12) fPts.push([px, fv]);
      if (Number.isFinite(pv) && Math.abs(pv) < 15) pPts.push([px, pv]);
      if (Number.isFinite(fv) && Number.isFinite(pv)) {
        const rem = Math.abs(fv - pv);
        if (rem < 12) remPts.push([px, rem]);
      }
    }

    return {
      y0,
      yp,
      ypp,
      kappa,
      radius,
      oscCenter,
      oscPts,
      fPts,
      pPts,
      remPts,
      coeffs,
    };
  }, [preset, degreeN, centerA]);

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
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-upper)]">
            <span>Lab 1.2.4A</span>
            <span>•</span>
            <span>Osculating Polynomials &amp; Curvature</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            Taylor Degree Scrubber (<KaTeXMath math="n \in [1, 12]" />) &amp;
            Osculating Circle Inspector
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Increase degree <KaTeXMath math="n" /> to see higher derivatives lock{" "}
            <KaTeXMath math="P_n(x)" /> onto <KaTeXMath math="f(x)" />, while the
            2nd-order osculating circle visualizes curvature{" "}
            <KaTeXMath math="\kappa(a) = 1/R" />.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDegreeN(3);
            setCenterA(preset.defaultA);
            setShowOsculating(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {TAYLOR_CURV_PRESETS.map((p) => {
          const active = p.id === preset.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                active
                  ? "border-[var(--math-ink-upper)] bg-[var(--bg-canvas)] text-[var(--math-ink-upper)] font-medium"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Polynomial Degree n</span>
            <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)]">
              n = {degreeN}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            value={degreeN}
            onChange={(e) => setDegreeN(Number(e.target.value))}
            aria-label="Taylor polynomial degree n"
            className="w-full accent-[#D35323]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Expansion Center a</span>
            <span className="font-tabular-mono text-[var(--math-ink-x)]">
              a = {centerA.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={preset.xRange[0] + 0.3}
            max={preset.xRange[1] - 0.3}
            step={0.05}
            value={centerA}
            onChange={(e) => setCenterA(Number(e.target.value))}
            aria-label="Taylor center a"
            className="w-full accent-[#8D9FCE]"
          />
        </div>

        <div className="flex items-center">
          <label className="inline-flex items-center gap-2 text-xs font-sans text-[var(--text-primary)] cursor-pointer">
            <input
              type="checkbox"
              checked={showOsculating}
              onChange={(e) => setShowOsculating(e.target.checked)}
              className="accent-[#029091]"
            />
            <span>
              Overlay Osculating Circle (<KaTeXMath math="R = 1/\kappa(a)" />)
            </span>
          </label>
        </div>
      </div>

      {/* Dual Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Function + Taylor P_n + Osculating Circle */}
        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            1. Function <KaTeXMath math="f(x)" />, Taylor{" "}
            <KaTeXMath math={`P_{${degreeN}}(x)`} /> &amp; Osculating Circle
          </span>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.yRange}
            width={460}
            height={300}
            xLabel="x"
            yLabel="y"
            xColor="#8D9FCE"
            yColor="#D35323"
            ariaLabel="Taylor polynomial approximation and osculating curvature circle"
            onSelectPoint={(wx) => setCenterA(Number(wx.toFixed(2)))}
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {showOsculating && model.oscPts.length > 2 && (
                  <polyline
                    fill="none"
                    stroke="#029091"
                    strokeWidth={1.6}
                    strokeDasharray="4 3"
                    points={toPoly(model.oscPts, toSvgX, toSvgY, [
                      preset.yRange[0] - 4,
                      preset.yRange[1] + 4,
                    ])}
                  />
                )}
                {showOsculating && model.oscCenter && (
                  <line
                    x1={toSvgX(centerA)}
                    y1={toSvgY(model.y0)}
                    x2={toSvgX(model.oscCenter[0])}
                    y2={toSvgY(model.oscCenter[1])}
                    stroke="#029091"
                    strokeOpacity={0.6}
                    strokeWidth={1.2}
                  />
                )}
                {model.fPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#8D9FCE"
                    strokeWidth={2.5}
                    points={toPoly(model.fPts, toSvgX, toSvgY, preset.yRange)}
                  />
                )}
                {model.pPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#D35323"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    points={toPoly(model.pPts, toSvgX, toSvgY, preset.yRange)}
                  />
                )}
                <circle
                  cx={toSvgX(centerA)}
                  cy={toSvgY(
                    Math.max(
                      preset.yRange[0],
                      Math.min(preset.yRange[1], model.y0)
                    )
                  )}
                  r={4.8}
                  fill="#FBEAA4"
                  stroke="#1E1F22"
                  strokeWidth={1.4}
                />
              </>
            )}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: Remainder Error |R_n(x)| */}
        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            2. Pointwise Remainder Error{" "}
            <KaTeXMath math={`|R_{${degreeN}}(x)| = |f(x) - P_{${degreeN}}(x)|`} />
          </span>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={[-0.1, 2.2]}
            width={460}
            height={300}
            xLabel="x"
            yLabel="|R_n(x)|"
            xColor="#8D9FCE"
            yColor="#B95869"
            ariaLabel="Pointwise Taylor remainder error curve"
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {model.remPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#B95869"
                    strokeWidth={2.2}
                    points={toPoly(model.remPts, toSvgX, toSvgY, [-0.1, 2.2])}
                  />
                )}
                <circle
                  cx={toSvgX(centerA)}
                  cy={toSvgY(0)}
                  r={4.5}
                  fill="#FBEAA4"
                />
              </>
            )}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Live Curvature & Derivatives Readout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono">
        <div>
          <span className="text-[var(--text-secondary)] block font-sans">
            Slope f&apos;(a)
          </span>
          <span className="text-[var(--math-ink-x)] text-sm font-semibold">
            {model.yp.toFixed(4)}
          </span>
        </div>
        <div>
          <span className="text-[var(--text-secondary)] block font-sans">
            Concavity f&apos;&apos;(a)
          </span>
          <span className="text-[var(--math-ink-sweep)] text-sm font-semibold">
            {model.ypp.toFixed(4)}
          </span>
        </div>
        <div>
          <span className="text-[var(--text-secondary)] block font-sans">
            Curvature κ(a)
          </span>
          <span className="text-[var(--math-ink-z)] text-sm font-semibold">
            {model.kappa.toFixed(4)}
          </span>
        </div>
        <div>
          <span className="text-[var(--text-secondary)] block font-sans">
            Osculating Radius R
          </span>
          <span className="text-[var(--math-ink-diff)] text-sm font-semibold">
            {Number.isFinite(model.radius) ? model.radius.toFixed(3) : "∞ (Flat)"}
          </span>
        </div>
      </div>

      <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
        <strong className="text-[var(--text-primary)] font-sans">
          Osculation Insight:
        </strong>{" "}
        {preset.note}
      </div>
    </section>
  );
}
