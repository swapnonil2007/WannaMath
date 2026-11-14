"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { createSeededRng, solveCircleSeparationForArea } from "./statMath";

type SetExpr = "union" | "intersection" | "complementA" | "diffAB" | "neither" | "xor";
type PresetId = "independent" | "disjoint" | "correlated" | "subset";

interface DartPoint {
  x: number;
  y: number;
  inA: boolean;
  inB: boolean;
}

const SET_EXPR_META: Record<
  SetExpr,
  { label: string; latex: string; english: string }
> = {
  union: {
    label: "A ∪ B",
    latex: "A \\cup B",
    english: "Event A OR Event B (or both) occurs",
  },
  intersection: {
    label: "A ∩ B",
    latex: "A \\cap B",
    english: "Both Event A AND Event B occur together",
  },
  complementA: {
    label: "Aᶜ",
    latex: "A^c",
    english: "Event A does NOT occur",
  },
  diffAB: {
    label: "A \\ B",
    latex: "A \\setminus B",
    english: "Event A occurs WITHOUT Event B",
  },
  neither: {
    label: "(A ∪ B)ᶜ",
    latex: "(A \\cup B)^c = A^c \\cap B^c",
    english: "Neither A nor B occurs (De Morgan's Law)",
  },
  xor: {
    label: "A Δ B",
    latex: "A \\triangle B = (A\\setminus B) \\cup (B\\setminus A)",
    english: "Exactly ONE of A or B occurs (exclusive OR)",
  },
};

function fmt(n: number, digits = 3): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function isPointInExpr(inA: boolean, inB: boolean, expr: SetExpr): boolean {
  switch (expr) {
    case "union":
      return inA || inB;
    case "intersection":
      return inA && inB;
    case "complementA":
      return !inA;
    case "diffAB":
      return inA && !inB;
    case "neither":
      return !inA && !inB;
    case "xor":
      return inA !== inB;
  }
}

/**
 * S.2.1 — Unit-Area Venn Sample Space, Boolean Set Algebra & Independence Explorer.
 * Pairs a classic Venn circle diagram with an exact-area Unit Square (P(Ω) = 1)
 * and a Monte Carlo dart thrower to prove Kolmogorov axioms & disjoint != independent.
 */
