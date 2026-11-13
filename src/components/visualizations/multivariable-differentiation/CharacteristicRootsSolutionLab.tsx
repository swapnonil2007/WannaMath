"use client";

import React, { useState, useMemo } from "react";
import { RotateCcw, Sliders } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives";

interface RootPreset {
  id: string;
  label: string;
  a: number;
  b: number;
  c: number;
  y0: number;
  dy0: number;
}

const ROOT_PRESETS: RootPreset[] = [
  {
    id: "overdamped",
    label: "Distinct Real (Overdamped)",
    a: 1,
    b: 3,
    c: 2,
    y0: 2,
    dy0: 0,
  },
  {
    id: "critical",
    label: "Repeated Root (Critically Damped)",
    a: 1,
    b: 2,
    c: 1,
    y0: 2,
    dy0: 1,
  },
  {
    id: "underdamped",
    label: "Complex Conjugate (Underdamped)",
    a: 1,
    b: 0.8,
    c: 4.16,
    y0: 2,
    dy0: 0,
  },
  {
    id: "harmonic",
    label: "Pure Imaginary (Undamped Center)",
    a: 1,
    b: 0,
    c: 4,
    y0: 2,
    dy0: 0,
  },
  {
    id: "unstable-spiral",
    label: "Positive Real Part (Unstable)",
    a: 1,
    b: -0.6,
    c: 3,
    y0: 0.5,
    dy0: 0,
  },
];

type RootRegime = "distinct" | "repeated" | "complex";

