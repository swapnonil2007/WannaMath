"use client";

import React, { useEffect, useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

interface ConvPreset {
  id: string;
  label: string;
  xLabelLatex: string;
  hLabelLatex: string;
  sDomainLatex: string;
  xFn: (tau: number) => number;
  hFn: (tau: number) => number;
  description: string;
}

const PRESETS: ConvPreset[] = [
  {
    id: "boxcar",
    label: "Boxcar * Boxcar → Triangle",
    xLabelLatex: "x(\\tau) = u(\\tau) - u(\\tau - 2)",
    hLabelLatex: "h(\\tau) = u(\\tau) - u(\\tau - 2)",
    sDomainLatex: "Y(s) = \\left(\\frac{1 - e^{-2s}}{s}\\right)^2",
    xFn: (tau) => (tau >= 0 && tau <= 2 ? 1.0 : 0),
    hFn: (tau) => (tau >= 0 && tau <= 2 ? 1.0 : 0),
    description: "Two square pulses of width 2 slide across each other, accumulating linearly up to peak 2 at t = 2.",
  },
  {
    id: "rc-step",
    label: "Step * Exponential Decay",
    xLabelLatex: "x(\\tau) = u(\\tau)",
    hLabelLatex: "h(\\tau) = e^{-0.8\\tau}\\,u(\\tau)",
    sDomainLatex: "Y(s) = \\frac{1}{s}\\cdot\\frac{1}{s + 0.8} \\;\\longleftrightarrow\\; y(t) = \\frac{1 - e^{-0.8t}}{0.8}",
    xFn: (tau) => (tau >= 0 ? 1.0 : 0),
    hFn: (tau) => (tau >= 0 ? Math.exp(-0.8 * tau) : 0),
    description: "An RC low-pass filter integrates a unit step into a smooth asymptotic charging curve.",
  },
  {
    id: "pulse-osc",
    label: "Pulse * Damped Oscillator",
    xLabelLatex: "x(\\tau) = u(\\tau) - u(\\tau - 1.5)",
    hLabelLatex: "h(\\tau) = e^{-0.45\\tau}\\sin(2.5\\tau)\\,u(\\tau)",
    sDomainLatex: "Y(s) = \\frac{1 - e^{-1.5s}}{s}\\cdot\\frac{2.5}{(s+0.45)^2 + 2.5^2}",
    xFn: (tau) => (tau >= 0 && tau <= 1.5 ? 1.0 : 0),
    hFn: (tau) => (tau >= 0 ? Math.exp(-0.45 * tau) * Math.sin(2.5 * tau) : 0),
    description: "Short rectangular excitation excites damped ringing once the kernel sweeps through the input gate.",
  },
  {
    id: "double-exp",
    label: "Exponential * Exponential",
    xLabelLatex: "x(\\tau) = e^{-0.9\\tau}\\,u(\\tau)",
    hLabelLatex: "h(\\tau) = e^{-0.9\\tau}\\,u(\\tau)",
    sDomainLatex: "Y(s) = \\frac{1}{(s + 0.9)^2} \\;\\longleftrightarrow\\; y(t) = t\\,e^{-0.9t}",
    xFn: (tau) => (tau >= 0 ? Math.exp(-0.9 * tau) : 0),
    hFn: (tau) => (tau >= 0 ? Math.exp(-0.9 * tau) : 0),
    description: "Double-pole repeated convolution creates a smooth rise-and-decay critically damped alpha pulse.",
  },
];

function fmt(n: number, digits = 3): string {
  const clean = Math.abs(n) < 1e-6 ? 0 : n;
  return clean.toFixed(digits);
}

/**
 * Interactive Flip-and-Slide Convolution Accumulator Lab (5.3.2).
 * Scrub output time t to slide h(t - τ) over fixed x(τ), shade overlap x(τ)h(t - τ),
 * and integrate live into y(t) = (x * h)(t).
 */
export function ConvolutionFlipSlideLab() {
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [tVal, setTVal] = useState<number>(2.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId]
  );

  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTVal((prev) => {
        const next = prev + dt * 0.9;
        return next > 6.5 ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  const sim = useMemo(() => {
    const tauMin = -1.5;
    const tauMax = 7.0;
    const steps = 220;
    const dTau = (tauMax - tauMin) / steps;

    const xCurve: Array<[number, number]> = [];
    const hSlideCurve: Array<[number, number]> = [];
    const overlapCurve: Array<[number, number]> = [];

    for (let i = 0; i <= steps; i++) {
      const tau = tauMin + i * dTau;
      const xv = preset.xFn(tau);
      const hv = preset.hFn(tVal - tau);
      xCurve.push([tau, xv]);
      hSlideCurve.push([tau, hv]);
      overlapCurve.push([tau, xv * hv]);
    }

    const integrateAt = (t: number) => {
      if (t <= 0) return 0;
      const subN = 120;
      const hStep = t / subN;
      let sum = 0;
      for (let k = 0; k < subN; k++) {
        const tau = (k + 0.5) * hStep;
        sum += preset.xFn(tau) * preset.hFn(t - tau) * hStep;
      }
      return sum;
    };

    const yCurve: Array<[number, number]> = [];
    for (let i = 0; i <= 130; i++) {
      const t = (i / 130) * 6.5;
      yCurve.push([t, integrateAt(t)]);
    }

    const currentY = integrateAt(tVal);

    return { xCurve, hSlideCurve, overlapCurve, yCurve, currentY };
  }, [preset, tVal]);

  return (
    <div className="space-y-5">
      {/* Control Header */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#8D9FCE]">
              Flip-and-Slide Convolution Accumulator
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">{preset.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setPresetId(p.id);
                  setTVal(1.6);
                }}
                className={`rounded-lg border px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
                  presetId === p.id
                    ? "border-[#8D9FCE] bg-[#8D9FCE]/15 text-[#F6F0D0]"
                    : "border-[#35383F] bg-[#1E1F22] text-[#A2AAB8] hover:border-[#8D9FCE]/60 hover:text-[#F6F0D0]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs text-[#FBEAA4]">
                Evaluation Time Shift t = {fmt(tVal, 2)} s
              </span>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="rounded border border-[#D35323] bg-[#D35323]/20 px-3 py-0.5 font-sans text-xs font-semibold text-[#FBEAA4]"
              >
                {isPlaying ? "Pause Slide" : "Animate Slide"}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={6.5}
              step={0.05}
              value={tVal}
              onChange={(e) => {
                setIsPlaying(false);
                setTVal(parseFloat(e.target.value));
              }}
              className="mt-2.5 w-full accent-[#D35323]"
              aria-label="Evaluation time shift t (seconds)"
            />
          </div>

          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3 font-mono text-xs tabular-nums">
            <span className="font-sans font-semibold text-[#EF7547] block">Overlap Area = Output y(t)</span>
            <span className="mt-1.5 block text-lg font-semibold text-[#FBEAA4]">
              y({fmt(tVal, 2)}) = {fmt(sim.currentY, 4)}
            </span>
          </div>
        </div>
      </div>

      {/* Synchronized Top (τ sliding) + Bottom (Output y(t)) */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                Moving Dummy Variable <KaTeXMath math="\tau" />: Flip & Slide
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Shaded orange region equals <KaTeXMath math="x(\tau)\,h(t - \tau)" />.
              </p>
            </div>
            <div className="flex gap-2 font-sans text-[11px]">
              <span className="rounded border border-[#8D9FCE]/50 bg-[#1E1F22] px-2 py-0.5 text-[#8D9FCE]">x(τ)</span>
              <span className="rounded border border-[#96B898]/50 bg-[#1E1F22] px-2 py-0.5 text-[#96B898]">
                h(t−τ)
              </span>
              <span className="rounded border border-[#D35323]/50 bg-[#1E1F22] px-2 py-0.5 text-[#EF7547]">
                Product
              </span>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-1.5, 7.0]}
            yRange={[-1.1, 1.5]}
            width={480}
            height={330}
            xLabel="τ"
            yLabel="Amp"
            ariaLabel="Convolution Flip and Slide Dummy Axis"
          >
            {({ toSvgX, toSvgY }) => {
              const pathFrom = (pts: Array<[number, number]>) =>
                pts
                  .map(([x, y], i) => `${i === 0 ? "M" : "L"}${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`)
                  .join(" ");

              const baseY = toSvgY(0).toFixed(1);
              const overlapArea =
                `M${toSvgX(sim.overlapCurve[0][0]).toFixed(1)},${baseY} ` +
                sim.overlapCurve.map(([x, y]) => `L${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`).join(" ") +
                ` L${toSvgX(sim.overlapCurve[sim.overlapCurve.length - 1][0]).toFixed(1)},${baseY} Z`;

              return (
                <g>
                  <path d={overlapArea} fill="#D35323" fillOpacity={0.35} stroke="#D35323" strokeWidth={1.3} />
                  <path d={pathFrom(sim.xCurve)} fill="none" stroke="#8D9FCE" strokeWidth={2.3} />
                  <path d={pathFrom(sim.hSlideCurve)} fill="none" stroke="#96B898" strokeWidth={2.3} strokeDasharray="5 3" />
                  <line
                    x1={toSvgX(tVal)}
                    y1={toSvgY(-1.0)}
                    x2={toSvgX(tVal)}
                    y2={toSvgY(1.4)}
                    stroke="#FBEAA4"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                Accumulated Convolution Output <KaTeXMath math="y(t) = (x * h)(t)" />
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Height at <KaTeXMath math="t" /> equals the total signed orange area on the left.
              </p>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-0.5, 6.8]}
            yRange={[-0.6, 2.3]}
            width={480}
            height={330}
            xLabel="t"
            yLabel="y(t)"
            ariaLabel="Convolution Accumulated Output"
            onSelectPoint={(t) => {
              setIsPlaying(false);
              setTVal(Math.max(0, Math.min(6.5, Math.round(t * 20) / 20)));
            }}
          >
            {({ toSvgX, toSvgY }) => {
              const fullD = sim.yCurve
                .map(([t, y], i) => `${i === 0 ? "M" : "L"}${toSvgX(t).toFixed(1)},${toSvgY(y).toFixed(1)}`)
                .join(" ");
              const activePts = sim.yCurve.filter(([t]) => t <= tVal + 0.02);
              const activeD = activePts
                .map(([t, y], i) => `${i === 0 ? "M" : "L"}${toSvgX(t).toFixed(1)},${toSvgY(y).toFixed(1)}`)
                .join(" ");

              return (
                <g>
                  <path d={fullD} fill="none" stroke="#4B505C" strokeWidth={1.8} strokeDasharray="4 4" />
                  {activeD && <path d={activeD} fill="none" stroke="#FBEAA4" strokeWidth={3} />}
                  <line
                    x1={toSvgX(tVal)}
                    y1={toSvgY(0)}
                    x2={toSvgX(tVal)}
                    y2={toSvgY(sim.currentY)}
                    stroke="#D35323"
                    strokeWidth={2}
                  />
                  <circle
                    cx={toSvgX(tVal)}
                    cy={toSvgY(sim.currentY)}
                    r={6.5}
                    fill="#D35323"
                    stroke="#F6F0D0"
                    strokeWidth={1.8}
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Time-Frequency Duality Formula Strip */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#8D9FCE] block">
            Input Signal x(τ)
          </span>
          <div className="mt-2 text-xs text-[#F6F0D0]">
            <KaTeXMath block math={preset.xLabelLatex} />
          </div>
        </div>
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#96B898] block">
            Impulse Kernel h(τ)
          </span>
          <div className="mt-2 text-xs text-[#F6F0D0]">
            <KaTeXMath block math={preset.hLabelLatex} />
          </div>
        </div>
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#28B7B8] block">
            Laplace Convolution Theorem
          </span>
          <div className="mt-2 overflow-x-auto text-xs text-[#F6F0D0]">
            <KaTeXMath block math={preset.sDomainLatex} />
          </div>
        </div>
      </div>
    </div>
  );
}
