"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";
import {
  computeL1Loss,
  computeL2Loss,
  estimateModeFromKde,
  sampleMean,
  sampleMedian,
  trimmedMean,
} from "./statMath";

type SeesawPresetId = "symmetric" | "billionaire" | "leftskew" | "bimodal";

interface SeesawPreset {
  id: SeesawPresetId;
  label: string;
  base: number[];
  outlierEnabled: boolean;
  outlierVal: number;
  note: string;
}

const SEESAW_PRESETS: SeesawPreset[] = [
  {
    id: "billionaire",
    label: "Coffee Shop + Outlier",
    base: [4, 4.5, 5, 5, 5.5, 6, 6, 6.5, 7, 7.5, 8],
    outlierEnabled: true,
    outlierVal: 22.5,
    note: "Slide the Persimmon outlier toward 25: the Mean fulcrum chases it across the beam, while the Median stays locked inside the crowd!",
  },
  {
    id: "symmetric",
    label: "Symmetric Cluster",
    base: [8, 9, 10, 10.5, 11, 11, 11.5, 12, 12, 13, 14],
    outlierEnabled: false,
    outlierVal: 22,
    note: "When data is symmetric and clean, Mean ≈ Median ≈ Mode all agree on the exact same center.",
  },
  {
    id: "leftskew",
    label: "Left-Skewed (Easy Exam)",
    base: [4, 7, 10, 13, 15.5, 16, 17, 17.5, 18, 18.5, 19, 19.5],
    outlierEnabled: false,
    outlierVal: 2,
    note: "A few low scores pull the Mean to the left of the Median (Mean < Median < Mode).",
  },
  {
    id: "bimodal",
    label: "Two-Peak Split",
    base: [4.5, 5, 5, 5.5, 6, 16, 16.5, 17, 17, 17.5],
    outlierEnabled: false,
    outlierVal: 23,
    note: "Notice that both Mean and Median sit in the empty valley (~11) where NO actual data points live—always plot first!",
  },
];

function fmt(n: number, digits = 2): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.1.2 — Center-of-Mass Seesaw & L1/L2 Loss Minimizer Lab.
 * Demonstrates mechanical torque balance at the Mean, outlier resistance of
 * the Median, and why Mean minimizes squared error while Median minimizes absolute error.
 */
