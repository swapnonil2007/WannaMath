"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  SvgCoordinatePlane2D,
  gammaReal,
  integrate1DGaussLegendre,
} from "@/components/visualizations/primitives/core2d";

interface GammaPreset {
  id: string;
  label: string;
  z: number;
  note: string;
  exactLatex: string;
}

const GAMMA_PRESETS: GammaPreset[] = [
  {
    id: "half",
    label: "z = 1/2 (Gaussian √π)",
    z: 0.5,
    note: "Substituting t = u² transforms ∫₀^∞ t^(-1/2)e^(-t) dt into 2∫₀^∞ e^(-u²) du = √π ≈ 1.7725.",
    exactLatex: "\\Gamma\\!\\left(\\tfrac{1}{2}\\right) = \\sqrt{\\pi} \\approx 1.77245",
  },
  {
    id: "three-halves",
    label: "z = 3/2 (Half-Factorial)",
    z: 1.5,
    note: "Using recurrence Γ(3/2) = (1/2)Γ(1/2) = √π / 2 ≈ 0.8862.",
    exactLatex: "\\Gamma\\!\\left(\\tfrac{3}{2}\\right) = \\tfrac{1}{2}\\sqrt{\\pi} \\approx 0.88623",
  },
  {
    id: "int-3",
    label: "z = 3 (2! = 2)",
    z: 3.0,
    note: "For positive integers n, Γ(n) = (n - 1)! — so Γ(3) = 2! = 2. Notice the peak occurs at t = z - 1 = 2.",
    exactLatex: "\\Gamma(3) = (3-1)! = 2",
  },
  {
    id: "int-4",
    label: "z = 4 (3! = 6)",
    z: 4.0,
    note: "Peak shifts to t = 3; the tail decays quickly enough that T = 10 captures over 99.6% of Γ(4) = 6.",
    exactLatex: "\\Gamma(4) = (4-1)! = 6",
  },
  {
    id: "neg-half",
    label: "z = -1/2 (Analytic Continuation)",
    z: -0.5,
    note: "For z ≤ 0, the Euler integral diverges at t = 0⁺, so Γ(-1/2) is defined by Γ(1/2) / (-1/2) = -2√π ≈ -3.5449.",
    exactLatex: "\\Gamma\\!\\left(-\\tfrac{1}{2}\\right) = \\frac{\\Gamma(1/2)}{-1/2} = -2\\sqrt{\\pi} \\approx -3.54491",
  },
];

