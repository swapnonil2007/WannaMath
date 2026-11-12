export type TopicStatus = "available" | "phase-ready" | "planned";

export interface MathSubtopic {
  id: string;
  title: string;
  description: string;
  formulaLatex: string;
  dimensionBadge: "2D" | "3D" | "2D + 3D";
}

export interface MathTopic {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  route: string;
  domainId: string;
  phaseNumber: number;
  status: TopicStatus;
  accentHex: string;
  secondaryHex: string;
  highlightHex: string;
  dimensionBadge: "2D + 3D" | "3D + 2D Shadow" | "2D & 3D" | "Dual 2D & 3D";
  summary: string;
  engineeringContext: string;
  keyFormulaLatex: string;
  secondaryFormulaLatex: string;
  subtopics: MathSubtopic[];
  prerequisites: string[];
  relatedTopicIds: string[];
}

export interface MathDomain {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  route: string;
  status: "active" | "upcoming";
  accentHex: string;
  description: string;
  engineeringApplications: string[];
  topics: MathTopic[];
  upcomingTopicsPreview?: {
    title: string;
    formulaLatex: string;
    summary: string;
  }[];
}

export const SEMANTIC_MATH_PALETTE = [
  {
    token: "--math-var-x",
    name: "Periwinkle Slate",
    hex: "#8D9FCE",
    triad: "Triad 1",
    symbol: "x, u, \\text{Outer}",
    meaning: "Primary x-axis, first integration variable, Type I vertical slice direction, and primary surface mesh.",
  },
  {
    token: "--math-var-y",
    name: "Muted Sage Green",
    hex: "#96B898",
    triad: "Triad 2",
    symbol: "y, v, \\text{Middle}",
    meaning: "Primary y-axis, second integration variable, Type II horizontal slice direction, and (u,v) parameter space.",
  },
  {
    token: "--math-var-z",
    name: "Deep Cyan Teal",
    hex: "#029091",
    triad: "Triad 3",
    symbol: "z, \\rho, \\text{Inner}",
    meaning: "Primary z-axis, third integration variable, 3D interior volume fill, and vertical integration ray.",
  },
  {
    token: "--math-bound-upper",
    name: "Terracotta Crimson",
    hex: "#B95869",
    triad: "Triad 1",
    symbol: "g_2(x), u_2(x,y)",
    meaning: "Upper / exit boundary curve on domain graphs and color-linked upper limit on integral signs.",
  },
  {
    token: "--math-bound-lower",
    name: "Dusty Rose Pink",
    hex: "#D5658B",
    triad: "Triad 3",
    symbol: "g_1(x), \\theta, \\phi",
    meaning: "Lower / entry boundary curve on domain graphs and angular sweeps in polar/spherical coordinates.",
  },
  {
    token: "--math-active-sweep",
    name: "Persimmon Vermilion",
    hex: "#D35323",
    triad: "Triad 2",
    symbol: "A(x), \\det(J)",
    meaning: "Active cross-sectional sweep plane, Jacobian determinant scaling vector, and order-swap indicator.",
  },
  {
    token: "--math-diff-element",
    name: "Warm Buttermilk Cream",
    hex: "#FBEAA4",
    triad: "Triad 1 / 2",
    symbol: "dA, dV",
    meaning: "Infinitesimal area patch (dx dy, r dr dθ) and differential volume element (dV) highlight.",
  },
  {
    token: "--math-grid-accent",
    name: "Warm Olive & Ochre",
    hex: "#AAA36D",
    triad: "Triad 4",
    symbol: "\\mathbf{r}_u, \\mathbf{r}_v, \\hat{\\mathbf{e}}_i",
    meaning: "Coordinate grid cages, reference planes, tangent vectors, and local orthonormal basis triads.",
  },
] as const;

