"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives";

interface MappingDef {
  id: string;
  label: string;
  formulaLatex: string;
  analytic: boolean;
  rangeZ: [number, number];
  rangeW: [number, number];
  defaultProbe: [number, number];
  mapFn: (x: number, y: number) => [number, number];
  description: string;
}

const MAPPINGS: MappingDef[] = [
  {
    id: "z2",
    label: "w = z²",
    formulaLatex: "w = z^2 = (x^2 - y^2) + i(2xy)",
    analytic: true,
    rangeZ: [-1.8, 1.8],
    rangeW: [-3.8, 3.8],
    defaultProbe: [1.0, 0.7],
    mapFn: (x, y) => [x * x - y * y, 2 * x * y],
    description: "Conformal away from z = 0: angles double around the origin while grid curves stay 90° orthogonal.",
  },
  {
    id: "exp",
    label: "w = e^z",
    formulaLatex: "w = e^z = e^x(\\cos y + i\\sin y)",
    analytic: true,
    rangeZ: [-1.4, 1.4],
    rangeW: [-4.2, 4.2],
    defaultProbe: [0.6, 0.7],
    mapFn: (x, y) => [Math.exp(x) * Math.cos(y), Math.exp(x) * Math.sin(y)],
    description: "Converts vertical x-lines into concentric circles and horizontal y-lines into radial rays.",
  },
  {
    id: "inv",
    label: "w = 1/z",
    formulaLatex: "w = \\frac{1}{z} = \\frac{x - iy}{x^2 + y^2}",
    analytic: true,
    rangeZ: [-2.0, 2.0],
    rangeW: [-3.0, 3.0],
    defaultProbe: [0.9, 0.6],
    mapFn: (x, y) => {
      const r2 = Math.max(0.08, x * x + y * y);
      return [x / r2, -y / r2];
    },
    description: "Möbius inversion swapping the unit circle's interior and exterior while keeping 90° grid corners.",
  },
  {
    id: "joukowski",
    label: "Joukowski Airfoil",
    formulaLatex: "w = z + \\frac{0.35}{z}",
    analytic: true,
    rangeZ: [-2.0, 2.0],
    rangeW: [-3.5, 3.5],
    defaultProbe: [0.9, 0.8],
    mapFn: (x, y) => {
      const r2 = Math.max(0.12, x * x + y * y);
      return [x + (0.35 * x) / r2, y - (0.35 * y) / r2];
    },
    description: "Transforms concentric potential flow circles into cambered aerodynamic streamlines.",
  },
  {
    id: "nonanalytic-shear",
    label: "2x + i(y + 0.8x) [Non-Analytic]",
    formulaLatex: "w = 2x + i(y + 0.8x)",
    analytic: false,
    rangeZ: [-1.8, 1.8],
    rangeW: [-4.0, 4.0],
    defaultProbe: [0.8, 0.7],
    mapFn: (x, y) => [2 * x, y + 0.8 * x],
    description: "Fails Cauchy–Riemann equations: grid corners visibly shear away from 90° orthogonality!",
  },
];

function fmt(n: number, digits = 2): string {
  const clean = Math.abs(n) < 1e-7 ? 0 : n;
  return clean.toFixed(digits);
}

/**
 * Conformal Mapping Grid Morpher & Cauchy-Riemann Orthogonality Lab (5.1.2).
 * Side-by-side z-plane & w-plane plotting orthogonal coordinate grid images,
 * tangent derivatives Tw/dx & Tw/dy, intersection angle, and Cauchy-Riemann residual.
 */
