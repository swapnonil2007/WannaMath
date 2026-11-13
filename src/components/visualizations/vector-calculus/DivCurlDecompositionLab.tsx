"use client";

import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Wind, RotateCw, ShieldCheck, Box } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  ThreeOrbitViewport,
  createVectorArrow3D,
  mathToThreeVec3,
} from "@/components/visualizations/primitives";

interface DivCurlPreset {
  id: string;
  name: string;
  badge: string;
  pExpr: string;
  qExpr: string;
  rExpr: string;
  defaultPos: [number, number, number];
  formulaLatex: string;
  explanation: string;
}

const DIV_CURL_PRESETS: DivCurlPreset[] = [
  {
    id: "tilted-3d-vortex",
    name: "Tilted 3D Vortex Axis: F = ⟨-0.8y + 0.5z, 0.8x, -0.5x⟩",
    badge: "3D Tilted Curl Axis",
    pExpr: "-0.8 * y + 0.5 * z",
    qExpr: "0.8 * x",
    rExpr: "-0.5 * x",
    defaultPos: [0.35, 0.25, 0.2],
    formulaLatex:
      "\\nabla\\cdot\\mathbf{F} = 0, \\qquad \\nabla\\times\\mathbf{F} = \\langle 0,\\; 1.0,\\; 1.6 \\rangle",
    explanation:
      "Spin is not restricted to the z-axis! Here fluid circulates in an oblique 3D plane whose right-hand thumb points along ⟨0, 1.0, 1.6⟩ while remaining completely incompressible.",
  },
  {
    id: "shear-paradox",
    name: "Couette Shear Paradox: F = ⟨y, 0, 0⟩",
    badge: "Straight Lines, Curl ≠ 0",
    pExpr: "y",
    qExpr: "0",
    rExpr: "0",
    defaultPos: [0.0, 0.65, 0.0],
    formulaLatex:
      "\\frac{\\partial P}{\\partial x} = 0,\\; \\frac{\\partial Q}{\\partial y} = 0 \\implies \\nabla\\cdot\\mathbf{F} = 0, \\quad (\\nabla\\times\\mathbf{F})_z = 0 - 1 = -1",
    explanation:
      "All flow arrows point straight horizontally—yet ∂P/∂y = +1 means the top face flows faster than the bottom face, twisting a paddlewheel clockwise ((-1)k̂).",
  },
  {
    id: "saddle-incompressible",
    name: "Incompressible Saddle Balance: F = ⟨x, -y, 0⟩",
    badge: "Expanding x Cancels Contracting y",
    pExpr: "x",
    qExpr: "-y",
    rExpr: "0",
    defaultPos: [0.55, 0.55, 0.0],
    formulaLatex:
      "\\frac{\\partial P}{\\partial x} = +1,\\; \\frac{\\partial Q}{\\partial y} = -1 \\implies \\nabla\\cdot\\mathbf{F} = +1 + (-1) = 0",
    explanation:
      "Fluid stretches horizontally (∂P/∂x = +1) while compressing vertically at the exact same rate (∂Q/∂y = -1), so net 3D volume flux across the cube vanishes.",
  },
  {
    id: "compressible-swirl",
    name: "Expanding 3D Spiral Source: F = ⟨0.5x - y, x + 0.5y, 0.6z⟩",
    badge: "Both Div > 0 & Curl ≠ 0",
    pExpr: "0.5 * x - y",
    qExpr: "x + 0.5 * y",
    rExpr: "0.6 * z",
    defaultPos: [0.4, 0.4, 0.4],
    formulaLatex:
      "\\nabla\\cdot\\mathbf{F} = 0.5 + 0.5 + 0.6 = 1.6, \\qquad \\nabla\\times\\mathbf{F} = \\langle 0,\\; 0,\\; 2.0 \\rangle",
    explanation:
      "Separates expansion (radial outward excess across all 6 faces) from rotation (constant upward vorticity +2k̂) inside a single 3D flow.",
  },
  {
    id: "conservative-gradient-check",
    name: "Exact Gradient Field: F = ∇(0.4x²y + 0.3yz²)",
    badge: "Verify ∇×(∇f) ≡ 0",
    pExpr: "0.8 * x * y",
    qExpr: "0.4 * x^2 + 0.3 * z^2",
    rExpr: "0.6 * y * z",
    defaultPos: [0.6, 0.5, 0.5],
    formulaLatex:
      "\\mathbf{F} = \\nabla\\phi \\implies \\nabla\\times\\mathbf{F} = \\langle 0.6z - 0.6z,\\; 0 - 0,\\; 0.8x - 0.8x \\rangle = \\mathbf{0}",
    explanation:
      "Mixed partial symmetry (Clairaut's theorem) forces every shear pair R_y - Q_z, P_z - R_x, and Q_x - P_y to cancel identically everywhere in ℝ³.",
  },
];

