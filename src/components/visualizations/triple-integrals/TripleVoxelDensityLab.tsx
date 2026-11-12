"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Cpu, Grid, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";

type VoxelSolidId = "tetrahedron" | "quarter-sphere" | "parabolic-tunnel" | "custom";
type DensityId = "uniform" | "stratified" | "radial-core" | "outer-heavy" | "custom";

interface DensityPreset {
  id: Exclude<DensityId, "custom">;
  name: string;
  expr: string;
  engineeringContext: string;
}

const DENSITY_PRESETS: DensityPreset[] = [
  {
    id: "uniform",
    name: "Uniform Density (ρ = 1)",
    expr: "1.0",
    engineeringContext:
      "Homogeneous alloy or incompressible fluid: Mass equals geometric volume V, and Center of Mass coincides with the geometric centroid.",
  },
  {
    id: "stratified",
    name: "Bottom-Heavy Stratified",
    expr: "2.2 - 1.3*z",
    engineeringContext:
      "Graded foundation material or atmospheric/oceanic density stratification where lower layers are denser (shifts z̄ downward).",
  },
  {
    id: "radial-core",
    name: "Dense Axial Core",
    expr: "2.1 - 1.1*(x^2 + y^2)",
    engineeringContext:
      "Concentrated core density near the z-axis (pulls x̄ and ȳ closer to the vertical axis).",
  },
  {
    id: "outer-heavy",
    name: "Outer Shell Heavy",
    expr: "0.35 + 1.35*(x^2 + y^2 + z^2)",
    engineeringContext:
      "Centrifugally cast component or flywheel with higher density at larger radii (shifts Center of Mass outward).",
  },
];

const SOLID_REGION_PRESETS: {
  id: Exclude<VoxelSolidId, "custom">;
  label: string;
  xMinExpr: string;
  xMaxExpr: string;
  yMinExpr: string;
  yMaxExpr: string;
  zMinExpr: string;
  zMaxExpr: string;
}[] = [
  {
    id: "quarter-sphere",
    label: "Octant Sphere",
    xMinExpr: "0",
    xMaxExpr: "1.25",
    yMinExpr: "0",
    yMaxExpr: "sqrt(1.5625 - x^2)",
    zMinExpr: "0",
    zMaxExpr: "sqrt(1.5625 - x^2 - y^2)",
  },
  {
    id: "tetrahedron",
    label: "Tetrahedron",
    xMinExpr: "0",
    xMaxExpr: "1.35",
    yMinExpr: "0",
    yMaxExpr: "1.35 - x",
    zMinExpr: "0",
    zMaxExpr: "1.35 - x - y",
  },
  {
    id: "parabolic-tunnel",
    label: "Parabolic Arch",
    xMinExpr: "0",
    xMaxExpr: "1.2",
    yMinExpr: "0",
    yMaxExpr: "1.2",
    zMinExpr: "0",
    zMaxExpr: "1.2 - 0.8*y^2",
  },
];

