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
