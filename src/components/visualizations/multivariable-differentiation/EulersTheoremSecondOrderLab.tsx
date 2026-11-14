"use client";

import React, { useState, useMemo } from "react";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { computePartialDerivatives2D } from "@/components/visualizations/primitives/core2d";

type EulerLabMode = "direct-second-order" | "composite-deduction";

interface CompositeCase {
  id: string;
  title: string;
  degreeN: number;
  positiveOnly: boolean;
  defaultPt: [number, number];
  evalU: (x: number, y: number) => number;
  phiExact: (u: number) => number;
  secondOrderExact: (u: number) => number;
  uLatex: string;
  gLatex: string;
  firstOrderLatex: string;
  secondOrderLatex: string;
  derivationSteps: string[];
}

const COMPOSITE_CASES: CompositeCase[] = [
  {
    id: "arcsin-half",
    title: "u = sin⁻¹((x + y) / (√x + √y))",
    degreeN: 0.5,
    positiveOnly: true,
    defaultPt: [0.65, 0.35],
    evalU: (x, y) => {
      const xs = Math.max(0.05, x);
      const ys = Math.max(0.05, y);
      const ratio = (xs + ys) / (Math.sqrt(xs) + Math.sqrt(ys));
      // Keep strictly inside (-1, 1) so arcsin is real-valued
      return Math.asin(Math.max(-0.96, Math.min(0.96, 0.55 * ratio)));
    },
    phiExact: (u) => 0.5 * Math.tan(u),
    secondOrderExact: (u) => {
      const c = Math.cos(u);
      return -(Math.sin(u) * Math.cos(2 * u)) / (4 * c * c * c);
    },
    uLatex: "u = \\sin^{-1}\\!\\left(0.55\\,\\frac{x+y}{\\sqrt{x}+\\sqrt{y}}\\right)",
    gLatex: "g(u) = \\sin(u) \\;\\text{ is homogeneous of degree } n = \\tfrac{1}{2}",
    firstOrderLatex:
      "x u_x + y u_y = n\\frac{g(u)}{g'(u)} = \\frac{1}{2}\\tan(u)",
    secondOrderLatex:
      "x^2 u_{xx} + 2xy u_{xy} + y^2 u_{yy} = -\\frac{\\sin(u)\\cos(2u)}{4\\cos^3(u)}",
    derivationSteps: [
      "1. Let f(x,y) = sin(u). Since scaling x→tx, y→ty pulls out t^(1/2), f is homogeneous of degree n = 1/2.",
      "2. Apply 1st-order Euler to sin(u): x·cos(u)u_x + y·cos(u)u_y = ½ sin(u) ⇒ x u_x + y u_y = ½ tan(u) ≡ φ(u).",
      "3. Differentiate x u_x + y u_y = φ(u) with respect to x and y, multiply by x, y, and add: x²u_xx + 2xy u_xy + y²u_yy = φ(u)[φ'(u) - 1].",
      "4. With φ'(u) = ½ sec²(u), φ(u)[φ'(u)-1] simplifies identically to -sin(u)cos(2u) / (4cos³u).",
    ],
  },
  {
    id: "arctan-deg2",
    title: "u = tan⁻¹((x³ + y³) / (x - y))",
    degreeN: 2,
    positiveOnly: false,
    defaultPt: [1.1, 0.45],
    evalU: (x, y) => {
      const denom = Math.abs(x - y) < 0.08 ? (x - y >= 0 ? 0.08 : -0.08) : x - y;
      return Math.atan((x * x * x + y * y * y) / denom);
    },
    phiExact: (u) => Math.sin(2 * u),
    secondOrderExact: (u) => Math.sin(4 * u) - Math.sin(2 * u),
    uLatex: "u = \\tan^{-1}\\!\\left(\\frac{x^3+y^3}{x-y}\\right)",
    gLatex: "g(u) = \\tan(u) \\;\\text{ is homogeneous of degree } n = 3 - 1 = 2",
    firstOrderLatex:
      "x u_x + y u_y = 2\\frac{\\tan(u)}{\\sec^2(u)} = \\sin(2u)",
    secondOrderLatex:
      "x^2 u_{xx} + 2xy u_{xy} + y^2 u_{yy} = \\sin(4u) - \\sin(2u)",
    derivationSteps: [
      "1. Rewrite as f(x,y) = tan(u) = (x³+y³)/(x-y). Numerator degree 3 minus denominator degree 1 gives n = 2.",
      "2. 1st-order Euler yields x·sec²(u)u_x + y·sec²(u)u_y = 2 tan(u) ⇒ x u_x + y u_y = 2 sin(u)cos(u) = sin(2u).",
      "3. Using the general reduction x²u_xx + 2xy u_xy + y²u_yy = φ(u)[φ'(u) - 1] with φ(u) = sin(2u) and φ'(u) = 2cos(2u):",
      "4. We get sin(2u)[2cos(2u) - 1] = sin(4u) - sin(2u).",
    ],
  },
  {
    id: "ln-deg3",
    title: "u = ln((x⁴ + y⁴) / (x + y))",
    degreeN: 3,
    positiveOnly: true,
    defaultPt: [0.95, 0.75],
    evalU: (x, y) => {
      const xs = Math.max(0.08, x);
      const ys = Math.max(0.08, y);
      return Math.log((Math.pow(xs, 4) + Math.pow(ys, 4)) / (xs + ys));
    },
    phiExact: () => 3,
    secondOrderExact: () => -3,
    uLatex: "u = \\ln\\!\\left(\\frac{x^4+y^4}{x+y}\\right)",
    gLatex: "g(u) = e^u \\;\\text{ is homogeneous of degree } n = 4 - 1 = 3",
    firstOrderLatex: "x u_x + y u_y = 3\\frac{e^u}{e^u} = 3",
    secondOrderLatex:
      "x^2 u_{xx} + 2xy u_{xy} + y^2 u_{yy} = 3(0 - 1) = -3",
    derivationSteps: [
      "1. Exponentiate to clear ln: f(x,y) = e^u = (x⁴+y⁴)/(x+y), homogeneous of degree n = 4 - 1 = 3.",
      "2. 1st-order Euler gives x·e^u u_x + y·e^u u_y = 3 e^u ⇒ x u_x + y u_y = 3 (constant φ(u) = 3).",
      "3. Since φ'(u) = 0, the 2nd-order Euler identity immediately collapses to φ(u)[0 - 1] = -3!",
    ],
  },
];

