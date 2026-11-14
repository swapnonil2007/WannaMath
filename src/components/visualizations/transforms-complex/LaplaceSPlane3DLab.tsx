"use client";

import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  createParametricSurfaceMesh,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

interface SPlanePreset {
  id: string;
  label: string;
  sigmaP: number;
  omegaP: number;
  hasZero: boolean;
  zeroSigma: number;
  note: string;
}

const PRESETS: SPlanePreset[] = [
  {
    id: "underdamped",
    label: "Underdamped Resonator",
    sigmaP: -0.45,
    omegaP: 1.7,
    hasZero: false,
    zeroSigma: 0,
    note: "Complex conjugate poles in the left half-plane (σ_p < 0) yield a bounded Bode peak and decaying sine impulse response.",
  },
  {
    id: "bandpass",
    label: "Bandpass Filter (Zero at 0)",
    sigmaP: -0.35,
    omegaP: 1.8,
    hasZero: true,
    zeroSigma: 0,
    note: "Placing a zero at s = 0 pins |H(0)| = 0 while nearby poles at σ_p ± iω_p carve a crisp bandpass peak on the jω slice.",
  },
  {
    id: "critical",
    label: "Overdamped / Real Pole Pair",
    sigmaP: -1.1,
    omegaP: 0.0,
    hasZero: false,
    zeroSigma: 0,
    note: "When ω_p = 0, both poles sit cleanly on the negative real axis: zero ringing in h(t) and monotonic low-pass rolloff.",
  },
  {
    id: "unstable",
    label: "Unstable RHP Poles (σ_p > 0)",
    sigmaP: 0.25,
    omegaP: 1.5,
    hasZero: false,
    zeroSigma: 0,
    note: "Poles cross into Re(s) > 0: the Region of Convergence Re(s) > σ_p excludes the jω axis and h(t) explodes exponentially!",
  },
];

function fmt(n: number, digits = 2): string {
  const clean = Math.abs(n) < 1e-7 ? 0 : n;
  return clean.toFixed(digits);
}

/**
 * 3D s-Plane Pole-Zero Tent Surface, ROC & jω Bode Slicer Lab (5.3.1).
 * Connects conjugate poles σ_p ± iω_p and optional real zero z₀ directly to |H(σ + iω)|,
 * the jω-axis Bode slice, Region of Convergence stability, and impulse waveform h(t).
 */
