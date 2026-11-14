import React from "react";
import type { Metadata } from "next";
import { TopicPageShell } from "@/components/layout/TopicPageShell";
import { DynamicLabRenderer } from "@/components/visualizations/DynamicLabRenderer";

export const metadata: Metadata = {
  title: "Triple Integrals & 3D Volumes (3.2.2)",
  alternates: {
    canonical: "/multivariable-calculus/integral-calculus/triple-integrals",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function TripleIntegralsPage() {
  return (
    <TopicPageShell topicId="triple-integrals">
      <div className="space-y-10">
        <DynamicLabRenderer name="TripleIntegralOrderLab" />
        <DynamicLabRenderer name="TripleVoxelDensityLab" />
      </div>
    </TopicPageShell>
  );
}
