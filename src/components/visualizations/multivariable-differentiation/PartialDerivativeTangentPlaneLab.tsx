"use client";

import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Compass, Sliders } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  mathToThreeVec3,
  createParametricSurfaceMesh,
  createVectorArrow3D,
  computePartialDerivatives2D,
} from "@/components/visualizations/primitives";
import { getAdaptiveAccentInk } from "@/lib/accentInk";

interface TangentPreset {
  id: string;
  name: string;
  badge: string;
  expr: string;
  xMinExpr: string;
  xMaxExpr: string;
  yMinExpr: string;
  yMaxExpr: string;
  defaultX0: number;
  defaultY0: number;
  fxLatex: string;
  fyLatex: string;
  note: string;
}

const TANGENT_PRESETS: TangentPreset[] = [
  {
    id: "paraboloid-cap",
    name: "Paraboloid Cap: f(x,y) = 1.5 - 0.35x² - 0.5y²",
    badge: "Concave Down Everywhere",
    expr: "1.5 - 0.35 * x^2 - 0.5 * y^2",
    xMinExpr: "-2",
    xMaxExpr: "2",
    yMinExpr: "-2",
    yMaxExpr: "2",
    defaultX0: 0.85,
    defaultY0: 0.65,
    fxLatex: "f_x(x,y) = -0.70x",
    fyLatex: "f_y(x,y) = -1.00y",
    note: "Freezing y = y₀ gives a parabola in x with slope f_x = -0.7x₀; freezing x = x₀ gives a parabola in y with slope f_y = -y₀. At (0,0), both partials vanish and the tangent plane is horizontal z = 1.5.",
  },
  {
    id: "saddle-surface",
    name: "Hyperbolic Saddle: f(x,y) = 0.45(x² - y²)",
    badge: "Opposite Curvatures",
    expr: "0.45 * (x^2 - y^2)",
    xMinExpr: "-2",
    xMaxExpr: "2",
    yMinExpr: "-2",
    yMaxExpr: "2",
    defaultX0: 0.8,
    defaultY0: -0.6,
    fxLatex: "f_x(x,y) = 0.90x",
    fyLatex: "f_y(x,y) = -0.90y",
    note: "Along x, the slice curves upward (f_xx > 0); along y, the slice curves downward (f_yy < 0). The tangent plane at (0,0) slices right through the surface along y = ±x.",
  },
  {
    id: "gaussian-ridge",
    name: "Thermal Gaussian Bell: f(x,y) = 1.6 exp(-0.45(x² + y²))",
    badge: "Bell Profile",
    expr: "1.6 * exp(-0.45 * (x^2 + y^2))",
    xMinExpr: "-2",
    xMaxExpr: "2",
    yMinExpr: "-2",
    yMaxExpr: "2",
    defaultX0: 0.75,
    defaultY0: 0.55,
    fxLatex: "f_x(x,y) = -1.44x\\,e^{-0.45(x^2+y^2)}",
    fyLatex: "f_y(x,y) = -1.44y\\,e^{-0.45(x^2+y^2)}",
    note: "Models localized laser heating on a flat plate. The tangent plane provides the first-order Taylor linearization L(x,y) used in finite-difference thermal solvers.",
  },
  {
    id: "coupled-twist",
    name: "Twisted Bilinear Warping: f(x,y) = 0.45 x·y + 0.15(x² - y²)",
    badge: "Mixed Partial f_xy ≠ 0",
    expr: "0.45 * x * y + 0.15 * (x^2 - y^2)",
    xMinExpr: "-2",
    xMaxExpr: "2",
    yMinExpr: "-2",
    yMaxExpr: "2",
    defaultX0: 0.9,
    defaultY0: 0.7,
    fxLatex: "f_x(x,y) = 0.45y + 0.30x",
    fyLatex: "f_y(x,y) = 0.45x - 0.30y",
    note: "Because of the product term 0.45xy, the x-slope f_x depends on y₀ and the y-slope f_y depends on x₀ (Clairaut's theorem: f_xy = f_yx = 0.45).",
  },
];

