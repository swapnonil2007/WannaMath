"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight, Split, Layers } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

interface SubspacePreset {
  id: string;
  label: string;
  a: number;
  b: number;
  c: number;
  d: number;
  x: [number, number];
  note: string;
}

const SUBSPACE_PRESETS: SubspacePreset[] = [
  {
    id: "rank1-asym",
    label: "Rank-1 Asymmetric [[1,2],[0.5,1]]",
    a: 1.0,
    b: 2.0,
    c: 0.5,
    d: 1.0,
    x: [1.5, 1.2],
    note: "Row space R(Aᵀ) is spanned by ⟨1, 2⟩ while Nullspace N(A) is perpendicular along ⟨-2, 1⟩. Sliding x along the crimson nullspace fiber leaves Ax unchanged on C(A)!",
  },
  {
    id: "rank1-sym",
    label: "Rank-1 Symmetric [[1,1],[1,1]]",
    a: 1.0,
    b: 1.0,
    c: 1.0,
    d: 1.0,
    x: [1.8, -0.4],
    note: "Symmetric rank-1 projector: R(Aᵀ) = C(A) along y = x, and N(A) = N(Aᵀ) along y = -x.",
  },
  {
    id: "rank2-full",
    label: "Rank-2 Full [[1.4,0.4],[0.3,1.2]]",
    a: 1.4,
    b: 0.4,
    c: 0.3,
    d: 1.2,
    x: [1.3, 1.0],
    note: "When det(A) ≠ 0, rank = 2 and nullity = 0: N(A) and N(Aᵀ) shrink to just {0}, making R(Aᵀ) = ℝ² map bijectively onto C(A) = ℝ².",
  },
  {
    id: "zero-matrix",
    label: "Rank-0 Zero [[0,0],[0,0]]",
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    x: [1.4, 1.1],
    note: "Zero matrix collapses the entire domain ℝ² into N(A) so rank = 0, nullity = 2, and every input lands at b = 0.",
  },
];

