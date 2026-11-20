"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
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

interface OneSidedPreset {
  id: string;
  label: string;
  piecewise: boolean;
  expr: string;
  leftExpr: string;
  rightExpr: string;
  targetA: number;
  xRange: [number, number];
  yRange: [number, number];
  note: string;
}

const ONE_SIDED_PRESETS: OneSidedPreset[] = [
  {
    id: "removable-pdf",
    label: "Removable Hole: (x² + 4x − 12)/(x² − 2x) at a = 2",
    piecewise: false,
    expr: "(x^2 + 4*x - 12)/(x^2 - 2*x)",
    leftExpr: "(x^2 + 4*x - 12)/(x^2 - 2*x)",
    rightExpr: "(x^2 + 4*x - 12)/(x^2 - 2*x)",
    targetA: 2.0,
    xRange: [-0.5, 4.5],
    yRange: [-1.0, 7.0],
    note: "At $x = 2$, both numerator and denominator vanish ($0/0$), leaving a hollow hole at $(2, 4)$. Factoring $(x - 2)(x + 6)/[x(x - 2)]$ shows both $\\text{LHL} = 4$ and $\\text{RHL} = 4$, so the two-sided limit equals $4$.",
  },
  {
    id: "piecewise-pdf",
    label: "Piecewise Jump: x²+5 | 1−3x at a = −2",
    piecewise: true,
    expr: "x^2 + 5",
    leftExpr: "x^2 + 5",
    rightExpr: "1 - 3*x",
    targetA: -2.0,
    xRange: [-4.5, 1.0],
    yRange: [-2.0, 14.0],
    note: "From the left ($x < -2$), heights climb toward $\\text{LHL} = (-2)^2 + 5 = 9$ (hollow circle). From the right ($x \\ge -2$), heights arrive at $\\text{RHL} = 1 - 3(-2) = 7$ (solid dot). Because $9 \\neq 7$, the two-sided limit DNE.",
  },
  {
    id: "abs-step",
    label: "Step Discontinuity: |x − 1|/(x − 1) at a = 1",
    piecewise: false,
    expr: "abs(x - 1)/(x - 1)",
    leftExpr: "-1",
    rightExpr: "1",
    targetA: 1.0,
    xRange: [-1.5, 3.5],
    yRange: [-2.2, 2.2],
    note: "For $x < 1$, $|x - 1| = -(x - 1)$ gives $\\text{LHL} = -1$. For $x > 1$, $|x - 1| = +(x - 1)$ gives $\\text{RHL} = +1$. Both one-sided limits exist finitely, yet disagree—so $\\lim_{x\\to 1} f(x)$ DNE.",
  },
  {
    id: "pole-opposite",
    label: "Opposite Pole: 1/(x − 1) at a = 1",
    piecewise: false,
    expr: "1/(x - 1)",
    leftExpr: "1/(x - 1)",
    rightExpr: "1/(x - 1)",
    targetA: 1.0,
    xRange: [-1.5, 3.5],
    yRange: [-6.0, 6.0],
    note: "Approaching $x = 1$ from the left plunges to $-\\infty$, while approaching from the right shoots to $+\\infty$. Vertical asymptotes break finite limit existence.",
  },
  {
    id: "pole-same",
    label: "Same-Sign Pole: 1/(x − 1)² at a = 1",
    piecewise: false,
    expr: "1/((x - 1)^2)",
    leftExpr: "1/((x - 1)^2)",
    rightExpr: "1/((x - 1)^2)",
    targetA: 1.0,
    xRange: [-1.5, 3.5],
    yRange: [-1.0, 10.0],
    note: "Both $\\text{LHL}$ and $\\text{RHL}$ surge toward $+\\infty$. Writing $\\lim_{x\\to 1} 1/(x-1)^2 = +\\infty$ is shorthand describing unbounded positive growth—not a finite real limit.",
  },
  {
    id: "sinc-hole",
    label: "Fundamental Sinc: sin(x)/x at a = 0",
    piecewise: false,
    expr: "sin(x)/x",
    leftExpr: "sin(x)/x",
    rightExpr: "sin(x)/x",
    targetA: 0.0,
    xRange: [-5.0, 5.0],
    yRange: [-0.6, 1.6],
    note: "Although $\\sin(0)/0$ is undefined, the Squeeze Theorem ($\\cos x \\le \\frac{\\sin x}{x} \\le 1$) traps both left and right sides cleanly at $1$.",
  },
  {
    id: "oscillating",
    label: "Oscillation Trap: sin(6/x) at a = 0",
    piecewise: false,
    expr: "sin(6/x)",
    leftExpr: "sin(6/x)",
    rightExpr: "sin(6/x)",
    targetA: 0.0,
    xRange: [-1.5, 1.5],
    yRange: [-1.6, 1.6],
    note: "Even as $h \\to 0^+$, $\\sin(6/x)$ sweeps across the entire interval $[-1, 1]$ infinitely often—so neither $\\text{LHL}$ nor $\\text{RHL}$ settles onto a value.",
  },
];

