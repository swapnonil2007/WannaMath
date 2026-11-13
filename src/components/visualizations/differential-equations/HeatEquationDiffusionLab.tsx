"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Play, Pause, RotateCcw, Flame, Activity } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  mathToThreeVec3,
  createParametricSurfaceMesh,
} from "@/components/visualizations/primitives";

type BoundaryType = "dirichlet" | "neumann";

interface HeatPreset {
  id: string;
  label: string;
  expr: string;
  description: string;
  evalInitial: (x: number) => number;
}

const HEAT_PRESETS: HeatPreset[] = [
  {
    id: "square-pulse",
    label: "Square Pulse (Gibbs)",
    expr: "(x >= 0.25 && x <= 0.75) ? 1 : 0",
    description:
      "Discontinuous step profile: Fourier modes decay at rate α(nπ)², rounding sharp corners instantaneously at t = 0⁺.",
    evalInitial: (x) => (x >= 0.25 && x <= 0.75 ? 1.0 : 0.0),
  },
  {
    id: "triangle-pluck",
    label: "Triangle Tent",
    expr: "1 - abs(2 * x - 1)",
    description:
      "Continuous tent with a sharp derivative kink at x = 0.5; the Laplacian u_xx is concentrated at the peak so the tip melts downward first.",
    evalInitial: (x) => Math.max(0, 1 - Math.abs(2 * x - 1)),
  },
  {
    id: "dual-hotspots",
    label: "Dual Hotspots",
    expr: "exp(-80*(x-0.25)^2) + 0.8*exp(-80*(x-0.72)^2)",
    description:
      "Two localized thermal spikes diffuse outward and merge into a single broad bell curve governed by the fundamental mode n = 1.",
    evalInitial: (x) =>
      Math.exp(-80 * (x - 0.25) ** 2) + 0.8 * Math.exp(-80 * (x - 0.72) ** 2),
  },
  {
    id: "multi-harmonic",
    label: "Mode Mixture (n=1,3,7)",
    expr: "0.7*sin(pi*x) + 0.35*sin(3*pi*x) + 0.28*sin(7*pi*x)",
    description:
      "Notice the n = 7 ripple decays 49× faster than the n = 1 fundamental mode (e^{-49 α π² t} vs e^{-α π² t}).",
    evalInitial: (x) =>
      0.7 * Math.sin(Math.PI * x) +
      0.35 * Math.sin(3 * Math.PI * x) +
      0.28 * Math.sin(7 * Math.PI * x),
  },
];

