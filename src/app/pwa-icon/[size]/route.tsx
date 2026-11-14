import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }];
}

function DoubleIntegralMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
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
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await context.params;
  const dimension = sizeParam === "512" ? 512 : 192;
  const markSize = Math.round(dimension * 0.68);
  const borderSize = Math.max(4, Math.round(dimension * 0.04));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFBE4",
          border: `${borderSize}px solid #7C7454`,
        }}
      >
        <DoubleIntegralMark size={markSize} />
      </div>
    ),
    {
      width: dimension,
      height: dimension,
    }
  );
}
