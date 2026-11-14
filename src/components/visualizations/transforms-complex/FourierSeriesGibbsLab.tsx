"use client";

import React, { useEffect, useMemo, useState } from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

interface WavePreset {
  id: string;
  label: string;
  formulaLatex: string;
  targetFn: (t: number) => number;
  coeffFn: (n: number) => { a: number; b: number }; // a_n cos(nt) + b_n sin(nt); n=0 uses a0/2 convention in eval
  a0Half: number;
  totalPower: number; // (1/pi) int_{-pi}^{pi} f^2 dt / 2 = a0^2/4 + 0.5 * sum(a_n^2 + b_n^2)
  hasJump: boolean;
  description: string;
}

const wrapPi = (t: number) => {
  let x = ((t + Math.PI) % (2 * Math.PI));
  if (x < 0) x += 2 * Math.PI;
  return x - Math.PI;
};

const PRESETS: WavePreset[] = [
  {
    id: "square",
    label: "Square Wave [1/n]",
    formulaLatex: "S_N(t) = \\frac{4}{\\pi}\\sum_{k=1,3,5}^{2N-1} \\frac{\\sin(kt)}{k}",
    targetFn: (t) => (wrapPi(t) >= 0 ? 1 : -1),
    a0Half: 0,
    coeffFn: (n) => ({ a: 0, b: n % 2 === 1 ? 4 / (Math.PI * n) : 0 }),
    totalPower: 1.0,
    hasJump: true,
    description: "Jump discontinuities leave an invariant ~8.9% Gibbs overshoot ear no matter how large N grows.",
  },
  {
    id: "sawtooth",
    label: "Sawtooth Wave [1/n]",
    formulaLatex: "S_N(t) = \\frac{2}{\\pi}\\sum_{n=1}^{N} (-1)^{n+1}\\frac{\\sin(nt)}{n}",
    targetFn: (t) => wrapPi(t) / Math.PI,
    a0Half: 0,
    coeffFn: (n) => ({ a: 0, b: (2 / (Math.PI * n)) * (n % 2 === 1 ? 1 : -1) }),
    totalPower: 1 / 3,
    hasJump: true,
    description: "Every integer harmonic contributes with 1/n decay, creating Gibbs ringing near ±π jumps.",
  },
  {
    id: "triangle",
    label: "Triangle Wave [1/n²]",
    formulaLatex: "S_N(t) = \\frac{8}{\\pi^2}\\sum_{k=1,3,5}^{2N-1} (-1)^{(k-1)/2}\\frac{\\sin(kt)}{k^2}",
    targetFn: (t) => {
      const x = wrapPi(t);
      if (x >= -Math.PI / 2 && x <= Math.PI / 2) return (2 * x) / Math.PI;
      if (x > Math.PI / 2) return 2 - (2 * x) / Math.PI;
      return -2 - (2 * x) / Math.PI;
    },
    a0Half: 0,
    coeffFn: (n) => {
      if (n % 2 === 0) return { a: 0, b: 0 };
      const sign = ((n - 1) / 2) % 2 === 0 ? 1 : -1;
      return { a: 0, b: (sign * 8) / (Math.PI * Math.PI * n * n) };
    },
    totalPower: 1 / 3,
    hasJump: false,
    description: "Continuous waveform with corner kinks: coefficients decay as 1/n² so Gibbs overshoot disappears!",
  },
  {
    id: "pulse",
    label: "25% Duty Pulse [Sinc]",
    formulaLatex: "S_N(t) = \\frac{1}{4} + \\sum_{n=1}^{N} \\frac{2\\sin(n\\pi/4)}{n\\pi}\\cos(nt)",
    targetFn: (t) => (Math.abs(wrapPi(t)) <= Math.PI / 4 ? 1 : 0),
    a0Half: 0.25,
    coeffFn: (n) => ({ a: (2 * Math.sin((n * Math.PI) / 4)) / (n * Math.PI), b: 0 }),
    totalPower: 0.25,
    hasJump: true,
    description: "Symmetric narrow pulse reveals a characteristic sinc-shaped spectral envelope across harmonics.",
  },
];

function fmt(n: number, digits = 2): string {
  const clean = Math.abs(n) < 1e-7 ? 0 : n;
  return clean.toFixed(digits);
}

/**
 * Fourier Harmonic Synthesizer, Epicycles & Gibbs Overshoot Lab (5.4.1).
 * Adjust harmonic count N in [1, 45] across discontinuous & smooth periodic waves
 * to observe L² convergence, rotating epicycles, discrete spectrum |c_n|, and Gibbs ringing.
 */
