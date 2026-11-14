"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Box,
  ChevronDown,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { KaTeXMath } from "@/components/math/KaTeXMath";
import { MathExpressionInput } from "@/components/math/MathExpressionInput";
import { compileMathExpression } from "@/lib/mathParser";
import {
  createDemandDrivenRenderLoop,
  type DemandDrivenRenderLoopHandle,
} from "@/components/visualizations/primitives";

export type TripleOrder =
  | "dzdydx"
  | "dzdxdy"
  | "dydzdx"
  | "dydxdz"
  | "dxdzdy"
  | "dxdydz";

export type SolidId =
  | "tetrahedron"
  | "parabolic-wedge"
  | "paraboloid-cap";

interface OrderExprSpec {
  order: TripleOrder;
  label: string;
  innerVar: "x" | "y" | "z";
  midVar: "x" | "y" | "z";
  outerVar: "x" | "y" | "z";
  shadowPlane: "xy" | "xz" | "yz";
  shadowPlaneLabel: string;
  outerRange: [number, number];
  midMinExpr: string;
  midMaxExpr: string;
  innerMinExpr: string;
  innerMaxExpr: string;
  rayEntryExitLabel: string;
  shadowBoundsLabel: string;
}

interface SolidPreset {
  id: SolidId;
  name: string;
  shortLabel: string;
  badge: string;
  description: string;
  equationsLatex: string;
  xyBaseXRange: [number, number];
  orders: Record<TripleOrder, OrderExprSpec>;
}

const ORDER_METADATA: {
  id: TripleOrder;
  tex: string;
  shadow: "xy" | "xz" | "yz";
}[] = [
  { id: "dzdydx", tex: "dz\\,dy\\,dx", shadow: "xy" },
  { id: "dzdxdy", tex: "dz\\,dx\\,dy", shadow: "xy" },
  { id: "dydzdx", tex: "dy\\,dz\\,dx", shadow: "xz" },
  { id: "dydxdz", tex: "dy\\,dx\\,dz", shadow: "xz" },
  { id: "dxdzdy", tex: "dx\\,dz\\,dy", shadow: "yz" },
  { id: "dxdydz", tex: "dx\\,dy\\,dz", shadow: "yz" },
];

