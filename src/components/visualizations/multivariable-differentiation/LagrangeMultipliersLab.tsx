"use client";

import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Target, Sparkles } from "lucide-react";
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
  extractLevelCurveSegments,
} from "@/components/visualizations/primitives";

interface LagrangePreset {
  id: string;
  name: string;
  badge: string;
  fExpr: string;
  xParamExpr: string;
  yParamExpr: string;
  tMin: number;
  tMax: number;
  defaultT: number;
  constraintImplicitLatex: string;
  lagrangeSystemLatex: string;
  note: string;
}

const LAGRANGE_PRESETS: LagrangePreset[] = [
  {
    id: "linear-on-circle",
    name: "Linear Objective on Circle: Max/Min f = 0.8x + 0.6y on x² + y² = 1.44",
    badge: "2 Extrema (λ = ±0.417)",
    fExpr: "0.8 * x + 0.6 * y",
    xParamExpr: "1.2 * cos(t)",
    yParamExpr: "1.2 * sin(t)",
    tMin: 0,
    tMax: 2 * Math.PI,
    defaultT: 0.6435,
    constraintImplicitLatex: "g(x,y) = x^2 + y^2 = 1.44",
    lagrangeSystemLatex:
      "\\nabla f = \\langle 0.8, 0.6 \\rangle = \\lambda \\langle 2x, 2y \\rangle \\implies (x^*, y^*) = \\pm(0.96, 0.72)",
    note: "Walking along the circular constraint x² + y² = 1.2², f(x,y) reaches its constrained maximum (1.20) and minimum (-1.20) at the exact points where the straight contour line f = k is tangent to the circle (∇f ∥ ∇g).",
  },
  {
    id: "quadratic-on-ellipse",
    name: "Quadratic Form on Ellipse: f = 0.45(x² - y²) + 0.5xy on Ellipse",
    badge: "4 Stationary Points",
    fExpr: "0.45 * (x^2 - y^2) + 0.5 * x * y",
    xParamExpr: "1.45 * cos(t)",
    yParamExpr: "1.05 * sin(t)",
    tMin: 0,
    tMax: 2 * Math.PI,
    defaultT: 0.36,
    constraintImplicitLatex:
      "g(x,y) = \\frac{x^2}{1.45^2} + \\frac{y^2}{1.05^2} = 1",
    lagrangeSystemLatex:
      "\\nabla f(x,y) = \\lambda\\,\\nabla g(x,y) \\iff \\nabla f \\cdot \\mathbf{r}'(t) = 0",
    note: "A saddle objective restricted to a closed elliptical loop exhibits 2 constrained global maxima and 2 constrained global minima—each occurring where the hyperbolic level curve kisses the ellipse tangentially.",
  },
  {
    id: "paraboloid-on-circle",
    name: "Off-Center Paraboloid on Circle: f = 1.6 - 0.45((x-0.7)² + (y-0.5)²)",
    badge: "Nearest & Farthest Points",
    fExpr: "1.6 - 0.45 * ((x - 0.7)^2 + (y - 0.5)^2)",
    xParamExpr: "1.25 * cos(t)",
    yParamExpr: "1.25 * sin(t)",
    tMin: 0,
    tMax: 2 * Math.PI,
    defaultT: 0.62,
    constraintImplicitLatex: "g(x,y) = x^2 + y^2 = 1.25^2",
    lagrangeSystemLatex:
      "\\nabla f = -0.9\\langle x-0.7,\\; y-0.5 \\rangle = \\lambda\\langle 2x,\\; 2y \\rangle",
    note: "The unconstrained summit at (0.7, 0.5) lies strictly inside the circle, so on the boundary circle x² + y² = 1.25² the maximum occurs where the circular level curve around (0.7, 0.5) is internally tangent to the constraint circle.",
  },
  {
    id: "bowl-on-line",
    name: "Thermal Bowl on Linear Path: f = 1.5 - 0.5(x² + 1.4y²) on x + y = 1.1",
    badge: "Linear Budget Constraint",
    fExpr: "1.5 - 0.5 * (x^2 + 1.4 * y^2)",
    xParamExpr: "t",
    yParamExpr: "1.1 - t",
    tMin: -0.6,
    tMax: 1.7,
    defaultT: 0.64,
    constraintImplicitLatex: "g(x,y) = x + y = 1.1",
    lagrangeSystemLatex:
      "\\langle -x,\\; -1.4y \\rangle = \\lambda\\langle 1,\\; 1 \\rangle \\implies x = 1.4y,\\; x + y = 1.1",
    note: "In resource allocation, g(x,y) = x + y = c is a fixed budget line. Optimality occurs where the marginal utility ratio f_x / g_x equals f_y / g_y = λ.",
  },
];

