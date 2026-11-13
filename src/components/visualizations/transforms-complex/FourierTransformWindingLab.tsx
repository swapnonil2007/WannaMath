"use client";

import React, { useEffect, useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives";

interface FTWindingPreset {
  id: string;
  label: string;
  fnLatex: string;
  evalFn: (t: number, width: number) => number;
  maxFreq: number;
  defaultOmega: number;
  note: string;
}

const PRESETS: FTWindingPreset[] = [
  {
    id: "wavelet",
    label: "Modulated Gaussian Wavelet",
    fnLatex: "f(t) = \\cos(2.6t)\\,e^{-(t/a)^2}",
    evalFn: (t, a) => Math.cos(2.6 * t) * Math.exp(-(t * t) / (a * a)),
    maxFreq: 5.5,
    defaultOmega: 2.6,
    note: "Winding around the origin resonates sharply at ω = 2.6 rad/s, pulling the center-of-mass right!",
  },
  {
    id: "dual-tone",
    label: "Dual-Tone Beat Packet",
    fnLatex: "f(t) = \\big(0.6\\cos(1.6t) + 0.5\\cos(3.5t)\\big)\\,e^{-(t/a)^2}",
    evalFn: (t, a) => (0.6 * Math.cos(1.6 * t) + 0.5 * Math.cos(3.5 * t)) * Math.exp(-(t * t) / (a * a)),
    maxFreq: 5.5,
    defaultOmega: 1.6,
    note: "Two embedded tones produce twin resonance peaks at ω = 1.6 and ω = 3.5 rad/s.",
  },
  {
    id: "gaussian",
    label: "Pure Gaussian Pulse",
    fnLatex: "f(t) = e^{-(t/a)^2} \\;\\longleftrightarrow\\; \\hat{f}(\\omega) = a\\sqrt{\\pi}\\,e^{-a^2\\omega^2/4}",
    evalFn: (t, a) => Math.exp(-(t * t) / (a * a)),
    maxFreq: 5.0,
    defaultOmega: 0.4,
    note: "Saturates Heisenberg–Gabor Uncertainty Δt · Δω = 1/2: compressing width a widens the frequency spectrum!",
  },
  {
    id: "rect",
    label: "Rectangular Time Gate",
    fnLatex: "f(t) = \\operatorname{rect}(t / 2a) \\;\\longleftrightarrow\\; \\hat{f}(\\omega) = 2a\\,\\operatorname{sinc}(a\\omega/\\pi)",
    evalFn: (t, a) => (Math.abs(t) <= a ? 1.0 : 0),
    maxFreq: 5.5,
    defaultOmega: 0.0,
    note: "Sharp rectangular edges spread energy outward into oscillating sinc spectral sidelobes.",
  },
];

function fmt(n: number, digits = 2): string {
  const clean = Math.abs(n) < 1e-7 ? 0 : n;
  return clean.toFixed(digits);
}

/**
 * Complex Winding Machine & Time-Bandwidth Uncertainty Lab (5.4.2).
 * Wraps signal f(t) along f(t)e^{-iωt}, tracks complex center-of-mass f̂(ω),
 * and compares time spread Δt vs spectral bandwidth Δω as pulse width a changes.
 */
export function FourierTransformWindingLab() {
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [omega, setOmega] = useState<number>(PRESETS[0].defaultOmega);
  const [widthScale, setWidthScale] = useState<number>(1.8);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId]
  );

  useEffect(() => {
    if (!isSweeping) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setOmega((prev) => {
        const next = prev + dt * 0.9;
        return next > preset.maxFreq ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isSweeping, preset.maxFreq]);

  const ft = useMemo(() => {
    const tMin = -6.0;
    const tMax = 6.0;
    const N = 240;
    const dt = (tMax - tMin) / N;

    const timePts: Array<[number, number]> = [];
    const windingPts: Array<[number, number]> = [];

    let reIntegral = 0;
    let imIntegral = 0;
    let tSqWeight = 0;
    let normSq = 0;

    for (let i = 0; i <= N; i++) {
      const t = tMin + i * dt;
      const val = preset.evalFn(t, widthScale);
      timePts.push([t, val]);

      const cosW = Math.cos(omega * t);
      const sinW = Math.sin(omega * t);
      const wx = val * cosW;
      const wy = -val * sinW;
      windingPts.push([wx, wy]);

      reIntegral += wx * dt;
      imIntegral += wy * dt;
      tSqWeight += t * t * val * val * dt;
      normSq += val * val * dt;
    }

    // Visual centroid scaled smoothly inside winding plane
    const centerOfMass: [number, number] = [reIntegral / (tMax - tMin) * 2.2, imIntegral / (tMax - tMin) * 2.2];
    const magAtOmega = Math.hypot(reIntegral, imIntegral);

    // Full frequency spectrum magnitude |f_hat(w)| for w in [0, maxFreq]
    const specPts: Array<{ w: number; mag: number }> = [];
    let wSqWeight = 0;
    let specNormSq = 0;
    const M = 100;
    const dw = preset.maxFreq / M;
    for (let j = 0; j <= M; j++) {
      const w = j * dw;
      let sRe = 0;
      let sIm = 0;
      for (let i = 0; i <= 160; i++) {
        const t = tMin + (i / 160) * (tMax - tMin);
        const dtS = (tMax - tMin) / 160;
        const val = preset.evalFn(t, widthScale);
        sRe += val * Math.cos(w * t) * dtS;
        sIm -= val * Math.sin(w * t) * dtS;
      }
      const m = Math.hypot(sRe, sIm);
      specPts.push({ w, mag: m });
      // Approximate symmetric frequency variance around peak or zero
      wSqWeight += w * w * m * m * dw;
      specNormSq += m * m * dw;
    }

    const deltaT = normSq > 1e-9 ? Math.sqrt(tSqWeight / normSq) : 0;
    // Center variance around peak frequency for modulated wavelets
    const peakW = specPts.reduce((best, p) => (p.mag > best.mag ? p : best), specPts[0]).w;
    let wCenteredSq = 0;
    for (const p of specPts) {
      wCenteredSq += (p.w - peakW) * (p.w - peakW) * p.mag * p.mag * dw;
    }
    const deltaW = specNormSq > 1e-9 ? Math.sqrt(wCenteredSq / specNormSq) : 0;

    return {
      timePts,
      windingPts,
      centerOfMass,
      reIntegral,
      imIntegral,
      magAtOmega,
      specPts,
      deltaT,
      deltaW,
      uncertaintyProduct: Math.max(0.5, deltaT * deltaW),
    };
  }, [preset, omega, widthScale]);

  const applyPreset = (p: FTWindingPreset) => {
    setIsSweeping(false);
    setPresetId(p.id);
    setOmega(p.defaultOmega);
  };

  return (
    <div className="space-y-5">
      {/* Control Header */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#96B898]">
              Complex Winding Machine & Time–Frequency Uncertainty
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">{preset.note}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className={`rounded-lg border px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
                  presetId === p.id
                    ? "border-[#96B898] bg-[#96B898]/15 text-[#F6F0D0]"
                    : "border-[#35383F] bg-[#1E1F22] text-[#A2AAB8] hover:border-[#96B898]/60 hover:text-[#F6F0D0]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex items-center justify-between font-mono text-xs text-[#D35323]">
              <span>Winding Freq ω = {fmt(omega, 2)} rad/s</span>
              <button
                type="button"
                onClick={() => setIsSweeping((s) => !s)}
                className="rounded border border-[#D35323] bg-[#D35323]/20 px-2 py-0.5 font-sans text-[11px] font-semibold text-[#FBEAA4]"
              >
                {isSweeping ? "Pause" : "Sweep ω"}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={preset.maxFreq}
              step={0.05}
              value={omega}
              onChange={(e) => {
                setIsSweeping(false);
                setOmega(parseFloat(e.target.value));
              }}
              className="mt-2 w-full accent-[#D35323]"
            />
          </div>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#8D9FCE]">
              <span>Pulse Width Scale a</span>
              <span>{fmt(widthScale, 2)} s</span>
            </div>
            <input
              type="range"
              min={0.45}
              max={2.8}
              step={0.05}
              value={widthScale}
              onChange={(e) => setWidthScale(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#8D9FCE]"
            />
          </label>

          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3 font-mono text-xs tabular-nums">
            <div className="flex justify-between">
              <span className="text-[#96B898]">Time Spread Δt:</span>
              <span>{fmt(ft.deltaT, 3)} s</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-[#029091]">Bandwidth Δω:</span>
              <span>{fmt(ft.deltaW, 3)} rad/s</span>
            </div>
            <div className="mt-1 flex justify-between text-[#FBEAA4]">
              <span>Δt · Δω (≥ 0.5):</span>
              <span>{fmt(ft.uncertaintyProduct, 3)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Three Synchronized Panels: Time Signal -> Winding Coil -> Frequency Spectrum */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Time Domain */}
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
            1. Time Signal <KaTeXMath math="f(t)" />
          </h3>
          <p className="mb-2 font-sans text-xs text-[#A2AAB8]">
            Adjust pulse width <KaTeXMath math="a" /> to stretch or squeeze time duration.
          </p>
          <SvgCoordinatePlane2D
            xRange={[-6.0, 6.0]}
            yRange={[-1.25, 1.25]}
            width={340}
            height={280}
            xLabel="t"
            yLabel="f(t)"
            ariaLabel="Time Domain Signal"
          >
            {({ toSvgX, toSvgY }) => {
              const pathD = ft.timePts
                .map(([t, y], i) => `${i === 0 ? "M" : "L"}${toSvgX(t).toFixed(1)},${toSvgY(y).toFixed(1)}`)
                .join(" ");
              return <path d={pathD} fill="none" stroke="#96B898" strokeWidth={2.2} />;
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Complex Winding Machine */}
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
            2. Winding Coil <KaTeXMath math="f(t)e^{-i\omega t}" />
          </h3>
          <p className="mb-2 font-sans text-xs text-[#A2AAB8]">
            Gold centroid vector tracks integral <KaTeXMath math="\hat{f}(\omega)" />.
          </p>
          <SvgCoordinatePlane2D
            xRange={[-1.2, 1.2]}
            yRange={[-1.2, 1.2]}
            width={340}
            height={280}
            xLabel="Re"
            yLabel="Im"
            ariaLabel="Complex Winding Coil"
          >
            {({ toSvgX, toSvgY }) => {
              const ox = toSvgX(0);
              const oy = toSvgY(0);
              const coilD = ft.windingPts
                .map(([x, y], i) => `${i === 0 ? "M" : "L"}${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`)
                .join(" ");
              const cx = toSvgX(Math.max(-1.1, Math.min(1.1, ft.centerOfMass[0])));
              const cy = toSvgY(Math.max(-1.1, Math.min(1.1, ft.centerOfMass[1])));
              return (
                <g>
                  <path d={coilD} fill="none" stroke="#8D9FCE" strokeWidth={1.6} opacity={0.85} />
                  <line x1={ox} y1={oy} x2={cx} y2={cy} stroke="#FBEAA4" strokeWidth={3} />
                  <circle cx={cx} cy={cy} r={6} fill="#D35323" stroke="#F6F0D0" strokeWidth={1.6} />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Continuous Magnitude Spectrum */}
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
            3. Spectrum <KaTeXMath math="|\hat{f}(\omega)|" />
          </h3>
          <p className="mb-2 font-sans text-xs text-[#A2AAB8]">
            Click spectrum to snap winding rate <KaTeXMath math="\omega" /> to any peak.
          </p>
          <SvgCoordinatePlane2D
            xRange={[0, preset.maxFreq]}
            yRange={[-0.2, Math.max(2.6, ...ft.specPts.map((p) => p.mag)) * 1.1]}
            width={340}
            height={280}
            xLabel="ω"
            yLabel="|f̂(ω)|"
            ariaLabel="Fourier Transform Spectrum"
            onSelectPoint={(w) => {
              setIsSweeping(false);
              setOmega(Math.max(0, Math.min(preset.maxFreq, Math.round(w * 20) / 20)));
            }}
          >
            {({ toSvgX, toSvgY }) => {
              const specD = ft.specPts
                .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p.w).toFixed(1)},${toSvgY(p.mag).toFixed(1)}`)
                .join(" ");
              return (
                <g>
                  <path d={specD} fill="none" stroke="#029091" strokeWidth={2.5} />
                  <line
                    x1={toSvgX(omega)}
                    y1={toSvgY(0)}
                    x2={toSvgX(omega)}
                    y2={toSvgY(ft.magAtOmega)}
                    stroke="#D35323"
                    strokeWidth={2}
                  />
                  <circle
                    cx={toSvgX(omega)}
                    cy={toSvgY(ft.magAtOmega)}
                    r={6}
                    fill="#D35323"
                    stroke="#F6F0D0"
                    strokeWidth={1.6}
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[#F6F0D0]">
          <KaTeXMath math={preset.fnLatex} />
        </div>
        <div className="font-mono text-xs tabular-nums text-[#FBEAA4]">
          f̂({fmt(omega, 2)}) = {fmt(ft.reIntegral, 3)} {ft.imIntegral >= 0 ? "+" : "−"}{" "}
          {fmt(Math.abs(ft.imIntegral), 3)}i &nbsp;|&nbsp; |f̂({fmt(omega, 2)})| = {fmt(ft.magAtOmega, 3)}
        </div>
      </div>
    </div>
  );
}
