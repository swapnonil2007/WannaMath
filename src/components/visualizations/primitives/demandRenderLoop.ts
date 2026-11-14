import * as THREE from "three";

export interface DemandDrivenRenderLoopHandle {
  requestRender: (frames?: number) => void;
  dispose: () => void;
}

export type DemandDrivenControlEvent = "start" | "end" | "change";

export interface DemandDrivenRenderLoopOptions {
  container: HTMLElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  controls?: {
    update: () => boolean;
    addEventListener: (
      event: DemandDrivenControlEvent,
      listener: () => void
    ) => void;
    removeEventListener: (
      event: DemandDrivenControlEvent,
      listener: () => void
    ) => void;
  };
}

/**
 * Attaches an on-demand Three.js render loop that renders at full framerate during
 * active OrbitControls damping, dragging, camera resets, resizes, and scene updates,
 * then halts requestAnimationFrame when idle, off-screen, or tab-hidden.
 */
export function createDemandDrivenRenderLoop({
  container,
  renderer,
  scene,
  camera,
  controls,
}: DemandDrivenRenderLoopOptions): DemandDrivenRenderLoopHandle {
  let rafId: number | null = null;
  let framesLeft = 3;
  let isDragging = false;
  let isTicking = false;
  let disposed = false;
  let isIntersecting = true;

  const lastPos = camera.position.clone();
  const lastQuat = camera.quaternion.clone();

  const scheduleTick = () => {
    if (
      disposed ||
      isTicking ||
      rafId !== null ||
      !isIntersecting ||
      (typeof document !== "undefined" && document.hidden)
    ) {
      return;
    }
    rafId = requestAnimationFrame(tick);
  };

  const requestRender = (frames = 3) => {
    if (disposed) return;
    framesLeft = Math.max(framesLeft, frames);
    scheduleTick();
  };

  const tick = () => {
    rafId = null;
    if (
      disposed ||
      !isIntersecting ||
      (typeof document !== "undefined" && document.hidden)
    ) {
      return;
    }

    isTicking = true;
    const didControlUpdate = controls ? controls.update() : false;
    renderer.render(scene, camera);
    isTicking = false;

    const moved =
      lastPos.distanceToSquared(camera.position) > 1e-10 ||
      1 - Math.abs(lastQuat.dot(camera.quaternion)) > 1e-10;
    lastPos.copy(camera.position);
    lastQuat.copy(camera.quaternion);

    if (framesLeft > 0) framesLeft -= 1;

    if (isDragging || didControlUpdate || moved || framesLeft > 0) {
      scheduleTick();
    }
  };

  const handleControlStart = () => {
    isDragging = true;
    requestRender(4);
  };

  const handleControlEnd = () => {
    isDragging = false;
    requestRender(6);
  };

  const handleControlChange = () => {
    if (!isTicking) {
      requestRender(2);
    }
  };

  if (controls) {
    controls.addEventListener("start", handleControlStart);
    controls.addEventListener("end", handleControlEnd);
    controls.addEventListener("change", handleControlChange);
  }

  let observer: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          requestRender(2);
        } else if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(container);
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else {
      requestRender(2);
    }
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  requestRender(3);

  return {
    requestRender,
    dispose: () => {
      disposed = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (controls) {
        controls.removeEventListener("start", handleControlStart);
        controls.removeEventListener("end", handleControlEnd);
        controls.removeEventListener("change", handleControlChange);
      }
      if (observer) {
        observer.disconnect();
      }
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    },
  };
}
