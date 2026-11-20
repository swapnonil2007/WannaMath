import type { FormulaSheetDefinition, FormulaSheetSlug } from "./types";
import { LIMITS_FORMULA_SHEET } from "./limits";
import { DERIVATIVES_FORMULA_SHEET } from "./derivatives";
import { TAYLOR_FORMULA_SHEET } from "./taylorExpansions";
import { INTEGRALS_FORMULA_SHEET } from "./integrals";

export type {
  FormulaSheetSlug,
  FormulaEntry,
  FormulaWorkedExample,
  FormulaTable,
  FormulaSection,
  FormulaSheetDefinition,
} from "./types";

export const ALL_FORMULA_SHEETS: FormulaSheetDefinition[] = [
  LIMITS_FORMULA_SHEET,
  DERIVATIVES_FORMULA_SHEET,
  TAYLOR_FORMULA_SHEET,
  INTEGRALS_FORMULA_SHEET,
];

export function getAllFormulaSheets(): FormulaSheetDefinition[] {
  return ALL_FORMULA_SHEETS;
}

export function getFormulaSheetBySlug(
  slug: string
): FormulaSheetDefinition | undefined {
  return ALL_FORMULA_SHEETS.find((sheet) => sheet.slug === slug);
}

export function isValidFormulaSheetSlug(
  slug: string
): slug is FormulaSheetSlug {
  return ALL_FORMULA_SHEETS.some((sheet) => sheet.slug === slug);
}
