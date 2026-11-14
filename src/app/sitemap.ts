import type { MetadataRoute } from "next";
import { getAllVolumes } from "@/registry/index";
import { absoluteUrl } from "@/lib/seo/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const volumes = getAllVolumes();
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/roadmap"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/about"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  for (const volume of volumes) {
    entries.push({
      url: absoluteUrl(`/${volume.slug}`),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    });

    for (const mod of volume.modules) {
      entries.push({
        url: absoluteUrl(`/${volume.slug}/${mod.slug}`),
        lastModified,
        changeFrequency: "weekly",
        priority: 0.85,
      });

      for (const chapter of mod.chapters) {
        entries.push({
          url: absoluteUrl(`/${volume.slug}/${mod.slug}/${chapter.slug}`),
          lastModified,
          changeFrequency: "monthly",
          priority: 0.8,
        });
      }
    }
  }

  return entries;
}
