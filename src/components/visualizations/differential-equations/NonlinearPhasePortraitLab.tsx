"use client";

import React, { useState, useMemo } from "react";
import { Crosshair, Activity, Eye, ShieldAlert } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  SvgCoordinatePlane2D,
  extractLevelCurveSegments,
  computePartialDerivatives2D,
} from "@/components/visualizations/primitives";

interface NonlinearPreset {
  id: string;
  name: string;
  badge: string;
  fExpr: string;
  gExpr: string;
  xRange: [number, number];
  yRange: [number, number];
  defaultSeed: [number, number];
  ambientSeeds: [number, number][];
  formulaLatex: string;
  insight: string;
}

const NONLINEAR_PRESETS: NonlinearPreset[] = [
  {
    id: "vanderpol",
    name: "Van der Pol Oscillator: x' = y, y' = 1.25(1 - x²)y - x",
    badge: "Stable Limit Cycle",
    fExpr: "y",
    gExpr: "1.25 * (1 - x^2) * y - x",
    xRange: [-3.0, 3.0],
    yRange: [-3.0, 3.0],
    defaultSeed: [0.35, 0.35],
    ambientSeeds: [
      [2.6, 1.5],
      [-2.5, -1.8],
      [0.2, -0.4],
    ],
    formulaLatex: "\\dot{x} = y, \\qquad \\dot{y} = 1.25(1 - x^2)y - x",
    insight:
      "Inside the unit circle damping is negative (origin is an unstable spiral source); outside, damping turns positive. Both regimes lock onto one unique self-sustained limit cycle!",
  },
  {
    id: "pendulum",
    name: "Damped Nonlinear Pendulum: θ' = ω, ω' = -2.2 sin(θ) - 0.35 ω",
    badge: "Spirals & Saddles at ±π",
    fExpr: "y",
    gExpr: "-2.2 * sin(x) - 0.35 * y",
    xRange: [-3.8, 3.8],
    yRange: [-3.0, 3.0],
    defaultSeed: [2.4, 1.3],
    ambientSeeds: [
      [-2.6, -1.2],
      [1.2, 0.2],
      [-3.5, 2.3],
    ],
    formulaLatex:
      "\\dot{\\theta} = \\omega, \\qquad \\dot{\\omega} = -2.2\\sin\\theta - 0.35\\omega",
    insight:
      "Equilibria occur at θ* = 0 (stable bottom sink) and θ* = ±π (unstable upright saddles). Click near π to watch trajectories split left or right across the saddle!",
  },
  {
    id: "duffing",
    name: "Damped Double-Well Duffing: x' = y, y' = x - 0.45x³ - 0.35y",
    badge: "Two Sinks + Origin Saddle",
    fExpr: "y",
    gExpr: "x - 0.45 * x^3 - 0.35 * y",
    xRange: [-2.8, 2.8],
    yRange: [-2.4, 2.4],
    defaultSeed: [0.3, 1.15],
    ambientSeeds: [
      [-1.9, 1.4],
      [1.9, -1.4],
      [-0.4, -1.1],
    ],
    formulaLatex: "\\dot{x} = y, \\qquad \\dot{y} = x - 0.45x^3 - 0.35y",
    insight:
      "The origin (0, 0) is an unstable hilltop saddle whose separatrices carve the plane into two symmetric basins draining into (-1.49, 0) and (+1.49, 0).",
  },
  {
    id: "lotka",
    name: "Lotka–Volterra Predator-Prey: x' = x(1.2 - y), y' = y(x - 0.9)",
    badge: "Neutral Conserved Cycles",
    fExpr: "x * (1.2 - y)",
    gExpr: "y * (x - 0.9)",
    xRange: [-0.2, 3.0],
    yRange: [-0.2, 3.0],
    defaultSeed: [1.65, 0.7],
    ambientSeeds: [
      [1.2, 0.9],
      [2.1, 1.6],
      [0.45, 1.8],
    ],
    formulaLatex: "\\dot{x} = x(1.2 - y), \\qquad \\dot{y} = y(x - 0.9)",
    insight:
      "Intersections of the nullclines x = 0, y = 1.2 and y = 0, x = 0.9 reveal a coexistence equilibrium at (0.9, 1.2) surrounded by closed predator–prey population cycles.",
  },
];

