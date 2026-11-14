"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  bernoulliPmf,
  binomialCoeff,
  binomialPmf,
  createSeededRng,
  geometricPmf,
  poissonPmf,
} from "./statMath";

type DistFamily = "binomial" | "bernoulli" | "geometric" | "poisson";
type ChartMode = "pmf" | "cdf";

interface FallingBead {
  id: number;
  startTime: number;
  durationMs: number;
  /** X offsets after each row r=0..n (length n+1), normalized in slot units around center 0 */
  rowPositions: number[];
  targetBin: number;
}

function fmt(n: number, digits = 3): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.2.3 — Animated Galton Pegboard, Discrete PMF/Step-CDF & Binomial-Poisson Limit Lab.
 */
export function GaltonBoardDiscreteLab() {
  const [dist, setDist] = useState<DistFamily>("binomial");
  const [chartMode, setChartMode] = useState<ChartMode>("pmf");
  const [nTrials, setNTrials] = useState<number>(10);
  const [pSuccess, setPSuccess] = useState<number>(0.5);
  const [lambdaRate, setLambdaRate] = useState<number>(3.2);
  const [overlayPoisson, setOverlayPoisson] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [lastArrivals, setLastArrivals] = useState<number[]>([]);

  // Empirical counts keyed by discrete integer value k
  const [empiricalCounts, setEmpiricalCounts] = useState<Record<number, number>>({});
  const [activeBeads, setActiveBeads] = useState<FallingBead[]>([]);
  const [renderClock, setRenderClock] = useState<number>(0);

  const rngRef = useRef<() => number>(createSeededRng(20260203));
  const beadSeqRef = useRef<number>(1);
  const beadsRef = useRef<FallingBead[]>([]);

  const resetTallies = () => {
    setEmpiricalCounts({});
    beadsRef.current = [];
    setActiveBeads([]);
    setLastArrivals([]);
  };

  const handleSelectDist = (nextDist: DistFamily) => {
    setIsStreaming(false);
    setDist(nextDist);
    resetTallies();
  };

  // Support range & exact theoretical PMF + moments
  const theory = useMemo(() => {
    let minK = 0;
    let maxK = nTrials;
    let mean = 0;
    let variance = 0;

    if (dist === "bernoulli") {
      minK = 0;
      maxK = 1;
      mean = pSuccess;
      variance = pSuccess * (1 - pSuccess);
    } else if (dist === "binomial") {
      minK = 0;
      maxK = nTrials;
      mean = nTrials * pSuccess;
      variance = nTrials * pSuccess * (1 - pSuccess);
    } else if (dist === "geometric") {
      minK = 1;
      maxK = Math.min(28, Math.max(10, Math.ceil(5 / Math.max(0.1, pSuccess))));
      mean = 1 / Math.max(0.05, pSuccess);
      variance = (1 - pSuccess) / (pSuccess * pSuccess);
    } else {
      minK = 0;
      maxK = Math.min(28, Math.max(12, Math.ceil(lambdaRate + 4 * Math.sqrt(lambdaRate) + 3)));
      mean = lambdaRate;
      variance = lambdaRate;
    }

    const items: Array<{
      k: number;
      pmf: number;
      cdf: number;
      poissonApprox: number;
    }> = [];
    let runningCdf = 0;
    for (let k = minK; k <= maxK; k++) {
      let pmf = 0;
      if (dist === "bernoulli") pmf = bernoulliPmf(k, pSuccess);
      else if (dist === "binomial") pmf = binomialPmf(k, nTrials, pSuccess);
      else if (dist === "geometric") pmf = geometricPmf(k, pSuccess);
      else pmf = poissonPmf(k, lambdaRate);
      runningCdf = Math.min(1, runningCdf + pmf);
      const poissonApprox =
        dist === "binomial" ? poissonPmf(k, nTrials * pSuccess) : 0;
      items.push({ k, pmf, cdf: runningCdf, poissonApprox });
    }

    const peakPmf = Math.max(
      0.08,
      ...items.map((it) => Math.max(it.pmf, overlayPoisson ? it.poissonApprox : 0))
    );

    return {
      minK,
      maxK,
      mean,
      variance,
      stdDev: Math.sqrt(Math.max(0, variance)),
      items,
      peakPmf,
    };
  }, [dist, nTrials, pSuccess, lambdaRate, overlayPoisson]);

  const totalSamples = useMemo(
    () => Object.values(empiricalCounts).reduce((a, b) => a + b, 0),
    [empiricalCounts]
  );

  // Sample one discrete observation cleanly
  const sampleOneInstant = (): number => {
    const rng = rngRef.current;
    if (dist === "bernoulli") {
      return rng() < pSuccess ? 1 : 0;
    }
    if (dist === "binomial") {
      let s = 0;
      for (let i = 0; i < nTrials; i++) {
        if (rng() < pSuccess) s++;
      }
      return s;
    }
    if (dist === "geometric") {
      let k = 1;
      while (rng() >= pSuccess && k < 100) {
        k++;
      }
      return k;
    }
    // Knuth exact Poisson sampler
    const L = Math.exp(-lambdaRate);
    let k = 0;
    let prod = 1;
    do {
      k++;
      prod *= rng();
    } while (prod > L && k < 80);
    const count = k - 1;
    const arrivals = Array.from({ length: count }, () => rng()).sort((a, b) => a - b);
    setLastArrivals(arrivals);
    return count;
  };

  const dropAnimatedBead = () => {
    if (dist !== "binomial") {
      const val = sampleOneInstant();
      setEmpiricalCounts((prev) => ({ ...prev, [val]: (prev[val] ?? 0) + 1 }));
      return;
    }
    const rng = rngRef.current;
    let rightCount = 0;
    const rowPositions: number[] = [0];
    for (let r = 0; r < nTrials; r++) {
      const goRight = rng() < pSuccess;
      if (goRight) rightCount++;
      // Horizontal slot coordinate relative to center (bin k sits at k - n/2)
      rowPositions.push(rightCount - (r + 1) * 0.5);
    }
    const now = performance.now();
    const bead: FallingBead = {
      id: beadSeqRef.current++,
      startTime: now,
      durationMs: Math.min(1150, 420 + nTrials * 34),
      rowPositions,
      targetBin: rightCount,
    };
    beadsRef.current = [...beadsRef.current.slice(-24), bead];
    setActiveBeads(beadsRef.current);
  };

  const dropFastBatch = (count: number) => {
    const delta: Record<number, number> = {};
    for (let i = 0; i < count; i++) {
      const k = sampleOneInstant();
      delta[k] = (delta[k] ?? 0) + 1;
    }
    setEmpiricalCounts((prev) => {
      const next = { ...prev };
      for (const [kStr, c] of Object.entries(delta)) {
        const k = Number(kStr);
        next[k] = (next[k] ?? 0) + c;
      }
      return next;
    });
  };

  const hasActiveBeads = activeBeads.length > 0;

  // Drive bead animation and/or continuous stream cleanly outside state updaters
  useEffect(() => {
    if (!isStreaming && !hasActiveBeads) return;

    let rafId = 0;
    let lastStreamSpawn = performance.now();

    const frame = (now: number) => {
      setRenderClock(now);

      if (isStreaming && now - lastStreamSpawn >= (dist === "binomial" ? 130 : 85)) {
        lastStreamSpawn = now;
        if (dist === "binomial") {
          const rng = rngRef.current;
          let rightCount = 0;
          const rowPositions: number[] = [0];
          for (let r = 0; r < nTrials; r++) {
            const goRight = rng() < pSuccess;
            if (goRight) rightCount++;
            rowPositions.push(rightCount - (r + 1) * 0.5);
          }
          const newBead: FallingBead = {
            id: beadSeqRef.current++,
            startTime: now,
            durationMs: Math.min(1150, 420 + nTrials * 34),
            rowPositions,
            targetBin: rightCount,
          };
          beadsRef.current = [...beadsRef.current.slice(-24), newBead];
        } else {
          const rng = rngRef.current;
          let val = 0;
          if (dist === "bernoulli") {
            val = rng() < pSuccess ? 1 : 0;
          } else if (dist === "geometric") {
            let k = 1;
            while (rng() >= pSuccess && k < 100) k++;
            val = k;
          } else {
            const L = Math.exp(-lambdaRate);
            let k = 0;
            let prod = 1;
            do {
              k++;
              prod *= rng();
            } while (prod > L && k < 80);
            val = k - 1;
            setLastArrivals(
              Array.from({ length: val }, () => rng()).sort((a, b) => a - b)
            );
          }
          setEmpiricalCounts((prev) => ({
            ...prev,
            [val]: (prev[val] ?? 0) + 1,
          }));
        }
      }

      if (beadsRef.current.length > 0) {
        const finishedBins: number[] = [];
        const remaining: FallingBead[] = [];
        for (const bead of beadsRef.current) {
          if (now - bead.startTime >= bead.durationMs) {
            finishedBins.push(bead.targetBin);
          } else {
            remaining.push(bead);
          }
        }
        beadsRef.current = remaining;
        setActiveBeads(remaining);
        if (finishedBins.length > 0) {
          setEmpiricalCounts((counts) => {
            const next = { ...counts };
            for (const b of finishedBins) {
              next[b] = (next[b] ?? 0) + 1;
            }
            return next;
          });
        }
      } else if (isStreaming && dist === "binomial") {
        setActiveBeads(beadsRef.current);
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [isStreaming, hasActiveBeads, dist, nTrials, pSuccess, lambdaRate]);

  // SVG dimensions for PMF/CDF Chart
  const chartW = 540;
  const chartH = 250;
  const padL = 46;
  const padR = 20;
  const padT = 22;
  const padB = 34;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const numSlots = theory.items.length;
  const slotW = plotW / Math.max(1, numSlots);
  const yMax = chartMode === "cdf" ? 1.05 : theory.peakPmf * 1.18;

  const toChartX = (k: number) =>
    padL + (k - theory.minK + 0.5) * slotW;
  const toChartY = (val: number) =>
    padT + plotH - (Math.min(yMax, val) / yMax) * plotH;

  // Pegboard coordinates when Binomial
  const boardW = 360;
  const boardH = 250;
  const pegRowsVisible = Math.min(nTrials, 16);
  const pegTopY = 26;
  const pegBottomY = 224;
  const rowStepY = (pegBottomY - pegTopY) / Math.max(1, pegRowsVisible);
  const slotStepX = Math.min(26, (boardW - 44) / Math.max(2, nTrials + 1));

  return (
    <section
      aria-label="Galton Pegboard and Discrete Probability Distributions Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-6 space-y-5"
    >
      {/* Header + Family Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
            Interactive Laboratory S.2.3 • Discrete Laws &amp; Rare-Event Convergence
          </span>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Galton Pegboard, PMF / Step-CDF &amp; Binomial → Poisson Limit
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "binomial" as const, label: "Binomial(n, p)" },
            { id: "bernoulli" as const, label: "Bernoulli(p)" },
            { id: "geometric" as const, label: "Geometric(p)" },
            { id: "poisson" as const, label: "Poisson(λ)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectDist(tab.id)}
              className={`px-3 py-1.5 border text-xs font-tabular-mono cursor-pointer transition-colors ${
                dist === tab.id
                  ? "border-[var(--math-ink-z)] bg-[#029091]/20 text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dist === "binomial" && (
          <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="text-[var(--math-ink-x)] font-semibold">
                Trials / Peg Rows (n)
              </span>
              <span className="tabular-nums font-semibold text-[var(--text-primary)]">
                n = {nTrials}
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={30}
              step={1}
              value={nTrials}
              onChange={(e) => {
                setIsStreaming(false);
                setNTrials(Number(e.target.value));
                resetTallies();
              }}
              aria-label="Number of trials n"
              className="w-full accent-[#8D9FCE] cursor-pointer"
            />
          </label>
        )}

        {dist !== "poisson" && (
          <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="text-[var(--math-ink-y)] font-semibold">
                Success / Bounce-Right Prob (p)
              </span>
              <span className="tabular-nums font-semibold text-[var(--text-primary)]">
                p = {pSuccess.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.95}
              step={0.01}
              value={pSuccess}
              onChange={(e) => {
                setIsStreaming(false);
                setPSuccess(Number(e.target.value));
                resetTallies();
              }}
              aria-label="Success probability p"
              className="w-full accent-[#96B898] cursor-pointer"
            />
          </label>
        )}

        {dist === "poisson" && (
          <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="text-[var(--math-ink-sweep)] font-semibold">
                Expected Arrival Rate (λ)
              </span>
              <span className="tabular-nums font-semibold text-[var(--text-primary)]">
                λ = {lambdaRate.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={0.4}
              max={12}
              step={0.2}
              value={lambdaRate}
              onChange={(e) => {
                setIsStreaming(false);
                setLambdaRate(Number(e.target.value));
                resetTallies();
              }}
              aria-label="Poisson arrival rate lambda"
              className="w-full accent-[#D35323] cursor-pointer"
            />
          </label>
        )}

        {/* Simulation + Poisson Limit Controls */}
        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex flex-col justify-between gap-2 md:col-span-1">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={dropAnimatedBead}
              className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--math-ink-z)] text-xs font-tabular-mono text-[var(--text-primary)] cursor-pointer"
            >
              {dist === "binomial" ? "Drop 1 Bead" : "Run 1 Trial"}
            </button>
            <button
              type="button"
              onClick={() => dropFastBatch(50)}
              className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--math-ink-z)] text-xs font-tabular-mono text-[var(--text-primary)] cursor-pointer"
            >
              +50 Samples
            </button>
            <button
              type="button"
              onClick={() => setIsStreaming((v) => !v)}
              className="px-2.5 py-1 border border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] cursor-pointer"
            >
              {isStreaming ? "Pause Stream" : "Animate Stream"}
            </button>
            {totalSamples > 0 && (
              <button
                type="button"
                onClick={resetTallies}
                className="px-2 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-tabular-mono">
            {dist === "binomial" && (
              <button
                type="button"
                onClick={() => setOverlayPoisson((v) => !v)}
                className={`px-2 py-0.5 border cursor-pointer ${
                  overlayPoisson
                    ? "border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-[var(--math-ink-sweep)] font-semibold"
                    : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
                }`}
              >
                {overlayPoisson
                  ? `Poisson(λ=${(nTrials * pSuccess).toFixed(1)}) ON`
                  : "Overlay Poisson(np)"}
              </button>
            )}
            {dist === "binomial" && (
              <button
                type="button"
                onClick={() => {
                  setIsStreaming(false);
                  setNTrials(30);
                  setPSuccess(0.06);
                  setOverlayPoisson(true);
                  resetTallies();
                }}
                className="px-2 py-0.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-y)] text-[var(--math-ink-y)] cursor-pointer"
              >
                Rare-Event Limit (30, 0.06)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Dual Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Mechanism Panel (4 cols on xl) */}
        <div className="xl:col-span-5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--text-secondary)]">
              {dist === "binomial"
                ? `Galton Pegboard (${nTrials} rows, p=${pSuccess.toFixed(2)})`
                : dist === "bernoulli"
                ? "Single Bernoulli Coin Mechanism"
                : dist === "geometric"
                ? "Waiting Time To First Success"
                : "Random Poisson Arrivals on [0, 1]"}
            </span>
            <span className="tabular-nums text-[var(--math-ink-z)] font-semibold">
              Samples: {totalSamples}
            </span>
          </div>

          {dist === "binomial" ? (
            <svg
              viewBox={`0 0 ${boardW} ${boardH}`}
              role="img"
              aria-label={`Animated Galton pegboard with ${nTrials} rows and right-bounce probability ${pSuccess.toFixed(2)}.`}
              className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
            >
              {/* Entry funnel */}
              <path
                d={`M ${boardW / 2 - 14} 6 L ${boardW / 2 - 4} 20 M ${boardW / 2 + 14} 6 L ${boardW / 2 + 4} 20`}
                stroke="var(--border-strong)"
                strokeWidth={1.5}
              />

              {/* Triangular peg matrix */}
              {nTrials <= 16 ? (
                Array.from({ length: pegRowsVisible }, (_, r) => {
                  const py = pegTopY + r * rowStepY;
                  return Array.from({ length: r + 1 }, (__, j) => {
                    const px = boardW / 2 + (j - r * 0.5) * slotStepX;
                    return (
                      <circle
                        key={`${r}-${j}`}
                        cx={px}
                        cy={py}
                        r={Math.max(1.8, Math.min(3.1, slotStepX * 0.14))}
                        fill="var(--math-ink-grid)"
                      />
                    );
                  });
                })
              ) : (
                <g>
                  <polygon
                    points={`${boardW / 2},${pegTopY} ${boardW / 2 - (pegRowsVisible * slotStepX) / 2},${pegBottomY} ${boardW / 2 + (pegRowsVisible * slotStepX) / 2},${pegBottomY}`}
                    fill="#8D9FCE"
                    fillOpacity={0.08}
                    stroke="var(--border-subtle)"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={boardW / 2}
                    y={boardH / 2}
                    textAnchor="middle"
                    fontSize={11}
                    fontFamily="JetBrains Mono, monospace"
                    fill="var(--text-secondary)"
                  >
                    High-n Limit Funnel (n = {nTrials})
                  </text>
                </g>
              )}

              {/* Bottom collector slots */}
              {Array.from({ length: nTrials + 1 }, (_, k) => {
                const bx = boardW / 2 + (k - nTrials * 0.5) * slotStepX;
                const count = empiricalCounts[k] ?? 0;
                const maxStackH = 26;
                const stackH =
                  totalSamples > 0
                    ? Math.min(maxStackH, (count / Math.max(8, totalSamples * 0.35)) * maxStackH)
                    : 0;
                return (
                  <g key={k}>
                    <rect
                      x={bx - slotStepX * 0.38}
                      y={boardH - 8 - stackH}
                      width={Math.max(2, slotStepX * 0.76)}
                      height={stackH}
                      fill="#029091"
                      fillOpacity={0.75}
                    />
                  </g>
                );
              })}

              {/* Animated falling beads */}
              {activeBeads.map((bead) => {
                const elapsed = Math.max(0, renderClock - bead.startTime);
                const tNorm = Math.min(1, elapsed / bead.durationMs);
                const exactRow = tNorm * nTrials;
                const r0 = Math.min(nTrials, Math.floor(exactRow));
                const r1 = Math.min(nTrials, r0 + 1);
                const frac = exactRow - r0;
                const slotPos =
                  bead.rowPositions[r0] * (1 - frac) +
                  bead.rowPositions[r1] * frac;
                const bx = boardW / 2 + slotPos * slotStepX;
                const by =
                  pegTopY + (exactRow / Math.max(1, nTrials)) * (pegBottomY - pegTopY);
                return (
                  <circle
                    key={bead.id}
                    cx={bx}
                    cy={by}
                    r={Math.max(2.6, Math.min(4.2, slotStepX * 0.22))}
                    fill="#D35323"
                    stroke="var(--bg-canvas)"
                    strokeWidth={0.8}
                  />
                );
              })}
            </svg>
          ) : (
            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-3 min-h-[205px] flex flex-col justify-between">
              {dist === "poisson" ? (
                <>
                  <div className="space-y-1.5">
                    <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
                      Independent Arrivals Timeline t ∈ [0, 1] (Count = {lastArrivals.length})
                    </span>
                    <svg
                      viewBox="0 0 340 62"
                      role="img"
                      aria-label={`Poisson arrival timeline showing ${lastArrivals.length} random events in [0, 1].`}
                      className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                    >
                      <line x1={16} x2={324} y1={31} y2={31} stroke="var(--border-strong)" strokeWidth={1.5} />
                      {lastArrivals.map((t, i) => (
                        <circle
                          key={i}
                          cx={16 + t * 308}
                          cy={31}
                          r={4}
                          fill="#D35323"
                        />
                      ))}
                    </svg>
                  </div>
                  <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                    Each independent click splits time into infinitely many tiny coin flips whose sum settles into{" "}
                    <KaTeXMath math="\text{Poisson}(\lambda)" />, where remarkably{" "}
                    <KaTeXMath math="\mathbb{E}[X] = \operatorname{Var}(X) = \lambda" />!
                  </p>
                </>
              ) : dist === "geometric" ? (
                <>
                  <div className="space-y-2">
                    <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
                      Memorylessness Check
                    </span>
                    <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs overflow-x-auto">
                      <KaTeXMath
                        math="P(X > s + t \mid X > s) = P(X > t) = (1-p)^t"
                        block
                      />
                    </div>
                  </div>
                  <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
                    Wait <code>k = 1, 2, 3, ...</code> coin flips until your <strong>very first</strong>{" "}
                    success. Past failures never &ldquo;build up&rdquo; luck—on trial #6, the coin still behaves
                    as if you just started!
                  </p>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
                      Building Block Atom: Bernoulli(p)
                    </span>
                    <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs overflow-x-auto">
                      <KaTeXMath
                        math="\mathbb{E}[X] = p, \qquad \operatorname{Var}(X) = p(1-p)"
                        block
                      />
                    </div>
                  </div>
                  <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
                    Every Binomial random variable is simply the sum of <KaTeXMath math="n" /> independent{" "}
                    <KaTeXMath math="\text{Bernoulli}(p)" /> flips! Notice variance{" "}
                    <KaTeXMath math="p(1-p)" /> peaks at maximum uncertainty <KaTeXMath math="p = 0.50" />.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right PMF vs Step-CDF Panel (7 cols on xl) */}
        <div className="xl:col-span-7 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <span className="text-[var(--text-secondary)]">
              {chartMode === "pmf"
                ? "Theoretical PMF vs. Empirical Frequencies (Bars = Sim, Pins = Theory)"
                : "Discrete Step-CDF F(x) = P(X ≤ x) (Staircase Jumps of Size P(X = k))"}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setChartMode("pmf")}
                className={`px-2 py-0.5 border cursor-pointer ${
                  chartMode === "pmf"
                    ? "border-[var(--math-ink-z)] bg-[#029091]/20 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                }`}
              >
                PMF P(X = k)
              </button>
              <button
                type="button"
                onClick={() => setChartMode("cdf")}
                className={`px-2 py-0.5 border cursor-pointer ${
                  chartMode === "cdf"
                    ? "border-[var(--math-ink-z)] bg-[#029091]/20 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                }`}
              >
                Step-CDF P(X ≤ x)
              </button>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            role="img"
            aria-label={`${dist} ${chartMode.toUpperCase()} plot comparing theoretical probability distribution (mean ${fmt(theory.mean, 2)}) with ${totalSamples} empirical samples.`}
            className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
          >
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
              const yVal = frac * (chartMode === "cdf" ? 1.0 : theory.peakPmf);
              const py = toChartY(yVal);
              return (
                <g key={frac}>
                  <line
                    x1={padL}
                    x2={chartW - padR}
                    y1={py}
                    y2={py}
                    stroke="var(--border-subtle)"
                    strokeDasharray="3 3"
                    strokeWidth={0.8}
                  />
                  <text
                    x={padL - 6}
                    y={py + 3}
                    textAnchor="end"
                    fontSize={9.5}
                    fontFamily="JetBrains Mono, monospace"
                    fill="var(--text-muted)"
                  >
                    {yVal.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line
              x1={padL}
              x2={chartW - padR}
              y1={padT + plotH}
              y2={padT + plotH}
              stroke="var(--border-strong)"
              strokeWidth={1.2}
            />

            {/* Mean vertical marker */}
            {theory.mean >= theory.minK && theory.mean <= theory.maxK && (
              <line
                x1={toChartX(theory.mean)}
                x2={toChartX(theory.mean)}
                y1={padT}
                y2={padT + plotH}
                stroke="#AAA36D"
                strokeWidth={1.4}
                strokeDasharray="4 3"
              />
            )}

            {chartMode === "pmf" ? (
              <>
                {theory.items.map((it) => {
                  const cx = toChartX(it.k);
                  const empProb =
                    totalSamples > 0 ? (empiricalCounts[it.k] ?? 0) / totalSamples : 0;
                  const empTop = toChartY(empProb);
                  const theoryTop = toChartY(it.pmf);
                  const barW = Math.max(3, Math.min(28, slotW * 0.62));

                  return (
                    <g key={it.k}>
                      {/* Empirical Histogram Bar */}
                      {totalSamples > 0 && empProb > 0 && (
                        <rect
                          x={cx - barW / 2}
                          y={empTop}
                          width={barW}
                          height={Math.max(1, padT + plotH - empTop)}
                          fill="#029091"
                          fillOpacity={0.35}
                          stroke="#029091"
                          strokeWidth={0.9}
                        />
                      )}
                      {/* Theoretical PMF Lollipop Pin */}
                      <line
                        x1={cx}
                        x2={cx}
                        y1={padT + plotH}
                        y2={theoryTop}
                        stroke="#8D9FCE"
                        strokeWidth={Math.max(1.6, Math.min(3, slotW * 0.16))}
                      />
                      <circle
                        cx={cx}
                        cy={theoryTop}
                        r={Math.max(2.6, Math.min(4.5, slotW * 0.22))}
                        fill="#8D9FCE"
                      />

                      {/* Optional Poisson Overlay Diamond */}
                      {dist === "binomial" && overlayPoisson && (
                        <polygon
                          points={`${cx},${toChartY(it.poissonApprox) - 4.5} ${cx + 4.5},${toChartY(it.poissonApprox)} ${cx},${toChartY(it.poissonApprox) + 4.5} ${cx - 4.5},${toChartY(it.poissonApprox)}`}
                          fill="#D35323"
                          stroke="var(--bg-panel)"
                          strokeWidth={0.7}
                        />
                      )}

                      {/* X tick label */}
                      {(numSlots <= 16 || it.k % Math.ceil(numSlots / 12) === 0) && (
                        <text
                          x={cx}
                          y={padT + plotH + 14}
                          textAnchor="middle"
                          fontSize={9.5}
                          fontFamily="JetBrains Mono, monospace"
                          fill="var(--text-secondary)"
                        >
                          {it.k}
                        </text>
                      )}
                    </g>
                  );
                })}
              </>
            ) : (
              <>
                {/* Right-continuous Step-CDF */}
                {theory.items.map((it, idx) => {
                  const prevCdf = idx > 0 ? theory.items[idx - 1].cdf : 0;
                  const xLeft = toChartX(it.k);
                  const xRight =
                    idx + 1 < theory.items.length
                      ? toChartX(theory.items[idx + 1].k)
                      : chartW - padR;
                  const yStep = toChartY(it.cdf);
                  const yPrev = toChartY(prevCdf);

                  return (
                    <g key={it.k}>
                      {idx === 0 && (
                        <line
                          x1={padL}
                          x2={xLeft}
                          y1={toChartY(0)}
                          y2={toChartY(0)}
                          stroke="#8D9FCE"
                          strokeWidth={2}
                        />
                      )}
                      <line
                        x1={xLeft}
                        x2={xLeft}
                        y1={yPrev}
                        y2={yStep}
                        stroke="var(--border-subtle)"
                        strokeDasharray="2 2"
                        strokeWidth={1}
                      />
                      <line
                        x1={xLeft}
                        x2={xRight}
                        y1={yStep}
                        y2={yStep}
                        stroke="#8D9FCE"
                        strokeWidth={2.2}
                      />
                      <circle cx={xLeft} cy={yPrev} r={3} fill="var(--bg-panel)" stroke="#8D9FCE" strokeWidth={1.4} />
                      <circle cx={xLeft} cy={yStep} r={3.5} fill="#8D9FCE" />

                      {(numSlots <= 16 || it.k % Math.ceil(numSlots / 12) === 0) && (
                        <text
                          x={xLeft}
                          y={padT + plotH + 14}
                          textAnchor="middle"
                          fontSize={9.5}
                          fontFamily="JetBrains Mono, monospace"
                          fill="var(--text-secondary)"
                        >
                          {it.k}
                        </text>
                      )}
                    </g>
                  );
                })}
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Live Formula & Moment Readouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs font-tabular-mono tabular-nums">
        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">
            Theoretical Mean E[X]
          </span>
          <span className="text-base font-semibold text-[var(--math-ink-grid)]">
            {fmt(theory.mean, 3)}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] block">
            {dist === "binomial"
              ? `n · p = ${nTrials} × ${pSuccess.toFixed(2)}`
              : dist === "geometric"
              ? `1 / p = 1 / ${pSuccess.toFixed(2)}`
              : dist === "poisson"
              ? `λ = ${lambdaRate.toFixed(1)}`
              : `p = ${pSuccess.toFixed(2)}`}
          </span>
        </div>

        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">
            Variance Var(X) &amp; SD σ
          </span>
          <span className="text-base font-semibold text-[var(--math-ink-z)]">
            {fmt(theory.variance, 3)} (σ = {fmt(theory.stdDev, 3)})
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] block">
            {dist === "binomial"
              ? `np(1−p) • Center bin C(${nTrials},${Math.round(nTrials * pSuccess)})=${binomialCoeff(nTrials, Math.round(nTrials * pSuccess))}`
              : dist === "geometric"
              ? `(1 − p) / p²`
              : dist === "poisson"
              ? `Equal to Mean: Var(X) = λ`
              : `p(1 − p)`}
          </span>
        </div>

        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">
            Empirical vs. Theory Convergence
          </span>
          {totalSamples > 0 ? (
            <>
              <span className="text-base font-semibold text-[var(--text-primary)]">
                Sample Mean ={" "}
                {fmt(
                  Object.entries(empiricalCounts).reduce(
                    (acc, [k, c]) => acc + Number(k) * c,
                    0
                  ) / totalSamples,
                  3
                )}
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] block">
                Over {totalSamples} simulated trials
              </span>
            </>
          ) : (
            <span className="text-xs font-math-serif text-[var(--text-secondary)] block pt-1">
              Click Drop 1 Bead or Animate Stream to watch empirical bars converge onto theoretical pins!
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
