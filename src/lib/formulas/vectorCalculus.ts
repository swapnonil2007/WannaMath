import type { FormulaSheetDefinition } from "./types";

export const VECTOR_CALCULUS_FORMULA_SHEET: FormulaSheetDefinition = {
  slug: "vector-calculus",
  volumeId: "vol-3",
  volumeLabel: "Volume III: Multivariable & Vector Calculus",
  previewLatex:
    "\\iint_S (\\nabla\\times\\mathbf{F})\\cdot d\\mathbf{S} = \\oint_{\\partial S}\\mathbf{F}\\cdot d\\mathbf{r}, \\qquad \\oiint_{\\partial E}\\mathbf{F}\\cdot d\\mathbf{S} = \\iiint_E (\\nabla\\cdot\\mathbf{F})\\,dV",
  title: "Vector Calculus: Del Operator, Identities & Integral Theorems",
  shortTitle: "Vector Calculus & Del",
  subtitle:
    "Gradient, divergence, curl, and Laplacian in Cartesian, Cylindrical, and Spherical coordinates; exact-zero and product identities; directional derivatives; line & surface flux integrals; and Green's, Stokes' & Gauss's Theorems.",
  badge: "FORMULA SHEET • MODULE 3.3",
  accentHex: "#D35323",
  backChapterRoute:
    "/multivariable-calculus/vector-calculus/vector-fields-divergence-curl",
  backChapterLabel: "Back to Ch. 3.3.3: Vector Fields, Divergence & Curl",
  relatedSlugs: [
    "multiple-integrals-jacobians",
    "multivariable-derivatives",
    "convergence-gamma-beta",
  ],
  accuracyNotes: [
    "Unit Normalization Guard for Directional Derivatives: Always normalize a nonzero direction vector $\\mathbf{v}$ into $\\hat{\\mathbf{u}} = \\frac{\\mathbf{v}}{\\|\\mathbf{v}\\|}$ before computing $D_{\\hat{\\mathbf{u}}}f = \\nabla f \\cdot \\hat{\\mathbf{u}}$.",
    "Simply Connected Domain Caveat for Conservative Fields: $\\nabla \\times \\mathbf{F} = \\mathbf{0}$ guarantees $\\mathbf{F} = \\nabla f$ only on a simply connected domain (free of holes). The punctured vortex $\\langle -y, x, 0\\rangle/(x^2+y^2)$ is curl-free on $\\mathbb{R}^2 \\setminus \\{(0,0)\\}$ yet yields nonzero loop circulation $2\\pi$.",
    "Spherical Coordinate Del Convention: Below, $(\\rho, \\phi, \\theta)$ uses $\\rho \\ge 0$ radius, polar angle $\\phi \\in [0, \\pi]$ down from $+z$, azimuth $\\theta \\in [0, 2\\pi)$, and right-handed unit triad $(\\hat{\\mathbf{e}}_\\rho, \\hat{\\mathbf{e}}_\\phi, \\hat{\\mathbf{e}}_\\theta)$; scalar fields are denoted $f$ to avoid colliding with polar angle $\\phi$.",
    "Integral Theorem Smoothness & Orientation: Green's, Stokes', and Gauss's Theorems require $\\mathbf{F} \\in C^1$ across the entire enclosed region, surface cap, or control volume with matched positive (right-hand / outward) orientation.",
  ],
  sections: [
    {
      id: "del-coordinates",
      title: "1. The Del Operator (∇) in Cartesian, Cylindrical & Spherical Coordinates",
      accentHex: "#D35323",
      formulas: [
        {
          label: "Cartesian Coordinates (x, y, z)",
          latex:
            "\\nabla f = \\frac{\\partial f}{\\partial x}\\mathbf{i} + \\frac{\\partial f}{\\partial y}\\mathbf{j} + \\frac{\\partial f}{\\partial z}\\mathbf{k}, \\qquad \\nabla\\cdot\\mathbf{F} = P_x + Q_y + R_z, \\qquad \\nabla^2 f = f_{xx} + f_{yy} + f_{zz}",
          note: "Cartesian curl: $\\nabla\\times\\mathbf{F} = (R_y - Q_z)\\mathbf{i} + (P_z - R_x)\\mathbf{j} + (Q_x - P_y)\\mathbf{k}$.",
        },
        {
          label: "Cylindrical Gradient & Divergence (r, θ, z)",
          latex:
            "\\nabla f = \\frac{\\partial f}{\\partial r}\\hat{\\mathbf{e}}_r + \\frac{1}{r}\\frac{\\partial f}{\\partial \\theta}\\hat{\\mathbf{e}}_\\theta + \\frac{\\partial f}{\\partial z}\\hat{\\mathbf{e}}_z, \\qquad \\nabla\\cdot\\mathbf{F} = \\frac{1}{r}\\frac{\\partial(r F_r)}{\\partial r} + \\frac{1}{r}\\frac{\\partial F_\\theta}{\\partial \\theta} + \\frac{\\partial F_z}{\\partial z}",
          condition: "Scale factors $(h_r, h_\\theta, h_z) = (1, r, 1)$ for $r > 0$",
        },
        {
          label: "Cylindrical Curl & Scalar Laplacian",
          latex:
            "\\nabla\\times\\mathbf{F} = \\frac{1}{r}\\begin{vmatrix} \\hat{\\mathbf{e}}_r & r\\hat{\\mathbf{e}}_\\theta & \\hat{\\mathbf{e}}_z \\\\ \\partial_r & \\partial_\\theta & \\partial_z \\\\ F_r & r F_\\theta & F_z \\end{vmatrix}, \\qquad \\nabla^2 f = \\frac{1}{r}\\frac{\\partial}{\\partial r}\\!\\left(r\\frac{\\partial f}{\\partial r}\\right) + \\frac{1}{r^2}\\frac{\\partial^2 f}{\\partial \\theta^2} + \\frac{\\partial^2 f}{\\partial z^2}",
        },
        {
          label: "Spherical Gradient & Divergence (ρ, φ, θ)",
          latex:
            "\\nabla f = \\frac{\\partial f}{\\partial \\rho}\\hat{\\mathbf{e}}_\\rho + \\frac{1}{\\rho}\\frac{\\partial f}{\\partial \\phi}\\hat{\\mathbf{e}}_\\phi + \\frac{1}{\\rho\\sin\\phi}\\frac{\\partial f}{\\partial \\theta}\\hat{\\mathbf{e}}_\\theta, \\quad \\nabla\\cdot\\mathbf{F} = \\frac{1}{\\rho^2}\\frac{\\partial(\\rho^2 F_\\rho)}{\\partial \\rho} + \\frac{1}{\\rho\\sin\\phi}\\frac{\\partial(F_\\phi\\sin\\phi)}{\\partial \\phi} + \\frac{1}{\\rho\\sin\\phi}\\frac{\\partial F_\\theta}{\\partial \\theta}",
          condition: "Scale factors $(h_\\rho, h_\\phi, h_\\theta) = (1, \\rho, \\rho\\sin\\phi)$ for $\\rho > 0,\\; \\phi \\in (0, \\pi)$",
        },
        {
          label: "Spherical Curl & Scalar Laplacian",
          latex:
            "\\nabla\\times\\mathbf{F} = \\frac{1}{\\rho^2\\sin\\phi}\\begin{vmatrix} \\hat{\\mathbf{e}}_\\rho & \\rho\\hat{\\mathbf{e}}_\\phi & \\rho\\sin\\phi\\hat{\\mathbf{e}}_\\theta \\\\ \\partial_\\rho & \\partial_\\phi & \\partial_\\theta \\\\ F_\\rho & \\rho F_\\phi & (\\rho\\sin\\phi) F_\\theta \\end{vmatrix}, \\quad \\nabla^2 f = \\frac{1}{\\rho^2}\\frac{\\partial}{\\partial \\rho}\\!\\left(\\rho^2\\frac{\\partial f}{\\partial \\rho}\\right) + \\frac{1}{\\rho^2\\sin\\phi}\\frac{\\partial}{\\partial \\phi}\\!\\left(\\sin\\phi\\frac{\\partial f}{\\partial \\phi}\\right) + \\frac{1}{\\rho^2\\sin^2\\phi}\\frac{\\partial^2 f}{\\partial \\theta^2}",
        },
      ],
    },
    {
      id: "vector-identities",
      title: "2. Fundamental Vector Calculus & Product Identities (C²)",
      accentHex: "#8D9FCE",
      formulas: [
        {
          label: "Exact-Zero Second-Order Identities",
          latex: "\\nabla \\times (\\nabla f) = \\mathbf{0}, \\qquad \\nabla \\cdot (\\nabla \\times \\mathbf{F}) = 0",
          condition: "Holds identically for all $f, \\mathbf{F} \\in C^2$ (follows from equality of mixed partial derivatives)",
        },
        {
          label: "Curl of Curl (Vector Laplacian Identity)",
          latex: "\\nabla \\times (\\nabla \\times \\mathbf{F}) = \\nabla(\\nabla \\cdot \\mathbf{F}) - \\nabla^2 \\mathbf{F}",
          note: "Crucial in deriving electromagnetic wave equations from Maxwell's curl equations.",
        },
        {
          label: "Scalar-Vector Product Rules",
          latex:
            "\\nabla(fg) = f\\nabla g + g\\nabla f, \\qquad \\nabla\\cdot(f\\mathbf{F}) = (\\nabla f)\\cdot\\mathbf{F} + f(\\nabla\\cdot\\mathbf{F}), \\qquad \\nabla\\times(f\\mathbf{F}) = (\\nabla f)\\times\\mathbf{F} + f(\\nabla\\times\\mathbf{F})",
        },
        {
          label: "Cross-Product Divergence Identity",
          latex:
            "\\nabla \\cdot (\\mathbf{F} \\times \\mathbf{G}) = (\\nabla \\times \\mathbf{F}) \\cdot \\mathbf{G} - \\mathbf{F} \\cdot (\\nabla \\times \\mathbf{G})",
        },
      ],
    },
    {
      id: "directional-normals",
      title: "3. Directional Derivatives & Level-Surface Normals",
      accentHex: "#96B898",
      formulas: [
        {
          label: "Directional Derivative Formula",
          latex:
            "D_{\\hat{\\mathbf{u}}} f(P) = \\nabla f(P) \\cdot \\hat{\\mathbf{u}} = \\nabla f(P) \\cdot \\frac{\\mathbf{v}}{\\|\\mathbf{v}\\|} = \\|\\nabla f(P)\\|\\cos\\theta",
          condition: "$f$ differentiable at $P$, direction $\\mathbf{v} \\neq \\mathbf{0}$, and $-\\|\\nabla f(P)\\| \\le D_{\\hat{\\mathbf{u}}}f(P) \\le +\\|\\nabla f(P)\\|$",
        },
        {
          label: "Unit Level-Surface Normal & Tangent Plane",
          latex:
            "\\hat{\\mathbf{n}}(P) = \\frac{\\nabla \\phi(P)}{\\|\\nabla \\phi(P)\\|}, \\qquad \\nabla \\phi(P) \\cdot (\\mathbf{r} - \\mathbf{r}_0) = 0",
          condition: "For level surface $\\phi(x, y, z) = c$ at a non-stationary point $\\nabla\\phi(P) \\neq \\mathbf{0}$",
        },
      ],
    },
    {
      id: "line-integrals",
      title: "4. Line Integrals, Work, Circulation & Conservative Fields",
      accentHex: "#029091",
      formulas: [
        {
          label: "Scalar & Vector Work Line Integrals",
          latex:
            "\\int_C f\\,ds = \\int_a^b f\\bigl(\\mathbf{r}(t)\\bigr)\\|\\mathbf{r}'(t)\\|\\,dt, \\qquad W = \\int_C \\mathbf{F}\\cdot d\\mathbf{r} = \\int_a^b \\mathbf{F}\\bigl(\\mathbf{r}(t)\\bigr)\\cdot\\mathbf{r}'(t)\\,dt",
        },
        {
          label: "Fundamental Theorem for Line Integrals (FTLI)",
          latex:
            "\\mathbf{F} = \\nabla f \\implies \\int_C \\mathbf{F}\\cdot d\\mathbf{r} = f\\bigl(\\mathbf{r}(b)\\bigr) - f\\bigl(\\mathbf{r}(a)\\bigr), \\qquad \\oint_C \\mathbf{F}\\cdot d\\mathbf{r} = 0",
          condition: "On any connected open domain where $\\mathbf{F} = \\nabla f$; closed-loop vanishing holds for all piecewise-$C^1$ loops",
        },
      ],
    },
    {
      id: "surface-integrals-flux",
      title: "5. Surface Integrals & Oriented Vector Flux",
      accentHex: "#AAA36D",
      formulas: [
        {
          label: "Parametric Surface Area & Flux Elements",
          latex:
            "dS = \\|\\mathbf{r}_u \\times \\mathbf{r}_v\\|\\,du\\,dv, \\qquad d\\mathbf{S} = \\hat{\\mathbf{n}}\\,dS = (\\mathbf{r}_u \\times \\mathbf{r}_v)\\,du\\,dv",
        },
        {
          label: "Oriented Flux Across Parametric or Explicit Surface z = g(x, y)",
          latex:
            "\\Phi = \\iint_S \\mathbf{F}\\cdot\\hat{\\mathbf{n}}\\,dS = \\iint_{R_{xy}} \\mathbf{F}\\cdot \\left\\langle -\\frac{\\partial g}{\\partial x},\\; -\\frac{\\partial g}{\\partial y},\\; 1 \\right\\rangle dx\\,dy \\quad (\\text{upward})",
          note: "Reversing $\\hat{\\mathbf{n}} \\mapsto -\\hat{\\mathbf{n}}$ negates the sign of $\\Phi$.",
        },
      ],
    },
    {
      id: "integral-theorems",
      title: "6. The Big Four Integral Theorems & Generalized Stokes Principle",
      accentHex: "#B95869",
      formulas: [
        {
          label: "Green's Theorem (2D Circulation & Outward Flux Forms)",
          latex:
            "\\oint_{\\partial D} (P\\,dx + Q\\,dy) = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)dA, \\qquad \\oint_{\\partial D} \\mathbf{F}\\cdot\\hat{\\mathbf{n}}\\,ds = \\iint_D (\\nabla\\cdot\\mathbf{F})\\,dA",
          condition: "$D$ bounded with positively oriented piecewise-$C^1$ boundary $\\partial D$; $P, Q \\in C^1$ across $D$",
        },
        {
          label: "Stokes' Theorem (3D Cap Curl vs. Boundary Rim)",
          latex:
            "\\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S} = \\oint_{\\partial S} \\mathbf{F} \\cdot d\\mathbf{r}",
          condition: "Orientable piecewise-$C^1$ surface $S$ with induced right-hand-rule boundary $\\partial S$; $\\mathbf{F} \\in C^1$ on an open set containing $S$",
        },
        {
          label: "Gauss's Divergence Theorem (Closed Shell vs. Interior Volume)",
          latex:
            "\\oiint_{\\partial E} \\mathbf{F} \\cdot \\hat{\\mathbf{n}}\\,dS = \\iiint_E (\\nabla \\cdot \\mathbf{F})\\,dV",
          condition: "Simple/bounded 3D solid $E$ with outward-oriented boundary $\\partial E$; $\\mathbf{F} \\in C^1$ throughout $E$",
        },
        {
          label: "Generalized Stokes Theorem (Differential Forms)",
          latex: "\\int_{\\Omega} d\\omega = \\int_{\\partial \\Omega} \\omega",
          note: "Single topological principle unifying 1D FTC, FTLI, Green's, Stokes', and Gauss's Theorems.",
        },
      ],
      table: {
        title: "Dimensional Ladder of Integral Theorems: Boundary vs. Interior Derivative",
        headers: ["Theorem", "Boundary Integral $\\int_{\\partial\\Omega}\\omega$", "Interior Integral $\\int_{\\Omega}d\\omega$", "Microscopic Operator"],
        rows: [
          ["1D FTC", "$f(b) - f(a)$", "$\\int_a^b f'(x)\\,dx$", "$d/dx$"],
          ["Line Integral (FTLI)", "$f(B) - f(A)$", "$\\int_C \\nabla f\\cdot d\\mathbf{r}$", "$\\nabla f$ (gradient)"],
          ["Green's (2D Curl)", "$\\oint_{\\partial D} \\mathbf{F}\\cdot d\\mathbf{r}$", "$\\iint_D (Q_x - P_y)\\,dA$", "$(\\nabla\\times\\mathbf{F})\\cdot\\mathbf{k}$"],
          ["Stokes' (3D Surface)", "$\\oint_{\\partial S} \\mathbf{F}\\cdot d\\mathbf{r}$", "$\\iint_S (\\nabla\\times\\mathbf{F})\\cdot d\\mathbf{S}$", "$\\nabla\\times\\mathbf{F}$ (curl)"],
          ["Gauss Divergence (3D)", "$\\oiint_{\\partial E} \\mathbf{F}\\cdot\\hat{\\mathbf{n}}\\,dS$", "$\\iiint_E (\\nabla\\cdot\\mathbf{F})\\,dV$", "$\\nabla\\cdot\\mathbf{F}$ (div)"],
        ],
      },
    },
  ],
};
