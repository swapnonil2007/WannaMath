"use client";

import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  createParametricSurfaceMesh,
  createVectorArrow3D,
  extractLevelCurveSegments,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

interface QuadPreset {
  id: string;
  label: string;
  a: number;
  b: number;
  c: number;
  note: string;
}

const PRESETS: QuadPreset[] = [
  {
    id: "pos-def",
    label: "Elliptic Bowl (+,+)",
    a: 1.6,
    b: 0.7,
    c: 1.1,
    note: "Positive definite: λ₁ > 0, λ₂ > 0. Global strict minimum at the origin with elliptical contours.",
  },
  {
    id: "saddle",
    label: "Hyperbolic Saddle (+,−)",
    a: 1.2,
    b: 0.9,
    c: -0.8,
    note: "Indefinite: λ₁ > 0, λ₂ < 0. Curves upward along q₁ and downward along orthogonal q₂.",
  },
  {
    id: "semidef",
    label: "Parabolic Valley (+,0)",
    a: 1.6,
    b: 0.8,
    c: 0.4,
    note: "Positive semidefinite: det(A) = 0 gives λ₂ = 0, creating a flat zero-curvature trough along N(A).",
  },
  {
    id: "neg-def",
    label: "Inverted Dome (−,−)",
    a: -1.4,
    b: -0.5,
    c: -1.1,
    note: "Negative definite: both eigenvalues negative, yielding a concave downward peak.",
  },
];

function fmt(n: number, digits = 2): string {
  const clean = Math.abs(n) < 1e-8 ? 0 : n;
  return clean.toFixed(digits);
}

/**
 * 3D Quadratic Form Surface & Spectral Principal Axis Rotator (2.3.2).
 * Visualizes q(x) = xᵀAx = a x² + 2b xy + c y², spectral factorization A = Q Λ Qᵀ,
 * and decoupled eigen-coordinates q(x) = λ₁ y₁² + λ₂ y₂².
 */
