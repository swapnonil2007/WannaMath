"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  createSeededRng,
  normalPdf,
  sampleMean,
  sampleNormal,
  sampleStdDev,
} from "./statMath";

type ModelFamily = "normal" | "bernoulli";
type DartRegime = "optimal" | "unbiased_noisy" | "biased_tight";

const INITIAL_NORMAL_POINTS = [3.6, 4.3, 4.7, 5.1, 5.3, 5.8, 6.2, 6.7];

const DART_PRESETS: Record<
  DartRegime,
  { label: string; bias: number; spread: number; note: string }
> = {
  optimal: {
    label: "Low Bias + Low Var (Ideal)",
    bias: 0.15,
    spread: 0.55,
    note: "Clusters tightly right over the bullseye—minimal total MSE.",
  },
  unbiased_noisy: {
    label: "Zero Bias + High Var",
    bias: 0.0,
    spread: 1.85,
    note: "Hits zero on average (unbiased!), yet any single estimate lands wildly off target because Variance dominates MSE!",
  },
  biased_tight: {
    label: "Small Bias + Low Var (Shrinkage)",
    bias: 0.65,
    spread: 0.58,
    note: "Trades a tiny deliberate Bias (0.65) for a massive Variance drop—achieving MUCH lower total MSE than the noisy unbiased estimator!",
  },
};

function fmt(n: number, digits = 2): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.4.1 — Maximum Likelihood Climber (Normal & Bernoulli) + Bias–Variance Dartboard.
 */
