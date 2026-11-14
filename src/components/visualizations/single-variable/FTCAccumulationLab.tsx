"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  SvgCoordinatePlane2D,
  integrate1DGaussLegendre,
} from "@/components/visualizations/primitives/core2d";

interface FTCPreset {
  id: string;
  label: string;
  anchorA: number;
  xRange: [number, number];
  yRange: [number, number];
  accRange: [number, number];
  fn: (t: number) => number;
  note: string;
}

const FTC_PRESETS: FTCPreset[] = [
  {
    id: "cos-sin",
    label: "Oscillatory: f(t) = cos(1.6t)",
    anchorA: 0.0,
    xRange: [-0.5, 4.2],
    yRange: [-1.4, 1.4],
    accRange: [-1.0, 1.0],
    fn: (t) => Math.cos(1.6 * t),
    note: "Whenever f(x) crosses zero from positive to negative, accumulated area A(x) reaches a local maximum (A'(x) = 0) and begins draining downward!",
  },
  {
    id: "gaussian",
    label: "Gaussian Bell: f(t) = e^(-t²) (Non-Elementary erf!)",
    anchorA: -1.8,
    xRange: [-2.0, 2.0],
    yRange: [-0.3, 1.3],
    accRange: [-0.2, 2.0],
    fn: (t) => Math.exp(-t * t),
    note: "Even though ∫e^(-t²)dt has no elementary closed formula, FTC Part I defines A(x) unambiguously and guarantees its tangent slope at x = 0 equals peak height e^0 = 1.",
  },
  {
    id: "step-jump",
    label: "Jump Step: f(t) = 1.2 (t < 1.5), -0.8 (t ≥ 1.5)",
    anchorA: 0.0,
    xRange: [-0.4, 3.4],
    yRange: [-1.4, 1.6],
    accRange: [-0.5, 2.2],
    fn: (t) => (t < 1.5 ? 1.2 : -0.8),
    note: "Integrating heals discontinuities! Although f(t) jumps sharply at t = 1.5, the area function A(x) stays perfectly continuous with a sharp corner whose left slope (+1.2) and right slope (-0.8) match f!",
  },
];

