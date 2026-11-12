import React from "react";
import { TopicPageShell } from "@/components/layout/TopicPageShell";
import { RiemannVolumeLab } from "@/components/visualizations/double-integrals/RiemannVolumeLab";
import { IteratedOrderChangeLab } from "@/components/visualizations/double-integrals/IteratedOrderChangeLab";

export default function DoubleIntegralsPage() {
  return (
    <TopicPageShell topicId="double-integrals">
      <div className="space-y-10">
        <RiemannVolumeLab />
        <IteratedOrderChangeLab />
      </div>
    </TopicPageShell>
  );
}
