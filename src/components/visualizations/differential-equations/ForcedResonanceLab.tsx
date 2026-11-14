"use client";

import React, { useState, useMemo } from "react";
import { Radio, Waves, Gauge } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { SvgCoordinatePlane2D } from "@/components/visualizations/primitives/core2d";

interface ForcedPreset {
  id: string;
  name: string;
  badge: string;
  wn: number;
  omega: number;
  zeta: number;
  f0: number;
  note: string;
}

const FORCED_PRESETS: ForcedPreset[] = [
  {
    id: "beats",
    name: "Acoustic Beats (ζ = 0, ω = 2.55 vs. ω_n = 3.0)",
    badge: "Slow Beat Envelope",
    wn: 3.0,
    omega: 2.55,
    zeta: 0.0,
    f0: 1.8,
    note: "Near-matched undamped frequencies interfere constructively and destructively, producing a slow beating envelope at frequency |ω_n - ω|/2.",
  },
  {
    id: "pure-resonance",
    name: "Pure Undamped Resonance (ζ = 0, ω = ω_n = 3.0)",
    badge: "Secular t·sin(ω_n t) Blowup",
    wn: 3.0,
    omega: 3.0,
    zeta: 0.0,
    f0: 1.5,
    note: "With zero friction and exact frequency lock ω = ω_n, driving force feeds energy on every cycle—causing linear amplitude growth (f₀/2ω_n)·t·sin(ω_n t).",
  },
  {
    id: "tuned-peak",
    name: "Sharply Tuned RLC Peak (ζ = 0.09, ω ≈ ω_res)",
    badge: "90° Phase Quadrature",
    wn: 3.0,
    omega: 2.97,
    zeta: 0.09,
    f0: 2.0,
    note: "Small damping caps resonance into a finite gain peak Q ≈ 5.56 centered slightly below ω_n at ω_res = ω_n√(1 - 2ζ²), where phase lag sweeps through 90°.",
  },
  {
    id: "heavy-isolation",
    name: "Shock Absorber Isolation (ζ = 0.80 > 1/√2)",
    badge: "Peak Eliminated",
    wn: 3.0,
    omega: 1.8,
    zeta: 0.8,
    f0: 3.0,
    note: "Because ζ ≥ 1/√2 ≈ 0.707, 1 - 2ζ² ≤ 0: the resonance peak vanishes completely and amplitude decreases monotonically across all driving frequencies.",
  },
];