export const MULTIVARIABLE_CALCULUS_TOPICS: MathTopic[] = [
  {
    id: "double-integrals",
    number: "01",
    title: "Double Integration & Order Change",
    shortTitle: "Double Integration",
    route: "/calculus/double-integrals",
    domainId: "calculus",
    phaseNumber: 2,
    status: "phase-ready",
    accentHex: "#8D9FCE",
    secondaryHex: "#B95869",
    highlightHex: "#FBEAA4",
    dimensionBadge: "2D + 3D",
    summary:
      "Visualize signed volume under z = f(x,y), Riemann prism convergence, Type I vs. Type II domain slicing, and Fubini's Theorem order reversal.",
    engineeringContext:
      "Used across structural mechanics (area moments of inertia, centroids of laminae), hydrostatics (pressure force on submerged plates), and heat flux integration.",
    keyFormulaLatex:
      "\\iint_{R} f(x,y)\\,dA = \\int_{a}^{b} \\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy\\,dx = \\int_{c}^{d} \\int_{h_1(y)}^{h_2(y)} f(x,y)\\,dx\\,dy",
    secondaryFormulaLatex:
      "V = \\lim_{\\Delta x, \\Delta y \\to 0} \\sum_{i=1}^{N_x} \\sum_{j=1}^{N_y} f(x_i^*, y_j^*)\\,\\Delta x\\,\\Delta y",
    prerequisites: ["Single-Variable Definite Integrals", "2D Functions & Level Curves"],
    relatedTopicIds: ["triple-integrals", "coordinate-systems", "jacobians"],
    subtopics: [
      {
        id: "riemann-volume",
        title: "2D Domain & 3D Riemann Volume Convergence",
        description:
          "Interactive subdivision grid (Nx × Ny) showing how rectangular columns over region R in the xy-plane converge to the smooth volume under z = f(x,y).",
        formulaLatex: "\\Delta V_{ij} = f(x_i, y_j)\\,\\Delta x\\,\\Delta y",
        dimensionBadge: "2D + 3D",
      },
      {
        id: "iterated-slicing",
        title: "Iterated Integrals & Cross-Sectional Sweeping",
        description:
          "Synchronized 2D domain strip and 3D glowing cross-sectional curtain showing how inner integration computes slice area A(x) or A(y) and outer integration accumulates volume.",
        formulaLatex: "A(x) = \\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy \\implies V = \\int_{a}^{b} A(x)\\,dx",
        dimensionBadge: "2D + 3D",
      },
      {
        id: "limits-of-integration",
        title: "Type I (Vertical Strip) vs. Type II (Horizontal Strip) Limits",
        description:
          "Color-linked boundary curves matching the lower entry curve and upper exit curve in the xy-plane directly to the limits on the integral symbols.",
        formulaLatex: "R_I = \\{(x,y) : a \\le x \\le b,\\; g_1(x) \\le y \\le g_2(x)\\}",
        dimensionBadge: "2D",
      },
      {
        id: "order-change",
        title: "Order Change of Integration Laboratory (Fubini's Theorem)",
        description:
          "Interactive dy dx ↔ dx dy swap for triangular, parabolic, and non-elementary integrals (like exp(y²)), animating strip rotation and algebraic bound inversion.",
        formulaLatex: "\\int_{0}^{1} \\int_{x}^{1} e^{y^2}\\,dy\\,dx \\;\\longleftrightarrow\\; \\int_{0}^{1} \\int_{0}^{y} e^{y^2}\\,dx\\,dy",
        dimensionBadge: "2D + 3D",
      },
    ],
  },
  {
    id: "triple-integrals",
    number: "02",
    title: "Triple Integration & 6-Order Projections",
    shortTitle: "Triple Integration",
    route: "/calculus/triple-integrals",
    domainId: "calculus",
    phaseNumber: 3,
    status: "phase-ready",
    accentHex: "#029091",
    secondaryHex: "#96B898",
    highlightHex: "#D35323",
    dimensionBadge: "3D + 2D Shadow",
    summary:
      "Master 3D bounded solids E, the 3-stage geometric collapse (1D ray → 2D curtain → 3D solid), coordinate wall shadow projections, and all 6 permutations of dx dy dz.",
    engineeringContext:
      "Essential for computing 3D mass distributions with variable density ρ(x,y,z), moments of inertia of rigid bodies, gravitational potentials, and control-volume conservation laws.",
    keyFormulaLatex:
      "\\iiint_{E} f(x,y,z)\\,dV = \\int_{a}^{b} \\int_{g_1(x)}^{g_2(x)} \\int_{u_1(x,y)}^{u_2(x,y)} f(x,y,z)\\,dz\\,dy\\,dx",
    secondaryFormulaLatex:
      "M = \\iiint_{E} \\rho(x,y,z)\\,dV, \\qquad \\bar{z} = \\frac{1}{M}\\iiint_{E} z\\,\\rho(x,y,z)\\,dV",
    prerequisites: ["Double Integration", "3D Surfaces & Cylinders"],
    relatedTopicIds: ["double-integrals", "coordinate-systems", "jacobians"],
    subtopics: [
      {
        id: "three-stage-collapse",
        title: "The 3-Stage Geometric Collapse (Ray → Curtain → Solid)",
        description:
          "Step-by-step interactive scrubber showing how the innermost integral traces a 1D pillar between two surfaces, the middle integral sweeps a 2D lamina, and the outer integral fills the 3D volume.",
        formulaLatex: "\\text{Ray } (dz) \\longrightarrow \\text{Curtain } (dy\\,dz) \\longrightarrow \\text{Solid } (dx\\,dy\\,dz)",
        dimensionBadge: "3D",
      },
      {
        id: "shadow-projection",
        title: "2D Shadow Projection onto Coordinate Walls (xy, yz, xz)",
        description:
          "Orthographic shadow projection of the 3D solid E onto the chosen coordinate plane, synchronized with a dedicated 2D domain widget to determine the middle and outer limits.",
        formulaLatex: "\\pi_{xy}(E) = D_{xy}, \\quad \\pi_{yz}(E) = D_{yz}, \\quad \\pi_{xz}(E) = D_{xz}",
        dimensionBadge: "2D + 3D",
      },
      {
        id: "six-orders-of-integration",
        title: "All 6 Orders of Integration Permutation Explorer",
        description:
          "Switch dynamically among dz dy dx, dz dx dy, dy dz dx, dy dx dz, dx dz dy, and dx dy dz on tetrahedra, paraboloid caps, and intersecting cylinders.",
        formulaLatex: "\\{dz\\,dy\\,dx,\\; dz\\,dx\\,dy,\\; dy\\,dz\\,dx,\\; dy\\,dx\\,dz,\\; dx\\,dz\\,dy,\\; dx\\,dy\\,dz\\}",
        dimensionBadge: "2D + 3D",
      },
    ],
  },
  {
    id: "coordinate-systems",
    number: "03",
    title: "Coordinate Systems Interactive Laboratory",
    shortTitle: "Coordinate Systems",
    route: "/calculus/coordinate-systems",
    domainId: "calculus",
    phaseNumber: 4,
    status: "phase-ready",
    accentHex: "#AAA36D",
    secondaryHex: "#D5658B",
    highlightHex: "#029091",
    dimensionBadge: "2D & 3D",
    summary:
      "Explore 2D Cartesian & Polar and 3D Cartesian, Cylindrical (r, θ, z), and Spherical (ρ, φ, θ) coordinate surfaces, local basis vectors, and differential volume elements dV.",
    engineeringContext:
      "Crucial for electromagnetics (spherical/cylindrical symmetry in Gauss's & Ampère's laws), pipe flow fluid mechanics, antenna radiation patterns, and orbital mechanics.",
    keyFormulaLatex:
      "dV = dx\\,dy\\,dz = r\\,dr\\,d\\theta\\,dz = \\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta",
    secondaryFormulaLatex:
      "(x,y,z) = (\\rho\\sin\\phi\\cos\\theta,\\; \\rho\\sin\\phi\\sin\\theta,\\; \\rho\\cos\\phi)",
    prerequisites: ["Trigonometry", "3D Vectors"],
    relatedTopicIds: ["double-integrals", "triple-integrals", "jacobians"],
    subtopics: [
      {
        id: "2d-polar-cartesian",
        title: "2D Cartesian (x, y) vs. Polar (r, θ) & Area Element dA",
        description:
          "Interactive point locator and polar sector magnifier demonstrating geometrically why an infinitesimal polar wedge has side lengths dr and r dθ, yielding dA = r dr dθ.",
        formulaLatex: "dA = dx\\,dy = r\\,dr\\,d\\theta",
        dimensionBadge: "2D",
      },
      {
        id: "3d-coordinate-surfaces",
        title: "3D Intersecting Coordinate Surfaces (Planes, Cylinders, Cones, Spheres)",
        description:
          "Toggle the three orthogonal coordinate surfaces whose intersection locates point P in Cartesian (x,y,z), Cylindrical (r,θ,z), and Spherical (ρ,φ,θ) space.",
        formulaLatex: "r = \\sqrt{x^2+y^2}, \\quad \\rho = \\sqrt{x^2+y^2+z^2}, \\quad \\cos\\phi = \\frac{z}{\\rho}",
        dimensionBadge: "3D",
      },
      {
        id: "dv-volume-element",
        title: "3D Differential Volume Element (dV) Magnifier & Basis Triads",
        description:
          "Zoomable 3D inspection stage labeling every edge of the infinitesimal volume box (dr, r dθ, dz and dρ, ρ dφ, ρ sin φ dθ) alongside rotating local unit basis vectors.",
        formulaLatex: "dV_{\\text{cyl}} = (dr)(r\\,d\\theta)(dz), \\qquad dV_{\\text{sph}} = (d\\rho)(\\rho\\,d\\phi)(\\rho\\sin\\phi\\,d\\theta)",
        dimensionBadge: "3D",
      },
    ],
  },
  {
    id: "jacobians",
    number: "04",
    title: "Jacobians & Change of Variables",
    shortTitle: "Jacobians",
    route: "/calculus/jacobians",
    domainId: "calculus",
    phaseNumber: 5,
    status: "phase-ready",
    accentHex: "#D35323",
    secondaryHex: "#96B898",
    highlightHex: "#FBEAA4",
    dimensionBadge: "Dual 2D & 3D",
    summary:
      "Understand the Jacobian matrix and determinant |det J| as the local area/volume distortion factor via continuous (u,v) → (x,y) grid morphing and tangent parallelograms.",
    engineeringContext:
      "Foundation of Finite Element Analysis (isoparametric master element mapping), continuum mechanics deformation gradient tensor F, robotic kinematics, and coordinate transformations.",
    keyFormulaLatex:
      "\\iint_{R_{xy}} f(x,y)\\,dx\\,dy = \\iint_{R_{uv}} f(x(u,v), y(u,v))\\,\\left|\\frac{\\partial(x,y)}{\\partial(u,v)}\\right|\\,du\\,dv",
    secondaryFormulaLatex:
      "J = \\frac{\\partial(x,y)}{\\partial(u,v)} = \\begin{vmatrix} \\dfrac{\\partial x}{\\partial u} & \\dfrac{\\partial x}{\\partial v} \\\\[8pt] \\dfrac{\\partial y}{\\partial u} & \\dfrac{\\partial y}{\\partial v} \\end{vmatrix} = \\frac{\\partial x}{\\partial u}\\frac{\\partial y}{\\partial v} - \\frac{\\partial x}{\\partial v}\\frac{\\partial y}{\\partial u}",
    prerequisites: ["Partial Derivatives", "Matrix Determinants", "Double Integration"],
    relatedTopicIds: ["double-integrals", "triple-integrals", "coordinate-systems"],
    subtopics: [
      {
        id: "dual-grid-morphing",
        title: "Dual-Space (u, v) ↔ (x, y) Transformation & Continuous Grid Morphing",
        description:
          "Side-by-side parameter space and physical space viewports with a continuous homotopy slider t ∈ [0,1] deforming a uniform (u,v) grid into a curved (x,y) coordinate net.",
        formulaLatex: "T(u,v) = \\big(x(u,v),\\; y(u,v)\\big)",
        dimensionBadge: "2D",
      },
      {
        id: "tangent-parallelogram",
        title: "Local Linearization & Tangent Vectors (ru Δu × rv Δv)",
        description:
          "Drag an infinitesimal patch across (u,v) space to inspect how partial derivative vectors span a tangent parallelogram with area |det J| Δu Δv.",
        formulaLatex: "\\Delta A_{xy} \\approx \\|\\mathbf{r}_u \\times \\mathbf{r}_v\\|\\,\\Delta u\\,\\Delta v = \\left|\\det J(u,v)\\right|\\,\\Delta u\\,\\Delta v",
        dimensionBadge: "2D",
      },
      {
        id: "jacobian-matrix-explorer",
        title: "2D & 3D Jacobian Matrix Explorer & Integral Domain Pullback",
        description:
          "Interactive symbolic + numerical Jacobian matrix for linear, polar, elliptical, and spherical mappings, showing how slanted or curved domains pull back to simple rectangles.",
        formulaLatex: "\\left|\\frac{\\partial(x,y,z)}{\\partial(\\rho,\\phi,\\theta)}\\right| = \\rho^2\\sin\\phi",
        dimensionBadge: "2D + 3D",
      },
    ],
  },
];

