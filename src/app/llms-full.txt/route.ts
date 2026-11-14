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
    `# ${SITE_NAME} (${BRAND_DISPLAY_NAME}) — Complete Textbook & Formula Catalog`,
    "",
    `> ${BRAND_TAGLINE}. ${SITE_DESCRIPTION}`,
    "",
    `- **Canonical URL:** ${SITE_URL}`,
    `- **Summary Index:** ${absoluteUrl("/llms.txt")}`,
    `- **Syllabus Matrix:** ${absoluteUrl("/roadmap")}`,
    `- **Coverage:** ${volumes.length} Volumes, ${totalModules} Modules, ${totalChapters} Chapters, ${totalLabs} Interactive Labs`,
    `- **Author:** ${CREATOR.name} (${CREATOR.affiliation}) — ${CREATOR.githubUrl}`,
    `- **Repository:** ${REPO_URL}`,
    "",
  ];

  for (const vol of volumes) {
    lines.push("---");
    lines.push("");
    lines.push(
      `## Volume ${vol.volumeNumber}: ${vol.title} (${absoluteUrl(`/${vol.slug}`)})`
    );
    lines.push("");
    lines.push(vol.description);
    if (vol.engineeringApplications.length > 0) {
      lines.push(
        `- **Engineering Applications:** ${vol.engineeringApplications.join(", ")}`
      );
    }
    lines.push("");

    for (const mod of vol.modules) {
      lines.push(
        `### Module ${mod.numberLabel}: ${mod.title} (${absoluteUrl(`/${vol.slug}/${mod.slug}`)})`
      );
      lines.push("");
      lines.push(mod.description);
      lines.push("");

      for (const ch of mod.chapters) {
        const chapterUrl = absoluteUrl(`/${vol.slug}/${mod.slug}/${ch.slug}`);
        lines.push(`#### ${ch.id} — ${ch.title}`);
        lines.push(`- **URL:** ${chapterUrl}`);
        lines.push(
          `- **Status:** ${ch.status} | **Estimated Time:** ${ch.estimatedMinutes} min${ch.dimensionBadge ? ` | **Mode:** ${ch.dimensionBadge}` : ""}`
        );
        lines.push(`- **Summary:** ${ch.subtitle}`);
        if (ch.engineeringContext) {
          lines.push(`- **Engineering Context:** ${ch.engineeringContext}`);
        }
        if (ch.prerequisites.length > 0) {
          lines.push(`- **Prerequisites:** ${ch.prerequisites.join(", ")}`);
        }
        if (ch.keyEquationsLatex.length > 0) {
          lines.push(
            `- **Key Equations (LaTeX):** ${ch.keyEquationsLatex.map((eq) => `\`${eq}\``).join(" | ")}`
          );
        }
        if (ch.pedagogicalRhythm) {
          lines.push(
            `- **Guiding Question:** ${ch.pedagogicalRhythm.question}`
          );
          lines.push(
            `- **Formalization Formula:** \`${ch.pedagogicalRhythm.symbolicFormalizationLatex}\``
          );
          lines.push(
            `- **Edge Cases & Next Bridge:** ${ch.pedagogicalRhythm.edgeCasesAndBridge}`
          );
        }
        if (ch.labs.length > 0) {
          lines.push("- **Interactive Laboratories:**");
          for (const lab of ch.labs) {
            lines.push(
              `  - **${lab.title}**${lab.dimensionBadge ? ` [${lab.dimensionBadge}]` : ""}: ${lab.summary}${lab.formulaLatex ? ` (Formula: \`${lab.formulaLatex}\`)` : ""}`
            );
          }
        }
        lines.push("");
      }
    }
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
