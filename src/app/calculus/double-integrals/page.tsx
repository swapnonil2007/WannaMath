import React from "react";
import type { Metadata } from "next";
import { TopicPageShell } from "@/components/layout/TopicPageShell";
import { DynamicLabRenderer } from "@/components/visualizations/DynamicLabRenderer";

export const metadata: Metadata = {
  title: "Double Integrals & Iterated Regions (3.2.1)",
  alternates: {
    canonical: "/multivariable-calculus/integral-calculus/double-integrals",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function DoubleIntegralsPage() {
  return (
    <TopicPageShell topicId="double-integrals">
      <div className="space-y-10">
        <DynamicLabRenderer name="RiemannVolumeLab" />
        <DynamicLabRenderer name="IteratedOrderChangeLab" />
      </div>
    </TopicPageShell>
  );
}
