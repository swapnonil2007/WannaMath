"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Box, Eye, Grid, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";

type SurfaceId = "paraboloid" | "saddle" | "wave" | "plane";
type DomainShapeId = "rectangle" | "triangle" | "sector";
type SampleRule = "midpoint" | "lower" | "upper";

interface SurfacePreset {
  id: SurfaceId;
  name: string;
  latex: string;
  engineeringNote: string;
  fn: (x: number, y: number) => number;
}

const SURFACE_PRESETS: SurfacePreset[] = [
  {
    id: "paraboloid",
    name: "Elliptic Paraboloid Dome",
    latex: "f(x,y) = 1.85 - 0.45(x^2 + y^2)",
    engineeringNote:
      "Models laminar velocity profile in a duct or acoustic pressure dome.",
    fn: (x, y) => 1.85 - 0.45 * (x * x + y * y),
  },
  {
    id: "plane",
    name: "Hydrostatic Pressure Plane",
    latex: "f(x,y) = 0.45 + 0.65x + 0.50y",
    engineeringNote:
      "Models linearly varying hydrostatic pressure or eccentric axial stress on a footing.",
    fn: (x, y) => 0.45 + 0.65 * x + 0.5 * y,
  },
  {
    id: "saddle",
    name: "Hyperbolic Twist Surface",
    latex: "f(x,y) = 0.65 + 0.75xy",
    engineeringNote:
      "Bilinear finite-element shape function interpolation over a quadrilateral patch.",
    fn: (x, y) => 0.65 + 0.75 * x * y,
  },
  {
    id: "wave",
    name: "Harmonic Standing Mode",
    latex: "f(x,y) = 1.15 + 0.55\\cos(1.6x)\\cos(1.6y)",
    engineeringNote:
      "Fundamental vibration mode shape of an elastic rectangular membrane.",
    fn: (x, y) => 1.15 + 0.55 * Math.cos(1.6 * x) * Math.cos(1.6 * y),
  },
];

const DOMAIN_MAX = 1.4;

function isPointInDomain(
  x: number,
  y: number,
  domainShape: DomainShapeId
): boolean {
  if (x < 0 || y < 0 || x > DOMAIN_MAX || y > DOMAIN_MAX) return false;
  if (domainShape === "rectangle") return true;
  if (domainShape === "triangle") return y <= x + 1e-7;
  if (domainShape === "sector") return x * x + y * y <= DOMAIN_MAX * DOMAIN_MAX + 1e-7;
  return true;
}

// 5-point Gauss-Legendre nodes/weights on [0, 1] for accurate reference integral
const GL_NODES = [
  0.046910077, 0.230765345, 0.5, 0.769234655, 0.953089923,
];
const GL_WEIGHTS = [
  0.1184634425, 0.2393143352, 0.2844444444, 0.2393143352, 0.1184634425,
];

function computeExactVolume(
  fn: (x: number, y: number) => number,
  domainShape: DomainShapeId
): number {
  const N = 24;
  const dx = DOMAIN_MAX / N;
  let total = 0;

  for (let i = 0; i < N; i++) {
    const x0 = i * dx;
    for (let gx = 0; gx < 5; gx++) {
      const x = x0 + GL_NODES[gx] * dx;
      const wx = GL_WEIGHTS[gx] * dx;

      let yMax = DOMAIN_MAX;
      if (domainShape === "triangle") {
        yMax = x;
      } else if (domainShape === "sector") {
        yMax = Math.sqrt(Math.max(0, DOMAIN_MAX * DOMAIN_MAX - x * x));
      }

      const M = 10;
      const dy = yMax / M;
      for (let j = 0; j < M; j++) {
        const y0 = j * dy;
        for (let gy = 0; gy < 5; gy++) {
          const y = y0 + GL_NODES[gy] * dy;
          const wy = GL_WEIGHTS[gy] * dy;
          total += fn(x, y) * wx * wy;
        }
      }
    }
  }
  return total;
}

