"use client";

import React, { useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  createSeededRng,
  normalCdf,
  normalInvCdf,
  normalPdf,
  sampleMean,
  sampleNormal,
  sampleStdDev,
} from "./statMath";

type CurvePresetId = "heights" | "iq" | "coffee";
type QQShapeId = "normal" | "heavy_tails" | "right_skew" | "bimodal";

const CURVE_PRESETS: Record<
  CurvePresetId,
  { label: string; unit: string; mu: number; sigma: number; a: number; b: number; muMin: number; muMax: number; sigMin: number; sigMax: number }
> = {
  heights: {
    label: "Heights (μ=170, σ=8)",
    unit: "cm",
    mu: 170,
    sigma: 8,
    a: 162,
    b: 178,
    muMin: 150,
    muMax: 190,
    sigMin: 2,
    sigMax: 15,
  },
  iq: {
    label: "Standard Score (μ=100, σ=15)",
    unit: "pts",
    mu: 100,
    sigma: 15,
    a: 70,
    b: 130,
    muMin: 70,
    muMax: 130,
    sigMin: 5,
    sigMax: 25,
  },
  coffee: {
    label: "Coffee Pack (μ=250, σ=4)",
    unit: "g",
    mu: 250,
    sigma: 4,
    a: 242,
    b: 258,
    muMin: 235,
    muMax: 265,
    sigMin: 1,
    sigMax: 10,
  },
};

const QQ_SHAPES: Record<
  QQShapeId,
  { label: string; signature: string; explanation: string }
> = {
  normal: {
    label: "True Normal",
    signature: "Diagonal Hugging Line",
    explanation:
      "Observed sample quantiles match Gaussian spacing linearly—small wiggles at the ends are normal sampling noise.",
  },
  heavy_tails: {
    label: "Heavy Tails (Fat-Tailed)",
    signature: "S-Curve (Left Below, Right Above)",
    explanation:
      "Extreme outliers occur far more often than a Normal bell expects, bending the left tail downward and the right tail sharply upward!",
  },
  right_skew: {
    label: "Right-Skewed (Exponential)",
    signature: "Upward Cup / U-Bend",
    explanation:
      "Both tails curve upward relative to the diagonal: the short left cliff bunches near zero while the long right tail stretches far beyond +2σ.",
  },
  bimodal: {
    label: "Bimodal (Two Sub-Groups)",
    signature: "Flat / Stepped Center",
    explanation:
      "Data piles into two separate humps with a sparse valley around the mean, pulling points away from the middle slope.",
  },
};

function fmt(n: number, digits = 2): string {
  return (Math.abs(n) < 1e-8 ? 0 : n).toFixed(digits);
}

/**
 * S.3.1 — Normal Bell Curve, Z-Score Standardization & Q-Q Plot Diagnostic Lab.
 */
