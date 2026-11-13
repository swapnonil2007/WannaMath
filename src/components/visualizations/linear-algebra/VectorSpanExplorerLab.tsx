"use client";

import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { Compass, Layers, AlertTriangle, CheckCircle2 } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  mathToThreeVec3,
  createVectorArrow3D,
  createParametricSurfaceMesh,
} from "@/components/visualizations/primitives";

type DimMode = "2d" | "3d";

interface SpanPreset2D {
  id: string;
  label: string;
  v1: [number, number];
  v2: [number, number];
  c1: number;
  c2: number;
  note: string;
}

interface SpanPreset3D {
  id: string;
  label: string;
  v1: [number, number, number];
  v2: [number, number, number];
  v3: [number, number, number];
  c1: number;
  c2: number;
  c3: number;
  note: string;
}

const PRESETS_2D: SpanPreset2D[] = [
  {
    id: "oblique-basis",
    label: "Independent Pair (ℝ²)",
    v1: [1.8, 0.5],
    v2: [0.4, 1.5],
    c1: 1.0,
    c2: 1.2,
    note: "Non-parallel vectors v₁ and v₂ have nonzero determinant, so every point b ∈ ℝ² can be reached by a unique (c₁, c₂).",
  },
  {
    id: "collinear-collapse",
    label: "Collinear Collapse (Line)",
    v1: [1.4, 0.7],
    v2: [-1.0, -0.5],
    c1: 1.2,
    c2: 0.6,
    note: "Here v₂ = -0.714 v₁ lies on the same line through the origin: det = 0 and span{v₁, v₂} collapses to a 1D line.",
  },
  {
    id: "orthogonal-frame",
    label: "Orthogonal Frame",
    v1: [1.5, 0.0],
    v2: [0.0, 1.5],
    c1: 1.4,
    c2: -0.9,
    note: "Mutually perpendicular basis vectors eliminate cross-coupling so c₁ and c₂ act independently along horizontal and vertical axes.",
  },
];

const PRESETS_3D: SpanPreset3D[] = [
  {
    id: "span-r3",
    label: "Full ℝ³ Basis (Rank 3)",
    v1: [1.6, 0.3, 0.2],
    v2: [0.2, 1.5, 0.4],
    v3: [0.1, -0.3, 1.5],
    c1: 0.9,
    c2: 0.8,
    c3: 0.9,
    note: "Because v₃ lifts vertically out of the teal span{v₁, v₂} plane, the triple product det[v₁ v₂ v₃] ≠ 0 and {v₁, v₂, v₃} fills all 3D space.",
  },
  {
    id: "coplanar-collapse",
    label: "Coplanar Plane (Rank 2)",
    v1: [1.4, 0.5, 0.4],
    v2: [-0.5, 1.3, 0.6],
    v3: [0.9, 1.8, 1.0],
    c1: 1.0,
    c2: 0.8,
    c3: 0.5,
    note: "Notice v₃ = v₁ + v₂ lies directly inside the teal plane span{v₁, v₂}! All combinations c₁v₁ + c₂v₂ + c₃v₃ remain trapped on that 2D plane.",
  },
  {
    id: "line-collapse-3d",
    label: "1D Line Collapse (Rank 1)",
    v1: [1.2, 0.9, 0.6],
    v2: [-0.8, -0.6, -0.4],
    v3: [0.4, 0.3, 0.2],
    c1: 1.0,
    c2: -0.5,
    c3: 0.5,
    note: "All three vectors are scalar multiples of ⟨1.2, 0.9, 0.6⟩, collapsing 3D span down to a single line through the origin.",
  },
];

function det3(a: [number, number, number], b: [number, number, number], c: [number, number, number]) {
  return (
    a[0] * (b[1] * c[2] - b[2] * c[1]) -
    a[1] * (b[0] * c[2] - b[2] * c[0]) +
    a[2] * (b[0] * c[1] - b[1] * c[0])
  );
}

