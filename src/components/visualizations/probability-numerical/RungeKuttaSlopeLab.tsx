"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

type OdeId = "exp" | "logistic" | "osc" | "stiff";

interface OdePreset {
  id: OdeId;
  label: string;
  formulaLatex: string;
  y0: number;
  tMax: number;
  yRange: [number, number];
  rhs: (t: number, y: number) => number;
  exact: (t: number) => number;
  note: string;
}

const ODES: OdePreset[] = [
  {
    id: "exp",
    label: "Exponential Growth",
    formulaLatex: "y' = 0.48y,\\quad y(0)=0.5",
    y0: 0.5,
    tMax: 5.5,
    yRange: [0, 7.5],
    rhs: (_t, y) => 0.48 * y,
    exact: (t) => 0.5 * Math.exp(0.48 * t),
    note: "Convex solution curves bend upward ahead of Euler's left-endpoint tangent, causing Euler to systematically undershoot.",
  },
  {
    id: "logistic",
    label: "Logistic S-Curve",
    formulaLatex: "y' = 0.9y\\!\\left(1 - \\frac{y}{3}\\right),\\; y(0)=0.35",
    y0: 0.35,
    tMax: 6.0,
    yRange: [0, 3.6],
    rhs: (_t, y) => 0.9 * y * (1 - y / 3),
    exact: (t) => 3 / (1 + (3 / 0.35 - 1) * Math.exp(-0.9 * t)),
    note: "Inflection point switches curvature from concave-up to concave-down; Heun and RK4 track the S-bend cleanly.",
  },
  {
    id: "osc",
    label: "Oscillating Decay",
    formulaLatex: "y' = \\cos(2t) - 0.4y,\\; y(0)=1",
    y0: 1.0,
    tMax: 6.0,
    yRange: [-0.8, 1.55],
    rhs: (t, y) => Math.cos(2 * t) - 0.4 * y,
    exact: (t) => {
      const a = 0.4 / 4.16;
      const b = 2 / 4.16;
      return (1 - a) * Math.exp(-0.4 * t) + a * Math.cos(2 * t) + b * Math.sin(2 * t);
    },
    note: "Time-varying forcing tests phase accuracy: notice how Euler phase-leads/overshoots peaks when h ≥ 0.4.",
  },
  {
    id: "stiff",
    label: "Stiff Relaxation",
    formulaLatex: "y' = -3.2y + \\sin(1.5t) + 1.2,\\; y(0)=2.2",
    y0: 2.2,
    tMax: 5.0,
    yRange: [-1.8, 2.8],
    rhs: (t, y) => -3.2 * y + Math.sin(1.5 * t) + 1.2,
    exact: (t) => {
      const denom = 3.2 * 3.2 + 1.5 * 1.5;
      const A = 3.2 / denom;
      const B = -1.5 / denom;
      const C = 1.2 / 3.2;
      return (2.2 - C - B) * Math.exp(-3.2 * t) + A * Math.sin(1.5 * t) + B * Math.cos(1.5 * t) + C;
    },
    note: "Euler stability limit is h < 2/|λ| = 0.625. Push h ≥ 0.7 to watch Euler explode in sawtooth oscillation while RK4 stays bounded!",
  },
];

interface StepRecord {
  t: number;
  yEuler: number;
  yHeun: number;
  yRk4: number;
}

interface ProbeSnapshot {
  tn: number;
  yn: number;
  tHalf: number;
  tNext: number;
  k1: number;
  k2: number;
  k3: number;
  k4: number;
  yMid1: number;
  yMid2: number;
  yEnd3: number;
  yNextRk4: number;
  yNextEuler: number;
  yNextHeun: number;
  kAvg: number;
}

function fmt(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "∞";
  const clean = Math.abs(n) < 1e-8 ? 0 : n;
  return clean.toFixed(digits);
}

/**
 * Euler, Heun & RK4 Trajectory Stepping & Four-Slope Magnifier Lab (6.2.2).
 */
