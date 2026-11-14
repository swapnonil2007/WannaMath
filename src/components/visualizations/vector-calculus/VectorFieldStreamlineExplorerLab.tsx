"use client";

import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Compass, Sparkles, SlidersHorizontal, Eye } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  SvgCoordinatePlane2D,
  createVectorArrow3D,
  computePartialDerivatives2D,
  extractLevelCurveSegments,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

interface VectorFieldPreset {
  id: string;
  name: string;
  categoryBadge: string;
  pExpr: string;
  qExpr: string;
  rExpr: string;
  potentialExpr?: string;
  defaultSeed: [number, number];
  formulaLatex: string;
  geometryNote: string;
}

const VF_PRESETS: VectorFieldPreset[] = [
  {
    id: "conservative-potential",
    name: "Conservative Gradient Field: F = ∇(0.4x² - 0.6y² + 0.3sin(2x))",
    categoryBadge: "Conservative (F = ∇φ)",
    pExpr: "0.8 * x + 0.6 * cos(2 * x)",
    qExpr: "-1.2 * y",
    rExpr: "0.2 * z",
    potentialExpr: "0.4 * x^2 - 0.6 * y^2 + 0.3 * sin(2 * x)",
    defaultSeed: [0.45, 0.85],
    formulaLatex:
      "\\mathbf{F} = \\nabla\\phi, \\qquad \\phi(x,y) = 0.4x^2 - 0.6y^2 + 0.3\\sin(2x)",
    geometryNote:
      "Toggle 'Show Potential Contours φ = c' below: every streamline crosses equipotential curves at 90°, and no closed flow loops can exist.",
  },
  {
    id: "free-vortex",
    name: "Irrotational Point Vortex: F = ⟨-y, x⟩ / (x² + y² + 0.15)",
    categoryBadge: "Circular yet Zero Spin Away from 0",
    pExpr: "-y / (x^2 + y^2 + 0.15)",
    qExpr: "x / (x^2 + y^2 + 0.15)",
    rExpr: "0",
    defaultSeed: [1.05, 0.2],
    formulaLatex:
      "\\mathbf{F}(x,y) = \\frac{\\langle -y,\\; x \\rangle}{r^2 + 0.15}",
    geometryNote:
      "Fluid particles travel in circular orbits around the origin, yet outer layers slow down at 1/r—balancing inward curvature so curl vanishes outside the core.",
  },
  {
    id: "dipole-pair",
    name: "Source-Sink Dipole: F = r₊/|r₊|³ - r₋/|r₋|³",
    categoryBadge: "Electrostatic / Potential Flow",
    pExpr:
      "(x + 0.85) / ((x + 0.85)^2 + y^2 + 0.22)^1.5 - (x - 0.85) / ((x - 0.85)^2 + y^2 + 0.22)^1.5",
    qExpr:
      "y / ((x + 0.85)^2 + y^2 + 0.22)^1.5 - y / ((x - 0.85)^2 + y^2 + 0.22)^1.5",
    rExpr: "0",
    potentialExpr:
      "-1 / sqrt((x + 0.85)^2 + y^2 + 0.22) + 1 / sqrt((x - 0.85)^2 + y^2 + 0.22)",
    defaultSeed: [-0.85, 0.45],
    formulaLatex:
      "\\mathbf{F} = \\nabla\\!\\left(-\\frac{1}{\\|\\mathbf{r} - \\mathbf{r}_+\\|} + \\frac{1}{\\|\\mathbf{r} - \\mathbf{r}_-\\|}\\right)",
    geometryNote:
      "Streamlines erupt radially from the source pole (-0.85, 0) and bend smoothly into the sink pole (+0.85, 0), tracing classic dipole field lines.",
  },
  {
    id: "helical-swirl",
    name: "3D Damped Spiral & Updraft: F = ⟨-y - 0.35x, x - 0.35y, 0.55⟩",
    categoryBadge: "3D Helical Sink",
    pExpr: "-y - 0.35 * x",
    qExpr: "x - 0.35 * y",
    rExpr: "0.55",
    defaultSeed: [1.35, 0.7],
    formulaLatex:
      "\\mathbf{F}(x,y,z) = \\langle -y - 0.35x,\\; x - 0.35y,\\; 0.55 \\rangle",
    geometryNote:
      "Notice all three flow signatures simultaneously: inward contraction (∇·F = -0.70), counter-clockwise vorticity ((∇×F)_z = 2), and upward z-drift.",
  },
];