export function PartialDerivativeTangentPlaneLab() {
  const [presetId, setPresetId] = useState<string>("paraboloid-cap");
  const [expr, setExpr] = useState<string>(TANGENT_PRESETS[0].expr);
  const [xMinExpr, setXMinExpr] = useState<string>(TANGENT_PRESETS[0].xMinExpr);
  const [xMaxExpr, setXMaxExpr] = useState<string>(TANGENT_PRESETS[0].xMaxExpr);
  const [yMinExpr, setYMinExpr] = useState<string>(TANGENT_PRESETS[0].yMinExpr);
  const [yMaxExpr, setYMaxExpr] = useState<string>(TANGENT_PRESETS[0].yMaxExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [x0, setX0] = useState<number>(TANGENT_PRESETS[0].defaultX0);
  const [y0, setY0] = useState<number>(TANGENT_PRESETS[0].defaultY0);
  const [patchRadius, setPatchRadius] = useState<number>(0.85);
  const [showNormal, setShowNormal] = useState<boolean>(true);

  const activePreset = useMemo(
    () => TANGENT_PRESETS.find((p) => p.id === presetId) ?? TANGENT_PRESETS[0],
    [presetId]
  );

  const compiledFn = useMemo(
    () => compileMathExpression(expr, ["x", "y"]),
    [expr]
  );
  const compiledXMin = useMemo(
    () => compileMathExpression(xMinExpr, []),
    [xMinExpr]
  );
  const compiledXMax = useMemo(
    () => compileMathExpression(xMaxExpr, []),
    [xMaxExpr]
  );
  const compiledYMin = useMemo(
    () => compileMathExpression(yMinExpr, []),
    [yMinExpr]
  );
  const compiledYMax = useMemo(
    () => compileMathExpression(yMaxExpr, []),
    [yMaxExpr]
  );

  const bounds = useMemo(() => {
    const rx1 = compiledXMin.evaluate({});
    const rx2 = compiledXMax.evaluate({});
    const ry1 = compiledYMin.evaluate({});
    const ry2 = compiledYMax.evaluate({});
    const xMin = Math.min(rx1, rx2 - 0.2);
    const xMax = Math.max(rx2, xMin + 0.2);
    const yMin = Math.min(ry1, ry2 - 0.2);
    const yMax = Math.max(ry2, yMin + 0.2);
    return { xMin, xMax, yMin, yMax };
  }, [compiledXMin, compiledXMax, compiledYMin, compiledYMax]);

  const safeX0 = Math.max(bounds.xMin, Math.min(bounds.xMax, x0));
  const safeY0 = Math.max(bounds.yMin, Math.min(bounds.yMax, y0));

  const handleSelectPreset = (p: TangentPreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setXMinExpr(p.xMinExpr);
    setXMaxExpr(p.xMaxExpr);
    setYMinExpr(p.yMinExpr);
    setYMaxExpr(p.yMaxExpr);
    setX0(p.defaultX0);
    setY0(p.defaultY0);
    setIsCustom(false);
  };

  // Evaluate partial derivatives at (safeX0, safeY0)
  const partials = useMemo(() => {
    return computePartialDerivatives2D(
      (x, y) => compiledFn.evaluate({ x, y }),
      safeX0,
      safeY0
    );
  }, [compiledFn, safeX0, safeY0]);

  // Sample 1D cross-sections z = f(x, y0) and z = f(x0, y)
  const crossSections = useMemo(() => {
    const samples = 48;
    const xCurve: [number, number][] = [];
    const yCurve: [number, number][] = [];
    let zMin = -1.5;
    let zMax = 1.8;

    for (let i = 0; i <= samples; i++) {
      const xv =
        bounds.xMin + (i / samples) * (bounds.xMax - bounds.xMin);
      const zx = compiledFn.evaluate({ x: xv, y: safeY0 });
      if (Number.isFinite(zx)) {
        const cz = Math.max(-3.5, Math.min(3.5, zx));
        xCurve.push([xv, cz]);
        if (cz < zMin) zMin = cz;
        if (cz > zMax) zMax = cz;
      }

      const yv =
        bounds.yMin + (i / samples) * (bounds.yMax - bounds.yMin);
      const zy = compiledFn.evaluate({ x: safeX0, y: yv });
      if (Number.isFinite(zy)) {
        const cz = Math.max(-3.5, Math.min(3.5, zy));
        yCurve.push([yv, cz]);
        if (cz < zMin) zMin = cz;
        if (cz > zMax) zMax = cz;
      }
    }
    return { xCurve, yCurve, zMin: zMin - 0.3, zMax: zMax + 0.3 };
  }, [compiledFn, bounds, safeX0, safeY0]);

  // Differential error check for step (dx, dy) = (0.2, 0.2)
  const diffCheck = useMemo(() => {
    const dx = 0.2;
    const dy = 0.2;
    const exactNext = compiledFn.evaluate({ x: safeX0 + dx, y: safeY0 + dy });
    const deltaZ = exactNext - partials.f0;
    const dz = partials.fx * dx + partials.fy * dy;
    const absErr = Math.abs(deltaZ - dz);
    return { dx, dy, deltaZ, dz, absErr };
  }, [compiledFn, safeX0, safeY0, partials]);

  return (
    <section
      aria-label="Partial Derivatives and Tangent Plane Linearization Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[var(--bg-canvas)]">
              LAB 3.1.2 • PARTIAL DERIVATIVES &amp; 3D TANGENT PLANE
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              {isCustom ? "Custom Equation" : activePreset.badge}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Coordinate Slice Tangents <KaTeXMath math="\mathbf{T}_x, \mathbf{T}_y" /> &amp; Local Linearization <KaTeXMath math="L(x,y)" />
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TANGENT_PRESETS.map((p) => {
            const active = !isCustom && p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "border-[var(--math-ink-y)] bg-[#96B898]/15 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                {p.name.split(":")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Math Expression & Bounds */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] space-y-4">
        <MathExpressionInput
          label="Type Any Custom Differentiable Surface z = f(x, y):"
          prefixLatex="f(x,y) ="
          value={expr}
          onChange={(val) => {
            setExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x", "y"]}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[
            { label: "x_min", val: xMinExpr, set: setXMinExpr, color: "#8D9FCE" },
            { label: "x_max", val: xMaxExpr, set: setXMaxExpr, color: "#8D9FCE" },
            { label: "y_min", val: yMinExpr, set: setYMinExpr, color: "#96B898" },
            { label: "y_max", val: yMaxExpr, set: setYMaxExpr, color: "#96B898" },
          ].map((item) => (
            <label key={item.label} className="block space-y-1">
              <span
                className="text-[11px] font-tabular-mono uppercase tracking-wider block"
                style={{ color: getAdaptiveAccentInk(item.color) }}
              >
                Bound <KaTeXMath math={item.label} />
              </span>
              <input
                type="text"
                value={item.val}
                onChange={(e) => {
                  item.set(e.target.value);
                  setIsCustom(true);
                }}
                className="w-full px-2.5 py-1.5 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--math-ink-y)]"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: 3D Viewport */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <ThreeOrbitViewport
            heightClassName="h-[390px] sm:h-[430px]"
            cameraPosition={[3.3, 2.5, 3.2]}
            cameraTarget={[0, 0.3, 0]}
            titleBadge="3D Surface, Coordinate Slice Curves & Spanned Tangent Plane"
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-x)]">
                  ∂f/∂x = {partials.fx.toFixed(3)}
                </span>
                <span className="text-[var(--math-ink-y)]">
                  ∂f/∂y = {partials.fy.toFixed(3)}
                </span>
                <span className="text-[var(--math-ink-diff)]">
                  z₀ = f({safeX0.toFixed(2)}, {safeY0.toFixed(2)}) = {partials.f0.toFixed(3)}
                </span>
              </div>
            }
            sceneDeps={[
              compiledFn,
              bounds,
              safeX0,
              safeY0,
              patchRadius,
              showNormal,
              partials,
            ]}
            onBuildScene={(group) => {
              // 1. Primary surface z = f(x,y)
              const surfaceGroup = createParametricSurfaceMesh(
                (u, v) => {
                  const z = compiledFn.evaluate({ x: u, y: v });
                  const cz = Number.isFinite(z)
                    ? Math.max(-3.5, Math.min(3.5, z))
                    : 0;
                  return [u, v, cz];
                },
                [bounds.xMin, bounds.xMax],
                [bounds.yMin, bounds.yMax],
                38,
                38,
                {
                  color: 0x029091,
                  opacity: 0.56,
                  wireframeColor: 0x8d9fce,
                  wireframeOpacity: 0.16,
                  showWireframe: true,
                }
              );
              group.add(surfaceGroup);

              // 2. x-slice curve (y = y0 fixed) in #8D9FCE Periwinkle
              const xSlicePts: THREE.Vector3[] = [];
              const N = 60;
              for (let i = 0; i <= N; i++) {
                const xv =
                  bounds.xMin + (i / N) * (bounds.xMax - bounds.xMin);
                const zv = compiledFn.evaluate({ x: xv, y: safeY0 });
                if (Number.isFinite(zv)) {
                  xSlicePts.push(
                    mathToThreeVec3(xv, safeY0, Math.max(-3.5, Math.min(3.5, zv)))
                  );
                }
              }
              if (xSlicePts.length > 1) {
                group.add(
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints(xSlicePts),
                    new THREE.LineBasicMaterial({ color: 0x8d9fce })
                  )
                );
              }

              // 3. y-slice curve (x = x0 fixed) in #96B898 Sage Green
              const ySlicePts: THREE.Vector3[] = [];
              for (let i = 0; i <= N; i++) {
                const yv =
                  bounds.yMin + (i / N) * (bounds.yMax - bounds.yMin);
                const zv = compiledFn.evaluate({ x: safeX0, y: yv });
                if (Number.isFinite(zv)) {
                  ySlicePts.push(
                    mathToThreeVec3(safeX0, yv, Math.max(-3.5, Math.min(3.5, zv)))
                  );
                }
              }
              if (ySlicePts.length > 1) {
                group.add(
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints(ySlicePts),
                    new THREE.LineBasicMaterial({ color: 0x96b898 })
                  )
                );
              }

              if (!Number.isFinite(partials.f0)) return;
              const z0 = Math.max(-3.5, Math.min(3.5, partials.f0));

              // 4. Local Tangent Plane Patch L(x,y) = z0 + fx*(x-x0) + fy*(y-y0) in #FBEAA4
              const r = patchRadius;
              const evalTangentZ = (x: number, y: number) =>
                z0 + partials.fx * (x - safeX0) + partials.fy * (y - safeY0);

              const c00 = mathToThreeVec3(
                safeX0 - r,
                safeY0 - r,
                evalTangentZ(safeX0 - r, safeY0 - r)
              );
              const c10 = mathToThreeVec3(
                safeX0 + r,
                safeY0 - r,
                evalTangentZ(safeX0 + r, safeY0 - r)
              );
              const c11 = mathToThreeVec3(
                safeX0 + r,
                safeY0 + r,
                evalTangentZ(safeX0 + r, safeY0 + r)
              );
              const c01 = mathToThreeVec3(
                safeX0 - r,
                safeY0 + r,
                evalTangentZ(safeX0 - r, safeY0 + r)
              );

              const tpGeom = new THREE.BufferGeometry().setFromPoints([
                c00,
                c10,
                c11,
                c00,
                c11,
                c01,
              ]);
              tpGeom.computeVertexNormals();
              group.add(
                new THREE.Mesh(
                  tpGeom,
                  new THREE.MeshBasicMaterial({
                    color: 0xfbeaa4,
                    transparent: true,
                    opacity: 0.34,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                  })
                )
              );

              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints([
                    c00,
                    c10,
                    c11,
                    c01,
                    c00,
                  ]),
                  new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                )
              );

              // 5. Basis Tangent Vectors T_x = <1, 0, fx> and T_y = <0, 1, fy>
              const scaleVec = 0.65;
              const txArrow = createVectorArrow3D(
                [safeX0, safeY0, z0],
                [scaleVec, 0, scaleVec * partials.fx],
                0x8d9fce
              );
              const tyArrow = createVectorArrow3D(
                [safeX0, safeY0, z0],
                [0, scaleVec, scaleVec * partials.fy],
                0x96b898
              );
              group.add(txArrow, tyArrow);

              // 6. Surface Normal Vector n = <-fx, -fy, 1> = T_x x T_y in #D35323 Persimmon
              if (showNormal) {
                const nLen = Math.hypot(partials.fx, partials.fy, 1);
                const nScale = 0.75 / nLen;
                const normalArrow = createVectorArrow3D(
                  [safeX0, safeY0, z0],
                  [
                    -partials.fx * nScale,
                    -partials.fy * nScale,
                    1 * nScale,
                  ],
                  0xd35323
                );
                group.add(normalArrow);
              }

              // 7. Point marker at (x0, y0, z0)
              const ptMesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.06, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xfbeaa4 })
              );
              ptMesh.position.copy(mathToThreeVec3(safeX0, safeY0, z0));
              group.add(ptMesh);
            }}
          />

          {/* Tangent Plane Equation Card */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
                FIRST-ORDER TAYLOR TANGENT PLANE AT (x₀, y₀) = ({safeX0.toFixed(2)}, {safeY0.toFixed(2)})
              </span>
              <span className="text-xs font-tabular-mono text-[var(--math-ink-sweep)]">
                n = ⟨{(-partials.fx).toFixed(2)}, {(-partials.fy).toFixed(2)}, 1⟩
              </span>
            </div>
            <div className="overflow-x-auto py-1">
              <KaTeXMath
                math={`L(x,y) = \\underbrace{${partials.f0.toFixed(3)}}_{f(x_0,y_0)} + \\underbrace{(${partials.fx.toFixed(3)})}_{\\color{#8D9FCE}{f_x(x_0,y_0)}}(x - ${safeX0.toFixed(2)}) + \\underbrace{(${partials.fy.toFixed(3)})}_{\\color{#96B898}{f_y(x_0,y_0)}}(y - ${safeY0.toFixed(2)})`}
                block
              />
            </div>
            <p className="font-math-serif text-sm text-[var(--text-secondary)]">
              {isCustom
                ? "The tangent plane is spanned by the two slice tangent vectors T_x = ⟨1, 0, f_x⟩ and T_y = ⟨0, 1, f_y⟩, with normal vector n = T_x × T_y = ⟨-f_x, -f_y, 1⟩."
                : activePreset.note}
            </p>
          </div>
        </div>

        {/* Right: 1D Coordinate Slice Plots & Controls */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)]">
          {/* 1D Slice Plot 1: z = f(x, y0) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="text-[var(--math-ink-x)] font-semibold">
                1D Slice in x (Fix y₀ = {safeY0.toFixed(2)})
              </span>
              <span className="text-[var(--math-ink-x)]">
                Slope ∂f/∂x = {partials.fx.toFixed(3)}
              </span>
            </div>
            <SvgCoordinatePlane2D
              xRange={[bounds.xMin, bounds.xMax]}
              yRange={[crossSections.zMin, crossSections.zMax]}
              height={155}
              xLabel="x"
              yLabel="z"
              xColor="#8D9FCE"
              yColor="#029091"
              ariaLabel="1D Cross-Section Curve z = f(x, y0) and Tangent Line"
              className="w-full h-36 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
            >
              {({ toSvgX, toSvgY }) => {
                const pathD = crossSections.xCurve
                  .map(
                    ([xv, zv], idx) =>
                      `${idx === 0 ? "M" : "L"} ${toSvgX(xv).toFixed(1)} ${toSvgY(zv).toFixed(1)}`
                  )
                  .join(" ");
                const xA = safeX0 - 0.85;
                const xB = safeX0 + 0.85;
                const zA = partials.f0 + partials.fx * (xA - safeX0);
                const zB = partials.f0 + partials.fx * (xB - safeX0);
                return (
                  <g>
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#8D9FCE"
                        strokeWidth="2.2"
                      />
                    )}
                    <line
                      x1={toSvgX(xA)}
                      y1={toSvgY(zA)}
                      x2={toSvgX(xB)}
                      y2={toSvgY(zB)}
                      stroke="#FBEAA4"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                    <circle
                      cx={toSvgX(safeX0)}
                      cy={toSvgY(partials.f0)}
                      r="4.5"
                      fill="#FBEAA4"
                      stroke="#1E1F22"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>
          </div>

          {/* 1D Slice Plot 2: z = f(x0, y) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="text-[var(--math-ink-y)] font-semibold">
                1D Slice in y (Fix x₀ = {safeX0.toFixed(2)})
              </span>
              <span className="text-[var(--math-ink-y)]">
                Slope ∂f/∂y = {partials.fy.toFixed(3)}
              </span>
            </div>
            <SvgCoordinatePlane2D
              xRange={[bounds.yMin, bounds.yMax]}
              yRange={[crossSections.zMin, crossSections.zMax]}
              height={155}
              xLabel="y"
              yLabel="z"
              xColor="#96B898"
              yColor="#029091"
              ariaLabel="1D Cross-Section Curve z = f(x0, y) and Tangent Line"
              className="w-full h-36 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
            >
              {({ toSvgX, toSvgY }) => {
                const pathD = crossSections.yCurve
                  .map(
                    ([yv, zv], idx) =>
                      `${idx === 0 ? "M" : "L"} ${toSvgX(yv).toFixed(1)} ${toSvgY(zv).toFixed(1)}`
                  )
                  .join(" ");
                const yA = safeY0 - 0.85;
                const yB = safeY0 + 0.85;
                const zA = partials.f0 + partials.fy * (yA - safeY0);
                const zB = partials.f0 + partials.fy * (yB - safeY0);
                return (
                  <g>
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#96B898"
                        strokeWidth="2.2"
                      />
                    )}
                    <line
                      x1={toSvgX(yA)}
                      y1={toSvgY(zA)}
                      x2={toSvgX(yB)}
                      y2={toSvgY(zB)}
                      stroke="#FBEAA4"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                    <circle
                      cx={toSvgX(safeY0)}
                      cy={toSvgY(partials.f0)}
                      r="4.5"
                      fill="#FBEAA4"
                      stroke="#1E1F22"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>
          </div>

          {/* Sliders for (x0, y0) and Tangent Plane Size */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-x)]">
                  <span>Slice Point x₀</span>
                  <span>{safeX0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={bounds.xMin}
                  max={bounds.xMax}
                  step={(bounds.xMax - bounds.xMin) / 100}
                  value={safeX0}
                  onChange={(e) => setX0(parseFloat(e.target.value))}
                  className="w-full accent-[#8D9FCE]"
                  aria-label="Slice point x₀"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-y)]">
                  <span>Slice Point y₀</span>
                  <span>{safeY0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={bounds.yMin}
                  max={bounds.yMax}
                  step={(bounds.yMax - bounds.yMin) / 100}
                  value={safeY0}
                  onChange={(e) => setY0(parseFloat(e.target.value))}
                  className="w-full accent-[#96B898]"
                  aria-label="Slice point y₀"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-tabular-mono text-[var(--math-ink-diff)]">
                <Sliders className="w-3.5 h-3.5" />
                <span>Patch Radius: {patchRadius.toFixed(2)}</span>
                <input
                  type="range"
                  min={0.35}
                  max={1.4}
                  step={0.05}
                  value={patchRadius}
                  onChange={(e) => setPatchRadius(parseFloat(e.target.value))}
                  className="w-24 accent-[#FBEAA4]"
                  aria-label="Tangent plane patch radius"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowNormal((v) => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-tabular-mono border border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[var(--bg-panel)]"
              >
                <Compass className="w-3.5 h-3.5" />
                {showNormal ? "Normal n Visible" : "Show Normal n"}
              </button>
            </div>
          </div>

          {/* Total Differential vs Exact Increment Comparison */}
          <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
              TOTAL DIFFERENTIAL LINEARIZATION TEST (Δx = 0.20, Δy = 0.20)
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs font-tabular-mono">
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[var(--text-muted)] block text-[10px]">
                  Exact Δz
                </span>
                <span className="text-[var(--text-primary)] font-semibold">
                  {diffCheck.deltaZ.toFixed(4)}
                </span>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[var(--math-ink-diff)] block text-[10px]">
                  Linear dz
                </span>
                <span className="text-[var(--math-ink-diff)] font-semibold">
                  {diffCheck.dz.toFixed(4)}
                </span>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[var(--math-ink-sweep)] block text-[10px]">
                  Error |Δz - dz|
                </span>
                <span className="text-[var(--math-ink-sweep)] font-semibold">
                  {diffCheck.absErr.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
