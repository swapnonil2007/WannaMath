"use client";

import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Route, ShieldCheck, AlertTriangle } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  createVectorArrow3D,
  mathToThreeVec3,
  integrate1DGaussLegendre,
} from "@/components/visualizations/primitives";

interface LineFieldPreset {
  id: string;
  name: string;
  isConservative: boolean;
  pExpr: string;
  qExpr: string;
  potentialExpr: string;
  potentialLatex: string;
  note: string;
}

const LINE_FIELD_PRESETS: LineFieldPreset[] = [
  {
    id: "conservative-gradient",
    name: "Conservative Gradient Field: F = ⟨2xy, x² + cos(y)⟩",
    isConservative: true,
    pExpr: "2 * x * y",
    qExpr: "x^2 + cos(y)",
    potentialExpr: "x^2 * y + sin(y)",
    potentialLatex: "f(x,y) = x^2 y + \\sin(y) \\implies \\mathbf{F} = \\nabla f",
    note: "Because ∂Q/∂x = 2x = ∂P/∂y everywhere, F is conservative! Deforming the path between A and B leaves the total work W = f(B) - f(A) completely unchanged.",
  },
  {
    id: "nonconservative-vortex",
    name: "Non-Conservative Vortex: F = ⟨-y, x⟩",
    isConservative: false,
    pExpr: "-y",
    qExpr: "x",
    potentialExpr: "0",
    potentialLatex: "\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = 1 - (-1) = 2 \\neq 0",
    note: "Work depends strongly on the chosen path! Bending the arc outward sweeps more circulation, proving no scalar potential f(x,y) exists.",
  },
  {
    id: "quadratic-potential",
    name: "Harmonic Potential: F = ⟨x, -y⟩",
    isConservative: true,
    pExpr: "x",
    qExpr: "-y",
    potentialExpr: "0.5 * (x^2 - y^2)",
    potentialLatex: "f(x,y) = \\frac{1}{2}(x^2 - y^2) \\implies \\mathbf{F} = \\nabla f",
    note: "A saddle potential field. Every path from A(-1.2, -0.8) to B(1.2, 0.9) yields the exact same work f(B) - f(A).",
  },
  {
    id: "coupled-nonconservative",
    name: "Non-Conservative Shear: F = ⟨y², 2x⟩",
    isConservative: false,
    pExpr: "y^2",
    qExpr: "2 * x",
    potentialExpr: "0",
    potentialLatex: "\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = 2 - 2y \\neq 0",
    note: "Drag the midpoint path-bulge slider b to watch the accumulated work W change continuously between the two curves.",
  },
];

