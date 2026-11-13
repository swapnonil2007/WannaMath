"use client";

import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Compass, Layers } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  mathToThreeVec3,
  createParametricSurfaceMesh,
  createVectorArrow3D,
  integrate2DIterated,
} from "@/components/visualizations/primitives";

interface FluxSurfacePreset {
  id: string;
  name: string;
  badge: string;
  zExpr: string;
  pExpr: string;
  qExpr: string;
  rExpr: string;
  note: string;
}

const FLUX_PRESETS: FluxSurfacePreset[] = [
  {
    id: "paraboloid-upflow",
    name: "Paraboloid Canopy in Uniform Upflow: z = 1.4 - 0.35(x² + y²), F = ⟨0, 0, 1⟩",
    badge: "Cross-Section Flux = Area(R_xy)",
    zExpr: "1.4 - 0.35 * (x^2 + y^2)",
    pExpr: "0",
    qExpr: "0",
    rExpr: "1",
    note: "Because dS = ⟨-z_x, -z_y, 1⟩ dx dy, the vertical component of F = ⟨0,0,1⟩ dotted with dS equals 1 dx dy—so upward flux through any curved canopy equals the projected shadow area in the xy-plane!",
  },
  {
    id: "tilted-plane-radial",
    name: "Tilted Plane in Radial Wind: z = 0.6 + 0.3x + 0.2y, F = ⟨x, y, z⟩",
    badge: "Outward Radial Flux",
    zExpr: "0.6 + 0.3 * x + 0.2 * y",
    pExpr: "x",
    qExpr: "y",
    rExpr: "z",
    note: "Each surface patch has upward normal n = ⟨-0.3, -0.2, 1⟩/√1.13. Positive dot products F·n highlight patches where flow pierces upward through the plane.",
  },
  {
    id: "wave-membrane",
    name: "Oscillating Membrane: z = 0.7 + 0.35 cos(1.4x) cos(1.4y), F = ⟨0.3y, -0.3x, 1⟩",
    badge: "Swirling Updraft",
    zExpr: "0.7 + 0.35 * cos(1.4 * x) * cos(1.4 * y)",
    pExpr: "0.3 * y",
    qExpr: "-0.3 * x",
    rExpr: "1",
    note: "Shows how local surface tilt (-z_x, -z_y) couples with horizontal swirl components P and Q in F · (-z_x, -z_y, 1).",
  },
  {
    id: "saddle-funnel",
    name: "Hyperbolic Saddle Roof: z = 0.8 + 0.25(x² - y²), F = ⟨0.5x, -0.5y, 0.8⟩",
    badge: "Saddle Flux Balance",
    zExpr: "0.8 + 0.25 * (x^2 - y^2)",
    pExpr: "0.5 * x",
    qExpr: "-0.5 * y",
    rExpr: "0.8",
    note: "Toggle the orientation flip button to verify that reversing the surface normal n → -n negates the total volumetric flux Φ → -Φ.",
  },
];

