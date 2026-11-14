"use client";

import React, { useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { ArrowLeftRight, Sparkles, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  SvgCoordinatePlane2D,
  ThreeOrbitViewport,
  createParametricSurfaceMesh,
  betaReal,
  gammaReal,
  integrate1DGaussLegendre,
} from "@/components/visualizations/primitives";

interface BetaPreset {
  id: string;
  label: string;
  p: number;
  q: number;
  exactLatex: string;
  note: string;
}

const BETA_PRESETS: BetaPreset[] = [
  {
    id: "arcsine",
    label: "p = 0.5, q = 0.5 (Arcsine / π)",
    p: 0.5,
    q: 0.5,
    exactLatex: "\\mathrm{B}\\!\\left(\\tfrac{1}{2},\\tfrac{1}{2}\\right) = \\frac{\\Gamma(1/2)^2}{\\Gamma(1)} = \\pi",
    note: "In trig form, 2 sin⁰θ cos⁰θ = 2 integrated over [0, π/2] immediately equals π!",
  },
  {
    id: "asym-3-2",
    label: "p = 3, q = 2 (Skewed Polynomial)",
    p: 3.0,
    q: 2.0,
    exactLatex: "\\mathrm{B}(3, 2) = \\frac{2!\\,1!}{4!} = \\frac{1}{12} \\approx 0.08333",
    note: "Mode sits at t = (p - 1)/(p + q - 2) = 2/3. Swapping p ↔ q reflects the peak to t = 1/3 with identical area.",
  },
  {
    id: "wallis",
    label: "p = 2.5, q = 1.5 (Wallis Trig Integral)",
    p: 2.5,
    q: 1.5,
    exactLatex: "2\\int_0^{\\pi/2} \\sin^4\\theta\\cos^2\\theta\\,d\\theta = \\mathrm{B}\\!\\left(\\tfrac{5}{2},\\tfrac{3}{2}\\right) = \\frac{\\pi}{16}",
    note: "Even-power sine/cosine Wallis integrals collapse effortlessly using Γ(5/2)Γ(3/2)/Γ(4) = π/16.",
  },
  {
    id: "bell-2-2",
    label: "p = 2, q = 2 (Symmetric Bell)",
    p: 2.0,
    q: 2.0,
    exactLatex: "\\mathrm{B}(2, 2) = \\int_0^1 t(1-t)\\,dt = \\frac{1}{6} \\approx 0.16667",
    note: "With p = q = 2, both algebraic and trigonometric curves become perfectly symmetric around their midpoints.",
  },
];

export function BetaFunctionLab() {
  const [pParam, setPParam] = useState<number>(3.0);
  const [qParam, setQParam] = useState<number>(2.0);
  const [sliceTheta, setSliceTheta] = useState<number>(0.78);
  const [activePresetId, setActivePresetId] = useState<string>("asym-3-2");

  const applyPreset = (preset: BetaPreset) => {
    setPParam(preset.p);
    setQParam(preset.q);
    setActivePresetId(preset.id);
  };

  const swapPQ = () => {
    setPParam(qParam);
    setQParam(pParam);
    setActivePresetId("custom");
  };

  const resetDefaults = () => {
    setPParam(3.0);
    setQParam(2.0);
    setSliceTheta(0.78);
    setActivePresetId("asym-3-2");
  };

  const data = useMemo(() => {
    const gammaP = gammaReal(pParam);
    const gammaQ = gammaReal(qParam);
    const gammaPQ = gammaReal(pParam + qParam);
    const betaIdentity = betaReal(pParam, qParam);

    // Singularity-free numerical verification of ∫₀¹ t^{p-1}(1-t)^{q-1} dt
    // Split at 0.5 with u = t^p on [0, 0.5] and v = (1-t)^q on [0.5, 1]
    const leftUpper = Math.pow(0.5, pParam);
    const rightUpper = Math.pow(0.5, qParam);
    let betaNumeric = 0;
    const subSegs = 6;
    for (let s = 0; s < subSegs; s++) {
      const ua = (s / subSegs) * leftUpper;
      const ub = ((s + 1) / subSegs) * leftUpper;
      betaNumeric +=
        integrate1DGaussLegendre(
          (u) => Math.pow(1 - Math.pow(Math.max(1e-12, u), 1 / pParam), qParam - 1),
          ua,
          ub,
          12
        ) / pParam;

      const va = (s / subSegs) * rightUpper;
      const vb = ((s + 1) / subSegs) * rightUpper;
      betaNumeric +=
        integrate1DGaussLegendre(
          (v) => Math.pow(1 - Math.pow(Math.max(1e-12, v), 1 / qParam), pParam - 1),
          va,
          vb,
          12
        ) / qParam;
    }

    // Algebraic integrand points on (0, 1)
    const algPts: [number, number][] = [];
    let algRawMax = 0;
    const steps = 160;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const y = Math.pow(t, pParam - 1) * Math.pow(1 - t, qParam - 1);
      if (Number.isFinite(y)) {
        algRawMax = Math.max(algRawMax, y);
        algPts.push([t, y]);
      }
    }
    const algYCap = pParam < 1 || qParam < 1 ? 3.5 : Math.max(0.25, algRawMax * 1.2);
    const algPlotPts: [number, number][] = algPts.map(([t, y]) => [
      t,
      Math.min(algYCap * 1.15, y),
    ]);

    // Trigonometric integrand 2 sin^{2p-1}(θ) cos^{2q-1}(θ) on (0, π/2)
    const trigPts: [number, number][] = [];
    let trigRawMax = 0;
    const halfPi = Math.PI / 2;
    for (let i = 1; i < steps; i++) {
      const theta = (i / steps) * halfPi;
      const y =
        2 *
        Math.pow(Math.sin(theta), 2 * pParam - 1) *
        Math.pow(Math.cos(theta), 2 * qParam - 1);
      if (Number.isFinite(y)) {
        trigRawMax = Math.max(trigRawMax, y);
        trigPts.push([theta, y]);
      }
    }
    const trigYCap =
      pParam < 0.5 || qParam < 0.5 ? 4.0 : Math.max(0.6, trigRawMax * 1.2);
    const trigPlotPts: [number, number][] = trigPts.map(([th, y]) => [
      th,
      Math.min(trigYCap * 1.15, y),
    ]);

    // Mode of algebraic distribution when p > 1 and q > 1
    const hasInteriorMode = pParam > 1 && qParam > 1;
    const tMode = hasInteriorMode
      ? (pParam - 1) / (pParam + qParam - 2)
      : NaN;
    const thetaMode = hasInteriorMode
      ? Math.atan(Math.sqrt((2 * pParam - 1) / (2 * qParam - 1)))
      : Math.PI / 4;

    return {
      gammaP,
      gammaQ,
      gammaPQ,
      betaIdentity,
      betaNumeric,
      algPlotPts,
      algYCap,
      trigPlotPts,
      trigYCap,
      hasInteriorMode,
      tMode,
      thetaMode,
    };
  }, [pParam, qParam]);

  // Pre-compute normalization scale for clean 3D visualization height (~1.8 units tall)
  const surfacePeakEstimate = useMemo(() => {
    let peak = 1e-4;
    for (let i = 1; i <= 20; i++) {
      const r = 0.08 + (i / 20) * 2.0;
      for (let j = 1; j <= 18; j++) {
        const th = 0.04 + (j / 19) * (Math.PI / 2 - 0.08);
        const x = r * Math.cos(th);
        const y = r * Math.sin(th);
        const val =
          Math.pow(x, 2 * pParam - 1) *
          Math.pow(y, 2 * qParam - 1) *
          Math.exp(-(x * x + y * y));
        if (Number.isFinite(val)) {
          peak = Math.max(peak, val);
        }
      }
    }
    return peak;
  }, [pParam, qParam]);

  const buildPolarProofScene = useCallback(
    (dynamicGroup: THREE.Group) => {
      const zScale = 1.65 / Math.max(1e-4, surfacePeakEstimate);

      const evalPolarSurface = (
        r: number,
        theta: number
      ): [number, number, number] => {
        const x = Math.max(0.05, r * Math.cos(theta));
        const y = Math.max(0.05, r * Math.sin(theta));
        const raw =
          Math.pow(x, 2 * pParam - 1) *
          Math.pow(y, 2 * qParam - 1) *
          Math.exp(-(x * x + y * y));
        const z = Number.isFinite(raw) ? Math.min(2.1, raw * zScale) : 0;
        return [r * Math.cos(theta), r * Math.sin(theta), z];
      };

      const surfaceMesh = createParametricSurfaceMesh(
        evalPolarSurface,
        [0.06, 2.35],
        [0.04, Math.PI / 2 - 0.04],
        34,
        28,
        {
          color: 0x029091,
          opacity: 0.62,
          wireframeColor: 0xfbeaa4,
          wireframeOpacity: 0.2,
          showWireframe: true,
        }
      );
      dynamicGroup.add(surfaceMesh);

      // Highlighted radial slice ray θ = sliceTheta showing decoupled r^{2p+2q-1} e^{-r²} dr!
      const rayCurvePts: THREE.Vector3[] = [];
      const rayFloorPts: THREE.Vector3[] = [];
      const sliceFillVerts: number[] = [];
      const rSteps = 44;

      for (let i = 0; i <= rSteps; i++) {
        const r = 0.06 + (i / rSteps) * 2.29;
        const [mx, my, mz] = evalPolarSurface(r, sliceTheta);
        // mathToThreeVec3 convention: (mx, mz, -my)
        rayCurvePts.push(new THREE.Vector3(mx, mz + 0.015, -my));
        rayFloorPts.push(new THREE.Vector3(mx, 0.008, -my));
        if (i < rSteps) {
          const rNext = 0.06 + ((i + 1) / rSteps) * 2.29;
          const [nx, ny, nz] = evalPolarSurface(rNext, sliceTheta);
          // Two triangles forming vertical curtain under θ = sliceTheta
          sliceFillVerts.push(
            mx, 0, -my,
            nx, 0, -ny,
            nx, nz, -ny,
            mx, 0, -my,
            nx, nz, -ny,
            mx, mz, -my
          );
        }
      }

      const curtainGeom = new THREE.BufferGeometry();
      curtainGeom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(sliceFillVerts, 3)
      );
      curtainGeom.computeVertexNormals();
      dynamicGroup.add(
        new THREE.Mesh(
          curtainGeom,
          new THREE.MeshBasicMaterial({
            color: 0xd35323,
            transparent: true,
            opacity: 0.42,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        )
      );

      dynamicGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(rayCurvePts),
          new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
        )
      );
      dynamicGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(rayFloorPts),
          new THREE.LineBasicMaterial({ color: 0xd35323 })
        )
      );
    },
    [pParam, qParam, sliceTheta, surfacePeakEstimate]
  );

  const activePreset = BETA_PRESETS.find((pr) => pr.id === activePresetId);

  return (
    <section
      aria-label="Beta Function and Gamma-Beta Polar Bridge Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-x)] text-[var(--math-ink-x)] bg-[var(--bg-canvas)]">
              LAB 3.2.6B • THE BETA FUNCTION &amp; Γ(p)Γ(q) BRIDGE
            </span>
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono border border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[#96B898]/10">
              Symmetry: B(p, q) = B(q, p)
            </span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
            Algebraic Form, Wallis Trigonometric Transform &amp; 3D Polar Proof
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={swapPQ}
            className="px-3 py-1.5 text-xs font-sans border border-[var(--math-ink-x)] text-[var(--math-ink-x)] hover:bg-[#8D9FCE]/15 bg-[var(--bg-canvas)] inline-flex items-center gap-1.5"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Swap p ↔ q
          </button>
          <button
            type="button"
            onClick={resetDefaults}
            className="px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-canvas)] inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Presets & Sliders */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 space-y-4 bg-[var(--bg-canvas)]">
        <div className="flex flex-wrap gap-2">
          {BETA_PRESETS.map((preset) => {
            const selected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                  selected
                    ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/15 text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                First Parameter <strong className="text-[var(--math-ink-x)] font-mono">p</strong>
              </span>
              <span className="font-tabular-mono text-[var(--math-ink-x)]">
                p = {pParam.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.4}
              max={5.0}
              step={0.1}
              value={pParam}
              aria-label="Beta parameter p"
              onChange={(e) => {
                setPParam(parseFloat(e.target.value));
                setActivePresetId("custom");
              }}
              className="w-full accent-[#8D9FCE]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                Second Parameter <strong className="text-[var(--math-ink-y)] font-mono">q</strong>
              </span>
              <span className="font-tabular-mono text-[var(--math-ink-y)]">
                q = {qParam.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.4}
              max={5.0}
              step={0.1}
              value={qParam}
              aria-label="Beta parameter q"
              onChange={(e) => {
                setQParam(parseFloat(e.target.value));
                setActivePresetId("custom");
              }}
              className="w-full accent-[#96B898]"
            />
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">
                3D Polar Ray Angle <strong className="text-[var(--math-ink-sweep)] font-mono">θ₀</strong>
              </span>
              <span className="font-tabular-mono text-[var(--math-ink-sweep)]">
                θ₀ = {((sliceTheta * 180) / Math.PI).toFixed(0)}°
              </span>
            </div>
            <input
              type="range"
              min={0.12}
              max={1.45}
              step={0.03}
              value={sliceTheta}
              aria-label="Polar radial slice angle"
              onChange={(e) => setSliceTheta(parseFloat(e.target.value))}
              className="w-full accent-[#D35323]"
            />
          </div>
        </div>
      </div>

      {/* Dual 2D Forms: Algebraic [0,1] and Trigonometric [0, π/2] */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              1. Algebraic Form:{" "}
              <KaTeXMath math="\int_0^1 t^{p-1}(1-t)^{q-1}\,dt" />
            </span>
            <span className="text-[11px] font-tabular-mono text-[var(--math-ink-x)]">
              t ∈ [0, 1]
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-0.08, 1.08]}
            yRange={[-0.08, data.algYCap]}
            width={480}
            height={270}
            xLabel="t"
            yLabel="t^(p-1)(1-t)^(q-1)"
            xColor="#8D9FCE"
            yColor="#FBEAA4"
            ariaLabel="Algebraic Beta integrand plot"
          >
            {({ toSvgX, toSvgY }) => {
              const polyStr =
                data.algPlotPts.length >= 2
                  ? [
                      `${toSvgX(data.algPlotPts[0][0]).toFixed(1)},${toSvgY(0).toFixed(1)}`,
                      ...data.algPlotPts.map(
                        ([px, py]) =>
                          `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`
                      ),
                      `${toSvgX(
                        data.algPlotPts[data.algPlotPts.length - 1][0]
                      ).toFixed(1)},${toSvgY(0).toFixed(1)}`,
                    ].join(" ")
                  : "";
              const lineStr = data.algPlotPts
                .map(
                  ([px, py]) =>
                    `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`
                )
                .join(" ");

              return (
                <>
                  {polyStr && (
                    <polygon points={polyStr} fill="#8D9FCE" fillOpacity={0.25} />
                  )}
                  {lineStr && (
                    <polyline
                      points={lineStr}
                      fill="none"
                      stroke="#FBEAA4"
                      strokeWidth={2.2}
                    />
                  )}
                  {data.hasInteriorMode && Number.isFinite(data.tMode) && (
                    <line
                      x1={toSvgX(data.tMode)}
                      y1={toSvgY(0)}
                      x2={toSvgX(data.tMode)}
                      y2={toSvgY(data.algYCap * 0.85)}
                      stroke="#96B898"
                      strokeDasharray="4 3"
                      strokeWidth={1.2}
                    />
                  )}
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              2. Trigonometric Form (
              <KaTeXMath math="t = \sin^2\theta" />):{" "}
              <KaTeXMath math="2\int_0^{\pi/2}\sin^{2p-1}\theta\cos^{2q-1}\theta\,d\theta" />
            </span>
            <span className="text-[11px] font-tabular-mono text-[var(--math-ink-y)]">
              θ ∈ [0, π/2]
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-0.1, Math.PI / 2 + 0.1]}
            yRange={[-0.08, data.trigYCap]}
            width={480}
            height={270}
            xLabel="θ"
            yLabel="2sin^(2p-1)cos^(2q-1)"
            xColor="#96B898"
            yColor="#D35323"
            ariaLabel="Trigonometric Beta integrand plot"
          >
            {({ toSvgX, toSvgY }) => {
              const polyStr =
                data.trigPlotPts.length >= 2
                  ? [
                      `${toSvgX(data.trigPlotPts[0][0]).toFixed(1)},${toSvgY(0).toFixed(1)}`,
                      ...data.trigPlotPts.map(
                        ([px, py]) =>
                          `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`
                      ),
                      `${toSvgX(
                        data.trigPlotPts[data.trigPlotPts.length - 1][0]
                      ).toFixed(1)},${toSvgY(0).toFixed(1)}`,
                    ].join(" ")
                  : "";
              const lineStr = data.trigPlotPts
                .map(
                  ([px, py]) =>
                    `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`
                )
                .join(" ");

              return (
                <>
                  {polyStr && (
                    <polygon points={polyStr} fill="#96B898" fillOpacity={0.25} />
                  )}
                  {lineStr && (
                    <polyline
                      points={lineStr}
                      fill="none"
                      stroke="#96B898"
                      strokeWidth={2.2}
                    />
                  )}
                  {/* Current θ₀ slice marker */}
                  <line
                    x1={toSvgX(sliceTheta)}
                    y1={toSvgY(0)}
                    x2={toSvgX(sliceTheta)}
                    y2={toSvgY(data.trigYCap * 0.9)}
                    stroke="#D35323"
                    strokeDasharray="4 3"
                    strokeWidth={1.6}
                  />
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* 3D Polar Bridge Viewport */}
      <div className="border-t border-[var(--border-subtle)] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h4 className="text-sm font-sans font-semibold text-[var(--text-primary)]">
              3. Geometric 3D Proof of{" "}
              <KaTeXMath math="\Gamma(p)\Gamma(q) = \Gamma(p+q)\mathrm{B}(p,q)" />{" "}
              via Polar Coordinates (Chapter 3.2.3)
            </h4>
            <p className="text-xs font-serif text-[var(--text-secondary)]">
              Writing{" "}
              <KaTeXMath math="\Gamma(p)\Gamma(q) = 4\int_0^\infty\int_0^\infty x^{2p-1}y^{2q-1}e^{-(x^2+y^2)}\,dx\,dy" />{" "}
              and converting to polar coordinates splits the 2D volume cleanly into a radial{" "}
              <KaTeXMath math="\Gamma(p+q)" /> curtain (orange) multiplied by an angular{" "}
              <KaTeXMath math="\mathrm{B}(p,q)" /> weight!
            </p>
          </div>
        </div>

        <ThreeOrbitViewport
          heightClassName="h-[340px]"
          cameraPosition={[2.9, 2.35, 2.9]}
          cameraTarget={[0.6, 0.4, -0.6]}
          titleBadge="First-Quadrant Density z = x^(2p-1) y^(2q-1) e^(-(x²+y²))"
          axesOptions={{
            gridExtent: 5,
            gridDivisions: 10,
            axisLength: 2.6,
          }}
          onBuildScene={buildPolarProofScene}
          sceneDeps={[buildPolarProofScene]}
          footerSlot={
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-tabular-mono">
              <span className="text-[var(--math-ink-z)]">
                4·Volume = Γ(p)Γ(q) = {(data.gammaP * data.gammaQ).toFixed(4)}
              </span>
              <span className="text-[var(--math-ink-diff)]">
                Γ(p+q)·B(p,q) = {data.gammaPQ.toFixed(3)} × {data.betaIdentity.toFixed(4)} ={" "}
                {(data.gammaPQ * data.betaIdentity).toFixed(4)}
              </span>
            </div>
          }
        />

        {/* Identity Verification Readout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans uppercase tracking-wider text-[var(--text-muted)]">
              Gauss-Legendre Integral B(p, q)
            </div>
            <div className="mt-1 text-base font-tabular-mono text-[var(--math-ink-x)]">
              {data.betaNumeric.toFixed(6)}
            </div>
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans uppercase tracking-wider text-[var(--text-muted)]">
              Γ(p)·Γ(q) / Γ(p + q)
            </div>
            <div className="mt-1 text-base font-tabular-mono text-[var(--math-ink-y)]">
              {data.betaIdentity.toFixed(6)}
            </div>
          </div>

          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="text-[11px] font-sans uppercase tracking-wider text-[var(--text-muted)]">
              Numerical Agreement |Δ|
            </div>
            <div className="mt-1 text-base font-tabular-mono text-[var(--math-ink-diff)]">
              {Math.abs(data.betaNumeric - data.betaIdentity).toExponential(2)}
            </div>
          </div>
        </div>

        {activePreset && (
          <div className="p-3 border border-[var(--math-ink-x)]/40 bg-[var(--bg-canvas)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="text-xs font-sans font-semibold text-[var(--math-ink-x)] inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {activePreset.label}
              </div>
              <p className="text-xs font-serif text-[var(--text-secondary)]">
                {activePreset.note}
              </p>
            </div>
            <div className="shrink-0 px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              <KaTeXMath math={activePreset.exactLatex} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