export function MeanMedianSeesawLab() {
  const [presetId, setPresetId] = useState<SeesawPresetId>("billionaire");
  const [basePoints, setBasePoints] = useState<number[]>(
    SEESAW_PRESETS[0].base
  );
  const [outlierEnabled, setOutlierEnabled] = useState<boolean>(
    SEESAW_PRESETS[0].outlierEnabled
  );
  const [outlierVal, setOutlierVal] = useState<number>(
    SEESAW_PRESETS[0].outlierVal
  );
  const [trimPct, setTrimPct] = useState<number>(0.1);
  const [candidateC, setCandidateC] = useState<number>(8.0);

  const activePreset = useMemo(
    () => SEESAW_PRESETS.find((p) => p.id === presetId) ?? SEESAW_PRESETS[0],
    [presetId]
  );

  const applyPreset = (id: SeesawPresetId) => {
    const p = SEESAW_PRESETS.find((item) => item.id === id) ?? SEESAW_PRESETS[0];
    setPresetId(id);
    setBasePoints([...p.base]);
    setOutlierEnabled(p.outlierEnabled);
    setOutlierVal(p.outlierVal);
    setCandidateC(Number(sampleMean(p.base).toFixed(1)));
  };

  const allPoints = useMemo(
    () => (outlierEnabled ? [...basePoints, outlierVal] : basePoints),
    [basePoints, outlierEnabled, outlierVal]
  );

  const stats = useMemo(() => {
    const mean = sampleMean(allPoints);
    const median = sampleMedian(allPoints);
    const trim = trimmedMean(allPoints, trimPct);
    const mode = estimateModeFromKde(allPoints, 0, 25, 1.3);

    let leftTorque = 0;
    let rightTorque = 0;
    for (const x of allPoints) {
      const diff = x - mean;
      if (diff < 0) leftTorque += diff;
      else rightTorque += diff;
    }

    const gridC = Array.from({ length: 101 }, (_, i) => (i / 100) * 25);
    const l2Vals = gridC.map((c) => computeL2Loss(allPoints, c) / Math.max(1, allPoints.length));
    const l1Vals = gridC.map((c) => computeL1Loss(allPoints, c) / Math.max(1, allPoints.length));
    const maxL2 = Math.max(10, ...l2Vals);
    const maxL1 = Math.max(4, ...l1Vals);

    const candL2 = computeL2Loss(allPoints, candidateC) / Math.max(1, allPoints.length);
    const candL1 = computeL1Loss(allPoints, candidateC) / Math.max(1, allPoints.length);

    // Group base points into 0.5-unit stack bins for neat physical blocks
    const stacks = new Map<number, number>();
    for (const x of basePoints) {
      const snapped = Math.round(x * 2) / 2;
      stacks.set(snapped, (stacks.get(snapped) ?? 0) + 1);
    }

    return {
      mean,
      median,
      trim,
      mode,
      leftTorque,
      rightTorque,
      netTorque: leftTorque + rightTorque,
      gridC,
      l2Vals,
      l1Vals,
      maxL2,
      maxL1,
      candL2,
      candL1,
      stacks: Array.from(stacks.entries()),
    };
  }, [allPoints, basePoints, trimPct, candidateC]);

  const handleBeamClick = (worldX: number) => {
    const snapped = Math.max(0.5, Math.min(24.5, Math.round(worldX * 2) / 2));
    setBasePoints((prev) => [...prev, snapped]);
  };

  return (
    <section
      id="mean-median-seesaw-balance"
      aria-label="Center-of-Mass Seesaw and L1/L2 Loss Minimizer Lab"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 sm:p-6 space-y-6"
    >
      {/* Header & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
            LAB S.1.2 • CENTER OF MASS VS. MIDDLE RANK
          </span>
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
            The Mean Seesaw &amp; L₁ / L₂ Error Geometry Lab
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif">
            {activePreset.note}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SEESAW_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={`px-3 py-1.5 text-xs font-tabular-mono border transition-colors cursor-pointer ${
                presetId === p.id
                  ? "bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-strong)] font-semibold"
                  : "bg-[var(--bg-panel-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4">
        {/* Persimmon Outlier Drag Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <label htmlFor="s12-outlier" className="text-[var(--math-ink-sweep)] font-semibold">
              Outlier Weight Position
            </label>
            <button
              type="button"
              onClick={() => setOutlierEnabled((v) => !v)}
              className={`px-2 py-0.5 text-[11px] border cursor-pointer ${
                outlierEnabled
                  ? "border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[var(--bg-panel)]"
                  : "border-[var(--border-subtle)] text-[var(--text-muted)] bg-[var(--bg-panel)]"
              }`}
            >
              {outlierEnabled ? `Active: x = ${fmt(outlierVal, 1)}` : "Outlier: OFF"}
            </button>
          </div>
          <input
            id="s12-outlier"
            type="range"
            min={0}
            max={25}
            step={0.5}
            value={outlierVal}
            disabled={!outlierEnabled}
            onChange={(e) => setOutlierVal(Number(e.target.value))}
            className="w-full accent-[#D35323] cursor-pointer disabled:opacity-40"
          />
          <p className="text-[11px] text-[var(--text-muted)] font-math-serif">
            Lever arm from mean:{" "}
            <span className="font-tabular-mono text-[var(--math-ink-sweep)]">
              {outlierEnabled ? `${outlierVal - stats.mean >= 0 ? "+" : ""}${fmt(outlierVal - stats.mean, 2)}` : "—"}
            </span>
          </p>
        </div>

        {/* Candidate Center c Scrubber */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <label htmlFor="s12-cand" className="text-[var(--text-secondary)]">
              Test Guess <span className="text-[var(--math-ink-lower)]">c</span>
            </label>
            <span className="text-[var(--text-primary)] font-semibold">
              c = {fmt(candidateC, 1)}
            </span>
          </div>
          <input
            id="s12-cand"
            type="range"
            min={0}
            max={25}
            step={0.2}
            value={candidateC}
            onChange={(e) => setCandidateC(Number(e.target.value))}
            className="w-full accent-[#D5658B] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--text-muted)]">
            <span>L₁(c): {fmt(stats.candL1, 2)}</span>
            <span>L₂(c): {fmt(stats.candL2, 2)}</span>
          </div>
        </div>

        {/* Trimmed Mean & Sample Actions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <label htmlFor="s12-trim" className="text-[var(--text-secondary)]">
              Trim Proportion
            </label>
            <span className="text-[var(--math-ink-y)] font-semibold">
              {Math.round(trimPct * 100)}% each tail
            </span>
          </div>
          <input
            id="s12-trim"
            type="range"
            min={0}
            max={0.25}
            step={0.05}
            value={trimPct}
            onChange={(e) => setTrimPct(Number(e.target.value))}
            className="w-full accent-[#96B898] cursor-pointer"
          />
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() =>
                setBasePoints((prev) => (prev.length > 2 ? prev.slice(0, -1) : prev))
              }
              className="px-2.5 py-1 text-[11px] font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] hover:border-[var(--border-strong)] cursor-pointer"
            >
              Remove Last
            </button>
            <button
              type="button"
              onClick={() => applyPreset(presetId)}
              className="px-2.5 py-1 text-[11px] font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] hover:border-[var(--border-strong)] cursor-pointer"
            >
              Reset Beam
            </button>
          </div>
        </div>
      </div>

      {/* Top Panel: Physical Seesaw Balance Beam */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
          <span className="text-[var(--text-primary)] font-semibold">
            1. Physical Balance Beam (Click anywhere along [0, 25] to drop a 1-unit block)
          </span>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="text-[var(--math-ink-z)]">▲ Mean Fulcrum</span>
            <span className="text-[var(--math-ink-grid)]">◆ Median</span>
            <span className="text-[var(--math-ink-y)]">● Trimmed Mean</span>
            <span className="text-[var(--math-ink-sweep)]">■ Outlier</span>
          </div>
        </div>

        <SvgCoordinatePlane2D
          xRange={[0, 25]}
          yRange={[-1.4, 5.2]}
          width={920}
          height={240}
          padding={34}
          xLabel="x"
          yLabel=""
          gridDivisions={10}
          ariaLabel="Physical seesaw balance beam showing stacked data blocks, the mean fulcrum balancing left and right torques, median diamond, trimmed mean, and draggable outlier"
          onSelectPoint={handleBeamClick}
          className="w-full h-56 border border-[var(--border-subtle)] bg-[var(--bg-panel)] select-none"
        >
          {({ toSvgX, toSvgY }) => {
            const beamY = toSvgY(0);
            const meanX = toSvgX(stats.mean);
            const medX = toSvgX(stats.median);
            const trimX = toSvgX(stats.trim);

            return (
              <g>
                {/* Horizontal Beam Plank */}
                <line
                  x1={toSvgX(0)}
                  y1={beamY}
                  x2={toSvgX(25)}
                  y2={beamY}
                  stroke="var(--text-primary)"
                  strokeWidth={4}
                />

                {/* Fulcrum Triangle at Mean */}
                <polygon
                  points={`${meanX},${beamY + 2} ${meanX - 11},${beamY + 22} ${meanX + 11},${beamY + 22}`}
                  fill="#029091"
                  stroke="#1E1F22"
                  strokeWidth={1.2}
                />
                <text
                  x={meanX}
                  y={beamY + 35}
                  textAnchor="middle"
                  fill="var(--math-ink-z)"
                  fontSize="10.5"
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                >
                  x̄={fmt(stats.mean, 2)}
                </text>

                {/* Median Diamond Marker */}
                <polygon
                  points={`${medX},${toSvgY(4.5)} ${medX + 7},${toSvgY(4.15)} ${medX},${toSvgY(3.8)} ${medX - 7},${toSvgY(4.15)}`}
                  fill="#AAA36D"
                  stroke="#1E1F22"
                  strokeWidth={1.1}
                />
                <line
                  x1={medX}
                  y1={toSvgY(3.8)}
                  x2={medX}
                  y2={beamY}
                  stroke="#AAA36D"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                />
                <text
                  x={medX}
                  y={toSvgY(4.75)}
                  textAnchor="middle"
                  fill="var(--math-ink-grid)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  Med={fmt(stats.median, 2)}
                </text>

                {/* Trimmed Mean Circle */}
                <circle
                  cx={trimX}
                  cy={toSvgY(3.2)}
                  r={4.5}
                  fill="#96B898"
                  stroke="#1E1F22"
                  strokeWidth={1}
                />

                {/* Stacked Data Weight Blocks */}
                {stats.stacks.map(([val, count]) =>
                  Array.from({ length: count }, (_, idx) => {
                    const bx = toSvgX(val) - 7;
                    const by = toSvgY((idx + 1) * 0.65) - 2;
                    return (
                      <rect
                        key={`${val}-${idx}`}
                        x={bx}
                        y={by}
                        width={14}
                        height={14}
                        fill="#8D9FCE"
                        fillOpacity={0.85}
                        stroke="#1E1F22"
                        strokeWidth={1}
                      />
                    );
                  })
                )}

                {/* Draggable Outlier Block + Lever Arm */}
                {outlierEnabled && (
                  <g>
                    <line
                      x1={meanX}
                      y1={toSvgY(1.35)}
                      x2={toSvgX(outlierVal)}
                      y2={toSvgY(1.35)}
                      stroke="#D35323"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                    />
                    <rect
                      x={toSvgX(outlierVal) - 9}
                      y={toSvgY(0.85)}
                      width={18}
                      height={18}
                      fill="#D35323"
                      stroke="#1E1F22"
                      strokeWidth={1.3}
                    />
                  </g>
                )}

                {/* Number-line Tick Labels */}
                {[0, 5, 10, 15, 20, 25].map((t) => (
                  <text
                    key={t}
                    x={toSvgX(t)}
                    y={beamY + 14}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="9.5"
                    fontFamily="var(--font-mono)"
                  >
                    {t}
                  </text>
                ))}
              </g>
            );
          }}
        </SvgCoordinatePlane2D>
      </div>

      {/* Bottom Panel: L2 (Mean) vs L1 (Median) Loss Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <span className="text-[var(--text-primary)] font-semibold">
              2. Optimization Proof: Why Mean Minimizes L₂ and Median Minimizes L₁
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-[var(--math-ink-z)]">━ L₂(c) Squared Loss</span>
              <span className="text-[var(--math-ink-grid)]">━ L₁(c) Absolute Loss</span>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={[0, 25]}
            yRange={[0, 1.08]}
            width={620}
            height={220}
            padding={34}
            xLabel="c"
            yLabel="Norm. Loss"
            ariaLabel="Normalized L2 squared loss curve bottoming at the mean and L1 absolute loss curve bottoming at the median"
            className="w-full h-52 border border-[var(--border-subtle)] bg-[var(--bg-panel)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const l2Path = stats.gridC
                .map((c, i) => {
                  const normY = stats.l2Vals[i] / stats.maxL2;
                  return `${i === 0 ? "M" : "L"} ${toSvgX(c).toFixed(1)} ${toSvgY(normY).toFixed(1)}`;
                })
                .join(" ");

              const l1Path = stats.gridC
                .map((c, i) => {
                  const normY = stats.l1Vals[i] / stats.maxL1;
                  return `${i === 0 ? "M" : "L"} ${toSvgX(c).toFixed(1)} ${toSvgY(normY).toFixed(1)}`;
                })
                .join(" ");

              const minL2Norm =
                (computeL2Loss(allPoints, stats.mean) /
                  Math.max(1, allPoints.length)) /
                stats.maxL2;
              const minL1Norm =
                (computeL1Loss(allPoints, stats.median) /
                  Math.max(1, allPoints.length)) /
                stats.maxL1;

              return (
                <g>
                  <path d={l2Path} fill="none" stroke="#029091" strokeWidth={2.3} />
                  <path d={l1Path} fill="none" stroke="#AAA36D" strokeWidth={2.3} />

                  {/* Candidate c Vertical Probe */}
                  <line
                    x1={toSvgX(candidateC)}
                    y1={toSvgY(0)}
                    x2={toSvgX(candidateC)}
                    y2={toSvgY(1.04)}
                    stroke="#D5658B"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                  />

                  {/* Minimum Markers */}
                  <circle
                    cx={toSvgX(stats.mean)}
                    cy={toSvgY(minL2Norm)}
                    r={4.5}
                    fill="#029091"
                    stroke="#1E1F22"
                    strokeWidth={1}
                  />
                  <circle
                    cx={toSvgX(stats.median)}
                    cy={toSvgY(minL1Norm)}
                    r={4.5}
                    fill="#AAA36D"
                    stroke="#1E1F22"
                    strokeWidth={1}
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Live Telemetry & Torque Proof Card */}
        <div className="lg:col-span-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 flex flex-col justify-between gap-3">
          <div className="space-y-2.5">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
              Live Center Telemetry (n = {allPoints.length})
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
                  Mean (Fulcrum)
                </span>
                <span className="text-sm font-tabular-mono font-semibold text-[var(--math-ink-z)]">
                  {fmt(stats.mean, 2)}
                </span>
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
                  Median (50%)
                </span>
                <span className="text-sm font-tabular-mono font-semibold text-[var(--math-ink-grid)]">
                  {fmt(stats.median, 2)}
                </span>
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
                  {Math.round(trimPct * 100)}% Trimmed Mean
                </span>
                <span className="text-sm font-tabular-mono font-semibold text-[var(--math-ink-y)]">
                  {fmt(stats.trim, 2)}
                </span>
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] block">
                  Est. Mode (Peak)
                </span>
                <span className="text-sm font-tabular-mono font-semibold text-[var(--math-ink-lower)]">
                  {fmt(stats.mode, 2)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5 text-xs font-tabular-mono">
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">
              Torque Balance Proof <KaTeXMath math="\sum(x_i - \bar{x}) = 0" />
            </span>
            <div className="flex justify-between">
              <span className="text-[var(--math-ink-x)]">Left Σ(xᵢ − x̄):</span>
              <span>{fmt(stats.leftTorque, 2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--math-ink-sweep)]">Right Σ(xᵢ − x̄):</span>
              <span>+{fmt(stats.rightTorque, 2)}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--border-subtle)] pt-1 font-semibold">
              <span>Net Torque:</span>
              <span className="text-[var(--math-ink-z)]">
                {fmt(stats.netTorque, 4)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
