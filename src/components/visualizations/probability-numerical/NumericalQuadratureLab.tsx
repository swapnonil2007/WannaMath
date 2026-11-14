"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";
import { getAdaptiveAccentInk } from "@/lib/accentInk";

type IntegrandId = "cosine" | "poly5" | "chirp" | "runge";
type RuleId = "midpoint" | "trapezoid" | "simpson" | "gauss";

interface IntegrandMeta {
  id: IntegrandId;
  label: string;
  formulaLatex: string;
  yRange: [number, number];
  exact: number;
  evaluate: (x: number) => number;
  note: string;
}

const INTEGRANDS: IntegrandMeta[] = [
  {
    id: "cosine",
    label: "Smooth Cosine",
    formulaLatex: "f(x) = \\cos\\!\\left(\\frac{\\pi}{2}x\\right) + 0.6",
    yRange: [-0.2, 1.9],
    exact: 4 / Math.PI + 1.2,
    evaluate: (x) => Math.cos((Math.PI * x) / 2) + 0.6,
    note: "Analytic C^∞ integrand: Simpson converges at O(h⁴) while Gauss–Legendre collapses exponentially.",
  },
  {
    id: "poly5",
    label: "Polynomial Degree 5",
    formulaLatex: "f(x) = 0.85x^5 - 1.1x^4 + 0.5x^2 + 0.7",
    yRange: [-0.9, 1.8],
    exact: 2 * (-1.1 / 5 + 0.5 / 3 + 0.7),
    evaluate: (x) => 0.85 * x ** 5 - 1.1 * x ** 4 + 0.5 * x ** 2 + 0.7,
    note: "Degree-5 polynomial: 3-point Gauss–Legendre (2n−1 = 5) hits exact machine precision immediately at N = 3!",
  },
  {
    id: "chirp",
    label: "Oscillatory Wave",
    formulaLatex: "f(x) = 1.1 + \\cos(5x) + 0.35x^2",
    yRange: [-0.2, 2.7],
    exact: 2.2 + (2 * Math.sin(5)) / 5 + 0.7 / 3,
    evaluate: (x) => 1.1 + Math.cos(5 * x) + 0.35 * x * x,
    note: "Coarse N ≤ 4 aliases the 5 rad oscillations; watch accuracy snap once Nyquist sampling is exceeded.",
  },
  {
    id: "runge",
    label: "Runge Rational",
    formulaLatex: "f(x) = \\frac{1.4}{1 + 4x^2}",
    yRange: [-0.1, 1.65],
    exact: 1.4 * Math.atan(2),
    evaluate: (x) => 1.4 / (1 + 4 * x * x),
    note: "Sharp central bell with complex poles at x = ±i/2 that limit global Newton–Cotes interpolation.",
  },
];

const RULES: { id: RuleId; label: string; order: string; color: string }[] = [
  { id: "midpoint", label: "Midpoint", order: "O(h²)", color: "#8D9FCE" },
  { id: "trapezoid", label: "Trapezoidal", order: "O(h²)", color: "#96B898" },
  { id: "simpson", label: "Simpson 1/3", order: "O(h⁴)", color: "#029091" },
  { id: "gauss", label: "Gauss–Legendre", order: "O(h²ⁿ)", color: "#D35323" },
];

function fmt(n: number, digits = 5): string {
  const clean = Math.abs(n) < 1e-12 ? 0 : n;
  return clean.toFixed(digits);
}

/**
 * Compute n-point Gauss–Legendre nodes & weights on [-1, 1] via Newton-Raphson
 * on Legendre polynomials P_n(x).
 */
