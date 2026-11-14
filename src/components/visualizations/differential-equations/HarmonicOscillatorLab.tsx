"use client";

import React, { useState, useMemo } from "react";
import { Activity, Compass, Waves } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

interface OscillatorPreset {
  id: string;
  name: string;
  badge: string;
  m: number;
  c: number;
  k: number;
  x0: number;
  v0: number;
  note: string;
}

const OSC_PRESETS: OscillatorPreset[] = [
  {
    id: "undamped",
    name: "Pure Harmonic Center (ζ = 0)",
    badge: "Marginal Stability",
    m: 1.0,
    c: 0.0,
    k: 4.0,
    x0: 1.4,
    v0: 0.0,
    note: "Zero friction keeps characteristic roots s = ±iω_n pinned on the imaginary axis; energy cycles eternally around a closed phase ellipse.",
  },
  {
    id: "underdamped",
    name: "Underdamped Ringing (ζ = 0.22)",
    badge: "Complex Conjugate Roots",
    m: 1.0,
    c: 0.88,
    k: 4.0,
    x0: 1.4,
    v0: 0.8,
    note: "Oscillates at pseudo-frequency ω_d = ω_n√(1 - ζ²) while its amplitude decays inside ±A exp(-ζω_n t), spiraling inward in phase space.",
  },
  {
    id: "critical",
    name: "Critically Damped Door Closer (ζ = 1.00)",
    badge: "Double Real Root",
    m: 1.0,
    c: 4.0,
    k: 4.0,
    x0: 1.4,
    v0: 0.0,
    note: "Two roots collide at s = -ω_n, introducing the secular mode t·exp(-ω_n t) to return to equilibrium in minimum time without overshoot.",
  },
  {
    id: "overdamped",
    name: "Overdamped Viscous Dashpot (ζ = 1.60)",
    badge: "Two Negative Real Roots",
    m: 1.0,
    c: 6.4,
    k: 4.0,
    x0: 1.4,
    v0: 0.0,
    note: "Split negative real roots produce pure exponential decay; the slow root s₁ near zero bottlenecks settling time.",
  },
];

