import type { FormulaSheetDefinition } from "./types";

export const TAYLOR_FORMULA_SHEET: FormulaSheetDefinition = {
  slug: "taylor-expansions",
  volumeId: "vol-1",
  volumeLabel: "Volume I: Single-Variable Calculus",
  previewLatex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x - a)^n",
  title: "Common Taylor & Maclaurin Series Expansions",
  shortTitle: "Taylor Expansions",
  subtitle:
    "General Taylor polynomials, Lagrange remainder bounds, and standard Maclaurin expansions for exponential, logarithmic, trigonometric, inverse trigonometric, hyperbolic, rational, and binomial functions with exact convergence intervals.",
  badge: "FORMULA SHEET • MODULE 1.2",
  accentHex: "#B95869",
  backChapterRoute:
    "/single-variable-calculus/differential-calculus/taylor-polynomials-curvature",
  backChapterLabel: "Back to Ch. 1.2.4: Taylor Polynomials & Curvature",
  relatedSlugs: ["derivatives", "limits", "integrals"],
  accuracyNotes: [
    "Why Convergence Stops at $R$: For rational functions such as $\\frac{1}{1+x^2}$ that appear completely smooth on $\\mathbb{R}$, the radius of convergence $R$ equals the distance in the complex plane $\\mathbb{C}$ from center $a$ to the nearest pole ($x = \\pm i$ here, giving $R = 1$).",
    "Check Endpoints Separately: Substitution, term-by-term differentiation, and term-by-term integration preserve the open convergence interval $(a - R, a + R)$, while endpoint convergence at $x = a \\pm R$ can change and must always be tested individually.",
  ],
  sections: [
    {
      id: "general-taylor",
      title: "1. General Taylor Polynomials & Remainder Bounds",
      accentHex: "#B95869",
      formulas: [
        {
          label: "Taylor Series Centered at x = a",
          latex:
            "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x - a)^n = f(a) + f'(a)(x - a) + \\frac{f''(a)}{2!}(x - a)^2 + \\frac{f'''(a)}{3!}(x - a)^3 + \\cdots",
          condition: "Converges to $f(x)$ for $|x - a| < R$ when $R_n(x) \\to 0$",
        },
        {
          label: "Maclaurin Series (Centered at a = 0)",
          latex:
            "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(0)}{n!}x^n = f(0) + f'(0)x + \\frac{f''(0)}{2!}x^2 + \\frac{f'''(0)}{3!}x^3 + \\cdots",
        },
        {
          label: "Degree-n Taylor Polynomial & Lagrange Remainder",
          latex:
            "P_n(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(a)}{k!}(x - a)^k, \\qquad R_n(x) = f(x) - P_n(x) = \\frac{f^{(n+1)}(\\xi)}{(n+1)!}(x - a)^{n+1}",
          condition: "For some $\\xi$ strictly between $a$ and $x$ (when $f \\in C^{n+1}$)",
        },
      ],
    },
    {
      id: "exponential",
      title: "2. Exponential Functions",
      accentHex: "#8D9FCE",
      formulas: [
        {
          label: "Natural Exponential e^x",
          latex:
            "e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\frac{x^4}{4!} + \\cdots",
          condition: "Interval: $(-\\infty, \\infty)$ • Radius $R = \\infty$",
        },
        {
          label: "General Base Exponential a^x",
          latex:
            "a^x = e^{x \\ln a} = \\sum_{n=0}^{\\infty} \\frac{(\\ln a)^n}{n!}x^n = 1 + (\\ln a)x + \\frac{(\\ln a)^2}{2!}x^2 + \\frac{(\\ln a)^3}{3!}x^3 + \\cdots",
          condition: "$a > 0$ • Interval: $(-\\infty, \\infty)$ • Radius $R = \\infty$",
        },
      ],
    },
    {
      id: "logarithmic",
      title: "3. Logarithmic Functions",
      accentHex: "#96B898",
      formulas: [
        {
          label: "ln(1 + x)",
          latex:
            "\\ln(1 + x) = \\sum_{n=1}^{\\infty} \\frac{(-1)^{n-1}}{n} x^n = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\frac{x^4}{4} + \\frac{x^5}{5} - \\cdots",
          condition: "Interval: $(-1, 1]$ • Radius $R = 1$",
          note: "Converges at $x = 1$ to $\\ln 2$ (alternating harmonic); diverges at $x = -1$.",
        },
        {
          label: "ln(1 − x)",
          latex:
            "\\ln(1 - x) = -\\sum_{n=1}^{\\infty} \\frac{x^n}{n} = -x - \\frac{x^2}{2} - \\frac{x^3}{3} - \\frac{x^4}{4} - \\frac{x^5}{5} - \\cdots",
          condition: "Interval: $[-1, 1)$ • Radius $R = 1$",
          note: "Converges at $x = -1$ to $\\ln 2$; diverges at $x = 1$.",
        },
        {
          label: "Symmetric Log Ratio ln((1+x)/(1−x))",
          latex:
            "\\ln\\!\\left(\\frac{1 + x}{1 - x}\\right) = 2\\sum_{n=0}^{\\infty} \\frac{x^{2n+1}}{2n + 1} = 2\\left(x + \\frac{x^3}{3} + \\frac{x^5}{5} + \\frac{x^7}{7} + \\cdots\\right)",
          condition: "Interval: $(-1, 1)$ • Radius $R = 1$",
          note: "Notice all even powers cancel because $\\ln((1+x)/(1-x))$ is an odd function.",
        },
      ],
    },
    {
      id: "trigonometric",
      title: "4. Trigonometric Functions",
      accentHex: "#029091",
      formulas: [
        {
          label: "Sine sin(x)",
          latex:
            "\\sin(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n}{(2n + 1)!} x^{2n+1} = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\frac{x^7}{7!} + \\cdots",
          condition: "Interval: $(-\\infty, \\infty)$ • Radius $R = \\infty$",
        },
        {
          label: "Cosine cos(x)",
          latex:
            "\\cos(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n}{(2n)!} x^{2n} = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\frac{x^6}{6!} + \\cdots",
          condition: "Interval: $(-\\infty, \\infty)$ • Radius $R = \\infty$",
        },
        {
          label: "Tangent tan(x)",
          latex:
            "\\tan(x) = x + \\frac{x^3}{3} + \\frac{2x^5}{15} + \\frac{17x^7}{315} + \\frac{62x^9}{2835} + \\cdots",
          condition: "Interval: $(-\\frac{\\pi}{2}, \\frac{\\pi}{2})$ • Radius $R = \\frac{\\pi}{2}$",
          note: "Stopped by the nearest poles of $\\tan(x) = \\sin x / \\cos x$ at $x = \\pm \\frac{\\pi}{2}$.",
        },
        {
          label: "Secant sec(x)",
          latex:
            "\\sec(x) = 1 + \\frac{x^2}{2} + \\frac{5x^4}{24} + \\frac{61x^6}{720} + \\frac{277x^8}{8064} + \\cdots",
          condition: "Interval: $(-\\frac{\\pi}{2}, \\frac{\\pi}{2})$ • Radius $R = \\frac{\\pi}{2}$",
        },
      ],
    },
    {
      id: "inverse-trigonometric",
      title: "5. Inverse Trigonometric Functions",
      accentHex: "#D35323",
      formulas: [
        {
          label: "Arctangent tan⁻¹(x) (Gregory–Leibniz)",
          latex:
            "\\tan^{-1}(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n}{2n + 1} x^{2n+1} = x - \\frac{x^3}{3} + \\frac{x^5}{5} - \\frac{x^7}{7} + \\cdots",
          condition: "Interval: $[-1, 1]$ • Radius $R = 1$",
          note: "Integrating $\\frac{1}{1+t^2}$ term-by-term yields $\\tan^{-1}(1) = \\frac{\\pi}{4} = 1 - \\frac{1}{3} + \\frac{1}{5} - \\frac{1}{7} + \\cdots$.",
        },
        {
          label: "Arcsine sin⁻¹(x)",
          latex:
            "\\sin^{-1}(x) = \\sum_{n=0}^{\\infty} \\frac{(2n)!}{4^n (n!)^2 (2n + 1)} x^{2n+1} = x + \\frac{1}{6}x^3 + \\frac{3}{40}x^5 + \\frac{5}{112}x^7 + \\cdots",
          condition: "Interval: $[-1, 1]$ • Radius $R = 1$",
        },
        {
          label: "Arccosine cos⁻¹(x)",
          latex:
            "\\cos^{-1}(x) = \\frac{\\pi}{2} - \\sin^{-1}(x) = \\frac{\\pi}{2} - \\left(x + \\frac{1}{6}x^3 + \\frac{3}{40}x^5 + \\frac{5}{112}x^7 + \\cdots\\right)",
          condition: "Interval: $[-1, 1]$ • Radius $R = 1$",
        },
        {
          label: "Arccotangent cot⁻¹(x)",
          latex:
            "\\cot^{-1}(x) = \\frac{\\pi}{2} - \\tan^{-1}(x) = \\frac{\\pi}{2} - \\left(x - \\frac{x^3}{3} + \\frac{x^5}{5} - \\frac{x^7}{7} + \\cdots\\right)",
          condition: "Principal range $(0, \\pi)$ • Interval: $[-1, 1]$ • Radius $R = 1$",
        },
      ],
    },
    {
      id: "hyperbolic",
      title: "6. Hyperbolic Functions",
      accentHex: "#D5658B",
      formulas: [
        {
          label: "Hyperbolic Sine sinh(x)",
          latex:
            "\\sinh(x) = \\sum_{n=0}^{\\infty} \\frac{x^{2n+1}}{(2n + 1)!} = x + \\frac{x^3}{3!} + \\frac{x^5}{5!} + \\frac{x^7}{7!} + \\cdots",
          condition: "Interval: $(-\\infty, \\infty)$ • Radius $R = \\infty$",
        },
        {
          label: "Hyperbolic Cosine cosh(x)",
          latex:
            "\\cosh(x) = \\sum_{n=0}^{\\infty} \\frac{x^{2n}}{(2n)!} = 1 + \\frac{x^2}{2!} + \\frac{x^4}{4!} + \\frac{x^6}{6!} + \\cdots",
          condition: "Interval: $(-\\infty, \\infty)$ • Radius $R = \\infty$",
        },
        {
          label: "Inverse Hyperbolic Tangent tanh⁻¹(x)",
          latex:
            "\\tanh^{-1}(x) = \\sum_{n=0}^{\\infty} \\frac{x^{2n+1}}{2n + 1} = x + \\frac{x^3}{3} + \\frac{x^5}{5} + \\frac{x^7}{7} + \\cdots",
          condition: "Interval: $(-1, 1)$ • Radius $R = 1$",
        },
      ],
    },
    {
      id: "rational-binomial",
      title: "7. Rational, Geometric & Generalized Binomial Series",
      accentHex: "#AAA36D",
      formulas: [
        {
          label: "Geometric Series 1/(1 − x)",
          latex:
            "\\frac{1}{1 - x} = \\sum_{n=0}^{\\infty} x^n = 1 + x + x^2 + x^3 + x^4 + \\cdots",
          condition: "Interval: $(-1, 1)$ • Radius $R = 1$",
        },
        {
          label: "Alternating Geometric 1/(1 + x)",
          latex:
            "\\frac{1}{1 + x} = \\sum_{n=0}^{\\infty} (-1)^n x^n = 1 - x + x^2 - x^3 + x^4 - \\cdots",
          condition: "Interval: $(-1, 1)$ • Radius $R = 1$",
        },
        {
          label: "Smooth Bell 1/(1 + x²)",
          latex:
            "\\frac{1}{1 + x^2} = \\sum_{n=0}^{\\infty} (-1)^n x^{2n} = 1 - x^2 + x^4 - x^6 + x^8 - \\cdots",
          condition: "Interval: $(-1, 1)$ • Radius $R = 1$ (complex poles at $x = \\pm i$)",
        },
        {
          label: "Differentiated Geometric 1/(1 − x)²",
          latex:
            "\\frac{1}{(1 - x)^2} = \\sum_{n=1}^{\\infty} n\\,x^{n-1} = 1 + 2x + 3x^2 + 4x^3 + 5x^4 + \\cdots",
          condition: "Interval: $(-1, 1)$ • Radius $R = 1$",
        },
        {
          label: "Generalized Binomial Series (1 + x)^α",
          latex:
            "(1 + x)^{\\alpha} = \\sum_{n=0}^{\\infty} \\binom{\\alpha}{n} x^n = 1 + \\alpha x + \\frac{\\alpha(\\alpha - 1)}{2!}x^2 + \\frac{\\alpha(\\alpha - 1)(\\alpha - 2)}{3!}x^3 + \\cdots",
          condition: "$\\alpha \\in \\mathbb{R}$; converges on $(-1, 1)$ for all $\\alpha$ (and everywhere if $\\alpha \\in \\mathbb{Z}_{\\ge 0}$)",
        },
        {
          label: "Square Root √(1 + x) & Reciprocal 1/√(1 + x)",
          latex:
            "\\sqrt{1 + x} = 1 + \\frac{1}{2}x - \\frac{1}{8}x^2 + \\frac{1}{16}x^3 - \\frac{5}{128}x^4 + \\cdots \\quad (x \\in [-1, 1])",
          note: "Similarly, $\\frac{1}{\\sqrt{1 + x}} = 1 - \\frac{1}{2}x + \\frac{3}{8}x^2 - \\frac{5}{16}x^3 + \\frac{35}{128}x^4 - \\cdots$ converges on $(-1, 1]$.",
        },
      ],
    },
    {
      id: "convergence-summary",
      title: "8. Convergence Quick-Reference & Manipulation Toolkit",
      accentHex: "#8D9FCE",
      bulletNotes: [
        "Substitution: Replace $x$ by $u(x)$—for example, $e^{-x^2} = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{n!}$ converges whenever $|u(x)| < R$.",
        "Term-by-Term Calculus: Inside the open interval $(a - R, a + R)$, a power series may be differentiated and integrated term-by-term with the exact same radius $R$ (always re-test endpoints $a \\pm R$).",
        "Odd & Even Symmetry: Odd functions ($\\sin x, \\tan x, \\tan^{-1}x, \\sinh x$) contain only odd powers of $x$; even functions ($\\cos x, \\sec x, \\cosh x, \\frac{1}{1+x^2}$) contain only even powers.",
      ],
      table: {
        title: "Summary of Radii & Intervals of Convergence",
        headers: ["Function", "General Term", "Radius $R$", "Exact Interval"],
        rows: [
          ["$e^x,\\; \\sin x,\\; \\cos x,\\; \\sinh x,\\; \\cosh x$", "$\\frac{x^n}{n!}$ (or even/odd)", "$\\infty$", "$(-\\infty, \\infty)$"],
          ["$\\frac{1}{1-x},\\; \\frac{1}{1+x},\\; \\frac{1}{1+x^2},\\; \\frac{1}{(1-x)^2}$", "$x^n$, $(-1)^n x^n$, $(-1)^n x^{2n}$, $n x^{n-1}$", "$1$", "$(-1, 1)$"],
          ["$\\ln(1+x)$", "$\\frac{(-1)^{n-1}}{n} x^n$", "$1$", "$(-1, 1]$"],
          ["$\\ln(1-x)$", "$-\\frac{x^n}{n}$", "$1$", "$[-1, 1)$"],
          ["$\\tan^{-1}x,\\; \\sin^{-1}x,\\; \\cos^{-1}x$", "$\\frac{(-1)^n}{2n+1}x^{2n+1}$ / $\\frac{(2n)!}{4^n(n!)^2(2n+1)}x^{2n+1}$", "$1$", "$[-1, 1]$"],
          ["$\\tan x,\\; \\sec x$", "Euler / Bernoulli numbers", "$\\frac{\\pi}{2}$", "$(-\\frac{\\pi}{2}, \\frac{\\pi}{2})$"],
        ],
      },
    },
  ],
};
