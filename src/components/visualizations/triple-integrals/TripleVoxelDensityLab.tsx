"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Cpu, Grid, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";

type VoxelSolidId = "tetrahedron" | "quarter-sphere" | "parabolic-tunnel";
type DensityId = "uniform" | "stratified" | "radial-core" | "outer-heavy";

interface DensityPreset {
  id: DensityId;
  name: string;
  latex: string;
  engineeringContext: string;
  fn: (x: number, y: number, z: number) => number;
}

const DENSITY_PRESETS: DensityPreset[] = [
  {
    id: "uniform",
    name: "Uniform Density (ρ = 1)",
    latex: "\\rho(x,y,z) = 1.0",
    engineeringContext:
      "Homogeneous alloy or incompressible fluid: Mass equals geometric volume V, and Center of Mass coincides with the geometric centroid.",
    fn: () => 1.0,
  },
  {
    id: "stratified",
    name: "Bottom-Heavy Stratified",
    latex: "\\rho(x,y,z) = 2.2 - 1.3z",
    engineeringContext:
      "Graded foundation material or atmospheric/oceanic density stratification where lower layers are denser (shifts z̄ downward).",
    fn: (_x, _y, z) => Math.max(0.15, 2.2 - 1.3 * z),
  },
  {
    id: "radial-core",
    name: "Dense Axial Core",
    latex: "\\rho(x,y,z) = 2.1 - 1.1(x^2 + y^2)",
    engineeringContext:
      "Concentrated core density near the z-axis (pulls x̄ and ȳ closer to the vertical axis).",
    fn: (x, y) => Math.max(0.15, 2.1 - 1.1 * (x * x + y * y)),
  },
  {
    id: "outer-heavy",
    name: "Outer Shell Heavy",
    latex: "\\rho(x,y,z) = 0.35 + 1.35(x^2 + y^2 + z^2)",
    engineeringContext:
      "Centrifugally cast component or flywheel with higher density at larger radii (shifts Center of Mass outward).",
    fn: (x, y, z) => 0.35 + 1.35 * (x * x + y * y + z * z),
  },
];

function isInsideVoxelSolid(
  x: number,
  y: number,
  z: number,
  solidId: VoxelSolidId
): boolean {
  if (x < 0 || y < 0 || z < 0) return false;
  if (solidId === "tetrahedron") {
    return x + y + z <= 1.35;
  }
  if (solidId === "quarter-sphere") {
    return x * x + y * y + z * z <= 1.25 * 1.25;
  }
  if (solidId === "parabolic-tunnel") {
    return x <= 1.2 && y <= 1.2 && z <= 1.2 - 0.8 * y * y;
  }
  return false;
}

