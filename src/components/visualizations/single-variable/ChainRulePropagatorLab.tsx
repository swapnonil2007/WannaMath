"use client";

import React, { useState, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

interface ChainPreset {
  id: string;
  label: string;
  gExpr: string; // u = g(x)
  fExpr: string; // y = f(u)
  defaultX0: number;
  xRange: [number, number];
  uRange: [number, number];
  yRange: [number, number];
  note: string;
}

const CHAIN_PRESETS: ChainPreset[] = [
  {
    id: "harmonic-gaussian",
    label: "Gaussian Bell: f(u) = e^(-u²), u = 1.5x - 0.5",
    gExpr: "1.5*x - 0.5",
    fExpr: "exp(-u^2)",
    defaultX0: 0.7,
    xRange: [-1.5, 2.2],
    uRange: [-2.5, 2.8],
    yRange: [-0.3, 1.4],
    note: "Input step Δx stretches by g'(x₀) = 1.5 into Δu, and then scales by f'(u₀) = -2u₀ e^(-u₀²) into the final output displacement Δy.",
  },
  {
    id: "wave-square",
    label: "Chirp Modulation: f(u) = sin(u), u = x²",
    gExpr: "x^2",
    fExpr: "sin(u)",
    defaultX0: 1.1,
    xRange: [-2.2, 2.2],
    uRange: [-0.5, 4.8],
    yRange: [-1.4, 1.4],
    note: "At x₀ = 0, g'(0) = 0 kills the composite rate (f∘g)'(0) = 0 even though cos(0) = 1! Farther out, faster inner speed u'(x) = 2x compresses the sine waves.",
  },
  {
    id: "sliding-ladder",
    label: "Related-Rates Ladder: y = √(9 - u), u = x²",
    gExpr: "x^2",
    fExpr: "sqrt(max(0.05, 9 - u))",
    defaultX0: 1.8,
    xRange: [0.1, 2.9],
    uRange: [0.0, 9.0],
    yRange: [0.0, 3.2],
    note: "Implicit ladder constraint x² + y² = 9! Pulling the base outward (dx > 0) drives intermediate u = x² upward by 2x, forcing the top height y down at dy/dx = -x/y.",
  },
];

export function ChainRulePropagatorLab() {
  const [presetId, setPresetId] = useState<string>("wave-square");
  const preset = useMemo(
    () => CHAIN_PRESETS.find((p) => p.id === presetId) ?? CHAIN_PRESETS[0],
    [presetId]
  );

  const [gExpr, setGExpr] = useState<string>(preset.gExpr);
  const [fExpr, setFExpr] = useState<string>(preset.fExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [x0, setX0] = useState<number>(preset.defaultX0);
  const [dxStep, setDxStep] = useState<number>(0.25);

  const handleSelectPreset = (p: ChainPreset) => {
    setPresetId(p.id);
    setGExpr(p.gExpr);
    setFExpr(p.fExpr);
    setX0(p.defaultX0);
    setIsCustom(false);
  };

  const compiledG = useMemo(() => compileMathExpression(gExpr, ["x"]), [gExpr]);
  const compiledF = useMemo(() => compileMathExpression(fExpr, ["u"]), [fExpr]);

  const model = useMemo(() => {
    const evalG = (x: number) =>
      compiledG.valid ? compiledG.evaluate({ x }) : NaN;
    const evalF = (u: number) =>
      compiledF.valid ? compiledF.evaluate({ u }) : NaN;

    const h = 1e-4;
    const u0 = evalG(x0);
    const y0 = evalF(u0);
    const gPrime = (evalG(x0 + h) - evalG(x0 - h)) / (2 * h);
    const fPrime = (evalF(u0 + h) - evalF(u0 - h)) / (2 * h);
    const compPrime = gPrime * fPrime;

    const duLin = gPrime * dxStep;
    const dyLin = fPrime * duLin;
    const uTrueNext = evalG(x0 + dxStep);
    const yTrueNext = evalF(uTrueNext);

    const gPts: [number, number][] = [];
    const compPts: [number, number][] = [];
    const fPts: [number, number][] = [];

    const [xMin, xMax] = preset.xRange;
    const [uMin, uMax] = preset.uRange;

    for (let i = 0; i <= 160; i++) {
      const px = xMin + ((xMax - xMin) * i) / 160;
      const pu = evalG(px);
      const py = evalF(pu);
      if (Number.isFinite(pu) && Math.abs(pu) < 20) gPts.push([px, pu]);
      if (Number.isFinite(py) && Math.abs(py) < 20) compPts.push([px, py]);

      const su = uMin + ((uMax - uMin) * i) / 160;
      const sy = evalF(su);
      if (Number.isFinite(sy) && Math.abs(sy) < 20) fPts.push([su, sy]);
    }

    return {
      u0,
      y0,
      gPrime,
      fPrime,
      compPrime,
      duLin,
      dyLin,
      uTrueNext,
      yTrueNext,
      gPts,
      fPts,
      compPts,
    };
  }, [compiledG, compiledF, x0, dxStep, preset.xRange, preset.uRange]);

  const toPoly = (
    pts: [number, number][],
    toSvgX: (x: number) => number,
    toSvgY: (y: number) => number,
    yR: [number, number]
  ) =>
    pts
      .map(([px, py]) => {
        const cy = Math.max(yR[0] - 0.5, Math.min(yR[1] + 0.5, py));
        return `${toSvgX(px).toFixed(1)},${toSvgY(cy).toFixed(1)}`;
      })
      .join(" ");

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)]">
            <span>Lab 1.2.3A</span>
            <span>•</span>
            <span>Chain Rule &amp; Composite Gearboxes</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            Three-Axis Composite Function Rate Propagator
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Trace how a small perturbation <KaTeXMath math="\Delta x" /> amplifies
            through <KaTeXMath math="u = g(x)" /> with gear ratio{" "}
            <KaTeXMath math="du/dx" />, and then through{" "}
            <KaTeXMath math="y = f(u)" /> with gear ratio{" "}
            <KaTeXMath math="dy/du" />.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSelectPreset(preset)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {CHAIN_PRESETS.map((p) => {
          const active = !isCustom && p.id === preset.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                active
                  ? "border-[var(--math-ink-y)] bg-[var(--bg-canvas)] text-[var(--math-ink-y)] font-medium"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Expressions & Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <MathExpressionInput
          label="Inner Map u = g(x)"
          prefixLatex="g(x) ="
          value={gExpr}
          onChange={(val) => {
            setGExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x"]}
        />
        <MathExpressionInput
          label="Outer Map y = f(u)"
          prefixLatex="f(u) ="
          value={fExpr}
          onChange={(val) => {
            setFExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["u"]}
        />
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Input Probe x₀</span>
            <span className="font-tabular-mono text-[var(--math-ink-x)]">
              x₀ = {x0.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={preset.xRange[0] + 0.15}
            max={preset.xRange[1] - 0.15}
            step={0.05}
            value={x0}
            onChange={(e) => setX0(Number(e.target.value))}
            aria-label="Input probe x0"
            className="w-full accent-[#8D9FCE]"
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Input Pulse Δx</span>
            <span className="font-tabular-mono text-[var(--math-ink-sweep)]">
              Δx = {dxStep.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={-0.6}
            max={0.6}
            step={0.05}
            value={dxStep}
            onChange={(e) => setDxStep(Number(e.target.value))}
            aria-label="Input pulse delta x"
            className="w-full accent-[#D35323]"
          />
        </div>
      </div>

      {/* Rate Multiplication Pipeline Readout */}
      <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs overflow-x-auto">
          <KaTeXMath
            math={`\\underbrace{\\frac{dy}{dx}}_{${model.compPrime.toFixed(
              3
            )}} = \\underbrace{\\frac{dy}{du}}_{${model.fPrime.toFixed(
              3
            )}} \\cdot \\underbrace{\\frac{du}{dx}}_{${model.gPrime.toFixed(3)}}`}
          />
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-tabular-mono">
          <span>
            Δx = <strong className="text-[var(--math-ink-x)]">{dxStep.toFixed(3)}</strong>
          </span>
          <span>→</span>
          <span>
            du = <strong className="text-[var(--math-ink-y)]">{model.duLin.toFixed(3)}</strong>
          </span>
          <span>→</span>
          <span>
            dy = <strong className="text-[var(--math-ink-sweep)]">{model.dyLin.toFixed(3)}</strong>
          </span>
        </div>
      </div>

      {/* 3 Synchronized Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stage 1: u = g(x) */}
        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            1. Inner Stage <KaTeXMath math="u = g(x)" />
          </span>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.uRange}
            width={360}
            height={250}
            xLabel="x"
            yLabel="u"
            xColor="#8D9FCE"
            yColor="#96B898"
            ariaLabel="Inner stage u = g(x)"
            onSelectPoint={(wx) => setX0(Number(wx.toFixed(2)))}
            className="w-full h-60 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {model.gPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#96B898"
                    strokeWidth={2.2}
                    points={toPoly(model.gPts, toSvgX, toSvgY, preset.uRange)}
                  />
                )}
                {Number.isFinite(model.u0) && (
                  <>
                    <line
                      x1={toSvgX(x0)}
                      y1={toSvgY(model.u0)}
                      x2={toSvgX(x0 + dxStep)}
                      y2={toSvgY(model.u0)}
                      stroke="#8D9FCE"
                      strokeWidth={2}
                    />
                    <line
                      x1={toSvgX(x0 + dxStep)}
                      y1={toSvgY(model.u0)}
                      x2={toSvgX(x0 + dxStep)}
                      y2={toSvgY(model.u0 + model.duLin)}
                      stroke="#96B898"
                      strokeWidth={2.5}
                    />
                    <circle
                      cx={toSvgX(x0)}
                      cy={toSvgY(model.u0)}
                      r={4.5}
                      fill="#8D9FCE"
                    />
                  </>
                )}
              </>
            )}
          </SvgCoordinatePlane2D>
        </div>

        {/* Stage 2: y = f(u) */}
        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            2. Outer Stage <KaTeXMath math="y = f(u)" />
          </span>
          <SvgCoordinatePlane2D
            xRange={preset.uRange}
            yRange={preset.yRange}
            width={360}
            height={250}
            xLabel="u"
            yLabel="y"
            xColor="#96B898"
            yColor="#D35323"
            ariaLabel="Outer stage y = f(u)"
            className="w-full h-60 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {model.fPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#029091"
                    strokeWidth={2.2}
                    points={toPoly(model.fPts, toSvgX, toSvgY, preset.yRange)}
                  />
                )}
                {Number.isFinite(model.u0) && Number.isFinite(model.y0) && (
                  <>
                    <line
                      x1={toSvgX(model.u0)}
                      y1={toSvgY(model.y0)}
                      x2={toSvgX(model.u0 + model.duLin)}
                      y2={toSvgY(model.y0)}
                      stroke="#96B898"
                      strokeWidth={2}
                    />
                    <line
                      x1={toSvgX(model.u0 + model.duLin)}
                      y1={toSvgY(model.y0)}
                      x2={toSvgX(model.u0 + model.duLin)}
                      y2={toSvgY(model.y0 + model.dyLin)}
                      stroke="#D35323"
                      strokeWidth={2.5}
                    />
                    <circle
                      cx={toSvgX(model.u0)}
                      cy={toSvgY(model.y0)}
                      r={4.5}
                      fill="#96B898"
                    />
                  </>
                )}
              </>
            )}
          </SvgCoordinatePlane2D>
        </div>

        {/* Stage 3: Composite y = f(g(x)) */}
        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            3. Composite <KaTeXMath math="y = (f \circ g)(x)" />
          </span>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.yRange}
            width={360}
            height={250}
            xLabel="x"
            yLabel="y"
            xColor="#8D9FCE"
            yColor="#D35323"
            ariaLabel="Composite function f(g(x))"
            className="w-full h-60 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {model.compPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#FBEAA4"
                    strokeWidth={2.2}
                    points={toPoly(model.compPts, toSvgX, toSvgY, preset.yRange)}
                  />
                )}
                {Number.isFinite(model.y0) && (
                  <>
                    <line
                      x1={toSvgX(x0)}
                      y1={toSvgY(model.y0)}
                      x2={toSvgX(x0 + dxStep)}
                      y2={toSvgY(model.y0)}
                      stroke="#8D9FCE"
                      strokeWidth={2}
                    />
                    <line
                      x1={toSvgX(x0 + dxStep)}
                      y1={toSvgY(model.y0)}
                      x2={toSvgX(x0 + dxStep)}
                      y2={toSvgY(model.y0 + model.dyLin)}
                      stroke="#D35323"
                      strokeWidth={2.5}
                    />
                    <circle
                      cx={toSvgX(x0)}
                      cy={toSvgY(model.y0)}
                      r={4.5}
                      fill="#D35323"
                      stroke="#FBEAA4"
                      strokeWidth={1.3}
                    />
                  </>
                )}
              </>
            )}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {!isCustom && (
        <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
          <strong className="text-[var(--text-primary)] font-sans">
            Gearbox Note:
          </strong>{" "}
          {preset.note}
        </div>
      )}
    </section>
  );
}
