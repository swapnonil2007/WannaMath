import * as THREE from "three";

/**
 * Converts right-handed Engineering/Mathematics z-up coordinates (x, y, z)
 * into Three.js y-up world coordinates (x, z, -y).
 */
export function mathToThreeVec3(
  x: number,
  y: number,
  z: number
): THREE.Vector3 {
  return new THREE.Vector3(x, z, -y);
}

/**
 * Recursively disposes all BufferGeometries and Materials inside a Three.js Object3D
 * to prevent WebGL memory leaks when equations, bounds, or sliders update.
 */
export function disposeThreeObject(root: THREE.Object3D): void {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  });
}

export interface CoordinateAxesOptions {
  axisLength?: number;
  gridExtent?: number;
  gridDivisions?: number;
  xColor?: number;
  yColor?: number;
  zColor?: number;
  gridColor?: number;
}

/**
 * Builds standard z-up mathematical axes (x in #8D9FCE, y in #96B898, z in #029091)
 * and an xy-plane reference grid.
 */
export function createCoordinateAxesAndGrid(
  options: CoordinateAxesOptions = {}
): THREE.Group {
  const {
    axisLength = 2.2,
    gridExtent = 4,
    gridDivisions = 12,
    xColor = 0x8d9fce,
    yColor = 0x96b898,
    zColor = 0x029091,
    gridColor = 0x383b43,
  } = options;

  const group = new THREE.Group();

  // xy-plane reference grid (Three.js xz-plane)
  const gridHelper = new THREE.GridHelper(
    gridExtent,
    gridDivisions,
    gridColor,
    0x27292e
  );
  group.add(gridHelper);

  // +x axis (#8D9FCE Periwinkle)
  const xGeom = new THREE.BufferGeometry().setFromPoints([
    mathToThreeVec3(-axisLength * 0.25, 0, 0),
    mathToThreeVec3(axisLength, 0, 0),
  ]);
  group.add(
    new THREE.Line(xGeom, new THREE.LineBasicMaterial({ color: xColor }))
  );

  // +y axis (#96B898 Sage Green)
  const yGeom = new THREE.BufferGeometry().setFromPoints([
    mathToThreeVec3(0, -axisLength * 0.25, 0),
    mathToThreeVec3(0, axisLength, 0),
  ]);
  group.add(
    new THREE.Line(yGeom, new THREE.LineBasicMaterial({ color: yColor }))
  );

  // +z axis (#029091 Deep Teal)
  const zGeom = new THREE.BufferGeometry().setFromPoints([
    mathToThreeVec3(0, 0, -axisLength * 0.15),
    mathToThreeVec3(0, 0, axisLength),
  ]);
  group.add(
    new THREE.Line(zGeom, new THREE.LineBasicMaterial({ color: zColor }))
  );

  return group;
}

export interface ParametricSurfaceOptions {
  color?: number;
  opacity?: number;
  wireframeColor?: number;
  wireframeOpacity?: number;
  showWireframe?: boolean;
}

/**
 * Builds an indexed 3D parametric surface mesh r(u, v) = (x(u,v), y(u,v), z(u,v))
 * in z-up mathematical coordinates, with an optional wireframe cage.
 */
