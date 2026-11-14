"use client";

import React, { useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { ShieldCheck, AlertOctagon, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  SvgCoordinatePlane2D,
  ThreeOrbitViewport,
  createParametricSurfaceMesh,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

interface DiffPreset {
  id: string;
  title: string;
  differentiable: boolean;
  partialsExist: boolean;
  continuous: boolean;
  fx0: number;
  fy0: number;
  f0: number;
  evalFn: (x: number, y: number) => number;
  formulaLatex: string;
  verdictBadge: string;
  explanation: string;
}

const DIFF_PRESETS: DiffPreset[] = [
  {
    id: "smooth-paraboloid",
    title: "1. Differentiable: f(x,y) = 0.6(x² + y²) + 0.3x",
    differentiable: true,
    partialsExist: true,
    continuous: true,
    f0: 0,
    fx0: 0.3,
    fy0: 0,
    evalFn: (x, y) => 0.6 * (x * x + y * y) + 0.3 * x,
    formulaLatex:
      "\\frac{|E(h,k)|}{r} = 0.6\\,r \\xrightarrow{r\\to 0} 0 \\quad (\\text{Differentiable})",
    verdictBadge: "Totally Differentiable (C¹ Smooth)",
    explanation:
      "Notice the normalized error ratio Q(r, θ) = |f - L|/r shrinks linearly toward 0 across EVERY direction θ as radius r → 0.",
  },
  {
    id: "sqrt-abs-xy",
    title: "2. Partials Exist, NOT Differentiable: √|xy|",
    differentiable: false,
    partialsExist: true,
    continuous: true,
    f0: 0,
    fx0: 0,
    fy0: 0,
    evalFn: (x, y) => Math.sqrt(Math.abs(x * y)),
    formulaLatex:
      "f_x(0,0)=f_y(0,0)=0, \\; \\frac{f(h,h)-0}{\\sqrt{2}|h|} = \\frac{1}{\\sqrt{2}} \\not\\to 0",
    verdictBadge: "Partials Exist, FAILS Total Differentiability",
    explanation:
      "Along the x and y axes f ≡ 0, so f_x(0,0) = f_y(0,0) = 0 (candidate plane z = 0). Yet diagonal folds rise with slope 1/√2 regardless of how small r gets!",
  },
  {
    id: "linear-over-r",
    title: "3. Continuous Crease: xy / √(x² + y²)",
    differentiable: false,
    partialsExist: true,
    continuous: true,
    f0: 0,
    fx0: 0,
    fy0: 0,
    evalFn: (x, y) => {
      const r = Math.hypot(x, y);
      return r < 1e-6 ? 0 : (x * y) / r;
    },
    formulaLatex:
      "f(r\\cos\\theta, r\\sin\\theta) = \\tfrac{1}{2}r\\sin(2\\theta) \\implies Q(r,\\theta) = |\\tfrac{1}{2}\\sin(2\\theta)|",
    verdictBadge: "Continuous & Partials = 0, Non-Differentiable",
    explanation:
      "Because f behaves like a wavy cone scaling linearly with r, shrinking radius r never flattens the normalized error Q(r, 45°) = 0.5.",
  },
  {
    id: "circular-cone",
    title: "4. Sharp Cone: 0.9√(x² + y²)",
    differentiable: false,
    partialsExist: false,
    continuous: true,
    f0: 0,
    fx0: 0,
    fy0: 0,
    evalFn: (x, y) => 0.9 * Math.hypot(x, y),
    formulaLatex:
      "\\lim_{h\\to 0}\\frac{0.9|h|}{h} \\text{ does not exist } \\implies \\text{No } f_x, f_y \\text{ at }(0,0)",
    verdictBadge: "Continuous, Corner Cusp (Partials Fail)",
    explanation:
      "At a sharp vertex, left and right partial limits disagree (+0.9 vs -0.9), so no tangent plane exists at the origin.",
  },
];

export function DifferentiabilityErrorConeLab() {
  const [presetId, setPresetId] = useState<string>(DIFF_PRESETS[1].id);
  const [radiusR, setRadiusR] = useState<number>(0.55);
  const [angleDeg, setAngleDeg] = useState<number>(45);

  const preset = useMemo(
    () => DIFF_PRESETS.find((p) => p.id === presetId) ?? DIFF_PRESETS[0],
    [presetId]
  );

  const theta = (angleDeg * Math.PI) / 180;

  const evalL = useCallback(
    (h: number, k: number) => preset.f0 + preset.fx0 * h + preset.fy0 * k,
    [preset]
  );

  const stats = useMemo(() => {
    const h = radiusR * Math.cos(theta);
    const k = radiusR * Math.sin(theta);
    const fVal = preset.evalFn(h, k);
    const lVal = evalL(h, k);
    const absErr = Math.abs(fVal - lVal);
    const normErr = absErr / Math.max(1e-5, radiusR);

    // Curve of Q(r, theta) vs radius r in [0.02, 1.0] along active direction theta
    const radialCurve: [number, number][] = [];
    for (let i = 1; i <= 70; i++) {
      const r = (i / 70) * 1.0;
      const rh = r * Math.cos(theta);
      const rk = r * Math.sin(theta);
      const q = Math.abs(preset.evalFn(rh, rk) - evalL(rh, rk)) / r;
      radialCurve.push([r, Math.min(1.2, q)]);
    }

    // Polar angular profile Q(r, phi) across all directions phi in [0, 2pi]
    const angularMax = (() => {
      let m = 0;
      for (let i = 0; i < 72; i++) {
        const phi = (i / 72) * Math.PI * 2;
        const ph = radiusR * Math.cos(phi);
        const pk = radiusR * Math.sin(phi);
        m = Math.max(m, Math.abs(preset.evalFn(ph, pk) - evalL(ph, pk)) / radiusR);
      }
      return m;
    })();

    return {
      h,
      k,
      fVal,
      lVal,
      absErr,
      normErr,
      radialCurve,
      angularMax,
    };
  }, [evalL, preset, radiusR, theta]);

  const buildScene = useCallback(
    (dynamicGroup: THREE.Group) => {
      const surface = createParametricSurfaceMesh(
        (u, v) => [u, v, preset.evalFn(u, v)],
        [-1.0, 1.0],
        [-1.0, 1.0],
        34,
        34,
        {
          color: 0x029091,
          opacity: 0.62,
          wireframeColor: 0xfbeaa4,
          wireframeOpacity: 0.16,
          showWireframe: true,
        }
      );
      dynamicGroup.add(surface);

      // Candidate Tangent Plane L(h,k)
      const tangentPlane = createParametricSurfaceMesh(
        (u, v) => [u, v, evalL(u, v)],
        [-1.0, 1.0],
        [-1.0, 1.0],
        10,
        10,
        {
          color: 0x8d9fce,
          opacity: 0.25,
          wireframeColor: 0x8d9fce,
          wireframeOpacity: 0.48,
          showWireframe: true,
        }
      );
      dynamicGroup.add(tangentPlane);

      // Radius r circle ring on xy plane + elevated error gap segment at (h, k)
      const ringPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        ringPts.push(
          mathToThreeVec3(radiusR * Math.cos(a), radiusR * Math.sin(a), 0.01)
        );
      }
      dynamicGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(ringPts),
          new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
        )
      );

      // Vertical error gap line between L(h, k) and f(h, k)
      const gapPts = [
        mathToThreeVec3(stats.h, stats.k, stats.lVal),
        mathToThreeVec3(stats.h, stats.k, stats.fVal),
      ];
      dynamicGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(gapPts),
          new THREE.LineBasicMaterial({ color: 0xd35323 })
        )
      );

      const dotF = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xd35323 })
      );
      dotF.position.copy(mathToThreeVec3(stats.h, stats.k, stats.fVal));
      dynamicGroup.add(dotF);

      const dotL = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x8d9fce })
      );
      dotL.position.copy(mathToThreeVec3(stats.h, stats.k, stats.lVal));
      dynamicGroup.add(dotL);
    },
    [evalL, preset, radiusR, stats.fVal, stats.h, stats.k, stats.lVal]
  );

  return (
    <section
      aria-label="Total Differentiability and Normalized Linearization Error Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[var(--bg-canvas)]">
              LAB 3.1.5B • TOTAL DIFFERENTIABILITY &amp; TANGENT GAP
            </span>
            <span
              className={`px-2 py-0.5 text-[11px] font-tabular-mono border inline-flex items-center gap-1 ${
                preset.differentiable
                  ? "border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[#96B898]/10"
                  : "border-[var(--math-ink-upper)] text-[var(--math-ink-upper)] bg-[#B95869]/10"
              }`}
            >
              {preset.differentiable ? (
                <ShieldCheck className="w-3 h-3" />
              ) : (
                <AlertOctagon className="w-3 h-3" />
              )}
              {preset.verdictBadge}
            </span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
            Why Partial Derivatives Alone Do Not Guarantee a True Tangent Plane
          </h3>
        </div>

        <button
          type="button"
          onClick={() => {
            setPresetId(DIFF_PRESETS[1].id);
            setRadiusR(0.55);
            setAngleDeg(45);
          }}
          className="px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-canvas)] inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Presets & Sliders */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 space-y-4 bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap gap-2">
          {DIFF_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPresetId(p.id)}
              className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                p.id === presetId
                  ? "border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-[var(--text-primary)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Step Radius <strong className="text-[var(--math-ink-diff)] font-mono">r = √(h² + k²)</strong>
              </span>
              <span className="font-tabular-mono text-[var(--math-ink-diff)]">
                r = {radiusR.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.04}
              max={0.95}
              step={0.02}
              value={radiusR}
              aria-label="Step radius r"
              onChange={(e) => setRadiusR(parseFloat(e.target.value))}
              className="w-full accent-[#FBEAA4]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Approach Heading <strong className="text-[var(--math-ink-sweep)] font-mono">θ</strong> (try 0° vs 45°)
              </span>
              <span className="font-tabular-mono text-[var(--math-ink-sweep)]">
                θ = {angleDeg}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={angleDeg}
              aria-label="Approach heading angle"
              onChange={(e) => setAngleDeg(parseFloat(e.target.value))}
              className="w-full accent-[#D35323]"
            />
          </div>
        </div>
      </div>

      {/* Viewports: 3D Surface vs Plane | 2D Normalized Error Curve Q(r) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
        <div className="lg:col-span-7 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              1. 3D Surface <KaTeXMath math="f(h,k)" /> vs. Candidate Tangent Plane{" "}
              <KaTeXMath math="L(h,k)" />
            </span>
            <span className="text-[11px] font-tabular-mono text-[var(--math-ink-sweep)]">
              |E(h,k)| = {stats.absErr.toFixed(4)}
            </span>
          </div>

          <ThreeOrbitViewport
            heightClassName="h-[310px]"
            cameraPosition={[2.2, 1.9, 2.2]}
            cameraTarget={[0, 0.15, 0]}
            titleBadge="Surface (Teal) vs Plane (Periwinkle)"
            axesOptions={{
              gridExtent: 2.2,
              gridDivisions: 8,
              axisLength: 1.25,
            }}
            onBuildScene={buildScene}
            sceneDeps={[buildScene]}
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-x)]">
                  L(h,k) = {stats.lVal.toFixed(4)}
                </span>
                <span className="text-[var(--math-ink-sweep)]">
                  f(h,k) = {stats.fVal.toFixed(4)}
                </span>
              </div>
            }
          />
        </div>

        <div className="lg:col-span-5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              2. Normalized Error Ratio{" "}
              <KaTeXMath math="Q(r,\theta) = \frac{|f - L|}{r}" />
            </span>
            <span className="text-[11px] font-tabular-mono text-[var(--math-ink-sweep)]">
              Q = {stats.normErr.toFixed(4)}
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-0.05, 1.05]}
            yRange={[-0.08, 1.15]}
            width={400}
            height={310}
            xLabel="r"
            yLabel="|f-L|/r"
            xColor="#FBEAA4"
            yColor="#D35323"
            ariaLabel="Normalized differentiability error ratio versus radius r"
          >
            {({ toSvgX, toSvgY }) => {
              const pts = stats.radialCurve
                .map(
                  ([rx, qy]) =>
                    `${toSvgX(rx).toFixed(1)},${toSvgY(qy).toFixed(1)}`
                )
                .join(" ");
              return (
                <>
                  {/* Zero target line */}
                  <line
                    x1={toSvgX(0)}
                    y1={toSvgY(0)}
                    x2={toSvgX(1)}
                    y2={toSvgY(0)}
                    stroke="#96B898"
                    strokeDasharray="4 3"
                    strokeWidth={1.2}
                  />
                  {pts && (
                    <polyline
                      points={pts}
                      fill="none"
                      stroke={preset.differentiable ? "#96B898" : "#B95869"}
                      strokeWidth={2.3}
                    />
                  )}
                  <circle
                    cx={toSvgX(radiusR)}
                    cy={toSvgY(Math.min(1.15, stats.normErr))}
                    r={5}
                    fill="#D35323"
                  />
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Diagnostic Telemetry Footer */}
      <div className="border-t border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-elevated)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans text-[var(--text-muted)]">
              Continuity &amp; Partial Existence
            </div>
            <div className="mt-1 text-xs font-tabular-mono text-[var(--text-primary)]">
              Continuous: {preset.continuous ? "Yes" : "No"} • Partials Exist:{" "}
              {preset.partialsExist ? "Yes" : "No"}
            </div>
          </div>
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans text-[var(--text-muted)]">
              Normalized Error at θ = {angleDeg}°
            </div>
            <div className="mt-1 text-base font-tabular-mono text-[var(--math-ink-sweep)]">
              |E| / r = {stats.normErr.toFixed(4)}
            </div>
          </div>
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans text-[var(--text-muted)]">
              Worst-Case All Directions max_θ Q(r, θ)
            </div>
            <div
              className={`mt-1 text-base font-tabular-mono ${
                preset.differentiable ? "text-[var(--math-ink-y)]" : "text-[var(--math-ink-upper)]"
              }`}
            >
              {stats.angularMax.toFixed(4)}{" "}
              {preset.differentiable ? "→ 0" : "≠ 0"}
            </div>
          </div>
        </div>

        <div className="p-3 border border-[var(--math-ink-sweep)]/40 bg-[var(--bg-canvas)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs font-serif text-[var(--text-secondary)]">
            {preset.explanation}
          </p>
          <div className="shrink-0 px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
            <KaTeXMath math={preset.formulaLatex} />
          </div>
        </div>
      </div>
    </section>
  );
}
