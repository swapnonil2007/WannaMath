"use client";

import React, { useState, useMemo } from "react";
import { GitCommitHorizontal, Sliders, Activity } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

type EquilibriumType = "stable" | "unstable" | "semi-stable";

interface EquilibriumPoint {
  yStar: number;
  slope: number;
  kind: EquilibriumType;
}

interface AutonomousPreset {
  id: string;
  name: string;
  badge: string;
  expr: string;
  rRange: [number, number];
  defaultR: number;
  defaultY0: number;
  formulaLatex: string;
  insight: string;
}

const AUTO_PRESETS: AutonomousPreset[] = [
  {
    id: "saddle-node",
    name: "Saddle-Node Bifurcation: dy/dt = r + y²",
    badge: "Creation / Annihilation at r = 0",
    expr: "r + y^2",
    rRange: [-1.5, 1.2],
    defaultR: -0.65,
    defaultY0: 0.45,
    formulaLatex:
      "\\frac{dy}{dt} = r + y^2 \\implies y^* = \\pm\\sqrt{-r} \\quad (r \\le 0)",
    insight:
      "Slide r upward through 0: a stable sink (-√|r|) and unstable source (+√|r|) collide at r = 0 (semi-stable) and annihilate cleanly for r > 0!",
  },
  {
    id: "transcritical",
    name: "Transcritical Exchange: dy/dt = r·y - y²",
    badge: "Stability Swap at r = 0",
    expr: "r * y - y^2",
    rRange: [-1.4, 1.4],
    defaultR: 0.85,
    defaultY0: 0.35,
    formulaLatex: "\\frac{dy}{dt} = r y - y^2 = y(r - y)",
    insight:
      "Both branches y* = 0 and y* = r persist for all r, but swap stability cleanly when they cross at the bifurcation threshold r = 0.",
  },
  {
    id: "pitchfork",
    name: "Supercritical Pitchfork: dy/dt = r·y - y³",
    badge: "Symmetry Breaking at r = 0",
    expr: "r * y - y^3",
    rRange: [-1.2, 1.6],
    defaultR: 0.95,
    defaultY0: 0.35,
    formulaLatex:
      "\\frac{dy}{dt} = r y - y^3 = y(r - y^2) \\implies y^* = 0,\\; \\pm\\sqrt{r}",
    insight:
      "Models buckling beams and phase transitions: for r < 0 only y = 0 is stable; above r = 0, y = 0 destabilizes and two symmetric stable attractors ±√r emerge.",
  },
  {
    id: "logistic-harvest",
    name: "Logistic Population + Constant Harvesting: y' = 1.8y(1 - y/1.8) - r",
    badge: "Tipping Point Yield r_crit = 0.81",
    expr: "1.8 * y * (1 - y / 1.8) - r",
    rRange: [-0.2, 1.15],
    defaultR: 0.45,
    defaultY0: 0.65,
    formulaLatex:
      "\\frac{dy}{dt} = 1.8y\\!\\left(1 - \\frac{y}{1.8}\\right) - r",
    insight:
      "Raising harvest rate r lowers carrying capacity until a saddle-node collapse occurs at maximum sustainable yield r_crit = 0.81—beyond which population crashes to extinction!",
  },
];

