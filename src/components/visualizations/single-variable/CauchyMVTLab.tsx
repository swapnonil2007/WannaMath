"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { MathRichText } from "@/components/math/MathRichText";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";
import { compileMathExpression } from "@/lib/mathParser";

interface CauchyPreset {
  id: string;
  label: string;
  fExpr: string;
  gExpr: string;
  defaultA: number;
  defaultB: number;
  defaultT0: number;
  sliderMin: number;
  sliderMax: number;
  note: string;
}

const CAUCHY_PRESETS: CauchyPreset[] = [
  {
    id: "poly-distinct",
    label: "f(t)=t³, g(t)=t² on [1, 2] (c_f ≠ c_g ≠ c_Cauchy)",
    fExpr: "t^3",
    gExpr: "t^2",
    defaultA: 1.0,
    defaultB: 2.0,
    defaultT0: 1.25,
    sliderMin: 0.2,
    sliderMax: 3.0,
    note: "Separate Lagrange MVT gives $c_f = \\sqrt{7/3} \\approx 1.5275$ and $c_g = 1.5000$, while Cauchy's shared parametric alignment yields $c_{\\text{Cauchy}} = \\frac{14}{9} \\approx 1.5556$. Because $c_f \\neq c_g$, naive division of separate Lagrange results cannot prove Cauchy's theorem!",
  },
  {
    id: "circle-arc",
    label: "Quarter-Circle: f(t)=sin(t), g(t)=cos(t) on [0, π/2]",
    fExpr: "sin(t)",
    gExpr: "cos(t)",
    defaultA: 0.0,
    defaultB: 1.57,
    defaultT0: 0.4,
    sliderMin: -1.5,
    sliderMax: 3.2,
    note: "In the $(g(t), f(t)) = (\\cos t, \\sin t)$-plane, the curve traces the unit circle from $(1, 0)$ to $(0, 1)$. The tangent vector $(-\\sin c, \\cos c)$ aligns parallel to chord $(-1, 1)$ precisely at $c = \\frac{\\pi}{4} \\approx 0.7854$.",
  },
  {
    id: "lagrange-reduction",
    label: "Lagrange Special Case: f(t)=exp(0.6t), g(t)=t on [0, 2]",
    fExpr: "exp(0.6*t)",
    gExpr: "t",
    defaultA: 0.0,
    defaultB: 2.0,
    defaultT0: 0.5,
    sliderMin: -1.5,
    sliderMax: 3.0,
    note: "Setting $g(t) = t$ gives $g'(t) = 1$ and $g(b) - g(a) = b - a$, collapsing Cauchy's Mean Value Theorem straight back into Lagrange's MVT ($c_{\\text{Cauchy}} = c_f \\approx 1.1162$).",
  },
  {
    id: "gprime-zero-fail",
    label: "Ratio Failure (g'=0): f(t)=t³, g(t)=t² on [−1, 1]",
    fExpr: "t^3",
    gExpr: "t^2",
    defaultA: -1.0,
    defaultB: 1.0,
    defaultT0: -0.45,
    sliderMin: -2.0,
    sliderMax: 2.0,
    note: "Here $g(-1) = g(1) = 1$ makes $\\Delta g = 0$ (and $g'(0) = 0$), so the ratio form $\\frac{\\Delta f}{\\Delta g} = \\frac{2}{0}$ is undefined! Yet the cross-multiplied form $[f(b)-f(a)]g'(c) = [g(b)-g(a)]f'(c)$ holds cleanly at $c = 0$ with horizontal velocity $(0, 0)$?",
  },
];

// Refine note for gprime-zero-fail accurately: at c = 0, (g'(0), f'(0)) = (0, 0) and 2*g'(0) = 0 = 0*f'(0).
CAUCHY_PRESETS[3].note =
  "Here $g(-1) = g(1) = 1$ makes $\\Delta g = 0$ (and $g'(0) = 0$), so the ratio form $\\frac{\\Delta f}{\\Delta g} = \\frac{2}{0}$ is undefined! Yet the cross-multiplied equation $[f(b)-f(a)]\\,g'(c) = [g(b)-g(a)]\\,f'(c)$ holds cleanly at $c = 0$ where $2\\cdot 0 = 0\\cdot 0$.";

