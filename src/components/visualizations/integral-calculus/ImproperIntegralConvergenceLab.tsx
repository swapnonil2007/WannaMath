"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, Infinity as InfinityIcon, ShieldCheck, AlertTriangle } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  SvgCoordinatePlane2D,
  integrate1DGaussLegendre,
} from "@/components/visualizations/primitives";

type ImproperKind = "type-1" | "type-2";

interface ImproperPreset {
  id: string;
  name: string;
  kind: ImproperKind;
  badge: string;
  fExpr: string;
  gExpr: string; // Comparison envelope curve
  a: number;
  bFixed: number; // Used when kind === "type-2" (singularity at a)
  defaultT: number;
  maxT: number;
  defaultShowComparison: boolean;
  exactValueLatex: string;
  statusNote: string;
  converges: boolean;
}

const IMPROPER_PRESETS: ImproperPreset[] = [
  {
    id: "p-integral-2",
    name: "Convergent p-Integral (p = 2): 1 / x²",
    kind: "type-1",
    badge: "Converges to 1.0000",
    fExpr: "1 / x^2",
    gExpr: "1 / (x * (x - 0.5))",
    a: 1,
    bFixed: 10,
    defaultT: 6.5,
    maxT: 16,
    defaultShowComparison: false,
    exactValueLatex:
      "\\int_1^{\\infty} \\frac{1}{x^2}\\,dx = \\lim_{T\\to\\infty} \\left(1 - \\frac{1}{T}\\right) = 1",
    statusNote:
      "Because p = 2 > 1, the area under 1/x² decays fast enough that even over [1, ∞) the accumulated integral levels off sharply at L = 1.",
    converges: true,
  },
  {
    id: "p-integral-1",
    name: "Divergent Harmonic Tail (p = 1): 1 / x",
    kind: "type-1",
    badge: "Diverges (ln T → ∞)",
    fExpr: "1 / x",
    gExpr: "1 / x^2",
    a: 1,
    bFixed: 10,
    defaultT: 7.5,
    maxT: 16,
    defaultShowComparison: true,
    exactValueLatex:
      "\\int_1^{\\infty} \\frac{1}{x}\\,dx = \\lim_{T\\to\\infty} \\ln(T) = +\\infty",
    statusNote:
      "Knife-edge boundary p = 1: although 1/x → 0 as x → ∞, it does not decay fast enough! The area I(T) = ln(T) grows without bound.",
    converges: false,
  },
  {
    id: "comparison-gaussian-bell",
    name: "Comparison Test: 1 / (x² + e^x) ≤ 1 / x²",
    kind: "type-1",
    badge: "Direct Comparison Converges",
    fExpr: "1 / (x^2 + exp(x))",
    gExpr: "1 / x^2",
    a: 1,
    bFixed: 10,
    defaultT: 6,
    maxT: 14,
    defaultShowComparison: true,
    exactValueLatex:
      "0 \\le \\frac{1}{x^2 + e^x} \\le \\frac{1}{x^2} \\;\\text{ and }\\; \\int_1^\\infty \\frac{dx}{x^2} = 1 \\implies \\text{Converges!}",
    statusNote:
      "Even without an elementary antiderivative, trapping f(x) beneath the convergent envelope g(x) = 1/x² guarantees ∫₁^∞ f(x) dx converges.",
    converges: true,
  },
  {
    id: "type2-sqrt",
    name: "Type II Integrable Spike: 1 / √x on (0, 2]",
    kind: "type-2",
    badge: "Converges (p = 0.5 < 1)",
    fExpr: "1 / sqrt(x)",
    gExpr: "1 / x",
    a: 0,
    bFixed: 2,
    defaultT: 0.08,
    maxT: 1.0,
    defaultShowComparison: false,
    exactValueLatex:
      "\\int_{0}^{2} \\frac{1}{\\sqrt{x}}\\,dx = \\lim_{\\varepsilon\\to 0^+}\\left[2\\sqrt{x}\\right]_{\\varepsilon}^{2} = 2\\sqrt{2} \\approx 2.8284",
    statusNote:
      "Vertical asymptote at x = 0! For Type II improper integrals ∫₀ᵇ x^(-p) dx, p < 1 converges because horizontal thickness shrinks faster than height explodes.",
    converges: true,
  },
  {
    id: "type2-blowup",
    name: "Type II Divergent Spike: 1 / x^1.25 on (0, 2]",
    kind: "type-2",
    badge: "Diverges (p = 1.25 ≥ 1)",
    fExpr: "1 / (x^1.25)",
    gExpr: "1 / sqrt(x)",
    a: 0,
    bFixed: 2,
    defaultT: 0.12,
    maxT: 1.0,
    defaultShowComparison: true,
    exactValueLatex:
      "\\int_{0}^{2} x^{-1.25}\\,dx = \\lim_{\\varepsilon\\to 0^+} 4\\left(\\varepsilon^{-0.25} - 2^{-0.25}\\right) = +\\infty",
    statusNote:
      "Since p = 1.25 ≥ 1 near x = 0⁺, scrubbing ε → 0⁺ causes the partial area I(ε) to shoot vertically toward +∞.",
    converges: false,
  },
];

