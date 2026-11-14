import type {
  ModuleMetadata,
  ResolvedChapterContext,
  VolumeMetadata,
} from "@/registry/types";
import {
  BRAND_DISPLAY_NAME,
  BRAND_TAGLINE,
  CREATOR,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE_DEFAULT,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo/siteConfig";

const CREATOR_ID = `${SITE_URL}/#creator`;
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

function getCreatorNode(includeImage = false) {
  return {
    "@type": "Person",
    "@id": CREATOR_ID,
    name: CREATOR.name,
    url: CREATOR.githubUrl,
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: CREATOR.affiliation,
    },
    ...(includeImage
      ? {
          image: absoluteUrl("/images/swapnonil-nath.jpg"),
          description:
            "1st-Year UG, B.Tech in Ocean Engineering and Naval Architecture at IIT Kharagpur; creator of Wanna Math.",
        }
      : {}),
    sameAs: [CREATOR.githubUrl, CREATOR.linkedinUrl, CREATOR.websiteUrl],
  };
}

function getOrganizationNode() {
  return {
    "@type": "EducationalOrganization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: BRAND_DISPLAY_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/pwa-icon/512"),
      width: 512,
      height: 512,
    },
    founder: { "@id": CREATOR_ID },
    sameAs: [REPO_URL, CREATOR.githubUrl],
  };
}

function getWebsiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: BRAND_DISPLAY_NAME,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    inLanguage: "en-US",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

function buildBreadcrumbList(
  items: Array<{ name: string; path: string }>,
  pageUrl: string
) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((entry, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}

export function buildHomeJsonLd(volumes: VolumeMetadata[]) {
  const homeUrl = absoluteUrl("/");
  const courseId = `${SITE_URL}/#textbook`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      getCreatorNode(),
      getOrganizationNode(),
      getWebsiteNode(),
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: homeUrl,
        name: SITE_TITLE_DEFAULT,
        description: SITE_DESCRIPTION,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": courseId },
        inLanguage: "en-US",
      },
      {
        "@type": ["Course", "LearningResource"],
        "@id": courseId,
        name: "Wanna Math — 6-Volume Interactive Engineering Mathematics Textbook",
        alternateName: BRAND_TAGLINE,
        description: SITE_DESCRIPTION,
        url: homeUrl,
        inLanguage: "en-US",
        isAccessibleForFree: true,
        educationalLevel: "Undergraduate Engineering",
        learningResourceType: "Interactive Textbook",
        provider: { "@id": ORGANIZATION_ID },
        creator: { "@id": CREATOR_ID },
        offers: {
          "@type": "Offer",
          category: "Free",
          price: 0,
          priceCurrency: "USD",
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Online",
        },
        teaches: volumes.map((vol) => vol.title),
        hasPart: volumes.map((vol, idx) => ({
          "@type": "LearningResource",
          position: idx + 1,
          name: `Volume ${vol.volumeNumber}: ${vol.title}`,
          description: vol.description,
          url: absoluteUrl(`/${vol.slug}`),
        })),
      },
    ],
  };
}

export function buildRoadmapJsonLd(volumes: VolumeMetadata[]) {
  const roadmapUrl = absoluteUrl("/roadmap");

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildBreadcrumbList(
        [
          { name: BRAND_DISPLAY_NAME, path: "/" },
          {
            name: "6-Volume Textbook Architecture & Curriculum Matrix",
            path: "/roadmap",
          },
        ],
        roadmapUrl
      ),
      {
        "@type": "CollectionPage",
        "@id": `${roadmapUrl}#webpage`,
        url: roadmapUrl,
        name: "6-Volume Engineering Mathematics Master Syllabus",
        description:
          "Complete 6-volume, 20-module, 65-chapter curriculum architecture covering single-variable calculus through multivariable calculus, linear algebra, ODEs, PDEs, complex transforms, and numerical methods.",
        isPartOf: { "@id": WEBSITE_ID },
        inLanguage: "en-US",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: volumes.length,
          itemListElement: volumes.map((vol, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            item: {
              "@type": "LearningResource",
              name: `Volume ${vol.volumeNumber}: ${vol.title}`,
              description: vol.description,
              url: absoluteUrl(`/${vol.slug}`),
              isAccessibleForFree: true,
            },
          })),
        },
      },
    ],
  };
}

