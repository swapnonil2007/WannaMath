"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  betaInvCdf,
  betaPdf,
  buildHistogramBins,
  createSeededRng,
  quantileSorted,
  sampleMean,
  sampleMedian,
  sampleStdDev,
} from "./statMath";

type LabMode = "bayesian" | "bootstrap";
type BootStat = "mean" | "median";

const BOOT_PRESETS: Record<
  "latency" | "spend" | "biomarker",
  { label: string; unit: string; data: number[] }
> = {
  latency: {
    label: "API Latency ms (Right-Skewed, n=14)",
    unit: "ms",
    data: [18, 21, 22, 24, 25, 27, 29, 31, 35, 42, 49, 64, 88, 124],
  },
  spend: {
    label: "Order Value $ (Outlier Tail, n=12)",
    unit: "$",
    data: [14, 17, 19, 21, 22, 24, 28, 30, 36, 44, 78, 145],
  },
  biomarker: {
    label: "Lab Assay Score (Mildly Symmetric, n=16)",
    unit: "U/L",
    data: [41, 44, 46, 47, 48, 49, 50, 50, 51, 51, 52, 53, 54, 55, 57, 60],
  },
};

function fmt(n: number, digits = 2): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.6.3 — Beta–Binomial Bayesian Sequential Updater &
 * Efron's 1,000-Replicate Nonparametric Bootstrap Lab.
 */
