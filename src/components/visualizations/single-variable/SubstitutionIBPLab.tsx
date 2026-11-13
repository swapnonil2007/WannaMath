"use client";

import React, { useState, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  SvgCoordinatePlane2D,
  integrate1DGaussLegendre,
} from "@/components/visualizations/primitives";

type SubIbpMode = "usub" | "ibp";

interface USubPreset {
  id: string;
  label: string;
  a: number;
  b: number;
  g: (x: number) => number;
  gp: (x: number) => number;
  f: (u: number) => number;
  xRange: [number, number];
  uRange: [number, number];
  yRangeX: [number, number];
  yRangeU: [number, number];
  formulaLatex: string;
  note: string;
}

const USUB_PRESETS: USubPreset[] = [
  {
    id: "poly-root",
    label: "u = x² + 1: ∫ 2x √(x² + 1) dx",
    a: 0.2,
    b: 1.8,
    g: (x) => x * x + 1,
    gp: (x) => 2 * x,
    f: (u) => Math.sqrt(u),
    xRange: [-0.2, 2.2],
    uRange: [0.6, 4.6],
    yRangeX: [-0.4, 8.2],
    yRangeU: [-0.2, 2.6],
    formulaLatex:
      "\\int_a^b 2x\\sqrt{x^2+1}\\,dx = \\int_{a^2+1}^{b^2+1} \\sqrt{u}\\,du",
    note: "Stretching interval dx by g'(x) = 2x expands [a, b] into [g(a), g(b)], while height shrinks by 1/(2x) from 2x√u down to √u—preserving exact strip area f(g(x))·g'(x)dx = f(u)du!",
  },
  {
    id: "gaussian-trig",
    label: "u = sin(x): ∫ cos(x) e^{sin x} dx",
    a: 0.0,
    b: 1.45,
    g: (x) => Math.sin(x),
    gp: (x) => Math.cos(x),
    f: (u) => Math.exp(u),
    xRange: [-0.2, 1.8],
    uRange: [-0.2, 1.25],
    yRangeX: [-0.2, 1.8],
    yRangeU: [-0.2, 3.0],
    formulaLatex:
      "\\int_a^b \\cos(x)e^{\\sin x}\\,dx = \\int_{\\sin a}^{\\sin b} e^u\\,du",
    note: "Near x = π/2 ≈ 1.57, g'(x) = cos x compresses dx → du → 0, flattening the x-integrand to zero while e^u climbs cleanly on the u-plane!",
  },
];

interface IbpPreset {
  id: string;
  label: string;
  tStart: number;
  tEnd: number;
  u: (t: number) => number;
  v: (t: number) => number;
  uLabel: string;
  vLabel: string;
  note: string;
}

const IBP_PRESETS: IbpPreset[] = [
  {
    id: "x-exp",
    label: "∫ x e^x dx (u = x, dv = e^x dx)",
    tStart: 0.0,
    tEnd: 1.2,
    u: (t) => t,
    v: (t) => Math.exp(t),
    uLabel: "u = x",
    vLabel: "v = e^x",
    note: "In the (u, v) plane, the total corner rectangle Δ(uv) = u(b)v(b) - u(a)v(a) splits cleanly into the teal area ∫u dv + the periwinkle complementary area ∫v du.",
  },
  {
    id: "ln-x",
    label: "∫ ln(x) dx (u = ln x, dv = dx)",
    tStart: 1.0,
    tEnd: 3.2,
    u: (t) => Math.log(t),
    v: (t) => t,
    uLabel: "u = ln x",
    vLabel: "v = x",
    note: "Swapping vertical/horizontal strips turns ∫ ln(x) dx (hard) into [x ln x] - ∫ x · (1/x) dx (trivial rectangle width 1)!",
  },
  {
    id: "sin-cos",
    label: "∫ x sin(x) dx (u = x, dv = sin x dx)",
    tStart: 0.0,
    tEnd: 2.3,
    u: (t) => t,
    v: (t) => -Math.cos(t),
    uLabel: "u = x",
    vLabel: "v = -cos x",
    note: "Choosing u = x and dv = sin(x) dx simplifies v du = -cos(x) dx, easily integrating in one step.",
  },
];