export function HarmonicOscillatorLab() {
  const [presetId, setPresetId] = useState<string>("underdamped");
  const [mass, setMass] = useState<number>(OSC_PRESETS[1].m);
  const [dampingC, setDampingC] = useState<number>(OSC_PRESETS[1].c);
  const [stiffnessK, setStiffnessK] = useState<number>(OSC_PRESETS[1].k);
  const [x0, setX0] = useState<number>(OSC_PRESETS[1].x0);
  const [v0, setV0] = useState<number>(OSC_PRESETS[1].v0);
  const [probeT, setProbeT] = useState<number>(1.8);

  const activePreset = useMemo(
    () => OSC_PRESETS.find((p) => p.id === presetId) ?? OSC_PRESETS[1],
    [presetId]
  );

  const handleSelectPreset = (p: OscillatorPreset) => {
    setPresetId(p.id);
    setMass(p.m);
    setDampingC(p.c);
    setStiffnessK(p.k);
    setX0(p.x0);
    setV0(p.v0);
  };

  const sim = useMemo(() => {
    const wn = Math.sqrt(stiffnessK / mass);
    const zeta = dampingC / (2 * Math.sqrt(mass * stiffnessK));
    const sigma = zeta * wn;

    let regime: "Undamped" | "Underdamped" | "Critically Damped" | "Overdamped";
    if (zeta < 1e-3) regime = "Undamped";
    else if (zeta < 0.985) regime = "Underdamped";
    else if (zeta <= 1.015) regime = "Critically Damped";
    else regime = "Overdamped";

    // Characteristic roots in complex s-plane
    let s1: [number, number];
    let s2: [number, number];
    let wd = 0;

    if (zeta < 0.999) {
      wd = wn * Math.sqrt(Math.max(0, 1 - zeta * zeta));
      s1 = [-sigma, wd];
      s2 = [-sigma, -wd];
    } else {
      const rootOffset = wn * Math.sqrt(Math.max(0, zeta * zeta - 1));
      s1 = [-sigma + rootOffset, 0];
      s2 = [-sigma - rootOffset, 0];
    }

    // Analytical x(t) and v(t) = dx/dt
    const evalState = (t: number): { x: number; v: number; env: number } => {
      if (Math.abs(zeta - 1) <= 0.015) {
        // Critically damped (exact double root at -wn)
        const c1 = x0;
        const c2 = v0 + wn * x0;
        const e = Math.exp(-wn * t);
        const x = (c1 + c2 * t) * e;
        const v = (c2 - wn * (c1 + c2 * t)) * e;
        return { x, v, env: Math.abs(c1 + c2 * t) * e };
      } else if (zeta < 1) {
        const A = x0;
        const B = (v0 + sigma * x0) / Math.max(wd, 1e-6);
        const envAmp = Math.hypot(A, B);
        const e = Math.exp(-sigma * t);
        const cosT = Math.cos(wd * t);
        const sinT = Math.sin(wd * t);
        const x = e * (A * cosT + B * sinT);
        const v =
          e * ((-sigma * A + wd * B) * cosT + (-sigma * B - wd * A) * sinT);
        return { x, v, env: envAmp * e };
      } else {
        // Overdamped
        const r1 = s1[0];
        const r2 = s2[0];
        const denom = Math.max(1e-5, r1 - r2);
        const c1 = (v0 - r2 * x0) / denom;
        const c2 = (r1 * x0 - v0) / denom;
        const e1 = Math.exp(r1 * t);
        const e2 = Math.exp(r2 * t);
        const x = c1 * e1 + c2 * e2;
        const v = c1 * r1 * e1 + c2 * r2 * e2;
        return { x, v, env: Math.abs(x) };
      }
    };

    const tMax = 10;
    const steps = 220;
    const wavePts: { t: number; x: number; v: number; env: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * tMax;
      wavePts.push({ t, ...evalState(t) });
    }

    const probeState = evalState(probeT);
    const qFactor = zeta > 1e-3 ? 1 / (2 * zeta) : Infinity;
    const settling2Pct = sigma > 1e-3 ? 4 / sigma : Infinity;

    return {
      wn,
      zeta,
      wd,
      regime,
      s1,
      s2,
      wavePts,
      probeState,
      qFactor,
      settling2Pct,
    };
  }, [mass, dampingC, stiffnessK, x0, v0, probeT]);

  return (
    <section
      id="damping-ratio-root-locus"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
            Laboratory 4.2.1.1 • Mass-Spring-Damper Physics &amp; Complex s-Plane Root Locus
          </span>
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
            Harmonic Oscillator Regimes, Exponential Envelopes &amp; Phase Portraits
          </h2>
          <p className="text-sm font-math-serif text-[var(--text-secondary)]">
            Tune physical parameters <KaTeXMath math="(m, c, k)" /> to sweep damping ratio{" "}
            <KaTeXMath math="\zeta = c / (2\sqrt{mk})" /> across underdamped, critically damped, and
            overdamped regimes while watching characteristic roots migrate in the{" "}
            <KaTeXMath math="s" />-plane.
          </p>
        </div>

        <span
          className="px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-tabular-mono font-semibold shrink-0"
          style={{
            color:
              sim.regime === "Undamped"
                ? "#FBEAA4"
                : sim.regime === "Underdamped"
                ? "#8D9FCE"
                : sim.regime === "Critically Damped"
                ? "#96B898"
                : "#D5658B",
          }}
        >
          Regime: {sim.regime.toUpperCase()} (ζ = {sim.zeta.toFixed(2)})
        </span>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {OSC_PRESETS.map((p) => {
          const selected = presetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`p-3 border text-left transition-colors ${
                selected
                  ? "border-[var(--math-ink-x)] bg-[var(--bg-canvas)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 hover:border-[var(--border-strong)]"
              }`}
            >
              <span className="text-[11px] font-tabular-mono text-[var(--math-ink-x)] font-semibold block mb-1">
                {p.badge}
              </span>
              <div className="text-xs font-math-serif text-[var(--text-primary)] leading-snug">
                {p.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Physical Controls + Live Formula */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-x)]">
              <span>Mass m (kg)</span>
              <span>{mass.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={3.0}
              step={0.1}
              value={mass}
              onChange={(e) => {
                setMass(parseFloat(e.target.value));
                setPresetId("custom");
              }}
              className="w-full accent-[#8D9FCE]"
              aria-label="Mass m (kg)"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-sweep)]">
              <span>Damping c (N·s/m)</span>
              <span>{dampingC.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={8.0}
              step={0.1}
              value={dampingC}
              onChange={(e) => {
                setDampingC(parseFloat(e.target.value));
                setPresetId("custom");
              }}
              className="w-full accent-[#D35323]"
              aria-label="Damping c (N·s/m)"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-y)]">
              <span>Stiffness k (N/m)</span>
              <span>{stiffnessK.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={9.0}
              step={0.2}
              value={stiffnessK}
              onChange={(e) => {
                setStiffnessK(parseFloat(e.target.value));
                setPresetId("custom");
              }}
              className="w-full accent-[#96B898]"
              aria-label="Stiffness k (N/m)"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-diff)]">
              <span>Initial x(0)</span>
              <span>{x0.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-2.0}
              max={2.0}
              step={0.1}
              value={x0}
              onChange={(e) => setX0(parseFloat(e.target.value))}
              className="w-full accent-[#FBEAA4]"
              aria-label="Initial position x(0)"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-lower)]">
              <span>Initial v(0)</span>
              <span>{v0.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-3.5}
              max={3.5}
              step={0.1}
              value={v0}
              onChange={(e) => setV0(parseFloat(e.target.value))}
              className="w-full accent-[#D5658B]"
              aria-label="Initial velocity v(0)"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-z)]">
              <span>Time Probe t*</span>
              <span>{probeT.toFixed(2)} s</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={probeT}
              onChange={(e) => setProbeT(parseFloat(e.target.value))}
              className="w-full accent-[#029091]"
              aria-label="Time probe t*"
            />
          </div>
        </div>

        <div className="lg:col-span-5 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
          <div className="text-xs overflow-x-auto">
            <KaTeXMath
              math={`${mass.toFixed(1)}\\ddot{x} + ${dampingC.toFixed(1)}\\dot{x} + ${stiffnessK.toFixed(1)}x = 0 \\quad (\\omega_n = ${sim.wn.toFixed(2)},\\; \\zeta = ${sim.zeta.toFixed(2)})`}
              block
            />
          </div>
          <p className="text-xs font-math-serif text-[var(--text-secondary)]">
            {presetId === "custom"
              ? "Notice how √(k/m) fixes the natural circle radius ω_n in the s-plane while damping c bends the roots inward toward the negative real axis."
              : activePreset.note}
          </p>
        </div>
      </div>

      {/* Synchronized 3-Panel Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Panel 1: Complex s-Plane Root Locus */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 text-[var(--math-ink-sweep)]">
              <Compass className="w-3.5 h-3.5" />
              <span>Complex s-Plane Roots</span>
            </span>
            <span>|s| = ω_n = {sim.wn.toFixed(2)}</span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-5.0, 1.2]}
            yRange={[-3.5, 3.5]}
            xLabel="Re(s)"
            yLabel="Im(s)"
            width={340}
            height={270}
            ariaLabel="Complex s-plane characteristic root locus showing underdamped circle and real-axis splitting"
            className="w-full h-[270px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const zeroX = toSvgX(0);
              const zeroY = toSvgY(0);
              // Left half-plane semicircle |s| = wn
              const arcPts: string[] = [];
              for (let deg = 90; deg <= 270; deg += 5) {
                const rad = (deg * Math.PI) / 180;
                const sx = toSvgX(sim.wn * Math.cos(rad));
                const sy = toSvgY(sim.wn * Math.sin(rad));
                arcPts.push(`${deg === 90 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
              }

              const renderCross = (re: number, im: number, color: string) => {
                const cx = toSvgX(Math.max(-4.9, re));
                const cy = toSvgY(im);
                return (
                  <g>
                    <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} stroke={color} strokeWidth="2.4" />
                    <line x1={cx - 5} y1={cy + 5} x2={cx + 5} y2={cy - 5} stroke={color} strokeWidth="2.4" />
                  </g>
                );
              };

              return (
                <g>
                  {/* Imaginary Stability Axis */}
                  <line
                    x1={zeroX}
                    y1={toSvgY(-3.5)}
                    x2={zeroX}
                    y2={toSvgY(3.5)}
                    stroke="#FBEAA4"
                    strokeOpacity="0.45"
                    strokeDasharray="3 3"
                  />
                  {/* Natural Frequency Semicircle */}
                  <path
                    d={arcPts.join(" ")}
                    fill="none"
                    stroke="#8D9FCE"
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  {/* Origin-to-root rays */}
                  <line
                    x1={zeroX}
                    y1={zeroY}
                    x2={toSvgX(Math.max(-4.9, sim.s1[0]))}
                    y2={toSvgY(sim.s1[1])}
                    stroke="#525663"
                    strokeWidth="1"
                  />
                  {renderCross(sim.s1[0], sim.s1[1], "#D35323")}
                  {renderCross(sim.s2[0], sim.s2[1], "#96B898")}
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          <div className="text-[11px] font-tabular-mono text-[var(--text-secondary)] p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
            <div>
              s₁ = {sim.s1[0].toFixed(2)} {sim.s1[1] >= 0 ? "+" : "-"} {Math.abs(sim.s1[1]).toFixed(2)}i
            </div>
            <div>
              s₂ = {sim.s2[0].toFixed(2)} {sim.s2[1] >= 0 ? "+" : "-"} {Math.abs(sim.s2[1]).toFixed(2)}i
            </div>
          </div>
        </div>

        {/* Panel 2: Time Response x(t) & Envelope */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 text-[var(--math-ink-y)]">
              <Waves className="w-3.5 h-3.5" />
              <span>Displacement x(t) &amp; Decay Envelope</span>
            </span>
            <span>x(t*) = {sim.probeState.x.toFixed(3)}</span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[0, 10]}
            yRange={[-2.6, 2.6]}
            xLabel="t (s)"
            yLabel="x(t)"
            width={420}
            height={270}
            ariaLabel="Time domain displacement response x(t) with decay envelope"
            onSelectPoint={(t) => setProbeT(Number(Math.max(0, Math.min(10, t)).toFixed(2)))}
            className="w-full h-[270px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] cursor-crosshair select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const clampY = (y: number) => Math.max(-2.5, Math.min(2.5, y));
              const wavePath = sim.wavePts
                .map(
                  (pt, i) =>
                    `${i === 0 ? "M" : "L"}${toSvgX(pt.t).toFixed(1)},${toSvgY(clampY(pt.x)).toFixed(1)}`
                )
                .join(" ");
              const upperEnv = sim.wavePts
                .map(
                  (pt, i) =>
                    `${i === 0 ? "M" : "L"}${toSvgX(pt.t).toFixed(1)},${toSvgY(clampY(pt.env)).toFixed(1)}`
                )
                .join(" ");
              const lowerEnv = sim.wavePts
                .map(
                  (pt, i) =>
                    `${i === 0 ? "M" : "L"}${toSvgX(pt.t).toFixed(1)},${toSvgY(clampY(-pt.env)).toFixed(1)}`
                )
                .join(" ");

              return (
                <g>
                  {sim.zeta < 1 && (
                    <>
                      <path
                        d={upperEnv}
                        fill="none"
                        stroke="#D5658B"
                        strokeWidth="1.25"
                        strokeOpacity="0.65"
                        strokeDasharray="4 3"
                      />
                      <path
                        d={lowerEnv}
                        fill="none"
                        stroke="#D5658B"
                        strokeWidth="1.25"
                        strokeOpacity="0.65"
                        strokeDasharray="4 3"
                      />
                    </>
                  )}
                  <path d={wavePath} fill="none" stroke="#8D9FCE" strokeWidth="2.5" />
                  <line
                    x1={toSvgX(probeT)}
                    y1={toSvgY(-2.6)}
                    x2={toSvgX(probeT)}
                    y2={toSvgY(2.6)}
                    stroke="#FBEAA4"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={toSvgX(probeT)}
                    cy={toSvgY(clampY(sim.probeState.x))}
                    r="5"
                    fill="#FBEAA4"
                    stroke="#1E1F22"
                    strokeWidth="1.5"
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          {/* Compact Mass-Spring Schematic Bar */}
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
            <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--text-muted)]">
              <span>Live Mass-Spring Cart Position (t* = {probeT.toFixed(1)} s)</span>
              <span className="text-[var(--math-ink-z)]">
                v(t*) = {sim.probeState.v.toFixed(2)} m/s
              </span>
            </div>
            <div className="relative h-6 bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex items-center px-3">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-4 bg-[#8D9FCE] border border-[var(--math-ink-diff)]"
                style={{
                  left: `calc(${Math.max(8, Math.min(92, 50 + sim.probeState.x * 16))}% - 10px)`,
                }}
              />
              <div className="w-px h-full bg-[#AAA36D]/50 mx-auto" />
            </div>
          </div>
        </div>

        {/* Panel 3: Phase Portrait (x, v) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 text-[var(--math-ink-diff)]">
              <Activity className="w-3.5 h-3.5" />
              <span>(x, v) Phase Orbit</span>
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-2.5, 2.5]}
            yRange={[-4.5, 4.5]}
            xLabel="x"
            yLabel="dx/dt"
            width={280}
            height={270}
            ariaLabel="Position-velocity phase space trajectory"
            className="w-full h-[270px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const phasePath = sim.wavePts
                .map(
                  (pt, i) =>
                    `${i === 0 ? "M" : "L"}${toSvgX(Math.max(-2.45, Math.min(2.45, pt.x))).toFixed(1)},${toSvgY(Math.max(-4.4, Math.min(4.4, pt.v))).toFixed(1)}`
                )
                .join(" ");
              return (
                <g>
                  <path d={phasePath} fill="none" stroke="#96B898" strokeWidth="2.2" />
                  <circle
                    cx={toSvgX(x0)}
                    cy={toSvgY(Math.max(-4.4, Math.min(4.4, v0)))}
                    r="4"
                    fill="#D35323"
                  />
                  <circle
                    cx={toSvgX(Math.max(-2.45, Math.min(2.45, sim.probeState.x)))}
                    cy={toSvgY(Math.max(-4.4, Math.min(4.4, sim.probeState.v)))}
                    r="5"
                    fill="#FBEAA4"
                    stroke="#1E1F22"
                    strokeWidth="1.5"
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          <div className="text-[11px] font-tabular-mono text-[var(--text-secondary)] p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Quality Q = 1/(2ζ):</span>
              <span>{Number.isFinite(sim.qFactor) ? sim.qFactor.toFixed(2) : "∞"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">2% Settling T_s:</span>
              <span>
                {Number.isFinite(sim.settling2Pct)
                  ? `${sim.settling2Pct.toFixed(2)} s`
                  : "Never"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
