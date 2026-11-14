"use client";

import React, { useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { RotateCcw, Eye } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  createParametricSurfaceMesh,
  computePartialDerivatives2D,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

interface Taylor2DPreset {
  id: string;
  label: string;
  expr: string;
  defaultCenter: [number, number];
  note: string;
}

const TAYLOR_2D_PRESETS: Taylor2DPreset[] = [
  {
    id: "wave-saddle",
    label: "cos(x)·cos(y) (Oscillating Peaks)",
    expr: "cos(x)*cos(y)",
    defaultCenter: [0.0, 0.0],
    note: "At (0, 0), gradient is 0 so T₁ is flat z = 1, while T₂(x,y) = 1 - ½(x² + y²) captures the downward elliptic bowl curvature!",
  },
  {
    id: "mixed-exp",
    label: "e^(-0.4(x²+y²)) + 0.3xy (Gaussian + Twist)",
    expr: "exp(-0.4*(x^2+y^2)) + 0.3*x*y",
    defaultCenter: [0.35, -0.25],
    note: "Cross term f_xy bends the principal axes of the quadratic surface T₂ diagonally at 45° relative to the coordinate grid.",
  },
  {
    id: "cubic-monkey",
    label: "0.25(x³ - 3xy²) + 0.4sin(x) (Cubic Saddle)",
    expr: "0.25*(x^3 - 3*x*y^2) + 0.4*sin(x)",
    defaultCenter: [0.6, 0.4],
    note: "Move (x₀, y₀) away from (0,0) to watch the Hessian eigenvalues switch signs across saddle vs. valley regions.",
  },
];

export function MultivariableTaylorHessianLab() {
  const [presetId, setPresetId] = useState<string>(TAYLOR_2D_PRESETS[0].id);
  const [expr, setExpr] = useState<string>(TAYLOR_2D_PRESETS[0].expr);
  const [x0, setX0] = useState<number>(TAYLOR_2D_PRESETS[0].defaultCenter[0]);
  const [y0, setY0] = useState<number>(TAYLOR_2D_PRESETS[0].defaultCenter[1]);
  const [showT1, setShowT1] = useState<boolean>(true);
  const [showT2, setShowT2] = useState<boolean>(true);

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

  const applyPreset = (p: Taylor2DPreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setX0(p.defaultCenter[0]);
    setY0(p.defaultCenter[1]);
  };

  const resetDefaults = () => {
    applyPreset(TAYLOR_2D_PRESETS[0]);
    setShowT1(true);
    setShowT2(true);
  };

  // Compute value, gradient (fx, fy), and 2x2 Hessian matrix [fxx, fxy; fxy, fyy]
  const taylorData = useMemo(() => {
    const f0 = safeEval(x0, y0);
    const { fx, fy } = computePartialDerivatives2D(safeEval, x0, y0, 0.004);

    const h = 0.015;
    const fpx = safeEval(x0 + h, y0);
    const fmx = safeEval(x0 - h, y0);
    const fpy = safeEval(x0, y0 + h);
    const fmy = safeEval(x0, y0 - h);
    const fpp = safeEval(x0 + h, y0 + h);
    const fpm = safeEval(x0 + h, y0 - h);
    const fmp = safeEval(x0 - h, y0 + h);
    const fmm = safeEval(x0 - h, y0 - h);

    const fxx = (fpx - 2 * f0 + fmx) / (h * h);
    const fyy = (fpy - 2 * f0 + fmy) / (h * h);
    const fxy = (fpp - fpm - fmp + fmm) / (4 * h * h);

    const evalT1 = (x: number, y: number) =>
      f0 + fx * (x - x0) + fy * (y - y0);

    const evalT2 = (x: number, y: number) => {
      const dx = x - x0;
      const dy = y - y0;
      return (
        f0 +
        fx * dx +
        fy * dy +
        0.5 * (fxx * dx * dx + 2 * fxy * dx * dy + fyy * dy * dy)
      );
    };

    // Measure RMS error over local patch of radius 0.65 around (x0, y0)
    let sumSq1 = 0;
    let sumSq2 = 0;
    let count = 0;
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        const px = x0 + (i / 3) * 0.65;
        const py = y0 + (j / 3) * 0.65;
        const fv = safeEval(px, py);
        if (Number.isFinite(fv)) {
          sumSq1 += Math.pow(fv - evalT1(px, py), 2);
          sumSq2 += Math.pow(fv - evalT2(px, py), 2);
          count++;
        }
      }
    }
    const rmsT1 = count > 0 ? Math.sqrt(sumSq1 / count) : NaN;
    const rmsT2 = count > 0 ? Math.sqrt(sumSq2 / count) : NaN;

    return {
      f0,
      fx,
      fy,
      fxx,
      fxy,
      fyy,
      evalT1,
      evalT2,
      rmsT1,
      rmsT2,
    };
  }, [safeEval, x0, y0]);

  const buildScene = useCallback(
    (dynamicGroup: THREE.Group) => {
      const clampZ = (z: number) =>
        Number.isFinite(z) ? Math.max(-2.6, Math.min(2.6, z)) : 0;

      // Exact Surface f(x, y)
      dynamicGroup.add(
        createParametricSurfaceMesh(
          (u, v) => [u, v, clampZ(safeEval(u, v))],
          [-1.6, 1.6],
          [-1.6, 1.6],
          36,
          36,
          {
            color: 0x029091,
            opacity: 0.56,
            wireframeColor: 0x029091,
            wireframeOpacity: 0.25,
            showWireframe: true,
          }
        )
      );

      // Local neighborhood bounds for T1 & T2 around (x0, y0)
      const uMin = x0 - 0.9;
      const uMax = x0 + 0.9;
      const vMin = y0 - 0.9;
      const vMax = y0 + 0.9;

      if (showT1 && Number.isFinite(taylorData.f0)) {
        dynamicGroup.add(
          createParametricSurfaceMesh(
            (u, v) => [u, v, clampZ(taylorData.evalT1(u, v))],
            [uMin, uMax],
            [vMin, vMax],
            14,
            14,
            {
              color: 0x8d9fce,
              opacity: 0.22,
              wireframeColor: 0x8d9fce,
              wireframeOpacity: 0.52,
              showWireframe: true,
            }
          )
        );
      }

      if (showT2 && Number.isFinite(taylorData.f0)) {
        dynamicGroup.add(
          createParametricSurfaceMesh(
            (u, v) => [u, v, clampZ(taylorData.evalT2(u, v))],
            [uMin, uMax],
            [vMin, vMax],
            24,
            24,
            {
              color: 0xd35323,
              opacity: 0.35,
              wireframeColor: 0xfbeaa4,
              wireframeOpacity: 0.45,
              showWireframe: true,
            }
          )
        );
      }

      // Expansion point (x0, y0, f0) marker + plumb line
      if (Number.isFinite(taylorData.f0)) {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xfbeaa4 })
        );
        dot.position.copy(mathToThreeVec3(x0, y0, clampZ(taylorData.f0)));
        dynamicGroup.add(dot);

        dynamicGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              mathToThreeVec3(x0, y0, 0),
              mathToThreeVec3(x0, y0, clampZ(taylorData.f0)),
            ]),
            new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
          )
        );
      }
    },
    [safeEval, showT1, showT2, taylorData, x0, y0]
  );

  const activePreset = TAYLOR_2D_PRESETS.find((p) => p.id === presetId);

  return (
    <section
      aria-label="Multivariable 2D Taylor Expansion and Hessian Curvature Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[var(--bg-canvas)]">
              LAB 3.1.6B • 2D TAYLOR POLYNOMIALS T₁ &amp; T₂ (HESSIAN CURVATURE)
            </span>
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono border border-[var(--math-ink-z)] text-[var(--math-ink-z)] bg-[#029091]/10">
              Center ({x0.toFixed(2)}, {y0.toFixed(2)})
            </span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
            Tangent Plane T₁(x,y) vs. Quadratic Hessian Paraboloid T₂(x,y)
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

      {/* Controls */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 space-y-4 bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap gap-2">
          {TAYLOR_2D_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                presetId === p.id
                  ? "border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-[var(--text-primary)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <MathExpressionInput
          label="Custom Surface z = f(x, y)"
          value={expr}
          onChange={(nextExpr) => {
            setExpr(nextExpr);
            setPresetId("custom");
          }}
          allowedVars={["x", "y"]}
          prefixLatex="f(x,y) ="
          compact
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Center <strong className="text-[var(--math-ink-x)] font-mono">x₀</strong>
              </span>
              <span className="font-tabular-mono text-[var(--math-ink-x)]">
                x₀ = {x0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={-1.1}
              max={1.1}
              step={0.05}
              value={x0}
              aria-label="Taylor center x0"
              onChange={(e) => setX0(parseFloat(e.target.value))}
              className="w-full accent-[#8D9FCE]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Center <strong className="text-[var(--math-ink-y)] font-mono">y₀</strong>
              </span>
              <span className="font-tabular-mono text-[var(--math-ink-y)]">
                y₀ = {y0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={-1.1}
              max={1.1}
              step={0.05}
              value={y0}
              aria-label="Taylor center y0"
              onChange={(e) => setY0(parseFloat(e.target.value))}
              className="w-full accent-[#96B898]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <span className="text-xs font-sans text-[var(--text-secondary)] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[var(--math-ink-diff)]" />
              Surface Approximation Layers
            </span>
            <div className="flex items-center gap-3 text-xs font-sans">
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[var(--math-ink-x)]">
                <input
                  type="checkbox"
                  checked={showT1}
                  onChange={(e) => setShowT1(e.target.checked)}
                />
                T₁ Plane
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[var(--math-ink-sweep)]">
                <input
                  type="checkbox"
                  checked={showT2}
                  onChange={(e) => setShowT2(e.target.checked)}
                />
                T₂ Quadratic Hessian
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Viewport + Live Hessian Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
        <div className="lg:col-span-7 p-5 space-y-3">
          <ThreeOrbitViewport
            heightClassName="h-[340px]"
            cameraPosition={[2.9, 2.5, 2.9]}
            cameraTarget={[0, 0.25, 0]}
            titleBadge="Exact f (Teal) • T₁ Plane (Periwinkle) • T₂ Quadratic (Orange)"
            axesOptions={{
              gridExtent: 3.4,
              gridDivisions: 10,
              axisLength: 1.8,
            }}
            onBuildScene={buildScene}
            sceneDeps={[buildScene]}
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-x)]">
                  Patch RMS(f − T₁):{" "}
                  {Number.isFinite(taylorData.rmsT1)
                    ? taylorData.rmsT1.toFixed(4)
                    : "NaN"}
                </span>
                <span className="text-[var(--math-ink-sweep)]">
                  Patch RMS(f − T₂):{" "}
                  {Number.isFinite(taylorData.rmsT2)
                    ? taylorData.rmsT2.toFixed(4)
                    : "NaN"}
                </span>
              </div>
            }
          />
        </div>

        <div className="lg:col-span-5 p-5 space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              Local Taylor Building Blocks at ({x0.toFixed(2)}, {y0.toFixed(2)})
            </h4>
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2 text-xs font-tabular-mono">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Value f(p₀):</span>
                <span className="text-[var(--math-ink-z)]">
                  {Number.isFinite(taylorData.f0) ? taylorData.f0.toFixed(4) : "NaN"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Gradient ∇f(p₀):</span>
                <span className="text-[var(--math-ink-x)]">
                  ⟨{taylorData.fx.toFixed(3)}, {taylorData.fy.toFixed(3)}⟩
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              2×2 Symmetric Hessian Matrix H_f(p₀)
            </h4>
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-2 gap-2 text-center font-tabular-mono text-xs">
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <div className="text-[10px] text-[var(--text-muted)]">f_xx</div>
                <div className="text-[var(--math-ink-sweep)] text-sm">
                  {taylorData.fxx.toFixed(3)}
                </div>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <div className="text-[10px] text-[var(--text-muted)]">f_xy</div>
                <div className="text-[var(--math-ink-diff)] text-sm">
                  {taylorData.fxy.toFixed(3)}
                </div>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <div className="text-[10px] text-[var(--text-muted)]">f_yx</div>
                <div className="text-[var(--math-ink-diff)] text-sm">
                  {taylorData.fxy.toFixed(3)}
                </div>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <div className="text-[10px] text-[var(--text-muted)]">f_yy</div>
                <div className="text-[var(--math-ink-y)] text-sm">
                  {taylorData.fyy.toFixed(3)}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs overflow-x-auto">
            <KaTeXMath
              math="T_2(x_0+h,y_0+k) = f + f_x h + f_y k + \tfrac{1}{2}\!\left(f_{xx}h^2 + 2f_{xy}hk + f_{yy}k^2\right)"
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
