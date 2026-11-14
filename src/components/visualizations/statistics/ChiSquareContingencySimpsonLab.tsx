"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { chiSquarePdf, chiSquarePValue } from "./statMath";

type TabMode = "chi2_table" | "chi2_gof" | "simpson";

function fmt(n: number, digits = 2): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.5.2 — Chi-Square Contingency & Goodness-of-Fit Lab + Interactive Simpson's Paradox Reverser.
 */
export function ChiSquareContingencySimpsonLab() {
  const [tab, setTab] = useState<TabMode>("simpson");

  // 2x2 Contingency Table Counts (Variant A/B x Convert/Bounce)
  const [o11, setO11] = useState<number>(38);
  const [o12, setO12] = useState<number>(62);
  const [o21, setO21] = useState<number>(22);
  const [o22, setO22] = useState<number>(78);

  // Goodness-of-Fit Die rolls (6 faces, total 120 default)
  const [dieCounts, setDieCounts] = useState<number[]>([14, 18, 17, 21, 19, 31]);

  // Simpson's Paradox state (Fixed subgroup true win rates; adjust assignment shares!)
  // Treatment A is BETTER in BOTH subgroups: Mild (93% vs 87%) and Severe (73% vs 69%)!
  const [aMildCount, setAMildCount] = useState<number>(87);
  const [aSevereCount, setASevereCount] = useState<number>(263);
  const [bMildCount, setBMildCount] = useState<number>(270);
  const [bSevereCount, setBSevereCount] = useState<number>(80);

  // 2x2 Chi-Square Computation
  const chi2Table = useMemo(() => {
    const r1 = o11 + o12;
    const r2 = o21 + o22;
    const c1 = o11 + o21;
    const c2 = o12 + o22;
    const N = Math.max(1, r1 + r2);
    const cells = [
      { label: "Control × Yes", o: o11, e: (r1 * c1) / N },
      { label: "Control × No", o: o12, e: (r1 * c2) / N },
      { label: "New UI × Yes", o: o21, e: (r2 * c1) / N },
      { label: "New UI × No", o: o22, e: (r2 * c2) / N },
    ].map((cell) => ({
      ...cell,
      contrib: cell.e > 1e-6 ? ((cell.o - cell.e) ** 2) / cell.e : 0,
    }));
    const stat = cells.reduce((s, c) => s + c.contrib, 0);
    const minExpected = Math.min(...cells.map((c) => c.e));
    const pVal = chiSquarePValue(stat, 1);
    return { cells, stat, df: 1, pVal, minExpected, N };
  }, [o11, o12, o21, o22]);

  // Goodness-of-Fit Die Computation
  const chi2Gof = useMemo(() => {
    const total = Math.max(6, dieCounts.reduce((a, b) => a + b, 0));
    const expected = total / 6;
    const cells = dieCounts.map((o, idx) => ({
      face: idx + 1,
      o,
      e: expected,
      contrib: ((o - expected) ** 2) / expected,
    }));
    const stat = cells.reduce((s, c) => s + c.contrib, 0);
    const pVal = chiSquarePValue(stat, 5);
    return { cells, stat, df: 5, pVal, total, expected };
  }, [dieCounts]);

  // Simpson's Paradox Computation
  const simpson = useMemo(() => {
    const rateAMild = 0.93;
    const rateBMild = 0.87;
    const rateASev = 0.73;
    const rateBSev = 0.69;

    const totalA = Math.max(1, aMildCount + aSevereCount);
    const totalB = Math.max(1, bMildCount + bSevereCount);

    const succA = aMildCount * rateAMild + aSevereCount * rateASev;
    const succB = bMildCount * rateBMild + bSevereCount * rateBSev;
    const overallA = succA / totalA;
    const overallB = succB / totalB;
    const paradoxActive = overallB > overallA;

    return {
      rateAMild,
      rateBMild,
      rateASev,
      rateBSev,
      overallA,
      overallB,
      totalA,
      totalB,
      paradoxActive,
    };
  }, [aMildCount, aSevereCount, bMildCount, bSevereCount]);

  // Active Chi2 curve SVG helper
  const activeChiStat = tab === "chi2_table" ? chi2Table.stat : chi2Gof.stat;
  const activeDf = tab === "chi2_table" ? 1 : 5;
  const activeP = tab === "chi2_table" ? chi2Table.pVal : chi2Gof.pVal;

  return (
    <section
      aria-label="Chi-Square Contingency Tables and Simpson's Paradox Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-6 space-y-5"
    >
      {/* Header + Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-lower)] block">
            Interactive Laboratory S.5.2 • Observed vs. Expected &amp; Hidden Confounding
          </span>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Chi-Square (<KaTeXMath math="\chi^2" />) Tables &amp; Simpson&apos;s Paradox Reverser
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "simpson" as const, label: "1. Simpson's Paradox Reverser" },
            { id: "chi2_table" as const, label: "2. 2×2 Independence Table" },
            { id: "chi2_gof" as const, label: "3. Goodness-of-Fit (Loaded Die)" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3 py-1.5 border text-xs font-tabular-mono cursor-pointer transition-colors ${
                tab === item.id
                  ? "border-[var(--math-ink-lower)] bg-[#D5658B]/15 text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "simpson" && (
        <div className="space-y-4">
          {/* Paradox Status Banner */}
          <div
            className={`p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              simpson.paradoxActive
                ? "border-[var(--math-ink-sweep)] bg-[#D35323]/12"
                : "border-[var(--math-ink-y)] bg-[#96B898]/12"
            }`}
          >
            <div className="space-y-0.5">
              <span
                className={`text-xs font-tabular-mono font-semibold block ${
                  simpson.paradoxActive
                    ? "text-[var(--math-ink-sweep)]"
                    : "text-[var(--math-ink-y)]"
                }`}
              >
                {simpson.paradoxActive
                  ? "PARADOX ACTIVE! Treatment A wins inside EVERY subgroup, yet LOSES Overall!"
                  : "PARADOX RESOLVED! Balanced group sizes keep Treatment A ahead everywhere."}
              </span>
              <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                Mild cases: A (<strong>93%</strong>) &gt; B (87%). Severe cases: A (<strong>73%</strong>) &gt;
                B (69%). Adjust how many Severe vs. Mild cases each treatment receives!
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAMildCount(175);
                setASevereCount(175);
                setBMildCount(175);
                setBSevereCount(175);
              }}
              className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono shrink-0 cursor-pointer"
            >
              Balance Cohorts (50/50)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Case-Mix Sliders */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-z)] font-semibold">
                    Treatment A Case Mix (Severe Share)
                  </span>
                  <span className="tabular-nums font-semibold">
                    {aMildCount} Mild / {aSevereCount} Severe
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={330}
                  step={5}
                  value={aSevereCount}
                  onChange={(e) => {
                    const sev = Number(e.target.value);
                    setASevereCount(sev);
                    setAMildCount(350 - sev);
                  }}
                  aria-label="Treatment A severe cases count"
                  className="w-full accent-[#029091] cursor-pointer"
                />
              </label>

              <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-lower)] font-semibold">
                    Treatment B Case Mix (Severe Share)
                  </span>
                  <span className="tabular-nums font-semibold">
                    {bMildCount} Mild / {bSevereCount} Severe
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={330}
                  step={5}
                  value={bSevereCount}
                  onChange={(e) => {
                    const sev = Number(e.target.value);
                    setBSevereCount(sev);
                    setBMildCount(350 - sev);
                  }}
                  aria-label="Treatment B severe cases count"
                  className="w-full accent-[#D5658B] cursor-pointer"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  setAMildCount(87);
                  setASevereCount(263);
                  setBMildCount(270);
                  setBSevereCount(80);
                }}
                className="px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--math-ink-sweep)] text-xs font-tabular-mono cursor-pointer"
              >
                Restore Paradox Preset (Hospital Triage Bias)
              </button>
            </div>

            {/* Visual Comparison Bars: Stratified vs Aggregated */}
            <div className="lg:col-span-7 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-4">
              {[
                {
                  title: "Subgroup 1: Mild Stones (A wins 93% vs 87%)",
                  aVal: simpson.rateAMild,
                  bVal: simpson.rateBMild,
                },
                {
                  title: "Subgroup 2: Severe Stones (A wins 73% vs 69%)",
                  aVal: simpson.rateASev,
                  bVal: simpson.rateBSev,
                },
                {
                  title: "COMBINED TOTAL (Weighted by Case Mix!)",
                  aVal: simpson.overallA,
                  bVal: simpson.overallB,
                  highlight: true,
                },
              ].map((row) => (
                <div
                  key={row.title}
                  className={`space-y-1.5 ${
                    row.highlight
                      ? "p-3 border border-[var(--border-strong)] bg-[var(--bg-panel)]"
                      : ""
                  }`}
                >
                  <div className="flex justify-between text-xs font-tabular-mono">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {row.title}
                    </span>
                    <span className="tabular-nums">
                      Winner:{" "}
                      <strong
                        className={
                          row.aVal >= row.bVal
                            ? "text-[var(--math-ink-z)]"
                            : "text-[var(--math-ink-lower)]"
                        }
                      >
                        {row.aVal >= row.bVal ? "Treatment A" : "Treatment B"}
                      </strong>
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] font-tabular-mono tabular-nums">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-[var(--math-ink-z)] font-semibold">A</span>
                      <div className="flex-1 h-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                        <div
                          style={{
                            width: `${row.aVal * 100}%`,
                            backgroundColor: "#029091",
                          }}
                          className="h-full"
                        />
                      </div>
                      <span className="w-12 text-right">{(row.aVal * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-[var(--math-ink-lower)] font-semibold">B</span>
                      <div className="flex-1 h-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                        <div
                          style={{
                            width: `${row.bVal * 100}%`,
                            backgroundColor: "#D5658B",
                          }}
                          className="h-full"
                        />
                      </div>
                      <span className="w-12 text-right">{(row.bVal * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab !== "simpson" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Left 6 Cols: Editable Observed Counts + Expected Comparison */}
          <div className="xl:col-span-6 space-y-3">
            {tab === "chi2_table" ? (
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
                <div className="flex items-center justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--text-primary)] font-semibold">
                    2×2 Contingency Table (Observed O vs Expected E)
                  </span>
                  <span className="tabular-nums text-[var(--text-muted)]">
                    Total N = {chi2Table.N}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Control × Convert", val: o11, set: setO11, cell: chi2Table.cells[0] },
                    { label: "Control × Bounce", val: o12, set: setO12, cell: chi2Table.cells[1] },
                    { label: "New UI × Convert", val: o21, set: setO21, cell: chi2Table.cells[2] },
                    { label: "New UI × Bounce", val: o22, set: setO22, cell: chi2Table.cells[3] },
                  ].map((item) => (
                    <label
                      key={item.label}
                      className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1 block"
                    >
                      <div className="flex justify-between text-[11px] font-tabular-mono">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {item.label}
                        </span>
                        <span className="tabular-nums text-[var(--math-ink-z)]">
                          O={item.val} | E={fmt(item.cell.e, 1)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={95}
                        step={1}
                        value={item.val}
                        onChange={(e) => item.set(Number(e.target.value))}
                        aria-label={`Observed count for ${item.label}`}
                        className="w-full accent-[#D5658B] cursor-pointer"
                      />
                      <span className="text-[10px] font-tabular-mono text-[var(--math-ink-sweep)] block">
                        Cell χ² contrib: {fmt(item.cell.contrib, 2)}
                      </span>
                    </label>
                  ))}
                </div>

                {chi2Table.minExpected < 5 && (
                  <div className="p-2 border border-[var(--math-ink-sweep)] bg-[#D35323]/12 text-xs font-math-serif text-[var(--math-ink-sweep)]">
                    <strong>Small-Cell Caution:</strong> Minimum expected count E_min ={" "}
                    {fmt(chi2Table.minExpected, 2)} &lt; 5. Use <strong>Fisher&apos;s Exact Test</strong> instead
                    of the χ² approximation!
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
                <div className="flex items-center justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--text-primary)] font-semibold">
                    6-Sided Die Fairness Check (Observed vs Fair E = {fmt(chi2Gof.expected, 1)})
                  </span>
                  <button
                    type="button"
                    onClick={() => setDieCounts([20, 20, 20, 20, 20, 20])}
                    className="px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[11px] cursor-pointer"
                  >
                    Make Perfectly Fair
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {chi2Gof.cells.map((cell, idx) => (
                    <label
                      key={cell.face}
                      className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1 block"
                    >
                      <div className="flex justify-between text-[11px] font-tabular-mono">
                        <span className="font-semibold">Face {cell.face}</span>
                        <span className="tabular-nums text-[var(--math-ink-z)]">O={cell.o}</span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={45}
                        step={1}
                        value={cell.o}
                        onChange={(e) => {
                          const next = [...dieCounts];
                          next[idx] = Number(e.target.value);
                          setDieCounts(next);
                        }}
                        aria-label={`Observed rolls for face ${cell.face}`}
                        className="w-full accent-[#029091] cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right 6 Cols: Chi-Square Tail p-Value Curve */}
          <div className="xl:col-span-6 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-tabular-mono tabular-nums">
              <span className="text-[var(--text-secondary)]">
                Right-Tail χ² Sampling Curve (df = {activeDf})
              </span>
              <span
                className={`font-semibold ${
                  activeP <= 0.05
                    ? "text-[var(--math-ink-diff)]"
                    : "text-[var(--math-ink-y)]"
                }`}
              >
                χ² = {fmt(activeChiStat, 2)} | p ={" "}
                {activeP < 0.0001 ? "< 0.0001" : activeP.toFixed(4)}
              </span>
            </div>

            <svg
              viewBox="0 0 460 205"
              role="img"
              aria-label={`Chi-square distribution for df=${activeDf} with observed statistic ${fmt(activeChiStat, 2)} and upper-tail p-value ${activeP.toFixed(4)}.`}
              className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
            >
              {(() => {
                const maxX = Math.max(14, activeChiStat * 1.25, activeDf + 4 * Math.sqrt(2 * activeDf));
                const toX = (x: number) => 36 + (Math.min(maxX, x) / maxX) * 404;
                const peakY = activeDf === 1 ? 0.65 : activeDf === 5 ? 0.17 : 0.3;
                const toY = (d: number) => 172 - Math.min(1, d / peakY) * 145;
                let curve = "";
                const pShade: string[] = [];
                const steps = 140;
                for (let i = 0; i <= steps; i++) {
                  const x = Math.max(0.08, (i / steps) * maxX);
                  const d = chiSquarePdf(x, activeDf);
                  const px = toX(x);
                  const py = toY(d);
                  curve += `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)} `;
                }
                if (activeChiStat < maxX) {
                  pShade.push(`${toX(activeChiStat).toFixed(1)},172`);
                  for (let i = 0; i <= 50; i++) {
                    const x = activeChiStat + (i / 50) * (maxX - activeChiStat);
                    pShade.push(`${toX(x).toFixed(1)},${toY(chiSquarePdf(Math.max(0.08, x), activeDf)).toFixed(1)}`);
                  }
                  pShade.push(`${toX(maxX).toFixed(1)},172`);
                }
                return (
                  <>
                    <line x1={36} x2={440} y1={172} y2={172} stroke="var(--border-strong)" strokeWidth={1.1} />
                    {pShade.length > 2 && (
                      <polygon points={pShade.join(" ")} fill="#D35323" fillOpacity={0.35} />
                    )}
                    <path d={curve} fill="none" stroke="#D5658B" strokeWidth={2.2} />
                    <line
                      x1={toX(activeChiStat)}
                      x2={toX(activeChiStat)}
                      y1={20}
                      y2={172}
                      stroke="#D35323"
                      strokeDasharray="4 3"
                      strokeWidth={1.8}
                    />
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      )}
    </section>
  );
}
