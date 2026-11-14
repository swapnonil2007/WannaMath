"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  buildHistogramBins,
  createSeededRng,
  normalPdf,
  sampleMean,
  sampleNormal,
  sampleStdDev,
} from "./statMath";

type ParentId = "right_skew" | "u_shaped" | "bimodal" | "uniform";

interface ParentPopulation {
  id: ParentId;
  label: string;
  mu: number;
  sigma: number;
  pdf: (x: number) => number;
  sample: (rng: () => number) => number;
  note: string;
}

const POPULATIONS: Record<ParentId, ParentPopulation> = {
  right_skew: {
    id: "right_skew",
    label: "Heavily Right-Skewed",
    mu: 10 / 4.5, // Beta(1, 3.5) on [0, 10]
    sigma: 10 * Math.sqrt(3.5 / (4.5 * 4.5 * 5.5)),
    pdf: (x) => {
      if (x < 0 || x > 10) return 0;
      const u = x / 10;
      return (3.5 / 10) * Math.pow(1 - u, 2.5);
    },
    sample: (rng) => 10 * (1 - Math.pow(Math.max(1e-9, rng()), 1 / 3.5)),
    note: "Individual observations pile near 0 with a long tail to 10—yet their averages still form a symmetric bell by n ≈ 25!",
  },
  u_shaped: {
    id: "u_shaped",
    label: "U-Shaped (Arcsine)",
    mu: 5.0,
    sigma: 10 / (2 * Math.SQRT2),
    pdf: (x) => {
      if (x <= 0.08 || x >= 9.92) return 0.45;
      return 1 / (Math.PI * Math.sqrt(x * (10 - x)));
    },
    sample: (rng) => 10 * Math.pow(Math.sin(0.5 * Math.PI * rng()), 2),
    note: "Values cluster near 0 and 10 with almost nobody at 5—yet averaging two or more pulls sample means right onto 5!",
  },
  bimodal: {
    id: "bimodal",
    label: "Bimodal Twin Peaks",
    mu: 5.0,
    sigma: Math.sqrt(0.75 * 0.75 + 2.7 * 2.7),
    pdf: (x) =>
      0.5 * normalPdf(x, 2.3, 0.75) + 0.5 * normalPdf(x, 7.7, 0.75),
    sample: (rng) => {
      const center = rng() < 0.5 ? 2.3 : 7.7;
      return Math.max(0, Math.min(10, sampleNormal(rng, center, 0.75)));
    },
    note: "Notice at n = 1 you see two spikes; at n = 2 you get 3 peaks; by n ≥ 15 one clean Gaussian dome dominates!",
  },
  uniform: {
    id: "uniform",
    label: "Flat Uniform [0, 10]",
    mu: 5.0,
    sigma: 10 / Math.sqrt(12),
    pdf: (x) => (x >= 0 && x <= 10 ? 0.1 : 0),
    sample: (rng) => 10 * rng(),
    note: "Flat box at n = 1, tent triangle at n = 2, and practically Normal already by n = 5!",
  },
};

function fmt(n: number, digits = 3): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.3.2 — Law of Large Numbers (LLN) & Central Limit Theorem (CLT) Animator.
 */
