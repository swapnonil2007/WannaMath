"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
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

interface RollePreset {
  id: string;
  label: string;
  expr: string;
  defaultA: number;
  defaultB: number;
  defaultX0: number;
  xRange: [number, number];
  yRange: [number, number];
  note: string;
}

const ROLLE_PRESETS: RollePreset[] = [
  {
    id: "parabola",
    label: "Parabolic Arch: −x² + 4x − 3 on [1, 3]",
    expr: "-x^2 + 4*x - 3",
    defaultA: 1.0,
    defaultB: 3.0,
    defaultX0: 1.35,
    xRange: [0.0, 4.0],
    yRange: [-1.4, 2.0],
    note: "All three hypotheses hold ($f(1) = f(3) = 0$), yielding the unique horizontal tangent at vertex $c = 2$ where $f'(2) = 0$.",
  },
  {
    id: "multi-sine",
    label: "Multiple Roots: sin(πx) on [0, 2]",
    expr: "sin(pi*x)",
    defaultA: 0.0,
    defaultB: 2.0,
    defaultX0: 0.25,
    xRange: [-0.3, 2.3],
    yRange: [-1.5, 1.5],
    note: "Rolle's Theorem guarantees at least one $c \\in (a, b)$—not uniqueness! Here $f(0) = f(2) = 0$ produces two stationary points: $c_1 = 0.5$ and $c_2 = 1.5$.",
  },
  {
    id: "cubic-wave",
    label: "Symmetric Cubic: x³ − 3x on [−1.73, 1.73]",
    expr: "x^3 - 3*x",
    defaultA: -1.73,
    defaultB: 1.73,
    defaultX0: -0.4,
    xRange: [-2.4, 2.4],
    yRange: [-3.0, 3.0],
    note: "With $f(-\\sqrt{3}) \\approx f(\\sqrt{3}) \\approx 0$, the cubic reaches a local maximum at $c_1 = -1$ and a local minimum at $c_2 = +1$.",
  },
  {
    id: "corner-fail",
    label: "Failure (Corner): 1 − |x| on [−1, 1]",
    expr: "1 - abs(x)",
    defaultA: -1.0,
    defaultB: 1.0,
    defaultX0: -0.45,
    xRange: [-1.6, 1.6],
    yRange: [-0.6, 1.5],
    note: "Although $1 - |x|$ is continuous on $[-1, 1]$ and $f(-1) = f(1) = 0$, the slope flips abruptly from $+1$ to $-1$ at the sharp peak $x = 0$. Because differentiability fails on $(a, b)$, NO point satisfies $f'(c) = 0$.",
  },
  {
    id: "endpoint-jump-fail",
    label: "Failure (Endpoint Jump): x (x < 1), 0 at x = 1",
    expr: "x",
    defaultA: 0.0,
    defaultB: 1.0,
    defaultX0: 0.45,
    xRange: [-0.3, 1.3],
    yRange: [-0.3, 1.4],
    note: "This curve has $f(0) = f(1) = 0$ and is differentiable everywhere on $(0, 1)$ with $f'(x) = 1$, yet NO horizontal tangent exists! Continuity at the closed endpoint $x = 1$ fails because $\\lim_{x\\to 1^-} f(x) = 1 \\neq 0 = f(1)$.",
  },
  {
    id: "unequal-endpoints",
    label: "Failure (f(a) ≠ f(b)): 0.5x² on [0, 2]",
    expr: "0.5*x^2",
    defaultA: 0.0,
    defaultB: 2.0,
    defaultX0: 1.0,
    xRange: [-0.4, 2.4],
    yRange: [-0.4, 2.8],
    note: "Smooth everywhere, yet $f(0) = 0 \\neq 2 = f(2)$. Without equal endpoint heights, the secant chord is tilted ($m_{\\text{sec}} = 1$) instead of horizontal—motivating Lagrange's Mean Value Theorem!",
  },
];

