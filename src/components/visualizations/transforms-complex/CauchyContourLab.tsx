"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives";

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
  const denom = Math.max(1e-10, b.re * b.re + b.im * b.im);
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
};
const cExp = (z: Cplx): Cplx => {
  const e = Math.exp(Math.max(-10, Math.min(10, z.re)));
  return { re: e * Math.cos(z.im), im: e * Math.sin(z.im) };
};
const cCos = (z: Cplx): Cplx => {
  const eP = cExp({ re: -z.im, im: z.re });
  const eM = cExp({ re: z.im, im: -z.re });
  return { re: 0.5 * (eP.re + eM.re), im: 0.5 * (eP.im + eM.im) };
};

interface CauchyPreset {
  id: string;
  label: string;
  formulaLatex: string;
  poles: Array<{ z: Cplx; label: string; resFn: () => Cplx }>;
  evalFn: (z: Cplx, z0: Cplx) => Cplx;
  exactSingleIntegral: (z0: Cplx) => Cplx;
  useMovableZ0: boolean;
  description: string;
}

const PRESETS: CauchyPreset[] = [
  {
    id: "reciprocal",
    label: "1 / (z − z₀)",
    formulaLatex: "f(z) = \\frac{1}{z - z_0}",
    poles: [{ z: { re: 0.5, im: 0.2 }, label: "z₀", resFn: () => ({ re: 1, im: 0 }) }],
    evalFn: (z, z0) => cDiv({ re: 1, im: 0 }, cSub(z, z0)),
    exactSingleIntegral: () => ({ re: 0, im: 2 * Math.PI }), // 2pi*i * 1
    useMovableZ0: true,
    description: "Fundamental Cauchy pole: ∮ dz/(z−z₀) equals 2πi·W(C, z₀) regardless of contour shape!",
  },
  {
    id: "exp-cif",
    label: "e^z / (z − z₀)",
    formulaLatex: "f(z) = \\frac{e^z}{z - z_0}",
    poles: [{ z: { re: 0.4, im: 0.3 }, label: "z₀", resFn: () => ({ re: 1, im: 0 }) }],
    evalFn: (z, z0) => cDiv(cExp(z), cSub(z, z0)),
    exactSingleIntegral: (z0) => cMul({ re: 0, im: 2 * Math.PI }, cExp(z0)),
    useMovableZ0: true,
    description: "Cauchy's Integral Formula: enclosing z₀ evaluates 2πi·e^{z₀} purely from boundary values.",
  },
  {
    id: "cos-cif",
    label: "cos(z) / (z − z₀)",
    formulaLatex: "f(z) = \\frac{\\cos z}{z - z_0}",
    poles: [{ z: { re: 0.3, im: -0.2 }, label: "z₀", resFn: () => ({ re: 1, im: 0 }) }],
    evalFn: (z, z0) => cDiv(cCos(z), cSub(z, z0)),
    exactSingleIntegral: (z0) => cMul({ re: 0, im: 2 * Math.PI }, cCos(z0)),
    useMovableZ0: true,
    description: "Cauchy's Integral Formula probes cos(z₀) strictly from boundary integrals around z₀.",
  },
  {
    id: "two-poles",
    label: "1 / (z² + 1)",
    formulaLatex: "f(z) = \\frac{1}{z^2 + 1} = \\frac{1}{(z-i)(z+i)}",
    poles: [
      { z: { re: 0, im: 1 }, label: "+i", resFn: () => ({ re: 0, im: -0.5 }) },
      { z: { re: 0, im: -1 }, label: "−i", resFn: () => ({ re: 0, im: 0.5 }) },
    ],
    evalFn: (z) => cDiv({ re: 1, im: 0 }, cAdd(cMul(z, z), { re: 1, im: 0 })),
    exactSingleIntegral: () => ({ re: 0, im: 0 }),
    useMovableZ0: false,
    description: "Two simple poles at ±i with opposite residues (±i/2): enclosing both cancels cleanly to 0!",
  },
  {
    id: "entire",
    label: "z² + 2z [Entire]",
    formulaLatex: "f(z) = z^2 + 2z",
    poles: [],
    evalFn: (z) => cAdd(cMul(z, z), cMul({ re: 2, im: 0 }, z)),
    exactSingleIntegral: () => ({ re: 0, im: 0 }),
    useMovableZ0: false,
    description: "Holomorphic everywhere on ℂ: Cauchy's Theorem guarantees ∮_C f(z) dz = 0 on every closed loop.",
  },
];