function findEquilibria(
  fn: (y: number) => number,
  yMin: number,
  yMax: number
): EquilibriumPoint[] {
  const N = 220;
  const dy = (yMax - yMin) / N;
  const rawRoots: number[] = [];

  let prevY = yMin;
  let prevF = fn(prevY);

  for (let i = 1; i <= N; i++) {
    const currY = yMin + i * dy;
    const currF = fn(currY);

    // Sign change crossing
    if (prevF * currF <= 0) {
      let lo = prevY;
      let hi = currY;
      let fLo = prevF;
      for (let it = 0; it < 22; it++) {
        const mid = 0.5 * (lo + hi);
        const fMid = fn(mid);
        if (Math.abs(fMid) < 1e-8) {
          lo = mid;
          hi = mid;
          break;
        }
        if (fLo * fMid <= 0) {
          hi = mid;
        } else {
          lo = mid;
          fLo = fMid;
        }
      }
      rawRoots.push(0.5 * (lo + hi));
    } else if (
      i >= 2 &&
      Math.abs(prevF) < 0.045 &&
      Math.sign(prevF - fn(yMin + (i - 2) * dy)) !==
        Math.sign(currF - prevF)
    ) {
      // Near-tangent quadratic root (e.g., r = 0 in r + y^2)
      let bestY = prevY;
      let bestAbs = Math.abs(prevF);
      for (let s = -10; s <= 10; s++) {
        const cand = prevY + (s / 10) * dy;
        const val = Math.abs(fn(cand));
        if (val < bestAbs) {
          bestAbs = val;
          bestY = cand;
        }
      }
      if (bestAbs < 0.015) rawRoots.push(bestY);
    }

    prevY = currY;
    prevF = currF;
  }

  // Deduplicate close roots
  const deduped: number[] = [];
  for (const r of rawRoots) {
    if (deduped.every((x) => Math.abs(x - r) > 0.05)) {
      deduped.push(r);
    }
  }

  return deduped.map((yStar) => {
    const eps = 1e-3;
    const fLeft = fn(yStar - eps);
    const fRight = fn(yStar + eps);
    const slope = (fRight - fLeft) / (2 * eps);
    let kind: EquilibriumType = "semi-stable";
    if (fLeft > 1e-4 && fRight < -1e-4) kind = "stable";
    else if (fLeft < -1e-4 && fRight > 1e-4) kind = "unstable";
    else if (slope < -0.02) kind = "stable";
    else if (slope > 0.02) kind = "unstable";
    return { yStar, slope, kind };
  });
}

