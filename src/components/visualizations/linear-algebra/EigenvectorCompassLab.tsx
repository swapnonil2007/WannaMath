"use client";

import React, { useEffect, useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

type Mat2 = [number, number, number, number]; // [a11, a12, a21, a22]

interface EigenPreset {
  id: string;
  label: string;
  matrix: Mat2;
  note: string;
}

const PRESETS: EigenPreset[] = [
  {
    id: "symmetric-stretch",
    label: "Symmetric Stretch",
    matrix: [1.8, 0.6, 0.6, 1.2],
    note: "Real distinct eigenvalues with orthogonal eigenvectors (symmetric matrix).",
  },
  {
    id: "saddle-mixed",
    label: "Hyperbolic Saddle",
    matrix: [1.4, 0.8, 0.8, -0.5],
    note: "One positive and one negative eigenvalue: stretch along one ray, flip+compress along the other.",
  },
  {
    id: "defective-shear",
    label: "Defective Shear",
    matrix: [1.5, 1.0, 0.0, 1.5],
    note: "Repeated eigenvalue λ = 1.5 with only ONE independent eigenvector direction (algebraic 2, geometric 1).",
  },
  {
    id: "pure-rotation",
    label: "45° Scaled Rotation",
    matrix: [1.0, -1.0, 1.0, 1.0],
    note: "Complex conjugate eigenvalues λ = 1 ± i: NO real vector stays on its own line!",
  },
];

function fmt(n: number, digits = 2): string {
  const clean = Math.abs(n) < 1e-8 ? 0 : n;
  return clean.toFixed(digits);
}

interface EigenAnalysis {
  trace: number;
  det: number;
  disc: number;
  kind: "distinct-real" | "repeated-real" | "complex";
  lambdasReal: [number, number] | null;
  complexPart: number;
  vectors: Array<{ lambda: number; angle: number; vec: [number, number] }>;
}

function solveEigen2x2(m: Mat2): EigenAnalysis {
  const [a, b, c, d] = m;
  const trace = a + d;
  const det = a * d - b * c;
  const disc = trace * trace - 4 * det;

  if (disc < -1e-6) {
    return {
      trace,
      det,
      disc,
      kind: "complex",
      lambdasReal: null,
      complexPart: Math.sqrt(-disc) / 2,
      vectors: [],
    };
  }

  const sqrtDisc = Math.sqrt(Math.max(0, disc));
  const l1 = (trace + sqrtDisc) / 2;
  const l2 = (trace - sqrtDisc) / 2;

  const findUnitVec = (lambda: number): [number, number] | null => {
    // Row 1: (a - lambda, b), Row 2: (c, d - lambda)
    const r1 = [a - lambda, b] as const;
    const r2 = [c, d - lambda] as const;
    const n1 = Math.hypot(r1[0], r1[1]);
    const n2 = Math.hypot(r2[0], r2[1]);
    const row = n1 >= n2 ? r1 : r2;
    const norm = Math.max(n1, n2);
    if (norm < 1e-7) {
      return null; // Scalar multiple of identity: every direction is an eigenvector
    }
    const vx = -row[1] / norm;
    const vy = row[0] / norm;
    return [vx, vy];
  };

  if (Math.abs(disc) <= 1e-5) {
    const v = findUnitVec(l1);
    const vectors = v
      ? [{ lambda: l1, angle: Math.atan2(v[1], v[0]), vec: v }]
      : [
          { lambda: l1, angle: 0, vec: [1, 0] as [number, number] },
          { lambda: l1, angle: Math.PI / 2, vec: [0, 1] as [number, number] },
        ];
    return {
      trace,
      det,
      disc,
      kind: "repeated-real",
      lambdasReal: [l1, l2],
      complexPart: 0,
      vectors,
    };
  }

  const v1 = findUnitVec(l1) ?? [1, 0];
  const v2 = findUnitVec(l2) ?? [0, 1];
  return {
    trace,
    det,
    disc,
    kind: "distinct-real",
    lambdasReal: [l1, l2],
    complexPart: 0,
    vectors: [
      { lambda: l1, angle: Math.atan2(v1[1], v1[0]), vec: v1 },
      { lambda: l2, angle: Math.atan2(v2[1], v2[0]), vec: v2 },
    ],
  };
}

/**
 * Interactive Eigenvector Compass & Characteristic Polynomial Lab (2.3.1).
 * Sweep unit vector v(θ) to align Av collinearly with v alongside live det(A - λI) curve.
 */
export function EigenvectorCompassLab() {
  const [matrix, setMatrix] = useState<Mat2>(PRESETS[0].matrix);
  const [activePresetId, setActivePresetId] = useState<string>(PRESETS[0].id);
  const [thetaDeg, setThetaDeg] = useState<number>(20);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);

  useEffect(() => {
    if (!isSweeping) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setThetaDeg((prev) => (prev + dt * 48) % 360);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isSweeping]);

  const eigen = useMemo(() => solveEigen2x2(matrix), [matrix]);

  const state = useMemo(() => {
    const theta = (thetaDeg * Math.PI) / 180;
    const vx = Math.cos(theta);
    const vy = Math.sin(theta);
    const avx = matrix[0] * vx + matrix[1] * vy;
    const avy = matrix[2] * vx + matrix[3] * vy;
    const normAv = Math.hypot(avx, avy);
    const cross = vx * avy - vy * avx; // sin(angle between v and Av) * |Av|
    const rayleigh = vx * avx + vy * avy; // v^T A v
    const perpNorm = Math.abs(cross);
    const isCollinear = perpNorm < 0.065;

    // Unit circle mapped through A for background visual reference
    const ellipsePts: Array<[number, number]> = [];
    for (let i = 0; i <= 72; i++) {
      const t = (i / 72) * Math.PI * 2;
      const cx = Math.cos(t);
      const cy = Math.sin(t);
      ellipsePts.push([matrix[0] * cx + matrix[1] * cy, matrix[2] * cx + matrix[3] * cy]);
    }

    return { vx, vy, avx, avy, normAv, cross, rayleigh, perpNorm, isCollinear, ellipsePts };
  }, [matrix, thetaDeg]);

  const updateEntry = (idx: 0 | 1 | 2 | 3, val: number) => {
    setActivePresetId("custom");
    setMatrix((prev) => {
      const next: Mat2 = [...prev] as Mat2;
      next[idx] = val;
      return next;
    });
  };

  const snapToEigenvector = (angleRad: number) => {
    setIsSweeping(false);
    let deg = (angleRad * 180) / Math.PI;
    if (deg < 0) deg += 360;
    setThetaDeg(Math.round(deg * 10) / 10);
  };

  // Characteristic polynomial curve viewport helpers
  const polyChart = useMemo(() => {
    const center = eigen.trace / 2;
    const span = Math.max(3.2, eigen.lambdasReal ? Math.abs(eigen.lambdasReal[0] - eigen.lambdasReal[1]) + 2 : 3.5);
    const xMin = center - span;
    const xMax = center + span;
    const samples: Array<{ x: number; y: number }> = [];
    let yMin = -1;
    let yMax = 2;
    for (let i = 0; i <= 80; i++) {
      const l = xMin + (i / 80) * (xMax - xMin);
      const p = l * l - eigen.trace * l + eigen.det;
      samples.push({ x: l, y: p });
      yMin = Math.min(yMin, p);
      yMax = Math.max(yMax, p);
    }
    const padY = Math.max(0.8, (yMax - yMin) * 0.15);
    yMin -= padY;
    yMax += padY;
    return { xMin, xMax, yMin, yMax, samples };
  }, [eigen]);

  return (
    <div className="space-y-5">
      {/* Control Header */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#28B7B8]">
              Invariant Eigendirection Compass
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">
              Sweep <KaTeXMath math="\mathbf{v}(\theta) = [\cos\theta,\sin\theta]^T" /> around the unit circle until{" "}
              <KaTeXMath math="A\mathbf{v}" /> points cleanly along the same line as <KaTeXMath math="\mathbf{v}" />.
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
            <div className="mb-2 flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[#F6F0D0]">Matrix A Entries</span>
              <span className="font-mono text-xs text-[#AAA36D]">tr={fmt(eigen.trace)}, det={fmt(eigen.det)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([0, 1, 2, 3] as const).map((idx) => (
                <label key={idx} className="flex items-center justify-between gap-1.5 rounded border border-[#35383F] bg-[#26282C] px-2 py-1">
                  <span className="font-mono text-[11px] text-[#A2AAB8]">
                    a{idx < 2 ? `₁${idx + 1}` : `₂${idx - 1}`}
                  </span>
                  <input
                    type="number"
                    step={0.1}
                    min={-3}
                    max={3}
                    value={matrix[idx]}
                    onChange={(e) => updateEntry(idx, parseFloat(e.target.value) || 0)}
                    className="w-14 bg-transparent text-right font-mono text-xs tabular-nums text-[#F6F0D0] focus:outline-none"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Angle Compass Scrubber */}
          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[#8D9FCE]">
                Probe Angle θ = {fmt(thetaDeg, 1)}°
              </span>
              <button
                type="button"
                onClick={() => setIsSweeping((s) => !s)}
                className={`rounded border px-2.5 py-0.5 font-sans text-xs font-medium ${
                  isSweeping
                    ? "border-[#D35323] bg-[#D35323]/20 text-[#FBEAA4]"
                    : "border-[#35383F] bg-[#26282C] text-[#F6F0D0] hover:border-[#8D9FCE]"
                }`}
              >
                {isSweeping ? "Pause Sweep" : "Auto-Sweep"}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={0.5}
              value={thetaDeg}
              onChange={(e) => {
                setIsSweeping(false);
                setThetaDeg(parseFloat(e.target.value));
              }}
              className="mt-3 w-full accent-[#8D9FCE]"
              aria-label="Input unit vector angle θ (degrees)"
            />
            <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-[#A2AAB8]">
              <span>|v × Av| = {fmt(state.perpNorm, 3)}</span>
              <span className={state.isCollinear ? "font-semibold text-[#28B7B8]" : "text-[#EF7547]"}>
                {state.isCollinear ? "COLLINEAR (EIGENVECTOR)" : "ROTATED"}
              </span>
            </div>
          </div>

          {/* Snap-to-Eigenvector Quick Triggers */}
          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <span className="font-sans text-xs font-semibold text-[#F6F0D0]">Eigenvalue Classification</span>
            {eigen.kind === "complex" ? (
              <div className="mt-2 space-y-1 font-mono text-xs text-[#DF7E90]">
                <div>Complex Conjugate Pair (Δ = {fmt(eigen.disc)} &lt; 0):</div>
                <div className="text-[#FBEAA4]">
                  λ = {fmt(eigen.trace / 2)} ± {fmt(eigen.complexPart)}i
                </div>
                <p className="font-sans text-[11px] text-[#A2AAB8]">
                  Zero real invariant rays exist: every vector rotates continuously.
                </p>
              </div>
            ) : (
              <div className="mt-2 space-y-1.5">
                {eigen.vectors.map((ev, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => snapToEigenvector(ev.angle)}
                    className="flex w-full items-center justify-between rounded border border-[#35383F] bg-[#26282C] px-2.5 py-1 text-left font-mono text-xs hover:border-[#029091]"
                  >
                    <span className="text-[#28B7B8]">Snap λ{i + 1} = {fmt(ev.lambda, 2)}</span>
                    <span className="text-[#A2AAB8]">
                      v = [{fmt(ev.vec[0], 2)}, {fmt(ev.vec[1], 2)}]ᵀ
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Dual Visualization */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: Unit Circle & Vector Compass */}
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                2D Vector Action Compass: <KaTeXMath math="\mathbf{v}" /> vs. <KaTeXMath math="A\mathbf{v}" />
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Click anywhere on the plane to aim <KaTeXMath math="\mathbf{v}(\theta)" />.
              </p>
            </div>
            <div className="flex gap-2 font-sans text-[11px]">
              <span className="rounded border border-[#8D9FCE]/50 bg-[#1E1F22] px-2 py-0.5 text-[#8D9FCE]">v</span>
              <span className="rounded border border-[#D35323]/50 bg-[#1E1F22] px-2 py-0.5 text-[#EF7547]">Av</span>
              <span className="rounded border border-[#029091]/50 bg-[#1E1F22] px-2 py-0.5 text-[#28B7B8]">
                Eigenrays
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
            ariaLabel="2D Eigenvector Compass"
            onSelectPoint={(x, y) => {
              if (Math.hypot(x, y) < 0.05) return;
              snapToEigenvector(Math.atan2(y, x));
            }}
          >
            {({ toSvgX, toSvgY }) => {
              const ox = toSvgX(0);
              const oy = toSvgY(0);
              const circlePath = Array.from({ length: 73 }, (_, i) => {
                const t = (i / 72) * Math.PI * 2;
                return `${i === 0 ? "M" : "L"}${toSvgX(Math.cos(t)).toFixed(1)},${toSvgY(Math.sin(t)).toFixed(1)}`;
              }).join(" ");

              const ellipsePath = state.ellipsePts
                .map(([px, py], i) => `${i === 0 ? "M" : "L"}${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`)
                .join(" ");

              const vxSvg = toSvgX(state.vx);
              const vySvg = toSvgY(state.vy);
              const avxSvg = toSvgX(state.avx);
              const avySvg = toSvgY(state.avy);

              return (
                <g>
                  {/* Invariant eigenrays */}
                  {eigen.vectors.map((ev, i) => (
                    <line
                      key={i}
                      x1={toSvgX(-ev.vec[0] * 3.1)}
                      y1={toSvgY(-ev.vec[1] * 3.1)}
                      x2={toSvgX(ev.vec[0] * 3.1)}
                      y2={toSvgY(ev.vec[1] * 3.1)}
                      stroke="#029091"
                      strokeWidth={1.6}
                      strokeDasharray="6 4"
                      opacity={0.75}
                    />
                  ))}

                  {/* Unit Circle & Image Ellipse */}
                  <path d={circlePath} fill="none" stroke="#8D9FCE" strokeWidth={1.3} opacity={0.45} />
                  <path d={ellipsePath} fill="#D35323" fillOpacity={0.07} stroke="#D35323" strokeWidth={1.5} opacity={0.7} />

                  {/* Vector Av */}
                  <line
                    x1={ox}
                    y1={oy}
                    x2={avxSvg}
                    y2={avySvg}
                    stroke={state.isCollinear ? "#029091" : "#D35323"}
                    strokeWidth={3.2}
                    strokeLinecap="round"
                  />
                  <circle cx={avxSvg} cy={avySvg} r={5} fill={state.isCollinear ? "#029091" : "#D35323"} />
                  <text x={avxSvg + 8} y={avySvg - 6} fill="#FBEAA4" fontSize="12" fontFamily="monospace">
                    Av ({fmt(state.avx, 2)}, {fmt(state.avy, 2)})
                  </text>

                  {/* Unit input vector v */}
                  <line
                    x1={ox}
                    y1={oy}
                    x2={vxSvg}
                    y2={vySvg}
                    stroke="#8D9FCE"
                    strokeWidth={2.8}
                    strokeLinecap="round"
                  />
                  <circle cx={vxSvg} cy={vySvg} r={5.5} fill="#8D9FCE" stroke="#F6F0D0" strokeWidth={1.5} />
                  <text x={vxSvg + 8} y={vySvg + 14} fill="#8D9FCE" fontSize="12" fontFamily="monospace">
                    v
                  </text>
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: Characteristic Polynomial & Rayleigh Readout */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                  Characteristic Polynomial <KaTeXMath math="p(\lambda) = \det(A - \lambda I)" />
                </h3>
                <p className="font-sans text-xs text-[#A2AAB8]">
                  Real roots <KaTeXMath math="p(\lambda)=0" /> correspond to invariant scaling factors along eigenrays.
                </p>
              </div>
            </div>

            <div className="mt-2 rounded border border-[#35383F] bg-[#1E1F22] p-2">
              <KaTeXMath
                block
                math={`\\det(A - \\lambda I) = \\lambda^2 ${eigen.trace >= 0 ? "-" : "+"} ${fmt(Math.abs(eigen.trace), 2)}\\lambda ${eigen.det >= 0 ? "+" : "-"} ${fmt(Math.abs(eigen.det), 2)} = 0`}
              />
            </div>

            <svg
              role="img"
              aria-label="Characteristic polynomial p(lambda) parabola plot with real eigenvalue roots and interactive Rayleigh quotient marker"
              viewBox="0 0 460 230"
              className="mt-3 w-full rounded-lg border border-[#35383F] bg-[#1E1F22]"
            >
              {(() => {
                const pad = 34;
                const w = 460 - 2 * pad;
                const h = 230 - 2 * pad;
                const sx = (x: number) => pad + ((x - polyChart.xMin) / (polyChart.xMax - polyChart.xMin)) * w;
                const sy = (y: number) => 230 - pad - ((y - polyChart.yMin) / (polyChart.yMax - polyChart.yMin)) * h;
                const zeroY = sy(0);
                const zeroX = sx(0);
                const curvePath = polyChart.samples
                  .map((pt, i) => `${i === 0 ? "M" : "L"}${sx(pt.x).toFixed(1)},${sy(pt.y).toFixed(1)}`)
                  .join(" ");

                const rqX = sx(Math.max(polyChart.xMin, Math.min(polyChart.xMax, state.rayleigh)));
                const rqVal = state.rayleigh * state.rayleigh - eigen.trace * state.rayleigh + eigen.det;

                return (
                  <g>
                    {/* Axes */}
                    {zeroY >= pad && zeroY <= 230 - pad && (
                      <line x1={pad} y1={zeroY} x2={460 - pad} y2={zeroY} stroke="#4B505C" strokeWidth={1.2} />
                    )}
                    {zeroX >= pad && zeroX <= 460 - pad && (
                      <line x1={zeroX} y1={pad} x2={zeroX} y2={230 - pad} stroke="#4B505C" strokeWidth={1.2} />
                    )}

                    {/* Parabola */}
                    <path d={curvePath} fill="none" stroke="#96B898" strokeWidth={2.5} />

                    {/* Current Rayleigh quotient marker */}
                    <line
                      x1={rqX}
                      y1={zeroY}
                      x2={rqX}
                      y2={sy(rqVal)}
                      stroke="#FBEAA4"
                      strokeDasharray="3 3"
                      strokeWidth={1.3}
                    />
                    <circle cx={rqX} cy={zeroY} r={4.5} fill="#FBEAA4" />

                    {/* Real Eigenvalue Roots */}
                    {eigen.lambdasReal &&
                      eigen.lambdasReal.map((lam, idx) => (
                        <g key={idx}>
                          <circle cx={sx(lam)} cy={zeroY} r={6} fill="#029091" stroke="#F6F0D0" strokeWidth={1.5} />
                          <text
                            x={sx(lam)}
                            y={zeroY - 11}
                            textAnchor="middle"
                            fill="#28B7B8"
                            fontSize="11"
                            fontFamily="monospace"
                          >
                            λ{idx + 1}={fmt(lam, 2)}
                          </text>
                        </g>
                      ))}

                    <text x={460 - pad} y={zeroY + 14} textAnchor="end" fill="#A2AAB8" fontSize="11">
                      λ
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Numeric Invariant Summary */}
          <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 font-mono text-xs tabular-nums text-[#D6DAE2]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#A2AAB8] block">Rayleigh Quotient vᵀAv</span>
                <span className="text-base font-semibold text-[#FBEAA4]">{fmt(state.rayleigh, 3)}</span>
              </div>
              <div>
                <span className="text-[#A2AAB8] block">Output Stretch ‖Av‖₂</span>
                <span className="text-base font-semibold text-[#EF7547]">{fmt(state.normAv, 3)}</span>
              </div>
              <div>
                <span className="text-[#A2AAB8] block">Trace = λ₁ + λ₂</span>
                <span className="text-sm text-[#8D9FCE]">{fmt(eigen.trace, 3)}</span>
              </div>
              <div>
                <span className="text-[#A2AAB8] block">Determinant = λ₁ · λ₂</span>
                <span className="text-sm text-[#96B898]">{fmt(eigen.det, 3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
