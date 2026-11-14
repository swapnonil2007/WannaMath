"use client";

import React, { useMemo, useState } from "react";
import { Grid, Compass, AlertTriangle } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

interface BasisPreset {
  id: string;
  label: string;
  b1: [number, number];
  b2: [number, number];
  u: number;
  v: number;
  note: string;
}

const BASIS_PRESETS: BasisPreset[] = [
  {
    id: "sheared-basis",
    label: "Oblique Sheared Basis",
    b1: [1.5, 0.4],
    b2: [0.3, 1.3],
    u: 1.5,
    v: 1.0,
    note: "A single physical arrow x in the plane has different numeric addresses depending on whether you measure along standard axes (î, ĵ) or skewed grid lines (b₁, b₂).",
  },
  {
    id: "rotated-45",
    label: "Orthonormal 45° Frame",
    b1: [1.0, 1.0],
    b2: [-1.0, 1.0],
    u: 1.2,
    v: 0.6,
    note: "Here b₁ ⊥ b₂ with equal length √2, so basis grid tiles form rotated squares and P⁻¹ = (1/2)Pᵀ.",
  },
  {
    id: "singular-pair",
    label: "Dependent Collapse (det = 0)",
    b1: [1.4, 0.7],
    b2: [-1.0, -0.5],
    u: 1.0,
    v: 0.5,
    note: "When b₁ and b₂ are collinear, det(P) = 0—P⁻¹ blows up and the grid flattens onto one line, losing unique coordinates!",
  },
];

