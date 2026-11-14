"use client";

import React, { useState, useMemo, useEffect } from "react";
import { RotateCcw, Play, Pause, Maximize2 } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import { computeJacobian2D } from "@/components/visualizations/primitives/core2d";

interface TransformPreset {
  id: string;
  name: string;
  badge: string;
  xExpr: string;
  yExpr: string;
  uMinExpr: string;
  uMaxExpr: string;
  vMinExpr: string;
  vMaxExpr: string;
  symbolicLatex: string;
  jacobianFormulaLatex: string;
  engineeringNote: string;
  defaultU0: number;
  defaultV0: number;
  defaultDu: number;
  defaultDv: number;
}

const TRANSFORM_PRESETS: TransformPreset[] = [
  {
    id: "polar",
    name: "Polar Mapping: x = u cos(v), y = u sin(v)",
    badge: "det(J) = u = r",
    xExpr: "u * cos(v)",
    yExpr: "u * sin(v)",
    uMinExpr: "0.4",
    uMaxExpr: "1.8",
    vMinExpr: "0",
    vMaxExpr: "pi/2",
    symbolicLatex: "T(u,v) = (u\\cos v,\\; u\\sin v)",
    jacobianFormulaLatex:
      "J(u,v) = \\begin{bmatrix} \\cos v & -u\\sin v \\\\ \\sin v & u\\cos v \\end{bmatrix} \\implies \\det J = u(\\cos^2 v + \\sin^2 v) = u",
    engineeringNote:
      "Maps a simple rectangle in (r, θ) space into an annular circular sector in (x, y) space. Area stretches linearly with radius u = r.",
    defaultU0: 1.1,
    defaultV0: 0.65,
    defaultDu: 0.25,
    defaultDv: 0.25,
  },
  {
    id: "linear-shear",
    name: "Affine Shear & Stretch: x = 1.3u + 0.5v, y = 0.3u + 1.1v",
    badge: "det(J) = 1.28 (Constant)",
    xExpr: "1.3 * u + 0.5 * v",
    yExpr: "0.3 * u + 1.1 * v",
    uMinExpr: "0",
    uMaxExpr: "1.4",
    vMinExpr: "0",
    vMaxExpr: "1.4",
    symbolicLatex: "T(u,v) = (1.3u + 0.5v,\\; 0.3u + 1.1v)",
    jacobianFormulaLatex:
      "J = \\begin{bmatrix} 1.3 & 0.5 \\\\ 0.3 & 1.1 \\end{bmatrix} \\implies \\det J = (1.3)(1.1) - (0.5)(0.3) = 1.28",
    engineeringNote:
      "Linear transformations have a constant Jacobian matrix everywhere: every (u,v) square maps to a congruent parallelogram in (x,y) with exact area 1.28 Δu Δv.",
    defaultU0: 0.55,
    defaultV0: 0.55,
    defaultDu: 0.28,
    defaultDv: 0.28,
  },
  {
    id: "parabolic",
    name: "Parabolic Coordinates: x = 0.5(u² - v²), y = u·v",
    badge: "det(J) = u² + v²",
    xExpr: "0.5 * (u^2 - v^2)",
    yExpr: "u * v",
    uMinExpr: "0.5",
    uMaxExpr: "1.6",
    vMinExpr: "0.2",
    vMaxExpr: "1.3",
    symbolicLatex: "T(u,v) = \\left(\\tfrac{1}{2}(u^2 - v^2),\\; uv\\right)",
    jacobianFormulaLatex:
      "J(u,v) = \\begin{bmatrix} u & -v \\\\ v & u \\end{bmatrix} \\implies \\det J = u^2 + v^2",
    engineeringNote:
      "Conformal orthogonal parabolic mapping used in potential flow around a semi-infinite plate and electrostatic edge-field analysis.",
    defaultU0: 1.05,
    defaultV0: 0.7,
    defaultDu: 0.22,
    defaultDv: 0.22,
  },
  {
    id: "nonlinear-wave",
    name: "Isoparametric Curved Grid: x = u + 0.25 u·v, y = v + 0.2 u²",
    badge: "det(J) = 1 + 0.25u - 0.1uv",
    xExpr: "u + 0.25 * u * v",
    yExpr: "v + 0.2 * u^2",
    uMinExpr: "0",
    uMaxExpr: "1.5",
    vMinExpr: "0",
    vMaxExpr: "1.5",
    symbolicLatex: "T(u,v) = (u + 0.25uv,\\; v + 0.2u^2)",
    jacobianFormulaLatex:
      "J(u,v) = \\begin{bmatrix} 1 + 0.25v & 0.25u \\\\ 0.4u & 1 \\end{bmatrix} \\implies \\det J = 1 + 0.25v - 0.1u^2",
    engineeringNote:
      "Models a distorted 2D finite element isoparametric mapping where the tangent parallelogram approximates the curved element at each Gauss point.",
    defaultU0: 0.75,
    defaultV0: 0.65,
    defaultDu: 0.25,
    defaultDv: 0.25,
  },
];

