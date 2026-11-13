"use client";

import React, { useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  integrate1DGaussLegendre,
} from "@/components/visualizations/primitives";

type SlicingMethod = "washer" | "shell";

interface RevolutionPreset {
  id: string;
  label: string;
  axis: "x" | "y";
  a: number;
  b: number;
  outerRadius: (x: number) => number;
  innerRadius: (x: number) => number;
  yRange: [number, number];
  note: string;
}

const REV_PRESETS: RevolutionPreset[] = [
  {
    id: "paraboloid",
    label: "Paraboloid Bowl: y = √x around x-axis",
    axis: "x",
    a: 0.0,
    b: 2.4,
    outerRadius: (x) => Math.sqrt(Math.max(0, x)),
    innerRadius: () => 0,
    yRange: [-0.2, 2.0],
    note: "Revolving y = √x around the x-axis produces a circular paraboloid of exact volume ∫₀²·⁴ πx dx = π(2.4)²/2 ≈ 9.048.",
  },
  {
    id: "washer-cone",
    label: "Annular Washer: R(x)=1.6, r(x)=0.5x (x-axis)",
    axis: "x",
    a: 0.0,
    b: 2.2,
    outerRadius: () => 1.6,
    innerRadius: (x) => 0.5 * x,
    yRange: [-0.2, 2.0],
    note: "Subtracting the inner cone radius r(x) = 0.5x from outer cylinder R(x) = 1.6 yields circular washer slices with area π(R² - r²).",
  },
  {
    id: "bundt-shell",
    label: "Bundt Shell: y = 0.7 + 0.55sin(2.5x) around y-axis",
    axis: "y",
    a: 0.35,
    b: 2.2,
    outerRadius: (x) => 0.7 + 0.55 * Math.sin(2.5 * x),
    innerRadius: () => 0,
    yRange: [-0.2, 1.8],
    note: "Revolving around the vertical axis turns each vertical strip x ∈ [x₀, x₀+dx] into a concentric cylindrical shell of circumference 2πx and height f(x)!",
  },
];

