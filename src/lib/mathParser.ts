import { parse, EvalFunction } from "mathjs";

export interface CompiledMathExpression {
  raw: string;
  tex: string;
  valid: boolean;
  error?: string;
  evaluate: (scope: Record<string, number>) => number;
}

const ALLOWED_FUNCTIONS_AND_CONSTANTS = new Set([
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "sinh",
  "cosh",
  "tanh",
  "sqrt",
  "cbrt",
  "exp",
  "log",
  "ln",
  "abs",
  "min",
  "max",
  "pow",
  "pi",
  "PI",
  "e",
  "E",
]);

/**
 * Safely parses and compiles a user-typed mathematical expression (e.g., "1.5 - 0.4*(x^2 + y^2)")
 * into both a KaTeX string and a fast numerical evaluator.
 */
export function compileMathExpression(
  expressionStr: string,
  allowedVars: string[],
  fallbackValue = 0
): CompiledMathExpression {
  const trimmed = expressionStr.trim();
  if (!trimmed) {
    return {
      raw: expressionStr,
      tex: "\\text{?}",
      valid: false,
      error: "Enter a mathematical expression (for example: 1.5 - 0.4*(x^2 + y^2)).",
      evaluate: () => fallbackValue,
    };
  }

  // Normalize common shorthand like ln(x) -> log(x)
  const normalized = trimmed.replace(/\bln\s*\(/g, "log(");

  try {
    const node = parse(normalized);

    // Check for unknown symbols so typos like "x + q" give a helpful message
    const allowedSet = new Set([...allowedVars, ...ALLOWED_FUNCTIONS_AND_CONSTANTS]);
    let unknownSymbol: string | null = null;

    node.traverse((child) => {
      if (child.type === "SymbolNode") {
        const symName = (child as unknown as { name: string }).name;
        if (!allowedSet.has(symName)) {
          unknownSymbol = symName;
        }
      }
    });

    if (unknownSymbol) {
      return {
        raw: expressionStr,
        tex: trimmed,
        valid: false,
        error: `Unknown variable or function "${unknownSymbol}". Allowed variables here: ${allowedVars.join(
          ", "
        )}.`,
        evaluate: () => fallbackValue,
      };
    }

    const compiled: EvalFunction = node.compile();

    // Test evaluation at mid-range sample values to catch arity/type errors early
    const testScope: Record<string, number> = {
      pi: Math.PI,
      e: Math.E,
    };
    for (const v of allowedVars) {
      testScope[v] = 0.5;
    }
    const testResult = compiled.evaluate(testScope);
    if (typeof testResult !== "number" && typeof testResult !== "boolean") {
      return {
        raw: expressionStr,
        tex: trimmed,
        valid: false,
        error: "Expression must evaluate to a real scalar number.",
        evaluate: () => fallbackValue,
      };
    }

    let tex = trimmed;
    try {
      tex = node.toTex({ parenthesis: "keep", implicit: "hide" });
    } catch {
      tex = trimmed;
    }

    const evaluate = (scope: Record<string, number>): number => {
      try {
        const val = compiled.evaluate({
          pi: Math.PI,
          e: Math.E,
          ...scope,
        });
        if (typeof val === "number" && Number.isFinite(val)) {
          return Math.max(-25, Math.min(25, val));
        }
        return fallbackValue;
      } catch {
        return fallbackValue;
      }
    };

    return {
      raw: expressionStr,
      tex,
      valid: true,
      evaluate,
    };
  } catch {
    return {
      raw: expressionStr,
      tex: trimmed,
      valid: false,
      error: `Check syntax (e.g., use * for multiplication or matching parentheses: ${allowedVars.join(
        " + "
      )}).`,
      evaluate: () => fallbackValue,
    };
  }
}