export function LineIntegralWorkLab() {
  const [presetId, setPresetId] = useState<string>("conservative-gradient");
  const [pExpr, setPExpr] = useState<string>(LINE_FIELD_PRESETS[0].pExpr);
  const [qExpr, setQExpr] = useState<string>(LINE_FIELD_PRESETS[0].qExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [pathBend, setPathBend] = useState<number>(0.65);
  const [particleT, setParticleT] = useState<number>(0.55);

  const activePreset = useMemo(
    () =>
      LINE_FIELD_PRESETS.find((p) => p.id === presetId) ??
      LINE_FIELD_PRESETS[0],
    [presetId]
  );

  const compiledP = useMemo(
    () => compileMathExpression(pExpr, ["x", "y"]),
    [pExpr]
  );
  const compiledQ = useMemo(
    () => compileMathExpression(qExpr, ["x", "y"]),
    [qExpr]
  );
  const compiledPotential = useMemo(
    () => compileMathExpression(activePreset.potentialExpr, ["x", "y"]),
    [activePreset.potentialExpr]
  );

  const handleSelectPreset = (p: LineFieldPreset) => {
    setPresetId(p.id);
    setPExpr(p.pExpr);
    setQExpr(p.qExpr);
    setIsCustom(false);
  };

  // Fixed endpoints A(-1.2, -0.8) -> B(1.2, 0.9)
  const A: [number, number] = [-1.2, -0.8];
  const B: [number, number] = [1.2, 0.9];

  // Parameterized quadratic Bezier-like path r(t) = (1-t)A + tB + bend * 4t(1-t) * n_perp
  const evalPath = useMemo(() => {
    const dx = B[0] - A[0];
    const dy = B[1] - A[1];
    const chordLen = Math.hypot(dx, dy);
    const nx = -dy / chordLen;
    const ny = dx / chordLen;

    return (t: number, bendVal: number): { x: number; y: number; dx: number; dy: number } => {
      const arch = 4 * t * (1 - t) * bendVal;
      const dArch = 4 * (1 - 2 * t) * bendVal;
      return {
        x: (1 - t) * A[0] + t * B[0] + arch * nx,
        y: (1 - t) * A[1] + t * B[1] + arch * ny,
        dx: dx + dArch * nx,
        dy: dy + dArch * ny,
      };
    };
  }, []);

  // Compute work along Bent Path C_1 AND Straight Path C_0, plus curl test
  const workAnalysis = useMemo(() => {
    const integrand = (t: number, bendVal: number) => {
      const pt = evalPath(t, bendVal);
      const px = compiledP.evaluate({ x: pt.x, y: pt.y });
      const qy = compiledQ.evaluate({ x: pt.x, y: pt.y });
      return px * pt.dx + qy * pt.dy;
    };

    const workBent = integrate1DGaussLegendre(
      (t) => integrand(t, pathBend),
      0,
      1,
      16
    );
    const workStraight = integrate1DGaussLegendre(
      (t) => integrand(t, 0),
      0,
      1,
      16
    );
    const workUpToT = integrate1DGaussLegendre(
      (t) => integrand(t, pathBend),
      0,
      Math.max(1e-4, particleT),
      12
    );

    const cur = evalPath(particleT, pathBend);
    const fx = compiledP.evaluate({ x: cur.x, y: cur.y });
    const fy = compiledQ.evaluate({ x: cur.x, y: cur.y });
    const speed = Math.hypot(cur.dx, cur.dy) || 1;
    const tx = cur.dx / speed;
    const ty = cur.dy / speed;
    const tangentialForce = fx * tx + fy * ty;

    // Sample path points for SVG & 3D
    const pathPtsBent: [number, number][] = [];
    const pathPtsStraight: [number, number][] = [];
    const N = 60;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const p1 = evalPath(t, pathBend);
      const p0 = evalPath(t, 0);
      pathPtsBent.push([p1.x, p1.y]);
      pathPtsStraight.push([p0.x, p0.y]);
    }

    // Numerical curl check over domain
    let maxCurl = 0;
    const h = 1e-4;
    for (let x = -1.2; x <= 1.2; x += 0.6) {
      for (let y = -1.2; y <= 1.2; y += 0.6) {
        const dQdx =
          (compiledQ.evaluate({ x: x + h, y }) -
            compiledQ.evaluate({ x: x - h, y })) /
          (2 * h);
        const dPdy =
          (compiledP.evaluate({ x, y: y + h }) -
            compiledP.evaluate({ x, y: y - h })) /
          (2 * h);
        maxCurl = Math.max(maxCurl, Math.abs(dQdx - dPdy));
      }
    }

    const potDiff = !isCustom && activePreset.isConservative
      ? compiledPotential.evaluate({ x: B[0], y: B[1] }) -
        compiledPotential.evaluate({ x: A[0], y: A[1] })
      : null;

    return {
      workBent,
      workStraight,
      workUpToT,
      cur,
      fx,
      fy,
      tx,
      ty,
      tangentialForce,
      pathPtsBent,
      pathPtsStraight,
      isNumericallyConservative: maxCurl < 1e-3,
      potDiff,
    };
  }, [
    evalPath,
    compiledP,
    compiledQ,
    compiledPotential,
    pathBend,
    particleT,
    isCustom,
    activePreset.isConservative,
  ]);

  const fieldArrows = useMemo(() => {
    const arr: { x: number; y: number; dx: number; dy: number }[] = [];
    for (let x = -1.8; x <= 1.81; x += 0.6) {
      for (let y = -1.8; y <= 1.81; y += 0.6) {
        const px = compiledP.evaluate({ x, y });
        const qy = compiledQ.evaluate({ x, y });
        const mag = Math.hypot(px, qy);
        if (!Number.isFinite(mag) || mag < 1e-6) continue;
        const len = Math.min(0.35, 0.14 + 0.09 * mag);
        arr.push({ x, y, dx: (px / mag) * len, dy: (qy / mag) * len });
      }
    }
    return arr;
  }, [compiledP, compiledQ]);

  return (
    <section
      aria-label="Line Integrals, Work and Conservative Fields Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-x)] text-[var(--math-ink-x)] bg-[var(--bg-canvas)]">
              LAB 3.3.4 • LINE INTEGRAL WORK &amp; PATH INDEPENDENCE
            </span>
            <span
              className={`px-2 py-0.5 text-[11px] font-tabular-mono border inline-flex items-center gap-1 ${
                workAnalysis.isNumericallyConservative
                  ? "border-[var(--math-ink-y)] text-[var(--math-ink-y)] bg-[#96B898]/10"
                  : "border-[var(--math-ink-sweep)] text-[var(--math-ink-sweep)] bg-[#D35323]/10"
              }`}
            >
              {workAnalysis.isNumericallyConservative ? (
                <>
                  <ShieldCheck className="w-3 h-3" /> Conservative (Path-Independent)
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" /> Non-Conservative (Path-Dependent)
                </>
              )}
            </span>
          </div>
          <h2 className="font-math-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Tangential Work Accumulation <KaTeXMath math="W = \int_C \mathbf{F} \cdot d\mathbf{r}" />
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {LINE_FIELD_PRESETS.map((p) => {
            const active = !isCustom && p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 text-xs font-tabular-mono border transition-colors ${
                  active
                    ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/15 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                {p.name.split(":")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Field Inputs */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-canvas)] grid grid-cols-1 md:grid-cols-2 gap-4">
        <MathExpressionInput
          label="Force Field P(x, y):"
          prefixLatex="P(x,y) ="
          value={pExpr}
          onChange={(val) => {
            setPExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x", "y"]}
          compact
        />
        <MathExpressionInput
          label="Force Field Q(x, y):"
          prefixLatex="Q(x,y) ="
          value={qExpr}
          onChange={(val) => {
            setQExpr(val);
            setIsCustom(true);
          }}
          allowedVars={["x", "y"]}
          compact
        />
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: 3D Curtain Height = F · T */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-5 space-y-4 bg-[var(--bg-canvas)]">
          <ThreeOrbitViewport
            heightClassName="h-[390px] sm:h-[430px]"
            cameraPosition={[3.2, 2.5, 3.2]}
            cameraTarget={[0, 0.25, 0]}
            titleBadge="3D Work Curtain (Height z = F · T Along Path C)"
            footerSlot={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
                <span className="text-[var(--math-ink-sweep)] font-semibold">
                  Bent Path W(C₁) = {workAnalysis.workBent.toFixed(4)}
                </span>
                <span className="text-[var(--math-ink-x)]">
                  Straight Path W(C₀) = {workAnalysis.workStraight.toFixed(4)}
                </span>
                <span className="text-[var(--math-ink-diff)]">
                  ΔW = {Math.abs(workAnalysis.workBent - workAnalysis.workStraight).toFixed(4)}
                </span>
              </div>
            }
            sceneDeps={[compiledP, compiledQ, pathBend, particleT, workAnalysis]}
            onBuildScene={(group) => {
              // 1. Floor vector field arrows
              for (const a of fieldArrows) {
                group.add(
                  createVectorArrow3D(
                    [a.x, a.y, 0.01],
                    [a.dx, a.dy, 0],
                    Math.hypot(a.dx, a.dy),
                    0x8d9fce
                  )
                );
              }

              // 2. Work Curtain along bent path (height = 0.35 * F · T)
              const curtainVerts: THREE.Vector3[] = [];
              const basePts: THREE.Vector3[] = [];
              const topPts: THREE.Vector3[] = [];
              const N = 64;

              for (let i = 0; i <= N; i++) {
                const t = i / N;
                const pt = evalPath(t, pathBend);
                const fx = compiledP.evaluate({ x: pt.x, y: pt.y });
                const fy = compiledQ.evaluate({ x: pt.x, y: pt.y });
                const spd = Math.hypot(pt.dx, pt.dy) || 1;
                const fDotT = (fx * pt.dx + fy * pt.dy) / spd;
                const hVis = Math.max(-1.8, Math.min(1.8, fDotT * 0.35));

                basePts.push(mathToThreeVec3(pt.x, pt.y, 0.01));
                topPts.push(mathToThreeVec3(pt.x, pt.y, hVis));
              }

              for (let i = 0; i < N; i++) {
                curtainVerts.push(
                  basePts[i],
                  basePts[i + 1],
                  topPts[i + 1],
                  basePts[i],
                  topPts[i + 1],
                  topPts[i]
                );
              }

              const cGeom = new THREE.BufferGeometry().setFromPoints(curtainVerts);
              cGeom.computeVertexNormals();
              group.add(
                new THREE.Mesh(
                  cGeom,
                  new THREE.MeshBasicMaterial({
                    color: 0x029091,
                    transparent: true,
                    opacity: 0.36,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                  })
                )
              );

              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(basePts),
                  new THREE.LineBasicMaterial({ color: 0xd35323 })
                )
              );
              group.add(
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(topPts),
                  new THREE.LineBasicMaterial({ color: 0xfbeaa4 })
                )
              );

              // 3. Active particle + F & T vectors
              const { cur, fx, fy, tx, ty } = workAnalysis;
              const marker = new THREE.Mesh(
                new THREE.SphereGeometry(0.065, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xfbeaa4 })
              );
              marker.position.copy(mathToThreeVec3(cur.x, cur.y, 0.02));
              group.add(marker);

              group.add(
                createVectorArrow3D([cur.x, cur.y, 0.03], [tx, ty, 0], 0.55, 0x96b898)
              );
              const fMag = Math.hypot(fx, fy);
              if (fMag > 1e-5) {
                group.add(
                  createVectorArrow3D(
                    [cur.x, cur.y, 0.03],
                    [fx, fy, 0],
                    Math.min(0.85, 0.35 + 0.2 * fMag),
                    0xd35323
                  )
                );
              }
            }}
          />

          {/* Symbolic Formulation */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
                LINE INTEGRAL &amp; FUNDAMENTAL THEOREM CHECK
              </span>
              {workAnalysis.potDiff !== null && (
                <span className="text-xs font-tabular-mono text-[var(--math-ink-y)]">
                  f(B) - f(A) = {workAnalysis.potDiff.toFixed(4)}
                </span>
              )}
            </div>
            <div className="overflow-x-auto py-1">
              <KaTeXMath
                math={`\\int_{C_1} \\mathbf{F}\\cdot d\\mathbf{r} = \\color{#D35323}{${workAnalysis.workBent.toFixed(4)}}, \\qquad \\int_{C_0} \\mathbf{F}\\cdot d\\mathbf{r} = \\color{#8D9FCE}{${workAnalysis.workStraight.toFixed(4)}}`}
                block
              />
            </div>
            <p className="font-math-serif text-sm text-[var(--text-secondary)]">
              {isCustom
                ? "Deform the path bulge slider to compare work along the curved path C₁ against the straight chord C₀."
                : activePreset.note}
            </p>
          </div>
        </div>

        {/* Right: 2D Path Deformer & Controls */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-[var(--bg-panel)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-[var(--math-ink-sweep)]" />
                2D Path Deformation C₁ vs. Straight C₀
              </span>
              <span className="text-xs font-tabular-mono text-[var(--math-ink-y)]">
                F · T = {workAnalysis.tangentialForce.toFixed(3)}
              </span>
            </div>

            <SvgCoordinatePlane2D
              xRange={[-2, 2]}
              yRange={[-2, 2]}
              height={275}
              ariaLabel="2D Line Integral Path Deformation and Tangent Projection Diagram"
            >
              {({ toSvgX, toSvgY }) => {
                const bentD = workAnalysis.pathPtsBent
                  .map(
                    ([px, py], idx) =>
                      `${idx === 0 ? "M" : "L"} ${toSvgX(px).toFixed(1)} ${toSvgY(py).toFixed(1)}`
                  )
                  .join(" ");
                const straightD = workAnalysis.pathPtsStraight
                  .map(
                    ([px, py], idx) =>
                      `${idx === 0 ? "M" : "L"} ${toSvgX(px).toFixed(1)} ${toSvgY(py).toFixed(1)}`
                  )
                  .join(" ");

                const { cur, tx, ty, fx, fy } = workAnalysis;
                const fMag = Math.hypot(fx, fy) || 1;
                const fLen = Math.min(0.75, 0.3 + 0.18 * fMag);

                return (
                  <g>
                    {fieldArrows.map((a, idx) => (
                      <line
                        key={idx}
                        x1={toSvgX(a.x)}
                        y1={toSvgY(a.y)}
                        x2={toSvgX(a.x + a.dx)}
                        y2={toSvgY(a.y + a.dy)}
                        stroke="#8D9FCE"
                        strokeWidth="1.2"
                        opacity="0.55"
                      />
                    ))}

                    <path
                      d={straightD}
                      fill="none"
                      stroke="#8D9FCE"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                    <path
                      d={bentD}
                      fill="none"
                      stroke="#D35323"
                      strokeWidth="2.8"
                    />

                    {/* Tangent T (#96B898) and Field F (#FBEAA4) at particle */}
                    <line
                      x1={toSvgX(cur.x)}
                      y1={toSvgY(cur.y)}
                      x2={toSvgX(cur.x + tx * 0.55)}
                      y2={toSvgY(cur.y + ty * 0.55)}
                      stroke="#96B898"
                      strokeWidth="2.6"
                    />
                    <line
                      x1={toSvgX(cur.x)}
                      y1={toSvgY(cur.y)}
                      x2={toSvgX(cur.x + (fx / fMag) * fLen)}
                      y2={toSvgY(cur.y + (fy / fMag) * fLen)}
                      stroke="#FBEAA4"
                      strokeWidth="2.6"
                    />

                    {/* Endpoints A, B and Particle */}
                    <circle cx={toSvgX(A[0])} cy={toSvgY(A[1])} r="5" fill="#96B898" />
                    <circle cx={toSvgX(B[0])} cy={toSvgY(B[1])} r="5" fill="#B95869" />
                    <circle
                      cx={toSvgX(cur.x)}
                      cy={toSvgY(cur.y)}
                      r="5.5"
                      fill="#FBEAA4"
                      stroke="#1E1F22"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              }}
            </SvgCoordinatePlane2D>
          </div>

          {/* Sliders */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-sweep)]">
                <span>Path Deformation Bulge b</span>
                <span>b = {pathBend.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={-1.1}
                max={1.1}
                step={0.05}
                value={pathBend}
                onChange={(e) => setPathBend(parseFloat(e.target.value))}
                className="w-full accent-[#D35323]"
                aria-label="Path deformation bulge b"
              />
            </div>

            <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-diff)]">
                <span>Particle Position t ∈ [0, 1]</span>
                <span>t = {particleT.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={particleT}
                onChange={(e) => setParticleT(parseFloat(e.target.value))}
                className="w-full accent-[#FBEAA4]"
                aria-label="Particle position t"
              />
            </div>
          </div>

          {/* Readouts */}
          <div className="grid grid-cols-3 gap-2 text-xs font-tabular-mono">
            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <span className="text-[var(--math-ink-diff)] block text-[10px]">
                PARTIAL WORK [0,t]
              </span>
              <span className="text-[var(--text-primary)] font-semibold">
                {workAnalysis.workUpToT.toFixed(3)}
              </span>
            </div>
            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <span className="text-[var(--math-ink-sweep)] block text-[10px]">
                TOTAL W(C₁)
              </span>
              <span className="text-[var(--text-primary)] font-semibold">
                {workAnalysis.workBent.toFixed(3)}
              </span>
            </div>
            <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <span className="text-[var(--math-ink-x)] block text-[10px]">
                CHORD W(C₀)
              </span>
              <span className="text-[var(--text-primary)] font-semibold">
                {workAnalysis.workStraight.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