export function MaximumLikelihoodBiasVarianceLab() {
  const [family, setFamily] = useState<ModelFamily>("normal");
  const [normalPts, setNormalPts] = useState<number[]>(INITIAL_NORMAL_POINTS);
  const [candMu, setCandMu] = useState<number>(4.0);
  const [candSigma, setCandSigma] = useState<number>(1.3);

  const [coinFlipsN, setCoinFlipsN] = useState<number>(12);
  const [coinHeadsK, setCoinHeadsK] = useState<number>(8);
  const [candP, setCandP] = useState<number>(0.42);

  const [dartBias, setDartBias] = useState<number>(0.65);
  const [dartSpread, setDartSpread] = useState<number>(0.58);
  const [dartSeed, setDartSeed] = useState<number>(1);

  // Exact MLE solutions
  const mleNormalMu = useMemo(() => sampleMean(normalPts), [normalPts]);
  // Note: Gaussian variance MLE divides by n (ddof=0)
  const mleNormalSigma = useMemo(
    () => Math.max(0.25, sampleStdDev(normalPts, 0)),
    [normalPts]
  );
  const mleCoinP = coinHeadsK / Math.max(1, coinFlipsN);

  const currentLogLik = useMemo(() => {
    if (family === "normal") {
      let ll = 0;
      for (const x of normalPts) {
        ll += Math.log(Math.max(1e-12, normalPdf(x, candMu, candSigma)));
      }
      return ll;
    }
    const p = Math.max(1e-5, Math.min(1 - 1e-5, candP));
    return (
      coinHeadsK * Math.log(p) + (coinFlipsN - coinHeadsK) * Math.log(1 - p)
    );
  }, [family, normalPts, candMu, candSigma, candP, coinHeadsK, coinFlipsN]);

  const maxLogLik = useMemo(() => {
    if (family === "normal") {
      let ll = 0;
      for (const x of normalPts) {
        ll += Math.log(Math.max(1e-12, normalPdf(x, mleNormalMu, candSigma)));
      }
      return ll;
    }
    const p = Math.max(1e-5, Math.min(1 - 1e-5, mleCoinP));
    return (
      coinHeadsK * Math.log(p) + (coinFlipsN - coinHeadsK) * Math.log(1 - p)
    );
  }, [family, normalPts, mleNormalMu, candSigma, mleCoinP, coinHeadsK, coinFlipsN]);

  // SVG Layout for Likelihood Climber
  const w = 520;
  const hTop = 148;
  const hLik = 138;
  const padL = 44;
  const padR = 20;
  const padT = 18;
  const padB = 26;
  const plotW = w - padL - padR;

  const xMin = family === "normal" ? 0 : 0.02;
  const xMax = family === "normal" ? 10 : 0.98;
  const toX = (x: number) =>
    padL + ((Math.max(xMin, Math.min(xMax, x)) - xMin) / (xMax - xMin)) * plotW;

  const topPlot = useMemo(() => {
    const plotH = hTop - padT - padB;
    const peakPdf =
      family === "normal"
        ? Math.max(0.45, normalPdf(candMu, candMu, candSigma) * 1.18)
        : 1.0;
    const toTopY = (v: number) =>
      padT + plotH - Math.min(1, v / peakPdf) * plotH;

    let curvePath = "";
    if (family === "normal") {
      const steps = 140;
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (i / steps) * (xMax - xMin);
        curvePath += `${i === 0 ? "M" : "L"} ${toX(x).toFixed(1)} ${toTopY(
          normalPdf(x, candMu, candSigma)
        ).toFixed(1)} `;
      }
    }
    return { toTopY, curvePath };
  }, [family, candMu, candSigma, xMin, xMax]);

  const likCurve = useMemo(() => {
    const steps = 110;
    const vals: Array<{ param: number; ll: number }> = [];
    for (let i = 0; i <= steps; i++) {
      const param = xMin + (i / steps) * (xMax - xMin);
      let ll = 0;
      if (family === "normal") {
        for (const x of normalPts) {
          ll += Math.log(Math.max(1e-12, normalPdf(x, param, candSigma)));
        }
      } else {
        const p = Math.max(1e-4, Math.min(1 - 1e-4, param));
        ll =
          coinHeadsK * Math.log(p) +
          (coinFlipsN - coinHeadsK) * Math.log(1 - p);
      }
      vals.push({ param, ll });
    }
    const peak = Math.max(...vals.map((v) => v.ll));
    const floor = Math.max(peak - 24, Math.min(...vals.map((v) => v.ll)));
    const span = Math.max(2, peak - floor);
    const plotH = hLik - padT - padB;
    const toLikY = (ll: number) =>
      padT + plotH - Math.max(0, Math.min(1, (ll - floor) / span)) * plotH;

    const pathD = vals
      .map(
        (v, idx) =>
          `${idx === 0 ? "M" : "L"} ${toX(v.param).toFixed(1)} ${toLikY(v.ll).toFixed(1)}`
      )
      .join(" ");
    return { pathD, toLikY, peak };
  }, [family, normalPts, candSigma, coinHeadsK, coinFlipsN, xMin, xMax]);

  const handleSvgAddPoint = (e: React.MouseEvent<SVGSVGElement>) => {
    if (family !== "normal") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * w;
    if (svgX < padL || svgX > w - padR) return;
    const worldX = xMin + ((svgX - padL) / plotW) * (xMax - xMin);
    const rounded = Math.round(worldX * 10) / 10;
    setNormalPts((prev) => [...prev.slice(-17), rounded]);
  };

  // Bias-Variance Dartboard simulation
  const darts = useMemo(() => {
    const rng = createSeededRng(20260401 + dartSeed * 1013);
    return Array.from({ length: 28 }, () => ({
      dx: dartBias + sampleNormal(rng, 0, dartSpread),
      dy: dartBias * 0.45 + sampleNormal(rng, 0, dartSpread),
    }));
  }, [dartBias, dartSpread, dartSeed]);

  const biasSq = dartBias * dartBias;
  const variance = dartSpread * dartSpread;
  const mseTotal = biasSq + variance;

  return (
    <section
      aria-label="Maximum Likelihood Estimator and Bias-Variance Tradeoff Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-6 space-y-5"
    >
      {/* Header + Family Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
            Interactive Laboratory S.4.1 • Hold Data Fixed, Slide Model Parameters
          </span>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Maximum Likelihood (<KaTeXMath math="\ell(\theta)" />) &amp; Bias–Variance Dartboard
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFamily("normal")}
            className={`px-3 py-1.5 border text-xs font-tabular-mono cursor-pointer ${
              family === "normal"
                ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/20 text-[var(--text-primary)] font-semibold"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
            }`}
          >
            Gaussian Fit: N(μ, σ²)
          </button>
          <button
            type="button"
            onClick={() => setFamily("bernoulli")}
            className={`px-3 py-1.5 border text-xs font-tabular-mono cursor-pointer ${
              family === "bernoulli"
                ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/20 text-[var(--text-primary)] font-semibold"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
            }`}
          >
            Coin Flips: Bernoulli(p)
          </button>
        </div>
      </div>

      {/* Main Split: Left (MLE Climber) + Right (Bias-Variance Dartboard) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left 7 Cols: Likelihood Climber */}
        <div className="xl:col-span-7 space-y-3">
          {family === "normal" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-sweep)] font-semibold">Candidate μ</span>
                  <span className="tabular-nums">{fmt(candMu, 2)}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={9.5}
                  step={0.05}
                  value={candMu}
                  onChange={(e) => setCandMu(Number(e.target.value))}
                  aria-label="Candidate mean mu"
                  className="w-full accent-[#D35323] cursor-pointer"
                />
              </label>

              <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-x)] font-semibold">Candidate σ</span>
                  <span className="tabular-nums">{fmt(candSigma, 2)}</span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={3.0}
                  step={0.05}
                  value={candSigma}
                  onChange={(e) => setCandSigma(Number(e.target.value))}
                  aria-label="Candidate standard deviation sigma"
                  className="w-full accent-[#8D9FCE] cursor-pointer"
                />
              </label>

              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex flex-col justify-between gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCandMu(mleNormalMu);
                    setCandSigma(mleNormalSigma);
                  }}
                  className="px-2 py-1 border border-[var(--math-ink-y)] bg-[#96B898]/15 text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] cursor-pointer"
                >
                  Snap Exact MLE (μ̂={fmt(mleNormalMu, 2)})
                </button>
                <button
                  type="button"
                  onClick={() => setNormalPts(INITIAL_NORMAL_POINTS)}
                  className="px-2 py-0.5 border border-[var(--border-subtle)] text-[11px] font-tabular-mono text-[var(--text-muted)] cursor-pointer"
                >
                  Reset Data ({normalPts.length} pts)
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-x)] font-semibold">Observed Heads (k/n)</span>
                  <span className="tabular-nums">
                    {coinHeadsK}/{coinFlipsN}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={coinFlipsN - 1}
                  step={1}
                  value={coinHeadsK}
                  onChange={(e) => setCoinHeadsK(Number(e.target.value))}
                  aria-label="Observed heads k"
                  className="w-full accent-[#8D9FCE] cursor-pointer"
                />
              </label>

              <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-sweep)] font-semibold">Candidate p</span>
                  <span className="tabular-nums">{fmt(candP, 2)}</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.95}
                  step={0.01}
                  value={candP}
                  onChange={(e) => setCandP(Number(e.target.value))}
                  aria-label="Candidate coin probability p"
                  className="w-full accent-[#D35323] cursor-pointer"
                />
              </label>

              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex flex-col justify-between gap-1.5">
                <button
                  type="button"
                  onClick={() => setCandP(mleCoinP)}
                  className="px-2 py-1 border border-[var(--math-ink-y)] bg-[#96B898]/15 text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] cursor-pointer"
                >
                  Snap MLE p̂ = {fmt(mleCoinP, 2)}
                </button>
                <div className="flex items-center justify-between text-[11px] font-tabular-mono">
                  <span>Flips n:</span>
                  <div className="flex gap-1">
                    {[12, 24].map((nVal) => (
                      <button
                        key={nVal}
                        type="button"
                        onClick={() => {
                          setCoinFlipsN(nVal);
                          setCoinHeadsK(Math.round(nVal * 0.66));
                        }}
                        className="px-1.5 border border-[var(--border-subtle)] cursor-pointer"
                      >
                        n={nVal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stacked Likelihood Needles + Log-Likelihood Curve */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-tabular-mono">
              <span className="text-[var(--text-secondary)]">
                {family === "normal"
                  ? "1. Point Density Needles f(xᵢ | μ, σ) (Click axis to add points)"
                  : `1. Coin Flips Likelihood Bar (${coinHeadsK} Heads, ${coinFlipsN - coinHeadsK} Tails)`}
              </span>
              <span className="tabular-nums font-semibold text-[var(--math-ink-sweep)]">
                ℓ(θ) = {currentLogLik.toFixed(2)} (Peak: {maxLogLik.toFixed(2)})
              </span>
            </div>

            <svg
              viewBox={`0 0 ${w} ${hTop}`}
              onClick={handleSvgAddPoint}
              role="img"
              aria-label={`Candidate probability fit with current log-likelihood ${currentLogLik.toFixed(2)}.`}
              className={`w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)] ${
                family === "normal" ? "cursor-crosshair" : ""
              }`}
            >
              <line
                x1={padL}
                x2={w - padR}
                y1={hTop - padB}
                y2={hTop - padB}
                stroke="var(--border-strong)"
                strokeWidth={1.1}
              />
              {family === "normal" ? (
                <>
                  <path
                    d={topPlot.curvePath}
                    fill="#8D9FCE"
                    fillOpacity={0.14}
                    stroke="#8D9FCE"
                    strokeWidth={2.2}
                  />
                  {normalPts.map((pt, idx) => {
                    const px = toX(pt);
                    const py = topPlot.toTopY(normalPdf(pt, candMu, candSigma));
                    return (
                      <g key={idx}>
                        <line
                          x1={px}
                          x2={px}
                          y1={hTop - padB}
                          y2={py}
                          stroke="#D35323"
                          strokeWidth={1.6}
                          strokeOpacity={0.85}
                        />
                        <circle cx={px} cy={hTop - padB} r={3.5} fill="#029091" />
                        <circle cx={px} cy={py} r={2.5} fill="#D35323" />
                      </g>
                    );
                  })}
                  <line
                    x1={toX(candMu)}
                    x2={toX(candMu)}
                    y1={padT}
                    y2={hTop - padB}
                    stroke="#D35323"
                    strokeDasharray="4 3"
                    strokeWidth={1.3}
                  />
                </>
              ) : (
                <>
                  {/* Heads bar vs Tails bar at candidate p */}
                  <rect
                    x={padL + 40}
                    y={topPlot.toTopY(candP)}
                    width={120}
                    height={Math.max(1, hTop - padB - topPlot.toTopY(candP))}
                    fill="#029091"
                    fillOpacity={0.45}
                    stroke="#029091"
                    strokeWidth={1.4}
                  />
                  <rect
                    x={padL + 220}
                    y={topPlot.toTopY(1 - candP)}
                    width={120}
                    height={Math.max(1, hTop - padB - topPlot.toTopY(1 - candP))}
                    fill="#8D9FCE"
                    fillOpacity={0.45}
                    stroke="#8D9FCE"
                    strokeWidth={1.4}
                  />
                  <text x={padL + 100} y={hTop - 8} textAnchor="middle" fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--text-secondary)">
                    Heads Prob p = {fmt(candP, 2)} (k={coinHeadsK})
                  </text>
                  <text x={padL + 280} y={hTop - 8} textAnchor="middle" fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--text-secondary)">
                    Tails Prob 1−p = {fmt(1 - candP, 2)} (n−k={coinFlipsN - coinHeadsK})
                  </text>
                </>
              )}
            </svg>

            {/* Log-Likelihood Mountain */}
            <div className="flex items-center justify-between text-[11px] font-tabular-mono">
              <span className="text-[var(--math-ink-y)] font-semibold">
                2. Log-Likelihood Curve ℓ(θ) = Σ ln f(xᵢ | θ)
              </span>
              <span className="text-[var(--text-muted)]">
                Green line = exact MLE peak ({family === "normal" ? fmt(mleNormalMu, 2) : fmt(mleCoinP, 2)})
              </span>
            </div>

            <svg
              viewBox={`0 0 ${w} ${hLik}`}
              role="img"
              aria-label={`Log-likelihood mountain peaking at MLE ${family === "normal" ? fmt(mleNormalMu, 2) : fmt(mleCoinP, 2)}.`}
              className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
            >
              <path d={likCurve.pathD} fill="none" stroke="#96B898" strokeWidth={2.2} />
              <line
                x1={toX(family === "normal" ? mleNormalMu : mleCoinP)}
                x2={toX(family === "normal" ? mleNormalMu : mleCoinP)}
                y1={padT}
                y2={hLik - padB}
                stroke="#96B898"
                strokeDasharray="4 3"
                strokeWidth={1.4}
              />
              {/* Active Candidate Dot */}
              <circle
                cx={toX(family === "normal" ? candMu : candP)}
                cy={likCurve.toLikY(currentLogLik)}
                r={5.2}
                fill="#D35323"
                stroke="var(--bg-canvas)"
                strokeWidth={1.4}
              />
              <line
                x1={padL}
                x2={w - padR}
                y1={hLik - padB}
                y2={hLik - padB}
                stroke="var(--border-strong)"
                strokeWidth={1}
              />
            </svg>
          </div>
        </div>

        {/* Right 5 Cols: Bias² + Variance = MSE Dartboard */}
        <div className="xl:col-span-5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] font-semibold">
                Bias–Variance Dartboard (MSE = Bias² + Var)
              </span>
              <button
                type="button"
                onClick={() => setDartSeed((s) => s + 1)}
                className="px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[11px] font-tabular-mono cursor-pointer"
              >
                Re-Throw
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(DART_PRESETS) as DartRegime[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setDartBias(DART_PRESETS[id].bias);
                    setDartSpread(DART_PRESETS[id].spread);
                  }}
                  className="px-2 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--math-ink-sweep)] text-[11px] font-tabular-mono cursor-pointer"
                >
                  {DART_PRESETS[id].label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] block">
                <div className="flex justify-between text-[11px] font-tabular-mono">
                  <span className="text-[var(--math-ink-diff)]">Bias</span>
                  <span className="tabular-nums">{fmt(dartBias, 2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1.8}
                  step={0.05}
                  value={dartBias}
                  onChange={(e) => setDartBias(Number(e.target.value))}
                  aria-label="Estimator bias"
                  className="w-full accent-[#B95869] cursor-pointer"
                />
              </label>
              <label className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] block">
                <div className="flex justify-between text-[11px] font-tabular-mono">
                  <span className="text-[var(--math-ink-x)]">SD (√Var)</span>
                  <span className="tabular-nums">{fmt(dartSpread, 2)}</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={2.0}
                  step={0.05}
                  value={dartSpread}
                  onChange={(e) => setDartSpread(Number(e.target.value))}
                  aria-label="Estimator standard deviation"
                  className="w-full accent-[#8D9FCE] cursor-pointer"
                />
              </label>
            </div>
          </div>

          <svg
            viewBox="0 0 260 220"
            role="img"
            aria-label={`Estimator bullseye target showing bias ${fmt(dartBias, 2)} and variance ${fmt(variance, 2)}, total MSE ${fmt(mseTotal, 2)}.`}
            className="w-full max-w-[270px] mx-auto h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
          >
            {[84, 58, 32, 12].map((r, i) => (
              <circle
                key={i}
                cx={130}
                cy={110}
                r={r}
                fill={i === 3 ? "#D35323" : "none"}
                fillOpacity={i === 3 ? 0.25 : 0}
                stroke={i === 3 ? "#D35323" : "var(--border-subtle)"}
                strokeWidth={i === 3 ? 1.4 : 1}
              />
            ))}
            {/* True center cross */}
            <line x1={124} x2={136} y1={110} y2={110} stroke="var(--math-ink-grid)" strokeWidth={1.2} />
            <line x1={130} x2={130} y1={104} y2={116} stroke="var(--math-ink-grid)" strokeWidth={1.2} />

            {/* Darts */}
            {darts.map((d, idx) => (
              <circle
                key={idx}
                cx={130 + d.dx * 34}
                cy={110 - d.dy * 34}
                r={3.2}
                fill="#029091"
                fillOpacity={0.85}
              />
            ))}
            {/* Expected Center Arrow */}
            <circle
              cx={130 + dartBias * 34}
              cy={110 - dartBias * 0.45 * 34}
              r={4.5}
              fill="none"
              stroke="#B95869"
              strokeWidth={1.8}
            />
          </svg>

          {/* MSE Stacked Decomposition Bar */}
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex justify-between text-xs font-tabular-mono tabular-nums">
              <span>MSE = Bias² + Var</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {fmt(biasSq, 2)} + {fmt(variance, 2)} = {fmt(mseTotal, 2)}
              </span>
            </div>
            <div className="w-full h-3 flex border border-[var(--border-subtle)] overflow-hidden">
              <div
                style={{
                  width: `${mseTotal > 0 ? (biasSq / mseTotal) * 100 : 0}%`,
                  backgroundColor: "#B95869",
                }}
              />
              <div
                style={{
                  width: `${mseTotal > 0 ? (variance / mseTotal) * 100 : 0}%`,
                  backgroundColor: "#8D9FCE",
                }}
              />
            </div>
            <p className="text-[11px] font-math-serif text-[var(--text-secondary)]">
              Crimson = <KaTeXMath math="\text{Bias}^2" />; Periwinkle = <KaTeXMath math="\text{Var}" />. A tiny
              bias can yield a smaller total MSE!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