export function DualGridMorphingAndTangentLab() {
  const [presetId, setPresetId] = useState<string>("polar");
  const [xExpr, setXExpr] = useState<string>(TRANSFORM_PRESETS[0].xExpr);
  const [yExpr, setYExpr] = useState<string>(TRANSFORM_PRESETS[0].yExpr);
  const [uMinExpr, setUMinExpr] = useState<string>(
    TRANSFORM_PRESETS[0].uMinExpr
  );
  const [uMaxExpr, setUMaxExpr] = useState<string>(
    TRANSFORM_PRESETS[0].uMaxExpr
  );
  const [vMinExpr, setVMinExpr] = useState<string>(
    TRANSFORM_PRESETS[0].vMinExpr
  );
  const [vMaxExpr, setVMaxExpr] = useState<string>(
    TRANSFORM_PRESETS[0].vMaxExpr
  );
  const [isCustomTransform, setIsCustomTransform] = useState<boolean>(false);

  // Local patch (u0, v0) and increments (du, dv)
  const [u0, setU0] = useState<number>(TRANSFORM_PRESETS[0].defaultU0);
  const [v0, setV0] = useState<number>(TRANSFORM_PRESETS[0].defaultV0);
  const [du, setDu] = useState<number>(TRANSFORM_PRESETS[0].defaultDu);
  const [dv, setDv] = useState<number>(TRANSFORM_PRESETS[0].defaultDv);

  // Continuous Homotopy Morph Slider t in [0, 1]
  const [morphT, setMorphT] = useState<number>(1.0);
  const [isPlayingMorph, setIsPlayingMorph] = useState<boolean>(false);

  // Visibility toggles
  const [showTangentParallelogram, setShowTangentParallelogram] =
    useState<boolean>(true);
  const [showTrueCurvedPatch, setShowTrueCurvedPatch] = useState<boolean>(true);

  const activePreset = useMemo(
    () =>
      TRANSFORM_PRESETS.find((p) => p.id === presetId) ?? TRANSFORM_PRESETS[0],
    [presetId]
  );

  // Compile expressions
  const compiledX = useMemo(
    () => compileMathExpression(xExpr, ["u", "v"]),
    [xExpr]
  );
  const compiledY = useMemo(
    () => compileMathExpression(yExpr, ["u", "v"]),
    [yExpr]
  );
  const compiledUMin = useMemo(
    () => compileMathExpression(uMinExpr, []),
    [uMinExpr]
  );
  const compiledUMax = useMemo(
    () => compileMathExpression(uMaxExpr, []),
    [uMaxExpr]
  );
  const compiledVMin = useMemo(
    () => compileMathExpression(vMinExpr, []),
    [vMinExpr]
  );
  const compiledVMax = useMemo(
    () => compileMathExpression(vMaxExpr, []),
    [vMaxExpr]
  );

  const bounds = useMemo(() => {
    const rawUMin = compiledUMin.evaluate({});
    const rawUMax = compiledUMax.evaluate({});
    const rawVMin = compiledVMin.evaluate({});
    const rawVMax = compiledVMax.evaluate({});
    const uMin = Math.min(rawUMin, rawUMax - 0.1);
    const uMax = Math.max(rawUMax, uMin + 0.1);
    const vMin = Math.min(rawVMin, rawVMax - 0.1);
    const vMax = Math.max(rawVMax, vMin + 0.1);
    return { uMin, uMax, vMin, vMax };
  }, [compiledUMin, compiledUMax, compiledVMin, compiledVMax]);

  const safeU0 = Math.max(
    bounds.uMin,
    Math.min(bounds.uMax - du, u0)
  );
  const safeV0 = Math.max(
    bounds.vMin,
    Math.min(bounds.vMax - dv, v0)
  );

  // Morph animation loop
  useEffect(() => {
    if (!isPlayingMorph) return;
    let rafId: number;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setMorphT((prev) => {
        const next = prev + dt * 0.45;
        if (next >= 1) {
          setIsPlayingMorph(false);
          return 1;
        }
        return next;
      });
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isPlayingMorph]);

  const handleSelectPreset = (p: TransformPreset) => {
    setPresetId(p.id);
    setXExpr(p.xExpr);
    setYExpr(p.yExpr);
    setUMinExpr(p.uMinExpr);
    setUMaxExpr(p.uMaxExpr);
    setVMinExpr(p.vMinExpr);
    setVMaxExpr(p.vMaxExpr);
    setU0(p.defaultU0);
    setV0(p.defaultV0);
    setDu(p.defaultDu);
    setDv(p.defaultDv);
    setIsCustomTransform(false);
  };

  // Homotopy mapping T_t(u, v) = (1 - t)*(u, v) + t*(x(u,v), y(u,v))
  const evalPoint = useMemo(() => {
    return (u: number, v: number, t: number = morphT): [number, number] => {
      const xVal = compiledX.evaluate({ u, v });
      const yVal = compiledY.evaluate({ u, v });
      const mx = (1 - t) * u + t * xVal;
      const my = (1 - t) * v + t * yVal;
      return [mx, my];
    };
  }, [compiledX, compiledY, morphT]);

  // Numerical Jacobian & Partial Derivatives at (safeU0, safeV0) using shared central-difference primitive
  const localJacobian = useMemo(() => {
    const [x0, y0] = evalPoint(safeU0, safeV0, morphT);
    const { dxdu, dydu, dxdv, dydv, detJ } = computeJacobian2D(
      (u, v) => evalPoint(u, v, morphT)[0],
      (u, v) => evalPoint(u, v, morphT)[1],
      safeU0,
      safeV0
    );
    const areaUV = du * dv;
    const areaLinear = Math.abs(detJ) * areaUV;

    // Also compute exact curved patch area using 6x6 subgrid triangulation
    const subN = 6;
    let exactArea = 0;
    const stepU = du / subN;
    const stepV = dv / subN;
    for (let i = 0; i < subN; i++) {
      for (let j = 0; j < subN; j++) {
        const uA = safeU0 + i * stepU;
        const vA = safeV0 + j * stepV;
        const p00 = evalPoint(uA, vA, morphT);
        const p10 = evalPoint(uA + stepU, vA, morphT);
        const p11 = evalPoint(uA + stepU, vA + stepV, morphT);
        const p01 = evalPoint(uA, vA + stepV, morphT);
        // Shoelace formula for quad
        const quadArea =
          0.5 *
          Math.abs(
            p00[0] * p10[1] -
              p10[0] * p00[1] +
              (p10[0] * p11[1] - p11[0] * p10[1]) +
              (p11[0] * p01[1] - p01[0] * p11[1]) +
              (p01[0] * p00[1] - p00[0] * p01[1])
          );
        exactArea += quadArea;
      }
    }

    return {
      x0,
      y0,
      dxdu,
      dydu,
      dxdv,
      dydv,
      detJ,
      areaUV,
      areaLinear,
      exactArea,
      ruVec: [dxdu * du, dydu * du] as [number, number],
      rvVec: [dxdv * dv, dydv * dv] as [number, number],
    };
  }, [evalPoint, safeU0, safeV0, du, dv, morphT]);

  // Compute physical space bounding box for responsive SVG scaling
  const xyViewport = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const samples = 14;
    for (let i = 0; i <= samples; i++) {
      const u = bounds.uMin + (i / samples) * (bounds.uMax - bounds.uMin);
      for (let j = 0; j <= samples; j++) {
        const v = bounds.vMin + (j / samples) * (bounds.vMax - bounds.vMin);
        const [px, py] = evalPoint(u, v, morphT);
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
    }
    // Include origin for context if close
    minX = Math.min(minX, 0);
    minY = Math.min(minY, 0);
    maxX = Math.max(maxX, 0.5);
    maxY = Math.max(maxY, 0.5);

    const span = Math.max(maxX - minX, maxY - minY, 0.5) * 1.18;
    const cx = 0.5 * (minX + maxX);
    const cy = 0.5 * (minY + maxY);
    return {
      minX: cx - span / 2,
      maxX: cx + span / 2,
      minY: cy - span / 2,
      maxY: cy + span / 2,
      span,
    };
  }, [bounds, evalPoint, morphT]);

  // SVG Coordinate Mappers (320 x 280 viewBox)
  const svgW = 320;
  const svgH = 280;
  const pad = 32;

  const toUVSvg = (u: number, v: number): [number, number] => {
    const uSpan = Math.max(bounds.uMax - bounds.uMin, 0.1);
    const vSpan = Math.max(bounds.vMax - bounds.vMin, 0.1);
    const sx = pad + ((u - bounds.uMin) / uSpan) * (svgW - 2 * pad);
    const sy = svgH - pad - ((v - bounds.vMin) / vSpan) * (svgH - 2 * pad);
    return [sx, sy];
  };

  const toXYSvg = (x: number, y: number): [number, number] => {
    const sx =
      pad + ((x - xyViewport.minX) / xyViewport.span) * (svgW - 2 * pad);
    const sy =
      svgH -
      pad -
      ((y - xyViewport.minY) / xyViewport.span) * (svgH - 2 * pad);
    return [sx, sy];
  };

  // Generate grid curves for (u,v) and morphed (x,y)
  const gridData = useMemo(() => {
    const numLines = 8;
    const curveSteps = 32;
    const uLinesUV: string[] = [];
    const vLinesUV: string[] = [];
    const uLinesXY: string[] = [];
    const vLinesXY: string[] = [];

    // Constant-u lines (varying v)
    for (let i = 0; i <= numLines; i++) {
      const uVal =
        bounds.uMin + (i / numLines) * (bounds.uMax - bounds.uMin);
      const [ux0, uy0] = toUVSvg(uVal, bounds.vMin);
      const [ux1, uy1] = toUVSvg(uVal, bounds.vMax);
      uLinesUV.push(`M ${ux0.toFixed(1)} ${uy0.toFixed(1)} L ${ux1.toFixed(1)} ${uy1.toFixed(1)}`);

      const ptsXY: string[] = [];
      for (let k = 0; k <= curveSteps; k++) {
        const vVal =
          bounds.vMin + (k / curveSteps) * (bounds.vMax - bounds.vMin);
        const [px, py] = evalPoint(uVal, vVal, morphT);
        const [sx, sy] = toXYSvg(px, py);
        ptsXY.push(`${k === 0 ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
      }
      uLinesXY.push(ptsXY.join(" "));
    }

    // Constant-v lines (varying u)
    for (let j = 0; j <= numLines; j++) {
      const vVal =
        bounds.vMin + (j / numLines) * (bounds.vMax - bounds.vMin);
      const [vx0, vy0] = toUVSvg(bounds.uMin, vVal);
      const [vx1, vy1] = toUVSvg(bounds.uMax, vVal);
      vLinesUV.push(`M ${vx0.toFixed(1)} ${vy0.toFixed(1)} L ${vx1.toFixed(1)} ${vy1.toFixed(1)}`);

      const ptsXY: string[] = [];
      for (let k = 0; k <= curveSteps; k++) {
        const uVal =
          bounds.uMin + (k / curveSteps) * (bounds.uMax - bounds.uMin);
        const [px, py] = evalPoint(uVal, vVal, morphT);
        const [sx, sy] = toXYSvg(px, py);
        ptsXY.push(`${k === 0 ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
      }
      vLinesXY.push(ptsXY.join(" "));
    }

    // True curved boundary of the patch [safeU0, safeU0+du] x [safeV0, safeV0+dv]
    const patchPts: string[] = [];
    const edgeSteps = 12;
    // Bottom edge: u from u0 to u0+du at v0
    for (let k = 0; k <= edgeSteps; k++) {
      const [px, py] = evalPoint(safeU0 + (k / edgeSteps) * du, safeV0, morphT);
      const [sx, sy] = toXYSvg(px, py);
      patchPts.push(`${k === 0 ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
    }
    // Right edge: v from v0 to v0+dv at u0+du
    for (let k = 1; k <= edgeSteps; k++) {
      const [px, py] = evalPoint(
        safeU0 + du,
        safeV0 + (k / edgeSteps) * dv,
        morphT
      );
      const [sx, sy] = toXYSvg(px, py);
      patchPts.push(`L ${sx.toFixed(1)} ${sy.toFixed(1)}`);
    }
    // Top edge: u from u0+du down to u0 at v0+dv
    for (let k = 1; k <= edgeSteps; k++) {
      const [px, py] = evalPoint(
        safeU0 + (1 - k / edgeSteps) * du,
        safeV0 + dv,
        morphT
      );
      const [sx, sy] = toXYSvg(px, py);
      patchPts.push(`L ${sx.toFixed(1)} ${sy.toFixed(1)}`);
    }
    // Left edge: v from v0+dv down to v0 at u0
    for (let k = 1; k <= edgeSteps; k++) {
      const [px, py] = evalPoint(
        safeU0,
        safeV0 + (1 - k / edgeSteps) * dv,
        morphT
      );
      const [sx, sy] = toXYSvg(px, py);
      patchPts.push(`L ${sx.toFixed(1)} ${sy.toFixed(1)}`);
    }
    patchPts.push("Z");

    return {
      uLinesUV,
      vLinesUV,
      uLinesXY,
      vLinesXY,
      truePatchPathXY: patchPts.join(" "),
    };
  }, [bounds, evalPoint, morphT, safeU0, safeV0, du, dv, xyViewport]);

  // Patch SVG coordinates in (u,v)
  const [uvP00x, uvP00y] = toUVSvg(safeU0, safeV0);
  const [uvP10x, uvP10y] = toUVSvg(safeU0 + du, safeV0);
  const [uvP11x, uvP11y] = toUVSvg(safeU0 + du, safeV0 + dv);
  const [uvP01x, uvP01y] = toUVSvg(safeU0, safeV0 + dv);

  // Tangent parallelogram vertices in (x,y)
  const { x0, y0, ruVec, rvVec } = localJacobian;
  const [xy00x, xy00y] = toXYSvg(x0, y0);
  const [xy10x, xy10y] = toXYSvg(x0 + ruVec[0], y0 + ruVec[1]);
  const [xy11x, xy11y] = toXYSvg(
    x0 + ruVec[0] + rvVec[0],
    y0 + ruVec[1] + rvVec[1]
  );
  const [xy01x, xy01y] = toXYSvg(x0 + rvVec[0], y0 + rvVec[1]);

  // Handle clicking inside the (u,v) SVG to relocate (u0, v0)
  const handleUVCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * svgW;
    const clickY = ((e.clientY - rect.top) / rect.height) * svgH;
    const uFrac = (clickX - pad) / (svgW - 2 * pad);
    const vFrac = (svgH - pad - clickY) / (svgH - 2 * pad);
    const nextU = bounds.uMin + uFrac * (bounds.uMax - bounds.uMin) - du / 2;
    const nextV = bounds.vMin + vFrac * (bounds.vMax - bounds.vMin) - dv / 2;
    setU0(
      Number(
        Math.max(bounds.uMin, Math.min(bounds.uMax - du, nextU)).toFixed(2)
      )
    );
    setV0(
      Number(
        Math.max(bounds.vMin, Math.min(bounds.vMax - dv, nextV)).toFixed(2)
      )
    );
  };

  return (
    <section
      id="dual-grid-morphing"
      className="scroll-mt-24 border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--math-ink-sweep)]">
              LAB 04.1 &amp; 04.2 • DUAL-SPACE GRID MORPHING &amp; TANGENT PARALLELOGRAM
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              2D Homotopy + Local Linearization
            </span>
          </div>
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
            Dual-Space Transformation <KaTeXMath math="T(u,v) = (x,y)" /> &amp; Tangent Vector Parallelogram
          </h2>
        </div>

        <div className="px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs">
          <KaTeXMath math="\Delta A_{xy} \approx \|\mathbf{r}_u \times \mathbf{r}_v\|\,\Delta u\,\Delta v = |\det J(u,v)|\,\Delta u\,\Delta v" />
        </div>
      </div>

      {/* Preset Selector */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {TRANSFORM_PRESETS.map((p) => {
            const active = !isCustomTransform && p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                aria-pressed={active}
                className={`p-3 border text-left transition-colors flex flex-col justify-between gap-1.5 ${
                  active
                    ? "border-[var(--math-ink-sweep)] bg-[var(--bg-canvas)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-sweep)]">
                    {p.badge}
                  </span>
                </div>
                <span className="text-xs font-medium text-[var(--text-primary)] leading-snug">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Transformation Equations & Parameter Domain Bounds */}
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MathExpressionInput
              label="Custom Coordinate Mapping x(u, v)"
              allowedVars={["u", "v"]}
              value={xExpr}
              onChange={(val) => {
                setXExpr(val);
                setIsCustomTransform(true);
              }}
              prefixLatex="x(u,v) ="
              placeholder="e.g. u * cos(v)"
              quickTokens={[
                { label: "u·cos(v)", insert: "u*cos(v)" },
                { label: "u² - v²", insert: "u^2 - v^2" },
                { label: "u + 0.5v", insert: "u + 0.5*v" },
                { label: "sin()", insert: "sin(" },
              ]}
            />
            <MathExpressionInput
              label="Custom Coordinate Mapping y(u, v)"
              allowedVars={["u", "v"]}
              value={yExpr}
              onChange={(val) => {
                setYExpr(val);
                setIsCustomTransform(true);
              }}
              prefixLatex="y(u,v) ="
              placeholder="e.g. u * sin(v)"
              quickTokens={[
                { label: "u·sin(v)", insert: "u*sin(v)" },
                { label: "u·v", insert: "u*v" },
                { label: "v - 0.5u", insert: "v - 0.5*u" },
                { label: "cos()", insert: "cos(" },
              ]}
            />
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-3 space-y-2">
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
              Define Parameter Domain Rectangle R_uv = [u_min, u_max] × [v_min, v_max]:
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MathExpressionInput
                label="Lower u Bound"
                allowedVars={[]}
                value={uMinExpr}
                onChange={(val) => {
                  setUMinExpr(val);
                  setIsCustomTransform(true);
                }}
                prefixLatex="u_{\min} ="
                placeholder="0.4"
                compact
              />
              <MathExpressionInput
                label="Upper u Bound"
                allowedVars={[]}
                value={uMaxExpr}
                onChange={(val) => {
                  setUMaxExpr(val);
                  setIsCustomTransform(true);
                }}
                prefixLatex="u_{\max} ="
                placeholder="1.8"
                compact
              />
              <MathExpressionInput
                label="Lower v Bound"
                allowedVars={[]}
                value={vMinExpr}
                onChange={(val) => {
                  setVMinExpr(val);
                  setIsCustomTransform(true);
                }}
                prefixLatex="v_{\min} ="
                placeholder="0"
                compact
              />
              <MathExpressionInput
                label="Upper v Bound"
                allowedVars={[]}
                value={vMaxExpr}
                onChange={(val) => {
                  setVMaxExpr(val);
                  setIsCustomTransform(true);
                }}
                prefixLatex="v_{\max} ="
                placeholder="pi/2"
                compact
              />
            </div>
          </div>
        </div>
      </div>

      {/* Continuous Homotopy Morph Bar */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] block">
            Continuous Grid Homotopy Morphing Slider t ∈ [0, 1]
          </span>
          <div className="text-xs text-[var(--text-secondary)]">
            <KaTeXMath math="T_t(u,v) = (1 - t)\,(u,v) + t\,\big(x(u,v),\; y(u,v)\big)" />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            type="button"
            onClick={() => {
              if (morphT >= 0.99) setMorphT(0);
              setIsPlayingMorph((prev) => !prev);
            }}
            className="px-3 py-1.5 border border-[var(--math-ink-sweep)] bg-[var(--bg-panel)] text-xs font-tabular-mono text-[var(--math-ink-sweep)] flex items-center gap-1.5 shrink-0"
          >
            {isPlayingMorph ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Animate Morph</span>
              </>
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={morphT}
            onChange={(e) => {
              setIsPlayingMorph(false);
              setMorphT(parseFloat(e.target.value));
            }}
            aria-label="Continuous homotopy morphing factor t"
            className="w-full accent-[#D35323]"
          />

          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] w-16 text-right">
            t = {morphT.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Main Dual-Viewport Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left & Center: Side-by-Side (u,v) Parameter Space & (x,y) Physical Space (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Viewport 1: (u, v) Parameter Space */}
            <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)]">
                  1. PARAMETER SPACE (u, v)
                </span>
                <span className="text-[11px] font-tabular-mono text-[var(--text-muted)]">
                  Click to Move Patch
                </span>
              </div>

              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                onClick={handleUVCanvasClick}
                className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-panel)] cursor-crosshair select-none"
                role="img"
                aria-label="Parameter space (u, v) uniform rectangular grid with draggable patch"
              >
                {/* Constant-u lines (#8D9FCE) */}
                {gridData.uLinesUV.map((d, i) => (
                  <path
                    key={`u-uv-${i}`}
                    d={d}
                    stroke="#8D9FCE"
                    strokeWidth="1"
                    strokeOpacity="0.45"
                    fill="none"
                  />
                ))}
                {/* Constant-v lines (#96B898) */}
                {gridData.vLinesUV.map((d, j) => (
                  <path
                    key={`v-uv-${j}`}
                    d={d}
                    stroke="#96B898"
                    strokeWidth="1"
                    strokeOpacity="0.45"
                    fill="none"
                  />
                ))}

                {/* Parameter Patch Δu × Δv */}
                <polygon
                  points={`${uvP00x},${uvP00y} ${uvP10x},${uvP10y} ${uvP11x},${uvP11y} ${uvP01x},${uvP01y}`}
                  fill="#FBEAA4"
                  fillOpacity="0.32"
                  stroke="#FBEAA4"
                  strokeWidth="1.5"
                />

                {/* Δu vector along bottom */}
                <line
                  x1={uvP00x}
                  y1={uvP00y}
                  x2={uvP10x}
                  y2={uvP10y}
                  stroke="#8D9FCE"
                  strokeWidth="3"
                />
                {/* Δv vector along left */}
                <line
                  x1={uvP00x}
                  y1={uvP00y}
                  x2={uvP01x}
                  y2={uvP01y}
                  stroke="#96B898"
                  strokeWidth="3"
                />

                {/* Base point (u0, v0) */}
                <circle
                  cx={uvP00x}
                  cy={uvP00y}
                  r="4.5"
                  fill="#D35323"
                  stroke="#1E1F22"
                  strokeWidth="1.5"
                />
                <text
                  x={uvP00x + 6}
                  y={uvP00y + 13}
                  fill="var(--math-ink-diff)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  (u₀,v₀)
                </text>
                <text
                  x={svgW - 24}
                  y={svgH - 10}
                  fill="var(--math-ink-x)"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                >
                  u
                </text>
                <text
                  x={12}
                  y={20}
                  fill="var(--math-ink-y)"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                >
                  v
                </text>
              </svg>

              <div className="flex items-center justify-between text-[11px] font-tabular-mono text-[var(--text-secondary)]">
                <span>
                  (u₀, v₀) = ({safeU0.toFixed(2)}, {safeV0.toFixed(2)})
                </span>
                <span className="text-[var(--math-ink-diff)]">
                  ΔA_uv = Δu·Δv = {localJacobian.areaUV.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Viewport 2: (x, y) Physical Space */}
            <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)]">
                  2. PHYSICAL SPACE (x, y)
                </span>
                <span className="text-[11px] font-tabular-mono text-[var(--math-ink-diff)]">
                  |det J| = {Math.abs(localJacobian.detJ).toFixed(3)}
                </span>
              </div>

              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-panel)] select-none"
                role="img"
                aria-label="Physical space (x, y) transformed curvilinear grid and tangent vector parallelogram"
              >
                {/* Transformed constant-u curves (#8D9FCE) */}
                {gridData.uLinesXY.map((d, i) => (
                  <path
                    key={`u-xy-${i}`}
                    d={d}
                    stroke="#8D9FCE"
                    strokeWidth="1"
                    strokeOpacity="0.45"
                    fill="none"
                  />
                ))}
                {/* Transformed constant-v curves (#96B898) */}
                {gridData.vLinesXY.map((d, j) => (
                  <path
                    key={`v-xy-${j}`}
                    d={d}
                    stroke="#96B898"
                    strokeWidth="1"
                    strokeOpacity="0.45"
                    fill="none"
                  />
                ))}

                {/* True Curved Patch T(Δu × Δv) */}
                {showTrueCurvedPatch && (
                  <path
                    d={gridData.truePatchPathXY}
                    fill="#029091"
                    fillOpacity="0.28"
                    stroke="#029091"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                )}

                {/* Tangent Parallelogram r_u Δu ∧ r_v Δv */}
                {showTangentParallelogram && (
                  <>
                    <polygon
                      points={`${xy00x},${xy00y} ${xy10x},${xy10y} ${xy11x},${xy11y} ${xy01x},${xy01y}`}
                      fill="#FBEAA4"
                      fillOpacity="0.32"
                      stroke="#FBEAA4"
                      strokeWidth="1.5"
                    />
                    {/* Vector r_u Δu */}
                    <line
                      x1={xy00x}
                      y1={xy00y}
                      x2={xy10x}
                      y2={xy10y}
                      stroke="#8D9FCE"
                      strokeWidth="3"
                    />
                    {/* Vector r_v Δv */}
                    <line
                      x1={xy00x}
                      y1={xy00y}
                      x2={xy01x}
                      y2={xy01y}
                      stroke="#96B898"
                      strokeWidth="3"
                    />
                  </>
                )}

                {/* Image point T(u0, v0) */}
                <circle
                  cx={xy00x}
                  cy={xy00y}
                  r="4.5"
                  fill="#D35323"
                  stroke="#1E1F22"
                  strokeWidth="1.5"
                />
                <text
                  x={xy00x + 6}
                  y={xy00y + 13}
                  fill="var(--math-ink-diff)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  T(u₀,v₀)
                </text>
                <text
                  x={svgW - 24}
                  y={svgH - 10}
                  fill="var(--math-ink-x)"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                >
                  x
                </text>
                <text
                  x={12}
                  y={20}
                  fill="var(--math-ink-y)"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                >
                  y
                </text>
              </svg>

              <div className="flex items-center justify-between text-[11px] font-tabular-mono text-[var(--text-secondary)]">
                <span>
                  (x₀, y₀) = ({x0.toFixed(2)}, {y0.toFixed(2)})
                </span>
                <span className="text-[var(--math-ink-sweep)]">
                  |det J|·ΔuΔv = {localJacobian.areaLinear.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Local Linearization & Tangent Parallelogram Magnifier (#tangent-parallelogram) */}
          <div
            id="tangent-parallelogram"
            className="scroll-mt-24 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[var(--math-ink-diff)]" />
                <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-diff)]">
                  Local Linearization Magnifier: Tangent Vectors r_u Δu &amp; r_v Δv
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTangentParallelogram((v) => !v)}
                  aria-pressed={showTangentParallelogram}
                  className={`px-2 py-1 text-[11px] font-tabular-mono border ${
                    showTangentParallelogram
                      ? "border-[var(--math-ink-diff)] text-[var(--math-ink-diff)] bg-[var(--bg-panel)]"
                      : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                  }`}
                >
                  Tangent Parallelogram
                </button>
                <button
                  type="button"
                  onClick={() => setShowTrueCurvedPatch((v) => !v)}
                  aria-pressed={showTrueCurvedPatch}
                  className={`px-2 py-1 text-[11px] font-tabular-mono border ${
                    showTrueCurvedPatch
                      ? "border-[var(--math-ink-z)] text-[var(--math-ink-z)] bg-[var(--bg-panel)]"
                      : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                  }`}
                >
                  True Curved Patch
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
                <span className="text-[11px] font-tabular-mono text-[var(--math-ink-x)] block">
                  TANGENT VECTOR r_u Δu
                </span>
                <KaTeXMath
                  math={`\\mathbf{r}_u\\Delta u = \\begin{bmatrix} ${localJacobian.ruVec[0].toFixed(3)} \\\\ ${localJacobian.ruVec[1].toFixed(3)} \\end{bmatrix}`}
                />
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
                <span className="text-[11px] font-tabular-mono text-[var(--math-ink-y)] block">
                  TANGENT VECTOR r_v Δv
                </span>
                <KaTeXMath
                  math={`\\mathbf{r}_v\\Delta v = \\begin{bmatrix} ${localJacobian.rvVec[0].toFixed(3)} \\\\ ${localJacobian.rvVec[1].toFixed(3)} \\end{bmatrix}`}
                />
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
                <span className="text-[11px] font-tabular-mono text-[var(--math-ink-diff)] block">
                  PARALLELOGRAM vs. CURVED AREA
                </span>
                <div className="font-tabular-mono text-[11px] space-y-0.5 pt-0.5">
                  <div>
                    Linear: <strong className="text-[var(--math-ink-diff)]">{localJacobian.areaLinear.toFixed(4)}</strong>
                  </div>
                  <div>
                    Exact Curved: <strong className="text-[var(--math-ink-z)]">{localJacobian.exactArea.toFixed(4)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Patch Sliders & Live Jacobian Matrix Readout (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Patch Position & Step Size Controls */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
                Local Patch Position (u₀, v₀) &amp; Size (Δu, Δv)
              </span>
              <button
                type="button"
                onClick={() => handleSelectPreset(activePreset)}
                className="text-xs font-tabular-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-x)]">u₀ position</span>
                  <span>{safeU0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={bounds.uMin}
                  max={Math.max(bounds.uMin + 0.05, bounds.uMax - du)}
                  step={0.02}
                  value={safeU0}
                  onChange={(e) => setU0(parseFloat(e.target.value))}
                  aria-label="Parameter u0 position"
                  className="w-full accent-[#8D9FCE]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-y)]">v₀ position</span>
                  <span>{safeV0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={bounds.vMin}
                  max={Math.max(bounds.vMin + 0.05, bounds.vMax - dv)}
                  step={0.02}
                  value={safeV0}
                  onChange={(e) => setV0(parseFloat(e.target.value))}
                  aria-label="Parameter v0 position"
                  className="w-full accent-[#96B898]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-diff)]">Step Δu</span>
                  <span>{du.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.08}
                  max={0.5}
                  step={0.02}
                  value={du}
                  onChange={(e) => setDu(parseFloat(e.target.value))}
                  aria-label="Differential step delta u"
                  className="w-full accent-[#FBEAA4]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--math-ink-diff)]">Step Δv</span>
                  <span>{dv.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.08}
                  max={0.5}
                  step={0.02}
                  value={dv}
                  onChange={(e) => setDv(parseFloat(e.target.value))}
                  aria-label="Differential step delta v"
                  className="w-full accent-[#FBEAA4]"
                />
              </div>
            </div>
          </div>

          {/* Live Jacobian Matrix & Determinant Evaluation */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)]">
                Live Jacobian Matrix J(u₀, v₀) at t = {morphT.toFixed(2)}
              </span>
              <span
                className={`text-[11px] font-tabular-mono px-2 py-0.5 border ${
                  Math.abs(localJacobian.detJ) < 1e-3
                    ? "border-[var(--math-ink-upper)] text-[var(--math-ink-upper)]"
                    : localJacobian.detJ > 0
                    ? "border-[var(--math-ink-y)] text-[var(--math-ink-y)]"
                    : "border-[var(--math-ink-lower)] text-[var(--math-ink-lower)]"
                }`}
              >
                {Math.abs(localJacobian.detJ) < 1e-3
                  ? "Singular (det J ≈ 0)"
                  : localJacobian.detJ > 0
                  ? "Orientation Preserving (det J > 0)"
                  : "Orientation Reversing (det J < 0)"}
              </span>
            </div>

            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
              <KaTeXMath
                block
                math={`J(${safeU0.toFixed(2)}, ${safeV0.toFixed(2)}) = \\begin{bmatrix} \\dfrac{\\partial x}{\\partial u} & \\dfrac{\\partial x}{\\partial v} \\\\[8pt] \\dfrac{\\partial y}{\\partial u} & \\dfrac{\\partial y}{\\partial v} \\end{bmatrix} = \\begin{bmatrix} \\color{#8D9FCE}{${localJacobian.dxdu.toFixed(3)}} & \\color{#96B898}{${localJacobian.dxdv.toFixed(3)}} \\\\[6pt] \\color{#8D9FCE}{${localJacobian.dydu.toFixed(3)}} & \\color{#96B898}{${localJacobian.dydv.toFixed(3)}} \\end{bmatrix}`}
              />
            </div>

            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
              <KaTeXMath
                block
                math={`\\det J = (${localJacobian.dxdu.toFixed(3)})(${localJacobian.dydv.toFixed(3)}) - (${localJacobian.dxdv.toFixed(3)})(${localJacobian.dydu.toFixed(3)}) = \\color{#D35323}{${localJacobian.detJ.toFixed(4)}}`}
              />
            </div>

            {!isCustomTransform && (
              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5 overflow-x-auto">
                <span className="text-[11px] font-tabular-mono text-[var(--math-ink-grid)] block">
                  ANALYTIC DERIVATION (AT t = 1):
                </span>
                <KaTeXMath math={activePreset.jacobianFormulaLatex} block />
                <p className="text-xs font-math-serif text-[var(--text-secondary)]">
                  {activePreset.engineeringNote}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
