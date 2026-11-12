"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Box, Eye, Grid, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";

type SurfaceId = "paraboloid" | "saddle" | "wave" | "plane" | "custom";
type DomainShapeId = "rectangle" | "triangle" | "sector" | "spandrel" | "custom";
type SampleRule = "midpoint" | "lower" | "upper";

interface SurfacePreset {
  id: Exclude<SurfaceId, "custom">;
  name: string;
  expr: string;
  engineeringNote: string;
}

const SURFACE_PRESETS: SurfacePreset[] = [
  {
    id: "paraboloid",
    name: "Elliptic Paraboloid Dome",
    expr: "1.85 - 0.45*(x^2 + y^2)",
    engineeringNote:
      "Models laminar velocity profile in a duct or acoustic pressure dome.",
  },
  {
    id: "plane",
    name: "Hydrostatic Pressure Plane",
    expr: "0.45 + 0.65*x + 0.50*y",
    engineeringNote:
      "Models linearly varying hydrostatic pressure or eccentric axial stress on a footing.",
  },
  {
    id: "saddle",
    name: "Hyperbolic Twist Surface",
    expr: "0.65 + 0.75*x*y",
    engineeringNote:
      "Bilinear finite-element shape function interpolation over a quadrilateral patch.",
  },
  {
    id: "wave",
    name: "Harmonic Standing Mode",
    expr: "1.15 + 0.55*cos(1.6*x)*cos(1.6*y)",
    engineeringNote:
      "Fundamental vibration mode shape of an elastic rectangular membrane.",
  },
];

const DOMAIN_PRESETS: {
  id: Exclude<DomainShapeId, "custom">;
  label: string;
  xMinExpr: string;
  xMaxExpr: string;
  yMinExpr: string;
  yMaxExpr: string;
}[] = [
  {
    id: "rectangle",
    label: "Rectangle ([0, 1.4]²)",
    xMinExpr: "0",
    xMaxExpr: "1.4",
    yMinExpr: "0",
    yMaxExpr: "1.4",
  },
  {
    id: "triangle",
    label: "Triangle (0 ≤ y ≤ x)",
    xMinExpr: "0",
    xMaxExpr: "1.4",
    yMinExpr: "0",
    yMaxExpr: "x",
  },
  {
    id: "sector",
    label: "Quarter Disk (x² + y² ≤ 1)",
    xMinExpr: "0",
    xMaxExpr: "1",
    yMinExpr: "0",
    yMaxExpr: "sqrt(1 - x^2)",
  },
  {
    id: "spandrel",
    label: "Spandrel (x² ≤ y ≤ 1)",
    xMinExpr: "0",
    xMaxExpr: "1",
    yMinExpr: "x^2",
    yMaxExpr: "1",
  },
];

// 5-point Gauss-Legendre nodes/weights on [0, 1] for accurate reference integral
const GL_NODES = [
  0.046910077, 0.230765345, 0.5, 0.769234655, 0.953089923,
];
const GL_WEIGHTS = [
  0.1184634425, 0.2393143352, 0.2844444444, 0.2393143352, 0.1184634425,
];

