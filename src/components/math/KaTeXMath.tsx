import React from "react";
import katex from "katex";

interface KaTeXMathProps {
  math: string;
  block?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function KaTeXMath({
  math,
  block = false,
  className = "",
  ariaLabel,
}: KaTeXMathProps) {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`overflow-x-auto py-1 ${className}`}
        aria-label={ariaLabel || math}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={className}
      aria-label={ariaLabel || math}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
