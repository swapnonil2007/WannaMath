"use client";

import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { Compass, Layers, Sparkles, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  mathToThreeVec3,
  createParametricSurfaceMesh,
  createImplicitLevelSurfaceMesh,
  createVectorArrow3D,
  computePartialDerivatives2D,
  computePartialDerivatives3D,
  extractLevelCurveSegments,
} from "@/components/visualizations/primitives";

type DimensionMode = "2d" | "3d";

interface GradientPreset2D {
  id: string;
  label: string;
  expr: string;
  x0: number;
  y0: number;
  radius: number;
  formulaLatex: string;
  note: string;
}

interface GradientPreset3D {
  id: string;
  label: string;
  expr: string;
  x0: number;
  y0: number;
  z0: number;
  radius: number;
  formulaLatex: string;
  note: string;
}

const PRESETS_2D: GradientPreset2D[] = [
  {
    id: "elliptic-hill",
    label: "Elliptic Hill",
    expr: "2 - 0.35 * x^2 - 0.75 * y^2",
    x0: 0.9,
    y0: 0.6,
    radius: 2.2,
    formulaLatex: "\\nabla f = \\langle -0.70x,\\; -1.50y \\rangle",
    note: "Because curvature in y is stronger than in x, ∇f tilts away from the origin ray to stay strictly perpendicular to the elliptical level contour.",
  },
  {
    id: "hyperbolic-saddle",
    label: "Hyperbolic Saddle",
    expr: "0.5 * (x^2 - y^2)",
    x0: 0.9,
    y0: 0.65,
    radius: 2.2,
    formulaLatex: "\\nabla f = \\langle x,\\; -y \\rangle",
    note: "Along any hyperbola x² - y² = c, ∇f points outward from the saddle center across the ridge while remaining orthogonal to the hyperbola tangent.",
  },
  {
    id: "dipole-potential",
    label: "Dipole Potential",
    expr: "1.6 * x * exp(-0.55 * (x^2 + y^2))",
    x0: 0.45,
    y0: 0.55,
    radius: 2.4,
    formulaLatex: "\\nabla f = 1.6 e^{-0.55r^2}\\langle 1 - 1.1x^2,\\; -1.1xy \\rangle",
    note: "Electrostatic field lines follow -∇V from positive peak to negative basin, crossing every equipotential contour at 90°.",
  },
  {
    id: "wave-interference",
    label: "Wave Field",
    expr: "sin(x) * cos(y) + 0.18 * x",
    x0: 0.6,
    y0: 0.4,
    radius: 2.6,
    formulaLatex: "\\nabla f = \\langle \\cos x \\cos y + 0.18,\\; -\\sin x \\sin y \\rangle",
    note: "Superposed wave interference produces alternating local crests and troughs where ∇f vanishes.",
  },
];

const PRESETS_3D: GradientPreset3D[] = [
  {
    id: "cubic-poly",
    label: "Cubic x²yz + 4xz²",
    expr: "x^2 * y * z + 4 * x * z^2",
    x0: 1,
    y0: -1,
    z0: -1,
    radius: 2.4,
    formulaLatex: "\\nabla \\phi = \\langle 2xyz + 4z^2,\\; x^2 z,\\; x^2 y + 8xz \\rangle",
    note: "Classic vector calculus scalar point function: compute each component partial at P(x₀, y₀, z₀) to obtain the normal to the cubic level surface φ = c.",
  },
  {
    id: "anisotropic-ellipsoid",
    label: "Ellipsoid Surface",
    expr: "x^2 / 2.2 + y^2 + z^2 / 1.4",
    x0: 1.0,
    y0: 0.7,
    z0: 0.6,
    radius: 2.2,
    formulaLatex: "\\nabla \\phi = \\left\\langle \\frac{2x}{2.2},\\; 2y,\\; \\frac{2z}{1.4} \\right\\rangle",
    note: "Because semi-axes differ, the surface normal ∇φ points perpendicular to the tangent plane rather than radially from the origin.",
  },
  {
    id: "hyperboloid-shell",
    label: "Hyperboloid Shell",
    expr: "x^2 + y^2 - 0.75 * z^2",
    x0: 0.9,
    y0: 0.6,
    z0: 0.5,
    radius: 2.2,
    formulaLatex: "\\nabla \\phi = \\langle 2x,\\; 2y,\\; -1.5z \\rangle",
    note: "The level surface φ(x,y,z) = c forms a hyperboloid of one sheet (when c > 0) whose golden tangent plane at P is orthogonal to ∇φ(P).",
  },
  {
    id: "harmonic-3d",
    label: "3D Cosine Potential",
    expr: "cos(x) + cos(y) + 0.6 * z^2",
    x0: 0.7,
    y0: 0.8,
    z0: 0.9,
    radius: 2.4,
    formulaLatex: "\\nabla \\phi = \\langle -\\sin x,\\; -\\sin y,\\; 1.2z \\rangle",
    note: "Models periodic potential wells in a crystal lattice where force F = -∇φ drives particles toward potential minima.",
  },
];

function fmtSigned(n: number): string {
  if (!Number.isFinite(n)) return "NaN";
  return Math.abs(n) < 1e-4 ? "0.000" : n.toFixed(3);
}

