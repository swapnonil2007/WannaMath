"use client";

import React, { useState, useMemo } from "react";
import { RotateCcw, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives";

interface LimitPreset {
  id: string;
  label: string;
  expr: string;
  targetA: number;
  candidateL: number;
  xRange: [number, number];
  yRange: [number, number];
  defaultEps: number;
  defaultDelta: number;
  hasRemovableHole?: { x: number; filledY: number };
  isJump?: { xSplit: number; leftOffset: number; rightOffset: number };
  limitExists: boolean;
  note: string;
}

const LIMIT_PRESETS: LimitPreset[] = [
  {
    id: "quadratic",
    label: "Smooth Curve: 0.5x² + 0.5 at a = 1",
    expr: "0.5*x^2 + 0.5",
    targetA: 1.0,
    candidateL: 1.0,
    xRange: [-1.0, 3.0],
    yRange: [-0.5, 3.5],
    defaultEps: 0.55,
    defaultDelta: 0.4,
    limitExists: true,
    note: "Because 0.5x² + 0.5 gets steeper to the right of a = 1, the right boundary hits L + ε earlier than the left boundary hits L - ε—requiring symmetric δ to be bounded by the steeper side.",
  },
  {
    id: "removable-hole",
    label: "Removable Hole: (x² - 1)/(x - 1), f(1) = 3.2",
    expr: "x + 1",
    targetA: 1.0,
    candidateL: 2.0,
    xRange: [-0.8, 2.8],
    yRange: [-0.2, 4.0],
    defaultEps: 0.45,
    defaultDelta: 0.4,
    hasRemovableHole: { x: 1.0, filledY: 3.2 },
    limitExists: true,
    note: "Even though the point f(1) = 3.2 sits outside the ε-band, the punctured condition 0 < |x - 1| < δ deliberately excludes x = 1. Every δ ≤ ε succeeds, proving lim_{x→1} f(x) = 2.",
  },
  {
    id: "jump",
    label: "Jump Discontinuity at a = 0",
    expr: "x",
    targetA: 0.0,
    candidateL: 0.0,
    xRange: [-1.8, 1.8],
    yRange: [-2.0, 2.0],
    defaultEps: 0.5,
    defaultDelta: 0.4,
    isJump: { xSplit: 0.0, leftOffset: -1.0, rightOffset: 1.0 },
    limitExists: false,
    note: "Left-hand limit is -1 and right-hand limit is +1. For any ε < 1, NO positive δ > 0 can simultaneously keep both sides inside (L - ε, L + ε).",
  },
  {
    id: "squeeze",
    label: "Squeeze Theorem: x·sin(8/x) at a = 0",
    expr: "x*sin(8/x)",
    targetA: 0.0,
    candidateL: 0.0,
    xRange: [-1.4, 1.4],
    yRange: [-1.5, 1.5],
    defaultEps: 0.45,
    defaultDelta: 0.42,
    limitExists: true,
    note: "Oscillates infinitely fast near x = 0, yet the amplitude envelope ±|x| squeezes the curve cleanly inside (-ε, ε) whenever δ ≤ ε.",
  },
  {
    id: "oscillating",
    label: "Oscillating Singularity: sin(6/x) at a = 0",
    expr: "sin(6/x)",
    targetA: 0.0,
    candidateL: 0.0,
    xRange: [-1.4, 1.4],
    yRange: [-1.5, 1.5],
    defaultEps: 0.5,
    defaultDelta: 0.35,
    limitExists: false,
    note: "No matter how small you shrink δ > 0, sin(6/x) still sweeps all the way up to +1 and down to -1 infinitely many times inside (-δ, δ)—escaping any ε < 1.",
  },
];

export function EpsilonDeltaCorridorLab() {
  const [presetId, setPresetId] = useState<string>("quadratic");
  const preset = useMemo(
    () => LIMIT_PRESETS.find((p) => p.id === presetId) ?? LIMIT_PRESETS[0],
    [presetId]
  );

  const [expr, setExpr] = useState<string>(preset.expr);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [targetA, setTargetA] = useState<number>(preset.targetA);
  const [candidateL, setCandidateL] = useState<number>(preset.candidateL);
  const [epsilon, setEpsilon] = useState<number>(preset.defaultEps);
  const [delta, setDelta] = useState<number>(preset.defaultDelta);

  const handleSelectPreset = (p: LimitPreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setTargetA(p.targetA);
    setCandidateL(p.candidateL);
    setEpsilon(p.defaultEps);
    setDelta(p.defaultDelta);
    setIsCustom(false);
  };

  const compiled = useMemo(() => compileMathExpression(expr, ["x"]), [expr]);

  const evalF = useMemo(() => {
    return (x: number): number => {
      if (!isCustom && preset.isJump) {
        return x < preset.isJump.xSplit
          ? preset.isJump.leftOffset + 0.25 * x
          : preset.isJump.rightOffset + 0.25 * x;
      }
      if (!compiled.valid) return NaN;
      if (Math.abs(x) < 1e-6 && expr.includes("/x")) return NaN;
      return compiled.evaluate({ x });
    };
  }, [compiled, isCustom, preset, expr]);

  const analysis = useMemo(() => {
    const [xMin, xMax] = preset.xRange;
    const globalSteps = 260;

    // Split left and right curves cleanly around jump or hole
    const leftCurve: [number, number][] = [];
    const rightCurve: [number, number][] = [];
    const corridorPassPts: [number, number][] = [];
    const corridorFailPts: [number, number][] = [];

    for (let i = 0; i <= globalSteps; i++) {
      const x = xMin + ((xMax - xMin) * i) / globalSteps;
      const y = evalF(x);
      if (!Number.isFinite(y) || Math.abs(y) > 10) continue;
      if (x < targetA) leftCurve.push([x, y]);
      else rightCurve.push([x, y]);
    }

    // High-density test inside punctured neighborhood 0 < |x - a| < delta
    const testSteps = 280;
    let violations = 0;
    let maxDev = 0;
    for (let i = 0; i <= testSteps; i++) {
      const t = -1 + (2 * i) / testSteps;
      if (Math.abs(t) < 0.012) continue; // exclude exact x = a (0 < |x - a|)
      const x = targetA + t * delta;
      const y = evalF(x);
      if (!Number.isFinite(y)) continue;
      const dev = Math.abs(y - candidateL);
      if (dev > maxDev) maxDev = dev;
      if (dev < epsilon) {
        corridorPassPts.push([x, y]);
      } else {
        violations++;
        corridorFailPts.push([x, y]);
      }
    }

    // Find largest passing delta for Auto-Solve button
    let maxPassingDelta = 0;
    for (let d = 0.02; d <= 1.5; d += 0.02) {
      let ok = true;
      for (let k = 1; k <= 40; k++) {
        for (const sign of [-1, 1]) {
          const tx = targetA + sign * (k / 40) * d;
          const ty = evalF(tx);
          if (!Number.isFinite(ty) || Math.abs(ty - candidateL) >= epsilon) {
            ok = false;
            break;
          }
        }
        if (!ok) break;
      }
      if (ok) maxPassingDelta = d;
      else break;
    }

    return {
      leftCurve,
      rightCurve,
      corridorPassPts,
      corridorFailPts,
      passed: violations === 0 && corridorPassPts.length > 0,
      violations,
      maxDev,
      maxPassingDelta,
    };
  }, [evalF, preset.xRange, targetA, candidateL, epsilon, delta]);

  const autoSolveDelta = () => {
    if (analysis.maxPassingDelta >= 0.02) {
      setDelta(Number((analysis.maxPassingDelta * 0.92).toFixed(2)));
    } else {
      setDelta(0.05);
    }
  };

  const toPoly = (
    pts: [number, number][],
    toSvgX: (x: number) => number,
    toSvgY: (y: number) => number,
    yBounds: [number, number]
  ) =>
    pts
      .map(([px, py]) => {
        const cy = Math.max(yBounds[0] - 0.5, Math.min(yBounds[1] + 0.5, py));
        return `${toSvgX(px).toFixed(1)},${toSvgY(cy).toFixed(1)}`;
      })
      .join(" ");

  const zoomPadX = Math.max(0.45, delta * 1.65);
  const zoomPadY = Math.max(0.45, epsilon * 1.65);
  const zoomXRange: [number, number] = [targetA - zoomPadX, targetA + zoomPadX];
  const zoomYRange: [number, number] = [candidateL - zoomPadY, candidateL + zoomPadY];

  const renderCorridorPlot = (
    xR: [number, number],
    yR: [number, number],
    aria: string,
    w: number,
    h: number
  ) => (
    <SvgCoordinatePlane2D
      xRange={xR}
      yRange={yR}
      width={w}
      height={h}
      xLabel="x"
      yLabel="f(x)"
      xColor="#8D9FCE"
      yColor="#96B898"
      ariaLabel={aria}
      className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
    >
      {({ toSvgX, toSvgY }) => {
        const epsTop = toSvgY(candidateL + epsilon);
        const epsBot = toSvgY(candidateL - epsilon);
        const delLeft = toSvgX(targetA - delta);
        const delRight = toSvgX(targetA + delta);

        const holeX = !isCustom && preset.hasRemovableHole ? preset.hasRemovableHole.x : null;
        const holeFilledY =
          !isCustom && preset.hasRemovableHole ? preset.hasRemovableHole.filledY : null;

        return (
          <>
            {/* Horizontal ε output tolerance band */}
            <rect
              x={32}
              y={Math.min(epsTop, epsBot)}
              width={w - 64}
              height={Math.abs(epsBot - epsTop)}
              fill="rgba(150, 184, 152, 0.14)"
              stroke="#96B898"
              strokeWidth={1}
              strokeDasharray="4 3"
            />

            {/* Vertical δ input corridor */}
            <rect
              x={Math.min(delLeft, delRight)}
              y={32}
              width={Math.abs(delRight - delLeft)}
              height={h - 64}
              fill="rgba(141, 159, 206, 0.14)"
              stroke="#8D9FCE"
              strokeWidth={1}
              strokeDasharray="4 3"
            />

            {/* Target Box intersection */}
            <rect
              x={Math.min(delLeft, delRight)}
              y={Math.min(epsTop, epsBot)}
              width={Math.abs(delRight - delLeft)}
              height={Math.abs(epsBot - epsTop)}
              fill={
                analysis.passed
                  ? "rgba(2, 144, 145, 0.18)"
                  : "rgba(211, 83, 35, 0.18)"
              }
              stroke={analysis.passed ? "#029091" : "#D35323"}
              strokeWidth={1.6}
            />

            {/* Target crosshairs (a, L) */}
            <line
              x1={32}
              y1={toSvgY(candidateL)}
              x2={w - 32}
              y2={toSvgY(candidateL)}
              stroke="#96B898"
              strokeOpacity={0.6}
              strokeWidth={1}
            />
            <line
              x1={toSvgX(targetA)}
              y1={32}
              x2={toSvgX(targetA)}
              y2={h - 32}
              stroke="#8D9FCE"
              strokeOpacity={0.6}
              strokeWidth={1}
            />

            {/* Left & Right Curves */}
            {analysis.leftCurve.length > 1 && (
              <polyline
                fill="none"
                stroke="#AAA36D"
                strokeWidth={2}
                points={toPoly(analysis.leftCurve, toSvgX, toSvgY, yR)}
              />
            )}
            {analysis.rightCurve.length > 1 && (
              <polyline
                fill="none"
                stroke="#AAA36D"
                strokeWidth={2}
                points={toPoly(analysis.rightCurve, toSvgX, toSvgY, yR)}
              />
            )}

            {/* Highlighted passing samples inside δ corridor */}
            {analysis.corridorPassPts.map(([px, py], i) =>
              i % 3 === 0 ? (
                <circle
                  key={`p-${i}`}
                  cx={toSvgX(px)}
                  cy={toSvgY(py)}
                  r={2.1}
                  fill="#029091"
                />
              ) : null
            )}

            {/* Highlighted escaping samples outside ε band */}
            {analysis.corridorFailPts.map(([px, py], i) =>
              i % 3 === 0 ? (
                <circle
                  key={`f-${i}`}
                  cx={toSvgX(px)}
                  cy={toSvgY(Math.max(yR[0], Math.min(yR[1], py)))}
                  r={2.6}
                  fill="#D35323"
                />
              ) : null
            )}

            {/* Removable discontinuity hole vs filled point */}
            {holeX !== null && holeFilledY !== null && (
              <>
                <circle
                  cx={toSvgX(holeX)}
                  cy={toSvgY(candidateL)}
                  r={4.5}
                  fill="#1E1F22"
                  stroke="#FBEAA4"
                  strokeWidth={1.8}
                />
                <circle
                  cx={toSvgX(holeX)}
                  cy={toSvgY(holeFilledY)}
                  r={4.5}
                  fill="#D5658B"
                  stroke="#1E1F22"
                  strokeWidth={1.2}
                />
              </>
            )}
          </>
        );
      }}
    </SvgCoordinatePlane2D>
  );

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[#8D9FCE]">
            <span>Lab 1.1.1A</span>
            <span>•</span>
            <span>Formal Limit Definition</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            Interactive <KaTeXMath math="\varepsilon\text{-}\delta" /> Tolerance
            Corridor Inspector
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Given any output tolerance <KaTeXMath math="\varepsilon > 0" /> around{" "}
            <KaTeXMath math="L" />, tighten the input window{" "}
            <KaTeXMath math="\delta > 0" /> around <KaTeXMath math="a" /> until
            every punctured curve sample (<KaTeXMath math="0 < |x-a| < \delta" />)
            stays trapped inside the box.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={autoSolveDelta}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[#029091] bg-[var(--bg-canvas)] text-[#029091] hover:bg-[#029091]/10"
          >
            <Sparkles className="w-3.5 h-3.5" /> Auto-Find Valid δ
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {LIMIT_PRESETS.map((p) => {
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

      {/* Custom Input & Tolerance Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="lg:col-span-2">
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

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Output Tolerance <KaTeXMath math="\varepsilon" />
              </span>
              <span className="font-tabular-mono font-semibold text-[#96B898]">
                ε = {epsilon.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.08}
              max={1.4}
              step={0.02}
              value={epsilon}
              onChange={(e) => setEpsilon(Number(e.target.value))}
              aria-label="Output tolerance epsilon"
              className="w-full accent-[#96B898]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Input Corridor <KaTeXMath math="\delta" />
              </span>
              <span className="font-tabular-mono font-semibold text-[#8D9FCE]">
                δ = {delta.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.04}
              max={1.5}
              step={0.02}
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              aria-label="Input window delta"
              className="w-full accent-[#8D9FCE]"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Target Point a</span>
              <span className="font-tabular-mono text-[#FBEAA4]">
                a = {targetA.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={preset.xRange[0] + 0.3}
              max={preset.xRange[1] - 0.3}
              step={0.1}
              value={targetA}
              onChange={(e) => setTargetA(Number(e.target.value))}
              aria-label="Target point a"
              className="w-full accent-[#FBEAA4]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Candidate L</span>
              <span className="font-tabular-mono text-[#D35323]">
                L = {candidateL.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={preset.yRange[0] + 0.3}
              max={preset.yRange[1] - 0.3}
              step={0.1}
              value={candidateL}
              onChange={(e) => setCandidateL(Number(e.target.value))}
              aria-label="Candidate limit L"
              className="w-full accent-[#D35323]"
            />
          </div>
        </div>
      </div>

      {/* Verdict Banner */}
      <div
        className={`p-3.5 border flex flex-wrap items-center justify-between gap-3 ${
          analysis.passed
            ? "border-[#029091] bg-[#029091]/10"
            : "border-[#D35323] bg-[#D35323]/10"
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-sans">
          {analysis.passed ? (
            <CheckCircle2 className="w-4 h-4 text-[#029091]" />
          ) : (
            <XCircle className="w-4 h-4 text-[#D35323]" />
          )}
          <span className="font-semibold text-[var(--text-primary)]">
            {analysis.passed
              ? `VALID δ WINDOW: Every sample in 0 < |x - ${targetA.toFixed(
                  2
                )}| < ${delta.toFixed(2)} stays inside (${(
                  candidateL - epsilon
                ).toFixed(2)}, ${(candidateL + epsilon).toFixed(2)}).`
              : `TOLERANCE VIOLATION: ${analysis.violations} punctured samples escape the ε-band (max |f(x) - L| = ${analysis.maxDev.toFixed(
                  3
                )} ≥ ε).`}
          </span>
        </div>
        <span className="font-tabular-mono text-xs text-[var(--text-secondary)]">
          Max valid δ ≈{" "}
          {analysis.maxPassingDelta >= 0.02
            ? analysis.maxPassingDelta.toFixed(2)
            : "None found (Limit DNE at ε)"}
        </span>
      </div>

      {/* Dual Viewports: Global vs Micro-Corridor Zoom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="font-medium text-[var(--text-primary)]">
              1. Global Function &amp; Tolerance Corridor
            </span>
          </div>
          {renderCorridorPlot(
            preset.xRange,
            preset.yRange,
            "Global graph with epsilon and delta neighborhood corridor",
            460,
            300
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="font-medium text-[var(--text-primary)]">
              2. Neighborhood Micro-Zoom Around{" "}
              <KaTeXMath math={`(a, L) = (${targetA.toFixed(2)}, ${candidateL.toFixed(2)})`} />
            </span>
          </div>
          {renderCorridorPlot(
            zoomXRange,
            zoomYRange,
            "Zoomed epsilon-delta neighborhood box around (a, L)",
            460,
            300
          )}
        </div>
      </div>

      {!isCustom && (
        <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
          <strong className="text-[var(--text-primary)] font-sans">
            Conceptual Note:
          </strong>{" "}
          {preset.note}
        </div>
      )}
    </section>
  );
}