export function ImproperIntegralConvergenceLab() {
  const [presetId, setPresetId] = useState<string>("p-integral-2");
  const [kind, setKind] = useState<ImproperKind>("type-1");
  const [fExpr, setFExpr] = useState<string>(IMPROPER_PRESETS[0].fExpr);
  const [gExpr, setGExpr] = useState<string>(IMPROPER_PRESETS[0].gExpr);
  const [pExponent, setPExponent] = useState<number>(2.0);
  const [usePFamily, setUsePFamily] = useState<boolean>(false);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Scrubber parameter: for Type I, cutoff T ∈ [1.5, 16]; for Type II, gap ε ∈ [0.015, 1.0]
  const [cutoffT, setCutoffT] = useState<number>(IMPROPER_PRESETS[0].defaultT);
  const [epsGap, setEpsGap] = useState<number>(0.08);

  const activePreset = useMemo(
    () =>
      IMPROPER_PRESETS.find((p) => p.id === presetId) ?? IMPROPER_PRESETS[0],
    [presetId]
  );

  const effectiveFExpr = usePFamily
    ? kind === "type-1"
      ? `1 / x^(${pExponent.toFixed(2)})`
      : `1 / x^(${pExponent.toFixed(2)})`
    : fExpr;

  const compiledF = useMemo(
    () => compileMathExpression(effectiveFExpr, ["x"]),
    [effectiveFExpr]
  );
  const compiledG = useMemo(
    () => compileMathExpression(gExpr, ["x"]),
    [gExpr]
  );

  const handleSelectPreset = (p: ImproperPreset) => {
    setPresetId(p.id);
    setKind(p.kind);
    setFExpr(p.fExpr);
    setGExpr(p.gExpr);
    setShowComparison(p.defaultShowComparison);
    setUsePFamily(false);
    setIsCustom(false);
    if (p.kind === "type-1") {
      setCutoffT(p.defaultT);
    } else {
      setEpsGap(p.defaultT);
    }
  };

  // Sample curve, shaded polygon, and accumulation trajectory I(t)
  const analysis = useMemo(() => {
    const xStart = kind === "type-1" ? 1 : epsGap;
    const xEnd = kind === "type-1" ? cutoffT : 2.0;

    // Integrate in sub-panels for accuracy near steep decays/spikes
    const integrateAdaptive = (low: number, high: number) => {
      const panels = 10;
      const step = (high - low) / panels;
      let sum = 0;
      for (let k = 0; k < panels; k++) {
        const l = low + k * step;
        const r = l + step;
        sum += integrate1DGaussLegendre(
          (x) => compiledF.evaluate({ x }),
          l,
          r,
          8
        );
      }
      return sum;
    };

    const partialArea = integrateAdaptive(xStart, xEnd);

    // Sample main integrand curve and optional comparison curve
    const plotXMin = kind === "type-1" ? 0.8 : 0.0;
    const plotXMax = kind === "type-1" ? 15.0 : 2.2;
    const yCap = kind === "type-1" ? 2.2 : 6.0;

    const curvePts: [number, number][] = [];
    const compPts: [number, number][] = [];
    const shadedPts: [number, number][] = [[xStart, 0]];

    const N = 120;
    for (let i = 0; i <= N; i++) {
      const x = plotXMin + (i / N) * (plotXMax - plotXMin);
      if (x <= 0.008) continue;
      const y = compiledF.evaluate({ x });
      if (Number.isFinite(y)) {
        curvePts.push([x, Math.max(-yCap, Math.min(yCap, y))]);
      }
      if (showComparison) {
        const gy = compiledG.evaluate({ x });
        if (Number.isFinite(gy)) {
          compPts.push([x, Math.max(-yCap, Math.min(yCap, gy))]);
        }
      }
    }

    const M = 80;
    for (let i = 0; i <= M; i++) {
      const x = xStart + (i / M) * (xEnd - xStart);
      const y = compiledF.evaluate({ x });
      if (Number.isFinite(y)) {
        shadedPts.push([x, Math.max(-yCap, Math.min(yCap, y))]);
      }
    }
    shadedPts.push([xEnd, 0]);

    // Accumulation trajectory curve I(u)
    const accumPts: [number, number][] = [];
    const accumSteps = 45;
    if (kind === "type-1") {
      for (let i = 0; i <= accumSteps; i++) {
        const t = 1 + (i / accumSteps) * 14.0;
        const val = t <= 1.01 ? 0 : integrateAdaptive(1, t);
        if (Number.isFinite(val)) {
          accumPts.push([t, Math.min(6, val)]);
        }
      }
    } else {
      for (let i = 0; i <= accumSteps; i++) {
        // Plot against left gap eps from 1.0 down to 0.015 (left to right on log-like reverse axis or direct eps)
        const eps = 0.015 + (i / accumSteps) * 0.985;
        const val = integrateAdaptive(eps, 2.0);
        if (Number.isFinite(val)) {
          accumPts.push([eps, Math.min(8, val)]);
        }
      }
    }

    // Asymptotic convergence test via large cutoff comparison (T = 40 vs T = 160 for Type I, eps = 1e-4 vs 1e-5 for Type II)
    let tailDelta = 0;
    let estimatedTotal = partialArea;
    if (kind === "type-1") {
      const i20 = integrateAdaptive(1, 25);
      const i60 = i20 + integrateAdaptive(25, 80);
      tailDelta = Math.abs(i60 - i20);
      estimatedTotal = i60;
    } else {
      const iSmall1 = integrateAdaptive(0.002, 2.0);
      const iSmall2 = integrateAdaptive(0.0002, 0.002) + iSmall1;
      tailDelta = Math.abs(iSmall2 - iSmall1);
      estimatedTotal = iSmall2;
    }

    const likelyConverges = usePFamily
      ? kind === "type-1"
        ? pExponent > 1
        : pExponent < 1
      : isCustom
      ? tailDelta < 0.08
      : activePreset.converges;

    return {
      partialArea,
      curvePts,
      compPts,
      shadedPts,
      accumPts,
      plotXMin,
      plotXMax,
      yCap,
      xStart,
      xEnd,
      likelyConverges,
      estimatedTotal,
    };
  }, [
    kind,
    epsGap,
    cutoffT,
    compiledF,
    compiledG,
    showComparison,
    usePFamily,
    pExponent,
    isCustom,
    activePreset.converges,
  ]);

  return (
    <section
      aria-label="Improper Integrals and Comparison Envelope Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#D5658B] text-[#D5658B] bg-[var(--bg-canvas)]">
              LAB 3.2.5A • IMPROPER INTEGRALS &amp; DIRECT COMPARISON
            </span>
            <span
              className={`px-2 py-0.5 text-[11px] font-tabular-mono border inline-flex items-center gap-1 ${
                analysis.likelyConverges
                  ? "border-[#96B898] text-[#96B898] bg-[#96B898]/10"
                  : "border-[#D35323] text-[#D35323] bg-[#D35323]/10"
              }`}
            >
              {analysis.likelyConverges ? (
                <>
                  <ShieldCheck className="w-3 h-3" /> Convergent
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" /> Divergent (Unbounded)
                </>
              )}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            {kind === "type-1" ? (
              <>
                Type I Infinite-Tail Limit <KaTeXMath math="\int_{1}^{\infty} f(x)\,dx = \lim_{T\to\infty}\int_{1}^{T} f(x)\,dx" />
              </>
            ) : (
              <>
                Type II Singular Limit <KaTeXMath math="\int_{0}^{2} f(x)\,dx = \lim_{\varepsilon\to 0^+}\int_{\varepsilon}^{2} f(x)\,dx" />
              </>
            )}
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {IMPROPER_PRESETS.map((p) => {
            const active = !isCustom && !usePFamily && p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "border-[#D5658B] bg-[#D5658B]/15 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                {p.name.split(":")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Function & Comparison Envelope Controls */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MathExpressionInput
            label="Integrand f(x):"
            prefixLatex="f(x) ="
            value={effectiveFExpr}
            onChange={(val) => {
              setFExpr(val);
              setUsePFamily(false);
              setIsCustom(true);
            }}
            allowedVars={["x"]}
            compact
          />
          <MathExpressionInput
            label="Comparison Envelope g(x) (Overlay):"
            prefixLatex="g(x) ="
            value={gExpr}
            onChange={(val) => {
              setGExpr(val);
              setShowComparison(true);
            }}
            allowedVars={["x"]}
            compact
          />
        </div>

        {/* Interactive p-Test Knife-Edge Mode + Domain Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setKind("type-1");
                setUsePFamily(true);
              }}
              className={`px-3 py-1 text-xs font-tabular-mono border ${
                usePFamily && kind === "type-1"
                  ? "border-[#029091] bg-[#029091]/15 text-[var(--text-primary)]"
                  : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
              }`}
            >
              p-Integral Lab ∫₁^∞ x^(-p) dx
            </button>
            <button
              type="button"
              onClick={() => {
                setKind("type-2");
                setUsePFamily(true);
              }}
              className={`px-3 py-1 text-xs font-tabular-mono border ${
                usePFamily && kind === "type-2"
                  ? "border-[#D35323] bg-[#D35323]/15 text-[var(--text-primary)]"
                  : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
              }`}
            >
              Type II Spike Lab ∫₀² x^(-p) dx
            </button>

            <button
              type="button"
              onClick={() => setShowComparison((v) => !v)}
              className={`px-3 py-1 text-xs font-tabular-mono border ${
                showComparison
                  ? "border-[#FBEAA4] text-[#FBEAA4] bg-[#FBEAA4]/10"
                  : "border-[var(--border-subtle)] text-[var(--text-muted)]"
              }`}
            >
              {showComparison ? "Comparison g(x) Visible" : "Show Comparison g(x)"}
            </button>
          </div>

          {usePFamily && (
            <div className="flex items-center gap-3 text-xs font-tabular-mono">
              <span className="text-[#FBEAA4]">
                Exponent p = {pExponent.toFixed(2)} (
                {kind === "type-1"
                  ? pExponent > 1
                    ? "p > 1 Converges"
                    : "p ≤ 1 Diverges"
                  : pExponent < 1
                  ? "p < 1 Converges"
                  : "p ≥ 1 Diverges"}
                )
              </span>
              <input
                type="range"
                min={0.35}
                max={2.6}
                step={0.05}
                value={pExponent}
                onChange={(e) => setPExponent(parseFloat(e.target.value))}
                className="w-36 accent-[#FBEAA4]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Split Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Area Under Curve + Envelope */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[#8D9FCE] flex items-center gap-1.5">
              <InfinityIcon className="w-3.5 h-3.5" />
              Shaded Partial Integral I = {analysis.partialArea.toFixed(4)}
            </span>
            <span className="text-[#D35323]">
              {kind === "type-1"
                ? `Cutoff T = ${cutoffT.toFixed(2)}`
                : `Singularity Gap ε = ${epsGap.toFixed(3)}`}
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[analysis.plotXMin, analysis.plotXMax]}
            yRange={[-0.2, analysis.yCap]}
            height={300}
            ariaLabel="Improper Integral Tail Area and Comparison Envelope"
          >
            {({ toSvgX, toSvgY }) => {
              const shadedD = analysis.shadedPts
                .map(
                  ([px, py], idx) =>
                    `${idx === 0 ? "M" : "L"} ${toSvgX(px).toFixed(1)} ${toSvgY(py).toFixed(1)}`
                )
                .join(" ");
              const curveD = analysis.curvePts
                .map(
                  ([px, py], idx) =>
                    `${idx === 0 ? "M" : "L"} ${toSvgX(px).toFixed(1)} ${toSvgY(py).toFixed(1)}`
                )
                .join(" ");
              const compD = analysis.compPts
                .map(
                  ([px, py], idx) =>
                    `${idx === 0 ? "M" : "L"} ${toSvgX(px).toFixed(1)} ${toSvgY(py).toFixed(1)}`
                )
                .join(" ");

              const wallX = kind === "type-1" ? cutoffT : epsGap;

              return (
                <g>
                  {/* Shaded finite partial area */}
                  {shadedD && (
                    <path
                      d={`${shadedD} Z`}
                      fill="#029091"
                      fillOpacity="0.34"
                    />
                  )}

                  {/* Comparison Envelope g(x) */}
                  {showComparison && compD && (
                    <path
                      d={compD}
                      fill="none"
                      stroke="#FBEAA4"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                    />
                  )}

                  {/* Integrand Curve f(x) */}
                  {curveD && (
                    <path
                      d={curveD}
                      fill="none"
                      stroke="#8D9FCE"
                      strokeWidth="2.6"
                    />
                  )}

                  {/* Cutoff Wall */}
                  <line
                    x1={toSvgX(wallX)}
                    y1={toSvgY(-0.2)}
                    x2={toSvgX(wallX)}
                    y2={toSvgY(analysis.yCap)}
                    stroke="#D35323"
                    strokeWidth="2.4"
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          {/* Limit Scrubber */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            {kind === "type-1" ? (
              <>
                <div className="flex justify-between text-xs font-tabular-mono text-[#D35323]">
                  <span>Sweep Upper Tail Limit T → ∞</span>
                  <span>T = {cutoffT.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={1.4}
                  max={14.5}
                  step={0.1}
                  value={cutoffT}
                  onChange={(e) => setCutoffT(parseFloat(e.target.value))}
                  className="w-full accent-[#D35323]"
                />
              </>
            ) : (
              <>
                <div className="flex justify-between text-xs font-tabular-mono text-[#D35323]">
                  <span>Shrink Singularity Gap ε → 0⁺</span>
                  <span>ε = {epsGap.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min={0.015}
                  max={1.0}
                  step={0.005}
                  value={epsGap}
                  onChange={(e) => setEpsGap(parseFloat(e.target.value))}
                  className="w-full accent-[#D35323]"
                />
              </>
            )}

            <p className="font-math-serif text-sm text-[var(--text-secondary)] pt-1">
              {usePFamily
                ? kind === "type-1"
                  ? `Notice the universal p-integral rule on [1, ∞): p = ${pExponent.toFixed(2)} ${pExponent > 1 ? "> 1 guarantees finite limiting area 1/(p-1)." : "≤ 1 diverges to +∞."}`
                  : `Notice the reversed Type II p-rule on (0, 2]: p = ${pExponent.toFixed(2)} ${pExponent < 1 ? "< 1 integrates smoothly through the vertical spike." : "≥ 1 diverges vertically at x = 0⁺."}`
                : isCustom
                ? "Scrub the limit boundary and watch I(T) in the right panel: horizontal flattening indicates convergence, steady climbing indicates divergence."
                : activePreset.statusNote}
            </p>
          </div>
        </div>

        {/* Right: Accumulation Trajectory I(T) or I(ε) */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)]">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[#96B898] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              {kind === "type-1"
                ? "Partial Integral Trajectory I(T)"
                : "Partial Integral I(ε) vs. ε"}
            </span>
            <span className="text-[#FBEAA4]">
              {analysis.likelyConverges
                ? `Est. Limit ≈ ${analysis.estimatedTotal.toFixed(3)}`
                : "No Finite Limit"}
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={kind === "type-1" ? [1, 15] : [0, 1.05]}
            yRange={[0, kind === "type-1" ? 5.5 : 7.5]}
            xLabel={kind === "type-1" ? "T" : "ε"}
            yLabel="I"
            height={235}
            ariaLabel="Partial Integral Limit Trajectory Plot"
          >
            {({ toSvgX, toSvgY }) => {
              const trajD = analysis.accumPts
                .map(
                  ([tx, iy], idx) =>
                    `${idx === 0 ? "M" : "L"} ${toSvgX(tx).toFixed(1)} ${toSvgY(iy).toFixed(1)}`
                )
                .join(" ");
              const curX = kind === "type-1" ? cutoffT : epsGap;
              const curY = Math.min(kind === "type-1" ? 5.5 : 7.5, analysis.partialArea);

              return (
                <g>
                  {analysis.likelyConverges && (
                    <line
                      x1={toSvgX(kind === "type-1" ? 1 : 0)}
                      y1={toSvgY(analysis.estimatedTotal)}
                      x2={toSvgX(kind === "type-1" ? 15 : 1.05)}
                      y2={toSvgY(analysis.estimatedTotal)}
                      stroke="#96B898"
                      strokeDasharray="4 3"
                      strokeWidth="1.8"
                    />
                  )}
                  {trajD && (
                    <path
                      d={trajD}
                      fill="none"
                      stroke="#FBEAA4"
                      strokeWidth="2.4"
                    />
                  )}
                  <circle
                    cx={toSvgX(curX)}
                    cy={toSvgY(curY)}
                    r="5"
                    fill="#D35323"
                    stroke="#1E1F22"
                    strokeWidth="1.5"
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          {/* Symbolic Verification Card */}
          {!usePFamily && !isCustom && (
            <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-x-auto">
              <KaTeXMath math={activePreset.exactValueLatex} block />
            </div>
          )}

          {/* Decision Rule Reference */}
          <div className="grid grid-cols-2 gap-2.5 text-xs font-tabular-mono">
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
              <span className="text-[#8D9FCE] block text-[10px]">
                TYPE I TAIL (x → ∞)
              </span>
              <KaTeXMath math="\int_1^\infty x^{-p}dx" />
              <div className="text-[11px] text-[#96B898]">
                Converges ⇔ p &gt; 1
              </div>
            </div>
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
              <span className="text-[#D35323] block text-[10px]">
                TYPE II SPIKE (x → 0⁺)
              </span>
              <KaTeXMath math="\int_0^b x^{-p}dx" />
              <div className="text-[11px] text-[#96B898]">
                Converges ⇔ p &lt; 1
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