export function GammaFunctionLab() {
  const [zParam, setZParam] = useState<number>(2.5);
  const [cutoffT, setCutoffT] = useState<number>(8.0);
  const [activePresetId, setActivePresetId] = useState<string>("custom");

  const selectPreset = (preset: GammaPreset) => {
    setZParam(preset.z);
    setActivePresetId(preset.id);
    if (preset.z >= 3.5) {
      setCutoffT(10);
    } else if (preset.z > 0) {
      setCutoffT(8);
    }
  };

  const resetDefaults = () => {
    setZParam(2.5);
    setCutoffT(8.0);
    setActivePresetId("custom");
  };

  const computed = useMemo(() => {
    const gammaZ = gammaReal(zParam);
    const gammaZPlus1 = gammaReal(zParam + 1);
    const isPole = Math.abs(zParam) <= 0 || Number.isNaN(gammaZ) || !Number.isFinite(gammaZ);
    const isNearPole =
      zParam <= 0 && Math.abs(zParam - Math.round(zParam)) < 0.03;
    const integralConverges = zParam > 0;

    // For z > 0, compute partial integral ∫₀^T t^{z-1} e^{-t} dt accurately without t=0 singularity
    // via substitution t = u^{1/z} => (1/z) ∫₀^{T^z} exp(-u^{1/z}) du
    let partialIntegral = NaN;
    if (integralConverges) {
      const upperU = Math.pow(cutoffT, zParam);
      const segments = 12;
      let acc = 0;
      for (let s = 0; s < segments; s++) {
        const ua = (s / segments) * upperU;
        const ub = ((s + 1) / segments) * upperU;
        acc += integrate1DGaussLegendre(
          (u) => Math.exp(-Math.pow(Math.max(1e-12, u), 1 / zParam)),
          ua,
          ub,
          12
        );
      }
      partialIntegral = acc / zParam;
    }

    // Left panel integrand curve t^{z-1} e^{-t} on (0, 10]
    const tPlotMax = 10.0;
    const tPlotSteps = 180;
    const integrandYMax = zParam <= 1 ? 3.5 : Math.max(1.2, Math.pow(zParam - 1, zParam - 1) * Math.exp(-(zParam - 1)) * 1.35);

    const curvePts: [number, number][] = [];
    const shadedPts: [number, number][] = [];

    // Use displayed positive exponent fallback when z <= 0 so user sees the diverging spike
    const effZ = zParam;
    for (let i = 1; i <= tPlotSteps; i++) {
      const t = (i / tPlotSteps) * tPlotMax;
      const val = Math.pow(t, effZ - 1) * Math.exp(-t);
      if (Number.isFinite(val)) {
        const clamped = Math.min(integrandYMax * 1.15, val);
        curvePts.push([t, clamped]);
        if (t <= cutoffT) {
          shadedPts.push([t, clamped]);
        }
      }
    }

    // Peak location for z > 1
    const tPeak = zParam > 1 ? zParam - 1 : 0;
    const yPeak = zParam > 1 ? Math.pow(tPeak, zParam - 1) * Math.exp(-tPeak) : integrandYMax;

    // Right panel analytic continuation curve Γ(x) on [-3.35, 4.45] split cleanly between simple poles
    const branchIntervals: [number, number][] = [
      [-3.35, -3.04],
      [-2.96, -2.04],
      [-1.96, -1.04],
      [-0.96, -0.04],
      [0.05, 4.45],
    ];
    const branches: [number, number][][] = branchIntervals.map(([xA, xB]) => {
      const pts: [number, number][] = [];
      const steps = 90;
      for (let i = 0; i <= steps; i++) {
        const x = xA + (i / steps) * (xB - xA);
        const gx = gammaReal(x);
        if (Number.isFinite(gx) && gx >= -6.5 && gx <= 8.5) {
          pts.push([x, gx]);
        }
      }
      return pts;
    });

    const factorialPts: { n: number; val: number; label: string }[] = [
      { n: 1, val: 1, label: "0!=1" },
      { n: 2, val: 1, label: "1!=1" },
      { n: 3, val: 2, label: "2!=2" },
      { n: 4, val: 6, label: "3!=6" },
    ];

    const completionPct =
      integralConverges && Number.isFinite(partialIntegral) && gammaZ > 0
        ? Math.min(100, (partialIntegral / gammaZ) * 100)
        : 0;

    return {
      gammaZ,
      gammaZPlus1,
      isPole,
      isNearPole,
      integralConverges,
      partialIntegral,
      completionPct,
      integrandYMax,
      tPlotMax,
      curvePts,
      shadedPts,
      tPeak,
      yPeak,
      branches,
      factorialPts,
    };
  }, [zParam, cutoffT]);

  const activePreset = GAMMA_PRESETS.find((p) => p.id === activePresetId);

  return (
    <section
      aria-label="Gamma Function Euler Integral and Analytic Continuation Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[var(--bg-canvas)]">
              LAB 3.2.6A • THE GAMMA FUNCTION Γ(z)
            </span>
            <span
              className={`px-2 py-0.5 text-[11px] font-tabular-mono border ${
                computed.isNearPole
                  ? "border-[var(--math-ink-upper)] text-[var(--math-ink-upper)] bg-[#B95869]/10"
                  : computed.integralConverges
                  ? "border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[#96B898]/10"
                  : "border-[var(--math-ink-diff)] text-[var(--math-ink-diff)] bg-[#FBEAA4]/10"
              }`}
            >
              {computed.isNearPole
                ? "SIMPLE POLE AT z ∈ {0, -1, -2, ...}"
                : computed.integralConverges
                ? "Euler Integral Converges (z > 0)"
                : "Analytic Continuation Domain (z ≤ 0)"}
            </span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
            Continuous Factorial Interpolation, Tail Decay &amp; Recurrence Ladder
          </h3>
        </div>

        <button
          type="button"
          onClick={resetDefaults}
          className="px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] bg-[var(--bg-canvas)] inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset z = 2.5
        </button>
      </div>

      {/* Controls & Presets */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 space-y-4 bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap gap-2">
          {GAMMA_PRESETS.map((preset) => {
            const selected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset)}
                className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                  selected
                    ? "border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Argument <strong className="text-[var(--math-ink-sweep)] font-mono">z</strong>
              </span>
              <span className="font-tabular-mono text-[var(--math-ink-sweep)] font-medium">
                z = {zParam.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={-3.25}
              max={4.25}
              step={0.05}
              value={zParam}
              aria-label="Gamma argument z"
              onChange={(e) => {
                setZParam(parseFloat(e.target.value));
                setActivePresetId("custom");
              }}
              className="w-full accent-[#D35323]"
            />
            <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--text-muted)]">
              <span>-3.25 (poles)</span>
              <span>0.00</span>
              <span>+4.25 (3.25!)</span>
            </div>
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Upper Integration Cutoff <strong className="text-[var(--math-ink-x)] font-mono">T</strong>
              </span>
              <span className="font-tabular-mono text-[var(--math-ink-x)] font-medium">
                T = {cutoffT.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={10.0}
              step={0.25}
              value={cutoffT}
              disabled={!computed.integralConverges}
              aria-label="Upper cutoff T"
              onChange={(e) => setCutoffT(parseFloat(e.target.value))}
              className="w-full accent-[#8D9FCE] disabled:opacity-40"
            />
            <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--text-muted)]">
              <span>T = 0.5</span>
              <span>
                {computed.integralConverges
                  ? `${computed.completionPct.toFixed(1)}% of Γ(z) captured`
                  : "Euler integral diverges near t = 0⁺"}
              </span>
              <span>T = 10.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Synchronized 2D Planes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
        {/* Left: Euler Integrand t^{z-1} e^{-t} */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              1. Euler Integrand{" "}
              <KaTeXMath math={`k(t) = t^{z-1}e^{-t}`} />
            </span>
            <span className="text-[11px] font-tabular-mono text-[var(--math-ink-z)]">
              {zParam > 1
                ? `Peak at t = z − 1 = ${(zParam - 1).toFixed(2)}`
                : zParam > 0
                ? "Unbounded integrable spike at t → 0⁺"
                : "Non-integrable singularity at t = 0⁺"}
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-0.4, 10.2]}
            yRange={[-0.15, computed.integrandYMax]}
            width={480}
            height={300}
            xLabel="t"
            yLabel="t^(z-1)e^(-t)"
            xColor="#8D9FCE"
            yColor="#029091"
            ariaLabel="Euler Gamma integrand plot"
          >
            {({ toSvgX, toSvgY }) => {
              const polyStr =
                computed.shadedPts.length >= 2
                  ? [
                      `${toSvgX(computed.shadedPts[0][0]).toFixed(1)},${toSvgY(0).toFixed(1)}`,
                      ...computed.shadedPts.map(
                        ([px, py]) =>
                          `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`
                      ),
                      `${toSvgX(
                        computed.shadedPts[computed.shadedPts.length - 1][0]
                      ).toFixed(1)},${toSvgY(0).toFixed(1)}`,
                    ].join(" ")
                  : "";

              const lineStr = computed.curvePts
                .map(
                  ([px, py]) =>
                    `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`
                )
                .join(" ");

              return (
                <>
                  {computed.integralConverges && polyStr && (
                    <polygon
                      points={polyStr}
                      fill="#029091"
                      fillOpacity={0.28}
                    />
                  )}
                  {lineStr && (
                    <polyline
                      points={lineStr}
                      fill="none"
                      stroke={computed.integralConverges ? "#FBEAA4" : "#B95869"}
                      strokeWidth={2.2}
                    />
                  )}
                  {/* Cutoff line t = T */}
                  {computed.integralConverges && (
                    <g>
                      <line
                        x1={toSvgX(cutoffT)}
                        y1={toSvgY(0)}
                        x2={toSvgX(cutoffT)}
                        y2={toSvgY(computed.integrandYMax * 0.9)}
                        stroke="#D35323"
                        strokeWidth={1.6}
                        strokeDasharray="4 3"
                      />
                      <text
                        x={toSvgX(cutoffT) - 6}
                        y={toSvgY(computed.integrandYMax * 0.85)}
                        textAnchor="end"
                        fill="var(--math-ink-sweep)"
                        fontSize={11}
                        fontFamily="JetBrains Mono, monospace"
                      >
                        T={cutoffT.toFixed(1)}
                      </text>
                    </g>
                  )}
                  {/* Peak marker when z > 1 */}
                  {zParam > 1 && (
                    <g>
                      <line
                        x1={toSvgX(computed.tPeak)}
                        y1={toSvgY(0)}
                        x2={toSvgX(computed.tPeak)}
                        y2={toSvgY(computed.yPeak)}
                        stroke="#96B898"
                        strokeDasharray="3 3"
                        strokeWidth={1.2}
                      />
                      <circle
                        cx={toSvgX(computed.tPeak)}
                        cy={toSvgY(computed.yPeak)}
                        r={4}
                        fill="#96B898"
                      />
                      <text
                        x={toSvgX(computed.tPeak) + 6}
                        y={toSvgY(computed.yPeak) - 4}
                        fill="var(--math-ink-y)"
                        fontSize={10}
                        fontFamily="JetBrains Mono, monospace"
                      >
                        t=z−1
                      </text>
                    </g>
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>

          <p className="text-xs font-serif text-[var(--text-secondary)] leading-relaxed">
            Notice the power-vs-exponential duel: <KaTeXMath math="t^{z-1}" />{" "}
            pulls the peak rightward as <KaTeXMath math="z" /> grows, while{" "}
            <KaTeXMath math="e^{-t}" /> crushes the right tail for any finite{" "}
            <KaTeXMath math="z" />. When <KaTeXMath math="0 < z < 1" />,
            the integrand blows up near <KaTeXMath math="t=0^+" /> yet encloses finite area!
          </p>
        </div>

        {/* Right: Analytic Continuation Curve Γ(x) */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              2. Full Real Graph <KaTeXMath math="y = \Gamma(x)" /> &amp; Factorial Points
            </span>
            <span className="text-[11px] font-tabular-mono text-[var(--math-ink-upper)]">
              Poles at x = 0, -1, -2, -3
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-3.4, 4.5]}
            yRange={[-6.0, 8.0]}
            width={480}
            height={300}
            xLabel="x"
            yLabel="Γ(x)"
            xColor="#8D9FCE"
            yColor="#D35323"
            ariaLabel="Gamma function analytic continuation plot"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {/* Poles at x = 0, -1, -2, -3 */}
                {[0, -1, -2, -3].map((pole) => (
                  <line
                    key={pole}
                    x1={toSvgX(pole)}
                    y1={toSvgY(-6)}
                    x2={toSvgX(pole)}
                    y2={toSvgY(8)}
                    stroke="#B95869"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    opacity={0.75}
                  />
                ))}

                {/* Smooth branches */}
                {computed.branches.map((pts, idx) => {
                  const lineStr = pts
                    .map(
                      ([px, py]) =>
                        `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`
                    )
                    .join(" ");
                  return (
                    <polyline
                      key={idx}
                      points={lineStr}
                      fill="none"
                      stroke="#8D9FCE"
                      strokeWidth={2.2}
                    />
                  );
                })}

                {/* Integer Factorial Points */}
                {computed.factorialPts.map((pt) => (
                  <g key={pt.n}>
                    <circle
                      cx={toSvgX(pt.n)}
                      cy={toSvgY(pt.val)}
                      r={3.8}
                      fill="#96B898"
                    />
                    <text
                      x={toSvgX(pt.n) + 5}
                      y={toSvgY(pt.val) - 5}
                      fill="var(--math-ink-y)"
                      fontSize={10}
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}

                {/* Active z and recurrence z+1 dots */}
                {!computed.isNearPole &&
                  Number.isFinite(computed.gammaZ) &&
                  computed.gammaZ >= -6 &&
                  computed.gammaZ <= 8 && (
                    <g>
                      <line
                        x1={toSvgX(zParam)}
                        y1={toSvgY(0)}
                        x2={toSvgX(zParam)}
                        y2={toSvgY(computed.gammaZ)}
                        stroke="#D35323"
                        strokeDasharray="3 2"
                        strokeWidth={1.3}
                      />
                      <circle
                        cx={toSvgX(zParam)}
                        cy={toSvgY(computed.gammaZ)}
                        r={5}
                        fill="#D35323"
                      />
                    </g>
                  )}
              </>
            )}
          </SvgCoordinatePlane2D>

          <p className="text-xs font-serif text-[var(--text-secondary)] leading-relaxed">
            Solving <KaTeXMath math="\Gamma(z) = \Gamma(z+1)/z" /> steps backward
            across <KaTeXMath math="x=0" />, alternating sign between negative integers and
            creating simple poles wherever division by <KaTeXMath math="z+k=0" /> occurs.
          </p>
        </div>
      </div>

      {/* Readout Ladder & Explanatory Note */}
      <div className="border-t border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-elevated)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans uppercase tracking-wider text-[var(--text-muted)]">
              Partial Integral I(T)
            </div>
            <div className="mt-1 text-base font-tabular-mono text-[var(--math-ink-z)]">
              {computed.integralConverges && Number.isFinite(computed.partialIntegral)
                ? computed.partialIntegral.toFixed(5)
                : "Diverges at t = 0⁺"}
            </div>
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans uppercase tracking-wider text-[var(--text-muted)]">
              Exact / Continued Γ(z)
            </div>
            <div className="mt-1 text-base font-tabular-mono text-[var(--math-ink-sweep)]">
              {computed.isNearPole || !Number.isFinite(computed.gammaZ)
                ? "±∞ (Pole)"
                : computed.gammaZ.toFixed(5)}
            </div>
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
              <span>Recurrence</span>
              <ArrowRight className="w-3 h-3 text-[var(--math-ink-diff)]" />
              <span>Γ(z + 1) = z·Γ(z)</span>
            </div>
            <div className="mt-1 text-sm font-tabular-mono text-[var(--math-ink-diff)]">
              {computed.isNearPole || !Number.isFinite(computed.gammaZPlus1)
                ? "Undefined at pole"
                : `${zParam.toFixed(2)} × (${computed.gammaZ.toFixed(3)}) = ${computed.gammaZPlus1.toFixed(4)}`}
            </div>
          </div>
        </div>

        {activePreset && (
          <div className="p-3 border border-[var(--math-ink-diff)]/40 bg-[var(--bg-canvas)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="text-xs font-sans font-semibold text-[var(--math-ink-diff)] inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {activePreset.label}
              </div>
              <p className="text-xs font-serif text-[var(--text-secondary)]">
                {activePreset.note}
              </p>
            </div>
            <div className="shrink-0 px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              <KaTeXMath math={activePreset.exactLatex} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