const QUICK_TOKENS_T = [
  { label: "t²", insert: "t^2" },
  { label: "t³", insert: "t^3" },
  { label: "sin()", insert: "sin()" },
  { label: "cos()", insert: "cos()" },
  { label: "exp()", insert: "exp()" },
  { label: "ln()", insert: "ln()" },
];

function getOneSidedDerivT(evalFn: (t: number) => number, t: number) {
  const h = 1e-4;
  const ft = evalFn(t);
  const fL = evalFn(t - h);
  const fR = evalFn(t + h);
  const dL = (ft - fL) / h;
  const dR = (fR - ft) / h;
  const cDiff = (fR - fL) / (2 * h);
  const valid =
    Number.isFinite(ft) &&
    Number.isFinite(dL) &&
    Number.isFinite(dR) &&
    Math.abs(dL) < 200 &&
    Math.abs(dR) < 200;
  return { dL, dR, cDiff, isDifferentiable: valid && Math.abs(dR - dL) <= 0.35 };
}

function solveScalarTargetPoints(
  evalFn: (t: number) => number,
  a: number,
  b: number,
  targetSlope: number
): number[] {
  if (!Number.isFinite(targetSlope)) return [];
  const span = Math.max(b - a, 1e-6);
  const margin = Math.min(0.015, span * 0.015);
  const sStart = a + margin;
  const sEnd = b - margin;
  const steps = 220;
  const roots: number[] = [];

  for (let i = 0; i < steps; i++) {
    const tL = sStart + ((sEnd - sStart) * i) / steps;
    const tR = sStart + ((sEnd - sStart) * (i + 1)) / steps;
    const dL = getOneSidedDerivT(evalFn, tL);
    const dR = getOneSidedDerivT(evalFn, tR);
    if (!dL.isDifferentiable || !dR.isDifferentiable) continue;
    const gL = dL.cDiff - targetSlope;
    const gR = dR.cDiff - targetSlope;

    if (Math.abs(gL) < 1e-3) {
      if (roots.every((c) => Math.abs(c - tL) > 0.03)) roots.push(tL);
      continue;
    }
    if (gL * gR < 0) {
      let lo = tL;
      let hi = tR;
      let loVal = gL;
      for (let k = 0; k < 26; k++) {
        const mid = 0.5 * (lo + hi);
        const mVal = getOneSidedDerivT(evalFn, mid).cDiff - targetSlope;
        if (loVal * mVal <= 0) hi = mid;
        else {
          lo = mid;
          loVal = mVal;
        }
      }
      const cand = 0.5 * (lo + hi);
      const chk = getOneSidedDerivT(evalFn, cand);
      if (chk.isDifferentiable && Math.abs(chk.cDiff - targetSlope) < 0.04) {
        if (roots.every((c) => Math.abs(c - cand) > 0.03)) roots.push(cand);
      }
    }
  }
  return roots;
}