export function LaplaceSPlane3DLab() {
  const [sigmaP, setSigmaP] = useState<number>(PRESETS[0].sigmaP);
  const [omegaP, setOmegaP] = useState<number>(PRESETS[0].omegaP);
  const [hasZero, setHasZero] = useState<boolean>(PRESETS[0].hasZero);
  const [zeroSigma, setZeroSigma] = useState<number>(PRESETS[0].zeroSigma);
  const [activePresetId, setActivePresetId] = useState<string>(PRESETS[0].id);

  const transfer = useMemo(() => {
    // H(s) = K * (hasZero ? (s - zeroSigma) : (sigmaP^2 + omegaP^2)) / ((s - sigmaP)^2 + omegaP^2)
    const kGain = hasZero ? 1.5 : Math.max(0.4, sigmaP * sigmaP + omegaP * omegaP);

    const evalMag = (sig: number, om: number) => {
      // Denominator (s - (sigmaP + i*omegaP))(s - (sigmaP - i*omegaP)) = ((sig - sigmaP)^2 - (om - omegaP)(om + omegaP)) + i*2*(sig-sigmaP)*om
      const d1 = Math.hypot(sig - sigmaP, om - omegaP);
      const d2 = Math.hypot(sig - sigmaP, om + omegaP);
      const num = hasZero ? Math.hypot(sig - zeroSigma, om) : 1;
      const denom = Math.max(0.06, d1 * d2);
      return (kGain * num) / denom;
    };

    // jω Bode slice along σ = 0, ω ∈ [0, 3.6]
    const bodePts: Array<{ w: number; mag: number }> = [];
    for (let i = 0; i <= 90; i++) {
      const w = (i / 90) * 3.6;
      bodePts.push({ w, mag: Math.min(4.2, evalMag(0, w)) });
    }

    // Time-domain impulse response h(t)
    const impulsePts: Array<{ t: number; h: number }> = [];
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * 8;
      let val = 0;
      const env = Math.exp(Math.min(3.2, sigmaP * t));
      if (omegaP > 0.05) {
        if (hasZero) {
          // L^-1 { (s - z0) / ((s - sig)^2 + w^2) } = e^{sig t} [cos(wt) + ((sig - z0)/w) sin(wt)]
          val = kGain * env * (Math.cos(omegaP * t) + ((sigmaP - zeroSigma) / omegaP) * Math.sin(omegaP * t));
        } else {
          // L^-1 { K / ((s - sig)^2 + w^2) } = (K / w) e^{sig t} sin(wt)
          val = (kGain / omegaP) * env * Math.sin(omegaP * t);
        }
      } else {
        // Double real pole at s = sigmaP
        val = hasZero ? kGain * env * (1 + (sigmaP - zeroSigma) * t) : kGain * t * env;
      }
      impulsePts.push({ t, h: val });
    }

    const biboStable = sigmaP < -1e-4;
    const marginal = Math.abs(sigmaP) <= 1e-4;

    return { kGain, evalMag, bodePts, impulsePts, biboStable, marginal };
  }, [sigmaP, omegaP, hasZero, zeroSigma]);

  const applyPreset = (p: SPlanePreset) => {
    setSigmaP(p.sigmaP);
    setOmegaP(p.omegaP);
    setHasZero(p.hasZero);
    setZeroSigma(p.zeroSigma);
    setActivePresetId(p.id);
  };

  return (
    <div className="space-y-5">
      {/* Control Ribbon */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#28B7B8]">
              Laplace s-Plane Pole–Zero Architect
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">
              Drag conjugate poles <KaTeXMath math="p_{1,2} = \sigma_p \pm i\omega_p" /> to sculpt the 3D surface{" "}
              <KaTeXMath math="|H(\sigma + i\omega)|" /> and its <KaTeXMath math="\sigma = 0" /> Bode slice.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className={`rounded-lg border px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
                  activePresetId === p.id
                    ? "border-[#029091] bg-[#029091]/15 text-[#F6F0D0]"
                    : "border-[#35383F] bg-[#1E1F22] text-[#A2AAB8] hover:border-[#029091]/60 hover:text-[#F6F0D0]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#EF7547]">
              <span>Pole Real σ_p</span>
              <span>{fmt(sigmaP, 2)}</span>
            </div>
            <input
              type="range"
              min={-2.0}
              max={0.6}
              step={0.05}
              value={sigmaP}
              onChange={(e) => {
                setActivePresetId("custom");
                setSigmaP(parseFloat(e.target.value));
              }}
              className="mt-2 w-full accent-[#D35323]"
            />
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#96B898]">
              <span>Pole Freq ω_p</span>
              <span>±{fmt(omegaP, 2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={2.6}
              step={0.05}
              value={omegaP}
              onChange={(e) => {
                setActivePresetId("custom");
                setOmegaP(parseFloat(e.target.value));
              }}
              className="mt-2 w-full accent-[#96B898]"
            />
          </label>

          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[#8D9FCE]">Real Zero z₀</span>
              <button
                type="button"
                onClick={() => {
                  setActivePresetId("custom");
                  setHasZero((z) => !z);
                }}
                className={`rounded border px-2 py-0.5 font-sans text-[11px] ${
                  hasZero
                    ? "border-[#8D9FCE] bg-[#8D9FCE]/20 text-[#F6F0D0]"
                    : "border-[#35383F] bg-[#26282C] text-[#A2AAB8]"
                }`}
              >
                {hasZero ? `Active (${fmt(zeroSigma, 1)})` : "Off"}
              </button>
            </div>
            <input
              type="range"
              min={-2.0}
              max={1.0}
              step={0.1}
              disabled={!hasZero}
              value={zeroSigma}
              onChange={(e) => {
                setActivePresetId("custom");
                setZeroSigma(parseFloat(e.target.value));
              }}
              className="mt-2 w-full accent-[#8D9FCE] disabled:opacity-40"
              aria-label="Real zero location σ₀"
            />
          </div>

          <div className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3 flex flex-col justify-between">
            <span className="font-sans text-xs font-semibold text-[#F6F0D0]">ROC & BIBO Stability</span>
            <span
              className={`mt-1 font-mono text-xs font-semibold ${
                transfer.biboStable ? "text-[#96B898]" : transfer.marginal ? "text-[#FBEAA4]" : "text-[#DF7E90]"
              }`}
            >
              {transfer.biboStable
                ? `STABLE: Re(s) > ${fmt(sigmaP)} ⊃ jω`
                : transfer.marginal
                ? "MARGINAL (Poles on jω)"
                : `UNSTABLE: Re(s) > ${fmt(sigmaP)} ⊅ jω`}
            </span>
          </div>
        </div>
      </div>

      {/* Top Row: 3D Tent Surface + Clickable 2D s-Plane */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                3D Laplace Magnitude Tent <KaTeXMath math="|H(\sigma + i\omega)|" />
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Gold ridge marks the <KaTeXMath math="\sigma = 0" /> imaginary axis (<KaTeXMath math="j\omega" /> Bode slice).
              </p>
            </div>
          </div>

          <ThreeOrbitViewport
            heightClassName="h-[360px]"
            cameraPosition={[4.8, 3.8, 4.8]}
            cameraTarget={[-0.4, 0.7, 0]}
            titleBadge="3D s-Plane Surface"
            sceneDeps={[sigmaP, omegaP, hasZero, zeroSigma]}
            onBuildScene={(group) => {
              const surf = createParametricSurfaceMesh(
                (sig, om) => [sig, om, Math.min(2.8, transfer.evalMag(sig, om) * 0.68)],
                [-2.4, 1.2],
                [-2.8, 2.8],
                44,
                48,
                {
                  color: 0x029091,
                  opacity: 0.7,
                  wireframeColor: 0x8d9fce,
                  wireframeOpacity: 0.2,
                  showWireframe: true,
                }
              );
              group.add(surf);

              // Highlighted jw Bode frequency slice along sigma = 0
              const jwPts: THREE.Vector3[] = [];
              for (let i = 0; i <= 80; i++) {
                const om = -2.8 + (i / 80) * 5.6;
                jwPts.push(mathToThreeVec3(0, om, Math.min(2.8, transfer.evalMag(0, om) * 0.68) + 0.03));
              }
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(jwPts),
                  new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                )
              );
            }}
            footerSlot={
              <div className="flex justify-between font-mono text-xs text-[#A2AAB8]">
                <span className="text-[#FBEAA4]">Gold Curve: jω Slice (σ = 0)</span>
                <span className="text-[#EF7547]">Poles at {fmt(sigmaP)} ± {fmt(omegaP)}i</span>
              </div>
            }
          />
        </div>

        {/* Clickable 2D s-Plane + ROC Shading */}
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                2D <KaTeXMath math="s" />-Plane & Region of Convergence (ROC)
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Click anywhere on the plane to relocate conjugate poles <KaTeXMath math="\sigma_p \pm i\omega_p" />.
              </p>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-2.6, 1.4]}
            yRange={[-2.8, 2.8]}
            width={480}
            height={360}
            xLabel="Re(s) = σ"
            yLabel="Im(s) = ω"
            ariaLabel="Complex s-Plane Pole Zero Plot"
            onSelectPoint={(sig, om) => {
              setActivePresetId("custom");
              setSigmaP(Math.max(-2.0, Math.min(0.6, Math.round(sig * 20) / 20)));
              setOmegaP(Math.max(0, Math.min(2.6, Math.round(Math.abs(om) * 20) / 20)));
            }}
          >
            {({ toSvgX, toSvgY }) => {
              const rocX = toSvgX(sigmaP);
              const rocRight = toSvgX(1.4);
              const topY = toSvgY(2.8);
              const botY = toSvgY(-2.8);
              const px = toSvgX(sigmaP);
              const pyPos = toSvgY(omegaP);
              const pyNeg = toSvgY(-omegaP);

              return (
                <g>
                  {/* Shaded causal ROC Re(s) > sigmaP */}
                  <rect
                    x={rocX}
                    y={topY}
                    width={Math.max(0, rocRight - rocX)}
                    height={Math.max(0, botY - topY)}
                    fill={transfer.biboStable ? "#96B898" : "#B95869"}
                    fillOpacity={0.14}
                  />
                  {/* ROC boundary line */}
                  <line
                    x1={rocX}
                    y1={topY}
                    x2={rocX}
                    y2={botY}
                    stroke={transfer.biboStable ? "#96B898" : "#B95869"}
                    strokeWidth={1.6}
                    strokeDasharray="5 4"
                  />

                  {/* Highlighted jω axis */}
                  <line
                    x1={toSvgX(0)}
                    y1={topY}
                    x2={toSvgX(0)}
                    y2={botY}
                    stroke="#FBEAA4"
                    strokeWidth={1.8}
                    opacity={0.75}
                  />

                  {/* Conjugate Poles X */}
                  {[pyPos, ...(omegaP > 0.05 ? [pyNeg] : [])].map((py, i) => (
                    <g key={i}>
                      <line x1={px - 7} y1={py - 7} x2={px + 7} y2={py + 7} stroke="#D35323" strokeWidth={2.8} />
                      <line x1={px - 7} y1={py + 7} x2={px + 7} y2={py - 7} stroke="#D35323" strokeWidth={2.8} />
                    </g>
                  ))}

                  {/* Optional Zero O */}
                  {hasZero && (
                    <circle
                      cx={toSvgX(zeroSigma)}
                      cy={toSvgY(0)}
                      r={6.5}
                      fill="#1E1F22"
                      stroke="#8D9FCE"
                      strokeWidth={2.6}
                    />
                  )}
                </g>
              );
            }}
          </SvgCoordinatePlane2D>
        </div>
      </div>

      {/* Bottom Row: Bode Frequency Gain & Impulse Response h(t) */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#FBEAA4]">
            Bode Frequency Response Slice |H(iω)| (ω ≥ 0)
          </p>
          <svg
            role="img"
            aria-label="Bode magnitude frequency response curve |H(i omega)| along the imaginary axis for omega >= 0"
            viewBox="0 0 460 190"
            className="mt-2 w-full rounded-lg border border-[#35383F] bg-[#1E1F22]"
          >
            {(() => {
              const pad = 28;
              const sx = (w: number) => pad + (w / 3.6) * (460 - 2 * pad);
              const sy = (m: number) => 190 - pad - (Math.min(4.0, m) / 4.0) * (190 - 2 * pad);
              const d = transfer.bodePts
                .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.w).toFixed(1)},${sy(p.mag).toFixed(1)}`)
                .join(" ");
              return (
                <g>
                  <line x1={pad} y1={190 - pad} x2={460 - pad} y2={190 - pad} stroke="#4B505C" />
                  <line x1={pad} y1={pad} x2={pad} y2={190 - pad} stroke="#4B505C" />
                  <path d={d} fill="none" stroke="#FBEAA4" strokeWidth={2.4} />
                  {omegaP > 0 && (
                    <line
                      x1={sx(omegaP)}
                      y1={pad}
                      x2={sx(omegaP)}
                      y2={190 - pad}
                      stroke="#D35323"
                      strokeDasharray="4 4"
                      opacity={0.7}
                    />
                  )}
                  <text x={460 - pad} y={190 - 8} textAnchor="end" fill="#A2AAB8" fontSize="11">
                    ω (rad/s)
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#96B898]">
            Time-Domain Impulse Response h(t) = ℒ⁻¹{"{H(s)}"}
          </p>
          <svg
            role="img"
            aria-label="Time-domain impulse response curve h(t) = L^{-1}{H(s)} showing BIBO decay or exponential growth"
            viewBox="0 0 460 190"
            className="mt-2 w-full rounded-lg border border-[#35383F] bg-[#1E1F22]"
          >
            {(() => {
              const pad = 28;
              const maxH = Math.max(1.2, ...transfer.impulsePts.map((p) => Math.abs(p.h)));
              const capH = Math.min(8, maxH);
              const sx = (t: number) => pad + (t / 8) * (460 - 2 * pad);
              const sy = (h: number) => 95 - (Math.max(-capH, Math.min(capH, h)) / capH) * (95 - pad);
              const d = transfer.impulsePts
                .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.t).toFixed(1)},${sy(p.h).toFixed(1)}`)
                .join(" ");
              return (
                <g>
                  <line x1={pad} y1={95} x2={460 - pad} y2={95} stroke="#4B505C" />
                  <line x1={pad} y1={pad} x2={pad} y2={190 - pad} stroke="#4B505C" />
                  <path d={d} fill="none" stroke={transfer.biboStable ? "#96B898" : "#B95869"} strokeWidth={2.4} />
                  <text x={460 - pad} y={190 - 8} textAnchor="end" fill="#A2AAB8" fontSize="11">
                    t (seconds)
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
}
