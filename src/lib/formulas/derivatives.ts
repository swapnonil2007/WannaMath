import type { FormulaSheetDefinition } from "./types";

export const DERIVATIVES_FORMULA_SHEET: FormulaSheetDefinition = {
  slug: "derivatives",
  volumeId: "vol-1",
  volumeLabel: "Volume I: Single-Variable Calculus",
  previewLatex: "\\frac{d}{dx}\\bigl[f(g(x))\\bigr] = f'(g(x))\\,g'(x)",
  title: "Common Derivative Formulas, Differentiation Rules & Domains",
  shortTitle: "Derivative Formulas",
  subtitle:
    "Core linearity, product, quotient, and chain rules alongside standard polynomial, trigonometric, inverse trigonometric, exponential, logarithmic, and hyperbolic derivatives.",
  badge: "FORMULA SHEET • MODULE 1.2",
  accentHex: "#D35323",
  backChapterRoute:
    "/single-variable-calculus/differential-calculus/secant-tangent-homotopy",
  backChapterLabel: "Back to Ch. 1.2.1: Derivatives & Secant-Tangent",
  relatedSlugs: ["limits", "taylor-expansions", "integrals"],
  accuracyNotes: [
    "Domain & Principal-Branch Care for Inverse Trig: $\\sin^{-1}(x)$ and $\\cos^{-1}(x)$ are differentiable on $(-1, 1)$ (vertical tangents occur at $x = \\pm 1$). For $\\sec^{-1}(x) \\in [0, \\frac{\\pi}{2}) \\cup (\\frac{\\pi}{2}, \\pi]$ and $\\csc^{-1}(x) \\in [-\\frac{\\pi}{2}, 0) \\cup (0, \\frac{\\pi}{2}]$, the $|x|$ factor guarantees the correct sign on $|x| > 1$.",
  ],
  sections: [
    {
      id: "basic-rules",
      title: "1. Basic Properties, Formulas & Rules",
      accentHex: "#D35323",
      formulas: [
        {
          label: "Constant Rule",
          latex: "\\frac{d}{dx}(c) = 0",
          condition: "$c$ is any constant",
        },
        {
          label: "Constant Multiple Rule",
          latex: "\\frac{d}{dx}\\bigl(c\\,f(x)\\bigr) = c\\,f'(x)",
          condition: "$c$ is any constant",
        },
        {
          label: "Sum & Difference Rule",
          latex: "\\frac{d}{dx}\\bigl(f(x) \\pm g(x)\\bigr) = f'(x) \\pm g'(x)",
        },
        {
          label: "General Power Rule",
          latex: "\\frac{d}{dx}\\bigl(x^n\\bigr) = n\\,x^{n-1}",
          condition: "$n$ is any real number (on domain of $x^n$ and $x^{n-1}$)",
        },
        {
          label: "Product Rule",
          latex: "\\bigl(f(x)\\,g(x)\\bigr)' = f'(x)\\,g(x) + f(x)\\,g'(x)",
        },
        {
          label: "Quotient Rule",
          latex:
            "\\left(\\frac{f(x)}{g(x)}\\right)' = \\frac{f'(x)\\,g(x) - f(x)\\,g'(x)}{\\bigl(g(x)\\bigr)^2}",
          condition: "Provided $g(x) \\neq 0$",
        },
        {
          label: "Chain Rule",
          latex: "\\frac{d}{dx}\\bigl[f\\bigl(g(x)\\bigr)\\bigr] = f'\\bigl(g(x)\\bigr)\\,g'(x)",
        },
        {
          label: "Exponential Chain Form",
          latex: "\\frac{d}{dx}\\bigl(e^{g(x)}\\bigr) = g'(x)\\,e^{g(x)}",
        },
        {
          label: "Logarithmic Chain Form",
          latex: "\\frac{d}{dx}\\bigl(\\ln g(x)\\bigr) = \\frac{g'(x)}{g(x)}",
          condition: "$g(x) > 0$",
        },
      ],
    },
    {
      id: "polynomials",
      title: "2. Polynomials",
      accentHex: "#8D9FCE",
      formulas: [
        { label: "Constant", latex: "\\frac{d}{dx}(c) = 0" },
        { label: "Linear Identity", latex: "\\frac{d}{dx}(x) = 1" },
        { label: "Linear Multiple", latex: "\\frac{d}{dx}(cx) = c" },
        { label: "Power Term", latex: "\\frac{d}{dx}(x^n) = n\\,x^{n-1}" },
        {
          label: "Scaled Power Term",
          latex: "\\frac{d}{dx}(c x^n) = n c\\,x^{n-1}",
        },
      ],
    },
    {
      id: "trigonometric",
      title: "3. Trigonometric Functions",
      accentHex: "#96B898",
      intro: "All angles $x$ are measured in radians.",
      formulas: [
        {
          label: "Sine",
          latex: "\\frac{d}{dx}\\bigl[\\sin(x)\\bigr] = \\cos(x)",
        },
        {
          label: "Cosine",
          latex: "\\frac{d}{dx}\\bigl[\\cos(x)\\bigr] = -\\sin(x)",
        },
        {
          label: "Tangent",
          latex: "\\frac{d}{dx}\\bigl[\\tan(x)\\bigr] = \\sec^2(x)",
        },
        {
          label: "Cosecant",
          latex: "\\frac{d}{dx}\\bigl[\\csc(x)\\bigr] = -\\csc(x)\\cot(x)",
        },
        {
          label: "Secant",
          latex: "\\frac{d}{dx}\\bigl[\\sec(x)\\bigr] = \\sec(x)\\tan(x)",
        },
        {
          label: "Cotangent",
          latex: "\\frac{d}{dx}\\bigl[\\cot(x)\\bigr] = -\\csc^2(x)",
        },
      ],
    },
    {
      id: "inverse-trigonometric",
      title: "4. Inverse Trigonometric Functions",
      accentHex: "#B95869",
      formulas: [
        {
          label: "Arcsine",
          latex:
            "\\frac{d}{dx}\\bigl[\\sin^{-1}(x)\\bigr] = \\frac{1}{\\sqrt{1 - x^2}}",
          condition: "$|x| < 1$",
        },
        {
          label: "Arccosine",
          latex:
            "\\frac{d}{dx}\\bigl[\\cos^{-1}(x)\\bigr] = -\\frac{1}{\\sqrt{1 - x^2}}",
          condition: "$|x| < 1$",
        },
        {
          label: "Arctangent",
          latex: "\\frac{d}{dx}\\bigl[\\tan^{-1}(x)\\bigr] = \\frac{1}{1 + x^2}",
          condition: "$x \\in \\mathbb{R}$",
        },
        {
          label: "Arccosecant",
          latex:
            "\\frac{d}{dx}\\bigl[\\csc^{-1}(x)\\bigr] = -\\frac{1}{|x|\\sqrt{x^2 - 1}}",
          condition: "$|x| > 1$ (principal range $[-\\frac{\\pi}{2}, 0) \\cup (0, \\frac{\\pi}{2}]$)",
        },
        {
          label: "Arcsecant",
          latex:
            "\\frac{d}{dx}\\bigl[\\sec^{-1}(x)\\bigr] = \\frac{1}{|x|\\sqrt{x^2 - 1}}",
          condition: "$|x| > 1$ (principal range $[0, \\frac{\\pi}{2}) \\cup (\\frac{\\pi}{2}, \\pi]$)",
        },
        {
          label: "Arccotangent",
          latex:
            "\\frac{d}{dx}\\bigl[\\cot^{-1}(x)\\bigr] = -\\frac{1}{1 + x^2}",
          condition: "$x \\in \\mathbb{R}$",
        },
      ],
    },
    {
      id: "exponential-logarithmic",
      title: "5. Exponential & Logarithm Functions",
      accentHex: "#029091",
      formulas: [
        {
          label: "General Exponential",
          latex: "\\frac{d}{dx}\\bigl[a^x\\bigr] = a^x \\ln(a)",
          condition: "$a > 0$",
        },
        {
          label: "Natural Exponential",
          latex: "\\frac{d}{dx}\\bigl[e^x\\bigr] = e^x",
        },
        {
          label: "Natural Logarithm",
          latex: "\\frac{d}{dx}\\bigl[\\ln(x)\\bigr] = \\frac{1}{x}",
          condition: "$x > 0$",
        },
        {
          label: "Absolute Natural Logarithm",
          latex: "\\frac{d}{dx}\\bigl[\\ln|x|\\bigr] = \\frac{1}{x}",
          condition: "$x \\neq 0$",
        },
        {
          label: "Base-a Logarithm",
          latex: "\\frac{d}{dx}\\bigl[\\log_a(x)\\bigr] = \\frac{1}{x \\ln(a)}",
          condition: "$x > 0,\\; a > 0,\\; a \\neq 1$",
        },
      ],
    },
    {
      id: "hyperbolic",
      title: "6. Hyperbolic Functions",
      accentHex: "#D5658B",
      formulas: [
        {
          label: "Hyperbolic Sine",
          latex: "\\frac{d}{dx}\\bigl[\\sinh(x)\\bigr] = \\cosh(x)",
        },
        {
          label: "Hyperbolic Cosine",
          latex: "\\frac{d}{dx}\\bigl[\\cosh(x)\\bigr] = \\sinh(x)",
        },
        {
          label: "Hyperbolic Tangent",
          latex: "\\frac{d}{dx}\\bigl[\\tanh(x)\\bigr] = \\operatorname{sech}^2(x)",
        },
        {
          label: "Hyperbolic Cosecant",
          latex:
            "\\frac{d}{dx}\\bigl[\\operatorname{csch}(x)\\bigr] = -\\operatorname{csch}(x)\\coth(x)",
          condition: "$x \\neq 0$",
        },
        {
          label: "Hyperbolic Secant",
          latex:
            "\\frac{d}{dx}\\bigl[\\operatorname{sech}(x)\\bigr] = -\\operatorname{sech}(x)\\tanh(x)",
        },
        {
          label: "Hyperbolic Cotangent",
          latex: "\\frac{d}{dx}\\bigl[\\coth(x)\\bigr] = -\\operatorname{csch}^2(x)",
          condition: "$x \\neq 0$",
        },
      ],
    },
  ],
};
