"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RotateCcw, ArrowLeftRight, Play, Pause } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";

type IntegrationOrder = "dydx" | "dxdy";

/**
 * Interactive 2D + 3D Synchronized Preview for the Landing Hub
 * Demonstrates f(x, y) = 1.5 - 0.45(x^2 + y^2) over the region R:
 *   Type I (dy dx):  0 <= x <= 1,  x^2 <= y <= 1
 *   Type II (dx dy): 0 <= y <= 1,  0 <= x <= sqrt(y)
 */
export function HeroIntegralPreview() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [order, setOrder] = useState<IntegrationOrder>("dydx");
  const [slicePos, setSlicePos] = useState<number>(0.55);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // References to mutable Three.js objects for fast 60fps updates
  const sliceGroupRef = useRef<THREE.Group | null>(null);

  const f = (x: number, y: number) => 1.5 - 0.45 * (x * x + y * y);

  // Animate slice position when playing
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setSlicePos((prev) => {
        const next = prev + dt * 0.28;
        return next > 0.96 ? 0.06 : next;
      });
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Initialize Three.js 3D scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1E1F22");

    // In Three.js, y is up; we map math (x, y, z) -> Three (x, z, y)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.35, 1.95, 2.35);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.5, 0.55, 0.5);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.minDistance = 1.4;
    controls.maxDistance = 6;

    // Ambient + directional lighting for crisp matte depth (no specular glare)
    const ambient = new THREE.AmbientLight(0xfffbe4, 0.78);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xfffbe4, 0.75);
    dirLight.position.set(3, 5, 2);
    scene.add(dirLight);

    // Base grid in xy-plane (math z = 0 -> Three y = 0)
    const gridHelper = new THREE.GridHelper(1.4, 7, 0xaaa36d, 0x34373f);
    gridHelper.position.set(0.5, 0, 0.5);
    scene.add(gridHelper);

    // Coordinate Axes (Math X: #8D9FCE, Math Y: #96B898, Math Z: #029091)
    const addAxisLine = (
      from: [number, number, number],
      to: [number, number, number],
      hex: string
    ) => {
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...from),
        new THREE.Vector3(...to),
      ]);
      const mat = new THREE.LineBasicMaterial({ color: hex });
      scene.add(new THREE.Line(geom, mat));
    };
    // Math X axis -> Three +X
    addAxisLine([0, 0, 0], [1.28, 0, 0], "#8D9FCE");
    // Math Y axis -> Three +Z
    addAxisLine([0, 0, 0], [0, 0, 1.28], "#96B898");
    // Math Z axis -> Three +Y
    addAxisLine([0, 0, 0], [0, 1.65, 0], "#029091");

    // Build Surface Mesh over R = { 0 <= x <= 1, x^2 <= y <= 1 }
    const nx = 32;
    const ny = 32;
    const positions: number[] = [];
    const basePositions: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= nx; i++) {
      const u = i / nx; // x in [0, 1]
      const x = u;
      const yMin = x * x;
      const yMax = 1.0;
      for (let j = 0; j <= ny; j++) {
        const v = j / ny;
        const y = yMin + v * (yMax - yMin);
        const z = f(x, y);
        // Map (x, y, z) -> (x, z, y)
        positions.push(x, z, y);
        basePositions.push(x, 0.002, y);
      }
    }

    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const a = i * (ny + 1) + j;
        const b = (i + 1) * (ny + 1) + j;
        const c = (i + 1) * (ny + 1) + (j + 1);
        const d = i * (ny + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const surfaceGeom = new THREE.BufferGeometry();
    surfaceGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    surfaceGeom.setIndex(indices);
    surfaceGeom.computeVertexNormals();

    const surfaceMat = new THREE.MeshLambertMaterial({
      color: "#8D9FCE",
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const surfaceMesh = new THREE.Mesh(surfaceGeom, surfaceMat);
    scene.add(surfaceMesh);

    const wireMat = new THREE.MeshBasicMaterial({
      color: "#FFFBE4",
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    scene.add(new THREE.Mesh(surfaceGeom, wireMat));

    // Base shadow region R in the xy-plane
    const baseGeom = new THREE.BufferGeometry();
    baseGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(basePositions, 3)
    );
    baseGeom.setIndex(indices);
    const baseMat = new THREE.MeshBasicMaterial({
      color: "#029091",
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.28,
    });
    scene.add(new THREE.Mesh(baseGeom, baseMat));

    // Boundary curves in xy-plane:
    // Lower curve y = x^2 (#D5658B Dusty Rose)
    const lowerCurvePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 48; i++) {
      const x = i / 48;
      lowerCurvePts.push(new THREE.Vector3(x, 0.008, x * x));
    }
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(lowerCurvePts),
        new THREE.LineBasicMaterial({ color: "#D5658B" })
      )
    );

    // Upper line y = 1 (#B95869 Terracotta Crimson)
    const upperCurvePts = [
      new THREE.Vector3(0, 0.008, 1),
      new THREE.Vector3(1, 0.008, 1),
    ];
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(upperCurvePts),
        new THREE.LineBasicMaterial({ color: "#B95869" })
      )
    );

    // Dynamic Slicing Curtain Group
    const sliceGroup = new THREE.Group();
    scene.add(sliceGroup);
    sliceGroupRef.current = sliceGroup;

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 520;
      const h = container.clientHeight || 340;
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

  // Update 3D Slice Curtain Geometry whenever order or slicePos changes
  useEffect(() => {
    const group = sliceGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      group.remove(child);
    }

    const steps = 36;
    const vertices: number[] = [];
    const indices: number[] = [];
    const topEdgePts: THREE.Vector3[] = [];
    const baseEdgePts: THREE.Vector3[] = [];

    if (order === "dydx") {
      // Fix x = slicePos, sweep y from x^2 to 1
      const x = slicePos;
      const yMin = x * x;
      const yMax = 1.0;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const y = yMin + t * (yMax - yMin);
        const z = f(x, y);
        // Bottom vertex (x, 0, y) and Top vertex (x, z, y)
        vertices.push(x, 0, y);
        vertices.push(x, z, y);
        topEdgePts.push(new THREE.Vector3(x, z, y));
        baseEdgePts.push(new THREE.Vector3(x, 0.012, y));
      }
    } else {
      // Fix y = slicePos, sweep x from 0 to sqrt(y)
      const y = slicePos;
      const xMin = 0;
      const xMax = Math.sqrt(y);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = xMin + t * (xMax - xMin);
        const z = f(x, y);
        vertices.push(x, 0, y);
        vertices.push(x, z, y);
        topEdgePts.push(new THREE.Vector3(x, z, y));
        baseEdgePts.push(new THREE.Vector3(x, 0.012, y));
      }
    }

    for (let i = 0; i < steps; i++) {
      const b0 = 2 * i;
      const t0 = 2 * i + 1;
      const b1 = 2 * (i + 1);
      const t1 = 2 * (i + 1) + 1;
      indices.push(b0, t0, b1);
      indices.push(t0, t1, b1);
    }

    const curtainGeom = new THREE.BufferGeometry();
    curtainGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    curtainGeom.setIndex(indices);
    curtainGeom.computeVertexNormals();

    const curtainMat = new THREE.MeshBasicMaterial({
      color: "#D35323",
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72,
    });
    group.add(new THREE.Mesh(curtainGeom, curtainMat));

    // Highlight top curve and base strip in Warm Cream (#FBEAA4)
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(topEdgePts),
        new THREE.LineBasicMaterial({ color: "#FBEAA4" })
      )
    );
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(baseEdgePts),
        new THREE.LineBasicMaterial({ color: "#FBEAA4" })
      )
    );
  }, [order, slicePos]);

  // Compute live cross-sectional area A(x) or A(y) analytically
  // f(x,y) = 1.5 - 0.45 x^2 - 0.45 y^2
  const sliceArea = React.useMemo(() => {
    if (order === "dydx") {
      const x = slicePos;
      const y1 = x * x;
      const y2 = 1;
      // int_{y1}^{y2} (1.5 - 0.45 x^2 - 0.45 y^2) dy
      return (
        (1.5 - 0.45 * x * x) * (y2 - y1) -
        0.15 * (Math.pow(y2, 3) - Math.pow(y1, 3))
      );
    } else {
      const y = slicePos;
      const x2 = Math.sqrt(y);
      // int_{0}^{x2} (1.5 - 0.45 y^2 - 0.45 x^2) dx
      return (1.5 - 0.45 * y * y) * x2 - 0.15 * Math.pow(x2, 3);
    }
  }, [order, slicePos]);

  // Exact total double integral over R:
  // int_0^1 [ (1.5 - 0.45 x^2)(1 - x^2) - 0.15(1 - x^6) ] dx = 0.8593
  const exactTotalVolume = 0.8593;

  // Build parabolic path in 2D SVG (200x200 coordinate box)
  const parabolaPath = React.useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const x = i / 40;
      const y = x * x;
      const svgX = 30 + x * 145;
      const svgY = 175 - y * 145;
      pts.push(`${i === 0 ? "M" : "L"} ${svgX.toFixed(1)} ${svgY.toFixed(1)}`);
    }
    return pts.join(" ");
  }, []);

  const regionFillPath = `${parabolaPath} L 30 30 Z`;

  return (
    <div className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-6 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#8D9FCE] block">
            Interactive Live Preview • Fubini&apos;s Theorem &amp; Slicing
          </span>
          <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
            Synchronized 2D Domain Strip &amp; 3D Cross-Sectional Curtain
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setOrder((prev) => (prev === "dydx" ? "dxdy" : "dydx"))
            }
            className="px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono font-medium text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeftRight
              className="w-3.5 h-3.5 text-[#D35323]"
              aria-hidden="true"
            />
            <span>
              Swap Order:{" "}
              {order === "dydx" ? "Type I (dy dx)" : "Type II (dx dy)"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)] text-xs font-tabular-mono text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#FBEAA4]" />
                <span>Pause Sweep</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#96B898]" />
                <span>Sweep Slice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Viewports: Left 3D WebGL + Right 2D Domain & Live KaTeX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 3D WebGL Stage */}
        <div className="lg:col-span-7 flex flex-col justify-between border border-[var(--border-subtle)] bg-[#1E1F22] relative min-h-[340px]">
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[#25272C] border border-[#383B43] text-[11px] font-tabular-mono text-[#FFFBE4] flex items-center gap-3">
            <span>3D Viewport (Drag to Orbit)</span>
            <span className="text-[#8D9FCE]">x</span>
            <span className="text-[#96B898]">y</span>
            <span className="text-[#029091]">z</span>
          </div>

          <div ref={mountRef} className="w-full h-[340px] cursor-grab" />

          <div className="px-3 py-2 border-t border-[#383B43] bg-[#25272C] flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono text-[#CCC8B8]">
            <span>
              Active Slice:{" "}
              <strong className="text-[#FBEAA4]">
                {order === "dydx"
                  ? `x = ${slicePos.toFixed(2)}`
                  : `y = ${slicePos.toFixed(2)}`}
              </strong>
            </span>
            <span>
              Cross-Section Area:{" "}
              <strong className="text-[#D35323]">
                {sliceArea.toFixed(4)}
              </strong>
            </span>
            <span>
              Total Volume V ={" "}
              <strong className="text-[#96B898]">
                {exactTotalVolume.toFixed(4)}
              </strong>
            </span>
          </div>
        </div>

        {/* Right: 2D Domain SVG + Slider + Color-Linked Formula */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* 2D Domain xy-plane View */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)] mb-1">
              <span>2D Integration Domain R (xy-plane)</span>
              <span className="text-[#D35323]">
                {order === "dydx" ? "Vertical Strip (dy)" : "Horizontal Strip (dx)"}
              </span>
            </div>

            <svg
              viewBox="0 0 210 200"
              className="w-full max-w-[230px] h-auto"
              role="img"
              aria-label="2D region of integration bounded by y = x squared and y = 1"
            >
              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map((t) => (
                <React.Fragment key={t}>
                  <line
                    x1={30 + t * 145}
                    y1={30}
                    x2={30 + t * 145}
                    y2={175}
                    stroke="#383B43"
                    strokeDasharray="2 2"
                    strokeWidth="0.75"
                  />
                  <line
                    x1={30}
                    y1={175 - t * 145}
                    x2={175}
                    y2={175 - t * 145}
                    stroke="#383B43"
                    strokeDasharray="2 2"
                    strokeWidth="0.75"
                  />
                </React.Fragment>
              ))}

              {/* Shaded Region R */}
              <path
                d={regionFillPath}
                fill="#029091"
                fillOpacity="0.24"
              />

              {/* Active Strip (dy dx or dx dy) */}
              {order === "dydx" ? (
                <line
                  x1={30 + slicePos * 145}
                  y1={175 - slicePos * slicePos * 145}
                  x2={30 + slicePos * 145}
                  y2={30}
                  stroke="#D35323"
                  strokeWidth="4"
                />
              ) : (
                <line
                  x1={30}
                  y1={175 - slicePos * 145}
                  x2={30 + Math.sqrt(slicePos) * 145}
                  y2={175 - slicePos * 145}
                  stroke="#D35323"
                  strokeWidth="4"
                />
              )}

              {/* Upper Bound y = 1 (#B95869) */}
              <line
                x1={30}
                y1={30}
                x2={175}
                y2={30}
                stroke="#B95869"
                strokeWidth="2.5"
              />

              {/* Lower Curve y = x^2 (#D5658B) */}
              <path
                d={parabolaPath}
                fill="none"
                stroke="#D5658B"
                strokeWidth="2.5"
              />

              {/* Axes */}
              <line
                x1={30}
                y1={175}
                x2={190}
                y2={175}
                stroke="#8D9FCE"
                strokeWidth="1.5"
              />
              <line
                x1={30}
                y1={175}
                x2={30}
                y2={15}
                stroke="#96B898"
                strokeWidth="1.5"
              />

              {/* Labels */}
              <text
                x={193}
                y={179}
                fill="#8D9FCE"
                fontSize="11"
                fontFamily="monospace"
              >
                x
              </text>
              <text
                x={26}
                y={12}
                fill="#96B898"
                fontSize="11"
                fontFamily="monospace"
              >
                y
              </text>
              <text
                x={78}
                y={23}
                fill="#B95869"
                fontSize="10"
                fontFamily="monospace"
              >
                y = 1
              </text>
              <text
                x={116}
                y={122}
                fill="#D5658B"
                fontSize="10"
                fontFamily="monospace"
              >
                y = x²
              </text>
            </svg>
          </div>

          {/* Slice Position Scrubber */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <label
                htmlFor="hero-slice-slider"
                className="text-[var(--text-secondary)]"
              >
                {order === "dydx"
                  ? "Outer Slice Position x₀ ∈ [0, 1]"
                  : "Outer Slice Position y₀ ∈ [0, 1]"}
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setSlicePos(0.55);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                title="Reset slider"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
            <input
              id="hero-slice-slider"
              type="range"
              min={0.04}
              max={0.96}
              step={0.01}
              value={slicePos}
              onChange={(e) => {
                setIsPlaying(false);
                setSlicePos(parseFloat(e.target.value));
              }}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Live Color-Coded KaTeX Iterated Integral */}
          <div className="border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-3">
            <div className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] mb-1">
              {order === "dydx"
                ? "Type I Formulation (Vertical Strips dy dx)"
                : "Type II Formulation (Horizontal Strips dx dy)"}
            </div>
            {order === "dydx" ? (
              <KaTeXMath
                block
                math={`\\int_{\\textcolor{#8D9FCE}{0}}^{\\textcolor{#8D9FCE}{1}} \\left[ \\int_{\\textcolor{#D5658B}{x^2}}^{\\textcolor{#B95869}{1}} f(x,y)\\,\\textcolor{#D35323}{dy} \\right] \\textcolor{#8D9FCE}{dx} = 0.8593`}
              />
            ) : (
              <KaTeXMath
                block
                math={`\\int_{\\textcolor{#96B898}{0}}^{\\textcolor{#96B898}{1}} \\left[ \\int_{\\textcolor{#8D9FCE}{0}}^{\\textcolor{#D5658B}{\\sqrt{y}}} f(x,y)\\,\\textcolor{#D35323}{dx} \\right] \\textcolor{#96B898}{dy} = 0.8593`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