export function NonlinearPhasePortraitLab() {
  const [presetId, setPresetId] = useState<string>("vanderpol");
  const [fExpr, setFExpr] = useState<string>(NONLINEAR_PRESETS[0].fExpr);
  const [gExpr, setGExpr] = useState<string>(NONLINEAR_PRESETS[0].gExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [seed, setSeed] = useState<[number, number]>(
    NONLINEAR_PRESETS[0].defaultSeed
  );
  const [showNullclines, setShowNullclines] = useState<boolean>(true);

  const activePreset = useMemo(
    () =>
      NONLINEAR_PRESETS.find((p) => p.id === presetId) ?? NONLINEAR_PRESETS[0],
    [presetId]
  );

  const compiledF = useMemo(
    () => compileMathExpression(fExpr, ["x", "y"]),
    [fExpr]
  );
  const compiledG = useMemo(
    () => compileMathExpression(gExpr, ["x", "y"]),
    [gExpr]
  );

  const xRange: [number, number] = isCustom ? [-3.0, 3.0] : activePreset.xRange;
  const yRange: [number, number] = isCustom ? [-3.0, 3.0] : activePreset.yRange;

  const handleSelectPreset = (p: NonlinearPreset) => {
    setPresetId(p.id);
    setFExpr(p.fExpr);
    setGExpr(p.gExpr);
    setSeed(p.defaultSeed);
    setIsCustom(false);
  };

  const analysis = useMemo(() => {
    const evalF = (x: number, y: number) => {
      const v = compiledF.evaluate({ x, y });
      return Number.isFinite(v) ? v : 0;
    };
    const evalG = (x: number, y: number) => {
      const v = compiledG.evaluate({ x, y });
      return Number.isFinite(v) ? v : 0;
    };

    // 1. Vector field arrows grid
    const arrows: { x: number; y: number; dx: number; dy: number }[] = [];
    const nGrid = 10;
    const xPad = (xRange[1] - xRange[0]) * 0.08;
    const yPad = (yRange[1] - yRange[0]) * 0.08;
    for (let i = 0; i <= nGrid; i++) {
      const x = xRange[0] + xPad + (i / nGrid) * (xRange[1] - xRange[0] - 2 * xPad);
      for (let j = 0; j <= nGrid; j++) {
        const y = yRange[0] + yPad + (j / nGrid) * (yRange[1] - yRange[0] - 2 * yPad);
        const vx = evalF(x, y);
        const vy = evalG(x, y);
        const m = Math.hypot(vx, vy);
        if (m > 1e-4) {
          const baseScale = Math.min(xRange[1] - xRange[0], yRange[1] - yRange[0]) * 0.036;
          const len = baseScale * (0.45 + 0.7 * Math.tanh(m * 0.45));
          arrows.push({ x, y, dx: (vx / m) * len, dy: (vy / m) * len });
        }
      }
    }

    // 2. Marching-Squares x-nullcline (f = 0) & y-nullcline (g = 0)
    const xNullSegs = showNullclines
      ? extractLevelCurveSegments(evalF, xRange[0], xRange[1], yRange[0], yRange[1], 0, 38, 38)
      : [];
    const yNullSegs = showNullclines
      ? extractLevelCurveSegments(evalG, xRange[0], xRange[1], yRange[0], yRange[1], 0, 38, 38)
      : [];

    // 3. RK4 Integrator
    const integrate = (sx: number, sy: number, dir: 1 | -1, steps: number, dtMag = 0.04) => {
      const pts: { t: number; x: number; y: number }[] = [{ t: 0, x: sx, y: sy }];
      let x = sx;
      let y = sy;
      const dt = dtMag * dir;
      for (let k = 1; k <= steps; k++) {
        const k1x = evalF(x, y);
        const k1y = evalG(x, y);
        const k2x = evalF(x + 0.5 * dt * k1x, y + 0.5 * dt * k1y);
        const k2y = evalG(x + 0.5 * dt * k1x, y + 0.5 * dt * k1y);
        const k3x = evalF(x + 0.5 * dt * k2x, y + 0.5 * dt * k2y);
        const k3y = evalG(x + 0.5 * dt * k2x, y + 0.5 * dt * k2y);
        const k4x = evalF(x + dt * k3x, y + dt * k3y);
        const k4y = evalG(x + dt * k3x, y + dt * k3y);
        x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
        y += (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
        if (
          !Number.isFinite(x) ||
          !Number.isFinite(y) ||
          x < xRange[0] - 0.6 ||
          x > xRange[1] + 0.6 ||
          y < yRange[0] - 0.6 ||
          y > yRange[1] + 0.6
        ) {
          break;
        }
        pts.push({ t: k * dtMag, x, y });
      }
      return pts;
    };

    const activeFwd = integrate(seed[0], seed[1], 1, 340, 0.04); // up to t = 13.6
    const activeBwd = integrate(seed[0], seed[1], -1, 110, 0.04);

    const ambList = (isCustom ? [[-1.5, 1.5], [1.5, -1.5]] as [number, number][] : activePreset.ambientSeeds).map(
      ([sx, sy]) => integrate(sx, sy, 1, 190, 0.04)
    );

    // 4. Find nearest equilibrium (x*, y*) from clicked seed via 2D damped Newton
    const runNewton = (xInit: number, yInit: number): [number, number] | null => {
      let nx = xInit;
      let ny = yInit;
      for (let it = 0; it < 18; it++) {
        const fx0 = evalF(nx, ny);
        const gx0 = evalG(nx, ny);
        if (Math.hypot(fx0, gx0) < 1e-5) {
          if (nx >= xRange[0] && nx <= xRange[1] && ny >= yRange[0] && ny <= yRange[1]) {
            return [nx, ny];
          }
          return null;
        }
        const df = computePartialDerivatives2D(evalF, nx, ny, 1e-4);
        const dg = computePartialDerivatives2D(evalG, nx, ny, 1e-4);
        const detJ = df.fx * dg.fy - df.fy * dg.fx;
        if (Math.abs(detJ) < 1e-6) break;
        const stepX = (dg.fy * fx0 - df.fy * gx0) / detJ;
        const stepY = (-dg.fx * fx0 + df.fx * gx0) / detJ;
        const stepLen = Math.hypot(stepX, stepY);
        const damp = stepLen > 0.6 ? 0.6 / stepLen : 1;
        nx -= damp * stepX;
        ny -= damp * stepY;
        if (!Number.isFinite(nx) || !Number.isFinite(ny) || Math.abs(nx) > 10 || Math.abs(ny) > 10) {
          return null;
        }
      }
      const res = Math.hypot(evalF(nx, ny), evalG(nx, ny));
      if (res < 1e-3 && nx >= xRange[0] && nx <= xRange[1] && ny >= yRange[0] && ny <= yRange[1]) {
        return [nx, ny];
      }
      return null;
    };

    let eqPt = runNewton(seed[0], seed[1]);
    if (!eqPt) {
      // Fallback search around origin / center of view
      eqPt = runNewton(
        0.5 * (xRange[0] + xRange[1]),
        0.5 * (yRange[0] + yRange[1])
      );
    }

    // Evaluate Jacobian J at eqPt (or at clicked point if no eq converged)
    const evalPt: [number, number] = eqPt ?? seed;
    const dfEq = computePartialDerivatives2D(evalF, evalPt[0], evalPt[1], 1e-4);
    const dgEq = computePartialDerivatives2D(evalG, evalPt[0], evalPt[1], 1e-4);
    const tau = dfEq.fx + dgEq.fy;
    const delta = dfEq.fx * dgEq.fy - dfEq.fy * dgEq.fx;
    const disc = tau * tau - 4 * delta;

    let hartmanVerdict = "Probe Point";
    let nonHyperbolic = false;
    if (eqPt) {
      if (delta < -0.02) hartmanVerdict = "Hyperbolic Saddle";
      else if (disc < 0) {
        if (Math.abs(tau) < 0.04) {
          hartmanVerdict = "Linear Center (Non-Hyperbolic!)";
          nonHyperbolic = true;
        } else {
          hartmanVerdict = tau < 0 ? "Stable Spiral Sink" : "Unstable Spiral Source";
        }
      } else {
        hartmanVerdict = tau < 0 ? "Stable Node" : "Unstable Node";
      }
    }

    return {
      arrows,
      xNullSegs,
      yNullSegs,
      activeFwd,
      activeBwd,
      ambList,
      eqPt,
      evalPt,
      dfEq,
      dgEq,
      tau,
      delta,
      hartmanVerdict,
      nonHyperbolic,
    };
  }, [compiledF, compiledG, xRange, yRange, showNullclines, seed, isCustom, activePreset]);

  return (
    <section
      id="nullcline-limit-cycle-lab"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#D35323] block">
            Laboratory 4.3.2.1 • Nullcline Intersections, Limit Cycles &amp; Hartman–Grobman Linearization
          </span>
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
            Nonlinear Phase Portraits, Nullclines &amp; Jacobian Equilibrium Inspector
          </h2>
          <p className="text-sm font-math-serif text-[var(--text-secondary)]">
            Click anywhere to launch trajectories across nullclines{" "}
            <KaTeXMath math="f(x,y)=0" /> and <KaTeXMath math="g(x,y)=0" />, inspect Van der Pol
            limit cycles, and linearize the nearest equilibrium via{" "}
            <KaTeXMath math="J(x^*, y^*)" />.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNullclines((v) => !v)}
          className={`px-3 py-1.5 text-xs font-tabular-mono border transition-colors flex items-center gap-1.5 shrink-0 ${
            showNullclines
              ? "border-[#8D9FCE] bg-[#8D9FCE]/15 text-[var(--text-primary)]"
              : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)]"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showNullclines ? "Nullclines: VISIBLE" : "Nullclines: HIDDEN"}</span>
        </button>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {NONLINEAR_PRESETS.map((p) => {
          const selected = !isCustom && presetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`p-3 border text-left transition-colors ${
                selected
                  ? "border-[#D35323] bg-[var(--bg-canvas)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 hover:border-[var(--border-strong)]"
              }`}
            >
              <span className="text-[11px] font-tabular-mono text-[#D35323] font-semibold block mb-1">
                {p.badge}
              </span>
              <div className="text-xs font-math-serif text-[var(--text-primary)] leading-snug">
                {p.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom ODE System Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MathExpressionInput
          label="x-Dynamics f(x, y)"
          prefixLatex="\frac{dx}{dt} ="
          value={fExpr}
          allowedVars={["x", "y"]}
          onChange={(v) => {
            setFExpr(v);
            setIsCustom(true);
          }}
        />
        <MathExpressionInput
          label="y-Dynamics g(x, y)"
          prefixLatex="\frac{dy}{dt} ="
          value={gExpr}
          allowedVars={["x", "y"]}
          onChange={(v) => {
            setGExpr(v);
            setIsCustom(true);
          }}
        />
      </div>

      {/* Twin Layout: Phase Portrait + Time Series & Jacobian Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Nonlinear Phase Portrait + Nullclines */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 text-[#D35323]">
              <Crosshair className="w-3.5 h-3.5" />
              <span>
                Click plane to seed ({seed[0].toFixed(2)}, {seed[1].toFixed(2)})
              </span>
            </span>
            <span>x-null &amp; y-null crossings = Equilibria</span>
          </div>

          <SvgCoordinatePlane2D
            xRange={xRange}
            yRange={yRange}
            xLabel="x"
            yLabel="y"
            width={440}
            height={380}
            ariaLabel="Nonlinear phase portrait with marching squares nullclines and RK4 trajectories"
            onSelectPoint={(sx, sy) =>
              setSeed([Number(sx.toFixed(2)), Number(sy.toFixed(2))])
            }
            className="w-full h-[380px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] cursor-crosshair select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const pathStr = (pts: { x: number; y: number }[]) =>
                pts
                  .map(
                    (pt, i) =>
                      `${i === 0 ? "M" : "L"}${toSvgX(pt.x).toFixed(1)},${toSvgY(pt.y).toFixed(1)}`
                  )
                  .join(" ");

              return (
                <g>
                  {/* Vector Field */}
                  {analysis.arrows.map((ar, idx) => (
                    <g key={`na-${idx}`} opacity={0.45}>
                      <line
                        x1={toSvgX(ar.x)}
                        y1={toSvgY(ar.y)}
                        x2={toSvgX(ar.x + ar.dx)}
                        y2={toSvgY(ar.y + ar.dy)}
                        stroke="#8D9FCE"
                        strokeWidth="1.2"
                      />
                      <circle
                        cx={toSvgX(ar.x + ar.dx)}
                        cy={toSvgY(ar.y + ar.dy)}
                        r="1.3"
                        fill="#8D9FCE"
                      />
                    </g>
                  ))}

                  {/* x-nullcline f(x,y) = 0 (#8D9FCE) */}
                  {analysis.xNullSegs.map((s, i) => (
                    <line
                      key={`xn-${i}`}
                      x1={toSvgX(s.x1)}
                      y1={toSvgY(s.y1)}
                      x2={toSvgX(s.x2)}
                      y2={toSvgY(s.y2)}
                      stroke="#8D9FCE"
                      strokeWidth="1.8"
                      strokeDasharray="4 3"
                    />
                  ))}

                  {/* y-nullcline g(x,y) = 0 (#96B898) */}
                  {analysis.yNullSegs.map((s, i) => (
                    <line
                      key={`yn-${i}`}
                      x1={toSvgX(s.x1)}
                      y1={toSvgY(s.y1)}
                      x2={toSvgX(s.x2)}
                      y2={toSvgY(s.y2)}
                      stroke="#96B898"
                      strokeWidth="1.8"
                      strokeDasharray="4 3"
                    />
                  ))}

                  {/* Ambient Trajectories */}
                  {analysis.ambList.map((tr, idx) => (
                    <path
                      key={`amb-${idx}`}
                      d={pathStr(tr)}
                      fill="none"
                      stroke="#029091"
                      strokeOpacity="0.65"
                      strokeWidth="1.5"
                    />
                  ))}

                  {/* Active Seed Backward & Forward Trajectory */}
                  <path
                    d={pathStr(analysis.activeBwd)}
                    fill="none"
                    stroke="#FBEAA4"
                    strokeWidth="1.6"
                    strokeOpacity="0.6"
                    strokeDasharray="3 3"
                  />
                  <path
                    d={pathStr(analysis.activeFwd)}
                    fill="none"
                    stroke="#D35323"
                    strokeWidth="2.5"
                  />

                  {/* Nearest Equilibrium Pin (if converged) */}
                  {analysis.eqPt && (
                    <circle
                      cx={toSvgX(analysis.eqPt[0])}
                      cy={toSvgY(analysis.eqPt[1])}
                      r="5.5"
                      fill="#1E1F22"
                      stroke="#FBEAA4"
                      strokeWidth="2.2"
                    />
                  )}

                  {/* Active Seed Marker */}
                  <circle
                    cx={toSvgX(seed[0])}
                    cy={toSvgY(seed[1])}
                    r="5"
                    fill="#D35323"
                    stroke="#1E1F22"
                    strokeWidth="1.5"
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          <div className="flex flex-wrap gap-4 text-[11px] font-tabular-mono text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#D35323] inline-block" />
              <span>Forward Trajectory</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#8D9FCE] inline-block" />
              <span>x-Nullcline (x&apos;=0)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#96B898] inline-block" />
              <span>y-Nullcline (y&apos;=0)</span>
            </span>
          </div>
        </div>

        {/* Right: Coupled Time Series + Jacobian Linearization Card */}
        <div className="lg:col-span-6 space-y-4">
          {/* Coupled Time Waveform */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5 text-[#8D9FCE]">
                <Activity className="w-3.5 h-3.5" />
                <span>Coupled Time Waveforms x(t) &amp; y(t) from Active Seed</span>
              </span>
              <span>t ∈ [0, 13.6]</span>
            </div>

            <SvgCoordinatePlane2D
              xRange={[0, 14]}
              yRange={[
                Math.min(xRange[0], yRange[0]),
                Math.max(xRange[1], yRange[1]),
              ]}
              xLabel="t"
              yLabel="x, y"
              width={440}
              height={180}
              ariaLabel="Time series plots of x(t) and y(t) for the selected seed trajectory"
              className="w-full h-[180px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
            >
              {({ toSvgX, toSvgY }) => {
                const yMinAll = Math.min(xRange[0], yRange[0]);
                const yMaxAll = Math.max(xRange[1], yRange[1]);
                const clampV = (v: number) => Math.max(yMinAll, Math.min(yMaxAll, v));
                const xPath = analysis.activeFwd
                  .map(
                    (pt, i) =>
                      `${i === 0 ? "M" : "L"}${toSvgX(pt.t).toFixed(1)},${toSvgY(clampV(pt.x)).toFixed(1)}`
                  )
                  .join(" ");
                const yPath = analysis.activeFwd
                  .map(
                    (pt, i) =>
                      `${i === 0 ? "M" : "L"}${toSvgX(pt.t).toFixed(1)},${toSvgY(clampV(pt.y)).toFixed(1)}`
                  )
                  .join(" ");

                return (
                  <g>
                    <path d={xPath} fill="none" stroke="#8D9FCE" strokeWidth="2.1" />
                    <path d={yPath} fill="none" stroke="#96B898" strokeWidth="2.1" />
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>
          </div>

          {/* Local Jacobian & Hartman–Grobman Panel */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
              <span className="text-xs font-tabular-mono font-semibold text-[#FBEAA4]">
                {analysis.eqPt
                  ? `NEAREST EQUILIBRIUM (${analysis.eqPt[0].toFixed(2)}, ${analysis.eqPt[1].toFixed(2)})`
                  : `LOCAL JACOBIAN AT SEED (${seed[0].toFixed(2)}, ${seed[1].toFixed(2)})`}
              </span>
              <span className="text-xs font-tabular-mono font-semibold text-[#029091]">
                {analysis.hartmanVerdict}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center text-xs font-tabular-mono">
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1 text-center">
                <span className="text-[10px] text-[var(--text-muted)] block">
                  JACOBIAN MATRIX J = ∂(f,g)/∂(x,y)
                </span>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <div className="p-1 bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    fₓ: {analysis.dfEq.fx.toFixed(2)}
                  </div>
                  <div className="p-1 bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    f_y: {analysis.dfEq.fy.toFixed(2)}
                  </div>
                  <div className="p-1 bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    gₓ: {analysis.dgEq.fx.toFixed(2)}
                  </div>
                  <div className="p-1 bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    g_y: {analysis.dgEq.fy.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex justify-between">
                  <span className="text-[#8D9FCE]">Trace τ = tr(J):</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {analysis.tau.toFixed(3)}
                  </span>
                </div>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex justify-between">
                  <span className="text-[#96B898]">Det Δ = det(J):</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {analysis.delta.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>

            {analysis.nonHyperbolic && (
              <div className="p-2.5 border border-[#FBEAA4] bg-[#FBEAA4]/10 text-xs font-math-serif text-[#FBEAA4] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Non-hyperbolic warning: Re(λ) = 0 means Hartman–Grobman does not guarantee closed
                  orbits unless a conserved quantity (like energy) prevents weak nonlinear spiral drift.
                </span>
              </div>
            )}

            <p className="text-xs font-math-serif text-[var(--text-secondary)]">
              {!isCustom
                ? activePreset.insight
                : "Where dashed blue (x'=0) and green (y'=0) nullclines intersect, both derivatives vanish simultaneously, creating a fixed equilibrium."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