export function ForcedResonanceLab() {
  const [presetId, setPresetId] = useState<string>("beats");
  const [wn, setWn] = useState<number>(FORCED_PRESETS[0].wn);
  const [omega, setOmega] = useState<number>(FORCED_PRESETS[0].omega);
  const [zeta, setZeta] = useState<number>(FORCED_PRESETS[0].zeta);
  const [f0, setF0] = useState<number>(FORCED_PRESETS[0].f0);

  const activePreset = useMemo(
    () => FORCED_PRESETS.find((p) => p.id === presetId) ?? FORCED_PRESETS[0],
    [presetId]
  );

  const handleSelectPreset = (p: ForcedPreset) => {
    setPresetId(p.id);
    setWn(p.wn);
    setOmega(p.omega);
    setZeta(p.zeta);
    setF0(p.f0);
  };

  const sim = useMemo(() => {
    const tMax = 20;
    const dt = 0.015;
    const totalSteps = Math.floor(tMax / dt);

    // RK4 from rest x(0)=0, v(0)=0 for x'' + 2*zeta*wn*x' + wn^2*x = f0*cos(omega*t)
    const timePts: { t: number; x: number; xp: number }[] = [];
    let x = 0;
    let v = 0;
    let maxAbsX = 0.25;

    const accel = (t: number, xVal: number, vVal: number) =>
      f0 * Math.cos(omega * t) - 2 * zeta * wn * vVal - wn * wn * xVal;

    // Complex frequency response at driving omega
    const denomReal = wn * wn - omega * omega;
    const denomImag = 2 * zeta * wn * omega;
    const denomMag = Math.hypot(denomReal, denomImag);
    const ssAmp = denomMag > 1e-4 ? f0 / denomMag : 0;
    const phiRad = Math.atan2(denomImag, denomReal);

    const sampleStride = 4; // store ~330 points for crisp SVG rendering
    for (let k = 0; k <= totalSteps; k++) {
      const t = k * dt;
      if (k % sampleStride === 0) {
        const xp =
          denomMag > 1e-4 ? ssAmp * Math.cos(omega * t - phiRad) : 0;
        timePts.push({ t, x, xp });
        if (Math.abs(x) > maxAbsX) maxAbsX = Math.abs(x);
      }

      const k1x = v;
      const k1v = accel(t, x, v);
      const k2x = v + 0.5 * dt * k1v;
      const k2v = accel(t + 0.5 * dt, x + 0.5 * dt * k1x, v + 0.5 * dt * k1v);
      const k3x = v + 0.5 * dt * k2v;
      const k3v = accel(t + 0.5 * dt, x + 0.5 * dt * k2x, v + 0.5 * dt * k2v);
      const k4x = v + dt * k3v;
      const k4v = accel(t + dt, x + dt * k3x, v + dt * k3v);

      x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
      v += (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    }

    // Frequency response sweep over ratio r = ω / ω_n ∈ [0, 2.4]
    const dcGain = 1 / (wn * wn); // normalized so M(0) = 1
    const magCurve: [number, number][] = [];
    const phaseCurve: [number, number][] = [];
    let maxMagRatio = 1.0;

    for (let i = 0; i <= 120; i++) {
      const r = (i / 120) * 2.4;
      const re = 1 - r * r;
      const im = 2 * zeta * r;
      const magRatio = 1 / Math.max(0.11, Math.hypot(re, im)); // cap near pole for crisp SVG scale
      const phDeg = (Math.atan2(im, re) * 180) / Math.PI;
      magCurve.push([r, magRatio]);
      phaseCurve.push([r, phDeg]);
      if (magRatio > maxMagRatio) maxMagRatio = magRatio;
    }

    const rCurrent = omega / wn;
    const magCurrent =
      1 / Math.max(0.11, Math.hypot(1 - rCurrent * rCurrent, 2 * zeta * rCurrent));
    const phaseCurrentDeg = (phiRad * 180) / Math.PI;

    const hasResPeak = zeta < 1 / Math.SQRT2;
    const rPeak = hasResPeak ? Math.sqrt(Math.max(0, 1 - 2 * zeta * zeta)) : 0;
    const omegaRes = rPeak * wn;

    return {
      timePts,
      yPlotLim: Math.max(1.2, Math.min(8.5, maxAbsX * 1.18)),
      magCurve,
      phaseCurve,
      magPlotLim: Math.max(2.2, Math.min(9.5, maxMagRatio * 1.12)),
      rCurrent,
      magCurrent,
      phaseCurrentDeg,
      ssAmp,
      dcAmp: f0 * dcGain,
      hasResPeak,
      rPeak,
      omegaRes,
      isPureResonance: zeta < 0.01 && Math.abs(omega - wn) < 0.06,
      isNearBeats: zeta < 0.025 && Math.abs(omega - wn) >= 0.06 && Math.abs(omega - wn) < 0.9,
    };
  }, [wn, omega, zeta, f0]);

  return (
    <section
      id="resonance-bode-amplitude"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-upper)] block">
            Laboratory 4.2.2.1 • Sinusoidal Forcing, Beats &amp; Bode Amplitude-Phase Response
          </span>
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
            Forced Resonance Gain, Phase Lag &amp; Transient-to-Steady-State Lab
          </h2>
          <p className="text-sm font-math-serif text-[var(--text-secondary)]">
            Sweep driving frequency <KaTeXMath math="\omega" /> and damping{" "}
            <KaTeXMath math="\zeta" /> across <KaTeXMath math="\ddot{x}+2\zeta\omega_n\dot{x}+\omega_n^2 x = f_0\cos(\omega t)" />{" "}
            to observe beats, secular blowup, and peak shift{" "}
            <KaTeXMath math="\omega_{\text{res}} = \omega_n\sqrt{1 - 2\zeta^2}" />.
          </p>
        </div>

        <span className="px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-diff)] shrink-0">
          {sim.isPureResonance
            ? "PURE RESONANCE (t·sin Growth)"
            : sim.isNearBeats
            ? "ACOUSTIC BEATS ENVELOPE"
            : `Gain = ${sim.magCurrent.toFixed(2)}× | Phase = ${sim.phaseCurrentDeg.toFixed(1)}°`}
        </span>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {FORCED_PRESETS.map((p) => {
          const selected = presetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`p-3 border text-left transition-colors ${
                selected
                  ? "border-[var(--math-ink-upper)] bg-[var(--bg-canvas)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 hover:border-[var(--border-strong)]"
              }`}
            >
              <span className="text-[11px] font-tabular-mono text-[var(--math-ink-upper)] font-semibold block mb-1">
                {p.badge}
              </span>
              <div className="text-xs font-math-serif text-[var(--text-primary)] leading-snug">
                {p.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-sweep)]">
              <span>Driving Frequency ω (rad/s)</span>
              <span>
                {omega.toFixed(2)} (r = {sim.rCurrent.toFixed(2)})
              </span>
            </div>
            <input
              type="range"
              min={0.3}
              max={6.5}
              step={0.03}
              value={omega}
              onChange={(e) => {
                setOmega(parseFloat(e.target.value));
                setPresetId("custom");
              }}
              className="w-full accent-[#D35323]"
              aria-label="Driving frequency ω (rad/s)"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-x)]">
              <span>Natural Frequency ω_n (rad/s)</span>
              <span>{wn.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={1.5}
              max={4.5}
              step={0.05}
              value={wn}
              onChange={(e) => {
                setWn(parseFloat(e.target.value));
                setPresetId("custom");
              }}
              className="w-full accent-[#8D9FCE]"
              aria-label="Natural frequency ω_n (rad/s)"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-y)]">
              <span>Damping Ratio ζ</span>
              <span>{zeta.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={1.1}
              step={0.01}
              value={zeta}
              onChange={(e) => {
                setZeta(parseFloat(e.target.value));
                setPresetId("custom");
              }}
              className="w-full accent-[#96B898]"
              aria-label="Damping ratio ζ"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-diff)]">
              <span>Forcing Amplitude f₀ = F₀/m</span>
              <span>{f0.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={4.0}
              step={0.1}
              value={f0}
              onChange={(e) => {
                setF0(parseFloat(e.target.value));
                setPresetId("custom");
              }}
              className="w-full accent-[#FBEAA4]"
              aria-label="Forcing amplitude f₀"
            />
          </div>
        </div>

        <div className="lg:col-span-5 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <div className="text-xs overflow-x-auto">
            <KaTeXMath
              math={`\\omega_{\\text{res}} = ${
                sim.hasResPeak
                  ? `${sim.omegaRes.toFixed(2)}\\text{ rad/s}`
                  : "\\text{None }(\\zeta \\ge 1/\\sqrt{2})"
              }`}
              block
            />
          </div>
          <p className="text-xs font-math-serif text-[var(--text-secondary)]">
            {presetId === "custom"
              ? "Click anywhere on the Amplitude Gain graph below to jump ω/ω_n directly to sub-resonant, peak, or high-frequency roll-off zones."
              : activePreset.note}
          </p>
        </div>
      </div>

      {/* Main 3-Panel Response */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Time-Domain Response */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 text-[var(--math-ink-x)]">
              <Waves className="w-3.5 h-3.5" />
              <span>Total Response x(t) vs. Steady-State x_p(t)</span>
            </span>
            <span>x(0)=0, v(0)=0</span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[0, 20]}
            yRange={[-sim.yPlotLim, sim.yPlotLim]}
            xLabel="t (s)"
            yLabel="x(t)"
            width={460}
            height={300}
            ariaLabel="Time-domain forced response waveform showing transient and steady-state behavior"
            className="w-full h-[300px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const totalPath = sim.timePts
                .map(
                  (pt, i) =>
                    `${i === 0 ? "M" : "L"}${toSvgX(pt.t).toFixed(1)},${toSvgY(Math.max(-sim.yPlotLim, Math.min(sim.yPlotLim, pt.x))).toFixed(1)}`
                )
                .join(" ");
              const ssPath = sim.timePts
                .map(
                  (pt, i) =>
                    `${i === 0 ? "M" : "L"}${toSvgX(pt.t).toFixed(1)},${toSvgY(Math.max(-sim.yPlotLim, Math.min(sim.yPlotLim, pt.xp))).toFixed(1)}`
                )
                .join(" ");

              return (
                <g>
                  {!sim.isPureResonance && zeta > 0.01 && (
                    <path
                      d={ssPath}
                      fill="none"
                      stroke="#FBEAA4"
                      strokeOpacity="0.65"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  )}
                  <path d={totalPath} fill="none" stroke="#8D9FCE" strokeWidth="2.3" />
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          <div className="flex flex-wrap gap-4 text-[11px] font-tabular-mono text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#8D9FCE] inline-block" />
              <span>Total Waveform x(t) = x_h + x_p</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#FBEAA4] inline-block" />
              <span>Steady-State x_p(t) (when damped)</span>
            </span>
          </div>
        </div>

        {/* Gain & Phase Frequency Curves */}
        <div className="lg:col-span-6 grid grid-cols-1 gap-4">
          {/* Gain Magnitude Curve */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5 text-[var(--math-ink-sweep)]">
                <Gauge className="w-3.5 h-3.5" />
                <span>Normalized Gain |H(iω)| / H(0) vs. r = ω/ω_n (Click to tune)</span>
              </span>
              <span>Gain = {sim.magCurrent.toFixed(2)}×</span>
            </div>

            <SvgCoordinatePlane2D
              xRange={[0, 2.4]}
              yRange={[0, sim.magPlotLim]}
              xLabel="ω/ω_n"
              yLabel="|H|"
              width={440}
              height={160}
              ariaLabel="Amplitude frequency response magnification factor curve"
              onSelectPoint={(r) => {
                setOmega(Number(Math.max(0.3, Math.min(6.5, r * wn)).toFixed(2)));
                setPresetId("custom");
              }}
              className="w-full h-[160px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] cursor-crosshair select-none"
            >
              {({ toSvgX, toSvgY }) => {
                const path = sim.magCurve
                  .map(
                    ([r, m], i) =>
                      `${i === 0 ? "M" : "L"}${toSvgX(r).toFixed(1)},${toSvgY(Math.min(sim.magPlotLim, m)).toFixed(1)}`
                  )
                  .join(" ");
                return (
                  <g>
                    {sim.hasResPeak && (
                      <line
                        x1={toSvgX(sim.rPeak)}
                        y1={toSvgY(0)}
                        x2={toSvgX(sim.rPeak)}
                        y2={toSvgY(sim.magPlotLim)}
                        stroke="#96B898"
                        strokeOpacity="0.6"
                        strokeDasharray="3 3"
                      />
                    )}
                    <path d={path} fill="none" stroke="#D35323" strokeWidth="2.3" />
                    <circle
                      cx={toSvgX(Math.min(2.4, sim.rCurrent))}
                      cy={toSvgY(Math.min(sim.magPlotLim, sim.magCurrent))}
                      r="4.5"
                      fill="#FBEAA4"
                      stroke="#1E1F22"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>
          </div>

          {/* Phase Lag Curve */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5 text-[var(--math-ink-z)]">
                <Radio className="w-3.5 h-3.5" />
                <span>Phase Lag φ(ω) (Crosses 90° at ω = ω_n)</span>
              </span>
              <span>φ = {sim.phaseCurrentDeg.toFixed(1)}°</span>
            </div>

            <SvgCoordinatePlane2D
              xRange={[0, 2.4]}
              yRange={[0, 185]}
              xLabel="ω/ω_n"
              yLabel="φ°"
              width={440}
              height={145}
              ariaLabel="Phase lag curve in degrees vs normalized driving frequency"
              onSelectPoint={(r) => {
                setOmega(Number(Math.max(0.3, Math.min(6.5, r * wn)).toFixed(2)));
                setPresetId("custom");
              }}
              className="w-full h-[145px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] cursor-crosshair select-none"
            >
              {({ toSvgX, toSvgY }) => {
                const path = sim.phaseCurve
                  .map(
                    ([r, ph], i) =>
                      `${i === 0 ? "M" : "L"}${toSvgX(r).toFixed(1)},${toSvgY(ph).toFixed(1)}`
                  )
                  .join(" ");
                return (
                  <g>
                    <line
                      x1={toSvgX(0)}
                      y1={toSvgY(90)}
                      x2={toSvgX(2.4)}
                      y2={toSvgY(90)}
                      stroke="#AAA36D"
                      strokeOpacity="0.5"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1={toSvgX(1)}
                      y1={toSvgY(0)}
                      x2={toSvgX(1)}
                      y2={toSvgY(185)}
                      stroke="#AAA36D"
                      strokeOpacity="0.5"
                      strokeDasharray="3 3"
                    />
                    <path d={path} fill="none" stroke="#029091" strokeWidth="2.3" />
                    <circle
                      cx={toSvgX(Math.min(2.4, sim.rCurrent))}
                      cy={toSvgY(sim.phaseCurrentDeg)}
                      r="4.5"
                      fill="#FBEAA4"
                      stroke="#1E1F22"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>
          </div>
        </div>
      </div>
    </section>
  );
}
