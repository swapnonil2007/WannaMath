/**
 * Shared Numerical Quadrature & Differential Operators for WannaMath Laboratories.
 */

const GAUSS_5_NODES = [
  -0.906179845938664,
  -0.5384693101056831,
  0.0,
  0.5384693101056831,
  0.906179845938664,
];

const GAUSS_5_WEIGHTS = [
  0.2369268850561891,
  0.4786286704993665,
  0.5688888888888889,
  0.4786286704993665,
  0.2369268850561891,
];

/**
 * 1D Composite 5-Point Gauss-Legendre Quadrature over [a, b].
 */
export function integrate1DGaussLegendre(
  fn: (x: number) => number,
  a: number,
  b: number,
  subIntervals = 12
): number {
  if (Math.abs(b - a) < 1e-12) return 0;
  const sign = b >= a ? 1 : -1;
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  const step = (high - low) / subIntervals;
  let total = 0;

  for (let i = 0; i < subIntervals; i++) {
    const x0 = low + i * step;
    const x1 = x0 + step;
    const half = 0.5 * (x1 - x0);
    const mid = 0.5 * (x0 + x1);
    let subSum = 0;
    for (let k = 0; k < 5; k++) {
      const val = fn(mid + half * GAUSS_5_NODES[k]);
      if (Number.isFinite(val)) {
        subSum += GAUSS_5_WEIGHTS[k] * val;
      }
    }
    total += half * subSum;
  }

  return sign * total;
}

/**
 * 2D Iterated Midpoint Quadrature over u in [uMin, uMax], v in [vMin(u), vMax(u)].
 */
export function integrate2DIterated(
  fn: (u: number, v: number) => number,
  uMin: number,
  uMax: number,
  vMinFn: (u: number) => number,
  vMaxFn: (u: number) => number,
  Nu = 32,
  Nv = 32
): number {
  const du = (uMax - uMin) / Nu;
  if (Math.abs(du) < 1e-12) return 0;
  let sum = 0;

  for (let i = 0; i < Nu; i++) {
    const u = uMin + (i + 0.5) * du;
    const v1 = vMinFn(u);
    const v2 = vMaxFn(u);
    const dv = (v2 - v1) / Nv;
    if (Math.abs(dv) < 1e-12) continue;

    for (let j = 0; j < Nv; j++) {
      const v = v1 + (j + 0.5) * dv;
      const fVal = fn(u, v);
      if (Number.isFinite(fVal)) {
        sum += fVal * du * dv;
      }
    }
  }

  return sum;
}

/**
 * 3D Iterated Midpoint Quadrature over u in [uMin, uMax], v in [vMin(u), vMax(u)], w in [wMin(u,v), wMax(u,v)].
 */
export function integrate3DIterated(
  fn: (u: number, v: number, w: number) => number,
  uMin: number,
  uMax: number,
  vMinFn: (u: number) => number,
  vMaxFn: (u: number) => number,
  wMinFn: (u: number, v: number) => number,
  wMaxFn: (u: number, v: number) => number,
  Nu = 16,
  Nv = 16,
  Nw = 16
): number {
  const du = (uMax - uMin) / Nu;
  if (Math.abs(du) < 1e-12) return 0;
  let sum = 0;

  for (let i = 0; i < Nu; i++) {
    const u = uMin + (i + 0.5) * du;
    const v1 = vMinFn(u);
    const v2 = vMaxFn(u);
    const dv = (v2 - v1) / Nv;
    if (Math.abs(dv) < 1e-12) continue;

    for (let j = 0; j < Nv; j++) {
      const v = v1 + (j + 0.5) * dv;
      const w1 = wMinFn(u, v);
      const w2 = wMaxFn(u, v);
      const dw = (w2 - w1) / Nw;
      if (Math.abs(dw) < 1e-12) continue;

      for (let k = 0; k < Nw; k++) {
        const w = w1 + (k + 0.5) * dw;
        const fVal = fn(u, v, w);
        if (Number.isFinite(fVal)) {
          sum += fVal * du * dv * dw;
        }
      }
    }
  }

  return sum;
}

/**
 * Central finite-difference 2D gradient and second-order partial derivatives at (x0, y0).
 */