export function LagrangeMultipliersLab() {
  const [presetId, setPresetId] = useState<string>("linear-on-circle");
  const [fExpr, setFExpr] = useState<string>(LAGRANGE_PRESETS[0].fExpr);
  const [xParamExpr, setXParamExpr] = useState<string>(
    LAGRANGE_PRESETS[0].xParamExpr
  );
  const [yParamExpr, setYParamExpr] = useState<string>(
    LAGRANGE_PRESETS[0].yParamExpr
  );
  const [paramT, setParamT] = useState<number>(LAGRANGE_PRESETS[0].defaultT);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const activePreset = useMemo(
    () => LAGRANGE_PRESETS.find((p) => p.id === presetId) ?? LAGRANGE_PRESETS[0],
    [presetId]
  );

  const compiledF = useMemo(
    () => compileMathExpression(fExpr, ["x", "y"]),
    [fExpr]
  );
  const compiledXParam = useMemo(
    () => compileMathExpression(xParamExpr, ["t"]),
    [xParamExpr]
  );
  const compiledYParam = useMemo(
    () => compileMathExpression(yParamExpr, ["t"]),
    [yParamExpr]
  );

  const bounds = { xMin: -2.0, xMax: 2.0, yMin: -2.0, yMax: 2.0 };
  const tMin = activePreset.tMin;
  const tMax = activePreset.tMax;
  const safeT = Math.max(tMin, Math.min(tMax, paramT));

  const handleSelectPreset = (p: LagrangePreset) => {
    setPresetId(p.id);
    setFExpr(p.fExpr);
    setXParamExpr(p.xParamExpr);
    setYParamExpr(p.yParamExpr);
    setParamT(p.defaultT);
    setIsCustom(false);
  };

  // Sample constraint curve & locate constrained global max and min over t in [tMin, tMax]
  const constraintAnalysis = useMemo(() => {
    const samples = 180;
    const curvePts2D: [number, number][] = [];
    const curvePts3D: [number, number, number][] = [];

    let bestMaxT = tMin;
    let bestMaxVal = -Infinity;
    let bestMinT = tMin;
    let bestMinVal = Infinity;

    for (let i = 0; i <= samples; i++) {
      const tv = tMin + (i / samples) * (tMax - tMin);
      const xv = compiledXParam.evaluate({ t: tv });
      const yv = compiledYParam.evaluate({ t: tv });
      const fv = compiledF.evaluate({ x: xv, y: yv });
      if (Number.isFinite(xv) && Number.isFinite(yv) && Number.isFinite(fv)) {
        const cf = Math.max(-3.5, Math.min(3.5, fv));
        curvePts2D.push([xv, yv]);
        curvePts3D.push([xv, yv, cf]);
        if (fv > bestMaxVal) {
          bestMaxVal = fv;
          bestMaxT = tv;
        }
        if (fv < bestMinVal) {
          bestMinVal = fv;
          bestMinT = tv;
        }
      }
    }

    return {
      curvePts2D,
      curvePts3D,
      bestMaxT,
      bestMaxVal,
      bestMinT,
      bestMinVal,
    };
  }, [compiledF, compiledXParam, compiledYParam, tMin, tMax]);

  // Evaluate current state at t = safeT
  const activeState = useMemo(() => {
    const h = 1e-4;
    const xc = compiledXParam.evaluate({ t: safeT });
    const yc = compiledYParam.evaluate({ t: safeT });
    const { f0, fx, fy, gradMagnitude } = computePartialDerivatives2D(
      (x, y) => compiledF.evaluate({ x, y }),
      xc,
      yc
    );

    // Curve tangent r'(t) = <dx/dt, dy/dt>
    const dxdt =
      (compiledXParam.evaluate({ t: safeT + h }) -
        compiledXParam.evaluate({ t: safeT - h })) /
      (2 * h);
    const dydt =
      (compiledYParam.evaluate({ t: safeT + h }) -
        compiledYParam.evaluate({ t: safeT - h })) /
      (2 * h);
    const speed = Math.hypot(dxdt, dydt) || 1;
    const tx = dxdt / speed;
    const ty = dydt / speed;

    // Outward normal to constraint curve N_g = <ty, -tx> (parallel to ∇g)
    const nx = ty;
    const ny = -tx;

    // Rate of change of f along constraint df/ds = ∇f · T
    const dfds = fx * tx + fy * ty;

    // Lagrange multiplier estimate λ = ∇f · N_g
    const lambdaEst = fx * nx + fy * ny;

    // Alignment error |sin θ| = |∇f · T| / ‖∇f‖
    const sinTheta =
      gradMagnitude > 1e-6 ? Math.abs(dfds) / gradMagnitude : 0;

    return {
      xc,
      yc,
      f0,
      fx,
      fy,
      gradMagnitude,
      tx,
      ty,
      nx,
      ny,
      dfds,
      lambdaEst,
      sinTheta,
      isStationary: sinTheta < 0.05,
    };
  }, [compiledF, compiledXParam, compiledYParam, safeT]);

  // Active level curve f(x,y) = f(x(t), y(t)) + background contours
  const contours = useMemo(() => {
    const activeSegs = extractLevelCurveSegments(
      (x, y) => compiledF.evaluate({ x, y }),
      bounds.xMin,
      bounds.xMax,
      bounds.yMin,
      bounds.yMax,
      activeState.f0,
      44,
      44
    );

    const bgLevels = [-1.2, -0.6, 0, 0.6, 1.2];
    const bgSegs = bgLevels.map((lv) =>
      extractLevelCurveSegments(
        (x, y) => compiledF.evaluate({ x, y }),
        bounds.xMin,
        bounds.xMax,
        bounds.yMin,
        bounds.yMax,
        lv,
        30,
        30
      )
    );

    return { activeSegs, bgSegs };
  }, [compiledF, bounds.xMin, bounds.xMax, bounds.yMin, bounds.yMax, activeState.f0]);

  return (
    <section
      aria-label="Lagrange Multipliers and Constrained Optimization Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#B95869] text-[#B95869] bg-[var(--bg-canvas)]">
              LAB 3.1.4 • LAGRANGE MULTIPLIERS &amp; CONSTRAINED TANGENCY
            </span>
            {activeState.isStationary && (
              <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#FBEAA4] text-[#FBEAA4] bg-[#FBEAA4]/15">
                ★ TANGENCY ALIGNED: ∇f = λ∇g
              </span>
            )}
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Constrained Optimization <KaTeXMath math="\nabla f(x,y) = \lambda\,\nabla g(x,y)" /> Along <KaTeXMath math="g(x,y) = c" />
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {LAGRANGE_PRESETS.map((p) => {
            const active = !isCustom && p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "border-[#B95869] bg-[#B95869]/15 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                {p.name.split(":")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Objective & Parametric Constraint Inputs */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] space-y-4">
        <MathExpressionInput
          label="Type Custom Objective Function f(x, y) to Maximize / Minimize:"
          prefixLatex="f(x,y) ="
          value={fExpr}
          onChange={(val) => {
            setFExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x", "y"]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className="block space-y-1">
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[#B95869] block">
              Constraint Curve <KaTeXMath math="x(t)" /> (t ∈ [{tMin.toFixed(1)}, {tMax.toFixed(2)}])
            </span>
            <input
              type="text"
              value={xParamExpr}
              onChange={(e) => {
                setXParamExpr(e.target.value);
                setIsCustom(true);
              }}
              className="w-full px-2.5 py-1.5 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#B95869]"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[#B95869] block">
              Constraint Curve <KaTeXMath math="y(t)" /> (t ∈ [{tMin.toFixed(1)}, {tMax.toFixed(2)}])
            </span>
            <input
              type="text"
              value={yParamExpr}
              onChange={(e) => {
                setYParamExpr(e.target.value);
                setIsCustom(true);
              }}
              className="w-full px-2.5 py-1.5 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#B95869]"
            />
          </label>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: 3D Constrained Ridge & Fence Viewport */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <ThreeOrbitViewport
            heightClassName="h-[390px] sm:h-[430px]"
            cameraPosition={[3.3, 2.5, 3.3]}
            cameraTarget={[0, 0.25, 0]}
            titleBadge="3D Objective Surface z = f(x,y) & Constrained Space Curve"
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[#B95869]">
                  (x(t), y(t)) = ({activeState.xc.toFixed(2)}, {activeState.yc.toFixed(2)})
                </span>
                <span className="text-[#FBEAA4] font-semibold">
                  Objective f = {activeState.f0.toFixed(3)}
                </span>
                <span className="text-[#96B898]">
                  df/ds = ∇f · T = {activeState.dfds.toFixed(3)}
                </span>
              </div>
            }
            sceneDeps={[compiledF, constraintAnalysis, activeState]}
            onBuildScene={(group) => {
              // 1. Objective surface z = f(x,y)
              const surfaceGroup = createParametricSurfaceMesh(
                (u, v) => {
                  const z = compiledF.evaluate({ x: u, y: v });
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
                  opacity: 0.5,
                  wireframeColor: 0x8d9fce,
                  wireframeOpacity: 0.14,
                  showWireframe: true,
                }
              );
              group.add(surfaceGroup);

              // 2. Floor constraint curve g(x,y) = c at z = 0 and 3D ridge curve at z = f(x(t),y(t))
              const ptsFloor: THREE.Vector3[] = [];
              const ptsRidge: THREE.Vector3[] = [];
              const curtainVerts: THREE.Vector3[] = [];

              const pts3D = constraintAnalysis.curvePts3D;
              for (let i = 0; i < pts3D.length; i++) {
                const [px, py, pz] = pts3D[i];
                ptsFloor.push(mathToThreeVec3(px, py, 0.01));
                ptsRidge.push(mathToThreeVec3(px, py, pz));

                if (i < pts3D.length - 1) {
                  const [nx, ny, nz] = pts3D[i + 1];
                  const fA = mathToThreeVec3(px, py, 0);
                  const fB = mathToThreeVec3(nx, ny, 0);
                  const rA = mathToThreeVec3(px, py, pz);
                  const rB = mathToThreeVec3(nx, ny, nz);
                  curtainVerts.push(fA, fB, rB, fA, rB, rA);
                }
              }

              if (ptsFloor.length > 1) {
                group.add(
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints(ptsFloor),
                    new THREE.LineBasicMaterial({ color: 0xb95869 })
                  )
                );
                group.add(
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints(ptsRidge),
                    new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                  )
                );
              }

              if (curtainVerts.length > 0) {
                const curtainGeom = new THREE.BufferGeometry().setFromPoints(
                  curtainVerts
                );
                curtainGeom.computeVertexNormals();
                group.add(
                  new THREE.Mesh(
                    curtainGeom,
                    new THREE.MeshBasicMaterial({
                      color: 0xb95869,
                      transparent: true,
                      opacity: 0.22,
                      side: THREE.DoubleSide,
                      depthWrite: false,
                    })
                  )
                );
              }

              // 3. Active Point Marker & Floor Gradient Vectors
              const { xc, yc, f0, fx, fy, gradMagnitude, nx, ny } = activeState;
              const z0 = Math.max(-3.5, Math.min(3.5, f0));

              const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.065, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xfbeaa4 })
              );
              sphere.position.copy(mathToThreeVec3(xc, yc, z0));
              group.add(sphere);

              const dropLine = new THREE.BufferGeometry().setFromPoints([
                mathToThreeVec3(xc, yc, 0),
                mathToThreeVec3(xc, yc, z0),
              ]);
              group.add(
                new THREE.Line(
                  dropLine,
                  new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                )
              );

              // Objective gradient ∇f (#D35323) and Constraint Normal N_g (#8D9FCE) on xy-plane
              if (gradMagnitude > 1e-5) {
                const gScale = 0.75;
                group.add(
                  createVectorArrow3D(
                    [xc, yc, 0.02],
                    [
                      (fx / gradMagnitude) * gScale,
                      (fy / gradMagnitude) * gScale,
                      0,
                    ],
                    0xd35323
                  )
                );
              }
              group.add(
                createVectorArrow3D(
                  [xc, yc, 0.02],
                  [nx * 0.65, ny * 0.65, 0],
                  0x8d9fce
                )
              );
            }}
          />

          {/* Symbolic Formulation Card */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
                LAGRANGE TANGENCY CONDITION AT ({activeState.xc.toFixed(2)}, {activeState.yc.toFixed(2)})
              </span>
              <span className="text-xs font-tabular-mono text-[#FBEAA4]">
                |sin θ| = {activeState.sinTheta.toFixed(3)}
              </span>
            </div>
            <div className="overflow-x-auto py-1">
              <KaTeXMath
                math={`\\underbrace{\\langle ${activeState.fx.toFixed(2)},\\; ${activeState.fy.toFixed(2)} \\rangle}_{\\color{#D35323}{\\nabla f}} \\approx \\underbrace{(${activeState.lambdaEst.toFixed(2)})}_{\\lambda_{\\text{proj}}} \\underbrace{\\langle ${activeState.nx.toFixed(2)},\\; ${activeState.ny.toFixed(2)} \\rangle}_{\\color{#8D9FCE}{\\hat{\\mathbf{N}}_g}}, \\qquad \\frac{df}{ds} = \\nabla f \\cdot \\hat{\\mathbf{T}} = \\color{#96B898}{${activeState.dfds.toFixed(3)}}`}
                block
              />
            </div>
            <p className="font-math-serif text-sm text-[var(--text-secondary)]">
              {isCustom
                ? "When the directional derivative along the constraint df/ds = ∇f · T vanishes, the level curve f(x,y) = k is tangent to the constraint curve and ∇f aligns parallel to the constraint normal N_g."
                : activePreset.note}
            </p>
          </div>
        </div>

        {/* Right: 2D Contour Tangency & Gradient Collinearity Inspector */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#B95869]" />
                2D Contour Tangency &amp; Gradient Alignment
              </span>
              <span className="text-xs font-tabular-mono text-[#FBEAA4]">
                k = f(x,y) = {activeState.f0.toFixed(3)}
              </span>
            </div>

            <SvgCoordinatePlane2D
              xRange={[bounds.xMin, bounds.xMax]}
              yRange={[bounds.yMin, bounds.yMax]}
              height={275}
              ariaLabel="2D Contour Tangency and Lagrange Multiplier Alignment Diagram"
            >
              {({ toSvgX, toSvgY }) => {
                const { xc, yc, fx, fy, gradMagnitude, nx, ny, tx, ty } =
                  activeState;

                const constraintPathD = constraintAnalysis.curvePts2D
                  .map(
                    ([px, py], idx) =>
                      `${idx === 0 ? "M" : "L"} ${toSvgX(px).toFixed(1)} ${toSvgY(py).toFixed(1)}`
                  )
                  .join(" ");

                const gLen = 0.72;
                const gxEnd =
                  gradMagnitude > 1e-5 ? xc + (fx / gradMagnitude) * gLen : xc;
                const gyEnd =
                  gradMagnitude > 1e-5 ? yc + (fy / gradMagnitude) * gLen : yc;

                const nxEnd = xc + nx * 0.62;
                const nyEnd = yc + ny * 0.62;

                const txEnd = xc + tx * 0.55;
                const tyEnd = yc + ty * 0.55;

                return (
                  <g>
                    {/* Background contours */}
                    {contours.bgSegs.map((segs, idx) => (
                      <g key={idx} opacity={0.32}>
                        {segs.map((seg, sIdx) => (
                          <line
                            key={sIdx}
                            x1={toSvgX(seg.x1)}
                            y1={toSvgY(seg.y1)}
                            x2={toSvgX(seg.x2)}
                            y2={toSvgY(seg.y2)}
                            stroke="#8D9FCE"
                            strokeWidth="1.1"
                          />
                        ))}
                      </g>
                    ))}

                    {/* Active Objective Level Curve f(x,y) = f(x(t), y(t)) (#FBEAA4) */}
                    {contours.activeSegs.map((seg, sIdx) => (
                      <line
                        key={sIdx}
                        x1={toSvgX(seg.x1)}
                        y1={toSvgY(seg.y1)}
                        x2={toSvgX(seg.x2)}
                        y2={toSvgY(seg.y2)}
                        stroke="#FBEAA4"
                        strokeWidth="2.3"
                      />
                    ))}

                    {/* Constraint Curve g(x,y) = c (#B95869 Crimson) */}
                    {constraintPathD && (
                      <path
                        d={constraintPathD}
                        fill="none"
                        stroke="#B95869"
                        strokeWidth="2.6"
                      />
                    )}

                    {/* Constraint Tangent Vector T (#96B898 Sage Green) */}
                    <line
                      x1={toSvgX(xc)}
                      y1={toSvgY(yc)}
                      x2={toSvgX(txEnd)}
                      y2={toSvgY(tyEnd)}
                      stroke="#96B898"
                      strokeWidth="2"
                      strokeDasharray="3 2"
                    />

                    {/* Constraint Normal Vector N_g ∝ ∇g (#8D9FCE Periwinkle) */}
                    <line
                      x1={toSvgX(xc)}
                      y1={toSvgY(yc)}
                      x2={toSvgX(nxEnd)}
                      y2={toSvgY(nyEnd)}
                      stroke="#8D9FCE"
                      strokeWidth="2.8"
                    />
                    <circle
                      cx={toSvgX(nxEnd)}
                      cy={toSvgY(nyEnd)}
                      r="4"
                      fill="#8D9FCE"
                    />

                    {/* Objective Gradient Vector ∇f (#D35323 Persimmon) */}
                    {gradMagnitude > 1e-5 && (
                      <>
                        <line
                          x1={toSvgX(xc)}
                          y1={toSvgY(yc)}
                          x2={toSvgX(gxEnd)}
                          y2={toSvgY(gyEnd)}
                          stroke="#D35323"
                          strokeWidth="3"
                        />
                        <circle
                          cx={toSvgX(gxEnd)}
                          cy={toSvgY(gyEnd)}
                          r="4.5"
                          fill="#D35323"
                        />
                      </>
                    )}

                    {/* Current Constrained Point (x(t), y(t)) */}
                    <circle
                      cx={toSvgX(xc)}
                      cy={toSvgY(yc)}
                      r="5.5"
                      fill="#FBEAA4"
                      stroke="#1E1F22"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>
          </div>

          {/* Parameter Scrubber + Quick-Snap Extrema Buttons */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="text-[#B95869] font-semibold">
                Walk Along Constraint Parameter t
              </span>
              <span className="text-[var(--text-primary)]">
                t = {safeT.toFixed(3)} rad
              </span>
            </div>
            <input
              type="range"
              min={tMin}
              max={tMax}
              step={(tMax - tMin) / 240}
              value={safeT}
              onChange={(e) => setParamT(parseFloat(e.target.value))}
              className="w-full accent-[#B95869]"
            />

            {/* Quick-Snap Extrema Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setParamT(constraintAnalysis.bestMaxT)}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-tabular-mono border border-[#FBEAA4] text-[#FBEAA4] bg-[var(--bg-panel)] hover:bg-[#FBEAA4]/15"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Snap to Max (f = {constraintAnalysis.bestMaxVal.toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => setParamT(constraintAnalysis.bestMinT)}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-tabular-mono border border-[#8D9FCE] text-[#8D9FCE] bg-[var(--bg-panel)] hover:bg-[#8D9FCE]/15"
              >
                <Target className="w-3.5 h-3.5" />
                Snap to Min (f = {constraintAnalysis.bestMinVal.toFixed(2)})
              </button>
            </div>
          </div>

          {/* Vector Legend & Numerical Telemetry */}
          <div className="grid grid-cols-3 gap-2 text-xs font-tabular-mono">
            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <span className="text-[#D35323] block text-[10px]">
                OBJECTIVE ∇f
              </span>
              <span className="text-[var(--text-primary)] font-semibold">
                ⟨{activeState.fx.toFixed(2)}, {activeState.fy.toFixed(2)}⟩
              </span>
            </div>
            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <span className="text-[#8D9FCE] block text-[10px]">
                NORMAL N_g ∝ ∇g
              </span>
              <span className="text-[var(--text-primary)] font-semibold">
                ⟨{activeState.nx.toFixed(2)}, {activeState.ny.toFixed(2)}⟩
              </span>
            </div>
            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <span className="text-[#96B898] block text-[10px]">
                TANGENT SLOPE df/ds
              </span>
              <span className="text-[#96B898] font-semibold">
                {activeState.dfds.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
