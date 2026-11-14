"use client";

import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { Box, Layers, AlertTriangle } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  mathToThreeVec3,
  createVectorArrow3D,
} from "@/components/visualizations/primitives";
import { getAdaptiveAccentInk } from "@/lib/accentInk";

type DimMode = "2d" | "3d";

interface DetPreset2D {
  id: string;
  label: string;
  a1: [number, number];
  a2: [number, number];
  note: string;
}

interface DetPreset3D {
  id: string;
  label: string;
  a1: [number, number, number];
  a2: [number, number, number];
  a3: [number, number, number];
  note: string;
}

const PRESETS_2D: DetPreset2D[] = [
  {
    id: "pos-expand",
    label: "Positive Area (+2.10)",
    a1: [1.8, 0.3],
    a2: [0.4, 1.25],
    note: "a₂ sits counter-clockwise from a₁ (right-hand rule +z), giving det > 0 and preserving plane orientation.",
  },
  {
    id: "neg-flip",
    label: "Orientation Flip (det < 0)",
    a1: [0.4, 1.5],
    a2: [1.6, 0.2],
    note: "Rotating a₁ past a₂ flips clockwise order: det < 0 turns the shaded region crimson—an orientation mirror-flip!",
  },
  {
    id: "zero-collapse",
    label: "Singular Collapse (det = 0)",
    a1: [1.6, 0.8],
    a2: [-1.0, -0.5],
    note: "Collinear columns trap zero area between them: det(A) = 0 means A flattens 2D space onto a 1D line and has no inverse.",
  },
];

const PRESETS_3D: DetPreset3D[] = [
  {
    id: "cube-skew",
    label: "Right-Handed Box (+2.85)",
    a1: [1.5, 0.2, 0.1],
    a2: [0.3, 1.4, 0.3],
    a3: [0.2, -0.2, 1.35],
    note: "det[a₁ a₂ a₃] = a₁ · (a₂ × a₃) computes the signed 3D volume of the sheared unit cube parallelepiped.",
  },
  {
    id: "flat-pancake",
    label: "Coplanar Pancake (det = 0)",
    a1: [1.4, 0.4, 0.3],
    a2: [0.2, 1.3, 0.5],
    a3: [1.6, 1.7, 0.8],
    note: "Here a₃ = a₁ + a₂ sits flat on the face spanned by a₁ and a₂, squashing the 3D parallelepiped volume down to 0!",
  },
  {
    id: "left-handed-flip",
    label: "Inverted Left-Handed (det < 0)",
    a1: [0.3, 1.5, 0.1],
    a2: [1.5, 0.2, 0.1],
    a3: [0.1, 0.2, 1.4],
    note: "Swapping columns a₁ ↔ a₂ reverses handedness and negates determinant det → −det.",
  },
];

function buildParallelepipedGroup(
  a1: [number, number, number],
  a2: [number, number, number],
  a3: [number, number, number],
  isNeg: boolean,
  isZero: boolean
): THREE.Group {
  const grp = new THREE.Group();
  const add = (u: [number, number, number], v: [number, number, number]): [number, number, number] => [
    u[0] + v[0],
    u[1] + v[1],
    u[2] + v[2],
  ];

  const p000: [number, number, number] = [0, 0, 0];
  const p100 = a1;
  const p010 = a2;
  const p001 = a3;
  const p110 = add(a1, a2);
  const p101 = add(a1, a3);
  const p011 = add(a2, a3);
  const p111 = add(p110, a3);

  const verts = [p000, p100, p110, p010, p001, p101, p111, p011].map((p) =>
    mathToThreeVec3(p[0], p[1], p[2])
  );

  // 12 wireframe edges
  const edgeIdx = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  const edgePts: THREE.Vector3[] = [];
  for (const [i, j] of edgeIdx) {
    edgePts.push(verts[i], verts[j]);
  }
  const edgeColor = isZero ? 0xfbeaa4 : isNeg ? 0xb95869 : 0x029091;
  grp.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(edgePts),
      new THREE.LineBasicMaterial({ color: edgeColor })
    )
  );

  // 6 translucent faces (12 triangles)
  const faceTris = [
    0, 1, 2, 0, 2, 3, // bottom
    4, 6, 5, 4, 7, 6, // top
    0, 1, 5, 0, 5, 4, // front
    2, 3, 7, 2, 7, 6, // back
    1, 2, 6, 1, 6, 5, // right
    3, 0, 4, 3, 4, 7, // left
  ];
  const posArr: number[] = [];
  for (const idx of faceTris) {
    posArr.push(verts[idx].x, verts[idx].y, verts[idx].z);
  }
  const fGeo = new THREE.BufferGeometry();
  fGeo.setAttribute("position", new THREE.Float32BufferAttribute(posArr, 3));
  fGeo.computeVertexNormals();
  grp.add(
    new THREE.Mesh(
      fGeo,
      new THREE.MeshStandardMaterial({
        color: isNeg ? 0xb95869 : 0x029091,
        transparent: true,
        opacity: isZero ? 0.14 : 0.34,
        side: THREE.DoubleSide,
        roughness: 0.5,
      })
    )
  );

  return grp;
}