export function VectorFieldStreamlineExplorerLab() {
  const [presetId, setPresetId] = useState<string>("conservative-potential");
  const [pExpr, setPExpr] = useState<string>(VF_PRESETS[0].pExpr);
  const [qExpr, setQExpr] = useState<string>(VF_PRESETS[0].qExpr);
  const [rExpr, setRExpr] = useState<string>(VF_PRESETS[0].rExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [seedPts, setSeedPts] = useState<[number, number][]>([
    VF_PRESETS[0].defaultSeed,
    [-0.95, 0.95],
    [0.95, -0.85],
  ]);
  const [activeProbe, setActiveProbe] = useState<[number, number]>(
    VF_PRESETS[0].defaultSeed
  );
  const [unitArrows, setUnitArrows] = useState<boolean>(false);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [zSlice, setZSlice] = useState<number>(0);

  const activePreset = useMemo(
    () => VF_PRESETS.find((p) => p.id === presetId) ?? VF_PRESETS[0],
    [presetId]
  );

  const compiledP = useMemo(
    () => compileMathExpression(pExpr, ["x", "y", "z"]),
    [pExpr]
  );
  const compiledQ = useMemo(
    () => compileMathExpression(qExpr, ["x", "y", "z"]),
    [qExpr]
  );
  const compiledR = useMemo(
    () => compileMathExpression(rExpr, ["x", "y", "z"]),
    [rExpr]
  );
  const compiledPot = useMemo(
    () =>
      !isCustom && activePreset.potentialExpr
        ? compileMathExpression(activePreset.potentialExpr, ["x", "y"])
        : null,
    [isCustom, activePreset]
  );

  const bounds = { xMin: -2.0, xMax: 2.0, yMin: -2.0, yMax: 2.0 };

  const handleSelectPreset = (p: VectorFieldPreset) => {
    setPresetId(p.id);
    setPExpr(p.pExpr);
    setQExpr(p.qExpr);
    setRExpr(p.rExpr);
    setSeedPts([p.defaultSeed, [-0.95, 0.95], [0.95, -0.85]]);
    setActiveProbe(p.defaultSeed);
    setIsCustom(false);
  };

  // Compute streamlines, grid vectors, potential contours, and Velocity Gradient Matrix DF
  const fieldData = useMemo(() => {
    const evalVec2 = (x: number, y: number): [number, number] => {
      const px = compiledP.evaluate({ x, y, z: zSlice });
      const py = compiledQ.evaluate({ x, y, z: zSlice });
      return [Number.isFinite(px) ? px : 0, Number.isFinite(py) ? py : 0];
    };

    const integrateStreamline = (
      sx: number,
      sy: number,
      dir: 1 | -1,
      steps = 48
    ): [number, number][] => {
      const pts: [number, number][] = [[sx, sy]];
      let cx = sx;
      let cy = sy;
      const dt = 0.055;
      const vel = (x: number, y: number): [number, number] => {
        const [vx, vy] = evalVec2(x, y);
        const m = Math.hypot(vx, vy);
        if (m < 1e-4) return [0, 0];
        const scale = Math.min(1.6, m) / m;
        return [dir * vx * scale, dir * vy * scale];
      };

      for (let i = 0; i < steps; i++) {
        const [k1x, k1y] = vel(cx, cy);
        if (Math.hypot(k1x, k1y) < 1e-4) break;
        const [k2x, k2y] = vel(cx + 0.5 * dt * k1x, cy + 0.5 * dt * k1y);
        const [k3x, k3y] = vel(cx + 0.5 * dt * k2x, cy + 0.5 * dt * k2y);
        const [k4x, k4y] = vel(cx + dt * k3x, cy + dt * k3y);
        cx += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
        cy += (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
        if (Math.abs(cx) > 2.25 || Math.abs(cy) > 2.25) break;
        pts.push([cx, cy]);
      }
      return pts;
    };

    // Sample grid vector arrows
    const arrows: {
      x: number;
      y: number;
      dx: number;
      dy: number;
      mag: number;
    }[] = [];
    const nGrid = 9;
    let maxMag = 0.001;
    for (let i = 0; i <= nGrid; i++) {
      const x = -1.75 + (i / nGrid) * 3.5;
      for (let j = 0; j <= nGrid; j++) {
        const y = -1.75 + (j / nGrid) * 3.5;
        const [vx, vy] = evalVec2(x, y);
        const mag = Math.hypot(vx, vy);
        if (mag > maxMag) maxMag = mag;
        if (mag > 1e-4) {
          const drawLen = unitArrows
            ? 0.24
            : 0.07 + 0.23 * Math.tanh(mag * 0.55);
          arrows.push({
            x,
            y,
            dx: (vx / mag) * drawLen,
            dy: (vy / mag) * drawLen,
            mag,
          });
        }
      }
    }

    // Streamlines for all interactive seed points
    const userStreamlines = seedPts.map(([sx, sy], idx) => ({
      idx,
      seed: [sx, sy] as [number, number],
      fwd: integrateStreamline(sx, sy, 1, 52),
      bwd: integrateStreamline(sx, sy, -1, 36),
    }));

    // Background ambient streamlines for richer topology insight
    const ambientSeeds: [number, number][] = [
      [-1.4, -1.4],
      [1.4, 1.4],
      [-1.4, 1.4],
      [1.4, -1.4],
    ];
    const ambientStreamlines = ambientSeeds.map(([sx, sy]) => ({
      fwd: integrateStreamline(sx, sy, 1, 34),
      bwd: integrateStreamline(sx, sy, -1, 24),
    }));

    // Optional scalar potential contours
    const potContours =
      showContours && compiledPot
        ? [-1.2, -0.6, -0.2, 0.2, 0.6, 1.2].map((lvl) =>
            extractLevelCurveSegments(
              (x, y) => compiledPot.evaluate({ x, y }),
              bounds.xMin,
              bounds.xMax,
              bounds.yMin,
              bounds.yMax,
              lvl,
              32,
              32
            )
          )
        : [];

    // Local Velocity Gradient Matrix DF at activeProbe
    const [px0, py0] = activeProbe;
    const h = 1e-4;
    const fAtProbe: [number, number, number] = [
      compiledP.evaluate({ x: px0, y: py0, z: zSlice }),
      compiledQ.evaluate({ x: px0, y: py0, z: zSlice }),
      compiledR.evaluate({ x: px0, y: py0, z: zSlice }),
    ];
    const dP = computePartialDerivatives2D(
      (x, y) => compiledP.evaluate({ x, y, z: zSlice }),
      px0,
      py0,
      h
    );
    const dQ = computePartialDerivatives2D(
      (x, y) => compiledQ.evaluate({ x, y, z: zSlice }),
      px0,
      py0,
      h
    );
    const dRdz =
      (compiledR.evaluate({ x: px0, y: py0, z: zSlice + h }) -
        compiledR.evaluate({ x: px0, y: py0, z: zSlice - h })) /
      (2 * h);

    const trace2d = dP.fx + dQ.fy;
    const div3d = trace2d + dRdz;
    const curlZ = dQ.fx - dP.fy;
    const shearRate = 0.5 * (dQ.fx + dP.fy);
    const spinRate = 0.5 * curlZ;

    return {
      arrows,
      maxMag,
      userStreamlines,
      ambientStreamlines,
      potContours,
      fAtProbe,
      dP,
      dQ,
      dRdz,
      div3d,
      curlZ,
      shearRate,
      spinRate,
      speed3d: Math.hypot(...fAtProbe),
    };
  }, [
    compiledP,
    compiledQ,
    compiledR,
    compiledPot,
    zSlice,
    unitArrows,
    seedPts,
    showContours,
    activeProbe,
  ]);

  // 3D Vector Field + Active 3D RK4 Streamline in ThreeOrbitViewport
  const build3dScene = useMemo(() => {
    return (sceneGroup: THREE.Group) => {
      const coords = [-1.4, -0.45, 0.45, 1.4];
      const zLayers = [-0.7, 0.7];
      for (const x of coords) {
        for (const y of coords) {
          for (const z of zLayers) {
            const vx = compiledP.evaluate({ x, y, z });
            const vy = compiledQ.evaluate({ x, y, z });
            const vz = compiledR.evaluate({ x, y, z });
            const m = Math.hypot(vx, vy, vz);
            if (Number.isFinite(m) && m > 1e-4) {
              const len = Math.min(0.52, 0.16 + 0.28 * Math.tanh(m * 0.45));
              const isUpper = z > 0;
              sceneGroup.add(
                createVectorArrow3D(
                  [x, y, z],
                  [vx / m, vy / m, vz / m],
                  len,
                  isUpper ? 0x029091 : 0x8d9fce,
                  0.26
                )
              );
            }
          }
        }
      }

      // Trace 3D RK4 streamline starting from activeProbe + zSlice
      const pts3d: THREE.Vector3[] = [];
      let cx = activeProbe[0];
      let cy = activeProbe[1];
      let cz = zSlice;
      const rhs3 = (x: number, y: number, z: number): [number, number, number] => {
        const vx = compiledP.evaluate({ x, y, z });
        const vy = compiledQ.evaluate({ x, y, z });
        const vz = compiledR.evaluate({ x, y, z });
        const m = Math.hypot(vx, vy, vz);
        if (!Number.isFinite(m) || m < 1e-4) return [0, 0, 0];
        const s = Math.min(1.4, m) / m;
        return [vx * s, vy * s, vz * s];
      };
      pts3d.push(mathToThreeVec3(cx, cy, cz));
      const dt = 0.06;
      for (let step = 0; step < 65; step++) {
        const [k1x, k1y, k1z] = rhs3(cx, cy, cz);
        if (Math.hypot(k1x, k1y, k1z) < 1e-4) break;
        const [k2x, k2y, k2z] = rhs3(
          cx + 0.5 * dt * k1x,
          cy + 0.5 * dt * k1y,
          cz + 0.5 * dt * k1z
        );
        const [k3x, k3y, k3z] = rhs3(
          cx + 0.5 * dt * k2x,
          cy + 0.5 * dt * k2y,
          cz + 0.5 * dt * k2z
        );
        const [k4x, k4y, k4z] = rhs3(cx + dt * k3x, cy + dt * k3y, cz + dt * k3z);
        cx += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
        cy += (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
        cz += (dt / 6) * (k1z + 2 * k2z + 2 * k3z + k4z);
        if (Math.abs(cx) > 2.3 || Math.abs(cy) > 2.3 || Math.abs(cz) > 2.0) {
          break;
        }
        pts3d.push(mathToThreeVec3(cx, cy, cz));
      }

      if (pts3d.length > 1) {
        const lineGeom = new THREE.BufferGeometry().setFromPoints(pts3d);
        sceneGroup.add(
          new THREE.Line(
            lineGeom,
            new THREE.LineBasicMaterial({ color: 0xd35323 })
          )
        );
      }

      const seedBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xfbeaa4 })
      );
      seedBall.position.copy(
        mathToThreeVec3(activeProbe[0], activeProbe[1], zSlice)
      );
      sceneGroup.add(seedBall);
    };
  }, [compiledP, compiledQ, compiledR, activeProbe, zSlice]);

  return (
    <section
      id="vector-field-streamlines"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
            Laboratory 3.3.3.2 • Vector Fields, Streamlines &amp; Velocity-Gradient Matrix
          </span>
          <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
            2D/3D Vector Field Anatomy, Integral Curves &amp; Local Matrix Decomposition
          </h2>
          <p className="text-sm font-math-serif text-[var(--text-secondary)]">
            Click the 2D plane to drop tracer seeds and integrate streamlines{" "}
            <KaTeXMath math="\mathbf{r}'(t)=\mathbf{F}(\mathbf{r}(t))" />, compare against
            potential contours, and inspect the Jacobian tensor <KaTeXMath math="D\mathbf{F}" />.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setUnitArrows((v) => !v)}
            className={`px-3 py-1.5 text-xs font-tabular-mono border transition-colors flex items-center gap-1.5 ${
              unitArrows
                ? "border-[var(--math-ink-x)] bg-[#8D9FCE]/15 text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{unitArrows ? "Direction-Only (Unit)" : "Scaled Magnitude"}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowContours((v) => !v)}
            className={`px-3 py-1.5 text-xs font-tabular-mono border transition-colors flex items-center gap-1.5 ${
              showContours
                ? "border-[var(--math-ink-diff)] bg-[#FBEAA4]/15 text-[var(--math-ink-diff)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)]"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Potential Contours φ = c</span>
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {VF_PRESETS.map((p) => {
          const selected = !isCustom && presetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`p-3 border text-left transition-colors ${
                selected
                  ? "border-[var(--math-ink-x)] bg-[var(--bg-canvas)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 hover:border-[var(--border-strong)]"
              }`}
            >
              <span className="text-[11px] font-tabular-mono text-[var(--math-ink-x)] font-semibold block mb-1">
                {p.categoryBadge}
              </span>
              <div className="text-xs font-math-serif text-[var(--text-primary)] leading-snug">
                {p.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Field Component Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MathExpressionInput
          label="x-Component P(x, y, z)"
          prefixLatex="P ="
          value={pExpr}
          allowedVars={["x", "y", "z"]}
          onChange={(val) => {
            setPExpr(val);
            setIsCustom(true);
          }}
        />
        <MathExpressionInput
          label="y-Component Q(x, y, z)"
          prefixLatex="Q ="
          value={qExpr}
          allowedVars={["x", "y", "z"]}
          onChange={(val) => {
            setQExpr(val);
            setIsCustom(true);
          }}
        />
        <MathExpressionInput
          label="z-Component R(x, y, z)"
          prefixLatex="R ="
          value={rExpr}
          allowedVars={["x", "y", "z"]}
          onChange={(val) => {
            setRExpr(val);
            setIsCustom(true);
          }}
        />
      </div>

      {/* Main Twin Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 2D Streamline Plane */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-tabular-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--math-ink-sweep)]" />
              <span>Click to relocate tracer seed ({activeProbe[0].toFixed(2)}, {activeProbe[1].toFixed(2)})</span>
            </span>
            <span>z-slice = {zSlice.toFixed(1)}</span>
          </div>

          <SvgCoordinatePlane2D
            xRange={[bounds.xMin, bounds.xMax]}
            yRange={[bounds.yMin, bounds.yMax]}
            width={440}
            height={360}
            ariaLabel="2D vector field arrows, scalar potential contours, and RK4 streamlines"
            onSelectPoint={(x, y) => {
              const pt: [number, number] = [Number(x.toFixed(2)), Number(y.toFixed(2))];
              setActiveProbe(pt);
              setSeedPts((prev) => [pt, prev[1] ?? [-0.95, 0.95], prev[2] ?? [0.95, -0.85]]);
            }}
            className="w-full h-[360px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] cursor-crosshair select-none"
          >
            {({ toSvgX, toSvgY }) => {
              const pathStr = (pts: [number, number][]) =>
                pts
                  .map(
                    ([px, py], i) =>
                      `${i === 0 ? "M" : "L"}${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`
                  )
                  .join(" ");

              return (
                <g>
                  {/* Potential Equipotential Contours (when conservative preset active) */}
                  {fieldData.potContours.map((segs, grpIdx) =>
                    segs.map((s, sIdx) => (
                      <line
                        key={`pc-${grpIdx}-${sIdx}`}
                        x1={toSvgX(s.x1)}
                        y1={toSvgY(s.y1)}
                        x2={toSvgX(s.x2)}
                        y2={toSvgY(s.y2)}
                        stroke="#FBEAA4"
                        strokeOpacity="0.32"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                    ))
                  )}

                  {/* Grid Vector Field Arrows */}
                  {fieldData.arrows.map((a, idx) => {
                    const sx = toSvgX(a.x);
                    const sy = toSvgY(a.y);
                    const ex = toSvgX(a.x + a.dx);
                    const ey = toSvgY(a.y + a.dy);
                    const ratio = Math.min(1, a.mag / Math.max(fieldData.maxMag, 0.5));
                    const strokeHex = ratio > 0.62 ? "#D35323" : ratio > 0.3 ? "#029091" : "#8D9FCE";
                    return (
                      <g key={`v-${idx}`} opacity={0.7}>
                        <line
                          x1={sx}
                          y1={sy}
                          x2={ex}
                          y2={ey}
                          stroke={strokeHex}
                          strokeWidth="1.35"
                        />
                        <circle cx={ex} cy={ey} r="1.7" fill={strokeHex} />
                      </g>
                    );
                  })}

                  {/* Ambient Streamlines */}
                  {fieldData.ambientStreamlines.map((st, idx) => (
                    <g key={`amb-${idx}`} opacity={0.5}>
                      <path d={pathStr(st.fwd)} fill="none" stroke="#96B898" strokeWidth="1.35" />
                      <path
                        d={pathStr(st.bwd)}
                        fill="none"
                        stroke="#96B898"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                    </g>
                  ))}

                  {/* User Seeded Streamlines */}
                  {fieldData.userStreamlines.map((st) => {
                    const isPrimary = st.idx === 0;
                    const color = isPrimary ? "#D35323" : "#FBEAA4";
                    return (
                      <g key={`ust-${st.idx}`}>
                        <path
                          d={pathStr(st.fwd)}
                          fill="none"
                          stroke={color}
                          strokeWidth={isPrimary ? "2.6" : "1.8"}
                        />
                        <path
                          d={pathStr(st.bwd)}
                          fill="none"
                          stroke={color}
                          strokeWidth={isPrimary ? "2" : "1.4"}
                          strokeDasharray="4 3"
                        />
                        <circle
                          cx={toSvgX(st.seed[0])}
                          cy={toSvgY(st.seed[1])}
                          r={isPrimary ? "5" : "3.5"}
                          fill={color}
                          stroke="#1E1F22"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  })}
                </g>
              );
            }}
          </SvgCoordinatePlane2D>

          {/* z-slice slider */}
          <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1">
            <div className="flex justify-between text-xs font-tabular-mono text-[var(--math-ink-z)]">
              <span>2D Plane Height Slice z₀ (for 3D fields)</span>
              <span>z₀ = {zSlice.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-1.5}
              max={1.5}
              step={0.1}
              value={zSlice}
              onChange={(e) => setZSlice(parseFloat(e.target.value))}
              className="w-full accent-[#029091]"
              aria-label="2D plane height slice z₀"
            />
          </div>
        </div>

        {/* Right: 3D Vector Lattice + Local DF Matrix Tensor */}
        <div className="lg:col-span-6 space-y-4">
          <ThreeOrbitViewport
            heightClassName="h-[290px]"
            cameraPosition={[3.7, 2.7, 3.7]}
            titleBadge="3D Vector Lattice & Traced RK4 Streamline"
            onBuildScene={build3dScene}
            sceneDeps={[build3dScene]}
          />

          {/* Explanation & Velocity Gradient Matrix DF */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-diff)] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>VELOCITY-GRADIENT TENSOR DF(p) AT SEED</span>
              </span>
              <span className="text-xs font-tabular-mono text-[var(--text-muted)]">
                ‖F(p)‖ = {fieldData.speed3d.toFixed(3)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs font-tabular-mono space-y-1.5">
                <div className="text-[10px] text-[var(--text-muted)] uppercase">
                  2×2 Planar Jacobian Slice ∂(P,Q)/∂(x,y)
                </div>
                <div className="grid grid-cols-2 gap-2 text-center pt-1">
                  <div className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                    <span className="text-[10px] text-[var(--math-ink-x)] block">∂P/∂x</span>
                    <span className="text-[var(--text-primary)] font-semibold">
                      {fieldData.dP.fx.toFixed(3)}
                    </span>
                  </div>
                  <div className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                    <span className="text-[10px] text-[var(--math-ink-lower)] block">∂P/∂y</span>
                    <span className="text-[var(--text-primary)] font-semibold">
                      {fieldData.dP.fy.toFixed(3)}
                    </span>
                  </div>
                  <div className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                    <span className="text-[10px] text-[var(--math-ink-lower)] block">∂Q/∂x</span>
                    <span className="text-[var(--text-primary)] font-semibold">
                      {fieldData.dQ.fx.toFixed(3)}
                    </span>
                  </div>
                  <div className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                    <span className="text-[10px] text-[var(--math-ink-y)] block">∂Q/∂y</span>
                    <span className="text-[var(--text-primary)] font-semibold">
                      {fieldData.dQ.fy.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-tabular-mono">
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex justify-between items-center">
                  <span className="text-[var(--math-ink-sweep)]">Expansion (tr = ∇·F)</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {fieldData.div3d.toFixed(3)}
                  </span>
                </div>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex justify-between items-center">
                  <span className="text-[var(--math-ink-diff)]">Spin ½(∂Q/∂x - ∂P/∂y)</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {fieldData.spinRate.toFixed(3)} rad/s
                  </span>
                </div>
                <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex justify-between items-center">
                  <span className="text-[var(--math-ink-z)]">Shear ½(∂Q/∂x + ∂P/∂y)</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {fieldData.shearRate.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs font-math-serif text-[var(--text-secondary)]">
              {!isCustom ? activePreset.geometryNote : (
                <>
                  Every infinitesimal neighborhood of a smooth vector field splits into isotropic
                  volume growth (trace <KaTeXMath math="\nabla\cdot\mathbf{F}" />), rigid rotation
                  (skew part <KaTeXMath math="\frac{1}{2}\nabla\times\mathbf{F}" />), and volume-preserving
                  shear deformation.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