export function RungeKuttaSlopeLab() {
  const [odeId, setOdeId] = useState<OdeId>("osc");
  const [stepH, setStepH] = useState<number>(0.6);
  const [inspectIdx, setInspectIdx] = useState<number>(1);

  const meta = useMemo(() => ODES.find((o) => o.id === odeId) ?? ODES[0], [odeId]);

  const sim = useMemo(() => {
    const f = meta.rhs;
    const nSteps = Math.max(1, Math.floor(meta.tMax / stepH + 1e-9));
    const safeIdx = Math.min(inspectIdx, nSteps - 1);

    const records: StepRecord[] = [
      { t: 0, yEuler: meta.y0, yHeun: meta.y0, yRk4: meta.y0 },
    ];

    let yE = meta.y0;
    let yH = meta.y0;
    let yR = meta.y0;
    let snapshot: ProbeSnapshot | null = null;

    for (let i = 0; i < nSteps; i++) {
      const t = i * stepH;

      // Forward Euler
      const fE = f(t, yE);
      const nextE = Math.max(-50, Math.min(50, yE + stepH * fE));

      // Heun (Improved Euler / RK2)
      const s1 = f(t, yH);
      const s2 = f(t + stepH, yH + stepH * s1);
      const nextH = Math.max(-50, Math.min(50, yH + 0.5 * stepH * (s1 + s2)));

      // Classic RK4
      const k1 = f(t, yR);
      const yMid1 = yR + 0.5 * stepH * k1;
      const k2 = f(t + 0.5 * stepH, yMid1);
      const yMid2 = yR + 0.5 * stepH * k2;
      const k3 = f(t + 0.5 * stepH, yMid2);
      const yEnd3 = yR + stepH * k3;
      const k4 = f(t + stepH, yEnd3);
      const kAvg = (k1 + 2 * k2 + 2 * k3 + k4) / 6;
      const nextR = Math.max(-50, Math.min(50, yR + stepH * kAvg));

      if (i === safeIdx) {
        snapshot = {
          tn: t,
          yn: yR,
          tHalf: t + 0.5 * stepH,
          tNext: t + stepH,
          k1,
          k2,
          k3,
          k4,
          yMid1,
          yMid2,
          yEnd3,
          yNextRk4: nextR,
          yNextEuler: yR + stepH * k1,
          yNextHeun: yR + 0.5 * stepH * (k1 + f(t + stepH, yR + stepH * k1)),
          kAvg,
        };
      }

      yE = nextE;
      yH = nextH;
      yR = nextR;
      records.push({ t: (i + 1) * stepH, yEuler: yE, yHeun: yH, yRk4: yR });
    }

    const exactCurve: { t: number; y: number }[] = [];
    for (let i = 0; i <= 140; i++) {
      const t = (meta.tMax * i) / 140;
      exactCurve.push({ t, y: meta.exact(t) });
    }

    // Slope field background ticks on global grid
    const ticks: { t0: number; y0: number; t1: number; y1: number }[] = [];
    const cols = 14;
    const rows = 10;
    const [yMin, yMax] = meta.yRange;
    const dtSpan = meta.tMax / cols;
    const dySpan = (yMax - yMin) / rows;
    const halfLen = 0.28 * dtSpan;
    for (let c = 0; c <= cols; c++) {
      for (let r = 0; r <= rows; r++) {
        const tc = c * dtSpan;
        const yc = yMin + r * dySpan;
        const slope = f(tc, yc);
        // Normalize slope visually in aspect ratio
        const scaled = (slope * dtSpan) / dySpan;
        const dx = halfLen / Math.sqrt(1 + scaled * scaled);
        const dy = slope * dx;
        ticks.push({ t0: tc - dx, y0: yc - dy, t1: tc + dx, y1: yc + dy });
      }
    }

    // Local magnifying-glass Y range around snapshot
    const snap = snapshot!;
    const localPts: number[] = [
      snap.yn,
      snap.yMid1,
      snap.yMid2,
      snap.yEnd3,
      snap.yNextRk4,
      snap.yNextEuler,
      snap.yNextHeun,
      meta.exact(snap.tn),
      meta.exact(snap.tNext),
    ];
    const minY = Math.min(...localPts);
    const maxY = Math.max(...localPts);
    const padY = Math.max(0.18, (maxY - minY) * 0.35);

    const lastRec = records[records.length - 1];
    const exactEnd = meta.exact(lastRec.t);

    return {
      nSteps,
      safeIdx,
      records,
      snapshot: snap,
      exactCurve,
      ticks,
      localYRange: [minY - padY, maxY + padY] as [number, number],
      endErrors: {
        euler: Math.abs(lastRec.yEuler - exactEnd),
        heun: Math.abs(lastRec.yHeun - exactEnd),
        rk4: Math.abs(lastRec.yRk4 - exactEnd),
      },
    };
  }, [meta, stepH, inspectIdx]);

  const snap = sim.snapshot;

  return (
    <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)]">
            Lab 6.2.2 • Explicit Runge–Kutta ODE Solvers
          </span>
          <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
            Global Trajectory Comparator &amp; Four-Slope RK4 Magnifying Glass
          </h2>
          <p className="text-xs font-math-serif text-[var(--text-secondary)]">
            {meta.note}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ODES.map((o) => {
            const active = o.id === odeId;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setOdeId(o.id);
                  setInspectIdx(1);
                }}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "border-[var(--math-ink-sweep)] bg-[var(--bg-canvas)] text-[var(--math-ink-diff)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5">
        <div className="md:col-span-5 space-y-1">
          <div className="flex justify-between text-xs font-tabular-mono">
            <span className="text-[var(--text-secondary)]">
              Step Size <strong className="text-[var(--math-ink-sweep)]">h = {fmt(stepH, 2)}</strong>
            </span>
            <span className="text-[var(--text-muted)]">{sim.nSteps} steps on [0, {fmt(sim.nSteps * stepH, 2)}]</span>
          </div>
          <input
            type="range"
            min={0.15}
            max={1.1}
            step={0.05}
            value={stepH}
            onChange={(e) => setStepH(parseFloat(e.target.value))}
            aria-label="ODE solver step size h"
            className="w-full accent-[#D35323]"
          />
        </div>

        <div className="md:col-span-4 space-y-1">
          <div className="flex justify-between text-xs font-tabular-mono">
            <span className="text-[var(--text-secondary)]">
              Magnify Step <strong className="text-[var(--math-ink-z)]">n = {sim.safeIdx}</strong>
            </span>
            <span className="text-[var(--text-muted)]">
              [{fmt(snap.tn, 2)}, {fmt(snap.tNext, 2)}]
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, sim.nSteps - 1)}
            step={1}
            value={sim.safeIdx}
            onChange={(e) => setInspectIdx(parseInt(e.target.value, 10))}
            aria-label="Select time step n to magnify"
            className="w-full accent-[#029091]"
          />
        </div>

        <div className="md:col-span-3 text-right text-xs">
          <div className="font-tabular-mono text-[var(--text-muted)]">Initial Value Problem</div>
          <div className="text-[var(--math-ink-diff)] overflow-x-auto">
            <KaTeXMath math={meta.formulaLatex} />
          </div>
        </div>
      </div>

      {/* Synchronized Global & Magnifier Plots */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Global Trajectory Plot */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-diff)]">(a) Global Solution Trajectories</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-[var(--math-ink-diff)]">— Exact</span>
              <span className="text-[var(--math-ink-x)]">— Euler</span>
              <span className="text-[var(--math-ink-y)]">— Heun</span>
              <span className="text-[var(--math-ink-z)]">— RK4</span>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-0.15, meta.tMax + 0.15]}
            yRange={meta.yRange}
            width={420}
            height={295}
            padding={34}
            xLabel="t"
            yLabel="y(t)"
            xColor="#8D9FCE"
            yColor="#FBEAA4"
            ariaLabel="Global ODE solution comparing Exact, Forward Euler, Heun, and RK4"
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const clampY = (y: number) =>
                Math.max(meta.yRange[0] - 1, Math.min(meta.yRange[1] + 1, y));

              const toPath = (pick: (r: StepRecord) => number) =>
                sim.records
                  .map((r, i) => `${i === 0 ? "M" : "L"}${toSvgX(r.t).toFixed(2)},${toSvgY(clampY(pick(r))).toFixed(2)}`)
                  .join(" ");

              const exactPath = sim.exactCurve
                .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p.t).toFixed(2)},${toSvgY(clampY(p.y)).toFixed(2)}`)
                .join(" ");

              return (
                <g>
                  {/* Direction field slope ticks */}
                  {sim.ticks.map((tk, idx) => (
                    <line
                      key={idx}
                      x1={toSvgX(tk.t0)}
                      y1={toSvgY(tk.y0)}
                      x2={toSvgX(tk.t1)}
                      y2={toSvgY(tk.y1)}
                      stroke="#35383F"
                      strokeWidth={1.1}
                    />
                  ))}

                  {/* Magnified window highlight band */}
                  <rect
                    x={toSvgX(snap.tn)}
                    y={16}
                    width={Math.max(4, toSvgX(snap.tNext) - toSvgX(snap.tn))}
                    height={263}
                    fill="#D35323"
                    fillOpacity={0.11}
                    stroke="#D35323"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />

                  {/* Exact solution */}
                  <path d={exactPath} fill="none" stroke="#FBEAA4" strokeWidth={2.2} strokeDasharray="5 3" />

                  {/* Forward Euler */}
                  <path d={toPath((r) => r.yEuler)} fill="none" stroke="#8D9FCE" strokeWidth={1.7} />
                  {sim.records.map((r, i) => (
                    <circle key={`e-${i}`} cx={toSvgX(r.t)} cy={toSvgY(clampY(r.yEuler))} r={2.3} fill="#8D9FCE" />
                  ))}

                  {/* Heun / RK2 */}
                  <path d={toPath((r) => r.yHeun)} fill="none" stroke="#96B898" strokeWidth={1.8} />

                  {/* RK4 */}
                  <path d={toPath((r) => r.yRk4)} fill="none" stroke="#029091" strokeWidth={2.2} />
                  {sim.records.map((r, i) => (
                    <circle
                      key={`r-${i}`}
                      cx={toSvgX(r.t)}
                      cy={toSvgY(clampY(r.yRk4))}
                      r={i === sim.safeIdx || i === sim.safeIdx + 1 ? 4.2 : 2.6}
                      fill={i === sim.safeIdx || i === sim.safeIdx + 1 ? "#D35323" : "#029091"}
                    />
                  ))}
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: Single-Step Four-Slope Magnifier [t_n, t_n + h] */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-sweep)]">(b) Single-Step Magnifier [tₙ, tₙ + h]</span>
            <div className="flex items-center gap-2.5 text-[11px]">
              <span className="text-[var(--math-ink-x)]">k₁</span>
              <span className="text-[var(--math-ink-y)]">k₂</span>
              <span className="text-[var(--math-ink-grid)]">k₃</span>
              <span className="text-[var(--math-ink-sweep)]">k₄</span>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={[snap.tn - 0.14 * stepH, snap.tNext + 0.14 * stepH]}
            yRange={sim.localYRange}
            width={420}
            height={295}
            padding={34}
            xLabel="t"
            yLabel="y"
            xColor="#8D9FCE"
            yColor="#029091"
            ariaLabel="Single-step RK4 magnifying glass displaying intermediate slope probes k1, k2, k3, k4"
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              // Exact local reference segment across [t_n, t_n + h]
              const localExactPts: string[] = [];
              for (let k = 0; k <= 30; k++) {
                const tk = snap.tn + (stepH * k) / 30;
                const yk = meta.exact(tk);
                localExactPts.push(`${k === 0 ? "M" : "L"}${toSvgX(tk).toFixed(2)},${toSvgY(yk).toFixed(2)}`);
              }

              // Helper to draw centered slope tangent needle at (t0, y0)
              const renderSlopeNeedle = (
                tc: number,
                yc: number,
                slope: number,
                color: string,
                label: string,
                halfDt: number
              ) => {
                const x1 = toSvgX(tc - halfDt);
                const y1 = toSvgY(yc - slope * halfDt);
                const x2 = toSvgX(tc + halfDt);
                const y2 = toSvgY(yc + slope * halfDt);
                return (
                  <g>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.3} />
                    <circle cx={toSvgX(tc)} cy={toSvgY(yc)} r={4.2} fill={color} stroke="#1E1F22" strokeWidth={1.2} />
                    <text
                      x={toSvgX(tc) + 7}
                      y={toSvgY(yc) - 7}
                      fontSize={10.5}
                      fontWeight={700}
                      fill={color}
                      fontFamily="var(--font-jetbrains-mono), monospace"
                    >
                      {label}
                    </text>
                  </g>
                );
              };

              return (
                <g>
                  {/* Vertical guides at t_n, t_n + h/2, t_n + h */}
                  <line x1={toSvgX(snap.tn)} y1={16} x2={toSvgX(snap.tn)} y2={261} stroke="#2E3138" strokeDasharray="3 3" />
                  <line x1={toSvgX(snap.tHalf)} y1={16} x2={toSvgX(snap.tHalf)} y2={261} stroke="#2E3138" strokeDasharray="3 3" />
                  <line x1={toSvgX(snap.tNext)} y1={16} x2={toSvgX(snap.tNext)} y2={261} stroke="#2E3138" strokeDasharray="3 3" />

                  {/* Exact global solution across step */}
                  <path d={localExactPts.join(" ")} fill="none" stroke="#FBEAA4" strokeWidth={2} strokeDasharray="5 3" />

                  {/* Trial step dashed rays from (t_n, y_n) */}
                  <line
                    x1={toSvgX(snap.tn)}
                    y1={toSvgY(snap.yn)}
                    x2={toSvgX(snap.tNext)}
                    y2={toSvgY(snap.yNextEuler)}
                    stroke="#8D9FCE"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  <line
                    x1={toSvgX(snap.tn)}
                    y1={toSvgY(snap.yn)}
                    x2={toSvgX(snap.tHalf)}
                    y2={toSvgY(snap.yMid2)}
                    stroke="#96B898"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                  />
                  <line
                    x1={toSvgX(snap.tn)}
                    y1={toSvgY(snap.yn)}
                    x2={toSvgX(snap.tNext)}
                    y2={toSvgY(snap.yEnd3)}
                    stroke="#AAA36D"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                  />

                  {/* Final RK4 Weighted Secant Step */}
                  <line
                    x1={toSvgX(snap.tn)}
                    y1={toSvgY(snap.yn)}
                    x2={toSvgX(snap.tNext)}
                    y2={toSvgY(snap.yNextRk4)}
                    stroke="#029091"
                    strokeWidth={2.7}
                  />

                  {/* Four Intermediate Slope Probes */}
                  {renderSlopeNeedle(snap.tn, snap.yn, snap.k1, "#8D9FCE", "k₁", 0.14 * stepH)}
                  {renderSlopeNeedle(snap.tHalf, snap.yMid1, snap.k2, "#96B898", "k₂", 0.14 * stepH)}
                  {renderSlopeNeedle(snap.tHalf, snap.yMid2, snap.k3, "#AAA36D", "k₃", 0.14 * stepH)}
                  {renderSlopeNeedle(snap.tNext, snap.yEnd3, snap.k4, "#D35323", "k₄", 0.14 * stepH)}

                  {/* Final RK4 landing node */}
                  <circle
                    cx={toSvgX(snap.tNext)}
                    cy={toSvgY(snap.yNextRk4)}
                    r={4.8}
                    fill="#029091"
                    stroke="#FBEAA4"
                    strokeWidth={1.4}
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Four-Slope Breakdown & Global Terminal Errors */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-tabular-mono text-xs">
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-1">
          <div className="text-[var(--math-ink-x)]">k₁ = f(tₙ, yₙ)</div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">{fmt(snap.k1, 4)}</div>
        </div>
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-1">
          <div className="text-[var(--math-ink-y)]">k₂ (Midpoint 1)</div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">{fmt(snap.k2, 4)}</div>
        </div>
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-1">
          <div className="text-[var(--math-ink-grid)]">k₃ (Midpoint 2)</div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">{fmt(snap.k3, 4)}</div>
        </div>
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-1">
          <div className="text-[var(--math-ink-sweep)]">k₄ (Endpoint)</div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">{fmt(snap.k4, 4)}</div>
        </div>
        <div className="border border-[var(--math-ink-z)]/60 bg-[var(--bg-canvas)] p-3 space-y-1 col-span-2 md:col-span-1">
          <div className="text-[var(--math-ink-z)]">Weighted Avg k̄</div>
          <div className="text-sm font-semibold text-[var(--math-ink-diff)]">{fmt(snap.kAvg, 4)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-tabular-mono text-xs">
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 flex items-center justify-between">
          <span className="text-[var(--math-ink-x)]">Euler |E(T)| (Order 1)</span>
          <span className="text-[var(--text-primary)] font-semibold">
            {sim.endErrors.euler.toExponential(2)}
          </span>
        </div>
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 flex items-center justify-between">
          <span className="text-[var(--math-ink-y)]">Heun |E(T)| (Order 2)</span>
          <span className="text-[var(--text-primary)] font-semibold">
            {sim.endErrors.heun.toExponential(2)}
          </span>
        </div>
        <div className="border border-[var(--math-ink-z)]/60 bg-[var(--bg-canvas)] px-3.5 py-2.5 flex items-center justify-between">
          <span className="text-[var(--math-ink-z)]">RK4 |E(T)| (Order 4)</span>
          <span className="text-[var(--math-ink-diff)] font-semibold">
            {sim.endErrors.rk4.toExponential(2)}
          </span>
        </div>
      </div>
    </section>
  );
}
