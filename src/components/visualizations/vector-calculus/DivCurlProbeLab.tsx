"use client";

import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Compass, Wind, RotateCw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  createVectorArrow3D,
  mathToThreeVec3,
  computePartialDerivatives2D,
} from "@/components/visualizations/primitives";

interface FieldPreset {
  id: string;
  name: string;
  badge: string;
  pExpr: string;
  qExpr: string;
  rExpr: string;
  defaultX0: number;
  defaultY0: number;
  symbolicLatex: string;
  divCurlLatex: string;
  note: string;
}

const FIELD_PRESETS: FieldPreset[] = [
  {
    id: "radial-source",
    name: "Radial Source: F = ⟨x, y, 0.4z⟩",
    badge: "div F > 0, curl F = 0",
    pExpr: "x",
    qExpr: "y",
    rExpr: "0.4 * z",
    defaultX0: 0.75,
    defaultY0: 0.55,
    symbolicLatex: "\\mathbf{F}(x,y,z) = \\langle x,\\; y,\\; 0.4z \\rangle",
    divCurlLatex:
      "\\nabla \\cdot \\mathbf{F} = 1 + 1 + 0.4 = 2.4, \\qquad (\\nabla \\times \\mathbf{F})_z = 0",
    note: "A pure outward expansion field. The flux box measures positive net outflow everywhere (∇·F = 2.4), while the paddlewheel experiences zero net torque (irrotational).",
  },
  {
    id: "rigid-vortex",
    name: "Rigid-Body Vortex: F = ⟨-y, x, 0⟩",
    badge: "div F = 0, curl_z F = 2",
    pExpr: "-y",
    qExpr: "x",
    rExpr: "0",
    defaultX0: 0.8,
    defaultY0: 0.5,
    symbolicLatex: "\\mathbf{F}(x,y,z) = \\langle -y,\\; x,\\; 0 \\rangle",
    divCurlLatex:
      "\\nabla \\cdot \\mathbf{F} = 0, \\qquad (\\nabla \\times \\mathbf{F})_z = \\frac{\\partial x}{\\partial x} - \\frac{\\partial (-y)}{\\partial y} = 2",
    note: "Incompressible pure rotation (div F = 0). No net fluid enters or leaves the probe box, yet the paddlewheel spins counter-clockwise with constant vorticity (∇×F)_z = 2 everywhere.",
  },
  {
    id: "shear-flow",
    name: "Couette Shear Flow: F = ⟨y, 0, 0⟩",
    badge: "Straight Lines, Non-Zero Curl!",
    pExpr: "y",
    qExpr: "0",
    rExpr: "0",
    defaultX0: 0.4,
    defaultY0: 0.7,
    symbolicLatex: "\\mathbf{F}(x,y,z) = \\langle y,\\; 0,\\; 0 \\rangle",
    divCurlLatex:
      "\\nabla \\cdot \\mathbf{F} = 0, \\qquad (\\nabla \\times \\mathbf{F})_z = 0 - 1 = -1",
    note: "Even though all streamlines are perfectly straight horizontal lines, faster flow above y₀ pushes the top paddles harder than the bottom paddles—creating clockwise curl (∇×F)_z = -1.",
  },
  {
    id: "saddle-hyperbolic",
    name: "Incompressible Saddle + Swirl: F = ⟨x - 0.8y, -y + 0.4x, 0⟩",
    badge: "Zero Div, Non-Zero Curl",
    pExpr: "x - 0.8 * y",
    qExpr: "-y + 0.4 * x",
    rExpr: "0",
    defaultX0: 0.6,
    defaultY0: 0.6,
    symbolicLatex:
      "\\mathbf{F}(x,y,z) = \\langle x - 0.8y,\\; 0.4x - y,\\; 0 \\rangle",
    divCurlLatex:
      "\\nabla \\cdot \\mathbf{F} = 1 - 1 = 0, \\qquad (\\nabla \\times \\mathbf{F})_z = 0.4 - (-0.8) = 1.2",
    note: "Inflow along y balances outflow along x (∇·F = 0), while asymmetric cross-partials create counter-clockwise rotation (∇×F)_z = 1.2.",
  },
];

