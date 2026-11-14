"use client";

import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Layers, Eye } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  mathToThreeVec3,
  createParametricSurfaceMesh,
  extractLevelCurveSegments,
} from "@/components/visualizations/primitives";
import { getAdaptiveAccentInk } from "@/lib/accentInk";

interface SurfacePreset {
  id: string;
  name: string;
  badge: string;
  expr: string;
  xMinExpr: string;
  xMaxExpr: string;
  yMinExpr: string;
  yMaxExpr: string;
  defaultK: number;
  symbolicLatex: string;
  contourFamilyLatex: string;
  note: string;
}

const SURFACE_PRESETS: SurfacePreset[] = [
  {
    id: "elliptic-paraboloid",
    name: "Elliptic Paraboloid: z = 1.6 - 0.35(x² + 1.5y²)",
    badge: "Elliptical Contours",
    expr: "1.6 - 0.35 * (x^2 + 1.5 * y^2)",
    xMinExpr: "-2",
    xMaxExpr: "2",
    yMinExpr: "-2",
    yMaxExpr: "2",
    defaultK: 0.75,
    symbolicLatex: "z = f(x,y) = 1.6 - 0.35(x^2 + 1.5y^2)",
    contourFamilyLatex:
      "f(x,y) = k \\iff 0.35x^2 + 0.525y^2 = 1.6 - k \\quad (k \\le 1.6)",
    note: "Horizontal slices z = k produce nested concentric ellipses around the global summit (0, 0, 1.6). Vertical slices x = x₀ or y = y₀ are downward-opening parabolas.",
  },
  {
    id: "hyperbolic-saddle",
    name: "Hyperbolic Paraboloid (Saddle): z = 0.4(x² - y²)",
    badge: "Hyperbolic Contours",
    expr: "0.4 * (x^2 - y^2)",
    xMinExpr: "-2",
    xMaxExpr: "2",
    yMinExpr: "-2",
    yMaxExpr: "2",
    defaultK: 0.25,
    symbolicLatex: "z = f(x,y) = 0.4(x^2 - y^2)",
    contourFamilyLatex:
      "0.4(x^2 - y^2) = k \\quad (\\text{lines } y = \\pm x \\text{ at } k = 0)",
    note: "At k > 0, level curves are hyperbolas opening along ±x; at k < 0, hyperbolas opening along ±y; at the saddle altitude k = 0, the level curve degenerates into intersecting lines y = ±x.",
  },
  {
    id: "sombrero-wave",
    name: "Standing Wave Potential: z = 0.9 cos(1.3x) cos(1.3y)",
    badge: "Periodic Cells",
    expr: "0.9 * cos(1.3 * x) * cos(1.3 * y)",
    xMinExpr: "-2",
    xMaxExpr: "2",
    yMinExpr: "-2",
    yMaxExpr: "2",
    defaultK: 0.35,
    symbolicLatex: "z = f(x,y) = 0.9\\cos(1.3x)\\cos(1.3y)",
    contourFamilyLatex:
      "0.9\\cos(1.3x)\\cos(1.3y) = k \\quad (k \\in [-0.9, 0.9])",
    note: "Models a 2D acoustic cavity or waveguide mode. Closed contours surround alternating hills (k > 0) and basins (k < 0), separated by a rectangular nodal grid at k = 0.",
  },
  {
    id: "conical-well",
    name: "Invertible Conical Funnel: z = 1.6 - 0.75 √(x² + y²)",
    badge: "Uniform Slope Spacing",
    expr: "1.6 - 0.75 * sqrt(x^2 + y^2)",
    xMinExpr: "-2",
    xMaxExpr: "2",
    yMinExpr: "-2",
    yMaxExpr: "2",
    defaultK: 0.65,
    symbolicLatex: "z = f(x,y) = 1.6 - 0.75\\sqrt{x^2 + y^2}",
    contourFamilyLatex:
      "\\sqrt{x^2 + y^2} = \\frac{1.6 - k}{0.75} \\quad (\\text{equally spaced circles})",
    note: "Because a cone has constant radial slope |∂f/∂r| = 0.75 everywhere except the apex, equally spaced altitude increments Δk produce equally spaced concentric circles on the contour map.",
  },
];

