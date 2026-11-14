"use client";

import React, { useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { RotateCcw, Sparkles } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  SvgCoordinatePlane2D,
  ThreeOrbitViewport,
  createParametricSurfaceMesh,
  computePartialDerivatives2D,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

interface HomogeneousPreset {
  id: string;
  label: string;
  degreeN: number;
  degreeLabel: string;
  positiveQuadrantOnly: boolean;
  defaultPoint: [number, number];
  evalFn: (x: number, y: number) => number;
  formulaLatex: string;
  note: string;
}

const HOMOGENEOUS_PRESETS: HomogeneousPreset[] = [
  {
    id: "deg-2",
    label: "n = 2: x² + 0.5xy + 0.8y²",
    degreeN: 2,
    degreeLabel: "n = 2",
    positiveQuadrantOnly: false,
    defaultPoint: [0.85, 0.7],
    evalFn: (x, y) => x * x + 0.5 * x * y + 0.8 * y * y,
    formulaLatex: "f(tx,ty) = t^2 f(x,y) \\implies xf_x + yf_y = 2f",
    note: "Quadratic polynomial: doubling radial distance quadruples height (2² = 4) and ∇f · r = 2f.",
  },
  {
    id: "deg-half",
    label: "n = 1/2: (x + y) / (√x + √y)",
    degreeN: 0.5,
    degreeLabel: "n = 1/2",
    positiveQuadrantOnly: true,
    defaultPoint: [1.0, 0.7],
    evalFn: (x, y) => {
      const xs = Math.max(0.04, x);
      const ys = Math.max(0.04, y);
      return (xs + ys) / (Math.sqrt(xs) + Math.sqrt(ys));
    },
    formulaLatex:
      "f(tx,ty) = \\frac{t^1(x+y)}{t^{1/2}(\\sqrt{x}+\\sqrt{y})} = t^{1/2}f(x,y)",
    note: "Classic half-degree homogeneous quotient defined on the first quadrant (x, y > 0).",
  },
  {
    id: "deg-zero",
    label: "n = 0: (x² - y²) / (x² + y²)",
    degreeN: 0,
    degreeLabel: "n = 0",
    positiveQuadrantOnly: false,
    defaultPoint: [1.0, 0.55],
    evalFn: (x, y) => {
      const r2 = x * x + y * y;
      return r2 < 0.01 ? 0 : (x * x - y * y) / r2;
    },
    formulaLatex: "f(tx,ty) = t^0 f(x,y) \\implies xf_x + yf_y = 0",
    note: "Degree-0 homogeneous function is constant along EVERY ray through the origin—so the directional gradient radial component r · ∇f vanishes identically!",
  },
  {
    id: "deg-neg1",
    label: "n = -1: x / (x² + y²)",
    degreeN: -1,
    degreeLabel: "n = -1",
    positiveQuadrantOnly: false,
    defaultPoint: [1.0, 0.65],
    evalFn: (x, y) => {
      const r2 = x * x + y * y;
      return r2 < 0.08 ? x / 0.08 : x / r2;
    },
    formulaLatex: "f(tx,ty) = t^{-1}f(x,y) \\implies xf_x + yf_y = -f",
    note: "Negative degree homogeneity: moving outward along a ray halves height when distance doubles.",
  },
];

export function HomogeneousScalingRayLab() {
  const [presetId, setPresetId] = useState<string>(HOMOGENEOUS_PRESETS[0].id);
  const [x0, setX0] = useState<number>(HOMOGENEOUS_PRESETS[0].defaultPoint[0]);
  const [y0, setY0] = useState<number>(HOMOGENEOUS_PRESETS[0].defaultPoint[1]);
  const [scaleT, setScaleT] = useState<number>(1.4);

  const preset = useMemo(
    () => HOMOGENEOUS_PRESETS.find((p) => p.id === presetId) ?? HOMOGENEOUS_PRESETS[0],
    [presetId]
  );

  const selectPreset = (p: HomogeneousPreset) => {
    setPresetId(p.id);
    setX0(p.defaultPoint[0]);
    setY0(p.defaultPoint[1]);
    setScaleT(1.4);
  };

  const resetDefaults = () => selectPreset(HOMOGENEOUS_PRESETS[0]);

  const metrics = useMemo(() => {
    const fBase = preset.evalFn(x0, y0);
    const tx = scaleT * x0;
    const ty = scaleT * y0;
    const fScaled = preset.evalFn(tx, ty);
    const fPredicted = Math.pow(scaleT, preset.degreeN) * fBase;

    const { fx, fy } = computePartialDerivatives2D(preset.evalFn, x0, y0, 0.004);
    const eulerLhs = x0 * fx + y0 * fy;
    const eulerRhs = preset.degreeN * fBase;

    // Height curve f(u·x0, u·y0) along the radial ray u ∈ [0.25, 2.0]
    const rayProfile: [number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const u = 0.25 + (i / 60) * 1.75;
      const val = preset.evalFn(u * x0, u * y0);
      if (Number.isFinite(val)) {
        rayProfile.push([u, Math.max(-2.5, Math.min(4.5, val))]);
      }
    }

    return {
      fBase,
      tx,
      ty,
      fScaled,
      fPredicted,
      fx,
      fy,
      eulerLhs,
      eulerRhs,
      rayProfile,
    };
  }, [preset, scaleT, x0, y0]);

  const buildScene = useCallback(
    (dynamicGroup: THREE.Group) => {
      const uMin = preset.positiveQuadrantOnly ? 0.08 : -1.8;
      const vMin = preset.positiveQuadrantOnly ? 0.08 : -1.8;
      const clampZ = (z: number) =>
        Number.isFinite(z) ? Math.max(-2.0, Math.min(3.2, z)) : 0;

      dynamicGroup.add(
        createParametricSurfaceMesh(
          (u, v) => [u, v, clampZ(preset.evalFn(u, v))],
          [uMin, 1.85],
          [vMin, 1.85],
          32,
          32,
          {
            color: 0x029091,
            opacity: 0.52,
            wireframeColor: 0x8d9fce,
            wireframeOpacity: 0.2,
            showWireframe: true,
          }
        )
      );

      // Highlighted Ray through origin along (x0, y0)
      const rayFloor: THREE.Vector3[] = [];
      const raySurface: THREE.Vector3[] = [];
      const maxU = 1.9;
      for (let i = 1; i <= 36; i++) {
        const u = (i / 36) * maxU;
        const rx = u * x0;
        const ry = u * y0;
        if (Math.abs(rx) > 2.2 || Math.abs(ry) > 2.2) continue;
        rayFloor.push(mathToThreeVec3(rx, ry, 0.01));
        raySurface.push(mathToThreeVec3(rx, ry, clampZ(preset.evalFn(rx, ry)) + 0.02));
      }
      if (rayFloor.length >= 2) {
        dynamicGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(rayFloor),
            new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
          )
        );
      }
      if (raySurface.length >= 2) {
        dynamicGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(raySurface),
            new THREE.LineBasicMaterial({ color: 0xd35323 })
          )
        );
      }

      // Base point (x0, y0, fBase) and Scaled point (tx, ty, fScaled)
      const addMarker = (mx: number, my: number, mz: number, hex: number) => {
        const cz = clampZ(mz);
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 16, 16),
          new THREE.MeshBasicMaterial({ color: hex })
        );
        dot.position.copy(mathToThreeVec3(mx, my, cz));
        dynamicGroup.add(dot);
        dynamicGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              mathToThreeVec3(mx, my, 0),
              mathToThreeVec3(mx, my, cz),
            ]),
            new THREE.LineBasicMaterial({ color: hex })
          )
        );
      };

      addMarker(x0, y0, metrics.fBase, 0x96b898);
      addMarker(metrics.tx, metrics.ty, metrics.fScaled, 0xd35323);
    },
    [metrics.fBase, metrics.fScaled, metrics.tx, metrics.ty, preset, x0, y0]
  );

  const coordMin = preset.positiveQuadrantOnly ? 0.2 : -1.2;

  return (
    <section
      aria-label="Homogeneous Functions and 1st-Order Euler Theorem Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-z)] text-[var(--math-ink-z)] bg-[var(--bg-canvas)]">
              LAB 3.1.7A • HOMOGENEOUS SCALING &amp; 1ST-ORDER EULER THEOREM
            </span>
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono border border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[#96B898]/10">
              Degree {preset.degreeLabel}
            </span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
            Radial Ray Invariance f(tx, ty) = tⁿf(x, y) &amp; xfₓ + yf_y = nf
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

      {/* Presets & Sliders */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 space-y-4 bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap gap-2">
          {HOMOGENEOUS_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                p.id === presetId
                  ? "border-[var(--math-ink-z)] bg-[#029091]/15 text-[var(--text-primary)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Ray Scale Factor <strong className="text-[var(--math-ink-sweep)] font-mono">t</strong>
              </span>
              <span className="font-tabular-mono text-[var(--math-ink-sweep)]">
                t = {scaleT.toFixed(2)} (tⁿ = {Math.pow(scaleT, preset.degreeN).toFixed(3)})
              </span>
            </div>
            <input
              type="range"
              min={0.35}
              max={1.85}
              step={0.05}
              value={scaleT}
              aria-label="Radial scale factor t"
              onChange={(e) => setScaleT(parseFloat(e.target.value))}
              className="w-full accent-[#D35323]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Base x₀</span>
              <span className="font-tabular-mono text-[var(--math-ink-x)]">
                x₀ = {x0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={coordMin}
              max={1.25}
              step={0.05}
              value={x0}
              aria-label="Base point x0"
              onChange={(e) => setX0(parseFloat(e.target.value))}
              className="w-full accent-[#8D9FCE]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Base y₀</span>
              <span className="font-tabular-mono text-[var(--math-ink-y)]">
                y₀ = {y0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={coordMin}
              max={1.25}
              step={0.05}
              value={y0}
              aria-label="Base point y0"
              onChange={(e) => setY0(parseFloat(e.target.value))}
              className="w-full accent-[#96B898]"
            />
          </div>
        </div>
      </div>

      {/* Viewports: 3D Ray Surface + 2D Ray Power Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
        <div className="lg:col-span-7 p-5">
          <ThreeOrbitViewport
            heightClassName="h-[310px]"
            cameraPosition={[2.9, 2.5, 2.9]}
            cameraTarget={[0.4, 0.3, -0.4]}
            titleBadge="Base Point P₀ (Sage) → Scaled t·P₀ (Persimmon) along Ray"
            axesOptions={{
              gridExtent: 4.0,
              gridDivisions: 10,
              axisLength: 2.0,
            }}
            onBuildScene={buildScene}
            sceneDeps={[buildScene]}
          />
        </div>

        <div className="lg:col-span-5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              Ray Height Profile <KaTeXMath math="h(t) = f(t x_0, t y_0) = t^n f(x_0, y_0)" />
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[0, 2.1]}
            yRange={[-1.8, 4.2]}
            width={400}
            height={275}
            xLabel="scale t"
            yLabel="f(tx₀, ty₀)"
            xColor="#FBEAA4"
            yColor="#D35323"
            ariaLabel="Homogeneous ray scaling profile"
          >
            {({ toSvgX, toSvgY }) => {
              const pts = metrics.rayProfile
                .map(
                  ([u, val]) =>
                    `${toSvgX(u).toFixed(1)},${toSvgY(val).toFixed(1)}`
                )
                .join(" ");
              return (
                <>
                  {pts && (
                    <polyline
                      points={pts}
                      fill="none"
                      stroke="#029091"
                      strokeWidth={2.2}
                    />
                  )}
                  <circle
                    cx={toSvgX(1)}
                    cy={toSvgY(Math.max(-1.8, Math.min(4.2, metrics.fBase)))}
                    r={4.5}
                    fill="#96B898"
                  />
                  <circle
                    cx={toSvgX(scaleT)}
                    cy={toSvgY(Math.max(-1.8, Math.min(4.2, metrics.fScaled)))}
                    r={5.2}
                    fill="#D35323"
                  />
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Readouts */}
      <div className="border-t border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-elevated)] space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans text-[var(--text-muted)]">
              Direct Evaluation f(t x₀, t y₀)
            </div>
            <div className="mt-1 text-base font-tabular-mono text-[var(--math-ink-sweep)]">
              {metrics.fScaled.toFixed(5)}
            </div>
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans text-[var(--text-muted)]">
              Power Scaling Prediction tⁿ · f(x₀, y₀)
            </div>
            <div className="mt-1 text-base font-tabular-mono text-[var(--math-ink-y)]">
              {metrics.fPredicted.toFixed(5)}
            </div>
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans text-[var(--text-muted)]">
              Euler 1st Order: x₀fₓ + y₀f_y vs n·f
            </div>
            <div className="mt-1 text-sm font-tabular-mono text-[var(--math-ink-diff)]">
              {metrics.eulerLhs.toFixed(4)} = {metrics.eulerRhs.toFixed(4)}
            </div>
          </div>
        </div>

        <div className="p-3 border border-[var(--math-ink-z)]/40 bg-[var(--bg-canvas)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-sans font-semibold text-[var(--math-ink-z)] inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {preset.label}
            </div>
            <p className="text-xs font-serif text-[var(--text-secondary)]">
              {preset.note}
            </p>
          </div>
          <div className="shrink-0 px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
            <KaTeXMath math={preset.formulaLatex} />
          </div>
        </div>
      </div>
    </section>
  );
}