export function NormalZScoreQQPlotLab() {
  const [curvePreset, setCurvePreset] = useState<CurvePresetId>("heights");
  const [mu, setMu] = useState<number>(170);
  const [sigma, setSigma] = useState<number>(8);
  const [zLeft, setZLeft] = useState<number>(-1);
  const [zRight, setZRight] = useState<number>(1);

  const [qqShape, setQqShape] = useState<QQShapeId>("heavy_tails");
  const [qqSeed, setQqSeed] = useState<number>(1);

  const presetMeta = CURVE_PRESETS[curvePreset];

  const handleSelectCurvePreset = (id: CurvePresetId) => {
    const p = CURVE_PRESETS[id];
    setCurvePreset(id);
    setMu(p.mu);
    setSigma(p.sigma);
    setZLeft((p.a - p.mu) / p.sigma);
    setZRight((p.b - p.mu) / p.sigma);
  };

  const zA = Math.min(zLeft, zRight);
  const zB = Math.max(zLeft, zRight);
  const xA = mu + zA * sigma;
  const xB = mu + zB * sigma;

  const probMass = useMemo(
    () => Math.max(0, normalCdf(zB, 0, 1) - normalCdf(zA, 0, 1)),
    [zA, zB]
  );

  // Bell curve SVG paths on fixed Z viewport [-3.6, +3.6] so X visually shifts/stretches?
  // Better: X plot sits on fixed domain [muMin - 3*sigMax? Or local adaptive domain around preset]
  // Using preset domain [p.mu - 3.6*p.sigMax_mid ...]: let's show X on [presetMeta.muMin - 2.5*presetMeta.sigMax, presetMeta.muMax + 2.5*presetMeta.sigMax]
  // so changing mu/sigma visibly translates AND widens/flattens the raw X bell curve while Z stays fixed!
  const xDomainMin = presetMeta.muMin - 2.2 * presetMeta.sigMax;
  const xDomainMax = presetMeta.muMax + 2.2 * presetMeta.sigMax;

  const w = 480;
  const hRaw = 135;
  const hStd = 135;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 26;
  const plotW = w - padL - padR;

  const toRawX = (x: number) =>
    padL + ((x - xDomainMin) / (xDomainMax - xDomainMin)) * plotW;
  const toStdX = (z: number) => padL + ((z + 3.6) / 7.2) * plotW;

  const rawMaxY = useMemo(
    () => normalPdf(presetMeta.mu, presetMeta.mu, Math.max(presetMeta.sigMin, sigma * 0.65)) * 1.15,
    [presetMeta, sigma]
  );
  const peakRawScaled = Math.max(normalPdf(mu, mu, sigma) * 1.15, rawMaxY * 0.55);

  const toRawY = (pdf: number) => {
    const plotH = hRaw - padT - padB;
    return padT + plotH - Math.min(1, pdf / peakRawScaled) * plotH;
  };
  const toStdY = (pdf: number) => {
    const plotH = hStd - padT - padB;
    return padT + plotH - Math.min(1, pdf / 0.44) * plotH;
  };

  const { rawCurvePath, rawShadePath, stdCurvePath, stdShadePath } = useMemo(() => {
    const steps = 160;
    let rLine = "";
    const rShadePts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = xDomainMin + (i / steps) * (xDomainMax - xDomainMin);
      const px = toRawX(x);
      const py = toRawY(normalPdf(x, mu, sigma));
      rLine += `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)} `;
    }
    const rSamples = 80;
    const xStart = Math.max(xDomainMin, xA);
    const xEnd = Math.min(xDomainMax, xB);
    if (xEnd > xStart) {
      rShadePts.push(`${toRawX(xStart).toFixed(1)},${(hRaw - padB).toFixed(1)}`);
      for (let i = 0; i <= rSamples; i++) {
        const x = xStart + (i / rSamples) * (xEnd - xStart);
        rShadePts.push(
          `${toRawX(x).toFixed(1)},${toRawY(normalPdf(x, mu, sigma)).toFixed(1)}`
        );
      }
      rShadePts.push(`${toRawX(xEnd).toFixed(1)},${(hRaw - padB).toFixed(1)}`);
    }

    let zLine = "";
    const zShadePts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const z = -3.6 + (i / steps) * 7.2;
      const px = toStdX(z);
      const py = toStdY(normalPdf(z, 0, 1));
      zLine += `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)} `;
    }
    const zStart = Math.max(-3.6, zA);
    const zEnd = Math.min(3.6, zB);
    if (zEnd > zStart) {
      zShadePts.push(`${toStdX(zStart).toFixed(1)},${(hStd - padB).toFixed(1)}`);
      for (let i = 0; i <= rSamples; i++) {
        const z = zStart + (i / rSamples) * (zEnd - zStart);
        zShadePts.push(
          `${toStdX(z).toFixed(1)},${toStdY(normalPdf(z, 0, 1)).toFixed(1)}`
        );
      }
      zShadePts.push(`${toStdX(zEnd).toFixed(1)},${(hStd - padB).toFixed(1)}`);
    }

    return {
      rawCurvePath: rLine,
      rawShadePath: rShadePts.join(" "),
      stdCurvePath: zLine,
      stdShadePath: zShadePts.join(" "),
    };
  }, [xDomainMin, xDomainMax, mu, sigma, xA, xB, zA, zB, peakRawScaled]);

  // Q-Q Plot sample generation
  const qqPoints = useMemo(() => {
    const n = 60;
    const rng = createSeededRng(20260301 + qqSeed * 7919);
    const raw: number[] = [];
    for (let i = 0; i < n; i++) {
      if (qqShape === "normal") {
        raw.push(sampleNormal(rng, 0, 1));
      } else if (qqShape === "heavy_tails") {
        // Student-t with ~2.2 df (heavy tails)
        const z = sampleNormal(rng, 0, 1);
        const u1 = sampleNormal(rng, 0, 1);
        const u2 = sampleNormal(rng, 0, 1);
        const denom = Math.sqrt(Math.max(0.08, (u1 * u1 + u2 * u2) / 2));
        raw.push(Math.max(-5.5, Math.min(5.5, z / denom)));
      } else if (qqShape === "right_skew") {
        raw.push(-Math.log(Math.max(1e-6, rng())));
      } else {
        // Bimodal mixture
        const side = rng() < 0.5 ? -1.45 : 1.45;
        raw.push(sampleNormal(rng, side, 0.42));
      }
    }
    const mean = sampleMean(raw);
    const sd = Math.max(1e-6, sampleStdDev(raw, 1));
    const standardizedSorted = raw.map((v) => (v - mean) / sd).sort((a, b) => a - b);

    return standardizedSorted.map((obsZ, i) => {
      const p = (i + 0.5) / n;
      const theoZ = normalInvCdf(p);
      return { theoZ, obsZ };
    });
  }, [qqShape, qqSeed]);

  const qqSize = 310;
  const qqPad = 36;
  const qqRange = 3.5;
  const toQqX = (z: number) =>
    qqPad + ((Math.max(-qqRange, Math.min(qqRange, z)) + qqRange) / (2 * qqRange)) * (qqSize - 2 * qqPad);
  const toQqY = (z: number) =>
    qqSize - qqPad - ((Math.max(-qqRange, Math.min(qqRange, z)) + qqRange) / (2 * qqRange)) * (qqSize - 2 * qqPad);

  return (
    <section
      aria-label="Normal Bell Curve, Z-Score Standardization and Q-Q Plot Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-6 space-y-5"
    >
      {/* Header + Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
            Interactive Laboratory S.3.1 • Unitless Ruler &amp; Normality Diagnostics
          </span>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Normal Curve (<KaTeXMath math="\mu, \sigma" />), Z-Scores &amp; Q-Q Plots
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CURVE_PRESETS) as CurvePresetId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => handleSelectCurvePreset(id)}
              className={`px-2.5 py-1.5 border text-xs font-tabular-mono cursor-pointer transition-colors ${
                curvePreset === id
                  ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/20 text-[var(--text-primary)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {CURVE_PRESETS[id].label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Left (X <-> Z Standardization) + Right (Q-Q Diagnostic) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left 7 Cols: Dual X & Z Bell Curves */}
        <div className="xl:col-span-7 space-y-3">
          {/* Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
              <div className="flex justify-between text-[11px] font-tabular-mono">
                <span className="text-[var(--math-ink-x)] font-semibold">Mean μ</span>
                <span className="tabular-nums">{fmt(mu, 1)}</span>
              </div>
              <input
                type="range"
                min={presetMeta.muMin}
                max={presetMeta.muMax}
                step={0.5}
                value={mu}
                onChange={(e) => setMu(Number(e.target.value))}
                aria-label="Normal distribution mean mu"
                className="w-full accent-[#8D9FCE] cursor-pointer"
              />
            </label>

            <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
              <div className="flex justify-between text-[11px] font-tabular-mono">
                <span className="text-[var(--math-ink-y)] font-semibold">SD σ</span>
                <span className="tabular-nums">{fmt(sigma, 1)}</span>
              </div>
              <input
                type="range"
                min={presetMeta.sigMin}
                max={presetMeta.sigMax}
                step={0.5}
                value={sigma}
                onChange={(e) => setSigma(Number(e.target.value))}
                aria-label="Normal distribution standard deviation sigma"
                className="w-full accent-[#96B898] cursor-pointer"
              />
            </label>

            <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
              <div className="flex justify-between text-[11px] font-tabular-mono">
                <span className="text-[var(--math-ink-sweep)] font-semibold">Lower z₁</span>
                <span className="tabular-nums">{fmt(zLeft, 2)}σ</span>
              </div>
              <input
                type="range"
                min={-3.5}
                max={3.5}
                step={0.05}
                value={zLeft}
                onChange={(e) => setZLeft(Number(e.target.value))}
                aria-label="Lower z score bound"
                className="w-full accent-[#D35323] cursor-pointer"
              />
            </label>

            <label className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 block">
              <div className="flex justify-between text-[11px] font-tabular-mono">
                <span className="text-[var(--math-ink-sweep)] font-semibold">Upper z₂</span>
                <span className="tabular-nums">{fmt(zRight, 2)}σ</span>
              </div>
              <input
                type="range"
                min={-3.5}
                max={3.5}
                step={0.05}
                value={zRight}
                onChange={(e) => setZRight(Number(e.target.value))}
                aria-label="Upper z score bound"
                className="w-full accent-[#D35323] cursor-pointer"
              />
            </label>
          </div>

          {/* 68-95-99.7 Quick Rule Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "±1σ (68.3%)", a: -1, b: 1 },
                { label: "±2σ (95.4%)", a: -2, b: 2 },
                { label: "±3σ (99.7%)", a: -3, b: 3 },
                { label: "Right Tail Z ≥ 1.96 (2.5%)", a: 1.96, b: 3.6 },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => {
                    setZLeft(btn.a);
                    setZRight(btn.b);
                  }}
                  className="px-2 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--math-ink-z)] text-[11px] font-tabular-mono text-[var(--text-primary)] cursor-pointer"
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <span className="text-xs font-tabular-mono tabular-nums font-semibold text-[var(--math-ink-z)]">
              Shaded Area = {(probMass * 100).toFixed(2)}%
            </span>
          </div>

          {/* Synchronized SVG 1: Raw X Bell Curve */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-tabular-mono">
              <span className="text-[var(--math-ink-x)] font-semibold">
                Raw Scale: X ~ N({fmt(mu, 1)}, {fmt(sigma, 1)}²) [{presetMeta.unit}]
              </span>
              <span className="tabular-nums text-[var(--text-secondary)]">
                Interval [{fmt(xA, 1)}, {fmt(xB, 1)}] {presetMeta.unit}
              </span>
            </div>

            <svg
              viewBox={`0 0 ${w} ${hRaw}`}
              role="img"
              aria-label={`Raw Normal distribution curve centered at mu=${fmt(mu, 1)} with sigma=${fmt(sigma, 1)}, shading probability ${(probMass * 100).toFixed(2)}% between ${fmt(xA, 1)} and ${fmt(xB, 1)}.`}
              className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
            >
              {rawShadePath && (
                <polygon points={rawShadePath} fill="#029091" fillOpacity={0.38} />
              )}
              <line
                x1={padL}
                x2={w - padR}
                y1={hRaw - padB}
                y2={hRaw - padB}
                stroke="var(--border-strong)"
                strokeWidth={1.1}
              />
              <line
                x1={toRawX(mu)}
                x2={toRawX(mu)}
                y1={padT}
                y2={hRaw - padB}
                stroke="#AAA36D"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <path d={rawCurvePath} fill="none" stroke="#8D9FCE" strokeWidth={2.2} />
              {[xA, xB].map((xv, i) => {
                const px = toRawX(xv);
                if (px < padL || px > w - padR) return null;
                return (
                  <g key={i}>
                    <line
                      x1={px}
                      x2={px}
                      y1={padT}
                      y2={hRaw - padB}
                      stroke="#D35323"
                      strokeWidth={1.3}
                      strokeDasharray="3 2"
                    />
                    <text
                      x={px}
                      y={hRaw - 8}
                      textAnchor="middle"
                      fontSize={10}
                      fontFamily="JetBrains Mono, monospace"
                      fill="var(--math-ink-sweep)"
                    >
                      {fmt(xv, 1)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Standardized Z Bell Curve */}
            <div className="flex items-center justify-between text-[11px] font-tabular-mono pt-1">
              <span className="text-[var(--math-ink-y)] font-semibold">
                Standardized Z Ruler: Z = (X − μ) / σ ~ N(0, 1)
              </span>
              <span className="tabular-nums text-[var(--text-secondary)]">
                Z ∈ [{fmt(zA, 2)}, {fmt(zB, 2)}]
              </span>
            </div>

            <svg
              viewBox={`0 0 ${w} ${hStd}`}
              role="img"
              aria-label={`Standard Normal Z distribution curve with matching ${(probMass * 100).toFixed(2)}% shaded probability from Z=${fmt(zA, 2)} to ${fmt(zB, 2)}.`}
              className="w-full h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
            >
              {stdShadePath && (
                <polygon points={stdShadePath} fill="#029091" fillOpacity={0.38} />
              )}
              <line
                x1={padL}
                x2={w - padR}
                y1={hStd - padB}
                y2={hStd - padB}
                stroke="var(--border-strong)"
                strokeWidth={1.1}
              />
              {[-3, -2, -1, 0, 1, 2, 3].map((zt) => (
                <g key={zt}>
                  <line
                    x1={toStdX(zt)}
                    x2={toStdX(zt)}
                    y1={hStd - padB - 3}
                    y2={hStd - padB + 3}
                    stroke="var(--border-strong)"
                    strokeWidth={1}
                  />
                  <text
                    x={toStdX(zt)}
                    y={hStd - 8}
                    textAnchor="middle"
                    fontSize={9.5}
                    fontFamily="JetBrains Mono, monospace"
                    fill={zt === 0 ? "var(--math-ink-grid)" : "var(--text-muted)"}
                  >
                    {zt === 0 ? "0" : `${zt > 0 ? "+" : ""}${zt}σ`}
                  </text>
                </g>
              ))}
              <path d={stdCurvePath} fill="none" stroke="#96B898" strokeWidth={2.2} />
              {[zA, zB].map((zv, i) => (
                <line
                  key={i}
                  x1={toStdX(zv)}
                  x2={toStdX(zv)}
                  y1={padT}
                  y2={hStd - padB}
                  stroke="#D35323"
                  strokeWidth={1.3}
                  strokeDasharray="3 2"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Right 5 Cols: Normal Q-Q Plot Diagnostic */}
        <div className="xl:col-span-5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-lower)] font-semibold">
                Normal Q-Q Diagnostic Plot (n = 60)
              </span>
              <button
                type="button"
                onClick={() => setQqSeed((s) => s + 1)}
                className="px-2 py-1 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--math-ink-x)] text-[11px] font-tabular-mono cursor-pointer"
              >
                Resample
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(QQ_SHAPES) as QQShapeId[]).map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => setQqShape(shape)}
                  className={`px-2 py-1 border text-[11px] font-tabular-mono cursor-pointer ${
                    qqShape === shape
                      ? "border-[var(--math-ink-lower)] bg-[#D5658B]/15 text-[var(--text-primary)] font-semibold"
                      : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)]"
                  }`}
                >
                  {QQ_SHAPES[shape].label}
                </button>
              ))}
            </div>
          </div>

          <svg
            viewBox={`0 0 ${qqSize} ${qqSize}`}
            role="img"
            aria-label={`Normal Q-Q plot for ${QQ_SHAPES[qqShape].label} showing ${QQ_SHAPES[qqShape].signature}.`}
            className="w-full max-w-[330px] mx-auto h-auto block border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
          >
            {/* Axes */}
            <line x1={qqPad} x2={qqSize - qqPad} y1={qqSize / 2} y2={qqSize / 2} stroke="var(--border-subtle)" strokeWidth={1} />
            <line x1={qqSize / 2} x2={qqSize / 2} y1={qqPad} y2={qqSize - qqPad} stroke="var(--border-subtle)" strokeWidth={1} />
            {/* 45-degree diagonal reference line y = x */}
            <line
              x1={toQqX(-3.2)}
              y1={toQqY(-3.2)}
              x2={toQqX(3.2)}
              y2={toQqY(3.2)}
              stroke="#AAA36D"
              strokeWidth={1.6}
              strokeDasharray="5 3"
            />
            {qqPoints.map((pt, idx) => {
              const tailDivergence = Math.abs(pt.obsZ - pt.theoZ) > 0.45;
              return (
                <circle
                  key={idx}
                  cx={toQqX(pt.theoZ)}
                  cy={toQqY(pt.obsZ)}
                  r={3.2}
                  fill={tailDivergence ? "#D35323" : "#029091"}
                  fillOpacity={0.85}
                />
              );
            })}
            <text
              x={qqSize / 2}
              y={qqSize - 10}
              textAnchor="middle"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              fill="var(--text-muted)"
            >
              Theoretical Normal Quantiles (Z)
            </text>
            <text
              x={13}
              y={qqSize / 2}
              textAnchor="middle"
              transform={`rotate(-90 13 ${qqSize / 2})`}
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              fill="var(--text-muted)"
            >
              Observed Standardized Quantiles
            </text>
          </svg>

          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
            <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
              Pattern: {QQ_SHAPES[qqShape].signature}
            </span>
            <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
              {QQ_SHAPES[qqShape].explanation}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
