"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Crosshair,
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { MathRichText } from "@/components/math/MathRichText";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";
import { compileMathExpression } from "@/lib/mathParser";

interface LagrangePreset {
  id: string;
  label: string;
  expr: string;
  defaultA: number;
  defaultB: number;
  defaultX0: number;
  sliderMin: number;
  sliderMax: number;
  xRange: [number, number];
  yRange: [number, number];
  note: string;
}

const LAGRANGE_PRESETS: LagrangePreset[] = [
  {
    id: "cubic-two",
    label: "Smooth Cubic (2 Points): x³ − 3x + 1 on [−1.5, 2]",
    expr: "x^3 - 3*x + 1",
    defaultA: -1.5,
    defaultB: 2.0,
    defaultX0: -0.25,
    sliderMin: -2.2,
    sliderMax: 2.4,
    xRange: [-2.0, 2.5],
    yRange: [-2.5, 4.5],
    note: "Secant slope is $m_{\\text{sec}} = \\frac{3 - 2.125}{3.5} = 0.25$. Solving $3c^2 - 3 = 0.25$ yields two distinct interior points $c \\approx \\pm 1.0408$, aligning with the two extrema of the auxiliary Rolle function $h(x)$.",
  },
  {
    id: "natural-log",
    label: "Natural Log: ln(x) on [1, e]",
    expr: "ln(x)",
    defaultA: 1.0,
    defaultB: 2.72,
    defaultX0: 1.25,
    sliderMin: 0.2,
    sliderMax: 4.5,
    xRange: [0.2, 3.6],
    yRange: [-0.8, 1.7],
    note: "With $a = 1$ and $b \\approx e$, $m_{\\text{sec}} = \\frac{1 - 0}{e - 1}$. Setting $1/c = \\frac{1}{e - 1}$ places the parallel tangent at $c = e - 1 \\approx 1.7183$.",
  },
  {
    id: "parabola-midpoint",
    label: "Parabolic Midpoint Law: 0.5x² − x + 1 on [−1, 3]",
    expr: "0.5*x^2 - x + 1",
    defaultA: -1.0,
    defaultB: 3.0,
    defaultX0: 0.1,
    sliderMin: -2.5,
    sliderMax: 4.0,
    xRange: [-1.6, 3.6],
    yRange: [-0.4, 3.8],
    note: "For every quadratic polynomial, the unique Lagrange point sits exactly at the midpoint $c = \\frac{a + b}{2} = 1.0$—the same midpoint property behind Simpson's rule and parabolic arches!",
  },
  {
    id: "cusp-fail",
    label: "Failure (Cusp): (x²)^(1/3) on [−1, 2]",
    expr: "(x^2)^(1/3)",
    defaultA: -1.0,
    defaultB: 2.0,
    defaultX0: 0.7,
    sliderMin: -2.0,
    sliderMax: 3.0,
    xRange: [-1.5, 2.5],
    yRange: [-0.4, 2.2],
    note: "Continuous everywhere on $[-1, 2]$ with $m_{\\text{sec}} \\approx 0.1958$, yet non-differentiable at the vertical cusp $x = 0$. Elsewhere $|f'(x)| = \\frac{2}{3}|x|^{-1/3} \\ge 0.5291 > m_{\\text{sec}}$, so NO $c \\in (-1, 2)$ works!",
  },
  {
    id: "corner-fail",
    label: "Failure (Corner): |x − 0.5| on [−1, 2]",
    expr: "abs(x - 0.5)",
    defaultA: -1.0,
    defaultB: 2.0,
    defaultX0: -0.1,
    sliderMin: -2.0,
    sliderMax: 3.0,
    xRange: [-1.5, 2.5],
    yRange: [-0.4, 2.2],
    note: "Here $f(-1) = f(2) = 1.5$ gives $m_{\\text{sec}} = 0$, yet every point except the sharp corner $x = 0.5$ has slope $\\pm 1 \\neq 0$. Differentiability on $(a, b)$ cannot be dropped!",
  },
];

const QUICK_TOKENS_LAGRANGE = [
  { label: "x²", insert: "x^2" },
  { label: "x³", insert: "x^3" },
  { label: "ln()", insert: "ln()" },
  { label: "abs()", insert: "abs()" },
  { label: "sin()", insert: "sin()" },
  { label: "exp()", insert: "exp()" },
];