export function DeterminantVolumeLab() {
  const [dimMode, setDimMode] = useState<DimMode>("2d");

  // 2D
  const [p2Id, setP2Id] = useState<string>("pos-expand");
  const [a1_2d, setA1_2d] = useState<[number, number]>(PRESETS_2D[0].a1);
  const [a2_2d, setA2_2d] = useState<[number, number]>(PRESETS_2D[0].a2);

  // 3D
  const [p3Id, setP3Id] = useState<string>("cube-skew");
  const [a1_3d, setA1_3d] = useState<[number, number, number]>(PRESETS_3D[0].a1);
  const [a2_3d, setA2_3d] = useState<[number, number, number]>(PRESETS_3D[0].a2);
  const [a3_3d, setA3_3d] = useState<[number, number, number]>(PRESETS_3D[0].a3);

  const det2d = a1_2d[0] * a2_2d[1] - a1_2d[1] * a2_2d[0];
  const cross23: [number, number, number] = [
    a2_3d[1] * a3_3d[2] - a2_3d[2] * a3_3d[1],
    a2_3d[2] * a3_3d[0] - a2_3d[0] * a3_3d[2],
    a2_3d[0] * a3_3d[1] - a2_3d[1] * a3_3d[0],
  ];
  const det3d =
    a1_3d[0] * cross23[0] + a1_3d[1] * cross23[1] + a1_3d[2] * cross23[2];

  const active2d = useMemo(
    () => PRESETS_2D.find((p) => p.id === p2Id) ?? PRESETS_2D[0],
    [p2Id]
  );
  const active3d = useMemo(
    () => PRESETS_3D.find((p) => p.id === p3Id) ?? PRESETS_3D[0],
    [p3Id]
  );

  return (
    <section
      aria-label="Determinants as Oriented Area and Parallelepiped Volume Lab"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[var(--bg-canvas)]">
              LAB 2.2.2 • DETERMINANTS AS ORIENTED VOLUME
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              {dimMode === "2d" ? `det = ${det2d.toFixed(3)}` : `det = ${det3d.toFixed(3)}`}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Signed Scaling Factor:{" "}
            <KaTeXMath
              math={
                dimMode === "2d"
                  ? "\\det[\\mathbf{a}_1\\;\\mathbf{a}_2] = \\pm\\text{Area}"
                  : "\\det[\\mathbf{a}_1\\;\\mathbf{a}_2\\;\\mathbf{a}_3] = \\mathbf{a}_1\\cdot(\\mathbf{a}_2\\times\\mathbf{a}_3)"
              }
            />
          </h2>
        </div>

        <div className="flex border border-[var(--border-strong)] bg-[var(--bg-canvas)]">
          <button
            type="button"
            onClick={() => setDimMode("2d")}
            className={`px-3 py-1.5 text-xs font-tabular-mono transition-colors ${
              dimMode === "2d"
                ? "bg-[#9E360E] text-[#FFFBE4] font-semibold"
                : "text-[var(--text-secondary)]"
            }`}
          >
            2D Area
          </button>
          <button
            type="button"
            onClick={() => setDimMode("3d")}
            className={`px-3 py-1.5 text-xs font-tabular-mono border-l border-[var(--border-subtle)] transition-colors ${
              dimMode === "3d"
                ? "bg-[#016869] text-[#FFFBE4] font-semibold"
                : "text-[var(--text-secondary)]"
            }`}
          >
            3D Parallelepiped
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-3 bg-[var(--bg-canvas)] flex flex-wrap gap-1.5">
        {dimMode === "2d"
          ? PRESETS_2D.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setP2Id(p.id);
                  setA1_2d(p.a1);
                  setA2_2d(p.a2);
                }}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  p2Id === p.id
                    ? "border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-[var(--text-primary)] font-semibold"
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
                  setP3Id(p.id);
                  setA1_3d(p.a1);
                  setA2_3d(p.a2);
                  setA3_3d(p.a3);
                }}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  p3Id === p.id
                    ? "border-[var(--math-ink-z)] bg-[#029091]/15 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)]"
                }`}
              >
                {p.label}
              </button>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          {dimMode === "2d" ? (
            <SvgCoordinatePlane2D
              xRange={[-3, 3.5]}
              yRange={[-2.5, 3.5]}
              height={340}
              ariaLabel="2D parallelogram determinant area and orientation visualization"
              onSelectPoint={(wx, wy) => setA2_2d([Number(wx.toFixed(2)), Number(wy.toFixed(2))])}
            >
              {({ toSvgX, toSvgY }) => {
                const isNeg = det2d < -1e-3;
                const isZero = Math.abs(det2d) <= 1e-3;
                const fillHex = isZero ? "#FBEAA4" : isNeg ? "#B95869" : "#029091";

                return (
                  <g>
                    {/* Original unit square reference */}
                    <rect
                      x={toSvgX(0)}
                      y={toSvgY(1)}
                      width={toSvgX(1) - toSvgX(0)}
                      height={toSvgY(0) - toSvgY(1)}
                      fill="none"
                      stroke="#AAA36D"
                      strokeDasharray="4 3"
                      strokeWidth={1.2}
                    />
                    {/* Transformed parallelogram */}
                    <polygon
                      points={`${toSvgX(0)},${toSvgY(0)} ${toSvgX(a1_2d[0])},${toSvgY(
                        a1_2d[1]
                      )} ${toSvgX(a1_2d[0] + a2_2d[0])},${toSvgY(
                        a1_2d[1] + a2_2d[1]
                      )} ${toSvgX(a2_2d[0])},${toSvgY(a2_2d[1])}`}
                      fill={fillHex}
                      fillOpacity={0.28}
                      stroke={fillHex}
                      strokeWidth={2}
                    />
                    <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(a1_2d[0])} y2={toSvgY(a1_2d[1])} stroke="#8D9FCE" strokeWidth={2.8} />
                    <circle cx={toSvgX(a1_2d[0])} cy={toSvgY(a1_2d[1])} r={4.5} fill="#8D9FCE" />

                    <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(a2_2d[0])} y2={toSvgY(a2_2d[1])} stroke="#96B898" strokeWidth={2.8} />
                    <circle cx={toSvgX(a2_2d[0])} cy={toSvgY(a2_2d[1])} r={4.5} fill="#96B898" />
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>
          ) : (
            <ThreeOrbitViewport
              heightClassName="h-[360px]"
              cameraPosition={[3.4, 2.7, 3.4]}
              cameraTarget={[0.7, 0.7, 0.7]}
              titleBadge="3D Parallelepiped Spanned by Matrix Columns a₁, a₂, a₃"
              footerSlot={
                <div className="flex flex-wrap justify-between gap-2 text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-x)]">a₁</span>
                  <span className="text-[var(--math-ink-y)]">a₂</span>
                  <span className="text-[var(--math-ink-diff)]">a₃</span>
                  <span className={det3d < -1e-3 ? "text-[var(--math-ink-upper)] font-semibold" : "text-[var(--math-ink-z)] font-semibold"}>
                    Signed Volume det(A) = {det3d.toFixed(3)}
                  </span>
                </div>
              }
              sceneDeps={[a1_3d, a2_3d, a3_3d, det3d]}
              onBuildScene={(group) => {
                const isNeg = det3d < -1e-3;
                const isZero = Math.abs(det3d) <= 1e-2;
                group.add(buildParallelepipedGroup(a1_3d, a2_3d, a3_3d, isNeg, isZero));
                group.add(createVectorArrow3D([0, 0, 0], a1_3d, 0x8d9fce));
                group.add(createVectorArrow3D([0, 0, 0], a2_3d, 0x96b898));
                group.add(createVectorArrow3D([0, 0, 0], a3_3d, 0xfbeaa4));
              }}
            />
          )}
        </div>

        {/* Right: Controls & Readouts */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)] flex flex-col justify-between">
          {dimMode === "2d" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
                  <span className="text-xs font-tabular-mono text-[var(--math-ink-x)] block">Column a₁</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={a1_2d[0]}
                      onChange={(e) => setA1_2d([Number(e.target.value) || 0, a1_2d[1]])}
                      className="px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)]"
                      aria-label="Column a₁ x-component"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={a1_2d[1]}
                      onChange={(e) => setA1_2d([a1_2d[0], Number(e.target.value) || 0])}
                      className="px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)]"
                      aria-label="Column a₁ y-component"
                    />
                  </div>
                </div>
                <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
                  <span className="text-xs font-tabular-mono text-[var(--math-ink-y)] block">Column a₂ (or click plot)</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={a2_2d[0]}
                      onChange={(e) => setA2_2d([Number(e.target.value) || 0, a2_2d[1]])}
                      className="px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)]"
                      aria-label="Column a₂ x-component"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={a2_2d[1]}
                      onChange={(e) => setA2_2d([a2_2d[0], Number(e.target.value) || 0])}
                      className="px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)]"
                      aria-label="Column a₂ y-component"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-x-auto text-xs space-y-2">
                <KaTeXMath
                  math={`\\det\\begin{bmatrix}${a1_2d[0].toFixed(2)} & ${a2_2d[0].toFixed(
                    2
                  )}\\\\${a1_2d[1].toFixed(2)} & ${a2_2d[1].toFixed(
                    2
                  )}\\end{bmatrix} = (${a1_2d[0].toFixed(2)})(${a2_2d[1].toFixed(
                    2
                  )}) - (${a1_2d[1].toFixed(2)})(${a2_2d[0].toFixed(
                    2
                  )}) = \\mathbf{${det2d.toFixed(3)}}`}
                  block
                />
                {Math.abs(det2d) <= 1e-3 && (
                  <p className="text-[var(--math-ink-upper)] font-tabular-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                    Singular Matrix: Area collapsed to zero!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { lbl: "a₁", vec: a1_3d, set: setA1_3d, color: "#8D9FCE" },
                { lbl: "a₂", vec: a2_3d, set: setA2_3d, color: "#96B898" },
                { lbl: "a₃", vec: a3_3d, set: setA3_3d, color: "#FBEAA4" },
              ].map((item) => (
                <div
                  key={item.lbl}
                  className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5"
                >
                  <span
                    className="text-xs font-tabular-mono block"
                    style={{ color: getAdaptiveAccentInk(item.color) }}
                  >
                    Column {item.lbl}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[0, 1, 2].map((axis) => (
                      <input
                        key={axis}
                        type="number"
                        step="0.1"
                        value={item.vec[axis]}
                        onChange={(e) => {
                          const next = [...item.vec] as [number, number, number];
                          next[axis] = Number(e.target.value) || 0;
                          item.set(next);
                        }}
                        className="px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)]"
                        aria-label={`Column ${item.lbl} ${["x", "y", "z"][axis]}-component`}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono flex items-center justify-between">
                <span className="text-[var(--math-ink-z)] flex items-center gap-1">
                  <Box className="w-3.5 h-3.5" aria-hidden="true" />
                  Volume Scaling |det A|:
                </span>
                <span className="font-semibold">{Math.abs(det3d).toFixed(3)}×</span>
              </div>
            </div>
          )}

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              Orientation &amp; Singularity
            </span>
            <p className="font-math-serif text-xs text-[var(--text-secondary)] leading-relaxed">
              {dimMode === "2d" ? active2d.note : active3d.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
