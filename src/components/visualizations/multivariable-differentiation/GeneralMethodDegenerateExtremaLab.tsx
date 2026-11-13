"use client";

import React, { useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  SvgCoordinatePlane2D,
  ThreeOrbitViewport,
  createParametricSurfaceMesh,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

interface DegeneratePreset {
  id: string;
  label: string;
  trueNature: "Local Minimum" | "Local Maximum" | "Saddle / Neither";
  parabolaKDefault: number;
  evalFn: (x: number, y: number) => number;
  analysisLatex: string;
  explanation: string;
}

const DEGENERATE_PRESETS: DegeneratePreset[] = [
  {
    id: "peano-saddle",
    label: "Peano's Counterexample: (y - x²)(y - 2x²)",
    trueNature: "Saddle / Neither",
    parabolaKDefault: 1.5,
    evalFn: (x, y) => (y - x * x) * (y - 2 * x * x),
    analysisLatex:
      "y=mx \\implies \\Delta f > 0 \\text{ near }0, \\;\\text{but } y=1.5x^2 \\implies \\Delta f = -0.25x^4 < 0",
    explanation:
      "Famous trap where D = 0 at (0,0): EVERY straight line through (0,0) has a strict local minimum at (0,0), yet scrubbing parabolic curve factor k ∈ (1, 2) uncovers a hidden negative valley (k = 1.5)!",
  },
  {
    id: "quartic-min",
    label: "D = 0 True Minimum: 0.4(x⁴ + y⁴)",
    trueNature: "Local Minimum",
    parabolaKDefault: 1.0,
    evalFn: (x, y) => 0.4 * (Math.pow(x, 4) + Math.pow(y, 4)),
    analysisLatex:
      "r=s=t=0 \\implies D=0, \\;\\text{yet } \\Delta f = 0.4(h^4+k^4) > 0 \\;\\forall (h,k)\\neq(0,0)",
    explanation:
      "Second derivative test fails (D = 0), but checking the general increment Δf shows strictly positive height on every nonzero circle and parabola.",
  },
  {
    id: "ridge-saddle",
    label: "D = 0 Inflection Ridge: x² - y⁴",
    trueNature: "Saddle / Neither",
    parabolaKDefault: 0.0,
    evalFn: (x, y) => x * x - Math.pow(y, 4),
    analysisLatex:
      "\\Delta f(h,0) = h^2 > 0, \\quad \\Delta f(0,k) = -k^4 < 0 \\implies \\text{Saddle}",
    explanation:
      "Even though f_xx = 2 > 0, f_yy = 0 yields D = 0; comparing Δf along x-axis (+) versus y-axis (-) immediately confirms a saddle.",
  },
  {
    id: "monkey-saddle",
    label: "Monkey Saddle: 0.5(x³ - 3xy²)",
    trueNature: "Saddle / Neither",
    parabolaKDefault: 0.0,
    evalFn: (x, y) => 0.5 * (x * x * x - 3 * x * y * y),
    analysisLatex:
      "\\Delta f(r\\cos\\theta, r\\sin\\theta) = \\tfrac{1}{2}r^3\\cos(3\\theta) \\;\\text{changes sign 6 times}",
    explanation:
      "All 2nd partials vanish at (0,0) (D = 0), leaving 3 rising ridges alternating with 3 descending valleys every 60°.",
  },
];

export function GeneralMethodDegenerateExtremaLab() {
  const [presetId, setPresetId] = useState<string>(DEGENERATE_PRESETS[0].id);
  const [parabolaK, setParabolaK] = useState<number>(1.5);
  const [angleDeg, setAngleDeg] = useState<number>(30);

  const preset = useMemo(
    () =>
      DEGENERATE_PRESETS.find((p) => p.id === presetId) ?? DEGENERATE_PRESETS[0],
    [presetId]
  );

  const selectPreset = (p: DegeneratePreset) => {
    setPresetId(p.id);
    setParabolaK(p.parabolaKDefault);
  };

  const curves = useMemo(() => {
    const theta = (angleDeg * Math.PI) / 180;
    const lineSlice: [number, number][] = [];
    const parabSlice: [number, number][] = [];

    for (let i = 0; i <= 100; i++) {
      const s = -0.9 + (i / 100) * 1.8;
      const lx = s * Math.cos(theta);
      const ly = s * Math.sin(theta);
      lineSlice.push([s, Math.max(-0.5, Math.min(0.8, preset.evalFn(lx, ly)))]);

      const px = s;
      const py = parabolaK * s * s;
      parabSlice.push([s, Math.max(-0.5, Math.min(0.8, preset.evalFn(px, py)))]);
    }

    const lineMin = Math.min(...lineSlice.map((p) => p[1]));
    const parabMin = Math.min(...parabSlice.map((p) => p[1]));
    const parabMax = Math.max(...parabSlice.map((p) => p[1]));

    return { theta, lineSlice, parabSlice, lineMin, parabMin, parabMax };
  }, [angleDeg, parabolaK, preset]);

  const buildScene = useCallback(
    (dynamicGroup: THREE.Group) => {
      const clampZ = (z: number) =>
        Number.isFinite(z) ? Math.max(-0.8, Math.min(1.0, z)) : 0;

      dynamicGroup.add(
        createParametricSurfaceMesh(
          (u, v) => [u, v, clampZ(preset.evalFn(u, v))],
          [-0.95, 0.95],
          [-0.95, 0.95],
          36,
          36,
          {
            color: 0x029091,
            opacity: 0.56,
            wireframeColor: 0x8d9fce,
            wireframeOpacity: 0.18,
            showWireframe: true,
          }
        )
      );

      // Highlighted parabolic probe y = k x^2 on the 3D surface!
      const pPts: THREE.Vector3[] = [];
      for (let i = -35; i <= 35; i++) {
        const s = (i / 35) * 0.85;
        const y = parabolaK * s * s;
        if (Math.abs(y) <= 0.95) {
          pPts.push(mathToThreeVec3(s, y, clampZ(preset.evalFn(s, y)) + 0.02));
        }
      }
      if (pPts.length >= 2) {
        dynamicGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pPts),
            new THREE.LineBasicMaterial({ color: 0xd35323 })
          )
        );
      }

      // Highlighted straight ray at angle θ
      const lPts: THREE.Vector3[] = [];
      for (let i = -30; i <= 30; i++) {
        const s = (i / 30) * 0.85;
        const x = s * Math.cos(curves.theta);
        const y = s * Math.sin(curves.theta);
        lPts.push(mathToThreeVec3(x, y, clampZ(preset.evalFn(x, y)) + 0.02));
      }
      dynamicGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(lPts),
          new THREE.LineBasicMaterial({ color: 0x96b898 })
        )
      );

      // Critical origin marker (0, 0, 0)
      const origin = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0xfbeaa4 })
      );
      dynamicGroup.add(origin);
    },
    [curves.theta, parabolaK, preset]
  );

  return (
    <section
      aria-label="General Sign-Change Method for Degenerate Extrema Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#FBEAA4] text-[#FBEAA4] bg-[var(--bg-canvas)]">
              LAB 3.1.8B • GENERAL METHOD WHEN D = rt − s² = 0
            </span>
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono border border-[#D35323] text-[#D35323] bg-[#D35323]/10 inline-flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              True Nature: {preset.trueNature}
            </span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
            Resolving Inconclusive Hessians via Δf = f(h, k) − f(0, 0) Sign Analysis
          </h3>
        </div>

        <button
          type="button"
          onClick={() => selectPreset(DEGENERATE_PRESETS[0])}
          className="px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-canvas)] inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Presets & Sliders */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 space-y-4 bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap gap-2">
          {DEGENERATE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPreset(p)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                p.id === presetId
                  ? "border-[#FBEAA4] bg-[#FBEAA4]/15 text-[var(--text-primary)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Parabolic Test Curve <strong className="text-[#D35323] font-mono">y = k·x²</strong>
              </span>
              <span className="font-tabular-mono text-[#D35323]">
                k = {parabolaK.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={-2.0}
              max={2.6}
              step={0.1}
              value={parabolaK}
              aria-label="Parabolic curvature k"
              onChange={(e) => setParabolaK(parseFloat(e.target.value))}
              className="w-full accent-[#D35323]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Straight Line Angle <strong className="text-[#96B898] font-mono">θ</strong>
              </span>
              <span className="font-tabular-mono text-[#96B898]">
                θ = {angleDeg}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={180}
              step={5}
              value={angleDeg}
              aria-label="Straight line slice angle"
              onChange={(e) => setAngleDeg(parseFloat(e.target.value))}
              className="w-full accent-[#96B898]"
            />
          </div>
        </div>
      </div>

      {/* Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
        <div className="lg:col-span-6 p-5">
          <ThreeOrbitViewport
            heightClassName="h-[310px]"
            cameraPosition={[2.0, 1.7, 2.0]}
            cameraTarget={[0, 0.05, 0]}
            titleBadge="Line Ray (Sage) vs Parabolic Probe y = kx² (Persimmon)"
            axesOptions={{
              gridExtent: 2.2,
              gridDivisions: 8,
              axisLength: 1.2,
            }}
            onBuildScene={buildScene}
            sceneDeps={[buildScene]}
          />
        </div>

        <div className="lg:col-span-6 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              Increment Δf(s) Along Straight Line (Sage) vs. Parabola (Persimmon)
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-0.95, 0.95]}
            yRange={[-0.25, 0.6]}
            width={440}
            height={275}
            xLabel="step s"
            yLabel="Δf"
            xColor="#8D9FCE"
            yColor="#D35323"
            ariaLabel="Delta f increment along line and parabola"
          >
            {({ toSvgX, toSvgY }) => {
              const lLine = curves.lineSlice
                .map(([sx, val]) => `${toSvgX(sx).toFixed(1)},${toSvgY(val).toFixed(1)}`)
                .join(" ");
              const pLine = curves.parabSlice
                .map(([sx, val]) => `${toSvgX(sx).toFixed(1)},${toSvgY(val).toFixed(1)}`)
                .join(" ");
              return (
                <>
                  <polyline
                    points={lLine}
                    fill="none"
                    stroke="#96B898"
                    strokeWidth={2.0}
                    strokeDasharray="5 3"
                  />
                  <polyline
                    points={pLine}
                    fill="none"
                    stroke="#D35323"
                    strokeWidth={2.4}
                  />
                  <circle
                    cx={toSvgX(0)}
                    cy={toSvgY(0)}
                    r={4}
                    fill="#FBEAA4"
                  />
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Diagnostic Footer */}
      <div className="border-t border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-elevated)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-tabular-mono">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[var(--text-muted)]">Min Δf along Straight Ray θ={angleDeg}°</div>
            <div className="mt-1 text-sm text-[#96B898]">
              {curves.lineMin.toFixed(4)}
            </div>
          </div>
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[var(--text-muted)]">Min Δf along y = {parabolaK.toFixed(1)}x²</div>
            <div
              className={`mt-1 text-sm font-semibold ${
                curves.parabMin < -1e-4 ? "text-[#B95869]" : "text-[#96B898]"
              }`}
            >
              {curves.parabMin.toFixed(4)}
            </div>
          </div>
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[var(--text-muted)]">Max Δf along y = {parabolaK.toFixed(1)}x²</div>
            <div className="mt-1 text-sm text-[#FBEAA4]">
              {curves.parabMax.toFixed(4)}
            </div>
          </div>
        </div>

        <div className="p-3 border border-[#FBEAA4]/40 bg-[var(--bg-canvas)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs font-serif text-[var(--text-secondary)]">
            {preset.explanation}
          </p>
          <div className="shrink-0 px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
            <KaTeXMath math={preset.analysisLatex} />
          </div>
        </div>
      </div>
    </section>
  );
}
