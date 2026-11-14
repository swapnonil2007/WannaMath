"use client";

import React, { useState, useMemo } from "react";
import { Compass, Crosshair, GitCommitHorizontal } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";
import { getAdaptiveAccentInk } from "@/lib/accentInk";

interface MatrixPreset {
  id: string;
  name: string;
  badge: string;
  a: number;
  b: number;
  c: number;
  d: number;
  note: string;
}

const MATRIX_PRESETS: MatrixPreset[] = [
  {
    id: "stable-spiral",
    name: "Stable Spiral Sink",
    badge: "τ < 0, Δ > τ²/4",
    a: -0.45,
    b: 1.4,
    c: -1.4,
    d: -0.45,
    note: "Complex eigenvalues λ = -0.45 ± 1.40i pull all trajectories inward along logarithmic spirals at rate exp(-0.45t).",
  },
  {
    id: "saddle",
    name: "Hyperbolic Saddle Point",
    badge: "Δ < 0 (λ₁ > 0 > λ₂)",
    a: 0.7,
    b: 0.85,
    c: 0.85,
    d: -0.7,
    note: "Opposite-signed real eigenvalues create one attracting stable manifold (green eigenvector line) and one repelling unstable manifold (blue eigenvector line).",
  },
  {
    id: "stable-node",
    name: "Stable Asymmetric Node",
    badge: "τ < 0, 0 < Δ < τ²/4",
    a: -1.3,
    b: 0.4,
    c: 0.3,
    d: -0.5,
    note: "Both eigenvalues are negative real; trajectories decay rapidly along the faster eigenvector before aligning tangent to the slower eigenvector near the origin.",
  },
  {
    id: "pure-center",
    name: "Neutral Elliptic Center",
    badge: "τ = 0, Δ > 0",
    a: 0.25,
    b: 1.35,
    c: -1.1,
    d: -0.25,
    note: "Zero trace places pure imaginary eigenvalues λ = ±i√Δ right on the Δ-axis boundary between inward spirals and outward explosion.",
  },
  {
    id: "shear-degenerate",
    name: "Defective Shear Node (Δ = τ²/4)",
    badge: "Repeated λ, 1 Eigenvector",
    a: -1.0,
    b: 1.0,
    c: 0.0,
    d: -1.0,
    note: "On the parabola Δ = τ²/4, an off-diagonal shear produces a repeated eigenvalue with only one eigenvector direction—forming S-shaped curves approaching a single axis.",
  },
];