export function DivCurlDecompositionLab() {
  const [presetId, setPresetId] = useState<string>("tilted-3d-vortex");
  const [pExpr, setPExpr] = useState<string>(DIV_CURL_PRESETS[0].pExpr);
  const [qExpr, setQExpr] = useState<string>(DIV_CURL_PRESETS[0].qExpr);
  const [rExpr, setRExpr] = useState<string>(DIV_CURL_PRESETS[0].rExpr);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [x0, setX0] = useState<number>(DIV_CURL_PRESETS[0].defaultPos[0]);
  const [y0, setY0] = useState<number>(DIV_CURL_PRESETS[0].defaultPos[1]);
  const [z0, setZ0] = useState<number>(DIV_CURL_PRESETS[0].defaultPos[2]);
  const [cubeHalfWidth, setCubeHalfWidth] = useState<number>(0.42);

  const activePreset = useMemo(
    () =>
      DIV_CURL_PRESETS.find((p) => p.id === presetId) ?? DIV_CURL_PRESETS[0],
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

  const handleSelectPreset = (p: DivCurlPreset) => {
    setPresetId(p.id);
    setPExpr(p.pExpr);
    setQExpr(p.qExpr);
    setRExpr(p.rExpr);
    setX0(p.defaultPos[0]);
    setY0(p.defaultPos[1]);
    setZ0(p.defaultPos[2]);
    setIsCustom(false);
  };

  // Detailed component decomposition + finite-box flux limit + 2nd-order identity ∇·(∇×F)
  const decomp = useMemo(() => {
    const evalF = (x: number, y: number, z: number): [number, number, number] => [
      compiledP.evaluate({ x, y, z }),
      compiledQ.evaluate({ x, y, z }),
      compiledR.evaluate({ x, y, z }),
    ];

    const partialsAt = (x: number, y: number, z: number, step = 1e-4) => {
      const [pxp, qxp, rxp] = evalF(x + step, y, z);
      const [pxm, qxm, rxm] = evalF(x - step, y, z);
      const [pyp, qyp, ryp] = evalF(x, y + step, z);
      const [pym, qym, rym] = evalF(x, y - step, z);
      const [pzp, qzp, rzp] = evalF(x, y, z + step);
      const [pzm, qzm, rzm] = evalF(x, y, z - step);
      const inv2h = 1 / (2 * step);
      return {
        Px: (pxp - pxm) * inv2h,
        Py: (pyp - pym) * inv2h,
        Pz: (pzp - pzm) * inv2h,
        Qx: (qxp - qxm) * inv2h,
        Qy: (qyp - qym) * inv2h,
        Qz: (qzp - qzm) * inv2h,
        Rx: (rxp - rxm) * inv2h,
        Ry: (ryp - rym) * inv2h,
        Rz: (rzp - rzm) * inv2h,
      };
    };

    const j = partialsAt(x0, y0, z0);
    const divTotal = j.Px + j.Qy + j.Rz;

    const curlX = j.Ry - j.Qz;
    const curlY = j.Pz - j.Rx;
    const curlZ = j.Qx - j.Py;
    const curlMag = Math.hypot(curlX, curlY, curlZ);

    // Finite-difference check of div(curl(F)) = 0
    const dStep = 2e-3;
    const curlVec = (x: number, y: number, z: number): [number, number, number] => {
      const k = partialsAt(x, y, z, 5e-4);
      return [k.Ry - k.Qz, k.Pz - k.Rx, k.Qx - k.Py];
    };
    const divCurl =
      ((curlVec(x0 + dStep, y0, z0)[0] - curlVec(x0 - dStep, y0, z0)[0]) +
        (curlVec(x0, y0 + dStep, z0)[1] - curlVec(x0, y0 - dStep, z0)[1]) +
        (curlVec(x0, y0, z0 + dStep)[2] - curlVec(x0, y0, z0 - dStep)[2])) /
      (2 * dStep);

    // Finite-cube 6-face outward flux per unit volume (comparing geometric limit to derivative sum)
    const h = cubeHalfWidth;
    const faceArea = 4 * h * h;
    const vol = 8 * h * h * h;
    const fluxXPos = evalF(x0 + h, y0, z0)[0] * faceArea;
    const fluxXNeg = -evalF(x0 - h, y0, z0)[0] * faceArea;
    const fluxYPos = evalF(x0, y0 + h, z0)[1] * faceArea;
    const fluxYNeg = -evalF(x0, y0 - h, z0)[1] * faceArea;
    const fluxZPos = evalF(x0, y0, z0 + h)[2] * faceArea;
    const fluxZNeg = -evalF(x0, y0, z0 - h)[2] * faceArea;
    const boxFluxDensity =
      (fluxXPos + fluxXNeg + fluxYPos + fluxYNeg + fluxZPos + fluxZNeg) / vol;

    return {
      j,
      divTotal,
      curlX,
      curlY,
      curlZ,
      curlMag,
      divCurl: Number.isFinite(divCurl) ? divCurl : 0,
      boxFluxDensity,
      fCenter: evalF(x0, y0, z0),
      facePairs: {
        xOut: evalF(x0 + h, y0, z0)[0],
        xIn: evalF(x0 - h, y0, z0)[0],
        yOut: evalF(x0, y0 + h, z0)[1],
        yIn: evalF(x0, y0 - h, z0)[1],
        zOut: evalF(x0, y0, z0 + h)[2],
        zIn: evalF(x0, y0, z0 - h)[2],
      },
    };
  }, [compiledP, compiledQ, compiledR, x0, y0, z0, cubeHalfWidth]);

  // 3D Control Cube + Oriented 3D Curl Axis + Spin Plane Disk
  const build3dScene = useMemo(() => {
    return (sceneGroup: THREE.Group) => {
      const h = cubeHalfWidth;
      const centerThree = mathToThreeVec3(x0, y0, z0);

      // 1. Wireframe Control Cube at (x0, y0, z0)
      const boxGeom = new THREE.BoxGeometry(2 * h, 2 * h, 2 * h);
      const edges = new THREE.EdgesGeometry(boxGeom);
      const boxWire = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xaaa36d })
      );
      boxWire.position.copy(centerThree);
      sceneGroup.add(boxWire);

      const boxFill = new THREE.Mesh(
        boxGeom,
        new THREE.MeshBasicMaterial({
          color: 0x029091,
          transparent: true,
          opacity: 0.12,
        })
      );
      boxFill.position.copy(centerThree);
      sceneGroup.add(boxFill);

      // 2. Ambient sparse 3D vector arrows around probe cube
      const offsets = [-1.15, 0, 1.15];
      for (const ox of offsets) {
        for (const oy of offsets) {
          for (const oz of [-0.9, 0.9]) {
            const px = x0 + ox;
            const py = y0 + oy;
            const pz = z0 + oz;
            const fx = compiledP.evaluate({ x: px, y: py, z: pz });
            const fy = compiledQ.evaluate({ x: px, y: py, z: pz });
            const fz = compiledR.evaluate({ x: px, y: py, z: pz });
            const m = Math.hypot(fx, fy, fz);
            if (Number.isFinite(m) && m > 1e-4) {
              const len = Math.min(0.45, 0.14 + 0.22 * Math.tanh(m * 0.45));
              sceneGroup.add(
                createVectorArrow3D(
                  [px, py, pz],
                  [fx / m, fy / m, fz / m],
                  len,
                  0x5d6475,
                  0.24
                )
              );
            }
          }
        }
      }

      // 3. Six normal flux arrows on the cube faces (#8D9FCE, #96B898, #029091)
      const addFaceArrow = (
        facePos: [number, number, number],
        comp: number,
        axisUnit: [number, number, number],
        colorHex: number
      ) => {
        if (Math.abs(comp) < 0.03) return;
        const sign = comp >= 0 ? 1 : -1;
        const len = Math.min(0.75, 0.18 + 0.35 * Math.tanh(Math.abs(comp)));
        sceneGroup.add(
          createVectorArrow3D(
            facePos,
            [axisUnit[0] * sign, axisUnit[1] * sign, axisUnit[2] * sign],
            len,
            colorHex,
            0.25
          )
        );
      };

      addFaceArrow([x0 + h, y0, z0], decomp.facePairs.xOut, [1, 0, 0], 0x8d9fce);
      addFaceArrow([x0 - h, y0, z0], decomp.facePairs.xIn, [1, 0, 0], 0x8d9fce);
      addFaceArrow([x0, y0 + h, z0], decomp.facePairs.yOut, [0, 1, 0], 0x96b898);
      addFaceArrow([x0, y0 - h, z0], decomp.facePairs.yIn, [0, 1, 0], 0x96b898);
      addFaceArrow([x0, y0, z0 + h], decomp.facePairs.zOut, [0, 0, 1], 0x029091);
      addFaceArrow([x0, y0, z0 - h], decomp.facePairs.zIn, [0, 0, 1], 0x029091);

      // 4. Full 3D Curl Axis Vector ω = ∇×F (#FBEAA4) + Orthogonal Spin Ring (#D35323)
      if (decomp.curlMag > 0.03) {
        const wUnit: [number, number, number] = [
          decomp.curlX / decomp.curlMag,
          decomp.curlY / decomp.curlMag,
          decomp.curlZ / decomp.curlMag,
        ];
        const curlLen = Math.min(1.5, 0.45 + 0.65 * Math.tanh(decomp.curlMag * 0.4));
        sceneGroup.add(
          createVectorArrow3D([x0, y0, z0], wUnit, curlLen, 0xfbeaa4, 0.22)
        );

        // Orthogonal Spin Plane Ring around ω
        const ref: [number, number, number] =
          Math.abs(wUnit[2]) < 0.85 ? [0, 0, 1] : [1, 0, 0];
        const u1Raw: [number, number, number] = [
          ref[1] * wUnit[2] - ref[2] * wUnit[1],
          ref[2] * wUnit[0] - ref[0] * wUnit[2],
          ref[0] * wUnit[1] - ref[1] * wUnit[0],
        ];
        const u1Len = Math.hypot(...u1Raw) || 1;
        const u1: [number, number, number] = [
          u1Raw[0] / u1Len,
          u1Raw[1] / u1Len,
          u1Raw[2] / u1Len,
        ];
        const u2: [number, number, number] = [
          wUnit[1] * u1[2] - wUnit[2] * u1[1],
          wUnit[2] * u1[0] - wUnit[0] * u1[2],
          wUnit[0] * u1[1] - wUnit[1] * u1[0],
        ];
        const ringR = Math.max(0.32, h * 0.95);
        const ringPts: THREE.Vector3[] = [];
        for (let i = 0; i <= 40; i++) {
          const ang = (i / 40) * 2 * Math.PI;
          const rx = x0 + ringR * (Math.cos(ang) * u1[0] + Math.sin(ang) * u2[0]);
          const ry = y0 + ringR * (Math.cos(ang) * u1[1] + Math.sin(ang) * u2[1]);
          const rz = z0 + ringR * (Math.cos(ang) * u1[2] + Math.sin(ang) * u2[2]);
          ringPts.push(mathToThreeVec3(rx, ry, rz));
        }
        const ringGeom = new THREE.BufferGeometry().setFromPoints(ringPts);
        sceneGroup.add(
          new THREE.Line(
            ringGeom,
            new THREE.LineBasicMaterial({ color: 0xd35323 })
          )
        );
      }
    };
  }, [compiledP, compiledQ, compiledR, x0, y0, z0, cubeHalfWidth, decomp]);

  const divBarScale = (val: number) =>
    Math.min(100, Math.abs(val) * 35);

  return (
    <section
      id="div-curl-decomposition"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-4 space-y-1">
        <span className="text-xs font-tabular-mono uppercase tracking-wider text-[#029091] block">
          Laboratory 3.3.3.3 • Component-Wise Divergence Budget, 3D Curl Axis &amp; Del Identities
        </span>
        <h2 className="font-math-serif text-2xl font-semibold text-[var(--text-primary)]">
          Flux-Per-Volume Decomposition, 3D Right-Hand Spin Axis &amp; Paradox Diagnostics
        </h2>
        <p className="text-sm font-math-serif text-[var(--text-secondary)]">
          Inspect how <KaTeXMath math="\partial P/\partial x" />,{" "}
          <KaTeXMath math="\partial Q/\partial y" />, and{" "}
          <KaTeXMath math="\partial R/\partial z" /> compete or reinforce across opposite cube
          faces, watch the tilted 3D curl axis <KaTeXMath math="\nabla\times\mathbf{F}" />, and
          verify <KaTeXMath math="\nabla\cdot(\nabla\times\mathbf{F}) = 0" />.
        </p>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {DIV_CURL_PRESETS.map((p) => {
          const selected = !isCustom && presetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`p-3 border text-left transition-colors ${
                selected
                  ? "border-[#029091] bg-[var(--bg-canvas)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 hover:border-[var(--border-strong)]"
              }`}
            >
              <span className="text-[11px] font-tabular-mono text-[#FBEAA4] font-semibold block mb-1">
                {p.badge}
              </span>
              <div className="text-xs font-math-serif text-[var(--text-primary)] leading-snug">
                {p.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Field Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MathExpressionInput
          label="P(x, y, z)"
          prefixLatex="P ="
          value={pExpr}
          allowedVars={["x", "y", "z"]}
          onChange={(v) => {
            setPExpr(v);
            setIsCustom(true);
          }}
        />
        <MathExpressionInput
          label="Q(x, y, z)"
          prefixLatex="Q ="
          value={qExpr}
          allowedVars={["x", "y", "z"]}
          onChange={(v) => {
            setQExpr(v);
            setIsCustom(true);
          }}
        />
        <MathExpressionInput
          label="R(x, y, z)"
          prefixLatex="R ="
          value={rExpr}
          allowedVars={["x", "y", "z"]}
          onChange={(v) => {
            setRExpr(v);
            setIsCustom(true);
          }}
        />
      </div>

      {/* Main Twin Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Cube + Tilted Curl Axis + Probe Controls */}
        <div className="lg:col-span-6 space-y-4">
          <ThreeOrbitViewport
            heightClassName="h-[360px]"
            cameraPosition={[3.3, 2.5, 3.3]}
            titleBadge="3D Control Cube & Right-Hand Curl Axis ω = ∇×F"
            onBuildScene={build3dScene}
            sceneDeps={[build3dScene]}
          />

          <div className="flex flex-wrap gap-4 text-[11px] font-tabular-mono text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#FBEAA4] inline-block" />
              <span>3D Curl Axis ω = ∇×F</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#D35323] inline-block" />
              <span>Orthogonal Spin Plane</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#8D9FCE] inline-block" />
              <span>±x Face Flow</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#96B898] inline-block" />
              <span>±y Face Flow</span>
            </span>
          </div>

          {/* 3D Probe Coordinate & Box Size Controls */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-tabular-mono text-[#8D9FCE]">
                  <span>x₀</span>
                  <span>{x0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-1.3}
                  max={1.3}
                  step={0.05}
                  value={x0}
                  onChange={(e) => setX0(parseFloat(e.target.value))}
                  className="w-full accent-[#8D9FCE]"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-tabular-mono text-[#96B898]">
                  <span>y₀</span>
                  <span>{y0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-1.3}
                  max={1.3}
                  step={0.05}
                  value={y0}
                  onChange={(e) => setY0(parseFloat(e.target.value))}
                  className="w-full accent-[#96B898]"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-tabular-mono text-[#029091]">
                  <span>z₀</span>
                  <span>{z0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-1.2}
                  max={1.2}
                  step={0.05}
                  value={z0}
                  onChange={(e) => setZ0(parseFloat(e.target.value))}
                  className="w-full accent-[#029091]"
                />
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex justify-between text-xs font-tabular-mono text-[#AAA36D]">
                <span className="flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5" />
                  <span>Control Cube Half-Width h (ΔV = (2h)³)</span>
                </span>
                <span>h = {cubeHalfWidth.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.16}
                max={0.68}
                step={0.02}
                value={cubeHalfWidth}
                onChange={(e) => setCubeHalfWidth(parseFloat(e.target.value))}
                className="w-full accent-[#AAA36D]"
              />
            </div>
          </div>
        </div>

        {/* Right: Component-Wise Divergence & Curl Budgets + Identity Check */}
        <div className="lg:col-span-6 space-y-4">
          {/* Insight Banner */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
            {!isCustom && (
              <div className="text-xs overflow-x-auto">
                <KaTeXMath math={activePreset.formulaLatex} block />
              </div>
            )}
            <p className="text-xs font-math-serif text-[var(--text-secondary)]">
              {!isCustom
                ? activePreset.explanation
                : "Evaluating all 9 spatial derivatives ∂(P,Q,R)/∂(x,y,z) around (x₀, y₀, z₀) to separate volumetric expansion from 3D rotational vorticity."}
            </p>
          </div>

          {/* 1. Divergence Budget Panel */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="text-xs font-tabular-mono font-semibold text-[#D35323] flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5" />
                <span>DIVERGENCE BUDGET: ∇·F = ∂P/∂x + ∂Q/∂y + ∂R/∂z</span>
              </span>
              <span className="text-xs font-tabular-mono font-semibold text-[var(--text-primary)]">
                Total = {decomp.divTotal.toFixed(3)}
              </span>
            </div>

            <div className="space-y-2 text-xs font-tabular-mono">
              {[
                { label: "x-axis expansion ∂P/∂x", val: decomp.j.Px, color: "#8D9FCE" },
                { label: "y-axis expansion ∂Q/∂y", val: decomp.j.Qy, color: "#96B898" },
                { label: "z-axis expansion ∂R/∂z", val: decomp.j.Rz, color: "#029091" },
              ].map((row) => (
                <div key={row.label} className="space-y-1">
                  <div className="flex justify-between">
                    <span style={{ color: row.color }}>{row.label}</span>
                    <span className="text-[var(--text-primary)]">
                      {row.val >= 0 ? `+${row.val.toFixed(3)}` : row.val.toFixed(3)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${divBarScale(row.val)}%`,
                        backgroundColor: row.val >= 0 ? row.color : "#B95869",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap justify-between text-[11px] font-tabular-mono text-[var(--text-muted)]">
              <span>Finite Cube Flux / ΔV: {decomp.boxFluxDensity.toFixed(3)}</span>
              <span>Limit as h → 0: {decomp.divTotal.toFixed(3)}</span>
            </div>
          </div>

          {/* 2. Full 3D Curl Components */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="text-xs font-tabular-mono font-semibold text-[#FBEAA4] flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5" />
                <span>3D CURL VECTOR: ∇×F = ⟨ωₓ, ω_y, ω_z⟩</span>
              </span>
              <span className="text-xs font-tabular-mono font-semibold text-[var(--text-primary)]">
                ‖∇×F‖ = {decomp.curlMag.toFixed(3)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-tabular-mono">
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
                <span className="text-[10px] text-[#8D9FCE] block">
                  ωₓ = ∂R/∂y - ∂Q/∂z
                </span>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {decomp.curlX.toFixed(3)}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  ({decomp.j.Ry.toFixed(2)}) - ({decomp.j.Qz.toFixed(2)})
                </div>
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
                <span className="text-[10px] text-[#96B898] block">
                  ω_y = ∂P/∂z - ∂R/∂x
                </span>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {decomp.curlY.toFixed(3)}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  ({decomp.j.Pz.toFixed(2)}) - ({decomp.j.Rx.toFixed(2)})
                </div>
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] space-y-1">
                <span className="text-[10px] text-[#029091] block">
                  ω_z = ∂Q/∂x - ∂P/∂y
                </span>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {decomp.curlZ.toFixed(3)}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  ({decomp.j.Qx.toFixed(2)}) - ({decomp.j.Py.toFixed(2)})
                </div>
              </div>
            </div>
          </div>

          {/* 3. Live 2nd-Order Del Identity Verifier */}
          <div className="p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
            <span className="flex items-center gap-1.5 text-[#96B898]">
              <ShieldCheck className="w-4 h-4" />
              <span>Exact Identity Check: ∇·(∇×F) at probe</span>
            </span>
            <span className="px-2 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] font-semibold">
              {decomp.divCurl.toExponential(2)} ≈ 0
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