export function SurfaceContourSlicerLab() {
  const [presetId, setPresetId] = useState<string>("elliptic-paraboloid");
  const [expr, setExpr] = useState<string>(SURFACE_PRESETS[0].expr);
  const [xMinExpr, setXMinExpr] = useState<string>(SURFACE_PRESETS[0].xMinExpr);
  const [xMaxExpr, setXMaxExpr] = useState<string>(SURFACE_PRESETS[0].xMaxExpr);
  const [yMinExpr, setYMinExpr] = useState<string>(SURFACE_PRESETS[0].yMinExpr);
  const [yMaxExpr, setYMaxExpr] = useState<string>(SURFACE_PRESETS[0].yMaxExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [levelK, setLevelK] = useState<number>(SURFACE_PRESETS[0].defaultK);
  const [showVerticalTrace, setShowVerticalTrace] = useState<boolean>(true);
  const [traceAxis, setTraceAxis] = useState<"x" | "y">("x");
  const [probeX, setProbeX] = useState<number>(0.6);
  const [probeY, setProbeY] = useState<number>(0.4);

  const activePreset = useMemo(
    () => SURFACE_PRESETS.find((p) => p.id === presetId) ?? SURFACE_PRESETS[0],
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

  const handleSelectPreset = (p: SurfacePreset) => {
    setPresetId(p.id);
    setExpr(p.expr);
    setXMinExpr(p.xMinExpr);
    setXMaxExpr(p.xMaxExpr);
    setYMinExpr(p.yMinExpr);
    setYMaxExpr(p.yMaxExpr);
    setLevelK(p.defaultK);
    setIsCustom(false);
  };

  // Sample z-range over domain for contour levels and slider range
  const zRange = useMemo(() => {
    let zMin = Infinity;
    let zMax = -Infinity;
    const N = 24;
    for (let i = 0; i <= N; i++) {
      const x = bounds.xMin + (i / N) * (bounds.xMax - bounds.xMin);
      for (let j = 0; j <= N; j++) {
        const y = bounds.yMin + (j / N) * (bounds.yMax - bounds.yMin);
        const z = compiledFn.evaluate({ x, y });
        if (Number.isFinite(z)) {
          const clamped = Math.max(-4, Math.min(4, z));
          if (clamped < zMin) zMin = clamped;
          if (clamped > zMax) zMax = clamped;
        }
      }
    }
    if (!Number.isFinite(zMin) || !Number.isFinite(zMax) || zMax - zMin < 0.1) {
      return { zMin: -1.5, zMax: 1.5 };
    }
    return { zMin, zMax };
  }, [compiledFn, bounds]);

  const safeK = Math.max(zRange.zMin, Math.min(zRange.zMax, levelK));
  const safeProbeX = Math.max(bounds.xMin, Math.min(bounds.xMax, probeX));
  const safeProbeY = Math.max(bounds.yMin, Math.min(bounds.yMax, probeY));
  const probeZ = compiledFn.evaluate({ x: safeProbeX, y: safeProbeY });

  // Background family of 7 topographic contour levels + active level safeK
  const contourLevels = useMemo(() => {
    const count = 7;
    const span = zRange.zMax - zRange.zMin;
    const levels: { level: number; segments: ReturnType<typeof extractLevelCurveSegments> }[] = [];
    for (let m = 1; m <= count; m++) {
      const lv = zRange.zMin + (m / (count + 1)) * span;
      levels.push({
        level: lv,
        segments: extractLevelCurveSegments(
          (x, y) => compiledFn.evaluate({ x, y }),
          bounds.xMin,
          bounds.xMax,
          bounds.yMin,
          bounds.yMax,
          lv,
          36,
          36
        ),
      });
    }
    return levels;
  }, [compiledFn, bounds, zRange]);

  const activeContourSegments = useMemo(() => {
    return extractLevelCurveSegments(
      (x, y) => compiledFn.evaluate({ x, y }),
      bounds.xMin,
      bounds.xMax,
      bounds.yMin,
      bounds.yMax,
      safeK,
      44,
      44
    );
  }, [compiledFn, bounds, safeK]);

  return (
    <section
      aria-label="Surfaces, Level Curves and Contour Maps Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-x)] text-[var(--math-ink-x)] bg-[var(--bg-canvas)]">
              LAB 3.1.1 • 3D SURFACE &amp; 2D CONTOUR SYNCHRONIZER
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              {isCustom ? "Custom Equation" : activePreset.badge}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Horizontal Level Curves <KaTeXMath math="f(x,y) = k" /> &amp; Vertical Coordinate Traces
          </h2>
        </div>

        {/* Preset Selector Pills */}
        <div className="flex flex-wrap gap-1.5">
          {SURFACE_PRESETS.map((p) => {
            const active = !isCustom && p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/15 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                {p.name.split(":")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Equation & Domain Bound Controls */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] space-y-4">
        <MathExpressionInput
          label="Type Any Custom Scalar Surface z = f(x, y):"
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
                className="w-full px-2.5 py-1.5 text-xs font-tabular-mono bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--math-ink-x)]"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Main Split View: 3D Surface Slicer + 2D Contour Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: 3D Interactive WebGL Stage */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <ThreeOrbitViewport
            heightClassName="h-[390px] sm:h-[430px]"
            cameraPosition={[3.3, 2.5, 3.3]}
            cameraTarget={[0, 0.25, 0]}
            titleBadge="3D Surface z = f(x,y) & Slicing Plane z = k"
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-sweep)]">
                  Active Level Plane: z = k = {safeK.toFixed(3)}
                </span>
                <span className="text-[var(--math-ink-x)]">
                  Probe (x₀, y₀) = ({safeProbeX.toFixed(2)}, {safeProbeY.toFixed(2)})
                </span>
                <span className="text-[var(--math-ink-diff)]">
                  f(x₀, y₀) = {Number.isFinite(probeZ) ? probeZ.toFixed(3) : "undef"}
                </span>
              </div>
            }
            sceneDeps={[
              compiledFn,
              bounds,
              safeK,
              showVerticalTrace,
              traceAxis,
              safeProbeX,
              safeProbeY,
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
                40,
                40,
                {
                  color: 0x029091,
                  opacity: 0.62,
                  wireframeColor: 0x8d9fce,
                  wireframeOpacity: 0.18,
                  showWireframe: true,
                }
              );
              group.add(surfaceGroup);

              // 2. Horizontal slicing plane z = k (#D35323 Persimmon)
              const planeCorners = [
                mathToThreeVec3(bounds.xMin, bounds.yMin, safeK),
                mathToThreeVec3(bounds.xMax, bounds.yMin, safeK),
                mathToThreeVec3(bounds.xMax, bounds.yMax, safeK),
                mathToThreeVec3(bounds.xMin, bounds.yMax, safeK),
              ];
              const planeGeom = new THREE.BufferGeometry();
              planeGeom.setFromPoints([
                planeCorners[0],
                planeCorners[1],
                planeCorners[2],
                planeCorners[0],
                planeCorners[2],
                planeCorners[3],
              ]);
              planeGeom.computeVertexNormals();
              const planeMesh = new THREE.Mesh(
                planeGeom,
                new THREE.MeshBasicMaterial({
                  color: 0xd35323,
                  transparent: true,
                  opacity: 0.18,
                  side: THREE.DoubleSide,
                  depthWrite: false,
                })
              );
              group.add(planeMesh);

              const rimGeom = new THREE.BufferGeometry().setFromPoints([
                ...planeCorners,
                planeCorners[0],
              ]);
              group.add(
                new THREE.Line(
                  rimGeom,
                  new THREE.LineBasicMaterial({ color: 0xd35323 })
                )
              );

              // 3. Active 3D level curve segments at altitude z = k AND projected onto z = 0
              if (activeContourSegments.length > 0) {
                const curvePts3D: THREE.Vector3[] = [];
                const curvePtsFloor: THREE.Vector3[] = [];
                for (const seg of activeContourSegments) {
                  curvePts3D.push(
                    mathToThreeVec3(seg.x1, seg.y1, safeK),
                    mathToThreeVec3(seg.x2, seg.y2, safeK)
                  );
                  curvePtsFloor.push(
                    mathToThreeVec3(seg.x1, seg.y1, 0.005),
                    mathToThreeVec3(seg.x2, seg.y2, 0.005)
                  );
                }
                const seg3DGeom = new THREE.BufferGeometry().setFromPoints(
                  curvePts3D
                );
                group.add(
                  new THREE.LineSegments(
                    seg3DGeom,
                    new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                  )
                );

                const segFloorGeom = new THREE.BufferGeometry().setFromPoints(
                  curvePtsFloor
                );
                group.add(
                  new THREE.LineSegments(
                    segFloorGeom,
                    new THREE.LineBasicMaterial({ color: 0xd35323 })
                  )
                );
              }

              // 4. Optional vertical cross-section trace (x = x0 or y = y0)
              if (showVerticalTrace) {
                const tracePts: THREE.Vector3[] = [];
                const samples = 60;
                if (traceAxis === "x") {
                  for (let i = 0; i <= samples; i++) {
                    const y =
                      bounds.yMin +
                      (i / samples) * (bounds.yMax - bounds.yMin);
                    const z = compiledFn.evaluate({ x: safeProbeX, y });
                    if (Number.isFinite(z)) {
                      tracePts.push(
                        mathToThreeVec3(
                          safeProbeX,
                          y,
                          Math.max(-3.5, Math.min(3.5, z))
                        )
                      );
                    }
                  }
                  if (tracePts.length > 1) {
                    group.add(
                      new THREE.Line(
                        new THREE.BufferGeometry().setFromPoints(tracePts),
                        new THREE.LineBasicMaterial({ color: 0x8d9fce })
                      )
                    );
                  }
                } else {
                  for (let i = 0; i <= samples; i++) {
                    const x =
                      bounds.xMin +
                      (i / samples) * (bounds.xMax - bounds.xMin);
                    const z = compiledFn.evaluate({ x, y: safeProbeY });
                    if (Number.isFinite(z)) {
                      tracePts.push(
                        mathToThreeVec3(
                          x,
                          safeProbeY,
                          Math.max(-3.5, Math.min(3.5, z))
                        )
                      );
                    }
                  }
                  if (tracePts.length > 1) {
                    group.add(
                      new THREE.Line(
                        new THREE.BufferGeometry().setFromPoints(tracePts),
                        new THREE.LineBasicMaterial({ color: 0x96b898 })
                      )
                    );
                  }
                }
              }

              // 5. Probe marker on surface and drop-line to xy-plane
              if (Number.isFinite(probeZ)) {
                const clampedPZ = Math.max(-3.5, Math.min(3.5, probeZ));
                const sphereGeom = new THREE.SphereGeometry(0.06, 16, 16);
                const sphereMat = new THREE.MeshBasicMaterial({
                  color: 0xfbeaa4,
                });
                const marker = new THREE.Mesh(sphereGeom, sphereMat);
                marker.position.copy(
                  mathToThreeVec3(safeProbeX, safeProbeY, clampedPZ)
                );
                group.add(marker);

                const dropGeom = new THREE.BufferGeometry().setFromPoints([
                  mathToThreeVec3(safeProbeX, safeProbeY, 0),
                  mathToThreeVec3(safeProbeX, safeProbeY, clampedPZ),
                ]);
                group.add(
                  new THREE.Line(
                    dropGeom,
                    new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                  )
                );
              }
            }}
          />

          {/* Symbolic Formulation Card */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
                ACTIVE LEVEL SET FORMULATION
              </span>
              <span className="text-xs font-tabular-mono text-[var(--math-ink-sweep)]">
                Altitude k = {safeK.toFixed(3)}
              </span>
            </div>
            <div className="overflow-x-auto py-1">
              <KaTeXMath
                math={`C_{${safeK.toFixed(2)}} = \\left\\{(x,y) \\in [${bounds.xMin.toFixed(1)}, ${bounds.xMax.toFixed(1)}] \\times [${bounds.yMin.toFixed(1)}, ${bounds.yMax.toFixed(1)}] : ${compiledFn.tex} = ${safeK.toFixed(2)}\\right\\}`}
                block
              />
            </div>
            <p className="font-math-serif text-sm text-[var(--text-secondary)]">
              {isCustom
                ? "Scrub the horizontal plane z = k or click anywhere on the 2D contour map to snap the plane to that point's elevation k = f(x₀, y₀)."
                : activePreset.note}
            </p>
          </div>
        </div>

        {/* Right: 2D Topographic Contour Map + Interactive Slicer Controls */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--math-ink-sweep)]" />
                2D Topographic Contour Map (Click to Probe)
              </span>
              <span className="text-xs font-tabular-mono text-[var(--math-ink-sweep)]">
                f(x,y) = {safeK.toFixed(2)}
              </span>
            </div>

            <SvgCoordinatePlane2D
              xRange={[bounds.xMin, bounds.xMax]}
              yRange={[bounds.yMin, bounds.yMax]}
              height={280}
              ariaLabel="2D Topographic Contour Map of f(x,y) = k"
              onSelectPoint={(wx, wy) => {
                setProbeX(wx);
                setProbeY(wy);
                const zVal = compiledFn.evaluate({ x: wx, y: wy });
                if (Number.isFinite(zVal)) {
                  setLevelK(Math.max(zRange.zMin, Math.min(zRange.zMax, zVal)));
                }
              }}
            >
              {({ toSvgX, toSvgY }) => (
                <g>
                  {/* Background contour family */}
                  {contourLevels.map((lv, idx) => (
                    <g key={idx} opacity={0.48}>
                      {lv.segments.map((seg, sIdx) => (
                        <line
                          key={sIdx}
                          x1={toSvgX(seg.x1)}
                          y1={toSvgY(seg.y1)}
                          x2={toSvgX(seg.x2)}
                          y2={toSvgY(seg.y2)}
                          stroke="#8D9FCE"
                          strokeWidth="1.2"
                        />
                      ))}
                    </g>
                  ))}

                  {/* Vertical trace line indicator */}
                  {showVerticalTrace &&
                    (traceAxis === "x" ? (
                      <line
                        x1={toSvgX(safeProbeX)}
                        y1={toSvgY(bounds.yMin)}
                        x2={toSvgX(safeProbeX)}
                        y2={toSvgY(bounds.yMax)}
                        stroke="#8D9FCE"
                        strokeDasharray="4 3"
                        strokeWidth="1.5"
                      />
                    ) : (
                      <line
                        x1={toSvgX(bounds.xMin)}
                        y1={toSvgY(safeProbeY)}
                        x2={toSvgX(bounds.xMax)}
                        y2={toSvgY(safeProbeY)}
                        stroke="#96B898"
                        strokeDasharray="4 3"
                        strokeWidth="1.5"
                      />
                    ))}

                  {/* Highlighted Active Level Curve f(x,y) = k */}
                  {activeContourSegments.map((seg, sIdx) => (
                    <line
                      key={sIdx}
                      x1={toSvgX(seg.x1)}
                      y1={toSvgY(seg.y1)}
                      x2={toSvgX(seg.x2)}
                      y2={toSvgY(seg.y2)}
                      stroke="#D35323"
                      strokeWidth="2.6"
                    />
                  ))}

                  {/* Probe Point Marker (x0, y0) */}
                  <circle
                    cx={toSvgX(safeProbeX)}
                    cy={toSvgY(safeProbeY)}
                    r="5.5"
                    fill="#FBEAA4"
                    stroke="#1E1F22"
                    strokeWidth="1.5"
                  />
                </g>
              )}
            </SvgCoordinatePlane2D>
          </div>

          {/* Altitude Slicer Slider z = k */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="text-[var(--math-ink-sweep)] font-semibold">
                Horizontal Slicing Altitude z = k
              </span>
              <span className="text-[var(--text-primary)]">
                k = {safeK.toFixed(3)} ∈ [{zRange.zMin.toFixed(2)}, {zRange.zMax.toFixed(2)}]
              </span>
            </div>
            <input
              type="range"
              min={zRange.zMin}
              max={zRange.zMax}
              step={(zRange.zMax - zRange.zMin) / 120}
              value={safeK}
              onChange={(e) => setLevelK(parseFloat(e.target.value))}
              className="w-full accent-[#D35323]"
              aria-label="Horizontal slicing altitude z = k"
            />

            {/* Probe Coordinate Sliders */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-subtle)]">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--math-ink-x)]">
                  <span>Probe x₀</span>
                  <span>{safeProbeX.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={bounds.xMin}
                  max={bounds.xMax}
                  step={(bounds.xMax - bounds.xMin) / 100}
                  value={safeProbeX}
                  onChange={(e) => setProbeX(parseFloat(e.target.value))}
                  className="w-full accent-[#8D9FCE]"
                  aria-label="Probe coordinate x₀"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-tabular-mono text-[var(--math-ink-y)]">
                  <span>Probe y₀</span>
                  <span>{safeProbeY.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={bounds.yMin}
                  max={bounds.yMax}
                  step={(bounds.yMax - bounds.yMin) / 100}
                  value={safeProbeY}
                  onChange={(e) => setProbeY(parseFloat(e.target.value))}
                  className="w-full accent-[#96B898]"
                  aria-label="Probe coordinate y₀"
                />
              </div>
            </div>

            {/* Vertical Cross-Section Trace Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setShowVerticalTrace((v) => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-tabular-mono border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)]"
              >
                <Eye className="w-3.5 h-3.5 text-[var(--math-ink-x)]" />
                {showVerticalTrace ? "Hide Vertical Trace" : "Show Vertical Trace"}
              </button>

              {showVerticalTrace && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTraceAxis("x")}
                    className={`px-2 py-1 text-xs font-tabular-mono border ${
                      traceAxis === "x"
                        ? "border-[var(--math-ink-x)] text-[var(--math-ink-x)] bg-[#8D9FCE]/15"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                    }`}
                  >
                    Fix x = x₀
                  </button>
                  <button
                    type="button"
                    onClick={() => setTraceAxis("y")}
                    className={`px-2 py-1 text-xs font-tabular-mono border ${
                      traceAxis === "y"
                        ? "border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[#96B898]/15"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                    }`}
                  >
                    Fix y = y₀
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 1D Vertical Trace Cross-Section Preview */}
          <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span
                style={{
                  color: traceAxis === "x" ? "#8D9FCE" : "#96B898",
                }}
              >
                {traceAxis === "x"
                  ? `Vertical Trace z = f(${safeProbeX.toFixed(2)}, y)`
                  : `Vertical Trace z = f(x, ${safeProbeY.toFixed(2)})`}
              </span>
              <span className="text-[var(--math-ink-diff)]">
                z(x₀, y₀) = {Number.isFinite(probeZ) ? probeZ.toFixed(3) : "—"}
              </span>
            </div>
            {!isCustom && (
              <div className="text-xs overflow-x-auto pt-1">
                <KaTeXMath math={activePreset.contourFamilyLatex} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