function computeExactVolume(
  fn: (x: number, y: number) => number,
  xMin: number,
  xMax: number,
  yBoundsFn: (x: number) => [number, number]
): number {
  const N = 20;
  const dx = (xMax - xMin) / N;
  if (dx <= 0) return 0;
  let total = 0;

  for (let i = 0; i < N; i++) {
    const x0 = xMin + i * dx;
    for (let gx = 0; gx < 5; gx++) {
      const x = x0 + GL_NODES[gx] * dx;
      const wx = GL_WEIGHTS[gx] * dx;

      const [yMin, yMax] = yBoundsFn(x);
      const ySpan = yMax - yMin;
      if (ySpan <= 0) continue;

      const M = 10;
      const dy = ySpan / M;
      for (let j = 0; j < M; j++) {
        const y0 = yMin + j * dy;
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
  const [surfaceExpr, setSurfaceExpr] = useState<string>(
    SURFACE_PRESETS[0].expr
  );

  const [domainShape, setDomainShape] = useState<DomainShapeId>("rectangle");
  const [xMinExpr, setXMinExpr] = useState<string>("0");
  const [xMaxExpr, setXMaxExpr] = useState<string>("1.4");
  const [yMinExpr, setYMinExpr] = useState<string>("0");
  const [yMaxExpr, setYMaxExpr] = useState<string>("1.4");

  const [nx, setNx] = useState<number>(8);
  const [ny, setNy] = useState<number>(8);
  const [sampleRule, setSampleRule] = useState<SampleRule>("midpoint");
  const [showSmoothSurface, setShowSmoothSurface] = useState<boolean>(true);
  const [selectedCell, setSelectedCell] = useState<[number, number]>([3, 2]);

  const compiledSurface = useMemo(
    () => compileMathExpression(surfaceExpr, ["x", "y"], 0),
    [surfaceExpr]
  );

  const compiledXMin = useMemo(
    () => compileMathExpression(xMinExpr, [], 0),
    [xMinExpr]
  );
  const compiledXMax = useMemo(
    () => compileMathExpression(xMaxExpr, [], 1.4),
    [xMaxExpr]
  );
  const compiledYMin = useMemo(
    () => compileMathExpression(yMinExpr, ["x"], 0),
    [yMinExpr]
  );
  const compiledYMax = useMemo(
    () => compileMathExpression(yMaxExpr, ["x"], 1.4),
    [yMaxExpr]
  );

  const evalF = React.useCallback(
    (x: number, y: number) => Math.max(0, compiledSurface.evaluate({ x, y })),
    [compiledSurface]
  );

  const xRange = useMemo((): [number, number] => {
    const a = Math.max(-4, Math.min(4, compiledXMin.evaluate({})));
    const b = Math.max(a + 0.05, Math.min(4, compiledXMax.evaluate({})));
    return [a, b];
  }, [compiledXMin, compiledXMax]);

  const evalYBounds = React.useCallback(
    (x: number): [number, number] => {
      const y1 = Math.max(-4, Math.min(4, compiledYMin.evaluate({ x })));
      const y2 = Math.max(y1, Math.min(4, compiledYMax.evaluate({ x })));
      return [y1, y2];
    },
    [compiledYMin, compiledYMax]
  );

  const activeEngineeringNote = useMemo(() => {
    const match = SURFACE_PRESETS.find((s) => s.id === surfaceId);
    return (
      match?.engineeringNote ??
      "Custom user-defined multivariable surface z = f(x, y) integrated over custom 2D region R."
    );
  }, [surfaceId]);

  // Compute bounding box in y across [xMin, xMax] and partition cells
  const partitionData = useMemo(() => {
    const [xMin, xMax] = xRange;
    let yBoxMin = Infinity;
    let yBoxMax = -Infinity;
    const S = 32;
    for (let s = 0; s <= S; s++) {
      const xs = xMin + (s / S) * (xMax - xMin);
      const [y1, y2] = evalYBounds(xs);
      if (y1 < yBoxMin) yBoxMin = y1;
      if (y2 > yBoxMax) yBoxMax = y2;
    }
    if (!Number.isFinite(yBoxMin)) yBoxMin = 0;
    if (!Number.isFinite(yBoxMax) || yBoxMax <= yBoxMin) yBoxMax = yBoxMin + 1;

    const dx = (xMax - xMin) / nx;
    const dy = (yBoxMax - yBoxMin) / ny;
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
      const x0 = xMin + i * dx;
      const xc = x0 + 0.5 * dx;
      const xs =
        sampleRule === "midpoint"
          ? xc
          : sampleRule === "lower"
          ? x0
          : x0 + dx;

      const [yLowerAtXc, yUpperAtXc] = evalYBounds(xc);

      for (let j = 0; j < ny; j++) {
        const y0 = yBoxMin + j * dy;
        const yc = y0 + 0.5 * dy;
        const ys =
          sampleRule === "midpoint"
            ? yc
            : sampleRule === "lower"
            ? y0
            : y0 + dy;

        const inside = yc >= yLowerAtXc - 1e-7 && yc <= yUpperAtXc + 1e-7;
        const height = inside ? evalF(xs, ys) : 0;
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

    const exactVol = computeExactVolume(evalF, xMin, xMax, evalYBounds);
    const absError = Math.abs(riemannSum - exactVol);
    const relErrorPct = exactVol > 0 ? (absError / exactVol) * 100 : 0;

    return {
      xMin,
      xMax,
      yBoxMin,
      yBoxMax,
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
  }, [evalF, xRange, evalYBounds, nx, ny, sampleRule]);

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
    controls.maxDistance = 8;

    scene.add(new THREE.AmbientLight(0xfffbe4, 0.75));
    const dirLight = new THREE.DirectionalLight(0xfffbe4, 0.75);
    dirLight.position.set(3.5, 5.5, 2.5);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(2.2, 11, 0xaaa36d, 0x32353d);
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
    addAxis([1.85, 0, 0], "#8D9FCE"); // x
    addAxis([0, 0, 1.85], "#96B898"); // y
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

    const boxGeom = new THREE.BoxGeometry(
      Math.max(0.01, dx * 0.96),
      1,
      Math.max(0.01, dy * 0.96)
    );
    const edgesGeom = new THREE.EdgesGeometry(boxGeom);

    for (const cell of cells) {
      if (!cell.inside || cell.height <= 0) continue;
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
        const capGeom = new THREE.PlaneGeometry(
          Math.max(0.01, dx * 0.96),
          Math.max(0.01, dy * 0.96)
        );
        capGeom.rotateX(-Math.PI / 2);
        const capMesh = new THREE.Mesh(capGeom, topCapHighlightMat);
        capMesh.position.set(cell.xc, cell.height + 0.004, cell.yc);
        prismGroup.add(capMesh);
      }
    }

    if (showSmoothSurface) {
      const res = 48;
      const positions: number[] = [];
      const indices: number[] = [];
      const [xMin, xMax] = xRange;

      for (let i = 0; i <= res; i++) {
        const u = i / res;
        const x = xMin + u * (xMax - xMin);
        const [yMin, yMax] = evalYBounds(x);
        for (let j = 0; j <= res; j++) {
          const v = j / res;
          const y = yMin + v * (yMax - yMin);
          const z = evalF(x, y);
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
        opacity: 0.48,
      });
      surfaceGroup.add(new THREE.Mesh(surfGeom, surfMat));

      const surfWire = new THREE.MeshBasicMaterial({
        color: "#FFFBE4",
        wireframe: true,
        transparent: true,
        opacity: 0.16,
      });
      surfaceGroup.add(new THREE.Mesh(surfGeom, surfWire));
    }
  }, [partitionData, inspectedCell, showSmoothSurface, xRange, evalF, evalYBounds]);

  // Dynamic boundary curve paths and coordinate mapping for 2D SVG
  const svgMapping = useMemo(() => {
    const maxExtent = Math.max(
      0.5,
      Math.abs(partitionData.xMax),
      Math.abs(partitionData.yBoxMax)
    );
    const scale = 155 / maxExtent;
    const toSvgX = (x: number) => 30 + x * scale;
    const toSvgY = (y: number) => 180 - y * scale;

    const lowerPts: string[] = [];
    const upperPts: string[] = [];
    const N = 48;
    const [xMin, xMax] = xRange;
    for (let i = 0; i <= N; i++) {
      const x = xMin + (i / N) * (xMax - xMin);
      const [y1, y2] = evalYBounds(x);
      lowerPts.push(
        `${i === 0 ? "M" : "L"} ${toSvgX(x).toFixed(1)} ${toSvgY(y1).toFixed(1)}`
      );
      upperPts.push(
        `${i === 0 ? "M" : "L"} ${toSvgX(x).toFixed(1)} ${toSvgY(y2).toFixed(1)}`
      );
    }

    return {
      scale,
      toSvgX,
      toSvgY,
      lowerCurvePath: lowerPts.join(" "),
      upperCurvePath: upperPts.join(" "),
    };
  }, [partitionData.xMax, partitionData.yBoxMax, xRange, evalYBounds]);

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
            Choose a preset or type your own surface <KaTeXMath math="z = f(x,y)" />{" "}
            and integration limits <KaTeXMath math="x \in [a,b],\; y \in [g_1(x), g_2(x)]" />{" "}
            below. Click any cell in the 2D domain grid to inspect its corresponding 3D column{" "}
            <KaTeXMath math="\Delta V_{ij} = f(x_i^*, y_j^*)\,\Delta A" />.
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
            1. Integrand Surface Presets
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {SURFACE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSurfaceId(preset.id);
                  setSurfaceExpr(preset.expr);
                }}
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
        </div>

        {/* 2. Domain Shape Selector */}
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
            2. Base Region R Presets
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {DOMAIN_PRESETS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setDomainShape(d.id);
                  setXMinExpr(d.xMinExpr);
                  setXMaxExpr(d.xMaxExpr);
                  setYMinExpr(d.yMinExpr);
                  setYMaxExpr(d.yMaxExpr);
                }}
                className={`px-2.5 py-1.5 text-xs font-medium text-left border transition-colors cursor-pointer ${
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

      {/* Custom Math Typing Widgets for Surface f(x, y) and All 4 Region Limits */}
      <div className="space-y-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4">
        <MathExpressionInput
          label="Custom Surface Equation z = f(x, y):"
          value={surfaceExpr}
          onChange={(val) => {
            setSurfaceId("custom");
            setSurfaceExpr(val);
          }}
          allowedVars={["x", "y"]}
          prefixLatex="f(x,y) ="
          placeholder="sqrt(1 - (x^2 + y^2))"
          accentHex="#8D9FCE"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <MathExpressionInput
            label="Outer Lower Limit x_min (a):"
            value={xMinExpr}
            onChange={(val) => {
              setDomainShape("custom");
              setXMinExpr(val);
            }}
            allowedVars={[]}
            prefixLatex="a ="
            placeholder="0"
            accentHex="#8D9FCE"
          />
          <MathExpressionInput
            label="Outer Upper Limit x_max (b):"
            value={xMaxExpr}
            onChange={(val) => {
              setDomainShape("custom");
              setXMaxExpr(val);
            }}
            allowedVars={[]}
            prefixLatex="b ="
            placeholder="1.4"
            accentHex="#8D9FCE"
          />
          <MathExpressionInput
            label="Inner Lower Curve y_min(x) = g₁(x):"
            value={yMinExpr}
            onChange={(val) => {
              setDomainShape("custom");
              setYMinExpr(val);
            }}
            allowedVars={["x"]}
            prefixLatex="g_1(x) ="
            placeholder="0"
            accentHex="#D5658B"
          />
          <MathExpressionInput
            label="Inner Upper Curve y_max(x) = g₂(x):"
            value={yMaxExpr}
            onChange={(val) => {
              setDomainShape("custom");
              setYMaxExpr(val);
            }}
            allowedVars={["x"]}
            prefixLatex="g_2(x) ="
            placeholder="sqrt(1 - x^2)"
            accentHex="#B95869"
          />
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
              {/* Dynamic Lower & Upper Boundary Curves */}
              <path
                d={svgMapping.lowerCurvePath}
                fill="none"
                stroke="#D5658B"
                strokeWidth="2"
                strokeDasharray="3 2"
              />
              <path
                d={svgMapping.upperCurvePath}
                fill="none"
                stroke="#B95869"
                strokeWidth="2"
                strokeDasharray="3 2"
              />

              {/* Partition Sub-Rectangles */}
              {partitionData.cells.map((cell) => {
                const svgX = svgMapping.toSvgX(cell.x0);
                const svgW = partitionData.dx * svgMapping.scale;
                const svgH = partitionData.dy * svgMapping.scale;
                const svgY = svgMapping.toSvgY(cell.y0 + partitionData.dy);
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
              Double Integral &amp; Riemann Sum Approximation
            </span>
            <KaTeXMath
              block
              math={`\\int_{\\textcolor{#8D9FCE}{${compiledXMin.tex}}}^{\\textcolor{#8D9FCE}{${compiledXMax.tex}}} \\int_{\\textcolor{#D5658B}{${compiledYMin.tex}}}^{\\textcolor{#B95869}{${compiledYMax.tex}}} \\left(${compiledSurface.tex}\\right)\\,dy\\,dx \\approx S_{${nx},${ny}} = \\textcolor{#FBEAA4}{${partitionData.riemannSum.toFixed(
                4
              )}}`}
            />
            <p className="text-xs text-[var(--text-secondary)] font-math-serif">
              {activeEngineeringNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