export function FTCAccumulationLab() {
  const [presetId, setPresetId] = useState<string>("cos-sin");
  const preset = useMemo(
    () => FTC_PRESETS.find((p) => p.id === presetId) ?? FTC_PRESETS[0],
    [presetId]
  );

  const [upperX, setUpperX] = useState<number>(1.8);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleSelectPreset = (p: FTCPreset) => {
    setPresetId(p.id);
    setUpperX(Number((p.anchorA + 0.45 * (p.xRange[1] - p.anchorA)).toFixed(2)));
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const [, xMax] = preset.xRange;
    const id = window.setInterval(() => {
      setUpperX((prev) => {
        const next = prev + (xMax - preset.anchorA) * 0.015;
        return next > xMax ? preset.anchorA : Number(next.toFixed(3));
      });
    }, 45);
    return () => window.clearInterval(id);
  }, [isPlaying, preset]);

  const model = useMemo(() => {
    const [xMin, xMax] = preset.xRange;
    const steps = 160;
    const fPts: [number, number][] = [];
    const accPts: [number, number][] = [];
    const shadedPosPolys: string[] = [];
    const areaSamples: { x: number; y: number }[] = [];

    for (let i = 0; i <= steps; i++) {
      const tx = xMin + ((xMax - xMin) * i) / steps;
      const fy = preset.fn(tx);
      fPts.push([tx, fy]);

      const ay = integrate1DGaussLegendre(preset.fn, preset.anchorA, tx, 12);
      accPts.push([tx, ay]);

      if (tx >= Math.min(preset.anchorA, upperX) && tx <= Math.max(preset.anchorA, upperX)) {
        areaSamples.push({ x: tx, y: fy });
      }
    }

    const currentF = preset.fn(upperX);
    const currentA = integrate1DGaussLegendre(
      preset.fn,
      preset.anchorA,
      upperX,
      16
    );
    const stripWidth = 0.12;
    const dA = currentF * stripWidth;

    return {
      fPts,
      accPts,
      areaSamples,
      currentF,
      currentA,
      stripWidth,
      dA,
      shadedPosPolys,
    };
  }, [preset, upperX]);

  const toPoly = (
    pts: [number, number][],
    toSvgX: (x: number) => number,
    toSvgY: (y: number) => number
  ) =>
    pts
      .map(([px, py]) => `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`)
      .join(" ");

  return (
    <section className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)]">
            <span>Lab 1.3.2A</span>
            <span>•</span>
            <span>Fundamental Theorem of Calculus</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
            Dual-Graph FTC Area Accumulation (<KaTeXMath math="A'(x) = f(x)" />)
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-serif">
            Sweep upper limit <KaTeXMath math="x" /> to watch the thin
            boundary slice <KaTeXMath math="dA = f(x)\,dx" /> (Left) dictate the
            instantaneous tangent slope of the antiderivative{" "}
            <KaTeXMath math="A(x) = \int_a^x f(t)\,dt" /> (Right).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-[var(--math-ink-z)]"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Sweep
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Animate Sweep x
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {FTC_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelectPreset(p)}
            className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
              p.id === preset.id
                ? "border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-[var(--math-ink-z)] font-medium"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Sweep Slider */}
      <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
          <span className="text-[var(--text-secondary)]">
            Upper Limit Sweep Cursor (<KaTeXMath math={`a = ${preset.anchorA.toFixed(1)}`} />)
          </span>
          <span className="font-tabular-mono text-[var(--math-ink-sweep)] font-semibold">
            x = {upperX.toFixed(2)} • f(x) = {model.currentF.toFixed(3)} • A(x) ={" "}
            {model.currentA.toFixed(4)}
          </span>
        </div>
        <input
          type="range"
          min={preset.xRange[0] + 0.1}
          max={preset.xRange[1] - 0.1}
          step={0.02}
          value={upperX}
          onChange={(e) => {
            setIsPlaying(false);
            setUpperX(Number(e.target.value));
          }}
          aria-label="Upper limit cursor x"
          className="w-full accent-[#D35323]"
        />
      </div>

      {/* Dual Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Rate f(t) & Shaded Area */}
        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            1. Rate Function <KaTeXMath math="f(t)" /> &amp; Boundary Slice{" "}
            <KaTeXMath math="dA = f(x)\,dx" />
          </span>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.yRange}
            width={460}
            height={290}
            xLabel="t"
            yLabel="f(t)"
            xColor="#8D9FCE"
            yColor="#029091"
            ariaLabel="Integrand curve with accumulated area shaded up to x"
            onSelectPoint={(wx) => {
              setIsPlaying(false);
              setUpperX(Number(wx.toFixed(2)));
            }}
            className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const zeroY = toSvgY(0);
              const stripX0 = toSvgX(upperX);
              const stripX1 = toSvgX(upperX + model.stripWidth);
              const stripTop = Math.min(zeroY, toSvgY(model.currentF));
              const stripH = Math.abs(toSvgY(model.currentF) - zeroY);

              // Polygon from anchorA to upperX
              const polyPts =
                model.areaSamples.length > 0
                  ? [
                      `${toSvgX(model.areaSamples[0].x).toFixed(1)},${zeroY.toFixed(1)}`,
                      ...model.areaSamples.map(
                        (s) => `${toSvgX(s.x).toFixed(1)},${toSvgY(s.y).toFixed(1)}`
                      ),
                      `${toSvgX(
                        model.areaSamples[model.areaSamples.length - 1].x
                      ).toFixed(1)},${zeroY.toFixed(1)}`,
                    ].join(" ")
                  : "";

              return (
                <>
                  {polyPts && (
                    <polygon
                      points={polyPts}
                      fill="rgba(2, 144, 145, 0.25)"
                      stroke="none"
                    />
                  )}
                  {/* Infinitesimal strip dA */}
                  <rect
                    x={stripX0}
                    y={stripTop}
                    width={Math.max(3, stripX1 - stripX0)}
                    height={stripH}
                    fill="rgba(211, 83, 35, 0.45)"
                    stroke="#D35323"
                    strokeWidth={1.2}
                  />
                  <polyline
                    fill="none"
                    stroke="#8D9FCE"
                    strokeWidth={2.2}
                    points={toPoly(model.fPts, toSvgX, toSvgY)}
                  />
                  <circle
                    cx={toSvgX(upperX)}
                    cy={toSvgY(model.currentF)}
                    r={4.5}
                    fill="#D35323"
                    stroke="#FBEAA4"
                    strokeWidth={1.3}
                  />
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: Accumulation A(x) & Tangent Slope */}
        <div className="space-y-2">
          <span className="text-xs font-sans font-medium text-[var(--text-primary)] block">
            2. Accumulation <KaTeXMath math="A(x) = \int_a^x f(t)\,dt" /> (Slope{" "}
            <KaTeXMath math="= f(x)" />)
          </span>
          <SvgCoordinatePlane2D
            xRange={preset.xRange}
            yRange={preset.accRange}
            width={460}
            height={290}
            xLabel="x"
            yLabel="A(x)"
            xColor="#8D9FCE"
            yColor="#FBEAA4"
            ariaLabel="Accumulation integral A(x) with live tangent line slope f(x)"
            onSelectPoint={(wx) => {
              setIsPlaying(false);
              setUpperX(Number(wx.toFixed(2)));
            }}
            className="w-full h-64 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const span = 0.65;
              const xL = upperX - span;
              const xR = upperX + span;
              const yL = model.currentA + model.currentF * (xL - upperX);
              const yR = model.currentA + model.currentF * (xR - upperX);
              return (
                <>
                  <polyline
                    fill="none"
                    stroke="#FBEAA4"
                    strokeWidth={2.4}
                    points={toPoly(model.accPts, toSvgX, toSvgY)}
                  />
                  {/* Live tangent line with slope A'(x) = f(x) */}
                  <line
                    x1={toSvgX(xL)}
                    y1={toSvgY(yL)}
                    x2={toSvgX(xR)}
                    y2={toSvgY(yR)}
                    stroke="#D35323"
                    strokeWidth={2.2}
                  />
                  <circle
                    cx={toSvgX(upperX)}
                    cy={toSvgY(model.currentA)}
                    r={4.8}
                    fill="#D35323"
                    stroke="#FBEAA4"
                    strokeWidth={1.4}
                  />
                </>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] font-serif">
        <strong className="text-[var(--text-primary)] font-sans">
          FTC Intuition:
        </strong>{" "}
        {preset.note}
      </div>
    </section>
  );
}
