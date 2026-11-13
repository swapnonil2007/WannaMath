"use client";

import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { ArrowUpRight, ArrowDownRight, Minus, Compass, Crosshair } from "lucide-react";
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

type DimMode = "2d" | "3d";
type Plot2DTab = "contours" | "slice";

interface DirPreset2D {
  id: string;
  label: string;
  expr: string;
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  radius: number;
  note: string;
}

interface DirPreset3D {
  id: string;
  label: string;
  expr: string;
  x0: number;
  y0: number;
  z0: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  note: string;
}

const DIR_PRESETS_2D: DirPreset2D[] = [
  {
    id: "parabolic-hill",
    label: "Elliptic Hill",
    expr: "1.8 - 0.3 * x^2 - 0.65 * y^2",
    x0: 0.9,
    y0: 0.6,
    vx: 2,
    vy: 1,
    radius: 2.2,
    note: "Input v = ⟨2, 1⟩ is automatically normalized to û = ⟨2/√5, 1/√5⟩ before taking the dot product ∇f · û.",
  },
  {
    id: "mixed-poly",
    label: "Cubic x²y - y³",
    expr: "0.25 * (x^2 * y - y^3)",
    x0: 1.2,
    y0: -0.6,
    vx: 3,
    vy: 4,
    radius: 2.4,
    note: "Classic polynomial directional derivative: notice the monkey-saddle symmetry in three angular sectors.",
  },
  {
    id: "saddle-compass",
    label: "Saddle x² - y²",
    expr: "0.5 * (x^2 - y^2)",
    x0: 0.8,
    y0: 0.5,
    vx: 1,
    vy: -1,
    radius: 2.2,
    note: "Try setting v perpendicular to ∇f (click Orthogonal) to see the slicing curve flatten horizontally at slope D_u f = 0.",
  },
  {
    id: "thermal-gaussian",
    label: "Gaussian Wave",
    expr: "1.6 * exp(-0.4 * (x^2 + y^2)) * cos(x)",
    x0: 0.5,
    y0: 0.7,
    vx: -2,
    vy: 1,
    radius: 2.4,
    note: "Models spatial temperature rate of change along a drone's flight heading vector v.",
  },
];

const DIR_PRESETS_3D: DirPreset3D[] = [
  {
    id: "cubic-classic",
    label: "Cubic x²yz + 4xz²",
    expr: "x^2 * y * z + 4 * x * z^2",
    x0: 1,
    y0: -2,
    z0: -1,
    vx: 2,
    vy: -1,
    vz: -2,
    radius: 2.6,
    note: "Textbook classic: at P(1, -2, -1) along v = ⟨2, -1, -2⟩ (‖v‖ = 3), ∂φ/∂x = 8, ∂φ/∂y = -1, ∂φ/∂z = -10, giving D_û φ = 37/3 ≈ 12.333.",
  },
  {
    id: "ellipsoid-3d",
    label: "3D Ellipsoid",
    expr: "x^2 + 2 * y^2 + 0.5 * z^2",
    x0: 1.0,
    y0: 0.5,
    z0: 1.0,
    vx: 1,
    vy: 1,
    vz: -1,
    radius: 2.4,
    note: "Moving along û slices through nested ellipsoidal level surfaces; moving tangent to φ = φ(P) gives D_û φ = 0.",
  },
  {
    id: "dipole-3d",
    label: "3D Potential x·e^(-0.3r²)",
    expr: "2 * x * exp(-0.3 * (x^2 + y^2 + z^2))",
    x0: 0.6,
    y0: 0.8,
    z0: -0.4,
    vx: 1,
    vy: -2,
    vz: 1,
    radius: 2.4,
    note: "Rates of change of a 3D potential field along an arbitrary trajectory vector v = ⟨v_x, v_y, v_z⟩.",
  },
];

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "NaN";
  return Math.abs(n) < 1e-4 ? "0.000" : n.toFixed(3);
}

