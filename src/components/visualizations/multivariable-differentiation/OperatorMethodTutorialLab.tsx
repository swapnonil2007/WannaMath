"use client";

import React, { useState, useMemo } from "react";
import { RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives";

type OperatorRuleKind =
  | "exponential"
  | "sinusoid"
  | "polynomial"
  | "exp-shift"
  | "double-resonance";

interface OperatorPreset {
  id: string;
  label: string;
  ruleKind: OperatorRuleKind;
  b: number;
  c: number;
  paramA: number; // exponent 'a' or frequency 'ω'
  xRange: [number, number];
  yRange: [number, number];
  gRange: [number, number];
  odeLatex: string;
  ruleBadge: string;
  stepsLatex: string[];
  note: string;
  g: (x: number, b: number, c: number, paramA: number) => number;
  yp: (
    x: number,
    b: number,
    c: number,
    paramA: number
  ) => { value: number; resonant: boolean; denomDesc: string; formulaLatex: string };
}

const OPERATOR_PRESETS: OperatorPreset[] = [
  {
    id: "exp-regular",
    label: "1. Exponential: (D² + 2D + 5)y = 4e^(ax)",
    ruleKind: "exponential",
    b: 2,
    c: 5,
    paramA: 1.0,
    xRange: [-1.0, 2.2],
    yRange: [-1.0, 6.0],
    gRange: [-2.0, 28.0],
    odeLatex: "(D^2 + bD + c)y = 4e^{ax}",
    ruleBadge: "Rule 1: Replace D ↦ a when f(a) ≠ 0",
    stepsLatex: [
      "y_p = \\frac{1}{f(D)}\\left[4e^{ax}\\right]",
      "\\text{Substitute } D \\mapsto a:\\; f(a) = a^2 + ba + c",
      "\\text{If } f(a) \\neq 0:\\; y_p(x) = \\frac{4}{f(a)}e^{ax}",
      "\\text{If } f(a) = 0:\\; y_p(x) = \\frac{4x}{f'(a)}e^{ax} \\;(\\text{or } \\frac{4x^2}{2!}e^{ax}\\text{ if double root})",
    ],
    note: "Exponential functions pass straight through D with eigenvalue a. Only when a hits a root of f(D) does 1/f(a) blow up, triggering an extra factor of x.",
    g: (x, _b, _c, a) => 4 * Math.exp(a * x),
    yp: (x, b, c, a) => {
      const fa = a * a + b * a + c;
      const dfa = 2 * a + b;
      if (Math.abs(fa) > 1e-4) {
        return {
          value: (4 / fa) * Math.exp(a * x),
          resonant: false,
          denomDesc: `f(${a.toFixed(2)}) = ${fa.toFixed(3)}`,
          formulaLatex: `y_p(x) = \\frac{4}{${fa.toFixed(3)}}e^{${a.toFixed(2)}x}`,
        };
      }
      if (Math.abs(dfa) > 1e-4) {
        return {
          value: ((4 * x) / dfa) * Math.exp(a * x),
          resonant: true,
          denomDesc: `f(a)=0, f'(a)=${dfa.toFixed(3)} (Simple Resonance)`,
          formulaLatex: `y_p(x) = \\frac{4x}{${dfa.toFixed(3)}}e^{${a.toFixed(2)}x}`,
        };
      }
      return {
        value: 2 * x * x * Math.exp(a * x),
        resonant: true,
        denomDesc: "f(a)=f'(a)=0, f''(a)=2 (Double Resonance)",
        formulaLatex: `y_p(x) = 2x^2 e^{${a.toFixed(2)}x}`,
      };
    },
  },
  {
    id: "sinusoid",
    label: "2. Sinusoid: (D² + bD + c)y = 3sin(ωx)",
    ruleKind: "sinusoid",
    b: 0.8,
    c: 4.0,
    paramA: 2.0,
    xRange: [0, 6.5],
    yRange: [-3.5, 3.5],
    gRange: [-4.0, 4.0],
    odeLatex: "(D^2 + bD + c)y = 3\\sin(\\omega x)",
    ruleBadge: "Rule 2: Replace D² ↦ -ω², conjugate denominator",
    stepsLatex: [
      "y_p = \\frac{1}{D^2 + bD + c}\\left[3\\sin(\\omega x)\\right]",
      "\\text{Substitute } D^2 \\mapsto -\\omega^2 \\implies \\frac{1}{(c - \\omega^2) + bD}\\left[3\\sin(\\omega x)\\right]",
      "\\text{Rationalize: } \\frac{(c-\\omega^2) - bD}{(c-\\omega^2)^2 - b^2 D^2}\\left[3\\sin(\\omega x)\\right] \\xrightarrow{D^2\\mapsto -\\omega^2} \\frac{3\\bigl[(c-\\omega^2)\\sin(\\omega x) - b\\omega\\cos(\\omega x)\\bigr]}{(c-\\omega^2)^2 + b^2\\omega^2}",
    ],
    note: "Try dragging Damping b → 0 when c = ω² = 4: the denominator vanishes and pure undamped resonance y_p = -(3x / 2ω)cos(ωx) grows linearly!",
    g: (x, _b, _c, w) => 3 * Math.sin(w * x),
    yp: (x, b, c, w) => {
      const re = c - w * w;
      const im = b * w;
      const denom = re * re + im * im;
      if (denom < 1e-4) {
        const val = -(3 * x * Math.cos(w * x)) / (2 * Math.max(w, 0.2));
        return {
          value: val,
          resonant: true,
          denomDesc: "c = ω² and b = 0 (Undamped Resonance!)",
          formulaLatex: `y_p(x) = -\\frac{3x}{${(2 * w).toFixed(2)}}\\cos(${w.toFixed(
            2
          )}x)`,
        };
      }
      const sinC = (3 * re) / denom;
      const cosC = (-3 * im) / denom;
      return {
        value: sinC * Math.sin(w * x) + cosC * Math.cos(w * x),
        resonant: false,
        denomDesc: `(c-ω²)² + (bω)² = ${denom.toFixed(3)}`,
        formulaLatex: `y_p(x) = ${sinC.toFixed(3)}\\sin(${w.toFixed(
          2
        )}x) ${cosC >= 0 ? "+" : "-"} ${Math.abs(cosC).toFixed(3)}\\cos(${w.toFixed(
          2
        )}x)`,
      };
    },
  },
  {
    id: "polynomial",
    label: "3. Polynomial: (D² + bD + c)y = x² + 2x",
    ruleKind: "polynomial",
    b: 2.0,
    c: 2.0,
    paramA: 1.0,
    xRange: [-2.0, 2.5],
    yRange: [-2.0, 6.0],
    gRange: [-2.0, 12.0],
    odeLatex: "(D^2 + bD + c)y = x^2 + 2x",
    ruleBadge: "Rule 3: Binomial series 1/f(D) truncated after D²",
    stepsLatex: [
      "y_p = \\frac{1}{c}\\left(1 + \\frac{bD + D^2}{c}\\right)^{-1}(x^2 + 2x)",
      "\\left(1 + u\\right)^{-1} = 1 - u + u^2 - \\cdots,\\quad u = \\frac{b}{c}D + \\frac{1}{c}D^2",
      "\\text{Keep only up to } D^2:\\; \\frac{1}{c}\\left[1 - \\frac{b}{c}D + \\frac{b^2 - c}{c^2}D^2\\right](x^2 + 2x)",
    ],
    note: "Because D³ annihilates every quadratic polynomial, the infinite geometric series truncates into an exact quadratic particular integral as long as c ≠ 0.",
    g: (x) => x * x + 2 * x,
    yp: (x, b, c) => {
      if (Math.abs(c) < 0.05) {
        return {
          value: NaN,
          resonant: true,
          denomDesc: "c ≈ 0 requires factoring out D and integrating",
          formulaLatex: "\\text{Set } c \\neq 0 \\text{ for direct binomial inversion}",
        };
      }
      const k0 = 1 / c;
      const k1 = -b / (c * c);
      const k2 = (b * b - c) / (c * c * c);
      const val = k0 * (x * x + 2 * x) + k1 * (2 * x + 2) + k2 * 2;
      return {
        value: val,
        resonant: false,
        denomDesc: `Truncated Binomial (c = ${c.toFixed(2)} ≠ 0)`,
        formulaLatex: `y_p(x) = ${k0.toFixed(2)}(x^2+2x) ${
          k1 >= 0 ? "+" : "-"
        } ${Math.abs(k1).toFixed(2)}(2x+2) ${
          k2 >= 0 ? "+" : "-"
        } ${Math.abs(2 * k2).toFixed(2)}`,
      };
    },
  },
  {
    id: "exp-shift",
    label: "4. Exponential Shift: (D² + bD + c)y = e^(ax)cos(2x)",
    ruleKind: "exp-shift",
    b: -2.0,
    c: 5.0,
    paramA: 0.6,
    xRange: [-1.0, 2.8],
    yRange: [-3.0, 3.0],
    gRange: [-4.5, 4.5],
    odeLatex: "(D^2 + bD + c)y = e^{ax}\\cos(2x)",
    ruleBadge: "Rule 4: Pull e^{ax} left via shift D ↦ D + a",
    stepsLatex: [
      "y_p = \\frac{1}{f(D)}\\left[e^{ax}\\cos(2x)\\right] = e^{ax}\\frac{1}{f(D + a)}\\cos(2x)",
      "f(D + a) = (D+a)^2 + b(D+a) + c = D^2 + (2a+b)D + (a^2 + ba + c)",
      "\\text{Now apply Rule 2 (}D^2 \\mapsto -4\\text{) to } \\cos(2x)!",
    ],
    note: "The exponential shift theorem converts products e^{ax}·V(x) into pure V(x) problems inside the shifted operator f(D + a).",
    g: (x, _b, _c, a) => Math.exp(a * x) * Math.cos(2 * x),
    yp: (x, b, c, a) => {
      const bShift = 2 * a + b;
      const cShift = a * a + b * a + c;
      const re = cShift - 4;
      const im = bShift * 2;
      const denom = re * re + im * im;
      if (denom < 1e-4) {
        const val = (x * Math.exp(a * x) * Math.sin(2 * x)) / 4;
        return {
          value: val,
          resonant: true,
          denomDesc: "Shifted Operator Resonant at ω = 2",
          formulaLatex: `y_p(x) = \\frac{x}{4}e^{${a.toFixed(2)}x}\\sin(2x)`,
        };
      }
      const cosC = re / denom;
      const sinC = im / denom;
      const val =
        Math.exp(a * x) * (cosC * Math.cos(2 * x) + sinC * Math.sin(2 * x));
      return {
        value: val,
        resonant: false,
        denomDesc: `Shifted Denom = ${denom.toFixed(3)}`,
        formulaLatex: `y_p(x) = e^{${a.toFixed(2)}x}\\!\\left(${cosC.toFixed(
          3
        )}\\cos(2x) ${sinC >= 0 ? "+" : "-"} ${Math.abs(sinC).toFixed(
          3
        )}\\sin(2x)\\right)`,
      };
    },
  },
  {
    id: "double-resonance",
    label: "5. Double Resonance: (D - a)²y = 4e^(ax)",
    ruleKind: "double-resonance",
    b: -2.0,
    c: 1.0,
    paramA: 1.0,
    xRange: [-0.8, 2.4],
    yRange: [-1.0, 22.0],
    gRange: [-1.0, 40.0],
    odeLatex: "(D - 1)^2 y = 4e^x \\quad (f(1)=f'(1)=0)",
    ruleBadge: "Multiplicity-2 Resonance: y_p = (A x² / 2!) e^{ax}",
    stepsLatex: [
      "f(D) = (D - 1)^2 \\implies f(1) = 0,\\; f'(1) = 0,\\; f''(1) = 2",
      "y_p = e^x \\frac{1}{((D+1) - 1)^2}[4] = e^x \\frac{1}{D^2}[4] = 2x^2 e^x",
    ],
    note: "Using the exponential shift theorem with a = 1 turns 1/(D-1)²[e^x · 4] into e^x (1/D²)[4] = 2x² e^x — showing why multiplicity-m resonance brings x^m / m!.",
    g: (x) => 4 * Math.exp(x),
    yp: (x) => ({
      value: 2 * x * x * Math.exp(x),
      resonant: true,
      denomDesc: "Double Root a = 1 (x²/2! factor)",
      formulaLatex: "y_p(x) = 2x^2 e^x",
    }),
  },
];

export function OperatorMethodTutorialLab() {
  const [presetId, setPresetId] = useState<string>("sinusoid");
  const preset = useMemo(
    () => OPERATOR_PRESETS.find((p) => p.id === presetId) ?? OPERATOR_PRESETS[0],
    [presetId]
  );

  const [b, setB] = useState<number>(preset.b);
  const [c, setC] = useState<number>(preset.c);
  const [paramA, setParamA] = useState<number>(preset.paramA);

  const handleSelectPreset = (p: OperatorPreset) => {
    setPresetId(p.id);
    setB(p.b);
    setC(p.c);
    setParamA(p.paramA);
  };

  const triggerExponentialResonance = () => {
    setPresetId("exp-regular");
    setB(-3.0);
    setC(2.0);
    setParamA(1.0); // (1)^2 - 3(1) + 2 = 0!
  };

  const triggerSinusoidResonance = () => {
    setPresetId("sinusoid");
    setB(0.0);
    setC(4.0);
    setParamA(2.0); // c = ω² = 4, b = 0!
  };

  const computed = useMemo(() => {
    const [xMin, xMax] = preset.xRange;
    const steps = 150;
    const h = 1e-3;

    const ypPts: [number, number][] = [];
    const gPts: [number, number][] = [];
    const residualCheckPts: [number, number][] = [];
    let maxError = 0;

    let sampleMeta = preset.yp(0.5, b, c, paramA);

    for (let i = 0; i <= steps; i++) {
      const x = xMin + ((xMax - xMin) * i) / steps;
      const gVal = preset.g(x, b, c, paramA);
      const ypRes = preset.yp(x, b, c, paramA);
      if (i === Math.floor(steps / 2)) sampleMeta = ypRes;

      if (Number.isFinite(gVal)) gPts.push([x, gVal]);
      if (Number.isFinite(ypRes.value)) {
        ypPts.push([x, ypRes.value]);
        // Numerically differentiate y_p via central differences to verify f(D)[y_p] === g(x)
        const yP = preset.yp(x + h, b, c, paramA).value;
        const yM = preset.yp(x - h, b, c, paramA).value;
        if (Number.isFinite(yP) && Number.isFinite(yM)) {
          const dy = (yP - yM) / (2 * h);
          const d2y = (yP - 2 * ypRes.value + yM) / (h * h);
          const applied = d2y + b * dy + c * ypRes.value;
          residualCheckPts.push([x, applied]);
          const err = Math.abs(applied - gVal);
          if (err > maxError) maxError = err;
        }
      }
    }

    return { ypPts, gPts, residualCheckPts, maxError, sampleMeta };
  }, [preset, b, c, paramA]);

  const toPoly = (
    pts: [number, number][],
    toSvgX: (x: number) => number,
    toSvgY: (y: number) => number,
    range: [number, number]
  ) =>
    pts
      .map(([px, py]) => {
        const cy = Math.max(range[0] - 0.5, Math.min(range[1] + 0.5, py));
        return `${toSvgX(px).toFixed(1)},${toSvgY(cy).toFixed(1)}`;
      })
      .join(" ");

  const isLockedOperator = preset.ruleKind === "double-resonance";

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[#D5658B]">
            <span>Lab 3.1.11A</span>
            <span>•</span>
            <span>Inverse Differential Operators</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            Operator Method (<KaTeXMath math="1/f(D)" />): Rules, Shifts &amp;
            Resonance Verification
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Explore all five inverse operator recipes for{" "}
            <KaTeXMath math="f(D)y = (D^2 + bD + c)y = g(x)" /> and verify numerically
            that differentiating our closed-form <KaTeXMath math="y_p(x)" />{" "}
            reconstructs <KaTeXMath math="g(x)" />.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSelectPreset(preset)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Rule Preset
        </button>
      </div>

      {/* Rule Selectors */}
      <div className="flex flex-wrap gap-2">
        {OPERATOR_PRESETS.map((p) => {
          const active = p.id === preset.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                active
                  ? "border-[#D5658B] bg-[var(--bg-canvas)] text-[#D5658B] font-medium"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Controls & Quick Resonance Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">D-coeff b</span>
            <span className="font-tabular-mono text-[#8D9FCE]">{b.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={-4.0}
            max={4.0}
            step={0.1}
            disabled={isLockedOperator}
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            aria-label="Operator coefficient b"
            className="w-full accent-[#8D9FCE]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Constant c</span>
            <span className="font-tabular-mono text-[#96B898]">{c.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={-2.0}
            max={7.0}
            step={0.1}
            disabled={isLockedOperator}
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            aria-label="Operator constant c"
            className="w-full accent-[#96B898]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">
              {preset.ruleKind === "sinusoid"
                ? "Forcing ω"
                : preset.ruleKind === "polynomial"
                  ? "Degree 2 Fixed"
                  : "Exponent a"}
            </span>
            <span className="font-tabular-mono text-[#D35323]">
              {paramA.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={preset.ruleKind === "sinusoid" ? 0.5 : -1.5}
            max={preset.ruleKind === "sinusoid" ? 3.5 : 2.0}
            step={0.1}
            disabled={
              preset.ruleKind === "polynomial" ||
              preset.ruleKind === "double-resonance"
            }
            value={paramA}
            onChange={(e) => setParamA(Number(e.target.value))}
            aria-label="Forcing parameter"
            className="w-full accent-[#D35323]"
          />
        </div>

        <div className="flex flex-col justify-center gap-1.5">
          <button
            type="button"
            onClick={triggerExponentialResonance}
            className="px-2.5 py-1 text-[11px] font-sans border border-[#D35323] bg-[var(--bg-panel)] text-[#D35323] hover:bg-[var(--bg-canvas)]"
          >
            Trigger Exp Resonance (f(1)=0)
          </button>
          <button
            type="button"
            onClick={triggerSinusoidResonance}
            className="px-2.5 py-1 text-[11px] font-sans border border-[#029091] bg-[var(--bg-panel)] text-[#029091] hover:bg-[var(--bg-canvas)]"
          >
            Trigger Sinusoid Resonance (c=ω²)
          </button>
        </div>
      </div>

      {/* Step-by-Step Symbolic Derivation Panel */}
      <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-tabular-mono uppercase text-[#D5658B]">
            {preset.ruleBadge}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-tabular-mono px-2.5 py-0.5 border ${
              computed.sampleMeta.resonant
                ? "border-[#D35323] text-[#D35323]"
                : "border-[#96B898] text-[#96B898]"
            }`}
          >
            {computed.sampleMeta.resonant && (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            {computed.sampleMeta.denomDesc}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {preset.stepsLatex.map((st, idx) => (
            <div
              key={idx}
              className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto"
            >
              <KaTeXMath math={st} block />
            </div>
          ))}
        </div>

        <div className="p-2.5 border border-[#D5658B]/60 bg-[var(--bg-panel)] text-xs overflow-x-auto">
          <KaTeXMath math={computed.sampleMeta.formulaLatex} block />
        </div>
      </div>

      {/* Dual Synchronized Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: y_p(x) Particular Integral */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="font-medium text-[var(--text-primary)]">
              1. Computed Particular Integral <KaTeXMath math="y_p(x)" />
            </span>
          </div>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.yRange}
            width={460}
            height={280}
            xLabel="x"
            yLabel="y_p(x)"
            xColor="#8D9FCE"
            yColor="#D35323"
            ariaLabel="Particular integral waveform y_p(x)"
            className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) =>
              computed.ypPts.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#D35323"
                  strokeWidth={2.4}
                  points={toPoly(computed.ypPts, toSvgX, toSvgY, preset.yRange)}
                />
              )
            }
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: f(D)[y_p] === g(x) Residual Overlay */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="font-medium text-[var(--text-primary)]">
              2. Verification: <KaTeXMath math="f(D)[y_p](x)" /> vs. Forcing{" "}
              <KaTeXMath math="g(x)" />
            </span>
            <span className="inline-flex items-center gap-1 font-tabular-mono text-xs text-[#96B898]">
              <CheckCircle2 className="w-3.5 h-3.5" /> max|err| ={" "}
              {computed.maxError.toExponential(2)}
            </span>
          </div>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.gRange}
            width={460}
            height={280}
            xLabel="x"
            yLabel="g(x)"
            xColor="#8D9FCE"
            yColor="#96B898"
            ariaLabel="Verification comparing f(D)[y_p] against forcing g(x)"
            className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                {computed.gPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#8D9FCE"
                    strokeWidth={3}
                    strokeOpacity={0.7}
                    points={toPoly(computed.gPts, toSvgX, toSvgY, preset.gRange)}
                  />
                )}
                {computed.residualCheckPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#96B898"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    points={toPoly(
                      computed.residualCheckPts,
                      toSvgX,
                      toSvgY,
                      preset.gRange
                    )}
                  />
                )}
              </>
            )}
          </SvgCoordinatePlane2D>

          <div className="flex flex-wrap gap-4 text-[11px] font-sans text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#8D9FCE] inline-block" /> Target{" "}
              <KaTeXMath math="g(x)" />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-[#96B898] inline-block" />{" "}
              Applied <KaTeXMath math="(D^2 + bD + c)y_p" />
            </span>
          </div>
        </div>
      </div>

      <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
        <strong className="text-[var(--text-primary)] font-sans">
          Rule Takeaway:
        </strong>{" "}
        {preset.note}
      </div>
    </section>
  );
}