export function buildAboutJsonLd() {
  const aboutUrl = absoluteUrl("/about");

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildBreadcrumbList(
        [
          { name: BRAND_DISPLAY_NAME, path: "/" },
          { name: "About", path: "/about" },
        ],
        aboutUrl
      ),
      {
        "@type": ["AboutPage", "ProfilePage"],
        "@id": `${aboutUrl}#webpage`,
        url: aboutUrl,
        name: "About wanna math",
        description:
          "About wanna math — an open-source interactive 6-volume engineering mathematics resource created by Swapnonil Nath (IIT Kharagpur) to make math intuitive and time-efficient.",
        isPartOf: { "@id": WEBSITE_ID },
        inLanguage: "en-US",
        mainEntity: getCreatorNode(true),
      },
    ],
  };
}

export function buildHowToUseJsonLd() {
  const pageUrl = absoluteUrl("/how-to-use");

  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationNode(),
      buildBreadcrumbList(
        [
          { name: BRAND_DISPLAY_NAME, path: "/" },
          { name: "How to Use Wanna Math", path: "/how-to-use" },
        ],
        pageUrl
      ),
      {
        "@type": ["WebPage", "HowTo", "LearningResource"],
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "How to Use Wanna Math",
        description:
          "Interactive orientation guide explaining the 6-Volume TOC and Statistics TOC drawers, live formula syntax, 3D WebGL orbit controls, Butterfly semantic color palette, and recommended learning tracks.",
        isPartOf: { "@id": WEBSITE_ID },
        inLanguage: "en-US",
        isAccessibleForFree: true,
        learningResourceType: "User Guide",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Choose 6-Volume TOC or Statistics TOC",
            text: "Open either table-of-contents drawer in the navbar or explore the full Syllabus Matrix.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Experiment with Custom Equations & Sliders",
            text: "Use MathExpressionInput to plot custom curves and scrub interactive sliders.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Orbit 3D Surfaces & Run Simulations",
            text: "Drag 3D WebGL viewports to orbit, click 2D canvases directly, and inspect the Butterfly color dictionary.",
          },
        ],
      },
    ],
  };
}

export function buildVolumeJsonLd(volume: VolumeMetadata) {
  const volumeUrl = absoluteUrl(`/${volume.slug}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      getCreatorNode(),
      getOrganizationNode(),
      buildBreadcrumbList(
        [
          { name: BRAND_DISPLAY_NAME, path: "/" },
          {
            name: `Volume ${volume.volumeNumber}: ${volume.title}`,
            path: `/${volume.slug}`,
          },
        ],
        volumeUrl
      ),
      {
        "@type": ["Course", "LearningResource"],
        "@id": `${volumeUrl}#volume`,
        url: volumeUrl,
        name: `Volume ${volume.volumeNumber}: ${volume.title}`,
        description: volume.description,
        inLanguage: "en-US",
        isAccessibleForFree: true,
        educationalLevel: "Undergraduate Engineering",
        learningResourceType: "Textbook Volume",
        teaches: volume.engineeringApplications,
        provider: { "@id": ORGANIZATION_ID },
        author: { "@id": CREATOR_ID },
        isPartOf: { "@id": WEBSITE_ID },
        offers: {
          "@type": "Offer",
          category: "Free",
          price: 0,
          priceCurrency: "USD",
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Online",
        },
        hasPart: volume.modules.map((mod, idx) => ({
          "@type": "LearningResource",
          position: idx + 1,
          name: `Module ${mod.numberLabel}: ${mod.title}`,
          description: mod.description,
          url: absoluteUrl(`/${volume.slug}/${mod.slug}`),
        })),
      },
    ],
  };
}

