"use client";

import React, { useState, useMemo } from "react";
import { StepForward, FastForward, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives";

interface IVTPreset {
  id: string;
  label: string;
  expr: string;
  defaultA: number;
  defaultB: number;
  defaultTargetN: number;
  xRange: [number, number];
  yRange: [number, number];
  isContinuous: boolean;
  discontinuityKind?: "jump" | "asymptote";
  jumpAt?: { xSplit: number; jumpAmount: number };
  note: string;
}

const IVT_PRESETS: IVTPreset[] = [
  {
    id: "golden-cubic",
    label: "Continuous Cubic: x³ - 2x - 1",
    expr: "x^3 - 2*x - 1",
    defaultA: 1.0,
    defaultB: 2.2,
    defaultTargetN: 0.0,
    xRange: [0.0, 2.6],
    yRange: [-3.0, 4.5],
    isContinuous: true,
    note: "Continuous on [1, 2.2] with f(1) = -2 < 0 and f(2.2) ≈ 5.25 > 0. Bisection converges exponentially at rate 1/2^k to the golden ratio root φ ≈ 1.61803.",
  },
  {
    id: "dottie-cos",
    label: "Transcendental: cos(x) - x",
    expr: "cos(x) - x",
    defaultA: 0.0,
    defaultB: 1.5,
    defaultTargetN: 0.0,
    xRange: [-0.4, 2.0],
    yRange: [-2.0, 2.0],
    isContinuous: true,
    note: "Since cos(x) - x is continuous on [0, 1.5] and flips from +1 to -1.43, IVT guarantees a unique fixed point cos(c) = c at c ≈ 0.739085.",
  },
  {
    id: "multi-root",
    label: "Oscillating: sin(3x) - 0.15x",
    expr: "sin(3*x) - 0.15*x",
    defaultA: 0.2,
    defaultB: 2.6,
    defaultTargetN: 0.0,
    xRange: [0.0, 3.0],
    yRange: [-1.5, 1.5],
    isContinuous: true,
    note: "IVT guarantees AT LEAST one solution to f(c) = N, not uniqueness! Shifting a or b selects which crossing bisection homes in on.",
  },
  {
    id: "jump-counter",
    label: "Jump Trap (IVT Fails): Jump at x = 1.3",
    expr: "x - 2",
    defaultA: 0.4,
    defaultB: 2.1,
    defaultTargetN: 0.0,
    xRange: [0.0, 2.6],
    yRange: [-2.5, 3.2],
    isContinuous: false,
    discontinuityKind: "jump",
    jumpAt: { xSplit: 1.3, jumpAmount: 2.5 },
    note: "CAREFUL! f(a) < 0 < f(b), yet f NEVER equals 0! Because f has a jump discontinuity at x = 1.3, bisection blindly narrows onto the jump—a classic false root!",
  },
  {
    id: "asymptote-counter",
    label: "Vertical Asymptote Trap: 1/(x - 1.2)",
    expr: "1 / (x - 1.2)",
    defaultA: 0.2,
    defaultB: 2.2,
    defaultTargetN: 0.0,
    xRange: [0.0, 2.6],
    yRange: [-4.5, 4.5],
    isContinuous: false,
    discontinuityKind: "asymptote",
    note: "Although f(0.2) = -1 < 0 < 1 = f(2.2), 1/(x - 1.2) diverges across a vertical asymptote at x = 1.2 and has NO root. Continuity on [a, b] is mandatory!",
  },
];

interface BisectionRow {
  iter: number;
  a: number;
  b: number;
  m: number;
  errVal: number;
  width: number;
}

export function IVTBisectionLab() {
  const [presetId, setPresetId] = useState<string>("golden-cubic");
  const preset = useMemo(
    () => IVT_PRESETS.find((p) => p.id === presetId) ?? IVT_PRESETS[0],
    [presetId]
  );

  const [expr, setExpr] = useState<string>(preset.expr);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [leftA, setLeftA] = useState<number>(preset.defaultA);
  const [rightB, setRightB] = useState<number>(preset.defaultB);
  const [targetN, setTargetN] = useState<number>(preset.defaultTargetN);
  const [bisectionSteps, setBisectionSteps] = useState<number>(3);

  const handleSelectPreset = (p: IVTPreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setLeftA(p.defaultA);
    setRightB(p.defaultB);
    setTargetN(p.defaultTargetN);
    setBisectionSteps(3);
    setIsCustom(false);
  };

  const compiled = useMemo(() => compileMathExpression(expr, ["x"]), [expr]);

  const evalF = useMemo(() => {
    return (x: number): number => {
      if (!isCustom && preset.jumpAt) {
        return x < preset.jumpAt.xSplit
          ? x - 2.0
          : x - 2.0 + preset.jumpAt.jumpAmount;
      }
      if (!compiled.valid) return NaN;
      return compiled.evaluate({ x });
    };
  }, [compiled, isCustom, preset]);

  const bisection = useMemo(() => {
    const a0 = Math.min(leftA, rightB);
    const b0 = Math.max(leftA, rightB);
    const fa0 = evalF(a0) - targetN;
    const fb0 = evalF(b0) - targetN;
    const hasSignFlip =
      Number.isFinite(fa0) && Number.isFinite(fb0) && fa0 * fb0 <= 0;

    const history: BisectionRow[] = [];
    let curA = a0;
    let curB = b0;

    if (hasSignFlip) {
      for (let k = 1; k <= bisectionSteps; k++) {
        const m = 0.5 * (curA + curB);
        const fm = evalF(m) - targetN;
        const fa = evalF(curA) - targetN;
        history.push({
          iter: k,
          a: curA,
          b: curB,
          m,
          errVal: fm,
          width: curB - curA,
        });
        if (!Number.isFinite(fm)) break;
        if (Math.abs(fm) < 1e-10) {
          curA = m;
          curB = m;
          break;
        }
        if (fa * fm <= 0) {
          curB = m;
        } else {
          curA = m;
        }
      }
    }

    const activeRow =
      history.length > 0 ? history[history.length - 1] : null;
    const mid = activeRow ? activeRow.m : 0.5 * (a0 + b0);

    // Sample curve segments (breaking across large jumps/asymptotes)
    const [xMin, xMax] = preset.xRange;
    const steps = 240;
    const segments: [number, number][][] = [];
    let currentSeg: [number, number][] = [];
    let prevY: number | null = null;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + ((xMax - xMin) * i) / steps;
      const y = evalF(x);
      if (!Number.isFinite(y) || Math.abs(y) > 8.5) {
        if (currentSeg.length > 1) segments.push(currentSeg);
        currentSeg = [];
        prevY = null;
        continue;
      }
      if (prevY !== null && Math.abs(y - prevY) > 1.8) {
        if (currentSeg.length > 1) segments.push(currentSeg);
        currentSeg = [[x, y]];
      } else {
        currentSeg.push([x, y]);
      }
      prevY = y;
    }
    if (currentSeg.length > 1) segments.push(currentSeg);

    return {
      a0,
      b0,
      fa0,
      fb0,
      hasSignFlip,
      history,
      curA,
      curB,
      mid,
      segments,
    };
  }, [evalF, leftA, rightB, targetN, bisectionSteps, preset.xRange]);

  const toPoly = (
    pts: [number, number][],
    toSvgX: (x: number) => number,
    toSvgY: (y: number) => number,
    yR: [number, number]
  ) =>
    pts
      .map(([px, py]) => {
        const cy = Math.max(yR[0] - 0.4, Math.min(yR[1] + 0.4, py));
        return `${toSvgX(px).toFixed(1)},${toSvgY(cy).toFixed(1)}`;
      })
      .join(" ");

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[#8D9FCE]">
            <span>Lab 1.1.2A</span>
            <span>•</span>
            <span>Continuity, IVT &amp; Bisection</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            Intermediate Value Theorem &amp; Bisection Bracketing Lab
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Test why continuity on <KaTeXMath math="[a, b]" /> guarantees at least
            one crossing <KaTeXMath math="f(c) = N" /> whenever{" "}
            <KaTeXMath math="N" /> lies between <KaTeXMath math="f(a)" /> and{" "}
            <KaTeXMath math="f(b)" />—and watch how bisection fails into traps on
            jump discontinuities and vertical asymptotes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBisectionSteps((s) => Math.min(12, s + 1))}
            disabled={!bisection.hasSignFlip || bisectionSteps >= 12}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[#029091] bg-[var(--bg-canvas)] text-[#029091] disabled:opacity-40"
          >
            <StepForward className="w-3.5 h-3.5" /> Step (+1)
          </button>
          <button
            type="button"
            onClick={() => setBisectionSteps(9)}
            disabled={!bisection.hasSignFlip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] disabled:opacity-40"
          >
            <FastForward className="w-3.5 h-3.5 text-[#D35323]" /> Run 9 Steps
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {IVT_PRESETS.map((p) => {
          const active = !isCustom && p.id === preset.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                active
                  ? "border-[#8D9FCE] bg-[var(--bg-canvas)] text-[#8D9FCE] font-medium"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="lg:col-span-1">
          <MathExpressionInput
            label="Function f(x)"
            prefixLatex="f(x) ="
            value={expr}
            onChange={(val) => {
              setExpr(val);
              setIsCustom(true);
            }}
            allowedVars={["x"]}
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Left Bracket a</span>
            <span className="font-tabular-mono text-[#8D9FCE]">
              a = {leftA.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={preset.xRange[0] + 0.05}
            max={rightB - 0.15}
            step={0.05}
            value={leftA}
            onChange={(e) => {
              setLeftA(Number(e.target.value));
              setBisectionSteps(1);
            }}
            aria-label="Left interval endpoint a"
            className="w-full accent-[#8D9FCE]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Right Bracket b</span>
            <span className="font-tabular-mono text-[#96B898]">
              b = {rightB.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={leftA + 0.15}
            max={preset.xRange[1] - 0.05}
            step={0.05}
            value={rightB}
            onChange={(e) => {
              setRightB(Number(e.target.value));
              setBisectionSteps(1);
            }}
            aria-label="Right interval endpoint b"
            className="w-full accent-[#96B898]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Target Level N</span>
            <span className="font-tabular-mono text-[#D35323]">
              N = {targetN.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={preset.yRange[0] * 0.5}
            max={preset.yRange[1] * 0.5}
            step={0.1}
            value={targetN}
            onChange={(e) => {
              setTargetN(Number(e.target.value));
              setBisectionSteps(1);
            }}
            aria-label="Intermediate target value N"
            className="w-full accent-[#D35323]"
          />
        </div>
      </div>

      {/* Diagnostic Banner */}
      <div
        className={`p-3.5 border flex flex-wrap items-center justify-between gap-3 ${
          !bisection.hasSignFlip
            ? "border-[#AAA36D] bg-[var(--bg-canvas)]"
            : !isCustom && !preset.isContinuous
              ? "border-[#B95869] bg-[#B95869]/10"
              : "border-[#029091] bg-[#029091]/10"
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-sans">
          {!bisection.hasSignFlip ? (
            <AlertTriangle className="w-4 h-4 text-[#AAA36D]" />
          ) : !isCustom && !preset.isContinuous ? (
            <AlertTriangle className="w-4 h-4 text-[#B95869]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#029091]" />
          )}
          <span className="font-semibold text-[var(--text-primary)]">
            {!bisection.hasSignFlip
              ? `No IVT Bracket: f(a) - N (${bisection.fa0.toFixed(
                  2
                )}) and f(b) - N (${bisection.fb0.toFixed(
                  2
                )}) share the same sign.`
              : !isCustom && !preset.isContinuous
                ? `DISCONTINUITY TRAP: Sign flips across [${bisection.a0.toFixed(
                    2
                  )}, ${bisection.b0.toFixed(
                    2
                  )}], but IVT fails because f has a ${
                    preset.discontinuityKind === "jump"
                      ? "jump discontinuity"
                      : "vertical asymptote"
                  }!`
                : `IVT GUARANTEED CROSSING: Current bracket [${bisection.curA.toFixed(
                    4
                  )}, ${bisection.curB.toFixed(4)}], midpoint c ≈ ${bisection.mid.toFixed(
                    5
                  )}.`}
          </span>
        </div>
        <span className="font-tabular-mono text-xs text-[var(--text-secondary)]">
          Step {bisectionSteps} • Width = {(bisection.curB - bisection.curA).toExponential(2)}
        </span>
      </div>

      {/* Visual + Iteration Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            1. Function Curve, Target <KaTeXMath math={`y = ${targetN.toFixed(2)}`} />, and
            Active Bisection Window
          </span>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.yRange}
            width={500}
            height={320}
            xLabel="x"
            yLabel="f(x)"
            xColor="#8D9FCE"
            yColor="#96B898"
            ariaLabel="Intermediate Value Theorem function plot and bisection bracket"
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const bx1 = toSvgX(bisection.curA);
              const bx2 = toSvgX(bisection.curB);
              const mx = toSvgX(bisection.mid);
              const ny = toSvgY(targetN);

              return (
                <>
                  {/* Active narrowed bracket highlight */}
                  {bisection.hasSignFlip && (
                    <rect
                      x={Math.min(bx1, bx2)}
                      y={32}
                      width={Math.max(2, Math.abs(bx2 - bx1))}
                      height={320 - 64}
                      fill="rgba(2, 144, 145, 0.16)"
                      stroke="#029091"
                      strokeWidth={1.2}
                    />
                  )}

                  {/* Target y = N horizontal line */}
                  <line
                    x1={32}
                    y1={ny}
                    x2={500 - 32}
                    y2={ny}
                    stroke="#D35323"
                    strokeWidth={1.6}
                    strokeDasharray="6 3"
                  />

                  {/* Discontinuity vertical indicator if applicable */}
                  {!isCustom && preset.discontinuityKind === "asymptote" && (
                    <line
                      x1={toSvgX(1.2)}
                      y1={32}
                      x2={toSvgX(1.2)}
                      y2={320 - 32}
                      stroke="#B95869"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Curve segments */}
                  {bisection.segments.map((seg, idx) => (
                    <polyline
                      key={idx}
                      fill="none"
                      stroke="#FBEAA4"
                      strokeWidth={2.2}
                      points={toPoly(seg, toSvgX, toSvgY, preset.yRange)}
                    />
                  ))}

                  {/* Initial endpoints */}
                  {Number.isFinite(evalF(bisection.a0)) && (
                    <circle
                      cx={toSvgX(bisection.a0)}
                      cy={toSvgY(
                        Math.max(
                          preset.yRange[0],
                          Math.min(preset.yRange[1], evalF(bisection.a0))
                        )
                      )}
                      r={4.2}
                      fill="#8D9FCE"
                      stroke="#1E1F22"
                      strokeWidth={1.2}
                    />
                  )}
                  {Number.isFinite(evalF(bisection.b0)) && (
                    <circle
                      cx={toSvgX(bisection.b0)}
                      cy={toSvgY(
                        Math.max(
                          preset.yRange[0],
                          Math.min(preset.yRange[1], evalF(bisection.b0))
                        )
                      )}
                      r={4.2}
                      fill="#96B898"
                      stroke="#1E1F22"
                      strokeWidth={1.2}
                    />
                  )}

                  {/* Midpoint marker */}
                  {bisection.hasSignFlip && (
                    <line
                      x1={mx}
                      y1={32}
                      x2={mx}
                      y2={320 - 32}
                      stroke="#D35323"
                      strokeWidth={1.5}
                    />
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Iteration Table */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            2. Bisection Convergence Trace (<KaTeXMath math="\text{width} = \frac{b-a}{2^k}" />)
          </span>
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] max-h-72 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs font-tabular-mono">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] sticky top-0">
                <tr>
                  <th className="p-2">k</th>
                  <th className="p-2">a_k</th>
                  <th className="p-2">b_k</th>
                  <th className="p-2 text-[#D35323]">m_k</th>
                  <th className="p-2">f(m_k)-N</th>
                </tr>
              </thead>
              <tbody>
                {bisection.history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-4 text-center font-sans text-[var(--text-secondary)]"
                    >
                      Adjust endpoints [a, b] or target N so f(a) - N and f(b) - N
                      have opposite signs.
                    </td>
                  </tr>
                ) : (
                  bisection.history.map((row) => (
                    <tr
                      key={row.iter}
                      className="border-b border-[var(--border-subtle)] last:border-b-0"
                    >
                      <td className="p-2 text-[var(--text-secondary)]">{row.iter}</td>
                      <td className="p-2 text-[#8D9FCE]">{row.a.toFixed(4)}</td>
                      <td className="p-2 text-[#96B898]">{row.b.toFixed(4)}</td>
                      <td className="p-2 text-[#D35323] font-semibold">
                        {row.m.toFixed(4)}
                      </td>
                      <td className="p-2 text-[var(--text-primary)]">
                        {row.errVal.toFixed(4)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {!isCustom && (
        <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
          <strong className="text-[var(--text-primary)] font-sans">
            Continuity Takeaway:
          </strong>{" "}
          {preset.note}
        </div>
      )}
    </section>
  );
}