export function CentralLimitTheoremAnimatorLab() {
  const [popId, setPopId] = useState<ParentId>("right_skew");
  const [sampleSize, setSampleSize] = useState<number>(15);
  const [showTheoryBell, setShowTheoryBell] = useState<boolean>(true);
  const [lastSample, setLastSample] = useState<number[]>([]);
  const [sampleMeans, setSampleMeans] = useState<number[]>([]);
  const [llnPath, setLlnPath] = useState<Array<{ step: number; runningMean: number }>>([]);
  const [totalRawDraws, setTotalRawDraws] = useState<number>(0);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const rngRef = useRef<() => number>(createSeededRng(20260302));
  const llnSumRef = useRef<{ total: number; count: number }>({ total: 0, count: 0 });

  const pop = POPULATIONS[popId];
  const theoreticalSE = pop.sigma / Math.sqrt(sampleSize);

  const clearSamples = () => {
    setIsStreaming(false);
    setLastSample([]);
    setSampleMeans([]);
    setLlnPath([]);
    setTotalRawDraws(0);
    llnSumRef.current = { total: 0, count: 0 };
  };

  const drawBatches = (batchCount: number) => {
    const rng = rngRef.current;
    const newMeans: number[] = [];
    let latestDraw: number[] = [];
    const newLlnPoints: Array<{ step: number; runningMean: number }> = [];

    for (let b = 0; b < batchCount; b++) {
      const draw: number[] = [];
      let sum = 0;
      for (let i = 0; i < sampleSize; i++) {
        const val = pop.sample(rng);
        draw.push(val);
        sum += val;
        // Track single-observation LLN path on first draws or every step smoothly
        llnSumRef.current.count += 1;
        llnSumRef.current.total += val;
        const c = llnSumRef.current.count;
        if (c <= 60 || c % Math.max(1, Math.floor(c / 60)) === 0) {
          newLlnPoints.push({
            step: c,
            runningMean: llnSumRef.current.total / c,
          });
        }
      }
      latestDraw = draw;
      newMeans.push(sum / sampleSize);
    }

    setLastSample(latestDraw);
    setSampleMeans((prev) => [...prev, ...newMeans].slice(-3000));
    setTotalRawDraws(llnSumRef.current.count);
    if (newLlnPoints.length > 0) {
      setLlnPath((prev) => [...prev, ...newLlnPoints].slice(-140));
    }
  };

  useEffect(() => {
    if (!isStreaming) return;
    let rafId = 0;
    let lastTick = performance.now();
    const tick = (now: number) => {
      if (now - lastTick >= 75) {
        lastTick = now;
        drawBatches(4);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isStreaming, popId, sampleSize]);

  // SVG Layout
  const svgW = 540;
  const hParent = 132;
  const hMeans = 178;
  const padL = 42;
  const padR = 18;
  const padT = 16;
  const padB = 24;
  const plotW = svgW - padL - padR;

  const toX = (x: number) => padL + (Math.max(0, Math.min(10, x)) / 10) * plotW;

  // Parent curve path
  const parentCurve = useMemo(() => {
    const steps = 160;
    let maxDensity = 0.25;
    const pts: Array<{ x: number; d: number }> = [];
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 10;
      const d = pop.pdf(x);
      pts.push({ x, d });
      if (d > maxDensity && d < 1.2) maxDensity = d;
    }
    const peak = Math.min(0.85, maxDensity * 1.15);
    const plotH = hParent - padT - padB;
    let pathD = `M ${toX(0).toFixed(1)} ${(hParent - padB).toFixed(1)} `;
    for (const pt of pts) {
      const clampedD = Math.min(peak, pt.d);
      const py = padT + plotH - (clampedD / peak) * plotH;
      pathD += `L ${toX(pt.x).toFixed(1)} ${py.toFixed(1)} `;
    }
    pathD += `L ${toX(10).toFixed(1)} ${(hParent - padB).toFixed(1)} Z`;
    return { pathD, peak };
  }, [pop]);

  // Sampling distribution of X-bar bins + Normal(mu, sigma^2/n) overlay
  const samplingPlot = useMemo(() => {
    const numBins = 36;
    const { bins } = buildHistogramBins(sampleMeans, numBins, 0, 10);
    const theoPeak = normalPdf(pop.mu, pop.mu, theoreticalSE);
    const histPeak = bins.reduce((m, b) => Math.max(m, b.density), 0);
    const maxY = Math.max(0.25, theoPeak * 1.16, histPeak * 1.12);
    const plotH = hMeans - padT - padB;
    const toMeanY = (d: number) =>
      padT + plotH - Math.min(1, d / maxY) * plotH;

    let cltPath = "";
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 10;
      const d = normalPdf(x, pop.mu, theoreticalSE);
      const px = toX(x);
      const py = toMeanY(d);
      cltPath += `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)} `;
    }
    return { bins, maxY, toMeanY, cltPath };
  }, [sampleMeans, pop.mu, theoreticalSE]);

  const empiricalMeanOfMeans = useMemo(
    () => (sampleMeans.length > 0 ? sampleMean(sampleMeans) : 0),
    [sampleMeans]
  );
  const empiricalSE = useMemo(
    () => (sampleMeans.length > 1 ? sampleStdDev(sampleMeans, 1) : 0),
    [sampleMeans]
  );

  // LLN SVG
  const llnW = 340;
  const llnH = 195;
  const maxStep = Math.max(10, llnPath.length > 0 ? llnPath[llnPath.length - 1].step : 10);

  return (
    <section
      aria-label="Law of Large Numbers and Central Limit Theorem Animator"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-6 space-y-5"
    >
      {/* Header + Population Chooser */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
            Interactive Laboratory S.3.2 • Any Shape → Gaussian Bell at Rate 1/√n
          </span>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Law of Large Numbers (LLN) &amp; Central Limit Theorem (CLT) Animator
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(POPULATIONS) as ParentId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setPopId(id);
                clearSamples();
              }}
              className={`px-2.5 py-1.5 border text-xs font-tabular-mono cursor-pointer transition-colors ${
                popId === id
                  ? "border-[var(--math-ink-z)] bg-[#029091]/20 text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {POPULATIONS[id].label}
            </button>
          ))}
        </div>
      </div>

      {/* Sample Size Slider + Action Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <label className="lg:col-span-5 p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-x)] font-semibold">
              Sample Size per Average (n)
            </span>
            <span className="tabular-nums font-semibold text-[var(--text-primary)]">
              n = {sampleSize} (SE = σ/√n = {fmt(theoreticalSE, 3)})
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={sampleSize}
            onChange={(e) => {
              setSampleSize(Number(e.target.value));
              clearSamples();
            }}
            aria-label="Sample size n per average"
            className="w-full accent-[#8D9FCE] cursor-pointer"
          />
        </label>

        <div className="lg:col-span-7 p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => drawBatches(1)}
              className="px-2.5 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--math-ink-z)] text-xs font-tabular-mono text-[var(--text-primary)] cursor-pointer"
            >
              Draw 1 Sample (n={sampleSize})
            </button>
            <button
              type="button"
              onClick={() => drawBatches(50)}
              className="px-2.5 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--math-ink-z)] text-xs font-tabular-mono text-[var(--text-primary)] cursor-pointer"
            >
              +50 Means
            </button>
            <button
              type="button"
              onClick={() => drawBatches(1000)}
              className="px-2.5 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--math-ink-y)] text-xs font-tabular-mono text-[var(--math-ink-y)] font-semibold cursor-pointer"
            >
              Simulate +1,000
            </button>
            <button
              type="button"
              onClick={() => setIsStreaming((v) => !v)}
              className="px-2.5 py-1.5 border border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] cursor-pointer"
            >
              {isStreaming ? "Pause" : "Animate Stream"}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowTheoryBell((v) => !v)}
              className={`px-2 py-1 border text-[11px] font-tabular-mono cursor-pointer ${
                showTheoryBell
                  ? "border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-[var(--math-ink-sweep)]"
                  : "border-[var(--border-subtle)] text-[var(--text-muted)]"
              }`}
            >
              {showTheoryBell ? "CLT Bell ON" : "CLT Bell OFF"}
            </button>
            {sampleMeans.length > 0 && (
              <button
                type="button"
                onClick={clearSamples}
                className="px-2 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[11px] font-tabular-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Synchronized Split: Left Stacked (Parent + CLT Histogram), Right LLN Tracker */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2.5">
          {/* Upper Plot: Parent Population + Current Draw Dots */}
          <div className="flex items-center justify-between text-[11px] font-tabular-mono">
            <span className="text-[var(--math-ink-x)] font-semibold">
              1. Parent Population X (μ = {fmt(pop.mu, 2)}, σ = {fmt(pop.sigma, 2)})
            </span>
            <span className="tabular-nums text-[var(--text-secondary)]">
              {lastSample.length > 0
                ? `Last sample mean x̄ = ${fmt(sampleMean(lastSample), 2)}`
                : "Click Draw 1 Sample to drop n dots"}
            </span>
          </div>

          <svg
            viewBox={`0 0 ${svgW} ${hParent}`}
            role="img"
            aria-label={`Parent population density curve for ${pop.label} with mean ${fmt(pop.mu, 2)}.`}
            className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
          >
            <path d={parentCurve.pathD} fill="#8D9FCE" fillOpacity={0.25} stroke="#8D9FCE" strokeWidth={2} />
            <line
              x1={padL}
              x2={svgW - padR}
              y1={hParent - padB}
              y2={hParent - padB}
              stroke="var(--border-strong)"
              strokeWidth={1.1}
            />
            <line
              x1={toX(pop.mu)}
              x2={toX(pop.mu)}
              y1={padT}
              y2={hParent - padB}
              stroke="#AAA36D"
              strokeDasharray="4 3"
              strokeWidth={1.3}
            />
            {lastSample.map((val, i) => (
              <circle
                key={i}
                cx={toX(val)}
                cy={hParent - padB - 6 - (i % 3) * 4}
                r={3}
                fill="#029091"
                fillOpacity={0.85}
              />
            ))}
            {lastSample.length > 0 && (
              <line
                x1={toX(sampleMean(lastSample))}
                x2={toX(sampleMean(lastSample))}
                y1={padT + 4}
                y2={hParent - padB + 4}
                stroke="#D35323"
                strokeWidth={2}
              />
            )}
            {[0, 2, 4, 6, 8, 10].map((t) => (
              <text
                key={t}
                x={toX(t)}
                y={hParent - 7}
                textAnchor="middle"
                fontSize={9.5}
                fontFamily="JetBrains Mono, monospace"
                fill="var(--text-muted)"
              >
                {t}
              </text>
            ))}
          </svg>

          {/* Lower Plot: Sampling Distribution of X-bar */}
          <div className="flex items-center justify-between text-[11px] font-tabular-mono pt-1">
            <span className="text-[var(--math-ink-z)] font-semibold">
              2. Sampling Distribution of Sample Means X̄ (n = {sampleSize})
            </span>
            <span className="tabular-nums text-[var(--math-ink-sweep)] font-semibold">
              Collected Means: {sampleMeans.length}
            </span>
          </div>

          <svg
            viewBox={`0 0 ${svgW} ${hMeans}`}
            role="img"
            aria-label={`Sampling distribution histogram of ${sampleMeans.length} sample means of size ${sampleSize} compared against Normal(mu=${fmt(pop.mu, 2)}, SE=${fmt(theoreticalSE, 2)}).`}
            className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
          >
            <line
              x1={padL}
              x2={svgW - padR}
              y1={hMeans - padB}
              y2={hMeans - padB}
              stroke="var(--border-strong)"
              strokeWidth={1.1}
            />
            {samplingPlot.bins.map((bin, idx) => {
              if (bin.density <= 0) return null;
              const x0 = toX(bin.x0);
              const x1 = toX(bin.x1);
              const yTop = samplingPlot.toMeanY(bin.density);
              return (
                <rect
                  key={idx}
                  x={x0}
                  y={yTop}
                  width={Math.max(1, x1 - x0 - 0.6)}
                  height={Math.max(0.5, hMeans - padB - yTop)}
                  fill="#029091"
                  fillOpacity={0.48}
                  stroke="#029091"
                  strokeWidth={0.6}
                />
              );
            })}
            <line
              x1={toX(pop.mu)}
              x2={toX(pop.mu)}
              y1={padT}
              y2={hMeans - padB}
              stroke="#AAA36D"
              strokeDasharray="4 3"
              strokeWidth={1.3}
            />
            {showTheoryBell && (
              <path
                d={samplingPlot.cltPath}
                fill="none"
                stroke="#D35323"
                strokeWidth={2.2}
              />
            )}
            {[0, 2, 4, 6, 8, 10].map((t) => (
              <text
                key={t}
                x={toX(t)}
                y={hMeans - 7}
                textAnchor="middle"
                fontSize={9.5}
                fontFamily="JetBrains Mono, monospace"
                fill="var(--text-muted)"
              >
                {t}
              </text>
            ))}
          </svg>
        </div>

        {/* Right 4 Cols: Law of Large Numbers Running Average + Numeric Proof */}
        <div className="xl:col-span-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] font-semibold block">
              Law of Large Numbers Tracker
            </span>
            <p className="text-xs font-math-serif text-[var(--text-secondary)]">
              Tracks running mean <KaTeXMath math="\bar{X}_k" /> as total raw draws{" "}
              <code>k</code> grow—locking onto true <KaTeXMath math={`\\mu = ${fmt(pop.mu, 2)}`} />.
            </p>
          </div>

          <svg
            viewBox={`0 0 ${llnW} ${llnH}`}
            role="img"
            aria-label={`Law of Large Numbers convergence trace toward true mean ${fmt(pop.mu, 2)}.`}
            className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
          >
            {/* Target mean line */}
            <line
              x1={32}
              x2={llnW - 14}
              y1={llnH - 22 - (pop.mu / 10) * (llnH - 38)}
              y2={llnH - 22 - (pop.mu / 10) * (llnH - 38)}
              stroke="#AAA36D"
              strokeDasharray="4 3"
              strokeWidth={1.4}
            />
            {llnPath.length > 1 && (
              <polyline
                fill="none"
                stroke="#96B898"
                strokeWidth={2}
                points={llnPath
                  .map((pt) => {
                    const px = 32 + (pt.step / maxStep) * (llnW - 46);
                    const py =
                      llnH - 22 - (Math.max(0, Math.min(10, pt.runningMean)) / 10) * (llnH - 38);
                    return `${px.toFixed(1)},${py.toFixed(1)}`;
                  })
                  .join(" ")}
              />
            )}
            <text x={36} y={16} fontSize={9.5} fontFamily="JetBrains Mono, monospace" fill="var(--math-ink-grid)">
              Target μ = {fmt(pop.mu, 2)}
            </text>
            <text x={llnW - 16} y={llnH - 6} textAnchor="end" fontSize={9.5} fontFamily="JetBrains Mono, monospace" fill="var(--text-muted)">
              Draws k = {totalRawDraws}
            </text>
          </svg>

          <div className="grid grid-cols-2 gap-2 text-xs font-tabular-mono tabular-nums">
            <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              <span className="text-[10px] text-[var(--text-muted)] block">CLT Mean Theory vs Sim</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {fmt(pop.mu, 2)} vs {sampleMeans.length > 0 ? fmt(empiricalMeanOfMeans, 2) : "—"}
              </span>
            </div>
            <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              <span className="text-[10px] text-[var(--text-muted)] block">SE Theory (σ/√n) vs Sim</span>
              <span className="font-semibold text-[var(--math-ink-sweep)]">
                {fmt(theoreticalSE, 2)} vs {sampleMeans.length > 1 ? fmt(empiricalSE, 2) : "—"}
              </span>
            </div>
          </div>

          <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
            {pop.note}
          </p>
        </div>
      </div>
    </section>
  );
}
