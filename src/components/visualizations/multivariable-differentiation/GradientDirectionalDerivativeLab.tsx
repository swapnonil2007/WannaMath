"use client";

import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Compass, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
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
import { getAdaptiveAccentInk } from "@/lib/accentInk";

interface GradientPreset {
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
  defaultAlphaDeg: number;
  gradFormulaLatex: string;
  note: string;
}

const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: "anisotropic-hill",
    name: "Anisotropic Elliptic Hill: f(x,y) = 1.6 - 0.3x² - 0.65y²",
    badge: "∇f = ⟨-0.6x, -1.3y⟩",
    expr: "1.6 - 0.3 * x^2 - 0.65 * y^2",
    xMinExpr: "-2",
    xMaxExpr: "2",
    yMinExpr: "-2",
    yMaxExpr: "2",
    defaultX0: 0.9,
    defaultY0: 0.65,
    defaultAlphaDeg: 215,
    gradFormulaLatex: "\\nabla f(x,y) = \\langle -0.60x,\\; -1.30y \\rangle",
    note: "Because the hill is steeper in y than in x, ∇f does not point straight toward the origin (except on the axes)—instead, it points strictly perpendicular to the elliptical level curve.",
  },
  {
    id: "saddle-pass",
    name: "Mountain Pass Saddle: f(x,y) = 0.45(x² - y²)",
    badge: "∇f = ⟨0.9x, -0.9y⟩",
    expr: "0.45 * (x^2 - y^2)",
    xMinExpr: "-2",
    xMaxExpr: "2",
    yMinExpr: "-2",
    yMaxExpr: "2",
    defaultX0: 0.85,
    defaultY0: 0.55,
    defaultAlphaDeg: 35,
    gradFormulaLatex: "\\nabla f(x,y) = \\langle 0.90x,\\; -0.90y \\rangle",
    note: "Rotating the vertical slicing plane around (x₀, y₀) sweeps D_u f smoothly from +‖∇f‖ (steepest ascent toward ±x ridge) through 0 (along the hyperbolic contour) to -‖∇f‖.",
  },
  {
    id: "tilted-ridge",
    name: "Tilted Ridge & Valley: f(x,y) = 0.7 sin(x + 0.6y) + 0.25x",
    badge: "Oblique Wavefront",
    expr: "0.7 * sin(x + 0.6 * y) + 0.25 * x",
    xMinExpr: "-2",
    xMaxExpr: "2",
    yMinExpr: "-2",
    yMaxExpr: "2",
    defaultX0: 0.3,
    defaultY0: 0.4,
    defaultAlphaDeg: 28,
    gradFormulaLatex:
      "\\nabla f(x,y) = \\langle 0.7\\cos(x+0.6y)+0.25,\\; 0.42\\cos(x+0.6y) \\rangle",
    note: "In wave propagation and heat conduction (q = -k∇T), flux always flows parallel to ∇f across the oblique wavefront contours.",
  },
  {
    id: "dipole-potential",
    name: "Electrostatic Dipole Field: f(x,y) = x · exp(-0.6(x² + y²))",
    badge: "Source-Sink Pair",
    expr: "x * exp(-0.6 * (x^2 + y^2))",
    xMinExpr: "-2",
    xMaxExpr: "2",
    yMinExpr: "-2",
    yMaxExpr: "2",
    defaultX0: 0.45,
    defaultY0: 0.6,
    defaultAlphaDeg: 310,
    gradFormulaLatex:
      "\\nabla f(x,y) = e^{-0.6(x^2+y^2)}\\langle 1 - 1.2x^2,\\; -1.2xy \\rangle",
    note: "Features a positive potential peak at x = +1/√1.2 and a negative basin at x = -1/√1.2. The electric field E = -∇f points orthogonally across equipotential contours.",
  },
];

