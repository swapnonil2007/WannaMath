export type FormulaSheetSlug =
  | "limits"
  | "derivatives"
  | "taylor-expansions"
  | "integrals";

export interface FormulaEntry {
  label?: string;
  latex: string;
  /** Explicit domain, parameter, or rigor condition (supports inline $...$ via MathRichText) */
  condition?: string;
  /** Optional concise conceptual or accuracy note (supports inline $...$ via MathRichText) */
  note?: string;
}

export interface FormulaWorkedExample {
  title: string;
  stepsLatex: string[];
  takeaway?: string;
}

export interface FormulaTable {
  title: string;
  headers: string[];
  /** Each row contains cell strings; cells using $...$ render KaTeX via MathRichText */
  rows: string[][];
}

export interface FormulaSection {
  id: string;
  title: string;
  accentHex: string;
  intro?: string;
  formulas?: FormulaEntry[];
  examples?: FormulaWorkedExample[];
  table?: FormulaTable;
  bulletNotes?: string[];
}

export interface FormulaSheetDefinition {
  slug: FormulaSheetSlug;
  title: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
  accentHex: string;
  backChapterRoute: string;
  backChapterLabel: string;
  relatedSlugs: FormulaSheetSlug[];
  sections: FormulaSection[];
  accuracyNotes?: string[];
}
