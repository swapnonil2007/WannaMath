"use client";

import { lazy, Suspense } from "react";
import { LabLoadingSkeleton } from "@/components/visualizations/LabLoadingSkeleton";

const HeroIntegralPreview = lazy(() =>
  import("@/components/visualizations/HeroIntegralPreview").then((mod) => ({
    default: mod.HeroIntegralPreview,
  }))
);

export function HeroIntegralPreviewLoader() {
  return (
    <Suspense
      fallback={
        <LabLoadingSkeleton
          title="2D/3D Riemann Preview"
          heightClass="min-h-[540px]"
        />
      }
    >
      <HeroIntegralPreview />
    </Suspense>
  );
}
