import React from "react";
import katex from "katex";

interface KaTeXMathProps {
  math: string;
  block?: boolean;
  className?: string;
  ariaLabel?: string;
}

const KATEX_COLOR_TOKEN_MAP: Record<string, string> = {
  "#8d9fce": "var(--math-ink-x)",
  "#96b898": "var(--math-ink-y)",
  "#029091": "var(--math-ink-z)",
  "#28b7b8": "var(--math-ink-z)",
  "#b95869": "var(--math-ink-upper)",
  "#df7e90": "var(--math-ink-upper)",
  "#d5658b": "var(--math-ink-lower)",
  "#e37ca0": "var(--math-ink-lower)",
  "#d35323": "var(--math-ink-sweep)",
  "#ef7547": "var(--math-ink-sweep)",
  "#fbeaa4": "var(--math-ink-diff)",
  "#aaa36d": "var(--math-ink-grid)",
  "#b2ab75": "var(--math-ink-grid)",
  "#976434": "var(--math-ink-earth)",
  "#d5995e": "var(--math-ink-earth)",
};

function adaptKatexInkColors(renderedHtml: string): string {
  return renderedHtml.replace(
    /style="color:(#[0-9a-fA-F]{6});?"/g,
    (full, hex: string) => {
      const mapped = KATEX_COLOR_TOKEN_MAP[hex.toLowerCase()];
      return mapped ? `style="color:${mapped};"` : full;
    }
  );
}

export function KaTeXMath({
  math,
  block = false,
  className = "",
  ariaLabel,
}: KaTeXMathProps) {
  const html = React.useMemo(() => {
    try {
      const rawHtml = katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: false,
        trust: true,
      });
      return adaptKatexInkColors(rawHtml);
    } catch {
      return math;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        role="math"
        className={`overflow-x-auto py-1 ${className}`}
        aria-label={ariaLabel || math}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      role="math"
      className={className}
      aria-label={ariaLabel || math}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