export function SurfaceFluxLab() {
  const [presetId, setPresetId] = useState<string>("paraboloid-upflow");
  const [zExpr, setZExpr] = useState<string>(FLUX_PRESETS[0].zExpr);
  const [pExpr, setPExpr] = useState<string>(FLUX_PRESETS[0].pExpr);
  const [qExpr, setQExpr] = useState<string>(FLUX_PRESETS[0].qExpr);
  const [rExpr, setRExpr] = useState<string>(FLUX_PRESETS[0].rExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [flipNormal, setFlipNormal] = useState<boolean>(false);
  const [probeX, setProbeX] = useState<number>(0.45);
  const [probeY, setProbeY] = useState<number>(0.35);
  const [domainHalf, setDomainHalf] = useState<number>(1.2);

  const activePreset = useMemo(
    () => FLUX_PRESETS.find((p) => p.id === presetId) ?? FLUX_PRESETS[0],
    [presetId]
  );

  const compiledZ = useMemo(
    () => compileMathExpression(zExpr, ["x", "y"]),
    [zExpr]
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

  const handleSelectPreset = (p: FluxSurfacePreset) => {
    setPresetId(p.id);
    setZExpr(p.zExpr);
    setPExpr(p.pExpr);
    setQExpr(p.qExpr);
    setRExpr(p.rExpr);
    setIsCustom(false);
  };

  const sign = flipNormal ? -1 : 1;
  const safeProbeX = Math.max(-domainHalf, Math.min(domainHalf, probeX));
  const safeProbeY = Math.max(-domainHalf, Math.min(domainHalf, probeY));

  const fluxAnalysis = useMemo(() => {
    const h = 1e-4;
    const evalNormal = (x: number, y: number): [number, number, number] => {
      const zx =
        (compiledZ.evaluate({ x: x + h, y }) -
          compiledZ.evaluate({ x: x - h, y })) /
        (2 * h);
      const zy =
        (compiledZ.evaluate({ x, y: y + h }) -
          compiledZ.evaluate({ x, y: y - h })) /
        (2 * h);
      return [-sign * zx, -sign * zy, sign * 1];
    };

    const totalFlux = integrate2DIterated(
      (x, y) => {
        const z = compiledZ.evaluate({ x, y });
        const [nx, ny, nz] = evalNormal(x, y);
        const px = compiledP.evaluate({ x, y, z });
        const qy = compiledQ.evaluate({ x, y, z });
        const rz = compiledR.evaluate({ x, y, z });
        return px * nx + qy * ny + rz * nz;
      },
      -domainHalf,
      domainHalf,
      () => -domainHalf,
      () => domainHalf,
      20,
      20
    );

    const surfaceArea = integrate2DIterated(
      (x, y) => {
        const [nx, ny, nz] = evalNormal(x, y);
        return Math.hypot(nx, ny, nz);
      },
      -domainHalf,
      domainHalf,
      () => -domainHalf,
      () => domainHalf,
      20,
      20
    );

    const pz = compiledZ.evaluate({ x: safeProbeX, y: safeProbeY });
    const [pnx, pny, pnz] = evalNormal(safeProbeX, safeProbeY);
    const pMag = Math.hypot(pnx, pny, pnz) || 1;
    const fx = compiledP.evaluate({ x: safeProbeX, y: safeProbeY, z: pz });
    const fy = compiledQ.evaluate({ x: safeProbeX, y: safeProbeY, z: pz });
    const fz = compiledR.evaluate({ x: safeProbeX, y: safeProbeY, z: pz });
    const localFluxDensity = (fx * pnx + fy * pny + fz * pnz) / pMag;

    return {
      totalFlux,
      surfaceArea,
      pz,
      pnx,
      pny,
      pnz,
      unitNormal: [pnx / pMag, pny / pMag, pnz / pMag] as [number, number, number],
      fieldAtProbe: [fx, fy, fz] as [number, number, number],
      localFluxDensity,
    };
  }, [
    compiledZ,
    compiledP,
    compiledQ,
    compiledR,
    domainHalf,
    sign,
    safeProbeX,
    safeProbeY,
  ]);

  return (
    <section
      aria-label="Surface Integrals and Oriented Vector Flux Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#029091] text-[#029091] bg-[var(--bg-canvas)]">
              LAB 3.3.4 • ORIENTED SURFACE NORMAL &amp; VECTOR FLUX
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              {isCustom ? "Custom Surface & Field" : activePreset.badge}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Surface Flux <KaTeXMath math="\Phi = \iint_S \mathbf{F} \cdot \hat{\mathbf{n}}\,dS = \iint_{R_{xy}} \mathbf{F} \cdot (\mathbf{r}_x \times \mathbf{r}_y)\,dx\,dy" />
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FLUX_PRESETS.map((p) => {
            const active = !isCustom && p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "border-[#029091] bg-[#029091]/15 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                {p.name.split(":")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Surface & Vector Field Inputs */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <MathExpressionInput
          label="Surface z = g(x, y):"
          prefixLatex="z ="
          value={zExpr}
          onChange={(val) => {
            setZExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x", "y"]}
          compact
        />
        <MathExpressionInput
          label="Field P(x, y, z):"
          prefixLatex="P ="
          value={pExpr}
          onChange={(val) => {
            setPExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x", "y", "z"]}
          compact
        />
        <MathExpressionInput
          label="Field Q(x, y, z):"
          prefixLatex="Q ="
          value={qExpr}
          onChange={(val) => {
            setQExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x", "y", "z"]}
          compact
        />
        <MathExpressionInput
          label="Field R(x, y, z):"
          prefixLatex="R ="
          value={rExpr}
          onChange={(val) => {
            setRExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x", "y", "z"]}
          compact
        />
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <ThreeOrbitViewport
            heightClassName="h-[390px] sm:h-[430px]"
            cameraPosition={[3.3, 2.6, 3.3]}
            cameraTarget={[0, 0.4, 0]}
            titleBadge="3D Oriented Canopy S, Normal Vectors n (#FBEAA4) & Flow F (#D35323)"
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[#029091]">
                  Area(S) = {fluxAnalysis.surfaceArea.toFixed(3)}
                </span>
                <span className="text-[#D35323] font-semibold">
                  Total Flux Φ = {fluxAnalysis.totalFlux.toFixed(4)}
                </span>
                <span className="text-[#FBEAA4]">
                  Orientation: {flipNormal ? "Downward (-n)" : "Upward (+n)"}
                </span>
              </div>
            }
            sceneDeps={[
              compiledZ,
              compiledP,
              compiledQ,
              compiledR,
              domainHalf,
              flipNormal,
              safeProbeX,
              safeProbeY,
              fluxAnalysis,
            ]}
            onBuildScene={(group) => {
              // 1. Surface Canopy z = g(x,y)
              const surf = createParametricSurfaceMesh(
                (u, v) => {
                  const z = compiledZ.evaluate({ x: u, y: v });
                  return [u, v, Number.isFinite(z) ? Math.max(-2.5, Math.min(2.8, z)) : 0];
                },
                [-domainHalf, domainHalf],
                [-domainHalf, domainHalf],
                32,
                32,
                {
                  color: 0x029091,
                  opacity: 0.54,
                  wireframeColor: 0x8d9fce,
                  wireframeOpacity: 0.16,
                  showWireframe: true,
                }
              );
              group.add(surf);

              // 2. Lattice of surface unit normals (#FBEAA4) and field vectors (#D35323)
              const h = 1e-4;
              const steps = 4;
              for (let i = 0; i <= steps; i++) {
                const x = -domainHalf * 0.8 + (i / steps) * (1.6 * domainHalf);
                for (let j = 0; j <= steps; j++) {
                  const y = -domainHalf * 0.8 + (j / steps) * (1.6 * domainHalf);
                  const z = compiledZ.evaluate({ x, y });
                  if (!Number.isFinite(z)) continue;
                  const cz = Math.max(-2.5, Math.min(2.8, z));

                  const zx =
                    (compiledZ.evaluate({ x: x + h, y }) -
                      compiledZ.evaluate({ x: x - h, y })) /
                    (2 * h);
                  const zy =
                    (compiledZ.evaluate({ x, y: y + h }) -
                      compiledZ.evaluate({ x, y: y - h })) /
                    (2 * h);
                  const nx = -sign * zx;
                  const ny = -sign * zy;
                  const nz = sign * 1;
                  group.add(
                    createVectorArrow3D([x, y, cz], [nx, ny, nz], 0.42, 0xfbeaa4)
                  );

                  const fx = compiledP.evaluate({ x, y, z: cz });
                  const fy = compiledQ.evaluate({ x, y, z: cz });
                  const fz = compiledR.evaluate({ x, y, z: cz });
                  const fMag = Math.hypot(fx, fy, fz);
                  if (fMag > 1e-5) {
                    group.add(
                      createVectorArrow3D(
                        [x, y, cz],
                        [fx, fy, fz],
                        Math.min(0.65, 0.25 + 0.18 * fMag),
                        0xd35323
                      )
                    );
                  }
                }
              }

              // 3. Highlighted Probe Sphere
              const probeZ = Math.max(-2.5, Math.min(2.8, fluxAnalysis.pz));
              const marker = new THREE.Mesh(
                new THREE.SphereGeometry(0.065, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xfbeaa4 })
              );
              marker.position.copy(mathToThreeVec3(safeProbeX, safeProbeY, probeZ));
              group.add(marker);
            }}
          />

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <div className="overflow-x-auto py-1">
              <KaTeXMath
                math={`\\Phi = \\iint_S \\mathbf{F}\\cdot \\hat{\\mathbf{n}}\\,dS = \\color{#D35323}{${fluxAnalysis.totalFlux.toFixed(4)}}, \\qquad \\text{Area}(S) = \\color{#029091}{${fluxAnalysis.surfaceArea.toFixed(4)}}`}
                block
              />
            </div>
            <p className="font-math-serif text-sm text-[var(--text-secondary)]">
              {isCustom
                ? "Yellow arrows show the unit surface normal n̂; Persimmon arrows show the vector field F. Flipping orientation negates the flux Φ."
                : activePreset.note}
            </p>
          </div>
        </div>

        {/* Right: Orientation, Domain & Probe Controls */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)]">
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#FBEAA4]" />
                Surface Orientation
              </span>
              <button
                type="button"
                onClick={() => setFlipNormal((v) => !v)}
                className={`px-3 py-1.5 text-xs font-tabular-mono border transition-colors ${
                  flipNormal
                    ? "border-[#D5658B] text-[#D5658B] bg-[#D5658B]/15"
                    : "border-[#029091] text-[#029091] bg-[#029091]/15"
                }`}
              >
                {flipNormal ? "Flipped (-n̂ Downward)" : "Standard (+n̂ Upward)"}
              </button>
            </div>

            <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex justify-between text-xs font-tabular-mono text-[#8D9FCE]">
                <span>Shadow Half-Width L (x,y ∈ [-L, L])</span>
                <span>L = {domainHalf.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={1.7}
                step={0.1}
                value={domainHalf}
                onChange={(e) => setDomainHalf(parseFloat(e.target.value))}
                className="w-full accent-[#8D9FCE]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-subtle)]">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-tabular-mono text-[#8D9FCE]">
                  <span>Probe x₀</span>
                  <span>{safeProbeX.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-domainHalf}
                  max={domainHalf}
                  step={0.05}
                  value={safeProbeX}
                  onChange={(e) => setProbeX(parseFloat(e.target.value))}
                  className="w-full accent-[#8D9FCE]"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-tabular-mono text-[#96B898]">
                  <span>Probe y₀</span>
                  <span>{safeProbeY.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-domainHalf}
                  max={domainHalf}
                  step={0.05}
                  value={safeProbeY}
                  onChange={(e) => setProbeY(parseFloat(e.target.value))}
                  className="w-full accent-[#96B898]"
                />
              </div>
            </div>
          </div>

          {/* Local Probe Readouts */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-tabular-mono text-[#029091]">
              <Layers className="w-3.5 h-3.5" />
              <span>LOCAL PATCH INSPECTION AT ({safeProbeX.toFixed(2)}, {safeProbeY.toFixed(2)})</span>
            </div>
            <div className="space-y-2 text-xs font-tabular-mono">
              <div className="flex justify-between p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[#FBEAA4]">Unit Normal n̂</span>
                <span className="text-[var(--text-primary)]">
                  ⟨{fluxAnalysis.unitNormal[0].toFixed(2)}, {fluxAnalysis.unitNormal[1].toFixed(2)}, {fluxAnalysis.unitNormal[2].toFixed(2)}⟩
                </span>
              </div>
              <div className="flex justify-between p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[#D35323]">Vector Field F</span>
                <span className="text-[var(--text-primary)]">
                  ⟨{fluxAnalysis.fieldAtProbe[0].toFixed(2)}, {fluxAnalysis.fieldAtProbe[1].toFixed(2)}, {fluxAnalysis.fieldAtProbe[2].toFixed(2)}⟩
                </span>
              </div>
              <div className="flex justify-between p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[#96B898]">Local Flux Density F · n̂</span>
                <span className="text-[#96B898] font-semibold">
                  {fluxAnalysis.localFluxDensity.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
