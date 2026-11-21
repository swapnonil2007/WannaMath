import type { FormulaSheetDefinition } from "./types";

export const MULTIPLE_INTEGRALS_FORMULA_SHEET: FormulaSheetDefinition = {
  slug: "multiple-integrals-jacobians",
  volumeId: "vol-3",
  volumeLabel: "Volume III: Multivariable & Vector Calculus",
  previewLatex:
    "\\iint_{R_{xy}} f\\,dx\\,dy = \\iint_{R_{uv}} f(x,y)\\left|\\frac{\\partial(x,y)}{\\partial(u,v)}\\right|du\\,dv",
  title: "Multiple Integrals, Curvilinear Coordinates & Jacobians",
  shortTitle: "Multiple Integrals & Jacobians",
  subtitle:
    "Double and triple iterated integrals, Fubini order reversal, 6-order shadow bounds, Polar, Cylindrical & Spherical coordinate scale factors, 2D/3D Jacobian determinants, and mass/moment formulas.",
  badge: "FORMULA SHEET • MODULE 3.2",
  accentHex: "#029091",
  backChapterRoute:
    "/multivariable-calculus/integral-calculus/double-integrals",
  backChapterLabel: "Back to Ch. 3.2.1: Double Integrals & Fubini",
  relatedSlugs: ["convergence-gamma-beta", "vector-calculus", "integrals"],
  accuracyNotes: [
    "Spherical Coordinate Convention: Throughout Wanna Math, $\\rho \\ge 0$ is radial distance from the origin, $\\phi \\in [0, \\pi]$ is polar colatitude measured down from the $+z$-axis, and $\\theta \\in [0, 2\\pi)$ is azimuth in the $xy$-plane (note many physics texts swap $\\theta$ and $\\phi$).",
    "Absolute Jacobian Factor: Change-of-variables for scalar area or volume integrals always uses $|\\det J|$, even when the map reverses orientation (negative determinant).",
    "Fubini Hypotheses: Swapping $dy\\,dx \\leftrightarrow dx\\,dy$ holds when $f$ is continuous on a bounded domain $R$ (or more generally when $\\iint_R |f(x,y)|\\,dA < \\infty$).",
  ],
  sections: [
    {
      id: "double-integrals-fubini",
      title: "1. Double Integrals, Type I/II Regions & Fubini's Theorem",
      accentHex: "#8D9FCE",
      formulas: [
        {
          label: "Type I Region (Vertical Strips: dy dx)",
          latex:
            "\\iint_R f(x, y)\\,dA = \\int_a^b \\int_{g_1(x)}^{g_2(x)} f(x, y)\\,dy\\,dx",
          condition: "$R = \\{(x, y) : a \\le x \\le b,\\; g_1(x) \\le y \\le g_2(x)\\}$",
        },
        {
          label: "Type II Region (Horizontal Strips: dx dy)",
          latex:
            "\\iint_R f(x, y)\\,dA = \\int_c^d \\int_{h_1(y)}^{h_2(y)} f(x, y)\\,dx\\,dy",
          condition: "$R = \\{(x, y) : c \\le y \\le d,\\; h_1(y) \\le x \\le h_2(y)\\}$",
        },
        {
          label: "Area & Average Value of f over R",
          latex:
            "\\operatorname{Area}(R) = \\iint_R 1\\,dA, \\qquad f_{\\text{avg}} = \\frac{1}{\\operatorname{Area}(R)}\\iint_R f(x, y)\\,dA",
        },
        {
          label: "Product Separation over Rectangle [a,b] × [c,d]",
          latex:
            "\\int_a^b\\int_c^d p(x)q(y)\\,dy\\,dx = \\left(\\int_a^b p(x)\\,dx\\right)\\left(\\int_c^d q(y)\\,dy\\right)",
        },
      ],
      examples: [
        {
          title: "Order Reversal Rescue: ∫₀¹ ∫ₓ¹ e^{y²} dy dx",
          stepsLatex: [
            "0 \\le x \\le 1,\\; x \\le y \\le 1 \\quad \\Longleftrightarrow \\quad 0 \\le y \\le 1,\\; 0 \\le x \\le y",
            "\\int_0^1\\int_x^1 e^{y^2}\\,dy\\,dx = \\int_0^1\\int_0^y e^{y^2}\\,dx\\,dy = \\int_0^1 y e^{y^2}\\,dy = \\frac{1}{2}(e - 1)",
          ],
          takeaway:
            "Always sketch the region $R$ from the inner and outer inequalities before reversing integration bounds.",
        },
      ],
    },
    {
      id: "triple-integrals",
      title: "2. Triple Integrals & 6-Order Shadow Projections",
      accentHex: "#029091",
      formulas: [
        {
          label: "z-Simple Triple Integral (Ray Along z, Shadow in xy)",
          latex:
            "\\iiint_E f(x, y, z)\\,dV = \\iint_{\\pi_{xy}(E)} \\left[\\int_{u_1(x,y)}^{u_2(x,y)} f(x, y, z)\\,dz\\right] dA_{xy}",
          condition: "Entry surface $z = u_1(x,y)$ and exit surface $z = u_2(x,y)$",
        },
        {
          label: "3D Volume & Average Value",
          latex:
            "\\operatorname{Vol}(E) = \\iiint_E 1\\,dV, \\qquad f_{\\text{avg}} = \\frac{1}{\\operatorname{Vol}(E)}\\iiint_E f(x, y, z)\\,dV",
        },
      ],
      table: {
        title: "All 6 Permutations of dx dy dz and Their Shadow Walls",
        headers: ["Differential Order", "Inner 1D Ray", "Shadow Projection Plane", "Middle-Outer Type"],
        rows: [
          ["$dz\\,dy\\,dx$ / $dz\\,dx\\,dy$", "$u_1(x,y) \\le z \\le u_2(x,y)$", "$xy$-plane ($\\pi_{xy}(E)$)", "$dy\\,dx$ (Type I) / $dx\\,dy$ (Type II)"],
          ["$dy\\,dz\\,dx$ / $dy\\,dx\\,dz$", "$v_1(x,z) \\le y \\le v_2(x,z)$", "$xz$-plane ($\\pi_{xz}(E)$)", "$dz\\,dx$ / $dx\\,dz$"],
          ["$dx\\,dz\\,dy$ / $dx\\,dy\\,dz$", "$w_1(y,z) \\le x \\le w_2(y,z)$", "$yz$-plane ($\\pi_{yz}(E)$)", "$dz\\,dy$ / $dy\\,dz$"],
        ],
      },
    },
    {
      id: "curvilinear-coordinates",
      title: "3. Polar, Cylindrical & Spherical Coordinates + Scale Factors",
      accentHex: "#AAA36D",
      formulas: [
        {
          label: "2D Polar Coordinates (r, θ)",
          latex:
            "x = r\\cos\\theta, \\quad y = r\\sin\\theta, \\quad r^2 = x^2 + y^2, \\qquad dA = r\\,dr\\,d\\theta",
          condition: "$r \\ge 0$, typically $\\theta \\in [0, 2\\pi)$",
        },
        {
          label: "3D Cylindrical Coordinates (r, θ, z)",
          latex:
            "x = r\\cos\\theta, \\quad y = r\\sin\\theta, \\quad z = z, \\qquad dV = r\\,dz\\,dr\\,d\\theta",
        },
        {
          label: "3D Spherical Coordinates (ρ, φ, θ)",
          latex:
            "x = \\rho\\sin\\phi\\cos\\theta, \\quad y = \\rho\\sin\\phi\\sin\\theta, \\quad z = \\rho\\cos\\phi, \\qquad dV = \\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta",
          condition: "$\\rho = \\sqrt{x^2+y^2+z^2} \\ge 0$, $\\phi \\in [0, \\pi]$, $\\theta \\in [0, 2\\pi)$",
        },
      ],
      table: {
        title: "Orthogonal Curvilinear Scale Factors (h₁, h₂, h₃) & Volume Elements",
        headers: ["Coordinate System $(q_1, q_2, q_3)$", "Scale Factors $(h_1, h_2, h_3)$", "Arc-Length Metric $ds^2$", "Volume Element $dV = h_1 h_2 h_3\\,dq_1\\,dq_2\\,dq_3$"],
        rows: [
          ["Cartesian $(x, y, z)$", "$(1, 1, 1)$", "$dx^2 + dy^2 + dz^2$", "$dx\\,dy\\,dz$"],
          ["Cylindrical $(r, \\theta, z)$", "$(1, r, 1)$", "$dr^2 + r^2 d\\theta^2 + dz^2$", "$r\\,dr\\,d\\theta\\,dz$"],
          ["Spherical $(\\rho, \\phi, \\theta)$", "$(1, \\rho, \\rho\\sin\\phi)$", "$d\\rho^2 + \\rho^2 d\\phi^2 + \\rho^2\\sin^2\\phi\\,d\\theta^2$", "$\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$"],
        ],
      },
    },
    {
      id: "jacobians",
      title: "4. 2D & 3D Jacobians and Change of Variables Pullback",
      accentHex: "#D35323",
      formulas: [
        {
          label: "2D Jacobian Determinant",
          latex:
            "J(u, v) = \\frac{\\partial(x, y)}{\\partial(u, v)} = \\begin{vmatrix} \\dfrac{\\partial x}{\\partial u} & \\dfrac{\\partial x}{\\partial v} \\\\[8pt] \\dfrac{\\partial y}{\\partial u} & \\dfrac{\\partial y}{\\partial v} \\end{vmatrix} = \\frac{\\partial x}{\\partial u}\\frac{\\partial y}{\\partial v} - \\frac{\\partial x}{\\partial v}\\frac{\\partial y}{\\partial u}",
        },
        {
          label: "2D Change of Variables Formula",
          latex:
            "\\iint_{R_{xy}} f(x, y)\\,dx\\,dy = \\iint_{R_{uv}} f\\bigl(x(u, v), y(u, v)\\bigr)\\left|\\frac{\\partial(x, y)}{\\partial(u, v)}\\right|du\\,dv",
          condition: "Assuming $T(u, v) = (x(u, v), y(u, v))$ is $C^1$ and one-to-one on the interior of $R_{uv}$",
        },
        {
          label: "3D Jacobian Determinant & Pullback",
          latex:
            "\\frac{\\partial(x, y, z)}{\\partial(u, v, w)} = \\begin{vmatrix} x_u & x_v & x_w \\\\ y_u & y_v & y_w \\\\ z_u & z_v & z_w \\end{vmatrix}, \\qquad \\iiint_{E_{xyz}} f\\,dV = \\iiint_{E_{uvw}} f\\left|\\frac{\\partial(x,y,z)}{\\partial(u,v,w)}\\right|du\\,dv\\,dw",
        },
        {
          label: "Inverse Jacobian Identity",
          latex:
            "\\frac{\\partial(x, y)}{\\partial(u, v)} \\cdot \\frac{\\partial(u, v)}{\\partial(x, y)} = 1 \\implies \\left|\\frac{\\partial(x, y)}{\\partial(u, v)}\\right| = \\left|\\frac{\\partial(u, v)}{\\partial(x, y)}\\right|^{-1}",
          note: "Handy whenever it is much faster to differentiate inverse maps $u(x,y), v(x,y)$ instead of solving explicitly for $x(u,v), y(u,v)$.",
        },
      ],
    },
    {
      id: "mass-moments-surface-area",
      title: "5. Mass, Centroids, Moments of Inertia & Explicit Surface Area",
      accentHex: "#96B898",
      formulas: [
        {
          label: "Total Mass & Center of Mass (2D Lamina / 3D Solid)",
          latex:
            "M = \\iiint_E \\rho(x,y,z)\\,dV, \\qquad \\bar{x} = \\frac{1}{M}\\iiint_E x\\rho\\,dV, \\quad \\bar{y} = \\frac{1}{M}\\iiint_E y\\rho\\,dV, \\quad \\bar{z} = \\frac{1}{M}\\iiint_E z\\rho\\,dV",
        },
        {
          label: "Moments of Inertia (3D Axes)",
          latex:
            "I_x = \\iiint_E (y^2 + z^2)\\rho\\,dV, \\qquad I_y = \\iiint_E (x^2 + z^2)\\rho\\,dV, \\qquad I_z = \\iiint_E (x^2 + y^2)\\rho\\,dV",
          note: "For a flat 2D lamina with density $\\rho(x,y)$: $I_x = \\iint y^2 \\rho\\,dA$, $I_y = \\iint x^2 \\rho\\,dA$, and polar $I_0 = I_x + I_y = \\iint (x^2 + y^2)\\rho\\,dA$.",
        },
        {
          label: "Surface Area of Explicit Graph z = f(x, y)",
          latex:
            "A(S) = \\iint_R \\sqrt{1 + \\left(\\frac{\\partial f}{\\partial x}\\right)^2 + \\left(\\frac{\\partial f}{\\partial y}\\right)^2}\\,dA",
          condition: "Assuming $f \\in C^1$ over region $R$",
        },
      ],
    },
  ],
};