export function CauchyMVTLab() {
  const [presetId, setPresetId] = useState<string>("poly-distinct");
  const preset = useMemo(
    () => CAUCHY_PRESETS.find((p) => p.id === presetId) ?? CAUCHY_PRESETS[0],
    [presetId]
  );

  const [fExpr, setFExpr] = useState<string>(preset.fExpr);
  const [gExpr, setGExpr] = useState<string>(preset.gExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [boundA, setBoundA] = useState<number>(preset.defaultA);
  const [boundB, setBoundB] = useState<number>(preset.defaultB);
  const [probeT0, setProbeT0] = useState<number>(preset.defaultT0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [snapIndex, setSnapIndex] = useState<number>(0);

  useEffect(() => {
    if (!isAnimating) return;
    const id = window.setInterval(() => {
      setProbeT0((prev) => {
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

  const handleSelectPreset = (p: CauchyPreset) => {
    setIsAnimating(false);
    setPresetId(p.id);
    setFExpr(p.fExpr);
    setGExpr(p.gExpr);
    setBoundA(p.defaultA);
    setBoundB(p.defaultB);
    setProbeT0(p.defaultT0);
    setSnapIndex(0);
    setIsCustom(false);
  };

  const compiledF = useMemo(() => compileMathExpression(fExpr, ["t"]), [fExpr]);
  const compiledG = useMemo(() => compileMathExpression(gExpr, ["t"]), [gExpr]);

  const evalF = useMemo(
    () => (t: number) => (compiledF.valid ? compiledF.evaluate({ t }) : NaN),
    [compiledF]
  );
  const evalG = useMemo(
    () => (t: number) => (compiledG.valid ? compiledG.evaluate({ t }) : NaN),
    [compiledG]
  );

  const analysis = useMemo(() => {
    const fa = evalF(boundA);
    const fb = evalF(boundB);
    const ga = evalG(boundA);
    const gb = evalG(boundB);
    const df = fb - fa;
    const dg = gb - ga;
    const span = Math.max(boundB - boundA, 1e-6);

    // Check g'(t) != 0 across (a, b)
    let gPrimeZeroDetected = Math.abs(dg) < 1e-4;
    const sampleN = 180;
    const paramPts: [number, number][] = [];
    const fPts: [number, number][] = [];
    const gPts: [number, number][] = [];

    for (let i = 0; i <= sampleN; i++) {
      const t = boundA + (span * i) / sampleN;
      const ft = evalF(t);
      const gt = evalG(t);
      if (Number.isFinite(ft)) fPts.push([t, ft]);
      if (Number.isFinite(gt)) gPts.push([t, gt]);
      if (Number.isFinite(ft) && Number.isFinite(gt)) {
        paramPts.push([gt, ft]);
      }
      if (i > 2 && i < sampleN - 2) {
        const gd = getOneSidedDerivT(evalG, t);
        if (gd.isDifferentiable && Math.abs(gd.cDiff) < 0.03) {
          gPrimeZeroDetected = true;
        }
      }
    }

    // Solve Cauchy shared points c: df * g'(c) - dg * f'(c) = 0
    const cauchyPoints: number[] = [];
    if (Number.isFinite(df) && Number.isFinite(dg)) {
      const margin = Math.min(0.015, span * 0.015);
      const sStart = boundA + margin;
      const sEnd = boundB - margin;
      const steps = 240;

      const evalResidual = (t: number) => {
        const fd = getOneSidedDerivT(evalF, t);
        const gd = getOneSidedDerivT(evalG, t);
        return {
          ok: fd.isDifferentiable && gd.isDifferentiable,
          val: df * gd.cDiff - dg * fd.cDiff,
        };
      };

      for (let i = 0; i < steps; i++) {
        const tL = sStart + ((sEnd - sStart) * i) / steps;
        const tR = sStart + ((sEnd - sStart) * (i + 1)) / steps;
        const rL = evalResidual(tL);
        const rR = evalResidual(tR);
        if (!rL.ok || !rR.ok) continue;

        if (Math.abs(rL.val) < 1e-3) {
          if (cauchyPoints.every((c) => Math.abs(c - tL) > 0.03)) {
            cauchyPoints.push(tL);
          }
          continue;
        }

        if (rL.val * rR.val < 0) {
          let lo = tL;
          let hi = tR;
          let loVal = rL.val;
          for (let k = 0; k < 28; k++) {
            const mid = 0.5 * (lo + hi);
            const rM = evalResidual(mid);
            if (loVal * rM.val <= 0) hi = mid;
            else {
              lo = mid;
              loVal = rM.val;
            }
          }
          const cand = 0.5 * (lo + hi);
          const chk = evalResidual(cand);
          if (chk.ok && Math.abs(chk.val) < 0.05) {
            if (cauchyPoints.every((c) => Math.abs(c - cand) > 0.03)) {
              cauchyPoints.push(cand);
            }
          }
        }
      }
    }

    // Separate Lagrange points c_f and c_g for comparison
    const lagrangeFPoints = solveScalarTargetPoints(evalF, boundA, boundB, df / span);
    const lagrangeGPoints = solveScalarTargetPoints(evalG, boundA, boundB, dg / span);

    // Parametric bounds (g(t), f(t))
    const gxVals = paramPts.map(([gx]) => gx);
    const fyVals = paramPts.map(([, fy]) => fy);
    const gxMin = gxVals.length > 0 ? Math.min(...gxVals) : -1;
    const gxMax = gxVals.length > 0 ? Math.max(...gxVals) : 1;
    const fyMin = fyVals.length > 0 ? Math.min(...fyVals) : -1;
    const fyMax = fyVals.length > 0 ? Math.max(...fyVals) : 1;
    const gPad = Math.max(0.35, (gxMax - gxMin) * 0.25);
    const fPad = Math.max(0.35, (fyMax - fyMin) * 0.25);
    const paramXRange: [number, number] = [gxMin - gPad, gxMax + gPad];
    const paramYRange: [number, number] = [fyMin - fPad, fyMax + fPad];

    // Component plot bounds over t in [a, b]
    const allCompY = [...fPts.map(([, y]) => y), ...gPts.map(([, y]) => y)];
    const cyMin = allCompY.length > 0 ? Math.min(...allCompY) : -2;
    const cyMax = allCompY.length > 0 ? Math.max(...allCompY) : 2;
    const cyPad = Math.max(0.4, (cyMax - cyMin) * 0.2);
    const compXRange: [number, number] = [boundA - span * 0.08, boundB + span * 0.08];
    const compYRange: [number, number] = [cyMin - cyPad, cyMax + cyPad];

    const ft0 = evalF(probeT0);
    const gt0 = evalG(probeT0);
    const fDeriv0 = getOneSidedDerivT(evalF, probeT0);
    const gDeriv0 = getOneSidedDerivT(evalG, probeT0);

    const chordNorm = Math.hypot(dg, df);
    const velNorm = Math.hypot(gDeriv0.cDiff, fDeriv0.cDiff);
    const isParallelNow =
      chordNorm > 1e-6 &&
      velNorm > 1e-6 &&
      Math.abs((dg / chordNorm) * (fDeriv0.cDiff / velNorm) - (df / chordNorm) * (gDeriv0.cDiff / velNorm)) <
        0.04;

    const lhsCross = df * gDeriv0.cDiff;
    const rhsCross = dg * fDeriv0.cDiff;
    const chordRatio = Math.abs(dg) > 1e-4 ? df / dg : NaN;
    const tangentRatio =
      Math.abs(gDeriv0.cDiff) > 1e-4 ? fDeriv0.cDiff / gDeriv0.cDiff : NaN;

    return {
      fa,
      fb,
      ga,
      gb,
      df,
      dg,
      chordNorm,
      velNorm,
      gPrimeZeroDetected,
      paramPts,
      fPts,
      gPts,
      cauchyPoints,
      lagrangeFPoints,
      lagrangeGPoints,
      paramXRange,
      paramYRange,
      compXRange,
      compYRange,
      ft0,
      gt0,
      fDeriv0,
      gDeriv0,
      isParallelNow,
      lhsCross,
      rhsCross,
      chordRatio,
      tangentRatio,
    };
  }, [evalF, evalG, boundA, boundB, probeT0]);

  const handleSnapToCauchy = () => {
    if (analysis.cauchyPoints.length === 0) return;
    setIsAnimating(false);
    const targetC =
      analysis.cauchyPoints[snapIndex % analysis.cauchyPoints.length];
    setProbeT0(Number(targetC.toFixed(3)));
    setSnapIndex((prev) => prev + 1);
  };

  const sliderMin = !isCustom ? preset.sliderMin : -3.0;
  const sliderMax = !isCustom ? preset.sliderMax : 3.5;

  const width = 460;
  const height = 310;

  return (
    <section
      id="cauchy-parametric-tangent"
      className="scroll-mt-24 border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)]">
            <span>Lab 1.2.5c</span>
            <span>•</span>
            <span>Cauchy&apos;s Extended Mean Value Theorem</span>
          </div>
          <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
            Cauchy&apos;s MVT Parametric Chord-Tangent &amp;{" "}
            <KaTeXMath math="c_f \neq c_g" /> Lab
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-math-serif">
            Plot <KaTeXMath math="P(t) = (g(t), f(t))" /> in the parametric plane
            and sweep <KaTeXMath math="t_0 \in [a, b]" /> until the velocity
            vector <KaTeXMath math="(g'(t_0), f'(t_0))" /> runs parallel to chord{" "}
            <KaTeXMath math="\overline{AB}" />—while comparing{" "}
            <KaTeXMath math="c_{\text{Cauchy}}" /> against separate Lagrange
            points <KaTeXMath math="c_f, c_g" />.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!isAnimating && probeT0 >= boundB - 0.02) {
                setProbeT0(boundA);
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
                <span>Sweep t₀</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSnapToCauchy}
            disabled={analysis.cauchyPoints.length === 0}
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
        {CAUCHY_PRESETS.map((p) => {
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

      {/* Custom Functions & Interval Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MathExpressionInput
            label="Vertical component f(t)"
            prefixLatex="f(t) ="
            value={fExpr}
            onChange={(val) => {
              setFExpr(val);
              setIsCustom(true);
            }}
            allowedVars={["t"]}
            quickTokens={QUICK_TOKENS_T}
            accentHex="#029091"
            compact
          />
          <MathExpressionInput
            label="Horizontal component g(t)"
            prefixLatex="g(t) ="
            value={gExpr}
            onChange={(val) => {
              setGExpr(val);
              setIsCustom(true);
            }}
            allowedVars={["t"]}
            quickTokens={QUICK_TOKENS_T}
            accentHex="#96B898"
            compact
          />
        </div>

        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
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
                setProbeT0((prev) => Math.max(v, Math.min(boundB, prev)));
                setIsCustom(true);
              }}
              aria-label="Left parameter endpoint a"
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
                setProbeT0((prev) => Math.max(boundA, Math.min(v, prev)));
                setIsCustom(true);
              }}
              aria-label="Right parameter endpoint b"
              className="w-full accent-[#96B898]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Parameter <KaTeXMath math="t_0" />
              </span>
              <span className="font-tabular-mono font-semibold text-[var(--math-ink-sweep)]">
                t₀ = {probeT0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={boundA}
              max={boundB}
              step={0.01}
              value={probeT0}
              onChange={(e) => {
                setIsAnimating(false);
                setProbeT0(Number(e.target.value));
              }}
              aria-label="Parameter probe t0"
              className="w-full accent-[#D35323]"
            />
          </div>
        </div>
      </div>

      {/* Ratio vs Cross-Multiplied Status Banner */}
      <div
        className={`p-3.5 border flex flex-wrap items-center justify-between gap-3 text-xs font-sans ${
          analysis.gPrimeZeroDetected
            ? "border-[var(--math-ink-sweep)] bg-[#D35323]/10"
            : "border-[var(--math-ink-z)] bg-[#029091]/10"
        }`}
      >
        <div className="flex items-start gap-2">
          {analysis.gPrimeZeroDetected ? (
            <AlertTriangle
              className="w-4 h-4 text-[var(--math-ink-sweep)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
          ) : (
            <CheckCircle2
              className="w-4 h-4 text-[var(--math-ink-z)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
          )}
          <span className="text-[var(--text-primary)] font-math-serif text-sm">
            {analysis.gPrimeZeroDetected ? (
              <>
                <strong>Ratio Guard Triggered:</strong>{" "}
                <KaTeXMath math="g'(t) = 0" /> or{" "}
                <KaTeXMath math="g(b) = g(a)" /> occurs on{" "}
                <KaTeXMath math="[a, b]" />—so division by{" "}
                <KaTeXMath math="g'(c)" /> / <KaTeXMath math="\Delta g" /> can fail,
                while the <strong>cross-multiplied form</strong> always holds!
              </>
            ) : (
              <>
                <strong>Ratio &amp; Cross-Multiplied Forms Both Valid:</strong>{" "}
                <KaTeXMath math="g'(t) \neq 0" /> throughout{" "}
                <KaTeXMath math="(a, b)" />, guaranteeing{" "}
                <KaTeXMath math="g(b) \neq g(a)" /> by Rolle&apos;s Theorem.
              </>
            )}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 font-tabular-mono">
          <span className="px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--math-ink-diff)]">
            c_Cauchy:{" "}
            {analysis.cauchyPoints.length > 0
              ? analysis.cauchyPoints.map((c) => c.toFixed(3)).join(", ")
              : "None"}
          </span>
          <span className="px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--math-ink-z)]">
            c_f:{" "}
            {analysis.lagrangeFPoints.length > 0
              ? analysis.lagrangeFPoints.map((c) => c.toFixed(3)).join(", ")
              : "None"}
          </span>
          <span className="px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--math-ink-y)]">
            c_g:{" "}
            {analysis.lagrangeGPoints.length > 0
              ? analysis.lagrangeGPoints.map((c) => c.toFixed(3)).join(", ")
              : "None"}
          </span>
        </div>
      </div>

      {/* Dual Synchronized 2D Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Parametric Plane (g(t), f(t)) */}
        <div className="space-y-2">
          <span className="text-xs font-tabular-mono text-[var(--text-primary)] block">
            1. Parametric Plane <KaTeXMath math="P(t) = (g(t), f(t))" /> &amp;
            Chord <KaTeXMath math="\overline{AB}" />
          </span>
          <SvgCoordinatePlane2D
            xRange={analysis.paramXRange}
            yRange={analysis.paramYRange}
            width={width}
            height={height}
            xLabel="g(t)"
            yLabel="f(t)"
            xColor="var(--math-ink-y)"
            yColor="var(--math-ink-z)"
            ariaLabel="Parametric (g(t), f(t)) plane showing trajectory, endpoint chord AB, and live tangent velocity vector"
            className="w-full h-76 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const toPoly = (pts: [number, number][]) =>
                pts
                  .map(([gx, fy]) => `${toSvgX(gx).toFixed(1)},${toSvgY(fy).toFixed(1)}`)
                  .join(" ");

              const pSvgX = toSvgX(analysis.gt0);
              const pSvgY = toSvgY(analysis.ft0);
              const xSpan = Math.max(
                analysis.paramXRange[1] - analysis.paramXRange[0],
                1
              );
              const ySpan = Math.max(
                analysis.paramYRange[1] - analysis.paramYRange[0],
                1
              );
              const scaleFactor =
                analysis.velNorm > 1e-6
                  ? Math.min(xSpan, ySpan) * 0.25 / analysis.velNorm
                  : 0;
              const vEndX = analysis.gt0 + analysis.gDeriv0.cDiff * scaleFactor;
              const vEndY = analysis.ft0 + analysis.fDeriv0.cDiff * scaleFactor;
              const vSvgEndX = toSvgX(vEndX);
              const vSvgEndY = toSvgY(vEndY);

              // Arrowhead triangle at velocity tip
              const uxSvg = vSvgEndX - pSvgX;
              const uySvg = vSvgEndY - pSvgY;
              const lenSvg = Math.hypot(uxSvg, uySvg);
              const arrowPts =
                lenSvg > 8
                  ? (() => {
                      const nx = uxSvg / lenSvg;
                      const ny = uySvg / lenSvg;
                      const bx = vSvgEndX - nx * 8;
                      const by = vSvgEndY - ny * 8;
                      return `${vSvgEndX.toFixed(1)},${vSvgEndY.toFixed(1)} ${(
                        bx -
                        ny * 4
                      ).toFixed(1)},${(by + nx * 4).toFixed(1)} ${(
                        bx +
                        ny * 4
                      ).toFixed(1)},${(by - nx * 4).toFixed(1)}`;
                    })()
                  : "";

              return (
                <>
                  {/* Parametric Curve */}
                  {analysis.paramPts.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#029091"
                      strokeWidth={2.5}
                      points={toPoly(analysis.paramPts)}
                    />
                  )}

                  {/* Endpoint Secant Chord AB */}
                  {Number.isFinite(analysis.ga) &&
                    Number.isFinite(analysis.fa) &&
                    Number.isFinite(analysis.gb) &&
                    Number.isFinite(analysis.fb) && (
                      <line
                        x1={toSvgX(analysis.ga)}
                        y1={toSvgY(analysis.fa)}
                        x2={toSvgX(analysis.gb)}
                        y2={toSvgY(analysis.fb)}
                        stroke="#8D9FCE"
                        strokeDasharray="5 3"
                        strokeWidth={1.8}
                      />
                    )}

                  {/* Verified Cauchy Solutions on Parametric Curve */}
                  {analysis.cauchyPoints.map((cVal, idx) => {
                    const gx = evalG(cVal);
                    const fy = evalF(cVal);
                    if (!Number.isFinite(gx) || !Number.isFinite(fy)) return null;
                    return (
                      <circle
                        key={`pc-${idx}`}
                        cx={toSvgX(gx)}
                        cy={toSvgY(fy)}
                        r={5}
                        fill="#FBEAA4"
                        stroke="#1E1F22"
                        strokeWidth={1.3}
                      />
                    );
                  })}

                  {/* Endpoints A and B */}
                  {Number.isFinite(analysis.ga) && Number.isFinite(analysis.fa) && (
                    <circle
                      cx={toSvgX(analysis.ga)}
                      cy={toSvgY(analysis.fa)}
                      r={4.2}
                      fill="#8D9FCE"
                      stroke="#1E1F22"
                      strokeWidth={1.2}
                    />
                  )}
                  {Number.isFinite(analysis.gb) && Number.isFinite(analysis.fb) && (
                    <circle
                      cx={toSvgX(analysis.gb)}
                      cy={toSvgY(analysis.fb)}
                      r={4.2}
                      fill="#96B898"
                      stroke="#1E1F22"
                      strokeWidth={1.2}
                    />
                  )}

                  {/* Velocity Tangent Vector at t0 */}
                  {Number.isFinite(pSvgX) &&
                    Number.isFinite(pSvgY) &&
                    lenSvg > 4 && (
                      <>
                        <line
                          x1={pSvgX}
                          y1={pSvgY}
                          x2={vSvgEndX}
                          y2={vSvgEndY}
                          stroke={analysis.isParallelNow ? "#029091" : "#D35323"}
                          strokeWidth={2.2}
                        />
                        {arrowPts && (
                          <polygon
                            points={arrowPts}
                            fill={analysis.isParallelNow ? "#029091" : "#D35323"}
                          />
                        )}
                      </>
                    )}

                  {/* Probe Point P(t0) */}
                  {Number.isFinite(pSvgX) && Number.isFinite(pSvgY) && (
                    <circle
                      cx={pSvgX}
                      cy={pSvgY}
                      r={4.8}
                      fill={analysis.isParallelNow ? "#029091" : "#D35323"}
                      stroke="#1E1F22"
                      strokeWidth={1.3}
                    />
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: Component Functions f(t) and g(t) vs t */}
        <div className="space-y-2">
          <span className="text-xs font-tabular-mono text-[var(--text-primary)] block">
            2. Component Functions vs. <KaTeXMath math="t" /> (Comparing{" "}
            <KaTeXMath math="c_f" />, <KaTeXMath math="c_g" /> &amp;{" "}
            <KaTeXMath math="c_{\text{Cauchy}}" />)
          </span>
          <SvgCoordinatePlane2D
            xRange={analysis.compXRange}
            yRange={analysis.compYRange}
            width={width}
            height={height}
            xLabel="t"
            yLabel="f, g"
            xColor="var(--math-ink-x)"
            yColor="var(--math-ink-z)"
            ariaLabel="Component curves f(t) and g(t) showing vertical markers at Lagrange points c_f and c_g vs Cauchy shared point c"
            className="w-full h-76 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const toPoly = (pts: [number, number][]) =>
                pts
                  .map(([tx, y]) => `${toSvgX(tx).toFixed(1)},${toSvgY(y).toFixed(1)}`)
                  .join(" ");

              return (
                <>
                  {/* Vertical Markers for c_f, c_g, c_Cauchy */}
                  {analysis.lagrangeFPoints.map((cf, i) => (
                    <line
                      key={`cf-${i}`}
                      x1={toSvgX(cf)}
                      y1={32}
                      x2={toSvgX(cf)}
                      y2={height - 32}
                      stroke="#029091"
                      strokeDasharray="3 3"
                      strokeOpacity={0.65}
                      strokeWidth={1.3}
                    />
                  ))}
                  {analysis.lagrangeGPoints.map((cg, i) => (
                    <line
                      key={`cg-${i}`}
                      x1={toSvgX(cg)}
                      y1={32}
                      x2={toSvgX(cg)}
                      y2={height - 32}
                      stroke="#96B898"
                      strokeDasharray="3 3"
                      strokeOpacity={0.65}
                      strokeWidth={1.3}
                    />
                  ))}
                  {analysis.cauchyPoints.map((cc, i) => (
                    <line
                      key={`cc-${i}`}
                      x1={toSvgX(cc)}
                      y1={32}
                      x2={toSvgX(cc)}
                      y2={height - 32}
                      stroke="#FBEAA4"
                      strokeWidth={1.8}
                    />
                  ))}

                  {/* Component Curves */}
                  {analysis.fPts.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#029091"
                      strokeWidth={2.3}
                      points={toPoly(analysis.fPts)}
                    />
                  )}
                  {analysis.gPts.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#96B898"
                      strokeWidth={2.3}
                      points={toPoly(analysis.gPts)}
                    />
                  )}

                  {/* Active Probe Line t0 */}
                  <line
                    x1={toSvgX(probeT0)}
                    y1={32}
                    x2={toSvgX(probeT0)}
                    y2={height - 32}
                    stroke="#D35323"
                    strokeWidth={1.6}
                  />
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Side-by-Side Cross-Multiplied vs. Ratio Readout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-tabular-mono text-xs">
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider text-[var(--math-ink-z)] block">
            Cross-Multiplied Form (Always Defined)
          </span>
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>[f(b) − f(a)] · g&apos;(t₀):</span>
            <span className="text-[var(--text-primary)] font-semibold">
              {Number.isFinite(analysis.lhsCross)
                ? analysis.lhsCross.toFixed(4)
                : "NaN"}
            </span>
          </div>
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>[g(b) − g(a)] · f&apos;(t₀):</span>
            <span className="text-[var(--text-primary)] font-semibold">
              {Number.isFinite(analysis.rhsCross)
                ? analysis.rhsCross.toFixed(4)
                : "NaN"}
            </span>
          </div>
          <div className="flex justify-between text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
            <span>Residual Difference:</span>
            <span
              className={`font-semibold ${
                Math.abs(analysis.lhsCross - analysis.rhsCross) < 0.08
                  ? "text-[var(--math-ink-z)]"
                  : "text-[var(--math-ink-sweep)]"
              }`}
            >
              {Number.isFinite(analysis.lhsCross - analysis.rhsCross)
                ? (analysis.lhsCross - analysis.rhsCross).toFixed(4)
                : "NaN"}
            </span>
          </div>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider text-[var(--math-ink-x)] block">
            Ratio Form (Requires g&apos;(t) ≠ 0)
          </span>
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Chord Slope Δf / Δg:</span>
            <span className="text-[var(--math-ink-x)] font-semibold">
              {Number.isFinite(analysis.chordRatio)
                ? analysis.chordRatio.toFixed(4)
                : "Undefined (Δg = 0)"}
            </span>
          </div>
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Tangent Ratio f&apos;(t₀) / g&apos;(t₀):</span>
            <span className="text-[var(--math-ink-sweep)] font-semibold">
              {Number.isFinite(analysis.tangentRatio)
                ? analysis.tangentRatio.toFixed(4)
                : "Undefined (g'(t₀) = 0)"}
            </span>
          </div>
          <div className="flex justify-between text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
            <span>Individual Components:</span>
            <span className="text-[var(--text-primary)]">
              f&apos;={analysis.fDeriv0.cDiff.toFixed(2)}, g&apos;=
              {analysis.gDeriv0.cDiff.toFixed(2)}
            </span>
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
