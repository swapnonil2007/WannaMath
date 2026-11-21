import type { FormulaSheetDefinition } from "./types";

export const MULTIVARIABLE_DERIVATIVES_FORMULA_SHEET: FormulaSheetDefinition = {
  slug: "multivariable-derivatives",
  volumeId: "vol-3",
  volumeLabel: "Volume III: Multivariable & Vector Calculus",
  previewLatex:
    "df = f_x\\,dx + f_y\\,dy, \\qquad \\nabla f = \\lambda\\,\\nabla g",
  title: "Multivariable Derivatives, Chain Rule, Euler & Extrema Formulas",
  shortTitle: "Multivariable Derivatives",
  subtitle:
    "Partial derivatives, total differentials, Clairaut symmetry, multivariable chain rules, implicit differentiation, Euler's homogeneous theorems, 2D Taylor/Hessian extrema tests, and Lagrange multipliers.",
  badge: "FORMULA SHEET • MODULE 3.1",
  accentHex: "#96B898",
  backChapterRoute:
    "/multivariable-calculus/differential-calculus/partial-derivatives-tangent-planes",
  backChapterLabel: "Back to Ch. 3.1.2: Partial Derivatives & Tangent Planes",
  relatedSlugs: ["ode-methods", "multiple-integrals-jacobians", "derivatives"],
  accuracyNotes: [
    "Partial Existence Does Not Imply Differentiability: Both $f_x$ and $f_y$ can exist at $(x_0, y_0)$ while $f$ fails to have a tangent plane (or even continuity). Total differentiability requires $\\lim_{(h,k)\\to(0,0)} \\frac{|f(x_0+h, y_0+k) - L(x_0+h, y_0+k)|}{\\sqrt{h^2+k^2}} = 0$; continuous partials ($C^1$) provide a sufficient guarantee.",
    "Clairaut / Schwarz Symmetry Condition: $f_{xy}(x_0, y_0) = f_{yx}(x_0, y_0)$ holds wherever both mixed second partials exist in a neighborhood and are continuous at $(x_0, y_0)$. Discontinuous mixed partials (such as Peano's function) can violate equality at the origin.",
    "Hessian Discriminant $D = 0$: When $D = f_{xx}f_{yy} - f_{xy}^2 = 0$, the Second Derivative Test is strictly inconclusive and can hide a valley, peak, ridge, or parabolic saddle; resolve via direct sign analysis of $\\Delta f(h, k)$.",
    "Lagrange Regularity Condition: The equation $\\nabla f = \\lambda \\nabla g$ detects constrained extrema only at regular constraint points where $\\nabla g \\neq \\mathbf{0}$; singular cusps where $\\nabla g = \\mathbf{0}$ and domain endpoints must be checked separately.",
  ],
  sections: [
    {
      id: "partials-tangent-plane",
      title: "1. Partial Derivatives, Total Differential & Tangent Planes",
      accentHex: "#96B898",
      formulas: [
        {
          label: "First-Order Partial Derivatives",
          latex:
            "f_x(x_0, y_0) = \\lim_{h \\to 0} \\frac{f(x_0 + h, y_0) - f(x_0, y_0)}{h}, \\qquad f_y(x_0, y_0) = \\lim_{k \\to 0} \\frac{f(x_0, y_0 + k) - f(x_0, y_0)}{k}",
        },
        {
          label: "Tangent Plane Linearization L(x, y)",
          latex:
            "L(x, y) = f(x_0, y_0) + f_x(x_0, y_0)(x - x_0) + f_y(x_0, y_0)(y - y_0)",
          condition: "Valid local linear model when $f$ is differentiable at $(x_0, y_0)$",
        },
        {
          label: "Total Differential df",
          latex:
            "df = \\frac{\\partial f}{\\partial x}\\,dx + \\frac{\\partial f}{\\partial y}\\,dy \\qquad \\left(df = \\sum_{i=1}^n \\frac{\\partial f}{\\partial x_i}\\,dx_i\\right)",
          note: "First-order error approximation $\\Delta f \\approx df$ for small increments $\\Delta x = dx$, $\\Delta y = dy$.",
        },
        {
          label: "Total Differentiability Criterion",
          latex:
            "\\lim_{(h,k) \\to (0,0)} \\frac{\\bigl|f(x_0+h, y_0+k) - f(x_0, y_0) - f_x(x_0, y_0)h - f_y(x_0, y_0)k\\bigr|}{\\sqrt{h^2 + k^2}} = 0",
          condition: "Guaranteed if $f_x, f_y$ exist near $(x_0, y_0)$ and are continuous at $(x_0, y_0)$",
        },
      ],
    },
    {
      id: "higher-order-clairaut",
      title: "2. Higher-Order Partials & Clairaut's Symmetry Theorem",
      accentHex: "#8D9FCE",
      formulas: [
        {
          label: "Second-Order Partial Derivatives",
          latex:
            "f_{xx} = \\frac{\\partial^2 f}{\\partial x^2}, \\qquad f_{yy} = \\frac{\\partial^2 f}{\\partial y^2}, \\qquad f_{xy} = (f_x)_y = \\frac{\\partial^2 f}{\\partial y\\,\\partial x}, \\qquad f_{yx} = (f_y)_x = \\frac{\\partial^2 f}{\\partial x\\,\\partial y}",
        },
        {
          label: "Clairaut / Schwarz Symmetry Theorem",
          latex: "f_{xy}(x_0, y_0) = f_{yx}(x_0, y_0)",
          condition: "Provided $f_{xy}$ and $f_{yx}$ exist near $(x_0, y_0)$ and are continuous at $(x_0, y_0)$",
          note: "Peano's counterexample $f(x, y) = \\frac{xy(x^2 - y^2)}{x^2 + y^2}$ ($f(0,0)=0$) has $f_{xy}(0,0) = -1 \\neq +1 = f_{yx}(0,0)$ because the mixed partials fail continuity at the origin.",
        },
      ],
    },
    {
      id: "chain-rule-implicit",
      title: "3. Multivariable Chain Rule & Implicit Differentiation",
      accentHex: "#029091",
      formulas: [
        {
          label: "Chain Rule Along a Parameterized Curve r(t)",
          latex:
            "\\frac{dz}{dt} = \\frac{\\partial f}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial f}{\\partial y}\\frac{dy}{dt} = \\nabla f\\bigl(\\mathbf{r}(t)\\bigr) \\cdot \\mathbf{r}'(t)",
          condition: "When $f$ is differentiable and $x(t), y(t)$ are differentiable",
        },
        {
          label: "2D Parameter Tree Chain Rule",
          latex:
            "\\frac{\\partial z}{\\partial u} = \\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial u} + \\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial u}, \\qquad \\frac{\\partial z}{\\partial v} = \\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial v} + \\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial v}",
        },
        {
          label: "Implicit Curve Derivative (2D)",
          latex: "F(x, y) = 0 \\implies \\frac{dy}{dx} = -\\frac{F_x}{F_y}",
          condition: "Provided $F \\in C^1$ and $F_y(x, y) \\neq 0$",
        },
        {
          label: "Implicit Surface Partials (3D)",
          latex:
            "F(x, y, z) = 0 \\implies \\frac{\\partial z}{\\partial x} = -\\frac{F_x}{F_z}, \\qquad \\frac{\\partial z}{\\partial y} = -\\frac{F_y}{F_z}",
          condition: "Provided $F \\in C^1$ and $F_z(x, y, z) \\neq 0$",
        },
      ],
    },
    {
      id: "euler-homogeneous",
      title: "4. Homogeneous Functions & Euler's Theorems",
      accentHex: "#AAA36D",
      formulas: [
        {
          label: "Homogeneity Definition of Degree n",
          latex: "f(t x, t y) = t^n\\,f(x, y) \\quad \\text{or} \\quad f(x, y) = x^n \\psi\\!\\left(\\frac{y}{x}\\right)",
          condition: "For all scaling factors $t > 0$ on the conical domain ($x > 0$ for the quotient form)",
        },
        {
          label: "Euler's First-Order Theorem",
          latex: "x\\frac{\\partial f}{\\partial x} + y\\frac{\\partial f}{\\partial y} = n\\,f(x, y)",
          condition: "In $m$ variables: $\\sum_{i=1}^m x_i\\,\\frac{\\partial f}{\\partial x_i} = n\\,f$",
        },
        {
          label: "Euler's Second-Order Identity",
          latex:
            "x^2\\frac{\\partial^2 f}{\\partial x^2} + 2xy\\frac{\\partial^2 f}{\\partial x\\,\\partial y} + y^2\\frac{\\partial^2 f}{\\partial y^2} = n(n - 1)\\,f(x, y)",
          condition: "Requires $f \\in C^2$ and homogeneous of degree $n$",
        },
        {
          label: "Composite Homogeneous Deduction g(u) = f_n",
          latex:
            "x u_x + y u_y = n\\frac{g(u)}{g'(u)} =: \\varphi(u) \\implies x^2 u_{xx} + 2xy u_{xy} + y^2 u_{yy} = \\varphi(u)\\bigl(\\varphi'(u) - 1\\bigr)",
          condition: "When $g(u)$ is homogeneous of degree $n$ and $g'(u) \\neq 0$ (e.g., $\\sin u = f_n$)",
        },
      ],
    },
    {
      id: "taylor-hessian-extrema",
      title: "5. 2D Taylor Expansion, Hessian Matrix & Extrema Classification",
      accentHex: "#B95869",
      formulas: [
        {
          label: "2D Second-Order Taylor Approximation",
          latex:
            "T_2(\\mathbf{p}_0 + \\mathbf{h}) = f(\\mathbf{p}_0) + \\nabla f(\\mathbf{p}_0)\\cdot\\mathbf{h} + \\frac{1}{2}\\mathbf{h}^T \\mathbf{H}_f(\\mathbf{p}_0)\\mathbf{h}",
          note: "Explicitly: $f(x_0+h, y_0+k) \\approx f(x_0, y_0) + f_x h + f_y k + \\frac{1}{2}\\bigl(r h^2 + 2s h k + t k^2\\bigr)$.",
        },
        {
          label: "Hessian Matrix & Discriminant D",
          latex:
            "\\mathbf{H}_f(x_0, y_0) = \\begin{pmatrix} r & s \\\\ s & t \\end{pmatrix} = \\begin{pmatrix} f_{xx} & f_{xy} \\\\ f_{yx} & f_{yy} \\end{pmatrix}, \\qquad D = \\det(\\mathbf{H}_f) = rt - s^2",
          condition: "At a critical point where $\\nabla f(x_0, y_0) = \\mathbf{0}$ (or $\\nabla f$ undefined)",
        },
      ],
      table: {
        title: "Second Derivative Test Summary at Stationary Point (∇f = 0, C²)",
        headers: ["Hessian Determinant $D$", "Curvature Sign $r = f_{xx}$", "Eigenvalues of $\\mathbf{H}_f$", "Classification"],
        rows: [
          ["$D > 0$", "$r > 0$", "Both $\\lambda_1, \\lambda_2 > 0$", "Strict Local Minimum (cup up)"],
          ["$D > 0$", "$r < 0$", "Both $\\lambda_1, \\lambda_2 < 0$", "Strict Local Maximum (dome down)"],
          ["$D < 0$", "Any", "$\\lambda_1 \\lambda_2 < 0$ (opposite signs)", "Saddle Point (indefinite)"],
          ["$D = 0$", "Any", "At least one $\\lambda_i = 0$", "Inconclusive — inspect $\\Delta f(h,k)$ sign directly"],
        ],
      },
    },
    {
      id: "lagrange-multipliers",
      title: "6. Lagrange Multipliers & Constrained Optimization",
      accentHex: "#D5658B",
      formulas: [
        {
          label: "Single Constraint System",
          latex: "\\nabla f(x, y, z) = \\lambda\\,\\nabla g(x, y, z), \\qquad g(x, y, z) = c",
          condition: "Regularity assumption: $\\nabla g(x^*, y^*, z^*) \\neq \\mathbf{0}$",
          note: "Multiplier sensitivity law: $\\lambda = \\frac{df^*}{dc}$ measures change in optimal objective per unit relaxation of constraint $c$.",
        },
        {
          label: "Two-Constraint System",
          latex:
            "\\nabla f(x, y, z) = \\lambda\\,\\nabla g(x, y, z) + \\mu\\,\\nabla h(x, y, z), \\qquad g = c_1,\\; h = c_2",
          condition: "Regularity: $\\nabla g$ and $\\nabla h$ are linearly independent ($\\nabla g \\times \\nabla h \\neq \\mathbf{0}$)",
        },
      ],
      bulletNotes: [
        "Boundary & Global Extrema on Compact Domains: For continuous $f$ on a closed bounded set $S$, compare (1) interior critical points ($\\nabla f = \\mathbf{0}$ or undefined), (2) Lagrange candidates along smooth boundary faces, and (3) boundary corners/cusps where $\\nabla g = \\mathbf{0}$.",
      ],
    },
  ],
};
