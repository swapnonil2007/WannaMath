import React from "react";
import { TopicPageShell } from "@/components/layout/TopicPageShell";
import { TripleIntegralOrderLab } from "@/components/visualizations/triple-integrals/TripleIntegralOrderLab";
import { TripleVoxelDensityLab } from "@/components/visualizations/triple-integrals/TripleVoxelDensityLab";

export default function TripleIntegralsPage() {
  return (
    <TopicPageShell topicId="triple-integrals">
      <div className="space-y-10">
        <TripleIntegralOrderLab />
        <TripleVoxelDensityLab />
      </div>
    </TopicPageShell>
  );
}
