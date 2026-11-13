"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D, gammaReal } from "@/components/visualizations/primitives";

type DistId = "gaussian" | "exponential" | "weibull" | "beta";

interface DistMeta {
  id: DistId;
  label: string;
  xRange: [number, number];
  yMaxPdf: number;
  formulaLatex: string;
  description: string;
}

const DISTS: DistMeta[] = [
  {
    id: "gaussian",
    label: "Gaussian N(μ, σ²)",
    xRange: [-4.5, 4.5],
    yMaxPdf: 1.05,
    formulaLatex: "f_X(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}\\exp\\!\\left(-\\frac{(x-\\mu)^2}{2\\sigma^2}\\right)",
    description: "Symmetric bell curve centered at μ; 68.3% of mass sits inside μ ± σ and 95.4% inside μ ± 2σ.",
  },
  {
    id: "exponential",
    label: "Exponential Exp(λ)",
    xRange: [-0.4, 5.5],
    yMaxPdf: 2.1,
    formulaLatex: "f_X(x) = \\lambda e^{-\\lambda x}\\; (x \\ge 0),\\qquad \\mathbb{E}[X] = \\frac{1}{\\lambda}",
    description: "Memoryless waiting-time law with right-skewed tail and mean 1/λ equal to its standard deviation.",
  },
  {
    id: "weibull",
    label: "Weibull (k, λ)",
    xRange: [-0.3, 4.5],
    yMaxPdf: 1.75,
    formulaLatex: "f_X(x) = \\frac{k}{\\lambda}\\left(\\frac{x}{\\lambda}\\right)^{k-1}e^{-(x/\\lambda)^k}\\; (x \\ge 0)",
    description: "Reliability engineering workhorse: k < 1 models infant mortality, k = 1 matches Exp, k > 2 models wear-out.",
  },
  {
    id: "beta",
    label: "Beta (α, β) on [0,1]",
    xRange: [-0.15, 1.15],
    yMaxPdf: 3.4,
    formulaLatex: "f_X(x) = \\frac{x^{\\alpha-1}(1-x)^{\\beta-1}}{\\operatorname{B}(\\alpha,\\beta)}\\; (0 \\le x \\le 1)",
    description: "Flexible bounded probability-of-probability prior used across Bayesian inference and proportions.",
  },
];

function fmt(n: number, digits = 3): string {
  const clean = Math.abs(n) < 1e-7 ? 0 : n;
  return clean.toFixed(digits);
}

/** Standard normal CDF erf approximation (Abramowitz-Stegun 7.1.26) */
function normCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const poly =
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t);
  const erf = 1 - poly * Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}

/**
 * Synchronized PDF Area, CDF Curve & Moment Inspector Lab (6.1.1).
 * Connects probability P(a <= X <= b) directly to shaded density area under f_X(x),
 * vertical difference F_X(b) - F_X(a), mean fulcrum E[X], and spread brackets.
 */
