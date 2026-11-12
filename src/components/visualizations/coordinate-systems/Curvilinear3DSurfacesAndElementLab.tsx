"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Box,
  ChevronDown,
  Compass,
  Eye,
  Focus,
  Layers,
  RotateCcw,
} from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";

type CoordSystem = "cartesian" | "cylindrical" | "spherical";

interface CurvilinearRegionPreset {
  id: string;
  system: CoordSystem;
  label: string;
  badge: string;
  integrandExpr: string;
  outerMinExpr: string;
  outerMaxExpr: string;
  midMinExpr: string;
  midMaxExpr: string;
  innerMinExpr: string;
  innerMaxExpr: string;
  description: string;
}

const REGION_PRESETS: CurvilinearRegionPreset[] = [
  {
    id: "cyl-cone",
    system: "cylindrical",
    label: "Inverted Cone (r ≤ z ≤ 1.2)",
    badge: "Cylindrical Symmetry",
    integrandExpr: "1",
    outerMinExpr: "0",
    outerMaxExpr: "pi/2",
    midMinExpr: "0",
    midMaxExpr: "1.2",
    innerMinExpr: "r",
    innerMaxExpr: "1.2",
    description:
      "In Cartesian coordinates, the cone z = √(x² + y²) introduces awkward square roots. In Cylindrical coordinates, it simplifies to the linear bound z = r, with dV = r dr dθ dz!",
  },
  {
    id: "cyl-paraboloid",
    system: "cylindrical",
    label: "Paraboloid Dome (0 ≤ z ≤ 1.3 - r²)",
    badge: "z = 1.3 - r²",
    integrandExpr: "1 + 0.5*z",
    outerMinExpr: "0",
    outerMaxExpr: "pi/2",
    midMinExpr: "0",
    midMaxExpr: "1.14",
    innerMinExpr: "0",
    innerMaxExpr: "1.3 - r^2",
    description:
      "The circular paraboloid z = 1.3 - (x² + y²) becomes z = 1.3 - r² in Cylindrical coordinates, and the extra Jacobian factor r in dV = r dr dθ dz makes ∫ (1.3 - r²) r dr immediate via u-substitution!",
  },
  {
    id: "sph-ice-cream",
    system: "spherical",
    label: "Ice-Cream Cone Sector (φ ≤ π/3, ρ ≤ 1.3)",
    badge: "Spherical Constant Bounds",
    integrandExpr: "1",
    outerMinExpr: "0",
    outerMaxExpr: "pi/2",
    midMinExpr: "0",
    midMaxExpr: "pi/3",
    innerMinExpr: "0",
    innerMaxExpr: "1.3",
    description:
      "Bounded inside the cone φ = π/3 (60° from the +z axis) and the sphere ρ = 1.3. In Spherical coordinates, ALL SIX limits are constants!",
  },
  {
    id: "sph-shell",
    system: "spherical",
    label: "Thick Spherical Shell (0.6 ≤ ρ ≤ 1.3)",
    badge: "Hollow Hemisphere",
    integrandExpr: "rho",
    outerMinExpr: "0",
    outerMaxExpr: "pi/2",
    midMinExpr: "0",
    midMaxExpr: "pi/2",
    innerMinExpr: "0.6",
    innerMaxExpr: "1.3",
    description:
      "Models a hollow pressure vessel or planetary mantle shell between inner radius ρ = 0.6 and outer radius ρ = 1.3 in the first octant.",
  },
  {
    id: "cart-tetra",
    system: "cartesian",
    label: "First-Octant Tetrahedron (x+y+z ≤ 1.3)",
    badge: "Planar Faces",
    integrandExpr: "1",
    outerMinExpr: "0",
    outerMaxExpr: "1.3",
    midMinExpr: "0",
    midMaxExpr: "1.3 - x",
    innerMinExpr: "0",
    innerMaxExpr: "1.3 - x - y",
    description:
      "Solids bounded by flat coordinate planes and tilted planes are naturally suited to Cartesian coordinates (x, y, z) where dV = dx dy dz.",
  },
];