const QUICK_TOKENS_ROLLE = [
  { label: "x²", insert: "x^2" },
  { label: "x³", insert: "x^3" },
  { label: "abs()", insert: "abs()" },
  { label: "sin()", insert: "sin()" },
  { label: "cos()", insert: "cos()" },
  { label: "π", insert: "pi" },
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

export function RollesTheoremLab() {
  const [presetId, setPresetId] = useState<string>("parabola");
  const preset = useMemo(
    () => ROLLE_PRESETS.find((p) => p.id === presetId) ?? ROLLE_PRESETS[0],
    [presetId]
  );

  const [expr, setExpr] = useState<string>(preset.expr);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [boundA, setBoundA] = useState<number>(preset.defaultA);
  const [boundB, setBoundB] = useState<number>(preset.defaultB);
  const [probeX0, setProbeX0] = useState<number>(preset.defaultX0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [snapIndex, setSnapIndex] = useState<number>(0);

  useEffect(() => {
    if (!isAnimating) return;
    const id = window.setInterval(() => {
      setProbeX0((prev) => {
        const span = Math.max(boundB - boundA, 0.2);
        const step = span / 90;
        const next = prev + step;
        if (next >= boundB) {
          setIsAnimating(false);
          return boundB;
        }
        return Number(next.toFixed(3));
      });
    }, 45);
    return () => window.clearInterval(id);
  }, [isAnimating, boundA, boundB]);

  const handleSelectPreset = (p: RollePreset) => {
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
  const isEndpointJumpPreset = !isCustom && preset.id === "endpoint-jump-fail";

  const evalF = useMemo(() => {
    return (x: number): number => {
      if (isEndpointJumpPreset) {
        return x >= 1 - 1e-9 ? 0 : x;
      }
      if (!compiled.valid) return NaN;
      return compiled.evaluate({ x });
    };
  }, [compiled, isEndpointJumpPreset]);

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
      if (Number.isFinite(sy) && Math.abs(sy) < 15) ys.push(sy);
    }
    if (ys.length === 0) return { xRange: xR, yRange: [-3, 3] as [number, number] };
    const mn = Math.min(...ys);
    const mx = Math.max(...ys);
    const padY = Math.max(0.6, (mx - mn) * 0.25);
    return {
      xRange: xR,
      yRange: [Number((mn - padY).toFixed(1)), Number((mx + padY).toFixed(1))] as [
        number,
        number,
      ],
    };
  }, [isCustom, preset, boundA, boundB, evalF]);

  const analysis = useMemo(() => {
    const fa = evalF(boundA);
    const fb = evalF(boundB);
    const endpointsEqual =
      Number.isFinite(fa) && Number.isFinite(fb) && Math.abs(fa - fb) < 0.025;

    // 1. Check Continuity on [a, b]
    let isContinuous = Number.isFinite(fa) && Number.isFinite(fb);
    const discontinuityPoints: number[] = [];

    if (isContinuous) {
      const faRight = evalF(boundA + 2e-4);
      const fbLeft = evalF(boundB - 2e-4);
      if (!Number.isFinite(faRight) || Math.abs(faRight - fa) > 0.05) {
        isContinuous = false;
        discontinuityPoints.push(boundA);
      }
      if (!Number.isFinite(fbLeft) || Math.abs(fbLeft - fb) > 0.05) {
        isContinuous = false;
        discontinuityPoints.push(boundB);
      }
    }

    const scanN = 240;
    const dx = (boundB - boundA) / scanN;
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
      if (Math.abs(y1 - y0) > 0.8) {
        const xm = (x0 + x1) / 2;
        if (Math.abs(evalF(xm + 1e-4) - evalF(xm - 1e-4)) > 0.08) {
          isContinuous = false;
          discontinuityPoints.push(xm);
        }
      }
    }

    // 2. Check Differentiability on (a, b) & detect corners/cusps
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

    // Also test midpoint if scan grid straddles exact corner (e.g. x = 0 on even grid)
    if (isDifferentiable) {
      const midSlope = getOneSidedSlopes(evalF, (boundA + boundB) / 2);
      if (!midSlope.isDifferentiable) {
        isDifferentiable = false;
        cornerPoints.push((boundA + boundB) / 2);
      }
    }

    // 3. Find true differentiable stationary points c in (a, b) with f'(c) = 0
    const stationaryPoints: number[] = [];
    const margin = Math.min(0.02, (boundB - boundA) * 0.02);
    const sStart = boundA + margin;
    const sEnd = boundB - margin;
    const sSteps = 260;

    for (let i = 0; i < sSteps; i++) {
      const xL = sStart + ((sEnd - sStart) * i) / sSteps;
      const xR = sStart + ((sEnd - sStart) * (i + 1)) / sSteps;
      const sL = getOneSidedSlopes(evalF, xL);
      const sR = getOneSidedSlopes(evalF, xR);

      if (!sL.isDifferentiable || !sR.isDifferentiable) continue;

      if (Math.abs(sL.cDiff) < 1e-3) {
        if (stationaryPoints.every((c) => Math.abs(c - xL) > 0.03)) {
          stationaryPoints.push(xL);
        }
        continue;
      }

      if (sL.cDiff * sR.cDiff < 0) {
        let lo = xL;
        let hi = xR;
        let loSlope = sL.cDiff;
        for (let iter = 0; iter < 28; iter++) {
          const mid = 0.5 * (lo + hi);
          const mSlope = getOneSidedSlopes(evalF, mid);
          if (loSlope * mSlope.cDiff <= 0) {
            hi = mid;
          } else {
            lo = mid;
            loSlope = mSlope.cDiff;
          }
        }
        const cand = 0.5 * (lo + hi);
        const candCheck = getOneSidedSlopes(evalF, cand);
        // Reject sharp corners/cusps where left and right slopes disagree!
        if (
          candCheck.isDifferentiable &&
          Math.abs(candCheck.dL) < 0.05 &&
          Math.abs(candCheck.dR) < 0.05 &&
          Math.abs(candCheck.dR - candCheck.dL) < 0.2
        ) {
          if (stationaryPoints.every((c) => Math.abs(c - cand) > 0.03)) {
            stationaryPoints.push(cand);
          }
        }
      }
    }

    const probeY = evalF(probeX0);
    const probeDeriv = getOneSidedSlopes(evalF, probeX0);

    const allHypothesesMet = isContinuous && isDifferentiable && endpointsEqual;
    const curveSegments = isEndpointJumpPreset
      ? sampleSegments(evalF, [plotBounds.xRange[0], 0.998], plotBounds.yRange)
      : sampleSegments(evalF, plotBounds.xRange, plotBounds.yRange);

    return {
      fa,
      fb,
      endpointsEqual,
      isContinuous,
      isDifferentiable,
      allHypothesesMet,
      stationaryPoints,
      cornerPoints,
      discontinuityPoints,
      probeY,
      probeDeriv,
      curveSegments,
    };
  }, [evalF, boundA, boundB, probeX0, plotBounds, isEndpointJumpPreset]);

  const width = 620;
  const height = 340;

  const handleSnapToC = () => {
    if (analysis.stationaryPoints.length === 0) return;
    setIsAnimating(false);
    const targetC =
      analysis.stationaryPoints[snapIndex % analysis.stationaryPoints.length];
    setProbeX0(Number(targetC.toFixed(3)));
    setSnapIndex((prev) => prev + 1);
  };

  return (
    <section
      id="rolles-horizontal-tangent"
      className="scroll-mt-24 border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)]">
            <span>Lab 1.2.5a</span>
            <span>•</span>
            <span>Rolle&apos;s Theorem Explorer</span>
          </div>
          <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
            Rolle&apos;s Theorem Horizontal Tangent &amp; Hypothesis Verifier
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-math-serif">
            Verify all three hypotheses on <KaTeXMath math="[a, b]" /> and sweep{" "}
            <KaTeXMath math="x_0 \in [a, b]" /> to locate points{" "}
            <KaTeXMath math="c \in (a, b)" /> where the tangent line turns
            perfectly horizontal (<KaTeXMath math="f'(c) = 0" />).
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
            disabled={analysis.stationaryPoints.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium border border-[var(--math-ink-diff)] bg-[var(--bg-canvas)] text-[var(--math-ink-diff)] disabled:opacity-40 cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Snap to c</span>
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
        {ROLLE_PRESETS.map((p) => {
          const active = !isCustom && p.id === preset.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors cursor-pointer ${
                active
                  ? "border-[var(--math-ink-sweep)] bg-[var(--bg-canvas)] text-[var(--math-ink-sweep)] font-medium"
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
            quickTokens={QUICK_TOKENS_ROLLE}
            accentHex="#D35323"
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
              min={-3.0}
              max={2.0}
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
              min={-1.5}
              max={3.5}
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

      {/* 3-Check Hypothesis Diagnostic Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans">
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
                : "Discontinuity / endpoint jump detected"}
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
                ? "Smooth tangent slopes throughout"
                : "Corner, cusp, or break on (a, b)"}
            </span>
          </div>
        </div>

        <div
          className={`p-3 border flex items-center gap-2.5 ${
            analysis.endpointsEqual
              ? "border-[var(--math-ink-z)] bg-[#029091]/10"
              : "border-[var(--math-ink-sweep)] bg-[#D35323]/10"
          }`}
        >
          {analysis.endpointsEqual ? (
            <CheckCircle2
              className="w-4 h-4 text-[var(--math-ink-z)] shrink-0"
              aria-hidden="true"
            />
          ) : (
            <AlertTriangle
              className="w-4 h-4 text-[var(--math-ink-sweep)] shrink-0"
              aria-hidden="true"
            />
          )}
          <div>
            <span className="font-tabular-mono font-semibold text-[var(--text-primary)] block">
              3. Endpoint Height f(a) = f(b)
            </span>
            <span className="text-[var(--text-secondary)] font-tabular-mono">
              f(a) = {Number.isFinite(analysis.fa) ? analysis.fa.toFixed(2) : "NaN"},{" "}
              f(b) = {Number.isFinite(analysis.fb) ? analysis.fb.toFixed(2) : "NaN"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Plot + Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-2">
          <SvgCoordinatePlane2D
            xRange={plotBounds.xRange}
            yRange={plotBounds.yRange}
            width={width}
            height={height}
            xLabel="x"
            yLabel="f(x)"
            xColor="var(--math-ink-x)"
            yColor="var(--math-ink-y)"
            ariaLabel="Rolle's Theorem coordinate plane showing interval [a, b], endpoint chord, movable tangent line, and horizontal stationary tangents"
            className="w-full h-80 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
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
              const tangentHalfSpan = Math.max((boundB - boundA) * 0.28, 0.35);
              const probeNearHorizontal =
                analysis.probeDeriv.isDifferentiable &&
                Math.abs(analysis.probeDeriv.cDiff) < 0.08;

              return (
                <>
                  {/* Shaded Interval [a, b] */}
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

                  {/* Endpoint Chord (horizontal if f(a)=f(b)) */}
                  {Number.isFinite(analysis.fa) && Number.isFinite(analysis.fb) && (
                    <line
                      x1={xLeftSvg}
                      y1={toSvgY(analysis.fa)}
                      x2={xRightSvg}
                      y2={toSvgY(analysis.fb)}
                      stroke={analysis.endpointsEqual ? "#D5658B" : "#D35323"}
                      strokeDasharray={analysis.endpointsEqual ? undefined : "5 4"}
                      strokeWidth={1.8}
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

                  {/* Verified Horizontal Tangents at c_k */}
                  {analysis.stationaryPoints.map((cVal, idx) => {
                    const cy = evalF(cVal);
                    if (!Number.isFinite(cy)) return null;
                    const cxSvg = toSvgX(cVal);
                    const cySvg = toSvgY(cy);
                    return (
                      <g key={`c-${idx}`}>
                        <line
                          x1={toSvgX(cVal - tangentHalfSpan * 0.9)}
                          y1={cySvg}
                          x2={toSvgX(cVal + tangentHalfSpan * 0.9)}
                          y2={cySvg}
                          stroke="#FBEAA4"
                          strokeWidth={2.2}
                        />
                        <circle
                          cx={cxSvg}
                          cy={cySvg}
                          r={4.5}
                          fill="#FBEAA4"
                          stroke="#1E1F22"
                          strokeWidth={1.3}
                        />
                      </g>
                    );
                  })}

                  {/* Corner / Discontinuity Warning Markers */}
                  {[...analysis.cornerPoints, ...analysis.discontinuityPoints].map(
                    (warnX, idx) => {
                      const wy = evalF(warnX);
                      if (!Number.isFinite(wy)) return null;
                      return (
                        <circle
                          key={`w-${idx}`}
                          cx={toSvgX(warnX)}
                          cy={toSvgY(wy)}
                          r={5}
                          fill="var(--bg-canvas)"
                          stroke="#D35323"
                          strokeWidth={2.2}
                        />
                      );
                    }
                  )}

                  {/* Hollow circle for endpoint jump preset at (1, 1) */}
                  {isEndpointJumpPreset && (
                    <circle
                      cx={toSvgX(1)}
                      cy={toSvgY(1)}
                      r={4.8}
                      fill="var(--bg-canvas)"
                      stroke="#029091"
                      strokeWidth={2}
                    />
                  )}

                  {/* Endpoint Dots (a, f(a)) and (b, f(b)) */}
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

                  {/* Live Tangent Line & Probe at x0 */}
                  {Number.isFinite(analysis.probeY) &&
                    analysis.probeDeriv.isDifferentiable && (
                      <line
                        x1={toSvgX(probeX0 - tangentHalfSpan)}
                        y1={toSvgY(
                          clampY(
                            analysis.probeY -
                              analysis.probeDeriv.cDiff * tangentHalfSpan
                          )
                        )}
                        x2={toSvgX(probeX0 + tangentHalfSpan)}
                        y2={toSvgY(
                          clampY(
                            analysis.probeY +
                              analysis.probeDeriv.cDiff * tangentHalfSpan
                          )
                        )}
                        stroke={probeNearHorizontal ? "#029091" : "#8D9FCE"}
                        strokeWidth={2}
                      />
                    )}
                  {Number.isFinite(analysis.probeY) && (
                    <circle
                      cx={toSvgX(probeX0)}
                      cy={toSvgY(clampY(analysis.probeY))}
                      r={4.8}
                      fill={probeNearHorizontal ? "#029091" : "#D35323"}
                      stroke="#1E1F22"
                      strokeWidth={1.3}
                    />
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Telemetry Readout */}
        <div className="lg:col-span-4 space-y-3 font-tabular-mono text-xs">
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-[var(--math-ink-sweep)] block">
              Live Probe Readout
            </span>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Probe x₀:</span>
              <span className="text-[var(--text-primary)] font-semibold">
                {probeX0.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Height f(x₀):</span>
              <span className="text-[var(--text-primary)] font-semibold">
                {Number.isFinite(analysis.probeY)
                  ? analysis.probeY.toFixed(4)
                  : "Undefined"}
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Slope f&apos;(x₀):</span>
              <span
                className={`font-semibold ${
                  analysis.probeDeriv.isDifferentiable
                    ? Math.abs(analysis.probeDeriv.cDiff) < 0.08
                      ? "text-[var(--math-ink-z)]"
                      : "text-[var(--math-ink-x)]"
                    : "text-[var(--math-ink-sweep)]"
                }`}
              >
                {analysis.probeDeriv.isDifferentiable
                  ? analysis.probeDeriv.cDiff.toFixed(4)
                  : "DNE (Corner/Jump)"}
              </span>
            </div>
          </div>

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-[var(--math-ink-diff)] block">
              Verified Stationary Points f&apos;(c) = 0
            </span>
            {analysis.stationaryPoints.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {analysis.stationaryPoints.map((cVal, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsAnimating(false);
                      setProbeX0(Number(cVal.toFixed(3)));
                    }}
                    className="px-2 py-1 border border-[var(--math-ink-diff)] bg-[var(--bg-panel)] text-[var(--math-ink-diff)] hover:bg-[var(--bg-panel-elevated)] cursor-pointer"
                  >
                    c{analysis.stationaryPoints.length > 1 ? idx + 1 : ""} ≈{" "}
                    {cVal.toFixed(3)}
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

      {/* Conceptual Note */}
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
