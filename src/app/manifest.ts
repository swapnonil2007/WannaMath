import type { MetadataRoute } from "next";
import { BRAND_TAGLINE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/siteConfig";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${BRAND_TAGLINE}`,
    short_name: "wanna math",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#1E1F22",
    theme_color: "#1E1F22",
    categories: ["education", "mathematics", "reference"],
    icons: [
      {
        src: "/pwa-icon/192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa-icon/512",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