function computeGaussLegendre(n: number): { nodes: number[]; weights: number[] } {
  const nodes = new Array<number>(n);
  const weights = new Array<number>(n);
  const m = Math.floor((n + 1) / 2);

  for (let i = 0; i < m; i++) {
    let z = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5));
    let dp = 0;
    for (let iter = 0; iter < 40; iter++) {
      let p1 = 1;
      let p2 = 0;
      for (let j = 1; j <= n; j++) {
        const p3 = p2;
        p2 = p1;
        p1 = ((2 * j - 1) * z * p2 - (j - 1) * p3) / j;
      }
      dp = (n * (z * p1 - p2)) / (z * z - 1);
      const zNext = z - p1 / dp;
      if (Math.abs(zNext - z) < 1e-14) {
        z = zNext;
        break;
      }
      z = zNext;
    }
    const w = 2 / ((1 - z * z) * dp * dp);
    nodes[i] = -z;
    nodes[n - 1 - i] = z;
    weights[i] = w;
    weights[n - 1 - i] = w;
  }
  return { nodes, weights };
}

function evalRule(rule: RuleId, f: (x: number) => number, n: number): number {
  const a = -1;
  const b = 1;
  if (rule === "midpoint") {
    const h = (b - a) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += f(a + (i + 0.5) * h);
    }
    return h * sum;
  }
  if (rule === "trapezoid") {
    const h = (b - a) / n;
    let sum = 0.5 * (f(a) + f(b));
    for (let i = 1; i < n; i++) {
      sum += f(a + i * h);
    }
    return h * sum;
  }
  if (rule === "simpson") {
    const nEff = n % 2 === 0 ? n : n + 1;
    const h = (b - a) / nEff;
    let sum = f(a) + f(b);
    for (let i = 1; i < nEff; i++) {
      sum += (i % 2 === 1 ? 4 : 2) * f(a + i * h);
    }
    return (h / 3) * sum;
  }
  const { nodes, weights } = computeGaussLegendre(n);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += weights[i] * f(nodes[i]);
  }
  return sum;
}

/**
 * Lagrange interpolating polynomial through points (xs[k], ys[k]) evaluated at x.
 */
function evalLagrange(xs: number[], ys: number[], x: number): number {
  let total = 0;
  for (let i = 0; i < xs.length; i++) {
    let basis = 1;
    for (let j = 0; j < xs.length; j++) {
      if (i !== j) basis *= (x - xs[j]) / (xs[i] - xs[j]);
    }
    total += ys[i] * basis;
  }
  return total;
}

/**
 * Numerical Quadrature & Log-Log Convergence Error Lab (6.2.1).
 */