export function SubstitutionIBPLab() {
  const [mode, setMode] = useState<SubIbpMode>("ibp");

  // Mode A: u-Sub
  const [uSubId, setUSubId] = useState<string>("poly-root");
  const uSubPreset = useMemo(
    () => USUB_PRESETS.find((p) => p.id === uSubId) ?? USUB_PRESETS[0],
    [uSubId]
  );
  const [probeX, setProbeX] = useState<number>(1.0);

  // Mode B: IBP
  const [ibpId, setIbpId] = useState<string>("x-exp");
  const ibpPreset = useMemo(
    () => IBP_PRESETS.find((p) => p.id === ibpId) ?? IBP_PRESETS[0],
    [ibpId]
  );
  const [tUpper, setTUpper] = useState<number>(ibpPreset.tEnd);

  const selectIbpPreset = (p: IbpPreset) => {
    setIbpId(p.id);
    setTUpper(p.tEnd);
  };

  const selectUSubPreset = (p: USubPreset) => {
    setUSubId(p.id);
    setProbeX(Number((0.5 * (p.a + p.b)).toFixed(2)));
  };

  const uSubModel = useMemo(() => {
    const { a, b, g, gp, f } = uSubPreset;
    const xArea = integrate1DGaussLegendre((x) => f(g(x)) * gp(x), a, b, 20);
    const uArea = integrate1DGaussLegendre(f, g(a), g(b), 20);

    const xCurve: [number, number][] = [];
    const uCurve: [number, number][] = [];
    const ga = g(a);
    const gb = g(b);

    for (let i = 0; i <= 140; i++) {
      const px =
        uSubPreset.xRange[0] +
        ((uSubPreset.xRange[1] - uSubPreset.xRange[0]) * i) / 140;
      xCurve.push([px, f(g(px)) * gp(px)]);

      const pu =
        uSubPreset.uRange[0] +
        ((uSubPreset.uRange[1] - uSubPreset.uRange[0]) * i) / 140;
      if (pu >= 0) uCurve.push([pu, f(pu)]);
    }

    const dx = 0.1;
    const du = gp(probeX) * dx;
    const pu0 = g(probeX);

    return {
      xArea,
      uArea,
      xCurve,
      uCurve,
      ga,
      gb,
      dx,
      du,
      pu0,
      fxVal: f(pu0) * gp(probeX),
      fuVal: f(pu0),
    };
  }, [uSubPreset, probeX]);

  const ibpModel = useMemo(() => {
    const t0 = ibpPreset.tStart;
    const t1 = tUpper;
    const u0 = ibpPreset.u(t0);
    const v0 = ibpPreset.v(t0);
    const u1 = ibpPreset.u(t1);
    const v1 = ibpPreset.v(t1);

    const curvePts: [number, number][] = [];
    for (let i = 0; i <= 140; i++) {
      const t = t0 + ((t1 - t0) * i) / 140;
      curvePts.push([ibpPreset.u(t), ibpPreset.v(t)]);
    }

    // Approximate integrals numerically along parametric curve t ∈ [t0, t1]
    const h = 1e-4;
    const intUdv = integrate1DGaussLegendre(
      (t) =>
        ibpPreset.u(t) *
        ((ibpPreset.v(t + h) - ibpPreset.v(t - h)) / (2 * h)),
      t0,
      t1,
      20
    );
    const intVdu = integrate1DGaussLegendre(
      (t) =>
        ibpPreset.v(t) *
        ((ibpPreset.u(t + h) - ibpPreset.u(t - h)) / (2 * h)),
      t0,
      t1,
      20
    );
    const cornerDiff = u1 * v1 - u0 * v0;

    // Bounds for SVG plane
    const allU = curvePts.map((p) => p[0]).concat([0, u0, u1]);
    const allV = curvePts.map((p) => p[1]).concat([0, v0, v1]);
    const uMin = Math.min(...allU) - 0.25;
    const uMax = Math.max(...allU) + 0.25;
    const vMin = Math.min(...allV) - 0.35;
    const vMax = Math.max(...allV) + 0.35;

    return {
      u0,
      v0,
      u1,
      v1,
      curvePts,
      intUdv,
      intVdu,
      cornerDiff,
      uRange: [uMin, uMax] as [number, number],
      vRange: [vMin, vMax] as [number, number],
    };
  }, [ibpPreset, tUpper]);

  const toPoly = (
    pts: [number, number][],
    toSvgX: (x: number) => number,
    toSvgY: (y: number) => number
  ) =>
    pts
      .map(([px, py]) => `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`)
      .join(" ");

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[#96B898]">
            <span>Lab 1.3.3A</span>
            <span>•</span>
            <span>Integration Techniques Geometry</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            1D Domain Stretch (<KaTeXMath math="u" />-Sub) &amp;{" "}
            <KaTeXMath math="(u,v)" /> Area Partition (IBP) Lab
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Toggle between <strong>Integration by Parts</strong> rectangular area
            complementarity and <strong>u-Substitution</strong> domain rescaling.
          </p>
        </div>

        <div className="inline-flex border border-[var(--border-strong)] bg-[var(--bg-canvas)]">
          <button
            type="button"
            onClick={() => setMode("ibp")}
            className={`px-3 py-1.5 text-xs font-sans transition-colors ${
              mode === "ibp"
                ? "bg-[#96B898] text-[#1E1F22] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Integration by Parts (u-v Plane)
          </button>
          <button
            type="button"
            onClick={() => setMode("usub")}
            className={`px-3 py-1.5 text-xs font-sans transition-colors ${
              mode === "usub"
                ? "bg-[#029091] text-[#FFFBE4] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            u-Substitution (Domain Stretch)
          </button>
        </div>
      </div>

      {mode === "ibp" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {IBP_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectIbpPreset(p)}
                  className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                    p.id === ibpPreset.id
                      ? "border-[#96B898] bg-[var(--bg-canvas)] text-[#96B898] font-medium"
                      : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => selectIbpPreset(ibpPreset)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Upper Parameter <KaTeXMath math="t_1" /> ({ibpPreset.uLabel},{" "}
                {ibpPreset.vLabel})
              </span>
              <span className="font-tabular-mono text-[#D35323]">
                t₁ = {tUpper.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={ibpPreset.tStart + 0.25}
              max={ibpPreset.tEnd + 0.5}
              step={0.05}
              value={tUpper}
              onChange={(e) => setTUpper(Number(e.target.value))}
              aria-label="Upper parameter bound t1"
              className="w-full accent-[#D35323]"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <SvgCoordinatePlane2D
                xRange={ibpModel.uRange}
                yRange={ibpModel.vRange}
                width={520}
                height={330}
                xLabel="u"
                yLabel="v"
                xColor="#8D9FCE"
                yColor="#029091"
                ariaLabel="Integration by parts rectangular partition in (u, v) plane"
                className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
              >
                {({ toSvgX, toSvgY }) => {
                  const ox = toSvgX(0);
                  const oy = toSvgY(0);
                  const { curvePts, u0, v0, u1, v1 } = ibpModel;
                  // Region 1: ∫ v du -> polygon under v(u) to v = 0 between u0 and u1
                  const polyVdu = [
                    `${toSvgX(u0).toFixed(1)},${oy.toFixed(1)}`,
                    ...curvePts.map(
                      ([pu, pv]) => `${toSvgX(pu).toFixed(1)},${toSvgY(pv).toFixed(1)}`
                    ),
                    `${toSvgX(u1).toFixed(1)},${oy.toFixed(1)}`,
                  ].join(" ");
                  // Region 2: ∫ u dv -> polygon between curve and u = 0 axis from v0 to v1
                  const polyUdv = [
                    `${ox.toFixed(1)},${toSvgY(v0).toFixed(1)}`,
                    ...curvePts.map(
                      ([pu, pv]) => `${toSvgX(pu).toFixed(1)},${toSvgY(pv).toFixed(1)}`
                    ),
                    `${ox.toFixed(1)},${toSvgY(v1).toFixed(1)}`,
                  ].join(" ");

                  return (
                    <>
                      <polygon
                        points={polyVdu}
                        fill="rgba(141, 159, 206, 0.28)"
                        stroke="#8D9FCE"
                        strokeWidth={1}
                      />
                      <polygon
                        points={polyUdv}
                        fill="rgba(2, 144, 145, 0.28)"
                        stroke="#029091"
                        strokeWidth={1}
                      />
                      <rect
                        x={Math.min(ox, toSvgX(u0))}
                        y={Math.min(oy, toSvgY(v0))}
                        width={Math.abs(toSvgX(u0) - ox)}
                        height={Math.abs(toSvgY(v0) - oy)}
                        fill="rgba(170, 163, 109, 0.24)"
                        stroke="#AAA36D"
                        strokeDasharray="3 3"
                      />
                      <polyline
                        fill="none"
                        stroke="#FBEAA4"
                        strokeWidth={2.5}
                        points={toPoly(curvePts, toSvgX, toSvgY)}
                      />
                      <circle
                        cx={toSvgX(u0)}
                        cy={toSvgY(v0)}
                        r={4.2}
                        fill="#8D9FCE"
                      />
                      <circle
                        cx={toSvgX(u1)}
                        cy={toSvgY(v1)}
                        r={4.5}
                        fill="#D35323"
                      />
                    </>
                  );
                }}
              </SvgCoordinatePlane2D>
            </div>

            <div className="lg:col-span-5 space-y-3">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2 text-xs font-tabular-mono">
                <span className="font-sans uppercase tracking-wider text-[var(--text-secondary)] block">
                  Rectangular Area Balance
                </span>
                <div className="text-[#029091]">
                  ∫ u dv (Teal) = {ibpModel.intUdv.toFixed(5)}
                </div>
                <div className="text-[#8D9FCE]">
                  ∫ v du (Periwinkle) = {ibpModel.intVdu.toFixed(5)}
                </div>
                <div className="border-t border-[var(--border-subtle)] pt-2 text-[#FBEAA4] font-semibold">
                  Sum = {(ibpModel.intUdv + ibpModel.intVdu).toFixed(5)}
                </div>
                <div className="text-[#D35323] font-semibold">
                  u₁v₁ - u₀v₀ = {ibpModel.cornerDiff.toFixed(5)}
                </div>
              </div>

              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
                {ibpPreset.note}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {USUB_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectUSubPreset(p)}
                className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                  p.id === uSubPreset.id
                    ? "border-[#029091] bg-[var(--bg-canvas)] text-[#029091] font-medium"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
            <div className="flex flex-wrap justify-between gap-2 text-xs font-sans">
              <span>
                Strip Cursor <KaTeXMath math="x_0 \in [a, b]" /> → Mapped{" "}
                <KaTeXMath math="u_0 = g(x_0)" />
              </span>
              <span className="font-tabular-mono text-[#D35323]">
                dx = {uSubModel.dx.toFixed(2)} → du = g&apos;(x₀)dx ={" "}
                {uSubModel.du.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min={uSubPreset.a}
              max={uSubPreset.b - 0.1}
              step={0.02}
              value={probeX}
              onChange={(e) => setProbeX(Number(e.target.value))}
              aria-label="Strip cursor x0"
              className="w-full accent-[#D35323]"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-sans">
                <span className="font-medium text-[var(--text-primary)]">
                  1. Original Domain <KaTeXMath math="[a, b]" />
                </span>
                <span className="font-tabular-mono text-[#8D9FCE]">
                  Area = {uSubModel.xArea.toFixed(5)}
                </span>
              </div>
              <SvgCoordinatePlane2D
                xRange={uSubPreset.xRange}
                yRange={uSubPreset.yRangeX}
                width={460}
                height={280}
                xLabel="x"
                yLabel="f(g(x))g'(x)"
                xColor="#8D9FCE"
                yColor="#D35323"
                ariaLabel="Original x-domain integrand"
                className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
              >
                {({ toSvgX, toSvgY }) => {
                  const zy = toSvgY(0);
                  const sy = toSvgY(uSubModel.fxVal);
                  return (
                    <>
                      <rect
                        x={toSvgX(probeX)}
                        y={Math.min(zy, sy)}
                        width={Math.max(4, toSvgX(probeX + uSubModel.dx) - toSvgX(probeX))}
                        height={Math.abs(sy - zy)}
                        fill="rgba(211, 83, 35, 0.35)"
                        stroke="#D35323"
                      />
                      <polyline
                        fill="none"
                        stroke="#8D9FCE"
                        strokeWidth={2.2}
                        points={toPoly(uSubModel.xCurve, toSvgX, toSvgY)}
                      />
                    </>
                  );
                }}
              </SvgCoordinatePlane2D>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-sans">
                <span className="font-medium text-[var(--text-primary)]">
                  2. Substituted Domain <KaTeXMath math="[g(a), g(b)]" />
                </span>
                <span className="font-tabular-mono text-[#029091]">
                  Area = {uSubModel.uArea.toFixed(5)}
                </span>
              </div>
              <SvgCoordinatePlane2D
                xRange={uSubPreset.uRange}
                yRange={uSubPreset.yRangeU}
                width={460}
                height={280}
                xLabel="u"
                yLabel="f(u)"
                xColor="#029091"
                yColor="#96B898"
                ariaLabel="Substituted u-domain integrand"
                className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
              >
                {({ toSvgX, toSvgY }) => {
                  const zy = toSvgY(0);
                  const sy = toSvgY(uSubModel.fuVal);
                  return (
                    <>
                      <rect
                        x={Math.min(toSvgX(uSubModel.pu0), toSvgX(uSubModel.pu0 + uSubModel.du))}
                        y={Math.min(zy, sy)}
                        width={Math.max(
                          4,
                          Math.abs(
                            toSvgX(uSubModel.pu0 + uSubModel.du) - toSvgX(uSubModel.pu0)
                          )
                        )}
                        height={Math.abs(sy - zy)}
                        fill="rgba(211, 83, 35, 0.35)"
                        stroke="#D35323"
                      />
                      <polyline
                        fill="none"
                        stroke="#029091"
                        strokeWidth={2.2}
                        points={toPoly(uSubModel.uCurve, toSvgX, toSvgY)}
                      />
                    </>
                  );
                }}
              </SvgCoordinatePlane2D>
            </div>
          </div>

          <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
            {uSubPreset.note}
          </div>
        </div>
      )}
    </section>
  );
}
