"use client";

import React, { useState, useMemo } from "react";
import { Grid, Repeat } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  SvgCoordinatePlane2D,
  integrate1DGaussLegendre,
  integrate2DIterated,
} from "@/components/visualizations/primitives";

interface GreenPreset {
  id: string;
  name: string;
  badge: string;
  pExpr: string;
  qExpr: string;
  curlFormulaLatex: string;
  note: string;
}

const GREEN_PRESETS: GreenPreset[] = [
  {
    id: "uniform-spin",
    name: "Uniform Vorticity: F = ⟨-y, x⟩",
    badge: "∂Q/∂x - ∂P/∂y = 2",
    pExpr: "-y",
    qExpr: "x",
    curlFormulaLatex:
      "\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = 1 - (-1) = 2 \\implies \\oint_{\\partial D} (-y\\,dx + x\\,dy) = 2\\operatorname{Area}(D)",
    note: "Every interior sub-square carries identical counter-clockwise circulation 2 ΔA. Interior shared edges cancel pairwise in opposite directions, leaving only the outer boundary loop.",
  },
  {
    id: "area-planimeter",
    name: "Planimeter Area Field: F = ⟨0, x⟩",
    badge: "∂Q/∂x - ∂P/∂y = 1",
    pExpr: "0",
    qExpr: "x",
    curlFormulaLatex:
      "\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = 1 \\implies \\oint_{\\partial D} x\\,dy = \\operatorname{Area}(D)",
    note: "Mechanical planimeters measure the area of any irregular 2D region simply by tracing its boundary ∂D.",
  },
  {
    id: "nonlinear-eddy",
    name: "Variable Shear Eddy: F = ⟨-y³, x³ + 0.5x⟩",
    badge: "3(x² + y²) + 0.5",
    pExpr: "-y^3",
    qExpr: "x^3 + 0.5 * x",
    curlFormulaLatex:
      "\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = 3x^2 + 3y^2 + 0.5",
    note: "Curl density varies continuously across the domain—cells further from the origin contribute stronger microscopic circulation.",
  },
  {
    id: "conservative-zero",
    name: "Zero-Curl Conservative: F = ⟨2x, 2y⟩",
    badge: "∂Q/∂x - ∂P/∂y = 0",
    pExpr: "2 * x",
    qExpr: "2 * y",
    curlFormulaLatex:
      "\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = 0 - 0 = 0 \\implies \\oint_{\\partial D} \\mathbf{F}\\cdot d\\mathbf{r} = 0",
    note: "Every microscopic cell has zero spin, so both the double integral and the closed boundary circulation equal zero.",
  },
];