export function TripleVoxelDensityLab() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const voxelGroupRef = useRef<THREE.Group | null>(null);

  const [solidId, setSolidId] = useState<VoxelSolidId>("quarter-sphere");
  const [densityId, setDensityId] = useState<DensityId>("stratified");
  const [resolution, setResolution] = useState<number>(7);
  const [sliceZFilter, setSliceZFilter] = useState<number>(1.0);

  const activeDensity = useMemo(
    () =>
      DENSITY_PRESETS.find((d) => d.id === densityId) ?? DENSITY_PRESETS[0],
    [densityId]
  );

  // Compute 3D Voxel Lattice, Riemann Volume, Total Mass M, and Center of Mass (xBar, yBar, zBar)
  const voxelData = useMemo(() => {
    const boxMax = 1.35;
    const step = boxMax / resolution;
    const dV = step * step * step;

    const voxels: {
      xc: number;
      yc: number;
      zc: number;
      rho: number;
      visible: boolean;
    }[] = [];

    let totalVolume = 0;
    let totalMass = 0;
    let mx = 0;
    let my = 0;
    let mz = 0;
    let activeCount = 0;

    for (let i = 0; i < resolution; i++) {
      const xc = (i + 0.5) * step;
      for (let j = 0; j < resolution; j++) {
        const yc = (j + 0.5) * step;
        for (let k = 0; k < resolution; k++) {
          const zc = (k + 0.5) * step;
          if (isInsideVoxelSolid(xc, yc, zc, solidId)) {
            const rho = activeDensity.fn(xc, yc, zc);
            const dm = rho * dV;
            totalVolume += dV;
            totalMass += dm;
            mx += xc * dm;
            my += yc * dm;
            mz += zc * dm;
            activeCount++;

            voxels.push({
              xc,
              yc,
              zc,
              rho,
              visible: zc <= sliceZFilter * boxMax + 1e-5,
            });
          }
        }
      }
    }

    const com: [number, number, number] =
      totalMass > 0
        ? [mx / totalMass, my / totalMass, mz / totalMass]
        : [0.3, 0.3, 0.3];

    return {
      step,
      dV,
      voxels,
      totalVolume,
      totalMass,
      com,
      activeCount,
    };
  }, [solidId, activeDensity, resolution, sliceZFilter]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 390;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1E1F22");

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.55, 2.05, 2.55);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.5, 0.45, 0.5);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.4;
    controls.maxDistance = 7;

    scene.add(new THREE.AmbientLight(0xfffbe4, 0.78));
    const dirLight = new THREE.DirectionalLight(0xfffbe4, 0.75);
    dirLight.position.set(3, 5, 2.5);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(1.8, 9, 0xaaa36d, 0x32353d);
    grid.position.set(0.7, 0, 0.7);
    scene.add(grid);

    const addAxis = (to: [number, number, number], hex: string) => {
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...to),
      ]);
      scene.add(
        new THREE.Line(geom, new THREE.LineBasicMaterial({ color: hex }))
      );
    };
    addAxis([1.6, 0, 0], "#8D9FCE");
    addAxis([0, 0, 1.6], "#96B898");
    addAxis([0, 1.6, 0], "#029091");

    const voxelGroup = new THREE.Group();
    scene.add(voxelGroup);
    voxelGroupRef.current = voxelGroup;

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 560;
      const h = container.clientHeight || 390;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, []);

  // Update 3D Voxels and Center of Mass Marker
  useEffect(() => {
    const group = voxelGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const c = group.children[0] as THREE.Mesh;
      if (c.geometry) c.geometry.dispose();
      group.remove(c);
    }

    const { step, voxels, com } = voxelData;
    const cubeGeom = new THREE.BoxGeometry(
      step * 0.88,
      step * 0.88,
      step * 0.88
    );
    const edgeGeom = new THREE.EdgesGeometry(cubeGeom);
    const edgeMat = new THREE.LineBasicMaterial({
      color: "#25272C",
      transparent: true,
      opacity: 0.45,
    });

    // Three discrete semantic density tiers (Low: #8D9FCE, Medium: #029091, High: #D5658B)
    const lowMat = new THREE.MeshLambertMaterial({
      color: "#8D9FCE",
      transparent: true,
      opacity: 0.42,
    });
    const midMat = new THREE.MeshLambertMaterial({
      color: "#029091",
      transparent: true,
      opacity: 0.62,
    });
    const highMat = new THREE.MeshLambertMaterial({
      color: "#D5658B",
      transparent: true,
      opacity: 0.78,
    });

    for (const v of voxels) {
      if (!v.visible) continue;
      const mat = v.rho > 1.55 ? highMat : v.rho > 0.95 ? midMat : lowMat;
      const mesh = new THREE.Mesh(cubeGeom, mat);
      // Map math (x, y, z) -> Three (x, z, y)
      mesh.position.set(v.xc, v.zc, v.yc);
      group.add(mesh);

      const wire = new THREE.LineSegments(edgeGeom, edgeMat);
      wire.position.set(v.xc, v.zc, v.yc);
      group.add(wire);
    }

    // Center of Mass Marker Sphere (#FBEAA4 Warm Cream) + Crosshair axes (#D35323 Persimmon)
    const comSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 18, 18),
      new THREE.MeshBasicMaterial({ color: "#FBEAA4" })
    );
    comSphere.position.set(com[0], com[2], com[1]);
    group.add(comSphere);

    const crossMat = new THREE.LineBasicMaterial({ color: "#D35323" });
    const addCrossLine = (
      a: [number, number, number],
      b: [number, number, number]
    ) => {
      group.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...a),
            new THREE.Vector3(...b),
          ]),
          crossMat
        )
      );
    };
    // Project crosshair down to the xy floor and axes
    addCrossLine([com[0], 0, com[1]], [com[0], com[2], com[1]]);
    addCrossLine([0, com[2], com[1]], [com[0], com[2], com[1]]);
    addCrossLine([com[0], com[2], 0], [com[0], com[2], com[1]]);
  }, [voxelData]);

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[#96B898]">
            <Grid className="w-4 h-4" aria-hidden="true" />
            <span>
              Interactive Laboratory 02.4 • 3D Voxels, Scalar Density &amp;
              Center of Mass
            </span>
          </div>
          <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            Visualizing ∭ ρ(x, y, z) dV as Mass &amp; Center of Mass
          </h2>
          <p className="font-math-serif text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl">
            While a double integral measures volume under a 3D surface, a triple
            integral integrates a <strong>scalar density field</strong>{" "}
            <KaTeXMath math="\rho(x,y,z)" /> across 3D volume elements{" "}
            <KaTeXMath math="\Delta V = \Delta x\,\Delta y\,\Delta z" />. Watch
            how varying <KaTeXMath math="\rho(x,y,z)" /> shifts the{" "}
            <strong>3D Center of Mass</strong> (cream sphere with persimmon
            crosshairs).
          </p>
        </div>

        {/* Readout Pills */}
        <div className="grid grid-cols-3 gap-2 border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-2.5 text-center font-tabular-mono">
          <div className="px-2">
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">
              Volume ∑ΔV
            </span>
            <span className="text-sm font-semibold text-[#029091]">
              {voxelData.totalVolume.toFixed(4)}
            </span>
          </div>
          <div className="px-2 border-x border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">
              Total Mass M
            </span>
            <span className="text-sm font-semibold text-[#D5658B]">
              {voxelData.totalMass.toFixed(4)}
            </span>
          </div>
          <div className="px-2">
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">
              Center (x̄, ȳ, z̄)
            </span>
            <span className="text-xs font-semibold text-[#FBEAA4]">
              ({voxelData.com[0].toFixed(2)}, {voxelData.com[1].toFixed(2)},{" "}
              {voxelData.com[2].toFixed(2)})
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: 3D Voxel & Center of Mass Viewport */}
        <figure className="lg:col-span-7 border border-[var(--border-subtle)] bg-[#1E1F22] flex flex-col justify-between relative">
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[#25272C] border border-[#383B43] text-[11px] font-tabular-mono text-[#FFFBE4] flex items-center gap-3">
            <span>3D Voxel Lattice ΔV = Δx Δy Δz</span>
            <span className="text-[#FBEAA4]">● Center of Mass</span>
          </div>

          <div ref={mountRef} className="w-full h-[390px] cursor-grab" />

          <figcaption className="px-3.5 py-2.5 border-t border-[#383B43] bg-[#25272C] flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono text-[#CCC8B8]">
            <span>Active Voxels: {voxelData.activeCount}</span>
            <span className="flex items-center gap-3">
              <span className="text-[#8D9FCE]">■ Low ρ</span>
              <span className="text-[#029091]">■ Med ρ</span>
              <span className="text-[#D5658B]">■ High ρ</span>
            </span>
          </figcaption>
        </figure>

        {/* Right: Controls & Equations */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* Solid & Density Selectors */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3">
            <div className="space-y-1.5">
              <span className="text-xs font-tabular-mono uppercase text-[var(--text-muted)] block">
                1. 3D Solid Domain E
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: "quarter-sphere", label: "Octant Sphere" },
                    { id: "tetrahedron", label: "Tetrahedron" },
                    { id: "parabolic-tunnel", label: "Parabolic Arch" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSolidId(s.id)}
                    className={`px-2 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                      solidId === s.id
                        ? "border-[var(--border-strong)] bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] font-semibold"
                        : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-tabular-mono uppercase text-[var(--text-muted)] block">
                2. Scalar Density Function ρ(x, y, z)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {DENSITY_PRESETS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDensityId(d.id)}
                    className={`px-2.5 py-1.5 text-xs font-medium text-left border transition-colors cursor-pointer ${
                      densityId === d.id
                        ? "border-[var(--border-strong)] bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] font-semibold"
                        : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
              <div className="text-xs text-[#D5658B] pt-1">
                <KaTeXMath math={activeDensity.latex} />
              </div>
            </div>
          </div>

          {/* Voxel Resolution & Z-Cutaway Sliders */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="uppercase text-[var(--text-muted)]">
                Voxel Mesh &amp; Cutaway Inspector
              </span>
              <button
                type="button"
                onClick={() => {
                  setResolution(7);
                  setSliceZFilter(1.0);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="voxel-res-slider"
                className="text-xs font-tabular-mono text-[#029091] block"
              >
                Voxel Grid Subdivision (N = {resolution} per axis, ΔV ={" "}
                {voxelData.dV.toFixed(4)})
              </label>
              <input
                id="voxel-res-slider"
                type="range"
                min={3}
                max={10}
                step={1}
                value={resolution}
                onChange={(e) => setResolution(parseInt(e.target.value, 10))}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="voxel-cutaway-slider"
                className="text-xs font-tabular-mono text-[#FBEAA4] block"
              >
                Horizontal Cutaway Plane (z ≤ {(sliceZFilter * 100).toFixed(0)}%
                — Peel Layers to See Center of Mass)
              </label>
              <input
                id="voxel-cutaway-slider"
                type="range"
                min={0.15}
                max={1.0}
                step={0.05}
                value={sliceZFilter}
                onChange={(e) => setSliceZFilter(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Engineering Context & Formula */}
          <div className="border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-tabular-mono text-[#96B898]">
              <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Physical Meaning of the Triple Integral</span>
            </div>
            <KaTeXMath
              block
              math={`M = \\iiint_E \\rho(x,y,z)\\,dV \\approx \\textcolor{#D5658B}{${voxelData.totalMass.toFixed(
                4
              )}}, \\quad \\bar{z} = \\frac{1}{M}\\iiint_E z\\,\\rho\\,dV \\approx \\textcolor{#FBEAA4}{${voxelData.com[2].toFixed(
                3
              )}}`}
            />
            <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
              {activeDensity.engineeringContext}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