export function NumericalQuadratureLab() {
  const [integrandId, setIntegrandId] = useState<IntegrandId>("cosine");
  const [ruleId, setRuleId] = useState<RuleId>("simpson");
  const [nNodes, setNNodes] = useState<number>(6);

  const meta = useMemo(
    () => INTEGRANDS.find((item) => item.id === integrandId) ?? INTEGRANDS[0],
    [integrandId]
  );

  const simpsonEff = nNodes % 2 === 0 ? nNodes : nNodes + 1;

  const { exactCurve, simpsonPolys, gaussData, gaussInterpCurve, approxVal, absErr, convergenceSeries } =
    useMemo(() => {
      const f = meta.evaluate;
      const exactPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= 160; i++) {
        const x = -1 + (2 * i) / 160;
        exactPts.push({ x, y: f(x) });
      }

      // Simpson parabolic arcs (one quadratic per pair of subintervals)
      const sPolys: { x0: number; x2: number; pts: { x: number; y: number }[] }[] = [];
      const hSimp = 2 / simpsonEff;
      for (let i = 0; i < simpsonEff; i += 2) {
        const x0 = -1 + i * hSimp;
        const x1 = -1 + (i + 1) * hSimp;
        const x2 = -1 + (i + 2) * hSimp;
        const ys = [f(x0), f(x1), f(x2)];
        const xs = [x0, x1, x2];
        const pts: { x: number; y: number }[] = [];
        for (let k = 0; k <= 20; k++) {
          const x = x0 + ((x2 - x0) * k) / 20;
          pts.push({ x, y: evalLagrange(xs, ys, x) });
        }
        sPolys.push({ x0, x2, pts });
      }

      // Gauss-Legendre nodes, weights, and degree (n-1) interpolating polynomial
      const gData = computeGaussLegendre(nNodes);
      const gYs = gData.nodes.map((x) => f(x));
      const gCurve: { x: number; y: number }[] = [];
      if (nNodes <= 14) {
        for (let i = 0; i <= 140; i++) {
          const x = -1 + (2 * i) / 140;
          gCurve.push({ x, y: evalLagrange(gData.nodes, gYs, x) });
        }
      }

      const approx = evalRule(ruleId, f, nNodes);
      const err = Math.abs(approx - meta.exact);

      // Log-log convergence error series over even N in [2..16]
      const ns = [2, 4, 6, 8, 10, 12, 14, 16];
      const series = RULES.map((r) => ({
        rule: r,
        points: ns.map((n) => {
          const e = Math.max(1e-13, Math.abs(evalRule(r.id, f, n) - meta.exact));
          return { n, logN: Math.log10(n), logE: Math.log10(e), rawErr: e };
        }),
      }));

      return {
        exactCurve: exactPts,
        simpsonPolys: sPolys,
        gaussData: { ...gData, ys: gYs },
        gaussInterpCurve: gCurve,
        approxVal: approx,
        absErr: err,
        convergenceSeries: series,
      };
    }, [meta, ruleId, nNodes, simpsonEff]);

  const activeRuleMeta = RULES.find((r) => r.id === ruleId) ?? RULES[0];
  const h = 2 / (ruleId === "simpson" ? simpsonEff : nNodes);

  return (
    <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-grid)]">
            Lab 6.2.1 • Newton–Cotes vs. Gauss–Legendre Quadrature
          </span>
          <h2 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
            Quadrature Panel Geometry &amp; Log–Log Convergence Slope
          </h2>
          <p className="text-xs font-math-serif text-[var(--text-secondary)]">
            {meta.note}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {INTEGRANDS.map((item) => {
            const active = item.id === integrandId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setIntegrandId(item.id)}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "border-[var(--math-ink-grid)] bg-[var(--bg-canvas)] text-[var(--math-ink-diff)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5">
        <div className="lg:col-span-6 flex flex-wrap gap-1.5">
          {RULES.map((rule) => {
            const active = rule.id === ruleId;
            return (
              <button
                key={rule.id}
                type="button"
                onClick={() => setRuleId(rule.id)}
                className="px-2.5 py-1.5 text-xs font-tabular-mono border transition-colors"
                style={{
                  borderColor: active ? rule.color : "var(--border-subtle)",
                  backgroundColor: "var(--bg-panel)",
                  color: active ? rule.color : "var(--text-secondary)",
                }}
              >
                {rule.label} ({rule.order})
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-4 space-y-1">
          <div className="flex justify-between text-xs font-tabular-mono">
            <span className="text-[var(--text-secondary)]">
              Nodes / Panels{" "}
              <strong style={{ color: getAdaptiveAccentInk(activeRuleMeta.color) }}>
                N = {nNodes}
                {ruleId === "simpson" && simpsonEff !== nNodes ? ` (Simpson uses ${simpsonEff})` : ""}
              </strong>
            </span>
            <span className="text-[var(--text-muted)]">h = {fmt(h, 3)}</span>
          </div>
          <input
            type="range"
            min={2}
            max={16}
            step={1}
            value={nNodes}
            onChange={(e) => setNNodes(parseInt(e.target.value, 10))}
            aria-label="Number of quadrature nodes or subintervals N"
            className="w-full accent-[#D35323]"
          />
        </div>

        <div className="lg:col-span-2 text-right font-tabular-mono text-xs">
          <div className="text-[var(--text-muted)]">Integrand</div>
          <div className="text-[var(--math-ink-diff)] truncate">
            <KaTeXMath math="[-1, 1]" />
          </div>
        </div>
      </div>

      {/* Dual Synchronized Plots */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left: Function & Quadrature Panels */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-diff)]">(a) Integrand &amp; Quadrature Approximation</span>
            <span style={{ color: getAdaptiveAccentInk(activeRuleMeta.color) }}>
              {activeRuleMeta.label} • <KaTeXMath math={meta.formulaLatex} />
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-1.15, 1.15]}
            yRange={meta.yRange}
            width={420}
            height={295}
            padding={34}
            xLabel="x"
            yLabel="f(x)"
            xColor="#8D9FCE"
            yColor="#FBEAA4"
            ariaLabel="Integrand curve with active quadrature panel approximations"
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const yZero = toSvgY(0);
              const exactPath = exactCurve
                .map((p, idx) => `${idx === 0 ? "M" : "L"}${toSvgX(p.x).toFixed(2)},${toSvgY(p.y).toFixed(2)}`)
                .join(" ");

              return (
                <g>
                  {/* Midpoint rectangles */}
                  {ruleId === "midpoint" &&
                    Array.from({ length: nNodes }).map((_, i) => {
                      const xL = -1 + i * h;
                      const xR = xL + h;
                      const xm = 0.5 * (xL + xR);
                      const ym = meta.evaluate(xm);
                      const sxL = toSvgX(xL);
                      const sxR = toSvgX(xR);
                      const syM = toSvgY(ym);
                      const rectY = Math.min(syM, yZero);
                      const rectH = Math.abs(yZero - syM);
                      return (
                        <g key={i}>
                          <rect
                            x={sxL}
                            y={rectY}
                            width={Math.max(1, sxR - sxL)}
                            height={rectH}
                            fill="#8D9FCE"
                            fillOpacity={0.26}
                            stroke="#8D9FCE"
                            strokeWidth={1.3}
                          />
                          <circle cx={toSvgX(xm)} cy={syM} r={3.2} fill="#8D9FCE" />
                        </g>
                      );
                    })}

                  {/* Trapezoid panels */}
                  {ruleId === "trapezoid" &&
                    Array.from({ length: nNodes }).map((_, i) => {
                      const x0 = -1 + i * h;
                      const x1 = x0 + h;
                      const y0 = meta.evaluate(x0);
                      const y1 = meta.evaluate(x1);
                      const pts = [
                        `${toSvgX(x0)},${yZero}`,
                        `${toSvgX(x0)},${toSvgY(y0)}`,
                        `${toSvgX(x1)},${toSvgY(y1)}`,
                        `${toSvgX(x1)},${yZero}`,
                      ].join(" ");
                      return (
                        <g key={i}>
                          <polygon
                            points={pts}
                            fill="#96B898"
                            fillOpacity={0.25}
                            stroke="#96B898"
                            strokeWidth={1.35}
                          />
                          <circle cx={toSvgX(x0)} cy={toSvgY(y0)} r={2.9} fill="#96B898" />
                          {i === nNodes - 1 && (
                            <circle cx={toSvgX(x1)} cy={toSvgY(y1)} r={2.9} fill="#96B898" />
                          )}
                        </g>
                      );
                    })}

                  {/* Simpson 1/3 quadratic interpolant panels */}
                  {ruleId === "simpson" &&
                    simpsonPolys.map((poly, idx) => {
                      const areaD =
                        `M${toSvgX(poly.x0)},${yZero} ` +
                        poly.pts
                          .map((p) => `L${toSvgX(p.x).toFixed(2)},${toSvgY(p.y).toFixed(2)}`)
                          .join(" ") +
                        ` L${toSvgX(poly.x2)},${yZero} Z`;
                      const curveD = poly.pts
                        .map((p, k) => `${k === 0 ? "M" : "L"}${toSvgX(p.x).toFixed(2)},${toSvgY(p.y).toFixed(2)}`)
                        .join(" ");
                      const xm = 0.5 * (poly.x0 + poly.x2);
                      return (
                        <g key={idx}>
                          <path d={areaD} fill="#029091" fillOpacity={0.24} stroke="none" />
                          <path d={curveD} fill="none" stroke="#029091" strokeWidth={1.9} />
                          <line
                            x1={toSvgX(poly.x0)}
                            y1={yZero}
                            x2={toSvgX(poly.x0)}
                            y2={toSvgY(meta.evaluate(poly.x0))}
                            stroke="#029091"
                            strokeWidth={1}
                            strokeOpacity={0.6}
                          />
                          <line
                            x1={toSvgX(poly.x2)}
                            y1={yZero}
                            x2={toSvgX(poly.x2)}
                            y2={toSvgY(meta.evaluate(poly.x2))}
                            stroke="#029091"
                            strokeWidth={1}
                            strokeOpacity={0.6}
                          />
                          <circle cx={toSvgX(poly.x0)} cy={toSvgY(meta.evaluate(poly.x0))} r={3} fill="#029091" />
                          <circle cx={toSvgX(xm)} cy={toSvgY(meta.evaluate(xm))} r={2.6} fill="#FBEAA4" />
                          {idx === simpsonPolys.length - 1 && (
                            <circle cx={toSvgX(poly.x2)} cy={toSvgY(meta.evaluate(poly.x2))} r={3} fill="#029091" />
                          )}
                        </g>
                      );
                    })}

                  {/* Gauss-Legendre clustered nodes + degree-(N-1) polynomial */}
                  {ruleId === "gauss" && (
                    <g>
                      {gaussInterpCurve.length > 0 && (
                        <path
                          d={gaussInterpCurve
                            .map(
                              (p, idx) =>
                                `${idx === 0 ? "M" : "L"}${toSvgX(p.x).toFixed(2)},${toSvgY(
                                  Math.max(meta.yRange[0] - 0.5, Math.min(meta.yRange[1] + 0.5, p.y))
                                ).toFixed(2)}`
                            )
                            .join(" ")}
                          fill="none"
                          stroke="#D35323"
                          strokeWidth={1.6}
                          strokeDasharray="5 3"
                        />
                      )}
                      {gaussData.nodes.map((xi, idx) => {
                        const yi = gaussData.ys[idx];
                        const wi = gaussData.weights[idx];
                        const sx = toSvgX(xi);
                        const sy = toSvgY(yi);
                        return (
                          <g key={idx}>
                            <line
                              x1={sx}
                              y1={yZero}
                              x2={sx}
                              y2={sy}
                              stroke="#AAA36D"
                              strokeWidth={Math.max(1.5, wi * 5.5)}
                              strokeOpacity={0.75}
                            />
                            <circle cx={sx} cy={sy} r={3.8} fill="#D35323" stroke="#1E1F22" strokeWidth={1} />
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* Exact integrand */}
                  <path d={exactPath} fill="none" stroke="#FBEAA4" strokeWidth={2.2} />

                  {/* Integration bounds x = -1, x = 1 */}
                  <line x1={toSvgX(-1)} y1={14} x2={toSvgX(-1)} y2={281} stroke="#35383F" strokeDasharray="3 3" />
                  <line x1={toSvgX(1)} y1={14} x2={toSvgX(1)} y2={281} stroke="#35383F" strokeDasharray="3 3" />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: Log-Log Convergence Error Plot */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-x)]">(b) Log₁₀ Error Convergence vs. N</span>
            <span className="text-[var(--text-muted)]">log₁₀ |Iₙ − I_exact|</span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[0.22, 1.26]}
            yRange={[-13.8, -0.2]}
            width={420}
            height={295}
            padding={34}
            xLabel="log₁₀ N"
            yLabel="log₁₀ |E|"
            xColor="#8D9FCE"
            yColor="#B95869"
            ariaLabel="Log-log error convergence plot comparing quadrature rules across node counts"
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const activeLogN = Math.log10(
                ruleId === "simpson" ? simpsonEff : nNodes
              );
              return (
                <g>
                  {/* Reference N ticks along bottom */}
                  {[2, 4, 8, 16].map((nTick) => {
                    const lx = toSvgX(Math.log10(nTick));
                    return (
                      <g key={nTick}>
                        <line x1={lx} y1={18} x2={lx} y2={261} stroke="#2B2E35" strokeWidth={1} />
                        <text
                          x={lx}
                          y={278}
                          textAnchor="middle"
                          fontSize={9.5}
                          fill="var(--math-ink-x)"
                          fontFamily="var(--font-jetbrains-mono), monospace"
                        >
                          N={nTick}
                        </text>
                      </g>
                    );
                  })}

                  {/* Vertical active N cursor */}
                  <line
                    x1={toSvgX(activeLogN)}
                    y1={16}
                    x2={toSvgX(activeLogN)}
                    y2={261}
                    stroke={activeRuleMeta.color}
                    strokeWidth={1.3}
                    strokeDasharray="4 3"
                  />

                  {/* Error curves for all 4 methods */}
                  {convergenceSeries.map(({ rule, points }) => {
                    const isFocused = rule.id === ruleId;
                    const d = points
                      .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p.logN).toFixed(2)},${toSvgY(p.logE).toFixed(2)}`)
                      .join(" ");
                    return (
                      <g key={rule.id} opacity={isFocused ? 1 : 0.5}>
                        <path
                          d={d}
                          fill="none"
                          stroke={rule.color}
                          strokeWidth={isFocused ? 2.5 : 1.5}
                        />
                        {points.map((p) => (
                          <circle
                            key={p.n}
                            cx={toSvgX(p.logN)}
                            cy={toSvgY(p.logE)}
                            r={isFocused && p.n === (rule.id === "simpson" ? simpsonEff : nNodes) ? 4.5 : 2.5}
                            fill={rule.color}
                          />
                        ))}
                      </g>
                    );
                  })}

                  {/* Machine epsilon floor guide */}
                  <line
                    x1={34}
                    y1={toSvgY(-13)}
                    x2={386}
                    y2={toSvgY(-13)}
                    stroke="#B95869"
                    strokeDasharray="2 3"
                    strokeOpacity={0.6}
                  />
                  <text
                    x={382}
                    y={toSvgY(-13) - 4}
                    textAnchor="end"
                    fontSize={9}
                    fill="var(--math-ink-upper)"
                    fontFamily="var(--font-jetbrains-mono), monospace"
                  >
                    10⁻¹³ precision floor
                  </text>
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Numerical Telemetry Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-tabular-mono text-xs">
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-1">
          <div className="text-[var(--text-muted)]">Exact Integral I</div>
          <div className="text-base font-semibold text-[var(--math-ink-diff)]">{fmt(meta.exact, 8)}</div>
        </div>
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-1">
          <div className="text-[var(--text-muted)]">{activeRuleMeta.label} Estimate</div>
          <div
            className="text-base font-semibold"
            style={{ color: getAdaptiveAccentInk(activeRuleMeta.color) }}
          >
            {fmt(approxVal, 8)}
          </div>
        </div>
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-1">
          <div className="text-[var(--text-muted)]">Absolute Error |E_N|</div>
          <div className="text-base font-semibold text-[var(--math-ink-upper)]">
            {absErr < 1e-12 ? "< 1.00e-12 (EXACT)" : absErr.toExponential(3)}
          </div>
        </div>
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-1">
          <div className="text-[var(--text-muted)]">Gauss Precision Degree</div>
          <div className="text-base font-semibold text-[var(--math-ink-sweep)]">
            Exact ≤ deg {2 * nNodes - 1}
          </div>
        </div>
      </div>

      {/* Gauss Nodes Preview when Gauss-Legendre is active */}
      {ruleId === "gauss" && (
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-sweep)] font-semibold">
              Legendre Roots &amp; Weights (N = {nNodes})
            </span>
            <span className="text-[var(--text-muted)]">
              <KaTeXMath math="\sum_{i=1}^{N} w_i = 2.0000" /> (notice clustered nodes near endpoints ±1)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 font-tabular-mono text-[11px]">
            {gaussData.nodes.slice(0, 6).map((xi, idx) => (
              <div
                key={idx}
                className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] px-2 py-1.5"
              >
                <div className="text-[var(--math-ink-sweep)]">
                  x_{idx + 1} = {fmt(xi, 4)}
                </div>
                <div className="text-[var(--math-ink-grid)]">w_{idx + 1} = {fmt(gaussData.weights[idx], 4)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
