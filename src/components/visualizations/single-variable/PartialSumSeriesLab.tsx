"use client";

import React, { useState, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  SvgCoordinatePlane2D,
  integrate1DGaussLegendre,
} from "@/components/visualizations/primitives/core2d";

type SeriesFamily = "geometric" | "pseries" | "alternating" | "telescoping";

interface SeriesPreset {
  id: string;
  label: string;
  family: SeriesFamily;
  note: string;
}

const SERIES_PRESETS: SeriesPreset[] = [
  {
    id: "geometric",
    label: "Geometric: Σ r^(n-1)",
    family: "geometric",
    note: "When |r| < 1, terms decay exponentially and partial sums converge to 1/(1 - r). At |r| ≥ 1, terms fail the n-th term test and S_N diverges or oscillates forever.",
  },
  {
    id: "pseries",
    label: "p-Series & Integral Test: Σ 1/n^p",
    family: "pseries",
    note: "Left-endpoint rectangles of area 1/n^p bound ∫₁^∞ x^(-p)dx from above, while right-shifted rectangles bound it from below—proving convergence if and only if p > 1!",
  },
  {
    id: "alternating",
    label: "Alternating Harmonic: Σ (-1)^(n-1)/n",
    family: "alternating",
    note: "Even though the harmonic p = 1 series diverges, alternating signs squeeze every subsequent partial sum monotonically around ln(2) ≈ 0.69315 (Conditional Convergence).",
  },
  {
    id: "telescoping",
    label: "Telescoping: Σ 1/(n(n+1))",
    family: "telescoping",
    note: "Partial fractions 1/n - 1/(n+1) cancel adjacent terms inside S_N = 1 - 1/(N+1), marching steadily toward exact sum 1.",
  },
];

