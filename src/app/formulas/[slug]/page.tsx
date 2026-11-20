import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllFormulaSheets,
  getFormulaSheetBySlug,
} from "@/lib/formulas";
import { FormulaSheetPageView } from "@/components/formulas/FormulaSheetPageView";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildFormulaSheetJsonLd } from "@/lib/seo/structuredData";
import { buildPageMetadata } from "@/lib/seo/siteConfig";

export function generateStaticParams() {
  return getAllFormulaSheets().map((sheet) => ({
    slug: sheet.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sheet = getFormulaSheetBySlug(slug);
  if (!sheet) {
    return {
      title: "Formula Sheet Not Found",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    title: sheet.title,
    description: `${sheet.subtitle} Includes ${sheet.sections.length} verified reference sections with conditions and worked steps.`,
    path: `/formulas/${sheet.slug}`,
    type: "article",
  });
}

export default async function FormulaSheetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sheet = getFormulaSheetBySlug(slug);

  if (!sheet) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildFormulaSheetJsonLd(sheet)} />
      <FormulaSheetPageView sheet={sheet} />
    </>
  );
}
