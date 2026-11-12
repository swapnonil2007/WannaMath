"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RotateCcw } from "lucide-react";
import {
  createCoordinateAxesAndGrid,
  disposeThreeObject,
  CoordinateAxesOptions,
} from "./threeScenePrimitives";

export interface ThreeOrbitViewportProps {
  /** Height className, e.g., "h-[380px] sm:h-[430px]" */
  heightClassName?: string;
  /** Initial camera position in Three.js coordinates [x, y, z] */
  cameraPosition?: [number, number, number];
  /** Initial OrbitControls target in Three.js coordinates [x, y, z] */
  cameraTarget?: [number, number, number];
  /** Options for standard z-up coordinate axes and grid */
  axesOptions?: CoordinateAxesOptions;
  /** Top-left badge text */
  titleBadge?: string;
  /** Top-right overlay slot */
  headerRightSlot?: React.ReactNode;
  /** Bottom telemetry bar slot */
  footerSlot?: React.ReactNode;
  /** Callback invoked to populate the dynamic scene group whenever dependencies change */
  onBuildScene: (
    dynamicGroup: THREE.Group,
    context: {
      scene: THREE.Scene;
      camera: THREE.PerspectiveCamera;
      controls: OrbitControls;
    }
  ) => void;
  /** Dependency list that triggers `onBuildScene` */
  sceneDeps: React.DependencyList;
}

export function ThreeOrbitViewport({
  heightClassName = "h-[380px] sm:h-[430px]",
  cameraPosition = [3.1, 2.5, 3.2],
  cameraTarget = [0, 0.3, 0],
  axesOptions,
  titleBadge = "3D Viewport (Drag to Orbit • Scroll to Zoom)",
  headerRightSlot,
  footerSlot,
  onBuildScene,
  sceneDeps,
}: ThreeOrbitViewportProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);
  const sceneContextRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
  } | null>(null);

  // Initialize WebGL scene, camera, lighting, axes, and OrbitControls once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x18191c);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(
      cameraPosition[0],
      cameraPosition[1],
      cameraPosition[2]
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(cameraTarget[0], cameraTarget[1], cameraTarget[2]);

    // Standard studio lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    const dirLight = new THREE.DirectionalLight(0xfffbe4, 0.9);
    dirLight.position.set(4, 7, 5);
    scene.add(dirLight);

    // Coordinate axes and xy-plane grid
    const axesGroup = createCoordinateAxesAndGrid(axesOptions);
    scene.add(axesGroup);

    // Dynamic content group
    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    dynamicGroupRef.current = dynamicGroup;
    sceneContextRef.current = { scene, camera, controls };

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      disposeThreeObject(axesGroup);
      disposeThreeObject(dynamicGroup);
      renderer.dispose();
      sceneContextRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild dynamic scene contents whenever sceneDeps change
  useEffect(() => {
    const dynamicGroup = dynamicGroupRef.current;
    const ctx = sceneContextRef.current;
    if (!dynamicGroup || !ctx) return;

    while (dynamicGroup.children.length > 0) {
      const child = dynamicGroup.children[0];
      disposeThreeObject(child);
      dynamicGroup.remove(child);
    }

    onBuildScene(dynamicGroup, ctx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, sceneDeps);

  const handleResetCamera = () => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;
    ctx.camera.position.set(
      cameraPosition[0],
      cameraPosition[1],
      cameraPosition[2]
    );
    ctx.controls.target.set(cameraTarget[0], cameraTarget[1], cameraTarget[2]);
    ctx.controls.update();
  };

  return (
    <div className="border border-[var(--border-subtle)] bg-[#18191C] relative overflow-hidden">
      {/* Top Overlay Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="px-2.5 py-1 bg-[#1E1F22]/90 border border-[#383B43] text-xs font-tabular-mono text-[#FFFBE4] flex items-center gap-2.5">
          <span>{titleBadge}</span>
          <span className="text-[#8D9FCE]">x</span>
          <span className="text-[#96B898]">y</span>
          <span className="text-[#029091]">z</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {headerRightSlot}
          <button
            type="button"
            onClick={handleResetCamera}
            className="px-2.5 py-1 bg-[#1E1F22]/90 border border-[#383B43] hover:border-[#8D9FCE] text-xs font-tabular-mono text-[#C9C5B5] hover:text-[#FFFBE4] flex items-center gap-1 cursor-pointer"
            title="Reset 3D camera orientation"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* WebGL Canvas Mount */}
      <div ref={mountRef} className={`w-full ${heightClassName} cursor-grab active:cursor-grabbing`} />

      {/* Bottom Telemetry Strip */}
      {footerSlot && (
        <div className="border-t border-[#2E3036] bg-[#1E1F22] px-4 py-2.5 text-xs font-tabular-mono text-[#C9C5B5]">
          {footerSlot}
        </div>
      )}
    </div>
  );
}