export function GreensTheoremLab() {
  const [presetId, setPresetId] = useState<string>("uniform-spin");
  const [pExpr, setPExpr] = useState<string>(GREEN_PRESETS[0].pExpr);
  const [qExpr, setQExpr] = useState<string>(GREEN_PRESETS[0].qExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [subN, setSubN] = useState<number>(4);
  const [xMin] = useState<number>(-1.2);
  const [xMax, setXMax] = useState<number>(1.2);
  const [yMin] = useState<number>(-1.2);
  const [yMax, setYMax] = useState<number>(1.2);

  const activePreset = useMemo(
    () => GREEN_PRESETS.find((p) => p.id === presetId) ?? GREEN_PRESETS[0],
    [presetId]
  );

  const compiledP = useMemo(
    () => compileMathExpression(pExpr, ["x", "y"]),
    [pExpr]
  );
  const compiledQ = useMemo(
    () => compileMathExpression(qExpr, ["x", "y"]),
    [qExpr]
  );

  const handleSelectPreset = (p: GreenPreset) => {
    setPresetId(p.id);
    setPExpr(p.pExpr);
    setQExpr(p.qExpr);
    setIsCustom(false);
  };

  // Compute BOTH sides of Green's Theorem independently
  const greenStats = useMemo(() => {
    const h = 1e-4;
    const curl2D = (x: number, y: number) => {
      const dQdx =
        (compiledQ.evaluate({ x: x + h, y }) -
          compiledQ.evaluate({ x: x - h, y })) /
        (2 * h);
      const dPdy =
        (compiledP.evaluate({ x, y: y + h }) -
          compiledP.evaluate({ x, y: y - h })) /
        (2 * h);
      return dQdx - dPdy;
    };

    // 1. Boundary Circulation (4 oriented CCW edges of [xMin, xMax] x [yMin, yMax])
    const bottomEdge = integrate1DGaussLegendre(
      (x) => compiledP.evaluate({ x, y: yMin }),
      xMin,
      xMax,
      16
    );
    const rightEdge = integrate1DGaussLegendre(
      (y) => compiledQ.evaluate({ x: xMax, y }),
      yMin,
      yMax,
      16
    );
    const topEdge = -integrate1DGaussLegendre(
      (x) => compiledP.evaluate({ x, y: yMax }),
      xMin,
      xMax,
      16
    );
    const leftEdge = -integrate1DGaussLegendre(
      (y) => compiledQ.evaluate({ x: xMin, y }),
      yMin,
      yMax,
      16
    );
    const boundaryCirculation = bottomEdge + rightEdge + topEdge + leftEdge;

    // 2. Interior Double Integral of (∂Q/∂x - ∂P/∂y)
    const interiorDoubleIntegral = integrate2DIterated(
      curl2D,
      xMin,
      xMax,
      () => yMin,
      () => yMax,
      24,
      24
    );

    // 3. Subgrid cells for visual curl cancellation
    const cells: {
      x0: number;
      x1: number;
      y0: number;
      y1: number;
      curlVal: number;
    }[] = [];
    const dx = (xMax - xMin) / subN;
    const dy = (yMax - yMin) / subN;
    for (let i = 0; i < subN; i++) {
      for (let j = 0; j < subN; j++) {
        const cx0 = xMin + i * dx;
        const cx1 = cx0 + dx;
        const cy0 = yMin + j * dy;
        const cy1 = cy0 + dy;
        const val = curl2D(0.5 * (cx0 + cx1), 0.5 * (cy0 + cy1));
        cells.push({ x0: cx0, x1: cx1, y0: cy0, y1: cy1, curlVal: val });
      }
    }

    return {
      bottomEdge,
      rightEdge,
      topEdge,
      leftEdge,
      boundaryCirculation,
      interiorDoubleIntegral,
      cells,
    };
  }, [compiledP, compiledQ, xMin, xMax, yMin, yMax, subN]);

  return (
    <section
      aria-label="Green's Theorem Microscopic Curl Cancellation Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[#96B898] text-[#96B898] bg-[var(--bg-canvas)]">
              LAB 3.3.3 • GREEN&apos;S THEOREM &amp; CURL CANCELLATION GRID
            </span>
            <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
              {isCustom ? "Custom Field" : activePreset.badge}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Boundary Circulation <KaTeXMath math="\oint_{\partial D} (P\,dx + Q\,dy)" /> = Interior Curl <KaTeXMath math="\iint_D (\partial_x Q - \partial_y P)\,dA" />
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {GREEN_PRESETS.map((p) => {
            const active = !isCustom && p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "border-[#96B898] bg-[#96B898]/15 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                {p.name.split(":")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom P & Q Inputs */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4">
        <MathExpressionInput
          label="Field Component P(x, y):"
          prefixLatex="P(x,y) ="
          value={pExpr}
          onChange={(val) => {
            setPExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x", "y"]}
          compact
        />
        <MathExpressionInput
          label="Field Component Q(x, y):"
          prefixLatex="Q(x,y) ="
          value={qExpr}
          onChange={(val) => {
            setQExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x", "y"]}
          compact
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Interactive Cancellation Grid SVG */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <div className="flex items-center justify-between text-xs font-tabular-mono">
            <span className="text-[#96B898] flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5" />
              {subN} × {subN} Microscopic Circulation Loops (Interior Edges Cancel!)
            </span>
            <span className="text-[#D35323] font-semibold">
              Outer Loop ∂D (CCW)
            </span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-1.8, 2.0]}
            yRange={[-1.8, 2.0]}
            height={360}
            ariaLabel="Green's Theorem N by N Curl Cancellation Grid"
            className="w-full h-80 border border-[var(--border-subtle)] bg-[var(--bg-panel)] select-none"
          >
            {({ toSvgX, toSvgY }) => (
              <g>
                {/* Microscopic Cells */}
                {greenStats.cells.map((c, idx) => {
                  const sx0 = toSvgX(c.x0);
                  const sx1 = toSvgX(c.x1);
                  const sy0 = toSvgY(c.y1);
                  const sy1 = toSvgY(c.y0);
                  const w = Math.abs(sx1 - sx0);
                  const h = Math.abs(sy1 - sy0);
                  const cx = 0.5 * (sx0 + sx1);
                  const cy = 0.5 * (sy0 + sy1);
                  const rLoop = Math.max(4, Math.min(w, h) * 0.24);
                  const fillCol =
                    Math.abs(c.curlVal) < 1e-3
                      ? "#8D9FCE"
                      : c.curlVal > 0
                      ? "#029091"
                      : "#B95869";

                  return (
                    <g key={idx}>
                      <rect
                        x={Math.min(sx0, sx1) + 1.5}
                        y={Math.min(sy0, sy1) + 1.5}
                        width={Math.max(0, w - 3)}
                        height={Math.max(0, h - 3)}
                        fill={fillCol}
                        fillOpacity="0.22"
                        stroke="#AAA36D"
                        strokeWidth="1"
                        strokeDasharray="3 2"
                      />
                      {/* Microscopic loop circle */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={rLoop}
                        fill="none"
                        stroke="#FBEAA4"
                        strokeWidth="1.3"
                        strokeDasharray="4 2"
                      />
                    </g>
                  );
                })}

                {/* Outer Boundary Loop ∂D (#D35323 Persimmon) */}
                <rect
                  x={toSvgX(xMin)}
                  y={toSvgY(yMax)}
                  width={toSvgX(xMax) - toSvgX(xMin)}
                  height={toSvgY(yMin) - toSvgY(yMax)}
                  fill="none"
                  stroke="#D35323"
                  strokeWidth="3.2"
                />
              </g>
            )}
          </SvgCoordinatePlane2D>

          {/* Symbolic Verification Card */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <div className="overflow-x-auto py-1">
              <KaTeXMath
                math={`\\underbrace{\\oint_{\\partial D} (P\\,dx + Q\\,dy)}_{\\color{#D35323}{\\text{Boundary} = ${greenStats.boundaryCirculation.toFixed(4)}}} \\;=\\; \\underbrace{\\iint_{D} \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)dA}_{\\color{#029091}{\\text{Interior Curl} = ${greenStats.interiorDoubleIntegral.toFixed(4)}}}`}
                block
              />
            </div>
            <p className="font-math-serif text-sm text-[var(--text-secondary)]">
              {isCustom ? "Adjacent interior loop edges run in opposite directions and cancel algebraically, leaving only the outer boundary ∂D." : activePreset.note}
            </p>
          </div>
        </div>

        {/* Right: Controls & Edge-by-Edge Breakdown */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)]">
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-tabular-mono text-[#FBEAA4]">
                <span>Subdivision Resolution N × N</span>
                <span>
                  {subN} × {subN} ({subN * subN} loops)
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                step={1}
                value={subN}
                onChange={(e) => setSubN(parseInt(e.target.value, 10))}
                className="w-full accent-[#FBEAA4]"
              />
            </div>

            <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex justify-between text-xs font-tabular-mono text-[#8D9FCE]">
                <span>Domain Width x_max (y_max = x_max)</span>
                <span>[{xMin.toFixed(1)}, {xMax.toFixed(1)}]</span>
              </div>
              <input
                type="range"
                min={0.4}
                max={1.7}
                step={0.1}
                value={xMax}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setXMax(v);
                  setYMax(v);
                }}
                className="w-full accent-[#8D9FCE]"
              />
            </div>
          </div>

          {/* 4-Edge Boundary Line Integral Breakdown */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-tabular-mono text-[#D35323]">
              <Repeat className="w-3.5 h-3.5" />
              <span>BOUNDARY EDGE-BY-EDGE CONTRIBUTION (CCW)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-tabular-mono">
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[var(--text-muted)] block text-[10px]">
                  Bottom Edge (→)
                </span>
                <span className="text-[var(--text-primary)] font-semibold">
                  {greenStats.bottomEdge.toFixed(4)}
                </span>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[var(--text-muted)] block text-[10px]">
                  Right Edge (↑)
                </span>
                <span className="text-[var(--text-primary)] font-semibold">
                  {greenStats.rightEdge.toFixed(4)}
                </span>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[var(--text-muted)] block text-[10px]">
                  Top Edge (←)
                </span>
                <span className="text-[var(--text-primary)] font-semibold">
                  {greenStats.topEdge.toFixed(4)}
                </span>
              </div>
              <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <span className="text-[var(--text-muted)] block text-[10px]">
                  Left Edge (↓)
                </span>
                <span className="text-[var(--text-primary)] font-semibold">
                  {greenStats.leftEdge.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Equivalence Comparison */}
          <div className="grid grid-cols-2 gap-3 text-xs font-tabular-mono">
            <div className="p-3 border border-[#D35323]/60 bg-[var(--bg-canvas)]">
              <span className="text-[#D35323] block text-[10px]">
                ∮_∂D F · dr (1D)
              </span>
              <span className="text-lg font-semibold text-[var(--text-primary)]">
                {greenStats.boundaryCirculation.toFixed(4)}
              </span>
            </div>
            <div className="p-3 border border-[#029091]/60 bg-[var(--bg-canvas)]">
              <span className="text-[#029091] block text-[10px]">
                ∬_D (Q_x - P_y) dA (2D)
              </span>
              <span className="text-lg font-semibold text-[var(--text-primary)]">
                {greenStats.interiorDoubleIntegral.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
