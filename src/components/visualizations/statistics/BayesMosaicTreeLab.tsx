"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";

type ScenarioId = "medical" | "spam" | "sensor" | "prosecutor";
type ViewMode = "grid1000" | "mosaic";

interface BayesPreset {
  id: ScenarioId;
  label: string;
  hLabel: string;
  notHLabel: string;
  eLabel: string;
  notELabel: string;
  priorPct: number;
  sensitivityPct: number;
  fprPct: number;
  story: string;
}

const PRESETS: BayesPreset[] = [
  {
    id: "medical",
    label: "Rare Disease Screening (1%)",
    hLabel: "Has Condition (H)",
    notHLabel: "Healthy (Hᶜ)",
    eLabel: "Test Positive (E⁺)",
    notELabel: "Test Negative (E⁻)",
    priorPct: 1,
    sensitivityPct: 95,
    fprPct: 5,
    story:
      "Even with 95% sensitivity and 95% specificity (5% false positives), in 1,000 people there are ~50 false positives vs. ~10 true positives—so a single positive test is only ~16.1% likely to be real!",
  },
  {
    id: "spam",
    label: "Spam Filter (20% Spam)",
    hLabel: "Spam Email (H)",
    notHLabel: "Normal Email (Hᶜ)",
    eLabel: "Contains 'URGENT' (E⁺)",
    notELabel: "No Trigger Word (E⁻)",
    priorPct: 20,
    sensitivityPct: 85,
    fprPct: 4,
    story:
      "Because spam is reasonably common (20%) and normal mail rarely hits the trigger (4%), Bayes boosts confidence from 20% to ~84%!",
  },
  {
    id: "sensor",
    label: "Aircraft Sensor Fault (3%)",
    hLabel: "Faulty Valve (H)",
    notHLabel: "Normal Valve (Hᶜ)",
    eLabel: "Warning Light (E⁺)",
    notELabel: "No Warning (E⁻)",
    priorPct: 3,
    sensitivityPct: 98,
    fprPct: 2,
    story:
      "High reliability (2% false alarm rate) lifts a 3% fault base rate to ~60.2% posterior fault probability upon one warning.",
  },
  {
    id: "prosecutor",
    label: "Prosecutor's Fallacy (0.2%)",
    hLabel: "Guilty Match (H)",
    notHLabel: "Innocent Coincidence (Hᶜ)",
    eLabel: "Lab Match (E⁺)",
    notELabel: "No Match (E⁻)",
    priorPct: 0.2,
    sensitivityPct: 99.8,
    fprPct: 0.5,
    story:
      "Confusing P(Match | Innocent) = 0.5% with P(Innocent | Match) ignores that in a huge suspect pool, accidental matches still outnumber true matches!",
  },
];

function fmtPct(prob: number, digits = 1): string {
  return `${(prob * 100).toFixed(digits)}%`;
}

function fmtCount(n: number): string {
  return n >= 10 ? n.toFixed(1) : n.toFixed(2);
}

/**
 * S.2.2 — Bayes' Theorem Frequency Mosaic & Probability Tree Lab.
 * Shows 1,000 people as discrete icons alongside an exact Marimekko mosaic
 * and forward probability tree to cure base-rate neglect visually.
 */