export function VennProbabilityAreaLab() {
  const uid = useId().replace(/:/g, "");
  const [pA, setPA] = useState<number>(0.45);
  const [pB, setPB] = useState<number>(0.36);
  const [pAB, setPAB] = useState<number>(0.162);
  const [selectedExpr, setSelectedExpr] = useState<SetExpr>("union");
  const [darts, setDarts] = useState<DartPoint[]>([]);
  const [isAnimatingDarts, setIsAnimatingDarts] = useState<boolean>(false);

  const rngRef = useRef<() => number>(createSeededRng(20260201));
  const animRef = useRef<number | null>(null);

  // Fréchet-Hoeffding bounds for valid P(A ∩ B)
  const minOverlap = useMemo(() => Math.max(0, pA + pB - 1), [pA, pB]);
  const maxOverlap = useMemo(() => Math.min(pA, pB), [pA, pB]);

  const clampedPAB = useMemo(
    () => clamp(pAB, minOverlap, maxOverlap),
    [pAB, minOverlap, maxOverlap]
  );

  // Exact probabilities of the 4 disjoint atoms
  const pAOnly = Math.max(0, pA - clampedPAB);
  const pBOnly = Math.max(0, pB - clampedPAB);
  const pUnion = Math.min(1, pA + pB - clampedPAB);
  const pNeither = Math.max(0, 1 - pUnion);
  const pIndepProduct = pA * pB;
  const pBGivenA = pA > 1e-6 ? clampedPAB / pA : 0;
  const pBGivenNotA = 1 - pA > 1e-6 ? pBOnly / (1 - pA) : 0;

  const selectedProb = useMemo(() => {
    switch (selectedExpr) {
      case "union":
        return pUnion;
      case "intersection":
        return clampedPAB;
      case "complementA":
        return 1 - pA;
      case "diffAB":
        return pAOnly;
      case "neither":
        return pNeither;
      case "xor":
        return pAOnly + pBOnly;
    }
  }, [selectedExpr, pUnion, clampedPAB, pA, pAOnly, pNeither, pBOnly]);

  const relationshipStatus = useMemo(() => {
    if (clampedPAB < 0.004) {
      return {
        label: "Mutually Exclusive (Disjoint)",
        detail:
          "Knowing A happens guarantees B CANNOT happen (P(B|A) = 0 ≠ P(B)). Disjoint non-zero events are maximally dependent!",
        toneClass: "text-[var(--math-ink-sweep)]",
      };
    }
    const diff = clampedPAB - pIndepProduct;
    if (Math.abs(diff) <= 0.008) {
      return {
        label: "Independent (A ⊥ B)",
        detail:
          "The share of B inside A matches the share of B outside A (P(B|A) ≈ P(B|Aᶜ) ≈ P(B)). Knowing A tells you nothing about B.",
        toneClass: "text-[var(--math-ink-y)]",
      };
    }
    if (diff > 0) {
      return {
        label: "Positively Associated (P(A ∩ B) > P(A)P(B))",
        detail:
          "Events A and B attract each other: knowing A happened boosts the conditional chance of B.",
        toneClass: "text-[var(--math-ink-z)]",
      };
    }
    return {
      label: "Negatively Associated (P(A ∩ B) < P(A)P(B))",
      detail:
        "Events A and B repel each other: knowing A happened lowers the conditional chance of B.",
      toneClass: "text-[var(--math-ink-lower)]",
    };
  }, [clampedPAB, pIndepProduct]);

  const applyPreset = (id: PresetId) => {
    setIsAnimatingDarts(false);
    setDarts([]);
    if (id === "independent") {
      setPA(0.5);
      setPB(0.4);
      setPAB(0.2);
    } else if (id === "disjoint") {
      setPA(0.4);
      setPB(0.35);
      setPAB(0);
    } else if (id === "correlated") {
      setPA(0.35);
      setPB(0.35);
      setPAB(0.26);
    } else {
      setPA(0.25);
      setPB(0.6);
      setPAB(0.25);
    }
  };

  const handlePAChange = (nextPA: number) => {
    const nextMin = Math.max(0, nextPA + pB - 1);
    const nextMax = Math.min(nextPA, pB);
    setPA(nextPA);
    setPAB((prev) => clamp(prev, nextMin, nextMax));
    setDarts([]);
  };

  const handlePBChange = (nextPB: number) => {
    const nextMin = Math.max(0, pA + nextPB - 1);
    const nextMax = Math.min(pA, nextPB);
    setPB(nextPB);
    setPAB((prev) => clamp(prev, nextMin, nextMax));
    setDarts([]);
  };

  const handlePABChange = (nextPAB: number) => {
    setPAB(clamp(nextPAB, minOverlap, maxOverlap));
    setDarts([]);
  };

  const throwDarts = (count: number) => {
    const rng = rngRef.current;
    const newDarts: DartPoint[] = [];
    for (let i = 0; i < count; i++) {
      const x = rng();
      const y = rng();
      const inA = x <= pA;
      const inB = inA ? y <= pBGivenA : y <= pBGivenNotA;
      newDarts.push({ x, y, inA, inB });
    }
    setDarts((prev) => [...prev, ...newDarts].slice(-1200));
  };

  useEffect(() => {
    if (!isAnimatingDarts) {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      return;
    }
    let lastTime = 0;
    const tick = (now: number) => {
      if (now - lastTime >= 45) {
        lastTime = now;
        setDarts((prev) => {
          if (prev.length >= 500) {
            setIsAnimatingDarts(false);
            return prev;
          }
          const rng = rngRef.current;
          const batch: DartPoint[] = [];
          for (let i = 0; i < 6; i++) {
            const x = rng();
            const y = rng();
            const inA = x <= pA;
            const inB = inA ? y <= pBGivenA : y <= pBGivenNotA;
            batch.push({ x, y, inA, inB });
          }
          return [...prev, ...batch].slice(-500);
        });
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [isAnimatingDarts, pA, pBGivenA, pBGivenNotA]);

  // Circle Venn geometry (proportional areas on a 380x230 stage)
  const vennW = 380;
  const vennH = 230;
  const unitAreaPx = 28000;
  const rA = Math.sqrt((pA * unitAreaPx) / Math.PI);
  const rB = Math.sqrt((pB * unitAreaPx) / Math.PI);
  const sep = solveCircleSeparationForArea(
    rA,
    rB,
    clampedPAB * unitAreaPx
  );
  const rawLeft = -rA;
  const rawRight = sep + rB;
  const rawMid = 0.5 * (rawLeft + rawRight);
  const scaleDown =
    rawRight - rawLeft > vennW - 36
      ? (vennW - 36) / (rawRight - rawLeft)
      : 1;
  const cxA = vennW / 2 + (0 - rawMid) * scaleDown;
  const cxB = vennW / 2 + (sep - rawMid) * scaleDown;
  const cy = vennH / 2;
  const rAScaled = rA * scaleDown;
  const rBScaled = rB * scaleDown;

  // Unit Square Ω geometry (exact pixel areas!)
  const sqX = 48;
  const sqY = 26;
  const sqW = 244;
  const sqH = 188;
  const xSplit = sqX + pA * sqW;
  const ySplitInA = sqY + (1 - pBGivenA) * sqH;
  const ySplitOutA = sqY + (1 - pBGivenNotA) * sqH;

  const dartStats = useMemo(() => {
    const total = darts.length;
    if (total === 0) return { total: 0, hits: 0, empirical: 0 };
    let hits = 0;
    for (let i = 0; i < total; i++) {
      if (isPointInExpr(darts[i].inA, darts[i].inB, selectedExpr)) hits++;
    }
    return { total, hits, empirical: hits / total };
  }, [darts, selectedExpr]);

  const clipAId = `clip-a-${uid}`;
  const clipBId = `clip-b-${uid}`;
  const maskNotAId = `mask-not-a-${uid}`;
  const maskNotBId = `mask-not-b-${uid}`;

  return (
    <section
      aria-label="Unit-Area Venn Sample Space and Independence Explorer"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-6 space-y-5"
    >
      {/* Top Header + Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
            Interactive Laboratory S.2.1 • Probability as Normalized Area
          </span>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Venn Sample Space (<KaTeXMath math="P(\Omega) = 1" />), Set Logic &amp; Independence
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "independent" as const, label: "Independent (A ⊥ B)" },
            { id: "disjoint" as const, label: "Mutually Exclusive (Disjoint)" },
            { id: "correlated" as const, label: "Positively Linked" },
            { id: "subset" as const, label: "Subset (A ⊆ B)" },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="px-2.5 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--math-ink-y)] text-xs font-tabular-mono text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-x)] font-semibold">
              Event A Area: P(A)
            </span>
            <span className="tabular-nums text-[var(--text-primary)] font-semibold">
              {fmt(pA, 2)} ({Math.round(pA * 100)}%)
            </span>
          </div>
          <input
            type="range"
            min={0.05}
            max={0.75}
            step={0.01}
            value={pA}
            onChange={(e) => handlePAChange(Number(e.target.value))}
            aria-label="Probability of event A"
            className="w-full accent-[#8D9FCE] cursor-pointer"
          />
        </label>

        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-y)] font-semibold">
              Event B Area: P(B)
            </span>
            <span className="tabular-nums text-[var(--text-primary)] font-semibold">
              {fmt(pB, 2)} ({Math.round(pB * 100)}%)
            </span>
          </div>
          <input
            type="range"
            min={0.05}
            max={0.75}
            step={0.01}
            value={pB}
            onChange={(e) => handlePBChange(Number(e.target.value))}
            aria-label="Probability of event B"
            className="w-full accent-[#96B898] cursor-pointer"
          />
        </label>

        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-z)] font-semibold">
              Overlap: P(A ∩ B)
            </span>
            <span className="tabular-nums text-[var(--text-primary)] font-semibold">
              {fmt(clampedPAB, 3)}
            </span>
          </div>
          <input
            type="range"
            min={minOverlap}
            max={maxOverlap}
            step={0.002}
            value={clampedPAB}
            onChange={(e) => handlePABChange(Number(e.target.value))}
            aria-label="Overlap probability P of A intersect B"
            className="w-full accent-[#029091] cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] font-tabular-mono text-[var(--text-muted)]">
            <span>
              Bounds: [{fmt(minOverlap, 2)}, {fmt(maxOverlap, 2)}]
            </span>
            <button
              type="button"
              onClick={() => handlePABChange(pIndepProduct)}
              className="px-1.5 py-0.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-y)] text-[var(--math-ink-y)] cursor-pointer"
            >
              Snap Indep ({fmt(pIndepProduct, 3)})
            </button>
          </div>
        </div>
      </div>

      {/* Set Expression Selector + Monte Carlo Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] mr-1">
            Inspect Region:
          </span>
          {(Object.keys(SET_EXPR_META) as SetExpr[]).map((expr) => {
            const active = selectedExpr === expr;
            return (
              <button
                key={expr}
                type="button"
                onClick={() => setSelectedExpr(expr)}
                className={`px-2.5 py-1 border text-xs font-tabular-mono cursor-pointer transition-colors ${
                  active
                    ? "border-[var(--math-ink-z)] bg-[#029091]/20 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {SET_EXPR_META[expr].label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => throwDarts(1)}
            className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--math-ink-sweep)] text-xs font-tabular-mono text-[var(--text-primary)] cursor-pointer"
          >
            +1 Dart
          </button>
          <button
            type="button"
            onClick={() => throwDarts(50)}
            className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--math-ink-sweep)] text-xs font-tabular-mono text-[var(--text-primary)] cursor-pointer"
          >
            +50 Darts
          </button>
          <button
            type="button"
            onClick={() => setIsAnimatingDarts((v) => !v)}
            className="px-2.5 py-1 border border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-xs font-tabular-mono text-[var(--math-ink-sweep)] font-semibold cursor-pointer"
          >
            {isAnimatingDarts ? "Pause Rain" : "Animate Rain (500)"}
          </button>
          {darts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsAnimatingDarts(false);
                setDarts([]);
              }}
              className="px-2 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Dual Synchronized Canvases: Venn Diagram + Exact Unit-Square Sample Space */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left SVG: Classic Venn Circles with Boolean Region Highlight */}
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--text-secondary)]">
              1. Classic Venn Set Logic (<KaTeXMath math={SET_EXPR_META[selectedExpr].latex} />)
            </span>
            <span className="tabular-nums font-semibold text-[var(--math-ink-z)]">
              P = {fmt(selectedProb, 3)}
            </span>
          </div>

          <svg
            viewBox={`0 0 ${vennW} ${vennH}`}
            role="img"
            aria-label={`Venn diagram for events A and B showing P(A)=${fmt(pA, 2)}, P(B)=${fmt(pB, 2)}, P(A intersect B)=${fmt(clampedPAB, 3)}, highlighted region ${SET_EXPR_META[selectedExpr].label} with probability ${fmt(selectedProb, 3)}.`}
            className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
          >
            <defs>
              <clipPath id={clipAId}>
                <circle cx={cxA} cy={cy} r={rAScaled} />
              </clipPath>
              <clipPath id={clipBId}>
                <circle cx={cxB} cy={cy} r={rBScaled} />
              </clipPath>
              <mask id={maskNotAId}>
                <rect x={0} y={0} width={vennW} height={vennH} fill="#FFFFFF" />
                <circle cx={cxA} cy={cy} r={rAScaled} fill="#000000" />
              </mask>
              <mask id={maskNotBId}>
                <rect x={0} y={0} width={vennW} height={vennH} fill="#FFFFFF" />
                <circle cx={cxB} cy={cy} r={rBScaled} fill="#000000" />
              </mask>
            </defs>

            {/* Sample Space Omega Frame */}
            <rect
              x={8}
              y={8}
              width={vennW - 16}
              height={vennH - 16}
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth={1.2}
            />
            <text
              x={16}
              y={24}
              fontSize={12}
              fontFamily="JetBrains Mono, monospace"
              fill="var(--text-muted)"
            >
              Ω (P(Ω) = 1.000)
            </text>

            {/* Highlighted Boolean Region Layer */}
            {selectedExpr === "neither" && (
              <g>
                <rect
                  x={8}
                  y={8}
                  width={vennW - 16}
                  height={vennH - 16}
                  fill="#029091"
                  fillOpacity={0.28}
                />
                <circle cx={cxA} cy={cy} r={rAScaled} fill="var(--bg-panel)" />
                <circle cx={cxB} cy={cy} r={rBScaled} fill="var(--bg-panel)" />
              </g>
            )}

            {selectedExpr === "complementA" && (
              <rect
                x={8}
                y={8}
                width={vennW - 16}
                height={vennH - 16}
                fill="#029091"
                fillOpacity={0.28}
                mask={`url(#${maskNotAId})`}
              />
            )}

            {selectedExpr === "union" && (
              <g>
                <circle
                  cx={cxA}
                  cy={cy}
                  r={rAScaled}
                  fill="#029091"
                  fillOpacity={0.34}
                />
                <circle
                  cx={cxB}
                  cy={cy}
                  r={rBScaled}
                  fill="#029091"
                  fillOpacity={0.34}
                />
              </g>
            )}

            {selectedExpr === "intersection" && clampedPAB > 0 && (
              <circle
                cx={cxB}
                cy={cy}
                r={rBScaled}
                clipPath={`url(#${clipAId})`}
                fill="#029091"
                fillOpacity={0.55}
              />
            )}

            {selectedExpr === "diffAB" && (
              <circle
                cx={cxA}
                cy={cy}
                r={rAScaled}
                mask={`url(#${maskNotBId})`}
                fill="#029091"
                fillOpacity={0.45}
              />
            )}

            {selectedExpr === "xor" && (
              <g>
                <circle
                  cx={cxA}
                  cy={cy}
                  r={rAScaled}
                  mask={`url(#${maskNotBId})`}
                  fill="#029091"
                  fillOpacity={0.42}
                />
                <circle
                  cx={cxB}
                  cy={cy}
                  r={rBScaled}
                  mask={`url(#${maskNotAId})`}
                  fill="#029091"
                  fillOpacity={0.42}
                />
              </g>
            )}

            {/* Base Set Outlines */}
            <circle
              cx={cxA}
              cy={cy}
              r={rAScaled}
              fill="#8D9FCE"
              fillOpacity={0.14}
              stroke="#8D9FCE"
              strokeWidth={2}
            />
            <circle
              cx={cxB}
              cy={cy}
              r={rBScaled}
              fill="#96B898"
              fillOpacity={0.14}
              stroke="#96B898"
              strokeWidth={2}
            />

            {/* Region Labels */}
            <text
              x={cxA - rAScaled * 0.35}
              y={cy - rAScaled - 6 > 24 ? cy - rAScaled - 6 : 24}
              textAnchor="middle"
              fontSize={12}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={600}
              fill="var(--math-ink-x)"
            >
              A ({fmt(pA, 2)})
            </text>
            <text
              x={cxB + rBScaled * 0.35}
              y={cy - rBScaled - 6 > 24 ? cy - rBScaled - 6 : 24}
              textAnchor="middle"
              fontSize={12}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={600}
              fill="var(--math-ink-y)"
            >
              B ({fmt(pB, 2)})
            </text>
            {clampedPAB >= 0.015 && (
              <text
                x={0.5 * (Math.max(cxA - rAScaled, cxB - rBScaled) + Math.min(cxA + rAScaled, cxB + rBScaled))}
                y={cy + 4}
                textAnchor="middle"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
                fill="var(--text-primary)"
              >
                {fmt(clampedPAB, 2)}
              </text>
            )}
          </svg>
        </div>

        {/* Right SVG: Exact Area Unit Square Ω + Monte Carlo Darts */}
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[var(--text-secondary)]">
              2. Exact 1×1 Unit Square Ω &amp; Monte Carlo Darts
            </span>
            <span className="tabular-nums text-[var(--math-ink-sweep)] font-semibold">
              {dartStats.total > 0
                ? `Hits: ${dartStats.hits}/${dartStats.total} = ${fmt(dartStats.empirical, 3)}`
                : "Drop darts to test area!"}
            </span>
          </div>

          <svg
            viewBox="0 0 340 230"
            role="img"
            aria-label={`Exact unit-square partition of probability space showing P(A)=${fmt(pA, 2)}, P(B|A)=${fmt(pBGivenA, 2)}, P(B|not A)=${fmt(pBGivenNotA, 2)}, and ${dartStats.total} Monte Carlo darts.`}
            className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
          >
            {/* 4 Exact-Area Rectangles */}
            {/* Atom 1: A \ B (top-left) */}
            <rect
              x={sqX}
              y={sqY}
              width={Math.max(0, xSplit - sqX)}
              height={Math.max(0, ySplitInA - sqY)}
              fill={
                isPointInExpr(true, false, selectedExpr)
                  ? "#8D9FCE"
                  : "var(--bg-panel)"
              }
              fillOpacity={isPointInExpr(true, false, selectedExpr) ? 0.42 : 1}
              stroke="var(--border-subtle)"
              strokeWidth={1}
            />
            {/* Atom 2: A ∩ B (bottom-left) */}
            <rect
              x={sqX}
              y={ySplitInA}
              width={Math.max(0, xSplit - sqX)}
              height={Math.max(0, sqY + sqH - ySplitInA)}
              fill={
                isPointInExpr(true, true, selectedExpr)
                  ? "#029091"
                  : "var(--bg-panel)"
              }
              fillOpacity={isPointInExpr(true, true, selectedExpr) ? 0.55 : 1}
              stroke="var(--border-subtle)"
              strokeWidth={1}
            />
            {/* Atom 3: Neither (A∪B)^c (top-right) */}
            <rect
              x={xSplit}
              y={sqY}
              width={Math.max(0, sqX + sqW - xSplit)}
              height={Math.max(0, ySplitOutA - sqY)}
              fill={
                isPointInExpr(false, false, selectedExpr)
                  ? "#AAA36D"
                  : "var(--bg-panel)"
              }
              fillOpacity={isPointInExpr(false, false, selectedExpr) ? 0.36 : 1}
              stroke="var(--border-subtle)"
              strokeWidth={1}
            />
            {/* Atom 4: B \ A (bottom-right) */}
            <rect
              x={xSplit}
              y={ySplitOutA}
              width={Math.max(0, sqX + sqW - xSplit)}
              height={Math.max(0, sqY + sqH - ySplitOutA)}
              fill={
                isPointInExpr(false, true, selectedExpr)
                  ? "#96B898"
                  : "var(--bg-panel)"
              }
              fillOpacity={isPointInExpr(false, true, selectedExpr) ? 0.45 : 1}
              stroke="var(--border-subtle)"
              strokeWidth={1}
            />

            {/* Reference Horizontal Dashed Line for Unconditional P(B) */}
            <line
              x1={sqX - 6}
              x2={sqX + sqW + 6}
              y1={sqY + (1 - pB) * sqH}
              y2={sqY + (1 - pB) * sqH}
              stroke="#D35323"
              strokeWidth={1.2}
              strokeDasharray="4 3"
            />

            {/* Outer Unit Frame */}
            <rect
              x={sqX}
              y={sqY}
              width={sqW}
              height={sqH}
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth={1.5}
            />

            {/* Top Split Labels */}
            <text
              x={0.5 * (sqX + xSplit)}
              y={17}
              textAnchor="middle"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              fill="var(--math-ink-x)"
            >
              A ({fmt(pA, 2)})
            </text>
            <text
              x={0.5 * (xSplit + sqX + sqW)}
              y={17}
              textAnchor="middle"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              fill="var(--text-muted)"
            >
              Aᶜ ({fmt(1 - pA, 2)})
            </text>

            {/* Conditional B heights caption */}
            <text
              x={sqX + sqW / 2}
              y={sqY + sqH + 13}
              textAnchor="middle"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              fill="var(--text-secondary)"
            >
              Height in A: P(B|A)={fmt(pBGivenA, 2)} vs in Aᶜ: P(B|Aᶜ)={fmt(pBGivenNotA, 2)}
            </text>

            {/* Monte Carlo Darts */}
            {darts.map((d, idx) => {
              const hit = isPointInExpr(d.inA, d.inB, selectedExpr);
              return (
                <circle
                  key={idx}
                  cx={sqX + d.x * sqW}
                  cy={sqY + (1 - d.y) * sqH}
                  r={2.2}
                  fill={hit ? "#D35323" : "var(--text-muted)"}
                  fillOpacity={hit ? 0.9 : 0.4}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Bottom Readout Cards: Inclusion-Exclusion + Independence Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
            Inclusion–Exclusion Audit ({SET_EXPR_META[selectedExpr].english})
          </span>
          <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math={`P(A \\cup B) = ${fmt(pA, 2)} + ${fmt(pB, 2)} - ${fmt(clampedPAB, 3)} = ${fmt(pUnion, 3)}`}
              block
            />
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-tabular-mono tabular-nums pt-1">
            <div className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              <div className="text-[10px] text-[var(--text-muted)]">A \ B</div>
              <div className="font-semibold text-[var(--math-ink-x)]">{fmt(pAOnly, 3)}</div>
            </div>
            <div className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              <div className="text-[10px] text-[var(--text-muted)]">A ∩ B</div>
              <div className="font-semibold text-[var(--math-ink-z)]">{fmt(clampedPAB, 3)}</div>
            </div>
            <div className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              <div className="text-[10px] text-[var(--text-muted)]">B \ A</div>
              <div className="font-semibold text-[var(--math-ink-y)]">{fmt(pBOnly, 3)}</div>
            </div>
            <div className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              <div className="text-[10px] text-[var(--text-muted)]">(A∪B)ᶜ</div>
              <div className="font-semibold text-[var(--math-ink-grid)]">{fmt(pNeither, 3)}</div>
            </div>
          </div>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              Independence Check
            </span>
            <span className={`text-xs font-tabular-mono font-semibold ${relationshipStatus.toneClass}`}>
              {relationshipStatus.label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-tabular-mono tabular-nums">
            <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Actual Overlap P(A ∩ B)</span>
              <span className="font-semibold text-[var(--text-primary)]">{fmt(clampedPAB, 3)}</span>
            </div>
            <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              <span className="text-[10px] text-[var(--text-muted)] block">If Independent: P(A)·P(B)</span>
              <span className="font-semibold text-[var(--text-primary)]">{fmt(pIndepProduct, 3)}</span>
            </div>
          </div>
          <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
            {relationshipStatus.detail}
          </p>
        </div>
      </div>
    </section>
  );
}
