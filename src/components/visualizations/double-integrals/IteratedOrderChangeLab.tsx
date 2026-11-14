"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  ArrowLeftRight,
  ChevronDown,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Split,
} from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  createDemandDrivenRenderLoop,
  type DemandDrivenRenderLoopHandle,
} from "@/components/visualizations/primitives/demandRenderLoop";

type OrderMode = "dydx" | "dxdy";
type PresetId =
  | "exp-triangle"
  | "parabola-spandrel"
  | "parabola-line-lens"
  | "quarter-circle"
  | "split-triangle";

interface DomainPreset {
  id: PresetId;
  title: string;
  shortLabel: string;
  badge: string;
  xMaxDomain: number;
  yMaxDomain: number;
  integrandExpr: string;
  typeI: {
    xRange: [number, number];
    yMinExpr: string;
    yMaxExpr: string;
    requiresSplit?: boolean;
    splitX?: number;
  };
  typeII: {
    yRange: [number, number];
    xMinExpr: string;
    xMaxExpr: string;
  };
  pedagogicalSteps: {
    boundsExplanation: string;
    inversionAlgebraLatex: string;
    whySwapMatters: string;
  };
}

const PRESETS: DomainPreset[] = [
  {
    id: "exp-triangle",
    title: "1. Non-Elementary Integral: exp(y²) over Upper Triangle",
    shortLabel: "exp(y²) Triangle",
    badge: "Classic Fubini Swap",
    xMaxDomain: 1.0,
    yMaxDomain: 1.0,
    integrandExpr: "exp(y^2)",
    typeI: {
      xRange: [0, 1],
      yMinExpr: "x",
      yMaxExpr: "1",
    },
    typeII: {
      yRange: [0, 1],
      xMinExpr: "0",
      xMaxExpr: "y",
    },
    pedagogicalSteps: {
      boundsExplanation:
        "In Type I (dy dx), a vertical ray at x enters the triangle on the diagonal line y = x and exits at the horizontal top edge y = 1. In Type II (dx dy), a horizontal ray at height y enters at the y-axis (x = 0) and exits on the diagonal line x = y.",
      inversionAlgebraLatex:
        "\\begin{aligned} R &= \\{(x,y) : 0 \\le x \\le 1,\\; x \\le y \\le 1\\} \\\\ &= \\{(x,y) : 0 \\le y \\le 1,\\; 0 \\le x \\le y\\} \\end{aligned}",
      whySwapMatters:
        "The inner integral ∫ exp(y²) dy cannot be expressed in elementary functions. Swapping to dx dy makes the inner integral ∫₀ʸ exp(y²) dx = y exp(y²), creating the exact u-substitution factor y needed to integrate exp(y²)!",
    },
  },
  {
    id: "parabola-spandrel",
    title: "2. Parabolic Spandrel (y = x² to y = 1)",
    shortLabel: "Parabolic Spandrel",
    badge: "Algebraic Inversion",
    xMaxDomain: 1.0,
    yMaxDomain: 1.0,
    integrandExpr: "1.6 - 0.5*x^2 - 0.4*y^2",
    typeI: {
      xRange: [0, 1],
      yMinExpr: "x^2",
      yMaxExpr: "1",
    },
    typeII: {
      yRange: [0, 1],
      xMinExpr: "0",
      xMaxExpr: "sqrt(max(0, y))",
    },
    pedagogicalSteps: {
      boundsExplanation:
        "For Type I (dy dx), x runs from 0 to 1, and each vertical strip rises from the parabola y = x² to the line y = 1. For Type II (dx dy), solving y = x² for x in the first quadrant gives the right-hand exit curve x = √y.",
      inversionAlgebraLatex:
        "y = x^2 \\;(\\text{with } x \\ge 0) \\iff x = \\sqrt{y}, \\qquad 0 \\le x \\le \\sqrt{y},\\quad 0 \\le y \\le 1",
      whySwapMatters:
        "Depending on whether the integrand contains powers of x or fractional powers of y, one direction avoids radical powers during antiderivative evaluation.",
    },
  },
  {
    id: "parabola-line-lens",
    title: "3. Lens Region Between Parabola y = x² and Line y = x",
    shortLabel: "Lens y ∈ [x², x]",
    badge: "Two Curved Bounds",
    xMaxDomain: 1.0,
    yMaxDomain: 1.0,
    integrandExpr: "1.0 + 0.6*x + 0.6*y",
    typeI: {
      xRange: [0, 1],
      yMinExpr: "x^2",
      yMaxExpr: "x",
    },
    typeII: {
      yRange: [0, 1],
      xMinExpr: "y",
      xMaxExpr: "sqrt(max(0, y))",
    },
    pedagogicalSteps: {
      boundsExplanation:
        "On [0, 1], x ≥ x², so the line y = x is the upper roof in Type I and the parabola y = x² is the floor. When sliced horizontally (Type II), a ray moving left-to-right hits the line x = y first (entry) and exits through the parabola x = √y!",
      inversionAlgebraLatex:
        "x^2 \\le y \\le x \\iff y \\le x \\le \\sqrt{y} \\quad \\text{for } (x,y) \\in [0,1]^2",
      whySwapMatters:
        "Notice how the role of the two curves flips! The curve y = x is the UPPER bound in dy dx, but becomes the LOWER (left) bound x = y in dx dy.",
    },
  },
  {
    id: "quarter-circle",
    title: "4. Quarter Circular Sector (x² + y² ≤ 1)",
    shortLabel: "Quarter Disk",
    badge: "Circular Symmetry",
    xMaxDomain: 1.0,
    yMaxDomain: 1.0,
    integrandExpr: "1.75 - 0.65*(x^2 + y^2)",
    typeI: {
      xRange: [0, 1],
      yMinExpr: "0",
      yMaxExpr: "sqrt(max(0, 1 - x^2))",
    },
    typeII: {
      yRange: [0, 1],
      xMinExpr: "0",
      xMaxExpr: "sqrt(max(0, 1 - y^2))",
    },
    pedagogicalSteps: {
      boundsExplanation:
        "Because x² + y² = 1 is symmetric in x and y, both Cartesian orders involve square-root upper bounds √(1-x²) or √(1-y²).",
      inversionAlgebraLatex:
        "x^2 + y^2 \\le 1,\\; x,y \\ge 0 \\implies y \\in [0, \\sqrt{1-x^2}] \\;\\text{or}\\; x \\in [0, \\sqrt{1-y^2}]",
      whySwapMatters:
        "Both Cartesian orders require trigonometric substitution! In Topic 03 (Coordinate Systems) and Topic 04 (Jacobians), we will see how switching to Polar Coordinates (dA = r dr dθ) turns these radical bounds into constants: 0 ≤ r ≤ 1, 0 ≤ θ ≤ π/2.",
    },
  },
  {
    id: "split-triangle",
    title: "5. Split-Boundary Triangle (0 ≤ y ≤ 1, y ≤ x ≤ 2 - y)",
    shortLabel: "Split Region (1 ↔ 2 Integrals)",
    badge: "Split Required in dy dx",
    xMaxDomain: 2.0,
    yMaxDomain: 1.0,
    integrandExpr: "1.25 - 0.25*x + 0.35*y",
    typeI: {
      xRange: [0, 2],
      yMinExpr: "0",
      yMaxExpr: "min(x, 2 - x)",
      requiresSplit: true,
      splitX: 1.0,
    },
    typeII: {
      yRange: [0, 1],
      xMinExpr: "y",
      xMaxExpr: "2 - y",
    },
    pedagogicalSteps: {
      boundsExplanation:
        "Look at the top roof of the triangle in the xy-plane: for x ∈ [0, 1] the roof is the rising line y = x, but at the apex (1, 1) the roof switches to the falling line y = 2 - x! Thus Type I (dy dx) MUST split at x = 1 into two separate integrals.",
      inversionAlgebraLatex:
        "\\text{Type I (2 parts): } [0,1]: 0 \\le y \\le x,\\; [1,2]: 0 \\le y \\le 2-x \\quad\\longleftrightarrow\\quad \\text{Type II (1 part): } 0 \\le y \\le 1,\\; y \\le x \\le 2-y",
      whySwapMatters:
        "Switching from Type I (dy dx) to Type II (dx dy) collapses TWO separate double integrals into ONE single double integral because horizontal rays always enter on x = y and exit on x = 2 - y without changing formula!",
    },
  },
];