export function ConformalMappingLab() {
  const [mappingId, setMappingId] = useState<string>(MAPPINGS[0].id);
  const [probe, setProbe] = useState<[number, number]>(MAPPINGS[0].defaultProbe);

  const activeMap = useMemo(
    () => MAPPINGS.find((m) => m.id === mappingId) ?? MAPPINGS[0],
    [mappingId]
  );

  const analysis = useMemo(() => {
    const [zMin, zMax] = activeMap.rangeZ;
    const gridVals = [-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].filter(
      (v) => v >= zMin + 0.05 && v <= zMax - 0.05
    );
    const steps = 48;

    const verticalImages: Array<{ val: number; pts: Array<[number, number]> }> = gridVals.map((xConst) => {
      const pts: Array<[number, number]> = [];
      for (let i = 0; i <= steps; i++) {
        const y = zMin + (i / steps) * (zMax - zMin);
        pts.push(activeMap.mapFn(xConst, y));
      }
      return { val: xConst, pts };
    });

    const horizontalImages: Array<{ val: number; pts: Array<[number, number]> }> = gridVals.map((yConst) => {
      const pts: Array<[number, number]> = [];
      for (let i = 0; i <= steps; i++) {
        const x = zMin + (i / steps) * (zMax - zMin);
        pts.push(activeMap.mapFn(x, yConst));
      }
      return { val: yConst, pts };
    });

    // Numerical partial derivatives at probe z0 = (x0, y0)
    const [x0, y0] = probe;
    const h = 1e-4;
    const w0 = activeMap.mapFn(x0, y0);
    const wxp = activeMap.mapFn(x0 + h, y0);
    const wxm = activeMap.mapFn(x0 - h, y0);
    const wyp = activeMap.mapFn(x0, y0 + h);
    const wym = activeMap.mapFn(x0, y0 - h);

    const ux = (wxp[0] - wxm[0]) / (2 * h);
    const vx = (wxp[1] - wxm[1]) / (2 * h);
    const uy = (wyp[0] - wym[0]) / (2 * h);
    const vy = (wyp[1] - wym[1]) / (2 * h);

    const crErr1 = Math.abs(ux - vy);
    const crErr2 = Math.abs(uy + vx);
    const crResidual = crErr1 + crErr2;

    const normTx = Math.hypot(ux, vx);
    const normTy = Math.hypot(uy, vy);
    const dotT = ux * uy + vx * vy;
    const cosAng = normTx > 1e-6 && normTy > 1e-6 ? Math.max(-1, Math.min(1, dotT / (normTx * normTy))) : 0;
    const angleDeg = (Math.acos(cosAng) * 180) / Math.PI;
    const detJ = ux * vy - uy * vx;

    return {
      gridVals,
      verticalImages,
      horizontalImages,
      w0,
      ux,
      vx,
      uy,
      vy,
      crResidual,
      angleDeg,
      scaleFactor: (normTx + normTy) / 2,
      detJ,
    };
  }, [activeMap, probe]);

  const handleSelectMap = (m: MappingDef) => {
    setMappingId(m.id);
    setProbe(m.defaultProbe);
  };

  return (
    <div className="space-y-5">
      {/* Control Header */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#D5658B]">
              Cauchy–Riemann & Conformal Mapping Lab
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">{activeMap.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {MAPPINGS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMap(m)}
                className={`rounded-lg border px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
                  mappingId === m.id
                    ? m.analytic
                      ? "border-[#029091] bg-[#029091]/15 text-[#F6F0D0]"
                      : "border-[#B95869] bg-[#B95869]/15 text-[#F6F0D0]"
                    : "border-[#35383F] bg-[#1E1F22] text-[#A2AAB8] hover:border-[#D5658B]/60 hover:text-[#F6F0D0]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#35383F] bg-[#1E1F22] px-3 py-2">
          <div className="text-sm text-[#F6F0D0]">
            <KaTeXMath math={activeMap.formulaLatex} />
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs tabular-nums">
            <span className="text-[#D35323]">
              z₀ = {fmt(probe[0])} {probe[1] >= 0 ? "+" : "-"} {fmt(Math.abs(probe[1]))}i
            </span>
            <span className="text-[#FBEAA4]">
              w₀ = {fmt(analysis.w0[0])} {analysis.w0[1] >= 0 ? "+" : "-"} {fmt(Math.abs(analysis.w0[1]))}i
            </span>
            <span
              className={`rounded border px-2 py-0.5 font-sans font-semibold ${
                analysis.crResidual < 0.02
                  ? "border-[#029091] text-[#029091]"
                  : "border-[#B95869] text-[#B95869]"
              }`}
            >
              {analysis.crResidual < 0.02 ? `Conformal ∠ = ${fmt(analysis.angleDeg, 1)}°` : `Sheared ∠ = ${fmt(analysis.angleDeg, 1)}°`}
            </span>
          </div>
        </div>
      </div>

      {/* Synchronized Dual 2D Planes: Input z-Plane -> Output w-Plane */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: Input z-plane */}
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                Domain <KaTeXMath math="z = x + iy" /> Plane
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Click anywhere in the <KaTeXMath math="z" />-plane to inspect its conformal image frame.
              </p>
            </div>
            <div className="flex gap-2 font-sans text-[11px]">
              <span className="rounded border border-[#8D9FCE]/50 bg-[#1E1F22] px-2 py-0.5 text-[#8D9FCE]">x = c</span>
              <span className="rounded border border-[#96B898]/50 bg-[#1E1F22] px-2 py-0.5 text-[#96B898]">y = c</span>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={activeMap.rangeZ}
            yRange={activeMap.rangeZ}
            width={480}
            height={380}
            xLabel="x"
            yLabel="y"
            ariaLabel="Complex Domain z-Plane"
            onSelectPoint={(x, y) => setProbe([Math.round(x * 20) / 20, Math.round(y * 20) / 20])}
          >
            {({ toSvgX, toSvgY }) => {
              const [zMin, zMax] = activeMap.rangeZ;
              const px = toSvgX(probe[0]);
              const py = toSvgY(probe[1]);
              const d = 0.4;
              return (
                <g>
                  {analysis.gridVals.map((v) => (
                    <React.Fragment key={v}>
                      <line
                        x1={toSvgX(v)}
                        y1={toSvgY(zMin)}
                        x2={toSvgX(v)}
                        y2={toSvgY(zMax)}
                        stroke="#8D9FCE"
                        strokeWidth={Math.abs(v) < 1e-6 ? 1.8 : 1.2}
                        opacity={0.7}
                      />
                      <line
                        x1={toSvgX(zMin)}
                        y1={toSvgY(v)}
                        x2={toSvgX(zMax)}
                        y2={toSvgY(v)}
                        stroke="#96B898"
                        strokeWidth={Math.abs(v) < 1e-6 ? 1.8 : 1.2}
                        opacity={0.7}
                      />
                    </React.Fragment>
                  ))}

                  {/* Local orthogonal tangent arrows dx, dy at probe */}
                  <line x1={px} y1={py} x2={toSvgX(probe[0] + d)} y2={py} stroke="#8D9FCE" strokeWidth={2.8} />
                  <line x1={px} y1={py} x2={px} y2={toSvgY(probe[1] + d)} stroke="#96B898" strokeWidth={2.8} />
                  <circle cx={px} cy={py} r={6} fill="#D35323" stroke="#F6F0D0" strokeWidth={1.6} />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: Output w-plane */}
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                Codomain <KaTeXMath math="w = u + iv = f(z)" /> Plane
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Images of orthogonal <KaTeXMath math="x" />- and <KaTeXMath math="y" />-grid curves intersect at{" "}
                <KaTeXMath math={`${fmt(analysis.angleDeg, 1)}^\\circ`} />.
              </p>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={activeMap.rangeW}
            yRange={activeMap.rangeW}
            width={480}
            height={380}
            xLabel="u"
            yLabel="v"
            ariaLabel="Complex Codomain w-Plane"
          >
            {({ toSvgX, toSvgY }) => {
              const buildPath = (pts: Array<[number, number]>) =>
                pts
                  .map(([u, v], i) => {
                    const cu = Math.max(-25, Math.min(25, u));
                    const cv = Math.max(-25, Math.min(25, v));
                    return `${i === 0 ? "M" : "L"}${toSvgX(cu).toFixed(1)},${toSvgY(cv).toFixed(1)}`;
                  })
                  .join(" ");

              const wx = toSvgX(analysis.w0[0]);
              const wy = toSvgY(analysis.w0[1]);

              // Normalize visual arrow lengths while preserving relative Jacobian proportions when bounded
              const scale = 0.45;
              const txEnd = [analysis.w0[0] + analysis.ux * scale, analysis.w0[1] + analysis.vx * scale];
              const tyEnd = [analysis.w0[0] + analysis.uy * scale, analysis.w0[1] + analysis.vy * scale];

              return (
                <g>
                  {analysis.verticalImages.map((curve, idx) => (
                    <path
                      key={`v-${idx}`}
                      d={buildPath(curve.pts)}
                      fill="none"
                      stroke="#8D9FCE"
                      strokeWidth={Math.abs(curve.val) < 1e-6 ? 1.9 : 1.25}
                      opacity={0.78}
                    />
                  ))}
                  {analysis.horizontalImages.map((curve, idx) => (
                    <path
                      key={`h-${idx}`}
                      d={buildPath(curve.pts)}
                      fill="none"
                      stroke="#96B898"
                      strokeWidth={Math.abs(curve.val) < 1e-6 ? 1.9 : 1.25}
                      opacity={0.78}
                    />
                  ))}

                  {/* Pushforward tangent vectors ∂w/∂x and ∂w/∂y */}
                  <line
                    x1={wx}
                    y1={wy}
                    x2={toSvgX(txEnd[0])}
                    y2={toSvgY(txEnd[1])}
                    stroke="#FBEAA4"
                    strokeWidth={2.8}
                  />
                  <line
                    x1={wx}
                    y1={wy}
                    x2={toSvgX(tyEnd[0])}
                    y2={toSvgY(tyEnd[1])}
                    stroke="#D5658B"
                    strokeWidth={2.8}
                  />
                  <circle cx={wx} cy={wy} r={6} fill="#D35323" stroke="#F6F0D0" strokeWidth={1.6} />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Live Cauchy-Riemann Jacobian Matrix Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#8D9FCE]">
            Real 2×2 Jacobian Matrix at z₀
          </p>
          <div className="mt-2 text-sm text-[#F6F0D0]">
            <KaTeXMath
              block
              math={`J_f = \\begin{bmatrix} u_x & u_y \\\\ v_x & v_y \\end{bmatrix} = \\begin{bmatrix} ${fmt(analysis.ux)} & ${fmt(analysis.uy)} \\\\ ${fmt(analysis.vx)} & ${fmt(analysis.vy)} \\end{bmatrix}`}
            />
          </div>
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 font-mono text-xs tabular-nums text-[#D6DAE2]">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#029091]">
            Cauchy–Riemann Test
          </p>
          <div className="mt-2.5 space-y-1.5">
            <div>
              uₓ − vᵧ = <span className="text-[#FBEAA4]">{fmt(analysis.ux - analysis.vy, 4)}</span>
            </div>
            <div>
              uᵧ + vₓ = <span className="text-[#FBEAA4]">{fmt(analysis.uy + analysis.vx, 4)}</span>
            </div>
            <div>
              Intersection ∠(∂w/∂x, ∂w/∂y) ={" "}
              <span className={analysis.crResidual < 0.02 ? "text-[#029091]" : "text-[#B95869]"}>
                {fmt(analysis.angleDeg, 2)}°
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 font-mono text-xs tabular-nums text-[#D6DAE2]">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#D5658B]">
            Local Ampliﬁcation |f&apos;(z₀)|
          </p>
          <div className="mt-2.5 space-y-1.5">
            <div>
              Linear Scale |f&apos;(z₀)| ≈ <span className="text-[#FBEAA4]">{fmt(analysis.scaleFactor, 3)}</span>
            </div>
            <div>
              Area Jacobian det(J) = <span className="text-[#96B898]">{fmt(analysis.detJ, 3)}</span>
            </div>
            <div className="font-sans text-[11px] text-[#A2AAB8]">
              For analytic functions, det(J) = uₓ² + vₓ² = |f&apos;(z)|².
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
