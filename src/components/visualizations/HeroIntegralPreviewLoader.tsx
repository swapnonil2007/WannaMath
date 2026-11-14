"use client";

import dynamic from "next/dynamic";
import { LabLoadingSkeleton } from "@/components/visualizations/LabLoadingSkeleton";

const HeroIntegralPreview = dynamic(
  () =>
    import("@/components/visualizations/HeroIntegralPreview").then(
      (mod) => mod.HeroIntegralPreview
    ),
  {
    loading: () => (
      <LabLoadingSkeleton
        title="2D/3D Riemann Preview"
        heightClass="min-h-[540px]"
      />
    ),
  }
);

export function HeroIntegralPreviewLoader() {
  return <HeroIntegralPreview />;
}