const QUICK_TOKENS_X = [
  { label: "x²", insert: "x^2" },
  { label: "abs()", insert: "abs()" },
  { label: "√()", insert: "sqrt()" },
  { label: "sin()", insert: "sin()" },
  { label: "cos()", insert: "cos()" },
  { label: "exp()", insert: "exp()" },
  { label: "π", insert: "pi" },
];

type SideClassification =
  | { kind: "finite"; value: number }
  | { kind: "pos-inf" }
  | { kind: "neg-inf" }
  | { kind: "oscillating" }
  | { kind: "undefined" };

function classifyOneSidedLimit(
  evalFn: (x: number) => number,
  a: number,
  dir: -1 | 1
): SideClassification {
  // Non-round step multipliers prevent periodic functions like sin(6/x) from aliasing on powers of 10
  const steps = [1.3e-2, 4.7e-3, 1.3e-3, 6.1e-4, 2.9e-4, 1.3e-4, 6.7e-5, 3.1e-5];
  const vals = steps.map((h) => evalFn(a + dir * h));
  const fine = vals.slice(2); // 6 finest steps

  const finiteFine = fine.filter((v) => Number.isFinite(v));
  if (finiteFine.length < 3) {
    return { kind: "undefined" };
  }

  const last = finiteFine[finiteFine.length - 1];
  const prev = finiteFine[finiteFine.length - 2];
  const firstFine = finiteFine[0];

  if (
    Math.abs(last) > 45 &&
    Math.abs(last) > Math.abs(firstFine) * 2.5 &&
    Math.sign(last) === Math.sign(prev)
  ) {
    return last > 0 ? { kind: "pos-inf" } : { kind: "neg-inf" };
  }

  if (Math.abs(last) > 1e5) {
    return last > 0 ? { kind: "pos-inf" } : { kind: "neg-inf" };
  }

  const maxFine = Math.max(...finiteFine);
  const minFine = Math.min(...finiteFine);
  const finestThree = finiteFine.slice(-3);
  const spread3 = Math.max(...finestThree) - Math.min(...finestThree);

  if (spread3 < 0.025 && Math.abs(last - prev) <= Math.abs(prev - finestThree[0]) + 1e-3) {
    return { kind: "finite", value: last };
  }

  if (maxFine - minFine > 0.08) {
    return { kind: "oscillating" };
  }

  return { kind: "finite", value: last };
}

function formatSideClassification(cls: SideClassification): string {
  switch (cls.kind) {
    case "finite":
      return cls.value.toFixed(4);
    case "pos-inf":
      return "+∞";
    case "neg-inf":
      return "−∞";
    case "oscillating":
      return "Oscillates (DNE)";
    case "undefined":
      return "Undefined";
  }
}

