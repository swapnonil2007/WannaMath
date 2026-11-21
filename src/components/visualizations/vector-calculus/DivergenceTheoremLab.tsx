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
  integrate2DIterated,
  integrate3DIterated,
} from "@/components/visualizations/primitives";

type SolidShape = "cube" | "sphere" | "cylinder";

interface DivergencePreset {
  id: string;
  label: string;
  pExpr: string;
  qExpr: string;
  rExpr: string;
  solid: SolidShape;
  isSingularity?: boolean;
}

const DIVERGENCE_PRESETS: DivergencePreset[] = [
  {
    id: "expansion",
    label: "Uniform Expansion",
    pExpr: "x",
    qExpr: "y",
    rExpr: "z",
    solid: "cube",
  },
  {
    id: "nonlinear",
    label: "Cubic Source (∇·F = 3r²)",
    pExpr: "x^3",
    qExpr: "y^3",
    rExpr: "z^3",
    solid: "sphere",
  },
  {
    id: "solenoidal",
    label: "Incompressible (∇·F = 0)",
    pExpr: "-y",
    qExpr: "x",
    rExpr: "0",
    solid: "cylinder",
  },
  {
    id: "point-charge",
    label: "Point Charge (r/r³ Trap)",
    pExpr: "x / (x^2 + y^2 + z^2)^(3/2)",
    qExpr: "y / (x^2 + y^2 + z^2)^(3/2)",
    rExpr: "z / (x^2 + y^2 + z^2)^(3/2)",
    solid: "sphere",
    isSingularity: true,
  },
];

const SOLID_OPTIONS: { id: SolidShape; label: string }[] = [
  { id: "cube", label: "Cube [-a, a]³" },
  { id: "sphere", label: "Sphere (r ≤ R)" },
  { id: "cylinder", label: "Cylinder (r ≤ R, |z| ≤ H)" },
];

