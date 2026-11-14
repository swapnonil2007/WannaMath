const BUTTERFLY_TO_ADAPTIVE_INK: Record<string, string> = {
  "#8d9fce": "var(--math-ink-x)",
  "#96b898": "var(--math-ink-y)",
  "#029091": "var(--math-ink-z)",
  "#b95869": "var(--math-ink-upper)",
  "#d5658b": "var(--math-ink-lower)",
  "#d35323": "var(--math-ink-sweep)",
  "#fbeaa4": "var(--math-ink-diff)",
  "#aaa36d": "var(--math-ink-grid)",
  "#976434": "var(--math-ink-earth)",
};

/**
 * Maps a raw Butterfly palette hex color to its theme-adaptive WCAG AA ink CSS
 * custom property (--math-ink-*), preserving Dark Drafting Slate hues while
 * ensuring >= 4.5:1 text contrast on Warm Textbook Paper Light Mode surfaces.
 */
export function getAdaptiveAccentInk(hex?: string): string | undefined {
  if (!hex) return undefined;
  return BUTTERFLY_TO_ADAPTIVE_INK[hex.trim().toLowerCase()] ?? hex;
}