export function QuadraticFormLab() {
  const [a, setA] = useState<number>(PRESETS[0].a);
  const [b, setB] = useState<number>(PRESETS[0].b);
  const [c, setC] = useState<number>(PRESETS[0].c);
  const [activePresetId, setActivePresetId] = useState<string>(PRESETS[0].id);
  const [probe, setProbe] = useState<[number, number]>([1.1, 0.8]);
  const [levelC, setLevelC] = useState<number>(1.5);

  const spectral = useMemo(() => {
    const trace = a + c;
    const det = a * c - b * b;
    const disc = Math.sqrt(Math.max(0, (a - c) * (a - c) + 4 * b * b));
    const l1 = (trace + disc) / 2;
    const l2 = (trace - disc) / 2;

    // Principal angle theta such that Q = [[cosθ, -sinθ], [sinθ, cosθ]] diagonalizes A
    const theta = Math.abs(b) < 1e-8 && Math.abs(a - c) < 1e-8 ? 0 : 0.5 * Math.atan2(2 * b, a - c);
    // Ensure q1 corresponds to l1 and q2 corresponds to l2
    const cT = Math.cos(theta);
    const sT = Math.sin(theta);
    const test1 = a * cT * cT + 2 * b * cT * sT + c * sT * sT;
    const q1: [number, number] = Math.abs(test1 - l1) < 1e-4 ? [cT, sT] : [-sT, cT];
    const q2: [number, number] = [-q1[1], q1[0]];

    let definiteness = "Indefinite (Saddle)";
    let defColor = "#D35323";
    if (l1 > 1e-4 && l2 > 1e-4) {
      definiteness = "Positive Definite (Bowl)";
      defColor = "#029091";
    } else if (l1 < -1e-4 && l2 < -1e-4) {
      definiteness = "Negative Definite (Dome)";
      defColor = "#B95869";
    } else if (Math.abs(l2) <= 1e-4 && l1 > 1e-4) {
      definiteness = "Positive Semidefinite (Valley)";
      defColor = "#96B898";
    } else if (Math.abs(l1) <= 1e-4 && l2 < -1e-4) {
      definiteness = "Negative Semidefinite (Ridge)";
      defColor = "#D5658B";
    } else if (Math.abs(l1) <= 1e-4 && Math.abs(l2) <= 1e-4) {
      definiteness = "Zero Matrix";
      defColor = "#A2AAB8";
    }

    const qVal = a * probe[0] * probe[0] + 2 * b * probe[0] * probe[1] + c * probe[1] * probe[1];
    const y1 = q1[0] * probe[0] + q1[1] * probe[1];
    const y2 = q2[0] * probe[0] + q2[1] * probe[1];

    // Level contours at ±levelC
    const fn = (x: number, y: number) => a * x * x + 2 * b * x * y + c * y * y;
    const segPos = extractLevelCurveSegments(fn, -2.4, 2.4, -2.4, 2.4, Math.abs(levelC), 48, 48);
    const segNeg =
      l2 < -1e-4
        ? extractLevelCurveSegments(fn, -2.4, 2.4, -2.4, 2.4, -Math.abs(levelC), 48, 48)
        : [];

    return { l1, l2, q1, q2, thetaDeg: (Math.atan2(q1[1], q1[0]) * 180) / Math.PI, definiteness, defColor, qVal, y1, y2, det, trace, segPos, segNeg };
  }, [a, b, c, probe, levelC]);

  const applyPreset = (p: QuadPreset) => {
    setA(p.a);
    setB(p.b);
    setC(p.c);
    setActivePresetId(p.id);
  };

  return (
    <div className="space-y-5">
      {/* Control Ribbon */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#28B7B8]">
              Spectral Principal-Axis Diagonalizer
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">
              Any symmetric matrix <KaTeXMath math="A = Q\Lambda Q^T" /> eliminates its{" "}
              <KaTeXMath math="2bxy" /> cross-term in the orthogonal eigenbasis{" "}
              <KaTeXMath math="(\mathbf{q}_1, \mathbf{q}_2)" />.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
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

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#8D9FCE]">
              <span>a (x² weight)</span>
              <span>{fmt(a, 1)}</span>
            </div>
            <input
              type="range"
              min={-2.5}
              max={2.5}
              step={0.1}
              value={a}
              onChange={(e) => {
                setActivePresetId("custom");
                setA(parseFloat(e.target.value));
              }}
              className="mt-2 w-full accent-[#8D9FCE]"
            />
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#EF7547]">
              <span>b (xy coupling)</span>
              <span>{fmt(b, 1)}</span>
            </div>
            <input
              type="range"
              min={-2.0}
              max={2.0}
              step={0.1}
              value={b}
              onChange={(e) => {
                setActivePresetId("custom");
                setB(parseFloat(e.target.value));
              }}
              className="mt-2 w-full accent-[#D35323]"
            />
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#96B898]">
              <span>c (y² weight)</span>
              <span>{fmt(c, 1)}</span>
            </div>
            <input
              type="range"
              min={-2.5}
              max={2.5}
              step={0.1}
              value={c}
              onChange={(e) => {
                setActivePresetId("custom");
                setC(parseFloat(e.target.value));
              }}
              className="mt-2 w-full accent-[#96B898]"
            />
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#FBEAA4]">
              <span>Contour |c₀|</span>
              <span>{fmt(levelC, 1)}</span>
            </div>
            <input
              type="range"
              min={0.4}
              max={4.0}
              step={0.1}
              value={levelC}
              onChange={(e) => setLevelC(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#FBEAA4]"
            />
          </label>
        </div>
      </div>

      {/* Synchronized 3D Surface & 2D Principal Contours */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                3D Quadratic Surface <KaTeXMath math="z = \mathbf{x}^T A \mathbf{x}" />
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Principal curvatures <KaTeXMath math="\lambda_1, \lambda_2" /> follow the orthogonal eigenvectors{" "}
                <KaTeXMath math="\mathbf{q}_1, \mathbf{q}_2" />.
              </p>
            </div>
            <span
              className="rounded border px-2 py-0.5 font-sans text-[11px] font-semibold"
              style={{ borderColor: spectral.defColor, color: spectral.defColor }}
            >
              {spectral.definiteness}
            </span>
          </div>

          <ThreeOrbitViewport
            heightClassName="h-[360px]"
            cameraPosition={[4.6, 3.6, 4.6]}
            cameraTarget={[0, 0.2, 0]}
            titleBadge="q(x, y) Surface"
            sceneDeps={[a, b, c, spectral.q1, spectral.q2, probe]}
            onBuildScene={(group) => {
              const scaleZ = 0.28;
              const surface = createParametricSurfaceMesh(
                (x, y) => [x, y, Math.max(-3.0, Math.min(3.0, (a * x * x + 2 * b * x * y + c * y * y) * scaleZ))],
                [-1.8, 1.8],
                [-1.8, 1.8],
                28,
                28,
                {
                  color: 0x029091,
                  opacity: 0.65,
                  wireframeColor: 0xfbeaa4,
                  wireframeOpacity: 0.22,
                  showWireframe: true,
                }
              );
              group.add(surface);

              // Orthogonal principal eigenvector arrows in xy plane
              group.add(createVectorArrow3D([0, 0, 0], [spectral.q1[0] * 1.8, spectral.q1[1] * 1.8, 0], 0x8d9fce));
              group.add(createVectorArrow3D([0, 0, 0], [spectral.q2[0] * 1.8, spectral.q2[1] * 1.8, 0], 0x96b898));

              // Probe vertical stem from xy-plane to surface
              const zProbe = Math.max(
                -3.0,
                Math.min(3.0, (a * probe[0] * probe[0] + 2 * b * probe[0] * probe[1] + c * probe[1] * probe[1]) * scaleZ)
              );
              const stemMat = new THREE.LineBasicMaterial({ color: 0xd35323 });
              const stemGeom = new THREE.BufferGeometry().setFromPoints([
                mathToThreeVec3(probe[0], probe[1], 0),
                mathToThreeVec3(probe[0], probe[1], zProbe),
              ]);
              group.add(new THREE.Line(stemGeom, stemMat));
            }}
            footerSlot={
              <div className="flex justify-between font-mono text-xs text-[#A2AAB8]">
                <span className="text-[#8D9FCE]">q₁ (λ₁={fmt(spectral.l1)})</span>
                <span className="text-[#96B898]">q₂ (λ₂={fmt(spectral.l2)})</span>
                <span className="text-[#FBEAA4]">θ = {fmt(spectral.thetaDeg, 1)}°</span>
              </div>
            }
          />
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                2D Level Contours & Principal Frame <KaTeXMath math="Q = [\mathbf{q}_1 \mid \mathbf{q}_2]" />
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Click anywhere to inspect <KaTeXMath math="q(\mathbf{x}) = \lambda_1 y_1^2 + \lambda_2 y_2^2" />.
              </p>
            </div>
            <span className="rounded border border-[#D35323]/50 bg-[#1E1F22] px-2 py-0.5 font-mono text-xs tabular-nums text-[#FBEAA4]">
              q(x) = {fmt(spectral.qVal, 2)}
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-2.5, 2.5]}
            yRange={[-2.5, 2.5]}
            width={480}
            height={360}
            xLabel="x₁"
            yLabel="x₂"
            ariaLabel="2D Quadratic Form Contours"
            onSelectPoint={(x, y) => setProbe([Math.round(x * 10) / 10, Math.round(y * 10) / 10])}
          >
            {({ toSvgX, toSvgY }) => (
              <g>
                {/* Principal axis rays */}
                <line
                  x1={toSvgX(-spectral.q1[0] * 2.4)}
                  y1={toSvgY(-spectral.q1[1] * 2.4)}
                  x2={toSvgX(spectral.q1[0] * 2.4)}
                  y2={toSvgY(spectral.q1[1] * 2.4)}
                  stroke="#8D9FCE"
                  strokeWidth={1.6}
                  strokeDasharray="6 4"
                />
                <line
                  x1={toSvgX(-spectral.q2[0] * 2.4)}
                  y1={toSvgY(-spectral.q2[1] * 2.4)}
                  x2={toSvgX(spectral.q2[0] * 2.4)}
                  y2={toSvgY(spectral.q2[1] * 2.4)}
                  stroke="#96B898"
                  strokeWidth={1.6}
                  strokeDasharray="6 4"
                />

                {/* Positive level contours q = +c0 */}
                {spectral.segPos.map((seg, i) => (
                  <line
                    key={`p-${i}`}
                    x1={toSvgX(seg.x1)}
                    y1={toSvgY(seg.y1)}
                    x2={toSvgX(seg.x2)}
                    y2={toSvgY(seg.y2)}
                    stroke="#029091"
                    strokeWidth={2}
                  />
                ))}

                {/* Negative level contours q = -c0 when indefinite/negative */}
                {spectral.segNeg.map((seg, i) => (
                  <line
                    key={`n-${i}`}
                    x1={toSvgX(seg.x1)}
                    y1={toSvgY(seg.y1)}
                    x2={toSvgX(seg.x2)}
                    y2={toSvgY(seg.y2)}
                    stroke="#B95869"
                    strokeWidth={2}
                  />
                ))}

                {/* Unit eigenvectors q1, q2 */}
                <line
                  x1={toSvgX(0)}
                  y1={toSvgY(0)}
                  x2={toSvgX(spectral.q1[0])}
                  y2={toSvgY(spectral.q1[1])}
                  stroke="#8D9FCE"
                  strokeWidth={2.8}
                />
                <line
                  x1={toSvgX(0)}
                  y1={toSvgY(0)}
                  x2={toSvgX(spectral.q2[0])}
                  y2={toSvgY(spectral.q2[1])}
                  stroke="#96B898"
                  strokeWidth={2.8}
                />

                {/* Probe point */}
                <circle
                  cx={toSvgX(probe[0])}
                  cy={toSvgY(probe[1])}
                  r={6.5}
                  fill="#D35323"
                  stroke="#F6F0D0"
                  strokeWidth={1.8}
                />
                <text
                  x={toSvgX(probe[0]) + 8}
                  y={toSvgY(probe[1]) - 8}
                  fill="#FBEAA4"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  ({fmt(probe[0], 1)}, {fmt(probe[1], 1)})
                </text>
              </g>
            )}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Decoupled Spectral Equation Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#8D9FCE]">
            Coupled Cartesian Form vs. Diagonalized Form
          </p>
          <div className="mt-2 space-y-2 text-sm text-[#F6F0D0]">
            <KaTeXMath
              block
              math={`q(x,y) = ${fmt(a, 1)}x^2 ${b >= 0 ? "+" : "-"} ${fmt(2 * Math.abs(b), 1)}xy ${c >= 0 ? "+" : "-"} ${fmt(Math.abs(c), 1)}y^2`}
            />
            <KaTeXMath
              block
              math={`q(\\mathbf{y}) = \\color{#8D9FCE}{${fmt(spectral.l1, 2)}\\,y_1^2} ${spectral.l2 >= 0 ? "+" : "-"} \\color{#96B898}{${fmt(Math.abs(spectral.l2), 2)}\\,y_2^2}`}
            />
          </div>
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 font-mono text-xs tabular-nums text-[#D6DAE2]">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#28B7B8]">
            Live Eigen-Coordinate Equivalence Check
          </p>
          <div className="mt-2.5 space-y-1.5">
            <div>
              x = [{fmt(probe[0], 2)}, {fmt(probe[1], 2)}]ᵀ &nbsp;→&nbsp; y = Qᵀx = [{fmt(spectral.y1, 3)},{" "}
              {fmt(spectral.y2, 3)}]ᵀ
            </div>
            <div>
              Cartesian xᵀAx = <span className="text-[#FBEAA4]">{fmt(spectral.qVal, 4)}</span>
            </div>
            <div>
              Spectral λ₁y₁² + λ₂y₂² ={" "}
              <span className="text-[#28B7B8]">
                {fmt(spectral.l1 * spectral.y1 * spectral.y1 + spectral.l2 * spectral.y2 * spectral.y2, 4)}
              </span>
            </div>
            <div>
              Principal Rotation θ = <span className="text-[#8D9FCE]">{fmt(spectral.thetaDeg, 2)}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
