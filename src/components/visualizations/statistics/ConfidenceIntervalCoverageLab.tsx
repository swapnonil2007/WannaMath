"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  createSeededRng,
  normalInvCdf,
  sampleMean,
  sampleNormal,
  sampleStdDev,
  studentTInvCdf,
} from "./statMath";

type ConfLevel = 0.8 | 0.9 | 0.95 | 0.99;
type IntervalMethod = "student_t" | "z_known" | "naive_z_trap";

interface SimulatedInterval {
  id: number;
  xbar: number;
  s: number;
  lower: number;
  upper: number;
  captured: boolean;
}

const TRUE_MU = 50;

function fmt(n: number, digits = 2): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.4.2 — 100-Sample Confidence Interval Coverage Simulator.
 * Demonstrates frequentist interval coverage (random intervals vs. fixed μ),
 * Z vs. Student's t critical multipliers, and 1/√n width scaling.
 */
export function ConfidenceIntervalCoverageLab() {
  const [n, setN] = useState<number>(10);
  const [sigma, setSigma] = useState<number>(10);
  const [confLevel, setConfLevel] = useState<ConfLevel>(0.95);
  const [method, setMethod] = useState<IntervalMethod>("student_t");
  const [intervals, setIntervals] = useState<SimulatedInterval[]>([]);
  const [cumulativeHits, setCumulativeHits] = useState<number>(0);
  const [cumulativeTotal, setCumulativeTotal] = useState<number>(0);

  const rngRef = useRef<() => number>(createSeededRng(20260402));
  const seqRef = useRef<number>(1);

  const criticalValue = useMemo(() => {
    const upperTailProb = 1 - (1 - confLevel) / 2;
    if (method === "student_t") {
      return studentTInvCdf(upperTailProb, n - 1);
    }
    return normalInvCdf(upperTailProb);
  }, [confLevel, method, n]);

  const generateBatch = (count = 100, replaceVisible = true) => {
    const rng = rngRef.current;
    const batch: SimulatedInterval[] = [];
    let hitsInBatch = 0;

    for (let i = 0; i < count; i++) {
      const draws = Array.from({ length: n }, () =>
        sampleNormal(rng, TRUE_MU, sigma)
      );
      const xbar = sampleMean(draws);
      const s = Math.max(1e-4, sampleStdDev(draws, 1));
      const se = method === "z_known" ? sigma / Math.sqrt(n) : s / Math.sqrt(n);
      const me = criticalValue * se;
      const lower = xbar - me;
      const upper = xbar + me;
      const captured = lower <= TRUE_MU && TRUE_MU <= upper;
      if (captured) hitsInBatch++;
      batch.push({
        id: seqRef.current++,
        xbar,
        s,
        lower,
        upper,
        captured,
      });
    }

    if (replaceVisible) {
      setIntervals(batch);
    } else {
      setIntervals((prev) => [...batch, ...prev].slice(0, 100));
    }
    setCumulativeHits((h) => h + hitsInBatch);
    setCumulativeTotal((t) => t + count);
  };

  // Seed initial 100 intervals cleanly on first client mount or param reset
  const resetAndSeed = () => {
    setCumulativeHits(0);
    setCumulativeTotal(0);
    generateBatch(100, true);
  };

  useEffect(() => {
    resetAndSeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, sigma, confLevel, method]);

  const visibleHits = useMemo(
    () => intervals.filter((iv) => iv.captured).length,
    [intervals]
  );

  const avgHalfWidth = useMemo(() => {
    if (intervals.length === 0) return criticalValue * (sigma / Math.sqrt(n));
    return (
      intervals.reduce((acc, iv) => acc + 0.5 * (iv.upper - iv.lower), 0) /
      intervals.length
    );
  }, [intervals, criticalValue, sigma, n]);

  // SVG coordinates
  const svgW = 620;
  const svgH = 380;
  const padL = 40;
  const padR = 24;
  const padT = 28;
  const padB = 34;
  const xMin = 30;
  const xMax = 70;
  const toX = (x: number) =>
    padL + ((Math.max(xMin, Math.min(xMax, x)) - xMin) / (xMax - xMin)) * (svgW - padL - padR);

  const rowHeight = (svgH - padT - padB) / Math.max(1, intervals.length);
  const firstInterval = intervals[0];

  return (
    <section
      aria-label="100-Sample Confidence Interval Coverage Simulator"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-6 space-y-5"
    >
      {/* Header + Confidence Level */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-grid)] block">
            Interactive Laboratory S.4.2 • Fixed True μ = 50 vs. Dancing Random Intervals
          </span>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            100-Sample Confidence Interval Coverage Simulator
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {([0.8, 0.9, 0.95, 0.99] as ConfLevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setConfLevel(lvl)}
              className={`px-2.5 py-1.5 border text-xs font-tabular-mono cursor-pointer ${
                confLevel === lvl
                  ? "border-[var(--math-ink-y)] bg-[#96B898]/20 text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
              }`}
            >
              {Math.round(lvl * 100)}% CI
            </button>
          ))}
        </div>
      </div>

      {/* Parameter Sliders + Method Switch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <label className="lg:col-span-3 p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-x)] font-semibold">Sample Size (n)</span>
            <span className="tabular-nums font-semibold">n = {n}</span>
          </div>
          <input
            type="range"
            min={3}
            max={100}
            step={1}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            aria-label="Sample size n"
            className="w-full accent-[#8D9FCE] cursor-pointer"
          />
          <span className="text-[11px] font-tabular-mono text-[var(--text-muted)] block">
            Try n = 4 vs n = 64 (4× width cut at 16× n!)
          </span>
        </label>

        <label className="lg:col-span-3 p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-sweep)] font-semibold">True Pop SD (σ)</span>
            <span className="tabular-nums font-semibold">σ = {sigma}</span>
          </div>
          <input
            type="range"
            min={4}
            max={20}
            step={1}
            value={sigma}
            onChange={(e) => setSigma(Number(e.target.value))}
            aria-label="Population standard deviation sigma"
            className="w-full accent-[#D35323] cursor-pointer"
          />
        </label>

        <div className="lg:col-span-6 p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex flex-col justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "student_t" as const, label: "Student's t (s estimated)" },
              { id: "z_known" as const, label: "Normal Z (σ known)" },
              { id: "naive_z_trap" as const, label: "Naive Z with s (Trap!)" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`px-2.5 py-1 border text-[11px] font-tabular-mono cursor-pointer ${
                  method === m.id
                    ? "border-[var(--math-ink-z)] bg-[#029091]/20 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => generateBatch(100, true)}
                className="px-3 py-1 border border-[var(--math-ink-y)] bg-[#96B898]/15 text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] cursor-pointer"
              >
                Draw 100 Samples
              </button>
              <button
                type="button"
                onClick={() => generateBatch(500, false)}
                className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--math-ink-x)] text-xs font-tabular-mono cursor-pointer"
              >
                +500 Long-Run
              </button>
            </div>
            <span className="text-xs font-tabular-mono tabular-nums text-[var(--text-secondary)]">
              Critical Mult: <strong>{criticalValue.toFixed(3)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main 100-Interval Coverage Stack + Readouts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono tabular-nums">
            <span className="text-[var(--text-secondary)]">
              100 Independent Confidence Intervals (Sage = Captures μ, Crimson = Misses)
            </span>
            <span className="font-semibold text-[var(--math-ink-y)]">
              Visible Hits: {visibleHits}/{intervals.length} ({intervals.length > 0 ? Math.round((visibleHits / intervals.length) * 100) : 0}%)
            </span>
          </div>

          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            role="img"
            aria-label={`100 simulated confidence intervals around fixed true mean 50 showing ${visibleHits} captures and ${intervals.length - visibleHits} misses.`}
            className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
          >
            {/* Axis Grid */}
            {[30, 40, 50, 60, 70].map((tick) => {
              const px = toX(tick);
              const isMu = tick === TRUE_MU;
              return (
                <g key={tick}>
                  <line
                    x1={px}
                    x2={px}
                    y1={padT - 8}
                    y2={svgH - padB + 4}
                    stroke={isMu ? "#AAA36D" : "var(--border-subtle)"}
                    strokeWidth={isMu ? 2 : 0.8}
                    strokeDasharray={isMu ? "5 3" : "2 3"}
                  />
                  <text
                    x={px}
                    y={svgH - 10}
                    textAnchor="middle"
                    fontSize={10}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight={isMu ? 700 : 400}
                    fill={isMu ? "var(--math-ink-grid)" : "var(--text-muted)"}
                  >
                    {isMu ? `μ = ${TRUE_MU}` : tick}
                  </text>
                </g>
              );
            })}

            {/* Stacked 100 Horizontal Intervals */}
            {intervals.map((iv, idx) => {
              const y = padT + (idx + 0.5) * rowHeight;
              const x1 = toX(iv.lower);
              const x2 = toX(iv.upper);
              const xc = toX(iv.xbar);
              const color = iv.captured ? "#96B898" : "#B95869";
              return (
                <g key={iv.id}>
                  <line
                    x1={x1}
                    x2={x2}
                    y1={y}
                    y2={y}
                    stroke={color}
                    strokeWidth={iv.captured ? 1.5 : 2.1}
                    strokeOpacity={iv.captured ? 0.85 : 1}
                  />
                  <circle
                    cx={xc}
                    cy={y}
                    r={iv.captured ? 1.5 : 2.2}
                    fill={color}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right 4 Cols: Coverage Audit & Anatomy */}
        <div className="xl:col-span-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
              <span className="text-[10px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
                Cumulative Long-Run Capture Rate
              </span>
              <div className="text-xl font-tabular-mono tabular-nums font-semibold text-[var(--text-primary)]">
                {cumulativeTotal > 0
                  ? `${((cumulativeHits / cumulativeTotal) * 100).toFixed(1)}%`
                  : "—"}{" "}
                <span className="text-xs font-normal text-[var(--text-secondary)]">
                  ({cumulativeHits}/{cumulativeTotal})
                </span>
              </div>
              <span className="text-[11px] font-tabular-mono text-[var(--math-ink-y)] block">
                Nominal Target: {Math.round(confLevel * 100)}.0%
              </span>
            </div>

            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
              <span className="text-[10px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
                Top Interval Breakdown (#1)
              </span>
              <div className="text-xs font-tabular-mono tabular-nums text-[var(--text-primary)]">
                {firstInterval ? (
                  <>
                    [{fmt(firstInterval.lower, 2)}, {fmt(firstInterval.upper, 2)}]{" "}
                    <span
                      className={
                        firstInterval.captured
                          ? "text-[var(--math-ink-y)] font-semibold"
                          : "text-[var(--math-ink-diff)] font-semibold"
                      }
                    >
                      ({firstInterval.captured ? "HIT μ" : "MISSED μ"})
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </div>
              <div className="text-xs overflow-x-auto pt-1">
                <KaTeXMath
                  math={`\\text{Avg Half-Width (ME)} \\approx ${fmt(avgHalfWidth, 2)}`}
                  block
                />
              </div>
            </div>
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs font-math-serif text-[var(--text-secondary)] space-y-1.5 leading-relaxed">
            <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
              {method === "naive_z_trap"
                ? "TRAP EXPOSED: WHY Z FAILS AT SMALL n"
                : "WHAT '95% CONFIDENCE' ACTUALLY MEANS"}
            </span>
            <p>
              {method === "naive_z_trap"
                ? "Notice how plugging noisy sample s into a Z multiplier under-covers true μ when n is small (try n = 4!). Switching to Student's t widens the multiplier from 1.96 to 3.18 so coverage snaps right back to 95%!"
                : "True μ = 50 never moves! What fluctuates is each new random sample's center x̄ and width. Over repeated experiments, ~95% of those random brackets trap the stationary target."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
