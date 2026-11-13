"use client";

import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Sparkles, Box, CircleDot } from "lucide-react";
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
  integrate3DIterated,
} from "@/components/visualizations/primitives";

type TheoremMode = "stokes" | "gauss";

export function StokesDivergenceLab() {
  const [mode, setMode] = useState<TheoremMode>("stokes");

  // Vector field F = <P, Q, R>
  const [pExpr, setPExpr] = useState<string>("-y + 0.4 * x");
  const [qExpr, setQExpr] = useState<string>("x + 0.4 * y");
  const [rExpr, setRExpr] = useState<string>("0.5 * z");

  // Stokes Soap-Film Dome Height Factor
  const [domeHeight, setDomeHeight] = useState<number>(1.0);
  const [rimRadius, setRimRadius] = useState<number>(1.2);

  // Gauss Control Box Half-Size
  const [boxHalf, setBoxHalf] = useState<number>(1.0);

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

  // 1. Stokes' Theorem Evaluation: Boundary Rim C (r(t) = <R cos t, R sin t, 0>) vs Soap-Film Cap S(r,t)
  const stokesStats = useMemo(() => {
    const rimCirculation = integrate1DGaussLegendre(
      (t) => {
        const x = rimRadius * Math.cos(t);
        const y = rimRadius * Math.sin(t);
        const dx = -rimRadius * Math.sin(t);
        const dy = rimRadius * Math.cos(t);
        const p = compiledP.evaluate({ x, y, z: 0 });
        const q = compiledQ.evaluate({ x, y, z: 0 });
        return p * dx + q * dy;
      },
      0,
      2 * Math.PI,
      24
    );

    // Surface integral of (curl F) · dS over paraboloid dome z(r) = H*(1 - (r/R)^2)
    const h = 1e-4;
    const evalCurl = (x: number, y: number, z: number): [number, number, number] => {
      const dRdy =
        (compiledR.evaluate({ x, y: y + h, z }) -
          compiledR.evaluate({ x, y: y - h, z })) /
        (2 * h);
      const dQdz =
        (compiledQ.evaluate({ x, y, z: z + h }) -
          compiledQ.evaluate({ x, y, z: z - h })) /
        (2 * h);
      const dPdz =
        (compiledP.evaluate({ x, y, z: z + h }) -
          compiledP.evaluate({ x, y, z: z - h })) /
        (2 * h);
      const dRdx =
        (compiledR.evaluate({ x: x + h, y, z }) -
          compiledR.evaluate({ x: x - h, y, z })) /
        (2 * h);
      const dQdx =
        (compiledQ.evaluate({ x: x + h, y, z }) -
          compiledQ.evaluate({ x: x - h, y, z })) /
        (2 * h);
      const dPdy =
        (compiledP.evaluate({ x, y: y + h, z }) -
          compiledP.evaluate({ x, y: y - h, z })) /
        (2 * h);
      return [dRdy - dQdz, dPdz - dRdx, dQdx - dPdy];
    };

    const surfaceCurlFlux = integrate2DIterated(
      (r, theta) => {
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const u = r / rimRadius;
        const z = domeHeight * (1 - u * u);
        // Surface normal dS = r_r x r_theta dr dtheta = <2 H r^2 cos t / R^2, 2 H r^2 sin t / R^2, r>
        const k = (2 * domeHeight * r * r) / (rimRadius * rimRadius);
        const nx = k * Math.cos(theta);
        const ny = k * Math.sin(theta);
        const nz = r;
        const [cx, cy, cz] = evalCurl(x, y, z);
        return cx * nx + cy * ny + cz * nz;
      },
      0,
      rimRadius,
      () => 0,
      () => 2 * Math.PI,
      16,
      24
    );

    return { rimCirculation, surfaceCurlFlux };
  }, [compiledP, compiledQ, compiledR, rimRadius, domeHeight]);

  // 2. Gauss Divergence Theorem Evaluation on Cube [-L, L]^3
  const gaussStats = useMemo(() => {
    const L = boxHalf;
    const h = 1e-4;

    const volumeDivergence = integrate3DIterated(
      (x, y, z) => {
        const dPdx =
          (compiledP.evaluate({ x: x + h, y, z }) -
            compiledP.evaluate({ x: x - h, y, z })) /
          (2 * h);
        const dQdy =
          (compiledQ.evaluate({ x, y: y + h, z }) -
            compiledQ.evaluate({ x, y: y - h, z })) /
          (2 * h);
        const dRdz =
          (compiledR.evaluate({ x, y, z: z + h }) -
            compiledR.evaluate({ x, y, z: z - h })) /
          (2 * h);
        return dPdx + dQdy + dRdz;
      },
      -L,
      L,
      () => -L,
      () => L,
      () => -L,
      () => L,
      10,
      10,
      10
    );

    // 6-Face Outward Surface Flux
    const fluxXPos = integrate2DIterated(
      (y, z) => compiledP.evaluate({ x: L, y, z }),
      -L,
      L,
      () => -L,
      () => L,
      12,
      12
    );
    const fluxXNeg = -integrate2DIterated(
      (y, z) => compiledP.evaluate({ x: -L, y, z }),
      -L,
      L,
      () => -L,
      () => L,
      12,
      12
    );
    const fluxYPos = integrate2DIterated(
      (x, z) => compiledQ.evaluate({ x, y: L, z }),
      -L,
      L,
      () => -L,
      () => L,
      12,
      12
    );
    const fluxYNeg = -integrate2DIterated(
      (x, z) => compiledQ.evaluate({ x, y: -L, z }),
      -L,
      L,
      () => -L,
      () => L,
      12,
      12
    );
    const fluxZPos = integrate2DIterated(
      (x, y) => compiledR.evaluate({ x, y, z: L }),
      -L,
      L,
      () => -L,
      () => L,
      12,
      12
    );
    const fluxZNeg = -integrate2DIterated(
      (x, y) => compiledR.evaluate({ x, y, z: -L }),
      -L,
      L,
      () => -L,
      () => L,
      12,
      12
    );

    const closedSurfaceFlux =
      fluxXPos + fluxXNeg + fluxYPos + fluxYNeg + fluxZPos + fluxZNeg;

    return {
      volumeDivergence,
      closedSurfaceFlux,
      xPair: fluxXPos + fluxXNeg,
      yPair: fluxYPos + fluxYNeg,
      zPair: fluxZPos + fluxZNeg,
    };
  }, [compiledP, compiledQ, compiledR, boxHalf]);

  return (
    <section
      aria-label="Stokes' Theorem and Gauss Divergence Theorem Unification Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#D35323] text-[#D35323] bg-[var(--bg-canvas)]">
              LAB 3.3.7 • STOKES&apos; &amp; GAUSS DIVERGENCE THEOREM UNIFICATION
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            {mode === "stokes" ? (
              <>
                Stokes&apos; Theorem: <KaTeXMath math="\iint_S (\nabla \times \mathbf{F})\cdot d\mathbf{S} = \oint_{\partial S} \mathbf{F}\cdot d\mathbf{r}" />
              </>
            ) : (
              <>
                Gauss&apos;s Divergence Theorem: <KaTeXMath math="\oiint_{\partial E} \mathbf{F}\cdot d\mathbf{S} = \iiint_E (\nabla \cdot \mathbf{F})\,dV" />
              </>
            )}
          </h2>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("stokes")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-tabular-mono border transition-colors ${
              mode === "stokes"
                ? "border-[#D35323] bg-[#D35323]/15 text-[var(--text-primary)] font-semibold"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
            }`}
          >
            <CircleDot className="w-3.5 h-3.5 text-[#D35323]" />
            Stokes&apos; Rim-Cap
          </button>
          <button
            type="button"
            onClick={() => setMode("gauss")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-tabular-mono border transition-colors ${
              mode === "gauss"
                ? "border-[#029091] bg-[#029091]/15 text-[var(--text-primary)] font-semibold"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
            }`}
          >
            <Box className="w-3.5 h-3.5 text-[#029091]" />
            Gauss Control Volume
          </button>
        </div>
      </div>

      {/* Custom 3D Vector Field Inputs */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <MathExpressionInput
          label="x-Component P(x, y, z):"
          prefixLatex="P ="
          value={pExpr}
          onChange={setPExpr}
          allowedVars={["x", "y", "z"]}
          compact
        />
        <MathExpressionInput
          label="y-Component Q(x, y, z):"
          prefixLatex="Q ="
          value={qExpr}
          onChange={setQExpr}
          allowedVars={["x", "y", "z"]}
          compact
        />
        <MathExpressionInput
          label="z-Component R(x, y, z):"
          prefixLatex="R ="
          value={rExpr}
          onChange={setRExpr}
          allowedVars={["x", "y", "z"]}
          compact
        />
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: 3D Viewport */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <ThreeOrbitViewport
            heightClassName="h-[390px] sm:h-[430px]"
            cameraPosition={[3.4, 2.7, 3.4]}
            cameraTarget={[0, 0.35, 0]}
            titleBadge={
              mode === "stokes"
                ? "3D Soap-Film Dome S Sharing Invariant Rim ∂S"
                : "3D Closed Control Volume E = [-L, L]³ & Outward Normals"
            }
            footerSlot={
              mode === "stokes" ? (
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                  <span className="text-[#D35323] font-semibold">
                    Rim ∮_∂S F·dr = {stokesStats.rimCirculation.toFixed(4)}
                  </span>
                  <span className="text-[#029091] font-semibold">
                    Cap ∬_S (∇×F)·dS = {stokesStats.surfaceCurlFlux.toFixed(4)}
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                  <span className="text-[#D35323] font-semibold">
                    Boundary ∯_∂E F·dS = {gaussStats.closedSurfaceFlux.toFixed(4)}
                  </span>
                  <span className="text-[#029091] font-semibold">
                    Interior ∭_E (∇·F) dV = {gaussStats.volumeDivergence.toFixed(4)}
                  </span>
                </div>
              )
            }
            sceneDeps={[
              mode,
              compiledP,
              compiledQ,
              compiledR,
              domeHeight,
              rimRadius,
              boxHalf,
            ]}
            onBuildScene={(group) => {
              if (mode === "stokes") {
                // 1. Deformable Soap-Film Dome S(r, theta)
                const dome = createParametricSurfaceMesh(
                  (r, theta) => {
                    const x = r * Math.cos(theta);
                    const y = r * Math.sin(theta);
                    const u = r / rimRadius;
                    const z = domeHeight * (1 - u * u);
                    return [x, y, z];
                  },
                  [0, rimRadius],
                  [0, 2 * Math.PI],
                  20,
                  36,
                  {
                    color: 0x029091,
                    opacity: 0.52,
                    wireframeColor: 0xfbeaa4,
                    wireframeOpacity: 0.22,
                    showWireframe: true,
                  }
                );
                group.add(dome);

                // 2. Fixed Boundary Rim ∂S at z = 0 in #D35323 Persimmon
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

                // Rim tangent arrows
                for (let k = 0; k < 4; k++) {
                  const t = (k * Math.PI) / 2;
                  const rx = rimRadius * Math.cos(t);
                  const ry = rimRadius * Math.sin(t);
                  group.add(
                    createVectorArrow3D(
                      [rx, ry, 0.02],
                      [-Math.sin(t), Math.cos(t), 0],
                      0.45,
                      0xd35323
                    )
                  );
                }
              } else {
                // Gauss Control Cube [-boxHalf, boxHalf]^3
                const s = boxHalf * 2;
                const geom = new THREE.BoxGeometry(s, s, s);
                const mat = new THREE.MeshBasicMaterial({
                  color: 0x029091,
                  transparent: true,
                  opacity: 0.24,
                  depthWrite: false,
                });
                group.add(new THREE.Mesh(geom, mat));
                group.add(
                  new THREE.LineSegments(
                    new THREE.EdgesGeometry(geom),
                    new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                  )
                );

                // 6 outward face normals
                const normals: [number, number, number][] = [
                  [1, 0, 0],
                  [-1, 0, 0],
                  [0, 1, 0],
                  [0, -1, 0],
                  [0, 0, 1],
                  [0, 0, -1],
                ];
                for (const [nx, ny, nz] of normals) {
                  group.add(
                    createVectorArrow3D(
                      [nx * boxHalf, ny * boxHalf, nz * boxHalf],
                      [nx, ny, nz],
                      0.48,
                      0xfbeaa4
                    )
                  );
                }
              }
            }}
          />

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <div className="overflow-x-auto py-1">
              {mode === "stokes" ? (
                <KaTeXMath
                  math={`\\underbrace{\\oint_{\\partial S} \\mathbf{F}\\cdot d\\mathbf{r}}_{\\color{#D35323}{${stokesStats.rimCirculation.toFixed(4)}}} \\;=\\; \\underbrace{\\iint_{S} (\\nabla \\times \\mathbf{F})\\cdot d\\mathbf{S}}_{\\color{#029091}{${stokesStats.surfaceCurlFlux.toFixed(4)}}}`}
                  block
                />
              ) : (
                <KaTeXMath
                  math={`\\underbrace{\\oiint_{\\partial E} \\mathbf{F}\\cdot d\\mathbf{S}}_{\\color{#D35323}{${gaussStats.closedSurfaceFlux.toFixed(4)}}} \\;=\\; \\underbrace{\\iiint_{E} (\\nabla \\cdot \\mathbf{F})\\,dV}_{\\color{#029091}{${gaussStats.volumeDivergence.toFixed(4)}}}`}
                  block
                />
              )}
            </div>
            <p className="font-math-serif text-sm text-[var(--text-secondary)]">
              {mode === "stokes"
                ? "Deform the soap-film dome height H ∈ [-1.4, 1.8]: no matter how steeply the cap bulges, the total curl flux through S stays locked to the boundary rim circulation!"
                : "Scale the control cube [-L, L]³: total outward surface flux across all 6 faces equals the volume integral of divergence inside the cube."}
            </p>
          </div>
        </div>

        {/* Right: Interactive Controls & Generalized Stokes Summary */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)]">
          {mode === "stokes" ? (
            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-tabular-mono text-[#029091]">
                  <span>Soap-Film Dome Height H (Surface Deformation)</span>
                  <span>H = {domeHeight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-1.4}
                  max={1.8}
                  step={0.05}
                  value={domeHeight}
                  onChange={(e) => setDomeHeight(parseFloat(e.target.value))}
                  className="w-full accent-[#029091]"
                />
              </div>

              <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex justify-between text-xs font-tabular-mono text-[#D35323]">
                  <span>Boundary Rim Radius R</span>
                  <span>R = {rimRadius.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.6}
                  step={0.05}
                  value={rimRadius}
                  onChange={(e) => setRimRadius(parseFloat(e.target.value))}
                  className="w-full accent-[#D35323]"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-tabular-mono text-[#029091]">
                  <span>Control Volume Half-Size L ([-L, L]³)</span>
                  <span>L = {boxHalf.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={1.5}
                  step={0.05}
                  value={boxHalf}
                  onChange={(e) => setBoxHalf(parseFloat(e.target.value))}
                  className="w-full accent-[#029091]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-tabular-mono pt-2 border-t border-[var(--border-subtle)]">
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                  <span className="text-[#8D9FCE] block text-[10px]">
                    ±x Faces
                  </span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    {gaussStats.xPair.toFixed(3)}
                  </span>
                </div>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                  <span className="text-[#96B898] block text-[10px]">
                    ±y Faces
                  </span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    {gaussStats.yPair.toFixed(3)}
                  </span>
                </div>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                  <span className="text-[#029091] block text-[10px]">
                    ±z Faces
                  </span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    {gaussStats.zPair.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Generalized Stokes' Theorem Unification Card */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-tabular-mono text-[#FBEAA4]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE GRAND UNIFICATION OF VECTOR CALCULUS</span>
            </div>
            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
              <KaTeXMath math="\int_{\partial \Omega} \omega = \int_{\Omega} d\omega" block />
            </div>
            <p className="font-math-serif text-xs text-[var(--text-secondary)] leading-relaxed">
              FTC (<KaTeXMath math="\int_a^b f' dx = f(b)-f(a)" />), Green&apos;s Theorem, Stokes&apos; Theorem, and Gauss&apos;s Divergence Theorem are all manifestations of one topological law: the integral of a derivative over the interior <KaTeXMath math="\Omega" /> equals the integral of the field over the boundary <KaTeXMath math="\partial \Omega" />.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
