"use client";

import React, { useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { Compass, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  SvgCoordinatePlane2D,
  ThreeOrbitViewport,
  createParametricSurfaceMesh,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

type PathFamily = "linear" | "parabolic" | "polar";

interface LimitPreset {
  id: string;
  title: string;
  expr: string;
  exists: boolean;
  defaultFamily: PathFamily;
  defaultK: number;
  badge: string;
  exactLatex: string;
  note: string;
}

const LIMIT_PRESETS: LimitPreset[] = [
  {
    id: "ray-split",
    title: "Ray-Dependent Saddle: xy / (x² + y²)",
    expr: "(x*y)/(x^2 + y^2)",
    exists: false,
    defaultFamily: "linear",
    defaultK: 1.0,
    badge: "Limit Does Not Exist (Linear Split)",
    exactLatex:
      "y = mx \\implies \\lim_{x\\to 0}\\frac{mx^2}{x^2(1+m^2)} = \\frac{m}{1+m^2}",
    note: "Changing slope m changes the height of the ridge approaching (0,0): y = x gives +0.5, while y = -x gives -0.5.",
  },
  {
    id: "parabolic-trap",
    title: "Parabolic Path Trap: x²y / (x⁴ + y²)",
    expr: "(x^2*y)/(x^4 + y^2)",
    exists: false,
    defaultFamily: "parabolic",
    defaultK: 1.0,
    badge: "Passes ALL Lines, Fails Parabolas!",
    exactLatex:
      "y = mx \\to 0, \\quad \\text{but } y = kx^2 \\implies \\frac{kx^4}{(1+k^2)x^4} = \\frac{k}{1+k^2}",
    note: "Crucial trap: EVERY straight line y = mx approaches 0, fooling a linear test—yet the curved parabola y = x² hits height 0.5!",
  },
  {
    id: "polar-squeeze",
    title: "Polar Squeeze Theorem: x³ / (x² + y²)",
    expr: "x^3/(x^2 + y^2)",
    exists: true,
    defaultFamily: "polar",
    defaultK: 0.7,
    badge: "Converges to L = 0 (Uniform Squeeze)",
    exactLatex:
      "\\left|\\frac{r^3\\cos^3\\theta}{r^2}\\right| = r|\\cos^3\\theta| \\le r \\xrightarrow{r\\to 0} 0",
    note: "In polar coordinates, the numerator carries a higher power of r (r³) than the denominator (r²), squeezing every possible path to z = 0.",
  },
  {
    id: "removable-hole",
    title: "Removable Hole: sin(x² + y²) / (x² + y²)",
    expr: "sin(x^2 + y^2)/(x^2 + y^2)",
    exists: true,
    defaultFamily: "polar",
    defaultK: 0.5,
    badge: "Converges to L = 1 (Removable Pinhole)",
    exactLatex:
      "r = \\sqrt{x^2+y^2} \\implies \\lim_{r\\to 0^+}\\frac{\\sin(r^2)}{r^2} = 1",
    note: "Although f(0,0) = 0/0 is undefined, all surrounding directions smoothly converge to z = 1 (continuous if f(0,0) := 1).",
  },
];

export function MultivariableLimitsPathsLab() {
  const [expr, setExpr] = useState<string>(LIMIT_PRESETS[0].expr);
  const [activePresetId, setActivePresetId] = useState<string>(LIMIT_PRESETS[0].id);
  const [pathFamily, setPathFamily] = useState<PathFamily>("linear");
  const [pathParam, setPathParam] = useState<number>(1.0); // m, k, or angle/pi multiplier
  const [approachDist, setApproachDist] = useState<number>(0.45); // signed t or radius r

  const compiled = useMemo(
    () => compileMathExpression(expr, ["x", "y"]),
    [expr]
  );

  const safeEval = useCallback(
    (x: number, y: number): number => {
      if (!compiled.valid) return NaN;
      const v = compiled.evaluate({ x, y });
      if (!Number.isFinite(v)) return NaN;
      return Math.max(-2.2, Math.min(2.2, v));
    },
    [compiled]
  );

  const applyPreset = (preset: LimitPreset) => {
    setActivePresetId(preset.id);
    setExpr(preset.expr);
    setPathFamily(preset.defaultFamily);
    setPathParam(preset.defaultK);
    setApproachDist(0.45);
  };

  const resetDefaults = () => applyPreset(LIMIT_PRESETS[0]);

  const pathEval = useCallback(
    (t: number): [number, number] => {
      if (pathFamily === "linear") {
        return [t, pathParam * t];
      }
      if (pathFamily === "parabolic") {
        return [t, pathParam * t * t];
      }
      // Polar: radius |t| at angle θ = pathParam * Math.PI / 2
      const theta = pathParam * (Math.PI / 2);
      const r = Math.max(0.015, Math.abs(t));
      return [r * Math.cos(theta), r * Math.sin(theta)];
    },
    [pathFamily, pathParam]
  );

  const telemetry = useMemo(() => {
    const tSafe =
      Math.abs(approachDist) < 0.02
        ? approachDist >= 0
          ? 0.02
          : -0.02
        : approachDist;
    const [px, py] = pathEval(tSafe);
    const pz = safeEval(px, py);
    const radius = Math.hypot(px, py);

    // Sample near origin (t = 0.012) along 4 canonical curves to diagnose agreement
    const eps = 0.012;
    const limAxisX = safeEval(eps, 0);
    const limAxisY = safeEval(0, eps);
    const limDiag = safeEval(eps, eps);
    const limAntiDiag = safeEval(eps, -eps);
    const limParab = safeEval(Math.sqrt(eps), eps);

    const probes = [limAxisX, limAxisY, limDiag, limAntiDiag, limParab].filter(
      (v) => Number.isFinite(v)
    );
    const spread =
      probes.length >= 2 ? Math.max(...probes) - Math.min(...probes) : NaN;
    const pathsAgree = Number.isFinite(spread) && spread < 0.04;

    // Generate 2D path curve points for SVG overlay
    const pathPts2D: [number, number][] = [];
    const steps = 80;
    if (pathFamily === "polar") {
      const theta = pathParam * (Math.PI / 2);
      for (let i = 1; i <= steps; i++) {
        const r = (i / steps) * 1.45;
        pathPts2D.push([r * Math.cos(theta), r * Math.sin(theta)]);
      }
    } else {
      for (let i = 0; i <= steps; i++) {
        const t = -1.25 + (i / steps) * 2.5;
        const [cx, cy] = pathEval(t);
        pathPts2D.push([cx, cy]);
      }
    }

    // Approach profile z(t) near origin
    const profilePts: [number, number][] = [];
    for (let i = 0; i <= 90; i++) {
      const t =
        pathFamily === "polar"
          ? 0.02 + (i / 90) * 1.23
          : -1.1 + (i / 90) * 2.2;
      if (Math.abs(t) < 0.018) continue;
      const [cx, cy] = pathEval(t);
      const cz = safeEval(cx, cy);
      if (Number.isFinite(cz)) {
        profilePts.push([t, cz]);
      }
    }

    return {
      tSafe,
      px,
      py,
      pz,
      radius,
      limAxisX,
      limDiag,
      limAntiDiag,
      limParab,
      spread,
      pathsAgree,
      pathPts2D,
      profilePts,
    };
  }, [approachDist, pathEval, pathFamily, pathParam, safeEval]);

  const buildScene = useCallback(
    (dynamicGroup: THREE.Group) => {
      // Surface z = f(x, y) over [-1.3, 1.3]^2
      const surf = createParametricSurfaceMesh(
        (u, v) => {
          const r2 = u * u + v * v;
          if (r2 < 0.0025) {
            // Avoid 0/0 exact division jitter right on the pinhole
            const zAvg = safeEval(0.05, 0.05);
            return [u, v, Number.isFinite(zAvg) ? zAvg : 0];
          }
          const z = safeEval(u, v);
          return [u, v, Number.isFinite(z) ? z : 0];
        },
        [-1.3, 1.3],
        [-1.3, 1.3],
        36,
        36,
        {
          color: 0x029091,
          opacity: 0.45,
          wireframeColor: 0x8d9fce,
          wireframeOpacity: 0.18,
          showWireframe: true,
        }
      );
      dynamicGroup.add(surf);

      // Highlighted lifted path curve on z = f(x(t), y(t))
      const addCurveSegment = (pts: THREE.Vector3[], hex: number) => {
        if (pts.length < 2) return;
        dynamicGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            new THREE.LineBasicMaterial({ color: hex })
          )
        );
      };

      const negPts: THREE.Vector3[] = [];
      const posPts: THREE.Vector3[] = [];
      const floorPts: THREE.Vector3[] = [];

      if (pathFamily === "polar") {
        const theta = pathParam * (Math.PI / 2);
        for (let i = 1; i <= 50; i++) {
          const r = (i / 50) * 1.28;
          const x = r * Math.cos(theta);
          const y = r * Math.sin(theta);
          const z = safeEval(x, y);
          if (Number.isFinite(z)) {
            posPts.push(mathToThreeVec3(x, y, z + 0.02));
            floorPts.push(mathToThreeVec3(x, y, 0.01));
          }
        }
      } else {
        for (let i = -45; i <= 45; i++) {
          if (i === 0) continue;
          const t = (i / 45) * 1.25;
          const [x, y] = pathEval(t);
          if (Math.abs(x) <= 1.32 && Math.abs(y) <= 1.32) {
            const z = safeEval(x, y);
            if (Number.isFinite(z)) {
              const vec = mathToThreeVec3(x, y, z + 0.02);
              if (t < 0) negPts.push(vec);
              else posPts.push(vec);
              floorPts.push(mathToThreeVec3(x, y, 0.01));
            }
          }
        }
      }

      addCurveSegment(negPts, 0xd35323);
      addCurveSegment(posPts, 0xd35323);
      addCurveSegment(floorPts, 0xfbeaa4);

      // Active moving point sphere + vertical plumb line
      if (Number.isFinite(telemetry.pz)) {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xd35323 })
        );
        sphere.position.copy(
          mathToThreeVec3(telemetry.px, telemetry.py, telemetry.pz)
        );
        dynamicGroup.add(sphere);

        const plumb = new THREE.BufferGeometry().setFromPoints([
          mathToThreeVec3(telemetry.px, telemetry.py, 0),
          mathToThreeVec3(telemetry.px, telemetry.py, telemetry.pz),
        ]);
        dynamicGroup.add(
          new THREE.Line(
            plumb,
            new THREE.LineBasicMaterial({ color: 0xd35323 })
          )
        );
      }
    },
    [pathEval, pathFamily, pathParam, safeEval, telemetry.px, telemetry.py, telemetry.pz]
  );

  const activePreset = LIMIT_PRESETS.find((p) => p.id === activePresetId);

  return (
    <section
      aria-label="Multivariable Limits and Path-Dependent Approach Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#8D9FCE] text-[#8D9FCE] bg-[var(--bg-canvas)]">
              LAB 3.1.5A • MULTIVARIABLE PATHS &amp; POLAR LIMITS
            </span>
            <span
              className={`px-2 py-0.5 text-[11px] font-tabular-mono border inline-flex items-center gap-1 ${
                telemetry.pathsAgree
                  ? "border-[#96B898] text-[#96B898] bg-[#96B898]/10"
                  : "border-[#D35323] text-[#D35323] bg-[#D35323]/10"
              }`}
            >
              {telemetry.pathsAgree ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Canonical Paths Agree (Δ = {telemetry.spread.toFixed(3)})
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  Path Split Detected (Spread Δ ={" "}
                  {Number.isFinite(telemetry.spread)
                    ? telemetry.spread.toFixed(3)
                    : "—"}
                  )
                </>
              )}
            </span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
            Approaching (0, 0) Along Lines, Parabolas &amp; Polar Neighborhoods
          </h3>
        </div>

        <button
          type="button"
          onClick={resetDefaults}
          className="px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-canvas)] inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Presets & Custom Expression */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 space-y-4 bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap gap-2">
          {LIMIT_PRESETS.map((preset) => {
            const selected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                  selected
                    ? "border-[#8D9FCE] bg-[#8D9FCE]/15 text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                {preset.title}
              </button>
            );
          })}
        </div>

        <MathExpressionInput
          label="Custom Surface Height Function f(x, y)"
          value={expr}
          onChange={(nextExpr) => {
            setExpr(nextExpr);
            setActivePresetId("custom");
          }}
          allowedVars={["x", "y"]}
          prefixLatex="f(x, y) ="
          compact
        />

        {/* Path Family + Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <span className="text-xs font-sans text-[var(--text-secondary)] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#D35323]" />
              Approach Curve Family
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "linear", label: "y = m·x" },
                  { id: "parabolic", label: "y = k·x²" },
                  { id: "polar", label: "Polar θ" },
                ] as { id: PathFamily; label: string }[]
              ).map((fam) => (
                <button
                  key={fam.id}
                  type="button"
                  onClick={() => setPathFamily(fam.id)}
                  className={`py-1.5 px-2 text-xs font-tabular-mono border ${
                    pathFamily === fam.id
                      ? "border-[#D35323] bg-[#D35323]/15 text-[var(--text-primary)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
                  }`}
                >
                  {fam.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                {pathFamily === "linear"
                  ? "Slope Parameter m"
                  : pathFamily === "parabolic"
                  ? "Parabola Curvature k"
                  : "Polar Angle θ / (π/2)"}
              </span>
              <span className="font-tabular-mono text-[#8D9FCE]">
                {pathFamily === "polar"
                  ? `${((pathParam * 90) % 360).toFixed(0)}°`
                  : pathParam.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={pathFamily === "polar" ? 0 : -2.5}
              max={pathFamily === "polar" ? 4.0 : 2.5}
              step={0.05}
              value={pathParam}
              aria-label="Approach path parameter"
              onChange={(e) => setPathParam(parseFloat(e.target.value))}
              className="w-full accent-[#8D9FCE]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Approach Coordinate t → 0
              </span>
              <span className="font-tabular-mono text-[#D35323]">
                t = {telemetry.tSafe.toFixed(2)} (r = {telemetry.radius.toFixed(2)})
              </span>
            </div>
            <input
              type="range"
              min={pathFamily === "polar" ? 0.02 : -1.15}
              max={1.15}
              step={0.01}
              value={approachDist}
              aria-label="Approach coordinate t"
              onChange={(e) => setApproachDist(parseFloat(e.target.value))}
              className="w-full accent-[#D35323]"
            />
          </div>
        </div>
      </div>

      {/* Synchronized Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
        {/* Left: 2D Domain Plane + delta Disk */}
        <div className="lg:col-span-5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              1. 2D Domain Plane &amp; δ-Disk Radius{" "}
              <KaTeXMath math={`r = ${telemetry.radius.toFixed(2)}`} />
            </span>
            <span className="text-[11px] font-tabular-mono text-[#FBEAA4]">
              ({telemetry.px.toFixed(2)}, {telemetry.py.toFixed(2)})
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-1.35, 1.35]}
            yRange={[-1.35, 1.35]}
            width={400}
            height={320}
            xLabel="x"
            yLabel="y"
            xColor="#8D9FCE"
            yColor="#96B898"
            ariaLabel="2D approach path in xy-plane"
          >
            {({ toSvgX, toSvgY }) => {
              const cx0 = toSvgX(0);
              const cy0 = toSvgY(0);
              const rPx = Math.abs(toSvgX(telemetry.radius) - cx0);
              const pts = telemetry.pathPts2D
                .filter(([px, py]) => Math.abs(px) <= 1.35 && Math.abs(py) <= 1.35)
                .map(
                  ([px, py]) =>
                    `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`
                )
                .join(" ");

              return (
                <>
                  {/* Delta disk centered at (0,0) */}
                  <circle
                    cx={cx0}
                    cy={cy0}
                    r={Math.max(3, rPx)}
                    fill="#029091"
                    fillOpacity={0.12}
                    stroke="#029091"
                    strokeDasharray="4 3"
                    strokeWidth={1.2}
                  />
                  {/* Origin pinhole */}
                  <circle
                    cx={cx0}
                    cy={cy0}
                    r={4}
                    fill="none"
                    stroke="#B95869"
                    strokeWidth={1.6}
                  />
                  {pts && (
                    <polyline
                      points={pts}
                      fill="none"
                      stroke="#FBEAA4"
                      strokeWidth={2.2}
                    />
                  )}
                  <circle
                    cx={toSvgX(telemetry.px)}
                    cy={toSvgY(telemetry.py)}
                    r={5.2}
                    fill="#D35323"
                  />
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: 3D WebGL Viewport */}
        <div className="lg:col-span-7 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              2. 3D Surface &amp; Lifted Approach Trajectory z = f(x(t), y(t))
            </span>
            <span className="text-[11px] font-tabular-mono text-[#D35323]">
              z ={" "}
              {Number.isFinite(telemetry.pz)
                ? telemetry.pz.toFixed(4)
                : "Undefined"}
            </span>
          </div>

          <ThreeOrbitViewport
            heightClassName="h-[320px]"
            cameraPosition={[2.5, 2.2, 2.5]}
            cameraTarget={[0, 0.1, 0]}
            titleBadge="f(x, y) near (0, 0)"
            axesOptions={{
              gridExtent: 2.8,
              gridDivisions: 10,
              axisLength: 1.5,
            }}
            onBuildScene={buildScene}
            sceneDeps={[buildScene]}
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[#FBEAA4]">
                  Domain path: (x(t), y(t)) → (0, 0)
                </span>
                <span className="text-[#D35323]">
                  Probe height f ={" "}
                  {Number.isFinite(telemetry.pz)
                    ? telemetry.pz.toFixed(4)
                    : "NaN"}
                </span>
              </div>
            }
          />
        </div>
      </div>

      {/* Multi-Path Numerical Comparison Strip */}
      <div className="border-t border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-elevated)] space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Along x-axis (y = 0)", val: telemetry.limAxisX, hex: "#8D9FCE" },
            { label: "Along line y = x", val: telemetry.limDiag, hex: "#96B898" },
            { label: "Along line y = -x", val: telemetry.limAntiDiag, hex: "#B95869" },
            { label: "Along parabola y = x²", val: telemetry.limParab, hex: "#D35323" },
          ].map((probe) => (
            <div
              key={probe.label}
              className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
            >
              <div className="text-[11px] font-sans text-[var(--text-muted)]">
                {probe.label}
              </div>
              <div
                className="mt-1 text-base font-tabular-mono"
                style={{ color: probe.hex }}
              >
                {Number.isFinite(probe.val) ? probe.val.toFixed(4) : "NaN"}
              </div>
            </div>
          ))}
        </div>

        {activePreset && (
          <div className="p-3 border border-[#8D9FCE]/40 bg-[var(--bg-canvas)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-sans font-semibold text-[#8D9FCE]">
                {activePreset.badge}
              </div>
              <p className="text-xs font-serif text-[var(--text-secondary)]">
                {activePreset.note}
              </p>
            </div>
            <div className="shrink-0 px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
              <KaTeXMath math={activePreset.exactLatex} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
