"use client";

import React, { useState, useMemo } from "react";
import { Calculator, Layers } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import { computeJacobian2D } from "@/components/visualizations/primitives/core2d";

interface PullbackPreset {
  id: string;
  title: string;
  badge: string;
  fExpr: string;
  xExpr: string;
  yExpr: string;
  uMinExpr: string;
  uMaxExpr: string;
  vMinExpr: string;
  vMaxExpr: string;
  physicalRegionLatex: string;
  pullbackLatex: string;
  explanation: string;
}

const PULLBACK_PRESETS: PullbackPreset[] = [
  {
    id: "parallelogram",
    title: "Slanted Parallelogram: u = x - 2y, v = 2x + y",
    badge: "|det J| = 1/5 = 0.20",
    fExpr: "(x - 2*y)^2 + (2*x + y)",
    xExpr: "0.2 * (u + 2*v)",
    yExpr: "0.2 * (v - 2*u)",
    uMinExpr: "0",
    uMaxExpr: "2",
    vMinExpr: "1",
    vMaxExpr: "3",
    physicalRegionLatex:
      "R_{xy}:\\; 0 \\le x - 2y \\le 2,\\quad 1 \\le 2x + y \\le 3",
    pullbackLatex:
      "\\iint_{R_{xy}} \\big((x-2y)^2 + (2x+y)\\big)\\,dx\\,dy = \\int_{0}^{2}\\int_{1}^{3} (u^2 + v)\\,\\left|\\frac{1}{5}\\right|\\,dv\\,du",
    explanation:
      "In (x,y), integrating over a tilted parallelogram requires splitting into 3 separate triangles. Pulling back to (u,v) turns the domain into the rectangle [0,2] × [1,3] with constant Jacobian |det J| = 0.2.",
  },
  {
    id: "elliptical-plate",
    title: "Elliptical Lamina (a=2, b=1.2): x = 2u cos(v), y = 1.2u sin(v)",
    badge: "|det J| = 2.4 u",
    fExpr: "1 + 0.5 * (x^2 + y^2)",
    xExpr: "2 * u * cos(v)",
    yExpr: "1.2 * u * sin(v)",
    uMinExpr: "0",
    uMaxExpr: "1",
    vMinExpr: "0",
    vMaxExpr: "2*pi",
    physicalRegionLatex:
      "R_{xy}:\\; \\frac{x^2}{2^2} + \\frac{y^2}{1.2^2} \\le 1",
    pullbackLatex:
      "\\iint_{R_{xy}} (1 + 0.5(x^2+y^2))\\,dx\\,dy = \\int_{0}^{1}\\int_{0}^{2\\pi} f(2u\\cos v, 1.2u\\sin v)\\,(2.4u)\\,dv\\,du",
    explanation:
      "Generalized polar coordinates map the unit disk rectangle u ∈ [0,1], v ∈ [0,2π] onto an ellipse of semi-axes a = 2, b = 1.2, scaling differential area by |det J| = a·b·u = 2.4u.",
  },
  {
    id: "hyperbolic-band",
    title: "Hyperbolic First-Quadrant Region: xy ∈ [1, 3], y/x ∈ [0.5, 2]",
    badge: "|det J| = 1 / (2v)",
    fExpr: "x * y",
    xExpr: "sqrt(u / v)",
    yExpr: "sqrt(u * v)",
    uMinExpr: "1",
    uMaxExpr: "3",
    vMinExpr: "0.5",
    vMaxExpr: "2",
    physicalRegionLatex:
      "R_{xy}:\\; 1 \\le xy \\le 3,\\quad 0.5 \\le \\frac{y}{x} \\le 2 \\quad (x,y > 0)",
    pullbackLatex:
      "\\iint_{R_{xy}} xy\\,dx\\,dy = \\int_{1}^{3}\\int_{0.5}^{2} u \\cdot \\frac{1}{2v}\\,dv\\,du = 2\\ln(4) \\approx 2.7726",
    explanation:
      "Setting u = xy and v = y/x gives x = √(u/v), y = √(uv). The curved hyperbolic region pulls back to [1,3] × [0.5,2] with Jacobian determinant |det J| = 1/(2v).",
  },
  {
    id: "diamond-rhombus",
    title: "Rotated Diamond / Rhombus: u = x + y, v = x - y",
    badge: "|det J| = 0.50",
    fExpr: "cos(0.5*(x - y)) * exp(0.2*(x + y))",
    xExpr: "0.5 * (u + v)",
    yExpr: "0.5 * (u - v)",
    uMinExpr: "0",
    uMaxExpr: "2",
    vMinExpr: "-1",
    vMaxExpr: "1",
    physicalRegionLatex:
      "R_{xy}:\\; 0 \\le x + y \\le 2,\\quad -1 \\le x - y \\le 1",
    pullbackLatex:
      "\\iint_{R_{xy}} \\cos\\!\\big(\\tfrac{x-y}{2}\\big)e^{0.2(x+y)}\\,dx\\,dy = \\int_{0}^{2}\\int_{-1}^{1} \\cos(0.5v)e^{0.2u}\\,(0.5)\\,dv\\,du",
    explanation:
      "Separates coupled arguments (x+y) and (x-y) into independent limits in u and v, with det J = -0.5 and absolute scaling factor |det J| = 0.5.",
  },
];