export function BayesianUpdatingAndBootstrapLab() {
  const [mode, setMode] = useState<LabMode>("bayesian");

  // Mode A: Bayesian Beta-Binomial state
  const [alpha0, setAlpha0] = useState<number>(4);
  const [beta0, setBeta0] = useState<number>(4);
  const [trueProb, setTrueProb] = useState<number>(0.7);
  const [heads, setHeads] = useState<number>(0);
  const [totalFlips, setTotalFlips] = useState<number>(0);
  const [bayesSeed, setBayesSeed] = useState<number>(1);

  // Mode B: Nonparametric Bootstrap state
  const [bootPreset, setBootPreset] = useState<keyof typeof BOOT_PRESETS>("latency");
  const [bootStat, setBootStat] = useState<BootStat>("median");
  const [replicates, setReplicates] = useState<number[]>([]);
  const [lastPickedIndices, setLastPickedIndices] = useState<number[]>([]);
  const [bootSeed, setBootSeed] = useState<number>(1);

  const observeTrials = (count: number) => {
    const rng = createSeededRng(20260603 + bayesSeed * 197 + totalFlips * 31);
    let hits = 0;
    for (let i = 0; i < count; i++) {
      if (rng() < trueProb) hits++;
    }
    setHeads((k) => k + hits);
    setTotalFlips((n) => n + count);
    setBayesSeed((s) => s + 1);
  };

  // Bayesian Posterior & Curve Paths
  const bayes = useMemo(() => {
    const postAlpha = alpha0 + heads;
    const postBeta = beta0 + (totalFlips - heads);
    const postMean = postAlpha / (postAlpha + postBeta);
    const credLow = betaInvCdf(0.025, postAlpha, postBeta);
    const credHigh = betaInvCdf(0.975, postAlpha, postBeta);

    // Frequentist Wilson 95% CI when totalFlips > 0
    const z = 1.96;
    const freqCi =
      totalFlips > 0
        ? (() => {
            const ph = heads / totalFlips;
            const denom = 1 + (z * z) / totalFlips;
            const center = (ph + (z * z) / (2 * totalFlips)) / denom;
            const half =
              (z / denom) *
              Math.sqrt(
                (ph * (1 - ph)) / totalFlips + (z * z) / (4 * totalFlips * totalFlips)
              );
            return { low: Math.max(0, center - half), high: Math.min(1, center + half), ph };
          })()
        : null;

    const steps = 140;
    const priorVals: number[] = [];
    const postVals: number[] = [];
    const likeVals: number[] = [];

    for (let i = 0; i <= steps; i++) {
      const p = 0.005 + (0.99 * i) / steps;
      priorVals.push(betaPdf(p, alpha0, beta0));
      postVals.push(betaPdf(p, postAlpha, postBeta));
      likeVals.push(
        totalFlips > 0
          ? betaPdf(p, 1 + heads, 1 + (totalFlips - heads))
          : 1
      );
    }

    const maxY = Math.max(
      1.2,
      ...priorVals,
      ...postVals,
      ...(totalFlips > 0 ? likeVals : [1])
    );

    return {
      postAlpha,
      postBeta,
      postMean,
      credLow,
      credHigh,
      freqCi,
      priorVals,
      postVals,
      likeVals,
      maxY,
      steps,
    };
  }, [alpha0, beta0, heads, totalFlips]);

  // SVG dimensions for Bayesian plot
  const bW = 540;
  const bH = 275;
  const toBx = (p: number) => 42 + p * (bW - 64);
  const toBy = (dens: number) =>
    bH - 34 - (dens / (bayes.maxY * 1.1)) * (bH - 58);

  const buildCurve = (vals: readonly number[], closeToZero = false) => {
    const pts = vals.map((d, i) => {
      const p = 0.005 + (0.99 * i) / bayes.steps;
      return `${i === 0 ? "M" : "L"}${toBx(p).toFixed(1)},${toBy(d).toFixed(1)}`;
    });
    if (!closeToZero) return pts.join(" ");
    return `${pts.join(" ")} L${toBx(0.995).toFixed(1)},${toBy(0).toFixed(
      1
    )} L${toBx(0.005).toFixed(1)},${toBy(0).toFixed(1)} Z`;
  };

  // Bootstrap Logic
  const activeDataset = BOOT_PRESETS[bootPreset];
  const observedStat = useMemo(
    () =>
      bootStat === "mean"
        ? sampleMean(activeDataset.data)
        : sampleMedian(activeDataset.data),
    [activeDataset, bootStat]
  );

  const runBootstrap = (batch: number) => {
    const rng = createSeededRng(20260613 + bootSeed * 353 + replicates.length * 17);
    const data = activeDataset.data;
    const n = data.length;
    const nextBatch: number[] = [];
    let latestPicks: number[] = [];

    for (let r = 0; r < batch; r++) {
      const sample: number[] = [];
      const picks: number[] = [];
      for (let i = 0; i < n; i++) {
        const idx = Math.floor(rng() * n);
        picks.push(idx);
        sample.push(data[idx]);
      }
      if (r === batch - 1) latestPicks = picks;
      nextBatch.push(
        bootStat === "mean" ? sampleMean(sample) : sampleMedian(sample)
      );
    }

    setLastPickedIndices(latestPicks);
    setBootSeed((s) => s + 1);
    setReplicates((prev) => [...prev, ...nextBatch].slice(-2000));
  };

  const bootSummary = useMemo(() => {
    if (replicates.length === 0) return null;
    const sorted = [...replicates].sort((a, b) => a - b);
    const low = quantileSorted(sorted, 0.025);
    const high = quantileSorted(sorted, 0.975);
    const se = sampleStdDev(replicates, 1);
    const minVal = Math.min(...sorted);
    const maxVal = Math.max(...sorted);
    const pad = Math.max(1.5, (maxVal - minVal) * 0.12);
    const { bins } = buildHistogramBins(
      replicates,
      20,
      minVal - pad,
      maxVal + pad
    );
    const maxCount = Math.max(1, ...bins.map((b) => b.count));
    return {
      low,
      high,
      se,
      minX: minVal - pad,
      maxX: maxVal + pad,
      bins,
      maxCount,
    };
  }, [replicates]);

  const pickCounts = useMemo(() => {
    const counts = new Array<number>(activeDataset.data.length).fill(0);
    for (const idx of lastPickedIndices) {
      if (idx >= 0 && idx < counts.length) counts[idx]++;
    }
    return counts;
  }, [activeDataset.data.length, lastPickedIndices]);

  return (
    <div className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4 sm:p-5 space-y-5">
      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div className="space-y-0.5">
          <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] font-semibold block">
            Modern Inference Workbench: Bayesian Conjugate Updating &amp; Nonparametric Bootstrap
          </span>
          <p className="text-xs font-math-serif text-[var(--text-secondary)]">
            {mode === "bayesian"
              ? "Watch your Prior belief evolve smoothly into a Posterior distribution as data arrives sequentially."
              : "Resample raw observations WITH replacement 1,000 times—compute Confidence Intervals without any Gaussian formula!"}
          </p>
        </div>

        <div className="inline-flex border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
          <button
            type="button"
            onClick={() => setMode("bayesian")}
            className={`px-3 py-1.5 text-xs font-tabular-mono ${
              mode === "bayesian"
                ? "bg-[var(--accent-primary)] text-[var(--bg-canvas)] font-semibold"
                : "text-[var(--text-secondary)]"
            }`}
          >
            A. Beta–Binomial Bayes
          </button>
          <button
            type="button"
            onClick={() => setMode("bootstrap")}
            className={`px-3 py-1.5 text-xs font-tabular-mono ${
              mode === "bootstrap"
                ? "bg-[var(--accent-primary)] text-[var(--bg-canvas)] font-semibold"
                : "text-[var(--text-secondary)]"
            }`}
          >
            B. Nonparametric Bootstrap
          </button>
        </div>
      </div>

      {mode === "bayesian" ? (
        <>
          {/* Bayesian Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
              <div className="flex justify-between text-xs font-tabular-mono tabular-nums">
                <span className="text-[var(--math-ink-x)] font-semibold">
                  Prior Alpha α₀ (Pseudo-Hits)
                </span>
                <strong>{alpha0}</strong>
              </div>
              <input
                type="range"
                min={1}
                max={16}
                step={1}
                value={alpha0}
                onChange={(e) => setAlpha0(Number(e.target.value))}
                aria-label="Prior alpha parameter"
                className="w-full accent-[#8D9FCE] cursor-pointer"
              />
            </label>

            <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
              <div className="flex justify-between text-xs font-tabular-mono tabular-nums">
                <span className="text-[var(--math-ink-lower)] font-semibold">
                  Prior Beta β₀ (Pseudo-Misses)
                </span>
                <strong>{beta0}</strong>
              </div>
              <input
                type="range"
                min={1}
                max={16}
                step={1}
                value={beta0}
                onChange={(e) => setBeta0(Number(e.target.value))}
                aria-label="Prior beta parameter"
                className="w-full accent-[#D5658B] cursor-pointer"
              />
            </label>

            <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
              <div className="flex justify-between text-xs font-tabular-mono tabular-nums">
                <span className="text-[var(--math-ink-sweep)] font-semibold">
                  True Data Probability p
                </span>
                <strong>{trueProb.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={trueProb}
                onChange={(e) => setTrueProb(Number(e.target.value))}
                aria-label="True success probability"
                className="w-full accent-[#D35323] cursor-pointer"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => observeTrials(1)}
                className="px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[#029091]"
              >
                +1 Trial
              </button>
              <button
                type="button"
                onClick={() => observeTrials(10)}
                className="px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[#029091]"
              >
                +10 Trials
              </button>
              <button
                type="button"
                onClick={() => observeTrials(50)}
                className="px-3 py-1.5 border border-[#029091] bg-[#029091]/15 text-[var(--math-ink-z)] font-semibold"
              >
                +50 Trials
              </button>
              <button
                type="button"
                onClick={() => {
                  setHeads(0);
                  setTotalFlips(0);
                }}
                className="px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)]"
              >
                Reset Observations
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setAlpha0(1);
                  setBeta0(1);
                }}
                className="px-2 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)]"
              >
                Flat Prior Beta(1,1)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAlpha0(8);
                  setBeta0(8);
                }}
                className="px-2 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)]"
              >
                Skeptical 50% Beta(8,8)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5">
              <svg
                viewBox={`0 0 ${bW} ${bH}`}
                className="w-full h-auto block"
                role="img"
                aria-label={`Beta-Binomial Bayesian plot showing Prior Beta(${alpha0},${beta0}) and Posterior Beta(${bayes.postAlpha},${bayes.postBeta})`}
              >
                {/* Credible Interval Band */}
                <rect
                  x={toBx(bayes.credLow)}
                  y={16}
                  width={Math.max(2, toBx(bayes.credHigh) - toBx(bayes.credLow))}
                  height={toBy(0) - 16}
                  fill="#029091"
                  fillOpacity={0.14}
                />

                {/* Baseline */}
                <line
                  x1={42}
                  x2={bW - 22}
                  y1={toBy(0)}
                  y2={toBy(0)}
                  stroke="var(--border-subtle)"
                  strokeWidth={1.2}
                />

                {/* Prior curve */}
                <path
                  d={buildCurve(bayes.priorVals)}
                  fill="none"
                  stroke="#8D9FCE"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                />

                {/* Normalized Likelihood */}
                {totalFlips > 0 && (
                  <path
                    d={buildCurve(bayes.likeVals)}
                    fill="none"
                    stroke="#AAA36D"
                    strokeWidth={1.8}
                    strokeDasharray="2 3"
                  />
                )}

                {/* Posterior filled curve */}
                <path
                  d={buildCurve(bayes.postVals, true)}
                  fill="#029091"
                  fillOpacity={0.22}
                />
                <path
                  d={buildCurve(bayes.postVals)}
                  fill="none"
                  stroke="#029091"
                  strokeWidth={2.5}
                />

                {/* True Probability Vertical Line */}
                <line
                  x1={toBx(trueProb)}
                  x2={toBx(trueProb)}
                  y1={16}
                  y2={toBy(0)}
                  stroke="#D35323"
                  strokeWidth={1.7}
                  strokeDasharray="4 3"
                />
                <text
                  x={toBx(trueProb)}
                  y={12}
                  textAnchor="middle"
                  fontSize={9.5}
                  fontFamily="JetBrains Mono, monospace"
                  fill="#D35323"
                >
                  True p={trueProb.toFixed(2)}
                </text>

                {[0, 0.25, 0.5, 0.75, 1.0].map((tick) => (
                  <g key={tick}>
                    <line
                      x1={toBx(tick)}
                      x2={toBx(tick)}
                      y1={toBy(0)}
                      y2={toBy(0) + 4}
                      stroke="var(--text-muted)"
                    />
                    <text
                      x={toBx(tick)}
                      y={toBy(0) + 16}
                      textAnchor="middle"
                      fontSize={9.5}
                      fontFamily="JetBrains Mono, monospace"
                      fill="var(--text-muted)"
                    >
                      {tick.toFixed(2)}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="xl:col-span-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3 flex flex-col justify-between text-xs font-tabular-mono tabular-nums">
              <div className="space-y-2">
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--math-ink-x)] block">
                    Prior Belief (Dashed)
                  </span>
                  <strong>
                    Beta({alpha0}, {beta0}) → Mean = {fmt(alpha0 / (alpha0 + beta0), 3)}
                  </strong>
                </div>

                <div className="p-2.5 border border-[var(--math-ink-z)] bg-[#029091]/10 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--math-ink-z)] block">
                    Posterior After {heads} / {totalFlips} Trials (Solid)
                  </span>
                  <strong className="block">
                    Beta({bayes.postAlpha}, {bayes.postBeta}) → Mean ={" "}
                    {fmt(bayes.postMean, 3)}
                  </strong>
                  <span>
                    95% Credible Interval: [{bayes.credLow.toFixed(3)},{" "}
                    {bayes.credHigh.toFixed(3)}]
                  </span>
                </div>

                {bayes.freqCi && (
                  <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--math-ink-grid)] block">
                      Frequentist Wilson 95% CI (Ignores Prior)
                    </span>
                    <span>
                      p̂ = {bayes.freqCi.ph.toFixed(3)} → [{bayes.freqCi.low.toFixed(3)},{" "}
                      {bayes.freqCi.high.toFixed(3)}]
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
                Notice the magic conjugate rule: every success simply adds{" "}
                <code className="font-tabular-mono">+1</code> to <KaTeXMath math="\alpha" /> and
                every failure adds <code className="font-tabular-mono">+1</code> to{" "}
                <KaTeXMath math="\beta" />! Today&apos;s Posterior is literally tomorrow&apos;s Prior.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Bootstrap Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(BOOT_PRESETS) as Array<keyof typeof BOOT_PRESETS>).map(
                (key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setBootPreset(key);
                      setReplicates([]);
                      setLastPickedIndices([]);
                    }}
                    className={`px-2.5 py-1 text-xs font-tabular-mono border ${
                      bootPreset === key
                        ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--bg-canvas)] font-semibold"
                        : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {BOOT_PRESETS[key].label}
                  </button>
                )
              )}
            </div>

            <div className="inline-flex border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              {(["median", "mean"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setBootStat(s);
                    setReplicates([]);
                  }}
                  className={`px-3 py-1 text-xs font-tabular-mono ${
                    bootStat === s
                      ? "bg-[var(--accent-primary)] text-[var(--bg-canvas)] font-semibold"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  Target: Sample {s === "median" ? "Median" : "Mean"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => runBootstrap(1)}
                className="px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[#029091]"
              >
                Draw 1 Bootstrap Resample
              </button>
              <button
                type="button"
                onClick={() => runBootstrap(250)}
                className="px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[#029091]"
              >
                +250 Replicates
              </button>
              <button
                type="button"
                onClick={() => runBootstrap(1000)}
                className="px-3 py-1.5 border border-[#029091] bg-[#029091]/15 text-[var(--math-ink-z)] font-semibold"
              >
                Run 1,000 Replicates Instantly
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplicates([]);
                  setLastPickedIndices([]);
                }}
                className="px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)]"
              >
                Clear
              </button>
            </div>
            <span className="tabular-nums">
              Observed {bootStat}: <strong>{fmt(observedStat, 1)} {activeDataset.unit}</strong> •
              Total Replicates: <strong>{replicates.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Left: Original Sample Points + Replacement Multiplicity */}
            <div className="xl:col-span-5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3">
              <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] font-semibold block">
                Original Sample (n = {activeDataset.data.length}) — Latest Resample Picks
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-5 xl:grid-cols-4 gap-2 text-xs font-tabular-mono tabular-nums">
                {activeDataset.data.map((val, idx) => {
                  const hits = pickCounts[idx];
                  return (
                    <div
                      key={idx}
                      className={`p-2 border text-center transition-colors ${
                        hits > 1
                          ? "border-[#D35323] bg-[#D35323]/15 font-semibold"
                          : hits === 1
                          ? "border-[#029091] bg-[#029091]/12"
                          : "border-[var(--border-subtle)] bg-[var(--bg-panel)] opacity-70"
                      }`}
                    >
                      <div>{val}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {lastPickedIndices.length > 0 ? `×${hits}` : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
                Notice how sampling <em>with replacement</em> skips roughly 37% of original observations
                while doubling/tripling others (highlighted in Persimmon)!
              </p>
            </div>

            {/* Right: Empirical Bootstrap Histogram + 95% Percentile CI */}
            <div className="xl:col-span-7 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2.5">
              <div className="flex flex-wrap justify-between gap-2 text-[11px] font-tabular-mono tabular-nums">
                <span className="uppercase tracking-wider text-[var(--math-ink-y)] font-semibold">
                  Bootstrap Sampling Distribution of {bootStat}
                </span>
                {bootSummary && (
                  <span className="text-[var(--math-ink-z)] font-semibold">
                    95% Percentile CI: [{fmt(bootSummary.low, 1)}, {fmt(bootSummary.high, 1)}] | Boot SE ={" "}
                    {fmt(bootSummary.se, 2)}
                  </span>
                )}
              </div>

              {bootSummary ? (
                <svg
                  viewBox="0 0 500 230"
                  className="w-full h-auto block"
                  role="img"
                  aria-label={`Bootstrap histogram of ${replicates.length} replicates with 95 percent percentile interval ${fmt(
                    bootSummary.low,
                    1
                  )} to ${fmt(bootSummary.high, 1)}`}
                >
                  {(() => {
                    const toX = (v: number) =>
                      32 +
                      ((v - bootSummary.minX) /
                        Math.max(1e-4, bootSummary.maxX - bootSummary.minX)) *
                        (500 - 52);
                    const baseY = 196;
                    const maxBarH = 158;

                    return (
                      <>
                        {/* 95% Percentile CI shaded window */}
                        <rect
                          x={toX(bootSummary.low)}
                          y={20}
                          width={Math.max(2, toX(bootSummary.high) - toX(bootSummary.low))}
                          height={baseY - 20}
                          fill="#96B898"
                          fillOpacity={0.18}
                        />

                        {bootSummary.bins.map((bin, idx) => {
                          const x0 = toX(bin.x0);
                          const x1 = toX(bin.x1);
                          const barH = (bin.count / bootSummary.maxCount) * maxBarH;
                          const inCi =
                            bin.mid >= bootSummary.low && bin.mid <= bootSummary.high;
                          return (
                            <rect
                              key={idx}
                              x={x0 + 0.8}
                              y={baseY - barH}
                              width={Math.max(1.5, x1 - x0 - 1.6)}
                              height={barH}
                              fill={inCi ? "#96B898" : "#B95869"}
                              fillOpacity={0.85}
                            />
                          );
                        })}

                        <line
                          x1={32}
                          x2={480}
                          y1={baseY}
                          y2={baseY}
                          stroke="var(--border-subtle)"
                          strokeWidth={1.2}
                        />

                        {/* Observed sample statistic marker */}
                        <line
                          x1={toX(observedStat)}
                          x2={toX(observedStat)}
                          y1={16}
                          y2={baseY}
                          stroke="#D35323"
                          strokeWidth={2}
                          strokeDasharray="4 3"
                        />
                        <text
                          x={toX(observedStat)}
                          y={12}
                          textAnchor="middle"
                          fontSize={9.5}
                          fontFamily="JetBrains Mono, monospace"
                          fill="#D35323"
                        >
                          Obs {fmt(observedStat, 1)}
                        </text>

                        {[bootSummary.low, observedStat, bootSummary.high].map(
                          (val, i) => (
                            <text
                              key={i}
                              x={toX(val)}
                              y={baseY + 15}
                              textAnchor="middle"
                              fontSize={9.5}
                              fontFamily="JetBrains Mono, monospace"
                              fill="var(--text-muted)"
                            >
                              {fmt(val, 1)}
                            </text>
                          )
                        )}
                      </>
                    );
                  })()}
                </svg>
              ) : (
                <div className="h-[220px] flex items-center justify-center border border-dashed border-[var(--border-subtle)] text-xs font-tabular-mono text-[var(--text-muted)]">
                  Click &ldquo;Draw 1 Bootstrap Resample&rdquo; or &ldquo;Run 1,000 Replicates Instantly&rdquo; to populate the histogram.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