export function PartialSumSeriesLab() {
  const [family, setFamily] = useState<SeriesFamily>("pseries");
  const [numTerms, setNumTerms] = useState<number>(20);
  const [ratioR, setRatioR] = useState<number>(0.72);
  const [exponentP, setExponentP] = useState<number>(1.35);

  const activePreset = useMemo(
    () => SERIES_PRESETS.find((p) => p.family === family) ?? SERIES_PRESETS[0],
    [family]
  );

  const model = useMemo(() => {
    const terms: { n: number; an: number; sn: number }[] = [];
    let running = 0;

    const evalTerm = (n: number): number => {
      if (family === "geometric") return Math.pow(ratioR, n - 1);
      if (family === "pseries") return Math.pow(n, -exponentP);
      if (family === "alternating") return (n % 2 === 1 ? 1 : -1) / n;
      return 1 / (n * (n + 1));
    };

    for (let n = 1; n <= numTerms; n++) {
      const an = evalTerm(n);
      running += an;
      terms.push({ n, an, sn: running });
    }

    // Continuous envelope curve for Integral Test (when monotone positive)
    const envPts: [number, number][] = [];
    if (family === "pseries" || (family === "geometric" && ratioR > 0)) {
      for (let i = 0; i <= 120; i++) {
        const x = 1 + ((numTerms - 1) * i) / 120;
        const fx =
          family === "pseries" ? Math.pow(x, -exponentP) : Math.pow(ratioR, x - 1);
        if (Number.isFinite(fx) && Math.abs(fx) < 10) envPts.push([x, fx]);
      }
    }

    let integralBound: number | null = null;
    if (family === "pseries") {
      integralBound = integrate1DGaussLegendre(
        (x) => Math.pow(x, -exponentP),
        1,
        numTerms,
        16
      );
    }

    let exactLimit: number | null = null;
    let converges = true;
    let verdictText = "";

    if (family === "geometric") {
      if (Math.abs(ratioR) < 1) {
        exactLimit = 1 / (1 - ratioR);
        verdictText = `Converges (|r| < 1) to 1/(1 - r) = ${exactLimit.toFixed(4)}`;
      } else {
        converges = false;
        verdictText = `Diverges (|r| = ${Math.abs(ratioR).toFixed(2)} ≥ 1)`;
      }
    } else if (family === "pseries") {
      if (exponentP > 1) {
        verdictText = `Converges (p = ${exponentP.toFixed(2)} > 1)`;
        if (Math.abs(exponentP - 2) < 0.03) exactLimit = (Math.PI * Math.PI) / 6;
      } else {
        converges = false;
        verdictText = `Diverges (p = ${exponentP.toFixed(2)} ≤ 1, harmonic threshold)`;
      }
    } else if (family === "alternating") {
      exactLimit = Math.LN2;
      verdictText = `Conditionally Convergent to ln(2) ≈ ${Math.LN2.toFixed(5)}`;
    } else {
      exactLimit = 1.0;
      verdictText = "Telescoping Convergent to 1.00000";
    }

    const allS = terms.map((t) => t.sn);
    const sMin = Math.min(0, ...allS) - 0.3;
    const sMax = Math.max(1.2, ...allS, exactLimit ?? 0) + 0.4;

    const allA = terms.map((t) => t.an);
    const aMin = Math.min(-0.2, ...allA) - 0.15;
    const aMax = Math.max(1.1, ...allA) + 0.25;

    return {
      terms,
      envPts,
      integralBound,
      exactLimit,
      converges,
      verdictText,
      sRange: [sMin, Math.min(14, sMax)] as [number, number],
      aRange: [aMin, Math.min(4.0, aMax)] as [number, number],
      lastSn: running,
      lastAn: terms[terms.length - 1]?.an ?? 0,
    };
  }, [family, numTerms, ratioR, exponentP]);

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-lower)]">
            <span>Lab 1.4.1A</span>
            <span>•</span>
            <span>Partial Sums &amp; Integral Test</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            Partial Sum Staircase &amp; Integral Test Comparator
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Track both the individual sequence terms <KaTeXMath math="a_n" />{" "}
            against their continuous integral curve (Left) and the running
            partial sum staircase <KaTeXMath math="S_N = \sum_{n=1}^N a_n" />{" "}
            (Right).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setNumTerms(20);
            setRatioR(0.72);
            setExponentP(1.35);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {SERIES_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setFamily(p.family)}
            className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
              p.family === family
                ? "border-[var(--math-ink-lower)] bg-[var(--bg-canvas)] text-[var(--math-ink-lower)] font-medium"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Horizon Terms N</span>
            <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)]">
              N = {numTerms}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={45}
            step={1}
            value={numTerms}
            onChange={(e) => setNumTerms(Number(e.target.value))}
            aria-label="Number of terms N"
            className="w-full accent-[#D35323]"
          />
        </div>

        {family === "geometric" && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Common Ratio r</span>
              <span className="font-tabular-mono text-[var(--math-ink-x)]">
                r = {ratioR.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={-1.1}
              max={1.1}
              step={0.02}
              value={ratioR}
              onChange={(e) => setRatioR(Number(e.target.value))}
              aria-label="Geometric ratio r"
              className="w-full accent-[#8D9FCE]"
            />
          </div>
        )}

        {family === "pseries" && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Exponent p</span>
              <span className="font-tabular-mono text-[var(--math-ink-z)]">
                p = {exponentP.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.4}
              max={3.0}
              step={0.05}
              value={exponentP}
              onChange={(e) => setExponentP(Number(e.target.value))}
              aria-label="p-series exponent p"
              className="w-full accent-[#029091]"
            />
          </div>
        )}

        <div className="flex flex-col justify-center text-xs font-tabular-mono">
          <span
            className={model.converges ? "text-[var(--math-ink-z)]" : "text-[var(--math-ink-upper)]"}
          >
            {model.verdictText}
          </span>
          <span className="text-[var(--text-secondary)]">
            a_N = {model.lastAn.toFixed(4)} • S_N = {model.lastSn.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Dual Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            1. Sequence Terms <KaTeXMath math="a_n" /> vs. Continuous Curve{" "}
            <KaTeXMath math="f(x)" />
          </span>
          <SvgCoordinatePlane2D
            xRange={[0.5, numTerms + 1]}
            yRange={model.aRange}
            width={460}
            height={280}
            xLabel="n"
            yLabel="a_n"
            xColor="#8D9FCE"
            yColor="#029091"
            ariaLabel="Sequence terms bar chart with continuous integral test curve"
            className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const zy = toSvgY(0);
              return (
                <>
                  {model.terms.map((t) => {
                    const sx = toSvgX(t.n);
                    const sw = Math.max(
                      2,
                      toSvgX(t.n + 0.85) - toSvgX(t.n)
                    );
                    const sy = toSvgY(
                      Math.max(model.aRange[0], Math.min(model.aRange[1], t.an))
                    );
                    return (
                      <rect
                        key={t.n}
                        x={sx}
                        y={Math.min(zy, sy)}
                        width={sw}
                        height={Math.abs(sy - zy)}
                        fill={
                          t.an >= 0
                            ? "rgba(2, 144, 145, 0.35)"
                            : "rgba(185, 88, 105, 0.35)"
                        }
                        stroke={t.an >= 0 ? "#029091" : "#B95869"}
                        strokeWidth={0.9}
                      />
                    );
                  })}
                  {model.envPts.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#FBEAA4"
                      strokeWidth={2}
                      points={model.envPts
                        .map(
                          ([px, py]) =>
                            `${toSvgX(px).toFixed(1)},${toSvgY(
                              Math.max(model.aRange[0], Math.min(model.aRange[1], py))
                            ).toFixed(1)}`
                        )
                        .join(" ")}
                    />
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            2. Partial Sum Trajectory <KaTeXMath math="S_N = \sum_{n=1}^N a_n" />
          </span>
          <SvgCoordinatePlane2D
            xRange={[0.5, numTerms + 1]}
            yRange={model.sRange}
            width={460}
            height={280}
            xLabel="N"
            yLabel="S_N"
            xColor="#8D9FCE"
            yColor="#D5658B"
            ariaLabel="Partial sums trajectory"
            className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {model.exactLimit !== null && (
                  <line
                    x1={32}
                    y1={toSvgY(model.exactLimit)}
                    x2={460 - 32}
                    y2={toSvgY(model.exactLimit)}
                    stroke="#96B898"
                    strokeWidth={1.6}
                    strokeDasharray="6 3"
                  />
                )}
                <polyline
                  fill="none"
                  stroke="#D5658B"
                  strokeWidth={2}
                  points={model.terms
                    .map(
                      (t) =>
                        `${toSvgX(t.n).toFixed(1)},${toSvgY(
                          Math.max(model.sRange[0], Math.min(model.sRange[1], t.sn))
                        ).toFixed(1)}`
                    )
                    .join(" ")}
                />
                {model.terms.map((t) => (
                  <circle
                    key={t.n}
                    cx={toSvgX(t.n)}
                    cy={toSvgY(
                      Math.max(model.sRange[0], Math.min(model.sRange[1], t.sn))
                    )}
                    r={2.8}
                    fill="#D5658B"
                  />
                ))}
              </>
            )}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {model.integralBound !== null && (
        <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--text-secondary)]">
          Integral Test Inequality on [1, {numTerms}]:{" "}
          <span className="text-[var(--math-ink-z)]">
            ∫₁^{numTerms} x^(-p)dx = {model.integralBound.toFixed(4)}
          </span>{" "}
          ≤ S_{numTerms} ={" "}
          <span className="text-[var(--math-ink-lower)]">{model.lastSn.toFixed(4)}</span> ≤ 1 + ∫ ={" "}
          <span className="text-[var(--math-ink-diff)]">
            {(1 + model.integralBound).toFixed(4)}
          </span>
        </div>
      )}

      <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
        <strong className="text-[var(--text-primary)] font-sans">
          Series Insight:
        </strong>{" "}
        {activePreset.note}
      </div>
    </section>
  );
}