const SOLID_PRESETS: SolidPreset[] = [
  {
    id: "tetrahedron",
    name: "1. First-Octant Tetrahedron (x + y + z ≤ 1.4)",
    shortLabel: "Tetrahedron (x+y+z ≤ 1.4)",
    badge: "Symmetric 6-Way",
    description:
      "Bounded by the coordinate planes x = 0, y = 0, z = 0 and the slanted plane x + y + z = 1.4. Because the plane is symmetric in all three variables, every coordinate wall projection is a right triangle!",
    equationsLatex:
      "E = \\{(x,y,z) : x \\ge 0,\\; y \\ge 0,\\; z \\ge 0,\\; x + y + z \\le 1.4\\}",
    xyBaseXRange: [0, 1.4],
    orders: {
      dzdydx: {
        order: "dzdydx",
        label: "dz dy dx",
        innerVar: "z",
        midVar: "y",
        outerVar: "x",
        shadowPlane: "xy",
        shadowPlaneLabel: "xy-plane (z = 0)",
        outerRange: [0, 1.4],
        midMinExpr: "0",
        midMaxExpr: "1.4 - x",
        innerMinExpr: "0",
        innerMaxExpr: "1.4 - x - y",
        rayEntryExitLabel: "z enters at z = 0, exits at slanted plane z = 1.4 - x - y",
        shadowBoundsLabel: "Shadow in xy-plane: 0 ≤ x ≤ 1.4, 0 ≤ y ≤ 1.4 - x",
      },
      dzdxdy: {
        order: "dzdxdy",
        label: "dz dx dy",
        innerVar: "z",
        midVar: "x",
        outerVar: "y",
        shadowPlane: "xy",
        shadowPlaneLabel: "xy-plane (z = 0)",
        outerRange: [0, 1.4],
        midMinExpr: "0",
        midMaxExpr: "1.4 - y",
        innerMinExpr: "0",
        innerMaxExpr: "1.4 - x - y",
        rayEntryExitLabel: "z enters at z = 0, exits at slanted plane z = 1.4 - x - y",
        shadowBoundsLabel: "Shadow in xy-plane: 0 ≤ y ≤ 1.4, 0 ≤ x ≤ 1.4 - y",
      },
      dydzdx: {
        order: "dydzdx",
        label: "dy dz dx",
        innerVar: "y",
        midVar: "z",
        outerVar: "x",
        shadowPlane: "xz",
        shadowPlaneLabel: "xz-plane (y = 0)",
        outerRange: [0, 1.4],
        midMinExpr: "0",
        midMaxExpr: "1.4 - x",
        innerMinExpr: "0",
        innerMaxExpr: "1.4 - x - z",
        rayEntryExitLabel: "y enters at y = 0, exits at plane y = 1.4 - x - z",
        shadowBoundsLabel: "Shadow in xz-plane: 0 ≤ x ≤ 1.4, 0 ≤ z ≤ 1.4 - x",
      },
      dydxdz: {
        order: "dydxdz",
        label: "dy dx dz",
        innerVar: "y",
        midVar: "x",
        outerVar: "z",
        shadowPlane: "xz",
        shadowPlaneLabel: "xz-plane (y = 0)",
        outerRange: [0, 1.4],
        midMinExpr: "0",
        midMaxExpr: "1.4 - z",
        innerMinExpr: "0",
        innerMaxExpr: "1.4 - x - z",
        rayEntryExitLabel: "y enters at y = 0, exits at plane y = 1.4 - x - z",
        shadowBoundsLabel: "Shadow in xz-plane: 0 ≤ z ≤ 1.4, 0 ≤ x ≤ 1.4 - z",
      },
      dxdzdy: {
        order: "dxdzdy",
        label: "dx dz dy",
        innerVar: "x",
        midVar: "z",
        outerVar: "y",
        shadowPlane: "yz",
        shadowPlaneLabel: "yz-plane (x = 0)",
        outerRange: [0, 1.4],
        midMinExpr: "0",
        midMaxExpr: "1.4 - y",
        innerMinExpr: "0",
        innerMaxExpr: "1.4 - y - z",
        rayEntryExitLabel: "x enters at x = 0, exits at plane x = 1.4 - y - z",
        shadowBoundsLabel: "Shadow in yz-plane: 0 ≤ y ≤ 1.4, 0 ≤ z ≤ 1.4 - y",
      },
      dxdydz: {
        order: "dxdydz",
        label: "dx dy dz",
        innerVar: "x",
        midVar: "y",
        outerVar: "z",
        shadowPlane: "yz",
        shadowPlaneLabel: "yz-plane (x = 0)",
        outerRange: [0, 1.4],
        midMinExpr: "0",
        midMaxExpr: "1.4 - z",
        innerMinExpr: "0",
        innerMaxExpr: "1.4 - y - z",
        rayEntryExitLabel: "x enters at x = 0, exits at plane x = 1.4 - y - z",
        shadowBoundsLabel: "Shadow in yz-plane: 0 ≤ z ≤ 1.4, 0 ≤ y ≤ 1.4 - z",
      },
    },
  },
  {
    id: "parabolic-wedge",
    name: "2. Parabolic Cylinder Tunnel (0 ≤ z ≤ 1 - y², 0 ≤ x ≤ 1)",
    shortLabel: "Parabolic Cylinder",
    badge: "Curved Roof z = 1 - y²",
    description:
      "A quarter-tunnel bounded above by the parabolic cylinder z = 1 - y² and over the unit square 0 ≤ x ≤ 1, 0 ≤ y ≤ 1. Switching between dz, dy, and dx changes the shadow from a square (xy) to a parabolic arch (yz)!",
    equationsLatex:
      "E = \\{(x,y,z) : 0 \\le x \\le 1,\\; 0 \\le y \\le 1,\\; 0 \\le z \\le 1 - y^2\\}",
    xyBaseXRange: [0, 1],
    orders: {
      dzdydx: {
        order: "dzdydx",
        label: "dz dy dx",
        innerVar: "z",
        midVar: "y",
        outerVar: "x",
        shadowPlane: "xy",
        shadowPlaneLabel: "xy-plane (Unit Square)",
        outerRange: [0, 1],
        midMinExpr: "0",
        midMaxExpr: "1",
        innerMinExpr: "0",
        innerMaxExpr: "1 - y^2",
        rayEntryExitLabel: "z enters at floor z = 0, exits at parabolic roof z = 1 - y²",
        shadowBoundsLabel: "Shadow in xy-plane: Unit square [0, 1] × [0, 1]",
      },
      dzdxdy: {
        order: "dzdxdy",
        label: "dz dx dy",
        innerVar: "z",
        midVar: "x",
        outerVar: "y",
        shadowPlane: "xy",
        shadowPlaneLabel: "xy-plane (Unit Square)",
        outerRange: [0, 1],
        midMinExpr: "0",
        midMaxExpr: "1",
        innerMinExpr: "0",
        innerMaxExpr: "1 - y^2",
        rayEntryExitLabel: "z enters at floor z = 0, exits at parabolic roof z = 1 - y²",
        shadowBoundsLabel: "Shadow in xy-plane: Unit square [0, 1] × [0, 1]",
      },
      dydzdx: {
        order: "dydzdx",
        label: "dy dz dx",
        innerVar: "y",
        midVar: "z",
        outerVar: "x",
        shadowPlane: "xz",
        shadowPlaneLabel: "xz-plane (Unit Square)",
        outerRange: [0, 1],
        midMinExpr: "0",
        midMaxExpr: "1",
        innerMinExpr: "0",
        innerMaxExpr: "sqrt(max(0, 1 - z))",
        rayEntryExitLabel: "y enters at y = 0, exits at inverted parabola y = √(1 - z)",
        shadowBoundsLabel: "Shadow in xz-plane: Unit square [0, 1] × [0, 1]",
      },
      dydxdz: {
        order: "dydxdz",
        label: "dy dx dz",
        innerVar: "y",
        midVar: "x",
        outerVar: "z",
        shadowPlane: "xz",
        shadowPlaneLabel: "xz-plane (Unit Square)",
        outerRange: [0, 1],
        midMinExpr: "0",
        midMaxExpr: "1",
        innerMinExpr: "0",
        innerMaxExpr: "sqrt(max(0, 1 - z))",
        rayEntryExitLabel: "y enters at y = 0, exits at inverted parabola y = √(1 - z)",
        shadowBoundsLabel: "Shadow in xz-plane: Unit square [0, 1] × [0, 1]",
      },
      dxdzdy: {
        order: "dxdzdy",
        label: "dx dz dy",
        innerVar: "x",
        midVar: "z",
        outerVar: "y",
        shadowPlane: "yz",
        shadowPlaneLabel: "yz-plane (Parabolic Arch)",
        outerRange: [0, 1],
        midMinExpr: "0",
        midMaxExpr: "1 - y^2",
        innerMinExpr: "0",
        innerMaxExpr: "1",
        rayEntryExitLabel: "x enters at back wall x = 0, exits at front wall x = 1",
        shadowBoundsLabel: "Shadow in yz-plane: Parabolic arch 0 ≤ y ≤ 1, 0 ≤ z ≤ 1 - y²",
      },
      dxdydz: {
        order: "dxdydz",
        label: "dx dy dz",
        innerVar: "x",
        midVar: "y",
        outerVar: "z",
        shadowPlane: "yz",
        shadowPlaneLabel: "yz-plane (Parabolic Arch)",
        outerRange: [0, 1],
        midMinExpr: "0",
        midMaxExpr: "sqrt(max(0, 1 - z))",
        innerMinExpr: "0",
        innerMaxExpr: "1",
        rayEntryExitLabel: "x enters at back wall x = 0, exits at front wall x = 1",
        shadowBoundsLabel: "Shadow in yz-plane: Parabolic arch 0 ≤ z ≤ 1, 0 ≤ y ≤ √(1 - z)",
      },
    },
  },
  {
    id: "paraboloid-cap",
    name: "3. First-Octant Paraboloid Bowl (x² + y² ≤ z ≤ 1)",
    shortLabel: "Paraboloid Bowl",
    badge: "Curved Bottom Surface",
    description:
      "Bounded below by the elliptic paraboloid z = x² + y² and above by the horizontal plane z = 1 in the first octant (x, y ≥ 0). Demonstrates a non-flat bottom entry surface u₁(x,y) = x² + y²!",
    equationsLatex:
      "E = \\{(x,y,z) : x \\ge 0,\\; y \\ge 0,\\; x^2 + y^2 \\le z \\le 1\\}",
    xyBaseXRange: [0, 1],
    orders: {
      dzdydx: {
        order: "dzdydx",
        label: "dz dy dx",
        innerVar: "z",
        midVar: "y",
        outerVar: "x",
        shadowPlane: "xy",
        shadowPlaneLabel: "xy-plane (Quarter Disk)",
        outerRange: [0, 1],
        midMinExpr: "0",
        midMaxExpr: "sqrt(max(0, 1 - x^2))",
        innerMinExpr: "x^2 + y^2",
        innerMaxExpr: "1",
        rayEntryExitLabel: "z enters on paraboloid z = x² + y², exits on flat lid z = 1",
        shadowBoundsLabel: "Shadow in xy-plane: Quarter disk x² + y² ≤ 1",
      },
      dzdxdy: {
        order: "dzdxdy",
        label: "dz dx dy",
        innerVar: "z",
        midVar: "x",
        outerVar: "y",
        shadowPlane: "xy",
        shadowPlaneLabel: "xy-plane (Quarter Disk)",
        outerRange: [0, 1],
        midMinExpr: "0",
        midMaxExpr: "sqrt(max(0, 1 - y^2))",
        innerMinExpr: "x^2 + y^2",
        innerMaxExpr: "1",
        rayEntryExitLabel: "z enters on paraboloid z = x² + y², exits on flat lid z = 1",
        shadowBoundsLabel: "Shadow in xy-plane: Quarter disk x² + y² ≤ 1",
      },
      dydzdx: {
        order: "dydzdx",
        label: "dy dz dx",
        innerVar: "y",
        midVar: "z",
        outerVar: "x",
        shadowPlane: "xz",
        shadowPlaneLabel: "xz-plane (Parabolic Spandrel)",
        outerRange: [0, 1],
        midMinExpr: "x^2",
        midMaxExpr: "1",
        innerMinExpr: "0",
        innerMaxExpr: "sqrt(max(0, z - x^2))",
        rayEntryExitLabel: "y enters at y = 0, exits on paraboloid wall y = √(z - x²)",
        shadowBoundsLabel: "Shadow in xz-plane: 0 ≤ x ≤ 1, x² ≤ z ≤ 1",
      },
      dydxdz: {
        order: "dydxdz",
        label: "dy dx dz",
        innerVar: "y",
        midVar: "x",
        outerVar: "z",
        shadowPlane: "xz",
        shadowPlaneLabel: "xz-plane (Parabolic Spandrel)",
        outerRange: [0, 1],
        midMinExpr: "0",
        midMaxExpr: "sqrt(max(0, z))",
        innerMinExpr: "0",
        innerMaxExpr: "sqrt(max(0, z - x^2))",
        rayEntryExitLabel: "y enters at y = 0, exits on paraboloid wall y = √(z - x²)",
        shadowBoundsLabel: "Shadow in xz-plane: 0 ≤ z ≤ 1, 0 ≤ x ≤ √z",
      },
      dxdzdy: {
        order: "dxdzdy",
        label: "dx dz dy",
        innerVar: "x",
        midVar: "z",
        outerVar: "y",
        shadowPlane: "yz",
        shadowPlaneLabel: "yz-plane (Parabolic Spandrel)",
        outerRange: [0, 1],
        midMinExpr: "y^2",
        midMaxExpr: "1",
        innerMinExpr: "0",
        innerMaxExpr: "sqrt(max(0, z - y^2))",
        rayEntryExitLabel: "x enters at x = 0, exits on paraboloid wall x = √(z - y²)",
        shadowBoundsLabel: "Shadow in yz-plane: 0 ≤ y ≤ 1, y² ≤ z ≤ 1",
      },
      dxdydz: {
        order: "dxdydz",
        label: "dx dy dz",
        innerVar: "x",
        midVar: "y",
        outerVar: "z",
        shadowPlane: "yz",
        shadowPlaneLabel: "yz-plane (Parabolic Spandrel)",
        outerRange: [0, 1],
        midMinExpr: "0",
        midMaxExpr: "sqrt(max(0, z))",
        innerMinExpr: "0",
        innerMaxExpr: "sqrt(max(0, z - y^2))",
        rayEntryExitLabel: "x enters at x = 0, exits on paraboloid wall x = √(z - y²)",
        shadowBoundsLabel: "Shadow in yz-plane: 0 ≤ z ≤ 1, 0 ≤ y ≤ √z",
      },
    },
  },
];

