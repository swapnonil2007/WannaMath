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
      slug: "differential-calculus",
      numberLabel: "3.1",
      title: "Differential Calculus",
      description:
        "Surfaces, multivariable limits & total differentiability, Taylor expansions, partial derivatives & chain rule, homogeneous functions & Euler's theorems, maxima/minima, Lagrange multipliers, and the nested Differential Equations parent unit.",
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
          title: "Partial Derivatives, Mixed Partials, Chain Rule & Tangent Planes",
          subtitle:
            "Slice surfaces into 1D partial curves, verify Clairaut's Theorem f_xy = f_yx, trace multivariable chain rule trees, and solve implicit surface tangents.",
          status: "published",
          estimatedMinutes: 40,
          prerequisites: ["1.2.1", "1.2.2", "3.1.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#96B898",
          keyEquationsLatex: [
            "f_x(x_0,y_0) = \\lim_{h\\to 0}\\frac{f(x_0+h,y_0)-f(x_0,y_0)}{h}, \\qquad f_{xy} = f_{yx}\\;(C^2)",
            "\\frac{dz}{dt} = \\frac{\\partial z}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial z}{\\partial y}\\frac{dy}{dt}, \\qquad \\frac{\\partial z}{\\partial x} = -\\frac{F_x}{F_z}",
          ],
          engineeringContext:
            "Multivariable sensitivity analysis, thermodynamic Maxwell relations (Clairaut symmetry), kinematic chain rule rates, and implicit constraint manifolds.",
          pedagogicalRhythm: {
            question:
              "When a surface z = f(x,y) depends on two independent variables, how do first-order partials build a tangent plane—and how do second-order partials, chain rule pathways, and implicit equations generalize differentiation?",
            labInteraction:
              "Inspect the x-slice, y-slice, and spanned tangent plane in Lab 3.1.2A, then explore mixed-partial Clairaut symmetry (plus Peano's counterexample), chain rule dependency trees, and implicit ellipsoid slopes in Lab 3.1.2B.",
            symbolicFormalizationLatex:
              "L(x,y) = f(x_0,y_0) + \\color{#8D9FCE}{f_x}(x-x_0) + \\color{#96B898}{f_y}(y-y_0), \\quad \\frac{dz}{dt} = \\nabla f \\cdot \\mathbf{r}'(t)",
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
            {
              id: "lab-3-1-2b",
              slug: "higher-order-chain-implicit-lab",
              title: "Higher-Order Mixed Partials, Chain Rule & Implicit Differentiation Lab",
              componentKey: "HigherOrderChainImplicitLab",
              summary:
                "Test Clairaut symmetry f_xy = f_yx (and its failure), compute live Chain Rule trees, and probe implicit slopes -F_x/F_z.",
              formulaLatex: "f_{xy} = f_{yx}, \\; \\frac{\\partial z}{\\partial x} = -\\frac{F_x}{F_z}",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "3.1.3",
          slug: "gradient-directional-derivatives",
          title: "The Gradient Vector & Directional Derivatives",
          subtitle:
            "Rotate a vertical slicing plane in any unit direction u, trace gradient ascent/descent curves orthogonal to contours, and inspect 3D level-surface normals ∇F.",
          status: "published",
          estimatedMinutes: 40,
          prerequisites: ["2.1.1", "3.1.2"],
          dimensionBadge: "2D + 3D",
          accentHex: "#D35323",
          keyEquationsLatex: [
            "D_{\\mathbf{u}}f(x,y) = \\nabla f(x,y) \\cdot \\mathbf{u} = \\|\\nabla f\\|\\cos\\theta",
            "\\nabla f = \\left\\langle \\frac{\\partial f}{\\partial x},\\; \\frac{\\partial f}{\\partial y} \\right\\rangle \\perp C_k, \\qquad \\nabla F(x_0,y_0,z_0) \\perp S_c",
          ],
          engineeringContext:
            "Gradient descent optimization in machine learning, Fourier heat conduction q = -k∇T, electrostatic fields E = -∇V, and surface normals in CAD/ray-tracing.",
          pedagogicalRhythm: {
            question:
              "If you stand on a 3D hillside z = f(x,y) or inside a 3D potential field F(x,y,z) and move along unit heading u, what is your instantaneous rate of change—and why do steepest paths always cut level curves at 90°?",
            labInteraction:
              "Rotate the vertical slicing plane through 360°, trace continuous RK4 gradient flow vs. discrete step-size η optimization on contour maps, and tilt 3D heading vectors against a 3D level-surface normal ∇F.",
            symbolicFormalizationLatex:
              "df = \\nabla f \\cdot d\\mathbf{r} \\implies D_{\\mathbf{u}}f = \\color{#D35323}{\\nabla f} \\cdot \\color{#8D9FCE}{\\mathbf{u}} = \\|\\nabla f\\|\\cos\\theta \\in [-\\|\\nabla f\\|,\\; +\\|\\nabla f\\|]",
            edgeCasesAndBridge:
              "Because D_u f = 0 along a level curve or surface, ∇f is strictly perpendicular to contours—powering Lagrange Multipliers (Ch. 3.1.4) and Conservative Vector Fields F = ∇φ (Ch. 3.3.1).",
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
            {
              id: "lab-3-1-3b",
              slug: "gradient-flow-level-surface-normal",
              title: "Gradient Flow, Polar Slope Rose & 3D Level Surface Normal Lab",
              componentKey: "GradientAscentAndLevelSurfaceLab",
              summary:
                "Trace steepest ascent/descent trajectories crossing contours orthogonally, test discrete step size η stability, and inspect 3D surface normals ∇F.",
              formulaLatex: "\\mathbf{r}'(t) = \\pm\\nabla f(\\mathbf{r}(t)), \\qquad \\nabla F \\cdot d\\mathbf{r} = 0",
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
        {
          id: "3.1.5",
          slug: "limits-and-differentiability",
          title: "Multivariable Limits, Continuity & Differentiability",
          subtitle:
            "Test limits across lines y = mx, parabolas y = kx², and polar coordinates, and distinguish partial derivative existence from true total differentiability.",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["1.1.1", "3.1.1", "3.1.2"],
          dimensionBadge: "2D + 3D",
          accentHex: "#8D9FCE",
          keyEquationsLatex: [
            "\\lim_{(x,y)\\to(a,b)} f(x,y) = L \\iff \\forall \\varepsilon>0,\\,\\exists\\delta>0 : 0<\\|(x,y)-(a,b)\\|<\\delta \\implies |f-L|<\\varepsilon",
            "\\lim_{(h,k)\\to(0,0)} \\frac{\\bigl|f(x_0+h,y_0+k) - \\bigl(f(x_0,y_0)+f_x h + f_y k\\bigr)\\bigr|}{\\sqrt{h^2+k^2}} = 0",
          ],
          engineeringContext:
            "Shock fronts, stress concentration corners, and justifying smooth linearization models in control and continuum mechanics.",
          pedagogicalRhythm: {
            question:
              "Why can a function approach zero along every straight line through the origin—or even possess both partial derivatives—yet fail to have a genuine limit or tangent plane?",
            labInteraction:
              "Test linear rays y = m x, parabolic paths y = k x², and polar squeezes r → 0 in Lab 3.1.5A, then measure the normalized linearization error ratio |f - L|/r across every angle θ in Lab 3.1.5B.",
            symbolicFormalizationLatex:
              "C^1 \\implies \\text{Totally Differentiable} \\implies \\text{Continuous} \\;\\text{AND}\\; \\exists f_x, f_y \\;(\\text{Converse fails!})",
            edgeCasesAndBridge:
              "Once a function is smooth (Cᵏ), we can go beyond the first-order tangent plane by building higher-degree Taylor polynomial approximations in Chapter 3.1.6.",
          },
          labs: [
            {
              id: "lab-3-1-5a",
              slug: "multivariable-limits-paths",
              title: "Path-Dependent Limits & Polar Squeeze Laboratory",
              componentKey: "MultivariableLimitsPathsLab",
              summary:
                "Sweep rays y = mx, parabolas y = kx², and polar δ-disks approaching (0, 0).",
              formulaLatex: "y = kx^2 \\;\\text{vs.}\\; r \\to 0",
              dimensionBadge: "2D + 3D",
            },
            {
              id: "lab-3-1-5b",
              slug: "differentiability-error-cone",
              title: "Total Differentiability & Normalized Error Cone Inspector",
              componentKey: "DifferentiabilityErrorConeLab",
              summary:
                "Compare smooth surfaces against sharp cones and √|xy| creases where partials exist yet differentiability fails.",
              formulaLatex: "\\frac{|E(h,k)|}{\\sqrt{h^2+k^2}} \\to 0",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "3.1.6",
          slug: "taylor-expansions",
          title: "Taylor Expansions: Single-Variable & Multivariable",
          subtitle:
            "Osculating 1D Taylor polynomials T_n(x), Lagrange remainder bounds, and 2D quadratic Hessian expansions T₂(x,y) around (x₀, y₀).",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["3.1.2", "3.1.5"],
          dimensionBadge: "2D + 3D",
          accentHex: "#FBEAA4",
          keyEquationsLatex: [
            "T_n(x) = \\sum_{k=0}^n \\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k",
            "T_2(x,y) = f(\\mathbf{p}_0) + \\nabla f(\\mathbf{p}_0)\\cdot\\mathbf{h} + \\frac{1}{2}\\mathbf{h}^T \\mathbf{H}_f(\\mathbf{p}_0)\\mathbf{h}",
          ],
          engineeringContext:
            "Small-angle nonlinear pendulum linearization, finite-difference truncation error orders, and quadratic optimization trust regions.",
          pedagogicalRhythm: {
            question:
              "How do higher-order derivatives let a simple polynomial match not just a function's height and slope, but also its 1D and 2D curvature around an operating point?",
            labInteraction:
              "Vary degree n and center x₀ in Lab 3.1.6A to see the Lagrange remainder |R_n(x)| shrink inside the convergence disk, then compare T₁ tangent planes against quadratic Hessian bowls T₂(x,y) in Lab 3.1.6B.",
            symbolicFormalizationLatex:
              "T_2(\\mathbf{p}_0 + \\mathbf{h}) = f(\\mathbf{p}_0) + \\color{#8D9FCE}{\\nabla f \\cdot \\mathbf{h}} + \\frac{1}{2}\\color{#D35323}{\\mathbf{h}^T \\mathbf{H}_f \\mathbf{h}}",
            edgeCasesAndBridge:
              "Near singularities or poles (such as 1/(1-x) at x = 1), Taylor series diverge outside the distance to the nearest singularity; meanwhile the quadratic Hessian form 1/2 h^T H h directly powers the Second Derivative Test in Chapter 3.1.8.",
          },
          labs: [
            {
              id: "lab-3-1-6a",
              slug: "single-variable-taylor-lab",
              title: "Single-Variable Taylor Polynomial & Remainder Band Lab",
              componentKey: "SingleVariableTaylorLab",
              summary: "Adjust degree n and center x₀ to watch osculating convergence.",
              formulaLatex: "T_n(x) + R_n(x)",
              dimensionBadge: "2D",
            },
            {
              id: "lab-3-1-6b",
              slug: "multivariable-taylor-hessian-lab",
              title: "Multivariable 2D Taylor & Quadratic Hessian Surface Lab",
              componentKey: "MultivariableTaylorHessianLab",
              summary: "Overlay T₁ tangent plane and T₂ quadratic paraboloid onto z = f(x,y).",
              formulaLatex: "T_2(x_0+h, y_0+k)",
              dimensionBadge: "3D",
            },
          ],
        },
        {
          id: "3.1.7",
          slug: "homogeneous-functions-eulers-theorem",
          title: "Homogeneous Functions & Euler's Theorems",
          subtitle:
            "Radial scaling invariance f(tx, ty) = tⁿf(x, y), 1st-order Euler theorem xf_x + yf_y = nf, and 2nd-order identity x²f_xx + 2xyf_xy + y²f_yy = n(n-1)f.",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["3.1.2"],
          dimensionBadge: "2D + 3D",
          accentHex: "#029091",
          keyEquationsLatex: [
            "x\\frac{\\partial f}{\\partial x} + y\\frac{\\partial f}{\\partial y} = n f(x,y)",
            "x^2 f_{xx} + 2xy f_{xy} + y^2 f_{yy} = n(n-1)f(x,y)",
          ],
          engineeringContext:
            "Constant returns to scale in production functions, Buckingham Pi dimensional scaling, and Euler's equation of isotropic elasticity.",
          pedagogicalRhythm: {
            question:
              "If scaling every coordinate radially by a factor t scales output by tⁿ, what universal partial differential equation must all such surfaces satisfy—both at 1st and 2nd order?",
            labInteraction:
              "Slide scale factor t along rays in Lab 3.1.7A to verify f(tx, ty) = tⁿf(x,y) and xf_x + yf_y = nf, then test 2nd-order Euler identities and disguised inverse-trig homogeneous forms in Lab 3.1.7B.",
            symbolicFormalizationLatex:
              "\\color{#8D9FCE}{x}\\frac{\\partial f}{\\partial x} + \\color{#96B898}{y}\\frac{\\partial f}{\\partial y} = nf \\implies \\color{#D35323}{x^2 f_{xx} + 2xy f_{xy} + y^2 f_{yy}} = n(n-1)f",
            edgeCasesAndBridge:
              "Even when u = g⁻¹(fₙ) looks non-homogeneous (such as arcsin or arctan quotients), applying Euler's Theorem to g(u) unlocks x u_x + y u_y = n g(u)/g'(u) = φ(u) and 2nd-order deduction φ(u)[φ'(u)-1].",
          },
          labs: [
            {
              id: "lab-3-1-7a",
              slug: "homogeneous-scaling-ray-lab",
              title: "Radial Scaling f(tx, ty) = tⁿf(x,y) & 1st-Order Euler Lab",
              componentKey: "HomogeneousScalingRayLab",
              summary: "Scale points radially along rays and verify xf_x + yf_y = nf.",
              formulaLatex: "xf_x + yf_y = nf",
              dimensionBadge: "2D + 3D",
            },
            {
              id: "lab-3-1-7b",
              slug: "eulers-theorem-second-order-lab",
              title: "2nd-Order Euler Identity & Composite Homogeneous Deductions",
              componentKey: "EulersTheoremSecondOrderLab",
              summary: "Inspect x²f_xx + 2xyf_xy + y²f_yy = n(n-1)f and inverse-trig cases.",
              formulaLatex: "x^2f_{xx}+2xyf_{xy}+y^2f_{yy}=n(n-1)f",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "3.1.8",
          slug: "maxima-minima-extrema",
          title: "Maxima & Minima: General Method & Second Derivative Test",
          subtitle:
            "Classify critical points via the Hessian discriminant D = rt - s² = f_xx f_yy - f_xy² and resolve D = 0 degeneracies using Δf sign-change analysis.",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["3.1.4", "3.1.6"],
          dimensionBadge: "2D + 3D",
          accentHex: "#B95869",
          keyEquationsLatex: [
            "D = r t - s^2 = f_{xx}f_{yy} - f_{xy}^2",
            "\\Delta f(h,k) = f(x_0+h,y_0+k) - f(x_0,y_0)",
          ],
          engineeringContext:
            "Structural potential energy stability equilibria, least-squares regression convexity, and multi-well landscape optimization.",
          pedagogicalRhythm: {
            question:
              "Once ∇f = 0 locates a stationary plateau, how does second-order curvature D = rt - s² classify bowls vs. saddles—and what happens when D = 0 renders the Hessian test inconclusive?",
            labInteraction:
              "Inspect Hessian eigenvalues and discriminant D = rt - s² on multi-critical surfaces in Lab 3.1.8A, then probe rays and parabolic curves y = kx² when D = 0 (including Peano's counterexample) in Lab 3.1.8B.",
            symbolicFormalizationLatex:
              "D = \\det(\\mathbf{H}_f) = rt - s^2 > 0 \\;\\text{with}\\; r>0 \\implies \\text{Local Min}; \\quad D=0 \\implies \\text{Inspect } \\Delta f(h,k)",
            edgeCasesAndBridge:
              "While Module 3.1 Chapters 3.1.1–3.1.8 explore scalar landscapes in Rⁿ, real engineering states evolve dynamically in time—leading directly into the nested Differential Equations parent starting in Chapter 3.1.9.",
          },
          labs: [
            {
              id: "lab-3-1-8a",
              slug: "hessian-second-derivative-test",
              title: "3D Critical Point Classifier & Hessian Eigen-Curvature Lab",
              componentKey: "HessianSecondDerivativeTestLab",
              summary: "Inspect local minima, maxima, saddles, and principal curvatures.",
              formulaLatex: "rt - s^2 > 0",
              dimensionBadge: "2D + 3D",
            },
            {
              id: "lab-3-1-8b",
              slug: "general-method-degenerate-extrema",
              title: "General Sign-Change Method for D = 0 & Peano's Saddle",
              componentKey: "GeneralMethodDegenerateExtremaLab",
              summary: "Probe rays & parabolas when D = 0 leaves the second derivative test inconclusive.",
              formulaLatex: "(y-x^2)(y-2x^2)",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "3.1.9",
          slug: "first-order-lde-bernoulli",
          title: "First-Order ODEs: LDE, Integrating Factors & Bernoulli's Equation",
          subtitle:
            "Solve linear first-order differential equations y' + P(x)y = Q(x) via μ(x) = e^{∫P dx} and linearize Bernoulli equations via v = y^{1-n}.",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["3.1.2", "3.2.1"],
          dimensionBadge: "Dual 2D",
          accentHex: "#D35323",
          subParent: {
            slug: "differential-equations",
            title: "Differential Equations",
            badge: "ODE Sub-Parent",
          },
          keyEquationsLatex: [
            "y' + P(x)y = Q(x) \\implies \\mu(x) = e^{\\int P(x)\\,dx}",
            "y' + P(x)y = Q(x)y^n \\xrightarrow{v=y^{1-n}} v' + (1-n)P(x)v = (1-n)Q(x)",
          ],
          engineeringContext:
            "RC/RL transient electrical circuits, Newton thermal cooling, brine tank mixing, and nonlinear logistic saturation dynamics.",
          pedagogicalRhythm: {
            question:
              "Why does multiplying a non-exact linear equation y' + P(x)y = Q(x) by the integrating factor μ(x) = e^{∫P dx} collapse its left-hand side into a single product derivative—and how does Bernoulli's substitution pull nonlinear flows into the same straight framework?",
            labInteraction:
              "Click to launch initial conditions across slope fields and integrating factor curves in Lab 3.1.9A, then compare nonlinear Bernoulli trajectories side-by-side against their linearized (x, v) flows in Lab 3.1.9B.",
            symbolicFormalizationLatex:
              "\\frac{d}{dx}\\!\\left[\\color{#FBEAA4}{\\mu(x)}\\,y\\right] = \\color{#FBEAA4}{\\mu(x)}Q(x) \\implies y(x) = \\frac{1}{\\mu(x)}\\!\\left(\\int \\mu(x)Q(x)\\,dx + C\\right)",
            edgeCasesAndBridge:
              "Watch out for division-by-zero coefficient singularities P(x) = 2/x splitting domains at x = 0 and trivial equilibrium loss y = 0 when n > 0; next, Chapter 3.1.10 scales linearity up to 2nd- and higher-order ODEs via the Wronskian.",
          },
          labs: [
            {
              id: "lab-3-1-9a",
              slug: "linear-ode-integrating-factor",
              title: "Linear ODE Slope Field & Integrating Factor μ(x) Lab",
              componentKey: "LinearOdeIntegratingFactorLab",
              summary: "Trace integral curves and inspect exactness under μ(x).",
              formulaLatex: "(\\mu y)' = \\mu Q",
              dimensionBadge: "2D",
            },
            {
              id: "lab-3-1-9b",
              slug: "bernoulli-reduction-lab",
              title: "Bernoulli Nonlinear-to-Linear Substitution v = y^{1-n} Lab",
              componentKey: "BernoulliReductionLab",
              summary: "Compare curved (x, y) Bernoulli slopes beside straightened (x, v) LDE slopes.",
              formulaLatex: "v = y^{1-n}",
              dimensionBadge: "Dual 2D",
            },
          ],
        },
        {
          id: "3.1.10",
          slug: "linear-odes-wronskian-roots",
          title: "Linear ODEs: Linear Independence, Wronskian & Root Regimes",
          subtitle:
            "Measure linear independence via the Wronskian area W(y₁, y₂) and construct general and particular solutions for distinct, repeated, and complex characteristic roots.",
          status: "published",
          estimatedMinutes: 40,
          prerequisites: ["3.1.9"],
          dimensionBadge: "2D",
          accentHex: "#96B898",
          subParent: {
            slug: "differential-equations",
            title: "Differential Equations",
            badge: "ODE Sub-Parent",
          },
          keyEquationsLatex: [
            "W(y_1, y_2)(x) = \\begin{vmatrix} y_1 & y_2 \\\\ y_1' & y_2' \\end{vmatrix} = W(x_0)e^{-\\int \\frac{b}{a}dx}",
            "y_c(x) = C_1 e^{r_1 x} + C_2 e^{r_2 x} \\;\\big|\\; (C_1 + C_2 x)e^{rx} \\;\\big|\\; e^{\\alpha x}(C_1\\cos\\beta x + C_2\\sin\\beta x)",
          ],
          engineeringContext:
            "Mechanical spring-mass-damper suspension tuning (overdamped, critically damped, underdamped), RLC circuit resonance, and structural vibration poles.",
          pedagogicalRhythm: {
            question:
              "When do two solutions y₁ and y₂ truly span the entire 2D solution space of a second-order ODE—and why does a repeated root r₁ = r₂ force an extra factor of x into the second basis function?",
            labInteraction:
              "Animate the sliding probe x₀ in Lab 3.1.10A to watch the Wronskian determinant trace out signed phase-plane parallelogram area, then scrub a, b, c and toggle the repeated-root limit morph in Lab 3.1.10B.",
            symbolicFormalizationLatex:
              "a r^2 + b r + c = 0 \\implies \\begin{cases} \\Delta > 0: & C_1 e^{r_1 x} + C_2 e^{r_2 x} \\\\ \\Delta = 0: & (C_1 + C_2 x)e^{rx} \\\\ \\Delta < 0: & e^{\\alpha x}(C_1\\cos\\beta x + C_2\\sin\\beta x) \\end{cases}",
            edgeCasesAndBridge:
              "At a repeated root Δ = 0, naive e^{rx} gives W ≡ 0 unless scaled by reduction of order via the limit (e^{(r+ε)x} - e^{rx})/ε → x e^{rx}; next, Chapter 3.1.11 solves non-homogeneous forcing g(x) and Cauchy-Euler equations.",
          },
          labs: [
            {
              id: "lab-3-1-10a",
              slug: "wronskian-phase-area-lab",
              title: "Wronskian Determinant & Phase-Plane Area Independence Lab",
              componentKey: "WronskianPhaseAreaLab",
              summary: "Visualize signed parallelogram area formed by solution state vectors.",
              formulaLatex: "W \\neq 0 \\iff \\text{Linearly Independent}",
              dimensionBadge: "2D",
            },
            {
              id: "lab-3-1-10b",
              slug: "characteristic-roots-solution-lab",
              title: "Distinct, Repeated & Complex Characteristic Roots Explorer",
              componentKey: "CharacteristicRootsSolutionLab",
              summary: "Scrub coefficients a, b, c and watch the r₂ → r₁ repeated-root limit.",
              formulaLatex: "ar^2 + br + c = 0",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "3.1.11",
          slug: "operator-variation-cauchy-euler",
          title: "Operator Method (D), Variation of Parameters & Cauchy-Euler Equations",
          subtitle:
            "Compute particular integrals with inverse operators 1/f(D), general forcing envelopes via Variation of Parameters, and solve Cauchy-Euler equations via x = e^t.",
          status: "published",
          estimatedMinutes: 45,
          prerequisites: ["3.1.10"],
          dimensionBadge: "2D",
          accentHex: "#D5658B",
          subParent: {
            slug: "differential-equations",
            title: "Differential Equations",
            badge: "ODE Sub-Parent",
          },
          keyEquationsLatex: [
            "y_p = \\frac{1}{f(D)}g(x), \\qquad u_1' = -\\frac{y_2 g}{W},\\; u_2' = \\frac{y_1 g}{W}",
            "a x^2 y'' + b x y' + c y = g(x) \\xrightarrow{x = e^t,\\; \\theta = xD} \\bigl(a\\theta(\\theta-1) + b\\theta + c\\bigr)y = g(e^t)",
          ],
          engineeringContext:
            "Forced mechanical resonance, AC circuit steady-state phasor response, radial spherical Laplace potentials (Cauchy-Euler r² R'' + 2r R' - λR = 0), and thick-walled pressure vessel stresses.",
          pedagogicalRhythm: {
            question:
              "How does the algebraic symbol D = d/dx turn particular-integral calculus into fraction algebra—what rescues non-exponential forcings like sec(x)—and why does t = ln x flatten every Cauchy-Euler equation into constant coefficients?",
            labInteraction:
              "Test all five 1/f(D) inversion rules and resonance failures in Lab 3.1.11A (with live f(D)[y_p] = g(x) verification), then switch between Variation of Parameters and the Cauchy-Euler log-pullback in Lab 3.1.11B.",
            symbolicFormalizationLatex:
              "x = e^t,\\; \\theta = x\\frac{d}{dx} \\implies x^k D^k = \\theta(\\theta - 1)\\cdots(\\theta - k + 1)",
            edgeCasesAndBridge:
              "Watch out for resonance poles f(a) = 0 in inverse operators, singularities like sec(x) at x = ±π/2 in Variation of Parameters, and x > 0 domain restrictions (use |x| for x < 0) in Cauchy-Euler equations. With Chapter 3.1.11 published, all 22 chapters of Volume III are complete!",
          },
          labs: [
            {
              id: "lab-3-1-11a",
              slug: "operator-method-tutorial-lab",
              title: "Inverse Differential Operator 1/f(D) Tutorial & Step Solver",
              componentKey: "OperatorMethodTutorialLab",
              summary: "Rules for e^{ax}, sin(ax)/cos(ax), x^m, shift e^{ax}V(x), and resonance failure.",
              formulaLatex: "y_p = \\frac{1}{f(D)}g(x)",
              dimensionBadge: "2D",
            },
            {
              id: "lab-3-1-11b",
              slug: "variation-of-parameters-cauchy-euler",
              title: "Variation of Parameters & Cauchy-Euler Log-Pullback Lab",
              componentKey: "VariationOfParametersCauchyEulerLab",
              summary: "Solve arbitrary forcing functions g(x) and equidimensional ODEs via t = ln x.",
              formulaLatex: "x = e^t \\implies x^2 D^2 = \\theta(\\theta-1)",
              dimensionBadge: "2D",
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
            "Explore 2D/3D vector field streamlines, local Jacobian expansion/strain/spin decomposition, microscopic flux boxes (∇·F), and 3D curl axes (∇×F).",
          status: "published",
          estimatedMinutes: 45,
          prerequisites: ["3.1.3"],
          dimensionBadge: "2D + 3D",
          accentHex: "#029091",
          keyEquationsLatex: [
            "\\operatorname{div}\\mathbf{F} = \\nabla \\cdot \\mathbf{F} = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}",
            "\\operatorname{curl}\\mathbf{F} = \\nabla \\times \\mathbf{F} = \\left\\langle \\frac{\\partial R}{\\partial y} - \\frac{\\partial Q}{\\partial z},\\; \\frac{\\partial P}{\\partial z} - \\frac{\\partial R}{\\partial x},\\; \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right\\rangle",
          ],
          engineeringContext:
            "Incompressible fluid continuity (∇·u = 0), aerodynamic vorticity, electrostatic potential fields F = -∇φ, Maxwell's differential laws, and continuum strain-rotation splitting.",
          pedagogicalRhythm: {
            question:
              "Given a vector field F(x,y,z) assigning magnitude and direction to every point in space, how do we trace particle trajectories (streamlines) and separately measure local outward expansion (∇·F) versus 3D local spin (∇×F)?",
            labInteraction:
              "Move the microscopic flux box and paddlewheel probe, click to seed 2D/3D streamlines over potential contours while inspecting DF, and decompose opposite cube-face fluxes alongside the tilted 3D curl axis.",
            symbolicFormalizationLatex:
              "\\nabla\\cdot\\mathbf{F} = \\lim_{|V|\\to 0}\\frac{1}{|V|}\\oiint_{\\partial V}\\mathbf{F}\\cdot d\\mathbf{S}, \\qquad (\\nabla\\times\\mathbf{F})\\cdot\\hat{\\mathbf{n}} = \\lim_{|A|\\to 0}\\frac{1}{|A|}\\oint_{\\partial A}\\mathbf{F}\\cdot d\\mathbf{r}",
            edgeCasesAndBridge:
              "Straight streamlines like shear flow ⟨y, 0, 0⟩ carry non-zero curl, whereas circular vortex flow ⟨-y, x⟩/r² is irrotational away from 0! Always verify ∇×(∇f) = 0 and ∇·(∇×F) = 0 before accumulating work in Chapter 3.3.2.",
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
            {
              id: "lab-3-3-1b",
              slug: "vector-field-streamlines",
              title: "Vector Field Anatomy, RK4 Streamlines & Velocity-Gradient Tensor Lab",
              componentKey: "VectorFieldStreamlineExplorerLab",
              summary:
                "Click to seed 2D/3D streamlines over potential contours and split local DF into expansion, shear strain, and spin.",
              formulaLatex: "\\mathbf{r}'(t) = \\mathbf{F}(\\mathbf{r}(t)), \\qquad D\\mathbf{F} = \\mathbf{E}_{\\text{div}} + \\mathbf{S}_{\\text{shear}} + \\mathbf{\\Omega}_{\\text{curl}}",
              dimensionBadge: "2D + 3D",
            },
            {
              id: "lab-3-3-1c",
              slug: "div-curl-decomposition",
              title: "Component Flux Budget, Tilted 3D Curl Axis & Del Identity Verifier",
              componentKey: "DivCurlDecompositionLab",
              summary:
                "Compare opposing cube-face fluxes ∂P/∂x + ∂Q/∂y + ∂R/∂z, tilt the 3D curl axis ω = ∇×F, and verify ∇·(∇×F) = 0.",
              formulaLatex: "\\nabla\\cdot(\\nabla\\times\\mathbf{F}) = 0, \\qquad \\nabla\\times(\\nabla f) = \\mathbf{0}",
              dimensionBadge: "3D",
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
