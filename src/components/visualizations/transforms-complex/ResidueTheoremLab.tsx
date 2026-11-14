"use client";

import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  createParametricSurfaceMesh,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

interface Cplx {
  re: number;
  im: number;
}

const cAdd = (a: Cplx, b: Cplx): Cplx => ({ re: a.re + b.re, im: a.im + b.im });
const cSub = (a: Cplx, b: Cplx): Cplx => ({ re: a.re - b.re, im: a.im - b.im });
const cMul = (a: Cplx, b: Cplx): Cplx => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
const cDiv = (a: Cplx, b: Cplx): Cplx => {
  const d = Math.max(1e-8, b.re * b.re + b.im * b.im);
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
};

interface PoleSpec {
  z: Cplx;
  order: number;
  residue: Cplx;
  label: string;
}

interface ResiduePreset {
  id: string;
  label: string;
  formulaLatex: string;
  realIntegralLatex: string;
  poles: PoleSpec[];
  evalFn: (z: Cplx) => Cplx;
  defaultCenter: [number, number];
  defaultRadius: number;
  note: string;
}

const PRESETS: ResiduePreset[] = [
  {
    id: "lorentzian",
    label: "1 / (z² + 1)",
    formulaLatex: "f(z) = \\frac{1}{z^2 + 1}",
    realIntegralLatex: "\\int_{-\\infty}^{\\infty} \\frac{dx}{x^2+1} = 2\\pi i \\cdot \\frac{1}{2i} = \\pi",
    poles: [
      { z: { re: 0, im: 1 }, order: 1, residue: { re: 0, im: -0.5 }, label: "+i" },
      { z: { re: 0, im: -1 }, order: 1, residue: { re: 0, im: 0.5 }, label: "−i" },
    ],
    evalFn: (z) => cDiv({ re: 1, im: 0 }, cAdd(cMul(z, z), { re: 1, im: 0 })),
    defaultCenter: [0, 1.0],
    defaultRadius: 0.85,
    note: "Classic real-axis UHP closure: enclosing z = +i contributes 2πi(−i/2) = π.",
  },
  {
    id: "quartic",
    label: "1 / ((z²+0.6²)(z²+1.6²))",
    formulaLatex: "f(z) = \\frac{1}{(z^2 + 0.36)(z^2 + 2.56)}",
    realIntegralLatex: "\\int_{-\\infty}^{\\infty} \\frac{dx}{(x^2+a^2)(x^2+b^2)} = \\frac{\\pi}{ab(a+b)}",
    poles: [
      { z: { re: 0, im: 0.6 }, order: 1, residue: { re: 0, im: -1 / (2 * 0.6 * (2.56 - 0.36)) }, label: "+0.6i" },
      { z: { re: 0, im: 1.6 }, order: 1, residue: { re: 0, im: -1 / (2 * 1.6 * (0.36 - 2.56)) }, label: "+1.6i" },
      { z: { re: 0, im: -0.6 }, order: 1, residue: { re: 0, im: 1 / (2 * 0.6 * (2.56 - 0.36)) }, label: "−0.6i" },
      { z: { re: 0, im: -1.6 }, order: 1, residue: { re: 0, im: 1 / (2 * 1.6 * (0.36 - 2.56)) }, label: "−1.6i" },
    ],
    evalFn: (z) => {
      const z2 = cMul(z, z);
      return cDiv({ re: 1, im: 0 }, cMul(cAdd(z2, { re: 0.36, im: 0 }), cAdd(z2, { re: 2.56, im: 0 })));
    },
    defaultCenter: [0, 1.1],
    defaultRadius: 1.0,
    note: "Four pole chimneys aligned on the imaginary axis; selectively enclose +0.6i or both upper poles.",
  },
  {
    id: "double-pole",
    label: "z / (z − 0.8)² + 0.5/(z + 0.9)",
    formulaLatex: "f(z) = \\frac{z}{(z - 0.8)^2} + \\frac{0.5}{z + 0.9}",
    realIntegralLatex: "\\operatorname{Res}\\!\\left(\\frac{z}{(z-z_0)^2}, z_0\\right) = \\left.\\frac{d}{dz}(z)\\right|_{z_0} = 1",
    poles: [
      { z: { re: 0.8, im: 0 }, order: 2, residue: { re: 1, im: 0 }, label: "0.8 (Order 2)" },
      { z: { re: -0.9, im: 0 }, order: 1, residue: { re: 0.5, im: 0 }, label: "−0.9 (Simple)" },
    ],
    evalFn: (z) => {
      const dz1 = cSub(z, { re: 0.8, im: 0 });
      const term1 = cDiv(z, cMul(dz1, dz1));
      const term2 = cDiv({ re: 0.5, im: 0 }, cAdd(z, { re: 0.9, im: 0 }));
      return cAdd(term1, term2);
    },
    defaultCenter: [0.6, 0],
    defaultRadius: 0.8,
    note: "Contrast an order-2 pole tower (whose residue uses derivative d/dz) against a simple pole.",
  },
];

