export interface ContourSegment2D {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Extracts 2D line segments approximating the level curve f(x, y) = level
 * over [xMin, xMax] x [yMin, yMax] using Marching Squares on an Nx x Ny grid.
 */
export function extractLevelCurveSegments(
  fn: (x: number, y: number) => number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  level: number,
  Nx = 42,
  Ny = 42
): ContourSegment2D[] {
  const segments: ContourSegment2D[] = [];
  const dx = (xMax - xMin) / Nx;
  const dy = (yMax - yMin) / Ny;
  if (dx <= 1e-9 || dy <= 1e-9 || !Number.isFinite(level)) return segments;

  // Precompute grid values
  const grid: number[][] = [];
  for (let i = 0; i <= Nx; i++) {
    const x = xMin + i * dx;
    const col: number[] = [];
    for (let j = 0; j <= Ny; j++) {
      const y = yMin + j * dy;
      const val = fn(x, y);
      col.push(Number.isFinite(val) ? val - level : NaN);
    }
    grid.push(col);
  }

  const interp = (vA: number, vB: number): number => {
    const denom = vA - vB;
    if (Math.abs(denom) < 1e-12) return 0.5;
    return Math.max(0, Math.min(1, vA / denom));
  };

  for (let i = 0; i < Nx; i++) {
    const x0 = xMin + i * dx;
    const x1 = x0 + dx;
    for (let j = 0; j < Ny; j++) {
      const y0 = yMin + j * dy;
      const y1 = y0 + dy;

      const v00 = grid[i][j]; // bottom-left
      const v10 = grid[i + 1][j]; // bottom-right
      const v11 = grid[i + 1][j + 1]; // top-right
      const v01 = grid[i][j + 1]; // top-left

      if (
        Number.isNaN(v00) ||
        Number.isNaN(v10) ||
        Number.isNaN(v11) ||
        Number.isNaN(v01)
      ) {
        continue;
      }

      const b0 = v00 >= 0 ? 1 : 0;
      const b1 = v10 >= 0 ? 2 : 0;
      const b2 = v11 >= 0 ? 4 : 0;
      const b3 = v01 >= 0 ? 8 : 0;
      const mask = b0 | b1 | b2 | b3;

      if (mask === 0 || mask === 15) continue;

      // Edge 0: bottom (v00 -> v10)
      const e0: [number, number] = [x0 + interp(v00, v10) * dx, y0];
      // Edge 1: right (v10 -> v11)
      const e1: [number, number] = [x1, y0 + interp(v10, v11) * dy];
      // Edge 2: top (v01 -> v11)
      const e2: [number, number] = [x0 + interp(v01, v11) * dx, y1];
      // Edge 3: left (v00 -> v01)
      const e3: [number, number] = [x0, y0 + interp(v00, v01) * dy];

      const addSeg = (pA: [number, number], pB: [number, number]) => {
        segments.push({ x1: pA[0], y1: pA[1], x2: pB[0], y2: pB[1] });
      };

      switch (mask) {
        case 1:
        case 14:
          addSeg(e3, e0);
          break;
        case 2:
        case 13:
          addSeg(e0, e1);
          break;
        case 3:
        case 12:
          addSeg(e3, e1);
          break;
        case 4:
        case 11:
          addSeg(e1, e2);
          break;
        case 5: {
          const centerVal = 0.25 * (v00 + v10 + v11 + v01);
          if (centerVal >= 0) {
            addSeg(e3, e2);
            addSeg(e0, e1);
          } else {
            addSeg(e3, e0);
            addSeg(e1, e2);
          }
          break;
        }
        case 6:
        case 9:
          addSeg(e0, e2);
          break;
        case 7:
        case 8:
          addSeg(e3, e2);
          break;
        case 10: {
          const centerVal = 0.25 * (v00 + v10 + v11 + v01);
          if (centerVal >= 0) {
            addSeg(e3, e0);
            addSeg(e1, e2);
          } else {
            addSeg(e3, e2);
            addSeg(e0, e1);
          }
          break;
        }
      }
    }
  }

  return segments;
}
