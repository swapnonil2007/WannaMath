"use client";

import React, { useMemo, useState } from "react";
import { Compass, Maximize2, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";

interface PolarRegionPreset {
  id: string;
  label: string;
  badge: string;
  integrandExpr: string;
  thetaMinExpr: string;
  thetaMaxExpr: string;
  rMinExpr: string;
  rMaxExpr: string;
  note: string;
}

const POLAR_PRESETS: PolarRegionPreset[] = [
  {
    id: "quarter-disk",
    label: "Quarter Disk",
    badge: "Constant Bounds",
    integrandExpr: "1.5 - 0.5*r^2",
    thetaMinExpr: "0",
    thetaMaxExpr: "pi/2",
    rMinExpr: "0",
    rMaxExpr: "1.2",
    note: "In Cartesian coordinates, a circle requires radical bounds y = √(R² - x²). In Polar coordinates, a circular sector becomes a simple rectangle in (r, θ): 0 ≤ r ≤ 1.2, 0 ≤ θ ≤ π/2!",
  },
  {
    id: "annulus",
    label: "Annular Ring",
    badge: "Hollow Pipe Wall",
    integrandExpr: "1",
    thetaMinExpr: "0",
    thetaMaxExpr: "pi",
    rMinExpr: "0.5",
    rMaxExpr: "1.25",
    note: "Models a hollow pipe cross-section or bearing ring. In Cartesian coordinates this requires splitting into 3 separate integrals; in Polar it is a single constant-limit integral!",
  },
  {
    id: "cardioid",
    label: "Cardioid Sector",
    badge: "r = g₂(θ)",
    integrandExpr: "1",
    thetaMinExpr: "0",
    thetaMaxExpr: "pi",
    rMinExpr: "0",
    rMaxExpr: "0.7 + 0.45*cos(theta)",
    note: "Models a directional microphone pickup pattern or cam profile where the outer radius varies smoothly with angle θ: r_max(θ) = 0.7 + 0.45 cos(θ).",
  },
  {
    id: "rose-petal",
    label: "Rose Petal",
    badge: "Harmonic Boundary",
    integrandExpr: "1 + 0.4*r",
    thetaMinExpr: "0",
    thetaMaxExpr: "pi/2",
    rMinExpr: "0",
    rMaxExpr: "1.3*sin(2*theta)",
    note: "First-quadrant petal of the four-leaved rose r = 1.3 sin(2θ), bounded by θ ∈ [0, π/2].",
  },
];

export function PolarCoordinateAreaLab() {
  // Interactive point P(r0, theta0) and differential wedge sizes (dr, dtheta)
  const [r0, setR0] = useState<number>(0.85);
  const [theta0Deg, setTheta0Deg] = useState<number>(40);
  const [dr, setDr] = useState<number>(0.24);
  const [dThetaDeg, setDThetaDeg] = useState<number>(18);
  const [showCartesianGrid, setShowCartesianGrid] = useState<boolean>(true);

  // Custom Polar Integral Region & Integrand state
  const [presetId, setPresetId] = useState<string>("quarter-disk");
  const [integrandExpr, setIntegrandExpr] = useState<string>("1.5 - 0.5*r^2");
  const [thetaMinExpr, setThetaMinExpr] = useState<string>("0");
  const [thetaMaxExpr, setThetaMaxExpr] = useState<string>("pi/2");
  const [rMinExpr, setRMinExpr] = useState<string>("0");
  const [rMaxExpr, setRMaxExpr] = useState<string>("1.2");

  const theta0Rad = (theta0Deg * Math.PI) / 180;
  const dThetaRad = (dThetaDeg * Math.PI) / 180;

  // Cartesian coordinates of P and local polar basis vectors e_r, e_theta
  const pointData = useMemo(() => {
    const x = r0 * Math.cos(theta0Rad);
    const y = r0 * Math.sin(theta0Rad);
    const erX = Math.cos(theta0Rad);
    const erY = Math.sin(theta0Rad);
    const ethetaX = -Math.sin(theta0Rad);
    const ethetaY = Math.cos(theta0Rad);

    const innerArc = r0 * dThetaRad;
    const outerArc = (r0 + dr) * dThetaRad;
    const linearApproxDA = r0 * dr * dThetaRad;
    const exactSectorDA = 0.5 * ((r0 + dr) * (r0 + dr) - r0 * r0) * dThetaRad;

    return {
      x,
      y,
      erX,
      erY,
      ethetaX,
      ethetaY,
      innerArc,
      outerArc,
      linearApproxDA,
      exactSectorDA,
    };
  }, [r0, theta0Rad, dr, dThetaRad]);

  // Compile user-typed Polar Integrand and Region Limits
  const compiledIntegrand = useMemo(
    () => compileMathExpression(integrandExpr, ["r", "theta", "x", "y"], 0),
    [integrandExpr]
  );
  const compiledThetaMin = useMemo(
    () => compileMathExpression(thetaMinExpr, [], 0),
    [thetaMinExpr]
  );
  const compiledThetaMax = useMemo(
    () => compileMathExpression(thetaMaxExpr, [], Math.PI / 2),
    [thetaMaxExpr]
  );
  const compiledRMin = useMemo(
    () => compileMathExpression(rMinExpr, ["theta"], 0),
    [rMinExpr]
  );
  const compiledRMax = useMemo(
    () => compileMathExpression(rMaxExpr, ["theta"], 1.2),
    [rMaxExpr]
  );

  const thetaRange = useMemo((): [number, number] => {
    const a = Math.max(
      -2 * Math.PI,
      Math.min(2 * Math.PI, compiledThetaMin.evaluate({}))
    );
    const b = Math.max(
      a + 0.05,
      Math.min(2 * Math.PI, compiledThetaMax.evaluate({}))
    );
    return [a, b];
  }, [compiledThetaMin, compiledThetaMax]);

  const evalRBounds = React.useCallback(
    (theta: number): [number, number] => {
      const r1 = Math.max(0, Math.min(2.5, compiledRMin.evaluate({ theta })));
      const r2 = Math.max(r1, Math.min(2.5, compiledRMax.evaluate({ theta })));
      return [r1, r2];
    },
    [compiledRMin, compiledRMax]
  );

  // Numerically evaluate ∬_R f(r, θ) r dr dθ
  const polarIntegralValue = useMemo(() => {
    const [tA, tB] = thetaRange;
    const NTheta = 36;
    const NR = 28;
    const dT = (tB - tA) / NTheta;
    if (dT <= 0) return 0;

    let sum = 0;
    for (let i = 0; i < NTheta; i++) {
      const theta = tA + (i + 0.5) * dT;
      const [r1, r2] = evalRBounds(theta);
      const dR = (r2 - r1) / NR;
      if (dR <= 0) continue;

      for (let j = 0; j < NR; j++) {
        const r = r1 + (j + 0.5) * dR;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const fVal = compiledIntegrand.evaluate({ r, theta, x, y });
        // Polar area element dA = r dr dθ
        sum += fVal * r * dR * dT;
      }
    }
    return sum;
  }, [thetaRange, evalRBounds, compiledIntegrand]);

  const handleSelectPreset = (p: PolarRegionPreset) => {
    setPresetId(p.id);
    setIntegrandExpr(p.integrandExpr);
    setThetaMinExpr(p.thetaMinExpr);
    setThetaMaxExpr(p.thetaMaxExpr);
    setRMinExpr(p.rMinExpr);
    setRMaxExpr(p.rMaxExpr);
  };

  // Build SVG paths for the 2D Polar Plane (origin centered at (145, 165) with scale 92 px per unit)
  const cx = 145;
  const cy = 165;
  const scale = 92;
  const toSvg = (x: number, y: number): [number, number] => [
    cx + x * scale,
    cy - y * scale,
  ];

  const polarSvgData = useMemo(() => {
    const [tA, tB] = thetaRange;
    const steps = 64;
    const outerPts: [number, number][] = [];
    const innerPts: [number, number][] = [];

    for (let i = 0; i <= steps; i++) {
      const t = tA + (i / steps) * (tB - tA);
      const [r1, r2] = evalRBounds(t);
      innerPts.push(toSvg(r1 * Math.cos(t), r1 * Math.sin(t)));
      outerPts.push(toSvg(r2 * Math.cos(t), r2 * Math.sin(t)));
    }

    const regionPts = [...innerPts, ...outerPts.slice().reverse()];
    const regionPath =
      regionPts
        .map(
          (p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`
        )
        .join(" ") + " Z";

    const outerCurvePath = outerPts
      .map(
        (p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`
      )
      .join(" ");
    const innerCurvePath = innerPts
      .map(
        (p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`
      )
      .join(" ");

    // Build path for the differential polar wedge [r0, r0+dr] x [theta0, theta0+dtheta]
    const wedgeSteps = 20;
    const wInner: [number, number][] = [];
    const wOuter: [number, number][] = [];
    for (let i = 0; i <= wedgeSteps; i++) {
      const ang = theta0Rad + (i / wedgeSteps) * dThetaRad;
      wInner.push(toSvg(r0 * Math.cos(ang), r0 * Math.sin(ang)));
      wOuter.push(toSvg((r0 + dr) * Math.cos(ang), (r0 + dr) * Math.sin(ang)));
    }
    const wedgePoly = [...wInner, ...wOuter.slice().reverse()];
    const wedgePath =
      wedgePoly
        .map(
          (p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`
        )
        .join(" ") + " Z";

    const pSvg = toSvg(pointData.x, pointData.y);
    const erEnd = toSvg(
      pointData.x + 0.32 * pointData.erX,
      pointData.y + 0.32 * pointData.erY
    );
    const ethetaEnd = toSvg(
      pointData.x + 0.32 * pointData.ethetaX,
      pointData.y + 0.32 * pointData.ethetaY
    );

    return {
      regionPath,
      outerCurvePath,
      innerCurvePath,
      wedgePath,
      pSvg,
      erEnd,
      ethetaEnd,
    };
  }, [thetaRange, evalRBounds, r0, dr, theta0Rad, dThetaRad, pointData]);

  const activePresetNote = useMemo(() => {
    const match = POLAR_PRESETS.find((p) => p.id === presetId);
    return (
      match?.note ??
      "Custom user-defined polar region R integrated using the polar area element dA = r dr dθ."
    );
  }, [presetId]);

  return (
    <section
      id="2d-polar-cartesian"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 sm:p-6 space-y-6 scroll-mt-24"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-grid)]">
            <Compass className="w-4 h-4" aria-hidden="true" />
            <span>
              Interactive Laboratory 03.1 • 2D Polar vs. Cartesian &amp; Area
              Element dA
            </span>
          </div>
          <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            Why Polar Area is <KaTeXMath math="dA = r\,dr\,d\theta" /> (and Not{" "}
            <KaTeXMath math="dr\,d\theta" />)
          </h2>
          <p className="font-math-serif text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl">
            Drag the radial coordinate <KaTeXMath math="r" /> and angle{" "}
            <KaTeXMath math="\theta" /> below to move the polar wedge{" "}
            <KaTeXMath math="dA" />. Observe how the arc-length side{" "}
            <KaTeXMath math="r\,d\theta" /> stretches proportionally with{" "}
            <KaTeXMath math="r" />, and define any custom polar region{" "}
            <KaTeXMath math="R" /> to evaluate{" "}
            <KaTeXMath math="\iint_R f(r,\theta)\,r\,dr\,d\theta" />.
          </p>
        </div>

        {/* Live Coordinate & Area Readout Pill */}
        <div className="grid grid-cols-3 gap-2 border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-2.5 text-center font-tabular-mono">
          <div className="px-2">
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">
              Cartesian (x, y)
            </span>
            <span className="text-xs font-semibold text-[var(--math-ink-x)]">
              ({pointData.x.toFixed(2)}, {pointData.y.toFixed(2)})
            </span>
          </div>
          <div className="px-2 border-x border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">
              Wedge r dr dθ
            </span>
            <span className="text-xs font-semibold text-[var(--math-ink-diff)]">
              {pointData.linearApproxDA.toFixed(4)}
            </span>
          </div>
          <div className="px-2">
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">
              Polar ∬ f r dr dθ
            </span>
            <span className="text-xs font-semibold text-[var(--math-ink-y)]">
              {polarIntegralValue.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Polar Region Presets */}
      <div className="space-y-2">
        <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
          Select Polar Region Preset (or Type Any Custom Polar Equations &amp;
          Limits Below):
        </span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {POLAR_PRESETS.map((p) => {
            const active = p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`p-3 border text-left transition-colors cursor-pointer flex flex-col justify-between gap-1 ${
                  active
                    ? "border-[var(--border-strong)] bg-[var(--bg-panel-elevated)] text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="text-[10px] font-tabular-mono uppercase px-1.5 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--math-ink-diff)] w-fit">
                  {p.badge}
                </span>
                <span className="font-math-serif text-sm font-semibold">
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Polar Math Typing Widgets: Integrand + All 4 Polar Integral Limits */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3">
        <MathExpressionInput
          label="1. Custom Polar Integrand f(r, θ):"
          value={integrandExpr}
          onChange={(val) => {
            setPresetId("custom");
            setIntegrandExpr(val);
          }}
          allowedVars={["r", "theta", "x", "y"]}
          prefixLatex="f(r,\theta) ="
          placeholder="1.5 - 0.5*r^2"
          accentHex="#8D9FCE"
          quickTokens={[
            { label: "r", insert: "r" },
            { label: "r²", insert: "r^2" },
            { label: "theta", insert: "theta" },
            { label: "cos(theta)", insert: "cos(theta)" },
            { label: "sin(theta)", insert: "sin(theta)" },
            { label: "pi/2", insert: "pi/2" },
          ]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <MathExpressionInput
            label="2. Outer Angle Lower Limit θ_min (α):"
            value={thetaMinExpr}
            onChange={(val) => {
              setPresetId("custom");
              setThetaMinExpr(val);
            }}
            allowedVars={[]}
            prefixLatex="\alpha ="
            placeholder="0"
            accentHex="#96B898"
            compact
          />
          <MathExpressionInput
            label="3. Outer Angle Upper Limit θ_max (β):"
            value={thetaMaxExpr}
            onChange={(val) => {
              setPresetId("custom");
              setThetaMaxExpr(val);
            }}
            allowedVars={[]}
            prefixLatex="\beta ="
            placeholder="pi/2"
            accentHex="#96B898"
            compact
          />
          <MathExpressionInput
            label="4. Inner Radial Curve r_min(θ) = g₁(θ):"
            value={rMinExpr}
            onChange={(val) => {
              setPresetId("custom");
              setRMinExpr(val);
            }}
            allowedVars={["theta"]}
            prefixLatex="r_1(\theta) ="
            placeholder="0"
            accentHex="#D5658B"
            compact
          />
          <MathExpressionInput
            label="5. Outer Radial Curve r_max(θ) = g₂(θ):"
            value={rMaxExpr}
            onChange={(val) => {
              setPresetId("custom");
              setRMaxExpr(val);
            }}
            allowedVars={["theta"]}
            prefixLatex="r_2(\theta) ="
            placeholder="0.7 + 0.45*cos(theta)"
            accentHex="#B95869"
            compact
          />
        </div>
      </div>

      {/* Main Split Workspace: Left 2D Polar/Cartesian Radar Canvas + Right Zoomed Wedge Magnifier & Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Interactive 2D Polar & Cartesian Coordinate Plane */}
        <figure className="lg:col-span-7 border border-[var(--border-subtle)] bg-[#1E1F22] p-4 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#383B43] text-xs font-tabular-mono text-[#FFFBE4]">
            <span>2D Polar (r, θ) &amp; Cartesian (x, y) Coordinate Plane</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[#CCC8B8]">
              <input
                type="checkbox"
                checked={showCartesianGrid}
                onChange={(e) => setShowCartesianGrid(e.target.checked)}
              />
              <span>Overlay Cartesian (dx, dy) Grid</span>
            </label>
          </div>

          <div className="flex items-center justify-center py-2">
            <svg
              viewBox="0 0 320 260"
              className="w-full max-w-[440px] h-auto select-none"
              role="img"
              aria-label="Interactive 2D Polar and Cartesian coordinate plane with differential area wedge dA = r dr dtheta"
            >
              {/* Optional Cartesian Grid */}
              {showCartesianGrid &&
                [-1, -0.5, 0.5, 1, 1.5].map((g) => (
                  <React.Fragment key={g}>
                    <line
                      x1={cx + g * scale}
                      y1={15}
                      x2={cx + g * scale}
                      y2={245}
                      stroke="#2D3038"
                      strokeWidth="0.8"
                    />
                    <line
                      x1={15}
                      y1={cy - g * scale}
                      x2={305}
                      y2={cy - g * scale}
                      stroke="#2D3038"
                      strokeWidth="0.8"
                    />
                  </React.Fragment>
                ))}

              {/* Concentric Polar Circles r = 0.4, 0.8, 1.2, 1.5 */}
              {[0.4, 0.8, 1.2, 1.5].map((rad) => (
                <g key={rad}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={rad * scale}
                    fill="none"
                    stroke="#3E414B"
                    strokeDasharray="3 3"
                    strokeWidth="0.9"
                  />
                  <text
                    x={cx + rad * scale + 2}
                    y={cy + 11}
                    fill="#AAA36D"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    r={rad}
                  </text>
                </g>
              ))}

              {/* Radial Rays every 30 degrees */}
              {[0, 30, 60, 90, 120, 150, 180].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const xEnd = cx + 1.55 * scale * Math.cos(rad);
                const yEnd = cy - 1.55 * scale * Math.sin(rad);
                return (
                  <line
                    key={deg}
                    x1={cx}
                    y1={cy}
                    x2={xEnd}
                    y2={yEnd}
                    stroke="#363942"
                    strokeWidth="0.75"
                  />
                );
              })}

              {/* Shaded Polar Integration Region R */}
              <path
                d={polarSvgData.regionPath}
                fill="#029091"
                fillOpacity="0.25"
              />
              <path
                d={polarSvgData.innerCurvePath}
                fill="none"
                stroke="#D5658B"
                strokeWidth="2"
              />
              <path
                d={polarSvgData.outerCurvePath}
                fill="none"
                stroke="#B95869"
                strokeWidth="2.2"
              />

              {/* Coordinate Axes */}
              <line
                x1={15}
                y1={cy}
                x2={305}
                y2={cy}
                stroke="#8D9FCE"
                strokeWidth="1.5"
              />
              <line
                x1={cx}
                y1={245}
                x2={cx}
                y2={15}
                stroke="#96B898"
                strokeWidth="1.5"
              />

              {/* Cartesian Projection Dashed Lines (x = r cos θ, y = r sin θ) */}
              <line
                x1={polarSvgData.pSvg[0]}
                y1={cy}
                x2={polarSvgData.pSvg[0]}
                y2={polarSvgData.pSvg[1]}
                stroke="#96B898"
                strokeDasharray="3 2"
                strokeWidth="1.2"
              />
              <line
                x1={cx}
                y1={polarSvgData.pSvg[1]}
                x2={polarSvgData.pSvg[0]}
                y2={polarSvgData.pSvg[1]}
                stroke="#8D9FCE"
                strokeDasharray="3 2"
                strokeWidth="1.2"
              />

              {/* Highlighted Infinitesimal Polar Wedge dA = r dr dθ */}
              <path
                d={polarSvgData.wedgePath}
                fill="#FBEAA4"
                fillOpacity="0.45"
                stroke="#D35323"
                strokeWidth="2"
              />

              {/* Radial Ray from Origin to P */}
              <line
                x1={cx}
                y1={cy}
                x2={polarSvgData.pSvg[0]}
                y2={polarSvgData.pSvg[1]}
                stroke="#FBEAA4"
                strokeWidth="1.8"
              />

              {/* Local Orthonormal Basis Vectors e_r and e_theta at P */}
              <line
                x1={polarSvgData.pSvg[0]}
                y1={polarSvgData.pSvg[1]}
                x2={polarSvgData.erEnd[0]}
                y2={polarSvgData.erEnd[1]}
                stroke="#8D9FCE"
                strokeWidth="2.5"
              />
              <line
                x1={polarSvgData.pSvg[0]}
                y1={polarSvgData.pSvg[1]}
                x2={polarSvgData.ethetaEnd[0]}
                y2={polarSvgData.ethetaEnd[1]}
                stroke="#96B898"
                strokeWidth="2.5"
              />
              <text
                x={polarSvgData.erEnd[0] + 4}
                y={polarSvgData.erEnd[1] - 2}
                fill="#8D9FCE"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ê_r
              </text>
              <text
                x={polarSvgData.ethetaEnd[0] - 14}
                y={polarSvgData.ethetaEnd[1] - 4}
                fill="#96B898"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ê_θ
              </text>

              {/* Point P Marker */}
              <circle
                cx={polarSvgData.pSvg[0]}
                cy={polarSvgData.pSvg[1]}
                r={4.8}
                fill="#D35323"
                stroke="#FFFBE4"
                strokeWidth="1.5"
              />
              <text
                x={polarSvgData.pSvg[0] + 7}
                y={polarSvgData.pSvg[1] + 13}
                fill="#FFFBE4"
                fontSize="10"
                fontFamily="monospace"
              >
                P({r0.toFixed(2)}, {theta0Deg}°)
              </text>
            </svg>
          </div>

          <figcaption className="pt-2 border-t border-[#383B43] flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono text-[#CCC8B8]">
            <span>
              <strong className="text-[#8D9FCE]">x = r cos θ</strong> ={" "}
              {pointData.x.toFixed(3)}
            </span>
            <span>
              <strong className="text-[#96B898]">y = r sin θ</strong> ={" "}
              {pointData.y.toFixed(3)}
            </span>
            <span>
              Basis:{" "}
              <strong className="text-[#8D9FCE]">
                ê_r = ({pointData.erX.toFixed(2)}, {pointData.erY.toFixed(2)})
              </strong>
            </span>
          </figcaption>
        </figure>

        {/* Right: Zoomed Wedge Inspector + Point/Wedge Sliders + Formula */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* Zoomed Differential Wedge Magnifier Box */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="flex items-center gap-1.5 text-[var(--math-ink-sweep)] font-semibold">
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Magnified Polar Area Wedge dA</span>
              </span>
              <span className="text-[var(--text-muted)]">
                Scale Factor J = r = {r0.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-tabular-mono text-xs">
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] uppercase text-[var(--text-muted)] block">
                  Radial Thickness (dr)
                </span>
                <span className="text-sm font-semibold text-[var(--math-ink-x)]">
                  Δr = {dr.toFixed(3)}
                </span>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] uppercase text-[var(--text-muted)] block">
                  Arc Width (r · dθ)
                </span>
                <span className="text-sm font-semibold text-[var(--math-ink-y)]">
                  r Δθ = {pointData.innerArc.toFixed(3)}
                </span>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] uppercase text-[var(--text-muted)] block">
                  Linearized r dr dθ
                </span>
                <span className="text-sm font-semibold text-[var(--math-ink-diff)]">
                  {pointData.linearApproxDA.toFixed(4)}
                </span>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] uppercase text-[var(--text-muted)] block">
                  Exact Sector ΔA
                </span>
                <span className="text-sm font-semibold text-[var(--math-ink-z)]">
                  {pointData.exactSectorDA.toFixed(4)}
                </span>
              </div>
            </div>

            <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed pt-1">
              Because an angle change <KaTeXMath math="d\theta" /> (in radians)
              sweeps out an arc of length{" "}
              <KaTeXMath math="\text{arc} = r\,d\theta" />, the polar rectangle
              has sides <KaTeXMath math="dr" /> and{" "}
              <KaTeXMath math="r\,d\theta" />, giving{" "}
              <KaTeXMath math="dA = (dr)(r\,d\theta) = r\,dr\,d\theta" />.
            </p>
          </div>

          {/* Sliders for r, θ, Δr, Δθ */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="uppercase text-[var(--text-muted)]">
                Point P(r, θ) &amp; Wedge Controls
              </span>
              <button
                type="button"
                onClick={() => {
                  setR0(0.85);
                  setTheta0Deg(40);
                  setDr(0.24);
                  setDThetaDeg(18);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="polar-r0"
                  className="text-xs font-tabular-mono text-[var(--math-ink-x)] block"
                >
                  Radius r = {r0.toFixed(2)}
                </label>
                <input
                  id="polar-r0"
                  type="range"
                  min={0.1}
                  max={1.35}
                  step={0.02}
                  value={r0}
                  onChange={(e) => setR0(parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <label
                  htmlFor="polar-theta0"
                  className="text-xs font-tabular-mono text-[var(--math-ink-y)] block"
                >
                  Angle θ = {theta0Deg}° ({theta0Rad.toFixed(2)} rad)
                </label>
                <input
                  id="polar-theta0"
                  type="range"
                  min={0}
                  max={165}
                  step={1}
                  value={theta0Deg}
                  onChange={(e) => setTheta0Deg(parseInt(e.target.value, 10))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <label
                  htmlFor="polar-dr"
                  className="text-xs font-tabular-mono text-[var(--math-ink-diff)] block"
                >
                  Radial Step Δr = {dr.toFixed(2)}
                </label>
                <input
                  id="polar-dr"
                  type="range"
                  min={0.05}
                  max={0.45}
                  step={0.01}
                  value={dr}
                  onChange={(e) => setDr(parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <label
                  htmlFor="polar-dtheta"
                  className="text-xs font-tabular-mono text-[var(--math-ink-sweep)] block"
                >
                  Angular Step Δθ = {dThetaDeg}°
                </label>
                <input
                  id="polar-dtheta"
                  type="range"
                  min={5}
                  max={45}
                  step={1}
                  value={dThetaDeg}
                  onChange={(e) => setDThetaDeg(parseInt(e.target.value, 10))}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Live Color-Linked Polar Double Integral Formula */}
          <div className="border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-3.5 space-y-1.5">
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
              Evaluated Polar Double Integral over Region R
            </span>
            <KaTeXMath
              block
              math={`\\int_{\\textcolor{#96B898}{${compiledThetaMin.tex}}}^{\\textcolor{#96B898}{${compiledThetaMax.tex}}} \\int_{\\textcolor{#D5658B}{${compiledRMin.tex}}}^{\\textcolor{#B95869}{${compiledRMax.tex}}} \\left(${compiledIntegrand.tex}\\right)\\,\\textcolor{#FBEAA4}{r\\,dr\\,d\\theta} \\approx \\textcolor{#FBEAA4}{${polarIntegralValue.toFixed(
                4
              )}}`}
            />
            <p className="text-xs font-math-serif text-[var(--text-secondary)]">
              {activePresetNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