export function FourierSeriesGibbsLab() {
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [numHarmonics, setNumHarmonics] = useState<number>(7);
  const [phaseT, setPhaseT] = useState<number>(0.85);
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
      setPhaseT((prev) => (prev + dt * 1.1) % (2 * Math.PI));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  const synth = useMemo(() => {
    const terms: Array<{ n: number; a: number; b: number; amp: number }> = [];
    let powerCaptured = preset.a0Half * preset.a0Half;
    for (let n = 1; n <= numHarmonics; n++) {
      const { a, b } = preset.coeffFn(n);
      const amp = Math.hypot(a, b);
      terms.push({ n, a, b, amp });
      powerCaptured += 0.5 * (a * a + b * b);
    }

    const evalPartial = (t: number) => {
      let y = preset.a0Half;
      for (const term of terms) {
        y += term.a * Math.cos(term.n * t) + term.b * Math.sin(term.n * t);
      }
      return y;
    };

    const wavePts: Array<{ t: number; target: number; approx: number }> = [];
    let maxApprox = -Infinity;
    let minApprox = Infinity;
    let maxTarget = -Infinity;
    let minTarget = Infinity;
    let l2ErrSq = 0;

    const M = 240;
    for (let i = 0; i <= M; i++) {
      const t = -Math.PI + (i / M) * (2 * Math.PI);
      const tgt = preset.targetFn(t);
      const app = evalPartial(t);
      wavePts.push({ t, target: tgt, approx: app });
      maxApprox = Math.max(maxApprox, app);
      minApprox = Math.min(minApprox, app);
      maxTarget = Math.max(maxTarget, tgt);
      minTarget = Math.min(minTarget, tgt);
      l2ErrSq += (tgt - app) * (tgt - app) / (M + 1);
    }

    const jumpHeight = Math.max(0.5, maxTarget - minTarget);
    const peakOvershootPct = Math.max(0, ((maxApprox - maxTarget) / jumpHeight) * 100);
    const parsevalPct = Math.min(100, (powerCaptured / preset.totalPower) * 100);

    // Epicycle chain points at current phaseT (only top non-zero terms up to 14 so circles stay readable)
    // Represent real signal f(t) as y-projection of rotating vectors in 2D plane:
    // Each term a_n cos(nt) + b_n sin(nt) = Im((b_n + i a_n) * e^{i n t})
    const epicycleNodes: Array<{ x: number; y: number; r: number }> = [{ x: 0, y: preset.a0Half, r: 0 }];
    let cx = 0;
    let cy = preset.a0Half;
    for (const term of terms.slice(0, 14)) {
      if (term.amp < 1e-4) continue;
      // Rotate vector (b_n, a_n) by n*phaseT so y = b_n sin(nt) + a_n cos(nt)
      const angle = term.n * phaseT;
      const dx = term.b * Math.cos(angle) - term.a * Math.sin(angle);
      const dy = term.b * Math.sin(angle) + term.a * Math.cos(angle);
      epicycleNodes.push({ x: cx + dx, y: cy + dy, r: term.amp });
      cx += dx;
      cy += dy;
    }

    const currentY = evalPartial(phaseT);

    // Spectrum bars up to 24 harmonics
    const spectrumBars: Array<{ n: number; amp: number; active: boolean }> = [];
    for (let n = 1; n <= 24; n++) {
      const { a, b } = preset.coeffFn(n);
      spectrumBars.push({ n, amp: Math.hypot(a, b), active: n <= numHarmonics });
    }

    return {
      wavePts,
      peakOvershootPct,
      parsevalPct,
      rmse: Math.sqrt(l2ErrSq),
      epicycleNodes,
      currentY,
      spectrumBars,
    };
  }, [preset, numHarmonics, phaseT]);

  return (
    <div className="space-y-5">
      {/* Control Header */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#96B898]">
              Fourier Series Harmonic Synthesizer & Gibbs Inspector
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">{preset.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPresetId(p.id)}
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
          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#FBEAA4]">
              <span>Harmonic Cutoff N</span>
              <span>N = {numHarmonics}</span>
            </div>
            <input
              type="range"
              min={1}
              max={45}
              step={1}
              value={numHarmonics}
              onChange={(e) => setNumHarmonics(parseInt(e.target.value, 10))}
              className="mt-2 w-full accent-[#FBEAA4]"
            />
          </label>

          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex items-center justify-between font-mono text-xs text-[#28B7B8]">
              <span>Epicycle Phase t = {fmt(wrapPi(phaseT), 2)}</span>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="rounded border border-[#D35323] bg-[#D35323]/20 px-2.5 py-0.5 font-sans text-[11px] font-semibold text-[#FBEAA4]"
              >
                {isPlaying ? "Pause" : "Spin Epicycles"}
              </button>
            </div>
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step={0.04}
              value={wrapPi(phaseT)}
              onChange={(e) => {
                setIsPlaying(false);
                setPhaseT(parseFloat(e.target.value));
              }}
              className="mt-2 w-full accent-[#029091]"
              aria-label="Epicycle phase t (radians)"
            />
          </div>

          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3 font-mono text-xs tabular-nums">
            <div className="flex justify-between">
              <span className="text-[#A2AAB8]">Parseval Energy:</span>
              <span className="text-[#96B898]">{fmt(synth.parsevalPct, 1)}%</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-[#A2AAB8]">Gibbs Overshoot:</span>
              <span className={preset.hasJump ? "text-[#EF7547]" : "text-[#28B7B8]"}>
                {fmt(synth.peakOvershootPct, 2)}%
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-[#A2AAB8]">L² RMSE:</span>
              <span className="text-[#FBEAA4]">{fmt(synth.rmse, 3)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual View: Waveform Overlay + Epicycle / Spectrum */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                Partial Sum Approximation <KaTeXMath math={`S_{${numHarmonics}}(t)`} /> vs. Target{" "}
                <KaTeXMath math="f(t)" />
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Click anywhere on the waveform to lock the rotating epicycles to phase <KaTeXMath math="t" />.
              </p>
            </div>
            <div className="flex gap-2 font-sans text-[11px]">
              <span className="rounded border border-[#8D9FCE]/50 bg-[#1E1F22] px-2 py-0.5 text-[#8D9FCE]">
                Target f(t)
              </span>
              <span className="rounded border border-[#FBEAA4]/50 bg-[#1E1F22] px-2 py-0.5 text-[#FBEAA4]">
                S_N(t)
              </span>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-3.3, 3.3]}
            yRange={[-1.45, 1.45]}
            width={620}
            height={340}
            xLabel="t"
            yLabel="f(t)"
            ariaLabel="Fourier Partial Sum Waveform"
            onSelectPoint={(t) => {
              setIsPlaying(false);
              setPhaseT(Math.max(-Math.PI, Math.min(Math.PI, t)));
            }}
          >
            {({ toSvgX, toSvgY }) => {
              const targetD = synth.wavePts
                .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p.t).toFixed(1)},${toSvgY(p.target).toFixed(1)}`)
                .join(" ");
              const approxD = synth.wavePts
                .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p.t).toFixed(1)},${toSvgY(p.approx).toFixed(1)}`)
                .join(" ");
              const curT = wrapPi(phaseT);

              return (
                <g>
                  <path d={targetD} fill="none" stroke="#8D9FCE" strokeWidth={1.8} strokeDasharray="5 3" opacity={0.8} />
                  <path d={approxD} fill="none" stroke="#FBEAA4" strokeWidth={2.5} />
                  <line
                    x1={toSvgX(curT)}
                    y1={toSvgY(-1.4)}
                    x2={toSvgX(curT)}
                    y2={toSvgY(1.4)}
                    stroke="#D35323"
                    strokeDasharray="3 3"
                    strokeWidth={1.4}
                  />
                  <circle
                    cx={toSvgX(curT)}
                    cy={toSvgY(synth.currentY)}
                    r={5.5}
                    fill="#D35323"
                    stroke="#F6F0D0"
                    strokeWidth={1.6}
                  />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>

        {/* Right: Epicycle Vector Chain + Harmonic Spectrum */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#28B7B8]">
              Rotating Epicycles (Top 14 Modes)
            </h3>
            <SvgCoordinatePlane2D
              xRange={[-1.65, 1.65]}
              yRange={[-1.65, 1.65]}
              width={300}
              height={220}
              xLabel="Re"
              yLabel="Im"
              ariaLabel="Rotating Fourier Epicycle Chain"
            >
              {({ toSvgX, toSvgY }) => {
                const scalePx = toSvgX(1) - toSvgX(0);
                return (
                  <g>
                    {synth.epicycleNodes.map((node, idx) => {
                      if (idx === 0) return null;
                      const prev = synth.epicycleNodes[idx - 1];
                      const rPx = Math.abs(node.r * scalePx);
                      return (
                        <g key={idx}>
                          <circle
                            cx={toSvgX(prev.x)}
                            cy={toSvgY(prev.y)}
                            r={rPx}
                            fill="none"
                            stroke="#4B505C"
                            strokeWidth={1}
                          />
                          <line
                            x1={toSvgX(prev.x)}
                            y1={toSvgY(prev.y)}
                            x2={toSvgX(node.x)}
                            y2={toSvgY(node.y)}
                            stroke="#96B898"
                            strokeWidth={1.8}
                          />
                        </g>
                      );
                    })}
                    {synth.epicycleNodes.length > 0 && (
                      <circle
                        cx={toSvgX(synth.epicycleNodes[synth.epicycleNodes.length - 1].x)}
                        cy={toSvgY(synth.epicycleNodes[synth.epicycleNodes.length - 1].y)}
                        r={4.5}
                        fill="#D35323"
                      />
                    )}
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>
          </div>

          <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#8D9FCE]">
              Harmonic Amplitude Spectrum |c_n|
            </p>
            <svg
              role="img"
              aria-label="Bar chart of Fourier harmonic amplitude spectrum |c_n| highlighting active modes up to N"
              viewBox="0 0 300 120"
              className="mt-2 w-full rounded border border-[#35383F] bg-[#1E1F22]"
            >
              {(() => {
                const maxAmp = Math.max(0.5, ...synth.spectrumBars.map((b) => b.amp));
                return synth.spectrumBars.map((bar, i) => {
                  const x = 14 + i * 11.4;
                  const h = (bar.amp / maxAmp) * 86;
                  return (
                    <rect
                      key={bar.n}
                      x={x}
                      y={104 - h}
                      width={7}
                      height={Math.max(1, h)}
                      fill={bar.active ? "#029091" : "#3E4350"}
                    />
                  );
                });
              })()}
            </svg>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <KaTeXMath block math={preset.formulaLatex} />
      </div>
    </div>
  );
}