export function VectorSpanExplorerLab() {
  const [dimMode, setDimMode] = useState<DimMode>("2d");

  // 2D state
  const [preset2dId, setPreset2dId] = useState<string>("oblique-basis");
  const [v1_2d, setV1_2d] = useState<[number, number]>(PRESETS_2D[0].v1);
  const [v2_2d, setV2_2d] = useState<[number, number]>(PRESETS_2D[0].v2);
  const [c1_2d, setC1_2d] = useState<number>(PRESETS_2D[0].c1);
  const [c2_2d, setC2_2d] = useState<number>(PRESETS_2D[0].c2);
  const [clickedTarget, setClickedTarget] = useState<[number, number] | null>(null);

  // 3D state
  const [preset3dId, setPreset3dId] = useState<string>("span-r3");
  const [v1_3d, setV1_3d] = useState<[number, number, number]>(PRESETS_3D[0].v1);
  const [v2_3d, setV2_3d] = useState<[number, number, number]>(PRESETS_3D[0].v2);
  const [v3_3d, setV3_3d] = useState<[number, number, number]>(PRESETS_3D[0].v3);
  const [c1_3d, setC1_3d] = useState<number>(PRESETS_3D[0].c1);
  const [c2_3d, setC2_3d] = useState<number>(PRESETS_3D[0].c2);
  const [c3_3d, setC3_3d] = useState<number>(PRESETS_3D[0].c3);

  const stats2d = useMemo(() => {
    const det = v1_2d[0] * v2_2d[1] - v1_2d[1] * v2_2d[0];
    const norm1 = Math.hypot(v1_2d[0], v1_2d[1]);
    const norm2 = Math.hypot(v2_2d[0], v2_2d[1]);
    const rank =
      Math.abs(det) > 1e-3 ? 2 : norm1 > 1e-3 || norm2 > 1e-3 ? 1 : 0;
    const w: [number, number] = [
      c1_2d * v1_2d[0] + c2_2d * v2_2d[0],
      c1_2d * v1_2d[1] + c2_2d * v2_2d[1],
    ];
    const scaled1: [number, number] = [c1_2d * v1_2d[0], c1_2d * v1_2d[1]];
    const scaled2: [number, number] = [c2_2d * v2_2d[0], c2_2d * v2_2d[1]];

    // Closest / solved target check if user clicked a point b
    let targetReachable = true;
    if (clickedTarget && rank === 1) {
      const ref = norm1 >= norm2 ? v1_2d : v2_2d;
      const refLen = Math.hypot(ref[0], ref[1]) || 1;
      const cross = Math.abs(ref[0] * clickedTarget[1] - ref[1] * clickedTarget[0]) / refLen;
      targetReachable = cross < 0.08;
    }

    return { det, rank, w, scaled1, scaled2, targetReachable };
  }, [v1_2d, v2_2d, c1_2d, c2_2d, clickedTarget]);

  const stats3d = useMemo(() => {
    const tripleDet = det3(v1_3d, v2_3d, v3_3d);
    const cross12: [number, number, number] = [
      v1_3d[1] * v2_3d[2] - v1_3d[2] * v2_3d[1],
      v1_3d[2] * v2_3d[0] - v1_3d[0] * v2_3d[2],
      v1_3d[0] * v2_3d[1] - v1_3d[1] * v2_3d[0],
    ];
    const crossMag = Math.hypot(cross12[0], cross12[1], cross12[2]);
    const rank =
      Math.abs(tripleDet) > 1e-2
        ? 3
        : crossMag > 1e-2 ||
          Math.hypot(
            v1_3d[1] * v3_3d[2] - v1_3d[2] * v3_3d[1],
            v1_3d[2] * v3_3d[0] - v1_3d[0] * v3_3d[2],
            v1_3d[0] * v3_3d[1] - v1_3d[1] * v3_3d[0]
          ) > 1e-2
        ? 2
        : 1;
    const w: [number, number, number] = [
      c1_3d * v1_3d[0] + c2_3d * v2_3d[0] + c3_3d * v3_3d[0],
      c1_3d * v1_3d[1] + c2_3d * v2_3d[1] + c3_3d * v3_3d[1],
      c1_3d * v1_3d[2] + c2_3d * v2_3d[2] + c3_3d * v3_3d[2],
    ];
    return { tripleDet, crossMag, rank, w };
  }, [v1_3d, v2_3d, v3_3d, c1_3d, c2_3d, c3_3d]);

  const handleSelect2dPoint = (bx: number, by: number) => {
    setClickedTarget([bx, by]);
    if (Math.abs(stats2d.det) > 1e-3) {
      const nc1 = (bx * v2_2d[1] - by * v2_2d[0]) / stats2d.det;
      const nc2 = (v1_2d[0] * by - v1_2d[1] * bx) / stats2d.det;
      setC1_2d(Number(nc1.toFixed(2)));
      setC2_2d(Number(nc2.toFixed(2)));
    } else {
      // Project onto active line direction
      const ref =
        Math.hypot(v1_2d[0], v1_2d[1]) >= Math.hypot(v2_2d[0], v2_2d[1])
          ? v1_2d
          : v2_2d;
      const len2 = ref[0] * ref[0] + ref[1] * ref[1];
      if (len2 > 1e-6) {
        const proj = (bx * ref[0] + by * ref[1]) / len2;
        if (Math.hypot(v1_2d[0], v1_2d[1]) >= Math.hypot(v2_2d[0], v2_2d[1])) {
          setC1_2d(Number(proj.toFixed(2)));
          setC2_2d(0);
        } else {
          setC1_2d(0);
          setC2_2d(Number(proj.toFixed(2)));
        }
      }
    }
  };

  const activePreset2d = useMemo(
    () => PRESETS_2D.find((p) => p.id === preset2dId) ?? PRESETS_2D[0],
    [preset2dId]
  );
  const activePreset3d = useMemo(
    () => PRESETS_3D.find((p) => p.id === preset3dId) ?? PRESETS_3D[0],
    [preset3dId]
  );

  return (
    <section
      aria-label="Vectors Linear Combinations and Span Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#96B898] text-[#96B898] bg-[var(--bg-canvas)]">
              LAB 2.1.1 • LINEAR COMBINATIONS &amp; SPAN
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              {dimMode === "2d" ? activePreset2d.label : activePreset3d.label}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Explore Linear Combinations{" "}
            <KaTeXMath math="\mathbf{w} = c_1\mathbf{v}_1 + c_2\mathbf{v}_2" /> &amp; Subspace Span
          </h2>
        </div>

        {/* 2D vs 3D Mode Switch */}
        <div className="flex border border-[var(--border-strong)] bg-[var(--bg-canvas)]">
          <button
            type="button"
            onClick={() => setDimMode("2d")}
            className={`px-3 py-1.5 text-xs font-tabular-mono transition-colors ${
              dimMode === "2d"
                ? "bg-[#96B898] text-[#1E1F22] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            2D Plane (ℝ²)
          </button>
          <button
            type="button"
            onClick={() => setDimMode("3d")}
            className={`px-3 py-1.5 text-xs font-tabular-mono border-l border-[var(--border-subtle)] transition-colors ${
              dimMode === "3d"
                ? "bg-[#029091] text-[#1E1F22] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            3D Space (ℝ³)
          </button>
        </div>
      </div>

      {/* Presets Row */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-3 bg-[var(--bg-canvas)] flex flex-wrap gap-1.5">
        {dimMode === "2d"
          ? PRESETS_2D.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPreset2dId(p.id);
                  setV1_2d(p.v1);
                  setV2_2d(p.v2);
                  setC1_2d(p.c1);
                  setC2_2d(p.c2);
                  setClickedTarget(null);
                }}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  preset2dId === p.id
                    ? "border-[#96B898] bg-[#96B898]/15 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)]"
                }`}
              >
                {p.label}
              </button>
            ))
          : PRESETS_3D.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPreset3dId(p.id);
                  setV1_3d(p.v1);
                  setV2_3d(p.v2);
                  setV3_3d(p.v3);
                  setC1_3d(p.c1);
                  setC2_3d(p.c2);
                  setC3_3d(p.c3);
                }}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  preset3dId === p.id
                    ? "border-[#029091] bg-[#029091]/15 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)]"
                }`}
              >
                {p.label}
              </button>
            ))}
      </div>

      {/* Main Split Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Visualization Viewport */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          {dimMode === "2d" ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#96B898]" aria-hidden="true" />
                  2D Linear Combination Parallelogram &amp; Span Solver
                </span>
                <span className="text-[11px] font-tabular-mono text-[#FBEAA4]">
                  Click anywhere to solve b = c₁v₁ + c₂v₂
                </span>
              </div>

              <SvgCoordinatePlane2D
                xRange={[-4.5, 4.5]}
                yRange={[-4.5, 4.5]}
                height={360}
                ariaLabel="2D vector linear combination and span diagram"
                onSelectPoint={handleSelect2dPoint}
              >
                {({ toSvgX, toSvgY }) => {
                  const [x1, y1] = stats2d.scaled1;
                  const [x2, y2] = stats2d.scaled2;
                  const [wx, wy] = stats2d.w;

                  // Build grid lines along v1, v2 when rank === 2, or single line when rank === 1
                  const spanLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
                  if (stats2d.rank === 2) {
                    for (let k = -4; k <= 4; k++) {
                      spanLines.push({
                        x1: k * v2_2d[0] - 5 * v1_2d[0],
                        y1: k * v2_2d[1] - 5 * v1_2d[1],
                        x2: k * v2_2d[0] + 5 * v1_2d[0],
                        y2: k * v2_2d[1] + 5 * v1_2d[1],
                      });
                      spanLines.push({
                        x1: k * v1_2d[0] - 5 * v2_2d[0],
                        y1: k * v1_2d[1] - 5 * v2_2d[1],
                        x2: k * v1_2d[0] + 5 * v2_2d[0],
                        y2: k * v1_2d[1] + 5 * v2_2d[1],
                      });
                    }
                  }

                  const refLine =
                    Math.hypot(v1_2d[0], v1_2d[1]) >= Math.hypot(v2_2d[0], v2_2d[1])
                      ? v1_2d
                      : v2_2d;

                  return (
                    <g>
                      {stats2d.rank === 2 ? (
                        spanLines.map((l, idx) => (
                          <line
                            key={idx}
                            x1={toSvgX(l.x1)}
                            y1={toSvgY(l.y1)}
                            x2={toSvgX(l.x2)}
                            y2={toSvgY(l.y2)}
                            stroke="#029091"
                            strokeOpacity={0.22}
                            strokeWidth={1}
                          />
                        ))
                      ) : (
                        <line
                          x1={toSvgX(-5 * refLine[0])}
                          y1={toSvgY(-5 * refLine[1])}
                          x2={toSvgX(5 * refLine[0])}
                          y2={toSvgY(5 * refLine[1])}
                          stroke="#B95869"
                          strokeDasharray="6 4"
                          strokeWidth={1.8}
                        />
                      )}

                      {/* Shaded c1 v1 + c2 v2 parallelogram */}
                      <polygon
                        points={`${toSvgX(0)},${toSvgY(0)} ${toSvgX(x1)},${toSvgY(y1)} ${toSvgX(
                          wx
                        )},${toSvgY(wy)} ${toSvgX(x2)},${toSvgY(y2)}`}
                        fill="#029091"
                        fillOpacity={0.14}
                        stroke="#AAA36D"
                        strokeDasharray="3 3"
                        strokeWidth={1}
                      />

                      {/* Tip-to-tail c2*v2 translated to tip of c1*v1 */}
                      <line
                        x1={toSvgX(x1)}
                        y1={toSvgY(y1)}
                        x2={toSvgX(wx)}
                        y2={toSvgY(wy)}
                        stroke="#96B898"
                        strokeDasharray="4 3"
                        strokeWidth={1.6}
                      />

                      {/* Scaled basis c1*v1 & base v1 */}
                      <line
                        x1={toSvgX(0)}
                        y1={toSvgY(0)}
                        x2={toSvgX(x1)}
                        y2={toSvgY(y1)}
                        stroke="#8D9FCE"
                        strokeWidth={2.5}
                      />
                      <circle cx={toSvgX(v1_2d[0])} cy={toSvgY(v1_2d[1])} r={4.5} fill="#8D9FCE" />

                      {/* Base v2 */}
                      <line
                        x1={toSvgX(0)}
                        y1={toSvgY(0)}
                        x2={toSvgX(x2)}
                        y2={toSvgY(y2)}
                        stroke="#96B898"
                        strokeWidth={2.5}
                      />
                      <circle cx={toSvgX(v2_2d[0])} cy={toSvgY(v2_2d[1])} r={4.5} fill="#96B898" />

                      {/* Resultant w = c1*v1 + c2*v2 */}
                      <line
                        x1={toSvgX(0)}
                        y1={toSvgY(0)}
                        x2={toSvgX(wx)}
                        y2={toSvgY(wy)}
                        stroke="#D35323"
                        strokeWidth={3.2}
                      />
                      <circle cx={toSvgX(wx)} cy={toSvgY(wy)} r={5} fill="#D35323" />

                      {clickedTarget && (
                        <circle
                          cx={toSvgX(clickedTarget[0])}
                          cy={toSvgY(clickedTarget[1])}
                          r={6}
                          fill="none"
                          stroke="#FBEAA4"
                          strokeWidth={1.8}
                        />
                      )}
                    </g>
                  );
                }}
              </SvgCoordinatePlane2D>
            </>
          ) : (
            <ThreeOrbitViewport
              heightClassName="h-[385px]"
              cameraPosition={[3.6, 2.8, 3.6]}
              cameraTarget={[0, 0, 0]}
              titleBadge="3D Span{v₁, v₂} Plane & Linear Combination w = c₁v₁ + c₂v₂ + c₃v₃"
              footerSlot={
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                  <span className="text-[#8D9FCE]">v₁ (Periwinkle)</span>
                  <span className="text-[#96B898]">v₂ (Sage)</span>
                  <span className="text-[#FBEAA4]">v₃ (Cream)</span>
                  <span className="text-[#D35323] font-semibold">
                    Rank {stats3d.rank} ({stats3d.rank === 3 ? "Spans ℝ³" : stats3d.rank === 2 ? "2D Plane" : "1D Line"})
                  </span>
                </div>
              }
              sceneDeps={[v1_3d, v2_3d, v3_3d, c1_3d, c2_3d, c3_3d, stats3d]}
              onBuildScene={(group) => {
                // Translucent Span{v1, v2} plane if rank >= 2
                if (stats3d.crossMag > 1e-2) {
                  group.add(
                    createParametricSurfaceMesh(
                      (s, t) => [
                        s * v1_3d[0] + t * v2_3d[0],
                        s * v1_3d[1] + t * v2_3d[1],
                        s * v1_3d[2] + t * v2_3d[2],
                      ],
                      [-1.6, 1.6],
                      [-1.6, 1.6],
                      12,
                      12,
                      {
                        color: 0x029091,
                        opacity: 0.3,
                        wireframeColor: 0x8d9fce,
                        wireframeOpacity: 0.25,
                        showWireframe: true,
                      }
                    )
                  );
                }

                // Basis vectors v1, v2, v3
                group.add(createVectorArrow3D([0, 0, 0], v1_3d, 0x8d9fce));
                group.add(createVectorArrow3D([0, 0, 0], v2_3d, 0x96b898));
                group.add(createVectorArrow3D([0, 0, 0], v3_3d, 0xfbeaa4));

                // Tip-to-tail polyline c1*v1 -> +c2*v2 -> +c3*v3
                const p1: [number, number, number] = [
                  c1_3d * v1_3d[0],
                  c1_3d * v1_3d[1],
                  c1_3d * v1_3d[2],
                ];
                const p2: [number, number, number] = [
                  p1[0] + c2_3d * v2_3d[0],
                  p1[1] + c2_3d * v2_3d[1],
                  p1[2] + c2_3d * v2_3d[2],
                ];
                const polyPts = [
                  mathToThreeVec3(0, 0, 0),
                  mathToThreeVec3(p1[0], p1[1], p1[2]),
                  mathToThreeVec3(p2[0], p2[1], p2[2]),
                  mathToThreeVec3(stats3d.w[0], stats3d.w[1], stats3d.w[2]),
                ];
                group.add(
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints(polyPts),
                    new THREE.LineBasicMaterial({ color: 0xaaa36d })
                  )
                );

                // Resultant w
                group.add(createVectorArrow3D([0, 0, 0], stats3d.w, 0xd35323));
              }}
            />
          )}

          {/* Status Banner */}
          <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            {dimMode === "2d" ? (
              <>
                <span className="flex items-center gap-1.5">
                  {stats2d.rank === 2 ? (
                    <span className="text-[#96B898] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      Linearly Independent • Spans all of ℝ²
                    </span>
                  ) : (
                    <span className="text-[#B95869] flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                      Linearly Dependent • Collapsed to 1D Line
                    </span>
                  )}
                </span>
                <span className="text-[var(--text-secondary)]">
                  det[v₁ v₂] = {stats2d.det.toFixed(3)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[#029091]">
                  {stats3d.rank === 3
                    ? "Linearly Independent • Spans ℝ³ (3D Volume)"
                    : stats3d.rank === 2
                    ? "Coplanar Vectors • Spans 2D Plane in ℝ³"
                    : "Collinear Vectors • Spans 1D Line in ℝ³"}
                </span>
                <span className="text-[var(--text-secondary)]">
                  det[v₁ v₂ v₃] = {stats3d.tripleDet.toFixed(3)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Controls & Readouts */}
        <div className="lg:col-span-5 p-5 space-y-5 bg-[var(--bg-panel)] flex flex-col justify-between">
          {dimMode === "2d" ? (
            <div className="space-y-4">
              {/* Scalar weights */}
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
                <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#D35323] block">
                  Scalar Weights (c₁, c₂)
                </span>
                <label className="block space-y-1">
                  <div className="flex justify-between text-xs font-tabular-mono">
                    <span className="text-[#8D9FCE]">c₁</span>
                    <span>{c1_2d.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={-2.5}
                    max={2.5}
                    step={0.05}
                    value={c1_2d}
                    onChange={(e) => setC1_2d(Number(e.target.value))}
                    className="w-full accent-[#8D9FCE]"
                  />
                </label>
                <label className="block space-y-1">
                  <div className="flex justify-between text-xs font-tabular-mono">
                    <span className="text-[#96B898]">c₂</span>
                    <span>{c2_2d.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={-2.5}
                    max={2.5}
                    step={0.05}
                    value={c2_2d}
                    onChange={(e) => setC2_2d(Number(e.target.value))}
                    className="w-full accent-[#96B898]"
                  />
                </label>
              </div>

              {/* Vector components */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                  <span className="text-xs font-tabular-mono text-[#8D9FCE] block">Vector v₁</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={v1_2d[0]}
                      onChange={(e) => setV1_2d([Number(e.target.value) || 0, v1_2d[1]])}
                      className="w-full px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)]"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={v1_2d[1]}
                      onChange={(e) => setV1_2d([v1_2d[0], Number(e.target.value) || 0])}
                      className="w-full px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)]"
                    />
                  </div>
                </div>
                <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                  <span className="text-xs font-tabular-mono text-[#96B898] block">Vector v₂</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={v2_2d[0]}
                      onChange={(e) => setV2_2d([Number(e.target.value) || 0, v2_2d[1]])}
                      className="w-full px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)]"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={v2_2d[1]}
                      onChange={(e) => setV2_2d([v2_2d[0], Number(e.target.value) || 0])}
                      className="w-full px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-x-auto text-xs">
                <KaTeXMath
                  math={`\\mathbf{w} = ${c1_2d.toFixed(2)}\\begin{bmatrix}${v1_2d[0].toFixed(
                    1
                  )}\\\\${v1_2d[1].toFixed(1)}\\end{bmatrix} + ${c2_2d.toFixed(
                    2
                  )}\\begin{bmatrix}${v2_2d[0].toFixed(1)}\\\\${v2_2d[1].toFixed(
                    1
                  )}\\end{bmatrix} = \\begin{bmatrix}${stats2d.w[0].toFixed(
                    2
                  )}\\\\${stats2d.w[1].toFixed(2)}\\end{bmatrix}`}
                  block
                />
              </div>

              {clickedTarget && !stats2d.targetReachable && (
                <p className="text-xs font-tabular-mono text-[#B95869] p-2.5 border border-[#B95869]/50 bg-[var(--bg-canvas)]">
                  Target b = ({clickedTarget[0].toFixed(2)}, {clickedTarget[1].toFixed(2)}) lies
                  OUTSIDE the collapsed 1D line span—no solution (c₁, c₂) exists!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
                <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#D35323] block">
                  3D Combination Weights (c₁, c₂, c₃)
                </span>
                {[
                  { label: "c₁", val: c1_3d, set: setC1_3d, color: "#8D9FCE" },
                  { label: "c₂", val: c2_3d, set: setC2_3d, color: "#96B898" },
                  { label: "c₃", val: c3_3d, set: setC3_3d, color: "#FBEAA4" },
                ].map((item) => (
                  <label key={item.label} className="block space-y-1">
                    <div className="flex justify-between text-xs font-tabular-mono">
                      <span style={{ color: item.color }}>{item.label}</span>
                      <span>{item.val.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={-1.8}
                      max={1.8}
                      step={0.05}
                      value={item.val}
                      onChange={(e) => item.set(Number(e.target.value))}
                      className="w-full"
                    />
                  </label>
                ))}
              </div>

              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-x-auto text-xs">
                <KaTeXMath
                  math={`\\mathbf{w} = \\langle ${stats3d.w[0].toFixed(2)},\\; ${stats3d.w[1].toFixed(
                    2
                  )},\\; ${stats3d.w[2].toFixed(2)} \\rangle`}
                  block
                />
              </div>
            </div>
          )}

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#029091] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              Subspace Intuition
            </span>
            <p className="font-math-serif text-xs text-[var(--text-secondary)] leading-relaxed">
              {dimMode === "2d" ? activePreset2d.note : activePreset3d.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