export function createParametricSurfaceMesh(
  evalPoint: (u: number, v: number) => [number, number, number],
  uRange: [number, number],
  vRange: [number, number],
  uSteps = 32,
  vSteps = 32,
  options: ParametricSurfaceOptions = {}
): THREE.Group {
  const {
    color = 0x8d9fce,
    opacity = 0.55,
    wireframeColor = 0xfbeaa4,
    wireframeOpacity = 0.22,
    showWireframe = true,
  } = options;

  const [uMin, uMax] = uRange;
  const [vMin, vMax] = vRange;

  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= uSteps; i++) {
    const u = uMin + (i / uSteps) * (uMax - uMin);
    for (let j = 0; j <= vSteps; j++) {
      const v = vMin + (j / vSteps) * (vMax - vMin);
      const [mx, my, mz] = evalPoint(u, v);
      const tv = mathToThreeVec3(mx, my, mz);
      positions.push(tv.x, tv.y, tv.z);
    }
  }

  for (let i = 0; i < uSteps; i++) {
    for (let j = 0; j < vSteps; j++) {
      const a = i * (vSteps + 1) + j;
      const b = (i + 1) * (vSteps + 1) + j;
      const c = (i + 1) * (vSteps + 1) + (j + 1);
      const d = i * (vSteps + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  const group = new THREE.Group();

  const surfaceMat = new THREE.MeshStandardMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    side: THREE.DoubleSide,
    roughness: 0.45,
  });
  group.add(new THREE.Mesh(geom, surfaceMat));

  if (showWireframe) {
    const wireMat = new THREE.MeshBasicMaterial({
      color: wireframeColor,
      wireframe: true,
      transparent: true,
      opacity: wireframeOpacity,
    });
    group.add(new THREE.Mesh(geom.clone(), wireMat));
  }

  return group;
}

/**
 * Builds a 3D vector arrow in z-up mathematical coordinates from `originMath`
 * along `dirMath`. Supports either 3 arguments `(originMath, vecMath, colorHex)`
 * where arrow length equals `‖vecMath‖`, or 4 arguments `(originMath, dirMath, length, colorHex)`.
 */
export function createVectorArrow3D(
  originMath: [number, number, number],
  dirMath: [number, number, number],
  colorOrLength: number,
  maybeColorHex?: number,
  headLengthRatio = 0.24
): THREE.ArrowHelper {
  const originThree = mathToThreeVec3(
    originMath[0],
    originMath[1],
    originMath[2]
  );
  const dirThree = mathToThreeVec3(dirMath[0], dirMath[1], dirMath[2]);
  const rawVecLen = dirThree.length();
  if (rawVecLen < 1e-12) {
    dirThree.set(1, 0, 0);
  } else {
    dirThree.normalize();
  }

  const length = maybeColorHex !== undefined ? colorOrLength : rawVecLen;
  const colorHex = maybeColorHex !== undefined ? maybeColorHex : colorOrLength;
  const safeLen = Math.max(0.05, length);

  return new THREE.ArrowHelper(
    dirThree,
    originThree,
    safeLen,
    colorHex,
    safeLen * headLengthRatio,
    safeLen * headLengthRatio * 0.55
  );
}

const KUHN_TETS: [number, number, number, number][] = [
  [0, 5, 1, 6],
  [0, 1, 2, 6],
  [0, 2, 3, 6],
  [0, 3, 7, 6],
  [0, 7, 4, 6],
  [0, 4, 5, 6],
];

/**
 * Extracts a triangulated 3D level surface φ(x, y, z) = level inside a Cartesian box
 * using Freudenthal/Kuhn 6-tetrahedra decomposition (Marching Tetrahedra).
 */