export function DirectionalDerivativeCalculatorLab() {
  const [dimMode, setDimMode] = useState<DimMode>("2d");
  const [plot2dTab, setPlot2dTab] = useState<Plot2DTab>("contours");

  // 2D state
  const [preset2dId, setPreset2dId] = useState<string>(DIR_PRESETS_2D[0].id);
  const [expr2d, setExpr2d] = useState<string>(DIR_PRESETS_2D[0].expr);
  const [isCustom2d, setIsCustom2d] = useState<boolean>(false);
  const [x0_2d, setX0_2d] = useState<string>(String(DIR_PRESETS_2D[0].x0));
  const [y0_2d, setY0_2d] = useState<string>(String(DIR_PRESETS_2D[0].y0));
  const [vx_2d, setVx_2d] = useState<string>(String(DIR_PRESETS_2D[0].vx));
  const [vy_2d, setVy_2d] = useState<string>(String(DIR_PRESETS_2D[0].vy));
  const [radius2d, setRadius2d] = useState<number>(DIR_PRESETS_2D[0].radius);

  // 3D state
  const [preset3dId, setPreset3dId] = useState<string>(DIR_PRESETS_3D[0].id);
  const [expr3d, setExpr3d] = useState<string>(DIR_PRESETS_3D[0].expr);
  const [isCustom3d, setIsCustom3d] = useState<boolean>(false);
  const [x0_3d, setX0_3d] = useState<string>(String(DIR_PRESETS_3D[0].x0));
  const [y0_3d, setY0_3d] = useState<string>(String(DIR_PRESETS_3D[0].y0));
  const [z0_3d, setZ0_3d] = useState<string>(String(DIR_PRESETS_3D[0].z0));
  const [vx_3d, setVx_3d] = useState<string>(String(DIR_PRESETS_3D[0].vx));
  const [vy_3d, setVy_3d] = useState<string>(String(DIR_PRESETS_3D[0].vy));
  const [vz_3d, setVz_3d] = useState<string>(String(DIR_PRESETS_3D[0].vz));
  const [radius3d, setRadius3d] = useState<number>(DIR_PRESETS_3D[0].radius);

  const compiled2d = useMemo(() => compileMathExpression(expr2d, ["x", "y"]), [expr2d]);
  const compiled3d = useMemo(() => compileMathExpression(expr3d, ["x", "y", "z"]), [expr3d]);

  const parsed2d = useMemo(() => {
    const px = Number.parseFloat(x0_2d);
    const py = Number.parseFloat(y0_2d);
    const vx = Number.parseFloat(vx_2d);
    const vy = Number.parseFloat(vy_2d);
    return {
      x: Number.isFinite(px) ? px : 0,
      y: Number.isFinite(py) ? py : 0,
      vx: Number.isFinite(vx) ? vx : 0,
      vy: Number.isFinite(vy) ? vy : 0,
    };
  }, [x0_2d, y0_2d, vx_2d, vy_2d]);

  const parsed3d = useMemo(() => {
    const px = Number.parseFloat(x0_3d);
    const py = Number.parseFloat(y0_3d);
    const pz = Number.parseFloat(z0_3d);
    const vx = Number.parseFloat(vx_3d);
    const vy = Number.parseFloat(vy_3d);
    const vz = Number.parseFloat(vz_3d);
    return {
      x: Number.isFinite(px) ? px : 0,
      y: Number.isFinite(py) ? py : 0,
      z: Number.isFinite(pz) ? pz : 0,
      vx: Number.isFinite(vx) ? vx : 0,
      vy: Number.isFinite(vy) ? vy : 0,
      vz: Number.isFinite(vz) ? vz : 0,
    };
  }, [x0_3d, y0_3d, z0_3d, vx_3d, vy_3d, vz_3d]);

  const bounds2d = useMemo(() => {
    const cx = Math.abs(parsed2d.x) > radius2d * 0.7 ? parsed2d.x : 0;
    const cy = Math.abs(parsed2d.y) > radius2d * 0.7 ? parsed2d.y : 0;
    return {
      xMin: cx - radius2d,
      xMax: cx + radius2d,
      yMin: cy - radius2d,
      yMax: cy + radius2d,
      cx,
      cy,
    };
  }, [parsed2d.x, parsed2d.y, radius2d]);

  const bounds3d = useMemo(() => {
    const cx = Math.abs(parsed3d.x) > radius3d * 0.65 ? parsed3d.x : 0;
    const cy = Math.abs(parsed3d.y) > radius3d * 0.65 ? parsed3d.y : 0;
    const cz = Math.abs(parsed3d.z) > radius3d * 0.65 ? parsed3d.z : 0;
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
  }, [parsed3d.x, parsed3d.y, parsed3d.z, radius3d]);

  const stats2d = useMemo(() => {
    const evalF = (x: number, y: number) => compiled2d.evaluate({ x, y });
    const { f0, fx, fy, gradMagnitude } = computePartialDerivatives2D(
      evalF,
      parsed2d.x,
      parsed2d.y,
      1e-4
    );
    const vNorm = Math.hypot(parsed2d.vx, parsed2d.vy);
    const isZeroDir = vNorm < 1e-8;
    const ux = isZeroDir ? 1 : parsed2d.vx / vNorm;
    const uy = isZeroDir ? 0 : parsed2d.vy / vNorm;
    const duf = fx * ux + fy * uy;
    const alphaDeg = ((Math.atan2(uy, ux) * 180) / Math.PI + 360) % 360;
    const cosTheta =
      gradMagnitude > 1e-8 ? Math.max(-1, Math.min(1, duf / gradMagnitude)) : 0;
    const thetaDeg = (Math.acos(cosTheta) * 180) / Math.PI;
    return {
      f0,
      fx,
      fy,
      gradMagnitude,
      vNorm,
      isZeroDir,
      ux,
      uy,
      duf,
      alphaDeg,
      thetaDeg,
    };
  }, [compiled2d, parsed2d]);

  const stats3d = useMemo(() => {
    const evalPhi = (x: number, y: number, z: number) =>
      compiled3d.evaluate({ x, y, z });
    const { f0, fx, fy, fz, gradMagnitude } = computePartialDerivatives3D(
      evalPhi,
      parsed3d.x,
      parsed3d.y,
      parsed3d.z,
      1e-4
    );
    const vNorm = Math.hypot(parsed3d.vx, parsed3d.vy, parsed3d.vz);
    const isZeroDir = vNorm < 1e-8;
    const ux = isZeroDir ? 1 : parsed3d.vx / vNorm;
    const uy = isZeroDir ? 0 : parsed3d.vy / vNorm;
    const uz = isZeroDir ? 0 : parsed3d.vz / vNorm;
    const duf = fx * ux + fy * uy + fz * uz;
    const cosTheta =
      gradMagnitude > 1e-8 ? Math.max(-1, Math.min(1, duf / gradMagnitude)) : 0;
    const thetaDeg = (Math.acos(cosTheta) * 180) / Math.PI;
    return {
      f0,
      fx,
      fy,
      fz,
      gradMagnitude,
      vNorm,
      isZeroDir,
      ux,
      uy,
      uz,
      duf,
      thetaDeg,
    };
  }, [compiled3d, parsed3d]);

  // 2D contours & directional profile curve z(s)
  const contours2d = useMemo(() => {
    if (dimMode !== "2d") {
      return { activeSegs: [], bgSegs: [] };
    }
    const evalF = (x: number, y: number) => compiled2d.evaluate({ x, y });
    const activeSegs = Number.isFinite(stats2d.f0)
      ? extractLevelCurveSegments(
          evalF,
          bounds2d.xMin,
          bounds2d.xMax,
          bounds2d.yMin,
          bounds2d.yMax,
          stats2d.f0,
          40,
          40
        )
      : [];

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
    const levels: number[] = [];
    if (Number.isFinite(fMin) && Number.isFinite(fMax) && fMax > fMin + 1e-4) {
      for (let k = 1; k <= 5; k++) {
        levels.push(fMin + (k / 6) * (fMax - fMin));
      }
    }
    const bgSegs = levels.map((lv) =>
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
    return { activeSegs, bgSegs };
  }, [dimMode, compiled2d, bounds2d, stats2d.f0]);

  // 1D Slice Curve along ray r(s) = P + s * û
  const sliceProfile = useMemo(() => {
    const sMin = -1.5;
    const sMax = 1.5;
    const pts: { s: number; val: number }[] = [];
    let yMin = Infinity;
    let yMax = -Infinity;

    for (let i = 0; i <= 60; i++) {
      const s = sMin + (i / 60) * (sMax - sMin);
      const val =
        dimMode === "2d"
          ? compiled2d.evaluate({
              x: parsed2d.x + s * stats2d.ux,
              y: parsed2d.y + s * stats2d.uy,
            })
          : compiled3d.evaluate({
              x: parsed3d.x + s * stats3d.ux,
              y: parsed3d.y + s * stats3d.uy,
              z: parsed3d.z + s * stats3d.uz,
            });
      if (Number.isFinite(val)) {
        pts.push({ s, val });
        if (val < yMin) yMin = val;
        if (val > yMax) yMax = val;
      }
    }

    const f0 = dimMode === "2d" ? stats2d.f0 : stats3d.f0;
    const slope = dimMode === "2d" ? stats2d.duf : stats3d.duf;
    if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) {
      yMin = -2;
      yMax = 2;
    } else if (yMax - yMin < 0.8) {
      const mid = (yMin + yMax) / 2;
      yMin = mid - 0.8;
      yMax = mid + 0.8;
    } else {
      const pad = (yMax - yMin) * 0.15;
      yMin -= pad;
      yMax += pad;
    }

    return { pts, sMin, sMax, yMin, yMax, f0, slope };
  }, [dimMode, compiled2d, compiled3d, parsed2d, parsed3d, stats2d, stats3d]);

  const activePreset2d = useMemo(
    () => DIR_PRESETS_2D.find((p) => p.id === preset2dId) ?? DIR_PRESETS_2D[0],
    [preset2dId]
  );
  const activePreset3d = useMemo(
    () => DIR_PRESETS_3D.find((p) => p.id === preset3dId) ?? DIR_PRESETS_3D[0],
    [preset3dId]
  );

  const selectPreset2d = (p: DirPreset2D) => {
    setPreset2dId(p.id);
    setExpr2d(p.expr);
    setX0_2d(String(p.x0));
    setY0_2d(String(p.y0));
    setVx_2d(String(p.vx));
    setVy_2d(String(p.vy));
    setRadius2d(p.radius);
    setIsCustom2d(false);
  };

  const selectPreset3d = (p: DirPreset3D) => {
    setPreset3dId(p.id);
    setExpr3d(p.expr);
    setX0_3d(String(p.x0));
    setY0_3d(String(p.y0));
    setZ0_3d(String(p.z0));
    setVx_3d(String(p.vx));
    setVy_3d(String(p.vy));
    setVz_3d(String(p.vz));
    setRadius3d(p.radius);
    setIsCustom3d(false);
  };

  const setDirectionAlignGrad = (sign: 1 | -1) => {
    if (dimMode === "2d") {
      setVx_2d((sign * stats2d.fx).toFixed(3));
      setVy_2d((sign * stats2d.fy).toFixed(3));
    } else {
      setVx_3d((sign * stats3d.fx).toFixed(3));
      setVy_3d((sign * stats3d.fy).toFixed(3));
      setVz_3d((sign * stats3d.fz).toFixed(3));
    }
  };

  const setDirectionOrthogonal = () => {
    if (dimMode === "2d") {
      setVx_2d((-stats2d.fy).toFixed(3));
      setVy_2d(stats2d.fx.toFixed(3));
    } else {
      // Pick any vector orthogonal to (fx, fy, fz)
      const { fx, fy, fz } = stats3d;
      if (Math.hypot(fx, fy) > 1e-4) {
        setVx_3d((-fy).toFixed(3));
        setVy_3d(fx.toFixed(3));
        setVz_3d("0");
      } else {
        setVx_3d("0");
        setVy_3d((-fz).toFixed(3));
        setVz_3d(fy.toFixed(3));
      }
    }
  };

  const activeDuf = dimMode === "2d" ? stats2d.duf : stats3d.duf;
  const activeZeroDir = dimMode === "2d" ? stats2d.isZeroDir : stats3d.isZeroDir;

  return (
    <section
      aria-label="Directional Derivative Calculator and Geometric Slicer"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#8D9FCE] text-[#8D9FCE] bg-[var(--bg-canvas)]">
              LAB 3.3.2 • DIRECTIONAL DERIVATIVE CALCULATOR &amp; SLICER
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              {dimMode === "2d"
                ? isCustom2d
                  ? "Custom 2D Function"
                  : activePreset2d.label
                : isCustom3d
                ? "Custom 3D Function"
                : activePreset3d.label}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Calculate &amp; Visualize{" "}
            <KaTeXMath math="D_{\hat{\mathbf{u}}} f(P) = \nabla f(P) \cdot \hat{\mathbf{u}}" />{" "}
            Along Any Vector <KaTeXMath math="\mathbf{v}" />
          </h2>
        </div>

        {/* 2D vs 3D Toggle */}
        <div className="flex border border-[var(--border-strong)] bg-[var(--bg-canvas)]">
          <button
            type="button"
            onClick={() => setDimMode("2d")}
            className={`px-3 py-1.5 text-xs font-tabular-mono transition-colors ${
              dimMode === "2d"
                ? "bg-[#8D9FCE] text-[#1E1F22] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            2D Surface f(x, y)
          </button>
          <button
            type="button"
            onClick={() => setDimMode("3d")}
            className={`px-3 py-1.5 text-xs font-tabular-mono border-l border-[var(--border-subtle)] transition-colors ${
              dimMode === "3d"
                ? "bg-[#029091] text-[#1E1F22] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            3D Field φ(x, y, z)
          </button>
        </div>
      </div>

      {/* Inputs Area: Function, Point P, Direction Vector v */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {dimMode === "2d"
              ? DIR_PRESETS_2D.map((p) => {
                  const active = !isCustom2d && p.id === preset2dId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPreset2d(p)}
                      className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                        active
                          ? "border-[#8D9FCE] bg-[#8D9FCE]/15 text-[var(--text-primary)] font-semibold"
                          : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })
              : DIR_PRESETS_3D.map((p) => {
                  const active = !isCustom3d && p.id === preset3dId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPreset3d(p)}
                      className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                        active
                          ? "border-[#029091] bg-[#029091]/15 text-[var(--text-primary)] font-semibold"
                          : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setDirectionAlignGrad(1)}
              className="px-2 py-1 text-[11px] font-tabular-mono border border-[#D35323]/60 text-[#D35323] bg-[var(--bg-panel)] hover:bg-[#D35323]/10"
            >
              Max Ascent (+∇f)
            </button>
            <button
              type="button"
              onClick={() => setDirectionAlignGrad(-1)}
              className="px-2 py-1 text-[11px] font-tabular-mono border border-[#B95869]/60 text-[#B95869] bg-[var(--bg-panel)] hover:bg-[#B95869]/10"
            >
              Max Descent (−∇f)
            </button>
            <button
              type="button"
              onClick={setDirectionOrthogonal}
              className="px-2 py-1 text-[11px] font-tabular-mono border border-[#FBEAA4]/60 text-[#FBEAA4] bg-[var(--bg-panel)] hover:bg-[#FBEAA4]/10"
            >
              Orthogonal (D_u f = 0)
            </button>
          </div>
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

        {/* Evaluation Point P & Direction Vector v Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Point P box */}
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[#FBEAA4] block">
              Evaluation Point P{dimMode === "2d" ? "(x₀, y₀)" : "(x₀, y₀, z₀)"}
            </span>
            <div className={`grid gap-2 ${dimMode === "2d" ? "grid-cols-2" : "grid-cols-3"}`}>
              <label className="block space-y-1">
                <span className="text-[10px] font-tabular-mono text-[#8D9FCE] block">x₀</span>
                <input
                  type="number"
                  step="0.1"
                  value={dimMode === "2d" ? x0_2d : x0_3d}
                  onChange={(e) =>
                    dimMode === "2d" ? setX0_2d(e.target.value) : setX0_3d(e.target.value)
                  }
                  className="w-full px-2 py-1 text-sm font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] font-tabular-mono text-[#96B898] block">y₀</span>
                <input
                  type="number"
                  step="0.1"
                  value={dimMode === "2d" ? y0_2d : y0_3d}
                  onChange={(e) =>
                    dimMode === "2d" ? setY0_2d(e.target.value) : setY0_3d(e.target.value)
                  }
                  className="w-full px-2 py-1 text-sm font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </label>
              {dimMode === "3d" && (
                <label className="block space-y-1">
                  <span className="text-[10px] font-tabular-mono text-[#029091] block">z₀</span>
                  <input
                    type="number"
                    step="0.1"
                    value={z0_3d}
                    onChange={(e) => setZ0_3d(e.target.value)}
                    className="w-full px-2 py-1 text-sm font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Direction Vector v box */}
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[#8D9FCE]">
                Direction Vector v (auto-normalized to û)
              </span>
              {activeZeroDir && (
                <span className="text-[10px] font-tabular-mono text-[#B95869] font-semibold">
                  ‖v‖ = 0 (non-zero needed)
                </span>
              )}
            </div>
            <div className={`grid gap-2 ${dimMode === "2d" ? "grid-cols-2" : "grid-cols-3"}`}>
              <label className="block space-y-1">
                <span className="text-[10px] font-tabular-mono text-[#8D9FCE] block">v_x</span>
                <input
                  type="number"
                  step="0.2"
                  value={dimMode === "2d" ? vx_2d : vx_3d}
                  onChange={(e) =>
                    dimMode === "2d" ? setVx_2d(e.target.value) : setVx_3d(e.target.value)
                  }
                  className="w-full px-2 py-1 text-sm font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] font-tabular-mono text-[#96B898] block">v_y</span>
                <input
                  type="number"
                  step="0.2"
                  value={dimMode === "2d" ? vy_2d : vy_3d}
                  onChange={(e) =>
                    dimMode === "2d" ? setVy_2d(e.target.value) : setVy_3d(e.target.value)
                  }
                  className="w-full px-2 py-1 text-sm font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </label>
              {dimMode === "3d" && (
                <label className="block space-y-1">
                  <span className="text-[10px] font-tabular-mono text-[#029091] block">v_z</span>
                  <input
                    type="number"
                    step="0.2"
                    value={vz_3d}
                    onChange={(e) => setVz_3d(e.target.value)}
                    className="w-full px-2 py-1 text-sm font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </label>
              )}
            </div>

            {dimMode === "2d" && (
              <div className="pt-1 flex items-center gap-3">
                <span className="text-[10px] font-tabular-mono text-[var(--text-muted)] shrink-0">
                  Rotate α = {stats2d.alphaDeg.toFixed(0)}°
                </span>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={Math.round(stats2d.alphaDeg)}
                  onChange={(e) => {
                    const rad = (Number(e.target.value) * Math.PI) / 180;
                    setVx_2d(Math.cos(rad).toFixed(3));
                    setVy_2d(Math.sin(rad).toFixed(3));
                  }}
                  aria-label="Rotate unit direction vector angle"
                  className="w-full accent-[#8D9FCE]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Split View: 3D Stage + 2D Visualization / 1D Slice */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: 3D Slicing Plane / Level Surface Stage */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <ThreeOrbitViewport
            heightClassName="h-[390px] sm:h-[430px]"
            cameraPosition={
              dimMode === "2d"
                ? [bounds2d.cx + 3.3, 2.6, bounds2d.cy + 3.3]
                : [bounds3d.cx + 3.8, bounds3d.cz + 2.8, bounds3d.cy + 3.8]
            }
            cameraTarget={
              dimMode === "2d"
                ? [bounds2d.cx, 0.3, bounds2d.cy]
                : [bounds3d.cx, bounds3d.cz, bounds3d.cy]
            }
            titleBadge={
              dimMode === "2d"
                ? "3D Vertical Slicing Plane Along û & Tangent Slope Vector"
                : "3D Level Surface φ = c, Normal ∇φ(P) & Direction û"
            }
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[#D35323]">
                  ‖∇f‖ ={" "}
                  {dimMode === "2d" ? fmt(stats2d.gradMagnitude) : fmt(stats3d.gradMagnitude)}
                </span>
                <span className="text-[#8D9FCE]">
                  Angle θ = {dimMode === "2d" ? stats2d.thetaDeg.toFixed(1) : stats3d.thetaDeg.toFixed(1)}°
                </span>
                <span className="text-[#96B898] font-semibold">
                  D_û f = {fmt(activeDuf)}
                </span>
              </div>
            }
            sceneDeps={[
              dimMode,
              compiled2d,
              compiled3d,
              bounds2d,
              bounds3d,
              parsed2d,
              parsed3d,
              stats2d,
              stats3d,
            ]}
            onBuildScene={(group) => {
              if (dimMode === "2d") {
                // Surface
                group.add(
                  createParametricSurfaceMesh(
                    (u, v) => {
                      const z = compiled2d.evaluate({ x: u, y: v });
                      return [u, v, Number.isFinite(z) ? Math.max(-4.5, Math.min(4.5, z)) : 0];
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

                if (!Number.isFinite(stats2d.f0)) return;
                const z0 = Math.max(-4.5, Math.min(4.5, stats2d.f0));
                const { ux, uy, duf, fx, fy, gradMagnitude } = stats2d;

                // Vertical slicing plane along û
                const sMax = 1.45;
                const zLow = Math.min(-1.2, z0 - 1.5);
                const zHigh = Math.max(2.0, z0 + 1.5);
                const pA = mathToThreeVec3(parsed2d.x - sMax * ux, parsed2d.y - sMax * uy, zLow);
                const pB = mathToThreeVec3(parsed2d.x + sMax * ux, parsed2d.y + sMax * uy, zLow);
                const pC = mathToThreeVec3(parsed2d.x + sMax * ux, parsed2d.y + sMax * uy, zHigh);
                const pD = mathToThreeVec3(parsed2d.x - sMax * ux, parsed2d.y - sMax * uy, zHigh);
                const planeGeo = new THREE.BufferGeometry().setFromPoints([
                  pA, pB, pC, pA, pC, pD,
                ]);
                planeGeo.computeVertexNormals();
                group.add(
                  new THREE.Mesh(
                    planeGeo,
                    new THREE.MeshBasicMaterial({
                      color: 0x8d9fce,
                      transparent: true,
                      opacity: 0.18,
                      side: THREE.DoubleSide,
                      depthWrite: false,
                    })
                  )
                );

                // Slice intersection curve
                const pts: THREE.Vector3[] = [];
                for (let i = 0; i <= 60; i++) {
                  const s = -sMax + (i / 60) * 2 * sMax;
                  const px = parsed2d.x + s * ux;
                  const py = parsed2d.y + s * uy;
                  if (
                    px >= bounds2d.xMin &&
                    px <= bounds2d.xMax &&
                    py >= bounds2d.yMin &&
                    py <= bounds2d.yMax
                  ) {
                    const zv = compiled2d.evaluate({ x: px, y: py });
                    if (Number.isFinite(zv)) {
                      pts.push(mathToThreeVec3(px, py, Math.max(-4.5, Math.min(4.5, zv))));
                    }
                  }
                }
                if (pts.length > 1) {
                  group.add(
                    new THREE.Line(
                      new THREE.BufferGeometry().setFromPoints(pts),
                      new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                    )
                  );
                }

                // Point marker
                const pDot = new THREE.Mesh(
                  new THREE.SphereGeometry(0.065, 16, 16),
                  new THREE.MeshBasicMaterial({ color: 0xfbeaa4 })
                );
                pDot.position.copy(mathToThreeVec3(parsed2d.x, parsed2d.y, z0));
                group.add(pDot);

                // Tangent slope vector <ux, uy, D_u f> at P on surface
                const tVec = mathToThreeVec3(ux, uy, duf);
                const tLen = Math.min(1.2, Math.max(0.45, tVec.length() * 0.5));
                group.add(createVectorArrow3D([parsed2d.x, parsed2d.y, z0], [ux, uy, duf], tLen, 0x96b898));

                // Floor unit vector û & Gradient vector ∇f
                group.add(createVectorArrow3D([parsed2d.x, parsed2d.y, 0.02], [ux * 0.85, uy * 0.85, 0], 0x8d9fce));
                if (gradMagnitude > 1e-6) {
                  const gLen = Math.min(1.2, Math.max(0.4, gradMagnitude * 0.45));
                  group.add(createVectorArrow3D([parsed2d.x, parsed2d.y, 0.02], [fx, fy, 0], gLen, 0xd35323));
                }
              } else {
                // 3D Mode: Level Surface + Normal ∇φ + Direction û + Ray r(s)
                if (Number.isFinite(stats3d.f0)) {
                  group.add(
                    createImplicitLevelSurfaceMesh(
                      (x, y, z) => compiled3d.evaluate({ x, y, z }),
                      stats3d.f0,
                      [bounds3d.xMin, bounds3d.xMax],
                      [bounds3d.yMin, bounds3d.yMax],
                      [bounds3d.zMin, bounds3d.zMax],
                      16,
                      {
                        color: 0x029091,
                        opacity: 0.46,
                        wireframeColor: 0x8d9fce,
                        wireframeOpacity: 0.14,
                        showWireframe: true,
                      }
                    )
                  );
                }

                const pDot = new THREE.Mesh(
                  new THREE.SphereGeometry(0.075, 16, 16),
                  new THREE.MeshBasicMaterial({ color: 0xfbeaa4 })
                );
                pDot.position.copy(mathToThreeVec3(parsed3d.x, parsed3d.y, parsed3d.z));
                group.add(pDot);

                // Ray P + s * û
                const sRay = 1.5;
                const rayGeo = new THREE.BufferGeometry().setFromPoints([
                  mathToThreeVec3(
                    parsed3d.x - sRay * stats3d.ux,
                    parsed3d.y - sRay * stats3d.uy,
                    parsed3d.z - sRay * stats3d.uz
                  ),
                  mathToThreeVec3(
                    parsed3d.x + sRay * stats3d.ux,
                    parsed3d.y + sRay * stats3d.uy,
                    parsed3d.z + sRay * stats3d.uz
                  ),
                ]);
                group.add(
                  new THREE.Line(
                    rayGeo,
                    new THREE.LineBasicMaterial({ color: 0xfbeaa4, transparent: true, opacity: 0.75 })
                  )
                );

                // Unit direction arrow û (#8D9FCE)
                group.add(
                  createVectorArrow3D(
                    [parsed3d.x, parsed3d.y, parsed3d.z],
                    [stats3d.ux, stats3d.uy, stats3d.uz],
                    1.0,
                    0x8d9fce
                  )
                );

                // Gradient arrow ∇φ (#D35323)
                if (stats3d.gradMagnitude > 1e-6) {
                  const gLen = Math.min(1.5, Math.max(0.55, stats3d.gradMagnitude * 0.18));
                  group.add(
                    createVectorArrow3D(
                      [parsed3d.x, parsed3d.y, parsed3d.z],
                      [stats3d.fx, stats3d.fy, stats3d.fz],
                      gLen,
                      0xd35323
                    )
                  );
                }
              }
            }}
          />

          {/* Step-by-Step Directional Derivative Derivation */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#96B898] font-semibold">
                Worked Calculation: Gradient → Normalization → Dot Product
              </span>
              <span className="text-xs font-tabular-mono flex items-center gap-1">
                {activeDuf > 1e-4 ? (
                  <span className="text-[#96B898] flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" /> Rising along û
                  </span>
                ) : activeDuf < -1e-4 ? (
                  <span className="text-[#B95869] flex items-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" /> Falling along û
                  </span>
                ) : (
                  <span className="text-[#FBEAA4] flex items-center gap-1">
                    <Minus className="w-3.5 h-3.5" aria-hidden="true" /> Level Tangent (0)
                  </span>
                )}
              </span>
            </div>

            {dimMode === "2d" ? (
              <div className="space-y-2 text-xs overflow-x-auto">
                <KaTeXMath
                  math={`\\begin{aligned}
1.\\;& \\nabla f(${fmt(parsed2d.x)}, ${fmt(parsed2d.y)}) = \\langle ${fmt(stats2d.fx)},\\; ${fmt(stats2d.fy)} \\rangle \\\\
2.\\;& \\hat{\\mathbf{u}} = \\frac{\\mathbf{v}}{\\|\\mathbf{v}\\|} = \\frac{\\langle ${fmt(parsed2d.vx)}, ${fmt(parsed2d.vy)} \\rangle}{${fmt(stats2d.vNorm)}} = \\langle ${fmt(stats2d.ux)},\\; ${fmt(stats2d.uy)} \\rangle \\\\
3.\\;& D_{\\hat{\\mathbf{u}}} f(P) = \\nabla f(P)\\cdot\\hat{\\mathbf{u}} = (${fmt(stats2d.fx)})(${fmt(stats2d.ux)}) + (${fmt(stats2d.fy)})(${fmt(stats2d.uy)}) = \\mathbf{${fmt(stats2d.duf)}}
\\end{aligned}`}
                  block
                />
              </div>
            ) : (
              <div className="space-y-2 text-xs overflow-x-auto">
                <KaTeXMath
                  math={`\\begin{aligned}
1.\\;& \\nabla \\phi(${fmt(parsed3d.x)}, ${fmt(parsed3d.y)}, ${fmt(parsed3d.z)}) = \\langle ${fmt(stats3d.fx)},\\; ${fmt(stats3d.fy)},\\; ${fmt(stats3d.fz)} \\rangle \\\\
2.\\;& \\hat{\\mathbf{u}} = \\frac{\\mathbf{v}}{\\|\\mathbf{v}\\|} = \\frac{\\langle ${fmt(parsed3d.vx)}, ${fmt(parsed3d.vy)}, ${fmt(parsed3d.vz)} \\rangle}{${fmt(stats3d.vNorm)}} = \\langle ${fmt(stats3d.ux)},\\; ${fmt(stats3d.uy)},\\; ${fmt(stats3d.uz)} \\rangle \\\\
3.\\;& D_{\\hat{\\mathbf{u}}}\\phi(P) = \\nabla\\phi(P)\\cdot\\hat{\\mathbf{u}} = \\mathbf{${fmt(stats3d.duf)}}
\\end{aligned}`}
                  block
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: 2D Contour Projection / 1D Slice Curve Profile */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                {dimMode === "2d" && plot2dTab === "contours" ? (
                  <>
                    <Compass className="w-3.5 h-3.5 text-[#8D9FCE]" aria-hidden="true" />
                    2D Contours &amp; Projection ∇f · û
                  </>
                ) : (
                  <>
                    <Crosshair className="w-3.5 h-3.5 text-[#96B898]" aria-hidden="true" />
                    1D Ray Slice Profile &amp; Tangent Slope
                  </>
                )}
              </span>

              {dimMode === "2d" && (
                <div className="flex border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[11px] font-tabular-mono">
                  <button
                    type="button"
                    onClick={() => setPlot2dTab("contours")}
                    className={`px-2 py-0.5 ${
                      plot2dTab === "contours"
                        ? "bg-[#8D9FCE] text-[#1E1F22] font-semibold"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    Contours &amp; Rose
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlot2dTab("slice")}
                    className={`px-2 py-0.5 border-l border-[var(--border-subtle)] ${
                      plot2dTab === "slice"
                        ? "bg-[#96B898] text-[#1E1F22] font-semibold"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    1D Slice f(P+sû)
                  </button>
                </div>
              )}
            </div>

            {dimMode === "2d" && plot2dTab === "contours" ? (
              <SvgCoordinatePlane2D
                xRange={[bounds2d.xMin, bounds2d.xMax]}
                yRange={[bounds2d.yMin, bounds2d.yMax]}
                height={290}
                ariaLabel="2D contour projection of gradient onto unit direction vector"
                onSelectPoint={(wx, wy) => {
                  setX0_2d(wx.toFixed(2));
                  setY0_2d(wy.toFixed(2));
                }}
              >
                {({ toSvgX, toSvgY }) => {
                  const { x: px, y: py } = parsed2d;
                  const { fx, fy, gradMagnitude, ux, uy, duf } = stats2d;
                  const vecScale =
                    gradMagnitude > 1e-6
                      ? Math.min(radius2d * 0.55, Math.max(radius2d * 0.25, gradMagnitude * 0.3)) /
                        gradMagnitude
                      : 0.4;
                  const gxEnd = px + fx * vecScale;
                  const gyEnd = py + fy * vecScale;

                  const uDisplayLen = radius2d * 0.35;
                  const uxEnd = px + ux * uDisplayLen;
                  const uyEnd = py + uy * uDisplayLen;

                  // Orthogonal projection point of scaled ∇f onto line spanned by û
                  const projScalar = duf * vecScale;
                  const projX = px + ux * projScalar;
                  const projY = py + uy * projScalar;

                  // Polar slope rose points r(a) = |∇f · u(a)| scaled to fit nicely
                  const rosePath: string[] = [];
                  if (gradMagnitude > 1e-6) {
                    for (let k = 0; k <= 72; k++) {
                      const a = (k / 72) * Math.PI * 2;
                      const r = Math.abs(fx * Math.cos(a) + fy * Math.sin(a)) * vecScale;
                      const rx = toSvgX(px + r * Math.cos(a));
                      const ry = toSvgY(py + r * Math.sin(a));
                      rosePath.push(`${k === 0 ? "M" : "L"}${rx.toFixed(1)},${ry.toFixed(1)}`);
                    }
                    rosePath.push("Z");
                  }

                  return (
                    <g>
                      {contours2d.bgSegs.map((segs, idx) => (
                        <g key={idx}>
                          {segs.map((s, k) => (
                            <line
                              key={k}
                              x1={toSvgX(s.x1)}
                              y1={toSvgY(s.y1)}
                              x2={toSvgX(s.x2)}
                              y2={toSvgY(s.y2)}
                              stroke="#029091"
                              strokeOpacity={0.35}
                              strokeWidth={1}
                            />
                          ))}
                        </g>
                      ))}
                      {contours2d.activeSegs.map((s, k) => (
                        <line
                          key={`act-${k}`}
                          x1={toSvgX(s.x1)}
                          y1={toSvgY(s.y1)}
                          x2={toSvgX(s.x2)}
                          y2={toSvgY(s.y2)}
                          stroke="#FBEAA4"
                          strokeWidth={2}
                        />
                      ))}

                      {/* Twin polar slope rose circles */}
                      {rosePath.length > 0 && (
                        <path
                          d={rosePath.join(" ")}
                          fill="#FBEAA4"
                          fillOpacity={0.08}
                          stroke="#AAA36D"
                          strokeWidth={1.1}
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Ray along û */}
                      <line
                        x1={toSvgX(px - ux * radius2d * 0.7)}
                        y1={toSvgY(py - uy * radius2d * 0.7)}
                        x2={toSvgX(px + ux * radius2d * 0.7)}
                        y2={toSvgY(py + uy * radius2d * 0.7)}
                        stroke="#8D9FCE"
                        strokeOpacity={0.35}
                        strokeDasharray="4 3"
                        strokeWidth={1}
                      />

                      {/* Orthogonal projection drop line from ∇f tip onto û axis */}
                      {gradMagnitude > 1e-6 && (
                        <>
                          <line
                            x1={toSvgX(gxEnd)}
                            y1={toSvgY(gyEnd)}
                            x2={toSvgX(projX)}
                            y2={toSvgY(projY)}
                            stroke="#FBEAA4"
                            strokeDasharray="3 3"
                            strokeWidth={1.4}
                          />
                          <line
                            x1={toSvgX(px)}
                            y1={toSvgY(py)}
                            x2={toSvgX(projX)}
                            y2={toSvgY(projY)}
                            stroke="#96B898"
                            strokeWidth={3.5}
                            strokeOpacity={0.85}
                          />
                        </>
                      )}

                      {/* Unit vector û */}
                      <line
                        x1={toSvgX(px)}
                        y1={toSvgY(py)}
                        x2={toSvgX(uxEnd)}
                        y2={toSvgY(uyEnd)}
                        stroke="#8D9FCE"
                        strokeWidth={2.4}
                      />
                      <circle cx={toSvgX(uxEnd)} cy={toSvgY(uyEnd)} r={3.5} fill="#8D9FCE" />

                      {/* Gradient vector ∇f */}
                      {gradMagnitude > 1e-6 && (
                        <>
                          <line
                            x1={toSvgX(px)}
                            y1={toSvgY(py)}
                            x2={toSvgX(gxEnd)}
                            y2={toSvgY(gyEnd)}
                            stroke="#D35323"
                            strokeWidth={2.6}
                          />
                          <circle cx={toSvgX(gxEnd)} cy={toSvgY(gyEnd)} r={3.8} fill="#D35323" />
                        </>
                      )}

                      <circle
                        cx={toSvgX(px)}
                        cy={toSvgY(py)}
                        r={4.5}
                        fill="#FBEAA4"
                        stroke="#1E1F22"
                        strokeWidth={1.4}
                      />
                    </g>
                  );
                }}
              </SvgCoordinatePlane2D>
            ) : (
              <SvgCoordinatePlane2D
                xRange={[sliceProfile.sMin, sliceProfile.sMax]}
                yRange={[sliceProfile.yMin, sliceProfile.yMax]}
                xLabel="s (step along û)"
                yLabel={dimMode === "2d" ? "f(P+sû)" : "φ(P+sû)"}
                height={290}
                ariaLabel="1D directional slice curve and tangent slope D_u f"
              >
                {({ toSvgX, toSvgY }) => {
                  const pathD = sliceProfile.pts
                    .map(
                      (pt, idx) =>
                        `${idx === 0 ? "M" : "L"}${toSvgX(pt.s).toFixed(1)},${toSvgY(
                          pt.val
                        ).toFixed(1)}`
                    )
                    .join(" ");

                  const sTan = 0.9;
                  const yLeft = sliceProfile.f0 - sliceProfile.slope * sTan;
                  const yRight = sliceProfile.f0 + sliceProfile.slope * sTan;

                  return (
                    <g>
                      {sliceProfile.pts.length > 1 && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#029091"
                          strokeWidth={2.5}
                        />
                      )}
                      {Number.isFinite(sliceProfile.f0) && Number.isFinite(sliceProfile.slope) && (
                        <>
                          <line
                            x1={toSvgX(-sTan)}
                            y1={toSvgY(yLeft)}
                            x2={toSvgX(sTan)}
                            y2={toSvgY(yRight)}
                            stroke="#96B898"
                            strokeWidth={2.2}
                            strokeDasharray="5 3"
                          />
                          <circle
                            cx={toSvgX(0)}
                            cy={toSvgY(sliceProfile.f0)}
                            r={4.5}
                            fill="#FBEAA4"
                            stroke="#1E1F22"
                            strokeWidth={1.4}
                          />
                        </>
                      )}
                    </g>
                  );
                }}
              </SvgCoordinatePlane2D>
            )}

            {/* Extremal Rate Bounds Card */}
            <div className="grid grid-cols-3 gap-2 font-tabular-mono">
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                <span className="text-[10px] text-[#B95869] block">Min (−‖∇f‖)</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  −
                  {dimMode === "2d"
                    ? fmt(stats2d.gradMagnitude)
                    : fmt(stats3d.gradMagnitude)}
                </span>
              </div>
              <div className="p-2.5 border border-[#96B898]/60 bg-[var(--bg-canvas)]">
                <span className="text-[10px] text-[#96B898] block">D_û f(P)</span>
                <span className="text-sm font-semibold text-[#96B898]">
                  {fmt(activeDuf)}
                </span>
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                <span className="text-[10px] text-[#D35323] block">Max (+‖∇f‖)</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  +
                  {dimMode === "2d"
                    ? fmt(stats2d.gradMagnitude)
                    : fmt(stats3d.gradMagnitude)}
                </span>
              </div>
            </div>
          </div>

          {/* Pedagogical Note */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#8D9FCE] block">
              Vector Calculus Rule
            </span>
            <p className="font-math-serif text-xs text-[var(--text-secondary)] leading-relaxed">
              {dimMode === "2d" ? activePreset2d.note : activePreset3d.note} Notice that{" "}
              <KaTeXMath math="D_{\hat{\mathbf{u}}}f" /> is the scalar projection of{" "}
              <KaTeXMath math="\nabla f" /> onto unit vector <KaTeXMath math="\hat{\mathbf{u}}" />—so
              always divide <KaTeXMath math="\mathbf{v}" /> by{" "}
              <KaTeXMath math="\|\mathbf{v}\|" /> first!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