function computeSecondOrderEuler(
  fn: (x: number, y: number) => number,
  x: number,
  y: number
) {
  const h = 0.008;
  const f0 = fn(x, y);
  const { fx, fy } = computePartialDerivatives2D(fn, x, y, 0.004);
  const fxx = (fn(x + h, y) - 2 * f0 + fn(x - h, y)) / (h * h);
  const fyy = (fn(x, y + h) - 2 * f0 + fn(x, y - h)) / (h * h);
  const fxy =
    (fn(x + h, y + h) - fn(x + h, y - h) - fn(x - h, y + h) + fn(x - h, y - h)) /
    (4 * h * h);

  const termXX = x * x * fxx;
  const termXY = 2 * x * y * fxy;
  const termYY = y * y * fyy;
  const lhs2 = termXX + termXY + termYY;
  const lhs1 = x * fx + y * fy;

  return { f0, fx, fy, fxx, fxy, fyy, termXX, termXY, termYY, lhs1, lhs2 };
}

export function EulersTheoremSecondOrderLab() {
  const [mode, setMode] = useState<EulerLabMode>("composite-deduction");
  const [compId, setCompId] = useState<string>(COMPOSITE_CASES[0].id);
  const [degN, setDegN] = useState<number>(3);
  const [px, setPx] = useState<number>(0.65);
  const [py, setPy] = useState<number>(0.35);

  const compCase = useMemo(
    () => COMPOSITE_CASES.find((c) => c.id === compId) ?? COMPOSITE_CASES[0],
    [compId]
  );

  // Direct homogeneous polynomial family: x^n + 0.5 x^(n-1) y + y^n
  const directFn = useMemo(
    () => (x: number, y: number) => {
      const xs = Math.max(0.1, x);
      const ys = Math.max(0.1, y);
      return (
        Math.pow(xs, degN) +
        0.5 * Math.pow(xs, degN - 1) * ys +
        Math.pow(ys, degN)
      );
    },
    [degN]
  );

  const directStats = useMemo(() => {
    const res = computeSecondOrderEuler(directFn, px, py);
    return {
      ...res,
      rhs1: degN * res.f0,
      rhs2: degN * (degN - 1) * res.f0,
    };
  }, [degN, directFn, px, py]);

  const compStats = useMemo(() => {
    const res = computeSecondOrderEuler(compCase.evalU, px, py);
    const phi1 = compCase.phiExact(res.f0);
    const phi2 = compCase.secondOrderExact(res.f0);
    return {
      ...res,
      phi1,
      phi2,
    };
  }, [compCase, px, py]);

  const coordMin =
    mode === "direct-second-order" || compCase.positiveOnly ? 0.2 : -1.2;

  return (
    <section
      aria-label="Second-Order Euler Theorem and Composite Homogeneous Reduction Laboratory"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-elevated)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-tabular-mono uppercase tracking-wider border border-[var(--math-ink-diff)] text-[var(--math-ink-diff)] bg-[var(--bg-canvas)]">
              LAB 3.1.7B • 2ND-ORDER EULER IDENTITY &amp; DISGUISED HOMOGENEITY
            </span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
            x²f_xx + 2xy f_xy + y²f_yy = n(n − 1)f &amp; Composite φ(u)[φ'(u) − 1] Deductions
          </h3>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("direct-second-order");
              setPx(0.8);
              setPy(0.5);
            }}
            className={`px-3 py-1.5 text-xs font-sans border ${
              mode === "direct-second-order"
                ? "border-[var(--math-ink-diff)] bg-[#FBEAA4]/15 text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
            }`}
          >
            Direct Homogeneous (1st &amp; 2nd Order)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("composite-deduction");
              setPx(compCase.defaultPt[0]);
              setPy(compCase.defaultPt[1]);
            }}
            className={`px-3 py-1.5 text-xs font-sans border ${
              mode === "composite-deduction"
                ? "border-[var(--math-ink-diff)] bg-[#FBEAA4]/15 text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
            }`}
          >
            Disguised u = g⁻¹(fₙ) Theorems
          </button>
        </div>
      </div>

      {/* Mode A: Direct Homogeneous 2nd-Order Verifier */}
      {mode === "direct-second-order" && (
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[var(--text-secondary)]">
                  Homogeneity Degree n
                </span>
                <span className="font-tabular-mono text-[var(--math-ink-diff)]">
                  n = {degN.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={4.5}
                step={0.5}
                value={degN}
                aria-label="Degree n"
                onChange={(e) => setDegN(parseFloat(e.target.value))}
                className="w-full accent-[#FBEAA4]"
              />
            </div>

            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[var(--text-secondary)]">Point x₀</span>
                <span className="font-tabular-mono text-[var(--math-ink-x)]">
                  {px.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.25}
                max={1.4}
                step={0.05}
                value={px}
                aria-label="x0"
                onChange={(e) => setPx(parseFloat(e.target.value))}
                className="w-full accent-[#8D9FCE]"
              />
            </div>

            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[var(--text-secondary)]">Point y₀</span>
                <span className="font-tabular-mono text-[var(--math-ink-y)]">
                  {py.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.25}
                max={1.4}
                step={0.05}
                value={py}
                aria-label="y0"
                onChange={(e) => setPy(parseFloat(e.target.value))}
                className="w-full accent-[#96B898]"
              />
            </div>
          </div>

          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="text-xs font-sans text-[var(--text-secondary)]">
              Evaluating{" "}
              <KaTeXMath math={`f(x,y) = x^{${degN}} + 0.5 x^{${degN - 1}} y + y^{${degN}}`} />{" "}
              at ({px.toFixed(2)}, {py.toFixed(2)}):
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-tabular-mono">
              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <div className="text-[var(--text-muted)]">x² f_xx</div>
                <div className="mt-1 text-[var(--math-ink-x)] text-sm">
                  {directStats.termXX.toFixed(4)}
                </div>
              </div>
              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <div className="text-[var(--text-muted)]">2xy f_xy</div>
                <div className="mt-1 text-[var(--math-ink-y)] text-sm">
                  {directStats.termXY.toFixed(4)}
                </div>
              </div>
              <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                <div className="text-[var(--text-muted)]">y² f_yy</div>
                <div className="mt-1 text-[var(--math-ink-sweep)] text-sm">
                  {directStats.termYY.toFixed(4)}
                </div>
              </div>
              <div className="p-3 border border-[var(--math-ink-diff)]/50 bg-[var(--bg-panel)]">
                <div className="text-[var(--text-muted)]">Sum = n(n − 1)f</div>
                <div className="mt-1 text-[var(--math-ink-diff)] text-sm font-semibold">
                  {directStats.lhs2.toFixed(4)} = {directStats.rhs2.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode B: Composite Disguised Homogeneous Functions */}
      {mode === "composite-deduction" && (
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            {COMPOSITE_CASES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCompId(c.id);
                  setPx(c.defaultPt[0]);
                  setPy(c.defaultPt[1]);
                }}
                className={`px-3 py-1.5 text-xs font-sans border ${
                  compId === c.id
                    ? "border-[var(--math-ink-z)] bg-[#029091]/15 text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[var(--text-secondary)]">Probe x₀</span>
                <span className="font-tabular-mono text-[var(--math-ink-x)]">
                  {px.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={coordMin}
                max={1.25}
                step={0.05}
                value={px}
                aria-label="Composite x0"
                onChange={(e) => setPx(parseFloat(e.target.value))}
                className="w-full accent-[#8D9FCE]"
              />
            </div>

            <div className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[var(--text-secondary)]">Probe y₀</span>
                <span className="font-tabular-mono text-[var(--math-ink-y)]">
                  {py.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={coordMin}
                max={1.25}
                step={0.05}
                value={py}
                aria-label="Composite y0"
                onChange={(e) => setPy(parseFloat(e.target.value))}
                className="w-full accent-[#96B898]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
              <div className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)]">
                Step-by-Step Symbolic Deduction
              </div>
              <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-x-auto text-xs">
                <KaTeXMath math={compCase.uLatex} block />
              </div>
              <ul className="space-y-1.5 text-xs font-serif text-[var(--text-secondary)]">
                {compCase.derivationSteps.map((st, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {st}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-6 space-y-3">
              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <div className="text-xs font-sans font-semibold text-[var(--math-ink-y)] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Live 1st-Order Verification
                </div>
                <KaTeXMath math={compCase.firstOrderLatex} block />
                <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--text-muted)]">
                    Numeric x uₓ + y u_y:
                  </span>
                  <span className="text-[var(--math-ink-y)]">
                    {compStats.lhs1.toFixed(5)} ≈ {compStats.phi1.toFixed(5)}
                  </span>
                </div>
              </div>

              <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <div className="text-xs font-sans font-semibold text-[var(--math-ink-sweep)] flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                  Live 2nd-Order Verification
                </div>
                <KaTeXMath math={compCase.secondOrderLatex} block />
                <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between text-xs font-tabular-mono">
                  <span className="text-[var(--text-muted)]">
                    x²u_xx + 2xy u_xy + y²u_yy:
                  </span>
                  <span className="text-[var(--math-ink-sweep)]">
                    {compStats.lhs2.toFixed(4)} ≈ {compStats.phi2.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
