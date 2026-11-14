"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

type Mat2 = [number, number, number, number]; // [a11, a12, a21, a22]

interface SVDPreset {
  id: string;
  label: string;
  matrix: Mat2;
  note: string;
}

const PRESETS: SVDPreset[] = [
  {
    id: "aniso",
    label: "Tilted Ellipsoid",
    matrix: [1.6, 0.9, -0.5, 1.4],
    note: "Non-symmetric full-rank matrix rotating orthogonal inputs (v₁, v₂) into orthogonal ellipse axes (σ₁u₁, σ₂u₂).",
  },
  {
    id: "shear",
    label: "Horizontal Shear",
    matrix: [1.0, 1.3, 0.0, 1.0],
    note: "Shears lack orthogonal eigenvectors, yet SVD cleanly factors shear into rotate → stretch → rotate.",
  },
  {
    id: "rank1",
    label: "Rank-1 Collapse",
    matrix: [1.6, 0.8, 0.8, 0.4],
    note: "Second singular value σ₂ = 0 flattens the unit circle into a 1D segment along σ₁ u₁.",
  },
  {
    id: "reflection",
    label: "Reflection Stretch",
    matrix: [1.5, 0.4, 0.4, -1.2],
    note: "Negative determinant flips orientation in Vᵀ or U while keeping singular values σ₁ ≥ σ₂ ≥ 0 non-negative.",
  },
];

function fmt(n: number, digits = 2): string {
  const clean = Math.abs(n) < 1e-7 ? 0 : n;
  return clean.toFixed(digits);
}

interface SVD2Result {
  sigma1: number;
  sigma2: number;
  v1: [number, number];
  v2: [number, number];
  u1: [number, number];
  u2: [number, number];
  rank1: Mat2;
  energyRatio: number;
}

