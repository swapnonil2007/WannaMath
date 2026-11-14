"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  createSeededRng,
  fisherFPdf,
  fisherFPValue,
  sampleMean,
  sampleNormal,
} from "./statMath";

const GROUP_META = [
  { label: "Group A", short: "A", color: "#8D9FCE" },
  { label: "Group B", short: "B", color: "#96B898" },
  { label: "Group C", short: "C", color: "#029091" },
  { label: "Group D", short: "D", color: "#D5658B" },
] as const;

function fmt(n: number, digits = 2): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.5.3 — One-Way ANOVA: Between-Group Signal vs. Within-Group Noise,
 * Variance Decomposition (SST = SSB + SSW), Skewed F-Distribution Tail,
 * and Multiple-Comparisons Family-Wise Error Rate Meter.
 */
export function AnovaBetweenWithinLab() {
  const [numGroups, setNumGroups] = useState<3 | 4>(3);
  const [betweenSignal, setBetweenSignal] = useState<number>(4.2);
  const [withinNoise, setWithinNoise] = useState<number>(3.6);
  const [seed, setSeed] = useState<number>(1);

  // Interactive Multiple Comparisons (FWER) meter state
  const [compareGroups, setCompareGroups] = useState<number>(5);
  const [alphaLevel, setAlphaLevel] = useState<0.05 | 0.01>(0.05);

  const nPerGroup = 10;

  // Generate fixed underlying standard-normal noise for smooth slider updates
  const baseZ = useMemo(() => {
    const rng = createSeededRng(20260503 + seed * 401);
    return Array.from({ length: 4 }, () =>
      Array.from({ length: nPerGroup }, () => sampleNormal(rng, 0, 1))
    );
  }, [seed]);

  const anova = useMemo(() => {
    const offsets =
      numGroups === 3 ? [-1, 0, 1] : [-1.5, -0.5, 0.5, 1.5];

    const groups = offsets.map((offset, gIdx) => {
      const trueMean = 50 + offset * betweenSignal;
      const values = baseZ[gIdx].map((z) => trueMean + withinNoise * z);
      const mean = sampleMean(values);
      return {
        ...GROUP_META[gIdx],
        values,
        mean,
      };
    });

    const allValues = groups.flatMap((g) => g.values);
    const grandMean = sampleMean(allValues);
    const totalN = allValues.length;
    const dfBetween = numGroups - 1;
    const dfWithin = totalN - numGroups;

    const ssb = groups.reduce(
      (acc, g) => acc + g.values.length * (g.mean - grandMean) ** 2,
      0
    );
    const ssw = groups.reduce(
      (acc, g) =>
        acc + g.values.reduce((s, y) => s + (y - g.mean) ** 2, 0),
      0
    );
    const sst = ssb + ssw;
    const msb = ssb / dfBetween;
    const msw = Math.max(1e-6, ssw / dfWithin);
    const fStat = msb / msw;
    const pValue = fisherFPValue(fStat, dfBetween, dfWithin);
    const etaSq = sst > 1e-8 ? ssb / sst : 0;

    return {
      groups,
      grandMean,
      totalN,
      dfBetween,
      dfWithin,
      ssb,
      ssw,
      sst,
      msb,
      msw,
      fStat,
      pValue,
      etaSq,
    };
  }, [baseZ, numGroups, betweenSignal, withinNoise]);

  // SVG 1: Group Dot Plot & Signal/Noise Brackets
  const plotW = 540;
  const plotH = 290;
  const yMin = 24;
  const yMax = 76;
  const toPlotY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return (
      plotH - 34 - ((clamped - yMin) / (yMax - yMin)) * (plotH - 60)
    );
  };

  // SVG 2: F-Distribution Curve
  const fW = 380;
  const fH = 225;
  const fChart = useMemo(() => {
    const xMax = Math.max(7.5, Math.min(18, anova.fStat + 2.2));
    const steps = 160;
    const pts: Array<{ x: number; pdf: number }> = [];
    let maxPdf = 0.05;

    for (let i = 0; i <= steps; i++) {
      const x = 0.03 + ((xMax - 0.03) * i) / steps;
      const pdf = fisherFPdf(x, anova.dfBetween, anova.dfWithin);
      if (Number.isFinite(pdf)) {
        maxPdf = Math.max(maxPdf, pdf);
        pts.push({ x, pdf });
      }
    }

    const toSvgX = (x: number) => 38 + (x / xMax) * (fW - 56);
    const toSvgY = (y: number) =>
      fH - 34 - (y / (maxPdf * 1.12)) * (fH - 58);

    const curvePath = pts
      .map(
        (pt, idx) =>
          `${idx === 0 ? "M" : "L"}${toSvgX(pt.x).toFixed(2)},${toSvgY(
            pt.pdf
          ).toFixed(2)}`
      )
      .join(" ");

    const fClamped = Math.min(xMax, anova.fStat);
    const tailPts = pts.filter((pt) => pt.x >= fClamped);
    let tailPath = "";
    if (tailPts.length > 0) {
      const startY = fisherFPdf(
        Math.max(0.03, fClamped),
        anova.dfBetween,
        anova.dfWithin
      );
      const baseLineY = toSvgY(0);
      tailPath =
        `M${toSvgX(fClamped).toFixed(2)},${baseLineY.toFixed(2)} ` +
        `L${toSvgX(fClamped).toFixed(2)},${toSvgY(startY).toFixed(2)} ` +
        tailPts
          .map(
            (pt) =>
              `L${toSvgX(pt.x).toFixed(2)},${toSvgY(pt.pdf).toFixed(2)}`
          )
          .join(" ") +
        ` L${toSvgX(xMax).toFixed(2)},${baseLineY.toFixed(2)} Z`;
    }

    return {
      xMax,
      curvePath,
      tailPath,
      fX: toSvgX(fClamped),
      offChartRight: anova.fStat > xMax,
      baseY: toSvgY(0),
      ticks: Array.from(
        { length: 5 },
        (_, i) => Math.round(((xMax * i) / 4) * 10) / 10
      ),
    };
  }, [anova.dfBetween, anova.dfWithin, anova.fStat]);

  // Multiple-comparisons calculations
  const numPairs = (compareGroups * (compareGroups - 1)) / 2;
  const fwer = 1 - (1 - alphaLevel) ** numPairs;
  const bonfAlpha = alphaLevel / numPairs;

  const ssbPct = anova.sst > 1e-8 ? (anova.ssb / anova.sst) * 100 : 0;
  const sswPct = 100 - ssbPct;
  const isSignificant = anova.pValue < 0.05;

  return (
    <div className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4 sm:p-5 space-y-5">
      {/* Header + Group Count + Resample Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div className="space-y-0.5">
          <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] font-semibold block">
            Interactive Variance Decomposition Workbench
          </span>
          <p className="text-xs font-math-serif text-[var(--text-secondary)]">
            Separate true group shifts from random scatter inside each group, then track how the{" "}
            <KaTeXMath math="F" />-ratio reacts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            {([3, 4] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setNumGroups(k)}
                className={`px-3 py-1.5 text-xs font-tabular-mono transition-colors ${
                  numGroups === k
                    ? "bg-[var(--accent-primary)] text-[var(--bg-canvas)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {k} Groups
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="px-3 py-1.5 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors"
          >
            New Sample
          </button>
          <button
            type="button"
            onClick={() => {
              setNumGroups(3);
              setBetweenSignal(4.2);
              setWithinNoise(3.6);
              setSeed(1);
              setCompareGroups(5);
              setAlphaLevel(0.05);
            }}
            className="px-3 py-1.5 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Signal & Noise Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-sweep)] font-semibold">
              Between-Group Signal (Mean Separation)
            </span>
            <span className="tabular-nums font-semibold">
              {betweenSignal.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={12}
            step={0.2}
            value={betweenSignal}
            onChange={(e) => setBetweenSignal(Number(e.target.value))}
            aria-label="Between-group signal mean separation"
            className="w-full accent-[#D35323] cursor-pointer"
          />
          <p className="text-[11px] font-math-serif text-[var(--text-muted)]">
            Pushes group centers apart (grows <KaTeXMath math="\text{SSB}" /> and{" "}
            <KaTeXMath math="\text{MSB}" />). Set to <code className="font-tabular-mono">0.0</code>{" "}
            to simulate a true null hypothesis <KaTeXMath math="H_0" />.
          </p>
        </label>

        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-x)] font-semibold">
              Within-Group Noise (Random Scatter σ)
            </span>
            <span className="tabular-nums font-semibold">
              {withinNoise.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min={1.2}
            max={10.0}
            step={0.2}
            value={withinNoise}
            onChange={(e) => setWithinNoise(Number(e.target.value))}
            aria-label="Within-group noise standard deviation"
            className="w-full accent-[#8D9FCE] cursor-pointer"
          />
          <p className="text-[11px] font-math-serif text-[var(--text-muted)]">
            Spreads dots vertically inside each group (grows <KaTeXMath math="\text{SSW}" /> and{" "}
            <KaTeXMath math="\text{MSW}" />, masking group differences).
          </p>
        </label>
      </div>

      {/* Main Split Stage: Group Dot Plot + F-Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left: Group Dot Plot + Variance Decomposition Bar */}
        <div className="xl:col-span-7 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-tabular-mono">
            <span className="uppercase tracking-wider text-[var(--text-muted)]">
              Observations, Group Means &amp; Grand Mean (n = {nPerGroup}/group, N = {anova.totalN})
            </span>
            <span className="text-[var(--math-ink-grid)]">
              Grand Mean ȳ = <strong className="tabular-nums">{fmt(anova.grandMean, 2)}</strong>
            </span>
          </div>

          <svg
            viewBox={`0 0 ${plotW} ${plotH}`}
            className="w-full h-auto block"
            role="img"
            aria-label={`One-way ANOVA dot plot across ${numGroups} groups showing grand mean ${fmt(
              anova.grandMean
            )} and group means`}
          >
            {/* Horizontal grid lines */}
            {[30, 40, 50, 60, 70].map((v) => (
              <g key={v}>
                <line
                  x1={42}
                  x2={plotW - 14}
                  y1={toPlotY(v)}
                  y2={toPlotY(v)}
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 3"
                  strokeWidth={0.8}
                />
                <text
                  x={36}
                  y={toPlotY(v) + 3.5}
                  textAnchor="end"
                  fontSize={9.5}
                  fontFamily="JetBrains Mono, monospace"
                  fill="var(--text-muted)"
                >
                  {v}
                </text>
              </g>
            ))}

            {/* Grand mean reference line */}
            <line
              x1={42}
              x2={plotW - 14}
              y1={toPlotY(anova.grandMean)}
              y2={toPlotY(anova.grandMean)}
              stroke="#AAA36D"
              strokeWidth={1.6}
              strokeDasharray="5 3"
            />
            <text
              x={plotW - 18}
              y={toPlotY(anova.grandMean) - 5}
              textAnchor="end"
              fontSize={9.5}
              fontFamily="JetBrains Mono, monospace"
              fill="#AAA36D"
            >
              Grand Mean ȳ = {fmt(anova.grandMean, 1)}
            </text>

            {/* Groups */}
            {anova.groups.map((grp, gIdx) => {
              const colSpan = (plotW - 76) / numGroups;
              const cx = 56 + colSpan * (gIdx + 0.5);
              const meanY = toPlotY(grp.mean);
              const grandY = toPlotY(anova.grandMean);

              return (
                <g key={grp.short}>
                  {/* Between-group signal vertical bracket from Grand Mean to Group Mean */}
                  <line
                    x1={cx - 32}
                    x2={cx - 32}
                    y1={grandY}
                    y2={meanY}
                    stroke="#D35323"
                    strokeWidth={2.2}
                  />
                  <circle cx={cx - 32} cy={meanY} r={2.8} fill="#D35323" />

                  {/* Raw observations & residual drop lines to group mean */}
                  {grp.values.map((val, i) => {
                    const jitter = ((i % 5) - 2) * 8.5 + (i >= 5 ? 3 : -3);
                    const px = cx + jitter;
                    const py = toPlotY(val);
                    return (
                      <g key={i}>
                        <line
                          x1={px}
                          x2={px}
                          y1={py}
                          y2={meanY}
                          stroke={grp.color}
                          strokeOpacity={0.35}
                          strokeWidth={1.1}
                        />
                        <circle
                          cx={px}
                          cy={py}
                          r={3.5}
                          fill={grp.color}
                          fillOpacity={0.85}
                        />
                      </g>
                    );
                  })}

                  {/* Group Mean Thick Horizontal Bar */}
                  <line
                    x1={cx - 26}
                    x2={cx + 26}
                    y1={meanY}
                    y2={meanY}
                    stroke={grp.color}
                    strokeWidth={3.2}
                  />

                  {/* Group label + numeric mean at bottom */}
                  <text
                    x={cx}
                    y={plotH - 12}
                    textAnchor="middle"
                    fontSize={11}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight={600}
                    fill={grp.color}
                  >
                    {grp.label} ({fmt(grp.mean, 1)})
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Stacked Variance Decomposition Bar: SST = SSB + SSW */}
          <div className="space-y-2 pt-1 border-t border-[var(--border-subtle)]">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-tabular-mono">
              <span className="font-semibold text-[var(--text-primary)]">
                Variance Split: SST = SSB + SSW = {fmt(anova.sst, 1)}
              </span>
              <span className="text-[var(--math-ink-z)] font-semibold tabular-nums">
                η² (Effect Explained) = {(anova.etaSq * 100).toFixed(1)}%
              </span>
            </div>

            <div className="w-full h-6 border border-[var(--border-subtle)] flex overflow-hidden font-tabular-mono text-[11px]">
              <div
                style={{
                  width: `${Math.max(4, ssbPct)}%`,
                  backgroundColor: "#D35323",
                }}
                className="h-full flex items-center justify-center text-[#FFFBE4] font-semibold px-1.5 whitespace-nowrap"
                title={`SSB = ${fmt(anova.ssb, 1)}`}
              >
                {ssbPct >= 14 ? `SSB ${ssbPct.toFixed(0)}%` : ""}
              </div>
              <div
                style={{
                  width: `${Math.max(4, sswPct)}%`,
                  backgroundColor: "#8D9FCE",
                }}
                className="h-full flex items-center justify-center text-[#1E1F22] font-semibold px-1.5 whitespace-nowrap"
                title={`SSW = ${fmt(anova.ssw, 1)}`}
              >
                {sswPct >= 14 ? `SSW ${sswPct.toFixed(0)}%` : ""}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] font-tabular-mono tabular-nums">
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="block text-[var(--math-ink-sweep)]">
                  Signal: MSB = SSB / {anova.dfBetween}
                </span>
                <strong className="text-sm">{fmt(anova.msb, 1)}</strong>{" "}
                <span className="text-[var(--text-muted)]">({fmt(anova.ssb, 1)})</span>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="block text-[var(--math-ink-x)]">
                  Noise: MSW = SSW / {anova.dfWithin}
                </span>
                <strong className="text-sm">{fmt(anova.msw, 1)}</strong>{" "}
                <span className="text-[var(--text-muted)]">({fmt(anova.ssw, 1)})</span>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="block text-[var(--math-ink-z)]">
                  F = MSB / MSW
                </span>
                <strong className="text-sm">{fmt(anova.fStat, 2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Skewed F-Distribution Curve + ANOVA Verdict */}
        <div className="xl:col-span-5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-tabular-mono">
              <span className="uppercase tracking-wider text-[var(--text-muted)]">
                Skewed F({anova.dfBetween}, {anova.dfWithin}) Reference Curve
              </span>
              <span
                className={`px-2 py-0.5 border font-semibold tabular-nums ${
                  isSignificant
                    ? "border-[#B95869] text-[#B95869] bg-[#B95869]/10"
                    : "border-[#029091] text-[#029091] bg-[#029091]/10"
                }`}
              >
                p = {anova.pValue < 0.0001 ? "< 0.0001" : anova.pValue.toFixed(4)}
              </span>
            </div>

            <svg
              viewBox={`0 0 ${fW} ${fH}`}
              className="w-full h-auto block"
              role="img"
              aria-label={`F distribution curve with ${anova.dfBetween} and ${anova.dfWithin} degrees of freedom showing F statistic ${fmt(
                anova.fStat,
                2
              )}`}
            >
              {/* Baseline */}
              <line
                x1={38}
                x2={fW - 18}
                y1={fChart.baseY}
                y2={fChart.baseY}
                stroke="var(--border-subtle)"
                strokeWidth={1.2}
              />

              {/* Shaded p-value tail */}
              {fChart.tailPath && (
                <path d={fChart.tailPath} fill="#B95869" fillOpacity={0.34} />
              )}

              {/* F curve */}
              <path
                d={fChart.curvePath}
                fill="none"
                stroke="#029091"
                strokeWidth={2.2}
              />

              {/* Observed F marker */}
              <line
                x1={fChart.fX}
                x2={fChart.fX}
                y1={20}
                y2={fChart.baseY}
                stroke="#D35323"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
              <text
                x={Math.min(fW - 55, Math.max(66, fChart.fX))}
                y={15}
                textAnchor="middle"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
                fill="#D35323"
              >
                {fChart.offChartRight
                  ? `F = ${fmt(anova.fStat, 1)} →`
                  : `F = ${fmt(anova.fStat, 2)}`}
              </text>

              {/* X-axis ticks */}
              {fChart.ticks.map((t, i) => {
                const tx = 38 + (t / fChart.xMax) * (fW - 56);
                return (
                  <g key={i}>
                    <line
                      x1={tx}
                      x2={tx}
                      y1={fChart.baseY}
                      y2={fChart.baseY + 4}
                      stroke="var(--text-muted)"
                    />
                    <text
                      x={tx}
                      y={fChart.baseY + 16}
                      textAnchor="middle"
                      fontSize={9.5}
                      fontFamily="JetBrains Mono, monospace"
                      fill="var(--text-muted)"
                    >
                      {t.toFixed(1)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div
            className={`p-3 border space-y-1.5 ${
              isSignificant
                ? "border-[#B95869] bg-[#B95869]/10"
                : "border-[#029091] bg-[#029091]/10"
            }`}
          >
            <div className="text-xs font-tabular-mono font-semibold text-[var(--text-primary)]">
              {isSignificant
                ? "Reject H₀: At least one group mean differs!"
                : "Fail to reject H₀: Group differences could be chance scatter"}
            </div>
            <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
              Notice that <KaTeXMath math="F" /> is strictly right-skewed and always ≥ 0 because
              it is a ratio of two squared variances. Under a true null hypothesis (try Signal =
              0.0), <KaTeXMath math="\text{MSB} \approx \text{MSW}" />, so{" "}
              <KaTeXMath math="F" /> hovers near <code className="font-tabular-mono">1.0</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Section: Multiple Comparisons & Family-Wise Error Rate Meter */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] font-semibold block">
              Why Not Just Run Many Separate t-Tests? — Family-Wise Error Rate Meter
            </span>
            <p className="text-xs font-math-serif text-[var(--text-secondary)]">
              Even when ALL groups are truly identical, testing every pair inflates your chance of at least one false alarm.
            </p>
          </div>

          <div className="inline-flex border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
            {([0.05, 0.01] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAlphaLevel(a)}
                className={`px-2.5 py-1 text-xs font-tabular-mono ${
                  alphaLevel === a
                    ? "bg-[var(--accent-primary)] text-[var(--bg-canvas)] font-semibold"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                α = {a}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <label className="md:col-span-5 space-y-1.5 block">
            <div className="flex justify-between text-xs font-tabular-mono">
              <span>Number of Groups to Compare (k)</span>
              <span className="font-semibold tabular-nums">
                k = {compareGroups} → m = {numPairs} pairs
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={8}
              step={1}
              value={compareGroups}
              onChange={(e) => setCompareGroups(Number(e.target.value))}
              aria-label="Number of groups in pairwise comparisons"
              className="w-full accent-[#D35323] cursor-pointer"
            />
          </label>

          <div className="md:col-span-7 space-y-2">
            <div className="flex justify-between text-xs font-tabular-mono tabular-nums">
              <span>
                Uncorrected False Alarm Risk: <KaTeXMath math="1 - (1 - \alpha)^m" />
              </span>
              <strong
                className={
                  fwer > 0.15
                    ? "text-[#B95869]"
                    : "text-[var(--math-ink-z)]"
                }
              >
                {(fwer * 100).toFixed(1)}%
              </strong>
            </div>
            <div className="w-full h-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-hidden">
              <div
                style={{
                  width: `${Math.min(100, fwer * 100)}%`,
                  backgroundColor: fwer > 0.15 ? "#B95869" : "#029091",
                }}
                className="h-full transition-all"
              />
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-[11px] font-tabular-mono tabular-nums text-[var(--text-muted)]">
              <span>
                Pairwise tests: {compareGroups}×{compareGroups - 1}/2 = {numPairs}
              </span>
              <span className="text-[var(--math-ink-z)] font-semibold">
                Bonferroni fix: test each pair at α/m = {bonfAlpha.toFixed(4)} (or Tukey HSD after ANOVA!)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