export function Curvilinear3DSurfacesAndElementLab() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRefs = useRef<{
    surfacesGroup: THREE.Group;
    wedgeGroup: THREE.Group;
    triadGroup: THREE.Group;
    customSolidGroup: THREE.Group;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
  } | null>(null);

  const [system, setSystem] = useState<CoordSystem>("spherical");

  // Master point P stored in Cartesian (x, y, z) in the first octant so switching systems preserves the exact same point P in 3D space!
  const [px, setPx] = useState<number>(0.68);
  const [py, setPy] = useState<number>(0.58);
  const [pz, setPz] = useState<number>(0.76);

  // Differential step sizes for the 3D volume element dV
  const [dq1, setDq1] = useState<number>(0.24); // dx, dr, or dρ
  const [dq2, setDq2] = useState<number>(0.24); // dy, dθ (rad), or dφ (rad)
  const [dq3, setDq3] = useState<number>(0.24); // dz, dz, or dθ (rad)

  // Visibility toggles
  const [showSurf1, setShowSurf1] = useState<boolean>(true);
  const [showSurf2, setShowSurf2] = useState<boolean>(true);
  const [showSurf3, setShowSurf3] = useState<boolean>(true);
  const [showBasisTriad, setShowBasisTriad] = useState<boolean>(true);
  const [showWedgeDV, setShowWedgeDV] = useState<boolean>(true);
  const [showCustomSolid, setShowCustomSolid] = useState<boolean>(true);
  const [zoomToWedge, setZoomToWedge] = useState<boolean>(false);

  // Custom 3D Region & Triple Integral state
  const [presetId, setPresetId] = useState<string>("sph-ice-cream");
  const [integrandExpr, setIntegrandExpr] = useState<string>("1");
  const [outerMinExpr, setOuterMinExpr] = useState<string>("0");
  const [outerMaxExpr, setOuterMaxExpr] = useState<string>("pi/2");
  const [midMinExpr, setMidMinExpr] = useState<string>("0");
  const [midMaxExpr, setMidMaxExpr] = useState<string>("pi/3");
  const [innerMinExpr, setInnerMinExpr] = useState<string>("0");
  const [innerMaxExpr, setInnerMaxExpr] = useState<string>("1.3");

  // Derived coordinates of point P in all 3 coordinate systems
  const coords = useMemo(() => {
    const r = Math.max(0.05, Math.hypot(px, py));
    const theta = Math.atan2(py, px);
    const rho = Math.max(0.08, Math.hypot(px, py, pz));
    const phi = Math.acos(Math.max(-1, Math.min(1, pz / rho)));

    // Edge lengths of the infinitesimal volume element dV at P
    let edge1Label = "Δx";
    let edge2Label = "Δy";
    let edge3Label = "Δz";
    let edge1Val = dq1;
    let edge2Val = dq2;
    let edge3Val = dq3;
    let jacobianVal = 1.0;

    if (system === "cylindrical") {
      edge1Label = "Δr";
      edge2Label = "r Δθ";
      edge3Label = "Δz";
      edge1Val = dq1;
      edge2Val = r * dq2;
      edge3Val = dq3;
      jacobianVal = r;
    } else if (system === "spherical") {
      edge1Label = "Δρ";
      edge2Label = "ρ Δφ";
      edge3Label = "ρ sin(φ) Δθ";
      edge1Val = dq1;
      edge2Val = rho * dq2;
      edge3Val = rho * Math.sin(phi) * dq3;
      jacobianVal = rho * rho * Math.sin(phi);
    }

    const dVLinear = edge1Val * edge2Val * edge3Val;

    return {
      x: px,
      y: py,
      z: pz,
      r,
      theta,
      thetaDeg: (theta * 180) / Math.PI,
      rho,
      phi,
      phiDeg: (phi * 180) / Math.PI,
      edge1Label,
      edge2Label,
      edge3Label,
      edge1Val,
      edge2Val,
      edge3Val,
      jacobianVal,
      dVLinear,
    };
  }, [px, py, pz, dq1, dq2, dq3, system]);

  // Handlers to update P from Cylindrical or Spherical sliders
  const updateFromCylindrical = (newR: number, newTheta: number, newZ: number) => {
    setPx(newR * Math.cos(newTheta));
    setPy(newR * Math.sin(newTheta));
    setPz(newZ);
  };

  const updateFromSpherical = (
    newRho: number,
    newPhi: number,
    newTheta: number
  ) => {
    setPx(newRho * Math.sin(newPhi) * Math.cos(newTheta));
    setPy(newRho * Math.sin(newPhi) * Math.sin(newTheta));
    setPz(newRho * Math.cos(newPhi));
  };

  const handleSelectSystem = (nextSys: CoordSystem) => {
    setSystem(nextSys);
    const matchingPreset = REGION_PRESETS.find((p) => p.system === nextSys);
    if (matchingPreset) {
      setPresetId(matchingPreset.id);
      setIntegrandExpr(matchingPreset.integrandExpr);
      setOuterMinExpr(matchingPreset.outerMinExpr);
      setOuterMaxExpr(matchingPreset.outerMaxExpr);
      setMidMinExpr(matchingPreset.midMinExpr);
      setMidMaxExpr(matchingPreset.midMaxExpr);
      setInnerMinExpr(matchingPreset.innerMinExpr);
      setInnerMaxExpr(matchingPreset.innerMaxExpr);
    }
  };

  const handleSelectPreset = (p: CurvilinearRegionPreset) => {
    setSystem(p.system);
    setPresetId(p.id);
    setIntegrandExpr(p.integrandExpr);
    setOuterMinExpr(p.outerMinExpr);
    setOuterMaxExpr(p.outerMaxExpr);
    setMidMinExpr(p.midMinExpr);
    setMidMaxExpr(p.midMaxExpr);
    setInnerMinExpr(p.innerMinExpr);
    setInnerMaxExpr(p.innerMaxExpr);
  };

  // Variable names for the active coordinate system's triple integral
  const varSpec = useMemo(() => {
    if (system === "cartesian") {
      return {
        outerVar: "x",
        midVar: "y",
        innerVar: "z",
        outerTex: "x",
        midTex: "y",
        innerTex: "z",
        jacobianTex: "",
        allowedIntegrandVars: ["x", "y", "z"],
      };
    }
    if (system === "cylindrical") {
      return {
        outerVar: "theta",
        midVar: "r",
        innerVar: "z",
        outerTex: "\\theta",
        midTex: "r",
        innerTex: "z",
        jacobianTex: "\\textcolor{#FBEAA4}{r}\\,",
        allowedIntegrandVars: ["r", "theta", "z", "x", "y"],
      };
    }
    return {
      outerVar: "theta",
      midVar: "phi",
      innerVar: "rho",
      outerTex: "\\theta",
      midTex: "\\phi",
      innerTex: "\\rho",
      jacobianTex: "\\textcolor{#FBEAA4}{\\rho^2\\sin\\phi}\\,",
      allowedIntegrandVars: ["rho", "phi", "theta", "x", "y", "z"],
    };
  }, [system]);

  // Compile user-typed integrand & all 6 curvilinear integral limits
  const compiledIntegrand = useMemo(
    () =>
      compileMathExpression(integrandExpr, varSpec.allowedIntegrandVars, 0),
    [integrandExpr, varSpec.allowedIntegrandVars]
  );
  const compiledOuterMin = useMemo(
    () => compileMathExpression(outerMinExpr, [], 0),
    [outerMinExpr]
  );
  const compiledOuterMax = useMemo(
    () => compileMathExpression(outerMaxExpr, [], Math.PI / 2),
    [outerMaxExpr]
  );
  const compiledMidMin = useMemo(
    () => compileMathExpression(midMinExpr, [varSpec.outerVar], 0),
    [midMinExpr, varSpec.outerVar]
  );
  const compiledMidMax = useMemo(
    () => compileMathExpression(midMaxExpr, [varSpec.outerVar], 1),
    [midMaxExpr, varSpec.outerVar]
  );
  const compiledInnerMin = useMemo(
    () =>
      compileMathExpression(
        innerMinExpr,
        [varSpec.outerVar, varSpec.midVar],
        0
      ),
    [innerMinExpr, varSpec.outerVar, varSpec.midVar]
  );
  const compiledInnerMax = useMemo(
    () =>
      compileMathExpression(
        innerMaxExpr,
        [varSpec.outerVar, varSpec.midVar],
        1
      ),
    [innerMaxExpr, varSpec.outerVar, varSpec.midVar]
  );

  const outerRange = useMemo((): [number, number] => {
    const a = Math.max(-2 * Math.PI, Math.min(2 * Math.PI, compiledOuterMin.evaluate({})));
    const b = Math.max(a + 0.05, Math.min(2 * Math.PI, compiledOuterMax.evaluate({})));
    return [a, b];
  }, [compiledOuterMin, compiledOuterMax]);

  const evalMidBounds = React.useCallback(
    (oVal: number): [number, number] => {
      const scope = { [varSpec.outerVar]: oVal };
      const m1 = Math.max(0, Math.min(Math.PI, compiledMidMin.evaluate(scope)));
      const m2 = Math.max(m1, Math.min(Math.PI, compiledMidMax.evaluate(scope)));
      return [m1, m2];
    },
    [compiledMidMin, compiledMidMax, varSpec.outerVar]
  );

  const evalInnerBounds = React.useCallback(
    (oVal: number, mVal: number): [number, number] => {
      const scope = { [varSpec.outerVar]: oVal, [varSpec.midVar]: mVal };
      const i1 = Math.max(0, Math.min(2.5, compiledInnerMin.evaluate(scope)));
      const i2 = Math.max(i1, Math.min(2.5, compiledInnerMax.evaluate(scope)));
      return [i1, i2];
    },
    [compiledInnerMin, compiledInnerMax, varSpec.outerVar, varSpec.midVar]
  );

  // Convert (outerVal, midVal, innerVal) in the active system to Cartesian (x, y, z)
  const mapActiveToXYZ = React.useCallback(
    (oVal: number, mVal: number, inVal: number): [number, number, number] => {
      if (system === "cartesian") {
        return [oVal, mVal, inVal];
      }
      if (system === "cylindrical") {
        // outer = theta, mid = r, inner = z
        const theta = oVal;
        const r = mVal;
        const z = inVal;
        return [r * Math.cos(theta), r * Math.sin(theta), z];
      }
      // spherical: outer = theta, mid = phi, inner = rho
      const theta = oVal;
      const phi = mVal;
      const rho = inVal;
      return [
        rho * Math.sin(phi) * Math.cos(theta),
        rho * Math.sin(phi) * Math.sin(theta),
        rho * Math.cos(phi),
      ];
    },
    [system]
  );

  // Numerically evaluate the Triple Integral in the active coordinate system
  const evaluatedIntegral = useMemo(() => {
    const N = 16;
    const [oA, oB] = outerRange;
    const dO = (oB - oA) / N;
    if (dO <= 0) return 0;
    let total = 0;

    for (let i = 0; i < N; i++) {
      const oVal = oA + (i + 0.5) * dO;
      const [m1, m2] = evalMidBounds(oVal);
      const dM = (m2 - m1) / N;
      if (dM <= 0) continue;

      for (let j = 0; j < N; j++) {
        const mVal = m1 + (j + 0.5) * dM;
        const [in1, in2] = evalInnerBounds(oVal, mVal);
        const dIn = (in2 - in1) / N;
        if (dIn <= 0) continue;

        for (let k = 0; k < N; k++) {
          const inVal = in1 + (k + 0.5) * dIn;
          const [x, y, z] = mapActiveToXYZ(oVal, mVal, inVal);
          let jac = 1;
          const scope: Record<string, number> = { x, y, z };

          if (system === "cylindrical") {
            scope.theta = oVal;
            scope.r = mVal;
            jac = mVal; // r
          } else if (system === "spherical") {
            scope.theta = oVal;
            scope.phi = mVal;
            scope.rho = inVal;
            jac = inVal * inVal * Math.sin(mVal); // rho^2 sin(phi)
          }

          const fVal = compiledIntegrand.evaluate(scope);
          total += fVal * jac * dIn * dM * dO;
        }
      }
    }
    return total;
  }, [
    system,
    outerRange,
    evalMidBounds,
    evalInnerBounds,
    mapActiveToXYZ,
    compiledIntegrand,
  ]);

  // Initialize Three.js 3D Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1E1F22");

    // Math (x, y, z) -> Three (x, z, y)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.65, 2.15, 2.65);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.55, 0.55, 0.55);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.8;
    controls.maxDistance = 8;

    scene.add(new THREE.AmbientLight(0xfffbe4, 0.78));
    const dirLight = new THREE.DirectionalLight(0xfffbe4, 0.78);
    dirLight.position.set(3.5, 5.5, 3);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(2.0, 10, 0xaaa36d, 0x32353d);
    grid.position.set(0.6, 0, 0.6);
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
    addAxis([1.75, 0, 0], "#8D9FCE"); // x
    addAxis([0, 0, 1.75], "#96B898"); // y
    addAxis([0, 1.75, 0], "#029091"); // z

    const surfacesGroup = new THREE.Group();
    const wedgeGroup = new THREE.Group();
    const triadGroup = new THREE.Group();
    const customSolidGroup = new THREE.Group();
    scene.add(surfacesGroup);
    scene.add(customSolidGroup);
    scene.add(wedgeGroup);
    scene.add(triadGroup);

    sceneRefs.current = {
      surfacesGroup,
      wedgeGroup,
      triadGroup,
      customSolidGroup,
      camera,
      controls,
    };

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
      const h = container.clientHeight || 420;
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

  // Update Camera Focus when zoomToWedge toggles
  useEffect(() => {
    const refs = sceneRefs.current;
    if (!refs) return;
    const { camera, controls } = refs;
    if (zoomToWedge) {
      controls.target.set(coords.x, coords.z, coords.y);
      camera.position.set(
        coords.x + 0.95,
        coords.z + 0.75,
        coords.y + 0.95
      );
    } else {
      controls.target.set(0.55, 0.55, 0.55);
      camera.position.set(2.65, 2.15, 2.65);
    }
    controls.update();
  }, [zoomToWedge, coords.x, coords.y, coords.z]);

  // Rebuild 3D Intersecting Coordinate Surfaces, dV Wedge, and Local Orthonormal Basis Triad
  useEffect(() => {
    const refs = sceneRefs.current;
    if (!refs) return;
    const { surfacesGroup, wedgeGroup, triadGroup } = refs;

    const clearGroup = (grp: THREE.Group) => {
      while (grp.children.length > 0) {
        const c = grp.children[0] as THREE.Mesh;
        if (c.geometry) c.geometry.dispose();
        grp.remove(c);
      }
    };
    clearGroup(surfacesGroup);
    clearGroup(wedgeGroup);
    clearGroup(triadGroup);

    const buildParametricSurface = (
      evalPt: (u: number, v: number) => [number, number, number],
      hex: string,
      opacity = 0.25,
      nu = 28,
      nv = 28
    ) => {
      const positions: number[] = [];
      const indices: number[] = [];
      for (let i = 0; i <= nu; i++) {
        const u = i / nu;
        for (let j = 0; j <= nv; j++) {
          const v = j / nv;
          const [x, y, z] = evalPt(u, v);
          // Math (x, y, z) -> Three (x, z, y)
          positions.push(x, z, y);
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
      const geom = new THREE.BufferGeometry();
      geom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geom.setIndex(indices);
      geom.computeVertexNormals();

      const mesh = new THREE.Mesh(
        geom,
        new THREE.MeshLambertMaterial({
          color: hex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity,
        })
      );
      const wire = new THREE.Mesh(
        geom,
        new THREE.MeshBasicMaterial({
          color: hex,
          wireframe: true,
          transparent: true,
          opacity: opacity * 0.45,
        })
      );
      surfacesGroup.add(mesh);
      surfacesGroup.add(wire);
    };

    const { x, y, z, r, theta, rho, phi } = coords;

    // 1. Intersecting Orthogonal Coordinate Surfaces
    if (system === "cartesian") {
      if (showSurf1) {
        // Plane x = x0
        buildParametricSurface(
          (u, v) => [x, u * 1.45, v * 1.45],
          "#8D9FCE",
          0.24,
          12,
          12
        );
      }
      if (showSurf2) {
        // Plane y = y0
        buildParametricSurface(
          (u, v) => [u * 1.45, y, v * 1.45],
          "#96B898",
          0.24,
          12,
          12
        );
      }
      if (showSurf3) {
        // Plane z = z0
        buildParametricSurface(
          (u, v) => [u * 1.45, v * 1.45, z],
          "#029091",
          0.24,
          12,
          12
        );
      }
    } else if (system === "cylindrical") {
      if (showSurf1) {
        // Cylinder r = r0 in first octant
        buildParametricSurface(
          (u, v) => {
            const ang = u * (Math.PI / 2);
            return [r * Math.cos(ang), r * Math.sin(ang), v * 1.45];
          },
          "#8D9FCE",
          0.26
        );
      }
      if (showSurf2) {
        // Half-plane theta = theta0
        buildParametricSurface(
          (u, v) => {
            const rad = u * 1.45;
            return [rad * Math.cos(theta), rad * Math.sin(theta), v * 1.45];
          },
          "#96B898",
          0.26,
          14,
          14
        );
      }
      if (showSurf3) {
        // Horizontal disk z = z0
        buildParametricSurface(
          (u, v) => {
            const rad = u * 1.45;
            const ang = v * (Math.PI / 2);
            return [rad * Math.cos(ang), rad * Math.sin(ang), z];
          },
          "#029091",
          0.24
        );
      }
    } else {
      // Spherical (rho, phi, theta)
      if (showSurf1) {
        // Sphere rho = rho0 (first octant)
        buildParametricSurface(
          (u, v) => {
            const p = u * (Math.PI / 2);
            const t = v * (Math.PI / 2);
            return [
              rho * Math.sin(p) * Math.cos(t),
              rho * Math.sin(p) * Math.sin(t),
              rho * Math.cos(p),
            ];
          },
          "#8D9FCE",
          0.26
        );
      }
      if (showSurf2) {
        // Cone phi = phi0
        buildParametricSurface(
          (u, v) => {
            const rad = u * 1.45;
            const t = v * (Math.PI / 2);
            return [
              rad * Math.sin(phi) * Math.cos(t),
              rad * Math.sin(phi) * Math.sin(t),
              rad * Math.cos(phi),
            ];
          },
          "#D5658B",
          0.28
        );
      }
      if (showSurf3) {
        // Half-plane theta = theta0
        buildParametricSurface(
          (u, v) => {
            const rad = u * 1.45;
            const p = v * (Math.PI / 2);
            return [
              rad * Math.sin(p) * Math.cos(theta),
              rad * Math.sin(p) * Math.sin(theta),
              rad * Math.cos(p),
            ];
          },
          "#96B898",
          0.26
        );
      }
    }

    // 2. Build 3D Differential Volume Element dV Wedge at Point P
    if (showWedgeDV) {
      const mapWedgeCoord = (
        u: number,
        v: number,
        w: number
      ): [number, number, number] => {
        if (system === "cartesian") {
          return [x + u * dq1, y + v * dq2, z + w * dq3];
        }
        if (system === "cylindrical") {
          const R = r + u * dq1;
          const T = theta + v * dq2;
          const Z = z + w * dq3;
          return [R * Math.cos(T), R * Math.sin(T), Z];
        }
        const RHO = rho + u * dq1;
        const PHI = phi + v * dq2;
        const THETA = theta + w * dq3;
        return [
          RHO * Math.sin(PHI) * Math.cos(THETA),
          RHO * Math.sin(PHI) * Math.sin(THETA),
          RHO * Math.cos(PHI),
        ];
      };

      const buildWedgeFace = (
        evalFace: (s: number, t: number) => [number, number, number]
      ) => {
        const res = 10;
        const pos: number[] = [];
        const idx: number[] = [];
        for (let i = 0; i <= res; i++) {
          const s = i / res;
          for (let j = 0; j <= res; j++) {
            const t = j / res;
            const [wx, wy, wz] = evalFace(s, t);
            pos.push(wx, wz, wy);
          }
        }
        for (let i = 0; i < res; i++) {
          for (let j = 0; j < res; j++) {
            const a = i * (res + 1) + j;
            const b = (i + 1) * (res + 1) + j;
            const c = (i + 1) * (res + 1) + (j + 1);
            const d = i * (res + 1) + (j + 1);
            idx.push(a, b, d);
            idx.push(b, c, d);
          }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        wedgeGroup.add(
          new THREE.Mesh(
            g,
            new THREE.MeshLambertMaterial({
              color: "#FBEAA4",
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.78,
            })
          )
        );
      };

      // 6 faces of the curvilinear dV element
      buildWedgeFace((s, t) => mapWedgeCoord(0, s, t));
      buildWedgeFace((s, t) => mapWedgeCoord(1, s, t));
      buildWedgeFace((s, t) => mapWedgeCoord(s, 0, t));
      buildWedgeFace((s, t) => mapWedgeCoord(s, 1, t));
      buildWedgeFace((s, t) => mapWedgeCoord(s, t, 0));
      buildWedgeFace((s, t) => mapWedgeCoord(s, t, 1));

      // Highlight the 3 principal orthogonal edges emanating from P
      const addWedgeEdge = (
        evalCurve: (t: number) => [number, number, number],
        hex: string
      ) => {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 16; i++) {
          const [ex, ey, ez] = evalCurve(i / 16);
          pts.push(new THREE.Vector3(ex, ez, ey));
        }
        wedgeGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            new THREE.LineBasicMaterial({ color: hex })
          )
        );
      };
      addWedgeEdge((t) => mapWedgeCoord(t, 0, 0), "#8D9FCE");
      addWedgeEdge((t) => mapWedgeCoord(0, t, 0), "#D5658B");
      addWedgeEdge((t) => mapWedgeCoord(0, 0, t), "#96B898");
    }

    // 3. Point P Sphere & Local Orthonormal Basis Triad
    const pThree = new THREE.Vector3(x, z, y);
    const pointSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 16, 16),
      new THREE.MeshBasicMaterial({ color: "#D35323" })
    );
    pointSphere.position.copy(pThree);
    triadGroup.add(pointSphere);

    if (showBasisTriad) {
      let e1: [number, number, number] = [1, 0, 0];
      let e2: [number, number, number] = [0, 1, 0];
      let e3: [number, number, number] = [0, 0, 1];

      if (system === "cylindrical") {
        e1 = [Math.cos(theta), Math.sin(theta), 0]; // e_r
        e2 = [-Math.sin(theta), Math.cos(theta), 0]; // e_theta
        e3 = [0, 0, 1]; // e_z
      } else if (system === "spherical") {
        e1 = [
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi),
        ]; // e_rho
        e2 = [
          Math.cos(phi) * Math.cos(theta),
          Math.cos(phi) * Math.sin(theta),
          -Math.sin(phi),
        ]; // e_phi
        e3 = [-Math.sin(theta), Math.cos(theta), 0]; // e_theta
      }

      const addBasisArrow = (
        mathVec: [number, number, number],
        hexColor: number
      ) => {
        // Math (vx, vy, vz) -> Three (vx, vz, vy)
        const dir = new THREE.Vector3(
          mathVec[0],
          mathVec[2],
          mathVec[1]
        ).normalize();
        const arrow = new THREE.ArrowHelper(
          dir,
          pThree,
          0.36,
          hexColor,
          0.09,
          0.05
        );
        triadGroup.add(arrow);
      };

      addBasisArrow(e1, 0x8d9fce);
      addBasisArrow(e2, 0xd5658b);
      addBasisArrow(e3, 0x96b898);
    }
  }, [
    system,
    coords,
    dq1,
    dq2,
    dq3,
    showSurf1,
    showSurf2,
    showSurf3,
    showWedgeDV,
    showBasisTriad,
  ]);

  // Rebuild Custom Curvilinear 3D Region E Mesh when limits or system change
  useEffect(() => {
    const refs = sceneRefs.current;
    if (!refs) return;
    const { customSolidGroup } = refs;

    while (customSolidGroup.children.length > 0) {
      const c = customSolidGroup.children[0] as THREE.Mesh;
      if (c.geometry) c.geometry.dispose();
      customSolidGroup.remove(c);
    }

    if (!showCustomSolid) return;

    const nO = 36;
    const nM = 36;
    const topPos: number[] = [];
    const botPos: number[] = [];
    const indices: number[] = [];
    const [oA, oB] = outerRange;

    for (let i = 0; i <= nO; i++) {
      const oVal = oA + (i / nO) * (oB - oA);
      const [m1, m2] = evalMidBounds(oVal);
      for (let j = 0; j <= nM; j++) {
        const mVal = m1 + (j / nM) * (m2 - m1);
        const [in1, in2] = evalInnerBounds(oVal, mVal);
        const pTop = mapActiveToXYZ(oVal, mVal, in2);
        const pBot = mapActiveToXYZ(oVal, mVal, in1);
        topPos.push(pTop[0], pTop[2], pTop[1]);
        botPos.push(pBot[0], pBot[2], pBot[1]);
      }
    }

    for (let i = 0; i < nO; i++) {
      for (let j = 0; j < nM; j++) {
        const a = i * (nM + 1) + j;
        const b = (i + 1) * (nM + 1) + j;
        const c = (i + 1) * (nM + 1) + (j + 1);
        const d = i * (nM + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const topGeom = new THREE.BufferGeometry();
    topGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(topPos, 3)
    );
    topGeom.setIndex(indices);
    topGeom.computeVertexNormals();

    customSolidGroup.add(
      new THREE.Mesh(
        topGeom,
        new THREE.MeshLambertMaterial({
          color: "#029091",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.28,
        })
      )
    );
    customSolidGroup.add(
      new THREE.Mesh(
        topGeom,
        new THREE.MeshBasicMaterial({
          color: "#FFFBE4",
          wireframe: true,
          transparent: true,
          opacity: 0.1,
        })
      )
    );

    if (innerMinExpr.trim() !== "0") {
      const botGeom = new THREE.BufferGeometry();
      botGeom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(botPos, 3)
      );
      botGeom.setIndex(indices);
      botGeom.computeVertexNormals();
      customSolidGroup.add(
        new THREE.Mesh(
          botGeom,
          new THREE.MeshLambertMaterial({
            color: "#D5658B",
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.25,
          })
        )
      );
    }
  }, [
    showCustomSolid,
    outerRange,
    evalMidBounds,
    evalInnerBounds,
    mapActiveToXYZ,
    innerMinExpr,
  ]);

  const activeTripleIntegralLatex = `\\int_{\\textcolor{#8D9FCE}{${compiledOuterMin.tex}}}^{\\textcolor{#8D9FCE}{${compiledOuterMax.tex}}} \\int_{\\textcolor{#96B898}{${compiledMidMin.tex}}}^{\\textcolor{#96B898}{${compiledMidMax.tex}}} \\int_{\\textcolor{#D5658B}{${compiledInnerMin.tex}}}^{\\textcolor{#B95869}{${compiledInnerMax.tex}}} \\left(${compiledIntegrand.tex}\\right)\\,${varSpec.jacobianTex}d${varSpec.innerTex}\\,d${varSpec.midTex}\\,d${varSpec.outerTex} \\approx \\textcolor{#FBEAA4}{${evaluatedIntegral.toFixed(
    4
  )}}`;

  const activePresetDescription = useMemo(() => {
    const match = REGION_PRESETS.find((p) => p.id === presetId);
    return (
      match?.description ??
      "Custom user-defined 3D solid region E integrated in curvilinear coordinates."
    );
  }, [presetId]);

  return (
    <section
      id="3d-coordinate-surfaces"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 sm:p-6 space-y-6 scroll-mt-24"
    >
      {/* Header & 3-System Selector */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[#029091]">
            <Layers className="w-4 h-4" aria-hidden="true" />
            <span>
              Interactive Laboratory 03.2 – 03.3 • 3D Coordinate Surfaces, Basis
              Triads &amp; dV Magnifier
            </span>
          </div>
          <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            Cartesian <KaTeXMath math="(x,y,z)" />, Cylindrical{" "}
            <KaTeXMath math="(r,\theta,z)" /> &amp; Spherical{" "}
            <KaTeXMath math="(\rho,\phi,\theta)" /> Inspector
          </h2>
          <p className="font-math-serif text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl">
            Switch between all 3 coordinate systems below to see the{" "}
            <strong>3 orthogonal coordinate surfaces</strong> intersecting at
            point <KaTeXMath math="P" />, the rotating{" "}
            <strong>local orthonormal basis vectors</strong>, the{" "}
            <strong>3D differential volume element <KaTeXMath math="dV" /></strong>,
            and define any custom 3D region to integrate!
          </p>
        </div>

        {/* 3-System Mode Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              {
                id: "cartesian",
                label: "Cartesian (x, y, z)",
                sub: "dV = dx dy dz",
              },
              {
                id: "cylindrical",
                label: "Cylindrical (r, θ, z)",
                sub: "dV = r dr dθ dz",
              },
              {
                id: "spherical",
                label: "Spherical (ρ, φ, θ)",
                sub: "dV = ρ² sin φ dρ dφ dθ",
              },
            ] as const
          ).map((sys) => {
            const active = sys.id === system;
            return (
              <button
                key={sys.id}
                type="button"
                onClick={() => handleSelectSystem(sys.id)}
                className={`px-3.5 py-2 border text-left transition-colors cursor-pointer ${
                  active
                    ? "border-[var(--border-strong)] bg-[var(--bg-panel-elevated)] text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="text-xs font-tabular-mono font-semibold block">
                  {sys.label}
                </span>
                <span className="text-[10px] font-tabular-mono text-[#FBEAA4] block">
                  {sys.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bidirectional Live Coordinate Readout Bar Across All 3 Systems */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          className={`p-3 border font-tabular-mono text-xs ${
            system === "cartesian"
              ? "border-[#8D9FCE] bg-[var(--bg-panel-elevated)]"
              : "border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
          }`}
        >
          <span className="text-[10px] uppercase text-[#8D9FCE] block">
            Cartesian Coordinates (x, y, z)
          </span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            ({coords.x.toFixed(2)}, {coords.y.toFixed(2)}, {coords.z.toFixed(2)})
          </span>
        </div>

        <div
          className={`p-3 border font-tabular-mono text-xs ${
            system === "cylindrical"
              ? "border-[#96B898] bg-[var(--bg-panel-elevated)]"
              : "border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
          }`}
        >
          <span className="text-[10px] uppercase text-[#96B898] block">
            Cylindrical Coordinates (r, θ, z)
          </span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            (r = {coords.r.toFixed(2)}, θ = {coords.thetaDeg.toFixed(1)}°, z ={" "}
            {coords.z.toFixed(2)})
          </span>
        </div>

        <div
          className={`p-3 border font-tabular-mono text-xs ${
            system === "spherical"
              ? "border-[#D5658B] bg-[var(--bg-panel-elevated)]"
              : "border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
          }`}
        >
          <span className="text-[10px] uppercase text-[#D5658B] block">
            Spherical Coordinates (ρ, φ, θ)
          </span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            (ρ = {coords.rho.toFixed(2)}, φ = {coords.phiDeg.toFixed(1)}°, θ ={" "}
            {coords.thetaDeg.toFixed(1)}°)
          </span>
        </div>
      </div>

      {/* Main Split Workspace: Left 3D WebGL Stage + Right Coordinate Sliders & dV Magnifier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: 3D WebGL Coordinate Surfaces, Basis Triad & dV Wedge */}
        <figure className="lg:col-span-7 border border-[var(--border-subtle)] bg-[#1E1F22] flex flex-col justify-between relative">
          <div className="p-2.5 bg-[#25272C] border-b border-[#383B43] flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono text-[#FFFBE4]">
            <span>3D Intersecting Surfaces, Basis Triad &amp; dV Wedge</span>
            <button
              type="button"
              onClick={() => setZoomToWedge((z) => !z)}
              className={`px-2.5 py-1 border text-[11px] flex items-center gap-1.5 cursor-pointer ${
                zoomToWedge
                  ? "border-[#FBEAA4] bg-[#D35323] text-[#FFFBE4]"
                  : "border-[#383B43] bg-[#1E1F22] text-[#FBEAA4]"
              }`}
            >
              <Focus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {zoomToWedge ? "Reset Full 3D View" : "Zoom Camera to dV Wedge"}
              </span>
            </button>
          </div>

          <div ref={mountRef} className="w-full h-[410px] cursor-grab" />

          {/* Surface Visibility Toggles Bar */}
          <figcaption className="px-3.5 py-2.5 border-t border-[#383B43] bg-[#25272C] flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono text-[#CCC8B8]">
            <label className="flex items-center gap-1.5 cursor-pointer text-[#8D9FCE]">
              <input
                type="checkbox"
                checked={showSurf1}
                onChange={(e) => setShowSurf1(e.target.checked)}
              />
              <span>
                {system === "cartesian"
                  ? "Plane x = x₀"
                  : system === "cylindrical"
                  ? "Cylinder r = r₀"
                  : "Sphere ρ = ρ₀"}
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#D5658B]">
              <input
                type="checkbox"
                checked={showSurf2}
                onChange={(e) => setShowSurf2(e.target.checked)}
              />
              <span>
                {system === "cartesian"
                  ? "Plane y = y₀"
                  : system === "cylindrical"
                  ? "Half-Plane θ = θ₀"
                  : "Cone φ = φ₀"}
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#029091]">
              <input
                type="checkbox"
                checked={showSurf3}
                onChange={(e) => setShowSurf3(e.target.checked)}
              />
              <span>
                {system === "cartesian"
                  ? "Plane z = z₀"
                  : system === "cylindrical"
                  ? "Plane z = z₀"
                  : "Half-Plane θ = θ₀"}
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#FBEAA4]">
              <input
                type="checkbox"
                checked={showWedgeDV}
                onChange={(e) => setShowWedgeDV(e.target.checked)}
              />
              <span>3D dV Wedge</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#AAA36D]">
              <input
                type="checkbox"
                checked={showBasisTriad}
                onChange={(e) => setShowBasisTriad(e.target.checked)}
              />
              <span>Basis Triad</span>
            </label>
          </figcaption>
        </figure>

        {/* Right: Coordinate Sliders + Differential Volume Element dV Inspector */}
        <div
          id="dv-volume-element"
          className="lg:col-span-5 flex flex-col justify-between gap-4 scroll-mt-24"
        >
          {/* Point P Sliders in the Active Coordinate System */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="uppercase text-[var(--text-muted)]">
                1. Locate Point P in{" "}
                {system === "cartesian"
                  ? "(x, y, z)"
                  : system === "cylindrical"
                  ? "(r, θ, z)"
                  : "(ρ, φ, θ)"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPx(0.68);
                  setPy(0.58);
                  setPz(0.76);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset P</span>
              </button>
            </div>

            {system === "cartesian" && (
              <div className="space-y-2">
                <div>
                  <label
                    htmlFor="coord-x"
                    className="text-xs font-tabular-mono text-[#8D9FCE] block"
                  >
                    x₀ = {coords.x.toFixed(2)} (Plane x = const)
                  </label>
                  <input
                    id="coord-x"
                    type="range"
                    min={0.15}
                    max={1.25}
                    step={0.02}
                    value={coords.x}
                    onChange={(e) => setPx(parseFloat(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>
                <div>
                  <label
                    htmlFor="coord-y"
                    className="text-xs font-tabular-mono text-[#96B898] block"
                  >
                    y₀ = {coords.y.toFixed(2)} (Plane y = const)
                  </label>
                  <input
                    id="coord-y"
                    type="range"
                    min={0.15}
                    max={1.25}
                    step={0.02}
                    value={coords.y}
                    onChange={(e) => setPy(parseFloat(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>
                <div>
                  <label
                    htmlFor="coord-z"
                    className="text-xs font-tabular-mono text-[#029091] block"
                  >
                    z₀ = {coords.z.toFixed(2)} (Plane z = const)
                  </label>
                  <input
                    id="coord-z"
                    type="range"
                    min={0.15}
                    max={1.25}
                    step={0.02}
                    value={coords.z}
                    onChange={(e) => setPz(parseFloat(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>
              </div>
            )}

            {system === "cylindrical" && (
              <div className="space-y-2">
                <div>
                  <label
                    htmlFor="cyl-r"
                    className="text-xs font-tabular-mono text-[#8D9FCE] block"
                  >
                    Radial Distance r₀ = {coords.r.toFixed(2)} (Cylinder r = const)
                  </label>
                  <input
                    id="cyl-r"
                    type="range"
                    min={0.15}
                    max={1.3}
                    step={0.02}
                    value={coords.r}
                    onChange={(e) =>
                      updateFromCylindrical(
                        parseFloat(e.target.value),
                        coords.theta,
                        coords.z
                      )
                    }
                    className="w-full cursor-pointer"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cyl-theta"
                    className="text-xs font-tabular-mono text-[#96B898] block"
                  >
                    Azimuthal Angle θ₀ = {coords.thetaDeg.toFixed(1)}° (Half-Plane θ = const)
                  </label>
                  <input
                    id="cyl-theta"
                    type="range"
                    min={5}
                    max={85}
                    step={1}
                    value={coords.thetaDeg}
                    onChange={(e) =>
                      updateFromCylindrical(
                        coords.r,
                        (parseFloat(e.target.value) * Math.PI) / 180,
                        coords.z
                      )
                    }
                    className="w-full cursor-pointer"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cyl-z"
                    className="text-xs font-tabular-mono text-[#029091] block"
                  >
                    Height z₀ = {coords.z.toFixed(2)} (Plane z = const)
                  </label>
                  <input
                    id="cyl-z"
                    type="range"
                    min={0.15}
                    max={1.25}
                    step={0.02}
                    value={coords.z}
                    onChange={(e) =>
                      updateFromCylindrical(
                        coords.r,
                        coords.theta,
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full cursor-pointer"
                  />
                </div>
              </div>
            )}

            {system === "spherical" && (
              <div className="space-y-2">
                <div>
                  <label
                    htmlFor="sph-rho"
                    className="text-xs font-tabular-mono text-[#8D9FCE] block"
                  >
                    Spherical Radius ρ₀ = {coords.rho.toFixed(2)} (Sphere ρ = const)
                  </label>
                  <input
                    id="sph-rho"
                    type="range"
                    min={0.25}
                    max={1.35}
                    step={0.02}
                    value={coords.rho}
                    onChange={(e) =>
                      updateFromSpherical(
                        parseFloat(e.target.value),
                        coords.phi,
                        coords.theta
                      )
                    }
                    className="w-full cursor-pointer"
                  />
                </div>
                <div>
                  <label
                    htmlFor="sph-phi"
                    className="text-xs font-tabular-mono text-[#D5658B] block"
                  >
                    Polar Zenith Angle φ₀ = {coords.phiDeg.toFixed(1)}° from +z (Cone φ = const)
                  </label>
                  <input
                    id="sph-phi"
                    type="range"
                    min={10}
                    max={82}
                    step={1}
                    value={coords.phiDeg}
                    onChange={(e) =>
                      updateFromSpherical(
                        coords.rho,
                        (parseFloat(e.target.value) * Math.PI) / 180,
                        coords.theta
                      )
                    }
                    className="w-full cursor-pointer"
                  />
                </div>
                <div>
                  <label
                    htmlFor="sph-theta"
                    className="text-xs font-tabular-mono text-[#96B898] block"
                  >
                    Azimuthal Angle θ₀ = {coords.thetaDeg.toFixed(1)}° in xy-plane (Half-Plane)
                  </label>
                  <input
                    id="sph-theta"
                    type="range"
                    min={5}
                    max={85}
                    step={1}
                    value={coords.thetaDeg}
                    onChange={(e) =>
                      updateFromSpherical(
                        coords.rho,
                        coords.phi,
                        (parseFloat(e.target.value) * Math.PI) / 180
                      )
                    }
                    className="w-full cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3D Differential Volume Element dV Edge-Length Breakdown */}
          <div className="border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="flex items-center gap-1.5 text-[#FBEAA4] font-semibold">
                <Box className="w-3.5 h-3.5 text-[#D35323]" aria-hidden="true" />
                <span>3D Volume Element dV Edge Magnifier</span>
              </span>
              <span className="text-[#D35323]">
                |J| = {coords.jacobianVal.toFixed(3)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-tabular-mono text-xs text-center">
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] text-[#8D9FCE] block">
                  Edge 1 ({coords.edge1Label})
                </span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {coords.edge1Val.toFixed(3)}
                </span>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] text-[#D5658B] block">
                  Edge 2 ({coords.edge2Label})
                </span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {coords.edge2Val.toFixed(3)}
                </span>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[10px] text-[#96B898] block">
                  Edge 3 ({coords.edge3Label})
                </span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {coords.edge3Val.toFixed(3)}
                </span>
              </div>
            </div>

            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              {system === "cartesian" && (
                <KaTeXMath
                  block
                  math={`dV = (\\textcolor{#8D9FCE}{dx})(\\textcolor{#D5658B}{dy})(\\textcolor{#96B898}{dz}) \\approx \\textcolor{#FBEAA4}{${coords.dVLinear.toFixed(
                    4
                  )}}`}
                />
              )}
              {system === "cylindrical" && (
                <KaTeXMath
                  block
                  math={`dV = (\\textcolor{#8D9FCE}{dr})(\\textcolor{#D5658B}{r\\,d\\theta})(\\textcolor{#96B898}{dz}) = \\textcolor{#FBEAA4}{r}\\,dr\\,d\\theta\\,dz \\approx \\textcolor{#FBEAA4}{${coords.dVLinear.toFixed(
                    4
                  )}}`}
                />
              )}
              {system === "spherical" && (
                <KaTeXMath
                  block
                  math={`dV = (\\textcolor{#8D9FCE}{d\\rho})(\\textcolor{#D5658B}{\\rho\\,d\\phi})(\\textcolor{#96B898}{\\rho\\sin\\phi\\,d\\theta}) = \\textcolor{#FBEAA4}{\\rho^2\\sin\\phi}\\,d\\rho\\,d\\phi\\,d\\theta \\approx \\textcolor{#FBEAA4}{${coords.dVLinear.toFixed(
                    4
                  )}}`}
                />
              )}
            </div>

            {/* Wedge Step Size Sliders */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label
                  htmlFor="wedge-dq1"
                  className="text-[10px] font-tabular-mono text-[#8D9FCE] block"
                >
                  {system === "cartesian"
                    ? "Δx"
                    : system === "cylindrical"
                    ? "Δr"
                    : "Δρ"}{" "}
                  = {dq1.toFixed(2)}
                </label>
                <input
                  id="wedge-dq1"
                  type="range"
                  min={0.08}
                  max={0.45}
                  step={0.02}
                  value={dq1}
                  onChange={(e) => setDq1(parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
              <div>
                <label
                  htmlFor="wedge-dq2"
                  className="text-[10px] font-tabular-mono text-[#D5658B] block"
                >
                  {system === "cartesian"
                    ? "Δy"
                    : system === "cylindrical"
                    ? "Δθ"
                    : "Δφ"}{" "}
                  = {dq2.toFixed(2)}
                </label>
                <input
                  id="wedge-dq2"
                  type="range"
                  min={0.08}
                  max={0.45}
                  step={0.02}
                  value={dq2}
                  onChange={(e) => setDq2(parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
              <div>
                <label
                  htmlFor="wedge-dq3"
                  className="text-[10px] font-tabular-mono text-[#96B898] block"
                >
                  {system === "cartesian"
                    ? "Δz"
                    : system === "cylindrical"
                    ? "Δz"
                    : "Δθ"}{" "}
                  = {dq3.toFixed(2)}
                </label>
                <input
                  id="wedge-dq3"
                  type="range"
                  min={0.08}
                  max={0.45}
                  step={0.02}
                  value={dq3}
                  onChange={(e) => setDq3(parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom 3D Curvilinear Region & Triple Integral Composer */}
      <div className="border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#029091] font-semibold block">
              Custom 3D Curvilinear Region &amp; Triple Integral Evaluator
            </span>
            <p className="text-xs font-math-serif text-[var(--text-secondary)]">
              Select a canonical 3D solid preset or edit the integrand and all 6
              limits in{" "}
              <strong>
                {system === "cartesian"
                  ? "Cartesian (x, y, z)"
                  : system === "cylindrical"
                  ? "Cylindrical (r, θ, z)"
                  : "Spherical (ρ, φ, θ)"}
              </strong>{" "}
              coordinates to visualize the region in 3D and evaluate{" "}
              <KaTeXMath math="\iiint_E f\,dV" />.
            </p>
          </div>

          <label className="flex items-center gap-1.5 text-xs font-tabular-mono text-[#029091] cursor-pointer">
            <input
              type="checkbox"
              checked={showCustomSolid}
              onChange={(e) => setShowCustomSolid(e.target.checked)}
            />
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Show Custom 3D Region E in Viewport</span>
          </label>
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {REGION_PRESETS.map((p) => {
            const active = p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`p-2.5 border text-left transition-colors cursor-pointer flex flex-col justify-between gap-1 ${
                  active
                    ? "border-[var(--border-strong)] bg-[var(--bg-panel-elevated)] text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="text-[10px] font-tabular-mono uppercase px-1.5 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[#FBEAA4] w-fit">
                  {p.badge}
                </span>
                <span className="font-math-serif text-xs font-semibold">
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Editable Integrand + All 6 Limits in the Active Coordinate System */}
        <MathExpressionInput
          label={`1. Custom Integrand f(${varSpec.allowedIntegrandVars
            .slice(0, 3)
            .join(", ")}):`}
          value={integrandExpr}
          onChange={(v) => {
            setPresetId("custom");
            setIntegrandExpr(v);
          }}
          allowedVars={varSpec.allowedIntegrandVars}
          prefixLatex="f ="
          placeholder="1"
          accentHex="#8D9FCE"
          compact
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <MathExpressionInput
            label={`2. Outer Lower Limit (${varSpec.outerVar}_min):`}
            value={outerMinExpr}
            onChange={(v) => {
              setPresetId("custom");
              setOuterMinExpr(v);
            }}
            allowedVars={[]}
            prefixLatex={`${varSpec.outerTex}_{\\min} =`}
            placeholder="0"
            accentHex="#8D9FCE"
            compact
          />
          <MathExpressionInput
            label={`3. Outer Upper Limit (${varSpec.outerVar}_max):`}
            value={outerMaxExpr}
            onChange={(v) => {
              setPresetId("custom");
              setOuterMaxExpr(v);
            }}
            allowedVars={[]}
            prefixLatex={`${varSpec.outerTex}_{\\max} =`}
            placeholder="pi/2"
            accentHex="#8D9FCE"
            compact
          />
          <MathExpressionInput
            label={`4. Middle Lower Limit (${varSpec.midVar}_min):`}
            value={midMinExpr}
            onChange={(v) => {
              setPresetId("custom");
              setMidMinExpr(v);
            }}
            allowedVars={[varSpec.outerVar]}
            prefixLatex={`${varSpec.midTex}_1 =`}
            placeholder="0"
            accentHex="#96B898"
            compact
          />
          <MathExpressionInput
            label={`5. Middle Upper Limit (${varSpec.midVar}_max):`}
            value={midMaxExpr}
            onChange={(v) => {
              setPresetId("custom");
              setMidMaxExpr(v);
            }}
            allowedVars={[varSpec.outerVar]}
            prefixLatex={`${varSpec.midTex}_2 =`}
            placeholder="pi/3"
            accentHex="#96B898"
            compact
          />
          <MathExpressionInput
            label={`6. Inner Lower Surface (${varSpec.innerVar}_min):`}
            value={innerMinExpr}
            onChange={(v) => {
              setPresetId("custom");
              setInnerMinExpr(v);
            }}
            allowedVars={[varSpec.outerVar, varSpec.midVar]}
            prefixLatex={`${varSpec.innerTex}_1 =`}
            placeholder="0"
            accentHex="#D5658B"
            compact
          />
          <MathExpressionInput
            label={`7. Inner Upper Surface (${varSpec.innerVar}_max):`}
            value={innerMaxExpr}
            onChange={(v) => {
              setPresetId("custom");
              setInnerMaxExpr(v);
            }}
            allowedVars={[varSpec.outerVar, varSpec.midVar]}
            prefixLatex={`${varSpec.innerTex}_2 =`}
            placeholder="1.3"
            accentHex="#B95869"
            compact
          />
        </div>

        {/* Live Evaluated Triple Integral Formula */}
        <div className="p-3.5 border border-[var(--border-strong)] bg-[var(--bg-panel)] space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <span className="uppercase text-[var(--text-muted)]">
              Evaluated Curvilinear Triple Integral (with Volume Scaling Factor)
            </span>
            <span className="text-[#FBEAA4]">
              ∭ f dV ≈ {evaluatedIntegral.toFixed(4)}
            </span>
          </div>
          <KaTeXMath math={activeTripleIntegralLatex} block />
          <p className="text-xs font-math-serif text-[var(--text-secondary)]">
            {activePresetDescription}
          </p>
        </div>
      </div>

      {/* Pedagogical Derivation Accordion */}
      <div className="space-y-2.5">
        <details
          open
          className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
        >
          <summary className="px-4 py-3 text-sm font-math-serif font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)]">
            <ChevronDown
              className="w-4 h-4 text-[#029091] shrink-0"
              aria-hidden="true"
            />
            <span>
              Geometric Proof: Why Spherical Volume Has Both ρ² and sin(φ) in dV
              = ρ² sin(φ) dρ dφ dθ
            </span>
          </summary>
          <div className="px-4 pb-4 pt-2 border-t border-[var(--border-subtle)] space-y-2 text-sm font-math-serif text-[var(--text-secondary)] leading-relaxed">
            <p>
              An infinitesimal spherical wedge at <KaTeXMath math="(\rho, \phi, \theta)" />{" "}
              is approximately a rectangular box formed by moving along the three
              mutually orthogonal unit vectors{" "}
              <KaTeXMath math="\hat{\mathbf{e}}_\rho, \hat{\mathbf{e}}_\phi, \hat{\mathbf{e}}_\theta" />:
            </p>
            <ul className="space-y-1 text-xs font-tabular-mono">
              <li className="text-[#8D9FCE]">
                1. Radial edge along ê_ρ: pure radial step of length dρ.
              </li>
              <li className="text-[#D5658B]">
                2. Meridional arc along ê_φ: on a sphere of radius ρ, tilting the
                zenith angle by dφ sweeps an arc of length ρ dφ.
              </li>
              <li className="text-[#96B898]">
                3. Horizontal latitude arc along ê_θ: at zenith angle φ, the
                distance to the z-axis is r = ρ sin(φ), so rotating by dθ sweeps
                an arc of length r dθ = ρ sin(φ) dθ.
              </li>
            </ul>
            <div className="p-3 bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
              <KaTeXMath
                block
                math="dV = (\text{Edge}_\rho)(\text{Edge}_\phi)(\text{Edge}_\theta) = (d\rho)(\rho\,d\phi)(\rho\sin\phi\,d\theta) = \rho^2\sin\phi\,d\rho\,d\phi\,d\theta"
              />
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
