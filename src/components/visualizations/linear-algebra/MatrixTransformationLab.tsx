"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Play, Pause, RotateCcw, Compass, Shuffle } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives";

type LabMode = "homotopy" | "composition";

interface MatrixPreset {
  id: string;
  label: string;
  m: [number, number, number, number]; // [a, b, c, d] = [[a, b], [c, d]]
  note: string;
}

const MATRIX_PRESETS: MatrixPreset[] = [
  {
    id: "shear-x",
    label: "Horizontal Shear",
    m: [1.0, 1.2, 0.0, 1.0],
    note: "Horizontal shear leaves î = ⟨1, 0⟩ fixed while slanting ĵ to ⟨1.2, 1⟩; determinant stays 1 so every grid parallelogram preserves exact unit area.",
  },
  {
    id: "rot-45",
    label: "Rotation (45°)",
    m: [0.707, -0.707, 0.707, 0.707],
    note: "Rigid orthogonal rotation preserves lengths, angles, and area while rotating both basis columns counter-clockwise by 45°.",
  },
  {
    id: "reflect-x",
    label: "Reflection (x = y)",
    m: [0.0, 1.0, 1.0, 0.0],
    note: "Swapping î and ĵ reflects the plane across y = x and flips orientation (det = -1).",
  },
  {
    id: "proj-line",
    label: "Rank-1 Projection",
    m: [0.64, 0.48, 0.48, 0.36],
    note: "Orthogonal projection onto the 3:4 line squashes all of ℝ² onto a 1D span (A² = A, det = 0).",
  },
  {
    id: "squeeze",
    label: "Hyperbolic Squeeze",
    m: [1.6, 0.0, 0.0, 0.625],
    note: "Stretches x by 1.6× and compresses y by 0.625×—preserving area (det = 1) just like special relativity Lorentz boosts or Hamiltonian flow.",
  },
];

