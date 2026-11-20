"use client";

import React, { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { MathRichText } from "@/components/math/MathRichText";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";
import { compileMathExpression } from "@/lib/mathParser";

interface InfinityPreset {
  id: string;
  label: string;
  expr: string;
  yRange: [number, number];
  asymLeft: number | null;
  asymRight: number | null;
  leftLimitText: string;
  rightLimitText: string;
  envelopeAbsExpr?: string;
  technique: string;
}

const INFINITY_PRESETS: InfinityPreset[] = [
  {
    id: "rational-pdf",
    label: "Rational Dominance (PDF): (3x² − 4)/(5x − 2x²)",
    expr: "(3*x^2 - 4)/(5*x - 2*x^2)",
    yRange: [-4.0, 4.0],
    asymLeft: -1.5,
    asymRight: -1.5,
    leftLimitText: "-3/2 = -1.500",
    rightLimitText: "-3/2 = -1.500",
    technique:
      "Divide numerator and denominator by the highest power $x^2$: $\\frac{3 - 4/x^2}{5/x - 2} \\to -\\frac{3}{2}$ as $x \\to \\pm\\infty$.",
  },
  {
    id: "radical-sign-trap",
    label: "Radical Sign Trap: √(4x² + 1)/x",
    expr: "sqrt(4*x^2 + 1)/x",
    yRange: [-3.5, 3.5],
    asymLeft: -2.0,
    asymRight: 2.0,
    leftLimitText: "-2.000",
    rightLimitText: "+2.000",
    technique:
      "Watch the sign carefully: $\\sqrt{x^2} = |x|$. For $x > 0$, dividing by $x = +\\sqrt{x^2}$ gives $+2$, whereas for $x < 0$, $x = -\\sqrt{x^2}$ flips the asymptote to $-2$!",
  },
  {
    id: "exponential-asym",
    label: "Exponential Asymmetry: exp(0.15x)",
    expr: "exp(0.15*x)",
    yRange: [-1.0, 8.0],
    asymLeft: 0.0,
    asymRight: null,
    leftLimitText: "0.000",
    rightLimitText: "+∞ (Diverges)",
    technique:
      "With positive rate $k > 0$, $e^{kx} \\to +\\infty$ as $x \\to +\\infty$ while $e^{kx} \\to 0$ as $x \\to -\\infty$.",
  },
  {
    id: "euler-compound",
    label: "Euler's Constant e: (1 + 1/x)^x",
    expr: "(1 + 1/x)^x",
    yRange: [0.0, 4.5],
    asymLeft: Math.E,
    asymRight: Math.E,
    leftLimitText: "e ≈ 2.7183",
    rightLimitText: "e ≈ 2.7183",
    technique:
      "Indeterminate form $1^\\infty$: taking $\\ln$ gives $x\\ln(1 + 1/x) = \\frac{\\ln(1 + 1/x)}{1/x} \\to 1$, so the original expression settles at $e^1 = e \\approx 2.71828$.",
  },
  {
    id: "squeeze-infinity",
    label: "Squeeze Decay: 2·sin(x)/x",
    expr: "2*sin(x)/x",
    yRange: [-2.5, 2.5],
    asymLeft: 0.0,
    asymRight: 0.0,
    leftLimitText: "0.000",
    rightLimitText: "0.000",
    envelopeAbsExpr: "2/abs(x)",
    technique:
      "Since $-\\frac{2}{|x|} \\le \\frac{2\\sin x}{x} \\le \\frac{2}{|x|}$ and $\\pm\\frac{2}{|x|} \\to 0$ as $x \\to \\pm\\infty$, the Squeeze Theorem forces the damped oscillation to $0$.",
  },
];

const QUICK_TOKENS_INF = [
  { label: "x²", insert: "x^2" },
  { label: "√()", insert: "sqrt()" },
  { label: "sin()", insert: "sin()" },
  { label: "exp()", insert: "exp()" },
  { label: "ln()", insert: "ln()" },
];

function sampleSegmentsInfinity(
  evalFn: (x: number) => number,
  xRange: [number, number],
  yRange: [number, number],
  samples = 340
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

function estimateTailLimit(evalFn: (x: number) => number, sign: -1 | 1): string {
  const probes = [200, 1000, 5000].map((m) => evalFn(sign * m));
  if (probes.some((v) => !Number.isFinite(v))) return "Undefined / Oscillates";
  const [v1, v2, v3] = probes;
  if (Math.abs(v3) > 200 && Math.abs(v3) > Math.abs(v1) * 1.5) {
    return v3 > 0 ? "+∞ (Diverges)" : "−∞ (Diverges)";
  }
  if (Math.abs(v3 - v2) < 0.03 && Math.abs(v2 - v1) < 0.15) {
    return v3.toFixed(4);
  }
  return "Oscillates / Slow";
}

export function LimitsAtInfinityAndTechniquesLab() {
  const [presetId, setPresetId] = useState<string>("rational-pdf");
  const preset = useMemo(
    () =>
      INFINITY_PRESETS.find((p) => p.id === presetId) ?? INFINITY_PRESETS[0],
    [presetId]
  );

  const [expr, setExpr] = useState<string>(preset.expr);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [horizonM, setHorizonM] = useState<number>(25);

  const handleSelectPreset = (p: InfinityPreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setHorizonM(25);
    setIsCustom(false);
  };

  const compiled = useMemo(() => compileMathExpression(expr, ["x"]), [expr]);
  const compiledEnv = useMemo(
    () =>
      !isCustom && preset.envelopeAbsExpr
        ? compileMathExpression(preset.envelopeAbsExpr, ["x"])
        : null,
    [isCustom, preset]
  );

  const evalF = useMemo(
    () => (x: number) => (compiled.valid ? compiled.evaluate({ x }) : NaN),
    [compiled]
  );

  const plotData = useMemo(() => {
    const xR: [number, number] = [-horizonM, horizonM];
    let yR = preset.yRange;

    if (isCustom) {
      const vals: number[] = [];
      for (let i = 0; i <= 100; i++) {
        const sx = xR[0] + ((xR[1] - xR[0]) * i) / 100;
        const sy = evalF(sx);
        if (Number.isFinite(sy) && Math.abs(sy) < 15) vals.push(sy);
      }
      if (vals.length > 0) {
        const mn = Math.min(...vals, -1);
        const mx = Math.max(...vals, 1);
        const pad = Math.max(0.8, (mx - mn) * 0.2);
        yR = [Math.floor(mn - pad), Math.ceil(mx + pad)];
      } else {
        yR = [-5, 5];
      }
    }

    const curveSegments = sampleSegmentsInfinity(evalF, xR, yR);

    const upperEnv =
      compiledEnv && compiledEnv.valid
        ? sampleSegmentsInfinity(
            (x) => compiledEnv.evaluate({ x }),
            xR,
            yR,
            200
          )
        : [];
    const lowerEnv =
      compiledEnv && compiledEnv.valid
        ? sampleSegmentsInfinity(
            (x) => -compiledEnv.evaluate({ x }),
            xR,
            yR,
            200
          )
        : [];

    const yNegM = evalF(-horizonM);
    const yPosM = evalF(horizonM);

    const leftLimitDisplay = !isCustom
      ? preset.leftLimitText
      : estimateTailLimit(evalF, -1);
    const rightLimitDisplay = !isCustom
      ? preset.rightLimitText
      : estimateTailLimit(evalF, +1);

    return {
      xRange: xR,
      yRange: yR,
      curveSegments,
      upperEnv,
      lowerEnv,
      yNegM,
      yPosM,
      leftLimitDisplay,
      rightLimitDisplay,
    };
  }, [horizonM, preset, isCustom, evalF, compiledEnv]);

  const width = 620;
  const height = 310;

  return (
    <section
      id="limits-at-infinity-techniques"
      className="scroll-mt-24 border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)]">
            <span>Lab 1.1.1B</span>
            <span>•</span>
            <span>Limits at ±∞ &amp; Horizontal Asymptotes</span>
          </div>
          <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
            End Behavior (<KaTeXMath math="x \to \pm\infty" />) &amp; Algebraic
            Technique Workbench
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-math-serif">
            Zoom outward across <KaTeXMath math="[-M, M]" /> to watch leading-term
            dominance, square-root sign flips, exponential asymmetry, and Squeeze
            envelopes govern horizontal asymptotes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSelectPreset(preset)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Reset</span>
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {INFINITY_PRESETS.map((p) => {
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

      {/* Custom Input & Horizon Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] items-center">
        <div className="lg:col-span-7">
          <MathExpressionInput
            label="Function f(x)"
            prefixLatex="f(x) ="
            value={expr}
            onChange={(val) => {
              setExpr(val);
              setIsCustom(true);
            }}
            allowedVars={["x"]}
            quickTokens={QUICK_TOKENS_INF}
            accentHex="#029091"
          />
        </div>

        <div className="lg:col-span-5 space-y-2">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">
              Horizontal Horizon <KaTeXMath math="M" />
            </span>
            <span className="font-tabular-mono font-semibold text-[var(--math-ink-grid)]">
              x ∈ [−{horizonM}, +{horizonM}]
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            step={1}
            value={horizonM}
            onChange={(e) => setHorizonM(Number(e.target.value))}
            aria-label="Horizontal viewing horizon M"
            className="w-full accent-[#AAA36D]"
          />
          <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--text-muted)]">
            <span>Local [−5, +5]</span>
            <span>Far Field [−100, +100]</span>
          </div>
        </div>
      </div>

      {/* Plot + Tail Readouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <SvgCoordinatePlane2D
            xRange={plotData.xRange}
            yRange={plotData.yRange}
            width={width}
            height={height}
            xLabel="x"
            yLabel="f(x)"
            xColor="var(--math-ink-x)"
            yColor="var(--math-ink-y)"
            ariaLabel="Wide-horizon plot showing function end behavior and horizontal asymptotes as x approaches negative and positive infinity"
            className="w-full h-72 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const [yMin, yMax] = plotData.yRange;
              const clampY = (y: number) =>
                Math.max(yMin - 0.5, Math.min(yMax + 0.5, y));
              const toPoints = (seg: [number, number][]) =>
                seg
                  .map(
                    ([px, py]) =>
                      `${toSvgX(px).toFixed(1)},${toSvgY(clampY(py)).toFixed(1)}`
                  )
                  .join(" ");

              return (
                <>
                  {/* Squeeze Envelopes (if preset has one) */}
                  {plotData.upperEnv.map((seg, idx) => (
                    <polyline
                      key={`ue-${idx}`}
                      fill="none"
                      stroke="#AAA36D"
                      strokeDasharray="4 4"
                      strokeOpacity={0.65}
                      strokeWidth={1.3}
                      points={toPoints(seg)}
                    />
                  ))}
                  {plotData.lowerEnv.map((seg, idx) => (
                    <polyline
                      key={`le-${idx}`}
                      fill="none"
                      stroke="#AAA36D"
                      strokeDasharray="4 4"
                      strokeOpacity={0.65}
                      strokeWidth={1.3}
                      points={toPoints(seg)}
                    />
                  ))}

                  {/* Asymptote Lines */}
                  {!isCustom &&
                    preset.asymLeft !== null &&
                    preset.asymLeft >= yMin &&
                    preset.asymLeft <= yMax && (
                      <line
                        x1={32}
                        y1={toSvgY(preset.asymLeft)}
                        x2={toSvgX(0)}
                        y2={toSvgY(preset.asymLeft)}
                        stroke="#8D9FCE"
                        strokeDasharray="5 4"
                        strokeWidth={1.5}
                      />
                    )}
                  {!isCustom &&
                    preset.asymRight !== null &&
                    preset.asymRight >= yMin &&
                    preset.asymRight <= yMax && (
                      <line
                        x1={toSvgX(0)}
                        y1={toSvgY(preset.asymRight)}
                        x2={width - 32}
                        y2={toSvgY(preset.asymRight)}
                        stroke="#96B898"
                        strokeDasharray="5 4"
                        strokeWidth={1.5}
                      />
                    )}

                  {/* Main Function Curve Segments */}
                  {plotData.curveSegments.map((seg, idx) => (
                    <polyline
                      key={`c-${idx}`}
                      fill="none"
                      stroke="#029091"
                      strokeWidth={2.3}
                      points={toPoints(seg)}
                    />
                  ))}

                  {/* Tail Probes at -M and +M */}
                  {Number.isFinite(plotData.yNegM) &&
                    plotData.yNegM >= yMin &&
                    plotData.yNegM <= yMax && (
                      <circle
                        cx={toSvgX(-horizonM)}
                        cy={toSvgY(plotData.yNegM)}
                        r={4.5}
                        fill="#8D9FCE"
                        stroke="#1E1F22"
                        strokeWidth={1.2}
                      />
                    )}
                  {Number.isFinite(plotData.yPosM) &&
                    plotData.yPosM >= yMin &&
                    plotData.yPosM <= yMax && (
                      <circle
                        cx={toSvgX(horizonM)}
                        cy={toSvgY(plotData.yPosM)}
                        r={4.5}
                        fill="#96B898"
                        stroke="#1E1F22"
                        strokeWidth={1.2}
                      />
                    )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Telemetry Readout Cards */}
        <div className="lg:col-span-4 space-y-3 font-tabular-mono text-xs">
          <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-[var(--math-ink-x)] block">
              Left Tail (x → −∞)
            </span>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>f(−{horizonM}):</span>
              <span className="text-[var(--text-primary)] font-semibold">
                {Number.isFinite(plotData.yNegM)
                  ? plotData.yNegM.toFixed(5)
                  : "Undefined"}
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Asymptote Limit:</span>
              <span className="text-[var(--math-ink-x)] font-semibold">
                {plotData.leftLimitDisplay}
              </span>
            </div>
          </div>

          <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-[var(--math-ink-y)] block">
              Right Tail (x → +∞)
            </span>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>f(+{horizonM}):</span>
              <span className="text-[var(--text-primary)] font-semibold">
                {Number.isFinite(plotData.yPosM)
                  ? plotData.yPosM.toFixed(5)
                  : "Undefined"}
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Asymptote Limit:</span>
              <span className="text-[var(--math-ink-y)] font-semibold">
                {plotData.rightLimitDisplay}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Algebraic Technique Note */}
      {!isCustom && (
        <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs sm:text-sm text-[var(--text-secondary)] font-math-serif leading-relaxed">
          <strong className="text-[var(--text-primary)] font-sans mr-1.5">
            Algebraic Technique:
          </strong>
          <MathRichText text={preset.technique} />
        </div>
      )}
    </section>
  );
}