function mapOrderCoordsToXYZ(
  order: TripleOrder,
  outerVal: number,
  midVal: number,
  innerVal: number
): [number, number, number] {
  switch (order) {
    case "dzdydx":
      return [outerVal, midVal, innerVal];
    case "dzdxdy":
      return [midVal, outerVal, innerVal];
    case "dydzdx":
      return [outerVal, innerVal, midVal];
    case "dydxdz":
      return [midVal, innerVal, outerVal];
    case "dxdzdy":
      return [innerVal, outerVal, midVal];
    case "dxdydz":
      return [innerVal, midVal, outerVal];
  }
}

export function TripleIntegralOrderLab() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const renderLoopRef = useRef<DemandDrivenRenderLoopHandle | null>(null);
  const groupsRef = useRef<{
    solidGroup: THREE.Group;
    shadowGroup: THREE.Group;
    curtainGroup: THREE.Group;
    rayGroup: THREE.Group;
  } | null>(null);

  const [solidId, setSolidId] = useState<SolidId>("tetrahedron");
  const [order, setOrder] = useState<TripleOrder>("dzdydx");
  const [outerNorm, setOuterNorm] = useState<number>(0.38);
  const [midNorm, setMidNorm] = useState<number>(0.45);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showPartialSolid, setShowPartialSolid] = useState<boolean>(false);

  // User-editable math expression strings (seeded from active solid + order)
  const [integrandExpr, setIntegrandExpr] = useState<string>("1");
  const [outerMinExpr, setOuterMinExpr] = useState<string>("0");
  const [outerMaxExpr, setOuterMaxExpr] = useState<string>("1.4");
  const [midMinExpr, setMidMinExpr] = useState<string>("0");
  const [midMaxExpr, setMidMaxExpr] = useState<string>("1.4 - x");
  const [innerMinExpr, setInnerMinExpr] = useState<string>("0");
  const [innerMaxExpr, setInnerMaxExpr] = useState<string>("1.4 - x - y");

  const solid = useMemo(
    () => SOLID_PRESETS.find((s) => s.id === solidId) ?? SOLID_PRESETS[0],
    [solidId]
  );

  const spec = solid.orders[order];

  // Sync user-editable bound inputs whenever solidId or order changes
  useEffect(() => {
    setOuterMinExpr(String(spec.outerRange[0]));
    setOuterMaxExpr(String(spec.outerRange[1]));
    setMidMinExpr(spec.midMinExpr);
    setMidMaxExpr(spec.midMaxExpr);
    setInnerMinExpr(spec.innerMinExpr);
    setInnerMaxExpr(spec.innerMaxExpr);
  }, [spec]);

  // Compile user-typed expressions (fallbackValue = 0 so out-of-domain radicals evaluate to 0)
  const compiledIntegrand = useMemo(
    () => compileMathExpression(integrandExpr, ["x", "y", "z"], 0),
    [integrandExpr]
  );
  const compiledOuterMin = useMemo(
    () => compileMathExpression(outerMinExpr, [], 0),
    [outerMinExpr]
  );
  const compiledOuterMax = useMemo(
    () => compileMathExpression(outerMaxExpr, [], 1),
    [outerMaxExpr]
  );
  const compiledMidMin = useMemo(
    () => compileMathExpression(midMinExpr, [spec.outerVar], 0),
    [midMinExpr, spec.outerVar]
  );
  const compiledMidMax = useMemo(
    () => compileMathExpression(midMaxExpr, [spec.outerVar], 0),
    [midMaxExpr, spec.outerVar]
  );
  const compiledInnerMin = useMemo(
    () =>
      compileMathExpression(
        innerMinExpr,
        [spec.outerVar, spec.midVar],
        0
      ),
    [innerMinExpr, spec.outerVar, spec.midVar]
  );
  const compiledInnerMax = useMemo(
    () =>
      compileMathExpression(
        innerMaxExpr,
        [spec.outerVar, spec.midVar],
        0
      ),
    [innerMaxExpr, spec.outerVar, spec.midVar]
  );

  const outerRange = useMemo((): [number, number] => {
    const a = Math.max(-4, Math.min(4, compiledOuterMin.evaluate({})));
    const b = Math.max(a + 0.05, Math.min(4, compiledOuterMax.evaluate({})));
    return [a, b];
  }, [compiledOuterMin, compiledOuterMax]);

  const evalMidBounds = React.useCallback(
    (oVal: number): [number, number] => {
      const scope = { [spec.outerVar]: oVal };
      const m1 = Math.max(-4, Math.min(4, compiledMidMin.evaluate(scope)));
      const m2 = Math.max(m1, Math.min(4, compiledMidMax.evaluate(scope)));
      return [m1, m2];
    },
    [compiledMidMin, compiledMidMax, spec.outerVar]
  );

  const evalInnerBounds = React.useCallback(
    (oVal: number, mVal: number): [number, number] => {
      const scope = { [spec.outerVar]: oVal, [spec.midVar]: mVal };
      const i1 = Math.max(-4, Math.min(4, compiledInnerMin.evaluate(scope)));
      const i2 = Math.max(i1, Math.min(4, compiledInnerMax.evaluate(scope)));
      return [i1, i2];
    },
    [compiledInnerMin, compiledInnerMax, spec.outerVar, spec.midVar]
  );

  // Actual coordinate values for outer, mid, and inner bounds
  const coords = useMemo(() => {
    const [oMin, oMax] = outerRange;
    const outerVal = oMin + outerNorm * (oMax - oMin);
    const [mMin, mMax] = evalMidBounds(outerVal);
    const midVal = mMin + midNorm * Math.max(0, mMax - mMin);
    const [iMin, iMax] = evalInnerBounds(outerVal, midVal);
    return {
      outerVal,
      mMin,
      mMax,
      midVal,
      iMin,
      iMax,
      rayLength: Math.max(0, iMax - iMin),
    };
  }, [outerRange, outerNorm, midNorm, evalMidBounds, evalInnerBounds]);

  // Compute numerical Triple Integral ∭_E f(x,y,z) dV for the user's custom expressions
  const evaluatedTripleIntegral = useMemo(() => {
    const N = 14;
    const [oA, oB] = outerRange;
    const dOuter = (oB - oA) / N;
    let sum = 0;

    for (let i = 0; i < N; i++) {
      const oVal = oA + (i + 0.5) * dOuter;
      const [m1, m2] = evalMidBounds(oVal);
      if (m2 <= m1) continue;
      const dMid = (m2 - m1) / N;

      for (let j = 0; j < N; j++) {
        const mVal = m1 + (j + 0.5) * dMid;
        const [in1, in2] = evalInnerBounds(oVal, mVal);
        if (in2 <= in1) continue;
        const dIn = (in2 - in1) / N;

        for (let k = 0; k < N; k++) {
          const inVal = in1 + (k + 0.5) * dIn;
          const [x, y, z] = mapOrderCoordsToXYZ(order, oVal, mVal, inVal);
          const fVal = compiledIntegrand.evaluate({ x, y, z });
          sum += fVal * dOuter * dMid * dIn;
        }
      }
    }
    return sum;
  }, [outerRange, evalMidBounds, evalInnerBounds, order, compiledIntegrand]);

  // Animate outer & middle sweep when playing
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = (now - prev) / 1000;
      prev = now;
      setMidNorm((m) => {
        const nextM = m + dt * 0.45;
        if (nextM > 0.94) {
          setOuterNorm((o) => (o + 0.14 > 0.92 ? 0.12 : o + 0.14));
          return 0.08;
        }
        return nextM;
      });
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Initialize Three.js 3D Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 410;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1E1F22");

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.6, 2.05, 2.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.55, 0.5, 0.55);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.4;
    controls.maxDistance = 7;

    scene.add(new THREE.AmbientLight(0xfffbe4, 0.78));
    const dirLight = new THREE.DirectionalLight(0xfffbe4, 0.75);
    dirLight.position.set(3, 5, 2.5);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(1.8, 9, 0xaaa36d, 0x32353d);
    grid.position.set(0.7, 0, 0.7);
    scene.add(grid);

    const addAxis = (to: [number, number, number], hex: string) => {
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...to),
      ]);
      scene.add(
        new THREE.Line(geom, new THREE.LineBasicMaterial({ color: hex }))
      );
    };
    addAxis([1.65, 0, 0], "#8D9FCE");
    addAxis([0, 0, 1.65], "#96B898");
    addAxis([0, 1.65, 0], "#029091");

    const solidGroup = new THREE.Group();
    const shadowGroup = new THREE.Group();
    const curtainGroup = new THREE.Group();
    const rayGroup = new THREE.Group();
    scene.add(solidGroup);
    scene.add(shadowGroup);
    scene.add(curtainGroup);
    scene.add(rayGroup);

    groupsRef.current = {
      solidGroup,
      shadowGroup,
      curtainGroup,
      rayGroup,
    };

    const renderLoop = createDemandDrivenRenderLoop({
      container,
      renderer,
      scene,
      camera,
      controls,
    });
    renderLoopRef.current = renderLoop;
    renderLoop.requestRender(3);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 560;
      const h = container.clientHeight || 410;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderLoop.requestRender(2);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderLoop.dispose();
      renderLoopRef.current = null;
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Rebuild 3D Solid Shell directly from the user's active bounds
  useEffect(() => {
    const groups = groupsRef.current;
    if (!groups) return;
    const { solidGroup } = groups;

    while (solidGroup.children.length > 0) {
      const c = solidGroup.children[0] as THREE.Mesh;
      if (c.geometry) c.geometry.dispose();
      solidGroup.remove(c);
    }

    const nO = 44;
    const nM = 44;
    const topPos: number[] = [];
    const botPos: number[] = [];
    const indices: number[] = [];

    const [oA, oB] = outerRange;
    for (let i = 0; i <= nO; i++) {
      const oVal = oA + (i / nO) * (oB - oA);
      const [m1, m2] = evalMidBounds(oVal);
      for (let j = 0; j <= nM; j++) {
        const mVal = m1 + (j / nM) * (m2 - m1);
        const [in1, in2] = evalInnerBounds(oVal, mVal);
        const pTop = mapOrderCoordsToXYZ(order, oVal, mVal, in2);
        const pBot = mapOrderCoordsToXYZ(order, oVal, mVal, in1);
        // Math (x, y, z) -> Three (x, z, y)
        topPos.push(pTop[0], pTop[2], pTop[1]);
        botPos.push(pBot[0], pBot[2], pBot[1]);
      }
    }

    for (let i = 0; i < nO; i++) {
      for (let j = 0; j < nM; j++) {
        const a = i * (nM + 1) + j;
        const b = (i + 1) * (nM + 1) + j;
        const c = (i + 1) * (nM + 1) + (j + 1);
        const d = i * (nM + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const topGeom = new THREE.BufferGeometry();
    topGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(topPos, 3)
    );
    topGeom.setIndex(indices);
    topGeom.computeVertexNormals();

    solidGroup.add(
      new THREE.Mesh(
        topGeom,
        new THREE.MeshLambertMaterial({
          color: "#029091",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: showPartialSolid ? 0.18 : 0.34,
        })
      )
    );
    solidGroup.add(
      new THREE.Mesh(
        topGeom,
        new THREE.MeshBasicMaterial({
          color: "#FFFBE4",
          wireframe: true,
          transparent: true,
          opacity: 0.12,
        })
      )
    );

    if (innerMinExpr.trim() !== "0") {
      const botGeom = new THREE.BufferGeometry();
      botGeom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(botPos, 3)
      );
      botGeom.setIndex(indices);
      botGeom.computeVertexNormals();
      solidGroup.add(
        new THREE.Mesh(
          botGeom,
          new THREE.MeshLambertMaterial({
            color: "#D5658B",
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.32,
          })
        )
      );
    }
    renderLoopRef.current?.requestRender(2);
  }, [
    outerRange,
    order,
    evalMidBounds,
    evalInnerBounds,
    innerMinExpr,
    showPartialSolid,
  ]);

  // Update 2D Shadow Projection on Coordinate Wall, 2D Middle Curtain, and 1D Inner Pillar Ray
  useEffect(() => {
    const groups = groupsRef.current;
    if (!groups) return;
    const { shadowGroup, curtainGroup, rayGroup } = groups;

    const clearGroup = (grp: THREE.Group) => {
      while (grp.children.length > 0) {
        const c = grp.children[0] as THREE.Mesh;
        if (c.geometry) c.geometry.dispose();
        grp.remove(c);
      }
    };
    clearGroup(shadowGroup);
    clearGroup(curtainGroup);
    clearGroup(rayGroup);

    const nS = 32;
    const shadowVerts: number[] = [];
    const shadowIdx: number[] = [];
    const [oA, oB] = outerRange;

    for (let i = 0; i <= nS; i++) {
      const oVal = oA + (i / nS) * (oB - oA);
      const [m1, m2] = evalMidBounds(oVal);
      for (let j = 0; j <= nS; j++) {
        const mVal = m1 + (j / nS) * (m2 - m1);
        const [x, y, z] = mapOrderCoordsToXYZ(order, oVal, mVal, 0);
        const sx = spec.shadowPlane === "yz" ? 0.003 : x;
        const sy = spec.shadowPlane === "xz" ? 0.003 : y;
        const sz = spec.shadowPlane === "xy" ? 0.003 : z;
        shadowVerts.push(sx, sz, sy);
      }
    }

    for (let i = 0; i < nS; i++) {
      for (let j = 0; j < nS; j++) {
        const a = i * (nS + 1) + j;
        const b = (i + 1) * (nS + 1) + j;
        const c = (i + 1) * (nS + 1) + (j + 1);
        const d = i * (nS + 1) + (j + 1);
        shadowIdx.push(a, b, d);
        shadowIdx.push(b, c, d);
      }
    }

    const shadowGeom = new THREE.BufferGeometry();
    shadowGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(shadowVerts, 3)
    );
    shadowGeom.setIndex(shadowIdx);
    shadowGroup.add(
      new THREE.Mesh(
        shadowGeom,
        new THREE.MeshBasicMaterial({
          color: "#96B898",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.34,
        })
      )
    );

    const steps = 40;
    const curtVerts: number[] = [];
    const curtIdx: number[] = [];
    const { outerVal, mMin, mMax, midVal, iMin, iMax } = coords;

    for (let i = 0; i <= steps; i++) {
      const m = mMin + (i / steps) * (mMax - mMin);
      const [in1, in2] = evalInnerBounds(outerVal, m);
      const p1 = mapOrderCoordsToXYZ(order, outerVal, m, in1);
      const p2 = mapOrderCoordsToXYZ(order, outerVal, m, in2);
      curtVerts.push(p1[0], p1[2], p1[1]);
      curtVerts.push(p2[0], p2[2], p2[1]);
    }

    for (let i = 0; i < steps; i++) {
      const b0 = 2 * i;
      const t0 = 2 * i + 1;
      const b1 = 2 * (i + 1);
      const t1 = 2 * (i + 1) + 1;
      curtIdx.push(b0, t0, b1);
      curtIdx.push(t0, t1, b1);
    }

    const curtGeom = new THREE.BufferGeometry();
    curtGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(curtVerts, 3)
    );
    curtGeom.setIndex(curtIdx);
    curtGeom.computeVertexNormals();

    curtainGroup.add(
      new THREE.Mesh(
        curtGeom,
        new THREE.MeshBasicMaterial({
          color: "#D35323",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.56,
        })
      )
    );

    const rayStartMath = mapOrderCoordsToXYZ(order, outerVal, midVal, iMin);
    const rayEndMath = mapOrderCoordsToXYZ(order, outerVal, midVal, iMax);
    const vStart = new THREE.Vector3(
      rayStartMath[0],
      rayStartMath[2],
      rayStartMath[1]
    );
    const vEnd = new THREE.Vector3(
      rayEndMath[0],
      rayEndMath[2],
      rayEndMath[1]
    );

    const rayVec = new THREE.Vector3().subVectors(vEnd, vStart);
    const len = rayVec.length();
    if (len > 0.005) {
      const cylGeom = new THREE.CylinderGeometry(0.024, 0.024, len, 12);
      const cylMat = new THREE.MeshBasicMaterial({ color: "#FBEAA4" });
      const cylMesh = new THREE.Mesh(cylGeom, cylMat);
      cylMesh.position.copy(vStart).addScaledVector(rayVec, 0.5);
      cylMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        rayVec.clone().normalize()
      );
      rayGroup.add(cylMesh);
    }

    const sphereGeom = new THREE.SphereGeometry(0.044, 16, 16);
    const entrySphere = new THREE.Mesh(
      sphereGeom,
      new THREE.MeshBasicMaterial({ color: "#D5658B" })
    );
    entrySphere.position.copy(vStart);
    rayGroup.add(entrySphere);

    const exitSphere = new THREE.Mesh(
      sphereGeom,
      new THREE.MeshBasicMaterial({ color: "#B95869" })
    );
    exitSphere.position.copy(vEnd);
    rayGroup.add(exitSphere);
    renderLoopRef.current?.requestRender(2);
  }, [spec, outerRange, order, coords, evalMidBounds, evalInnerBounds]);

  // Build 2D SVG for the Orthographic Shadow Projection D
  const shadowSvg = useMemo(() => {
    const N = 45;
    const [oA, oB] = outerRange;
    let maxCoord = Math.max(1.0, Math.abs(oA), Math.abs(oB));
    for (let i = 0; i <= N; i++) {
      const o = oA + (i / N) * (oB - oA);
      const [m1, m2] = evalMidBounds(o);
      maxCoord = Math.max(maxCoord, Math.abs(m1), Math.abs(m2));
    }

    const scale = 150 / Math.max(0.25, maxCoord);
    const toSvg = (horiz: number, vert: number): [number, number] => [
      32 + horiz * scale,
      175 - vert * scale,
    ];

    const lowerPts: [number, number][] = [];
    const upperPts: [number, number][] = [];

    for (let i = 0; i <= N; i++) {
      const o = oA + (i / N) * (oB - oA);
      const [m1, m2] = evalMidBounds(o);
      lowerPts.push(toSvg(o, m1));
      upperPts.push(toSvg(o, m2));
    }

    const polyPoints = [...lowerPts, ...upperPts.slice().reverse()]
      .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
      .join(" ");

    const stripBottom = toSvg(coords.outerVal, coords.mMin);
    const stripTop = toSvg(coords.outerVal, coords.mMax);
    const rayFootprint = toSvg(coords.outerVal, coords.midVal);

    return {
      polyPoints,
      stripBottom,
      stripTop,
      rayFootprint,
    };
  }, [outerRange, coords, evalMidBounds]);

  const dynamicTripleLatex = `\\int_{\\textcolor{#8D9FCE}{${compiledOuterMin.tex}}}^{\\textcolor{#8D9FCE}{${compiledOuterMax.tex}}} \\int_{\\textcolor{#96B898}{${compiledMidMin.tex}}}^{\\textcolor{#96B898}{${compiledMidMax.tex}}} \\int_{\\textcolor{#D5658B}{${compiledInnerMin.tex}}}^{\\textcolor{#B95869}{${compiledInnerMax.tex}}} \\left(${compiledIntegrand.tex}\\right)\\,\\textcolor{#FBEAA4}{d${spec.innerVar}}\\,\\textcolor{#96B898}{d${spec.midVar}}\\,\\textcolor{#8D9FCE}{d${spec.outerVar}} \\approx \\textcolor{#FBEAA4}{${evaluatedTripleIntegral.toFixed(
    4
  )}}`;

  return (
    <section
      id="three-stage-collapse"
      className="border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 sm:p-6 space-y-6 scroll-mt-24"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)]">
            <Box className="w-4 h-4" aria-hidden="true" />
            <span>
              Interactive Laboratory 02.1 – 02.3 • 3-Stage Collapse &amp; All 6
              Orders
            </span>
          </div>
          <h2 className="font-math-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            1D Inner Ray → 2D Shadow Curtain → 3D Solid across All 6 Orders
          </h2>
          <p className="font-math-serif text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl">
            Select any of the <strong>6 integration orders</strong> or type your
            own custom 3D bounding surfaces, 2D shadow curves, outer limits, and
            integrand below! Watch how the innermost differential shoots a{" "}
            <strong>1D ray</strong>, projects a <strong>2D shadow</strong> onto
            the coordinate wall, and sweeps a <strong>2D curtain</strong>.
          </p>
        </div>

        <div className="border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 py-2 text-xs font-tabular-mono space-y-0.5">
          <span className="text-[10px] uppercase text-[var(--text-muted)] block">
            Evaluated Triple Integral ∭ f dV
          </span>
          <span className="text-sm font-semibold text-[var(--math-ink-diff)]">
            {evaluatedTripleIntegral.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Top Row: 3D Solid Preset Selector + 6-Order Permutation Selector */}
      <div
        id="six-orders-of-integration"
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 scroll-mt-24"
      >
        <div className="lg:col-span-5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2">
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
            1. Select 3D Bounded Solid Preset:
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {SOLID_PRESETS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSolidId(s.id);
                  setOuterNorm(0.38);
                  setMidNorm(0.45);
                }}
                className={`px-3 py-2 border text-left transition-colors cursor-pointer flex items-center justify-between ${
                  solidId === s.id
                    ? "border-[var(--border-strong)] bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="text-xs font-math-serif">{s.name}</span>
                <span className="text-[10px] font-tabular-mono text-[var(--math-ink-z)] shrink-0 ml-2">
                  {s.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)]">
              2. Select Any of the 6 Permutations of dV:
            </span>
            <span className="text-xs font-tabular-mono text-[var(--math-ink-diff)]">
              Inner ({spec.innerVar}) → Middle ({spec.midVar}) → Outer (
              {spec.outerVar})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ORDER_METADATA.map((item) => {
              const active = item.id === order;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOrder(item.id)}
                  className={`p-2.5 border transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    active
                      ? "border-[var(--border-strong)] bg-[var(--bg-panel-elevated)] text-[var(--text-primary)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <div
                    className={`text-sm ${
                      active ? "text-[var(--math-ink-diff)] font-semibold" : ""
                    }`}
                  >
                    <KaTeXMath math={item.tex} />
                  </div>
                  <span className="text-[10px] font-tabular-mono text-[var(--text-muted)]">
                    Shadow: {item.shadow}-plane
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-tabular-mono text-[var(--text-secondary)] pt-1 flex flex-wrap items-center justify-between gap-2">
            <span>Shadow Wall: {spec.shadowPlaneLabel}</span>
            <span className="text-[var(--math-ink-lower)]">{spec.rayEntryExitLabel}</span>
          </div>
        </div>
      </div>

      {/* Custom Math Typing Composer for All 6 Triple Integral Bounds & Integrand */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3">
        <MathExpressionInput
          label="1. Integrand Function f(x, y, z):"
          value={integrandExpr}
          onChange={setIntegrandExpr}
          allowedVars={["x", "y", "z"]}
          prefixLatex="f(x,y,z) ="
          placeholder="1"
          accentHex="#8D9FCE"
          compact
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          <MathExpressionInput
            label={`2. Outer Lower Limit (${spec.outerVar}_min):`}
            value={outerMinExpr}
            onChange={setOuterMinExpr}
            allowedVars={[]}
            prefixLatex={`${spec.outerVar}_{\\min} =`}
            placeholder="0"
            accentHex="#8D9FCE"
            compact
          />
          <MathExpressionInput
            label={`3. Outer Upper Limit (${spec.outerVar}_max):`}
            value={outerMaxExpr}
            onChange={setOuterMaxExpr}
            allowedVars={[]}
            prefixLatex={`${spec.outerVar}_{\\max} =`}
            placeholder="1.4"
            accentHex="#8D9FCE"
            compact
          />
          <MathExpressionInput
            label={`4. 2D Shadow Lower Curve (${spec.midVar}_min):`}
            value={midMinExpr}
            onChange={setMidMinExpr}
            allowedVars={[spec.outerVar]}
            prefixLatex={`${spec.midVar}_1 =`}
            placeholder="0"
            accentHex="#96B898"
            compact
          />
          <MathExpressionInput
            label={`5. 2D Shadow Upper Curve (${spec.midVar}_max):`}
            value={midMaxExpr}
            onChange={setMidMaxExpr}
            allowedVars={[spec.outerVar]}
            prefixLatex={`${spec.midVar}_2 =`}
            placeholder="1.4 - x"
            accentHex="#96B898"
            compact
          />
          <MathExpressionInput
            label={`6. Inner Lower Entry Surface (${spec.innerVar}_min):`}
            value={innerMinExpr}
            onChange={setInnerMinExpr}
            allowedVars={[spec.outerVar, spec.midVar]}
            prefixLatex={`${spec.innerVar}_1 =`}
            placeholder="0"
            accentHex="#D5658B"
            compact
          />
          <MathExpressionInput
            label={`7. Inner Upper Exit Surface (${spec.innerVar}_max):`}
            value={innerMaxExpr}
            onChange={setInnerMaxExpr}
            allowedVars={[spec.outerVar, spec.midVar]}
            prefixLatex={`${spec.innerVar}_2 =`}
            placeholder="1.4 - x - y"
            accentHex="#B95869"
            compact
          />
        </div>
      </div>

      {/* Main Split Viewports: Left 3D Solid/Ray/Curtain + Right 2D Shadow Projection & Sliders */}
      <div
        id="shadow-projection"
        className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch scroll-mt-24"
      >
        {/* Left: 3D WebGL Solid + Ray + Curtain */}
        <figure className="lg:col-span-7 border border-[var(--border-subtle)] bg-[#1E1F22] flex flex-col justify-between relative">
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[#25272C] border border-[#383B43] text-[11px] font-tabular-mono text-[#FFFBE4] flex items-center gap-3">
            <span>3D Solid E, 2D Curtain &amp; 1D Ray</span>
            <span className="text-[#8D9FCE]">x</span>
            <span className="text-[#96B898]">y</span>
            <span className="text-[#28B7B8]">z</span>
          </div>

          <div ref={mountRef} className="w-full h-[410px] cursor-grab" />

          <figcaption className="px-3.5 py-2.5 border-t border-[#383B43] bg-[#25272C] flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono text-[#CCC8B8]">
            <span>
              1D Ray ({spec.innerVar}):{" "}
              <strong className="text-[#FBEAA4]">
                [{coords.iMin.toFixed(2)}, {coords.iMax.toFixed(2)}]
              </strong>
            </span>
            <span>
              Middle ({spec.midVar}):{" "}
              <strong className="text-[#96B898]">
                {coords.midVal.toFixed(2)} ∈ [{coords.mMin.toFixed(2)},{" "}
                {coords.mMax.toFixed(2)}]
              </strong>
            </span>
            <span>
              Outer ({spec.outerVar}):{" "}
              <strong className="text-[#8D9FCE]">
                {coords.outerVal.toFixed(2)}
              </strong>
            </span>
          </figcaption>
        </figure>

        {/* Right: 2D Shadow Wall Projection SVG + 2-Stage Scrubber Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <figure className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs font-tabular-mono mb-2">
              <span className="text-[var(--math-ink-y)] font-semibold">
                2D Projected Shadow ({spec.shadowPlane}-plane)
              </span>
              <span className="text-[var(--text-muted)]">
                Ray Footprint • ({spec.outerVar}, {spec.midVar})
              </span>
            </div>

            <svg
              viewBox="0 0 215 195"
              className="w-full max-w-[250px] h-auto"
              role="img"
              aria-label={`2D shadow projection onto the ${spec.shadowPlane}-plane`}
            >
              <polygon
                points={shadowSvg.polyPoints}
                fill="#96B898"
                fillOpacity="0.26"
                stroke="#96B898"
                strokeWidth="2"
              />

              <line
                x1={shadowSvg.stripBottom[0]}
                y1={shadowSvg.stripBottom[1]}
                x2={shadowSvg.stripTop[0]}
                y2={shadowSvg.stripTop[1]}
                stroke="#D35323"
                strokeWidth="3.5"
              />

              <circle
                cx={shadowSvg.rayFootprint[0]}
                cy={shadowSvg.rayFootprint[1]}
                r={5.5}
                fill="#FBEAA4"
                stroke="#1E1F22"
                strokeWidth="1.5"
              />

              <line
                x1={32}
                y1={175}
                x2={198}
                y2={175}
                stroke="#8D9FCE"
                strokeWidth="1.5"
              />
              <line
                x1={32}
                y1={175}
                x2={32}
                y2={15}
                stroke="#96B898"
                strokeWidth="1.5"
              />
              <text
                x={201}
                y={178}
                fill="var(--math-ink-x)"
                fontSize="11"
                fontFamily="monospace"
              >
                {spec.outerVar}
              </text>
              <text
                x={27}
                y={12}
                fill="var(--math-ink-y)"
                fontSize="11"
                fontFamily="monospace"
              >
                {spec.midVar}
              </text>
            </svg>

            <figcaption className="w-full text-xs font-tabular-mono text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span>Yellow dot = 1D {spec.innerVar}-ray piercing E</span>
              <span className="text-[var(--math-ink-sweep)]">
                Orange strip = 2D d{spec.midVar} curtain
              </span>
            </figcaption>
          </figure>

          {/* Scrubber Controls for Outer & Middle Variables */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-tabular-mono">
              <span className="uppercase text-[var(--text-muted)]">
                3-Stage Collapse Controls
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="px-2.5 py-1 border border-[var(--border-strong)] bg-[var(--bg-panel)] text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3 text-[var(--math-ink-diff)]" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-[var(--math-ink-y)]" />
                      <span>Auto-Sweep</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Reset slice positions"
                  onClick={() => {
                    setIsPlaying(false);
                    setOuterNorm(0.38);
                    setMidNorm(0.45);
                  }}
                  className="min-w-[24px] min-h-[24px] inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="triple-outer-slider"
                className="text-xs font-tabular-mono text-[var(--math-ink-x)] block"
              >
                Outer Slice Position ({spec.outerVar} ={" "}
                {coords.outerVal.toFixed(2)}) — Sweeps 2D Curtain
              </label>
              <input
                id="triple-outer-slider"
                type="range"
                min={0.05}
                max={0.93}
                step={0.01}
                value={outerNorm}
                onChange={(e) => {
                  setIsPlaying(false);
                  setOuterNorm(parseFloat(e.target.value));
                }}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="triple-mid-slider"
                className="text-xs font-tabular-mono text-[var(--math-ink-y)] block"
              >
                Middle Ray Position ({spec.midVar} = {coords.midVal.toFixed(2)})
                — Sweeps 1D {spec.innerVar}-Ray
              </label>
              <input
                id="triple-mid-slider"
                type="range"
                min={0.05}
                max={0.95}
                step={0.01}
                value={midNorm}
                onChange={(e) => {
                  setIsPlaying(false);
                  setMidNorm(parseFloat(e.target.value));
                }}
                className="w-full cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-tabular-mono text-[var(--text-secondary)] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={showPartialSolid}
                onChange={(e) => setShowPartialSolid(e.target.checked)}
              />
              <span>Ghost Outer Shell for Clearer Interior Ray Inspection</span>
            </label>
          </div>
        </div>
      </div>

      {/* Live Color-Coded Triple Integral Equation Box */}
      <div className="border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tabular-mono">
          <span className="uppercase text-[var(--text-muted)]">
            Active Iterated Triple Integral ({spec.label})
          </span>
          <span className="text-[var(--math-ink-y)]">{spec.shadowBoundsLabel}</span>
        </div>
        <KaTeXMath math={dynamicTripleLatex} block />
      </div>

      {/* Pedagogical Step-by-Step Disclosure */}
      <div className="space-y-2.5">
        <details
          open
          className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
        >
          <summary className="px-4 py-3 text-sm font-math-serif font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)]">
            <ChevronDown
              className="w-4 h-4 text-[var(--math-ink-z)] shrink-0"
              aria-hidden="true"
            />
            <span>
              How to Determine All 6 Limits for {solid.shortLabel} in Order (
              {spec.label})
            </span>
          </summary>
          <div className="px-4 pb-4 pt-2 border-t border-[var(--border-subtle)] space-y-2 text-sm font-math-serif text-[var(--text-secondary)] leading-relaxed">
            <p>{solid.description}</p>
            <div className="p-3 bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
              <KaTeXMath math={solid.equationsLatex} block />
            </div>
            <ul className="space-y-1 text-xs font-tabular-mono pt-1">
              <li className="text-[var(--math-ink-diff)]">
                • Step 1 (Innermost d{spec.innerVar}): {spec.rayEntryExitLabel}
              </li>
              <li className="text-[var(--math-ink-y)]">
                • Step 2 &amp; 3 (2D Shadow in {spec.shadowPlane}-plane):{" "}
                {spec.shadowBoundsLabel}
              </li>
            </ul>
          </div>
        </details>
      </div>
    </section>
  );
}