function sampleSegments(
  evalFn: (x: number) => number,
  xRange: [number, number],
  yRange: [number, number],
  samples = 220
): [number, number][][] {
  const [xMin, xMax] = xRange;
  const ySpan = Math.max(yRange[1] - yRange[0], 1);
  const yLow = yRange[0] - ySpan * 0.45;
  const yHigh = yRange[1] + ySpan * 0.45;

  const segments: [number, number][][] = [];
  let current: [number, number][] = [];
  let prevY: number | null = null;

  for (let i = 0; i <= samples; i++) {
    const x = xMin + ((xMax - xMin) * i) / samples;
    const y = evalFn(x);
    if (!Number.isFinite(y) || y < yLow || y > yHigh) {
      if (current.length > 1) segments.push(current);
      current = [];
      prevY = null;
      continue;
    }
    if (prevY !== null && Math.abs(y - prevY) > ySpan * 0.6) {
      if (current.length > 1) segments.push(current);
      current = [];
    }
    current.push([x, y]);
    prevY = y;
  }
  if (current.length > 1) segments.push(current);
  return segments;
}

function getOneSidedSlopes(evalFn: (x: number) => number, x: number) {
  const h = 1e-4;
  const fx = evalFn(x);
  const fL = evalFn(x - h);
  const fR = evalFn(x + h);
  const dL = (fx - fL) / h;
  const dR = (fR - fx) / h;
  const cDiff = (fR - fL) / (2 * h);
  const valid =
    Number.isFinite(fx) &&
    Number.isFinite(dL) &&
    Number.isFinite(dR) &&
    Math.abs(dL) < 200 &&
    Math.abs(dR) < 200;
  const isDifferentiable = valid && Math.abs(dR - dL) <= 0.35;
  return { dL, dR, cDiff, isDifferentiable };
}