export function AutonomousPhaseLineLab() {
  const [presetId, setPresetId] = useState<string>("saddle-node");
  const [expr, setExpr] = useState<string>(AUTO_PRESETS[0].expr);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [paramR, setParamR] = useState<number>(AUTO_PRESETS[0].defaultR);
  const [seedY0, setSeedY0] = useState<number>(AUTO_PRESETS[0].defaultY0);

  const activePreset = useMemo(
    () => AUTO_PRESETS.find((p) => p.id === presetId) ?? AUTO_PRESETS[0],
    [presetId]
  );

  const compiledFn = useMemo(
    () => compileMathExpression(expr, ["y", "r"]),
    [expr]
  );

  const rRange: [number, number] = isCustom ? [-1.5, 1.5] : activePreset.rRange;
  const safeR = Math.max(rRange[0], Math.min(rRange[1], paramR));
  const yBounds: [number, number] = [-2.0, 2.0];

  const handleSelectPreset = (p: AutonomousPreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setParamR(p.defaultR);
    setSeedY0(p.defaultY0);
    setIsCustom(false);
  };

  const analysis = useMemo(() => {
    const evalFy = (y: number, r = safeR) => {
      const val = compiledFn.evaluate({ y, r });
      return Number.isFinite(val) ? Math.max(-6, Math.min(6, val)) : 0;
    };

    // 1. Sample f(y) curve
    const slopeCurve: [number, number][] = [];
    for (let i = 0; i <= 100; i++) {
      const y = yBounds[0] + (i / 100) * (yBounds[1] - yBounds[0]);
      slopeCurve.push([y, evalFy(y)]);
    }

    // 2. Find & classify equilibria
    const equilibria = findEquilibria((y) => evalFy(y), yBounds[0], yBounds[1]);

    // 3. Phase-line sign arrow intervals along y
    const phaseSampleYs = [-1.75, -1.25, -0.75, -0.25, 0.25, 0.75, 1.25, 1.75];
    const phaseArrows = phaseSampleYs.map((y) => ({
      y,
      val: evalFy(y),
    }));

    // 4. Time trajectories y(t) via RK4 on t ∈ [0, 5]
    const integrateY = (yInit: number) => {
      const pts: [number, number][] = [[0, yInit]];
      let y = yInit;
      const dt = 0.05;
      for (let k = 0; k < 100; k++) {
        const t = (k + 1) * dt;
        const k1 = evalFy(y);
        const k2 = evalFy(y + 0.5 * dt * k1);
        const k3 = evalFy(y + 0.5 * dt * k2);
        const k4 = evalFy(y + dt * k3);
        y += (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
        if (!Number.isFinite(y) || Math.abs(y) > 2.4) break;
        pts.push([t, y]);
      }
      return pts;
    };

    const familyStarts = [-1.5, -0.9, -0.35, 0.2, 0.85, 1.45, 1.85];
    const familyTrajectories = familyStarts.map((y0) => ({
      y0,
      pts: integrateY(y0),
    }));
    const activeTrajectory = integrateY(seedY0);

    // 5. Bifurcation Diagram sweep across rRange
    const bifPoints: { r: number; yStar: number; kind: EquilibriumType }[] = [];
    const rSteps = 75;
    for (let i = 0; i <= rSteps; i++) {
      const rVal = rRange[0] + (i / rSteps) * (rRange[1] - rRange[0]);
      const eqs = findEquilibria((y) => evalFy(y, rVal), yBounds[0], yBounds[1]);
      for (const eq of eqs) {
        bifPoints.push({ r: rVal, yStar: eq.yStar, kind: eq.kind });
      }
    }

    return {
      slopeCurve,
      equilibria,
      phaseArrows,
      familyTrajectories,
      activeTrajectory,
      bifPoints,
      rateAtSeed: evalFy(seedY0),
    };
  }, [compiledFn, safeR, seedY0, rRange]);

  return (
    <section
      id="autonomous-phase-line-bifurcation"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-4 space-y-1">
        <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
          Laboratory 4.1.2.1 • 1D Phase Lines, Equilibrium Stability &amp; Bifurcations
        </span>
        <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
          Autonomous Stability Analyzer &amp; Parameter Bifurcation Explorer
        </h2>
        <p className="text-sm font-math-serif text-[var(--text-secondary)]">
          Scrub control parameter <KaTeXMath math="r" /> to watch attractors and repellers collide,
          exchange stability, or undergo sudden catastrophic tipping points across three linked views.
        </p>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {AUTO_PRESETS.map((p) => {
          const selected = !isCustom && presetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`p-3 border text-left transition-colors ${
                selected
                  ? "border-[var(--math-ink-y)] bg-[var(--bg-canvas)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 hover:border-[var(--border-strong)]"
              }`}
            >
              <span className="text-[11px] font-tabular-mono text-[var(--math-ink-y)] font-semibold block mb-1">
                {p.badge}
              </span>
              <div className="text-xs font-math-serif text-[var(--text-primary)] leading-snug">
                {p.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expression & Control Parameter r Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-6">
          <MathExpressionInput
            label="Autonomous Rate Law f(y, r)"
            prefixLatex="\frac{dy}{dt} ="
            value={expr}
            allowedVars={["y", "r"]}
            onChange={(val) => {
              setExpr(val);
              setIsCustom(true);
            }}
          />
        </div>
        <div className="lg:col-span-6 p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
          <div className="flex justify-between text-xs font-tabular-mono">
            <span className="text-[var(--math-ink-diff)] font-semibold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Bifurcation Parameter r</span>
            </span>
            <span className="text-[var(--text-primary)] font-semibold">
              r = {safeR.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={rRange[0]}
            max={rRange[1]}
            step={0.02}
            value={safeR}
            onChange={(e) => setParamR(parseFloat(e.target.value))}
            className="w-full accent-[#FBEAA4]"
            aria-label="Bifurcation parameter r"
          />
          <p className="text-xs font-math-serif text-[var(--text-secondary)]">
            {!isCustom ? activePreset.insight : "Adjust r to watch equilibrium points y* create, merge, or swap stability."}
          </p>
        </div>
      </div>

      {/* Top Row: Phase Rate Curve f(y) + Time Trajectories y(t) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: dy/dt vs y + Phase Line */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 text-[var(--math-ink-x)]">
              <GitCommitHorizontal className="w-3.5 h-3.5" />
              <span>Phase Derivative f(y) &amp; 1D Phase Line (y-axis flow)</span>
            </span>
            <span>{analysis.equilibria.length} Equilibria</span>
          </div>

          <SvgCoordinatePlane2D
            xRange={yBounds}
            yRange={[-2.2, 2.2]}
            xLabel="y"
            yLabel="dy/dt"
            width={420}
            height={280}
            ariaLabel="Rate curve dy/dt vs y with 1D phase line equilibria markers"
            onSelectPoint={(y) => setSeedY0(Number(y.toFixed(2)))}
            className="w-full h-[280px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] cursor-crosshair select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const zeroY = toSvgY(0);
              const curvePath = analysis.slopeCurve
                .map(([y, f], i) => {
                  const clampedF = Math.max(-2.15, Math.min(2.15, f));
                  return `${i === 0 ? "M" : "L"}${toSvgX(y).toFixed(1)},${toSvgY(clampedF).toFixed(1)}`;
                })
                .join(" ");

              return (
                <g>
                  {/* Zero Axis Highlight = 1D Phase Line */}
                  <line
                    x1={toSvgX(yBounds[0])}
                    y1={zeroY}
                    x2={toSvgX(yBounds[1])}
                    y2={zeroY}
                    stroke="#AAA36D"
                    strokeWidth="2"
                  />

                  {/* Phase Line Flow Chevrons along dy/dt = 0 */}
                  {analysis.phaseArrows.map((ar, idx) => {
                    if (Math.abs(ar.val) < 0.04) return null;
                    const dir = ar.val > 0 ? 1 : -1;
                    const cx = toSvgX(ar.y);
                    return (
                      <path
                        key={`arr-${idx}`}
                        d={`M${cx - dir * 4},${zeroY - 4} L${cx + dir * 4},${zeroY} L${cx - dir * 4},${zeroY + 4}`}
                        fill="none"
                        stroke={ar.val > 0 ? "#96B898" : "#D35323"}
                        strokeWidth="1.8"
                      />
                    );
                  })}

                  {/* f(y) Curve */}
                  <path
                    d={curvePath}
                    fill="none"
                    stroke="#8D9FCE"
                    strokeWidth="2.5"
                  />

                  {/* Current Seed y0 Pin on Phase Line */}
                  <circle
                    cx={toSvgX(seedY0)}
                    cy={zeroY}
                    r="5"
                    fill="#FBEAA4"
                    stroke="#1E1F22"
                    strokeWidth="1.5"
                  />

                  {/* Equilibria Markers */}
                  {analysis.equilibria.map((eq, idx) => {
                    const cx = toSvgX(eq.yStar);
                    const color =
                      eq.kind === "stable"
                        ? "#96B898"
                        : eq.kind === "unstable"
                        ? "#D35323"
                        : "#FBEAA4";
                    return (
                      <g key={`eq-${idx}`}>
                        <circle
                          cx={cx}
                          cy={zeroY}
                          r="6.5"
                          fill={eq.kind === "stable" ? color : "#1E1F22"}
                          stroke={color}
                          strokeWidth="2.5"
                        />
                      </g>
                    );
                  })}
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          {/* Equilibria Classification Pills */}
          <div className="flex flex-wrap gap-2 text-xs font-tabular-mono">
            {analysis.equilibria.length === 0 ? (
              <span className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)]">
                No Real Equilibria (Unbounded drift)
              </span>
            ) : (
              analysis.equilibria.map((eq, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)]"
                >
                  y* = {eq.yStar.toFixed(2)}{" "}
                  <span
                    className="font-semibold"
                    style={{
                      color:
                        eq.kind === "stable"
                          ? "#96B898"
                          : eq.kind === "unstable"
                          ? "#D35323"
                          : "#FBEAA4",
                    }}
                  >
                    ({eq.kind.toUpperCase()})
                  </span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Right: Solution Trajectories y(t) */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 text-[var(--math-ink-sweep)]">
              <Activity className="w-3.5 h-3.5" />
              <span>Time Trajectories y(t) (Click/drag slider to set y₀ = {seedY0.toFixed(2)})</span>
            </span>
            <span>dy/dt|_y₀ = {analysis.rateAtSeed.toFixed(2)}</span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[0, 5]}
            yRange={yBounds}
            xLabel="t"
            yLabel="y(t)"
            width={420}
            height={280}
            ariaLabel="Time-domain trajectories y(t) showing attraction to stable equilibria"
            onSelectPoint={(_, y) => setSeedY0(Number(y.toFixed(2)))}
            className="w-full h-[280px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] cursor-crosshair select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const pathStr = (pts: [number, number][]) =>
                pts
                  .map(
                    ([t, y], i) =>
                      `${i === 0 ? "M" : "L"}${toSvgX(t).toFixed(1)},${toSvgY(Math.max(-2.2, Math.min(2.2, y))).toFixed(1)}`
                  )
                  .join(" ");

              return (
                <g>
                  {/* Equilibrium Horizontal Asymptotes */}
                  {analysis.equilibria.map((eq, idx) => (
                    <line
                      key={`asym-${idx}`}
                      x1={toSvgX(0)}
                      y1={toSvgY(eq.yStar)}
                      x2={toSvgX(5)}
                      y2={toSvgY(eq.yStar)}
                      stroke={
                        eq.kind === "stable"
                          ? "#96B898"
                          : eq.kind === "unstable"
                          ? "#D35323"
                          : "#FBEAA4"
                      }
                      strokeWidth="1.5"
                      strokeDasharray={eq.kind === "stable" ? undefined : "5 3"}
                    />
                  ))}

                  {/* Ambient Trajectory Family */}
                  {analysis.familyTrajectories.map((traj, idx) => (
                    <path
                      key={`fam-${idx}`}
                      d={pathStr(traj.pts)}
                      fill="none"
                      stroke="#8D9FCE"
                      strokeOpacity="0.45"
                      strokeWidth="1.4"
                    />
                  ))}

                  {/* Highlighted Active Seed Trajectory */}
                  <path
                    d={pathStr(analysis.activeTrajectory)}
                    fill="none"
                    stroke="#FBEAA4"
                    strokeWidth="2.75"
                  />
                  <circle
                    cx={toSvgX(0)}
                    cy={toSvgY(seedY0)}
                    r="5"
                    fill="#FBEAA4"
                    stroke="#1E1F22"
                    strokeWidth="1.5"
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-diff)]">
              <span>Initial Condition y(0) = y₀</span>
              <span>y₀ = {seedY0.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={yBounds[0]}
              max={yBounds[1]}
              step={0.05}
              value={seedY0}
              onChange={(e) => setSeedY0(parseFloat(e.target.value))}
              className="w-full accent-[#FBEAA4]"
              aria-label="Initial condition y(0) = y₀"
            />
          </div>
        </div>
      </div>

      {/* Bottom: Bifurcation Diagram y* vs r */}
      <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
          <span className="text-[var(--math-ink-y)] font-semibold">
            BIFURCATION DIAGRAM: EQUILIBRIA y* VS. CONTROL PARAMETER r (CLICK TO JUMP r)
          </span>
          <span className="text-[var(--text-muted)]">
            Solid Green = Stable Attractor | Red = Unstable Repeller
          </span>
        </div>

        <SvgCoordinatePlane2D
          xRange={rRange}
          yRange={yBounds}
          xLabel="r"
          yLabel="y*"
          width={760}
          height={210}
          ariaLabel="Bifurcation diagram showing equilibrium branches vs control parameter r"
          onSelectPoint={(r) => setParamR(Number(r.toFixed(2)))}
          className="w-full h-[210px] border border-[var(--border-subtle)] bg-[var(--bg-panel)] cursor-crosshair select-none"
        >
          {({ toSvgX, toSvgY }) => (
            <g>
              {/* Equilibria Scatter Branches */}
              {analysis.bifPoints.map((pt, idx) => (
                <circle
                  key={`bp-${idx}`}
                  cx={toSvgX(pt.r)}
                  cy={toSvgY(pt.yStar)}
                  r="2.2"
                  fill={
                    pt.kind === "stable"
                      ? "#96B898"
                      : pt.kind === "unstable"
                      ? "#D35323"
                      : "#FBEAA4"
                  }
                />
              ))}

              {/* Active Parameter Hairline r */}
              <line
                x1={toSvgX(safeR)}
                y1={toSvgY(yBounds[0])}
                x2={toSvgX(safeR)}
                y2={toSvgY(yBounds[1])}
                stroke="#FBEAA4"
                strokeWidth="1.75"
                strokeDasharray="4 3"
              />
            </g>
          )}
        </SvgCoordinatePlane2D>
      </div>
    </section>
  );
}
