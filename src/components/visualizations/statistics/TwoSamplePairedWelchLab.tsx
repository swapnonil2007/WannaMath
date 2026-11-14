"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  createSeededRng,
  normalPdf,
  sampleMean,
  sampleNormal,
  sampleStdDev,
  sampleVariance,
  studentTCdf,
  studentTInvCdf,
} from "./statMath";

type LabMode = "paired" | "welch";

function fmt(n: number, digits = 2): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.5.1 — Paired Before–After Slopegraph vs. Independent Welch's t-Test & Cohen's d Lab.
 */
export function TwoSamplePairedWelchLab() {
  const [mode, setMode] = useState<LabMode>("paired");
  const [seed, setSeed] = useState<number>(1);

  // Paired controls
  const [treatmentShift, setTreatmentShift] = useState<number>(3.5);
  const [baselineNoise, setBaselineNoise] = useState<number>(8.5);

  // Independent Welch controls
  const [groupDiff, setGroupDiff] = useState<number>(3.2);
  const [n1, setN1] = useState<number>(16);
  const [n2, setN2] = useState<number>(22);
  const [sd1, setSd1] = useState<number>(2.5);
  const [sd2, setSd2] = useState<number>(6.0);

  // Deterministic Paired dataset
  const pairedData = useMemo(() => {
    const rng = createSeededRng(20260501 + seed * 313);
    const n = 12;
    const subjects = Array.from({ length: n }, () => {
      const zBase = sampleNormal(rng, 0, 1);
      const zNoise = sampleNormal(rng, 0, 1);
      const before = 50 + baselineNoise * zBase;
      const after = before + treatmentShift + 1.8 * zNoise;
      return { before, after, diff: after - before };
    });

    const beforeArr = subjects.map((s) => s.before);
    const afterArr = subjects.map((s) => s.after);
    const diffArr = subjects.map((s) => s.diff);

    const meanDiff = sampleMean(diffArr);
    const sdDiff = Math.max(1e-4, sampleStdDev(diffArr, 1));
    const sePaired = sdDiff / Math.sqrt(n);
    const tPaired = meanDiff / sePaired;
    const pPaired = 2 * (1 - studentTCdf(Math.abs(tPaired), n - 1));

    // Compare against wrongly treating these same clouds as independent!
    const v1 = sampleVariance(beforeArr, 1);
    const v2 = sampleVariance(afterArr, 1);
    const seUnpaired = Math.sqrt(v1 / n + v2 / n);
    const tUnpaired = (sampleMean(afterArr) - sampleMean(beforeArr)) / Math.max(1e-4, seUnpaired);
    const numDf = (v1 / n + v2 / n) ** 2;
    const denDf = (v1 / n) ** 2 / (n - 1) + (v2 / n) ** 2 / (n - 1);
    const dfUnpaired = Math.max(1, numDf / Math.max(1e-8, denDf));
    const pUnpaired = 2 * (1 - studentTCdf(Math.abs(tUnpaired), dfUnpaired));

    return {
      subjects,
      n,
      meanDiff,
      sdDiff,
      sePaired,
      tPaired,
      pPaired,
      seUnpaired,
      tUnpaired,
      pUnpaired,
    };
  }, [seed, treatmentShift, baselineNoise]);

  // Deterministic Independent Welch dataset
  const welchData = useMemo(() => {
    const rng = createSeededRng(20260502 + seed * 509);
    const g1 = Array.from({ length: n1 }, () => 50 + sd1 * sampleNormal(rng, 0, 1));
    const g2 = Array.from(
      { length: n2 },
      () => 50 + groupDiff + sd2 * sampleNormal(rng, 0, 1)
    );

    const m1 = sampleMean(g1);
    const m2 = sampleMean(g2);
    const s1 = Math.max(1e-4, sampleStdDev(g1, 1));
    const s2 = Math.max(1e-4, sampleStdDev(g2, 1));
    const v1 = s1 * s1;
    const v2 = s2 * s2;

    const diff = m2 - m1;
    const seWelch = Math.sqrt(v1 / n1 + v2 / n2);
    const tWelch = diff / seWelch;

    const numDf = (v1 / n1 + v2 / n2) ** 2;
    const denDf = (v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1);
    const dfWelch = Math.max(1, numDf / Math.max(1e-8, denDf));
    const pWelch = 2 * (1 - studentTCdf(Math.abs(tWelch), dfWelch));

    const tCrit = studentTInvCdf(0.975, dfWelch);
    const ciLow = diff - tCrit * seWelch;
    const ciHigh = diff + tCrit * seWelch;

    const sPooled = Math.sqrt(
      ((n1 - 1) * v1 + (n2 - 1) * v2) / Math.max(1, n1 + n2 - 2)
    );
    const cohensD = diff / Math.max(1e-4, sPooled);

    return {
      g1,
      g2,
      m1,
      m2,
      s1,
      s2,
      diff,
      seWelch,
      tWelch,
      dfWelch,
      pWelch,
      ciLow,
      ciHigh,
      cohensD,
    };
  }, [seed, groupDiff, n1, n2, sd1, sd2]);

  // Plotting coordinates
  const svgW = 540;
  const svgH = 260;
  const yMin = 24;
  const yMax = 78;
  const toY = (v: number) =>
    26 + ((yMax - Math.max(yMin, Math.min(yMax, v))) / (yMax - yMin)) * (svgH - 56);

  return (
    <section
      aria-label="Paired Before-After vs Independent Welch t-Test Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-6 space-y-5"
    >
      {/* Header + Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
            Interactive Laboratory S.5.1 • Canceling Baseline Noise vs. Unpooled Variance
          </span>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Two-Group Comparisons: Paired <KaTeXMath math="t" /> vs. Welch&apos;s <KaTeXMath math="t" /> &amp; Cohen&apos;s <KaTeXMath math="d" />
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode("paired")}
            className={`px-3 py-1.5 border text-xs font-tabular-mono cursor-pointer ${
              mode === "paired"
                ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/20 text-[var(--text-primary)] font-semibold"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
            }`}
          >
            1. Paired Before–After Slopegraph
          </button>
          <button
            type="button"
            onClick={() => setMode("welch")}
            className={`px-3 py-1.5 border text-xs font-tabular-mono cursor-pointer ${
              mode === "welch"
                ? "border-[var(--math-ink-z)] bg-[#029091]/20 text-[var(--text-primary)] font-semibold"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
            }`}
          >
            2. Independent Welch&apos;s t &amp; Cohen&apos;s d
          </button>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="px-2.5 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--math-ink-y)] text-xs font-tabular-mono cursor-pointer"
          >
            Resample
          </button>
        </div>
      </div>

      {mode === "paired" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
              <div className="flex justify-between text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-z)] font-semibold">True Treatment Gain (δ)</span>
                <span className="tabular-nums font-semibold">+{treatmentShift.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={8}
                step={0.2}
                value={treatmentShift}
                onChange={(e) => setTreatmentShift(Number(e.target.value))}
                aria-label="True treatment gain delta"
                className="w-full accent-[#029091] cursor-pointer"
              />
            </label>

            <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
              <div className="flex justify-between text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-sweep)] font-semibold">Between-Person Baseline Spread</span>
                <span className="tabular-nums font-semibold">σ_person = {baselineNoise.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={1}
                max={14}
                step={0.5}
                value={baselineNoise}
                onChange={(e) => setBaselineNoise(Number(e.target.value))}
                aria-label="Between-person baseline spread"
                className="w-full accent-[#D35323] cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-7 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-tabular-mono">
                <span className="text-[var(--text-secondary)]">
                  Slopegraph (n = 12 Subjects): Every Line Subtracts Personal Baseline!
                </span>
                <span className="text-[var(--math-ink-z)] font-semibold">
                  Mean d̄ = +{fmt(pairedData.meanDiff, 2)}
                </span>
              </div>

              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                role="img"
                aria-label={`Paired slopegraph connecting 12 subjects before and after treatment with average gain ${fmt(pairedData.meanDiff, 2)}.`}
                className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
              >
                {/* Reference horizontal grid lines */}
                {[30, 40, 50, 60, 70].map((v) => (
                  <g key={v}>
                    <line x1={48} x2={svgW - 20} y1={toY(v)} y2={toY(v)} stroke="var(--border-subtle)" strokeDasharray="3 3" strokeWidth={0.8} />
                    <text x={40} y={toY(v) + 3} textAnchor="end" fontSize={9.5} fontFamily="JetBrains Mono, monospace" fill="var(--text-muted)">
                      {v}
                    </text>
                  </g>
                ))}

                {/* Left column = Before, Middle column = After, Right inset = Differences d_i */}
                <text x={135} y={18} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={600} fill="var(--math-ink-x)">
                  Before
                </text>
                <text x={285} y={18} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={600} fill="var(--math-ink-z)">
                  After
                </text>
                <text x={435} y={18} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={600} fill="var(--math-ink-y)">
                  Paired Δ = After − Before
                </text>

                {pairedData.subjects.map((sub, idx) => {
                  const y1 = toY(sub.before);
                  const y2 = toY(sub.after);
                  const positive = sub.diff >= 0;
                  // Map diff in [-10, +14] onto vertical axis around baseline 50
                  const yDiff = toY(50 + sub.diff * 1.4);
                  return (
                    <g key={idx}>
                      <line
                        x1={135}
                        y1={y1}
                        x2={285}
                        y2={y2}
                        stroke={positive ? "#029091" : "#B95869"}
                        strokeWidth={1.7}
                        strokeOpacity={0.78}
                      />
                      <circle cx={135} cy={y1} r={3.6} fill="#8D9FCE" />
                      <circle cx={285} cy={y2} r={3.6} fill="#029091" />
                      {/* Difference bar centered at baseline 50 */}
                      <circle cx={410 + (idx % 4) * 16} cy={yDiff} r={3.5} fill={positive ? "#96B898" : "#B95869"} />
                    </g>
                  );
                })}

                {/* Zero-difference baseline on right inset */}
                <line x1={375} x2={495} y1={toY(50)} y2={toY(50)} stroke="#AAA36D" strokeDasharray="4 3" strokeWidth={1.3} />
                <text x={372} y={toY(50) + 3} textAnchor="end" fontSize={9.5} fontFamily="JetBrains Mono, monospace" fill="var(--math-ink-grid)">
                  Δ=0
                </text>
              </svg>
            </div>

            <div className="xl:col-span-5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="p-3 border border-[var(--math-ink-z)] bg-[#029091]/10 space-y-1">
                  <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] font-semibold block">
                    Correct: Paired t-Test on Differences dᵢ
                  </span>
                  <div className="text-sm font-tabular-mono tabular-nums font-semibold text-[var(--text-primary)]">
                    t = {fmt(pairedData.tPaired, 2)} | SE = {fmt(pairedData.sePaired, 2)} | p ={" "}
                    {pairedData.pPaired < 0.0001 ? "< 0.0001" : pairedData.pPaired.toFixed(4)}
                  </div>
                </div>

                <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
                  <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] font-semibold block">
                    Trap: Unpaired t-Test on Same Raw Clouds
                  </span>
                  <div className="text-sm font-tabular-mono tabular-nums font-semibold text-[var(--text-primary)]">
                    t = {fmt(pairedData.tUnpaired, 2)} | SE = {fmt(pairedData.seUnpaired, 2)} | p ={" "}
                    {pairedData.pUnpaired < 0.0001 ? "< 0.0001" : pairedData.pUnpaired.toFixed(4)}
                  </div>
                </div>
              </div>

              <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
                Crank <strong>Between-Person Baseline Spread</strong> up to <code>14.0</code>! The unpaired
                test drowns in person-to-person noise (<KaTeXMath math="p &gt; 0.30" />), yet subtracting
                each person&apos;s own baseline cancels that noise completely—keeping the paired test razor sharp!
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
              <div className="flex justify-between text-[11px] font-tabular-mono">
                <span className="text-[var(--math-ink-z)] font-semibold">True Diff μ₂−μ₁</span>
                <span className="tabular-nums">+{groupDiff.toFixed(1)}</span>
              </div>
              <input type="range" min={-2} max={10} step={0.2} value={groupDiff} onChange={(e) => setGroupDiff(Number(e.target.value))} aria-label="True mean difference" className="w-full accent-[#029091] cursor-pointer" />
            </label>
            <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
              <div className="flex justify-between text-[11px] font-tabular-mono">
                <span className="text-[var(--math-ink-x)]">Group 1 (n₁)</span>
                <span className="tabular-nums">{n1}</span>
              </div>
              <input type="range" min={5} max={50} step={1} value={n1} onChange={(e) => setN1(Number(e.target.value))} aria-label="Group 1 sample size" className="w-full accent-[#8D9FCE] cursor-pointer" />
            </label>
            <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
              <div className="flex justify-between text-[11px] font-tabular-mono">
                <span className="text-[var(--math-ink-x)]">Group 1 SD (σ₁)</span>
                <span className="tabular-nums">{sd1.toFixed(1)}</span>
              </div>
              <input type="range" min={1} max={10} step={0.5} value={sd1} onChange={(e) => setSd1(Number(e.target.value))} aria-label="Group 1 standard deviation" className="w-full accent-[#8D9FCE] cursor-pointer" />
            </label>
            <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
              <div className="flex justify-between text-[11px] font-tabular-mono">
                <span className="text-[var(--math-ink-sweep)]">Group 2 (n₂)</span>
                <span className="tabular-nums">{n2}</span>
              </div>
              <input type="range" min={5} max={50} step={1} value={n2} onChange={(e) => setN2(Number(e.target.value))} aria-label="Group 2 sample size" className="w-full accent-[#D35323] cursor-pointer" />
            </label>
            <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
              <div className="flex justify-between text-[11px] font-tabular-mono">
                <span className="text-[var(--math-ink-sweep)]">Group 2 SD (σ₂)</span>
                <span className="tabular-nums">{sd2.toFixed(1)}</span>
              </div>
              <input type="range" min={1} max={12} step={0.5} value={sd2} onChange={(e) => setSd2(Number(e.target.value))} aria-label="Group 2 standard deviation" className="w-full accent-[#D35323] cursor-pointer" />
            </label>
          </div>

          {/* Overlapping Group Bells & Readout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-7 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
              <div className="flex justify-between text-xs font-tabular-mono tabular-nums">
                <span className="text-[var(--text-secondary)]">
                  Empirical Spreads &amp; Bell Overlap (Cohen&apos;s d = {fmt(welchData.cohensD, 2)})
                </span>
                <span className="font-semibold text-[var(--math-ink-z)]">
                  x̄₂ − x̄₁ = {fmt(welchData.diff, 2)}
                </span>
              </div>

              <svg
                viewBox="0 0 520 220"
                role="img"
                aria-label={`Welch two-sample group comparison with mean difference ${fmt(welchData.diff, 2)} and Cohen's d ${fmt(welchData.cohensD, 2)}.`}
                className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
              >
                {(() => {
                  const xMin = 30;
                  const xMax = 80;
                  const toX = (v: number) => 28 + ((Math.max(xMin, Math.min(xMax, v)) - xMin) / (xMax - xMin)) * 464;
                  const peak = Math.max(normalPdf(welchData.m1, welchData.m1, welchData.s1), normalPdf(welchData.m2, welchData.m2, welchData.s2)) * 1.15;
                  const toPdfY = (d: number) => 176 - Math.min(1, d / peak) * 145;
                  let p1 = "";
                  let p2 = "";
                  for (let i = 0; i <= 140; i++) {
                    const xv = xMin + (i / 140) * (xMax - xMin);
                    const cmd = i === 0 ? "M" : "L";
                    p1 += `${cmd} ${toX(xv).toFixed(1)} ${toPdfY(normalPdf(xv, welchData.m1, welchData.s1)).toFixed(1)} `;
                    p2 += `${cmd} ${toX(xv).toFixed(1)} ${toPdfY(normalPdf(xv, welchData.m2, welchData.s2)).toFixed(1)} `;
                  }
                  return (
                    <>
                      <line x1={28} x2={492} y1={176} y2={176} stroke="var(--border-strong)" strokeWidth={1} />
                      <path d={p1} fill="#8D9FCE" fillOpacity={0.18} stroke="#8D9FCE" strokeWidth={2.1} />
                      <path d={p2} fill="#D35323" fillOpacity={0.18} stroke="#D35323" strokeWidth={2.1} />
                      {welchData.g1.slice(0, 30).map((x, idx) => (
                        <circle key={`a-${idx}`} cx={toX(x)} cy={186 + (idx % 2) * 5} r={2.3} fill="#8D9FCE" />
                      ))}
                      {welchData.g2.slice(0, 30).map((x, idx) => (
                        <circle key={`b-${idx}`} cx={toX(x)} cy={198 + (idx % 2) * 5} r={2.3} fill="#D35323" />
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            <div className="xl:col-span-5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 grid grid-cols-2 gap-2.5 text-xs font-tabular-mono tabular-nums content-between">
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Welch t-Statistic</span>
                <span className="text-base font-semibold text-[var(--text-primary)]">{fmt(welchData.tWelch, 2)}</span>
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Welch df (Fractional!)</span>
                <span className="text-base font-semibold text-[var(--math-ink-x)]">{fmt(welchData.dfWelch, 1)}</span>
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Two-Tailed p-Value</span>
                <span className="text-base font-semibold text-[var(--math-ink-sweep)]">
                  {welchData.pWelch < 0.0001 ? "< 0.0001" : welchData.pWelch.toFixed(4)}
                </span>
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Cohen&apos;s d Effect</span>
                <span className="text-base font-semibold text-[var(--math-ink-y)]">{fmt(welchData.cohensD, 2)}</span>
              </div>
              <div className="col-span-2 p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] text-[var(--text-muted)] block">95% CI of (μ₂ − μ₁)</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  [{fmt(welchData.ciLow, 2)}, {fmt(welchData.ciHigh, 2)}]
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
