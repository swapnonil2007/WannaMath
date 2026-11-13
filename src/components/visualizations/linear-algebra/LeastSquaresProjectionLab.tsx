"use client";

import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  createParametricSurfaceMesh,
  createVectorArrow3D,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

type Point2D = { t: number; y: number };

interface RegressionPreset {
  id: string;
  label: string;
  description: string;
  points: [Point2D, Point2D, Point2D];
}

const PRESETS: RegressionPreset[] = [
  {
    id: "linear-noisy",
    label: "Noisy Linear Trend",
    description: "Three nearly collinear sensor samples in (t, y) projected onto the 2D column space plane C(A).",
    points: [
      { t: -1.5, y: -0.6 },
      { t: 0.0, y: 1.2 },
      { t: 1.5, y: 2.1 },
    ],
  },
  {
    id: "flat-offset",
    label: "Symmetric Residual",
    description: "Symmetric bow around y = 1 where the best-fit slope is zero and residual e is purely vertical curvature.",
    points: [
      { t: -1.5, y: 0.4 },
      { t: 0.0, y: 2.2 },
      { t: 1.5, y: 0.4 },
    ],
  },
  {
    id: "exact-collinear",
    label: "Exact Hit (b ∈ C(A))",
    description: "All three samples lie on y = 0.5 + 0.8t, so b sits inside C(A) and the residual e vanishes.",
    points: [
      { t: -1.5, y: -0.7 },
      { t: 0.0, y: 0.5 },
      { t: 1.5, y: 1.7 },
    ],
  },
  {
    id: "negative-slope",
    label: "Decaying Response",
    description: "Negative slope trend demonstrating orthogonal shadow p = A x̂ minimizing ‖b - p‖₂².",
    points: [
      { t: -1.2, y: 2.3 },
      { t: 0.2, y: 0.6 },
      { t: 1.6, y: -0.9 },
    ],
  },
];

function fmt(n: number, digits = 2): string {
  const clean = Math.abs(n) < 1e-9 ? 0 : n;
  return clean.toFixed(digits);
}

/**
 * Synchronized 3D Column-Space Orthogonal Projection + 2D Least-Squares Line Fit Lab.
 * Connects 3 data pairs (t_i, y_i) directly to the overdetermined system A x = b in R^3,
 * normal equations A^T A x_hat = A^T b, projection p = A x_hat, and residual e = b - p.
 */
