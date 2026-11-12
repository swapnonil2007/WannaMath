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
 * Real-valued mathematical functions injected into the evaluation scope so
 * boundary and out-of-domain values (e.g., sqrt(1 - x^2 - y^2) when x^2 + y^2 >= 1)
 * smoothly evaluate to 0 on the xy-plane instead of returning Complex numbers or jumping to a fallback.
 */
const REAL_MATH_SCOPE: Record<string, unknown> = {
  pi: Math.PI,
  PI: Math.PI,
  e: Math.E,
  E: Math.E,
  sqrt: (v: number) => (typeof v === "number" && v > 0 ? Math.sqrt(v) : 0),
  cbrt: (v: number) => (typeof v === "number" ? Math.cbrt(v) : 0),
  abs: (v: number) => Math.abs(Number(v) || 0),
  sin: (v: number) => Math.sin(Number(v) || 0),
  cos: (v: number) => Math.cos(Number(v) || 0),
  tan: (v: number) => Math.tan(Number(v) || 0),
  asin: (v: number) => Math.asin(Math.max(-1, Math.min(1, Number(v) || 0))),
  acos: (v: number) => Math.acos(Math.max(-1, Math.min(1, Number(v) || 0))),
  atan: (v: number) => Math.atan(Number(v) || 0),
  sinh: (v: number) => Math.sinh(Number(v) || 0),
  cosh: (v: number) => Math.cosh(Number(v) || 0),
  tanh: (v: number) => Math.tanh(Number(v) || 0),
  exp: (v: number) => Math.exp(Math.min(10, Number(v) || 0)),
  log: (v: number) => (typeof v === "number" && v > 1e-12 ? Math.log(v) : 0),
  ln: (v: number) => (typeof v === "number" && v > 1e-12 ? Math.log(v) : 0),
  pow: (a: number, b: number) => {
    const res = Math.pow(Number(a) || 0, Number(b) || 0);
    return Number.isFinite(res) ? res : 0;
  },
  min: (...args: number[]) => Math.min(...args.map((a) => Number(a) || 0)),
  max: (...args: number[]) => Math.max(...args.map((a) => Number(a) || 0)),
};

/**
 * Safely parses and compiles a user-typed mathematical expression (e.g., "sqrt(1 - (x^2 + y^2))")
 * into both a KaTeX string and a fast real-valued numerical evaluator.
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
      error: "Enter a mathematical expression (for example: sqrt(1 - (x^2 + y^2))).",
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

    // Test evaluation at sample values to catch arity/syntax errors early
    const testScope: Record<string, unknown> = {
      ...REAL_MATH_SCOPE,
    };
    for (const v of allowedVars) {
      testScope[v] = 0.25;
    }
    const testResult = compiled.evaluate(testScope);
    const isComplexObj =
      testResult !== null &&
      typeof testResult === "object" &&
      "re" in (testResult as Record<string, unknown>);
    if (
      typeof testResult !== "number" &&
      typeof testResult !== "boolean" &&
      !isComplexObj
    ) {
      return {
        raw: expressionStr,
        tex: trimmed,
        valid: false,
        error: "Expression must evaluate to a scalar expression.",
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
          ...REAL_MATH_SCOPE,
          ...scope,
        });
        if (typeof val === "number") {
          if (Number.isFinite(val)) {
            return Math.max(-25, Math.min(25, val));
          }
          return 0;
        }
        if (val && typeof val === "object" && "re" in val) {
          const c = val as { re?: number; im?: number };
          if (typeof c.im === "number" && Math.abs(c.im) > 1e-9) {
            return 0;
          }
          if (typeof c.re === "number" && Number.isFinite(c.re)) {
            return Math.max(-25, Math.min(25, c.re));
          }
          return 0;
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