interface ThreeDSystemSpec {
  id: string;
  name: string;
  varsLabel: string;
  mappingLatex: string;
  matrixLatex: string;
  detLatex: string;
  note: string;
}

const THREE_D_SYSTEMS: ThreeDSystemSpec[] = [
  {
    id: "cylindrical-3d",
    name: "3D Cylindrical (r, θ, z)",
    varsLabel: "(u, v, w) = (r, θ, z)",
    mappingLatex: "(x, y, z) = (r\\cos\\theta,\\; r\\sin\\theta,\\; z)",
    matrixLatex:
      "\\frac{\\partial(x,y,z)}{\\partial(r,\\theta,z)} = \\begin{bmatrix} \\cos\\theta & -r\\sin\\theta & 0 \\\\ \\sin\\theta & r\\cos\\theta & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}",
    detLatex:
      "\\left|\\det J\\right| = \\left|\\mathbf{r}_r \\cdot (\\mathbf{r}_\\theta \\times \\mathbf{r}_z)\\right| = r(\\cos^2\\theta + \\sin^2\\theta)(1) = r",
    note: "Block-diagonal matrix combining the 2D polar Jacobian (det = r) with the identity along z.",
  },
  {
    id: "spherical-3d",
    name: "3D Spherical (ρ, φ, θ)",
    varsLabel: "(u, v, w) = (ρ, φ, θ)",
    mappingLatex:
      "(x, y, z) = (\\rho\\sin\\phi\\cos\\theta,\\; \\rho\\sin\\phi\\sin\\theta,\\; \\rho\\cos\\phi)",
    matrixLatex:
      "\\frac{\\partial(x,y,z)}{\\partial(\\rho,\\phi,\\theta)} = \\begin{bmatrix} \\sin\\phi\\cos\\theta & \\rho\\cos\\phi\\cos\\theta & -\\rho\\sin\\phi\\sin\\theta \\\\ \\sin\\phi\\sin\\theta & \\rho\\cos\\phi\\sin\\theta & \\rho\\sin\\phi\\cos\\theta \\\\ \\cos\\phi & -\\rho\\sin\\phi & 0 \\end{bmatrix}",
    detLatex:
      "\\left|\\det J\\right| = \\left|\\mathbf{r}_\\rho \\cdot (\\mathbf{r}_\\phi \\times \\mathbf{r}_\\theta)\\right| = \\rho^2\\sin\\phi",
    note: "Cofactor expansion along the bottom row yields ρ² sin φ(cos²φ + sin²φ) = ρ² sin φ.",
  },
  {
    id: "ellipsoidal-3d",
    name: "3D Ellipsoidal Scaling (a·u, b·v, c·w)",
    varsLabel: "x = a u, y = b v, z = c w",
    mappingLatex: "(x, y, z) = (a\\,u,\\; b\\,v,\\; c\\,w)",
    matrixLatex:
      "\\frac{\\partial(x,y,z)}{\\partial(u,v,w)} = \\begin{bmatrix} a & 0 & 0 \\\\ 0 & b & 0 \\\\ 0 & 0 & c \\end{bmatrix}",
    detLatex:
      "\\left|\\det J\\right| = a b c \\implies V_{\\text{ellipsoid}} = \\iiint_{u^2+v^2+w^2 \\le 1} a b c\\,du\\,dv\\,dw = \\frac{4}{3}\\pi a b c",
    note: "Maps the unit ball u² + v² + w² ≤ 1 directly onto the solid triaxial ellipsoid (x/a)² + (y/b)² + (z/c)² ≤ 1.",
  },
];