export function PDFCDFMomentLab() {
  const [distId, setDistId] = useState<DistId>("gaussian");
  const [p1, setP1] = useState<number>(0.0); // mu | lambda | k | alpha
  const [p2, setP2] = useState<number>(1.0); // sigma | unused | lambda | beta
  const [boundA, setBoundA] = useState<number>(-1.0);
  const [boundB, setBoundB] = useState<number>(1.0);

  const meta = useMemo(() => DISTS.find((d) => d.id === distId) ?? DISTS[0], [distId]);

  const selectDist = (id: DistId) => {
    setDistId(id);
    if (id === "gaussian") {
      setP1(0.0);
      setP2(1.0);
      setBoundA(-1.0);
      setBoundB(1.0);
    } else if (id === "exponential") {
      setP1(1.1);
      setP2(1.0);
      setBoundA(0.4);
      setBoundB(2.2);
    } else if (id === "weibull") {
      setP1(2.2);
      setP2(1.5);
      setBoundA(0.7);
      setBoundB(2.1);
    } else {
      setP1(2.5);
      setP2(3.2);
      setBoundA(0.2);
      setBoundB(0.65);
    }
  };

  const aVal = Math.min(boundA, boundB);
  const bVal = Math.max(boundA, boundB);

  const stats = useMemo(() => {
    const betaNorm = distId === "beta" ? (gammaReal(p1) * gammaReal(p2)) / gammaReal(p1 + p2) : 1;

    const pdf = (x: number): number => {
      if (distId === "gaussian") {
        const sig = Math.max(0.25, p2);
        const z = (x - p1) / sig;
        return Math.exp(-0.5 * z * z) / (sig * Math.sqrt(2 * Math.PI));
      }
      if (distId === "exponential") {
        if (x < 0) return 0;
        return p1 * Math.exp(-p1 * x);
      }
      if (distId === "weibull") {
        if (x <= 0) return p1 < 1 ? 3 : p1 === 1 ? 1 / p2 : 0;
        const u = x / p2;
        return (p1 / p2) * Math.pow(u, p1 - 1) * Math.exp(-Math.pow(u, p1));
      }
      // beta on [0, 1]
      if (x <= 0 || x >= 1) return 0;
      return (Math.pow(x, p1 - 1) * Math.pow(1 - x, p2 - 1)) / betaNorm;
    };

    // Analytical / high-res numerical CDF
    const cdf = (x: number): number => {
      if (distId === "gaussian") {
        return normCdf((x - p1) / Math.max(0.25, p2));
      }
      if (distId === "exponential") {
        return x <= 0 ? 0 : 1 - Math.exp(-p1 * x);
      }
      if (distId === "weibull") {
        return x <= 0 ? 0 : 1 - Math.exp(-Math.pow(x / p2, p1));
      }
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      // Simpson 80-panel integral on [0, x]
      const N = 80;
      const h = x / N;
      let sum = pdf(1e-4) + pdf(Math.min(0.9999, x));
      for (let i = 1; i < N; i++) {
        const t = i * h;
        sum += (i % 2 === 0 ? 2 : 4) * pdf(t);
      }
      return Math.max(0, Math.min(1, (sum * h) / 3));
    };

    let mean = 0;
    let stdDev = 1;
    if (distId === "gaussian") {
      mean = p1;
      stdDev = p2;
    } else if (distId === "exponential") {
      mean = 1 / p1;
      stdDev = 1 / p1;
    } else if (distId === "weibull") {
      mean = p2 * gammaReal(1 + 1 / p1);
      const e2 = p2 * p2 * gammaReal(1 + 2 / p1);
      stdDev = Math.sqrt(Math.max(0, e2 - mean * mean));
    } else {
      mean = p1 / (p1 + p2);
      const varB = (p1 * p2) / ((p1 + p2) * (p1 + p2) * (p1 + p2 + 1));
      stdDev = Math.sqrt(varB);
    }

    const [xMin, xMax] = meta.xRange;
    const pts: Array<{ x: number; pdf: number; cdf: number }> = [];
    const S = 180;
    for (let i = 0; i <= S; i++) {
      const x = xMin + (i / S) * (xMax - xMin);
      pts.push({ x, pdf: Math.min(meta.yMaxPdf * 1.15, pdf(x)), cdf: cdf(x) });
    }

    const fa = cdf(aVal);
    const fb = cdf(bVal);
    const probMass = Math.max(0, Math.min(1, fb - fa));

    return { pdf, cdf, mean, stdDev, pts, fa, fb, probMass };
  }, [distId, p1, p2, aVal, bVal, meta]);

  return (
    <div className="space-y-5">
      {/* Control Ribbon */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#AAA36D]">
              Continuous Density, CDF & Moment Calculator
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">{meta.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {DISTS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => selectDist(d.id)}
                className={`rounded-lg border px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
                  distId === d.id
                    ? "border-[#AAA36D] bg-[#AAA36D]/20 text-[#F6F0D0]"
                    : "border-[#35383F] bg-[#1E1F22] text-[#A2AAB8] hover:border-[#AAA36D]/60 hover:text-[#F6F0D0]"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#8D9FCE]">
              <span>
                {distId === "gaussian"
                  ? "Mean μ"
                  : distId === "exponential"
                  ? "Rate λ"
                  : distId === "weibull"
                  ? "Shape k"
                  : "Alpha α"}
              </span>
              <span>{fmt(p1, 2)}</span>
            </div>
            <input
              type="range"
              min={distId === "gaussian" ? -2.0 : distId === "exponential" ? 0.4 : distId === "weibull" ? 0.9 : 0.6}
              max={distId === "gaussian" ? 2.0 : distId === "exponential" ? 2.0 : distId === "weibull" ? 3.5 : 5.0}
              step={0.05}
              value={p1}
              onChange={(e) => setP1(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#8D9FCE]"
            />
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#96B898]">
              <span>
                {distId === "gaussian"
                  ? "Std Dev σ"
                  : distId === "exponential"
                  ? "(1 param)"
                  : distId === "weibull"
                  ? "Scale λ"
                  : "Beta β"}
              </span>
              <span>{distId === "exponential" ? "—" : fmt(p2, 2)}</span>
            </div>
            <input
              type="range"
              min={distId === "gaussian" ? 0.4 : 0.6}
              max={distId === "gaussian" ? 2.0 : distId === "weibull" ? 2.4 : 5.0}
              step={0.05}
              disabled={distId === "exponential"}
              value={p2}
              onChange={(e) => setP2(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#96B898] disabled:opacity-40"
            />
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#D35323]">
              <span>Lower Quantile a</span>
              <span>{fmt(boundA, 2)}</span>
            </div>
            <input
              type="range"
              min={meta.xRange[0] + 0.1}
              max={meta.xRange[1] - 0.1}
              step={0.02}
              value={boundA}
              onChange={(e) => setBoundA(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#D35323]"
            />
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#FBEAA4]">
              <span>Upper Quantile b</span>
              <span>{fmt(boundB, 2)}</span>
            </div>
            <input
              type="range"
              min={meta.xRange[0] + 0.1}
              max={meta.xRange[1] - 0.1}
              step={0.02}
              value={boundB}
              onChange={(e) => setBoundB(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#FBEAA4]"
            />
          </label>
        </div>
      </div>

      {/* Dual Synchronized Plots: PDF & CDF */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                Probability Density <KaTeXMath math="f_X(x)" /> & Shaded Mass
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Click plane to snap upper quantile <KaTeXMath math="b" />; triangle marks fulcrum{" "}
                <KaTeXMath math="\mathbb{E}[X]" />.
              </p>
            </div>
            <span className="rounded border border-[#FBEAA4]/50 bg-[#1E1F22] px-2 py-0.5 font-mono text-xs tabular-nums text-[#FBEAA4]">
              P(a ≤ X ≤ b) = {(stats.probMass * 100).toFixed(2)}%
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={meta.xRange}
            yRange={[-0.12 * meta.yMaxPdf, meta.yMaxPdf]}
            width={480}
            height={350}
            xLabel="x"
            yLabel="f(x)"
            ariaLabel="Probability Density Function Plot"
            onSelectPoint={(x) => setBoundB(Math.round(x * 50) / 50)}
          >
            {({ toSvgX, toSvgY }) => {
              const pdfD = stats.pts
                .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p.x).toFixed(1)},${toSvgY(p.pdf).toFixed(1)}`)
                .join(" ");

              const shadePts = stats.pts.filter((p) => p.x >= aVal && p.x <= bVal);
              const baseSvgY = toSvgY(0).toFixed(1);
              const shadeD =
                shadePts.length > 1
                  ? `M${toSvgX(aVal).toFixed(1)},${baseSvgY} L${toSvgX(aVal).toFixed(1)},${toSvgY(
                      stats.pdf(aVal)
                    ).toFixed(1)} ` +
                    shadePts
                      .map((p) => `L${toSvgX(p.x).toFixed(1)},${toSvgY(p.pdf).toFixed(1)}`)
                      .join(" ") +
                    ` L${toSvgX(bVal).toFixed(1)},${toSvgY(stats.pdf(bVal)).toFixed(1)} L${toSvgX(bVal).toFixed(
                      1
                    )},${baseSvgY} Z`
                  : "";

              const mx = toSvgX(stats.mean);
              const myBase = toSvgY(0);

              return (
                <g>
                  {shadeD && <path d={shadeD} fill="#FBEAA4" fillOpacity={0.32} stroke="none" />}
                  <path d={pdfD} fill="none" stroke="#8D9FCE" strokeWidth={2.6} />

                  {/* Interval boundary lines */}
                  <line
                    x1={toSvgX(aVal)}
                    y1={myBase}
                    x2={toSvgX(aVal)}
                    y2={toSvgY(stats.pdf(aVal))}
                    stroke="#D35323"
                    strokeWidth={2}
                  />
                  <line
                    x1={toSvgX(bVal)}
                    y1={myBase}
                    x2={toSvgX(bVal)}
                    y2={toSvgY(stats.pdf(bVal))}
                    stroke="#FBEAA4"
                    strokeWidth={2}
                  />

                  {/* Center of mass fulcrum triangle at E[X] */}
                  <polygon
                    points={`${mx},${myBase + 2} ${mx - 7},${myBase + 13} ${mx + 7},${myBase + 13}`}
                    fill="#AAA36D"
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                Cumulative Distribution <KaTeXMath math="F_X(x) = P(X \le x)" />
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Vertical rise <KaTeXMath math="F_X(b) - F_X(a)" /> equals shaded area on left.
              </p>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={meta.xRange}
            yRange={[-0.08, 1.12]}
            width={480}
            height={350}
            xLabel="x"
            yLabel="F(x)"
            ariaLabel="Cumulative Distribution Function Plot"
          >
            {({ toSvgX, toSvgY }) => {
              const cdfD = stats.pts
                .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p.x).toFixed(1)},${toSvgY(p.cdf).toFixed(1)}`)
                .join(" ");
              const xa = toSvgX(aVal);
              const ya = toSvgY(stats.fa);
              const xb = toSvgX(bVal);
              const yb = toSvgY(stats.fb);

              return (
                <g>
                  <line
                    x1={toSvgX(meta.xRange[0])}
                    y1={toSvgY(1)}
                    x2={toSvgX(meta.xRange[1])}
                    y2={toSvgY(1)}
                    stroke="#4B505C"
                    strokeDasharray="4 4"
                  />
                  <path d={cdfD} fill="none" stroke="#96B898" strokeWidth={2.6} />

                  {/* Vertical height difference F(b) - F(a) */}
                  <line x1={xa} y1={ya} x2={xb} y2={ya} stroke="#D35323" strokeDasharray="3 3" strokeWidth={1.4} />
                  <line x1={xb} y1={ya} x2={xb} y2={yb} stroke="#FBEAA4" strokeWidth={3} />
                  <circle cx={xa} cy={ya} r={5} fill="#D35323" stroke="#F6F0D0" strokeWidth={1.4} />
                  <circle cx={xb} cy={yb} r={5.5} fill="#FBEAA4" stroke="#1E1F22" strokeWidth={1.5} />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Live Formula & Moment Readouts */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#8D9FCE] block">
            Probability Density Law
          </span>
          <div className="mt-2 overflow-x-auto text-xs text-[#F6F0D0]">
            <KaTeXMath block math={meta.formulaLatex} />
          </div>
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 font-mono text-xs tabular-nums text-[#D6DAE2]">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#AAA36D] block">
            Expectation & Spread Moments
          </span>
          <div className="mt-2 space-y-1">
            <div>
              Mean E[X] = <span className="text-[#AAA36D]">{fmt(stats.mean, 4)}</span>
            </div>
            <div>
              Variance Var(X) = <span className="text-[#8D9FCE]">{fmt(stats.stdDev * stats.stdDev, 4)}</span>
            </div>
            <div>
              Std Dev σ = <span className="text-[#96B898]">{fmt(stats.stdDev, 4)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 font-mono text-xs tabular-nums text-[#D6DAE2]">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#FBEAA4] block">
            Interval CDF Readout
          </span>
          <div className="mt-2 space-y-1">
            <div>
              F({fmt(aVal, 2)}) = <span className="text-[#D35323]">{fmt(stats.fa, 4)}</span>
            </div>
            <div>
              F({fmt(bVal, 2)}) = <span className="text-[#FBEAA4]">{fmt(stats.fb, 4)}</span>
            </div>
            <div className="font-semibold text-[#FBEAA4]">
              P({fmt(aVal, 2)} ≤ X ≤ {fmt(bVal, 2)}) = {fmt(stats.probMass, 4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