export function TripleVoxelDensityLab() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const voxelGroupRef = useRef<THREE.Group | null>(null);

  const [solidId, setSolidId] = useState<VoxelSolidId>("quarter-sphere");
  const [xMinExpr, setXMinExpr] = useState<string>(
    SOLID_REGION_PRESETS[0].xMinExpr
  );
  const [xMaxExpr, setXMaxExpr] = useState<string>(
    SOLID_REGION_PRESETS[0].xMaxExpr
  );
  const [yMinExpr, setYMinExpr] = useState<string>(
    SOLID_REGION_PRESETS[0].yMinExpr
  );
  const [yMaxExpr, setYMaxExpr] = useState<string>(
    SOLID_REGION_PRESETS[0].yMaxExpr
  );
  const [zMinExpr, setZMinExpr] = useState<string>(
    SOLID_REGION_PRESETS[0].zMinExpr
  );
  const [zMaxExpr, setZMaxExpr] = useState<string>(
    SOLID_REGION_PRESETS[0].zMaxExpr
  );

  const [densityId, setDensityId] = useState<DensityId>("stratified");
  const [densityExpr, setDensityExpr] = useState<string>(
    DENSITY_PRESETS[1].expr
  );

  const [resolution, setResolution] = useState<number>(7);
  const [sliceZFilter, setSliceZFilter] = useState<number>(1.0);

  const compiledDensity = useMemo(
    () => compileMathExpression(densityExpr, ["x", "y", "z"], 0),
    [densityExpr]
  );

  const compiledXMin = useMemo(
    () => compileMathExpression(xMinExpr, [], 0),
    [xMinExpr]
  );
  const compiledXMax = useMemo(
    () => compileMathExpression(xMaxExpr, [], 1.25),
    [xMaxExpr]
  );
  const compiledYMin = useMemo(
    () => compileMathExpression(yMinExpr, ["x"], 0),
    [yMinExpr]
  );
  const compiledYMax = useMemo(
    () => compileMathExpression(yMaxExpr, ["x"], 0),
    [yMaxExpr]
  );
  const compiledZMin = useMemo(
    () => compileMathExpression(zMinExpr, ["x", "y"], 0),
    [zMinExpr]
  );
  const compiledZMax = useMemo(
    () => compileMathExpression(zMaxExpr, ["x", "y"], 0),
    [zMaxExpr]
  );

  const activeEngineeringContext = useMemo(() => {
    const match = DENSITY_PRESETS.find((d) => d.id === densityId);
    return (
      match?.engineeringContext ??
      "Custom user-defined 3D scalar density distribution ρ(x, y, z) integrated across active voxels."
    );
  }, [densityId]);

  // Compute 3D Voxel Lattice, Riemann Volume, Total Mass M, and Center of Mass (xBar, yBar, zBar)
  const voxelData = useMemo(() => {
    const xA = Math.max(-3, Math.min(3, compiledXMin.evaluate({})));
    const xB = Math.max(xA + 0.1, Math.min(3, compiledXMax.evaluate({})));
    const boxMax = Math.max(1.35, Math.abs(xB));
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
      if (xc < xA - 1e-6 || xc > xB + 1e-6) continue;

      const yLower = compiledYMin.evaluate({ x: xc });
      const yUpper = compiledYMax.evaluate({ x: xc });

      for (let j = 0; j < resolution; j++) {
        const yc = (j + 0.5) * step;
        if (yc < yLower - 1e-6 || yc > yUpper + 1e-6) continue;

        const zLower = compiledZMin.evaluate({ x: xc, y: yc });
        const zUpper = compiledZMax.evaluate({ x: xc, y: yc });

        for (let k = 0; k < resolution; k++) {
          const zc = (k + 0.5) * step;
          if (zc >= zLower - 1e-6 && zc <= zUpper && zUpper > zLower) {
            const rho = Math.max(
              0.05,
              compiledDensity.evaluate({ x: xc, y: yc, z: zc })
            );
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
  }, [
    compiledDensity,
    compiledXMin,
    compiledXMax,
    compiledYMin,
    compiledYMax,
    compiledZMin,
    compiledZMax,
    resolution,
    sliceZFilter,
  ]);

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
      mesh.position.set(v.xc, v.zc, v.yc);
      group.add(mesh);

      const wire = new THREE.LineSegments(edgeGeom, edgeMat);
      wire.position.set(v.xc, v.zc, v.yc);
      group.add(wire);
    }

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
            Choose a preset or type your own 3D scalar density function{" "}
            <KaTeXMath math="\rho(x,y,z)" /> and all 6 integration limits{" "}
            <KaTeXMath math="x \in [a,b],\; y \in [g_1(x), g_2(x)],\; z \in [u_1(x,y), u_2(x,y)]" />{" "}
            below. Watch how varying <KaTeXMath math="\rho(x,y,z)" /> shifts the{" "}
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

      {/* Custom Math Typing Widgets for Density ρ(x,y,z) and All 6 3D Region Limits */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3">
        <MathExpressionInput
          label="1. Custom 3D Scalar Density Function ρ(x, y, z):"
          value={densityExpr}
          onChange={(val) => {
            setDensityId("custom");
            setDensityExpr(val);
          }}
          allowedVars={["x", "y", "z"]}
          prefixLatex="\rho(x,y,z) ="
          placeholder="2.2 - 1.3*z"
          accentHex="#D5658B"
          quickTokens={[
            { label: "x²", insert: "x^2" },
            { label: "y²", insert: "y^2" },
            { label: "z²", insert: "z^2" },
            { label: "x*y*z", insert: "x*y*z" },
            { label: "exp()", insert: "exp()" },
            { label: "cos()", insert: "cos()" },
          ]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          <MathExpressionInput
            label="2. Outer Lower Limit x_min (a):"
            value={xMinExpr}
            onChange={(val) => {
              setSolidId("custom");
              setXMinExpr(val);
            }}
            allowedVars={[]}
            prefixLatex="a ="
            placeholder="0"
            accentHex="#8D9FCE"
            compact
          />
          <MathExpressionInput
            label="3. Outer Upper Limit x_max (b):"
            value={xMaxExpr}
            onChange={(val) => {
              setSolidId("custom");
              setXMaxExpr(val);
            }}
            allowedVars={[]}
            prefixLatex="b ="
            placeholder="1.25"
            accentHex="#8D9FCE"
            compact
          />
          <MathExpressionInput
            label="4. Middle Lower Curve y_min(x) = g₁(x):"
            value={yMinExpr}
            onChange={(val) => {
              setSolidId("custom");
              setYMinExpr(val);
            }}
            allowedVars={["x"]}
            prefixLatex="g_1(x) ="
            placeholder="0"
            accentHex="#96B898"
            compact
          />
          <MathExpressionInput
            label="5. Middle Upper Curve y_max(x) = g₂(x):"
            value={yMaxExpr}
            onChange={(val) => {
              setSolidId("custom");
              setYMaxExpr(val);
            }}
            allowedVars={["x"]}
            prefixLatex="g_2(x) ="
            placeholder="sqrt(1.5625 - x^2)"
            accentHex="#96B898"
            compact
          />
          <MathExpressionInput
            label="6. Inner Lower Surface z_min(x,y) = u₁(x,y):"
            value={zMinExpr}
            onChange={(val) => {
              setSolidId("custom");
              setZMinExpr(val);
            }}
            allowedVars={["x", "y"]}
            prefixLatex="u_1(x,y) ="
            placeholder="0"
            accentHex="#D5658B"
            compact
          />
          <MathExpressionInput
            label="7. Inner Upper Surface z_max(x,y) = u₂(x,y):"
            value={zMaxExpr}
            onChange={(val) => {
              setSolidId("custom");
              setZMaxExpr(val);
            }}
            allowedVars={["x", "y"]}
            prefixLatex="u_2(x,y) ="
            placeholder="sqrt(1.5625 - x^2 - y^2)"
            accentHex="#029091"
            compact
          />
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
                1. 3D Solid Domain Presets
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {SOLID_REGION_PRESETS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSolidId(s.id);
                      setXMinExpr(s.xMinExpr);
                      setXMaxExpr(s.xMaxExpr);
                      setYMinExpr(s.yMinExpr);
                      setYMaxExpr(s.yMaxExpr);
                      setZMinExpr(s.zMinExpr);
                      setZMaxExpr(s.zMaxExpr);
                    }}
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
                2. Scalar Density Presets ρ(x, y, z)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {DENSITY_PRESETS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setDensityId(d.id);
                      setDensityExpr(d.expr);
                    }}
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
              math={`M = \\int_{\\textcolor{#8D9FCE}{${compiledXMin.tex}}}^{\\textcolor{#8D9FCE}{${compiledXMax.tex}}} \\int_{\\textcolor{#96B898}{${compiledYMin.tex}}}^{\\textcolor{#96B898}{${compiledYMax.tex}}} \\int_{\\textcolor{#D5658B}{${compiledZMin.tex}}}^{\\textcolor{#029091}{${compiledZMax.tex}}} \\left(${compiledDensity.tex}\\right)\\,dz\\,dy\\,dx \\approx \\textcolor{#D5658B}{${voxelData.totalMass.toFixed(
                4
              )}}`}
            />
            <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
              {activeEngineeringContext}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
