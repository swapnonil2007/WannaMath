"use client";

import React, { useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { RotateCcw, Crosshair } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  createParametricSurfaceMesh,
  computePartialDerivatives2D,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

interface HessianPreset {
  id: string;
  label: string;
  expr: string;
  defaultPoint: [number, number];
  note: string;
}

const HESSIAN_PRESETS: HessianPreset[] = [
  {
    id: "local-min",
    label: "Local Minimum (D > 0, r > 0)",
    expr: "0.55*x^2 + 0.35*x*y + 0.75*y^2",
    defaultPoint: [0, 0],
    note: "Both Hessian eigenvalues λ₁, λ₂ > 0: every direction curves strictly upward into an elliptic bowl.",
  },
  {
    id: "local-max",
    label: "Local Maximum (D > 0, r < 0)",
    expr: "1.1 - 0.65*x^2 + 0.3*x*y - 0.55*y^2",
    defaultPoint: [0, 0],
    note: "Positive discriminant D = rt - s² > 0 combined with concave downward r = f_xx < 0 guarantees a local peak.",
  },
  {
    id: "saddle",
    label: "Hyperbolic Saddle (D < 0)",
    expr: "0.7*x^2 - 0.75*y^2 + 0.25*x*y",
    defaultPoint: [0, 0],
    note: "Opposite eigenvalue signs (D < 0): ascending along one principal axis while descending along the orthogonal axis.",
  },
  {
    id: "cubic-landscape",
    label: "Multi-Critical: 0.3(x³ + y³ - 3xy)",
    expr: "0.3*(x^3 + y^3 - 3*x*y)",
    defaultPoint: [1.0, 1.0],
    note: "Features TWO critical points: (0, 0) is a Saddle (D < 0), while snapping to (1, 1) lands in a true Local Minimum (D > 0, r > 0)!",
  },
];

export function HessianSecondDerivativeTestLab() {
  const [presetId, setPresetId] = useState<string>(HESSIAN_PRESETS[3].id);
  const [expr, setExpr] = useState<string>(HESSIAN_PRESETS[3].expr);
  const [x0, setX0] = useState<number>(1.0);
  const [y0, setY0] = useState<number>(1.0);

  const compiled = useMemo(
    () => compileMathExpression(expr, ["x", "y"]),
    [expr]
  );

  const safeEval = useCallback(
    (x: number, y: number): number => {
      if (!compiled.valid) return NaN;
      const v = compiled.evaluate({ x, y });
      return Number.isFinite(v) ? v : NaN;
    },
    [compiled]
  );

  const applyPreset = (p: HessianPreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setX0(p.defaultPoint[0]);
    setY0(p.defaultPoint[1]);
  };

  const stats = useMemo(() => {
    const f0 = safeEval(x0, y0);
    const { fx, fy } = computePartialDerivatives2D(safeEval, x0, y0, 0.004);
    const gradNorm = Math.hypot(fx, fy);

    const h = 0.015;
    const r = (safeEval(x0 + h, y0) - 2 * f0 + safeEval(x0 - h, y0)) / (h * h);
    const t = (safeEval(x0, y0 + h) - 2 * f0 + safeEval(x0, y0 - h)) / (h * h);
    const s =
      (safeEval(x0 + h, y0 + h) -
        safeEval(x0 + h, y0 - h) -
        safeEval(x0 - h, y0 + h) +
        safeEval(x0 - h, y0 - h)) /
      (4 * h * h);

    const D = r * t - s * s;

    // Eigenvalues of [[r, s], [s, t]]
    const trace = r + t;
    const disc = Math.sqrt(Math.max(0, (r - t) * (r - t) + 4 * s * s));
    const lambda1 = 0.5 * (trace + disc);
    const lambda2 = 0.5 * (trace - disc);

    let verdict = "Not a Stationary Point (∇f ≠ 0)";
    let badgeColor = "#8D9FCE";
    if (gradNorm < 0.08) {
      if (Math.abs(D) < 0.04) {
        verdict = "D ≈ 0 (Inconclusive — Use General Method!)";
        badgeColor = "#FBEAA4";
      } else if (D > 0 && r > 0) {
        verdict = "Local Minimum (D > 0, r > 0)";
        badgeColor = "#96B898";
      } else if (D > 0 && r < 0) {
        verdict = "Local Maximum (D > 0, r < 0)";
        badgeColor = "#D35323";
      } else {
        verdict = "Saddle Point (D < 0)";
        badgeColor = "#B95869";
      }
    }

    return { f0, fx, fy, gradNorm, r, s, t, D, lambda1, lambda2, verdict, badgeColor };
  }, [safeEval, x0, y0]);

  const buildScene = useCallback(
    (dynamicGroup: THREE.Group) => {
      const clampZ = (z: number) =>
        Number.isFinite(z) ? Math.max(-2.2, Math.min(2.6, z)) : 0;

      dynamicGroup.add(
        createParametricSurfaceMesh(
          (u, v) => [u, v, clampZ(safeEval(u, v))],
          [-1.5, 1.5],
          [-1.5, 1.5],
          36,
          36,
          {
            color: 0x029091,
            opacity: 0.56,
            wireframeColor: 0xfbeaa4,
            wireframeOpacity: 0.18,
            showWireframe: true,
          }
        )
      );

      if (Number.isFinite(stats.f0)) {
        const zClamped = clampZ(stats.f0);
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 16, 16),
          new THREE.MeshBasicMaterial({ color: stats.badgeColor })
        );
        dot.position.copy(mathToThreeVec3(x0, y0, zClamped));
        dynamicGroup.add(dot);

        dynamicGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              mathToThreeVec3(x0, y0, 0),
              mathToThreeVec3(x0, y0, zClamped),
            ]),
            new THREE.LineBasicMaterial({ color: stats.badgeColor })
          )
        );
      }
    },
    [safeEval, stats.badgeColor, stats.f0, x0, y0]
  );

  const activePreset = HESSIAN_PRESETS.find((p) => p.id === presetId);

  return (
    <section
      aria-label="Second Derivative Test and Critical Point Classifier Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#B95869] text-[#B95869] bg-[var(--bg-canvas)]">
              LAB 3.1.8A • SECOND DERIVATIVE TEST (r, s, t &amp; D = rt − s²)
            </span>
            <span
              className="px-2 py-0.5 text-[11px] font-tabular-mono border"
              style={{
                borderColor: stats.badgeColor,
                color: stats.badgeColor,
              }}
            >
              {stats.verdict}
            </span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
            Critical Point Classifier, Hessian Discriminant &amp; Principal Curvatures
          </h3>
        </div>

        <button
          type="button"
          onClick={() => applyPreset(HESSIAN_PRESETS[3])}
          className="px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-canvas)] inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Controls */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 space-y-4 bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap gap-2">
          {HESSIAN_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                p.id === presetId
                  ? "border-[#B95869] bg-[#B95869]/15 text-[var(--text-primary)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <MathExpressionInput
          label="Custom Objective Surface f(x, y)"
          value={expr}
          onChange={(nextExpr) => {
            setExpr(nextExpr);
            setPresetId("custom");
          }}
          allowedVars={["x", "y"]}
          prefixLatex="f(x, y) ="
          compact
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Probe x₀</span>
              <span className="font-tabular-mono text-[#8D9FCE]">
                {x0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={-1.35}
              max={1.35}
              step={0.05}
              value={x0}
              aria-label="Probe x0"
              onChange={(e) => setX0(parseFloat(e.target.value))}
              className="w-full accent-[#8D9FCE]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Probe y₀</span>
              <span className="font-tabular-mono text-[#96B898]">
                {y0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={-1.35}
              max={1.35}
              step={0.05}
              value={y0}
              aria-label="Probe y0"
              onChange={(e) => setY0(parseFloat(e.target.value))}
              className="w-full accent-[#96B898]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex flex-col justify-between gap-2">
            <span className="text-xs font-sans text-[var(--text-secondary)] flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-[#FBEAA4]" />
              Quick Snap to Stationary Points
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setX0(0);
                  setY0(0);
                }}
                className="flex-1 py-1 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)]"
              >
                (0, 0)
              </button>
              <button
                type="button"
                onClick={() => {
                  setX0(1);
                  setY0(1);
                }}
                className="flex-1 py-1 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)]"
              >
                (1, 1)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Surface + Live Diagnostic Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
        <div className="lg:col-span-7 p-5">
          <ThreeOrbitViewport
            heightClassName="h-[320px]"
            cameraPosition={[2.7, 2.3, 2.7]}
            cameraTarget={[0, 0.1, 0]}
            titleBadge="Surface z = f(x, y) & Critical Point Probe"
            axesOptions={{
              gridExtent: 3.2,
              gridDivisions: 10,
              axisLength: 1.6,
            }}
            onBuildScene={buildScene}
            sceneDeps={[buildScene]}
          />
        </div>

        <div className="lg:col-span-5 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs font-tabular-mono">
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <div className="text-[var(--text-muted)]">Gradient ‖∇f‖</div>
              <div className="mt-1 text-sm text-[#8D9FCE]">
                {stats.gradNorm.toFixed(4)}
              </div>
            </div>
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <div className="text-[var(--text-muted)]">Discriminant D = rt − s²</div>
              <div
                className="mt-1 text-sm font-semibold"
                style={{ color: stats.badgeColor }}
              >
                {stats.D.toFixed(4)}
              </div>
            </div>
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <div className="text-[var(--text-muted)]">r = f_xx, s = f_xy, t = f_yy</div>
              <div className="mt-1 text-xs text-[#FBEAA4]">
                ({stats.r.toFixed(2)}, {stats.s.toFixed(2)}, {stats.t.toFixed(2)})
              </div>
            </div>
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <div className="text-[var(--text-muted)]">Eigen-Curvatures λ₁, λ₂</div>
              <div className="mt-1 text-xs text-[#029091]">
                {stats.lambda1.toFixed(2)}, {stats.lambda2.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs overflow-x-auto">
            <KaTeXMath
              math="D = rt - s^2 \begin{cases} >0,\, r>0 & \text{Local Min} \\ >0,\, r<0 & \text{Local Max} \\ <0 & \text{Saddle Point} \\ =0 & \text{Inconclusive} \end{cases}"
              block
            />
          </div>

          {activePreset && (
            <p className="text-xs font-serif text-[var(--text-secondary)] leading-relaxed">
              {activePreset.note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
