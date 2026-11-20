import React from "react";
import { KaTeXMath } from "@/components/math/KaTeXMath";

type RichTextToken =
  | { type: "text"; value: string }
  | { type: "inline-math"; value: string }
  | { type: "block-math"; value: string };

/**
 * Splits prose containing `$...$` inline math, `$$...$$` display math, and `\$` escapes
 * deterministically without regex backtracking.
 */
function tokenizeMathRichText(text: string): RichTextToken[] {
  const tokens: RichTextToken[] = [];
  let textBuffer = "";
  let i = 0;

  const flushText = () => {
    if (textBuffer.length > 0) {
      tokens.push({ type: "text", value: textBuffer });
      textBuffer = "";
    }
  };

  while (i < text.length) {
    if (text[i] === "\\" && text[i + 1] === "$") {
      textBuffer += "$";
      i += 2;
      continue;
    }

    if (text[i] === "$" && text[i + 1] === "$") {
      const closeIdx = text.indexOf("$$", i + 2);
      if (closeIdx !== -1) {
        const mathContent = text.slice(i + 2, closeIdx).trim();
        if (mathContent.length > 0) {
          flushText();
          tokens.push({ type: "block-math", value: mathContent });
          i = closeIdx + 2;
          continue;
        }
      }
      textBuffer += "$$";
      i += 2;
      continue;
    }

    if (text[i] === "$") {
      let j = i + 1;
      let closeIdx = -1;
      while (j < text.length) {
        if (text[j] === "\\" && text[j + 1] === "$") {
          j += 2;
          continue;
        }
        if (text[j] === "$") {
          closeIdx = j;
          break;
        }
        j += 1;
      }

      if (closeIdx !== -1) {
        const mathContent = text.slice(i + 1, closeIdx).trim();
        if (mathContent.length > 0) {
          flushText();
          tokens.push({ type: "inline-math", value: mathContent });
          i = closeIdx + 1;
          continue;
        }
      }

      textBuffer += "$";
      i += 1;
      continue;
    }

    textBuffer += text[i];
    i += 1;
  }

  flushText();
  return tokens;
}

interface MathRichTextProps {
  text: string;
  className?: string;
}

/**
 * Renders plain editorial text interspersed with inline (`$...$`) and display (`$$...$$`)
 * KaTeX expressions using theme-adaptive WCAG AA math inks.
 */
export function MathRichText({ text, className }: MathRichTextProps) {
  const tokens = tokenizeMathRichText(text);

  const rendered = tokens.map((token, idx) => {
    if (token.type === "block-math") {
      return <KaTeXMath key={idx} math={token.value} block />;
    }
    if (token.type === "inline-math") {
      return <KaTeXMath key={idx} math={token.value} />;
    }
    return <React.Fragment key={idx}>{token.value}</React.Fragment>;
  });

  if (className) {
    return <span className={className}>{rendered}</span>;
  }

  return <>{rendered}</>;
}
