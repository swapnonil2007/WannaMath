import type { FormulaSheetDefinition } from "./types";

export const CONVERGENCE_GAMMA_BETA_FORMULA_SHEET: FormulaSheetDefinition = {
  slug: "convergence-gamma-beta",
  volumeId: "vol-3",
  volumeLabel: "Volume III: Multivariable & Vector Calculus",
  previewLatex:
    "\\Gamma(z+1) = z\\Gamma(z), \\qquad \\mathrm{B}(p,q) = \\frac{\\Gamma(p)\\Gamma(q)}{\\Gamma(p+q)}",
  title: "Improper Integrals, Series Tests, Gamma & Beta Functions",
  shortTitle: "Convergence, Gamma & Beta",
  subtitle:
    "Type I & II improper integrals, flipped p-tests, the complete infinite series convergence decision table, Euler's Gamma function Γ(z), reflection & duplication identities, Beta function B(p, q), and Wallis integrals.",
  badge: "FORMULA SHEET • MODULE 3.2 (CONVERGENCE & SPECIAL FUNCTIONS)",
  accentHex: "#D5658B",
  backChapterRoute:
    "/multivariable-calculus/integral-calculus/convergence-and-divergence",
  backChapterLabel: "Back to Ch. 3.2.5: Convergence & Divergence",
  relatedSlugs: ["multiple-integrals-jacobians", "integrals", "taylor-expansions"],
  accuracyNotes: [
    "Flipped p-Test Knife-Edge: $\\int_1^{\\infty} x^{-p}\\,dx$ converges if and only if $p > 1$, whereas $\\int_0^1 x^{-p}\\,dx$ converges if and only if $p < 1$. Consequently, $\\int_0^{\\infty} x^{-p}\\,dx$ diverges for every real $p$.",
    "Doubly Infinite & Interior Singularity Splitting: $\\int_{-\\infty}^{\\infty} f(x)\\,dx$ or integrals crossing an interior asymptote $c \\in (a, b)$ must be split into two independent one-sided limits; both halves must converge separately (symmetric Cauchy principal value alone is not standard convergence).",
    "Necessary vs. Sufficient for Series: $a_n \\to 0$ is necessary for convergence of $\\sum a_n$, never sufficient—the harmonic series $\\sum \\frac{1}{n}$ satisfies $\\frac{1}{n} \\to 0$ yet diverges logarithmically.",
    "Eulerian Integral Domains & Analytic Continuation: The integral definitions of $\\Gamma(z)$ and $\\mathrm{B}(p, q)$ converge on $\\operatorname{Re}(z) > 0$ and $\\operatorname{Re}(p), \\operatorname{Re}(q) > 0$. Analytic continuation extends $\\Gamma(z)$ to $\\mathbb{C} \\setminus \\{0, -1, -2, \\dots\\}$ with simple poles at $z = 0, -1, -2, \\dots$.",
  ],
  sections: [
    {
      id: "improper-integrals",
      title: "1. Type I & Type II Improper Integrals",
      accentHex: "#D5658B",
      formulas: [
        {
          label: "Type I Improper Integrals (Unbounded Interval)",
          latex:
            "\\int_a^{\\infty} f(x)\\,dx = \\lim_{T \\to \\infty} \\int_a^T f(x)\\,dx, \\qquad \\int_{-\\infty}^{\\infty} f(x)\\,dx = \\int_{-\\infty}^c f(x)\\,dx + \\int_c^{\\infty} f(x)\\,dx",
          condition: "Doubly infinite integral converges iff both independent half-limits are finite",
        },
        {
          label: "Type II Improper Integral (Singularity at Endpoint or Interior c)",
          latex:
            "\\int_a^b f(x)\\,dx = \\lim_{\\varepsilon \\to 0^+} \\int_{a+\\varepsilon}^b f(x)\\,dx \\quad (\\text{blow-up at } a^+), \\qquad \\int_a^b f = \\int_a^c f + \\int_c^b f",
          condition: "Interior blow-up at $c \\in (a, b)$ requires both $\\int_a^c f$ and $\\int_c^b f$ to converge independently",
        },
        {
          label: "Benchmark p-Tests (Tail vs. Singularity)",
          latex:
            "\\int_1^{\\infty} \\frac{dx}{x^p} \\text{ converges} \\iff p > 1, \\qquad \\int_0^1 \\frac{dx}{x^p} \\text{ converges} \\iff p < 1",
          note: "Notice $p = 1$ sits right on the divergence boundary in both regimes.",
        },
        {
          label: "Direct & Limit Comparison Tests (Nonnegative Functions)",
          latex:
            "0 \\le f(x) \\le g(x) \\implies \\left(\\int g < \\infty \\Rightarrow \\int f < \\infty\\right); \\qquad \\lim_{x \\to \\infty}\\frac{f(x)}{g(x)} = L \\in (0, \\infty) \\implies \\text{same fate}",
          condition: "Valid for nonnegative continuous functions on $[a, \\infty)$ or near a singularity",
        },
      ],
    },
    {
      id: "series-decision-table",
      title: "2. Infinite Series Convergence Decision Table",
      accentHex: "#8D9FCE",
      intro:
        "Use the structured decision rules below to classify $\\sum_{n=n_0}^{\\infty} a_n$ before computing remainder bounds.",
      table: {
        title: "Convergence Tests for Infinite Series ∑ aₙ",
        headers: ["Test Name", "Form / Condition Computed", "Converges When", "Diverges / Inconclusive"],
        rows: [
          ["$n$-th Term Divergence", "$\\lim_{n\\to\\infty} a_n$", "Cannot prove convergence alone", "Diverges if limit $\\neq 0$ or DNE; inconclusive if $= 0$"],
          ["Geometric Series", "$\\sum_{n=0}^{\\infty} a\\,r^n$ ($a \\neq 0$)", "$|r| < 1$ (sum $= \\frac{a}{1 - r}$)", "Diverges for $|r| \\ge 1$"],
          ["$p$-Series", "$\\sum_{n=1}^{\\infty} \\frac{1}{n^p}$", "$p > 1$", "Diverges for $p \\le 1$"],
          ["Integral Test", "$a_n = f(n)$: continuous, positive, decreasing on $[N, \\infty)$", "$\\int_N^{\\infty} f(x)\\,dx < \\infty$ ($R_N \\le \\int_N^{\\infty} f$)", "Diverges iff $\\int_N^{\\infty} f(x)\\,dx = \\infty$"],
          ["Direct Comparison", "$0 \\le a_n \\le b_n$ (for $n \\ge N$)", "$\\sum b_n$ converges $\\implies \\sum a_n$ converges", "$\\sum a_n$ diverges $\\implies \\sum b_n$ diverges"],
          ["Limit Comparison", "$a_n > 0, b_n > 0$, $L = \\lim_{n\\to\\infty} \\frac{a_n}{b_n}$", "$0 < L < \\infty$: same behavior; $L = 0$ and $\\sum b_n$ conv.", "$L = \\infty$ and $\\sum b_n$ div. $\\implies \\sum a_n$ div."],
          ["Ratio Test", "$L = \\lim_{n\\to\\infty} \\left|\\frac{a_{n+1}}{a_n}\\right|$", "$L < 1$ (absolutely convergent)", "Diverges if $L > 1$ or $\\infty$; inconclusive if $L = 1$"],
          ["Root Test", "$R = \\lim_{n\\to\\infty} \\sqrt[n]{|a_n|}$", "$R < 1$ (absolutely convergent)", "Diverges if $R > 1$ or $\\infty$; inconclusive if $R = 1$"],
          ["Alternating (Leibniz)", "$\\sum (-1)^{n-1} b_n$ ($b_n > 0$)", "$b_{n+1} \\le b_n$ eventually and $\\lim b_n = 0$ ($|R_N| \\le b_{N+1}$)", "Absolute convergence if $\\sum |a_n| < \\infty$; else conditional"],
        ],
      },
    },
    {
      id: "gamma-function",
      title: "3. Euler's Gamma Function Γ(z)",
      accentHex: "#029091",
      formulas: [
        {
          label: "Euler Integral of the Second Kind",
          latex: "\\Gamma(z) = \\int_0^{\\infty} t^{z-1} e^{-t}\\,dt",
          condition: "Converges for $z > 0$ in $\\mathbb{R}$ (or $\\operatorname{Re}(z) > 0$ in $\\mathbb{C}$)",
        },
        {
          label: "Fundamental Recurrence & Factorial Interpolation",
          latex:
            "\\Gamma(z + 1) = z\\,\\Gamma(z), \\qquad \\Gamma(n + 1) = n! \\quad (n \\in \\mathbb{Z}_{\\ge 0})",
          condition: "Meromorphic extension $\\Gamma(z) = \\frac{\\Gamma(z+1)}{z}$ reveals simple poles at $z = 0, -1, -2, \\dots$",
        },
        {
          label: "Gaussian Half-Integer Values",
          latex:
            "\\Gamma\\!\\left(\\frac{1}{2}\\right) = \\sqrt{\\pi}, \\qquad \\Gamma\\!\\left(n + \\frac{1}{2}\\right) = \\frac{(2n)!}{4^n\\,n!}\\sqrt{\\pi} \\quad (n \\ge 0)",
        },
        {
          label: "Euler Reflection & Legendre Duplication Formulas",
          latex:
            "\\Gamma(z)\\Gamma(1 - z) = \\frac{\\pi}{\\sin(\\pi z)} \\; (z \\notin \\mathbb{Z}), \\qquad \\Gamma(z)\\Gamma\\!\\left(z + \\frac{1}{2}\\right) = 2^{1 - 2z}\\sqrt{\\pi}\\,\\Gamma(2z)",
        },
      ],
    },
    {
      id: "beta-function-wallis",
      title: "4. Euler's Beta Function B(p, q) & Wallis Trig Integrals",
      accentHex: "#FBEAA4",
      formulas: [
        {
          label: "Euler Integral of the First Kind & Symmetry",
          latex:
            "\\mathrm{B}(p, q) = \\int_0^1 t^{p-1}(1 - t)^{q-1}\\,dt = \\mathrm{B}(q, p)",
          condition: "Converges for $p > 0, q > 0$ (or $\\operatorname{Re}(p), \\operatorname{Re}(q) > 0$)",
        },
        {
          label: "Trigonometric & Improper Rational Forms",
          latex:
            "\\mathrm{B}(p, q) = 2\\int_0^{\\pi/2} \\sin^{2p-1}\\theta\\cos^{2q-1}\\theta\\,d\\theta = \\int_0^{\\infty} \\frac{u^{p-1}}{(1 + u)^{p + q}}\\,du",
          note: "Obtained via $t = \\sin^2\\theta$ (trig form) and $t = \\frac{u}{1 + u}$ (improper rational form).",
        },
        {
          label: "Gamma–Beta Unification Identity",
          latex: "\\mathrm{B}(p, q) = \\frac{\\Gamma(p)\\,\\Gamma(q)}{\\Gamma(p + q)}",
          note: "Derived by evaluating $\\Gamma(p)\\Gamma(q)$ in $\\mathbb{R}^2$ polar coordinates.",
        },
        {
          label: "Wallis Sine–Cosine Power Integral Shortcut",
          latex:
            "\\int_0^{\\pi/2} \\sin^m\\theta\\cos^n\\theta\\,d\\theta = \\frac{1}{2}\\mathrm{B}\\!\\left(\\frac{m + 1}{2}, \\frac{n + 1}{2}\\right) = \\frac{\\Gamma\\!\\left(\\frac{m+1}{2}\\right)\\Gamma\\!\\left(\\frac{n+1}{2}\\right)}{2\\,\\Gamma\\!\\left(\\frac{m + n + 2}{2}\\right)}",
          condition: "Valid for all real $m > -1$ and $n > -1$",
        },
      ],
    },
  ],
};