export function GradientDirectionalDerivativeLab() {
  const [presetId, setPresetId] = useState<string>("anisotropic-hill");
  const [expr, setExpr] = useState<string>(GRADIENT_PRESETS[0].expr);
  const [xMinExpr, setXMinExpr] = useState<string>(GRADIENT_PRESETS[0].xMinExpr);
  const [xMaxExpr, setXMaxExpr] = useState<string>(GRADIENT_PRESETS[0].xMaxExpr);
  const [yMinExpr, setYMinExpr] = useState<string>(GRADIENT_PRESETS[0].yMinExpr);
  const [yMaxExpr, setYMaxExpr] = useState<string>(GRADIENT_PRESETS[0].yMaxExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [x0, setX0] = useState<number>(GRADIENT_PRESETS[0].defaultX0);
  const [y0, setY0] = useState<number>(GRADIENT_PRESETS[0].defaultY0);
  const [alphaDeg, setAlphaDeg] = useState<number>(
    GRADIENT_PRESETS[0].defaultAlphaDeg
  );

  const activePreset = useMemo(
    () => GRADIENT_PRESETS.find((p) => p.id === presetId) ?? GRADIENT_PRESETS[0],
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

  const handleSelectPreset = (p: GradientPreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setXMinExpr(p.xMinExpr);
    setXMaxExpr(p.xMaxExpr);
    setYMinExpr(p.yMinExpr);
    setYMaxExpr(p.yMaxExpr);
    setX0(p.defaultX0);
    setY0(p.defaultY0);
    setAlphaDeg(p.defaultAlphaDeg);
    setIsCustom(false);
  };

  // Gradient & Directional Derivative Calculation
  const directionalStats = useMemo(() => {
    const { f0, fx, fy, gradMagnitude } = computePartialDerivatives2D(
      (x, y) => compiledFn.evaluate({ x, y }),
      safeX0,
      safeY0
    );

    const alphaRad = (alphaDeg * Math.PI) / 180;
    const ux = Math.cos(alphaRad);
    const uy = Math.sin(alphaRad);

    const duf = fx * ux + fy * uy;
    const gradAngleRad = Math.atan2(fy, fx);
    const gradAngleDeg = ((gradAngleRad * 180) / Math.PI + 360) % 360;

    // Angle theta between grad f and u
    const cosTheta =
      gradMagnitude > 1e-8
        ? Math.max(-1, Math.min(1, duf / gradMagnitude))
        : 0;
    const thetaDeg = (Math.acos(cosTheta) * 180) / Math.PI;

    return {
      f0,
      fx,
      fy,
      gradMagnitude,
      ux,
      uy,
      duf,
      gradAngleDeg,
      thetaDeg,
      cosTheta,
    };
  }, [compiledFn, safeX0, safeY0, alphaDeg]);

  // Extract active contour passing through (x0, y0) plus background contours
  const contours = useMemo(() => {
    const activeSegs = extractLevelCurveSegments(
      (x, y) => compiledFn.evaluate({ x, y }),
      bounds.xMin,
      bounds.xMax,
      bounds.yMin,
      bounds.yMax,
      directionalStats.f0,
      42,
      42
    );

    const bgLevels = [-1.0, -0.5, 0.0, 0.5, 1.0, 1.3];
    const bgSegs = bgLevels.map((lv) =>
      extractLevelCurveSegments(
        (x, y) => compiledFn.evaluate({ x, y }),
        bounds.xMin,
        bounds.xMax,
        bounds.yMin,
        bounds.yMax,
        lv,
        32,
        32
      )
    );

    return { activeSegs, bgSegs };
  }, [compiledFn, bounds, directionalStats.f0]);

  return (
    <section
      aria-label="Gradient Vector and Directional Derivatives Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[var(--bg-canvas)]">
              LAB 3.1.3 • DIRECTIONAL DERIVATIVE &amp; GRADIENT COMPASS
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              {isCustom ? "Custom Equation" : activePreset.badge}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Directional Slicing <KaTeXMath math="D_{\mathbf{u}}f = \nabla f \cdot \mathbf{u} = \|\nabla f\|\cos\theta" /> &amp; Contour Orthogonality
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {GRADIENT_PRESETS.map((p) => {
            const active = !isCustom && p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "border-[var(--math-ink-sweep)] bg-[#D35323]/15 text-[var(--text-primary)] font-semibold"
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
          label="Type Any Custom Scalar Field z = f(x, y):"
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
                className="w-full px-2.5 py-1.5 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--math-ink-sweep)]"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: 3D Revolving Vertical Slice Stage */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <ThreeOrbitViewport
            heightClassName="h-[390px] sm:h-[430px]"
            cameraPosition={[3.3, 2.5, 3.2]}
            cameraTarget={[0, 0.3, 0]}
            titleBadge="3D Revolving Vertical Slice Along Unit Heading u"
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-sweep)]">
                  ‖∇f‖ = {directionalStats.gradMagnitude.toFixed(3)}
                </span>
                <span className="text-[var(--math-ink-x)]">
                  Heading α = {alphaDeg.toFixed(0)}° (θ = {directionalStats.thetaDeg.toFixed(1)}°)
                </span>
                <span className="text-[var(--math-ink-y)] font-semibold">
                  D_u f = {directionalStats.duf.toFixed(3)}
                </span>
              </div>
            }
            sceneDeps={[
              compiledFn,
              bounds,
              safeX0,
              safeY0,
              alphaDeg,
              directionalStats,
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

              if (!Number.isFinite(directionalStats.f0)) return;
              const z0 = Math.max(-3.5, Math.min(3.5, directionalStats.f0));
              const { ux, uy, duf, fx, fy, gradMagnitude } = directionalStats;

              // 2. Vertical slicing plane along direction u through (safeX0, safeY0)
              const sMax = 1.35;
              const zLow = -1.2;
              const zHigh = 2.0;
              const pA = mathToThreeVec3(
                safeX0 - sMax * ux,
                safeY0 - sMax * uy,
                zLow
              );
              const pB = mathToThreeVec3(
                safeX0 + sMax * ux,
                safeY0 + sMax * uy,
                zLow
              );
              const pC = mathToThreeVec3(
                safeX0 + sMax * ux,
                safeY0 + sMax * uy,
                zHigh
              );
              const pD = mathToThreeVec3(
                safeX0 - sMax * ux,
                safeY0 - sMax * uy,
                zHigh
              );

              const sliceGeom = new THREE.BufferGeometry().setFromPoints([
                pA,
                pB,
                pC,
                pA,
                pC,
                pD,
              ]);
              sliceGeom.computeVertexNormals();
              group.add(
                new THREE.Mesh(
                  sliceGeom,
                  new THREE.MeshBasicMaterial({
                    color: 0x8d9fce,
                    transparent: true,
                    opacity: 0.18,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                  })
                )
              );

              // 3. Directional slice curve z(s) = f(x0 + s*ux, y0 + s*uy)
              const curvePts: THREE.Vector3[] = [];
              const N = 60;
              for (let i = 0; i <= N; i++) {
                const s = -sMax + (i / N) * (2 * sMax);
                const px = safeX0 + s * ux;
                const py = safeY0 + s * uy;
                if (
                  px >= bounds.xMin &&
                  px <= bounds.xMax &&
                  py >= bounds.yMin &&
                  py <= bounds.yMax
                ) {
                  const zv = compiledFn.evaluate({ x: px, y: py });
                  if (Number.isFinite(zv)) {
                    curvePts.push(
                      mathToThreeVec3(
                        px,
                        py,
                        Math.max(-3.5, Math.min(3.5, zv))
                      )
                    );
                  }
                }
              }
              if (curvePts.length > 1) {
                group.add(
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints(curvePts),
                    new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                  )
                );
              }

              // 4. 3D Directional Tangent Vector <ux, uy, D_u f> in #96B898 Sage Green
              const scaleT = 0.7;
              group.add(
                createVectorArrow3D(
                  [safeX0, safeY0, z0],
                  [ux * scaleT, uy * scaleT, duf * scaleT],
                  0x96b898
                )
              );

              // 5. Floor vectors at z = 0: unit vector u (#8D9FCE) and Gradient ∇f (#D35323)
              group.add(
                createVectorArrow3D(
                  [safeX0, safeY0, 0.01],
                  [ux * 0.75, uy * 0.75, 0],
                  0x8d9fce
                )
              );

              if (gradMagnitude > 1e-5) {
                const gScale = Math.min(1.1, Math.max(0.35, gradMagnitude * 0.6));
                group.add(
                  createVectorArrow3D(
                    [safeX0, safeY0, 0.01],
                    [
                      (fx / gradMagnitude) * gScale,
                      (fy / gradMagnitude) * gScale,
                      0,
                    ],
                    0xd35323
                  )
                );
              }

              // 6. Marker on surface
              const marker = new THREE.Mesh(
                new THREE.SphereGeometry(0.06, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xfbeaa4 })
              );
              marker.position.copy(mathToThreeVec3(safeX0, safeY0, z0));
              group.add(marker);
            }}
          />

          {/* Symbolic Formulation Card */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
                DOT PRODUCT DECOMPOSITION AT ({safeX0.toFixed(2)}, {safeY0.toFixed(2)})
              </span>
              <span className="text-xs font-tabular-mono text-[var(--math-ink-y)]">
                cos θ = {directionalStats.cosTheta.toFixed(3)}
              </span>
            </div>
            <div className="overflow-x-auto py-1">
              <KaTeXMath
                math={`D_{\\mathbf{u}}f = \\underbrace{\\langle ${directionalStats.fx.toFixed(2)},\\; ${directionalStats.fy.toFixed(2)} \\rangle}_{\\color{#D35323}{\\nabla f(x_0,y_0)}} \\cdot \\underbrace{\\langle ${directionalStats.ux.toFixed(2)},\\; ${directionalStats.uy.toFixed(2)} \\rangle}_{\\color{#8D9FCE}{\\mathbf{u}}} = \\|\\nabla f\\|\\cos(${directionalStats.thetaDeg.toFixed(1)}^\\circ) = \\color{#96B898}{${directionalStats.duf.toFixed(3)}}`}
                block
              />
            </div>
            <p className="font-math-serif text-sm text-[var(--text-secondary)]">
              {isCustom
                ? "Because D_u f = ‖∇f‖ cos θ, directional slope is maximized when u aligns with ∇f (θ = 0°) and equals zero when u is tangent to the level curve (θ = 90°)."
                : activePreset.note}
            </p>
          </div>
        </div>

        {/* Right: 2D Contour & Gradient Compass + Heading Controls */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[var(--math-ink-sweep)]" />
                2D Contour &amp; Gradient Compass (Click to Move Point)
              </span>
              <span className="text-xs font-tabular-mono text-[var(--math-ink-sweep)]">
                θ = {directionalStats.thetaDeg.toFixed(1)}°
              </span>
            </div>

            <SvgCoordinatePlane2D
              xRange={[bounds.xMin, bounds.xMax]}
              yRange={[bounds.yMin, bounds.yMax]}
              height={275}
              ariaLabel="2D Contour Map with Gradient Vector and Unit Direction Compass"
              onSelectPoint={(wx, wy) => {
                setX0(wx);
                setY0(wy);
              }}
            >
              {({ toSvgX, toSvgY }) => {
                const { fx, fy, gradMagnitude, ux, uy } = directionalStats;
                const gLen =
                  gradMagnitude > 1e-5
                    ? Math.min(0.95, Math.max(0.4, gradMagnitude * 0.5))
                    : 0;
                const gxEnd =
                  gradMagnitude > 1e-5
                    ? safeX0 + (fx / gradMagnitude) * gLen
                    : safeX0;
                const gyEnd =
                  gradMagnitude > 1e-5
                    ? safeY0 + (fy / gradMagnitude) * gLen
                    : safeY0;

                const uxEnd = safeX0 + ux * 0.78;
                const uyEnd = safeY0 + uy * 0.78;

                return (
                  <g>
                    {/* Background contours */}
                    {contours.bgSegs.map((segs, idx) => (
                      <g key={idx} opacity={0.35}>
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

                    {/* Active level curve passing through (x0, y0) */}
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

                    {/* Unit Heading Vector u (#8D9FCE Periwinkle) */}
                    <line
                      x1={toSvgX(safeX0)}
                      y1={toSvgY(safeY0)}
                      x2={toSvgX(uxEnd)}
                      y2={toSvgY(uyEnd)}
                      stroke="#8D9FCE"
                      strokeWidth="2.8"
                    />
                    <circle
                      cx={toSvgX(uxEnd)}
                      cy={toSvgY(uyEnd)}
                      r="4"
                      fill="#8D9FCE"
                    />

                    {/* Gradient Vector ∇f (#D35323 Persimmon) */}
                    {gradMagnitude > 1e-5 && (
                      <>
                        <line
                          x1={toSvgX(safeX0)}
                          y1={toSvgY(safeY0)}
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

                    {/* Center Point (x0, y0) */}
                    <circle
                      cx={toSvgX(safeX0)}
                      cy={toSvgY(safeY0)}
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

          {/* Quick-Snap Alignment Buttons + Compass Slider */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="text-[var(--math-ink-x)] font-semibold">
                Unit Heading Angle α (u = ⟨cos α, sin α⟩)
              </span>
              <span className="text-[var(--text-primary)]">
                α = {alphaDeg.toFixed(0)}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={alphaDeg}
              onChange={(e) => setAlphaDeg(parseFloat(e.target.value))}
              className="w-full accent-[#8D9FCE]"
              aria-label="Unit heading angle α (degrees)"
            />

            {/* Quick-Snap Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  setAlphaDeg(Math.round(directionalStats.gradAngleDeg) % 360)
                }
                className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-tabular-mono border border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[var(--bg-panel)] hover:bg-[#D35323]/15"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Steepest +‖∇f‖
              </button>
              <button
                type="button"
                onClick={() =>
                  setAlphaDeg(
                    Math.round(directionalStats.gradAngleDeg + 90) % 360
                  )
                }
                className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-tabular-mono border border-[var(--math-ink-diff)] text-[var(--math-ink-diff)] bg-[var(--bg-panel)] hover:bg-[#FBEAA4]/15"
              >
                <Minus className="w-3.5 h-3.5" />
                Contour (D_u=0)
              </button>
              <button
                type="button"
                onClick={() =>
                  setAlphaDeg(
                    Math.round(directionalStats.gradAngleDeg + 180) % 360
                  )
                }
                className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-tabular-mono border border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[var(--bg-panel)] hover:bg-[#96B898]/15"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                Descent -‖∇f‖
              </button>
            </div>

            {/* Probe Point Sliders */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-subtle)]">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--math-ink-x)]">
                  <span>Point x₀</span>
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
                  aria-label="Evaluation point x₀"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--math-ink-y)]">
                  <span>Point y₀</span>
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
                  aria-label="Evaluation point y₀"
                />
              </div>
            </div>
          </div>

          {/* Telemetry Readout */}
          <div className="grid grid-cols-3 gap-2 text-xs font-tabular-mono">
            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <span className="text-[var(--math-ink-sweep)] block text-[10px]">
                GRADIENT ∇f
              </span>
              <span className="text-[var(--text-primary)] font-semibold">
                ⟨{directionalStats.fx.toFixed(2)}, {directionalStats.fy.toFixed(2)}⟩
              </span>
            </div>
            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <span className="text-[var(--math-ink-x)] block text-[10px]">
                HEADING u
              </span>
              <span className="text-[var(--text-primary)] font-semibold">
                ⟨{directionalStats.ux.toFixed(2)}, {directionalStats.uy.toFixed(2)}⟩
              </span>
            </div>
            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <span className="text-[var(--math-ink-y)] block text-[10px]">
                SLOPE D_u f
              </span>
              <span className="text-[var(--math-ink-y)] font-semibold">
                {directionalStats.duf.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