export function BayesMosaicTreeLab() {
  const [presetId, setPresetId] = useState<ScenarioId>("medical");
  const [priorPct, setPriorPct] = useState<number>(1);
  const [sensitivityPct, setSensitivityPct] = useState<number>(95);
  const [fprPct, setFprPct] = useState<number>(5);
  const [zoomConditioned, setZoomConditioned] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid1000");
  const [applySecondTest, setApplySecondTest] = useState<boolean>(false);

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId]
  );

  const selectPreset = (id: ScenarioId) => {
    const p = PRESETS.find((item) => item.id === id) ?? PRESETS[0];
    setPresetId(id);
    setPriorPct(p.priorPct);
    setSensitivityPct(p.sensitivityPct);
    setFprPct(p.fprPct);
    setApplySecondTest(false);
  };

  // Exact probabilities
  const basePrior = priorPct / 100;
  const sens = sensitivityPct / 100;
  const fpr = fprPct / 100;

  const pTP1 = basePrior * sens;
  const pFN1 = basePrior * (1 - sens);
  const pFP1 = (1 - basePrior) * fpr;
  const pTN1 = (1 - basePrior) * (1 - fpr);
  const pEvidence1 = pTP1 + pFP1;
  const posterior1 = pEvidence1 > 1e-12 ? pTP1 / pEvidence1 : 0;

  // Optional 2nd independent positive test using Posterior 1 as the new Prior
  const activePrior = applySecondTest ? posterior1 : basePrior;
  const pTP = activePrior * sens;
  const pFN = activePrior * (1 - sens);
  const pFP = (1 - activePrior) * fpr;
  const pTN = (1 - activePrior) * (1 - fpr);
  const pEvidence = pTP + pFP;
  const posterior = pEvidence > 1e-12 ? pTP / pEvidence : 0;

  // Integer allocation across 1,000 people using largest-remainder rounding
  const gridCells = useMemo(() => {
    const N = 1000;
    const raw = [
      { key: "TP" as const, exact: pTP * N },
      { key: "FN" as const, exact: pFN * N },
      { key: "FP" as const, exact: pFP * N },
      { key: "TN" as const, exact: pTN * N },
    ];
    const floors = raw.map((r) => ({
      key: r.key,
      count: Math.floor(r.exact),
      rem: r.exact - Math.floor(r.exact),
    }));
    let remaining = N - floors.reduce((s, f) => s + f.count, 0);
    const sortedByRem = [...floors].sort((a, b) => b.rem - a.rem);
    for (let i = 0; i < sortedByRem.length && remaining > 0; i++) {
      sortedByRem[i].count++;
      remaining--;
    }
    const counts: Record<"TP" | "FN" | "FP" | "TN", number> = {
      TP: 0,
      FN: 0,
      FP: 0,
      TN: 0,
    };
    floors.forEach((f) => {
      counts[f.key] = f.count;
    });

    const cells: Array<"TP" | "FN" | "FP" | "TN"> = [];
    for (let i = 0; i < counts.TP; i++) cells.push("TP");
    for (let i = 0; i < counts.FN; i++) cells.push("FN");
    for (let i = 0; i < counts.FP; i++) cells.push("FP");
    for (let i = 0; i < counts.TN; i++) cells.push("TN");
    return { cells, counts };
  }, [pTP, pFN, pFP, pTN]);

  const mosaicW = 280;
  const mosaicH = 190;
  const mosaicX = 56;
  const mosaicY = 22;
  const hSplit = mosaicX + Math.max(3, activePrior * mosaicW);
  const tpHeight = pEvidence > 0 ? sens * mosaicH : 0;
  const fpHeight = fpr * mosaicH;

  return (
    <section
      aria-label="Bayes Theorem Frequency Mosaic and Probability Tree Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-6 space-y-5"
    >
      {/* Header + Scenario Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-lower)] block">
            Interactive Laboratory S.2.2 • Shrinking the Sample Space to Observed Evidence
          </span>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Bayes&apos; Theorem: 1,000-Person Frequency Grid &amp; Probability Tree
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPreset(p.id)}
              className={`px-2.5 py-1.5 border text-xs font-tabular-mono cursor-pointer transition-colors ${
                presetId === p.id
                  ? "border-[var(--math-ink-lower)] bg-[#D5658B]/15 text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parameter Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-lower)] font-semibold">
              Prior Prevalence P(H)
            </span>
            <span className="tabular-nums font-semibold text-[var(--text-primary)]">
              {priorPct.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={0.2}
            max={50}
            step={0.2}
            value={priorPct}
            onChange={(e) => setPriorPct(Number(e.target.value))}
            aria-label="Prior prevalence probability P of H in percent"
            className="w-full accent-[#D5658B] cursor-pointer"
          />
          <span className="text-[11px] font-tabular-mono text-[var(--text-muted)] block">
            {preset.hLabel}: ~{fmtCount(basePrior * 1000)} in 1,000
          </span>
        </label>

        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-y)] font-semibold">
              Sensitivity P(E⁺ | H)
            </span>
            <span className="tabular-nums font-semibold text-[var(--text-primary)]">
              {sensitivityPct.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={0.5}
            value={sensitivityPct}
            onChange={(e) => setSensitivityPct(Number(e.target.value))}
            aria-label="Sensitivity true positive rate in percent"
            className="w-full accent-[#96B898] cursor-pointer"
          />
          <span className="text-[11px] font-tabular-mono text-[var(--text-muted)] block">
            True Detection when H is real
          </span>
        </label>

        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-sweep)] font-semibold">
              False-Positive Rate P(E⁺ | Hᶜ)
            </span>
            <span className="tabular-nums font-semibold text-[var(--text-primary)]">
              {fprPct.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={0.2}
            max={35}
            step={0.2}
            value={fprPct}
            onChange={(e) => setFprPct(Number(e.target.value))}
            aria-label="False positive rate in percent"
            className="w-full accent-[#D35323] cursor-pointer"
          />
          <span className="text-[11px] font-tabular-mono text-[var(--text-muted)] block">
            False alarm among healthy Hᶜ
          </span>
        </label>
      </div>

      {/* Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomConditioned((v) => !v)}
            className={`px-3 py-1.5 border text-xs font-tabular-mono font-semibold cursor-pointer transition-colors ${
              zoomConditioned
                ? "border-[var(--math-ink-sweep)] bg-[#D35323]/20 text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] hover:border-[var(--math-ink-sweep)]"
            }`}
          >
            {zoomConditioned
              ? "Conditioning ON: Showing Only Evidence E⁺ Pool"
              : "Zoom Into Evidence E⁺ (Dim All E⁻ People)"}
          </button>

          <button
            type="button"
            onClick={() => setApplySecondTest((v) => !v)}
            className={`px-3 py-1.5 border text-xs font-tabular-mono cursor-pointer transition-colors ${
              applySecondTest
                ? "border-[var(--math-ink-z)] bg-[#029091]/20 text-[var(--text-primary)] font-semibold"
                : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {applySecondTest
              ? `2nd Independent Positive Test Applied (Prior = ${fmtPct(posterior1)})`
              : "+ Apply 2nd Independent Positive Test"}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode("grid1000")}
            className={`px-2.5 py-1 border text-xs font-tabular-mono cursor-pointer ${
              viewMode === "grid1000"
                ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/20 text-[var(--text-primary)] font-semibold"
                : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-muted)]"
            }`}
          >
            1,000-Person Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode("mosaic")}
            className={`px-2.5 py-1 border text-xs font-tabular-mono cursor-pointer ${
              viewMode === "mosaic"
                ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/20 text-[var(--text-primary)] font-semibold"
                : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-muted)]"
            }`}
          >
            Unit-Square Mosaic
          </button>
        </div>
      </div>

      {/* Main Synchronized Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left Visual: 1,000-Person Grid OR Unit-Square Mosaic */}
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--text-secondary)]">
              {viewMode === "grid1000"
                ? "1,000-Person Natural Frequency Population (Each Square = 1 Person)"
                : "Exact Area Mosaic (Width = Prior, Height = Test Rate)"}
            </span>
            <span className="tabular-nums font-semibold text-[var(--math-ink-lower)]">
              P(H | E⁺) = {fmtPct(posterior)}
            </span>
          </div>

          {viewMode === "grid1000" ? (
            <svg
              viewBox="0 0 408 262"
              role="img"
              aria-label={`1000-person frequency grid: ${gridCells.counts.TP} true positives, ${gridCells.counts.FN} false negatives, ${gridCells.counts.FP} false positives, ${gridCells.counts.TN} true negatives.`}
              className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
            >
              {gridCells.cells.map((cell, idx) => {
                const col = idx % 40;
                const row = Math.floor(idx / 40);
                const x = 6 + col * 9.9;
                const y = 6 + row * 9.9;
                const isEvidence = cell === "TP" || cell === "FP";
                let fill = "#35383F";
                if (cell === "TP") fill = "#D5658B";
                else if (cell === "FN") fill = "#AAA36D";
                else if (cell === "FP") fill = "#D35323";

                const opacity = zoomConditioned
                  ? isEvidence
                    ? 0.95
                    : 0.12
                  : cell === "TN"
                  ? 0.48
                  : 0.92;

                return (
                  <rect
                    key={idx}
                    x={x}
                    y={y}
                    width={7.8}
                    height={7.8}
                    fill={fill}
                    fillOpacity={opacity}
                    stroke={isEvidence ? "var(--bg-panel)" : "none"}
                    strokeWidth={0.4}
                  />
                );
              })}
            </svg>
          ) : (
            <svg
              viewBox="0 0 380 245"
              role="img"
              aria-label={`Marimekko unit-square mosaic showing prior P(H)=${fmtPct(activePrior)}, true positives ${fmtPct(pTP)}, false positives ${fmtPct(pFP)}.`}
              className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
            >
              {/* True Positives (H ∩ E+) */}
              <rect
                x={mosaicX}
                y={mosaicY}
                width={Math.max(0, hSplit - mosaicX)}
                height={tpHeight}
                fill="#D5658B"
                fillOpacity={0.92}
                stroke="var(--bg-panel)"
                strokeWidth={1}
              />
              {/* False Negatives (H ∩ E-) */}
              <rect
                x={mosaicX}
                y={mosaicY + tpHeight}
                width={Math.max(0, hSplit - mosaicX)}
                height={Math.max(0, mosaicH - tpHeight)}
                fill="#AAA36D"
                fillOpacity={zoomConditioned ? 0.12 : 0.72}
                stroke="var(--bg-panel)"
                strokeWidth={1}
              />
              {/* False Positives (Hᶜ ∩ E+) */}
              <rect
                x={hSplit}
                y={mosaicY}
                width={Math.max(0, mosaicX + mosaicW - hSplit)}
                height={fpHeight}
                fill="#D35323"
                fillOpacity={0.85}
                stroke="var(--bg-panel)"
                strokeWidth={1}
              />
              {/* True Negatives (Hᶜ ∩ E-) */}
              <rect
                x={hSplit}
                y={mosaicY + fpHeight}
                width={Math.max(0, mosaicX + mosaicW - hSplit)}
                height={Math.max(0, mosaicH - fpHeight)}
                fill="#8D9FCE"
                fillOpacity={zoomConditioned ? 0.08 : 0.24}
                stroke="var(--bg-panel)"
                strokeWidth={1}
              />

              <rect
                x={mosaicX}
                y={mosaicY}
                width={mosaicW}
                height={mosaicH}
                fill="none"
                stroke="var(--border-strong)"
                strokeWidth={1.4}
              />

              <text
                x={hSplit}
                y={14}
                textAnchor="middle"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
                fill="var(--math-ink-lower)"
              >
                Prior P(H) = {fmtPct(activePrior)}
              </text>
              <text
                x={mosaicX + mosaicW / 2}
                y={mosaicY + mosaicH + 18}
                textAnchor="middle"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
                fill="var(--text-secondary)"
              >
                Pink TP ({fmtPct(pTP, 2)}) vs Orange FP ({fmtPct(pFP, 2)})
              </text>
            </svg>
          )}

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-tabular-mono tabular-nums">
            <div className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 shrink-0 bg-[#D5658B]" aria-hidden="true" />
              <span>TP: {fmtCount(pTP * 1000)}</span>
            </div>
            <div className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 shrink-0 bg-[#D35323]" aria-hidden="true" />
              <span>FP: {fmtCount(pFP * 1000)}</span>
            </div>
            <div className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 shrink-0 bg-[#AAA36D]" aria-hidden="true" />
              <span>FN: {fmtCount(pFN * 1000)}</span>
            </div>
            <div className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 shrink-0 bg-[#8D9FCE]/50" aria-hidden="true" />
              <span>TN: {fmtCount(pTN * 1000)}</span>
            </div>
          </div>
        </div>

        {/* Right Visual: Forward Probability Tree */}
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--text-secondary)]">
              Probability Tree: Multiply Along Branches, Sum Matching E⁺ Leaves
            </span>
            <span className="tabular-nums font-semibold text-[var(--math-ink-z)]">
              P(E⁺) = {fmtPct(pEvidence, 2)}
            </span>
          </div>

          <svg
            viewBox="0 0 420 262"
            role="img"
            aria-label={`Probability tree from sample space root to branches H (${fmtPct(activePrior)}) and not-H (${fmtPct(1 - activePrior)}), splitting into positive and negative test leaves.`}
            className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
          >
            {/* Branches from Root (34, 131) -> H (165, 68) and Hc (165, 194) */}
            <line x1={38} y1={131} x2={160} y2={68} stroke="#D5658B" strokeWidth={2.2} />
            <line
              x1={38}
              y1={131}
              x2={160}
              y2={194}
              stroke="#8D9FCE"
              strokeWidth={2.2}
              strokeOpacity={0.75}
            />

            {/* Second-stage branches */}
            <line x1={178} y1={68} x2={298} y2={36} stroke="#D5658B" strokeWidth={2.4} />
            <line
              x1={178}
              y1={68}
              x2={298}
              y2={98}
              stroke="#AAA36D"
              strokeWidth={1.6}
              strokeOpacity={zoomConditioned ? 0.2 : 0.75}
            />
            <line x1={178} y1={194} x2={298} y2={162} stroke="#D35323" strokeWidth={2.4} />
            <line
              x1={178}
              y1={194}
              x2={298}
              y2={224}
              stroke="#8D9FCE"
              strokeWidth={1.6}
              strokeOpacity={zoomConditioned ? 0.2 : 0.6}
            />

            {/* Branch Weight Labels */}
            <text x={88} y={88} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--math-ink-lower)">
              P(H)={fmtPct(activePrior)}
            </text>
            <text x={82} y={180} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--math-ink-x)">
              P(Hᶜ)={fmtPct(1 - activePrior)}
            </text>

            <text x={225} y={42} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--math-ink-lower)">
              {fmtPct(sens, 0)}
            </text>
            <text x={225} y={96} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--math-ink-grid)" opacity={zoomConditioned ? 0.3 : 1}>
              {fmtPct(1 - sens, 0)}
            </text>
            <text x={225} y={168} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--math-ink-sweep)">
              {fmtPct(fpr, 1)}
            </text>
            <text x={225} y={222} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--text-muted)" opacity={zoomConditioned ? 0.3 : 1}>
              {fmtPct(1 - fpr, 1)}
            </text>

            {/* Nodes */}
            <circle cx={34} cy={131} r={8} fill="var(--bg-canvas)" stroke="var(--border-strong)" strokeWidth={1.6} />
            <text x={34} y={154} textAnchor="middle" fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--text-muted)">
              Ω (1,000)
            </text>

            <circle cx={168} cy={68} r={9} fill="#D5658B" />
            <text x={168} y={53} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={600} fill="var(--math-ink-lower)">
              H
            </text>

            <circle cx={168} cy={194} r={9} fill="#8D9FCE" />
            <text x={168} y={214} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={600} fill="var(--math-ink-x)">
              Hᶜ
            </text>

            {/* Leaves */}
            <g>
              <rect x={300} y={22} width={112} height={28} fill="#D5658B" fillOpacity={0.2} stroke="#D5658B" strokeWidth={1.4} />
              <text x={308} y={34} fontSize={10} fontFamily="JetBrains Mono, monospace" fontWeight={600} fill="var(--math-ink-lower)">
                TP: E⁺ ∩ H
              </text>
              <text x={308} y={45} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--text-primary)">
                {fmtPct(pTP, 2)} ({fmtCount(pTP * 1000)})
              </text>
            </g>

            <g opacity={zoomConditioned ? 0.25 : 1}>
              <rect x={300} y={84} width={112} height={28} fill="#AAA36D" fillOpacity={0.14} stroke="#AAA36D" strokeWidth={1} />
              <text x={308} y={96} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--math-ink-grid)">
                FN: E⁻ ∩ H
              </text>
              <text x={308} y={107} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--text-secondary)">
                {fmtPct(pFN, 2)} ({fmtCount(pFN * 1000)})
              </text>
            </g>

            <g>
              <rect x={300} y={148} width={112} height={28} fill="#D35323" fillOpacity={0.2} stroke="#D35323" strokeWidth={1.4} />
              <text x={308} y={160} fontSize={10} fontFamily="JetBrains Mono, monospace" fontWeight={600} fill="var(--math-ink-sweep)">
                FP: E⁺ ∩ Hᶜ
              </text>
              <text x={308} y={171} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--text-primary)">
                {fmtPct(pFP, 2)} ({fmtCount(pFP * 1000)})
              </text>
            </g>

            <g opacity={zoomConditioned ? 0.25 : 1}>
              <rect x={300} y={210} width={112} height={28} fill="#8D9FCE" fillOpacity={0.1} stroke="var(--border-subtle)" strokeWidth={1} />
              <text x={308} y={222} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--text-muted)">
                TN: E⁻ ∩ Hᶜ
              </text>
              <text x={308} y={233} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="var(--text-secondary)">
                {fmtPct(pTN, 2)} ({fmtCount(pTN * 1000)})
              </text>
            </g>
          </svg>

          {/* Conditioned Universe Share Bar */}
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-tabular-mono tabular-nums">
              <span className="text-[var(--text-secondary)]">
                Inside Positive-Evidence Pool (E⁺):
              </span>
              <span className="font-semibold text-[var(--math-ink-lower)]">
                {fmtCount(pTP * 1000)} TP / {fmtCount(pEvidence * 1000)} All E⁺ = {fmtPct(posterior)}
              </span>
            </div>
            <div className="w-full h-3.5 flex border border-[var(--border-subtle)] overflow-hidden">
              <div
                style={{ width: `${posterior * 100}%`, backgroundColor: "#D5658B" }}
                title={`True Positives share: ${fmtPct(posterior)}`}
              />
              <div
                style={{
                  width: `${(1 - posterior) * 100}%`,
                  backgroundColor: "#D35323",
                }}
                title={`False Positives share: ${fmtPct(1 - posterior)}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Formula Substitution */}
      <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-lower)]">
            Live Bayes Substitution &amp; Scenario Takeaway
          </span>
          <span className="text-xs font-tabular-mono tabular-nums text-[var(--text-secondary)]">
            Belief jumped from Prior {fmtPct(activePrior)} → Posterior {fmtPct(posterior)}
          </span>
        </div>
        <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
          <KaTeXMath
            math={`P(H \\mid E^+) = \\frac{${pTP.toFixed(4)}}{${pTP.toFixed(4)} + ${pFP.toFixed(4)}} = \\frac{${pTP.toFixed(4)}}{${pEvidence.toFixed(4)}} \\approx ${fmtPct(posterior)}`}
            block
          />
        </div>
        <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
          {preset.story}
        </p>
      </div>
    </section>
  );
}
