import { VolumeMetadata } from "./types";

export const VOL1_SINGLE_VARIABLE: VolumeMetadata = {
  id: "vol-1",
  volumeNumber: "I",
  slug: "single-variable-calculus",
  title: "Single-Variable Calculus",
  shortTitle: "Single-Variable",
  accentToken: "--math-var-x",
  accentHex: "#8D9FCE",
  description:
    "Foundations of continuous change and accumulation in one dimension: epsilon-delta limits, secant-to-tangent homotopy, local linearization, Riemann partitions, the Fundamental Theorem of Calculus, and power series convergence.",
  engineeringApplications: [
    "Kinematics, Velocity & Acceleration Profiles",
    "Sensitivity Analysis & Newton-Raphson Root Finding",
    "Work, Hydrostatic Force & Centroids of 1D Beams",
    "Signal Approximation via Taylor & Maclaurin Polynomials",
  ],
  modules: [
    {
      id: "mod-1-1",
      slug: "limits-continuity",
      numberLabel: "1.1",
      title: "Limits & Continuity",
      description:
        "Rigorous neighborhood bounds, one-sided limits, removable vs. jump discontinuities, and the Intermediate Value Theorem.",
      accentHex: "#8D9FCE",
      chapters: [
        {
          id: "1.1.1",
          slug: "epsilon-delta-limits",
          title: "ε-δ Neighborhoods & Limit Convergence",
          subtitle:
            "Interactive tolerance band challenge showing how output error ε constrains input window δ around x = a.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: [],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
          keyEquationsLatex: [
            "0 < |x - a| < \\delta \\implies |f(x) - L| < \\varepsilon",
            "\\lim_{x \\to a} f(x) = L",
          ],
          engineeringContext:
            "Manufacturing tolerance specification and sensor calibration error bounds.",
          pedagogicalRhythm: {
            question:
              "How tightly must we control an input parameter x near a target value a to guarantee the system output f(x) stays within an allowable engineering tolerance ε?",
            labInteraction:
              "Adjust the horizontal output tolerance band (L - ε, L + ε) and scrub the vertical input corridor (a - δ, a + δ) until the entire curve segment stays trapped inside the tolerance box.",
            symbolicFormalizationLatex:
              "\\forall \\varepsilon > 0,\\; \\exists \\delta > 0 \\text{ such that } 0 < |x - a| < \\delta \\implies |f(x) - L| < \\varepsilon",
            edgeCasesAndBridge:
              "At jump discontinuities or oscillating singularities like sin(1/x), no positive δ can trap the graph for small ε—motivating the formal definition of continuity in Chapter 1.1.2.",
          },
          labs: [
            {
              id: "lab-1-1-1a",
              slug: "epsilon-delta-corridor",
              title: "Interactive ε-δ Tolerance Corridor Inspector",
              componentKey: "EpsilonDeltaCorridorLab",
              summary:
                "Manipulate ε and δ bands on smooth, piecewise, and singular functions to test limit existence.",
              formulaLatex: "|f(x) - L| < \\varepsilon",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "1.1.2",
          slug: "continuity-ivt",
          title: "Continuity, Intermediate Value Theorem & Asymptotes",
          subtitle:
            "Visualize connected graph trajectories, root-bracketing guarantees, and asymptotic growth rates.",
          status: "published",
          estimatedMinutes: 20,
          prerequisites: ["1.1.1"],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
          keyEquationsLatex: [
            "\\lim_{x \\to a} f(x) = f(a)",
            "f(a) < N < f(b) \\implies \\exists c \\in (a,b) : f(c) = N",
          ],
          engineeringContext:
            "Bisection root-finding algorithms and thermal equilibrium existence proofs.",
          pedagogicalRhythm: {
            question:
              "When does a continuous function guarantee a crossing f(c) = N inside [a, b], and what catastrophic failure happens if a root-finder trusts sign changes blindly across a discontinuity?",
            labInteraction:
              "Step through bisection iterations in Lab 1.1.2A across cubic, transcendental, jump-discontinuity, and vertical-asymptote curves while shrinking the bracketing interval [a_k, b_k].",
            symbolicFormalizationLatex:
              "f \\in C([a,b]) \\;\\&\\; (f(a)-N)(f(b)-N) < 0 \\implies \\exists c \\in (a,b) : f(c) = N",
            edgeCasesAndBridge:
              "Sign flips across a jump or vertical asymptote violate the continuity hypothesis and trap bisection on non-roots; next, Module 1.2 introduces local linearity and secant-to-tangent differentiation.",
          },
          labs: [
            {
              id: "lab-1-1-2a",
              slug: "ivt-bisection-bracketing",
              title: "Intermediate Value Theorem & Bisection Root Bracketing Lab",
              componentKey: "IVTBisectionLab",
              summary:
                "Step through bisection intervals on continuous vs. discontinuous curves.",
              formulaLatex: "f(a)\\cdot f(b) < 0 \\implies \\exists c : f(c) = 0",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-1-2",
      slug: "differential-calculus",
      numberLabel: "1.2",
      title: "Differential Calculus & Local Linearity",
      description:
        "Secant-to-tangent homotopy, local linear approximations, chain rule composition, and Taylor polynomial osculation.",
      accentHex: "#D35323",
      chapters: [
        {
          id: "1.2.1",
          slug: "secant-tangent-homotopy",
          title: "Secant-to-Tangent Homotopy & Instantaneous Rate",
          subtitle:
            "Scrub step h → 0 and zoom into the curve until secant chord and tangent line become indistinguishable.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["1.1.1"],
          dimensionBadge: "2D",
          accentHex: "#D35323",
          keyEquationsLatex: [
            "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
          ],
          engineeringContext:
            "Instantaneous velocity from discrete radar/encoder sampling and local sensitivity calibration.",
          pedagogicalRhythm: {
            question:
              "When does shrinking a finite difference chord Δy/Δx produce a stable instantaneous slope, and why do corners and cusps break local straightness under extreme zoom?",
            labInteraction:
              "Animate h → 0 and drag the micro-zoom slider in Lab 1.2.1A to watch smooth cubics flatten into their tangent line while |x - 0.5| keeps a persistent corner.",
            symbolicFormalizationLatex:
              "f'(x_0) = \\lim_{h \\to 0^-} \\frac{f(x_0+h)-f(x_0)}{h} = \\lim_{h \\to 0^+} \\frac{f(x_0+h)-f(x_0)}{h}",
            edgeCasesAndBridge:
              "When left-hand and right-hand slopes disagree or blow up vertically, f'(x₀) does not exist; next, Chapter 1.2.2 puts differentiable tangent lines to work for linear error bounds and Newton root finding.",
          },
          labs: [
            {
              id: "lab-1-2-1a",
              slug: "secant-tangent-zoom",
              title: "Secant Chord to Tangent Derivative Magnifier",
              componentKey: "SecantTangentLab",
              summary:
                "Synchronized difference quotient chord and derivative graph plotter.",
              formulaLatex: "m_{\\text{sec}} = \\frac{\\Delta y}{\\Delta x} \\to f'(x)",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "1.2.2",
          slug: "local-linearity-differentials",
          title: "Local Linearity, Differentials & Newton-Raphson",
          subtitle:
            "Compare tangent differential dy = f'(x) dx against true increment Δy and iterate tangent root-finding.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["1.2.1"],
          dimensionBadge: "2D",
          accentHex: "#D35323",
          keyEquationsLatex: [
            "L(x) = f(a) + f'(a)(x-a)",
            "x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}",
          ],
          engineeringContext:
            "Tolerance propagation in measurements (dy ≈ Δy) and quadratic root solvers inside CAD and SPICE simulators.",
          pedagogicalRhythm: {
            question:
              "How closely does the tangent differential dy = f'(a)Δx track the nonlinear change Δy—and how does setting that tangent line to zero turn root finding into rapid quadratic steps?",
            labInteraction:
              "Inspect the dy vs. Δy residual bar and step through Newton-Raphson cobweb tangents in Lab 1.2.2A across smooth roots and stationary-point oscillation traps.",
            symbolicFormalizationLatex:
              "0 = f(x_n) + f'(x_n)(x_{n+1} - x_n) \\implies x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}",
            edgeCasesAndBridge:
              "Near stationary points where f'(x_n) ≈ 0, tangent lines shoot nearly horizontally or enter limit cycles; next, Chapter 1.2.3 tracks how derivatives multiply across nested compositions.",
          },
          labs: [
            {
              id: "lab-1-2-2a",
              slug: "newton-raphson-cobweb",
              title: "Differential Error & Newton-Raphson Iteration Lab",
              componentKey: "NewtonRaphsonLab",
              summary:
                "Trace tangent root steps and inspect quadratic convergence vs. stationary-point divergence.",
              formulaLatex: "\\Delta y - dy = o(\\Delta x)",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "1.2.3",
          slug: "chain-rule-kinematics",
          title: "Chain Rule, Implicit Differentiation & Related Rates",
          subtitle:
            "Visualize composite rate amplification dy/dx = (dy/du)(du/dx) through linked intermediate axes.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["1.2.1"],
          dimensionBadge: "2D",
          accentHex: "#96B898",
          keyEquationsLatex: [
            "\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx}",
          ],
          engineeringContext:
            "Multi-stage gearboxes, neural backpropagation gradients, and coupled mechanical kinematics.",
          pedagogicalRhythm: {
            question:
              "Why do derivatives multiply rather than add when one function feeds its output into another?",
            labInteraction:
              "Adjust input probe x₀ and perturbation Δx across the three linked plots (x → u = g(x) → y = f(u)) in Lab 1.2.3A to watch linear stretch ratios multiply stage-by-stage.",
            symbolicFormalizationLatex:
              "\\frac{\\Delta y}{\\Delta x} \\approx \\frac{\\Delta y}{\\Delta u} \\cdot \\frac{\\Delta u}{\\Delta x} \\xrightarrow{\\Delta x \\to 0} f'(g(x_0))\\,g'(x_0)",
            edgeCasesAndBridge:
              "Notice that g'(x₀) = 0 zeroes out the composite rate even when f'(u₀) ≠ 0; next, Chapter 1.2.4 pushes local approximation beyond first-order slopes to degree-n Taylor polynomials and curvature.",
          },
          labs: [
            {
              id: "lab-1-2-3a",
              slug: "chain-rule-gearbox",
              title: "Three-Axis Composite Function Rate Propagator",
              componentKey: "ChainRulePropagatorLab",
              summary:
                "Watch input perturbation dx scale through u = g(x) and y = f(u).",
              formulaLatex: "(f \\circ g)'(x) = f'(g(x))\\,g'(x)",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "1.2.4",
          slug: "taylor-polynomials-curvature",
          title: "Taylor Polynomials & Curvature Osculating Circles",
          subtitle:
            "Match higher-order derivatives at x = a to hug nonlinear curves and measure radius of curvature R = 1/κ.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["1.2.2"],
          dimensionBadge: "2D",
          accentHex: "#B95869",
          keyEquationsLatex: [
            "P_n(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(a)}{k!}(x-a)^k",
            "\\kappa(x) = \\frac{|f''(x)|}{\\big(1 + [f'(x)]^2\\big)^{3/2}}",
          ],
          engineeringContext:
            "Highway/railway transition clothoids, optics lens curvature, and embedded trigonometric look-up polynomials.",
          pedagogicalRhythm: {
            question:
              "How does matching k-th derivatives at a single anchor x = a allow a polynomial P_n(x) to hug curves far away—and what geometric circle shares the exact 2nd-order Taylor bend?",
            labInteraction:
              "Scrub polynomial degree n ∈ [1, 12] and center a in Lab 1.2.4A while toggling the osculating circle R = 1/κ(a) and inspecting the pointwise remainder |R_n(x)|.",
            symbolicFormalizationLatex:
              "P_2(x) = f(a) + f'(a)(x-a) + \\frac{f''(a)}{2}(x-a)^2 \\iff \\text{Curvature match } \\kappa(a) = \\frac{|f''(a)|}{(1+[f'(a)]^2)^{3/2}}",
            edgeCasesAndBridge:
              "On 1/(1+x²), complex poles at x = ±i cap the convergence radius even as n → 12, and at inflection points f''(a)=0 sends the osculating radius R → ∞. Next, Module 1.3 reverses differentiation into Riemann accumulation.",
          },
          labs: [
            {
              id: "lab-1-2-4a",
              slug: "taylor-degree-scrubber",
              title: "Taylor Degree Scrubber & Osculating Circle Inspector",
              componentKey: "TaylorCurvatureLab",
              summary:
                "Adjust polynomial degree n ∈ [1, 12] and expansion center a with live remainder error.",
              formulaLatex: "R_n(x) = f(x) - P_n(x)",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-1-3",
      slug: "integral-calculus",
      numberLabel: "1.3",
      title: "Single-Variable Integration & Accumulation",
      description:
        "1D Riemann sums, Darboux upper/lower bounds, the Fundamental Theorem of Calculus, and 3D solids of revolution.",
      accentHex: "#029091",
      chapters: [
        {
          id: "1.3.1",
          slug: "riemann-sums-1d",
          title: "1D Riemann Sums, Darboux Bounds & Definite Area",
          subtitle:
            "Compare left, right, midpoint, and trapezoidal partitions as N → ∞ on signed curves.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["1.1.1"],
          dimensionBadge: "2D",
          accentHex: "#029091",
          keyEquationsLatex: [
            "\\int_{a}^{b} f(x)\\,dx = \\lim_{N \\to \\infty} \\sum_{i=1}^{N} f(x_i^*)\\,\\Delta x",
          ],
          engineeringContext:
            "Numerical integration of accelerometer velocity logs, discrete trapezoidal telemetry, and signed energy balance.",
          pedagogicalRhythm: {
            question:
              "Why do midpoint and trapezoidal rectangles converge far faster than left/right sums—and how do inscribed/circumscribed Darboux bounds certify exact integrability?",
            labInteraction:
              "Scrub partition count N and switch across Left, Right, Midpoint, Trapezoidal, and Darboux Upper/Lower modes in Lab 1.3.1A while observing signed positive/negative strips.",
            symbolicFormalizationLatex:
              "L(f, P) = \\sum_{i=1}^N m_i \\Delta x_i \\le \\int_a^b f(x)\\,dx \\le \\sum_{i=1}^N M_i \\Delta x_i = U(f, P)",
            edgeCasesAndBridge:
              "Areas below the x-axis cancel positive areas in net signed integrals, whereas ∫|f(x)|dx accumulates total geometric magnitude; next, Chapter 1.3.2 connects integration directly to differentiation.",
          },
          labs: [
            {
              id: "lab-1-3-1a",
              slug: "riemann-partition-1d",
              title: "1D Riemann & Darboux Partition Explorer",
              componentKey: "Riemann1DLab",
              summary:
                "Subdivide [a, b] into N strips and compare upper/lower Darboux discrepancy.",
              formulaLatex: "L(f, P) \\le \\int_a^b f(x)\\,dx \\le U(f, P)",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "1.3.2",
          slug: "fundamental-theorem-calculus",
          title: "The Fundamental Theorem of Calculus: Accumulation vs. Slope",
          subtitle:
            "Sweep upper bound x to see why the rate of change of accumulated area A(x) equals the boundary height f(x).",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["1.2.1", "1.3.1"],
          dimensionBadge: "2D",
          accentHex: "#029091",
          keyEquationsLatex: [
            "\\frac{d}{dx}\\int_{a}^{x} f(t)\\,dt = f(x)",
            "\\int_{a}^{b} F'(x)\\,dx = F(b) - F(a)",
          ],
          engineeringContext:
            "Deriving position from velocity profiles, capacitor charge accumulation Q(t) = ∫I(τ)dτ, and non-elementary erf(x) tables.",
          pedagogicalRhythm: {
            question:
              "Why is the derivative of accumulated area A(x) simply the boundary height f(x)—turning an infinite sum into a single endpoint subtraction F(b) - F(a)?",
            labInteraction:
              "Animate upper bound x in Lab 1.3.2A to watch the boundary slice dA = f(x)dx govern the tangent slope of A(x), even on non-elementary Gaussians and jump-step curves.",
            symbolicFormalizationLatex:
              "\\frac{A(x+\\Delta x) - A(x)}{\\Delta x} \\approx \\frac{f(x)\\,\\Delta x}{\\Delta x} \\xrightarrow{\\Delta x \\to 0} f(x)",
            edgeCasesAndBridge:
              "Integrating smooths jump discontinuities into continuous corners where A(x) stays continuous everywhere; next, Chapter 1.3.3 geometricizes u-substitution and integration by parts.",
          },
          labs: [
            {
              id: "lab-1-3-2a",
              slug: "ftc-accumulation-sweeper",
              title: "Dual-Graph FTC Area Accumulation & Derivative Synchronizer",
              componentKey: "FTCAccumulationLab",
              summary:
                "Sweep x to watch area under f(t) trace the antiderivative curve F(x) with tangent slope f(x).",
              formulaLatex: "dA = f(x)\\,dx \\implies A'(x) = f(x)",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "1.3.3",
          slug: "substitution-integration-by-parts",
          title: "u-Substitution & Integration by Parts Geometry",
          subtitle:
            "See u-substitution as 1D interval rescaling and integration by parts as complementary rectangular area partitioning.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["1.2.3", "1.3.2"],
          dimensionBadge: "2D",
          accentHex: "#96B898",
          keyEquationsLatex: [
            "\\int_{a}^{b} f(g(x))\\,g'(x)\\,dx = \\int_{g(a)}^{g(b)} f(u)\\,du",
            "\\int u\\,dv = u v - \\int v\\,du",
          ],
          engineeringContext:
            "Weak-form finite element integration by parts (transferring derivatives onto test functions) and coordinate normalization.",
          pedagogicalRhythm: {
            question:
              "What are u-substitution and integration by parts actually doing to area under curves—and why does swapping du and dv turn intractable integrals into simple complementary rectangles?",
            labInteraction:
              "Toggle between the (u, v) rectangular complement partition (IBP) and synchronized x ↔ u strip-stretching planes (u-Substitution) in Lab 1.3.3A.",
            symbolicFormalizationLatex:
              "\\int_{u_1}^{u_2} v\\,du + \\int_{v_1}^{v_2} u\\,dv = u_2 v_2 - u_1 v_1",
            edgeCasesAndBridge:
              "Choosing u and dv wisely moves differentiation onto the polynomial/logarithmic factor; next, Chapter 1.3.4 sweeps 2D profiles around axes to compute 3D volumes of revolution.",
          },
          labs: [
            {
              id: "lab-1-3-3a",
              slug: "ibp-area-rectangle",
              title: "1D Domain Stretch (u-Sub) & u-v Area Partition (IBP) Lab",
              componentKey: "SubstitutionIBPLab",
              summary:
                "Visualize ∫ u dv + ∫ v du = Δ(uv) directly in the (u, v) plane.",
              formulaLatex: "\\int_{u_1}^{u_2} v\\,du + \\int_{v_1}^{v_2} u\\,dv = u_2 v_2 - u_1 v_1",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "1.3.4",
          slug: "solids-of-revolution",
          title: "Solids of Revolution: Disks, Washers & Cylindrical Shells",
          subtitle:
            "Revolve 2D regions around axes in 3D WebGL to compare perpendicular washer slices against nested cylindrical shells.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["1.3.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#029091",
          keyEquationsLatex: [
            "V_{\\text{washer}} = \\int_{a}^{b} \\pi\\big([R(x)]^2 - [r(x)]^2\\big)\\,dx",
            "V_{\\text{shell}} = \\int_{a}^{b} 2\\pi x\\,f(x)\\,dx",
          ],
          engineeringContext:
            "Turned lathe components, parabolic antenna reflectors, axisymmetric pressure vessels, and nozzle volumes.",
          pedagogicalRhythm: {
            question:
              "When sweeping a flat region around an axis, when is it easier to slice perpendicular washers π(R² - r²)dx versus unrolling nested cylindrical shells 2πrh dr?",
            labInteraction:
              "Orbit the cutaway 3D WebGL solid of revolution in Lab 1.3.4A, scrub sweep angle φ ∈ [30°, 360°], and switch between active washer disks and cylindrical shells.",
            symbolicFormalizationLatex:
              "dV_{\\text{washer}} = \\pi(R^2 - r^2)\\,dx \\quad \\big| \\quad dV_{\\text{shell}} = 2\\pi r\\,h(r)\\,dr",
            edgeCasesAndBridge:
              "Shells avoid inverting non-monotone curves like y = sin(x) around the y-axis! Next, Module 1.4 transitions from continuous accumulation to infinite discrete series and power series.",
          },
          labs: [
            {
              id: "lab-1-3-4a",
              slug: "revolution-washer-shell-3d",
              title: "3D Solid of Revolution Washer vs. Cylindrical Shell Slicer",
              componentKey: "SolidOfRevolutionLab",
              summary:
                "Animate 360° revolution and toggle washer disks vs. concentric shells.",
              formulaLatex: "dV = 2\\pi r h\\,dr",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-1-4",
      slug: "infinite-series",
      numberLabel: "1.4",
      title: "Infinite Series & Power Series Convergence",
      description:
        "Partial sum trajectories, integral comparison tests, and power series intervals of convergence.",
      accentHex: "#D5658B",
      chapters: [
        {
          id: "1.4.1",
          slug: "sequences-partial-sums",
          title: "Sequences, Partial Sums & Geometric Convergence",
          subtitle:
            "Compare discrete partial sums S_N against continuous improper integral bounds.",
          status: "planned",
          estimatedMinutes: 25,
          prerequisites: ["1.3.1"],
          dimensionBadge: "2D",
          accentHex: "#D5658B",
          keyEquationsLatex: [
            "S_N = \\sum_{n=1}^{N} a_n, \\qquad \\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1-r}\\;(|r|<1)",
          ],
          labs: [
            {
              id: "lab-1-4-1a",
              slug: "partial-sum-staircase",
              title: "Partial Sum Staircase & Integral Test Comparator",
              componentKey: "PartialSumSeriesLab",
              summary:
                "Inspect p-series and geometric series convergence rates.",
              formulaLatex: "\\int_1^\\infty f(x)\\,dx \\text{ converges} \\iff \\sum_{n=1}^\\infty a_n \\text{ converges}",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "1.4.2",
          slug: "power-series-convergence",
          title: "Power Series, Radius of Convergence & Analytic Functions",
          subtitle:
            "Visualize why 1/(1+x²) diverges outside |x| < 1 even though the real curve is smooth everywhere.",
          status: "planned",
          estimatedMinutes: 25,
          prerequisites: ["1.2.4", "1.4.1"],
          dimensionBadge: "2D",
          accentHex: "#D5658B",
          keyEquationsLatex: [
            "f(x) = \\sum_{n=0}^{\\infty} c_n(x-a)^n, \\qquad |x - a| < R",
          ],
          labs: [
            {
              id: "lab-1-4-2a",
              slug: "radius-of-convergence-interval",
              title: "Power Series Radius of Convergence & Endpoint Inspector",
              componentKey: "PowerSeriesConvergenceLab",
              summary:
                "Scrub partial sums across (-R, R) to observe blow-up outside the radius of convergence.",
              formulaLatex: "R = \\lim_{n \\to \\infty} \\left|\\frac{c_n}{c_{n+1}}\\right|",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
  ],
};
