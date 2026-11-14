"use client";

import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Compass, Layers, TrendingUp, Crosshair } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  createParametricSurfaceMesh,
  createVectorArrow3D,
  computePartialDerivatives2D,
  extractLevelCurveSegments,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

type LabMode = "2d-flow" | "3d-normal";

interface FlowPreset2D {
  id: string;
  name: string;
  badge: string;
  expr: string;
  defaultX0: number;
  defaultY0: number;
  defaultDirection: "ascent" | "descent";
  defaultStepSize: number;
  formulaLatex: string;
  insight: string;
}

const FLOW_PRESETS_2D: FlowPreset2D[] = [
  {
    id: "anisotropic-valley",
    name: "Anisotropic Elliptic Bowl: f(x,y) = 0.25x² + 1.15y²",
    badge: "Classic GD Zigzag",
    expr: "0.25 * x^2 + 1.15 * y^2",
    defaultX0: -1.5,
    defaultY0: 0.9,
    defaultDirection: "descent",
    defaultStepSize: 0.55,
    formulaLatex: "\\nabla f = \\langle 0.50x,\\; 2.30y \\rangle",
    insight:
      "Because curvature in y is 4.6× steeper than in x, continuous gradient flow curves smoothly while large discrete step sizes η oscillate across the narrow canyon.",
  },
  {
    id: "bimodal-saddle",
    name: "Bimodal Peaks & Saddle: f(x,y) = x·exp(-0.55(x²+y²)) + 0.15y",
    badge: "Dipole + Drift",
    expr: "x * exp(-0.55 * (x^2 + y^2)) + 0.15 * y",
    defaultX0: -0.25,
    defaultY0: -1.1,
    defaultDirection: "ascent",
    defaultStepSize: 0.35,
    formulaLatex:
      "\\nabla f = e^{-0.55r^2}\\langle 1 - 1.1x^2,\\; -1.1xy \\rangle + \\langle 0, 0.15 \\rangle",
    insight:
      "Notice how gradient flow trajectories bend toward the positive mountain summit at (+0.95, 0) while cutting every level contour strictly at 90°.",
  },
  {
    id: "banana-valley",
    name: "Curved Rosenbrock Canyon: f(x,y) = 0.12(1-x)² + 0.35(y - x²)²",
    badge: "Curved Ridge",
    expr: "0.12 * (1 - x)^2 + 0.35 * (y - x^2)^2",
    defaultX0: -1.2,
    defaultY0: 1.4,
    defaultDirection: "descent",
    defaultStepSize: 0.22,
    formulaLatex:
      "\\nabla f = \\langle -0.24(1-x) - 1.4x(y-x^2),\\; 0.70(y-x^2) \\rangle",
    insight:
      "Famous optimization benchmark: the gradient rapidly drops onto the parabolic trough y = x², then creeps slowly along the curved floor toward (1, 1).",
  },
  {
    id: "harmonic-waves",
    name: "Standing Thermal Field: f(x,y) = cos(1.3x)·sin(1.3y)",
    badge: "Periodic Cells",
    expr: "cos(1.3 * x) * sin(1.3 * y)",
    defaultX0: 0.7,
    defaultY0: 0.25,
    defaultDirection: "ascent",
    defaultStepSize: 0.28,
    formulaLatex:
      "\\nabla f = \\langle -1.3\\sin(1.3x)\\sin(1.3y),\\; 1.3\\cos(1.3x)\\cos(1.3y) \\rangle",
    insight:
      "Thermal conduction q = -k∇T travels from hot peaks to cold basins across closed isothermal loops; saddle corners occur where ∇f = 0.",
  },
];

interface Surface3DPreset {
  id: string;
  name: string;
  equationLatex: string;
  gradLatex: string;
  uRange: [number, number];
  vRange: [number, number];
  defaultU: number;
  defaultV: number;
  paramPoint: (u: number, v: number) => [number, number, number];
  evalF: (x: number, y: number, z: number) => number;
  gradF: (x: number, y: number, z: number) => [number, number, number];
  note: string;
}

