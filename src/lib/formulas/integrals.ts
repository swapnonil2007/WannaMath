import type { FormulaSheetDefinition } from "./types";

export const INTEGRALS_FORMULA_SHEET: FormulaSheetDefinition = {
  slug: "integrals",
  title: "Common Integral Formulas & Standard Integration Techniques",
  shortTitle: "Integral Formulas",
  subtitle:
    "Definite integral laws, polynomial, trigonometric, exponential, logarithmic, inverse trigonometric, hyperbolic, and radical antiderivatives, plus substitution, integration by parts, trig substitutions, and partial fractions.",
  badge: "FORMULA SHEET • MODULE 1.3",
  accentHex: "#029091",
  backChapterRoute: "/single-variable-calculus/integral-calculus/riemann-sums-1d",
  backChapterLabel: "Back to Ch. 1.3.1: Integration & Riemann Sums",
  relatedSlugs: ["derivatives", "limits", "taylor-expansions"],
  accuracyNotes: [
    "Hyperbolic Secant Correction: We publish the exact antiderivative $\\int \\operatorname{sech}(u)\\,du = \\tan^{-1}(\\sinh u) + C$ (without absolute value bars around $\\sinh u$). Using $\\tan^{-1}|\\sinh u|$ is incorrect for $u < 0$ because $|\\sinh u| = -\\sinh u$ differentiates to $-\\operatorname{sech}(u)$.",
    "Inverse Secant Sign Correction: Under the principal range of $\\sec^{-1}$, $\\int \\frac{1}{u\\sqrt{u^2 - a^2}}\\,du = \\frac{1}{a}\\sec^{-1}\\!\\left(\\frac{|u|}{a}\\right) + C$ ($a > 0,\\; |u| > a$); the $|u|$ ensures the correct derivative sign when $u < -a$.",
    "Definite Integral Order Condition: Positivity and monotonicity ($f \\ge 0 \\implies \\int_a^b f \\ge 0$ and $f \\ge g \\implies \\int_a^b f \\ge \\int_a^b g$) require $a \\le b$; reversing bounds flips the inequality.",
  ],
  sections: [
    {
      id: "basic-properties",
      title: "1. Basic Properties, Rules & Definite Integral Laws",
      accentHex: "#029091",
      formulas: [
        {
          label: "Constant Multiple (Indefinite)",
          latex: "\\int c\\,f(x)\\,dx = c \\int f(x)\\,dx",
          condition: "$c$ is any constant",
        },
        {
          label: "Sum & Difference (Indefinite)",
          latex: "\\int \\bigl[f(x) \\pm g(x)\\bigr]\\,dx = \\int f(x)\\,dx \\pm \\int g(x)\\,dx",
        },
        {
          label: "Fundamental Theorem of Calculus (Evaluation)",
          latex: "\\int_a^b f(x)\\,dx = F(x)\\Big|_a^b = F(b) - F(a)",
          condition: "Where $F(x)$ is an antiderivative of $f(x)$ on $[a, b]$",
        },
        {
          label: "Constant Multiple (Definite)",
          latex: "\\int_a^b c\\,f(x)\\,dx = c \\int_a^b f(x)\\,dx",
          condition: "$c$ is any constant",
        },
        {
          label: "Sum & Difference (Definite)",
          latex:
            "\\int_a^b \\bigl[f(x) \\pm g(x)\\bigr]\\,dx = \\int_a^b f(x)\\,dx \\pm \\int_a^b g(x)\\,dx",
        },
        {
          label: "Zero-Width & Reversed-Bounds Laws",
          latex:
            "\\int_a^a f(x)\\,dx = 0, \\qquad \\int_a^b f(x)\\,dx = -\\int_b^a f(x)\\,dx",
        },
        {
          label: "Interval Additivity & Constant Function",
          latex:
            "\\int_a^b f(x)\\,dx = \\int_a^c f(x)\\,dx + \\int_c^b f(x)\\,dx, \\qquad \\int_a^b c\\,dx = c(b - a)",
        },
        {
          label: "Positivity & Comparison Inequalities",
          latex:
            "f(x) \\ge 0 \\text{ on } [a, b] \\implies \\int_a^b f(x)\\,dx \\ge 0, \\qquad f(x) \\ge g(x) \\text{ on } [a, b] \\implies \\int_a^b f(x)\\,dx \\ge \\int_a^b g(x)\\,dx",
          condition: "Requires $a \\le b$",
        },
      ],
    },
    {
      id: "polynomials",
      title: "2. Polynomial & Power Integrals",
      accentHex: "#8D9FCE",
      formulas: [
        { label: "Unit Differential", latex: "\\int dx = x + C" },
        { label: "Constant Integrand", latex: "\\int k\\,dx = kx + C" },
        {
          label: "Power Rule",
          latex: "\\int x^n\\,dx = \\frac{1}{n + 1}x^{n+1} + C",
          condition: "$n \\neq -1$",
        },
        {
          label: "Reciprocal 1/x",
          latex: "\\int \\frac{1}{x}\\,dx = \\ln|x| + C",
          condition: "$x \\neq 0$ (on intervals not crossing $0$)",
        },
        {
          label: "Reciprocal x⁻¹",
          latex: "\\int x^{-1}\\,dx = \\ln|x| + C",
          condition: "$x \\neq 0$",
        },
        {
          label: "Negative Power Rule",
          latex: "\\int x^{-n}\\,dx = \\frac{1}{-n + 1}x^{-n+1} + C",
          condition: "$n \\neq 1$",
        },
        {
          label: "Linear Denominator",
          latex: "\\int \\frac{1}{ax + b}\\,dx = \\frac{1}{a}\\ln|ax + b| + C",
          condition: "$a \\neq 0$, $ax + b \\neq 0$",
        },
        {
          label: "Rational Exponent Power",
          latex:
            "\\int x^{\\frac{p}{q}}\\,dx = \\frac{1}{\\frac{p}{q} + 1}x^{\\frac{p}{q}+1} + C = \\frac{q}{p + q}x^{\\frac{p+q}{q}} + C",
          condition: "$p + q \\neq 0,\\; q \\neq 0$",
        },
      ],
    },
    {
      id: "trigonometric",
      title: "3. Trigonometric Integrals",
      accentHex: "#96B898",
      formulas: [
        { label: "Cosine", latex: "\\int \\cos(u)\\,du = \\sin(u) + C" },
        { label: "Sine", latex: "\\int \\sin(u)\\,du = -\\cos(u) + C" },
        { label: "Secant Squared", latex: "\\int \\sec^2(u)\\,du = \\tan(u) + C" },
        {
          label: "Secant · Tangent",
          latex: "\\int \\sec(u)\\tan(u)\\,du = \\sec(u) + C",
        },
        {
          label: "Cosecant · Cotangent",
          latex: "\\int \\csc(u)\\cot(u)\\,du = -\\csc(u) + C",
        },
        {
          label: "Cosecant Squared",
          latex: "\\int \\csc^2(u)\\,du = -\\cot(u) + C",
        },
        {
          label: "Tangent",
          latex: "\\int \\tan(u)\\,du = -\\ln|\\cos(u)| + C = \\ln|\\sec(u)| + C",
        },
        {
          label: "Cotangent",
          latex: "\\int \\cot(u)\\,du = \\ln|\\sin(u)| + C = -\\ln|\\csc(u)| + C",
        },
        {
          label: "Secant",
          latex: "\\int \\sec(u)\\,du = \\ln|\\sec(u) + \\tan(u)| + C",
        },
        {
          label: "Secant Cubed",
          latex:
            "\\int \\sec^3(u)\\,du = \\frac{1}{2}\\Bigl(\\sec(u)\\tan(u) + \\ln|\\sec(u) + \\tan(u)|\\Bigr) + C",
        },
        {
          label: "Cosecant",
          latex: "\\int \\csc(u)\\,du = \\ln|\\csc(u) - \\cot(u)| + C",
        },
        {
          label: "Cosecant Cubed",
          latex:
            "\\int \\csc^3(u)\\,du = \\frac{1}{2}\\Bigl(-\\csc(u)\\cot(u) + \\ln|\\csc(u) - \\cot(u)|\\Bigr) + C",
        },
      ],
    },
    {
      id: "exponential-logarithmic",
      title: "4. Exponential & Logarithm Integrals",
      accentHex: "#D35323",
      formulas: [
        { label: "Natural Exponential", latex: "\\int e^u\\,du = e^u + C" },
        {
          label: "General Exponential",
          latex: "\\int a^u\\,du = \\frac{a^u}{\\ln(a)} + C",
          condition: "$a > 0,\\; a \\neq 1$",
        },
        {
          label: "Natural Logarithm",
          latex: "\\int \\ln(u)\\,du = u\\ln(u) - u + C",
          condition: "$u > 0$",
        },
        {
          label: "Linear-Exponential Product",
          latex: "\\int u\\,e^u\\,du = (u - 1)e^u + C",
        },
        {
          label: "Damped Sine",
          latex:
            "\\int e^{au}\\sin(bu)\\,du = \\frac{e^{au}}{a^2 + b^2}\\bigl(a\\sin(bu) - b\\cos(bu)\\bigr) + C",
          condition: "$a^2 + b^2 > 0$",
        },
        {
          label: "Damped Cosine",
          latex:
            "\\int e^{au}\\cos(bu)\\,du = \\frac{e^{au}}{a^2 + b^2}\\bigl(a\\cos(bu) + b\\sin(bu)\\bigr) + C",
          condition: "$a^2 + b^2 > 0$",
        },
        {
          label: "Logarithmic Derivative Reciprocal",
          latex: "\\int \\frac{1}{u\\ln(u)}\\,du = \\ln|\\ln(u)| + C",
          condition: "$u > 0,\\; u \\neq 1$",
        },
      ],
    },
    {
      id: "inverse-trigonometric",
      title: "5. Inverse Trigonometric Integrals",
      accentHex: "#B95869",
      formulas: [
        {
          label: "Inverse Sine Kernel",
          latex:
            "\\int \\frac{1}{\\sqrt{a^2 - u^2}}\\,du = \\sin^{-1}\\!\\left(\\frac{u}{a}\\right) + C",
          condition: "$a > 0,\\; |u| < a$",
        },
        {
          label: "Inverse Tangent Kernel",
          latex:
            "\\int \\frac{1}{a^2 + u^2}\\,du = \\frac{1}{a}\\tan^{-1}\\!\\left(\\frac{u}{a}\\right) + C",
          condition: "$a \\neq 0$",
        },
        {
          label: "Inverse Secant Kernel (Sign-Corrected)",
          latex:
            "\\int \\frac{1}{u\\sqrt{u^2 - a^2}}\\,du = \\frac{1}{a}\\sec^{-1}\\!\\left(\\frac{|u|}{a}\\right) + C",
          condition: "$a > 0,\\; |u| > a$",
          note: "Using $|u|/a$ ensures the derivative equals $\\frac{1}{u\\sqrt{u^2-a^2}}$ on both $u > a$ and $u < -a$.",
        },
        {
          label: "Antiderivative of Arcsine",
          latex: "\\int \\sin^{-1}(u)\\,du = u\\sin^{-1}(u) + \\sqrt{1 - u^2} + C",
          condition: "$|u| \\le 1$",
        },
        {
          label: "Antiderivative of Arctangent",
          latex:
            "\\int \\tan^{-1}(u)\\,du = u\\tan^{-1}(u) - \\frac{1}{2}\\ln(1 + u^2) + C",
        },
        {
          label: "Antiderivative of Arccosine",
          latex: "\\int \\cos^{-1}(u)\\,du = u\\cos^{-1}(u) - \\sqrt{1 - u^2} + C",
          condition: "$|u| \\le 1$",
        },
      ],
    },
    {
      id: "hyperbolic",
      title: "6. Hyperbolic Integrals",
      accentHex: "#D5658B",
      formulas: [
        { label: "Hyperbolic Sine", latex: "\\int \\sinh(u)\\,du = \\cosh(u) + C" },
        { label: "Hyperbolic Cosine", latex: "\\int \\cosh(u)\\,du = \\sinh(u) + C" },
        {
          label: "Hyperbolic Tangent",
          latex: "\\int \\tanh(u)\\,du = \\ln\\bigl(\\cosh(u)\\bigr) + C",
        },
        {
          label: "Hyperbolic Secant · Tangent",
          latex: "\\int \\operatorname{sech}(u)\\tanh(u)\\,du = -\\operatorname{sech}(u) + C",
        },
        {
          label: "Hyperbolic Cosecant · Cotangent",
          latex:
            "\\int \\operatorname{csch}(u)\\coth(u)\\,du = -\\operatorname{csch}(u) + C",
          condition: "$u \\neq 0$",
        },
        {
          label: "Hyperbolic Secant Squared",
          latex: "\\int \\operatorname{sech}^2(u)\\,du = \\tanh(u) + C",
        },
        {
          label: "Hyperbolic Cosecant Squared",
          latex: "\\int \\operatorname{csch}^2(u)\\,du = -\\coth(u) + C",
          condition: "$u \\neq 0$",
        },
        {
          label: "Hyperbolic Secant (Verified All u ∈ ℝ)",
          latex:
            "\\int \\operatorname{sech}(u)\\,du = \\tan^{-1}\\bigl(\\sinh(u)\\bigr) + C = 2\\tan^{-1}(e^u) + C'",
          note: "Valid for all $u \\in \\mathbb{R}$ (differentiates cleanly via $\\frac{\\cosh u}{1 + \\sinh^2 u} = \\operatorname{sech} u$; avoid writing $|\\sinh u|$).",
        },
      ],
    },
    {
      id: "miscellaneous",
      title: "7. Miscellaneous Rational & Radical Forms",
      accentHex: "#AAA36D",
      formulas: [
        {
          label: "Difference of Squares Denominator (a² − u²)",
          latex:
            "\\int \\frac{1}{a^2 - u^2}\\,du = \\frac{1}{2a}\\ln\\left|\\frac{u + a}{u - a}\\right| + C",
          condition: "$a \\neq 0,\\; |u| \\neq |a|$",
        },
        {
          label: "Difference of Squares Denominator (u² − a²)",
          latex:
            "\\int \\frac{1}{u^2 - a^2}\\,du = \\frac{1}{2a}\\ln\\left|\\frac{u - a}{u + a}\\right| + C",
          condition: "$a \\neq 0,\\; |u| \\neq |a|$",
        },
        {
          label: "Radical √(a² + u²)",
          latex:
            "\\int \\sqrt{a^2 + u^2}\\,du = \\frac{u}{2}\\sqrt{a^2 + u^2} + \\frac{a^2}{2}\\ln\\left|u + \\sqrt{a^2 + u^2}\\right| + C",
        },
        {
          label: "Radical √(u² − a²)",
          latex:
            "\\int \\sqrt{u^2 - a^2}\\,du = \\frac{u}{2}\\sqrt{u^2 - a^2} - \\frac{a^2}{2}\\ln\\left|u + \\sqrt{u^2 - a^2}\\right| + C",
          condition: "$|u| \\ge |a|$",
        },
        {
          label: "Radical √(a² − u²)",
          latex:
            "\\int \\sqrt{a^2 - u^2}\\,du = \\frac{u}{2}\\sqrt{a^2 - u^2} + \\frac{a^2}{2}\\sin^{-1}\\!\\left(\\frac{u}{a}\\right) + C",
          condition: "$a > 0,\\; |u| \\le a$",
        },
        {
          label: "Circle Segment √(2au − u²)",
          latex:
            "\\int \\sqrt{2au - u^2}\\,du = \\frac{u - a}{2}\\sqrt{2au - u^2} + \\frac{a^2}{2}\\cos^{-1}\\!\\left(\\frac{a - u}{a}\\right) + C",
          condition: "$a > 0,\\; 0 \\le u \\le 2a$",
        },
      ],
    },
    {
      id: "standard-techniques",
      title: "8. Standard Integration Techniques",
      accentHex: "#8D9FCE",
      formulas: [
        {
          label: "u-Substitution (Definite & Indefinite)",
          latex:
            "\\int_a^b f\\bigl(g(x)\\bigr)\\,g'(x)\\,dx = \\int_{g(a)}^{g(b)} f(u)\\,du \\qquad (u = g(x),\\; du = g'(x)\\,dx)",
          note: "For indefinite integrals, drop the bounds and substitute $u = g(x)$ back after integrating.",
        },
        {
          label: "Integration by Parts (IBP)",
          latex:
            "\\int u\\,dv = uv - \\int v\\,du, \\qquad \\int_a^b u\\,dv = uv\\Big|_a^b - \\int_a^b v\\,du",
          note: "Choose $u$ and $dv$ from the integrand; compute $du$ by differentiating $u$ and $v = \\int dv$.",
        },
        {
          label: "Trig Substitution: √(a² − b²x²)",
          latex:
            "\\sqrt{a^2 - b^2 x^2} \\implies x = \\frac{a}{b}\\sin(\\theta), \\qquad \\cos^2(\\theta) = 1 - \\sin^2(\\theta)",
          condition: "$a, b > 0,\\; -\\frac{\\pi}{2} \\le \\theta \\le \\frac{\\pi}{2}$ (so $\\cos\\theta \\ge 0$)",
        },
        {
          label: "Trig Substitution: √(b²x² − a²)",
          latex:
            "\\sqrt{b^2 x^2 - a^2} \\implies x = \\frac{a}{b}\\sec(\\theta), \\qquad \\tan^2(\\theta) = \\sec^2(\\theta) - 1",
          condition: "$a, b > 0,\\; \\theta \\in [0, \\frac{\\pi}{2})$ for $x \\ge \\frac{a}{b}$ (or $[\\pi, \\frac{3\\pi}{2})$ for $x \\le -\\frac{a}{b}$)",
        },
        {
          label: "Trig Substitution: √(a² + b²x²)",
          latex:
            "\\sqrt{a^2 + b^2 x^2} \\implies x = \\frac{a}{b}\\tan(\\theta), \\qquad \\sec^2(\\theta) = 1 + \\tan^2(\\theta)",
          condition: "$a, b > 0,\\; -\\frac{\\pi}{2} < \\theta < \\frac{\\pi}{2}$ (so $\\sec\\theta > 0$)",
        },
      ],
      table: {
        title:
          "Partial Fractions Decomposition for ∫ P(x)/Q(x) dx (deg P < deg Q; perform long division first if deg P ≥ deg Q)",
        headers: [
          "Factor of $Q(x)$",
          "Term in Partial Fraction Decomposition",
        ],
        rows: [
          ["Linear: $ax + b$", "$\\frac{A}{ax + b}$"],
          [
            "Repeated Linear: $(ax + b)^k$",
            "$\\frac{A_1}{ax + b} + \\frac{A_2}{(ax + b)^2} + \\cdots + \\frac{A_k}{(ax + b)^k}$",
          ],
          [
            "Irreducible Quadratic: $ax^2 + bx + c$ ($b^2 - 4ac < 0$)",
            "$\\frac{Ax + B}{ax^2 + bx + c}$",
          ],
          [
            "Repeated Irreducible Quadratic: $(ax^2 + bx + c)^k$",
            "$\\frac{A_1 x + B_1}{ax^2 + bx + c} + \\cdots + \\frac{A_k x + B_k}{(ax^2 + bx + c)^k}$",
          ],
        ],
      },
      bulletNotes: [
        "Products $\\int \\sin^n(x)\\cos^m(x)\\,dx$ — (1) $n$ odd: strip one $\\sin x$, convert the rest via $\\sin^2 x = 1 - \\cos^2 x$, substitute $u = \\cos x$. (2) $m$ odd: strip one $\\cos x$, convert via $\\cos^2 x = 1 - \\sin^2 x$, substitute $u = \\sin x$. (3) Both odd: use either. (4) Both even: reduce via half-angle/double-angle identities (example: $\\cos^6 x = (\\cos^2 x)^3 = (1 - \\sin^2 x)^3$).",
        "Products $\\int \\tan^n(x)\\sec^m(x)\\,dx$ — (1) $n$ odd: strip $\\tan x \\sec x$, convert remaining tangents via $\\tan^2 x = \\sec^2 x - 1$, substitute $u = \\sec x$. (2) $m$ even: strip $\\sec^2 x$, convert remaining secants via $\\sec^2 x = 1 + \\tan^2 x$, substitute $u = \\tan x$. (3) $n$ odd and $m$ even: use either. (4) $n$ even and $m$ odd: convert tangents to secants and integrate powers of $\\sec x$ (typically via IBP).",
      ],
    },
  ],
};