export function LagrangeMVTLab() {
  const [presetId, setPresetId] = useState<string>("cubic-two");
  const preset = useMemo(
    () =>
      LAGRANGE_PRESETS.find((p) => p.id === presetId) ?? LAGRANGE_PRESETS[0],
    [presetId]
  );

  const [expr, setExpr] = useState<string>(preset.expr);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [boundA, setBoundA] = useState<number>(preset.defaultA);
  const [boundB, setBoundB] = useState<number>(preset.defaultB);
  const [probeX0, setProbeX0] = useState<number>(preset.defaultX0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showAuxPlot, setShowAuxPlot] = useState<boolean>(true);
  const [snapIndex, setSnapIndex] = useState<number>(0);

  useEffect(() => {
    if (!isAnimating) return;
    const id = window.setInterval(() => {
      setProbeX0((prev) => {
        const span = Math.max(boundB - boundA, 0.2);
        const next = prev + span / 90;
        if (next >= boundB) {
          setIsAnimating(false);
          return boundB;
        }
        return Number(next.toFixed(3));
      });
    }, 45);
    return () => window.clearInterval(id);
  }, [isAnimating, boundA, boundB]);

  const handleSelectPreset = (p: LagrangePreset) => {
    setIsAnimating(false);
    setPresetId(p.id);
    setExpr(p.expr);
    setBoundA(p.defaultA);
    setBoundB(p.defaultB);
    setProbeX0(p.defaultX0);
    setSnapIndex(0);
    setIsCustom(false);
  };

  const compiled = useMemo(() => compileMathExpression(expr, ["x"]), [expr]);
  const evalF = useMemo(
    () => (x: number) => (compiled.valid ? compiled.evaluate({ x }) : NaN),
    [compiled]
  );

  const plotBounds = useMemo(() => {
    if (!isCustom) {
      return { xRange: preset.xRange, yRange: preset.yRange };
    }
    const padX = Math.max(0.5, (boundB - boundA) * 0.25);
    const xR: [number, number] = [boundA - padX, boundB + padX];
    const ys: number[] = [];
    for (let i = 0; i <= 80; i++) {
      const sx = xR[0] + ((xR[1] - xR[0]) * i) / 80;
      const sy = evalF(sx);
      if (Number.isFinite(sy) && Math.abs(sy) < 20) ys.push(sy);
    }
    if (ys.length === 0) return { xRange: xR, yRange: [-3, 3] as [number, number] };
    const mn = Math.min(...ys);
    const mx = Math.max(...ys);
    const padY = Math.max(0.6, (mx - mn) * 0.25);
    return {
      xRange: xR,
      yRange: [
        Number((mn - padY).toFixed(1)),
        Number((mx + padY).toFixed(1)),
      ] as [number, number],
    };
  }, [isCustom, preset, boundA, boundB, evalF]);

  const analysis = useMemo(() => {
    const fa = evalF(boundA);
    const fb = evalF(boundB);
    const span = Math.max(boundB - boundA, 1e-6);
    const mSec =
      Number.isFinite(fa) && Number.isFinite(fb) ? (fb - fa) / span : NaN;

    // 1. Check Continuity on [a, b]
    let isContinuous = Number.isFinite(fa) && Number.isFinite(fb);
    const discontinuityPoints: number[] = [];

    if (isContinuous) {
      const faRight = evalF(boundA + 2e-4);
      const fbLeft = evalF(boundB - 2e-4);
      if (!Number.isFinite(faRight) || Math.abs(faRight - fa) > 0.08) {
        isContinuous = false;
        discontinuityPoints.push(boundA);
      }
      if (!Number.isFinite(fbLeft) || Math.abs(fbLeft - fb) > 0.08) {
        isContinuous = false;
        discontinuityPoints.push(boundB);
      }
    }

    const scanN = 240;
    const dx = span / scanN;
    for (let i = 1; i < scanN; i++) {
      const x0 = boundA + i * dx;
      const x1 = boundA + (i + 1) * dx;
      const y0 = evalF(x0);
      const y1 = evalF(x1);
      if (!Number.isFinite(y0) || !Number.isFinite(y1)) {
        isContinuous = false;
        discontinuityPoints.push((x0 + x1) / 2);
        continue;
      }
      if (Math.abs(y1 - y0) > 0.9) {
        const xm = (x0 + x1) / 2;
        if (Math.abs(evalF(xm + 1e-4) - evalF(xm - 1e-4)) > 0.09) {
          isContinuous = false;
          discontinuityPoints.push(xm);
        }
      }
    }

    // 2. Check Differentiability on (a, b)
    let isDifferentiable = isContinuous;
    const cornerPoints: number[] = [];
    for (let i = 1; i < scanN; i++) {
      const sx = boundA + i * dx;
      const { isDifferentiable: ok } = getOneSidedSlopes(evalF, sx);
      if (!ok) {
        isDifferentiable = false;
        if (
          cornerPoints.every((cp) => Math.abs(cp - sx) > dx * 3) &&
          cornerPoints.length < 4
        ) {
          cornerPoints.push(sx);
        }
      }
    }

    // Check midpoint specifically (catches exact symmetry points like x = 0)
    const midCandidate = (boundA + boundB) / 2;
    if (isDifferentiable && !getOneSidedSlopes(evalF, midCandidate).isDifferentiable) {
      isDifferentiable = false;
      cornerPoints.push(midCandidate);
    }
    // Also check exact 0 if 0 lies strictly inside (a, b)
    if (boundA < -1e-4 && boundB > 1e-4) {
      if (!getOneSidedSlopes(evalF, 0).isDifferentiable) {
        isDifferentiable = false;
        if (cornerPoints.every((cp) => Math.abs(cp) > 0.02)) {
          cornerPoints.push(0);
        }
      }
    }

    // 3. Find parallel tangent points f'(c) = mSec
    const parallelPoints: number[] = [];
    if (Number.isFinite(mSec)) {
      const margin = Math.min(0.02, span * 0.02);
      const sStart = boundA + margin;
      const sEnd = boundB - margin;
      const sSteps = 260;

      for (let i = 0; i < sSteps; i++) {
        const xL = sStart + ((sEnd - sStart) * i) / sSteps;
        const xR = sStart + ((sEnd - sStart) * (i + 1)) / sSteps;
        const sL = getOneSidedSlopes(evalF, xL);
        const sR = getOneSidedSlopes(evalF, xR);
        if (!sL.isDifferentiable || !sR.isDifferentiable) continue;

        const gL = sL.cDiff - mSec;
        const gR = sR.cDiff - mSec;

        if (Math.abs(gL) < 1e-3) {
          if (parallelPoints.every((c) => Math.abs(c - xL) > 0.03)) {
            parallelPoints.push(xL);
          }
          continue;
        }

        if (gL * gR < 0) {
          let lo = xL;
          let hi = xR;
          let loVal = gL;
          for (let iter = 0; iter < 28; iter++) {
            const mid = 0.5 * (lo + hi);
            const mSlope = getOneSidedSlopes(evalF, mid);
            const mVal = mSlope.cDiff - mSec;
            if (loVal * mVal <= 0) {
              hi = mid;
            } else {
              lo = mid;
              loVal = mVal;
            }
          }
          const cand = 0.5 * (lo + hi);
          const candCheck = getOneSidedSlopes(evalF, cand);
          if (
            candCheck.isDifferentiable &&
            Math.abs(candCheck.dL - mSec) < 0.05 &&
            Math.abs(candCheck.dR - mSec) < 0.05
          ) {
            if (parallelPoints.every((c) => Math.abs(c - cand) > 0.03)) {
              parallelPoints.push(cand);
            }
          }
        }
      }
    }

    const probeY = evalF(probeX0);
    const probeDeriv = getOneSidedSlopes(evalF, probeX0);
    const secantYAtProbe =
      Number.isFinite(fa) && Number.isFinite(mSec)
        ? fa + mSec * (probeX0 - boundA)
        : NaN;
    const auxH = (x: number) =>
      Number.isFinite(fa) && Number.isFinite(mSec)
        ? evalF(x) - (fa + mSec * (x - boundA))
        : NaN;

    const auxVals: number[] = [];
    for (let i = 0; i <= 80; i++) {
      const sx = boundA + (span * i) / 80;
      const hv = auxH(sx);
      if (Number.isFinite(hv) && Math.abs(hv) < 20) auxVals.push(hv);
    }
    const hMin = auxVals.length > 0 ? Math.min(...auxVals, -0.2) : -1;
    const hMax = auxVals.length > 0 ? Math.max(...auxVals, 0.2) : 1;
    const hPad = Math.max(0.35, (hMax - hMin) * 0.25);
    const auxYRange: [number, number] = [
      Number((hMin - hPad).toFixed(2)),
      Number((hMax + hPad).toFixed(2)),
    ];

    const curveSegments = sampleSegments(
      evalF,
      plotBounds.xRange,
      plotBounds.yRange
    );
    const auxSegments = sampleSegments(auxH, plotBounds.xRange, auxYRange);

    return {
      fa,
      fb,
      mSec,
      isContinuous,
      isDifferentiable,
      allHypothesesMet: isContinuous && isDifferentiable,
      parallelPoints,
      cornerPoints,
      discontinuityPoints,
      probeY,
      probeDeriv,
      secantYAtProbe,
      auxH,
      auxYRange,
      curveSegments,
      auxSegments,
    };
  }, [evalF, boundA, boundB, probeX0, plotBounds]);

  const width = 620;
  const height = 320;
  const auxHeight = 205;

  const handleSnapToC = () => {
    if (analysis.parallelPoints.length === 0) return;
    setIsAnimating(false);
    const targetC =
      analysis.parallelPoints[snapIndex % analysis.parallelPoints.length];
    setProbeX0(Number(targetC.toFixed(3)));
    setSnapIndex((prev) => prev + 1);
  };

  const sliderMin = !isCustom ? preset.sliderMin : -3.0;
  const sliderMax = !isCustom ? preset.sliderMax : 4.0;

  return (
    <section
      id="lagrange-parallel-tangent"
      className="scroll-mt-24 border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)]">
            <span>Lab 1.2.5b</span>
            <span>•</span>
            <span>Lagrange&apos;s Mean Value Theorem</span>
          </div>
          <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
            Lagrange&apos;s MVT Parallel Tangent &amp; Auxiliary Rolle Function Lab
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-math-serif">
            Translate the{" "}
            <span className="text-[var(--math-ink-x)] font-semibold">
              secant chord
            </span>{" "}
            (<KaTeXMath math="m_{\text{sec}}" />) along the curve until the
            moving tangent matches its exact slope, and see how the auxiliary
            Rolle gap <KaTeXMath math="h(x) = f(x) - L_{\text{sec}}(x)" /> turns
            tilted chords back into horizontal extrema.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!isAnimating && probeX0 >= boundB - 0.02) {
                setProbeX0(boundA);
              }
              setIsAnimating((prev) => !prev);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium border border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-[var(--math-ink-z)] hover:bg-[var(--bg-panel-elevated)] cursor-pointer"
          >
            {isAnimating ? (
              <>
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pause Sweep</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sweep x₀</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSnapToC}
            disabled={analysis.parallelPoints.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium border border-[var(--math-ink-diff)] bg-[var(--bg-canvas)] text-[var(--math-ink-diff)] disabled:opacity-40 cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Snap to c</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAuxPlot((prev) => !prev)}
            aria-pressed={showAuxPlot}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)] cursor-pointer"
          >
            {showAuxPlot ? (
              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{showAuxPlot ? "Hide h(x) Proof Plot" : "Show h(x) Proof Plot"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {LAGRANGE_PRESETS.map((p) => {
          const active = !isCustom && p.id === preset.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors cursor-pointer ${
                active
                  ? "border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-[var(--math-ink-z)] font-medium"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="lg:col-span-5">
          <MathExpressionInput
            label="Function f(x)"
            prefixLatex="f(x) ="
            value={expr}
            onChange={(val) => {
              setExpr(val);
              setIsCustom(true);
            }}
            allowedVars={["x"]}
            quickTokens={QUICK_TOKENS_LAGRANGE}
            accentHex="#029091"
          />
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Left Bound a</span>
              <span className="font-tabular-mono font-semibold text-[var(--math-ink-x)]">
                a = {boundA.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={sliderMin}
              max={sliderMax - 0.5}
              step={0.05}
              value={boundA}
              onChange={(e) => {
                const v = Math.min(Number(e.target.value), boundB - 0.3);
                setBoundA(v);
                setProbeX0((prev) => Math.max(v, Math.min(boundB, prev)));
                setIsCustom(true);
              }}
              aria-label="Left interval endpoint a"
              className="w-full accent-[#8D9FCE]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Right Bound b</span>
              <span className="font-tabular-mono font-semibold text-[var(--math-ink-y)]">
                b = {boundB.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={sliderMin + 0.5}
              max={sliderMax}
              step={0.05}
              value={boundB}
              onChange={(e) => {
                const v = Math.max(Number(e.target.value), boundA + 0.3);
                setBoundB(v);
                setProbeX0((prev) => Math.max(boundA, Math.min(v, prev)));
                setIsCustom(true);
              }}
              aria-label="Right interval endpoint b"
              className="w-full accent-[#96B898]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Tangent Probe <KaTeXMath math="x_0" />
              </span>
              <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)]">
                x₀ = {probeX0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={boundA}
              max={boundB}
              step={0.01}
              value={probeX0}
              onChange={(e) => {
                setIsAnimating(false);
                setProbeX0(Number(e.target.value));
              }}
              aria-label="Tangent probe x0"
              className="w-full accent-[#D35323]"
            />
          </div>
        </div>
      </div>

      {/* 2-Hypothesis Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
        <div
          className={`p-3 border flex items-center gap-2.5 ${
            analysis.isContinuous
              ? "border-[var(--math-ink-z)] bg-[#029091]/10"
              : "border-[var(--math-ink-sweep)] bg-[#D35323]/10"
          }`}
        >
          {analysis.isContinuous ? (
            <CheckCircle2
              className="w-4 h-4 text-[var(--math-ink-z)] shrink-0"
              aria-hidden="true"
            />
          ) : (
            <XCircle
              className="w-4 h-4 text-[var(--math-ink-sweep)] shrink-0"
              aria-hidden="true"
            />
          )}
          <div>
            <span className="font-tabular-mono font-semibold text-[var(--text-primary)] block">
              1. Continuous on [a, b]
            </span>
            <span className="text-[var(--text-secondary)]">
              {analysis.isContinuous
                ? "Verified across closed interval"
                : "Jump, hole, or domain violation detected"}
            </span>
          </div>
        </div>

        <div
          className={`p-3 border flex items-center gap-2.5 ${
            analysis.isDifferentiable
              ? "border-[var(--math-ink-z)] bg-[#029091]/10"
              : "border-[var(--math-ink-sweep)] bg-[#D35323]/10"
          }`}
        >
          {analysis.isDifferentiable ? (
            <CheckCircle2
              className="w-4 h-4 text-[var(--math-ink-z)] shrink-0"
              aria-hidden="true"
            />
          ) : (
            <XCircle
              className="w-4 h-4 text-[var(--math-ink-sweep)] shrink-0"
              aria-hidden="true"
            />
          )}
          <div>
            <span className="font-tabular-mono font-semibold text-[var(--text-primary)] block">
              2. Differentiable on (a, b)
            </span>
            <span className="text-[var(--text-secondary)]">
              {analysis.isDifferentiable
                ? "Smooth tangent slope at every interior point"
                : "Corner or vertical cusp breaks differentiability"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Plots + Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {/* Primary Plot */}
          <div className="space-y-1.5">
            <span className="text-xs font-tabular-mono text-[var(--text-muted)] block">
              1. Secant Chord Slope vs. Instantaneous Tangent Slope
            </span>
            <SvgCoordinatePlane2D
              xRange={plotBounds.xRange}
              yRange={plotBounds.yRange}
              width={width}
              height={height}
              xLabel="x"
              yLabel="f(x)"
              xColor="var(--math-ink-x)"
              yColor="var(--math-ink-y)"
              ariaLabel="Lagrange Mean Value Theorem coordinate plane showing secant chord, moving tangent line, and parallel tangent solutions"
              className="w-full h-76 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
            >
              {({ toSvgX, toSvgY }) => {
                const [yMin, yMax] = plotBounds.yRange;
                const clampY = (y: number) =>
                  Math.max(yMin - 0.5, Math.min(yMax + 0.5, y));
                const toPoints = (seg: [number, number][]) =>
                  seg
                    .map(
                      ([px, py]) =>
                        `${toSvgX(px).toFixed(1)},${toSvgY(clampY(py)).toFixed(1)}`
                    )
                    .join(" ");

                const xLeftSvg = toSvgX(boundA);
                const xRightSvg = toSvgX(boundB);
                const tHalf = Math.max((boundB - boundA) * 0.28, 0.35);
                const isParallelNow =
                  analysis.probeDeriv.isDifferentiable &&
                  Number.isFinite(analysis.mSec) &&
                  Math.abs(analysis.probeDeriv.cDiff - analysis.mSec) < 0.08;

                return (
                  <>
                    {/* Shaded interval [a, b] */}
                    <rect
                      x={xLeftSvg}
                      y={32}
                      width={Math.max(2, xRightSvg - xLeftSvg)}
                      height={height - 64}
                      fill="rgba(141, 159, 206, 0.08)"
                      stroke="#8D9FCE"
                      strokeOpacity={0.35}
                      strokeDasharray="3 3"
                    />

                    {/* Secant Chord */}
                    {Number.isFinite(analysis.fa) && Number.isFinite(analysis.fb) && (
                      <line
                        x1={xLeftSvg}
                        y1={toSvgY(analysis.fa)}
                        x2={xRightSvg}
                        y2={toSvgY(analysis.fb)}
                        stroke="#8D9FCE"
                        strokeWidth={2}
                      />
                    )}

                    {/* Vertical gap between secant line and curve at x0 */}
                    {Number.isFinite(analysis.probeY) &&
                      Number.isFinite(analysis.secantYAtProbe) && (
                        <line
                          x1={toSvgX(probeX0)}
                          y1={toSvgY(clampY(analysis.secantYAtProbe))}
                          x2={toSvgX(probeX0)}
                          y2={toSvgY(clampY(analysis.probeY))}
                          stroke="#FBEAA4"
                          strokeDasharray="3 3"
                          strokeWidth={1.6}
                        />
                      )}

                    {/* Curve Segments */}
                    {analysis.curveSegments.map((seg, i) => (
                      <polyline
                        key={`f-${i}`}
                        fill="none"
                        stroke="#029091"
                        strokeWidth={2.4}
                        points={toPoints(seg)}
                      />
                    ))}

                    {/* Verified Parallel Tangents at c_k */}
                    {Number.isFinite(analysis.mSec) &&
                      analysis.parallelPoints.map((cVal, idx) => {
                        const cy = evalF(cVal);
                        if (!Number.isFinite(cy)) return null;
                        return (
                          <g key={`c-${idx}`}>
                            <line
                              x1={toSvgX(cVal - tHalf * 0.9)}
                              y1={toSvgY(clampY(cy - analysis.mSec * tHalf * 0.9))}
                              x2={toSvgX(cVal + tHalf * 0.9)}
                              y2={toSvgY(clampY(cy + analysis.mSec * tHalf * 0.9))}
                              stroke="#FBEAA4"
                              strokeWidth={2.2}
                            />
                            <circle
                              cx={toSvgX(cVal)}
                              cy={toSvgY(cy)}
                              r={4.5}
                              fill="#FBEAA4"
                              stroke="#1E1F22"
                              strokeWidth={1.3}
                            />
                          </g>
                        );
                      })}

                    {/* Parallel-Translated Secant Reference through (x0, f(x0)) */}
                    {Number.isFinite(analysis.probeY) &&
                      Number.isFinite(analysis.mSec) && (
                        <line
                          x1={toSvgX(probeX0 - tHalf)}
                          y1={toSvgY(
                            clampY(analysis.probeY - analysis.mSec * tHalf)
                          )}
                          x2={toSvgX(probeX0 + tHalf)}
                          y2={toSvgY(
                            clampY(analysis.probeY + analysis.mSec * tHalf)
                          )}
                          stroke="#8D9FCE"
                          strokeDasharray="4 3"
                          strokeOpacity={0.75}
                          strokeWidth={1.4}
                        />
                      )}

                    {/* Live Tangent Line at x0 */}
                    {Number.isFinite(analysis.probeY) &&
                      analysis.probeDeriv.isDifferentiable && (
                        <line
                          x1={toSvgX(probeX0 - tHalf)}
                          y1={toSvgY(
                            clampY(
                              analysis.probeY - analysis.probeDeriv.cDiff * tHalf
                            )
                          )}
                          x2={toSvgX(probeX0 + tHalf)}
                          y2={toSvgY(
                            clampY(
                              analysis.probeY + analysis.probeDeriv.cDiff * tHalf
                            )
                          )}
                          stroke={isParallelNow ? "#029091" : "#D35323"}
                          strokeWidth={2.1}
                        />
                      )}

                    {/* Corner / Cusp Warning Markers */}
                    {[...analysis.cornerPoints, ...analysis.discontinuityPoints].map(
                      (wx, idx) => {
                        const wy = evalF(wx);
                        if (!Number.isFinite(wy)) return null;
                        return (
                          <circle
                            key={`w-${idx}`}
                            cx={toSvgX(wx)}
                            cy={toSvgY(wy)}
                            r={5}
                            fill="var(--bg-canvas)"
                            stroke="#D35323"
                            strokeWidth={2.2}
                          />
                        );
                      }
                    )}

                    {/* Endpoints */}
                    {Number.isFinite(analysis.fa) && (
                      <circle
                        cx={xLeftSvg}
                        cy={toSvgY(analysis.fa)}
                        r={4.2}
                        fill="#8D9FCE"
                        stroke="#1E1F22"
                        strokeWidth={1.2}
                      />
                    )}
                    {Number.isFinite(analysis.fb) && (
                      <circle
                        cx={xRightSvg}
                        cy={toSvgY(analysis.fb)}
                        r={4.2}
                        fill="#96B898"
                        stroke="#1E1F22"
                        strokeWidth={1.2}
                      />
                    )}

                    {/* Live Probe Dot */}
                    {Number.isFinite(analysis.probeY) && (
                      <circle
                        cx={toSvgX(probeX0)}
                        cy={toSvgY(clampY(analysis.probeY))}
                        r={4.8}
                        fill={isParallelNow ? "#029091" : "#D35323"}
                        stroke="#1E1F22"
                        strokeWidth={1.3}
                      />
                    )}
                  </>
                );
              }}
            </SvgCoordinatePlane2D>
          </div>

          {/* Toggleable Auxiliary Rolle Gap Function h(x) */}
          {showAuxPlot && (
            <div className="space-y-1.5">
              <span className="text-xs font-tabular-mono text-[var(--text-muted)] block">
                2. Auxiliary Rolle Function h(x) = f(x) − [f(a) + m_sec(x − a)] (h(a) = h(b) = 0)
              </span>
              <SvgCoordinatePlane2D
                xRange={plotBounds.xRange}
                yRange={analysis.auxYRange}
                width={width}
                height={auxHeight}
                xLabel="x"
                yLabel="h(x)"
                xColor="var(--math-ink-x)"
                yColor="var(--math-ink-diff)"
                ariaLabel="Auxiliary Rolle gap function h(x) showing h(a)=h(b)=0 and horizontal tangents aligned vertically with c"
                className="w-full h-52 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
              >
                {({ toSvgX, toSvgY }) => {
                  const [yMin, yMax] = analysis.auxYRange;
                  const clampY = (y: number) =>
                    Math.max(yMin - 0.3, Math.min(yMax + 0.3, y));
                  const toPoints = (seg: [number, number][]) =>
                    seg
                      .map(
                        ([px, py]) =>
                          `${toSvgX(px).toFixed(1)},${toSvgY(clampY(py)).toFixed(1)}`
                      )
                      .join(" ");

                  const hProbe = analysis.auxH(probeX0);

                  return (
                    <>
                      {/* Vertical Alignment Guides at Verified c_k */}
                      {analysis.parallelPoints.map((cVal, idx) => {
                        const hc = analysis.auxH(cVal);
                        if (!Number.isFinite(hc)) return null;
                        return (
                          <g key={`hc-${idx}`}>
                            <line
                              x1={toSvgX(cVal)}
                              y1={24}
                              x2={toSvgX(cVal)}
                              y2={auxHeight - 24}
                              stroke="#FBEAA4"
                              strokeDasharray="3 3"
                              strokeOpacity={0.6}
                              strokeWidth={1.2}
                            />
                            <circle
                              cx={toSvgX(cVal)}
                              cy={toSvgY(hc)}
                              r={4}
                              fill="#FBEAA4"
                              stroke="#1E1F22"
                              strokeWidth={1.2}
                            />
                          </g>
                        );
                      })}

                      {/* Auxiliary Curve h(x) */}
                      {analysis.auxSegments.map((seg, i) => (
                        <polyline
                          key={`h-${i}`}
                          fill="none"
                          stroke="#D5658B"
                          strokeWidth={2.2}
                          points={toPoints(seg)}
                        />
                      ))}

                      {/* Endpoint Zeros h(a) = h(b) = 0 */}
                      <circle
                        cx={toSvgX(boundA)}
                        cy={toSvgY(0)}
                        r={3.8}
                        fill="#8D9FCE"
                        stroke="#1E1F22"
                        strokeWidth={1.1}
                      />
                      <circle
                        cx={toSvgX(boundB)}
                        cy={toSvgY(0)}
                        r={3.8}
                        fill="#96B898"
                        stroke="#1E1F22"
                        strokeWidth={1.1}
                      />

                      {/* Live Probe on h(x) */}
                      {Number.isFinite(hProbe) && (
                        <circle
                          cx={toSvgX(probeX0)}
                          cy={toSvgY(clampY(hProbe))}
                          r={4.2}
                          fill="#D35323"
                          stroke="#1E1F22"
                          strokeWidth={1.2}
                        />
                      )}
                    </>
                  );
                }}
              </SvgCoordinatePlane2D>
            </div>
          )}
        </div>

        {/* Kinematics & MVT Telemetry */}
        <div className="lg:col-span-4 space-y-3 font-tabular-mono text-xs">
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-[var(--math-ink-x)] block">
              Average vs. Instantaneous Rate
            </span>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Secant Slope m_sec:</span>
              <span className="text-[var(--math-ink-x)] font-semibold">
                {Number.isFinite(analysis.mSec)
                  ? analysis.mSec.toFixed(4)
                  : "NaN"}
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Instantaneous f&apos;(x₀):</span>
              <span className="text-[var(--math-ink-sweep)] font-semibold">
                {analysis.probeDeriv.isDifferentiable
                  ? analysis.probeDeriv.cDiff.toFixed(4)
                  : "DNE (Corner/Cusp)"}
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
              <span>Gap f&apos;(x₀) − m_sec:</span>
              <span className="text-[var(--text-primary)] font-semibold">
                {analysis.probeDeriv.isDifferentiable &&
                Number.isFinite(analysis.mSec)
                  ? (analysis.probeDeriv.cDiff - analysis.mSec).toFixed(4)
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Vertical Gap h(x₀):</span>
              <span className="text-[var(--math-ink-lower)] font-semibold">
                {Number.isFinite(analysis.auxH(probeX0))
                  ? analysis.auxH(probeX0).toFixed(4)
                  : "NaN"}
              </span>
            </div>
          </div>

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-[var(--math-ink-diff)] block">
              Verified Points f&apos;(c) = m_sec
            </span>
            {analysis.parallelPoints.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {analysis.parallelPoints.map((cVal, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsAnimating(false);
                      setProbeX0(Number(cVal.toFixed(3)));
                    }}
                    className="px-2 py-1 border border-[var(--math-ink-diff)] bg-[var(--bg-panel)] text-[var(--math-ink-diff)] hover:bg-[var(--bg-panel-elevated)] cursor-pointer"
                  >
                    c{analysis.parallelPoints.length > 1 ? idx + 1 : ""} ≈{" "}
                    {cVal.toFixed(4)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[var(--math-ink-sweep)]">
                None found inside (a, b) —{" "}
                {analysis.allHypothesesMet
                  ? "check interval bounds"
                  : "hypothesis violated!"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Diagnostic Note */}
      {!isCustom && (
        <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs sm:text-sm text-[var(--text-secondary)] font-math-serif leading-relaxed">
          <strong className="text-[var(--text-primary)] font-sans mr-1.5">
            Theorem Diagnostic:
          </strong>
          <MathRichText text={preset.note} />
        </div>
      )}
    </section>
  );
}
