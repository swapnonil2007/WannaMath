"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  createDemandDrivenRenderLoop,
  type DemandDrivenRenderLoopHandle,
} from "@/components/visualizations/primitives/demandRenderLoop";

function disposeThreeGroupChildren(group: THREE.Group | null) {
  if (!group) return;
  while (group.children.length > 0) {
    const child = group.children[0] as THREE.Object3D & {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
    };
    if (child.geometry) child.geometry.dispose();
    if (Array.isArray(child.material)) {
      child.material.forEach((mat) => mat.dispose());
    } else if (child.material) {
      child.material.dispose();
    }
    group.remove(child);
  }
}

export interface HeroIntegral3DViewportProps {
  order: "dydx" | "dxdy";
  xRange: [number, number];
  yRange: [number, number];
  slicePos: number;
  evalYBounds: (x: number) => [number, number];
  evalXBounds: (y: number) => [number, number];
  evalF: (x: number, y: number) => number;
}

/**
 * Isolated Three.js WebGL 3D surface + slice curtain stage for HeroIntegralPreview.
 * Loaded dynamically after first paint or pointer interaction so Three.js is kept
 * completely off the landing page initial critical rendering path.
 */
export function HeroIntegral3DViewport({
  order,
  xRange,
  yRange,
  slicePos,
  evalYBounds,
  evalXBounds,
  evalF,
}: HeroIntegral3DViewportProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const surfaceGroupRef = useRef<THREE.Group | null>(null);
  const sliceGroupRef = useRef<THREE.Group | null>(null);
  const renderLoopRef = useRef<DemandDrivenRenderLoopHandle | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1E1F22");

    // In Three.js, y is up; we map math (x, y, z) -> Three (x, z, y)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.35, 1.95, 2.35);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.5, 0.55, 0.5);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.minDistance = 1.4;
    controls.maxDistance = 8;

    const ambient = new THREE.AmbientLight(0xfffbe4, 0.78);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xfffbe4, 0.75);
    dirLight.position.set(3, 5, 2);
    scene.add(dirLight);

    const staticGroup = new THREE.Group();
    scene.add(staticGroup);

    const gridHelper = new THREE.GridHelper(2.0, 10, 0xaaa36d, 0x34373f);
    gridHelper.position.set(0.5, 0, 0.5);
    staticGroup.add(gridHelper);

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
      staticGroup.add(new THREE.Line(geom, mat));
    };
    addAxisLine([0, 0, 0], [1.65, 0, 0], "#8D9FCE");
    addAxisLine([0, 0, 0], [0, 0, 1.65], "#96B898");
    addAxisLine([0, 0, 0], [0, 1.85, 0], "#029091");

    const surfaceGroup = new THREE.Group();
    const sliceGroup = new THREE.Group();
    scene.add(surfaceGroup);
    scene.add(sliceGroup);
    surfaceGroupRef.current = surfaceGroup;
    sliceGroupRef.current = sliceGroup;

    const renderLoop = createDemandDrivenRenderLoop({
      container,
      renderer,
      scene,
      camera,
      controls,
    });
    renderLoopRef.current = renderLoop;

    const handleResize = () => {
      const w = container.clientWidth || 520;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderLoop.requestRender(2);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderLoop.dispose();
      renderLoopRef.current = null;
      disposeThreeGroupChildren(surfaceGroup);
      disposeThreeGroupChildren(sliceGroup);
      disposeThreeGroupChildren(staticGroup);
      surfaceGroupRef.current = null;
      sliceGroupRef.current = null;
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  // Rebuild Surface Mesh, Floor Region, and Boundary Curves whenever integrand or limits change
  useEffect(() => {
    const surfaceGroup = surfaceGroupRef.current;
    if (!surfaceGroup) return;

    disposeThreeGroupChildren(surfaceGroup);

    const nu = 52;
    const nv = 52;
    const positions: number[] = [];
    const basePositions: number[] = [];
    const indices: number[] = [];
    const lowerCurvePts: THREE.Vector3[] = [];
    const upperCurvePts: THREE.Vector3[] = [];

    if (order === "dydx") {
      const [xA, xB] = xRange;
      for (let i = 0; i <= nu; i++) {
        const u = i / nu;
        const x = xA + u * (xB - xA);
        const [yMin, yMax] = evalYBounds(x);
        lowerCurvePts.push(new THREE.Vector3(x, 0.008, yMin));
        upperCurvePts.push(new THREE.Vector3(x, 0.008, yMax));

        for (let j = 0; j <= nv; j++) {
          const v = j / nv;
          const y = yMin + v * (yMax - yMin);
          const z = evalF(x, y);
          positions.push(x, z, y);
          basePositions.push(x, 0.002, y);
        }
      }
    } else {
      const [yC, yD] = yRange;
      for (let i = 0; i <= nu; i++) {
        const u = i / nu;
        const y = yC + u * (yD - yC);
        const [xMin, xMax] = evalXBounds(y);
        lowerCurvePts.push(new THREE.Vector3(xMin, 0.008, y));
        upperCurvePts.push(new THREE.Vector3(xMax, 0.008, y));

        for (let j = 0; j <= nv; j++) {
          const v = j / nv;
          const x = xMin + v * (xMax - xMin);
          const z = evalF(x, y);
          positions.push(x, z, y);
          basePositions.push(x, 0.002, y);
        }
      }
    }

    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
        const a = i * (nv + 1) + j;
        const b = (i + 1) * (nv + 1) + j;
        const c = (i + 1) * (nv + 1) + (j + 1);
        const d = i * (nv + 1) + (j + 1);
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

    surfaceGroup.add(
      new THREE.Mesh(
        surfaceGeom,
        new THREE.MeshLambertMaterial({
          color: "#8D9FCE",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65,
        })
      )
    );
    surfaceGroup.add(
      new THREE.Mesh(
        surfaceGeom,
        new THREE.MeshBasicMaterial({
          color: "#FFFBE4",
          wireframe: true,
          transparent: true,
          opacity: 0.14,
        })
      )
    );

    const baseGeom = new THREE.BufferGeometry();
    baseGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(basePositions, 3)
    );
    baseGeom.setIndex(indices);
    surfaceGroup.add(
      new THREE.Mesh(
        baseGeom,
        new THREE.MeshBasicMaterial({
          color: "#029091",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.28,
        })
      )
    );

    // Lower & Upper boundary curves on the xy-plane
    surfaceGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(lowerCurvePts),
        new THREE.LineBasicMaterial({ color: "#D5658B" })
      )
    );
    surfaceGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(upperCurvePts),
        new THREE.LineBasicMaterial({ color: "#B95869" })
      )
    );
    renderLoopRef.current?.requestRender(2);
  }, [order, xRange, yRange, evalYBounds, evalXBounds, evalF]);

  // Update 3D Slice Curtain Geometry whenever order, slicePos, bounds, or evalF changes
  useEffect(() => {
    const group = sliceGroupRef.current;
    if (!group) return;

    disposeThreeGroupChildren(group);

    const steps = 48;
    const vertices: number[] = [];
    const indices: number[] = [];
    const topEdgePts: THREE.Vector3[] = [];
    const baseEdgePts: THREE.Vector3[] = [];

    if (order === "dydx") {
      const x = slicePos;
      const [yMin, yMax] = evalYBounds(x);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const y = yMin + t * (yMax - yMin);
        const z = evalF(x, y);
        vertices.push(x, 0, y);
        vertices.push(x, z, y);
        topEdgePts.push(new THREE.Vector3(x, z, y));
        baseEdgePts.push(new THREE.Vector3(x, 0.012, y));
      }
    } else {
      const y = slicePos;
      const [xMin, xMax] = evalXBounds(y);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = xMin + t * (xMax - xMin);
        const z = evalF(x, y);
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

    group.add(
      new THREE.Mesh(
        curtainGeom,
        new THREE.MeshBasicMaterial({
          color: "#D35323",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.72,
        })
      )
    );
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
    renderLoopRef.current?.requestRender(2);
  }, [order, slicePos, evalYBounds, evalXBounds, evalF]);

  return <div ref={mountRef} className="w-full h-full" />;
}
