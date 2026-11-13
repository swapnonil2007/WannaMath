"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  createVectorArrow3D,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

interface HelixPreset {
  id: string;
  label: string;
  sigma: number;
  omega: number;
  amp: number;
  t0: number;
}

const PRESETS: HelixPreset[] = [
  { id: "pure-osc", label: "Pure Oscillation (σ = 0)", sigma: 0, omega: 2.0, amp: 1.4, t0: Math.PI / 4 },
  { id: "damped", label: "Damped Spiral (σ < 0)", sigma: -0.22, omega: 2.5, amp: 1.8, t0: 2.2 },
  { id: "growing", label: "Unstable Growth (σ > 0)", sigma: 0.14, omega: 2.2, amp: 0.85, t0: 3.1 },
  { id: "euler-pi", label: "Euler's Identity (e^{iπ})", sigma: 0, omega: 1.0, amp: 1.0, t0: Math.PI },
];

function fmt(n: number, digits = 2): string {
  const clean = Math.abs(n) < 1e-7 ? 0 : n;
  return clean.toFixed(digits);
}

/**
 * Interactive 3D Complex Exponential Helix & Argand Phasor Lab (5.1.1).
 * Connects z(t) = A e^{(σ + iω)t} in 3D space (t, Re z, Im z) with orthogonal cos/sin projections
 * and a 2D Argand plane phasor / polar-multiplication explorer.
 */
