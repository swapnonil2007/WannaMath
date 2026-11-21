import type { FormulaSheetDefinition } from "./types";

export const ODE_METHODS_FORMULA_SHEET: FormulaSheetDefinition = {
  slug: "ode-methods",
  volumeId: "vol-3",
  volumeLabel: "Volume III: Multivariable & Vector Calculus",
  previewLatex:
    "y' + P(x)y = Q(x) \\implies \\mu(x) = e^{\\int P(x)\\,dx}, \\qquad y_p = \\frac{1}{f(D)}g(x)",
  title: "Ordinary Differential Equations, Inverse Operators & Cauchy–Euler Formulas",
  shortTitle: "ODE & Operator Formulas",
  subtitle:
    "First-order linear & Bernoulli equations, exactness factors, Wronskian & Abel identity, constant-coefficient characteristic roots, 1/f(D) operator shortcuts, Variation of Parameters, and Cauchy–Euler reductions.",
  badge: "FORMULA SHEET • MODULE 3.1 (ODEs)",
  accentHex: "#D35323",
  backChapterRoute:
    "/multivariable-calculus/differential-calculus/first-order-lde-bernoulli",
  backChapterLabel: "Back to Ch. 3.1.9: First-Order LDE & Bernoulli",
  relatedSlugs: ["multivariable-derivatives", "integrals", "taylor-expansions"],
  accuracyNotes: [
    "Monic Normalization for Variation of Parameters: Always rewrite $a(x)y'' + b(x)y' + c(x)y = r(x)$ into monic form $y'' + p(x)y' + q(x)y = g(x)$ (dividing $r(x)$ by $a(x)$) before inserting $g(x)$ into $u_1' = -y_2 g / W$ and $u_2' = y_1 g / W$.",
    "Bernoulli Equilibrium Check: Dividing $y' + P(x)y = Q(x)y^n$ ($n \\neq 0, 1$) by $y^n$ assumes $y \\neq 0$; when $n > 0$, test separately whether the trivial curve $y \\equiv 0$ is an additional solution.",
    "Cauchy–Euler Domain Restriction: Substituting $x = e^t$ solves $a x^2 y'' + b x y' + c y = g(x)$ on $x > 0$; for $x < 0$, replace $\\ln x$ by $\\ln|x|$ and $x^m$ by $|x|^m$ away from the regular singular point $x = 0$.",
  ],
  sections: [
    {
      id: "first-order-ode",
      title: "1. First-Order Linear, Bernoulli & Exact Differential Equations",
      accentHex: "#D35323",
      formulas: [
        {
          label: "First-Order Linear Standard Form & Integrating Factor",
          latex:
            "y' + P(x)y = Q(x) \\implies \\mu(x) = e^{\\int P(x)\\,dx}, \\qquad y(x) = \\frac{1}{\\mu(x)}\\left(\\int \\mu(x)Q(x)\\,dx + C\\right)",
          condition: "Valid on any open interval where $P(x)$ and $Q(x)$ are continuous",
        },
        {
          label: "Bernoulli Nonlinear-to-Linear Reduction",
          latex:
            "y' + P(x)y = Q(x)y^n \\xrightarrow{v = y^{1-n}} v' + (1 - n)P(x)v = (1 - n)Q(x)",
          condition: "$n \\neq 0, 1$; note $v' = (1 - n)y^{-n}y'$",
        },
        {
          label: "Exact Differential Equation Criterion",
          latex:
            "M(x, y)\\,dx + N(x, y)\\,dy = 0 \\text{ is exact} \\iff \\frac{\\partial M}{\\partial y} = \\frac{\\partial N}{\\partial x}",
          condition: "On a simply connected domain, general solution is $F(x, y) = C$ with $F_x = M, F_y = N$",
        },
        {
          label: "Integrating Factors for Non-Exact M dx + N dy = 0",
          latex:
            "\\mu(x) = \\exp\\!\\left(\\int \\frac{M_y - N_x}{N}\\,dx\\right) \\quad \\text{or} \\quad \\mu(y) = \\exp\\!\\left(\\int \\frac{N_x - M_y}{M}\\,dy\\right)",
          condition: "First applies when $(M_y - N_x)/N$ depends solely on $x$; second when $(N_x - M_y)/M$ depends solely on $y$",
        },
      ],
    },
    {
      id: "wronskian-abel",
      title: "2. Linear Independence, Wronskian & Abel's Identity",
      accentHex: "#8D9FCE",
      formulas: [
        {
          label: "Wronskian Determinant (2nd Order)",
          latex:
            "W(y_1, y_2)(x) = \\begin{vmatrix} y_1(x) & y_2(x) \\\\ y_1'(x) & y_2'(x) \\end{vmatrix} = y_1(x)y_2'(x) - y_2(x)y_1'(x)",
          note: "Geometric meaning: signed area of the parallelogram formed by state vectors $\\langle y_1, y_1' \\rangle$ and $\\langle y_2, y_2' \\rangle$.",
        },
        {
          label: "Abel's Identity",
          latex:
            "y'' + p(x)y' + q(x)y = 0 \\implies W(x) = W(x_0)\\,e^{-\\int_{x_0}^{x} p(t)\\,dt}",
          condition: "On any interval where $p, q$ are continuous, $W$ is either nowhere $0$ or identically $0$",
        },
        {
          label: "Reduction of Order Formula",
          latex:
            "y_2(x) = y_1(x) \\int \\frac{e^{-\\int p(x)\\,dx}}{\\bigl[y_1(x)\\bigr]^2}\\,dx",
          condition: "Given one non-vanishing homogeneous solution $y_1(x)$ to monic $y'' + p y' + q y = 0$",
        },
      ],
    },
    {
      id: "characteristic-roots",
      title: "3. Homogeneous Constant-Coefficient Equations (ay'' + by' + cy = 0)",
      accentHex: "#96B898",
      formulas: [
        {
          label: "Characteristic Auxiliary Equation",
          latex: "a r^2 + b r + c = 0, \\qquad r = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        },
      ],
      table: {
        title: "Complementary Solution y_c(x) by Discriminant Δ = b² − 4ac",
        headers: ["Discriminant $\\Delta$", "Root Type", "Complementary Solution $y_c(x)$"],
        rows: [
          ["$\\Delta > 0$", "Distinct real roots $r_1 \\neq r_2$", "$C_1 e^{r_1 x} + C_2 e^{r_2 x}$"],
          ["$\\Delta = 0$", "Repeated real root $r_1 = r_2 = r$", "$(C_1 + C_2 x) e^{rx}$"],
          ["$\\Delta < 0$", "Complex conjugates $r = \\alpha \\pm i\\beta$ ($\\beta > 0$)", "$e^{\\alpha x}\\bigl(C_1 \\cos\\beta x + C_2 \\sin\\beta x\\bigr)$"],
        ],
      },
    },
    {
      id: "inverse-operators",
      title: "4. Inverse Differential Operator 1 / f(D) Method for y_p",
      accentHex: "#029091",
      intro:
        "Let $D = \\frac{d}{dx}$ and assume constant coefficients $f(D)y = g(x)$, so $y_p = \\frac{1}{f(D)}g(x)$.",
      formulas: [
        {
          label: "Exponential Rule",
          latex:
            "\\frac{1}{f(D)}e^{ax} = \\frac{1}{f(a)}e^{ax} \\quad (f(a) \\neq 0); \\qquad \\frac{1}{(D - a)^k}\\bigl(e^{ax}\\bigr) = \\frac{x^k}{k!}e^{ax}",
          condition: "If $f(a) = 0$ with $f(D) = (D - a)^k \\phi(D)$ and $\\phi(a) \\neq 0$, evaluate $1/\\phi(a)$ first then apply $x^k/k!$",
        },
        {
          label: "Sine & Cosine Rule (Non-Resonant)",
          latex:
            "\\frac{1}{F(D^2)}\\sin(ax + b) = \\frac{1}{F(-a^2)}\\sin(ax + b), \\qquad \\frac{1}{F(D^2)}\\cos(ax + b) = \\frac{1}{F(-a^2)}\\cos(ax + b)",
          condition: "Replace $D^2 \\mapsto -a^2$ provided $F(-a^2) \\neq 0$",
        },
        {
          label: "Sine & Cosine Resonance Rescue",
          latex:
            "\\frac{1}{D^2 + a^2}\\sin(ax) = -\\frac{x}{2a}\\cos(ax), \\qquad \\frac{1}{D^2 + a^2}\\cos(ax) = \\frac{x}{2a}\\sin(ax)",
          condition: "Used when $D^2 = -a^2$ makes the denominator zero ($a \\neq 0$)",
        },
        {
          label: "Polynomial Expansion Rule",
          latex:
            "\\frac{1}{f(D)}\\bigl(x^m\\bigr) = \\bigl[1 + \\psi(D)\\bigr]^{-1}(x^m) = \\bigl(1 - \\psi(D) + \\psi(D)^2 - \\cdots\\bigr)x^m",
          condition: "Factor out the lowest power of $D$, expand in ascending powers of $D$ up to $D^m$ since $D^{k}(x^m) = 0$ for $k > m$",
        },
        {
          label: "Exponential Shift Theorem",
          latex: "\\frac{1}{f(D)}\\bigl[e^{ax} V(x)\\bigr] = e^{ax}\\,\\frac{1}{f(D + a)}V(x)",
          note: "Pulls $e^{ax}$ left past the operator while shifting $D \\mapsto D + a$.",
        },
        {
          label: "Product x · V(x) Operator Identity",
          latex:
            "\\frac{1}{f(D)}\\bigl[x\\,V(x)\\bigr] = x\\,\\frac{1}{f(D)}V(x) - \\frac{f'(D)}{\\bigl[f(D)\\bigr]^2}V(x)",
          note: "Equivalently take $\\operatorname{Im}$ or $\\operatorname{Re}$ of $\\frac{1}{f(D)}[x e^{iax}]$ after applying Exponential Shift.",
        },
      ],
    },
    {
      id: "variation-of-parameters",
      title: "5. Variation of Parameters (General Forcing g(x))",
      accentHex: "#B95869",
      formulas: [
        {
          label: "Particular Integral Representation",
          latex:
            "y'' + p(x)y' + q(x)y = g(x) \\implies y_p(x) = u_1(x)y_1(x) + u_2(x)y_2(x)",
          condition: "$y_1, y_2$ form a fundamental set of solutions to the homogeneous equation with $W = W(y_1, y_2) \\neq 0$",
        },
        {
          label: "Parameter Rate Equations",
          latex:
            "u_1'(x) = -\\frac{y_2(x)\\,g(x)}{W(y_1, y_2)(x)}, \\qquad u_2'(x) = \\frac{y_1(x)\\,g(x)}{W(y_1, y_2)(x)}",
          note: "Integrate $u_1'$ and $u_2'$ without extra arbitrary constants (those already live in $y_c = C_1 y_1 + C_2 y_2$).",
        },
      ],
      examples: [
        {
          title: "Non-Exponential Forcing y'' + y = sec(x)",
          stepsLatex: [
            "y_1 = \\cos x, \\quad y_2 = \\sin x, \\quad W = \\cos^2 x + \\sin^2 x = 1, \\quad g(x) = \\sec x",
            "u_1' = -\\sin x\\sec x = -\\tan x \\implies u_1 = \\ln|\\cos x|, \\qquad u_2' = \\cos x\\sec x = 1 \\implies u_2 = x",
            "y_p(x) = \\cos(x)\\ln|\\cos x| + x\\sin x \\quad \\text{on } \\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)",
          ],
          takeaway:
            "Variation of Parameters works for any continuous $g(x)$ (such as $\\sec x$, $\\tan x$, or $\\ln x$) where $1/f(D)$ and undetermined coefficients fail.",
        },
      ],
    },
    {
      id: "cauchy-euler",
      title: "6. Cauchy–Euler (Equidimensional) Equations & Log Pullback",
      accentHex: "#D5658B",
      formulas: [
        {
          label: "Standard Second-Order Cauchy–Euler Equation",
          latex: "a x^2 y'' + b x y' + c y = g(x) \\qquad (x > 0)",
        },
        {
          label: "Logarithmic Change of Variable x = e^t (t = ln x)",
          latex:
            "\\theta := x\\frac{d}{dx} = \\frac{d}{dt} \\implies x y' = \\theta y, \\quad x^2 y'' = \\theta(\\theta - 1)y, \\quad x^3 y''' = \\theta(\\theta - 1)(\\theta - 2)y",
          condition: "Turns $a x^2 y'' + b x y' + c y = g(x)$ into $[a\\theta(\\theta - 1) + b\\theta + c]y = g(e^t)$",
        },
      ],
      table: {
        title: "Cauchy–Euler Homogeneous Basis Solutions (am² + (b − a)m + c = 0, x > 0)",
        headers: ["Auxiliary Root Case", "Homogeneous Solution $y_c(x)$", "Extension for $x < 0$"],
        rows: [
          ["Distinct real $m_1 \\neq m_2$", "$C_1 x^{m_1} + C_2 x^{m_2}$", "Replace $x$ with $|x|$"],
          ["Repeated real $m_1 = m_2 = m$", "$x^m (C_1 + C_2 \\ln x)$", "Replace $\\ln x$ with $\\ln|x|$, $x^m$ with $|x|^m$"],
          ["Complex $\\alpha \\pm i\\beta$", "$x^\\alpha\\bigl(C_1 \\cos(\\beta\\ln x) + C_2 \\sin(\\beta\\ln x)\\bigr)$", "Replace $x$ with $|x|$"],
        ],
      },
    },
  ],
};