const SURFACE_3D_PRESETS: Surface3DPreset[] = [
  {
    id: "ellipsoid",
    name: "Anisotropic Ellipsoid: x²/2.25 + y²/1.21 + z²/1.0 = 1",
    equationLatex: "F(x,y,z) = \\frac{x^2}{2.25} + \\frac{y^2}{1.21} + z^2 = 1",
    gradLatex:
      "\\nabla F = \\left\\langle \\frac{2x}{2.25},\\; \\frac{2y}{1.21},\\; 2z \\right\\rangle",
    uRange: [0.18, Math.PI - 0.18],
    vRange: [-Math.PI, Math.PI],
    defaultU: 1.05,
    defaultV: 0.7,
    paramPoint: (phi, theta) => [
      1.5 * Math.sin(phi) * Math.cos(theta),
      1.1 * Math.sin(phi) * Math.sin(theta),
      1.0 * Math.cos(phi),
    ],
    evalF: (x, y, z) => (x * x) / 2.25 + (y * y) / 1.21 + z * z,
    gradF: (x, y, z) => [(2 * x) / 2.25, (2 * y) / 1.21, 2 * z],
    note: "Unlike a sphere where the normal always passes through the origin, an ellipsoid's gradient ∇F weights each axis differently—pointing perpendicular to the true surface, not radially outward!",
  },
  {
    id: "paraboloid",
    name: "Elliptic Paraboloid Level Surface: z - 0.45x² - 0.25y² = 0",
    equationLatex: "F(x,y,z) = z - 0.45x^2 - 0.25y^2 = 0",
    gradLatex: "\\nabla F = \\langle -0.90x,\\; -0.50y,\\; 1 \\rangle",
    uRange: [-1.5, 1.5],
    vRange: [-1.5, 1.5],
    defaultU: 0.85,
    defaultV: -0.75,
    paramPoint: (x, y) => [x, y, 0.45 * x * x + 0.25 * y * y - 0.6],
    evalF: (x, y, z) => z + 0.6 - 0.45 * x * x - 0.25 * y * y,
    gradF: (x, y) => [-0.9 * x, -0.5 * y, 1],
    note: "Writing a graph z = g(x,y) implicitly as F(x,y,z) = z - g(x,y) = 0 explains the classic surface normal ⟨-g_x, -g_y, 1⟩ straight from ∇F.",
  },
  {
    id: "hyperboloid",
    name: "Hyperboloid Cooling Tower: x² + y² - 0.7z² = 0.8",
    equationLatex: "F(x,y,z) = x^2 + y^2 - 0.7z^2 = 0.8",
    gradLatex: "\\nabla F = \\langle 2x,\\; 2y,\\; -1.4z \\rangle",
    uRange: [-1.15, 1.15],
    vRange: [-Math.PI, Math.PI],
    defaultU: 0.55,
    defaultV: 0.85,
    paramPoint: (z, theta) => {
      const r = Math.sqrt(0.8 + 0.7 * z * z);
      return [r * Math.cos(theta), r * Math.sin(theta), z];
    },
    evalF: (x, y, z) => x * x + y * y - 0.7 * z * z,
    gradF: (x, y, z) => [2 * x, 2 * y, -1.4 * z],
    note: "Every vector u lying on the golden tangent plane satisfies D_u F = ∇F · u = 0, meaning infinitesimal motion along u stays on the level surface F = 0.8.",
  },
];