function fmt(n: number, digits = 3): string {
  const clean = Math.abs(n) < 1e-6 ? 0 : n;
  return clean.toFixed(digits);
}

/**
 * 3D Complex Modulus Pole Surface |f(z)| & Residue Summation Lab (5.2.2).
 * Visualizes pole chimneys in 3D alongside a 2D clickable contour summing 2πi Σ Res(f, z_k).
 */
export function ResidueTheoremLab() {
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [center, setCenter] = useState<[number, number]>(PRESETS[0].defaultCenter);
  const [radius, setRadius] = useState<number>(PRESETS[0].defaultRadius);
  const [uhpMode, setUhpMode] = useState<boolean>(false);

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId]
  );

  const evalContour = useMemo(() => {
    const insidePoles = preset.poles.map((p) => {
      const enclosed = uhpMode
        ? p.z.im > 0 && Math.hypot(p.z.re, p.z.im) < 2.2
        : Math.hypot(p.z.re - center[0], p.z.im - center[1]) < radius;
      return { ...p, enclosed };
    });

    const sumRes = insidePoles.reduce<Cplx>(
      (acc, p) => (p.enclosed ? cAdd(acc, p.residue) : acc),
      { re: 0, im: 0 }
    );
    const integralExact = cMul({ re: 0, im: 2 * Math.PI }, sumRes);

    return { insidePoles, sumRes, integralExact };
  }, [preset, center, radius, uhpMode]);

  const applyPreset = (p: ResiduePreset) => {
    setPresetId(p.id);
    setCenter(p.defaultCenter);
    setRadius(p.defaultRadius);
    setUhpMode(false);
  };

  return (
    <div className="space-y-5">
      {/* Control Header */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#DF7E90]">
              3D Pole Landscape |f(z)| & Residue Summing Lab
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">{preset.note}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className={`rounded-lg border px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
                  presetId === p.id
                    ? "border-[#B95869] bg-[#B95869]/15 text-[#F6F0D0]"
                    : "border-[#35383F] bg-[#1E1F22] text-[#A2AAB8] hover:border-[#B95869]/60 hover:text-[#F6F0D0]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <span className="font-sans text-xs font-semibold text-[#28B7B8]">Contour Mode</span>
            <div className="mt-2 grid grid-cols-2 gap-2 font-sans text-xs">
              <button
                type="button"
                onClick={() => setUhpMode(false)}
                className={`rounded border py-1 ${
                  !uhpMode
                    ? "border-[#029091] bg-[#029091]/20 text-[#F6F0D0]"
                    : "border-[#35383F] bg-[#26282C] text-[#A2AAB8]"
                }`}
              >
                Draggable Circle C
              </button>
              <button
                type="button"
                onClick={() => setUhpMode(true)}
                className={`rounded border py-1 ${
                  uhpMode
                    ? "border-[#D35323] bg-[#D35323]/20 text-[#FBEAA4]"
                    : "border-[#35383F] bg-[#26282C] text-[#A2AAB8]"
                }`}
              >
                UHP Semicircle
              </button>
            </div>
          </div>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#FBEAA4]">
              <span>Circle Radius R</span>
              <span>{uhpMode ? "2.20 (UHP)" : fmt(radius, 2)}</span>
            </div>
            <input
              type="range"
              min={0.35}
              max={2.1}
              step={0.05}
              disabled={uhpMode}
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#FBEAA4] disabled:opacity-40"
            />
          </label>

          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3 font-mono text-xs">
            <span className="font-sans font-semibold text-[#E37CA0] block">Active Equation</span>
            <div className="mt-1 text-[#F6F0D0]">
              <KaTeXMath math={preset.formulaLatex} />
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized 3D Surface + 2D Contour Map */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                3D Modulus Surface <KaTeXMath math="z = |f(x + iy)|" />
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Poles erupt upward as infinite towers inside the elevated contour loop <KaTeXMath math="C" />.
              </p>
            </div>
          </div>

          <ThreeOrbitViewport
            heightClassName="h-[360px]"
            cameraPosition={[4.6, 3.8, 4.6]}
            cameraTarget={[0, 0.7, 0]}
            titleBadge="|f(z)| Pole Chimneys"
            sceneDeps={[preset, center, radius, uhpMode]}
            onBuildScene={(group) => {
              const surf = createParametricSurfaceMesh(
                (x, y) => {
                  const val = preset.evalFn({ re: x, im: y });
                  const mag = Math.min(2.8, Math.hypot(val.re, val.im) * 0.75);
                  return [x, y, mag];
                },
                [-2.2, 2.2],
                [-2.2, 2.2],
                44,
                44,
                {
                  color: 0x029091,
                  opacity: 0.72,
                  wireframeColor: 0xfbeaa4,
                  wireframeOpacity: 0.2,
                  showWireframe: true,
                }
              );
              group.add(surf);

              // Elevated Contour ring hovering at height 0.9
              const ringPts: THREE.Vector3[] = [];
              const N = 96;
              if (uhpMode) {
                for (let i = 0; i <= N; i++) {
                  const th = (i / N) * Math.PI;
                  ringPts.push(mathToThreeVec3(2.2 * Math.cos(th), 2.2 * Math.sin(th), 0.55));
                }
                ringPts.push(mathToThreeVec3(-2.2, 0, 0.55));
                ringPts.push(mathToThreeVec3(2.2, 0, 0.55));
              } else {
                for (let i = 0; i <= N; i++) {
                  const th = (i / N) * Math.PI * 2;
                  ringPts.push(
                    mathToThreeVec3(
                      center[0] + radius * Math.cos(th),
                      center[1] + radius * Math.sin(th),
                      0.55
                    )
                  );
                }
              }
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(ringPts),
                  new THREE.LineBasicMaterial({ color: 0xd35323 })
                )
              );
            }}
            footerSlot={
              <div className="flex justify-between font-mono text-xs text-[#A2AAB8]">
                <span className="text-[#EF7547]">Hovering Ring: Contour C</span>
                <span className="text-[#FBEAA4]">Height clamped at 2.8 for clarity</span>
              </div>
            }
          />
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                2D Pole Encloser <KaTeXMath math="\mathbb{C}" />
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Click anywhere in 2D circle mode to capture different pole combinations.
              </p>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-2.5, 2.5]}
            yRange={[-2.5, 2.5]}
            width={480}
            height={360}
            xLabel="Re z"
            yLabel="Im z"
            ariaLabel="2D Residue Contour Map"
            onSelectPoint={(x, y) => {
              if (!uhpMode) setCenter([Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
            }}
          >
            {({ toSvgX, toSvgY }) => {
              const loopPts: Array<[number, number]> = [];
              if (uhpMode) {
                for (let i = 0; i <= 48; i++) {
                  const th = (i / 48) * Math.PI;
                  loopPts.push([2.2 * Math.cos(th), 2.2 * Math.sin(th)]);
                }
                loopPts.push([-2.2, 0], [2.2, 0]);
              } else {
                for (let i = 0; i <= 64; i++) {
                  const th = (i / 64) * Math.PI * 2;
                  loopPts.push([center[0] + radius * Math.cos(th), center[1] + radius * Math.sin(th)]);
                }
              }
              const pathD = loopPts
                .map(([x, y], i) => `${i === 0 ? "M" : "L"}${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`)
                .join(" ");

              return (
                <g>
                  <path d={pathD} fill="#D35323" fillOpacity={0.14} stroke="#D35323" strokeWidth={2.4} />
                  {evalContour.insidePoles.map((p, idx) => {
                    const px = toSvgX(p.z.re);
                    const py = toSvgY(p.z.im);
                    return (
                      <g key={idx}>
                        <circle
                          cx={px}
                          cy={py}
                          r={8}
                          fill={p.enclosed ? "#B95869" : "none"}
                          fillOpacity={0.25}
                          stroke={p.enclosed ? "#FBEAA4" : "#626776"}
                          strokeWidth={1.3}
                        />
                        <line x1={px - 6} y1={py - 6} x2={px + 6} y2={py + 6} stroke={p.enclosed ? "#D35323" : "#A2AAB8"} strokeWidth={2.6} />
                        <line x1={px - 6} y1={py + 6} x2={px + 6} y2={py - 6} stroke={p.enclosed ? "#D35323" : "#A2AAB8"} strokeWidth={2.6} />
                        <text x={px + 10} y={py - 6} fill={p.enclosed ? "#FBEAA4" : "#A2AAB8"} fontSize="11" fontFamily="monospace">
                          {p.label}
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

      {/* Residue Sum & Real Improper Integral Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 font-mono text-xs tabular-nums">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#DF7E90]">
            Per-Pole Laurent Residues
          </p>
          <div className="mt-2 space-y-1.5">
            {evalContour.insidePoles.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded border border-[#35383F] bg-[#1E1F22] px-2.5 py-1"
              >
                <span className={p.enclosed ? "text-[#FBEAA4]" : "text-[#A2AAB8]"}>{p.label}</span>
                <span className={p.enclosed ? "text-[#96B898]" : "text-[#626776]"}>
                  Res = {fmt(p.residue.re, 3)} {p.residue.im >= 0 ? "+" : "−"} {fmt(Math.abs(p.residue.im), 3)}i
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 font-mono text-xs tabular-nums text-[#D6DAE2]">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#28B7B8]">
            Residue Theorem Total
          </p>
          <div className="mt-2.5 space-y-1.5">
            <div>
              Σ Enclosed Residues ={" "}
              <span className="text-[#8D9FCE]">
                {fmt(evalContour.sumRes.re, 3)} {evalContour.sumRes.im >= 0 ? "+" : "−"}{" "}
                {fmt(Math.abs(evalContour.sumRes.im), 3)}i
              </span>
            </div>
            <div className="pt-1 text-sm font-semibold text-[#FBEAA4]">
              ∮_C f(z) dz = {fmt(evalContour.integralExact.re, 4)}{" "}
              {evalContour.integralExact.im >= 0 ? "+" : "−"} {fmt(Math.abs(evalContour.integralExact.im), 4)}i
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#AAA36D]">
            Improper Real Integral Application
          </p>
          <div className="mt-2 overflow-x-auto text-xs text-[#F6F0D0]">
            <KaTeXMath block math={preset.realIntegralLatex} />
          </div>
        </div>
      </div>
    </div>
  );
}