export function JacobianIntegralPullbackLab() {
  const [presetId, setPresetId] = useState<string>("parallelogram");
  const [fExpr, setFExpr] = useState<string>(PULLBACK_PRESETS[0].fExpr);
  const [xExpr, setXExpr] = useState<string>(PULLBACK_PRESETS[0].xExpr);
  const [yExpr, setYExpr] = useState<string>(PULLBACK_PRESETS[0].yExpr);
  const [uMinExpr, setUMinExpr] = useState<string>(PULLBACK_PRESETS[0].uMinExpr);
  const [uMaxExpr, setUMaxExpr] = useState<string>(PULLBACK_PRESETS[0].uMaxExpr);
  const [vMinExpr, setVMinExpr] = useState<string>(PULLBACK_PRESETS[0].vMinExpr);
  const [vMaxExpr, setVMaxExpr] = useState<string>(PULLBACK_PRESETS[0].vMaxExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // 3D Jacobian Reference Tab
  const [threeDId, setThreeDId] = useState<string>("spherical-3d");

  const activePreset = useMemo(
    () => PULLBACK_PRESETS.find((p) => p.id === presetId) ?? PULLBACK_PRESETS[0],
    [presetId]
  );

  const activeThreeD = useMemo(
    () => THREE_D_SYSTEMS.find((s) => s.id === threeDId) ?? THREE_D_SYSTEMS[1],
    [threeDId]
  );

  const handleSelectPreset = (p: PullbackPreset) => {
    setPresetId(p.id);
    setFExpr(p.fExpr);
    setXExpr(p.xExpr);
    setYExpr(p.yExpr);
    setUMinExpr(p.uMinExpr);
    setUMaxExpr(p.uMaxExpr);
    setVMinExpr(p.vMinExpr);
    setVMaxExpr(p.vMaxExpr);
    setIsCustom(false);
  };

  // Compile expressions
  const compiledF = useMemo(
    () => compileMathExpression(fExpr, ["x", "y"]),
    [fExpr]
  );
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
    () => compileMathExpression(vMinExpr, ["u"]),
    [vMinExpr]
  );
  const compiledVMax = useMemo(
    () => compileMathExpression(vMaxExpr, ["u"]),
    [vMaxExpr]
  );

  // Evaluate 2D pullback integral and generate cell meshes for both (u,v) and (x,y)
  const pullbackEvaluation = useMemo(() => {
    const rawUMin = compiledUMin.evaluate({});
    const rawUMax = compiledUMax.evaluate({});
    const uMin = Math.min(rawUMin, rawUMax);
    const uMax = Math.max(rawUMax, uMin + 0.05);

    // Numerical quadrature grid (28 x 28)
    const Nu = 28;
    const Nv = 28;
    const du = (uMax - uMin) / Nu;
    const h = 1e-5;

    let integralWithJacobian = 0;
    let integralWithoutJacobian = 0;
    let physicalArea = 0;
    let parameterArea = 0;
    let minAbsJ = Infinity;
    let maxAbsJ = -Infinity;

    for (let i = 0; i < Nu; i++) {
      const uMid = uMin + (i + 0.5) * du;
      const v1 = compiledVMin.evaluate({ u: uMid });
      const v2 = compiledVMax.evaluate({ u: uMid });
      const vLow = Math.min(v1, v2);
      const vHigh = Math.max(v1, v2);
      const dv = (vHigh - vLow) / Nv;
      if (dv <= 1e-8) continue;

      for (let j = 0; j < Nv; j++) {
        const vMid = vLow + (j + 0.5) * dv;
        const xVal = compiledX.evaluate({ u: uMid, v: vMid });
        const yVal = compiledY.evaluate({ u: uMid, v: vMid });
        const fVal = compiledF.evaluate({ x: xVal, y: yVal });

        const { absDetJ: absJ } = computeJacobian2D(
          (u, v) => compiledX.evaluate({ u, v }),
          (u, v) => compiledY.evaluate({ u, v }),
          uMid,
          vMid,
          h
        );
        if (absJ < minAbsJ) minAbsJ = absJ;
        if (absJ > maxAbsJ) maxAbsJ = absJ;

        const dAuv = du * dv;
        parameterArea += dAuv;
        physicalArea += absJ * dAuv;
        integralWithJacobian += fVal * absJ * dAuv;
        integralWithoutJacobian += fVal * dAuv;
      }
    }

    // Build visual 10 x 10 grid cells for SVG domain pullback visualization
    const visNu = 10;
    const visNv = 10;
    const visDu = (uMax - uMin) / visNu;
    let minV = Infinity;
    let maxV = -Infinity;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    interface CellQuad {
      uvPoints: [number, number][];
      xyPoints: [number, number][];
      absJ: number;
    }

    const cells: CellQuad[] = [];

    for (let i = 0; i < visNu; i++) {
      const uA = uMin + i * visDu;
      const uB = uA + visDu;
      const uMid = 0.5 * (uA + uB);
      const v1 = compiledVMin.evaluate({ u: uMid });
      const v2 = compiledVMax.evaluate({ u: uMid });
      const vLow = Math.min(v1, v2);
      const vHigh = Math.max(v1, v2, vLow + 0.05);
      if (vLow < minV) minV = vLow;
      if (vHigh > maxV) maxV = vHigh;
      const visDv = (vHigh - vLow) / visNv;

      for (let j = 0; j < visNv; j++) {
        const vA = vLow + j * visDv;
        const vB = vA + visDv;
        const vMid = 0.5 * (vA + vB);

        const uvPts: [number, number][] = [
          [uA, vA],
          [uB, vA],
          [uB, vB],
          [uA, vB],
        ];
        const xyPts: [number, number][] = uvPts.map(([uu, vv]) => {
          const xx = compiledX.evaluate({ u: uu, v: vv });
          const yy = compiledY.evaluate({ u: uu, v: vv });
          if (xx < minX) minX = xx;
          if (xx > maxX) maxX = xx;
          if (yy < minY) minY = yy;
          if (yy > maxY) maxY = yy;
          return [xx, yy];
        });

        const dxdu =
          (compiledX.evaluate({ u: uMid + h, v: vMid }) -
            compiledX.evaluate({ u: uMid - h, v: vMid })) /
          (2 * h);
        const dydu =
          (compiledY.evaluate({ u: uMid + h, v: vMid }) -
            compiledY.evaluate({ u: uMid - h, v: vMid })) /
          (2 * h);
        const dxdv =
          (compiledX.evaluate({ u: uMid, v: vMid + h }) -
            compiledX.evaluate({ u: uMid, v: vMid - h })) /
          (2 * h);
        const dydv =
          (compiledY.evaluate({ u: uMid, v: vMid + h }) -
            compiledY.evaluate({ u: uMid, v: vMid - h })) /
          (2 * h);
        const absJ = Math.abs(dxdu * dydv - dxdv * dydu);

        cells.push({ uvPoints: uvPts, xyPoints: xyPts, absJ });
      }
    }

    if (!Number.isFinite(minV)) minV = 0;
    if (!Number.isFinite(maxV)) maxV = 1;
    if (!Number.isFinite(minX)) minX = -1;
    if (!Number.isFinite(maxX)) maxX = 1;
    if (!Number.isFinite(minY)) minY = -1;
    if (!Number.isFinite(maxY)) maxY = 1;

    return {
      uMin,
      uMax,
      minV,
      maxV,
      minX,
      maxX,
      minY,
      maxY,
      cells,
      integralWithJacobian,
      integralWithoutJacobian,
      physicalArea,
      parameterArea,
      minAbsJ: Number.isFinite(minAbsJ) ? minAbsJ : 0,
      maxAbsJ: Number.isFinite(maxAbsJ) ? maxAbsJ : 1,
    };
  }, [
    compiledF,
    compiledX,
    compiledY,
    compiledUMin,
    compiledUMax,
    compiledVMin,
    compiledVMax,
  ]);

  const svgW = 320;
  const svgH = 250;
  const pad = 28;

  const mapUV = (u: number, v: number): string => {
    const uSpan = Math.max(
      pullbackEvaluation.uMax - pullbackEvaluation.uMin,
      0.1
    );
    const vSpan = Math.max(
      pullbackEvaluation.maxV - pullbackEvaluation.minV,
      0.1
    );
    const sx =
      pad + ((u - pullbackEvaluation.uMin) / uSpan) * (svgW - 2 * pad);
    const sy =
      svgH -
      pad -
      ((v - pullbackEvaluation.minV) / vSpan) * (svgH - 2 * pad);
    return `${sx.toFixed(1)},${sy.toFixed(1)}`;
  };

  const mapXY = (x: number, y: number): string => {
    const spanX = Math.max(
      pullbackEvaluation.maxX - pullbackEvaluation.minX,
      0.2
    );
    const spanY = Math.max(
      pullbackEvaluation.maxY - pullbackEvaluation.minY,
      0.2
    );
    const span = Math.max(spanX, spanY) * 1.12;
    const cx = 0.5 * (pullbackEvaluation.minX + pullbackEvaluation.maxX);
    const cy = 0.5 * (pullbackEvaluation.minY + pullbackEvaluation.maxY);
    const sx = pad + ((x - (cx - span / 2)) / span) * (svgW - 2 * pad);
    const sy =
      svgH - pad - ((y - (cy - span / 2)) / span) * (svgH - 2 * pad);
    return `${sx.toFixed(1)},${sy.toFixed(1)}`;
  };

  // Discrete semantic color coding for |det J|
  const getJacobianCellColor = (absJ: number) => {
    if (absJ < 0.85) return "#8D9FCE"; // Compression (< 1)
    if (absJ <= 1.15) return "#FBEAA4"; // Near-unit area preservation
    return "#D35323"; // Area expansion (> 1)
  };

  return (
    <section
      id="jacobian-matrix-explorer"
      className="scroll-mt-24 border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-tabular-mono bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--math-ink-y)]">
              LAB 04.3 • INTEGRAL DOMAIN PULLBACK &amp; 2D/3D JACOBIAN SOLVER
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              Change of Variables Theorem
            </span>
          </div>
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
            Integral Domain Pullback <KaTeXMath math="R_{xy} \longleftarrow T(R_{uv})" /> &amp; 3D Jacobian Explorer
          </h2>
        </div>

        <div className="px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs">
          <KaTeXMath math="\iint_{R_{xy}} f(x,y)\,dx\,dy = \iint_{R_{uv}} f(x(u,v),y(u,v))\,\left|\frac{\partial(x,y)}{\partial(u,v)}\right|\,du\,dv" />
        </div>
      </div>

      {/* Pullback Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {PULLBACK_PRESETS.map((p) => {
          const active = !isCustom && p.id === presetId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              aria-pressed={active}
              className={`p-3 border text-left transition-colors flex flex-col justify-between gap-1.5 ${
                active
                  ? "border-[var(--math-ink-y)] bg-[var(--bg-canvas)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] opacity-80 hover:opacity-100"
              }`}
            >
              <span className="text-[11px] font-tabular-mono font-semibold text-[var(--math-ink-y)]">
                {p.badge}
              </span>
              <span className="text-xs font-medium text-[var(--text-primary)] leading-snug">
                {p.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Integrand, Mapping & Editable (u,v) Region Limits */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <MathExpressionInput
            label="Physical Integrand f(x, y)"
            allowedVars={["x", "y"]}
            value={fExpr}
            onChange={(val) => {
              setFExpr(val);
              setIsCustom(true);
            }}
            prefixLatex="f(x,y) ="
            placeholder="e.g. x^2 + y^2"
            quickTokens={[
              { label: "1 (Area)", insert: "1" },
              { label: "x² + y²", insert: "x^2 + y^2" },
              { label: "x·y", insert: "x*y" },
            ]}
          />
          <MathExpressionInput
            label="Forward Mapping x(u, v)"
            allowedVars={["u", "v"]}
            value={xExpr}
            onChange={(val) => {
              setXExpr(val);
              setIsCustom(true);
            }}
            prefixLatex="x(u,v) ="
            placeholder="e.g. 2*u*cos(v)"
            quickTokens={[
              { label: "u·cos(v)", insert: "u*cos(v)" },
              { label: "0.5(u+v)", insert: "0.5*(u+v)" },
              { label: "sqrt(u/v)", insert: "sqrt(u/v)" },
            ]}
          />
          <MathExpressionInput
            label="Forward Mapping y(u, v)"
            allowedVars={["u", "v"]}
            value={yExpr}
            onChange={(val) => {
              setYExpr(val);
              setIsCustom(true);
            }}
            prefixLatex="y(u,v) ="
            placeholder="e.g. 1.2*u*sin(v)"
            quickTokens={[
              { label: "u·sin(v)", insert: "u*sin(v)" },
              { label: "0.5(u-v)", insert: "0.5*(u-v)" },
              { label: "sqrt(u·v)", insert: "sqrt(u*v)" },
            ]}
          />
        </div>

        <div className="border-t border-[var(--border-subtle)] pt-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)]">
              Define Pulled-Back Integration Limits in (u, v) Space:
            </span>
            <span className="text-[11px] font-tabular-mono text-[var(--text-muted)]">
              Inner bounds v_min(u), v_max(u) can be constants or functions of u
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MathExpressionInput
              label="Outer Lower Limit u_min"
              allowedVars={[]}
              value={uMinExpr}
              onChange={(val) => {
                setUMinExpr(val);
                setIsCustom(true);
              }}
              prefixLatex="u_{\min} ="
              placeholder="0"
              compact
            />
            <MathExpressionInput
              label="Outer Upper Limit u_max"
              allowedVars={[]}
              value={uMaxExpr}
              onChange={(val) => {
                setUMaxExpr(val);
                setIsCustom(true);
              }}
              prefixLatex="u_{\max} ="
              placeholder="2"
              compact
            />
            <MathExpressionInput
              label="Inner Lower Limit v_min(u)"
              allowedVars={["u"]}
              value={vMinExpr}
              onChange={(val) => {
                setVMinExpr(val);
                setIsCustom(true);
              }}
              prefixLatex="v_{\min}(u) ="
              placeholder="0"
              compact
            />
            <MathExpressionInput
              label="Inner Upper Limit v_max(u)"
              allowedVars={["u"]}
              value={vMaxExpr}
              onChange={(val) => {
                setVMaxExpr(val);
                setIsCustom(true);
              }}
              prefixLatex="v_{\max}(u) ="
              placeholder="2*pi"
              compact
            />
          </div>
        </div>
      </div>

      {/* Visual Pullback Comparison + Live Integral Readout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Pulled-Back (u,v) Region vs Physical (x,y) Region (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pulled-Back Region R_uv */}
            <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)]">
                  PULLED-BACK DOMAIN R_uv
                </span>
                <span className="text-[11px] font-tabular-mono text-[var(--text-muted)]">
                  Area(R_uv) = {pullbackEvaluation.parameterArea.toFixed(3)}
                </span>
              </div>
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full h-56 border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
                role="img"
                aria-label="Pulled-back integration domain R_uv in parameter space"
              >
                {pullbackEvaluation.cells.map((cell, idx) => (
                  <polygon
                    key={`uv-cell-${idx}`}
                    points={cell.uvPoints
                      .map(([uu, vv]) => mapUV(uu, vv))
                      .join(" ")}
                    fill={getJacobianCellColor(cell.absJ)}
                    fillOpacity="0.28"
                    stroke="#96B898"
                    strokeWidth="0.7"
                    strokeOpacity="0.6"
                  />
                ))}
                <text
                  x={svgW - 22}
                  y={svgH - 8}
                  fill="var(--math-ink-x)"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                >
                  u
                </text>
                <text
                  x={10}
                  y={18}
                  fill="var(--math-ink-y)"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                >
                  v
                </text>
              </svg>
            </div>

            {/* Physical Region R_xy = T(R_uv) */}
            <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)]">
                  PHYSICAL DOMAIN R_xy = T(R_uv)
                </span>
                <span className="text-[11px] font-tabular-mono text-[var(--math-ink-diff)]">
                  Area(R_xy) = {pullbackEvaluation.physicalArea.toFixed(3)}
                </span>
              </div>
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full h-56 border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
                role="img"
                aria-label="Physical integration domain R_xy in (x, y) coordinates tinted by local Jacobian factor"
              >
                {pullbackEvaluation.cells.map((cell, idx) => (
                  <polygon
                    key={`xy-cell-${idx}`}
                    points={cell.xyPoints
                      .map(([xx, yy]) => mapXY(xx, yy))
                      .join(" ")}
                    fill={getJacobianCellColor(cell.absJ)}
                    fillOpacity="0.32"
                    stroke="#D35323"
                    strokeWidth="0.7"
                    strokeOpacity="0.65"
                  />
                ))}
                <text
                  x={svgW - 22}
                  y={svgH - 8}
                  fill="var(--math-ink-x)"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                >
                  x
                </text>
                <text
                  x={10}
                  y={18}
                  fill="var(--math-ink-y)"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                >
                  y
                </text>
              </svg>
            </div>
          </div>

          {/* Discrete Color Legend for |det J| */}
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <span className="text-[var(--text-muted)]">
              CELL DISTORTION LEGEND (|det J| ∈ [
              {pullbackEvaluation.minAbsJ.toFixed(2)},{" "}
              {pullbackEvaluation.maxAbsJ.toFixed(2)}]):
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[var(--math-ink-x)]">
                ■ |det J| &lt; 0.85 (Compressed)
              </span>
              <span className="text-[var(--math-ink-diff)]">
                ■ |det J| ≈ 1.0 (Preserved)
              </span>
              <span className="text-[var(--math-ink-sweep)]">
                ■ |det J| &gt; 1.15 (Expanded)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Integral Pullback Formula & Numerical Comparison (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[var(--math-ink-y)]" />
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)]">
                Transformed Double Integral Evaluation
              </span>
            </div>

            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
              <KaTeXMath
                block
                math={`\\int_{${compiledUMin.tex}}^{${compiledUMax.tex}} \\int_{${compiledVMin.tex}}^{${compiledVMax.tex}} \\left(${compiledF.tex}\\right) \\color{#D35323}{\\left|\\det J(u,v)\\right|}\\,dv\\,du \\approx \\mathbf{${pullbackEvaluation.integralWithJacobian.toFixed(4)}}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-tabular-mono">
              <div className="p-2.5 border border-[var(--math-ink-y)] bg-[var(--bg-panel)] space-y-1">
                <span className="text-[10px] text-[var(--math-ink-y)] block">
                  TRUE INTEGRAL (WITH |det J|)
                </span>
                <span className="text-base font-semibold text-[var(--text-primary)]">
                  {pullbackEvaluation.integralWithJacobian.toFixed(4)}
                </span>
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
                <span className="text-[10px] text-[var(--math-ink-upper)] block">
                  UNWEIGHTED (OMITTING |det J|)
                </span>
                <span className="text-base font-semibold text-[var(--math-ink-upper)]">
                  {pullbackEvaluation.integralWithoutJacobian.toFixed(4)}
                </span>
              </div>
            </div>

            {!isCustom && (
              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1.5 overflow-x-auto">
                <span className="text-[11px] font-tabular-mono text-[var(--math-ink-grid)] block">
                  PRESET FORMULATION:
                </span>
                <KaTeXMath math={activePreset.pullbackLatex} block />
                <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
                  {activePreset.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3D Jacobian Matrix Explorer (3x3 Determinant) */}
      <div className="border-t border-[var(--border-subtle)] pt-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--math-ink-z)]" />
            <h3 className="font-math-serif text-lg font-semibold text-[var(--text-primary)]">
              3D Change of Variables &amp; <KaTeXMath math="3 \times 3" /> Jacobian Determinant Explorer
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {THREE_D_SYSTEMS.map((sys) => {
              const active = sys.id === threeDId;
              return (
                <button
                  key={sys.id}
                  type="button"
                  onClick={() => setThreeDId(sys.id)}
                  aria-pressed={active}
                  className={`px-3 py-1.5 text-xs font-tabular-mono border ${
                    active
                      ? "border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-[var(--math-ink-z)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
                  }`}
                >
                  {sys.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4">
          <div className="lg:col-span-6 p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
            <KaTeXMath math={activeThreeD.matrixLatex} block />
          </div>
          <div className="lg:col-span-6 space-y-2.5">
            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
              <KaTeXMath math={activeThreeD.mappingLatex} block />
            </div>
            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto">
              <KaTeXMath math={activeThreeD.detLatex} block />
            </div>
            <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
              {activeThreeD.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