export function DivCurlProbeLab() {
  const [presetId, setPresetId] = useState<string>("radial-source");
  const [pExpr, setPExpr] = useState<string>(FIELD_PRESETS[0].pExpr);
  const [qExpr, setQExpr] = useState<string>(FIELD_PRESETS[0].qExpr);
  const [rExpr, setRExpr] = useState<string>(FIELD_PRESETS[0].rExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [probeX, setProbeX] = useState<number>(FIELD_PRESETS[0].defaultX0);
  const [probeY, setProbeY] = useState<number>(FIELD_PRESETS[0].defaultY0);
  const [probeZ, setProbeZ] = useState<number>(0);
  const [boxRadius, setBoxRadius] = useState<number>(0.38);

  const activePreset = useMemo(
    () => FIELD_PRESETS.find((p) => p.id === presetId) ?? FIELD_PRESETS[0],
    [presetId]
  );

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

  const bounds = { xMin: -2, xMax: 2, yMin: -2, yMax: 2 };
  const safeX = Math.max(bounds.xMin, Math.min(bounds.xMax, probeX));
  const safeY = Math.max(bounds.yMin, Math.min(bounds.yMax, probeY));
  const safeZ = Math.max(-1.5, Math.min(1.5, probeZ));

  const handleSelectPreset = (p: FieldPreset) => {
    setPresetId(p.id);
    setPExpr(p.pExpr);
    setQExpr(p.qExpr);
    setRExpr(p.rExpr);
    setProbeX(p.defaultX0);
    setProbeY(p.defaultY0);
    setProbeZ(0);
    setIsCustom(false);
  };

  // Compute local vector field value, divergence, and 3D curl at (safeX, safeY, safeZ)
  const localAnalysis = useMemo(() => {
    const h = 1e-4;
    const evalF = (x: number, y: number, z: number): [number, number, number] => [
      compiledP.evaluate({ x, y, z }),
      compiledQ.evaluate({ x, y, z }),
      compiledR.evaluate({ x, y, z }),
    ];

    const [p0, q0, r0] = evalF(safeX, safeY, safeZ);
    const dP = computePartialDerivatives2D(
      (x, y) => compiledP.evaluate({ x, y, z: safeZ }),
      safeX,
      safeY,
      h
    );
    const dQ = computePartialDerivatives2D(
      (x, y) => compiledQ.evaluate({ x, y, z: safeZ }),
      safeX,
      safeY,
      h
    );
    const dR = computePartialDerivatives2D(
      (x, y) => compiledR.evaluate({ x, y, z: safeZ }),
      safeX,
      safeY,
      h
    );

    const dPdz =
      (compiledP.evaluate({ x: safeX, y: safeY, z: safeZ + h }) -
        compiledP.evaluate({ x: safeX, y: safeY, z: safeZ - h })) /
      (2 * h);
    const dQdz =
      (compiledQ.evaluate({ x: safeX, y: safeY, z: safeZ + h }) -
        compiledQ.evaluate({ x: safeX, y: safeY, z: safeZ - h })) /
      (2 * h);
    const dRdz =
      (compiledR.evaluate({ x: safeX, y: safeY, z: safeZ + h }) -
        compiledR.evaluate({ x: safeX, y: safeY, z: safeZ - h })) /
      (2 * h);

    const divF = dP.fx + dQ.fy + dRdz;
    const curlX = dR.fy - dQdz;
    const curlY = dPdz - dR.fx;
    const curlZ = dQ.fx - dP.fy;
    const curlMag = Math.hypot(curlX, curlY, curlZ);

    return {
      p0,
      q0,
      r0,
      dPdx: dP.fx,
      dPdy: dP.fy,
      dQdx: dQ.fx,
      dQdy: dQ.fy,
      dRdz,
      divF,
      curlX,
      curlY,
      curlZ,
      curlMag,
    };
  }, [compiledP, compiledQ, compiledR, safeX, safeY, safeZ]);

  // 2D Vector Field grid arrows for SVG
  const fieldArrows2D = useMemo(() => {
    const arrows: {
      x: number;
      y: number;
      dx: number;
      dy: number;
      mag: number;
    }[] = [];
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const x = bounds.xMin + (i / steps) * (bounds.xMax - bounds.xMin);
      for (let j = 0; j <= steps; j++) {
        const y = bounds.yMin + (j / steps) * (bounds.yMax - bounds.yMin);
        const px = compiledP.evaluate({ x, y, z: safeZ });
        const qy = compiledQ.evaluate({ x, y, z: safeZ });
        if (!Number.isFinite(px) || !Number.isFinite(qy)) continue;
        const mag = Math.hypot(px, qy);
        const len = mag > 1e-6 ? Math.min(0.36, 0.14 + 0.12 * mag) : 0;
        const dx = mag > 1e-6 ? (px / mag) * len : 0;
        const dy = mag > 1e-6 ? (qy / mag) * len : 0;
        arrows.push({ x, y, dx, dy, mag });
      }
    }
    return arrows;
  }, [compiledP, compiledQ, bounds.xMin, bounds.xMax, bounds.yMin, bounds.yMax, safeZ]);

  return (
    <section
      aria-label="Vector Fields, Divergence and Curl Probe Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-z)] text-[var(--math-ink-z)] bg-[var(--bg-canvas)]">
              LAB 3.3.3 • DIVERGENCE FLUX BOX &amp; CURL PADDLEWHEEL PROBE
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              {isCustom ? "Custom 3D Vector Field" : activePreset.badge}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Local Expansion <KaTeXMath math="\nabla \cdot \mathbf{F}" /> &amp; Microscopic Vorticity <KaTeXMath math="\nabla \times \mathbf{F}" />
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FIELD_PRESETS.map((p) => {
            const active = !isCustom && p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "border-[var(--math-ink-z)] bg-[#029091]/15 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                {p.name.split(":")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Vector Field Components P, Q, R */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <MathExpressionInput
          label="x-Component P(x, y, z):"
          prefixLatex="P(x,y,z) ="
          value={pExpr}
          onChange={(val) => {
            setPExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x", "y", "z"]}
          compact
        />
        <MathExpressionInput
          label="y-Component Q(x, y, z):"
          prefixLatex="Q(x,y,z) ="
          value={qExpr}
          onChange={(val) => {
            setQExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x", "y", "z"]}
          compact
        />
        <MathExpressionInput
          label="z-Component R(x, y, z):"
          prefixLatex="R(x,y,z) ="
          value={rExpr}
          onChange={(val) => {
            setRExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x", "y", "z"]}
          compact
        />
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: 3D Vector Field & Curl Vector Viewport */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <ThreeOrbitViewport
            heightClassName="h-[390px] sm:h-[430px]"
            cameraPosition={[3.4, 2.7, 3.4]}
            cameraTarget={[0, 0.2, 0]}
            titleBadge="3D Vector Field F(x,y,z), Flux Cube & Local Curl Vector ∇×F"
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-z)]">
                  Probe: ({safeX.toFixed(2)}, {safeY.toFixed(2)}, {safeZ.toFixed(2)})
                </span>
                <span className="text-[var(--math-ink-sweep)] font-semibold">
                  div F = {localAnalysis.divF.toFixed(3)}
                </span>
                <span className="text-[var(--math-ink-diff)] font-semibold">
                  (curl F)_z = {localAnalysis.curlZ.toFixed(3)}
                </span>
              </div>
            }
            sceneDeps={[
              compiledP,
              compiledQ,
              compiledR,
              safeX,
              safeY,
              safeZ,
              boxRadius,
              localAnalysis,
            ]}
            onBuildScene={(group) => {
              // 1. 3D Lattice of field arrows
              const coords = [-1.4, -0.5, 0.5, 1.4];
              const zCoords = [-0.6, 0.3, 1.1];
              for (const x of coords) {
                for (const y of coords) {
                  for (const z of zCoords) {
                    const vx = compiledP.evaluate({ x, y, z });
                    const vy = compiledQ.evaluate({ x, y, z });
                    const vz = compiledR.evaluate({ x, y, z });
                    if (
                      !Number.isFinite(vx) ||
                      !Number.isFinite(vy) ||
                      !Number.isFinite(vz)
                    ) {
                      continue;
                    }
                    const mag = Math.hypot(vx, vy, vz);
                    if (mag < 1e-5) continue;
                    const len = Math.min(0.55, 0.16 + 0.18 * mag);
                    group.add(
                      createVectorArrow3D(
                        [x, y, z],
                        [vx, vy, vz],
                        len,
                        0x8d9fce
                      )
                    );
                  }
                }
              }

              // 2. Local Divergence Flux Box centered at (safeX, safeY, safeZ)
              const s = boxRadius * 2;
              const boxGeom = new THREE.BoxGeometry(s, s, s);
              const boxMat = new THREE.MeshBasicMaterial({
                color: localAnalysis.divF >= 0 ? 0xd35323 : 0x029091,
                transparent: true,
                opacity: 0.24,
                depthWrite: false,
              });
              const boxMesh = new THREE.Mesh(boxGeom, boxMat);
              boxMesh.position.copy(mathToThreeVec3(safeX, safeY, safeZ));
              group.add(boxMesh);

              const edges = new THREE.EdgesGeometry(boxGeom);
              const wire = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
              );
              wire.position.copy(mathToThreeVec3(safeX, safeY, safeZ));
              group.add(wire);

              // 3. Curl vector ∇×F at probe point in #FBEAA4 Buttermilk Cream
              if (localAnalysis.curlMag > 1e-4) {
                const cLen = Math.min(1.2, Math.max(0.4, localAnalysis.curlMag * 0.45));
                group.add(
                  createVectorArrow3D(
                    [safeX, safeY, safeZ],
                    [
                      localAnalysis.curlX,
                      localAnalysis.curlY,
                      localAnalysis.curlZ,
                    ],
                    cLen,
                    0xfbeaa4
                  )
                );
              }
            }}
          />

          {/* Symbolic Formalization Card */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
                LOCAL DIVERGENCE &amp; CURL EVALUATION
              </span>
              <span className="text-xs font-tabular-mono text-[var(--math-ink-z)]">
                F = ⟨{localAnalysis.p0.toFixed(2)}, {localAnalysis.q0.toFixed(2)}, {localAnalysis.r0.toFixed(2)}⟩
              </span>
            </div>
            <div className="overflow-x-auto py-1">
              <KaTeXMath
                math={`\\nabla\\cdot\\mathbf{F} = \\underbrace{${localAnalysis.dPdx.toFixed(2)}}_{P_x} + \\underbrace{${localAnalysis.dQdy.toFixed(2)}}_{Q_y} + \\underbrace{${localAnalysis.dRdz.toFixed(2)}}_{R_z} = \\color{#D35323}{${localAnalysis.divF.toFixed(3)}}, \\qquad \\nabla\\times\\mathbf{F} = \\color{#FBEAA4}{\\langle ${localAnalysis.curlX.toFixed(2)},\\; ${localAnalysis.curlY.toFixed(2)},\\; ${localAnalysis.curlZ.toFixed(2)} \\rangle}`}
                block
              />
            </div>
            <p className="font-math-serif text-sm text-[var(--text-secondary)]">
              {isCustom
                ? "Click anywhere on the 2D cross-section plane (z = z₀) to move the flux box and paddlewheel probe, or adjust z₀ to inspect 3D vertical shear."
                : activePreset.note}
            </p>
          </div>
        </div>

        {/* Right: 2D Cross-Section Plane + Flux Box & Paddlewheel */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[var(--math-ink-z)]" />
                2D Slice z = {safeZ.toFixed(2)} (Click to Place Probe)
              </span>
              <span className="text-xs font-tabular-mono text-[var(--math-ink-diff)]">
                (∇×F)_z = {localAnalysis.curlZ.toFixed(2)}
              </span>
            </div>

            <SvgCoordinatePlane2D
              xRange={[bounds.xMin, bounds.xMax]}
              yRange={[bounds.yMin, bounds.yMax]}
              height={275}
              ariaLabel="2D Vector Field Cross-Section with Flux Box and Paddlewheel Probe"
              onSelectPoint={(wx, wy) => {
                setProbeX(wx);
                setProbeY(wy);
              }}
            >
              {({ toSvgX, toSvgY }) => {
                const bx0 = toSvgX(safeX - boxRadius);
                const bx1 = toSvgX(safeX + boxRadius);
                const by0 = toSvgY(safeY + boxRadius);
                const by1 = toSvgY(safeY - boxRadius);
                const cx = toSvgX(safeX);
                const cy = toSvgY(safeY);
                const wheelR = Math.max(10, Math.abs(bx1 - bx0) * 0.34);

                return (
                  <g>
                    {/* Field Arrows */}
                    {fieldArrows2D.map((a, idx) => (
                      <g key={idx}>
                        <line
                          x1={toSvgX(a.x)}
                          y1={toSvgY(a.y)}
                          x2={toSvgX(a.x + a.dx)}
                          y2={toSvgY(a.y + a.dy)}
                          stroke="#8D9FCE"
                          strokeWidth="1.5"
                          opacity="0.82"
                        />
                        <circle
                          cx={toSvgX(a.x + a.dx)}
                          cy={toSvgY(a.y + a.dy)}
                          r="2.1"
                          fill="#8D9FCE"
                        />
                      </g>
                    ))}

                    {/* Flux Probe Box */}
                    <rect
                      x={Math.min(bx0, bx1)}
                      y={Math.min(by0, by1)}
                      width={Math.abs(bx1 - bx0)}
                      height={Math.abs(by1 - by0)}
                      fill={localAnalysis.divF >= 0 ? "#D35323" : "#029091"}
                      fillOpacity="0.22"
                      stroke="#FBEAA4"
                      strokeWidth="2"
                    />

                    {/* Paddlewheel Blades */}
                    <line
                      x1={cx - wheelR}
                      y1={cy}
                      x2={cx + wheelR}
                      y2={cy}
                      stroke="#FBEAA4"
                      strokeWidth="2"
                    />
                    <line
                      x1={cx}
                      y1={cy - wheelR}
                      x2={cx}
                      y2={cy + wheelR}
                      stroke="#FBEAA4"
                      strokeWidth="2"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill="#D35323"
                      stroke="#1E1F22"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>
          </div>

          {/* Probe Controls */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--math-ink-x)]">
                  <span>x₀</span>
                  <span>{safeX.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={bounds.xMin}
                  max={bounds.xMax}
                  step={0.05}
                  value={safeX}
                  onChange={(e) => setProbeX(parseFloat(e.target.value))}
                  className="w-full accent-[#8D9FCE]"
                  aria-label="Probe box center x₀"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--math-ink-y)]">
                  <span>y₀</span>
                  <span>{safeY.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={bounds.yMin}
                  max={bounds.yMax}
                  step={0.05}
                  value={safeY}
                  onChange={(e) => setProbeY(parseFloat(e.target.value))}
                  className="w-full accent-[#96B898]"
                  aria-label="Probe box center y₀"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--math-ink-z)]">
                  <span>z₀</span>
                  <span>{safeZ.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-1.5}
                  max={1.5}
                  step={0.1}
                  value={safeZ}
                  onChange={(e) => setProbeZ(parseFloat(e.target.value))}
                  className="w-full accent-[#029091]"
                  aria-label="Probe box center z₀"
                />
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-diff)]">
                <span>Probe Box Half-Width h</span>
                <span>{boxRadius.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.18}
                max={0.6}
                step={0.02}
                value={boxRadius}
                onChange={(e) => setBoxRadius(parseFloat(e.target.value))}
                className="w-full accent-[#FBEAA4]"
                aria-label="Probe box half-width h"
              />
            </div>
          </div>

          {/* Physical Interpretation Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs font-tabular-mono">
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
              <div className="flex items-center gap-1.5 text-[var(--math-ink-sweep)]">
                <Wind className="w-3.5 h-3.5" />
                <span>DIVERGENCE ∇·F</span>
              </div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">
                {localAnalysis.divF.toFixed(3)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {Math.abs(localAnalysis.divF) < 1e-3
                  ? "Incompressible (Zero net flux)"
                  : localAnalysis.divF > 0
                  ? "Local Source (Net Outflow)"
                  : "Local Sink (Net Inflow)"}
              </div>
            </div>

            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
              <div className="flex items-center gap-1.5 text-[var(--math-ink-diff)]">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Z-CURL (∇×F)_z</span>
              </div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">
                {localAnalysis.curlZ.toFixed(3)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {Math.abs(localAnalysis.curlZ) < 1e-3
                  ? "Irrotational (No Spin)"
                  : localAnalysis.curlZ > 0
                  ? "CCW Spin (+z Vorticity)"
                  : "CW Spin (-z Vorticity)"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
