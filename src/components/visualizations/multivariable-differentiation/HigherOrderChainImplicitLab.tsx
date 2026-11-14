"use client";

import React, { useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { GitBranch, Layers, ShieldAlert } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  SvgCoordinatePlane2D,
  ThreeOrbitViewport,
  createParametricSurfaceMesh,
  computePartialDerivatives2D,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

type LabMode = "mixed-partials" | "chain-rule" | "implicit";

export function HigherOrderChainImplicitLab() {
  const [mode, setMode] = useState<LabMode>("mixed-partials");

  // Mode 1: Mixed Partials & Clairaut Symmetry
  const [useCounterexample, setUseCounterexample] = useState<boolean>(false);
  const [px, setPx] = useState<number>(0.45);
  const [py, setPy] = useState<number>(0.35);

  // Mode 2: Multivariable Chain Rule z = f(x(t), y(t))
  const [chainT, setChainT] = useState<number>(0.8);
  const [chainPreset, setChainPreset] = useState<"circle" | "spiral">("circle");

  // Mode 3: Implicit Surface F(x, y, z) = x^2/a + y^2/b + z^2 - 1.44 = 0
  const [impX, setImpX] = useState<number>(0.45);
  const [impY, setImpY] = useState<number>(0.35);
  const [impUpperHemisphere, setImpUpperHemisphere] = useState<boolean>(true);

  const mixedStats = useMemo(() => {
    const fn = (x: number, y: number): number => {
      if (useCounterexample) {
        const r2 = x * x + y * y;
        return r2 < 1e-10 ? 0 : (x * y * (x * x - y * y)) / r2;
      }
      return Math.sin(x * y) + 0.35 * x * x * y;
    };

    const h = 0.008;
    const f0 = fn(px, py);
    const { fx, fy } = computePartialDerivatives2D(fn, px, py, 0.004);
    const fxx = (fn(px + h, py) - 2 * f0 + fn(px - h, py)) / (h * h);
    const fyy = (fn(px, py + h) - 2 * f0 + fn(px, py - h)) / (h * h);

    // Compute d/dy(f_x) vs d/dx(f_y) directly so counterexample asymmetry at (0,0) shows clearly!
    const fxAt = (x: number, y: number) =>
      (fn(x + 1e-4, y) - fn(x - 1e-4, y)) / 2e-4;
    const fyAt = (x: number, y: number) =>
      (fn(x, y + 1e-4) - fn(x, y - 1e-4)) / 2e-4;

    const fxy = (fxAt(px, py + h) - fxAt(px, py - h)) / (2 * h);
    const fyx = (fyAt(px + h, py) - fyAt(px - h, py)) / (2 * h);

    return {
      f0,
      fx,
      fy,
      fxx,
      fyy,
      fxy,
      fyx,
      clairautGap: Math.abs(fxy - fyx),
    };
  }, [px, py, useCounterexample]);

  const chainStats = useMemo(() => {
    // Field z = f(x, y) = 0.5*x^2 - 0.3*y^2 + 0.4*x*y
    const evalF = (x: number, y: number) => 0.5 * x * x - 0.3 * y * y + 0.4 * x * y;
    const path = (t: number): [number, number] => {
      if (chainPreset === "circle") {
        return [1.1 * Math.cos(t), 1.1 * Math.sin(t)];
      }
      return [0.45 * t * Math.cos(t), 0.45 * t * Math.sin(t)];
    };

    const dt = 0.001;
    const [x, y] = path(chainT);
    const [xp, yp] = path(chainT + dt);
    const [xm, ym] = path(chainT - dt);
    const dxdt = (xp - xm) / (2 * dt);
    const dydt = (yp - ym) / (2 * dt);

    const { fx, fy } = computePartialDerivatives2D(evalF, x, y, 0.002);
    const dzdtChain = fx * dxdt + fy * dydt;
    const zVal = evalF(x, y);

    const curvePts: [number, number][] = [];
    for (let i = 0; i <= 100; i++) {
      const t = chainPreset === "circle" ? (i / 100) * Math.PI * 2 : (i / 100) * 3.0;
      curvePts.push(path(t));
    }

    return {
      x,
      y,
      zVal,
      fx,
      fy,
      dxdt,
      dydt,
      dzdtChain,
      xTerm: fx * dxdt,
      yTerm: fy * dydt,
      curvePts,
    };
  }, [chainPreset, chainT]);

  const implicitStats = useMemo(() => {
    // Implicit ellipsoid: F(x, y, z) = 0.7x^2 + 0.9y^2 + z^2 - 1.44 = 0
    const rhs = 1.44 - (0.7 * impX * impX + 0.9 * impY * impY);
    const valid = rhs > 0.02;
    const zAbs = valid ? Math.sqrt(rhs) : 0;
    const z = impUpperHemisphere ? zAbs : -zAbs;

    const Fx = 1.4 * impX;
    const Fy = 1.8 * impY;
    const Fz = 2 * z;

    const dzdx = Math.abs(Fz) > 1e-4 ? -Fx / Fz : NaN;
    const dzdy = Math.abs(Fz) > 1e-4 ? -Fy / Fz : NaN;

    return {
      valid,
      z,
      Fx,
      Fy,
      Fz,
      dzdx,
      dzdy,
    };
  }, [impUpperHemisphere, impX, impY]);

  const buildImplicitScene = useCallback(
    (dynamicGroup: THREE.Group) => {
      // Upper and lower shells of ellipsoid 0.7x^2 + 0.9y^2 + z^2 = 1.44
      const rx = Math.sqrt(1.44 / 0.7);
      const ry = Math.sqrt(1.44 / 0.9);
      const rz = 1.2;

      const shell = createParametricSurfaceMesh(
        (phi, theta) => [
          rx * Math.sin(phi) * Math.cos(theta),
          ry * Math.sin(phi) * Math.sin(theta),
          rz * Math.cos(phi),
        ],
        [0.02, Math.PI - 0.02],
        [0, Math.PI * 2],
        28,
        36,
        {
          color: 0x029091,
          opacity: 0.48,
          wireframeColor: 0xfbeaa4,
          wireframeOpacity: 0.2,
          showWireframe: true,
        }
      );
      dynamicGroup.add(shell);

      // Equator horizon curve where F_z = 0 (implicit theorem singularity)
      const eqPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        eqPts.push(mathToThreeVec3(rx * Math.cos(th), ry * Math.sin(th), 0));
      }
      dynamicGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(eqPts),
          new THREE.LineBasicMaterial({ color: 0xb95869 })
        )
      );

      if (implicitStats.valid) {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xd35323 })
        );
        dot.position.copy(mathToThreeVec3(impX, impY, implicitStats.z));
        dynamicGroup.add(dot);
      }
    },
    [impX, impY, implicitStats.valid, implicitStats.z]
  );

  return (
    <section
      aria-label="Higher-Order Partials, Chain Rule and Implicit Differentiation Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[var(--bg-canvas)]">
              LAB 3.1.2B • HIGHER-ORDER PARTIALS, CHAIN RULE &amp; IMPLICIT SURFACES
            </span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
            Deep Dive: Mixed Partials, Dependency Trees &amp; Implicit Slopes −Fₓ / F_z
          </h3>
        </div>

        {/* Mode Switcher */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "mixed-partials", label: "1. Mixed Partials & Clairaut", icon: Layers },
            { id: "chain-rule", label: "2. Chain Rule Tree", icon: GitBranch },
            { id: "implicit", label: "3. Implicit Surface F=0", icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id as LabMode)}
                className={`px-3 py-1.5 text-xs font-sans border inline-flex items-center gap-1.5 ${
                  active
                    ? "border-[var(--math-ink-y)] bg-[#96B898]/15 text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode 1: Mixed Partials & Clairaut Symmetry */}
      {mode === "mixed-partials" && (
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className="space-y-1">
              <div className="text-xs font-sans font-semibold text-[var(--text-primary)]">
                Surface Selection:{" "}
                <KaTeXMath
                  math={
                    useCounterexample
                      ? "f(x,y) = \\frac{xy(x^2-y^2)}{x^2+y^2},\\; f(0,0)=0"
                      : "f(x,y) = \\sin(xy) + 0.35 x^2 y"
                  }
                />
              </div>
              <p className="text-xs font-serif text-[var(--text-secondary)]">
                {useCounterexample
                  ? "Classic Peano counterexample: away from (0,0) f_xy = f_yx, but at (0,0) continuity fails and f_xy(0,0) = -1 ≠ +1 = f_yx(0,0)!"
                  : "Smooth C² function everywhere: Clairaut's Theorem guarantees f_xy = f_yx identically."}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUseCounterexample(false)}
                className={`px-3 py-1.5 text-xs font-sans border ${
                  !useCounterexample
                    ? "border-[var(--math-ink-y)] bg-[#96B898]/15 text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)]"
                }`}
              >
                Smooth C² Example
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseCounterexample(true);
                  setPx(0);
                  setPy(0);
                }}
                className={`px-3 py-1.5 text-xs font-sans border ${
                  useCounterexample
                    ? "border-[var(--math-ink-upper)] bg-[#B95869]/15 text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)]"
                }`}
              >
                Clairaut Counterexample at (0, 0)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[var(--text-secondary)]">Probe x₀</span>
                <span className="font-tabular-mono text-[var(--math-ink-x)]">
                  {px.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={-1.2}
                max={1.2}
                step={0.05}
                value={px}
                aria-label="Probe coordinate x"
                onChange={(e) => setPx(parseFloat(e.target.value))}
                className="w-full accent-[#8D9FCE]"
              />
            </div>

            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[var(--text-secondary)]">Probe y₀</span>
                <span className="font-tabular-mono text-[var(--math-ink-y)]">
                  {py.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={-1.2}
                max={1.2}
                step={0.05}
                value={py}
                aria-label="Probe coordinate y"
                onChange={(e) => setPy(parseFloat(e.target.value))}
                className="w-full accent-[#96B898]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <div className="text-[11px] text-[var(--text-muted)]">f_xx</div>
              <div className="mt-1 text-base font-tabular-mono text-[var(--math-ink-x)]">
                {mixedStats.fxx.toFixed(4)}
              </div>
            </div>
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <div className="text-[11px] text-[var(--text-muted)]">f_yy</div>
              <div className="mt-1 text-base font-tabular-mono text-[var(--math-ink-y)]">
                {mixedStats.fyy.toFixed(4)}
              </div>
            </div>
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <div className="text-[11px] text-[var(--text-muted)]">
                Mixed f_xy = ∂/∂y(f_x)
              </div>
              <div className="mt-1 text-base font-tabular-mono text-[var(--math-ink-sweep)]">
                {mixedStats.fxy.toFixed(4)}
              </div>
            </div>
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <div className="text-[11px] text-[var(--text-muted)]">
                Mixed f_yx = ∂/∂x(f_y)
              </div>
              <div className="mt-1 text-base font-tabular-mono text-[var(--math-ink-diff)]">
                {mixedStats.fyx.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Multivariable Chain Rule Tree */}
      {mode === "chain-rule" && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
                Trajectory (x(t), y(t)) in Domain
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setChainPreset("circle")}
                  className={`px-2.5 py-1 text-xs font-sans border ${
                    chainPreset === "circle"
                      ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/15 text-[var(--text-primary)]"
                      : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
                  }`}
                >
                  Circle (1.1cos t, 1.1sin t)
                </button>
                <button
                  type="button"
                  onClick={() => setChainPreset("spiral")}
                  className={`px-2.5 py-1 text-xs font-sans border ${
                    chainPreset === "spiral"
                      ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/15 text-[var(--text-primary)]"
                      : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
                  }`}
                >
                  Spiral 0.45t(cos t, sin t)
                </button>
              </div>
            </div>

            <SvgCoordinatePlane2D
              xRange={[-1.5, 1.5]}
              yRange={[-1.5, 1.5]}
              width={360}
              height={280}
              xLabel="x"
              yLabel="y"
              xColor="#8D9FCE"
              yColor="#96B898"
              ariaLabel="Parametric trajectory in xy-plane"
            >
              {({ toSvgX, toSvgY }) => {
                const poly = chainStats.curvePts
                  .map(
                    ([cx, cy]) =>
                      `${toSvgX(cx).toFixed(1)},${toSvgY(cy).toFixed(1)}`
                  )
                  .join(" ");
                return (
                  <>
                    <polyline
                      points={poly}
                      fill="none"
                      stroke="#029091"
                      strokeWidth={2}
                    />
                    {/* Velocity vector dx/dt, dy/dt */}
                    <line
                      x1={toSvgX(chainStats.x)}
                      y1={toSvgY(chainStats.y)}
                      x2={toSvgX(chainStats.x + 0.32 * chainStats.dxdt)}
                      y2={toSvgY(chainStats.y + 0.32 * chainStats.dydt)}
                      stroke="#D35323"
                      strokeWidth={2.2}
                    />
                    <circle
                      cx={toSvgX(chainStats.x)}
                      cy={toSvgY(chainStats.y)}
                      r={5}
                      fill="#FBEAA4"
                    />
                  </>
                );
              }}
            </SvgCoordinatePlane2D>

            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[var(--text-secondary)]">Parameter t</span>
                <span className="font-tabular-mono text-[var(--math-ink-sweep)]">
                  t = {chainT.toFixed(2)} rad
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={chainPreset === "circle" ? 6.28 : 2.9}
                step={0.05}
                value={chainT}
                aria-label="Chain rule parameter t"
                onChange={(e) => setChainT(parseFloat(e.target.value))}
                className="w-full accent-[#D35323]"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              Live Chain Rule Dependency Tree: z = 0.5x² − 0.3y² + 0.4xy
            </h4>

            {/* Visual Tree Card */}
            <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-4">
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-center text-xs overflow-x-auto">
                <KaTeXMath math="\frac{dz}{dt} = \color{#8D9FCE}{\frac{\partial z}{\partial x}\frac{dx}{dt}} + \color{#96B898}{\frac{\partial z}{\partial y}\frac{dy}{dt}}" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tabular-mono">
                <div className="p-3 border border-[var(--math-ink-x)]/50 bg-[var(--bg-panel)] space-y-1">
                  <div className="text-[var(--math-ink-x)] font-semibold">
                    x-Channel Contribution
                  </div>
                  <div>∂z/∂x = {chainStats.fx.toFixed(3)}</div>
                  <div>dx/dt = {chainStats.dxdt.toFixed(3)}</div>
                  <div className="pt-1 border-t border-[var(--border-subtle)] text-[var(--math-ink-x)]">
                    Product = {chainStats.xTerm.toFixed(4)}
                  </div>
                </div>

                <div className="p-3 border border-[var(--math-ink-y)]/50 bg-[var(--bg-panel)] space-y-1">
                  <div className="text-[var(--math-ink-y)] font-semibold">
                    y-Channel Contribution
                  </div>
                  <div>∂z/∂y = {chainStats.fy.toFixed(3)}</div>
                  <div>dy/dt = {chainStats.dydt.toFixed(3)}</div>
                  <div className="pt-1 border-t border-[var(--border-subtle)] text-[var(--math-ink-y)]">
                    Product = {chainStats.yTerm.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="p-3 border border-[var(--math-ink-sweep)]/60 bg-[var(--bg-panel)] flex items-center justify-between font-tabular-mono text-sm">
                <span className="text-[var(--text-secondary)]">
                  Total Rate dz/dt =
                </span>
                <span className="text-[var(--math-ink-sweep)] font-semibold">
                  {chainStats.dzdtChain.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Implicit Surface F(x,y,z) = 0 */}
      {mode === "implicit" && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ThreeOrbitViewport
              heightClassName="h-[320px]"
              cameraPosition={[2.6, 2.1, 2.6]}
              cameraTarget={[0, 0, 0]}
              titleBadge="Implicit Ellipsoid 0.7x² + 0.9y² + z² = 1.44 (Crimson Equator: F_z = 0)"
              axesOptions={{
                gridExtent: 3.0,
                gridDivisions: 8,
                axisLength: 1.6,
              }}
              onBuildScene={buildImplicitScene}
              sceneDeps={[buildImplicitScene]}
            />
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs overflow-x-auto">
              <KaTeXMath
                math="\frac{\partial z}{\partial x} = -\frac{F_x}{F_z}, \qquad \frac{\partial z}{\partial y} = -\frac{F_y}{F_z} \quad (F_z \neq 0)"
                block
              />
            </div>

            <div className="space-y-3">
              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-[var(--text-secondary)]">x coordinate</span>
                  <span className="font-tabular-mono text-[var(--math-ink-x)]">
                    {impX.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={-1.35}
                  max={1.35}
                  step={0.05}
                  value={impX}
                  aria-label="Implicit surface x"
                  onChange={(e) => setImpX(parseFloat(e.target.value))}
                  className="w-full accent-[#8D9FCE]"
                />
              </div>

              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-[var(--text-secondary)]">y coordinate</span>
                  <span className="font-tabular-mono text-[var(--math-ink-y)]">
                    {impY.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={-1.2}
                  max={1.2}
                  step={0.05}
                  value={impY}
                  aria-label="Implicit surface y"
                  onChange={(e) => setImpY(parseFloat(e.target.value))}
                  className="w-full accent-[#96B898]"
                />
              </div>

              <button
                type="button"
                onClick={() => setImpUpperHemisphere((v) => !v)}
                className="w-full py-2 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)]"
              >
                Active Sheet: {impUpperHemisphere ? "Upper Hemisphere (z > 0)" : "Lower Hemisphere (z < 0)"}
              </button>
            </div>

            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1 text-xs font-tabular-mono">
              {implicitStats.valid ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Solved z(x, y):</span>
                    <span className="text-[var(--math-ink-z)]">
                      {implicitStats.z.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">∂z/∂x = −Fₓ/F_z:</span>
                    <span className="text-[var(--math-ink-x)]">
                      {Number.isFinite(implicitStats.dzdx)
                        ? implicitStats.dzdx.toFixed(4)
                        : "Vertical (F_z = 0)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">∂z/∂y = −F_y/F_z:</span>
                    <span className="text-[var(--math-ink-y)]">
                      {Number.isFinite(implicitStats.dzdy)
                        ? implicitStats.dzdy.toFixed(4)
                        : "Vertical (F_z = 0)"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-[var(--math-ink-upper)]">
                  (x, y) outside ellipsoid domain (F_z = 0 equator crossed).
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