function buildPerpTangentBasis(nx: number, ny: number, nz: number): {
  t1: [number, number, number];
  t2: [number, number, number];
} {
  const len = Math.hypot(nx, ny, nz);
  if (len < 1e-9) {
    return { t1: [1, 0, 0], t2: [0, 1, 0] };
  }
  const ux = nx / len;
  const uy = ny / len;
  const uz = nz / len;
  const ref: [number, number, number] =
    Math.abs(uz) < 0.85 ? [0, 0, 1] : [1, 0, 0];
  // t1 = ref x u
  let t1x = ref[1] * uz - ref[2] * uy;
  let t1y = ref[2] * ux - ref[0] * uz;
  let t1z = ref[0] * uy - ref[1] * ux;
  const t1Len = Math.hypot(t1x, t1y, t1z) || 1;
  t1x /= t1Len;
  t1y /= t1Len;
  t1z /= t1Len;
  // t2 = u x t1
  const t2x = uy * t1z - uz * t1y;
  const t2y = uz * t1x - ux * t1z;
  const t2z = ux * t1y - uy * t1x;
  return {
    t1: [t1x, t1y, t1z],
    t2: [t2x, t2y, t2z],
  };
}

export function VectorGradientCalculatorLab() {
  const [dimMode, setDimMode] = useState<DimensionMode>("2d");

  // 2D state
  const [preset2dId, setPreset2dId] = useState<string>(PRESETS_2D[0].id);
  const [expr2d, setExpr2d] = useState<string>(PRESETS_2D[0].expr);
  const [isCustom2d, setIsCustom2d] = useState<boolean>(false);
  const [x0_2d, setX0_2d] = useState<string>(String(PRESETS_2D[0].x0));
  const [y0_2d, setY0_2d] = useState<string>(String(PRESETS_2D[0].y0));
  const [radius2d, setRadius2d] = useState<number>(PRESETS_2D[0].radius);

  // 3D state
  const [preset3dId, setPreset3dId] = useState<string>(PRESETS_3D[0].id);
  const [expr3d, setExpr3d] = useState<string>(PRESETS_3D[0].expr);
  const [isCustom3d, setIsCustom3d] = useState<boolean>(false);
  const [x0_3d, setX0_3d] = useState<string>(String(PRESETS_3D[0].x0));
  const [y0_3d, setY0_3d] = useState<string>(String(PRESETS_3D[0].y0));
  const [z0_3d, setZ0_3d] = useState<string>(String(PRESETS_3D[0].z0));
  const [radius3d, setRadius3d] = useState<number>(PRESETS_3D[0].radius);

  const compiled2d = useMemo(() => compileMathExpression(expr2d, ["x", "y"]), [expr2d]);
  const compiled3d = useMemo(() => compileMathExpression(expr3d, ["x", "y", "z"]), [expr3d]);

  const parsedP2 = useMemo(() => {
    const px = Number.parseFloat(x0_2d);
    const py = Number.parseFloat(y0_2d);
    return {
      x: Number.isFinite(px) ? px : 0,
      y: Number.isFinite(py) ? py : 0,
    };
  }, [x0_2d, y0_2d]);

  const parsedP3 = useMemo(() => {
    const px = Number.parseFloat(x0_3d);
    const py = Number.parseFloat(y0_3d);
    const pz = Number.parseFloat(z0_3d);
    return {
      x: Number.isFinite(px) ? px : 0,
      y: Number.isFinite(py) ? py : 0,
      z: Number.isFinite(pz) ? pz : 0,
    };
  }, [x0_3d, y0_3d, z0_3d]);

  // View bounds dynamically centered so user-typed P always stays framed
  const bounds2d = useMemo(() => {
    const cx = Math.abs(parsedP2.x) > radius2d * 0.72 ? parsedP2.x : 0;
    const cy = Math.abs(parsedP2.y) > radius2d * 0.72 ? parsedP2.y : 0;
    return {
      xMin: cx - radius2d,
      xMax: cx + radius2d,
      yMin: cy - radius2d,
      yMax: cy + radius2d,
      cx,
      cy,
    };
  }, [parsedP2, radius2d]);

  const bounds3d = useMemo(() => {
    const cx = Math.abs(parsedP3.x) > radius3d * 0.68 ? parsedP3.x : 0;
    const cy = Math.abs(parsedP3.y) > radius3d * 0.68 ? parsedP3.y : 0;
    const cz = Math.abs(parsedP3.z) > radius3d * 0.68 ? parsedP3.z : 0;
    return {
      xMin: cx - radius3d,
      xMax: cx + radius3d,
      yMin: cy - radius3d,
      yMax: cy + radius3d,
      zMin: cz - radius3d,
      zMax: cz + radius3d,
      cx,
      cy,
      cz,
    };
  }, [parsedP3, radius3d]);

  // 2D Gradient Statistics
  const gradStats2d = useMemo(() => {
    const evalF = (x: number, y: number) => compiled2d.evaluate({ x, y });
    const { f0, fx, fy, gradMagnitude } = computePartialDerivatives2D(
      evalF,
      parsedP2.x,
      parsedP2.y,
      1e-4
    );
    const ux = gradMagnitude > 1e-8 ? fx / gradMagnitude : 0;
    const uy = gradMagnitude > 1e-8 ? fy / gradMagnitude : 0;
    const angleDeg = ((Math.atan2(fy, fx) * 180) / Math.PI + 360) % 360;
    return { f0, fx, fy, gradMagnitude, ux, uy, angleDeg };
  }, [compiled2d, parsedP2]);

  // 3D Gradient Statistics
  const gradStats3d = useMemo(() => {
    const evalPhi = (x: number, y: number, z: number) =>
      compiled3d.evaluate({ x, y, z });
    const { f0, fx, fy, fz, gradMagnitude } = computePartialDerivatives3D(
      evalPhi,
      parsedP3.x,
      parsedP3.y,
      parsedP3.z,
      1e-4
    );
    const ux = gradMagnitude > 1e-8 ? fx / gradMagnitude : 0;
    const uy = gradMagnitude > 1e-8 ? fy / gradMagnitude : 0;
    const uz = gradMagnitude > 1e-8 ? fz / gradMagnitude : 0;
    return { f0, fx, fy, fz, gradMagnitude, ux, uy, uz };
  }, [compiled3d, parsedP3]);

  // 2D Contours & Gradient Vector Lattice
  const diagram2d = useMemo(() => {
    if (dimMode !== "2d") {
      // Slice contour phi(x, y, z0) = const
      const evalSlice = (x: number, y: number) =>
        compiled3d.evaluate({ x, y, z: parsedP3.z });

      const activeSegs = Number.isFinite(gradStats3d.f0)
        ? extractLevelCurveSegments(
            evalSlice,
            bounds3d.xMin,
            bounds3d.xMax,
            bounds3d.yMin,
            bounds3d.yMax,
            gradStats3d.f0,
            40,
            40
          )
        : [];

      const spanVal = Math.max(1.5, Math.abs(gradStats3d.f0) * 0.8 + 1.5);
      const offsets = [-0.8, -0.4, 0.4, 0.8].map(
        (k) => (Number.isFinite(gradStats3d.f0) ? gradStats3d.f0 : 0) + k * spanVal * 0.45
      );
      const bgSegs = offsets.map((lv) =>
        extractLevelCurveSegments(
          evalSlice,
          bounds3d.xMin,
          bounds3d.xMax,
          bounds3d.yMin,
          bounds3d.yMax,
          lv,
          28,
          28
        )
      );

      return { activeSegs, bgSegs, lattice: [] as { x: number; y: number; dx: number; dy: number }[] };
    }

    const evalF = (x: number, y: number) => compiled2d.evaluate({ x, y });
    const activeSegs = Number.isFinite(gradStats2d.f0)
      ? extractLevelCurveSegments(
          evalF,
          bounds2d.xMin,
          bounds2d.xMax,
          bounds2d.yMin,
          bounds2d.yMax,
          gradStats2d.f0,
          42,
          42
        )
      : [];

    // Dynamic range sampling for background contours
    let fMin = Infinity;
    let fMax = -Infinity;
    for (let i = 0; i <= 10; i++) {
      const gx = bounds2d.xMin + (i / 10) * (bounds2d.xMax - bounds2d.xMin);
      for (let j = 0; j <= 10; j++) {
        const gy = bounds2d.yMin + (j / 10) * (bounds2d.yMax - bounds2d.yMin);
        const v = evalF(gx, gy);
        if (Number.isFinite(v)) {
          if (v < fMin) fMin = v;
          if (v > fMax) fMax = v;
        }
      }
    }
    const bgLevels: number[] = [];
    if (Number.isFinite(fMin) && Number.isFinite(fMax) && fMax > fMin + 1e-4) {
      for (let k = 1; k <= 6; k++) {
        bgLevels.push(fMin + (k / 7) * (fMax - fMin));
      }
    }
    const bgSegs = bgLevels.map((lv) =>
      extractLevelCurveSegments(
        evalF,
        bounds2d.xMin,
        bounds2d.xMax,
        bounds2d.yMin,
        bounds2d.yMax,
        lv,
        28,
        28
      )
    );

    const lattice: { x: number; y: number; dx: number; dy: number }[] = [];
    const steps = 6;
    const stepSize = (bounds2d.xMax - bounds2d.xMin) / steps;
    for (let i = 1; i < steps; i++) {
      const gx = bounds2d.xMin + i * stepSize;
      for (let j = 1; j < steps; j++) {
        const gy = bounds2d.yMin + j * stepSize;
        const { fx, fy, gradMagnitude } = computePartialDerivatives2D(evalF, gx, gy, 1e-4);
        if (Number.isFinite(gradMagnitude) && gradMagnitude > 1e-5) {
          const arrowLen = Math.min(stepSize * 0.55, Math.max(stepSize * 0.18, gradMagnitude * 0.18));
          lattice.push({
            x: gx,
            y: gy,
            dx: (fx / gradMagnitude) * arrowLen,
            dy: (fy / gradMagnitude) * arrowLen,
          });
        }
      }
    }

    return { activeSegs, bgSegs, lattice };
  }, [dimMode, compiled2d, compiled3d, bounds2d, bounds3d, parsedP3.z, gradStats2d.f0, gradStats3d.f0]);

  const activePreset2d = useMemo(
    () => PRESETS_2D.find((p) => p.id === preset2dId) ?? PRESETS_2D[0],
    [preset2dId]
  );
  const activePreset3d = useMemo(
    () => PRESETS_3D.find((p) => p.id === preset3dId) ?? PRESETS_3D[0],
    [preset3dId]
  );

  const selectPreset2d = (p: GradientPreset2D) => {
    setPreset2dId(p.id);
    setExpr2d(p.expr);
    setX0_2d(String(p.x0));
    setY0_2d(String(p.y0));
    setRadius2d(p.radius);
    setIsCustom2d(false);
  };

  const selectPreset3d = (p: GradientPreset3D) => {
    setPreset3dId(p.id);
    setExpr3d(p.expr);
    setX0_3d(String(p.x0));
    setY0_3d(String(p.y0));
    setZ0_3d(String(p.z0));
    setRadius3d(p.radius);
    setIsCustom3d(false);
  };

  return (
    <section
      aria-label="Gradient Operator Calculator and 2D/3D Visualizer"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header & Dimension Mode Toggle */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[var(--bg-canvas)]">
              LAB 3.3.1 • GRADIENT CALCULATOR &amp; NORMAL VISUALIZER
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              {dimMode === "2d"
                ? isCustom2d
                  ? "Custom 2D Scalar Field"
                  : activePreset2d.label
                : isCustom3d
                ? "Custom 3D Scalar Field"
                : activePreset3d.label}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Compute &amp; Visualize <KaTeXMath math="\nabla \phi(P)" /> for Any 2D or 3D Scalar Field
          </h2>
        </div>

        {/* 2D vs 3D Toggle */}
        <div className="flex border border-[var(--border-strong)] bg-[var(--bg-canvas)]">
          <button
            type="button"
            onClick={() => setDimMode("2d")}
            className={`px-3 py-1.5 text-xs font-tabular-mono transition-colors ${
              dimMode === "2d"
                ? "bg-[#9E360E] text-[#FFFBE4] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            2D Field f(x, y)
          </button>
          <button
            type="button"
            onClick={() => setDimMode("3d")}
            className={`px-3 py-1.5 text-xs font-tabular-mono border-l border-[var(--border-subtle)] transition-colors ${
              dimMode === "3d"
                ? "bg-[#016869] text-[#FFFBE4] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            3D Field φ(x, y, z)
          </button>
        </div>
      </div>

      {/* Presets, Custom Function Input & Point Coordinates */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {dimMode === "2d"
              ? PRESETS_2D.map((p) => {
                  const active = !isCustom2d && p.id === preset2dId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPreset2d(p)}
                      className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                        active
                          ? "border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-[var(--text-primary)] font-semibold"
                          : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })
              : PRESETS_3D.map((p) => {
                  const active = !isCustom3d && p.id === preset3dId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPreset3d(p)}
                      className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                        active
                          ? "border-[var(--math-ink-z)] bg-[#029091]/15 text-[var(--text-primary)] font-semibold"
                          : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
          </div>

          <button
            type="button"
            onClick={() =>
              dimMode === "2d"
                ? selectPreset2d(activePreset2d)
                : selectPreset3d(activePreset3d)
            }
            className="px-2.5 py-1 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>Reset Preset</span>
          </button>
        </div>

        {/* Function Input */}
        {dimMode === "2d" ? (
          <MathExpressionInput
            label="Scalar Function f(x, y):"
            prefixLatex="f(x,y) ="
            value={expr2d}
            onChange={(val) => {
              setExpr2d(val);
              setIsCustom2d(true);
            }}
            allowedVars={["x", "y"]}
          />
        ) : (
          <MathExpressionInput
            label="3D Scalar Point Function φ(x, y, z):"
            prefixLatex="\phi(x,y,z) ="
            value={expr3d}
            onChange={(val) => {
              setExpr3d(val);
              setIsCustom3d(true);
            }}
            allowedVars={["x", "y", "z"]}
          />
        )}

        {/* Evaluation Point Input Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <label className="block space-y-1">
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
              Point <KaTeXMath math="x_0" />
            </span>
            <input
              type="number"
              step="0.1"
              value={dimMode === "2d" ? x0_2d : x0_3d}
              onChange={(e) =>
                dimMode === "2d"
                  ? setX0_2d(e.target.value)
                  : setX0_3d(e.target.value)
              }
              className="w-full px-2.5 py-1.5 text-sm font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--math-ink-x)]"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
              Point <KaTeXMath math="y_0" />
            </span>
            <input
              type="number"
              step="0.1"
              value={dimMode === "2d" ? y0_2d : y0_3d}
              onChange={(e) =>
                dimMode === "2d"
                  ? setY0_2d(e.target.value)
                  : setY0_3d(e.target.value)
              }
              className="w-full px-2.5 py-1.5 text-sm font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--math-ink-y)]"
            />
          </label>

          {dimMode === "3d" && (
            <label className="block space-y-1">
              <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
                Point <KaTeXMath math="z_0" />
              </span>
              <input
                type="number"
                step="0.1"
                value={z0_3d}
                onChange={(e) => setZ0_3d(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--math-ink-z)]"
              />
            </label>
          )}

          <label className="block space-y-1">
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-grid)] block">
              View Radius (±R)
            </span>
            <select
              value={dimMode === "2d" ? radius2d : radius3d}
              onChange={(e) =>
                dimMode === "2d"
                  ? setRadius2d(Number(e.target.value))
                  : setRadius3d(Number(e.target.value))
              }
              className="w-full px-2.5 py-1.5 text-sm font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--math-ink-grid)]"
            >
              <option value={1.6}>±1.6</option>
              <option value={2.2}>±2.2</option>
              <option value={2.4}>±2.4</option>
              <option value={3.2}>±3.2</option>
              <option value={4.5}>±4.5</option>
            </select>
          </label>
        </div>
      </div>

      {/* Main Split View: 3D Stage + 2D Contour Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: 3D Viewport */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <ThreeOrbitViewport
            heightClassName="h-[390px] sm:h-[430px]"
            cameraPosition={
              dimMode === "2d"
                ? [bounds2d.cx + 3.4, 2.7, bounds2d.cy + 3.4]
                : [bounds3d.cx + 3.8, bounds3d.cz + 2.8, bounds3d.cy + 3.8]
            }
            cameraTarget={
              dimMode === "2d"
                ? [bounds2d.cx, 0.3, bounds2d.cy]
                : [bounds3d.cx, bounds3d.cz, bounds3d.cy]
            }
            titleBadge={
              dimMode === "2d"
                ? "3D Surface z = f(x, y), Tangent Plane & ∇f(P)"
                : "3D Level Surface φ(x, y, z) = c, Tangent Plane & Normal ∇φ(P)"
            }
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                {dimMode === "2d" ? (
                  <>
                    <span className="text-[var(--math-ink-diff)]">
                      f(P) = {fmtSigned(gradStats2d.f0)}
                    </span>
                    <span className="text-[var(--math-ink-sweep)] font-semibold">
                      ∇f(P) = ⟨{fmtSigned(gradStats2d.fx)}, {fmtSigned(gradStats2d.fy)}⟩
                    </span>
                    <span className="text-[var(--math-ink-y)]">
                      ‖∇f‖ = {fmtSigned(gradStats2d.gradMagnitude)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[var(--math-ink-diff)]">
                      φ(P) = {fmtSigned(gradStats3d.f0)}
                    </span>
                    <span className="text-[var(--math-ink-sweep)] font-semibold">
                      ∇φ(P) = ⟨{fmtSigned(gradStats3d.fx)}, {fmtSigned(gradStats3d.fy)},{" "}
                      {fmtSigned(gradStats3d.fz)}⟩
                    </span>
                    <span className="text-[var(--math-ink-y)]">
                      ‖∇φ‖ = {fmtSigned(gradStats3d.gradMagnitude)}
                    </span>
                  </>
                )}
              </div>
            }
            sceneDeps={[
              dimMode,
              compiled2d,
              compiled3d,
              bounds2d,
              bounds3d,
              parsedP2,
              parsedP3,
              gradStats2d,
              gradStats3d,
              diagram2d.activeSegs,
            ]}
            onBuildScene={(group) => {
              if (dimMode === "2d") {
                // 1. Surface mesh z = f(x, y)
                group.add(
                  createParametricSurfaceMesh(
                    (u, v) => {
                      const zv = compiled2d.evaluate({ x: u, y: v });
                      return [
                        u,
                        v,
                        Number.isFinite(zv) ? Math.max(-4.5, Math.min(4.5, zv)) : 0,
                      ];
                    },
                    [bounds2d.xMin, bounds2d.xMax],
                    [bounds2d.yMin, bounds2d.yMax],
                    36,
                    36,
                    {
                      color: 0x029091,
                      opacity: 0.56,
                      wireframeColor: 0x8d9fce,
                      wireframeOpacity: 0.16,
                      showWireframe: true,
                    }
                  )
                );

                // 2. Highlighted level contour f(x,y) = f0 both at z = 0 and z = f0
                if (Number.isFinite(gradStats2d.f0)) {
                  const z0 = Math.max(-4.5, Math.min(4.5, gradStats2d.f0));
                  const segPtsFloor: THREE.Vector3[] = [];
                  const segPtsSurf: THREE.Vector3[] = [];
                  for (const seg of diagram2d.activeSegs) {
                    segPtsFloor.push(
                      mathToThreeVec3(seg.x1, seg.y1, 0.015),
                      mathToThreeVec3(seg.x2, seg.y2, 0.015)
                    );
                    segPtsSurf.push(
                      mathToThreeVec3(seg.x1, seg.y1, z0 + 0.015),
                      mathToThreeVec3(seg.x2, seg.y2, z0 + 0.015)
                    );
                  }
                  if (segPtsFloor.length > 0) {
                    group.add(
                      new THREE.LineSegments(
                        new THREE.BufferGeometry().setFromPoints(segPtsFloor),
                        new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                      )
                    );
                    group.add(
                      new THREE.LineSegments(
                        new THREE.BufferGeometry().setFromPoints(segPtsSurf),
                        new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                      )
                    );
                  }

                  // 3. Point P marker on floor & surface + vertical stem
                  const ptSurf = new THREE.Mesh(
                    new THREE.SphereGeometry(0.065, 16, 16),
                    new THREE.MeshBasicMaterial({ color: 0xfbeaa4 })
                  );
                  ptSurf.position.copy(mathToThreeVec3(parsedP2.x, parsedP2.y, z0));
                  group.add(ptSurf);

                  const stemGeo = new THREE.BufferGeometry().setFromPoints([
                    mathToThreeVec3(parsedP2.x, parsedP2.y, 0),
                    mathToThreeVec3(parsedP2.x, parsedP2.y, z0),
                  ]);
                  group.add(
                    new THREE.Line(
                      stemGeo,
                      new THREE.LineBasicMaterial({
                        color: 0xaaa36d,
                        transparent: true,
                        opacity: 0.7,
                      })
                    )
                  );

                  // 4. Local Tangent Plane at (x0, y0, f0)
                  const span = 0.7;
                  const { fx, fy, gradMagnitude } = gradStats2d;
                  const tPlane = createParametricSurfaceMesh(
                    (du, dv) => [
                      parsedP2.x + du,
                      parsedP2.y + dv,
                      z0 + fx * du + fy * dv,
                    ],
                    [-span, span],
                    [-span, span],
                    4,
                    4,
                    {
                      color: 0xfbeaa4,
                      opacity: 0.24,
                      wireframeColor: 0xfbeaa4,
                      wireframeOpacity: 0.45,
                      showWireframe: true,
                    }
                  );
                  group.add(tPlane);

                  // 5. Gradient arrow ∇f in xy-plane (z=0.02) and surface steepest tangent
                  if (gradMagnitude > 1e-6) {
                    const visLen = Math.min(1.4, Math.max(0.45, gradMagnitude * 0.45));
                    const ux = fx / gradMagnitude;
                    const uy = fy / gradMagnitude;
                    group.add(
                      createVectorArrow3D(
                        [parsedP2.x, parsedP2.y, 0.02],
                        [ux * visLen, uy * visLen, 0],
                        0xd35323
                      )
                    );
                    // Surface ascent tangent vector <ux, uy, ||∇f||>
                    const ascentDir = mathToThreeVec3(ux, uy, gradMagnitude);
                    const ascentLen = Math.min(1.35, Math.max(0.5, ascentDir.length() * 0.45));
                    group.add(
                      createVectorArrow3D(
                        [parsedP2.x, parsedP2.y, z0],
                        [ux, uy, gradMagnitude],
                        ascentLen,
                        0xd35323
                      )
                    );
                  }
                }
              } else {
                // 3D Mode: Marching Tetrahedra Level Surface φ(x,y,z) = φ(P)
                if (Number.isFinite(gradStats3d.f0)) {
                  group.add(
                    createImplicitLevelSurfaceMesh(
                      (x, y, z) => compiled3d.evaluate({ x, y, z }),
                      gradStats3d.f0,
                      [bounds3d.xMin, bounds3d.xMax],
                      [bounds3d.yMin, bounds3d.yMax],
                      [bounds3d.zMin, bounds3d.zMax],
                      16,
                      {
                        color: 0x029091,
                        opacity: 0.5,
                        wireframeColor: 0x8d9fce,
                        wireframeOpacity: 0.14,
                        showWireframe: true,
                      }
                    )
                  );
                }

                // Point P marker sphere
                const pMesh = new THREE.Mesh(
                  new THREE.SphereGeometry(0.07, 16, 16),
                  new THREE.MeshBasicMaterial({ color: 0xfbeaa4 })
                );
                pMesh.position.copy(mathToThreeVec3(parsedP3.x, parsedP3.y, parsedP3.z));
                group.add(pMesh);

                // Local 3x3x3 ambient gradient arrows around P (dim Olive/Teal)
                const step3 = radius3d * 0.65;
                for (let ix = -1; ix <= 1; ix++) {
                  for (let iy = -1; iy <= 1; iy++) {
                    for (let iz = -1; iz <= 1; iz++) {
                      if (ix === 0 && iy === 0 && iz === 0) continue;
                      const px = parsedP3.x + ix * step3;
                      const py = parsedP3.y + iy * step3;
                      const pz = parsedP3.z + iz * step3;
                      const d = computePartialDerivatives3D(
                        (x, y, z) => compiled3d.evaluate({ x, y, z }),
                        px,
                        py,
                        pz,
                        1e-4
                      );
                      if (Number.isFinite(d.gradMagnitude) && d.gradMagnitude > 1e-5) {
                        const aLen = Math.min(0.45, Math.max(0.18, d.gradMagnitude * 0.12));
                        group.add(
                          createVectorArrow3D([px, py, pz], [d.fx, d.fy, d.fz], aLen, 0x8d9fce)
                        );
                      }
                    }
                  }
                }

                // Bold Persimmon ∇φ(P) outward normal vector + Tangent plane patch
                const { fx, fy, fz, gradMagnitude } = gradStats3d;
                if (Number.isFinite(gradMagnitude) && gradMagnitude > 1e-6) {
                  const visLen = Math.min(1.5, Math.max(0.55, gradMagnitude * 0.25));
                  group.add(
                    createVectorArrow3D(
                      [parsedP3.x, parsedP3.y, parsedP3.z],
                      [fx, fy, fz],
                      visLen,
                      0xd35323
                    )
                  );

                  const { t1, t2 } = buildPerpTangentBasis(fx, fy, fz);
                  const span = 0.78;
                  group.add(
                    createParametricSurfaceMesh(
                      (u, v) => [
                        parsedP3.x + u * t1[0] + v * t2[0],
                        parsedP3.y + u * t1[1] + v * t2[1],
                        parsedP3.z + u * t1[2] + v * t2[2],
                      ],
                      [-span, span],
                      [-span, span],
                      4,
                      4,
                      {
                        color: 0xfbeaa4,
                        opacity: 0.28,
                        wireframeColor: 0xfbeaa4,
                        wireframeOpacity: 0.5,
                        showWireframe: true,
                      }
                    )
                  );
                }
              }
            }}
          />

          {/* Worked Gradient Breakdown Box */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Step-by-Step Gradient Evaluation at P
              </span>
              <span className="text-[11px] font-tabular-mono text-[var(--text-muted)]">
                Central Finite-Difference Engine
              </span>
            </div>

            {dimMode === "2d" ? (
              <div className="space-y-2 text-xs overflow-x-auto">
                <KaTeXMath
                  math={`\\nabla f(${fmtSigned(parsedP2.x)}, ${fmtSigned(parsedP2.y)}) = \\left\\langle \\frac{\\partial f}{\\partial x},\\; \\frac{\\partial f}{\\partial y} \\right\\rangle = \\langle ${fmtSigned(
                    gradStats2d.fx
                  )},\\; ${fmtSigned(gradStats2d.fy)} \\rangle`}
                  block
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-tabular-mono pt-1">
                  <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">
                      Max Ascent Rate ‖∇f‖
                    </span>
                    <span className="text-[var(--math-ink-sweep)] font-semibold">
                      {fmtSigned(gradStats2d.gradMagnitude)}
                    </span>
                  </div>
                  <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">
                      Unit Normal n̂ = ∇f/‖∇f‖
                    </span>
                    <span className="text-[var(--math-ink-x)]">
                      ⟨{fmtSigned(gradStats2d.ux)}, {fmtSigned(gradStats2d.uy)}⟩
                    </span>
                  </div>
                  <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">
                      Tangent Plane z = L(x,y)
                    </span>
                    <span className="text-[var(--math-ink-diff)]">
                      {fmtSigned(gradStats2d.f0)} + ({fmtSigned(gradStats2d.fx)})Δx + (
                      {fmtSigned(gradStats2d.fy)})Δy
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs overflow-x-auto">
                <KaTeXMath
                  math={`\\nabla \\phi(${fmtSigned(parsedP3.x)}, ${fmtSigned(parsedP3.y)}, ${fmtSigned(
                    parsedP3.z
                  )}) = \\left\\langle \\phi_x, \\phi_y, \\phi_z \\right\\rangle = \\langle ${fmtSigned(
                    gradStats3d.fx
                  )},\\; ${fmtSigned(gradStats3d.fy)},\\; ${fmtSigned(gradStats3d.fz)} \\rangle`}
                  block
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-tabular-mono pt-1">
                  <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">
                      Normal Magnitude ‖∇φ‖
                    </span>
                    <span className="text-[var(--math-ink-sweep)] font-semibold">
                      {fmtSigned(gradStats3d.gradMagnitude)}
                    </span>
                  </div>
                  <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">
                      Unit Surface Normal n̂
                    </span>
                    <span className="text-[var(--math-ink-x)]">
                      ⟨{fmtSigned(gradStats3d.ux)}, {fmtSigned(gradStats3d.uy)},{" "}
                      {fmtSigned(gradStats3d.uz)}⟩
                    </span>
                  </div>
                  <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">
                      Level Surface Constant
                    </span>
                    <span className="text-[var(--math-ink-diff)]">
                      φ(P) = {fmtSigned(gradStats3d.f0)}
                    </span>
                  </div>
                </div>
                <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] font-tabular-mono text-[11px] text-[var(--text-secondary)]">
                  Tangent Plane to φ = {fmtSigned(gradStats3d.f0)} at P:{" "}
                  <span className="text-[var(--math-ink-diff)]">
                    ({fmtSigned(gradStats3d.fx)})(x − {fmtSigned(parsedP3.x)}) + (
                    {fmtSigned(gradStats3d.fy)})(y − {fmtSigned(parsedP3.y)}) + (
                    {fmtSigned(gradStats3d.fz)})(z − {fmtSigned(parsedP3.z)}) = 0
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Synchronized 2D Contour Plot + Readouts */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[var(--math-ink-sweep)]" aria-hidden="true" />
                {dimMode === "2d"
                  ? "2D Level Contours & Gradient Vector Field"
                  : `Horizontal Cross-Section Contour z = ${fmtSigned(parsedP3.z)}`}
              </span>
              <span className="text-[11px] font-tabular-mono text-[var(--text-muted)]">
                Click plane to move P(x₀, y₀)
              </span>
            </div>

            <SvgCoordinatePlane2D
              xRange={
                dimMode === "2d"
                  ? [bounds2d.xMin, bounds2d.xMax]
                  : [bounds3d.xMin, bounds3d.xMax]
              }
              yRange={
                dimMode === "2d"
                  ? [bounds2d.yMin, bounds2d.yMax]
                  : [bounds3d.yMin, bounds3d.yMax]
              }
              height={290}
              ariaLabel="2D contour plot and orthogonal gradient vector"
              onSelectPoint={(wx, wy) => {
                if (dimMode === "2d") {
                  setX0_2d(wx.toFixed(2));
                  setY0_2d(wy.toFixed(2));
                } else {
                  setX0_3d(wx.toFixed(2));
                  setY0_3d(wy.toFixed(2));
                }
              }}
            >
              {({ toSvgX, toSvgY }) => {
                const px = dimMode === "2d" ? parsedP2.x : parsedP3.x;
                const py = dimMode === "2d" ? parsedP2.y : parsedP3.y;
                const fx = dimMode === "2d" ? gradStats2d.fx : gradStats3d.fx;
                const fy = dimMode === "2d" ? gradStats2d.fy : gradStats3d.fy;
                const planarMag = Math.hypot(fx, fy);
                const radius = dimMode === "2d" ? radius2d : radius3d;
                const gScale =
                  planarMag > 1e-6
                    ? Math.min(radius * 0.55, Math.max(radius * 0.2, planarMag * 0.25)) /
                      planarMag
                    : 0;
                const gxEnd = px + fx * gScale;
                const gyEnd = py + fy * gScale;

                // Orthogonal tangent direction to contour (-fy, fx)
                const tx = planarMag > 1e-6 ? -fy / planarMag : 1;
                const ty = planarMag > 1e-6 ? fx / planarMag : 0;
                const tSpan = radius * 0.35;

                // Right-angle marker box
                const ux = planarMag > 1e-6 ? fx / planarMag : 0;
                const uy = planarMag > 1e-6 ? fy / planarMag : 1;
                const boxLen = radius * 0.08;

                return (
                  <g>
                    {/* Background contours */}
                    {diagram2d.bgSegs.map((segs, idx) => (
                      <g key={idx}>
                        {segs.map((s, k) => (
                          <line
                            key={k}
                            x1={toSvgX(s.x1)}
                            y1={toSvgY(s.y1)}
                            x2={toSvgX(s.x2)}
                            y2={toSvgY(s.y2)}
                            stroke="#029091"
                            strokeOpacity={0.38}
                            strokeWidth={1}
                          />
                        ))}
                      </g>
                    ))}

                    {/* Gradient vector field lattice (2D mode) */}
                    {diagram2d.lattice.map((pt, idx) => (
                      <line
                        key={`lat-${idx}`}
                        x1={toSvgX(pt.x)}
                        y1={toSvgY(pt.y)}
                        x2={toSvgX(pt.x + pt.dx)}
                        y2={toSvgY(pt.y + pt.dy)}
                        stroke="#8D9FCE"
                        strokeOpacity={0.5}
                        strokeWidth={1.2}
                      />
                    ))}

                    {/* Active contour through P */}
                    {diagram2d.activeSegs.map((s, k) => (
                      <line
                        key={`act-${k}`}
                        x1={toSvgX(s.x1)}
                        y1={toSvgY(s.y1)}
                        x2={toSvgX(s.x2)}
                        y2={toSvgY(s.y2)}
                        stroke="#FBEAA4"
                        strokeWidth={2.2}
                      />
                    ))}

                    {/* Contour tangent line at P */}
                    {planarMag > 1e-6 && (
                      <>
                        <line
                          x1={toSvgX(px - tx * tSpan)}
                          y1={toSvgY(py - ty * tSpan)}
                          x2={toSvgX(px + tx * tSpan)}
                          y2={toSvgY(py + ty * tSpan)}
                          stroke="#AAA36D"
                          strokeWidth={1.3}
                          strokeDasharray="4 3"
                        />
                        {/* 90-degree perpendicularity glyph between contour tangent & ∇f */}
                        <polyline
                          points={`${toSvgX(px + tx * boxLen)},${toSvgY(
                            py + ty * boxLen
                          )} ${toSvgX(px + (tx + ux) * boxLen)},${toSvgY(
                            py + (ty + uy) * boxLen
                          )} ${toSvgX(px + ux * boxLen)},${toSvgY(py + uy * boxLen)}`}
                          fill="none"
                          stroke="#FBEAA4"
                          strokeWidth={1.2}
                        />
                      </>
                    )}

                    {/* Projected Gradient Arrow ∇f(P) */}
                    {planarMag > 1e-6 && (
                      <g>
                        <line
                          x1={toSvgX(px)}
                          y1={toSvgY(py)}
                          x2={toSvgX(gxEnd)}
                          y2={toSvgY(gyEnd)}
                          stroke="#D35323"
                          strokeWidth={3}
                        />
                        <circle
                          cx={toSvgX(gxEnd)}
                          cy={toSvgY(gyEnd)}
                          r={4}
                          fill="#D35323"
                        />
                        <text
                          x={toSvgX(gxEnd) + 6}
                          y={toSvgY(gyEnd) - 6}
                          fill="var(--math-ink-sweep)"
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="700"
                        >
                          ∇f
                        </text>
                      </g>
                    )}

                    {/* Evaluation point P */}
                    <circle
                      cx={toSvgX(px)}
                      cy={toSvgY(py)}
                      r={5}
                      fill="#FBEAA4"
                      stroke="#1E1F22"
                      strokeWidth={1.5}
                    />
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>

            {/* Component Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                <span className="text-[10px] font-tabular-mono text-[var(--math-ink-x)] block">
                  ∂/∂x at P
                </span>
                <span className="text-sm font-tabular-mono font-semibold text-[var(--text-primary)]">
                  {dimMode === "2d" ? fmtSigned(gradStats2d.fx) : fmtSigned(gradStats3d.fx)}
                </span>
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                <span className="text-[10px] font-tabular-mono text-[var(--math-ink-y)] block">
                  ∂/∂y at P
                </span>
                <span className="text-sm font-tabular-mono font-semibold text-[var(--text-primary)]">
                  {dimMode === "2d" ? fmtSigned(gradStats2d.fy) : fmtSigned(gradStats3d.fy)}
                </span>
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                <span className="text-[10px] font-tabular-mono text-[var(--math-ink-z)] block">
                  {dimMode === "2d" ? "Compass Angle" : "∂φ/∂z at P"}
                </span>
                <span className="text-sm font-tabular-mono font-semibold text-[var(--text-primary)]">
                  {dimMode === "2d"
                    ? `${gradStats2d.angleDeg.toFixed(1)}°`
                    : fmtSigned(gradStats3d.fz)}
                </span>
              </div>
            </div>
          </div>

          {/* Preset Analytical Formula & Pedagogical Note */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-tabular-mono text-[var(--math-ink-z)] uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Geometric Interpretation</span>
            </div>
            {dimMode === "2d" && !isCustom2d && (
              <div className="overflow-x-auto text-xs">
                <KaTeXMath math={activePreset2d.formulaLatex} />
              </div>
            )}
            {dimMode === "3d" && !isCustom3d && (
              <div className="overflow-x-auto text-xs">
                <KaTeXMath math={activePreset3d.formulaLatex} />
              </div>
            )}
            <p className="font-math-serif text-xs text-[var(--text-secondary)] leading-relaxed">
              {dimMode === "2d" ? activePreset2d.note : activePreset3d.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
