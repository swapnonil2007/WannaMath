"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Play, Pause, RotateCcw, Waves, Grid } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  mathToThreeVec3,
  createParametricSurfaceMesh,
  extractLevelCurveSegments,
} from "@/components/visualizations/primitives";

type WaveTab = "1d-string" | "2d-membrane";

interface StringPreset {
  id: string;
  label: string;
  expr: string;
  evalBase: (x: number) => number;
  note: string;
}

interface MembranePreset {
  id: string;
  label: string;
  m1: number;
  n1: number;
  m2: number;
  n2: number;
  beta: number;
  note: string;
}

const STRING_PRESETS: StringPreset[] = [
  {
    id: "gaussian-pulse",
    label: "Gaussian Pluck",
    expr: "exp(-90 * (x - 0.5)^2)",
    evalBase: (x) => Math.exp(-90 * (x - 0.5) ** 2),
    note: "A central Gaussian wave splits at t = 0⁺ into two half-height pulses moving left & right at speed c, reflecting upside-down at pinned ends x = 0, 1.",
  },
  {
    id: "twin-pulses",
    label: "Opposite Pulses",
    expr: "0.9*exp(-120*(x-0.28)^2) - 0.8*exp(-120*(x-0.72)^2)",
    evalBase: (x) =>
      0.9 * Math.exp(-120 * (x - 0.28) ** 2) -
      0.8 * Math.exp(-120 * (x - 0.72) ** 2),
    note: "Opposite pulses pass cleanly through one another by linearity—unlike heat diffusion, pure waves conserve energy with zero amplitude decay.",
  },
  {
    id: "triangle-pluck",
    label: "Guitar Triangle",
    expr: "(x < 0.35) ? (x/0.35) : ((1-x)/0.65)",
    evalBase: (x) => (x < 0.35 ? x / 0.35 : (1 - x) / 0.65),
    note: "Plucking at x = 0.35 sends flat linear wave fronts traveling outward between kinks—remember why a plucked guitar sounds bright and harmonic-rich!",
  },
  {
    id: "standing-n3",
    label: "Standing Mode (n=3)",
    expr: "0.9 * sin(3 * pi * x)",
    evalBase: (x) => 0.9 * Math.sin(3 * Math.PI * x),
    note: "A pure spatial eigenmode u(x,t) = sin(3πx)cos(3πct) preserves stationary interior nodes at x = 1/3 and x = 2/3 for all time.",
  },
];

const MEMBRANE_PRESETS: MembranePreset[] = [
  {
    id: "mode-1-1",
    label: "Fundamental (1,1)",
    m1: 1,
    n1: 1,
    m2: 1,
    n2: 1,
    beta: 0,
    note: "Lowest vibrating drumhead frequency ω₁₁ = cπ√2: every interior point oscillates in phase with zero interior nodal lines.",
  },
  {
    id: "mode-2-1",
    label: "Dipole (2,1)",
    m1: 2,
    n1: 1,
    m2: 1,
    n2: 2,
    beta: 0,
    note: "One vertical nodal line x = 0.5 divides the left and right halves vibrating 180° out of phase.",
  },
  {
    id: "chladni-diag",
    label: "Chladni Diagonal (1,2)+(2,1)",
    m1: 1,
    n1: 2,
    m2: 2,
    n2: 1,
    beta: 1,
    note: "Because ω₁₂ = ω₂₁ = cπ√5 on a square drum, sin(πx)sin(2πy) + sin(2πx)sin(πy) shares a single frequency and forms a tilted diagonal Chladni node x + y = 1!",
  },
  {
    id: "chladni-loop",
    label: "Chladni Curve (1,3)−(3,1)",
    m1: 1,
    n1: 3,
    m2: 3,
    n2: 1,
    beta: -1,
    note: "Equal-frequency superposition of (1,3) and (3,1) cancels along diagonal & hyperbolic nodal curves where sand grains settle undisturbed.",
  },
];

/**
 * Evaluates odd 2-periodic extension of base function defined on [0, 1] for pinned Dirichlet boundaries.
 */
function evalOddPeriodic(base: (u: number) => number, s: number): number {
  let r = s % 2;
  if (r < 0) r += 2;
  if (r <= 1) {
    return base(r);
  }
  return -base(2 - r);
}