export function IteratedOrderChangeLab() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const renderLoopRef = useRef<DemandDrivenRenderLoopHandle | null>(null);
  const sceneObjectsRef = useRef<{
    surfaceGroup: THREE.Group;
    sliceGroup: THREE.Group;
    accumulatedGroup: THREE.Group;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
  } | null>(null);

  const [presetId, setPresetId] = useState<PresetId>("exp-triangle");
  const [order, setOrder] = useState<OrderMode>("dydx");
  const [sliceNorm, setSliceNorm] = useState<number>(0.55);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showAccumulated, setShowAccumulated] = useState<boolean>(true);

  // User-editable equation strings (seeded from active preset)
  const [integrandExpr, setIntegrandExpr] = useState<string>("exp(y^2)");
  const [xLowerExpr, setXLowerExpr] = useState<string>("0");
  const [xUpperExpr, setXUpperExpr] = useState<string>("1");
  const [yMinExpr, setYMinExpr] = useState<string>("x");
  const [yMaxExpr, setYMaxExpr] = useState<string>("1");

  const [yLowerExpr, setYLowerExpr] = useState<string>("0");
  const [yUpperExpr, setYUpperExpr] = useState<string>("1");
  const [xMinExpr, setXMinExpr] = useState<string>("0");
  const [xMaxExpr, setXMaxExpr] = useState<string>("y");

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId]
  );

  // Compile user-typed expressions (fallbackValue = 0 so out-of-domain radicals sit at z = 0)
  const compiledIntegrand = useMemo(
    () => compileMathExpression(integrandExpr, ["x", "y"], 0),
    [integrandExpr]
  );
  const compiledXLower = useMemo(
    () => compileMathExpression(xLowerExpr, [], 0),
    [xLowerExpr]
  );
  const compiledXUpper = useMemo(
    () => compileMathExpression(xUpperExpr, [], 1),
    [xUpperExpr]
  );
  const compiledYMin = useMemo(
    () => compileMathExpression(yMinExpr, ["x"], 0),
    [yMinExpr]
  );
  const compiledYMax = useMemo(
    () => compileMathExpression(yMaxExpr, ["x"], 1),
    [yMaxExpr]
  );

  const compiledYLower = useMemo(
    () => compileMathExpression(yLowerExpr, [], 0),
    [yLowerExpr]
  );
  const compiledYUpper = useMemo(
    () => compileMathExpression(yUpperExpr, [], 1),
    [yUpperExpr]
  );
  const compiledXMin = useMemo(
    () => compileMathExpression(xMinExpr, ["y"], 0),
    [xMinExpr]
  );
  const compiledXMax = useMemo(
    () => compileMathExpression(xMaxExpr, ["y"], 1),
    [xMaxExpr]
  );

  const typeIXRange = useMemo((): [number, number] => {
    const a = Math.max(-4, Math.min(4, compiledXLower.evaluate({})));
    const b = Math.max(a + 0.05, Math.min(4, compiledXUpper.evaluate({})));
    return [a, b];
  }, [compiledXLower, compiledXUpper]);

  const typeIIYRange = useMemo((): [number, number] => {
    const c = Math.max(-4, Math.min(4, compiledYLower.evaluate({})));
    const d = Math.max(c + 0.05, Math.min(4, compiledYUpper.evaluate({})));
    return [c, d];
  }, [compiledYLower, compiledYUpper]);

  const evalTrueF = React.useCallback(
    (x: number, y: number) => Math.max(0, compiledIntegrand.evaluate({ x, y })),
    [compiledIntegrand]
  );

  // Visual 3D height clamps very tall functions (like exp(1)=2.718) smoothly so they fit inside the 3D box
  const evalVisualZ = React.useCallback(
    (x: number, y: number) => {
      const val = evalTrueF(x, y);
      return Math.min(2.2, val * 0.72);
    },
    [evalTrueF]
  );

  const evalYBounds = React.useCallback(
    (x: number): [number, number] => {
      const a = Math.max(-4, Math.min(4, compiledYMin.evaluate({ x })));
      const b = Math.max(a, Math.min(4, compiledYMax.evaluate({ x })));
      return [a, b];
    },
    [compiledYMin, compiledYMax]
  );

  const evalXBounds = React.useCallback(
    (y: number): [number, number] => {
      const a = Math.max(-4, Math.min(4, compiledXMin.evaluate({ y })));
      const b = Math.max(a, Math.min(4, compiledXMax.evaluate({ y })));
      return [a, b];
    },
    [compiledXMin, compiledXMax]
  );

  const handleSelectPreset = (item: DomainPreset) => {
    setPresetId(item.id);
    setIntegrandExpr(item.integrandExpr);
    setXLowerExpr(String(item.typeI.xRange[0]));
    setXUpperExpr(String(item.typeI.xRange[1]));
    setYMinExpr(item.typeI.yMinExpr);
    setYMaxExpr(item.typeI.yMaxExpr);
    setYLowerExpr(String(item.typeII.yRange[0]));
    setYUpperExpr(String(item.typeII.yRange[1]));
    setXMinExpr(item.typeII.xMinExpr);
    setXMaxExpr(item.typeII.xMaxExpr);
    setSliceNorm(0.55);
  };

  // Actual coordinate value of the outer variable (x0 for dydx, y0 for dxdy)
  const outerCoord = useMemo(() => {
    const range = order === "dydx" ? typeIXRange : typeIIYRange;
    return range[0] + sliceNorm * (range[1] - range[0]);
  }, [order, typeIXRange, typeIIYRange, sliceNorm]);

  // Inner bounds at the current outer coordinate
  const activeInnerBounds = useMemo(() => {
    if (order === "dydx") {
      return evalYBounds(outerCoord);
    }
    return evalXBounds(outerCoord);
  }, [order, evalYBounds, evalXBounds, outerCoord]);

  // Compute cross-sectional slice area A(x0) or A(y0) AND total double integral numerically
  const { sliceArea, totalIntegralValue } = useMemo(() => {
    const [bMin, bMax] = activeInnerBounds;
    let sArea = 0;
    if (bMax > bMin) {
      const M = 28;
      const h = (bMax - bMin) / M;
      for (let k = 0; k < M; k++) {
        const mid = bMin + (k + 0.5) * h;
        const val =
          order === "dydx"
            ? evalTrueF(outerCoord, mid)
            : evalTrueF(mid, outerCoord);
        sArea += val * h;
      }
    }

    // Total double integral over the active order's domain
    const N = 28;
    const M = 28;
    let total = 0;
    if (order === "dydx") {
      const [xA, xB] = typeIXRange;
      const dx = (xB - xA) / N;
      for (let i = 0; i < N; i++) {
        const x = xA + (i + 0.5) * dx;
        const [y1, y2] = evalYBounds(x);
        if (y2 <= y1) continue;
        const dy = (y2 - y1) / M;
        for (let j = 0; j < M; j++) {
          const y = y1 + (j + 0.5) * dy;
          total += evalTrueF(x, y) * dx * dy;
        }
      }
    } else {
      const [yC, yD] = typeIIYRange;
      const dy = (yD - yC) / N;
      for (let i = 0; i < N; i++) {
        const y = yC + (i + 0.5) * dy;
        const [x1, x2] = evalXBounds(y);
        if (x2 <= x1) continue;
        const dx = (x2 - x1) / M;
        for (let j = 0; j < M; j++) {
          const x = x1 + (j + 0.5) * dx;
          total += evalTrueF(x, y) * dx * dy;
        }
      }
    }

    return { sliceArea: sArea, totalIntegralValue: total };
  }, [activeInnerBounds, order, outerCoord, typeIXRange, typeIIYRange, evalTrueF, evalYBounds, evalXBounds]);

  // Animate sweep when playing
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let prev = performance.now();
    const step = (now: number) => {
      const dt = (now - prev) / 1000;
      prev = now;
      setSliceNorm((curr) => {
        const next = curr + dt * 0.24;
        return next > 0.96 ? 0.04 : next;
      });
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 400;

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
    controls.target.set(0.6, 0.55, 0.5);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.12;
    controls.minDistance = 1.4;
    controls.maxDistance = 7;

    scene.add(new THREE.AmbientLight(0xfffbe4, 0.78));
    const dirLight = new THREE.DirectionalLight(0xfffbe4, 0.78);
    dirLight.position.set(3, 5, 2.5);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(2.2, 11, 0xaaa36d, 0x32353d);
    grid.position.set(0.8, 0, 0.5);
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
    addAxis([2.15, 0, 0], "#8D9FCE"); // x
    addAxis([0, 0, 1.35], "#96B898"); // y
    addAxis([0, 1.95, 0], "#029091"); // z

    const surfaceGroup = new THREE.Group();
    const accumulatedGroup = new THREE.Group();
    const sliceGroup = new THREE.Group();
    scene.add(surfaceGroup);
    scene.add(accumulatedGroup);
    scene.add(sliceGroup);

    sceneObjectsRef.current = {
      surfaceGroup,
      sliceGroup,
      accumulatedGroup,
      camera,
      controls,
    };

    const renderLoop = createDemandDrivenRenderLoop({
      container,
      renderer,
      scene,
      camera,
      controls: controls as unknown as {
        update: () => boolean;
        addEventListener: (event: string, listener: () => void) => void;
        removeEventListener: (event: string, listener: () => void) => void;
      },
    });
    renderLoopRef.current = renderLoop;

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 560;
      const h = container.clientHeight || 400;
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
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Rebuild Full Surface & Domain Base when preset, integrand, or bounds change
  useEffect(() => {
    const objs = sceneObjectsRef.current;
    if (!objs) return;
    const { surfaceGroup, controls } = objs;

    while (surfaceGroup.children.length > 0) {
      const child = surfaceGroup.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      surfaceGroup.remove(child);
    }

    controls.target.set(preset.xMaxDomain * 0.5, 0.55, 0.5);

    const nx = 48;
    const ny = 48;
    const surfPos: number[] = [];
    const basePos: number[] = [];
    const indices: number[] = [];

    if (order === "dydx") {
      const [xA, xB] = typeIXRange;
      for (let i = 0; i <= nx; i++) {
        const x = xA + (i / nx) * (xB - xA);
        const [y1, y2] = evalYBounds(x);
        for (let j = 0; j <= ny; j++) {
          const y = y1 + (j / ny) * (y2 - y1);
          const z = evalVisualZ(x, y);
          surfPos.push(x, z, y);
          basePos.push(x, 0.002, y);
        }
      }
    } else {
      const [yC, yD] = typeIIYRange;
      for (let i = 0; i <= nx; i++) {
        const y = yC + (i / nx) * (yD - yC);
        const [x1, x2] = evalXBounds(y);
        for (let j = 0; j <= ny; j++) {
          const x = x1 + (j / ny) * (x2 - x1);
          const z = evalVisualZ(x, y);
          surfPos.push(x, z, y);
          basePos.push(x, 0.002, y);
        }
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

    const surfGeom = new THREE.BufferGeometry();
    surfGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(surfPos, 3)
    );
    surfGeom.setIndex(indices);
    surfGeom.computeVertexNormals();

    surfaceGroup.add(
      new THREE.Mesh(
        surfGeom,
        new THREE.MeshLambertMaterial({
          color: "#8D9FCE",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.42,
        })
      )
    );
    surfaceGroup.add(
      new THREE.Mesh(
        surfGeom,
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
      new THREE.Float32BufferAttribute(basePos, 3)
    );
    baseGeom.setIndex(indices);
    surfaceGroup.add(
      new THREE.Mesh(
        baseGeom,
        new THREE.MeshBasicMaterial({
          color: "#029091",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.22,
        })
      )
    );
    renderLoopRef.current?.requestRender(2);
  }, [preset, order, typeIXRange, typeIIYRange, evalVisualZ, evalYBounds, evalXBounds]);

  // Update Active Cross-Sectional Curtain & Partial Accumulated Volume
  useEffect(() => {
    const objs = sceneObjectsRef.current;
    if (!objs) return;
    const { sliceGroup, accumulatedGroup } = objs;

    const clearGroup = (grp: THREE.Group) => {
      while (grp.children.length > 0) {
        const c = grp.children[0] as THREE.Mesh;
        if (c.geometry) c.geometry.dispose();
        grp.remove(c);
      }
    };
    clearGroup(sliceGroup);
    clearGroup(accumulatedGroup);

    const steps = 48;
    const vertices: number[] = [];
    const indices: number[] = [];
    const topPts: THREE.Vector3[] = [];
    const basePts: THREE.Vector3[] = [];

    const [bMin, bMax] = activeInnerBounds;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const inner = bMin + t * (bMax - bMin);
      const x = order === "dydx" ? outerCoord : inner;
      const y = order === "dydx" ? inner : outerCoord;
      const z = evalVisualZ(x, y);

      vertices.push(x, 0, y);
      vertices.push(x, z, y);
      topPts.push(new THREE.Vector3(x, z, y));
      basePts.push(new THREE.Vector3(x, 0.01, y));
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

    sliceGroup.add(
      new THREE.Mesh(
        curtainGeom,
        new THREE.MeshBasicMaterial({
          color: "#D35323",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        })
      )
    );
    sliceGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(topPts),
        new THREE.LineBasicMaterial({ color: "#FBEAA4" })
      )
    );
    sliceGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(basePts),
        new THREE.LineBasicMaterial({ color: "#FBEAA4" })
      )
    );

    if (showAccumulated) {
      const nOuter = 24;
      const nInner = 24;
      const accPos: number[] = [];
      const accIdx: number[] = [];

      const [oStart] =
        order === "dydx" ? typeIXRange : typeIIYRange;

      for (let i = 0; i <= nOuter; i++) {
        const oVal = oStart + (i / nOuter) * (outerCoord - oStart);
        const [iMin, iMax] =
          order === "dydx" ? evalYBounds(oVal) : evalXBounds(oVal);

        for (let j = 0; j <= nInner; j++) {
          const iVal = iMin + (j / nInner) * (iMax - iMin);
          const x = order === "dydx" ? oVal : iVal;
          const y = order === "dydx" ? iVal : oVal;
          const z = evalVisualZ(x, y);
          accPos.push(x, z, y);
        }
      }

      for (let i = 0; i < nOuter; i++) {
        for (let j = 0; j < nInner; j++) {
          const a = i * (nInner + 1) + j;
          const b = (i + 1) * (nInner + 1) + j;
          const c = (i + 1) * (nInner + 1) + (j + 1);
          const d = i * (nInner + 1) + (j + 1);
          accIdx.push(a, b, d);
          accIdx.push(b, c, d);
        }
      }

      const accGeom = new THREE.BufferGeometry();
      accGeom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(accPos, 3)
      );
      accGeom.setIndex(accIdx);
      accGeom.computeVertexNormals();

      accumulatedGroup.add(
        new THREE.Mesh(
          accGeom,
          new THREE.MeshLambertMaterial({
            color: "#029091",
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.65,
          })
        )
      );
    }
    renderLoopRef.current?.requestRender(2);
  }, [
    outerCoord,
    activeInnerBounds,
    order,
    typeIXRange,
    typeIIYRange,
    showAccumulated,
    evalVisualZ,
    evalYBounds,
    evalXBounds,
  ]);

  // Build 2D SVG paths for the active bounds
  const svgPaths = useMemo(() => {
    const N = 50;
    let maxX = Math.max(1.0, preset.xMaxDomain);
    let maxY = Math.max(1.0, preset.yMaxDomain);

    if (order === "dydx") {
      const [xA, xB] = typeIXRange;
      maxX = Math.max(maxX, Math.abs(xA), Math.abs(xB));
      for (let i = 0; i <= N; i++) {
        const x = xA + (i / N) * (xB - xA);
        const [y1, y2] = evalYBounds(x);
        maxY = Math.max(maxY, Math.abs(y1), Math.abs(y2));
      }
    } else {
      const [yC, yD] = typeIIYRange;
      maxY = Math.max(maxY, Math.abs(yC), Math.abs(yD));
      for (let i = 0; i <= N; i++) {
        const y = yC + (i / N) * (yD - yC);
        const [x1, x2] = evalXBounds(y);
        maxX = Math.max(maxX, Math.abs(x1), Math.abs(x2));
      }
    }

    const scaleX = 160 / Math.max(0.25, maxX);
    const scaleY = 150 / Math.max(0.25, maxY);
    const toSvg = (x: number, y: number): [number, number] => [
      30 + x * scaleX,
      175 - y * scaleY,
    ];

    const lowerPts: [number, number][] = [];
    const upperPts: [number, number][] = [];
    const entryCurvePts: string[] = [];
    const exitCurvePts: string[] = [];

    if (order === "dydx") {
      const [xA, xB] = typeIXRange;
      for (let i = 0; i <= N; i++) {
        const x = xA + (i / N) * (xB - xA);
        const [y1, y2] = evalYBounds(x);
        const p1 = toSvg(x, y1);
        const p2 = toSvg(x, y2);
        lowerPts.push(p1);
        upperPts.push(p2);
        entryCurvePts.push(
          `${i === 0 ? "M" : "L"} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`
        );
        exitCurvePts.push(
          `${i === 0 ? "M" : "L"} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
        );
      }
    } else {
      const [yC, yD] = typeIIYRange;
      for (let i = 0; i <= N; i++) {
        const y = yC + (i / N) * (yD - yC);
        const [x1, x2] = evalXBounds(y);
        const p1 = toSvg(x1, y);
        const p2 = toSvg(x2, y);
        lowerPts.push(p1);
        upperPts.push(p2);
        entryCurvePts.push(
          `${i === 0 ? "M" : "L"} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`
        );
        exitCurvePts.push(
          `${i === 0 ? "M" : "L"} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
        );
      }
    }

    const polyPoints = [...lowerPts, ...upperPts.slice().reverse()]
      .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
      .join(" ");

    const [bMin, bMax] = activeInnerBounds;
    const stripStart =
      order === "dydx"
        ? toSvg(outerCoord, bMin)
        : toSvg(bMin, outerCoord);
    const stripEnd =
      order === "dydx"
        ? toSvg(outerCoord, bMax)
        : toSvg(bMax, outerCoord);

    const splitLineSvgX = preset.typeI.splitX
      ? 30 + preset.typeI.splitX * scaleX
      : null;

    return {
      polyPoints,
      entryPath: entryCurvePts.join(" "),
      exitPath: exitCurvePts.join(" "),
      stripStart,
      stripEnd,
      splitLineSvgX,
    };
  }, [
    preset,
    order,
    typeIXRange,
    typeIIYRange,
    outerCoord,
    activeInnerBounds,
    evalYBounds,
    evalXBounds,
  ]);

  const typeIDynamicLatex = `\\int_{\\textcolor{#8D9FCE}{${compiledXLower.tex}}}^{\\textcolor{#8D9FCE}{${compiledXUpper.tex}}} \\int_{\\textcolor{#D5658B}{${compiledYMin.tex}}}^{\\textcolor{#B95869}{${compiledYMax.tex}}} \\left(${compiledIntegrand.tex}\\right)\\,\\textcolor{#D35323}{dy}\\,\\textcolor{#8D9FCE}{dx}`;

  const typeIIDynamicLatex = `\\int_{\\textcolor{#96B898}{${compiledYLower.tex}}}^{\\textcolor{#96B898}{${compiledYUpper.tex}}} \\int_{\\textcolor{#D5658B}{${compiledXMin.tex}}}^{\\textcolor{#B95869}{${compiledXMax.tex}}} \\left(${compiledIntegrand.tex}\\right)\\,\\textcolor{#D35323}{dx}\\,\\textcolor{#96B898}{dy}`;

  return (
    <section
      id="iterated-slicing"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 sm:p-6 space-y-6 scroll-mt-24"
    >
      {/* Header & Order Reversal Toggle */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)]">
            <Layers className="w-4 h-4" aria-hidden="true" />
            <span>
              Interactive Laboratory 01.2 – 01.4 • Slicing, Limits &amp; Order
              Change
            </span>
          </div>
          <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            Iterated Slicing, Boundary Limits &amp; Fubini&apos;s Order Reversal
          </h2>
          <p className="font-math-serif text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl">
            Select a preset scenario or type your own integrand{" "}
            <KaTeXMath math="f(x,y)" /> and all 4 integral limits below! Swap
            between <strong>Type I (dy dx)</strong> and{" "}
            <strong>Type II (dx dy)</strong> to see the slicing ray rotate and
            the integral limits invert.
          </p>
        </div>

        {/* Primary Order Toggle Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setOrder((prev) => (prev === "dydx" ? "dxdy" : "dydx"))
            }
            className="px-4 py-2.5 border border-[var(--border-strong)] bg-[#9E360E] text-[#FFFBE4] text-xs font-tabular-mono font-semibold flex items-center gap-2 cursor-pointer hover:opacity-95 transition-opacity"
          >
            <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
            <span>
              Reverse Integration Order:{" "}
              {order === "dydx" ? "dy dx → dx dy" : "dx dy → dy dx"}
            </span>
          </button>
        </div>
      </div>

      {/* 5 Domain & Integral Presets Selector */}
      <div id="limits-of-integration" className="space-y-2 scroll-mt-24">
        <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
          Select Integration Domain Preset (or Edit Any Equation &amp; Limit Below):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {PRESETS.map((item) => {
            const active = item.id === presetId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPreset(item)}
                className={`p-3 border text-left transition-colors cursor-pointer flex flex-col justify-between gap-1.5 ${
                  active
                    ? "border-[var(--border-strong)] bg-[var(--bg-panel-elevated)] text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="text-[10px] font-tabular-mono uppercase px-1.5 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--math-ink-diff)] w-fit">
                  {item.badge}
                </span>
                <span className="font-math-serif text-sm font-semibold leading-snug">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Math Typing Composer for Integrand & All 4 Active Integral Limits */}
      <div className="space-y-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4">
        <MathExpressionInput
          label="1. Integrand Function f(x, y):"
          value={integrandExpr}
          onChange={setIntegrandExpr}
          allowedVars={["x", "y"]}
          prefixLatex="f(x,y) ="
          placeholder="sqrt(1 - (x^2 + y^2))"
          accentHex="#8D9FCE"
        />

        {order === "dydx" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <MathExpressionInput
              label="2. Outer Lower Limit x_min (a):"
              value={xLowerExpr}
              onChange={setXLowerExpr}
              allowedVars={[]}
              prefixLatex="a ="
              placeholder="0"
              accentHex="#8D9FCE"
            />
            <MathExpressionInput
              label="3. Outer Upper Limit x_max (b):"
              value={xUpperExpr}
              onChange={setXUpperExpr}
              allowedVars={[]}
              prefixLatex="b ="
              placeholder="1"
              accentHex="#8D9FCE"
            />
            <MathExpressionInput
              label="4. Inner Lower Entry Curve y = g₁(x):"
              value={yMinExpr}
              onChange={setYMinExpr}
              allowedVars={["x"]}
              prefixLatex="y_{\min}(x) ="
              placeholder="x^2"
              accentHex="#D5658B"
            />
            <MathExpressionInput
              label="5. Inner Upper Exit Curve y = g₂(x):"
              value={yMaxExpr}
              onChange={setYMaxExpr}
              allowedVars={["x"]}
              prefixLatex="y_{\max}(x) ="
              placeholder="sqrt(1 - x^2)"
              accentHex="#B95869"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <MathExpressionInput
              label="2. Outer Lower Limit y_min (c):"
              value={yLowerExpr}
              onChange={setYLowerExpr}
              allowedVars={[]}
              prefixLatex="c ="
              placeholder="0"
              accentHex="#96B898"
            />
            <MathExpressionInput
              label="3. Outer Upper Limit y_max (d):"
              value={yUpperExpr}
              onChange={setYUpperExpr}
              allowedVars={[]}
              prefixLatex="d ="
              placeholder="1"
              accentHex="#96B898"
            />
            <MathExpressionInput
              label="4. Inner Left Entry Curve x = h₁(y):"
              value={xMinExpr}
              onChange={setXMinExpr}
              allowedVars={["y"]}
              prefixLatex="x_{\min}(y) ="
              placeholder="0"
              accentHex="#D5658B"
            />
            <MathExpressionInput
              label="5. Inner Right Exit Curve x = h₂(y):"
              value={xMaxExpr}
              onChange={setXMaxExpr}
              allowedVars={["y"]}
              prefixLatex="x_{\max}(y) ="
              placeholder="sqrt(1 - y^2)"
              accentHex="#B95869"
            />
          </div>
        )}
      </div>

      {/* Split-Boundary Alert Banner when Preset 5 is in dy dx mode */}
      {preset.typeI.requiresSplit && order === "dydx" && (
        <div className="border border-[var(--math-ink-grid)] bg-[var(--bg-canvas)] p-3.5 flex items-start gap-3">
          <Split
            className="w-5 h-5 text-[var(--math-ink-grid)] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="text-xs sm:text-sm font-math-serif text-[var(--text-primary)]">
            <strong className="font-semibold text-[var(--math-ink-diff)]">
              Piecewise Upper Boundary Detected at x = 1:
            </strong>{" "}
            In <code>dy dx</code> order, vertical strips hit{" "}
            <KaTeXMath math="y = x" /> for <KaTeXMath math="x \in [0,1]" /> and{" "}
            <KaTeXMath math="y = 2-x" /> for <KaTeXMath math="x \in [1,2]" />.
            Click <strong>Reverse Integration Order</strong> above to see how{" "}
            <code>dx dy</code> unifies this into a single integral!
          </div>
        </div>
      )}

      {/* Main Synchronized 3D + 2D Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: 3D Curtain & Accumulated Volume Viewport */}
        <figure className="lg:col-span-7 border border-[var(--border-subtle)] bg-[#1E1F22] flex flex-col justify-between relative">
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[#25272C] border border-[#383B43] text-[11px] font-tabular-mono text-[#FFFBE4] flex items-center gap-3">
            <span>3D Cross-Sectional Curtain &amp; Volume</span>
            <span className="text-[#8D9FCE]">x</span>
            <span className="text-[#96B898]">y</span>
            <span className="text-[#28B7B8]">z</span>
          </div>

          <div ref={mountRef} className="w-full h-[400px] cursor-grab" />

          <figcaption className="px-3.5 py-2.5 border-t border-[#383B43] bg-[#25272C] flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono text-[#CCC8B8]">
            <span>
              Outer:{" "}
              <strong className="text-[#FBEAA4]">
                {order === "dydx"
                  ? `x₀ = ${outerCoord.toFixed(2)}`
                  : `y₀ = ${outerCoord.toFixed(2)}`}
              </strong>
            </span>
            <span>
              Slice Area A ={" "}
              <strong className="text-[#EF7547]">
                {sliceArea.toFixed(4)}
              </strong>
            </span>
            <span>
              Double Integral ∬ f dA ={" "}
              <strong className="text-[#96B898]">
                {totalIntegralValue.toFixed(4)}
              </strong>
            </span>
          </figcaption>
        </figure>

        {/* Right: 2D Entry/Exit Ray Diagram + Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* 2D Domain Entry/Exit SVG */}
          <figure className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs font-tabular-mono mb-2">
              <span className="text-[var(--text-muted)]">
                2D Domain R &amp; Entry/Exit Bounds
              </span>
              <span className="text-[var(--math-ink-sweep)] font-semibold">
                {order === "dydx"
                  ? "↑ Inner Ray (dy)"
                  : "→ Inner Ray (dx)"}
              </span>
            </div>

            <svg
              viewBox="0 0 215 195"
              className="w-full max-w-[250px] h-auto"
              role="img"
              aria-label={`2D integration region for ${preset.title}`}
            >
              <polygon
                points={svgPaths.polyPoints}
                fill="#029091"
                fillOpacity="0.24"
              />

              {svgPaths.splitLineSvgX && (
                <g>
                  <line
                    x1={svgPaths.splitLineSvgX}
                    y1={25}
                    x2={svgPaths.splitLineSvgX}
                    y2={175}
                    stroke="#AAA36D"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={svgPaths.splitLineSvgX - 14}
                    y={19}
                    fill="var(--math-ink-grid)"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    split x=1
                  </text>
                </g>
              )}

              <path
                d={svgPaths.entryPath}
                fill="none"
                stroke="#D5658B"
                strokeWidth="2.75"
              />

              <path
                d={svgPaths.exitPath}
                fill="none"
                stroke="#B95869"
                strokeWidth="2.75"
              />

              <line
                x1={svgPaths.stripStart[0]}
                y1={svgPaths.stripStart[1]}
                x2={svgPaths.stripEnd[0]}
                y2={svgPaths.stripEnd[1]}
                stroke="#D35323"
                strokeWidth="3.5"
              />

              <circle
                cx={svgPaths.stripStart[0]}
                cy={svgPaths.stripStart[1]}
                r={4.2}
                fill="#D5658B"
                stroke="#FFFBE4"
                strokeWidth="1.2"
              />
              <circle
                cx={svgPaths.stripEnd[0]}
                cy={svgPaths.stripEnd[1]}
                r={4.2}
                fill="#B95869"
                stroke="#FFFBE4"
                strokeWidth="1.2"
              />

              <line
                x1={30}
                y1={175}
                x2={198}
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
              <text
                x={202}
                y={178}
                fill="var(--math-ink-x)"
                fontSize="11"
                fontFamily="monospace"
              >
                x
              </text>
              <text
                x={26}
                y={12}
                fill="var(--math-ink-y)"
                fontSize="11"
                fontFamily="monospace"
              >
                y
              </text>
            </svg>

            <figcaption className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] text-xs font-tabular-mono">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 inline-block shrink-0"
                  style={{ backgroundColor: "#D5658B" }}
                  aria-hidden="true"
                />
                <span className="truncate text-[var(--text-secondary)]">
                  Entry: {order === "dydx" ? `y = ${yMinExpr}` : `x = ${xMinExpr}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 inline-block shrink-0"
                  style={{ backgroundColor: "#B95869" }}
                  aria-hidden="true"
                />
                <span className="truncate text-[var(--text-secondary)]">
                  Exit: {order === "dydx" ? `y = ${yMaxExpr}` : `x = ${xMaxExpr}`}
                </span>
              </div>
            </figcaption>
          </figure>

          {/* Slice Scrubber & Accumulated Volume Toggle */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <label
                htmlFor="order-lab-slider"
                className="text-[var(--text-secondary)]"
              >
                {order === "dydx"
                  ? `Sweep Outer x₀ = ${outerCoord.toFixed(2)}`
                  : `Sweep Outer y₀ = ${outerCoord.toFixed(2)}`}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3 text-[var(--math-ink-diff)]" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-[var(--math-ink-y)]" />
                      <span>Sweep</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Reset slice position"
                  title="Reset slice position"
                  onClick={() => {
                    setIsPlaying(false);
                    setSliceNorm(0.55);
                  }}
                  className="min-w-[24px] min-h-[24px] text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            </div>

            <input
              id="order-lab-slider"
              type="range"
              min={0.03}
              max={0.97}
              step={0.01}
              value={sliceNorm}
              onChange={(e) => {
                setIsPlaying(false);
                setSliceNorm(parseFloat(e.target.value));
              }}
              className="w-full cursor-pointer"
            />

            <label className="flex items-center gap-2 text-xs font-tabular-mono text-[var(--text-secondary)] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={showAccumulated}
                onChange={(e) => setShowAccumulated(e.target.checked)}
              />
              <span>
                Show Partial Accumulated Volume{" "}
                {order === "dydx" ? "∫ A(x) dx" : "∫ A(y) dy"} in 3D
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Side-by-Side Order Comparison Cards (Type I dy dx vs Type II dx dy) */}
      <div
        id="order-change"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 scroll-mt-24"
      >
        <div
          className={`p-4 border transition-colors ${
            order === "dydx"
              ? "border-[var(--border-strong)] bg-[var(--bg-canvas)]"
              : "border-[var(--border-subtle)] bg-[var(--bg-panel)]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-tabular-mono uppercase text-[var(--math-ink-x)] font-semibold">
              Type I • Vertical Strips (dy dx)
            </span>
            {order === "dydx" && (
              <span className="text-[11px] font-tabular-mono px-2 py-0.5 bg-[#25272C] border border-[#8D9FCE] text-[#FFFBE4]">
                Active in Viewport
              </span>
            )}
          </div>
          <KaTeXMath math={typeIDynamicLatex} block />
        </div>

        <div
          className={`p-4 border transition-colors ${
            order === "dxdy"
              ? "border-[var(--border-strong)] bg-[var(--bg-canvas)]"
              : "border-[var(--border-subtle)] bg-[var(--bg-panel)]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-tabular-mono uppercase text-[var(--math-ink-y)] font-semibold">
              Type II • Horizontal Strips (dx dy)
            </span>
            {order === "dxdy" && (
              <span className="text-[11px] font-tabular-mono px-2 py-0.5 bg-[#25272C] border border-[#96B898] text-[#FFFBE4]">
                Active in Viewport
              </span>
            )}
          </div>
          <KaTeXMath math={typeIIDynamicLatex} block />
        </div>
      </div>

      {/* Step-by-Step Pedagogical Accordion */}
      <div
        role="region"
        aria-label="Step-by-step derivation of limits and order reversal"
        className="space-y-2.5"
      >
        <details
          open
          className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
        >
          <summary className="px-4 py-3 text-sm font-math-serif font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)]">
            <ChevronDown
              className="w-4 h-4 text-[var(--math-ink-x)] shrink-0"
              aria-hidden="true"
            />
            <span>
              Step 1: Reading Entry &amp; Exit Limits from the 2D Domain (
              {preset.title})
            </span>
          </summary>
          <div className="px-4 pb-4 pt-2 border-t border-[var(--border-subtle)] space-y-2 text-sm font-math-serif text-[var(--text-secondary)] leading-relaxed">
            <p>{preset.pedagogicalSteps.boundsExplanation}</p>
            <div className="p-3 bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
              <KaTeXMath
                math={preset.pedagogicalSteps.inversionAlgebraLatex}
                block
              />
            </div>
          </div>
        </details>

        <details
          open
          className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
        >
          <summary className="px-4 py-3 text-sm font-math-serif font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)]">
            <ChevronDown
              className="w-4 h-4 text-[var(--math-ink-sweep)] shrink-0"
              aria-hidden="true"
            />
            <span>
              Step 2: Why Reversing the Order Matters Here (Evaluated Value ≈{" "}
              {totalIntegralValue.toFixed(4)})
            </span>
          </summary>
          <div className="px-4 pb-4 pt-2 border-t border-[var(--border-subtle)] text-sm font-math-serif text-[var(--text-secondary)] leading-relaxed">
            <p>{preset.pedagogicalSteps.whySwapMatters}</p>
          </div>
        </details>
      </div>
    </section>
  );
}