export function FourSubspacesLab() {
  const [presetId, setPresetId] = useState<string>("rank1-asym");
  const [a, setA] = useState<number>(SUBSPACE_PRESETS[0].a);
  const [b, setB] = useState<number>(SUBSPACE_PRESETS[0].b);
  const [c, setC] = useState<number>(SUBSPACE_PRESETS[0].c);
  const [d, setD] = useState<number>(SUBSPACE_PRESETS[0].d);
  const [xVec, setXVec] = useState<[number, number]>(SUBSPACE_PRESETS[0].x);
  const [nullOffset, setNullOffset] = useState<number>(0);

  const analysis = useMemo(() => {
    const det = a * d - b * c;
    const frob = Math.hypot(a, b, c, d);
    const rank = frob < 1e-4 ? 0 : Math.abs(det) > 1e-3 ? 2 : 1;
    const nullity = 2 - rank;

    // Row space direction r = dominant nonzero row of A
    const row1Mag = Math.hypot(a, b);
    const row2Mag = Math.hypot(c, d);
    const rawRow: [number, number] = row1Mag >= row2Mag ? [a, b] : [c, d];
    const rLen = Math.hypot(rawRow[0], rawRow[1]) || 1;
    const rHat: [number, number] = [rawRow[0] / rLen, rawRow[1] / rLen];
    const nHat: [number, number] = [-rHat[1], rHat[0]];

    // Column space direction col = dominant nonzero col of A
    const col1Mag = Math.hypot(a, c);
    const col2Mag = Math.hypot(b, d);
    const rawCol: [number, number] = col1Mag >= col2Mag ? [a, c] : [b, d];
    const cLen = Math.hypot(rawCol[0], rawCol[1]) || 1;
    const cHat: [number, number] = [rawCol[0] / cLen, rawCol[1] / cLen];
    const lnHat: [number, number] = [-cHat[1], cHat[0]];

    // Split x + nullOffset * nHat into orthogonal xRow + xNull
    const xEffective: [number, number] = [
      xVec[0] + (rank === 1 ? nullOffset * nHat[0] : 0),
      xVec[1] + (rank === 1 ? nullOffset * nHat[1] : 0),
    ];

    let xRow: [number, number] = [0, 0];
    let xNull: [number, number] = [0, 0];
    if (rank === 2) {
      xRow = [...xEffective];
      xNull = [0, 0];
    } else if (rank === 1) {
      const dotR = xEffective[0] * rHat[0] + xEffective[1] * rHat[1];
      xRow = [dotR * rHat[0], dotR * rHat[1]];
      xNull = [xEffective[0] - xRow[0], xEffective[1] - xRow[1]];
    } else {
      xRow = [0, 0];
      xNull = [...xEffective];
    }

    const ax: [number, number] = [
      a * xEffective[0] + b * xEffective[1],
      c * xEffective[0] + d * xEffective[1],
    ];
    const axRow: [number, number] = [
      a * xRow[0] + b * xRow[1],
      c * xRow[0] + d * xRow[1],
    ];

    return {
      det,
      rank,
      nullity,
      rHat,
      nHat,
      cHat,
      lnHat,
      xEffective,
      xRow,
      xNull,
      ax,
      axRow,
    };
  }, [a, b, c, d, xVec, nullOffset]);

  const activePreset = useMemo(
    () => SUBSPACE_PRESETS.find((p) => p.id === presetId) ?? SUBSPACE_PRESETS[0],
    [presetId]
  );

  return (
    <section
      aria-label="Four Fundamental Subspaces and Rank-Nullity Action Diagram"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[var(--bg-canvas)]">
              LAB 2.1.3 • STRANG&apos;S FOUR FUNDAMENTAL SUBSPACES
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              rank = {analysis.rank} • nullity = {analysis.nullity}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Orthogonal Split <KaTeXMath math="\mathbf{x} = \mathbf{x}_r + \mathbf{x}_n" /> &amp; Rank–Nullity{" "}
            <KaTeXMath math="\operatorname{rank}(A) + \dim\mathcal{N}(A) = 2" />
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SUBSPACE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPresetId(p.id);
                setA(p.a);
                setB(p.b);
                setC(p.c);
                setD(p.d);
                setXVec(p.x);
                setNullOffset(0);
              }}
              className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                presetId === p.id
                  ? "border-[var(--math-ink-y)] bg-[#96B898]/15 text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
              }`}
            >
              {p.label.split("[")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Controls: 2x2 Matrix & Nullspace Fiber Scrubber */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
          <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] block">
            2×2 Matrix A Entries [[a, b], [c, d]]
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { lbl: "a", val: a, set: setA },
              { lbl: "b", val: b, set: setB },
              { lbl: "c", val: c, set: setC },
              { lbl: "d", val: d, set: setD },
            ].map((item) => (
              <label key={item.lbl} className="block space-y-0.5">
                <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
                  {item.lbl}
                </span>
                <input
                  type="number"
                  step="0.25"
                  value={item.val}
                  onChange={(e) => item.set(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)]"
                  aria-label={`Matrix entry ${item.lbl}`}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="md:col-span-7 p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-upper)] flex items-center gap-1.5">
              <Split className="w-3.5 h-3.5" aria-hidden="true" />
              Slide Nullspace Component α along N(A) (Notice Ax never moves!)
            </span>
            <span className="text-[var(--text-primary)] font-semibold">
              α = {nullOffset.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={-2.0}
            max={2.0}
            step={0.05}
            value={nullOffset}
            disabled={analysis.rank !== 1}
            onChange={(e) => setNullOffset(Number(e.target.value))}
            className="w-full accent-[#B95869] disabled:opacity-40"
            aria-label="Nullspace component α along N(A)"
          />
          {analysis.rank !== 1 && (
            <span className="text-[11px] font-tabular-mono text-[var(--text-muted)] block">
              {analysis.rank === 2
                ? "Rank 2 matrix has N(A) = {0} (unique pre-image for every output)."
                : "Rank 0 zero matrix sends all of ℝ² straight to the origin."}
            </span>
          )}
        </div>
      </div>

      {/* Dual Domain & Codomain Planes */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Domain Plane R^2 */}
        <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-3 bg-[var(--bg-canvas)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)]">
              Domain ℝ²: Row Space ℛ(Aᵀ) ⊥ Nullspace 𝒩(A)
            </span>
            <span className="text-[11px] font-tabular-mono text-[var(--text-muted)]">
              Click plane to set x
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-4, 4]}
            yRange={[-4, 4]}
            xLabel="x₁"
            yLabel="x₂"
            height={305}
            ariaLabel="Domain space showing row space and orthogonal nullspace"
            onSelectPoint={(wx, wy) => {
              setXVec([Number(wx.toFixed(2)), Number(wy.toFixed(2))]);
              setNullOffset(0);
            }}
          >
            {({ toSvgX, toSvgY }) => (
              <g>
                {analysis.rank === 1 && (
                  <>
                    {/* Row space line R(A^T) */}
                    <line
                      x1={toSvgX(-5 * analysis.rHat[0])}
                      y1={toSvgY(-5 * analysis.rHat[1])}
                      x2={toSvgX(5 * analysis.rHat[0])}
                      y2={toSvgY(5 * analysis.rHat[1])}
                      stroke="#8D9FCE"
                      strokeWidth={2}
                      strokeOpacity={0.65}
                    />
                    {/* Nullspace line N(A) */}
                    <line
                      x1={toSvgX(-5 * analysis.nHat[0])}
                      y1={toSvgY(-5 * analysis.nHat[1])}
                      x2={toSvgX(5 * analysis.nHat[0])}
                      y2={toSvgY(5 * analysis.nHat[1])}
                      stroke="#B95869"
                      strokeWidth={2}
                      strokeOpacity={0.65}
                    />
                    {/* Orthogonal fiber from xRow to xEffective */}
                    <line
                      x1={toSvgX(analysis.xRow[0] - 4 * analysis.nHat[0])}
                      y1={toSvgY(analysis.xRow[1] - 4 * analysis.nHat[1])}
                      x2={toSvgX(analysis.xRow[0] + 4 * analysis.nHat[0])}
                      y2={toSvgY(analysis.xRow[1] + 4 * analysis.nHat[1])}
                      stroke="#B95869"
                      strokeDasharray="4 4"
                      strokeOpacity={0.45}
                    />
                  </>
                )}

                {/* x_row component */}
                <line
                  x1={toSvgX(0)}
                  y1={toSvgY(0)}
                  x2={toSvgX(analysis.xRow[0])}
                  y2={toSvgY(analysis.xRow[1])}
                  stroke="#8D9FCE"
                  strokeWidth={2.8}
                />
                <circle cx={toSvgX(analysis.xRow[0])} cy={toSvgY(analysis.xRow[1])} r={4.5} fill="#8D9FCE" />

                {/* x_null component */}
                <line
                  x1={toSvgX(0)}
                  y1={toSvgY(0)}
                  x2={toSvgX(analysis.xNull[0])}
                  y2={toSvgY(analysis.xNull[1])}
                  stroke="#B95869"
                  strokeWidth={2.5}
                />

                {/* Drop lines showing x = x_row + x_null */}
                <line
                  x1={toSvgX(analysis.xRow[0])}
                  y1={toSvgY(analysis.xRow[1])}
                  x2={toSvgX(analysis.xEffective[0])}
                  y2={toSvgY(analysis.xEffective[1])}
                  stroke="#AAA36D"
                  strokeDasharray="3 3"
                />

                {/* Total input vector x */}
                <line
                  x1={toSvgX(0)}
                  y1={toSvgY(0)}
                  x2={toSvgX(analysis.xEffective[0])}
                  y2={toSvgY(analysis.xEffective[1])}
                  stroke="#FBEAA4"
                  strokeWidth={2.8}
                />
                <circle
                  cx={toSvgX(analysis.xEffective[0])}
                  cy={toSvgY(analysis.xEffective[1])}
                  r={5}
                  fill="#FBEAA4"
                  stroke="#1E1F22"
                  strokeWidth={1.4}
                />
              </g>
            )}
          </SvgCoordinatePlane2D>

          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs font-tabular-mono flex flex-wrap justify-between gap-2">
            <span className="text-[var(--math-ink-x)]">
              x_r = ⟨{analysis.xRow[0].toFixed(2)}, {analysis.xRow[1].toFixed(2)}⟩
            </span>
            <span className="text-[var(--math-ink-upper)]">
              x_n = ⟨{analysis.xNull[0].toFixed(2)}, {analysis.xNull[1].toFixed(2)}⟩
            </span>
          </div>
        </div>

        {/* Codomain Plane R^2 */}
        <div className="lg:col-span-6 p-5 space-y-3 bg-[var(--bg-panel)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              Codomain ℝ²: Column Space 𝒞(A) ⊥ Left Nullspace 𝒩(Aᵀ)
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-4, 4]}
            yRange={[-4, 4]}
            xLabel="b₁"
            yLabel="b₂"
            height={305}
            ariaLabel="Codomain space showing column space and left nullspace"
          >
            {({ toSvgX, toSvgY }) => (
              <g>
                {analysis.rank === 1 && (
                  <>
                    {/* Column space C(A) */}
                    <line
                      x1={toSvgX(-5 * analysis.cHat[0])}
                      y1={toSvgY(-5 * analysis.cHat[1])}
                      x2={toSvgX(5 * analysis.cHat[0])}
                      y2={toSvgY(5 * analysis.cHat[1])}
                      stroke="#96B898"
                      strokeWidth={2.2}
                      strokeOpacity={0.75}
                    />
                    {/* Left Nullspace N(A^T) */}
                    <line
                      x1={toSvgX(-5 * analysis.lnHat[0])}
                      y1={toSvgY(-5 * analysis.lnHat[1])}
                      x2={toSvgX(5 * analysis.lnHat[0])}
                      y2={toSvgY(5 * analysis.lnHat[1])}
                      stroke="#FBEAA4"
                      strokeDasharray="5 4"
                      strokeWidth={1.6}
                      strokeOpacity={0.65}
                    />
                  </>
                )}

                {/* Output vector b = A x = A x_row */}
                <line
                  x1={toSvgX(0)}
                  y1={toSvgY(0)}
                  x2={toSvgX(analysis.ax[0])}
                  y2={toSvgY(analysis.ax[1])}
                  stroke="#D35323"
                  strokeWidth={3.2}
                />
                <circle
                  cx={toSvgX(analysis.ax[0])}
                  cy={toSvgY(analysis.ax[1])}
                  r={5.5}
                  fill="#D35323"
                  stroke="#1E1F22"
                  strokeWidth={1.4}
                />
              </g>
            )}
          </SvgCoordinatePlane2D>

          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono flex flex-wrap justify-between gap-2">
            <span className="text-[var(--math-ink-sweep)] font-semibold">
              Ax = Ax_r = ⟨{analysis.ax[0].toFixed(2)}, {analysis.ax[1].toFixed(2)}⟩
            </span>
            <span className="text-[var(--math-ink-y)]">
              dim 𝒞(A) = {analysis.rank} • dim 𝒩(Aᵀ) = {analysis.nullity}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="border-t border-[var(--border-subtle)] px-6 py-3.5 bg-[var(--bg-canvas)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-tabular-mono text-[var(--math-ink-z)]">
          <Layers className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Fundamental Theorem:</span>
        </div>
        <p className="font-math-serif text-[var(--text-secondary)] flex-1">
          {activePreset.note}
        </p>
      </div>
    </section>
  );
}