export function MatrixTransformationLab() {
  const [mode, setMode] = useState<LabMode>("homotopy");
  const [presetId, setPresetId] = useState<string>("shear-x");
  const [matA, setMatA] = useState<[number, number, number, number]>(
    MATRIX_PRESETS[0].m
  );
  // Secondary matrix B for BA vs AB comparison (default 90 deg rotation)
  const [matB, setMatB] = useState<[number, number, number, number]>([0, -1, 1, 0]);
  const [homotopyT, setHomotopyT] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [probeX, setProbeX] = useState<[number, number]>([1.2, 0.9]);

  // Animate t from 0 -> 1
  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;
    let lastTs = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      setHomotopyT((prev) => {
        const next = prev + dt * 0.55;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  // Interpolated matrix M(t) = (1 - t) I + t A
  const interpA = useMemo((): [number, number, number, number] => {
    const t = homotopyT;
    return [
      1 - t + t * matA[0],
      t * matA[1],
      t * matA[2],
      1 - t + t * matA[3],
    ];
  }, [matA, homotopyT]);

  const applyMat = (m: [number, number, number, number], p: [number, number]): [number, number] => [
    m[0] * p[0] + m[1] * p[1],
    m[2] * p[0] + m[3] * p[1],
  ];

  const mulMat = (
    m1: [number, number, number, number],
    m2: [number, number, number, number]
  ): [number, number, number, number] => [
    m1[0] * m2[0] + m1[1] * m2[2],
    m1[0] * m2[1] + m1[1] * m2[3],
    m1[2] * m2[0] + m1[3] * m2[2],
    m1[2] * m2[1] + m1[3] * m2[3],
  ];

  const compStats = useMemo(() => {
    const ba = mulMat(matB, matA);
    const ab = mulMat(matA, matB);
    const commutes =
      Math.max(
        Math.abs(ba[0] - ab[0]),
        Math.abs(ba[1] - ab[1]),
        Math.abs(ba[2] - ab[2]),
        Math.abs(ba[3] - ab[3])
      ) < 1e-2;
    return { ba, ab, commutes };
  }, [matA, matB]);

  const detA = matA[0] * matA[3] - matA[1] * matA[2];
  const mappedProbe = applyMat(interpA, probeX);
  const activePreset = useMemo(
    () => MATRIX_PRESETS.find((p) => p.id === presetId) ?? MATRIX_PRESETS[0],
    [presetId]
  );

  // Asymmetric "L-flag" polygon to visualize orientation & rotation vs reflection cleanly
  const lFlag: [number, number][] = [
    [0, 0],
    [0.9, 0],
    [0.9, 0.28],
    [0.32, 0.28],
    [0.32, 1.0],
    [0, 1.0],
  ];

  return (
    <section
      aria-label="Matrix Linear Transformation and Composition Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#D35323] text-[#D35323] bg-[var(--bg-canvas)]">
              LAB 2.2.1 • MATRIX TRANSFORMATIONS &amp; COMPOSITION
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              det(A) = {detA.toFixed(2)}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Read Any Matrix <KaTeXMath math="A = [\mathbf{a}_1 \mid \mathbf{a}_2]" /> Where Basis
            Vectors Land
          </h2>
        </div>

        <div className="flex border border-[var(--border-strong)] bg-[var(--bg-canvas)]">
          <button
            type="button"
            onClick={() => setMode("homotopy")}
            className={`px-3 py-1.5 text-xs font-tabular-mono transition-colors ${
              mode === "homotopy"
                ? "bg-[#D35323] text-[#1E1F22] font-semibold"
                : "text-[var(--text-secondary)]"
            }`}
          >
            Grid Homotopy (I → A)
          </button>
          <button
            type="button"
            onClick={() => setMode("composition")}
            className={`px-3 py-1.5 text-xs font-tabular-mono border-l border-[var(--border-subtle)] transition-colors ${
              mode === "composition"
                ? "bg-[#029091] text-[#1E1F22] font-semibold"
                : "text-[var(--text-secondary)]"
            }`}
          >
            Compare BA vs AB
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {MATRIX_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPresetId(p.id);
                  setMatA(p.m);
                  setHomotopyT(1.0);
                  setIsPlaying(false);
                }}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  presetId === p.id
                    ? "border-[#D35323] bg-[#D35323]/15 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {mode === "homotopy" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (homotopyT >= 0.99) setHomotopyT(0);
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
                    <Play className="w-3.5 h-3.5" aria-hidden="true" /> Animate I → A
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setHomotopyT(0);
                }}
                className="px-2.5 py-1 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" /> t = 0
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[#D35323] block">
              Matrix A = [[a₁ₓ, a₂ₓ], [a₁ᵧ, a₂ᵧ]]
            </span>
            <div className="grid grid-cols-4 gap-2">
              {["a", "b", "c", "d"].map((lbl, idx) => (
                <label key={lbl} className="block space-y-0.5">
                  <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
                    {lbl}
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    value={matA[idx]}
                    onChange={(e) => {
                      const next = [...matA] as [number, number, number, number];
                      next[idx] = Number(e.target.value) || 0;
                      setMatA(next);
                    }}
                    className="w-full px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)]"
                  />
                </label>
              ))}
            </div>
          </div>

          {mode === "homotopy" ? (
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2 flex flex-col justify-center">
              <div className="flex justify-between text-xs font-tabular-mono">
                <span className="text-[#029091]">Homotopy Scrubber t (I → A)</span>
                <span className="font-semibold">{homotopyT.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={homotopyT}
                onChange={(e) => {
                  setIsPlaying(false);
                  setHomotopyT(Number(e.target.value));
                }}
                className="w-full accent-[#029091]"
              />
            </div>
          ) : (
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
              <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[#8D9FCE] block">
                Second Matrix B = [[b₁₁, b₁₂], [b₂₁, b₂₂]] (Default: 90° CCW Rotation)
              </span>
              <div className="grid grid-cols-4 gap-2">
                {["b₁₁", "b₁₂", "b₂₁", "b₂₂"].map((lbl, idx) => (
                  <label key={lbl} className="block space-y-0.5">
                    <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
                      {lbl}
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      value={matB[idx]}
                      onChange={(e) => {
                        const next = [...matB] as [number, number, number, number];
                        next[idx] = Number(e.target.value) || 0;
                        setMatB(next);
                      }}
                      className="w-full px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)]"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visualizations */}
      {mode === "homotopy" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-3 bg-[var(--bg-canvas)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#D35323]" aria-hidden="true" />
                Transformed Space Grid &amp; Basis Columns [a₁ | a₂]
              </span>
              <span className="text-[11px] font-tabular-mono text-[#FBEAA4]">
                Click plane to place input vector x
              </span>
            </div>

            <SvgCoordinatePlane2D
              xRange={[-3.5, 3.5]}
              yRange={[-3.5, 3.5]}
              height={340}
              ariaLabel="2D linear transformation warping standard coordinate grid"
              onSelectPoint={(wx, wy) =>
                setProbeX([Number(wx.toFixed(2)), Number(wy.toFixed(2))])
              }
            >
              {({ toSvgX, toSvgY }) => {
                const a1: [number, number] = [interpA[0], interpA[2]];
                const a2: [number, number] = [interpA[1], interpA[3]];
                const mappedFlag = lFlag.map((pt) => applyMat(interpA, pt));
                const flagPath =
                  mappedFlag
                    .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p[0]).toFixed(1)},${toSvgY(p[1]).toFixed(1)}`)
                    .join(" ") + " Z";

                const circlePts: string[] = [];
                for (let k = 0; k <= 64; k++) {
                  const th = (k / 64) * Math.PI * 2;
                  const mp = applyMat(interpA, [Math.cos(th), Math.sin(th)]);
                  circlePts.push(
                    `${k === 0 ? "M" : "L"}${toSvgX(mp[0]).toFixed(1)},${toSvgY(mp[1]).toFixed(1)}`
                  );
                }

                return (
                  <g>
                    {/* Transformed grid lines */}
                    {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
                      <g key={k}>
                        <line
                          x1={toSvgX(k * a2[0] - 4 * a1[0])}
                          y1={toSvgY(k * a2[1] - 4 * a1[1])}
                          x2={toSvgX(k * a2[0] + 4 * a1[0])}
                          y2={toSvgY(k * a2[1] + 4 * a1[1])}
                          stroke="#029091"
                          strokeOpacity={0.28}
                          strokeWidth={1}
                        />
                        <line
                          x1={toSvgX(k * a1[0] - 4 * a2[0])}
                          y1={toSvgY(k * a1[1] - 4 * a2[1])}
                          x2={toSvgX(k * a1[0] + 4 * a2[0])}
                          y2={toSvgY(k * a1[1] + 4 * a2[1])}
                          stroke="#029091"
                          strokeOpacity={0.28}
                          strokeWidth={1}
                        />
                      </g>
                    ))}

                    {/* Unit circle ellipse image */}
                    <path d={circlePts.join(" ") + " Z"} fill="none" stroke="#AAA36D" strokeDasharray="4 3" strokeWidth={1.3} />

                    {/* Mapped asymmetric L-flag */}
                    <path d={flagPath} fill="#029091" fillOpacity={0.2} stroke="#029091" strokeWidth={1.6} />

                    {/* Transformed basis columns a1 & a2 */}
                    <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(a1[0])} y2={toSvgY(a1[1])} stroke="#8D9FCE" strokeWidth={2.8} />
                    <circle cx={toSvgX(a1[0])} cy={toSvgY(a1[1])} r={4.5} fill="#8D9FCE" />

                    <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(a2[0])} y2={toSvgY(a2[1])} stroke="#96B898" strokeWidth={2.8} />
                    <circle cx={toSvgX(a2[0])} cy={toSvgY(a2[1])} r={4.5} fill="#96B898" />

                    {/* Input x (dashed Cream) -> Output Ax (Persimmon) */}
                    <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(probeX[0])} y2={toSvgY(probeX[1])} stroke="#FBEAA4" strokeDasharray="3 3" strokeWidth={1.5} />
                    <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(mappedProbe[0])} y2={toSvgY(mappedProbe[1])} stroke="#D35323" strokeWidth={2.8} />
                    <circle cx={toSvgX(mappedProbe[0])} cy={toSvgY(mappedProbe[1])} r={4.5} fill="#D35323" />
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>
          </div>

          <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)] flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#D35323] block">
                Action on Standard Basis &amp; Test Vector x
              </span>
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-x-auto text-xs">
                <KaTeXMath
                  math={`M(${homotopyT.toFixed(2)})\\begin{bmatrix}${probeX[0].toFixed(
                    2
                  )}\\\\${probeX[1].toFixed(2)}\\end{bmatrix} = \\begin{bmatrix}${interpA[0].toFixed(
                    2
                  )} & ${interpA[1].toFixed(2)}\\\\${interpA[2].toFixed(2)} & ${interpA[3].toFixed(
                    2
                  )}\\end{bmatrix}\\begin{bmatrix}${probeX[0].toFixed(2)}\\\\${probeX[1].toFixed(
                    2
                  )}\\end{bmatrix} = \\begin{bmatrix}${mappedProbe[0].toFixed(
                    2
                  )}\\\\${mappedProbe[1].toFixed(2)}\\end{bmatrix}`}
                  block
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-tabular-mono">
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                  <span className="text-[10px] text-[#8D9FCE] block">Where î lands (a₁)</span>
                  <span>⟨{interpA[0].toFixed(2)}, {interpA[2].toFixed(2)}⟩</span>
                </div>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                  <span className="text-[10px] text-[#96B898] block">Where ĵ lands (a₂)</span>
                  <span>⟨{interpA[1].toFixed(2)}, {interpA[3].toFixed(2)}⟩</span>
                </div>
              </div>
            </div>

            <p className="font-math-serif text-xs text-[var(--text-secondary)] leading-relaxed p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              {activePreset.note}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {[
            { title: "First A, Then B: (BA)x", mat: compStats.ba, color: "#029091" },
            { title: "First B, Then A: (AB)x", mat: compStats.ab, color: "#D35323" },
          ].map((pane, idx) => (
            <div
              key={pane.title}
              className={`lg:col-span-6 p-5 space-y-3 ${
                idx === 0 ? "border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] bg-[var(--bg-canvas)]" : "bg-[var(--bg-panel)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-tabular-mono uppercase tracking-wider" style={{ color: pane.color }}>
                  {pane.title}
                </span>
                <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
                  [[{pane.mat[0].toFixed(2)}, {pane.mat[1].toFixed(2)}], [{pane.mat[2].toFixed(2)}, {pane.mat[3].toFixed(2)}]]
                </span>
              </div>

              <SvgCoordinatePlane2D
                xRange={[-3.2, 3.2]}
                yRange={[-3.2, 3.2]}
                height={295}
                ariaLabel={pane.title}
              >
                {({ toSvgX, toSvgY }) => {
                  const mapped = lFlag.map((pt) => applyMat(pane.mat, pt));
                  const pathD =
                    mapped
                      .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p[0]).toFixed(1)},${toSvgY(p[1]).toFixed(1)}`)
                      .join(" ") + " Z";
                  return (
                    <g>
                      <path d={pathD} fill={pane.color} fillOpacity={0.25} stroke={pane.color} strokeWidth={2} />
                      <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(pane.mat[0])} y2={toSvgY(pane.mat[2])} stroke="#8D9FCE" strokeWidth={2.4} />
                      <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(pane.mat[1])} y2={toSvgY(pane.mat[3])} stroke="#96B898" strokeWidth={2.4} />
                    </g>
                  );
                }}
              </SvgCoordinatePlane2D>
            </div>
          ))}

          <div className="lg:col-span-12 border-t border-[var(--border-subtle)] px-6 py-3 bg-[var(--bg-canvas)] flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <span className="flex items-center gap-1.5 text-[#FBEAA4]">
              <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
              {compStats.commutes
                ? "Special Case: Matrices A and B Commute (BA = AB)!"
                : "Order Matters: BA ≠ AB — applying A then B rotates/shears the intermediate grid differently than B then A!"}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
