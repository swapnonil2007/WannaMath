"use client";

import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  mathToThreeVec3,
  createParametricSurfaceMesh,
  createVectorArrow3D,
  integrate1DGaussLegendre,
  integrate2DIterated,
} from "@/components/visualizations/primitives";

type CapShape = "paraboloid" | "hemisphere" | "disk" | "saddle";

interface StokesPreset {
  id: string;
  label: string;
  pExpr: string;
  qExpr: string;
  rExpr: string;
  cap: CapShape;
  height: number;
  radius: number;
  isSingularity?: boolean;
}

const STOKES_PRESETS: StokesPreset[] = [
  {
    id: "vortex",
    label: "Solid-Body Vortex",
    pExpr: "-y",
    qExpr: "x",
    rExpr: "0",
    cap: "paraboloid",
    height: 1.0,
    radius: 1.2,
  },
  {
    id: "tilted-shear",
    label: "3D Tilted Shear",
    pExpr: "-y + 0.6 * z",
    qExpr: "x - 0.4 * z",
    rExpr: "0.5 * x + 0.5 * y",
    cap: "saddle",
    height: 0.9,
    radius: 1.25,
  },
  {
    id: "conservative",
    label: "Irrotational (∇×F = 0)",
    pExpr: "2 * x",
    qExpr: "2 * y",
    rExpr: "2 * z",
    cap: "hemisphere",
    height: 1.1,
    radius: 1.2,
  },
  {
    id: "punctured-vortex",
    label: "Singularity Trap (1/r²)",
    pExpr: "-y / (x^2 + y^2)",
    qExpr: "x / (x^2 + y^2)",
    rExpr: "0",
    cap: "paraboloid",
    height: 1.0,
    radius: 1.2,
    isSingularity: true,
  },
];

const CAP_OPTIONS: { id: CapShape; label: string }[] = [
  { id: "paraboloid", label: "Paraboloid Dome" },
  { id: "hemisphere", label: "Ellipsoid Cap" },
  { id: "disk", label: "Flat Disk (z = 0)" },
  { id: "saddle", label: "Undulating Saddle Cap" },
];