export function computePartialDerivatives2D(
  fn: (x: number, y: number) => number,
  x0: number,
  y0: number,
  h = 1e-4
): {
  f0: number;
  fx: number;
  fy: number;
  fxx: number;
  fyy: number;
  fxy: number;
  gradMagnitude: number;
} {
  const f0 = fn(x0, y0);
  const fx = (fn(x0 + h, y0) - fn(x0 - h, y0)) / (2 * h);
  const fy = (fn(x0, y0 + h) - fn(x0, y0 - h)) / (2 * h);
  const fxx = (fn(x0 + h, y0) - 2 * f0 + fn(x0 - h, y0)) / (h * h);
  const fyy = (fn(x0, y0 + h) - 2 * f0 + fn(x0, y0 - h)) / (h * h);
  const fxy =
    (fn(x0 + h, y0 + h) -
      fn(x0 + h, y0 - h) -
      fn(x0 - h, y0 + h) +
      fn(x0 - h, y0 - h)) /
    (4 * h * h);

  return {
    f0,
    fx,
    fy,
    fxx,
    fyy,
    fxy,
    gradMagnitude: Math.hypot(fx, fy),
  };
}

/**
 * Central finite-difference partial derivatives and gradient vector for a 3D scalar field φ(x, y, z).
 */
export function computePartialDerivatives3D(
  fn: (x: number, y: number, z: number) => number,
  x0: number,
  y0: number,
  z0: number,
  h = 1e-4
): {
  f0: number;
  fx: number;
  fy: number;
  fz: number;
  gradMagnitude: number;
} {
  const f0 = fn(x0, y0, z0);
  const fx = (fn(x0 + h, y0, z0) - fn(x0 - h, y0, z0)) / (2 * h);
  const fy = (fn(x0, y0 + h, z0) - fn(x0, y0 - h, z0)) / (2 * h);
  const fz = (fn(x0, y0, z0 + h) - fn(x0, y0, z0 - h)) / (2 * h);

  return {
    f0,
    fx,
    fy,
    fz,
    gradMagnitude: Math.hypot(fx, fy, fz),
  };
}

/**
 * Central finite-difference 2x2 Jacobian matrix and determinant at (u0, v0).
 */
export function computeJacobian2D(
  xFn: (u: number, v: number) => number,
  yFn: (u: number, v: number) => number,
  u0: number,
  v0: number,
  h = 1e-5
): {
  dxdu: number;
  dxdv: number;
  dydu: number;
  dydv: number;
  detJ: number;
  absDetJ: number;
} {
  const dxdu = (xFn(u0 + h, v0) - xFn(u0 - h, v0)) / (2 * h);
  const dxdv = (xFn(u0, v0 + h) - xFn(u0, v0 - h)) / (2 * h);
  const dydu = (yFn(u0 + h, v0) - yFn(u0 - h, v0)) / (2 * h);
  const dydv = (yFn(u0, v0 + h) - yFn(u0, v0 - h)) / (2 * h);
  const detJ = dxdu * dydv - dxdv * dydu;
  return { dxdu, dxdv, dydu, dydv, detJ, absDetJ: Math.abs(detJ) };
}

const LANCZOS_G = 7;
const LANCZOS_COEFFS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];

/**
 * Computes Euler's Gamma function Γ(z) for real z (with reflection for z < 0.5).
 * Returns NaN at non-positive integer poles (0, -1, -2, ...).
 */
export function gammaReal(z: number): number {
  if (!Number.isFinite(z)) return NaN;
  if (z <= 0 && Math.abs(z - Math.round(z)) < 1e-9) {
    return NaN;
  }
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gammaReal(1 - z));
  }
  const shifted = z - 1;
  let x = LANCZOS_COEFFS[0];
  for (let i = 1; i < LANCZOS_G + 2; i++) {
    x += LANCZOS_COEFFS[i] / (shifted + i);
  }
  const t = shifted + LANCZOS_G + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, shifted + 0.5) * Math.exp(-t) * x;
}

/**
 * Computes Euler's Beta function B(p, q) = Γ(p)Γ(q) / Γ(p + q) for p, q > 0.
 */
export function betaReal(p: number, q: number): number {
  if (p <= 0 || q <= 0) return NaN;
  return (gammaReal(p) * gammaReal(q)) / gammaReal(p + q);
}
