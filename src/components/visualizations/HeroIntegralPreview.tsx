"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { RotateCcw, ArrowLeftRight, Play, Pause } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";

const HeroIntegral3DViewport = dynamic(
  () =>
    import("@/components/visualizations/HeroIntegral3DViewport").then(
      (mod) => mod.HeroIntegral3DViewport
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-xs font-tabular-mono text-[#A39F90]">
        Initializing 3D Surface Viewport…
      </div>
    ),
  }
);

type IntegrationOrder = "dydx" | "dxdy";

interface HeroRegionPreset {
  id: string;
  label: string;
  integrand?: string;
  xMin: string;
  xMax: string;
  yMinOfX: string;
  yMaxOfX: string;
  yMin: string;
  yMax: string;
  xMinOfY: string;
  xMaxOfY: string;
}

const HERO_REGION_PRESETS: HeroRegionPreset[] = [
  {
    id: "spandrel",
    label: "Parabolic Spandrel (y ∈ [x², 1])",
    xMin: "0",
    xMax: "1",
    yMinOfX: "x^2",
    yMaxOfX: "1",
    yMin: "0",
    yMax: "1",
    xMinOfY: "0",
    xMaxOfY: "sqrt(y)",
  },
  {
    id: "quarter-disk",
    label: "Quarter Disk (x² + y² ≤ 1)",
    integrand: "sqrt(1 - (x^2 + y^2))",
    xMin: "0",
    xMax: "1",
    yMinOfX: "0",
    yMaxOfX: "sqrt(1 - x^2)",
    yMin: "0",
    yMax: "1",
    xMinOfY: "0",
    xMaxOfY: "sqrt(1 - y^2)",
  },
  {
    id: "triangle",
    label: "Upper Triangle (y ∈ [x, 1])",
    xMin: "0",
    xMax: "1",
    yMinOfX: "x",
    yMaxOfX: "1",
    yMin: "0",
    yMax: "1",
    xMinOfY: "0",
    xMaxOfY: "y",
  },
  {
    id: "unit-square",
    label: "Unit Square ([0, 1] × [0, 1])",
    xMin: "0",
    xMax: "1",
    yMinOfX: "0",
    yMaxOfX: "1",
    yMin: "0",
    yMax: "1",
    xMinOfY: "0",
    xMaxOfY: "1",
  },
];

/**
 * Interactive 2D + 3D Synchronized Preview for the Landing Hub
 * Supports typing any custom integrand f(x, y) AND custom integration limits
 * to define the 2D region of integration R in both Type I (dy dx) and Type II (dx dy).
 */
