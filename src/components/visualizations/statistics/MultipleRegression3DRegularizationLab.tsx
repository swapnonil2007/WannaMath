"use client";

import React, { useCallback, useMemo, useState } from "react";
import * as THREE from "three";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import {
  ThreeOrbitViewport,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";
import { createSeededRng, sampleNormal } from "./statMath";

type PenaltyMode = "lasso" | "ridge";

interface Sample3D {
  x1: number;
  x2: number;
  y: number;
}

function solve2x2OlsAndPenalty(
  samples: readonly Sample3D[],
  penalty: PenaltyMode,
  lambdaNorm: number
) {
  const n = samples.length;
  const meanX1 = samples.reduce((s, d) => s + d.x1, 0) / n;
  const meanX2 = samples.reduce((s, d) => s + d.x2, 0) / n;
  const meanY = samples.reduce((s, d) => s + d.y, 0) / n;

  // Center features and target
  let s11 = 0;
  let s22 = 0;
  let s12 = 0;
  let s1y = 0;
  let s2y = 0;
  let syy = 0;
  for (const d of samples) {
    const c1 = d.x1 - meanX1;
    const c2 = d.x2 - meanX2;
    const cy = d.y - meanY;
    s11 += c1 * c1;
    s22 += c2 * c2;
    s12 += c1 * c2;
    s1y += c1 * cy;
    s2y += c2 * cy;
    syy += cy * cy;
  }

  // Exact OLS solution
  const detOls = s11 * s22 - s12 * s12;
  const b1Ols = (s22 * s1y - s12 * s2y) / Math.max(1e-6, detOls);
  const b2Ols = (-s12 * s1y + s11 * s2y) / Math.max(1e-6, detOls);

  // Regularized solution at normalized penalty strength lambdaNorm in [0, 1]
  let b1 = b1Ols;
  let b2 = b2Ols;

  if (lambdaNorm > 1e-4) {
    if (penalty === "ridge") {
      // Closed-form Ridge: (X^T X + lambda * I) b = X^T y
      const lam = lambdaNorm * 1.4 * Math.max(s11, s22);
      const a11 = s11 + lam;
      const a22 = s22 + lam;
      const detR = a11 * a22 - s12 * s12;
      b1 = (a22 * s1y - s12 * s2y) / Math.max(1e-6, detR);
      b2 = (-s12 * s1y + a11 * s2y) / Math.max(1e-6, detR);
    } else {
      // Exact coordinate descent for 2-feature Lasso: min 0.5 ||y - Xb||^2 + lam * (|b1| + |b2|)
      const lamMax = Math.max(Math.abs(s1y), Math.abs(s2y));
      const lam = lambdaNorm * lamMax * 0.98;
      const soft = (z: number, g: number) =>
        z > g ? z - g : z < -g ? z + g : 0;
      for (let iter = 0; iter < 80; iter++) {
        b1 = soft(s1y - s12 * b2, lam) / Math.max(1e-6, s11);
        b2 = soft(s2y - s12 * b1, lam) / Math.max(1e-6, s22);
      }
    }
  }

  const interceptOls = meanY - b1Ols * meanX1 - b2Ols * meanX2;
  const intercept = meanY - b1 * meanX1 - b2 * meanX2;

  const rssAt = (w0: number, w1: number, w2: number) =>
    samples.reduce((acc, d) => {
      const err = d.y - (w0 + w1 * d.x1 + w2 * d.x2);
      return acc + err * err;
    }, 0);

  const rssOls = rssAt(interceptOls, b1Ols, b2Ols);
  const rssActive = rssAt(intercept, b1, b2);
  const trainR2 = syy > 1e-8 ? Math.max(0, 1 - rssActive / syy) : 0;

  return {
    meanX1,
    meanX2,
    meanY,
    s11,
    s22,
    s12,
    syy,
    b1Ols,
    b2Ols,
    b1,
    b2,
    intercept,
    rssOls,
    rssActive,
    trainR2,
  };
}

function fmt(n: number, digits = 2): string {
  return (Math.abs(n) < 1e-4 ? 0 : n).toFixed(digits);
}

/**
 * S.6.2 — 3D Multiple Regression Plane (ThreeOrbitViewport) synchronized
 * with 2D (β₁, β₂) Ridge L₂ Circle vs. Lasso L₁ Diamond Constraint Geometry.
 */
export function MultipleRegression3DRegularizationLab() {
  const [penalty, setPenalty] = useState<PenaltyMode>("lasso");
  const [lambdaStrength, setLambdaStrength] = useState<number>(0.36);
  const [collinearity, setCollinearity] = useState<number>(0.82);

  // Deterministic training + held-out test split with tunable feature correlation
  const { trainData, testData } = useMemo(() => {
    const rng = createSeededRng(20260602);
    const makeDataset = (count: number): Sample3D[] =>
      Array.from({ length: count }, () => {
        const z1 = sampleNormal(rng, 0, 1);
        const z2 = sampleNormal(rng, 0, 1);
        const x1 = Math.max(-1.6, Math.min(1.6, z1 * 0.72));
        const x2 = Math.max(
          -1.6,
          Math.min(
            1.6,
            (collinearity * z1 +
              Math.sqrt(Math.max(0.02, 1 - collinearity * collinearity)) * z2) *
              0.72
          )
        );
        // True signal relies strongly on x1 and mildly/spuriously on x2
        const y = 0.2 + 1.15 * x1 + 0.35 * x2 + sampleNormal(rng, 0, 0.36);
        return { x1, x2, y };
      });
    return {
      trainData: makeDataset(24),
      testData: makeDataset(16),
    };
  }, [collinearity]);

  const model = useMemo(
    () => solve2x2OlsAndPenalty(trainData, penalty, lambdaStrength),
    [trainData, penalty, lambdaStrength]
  );

  // Held-out Test R²
  const testR2 = useMemo(() => {
    const yMean =
      testData.reduce((s, d) => s + d.y, 0) / testData.length;
    let sse = 0;
    let sst = 0;
    for (const d of testData) {
      const pred = model.intercept + model.b1 * d.x1 + model.b2 * d.x2;
      sse += (d.y - pred) ** 2;
      sst += (d.y - yMean) ** 2;
    }
    return sst > 1e-8 ? Math.max(-1, 1 - sse / sst) : 0;
  }, [testData, model]);

  // 3D Scene Builder
  const onBuildScene = useCallback(
    (dynamicGroup: THREE.Group) => {
      // Fitted 3D regression plane mesh over [-1.6, 1.6]^2
      const segs = 12;
      const span = 1.6;
      const positions: number[] = [];
      const indices: number[] = [];

      for (let ix = 0; ix <= segs; ix++) {
        const x1 = -span + (2 * span * ix) / segs;
        for (let iy = 0; iy <= segs; iy++) {
          const x2 = -span + (2 * span * iy) / segs;
          const yHat = model.intercept + model.b1 * x1 + model.b2 * x2;
          const p = mathToThreeVec3(x1, x2, Math.max(-2.4, Math.min(2.6, yHat)));
          positions.push(p.x, p.y, p.z);
        }
      }

      for (let ix = 0; ix < segs; ix++) {
        for (let iy = 0; iy < segs; iy++) {
          const a = ix * (segs + 1) + iy;
          const b = (ix + 1) * (segs + 1) + iy;
          const c = (ix + 1) * (segs + 1) + (iy + 1);
          const d = ix * (segs + 1) + (iy + 1);
          indices.push(a, b, c, a, c, d);
        }
      }

      const planeGeo = new THREE.BufferGeometry();
      planeGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      planeGeo.setIndex(indices);
      planeGeo.computeVertexNormals();

      const planeMat = new THREE.MeshBasicMaterial({
        color: 0x029091,
        transparent: true,
        opacity: 0.36,
        side: THREE.DoubleSide,
      });
      dynamicGroup.add(new THREE.Mesh(planeGeo, planeMat));

      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x8d9fce,
        wireframe: true,
        transparent: true,
        opacity: 0.38,
      });
      dynamicGroup.add(new THREE.Mesh(planeGeo.clone(), wireMat));

      // Data points + residual vertical drop-lines
      const sphereGeo = new THREE.SphereGeometry(0.055, 14, 14);
      const posMat = new THREE.MeshBasicMaterial({ color: 0x96b898 });
      const negMat = new THREE.MeshBasicMaterial({ color: 0xd5658b });
      const dropVerts: number[] = [];

      for (const pt of trainData) {
        const yHat = model.intercept + model.b1 * pt.x1 + model.b2 * pt.x2;
        const pData = mathToThreeVec3(pt.x1, pt.x2, pt.y);
        const pPlane = mathToThreeVec3(pt.x1, pt.x2, yHat);

        const dot = new THREE.Mesh(
          sphereGeo,
          pt.y >= yHat ? posMat : negMat
        );
        dot.position.copy(pData);
        dynamicGroup.add(dot);

        dropVerts.push(pData.x, pData.y, pData.z, pPlane.x, pPlane.y, pPlane.z);
      }

      const dropGeo = new THREE.BufferGeometry();
      dropGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(dropVerts, 3)
      );
      const dropMat = new THREE.LineBasicMaterial({
        color: 0xd35323,
        transparent: true,
        opacity: 0.85,
      });
      dynamicGroup.add(new THREE.LineSegments(dropGeo, dropMat));
    },
    [model, trainData]
  );

  // 2D Coefficient-Space Regularization Geometry SVG
  const cW = 360;
  const cH = 330;
  const bLim = Math.max(
    1.8,
    Math.abs(model.b1Ols) * 1.35,
    Math.abs(model.b2Ols) * 1.35
  );
  const toCx = (b1: number) => 36 + ((b1 + bLim) / (2 * bLim)) * (cW - 56);
  const toCy = (b2: number) => cH - 36 - ((b2 + bLim) / (2 * bLim)) * (cH - 58);

  // Build RSS contour ellipses around (b1Ols, b2Ols)
  const contourPaths = useMemo(() => {
    const db1 = model.b1 - model.b1Ols;
    const db2 = model.b2 - model.b2Ols;
    const activeQuad =
      model.s11 * db1 * db1 + 2 * model.s12 * db1 * db2 + model.s22 * db2 * db2;

    // Matrix M = [[s11, s12], [s12, s22]] eigen-decomposition for exact ellipse axes
    const tr = model.s11 + model.s22;
    const disc = Math.sqrt(Math.max(0, (model.s11 - model.s22) ** 2 + 4 * model.s12 ** 2));
    const eig1 = Math.max(1e-4, 0.5 * (tr + disc));
    const eig2 = Math.max(1e-4, 0.5 * (tr - disc));
    const angle = 0.5 * Math.atan2(2 * model.s12, model.s11 - model.s22);

    const levels = [0.35, 0.8, 1.4];
    if (activeQuad > 1e-4) {
      levels.push(activeQuad);
    }

    return levels.map((cVal, idx) => {
      const a = Math.sqrt(cVal / eig1);
      const b = Math.sqrt(cVal / eig2);
      const pts: string[] = [];
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      for (let k = 0; k <= 64; k++) {
        const th = (k / 64) * Math.PI * 2;
        const u = a * Math.cos(th);
        const v = b * Math.sin(th);
        const wb1 = model.b1Ols + u * cosA - v * sinA;
        const wb2 = model.b2Ols + u * sinA + v * cosA;
        pts.push(
          `${k === 0 ? "M" : "L"}${toCx(wb1).toFixed(1)},${toCy(wb2).toFixed(1)}`
        );
      }
      return {
        d: `${pts.join(" ")} Z`,
        isTangent: idx === 3 && activeQuad > 1e-4,
      };
    });
  }, [model, cW, cH, bLim]);

  const l1Radius = Math.abs(model.b1) + Math.abs(model.b2);
  const l2Radius = Math.hypot(model.b1, model.b2);
  const isSparseZero = Math.abs(model.b1) < 1e-3 || Math.abs(model.b2) < 1e-3;

  return (
    <div className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4 sm:p-5 space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div className="space-y-0.5">
          <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--math-ink-sweep)] font-semibold block">
            3D Multiple Regression Plane &amp; Ridge vs. Lasso Constraint Geometry
          </span>
          <p className="text-xs font-math-serif text-[var(--text-secondary)]">
            Increase penalty λ to watch the constraint boundary shrink—and notice when RSS ellipses kiss a sharp Lasso corner!
          </p>
        </div>

        <div className="inline-flex border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
          {(["lasso", "ridge"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPenalty(m)}
              className={`px-3 py-1.5 text-xs font-tabular-mono transition-colors ${
                penalty === m
                  ? "bg-[var(--accent-primary)] text-[var(--bg-canvas)] font-semibold"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              {m === "lasso" ? "Lasso L₁ (Diamond)" : "Ridge L₂ (Circle)"}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex justify-between text-xs font-tabular-mono tabular-nums">
            <span className="text-[var(--math-ink-sweep)] font-semibold">
              Regularization Strength λ (0 = Pure OLS)
            </span>
            <strong>{lambdaStrength.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min={0}
            max={0.95}
            step={0.02}
            value={lambdaStrength}
            onChange={(e) => setLambdaStrength(Number(e.target.value))}
            aria-label="Regularization strength lambda"
            className="w-full accent-[#D35323] cursor-pointer"
          />
        </label>

        <label className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5 block">
          <div className="flex justify-between text-xs font-tabular-mono tabular-nums">
            <span className="text-[var(--math-ink-x)] font-semibold">
              Predictor Collinearity r(x₁, x₂)
            </span>
            <strong>{collinearity.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min={0}
            max={0.95}
            step={0.05}
            value={collinearity}
            onChange={(e) => setCollinearity(Number(e.target.value))}
            aria-label="Predictor correlation collinearity"
            className="w-full accent-[#8D9FCE] cursor-pointer"
          />
        </label>
      </div>

      {/* Dual Stage: 3D Plane + 2D Regularization Contours */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-7">
          <ThreeOrbitViewport
            heightClassName="h-[340px] sm:h-[380px]"
            cameraPosition={[3.2, 2.5, 3.3]}
            cameraTarget={[0, 0.2, 0]}
            axesOptions={{
              axisLength: 1.85,
              gridExtent: 3.2,
              gridDivisions: 8,
            }}
            titleBadge="3D Multiple Regression Plane (ŷ = β₀ + β₁x₁ + β₂x₂)"
            onBuildScene={onBuildScene}
            sceneDeps={[model, trainData]}
            footerSlot={
              <div className="flex flex-wrap justify-between gap-2 text-[11px] font-tabular-mono tabular-nums">
                <span>
                  Plane: ŷ = {fmt(model.intercept)} + {fmt(model.b1)}x₁ + {fmt(model.b2)}x₂
                </span>
                <span className="text-[#96B898]">
                  Train R² = {(model.trainR2 * 100).toFixed(1)}% | Test CV R² ={" "}
                  {(testR2 * 100).toFixed(1)}%
                </span>
              </div>
            }
          />
        </div>

        <div className="xl:col-span-5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[11px] font-tabular-mono">
            <span className="uppercase tracking-wider text-[var(--text-muted)]">
              Parameter Space (β₁, β₂) Contours
            </span>
            {isSparseZero && penalty === "lasso" ? (
              <span className="px-2 py-0.5 border border-[#029091] bg-[#029091]/15 text-[var(--math-ink-z)] font-semibold">
                Corner Hit! Exact Zero Weight
              </span>
            ) : (
              <span className="text-[var(--math-ink-y)] tabular-nums">
                {penalty === "lasso" ? `L₁=${fmt(l1Radius)}` : `L₂=${fmt(l2Radius)}`}
              </span>
            )}
          </div>

          <svg
            viewBox={`0 0 ${cW} ${cH}`}
            className="w-full h-auto block"
            role="img"
            aria-label={`Parameter space plot showing RSS contour ellipses meeting ${penalty} constraint region`}
          >
            {/* Axes beta_1 = 0, beta_2 = 0 */}
            <line
              x1={36}
              x2={cW - 20}
              y1={toCy(0)}
              y2={toCy(0)}
              stroke="var(--border-strong)"
              strokeWidth={1}
            />
            <line
              x1={toCx(0)}
              x2={toCx(0)}
              y1={22}
              y2={cH - 36}
              stroke="var(--border-strong)"
              strokeWidth={1}
            />
            <text
              x={cW - 18}
              y={toCy(0) - 5}
              textAnchor="end"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              fill="var(--text-muted)"
            >
              β₁
            </text>
            <text
              x={toCx(0) + 6}
              y={26}
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              fill="var(--text-muted)"
            >
              β₂
            </text>

            {/* Constraint Region: L1 Diamond vs L2 Circle */}
            {penalty === "lasso" ? (
              <polygon
                points={`${toCx(l1Radius)},${toCy(0)} ${toCx(0)},${toCy(
                  l1Radius
                )} ${toCx(-l1Radius)},${toCy(0)} ${toCx(0)},${toCy(-l1Radius)}`}
                fill="#029091"
                fillOpacity={0.22}
                stroke="#029091"
                strokeWidth={2}
              />
            ) : (
              <ellipse
                cx={toCx(0)}
                cy={toCy(0)}
                rx={Math.abs(toCx(l2Radius) - toCx(0))}
                ry={Math.abs(toCy(0) - toCy(l2Radius))}
                fill="#8D9FCE"
                fillOpacity={0.22}
                stroke="#8D9FCE"
                strokeWidth={2}
              />
            )}

            {/* RSS Ellipses */}
            {contourPaths.map((c, idx) => (
              <path
                key={idx}
                d={c.d}
                fill="none"
                stroke={c.isTangent ? "#D35323" : "#B95869"}
                strokeWidth={c.isTangent ? 2 : 1.1}
                strokeDasharray={c.isTangent ? undefined : "4 3"}
                strokeOpacity={c.isTangent ? 0.95 : 0.48}
              />
            ))}

            {/* OLS Center Point */}
            <circle
              cx={toCx(model.b1Ols)}
              cy={toCy(model.b2Ols)}
              r={4.5}
              fill="#B95869"
            />
            <text
              x={toCx(model.b1Ols) + 7}
              y={toCy(model.b2Ols) - 5}
              fontSize={9.5}
              fontFamily="JetBrains Mono, monospace"
              fill="#B95869"
            >
              OLS ({fmt(model.b1Ols, 2)}, {fmt(model.b2Ols, 2)})
            </text>

            {/* Penalized Solution */}
            <circle
              cx={toCx(model.b1)}
              cy={toCy(model.b2)}
              r={5.5}
              fill="#D35323"
              stroke="#FFFBE4"
              strokeWidth={1.4}
            />
          </svg>

          <div className="grid grid-cols-2 gap-2 text-xs font-tabular-mono tabular-nums">
            <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              <span className="block text-[10px] text-[var(--text-muted)]">
                Active Slope β₁
              </span>
              <strong>{fmt(model.b1, 3)}</strong>{" "}
              <span className="text-[10px] text-[var(--text-muted)]">
                (OLS {fmt(model.b1Ols, 2)})
              </span>
            </div>
            <div className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
              <span className="block text-[10px] text-[var(--text-muted)]">
                Active Slope β₂
              </span>
              <strong
                className={
                  Math.abs(model.b2) < 1e-3
                    ? "text-[var(--math-ink-z)]"
                    : ""
                }
              >
                {fmt(model.b2, 3)}
              </strong>{" "}
              <span className="text-[10px] text-[var(--text-muted)]">
                (OLS {fmt(model.b2Ols, 2)})
              </span>
            </div>
          </div>

          <p className="text-xs font-math-serif text-[var(--text-secondary)] leading-relaxed">
            Crank <strong>Collinearity</strong> to <code className="font-tabular-mono">0.90</code>: the
            OLS ellipse stretches diagonally! <KaTeXMath math="\text{Lasso } L_1" /> snaps <KaTeXMath math="\beta_2 \to 0" /> cleanly at its diamond corner, while <KaTeXMath math="\text{Ridge } L_2" /> splits weight smoothly across both features.
          </p>
        </div>
      </div>
    </div>
  );
}