function fmt(n: number, digits = 3): string {
  const clean = Math.abs(n) < 1e-6 ? 0 : n;
  return clean.toFixed(digits);
}

/**
 * Interactive Contour Winding & Cauchy Integral Inspector (5.2.1).
 * Deform contour C across singularities and compare numerical loop integral ∮ f(z) dz
 * against topological winding W(C, z_k) and Cauchy's Integral Theorem / Formula.
 */
export function CauchyContourLab() {
  const [presetId, setPresetId] = useState<string>(PRESETS[1].id);
  const [center, setCenter] = useState<[number, number]>([0.4, 0.3]);
  const [radius, setRadius] = useState<number>(1.0);
  const [deform, setDeform] = useState<number>(0); // 0 = circle, >0 = wavy homotopy loop
  const [winding, setWinding] = useState<number>(1); // +1 CCW, +2 double, -1 CW
  const [z0, setZ0] = useState<Cplx>({ re: 0.4, im: 0.3 });

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId]
  );

  const sim = useMemo(() => {
    const N = 360;
    const contourPts: Array<Cplx> = [];
    const evalPoint = (theta: number): Cplx => {
      const rLocal = radius * (1 + deform * 0.25 * Math.cos(3 * theta));
      return {
        re: center[0] + rLocal * Math.cos(theta),
        im: center[1] + rLocal * Math.sin(theta),
      };
    };

    let integral: Cplx = { re: 0, im: 0 };
    const dTheta = (2 * Math.PI * winding) / N;

    for (let i = 0; i < N; i++) {
      const thA = i * dTheta;
      const thB = (i + 1) * dTheta;
      const thMid = 0.5 * (thA + thB);
      const zA = evalPoint(thA);
      const zB = evalPoint(thB);
      const zMid = evalPoint(thMid);
      if (i === 0) contourPts.push(zA);
      contourPts.push(zB);

      const dz = cSub(zB, zA);
      const fMid = preset.evalFn(zMid, z0);
      integral = cAdd(integral, cMul(fMid, dz));
    }

    // Winding check for each active pole via argument change around C
    const activePoles = preset.useMovableZ0
      ? [{ z: z0, label: "z₀", res: preset.exactSingleIntegral(z0) }]
      : preset.poles.map((p) => ({
          z: p.z,
          label: p.label,
          res: cMul({ re: 0, im: 2 * Math.PI }, p.resFn()),
        }));

    let exactTotal: Cplx = { re: 0, im: 0 };
    const poleStatus = activePoles.map((p) => {
      let totalAng = 0;
      for (let i = 0; i < N; i++) {
        const thA = i * dTheta;
        const thB = (i + 1) * dTheta;
        const a = cSub(evalPoint(thA), p.z);
        const b = cSub(evalPoint(thB), p.z);
        const cross = a.re * b.im - a.im * b.re;
        const dot = a.re * b.re + a.im * b.im;
        totalAng += Math.atan2(cross, dot);
      }
      const windNum = Math.round(totalAng / (2 * Math.PI));
      const contrib = cMul({ re: windNum, im: 0 }, p.res);
      exactTotal = cAdd(exactTotal, contrib);
      return { ...p, windNum, inside: windNum !== 0 };
    });

    return { contourPts, integral, exactTotal, poleStatus };
  }, [preset, center, radius, deform, winding, z0]);

  const applyPreset = (p: CauchyPreset) => {
    setPresetId(p.id);
    if (p.useMovableZ0) {
      setZ0(p.poles[0].z);
      setCenter([p.poles[0].z.re, p.poles[0].z.im]);
      setRadius(1.0);
    } else if (p.id === "two-poles") {
      setCenter([0, 0.9]);
      setRadius(0.8);
    } else {
      setCenter([0, 0]);
      setRadius(1.1);
    }
  };

  return (
    <div className="space-y-5">
      {/* Control Ribbon */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#B95869]">
              Cauchy Contour Winding & Homotopy Lab
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">{preset.description}</p>
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

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#029091]">
              <span>Radius R</span>
              <span>{fmt(radius, 2)}</span>
            </div>
            <input
              type="range"
              min={0.35}
              max={2.2}
              step={0.05}
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#029091]"
            />
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#FBEAA4]">
              <span>Homotopy Deform</span>
              <span>{fmt(deform, 2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.8}
              step={0.05}
              value={deform}
              onChange={(e) => setDeform(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#FBEAA4]"
            />
          </label>

          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <span className="font-sans text-xs font-semibold text-[#8D9FCE]">Orientation & Winding</span>
            <div className="mt-2 grid grid-cols-3 gap-1.5 font-mono text-xs">
              {[
                { w: 1, lbl: "+1 CCW" },
                { w: 2, lbl: "+2 Loop" },
                { w: -1, lbl: "−1 CW" },
              ].map((opt) => (
                <button
                  key={opt.w}
                  type="button"
                  onClick={() => setWinding(opt.w)}
                  className={`rounded border py-1 ${
                    winding === opt.w
                      ? "border-[#029091] bg-[#029091]/20 text-[#F6F0D0]"
                      : "border-[#35383F] bg-[#26282C] text-[#A2AAB8]"
                  }`}
                >
                  {opt.lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <span className="font-sans text-xs font-semibold text-[#D35323]">
              {preset.useMovableZ0 ? "Pole z₀ Coordinates" : "Fixed Poles"}
            </span>
            {preset.useMovableZ0 ? (
              <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-xs">
                <input
                  type="number"
                  step={0.2}
                  min={-2.2}
                  max={2.2}
                  value={z0.re}
                  onChange={(e) => setZ0((p) => ({ ...p, re: parseFloat(e.target.value) || 0 }))}
                  className="rounded border border-[#35383F] bg-[#26282C] px-2 py-1 text-[#F6F0D0]"
                />
                <input
                  type="number"
                  step={0.2}
                  min={-2.2}
                  max={2.2}
                  value={z0.im}
                  onChange={(e) => setZ0((p) => ({ ...p, im: parseFloat(e.target.value) || 0 }))}
                  className="rounded border border-[#35383F] bg-[#26282C] px-2 py-1 text-[#F6F0D0]"
                />
              </div>
            ) : (
              <p className="mt-2 font-mono text-xs text-[#A2AAB8]">
                {preset.poles.length === 0
                  ? "No poles (Entire on ℂ)"
                  : preset.poles.map((p) => p.label).join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Contour Canvas + Live Integral Readout */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                Interactive Complex Contour <KaTeXMath math="C \subset \mathbb{C}" />
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Click anywhere on the <KaTeXMath math="z" />-plane to move the contour center across poles.
              </p>
            </div>
            <span className="rounded border border-[#029091]/50 bg-[#1E1F22] px-2 py-0.5 font-mono text-xs text-[#029091]">
              Center ({fmt(center[0], 1)}, {fmt(center[1], 1)})
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-3.2, 3.2]}
            yRange={[-3.2, 3.2]}
            width={480}
            height={380}
            xLabel="Re z"
            yLabel="Im z"
            ariaLabel="Complex Plane Contour"
            onSelectPoint={(x, y) => setCenter([Math.round(x * 10) / 10, Math.round(y * 10) / 10])}
          >
            {({ toSvgX, toSvgY }) => {
              const pathD = sim.contourPts
                .map((pt, i) => `${i === 0 ? "M" : "L"}${toSvgX(pt.re).toFixed(1)},${toSvgY(pt.im).toFixed(1)}`)
                .join(" ");

              // Direction arrow near angle 45 deg
              const arrowIdx = Math.floor(sim.contourPts.length * (winding > 0 ? 0.14 : 0.86));
              const pA = sim.contourPts[arrowIdx] ?? sim.contourPts[0];
              const pB = sim.contourPts[arrowIdx + 2] ?? sim.contourPts[1];
              const dx = toSvgX(pB.re) - toSvgX(pA.re);
              const dy = toSvgY(pB.im) - toSvgY(pA.im);
              const dLen = Math.hypot(dx, dy) || 1;
              const ux = (dx / dLen) * 10;
              const uy = (dy / dLen) * 10;
              const ax = toSvgX(pA.re);
              const ay = toSvgY(pA.im);

              return (
                <g>
                  <path d={pathD} fill="#029091" fillOpacity={0.14} stroke="#029091" strokeWidth={2.5} />

                  {/* Direction arrowhead along C */}
                  <polygon
                    points={`${ax + ux},${ay + uy} ${ax - 0.6 * ux - 0.55 * uy},${ay - 0.6 * uy + 0.55 * ux} ${
                      ax - 0.6 * ux + 0.55 * uy
                    },${ay - 0.6 * uy - 0.55 * ux}`}
                    fill="#FBEAA4"
                  />

                  {/* Contour center */}
                  <circle cx={toSvgX(center[0])} cy={toSvgY(center[1])} r={3.5} fill="#029091" />

                  {/* Singular poles */}
                  {sim.poleStatus.map((p, idx) => {
                    const px = toSvgX(p.z.re);
                    const py = toSvgY(p.z.im);
                    return (
                      <g key={idx}>
                        <line x1={px - 7} y1={py - 7} x2={px + 7} y2={py + 7} stroke={p.inside ? "#D35323" : "#A2AAB8"} strokeWidth={2.8} />
                        <line x1={px - 7} y1={py + 7} x2={px + 7} y2={py - 7} stroke={p.inside ? "#D35323" : "#A2AAB8"} strokeWidth={2.8} />
                        <text x={px + 10} y={py - 8} fill={p.inside ? "#FBEAA4" : "#A2AAB8"} fontSize="11" fontFamily="monospace">
                          {p.label} (W={p.windNum})
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: Integral Verification Cards */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#B95869]">
              Active Integrand
            </p>
            <div className="mt-2 text-sm text-[#F6F0D0]">
              <KaTeXMath block math={preset.formulaLatex} />
            </div>
          </div>

          <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 font-mono text-xs tabular-nums text-[#D6DAE2]">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#029091]">
              Numerical Loop Quadrature vs. Exact Cauchy Theorem
            </p>
            <div className="mt-3 space-y-2">
              <div className="rounded border border-[#35383F] bg-[#1E1F22] p-2.5">
                <span className="text-[#A2AAB8] block">Numerical ∮_C f(z) dz (360-step midpoint):</span>
                <span className="text-base font-semibold text-[#FBEAA4]">
                  {fmt(sim.integral.re, 3)} {sim.integral.im >= 0 ? "+" : "−"} {fmt(Math.abs(sim.integral.im), 3)}i
                </span>
              </div>
              <div className="rounded border border-[#35383F] bg-[#1E1F22] p-2.5">
                <span className="text-[#A2AAB8] block">Exact Cauchy Prediction (2πi · Σ W · Res):</span>
                <span className="text-base font-semibold text-[#029091]">
                  {fmt(sim.exactTotal.re, 3)} {sim.exactTotal.im >= 0 ? "+" : "−"} {fmt(Math.abs(sim.exactTotal.im), 3)}i
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#AAA36D]">
              Enclosed Pole Inventory
            </p>
            {sim.poleStatus.length === 0 ? (
              <p className="mt-2 font-serif text-xs text-[#96B898]">
                Zero singularities on ℂ: any closed contour yields 0 by Cauchy&apos;s Theorem.
              </p>
            ) : (
              <div className="mt-2 space-y-1.5 font-mono text-xs">
                {sim.poleStatus.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded border border-[#35383F] bg-[#1E1F22] px-3 py-1.5"
                  >
                    <span className={p.inside ? "text-[#D35323]" : "text-[#A2AAB8]"}>
                      Pole {p.label} ({fmt(p.z.re, 1)} {p.z.im >= 0 ? "+" : "−"} {fmt(Math.abs(p.z.im), 1)}i)
                    </span>
                    <span className={p.inside ? "text-[#FBEAA4]" : "text-[#A2AAB8]"}>
                      {p.inside ? `ENCLOSED (W=${p.windNum})` : "OUTSIDE (W=0)"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