export function HeroIntegralPreview() {
  const [initWebgl, setInitWebgl] = useState<boolean>(false);
  const triggerWebglInit = useCallback(() => {
    setInitWebgl(true);
  }, []);

  const [order, setOrder] = useState<IntegrationOrder>("dydx");
  const [sliceNorm, setSliceNorm] = useState<number>(0.55);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [exprStr, setExprStr] = useState<string>("1.5 - 0.45*(x^2 + y^2)");
  const [activePresetId, setActivePresetId] = useState<string>("spandrel");

  // Type I (dy dx) user-editable limits: x in [xMinStr, xMaxStr], y in [yMinOfXStr, yMaxOfXStr]
  const [xMinStr, setXMinStr] = useState<string>("0");
  const [xMaxStr, setXMaxStr] = useState<string>("1");
  const [yMinOfXStr, setYMinOfXStr] = useState<string>("x^2");
  const [yMaxOfXStr, setYMaxOfXStr] = useState<string>("1");

  // Type II (dx dy) user-editable limits: y in [yMinStr, yMaxStr], x in [xMinOfYStr, xMaxOfYStr]
  const [yMinStr, setYMinStr] = useState<string>("0");
  const [yMaxStr, setYMaxStr] = useState<string>("1");
  const [xMinOfYStr, setXMinOfYStr] = useState<string>("0");
  const [xMaxOfYStr, setXMaxOfYStr] = useState<string>("sqrt(y)");

  // Compile integrand with fallbackValue = 0 so out-of-domain radicals (e.g. sqrt(1 - x^2 - y^2) for x^2+y^2 > 1)
  // sit cleanly at z = 0 on the xy-plane instead of jumping upward.
  const compiledFn = useMemo(
    () => compileMathExpression(exprStr, ["x", "y"], 0),
    [exprStr]
  );

  // Compile Type I limits
  const compiledXMin = useMemo(
    () => compileMathExpression(xMinStr, [], 0),
    [xMinStr]
  );
  const compiledXMax = useMemo(
    () => compileMathExpression(xMaxStr, [], 1),
    [xMaxStr]
  );
  const compiledYMinOfX = useMemo(
    () => compileMathExpression(yMinOfXStr, ["x"], 0),
    [yMinOfXStr]
  );
  const compiledYMaxOfX = useMemo(
    () => compileMathExpression(yMaxOfXStr, ["x"], 1),
    [yMaxOfXStr]
  );

  // Compile Type II limits
  const compiledYMin = useMemo(
    () => compileMathExpression(yMinStr, [], 0),
    [yMinStr]
  );
  const compiledYMax = useMemo(
    () => compileMathExpression(yMaxStr, [], 1),
    [yMaxStr]
  );
  const compiledXMinOfY = useMemo(
    () => compileMathExpression(xMinOfYStr, ["y"], 0),
    [xMinOfYStr]
  );
  const compiledXMaxOfY = useMemo(
    () => compileMathExpression(xMaxOfYStr, ["y"], 1),
    [xMaxOfYStr]
  );

  const evalF = React.useCallback(
    (x: number, y: number) => Math.max(0, compiledFn.evaluate({ x, y })),
    [compiledFn]
  );

  const xRange = useMemo((): [number, number] => {
    const a = Math.max(-4, Math.min(4, compiledXMin.evaluate({})));
    const b = Math.max(a + 0.05, Math.min(4, compiledXMax.evaluate({})));
    return [a, b];
  }, [compiledXMin, compiledXMax]);

  const yRange = useMemo((): [number, number] => {
    const c = Math.max(-4, Math.min(4, compiledYMin.evaluate({})));
    const d = Math.max(c + 0.05, Math.min(4, compiledYMax.evaluate({})));
    return [c, d];
  }, [compiledYMin, compiledYMax]);

  const evalYBounds = React.useCallback(
    (x: number): [number, number] => {
      const y1 = Math.max(-4, Math.min(4, compiledYMinOfX.evaluate({ x })));
      const y2 = Math.max(y1, Math.min(4, compiledYMaxOfX.evaluate({ x })));
      return [y1, y2];
    },
    [compiledYMinOfX, compiledYMaxOfX]
  );

  const evalXBounds = React.useCallback(
    (y: number): [number, number] => {
      const x1 = Math.max(-4, Math.min(4, compiledXMinOfY.evaluate({ y })));
      const x2 = Math.max(x1, Math.min(4, compiledXMaxOfY.evaluate({ y })));
      return [x1, x2];
    },
    [compiledXMinOfY, compiledXMaxOfY]
  );

  const outerRange = order === "dydx" ? xRange : yRange;
  const slicePos =
    outerRange[0] + sliceNorm * (outerRange[1] - outerRange[0]);

  const handleApplyRegionPreset = (preset: HeroRegionPreset) => {
    setActivePresetId(preset.id);
    if (preset.integrand) {
      setExprStr(preset.integrand);
    }
    setXMinStr(preset.xMin);
    setXMaxStr(preset.xMax);
    setYMinOfXStr(preset.yMinOfX);
    setYMaxOfXStr(preset.yMaxOfX);
    setYMinStr(preset.yMin);
    setYMaxStr(preset.yMax);
    setXMinOfYStr(preset.xMinOfY);
    setXMaxOfYStr(preset.xMaxOfY);
  };

  // Animate normalized slice position when playing
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setSliceNorm((prev) => {
        const next = prev + dt * 0.28;
        return next > 0.96 ? 0.04 : next;
      });
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Defer WebGL bundle fetch + shader compilation until after first paint / idle (or user interaction)
  useEffect(() => {
    if (initWebgl) return;
    let rafId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    rafId = requestAnimationFrame(() => {
      const win = window as Window & {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number }
        ) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      if (typeof win.requestIdleCallback === "function") {
        idleId = win.requestIdleCallback(() => setInitWebgl(true), {
          timeout: 220,
        });
      } else {
        timeoutId = setTimeout(() => setInitWebgl(true), 80);
      }
    });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (timeoutId !== null) clearTimeout(timeoutId);
      const win = window as Window & {
        cancelIdleCallback?: (id: number) => void;
      };
      if (idleId !== null && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }
    };
  }, [initWebgl]);

  // Compute live cross-sectional area A(x) or A(y) and total volume numerically
  const { sliceArea, totalVolume } = useMemo(() => {
    const M = 32;
    let sArea = 0;
    if (order === "dydx") {
      const x = slicePos;
      const [y1, y2] = evalYBounds(x);
      const dy = (y2 - y1) / M;
      if (dy > 0) {
        for (let i = 0; i < M; i++) {
          sArea += evalF(x, y1 + (i + 0.5) * dy) * dy;
        }
      }
    } else {
      const y = slicePos;
      const [x1, x2] = evalXBounds(y);
      const dx = (x2 - x1) / M;
      if (dx > 0) {
        for (let i = 0; i < M; i++) {
          sArea += evalF(x1 + (i + 0.5) * dx, y) * dx;
        }
      }
    }

    let vol = 0;
    const Nx = 32;
    const Ny = 32;
    if (order === "dydx") {
      const [xA, xB] = xRange;
      const dx = (xB - xA) / Nx;
      for (let i = 0; i < Nx; i++) {
        const x = xA + (i + 0.5) * dx;
        const [y1, y2] = evalYBounds(x);
        const dy = (y2 - y1) / Ny;
        if (dy <= 0) continue;
        for (let j = 0; j < Ny; j++) {
          const y = y1 + (j + 0.5) * dy;
          vol += evalF(x, y) * dx * dy;
        }
      }
    } else {
      const [yC, yD] = yRange;
      const dy = (yD - yC) / Ny;
      for (let i = 0; i < Ny; i++) {
        const y = yC + (i + 0.5) * dy;
        const [x1, x2] = evalXBounds(y);
        const dx = (x2 - x1) / Nx;
        if (dx <= 0) continue;
        for (let j = 0; j < Nx; j++) {
          const x = x1 + (j + 0.5) * dx;
          vol += evalF(x, y) * dx * dy;
        }
      }
    }

    return { sliceArea: sArea, totalVolume: vol };
  }, [order, slicePos, xRange, yRange, evalYBounds, evalXBounds, evalF]);

  // Dynamic 2D SVG paths for the user's integration region
  const svgGeometry = useMemo(() => {
    const N = 48;
    let maxCoord = 1.0;

    if (order === "dydx") {
      const [xA, xB] = xRange;
      maxCoord = Math.max(maxCoord, Math.abs(xA), Math.abs(xB));
      for (let i = 0; i <= N; i++) {
        const x = xA + (i / N) * (xB - xA);
        const [y1, y2] = evalYBounds(x);
        maxCoord = Math.max(maxCoord, Math.abs(y1), Math.abs(y2));
      }
    } else {
      const [yC, yD] = yRange;
      maxCoord = Math.max(maxCoord, Math.abs(yC), Math.abs(yD));
      for (let i = 0; i <= N; i++) {
        const y = yC + (i / N) * (yD - yC);
        const [x1, x2] = evalXBounds(y);
        maxCoord = Math.max(maxCoord, Math.abs(x1), Math.abs(x2));
      }
    }

    const scale = 145 / Math.max(0.25, maxCoord);
    const toSvgX = (x: number) => 30 + Math.max(0, x) * scale;
    const toSvgY = (y: number) => 175 - Math.max(0, y) * scale;

    const lowerPts: [number, number][] = [];
    const upperPts: [number, number][] = [];

    if (order === "dydx") {
      const [xA, xB] = xRange;
      for (let i = 0; i <= N; i++) {
        const x = xA + (i / N) * (xB - xA);
        const [y1, y2] = evalYBounds(x);
        lowerPts.push([toSvgX(x), toSvgY(y1)]);
        upperPts.push([toSvgX(x), toSvgY(y2)]);
      }
    } else {
      const [yC, yD] = yRange;
      for (let i = 0; i <= N; i++) {
        const y = yC + (i / N) * (yD - yC);
        const [x1, x2] = evalXBounds(y);
        lowerPts.push([toSvgX(x1), toSvgY(y)]);
        upperPts.push([toSvgX(x2), toSvgY(y)]);
      }
    }

    const lowerPath = lowerPts
      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
      .join(" ");
    const upperPath = upperPts
      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
      .join(" ");

    const polygonPts = [...lowerPts, ...[...upperPts].reverse()];
    const fillPath =
      polygonPts
        .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
        .join(" ") + " Z";

    let stripX1 = 30;
    let stripY1 = 175;
    let stripX2 = 30;
    let stripY2 = 175;

    if (order === "dydx") {
      const [y1, y2] = evalYBounds(slicePos);
      stripX1 = toSvgX(slicePos);
      stripX2 = toSvgX(slicePos);
      stripY1 = toSvgY(y1);
      stripY2 = toSvgY(y2);
    } else {
      const [x1, x2] = evalXBounds(slicePos);
      stripX1 = toSvgX(x1);
      stripX2 = toSvgX(x2);
      stripY1 = toSvgY(slicePos);
      stripY2 = toSvgY(slicePos);
    }

    return {
      lowerPath,
      upperPath,
      fillPath,
      stripX1,
      stripY1,
      stripX2,
      stripY2,
      maxCoord,
    };
  }, [order, xRange, yRange, evalYBounds, evalXBounds, slicePos]);

  return (
    <div className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-4 sm:p-6 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
            Interactive Live Preview • Custom Equation, Region &amp; Fubini Slicing
          </span>
          <h2 className="font-math-serif text-xl font-semibold text-[var(--text-primary)]">
            Synchronized 2D Domain Strip &amp; 3D Cross-Sectional Curtain
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setOrder((prev) => (prev === "dydx" ? "dxdy" : "dydx"))
            }
            className="px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-elevated)] text-xs font-tabular-mono font-medium text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeftRight
              className="w-3.5 h-3.5 text-[var(--math-ink-sweep)]"
              aria-hidden="true"
            />
            <span>
              Swap Order:{" "}
              {order === "dydx" ? "Type I (dy dx)" : "Type II (dx dy)"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)] text-xs font-tabular-mono text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[var(--math-ink-diff)]" />
                <span>Pause Sweep</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[var(--math-ink-y)]" />
                <span>Sweep Slice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Custom Math Expression Input Bar for Integrand */}
      <MathExpressionInput
        label="1. Type Any Custom Integrand Surface z = f(x, y):"
        value={exprStr}
        onChange={setExprStr}
        allowedVars={["x", "y"]}
        prefixLatex="f(x,y) ="
        placeholder="sqrt(1 - (x^2 + y^2))"
        accentHex="#8D9FCE"
      />

      {/* Custom Integration Region & Limits Editor */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-primary)] font-semibold">
            2. Define Integration Region R &amp; Integral Limits (
            {order === "dydx" ? "Type I: dy dx" : "Type II: dx dy"}):
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {HERO_REGION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyRegionPreset(preset)}
                className={`px-2 py-1 text-[11px] font-tabular-mono border transition-colors cursor-pointer ${
                  activePresetId === preset.id
                    ? "border-[var(--border-strong)] bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {order === "dydx" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MathExpressionInput
              label="Outer Lower Limit x_min (a):"
              value={xMinStr}
              onChange={(v) => {
                setActivePresetId("custom");
                setXMinStr(v);
              }}
              allowedVars={[]}
              prefixLatex="a ="
              placeholder="0"
              accentHex="#8D9FCE"
            />
            <MathExpressionInput
              label="Outer Upper Limit x_max (b):"
              value={xMaxStr}
              onChange={(v) => {
                setActivePresetId("custom");
                setXMaxStr(v);
              }}
              allowedVars={[]}
              prefixLatex="b ="
              placeholder="1"
              accentHex="#8D9FCE"
            />
            <MathExpressionInput
              label="Inner Lower Curve y_min(x):"
              value={yMinOfXStr}
              onChange={(v) => {
                setActivePresetId("custom");
                setYMinOfXStr(v);
              }}
              allowedVars={["x"]}
              prefixLatex="g_1(x) ="
              placeholder="x^2"
              accentHex="#D5658B"
            />
            <MathExpressionInput
              label="Inner Upper Curve y_max(x):"
              value={yMaxOfXStr}
              onChange={(v) => {
                setActivePresetId("custom");
                setYMaxOfXStr(v);
              }}
              allowedVars={["x"]}
              prefixLatex="g_2(x) ="
              placeholder="sqrt(1 - x^2)"
              accentHex="#B95869"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MathExpressionInput
              label="Outer Lower Limit y_min (c):"
              value={yMinStr}
              onChange={(v) => {
                setActivePresetId("custom");
                setYMinStr(v);
              }}
              allowedVars={[]}
              prefixLatex="c ="
              placeholder="0"
              accentHex="#96B898"
            />
            <MathExpressionInput
              label="Outer Upper Limit y_max (d):"
              value={yMaxStr}
              onChange={(v) => {
                setActivePresetId("custom");
                setYMaxStr(v);
              }}
              allowedVars={[]}
              prefixLatex="d ="
              placeholder="1"
              accentHex="#96B898"
            />
            <MathExpressionInput
              label="Inner Lower Curve x_min(y):"
              value={xMinOfYStr}
              onChange={(v) => {
                setActivePresetId("custom");
                setXMinOfYStr(v);
              }}
              allowedVars={["y"]}
              prefixLatex="h_1(y) ="
              placeholder="0"
              accentHex="#8D9FCE"
            />
            <MathExpressionInput
              label="Inner Upper Curve x_max(y):"
              value={xMaxOfYStr}
              onChange={(v) => {
                setActivePresetId("custom");
                setXMaxOfYStr(v);
              }}
              allowedVars={["y"]}
              prefixLatex="h_2(y) ="
              placeholder="sqrt(1 - y^2)"
              accentHex="#D5658B"
            />
          </div>
        )}
      </div>

      {/* Main Split Viewports: Left 3D WebGL + Right 2D Domain & Live KaTeX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 3D WebGL Stage */}
        <div className="lg:col-span-7 flex flex-col justify-between border border-[var(--border-subtle)] bg-[#1E1F22] relative min-h-[360px]">
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[#25272C] border border-[#383B43] text-[11px] font-tabular-mono text-[#FFFBE4] flex items-center gap-3">
            <span>3D Viewport (Drag to Orbit)</span>
            <span className="text-[#8D9FCE]">x</span>
            <span className="text-[#96B898]">y</span>
            <span className="text-[#28B7B8]">z</span>
          </div>

          <div
            onPointerEnter={triggerWebglInit}
            onTouchStart={triggerWebglInit}
            className="w-full h-[360px] cursor-grab relative"
          >
            {initWebgl ? (
              <HeroIntegral3DViewport
                order={order}
                xRange={xRange}
                yRange={yRange}
                slicePos={slicePos}
                evalYBounds={evalYBounds}
                evalXBounds={evalXBounds}
                evalF={evalF}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-tabular-mono text-[#A39F90] pointer-events-none">
                Initializing 3D Surface Viewport…
              </div>
            )}
          </div>

          <div className="px-3 py-2 border-t border-[#383B43] bg-[#25272C] flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono text-[#CCC8B8]">
            <span>
              Active Slice:{" "}
              <strong className="text-[#FBEAA4]">
                {order === "dydx"
                  ? `x = ${slicePos.toFixed(2)}`
                  : `y = ${slicePos.toFixed(2)}`}
              </strong>
            </span>
            <span>
              Cross-Section Area:{" "}
              <strong className="text-[#EF7547]">
                {sliceArea.toFixed(4)}
              </strong>
            </span>
            <span>
              Total Volume V ={" "}
              <strong className="text-[#96B898]">
                {totalVolume.toFixed(4)}
              </strong>
            </span>
          </div>
        </div>

        {/* Right: 2D Domain SVG + Slider + Color-Linked Formula */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* 2D Domain xy-plane View */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)] mb-1">
              <span>2D Integration Domain R (xy-plane)</span>
              <span className="text-[var(--math-ink-sweep)] font-semibold">
                {order === "dydx"
                  ? "Vertical Strip (dy)"
                  : "Horizontal Strip (dx)"}
              </span>
            </div>

            <svg
              viewBox="0 0 210 200"
              className="w-full max-w-[230px] h-auto"
              role="img"
              aria-label="2D region of integration in the xy-plane"
            >
              {[0.25, 0.5, 0.75, 1].map((t) => (
                <React.Fragment key={t}>
                  <line
                    x1={30 + t * 145}
                    y1={30}
                    x2={30 + t * 145}
                    y2={175}
                    stroke="#383B43"
                    strokeDasharray="2 2"
                    strokeWidth="0.75"
                  />
                  <line
                    x1={30}
                    y1={175 - t * 145}
                    x2={175}
                    y2={175 - t * 145}
                    stroke="#383B43"
                    strokeDasharray="2 2"
                    strokeWidth="0.75"
                  />
                </React.Fragment>
              ))}

              <path
                d={svgGeometry.fillPath}
                fill="#029091"
                fillOpacity="0.24"
              />

              <line
                x1={svgGeometry.stripX1}
                y1={svgGeometry.stripY1}
                x2={svgGeometry.stripX2}
                y2={svgGeometry.stripY2}
                stroke="#D35323"
                strokeWidth="4"
              />

              <path
                d={svgGeometry.upperPath}
                fill="none"
                stroke="#B95869"
                strokeWidth="2.5"
              />

              <path
                d={svgGeometry.lowerPath}
                fill="none"
                stroke="#D5658B"
                strokeWidth="2.5"
              />

              <line
                x1={30}
                y1={175}
                x2={190}
                y2={175}
                stroke="#8D9FCE"
                strokeWidth="1.5"
              />
              <line
                x1={30}
                y1={175}
                x2={30}
                y2={15}
                stroke="#96B898"
                strokeWidth="1.5"
              />

              <text
                x={193}
                y={179}
                fill="var(--math-ink-x)"
                fontSize="11"
                fontFamily="monospace"
              >
                x
              </text>
              <text
                x={26}
                y={12}
                fill="var(--math-ink-y)"
                fontSize="11"
                fontFamily="monospace"
              >
                y
              </text>
              <text
                x={42}
                y={24}
                fill="var(--math-ink-upper)"
                fontSize="9.5"
                fontFamily="monospace"
              >
                {order === "dydx"
                  ? `y = ${yMaxOfXStr}`
                  : `x = ${xMaxOfYStr}`}
              </text>
              <text
                x={92}
                y={166}
                fill="var(--math-ink-lower)"
                fontSize="9.5"
                fontFamily="monospace"
              >
                {order === "dydx"
                  ? `y = ${yMinOfXStr}`
                  : `x = ${xMinOfYStr}`}
              </text>
            </svg>
          </div>

          {/* Slice Position Scrubber */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <label
                htmlFor="hero-slice-slider"
                className="text-[var(--text-secondary)]"
              >
                {order === "dydx"
                  ? `Outer Slice Position x₀ ∈ [${outerRange[0].toFixed(2)}, ${outerRange[1].toFixed(2)}]`
                  : `Outer Slice Position y₀ ∈ [${outerRange[0].toFixed(2)}, ${outerRange[1].toFixed(2)}]`}
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setSliceNorm(0.55);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                title="Reset slider"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
            <input
              id="hero-slice-slider"
              type="range"
              min={0.04}
              max={0.96}
              step={0.01}
              value={sliceNorm}
              onChange={(e) => {
                setIsPlaying(false);
                setSliceNorm(parseFloat(e.target.value));
              }}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Live Color-Coded KaTeX Iterated Integral */}
          <div className="border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-3">
            <div className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] mb-1">
              {order === "dydx"
                ? "Type I Formulation (Vertical Strips dy dx)"
                : "Type II Formulation (Horizontal Strips dx dy)"}
            </div>
            {order === "dydx" ? (
              <KaTeXMath
                block
                math={`\\int_{\\textcolor{#8D9FCE}{${compiledXMin.tex}}}^{\\textcolor{#8D9FCE}{${compiledXMax.tex}}} \\left[ \\int_{\\textcolor{#D5658B}{${compiledYMinOfX.tex}}}^{\\textcolor{#B95869}{${compiledYMaxOfX.tex}}} \\left(${compiledFn.tex}\\right)\\,\\textcolor{#D35323}{dy} \\right] \\textcolor{#8D9FCE}{dx} \\approx ${totalVolume.toFixed(
                  4
                )}`}
              />
            ) : (
              <KaTeXMath
                block
                math={`\\int_{\\textcolor{#96B898}{${compiledYMin.tex}}}^{\\textcolor{#96B898}{${compiledYMax.tex}}} \\left[ \\int_{\\textcolor{#8D9FCE}{${compiledXMinOfY.tex}}}^{\\textcolor{#D5658B}{${compiledXMaxOfY.tex}}} \\left(${compiledFn.tex}\\right)\\,\\textcolor{#D35323}{dx} \\right] \\textcolor{#96B898}{dy} \\approx ${totalVolume.toFixed(
                  4
                )}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