export function StokesTheoremLab() {
  const [activePresetId, setActivePresetId] = useState<string>("vortex");
  const [capShape, setCapShape] = useState<CapShape>("paraboloid");
  const [pExpr, setPExpr] = useState<string>("-y");
  const [qExpr, setQExpr] = useState<string>("x");
  const [rExpr, setRExpr] = useState<string>("0");
  const [domeHeight, setDomeHeight] = useState<number>(1.0);
  const [rimRadius, setRimRadius] = useState<number>(1.2);
  const [showNormals, setShowNormals] = useState<boolean>(true);
  const [showCurl, setShowCurl] = useState<boolean>(true);

  const compiledP = useMemo(
    () => compileMathExpression(pExpr, ["x", "y", "z"]),
    [pExpr]
  );
  const compiledQ = useMemo(
    () => compileMathExpression(qExpr, ["x", "y", "z"]),
    [qExpr]
  );
  const compiledR = useMemo(
    () => compileMathExpression(rExpr, ["x", "y", "z"]),
    [rExpr]
  );

  const handleApplyPreset = (preset: StokesPreset) => {
    setActivePresetId(preset.id);
    setPExpr(preset.pExpr);
    setQExpr(preset.qExpr);
    setRExpr(preset.rExpr);
    setCapShape(preset.cap);
    setDomeHeight(preset.height);
    setRimRadius(preset.radius);
  };

  // Helper returning point + oriented upward surface vector dS weight (per du dv)
  const capGeometry = useMemo(() => {
    const H = domeHeight;
    const R = rimRadius;

    const evalCap = (
      uParam: number,
      theta: number
    ): {
      pos: [number, number, number];
      dS: [number, number, number];
      unitN: [number, number, number];
    } => {
      const ct = Math.cos(theta);
      const st = Math.sin(theta);

      if (capShape === "hemisphere") {
        // uParam = psi in [0, pi/2]: r = R sin(psi), z = H cos(psi)
        const sp = Math.sin(uParam);
        const cp = Math.cos(uParam);
        const r = R * sp;
        const pos: [number, number, number] = [r * ct, r * st, H * cp];
        // r_psi x r_theta = <H R sin^2(psi) cos(t), H R sin^2(psi) sin(t), R^2 sin(psi) cos(psi)>
        const dSx = H * R * sp * sp * ct;
        const dSy = H * R * sp * sp * st;
        const dSz = R * R * sp * cp;
        const mag = Math.hypot(dSx, dSy, dSz) || 1;
        return {
          pos,
          dS: [dSx, dSy, dSz],
          unitN: [dSx / mag, dSy / mag, dSz / mag],
        };
      }

      // uParam = r in [0, R]
      const r = uParam;
      const u = r / R;
      let z = 0;
      let zr = 0;
      let zt = 0;

      if (capShape === "paraboloid") {
        z = H * (1 - u * u);
        zr = (-2 * H * r) / (R * R);
      } else if (capShape === "saddle") {
        const c2 = Math.cos(2 * theta);
        const s2 = Math.sin(2 * theta);
        z = 3.2 * H * u * u * (1 - u * u) * c2;
        zr = ((3.2 * H) / R) * (2 * u - 4 * u * u * u) * c2;
        zt = -6.4 * H * u * u * (1 - u * u) * s2;
      }

      const pos: [number, number, number] = [r * ct, r * st, z];
      // r_r x r_theta = <sin(t) z_t - r cos(t) z_r, -cos(t) z_t - r sin(t) z_r, r>
      const dSx = st * zt - r * ct * zr;
      const dSy = -ct * zt - r * st * zr;
      const dSz = r;
      const mag = Math.hypot(dSx, dSy, dSz) || 1;
      return {
        pos,
        dS: [dSx, dSy, dSz],
        unitN: [dSx / mag, dSy / mag, dSz / mag],
      };
    };

    const uDomain: [number, number] =
      capShape === "hemisphere" ? [0, Math.PI / 2] : [0, R];

    return { evalCap, uDomain };
  }, [capShape, domeHeight, rimRadius]);

  const evalCurl = useMemo(() => {
    const h = 1e-4;
    return (x: number, y: number, z: number): [number, number, number] => {
      const safe = (fn: (pt: { x: number; y: number; z: number }) => number, pt: { x: number; y: number; z: number }) => {
        const v = fn(pt);
        return Number.isFinite(v) ? v : 0;
      };
      const dRdy =
        (safe(compiledR.evaluate, { x, y: y + h, z }) -
          safe(compiledR.evaluate, { x, y: y - h, z })) /
        (2 * h);
      const dQdz =
        (safe(compiledQ.evaluate, { x, y, z: z + h }) -
          safe(compiledQ.evaluate, { x, y, z: z - h }) ) /
        (2 * h);
      const dPdz =
        (safe(compiledP.evaluate, { x, y, z: z + h }) -
          safe(compiledP.evaluate, { x, y, z: z - h })) /
        (2 * h);
      const dRdx =
        (safe(compiledR.evaluate, { x: x + h, y, z }) -
          safe(compiledR.evaluate, { x: x - h, y, z })) /
        (2 * h);
      const dQdx =
        (safe(compiledQ.evaluate, { x: x + h, y, z }) -
          safe(compiledQ.evaluate, { x: x - h, y, z })) /
        (2 * h);
      const dPdy =
        (safe(compiledP.evaluate, { x, y: y + h, z }) -
          safe(compiledP.evaluate, { x, y: y - h, z })) /
        (2 * h);
      return [dRdy - dQdz, dPdz - dRdx, dQdx - dPdy];
    };
  }, [compiledP, compiledQ, compiledR]);

  const stokesStats = useMemo(() => {
    // 1. Line Integral around CCW rim C: r(t) = <R cos t, R sin t, 0>
    const rimCirculation = integrate1DGaussLegendre(
      (t) => {
        const x = rimRadius * Math.cos(t);
        const y = rimRadius * Math.sin(t);
        const dx = -rimRadius * Math.sin(t);
        const dy = rimRadius * Math.cos(t);
        const p = compiledP.evaluate({ x, y, z: 0 });
        const q = compiledQ.evaluate({ x, y, z: 0 });
        const val = p * dx + q * dy;
        return Number.isFinite(val) ? val : 0;
      },
      0,
      2 * Math.PI,
      32
    );

    // 2. Surface Curl Flux over spanning cap S
    const surfaceCurlFlux = integrate2DIterated(
      (uParam, theta) => {
        const { pos, dS } = capGeometry.evalCap(uParam, theta);
        const [cx, cy, cz] = evalCurl(pos[0], pos[1], pos[2]);
        const val = cx * dS[0] + cy * dS[1] + cz * dS[2];
        return Number.isFinite(val) ? val : 0;
      },
      capGeometry.uDomain[0],
      capGeometry.uDomain[1],
      () => 0,
      () => 2 * Math.PI,
      20,
      28
    );

    // Check z-axis singularity piercing cap S
    const pOrigin = compiledP.evaluate({ x: 0, y: 0, z: 0.25 });
    const qOrigin = compiledQ.evaluate({ x: 0, y: 0, z: 0.25 });
    const nearP = compiledP.evaluate({ x: 1e-4, y: 1e-4, z: 0.25 });
    const nearQ = compiledQ.evaluate({ x: 1e-4, y: 1e-4, z: 0.25 });
    const blowsUp =
      !Number.isFinite(pOrigin) ||
      !Number.isFinite(qOrigin) ||
      Math.hypot(nearP, nearQ) > 500;

    const discrepancy = Math.abs(rimCirculation - surfaceCurlFlux);
    const hasSingularity =
      activePresetId === "punctured-vortex" || blowsUp || discrepancy > 0.2;

    return {
      rimCirculation,
      surfaceCurlFlux,
      discrepancy,
      hasSingularity,
    };
  }, [
    compiledP,
    compiledQ,
    rimRadius,
    capGeometry,
    evalCurl,
    activePresetId,
  ]);

  return (
    <section
      aria-label="Stokes' Theorem Interactive Surface Invariance Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[var(--bg-canvas)] inline-block">
            LAB 3.3.7A • STOKES&apos; THEOREM &amp; SURFACE INVARIANCE
          </span>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Boundary Circulation vs. Spanning-Cap Curl Flux:{" "}
            <KaTeXMath math="\iint_S (\nabla\times\mathbf{F})\cdot d\mathbf{S} = \oint_{\partial S}\mathbf{F}\cdot d\mathbf{r}" />
          </h2>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1.5">
          {STOKES_PRESETS.map((preset) => {
            const active = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-2.5 py-1.5 text-xs font-tabular-mono border transition-colors cursor-pointer ${
                  active
                    ? preset.isSingularity
                      ? "border-[var(--math-ink-upper)] bg-[var(--bg-canvas)] text-[var(--math-ink-upper)] font-semibold"
                      : "border-[var(--math-ink-sweep)] bg-[var(--bg-canvas)] text-[var(--math-ink-sweep)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom 3D Field Inputs */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <MathExpressionInput
          label="x-Component P(x, y, z):"
          prefixLatex="P ="
          value={pExpr}
          onChange={(val) => {
            setActivePresetId("custom");
            setPExpr(val);
          }}
          allowedVars={["x", "y", "z"]}
          compact
        />
        <MathExpressionInput
          label="y-Component Q(x, y, z):"
          prefixLatex="Q ="
          value={qExpr}
          onChange={(val) => {
            setActivePresetId("custom");
            setQExpr(val);
          }}
          allowedVars={["x", "y", "z"]}
          compact
        />
        <MathExpressionInput
          label="z-Component R(x, y, z):"
          prefixLatex="R ="
          value={rExpr}
          onChange={(val) => {
            setActivePresetId("custom");
            setRExpr(val);
          }}
          allowedVars={["x", "y", "z"]}
          compact
        />
      </div>

      {/* Cap Family Selector Bar */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-3 bg-[var(--bg-panel)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] mr-1">
            Spanning Cap S (Same Rim ∂S):
          </span>
          {CAP_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCapShape(opt.id)}
              className={`px-3 py-1 text-xs font-tabular-mono border transition-colors cursor-pointer ${
                capShape === opt.id
                  ? "border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-[var(--math-ink-z)] font-semibold"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-tabular-mono text-[var(--text-secondary)]">
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showNormals}
              onChange={(e) => setShowNormals(e.target.checked)}
              aria-label="Toggle unit surface normals n-hat"
              className="accent-[#029091]"
            />
            <span>Show Normals n̂</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showCurl}
              onChange={(e) => setShowCurl(e.target.checked)}
              aria-label="Toggle 3D curl vectors on cap"
              className="accent-[#AAA36D]"
            />
            <span>Show Curl ∇×F</span>
          </label>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: 3D Orbit Viewport */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <ThreeOrbitViewport
            heightClassName="h-[390px] sm:h-[430px]"
            cameraPosition={[3.4, 2.7, 3.4]}
            cameraTarget={[0, 0.35, 0]}
            titleBadge="3D Spanning Cap S Anchored to Oriented Rim ∂S"
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-sweep)] font-semibold">
                  Rim ∮_∂S F·dr = {stokesStats.rimCirculation.toFixed(4)}
                </span>
                <span className="text-[var(--math-ink-z)] font-semibold">
                  Cap ∬_S (∇×F)·dS = {stokesStats.surfaceCurlFlux.toFixed(4)}
                </span>
              </div>
            }
            sceneDeps={[
              capShape,
              compiledP,
              compiledQ,
              compiledR,
              domeHeight,
              rimRadius,
              showNormals,
              showCurl,
              stokesStats.hasSingularity,
            ]}
            onBuildScene={(group) => {
              // 1. Spanning Cap Surface
              const uRange = capGeometry.uDomain;
              const capMesh = createParametricSurfaceMesh(
                (uParam, theta) => capGeometry.evalCap(uParam, theta).pos,
                uRange,
                [0, 2 * Math.PI],
                20,
                36,
                {
                  color: 0x029091,
                  opacity: 0.48,
                  wireframeColor: 0xfbeaa4,
                  wireframeOpacity: 0.22,
                  showWireframe: true,
                }
              );
              group.add(capMesh);

              // 2. Fixed Oriented Boundary Rim ∂S (r = R, z = 0)
              const rimPts: THREE.Vector3[] = [];
              const segs = 72;
              for (let i = 0; i <= segs; i++) {
                const t = (i / segs) * 2 * Math.PI;
                rimPts.push(
                  mathToThreeVec3(
                    rimRadius * Math.cos(t),
                    rimRadius * Math.sin(t),
                    0.015
                  )
                );
              }
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(rimPts),
                  new THREE.LineBasicMaterial({ color: 0xd35323 })
                )
              );

              // 4 CCW Rim Orientation Arrows
              for (let k = 0; k < 4; k++) {
                const t = (k * Math.PI) / 2;
                group.add(
                  createVectorArrow3D(
                    [rimRadius * Math.cos(t), rimRadius * Math.sin(t), 0.02],
                    [-Math.sin(t), Math.cos(t), 0],
                    0.44,
                    0xd35323
                  )
                );
              }

              // 3. Sample Normals and Curl Vectors Across Cap
              const uSamples =
                capShape === "hemisphere"
                  ? [0.35 * (Math.PI / 2), 0.72 * (Math.PI / 2)]
                  : [0.38 * rimRadius, 0.72 * rimRadius];
              const thetaSamples = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

              for (const uS of uSamples) {
                for (const th of thetaSamples) {
                  const { pos, unitN } = capGeometry.evalCap(uS, th);
                  if (showNormals) {
                    group.add(createVectorArrow3D(pos, unitN, 0.42, 0x029091));
                  }
                  if (showCurl) {
                    const [cx, cy, cz] = evalCurl(pos[0], pos[1], pos[2]);
                    const mag = Math.hypot(cx, cy, cz);
                    if (mag > 0.02 && mag < 100) {
                      group.add(
                        createVectorArrow3D(
                          pos,
                          [cx / mag, cy / mag, cz / mag],
                          Math.min(0.65, 0.25 + mag * 0.14),
                          0xfbeaa4
                        )
                      );
                    }
                  }
                }
              }

              // 4. Crimson Singularity Axis Pillar if field blows up on z-axis
              if (stokesStats.hasSingularity) {
                const axisPts = [
                  mathToThreeVec3(0, 0, -1.6),
                  mathToThreeVec3(0, 0, 1.8),
                ];
                group.add(
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints(axisPts),
                    new THREE.LineBasicMaterial({ color: 0xb95869 })
                  )
                );
              }
            }}
          />
        </div>

        {/* Right: Controls & Surface-Invariance Verification */}
        <div className="lg:col-span-5 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-math-serif text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles
                className="w-4 h-4 text-[var(--math-ink-sweep)]"
                aria-hidden="true"
              />
              <span>Deform the Cap Without Moving Rim ∂S</span>
            </h3>

            {/* Hypothesis Guard Banner */}
            {stokesStats.hasSingularity ? (
              <div className="border border-[var(--math-ink-upper)] bg-[var(--bg-canvas)] p-3.5 space-y-1.5 text-xs font-math-serif">
                <div className="flex items-center gap-1.5 font-tabular-mono font-semibold text-[var(--math-ink-upper)] uppercase">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Singularity Hypothesis Guard: C¹ Fails on S</span>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Away from the <KaTeXMath math="z" />-axis,{" "}
                  <KaTeXMath math="\nabla\times\mathbf{F} = \mathbf{0}" />, so the cap curl
                  integral reads ~<KaTeXMath math="0" />, yet the rim still collects{" "}
                  <KaTeXMath math="2\pi \approx 6.2832" />! Stokes&apos; Theorem does not fail—the
                  cap <KaTeXMath math="S" /> punctures the singular line{" "}
                  <KaTeXMath math="x^2 + y^2 = 0" />, violating smoothness on <KaTeXMath math="S" />.
                </p>
              </div>
            ) : (
              <div className="border border-[var(--math-ink-y)] bg-[var(--bg-canvas)] p-3.5 space-y-1 text-xs font-math-serif">
                <div className="flex items-center gap-1.5 font-tabular-mono font-semibold text-[var(--math-ink-y)] uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Stokes&apos; Invariance Verified Across {capShape}</span>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Switch between Paraboloid, Ellipsoid, Flat Disk, and Saddle or scrub{" "}
                  <KaTeXMath math="H" />: every spanning cap captures the exact same curl flux
                  because they share the identical boundary rim <KaTeXMath math="\partial S" />.
                </p>
              </div>
            )}

            {/* Sliders */}
            <div className="space-y-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--text-secondary)]">
                    Cap Deformation Height (H)
                  </span>
                  <span className="text-[var(--math-ink-z)] font-semibold">
                    H = {domeHeight.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={-1.4}
                  max={1.6}
                  step={0.05}
                  value={domeHeight}
                  onChange={(e) => setDomeHeight(parseFloat(e.target.value))}
                  aria-label="Cap deformation height H"
                  disabled={capShape === "disk"}
                  className="w-full accent-[#029091]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--text-secondary)]">
                    Boundary Rim Radius (R)
                  </span>
                  <span className="text-[var(--math-ink-sweep)] font-semibold">
                    R = {rimRadius.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={1.8}
                  step={0.05}
                  value={rimRadius}
                  onChange={(e) => setRimRadius(parseFloat(e.target.value))}
                  aria-label="Boundary rim radius R"
                  className="w-full accent-[#D35323]"
                />
              </div>
            </div>

            {/* Side-by-Side Comparison Readouts */}
            <div className="grid grid-cols-2 gap-3 text-xs font-tabular-mono">
              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[var(--math-ink-sweep)] block">1D Rim Work</span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">
                  {stokesStats.rimCirculation.toFixed(4)}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] block">
                  ∮_∂S F · dr (CCW)
                </span>
              </div>
              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[var(--math-ink-z)] block">2D Cap Curl Flux</span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">
                  {stokesStats.surfaceCurlFlux.toFixed(4)}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] block">
                  ∬_S (∇×F) · dS
                </span>
              </div>
            </div>

            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex items-center justify-between text-xs font-tabular-mono">
              <span className="text-[var(--text-secondary)]">
                Discrepancy |Rim − Cap|
              </span>
              <span
                className={`font-semibold ${
                  stokesStats.discrepancy < 0.01
                    ? "text-[var(--math-ink-y)]"
                    : "text-[var(--math-ink-upper)]"
                }`}
              >
                {stokesStats.discrepancy.toFixed(5)}
              </span>
            </div>
          </div>

          <p className="text-xs font-math-serif text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-3">
            Tip: Curl your right-hand fingers counterclockwise around the Persimmon rim{" "}
            <KaTeXMath math="\partial S" />; your thumb points along the Deep Teal upward cap normal{" "}
            <KaTeXMath math="\hat{\mathbf{n}}" />.
          </p>
        </div>
      </div>
    </section>
  );
}
