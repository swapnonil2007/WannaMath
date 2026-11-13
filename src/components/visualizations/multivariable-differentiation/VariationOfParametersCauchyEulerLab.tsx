"use client";

import React, { useState, useMemo } from "react";
import { RotateCcw, ArrowRightLeft } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  SvgCoordinatePlane2D,
  integrate1DGaussLegendre,
} from "@/components/visualizations/primitives";

type LabMode = "variation" | "cauchy-euler";

interface VariationPreset {
  id: string;
  label: string;
  odeLatex: string;
  gExpr: string;
  xRange: [number, number];
  xAnchor: number;
  y1: (x: number) => number;
  y2: (x: number) => number;
  wronskian: (x: number) => number;
  pCoef: number;
  qCoef: number;
  yRange: [number, number];
  note: string;
}

const VARIATION_PRESETS: VariationPreset[] = [
  {
    id: "sec-x",
    label: "y'' + y = sec(x)",
    odeLatex: "y'' + y = \\sec(x) \\quad (y_1 = \\cos x,\\; y_2 = \\sin x,\\; W = 1)",
    gExpr: "1 / cos(x)",
    xRange: [-1.1, 1.1],
    xAnchor: 0.0,
    y1: (x) => Math.cos(x),
    y2: (x) => Math.sin(x),
    wronskian: () => 1.0,
    pCoef: 0,
    qCoef: 1,
    yRange: [-1.5, 2.5],
    note: "1/f(D) cannot invert sec(x) directly, but Variation of Parameters yields u₁ = ln|cos x| and u₂ = x, giving y_p = cos(x)ln|cos x| + x sin(x).",
  },
  {
    id: "tan-x",
    label: "y'' + y = tan(x)",
    odeLatex: "y'' + y = \\tan(x) \\quad (y_1 = \\cos x,\\; y_2 = \\sin x,\\; W = 1)",
    gExpr: "sin(x) / cos(x)",
    xRange: [-1.1, 1.1],
    xAnchor: 0.0,
    y1: (x) => Math.cos(x),
    y2: (x) => Math.sin(x),
    wronskian: () => 1.0,
    pCoef: 0,
    qCoef: 1,
    yRange: [-2.0, 2.0],
    note: "Variation of Parameters handles arbitrary continuous forcing terms g(x) cleanly across (-π/2, π/2) via Gauss-Legendre integration of u₁' and u₂'.",
  },
  {
    id: "exp-over-x",
    label: "y'' - 2y' + y = e^x / x (x > 0)",
    odeLatex: "y'' - 2y' + y = \\frac{e^x}{x} \\quad (y_1 = e^x,\\; y_2 = xe^x,\\; W = e^{2x})",
    gExpr: "exp(x) / x",
    xRange: [0.35, 2.6],
    xAnchor: 1.0,
    y1: (x) => Math.exp(x),
    y2: (x) => x * Math.exp(x),
    wronskian: (x) => Math.exp(2 * x),
    pCoef: -2,
    qCoef: 1,
    yRange: [-2.0, 8.0],
    note: "Here W(x) = e^{2x} cancels the e^x factors cleanly: u₁'(x) = -1 so u₁ = -x, while u₂'(x) = 1/x so u₂ = ln x, giving y_p = x e^x (ln x - 1).",
  },
];

interface CauchyPreset {
  id: string;
  label: string;
  a: number;
  b: number;
  c: number;
}

const CAUCHY_PRESETS: CauchyPreset[] = [
  { id: "distinct", label: "Distinct Powers (x^{r₁}, x^{r₂})", a: 1, b: -2, c: -4 },
  { id: "repeated", label: "Repeated Power (x^r, x^r ln x)", a: 1, b: -1, c: 1 },
  {
    id: "complex",
    label: "Complex Log-Waves (x^α cos(β ln x))",
    a: 1,
    b: 1,
    c: 9,
  },
];