export function WaveEquationModesLab() {
  const [tab, setTab] = useState<WaveTab>("1d-string");

  // 1D String state
  const [strPresetId, setStrPresetId] = useState<string>("gaussian-pulse");
  const [customExpr, setCustomExpr] = useState<string>("exp(-75*(x-0.35)^2)");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [waveSpeed, setWaveSpeed] = useState<number>(1.0);
  const [timeT, setTimeT] = useState<number>(0.18);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showComponents, setShowComponents] = useState<boolean>(true);

  // 2D Membrane state
  const [memPresetId, setMemPresetId] = useState<string>("chladni-diag");
  const [m1, setM1] = useState<number>(1);
  const [n1, setN1] = useState<number>(2);
  const [m2, setM2] = useState<number>(2);
  const [n2, setN2] = useState<number>(1);
  const [beta, setBeta] = useState<number>(1.0);

  const compiledCustom = useMemo(
    () => compileMathExpression(customExpr, ["x"]),
    [customExpr]
  );

  const activeStringPreset = useMemo(
    () => STRING_PRESETS.find((p) => p.id === strPresetId) ?? STRING_PRESETS[0],
    [strPresetId]
  );

  const activeMembranePreset = useMemo(
    () => MEMBRANE_PRESETS.find((p) => p.id === memPresetId) ?? MEMBRANE_PRESETS[0],
    [memPresetId]
  );

  // Play animation loop
  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;
    let lastTs = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      setTimeT((prev) => {
        const next = prev + dt * 0.45;
        return next > 2.0 ? next - 2.0 : next;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  const baseFn = useMemo(() => {
    if (!isCustom) return activeStringPreset.evalBase;
    return (x: number) => {
      const clamped = Math.max(0, Math.min(1, x));
      // taper smoothly at pinned endpoints so odd extension stays continuous
      const v = compiledCustom.evaluate({ x: clamped });
      return Number.isFinite(v) ? Math.max(-2.0, Math.min(2.0, v)) : 0;
    };
  }, [isCustom, activeStringPreset, compiledCustom]);

  // 1D D'Alembert sampling
  const stringData = useMemo(() => {
    const N = 120;
    const totalPts: { x: number; y: number }[] = [];
    const rightPts: { x: number; y: number }[] = [];
    const leftPts: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const x = i / N;
      const rightWave = 0.5 * evalOddPeriodic(baseFn, x - waveSpeed * timeT);
      const leftWave = 0.5 * evalOddPeriodic(baseFn, x + waveSpeed * timeT);
      rightPts.push({ x, y: rightWave });
      leftPts.push({ x, y: leftWave });
      totalPts.push({ x, y: rightWave + leftWave });
    }
    return { totalPts, rightPts, leftPts };
  }, [baseFn, waveSpeed, timeT]);

  // 2D Membrane spatial evaluator & Chladni nodal curves
  const membraneData = useMemo(() => {
    const omega1 = waveSpeed * Math.PI * Math.hypot(m1, n1);
    const omega2 = waveSpeed * Math.PI * Math.hypot(m2, n2);
    const ampNorm = 1 + Math.abs(beta);

    const evalSpatialTime = (x: number, y: number, t: number) => {
      const mode1 =
        Math.sin(m1 * Math.PI * x) *
        Math.sin(n1 * Math.PI * y) *
        Math.cos(omega1 * t);
      const mode2 =
        beta *
        Math.sin(m2 * Math.PI * x) *
        Math.sin(n2 * Math.PI * y) *
        Math.cos(omega2 * t);
      return (mode1 + mode2) / Math.max(1, ampNorm);
    };

    // Extract static spatial nodal lines if equal-frequency or instantaneous u=0 nodal curves
    const nodalSegs = extractLevelCurveSegments(
      (x, y) => evalSpatialTime(x, y, timeT),
      0.01,
      0.99,
      0.01,
      0.99,
      0,
      36,
      36
    );

    // Coarse sign heatmap cells (24x24)
    const cells: { x: number; y: number; w: number; h: number; val: number }[] = [];
    const GN = 24;
    const step = 1 / GN;
    for (let i = 0; i < GN; i++) {
      for (let j = 0; j < GN; j++) {
        const cx = (i + 0.5) * step;
        const cy = (j + 0.5) * step;
        const v = evalSpatialTime(cx, cy, timeT);
        cells.push({ x: i * step, y: j * step, w: step, h: step, val: v });
      }
    }

    return { omega1, omega2, evalSpatialTime, nodalSegs, cells };
  }, [m1, n1, m2, n2, beta, waveSpeed, timeT]);

  const selectMembranePreset = (p: MembranePreset) => {
    setMemPresetId(p.id);
    setM1(p.m1);
    setN1(p.n1);
    setM2(p.m2);
    setN2(p.n2);
    setBeta(p.beta);
  };

  return (
    <section
      aria-label="Wave Equation Normal Modes and D'Alembert Traveling Pulses Lab"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#029091] text-[#029091] bg-[var(--bg-canvas)]">
              LAB 4.4.2 • WAVE EQUATION, D&apos;ALEMBERT &amp; CHLADNI MODES
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              {tab === "1d-string"
                ? isCustom
                  ? "Custom 1D Wave"
                  : activeStringPreset.label
                : activeMembranePreset.label}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Hyperbolic Propagation <KaTeXMath math="u_{tt} = c^2 \nabla^2 u" />, Standing Eigenmodes &amp; Nodal Curves
          </h2>
        </div>

        {/* Tab Toggle */}
        <div className="flex border border-[var(--border-strong)] bg-[var(--bg-canvas)]">
          <button
            type="button"
            onClick={() => setTab("1d-string")}
            className={`px-3 py-1.5 text-xs font-tabular-mono transition-colors ${
              tab === "1d-string"
                ? "bg-[#029091] text-[#1E1F22] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            1D String (D&apos;Alembert)
          </button>
          <button
            type="button"
            onClick={() => setTab("2d-membrane")}
            className={`px-3 py-1.5 text-xs font-tabular-mono border-l border-[var(--border-subtle)] transition-colors ${
              tab === "2d-membrane"
                ? "bg-[#D35323] text-[#1E1F22] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            2D Drumhead (Chladni)
          </button>
        </div>
      </div>

      {/* Controls & Presets */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {tab === "1d-string" ? (
              <>
                {STRING_PRESETS.map((p) => {
                  const active = !isCustom && p.id === strPresetId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setStrPresetId(p.id);
                        setIsCustom(false);
                        setTimeT(0);
                      }}
                      className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                        active
                          ? "border-[#029091] bg-[#029091]/15 text-[var(--text-primary)] font-semibold"
                          : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setIsCustom(true);
                    setTimeT(0);
                  }}
                  className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                    isCustom
                      ? "border-[#D35323] bg-[#D35323]/15 text-[var(--text-primary)] font-semibold"
                      : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  Custom f(x)
                </button>
              </>
            ) : (
              MEMBRANE_PRESETS.map((p) => {
                const active =
                  p.m1 === m1 && p.n1 === n1 && p.m2 === m2 && p.n2 === n2 && Math.abs(p.beta - beta) < 0.05;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectMembranePreset(p)}
                    className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                      active
                        ? "border-[#D35323] bg-[#D35323]/15 text-[var(--text-primary)] font-semibold"
                        : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-2">
            {tab === "1d-string" && (
              <label className="flex items-center gap-1.5 text-xs font-tabular-mono text-[var(--text-secondary)] cursor-pointer px-2 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <input
                  type="checkbox"
                  checked={showComponents}
                  onChange={(e) => setShowComponents(e.target.checked)}
                  className="accent-[#8D9FCE]"
                />
                <span>Show f(x∓ct)/2</span>
              </label>
            )}
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="px-3 py-1 text-xs font-tabular-mono border border-[#029091] bg-[#029091]/15 text-[#029091] font-semibold flex items-center gap-1.5"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" aria-hidden="true" /> Animate Wave
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setTimeT(0);
              }}
              className="px-2.5 py-1 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" /> t = 0
            </button>
          </div>
        </div>

        {tab === "1d-string" && isCustom && (
          <MathExpressionInput
            label="Initial String Displacement f(x) on [0, 1] (zero initial velocity u_t(x,0) = 0):"
            prefixLatex="u(x, 0) ="
            value={customExpr}
            onChange={(val) => setCustomExpr(val)}
            allowedVars={["x"]}
          />
        )}

        {/* Sliders Row */}
        {tab === "1d-string" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <label className="block space-y-1.5">
              <div className="flex justify-between text-xs font-tabular-mono">
                <span className="text-[#D35323]">Time t (Period = {(2 / waveSpeed).toFixed(2)}s)</span>
                <span className="text-[var(--text-primary)] font-semibold">
                  {timeT.toFixed(3)} s
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={2.0}
                step={0.01}
                value={timeT}
                onChange={(e) => {
                  setIsPlaying(false);
                  setTimeT(Number(e.target.value));
                }}
                className="w-full accent-[#D35323]"
              />
            </label>

            <label className="block space-y-1.5">
              <div className="flex justify-between text-xs font-tabular-mono">
                <span className="text-[#029091]">Wave Propagation Speed c</span>
                <span className="text-[var(--text-primary)] font-semibold">
                  {waveSpeed.toFixed(2)} m/s
                </span>
              </div>
              <input
                type="range"
                min={0.4}
                max={2.2}
                step={0.05}
                value={waveSpeed}
                onChange={(e) => setWaveSpeed(Number(e.target.value))}
                className="w-full accent-[#029091]"
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            <label className="block space-y-1">
              <span className="text-[11px] font-tabular-mono text-[#8D9FCE] block">
                Mode (m₁, n₁): m₁ = {m1}
              </span>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={m1}
                onChange={(e) => setM1(Number(e.target.value))}
                className="w-full accent-[#8D9FCE]"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-tabular-mono text-[#96B898] block">
                n₁ = {n1}
              </span>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={n1}
                onChange={(e) => setN1(Number(e.target.value))}
                className="w-full accent-[#96B898]"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-tabular-mono text-[#D35323] block">
                Mix Weight β = {beta.toFixed(2)}
              </span>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.05}
                value={beta}
                onChange={(e) => setBeta(Number(e.target.value))}
                className="w-full accent-[#D35323]"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-tabular-mono text-[#FBEAA4] block">
                Mode 2 (m₂={m2}, n₂={n2})
              </span>
              <div className="flex gap-1">
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={m2}
                  onChange={(e) => setM2(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
                  className="w-1/2 px-1.5 py-1 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)]"
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={n2}
                  onChange={(e) => setN2(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
                  className="w-1/2 px-1.5 py-1 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)]"
                />
              </div>
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-tabular-mono text-[#029091] block">
                Time t = {timeT.toFixed(2)} s
              </span>
              <input
                type="range"
                min={0}
                max={2.0}
                step={0.01}
                value={timeT}
                onChange={(e) => {
                  setIsPlaying(false);
                  setTimeT(Number(e.target.value));
                }}
                className="w-full accent-[#029091]"
              />
            </label>
          </div>
        )}
      </div>

      {/* Main Split Content */}
      {tab === "1d-string" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: 2D Instantaneous Wave & Traveling Components */}
          <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-[#029091]" aria-hidden="true" />
                Live String Displacement &amp; Characteristic Pulses
              </span>
              <span className="text-[11px] font-tabular-mono text-[#D35323]">
                Pinned: u(0,t) = u(1,t) = 0
              </span>
            </div>

            <SvgCoordinatePlane2D
              xRange={[0, 1]}
              yRange={[-1.2, 1.2]}
              xLabel="x (string)"
              yLabel="u(x,t)"
              height={290}
              ariaLabel="1D vibrating string displacement and D'Alembert traveling waves"
            >
              {({ toSvgX, toSvgY }) => {
                const toPath = (arr: { x: number; y: number }[]) =>
                  arr
                    .map(
                      (p, idx) =>
                        `${idx === 0 ? "M" : "L"}${toSvgX(p.x).toFixed(1)},${toSvgY(p.y).toFixed(1)}`
                    )
                    .join(" ");

                return (
                  <g>
                    {showComponents && (
                      <>
                        <path
                          d={toPath(stringData.rightPts)}
                          fill="none"
                          stroke="#8D9FCE"
                          strokeWidth={1.6}
                          strokeDasharray="4 3"
                          strokeOpacity={0.85}
                        />
                        <path
                          d={toPath(stringData.leftPts)}
                          fill="none"
                          stroke="#96B898"
                          strokeWidth={1.6}
                          strokeDasharray="4 3"
                          strokeOpacity={0.85}
                        />
                      </>
                    )}
                    <path
                      d={toPath(stringData.totalPts)}
                      fill="none"
                      stroke="#D35323"
                      strokeWidth={2.8}
                    />
                    <circle cx={toSvgX(0)} cy={toSvgY(0)} r={4} fill="#FBEAA4" />
                    <circle cx={toSvgX(1)} cy={toSvgY(0)} r={4} fill="#FBEAA4" />
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>

            <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2 overflow-x-auto text-xs">
              <KaTeXMath
                math="u(x,t) = \frac{1}{2}\Big[\color{#8D9FCE}{\tilde{f}(x - ct)} + \color{#96B898}{\tilde{f}(x + ct)}\Big] \quad (\tilde{f} = \text{odd 2-periodic extension})"
                block
              />
              <p className="font-math-serif text-[var(--text-secondary)]">
                {isCustom ? "Custom string initial shape." : activeStringPreset.note}
              </p>
            </div>
          </div>

          {/* Right: 3D Space-Time Wave Surface */}
          <div className="lg:col-span-6 p-5 space-y-4 bg-[var(--bg-panel)]">
            <ThreeOrbitViewport
              heightClassName="h-[360px]"
              cameraPosition={[2.5, 1.9, 2.7]}
              cameraTarget={[0.5, 0.0, 0.55]}
              titleBadge="3D Space–Time Wave Sheet u(x, t) Showing Characteristic Diamonds"
              footerSlot={
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                  <span className="text-[#8D9FCE]">Right Pulse: x − ct</span>
                  <span className="text-[#96B898]">Left Pulse: x + ct</span>
                  <span className="text-[#FBEAA4] font-semibold">t = {timeT.toFixed(3)} s</span>
                </div>
              }
              sceneDeps={[baseFn, waveSpeed, timeT]}
              onBuildScene={(group) => {
                const surf = createParametricSurfaceMesh(
                  (x, t) => {
                    const u =
                      0.5 *
                      (evalOddPeriodic(baseFn, x - waveSpeed * t) +
                        evalOddPeriodic(baseFn, x + waveSpeed * t));
                    return [x * 2 - 0.5, t * 1.1 - 0.5, u * 0.9];
                  },
                  [0, 1],
                  [0, 1.6],
                  46,
                  40,
                  {
                    color: 0x029091,
                    opacity: 0.56,
                    wireframeColor: 0x8d9fce,
                    wireframeOpacity: 0.16,
                    showWireframe: true,
                  }
                );
                group.add(surf);

                const clampedT = Math.min(1.6, timeT);
                const slicePts: THREE.Vector3[] = [];
                for (let i = 0; i <= 80; i++) {
                  const x = i / 80;
                  const u =
                    0.5 *
                    (evalOddPeriodic(baseFn, x - waveSpeed * clampedT) +
                      evalOddPeriodic(baseFn, x + waveSpeed * clampedT));
                  slicePts.push(
                    mathToThreeVec3(x * 2 - 0.5, clampedT * 1.1 - 0.5, u * 0.9 + 0.02)
                  );
                }
                group.add(
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints(slicePts),
                    new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                  )
                );
              }}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: 3D Drumhead Oscillating Surface */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
            <ThreeOrbitViewport
              heightClassName="h-[390px] sm:h-[420px]"
              cameraPosition={[2.3, 2.0, 2.3]}
              cameraTarget={[0.5, 0.0, 0.5]}
              titleBadge={`3D Rectangular Membrane u(x,y,t) • Modes (${m1},${n1}) + β(${m2},${n2})`}
              footerSlot={
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                  <span className="text-[#8D9FCE]">
                    ω₁ = {membraneData.omega1.toFixed(2)} rad/s
                  </span>
                  <span className="text-[#FBEAA4]">
                    Chladni Nodal Curves (u = 0)
                  </span>
                  <span className="text-[#D35323] font-semibold">
                    t = {timeT.toFixed(3)} s
                  </span>
                </div>
              }
              sceneDeps={[membraneData, timeT]}
              onBuildScene={(group) => {
                // Oscillating surface scaled into centered [0,2]x[0,2] frame
                const surf = createParametricSurfaceMesh(
                  (x, y) => [
                    x * 2 - 0.5,
                    y * 2 - 0.5,
                    membraneData.evalSpatialTime(x, y, timeT) * 0.85,
                  ],
                  [0, 1],
                  [0, 1],
                  40,
                  40,
                  {
                    color: 0x029091,
                    opacity: 0.64,
                    wireframeColor: 0x8d9fce,
                    wireframeOpacity: 0.16,
                    showWireframe: true,
                  }
                );
                group.add(surf);

                // Pinned square boundary rim at z = 0
                const rimPts = [
                  mathToThreeVec3(-0.5, -0.5, 0),
                  mathToThreeVec3(1.5, -0.5, 0),
                  mathToThreeVec3(1.5, 1.5, 0),
                  mathToThreeVec3(-0.5, 1.5, 0),
                  mathToThreeVec3(-0.5, -0.5, 0),
                ];
                group.add(
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints(rimPts),
                    new THREE.LineBasicMaterial({ color: 0xaaa36d })
                  )
                );

                // Chladni Nodal Lines on z = 0.015
                const nPts: THREE.Vector3[] = [];
                for (const s of membraneData.nodalSegs) {
                  nPts.push(
                    mathToThreeVec3(s.x1 * 2 - 0.5, s.y1 * 2 - 0.5, 0.015),
                    mathToThreeVec3(s.x2 * 2 - 0.5, s.y2 * 2 - 0.5, 0.015)
                  );
                }
                if (nPts.length > 0) {
                  group.add(
                    new THREE.LineSegments(
                      new THREE.BufferGeometry().setFromPoints(nPts),
                      new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                    )
                  );
                }
              }}
            />

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto text-xs space-y-1">
              <KaTeXMath
                math={`u(x,y,t) = \\sin(${m1}\\pi x)\\sin(${n1}\\pi y)\\cos(\\omega_{${m1}${n1}} t) + ${beta.toFixed(
                  2
                )}\\sin(${m2}\\pi x)\\sin(${n2}\\pi y)\\cos(\\omega_{${m2}${n2}} t)`}
                block
              />
            </div>
          </div>

          {/* Right: 2D Chladni Nodal Pattern Diagram */}
          <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-[#FBEAA4]" aria-hidden="true" />
                  Top-Down Chladni Sand Pattern (u = 0 Nodes)
                </span>
                <span className="text-[11px] font-tabular-mono text-[var(--text-muted)]">
                  Orange: + Crest • Blue: − Trough
                </span>
              </div>

              <SvgCoordinatePlane2D
                xRange={[0, 1]}
                yRange={[0, 1]}
                xLabel="x"
                yLabel="y"
                height={295}
                ariaLabel="2D Chladni nodal lines and sign lobes on rectangular drumhead"
              >
                {({ toSvgX, toSvgY }) => (
                  <g>
                    {membraneData.cells.map((c, idx) => {
                      const fill = c.val >= 0 ? "#D35323" : "#8D9FCE";
                      const op = Math.min(0.62, Math.abs(c.val) * 0.72);
                      const sx = toSvgX(c.x);
                      const syTop = toSvgY(c.y + c.h);
                      const sw = toSvgX(c.x + c.w) - sx;
                      const sh = toSvgY(c.y) - syTop;
                      return (
                        <rect
                          key={idx}
                          x={sx}
                          y={syTop}
                          width={Math.max(0.5, sw)}
                          height={Math.max(0.5, sh)}
                          fill={fill}
                          fillOpacity={op}
                        />
                      );
                    })}
                    {membraneData.nodalSegs.map((s, k) => (
                      <line
                        key={`nod-${k}`}
                        x1={toSvgX(s.x1)}
                        y1={toSvgY(s.y1)}
                        x2={toSvgX(s.x2)}
                        y2={toSvgY(s.y2)}
                        stroke="#FBEAA4"
                        strokeWidth={2.3}
                      />
                    ))}
                  </g>
                )}
              </SvgCoordinatePlane2D>
            </div>

            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#FBEAA4] block">
                Eigenfrequency Degeneracy &amp; Nodal Geometry
              </span>
              <p className="font-math-serif text-xs text-[var(--text-secondary)] leading-relaxed">
                {activeMembranePreset.note} Wherever <KaTeXMath math="u(x,y,t)=0" /> permanently,
                sand vibrated on a physical plate comes to rest along those golden nodal curves.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