export function LeastSquaresProjectionLab() {
  const [points, setPoints] = useState<[Point2D, Point2D, Point2D]>(PRESETS[0].points);
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const [activePresetId, setActivePresetId] = useState<string>(PRESETS[0].id);

  const solve = useMemo(() => {
    // Design matrix A = [1, t_i] of size 3x2, b = [y_1, y_2, y_3]^T
    const a1: [number, number, number] = [1, 1, 1];
    const a2: [number, number, number] = [points[0].t, points[1].t, points[2].t];
    const b: [number, number, number] = [points[0].y, points[1].y, points[2].y];

    const ata00 = a1[0] * a1[0] + a1[1] * a1[1] + a1[2] * a1[2]; // 3
    const ata01 = a1[0] * a2[0] + a1[1] * a2[1] + a1[2] * a2[2]; // sum t_i
    const ata11 = a2[0] * a2[0] + a2[1] * a2[1] + a2[2] * a2[2]; // sum t_i^2

    const atb0 = a1[0] * b[0] + a1[1] * b[1] + a1[2] * b[2]; // sum y_i
    const atb1 = a2[0] * b[0] + a2[1] * b[1] + a2[2] * b[2]; // sum t_i y_i

    const detAtA = ata00 * ata11 - ata01 * ata01;
    const singular = Math.abs(detAtA) < 1e-6;

    const cHat = singular ? atb0 / ata00 : (atb0 * ata11 - atb1 * ata01) / detAtA;
    const dHat = singular ? 0 : (ata00 * atb1 - ata01 * atb0) / detAtA;

    const p: [number, number, number] = [
      cHat + dHat * a2[0],
      cHat + dHat * a2[1],
      cHat + dHat * a2[2],
    ];
    const e: [number, number, number] = [b[0] - p[0], b[1] - p[1], b[2] - p[2]];

    const sse = e[0] * e[0] + e[1] * e[1] + e[2] * e[2];
    const rmse = Math.sqrt(sse / 3);
    const normE = Math.sqrt(sse);

    const dotA1E = a1[0] * e[0] + a1[1] * e[1] + a1[2] * e[2];
    const dotA2E = a2[0] * e[0] + a2[1] * e[1] + a2[2] * e[2];
    const dotPE = p[0] * e[0] + p[1] * e[1] + p[2] * e[2];
    const orthoResidualNorm = Math.hypot(dotA1E, dotA2E);

    return {
      a1,
      a2,
      b,
      ata00,
      ata01,
      ata11,
      atb0,
      atb1,
      detAtA,
      singular,
      cHat,
      dHat,
      p,
      e,
      sse,
      rmse,
      normE,
      dotA1E,
      dotA2E,
      dotPE,
      orthoResidualNorm,
    };
  }, [points]);

  const applyPreset = (preset: RegressionPreset) => {
    setPoints([
      { ...preset.points[0] },
      { ...preset.points[1] },
      { ...preset.points[2] },
    ]);
    setActivePresetId(preset.id);
  };

  const updatePoint = (index: number, patch: Partial<Point2D>) => {
    setActivePresetId("custom");
    setPoints((prev) => {
      const next: [Point2D, Point2D, Point2D] = [{ ...prev[0] }, { ...prev[1] }, { ...prev[2] }];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handlePlaneClick = (tVal: number, yVal: number) => {
    const clampedT = Math.max(-2.2, Math.min(2.2, Math.round(tVal * 10) / 10));
    const clampedY = Math.max(-2.5, Math.min(2.8, Math.round(yVal * 10) / 10));
    updatePoint(activeIndex, { t: clampedT, y: clampedY });
  };

  return (
    <div className="space-y-5">
      {/* Control Ribbon */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#AAA36D]">
              Least-Squares & Column-Space Geometry
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">
              Fit <KaTeXMath math="y = c + d\,t" /> to three observations in 2D and watch the target vector{" "}
              <KaTeXMath math="\mathbf{b} \in \mathbb{R}^3" /> project orthogonally onto{" "}
              <KaTeXMath math="C(A) = \text{span}(\mathbf{1}, \mathbf{t})" />.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => {
              const active = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`rounded-lg border px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
                    active
                      ? "border-[#8D9FCE] bg-[#8D9FCE]/15 text-[#F6F0D0]"
                      : "border-[#35383F] bg-[#1E1F22] text-[#A2AAB8] hover:border-[#8D9FCE]/60 hover:text-[#F6F0D0]"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sample Point Editors */}
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {points.map((pt, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                  isSelected
                    ? "border-[#D35323] bg-[#1E1F22]"
                    : "border-[#35383F] bg-[#1E1F22]/70 hover:border-[#8D9FCE]/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-semibold text-[#F6F0D0]">
                    Sample #{idx + 1} {isSelected ? "(Click Canvas Target)" : ""}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-[#FBEAA4]">
                    ({fmt(pt.t, 1)}, {fmt(pt.y, 1)})
                  </span>
                </div>
                <div className="mt-2.5 space-y-2">
                  <label className="flex items-center justify-between gap-2 font-sans text-xs text-[#A2AAB8]">
                    <span className="w-14 font-mono text-[#8D9FCE]">t_{idx + 1} = {fmt(pt.t, 1)}</span>
                    <input
                      type="range"
                      min={-2.2}
                      max={2.2}
                      step={0.1}
                      value={pt.t}
                      onChange={(ev) => updatePoint(idx, { t: parseFloat(ev.target.value) })}
                      className="w-full accent-[#8D9FCE]"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 font-sans text-xs text-[#A2AAB8]">
                    <span className="w-14 font-mono text-[#D5658B]">y_{idx + 1} = {fmt(pt.y, 1)}</span>
                    <input
                      type="range"
                      min={-2.5}
                      max={2.8}
                      step={0.1}
                      value={pt.y}
                      onChange={(ev) => updatePoint(idx, { y: parseFloat(ev.target.value) })}
                      className="w-full accent-[#D5658B]"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Synchronized Dual Viewport: 3D Subspace Projection + 2D Regression Line */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* 3D Subspace Projection Stage */}
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                3D Column Space <KaTeXMath math="C(A) \subset \mathbb{R}^3" />
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Orthogonal shadow <KaTeXMath math="\mathbf{p} = A\hat{\mathbf{x}}" /> minimizes residual distance{" "}
                <KaTeXMath math="\|\mathbf{b} - \mathbf{p}\|_2" />.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 font-sans text-[11px]">
              <span className="rounded border border-[#8D9FCE]/50 bg-[#1E1F22] px-2 py-0.5 text-[#8D9FCE]">
                b (target)
              </span>
              <span className="rounded border border-[#029091]/50 bg-[#1E1F22] px-2 py-0.5 text-[#029091]">
                p = Ax̂
              </span>
              <span className="rounded border border-[#D35323]/50 bg-[#1E1F22] px-2 py-0.5 text-[#D35323]">
                e = b − p
              </span>
            </div>
          </div>

          <ThreeOrbitViewport
            heightClassName="h-[360px]"
            cameraPosition={[4.8, 3.8, 5.2]}
            cameraTarget={[0.2, 0.4, 0.2]}
            titleBadge="R³ Projection Geometry"
            sceneDeps={[solve]}
            onBuildScene={(group) => {
              // Normalize vectors slightly for clean framing if coordinates are large
              const maxCoord = Math.max(
                2.5,
                ...solve.b.map(Math.abs),
                ...solve.p.map(Math.abs),
                ...solve.a2.map(Math.abs)
              );
              const s = maxCoord > 3.2 ? 3.2 / maxCoord : 1;

              // Orthonormalize span(a1, a2) to draw the C(A) plane cleanly
              const a1v = new THREE.Vector3(solve.a1[0], solve.a1[1], solve.a1[2]);
              const u1 = a1v.clone().normalize();
              const a2v = new THREE.Vector3(solve.a2[0], solve.a2[1], solve.a2[2]);
              const projA2 = u1.clone().multiplyScalar(a2v.dot(u1));
              let u2 = a2v.clone().sub(projA2);
              if (u2.length() < 1e-4) {
                u2 = new THREE.Vector3(1, -1, 0).normalize();
              } else {
                u2.normalize();
              }

              // Render C(A) plane patch
              const planeMesh = createParametricSurfaceMesh(
                (alpha, beta) => [
                  (alpha * u1.x + beta * u2.x) * s,
                  (alpha * u1.y + beta * u2.y) * s,
                  (alpha * u1.z + beta * u2.z) * s,
                ],
                [-2.8, 2.8],
                [-2.8, 2.8],
                8,
                8,
                {
                  color: 0x029091,
                  opacity: 0.2,
                  wireframeColor: 0x96b898,
                  wireframeOpacity: 0.28,
                  showWireframe: true,
                }
              );
              group.add(planeMesh);

              // Basis columns a1 and a2 scaled
              group.add(
                createVectorArrow3D(
                  [0, 0, 0],
                  [solve.a1[0] * s, solve.a1[1] * s, solve.a1[2] * s],
                  0xaaa36d
                )
              );
              if (Math.hypot(...solve.a2) > 0.05) {
                group.add(
                  createVectorArrow3D(
                    [0, 0, 0],
                    [solve.a2[0] * s, solve.a2[1] * s, solve.a2[2] * s],
                    0x96b898
                  )
                );
              }

              // Target vector b
              group.add(
                createVectorArrow3D(
                  [0, 0, 0],
                  [solve.b[0] * s, solve.b[1] * s, solve.b[2] * s],
                  0x8d9fce
                )
              );

              // Orthogonal projection vector p = A x_hat
              group.add(
                createVectorArrow3D(
                  [0, 0, 0],
                  [solve.p[0] * s, solve.p[1] * s, solve.p[2] * s],
                  0x029091
                )
              );

              // Residual vector e = b - p starting from tip of p to tip of b
              const pScaled: [number, number, number] = [
                solve.p[0] * s,
                solve.p[1] * s,
                solve.p[2] * s,
              ];
              const eScaled: [number, number, number] = [
                solve.e[0] * s,
                solve.e[1] * s,
                solve.e[2] * s,
              ];
              if (Math.hypot(...solve.e) > 0.04) {
                group.add(createVectorArrow3D(pScaled, eScaled, 0xd35323));

                // Right-angle corner marker at tip of p between p/plane and e
                const pVec = mathToThreeVec3(pScaled[0], pScaled[1], pScaled[2]);
                const eDir = mathToThreeVec3(eScaled[0], eScaled[1], eScaled[2]).normalize();
                const inPlaneDir = mathToThreeVec3(u1.x, u1.y, u1.z);
                const cornerScale = 0.22;
                const c1 = pVec.clone().addScaledVector(inPlaneDir, -cornerScale);
                const c2 = c1.clone().addScaledVector(eDir, cornerScale);
                const c3 = pVec.clone().addScaledVector(eDir, cornerScale);
                const cornerGeom = new THREE.BufferGeometry().setFromPoints([c1, c2, c3]);
                const cornerLine = new THREE.Line(
                  cornerGeom,
                  new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                );
                group.add(cornerLine);
              }
            }}
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#A2AAB8]">
                <span>
                  <span className="text-[#AAA36D]">a₁=[1,1,1]ᵀ</span>{" "}
                  <span className="text-[#96B898]">a₂=t</span>
                </span>
                <span className="tabular-nums text-[#FBEAA4]">
                  ‖e‖₂ = {fmt(solve.normE, 3)} | p·e = {fmt(solve.dotPE, 4)}
                </span>
              </div>
            }
          />
        </div>

        {/* 2D Data Space & Best-Fit Line */}
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                2D Data Space & Least-Squares Line{" "}
                <KaTeXMath math={`\\hat{y} = ${fmt(solve.cHat)} ${solve.dHat >= 0 ? "+" : "-"} ${fmt(Math.abs(solve.dHat))}\\,t`} />
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Click anywhere on the plane to move Sample #{activeIndex + 1}; vertical segments equal{" "}
                <KaTeXMath math="e_i = y_i - \hat{y}_i" />.
              </p>
            </div>
            <span className="rounded border border-[#FBEAA4]/40 bg-[#1E1F22] px-2 py-0.5 font-mono text-xs tabular-nums text-[#FBEAA4]">
              SSE = {fmt(solve.sse, 3)}
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-2.6, 2.6]}
            yRange={[-2.8, 3.2]}
            width={500}
            height={360}
            xLabel="t"
            yLabel="y"
            ariaLabel="2D Least-Squares Regression Plane"
            onSelectPoint={handlePlaneClick}
          >
            {({ toSvgX, toSvgY }) => {
              const tStart = -2.5;
              const tEnd = 2.5;
              const yStart = solve.cHat + solve.dHat * tStart;
              const yEnd = solve.cHat + solve.dHat * tEnd;

              return (
                <g>
                  {/* Best-fit regression line */}
                  <line
                    x1={toSvgX(tStart)}
                    y1={toSvgY(yStart)}
                    x2={toSvgX(tEnd)}
                    y2={toSvgY(yEnd)}
                    stroke="#029091"
                    strokeWidth={2.5}
                  />

                  {/* Residual bars & sample markers */}
                  {points.map((pt, idx) => {
                    const yHat = solve.p[idx];
                    const err = solve.e[idx];
                    const sx = toSvgX(pt.t);
                    const syData = toSvgY(pt.y);
                    const syFit = toSvgY(yHat);
                    const isSelected = activeIndex === idx;

                    return (
                      <g key={idx}>
                        {/* Vertical residual segment */}
                        <line
                          x1={sx}
                          y1={syData}
                          x2={sx}
                          y2={syFit}
                          stroke="#D35323"
                          strokeWidth={2.2}
                          strokeDasharray="4 3"
                        />
                        {/* Projected point on line */}
                        <circle
                          cx={sx}
                          cy={syFit}
                          r={4}
                          fill="#029091"
                          stroke="#1E1F22"
                          strokeWidth={1.5}
                        />
                        {/* Sample point */}
                        <circle
                          cx={sx}
                          cy={syData}
                          r={isSelected ? 7.5 : 6}
                          fill={isSelected ? "#D5658B" : "#8D9FCE"}
                          stroke="#F6F0D0"
                          strokeWidth={isSelected ? 2.2 : 1.5}
                        />
                        <text
                          x={sx + 9}
                          y={syData - 7}
                          fill="#F6F0D0"
                          fontSize="11"
                          fontFamily="monospace"
                        >
                          P{idx + 1} (e={fmt(err, 2)})
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Live Normal Equations & Orthogonality Verification */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#8D9FCE]">
            1. Normal Equations Matrix
          </p>
          <div className="mt-2 overflow-x-auto text-sm text-[#F6F0D0]">
            <KaTeXMath
              block
              math={`\\begin{bmatrix} ${fmt(solve.ata00, 0)} & ${fmt(solve.ata01, 2)} \\\\ ${fmt(solve.ata01, 2)} & ${fmt(solve.ata11, 2)} \\end{bmatrix} \\begin{bmatrix} c \\\\ d \\end{bmatrix} = \\begin{bmatrix} ${fmt(solve.atb0, 2)} \\\\ ${fmt(solve.atb1, 2)} \\end{bmatrix}`}
            />
          </div>
          {solve.singular && (
            <p className="mt-2 font-sans text-xs text-[#B95869]">
              All tᵢ are identical — columns of A are linearly dependent; slope d is underdetermined.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#029091]">
            2. Optimal Solution & Projection
          </p>
          <div className="mt-2 space-y-1.5 font-mono text-xs tabular-nums text-[#D6DAE2]">
            <div>
              <span className="text-[#029091]">x̂ = [c, d]ᵀ</span> = [{fmt(solve.cHat, 3)}, {fmt(solve.dHat, 3)}]ᵀ
            </div>
            <div>
              <span className="text-[#029091]">p = A x̂</span> = [{fmt(solve.p[0], 2)}, {fmt(solve.p[1], 2)},{" "}
              {fmt(solve.p[2], 2)}]ᵀ
            </div>
            <div>
              <span className="text-[#D35323]">e = b − p</span> = [{fmt(solve.e[0], 2)}, {fmt(solve.e[1], 2)},{" "}
              {fmt(solve.e[2], 2)}]ᵀ
            </div>
            <div className="pt-1 text-[#FBEAA4]">
              RMSE = {fmt(solve.rmse, 3)} | ‖e‖₂² = {fmt(solve.sse, 3)}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#D35323]">
            3. Left-Nullspace Orthogonality
          </p>
          <p className="mt-1 font-serif text-xs text-[#A2AAB8]">
            Since <KaTeXMath math="\mathbf{e} \in N(A^T) = C(A)^\perp" />, every column dot product with{" "}
            <KaTeXMath math="\mathbf{e}" /> vanishes identically:
          </p>
          <div className="mt-2 space-y-1 font-mono text-xs tabular-nums text-[#F6F0D0]">
            <div>
              a₁ᵀ e = ∑ eᵢ = <span className="text-[#96B898]">{fmt(solve.dotA1E, 5)}</span>
            </div>
            <div>
              a₂ᵀ e = ∑ tᵢ eᵢ = <span className="text-[#96B898]">{fmt(solve.dotA2E, 5)}</span>
            </div>
            <div>
              ‖Aᵀ e‖₂ = <span className="text-[#FBEAA4]">{fmt(solve.orthoResidualNorm, 6)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