export const CURRICULUM_DOMAINS: MathDomain[] = [
  {
    id: "calculus",
    code: "MATH-01",
    title: "Multivariable & Integral Calculus",
    shortTitle: "Multivariable Calculus",
    route: "/calculus",
    status: "active",
    accentHex: "#8D9FCE",
    description:
      "Geometric foundations of higher-dimensional integration: Riemann volumes, iterated slicing, Fubini's Theorem order reversal, curvilinear coordinate systems, and Jacobian transformations.",
    engineeringApplications: [
      "Structural Mechanics & Moments of Inertia",
      "Thermodynamics & Heat Flux",
      "Electromagnetic Field Integration",
      "Finite Element Master-Element Mapping",
    ],
    topics: MULTIVARIABLE_CALCULUS_TOPICS,
  },
  {
    id: "vector-calculus",
    code: "MATH-02",
    title: "Vector Fields & Integral Theorems",
    shortTitle: "Vector Calculus",
    route: "/roadmap#vector-calculus",
    status: "upcoming",
    accentHex: "#029091",
    description:
      "Visualizing scalar and vector fields, gradient, divergence, curl, line and surface flux integrals, and the unification of Green's, Stokes', and Gauss's Divergence Theorems.",
    engineeringApplications: [
      "Maxwell's Equations in Electrodynamics",
      "Conservation Laws in Continuum Physics",
      "Aerodynamic Circulation & Lift",
    ],
    topics: [],
    upcomingTopicsPreview: [
      {
        title: "Gradient, Divergence & Curl in 2D/3D Fields",
        formulaLatex: "\\nabla f,\\quad \\nabla \\cdot \\mathbf{F},\\quad \\nabla \\times \\mathbf{F}",
        summary: "Interactive paddlewheel and flux-box probes inside live 2D and 3D vector fields.",
      },
      {
        title: "Line & Surface Flux Integrals",
        formulaLatex: "\\int_C \\mathbf{F}\\cdot d\\mathbf{r},\\qquad \\iint_S \\mathbf{F}\\cdot \\hat{\\mathbf{n}}\\,dS",
        summary: "Work along space curves and normal flux through oriented parametric surfaces.",
      },
      {
        title: "Green's, Stokes' & Gauss's Divergence Theorems",
        formulaLatex: "\\iiint_E (\\nabla\\cdot\\mathbf{F})\\,dV = \\oiint_{\\partial E} \\mathbf{F}\\cdot d\\mathbf{S}",
        summary: "Visualizing microscopic boundary cancellation and macroscopic flux conservation.",
      },
    ],
  },
  {
    id: "linear-algebra",
    code: "MATH-03",
    title: "Linear Algebra & Matrix Geometry",
    shortTitle: "Linear Algebra",
    route: "/roadmap#linear-algebra",
    status: "upcoming",
    accentHex: "#96B898",
    description:
      "Matrices as geometric linear transformations of space: basis changes, determinants as volume scaling, eigenvectors as invariant axes, and Singular Value Decomposition (SVD).",
    engineeringApplications: [
      "Principal Component Analysis (PCA) & Data Compression",
      "Robotic Manipulator Kinematics",
      "Modal Vibration Analysis of Structures",
    ],
    topics: [],
    upcomingTopicsPreview: [
      {
        title: "Linear Transformations & The Four Fundamental Subspaces",
        formulaLatex: "A\\mathbf{x} = \\mathbf{b},\\quad \\mathcal{C}(A) \\perp \\mathcal{N}(A^T)",
        summary: "Watch matrices shear, rotate, and project 2D and 3D coordinate grids.",
      },
      {
        title: "Eigenvalues, Eigenvectors & Diagonalization",
        formulaLatex: "A\\mathbf{v} = \\lambda\\mathbf{v},\\quad A = PDP^{-1}",
        summary: "Discover invariant directions under matrix transformations and coupled ODE trajectories.",
      },
      {
        title: "Singular Value Decomposition (SVD)",
        formulaLatex: "A = U\\Sigma V^T",
        summary: "Decompose any matrix into a rotation, axis-aligned scaling, and second rotation.",
      },
    ],
  },
  {
    id: "fluid-dynamics",
    code: "MATH-04",
    title: "Fluid Dynamics & Transport Phenomena",
    shortTitle: "Fluid Dynamics",
    route: "/roadmap#fluid-dynamics",
    status: "upcoming",
    accentHex: "#D35323",
    description:
      "Bridging vector calculus and continuum mechanics: Eulerian vs. Lagrangian descriptions, streamlines, vorticity, Cauchy stress tensors, and the Navier-Stokes equations.",
    engineeringApplications: [
      "Computational Fluid Dynamics (CFD)",
      "Aerospace Wing & Airfoil Potential Flow",
      "Pipe Networks & Boundary Layer Analysis",
    ],
    topics: [],
    upcomingTopicsPreview: [
      {
        title: "Streamlines, Pathlines, Streaklines & Material Derivative",
        formulaLatex: "\\frac{D\\mathbf{u}}{Dt} = \\frac{\\partial \\mathbf{u}}{\\partial t} + (\\mathbf{u}\\cdot\\nabla)\\mathbf{u}",
        summary: "Particle advection tracers demonstrating convective acceleration in unsteady flows.",
      },
      {
        title: "Potential Flow Superposition (Sources, Sinks, Doublets & Vortices)",
        formulaLatex: "\\nabla^2 \\phi = 0,\\quad \\nabla^2 \\psi = 0",
        summary: "Interactive airfoil and cylinder flow builder using harmonic stream functions.",
      },
      {
        title: "Navier-Stokes Intuition & Vorticity Transport",
        formulaLatex: "\\rho\\frac{D\\mathbf{u}}{Dt} = -\\nabla p + \\mu\\nabla^2\\mathbf{u} + \\mathbf{f}",
        summary: "Term-by-term visual breakdown of pressure gradient, viscous diffusion, and advection.",
      },
    ],
  },
];

export function getTopicById(id: string): MathTopic | undefined {
  return MULTIVARIABLE_CALCULUS_TOPICS.find((t) => t.id === id);
}

export function getAdjacentTopics(id: string): {
  prev: MathTopic | null;
  next: MathTopic | null;
} {
  const index = MULTIVARIABLE_CALCULUS_TOPICS.findIndex((t) => t.id === id);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? MULTIVARIABLE_CALCULUS_TOPICS[index - 1] : null,
    next:
      index < MULTIVARIABLE_CALCULUS_TOPICS.length - 1
        ? MULTIVARIABLE_CALCULUS_TOPICS[index + 1]
        : null,
  };
}
