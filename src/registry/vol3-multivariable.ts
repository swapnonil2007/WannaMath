import { VolumeMetadata } from "./types";

export const VOL3_MULTIVARIABLE: VolumeMetadata = {
  id: "vol-3",
  volumeNumber: "III",
  slug: "multivariable-calculus",
  title: "Multivariable & Vector Calculus",
  shortTitle: "Multivariable & Vector",
  accentToken: "--math-var-z",
  accentHex: "#029091",
  description:
    "Spatial geometry of scalar and vector fields in ℝ² and ℝ³: level surfaces, tangent planes, directional gradients, double and triple integration, curvilinear coordinates, Jacobians, and the integral theorems of Green, Stokes, and Gauss.",
  engineeringApplications: [
    "Structural Mechanics, Moments of Inertia & 3D Centroids",
    "Thermodynamics, Heat Flux & Control-Volume Conservation",
    "Maxwell's Equations in Electrodynamics & Field Potentials",
    "Finite Element Master-Element Isoparametric Mapping",
  ],
  modules: [
    {
      id: "mod-3-1",
      slug: "multivariable-differentiation",
      numberLabel: "3.1",
      title: "3D Geometry & Multivariable Differentiation",
      description:
        "Scalar surfaces z = f(x,y), level contour maps, partial derivative cross-sections, tangent planes, directional gradients, and Lagrange multiplier optimization.",
      accentHex: "#8D9FCE",
      chapters: [
        {
          id: "3.1.1",
          slug: "surfaces-level-curves",
          title: "Surfaces, Level Curves & Contour Maps",
          subtitle:
            "Slice 3D surfaces z = f(x,y) with horizontal planes z = c and project contour elevation maps onto the xy-plane.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["1.1.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#8D9FCE",
          keyEquationsLatex: [
            "S = \\{(x,y,z) \\in \\mathbb{R}^3 : z = f(x,y)\\}",
            "C_k = \\{(x,y) \\in \\mathbb{R}^2 : f(x,y) = k\\}",
          ],
          engineeringContext:
            "Topographic terrain modeling, isobaric weather charts, and equipotential electrostatic surfaces.",
          pedagogicalRhythm: {
            question:
              "How can we represent a 3D scalar landscape z = f(x,y) on a flat 2D engineering drawing without losing height and steepness information?",
            labInteraction:
              "Scrub horizontal slicing plane z = k through paraboloids, saddles, and custom surfaces while watching the intersection curve project onto the 2D contour map.",
            symbolicFormalizationLatex:
              "f(x,y) = k \\implies \\nabla f \\cdot d\\mathbf{r} = 0 \\text{ along level curve } C_k",
            edgeCasesAndBridge:
              "Closely packed level curves indicate steep terrain—leading directly to directional rates of change via partial derivatives in Chapter 3.1.2.",
          },
          labs: [
            {
              id: "lab-3-1-1a",
              slug: "surface-contour-slicer",
              title: "3D Surface & 2D Level Curve Contour Synchronizer",
              componentKey: "SurfaceContourSlicerLab",
              summary:
                "Sweep altitude plane z = k and inspect xy, xz, and yz trace curves.",
              formulaLatex: "f(x,y) = k",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "3.1.2",
          slug: "partial-derivatives-tangent-planes",
          title: "Partial Derivatives & Tangent Planes",
          subtitle:
            "Freeze y = y₀ or x = x₀ to slice a 3D surface into 1D curves whose tangent vectors span the local tangent plane.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["1.2.1", "1.2.2", "3.1.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#96B898",
          keyEquationsLatex: [
            "f_x(x_0,y_0) = \\lim_{h\\to 0}\\frac{f(x_0+h,y_0)-f(x_0,y_0)}{h}",
            "z \\approx f(x_0,y_0) + f_x(x_0,y_0)(x-x_0) + f_y(x_0,y_0)(y-y_0)",
          ],
          engineeringContext:
            "Multivariable sensitivity analysis, thermodynamic state partials, and nonlinear control linearization.",
          pedagogicalRhythm: {
            question:
              "When a surface z = f(x,y) depends on two independent variables, how do two 1D coordinate slopes combine to form a flat 2D tangent plane?",
            labInteraction:
              "Move the probe point (x₀, y₀) to inspect the x-slice curve (y fixed) and y-slice curve (x fixed), their tangent vectors T_x = ⟨1, 0, f_x⟩ and T_y = ⟨0, 1, f_y⟩, and the spanned tangent plane.",
            symbolicFormalizationLatex:
              "L(x,y) = f(x_0,y_0) + \\color{#8D9FCE}{f_x(x_0,y_0)}(x-x_0) + \\color{#96B898}{f_y(x_0,y_0)}(y-y_0), \\quad \\mathbf{n} = \\mathbf{T}_x \\times \\mathbf{T}_y = \\langle -f_x, -f_y, 1 \\rangle",
            edgeCasesAndBridge:
              "Coordinate partials only measure slope along the x and y axes—to find the slope in any arbitrary compass direction u, we package ⟨f_x, f_y⟩ into the gradient vector ∇f in Chapter 3.1.3.",
          },
          labs: [
            {
              id: "lab-3-1-2a",
              slug: "partial-tangent-plane-lab",
              title: "Partial Slice Curves & 3D Tangent Plane Linearization Lab",
              componentKey: "PartialDerivativeTangentPlaneLab",
              summary:
                "Inspect tangent vectors T_x = (1, 0, f_x) and T_y = (0, 1, f_y) and their normal n = (-f_x, -f_y, 1).",
              formulaLatex: "dz = \\frac{\\partial f}{\\partial x}dx + \\frac{\\partial f}{\\partial y}dy",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "3.1.3",
          slug: "gradient-directional-derivatives",
          title: "The Gradient Vector & Directional Derivatives",
          subtitle:
            "Rotate a vertical slicing plane in any unit direction u to see why steepest ascent aligns with ∇f and is orthogonal to contours.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["2.1.1", "3.1.2"],
          dimensionBadge: "2D + 3D",
          accentHex: "#D35323",
          keyEquationsLatex: [
            "D_{\\mathbf{u}}f(x,y) = \\nabla f(x,y) \\cdot \\mathbf{u} = \\|\\nabla f\\|\\cos\\theta",
            "\\nabla f = \\left\\langle \\frac{\\partial f}{\\partial x},\\; \\frac{\\partial f}{\\partial y} \\right\\rangle \\perp C_k",
          ],
          engineeringContext:
            "Gradient descent optimization in machine learning, Fourier heat conduction q = -k∇T, and potential fields.",
          pedagogicalRhythm: {
            question:
              "If you stand on a 3D hillside z = f(x,y) and face a compass heading u = ⟨cos α, sin α⟩, what is your instantaneous slope—and which direction is steepest?",
            labInteraction:
              "Rotate the vertical slicing plane through 360° or snap directly to Steepest Ascent (θ = 0°), Level Curve Tangent (θ = 90°), and Steepest Descent (θ = 180°).",
            symbolicFormalizationLatex:
              "D_{\\mathbf{u}}f(x_0,y_0) = \\color{#D35323}{\\nabla f(x_0,y_0)} \\cdot \\color{#8D9FCE}{\\mathbf{u}} = \\|\\nabla f\\|\\cos\\theta \\in [-\\|\\nabla f\\|,\\; +\\|\\nabla f\\|]",
            edgeCasesAndBridge:
              "Because D_u f = 0 along a level curve, ∇f is always perpendicular to level curves—the exact geometric foundation for Lagrange Multipliers in Chapter 3.1.4.",
          },
          labs: [
            {
              id: "lab-3-1-3a",
              slug: "directional-derivative-compass",
              title: "Directional Derivative Slicing Plane & Gradient Compass Lab",
              componentKey: "GradientDirectionalDerivativeLab",
              summary:
                "Rotate unit heading vector u through 360° and compare directional slope D_u f against ∇f.",
              formulaLatex: "D_{\\mathbf{u}}f = \\nabla f \\cdot \\mathbf{u}",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "3.1.4",
          slug: "lagrange-multipliers",
          title: "Lagrange Multipliers & Constrained Optimization",
          subtitle:
            "Walk along a constraint curve g(x,y) = c until its normal ∇g aligns parallel with the objective gradient ∇f = λ∇g.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["3.1.3"],
          dimensionBadge: "2D + 3D",
          accentHex: "#B95869",
          keyEquationsLatex: [
            "\\nabla f(x,y) = \\lambda\\,\\nabla g(x,y), \\qquad g(x,y) = c",
          ],
          engineeringContext:
            "Minimum-weight structural design under stress constraints, portfolio optimization, and maximum entropy.",
          pedagogicalRhythm: {
            question:
              "When our movement is restricted to a constraint path g(x,y) = c, why must the objective contour f(x,y) = k be tangent to the constraint curve at an extremum?",
            labInteraction:
              "Scrub parameter t along the constraint curve or click Snap to Max / Snap to Min to observe ∇f aligning collinearly with the constraint normal ∇g while df/ds = ∇f · T vanishes.",
            symbolicFormalizationLatex:
              "\\frac{df}{ds} = \\nabla f \\cdot \\hat{\\mathbf{T}} = 0 \\iff \\color{#D35323}{\\nabla f(x^*,y^*)} = \\lambda\\,\\color{#8D9FCE}{\\nabla g(x^*,y^*)}",
            edgeCasesAndBridge:
              "Having mastered local differential geometry of surfaces (Module 3.1), Module 3.2 reverses differentiation to accumulate area, volume, and mass across 2D and 3D domains.",
          },
          labs: [
            {
              id: "lab-3-1-4a",
              slug: "lagrange-contour-tangency",
              title: "Constrained Contour Tangency & Gradient Alignment Inspector",
              componentKey: "LagrangeMultipliersLab",
              summary:
                "Scrub along constraint path g(x,y) = c and observe where ∇f × ∇g = 0.",
              formulaLatex: "\\nabla f = \\lambda \\nabla g",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-3-2",
      slug: "integral-calculus",
      numberLabel: "3.2",
      title: "Integral Calculus",
      description:
        "Multiple integrals (double, triple, curvilinear, and Jacobians), improper integral & infinite series convergence tests, and Euler's Gamma and Beta functions.",
      accentHex: "#029091",
      chapters: [
        {
          id: "3.2.1",
          slug: "double-integrals",
          title: "Double Integrals & Fubini's Theorem",
          subtitle:
            "Visualize signed volume under z = f(x,y), Riemann prism convergence, Type I vs. Type II domain slicing, and Fubini's Theorem order reversal.",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["1.3.1", "1.3.2", "3.1.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#8D9FCE",
          engineeringContext:
            "Used across structural mechanics (area moments of inertia, centroids of laminae), hydrostatics (pressure force on submerged plates), and heat flux integration.",
          keyEquationsLatex: [
            "\\iint_{R} f(x,y)\\,dA = \\int_{a}^{b} \\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy\\,dx = \\int_{c}^{d} \\int_{h_1(y)}^{h_2(y)} f(x,y)\\,dx\\,dy",
            "V = \\lim_{\\Delta x, \\Delta y \\to 0} \\sum_{i=1}^{N_x} \\sum_{j=1}^{N_y} f(x_i^*, y_j^*)\\,\\Delta x\\,\\Delta y",
          ],
          pedagogicalRhythm: {
            question:
              "How do we compute the exact signed volume beneath a curved 3D surface z = f(x,y) over a non-rectangular 2D domain R, and why does swapping dy dx ↔ dx dy often transform an impossible integral into a trivial one?",
            labInteraction:
              "Refine the 2D partition (Nx × Ny) to watch 3D Riemann prisms converge, then scrub the cross-sectional slice curtain and toggle between Type I (vertical strips) and Type II (horizontal strips) with custom equations and limits.",
            symbolicFormalizationLatex:
              "\\int_{a}^{b} \\left[\\int_{\\color{#D5658B}{g_1(x)}}^{\\color{#B95869}{g_2(x)}} f(x,y)\\,\\color{#D35323}{dy}\\right]\\color{#8D9FCE}{dx} = \\int_{c}^{d} \\left[\\int_{\\color{#D5658B}{h_1(y)}}^{\\color{#B95869}{h_2(y)}} f(x,y)\\,\\color{#D35323}{dx}\\right]\\color{#96B898}{dy}",
            edgeCasesAndBridge:
              "When a region boundary changes formula mid-domain, one integration order requires splitting into multiple integrals while the reversed order sweeps cleanly in one pass—setting the stage for 3D solids in Chapter 3.2.2.",
          },
          labs: [
            {
              id: "riemann-volume",
              slug: "riemann-volume",
              title: "2D Domain & 3D Riemann Volume Convergence Lab",
              componentKey: "RiemannVolumeLab",
              summary:
                "Interactive subdivision grid (Nx × Ny) showing how rectangular columns over region R in the xy-plane converge to the smooth volume under z = f(x,y).",
              formulaLatex: "\\Delta V_{ij} = f(x_i, y_j)\\,\\Delta x\\,\\Delta y",
              dimensionBadge: "2D + 3D",
            },
            {
              id: "iterated-slicing",
              slug: "iterated-slicing",
              title: "Iterated Integrals, Type I/II Limits & Fubini Order Change Lab",
              componentKey: "IteratedOrderChangeLab",
              summary:
                "Synchronized 2D domain strip and 3D cross-sectional curtain demonstrating dy dx ↔ dx dy order reversal and custom region bounds.",
              formulaLatex:
                "A(x) = \\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy \\implies V = \\int_{a}^{b} A(x)\\,dx",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "3.2.2",
          slug: "triple-integrals",
          title: "Triple Integrals, 6-Order Slicing & Density",
          subtitle:
            "Master 3D bounded solids E, the 3-stage geometric collapse (1D ray → 2D curtain → 3D solid), coordinate wall shadow projections, and all 6 permutations of dx dy dz.",
          status: "published",
          estimatedMinutes: 40,
          prerequisites: ["3.2.1"],
          dimensionBadge: "3D + 2D Shadow",
          accentHex: "#029091",
          engineeringContext:
            "Essential for computing 3D mass distributions with variable density ρ(x,y,z), moments of inertia of rigid bodies, gravitational potentials, and control-volume conservation laws.",
          keyEquationsLatex: [
            "\\iiint_{E} f(x,y,z)\\,dV = \\int_{a}^{b} \\int_{g_1(x)}^{g_2(x)} \\int_{u_1(x,y)}^{u_2(x,y)} f(x,y,z)\\,dz\\,dy\\,dx",
            "M = \\iiint_{E} \\rho(x,y,z)\\,dV, \\qquad \\bar{z} = \\frac{1}{M}\\iiint_{E} z\\,\\rho(x,y,z)\\,dV",
          ],
          pedagogicalRhythm: {
            question:
              "How do we systematically determine the six bounds of a 3D triple integral over a curved solid E without guessing, and how do the 6 permutations of dx dy dz correspond to shadows on the three coordinate walls?",
            labInteraction:
              "Shoot a 1D inner ray between entry/exit surfaces, sweep it into a 2D lamina curtain, project the 3D solid's shadow onto the xy, xz, or yz wall, and inspect 3D voxel density and center of mass.",
            symbolicFormalizationLatex:
              "\\iiint_{E} f\\,dV = \\iint_{\\pi_{xy}(E)} \\left[\\int_{\\color{#D5658B}{u_1(x,y)}}^{\\color{#B95869}{u_2(x,y)}} f(x,y,z)\\,\\color{#029091}{dz}\\right] dA_{xy}",
            edgeCasesAndBridge:
              "Cylindrical and spherical solids produce square-root bounds in Cartesian (x,y,z)—motivating curvilinear coordinate systems in Chapter 3.2.3.",
          },
          labs: [
            {
              id: "three-stage-collapse",
              slug: "three-stage-collapse",
              title: "3-Stage Geometric Collapse, Shadow Projections & 6-Order Explorer",
              componentKey: "TripleIntegralOrderLab",
              summary:
                "Step through Ray → Curtain → Solid, orthographic shadow projections on xy/xz/yz walls, and all 6 integration orders with editable limits.",
              formulaLatex:
                "\\text{Ray } (dz) \\longrightarrow \\text{Curtain } (dy\\,dz) \\longrightarrow \\text{Solid } (dx\\,dy\\,dz)",
              dimensionBadge: "2D + 3D",
            },
            {
              id: "voxel-density",
              slug: "voxel-density",
              title: "3D Voxel Subdivision, Scalar Density ρ(x,y,z) & Center of Mass Lab",
              componentKey: "TripleVoxelDensityLab",
              summary:
                "Subdivide 3D solids into voxels ΔV = Δx Δy Δz, slice horizontally, and compute live mass M and centroid (x̄, ȳ, z̄).",
              formulaLatex: "\\Delta m_{ijk} = \\rho(x_i, y_j, z_k)\\,\\Delta x\\,\\Delta y\\,\\Delta z",
              dimensionBadge: "3D",
            },
          ],
        },
        {
          id: "3.2.3",
          slug: "coordinate-systems",
          title: "Curvilinear Coordinates: Polar, Cylindrical & Spherical",
          subtitle:
            "Explore 2D Cartesian & Polar and 3D Cartesian, Cylindrical (r, θ, z), and Spherical (ρ, φ, θ) coordinate surfaces, local basis vectors, and differential volume elements dV.",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["3.2.1", "3.2.2"],
          dimensionBadge: "2D & 3D",
          accentHex: "#AAA36D",
          engineeringContext:
            "Crucial for electromagnetics (spherical/cylindrical symmetry in Gauss's & Ampère's laws), pipe flow fluid mechanics, antenna radiation patterns, and orbital mechanics.",
          keyEquationsLatex: [
            "dV = dx\\,dy\\,dz = r\\,dr\\,d\\theta\\,dz = \\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta",
            "(x,y,z) = (\\rho\\sin\\phi\\cos\\theta,\\; \\rho\\sin\\phi\\sin\\theta,\\; \\rho\\cos\\phi)",
          ],
          pedagogicalRhythm: {
            question:
              "Why does a polar area wedge require an extra factor of r (dA = r dr dθ) and a spherical volume box require ρ² sin φ (dV = ρ² sin φ dρ dφ dθ)?",
            labInteraction:
              "Inspect the 2D polar wedge magnifier, toggle the 3 intersecting orthogonal coordinate surfaces in 3D, and zoom the camera directly onto the 3D curvilinear volume element dV.",
            symbolicFormalizationLatex:
              "dV_{\\text{cyl}} = (dr)(r\\,d\\theta)(dz), \\qquad dV_{\\text{sph}} = (d\\rho)(\\rho\\,d\\phi)(\\rho\\sin\\phi\\,d\\theta)",
            edgeCasesAndBridge:
              "Orthogonal scale factors h₁ h₂ h₃ are a special case of a universal distortion law for arbitrary coordinate mappings—the Jacobian determinant in Chapter 3.2.4.",
          },
          labs: [
            {
              id: "2d-polar-cartesian",
              slug: "2d-polar-cartesian",
              title: "2D Cartesian (x, y) vs. Polar (r, θ) & Area Element dA Lab",
              componentKey: "PolarCoordinateAreaLab",
              summary:
                "Interactive point locator, rotating polar basis vectors, polar wedge magnifier dA = r dr dθ, and custom polar double integral evaluator.",
              formulaLatex: "dA = dx\\,dy = r\\,dr\\,d\\theta",
              dimensionBadge: "2D",
            },
            {
              id: "3d-coordinate-surfaces",
              slug: "3d-coordinate-surfaces",
              title: "3D Intersecting Coordinate Surfaces, Basis Triads & dV Magnifier",
              componentKey: "Curvilinear3DSurfacesAndElementLab",
              summary:
                "Toggle planes, cylinders, cones, and spheres in 3D, zoom into the dV wedge, and evaluate custom 3D curvilinear integrals.",
              formulaLatex:
                "dV = h_1 h_2 h_3\\,dq_1\\,dq_2\\,dq_3 = \\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta",
              dimensionBadge: "3D",
            },
          ],
        },
        {
          id: "3.2.4",
          slug: "jacobians",
          title: "The Jacobian & Change of Variables Pullback",
          subtitle:
            "Understand the Jacobian matrix and determinant |det J| as the local area/volume distortion factor via continuous (u,v) → (x,y) grid morphing and tangent parallelograms.",
          status: "published",
          estimatedMinutes: 40,
          prerequisites: ["2.2.2", "3.1.2", "3.2.1", "3.2.3"],
          dimensionBadge: "Dual 2D & 3D",
          accentHex: "#D35323",
          engineeringContext:
            "Foundation of Finite Element Analysis (isoparametric master element mapping), continuum mechanics deformation gradient tensor F, robotic kinematics, and coordinate transformations.",
          keyEquationsLatex: [
            "\\iint_{R_{xy}} f(x,y)\\,dx\\,dy = \\iint_{R_{uv}} f(x(u,v), y(u,v))\\,\\left|\\frac{\\partial(x,y)}{\\partial(u,v)}\\right|\\,du\\,dv",
            "J = \\frac{\\partial(x,y)}{\\partial(u,v)} = \\begin{vmatrix} \\dfrac{\\partial x}{\\partial u} & \\dfrac{\\partial x}{\\partial v} \\\\[8pt] \\dfrac{\\partial y}{\\partial u} & \\dfrac{\\partial y}{\\partial v} \\end{vmatrix} = \\frac{\\partial x}{\\partial u}\\frac{\\partial y}{\\partial v} - \\frac{\\partial x}{\\partial v}\\frac{\\partial y}{\\partial u}",
          ],
          pedagogicalRhythm: {
            question:
              "When we deform a complicated physical domain R_xy back into a clean rectangle R_uv in parameter space, how much does each infinitesimal grid square stretch, compress, or twist?",
            labInteraction:
              "Animate the homotopy slider t ∈ [0,1] from (u,v) to (x,y), click anywhere in parameter space to compare the tangent parallelogram r_u Δu × r_v Δv against the true curved patch, and solve domain pullback integrals.",
            symbolicFormalizationLatex:
              "\\Delta A_{xy} \\approx \\|\\mathbf{r}_u \\times \\mathbf{r}_v\\|\\,\\Delta u\\,\\Delta v = \\left|\\det J(u,v)\\right|\\,\\Delta u\\,\\Delta v",
            edgeCasesAndBridge:
              "Where det J = 0, the coordinate mapping folds or collapses dimension and loses local invertibility—bridging to parametric surfaces and vector flux integrals in Module 3.3.",
          },
          labs: [
            {
              id: "dual-grid-morphing",
              slug: "dual-grid-morphing",
              title: "Dual-Space (u, v) ↔ (x, y) Homotopy Morphing & Tangent Parallelogram Lab",
              componentKey: "DualGridMorphingAndTangentLab",
              summary:
                "Side-by-side parameter and physical space viewports with continuous homotopy slider t ∈ [0,1] and tangent vector parallelogram inspector.",
              formulaLatex:
                "\\Delta A_{xy} \\approx \\|\\mathbf{r}_u \\times \\mathbf{r}_v\\|\\,\\Delta u\\,\\Delta v = |\\det J|\\,\\Delta u\\,\\Delta v",
              dimensionBadge: "Dual 2D",
            },
            {
              id: "jacobian-matrix-explorer",
              slug: "jacobian-matrix-explorer",
              title: "Integral Domain Pullback Solver & 2D/3D Jacobian Matrix Explorer",
              componentKey: "JacobianIntegralPullbackLab",
              summary:
                "Pull slanted or curved physical regions back to parameter space, color-code cells by |det J|, and inspect 3×3 3D Jacobians.",
              formulaLatex:
                "\\left|\\frac{\\partial(x,y,z)}{\\partial(\\rho,\\phi,\\theta)}\\right| = \\rho^2\\sin\\phi",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "3.2.5",
          slug: "convergence-and-divergence",
          title: "Convergence & Divergence (Improper Integrals & Series Tests)",
          subtitle:
            "Master Type I (infinite-tail) and Type II (singular) improper integrals alongside interactive visual tutorials for p-tests, Comparison, Limit Comparison, Integral, Ratio, Root, and Alternating Series tests.",
          status: "published",
          estimatedMinutes: 45,
          prerequisites: ["1.3.1", "1.4.1", "3.2.1"],
          dimensionBadge: "2D",
          accentHex: "#D5658B",
          engineeringContext:
            "Laplace/Fourier transform existence abscissas, Gaussian probability tail normalization, control stability margins, and infinite-horizon impulse energy bounds.",
          keyEquationsLatex: [
            "\\int_{a}^{\\infty} f(x)\\,dx = \\lim_{T \\to \\infty} \\int_{a}^{T} f(x)\\,dx, \\qquad \\int_{1}^{\\infty} \\frac{dx}{x^p} \\text{ converges } \\iff p > 1",
            "\\sum_{n=1}^{\\infty} a_n \\text{ vs. } \\int_1^\\infty f(x)\\,dx, \\quad L = \\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right|, \\quad R = \\lim_{n\\to\\infty}\\sqrt[n]{|a_n|}",
          ],
          pedagogicalRhythm: {
            question:
              "How can an infinitely long region (x → ∞) or an infinitely tall vertical spike enclose a finite area—and which systematic convergence test settles any integral or infinite series?",
            labInteraction:
              "Scrub upper tail bound T → ∞ (or singularity gap ε → 0⁺) with Comparison envelopes g(x), then step through all 7 interactive convergence test tutorials with live partial-sum plots and counterexamples.",
            symbolicFormalizationLatex:
              "\\begin{aligned} &0 \\le f(x) \\le g(x),\\; \\int_a^\\infty g < \\infty \\implies \\int_a^\\infty f < \\infty \\\\ &\\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right| = L \\;\\begin{cases} < 1 & \\text{abs. convergent} \\\\ > 1 & \\text{divergent} \\\\ = 1 & \\text{inconclusive} \\end{cases} \\end{aligned}",
            edgeCasesAndBridge:
              "Harmonic decay (1/x, ∑1/n) sits directly on the divergence knife-edge (p = 1) even though terms vanish! Exponentially damped power integrals x^(z-1) e^(-x) converge for all z > 0—defining Euler's Gamma Function in Chapter 3.2.6.",
          },
          labs: [
            {
              id: "improper-integral-tail",
              slug: "improper-integral-tail",
              title: "Improper Integrals (Type I Tail & Type II Singularity) & Comparison Envelope Lab",
              componentKey: "ImproperIntegralConvergenceLab",
              summary:
                "Scrub tail cutoff T or singularity gap ε across p-integrals, Gaussian/Laplace decays, and custom integrands with Direct Comparison envelopes.",
              formulaLatex: "I(T) = \\int_a^T f(x)\\,dx \\xrightarrow{T\\to\\infty} L",
              dimensionBadge: "2D",
            },
            {
              id: "convergence-test-tutorials",
              slug: "convergence-test-tutorials",
              title: "Convergence Test Tutorials & Visual Comparator (Integral, Comparison, Ratio, Root, Alternating)",
              componentKey: "ConvergenceTestsTutorialLab",
              summary:
                "Step-by-step interactive tutorials, worked proofs, decision rules, and live sequence/partial-sum plots for every convergence test.",
              formulaLatex: "S_N = \\sum_{n=1}^{N} a_n \\quad\\text{vs.}\quad \\int_1^N f(x)\\,dx",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "3.2.6",
          slug: "gamma-and-beta-functions",
          title: "Gamma & Beta Functions (Eulerian Integrals)",
          subtitle:
            "Extend factorial n! smoothly to real numbers via Γ(z) = ∫₀^∞ t^(z-1) e^(-t) dt, prove Γ(1/2) = √π, and unify B(p,q) with Γ(p)Γ(q)/Γ(p+q) via polar coordinates.",
          status: "published",
          estimatedMinutes: 40,
          prerequisites: ["3.2.3", "3.2.5"],
          dimensionBadge: "2D + 3D",
          accentHex: "#FBEAA4",
          engineeringContext:
            "Probability & statistics (Gamma, Chi-squared, Student-t, and Beta Bayesian priors), fractional calculus, asymptotic Stirling expansions, and quantum statistical partition integrals.",
          keyEquationsLatex: [
            "\\Gamma(z) = \\int_{0}^{\\infty} t^{z-1} e^{-t}\\,dt \\quad (z > 0), \\qquad \\Gamma(z+1) = z\\,\\Gamma(z), \\qquad \\Gamma\\!\\left(\\tfrac{1}{2}\\right) = \\sqrt{\\pi}",
            "\\mathrm{B}(p,q) = \\int_{0}^{1} t^{p-1}(1-t)^{q-1}\\,dt = 2\\int_{0}^{\\pi/2} \\sin^{2p-1}\\theta\\cos^{2q-1}\\theta\\,d\\theta = \\frac{\\Gamma(p)\\Gamma(q)}{\\Gamma(p+q)}",
          ],
          pedagogicalRhythm: {
            question:
              "How can we continuously interpolate the discrete factorial n! across fractional and negative values—and how do tricky trigonometric integrals like ∫₀^(π/2) sin⁵θ cos⁴θ dθ evaluate in seconds without repeated parts?",
            labInteraction:
              "Scrub parameter z to reshape the Gamma kernel t^(z-1)e^(-t) and trace poles across the Γ(x) curve, then adjust (p,q) to inspect the algebraic & trigonometric Beta curves alongside the 3D polar-coordinate proof.",
            symbolicFormalizationLatex:
              "\\Gamma(p)\\Gamma(q) = 4\\int_0^\\infty\\int_0^\\infty x^{2p-1}y^{2q-1}e^{-(x^2+y^2)}\\,dx\\,dy = \\left(2\\int_0^\\infty r^{2(p+q)-1}e^{-r^2}\\,dr\\right)\\left(2\\int_0^{\\pi/2}\\cos^{2p-1}\\theta\\sin^{2q-1}\\theta\\,d\\theta\\right) = \\Gamma(p+q)\\mathrm{B}(p,q)",
            edgeCasesAndBridge:
              "Γ(z) has simple poles at zero and negative integers z = 0, -1, -2, ... where Γ(z)Γ(1-z) = π/sin(πz) blows up—tying improper convergence directly to the Complex Plane & Residue Calculus in Volume V.",
          },
          labs: [
            {
              id: "gamma-function-lab",
              slug: "gamma-function-lab",
              title: "Euler's Gamma Function Γ(z), Integration-by-Parts Ladder & Analytic Poles Lab",
              componentKey: "GammaFunctionLab",
              summary:
                "Explore the integrand peak t^(z-1)e^(-t), recurrence Γ(z+1) = z Γ(z), Gaussian half-integer Γ(1/2) = √π, and simple poles at z ≤ 0.",
              formulaLatex: "\\Gamma(z+1) = z\\,\\Gamma(z)",
              dimensionBadge: "2D",
            },
            {
              id: "beta-function-lab",
              slug: "beta-function-lab",
              title: "Beta Function B(p,q), Trigonometric Form & 3D Polar Γ-B Unification Lab",
              componentKey: "BetaFunctionLab",
              summary:
                "Compare algebraic Beta distributions on [0,1], trigonometric Wallis integrals on [0, π/2], and the 3D polar transformation proving B(p,q) = Γ(p)Γ(q)/Γ(p+q).",
              formulaLatex: "\\mathrm{B}(p,q) = \\frac{\\Gamma(p)\\Gamma(q)}{\\Gamma(p+q)}",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-3-3",
      slug: "vector-calculus",
      numberLabel: "3.3",
      title: "Vector Calculus & Integral Theorems",
      description:
        "2D and 3D vector fields, divergence, curl, work and circulation line integrals, oriented surface flux, and the unification of Green's, Stokes', and Gauss's Theorems.",
      accentHex: "#D35323",
      chapters: [
        {
          id: "3.3.1",
          slug: "vector-fields-divergence-curl",
          title: "Vector Fields, Divergence & Curl",
          subtitle:
            "Place a microscopic flux box and paddlewheel probe inside 2D/3D velocity fields to measure local expansion (∇·F) and rotation (∇×F).",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["3.1.3"],
          dimensionBadge: "2D + 3D",
          accentHex: "#029091",
          keyEquationsLatex: [
            "\\operatorname{div}\\mathbf{F} = \\nabla \\cdot \\mathbf{F} = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}",
            "\\operatorname{curl}\\mathbf{F} = \\nabla \\times \\mathbf{F}",
          ],
          engineeringContext:
            "Incompressible fluid continuity (∇·u = 0), aerodynamic vorticity, and electromagnetic charge/current sources.",
          pedagogicalRhythm: {
            question:
              "At a single point inside a 3D velocity or force field, how do we separately measure whether flow is expanding outward (source) versus spinning locally (vortex)?",
            labInteraction:
              "Click anywhere on the 2D cross-section plane or scrub (x₀, y₀, z₀) to move the divergence flux box and curl paddlewheel probe across sources, vortices, and shear flows.",
            symbolicFormalizationLatex:
              "\\nabla\\cdot\\mathbf{F} = \\frac{\\partial P}{\\partial x}+\\frac{\\partial Q}{\\partial y}+\\frac{\\partial R}{\\partial z}, \\qquad (\\nabla\\times\\mathbf{F})_z = \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}",
            edgeCasesAndBridge:
              "A straight shear flow F = ⟨y, 0, 0⟩ has zero divergence yet non-zero curl! Next, Chapter 3.3.2 accumulates F along a macroscopic curve C to compute mechanical work.",
          },
          labs: [
            {
              id: "lab-3-3-1a",
              slug: "div-curl-paddlewheel-probe",
              title: "Interactive Divergence Flux Box & Curl Paddlewheel Probe",
              componentKey: "DivCurlProbeLab",
              summary:
                "Drag a probe across sources, sinks, shears, and vortices to measure net outflow and angular velocity.",
              formulaLatex: "\\nabla \\cdot \\mathbf{F}, \\qquad \\nabla \\times \\mathbf{F}",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "3.3.2",
          slug: "line-integrals-work",
          title: "Line Integrals (Work & Circulation)",
          subtitle:
            "Project vector field F onto unit tangent T along curve C to accumulate mechanical work ∫_C F · dr and test path independence.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["3.1.3", "3.3.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#8D9FCE",
          keyEquationsLatex: [
            "W = \\int_{C} \\mathbf{F}\\cdot d\\mathbf{r} = \\int_{a}^{b} \\mathbf{F}(\\mathbf{r}(t))\\cdot \\mathbf{r}'(t)\\,dt",
            "\\mathbf{F} = \\nabla f \\implies \\int_A^B \\mathbf{F}\\cdot d\\mathbf{r} = f(B) - f(A)",
          ],
          engineeringContext:
            "Mechanical work in conservative gravitational/electrostatic fields vs. dissipative aerodynamic drag and vortex circulation.",
          pedagogicalRhythm: {
            question:
              "When a particle travels along a curved path C through a force field F, when does the total work depend on the chosen path versus only the endpoints A and B?",
            labInteraction:
              "Deform path C₁ relative to the straight chord C₀ and compare W(C₁) against W(C₀) in conservative gradient fields (∇×F = 0) versus rotational fields.",
            symbolicFormalizationLatex:
              "\\int_C \\mathbf{F}\\cdot d\\mathbf{r} = \\int_a^b \\mathbf{F}(\\mathbf{r}(t))\\cdot\\mathbf{r}'(t)\\,dt",
            edgeCasesAndBridge:
              "When C closes into a loop ∂D, the net circulation equals the interior curl summed over D—which is Green's Theorem in Chapter 3.3.3.",
          },
          labs: [
            {
              id: "lab-3-3-2a",
              slug: "line-integral-work-path",
              title: "Tangential Work Accumulator & Conservative Field Path Explorer",
              componentKey: "LineIntegralWorkLab",
              summary:
                "Deform path C between endpoints A and B in conservative vs. non-conservative fields.",
              formulaLatex: "\\int_C \\mathbf{F}\\cdot \\hat{\\mathbf{T}}\\,ds",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "3.3.3",
          slug: "greens-theorem",
          title: "Green's Theorem",
          subtitle:
            "Subdivide a 2D region D into N×N interior circulation loops to watch adjacent interior edges cancel, leaving only boundary circulation.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["3.2.1", "3.3.1", "3.3.2"],
          dimensionBadge: "2D",
          accentHex: "#96B898",
          keyEquationsLatex: [
            "\\oint_{\\partial D} (P\\,dx + Q\\,dy) = \\iint_{D} \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right) dA",
          ],
          engineeringContext:
            "Mechanical planimeters, aerodynamic lift circulation, and 2D finite-volume conservation laws.",
          pedagogicalRhythm: {
            question:
              "Why does summing microscopic spin (∂Q/∂x - ∂P/∂y) over the entire 2D interior D equal the single 1D line integral around the outer boundary ∂D?",
            labInteraction:
              "Increase the N×N subdivision resolution and verify numerically that the 4-edge boundary line integral matches the 2D double integral of curl.",
            symbolicFormalizationLatex:
              "\\oint_{\\partial D} (P\\,dx + Q\\,dy) = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right) dA",
            edgeCasesAndBridge:
              "Green's Theorem lives in the flat xy-plane; to generalize flux and circulation to curved 3D surfaces, we first build oriented surface flux integrals in Chapter 3.3.4.",
          },
          labs: [
            {
              id: "lab-3-3-3a",
              slug: "greens-cancellation-grid",
              title: "Microscopic Curl Cancellation Grid & Boundary Circulation Lab",
              componentKey: "GreensTheoremLab",
              summary:
                "Increase subdivision N to see internal counter-directed edges cancel on screen.",
              formulaLatex: "\\oint_{\\partial D} \\mathbf{F}\\cdot d\\mathbf{r} = \\iint_D (\\nabla \\times \\mathbf{F})_z\\,dA",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "3.3.4",
          slug: "surface-integrals-flux",
          title: "Surface Integrals & Flux",
          subtitle:
            "Map parameter patch (u,v) onto 3D surface S with normal vector r_u × r_v to measure volumetric fluid and electric flux.",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["3.2.4", "3.3.1"],
          dimensionBadge: "3D",
          accentHex: "#029091",
          keyEquationsLatex: [
            "\\Phi = \\iint_{S} \\mathbf{F}\\cdot \\hat{\\mathbf{n}}\\,dS = \\iint_{R_{uv}} \\mathbf{F}\\cdot (\\mathbf{r}_u \\times \\mathbf{r}_v)\\,du\\,dv",
          ],
          engineeringContext:
            "Volumetric mass flow rate across turbine blades, Gauss's law for electric flux, and radiative heat transfer.",
          pedagogicalRhythm: {
            question:
              "How do we compute the total volumetric flow piercing a curved 3D canopy S when both the flow F and the surface normal n̂ vary from point to point?",
            labInteraction:
              "Edit surface height z = g(x,y) and field F = ⟨P, Q, R⟩, inspect local normal vectors n̂ vs. flow arrows F, and flip surface orientation to observe Φ → -Φ.",
            symbolicFormalizationLatex:
              "\\Phi = \\iint_S \\mathbf{F}\\cdot \\hat{\\mathbf{n}}\\,dS = \\iint_{R_{xy}} \\mathbf{F}\\cdot \\langle -g_x, -g_y, 1 \\rangle\\,dx\\,dy",
            edgeCasesAndBridge:
              "Non-orientable surfaces (like a Möbius strip) cannot support a consistent global normal n̂. For orientable surfaces, Chapter 3.3.5 unifies flux and curl via Stokes' and Gauss's Theorems.",
          },
          labs: [
            {
              id: "lab-3-3-4a",
              slug: "surface-flux-canopy",
              title: "3D Oriented Surface Normal & Vector Flux Inspector",
              componentKey: "SurfaceFluxLab",
              summary:
                "Inspect local normal patches dS = (r_u × r_v) du dv inside 3D vector fields.",
              formulaLatex: "d\\mathbf{S} = (\\mathbf{r}_u \\times \\mathbf{r}_v)\\,du\\,dv",
              dimensionBadge: "3D",
            },
          ],
        },
        {
          id: "3.3.5",
          slug: "stokes-divergence-theorems",
          title: "Stokes' Theorem & The Divergence Theorem",
          subtitle:
            "Unify all integral theorems: see why surface curl flux depends only on the boundary rim ∂S and why closed-surface flux equals interior divergence.",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["3.2.2", "3.3.3", "3.3.4"],
          dimensionBadge: "3D",
          accentHex: "#D35323",
          keyEquationsLatex: [
            "\\iint_{S} (\\nabla \\times \\mathbf{F})\\cdot d\\mathbf{S} = \\oint_{\\partial S} \\mathbf{F}\\cdot d\\mathbf{r}",
            "\\oiint_{\\partial E} \\mathbf{F}\\cdot d\\mathbf{S} = \\iiint_{E} (\\nabla \\cdot \\mathbf{F})\\,dV",
          ],
          engineeringContext:
            "Maxwell's equations in integral/differential form, control-volume CFD conservation, and topological invariance.",
          pedagogicalRhythm: {
            question:
              "Why do two completely different 3D soap-film surfaces sharing the same wire boundary rim ∂S capture the exact same curl flux, and why does closed-surface flux equal interior divergence?",
            labInteraction:
              "Deform the 3D soap-film dome height H in Stokes' mode to verify invariant curl flux, then switch to Gauss's Control Volume to compare 6-face outward flux against 3D volume divergence.",
            symbolicFormalizationLatex:
              "\\int_{\\partial \\Omega} \\omega = \\int_{\\Omega} d\\omega",
            edgeCasesAndBridge:
              "This completes Volume III (Multivariable & Vector Calculus)! The generalized Stokes' Theorem carries directly into contour integration and Cauchy's Theorem in Volume V.",
          },
          labs: [
            {
              id: "lab-3-3-5a",
              slug: "stokes-gauss-unification",
              title: "3D Stokes' Rim-Surface Deformer & Gauss Divergence Control Volume Lab",
              componentKey: "StokesDivergenceLab",
              summary:
                "Deform a 3D soap-film surface sharing the same boundary rim C and verify invariant curl flux.",
              formulaLatex: "\\int_{\\partial \\Omega} \\omega = \\int_{\\Omega} d\\omega",
              dimensionBadge: "3D",
            },
          ],
        },
      ],
    },
  ],
};