export function ChangeOfBasisLab() {
  const [presetId, setPresetId] = useState<string>("sheared-basis");
  const [b1, setB1] = useState<[number, number]>(BASIS_PRESETS[0].b1);
  const [b2, setB2] = useState<[number, number]>(BASIS_PRESETS[0].b2);
  const [uCoord, setUCoord] = useState<number>(BASIS_PRESETS[0].u);
  const [vCoord, setVCoord] = useState<number>(BASIS_PRESETS[0].v);

  const stats = useMemo(() => {
    const detP = b1[0] * b2[1] - b1[1] * b2[0];
    const singular = Math.abs(detP) < 1e-3;
    const xPhys: [number, number] = [
      uCoord * b1[0] + vCoord * b2[0],
      uCoord * b1[1] + vCoord * b2[1],
    ];
    const invP = singular
      ? null
      : [
          [b2[1] / detP, -b2[0] / detP],
          [-b1[1] / detP, b1[0] / detP],
        ];
    return { detP, singular, xPhys, invP };
  }, [b1, b2, uCoord, vCoord]);

  const handleClickPhysical = (px: number, py: number) => {
    if (stats.singular || !stats.invP) return;
    const nu = stats.invP[0][0] * px + stats.invP[0][1] * py;
    const nv = stats.invP[1][0] * px + stats.invP[1][1] * py;
    setUCoord(Number(nu.toFixed(2)));
    setVCoord(Number(nv.toFixed(2)));
  };

  const handleClickBasisSpace = (bu: number, bv: number) => {
    setUCoord(Number(bu.toFixed(2)));
    setVCoord(Number(bv.toFixed(2)));
  };

  const activePreset = useMemo(
    () => BASIS_PRESETS.find((p) => p.id === presetId) ?? BASIS_PRESETS[0],
    [presetId]
  );

  return (
    <section
      aria-label="Basis and Change of Basis Dual Grid Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[var(--bg-canvas)]">
              LAB 2.1.2 • BASIS &amp; CHANGE OF BASIS
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              {activePreset.label}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Coordinate Translation Between Standard{" "}
            <KaTeXMath math="(\hat{\mathbf{i}},\hat{\mathbf{j}})" /> &amp; Oblique Basis{" "}
            <KaTeXMath math="\mathcal{B} = \{\mathbf{b}_1, \mathbf{b}_2\}" />
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {BASIS_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPresetId(p.id);
                setB1(p.b1);
                setB2(p.b2);
                setUCoord(p.u);
                setVCoord(p.v);
              }}
              className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                presetId === p.id
                  ? "border-[var(--math-ink-y)] bg-[#96B898]/15 text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
          <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
            Basis Vector b₁ (Column 1 of P)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              value={b1[0]}
              onChange={(e) => setB1([Number(e.target.value) || 0, b1[1]])}
              className="px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)]"
              aria-label="Basis vector b₁ x-component"
            />
            <input
              type="number"
              step="0.1"
              value={b1[1]}
              onChange={(e) => setB1([b1[0], Number(e.target.value) || 0])}
              className="px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)]"
              aria-label="Basis vector b₁ y-component"
            />
          </div>
        </div>

        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
          <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
            Basis Vector b₂ (Column 2 of P)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              value={b2[0]}
              onChange={(e) => setB2([Number(e.target.value) || 0, b2[1]])}
              className="px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)]"
              aria-label="Basis vector b₂ x-component"
            />
            <input
              type="number"
              step="0.1"
              value={b2[1]}
              onChange={(e) => setB2([b2[0], Number(e.target.value) || 0])}
              className="px-2 py-1 text-xs font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)]"
              aria-label="Basis vector b₂ y-component"
            />
          </div>
        </div>

        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
          <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
            Scrub Basis Coordinates [x]_ℬ = (c₁, c₂)
          </span>
          <div className="space-y-1">
            <input
              type="range"
              min={-2.5}
              max={2.5}
              step={0.05}
              value={uCoord}
              onChange={(e) => setUCoord(Number(e.target.value))}
              className="w-full accent-[#8D9FCE]"
              aria-label="Basis coordinate c₁ along b₁"
            />
            <input
              type="range"
              min={-2.5}
              max={2.5}
              step={0.05}
              value={vCoord}
              onChange={(e) => setVCoord(Number(e.target.value))}
              className="w-full accent-[#96B898]"
              aria-label="Basis coordinate c₂ along b₂"
            />
          </div>
        </div>
      </div>

      {/* Dual Synchronized Planes */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Basis Coordinate Space [x]_B */}
        <div className="border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-3 bg-[var(--bg-canvas)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5" aria-hidden="true" />
              ℬ-Coordinate Space (Click to set [x]_ℬ)
            </span>
            <span className="text-xs font-tabular-mono text-[var(--math-ink-diff)]">
              [x]_ℬ = ⟨{uCoord.toFixed(2)}, {vCoord.toFixed(2)}⟩
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-3.5, 3.5]}
            yRange={[-3.5, 3.5]}
            xLabel="c₁ (along b₁)"
            yLabel="c₂ (along b₂)"
            height={300}
            ariaLabel="Basis coordinate space plane"
            onSelectPoint={handleClickBasisSpace}
          >
            {({ toSvgX, toSvgY }) => (
              <g>
                {/* Unit square in basis space */}
                <rect
                  x={toSvgX(0)}
                  y={toSvgY(1)}
                  width={toSvgX(1) - toSvgX(0)}
                  height={toSvgY(0) - toSvgY(1)}
                  fill="#029091"
                  fillOpacity={0.14}
                  stroke="#029091"
                  strokeWidth={1.2}
                />
                {/* Basis unit vectors (1,0) and (0,1) */}
                <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(1)} y2={toSvgY(0)} stroke="#8D9FCE" strokeWidth={2.5} />
                <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(0)} y2={toSvgY(1)} stroke="#96B898" strokeWidth={2.5} />
                {/* Guide lines to (uCoord, vCoord) */}
                <line x1={toSvgX(uCoord)} y1={toSvgY(0)} x2={toSvgX(uCoord)} y2={toSvgY(vCoord)} stroke="#AAA36D" strokeDasharray="3 3" />
                <line x1={toSvgX(0)} y1={toSvgY(vCoord)} x2={toSvgX(uCoord)} y2={toSvgY(vCoord)} stroke="#AAA36D" strokeDasharray="3 3" />
                {/* Coordinate vector */}
                <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(uCoord)} y2={toSvgY(vCoord)} stroke="#D35323" strokeWidth={2.8} />
                <circle cx={toSvgX(uCoord)} cy={toSvgY(vCoord)} r={5} fill="#FBEAA4" stroke="#1E1F22" strokeWidth={1.4} />
              </g>
            )}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: Physical Standard Space x = P [x]_B */}
        <div className="p-5 space-y-3 bg-[var(--bg-panel)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              Physical Space ℝ² (Click to compute P⁻¹x)
            </span>
            <span className="text-xs font-tabular-mono text-[var(--math-ink-sweep)]">
              x = ⟨{stats.xPhys[0].toFixed(2)}, {stats.xPhys[1].toFixed(2)}⟩
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-4.5, 4.5]}
            yRange={[-4.5, 4.5]}
            height={300}
            ariaLabel="Standard Cartesian space overlaid with oblique basis grid"
            onSelectPoint={handleClickPhysical}
          >
            {({ toSvgX, toSvgY }) => (
              <g>
                {/* Overlaid B-lattice lines */}
                {!stats.singular &&
                  [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => (
                    <g key={k}>
                      <line
                        x1={toSvgX(k * b2[0] - 5 * b1[0])}
                        y1={toSvgY(k * b2[1] - 5 * b1[1])}
                        x2={toSvgX(k * b2[0] + 5 * b1[0])}
                        y2={toSvgY(k * b2[1] + 5 * b1[1])}
                        stroke="#029091"
                        strokeOpacity={0.28}
                        strokeWidth={1}
                      />
                      <line
                        x1={toSvgX(k * b1[0] - 5 * b2[0])}
                        y1={toSvgY(k * b1[1] - 5 * b2[1])}
                        x2={toSvgX(k * b1[0] + 5 * b2[0])}
                        y2={toSvgY(k * b1[1] + 5 * b2[1])}
                        stroke="#029091"
                        strokeOpacity={0.28}
                        strokeWidth={1}
                      />
                    </g>
                  ))}

                {/* Mapped unit parallelogram */}
                <polygon
                  points={`${toSvgX(0)},${toSvgY(0)} ${toSvgX(b1[0])},${toSvgY(b1[1])} ${toSvgX(
                    b1[0] + b2[0]
                  )},${toSvgY(b1[1] + b2[1])} ${toSvgX(b2[0])},${toSvgY(b2[1])}`}
                  fill="#029091"
                  fillOpacity={0.18}
                  stroke="#029091"
                  strokeWidth={1.2}
                />

                {/* Basis arrows b1, b2 */}
                <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(b1[0])} y2={toSvgY(b1[1])} stroke="#8D9FCE" strokeWidth={2.5} />
                <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(b2[0])} y2={toSvgY(b2[1])} stroke="#96B898" strokeWidth={2.5} />

                {/* Mapped point x */}
                <line
                  x1={toSvgX(uCoord * b1[0])}
                  y1={toSvgY(uCoord * b1[1])}
                  x2={toSvgX(stats.xPhys[0])}
                  y2={toSvgY(stats.xPhys[1])}
                  stroke="#AAA36D"
                  strokeDasharray="3 3"
                />
                <line
                  x1={toSvgX(0)}
                  y1={toSvgY(0)}
                  x2={toSvgX(stats.xPhys[0])}
                  y2={toSvgY(stats.xPhys[1])}
                  stroke="#D35323"
                  strokeWidth={2.8}
                />
                <circle
                  cx={toSvgX(stats.xPhys[0])}
                  cy={toSvgY(stats.xPhys[1])}
                  r={5}
                  fill="#FBEAA4"
                  stroke="#1E1F22"
                  strokeWidth={1.4}
                />
              </g>
            )}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Bottom Equation Matrix Summary */}
      <div className="border-t border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-7 overflow-x-auto text-xs">
          <KaTeXMath
            math={`P = \\begin{bmatrix}${b1[0].toFixed(2)} & ${b2[0].toFixed(
              2
            )}\\\\${b1[1].toFixed(2)} & ${b2[1].toFixed(
              2
            )}\\end{bmatrix}, \\quad \\mathbf{x} = P[\\mathbf{x}]_{\\mathcal{B}} = \\begin{bmatrix}${stats.xPhys[0].toFixed(
              2
            )}\\\\${stats.xPhys[1].toFixed(2)}\\end{bmatrix}, \\quad \\det(P) = ${stats.detP.toFixed(
              3
            )}`}
            block
          />
        </div>
        <div className="lg:col-span-5 text-xs font-math-serif text-[var(--text-secondary)]">
          {stats.singular ? (
            <span className="text-[var(--math-ink-upper)] font-tabular-mono flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              det(P) ≈ 0: basis vectors are linearly dependent; P⁻¹ does not exist!
            </span>
          ) : (
            activePreset.note
          )}
        </div>
      </div>
    </section>
  );
}