export function SolidOfRevolutionLab() {
  const [presetId, setPresetId] = useState<string>("washer-cone");
  const preset = useMemo(
    () => REV_PRESETS.find((p) => p.id === presetId) ?? REV_PRESETS[0],
    [presetId]
  );

  const [sweepDeg, setSweepDeg] = useState<number>(270);
  const [sliceMethod, setSliceMethod] = useState<SlicingMethod>("washer");
  const [elemPos, setElemPos] = useState<number>(0.45);

  const handleSelectPreset = (p: RevolutionPreset) => {
    setPresetId(p.id);
    setSliceMethod(p.axis === "y" ? "shell" : "washer");
  };

  const activeX = preset.a + elemPos * (preset.b - preset.a);

  const metrics = useMemo(() => {
    const vol =
      preset.axis === "x"
        ? integrate1DGaussLegendre(
            (x) =>
              Math.PI *
              (Math.pow(preset.outerRadius(x), 2) -
                Math.pow(preset.innerRadius(x), 2)),
            preset.a,
            preset.b,
            24
          )
        : integrate1DGaussLegendre(
            (x) =>
              2 *
              Math.PI *
              x *
              (preset.outerRadius(x) - preset.innerRadius(x)),
            preset.a,
            preset.b,
            24
          );

    const rOut = preset.outerRadius(activeX);
    const rIn = preset.innerRadius(activeX);
    const crossPtsTop: [number, number][] = [];
    const crossPtsBot: [number, number][] = [];

    for (let i = 0; i <= 100; i++) {
      const px = preset.a + ((preset.b - preset.a) * i) / 100;
      crossPtsTop.push([px, preset.outerRadius(px)]);
      crossPtsBot.push([px, preset.innerRadius(px)]);
    }

    return { vol, rOut, rIn, crossPtsTop, crossPtsBot };
  }, [preset, activeX]);

  const handleBuildScene = useCallback(
    (dynamicGroup: THREE.Group) => {
      const phi = (sweepDeg * Math.PI) / 180;
      const samples = 44;

      // Build outer & inner revolved surfaces via LatheGeometry (lathe rotates around Three.js Y-axis)
      const outerPoints: THREE.Vector2[] = [];
      const innerPoints: THREE.Vector2[] = [];
      for (let i = 0; i <= samples; i++) {
        const x = preset.a + ((preset.b - preset.a) * i) / samples;
        const ro = Math.max(0.001, preset.outerRadius(x));
        const ri = Math.max(0.001, preset.innerRadius(x));
        if (preset.axis === "x") {
          outerPoints.push(new THREE.Vector2(ro, x));
          innerPoints.push(new THREE.Vector2(ri, x));
        } else {
          outerPoints.push(new THREE.Vector2(x, ro));
          innerPoints.push(new THREE.Vector2(x, ri));
        }
      }

      const outerGeo = new THREE.LatheGeometry(outerPoints, 48, 0, phi);
      const outerMat = new THREE.MeshPhongMaterial({
        color: 0x029091,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
        shininess: 35,
      });
      const outerMesh = new THREE.Mesh(outerGeo, outerMat);
      if (preset.axis === "x") outerMesh.rotation.z = -Math.PI / 2;
      dynamicGroup.add(outerMesh);

      if (preset.innerRadius(0.5 * (preset.a + preset.b)) > 0.02) {
        const innerGeo = new THREE.LatheGeometry(innerPoints, 48, 0, phi);
        const innerMat = new THREE.MeshPhongMaterial({
          color: 0x8d9fce,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide,
        });
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        if (preset.axis === "x") innerMesh.rotation.z = -Math.PI / 2;
        dynamicGroup.add(innerMesh);
      }

      // Active differential element highlight (#D35323 Persimmon)
      const elemMat = new THREE.MeshPhongMaterial({
        color: 0xd35323,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });

      const rO = Math.max(0.02, preset.outerRadius(activeX));
      const rI = Math.max(0.0, preset.innerRadius(activeX));

      if (sliceMethod === "washer" && preset.axis === "x") {
        // Vertical annulus slice perpendicular to x-axis at x = activeX
        const ringGeo = new THREE.RingGeometry(rI, rO, 48, 1, 0, phi);
        const ringMesh = new THREE.Mesh(ringGeo, elemMat);
        ringMesh.position.set(activeX, 0, 0);
        ringMesh.rotation.y = Math.PI / 2;
        dynamicGroup.add(ringMesh);
      } else if (preset.axis === "y") {
        // Concentric cylindrical shell around vertical Math z-axis (Three.js Y-axis)
        const h = Math.max(0.05, rO - rI);
        const shellGeo = new THREE.CylinderGeometry(
          activeX,
          activeX,
          h,
          48,
          1,
          true,
          0,
          phi
        );
        const shellMesh = new THREE.Mesh(shellGeo, elemMat);
        shellMesh.position.set(0, rI + h / 2, 0);
        dynamicGroup.add(shellMesh);
      } else {
        // Horizontal cylindrical shell around Math x-axis at radius r = lerp(rI, rO, elemPos)
        const shellR = Math.max(0.08, rI + elemPos * (rO - rI));
        const len = preset.b - preset.a;
        const shellGeo = new THREE.CylinderGeometry(
          shellR,
          shellR,
          len,
          48,
          1,
          true,
          0,
          phi
        );
        const shellMesh = new THREE.Mesh(shellGeo, elemMat);
        shellMesh.rotation.z = -Math.PI / 2;
        shellMesh.position.set(preset.a + len / 2, 0, 0);
        dynamicGroup.add(shellMesh);
      }
    },
    [preset, sweepDeg, sliceMethod, activeX, elemPos]
  );

  const toPoly = (
    pts: [number, number][],
    toSvgX: (x: number) => number,
    toSvgY: (y: number) => number
  ) =>
    pts
      .map(([px, py]) => `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`)
      .join(" ");

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[#029091]">
            <span>Lab 1.3.4A</span>
            <span>•</span>
            <span>3D Solids of Revolution</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            3D Solid of Revolution: Washer Disks vs. Cylindrical Shells
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Carve open the 3D cutaway revolution angle{" "}
            <KaTeXMath math="\phi \in [30^\circ, 360^\circ]" /> and scrub the
            active persimmon differential slice (<KaTeXMath math="dV" />) across
            the 2D generating profile.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSweepDeg(270);
            setElemPos(0.45);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset View
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {REV_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelectPreset(p)}
            className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
              p.id === preset.id
                ? "border-[#029091] bg-[var(--bg-canvas)] text-[#029091] font-medium"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Revolution Sweep φ</span>
            <span className="font-tabular-mono text-[#029091]">
              {sweepDeg}°
            </span>
          </div>
          <input
            type="range"
            min={30}
            max={360}
            step={5}
            value={sweepDeg}
            onChange={(e) => setSweepDeg(Number(e.target.value))}
            aria-label="Revolution sweep angle"
            className="w-full accent-[#029091]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Active Slice Position</span>
            <span className="font-tabular-mono text-[#D35323]">
              x₀ = {activeX.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.05}
            max={0.95}
            step={0.02}
            value={elemPos}
            onChange={(e) => setElemPos(Number(e.target.value))}
            aria-label="Active differential element position"
            className="w-full accent-[#D35323]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSliceMethod("washer")}
            disabled={preset.axis === "y"}
            className={`px-3 py-1.5 text-xs font-sans border ${
              sliceMethod === "washer"
                ? "border-[#D35323] bg-[#D35323] text-[#FFFBE4]"
                : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] disabled:opacity-40"
            }`}
          >
            Washer Slice
          </button>
          <button
            type="button"
            onClick={() => setSliceMethod("shell")}
            className={`px-3 py-1.5 text-xs font-sans border ${
              sliceMethod === "shell"
                ? "border-[#D35323] bg-[#D35323] text-[#FFFBE4]"
                : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)]"
            }`}
          >
            Cylindrical Shell
          </button>
        </div>
      </div>

      {/* 2D Profile + 3D Solid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            1. 2D Generating Cross-Section
          </span>
          <SvgCoordinatePlane2D
            xRange={[preset.a - 0.2, preset.b + 0.2]}
            yRange={preset.yRange}
            width={400}
            height={320}
            xLabel="x"
            yLabel="y"
            xColor="#8D9FCE"
            yColor="#029091"
            ariaLabel="2D profile revolved around axis"
            className="w-full h-80 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <>
                <polyline
                  fill="none"
                  stroke="#029091"
                  strokeWidth={2.4}
                  points={toPoly(metrics.crossPtsTop, toSvgX, toSvgY)}
                />
                <polyline
                  fill="none"
                  stroke="#8D9FCE"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  points={toPoly(metrics.crossPtsBot, toSvgX, toSvgY)}
                />
                <line
                  x1={toSvgX(activeX)}
                  y1={toSvgY(metrics.rIn)}
                  x2={toSvgX(activeX)}
                  y2={toSvgY(metrics.rOut)}
                  stroke="#D35323"
                  strokeWidth={4}
                />
              </>
            )}
          </SvgCoordinatePlane2D>
        </div>

        <div className="lg:col-span-7 space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            2. Interactive 3D Solid of Revolution
          </span>
          <ThreeOrbitViewport
            heightClassName="h-80"
            cameraPosition={[3.6, 2.6, 3.6]}
            cameraTarget={[1.0, 0.4, 0]}
            axesOptions={{ axisLength: 2.8, gridExtent: 3.0 }}
            titleBadge="WebGL Solid of Revolution (Drag to Orbit)"
            onBuildScene={handleBuildScene}
            sceneDeps={[preset, sweepDeg, sliceMethod, activeX, elemPos]}
            footerSlot={
              <div className="flex flex-wrap justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[#FBEAA4]">
                  Exact Volume V = {metrics.vol.toFixed(4)}
                </span>
                <span className="text-[#D35323]">
                  Slice x₀ = {activeX.toFixed(2)} • R = {metrics.rOut.toFixed(2)}
                </span>
              </div>
            }
          />
        </div>
      </div>

      <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
        <strong className="text-[var(--text-primary)] font-sans">
          Geometric Volume Insight:
        </strong>{" "}
        {preset.note}
      </div>
    </section>
  );
}