export function buildModuleJsonLd(volume: VolumeMetadata, mod: ModuleMetadata) {
  const moduleUrl = absoluteUrl(`/${volume.slug}/${mod.slug}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      getCreatorNode(),
      getOrganizationNode(),
      buildBreadcrumbList(
        [
          { name: BRAND_DISPLAY_NAME, path: "/" },
          {
            name: `Volume ${volume.volumeNumber}: ${volume.title}`,
            path: `/${volume.slug}`,
          },
          {
            name: `Module ${mod.numberLabel}: ${mod.title}`,
            path: `/${volume.slug}/${mod.slug}`,
          },
        ],
        moduleUrl
      ),
      {
        "@type": ["CollectionPage", "LearningResource"],
        "@id": `${moduleUrl}#module`,
        url: moduleUrl,
        name: `Module ${mod.numberLabel}: ${mod.title}`,
        description: mod.description,
        inLanguage: "en-US",
        isAccessibleForFree: true,
        educationalLevel: "Undergraduate Engineering",
        learningResourceType: "Curriculum Module",
        author: { "@id": CREATOR_ID },
        publisher: { "@id": ORGANIZATION_ID },
        isPartOf: {
          "@type": "LearningResource",
          name: `Volume ${volume.volumeNumber}: ${volume.title}`,
          url: absoluteUrl(`/${volume.slug}`),
        },
        hasPart: mod.chapters.map((chapter, idx) => ({
          "@type": "LearningResource",
          position: idx + 1,
          name: `${chapter.id} ${chapter.title}`,
          description: chapter.subtitle,
          timeRequired: `PT${chapter.estimatedMinutes}M`,
          url: absoluteUrl(`/${volume.slug}/${mod.slug}/${chapter.slug}`),
        })),
      },
    ],
  };
}

export function buildChapterJsonLd(resolved: ResolvedChapterContext) {
  const { volume, module: mod, chapter, route } = resolved;
  const chapterUrl = absoluteUrl(route);
  const fullDescription = [chapter.subtitle, chapter.engineeringContext]
    .filter(Boolean)
    .join(" ");

  return {
    "@context": "https://schema.org",
    "@graph": [
      getCreatorNode(),
      getOrganizationNode(),
      buildBreadcrumbList(
        [
          { name: BRAND_DISPLAY_NAME, path: "/" },
          {
            name: `Volume ${volume.volumeNumber}: ${volume.title}`,
            path: `/${volume.slug}`,
          },
          {
            name: `Module ${mod.numberLabel}: ${mod.title}`,
            path: `/${volume.slug}/${mod.slug}`,
          },
          {
            name: `${chapter.id} ${chapter.title}`,
            path: route,
          },
        ],
        chapterUrl
      ),
      {
        "@type": ["LearningResource", "TechArticle"],
        "@id": `${chapterUrl}#chapter`,
        url: chapterUrl,
        mainEntityOfPage: chapterUrl,
        headline: `${chapter.id}: ${chapter.title}`,
        name: chapter.title,
        description: fullDescription,
        ...(chapter.pedagogicalRhythm
          ? {
              abstract: `${chapter.pedagogicalRhythm.question} ${chapter.pedagogicalRhythm.edgeCasesAndBridge}`,
            }
          : {}),
        image: absoluteUrl("/opengraph-image"),
        inLanguage: "en-US",
        isAccessibleForFree: true,
        learningResourceType: "Interactive Mathematics Lesson",
        interactivityType: "active",
        educationalUse: [
          "Instruction",
          "Interactive Visualization",
          "Self Assessment",
        ],
        educationalLevel: "Undergraduate Engineering",
        timeRequired: `PT${chapter.estimatedMinutes}M`,
        keywords: [
          volume.title,
          mod.title,
          chapter.title,
          ...chapter.labs.map((lab) => lab.title),
        ],
        teaches: [chapter.title, mod.title],
        author: { "@id": CREATOR_ID },
        publisher: { "@id": ORGANIZATION_ID },
        isPartOf: {
          "@type": "LearningResource",
          name: `Module ${mod.numberLabel}: ${mod.title}`,
          url: absoluteUrl(`/${volume.slug}/${mod.slug}`),
        },
        ...(chapter.labs.length > 0
          ? {
              hasPart: chapter.labs.map((lab) => ({
                "@type": ["WebApplication", "LearningResource"],
                name: lab.title,
                description: lab.summary,
                applicationCategory: "EducationalApplication",
                operatingSystem: "Any",
                browserRequirements:
                  "Requires JavaScript with SVG and WebGL support",
              })),
            }
          : {}),
      },
    ],
  };
}
