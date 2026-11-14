import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { BRAND_DISPLAY_NAME, BRAND_TAGLINE } from "@/lib/seo/siteConfig";

export const alt =
  "Wanna Math — Math ain't scary (not anymore) | Interactive 6-Volume Engineering Mathematics Textbook";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const katexMainBold = readFileSync(
  path.join(process.cwd(), "node_modules/katex/dist/fonts/KaTeX_Main-Bold.ttf")
);

const katexSansRegular = readFileSync(
  path.join(
    process.cwd(),
    "node_modules/katex/dist/fonts/KaTeX_SansSerif-Regular.ttf"
  )
);

const BUTTERFLY_SWATCHES = [
  "#8D9FCE",
  "#FBEAA4",
  "#B95869",
  "#96B898",
  "#D35323",
  "#D5658B",
  "#029091",
  "#AAA36D",
];

const STATS = [
  { label: "6 Volumes", color: "#8D9FCE" },
  { label: "20 Modules", color: "#96B898" },
  { label: "65 Chapters", color: "#029091" },
  { label: "82 Interactive Labs", color: "#D35323" },
];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1E1F22",
          color: "#FFFBE4",
          padding: 48,
          fontFamily: "KaTeX Sans",
        }}
      >
        {/* Inner Elevated Drafting Card (Flat Surface, 1px Border, Zero Gradients) */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#25272C",
            border: "2px solid #6C707C",
          }}
        >
          {/* Top 8-Swatch Palette Strip */}
          <div style={{ display: "flex", width: "100%", height: 10 }}>
            {BUTTERFLY_SWATCHES.map((hex) => (
              <div
                key={hex}
                style={{
                  display: "flex",
                  flex: 1,
                  height: 10,
                  backgroundColor: hex,
                }}
              />
            ))}
          </div>

          {/* Center Body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
              padding: "44px 52px",
            }}
          >
            {/* Brand Lockup */}
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div
                style={{
                  width: 84,
                  height: 84,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#1E1F22",
                  border: "2px solid #6C707C",
                }}
              >
                <svg
                  width={56}
                  height={56}
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M32 13C30 9 26 10 25 18L21 46C20 54 16 55 14 51"
                    stroke="#8D9FCE"
                    strokeWidth="4.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M50 13C48 9 44 10 43 18L39 46C38 54 34 55 32 51"
                    stroke="#8D9FCE"
                    strokeWidth="4.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div
                  style={{
                    display: "flex",
                    fontFamily: "KaTeX Serif",
                    fontSize: 48,
                    fontWeight: 700,
                    lineHeight: 1.05,
                    color: "#FFFBE4",
                  }}
                >
                  {BRAND_DISPLAY_NAME}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontFamily: "KaTeX Sans",
                    fontSize: 22,
                    color: "#CCC8B8",
                  }}
                >
                  {BRAND_TAGLINE}
                </div>
              </div>
            </div>

            {/* Headline & Subtitle */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  fontFamily: "KaTeX Serif",
                  fontSize: 44,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: "#FFFBE4",
                }}
              >
                Interactive 6-Volume Engineering Mathematics Textbook
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "KaTeX Sans",
                  fontSize: 22,
                  lineHeight: 1.4,
                  color: "#CCC8B8",
                }}
              >
                Synchronized 2D domain plots, 3D WebGL spatial geometry, and
                step-by-step formal TeX derivations.
              </div>
            </div>

            {/* Curriculum Coverage Chips */}
            <div style={{ display: "flex", gap: 16 }}>
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 18px",
                    backgroundColor: "#1E1F22",
                    border: "1px solid #383B43",
                    fontFamily: "KaTeX Sans",
                    fontSize: 18,
                    color: "#FFFBE4",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: 10,
                      height: 10,
                      backgroundColor: stat.color,
                    }}
                  />
                  <div style={{ display: "flex" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "KaTeX Serif",
          data: katexMainBold,
          style: "normal",
          weight: 700,
        },
        {
          name: "KaTeX Sans",
          data: katexSansRegular,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
