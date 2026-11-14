"use client";

import React from "react";

export interface SvgCoordinatePlane2DProps {
  /** World coordinate bounds [xMin, xMax] and [yMin, yMax] */
  xRange: [number, number];
  yRange: [number, number];
  /** ViewBox width & height in SVG user units */
  width?: number;
  height?: number;
  padding?: number;
  /** Axis labels */
  xLabel?: string;
  yLabel?: string;
  xColor?: string;
  yColor?: string;
  /** Accessible name for the SVG diagram */
  ariaLabel: string;
  /** Number of grid subdivisions along each axis */
  gridDivisions?: number;
  /** Optional click/drag handler returning world coordinates (x, y) */
  onSelectPoint?: (x: number, y: number) => void;
  className?: string;
  /** Render prop receiving world-to-SVG coordinate helpers */
  children: (helpers: {
    toSvgX: (x: number) => number;
    toSvgY: (y: number) => number;
    toSvgPoint: (x: number, y: number) => [number, number];
    innerWidth: number;
    innerHeight: number;
  }) => React.ReactNode;
}

export function SvgCoordinatePlane2D({
  xRange,
  yRange,
  width = 340,
  height = 280,
  padding = 32,
  xLabel = "x",
  yLabel = "y",
  xColor = "var(--math-ink-x)",
  yColor = "var(--math-ink-y)",
  ariaLabel,
  gridDivisions = 6,
  onSelectPoint,
  className = "w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-panel)] select-none",
  children,
}: SvgCoordinatePlane2DProps) {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const xSpan = Math.max(xMax - xMin, 1e-6);
  const ySpan = Math.max(yMax - yMin, 1e-6);
  const innerWidth = width - 2 * padding;
  const innerHeight = height - 2 * padding;

  const toSvgX = (x: number) => padding + ((x - xMin) / xSpan) * innerWidth;
  const toSvgY = (y: number) =>
    height - padding - ((y - yMin) / ySpan) * innerHeight;
  const toSvgPoint = (x: number, y: number): [number, number] => [
    toSvgX(x),
    toSvgY(y),
  ];

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onSelectPoint) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * width;
    const sy = ((e.clientY - rect.top) / rect.height) * height;
    const worldX = xMin + ((sx - padding) / innerWidth) * xSpan;
    const worldY = yMin + ((height - padding - sy) / innerHeight) * ySpan;
    const clampedX = Math.max(xMin, Math.min(xMax, worldX));
    const clampedY = Math.max(yMin, Math.min(yMax, worldY));
    onSelectPoint(clampedX, clampedY);
  };

  const gridTicks = Array.from(
    { length: gridDivisions + 1 },
    (_, i) => i / gridDivisions
  );

  // Origin axes if 0 lies within range
  const zeroX = xMin <= 0 && xMax >= 0 ? toSvgX(0) : toSvgX(xMin);
  const zeroY = yMin <= 0 && yMax >= 0 ? toSvgY(0) : toSvgY(yMin);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      onClick={handleClick}
      className={`${className} ${onSelectPoint ? "cursor-crosshair" : ""}`}
    >
      {/* Background Grid Lines */}
      {gridTicks.map((t, i) => {
        const xv = xMin + t * xSpan;
        const yv = yMin + t * ySpan;
        const sx = toSvgX(xv);
        const sy = toSvgY(yv);
        return (
          <g key={i}>
            <line
              x1={sx}
              y1={padding}
              x2={sx}
              y2={height - padding}
              stroke="var(--border-subtle)"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
            <line
              x1={padding}
              y1={sy}
              x2={width - padding}
              y2={sy}
              stroke="var(--border-subtle)"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
          </g>
        );
      })}

      {/* Primary Coordinate Axes */}
      <line
        x1={padding}
        y1={zeroY}
        x2={width - padding + 8}
        y2={zeroY}
        stroke={xColor}
        strokeWidth="1.5"
      />
      <line
        x1={zeroX}
        y1={height - padding}
        x2={zeroX}
        y2={padding - 8}
        stroke={yColor}
        strokeWidth="1.5"
      />

      {/* Custom Layer Content */}
      {children({
        toSvgX,
        toSvgY,
        toSvgPoint,
        innerWidth,
        innerHeight,
      })}

      {/* Axis Labels */}
      <text
        x={width - padding + 10}
        y={zeroY + 4}
        fill={xColor}
        fontSize="11"
        fontFamily="var(--font-mono)"
      >
        {xLabel}
      </text>
      <text
        x={zeroX - 4}
        y={padding - 12}
        fill={yColor}
        fontSize="11"
        fontFamily="var(--font-mono)"
      >
        {yLabel}
      </text>
    </svg>
  );
}