function sampleSegmentedBranch(
  evalFn: (x: number) => number,
  xStart: number,
  xEnd: number,
  yRange: [number, number],
  samples = 180
): [number, number][][] {
  if (xEnd <= xStart) return [];
  const ySpan = Math.max(yRange[1] - yRange[0], 1);
  const yPadLow = yRange[0] - ySpan * 0.45;
  const yPadHigh = yRange[1] + ySpan * 0.45;

  const segments: [number, number][][] = [];
  let current: [number, number][] = [];
  let prevY: number | null = null;

  for (let i = 0; i <= samples; i++) {
    const x = xStart + ((xEnd - xStart) * i) / samples;
    const y = evalFn(x);

    if (!Number.isFinite(y) || y < yPadLow || y > yPadHigh) {
      if (current.length > 1) segments.push(current);
      current = [];
      prevY = null;
      continue;
    }

    if (prevY !== null && Math.abs(y - prevY) > ySpan * 0.65) {
      if (current.length > 1) segments.push(current);
      current = [];
    }

    current.push([x, y]);
    prevY = y;
  }

  if (current.length > 1) segments.push(current);
  return segments;
}

export function OneSidedLimitsExplorerLab() {
  const [presetId, setPresetId] = useState<string>("removable-pdf");
  const preset = useMemo(
    () => ONE_SIDED_PRESETS.find((p) => p.id === presetId) ?? ONE_SIDED_PRESETS[0],
    [presetId]
  );

  const [piecewiseMode, setPiecewiseMode] = useState<boolean>(preset.piecewise);
  const [expr, setExpr] = useState<string>(preset.expr);
  const [leftExpr, setLeftExpr] = useState<string>(preset.leftExpr);
  const [rightExpr, setRightExpr] = useState<string>(preset.rightExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [targetA, setTargetA] = useState<number>(preset.targetA);
  // log10(h) from -4 (h = 0.0001) to +0.18 (h ≈ 1.51)
  const [logH, setLogH] = useState<number>(-0.35);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const stepH = useMemo(() => Math.pow(10, logH), [logH]);

  useEffect(() => {
    if (!isAnimating) return;
    const id = window.setInterval(() => {
      setLogH((prev) => {
        const next = prev - 0.07;
        if (next <= -4) {
          setIsAnimating(false);
          return -4;
        }
        return Number(next.toFixed(3));
      });
    }, 65);
    return () => window.clearInterval(id);
  }, [isAnimating]);

  const handleSelectPreset = (p: OneSidedPreset) => {
    setIsAnimating(false);
    setPresetId(p.id);
    setPiecewiseMode(p.piecewise);
    setExpr(p.expr);
    setLeftExpr(p.leftExpr);
    setRightExpr(p.rightExpr);
    setTargetA(p.targetA);
    setLogH(-0.35);
    setIsCustom(false);
  };

  const compiledSingle = useMemo(() => compileMathExpression(expr, ["x"]), [expr]);
  const compiledLeft = useMemo(
    () => compileMathExpression(leftExpr, ["x"]),
    [leftExpr]
  );
  const compiledRight = useMemo(
    () => compileMathExpression(rightExpr, ["x"]),
    [rightExpr]
  );

  const { evalLeft, evalRight, evalAtA } = useMemo(() => {
    if (piecewiseMode) {
      const l = (x: number) => (compiledLeft.valid ? compiledLeft.evaluate({ x }) : NaN);
      const r = (x: number) =>
        compiledRight.valid ? compiledRight.evaluate({ x }) : NaN;
      return { evalLeft: l, evalRight: r, evalAtA: r };
    }
    const single = (x: number) =>
      compiledSingle.valid ? compiledSingle.evaluate({ x }) : NaN;
    return { evalLeft: single, evalRight: single, evalAtA: single };
  }, [piecewiseMode, compiledSingle, compiledLeft, compiledRight]);

  const plotBounds = useMemo(() => {
    if (!isCustom) {
      return { xRange: preset.xRange, yRange: preset.yRange };
    }
    const xR: [number, number] = [targetA - 3.0, targetA + 3.0];
    const samples: number[] = [];
    for (let i = 0; i <= 80; i++) {
      const sx = xR[0] + ((xR[1] - xR[0]) * i) / 80;
      if (Math.abs(sx - targetA) < 0.04) continue;
      const sy = sx < targetA ? evalLeft(sx) : evalRight(sx);
      if (Number.isFinite(sy) && Math.abs(sy) < 12) samples.push(sy);
    }
    if (samples.length === 0) {
      return { xRange: xR, yRange: [-5, 5] as [number, number] };
    }
    const minY = Math.min(...samples, -1);
    const maxY = Math.max(...samples, 1);
    const pad = Math.max(0.8, (maxY - minY) * 0.22);
    return {
      xRange: xR,
      yRange: [Math.floor(minY - pad), Math.ceil(maxY + pad)] as [number, number],
    };
  }, [isCustom, preset, targetA, evalLeft, evalRight]);

  const analysis = useMemo(() => {
    const [xMin, xMax] = plotBounds.xRange;
    const [yMin, yMax] = plotBounds.yRange;
    const epsGap = Math.max(1e-4, (xMax - xMin) * 0.002);

    const leftSegments = sampleSegmentedBranch(
      evalLeft,
      xMin,
      Math.min(xMax, targetA - epsGap),
      [yMin, yMax]
    );
    const rightSegments = sampleSegmentedBranch(
      evalRight,
      Math.max(xMin, targetA + epsGap),
      xMax,
      [yMin, yMax]
    );

    const lhlClass = classifyOneSidedLimit(evalLeft, targetA, -1);
    const rhlClass = classifyOneSidedLimit(evalRight, targetA, +1);

    const xProbeL = targetA - stepH;
    const xProbeR = targetA + stepH;
    const yProbeL = evalLeft(xProbeL);
    const yProbeR = evalRight(xProbeR);
    const fAtA = evalAtA(targetA);

    const tableRows = [0.5, 0.1, 0.01, 0.001, 0.0001].map((hVal) => ({
      h: hVal,
      xL: targetA - hVal,
      yL: evalLeft(targetA - hVal),
      xR: targetA + hVal,
      yR: evalRight(targetA + hVal),
    }));

    let verdict: {
      existsFinitely: boolean;
      status: "exists" | "jump" | "infinite-same" | "infinite-split" | "oscillating";
      headline: string;
      detail: string;
    };

    if (lhlClass.kind === "finite" && rhlClass.kind === "finite") {
      if (Math.abs(lhlClass.value - rhlClass.value) < 0.025) {
        const avgL = (lhlClass.value + rhlClass.value) / 2;
        verdict = {
          existsFinitely: true,
          status: "exists",
          headline: `TWO-SIDED LIMIT EXISTS: LHL = RHL ≈ ${avgL.toFixed(4)}`,
          detail: `Both one-sided limits converge to the same finite number ${avgL.toFixed(
            3
          )} regardless of whether f(${targetA.toFixed(2)}) is defined.`,
        };
      } else {
        verdict = {
          existsFinitely: false,
          status: "jump",
          headline: `LIMIT DOES NOT EXIST (JUMP): LHL ≈ ${lhlClass.value.toFixed(
            3
          )} ≠ RHL ≈ ${rhlClass.value.toFixed(3)}`,
          detail:
            "Each one-sided limit exists on its own, yet left and right paths disagree at x = a.",
        };
      }
    } else if (
      (lhlClass.kind === "pos-inf" && rhlClass.kind === "pos-inf") ||
      (lhlClass.kind === "neg-inf" && rhlClass.kind === "neg-inf")
    ) {
      const sym = lhlClass.kind === "pos-inf" ? "+∞" : "−∞";
      verdict = {
        existsFinitely: false,
        status: "infinite-same",
        headline: `DIVERGENT INFINITE LIMIT (${sym}): LHL = RHL = ${sym}`,
        detail: `Both sides grow without bound toward ${sym}. This notation describes divergence, not a finite real limit.`,
      };
    } else if (
      lhlClass.kind === "oscillating" ||
      rhlClass.kind === "oscillating"
    ) {
      verdict = {
        existsFinitely: false,
        status: "oscillating",
        headline: "LIMIT DOES NOT EXIST (BOUNDED OSCILLATION)",
        detail:
          "At least one side oscillates rapidly without settling toward any single height as h → 0⁺.",
      };
    } else {
      verdict = {
        existsFinitely: false,
        status: "infinite-split",
        headline: `LIMIT DOES NOT EXIST: LHL = ${formatSideClassification(
          lhlClass
        )} vs. RHL = ${formatSideClassification(rhlClass)}`,
        detail:
          "At least one side diverges or fails to match the opposite side near x = a.",
      };
    }

    return {
      leftSegments,
      rightSegments,
      lhlClass,
      rhlClass,
      xProbeL,
      xProbeR,
      yProbeL,
      yProbeR,
      fAtA,
      tableRows,
      verdict,
    };
  }, [plotBounds, evalLeft, evalRight, evalAtA, targetA, stepH]);

  const width = 580;
  const height = 340;

  return (
    <section
      id="one-sided-limits-lhl-rhl"
      className="scroll-mt-24 border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Lab Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)]">
            <span>Lab 1.1.1A</span>
            <span>•</span>
            <span>Left-Hand (LHL) vs. Right-Hand (RHL) Limits</span>
          </div>
          <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
            Interactive Left-Hand &amp; Right-Hand Limit Approach Explorer
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-math-serif">
            Slide <KaTeXMath math="h \to 0^+" /> (or press Animate) to walk{" "}
            <span className="text-[var(--math-ink-x)] font-semibold">
              <KaTeXMath math="x_L = a - h" /> (LHL)
            </span>{" "}
            and{" "}
            <span className="text-[var(--math-ink-y)] font-semibold">
              <KaTeXMath math="x_R = a + h" /> (RHL)
            </span>{" "}
            simultaneously toward <KaTeXMath math="x = a" /> and test whether
            both sides meet at one finite height.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!isAnimating && logH <= -3.95) {
                setLogH(-0.15);
              }
              setIsAnimating((prev) => !prev);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium border border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-[var(--math-ink-z)] hover:bg-[var(--bg-panel-elevated)] cursor-pointer"
          >
            {isAnimating ? (
              <>
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pause h → 0⁺</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Animate h → 0⁺</span>
              </>
            )}
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
        {ONE_SIDED_PRESETS.map((p) => {
          const active = !isCustom && p.id === preset.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors cursor-pointer ${
                active
                  ? "border-[var(--math-ink-x)] bg-[var(--bg-canvas)] text-[var(--math-ink-x)] font-medium"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="lg:col-span-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              Function Definition
            </span>
            <button
              type="button"
              onClick={() => {
                setPiecewiseMode((prev) => !prev);
                setIsCustom(true);
              }}
              aria-pressed={piecewiseMode}
              className={`px-2.5 py-1 text-xs font-tabular-mono border cursor-pointer ${
                piecewiseMode
                  ? "border-[var(--math-ink-y)] bg-[var(--bg-panel)] text-[var(--math-ink-y)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {piecewiseMode
                ? "Mode: Piecewise (f₋ / f₊)"
                : "Switch to Piecewise Mode (f₋ / f₊)"}
            </button>
          </div>

          {!piecewiseMode ? (
            <MathExpressionInput
              label="Function f(x)"
              prefixLatex="f(x) ="
              value={expr}
              onChange={(val) => {
                setExpr(val);
                setIsCustom(true);
              }}
              allowedVars={["x"]}
              quickTokens={QUICK_TOKENS_X}
              accentHex="#8D9FCE"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MathExpressionInput
                label="Left branch (x < a)"
                prefixLatex="f_-(x) ="
                value={leftExpr}
                onChange={(val) => {
                  setLeftExpr(val);
                  setIsCustom(true);
                }}
                allowedVars={["x"]}
                quickTokens={QUICK_TOKENS_X}
                accentHex="#8D9FCE"
                compact
              />
              <MathExpressionInput
                label="Right branch (x ≥ a)"
                prefixLatex="f_+(x) ="
                value={rightExpr}
                onChange={(val) => {
                  setRightExpr(val);
                  setIsCustom(true);
                }}
                allowedVars={["x"]}
                quickTokens={QUICK_TOKENS_X}
                accentHex="#96B898"
                compact
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Approach Step <KaTeXMath math="h" />
              </span>
              <span className="font-tabular-mono font-semibold text-[var(--math-ink-z)]">
                h = {stepH >= 0.01 ? stepH.toFixed(3) : stepH.toFixed(4)}
              </span>
            </div>
            <input
              type="range"
              min={-4}
              max={0.18}
              step={0.02}
              value={logH}
              onChange={(e) => {
                setIsAnimating(false);
                setLogH(Number(e.target.value));
              }}
              aria-label="Approach step size h"
              className="w-full accent-[#029091]"
            />
            <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--text-muted)]">
              <span>h = 0.0001 (tight)</span>
              <span>h = 1.5 (wide)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Target Point <KaTeXMath math="a" />
              </span>
              <span className="font-tabular-mono font-semibold text-[var(--math-ink-diff)]">
                a = {targetA.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={Number((plotBounds.xRange[0] + 0.5).toFixed(1))}
              max={Number((plotBounds.xRange[1] - 0.5).toFixed(1))}
              step={0.1}
              value={targetA}
              onChange={(e) => {
                setIsCustom(true);
                setTargetA(Number(e.target.value));
              }}
              aria-label="Target approach point a"
              className="w-full accent-[#FBEAA4]"
            />
            <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--text-muted)]">
              <span>{`x_L = ${analysis.xProbeL.toFixed(3)}`}</span>
              <span>{`x_R = ${analysis.xProbeR.toFixed(3)}`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verdict Banner */}
      <div
        className={`p-3.5 border flex flex-wrap items-center justify-between gap-3 ${
          analysis.verdict.existsFinitely
            ? "border-[var(--math-ink-z)] bg-[#029091]/10"
            : "border-[var(--math-ink-sweep)] bg-[#D35323]/10"
        }`}
      >
        <div className="flex items-start gap-2.5 text-xs font-sans">
          {analysis.verdict.existsFinitely ? (
            <CheckCircle2
              className="w-4 h-4 text-[var(--math-ink-z)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
          ) : analysis.verdict.status === "infinite-same" ? (
            <AlertTriangle
              className="w-4 h-4 text-[var(--math-ink-sweep)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
          ) : (
            <XCircle
              className="w-4 h-4 text-[var(--math-ink-sweep)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
          )}
          <div className="space-y-0.5">
            <span className="font-tabular-mono font-semibold text-[var(--text-primary)] block">
              {analysis.verdict.headline}
            </span>
            <span className="text-[var(--text-secondary)] font-math-serif text-sm block">
              {analysis.verdict.detail}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-tabular-mono">
          <span className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--math-ink-x)]">
            LHL: {formatSideClassification(analysis.lhlClass)}
          </span>
          <span className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--math-ink-y)]">
            RHL: {formatSideClassification(analysis.rhlClass)}
          </span>
          <span className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--math-ink-lower)]">
            f(a):{" "}
            {Number.isFinite(analysis.fAtA)
              ? analysis.fAtA.toFixed(3)
              : "Undefined"}
          </span>
        </div>
      </div>

      {/* Main Plot + Live Convergence Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-2">
          <SvgCoordinatePlane2D
            xRange={plotBounds.xRange}
            yRange={plotBounds.yRange}
            width={width}
            height={height}
            xLabel="x"
            yLabel="f(x)"
            xColor="var(--math-ink-x)"
            yColor="var(--math-ink-y)"
            ariaLabel="Coordinate plot comparing left-hand limit probe a minus h and right-hand limit probe a plus h approaching x equals a"
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

              const aSvgX = toSvgX(targetA);
              const zeroSvgY =
                yMin <= 0 && yMax >= 0 ? toSvgY(0) : toSvgY(yMin);
              const probeLXSvg = toSvgX(analysis.xProbeL);
              const probeRXSvg = toSvgX(analysis.xProbeR);

              const validProbeL =
                Number.isFinite(analysis.yProbeL) &&
                analysis.yProbeL >= yMin - 1 &&
                analysis.yProbeL <= yMax + 1;
              const validProbeR =
                Number.isFinite(analysis.yProbeR) &&
                analysis.yProbeR >= yMin - 1 &&
                analysis.yProbeR <= yMax + 1;

              const lhlHeight =
                analysis.lhlClass.kind === "finite"
                  ? analysis.lhlClass.value
                  : null;
              const rhlHeight =
                analysis.rhlClass.kind === "finite"
                  ? analysis.rhlClass.value
                  : null;
              const fAtAFinite = Number.isFinite(analysis.fAtA)
                ? analysis.fAtA
                : null;

              return (
                <>
                  {/* Vertical Target Reference Line x = a */}
                  <line
                    x1={aSvgX}
                    y1={32}
                    x2={aSvgX}
                    y2={height - 32}
                    stroke="#FBEAA4"
                    strokeDasharray="4 4"
                    strokeOpacity={0.75}
                    strokeWidth={1.25}
                  />

                  {/* Left Branch Segments (x < a) */}
                  {analysis.leftSegments.map((seg, i) => (
                    <polyline
                      key={`l-${i}`}
                      fill="none"
                      stroke="#8D9FCE"
                      strokeWidth={2.4}
                      points={toPoints(seg)}
                    />
                  ))}

                  {/* Right Branch Segments (x > a) */}
                  {analysis.rightSegments.map((seg, i) => (
                    <polyline
                      key={`r-${i}`}
                      fill="none"
                      stroke="#96B898"
                      strokeWidth={2.4}
                      points={toPoints(seg)}
                    />
                  ))}

                  {/* Left Probe Drop Lines & Dot */}
                  {validProbeL && (
                    <>
                      <line
                        x1={probeLXSvg}
                        y1={zeroSvgY}
                        x2={probeLXSvg}
                        y2={toSvgY(clampY(analysis.yProbeL))}
                        stroke="#8D9FCE"
                        strokeDasharray="3 3"
                        strokeOpacity={0.75}
                        strokeWidth={1.1}
                      />
                      <circle
                        cx={probeLXSvg}
                        cy={toSvgY(clampY(analysis.yProbeL))}
                        r={4.5}
                        fill="#8D9FCE"
                        stroke="#1E1F22"
                        strokeWidth={1.2}
                      />
                    </>
                  )}

                  {/* Right Probe Drop Lines & Dot */}
                  {validProbeR && (
                    <>
                      <line
                        x1={probeRXSvg}
                        y1={zeroSvgY}
                        x2={probeRXSvg}
                        y2={toSvgY(clampY(analysis.yProbeR))}
                        stroke="#96B898"
                        strokeDasharray="3 3"
                        strokeOpacity={0.75}
                        strokeWidth={1.1}
                      />
                      <circle
                        cx={probeRXSvg}
                        cy={toSvgY(clampY(analysis.yProbeR))}
                        r={4.5}
                        fill="#96B898"
                        stroke="#1E1F22"
                        strokeWidth={1.2}
                      />
                    </>
                  )}

                  {/* Approach Direction Markers along x-axis */}
                  <polygon
                    points={`${probeLXSvg + 4},${zeroSvgY - 4} ${probeLXSvg + 12},${zeroSvgY} ${probeLXSvg + 4},${zeroSvgY + 4}`}
                    fill="#8D9FCE"
                  />
                  <polygon
                    points={`${probeRXSvg - 4},${zeroSvgY - 4} ${probeRXSvg - 12},${zeroSvgY} ${probeRXSvg - 4},${zeroSvgY + 4}`}
                    fill="#96B898"
                  />

                  {/* Hollow Limit Endpoint Circles at x = a */}
                  {lhlHeight !== null &&
                    lhlHeight >= yMin &&
                    lhlHeight <= yMax && (
                      <>
                        <line
                          x1={32}
                          y1={toSvgY(lhlHeight)}
                          x2={aSvgX}
                          y2={toSvgY(lhlHeight)}
                          stroke="#8D9FCE"
                          strokeDasharray="2 3"
                          strokeOpacity={0.65}
                          strokeWidth={1}
                        />
                        <circle
                          cx={aSvgX}
                          cy={toSvgY(lhlHeight)}
                          r={5}
                          fill="var(--bg-canvas)"
                          stroke="#8D9FCE"
                          strokeWidth={2}
                        />
                      </>
                    )}

                  {rhlHeight !== null &&
                    rhlHeight >= yMin &&
                    rhlHeight <= yMax && (
                      <>
                        <line
                          x1={aSvgX}
                          y1={toSvgY(rhlHeight)}
                          x2={width - 32}
                          y2={toSvgY(rhlHeight)}
                          stroke="#96B898"
                          strokeDasharray="2 3"
                          strokeOpacity={0.65}
                          strokeWidth={1}
                        />
                        <circle
                          cx={aSvgX}
                          cy={toSvgY(rhlHeight)}
                          r={5}
                          fill="var(--bg-canvas)"
                          stroke="#96B898"
                          strokeWidth={2}
                        />
                      </>
                    )}

                  {/* Solid Dot for Actual f(a) if defined */}
                  {fAtAFinite !== null &&
                    fAtAFinite >= yMin &&
                    fAtAFinite <= yMax && (
                      <circle
                        cx={aSvgX}
                        cy={toSvgY(fAtAFinite)}
                        r={4.2}
                        fill="#D5658B"
                        stroke="#1E1F22"
                        strokeWidth={1.2}
                      />
                    )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>

          {/* Compact Visual Legend */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-tabular-mono text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 inline-block"
                style={{ backgroundColor: "#8D9FCE" }}
                aria-hidden="true"
              />
              Left Approach (x → a⁻)
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 inline-block"
                style={{ backgroundColor: "#96B898" }}
                aria-hidden="true"
              />
              Right Approach (x → a⁺)
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 inline-block rounded-full"
                style={{ backgroundColor: "#D5658B" }}
                aria-hidden="true"
              />
              Defined Point f(a)
            </span>
          </div>
        </div>

        {/* Live Convergence Table */}
        <div className="lg:col-span-5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              Numerical LHL vs. RHL Approach Table
            </span>
            <span className="text-xs font-tabular-mono text-[var(--math-ink-diff)]">
              a = {targetA.toFixed(2)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-tabular-mono">
              <thead>
                <tr className="border-b border-[var(--border-strong)] text-[var(--text-muted)]">
                  <th scope="col" className="py-2 pr-2">
                    h
                  </th>
                  <th scope="col" className="py-2 px-2 text-[var(--math-ink-x)]">
                    f(a − h) [LHL]
                  </th>
                  <th scope="col" className="py-2 pl-2 text-[var(--math-ink-y)]">
                    f(a + h) [RHL]
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysis.tableRows.map((row) => (
                  <tr
                    key={row.h}
                    className="border-b border-[var(--border-subtle)] last:border-b-0"
                  >
                    <td className="py-2 pr-2 text-[var(--text-muted)]">
                      {row.h}
                    </td>
                    <td className="py-2 px-2 text-[var(--text-primary)]">
                      {Number.isFinite(row.yL) ? row.yL.toFixed(5) : "NaN"}
                    </td>
                    <td className="py-2 pl-2 text-[var(--text-primary)]">
                      {Number.isFinite(row.yR) ? row.yR.toFixed(5) : "NaN"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Active Interactive Probe Snapshot */}
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1 text-xs font-tabular-mono">
            <div className="flex justify-between">
              <span className="text-[var(--math-ink-x)]">
                Left Probe f({analysis.xProbeL.toFixed(4)}):
              </span>
              <span className="text-[var(--text-primary)] font-semibold">
                {Number.isFinite(analysis.yProbeL)
                  ? analysis.yProbeL.toFixed(5)
                  : "Undefined"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--math-ink-y)]">
                Right Probe f({analysis.xProbeR.toFixed(4)}):
              </span>
              <span className="text-[var(--text-primary)] font-semibold">
                {Number.isFinite(analysis.yProbeR)
                  ? analysis.yProbeR.toFixed(5)
                  : "Undefined"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conceptual Note */}
      {!isCustom && (
        <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs sm:text-sm text-[var(--text-secondary)] font-math-serif leading-relaxed">
          <strong className="text-[var(--text-primary)] font-sans mr-1.5">
            Conceptual Note:
          </strong>
          <MathRichText text={preset.note} />
        </div>
      )}
    </section>
  );
}