export function EulerHelixPhasorLab() {
  const [sigma, setSigma] = useState<number>(PRESETS[0].sigma);
  const [omega, setOmega] = useState<number>(PRESETS[0].omega);
  const [amp, setAmp] = useState<number>(PRESETS[0].amp);
  const [t0, setT0] = useState<number>(PRESETS[0].t0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string>(PRESETS[0].id);

  // Argand multiplication state
  const [planeMode, setPlaneMode] = useState<"phasor" | "multiply">("phasor");
  const [r1, setR1] = useState<number>(1.3);
  const [th1Deg, setTh1Deg] = useState<number>(35);
  const [r2, setR2] = useState<number>(1.2);
  const [th2Deg, setTh2Deg] = useState<number>(55);

  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT0((prev) => {
        const next = prev + dt * 1.15;
        return next > 6.5 ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  const helixData = useMemo(() => {
    const tMax = 6.5;
    const N = 160;
    const pts3D: Array<{ t: number; re: number; im: number }> = [];
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * tMax;
      const env = amp * Math.exp(sigma * t);
      const re = env * Math.cos(omega * t);
      const im = env * Math.sin(omega * t);
      pts3D.push({ t, re, im });
    }
    const env0 = amp * Math.exp(sigma * t0);
    const re0 = env0 * Math.cos(omega * t0);
    const im0 = env0 * Math.sin(omega * t0);
    const phaseRad = omega * t0;
    const phaseDeg = ((phaseRad * 180) / Math.PI) % 360;

    return { tMax, pts3D, env0, re0, im0, phaseRad, phaseDeg };
  }, [amp, sigma, omega, t0]);

  const multData = useMemo(() => {
    const a1 = (th1Deg * Math.PI) / 180;
    const a2 = (th2Deg * Math.PI) / 180;
    const z1: [number, number] = [r1 * Math.cos(a1), r1 * Math.sin(a1)];
    const z2: [number, number] = [r2 * Math.cos(a2), r2 * Math.sin(a2)];
    const rProd = r1 * r2;
    const thProdDeg = th1Deg + th2Deg;
    const aProd = (thProdDeg * Math.PI) / 180;
    const zProd: [number, number] = [rProd * Math.cos(aProd), rProd * Math.sin(aProd)];
    return { z1, z2, zProd, rProd, thProdDeg };
  }, [r1, th1Deg, r2, th2Deg]);

  const applyPreset = (p: HelixPreset) => {
    setIsPlaying(false);
    setSigma(p.sigma);
    setOmega(p.omega);
    setAmp(p.amp);
    setT0(p.t0);
    setActivePresetId(p.id);
    setPlaneMode("phasor");
  };

  return (
    <div className="space-y-5">
      {/* Control Ribbon */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#D5658B]">
              Complex Exponential Helix & Argand Phasor Engine
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">
              Watch <KaTeXMath math="z(t) = A e^{(\sigma + i\omega)t}" /> spiral through{" "}
              <KaTeXMath math="(t, \operatorname{Re} z, \operatorname{Im} z)" /> space while casting{" "}
              <KaTeXMath math="\cos(\omega t)" /> and <KaTeXMath math="\sin(\omega t)" /> shadows.
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
                    ? "border-[#D5658B] bg-[#D5658B]/15 text-[#F6F0D0]"
                    : "border-[#35383F] bg-[#1E1F22] text-[#A2AAB8] hover:border-[#D5658B]/60 hover:text-[#F6F0D0]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#FBEAA4]">
              <span>Time t₀</span>
              <span>{fmt(t0, 2)} s</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="rounded border border-[#D35323] bg-[#D35323]/20 px-2 py-0.5 font-sans text-[11px] font-semibold text-[#FBEAA4]"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <input
                type="range"
                min={0}
                max={6.5}
                step={0.05}
                value={t0}
                onChange={(e) => {
                  setIsPlaying(false);
                  setT0(parseFloat(e.target.value));
                }}
                className="w-full accent-[#FBEAA4]"
              />
            </div>
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#8D9FCE]">
              <span>Damping σ</span>
              <span>{fmt(sigma, 2)}</span>
            </div>
            <input
              type="range"
              min={-0.5}
              max={0.25}
              step={0.02}
              value={sigma}
              onChange={(e) => {
                setActivePresetId("custom");
                setSigma(parseFloat(e.target.value));
              }}
              className="mt-2 w-full accent-[#8D9FCE]"
            />
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#96B898]">
              <span>Frequency ω</span>
              <span>{fmt(omega, 2)} rad/s</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={4.5}
              step={0.1}
              value={omega}
              onChange={(e) => {
                setActivePresetId("custom");
                setOmega(parseFloat(e.target.value));
              }}
              className="mt-2 w-full accent-[#96B898]"
            />
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#D5658B]">
              <span>Amplitude A</span>
              <span>{fmt(amp, 2)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.05}
              value={amp}
              onChange={(e) => {
                setActivePresetId("custom");
                setAmp(parseFloat(e.target.value));
              }}
              className="mt-2 w-full accent-[#D5658B]"
            />
          </label>
        </div>
      </div>

      {/* Synchronized Dual Stage */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: 3D Complex Helix + Re/Im Projections */}
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                3D Helix Trajectory <KaTeXMath math="(t, \operatorname{Re} z, \operatorname{Im} z)" />
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Bottom floor shadow shows <KaTeXMath math="\cos(\omega t)" />; back wall shows{" "}
                <KaTeXMath math="\sin(\omega t)" />.
              </p>
            </div>
            <div className="flex gap-2 font-sans text-[11px]">
              <span className="rounded border border-[#FBEAA4]/50 bg-[#1E1F22] px-2 py-0.5 text-[#FBEAA4]">Helix</span>
              <span className="rounded border border-[#8D9FCE]/50 bg-[#1E1F22] px-2 py-0.5 text-[#8D9FCE]">Re</span>
              <span className="rounded border border-[#96B898]/50 bg-[#1E1F22] px-2 py-0.5 text-[#96B898]">Im</span>
            </div>
          </div>

          <ThreeOrbitViewport
            heightClassName="h-[380px]"
            cameraPosition={[5.2, 3.6, 5.2]}
            cameraTarget={[0.2, 0, 0]}
            titleBadge="Euler 3D Helix"
            sceneDeps={[helixData, t0]}
            onBuildScene={(group) => {
              // Map time t in [0, 6.5] -> math X in [-3.2, 3.2]
              const mapT = (t: number) => (t / helixData.tMax) * 6.4 - 3.2;
              const clampV = (v: number) => Math.max(-2.6, Math.min(2.6, v));

              // Main 3D helix curve
              const helixPoints = helixData.pts3D.map((p) =>
                mathToThreeVec3(mapT(p.t), clampV(p.re), clampV(p.im))
              );
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(helixPoints),
                  new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                )
              );

              // Floor shadow (Im fixed at -2.75) => Re(z) cosine wave
              const reShadowPts = helixData.pts3D.map((p) =>
                mathToThreeVec3(mapT(p.t), clampV(p.re), -2.75)
              );
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(reShadowPts),
                  new THREE.LineBasicMaterial({ color: 0x8d9fce })
                )
              );

              // Back wall shadow (Re fixed at -2.75) => Im(z) sine wave
              const imShadowPts = helixData.pts3D.map((p) =>
                mathToThreeVec3(mapT(p.t), -2.75, clampV(p.im))
              );
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(imShadowPts),
                  new THREE.LineBasicMaterial({ color: 0x96b898 })
                )
              );

              // Time axis spine line
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints([
                    mathToThreeVec3(-3.2, 0, 0),
                    mathToThreeVec3(3.2, 0, 0),
                  ]),
                  new THREE.LineBasicMaterial({ color: 0x626776 })
                )
              );

              // Active slice phasor vector at t = t0
              const x0 = mapT(t0);
              const re0 = clampV(helixData.re0);
              const im0 = clampV(helixData.im0);
              group.add(createVectorArrow3D([x0, 0, 0], [0, re0, im0], 0xd35323));

              // Projection drop-lines from active point at t0 to shadows
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints([
                    mathToThreeVec3(x0, re0, im0),
                    mathToThreeVec3(x0, re0, -2.75),
                  ]),
                  new THREE.LineBasicMaterial({ color: 0x8d9fce, transparent: true, opacity: 0.55 })
                )
              );
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints([
                    mathToThreeVec3(x0, re0, im0),
                    mathToThreeVec3(x0, -2.75, im0),
                  ]),
                  new THREE.LineBasicMaterial({ color: 0x96b898, transparent: true, opacity: 0.55 })
                )
              );
            }}
            footerSlot={
              <div className="flex flex-wrap justify-between gap-2 font-mono text-xs text-[#A2AAB8]">
                <span className="text-[#8D9FCE]">Re={fmt(helixData.re0, 2)}</span>
                <span className="text-[#96B898]">Im={fmt(helixData.im0, 2)}</span>
                <span className="text-[#FBEAA4]">
                  |z(t₀)|={fmt(helixData.env0, 2)} ∠ {fmt(helixData.phaseDeg, 1)}°
                </span>
              </div>
            }
          />
        </div>

        {/* Right: 2D Argand Cross-Section or Polar Multiplier */}
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                {planeMode === "phasor" ? "Argand Slice z(t₀)" : "Polar Multiplication z₁ · z₂"}
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                {planeMode === "phasor"
                  ? "Rotating phasor tip at time slice t₀ with real & imaginary components."
                  : "Magnitudes multiply (r₁r₂) while phase angles add (θ₁ + θ₂)."}
              </p>
            </div>
            <div className="flex rounded-lg border border-[#35383F] bg-[#1E1F22] p-0.5 font-sans text-xs">
              <button
                type="button"
                onClick={() => setPlaneMode("phasor")}
                className={`rounded-md px-2.5 py-1 ${
                  planeMode === "phasor" ? "bg-[#D5658B]/20 text-[#F6F0D0]" : "text-[#A2AAB8]"
                }`}
              >
                Helix Slice
              </button>
              <button
                type="button"
                onClick={() => setPlaneMode("multiply")}
                className={`rounded-md px-2.5 py-1 ${
                  planeMode === "multiply" ? "bg-[#029091]/20 text-[#F6F0D0]" : "text-[#A2AAB8]"
                }`}
              >
                Multiply z₁·z₂
              </button>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-3.0, 3.0]}
            yRange={[-3.0, 3.0]}
            width={480}
            height={360}
            xLabel="Re"
            yLabel="Im"
            ariaLabel="2D Complex Argand Plane"
            onSelectPoint={(x, y) => {
              if (planeMode === "multiply") {
                const rad = Math.min(2.2, Math.max(0.2, Math.hypot(x, y)));
                const deg = (Math.atan2(y, x) * 180) / Math.PI;
                setR1(Math.round(rad * 20) / 20);
                setTh1Deg(Math.round(deg));
              }
            }}
          >
            {({ toSvgX, toSvgY }) => {
              const ox = toSvgX(0);
              const oy = toSvgY(0);
              const unitCircle = Array.from({ length: 73 }, (_, i) => {
                const th = (i / 72) * Math.PI * 2;
                return `${i === 0 ? "M" : "L"}${toSvgX(Math.cos(th)).toFixed(1)},${toSvgY(Math.sin(th)).toFixed(1)}`;
              }).join(" ");

              if (planeMode === "phasor") {
                const spiralPts = helixData.pts3D
                  .filter((p) => p.t <= t0 + 0.05)
                  .map(
                    (p, i) =>
                      `${i === 0 ? "M" : "L"}${toSvgX(p.re).toFixed(1)},${toSvgY(p.im).toFixed(1)}`
                  )
                  .join(" ");

                const rx = toSvgX(helixData.re0);
                const iy = toSvgY(helixData.im0);

                return (
                  <g>
                    <path d={unitCircle} fill="none" stroke="#4B505C" strokeDasharray="4 4" strokeWidth={1.3} />
                    {spiralPts && <path d={spiralPts} fill="none" stroke="#FBEAA4" strokeWidth={1.8} opacity={0.75} />}

                    {/* Re and Im projections */}
                    <line x1={rx} y1={oy} x2={rx} y2={iy} stroke="#96B898" strokeDasharray="4 3" strokeWidth={1.5} />
                    <line x1={ox} y1={iy} x2={rx} y2={iy} stroke="#8D9FCE" strokeDasharray="4 3" strokeWidth={1.5} />

                    {/* Phasor vector */}
                    <line x1={ox} y1={oy} x2={rx} y2={iy} stroke="#D35323" strokeWidth={3} strokeLinecap="round" />
                    <circle cx={rx} cy={iy} r={6} fill="#D35323" stroke="#F6F0D0" strokeWidth={1.6} />
                    <text x={rx + 8} y={iy - 8} fill="#FBEAA4" fontSize="11" fontFamily="monospace">
                      {fmt(helixData.re0, 2)} {helixData.im0 >= 0 ? "+" : "-"} {fmt(Math.abs(helixData.im0), 2)}i
                    </text>
                  </g>
                );
              }

              return (
                <g>
                  <path d={unitCircle} fill="none" stroke="#4B505C" strokeDasharray="4 4" strokeWidth={1.3} />

                  {/* z1 */}
                  <line
                    x1={ox}
                    y1={oy}
                    x2={toSvgX(multData.z1[0])}
                    y2={toSvgY(multData.z1[1])}
                    stroke="#8D9FCE"
                    strokeWidth={2.5}
                  />
                  <circle cx={toSvgX(multData.z1[0])} cy={toSvgY(multData.z1[1])} r={5.5} fill="#8D9FCE" />
                  <text
                    x={toSvgX(multData.z1[0]) + 7}
                    y={toSvgY(multData.z1[1]) - 6}
                    fill="#8D9FCE"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    z₁ ({fmt(r1)}∠{th1Deg}°)
                  </text>

                  {/* z2 */}
                  <line
                    x1={ox}
                    y1={oy}
                    x2={toSvgX(multData.z2[0])}
                    y2={toSvgY(multData.z2[1])}
                    stroke="#96B898"
                    strokeWidth={2.5}
                  />
                  <circle cx={toSvgX(multData.z2[0])} cy={toSvgY(multData.z2[1])} r={5.5} fill="#96B898" />
                  <text
                    x={toSvgX(multData.z2[0]) + 7}
                    y={toSvgY(multData.z2[1]) + 14}
                    fill="#96B898"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    z₂ ({fmt(r2)}∠{th2Deg}°)
                  </text>

                  {/* z1 * z2 */}
                  <line
                    x1={ox}
                    y1={oy}
                    x2={toSvgX(multData.zProd[0])}
                    y2={toSvgY(multData.zProd[1])}
                    stroke="#D35323"
                    strokeWidth={3.2}
                  />
                  <circle
                    cx={toSvgX(multData.zProd[0])}
                    cy={toSvgY(multData.zProd[1])}
                    r={6.5}
                    fill="#D35323"
                    stroke="#F6F0D0"
                    strokeWidth={1.6}
                  />
                  <text
                    x={toSvgX(multData.zProd[0]) + 8}
                    y={toSvgY(multData.zProd[1]) - 8}
                    fill="#FBEAA4"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    z₁z₂ ({fmt(multData.rProd)}∠{multData.thProdDeg}°)
                  </text>
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          {planeMode === "multiply" && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <label className="rounded border border-[#35383F] bg-[#1E1F22] p-2 font-mono text-[#8D9FCE]">
                r₁={fmt(r1)} | θ₁={th1Deg}°
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={5}
                  value={th1Deg}
                  onChange={(e) => setTh1Deg(parseInt(e.target.value, 10))}
                  className="mt-1 w-full accent-[#8D9FCE]"
                />
              </label>
              <label className="rounded border border-[#35383F] bg-[#1E1F22] p-2 font-mono text-[#96B898]">
                r₂={fmt(r2)} | θ₂={th2Deg}°
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={5}
                  value={th2Deg}
                  onChange={(e) => setTh2Deg(parseInt(e.target.value, 10))}
                  className="mt-1 w-full accent-[#96B898]"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Live Formula Readout */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <KaTeXMath
          block
          math={`z(${fmt(t0, 2)}) = ${fmt(amp, 2)}\\,e^{(${fmt(sigma, 2)} + i\\,${fmt(omega, 2)})\\cdot ${fmt(t0, 2)}} = ${fmt(helixData.env0, 2)}\\big(\\cos(${fmt(helixData.phaseRad, 2)}) + i\\sin(${fmt(helixData.phaseRad, 2)})\\big) = \\color{#8D9FCE}{${fmt(helixData.re0, 3)}} ${helixData.im0 >= 0 ? "+" : "-"} \\color{#96B898}{${fmt(Math.abs(helixData.im0), 3)}i}`}
        />
      </div>
    </div>
  );
}
