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

function fmt(n: number, digits = 3): string {
  const clean = Math.abs(n) < 1e-7 ? 0 : n;
  return clean.toFixed(digits);
}

/**
 * 3D Bivariate Gaussian Bell, Marginal Wall Projections & Covariance Ellipse Lab (6.1.2).
 * Demonstrates how correlation ρ tilts covariance ellipses, skews conditional expectations E[Y|x₀],
 * shrinks conditional variance σ_y²(1 - ρ²), while marginals f_X, f_Y remain unchanged.
 */
export function BivariateGaussianLab() {
  const [rho, setRho] = useState<number>(0.7);
  const [sigX, setSigX] = useState<number>(1.0);
  const [sigY, setSigY] = useState<number>(0.9);
  const [sliceX0, setSliceX0] = useState<number>(0.8);

  const bivar = useMemo(() => {
    const omr2 = Math.max(0.04, 1 - rho * rho);
    const normFactor = 1 / (2 * Math.PI * sigX * sigY * Math.sqrt(omr2));

    const evalJoint = (x: number, y: number) => {
      const zx = x / sigX;
      const zy = y / sigY;
      const q = (zx * zx - 2 * rho * zx * zy + zy * zy) / omr2;
      return normFactor * Math.exp(-0.5 * q);
    };

    const evalMargX = (x: number) =>
      Math.exp(-0.5 * (x / sigX) * (x / sigX)) / (sigX * Math.sqrt(2 * Math.PI));
    const evalMargY = (y: number) =>
      Math.exp(-0.5 * (y / sigY) * (y / sigY)) / (sigY * Math.sqrt(2 * Math.PI));

    // Conditional mean and std dev of Y | X = sliceX0
    const condMeanY = rho * (sigY / sigX) * sliceX0;
    const condSigY = sigY * Math.sqrt(omr2);
    const evalCondY = (y: number) => {
      const z = (y - condMeanY) / condSigY;
      return Math.exp(-0.5 * z * z) / (condSigY * Math.sqrt(2 * Math.PI));
    };

    // Covariance matrix spectral eigendecomposition for confidence ellipse orientation
    const covXX = sigX * sigX;
    const covXY = rho * sigX * sigY;
    const covYY = sigY * sigY;
    const tr = covXX + covYY;
    const disc = Math.sqrt((covXX - covYY) * (covXX - covYY) + 4 * covXY * covXY);
    const lam1 = (tr + disc) / 2;
    const lam2 = (tr - disc) / 2;
    const theta = Math.abs(covXY) < 1e-8 && Math.abs(covXX - covYY) < 1e-8 ? 0 : 0.5 * Math.atan2(2 * covXY, covXX - covYY);

    const buildEllipse = (kSigma: number): Array<[number, number]> => {
      const pts: Array<[number, number]> = [];
      const a = kSigma * Math.sqrt(lam1);
      const b = kSigma * Math.sqrt(lam2);
      const cT = Math.cos(theta);
      const sT = Math.sin(theta);
      for (let i = 0; i <= 72; i++) {
        const t = (i / 72) * Math.PI * 2;
        const px = a * Math.cos(t);
        const py = b * Math.sin(t);
        pts.push([cT * px - sT * py, sT * px + cT * py]);
      }
      return pts;
    };

    const ellipse1 = buildEllipse(1);
    const ellipse2 = buildEllipse(2);

    // Conditional vs Marginal 1D slice points for Y
    const ySlicePts: Array<{ y: number; marg: number; cond: number }> = [];
    for (let i = 0; i <= 100; i++) {
      const y = -2.8 + (i / 100) * 5.6;
      ySlicePts.push({ y, marg: evalMargY(y), cond: evalCondY(y) });
    }

    return {
      evalJoint,
      evalMargX,
      evalMargY,
      condMeanY,
      condSigY,
      thetaDeg: (theta * 180) / Math.PI,
      ellipse1,
      ellipse2,
      ySlicePts,
    };
  }, [rho, sigX, sigY, sliceX0]);

  return (
    <div className="space-y-5">
      {/* Control Ribbon */}
      <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#96B898]">
              Bivariate Joint Density, Marginals & Conditional Slice Lab
            </p>
            <p className="mt-1 font-serif text-sm text-[#D6DAE2]">
              Vary correlation <KaTeXMath math="\rho" /> to tilt the 3D bell & covariance ellipse while slicing
              conditional density <KaTeXMath math="f_{Y|X}(y \mid x_0)" /> at <KaTeXMath math="x = x_0" />.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { lbl: "Uncorrelated (ρ=0)", r: 0 },
              { lbl: "Positive (ρ=+0.75)", r: 0.75 },
              { lbl: "Strong Negative (ρ=−0.8)", r: -0.8 },
            ].map((p) => (
              <button
                key={p.lbl}
                type="button"
                onClick={() => setRho(p.r)}
                className={`rounded-lg border px-3 py-1.5 font-sans text-xs font-medium ${
                  Math.abs(rho - p.r) < 0.04
                    ? "border-[#96B898] bg-[#96B898]/15 text-[#F6F0D0]"
                    : "border-[#35383F] bg-[#1E1F22] text-[#A2AAB8] hover:border-[#96B898]/60 hover:text-[#F6F0D0]"
                }`}
              >
                {p.lbl}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#E37CA0]">
              <span>Correlation ρ</span>
              <span>{fmt(rho, 2)}</span>
            </div>
            <input
              type="range"
              min={-0.92}
              max={0.92}
              step={0.02}
              value={rho}
              onChange={(e) => setRho(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#D5658B]"
            />
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#8D9FCE]">
              <span>Spread σ_x</span>
              <span>{fmt(sigX, 2)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={sigX}
              onChange={(e) => setSigX(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#8D9FCE]"
            />
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#96B898]">
              <span>Spread σ_y</span>
              <span>{fmt(sigY, 2)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={sigY}
              onChange={(e) => setSigY(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#96B898]"
            />
          </label>

          <label className="rounded-lg border border-[#35383F] bg-[#1E1F22] p-3">
            <div className="flex justify-between font-mono text-xs text-[#EF7547]">
              <span>Condition Slice x₀</span>
              <span>{fmt(sliceX0, 2)}</span>
            </div>
            <input
              type="range"
              min={-2.0}
              max={2.0}
              step={0.05}
              value={sliceX0}
              onChange={(e) => setSliceX0(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#D35323]"
            />
          </label>
        </div>
      </div>

      {/* Synchronized 3D Bell + 2D Confidence Ellipse */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                3D Joint Bell <KaTeXMath math="f_{X,Y}(x,y)" /> & Marginal Walls
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Back walls project <KaTeXMath math="f_X(x), f_Y(y)" />; orange trace slices{" "}
                <KaTeXMath math="x = x_0" />.
              </p>
            </div>
          </div>

          <ThreeOrbitViewport
            heightClassName="h-[360px]"
            cameraPosition={[5.2, 4.0, 5.2]}
            cameraTarget={[0, 0.5, 0]}
            titleBadge="3D Bivariate Bell"
            sceneDeps={[rho, sigX, sigY, sliceX0]}
            onBuildScene={(group) => {
              const bellScale = 5.5;
              const bell = createParametricSurfaceMesh(
                (x, y) => [x, y, Math.min(2.8, bivar.evalJoint(x, y) * bellScale)],
                [-2.4, 2.4],
                [-2.4, 2.4],
                42,
                42,
                {
                  color: 0x029091,
                  opacity: 0.72,
                  wireframeColor: 0xfbeaa4,
                  wireframeOpacity: 0.18,
                  showWireframe: true,
                }
              );
              group.add(bell);

              // Marginal X projection on y = +2.5 wall
              const mxPts: THREE.Vector3[] = [];
              for (let i = 0; i <= 72; i++) {
                const x = -2.4 + (i / 72) * 4.8;
                mxPts.push(mathToThreeVec3(x, 2.55, Math.min(2.8, bivar.evalMargX(x) * 3.2)));
              }
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(mxPts),
                  new THREE.LineBasicMaterial({ color: 0x8d9fce })
                )
              );

              // Marginal Y projection on x = -2.5 wall
              const myPts: THREE.Vector3[] = [];
              for (let i = 0; i <= 72; i++) {
                const y = -2.4 + (i / 72) * 4.8;
                myPts.push(mathToThreeVec3(-2.55, y, Math.min(2.8, bivar.evalMargY(y) * 3.2)));
              }
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(myPts),
                  new THREE.LineBasicMaterial({ color: 0x96b898 })
                )
              );

              // Conditional slice trace along x = sliceX0
              const slicePts: THREE.Vector3[] = [];
              for (let i = 0; i <= 72; i++) {
                const y = -2.4 + (i / 72) * 4.8;
                slicePts.push(mathToThreeVec3(sliceX0, y, Math.min(2.8, bivar.evalJoint(sliceX0, y) * bellScale) + 0.03));
              }
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(slicePts),
                  new THREE.LineBasicMaterial({ color: 0xd35323 })
                )
              );
            }}
            footerSlot={
              <div className="flex justify-between font-mono text-xs text-[#A2AAB8]">
                <span className="text-[#8D9FCE]">Wall: f_X(x)</span>
                <span className="text-[#96B898]">Wall: f_Y(y)</span>
                <span className="text-[#EF7547]">Slice: x = {fmt(sliceX0, 1)}</span>
              </div>
            }
          />
        </div>

        {/* 2D Covariance Confidence Ellipses */}
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#F6F0D0]">
                2D Covariance Ellipses (<KaTeXMath math="1\sigma, 2\sigma" />) & Regression Line
              </h3>
              <p className="font-sans text-xs text-[#A2AAB8]">
                Click anywhere on the plane to set slice <KaTeXMath math="x_0" />.
              </p>
            </div>
          </div>

          <SvgCoordinatePlane2D
            xRange={[-2.8, 2.8]}
            yRange={[-2.8, 2.8]}
            width={480}
            height={360}
            xLabel="X"
            yLabel="Y"
            ariaLabel="Bivariate Covariance Ellipses"
            onSelectPoint={(x) => setSliceX0(Math.max(-2.0, Math.min(2.0, Math.round(x * 20) / 20)))}
          >
            {({ toSvgX, toSvgY }) => {
              const pathD = (pts: Array<[number, number]>) =>
                pts
                  .map(([x, y], i) => `${i === 0 ? "M" : "L"}${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`)
                  .join(" ");

              const slopeReg = rho * (sigY / sigX);

              return (
                <g>
                  {/* 2-sigma and 1-sigma covariance ellipses */}
                  <path d={pathD(bivar.ellipse2)} fill="#8D9FCE" fillOpacity={0.1} stroke="#8D9FCE" strokeWidth={1.8} />
                  <path d={pathD(bivar.ellipse1)} fill="#FBEAA4" fillOpacity={0.14} stroke="#FBEAA4" strokeWidth={2.2} />

                  {/* Conditional mean regression line E[Y|X=x] */}
                  <line
                    x1={toSvgX(-2.6)}
                    y1={toSvgY(-2.6 * slopeReg)}
                    x2={toSvgX(2.6)}
                    y2={toSvgY(2.6 * slopeReg)}
                    stroke="#D5658B"
                    strokeDasharray="6 4"
                    strokeWidth={1.8}
                  />

                  {/* Active slice line x = sliceX0 */}
                  <line
                    x1={toSvgX(sliceX0)}
                    y1={toSvgY(-2.7)}
                    x2={toSvgX(sliceX0)}
                    y2={toSvgY(2.7)}
                    stroke="#D35323"
                    strokeWidth={2.2}
                  />

                  {/* Conditional mean dot at (x0, E[Y|x0]) */}
                  <circle
                    cx={toSvgX(sliceX0)}
                    cy={toSvgY(bivar.condMeanY)}
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

      {/* Conditional Density Comparison + Covariance Matrix Cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 lg:col-span-2">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#EF7547]">
              Marginal f_Y(y) vs. Conditioned f_{"{Y|X}"}(y | x₀ = {fmt(sliceX0, 2)})
            </span>
            <span className="font-mono text-xs text-[#FBEAA4]">
              σ_{"{Y|X}"} = {fmt(bivar.condSigY, 3)} (vs. σ_y = {fmt(sigY, 2)})
            </span>
          </div>
          <svg
            role="img"
            aria-label="Comparison plot of marginal distribution f_Y(y) and conditional slice f_{Y|X}(y given x_0) showing variance reduction and conditional mean shift"
            viewBox="0 0 600 170"
            className="w-full rounded-lg border border-[#35383F] bg-[#1E1F22]"
          >
            {(() => {
              const pad = 26;
              const maxY = Math.max(0.8, ...bivar.ySlicePts.map((p) => p.cond));
              const sx = (y: number) => pad + ((y + 2.8) / 5.6) * (600 - 2 * pad);
              const sy = (val: number) => 170 - pad - (val / maxY) * (170 - 2 * pad);
              const margD = bivar.ySlicePts
                .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.y).toFixed(1)},${sy(p.marg).toFixed(1)}`)
                .join(" ");
              const condD = bivar.ySlicePts
                .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.y).toFixed(1)},${sy(p.cond).toFixed(1)}`)
                .join(" ");
              return (
                <g>
                  <line x1={pad} y1={170 - pad} x2={600 - pad} y2={170 - pad} stroke="#4B505C" />
                  <path d={margD} fill="none" stroke="#96B898" strokeWidth={1.8} strokeDasharray="5 3" />
                  <path d={condD} fill="none" stroke="#D35323" strokeWidth={2.5} />
                  <line
                    x1={sx(bivar.condMeanY)}
                    y1={pad}
                    x2={sx(bivar.condMeanY)}
                    y2={170 - pad}
                    stroke="#FBEAA4"
                    strokeDasharray="3 3"
                  />
                </g>
              );
            })()}
          </svg>
        </div>

        <div className="rounded-xl border border-[#35383F] bg-[#26282C] p-4 font-mono text-xs tabular-nums text-[#D6DAE2]">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#8D9FCE] block">
            Covariance Matrix Σ & Slice Stats
          </span>
          <div className="mt-2 text-xs text-[#F6F0D0]">
            <KaTeXMath
              block
              math={`\\Sigma = \\begin{bmatrix} ${fmt(sigX * sigX, 2)} & ${fmt(rho * sigX * sigY, 2)} \\\\ ${fmt(rho * sigX * sigY, 2)} & ${fmt(sigY * sigY, 2)} \\end{bmatrix}`}
            />
          </div>
          <div className="mt-2 space-y-1">
            <div>
              E[Y | x₀] = <span className="text-[#EF7547]">{fmt(bivar.condMeanY, 3)}</span>
            </div>
            <div>
              Principal Axis Tilt = <span className="text-[#FBEAA4]">{fmt(bivar.thetaDeg, 1)}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