export function createImplicitLevelSurfaceMesh(
  evalScalar: (x: number, y: number, z: number) => number,
  level: number,
  xRange: [number, number],
  yRange: [number, number],
  zRange: [number, number],
  gridN = 16,
  options?: {
    color?: number;
    opacity?: number;
    wireframeColor?: number;
    wireframeOpacity?: number;
    showWireframe?: boolean;
  }
): THREE.Group {
  const {
    color = 0x029091,
    opacity = 0.52,
    wireframeColor = 0x8d9fce,
    wireframeOpacity = 0.16,
    showWireframe = true,
  } = options ?? {};

  const N = Math.max(6, Math.min(28, gridN));
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const [zMin, zMax] = zRange;
  const strideY = N + 1;
  const strideX = (N + 1) * (N + 1);
  const grid = new Float32Array((N + 1) * (N + 1) * (N + 1));

  for (let i = 0; i <= N; i++) {
    const x = xMin + (i / N) * (xMax - xMin);
    for (let j = 0; j <= N; j++) {
      const y = yMin + (j / N) * (yMax - yMin);
      for (let k = 0; k <= N; k++) {
        const z = zMin + (k / N) * (zMax - zMin);
        const val = evalScalar(x, y, z) - level;
        grid[i * strideX + j * strideY + k] = Number.isFinite(val) ? val : NaN;
      }
    }
  }

  const positions: number[] = [];
  const interp = (
    p1: [number, number, number],
    p2: [number, number, number],
    v1: number,
    v2: number
  ): THREE.Vector3 => {
    const denom = v2 - v1;
    const t = Math.abs(denom) < 1e-12 ? 0.5 : Math.max(0, Math.min(1, -v1 / denom));
    return mathToThreeVec3(
      p1[0] + t * (p2[0] - p1[0]),
      p1[1] + t * (p2[1] - p1[1]),
      p1[2] + t * (p2[2] - p1[2])
    );
  };

  const pushTri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  };

  const dx = (xMax - xMin) / N;
  const dy = (yMax - yMin) / N;
  const dz = (zMax - zMin) / N;

  for (let i = 0; i < N; i++) {
    const x0 = xMin + i * dx;
    const x1 = x0 + dx;
    for (let j = 0; j < N; j++) {
      const y0 = yMin + j * dy;
      const y1 = y0 + dy;
      for (let k = 0; k < N; k++) {
        const z0 = zMin + k * dz;
        const z1 = z0 + dz;

        const base = i * strideX + j * strideY + k;
        const cornerVals = [
          grid[base],
          grid[base + strideX],
          grid[base + strideX + strideY],
          grid[base + strideY],
          grid[base + 1],
          grid[base + strideX + 1],
          grid[base + strideX + strideY + 1],
          grid[base + strideY + 1],
        ];
        if (cornerVals.some((v) => !Number.isFinite(v))) continue;

        const cornerPts: [number, number, number][] = [
          [x0, y0, z0],
          [x1, y0, z0],
          [x1, y1, z0],
          [x0, y1, z0],
          [x0, y0, z1],
          [x1, y0, z1],
          [x1, y1, z1],
          [x0, y1, z1],
        ];

        for (const tet of KUHN_TETS) {
          const inside: number[] = [];
          const outside: number[] = [];
          for (const idx of tet) {
            if (cornerVals[idx] < 0) inside.push(idx);
            else outside.push(idx);
          }

          if (inside.length === 0 || inside.length === 4) continue;

          if (inside.length === 1 || inside.length === 3) {
            const solo = inside.length === 1 ? inside[0] : outside[0];
            const trio = inside.length === 1 ? outside : inside;
            const vA = interp(cornerPts[solo], cornerPts[trio[0]], cornerVals[solo], cornerVals[trio[0]]);
            const vB = interp(cornerPts[solo], cornerPts[trio[1]], cornerVals[solo], cornerVals[trio[1]]);
            const vC = interp(cornerPts[solo], cornerPts[trio[2]], cornerVals[solo], cornerVals[trio[2]]);
            pushTri(vA, vB, vC);
          } else {
            const [i0, i1] = inside;
            const [o0, o1] = outside;
            const p00 = interp(cornerPts[i0], cornerPts[o0], cornerVals[i0], cornerVals[o0]);
            const p01 = interp(cornerPts[i0], cornerPts[o1], cornerVals[i0], cornerVals[o1]);
            const p10 = interp(cornerPts[i1], cornerPts[o0], cornerVals[i1], cornerVals[o0]);
            const p11 = interp(cornerPts[i1], cornerPts[o1], cornerVals[i1], cornerVals[o1]);
            pushTri(p00, p01, p11);
            pushTri(p00, p11, p10);
          }
        }
      }
    }
  }

  const group = new THREE.Group();
  if (positions.length === 0) return group;

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.computeVertexNormals();

  group.add(
    new THREE.Mesh(
      geom,
      new THREE.MeshStandardMaterial({
        color,
        transparent: opacity < 1,
        opacity,
        side: THREE.DoubleSide,
        roughness: 0.48,
      })
    )
  );

  if (showWireframe) {
    group.add(
      new THREE.Mesh(
        geom.clone(),
        new THREE.MeshBasicMaterial({
          color: wireframeColor,
          wireframe: true,
          transparent: true,
          opacity: wireframeOpacity,
        })
      )
    );
  }

  return group;
}