export function CharacteristicRootsSolutionLab() {
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(0.8);
  const [c, setC] = useState<number>(4.16);
  const [y0, setY0] = useState<number>(2);
  const [dy0, setDy0] = useState<number>(0);

  // Interactive repeated-root limit morph ε in (e^((r+ε)x) - e^(rx)) / ε → x e^(rx)
  const [showLimitMorph, setShowLimitMorph] = useState<boolean>(false);
  const [morphEps, setMorphEps] = useState<number>(0.35);

  // Optional forcing term F₀ cos(ω x) superposition preview
  const [enableForcing, setEnableForcing] = useState<boolean>(false);
  const [forceAmp, setForceAmp] = useState<number>(1.5);
  const [forceFreq, setForceFreq] = useState<number>(1.4);

  const applyPreset = (p: RootPreset) => {
    setA(p.a);
    setB(p.b);
    setC(p.c);
    setY0(p.y0);
    setDy0(p.dy0);
  };

  const solutionModel = useMemo(() => {
    const disc = b * b - 4 * a * c;
    const tol = 1e-3;
    let regime: RootRegime = "distinct";
    if (Math.abs(disc) <= tol) regime = "repeated";
    else if (disc < 0) regime = "complex";

    const alpha = -b / (2 * a);
    let r1 = alpha;
    let r2 = alpha;
    let beta = 0;

    let c1 = 0;
    let c2 = 0;

    if (regime === "distinct") {
      const sd = Math.sqrt(Math.max(0, disc)) / (2 * a);
      r1 = alpha + sd;
      r2 = alpha - sd;
      const denom = r2 - r1;
      if (Math.abs(denom) > 1e-6) {
        c1 = (r2 * y0 - dy0) / denom;
        c2 = (dy0 - r1 * y0) / denom;
      }
    } else if (regime === "repeated") {
      r1 = alpha;
      r2 = alpha;
      c1 = y0;
      c2 = dy0 - r1 * y0;
    } else {
      beta = Math.sqrt(-disc) / (2 * a);
      c1 = y0;
      c2 = Math.abs(beta) > 1e-6 ? (dy0 - alpha * y0) / beta : 0;
    }

    // Particular integral y_p(x) for forcing F0 cos(ω x)
    // (a(-ω^2) + c) cos(ω x) - (b ω) sin(ω x)
    const pRe = c - a * forceFreq * forceFreq;
    const pIm = b * forceFreq;
    const denomSq = pRe * pRe + pIm * pIm;
    const isResonance = denomSq < 1e-3;
    const pCos = !isResonance ? (forceAmp * pRe) / denomSq : 0;
    const pSin = !isResonance ? (forceAmp * pIm) / denomSq : 0;

    const evalComplementary = (x: number): number => {
      if (regime === "distinct") {
        return c1 * Math.exp(r1 * x) + c2 * Math.exp(r2 * x);
      }
      if (regime === "repeated") {
        return (c1 + c2 * x) * Math.exp(r1 * x);
      }
      return Math.exp(alpha * x) * (c1 * Math.cos(beta * x) + c2 * Math.sin(beta * x));
    };

    const evalComplementaryDeriv = (x: number): number => {
      if (regime === "distinct") {
        return c1 * r1 * Math.exp(r1 * x) + c2 * r2 * Math.exp(r2 * x);
      }
      if (regime === "repeated") {
        return (c2 + r1 * (c1 + c2 * x)) * Math.exp(r1 * x);
      }
      const cosB = Math.cos(beta * x);
      const sinB = Math.sin(beta * x);
      const val = c1 * cosB + c2 * sinB;
      const innerDeriv = -c1 * beta * sinB + c2 * beta * cosB;
      return Math.exp(alpha * x) * (alpha * val + innerDeriv);
    };

    const evalParticular = (x: number): number => {
      if (!enableForcing) return 0;
      if (isResonance) {
        // Pure harmonic resonance: a y'' + c y = F0 cos(ω x) => (F0 / (2 a ω)) x sin(ω x)
        return (forceAmp / (2 * a * Math.max(forceFreq, 0.2))) * x * Math.sin(forceFreq * x);
      }
      return pCos * Math.cos(forceFreq * x) + pSin * Math.sin(forceFreq * x);
    };

    const evalParticularDeriv = (x: number): number => {
      if (!enableForcing) return 0;
      if (isResonance) {
        const k = forceAmp / (2 * a * Math.max(forceFreq, 0.2));
        return k * (Math.sin(forceFreq * x) + forceFreq * x * Math.cos(forceFreq * x));
      }
      return (
        -pCos * forceFreq * Math.sin(forceFreq * x) +
        pSin * forceFreq * Math.cos(forceFreq * x)
      );
    };

    return {
      disc,
      regime,
      alpha,
      beta,
      r1,
      r2,
      c1,
      c2,
      pCos,
      pSin,
      isResonance,
      evalComplementary,
      evalComplementaryDeriv,
      evalTotal: (x: number) => evalComplementary(x) + evalParticular(x),
      evalTotalDeriv: (x: number) =>
        evalComplementaryDeriv(x) + evalParticularDeriv(x),
      evalParticular,
    };
  }, [a, b, c, y0, dy0, enableForcing, forceAmp, forceFreq]);

  const xRange: [number, number] = [0, 8];
  const yRange: [number, number] = [-4.2, 4.2];
  const sRange: [number, number] = [-3.5, 3.5];

  const sampled = useMemo(() => {
    const steps = 200;
    const totalPts: [number, number][] = [];
    const compPts: [number, number][] = [];
    const partPts: [number, number][] = [];
    const envPosPts: [number, number][] = [];
    const envNegPts: [number, number][] = [];
    const phasePts: [number, number][] = [];
    const morphQuotientPts: [number, number][] = [];
    const morphLimitPts: [number, number][] = [];

    const envAmp =
      solutionModel.regime === "complex"
        ? Math.hypot(solutionModel.c1, solutionModel.c2)
        : 0;

    for (let i = 0; i <= steps; i++) {
      const x = xRange[0] + ((xRange[1] - xRange[0]) * i) / steps;
      const yc = solutionModel.evalComplementary(x);
      const yp = solutionModel.evalParticular(x);
      const yt = yc + yp;
      const dy = solutionModel.evalTotalDeriv(x);

      if (Number.isFinite(yt) && Math.abs(yt) < 25) totalPts.push([x, yt]);
      if (Number.isFinite(yc) && Math.abs(yc) < 25) compPts.push([x, yc]);
      if (enableForcing && Number.isFinite(yp) && Math.abs(yp) < 25) {
        partPts.push([x, yp]);
      }

      if (solutionModel.regime === "complex" && !enableForcing) {
        const env = envAmp * Math.exp(solutionModel.alpha * x);
        if (env < 15) {
          envPosPts.push([x, env]);
          envNegPts.push([x, -env]);
        }
      }

      if (Number.isFinite(yt) && Number.isFinite(dy) && Math.abs(yt) < 12 && Math.abs(dy) < 12) {
        phasePts.push([yt, dy]);
      }

      // Limit morph around real anchor rBase = alpha (capped inside [-1.5, 0.35] for clear view)
      if (showLimitMorph) {
        const rBase = Math.max(-1.2, Math.min(0.2, solutionModel.alpha));
        const qVal =
          (Math.exp((rBase + morphEps) * x) - Math.exp(rBase * x)) / morphEps;
        const limVal = x * Math.exp(rBase * x);
        if (Math.abs(qVal) < 15) morphQuotientPts.push([x, qVal]);
        if (Math.abs(limVal) < 15) morphLimitPts.push([x, limVal]);
      }
    }

    return {
      totalPts,
      compPts,
      partPts,
      envPosPts,
      envNegPts,
      phasePts,
      morphQuotientPts,
      morphLimitPts,
    };
  }, [solutionModel, enableForcing, showLimitMorph, morphEps]);

  const toPoly = (
    pts: [number, number][],
    toSvgX: (x: number) => number,
    toSvgY: (y: number) => number,
    clampY: [number, number] = [-4.6, 4.6]
  ) =>
    pts
      .map(([px, py]) => {
        const cy = Math.max(clampY[0], Math.min(clampY[1], py));
        return `${toSvgX(px).toFixed(1)},${toSvgY(cy).toFixed(1)}`;
      })
      .join(" ");

  const formulaLatex = useMemo(() => {
    if (solutionModel.regime === "distinct") {
      return `y_c(x) = ${solutionModel.c1.toFixed(2)}e^{${solutionModel.r1.toFixed(
        2
      )}x} + ${solutionModel.c2.toFixed(2)}e^{${solutionModel.r2.toFixed(2)}x}`;
    }
    if (solutionModel.regime === "repeated") {
      return `y_c(x) = (${solutionModel.c1.toFixed(2)} + ${solutionModel.c2.toFixed(
        2
      )}x)e^{${solutionModel.r1.toFixed(2)}x}`;
    }
    return `y_c(x) = e^{${solutionModel.alpha.toFixed(
      2
    )}x}\\!\\left(${solutionModel.c1.toFixed(
      2
    )}\\cos(${solutionModel.beta.toFixed(2)}x) + ${solutionModel.c2.toFixed(
      2
    )}\\sin(${solutionModel.beta.toFixed(2)}x)\\right)`;
  }, [solutionModel]);

  const regimeBadge =
    solutionModel.regime === "distinct"
      ? { text: "Δ > 0 • Distinct Real Roots", color: "#8D9FCE" }
      : solutionModel.regime === "repeated"
        ? { text: "Δ ≈ 0 • Repeated Root (te^{rt})", color: "#D35323" }
        : { text: "Δ < 0 • Complex Conjugate Roots", color: "#029091" };

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[#8D9FCE]">
            <span>Lab 3.1.10B</span>
            <span>•</span>
            <span>Characteristic Equation Explorer</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            Characteristic Roots (<KaTeXMath math="ar^2 + br + c = 0" />): Distinct,
            Repeated &amp; Complex Regimes
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Scrub the coefficients of{" "}
            <KaTeXMath math="a y'' + b y' + c y = 0" /> and initial conditions{" "}
            <KaTeXMath math="(y(0), y'(0))" /> to link complex{" "}
            <KaTeXMath math="s" />-plane pole positions directly to time waveforms
            and phase-plane spirals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => applyPreset(ROOT_PRESETS[2])}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Underdamped
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {ROOT_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[#8D9FCE] hover:text-[var(--text-primary)] transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Coefficient & IVP Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Inertia a</span>
            <span className="font-tabular-mono text-[#8D9FCE]">
              {a.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2.5}
            step={0.1}
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            aria-label="Coefficient a"
            className="w-full accent-[#8D9FCE]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Damping b</span>
            <span className="font-tabular-mono text-[#96B898]">
              {b.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={-3.0}
            max={5.0}
            step={0.1}
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            aria-label="Coefficient b"
            className="w-full accent-[#96B898]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Stiffness c</span>
            <span className="font-tabular-mono text-[#029091]">
              {c.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={-3.0}
            max={6.0}
            step={0.1}
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            aria-label="Coefficient c"
            className="w-full accent-[#029091]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Initial y(0)</span>
            <span className="font-tabular-mono text-[#D35323]">
              {y0.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={-3.0}
            max={3.0}
            step={0.1}
            value={y0}
            onChange={(e) => setY0(Number(e.target.value))}
            aria-label="Initial condition y(0)"
            className="w-full accent-[#D35323]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Initial y&apos;(0)</span>
            <span className="font-tabular-mono text-[#FBEAA4]">
              {dy0.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={-4.0}
            max={4.0}
            step={0.1}
            value={dy0}
            onChange={(e) => setDy0(Number(e.target.value))}
            aria-label="Initial derivative y'(0)"
            className="w-full accent-[#FBEAA4]"
          />
        </div>
      </div>

      {/* Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-xs font-sans text-[var(--text-primary)] cursor-pointer">
            <input
              type="checkbox"
              checked={showLimitMorph}
              onChange={(e) => setShowLimitMorph(e.target.checked)}
              className="accent-[#D35323]"
            />
            <span>Show Repeated-Root Limit Morph</span>
            <KaTeXMath math="\frac{e^{(r+\varepsilon)x}-e^{rx}}{\varepsilon} \to xe^{rx}" />
          </label>

          {showLimitMorph && (
            <div className="flex items-center gap-2 text-xs font-tabular-mono">
              <span className="text-[#D35323]">ε = {morphEps.toFixed(3)}</span>
              <input
                type="range"
                min={0.01}
                max={0.8}
                step={0.01}
                value={morphEps}
                onChange={(e) => setMorphEps(Number(e.target.value))}
                aria-label="Repeated root morph epsilon"
                className="w-28 accent-[#D35323]"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-sans text-[var(--text-primary)] cursor-pointer">
            <input
              type="checkbox"
              checked={enableForcing}
              onChange={(e) => setEnableForcing(e.target.checked)}
              className="accent-[#029091]"
            />
            <span>Superpose Particular <KaTeXMath math={`y_p(x)`} /> (<KaTeXMath math={`g(x)=F_0\\cos(\\omega x)`} />)</span>
          </label>

          {enableForcing && (
            <div className="flex items-center gap-3 text-xs font-tabular-mono">
              <label className="flex items-center gap-1">
                <span>F₀={forceAmp.toFixed(1)}</span>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={forceAmp}
                  onChange={(e) => setForceAmp(Number(e.target.value))}
                  aria-label="Forcing amplitude"
                  className="w-16 accent-[#029091]"
                />
              </label>
              <label className="flex items-center gap-1">
                <span>ω={forceFreq.toFixed(1)}</span>
                <input
                  type="range"
                  min={0.5}
                  max={3.5}
                  step={0.1}
                  value={forceFreq}
                  onChange={(e) => setForceFreq(Number(e.target.value))}
                  aria-label="Forcing frequency"
                  className="w-16 accent-[#029091]"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 3-Panel Visual Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Complex s-plane (3 cols) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="font-medium text-[var(--text-primary)]">
              1. Complex <KaTeXMath math="s" />-Plane Roots
            </span>
          </div>
          <SvgCoordinatePlane2D
            xRange={sRange}
            yRange={sRange}
            width={280}
            height={280}
            xLabel="Re(r)"
            yLabel="Im(r)"
            xColor="#8D9FCE"
            yColor="#96B898"
            ariaLabel="Complex characteristic root s-plane"
            className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const zeroX = toSvgX(0);
              const leftWidth = Math.max(0, zeroX - 32);
              const root1X =
                solutionModel.regime === "complex"
                  ? solutionModel.alpha
                  : solutionModel.r1;
              const root1Y =
                solutionModel.regime === "complex" ? solutionModel.beta : 0;
              const root2X =
                solutionModel.regime === "complex"
                  ? solutionModel.alpha
                  : solutionModel.r2;
              const root2Y =
                solutionModel.regime === "complex" ? -solutionModel.beta : 0;

              return (
                <>
                  {/* Left-Half Stable Plane Shading */}
                  <rect
                    x={32}
                    y={32}
                    width={leftWidth}
                    height={280 - 64}
                    fill="rgba(2, 144, 145, 0.1)"
                  />
                  <text
                    x={40}
                    y={48}
                    fill="#029091"
                    fontSize="10"
                    fontFamily="IBM Plex Sans, sans-serif"
                  >
                    Stable Re(r) &lt; 0
                  </text>

                  {/* Root 1 */}
                  <circle
                    cx={toSvgX(Math.max(-3.4, Math.min(3.4, root1X)))}
                    cy={toSvgY(Math.max(-3.4, Math.min(3.4, root1Y)))}
                    r={6}
                    fill="#D35323"
                    stroke="#FBEAA4"
                    strokeWidth={1.6}
                  />
                  {/* Root 2 */}
                  <circle
                    cx={toSvgX(Math.max(-3.4, Math.min(3.4, root2X)))}
                    cy={toSvgY(Math.max(-3.4, Math.min(3.4, root2Y)))}
                    r={6}
                    fill="#8D9FCE"
                    stroke="#FBEAA4"
                    strokeWidth={1.6}
                  />
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Time-Domain Waveform (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="font-medium text-[var(--text-primary)]">
              2. Solution Waveform <KaTeXMath math="y(x)" />
            </span>
            <span
              className="font-tabular-mono text-[11px] px-2 py-0.5 border bg-[var(--bg-canvas)]"
              style={{ borderColor: regimeBadge.color, color: regimeBadge.color }}
            >
              {regimeBadge.text}
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={xRange}
            yRange={yRange}
            width={460}
            height={280}
            xLabel="x"
            yLabel="y(x)"
            xColor="#8D9FCE"
            yColor="#D35323"
            ariaLabel="Second-order ODE solution waveform y(x)"
            className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {/* Decay/Growth Envelope */}
                {sampled.envPosPts.length > 1 && (
                  <>
                    <polyline
                      fill="none"
                      stroke="#AAA36D"
                      strokeWidth={1.2}
                      strokeDasharray="4 4"
                      points={toPoly(sampled.envPosPts, toSvgX, toSvgY)}
                    />
                    <polyline
                      fill="none"
                      stroke="#AAA36D"
                      strokeWidth={1.2}
                      strokeDasharray="4 4"
                      points={toPoly(sampled.envNegPts, toSvgX, toSvgY)}
                    />
                  </>
                )}

                {/* Complementary y_c when forcing is active */}
                {enableForcing && sampled.compPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#8D9FCE"
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    points={toPoly(sampled.compPts, toSvgX, toSvgY)}
                  />
                )}

                {/* Particular y_p when forcing is active */}
                {enableForcing && sampled.partPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#029091"
                    strokeWidth={1.6}
                    strokeDasharray="2 3"
                    points={toPoly(sampled.partPts, toSvgX, toSvgY)}
                  />
                )}

                {/* Total Solution y(x) */}
                {sampled.totalPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#D35323"
                    strokeWidth={2.5}
                    points={toPoly(sampled.totalPts, toSvgX, toSvgY)}
                  />
                )}

                {/* Repeated-root morph comparison */}
                {showLimitMorph && sampled.morphLimitPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#FBEAA4"
                    strokeWidth={1.6}
                    strokeDasharray="3 3"
                    points={toPoly(sampled.morphLimitPts, toSvgX, toSvgY)}
                  />
                )}
                {showLimitMorph && sampled.morphQuotientPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#96B898"
                    strokeWidth={2}
                    points={toPoly(sampled.morphQuotientPts, toSvgX, toSvgY)}
                  />
                )}
              </>
            )}
          </SvgCoordinatePlane2D>

          <div className="flex flex-wrap gap-3 text-[11px] font-sans text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-0.5 bg-[#D35323] inline-block" /> Total y(x)
            </span>
            {enableForcing && (
              <>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-0.5 border-t border-dashed border-[#8D9FCE] inline-block" />{" "}
                  y_c(x)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-0.5 border-t border-dotted border-[#029091] inline-block" />{" "}
                  y_p(x)
                </span>
              </>
            )}
            {showLimitMorph && (
              <>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-[#96B898] inline-block" />{" "}
                  Difference Quotient (ε={morphEps.toFixed(2)})
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-0.5 border-t border-dashed border-[#FBEAA4] inline-block" />{" "}
                  Limit x·e^(rx)
                </span>
              </>
            )}
          </div>
        </div>

        {/* Phase-Plane Portrait (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="font-medium text-[var(--text-primary)]">
              3. Phase Trajectory <KaTeXMath math="(y, y')" />
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-4.5, 4.5]}
            yRange={[-5.5, 5.5]}
            width={340}
            height={280}
            xLabel="y"
            yLabel="y'"
            xColor="#D35323"
            yColor="#96B898"
            ariaLabel="Phase trajectory (y, y') of the second-order ODE"
            className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {sampled.phasePts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#029091"
                    strokeWidth={2}
                    points={toPoly(sampled.phasePts, toSvgX, toSvgY, [-5.5, 5.5])}
                  />
                )}
                <circle
                  cx={toSvgX(Math.max(-4.4, Math.min(4.4, y0)))}
                  cy={toSvgY(Math.max(-5.4, Math.min(5.4, dy0)))}
                  r={4.8}
                  fill="#D35323"
                  stroke="#FBEAA4"
                  strokeWidth={1.5}
                />
              </>
            )}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Closed-Form Solution & Root Readout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-tabular-mono uppercase text-[#8D9FCE]">
            <Sliders className="w-3.5 h-3.5" /> Active Complementary Solution
          </div>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath math={formulaLatex} block />
          </div>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono uppercase text-[#D35323] block">
            Discriminant &amp; Characteristic Roots Readout
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-tabular-mono text-[var(--text-secondary)]">
            <div>
              Δ = b² - 4ac ={" "}
              <span className="text-[var(--text-primary)] font-semibold">
                {solutionModel.disc.toFixed(3)}
              </span>
            </div>
            <div>
              {solutionModel.regime === "complex"
                ? `r = ${solutionModel.alpha.toFixed(2)} ± ${solutionModel.beta.toFixed(2)}i`
                : solutionModel.regime === "repeated"
                  ? `r₁ = r₂ = ${solutionModel.r1.toFixed(3)}`
                  : `r₁ = ${solutionModel.r1.toFixed(2)}, r₂ = ${solutionModel.r2.toFixed(2)}`}
            </div>
            <div>
              C₁ = <span className="text-[#8D9FCE]">{solutionModel.c1.toFixed(3)}</span>
            </div>
            <div>
              C₂ = <span className="text-[#96B898]">{solutionModel.c2.toFixed(3)}</span>
            </div>
          </div>
          {enableForcing && (
            <p className="text-xs font-tabular-mono text-[#029091]">
              {solutionModel.isResonance
                ? "Undamped Resonance Active! Amplitude grows linearly in x."
                : `Steady-State y_p(x) = ${solutionModel.pCos.toFixed(
                    2
                  )}cos(${forceFreq.toFixed(1)}x) + ${solutionModel.pSin.toFixed(
                    2
                  )}sin(${forceFreq.toFixed(1)}x)`}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
