import type { FormulaSheetDefinition } from "./types";

export const LIMITS_FORMULA_SHEET: FormulaSheetDefinition = {
  slug: "limits",
  title: "Common Limit Formulas, Properties & Evaluation Techniques",
  shortTitle: "Limit Formulas",
  subtitle:
    "Precise and one-sided definitions, algebraic limit laws, standard trigonometric and exponential limits, end behavior at ±∞, evaluation methods, and continuity.",
  badge: "FORMULA SHEET • MODULE 1.1",
  accentHex: "#8D9FCE",
  backChapterRoute: "/single-variable-calculus/limits-continuity/limits",
  backChapterLabel: "Back to Ch. 1.1.1: Limits (LHL & RHL)",
  relatedSlugs: ["derivatives", "taylor-expansions", "integrals"],
  accuracyNotes: [
    "Finite Existence vs. Infinite Limit Notation: Writing $\\lim_{x \\to a} f(x) = \\pm\\infty$ describes unbounded divergence—the limit does not exist as a finite real number.",
    "L'Hôpital's Rule Existence Condition: Differentiating numerator and denominator applies only when $f, g$ are differentiable near $a$ with $g'(x) \\neq 0$ and the resulting limit $\\lim_{x \\to a} f'(x)/g'(x)$ actually exists (or equals $\\pm\\infty$).",
    "Even-Root Limit Law: $\\lim_{x \\to a} \\sqrt[n]{f(x)} = \\sqrt[n]{\\lim_{x \\to a} f(x)}$ requires $\\lim_{x \\to a} f(x) \\ge 0$ (and $f(x) \\ge 0$ near $a$) whenever $n$ is even.",
  ],
  sections: [
    {
      id: "definitions",
      title: "1. Definitions of Limits & One-Sided Limits",
      accentHex: "#8D9FCE",
      intro:
        "A limit inspects the behavior of $f(x)$ as $x$ approaches $a$ without ever requiring $x = a$ (or even requiring $f(a)$ to be defined).",
      formulas: [
        {
          label: "Precise ε–δ Definition",
          latex:
            "\\lim_{x \\to a} f(x) = L \\iff \\forall \\varepsilon > 0,\\; \\exists \\delta > 0 : 0 < |x - a| < \\delta \\implies |f(x) - L| < \\varepsilon",
          note: "Working definition: we can make $f(x)$ arbitrarily close to $L$ by taking $x$ sufficiently close to $a$ on either side, without letting $x = a$.",
        },
        {
          label: "Right-Hand Limit (RHL)",
          latex:
            "\\lim_{x \\to a^+} f(x) = L \\iff \\forall \\varepsilon > 0,\\; \\exists \\delta > 0 : 0 < x - a < \\delta \\implies |f(x) - L| < \\varepsilon",
          condition: "Approaching from the right ($x > a$)",
        },
        {
          label: "Left-Hand Limit (LHL)",
          latex:
            "\\lim_{x \\to a^-} f(x) = L \\iff \\forall \\varepsilon > 0,\\; \\exists \\delta > 0 : 0 < a - x < \\delta \\implies |f(x) - L| < \\varepsilon",
          condition: "Approaching from the left ($x < a$)",
        },
        {
          label: "Limits at Infinity",
          latex:
            "\\lim_{x \\to \\infty} f(x) = L, \\qquad \\lim_{x \\to -\\infty} f(x) = L",
          note: "$f(x)$ settles as close to $L$ as desired by taking $x$ sufficiently large positive ($x \\to \\infty$) or sufficiently large negative ($x \\to -\\infty$).",
        },
        {
          label: "Infinite Limits (Vertical Divergence)",
          latex:
            "\\lim_{x \\to a} f(x) = \\infty, \\qquad \\lim_{x \\to a} f(x) = -\\infty",
          note: "$f(x)$ grows arbitrarily large positive ($+\\infty$) or negative ($-\\infty$) as $x \\to a$ without touching $a$.",
        },
      ],
    },
    {
      id: "one-sided-criterion",
      title: "2. Two-Sided vs. One-Sided Limit Criterion",
      accentHex: "#96B898",
      intro:
        "A two-sided finite limit exists if and only if both one-sided limits exist finitely and match.",
      formulas: [
        {
          label: "Two-Sided Existence Equivalence",
          latex:
            "\\lim_{x \\to a} f(x) = L \\iff \\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x) = L",
          condition: "$L \\in \\mathbb{R}$ finite",
        },
        {
          label: "Jump / Mismatch Non-Existence",
          latex:
            "\\lim_{x \\to a^+} f(x) \\neq \\lim_{x \\to a^-} f(x) \\implies \\lim_{x \\to a} f(x) \\text{ Does Not Exist}",
          note: "Even if $f(a)$ is defined at $x = a$, unequal left and right limits forbid a two-sided limit.",
        },
      ],
    },
    {
      id: "properties",
      title: "3. Algebraic Limit Properties",
      accentHex: "#029091",
      intro:
        "Assume $\\lim_{x \\to a} f(x)$ and $\\lim_{x \\to a} g(x)$ both exist finitely, and $c$ is any real constant.",
      formulas: [
        {
          label: "1. Constant Multiple",
          latex: "\\lim_{x \\to a} \\bigl[c\\,f(x)\\bigr] = c \\lim_{x \\to a} f(x)",
        },
        {
          label: "2. Sum & Difference",
          latex:
            "\\lim_{x \\to a} \\bigl[f(x) \\pm g(x)\\bigr] = \\lim_{x \\to a} f(x) \\pm \\lim_{x \\to a} g(x)",
        },
        {
          label: "3. Product Law",
          latex:
            "\\lim_{x \\to a} \\bigl[f(x)\\,g(x)\\bigr] = \\left(\\lim_{x \\to a} f(x)\\right)\\left(\\lim_{x \\to a} g(x)\\right)",
        },
        {
          label: "4. Quotient Law",
          latex:
            "\\lim_{x \\to a} \\left[\\frac{f(x)}{g(x)}\\right] = \\frac{\\lim_{x \\to a} f(x)}{\\lim_{x \\to a} g(x)}",
          condition: "Provided $\\lim_{x \\to a} g(x) \\neq 0$",
        },
        {
          label: "5. Power Law",
          latex:
            "\\lim_{x \\to a} \\bigl[f(x)\\bigr]^n = \\left[\\lim_{x \\to a} f(x)\\right]^n",
          condition: "If $n < 0$, requires $\\lim_{x \\to a} f(x) \\neq 0$",
        },
        {
          label: "6. Root Law",
          latex:
            "\\lim_{x \\to a} \\sqrt[n]{f(x)} = \\sqrt[n]{\\lim_{x \\to a} f(x)}",
          condition: "If $n$ is even, requires $\\lim_{x \\to a} f(x) \\ge 0$ and $f(x) \\ge 0$ near $a$",
        },
      ],
    },
    {
      id: "fundamental-limits",
      title: "4. Standard Fundamental Limits & Squeeze Theorem",
      accentHex: "#D35323",
      intro:
        "Key trigonometric, exponential, logarithmic, and algebraic limits used directly in differentiation and series analysis ($x$ in radians).",
      formulas: [
        {
          label: "Fundamental Sine Limit",
          latex: "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1",
        },
        {
          label: "Tangent & Cosine Limits",
          latex:
            "\\lim_{x \\to 0} \\frac{\\tan x}{x} = 1, \\qquad \\lim_{x \\to 0} \\frac{1 - \\cos x}{x} = 0, \\qquad \\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2} = \\frac{1}{2}",
        },
        {
          label: "Inverse Trig Limits",
          latex:
            "\\lim_{x \\to 0} \\frac{\\sin^{-1} x}{x} = 1, \\qquad \\lim_{x \\to 0} \\frac{\\tan^{-1} x}{x} = 1",
        },
        {
          label: "Exponential & Logarithmic Forms",
          latex:
            "\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1, \\qquad \\lim_{x \\to 0} \\frac{a^x - 1}{x} = \\ln a\\;(a>0), \\qquad \\lim_{x \\to 0} \\frac{\\ln(1+x)}{x} = 1",
        },
        {
          label: "Euler's Constant e Limits",
          latex:
            "\\lim_{x \\to 0} (1 + x)^{1/x} = e, \\qquad \\lim_{x \\to \\infty} \\left(1 + \\frac{1}{x}\\right)^x = e, \\qquad \\lim_{x \\to \\infty} \\left(1 + \\frac{k}{x}\\right)^x = e^k",
        },
        {
          label: "Algebraic Power Difference",
          latex: "\\lim_{x \\to a} \\frac{x^n - a^n}{x - a} = n\\,a^{n-1}",
          condition: "$n \\in \\mathbb{Q}$ (with $a > 0$ if non-integer)",
        },
        {
          label: "Squeeze (Sandwich) Theorem",
          latex:
            "g(x) \\le f(x) \\le h(x) \\text{ near } a \\;\\&\\; \\lim_{x \\to a} g(x) = \\lim_{x \\to a} h(x) = L \\implies \\lim_{x \\to a} f(x) = L",
        },
      ],
    },
    {
      id: "limits-at-infinity",
      title: "5. Basic Limit Evaluations at ±∞",
      accentHex: "#B95869",
      intro:
        "Reference growth and decay rates where $\\operatorname{sgn}(a) = +1$ if $a > 0$ and $\\operatorname{sgn}(a) = -1$ if $a < 0$.",
      formulas: [
        {
          label: "1. Exponential End Behavior",
          latex:
            "\\lim_{x \\to \\infty} e^x = \\infty \\quad \\& \\quad \\lim_{x \\to -\\infty} e^x = 0",
        },
        {
          label: "2. Natural Logarithm Behavior",
          latex:
            "\\lim_{x \\to \\infty} \\ln(x) = \\infty \\quad \\& \\quad \\lim_{x \\to 0^+} \\ln(x) = -\\infty",
        },
        {
          label: "3. Reciprocal Decay (+∞)",
          latex: "\\lim_{x \\to \\infty} \\frac{b}{x^r} = 0",
          condition: "$r > 0$",
        },
        {
          label: "4. Reciprocal Decay (−∞)",
          latex: "\\lim_{x \\to -\\infty} \\frac{b}{x^r} = 0",
          condition: "$r > 0$ and $x^r$ is real for negative $x$",
        },
        {
          label: "5. Even Power End Behavior",
          latex: "\\lim_{x \\to \\pm\\infty} x^n = \\infty",
          condition: "$n \\ge 2$ even integer",
        },
        {
          label: "6. Odd Power End Behavior",
          latex:
            "\\lim_{x \\to \\infty} x^n = \\infty \\quad \\& \\quad \\lim_{x \\to -\\infty} x^n = -\\infty",
          condition: "$n \\ge 1$ odd integer",
        },
        {
          label: "7. Even-Degree Polynomial at ±∞",
          latex:
            "\\lim_{x \\to \\pm\\infty} \\bigl(a x^n + \\cdots + b x + c\\bigr) = \\operatorname{sgn}(a)\\,\\infty",
          condition: "$n \\ge 2$ even, $a \\neq 0$",
        },
        {
          label: "8 & 9. Odd-Degree Polynomial at ±∞",
          latex:
            "\\lim_{x \\to \\infty} \\bigl(a x^n + \\cdots + c\\bigr) = \\operatorname{sgn}(a)\\,\\infty, \\qquad \\lim_{x \\to -\\infty} \\bigl(a x^n + \\cdots + c\\bigr) = -\\operatorname{sgn}(a)\\,\\infty",
          condition: "$n \\ge 1$ odd, $a \\neq 0$",
        },
      ],
    },
    {
      id: "evaluation-techniques",
      title: "6. Evaluation Techniques & Worked Examples",
      accentHex: "#AAA36D",
      formulas: [
        {
          label: "Direct Substitution (Continuous Functions)",
          latex: "\\text{If } f \\text{ is continuous at } a, \\text{ then } \\lim_{x \\to a} f(x) = f(a)",
        },
        {
          label: "Continuity Under Composition",
          latex:
            "f \\text{ continuous at } b \\;\\&\\; \\lim_{x \\to a} g(x) = b \\implies \\lim_{x \\to a} f\\bigl(g(x)\\bigr) = f\\!\\left(\\lim_{x \\to a} g(x)\\right) = f(b)",
        },
        {
          label: "L'Hôpital's Rule",
          latex:
            "\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\frac{0}{0} \\text{ or } \\frac{\\pm\\infty}{\\pm\\infty} \\implies \\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)}",
          condition:
            "$a$ finite or $\\pm\\infty$; $f, g$ differentiable near $a$ with $g'(x) \\neq 0$, and $\\lim_{x\\to a} f'(x)/g'(x)$ exists or is $\\pm\\infty$.",
          note: "Counterexample when derivative ratio oscillates: $\\lim_{x\\to\\infty} \\frac{x + \\sin x}{x} = 1$, yet $\\frac{f'(x)}{g'(x)} = 1 + \\cos x$ has no limit.",
        },
      ],
      examples: [
        {
          title: "Factor and Cancel (Removable 0/0 Hole)",
          stepsLatex: [
            "\\lim_{x \\to 2} \\frac{x^2 + 4x - 12}{x^2 - 2x} = \\lim_{x \\to 2} \\frac{(x - 2)(x + 6)}{x(x - 2)} = \\lim_{x \\to 2} \\frac{x + 6}{x} = \\frac{8}{2} = 4",
          ],
          takeaway:
            "Canceling $(x - 2)$ is legal inside the limit because $x \\neq 2$ when taking $x \\to 2$.",
        },
        {
          title: "Rationalize Numerator or Denominator",
          stepsLatex: [
            "\\lim_{x \\to 9} \\frac{3 - \\sqrt{x}}{x^2 - 81} = \\lim_{x \\to 9} \\frac{3 - \\sqrt{x}}{x^2 - 81} \\cdot \\frac{3 + \\sqrt{x}}{3 + \\sqrt{x}} = \\lim_{x \\to 9} \\frac{9 - x}{(x^2 - 81)(3 + \\sqrt{x})} = \\lim_{x \\to 9} \\frac{-1}{(x + 9)(3 + \\sqrt{x})} = \\frac{-1}{(18)(6)} = -\\frac{1}{108}",
          ],
        },
        {
          title: "Combine Rational Expressions",
          stepsLatex: [
            "\\lim_{h \\to 0} \\frac{1}{h}\\left(\\frac{1}{x + h} - \\frac{1}{x}\\right) = \\lim_{h \\to 0} \\frac{1}{h}\\left(\\frac{x - (x + h)}{x(x + h)}\\right) = \\lim_{h \\to 0} \\frac{-1}{x(x + h)} = -\\frac{1}{x^2}",
          ],
          takeaway: "This exact cancellation gives $\\frac{d}{dx}(1/x) = -1/x^2$.",
        },
        {
          title: "Polynomials at Infinity (Factor Highest Power)",
          stepsLatex: [
            "\\lim_{x \\to -\\infty} \\frac{3x^2 - 4}{5x - 2x^2} = \\lim_{x \\to -\\infty} \\frac{x^2\\left(3 - \\frac{4}{x^2}\\right)}{x^2\\left(\\frac{5}{x} - 2\\right)} = \\lim_{x \\to -\\infty} \\frac{3 - \\frac{4}{x^2}}{\\frac{5}{x} - 2} = -\\frac{3}{2}",
          ],
        },
        {
          title: "Piecewise Function (Compare LHL and RHL)",
          stepsLatex: [
            "g(x) = \\begin{cases} x^2 + 5 & \\text{if } x < -2 \\\\ 1 - 3x & \\text{if } x \\ge -2 \\end{cases}",
            "\\lim_{x \\to -2^-} g(x) = (-2)^2 + 5 = 9, \\qquad \\lim_{x \\to -2^+} g(x) = 1 - 3(-2) = 7 \\implies \\lim_{x \\to -2} g(x) \\text{ DNE}",
          ],
          takeaway:
            "Because $9 \\neq 7$, the two-sided limit does not exist; had both matched, the limit would equal that shared value.",
        },
      ],
    },
    {
      id: "continuous-functions-ivt",
      title: "7. Continuous Functions Reference & Intermediate Value Theorem",
      accentHex: "#D5658B",
      bulletNotes: [
        "1. Polynomials are continuous for all real $x \\in \\mathbb{R}$.",
        "2. Rational functions $P(x)/Q(x)$ are continuous everywhere except points where $Q(x) = 0$.",
        "3. $\\sqrt[n]{x}$ with $n$ odd is continuous for all $x \\in \\mathbb{R}$.",
        "4. $\\sqrt[n]{x}$ with $n$ even is continuous for all $x \\ge 0$.",
        "5. $e^x$ is continuous for all $x \\in \\mathbb{R}$.",
        "6. $\\ln(x)$ is continuous for all $x > 0$.",
        "7. $\\cos(x)$ and $\\sin(x)$ are continuous for all $x \\in \\mathbb{R}$.",
        "8. $\\tan(x)$ and $\\sec(x)$ are continuous provided $x \\neq \\cdots, -\\frac{3\\pi}{2}, -\\frac{\\pi}{2}, \\frac{\\pi}{2}, \\frac{3\\pi}{2}, \\cdots$.",
        "9. $\\cot(x)$ and $\\csc(x)$ are continuous provided $x \\neq \\cdots, -2\\pi, -\\pi, 0, \\pi, 2\\pi, \\cdots$.",
      ],
      formulas: [
        {
          label: "Intermediate Value Theorem (IVT)",
          latex:
            "f \\text{ continuous on } [a, b] \\;\\&\\; M \\text{ between } f(a) \\text{ and } f(b) \\implies \\exists\\, c \\in (a, b) : f(c) = M",
        },
      ],
    },
  ],
};
