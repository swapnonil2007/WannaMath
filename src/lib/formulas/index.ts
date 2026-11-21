import type { FormulaSheetDefinition, FormulaSheetSlug } from "./types";
import { LIMITS_FORMULA_SHEET } from "./limits";
import { DERIVATIVES_FORMULA_SHEET } from "./derivatives";
import { TAYLOR_FORMULA_SHEET } from "./taylorExpansions";
import { INTEGRALS_FORMULA_SHEET } from "./integrals";
import { MULTIVARIABLE_DERIVATIVES_FORMULA_SHEET } from "./multivariableDerivatives";
import { ODE_METHODS_FORMULA_SHEET } from "./odeMethods";
import { MULTIPLE_INTEGRALS_FORMULA_SHEET } from "./multipleIntegralsJacobians";
import { CONVERGENCE_GAMMA_BETA_FORMULA_SHEET } from "./convergenceGammaBeta";
import { VECTOR_CALCULUS_FORMULA_SHEET } from "./vectorCalculus";

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
  MULTIVARIABLE_DERIVATIVES_FORMULA_SHEET,
  ODE_METHODS_FORMULA_SHEET,
  MULTIPLE_INTEGRALS_FORMULA_SHEET,
  CONVERGENCE_GAMMA_BETA_FORMULA_SHEET,
  VECTOR_CALCULUS_FORMULA_SHEET,
];

export function getAllFormulaSheets(): FormulaSheetDefinition[] {
  return ALL_FORMULA_SHEETS;
}

export function getFormulaSheetsByVolume(
  volumeId: "vol-1" | "vol-3"
): FormulaSheetDefinition[] {
  return ALL_FORMULA_SHEETS.filter((sheet) => sheet.volumeId === volumeId);
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