export function RiemannVolumeLab() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const prismGroupRef = useRef<THREE.Group | null>(null);
  const surfaceGroupRef = useRef<THREE.Group | null>(null);

  const [surfaceId, setSurfaceId] = useState<SurfaceId>("paraboloid");
  const [domainShape, setDomainShape] = useState<DomainShapeId>("rectangle");
  const [nx, setNx] = useState<number>(8);
  const [ny, setNy] = useState<number>(8);
  const [sampleRule, setSampleRule] = useState<SampleRule>("midpoint");
  const [showSmoothSurface, setShowSmoothSurface] = useState<boolean>(true);
  const [selectedCell, setSelectedCell] = useState<[number, number]>([3, 2]);

  const activeSurface = useMemo(
    () =>
      SURFACE_PRESETS.find((s) => s.id === surfaceId) ?? SURFACE_PRESETS[0],
    [surfaceId]
  );

  // Compute partition cells and Riemann sum
  const partitionData = useMemo(() => {
    const dx = DOMAIN_MAX / nx;
    const dy = DOMAIN_MAX / ny;
    const dA = dx * dy;
    const cells: {
      i: number;
      j: number;
      x0: number;
      y0: number;
      xc: number;
      yc: number;
      xs: number;
      ys: number;
      height: number;
      dV: number;
      inside: boolean;
    }[] = [];

    let riemannSum = 0;
    let activeCount = 0;

    for (let i = 0; i < nx; i++) {
      const x0 = i * dx;
      const xc = x0 + 0.5 * dx;
      const xs =
        sampleRule === "midpoint"
          ? xc
          : sampleRule === "lower"
          ? x0
          : x0 + dx;

      for (let j = 0; j < ny; j++) {
        const y0 = j * dy;
        const yc = y0 + 0.5 * dy;
        const ys =
          sampleRule === "midpoint"
            ? yc
            : sampleRule === "lower"
            ? y0
            : y0 + dy;

        // Cell is included if its center lies inside the domain R
        const inside = isPointInDomain(xc, yc, domainShape);
        const height = inside ? Math.max(0.02, activeSurface.fn(xs, ys)) : 0;
        const dV = inside ? height * dA : 0;

        if (inside) {
          riemannSum += dV;
          activeCount++;
        }

        cells.push({
          i,
          j,
          x0,
          y0,
          xc,
          yc,
          xs,
          ys,
          height,
          dV,
          inside,
        });
      }
    }

    const exactVol = computeExactVolume(activeSurface.fn, domainShape);
    const absError = Math.abs(riemannSum - exactVol);
    const relErrorPct = exactVol > 0 ? (absError / exactVol) * 100 : 0;

    return {
      dx,
      dy,
      dA,
      cells,
      riemannSum,
      exactVol,
      absError,
      relErrorPct,
      activeCount,
    };
  }, [activeSurface, domainShape, nx, ny, sampleRule]);

  // Keep selectedCell within valid bounds when nx, ny, or domainShape change
  const inspectedCell = useMemo(() => {
    const [ci, cj] = selectedCell;
    const clampedI = Math.min(ci, nx - 1);
    const clampedJ = Math.min(cj, ny - 1);
    const match = partitionData.cells.find(
      (c) => c.i === clampedI && c.j === clampedJ && c.inside
    );
    if (match) return match;
    return partitionData.cells.find((c) => c.inside) ?? partitionData.cells[0];
  }, [selectedCell, nx, ny, partitionData.cells]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1E1F22");

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.85, 2.45, 2.85);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.7, 0.65, 0.7);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.12;
    controls.minDistance = 1.6;
    controls.maxDistance = 7;

    scene.add(new THREE.AmbientLight(0xfffbe4, 0.75));
    const dirLight = new THREE.DirectionalLight(0xfffbe4, 0.75);
    dirLight.position.set(3.5, 5.5, 2.5);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(1.8, 9, 0xaaa36d, 0x32353d);
    grid.position.set(0.7, 0, 0.7);
    scene.add(grid);

    // Coordinate Axes (Math X -> Three X, Math Y -> Three Z, Math Z -> Three Y)
    const addAxis = (
      to: [number, number, number],
      hex: string
    ) => {
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...to),
      ]);
      scene.add(
        new THREE.Line(geom, new THREE.LineBasicMaterial({ color: hex }))
      );
    };
    addAxis([1.68, 0, 0], "#8D9FCE"); // x
    addAxis([0, 0, 1.68], "#96B898"); // y
    addAxis([0, 2.15, 0], "#029091"); // z

    const prismGroup = new THREE.Group();
    const surfaceGroup = new THREE.Group();
    scene.add(prismGroup);
    scene.add(surfaceGroup);
    prismGroupRef.current = prismGroup;
    surfaceGroupRef.current = surfaceGroup;

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
      const h = container.clientHeight || 400;
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

  // Rebuild 3D Riemann Prisms & Smooth Surface Mesh when parameters change
  useEffect(() => {
    const prismGroup = prismGroupRef.current;
    const surfaceGroup = surfaceGroupRef.current;
    if (!prismGroup || !surfaceGroup) return;

    const clearGroup = (grp: THREE.Group) => {
      while (grp.children.length > 0) {
        const obj = grp.children[0] as THREE.Mesh;
        if (obj.geometry) obj.geometry.dispose();
        grp.remove(obj);
      }
    };

    clearGroup(prismGroup);
    clearGroup(surfaceGroup);

    const { dx, dy, cells } = partitionData;

    // Shared materials (flat solid colors, zero gradients)
    const normalMat = new THREE.MeshLambertMaterial({
      color: "#029091",
      transparent: true,
      opacity: 0.72,
    });
    const highlightMat = new THREE.MeshLambertMaterial({
      color: "#D35323",
      transparent: true,
      opacity: 0.94,
    });
    const topCapHighlightMat = new THREE.MeshBasicMaterial({
      color: "#FBEAA4",
    });
    const edgeMat = new THREE.LineBasicMaterial({
      color: "#25272C",
      transparent: true,
      opacity: 0.55,
    });

    const boxGeom = new THREE.BoxGeometry(dx * 0.96, 1, dy * 0.96);
    const edgesGeom = new THREE.EdgesGeometry(boxGeom);

    for (const cell of cells) {
      if (!cell.inside) continue;
      const isInspected =
        inspectedCell &&
        cell.i === inspectedCell.i &&
        cell.j === inspectedCell.j;

      const mesh = new THREE.Mesh(
        boxGeom,
        isInspected ? highlightMat : normalMat
      );
      mesh.scale.set(1, cell.height, 1);
      mesh.position.set(cell.xc, cell.height * 0.5, cell.yc);
      prismGroup.add(mesh);

      const wire = new THREE.LineSegments(edgesGeom, edgeMat);
      wire.scale.set(1, cell.height, 1);
      wire.position.set(cell.xc, cell.height * 0.5, cell.yc);
      prismGroup.add(wire);

      if (isInspected) {
        // Warm cream top cap on the inspected prism
        const capGeom = new THREE.PlaneGeometry(dx * 0.96, dy * 0.96);
        capGeom.rotateX(-Math.PI / 2);
        const capMesh = new THREE.Mesh(capGeom, topCapHighlightMat);
        capMesh.position.set(cell.xc, cell.height + 0.004, cell.yc);
        prismGroup.add(capMesh);
      }
    }

    // Smooth reference surface z = f(x,y)
    if (showSmoothSurface) {
      const res = 34;
      const positions: number[] = [];
      const indices: number[] = [];

      for (let i = 0; i <= res; i++) {
        const u = i / res;
        const x = u * DOMAIN_MAX;
        let yMax = DOMAIN_MAX;
        if (domainShape === "triangle") {
          yMax = x;
        } else if (domainShape === "sector") {
          yMax = Math.sqrt(Math.max(0, DOMAIN_MAX * DOMAIN_MAX - x * x));
        }
        for (let j = 0; j <= res; j++) {
          const v = j / res;
          const y = v * yMax;
          const z = activeSurface.fn(x, y);
          positions.push(x, z, y);
        }
      }

      for (let i = 0; i < res; i++) {
        for (let j = 0; j < res; j++) {
          const a = i * (res + 1) + j;
          const b = (i + 1) * (res + 1) + j;
          const c = (i + 1) * (res + 1) + (j + 1);
          const d = i * (res + 1) + (j + 1);
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      const surfGeom = new THREE.BufferGeometry();
      surfGeom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      surfGeom.setIndex(indices);
      surfGeom.computeVertexNormals();

      const surfMat = new THREE.MeshLambertMaterial({
        color: "#8D9FCE",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.44,
      });
      surfaceGroup.add(new THREE.Mesh(surfGeom, surfMat));

      const surfWire = new THREE.MeshBasicMaterial({
        color: "#FFFBE4",
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      });
      surfaceGroup.add(new THREE.Mesh(surfGeom, surfWire));
    }
  }, [
    partitionData,
    inspectedCell,
    showSmoothSurface,
    domainShape,
    activeSurface,
  ]);

  const svgScale = 155 / DOMAIN_MAX;

  return (
    <section
      id="riemann-volume"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 sm:p-6 space-y-6 scroll-mt-24"
    >
      {/* Lab Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[#8D9FCE]">
            <Box className="w-4 h-4" aria-hidden="true" />
            <span>Interactive Laboratory 01.1 • Riemann Volume Convergence</span>
          </div>
          <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            From 2D Partition Sub-Rectangles to 3D Riemann Columns
          </h2>
          <p className="font-math-serif text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl">
            Subdivide the 2D region <KaTeXMath math="R \subset \mathbb{R}^2" />{" "}
            into an <KaTeXMath math="N_x \times N_y" /> mesh of patches{" "}
            <KaTeXMath math="\Delta A = \Delta x\,\Delta y" />. Click any cell
            in the 2D domain grid on the right to inspect its corresponding 3D
            column <KaTeXMath math="\Delta V_{ij} = f(x_i^*, y_j^*)\,\Delta A" />.
          </p>
        </div>

        {/* Live Convergence Readout Pill */}
        <div className="grid grid-cols-3 gap-2 border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-2.5 text-center font-tabular-mono">
          <div className="px-2">
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">
              Riemann Sum S
            </span>
            <span className="text-sm font-semibold text-[#FBEAA4]">
              {partitionData.riemannSum.toFixed(4)}
            </span>
          </div>
          <div className="px-2 border-x border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">
              Exact Volume V
            </span>
            <span className="text-sm font-semibold text-[#96B898]">
              {partitionData.exactVol.toFixed(4)}
            </span>
          </div>
          <div className="px-2">
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">
              Rel. Error
            </span>
            <span className="text-sm font-semibold text-[#D35323]">
              {partitionData.relErrorPct.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Top Controls Bar: Surface Preset, Domain Shape, Sample Rule */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Surface Selector */}
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
            1. Integrand Surface z = f(x, y)
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {SURFACE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSurfaceId(preset.id)}
                className={`px-2.5 py-1.5 text-xs font-medium text-left border transition-colors cursor-pointer ${
                  surfaceId === preset.id
                    ? "border-[var(--border-strong)] bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
          <div className="text-xs pt-1 text-[#8D9FCE]">
            <KaTeXMath math={activeSurface.latex} />
          </div>
        </div>

        {/* 2. Domain Shape Selector */}
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
            2. Base Region R in xy-Plane
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: "rectangle", label: "Rectangle" },
                { id: "triangle", label: "Triangle y ≤ x" },
                { id: "sector", label: "Quarter Disk" },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDomainShape(d.id)}
                className={`px-2.5 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                  domainShape === d.id
                    ? "border-[var(--border-strong)] bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] font-tabular-mono pt-1">
            Active Columns: {partitionData.activeCount} / {nx * ny} cells
          </p>
        </div>

        {/* 3. Sample Point Rule & Surface Overlay Toggle */}
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
              3. Sample Point (xᵢ*, yⱼ*) &amp; Mesh
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "midpoint", label: "Midpoint" },
                  { id: "lower", label: "Lower-Left" },
                  { id: "upper", label: "Upper-Right" },
                ] as const
              ).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSampleRule(r.id)}
                  className={`px-2 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                    sampleRule === r.id
                      ? "border-[var(--border-strong)] bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] font-semibold"
                      : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSmoothSurface((v) => !v)}
            className="w-full px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono text-[var(--text-primary)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#8D9FCE]" aria-hidden="true" />
            <span>
              {showSmoothSurface
                ? "Hide Smooth Surface Overlay"
                : "Show Smooth Surface Overlay"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Split Workspace: Left 3D WebGL + Right 2D Interactive Partition Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: 3D WebGL Riemann Prism Viewport */}
        <figure className="lg:col-span-7 border border-[var(--border-subtle)] bg-[#1E1F22] flex flex-col justify-between relative">
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[#25272C] border border-[#383B43] text-[11px] font-tabular-mono text-[#FFFBE4] flex items-center gap-3">
            <span>3D Riemann Columns (Drag to Orbit)</span>
            <span className="text-[#8D9FCE]">x</span>
            <span className="text-[#96B898]">y</span>
            <span className="text-[#029091]">z</span>
          </div>

          <div ref={mountRef} className="w-full h-[400px] cursor-grab" />

          <figcaption className="px-3.5 py-2.5 border-t border-[#383B43] bg-[#25272C] flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono text-[#CCC8B8]">
            <span>
              Inspected Column ({inspectedCell?.i ?? 0}, {inspectedCell?.j ?? 0}
              ):{" "}
              <strong className="text-[#FBEAA4]">
                z = {inspectedCell?.height.toFixed(3)}
              </strong>
            </span>
            <span>
              Patch Area ΔA ={" "}
              <strong className="text-[#8D9FCE]">
                {partitionData.dA.toFixed(4)}
              </strong>
            </span>
            <span>
              Column Volume ΔV ={" "}
              <strong className="text-[#D35323]">
                {inspectedCell?.dV.toFixed(4)}
              </strong>
            </span>
          </figcaption>
        </figure>

        {/* Right: 2D Partition Grid + Subdivision Sliders + Inspected Cell Formula */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* Interactive 2D Partition Grid (Click any cell to inspect) */}
          <figure className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)] mb-2">
              <span className="flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-[#029091]" aria-hidden="true" />
                <span>2D Partition Grid (Click Cell to Inspect)</span>
              </span>
              <span className="text-[#D35323]">
                ({inspectedCell?.xc.toFixed(2)}, {inspectedCell?.yc.toFixed(2)})
              </span>
            </div>

            <svg
              viewBox="0 0 210 200"
              className="w-full max-w-[245px] h-auto select-none"
              role="img"
              aria-label="Interactive 2D partition grid of the integration domain R"
            >
              {/* True boundary outline of R */}
              {domainShape === "rectangle" && (
                <rect
                  x={30}
                  y={180 - 155}
                  width={155}
                  height={155}
                  fill="none"
                  stroke="#B95869"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
              )}
              {domainShape === "triangle" && (
                <polygon
                  points="30,180 185,180 185,25"
                  fill="none"
                  stroke="#B95869"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
              )}
              {domainShape === "sector" && (
                <path
                  d="M 30 25 A 155 155 0 0 1 185 180 L 30 180 Z"
                  fill="none"
                  stroke="#B95869"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
              )}

              {/* Partition Sub-Rectangles */}
              {partitionData.cells.map((cell) => {
                const svgX = 30 + cell.x0 * svgScale;
                const svgW = partitionData.dx * svgScale;
                const svgH = partitionData.dy * svgScale;
                const svgY = 180 - (cell.y0 + partitionData.dy) * svgScale;
                const isSelected =
                  inspectedCell &&
                  cell.i === inspectedCell.i &&
                  cell.j === inspectedCell.j;

                return (
                  <rect
                    key={`${cell.i}-${cell.j}`}
                    x={svgX}
                    y={svgY}
                    width={Math.max(1, svgW)}
                    height={Math.max(1, svgH)}
                    fill={
                      !cell.inside
                        ? "transparent"
                        : isSelected
                        ? "#D35323"
                        : "#029091"
                    }
                    fillOpacity={!cell.inside ? 0 : isSelected ? 0.85 : 0.34}
                    stroke={isSelected ? "#FBEAA4" : "#383B43"}
                    strokeWidth={isSelected ? 1.6 : 0.6}
                    className={cell.inside ? "cursor-pointer" : ""}
                    onClick={() => {
                      if (cell.inside) {
                        setSelectedCell([cell.i, cell.j]);
                      }
                    }}
                  />
                );
              })}

              {/* Axes */}
              <line
                x1={30}
                y1={180}
                x2={195}
                y2={180}
                stroke="#8D9FCE"
                strokeWidth="1.5"
              />
              <line
                x1={30}
                y1={180}
                x2={30}
                y2={14}
                stroke="#96B898"
                strokeWidth="1.5"
              />
              <text
                x={198}
                y={183}
                fill="#8D9FCE"
                fontSize="11"
                fontFamily="monospace"
              >
                x
              </text>
              <text
                x={26}
                y={11}
                fill="#96B898"
                fontSize="11"
                fontFamily="monospace"
              >
                y
              </text>
            </svg>
          </figure>

          {/* Subdivision Sliders Nx and Ny */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="text-[var(--text-muted)] uppercase">
                Mesh Resolution Controls
              </span>
              <button
                type="button"
                onClick={() => {
                  setNx(8);
                  setNy(8);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>Reset (8×8)</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-tabular-mono">
                <label htmlFor="riemann-nx" className="text-[#8D9FCE]">
                  x-Subdivisions (Nₓ = {nx}, Δx = {partitionData.dx.toFixed(3)})
                </label>
              </div>
              <input
                id="riemann-nx"
                type="range"
                min={2}
                max={22}
                step={1}
                value={nx}
                onChange={(e) => setNx(parseInt(e.target.value, 10))}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-tabular-mono">
                <label htmlFor="riemann-ny" className="text-[#96B898]">
                  y-Subdivisions (Nᵧ = {ny}, Δy = {partitionData.dy.toFixed(3)})
                </label>
              </div>
              <input
                id="riemann-ny"
                type="range"
                min={2}
                max={22}
                step={1}
                value={ny}
                onChange={(e) => setNy(parseInt(e.target.value, 10))}
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Live Riemann Formula Card */}
          <div className="border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-3.5 space-y-1.5">
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
              Double Riemann Sum Approximation
            </span>
            <KaTeXMath
              block
              math={`S_{${nx},${ny}} = \\sum_{i=1}^{\\textcolor{#8D9FCE}{${nx}}} \\sum_{j=1}^{\\textcolor{#96B898}{${ny}}} f(x_i^*, y_j^*)\\,\\textcolor{#FBEAA4}{\\Delta A} = \\textcolor{#FBEAA4}{${partitionData.riemannSum.toFixed(
                4
              )}}`}
            />
            <p className="text-xs text-[var(--text-secondary)] font-math-serif">
              {activeSurface.engineeringNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