export function GradientAscentAndLevelSurfaceLab() {
  const [mode, setMode] = useState<LabMode>("2d-flow");

  // 2D Mode State
  const [preset2dId, setPreset2dId] = useState<string>("anisotropic-valley");
  const [expr2d, setExpr2d] = useState<string>(FLOW_PRESETS_2D[0].expr);
  const [isCustom2d, setIsCustom2d] = useState<boolean>(false);
  const [seedX, setSeedX] = useState<number>(FLOW_PRESETS_2D[0].defaultX0);
  const [seedY, setSeedY] = useState<number>(FLOW_PRESETS_2D[0].defaultY0);
  const [flowSign, setFlowSign] = useState<"ascent" | "descent">(
    FLOW_PRESETS_2D[0].defaultDirection
  );
  const [stepSizeEta, setStepSizeEta] = useState<number>(
    FLOW_PRESETS_2D[0].defaultStepSize
  );
  const [compassDeg, setCompassDeg] = useState<number>(215);

  // 3D Mode State
  const [preset3dId, setPreset3dId] = useState<string>("ellipsoid");
  const [uParam, setUParam] = useState<number>(SURFACE_3D_PRESETS[0].defaultU);
  const [vParam, setVParam] = useState<number>(SURFACE_3D_PRESETS[0].defaultV);
  const [dirAzimuthDeg, setDirAzimuthDeg] = useState<number>(35);
  const [dirElevDeg, setDirElevDeg] = useState<number>(25);

  const activePreset2d = useMemo(
    () => FLOW_PRESETS_2D.find((p) => p.id === preset2dId) ?? FLOW_PRESETS_2D[0],
    [preset2dId]
  );

  const activePreset3d = useMemo(
    () =>
      SURFACE_3D_PRESETS.find((p) => p.id === preset3dId) ??
      SURFACE_3D_PRESETS[0],
    [preset3dId]
  );

  const compiled2d = useMemo(
    () => compileMathExpression(expr2d, ["x", "y"]),
    [expr2d]
  );

  const domain = { xMin: -2.0, xMax: 2.0, yMin: -2.0, yMax: 2.0 };
  const safeX0 = Math.max(domain.xMin, Math.min(domain.xMax, seedX));
  const safeY0 = Math.max(domain.yMin, Math.min(domain.yMax, seedY));

  const handleSelect2dPreset = (p: FlowPreset2D) => {
    setPreset2dId(p.id);
    setExpr2d(p.expr);
    setSeedX(p.defaultX0);
    setSeedY(p.defaultY0);
    setFlowSign(p.defaultDirection);
    setStepSizeEta(p.defaultStepSize);
    setIsCustom2d(false);
  };

  const handleSelect3dPreset = (p: Surface3DPreset) => {
    setPreset3dId(p.id);
    setUParam(p.defaultU);
    setVParam(p.defaultV);
  };

  // 2D Computations: contours, vector field arrows, RK4 steepest flow, discrete GD steps, orthogonality
  const analysis2d = useMemo(() => {
    const evalF = (x: number, y: number) => compiled2d.evaluate({ x, y });
    const gradAt = (x: number, y: number): [number, number] => {
      const { fx, fy } = computePartialDerivatives2D(evalF, x, y, 1e-4);
      return [
        Number.isFinite(fx) ? fx : 0,
        Number.isFinite(fy) ? fy : 0,
      ];
    };

    const { f0, fx, fy, gradMagnitude } = computePartialDerivatives2D(
      evalF,
      safeX0,
      safeY0,
      1e-4
    );

    // Build background contour family
    let fMin = Infinity;
    let fMax = -Infinity;
    const sampleN = 16;
    for (let i = 0; i <= sampleN; i++) {
      const x = domain.xMin + (i / sampleN) * (domain.xMax - domain.xMin);
      for (let j = 0; j <= sampleN; j++) {
        const y = domain.yMin + (j / sampleN) * (domain.yMax - domain.yMin);
        const val = evalF(x, y);
        if (Number.isFinite(val)) {
          if (val < fMin) fMin = val;
          if (val > fMax) fMax = val;
        }
      }
    }
    if (!Number.isFinite(fMin) || fMax - fMin < 1e-5) {
      fMin = -2;
      fMax = 2;
    }

    const bgContours = [];
    const numLevels = 9;
    for (let k = 1; k < numLevels; k++) {
      const lvl = fMin + (k / numLevels) * (fMax - fMin);
      const segs = extractLevelCurveSegments(
        evalF,
        domain.xMin,
        domain.xMax,
        domain.yMin,
        domain.yMax,
        lvl,
        32,
        32
      );
      bgContours.push({ lvl, segs });
    }

    const activeContourSegs = Number.isFinite(f0)
      ? extractLevelCurveSegments(
          evalF,
          domain.xMin,
          domain.xMax,
          domain.yMin,
          domain.yMax,
          f0,
          36,
          36
        )
      : [];

    // Sample gradient vector field arrows on an 8x8 grid
    const gridArrows: {
      x: number;
      y: number;
      dx: number;
      dy: number;
      mag: number;
    }[] = [];
    const gN = 8;
    for (let i = 0; i <= gN; i++) {
      const x = -1.75 + (i / gN) * 3.5;
      for (let j = 0; j <= gN; j++) {
        const y = -1.75 + (j / gN) * 3.5;
        const [gx, gy] = gradAt(x, y);
        const mag = Math.hypot(gx, gy);
        if (mag > 1e-4) {
          const drawLen = Math.min(0.28, 0.08 + 0.14 * Math.tanh(mag * 0.5));
          gridArrows.push({
            x,
            y,
            dx: (gx / mag) * drawLen,
            dy: (gy / mag) * drawLen,
            mag,
          });
        }
      }
    }

    // Continuous RK4 integral curve along ±∇f (normalized flow for clean geometric curves)
    const sign = flowSign === "ascent" ? 1 : -1;
    const rk4Pts: [number, number][] = [[safeX0, safeY0]];
    let cx = safeX0;
    let cy = safeY0;
    const dt = 0.06;
    const rhs = (x: number, y: number): [number, number] => {
      const [gx, gy] = gradAt(x, y);
      const m = Math.hypot(gx, gy);
      if (m < 0.02) return [sign * gx, sign * gy];
      // Blend normalized unit flow with raw magnitude near critical points so trajectories settle smoothly
      const scale = Math.min(1.5, m) / m;
      return [sign * gx * scale, sign * gy * scale];
    };
    for (let s = 0; s < 55; s++) {
      const [k1x, k1y] = rhs(cx, cy);
      if (Math.hypot(k1x, k1y) < 1e-3) break;
      const [k2x, k2y] = rhs(cx + 0.5 * dt * k1x, cy + 0.5 * dt * k1y);
      const [k3x, k3y] = rhs(cx + 0.5 * dt * k2x, cy + 0.5 * dt * k2y);
      const [k4x, k4y] = rhs(cx + dt * k3x, cy + dt * k3y);
      cx += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
      cy += (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
      if (
        Math.abs(cx) > domain.xMax + 0.25 ||
        Math.abs(cy) > domain.yMax + 0.25
      ) {
        break;
      }
      rk4Pts.push([cx, cy]);
    }

    // Discrete optimization trajectory x_{k+1} = x_k ± η ∇f(x_k)
    const gdPts: { x: number; y: number; val: number }[] = [
      { x: safeX0, y: safeY0, val: f0 },
    ];
    let gxCur = safeX0;
    let gyCur = safeY0;
    for (let step = 0; step < 14; step++) {
      const [gx, gy] = gradAt(gxCur, gyCur);
      const nx = gxCur + sign * stepSizeEta * gx;
      const ny = gyCur + sign * stepSizeEta * gy;
      if (!Number.isFinite(nx) || !Number.isFinite(ny)) break;
      if (Math.abs(nx) > 3.2 || Math.abs(ny) > 3.2) {
        gdPts.push({
          x: Math.max(-2.2, Math.min(2.2, nx)),
          y: Math.max(-2.2, Math.min(2.2, ny)),
          val: evalF(nx, ny),
        });
        break;
      }
      gxCur = nx;
      gyCur = ny;
      gdPts.push({ x: gxCur, y: gyCur, val: evalF(gxCur, gyCur) });
      if (Math.hypot(gx, gy) < 0.015) break;
    }

    // Heading u and contour tangent orthogonality verification
    const alphaRad = (compassDeg * Math.PI) / 180;
    const ux = Math.cos(alphaRad);
    const uy = Math.sin(alphaRad);
    const duf = fx * ux + fy * uy;
    const gradAngleRad = Math.atan2(fy, fx);
    const gradAngleDeg = ((gradAngleRad * 180) / Math.PI + 360) % 360;

    // Unit tangent along contour: t = (-fy, fx) / ‖∇f‖
    const tx = gradMagnitude > 1e-6 ? -fy / gradMagnitude : 0;
    const ty = gradMagnitude > 1e-6 ? fx / gradMagnitude : 1;
    const orthoDot = fx * tx + fy * ty;

    return {
      f0,
      fx,
      fy,
      gradMagnitude,
      bgContours,
      activeContourSegs,
      gridArrows,
      rk4Pts,
      gdPts,
      ux,
      uy,
      duf,
      gradAngleDeg,
      tx,
      ty,
      orthoDot,
    };
  }, [compiled2d, safeX0, safeY0, flowSign, stepSizeEta, compassDeg]);

  // 3D Mode Computations
  const analysis3d = useMemo(() => {
    const safeU = Math.max(
      activePreset3d.uRange[0],
      Math.min(activePreset3d.uRange[1], uParam)
    );
    const safeV = Math.max(
      activePreset3d.vRange[0],
      Math.min(activePreset3d.vRange[1], vParam)
    );
    const p = activePreset3d.paramPoint(safeU, safeV);
    const g = activePreset3d.gradF(p[0], p[1], p[2]);
    const gMag = Math.hypot(g[0], g[1], g[2]);
    const unitNormal: [number, number, number] =
      gMag > 1e-6 ? [g[0] / gMag, g[1] / gMag, g[2] / gMag] : [0, 0, 1];

    // Heading u in 3D from spherical angles
    const azRad = (dirAzimuthDeg * Math.PI) / 180;
    const elRad = (dirElevDeg * Math.PI) / 180;
    const uVec: [number, number, number] = [
      Math.cos(elRad) * Math.cos(azRad),
      Math.cos(elRad) * Math.sin(azRad),
      Math.sin(elRad),
    ];

    const duF = g[0] * uVec[0] + g[1] * uVec[1] + g[2] * uVec[2];
    const cosAngle =
      gMag > 1e-6 ? Math.max(-1, Math.min(1, duF / gMag)) : 0;
    const angleDeg = (Math.acos(cosAngle) * 180) / Math.PI;

    return {
      safeU,
      safeV,
      p,
      g,
      gMag,
      unitNormal,
      uVec,
      duF,
      angleDeg,
      fVal: activePreset3d.evalF(p[0], p[1], p[2]),
    };
  }, [activePreset3d, uParam, vParam, dirAzimuthDeg, dirElevDeg]);

  // Build 3D Three.js Scene for Mode B
  const build3dScene = useMemo(() => {
    return (sceneGroup: THREE.Group) => {
      // 1. Level Surface F(x,y,z) = c
      const surfMesh = createParametricSurfaceMesh(
        (u, v) => activePreset3d.paramPoint(u, v),
        activePreset3d.uRange,
        activePreset3d.vRange,
        36,
        36,
        {
          color: 0x029091,
          opacity: 0.45,
          wireframeColor: 0x8d9fce,
          wireframeOpacity: 0.25,
          showWireframe: true,
        }
      );
      sceneGroup.add(surfMesh);

      const { p, g, gMag, unitNormal, uVec } = analysis3d;

      // 2. Orthonormal basis (e1, e2) in tangent plane orthogonal to ∇F
      const ref: [number, number, number] =
        Math.abs(unitNormal[2]) < 0.85 ? [0, 0, 1] : [1, 0, 0];
      const e1Raw: [number, number, number] = [
        ref[1] * unitNormal[2] - ref[2] * unitNormal[1],
        ref[2] * unitNormal[0] - ref[0] * unitNormal[2],
        ref[0] * unitNormal[1] - ref[1] * unitNormal[0],
      ];
      const e1Len = Math.hypot(e1Raw[0], e1Raw[1], e1Raw[2]) || 1;
      const e1: [number, number, number] = [
        e1Raw[0] / e1Len,
        e1Raw[1] / e1Len,
        e1Raw[2] / e1Len,
      ];
      const e2: [number, number, number] = [
        unitNormal[1] * e1[2] - unitNormal[2] * e1[1],
        unitNormal[2] * e1[0] - unitNormal[0] * e1[2],
        unitNormal[0] * e1[1] - unitNormal[1] * e1[0],
      ];

      // 3. Tangent Plane Patch at p
      const planeGroup = createParametricSurfaceMesh(
        (s, t) => [
          p[0] + s * e1[0] + t * e2[0],
          p[1] + s * e1[1] + t * e2[1],
          p[2] + s * e1[2] + t * e2[2],
        ],
        [-0.75, 0.75],
        [-0.75, 0.75],
        4,
        4,
        {
          color: 0xfbeaa4,
          opacity: 0.34,
          wireframeColor: 0xfbeaa4,
          wireframeOpacity: 0.65,
          showWireframe: true,
        }
      );
      sceneGroup.add(planeGroup);

      // 4. Probe sphere at p
      const probeSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 18, 18),
        new THREE.MeshBasicMaterial({ color: 0xfbeaa4 })
      );
      probeSphere.position.copy(mathToThreeVec3(p[0], p[1], p[2]));
      sceneGroup.add(probeSphere);

      // 5. Gradient Normal Arrow ∇F (#D35323 Persimmon)
      const gradScale = Math.min(1.4, Math.max(0.45, 0.5 * gMag));
      sceneGroup.add(
        createVectorArrow3D(
          p,
          [unitNormal[0], unitNormal[1], unitNormal[2]],
          gradScale,
          0xd35323,
          0.22
        )
      );

      // 6. Probe Direction u (#8D9FCE Periwinkle)
      sceneGroup.add(createVectorArrow3D(p, uVec, 0.95, 0x8d9fce, 0.2));
    };
  }, [activePreset3d, analysis3d]);

  return (
    <section
      id="gradient-flow-level-surface-normal"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Lab Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
            Laboratory 3.1.3.2 • Gradient Flow, Contour Orthogonality &amp; 3D Surface Normals
          </span>
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
            Gradient Ascent Trajectories, Polar Slope Rose &amp; 3D Level Surfaces
          </h2>
          <p className="text-sm font-math-serif text-[var(--text-secondary)]">
            Trace integral curves perpendicular to contours, test gradient-descent stability vs.
            overshoot, and rotate 3D directions against the normal <KaTeXMath math="\nabla F" />.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMode("2d-flow")}
            className={`px-3 py-2 text-xs font-tabular-mono border transition-colors flex items-center gap-1.5 ${
              mode === "2d-flow"
                ? "border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-[var(--text-primary)] font-semibold"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[var(--math-ink-sweep)]" />
            <span>2D Gradient Flow &amp; Slope Rose</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("3d-normal")}
            className={`px-3 py-2 text-xs font-tabular-mono border transition-colors flex items-center gap-1.5 ${
              mode === "3d-normal"
                ? "border-[var(--math-ink-z)] bg-[#029091]/15 text-[var(--text-primary)] font-semibold"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[var(--math-ink-z)]" />
            <span>3D Level Surface Normal ∇F</span>
          </button>
        </div>
      </div>

      {mode === "2d-flow" ? (
        <div className="space-y-6">
          {/* Presets Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {FLOW_PRESETS_2D.map((p) => {
              const selected = !isCustom2d && preset2dId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect2dPreset(p)}
                  className={`p-3 border text-left transition-colors ${
                    selected
                      ? "border-[var(--math-ink-sweep)] bg-[var(--bg-canvas)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 hover:border-[var(--border-strong)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-tabular-mono text-[var(--math-ink-sweep)] font-semibold">
                      {p.badge}
                    </span>
                  </div>
                  <div className="text-xs font-math-serif text-[var(--text-primary)] leading-snug">
                    {p.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Equation Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-6">
              <MathExpressionInput
                label="Scalar Potential f(x, y)"
                prefixLatex="f(x,y) ="
                value={expr2d}
                allowedVars={["x", "y"]}
                onChange={(val) => {
                  setExpr2d(val);
                  setIsCustom2d(true);
                }}
              />
            </div>
            <div className="lg:col-span-6 p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-tabular-mono text-[var(--text-muted)]">
                <span>SYMBOLIC GRADIENT &amp; GEOMETRY</span>
                <span className="text-[var(--math-ink-diff)]">
                  {isCustom2d ? "Custom Potential" : activePreset2d.badge}
                </span>
              </div>
              {!isCustom2d && (
                <div className="text-xs overflow-x-auto">
                  <KaTeXMath math={activePreset2d.formulaLatex} />
                </div>
              )}
              <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                {isCustom2d
                  ? "Numerical gradients are evaluated via central differences across the domain; click anywhere on the contour map to re-seed the trajectory."
                  : activePreset2d.insight}
              </p>
            </div>
          </div>

          {/* Main 2-Panel Visual Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive 2D Contour + Flow Map */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-[var(--math-ink-sweep)]" />
                  <span>
                    Click map to place seed (x₀, y₀) = ({safeX0.toFixed(2)},{" "}
                    {safeY0.toFixed(2)})
                  </span>
                </span>
                <span className="text-[var(--math-ink-y)]">90° Contour Crossing</span>
              </div>

              <SvgCoordinatePlane2D
                xRange={[domain.xMin, domain.xMax]}
                yRange={[domain.yMin, domain.yMax]}
                width={460}
                height={380}
                ariaLabel="2D gradient flow lines and discrete optimization steps over level curves"
                onSelectPoint={(x, y) => {
                  setSeedX(Number(x.toFixed(2)));
                  setSeedY(Number(y.toFixed(2)));
                }}
                className="w-full h-[380px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] cursor-crosshair select-none"
              >
                {({ toSvgX, toSvgY }) => {
                  const p0x = toSvgX(safeX0);
                  const p0y = toSvgY(safeY0);

                  // RK4 continuous trajectory path
                  const rkPath = analysis2d.rk4Pts
                    .map(
                      ([px, py], i) =>
                        `${i === 0 ? "M" : "L"}${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`
                    )
                    .join(" ");

                  // Discrete GD trajectory path
                  const gdPath = analysis2d.gdPts
                    .map(
                      (pt, i) =>
                        `${i === 0 ? "M" : "L"}${toSvgX(pt.x).toFixed(1)},${toSvgY(pt.y).toFixed(1)}`
                    )
                    .join(" ");

                  // Tangent & Gradient display vectors at seed
                  const gScale =
                    analysis2d.gradMagnitude > 1e-6
                      ? Math.min(0.65, 0.25 + 0.35 * Math.tanh(analysis2d.gradMagnitude * 0.45)) /
                        analysis2d.gradMagnitude
                      : 0;
                  const gxEndX = toSvgX(safeX0 + analysis2d.fx * gScale);
                  const gxEndY = toSvgY(safeY0 + analysis2d.fy * gScale);
                  const txPosX = toSvgX(safeX0 + analysis2d.tx * 0.48);
                  const txPosY = toSvgY(safeY0 + analysis2d.ty * 0.48);
                  const txNegX = toSvgX(safeX0 - analysis2d.tx * 0.48);
                  const txNegY = toSvgY(safeY0 - analysis2d.ty * 0.48);
                  const uEndX = toSvgX(safeX0 + analysis2d.ux * 0.48);
                  const uEndY = toSvgY(safeY0 + analysis2d.uy * 0.48);

                  return (
                    <g>
                      {/* Background Contour Curves */}
                      {analysis2d.bgContours.map((grp, idx) =>
                        grp.segs.map((s, sIdx) => (
                          <line
                            key={`c-${idx}-${sIdx}`}
                            x1={toSvgX(s.x1)}
                            y1={toSvgY(s.y1)}
                            x2={toSvgX(s.x2)}
                            y2={toSvgY(s.y2)}
                            stroke="#525663"
                            strokeWidth="1"
                            strokeOpacity="0.65"
                          />
                        ))
                      )}

                      {/* Active Contour f(x,y) = f(x0,y0) */}
                      {analysis2d.activeContourSegs.map((s, idx) => (
                        <line
                          key={`ac-${idx}`}
                          x1={toSvgX(s.x1)}
                          y1={toSvgY(s.y1)}
                          x2={toSvgX(s.x2)}
                          y2={toSvgY(s.y2)}
                          stroke="#FBEAA4"
                          strokeWidth="2"
                          strokeOpacity="0.85"
                        />
                      ))}

                      {/* Sampled Gradient Vector Field Grid */}
                      {analysis2d.gridArrows.map((a, idx) => {
                        const sx = toSvgX(a.x);
                        const sy = toSvgY(a.y);
                        const ex = toSvgX(a.x + a.dx);
                        const ey = toSvgY(a.y + a.dy);
                        return (
                          <g key={`vf-${idx}`} opacity={0.48}>
                            <line
                              x1={sx}
                              y1={sy}
                              x2={ex}
                              y2={ey}
                              stroke="#8D9FCE"
                              strokeWidth="1.2"
                            />
                            <circle cx={ex} cy={ey} r="1.5" fill="#8D9FCE" />
                          </g>
                        );
                      })}

                      {/* Continuous RK4 Steepest Flow Curve */}
                      {rkPath && (
                        <path
                          d={rkPath}
                          fill="none"
                          stroke={flowSign === "ascent" ? "#D35323" : "#96B898"}
                          strokeWidth="2.5"
                        />
                      )}

                      {/* Discrete Gradient Step Polyline */}
                      {gdPath && (
                        <path
                          d={gdPath}
                          fill="none"
                          stroke="#D5658B"
                          strokeWidth="1.75"
                          strokeDasharray="4 3"
                        />
                      )}
                      {analysis2d.gdPts.slice(1).map((pt, i) => (
                        <circle
                          key={`gd-${i}`}
                          cx={toSvgX(pt.x)}
                          cy={toSvgY(pt.y)}
                          r="3"
                          fill="#D5658B"
                        />
                      ))}

                      {/* Contour Tangent Line at Seed */}
                      <line
                        x1={txNegX}
                        y1={txNegY}
                        x2={txPosX}
                        y2={txPosY}
                        stroke="#FBEAA4"
                        strokeWidth="1.75"
                        strokeDasharray="3 2"
                      />

                      {/* Unit Heading Vector u (#8D9FCE) */}
                      <line
                        x1={p0x}
                        y1={p0y}
                        x2={uEndX}
                        y2={uEndY}
                        stroke="#8D9FCE"
                        strokeWidth="2.4"
                      />
                      <circle cx={uEndX} cy={uEndY} r="3.5" fill="#8D9FCE" />

                      {/* Gradient Vector ∇f (#D35323) */}
                      {analysis2d.gradMagnitude > 1e-4 && (
                        <>
                          <line
                            x1={p0x}
                            y1={p0y}
                            x2={gxEndX}
                            y2={gxEndY}
                            stroke="#D35323"
                            strokeWidth="3"
                          />
                          <circle cx={gxEndX} cy={gxEndY} r="4" fill="#D35323" />
                        </>
                      )}

                      {/* Seed Pin */}
                      <circle
                        cx={p0x}
                        cy={p0y}
                        r="5.5"
                        fill="#FBEAA4"
                        stroke="#1E1F22"
                        strokeWidth="1.75"
                      />
                    </g>
                  );
                }}
              </SvgCoordinatePlane2D>

              {/* Color Legend */}
              <div className="flex flex-wrap gap-4 text-[11px] font-tabular-mono text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#D35323] inline-block" />
                  <span>∇f &amp; Continuous Ascent Flow</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#96B898] inline-block" />
                  <span>Continuous Descent (-∇f)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#D5658B] inline-block" />
                  <span>Discrete Step Path (η = {stepSizeEta.toFixed(2)})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#FBEAA4] inline-block" />
                  <span>Active Contour &amp; Tangent</span>
                </span>
              </div>
            </div>

            {/* Right: Controls + Polar Slope Rose + Orthogonality Proof */}
            <div className="lg:col-span-5 space-y-4">
              {/* Polar Slope Rose SVG */}
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <div className="flex items-center justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-diff)] font-semibold">
                    360° POLAR SLOPE ROSE: D_u f(α) = ‖∇f‖ cos θ
                  </span>
                  <span className="text-[var(--text-muted)]">
                    θ = {Math.abs(((compassDeg - analysis2d.gradAngleDeg + 540) % 360) - 180).toFixed(0)}°
                  </span>
                </div>

                {(() => {
                  const W = 320;
                  const H = 200;
                  const cx = W / 2;
                  const cy = H / 2;
                  const maxR = 76;
                  const gMag = Math.max(analysis2d.gradMagnitude, 1e-4);
                  const posPts: string[] = [];
                  const negPts: string[] = [];
                  for (let deg = 0; deg <= 360; deg += 4) {
                    const rad = (deg * Math.PI) / 180;
                    const slope =
                      analysis2d.fx * Math.cos(rad) +
                      analysis2d.fy * Math.sin(rad);
                    const normR = (Math.abs(slope) / gMag) * maxR;
                    const sx = cx + normR * Math.cos(rad);
                    const sy = cy - normR * Math.sin(rad);
                    if (slope >= 0) {
                      posPts.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
                    } else {
                      negPts.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
                    }
                  }
                  const alphaRad = (compassDeg * Math.PI) / 180;
                  const uX = cx + 68 * Math.cos(alphaRad);
                  const uY = cy - 68 * Math.sin(alphaRad);
                  const projR = (Math.abs(analysis2d.duf) / gMag) * maxR;
                  const projSign = analysis2d.duf >= 0 ? 1 : -1;
                  const projX = cx + projSign * projR * Math.cos(alphaRad);
                  const projY = cy - projSign * projR * Math.sin(alphaRad);

                  return (
                    <svg
                      viewBox={`0 0 ${W} ${H}`}
                      className="w-full h-44 bg-[var(--bg-panel)] border border-[var(--border-subtle)]"
                      role="img"
                      aria-label="Polar plot of positive and negative directional derivative lobes"
                    >
                      <line x1={12} y1={cy} x2={W - 12} y2={cy} stroke="#35383F" />
                      <line x1={cx} y1={10} x2={cx} y2={H - 10} stroke="#35383F" />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={maxR}
                        fill="none"
                        stroke="#35383F"
                        strokeDasharray="3 3"
                      />
                      {posPts.length > 2 && (
                        <polygon
                          points={posPts.join(" ")}
                          fill="#D35323"
                          fillOpacity="0.22"
                          stroke="#D35323"
                          strokeWidth="1.8"
                        />
                      )}
                      {negPts.length > 2 && (
                        <polygon
                          points={negPts.join(" ")}
                          fill="#8D9FCE"
                          fillOpacity="0.2"
                          stroke="#8D9FCE"
                          strokeWidth="1.8"
                        />
                      )}
                      <line
                        x1={cx}
                        y1={cy}
                        x2={uX}
                        y2={uY}
                        stroke="#8D9FCE"
                        strokeWidth="2"
                      />
                      <circle
                        cx={projX}
                        cy={projY}
                        r="4.5"
                        fill={analysis2d.duf >= 0 ? "#D35323" : "#96B898"}
                        stroke="#1E1F22"
                        strokeWidth="1.5"
                      />
                      <text
                        x={12}
                        y={20}
                        fill="var(--math-ink-sweep)"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        Ascent Lobe (+)
                      </text>
                      <text
                        x={12}
                        y={34}
                        fill="var(--math-ink-x)"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        Descent Lobe (-)
                      </text>
                    </svg>
                  );
                })()}
                <p className="text-[11px] font-math-serif text-[var(--text-secondary)]">
                  The polar graph of <KaTeXMath math="|D_{\mathbf{u}}f| = \|\nabla f\|\,|\cos\theta|" />{" "}
                  always forms two tangent circles: maximum ascent diameter along{" "}
                  <KaTeXMath math="+\nabla f" /> and zero pinch-point along the contour tangent.
                </p>
              </div>

              {/* Flow & Optimization Controls */}
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFlowSign("ascent")}
                    className={`py-1.5 px-2 text-xs font-tabular-mono border ${
                      flowSign === "ascent"
                        ? "border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-[var(--math-ink-sweep)] font-semibold"
                        : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-muted)]"
                    }`}
                  >
                    Ascent (+∇f)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlowSign("descent")}
                    className={`py-1.5 px-2 text-xs font-tabular-mono border ${
                      flowSign === "descent"
                        ? "border-[var(--math-ink-y)] bg-[#96B898]/15 text-[var(--math-ink-y)] font-semibold"
                        : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-muted)]"
                    }`}
                  >
                    Descent (-∇f)
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-lower)]">
                    <span>Discrete Step Size η (xₙ₊₁ = xₙ ± η∇f)</span>
                    <span>{stepSizeEta.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.95}
                    step={0.02}
                    value={stepSizeEta}
                    onChange={(e) => setStepSizeEta(parseFloat(e.target.value))}
                    className="w-full accent-[#D5658B]"
                    aria-label="Discrete step size η"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-x)]">
                    <span>Compass Heading α (u = ⟨cos α, sin α⟩)</span>
                    <span>{compassDeg.toFixed(0)}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={compassDeg}
                    onChange={(e) => setCompassDeg(parseFloat(e.target.value))}
                    className="w-full accent-[#8D9FCE]"
                    aria-label="Compass heading α (degrees)"
                  />
                </div>
              </div>

              {/* Orthogonality & Directional Telemetry */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-tabular-mono">
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                  <span className="text-[var(--math-ink-sweep)] text-[10px] block">
                    ‖∇f(x₀, y₀)‖ MAX SLOPE
                  </span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    {analysis2d.gradMagnitude.toFixed(4)}
                  </span>
                </div>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                  <span className="text-[var(--math-ink-x)] text-[10px] block">
                    D_u f(α) = ∇f · u
                  </span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    {analysis2d.duf.toFixed(4)}
                  </span>
                </div>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                  <span className="text-[var(--math-ink-diff)] text-[10px] block">
                    ORTHOGONALITY ∇f · t̂
                  </span>
                  <span className="text-[var(--math-ink-y)] font-semibold">
                    {analysis2d.orthoDot.toExponential(1)}
                  </span>
                </div>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                  <span className="text-[var(--math-ink-lower)] text-[10px] block">
                    AFTER 14 STEPS f(x₁₄)
                  </span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    {analysis2d.gdPts[analysis2d.gdPts.length - 1]?.val.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mode B: 3D Level Surface Normal ∇F & 3D Directional Slope */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {SURFACE_3D_PRESETS.map((p) => {
              const selected = preset3dId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect3dPreset(p)}
                  className={`p-3 border text-left transition-colors ${
                    selected
                      ? "border-[var(--math-ink-z)] bg-[var(--bg-canvas)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 hover:border-[var(--border-strong)]"
                  }`}
                >
                  <div className="text-xs font-math-serif text-[var(--text-primary)] leading-snug">
                    {p.name}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-2">
              <ThreeOrbitViewport
                heightClassName="h-[400px]"
                cameraPosition={[3.6, 2.8, 3.6]}
                titleBadge="3D Level Surface Normal ∇F & Tangent Plane"
                onBuildScene={build3dScene}
                sceneDeps={[build3dScene]}
              />
              <div className="flex flex-wrap gap-4 text-[11px] font-tabular-mono text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#D35323] inline-block" />
                  <span>3D Gradient Normal ∇F</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#8D9FCE] inline-block" />
                  <span>3D Unit Direction u</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#FBEAA4] inline-block" />
                  <span>Tangent Plane (∇F · u = 0)</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <div className="text-xs overflow-x-auto space-y-1">
                  <KaTeXMath math={activePreset3d.equationLatex} block />
                  <KaTeXMath math={activePreset3d.gradLatex} block />
                </div>
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  {activePreset3d.note}
                </p>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--math-ink-z)]">
                      <span>Surface u</span>
                      <span>{analysis3d.safeU.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={activePreset3d.uRange[0]}
                      max={activePreset3d.uRange[1]}
                      step={0.04}
                      value={analysis3d.safeU}
                      onChange={(e) => setUParam(parseFloat(e.target.value))}
                      className="w-full accent-[#029091]"
                      aria-label="Surface parameter u"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--math-ink-y)]">
                      <span>Surface v</span>
                      <span>{analysis3d.safeV.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={activePreset3d.vRange[0]}
                      max={activePreset3d.vRange[1]}
                      step={0.05}
                      value={analysis3d.safeV}
                      onChange={(e) => setVParam(parseFloat(e.target.value))}
                      className="w-full accent-[#96B898]"
                      aria-label="Surface parameter v"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--math-ink-x)]">
                      <span>u Azimuth φ</span>
                      <span>{dirAzimuthDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={2}
                      value={dirAzimuthDeg}
                      onChange={(e) =>
                        setDirAzimuthDeg(parseFloat(e.target.value))
                      }
                      className="w-full accent-[#8D9FCE]"
                      aria-label="Unit direction azimuth φ (degrees)"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--math-ink-x)]">
                      <span>u Elevation θ</span>
                      <span>{dirElevDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min={-85}
                      max={85}
                      step={2}
                      value={dirElevDeg}
                      onChange={(e) => setDirElevDeg(parseFloat(e.target.value))}
                      className="w-full accent-[#8D9FCE]"
                      aria-label="Unit direction elevation θ (degrees)"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const az =
                      (Math.atan2(analysis3d.unitNormal[1], analysis3d.unitNormal[0]) *
                        180) /
                      Math.PI;
                    const el =
                      (Math.asin(
                        Math.max(-1, Math.min(1, analysis3d.unitNormal[2]))
                      ) *
                        180) /
                      Math.PI;
                    setDirAzimuthDeg(Math.round((az + 360) % 360));
                    setDirElevDeg(Math.round(el));
                  }}
                  className="w-full py-1.5 px-3 border border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[var(--bg-panel)] hover:bg-[#D35323]/15 text-xs font-tabular-mono flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Snap 3D Heading u to Normal ∇F (Max D_u F)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-tabular-mono">
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                  <span className="text-[var(--math-ink-sweep)] text-[10px] block">
                    ∇F(p) NORMAL
                  </span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    ⟨{analysis3d.g.map((v) => v.toFixed(2)).join(", ")}⟩
                  </span>
                </div>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                  <span className="text-[var(--math-ink-x)] text-[10px] block">
                    3D SLOPE D_u F
                  </span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    {analysis3d.duF.toFixed(3)} (∠ {analysis3d.angleDeg.toFixed(1)}°)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