export function HeatEquationDiffusionLab() {
  const [presetId, setPresetId] = useState<string>("square-pulse");
  const [boundary, setBoundary] = useState<BoundaryType>("dirichlet");
  const [customExpr, setCustomExpr] = useState<string>("sin(pi*x) + 0.5*sin(5*pi*x)");
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [alpha, setAlpha] = useState<number>(0.15);
  const [timeT, setTimeT] = useState<number>(0.05);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [numModes, setNumModes] = useState<number>(22);

  const compiledCustom = useMemo(
    () => compileMathExpression(customExpr, ["x"]),
    [customExpr]
  );

  const activePreset = useMemo(
    () => HEAT_PRESETS.find((p) => p.id === presetId) ?? HEAT_PRESETS[0],
    [presetId]
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
        const next = prev + dt * 0.25;
        if (next >= 1.2) {
          setIsPlaying(false);
          return 1.2;
        }
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  const evalInitFn = useMemo(() => {
    if (!isCustom) {
      return activePreset.evalInitial;
    }
    return (x: number) => {
      const val = compiledCustom.evaluate({ x });
      return Number.isFinite(val) ? Math.max(-2.5, Math.min(2.5, val)) : 0;
    };
  }, [isCustom, activePreset, compiledCustom]);

  // Compute Fourier coefficients via 160-point midpoint Riemann sum on [0, 1]
  const fourierCoeffs = useMemo(() => {
    const M = 160;
    const dx = 1 / M;
    const xs = Array.from({ length: M }, (_, k) => (k + 0.5) * dx);
    const fs = xs.map((x) => evalInitFn(x));

    const a0 = 2 * fs.reduce((acc, v) => acc + v, 0) * dx;
    const coeffs: number[] = [];

    for (let n = 1; n <= numModes; n++) {
      let sum = 0;
      for (let k = 0; k < M; k++) {
        const basis =
          boundary === "dirichlet"
            ? Math.sin(n * Math.PI * xs[k])
            : Math.cos(n * Math.PI * xs[k]);
        sum += fs[k] * basis * dx;
      }
      coeffs.push(2 * sum);
    }

    return { a0, coeffs, meanTemp: a0 / 2 };
  }, [evalInitFn, boundary, numModes]);

  const evaluateU = useMemo(() => {
    return (x: number, t: number): number => {
      let u = boundary === "neumann" ? fourierCoeffs.meanTemp : 0;
      const tSafe = Math.max(0, t);
      for (let idx = 0; idx < fourierCoeffs.coeffs.length; idx++) {
        const n = idx + 1;
        const c = fourierCoeffs.coeffs[idx];
        const decay = Math.exp(-alpha * (n * Math.PI) ** 2 * tSafe);
        const basis =
          boundary === "dirichlet"
            ? Math.sin(n * Math.PI * x)
            : Math.cos(n * Math.PI * x);
        u += c * decay * basis;
      }
      return u;
    };
  }, [fourierCoeffs, alpha, boundary]);

  // Precompute 2D profile curves (t = 0 initial vs t = timeT live) and mode spectrum
  const profileData = useMemo(() => {
    const Npts = 100;
    const initCurve: { x: number; y: number }[] = [];
    const liveCurve: { x: number; y: number }[] = [];
    let yMin = -0.2;
    let yMax = 1.25;
    let energy0 = 0;
    let energyT = 0;

    for (let i = 0; i <= Npts; i++) {
      const x = i / Npts;
      const u0 = evalInitFn(x);
      const ut = evaluateU(x, timeT);
      initCurve.push({ x, y: u0 });
      liveCurve.push({ x, y: ut });
      if (u0 < yMin) yMin = u0 - 0.15;
      if (ut < yMin) yMin = ut - 0.15;
      if (u0 > yMax) yMax = u0 + 0.18;
      if (ut > yMax) yMax = ut + 0.18;
      if (i < Npts) {
        energy0 += u0 * u0 * (1 / Npts);
        energyT += ut * ut * (1 / Npts);
      }
    }

    const spectrum = fourierCoeffs.coeffs.slice(0, 12).map((c, idx) => {
      const n = idx + 1;
      const decay = Math.exp(-alpha * (n * Math.PI) ** 2 * timeT);
      return {
        n,
        initialAmp: Math.abs(c),
        decayedAmp: Math.abs(c * decay),
        decayFactor: decay,
      };
    });

    return { initCurve, liveCurve, yMin, yMax, energy0, energyT, spectrum };
  }, [evalInitFn, evaluateU, timeT, alpha, fourierCoeffs]);

  return (
    <section
      aria-label="1D Heat Equation and Diffusive Curvature Smoothing Lab"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#B95869] text-[#B95869] bg-[var(--bg-canvas)]">
              LAB 4.4.1 • HEAT EQUATION &amp; FOURIER DIFFUSION
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              {isCustom ? "Custom Profile" : activePreset.label}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Parabolic Smoothing <KaTeXMath math="u_t = \alpha u_{xx}" /> &amp; High-Frequency{" "}
            <KaTeXMath math="e^{-\alpha (n\pi)^2 t}" /> Decay
          </h2>
        </div>

        {/* Boundary Condition Toggle */}
        <div className="flex border border-[var(--border-strong)] bg-[var(--bg-canvas)]">
          <button
            type="button"
            onClick={() => setBoundary("dirichlet")}
            className={`px-3 py-1.5 text-xs font-tabular-mono transition-colors ${
              boundary === "dirichlet"
                ? "bg-[#B95869] text-[#FFFBE4] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Dirichlet (u=0 Ice Ends)
          </button>
          <button
            type="button"
            onClick={() => setBoundary("neumann")}
            className={`px-3 py-1.5 text-xs font-tabular-mono border-l border-[var(--border-subtle)] transition-colors ${
              boundary === "neumann"
                ? "bg-[#D35323] text-[#1E1F22] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Neumann (u_x=0 Insulated)
          </button>
        </div>
      </div>

      {/* Presets, Custom Input & Physical Controls */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {HEAT_PRESETS.map((p) => {
              const active = !isCustom && p.id === presetId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPresetId(p.id);
                    setIsCustom(false);
                    setTimeT(0);
                    setIsPlaying(false);
                  }}
                  className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                    active
                      ? "border-[#B95869] bg-[#B95869]/15 text-[var(--text-primary)] font-semibold"
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
                setIsPlaying(false);
              }}
              className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                isCustom
                  ? "border-[#D35323] bg-[#D35323]/15 text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              Custom f(x)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (timeT >= 1.18) setTimeT(0);
                setIsPlaying((p) => !p);
              }}
              className="px-3 py-1 text-xs font-tabular-mono border border-[#029091] bg-[#029091]/15 text-[#029091] font-semibold flex items-center gap-1.5"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" aria-hidden="true" /> Play Diffusion
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

        {isCustom && (
          <MathExpressionInput
            label="Initial Rod Temperature Profile on x ∈ [0, 1]:"
            prefixLatex="u(x, 0) ="
            value={customExpr}
            onChange={(val) => setCustomExpr(val)}
            allowedVars={["x"]}
          />
        )}

        {/* Sliders Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <label className="block space-y-1.5">
            <div className="flex justify-between text-xs font-tabular-mono">
              <span className="text-[#D35323]">Evolution Time t</span>
              <span className="text-[var(--text-primary)] font-semibold">
                {timeT.toFixed(3)} s
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1.2}
              step={0.005}
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
              <span className="text-[#B95869]">Thermal Diffusivity α</span>
              <span className="text-[var(--text-primary)] font-semibold">
                {alpha.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.02}
              max={0.5}
              step={0.01}
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="w-full accent-[#B95869]"
            />
          </label>

          <label className="block space-y-1.5">
            <div className="flex justify-between text-xs font-tabular-mono">
              <span className="text-[#8D9FCE]">Fourier Harmonics N</span>
              <span className="text-[var(--text-primary)] font-semibold">{numModes}</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={numModes}
              onChange={(e) => setNumModes(Number(e.target.value))}
              className="w-full accent-[#8D9FCE]"
            />
          </label>
        </div>
      </div>

      {/* Main Split Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: 3D Space-Time Diffusion Sheet */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <ThreeOrbitViewport
            heightClassName="h-[380px] sm:h-[410px]"
            cameraPosition={[2.5, 2.0, 2.7]}
            cameraTarget={[0.5, 0.35, 0.55]}
            titleBadge="3D Space–Time Diffusion Sheet u(x, t) Over Rod x ∈ [0,1] & Time t"
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[#8D9FCE]">Rod x ∈ [0, 1]</span>
                <span className="text-[#029091]">Time t ∈ [0, 1.2]</span>
                <span className="text-[#FBEAA4] font-semibold">
                  Active Iso-Slice: t = {timeT.toFixed(3)} s
                </span>
              </div>
            }
            sceneDeps={[evaluateU, timeT]}
            onBuildScene={(group) => {
              // Map math box (x ∈ [0,1], t ∈ [0, 1.2], u) -> scaled nicely in Three viewport
              // Shift x by -0.5 and t by -0.6 or keep positive [0..1] x [0..1.2]
              const surf = createParametricSurfaceMesh(
                (x, t) => [x * 2 - 0.5, t * 1.5 - 0.3, evaluateU(x, t) * 1.2],
                [0, 1],
                [0, 1.2],
                42,
                32,
                {
                  color: 0x029091,
                  opacity: 0.62,
                  wireframeColor: 0x8d9fce,
                  wireframeOpacity: 0.16,
                  showWireframe: true,
                }
              );
              group.add(surf);

              // Highlighted live slice ribbon at t = timeT
              const slicePts: THREE.Vector3[] = [];
              for (let i = 0; i <= 80; i++) {
                const x = i / 80;
                const u = evaluateU(x, timeT);
                slicePts.push(
                  mathToThreeVec3(x * 2 - 0.5, timeT * 1.5 - 0.3, u * 1.2 + 0.02)
                );
              }
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(slicePts),
                  new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                )
              );

              // t = 0 Initial condition edge
              const initPts: THREE.Vector3[] = [];
              for (let i = 0; i <= 80; i++) {
                const x = i / 80;
                const u = evaluateU(x, 0);
                initPts.push(mathToThreeVec3(x * 2 - 0.5, -0.3, u * 1.2 + 0.02));
              }
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(initPts),
                  new THREE.LineBasicMaterial({ color: 0xd35323 })
                )
              );
            }}
          />

          {/* Formula Banner */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2 overflow-x-auto">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#B95869] block">
              {boundary === "dirichlet"
                ? "Dirichlet Fixed-Zero Solution (Fourier Sine Series)"
                : "Insulated Neumann Solution (Conserves Total Thermal Energy / Mean Temp)"}
            </span>
            <KaTeXMath
              math={
                boundary === "dirichlet"
                  ? "u(x,t) = \\sum_{n=1}^{N} b_n\\,e^{-\\alpha(n\\pi)^2 t}\\sin(n\\pi x) \\;\\xrightarrow{t\\to\\infty}\\; 0"
                  : `u(x,t) = \\frac{a_0}{2} + \\sum_{n=1}^{N} a_n\\,e^{-\\alpha(n\\pi)^2 t}\\cos(n\\pi x) \\;\\xrightarrow{t\\to\\infty}\\; ${fourierCoeffs.meanTemp.toFixed(
                      3
                    )}`
              }
              block
            />
          </div>
        </div>

        {/* Right: 2D Spatial Profile + Mode Spectrum */}
        <div className="lg:col-span-5 p-5 space-y-5 bg-[var(--bg-panel)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#D35323]" aria-hidden="true" />
                Live Rod Profile u(x, t) vs Initial u(x, 0)
              </span>
              <span className="text-[11px] font-tabular-mono text-[#FBEAA4]">
                L² Energy: {((profileData.energyT / Math.max(1e-6, profileData.energy0)) * 100).toFixed(1)}%
              </span>
            </div>

            <SvgCoordinatePlane2D
              xRange={[0, 1]}
              yRange={[profileData.yMin, profileData.yMax]}
              xLabel="x (rod)"
              yLabel="Temp u"
              height={240}
              ariaLabel="2D rod temperature profile at current time versus initial condition"
            >
              {({ toSvgX, toSvgY }) => {
                const initPath = profileData.initCurve
                  .map(
                    (p, idx) =>
                      `${idx === 0 ? "M" : "L"}${toSvgX(p.x).toFixed(1)},${toSvgY(p.y).toFixed(1)}`
                  )
                  .join(" ");
                const livePath = profileData.liveCurve
                  .map(
                    (p, idx) =>
                      `${idx === 0 ? "M" : "L"}${toSvgX(p.x).toFixed(1)},${toSvgY(p.y).toFixed(1)}`
                  )
                  .join(" ");

                const steadyY =
                  boundary === "neumann" ? fourierCoeffs.meanTemp : 0;

                return (
                  <g>
                    {/* Steady-state equilibrium line */}
                    <line
                      x1={toSvgX(0)}
                      y1={toSvgY(steadyY)}
                      x2={toSvgX(1)}
                      y2={toSvgY(steadyY)}
                      stroke="#AAA36D"
                      strokeDasharray="4 4"
                      strokeWidth={1.2}
                    />
                    {/* Dashed initial condition u(x,0) */}
                    <path
                      d={initPath}
                      fill="none"
                      stroke="#8D9FCE"
                      strokeOpacity={0.6}
                      strokeDasharray="4 3"
                      strokeWidth={1.5}
                    />
                    {/* Active diffused curve u(x,t) */}
                    <path
                      d={livePath}
                      fill="none"
                      stroke="#D35323"
                      strokeWidth={2.6}
                    />
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>

            {/* Exponential Mode Damping Spectrum */}
            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-tabular-mono">
                <span className="text-[#8D9FCE] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                  Fourier Harmonic Spectrum (n = 1..12)
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  Gray: t=0 • Orange: Live Amplitude
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1.5 items-end h-24 pt-2 border-b border-[var(--border-subtle)]">
                {profileData.spectrum.map((item) => {
                  const maxAmp = Math.max(
                    0.5,
                    ...profileData.spectrum.map((s) => s.initialAmp)
                  );
                  const hInit = Math.min(100, (item.initialAmp / maxAmp) * 100);
                  const hLive = Math.min(100, (item.decayedAmp / maxAmp) * 100);
                  return (
                    <div
                      key={item.n}
                      className="relative h-full flex flex-col justify-end items-center"
                      title={`Mode n=${item.n}: initial |c|=${item.initialAmp.toFixed(3)}, live=${item.decayedAmp.toFixed(3)}`}
                    >
                      <div
                        className="w-full bg-[#35383F] relative flex items-end"
                        style={{ height: `${hInit}%` }}
                      >
                        <div
                          className="w-full bg-[#D35323]"
                          style={{ height: `${hInit > 0 ? (hLive / hInit) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-12 gap-1.5 text-center text-[10px] font-tabular-mono text-[var(--text-muted)]">
                {profileData.spectrum.map((item) => (
                  <span key={item.n}>n{item.n}</span>
                ))}
              </div>
            </div>
          </div>

          <p className="font-math-serif text-xs text-[var(--text-secondary)] leading-relaxed p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            {isCustom
              ? "Higher spatial harmonics (n) have larger curvature |u_xx| ∝ n², causing them to vanish e^{-(nπ)² α t} rapidly while the smoothest fundamental mode dominates long-term temperature."
              : activePreset.description}
          </p>
        </div>
      </div>
    </section>
  );
}
