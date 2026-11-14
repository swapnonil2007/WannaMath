/**
 * Shared descriptive, sampling, and inferential math utilities for
 * Volume S (Interactive Statistics). Pure TypeScript, zero runtime deps.
 */

export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleNormal(
  rng: () => number,
  mean = 0,
  stdDev = 1
): number {
  const u1 = Math.max(1e-12, rng());
  const u2 = rng();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z0;
}

export function sampleMean(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < xs.length; i++) {
    sum += xs[i];
  }
  return sum / xs.length;
}

export function quantileSorted(sorted: readonly number[], q: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const clamped = Math.max(0, Math.min(1, q));
  const pos = clamped * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  const frac = pos - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

export function sampleMedian(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  return quantileSorted(sorted, 0.5);
}

export function trimmedMean(xs: readonly number[], proportion = 0.1): number {
  if (xs.length === 0) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  const trimCount = Math.min(
    Math.floor((sorted.length - 1) / 2),
    Math.floor(sorted.length * Math.max(0, Math.min(0.45, proportion)))
  );
  const sliced = sorted.slice(trimCount, sorted.length - trimCount);
  return sampleMean(sliced);
}

export function sampleVariance(xs: readonly number[], ddof: 0 | 1 = 1): number {
  if (xs.length === 0) return 0;
  const denom = xs.length - ddof;
  if (denom <= 0) return 0;
  const mean = sampleMean(xs);
  let sumSq = 0;
  for (let i = 0; i < xs.length; i++) {
    const d = xs[i] - mean;
    sumSq += d * d;
  }
  return sumSq / denom;
}

export function sampleStdDev(xs: readonly number[], ddof: 0 | 1 = 1): number {
  return Math.sqrt(Math.max(0, sampleVariance(xs, ddof)));
}

export function sampleSkewness(xs: readonly number[]): number {
  if (xs.length < 3) return 0;
  const mean = sampleMean(xs);
  const sd = sampleStdDev(xs, 1);
  if (sd < 1e-12) return 0;
  const n = xs.length;
  let m3 = 0;
  for (let i = 0; i < n; i++) {
    m3 += ((xs[i] - mean) / sd) ** 3;
  }
  return (n / ((n - 1) * (n - 2))) * m3;
}

export function sampleExcessKurtosis(xs: readonly number[]): number {
  if (xs.length < 4) return 0;
  const mean = sampleMean(xs);
  const sd = sampleStdDev(xs, 1);
  if (sd < 1e-12) return 0;
  const n = xs.length;
  let m4 = 0;
  for (let i = 0; i < n; i++) {
    m4 += ((xs[i] - mean) / sd) ** 4;
  }
  const term1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
  const term2 = (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
  return term1 * m4 - term2;
}

export interface FiveNumberSummary {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  iqr: number;
  lowerFence: number;
  upperFence: number;
  lowerWhisker: number;
  upperWhisker: number;
  outliers: number[];
  insidePoints: number[];
}

export function computeFiveNumberSummary(
  xs: readonly number[]
): FiveNumberSummary {
  if (xs.length === 0) {
    return {
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      iqr: 0,
      lowerFence: 0,
      upperFence: 0,
      lowerWhisker: 0,
      upperWhisker: 0,
      outliers: [],
      insidePoints: [],
    };
  }
  const sorted = [...xs].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const q1 = quantileSorted(sorted, 0.25);
  const median = quantileSorted(sorted, 0.5);
  const q3 = quantileSorted(sorted, 0.75);
  const iqr = Math.max(0, q3 - q1);
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const insidePoints = sorted.filter(
    (x) => x >= lowerFence && x <= upperFence
  );
  const outliers = sorted.filter((x) => x < lowerFence || x > upperFence);
  const lowerWhisker = insidePoints.length > 0 ? insidePoints[0] : min;
  const upperWhisker =
    insidePoints.length > 0 ? insidePoints[insidePoints.length - 1] : max;

  return {
    min,
    q1,
    median,
    q3,
    max,
    iqr,
    lowerFence,
    upperFence,
    lowerWhisker,
    upperWhisker,
    outliers,
    insidePoints,
  };
}

export function silvermanBandwidth(xs: readonly number[]): number {
  if (xs.length < 2) return 0.5;
  const sorted = [...xs].sort((a, b) => a - b);
  const iqr = quantileSorted(sorted, 0.75) - quantileSorted(sorted, 0.25);
  const sd = sampleStdDev(xs, 1);
  const scale = iqr > 1e-6 ? Math.min(sd, iqr / 1.34) : sd;
  const bw = 0.9 * Math.max(scale, 0.15) * xs.length ** -0.2;
  return Math.max(0.15, bw);
}

export function gaussianKernelDensity(
  xs: readonly number[],
  gridX: readonly number[],
  bandwidth: number
): number[] {
  if (xs.length === 0) return gridX.map(() => 0);
  const h = Math.max(0.05, bandwidth);
  const invNorm = 1 / (xs.length * h * Math.sqrt(2 * Math.PI));
  return gridX.map((gx) => {
    let sum = 0;
    for (let i = 0; i < xs.length; i++) {
      const z = (gx - xs[i]) / h;
      sum += Math.exp(-0.5 * z * z);
    }
    return sum * invNorm;
  });
}

export function estimateModeFromKde(
  xs: readonly number[],
  minVal: number,
  maxVal: number,
  bandwidth?: number
): number {
  if (xs.length === 0) return 0;
  const bw = bandwidth ?? silvermanBandwidth(xs);
  const steps = 160;
  const gridX = Array.from(
    { length: steps + 1 },
    (_, i) => minVal + (i / steps) * (maxVal - minVal)
  );
  const dens = gaussianKernelDensity(xs, gridX, bw);
  let bestIdx = 0;
  for (let i = 1; i < dens.length; i++) {
    if (dens[i] > dens[bestIdx]) bestIdx = i;
  }
  return gridX[bestIdx];
}

export interface HistogramBin {
  x0: number;
  x1: number;
  mid: number;
  count: number;
  relativeFreq: number;
  density: number;
  cumulativeFraction: number;
}

export function buildHistogramBins(
  xs: readonly number[],
  numBins: number,
  minVal: number,
  maxVal: number
): { bins: HistogramBin[]; binWidth: number } {
  const n = xs.length;
  const safeBins = Math.max(1, Math.round(numBins));
  const span = Math.max(1e-6, maxVal - minVal);
  const binWidth = span / safeBins;
  const counts = new Array<number>(safeBins).fill(0);

  for (let i = 0; i < n; i++) {
    const val = xs[i];
    if (val < minVal || val > maxVal) continue;
    let idx = Math.floor((val - minVal) / binWidth);
    if (idx >= safeBins) idx = safeBins - 1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  }

  let running = 0;
  const bins: HistogramBin[] = counts.map((count, i) => {
    running += count;
    const x0 = minVal + i * binWidth;
    const x1 = x0 + binWidth;
    const relativeFreq = n > 0 ? count / n : 0;
    const density = n > 0 ? count / (n * binWidth) : 0;
    const cumulativeFraction = n > 0 ? running / n : 0;
    return {
      x0,
      x1,
      mid: 0.5 * (x0 + x1),
      count,
      relativeFreq,
      density,
      cumulativeFraction,
    };
  });

  return { bins, binWidth };
}

export function computeL1Loss(xs: readonly number[], center: number): number {
  let total = 0;
  for (let i = 0; i < xs.length; i++) {
    total += Math.abs(xs[i] - center);
  }
  return total;
}

export function computeL2Loss(xs: readonly number[], center: number): number {
  let total = 0;
  for (let i = 0; i < xs.length; i++) {
    const d = xs[i] - center;
    total += d * d;
  }
  return total;
}

/**
 * Exact log-factorial for non-negative integers via direct log-sum (fast and
 * exact up to any interactive n used in statistics labs without overflow).
 */
export function logFactorial(n: number): number {
  const k = Math.max(0, Math.floor(n));
  let acc = 0;
  for (let i = 2; i <= k; i++) {
    acc += Math.log(i);
  }
  return acc;
}

export function binomialCoeff(n: number, k: number): number {
  const nn = Math.floor(n);
  const kk = Math.floor(k);
  if (kk < 0 || kk > nn) return 0;
  if (kk === 0 || kk === nn) return 1;
  return Math.round(
    Math.exp(logFactorial(nn) - logFactorial(kk) - logFactorial(nn - kk))
  );
}

export function bernoulliPmf(k: number, p: number): number {
  const prob = Math.max(0, Math.min(1, p));
  if (k === 1) return prob;
  if (k === 0) return 1 - prob;
  return 0;
}

export function binomialPmf(k: number, n: number, p: number): number {
  const nn = Math.max(1, Math.floor(n));
  const kk = Math.floor(k);
  if (kk < 0 || kk > nn) return 0;
  const prob = Math.max(0, Math.min(1, p));
  if (prob === 0) return kk === 0 ? 1 : 0;
  if (prob === 1) return kk === nn ? 1 : 0;
  const logP =
    logFactorial(nn) -
    logFactorial(kk) -
    logFactorial(nn - kk) +
    kk * Math.log(prob) +
    (nn - kk) * Math.log(1 - prob);
  return Math.exp(logP);
}

/**
 * Geometric distribution: number of trials k >= 1 until the first success.
 */
export function geometricPmf(k: number, p: number): number {
  const kk = Math.floor(k);
  if (kk < 1) return 0;
  const prob = Math.max(1e-6, Math.min(1, p));
  if (prob === 1) return kk === 1 ? 1 : 0;
  return Math.pow(1 - prob, kk - 1) * prob;
}

export function poissonPmf(k: number, lambda: number): number {
  const kk = Math.floor(k);
  if (kk < 0) return 0;
  const lam = Math.max(0, lambda);
  if (lam === 0) return kk === 0 ? 1 : 0;
  const logP = kk * Math.log(lam) - lam - logFactorial(kk);
  return Math.exp(logP);
}

/**
 * Exact intersection area of two circles of radii r1, r2 with center distance d.
 */
export function circleIntersectionArea(
  r1: number,
  r2: number,
  d: number
): number {
  if (r1 <= 0 || r2 <= 0) return 0;
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) {
    const rMin = Math.min(r1, r2);
    return Math.PI * rMin * rMin;
  }
  const d2 = d * d;
  const r1Sq = r1 * r1;
  const r2Sq = r2 * r2;
  const alpha = Math.max(
    -1,
    Math.min(1, (d2 + r1Sq - r2Sq) / (2 * d * r1))
  );
  const beta = Math.max(
    -1,
    Math.min(1, (d2 + r2Sq - r1Sq) / (2 * d * r2))
  );
  const part1 = r1Sq * Math.acos(alpha);
  const part2 = r2Sq * Math.acos(beta);
  const part3 =
    0.5 *
    Math.sqrt(
      Math.max(0, (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2))
    );
  return part1 + part2 - part3;
}

/**
 * Solve center separation distance d such that two circles of radii r1, r2
 * achieve target intersection area.
 */
export function solveCircleSeparationForArea(
  r1: number,
  r2: number,
  targetArea: number
): number {
  const minR = Math.min(r1, r2);
  const maxOverlap = Math.PI * minR * minR;
  if (targetArea <= 1e-9) return r1 + r2 + 0.04;
  if (targetArea >= maxOverlap - 1e-9) return Math.abs(r1 - r2);

  let lo = Math.abs(r1 - r2);
  let hi = r1 + r2;
  for (let i = 0; i < 42; i++) {
    const mid = 0.5 * (lo + hi);
    const area = circleIntersectionArea(r1, r2, mid);
    if (area > targetArea) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return 0.5 * (lo + hi);
}