function solveSVD2x2(m: Mat2): SVD2Result {
  const [a, b, c, d] = m;
  // Form symmetric G = A^T A = [[g00, g01], [g01, g11]]
  const g00 = a * a + c * c;
  const g01 = a * b + c * d;
  const g11 = b * b + d * d;

  const tr = g00 + g11;
  const diff = g00 - g11;
  const disc = Math.sqrt(diff * diff + 4 * g01 * g01);
  const s1sq = Math.max(0, (tr + disc) / 2);
  const s2sq = Math.max(0, (tr - disc) / 2);
  const sigma1 = Math.sqrt(s1sq);
  const sigma2 = Math.sqrt(s2sq);

  // Right singular vectors v1, v2 (eigenvectors of A^T A)
  const theta = Math.abs(g01) < 1e-9 && Math.abs(diff) < 1e-9 ? 0 : 0.5 * Math.atan2(2 * g01, diff);
  const cT = Math.cos(theta);
  const sT = Math.sin(theta);
  const rq = g00 * cT * cT + 2 * g01 * cT * sT + g11 * sT * sT;
  const v1: [number, number] = Math.abs(rq - s1sq) <= 1e-4 ? [cT, sT] : [-sT, cT];
  const v2: [number, number] = [-v1[1], v1[0]];

  // Left singular vectors u1, u2
  const av1: [number, number] = [a * v1[0] + b * v1[1], c * v1[0] + d * v1[1]];
  const av2: [number, number] = [a * v2[0] + b * v2[1], c * v2[0] + d * v2[1]];

  const u1: [number, number] =
    sigma1 > 1e-6 ? [av1[0] / sigma1, av1[1] / sigma1] : [1, 0];

  // Pick u2 orthogonal to u1 aligned with A v2 when sigma2 > 0
  let u2: [number, number] = [-u1[1], u1[0]];
  if (sigma2 > 1e-6) {
    const dotTest = av2[0] * u2[0] + av2[1] * u2[1];
    if (dotTest < 0) {
      u2 = [-u2[0], -u2[1]];
    }
  }

  const rank1: Mat2 = [
    sigma1 * u1[0] * v1[0],
    sigma1 * u1[0] * v1[1],
    sigma1 * u1[1] * v1[0],
    sigma1 * u1[1] * v1[1],
  ];
  const totalEnergy = s1sq + s2sq;
  const energyRatio = totalEnergy > 1e-9 ? s1sq / totalEnergy : 1;

  return { sigma1, sigma2, v1, v2, u1, u2, rank1, energyRatio };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolates a single vector x across the 3 geometric stages of A = U Σ Vᵀ:
 * s in [0, 1]: x -> Vᵀ x (via continuous polar/rotation path)
 * s in [1, 2]: Vᵀ x -> Σ Vᵀ x (axis scaling by σ₁, σ₂)
 * s in [2, 3]: Σ Vᵀ x -> U Σ Vᵀ x = A x (output rotation/reflection)
 */
function evalStagePoint(x: [number, number], svd: SVD2Result, stage: number): [number, number] {
  // Stage 0 coords: x
  // Stage 1 coords (in principal singular coords): c1 = v1·x, c2 = v2·x
  const c1 = svd.v1[0] * x[0] + svd.v1[1] * x[1];
  const c2 = svd.v2[0] * x[0] + svd.v2[1] * x[1];
  const s1Pt: [number, number] = [c1, c2];
  const s2Pt: [number, number] = [svd.sigma1 * c1, svd.sigma2 * c2];
  const s3Pt: [number, number] = [
    svd.u1[0] * s2Pt[0] + svd.u2[0] * s2Pt[1],
    svd.u1[1] * s2Pt[0] + svd.u2[1] * s2Pt[1],
  ];

  if (stage <= 1) {
    return [lerp(x[0], s1Pt[0], stage), lerp(x[1], s1Pt[1], stage)];
  }
  if (stage <= 2) {
    const t = stage - 1;
    return [lerp(s1Pt[0], s2Pt[0], t), lerp(s1Pt[1], s2Pt[1], t)];
  }
  const t = stage - 2;
  return [lerp(s2Pt[0], s3Pt[0], t), lerp(s2Pt[1], s3Pt[1], t)];
}

/**
 * Three-Stage SVD Unit Circle -> Hyperellipse Decomposition Lab (2.3.3).
 * Step through x -> Vᵀx -> ΣVᵀx -> UΣVᵀx with rank-1 outer-product overlay.
 */
export function SVDThreeStageLab() {
  const [matrix, setMatrix] = useState<Mat2>(PRESETS[0].matrix);
  const [activePresetId, setActivePresetId] = useState<string>(PRESETS[0].id);
  const [stage, setStage] = useState<number>(3);
  const [showRank1, setShowRank1] = useState<boolean>(true);

  const svd = useMemo(() => solveSVD2x2(matrix), [matrix]);

  const geometry = useMemo(() => {
    const circlePts: Array<[number, number]> = [];
    const rank1Pts: Array<[number, number]> = [];
    for (let i = 0; i <= 72; i++) {
      const th = (i / 72) * Math.PI * 2;
      const x: [number, number] = [Math.cos(th), Math.sin(th)];
      circlePts.push(evalStagePoint(x, svd, stage));
      rank1Pts.push([
        svd.rank1[0] * x[0] + svd.rank1[1] * x[1],
        svd.rank1[2] * x[0] + svd.rank1[3] * x[1],
      ]);
    }
    const v1Mapped = evalStagePoint(svd.v1, svd, stage);
    const v2Mapped = evalStagePoint(svd.v2, svd, stage);
    return { circlePts, rank1Pts, v1Mapped, v2Mapped };
  }, [svd, stage]);

  const updateEntry = (idx: 0 | 1 | 2 | 3, val: number) => {
    setActivePresetId("custom");
    setMatrix((prev) => {
      const next: Mat2 = [...prev] as Mat2;
      next[idx] = val;
      return next;
    });
  };

  const stageLabel =
    stage < 0.5
      ? "Stage 0: Input Unit Circle (v₁, v₂)"
      : stage < 1.5
      ? "Stage 1: Rotate Input Frame (Vᵀx)"
      : stage < 2.5
      ? "Stage 2: Stretch Principal Axes (Σ Vᵀx)"
      : "Stage 3: Rotate Output Frame (U Σ Vᵀx = Ax)";

  return (
    <div className="space-y-5">
      {/* Control Ribbon */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#28B7B8]">
              Three-Stage SVD Factorization Stepper
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">
              Factor any matrix <KaTeXMath math="A = U\Sigma V^T" /> into input rotation (<KaTeXMath math="V^T" />),
              orthogonal axis stretch (<KaTeXMath math="\Sigma" />), and output rotation (<KaTeXMath math="U" />).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setMatrix(p.matrix);
                  setActivePresetId(p.id);
                }}
                className={`rounded-lg border px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
                  activePresetId === p.id
                    ? "border-[#029091] bg-[#029091]/15 text-[#F6F0D0]"
                    : "border-[#35383F] bg-[#1E1F22] text-[#A2AAB8] hover:border-[#029091]/60 hover:text-[#F6F0D0]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {/* Matrix Editor */}
          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <span className="font-sans text-xs font-semibold text-[#F6F0D0]">Matrix A Entries</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {([0, 1, 2, 3] as const).map((idx) => (
                <label
                  key={idx}
                  className="flex items-center justify-between gap-1.5 rounded border border-[#35383F] bg-[#26282C] px-2 py-1"
                >
                  <span className="font-mono text-[11px] text-[#A2AAB8]">
                    a{idx < 2 ? `₁${idx + 1}` : `₂${idx - 1}`}
                  </span>
                  <input
                    type="number"
                    step={0.1}
                    min={-2.5}
                    max={2.5}
                    value={matrix[idx]}
                    onChange={(e) => updateEntry(idx, parseFloat(e.target.value) || 0)}
                    className="w-14 bg-transparent text-right font-mono text-xs tabular-nums text-[#F6F0D0] focus:outline-none"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* 3-Stage Stepper Controls */}
          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-sans text-xs font-semibold text-[#FBEAA4]">{stageLabel}</span>
              <button
                type="button"
                onClick={() => setShowRank1((s) => !s)}
                className={`rounded border px-2.5 py-0.5 font-sans text-xs font-medium ${
                  showRank1
                    ? "border-[#FBEAA4] bg-[#FBEAA4]/15 text-[#FBEAA4]"
                    : "border-[#35383F] bg-[#26282C] text-[#A2AAB8]"
                }`}
              >
                {showRank1 ? "Hide Rank-1 σ₁u₁v₁ᵀ" : "Show Rank-1 σ₁u₁v₁ᵀ"}
              </button>
            </div>

            <div className="mt-2.5 grid grid-cols-4 gap-2">
              {[
                { val: 0, label: "0. Input I" },
                { val: 1, label: "1. Rotate Vᵀ" },
                { val: 2, label: "2. Stretch Σ" },
                { val: 3, label: "3. Output U" },
              ].map((btn) => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => setStage(btn.val)}
                  className={`rounded border py-1 font-sans text-xs font-medium ${
                    Math.abs(stage - btn.val) < 0.12
                      ? "border-[#029091] bg-[#029091]/20 text-[#F6F0D0]"
                      : "border-[#35383F] bg-[#26282C] text-[#A2AAB8] hover:text-[#F6F0D0]"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <input
              type="range"
              min={0}
              max={3}
              step={0.02}
              value={stage}
              onChange={(e) => setStage(parseFloat(e.target.value))}
              className="mt-2.5 w-full accent-[#029091]"
              aria-label="SVD three-stage scrubber s"
            />
          </div>
        </div>
      </div>

      {/* Main Stage + Spectral Factors */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: Deforming Unit Circle & Orthogonal Basis Vectors */}
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
              Geometric Action <KaTeXMath math="S^1 \longrightarrow A(S^1)" />
            </h3>
            <div className="flex gap-2 font-sans text-[11px]">
              <span className="rounded border border-[#8D9FCE]/50 bg-[#1E1F22] px-2 py-0.5 text-[#8D9FCE]">
                σ₁ axis
              </span>
              <span className="rounded border border-[#96B898]/50 bg-[#1E1F22] px-2 py-0.5 text-[#96B898]">
                σ₂ axis
              </span>
              <span className="rounded border border-[#FBEAA4]/50 bg-[#1E1F22] px-2 py-0.5 text-[#FBEAA4]">
                Rank-1 A₁
              </span>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-3.2, 3.2]}
            yRange={[-3.2, 3.2]}
            width={480}
            height={380}
            xLabel="x"
            yLabel="y"
            ariaLabel="SVD Three-Stage Unit Circle Deformation"
          >
            {({ toSvgX, toSvgY }) => {
              const ox = toSvgX(0);
              const oy = toSvgY(0);
              const curvePath = geometry.circlePts
                .map(([px, py], i) => `${i === 0 ? "M" : "L"}${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`)
                .join(" ");
              const rank1Path = geometry.rank1Pts
                .map(([px, py], i) => `${i === 0 ? "M" : "L"}${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`)
                .join(" ");
              const refUnitPath = Array.from({ length: 73 }, (_, i) => {
                const th = (i / 72) * Math.PI * 2;
                return `${i === 0 ? "M" : "L"}${toSvgX(Math.cos(th)).toFixed(1)},${toSvgY(Math.sin(th)).toFixed(1)}`;
              }).join(" ");

              return (
                <g>
                  {/* Reference unit circle */}
                  <path d={refUnitPath} fill="none" stroke="#4B505C" strokeDasharray="4 4" strokeWidth={1.2} />

                  {/* Optional Rank-1 A_1 image line */}
                  {showRank1 && (
                    <path d={rank1Path} fill="none" stroke="#FBEAA4" strokeWidth={2.5} strokeDasharray="6 4" opacity={0.85} />
                  )}

                  {/* Active transformed circle / ellipse */}
                  <path d={curvePath} fill="#029091" fillOpacity={0.14} stroke="#029091" strokeWidth={2.4} />

                  {/* Mapped orthogonal singular basis pair */}
                  <line
                    x1={ox}
                    y1={oy}
                    x2={toSvgX(geometry.v1Mapped[0])}
                    y2={toSvgY(geometry.v1Mapped[1])}
                    stroke="#8D9FCE"
                    strokeWidth={3}
                  />
                  <circle cx={toSvgX(geometry.v1Mapped[0])} cy={toSvgY(geometry.v1Mapped[1])} r={5} fill="#8D9FCE" />

                  <line
                    x1={ox}
                    y1={oy}
                    x2={toSvgX(geometry.v2Mapped[0])}
                    y2={toSvgY(geometry.v2Mapped[1])}
                    stroke="#96B898"
                    strokeWidth={3}
                  />
                  <circle cx={toSvgX(geometry.v2Mapped[0])} cy={toSvgY(geometry.v2Mapped[1])} r={5} fill="#96B898" />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: Exact U Σ Vᵀ Factors & Low-Rank Energy Readout */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#28B7B8]">
              Exact SVD Matrix Factors
            </p>
            <div className="mt-3 overflow-x-auto text-xs text-[#F6F0D0]">
              <KaTeXMath
                block
                math={`A = \\underbrace{\\begin{bmatrix} ${fmt(svd.u1[0])} & ${fmt(svd.u2[0])} \\\\ ${fmt(svd.u1[1])} & ${fmt(svd.u2[1])} \\end{bmatrix}}_{U} \\underbrace{\\begin{bmatrix} ${fmt(svd.sigma1)} & 0 \\\\ 0 & ${fmt(svd.sigma2)} \\end{bmatrix}}_{\\Sigma} \\underbrace{\\begin{bmatrix} ${fmt(svd.v1[0])} & ${fmt(svd.v1[1])} \\\\ ${fmt(svd.v2[0])} & ${fmt(svd.v2[1])} \\end{bmatrix}}_{V^T}`}
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 font-mono text-xs tabular-nums text-[#D6DAE2]">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#AAA36D]">
              Singular Spectrum & Compression Readout
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#A2AAB8] block">Major Stretch σ₁</span>
                <span className="text-base font-semibold text-[#8D9FCE]">{fmt(svd.sigma1, 3)}</span>
              </div>
              <div>
                <span className="text-[#A2AAB8] block">Minor Stretch σ₂</span>
                <span className="text-base font-semibold text-[#96B898]">{fmt(svd.sigma2, 3)}</span>
              </div>
              <div>
                <span className="text-[#A2AAB8] block">Condition κ(A) = σ₁/σ₂</span>
                <span className="text-sm text-[#EF7547]">
                  {svd.sigma2 > 1e-4 ? fmt(svd.sigma1 / svd.sigma2, 2) : "∞ (Singular)"}
                </span>
              </div>
              <div>
                <span className="text-[#A2AAB8] block">Rank-1 Energy σ₁²/(σ₁²+σ₂²)</span>
                <span className="text-sm text-[#FBEAA4]">{fmt(svd.energyRatio * 100, 1)}%</span>
              </div>
            </div>
            <div className="mt-3 border-t border-[#35383F] pt-2.5 text-[11px] text-[#A2AAB8]">
              Approximation error ‖A − σ₁ u₁ v₁ᵀ‖₂ = σ₂ ={" "}
              <span className="text-[#FBEAA4]">{fmt(svd.sigma2, 3)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
