import type { Metadata } from "next";

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://wannamath.vercel.app");

export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

export const SITE_NAME = "Wanna Math";
export const BRAND_DISPLAY_NAME = "wanna math";
export const BRAND_TAGLINE = "Math ain't scary (not anymore)";

export const SITE_TITLE_DEFAULT =
  "Wanna Math - Interactive Engineering Mathematics Playground";

export const SITE_DESCRIPTION =
  "Explore single-variable calculus, linear algebra, multivariable and vector calculus, differential equations, complex transforms, and numerical methods through synchronized 2D and 3D interactive visualizations.";

export const REPO_URL = "https://github.com/swapnonil2007/WannaMath";
export const REPO_ISSUES_URL =
  "https://github.com/swapnonil2007/WannaMath/issues";

export const CREATOR = {
  name: "Swapnonil Nath",
  affiliation: "IIT Kharagpur",
  githubHandle: "@swapnonil2007",
  githubUrl: "https://github.com/swapnonil2007",
  linkedinUrl: "https://www.linkedin.com/in/swapnonil-nath-gmb-expert/",
  websiteUrl: "https://spotmybusiness.in",
  websiteLabel: "spotmybusiness.in",
} as const;

export const SITE_KEYWORDS = [
  "Wanna Math",
  "engineering mathematics",
  "interactive mathematics textbook",
  "multivariable calculus",
  "double integrals visualization",
  "triple integrals visualization",
  "Jacobian determinant",
  "vector calculus",
  "linear algebra",
  "differential equations",
  "Laplace and Fourier transforms",
  "single variable calculus",
  "numerical methods",
];

export function absoluteUrl(path: string = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath === "/") {
    return `${SITE_URL}/`;
  }
  return `${SITE_URL}${normalizedPath.replace(/\/+$/, "")}`;
}

export function cleanMetadataText(value: string, maxLength?: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!maxLength || normalized.length <= maxLength) {
    return normalized;
  }
  const sliced = normalized.slice(0, maxLength - 1);
  const lastPeriod = sliced.lastIndexOf(". ");
  if (lastPeriod >= Math.floor(maxLength * 0.55)) {
    return sliced.slice(0, lastPeriod + 1).trimEnd();
  }
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 40 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}…`;
}

interface BuildPageMetadataInput {
  title: string;
  absoluteTitle?: string;
  description: string;
  path: string;
  type?: "website" | "article";
  robots?: Metadata["robots"];
}

export function buildPageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  type = "website",
  robots,
}: BuildPageMetadataInput): Metadata {
  const cleanDescription = cleanMetadataText(description, 220);
  const canonicalUrl = absoluteUrl(path);
  const resolvedOgTitle = absoluteTitle ?? `${title} | ${SITE_NAME}`;
  const isHome = path === "/";

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description: cleanDescription,
    alternates: {
      canonical: path,
      types: {
        "text/plain": [
          {
            url: "/llms.txt",
            title: "Wanna Math LLMs Summary",
          },
          {
            url: "/llms-full.txt",
            title: "Wanna Math Full Textbook Catalog (LLMs)",
          },
        ],
      },
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "en_US",
      url: canonicalUrl,
      title: resolvedOgTitle,
      description: cleanDescription,
      ...(isHome
        ? {}
        : {
            images: [
              {
                url: "/opengraph-image",
                width: 1200,
                height: 630,
                alt: `${SITE_NAME} — ${BRAND_TAGLINE}`,
              },
            ],
          }),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedOgTitle,
      description: cleanDescription,
      ...(isHome
        ? {}
        : {
            images: [
              {
                url: "/twitter-image",
                width: 1200,
                height: 630,
                alt: `${SITE_NAME} — ${BRAND_TAGLINE}`,
              },
            ],
          }),
    },
    ...(robots ? { robots } : {}),
  };
}
