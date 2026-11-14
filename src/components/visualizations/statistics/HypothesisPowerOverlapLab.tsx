"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { normalCdf, normalInvCdf, normalPdf } from "./statMath";

type AlphaLevel = 0.1 | 0.05 | 0.01;
type TailMode = "two_tailed" | "right_tailed";

const POP_SIGMA = 10;

function fmt(n: number, digits = 3): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.4.3 — Dual-Curve H₀ vs. H₁ Hypothesis Testing, Live Clickable p-Value & Statistical Power Lab.
 */
export function HypothesisPowerOverlapLab() {
  const [delta, setDelta] = useState<number>(3.5);
  const [n, setN] = useState<number>(36);
  const [alpha, setAlpha] = useState<AlphaLevel>(0.05);
  const [tailMode, setTailMode] = useState<TailMode>("two_tailed");
  const [xObs, setXObs] = useState<number>(3.6);

  const se = POP_SIGMA / Math.sqrt(n);
  const mu0 = 0;
  const mu1 = delta;

  const { critHigh, critLow, beta, power, pValue, rejectH0 } = useMemo(() => {
    const zCrit =
      tailMode === "two_tailed"
        ? normalInvCdf(1 - alpha / 2)
        : normalInvCdf(1 - alpha);
    const ch = mu0 + zCrit * se;
    const cl = tailMode === "two_tailed" ? mu0 - zCrit * se : -Infinity;

    // Type II error beta = P(fail to reject H0 | H1 is true ~ N(mu1, se))
    const betaVal =
      tailMode === "two_tailed"
        ? Math.max(0, normalCdf(ch, mu1, se) - normalCdf(cl, mu1, se))
        : Math.max(0, normalCdf(ch, mu1, se));
    const powerVal = Math.max(0, Math.min(1, 1 - betaVal));

    // Exact observed p-value under H0
    const zObs = (xObs - mu0) / se;
    const pVal =
      tailMode === "two_tailed"
        ? Math.min(1, 2 * (1 - normalCdf(Math.abs(zObs), 0, 1)))
        : Math.max(0, 1 - normalCdf(zObs, 0, 1));

    return {
      critHigh: ch,
      critLow: cl,
      beta: betaVal,
      power: powerVal,
      pValue: pVal,
      rejectH0: pVal <= alpha,
    };
  }, [tailMode, alpha, se, mu1, xObs]);

  // Fixed plotting window [-6, +12] so narrowing SE visibly sharpens both bells!
  const xMin = -6;
  const xMax = 12;
  const svgW = 640;
  const svgH = 290;
  const padL = 42;
  const padR = 20;
  const padT = 26;
  const padB = 38;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const toX = (x: number) =>
    padL + ((Math.max(xMin, Math.min(xMax, x)) - xMin) / (xMax - xMin)) * plotW;

  const curves = useMemo(() => {
    const peak = normalPdf(0, 0, se) * 1.15;
    const toY = (d: number) => padT + plotH - Math.min(1, d / peak) * plotH;

    const steps = 220;
    let h0Path = "";
    let h1Path = "";
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const cmd = i === 0 ? "M" : "L";
      h0Path += `${cmd} ${toX(x).toFixed(1)} ${toY(normalPdf(x, mu0, se)).toFixed(1)} `;
      h1Path += `${cmd} ${toX(x).toFixed(1)} ${toY(normalPdf(x, mu1, se)).toFixed(1)} `;
    }

    const buildArea = (
      fromX: number,
      toXVal: number,
      mean: number
    ): string => {
      const lo = Math.max(xMin, fromX);
      const hi = Math.min(xMax, toXVal);
      if (hi <= lo) return "";
      const pts: string[] = [`${toX(lo).toFixed(1)},${(padT + plotH).toFixed(1)}`];
      const segs = 60;
      for (let i = 0; i <= segs; i++) {
        const x = lo + (i / segs) * (hi - lo);
        pts.push(
          `${toX(x).toFixed(1)},${toY(normalPdf(x, mean, se)).toFixed(1)}`
        );
      }
      pts.push(`${toX(hi).toFixed(1)},${(padT + plotH).toFixed(1)}`);
      return pts.join(" ");
    };

    const alphaRight = buildArea(critHigh, xMax, mu0);
    const alphaLeft =
      tailMode === "two_tailed" ? buildArea(xMin, critLow, mu0) : "";
    const betaArea =
      tailMode === "two_tailed"
        ? buildArea(critLow, critHigh, mu1)
        : buildArea(xMin, critHigh, mu1);
    const powerArea = buildArea(critHigh, xMax, mu1);

    const pAreaRight =
      tailMode === "two_tailed"
        ? buildArea(Math.abs(xObs), xMax, mu0)
        : buildArea(xObs, xMax, mu0);
    const pAreaLeft =
      tailMode === "two_tailed"
        ? buildArea(xMin, -Math.abs(xObs), mu0)
        : "";

    return {
      h0Path,
      h1Path,
      alphaRight,
      alphaLeft,
      betaArea,
      powerArea,
      pAreaRight,
      pAreaLeft,
      toY,
    };
  }, [se, mu1, critHigh, critLow, tailMode, xObs, plotH]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * svgW;
    if (svgX < padL || svgX > svgW - padR) return;
    const worldX = xMin + ((svgX - padL) / plotW) * (xMax - xMin);
    setXObs(Math.round(worldX * 20) / 20);
  };

  const cohensD = delta / POP_SIGMA;

  return (
    <section
      aria-label="Hypothesis Testing, p-Value and Statistical Power Dual-Curve Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-6 space-y-5"
    >
      {/* Header + Tail & Alpha Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-diff)] block">
            Interactive Laboratory S.4.3 • Balancing False Alarms (α) vs. Statistical Power (1 − β)
          </span>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Null (<KaTeXMath math="H_0" />) vs. Alternative (<KaTeXMath math="H_1" />): p-Values &amp; Power Overlap
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {([0.1, 0.05, 0.01] as AlphaLevel[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAlpha(a)}
                className={`px-2.5 py-1 border text-xs font-tabular-mono cursor-pointer ${
                  alpha === a
                    ? "border-[var(--math-ink-diff)] bg-[#B95869]/15 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
                }`}
              >
                α = {a.toFixed(2)}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setTailMode("two_tailed")}
              className={`px-2.5 py-1 border text-xs font-tabular-mono cursor-pointer ${
                tailMode === "two_tailed"
                  ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/20 text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
              }`}
            >
              Two-Tailed
            </button>
            <button
              type="button"
              onClick={() => setTailMode("right_tailed")}
              className={`px-2.5 py-1 border text-xs font-tabular-mono cursor-pointer ${
                tailMode === "right_tailed"
                  ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/20 text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
              }`}
            >
              Right-Tailed
            </button>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-z)] font-semibold">True Effect Shift (δ = μ₁ − μ₀)</span>
            <span className="tabular-nums font-semibold">+{delta.toFixed(1)} (d = {cohensD.toFixed(2)})</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={8}
            step={0.1}
            value={delta}
            onChange={(e) => setDelta(Number(e.target.value))}
            aria-label="True effect shift delta"
            className="w-full accent-[#029091] cursor-pointer"
          />
        </label>

        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-x)] font-semibold">Sample Size (n, σ = 10)</span>
            <span className="tabular-nums font-semibold">n = {n} (SE = {se.toFixed(2)})</span>
          </div>
          <input
            type="range"
            min={4}
            max={200}
            step={1}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            aria-label="Sample size n"
            className="w-full accent-[#8D9FCE] cursor-pointer"
          />
        </label>

        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-sweep)] font-semibold">Observed Sample Mean (x̄_obs)</span>
            <span className="tabular-nums font-semibold">{xObs.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={-5}
            max={10}
            step={0.05}
            value={xObs}
            onChange={(e) => setXObs(Number(e.target.value))}
            aria-label="Observed sample mean x bar"
            className="w-full accent-[#D35323] cursor-pointer"
          />
        </label>
      </div>

      {/* Main Overlap Plot */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
          <span className="text-[var(--text-secondary)]">
            Click anywhere on the plot to test an observed x̄_obs!
          </span>
          <span
            className={`px-2.5 py-0.5 border font-semibold ${
              rejectH0
                ? "border-[var(--math-ink-diff)] bg-[#B95869]/15 text-[var(--math-ink-diff)]"
                : "border-[var(--math-ink-y)] bg-[#96B898]/15 text-[var(--math-ink-y)]"
            }`}
          >
            {rejectH0
              ? `REJECT H₀ (p = ${pValue < 0.001 ? "<0.001" : pValue.toFixed(3)} ≤ α)`
              : `FAIL TO REJECT H₀ (p = ${pValue.toFixed(3)} > α)`}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          onClick={handleSvgClick}
          role="img"
          aria-label={`Overlapping H0 centered at 0 and H1 centered at ${delta.toFixed(1)}, Power ${(power * 100).toFixed(1)}%, live observed p-value ${pValue.toFixed(3)}.`}
          className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)] cursor-crosshair"
        >
          {/* Power Region under H1 */}
          {curves.powerArea && (
            <polygon points={curves.powerArea} fill="#029091" fillOpacity={0.28} />
          )}
          {/* Type II Error beta Region under H1 */}
          {curves.betaArea && (
            <polygon points={curves.betaArea} fill="#AAA36D" fillOpacity={0.22} />
          )}
          {/* Type I Error alpha Rejection Region under H0 */}
          {curves.alphaRight && (
            <polygon points={curves.alphaRight} fill="#B95869" fillOpacity={0.35} />
          )}
          {curves.alphaLeft && (
            <polygon points={curves.alphaLeft} fill="#B95869" fillOpacity={0.35} />
          )}

          {/* Live observed p-value tail highlight */}
          {curves.pAreaRight && (
            <polygon
              points={curves.pAreaRight}
              fill="#D35323"
              fillOpacity={0.32}
            />
          )}
          {curves.pAreaLeft && (
            <polygon
              points={curves.pAreaLeft}
              fill="#D35323"
              fillOpacity={0.32}
            />
          )}

          {/* Baseline axis */}
          <line
            x1={padL}
            x2={svgW - padR}
            y1={padT + plotH}
            y2={padT + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1.2}
          />

          {/* Critical threshold line */}
          <line
            x1={toX(critHigh)}
            x2={toX(critHigh)}
            y1={padT}
            y2={padT + plotH}
            stroke="#B95869"
            strokeDasharray="4 3"
            strokeWidth={1.6}
          />
          {tailMode === "two_tailed" && critLow > xMin && (
            <line
              x1={toX(critLow)}
              x2={toX(critLow)}
              y1={padT}
              y2={padT + plotH}
              stroke="#B95869"
              strokeDasharray="4 3"
              strokeWidth={1.6}
            />
          )}

          {/* Null and Alt Bell Curves */}
          <path d={curves.h0Path} fill="none" stroke="#8D9FCE" strokeWidth={2.3} />
          <path d={curves.h1Path} fill="none" stroke="#029091" strokeWidth={2.3} />

          {/* Observed x_obs Pin */}
          <line
            x1={toX(xObs)}
            x2={toX(xObs)}
            y1={padT + 8}
            y2={padT + plotH}
            stroke="#D35323"
            strokeWidth={2.2}
          />
          <circle cx={toX(xObs)} cy={padT + plotH} r={4.5} fill="#D35323" />

          {/* Labels */}
          <text
            x={toX(mu0)}
            y={18}
            textAnchor="middle"
            fontSize={10.5}
            fontFamily="JetBrains Mono, monospace"
            fontWeight={600}
            fill="var(--math-ink-x)"
          >
            H₀ (μ = 0)
          </text>
          <text
            x={toX(mu1)}
            y={18}
            textAnchor="middle"
            fontSize={10.5}
            fontFamily="JetBrains Mono, monospace"
            fontWeight={600}
            fill="var(--math-ink-z)"
          >
            H₁ (μ = +{delta.toFixed(1)})
          </text>

          {[-4, -2, 0, 2, 4, 6, 8, 10].map((tick) => (
            <text
              key={tick}
              x={toX(tick)}
              y={svgH - 12}
              textAnchor="middle"
              fontSize={9.5}
              fontFamily="JetBrains Mono, monospace"
              fill="var(--text-muted)"
            >
              {tick}
            </text>
          ))}
        </svg>

        {/* Live Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-tabular-mono tabular-nums">
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
            <span className="text-[10px] text-[var(--text-muted)] block">Observed p-Value</span>
            <span className="text-base font-semibold text-[var(--math-ink-sweep)]">
              {pValue < 0.0001 ? "< 0.0001" : fmt(pValue, 4)}
            </span>
          </div>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
            <span className="text-[10px] text-[var(--text-muted)] block">Type I Alpha (α)</span>
            <span className="text-base font-semibold text-[var(--math-ink-diff)]">
              {(alpha * 100).toFixed(1)}%
            </span>
          </div>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
            <span className="text-[10px] text-[var(--text-muted)] block">Type II Miss Rate (β)</span>
            <span className="text-base font-semibold text-[var(--math-ink-grid)]">
              {(beta * 100).toFixed(1)}%
            </span>
          </div>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
            <span className="text-[10px] text-[var(--text-muted)] block">Statistical Power (1 − β)</span>
            <span className="text-base font-semibold text-[var(--math-ink-z)]">
              {(power * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