export function DivergenceTheoremLab() {
  const [activePresetId, setActivePresetId] = useState<string>("expansion");
  const [solidShape, setSolidShape] = useState<SolidShape>("cube");
  const [pExpr, setPExpr] = useState<string>("x");
  const [qExpr, setQExpr] = useState<string>("y");
  const [rExpr, setRExpr] = useState<string>("z");
  const [sizeParam, setSizeParam] = useState<number>(1.0);
  const [cylHeight, setCylHeight] = useState<number>(1.0);
  const [showNormals, setShowNormals] = useState<boolean>(true);
  const [showDivGlyphs, setShowDivGlyphs] = useState<boolean>(true);

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

  const handleApplyPreset = (preset: DivergencePreset) => {
    setActivePresetId(preset.id);
    setPExpr(preset.pExpr);
    setQExpr(preset.qExpr);
    setRExpr(preset.rExpr);
    setSolidShape(preset.solid);
  };

  const evalSafe = (
    fn: (pt: { x: number; y: number; z: number }) => number,
    x: number,
    y: number,
    z: number
  ) => {
    const v = fn({ x, y, z });
    return Number.isFinite(v) ? v : 0;
  };

  const evalDiv = useMemo(() => {
    const h = 1e-4;
    return (x: number, y: number, z: number): number => {
      const dPdx =
        (evalSafe(compiledP.evaluate, x + h, y, z) -
          evalSafe(compiledP.evaluate, x - h, y, z)) /
        (2 * h);
      const dQdy =
        (evalSafe(compiledQ.evaluate, x, y + h, z) -
          evalSafe(compiledQ.evaluate, x, y - h, z)) /
        (2 * h);
      const dRdz =
        (evalSafe(compiledR.evaluate, x, y, z + h) -
          evalSafe(compiledR.evaluate, x, y, z - h)) /
        (2 * h);
      const sum = dPdx + dQdy + dRdz;
      return Number.isFinite(sum) ? sum : 0;
    };
  }, [compiledP, compiledQ, compiledR]);

  const gaussStats = useMemo(() => {
    const a = sizeParam;
    const H = cylHeight;
    let boundaryFlux = 0;
    let interiorDiv = 0;
    let breakdown: { label: string; value: number }[] = [];

    if (solidShape === "cube") {
      interiorDiv = integrate3DIterated(
        (x, y, z) => evalDiv(x, y, z),
        -a,
        a,
        () => -a,
        () => a,
        () => -a,
        () => a,
        10,
        10,
        10
      );
      const fxPos = integrate2DIterated(
        (y, z) => evalSafe(compiledP.evaluate, a, y, z),
        -a,
        a,
        () => -a,
        () => a,
        12,
        12
      );
      const fxNeg = -integrate2DIterated(
        (y, z) => evalSafe(compiledP.evaluate, -a, y, z),
        -a,
        a,
        () => -a,
        () => a,
        12,
        12
      );
      const fyPos = integrate2DIterated(
        (x, z) => evalSafe(compiledQ.evaluate, x, a, z),
        -a,
        a,
        () => -a,
        () => a,
        12,
        12
      );
      const fyNeg = -integrate2DIterated(
        (x, z) => evalSafe(compiledQ.evaluate, x, -a, z),
        -a,
        a,
        () => -a,
        () => a,
        12,
        12
      );
      const fzPos = integrate2DIterated(
        (x, y) => evalSafe(compiledR.evaluate, x, y, a),
        -a,
        a,
        () => -a,
        () => a,
        12,
        12
      );
      const fzNeg = -integrate2DIterated(
        (x, y) => evalSafe(compiledR.evaluate, x, y, -a),
        -a,
        a,
        () => -a,
        () => a,
        12,
        12
      );
      boundaryFlux = fxPos + fxNeg + fyPos + fyNeg + fzPos + fzNeg;
      breakdown = [
        { label: "±x Faces Net Flux", value: fxPos + fxNeg },
        { label: "±y Faces Net Flux", value: fyPos + fyNeg },
        { label: "±z Faces Net Flux", value: fzPos + fzNeg },
      ];
    } else if (solidShape === "sphere") {
      boundaryFlux = integrate2DIterated(
        (phi, theta) => {
          const sp = Math.sin(phi);
          const cp = Math.cos(phi);
          const ct = Math.cos(theta);
          const st = Math.sin(theta);
          const nx = sp * ct;
          const ny = sp * st;
          const nz = cp;
          const x = a * nx;
          const y = a * ny;
          const z = a * nz;
          const p = evalSafe(compiledP.evaluate, x, y, z);
          const q = evalSafe(compiledQ.evaluate, x, y, z);
          const r = evalSafe(compiledR.evaluate, x, y, z);
          return (p * nx + q * ny + r * nz) * a * a * sp;
        },
        0,
        Math.PI,
        () => 0,
        () => 2 * Math.PI,
        18,
        24
      );
      interiorDiv = integrate3DIterated(
        (rho, phi, theta) => {
          const sp = Math.sin(phi);
          const cp = Math.cos(phi);
          const x = rho * sp * Math.cos(theta);
          const y = rho * sp * Math.sin(theta);
          const z = rho * cp;
          return evalDiv(x, y, z) * rho * rho * sp;
        },
        0,
        a,
        () => 0,
        () => Math.PI,
        () => 0,
        () => 2 * Math.PI,
        10,
        12,
        16
      );
      breakdown = [
        { label: "Sphere Radius R", value: a },
        { label: "Shell Area 4πR²", value: 4 * Math.PI * a * a },
        { label: "Ball Volume (4/3)πR³", value: (4 / 3) * Math.PI * a * a * a },
      ];
    } else {
      // Closed Cylinder r <= a, z in [-H, H]
      const fluxTop = integrate2DIterated(
        (r, theta) =>
          evalSafe(compiledR.evaluate, r * Math.cos(theta), r * Math.sin(theta), H) * r,
        0,
        a,
        () => 0,
        () => 2 * Math.PI,
        12,
        24
      );
      const fluxBottom = -integrate2DIterated(
        (r, theta) =>
          evalSafe(compiledR.evaluate, r * Math.cos(theta), r * Math.sin(theta), -H) * r,
        0,
        a,
        () => 0,
        () => 2 * Math.PI,
        12,
        24
      );
      const fluxWall = integrate2DIterated(
        (z, theta) => {
          const ct = Math.cos(theta);
          const st = Math.sin(theta);
          const p = evalSafe(compiledP.evaluate, a * ct, a * st, z);
          const q = evalSafe(compiledQ.evaluate, a * ct, a * st, z);
          return (p * ct + q * st) * a;
        },
        -H,
        H,
        () => 0,
        () => 2 * Math.PI,
        14,
        24
      );
      boundaryFlux = fluxTop + fluxBottom + fluxWall;
      interiorDiv = integrate3DIterated(
        (r, theta, z) =>
          evalDiv(r * Math.cos(theta), r * Math.sin(theta), z) * r,
        0,
        a,
        () => 0,
        () => 2 * Math.PI,
        () => -H,
        () => H,
        10,
        16,
        10
      );
      breakdown = [
        { label: "Top Cap (z = +H)", value: fluxTop },
        { label: "Bottom Cap (z = -H)", value: fluxBottom },
        { label: "Lateral Wall (r = R)", value: fluxWall },
      ];
    }

    // Singularity probe at (0,0,0) and small radius
    const p0 = compiledP.evaluate({ x: 0, y: 0, z: 0 });
    const q0 = compiledQ.evaluate({ x: 0, y: 0, z: 0 });
    const r0 = compiledR.evaluate({ x: 0, y: 0, z: 0 });
    const pNear = compiledP.evaluate({ x: 1e-3, y: 1e-3, z: 1e-3 });
    const qNear = compiledQ.evaluate({ x: 1e-3, y: 1e-3, z: 1e-3 });
    const rNear = compiledR.evaluate({ x: 1e-3, y: 1e-3, z: 1e-3 });
    const blowsUp =
      !Number.isFinite(p0) ||
      !Number.isFinite(q0) ||
      !Number.isFinite(r0) ||
      Math.hypot(pNear, qNear, rNear) > 1e3;

    const discrepancy = Math.abs(boundaryFlux - interiorDiv);
    const hasSingularity =
      activePresetId === "point-charge" || blowsUp || discrepancy > 0.25;

    return {
      boundaryFlux,
      interiorDiv,
      discrepancy,
      breakdown,
      hasSingularity,
    };
  }, [
    compiledP,
    compiledQ,
    compiledR,
    solidShape,
    sizeParam,
    cylHeight,
    evalDiv,
    activePresetId,
  ]);

  return (
    <section
      aria-label="Gauss's Divergence Theorem Interactive Control Volume Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-z)] text-[var(--math-ink-z)] bg-[var(--bg-canvas)] inline-block">
            LAB 3.3.7B • GAUSS&apos;S DIVERGENCE THEOREM &amp; CONTROL VOLUMES
          </span>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Closed-Shell Outward Flux vs. Interior Volume Divergence:{" "}
            <KaTeXMath math="\oiint_{\partial E} \mathbf{F}\cdot\hat{\mathbf{n}}\,dS = \iiint_E (\nabla\cdot\mathbf{F})\,dV" />
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {DIVERGENCE_PRESETS.map((preset) => {
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
                      : "border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-[var(--math-ink-z)] font-semibold"
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

      {/* Control Volume Shape Selector */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-3 bg-[var(--bg-panel)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] mr-1">
            Control Volume E:
          </span>
          {SOLID_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSolidShape(opt.id)}
              className={`px-3 py-1 text-xs font-tabular-mono border transition-colors cursor-pointer ${
                solidShape === opt.id
                  ? "border-[var(--math-ink-sweep)] bg-[var(--bg-canvas)] text-[var(--math-ink-sweep)] font-semibold"
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
              aria-label="Toggle outward boundary normals n-hat"
              className="accent-[#D35323]"
            />
            <span>Outward Normals n̂</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showDivGlyphs}
              onChange={(e) => setShowDivGlyphs(e.target.checked)}
              aria-label="Toggle interior divergence source and sink markers"
              className="accent-[#96B898]"
            />
            <span>Interior ∇·F Sources</span>
          </label>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: 3D Viewport */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <ThreeOrbitViewport
            heightClassName="h-[390px] sm:h-[430px]"
            cameraPosition={[3.4, 2.7, 3.4]}
            cameraTarget={[0, 0, 0]}
            titleBadge={`Closed Control Volume ∂E (${solidShape.toUpperCase()}) & Interior Divergence`}
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-sweep)] font-semibold">
                  Boundary ∯_∂E F·n̂ dS = {gaussStats.boundaryFlux.toFixed(4)}
                </span>
                <span className="text-[var(--math-ink-z)] font-semibold">
                  Interior ∭_E (∇·F) dV = {gaussStats.interiorDiv.toFixed(4)}
                </span>
              </div>
            }
            sceneDeps={[
              solidShape,
              sizeParam,
              cylHeight,
              compiledP,
              compiledQ,
              compiledR,
              showNormals,
              showDivGlyphs,
              gaussStats.hasSingularity,
            ]}
            onBuildScene={(group) => {
              const a = sizeParam;
              const H = cylHeight;

              if (solidShape === "cube") {
                const s = 2 * a;
                const geom = new THREE.BoxGeometry(s, s, s);
                group.add(
                  new THREE.Mesh(
                    geom,
                    new THREE.MeshBasicMaterial({
                      color: 0x029091,
                      transparent: true,
                      opacity: 0.24,
                      depthWrite: false,
                    })
                  )
                );
                group.add(
                  new THREE.LineSegments(
                    new THREE.EdgesGeometry(geom),
                    new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                  )
                );
                if (showNormals) {
                  const faces: [number, number, number][] = [
                    [1, 0, 0],
                    [-1, 0, 0],
                    [0, 1, 0],
                    [0, -1, 0],
                    [0, 0, 1],
                    [0, 0, -1],
                  ];
                  for (const [nx, ny, nz] of faces) {
                    group.add(
                      createVectorArrow3D(
                        [nx * a, ny * a, nz * a],
                        [nx, ny, nz],
                        0.45,
                        0xd35323
                      )
                    );
                  }
                }
              } else if (solidShape === "sphere") {
                const sphereMesh = createParametricSurfaceMesh(
                  (phi, theta) => [
                    a * Math.sin(phi) * Math.cos(theta),
                    a * Math.sin(phi) * Math.sin(theta),
                    a * Math.cos(phi),
                  ],
                  [0, Math.PI],
                  [0, 2 * Math.PI],
                  18,
                  28,
                  {
                    color: 0x029091,
                    opacity: 0.34,
                    wireframeColor: 0xfbeaa4,
                    wireframeOpacity: 0.2,
                    showWireframe: true,
                  }
                );
                group.add(sphereMesh);
                if (showNormals) {
                  const dirs: [number, number, number][] = [
                    [1, 0, 0],
                    [-1, 0, 0],
                    [0, 1, 0],
                    [0, -1, 0],
                    [0, 0, 1],
                    [0, 0, -1],
                    [0.577, 0.577, 0.577],
                    [-0.577, -0.577, 0.577],
                  ];
                  for (const [nx, ny, nz] of dirs) {
                    group.add(
                      createVectorArrow3D(
                        [a * nx, a * ny, a * nz],
                        [nx, ny, nz],
                        0.42,
                        0xd35323
                      )
                    );
                  }
                }
              } else {
                const wall = createParametricSurfaceMesh(
                  (z, theta) => [a * Math.cos(theta), a * Math.sin(theta), z],
                  [-H, H],
                  [0, 2 * Math.PI],
                  12,
                  28,
                  {
                    color: 0x029091,
                    opacity: 0.32,
                    wireframeColor: 0xfbeaa4,
                    wireframeOpacity: 0.2,
                    showWireframe: true,
                  }
                );
                const topCap = createParametricSurfaceMesh(
                  (r, theta) => [r * Math.cos(theta), r * Math.sin(theta), H],
                  [0, a],
                  [0, 2 * Math.PI],
                  8,
                  28,
                  { color: 0x8d9fce, opacity: 0.32, showWireframe: false }
                );
                const bottomCap = createParametricSurfaceMesh(
                  (r, theta) => [r * Math.cos(theta), r * Math.sin(theta), -H],
                  [0, a],
                  [0, 2 * Math.PI],
                  8,
                  28,
                  { color: 0x8d9fce, opacity: 0.32, showWireframe: false }
                );
                group.add(wall, topCap, bottomCap);
                if (showNormals) {
                  group.add(createVectorArrow3D([0, 0, H], [0, 0, 1], 0.45, 0xd35323));
                  group.add(createVectorArrow3D([0, 0, -H], [0, 0, -1], 0.45, 0xd35323));
                  for (let k = 0; k < 4; k++) {
                    const th = (k * Math.PI) / 2;
                    group.add(
                      createVectorArrow3D(
                        [a * Math.cos(th), a * Math.sin(th), 0],
                        [Math.cos(th), Math.sin(th), 0],
                        0.42,
                        0xd35323
                      )
                    );
                  }
                }
              }

              // Interior divergence source/sink markers
              if (showDivGlyphs) {
                const coords = [-0.45, 0.45];
                const markerGeom = new THREE.SphereGeometry(0.055, 10, 10);
                for (const ix of coords) {
                  for (const iy of coords) {
                    for (const iz of coords) {
                      const mx = ix * a;
                      const my = iy * a;
                      const mz = iz * (solidShape === "cylinder" ? H : a);
                      const d = evalDiv(mx, my, mz);
                      if (Math.abs(d) > 0.05) {
                        const m = new THREE.Mesh(
                          markerGeom,
                          new THREE.MeshBasicMaterial({
                            color: d > 0 ? 0x96b898 : 0xb95869,
                          })
                        );
                        m.position.copy(mathToThreeVec3(mx, my, mz));
                        group.add(m);
                      }
                    }
                  }
                }
              }

              // Point-charge singularity marker at origin
              if (gaussStats.hasSingularity) {
                const singMesh = new THREE.Mesh(
                  new THREE.SphereGeometry(0.11, 16, 16),
                  new THREE.MeshBasicMaterial({ color: 0xb95869 })
                );
                singMesh.position.copy(mathToThreeVec3(0, 0, 0));
                group.add(singMesh);
              }
            }}
          />
        </div>

        {/* Right: Parameters & Flux Budget */}
        <div className="lg:col-span-5 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-math-serif text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles
                className="w-4 h-4 text-[var(--math-ink-z)]"
                aria-hidden="true"
              />
              <span>Control Volume Flux vs. Divergence Budget</span>
            </h3>

            {/* Singularity / Hypothesis Guard Banner */}
            {gaussStats.hasSingularity ? (
              <div className="border border-[var(--math-ink-upper)] bg-[var(--bg-canvas)] p-3.5 space-y-1.5 text-xs font-math-serif">
                <div className="flex items-center gap-1.5 font-tabular-mono font-semibold text-[var(--math-ink-upper)] uppercase">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Point-Charge Singularity Guard: r/r³ at Origin</span>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  For <KaTeXMath math="\mathbf{F} = \mathbf{r}/\|\mathbf{r}\|^3" />,{" "}
                  <KaTeXMath math="\nabla\cdot\mathbf{F} = 0" /> everywhere away from{" "}
                  <KaTeXMath math="\mathbf{0}" />, so ordinary volume quadrature reads{" "}
                  <KaTeXMath math="0" />, yet outward flux across Cube, Sphere, and Cylinder all
                  equal <KaTeXMath math="4\pi \approx 12.5664" />! The origin breaks{" "}
                  <KaTeXMath math="C^1" /> (yielding <KaTeXMath math="4\pi\delta^{(3)}(\mathbf{r})" />{" "}
                  in distribution theory).
                </p>
              </div>
            ) : (
              <div className="border border-[var(--math-ink-y)] bg-[var(--bg-canvas)] p-3.5 space-y-1 text-xs font-math-serif">
                <div className="flex items-center gap-1.5 font-tabular-mono font-semibold text-[var(--math-ink-y)] uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Divergence Theorem Verified on {solidShape}</span>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Every adjacent interior micro-cell cancels internal face fluxes, leaving net
                  boundary outflow equal to the triple integral of interior sources minus sinks.
                </p>
              </div>
            )}

            {/* Sliders */}
            <div className="space-y-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--text-secondary)]">
                    {solidShape === "cube" ? "Half-Edge Length (a)" : "Radius (R)"}
                  </span>
                  <span className="text-[var(--math-ink-z)] font-semibold">
                    {solidShape === "cube" ? "a" : "R"} = {sizeParam.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.6}
                  step={0.05}
                  value={sizeParam}
                  onChange={(e) => setSizeParam(parseFloat(e.target.value))}
                  aria-label="Control volume half-size or radius"
                  className="w-full accent-[#029091]"
                />
              </div>

              {solidShape === "cylinder" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-tabular-mono">
                    <span className="text-[var(--text-secondary)]">
                      Cylinder Half-Height (H)
                    </span>
                    <span className="text-[var(--math-ink-x)] font-semibold">
                      H = {cylHeight.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={1.6}
                    step={0.05}
                    value={cylHeight}
                    onChange={(e) => setCylHeight(parseFloat(e.target.value))}
                    aria-label="Cylinder half-height H"
                    className="w-full accent-[#8D9FCE]"
                  />
                </div>
              )}
            </div>

            {/* Flux vs Volume Totals */}
            <div className="grid grid-cols-2 gap-3 text-xs font-tabular-mono">
              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[var(--math-ink-sweep)] block">Closed-Shell Flux</span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">
                  {gaussStats.boundaryFlux.toFixed(4)}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] block">
                  ∯_∂E F · n̂ dS
                </span>
              </div>
              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <span className="text-[var(--math-ink-z)] block">Volume Divergence</span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">
                  {gaussStats.interiorDiv.toFixed(4)}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] block">
                  ∭_E (∇·F) dV
                </span>
              </div>
            </div>

            {/* Surface Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-[11px] font-tabular-mono">
              {gaussStats.breakdown.map((item) => (
                <div
                  key={item.label}
                  className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-0.5"
                >
                  <span className="text-[var(--text-muted)] block truncate">
                    {item.label}
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {item.value.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs font-math-serif text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-3">
            Green interior spheres mark local sources (<KaTeXMath math="\nabla\cdot\mathbf{F} > 0" />);
            Crimson spheres mark sinks (<KaTeXMath math="\nabla\cdot\mathbf{F} < 0" />).
          </p>
        </div>
      </div>
    </section>
  );
}