export function VariationOfParametersCauchyEulerLab() {
  const [mode, setMode] = useState<LabMode>("variation");

  // Mode A: Variation of Parameters
  const [vPresetId, setVPresetId] = useState<string>("sec-x");
  const vPreset = useMemo(
    () =>
      VARIATION_PRESETS.find((p) => p.id === vPresetId) ?? VARIATION_PRESETS[0],
    [vPresetId]
  );
  const [gExpr, setGExpr] = useState<string>(vPreset.gExpr);

  const compiledG = useMemo(() => compileMathExpression(gExpr, ["x"]), [gExpr]);

  const selectVariationPreset = (p: VariationPreset) => {
    setVPresetId(p.id);
    setGExpr(p.gExpr);
  };

  const variationData = useMemo(() => {
    const [xMin, xMax] = vPreset.xRange;
    const steps = 80;
    const x0 = vPreset.xAnchor;

    const gFn = (x: number) => (compiledG.valid ? compiledG.evaluate({ x }) : NaN);
    const u1PrimeFn = (x: number) =>
      -(vPreset.y2(x) * gFn(x)) / vPreset.wronskian(x);
    const u2PrimeFn = (x: number) =>
      (vPreset.y1(x) * gFn(x)) / vPreset.wronskian(x);

    const u1Pts: [number, number][] = [];
    const u2Pts: [number, number][] = [];
    const ypPts: [number, number][] = [];
    const checkPts: [number, number][] = [];
    const gPts: [number, number][] = [];

    const evalYp = (x: number): number => {
      const u1 = integrate1DGaussLegendre(u1PrimeFn, x0, x, 10);
      const u2 = integrate1DGaussLegendre(u2PrimeFn, x0, x, 10);
      return u1 * vPreset.y1(x) + u2 * vPreset.y2(x);
    };

    const h = 1e-3;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + ((xMax - xMin) * i) / steps;
      const gv = gFn(x);
      const u1 = integrate1DGaussLegendre(u1PrimeFn, x0, x, 10);
      const u2 = integrate1DGaussLegendre(u2PrimeFn, x0, x, 10);
      const yp = u1 * vPreset.y1(x) + u2 * vPreset.y2(x);

      if (Number.isFinite(gv) && Math.abs(gv) < 15) gPts.push([x, gv]);
      if (Number.isFinite(u1) && Math.abs(u1) < 15) u1Pts.push([x, u1]);
      if (Number.isFinite(u2) && Math.abs(u2) < 15) u2Pts.push([x, u2]);
      if (Number.isFinite(yp) && Math.abs(yp) < 15) {
        ypPts.push([x, yp]);
        if (i >= 2 && i <= steps - 2) {
          const ypP = evalYp(x + h);
          const ypM = evalYp(x - h);
          if (Number.isFinite(ypP) && Number.isFinite(ypM)) {
            const dy = (ypP - ypM) / (2 * h);
            const d2y = (ypP - 2 * yp + ypM) / (h * h);
            const lhs = d2y + vPreset.pCoef * dy + vPreset.qCoef * yp;
            if (Number.isFinite(lhs) && Math.abs(lhs) < 15) {
              checkPts.push([x, lhs]);
            }
          }
        }
      }
    }

    return { u1Pts, u2Pts, ypPts, checkPts, gPts };
  }, [vPreset, compiledG]);

  // Mode B: Cauchy-Euler a x^2 y'' + b x y' + c y = 0 -> a r^2 + (b - a) r + c = 0
  const [ceA, setCeA] = useState<number>(1);
  const [ceB, setCeB] = useState<number>(1);
  const [ceC, setCeC] = useState<number>(9);
  const [xProbe, setXProbe] = useState<number>(2.0);

  const selectCauchyPreset = (cp: CauchyPreset) => {
    setCeA(cp.a);
    setCeB(cp.b);
    setCeC(cp.c);
  };

  const cauchyModel = useMemo(() => {
    const bEff = ceB - ceA; // a θ(θ-1) + b θ + c = a θ^2 + (b-a) θ + c
    const disc = bEff * bEff - 4 * ceA * ceC;
    const alpha = -bEff / (2 * ceA);
    const tol = 1e-3;
    const regime =
      Math.abs(disc) <= tol ? "repeated" : disc < 0 ? "complex" : "distinct";

    let r1 = alpha;
    let r2 = alpha;
    let beta = 0;

    if (regime === "distinct") {
      const sd = Math.sqrt(Math.max(0, disc)) / (2 * ceA);
      r1 = alpha + sd;
      r2 = alpha - sd;
    } else if (regime === "complex") {
      beta = Math.sqrt(-disc) / (2 * ceA);
    }

    const evalTBasis = (t: number): [number, number] => {
      if (regime === "distinct") {
        return [Math.exp(r1 * t), Math.exp(r2 * t)];
      }
      if (regime === "repeated") {
        return [Math.exp(alpha * t), t * Math.exp(alpha * t)];
      }
      return [
        Math.exp(alpha * t) * Math.cos(beta * t),
        Math.exp(alpha * t) * Math.sin(beta * t),
      ];
    };

    const tMin = Math.log(0.18);
    const tMax = Math.log(6.0);
    const steps = 160;
    const xCurve1: [number, number][] = [];
    const xCurve2: [number, number][] = [];
    const tCurve1: [number, number][] = [];
    const tCurve2: [number, number][] = [];

    for (let i = 0; i <= steps; i++) {
      const t = tMin + ((tMax - tMin) * i) / steps;
      const x = Math.exp(t);
      const [v1, v2] = evalTBasis(t);
      if (Number.isFinite(v1) && Math.abs(v1) < 12) {
        xCurve1.push([x, v1]);
        tCurve1.push([t, v1]);
      }
      if (Number.isFinite(v2) && Math.abs(v2) < 12) {
        xCurve2.push([x, v2]);
        tCurve2.push([t, v2]);
      }
    }

    const tProbe = Math.log(xProbe);
    const [probeY1, probeY2] = evalTBasis(tProbe);

    return {
      bEff,
      disc,
      regime,
      alpha,
      beta,
      r1,
      r2,
      tMin,
      tMax,
      tProbe,
      probeY1,
      probeY2,
      xCurve1,
      xCurve2,
      tCurve1,
      tCurve2,
    };
  }, [ceA, ceB, ceC, xProbe]);

  const toPoly = (
    pts: [number, number][],
    toSvgX: (x: number) => number,
    toSvgY: (y: number) => number,
    clampY: [number, number]
  ) =>
    pts
      .map(([px, py]) => {
        const cy = Math.max(clampY[0], Math.min(clampY[1], py));
        return `${toSvgX(px).toFixed(1)},${toSvgY(cy).toFixed(1)}`;
      })
      .join(" ");

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[#029091]">
            <span>Lab 3.1.11B</span>
            <span>•</span>
            <span>General Forcing &amp; Equidimensional Pullback</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            Variation of Parameters &amp; Cauchy-Euler Log-Pullback Lab
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Switch between <strong>Variation of Parameters</strong> (integrating
            non-elementary forcings like <KaTeXMath math="\sec x" /> or{" "}
            <KaTeXMath math="e^x/x" /> via <KaTeXMath math="u_1, u_2" />) and{" "}
            <strong>Cauchy-Euler</strong> equidimensional equations pulled back via{" "}
            <KaTeXMath math="t = \ln x" />.
          </p>
        </div>

        <div className="inline-flex border border-[var(--border-strong)] bg-[var(--bg-canvas)]">
          <button
            type="button"
            onClick={() => setMode("variation")}
            className={`px-3 py-1.5 text-xs font-sans transition-colors ${
              mode === "variation"
                ? "bg-[#D5658B] text-[#1E1F22] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Mode A: Variation of Parameters
          </button>
          <button
            type="button"
            onClick={() => setMode("cauchy-euler")}
            className={`px-3 py-1.5 text-xs font-sans transition-colors ${
              mode === "cauchy-euler"
                ? "bg-[#029091] text-[#FFFBE4] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Mode B: Cauchy-Euler (x = e^t)
          </button>
        </div>
      </div>

      {mode === "variation" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {VARIATION_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectVariationPreset(p)}
                  className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                    p.id === vPreset.id
                      ? "border-[#D5658B] bg-[var(--bg-canvas)] text-[#D5658B] font-medium"
                      : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => selectVariationPreset(vPreset)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset g(x)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <MathExpressionInput
              label="Custom Continuous Forcing g(x)"
              prefixLatex="g(x) ="
              value={gExpr}
              onChange={setGExpr}
              allowedVars={["x"]}
            />
            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto flex items-center">
              <KaTeXMath math={vPreset.odeLatex} block />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="font-medium text-[var(--text-primary)]">
                  1. Varying Parameters <KaTeXMath math="u_1(x)" /> &amp;{" "}
                  <KaTeXMath math="u_2(x)" />
                </span>
                <span className="font-tabular-mono text-[var(--text-secondary)]">
                  <KaTeXMath math="u_1' = -\frac{y_2 g}{W},\; u_2' = \frac{y_1 g}{W}" />
                </span>
              </div>
              <SvgCoordinatePlane2D
                xRange={vPreset.xRange}
                yRange={[-2.5, 2.5]}
                width={460}
                height={280}
                xLabel="x"
                yLabel="u_k(x)"
                xColor="#8D9FCE"
                yColor="#96B898"
                ariaLabel="Integrated parameter envelopes u1(x) and u2(x)"
                className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
              >
                {({ toSvgX, toSvgY }) => (
                  <>
                    {variationData.u1Pts.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#8D9FCE"
                        strokeWidth={2.2}
                        points={toPoly(variationData.u1Pts, toSvgX, toSvgY, [-2.8, 2.8])}
                      />
                    )}
                    {variationData.u2Pts.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#96B898"
                        strokeWidth={2.2}
                        strokeDasharray="6 3"
                        points={toPoly(variationData.u2Pts, toSvgX, toSvgY, [-2.8, 2.8])}
                      />
                    )}
                  </>
                )}
              </SvgCoordinatePlane2D>
              <div className="flex gap-4 text-[11px] font-sans text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#8D9FCE] inline-block" /> u₁(x)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-[#96B898] inline-block" />{" "}
                  u₂(x)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="font-medium text-[var(--text-primary)]">
                  2. Particular Solution <KaTeXMath math="y_p = u_1 y_1 + u_2 y_2" />{" "}
                  &amp; ODE Check
                </span>
              </div>
              <SvgCoordinatePlane2D
                xRange={vPreset.xRange}
                yRange={vPreset.yRange}
                width={460}
                height={280}
                xLabel="x"
                yLabel="y_p / g"
                xColor="#8D9FCE"
                yColor="#D5658B"
                ariaLabel="Synthesized particular integral y_p(x) and residual ODE verification"
                className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
              >
                {({ toSvgX, toSvgY }) => (
                  <>
                    {variationData.gPts.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#8D9FCE"
                        strokeWidth={2.4}
                        strokeOpacity={0.55}
                        points={toPoly(variationData.gPts, toSvgX, toSvgY, [
                          vPreset.yRange[0] - 0.5,
                          vPreset.yRange[1] + 0.5,
                        ])}
                      />
                    )}
                    {variationData.checkPts.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#FBEAA4"
                        strokeWidth={1.6}
                        strokeDasharray="4 3"
                        points={toPoly(variationData.checkPts, toSvgX, toSvgY, [
                          vPreset.yRange[0] - 0.5,
                          vPreset.yRange[1] + 0.5,
                        ])}
                      />
                    )}
                    {variationData.ypPts.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#D5658B"
                        strokeWidth={2.5}
                        points={toPoly(variationData.ypPts, toSvgX, toSvgY, [
                          vPreset.yRange[0] - 0.5,
                          vPreset.yRange[1] + 0.5,
                        ])}
                      />
                    )}
                  </>
                )}
              </SvgCoordinatePlane2D>
              <div className="flex flex-wrap gap-4 text-[11px] font-sans text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#D5658B] inline-block" /> y_p(x)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#8D9FCE] inline-block" /> g(x)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-[#FBEAA4] inline-block" />{" "}
                  y_p&apos;&apos; + py_p&apos; + qy_p (matches g)
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
            <strong className="text-[var(--text-primary)] font-sans">
              Method Note:
            </strong>{" "}
            {vPreset.note}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {CAUCHY_PRESETS.map((cp) => (
              <button
                key={cp.id}
                type="button"
                onClick={() => selectCauchyPreset(cp)}
                className="px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[#029091] hover:text-[var(--text-primary)] transition-colors"
              >
                {cp.label}
              </button>
            ))}
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[var(--text-secondary)]">a (x²y&apos;&apos;)</span>
                <span className="font-tabular-mono text-[#8D9FCE]">
                  {ceA.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.5}
                step={0.5}
                value={ceA}
                onChange={(e) => setCeA(Number(e.target.value))}
                aria-label="Cauchy-Euler coefficient a"
                className="w-full accent-[#8D9FCE]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[var(--text-secondary)]">b (xy&apos;)</span>
                <span className="font-tabular-mono text-[#96B898]">
                  {ceB.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={-4.0}
                max={5.0}
                step={0.5}
                value={ceB}
                onChange={(e) => setCeB(Number(e.target.value))}
                aria-label="Cauchy-Euler coefficient b"
                className="w-full accent-[#96B898]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[var(--text-secondary)]">c (y)</span>
                <span className="font-tabular-mono text-[#029091]">
                  {ceC.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={-5.0}
                max={12.0}
                step={0.5}
                value={ceC}
                onChange={(e) => setCeC(Number(e.target.value))}
                aria-label="Cauchy-Euler coefficient c"
                className="w-full accent-[#029091]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[var(--text-secondary)]">
                  Synced Probe <KaTeXMath math="x_0 = e^{t_0}" />
                </span>
                <span className="font-tabular-mono text-[#D35323]">
                  x₀={xProbe.toFixed(2)} | t₀={cauchyModel.tProbe.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.25}
                max={5.8}
                step={0.05}
                value={xProbe}
                onChange={(e) => setXProbe(Number(e.target.value))}
                aria-label="Synced probe x0"
                className="w-full accent-[#D35323]"
              />
            </div>
          </div>

          {/* Indicial Transformation Readout */}
          <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs overflow-x-auto">
              <KaTeXMath
                math={`${ceA.toFixed(1)}r^2 + (${cauchyModel.bEff.toFixed(
                  1
                )})r + ${ceC.toFixed(1)} = 0 \\implies ${
                  cauchyModel.regime === "complex"
                    ? `r = ${cauchyModel.alpha.toFixed(2)} \\pm ${cauchyModel.beta.toFixed(
                        2
                      )}i`
                    : cauchyModel.regime === "repeated"
                      ? `r_1 = r_2 = ${cauchyModel.alpha.toFixed(2)}`
                      : `r_1 = ${cauchyModel.r1.toFixed(
                          2
                        )},\\; r_2 = ${cauchyModel.r2.toFixed(2)}`
                }`}
              />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-tabular-mono text-[#029091]">
              <ArrowRightLeft className="w-3.5 h-3.5" /> Log Pullback t = ln(x)
            </span>
          </div>

          {/* Dual Physical x vs Log-Pulled t Planes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
                1. Physical Domain (<KaTeXMath math="x > 0" />): Stretched
                Equidimensional Waves
              </span>
              <SvgCoordinatePlane2D
                xRange={[0.15, 6.0]}
                yRange={[-4.5, 4.5]}
                width={460}
                height={280}
                xLabel="x"
                yLabel="y(x)"
                xColor="#D35323"
                yColor="#8D9FCE"
                ariaLabel="Cauchy-Euler basis functions in physical x coordinate"
                className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
              >
                {({ toSvgX, toSvgY }) => (
                  <>
                    <line
                      x1={toSvgX(xProbe)}
                      y1={32}
                      x2={toSvgX(xProbe)}
                      y2={280 - 32}
                      stroke="#FBEAA4"
                      strokeDasharray="4 3"
                    />
                    {cauchyModel.xCurve1.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#8D9FCE"
                        strokeWidth={2.2}
                        points={toPoly(cauchyModel.xCurve1, toSvgX, toSvgY, [-4.8, 4.8])}
                      />
                    )}
                    {cauchyModel.xCurve2.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#96B898"
                        strokeWidth={2.2}
                        strokeDasharray="6 3"
                        points={toPoly(cauchyModel.xCurve2, toSvgX, toSvgY, [-4.8, 4.8])}
                      />
                    )}
                  </>
                )}
              </SvgCoordinatePlane2D>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
                2. Log-Pulled Domain (<KaTeXMath math="t = \ln x" />): Uniform
                Constant-Coefficient Modes
              </span>
              <SvgCoordinatePlane2D
                xRange={[cauchyModel.tMin, cauchyModel.tMax]}
                yRange={[-4.5, 4.5]}
                width={460}
                height={280}
                xLabel="t = ln x"
                yLabel="y(e^t)"
                xColor="#029091"
                yColor="#96B898"
                ariaLabel="Pulled-back constant-coefficient solutions in logarithmic coordinate t"
                className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
              >
                {({ toSvgX, toSvgY }) => (
                  <>
                    <line
                      x1={toSvgX(cauchyModel.tProbe)}
                      y1={32}
                      x2={toSvgX(cauchyModel.tProbe)}
                      y2={280 - 32}
                      stroke="#FBEAA4"
                      strokeDasharray="4 3"
                    />
                    {cauchyModel.tCurve1.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#8D9FCE"
                        strokeWidth={2.2}
                        points={toPoly(cauchyModel.tCurve1, toSvgX, toSvgY, [-4.8, 4.8])}
                      />
                    )}
                    {cauchyModel.tCurve2.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#96B898"
                        strokeWidth={2.2}
                        strokeDasharray="6 3"
                        points={toPoly(cauchyModel.tCurve2, toSvgX, toSvgY, [-4.8, 4.8])}
                      />
                    )}
                  </>
                )}
              </SvgCoordinatePlane2D>
            </div>
          </div>

          <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
            <strong className="text-[var(--text-primary)] font-sans">
              Isomorphism Proof:
            </strong>{" "}
            Because <KaTeXMath math="x = e^t" /> satisfies{" "}
            <KaTeXMath math="x\frac{d}{dx} = \frac{d}{dt} = \theta" /> and{" "}
            <KaTeXMath math="x^2\frac{d^2}{dx^2} = \theta(\theta - 1)" />, every
            Cauchy-Euler equation in <KaTeXMath math="x" /> is literally a
            constant-coefficient linear ODE in logarithmic time{" "}
            <KaTeXMath math="t = \ln x" />. Notice how non-uniform log-waves on the
            left become evenly spaced sinusoids or exponentials on the right!
          </div>
        </div>
      )}
    </section>
  );
}