export function TraceDeterminantPhaseLab() {
  const [presetId, setPresetId] = useState<string>("stable-spiral");
  const [a, setA] = useState<number>(MATRIX_PRESETS[0].a);
  const [b, setB] = useState<number>(MATRIX_PRESETS[0].b);
  const [c, setC] = useState<number>(MATRIX_PRESETS[0].c);
  const [d, setD] = useState<number>(MATRIX_PRESETS[0].d);
  const [customSeeds, setCustomSeeds] = useState<[number, number][]>([
    [1.45, 0.9],
    [-1.45, -0.9],
  ]);

  const activePreset = useMemo(
    () => MATRIX_PRESETS.find((p) => p.id === presetId) ?? MATRIX_PRESETS[0],
    [presetId]
  );

  const handleSelectPreset = (p: MatrixPreset) => {
    setPresetId(p.id);
    setA(p.a);
    setB(p.b);
    setC(p.c);
    setD(p.d);
  };

  // Clicking on the (τ, Δ) diagram configures companion matrix [[0, 1], [-Δ, τ]]
  const handleSelectTauDelta = (tauTarget: number, deltaTarget: number) => {
    setPresetId("custom");
    setA(0);
    setB(1.2);
    setC(Number((-deltaTarget / 1.2).toFixed(2)));
    setD(Number(tauTarget.toFixed(2)));
  };

  const analysis = useMemo(() => {
    const tau = a + d;
    const delta = a * d - b * c;
    const disc = tau * tau - 4 * delta;

    // Eigenvalue strings and real eigenvectors
    let regimeLabel = "";
    let regimeColor = "#8D9FCE";
    let eig1Str = "";
    let eig2Str = "";
    const realVecs: { vx: number; vy: number; lambda: number; color: string }[] = [];

    if (delta < -0.02) {
      regimeLabel = "Unstable Saddle Point";
      regimeColor = "#D35323";
    } else if (Math.abs(delta) <= 0.02) {
      regimeLabel = "Degenerate Line of Equilibria (det A = 0)";
      regimeColor = "#AAA36D";
    } else if (disc < -0.02) {
      if (Math.abs(tau) <= 0.03) {
        regimeLabel = "Neutral Center (Closed Orbits)";
        regimeColor = "#FBEAA4";
      } else if (tau < 0) {
        regimeLabel = "Stable Spiral Sink";
        regimeColor = "#029091";
      } else {
        regimeLabel = "Unstable Spiral Source";
        regimeColor = "#D5658B";
      }
    } else if (Math.abs(disc) <= 0.02) {
      regimeLabel =
        tau < 0 ? "Critically Degenerate Stable Node" : tau > 0 ? "Degenerate Unstable Node" : "Nilpotent Origin";
      regimeColor = tau < 0 ? "#96B898" : "#D35323";
    } else {
      regimeLabel = tau < 0 ? "Stable Node (Sink)" : "Unstable Node (Source)";
      regimeColor = tau < 0 ? "#96B898" : "#D35323";
    }

    if (disc >= 0) {
      const sq = Math.sqrt(disc);
      const l1 = 0.5 * (tau + sq);
      const l2 = 0.5 * (tau - sq);
      eig1Str = l1.toFixed(2);
      eig2Str = l2.toFixed(2);

      const computeEigenvector = (lam: number): [number, number] => {
        // Solve (A - lam I)v = 0
        const r1 = [a - lam, b];
        const r2 = [c, d - lam];
        if (Math.hypot(r1[0], r1[1]) >= Math.hypot(r2[0], r2[1])) {
          const len = Math.hypot(-r1[1], r1[0]);
          if (len > 1e-6) return [-r1[1] / len, r1[0] / len];
        }
        const len2 = Math.hypot(-r2[1], r2[0]);
        if (len2 > 1e-6) return [-r2[1] / len2, r2[0] / len2];
        return [1, 0];
      };

      const v1 = computeEigenvector(l1);
      realVecs.push({ vx: v1[0], vy: v1[1], lambda: l1, color: "#8D9FCE" });
      if (Math.abs(l1 - l2) > 0.03) {
        const v2 = computeEigenvector(l2);
        realVecs.push({ vx: v2[0], vy: v2[1], lambda: l2, color: "#96B898" });
      }
    } else {
      const re = 0.5 * tau;
      const im = 0.5 * Math.sqrt(-disc);
      eig1Str = `${re.toFixed(2)} + ${im.toFixed(2)}i`;
      eig2Str = `${re.toFixed(2)} - ${im.toFixed(2)}i`;
    }

    // Build grid vector arrows in [-2, 2]^2
    const arrows: { x: number; y: number; dx: number; dy: number }[] = [];
    for (let i = 0; i <= 8; i++) {
      const x = -1.75 + (i / 8) * 3.5;
      for (let j = 0; j <= 8; j++) {
        const y = -1.75 + (j / 8) * 3.5;
        const vx = a * x + b * y;
        const vy = c * x + d * y;
        const m = Math.hypot(vx, vy);
        if (m > 1e-4) {
          const len = 0.08 + 0.16 * Math.tanh(m * 0.45);
          arrows.push({ x, y, dx: (vx / m) * len, dy: (vy / m) * len });
        }
      }
    }

    // RK4 Trajectory Integrator
    const integrate = (sx: number, sy: number, dir: 1 | -1, steps = 95) => {
      const pts: [number, number][] = [[sx, sy]];
      let x = sx;
      let y = sy;
      const dt = 0.04 * dir;
      for (let k = 0; k < steps; k++) {
        const f1x = a * x + b * y;
        const f1y = c * x + d * y;
        const f2x = a * (x + 0.5 * dt * f1x) + b * (y + 0.5 * dt * f1y);
        const f2y = c * (x + 0.5 * dt * f1x) + d * (y + 0.5 * dt * f1y);
        const f3x = a * (x + 0.5 * dt * f2x) + b * (y + 0.5 * dt * f2y);
        const f3y = c * (x + 0.5 * dt * f2x) + d * (y + 0.5 * dt * f2y);
        const f4x = a * (x + dt * f3x) + b * (y + dt * f3y);
        const f4y = c * (x + dt * f3x) + d * (y + dt * f3y);
        x += (dt / 6) * (f1x + 2 * f2x + 2 * f3x + f4x);
        y += (dt / 6) * (f1y + 2 * f2y + 2 * f3y + f4y);
        if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 2.3 || Math.abs(y) > 2.3) {
          break;
        }
        pts.push([x, y]);
      }
      return pts;
    };

    const ambientSeeds: [number, number][] = [
      [1.6, 0.3],
      [-1.6, -0.3],
      [0.3, 1.6],
      [-0.3, -1.6],
      [1.3, -1.3],
      [-1.3, 1.3],
    ];
    const ambientTrajs = ambientSeeds.map(([sx, sy]) => ({
      fwd: integrate(sx, sy, 1, 75),
      bwd: integrate(sx, sy, -1, 45),
    }));
    const userTrajs = customSeeds.map(([sx, sy], idx) => ({
      idx,
      seed: [sx, sy] as [number, number],
      fwd: integrate(sx, sy, 1, 105),
      bwd: integrate(sx, sy, -1, 60),
    }));

    return {
      tau,
      delta,
      disc,
      regimeLabel,
      regimeColor,
      eig1Str,
      eig2Str,
      realVecs,
      arrows,
      ambientTrajs,
      userTrajs,
    };
  }, [a, b, c, d, customSeeds]);

  return (
    <section
      id="poincare-trace-det-explorer"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
            Laboratory 4.3.1.1 • Dual Interactive Poincaré (τ, Δ) Diagram &amp; Linear Phase Portrait
          </span>
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
            Trace-Determinant Bifurcation Plane &amp; Eigenvector Phase Explorer
          </h2>
          <p className="text-sm font-math-serif text-[var(--text-secondary)]">
            Click anywhere inside the Poincaré <KaTeXMath math="(\tau, \Delta)" /> bifurcation map
            to jump across nodes, saddles, spirals, and centers—or tune entries of{" "}
            <KaTeXMath math="A" /> directly and watch eigenvector lines &amp; trajectories morph.
          </p>
        </div>

        <span
          className="px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-tabular-mono font-semibold shrink-0"
          style={{ color: getAdaptiveAccentInk(analysis.regimeColor) }}
        >
          {analysis.regimeLabel}
        </span>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {MATRIX_PRESETS.map((p) => {
          const selected = presetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`p-3 border text-left transition-colors ${
                selected
                  ? "border-[var(--math-ink-z)] bg-[var(--bg-canvas)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 hover:border-[var(--border-strong)]"
              }`}
            >
              <span className="text-[11px] font-tabular-mono text-[var(--math-ink-z)] font-semibold block mb-1">
                {p.badge}
              </span>
              <div className="text-xs font-math-serif text-[var(--text-primary)] leading-snug">
                {p.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Matrix Sliders + Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-6 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-2 gap-4">
          {[
            { label: "a (dx/dt coeff of x)", val: a, set: setA, color: "#8D9FCE" },
            { label: "b (dx/dt coeff of y)", val: b, set: setB, color: "#D5658B" },
            { label: "c (dy/dt coeff of x)", val: c, set: setC, color: "#D5658B" },
            { label: "d (dy/dt coeff of y)", val: d, set: setD, color: "#96B898" },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div
                className="flex justify-between text-[11px] font-tabular-mono"
                style={{ color: getAdaptiveAccentInk(item.color) }}
              >
                <span>{item.label}</span>
                <span>{item.val.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={-2.5}
                max={2.5}
                step={0.05}
                value={item.val}
                onChange={(e) => {
                  item.set(parseFloat(e.target.value));
                  setPresetId("custom");
                }}
                className="w-full accent-[#029091]"
                aria-label={item.label}
              />
            </div>
          ))}
        </div>

        <div className="lg:col-span-6 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
          <div className="text-xs overflow-x-auto">
            <KaTeXMath
              math={`A = \\begin{bmatrix} ${a.toFixed(2)} & ${b.toFixed(2)} \\\\ ${c.toFixed(2)} & ${d.toFixed(2)} \\end{bmatrix}, \\qquad \\tau = ${analysis.tau.toFixed(2)}, \\; \\Delta = ${analysis.delta.toFixed(2)}`}
              block
            />
          </div>
          <p className="text-xs font-math-serif text-[var(--text-secondary)]">
            {presetId === "custom"
              ? "Notice how every 2D linear system with the same (τ, Δ) shares identical eigenvalues and qualitative topology up to a change of basis."
              : activePreset.note}
          </p>
        </div>
      </div>

      {/* Dual 2D Synchronized Planes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Poincaré (τ, Δ) Plane */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 text-[var(--math-ink-diff)]">
              <Compass className="w-3.5 h-3.5" />
              <span>Poincaré (τ, Δ) Diagram (Click to set τ and Δ)</span>
            </span>
            <span>Δ - τ²/4 = {(analysis.delta - 0.25 * analysis.tau * analysis.tau).toFixed(2)}</span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-3.5, 3.5]}
            yRange={[-2.5, 3.8]}
            xLabel="τ = tr(A)"
            yLabel="Δ = det(A)"
            width={440}
            height={360}
            ariaLabel="Poincare Trace-Determinant bifurcation plane with parabola delta equals tau squared over four"
            onSelectPoint={(tauClick, deltaClick) =>
              handleSelectTauDelta(tauClick, deltaClick)
            }
            className="w-full h-[360px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] cursor-crosshair select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const zeroX = toSvgX(0);
              const zeroY = toSvgY(0);

              // Parabola Δ = τ² / 4
              const parabPts: string[] = [];
              for (let i = 0; i <= 80; i++) {
                const tv = -3.5 + (i / 80) * 7.0;
                const dv = 0.25 * tv * tv;
                parabPts.push(
                  `${i === 0 ? "M" : "L"}${toSvgX(tv).toFixed(1)},${toSvgY(dv).toFixed(1)}`
                );
              }

              const clampTau = Math.max(-3.4, Math.min(3.4, analysis.tau));
              const clampDelta = Math.max(-2.4, Math.min(3.7, analysis.delta));

              return (
                <g>
                  {/* Highlighted Saddle Half-Plane (Δ < 0) */}
                  <rect
                    x={toSvgX(-3.5)}
                    y={zeroY}
                    width={toSvgX(3.5) - toSvgX(-3.5)}
                    height={toSvgY(-2.5) - zeroY}
                    fill="#D35323"
                    fillOpacity="0.08"
                  />

                  {/* Positive Δ-axis = Centers */}
                  <line
                    x1={zeroX}
                    y1={zeroY}
                    x2={zeroX}
                    y2={toSvgY(3.8)}
                    stroke="#FBEAA4"
                    strokeWidth="1.75"
                    strokeDasharray="4 3"
                  />

                  {/* Repeated-Root Parabola Δ = τ²/4 */}
                  <path
                    d={parabPts.join(" ")}
                    fill="none"
                    stroke="#FBEAA4"
                    strokeWidth="2"
                  />

                  {/* Region Labels */}
                  <text x={toSvgX(-2.6)} y={toSvgY(2.8)} fill="var(--math-ink-z)" fontSize="11" fontFamily="monospace">
                    STABLE SPIRALS
                  </text>
                  <text x={toSvgX(0.95)} y={toSvgY(2.8)} fill="var(--math-ink-lower)" fontSize="11" fontFamily="monospace">
                    UNSTABLE SPIRALS
                  </text>
                  <text x={toSvgX(-3.2)} y={toSvgY(0.55)} fill="var(--math-ink-y)" fontSize="11" fontFamily="monospace">
                    STABLE NODES
                  </text>
                  <text x={toSvgX(1.55)} y={toSvgY(0.55)} fill="var(--math-ink-sweep)" fontSize="11" fontFamily="monospace">
                    UNSTABLE NODES
                  </text>
                  <text x={toSvgX(-0.95)} y={toSvgY(-1.45)} fill="var(--math-ink-sweep)" fontSize="11" fontFamily="monospace">
                    SADDLES (Δ &lt; 0)
                  </text>

                  {/* Current (τ, Δ) Pin */}
                  <circle
                    cx={toSvgX(clampTau)}
                    cy={toSvgY(clampDelta)}
                    r="6.5"
                    fill={analysis.regimeColor}
                    stroke="#FBEAA4"
                    strokeWidth="2"
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: Live (x, y) Phase Portrait */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 text-[var(--math-ink-sweep)]">
              <Crosshair className="w-3.5 h-3.5" />
              <span>(x, y) Phase Portrait (Click to seed trajectory)</span>
            </span>
            <span>λ₁ = {analysis.eig1Str}, λ₂ = {analysis.eig2Str}</span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-2, 2]}
            yRange={[-2, 2]}
            xLabel="x"
            yLabel="y"
            width={440}
            height={360}
            ariaLabel="2D linear system phase portrait showing vector field, eigenvectors, and trajectories"
            onSelectPoint={(sx, sy) => {
              const pt: [number, number] = [Number(sx.toFixed(2)), Number(sy.toFixed(2))];
              setCustomSeeds((prev) => [pt, prev[0] ?? [1.45, 0.9]]);
            }}
            className="w-full h-[360px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] cursor-crosshair select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const pathStr = (pts: [number, number][]) =>
                pts
                  .map(
                    ([px, py], i) =>
                      `${i === 0 ? "M" : "L"}${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`
                  )
                  .join(" ");

              return (
                <g>
                  {/* Vector Field Grid */}
                  {analysis.arrows.map((ar, idx) => (
                    <g key={`va-${idx}`} opacity={0.52}>
                      <line
                        x1={toSvgX(ar.x)}
                        y1={toSvgY(ar.y)}
                        x2={toSvgX(ar.x + ar.dx)}
                        y2={toSvgY(ar.y + ar.dy)}
                        stroke="#8D9FCE"
                        strokeWidth="1.2"
                      />
                      <circle
                        cx={toSvgX(ar.x + ar.dx)}
                        cy={toSvgY(ar.y + ar.dy)}
                        r="1.4"
                        fill="#8D9FCE"
                      />
                    </g>
                  ))}

                  {/* Real Eigenvector Manifolds */}
                  {analysis.realVecs.map((ev, idx) => (
                    <line
                      key={`ev-${idx}`}
                      x1={toSvgX(-ev.vx * 2.1)}
                      y1={toSvgY(-ev.vy * 2.1)}
                      x2={toSvgX(ev.vx * 2.1)}
                      y2={toSvgY(ev.vy * 2.1)}
                      stroke={ev.color}
                      strokeWidth="2"
                      strokeDasharray="5 3"
                    />
                  ))}

                  {/* Ambient Phase Trajectories */}
                  {analysis.ambientTrajs.map((tr, idx) => (
                    <g key={`at-${idx}`} opacity={0.55}>
                      <path d={pathStr(tr.fwd)} fill="none" stroke="#96B898" strokeWidth="1.5" />
                      <path
                        d={pathStr(tr.bwd)}
                        fill="none"
                        stroke="#96B898"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                    </g>
                  ))}

                  {/* User Seeded Trajectories */}
                  {analysis.userTrajs.map((tr) => (
                    <g key={`ut-${tr.idx}`}>
                      <path
                        d={pathStr(tr.fwd)}
                        fill="none"
                        stroke={tr.idx === 0 ? "#D35323" : "#FBEAA4"}
                        strokeWidth={tr.idx === 0 ? "2.6" : "2.0"}
                      />
                      <path
                        d={pathStr(tr.bwd)}
                        fill="none"
                        stroke={tr.idx === 0 ? "#D35323" : "#FBEAA4"}
                        strokeOpacity="0.65"
                        strokeWidth="1.6"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={toSvgX(tr.seed[0])}
                        cy={toSvgY(tr.seed[1])}
                        r="4.5"
                        fill={tr.idx === 0 ? "#D35323" : "#FBEAA4"}
                        stroke="#1E1F22"
                        strokeWidth="1.5"
                      />
                    </g>
                  ))}

                  {/* Origin Fixed Point */}
                  <circle
                    cx={toSvgX(0)}
                    cy={toSvgY(0)}
                    r="4.5"
                    fill={analysis.regimeColor}
                    stroke="#1E1F22"
                    strokeWidth="1.5"
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          {/* Real Eigenvector Badges */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-tabular-mono text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <GitCommitHorizontal className="w-3.5 h-3.5 text-[var(--math-ink-x)]" />
              <span>
                {analysis.realVecs.length > 0
                  ? `Real Eigenvectors (${analysis.realVecs.length}): Dashed Straight-Line Manifolds`
                  : "Complex Conjugate Pair: No Real Invariant Lines (Pure Swirl)"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
