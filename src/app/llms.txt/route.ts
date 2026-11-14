import { getAllResolvedChapters, getAllVolumes } from "@/registry/index";
import {
  BRAND_DISPLAY_NAME,
  BRAND_TAGLINE,
  CREATOR,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo/siteConfig";

export const dynamic = "force-static";

const FLAGSHIP_CHAPTER_IDS = new Set([
  "1.1.1",
  "2.3.1",
  "2.3.3",
  "3.2.1",
  "3.2.2",
  "3.2.3",
  "3.2.4",
  "4.2.1",
  "5.4.2",
  "6.2.2",
  "S.1.2",
  "S.3.2",
  "S.5.2",
  "S.6.1",
  "S.6.3",
]);

export function GET() {
  const volumes = getAllVolumes();
  const resolvedChapters = getAllResolvedChapters();
  const totalModules = volumes.reduce((acc, v) => acc + v.modules.length, 0);
  const totalChapters = resolvedChapters.length;
  const totalLabs = resolvedChapters.reduce(
    (acc, item) => acc + item.chapter.labs.length,
    0
  );

  const lines: string[] = [
    `# ${SITE_NAME} (${BRAND_DISPLAY_NAME})`,
    "",
    `> ${BRAND_TAGLINE}. ${SITE_DESCRIPTION}`,
    "",
    `- **Canonical URL:** ${SITE_URL}`,
    `- **Architecture:** ${volumes.length} Volumes -> ${totalModules} Modules -> ${totalChapters} Chapters -> ${totalLabs} Interactive 2D/3D Labs`,
    `- **Author:** ${CREATOR.name} (${CREATOR.affiliation}) — ${CREATOR.githubUrl}`,
    `- **Source Repository:** ${REPO_URL}`,
    `- **Access Model:** Free, open-source interactive web textbook (no paywall, no login required)`,
    "",
    "## Core Entry Points",
    "",
    `- [Home Overview](${absoluteUrl("/")}): Interactive 3D preview, Module 3.2 highlights, 6-volume directory, and Statistics Volume (18 chapters).`,
    `- [Full Syllabus Matrix](${absoluteUrl("/roadmap")}): Complete structured map across all ${volumes.length} volumes and ${totalChapters} chapters.`,
    `- [How to Use Guide](${absoluteUrl("/how-to-use")}): Quick-start orientation, interactive formula sandbox, 2D/3D viewport controls, Butterfly color dictionary, and starter tracks.`,
    `- [About & Creator](${absoluteUrl("/about")}): Open-source philosophy, contributor info, and creator profile (${CREATOR.name}).`,
    `- [Full Machine-Readable Textbook Index](${absoluteUrl("/llms-full.txt")}): Complete Markdown syllabus with all ${totalChapters} chapters, prerequisites, key LaTeX equations, and ${totalLabs} interactive lab specs.`,
    "",
    "## Volumes & Modules",
    "",
  ];

  for (const vol of volumes) {
    const volChapterCount = vol.modules.reduce(
      (acc, m) => acc + m.chapters.length,
      0
    );
    lines.push(
      `### [Volume ${vol.volumeNumber}: ${vol.title}](${absoluteUrl(`/${vol.slug}`)}) (${vol.modules.length} Modules, ${volChapterCount} Chapters)`
    );
    lines.push(vol.description);
    lines.push("");
    for (const mod of vol.modules) {
      lines.push(
        `- [Module ${mod.numberLabel}: ${mod.title}](${absoluteUrl(`/${vol.slug}/${mod.slug}`)}) (${mod.chapters.length} chapters): ${mod.description}`
      );
    }
    lines.push("");
  }

  lines.push("## Flagship Interactive Chapters");
  lines.push("");
  for (const item of resolvedChapters) {
    if (FLAGSHIP_CHAPTER_IDS.has(item.chapter.id)) {
      lines.push(
        `- [${item.chapter.id} ${item.chapter.title}](${absoluteUrl(item.route)}): ${item.chapter.subtitle}`
      );
    }
  }
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
