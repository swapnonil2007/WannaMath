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
        "Left-hand and right-hand limits, limits at ±∞, rigorous ε–δ neighborhood bounds, continuity, and the Intermediate Value Theorem.",
      accentHex: "#8D9FCE",
      chapters: [
        {
          id: "1.1.1",
          slug: "limits",
          title: "Limits, Left-Hand & Right-Hand Approach (LHL & RHL)",
          subtitle:
            "Trace left-hand (x → a⁻) and right-hand (x → a⁺) approach paths, diagnose jumps and vertical poles, and visualize end behavior at ±∞.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: [],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
          keyEquationsLatex: [
            "\\lim_{x \\to a} f(x) = L \\iff \\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x) = L",
            "\\lim_{x \\to a^-} f(x) \\neq \\lim_{x \\to a^+} f(x) \\implies \\lim_{x \\to a} f(x) \\text{ DNE}",
          ],
          engineeringContext:
            "Transient startup behavior, circuit switching discontinuities, and steady-state asymptotic response of engineering systems.",
          heroActionLinks: [
            {
              label: "See Common Limit Formulas",
              href: "/formulas/limits",
              description:
                "Definitions, algebraic laws, fundamental limits, limits at ±∞ & evaluation techniques",
            },
          ],
          heroIntro: {
            questionToAsk:
              "If a graph has a hole, jump, or break right at $x = a$, how can you still determine the exact height $L$ that $f(x)$ is heading toward from the left and from the right?",
            briefExplanation: [
              "Instead of plugging in $x = a$, walk along the curve from the left ($x < a$), written $\\lim_{x \\to a^-} f(x)$ (the Left-Hand Limit, or LHL), and separately from the right ($x > a$), written $\\lim_{x \\to a^+} f(x)$ (the Right-Hand Limit, or RHL). The actual dot at $x = a$ does not matter at all—only the destination height each side approaches.",
              "A two-sided finite limit $\\lim_{x \\to a} f(x) = L$ exists if and only if both one-sided limits exist finitely and agree on the same number $L$. If LHL and RHL arrive at different heights, shoot toward $\\pm\\infty$, or oscillate wildly, the finite two-sided limit does not exist.",
            ],
          },
          pedagogicalRhythm: {
            question:
              "How do left-hand (x → a⁻) and right-hand (x → a⁺) trajectories diagnose removable holes, jump discontinuities, vertical poles, and horizontal asymptotes at ±∞?",
            labInteraction:
              "Animate h → 0⁺ in Lab 1.1.1A to compare f(a − h) and f(a + h) across holes, piecewise jumps, poles, and oscillations, then widen horizon M in Lab 1.1.1B to inspect limits at ±∞.",
            symbolicFormalizationLatex:
              "\\lim_{x \\to a^-} f(x) = L = \\lim_{x \\to a^+} f(x) \\iff \\lim_{x \\to a} f(x) = L \\in \\mathbb{R}",
            edgeCasesAndBridge:
              "Even when LHL = RHL = +∞ (as in 1/(x−1)²), the symbol +∞ records unbounded divergence rather than a finite number. Next, Chapter 1.1.2 turns this approach intuition into the airtight ε–δ tolerance proof.",
          },
          labs: [
            {
              id: "lab-1-1-1a",
              slug: "one-sided-limits-lhl-rhl",
              title:
                "Interactive Left-Hand (LHL) vs. Right-Hand (RHL) Limit Explorer",
              componentKey: "OneSidedLimitsExplorerLab",
              summary:
                "Slide left and right approach probes toward x = a across removable holes, piecewise jumps, poles, and custom functions.",
              formulaLatex:
                "\\lim_{x \\to a^-} f(x) \\stackrel{?}{=} \\lim_{x \\to a^+} f(x)",
              dimensionBadge: "2D",
            },
            {
              id: "lab-1-1-1b",
              slug: "limits-at-infinity-techniques",
              title: "Limits at ±∞ & Horizontal Asymptote Workbench",
              componentKey: "LimitsAtInfinityAndTechniquesLab",
              summary:
                "Scale the horizontal horizon M to inspect rational dominance, radical sign flips, Euler's constant, and Squeeze decay.",
              formulaLatex: "\\lim_{x \\to \\pm\\infty} f(x) = L_{\\pm}",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "1.1.2",
          slug: "epsilon-delta-limits",
          title: "ε-δ Neighborhoods & Limit Convergence",
          subtitle:
            "Interactive tolerance band challenge showing how output error ε constrains input window δ around x = a.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["1.1.1"],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
          keyEquationsLatex: [
            "0 < |x - a| < \\delta \\implies |f(x) - L| < \\varepsilon",
            "\\lim_{x \\to a} f(x) = L",
          ],
          engineeringContext:
            "Manufacturing tolerance specification and sensor calibration error bounds.",
          heroIntro: {
            questionToAsk:
              "If someone demands that $f(x)$ stay within any tiny error margin $\\varepsilon > 0$ of a target height $L$, how close must $x$ stay to $a$ (without touching $a$) to guarantee it?",
            briefExplanation: [
              "Think of a limit as a precision tolerance challenge: pick any vertical accuracy window $(L - \\varepsilon, L + \\varepsilon)$ around $L$, and try to find an input corridor $(a - \\delta, a + \\delta)$ around $a$ such that every punctured point $0 < |x - a| < \\delta$ lands inside the vertical target band—so $|f(x) - L| < \\varepsilon$.",
              "Because the condition $0 < |x - a| < \\delta$ explicitly excludes $x = a$, a removable hole or displaced point $f(a) \\neq L$ never changes the limit. By contrast, a jump or persistent oscillation like $\\sin(1/x)$ leaves points outside $(L - \\varepsilon, L + \\varepsilon)$ no matter how tiny you make $\\delta > 0$.",
            ],
          },
          pedagogicalRhythm: {
            question:
              "How tightly must we control an input parameter x near a target value a to guarantee the system output f(x) stays within an allowable engineering tolerance ε?",
            labInteraction:
              "Adjust the horizontal output tolerance band (L - ε, L + ε) and scrub the vertical input corridor (a - δ, a + δ) until the entire curve segment stays trapped inside the tolerance box.",
            symbolicFormalizationLatex:
              "\\forall \\varepsilon > 0,\\; \\exists \\delta > 0 \\text{ such that } 0 < |x - a| < \\delta \\implies |f(x) - L| < \\varepsilon",
            edgeCasesAndBridge:
              "At jump discontinuities or oscillating singularities like sin(1/x), no positive δ can trap the graph for small ε—motivating the formal definition of continuity in Chapter 1.1.3.",
          },
          labs: [
            {
              id: "lab-1-1-2a",
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
          id: "1.1.3",
          slug: "continuity-ivt",
          title: "Continuity, Intermediate Value Theorem & Asymptotes",
          subtitle:
            "Visualize connected graph trajectories, root-bracketing guarantees, and asymptotic growth rates.",
          status: "published",
          estimatedMinutes: 20,
          prerequisites: ["1.1.1", "1.1.2"],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
          keyEquationsLatex: [
            "\\lim_{x \\to a} f(x) = f(a)",
            "f(a) < N < f(b) \\implies \\exists c \\in (a,b) : f(c) = N",
          ],
          engineeringContext:
            "Bisection root-finding algorithms and thermal equilibrium existence proofs.",
          heroIntro: {
            questionToAsk:
              "When can you trace a curve across $x = a$ without lifting your pencil—and why does an unbroken curve guarantee a crossing at every height between $f(a)$ and $f(b)$?",
            briefExplanation: [
              "Continuity at $x = a$ locks three pieces together: $f(a)$ is defined, $\\lim_{x \\to a} f(x)$ exists finitely, and that limit equals the exact value $f(a)$. If any one of those three fails, the graph exhibits a removable hole, a jump step, or an infinite blow-up.",
              "When $f$ is continuous on every point of a closed interval $[a, b]$, it cannot skip over intermediate elevations: for any target level $N$ strictly between $f(a)$ and $f(b)$, the Intermediate Value Theorem guarantees at least one $c \\in (a, b)$ with $f(c) = N$—powering bisection root-finding (and failing only when a discontinuity is mistaken for a crossing).",
            ],
          },
          pedagogicalRhythm: {
            question:
              "When does a continuous function guarantee a crossing f(c) = N inside [a, b], and what catastrophic failure happens if a root-finder trusts sign changes blindly across a discontinuity?",
            labInteraction:
              "Step through bisection iterations in Lab 1.1.3A across cubic, transcendental, jump-discontinuity, and vertical-asymptote curves while shrinking the bracketing interval [a_k, b_k].",
            symbolicFormalizationLatex:
              "f \\in C([a,b]) \\;\\&\\; (f(a)-N)(f(b)-N) < 0 \\implies \\exists c \\in (a,b) : f(c) = N",
            edgeCasesAndBridge:
              "Sign flips across a jump or vertical asymptote violate the continuity hypothesis and trap bisection on non-roots; next, Module 1.2 introduces local linearity and secant-to-tangent differentiation.",
          },
          labs: [
            {
              id: "lab-1-1-3a",
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
        "Secant-to-tangent homotopy, local linear approximations, chain rule composition, Taylor polynomial osculation, and the Mean Value Theorems (Rolle, Lagrange, Cauchy).",
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
          heroActionLinks: [
            {
              label: "See Common Derivative Formulas",
              href: "/formulas/derivatives",
              description: "Basic differentiation rules, trig, inverse trig, log/exp & hyperbolic table",
            },
          ],
          heroIntro: {
            questionToAsk:
              "How can you define the exact slope or velocity at one frozen instant $x$, when ordinary slope $\\frac{\\Delta y}{\\Delta x}$ always requires two distinct points?",
            briefExplanation: [
              "Anchor one point at $(x, f(x))$ and pick a nearby partner $(x + h, f(x + h))$ to draw a secant chord with average slope $\\frac{f(x + h) - f(x)}{h}$. Shrinking the step $h \\to 0$ rotates that chord into the single line that best hugs the curve at $x$.",
              "When the left-hand approach ($h \\to 0^-$) and right-hand approach ($h \\to 0^+$) settle onto the same finite slope $f'(x)$, zooming into $(x, f(x))$ makes any smooth curve indistinguishable from its tangent line—whereas sharp corners like $|x - 0.5|$ and vertical cusps like $x^{2/3}$ refuse to flatten.",
            ],
          },
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
          heroIntro: {
            questionToAsk:
              "Once a smooth curve behaves like a straight line up close, how accurately can that tangent predict nearby values—and how can it hunt down roots $f(x) = 0$?",
            briefExplanation: [
              "Zooming in near $x = a$ replaces $f(x)$ with its tangent linearization $L(x) = f(a) + f'(a)(x - a)$. The straight-line differential $dy = f'(a)\\,dx$ approximates the true curve change $\\Delta y = f(a + dx) - f(a)$ so closely that the discrepancy $\\Delta y - dy$ shrinks faster than $dx$ itself.",
              "Because solving a linear equation is instant, setting $L(x_{n+1}) = 0$ slides you down the tangent line straight to the $x$-axis via $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$—Newton–Raphson iteration, which doubles accurate digits on each step whenever $f'(x_n) \\neq 0$.",
            ],
          },
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
          heroIntro: {
            questionToAsk:
              "When an input $x$ drives an intermediate variable $u = g(x)$ which in turn drives $y = f(u)$, how does a small nudge $dx$ scale into the final output change $dy$?",
            briefExplanation: [
              "Picture two linked gears or amplifiers: nudging $x$ by $dx$ stretches the intermediate gear $u = g(x)$ by a factor of $g'(x)$, giving $du \\approx g'(x)\\,dx$. That change $du$ then feeds the outer stage $y = f(u)$, which stretches it again by $f'(u)$ into $dy \\approx f'(u)\\,du$.",
              "Combining both stages and taking the limit gives the Chain Rule, $\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx} = f'(g(x))\\,g'(x)$: rates across composed processes multiply, unlocking related rates and implicit differentiation along curves like $x^2 + y^2 = r^2$.",
            ],
          },
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
          heroActionLinks: [
            {
              label: "See Common Taylor Expansions",
              href: "/formulas/taylor-expansions",
              description: "Maclaurin series for e^x, ln(1±x), trig, inverse trig, binomial & convergence intervals",
            },
          ],
          heroIntro: {
            questionToAsk:
              "A tangent line only matches height and slope at $x = a$—how much more faithfully can a polynomial hug a curve when it also matches bending ($f''$) and higher derivatives?",
            briefExplanation: [
              "By forcing a degree-$n$ polynomial $P_n(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(a)}{k!}(x - a)^k$ to share the exact height, slope, concavity, and higher derivatives of $f$ at $x = a$, each added term bends the approximation closer to the true curve over a wider interval, leaving remainder error $R_n(x) = f(x) - P_n(x)$.",
              "Stopping at degree $2$ already captures local bending: the quadratic $P_2(x)$ matches the curve's signed curvature $\\kappa(a) = \\frac{|f''(a)|}{(1 + [f'(a)]^2)^{3/2}}$ and sits tangent to the unique osculating circle of radius $R = 1/\\kappa(a)$.",
            ],
          },
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
        {
          id: "1.2.5",
          slug: "mean-value-theorems",
          title: "The Mean Value Theorems: Rolle, Lagrange & Cauchy Overview",
          subtitle:
            "Compare Rolle's, Lagrange's, and Cauchy's Mean Value Theorems along one unified logical proof chain from horizontal tangents to L'Hôpital's Rule.",
          status: "published",
          estimatedMinutes: 20,
          prerequisites: ["1.1.3", "1.2.1"],
          dimensionBadge: "2D",
          accentHex: "#D35323",
          subParent: {
            slug: "mean-value-theorems",
            title: "The Mean Value Theorems",
            badge: "THEOREM FAMILY",
          },
          keyEquationsLatex: [
            "\\text{Rolle: } f(a)=f(b) \\implies \\exists c \\in (a,b) : f'(c) = 0",
            "\\text{Lagrange: } \\exists c \\in (a,b) : f'(c) = \\frac{f(b)-f(a)}{b-a}",
            "\\text{Cauchy: } \\exists c \\in (a,b) : [f(b)-f(a)]g'(c) = [g(b)-g(a)]f'(c)",
          ],
          engineeringContext:
            "Average-to-instantaneous speed guarantees, Lipschitz error bounds in numerical solvers, and proving L'Hôpital's Rule.",
          heroIntro: {
            questionToAsk:
              "When does the overall change of a function between $x = a$ and $x = b$ force its instantaneous derivative $f'(c)$ to match that average rate at some moment $c \\in (a, b)$ inside the interval?",
            briefExplanation: [
              "The three Mean Value Theorems—Rolle's, Lagrange's, and Cauchy's—form one connected bridge between global endpoint behavior on $[a, b]$ and instantaneous derivatives inside $(a, b)$. Start with a level trip ($f(a) = f(b)$, Rolle): if you return to the starting height smoothly, you must level off ($f'(c) = 0$) at least once.",
              "Tilt that secant chord by a constant slope to get Lagrange's Mean Value Theorem ($f'(c) = \\frac{f(b)-f(a)}{b-a}$), then replace horizontal axis $x$ with a second curve $g(t)$ to get Cauchy's Mean Value Theorem—which directly proves L'Hôpital's Rule and Taylor's remainder theorem.",
            ],
          },
          pedagogicalRhythm: {
            question:
              "How do Rolle's horizontal tangent, Lagrange's parallel tangent, and Cauchy's parametric tangent fit into a single logical derivation chain?",
            labInteraction:
              "Use this overview hub to inspect all three theorem hypotheses side-by-side before launching the dedicated interactive laboratories in Chapters 1.2.5a, 1.2.5b, and 1.2.5c.",
            symbolicFormalizationLatex:
              "\\text{EVT + Fermat} \\longrightarrow \\text{Rolle} \\longrightarrow \\text{Lagrange} \\longrightarrow \\text{Cauchy} \\longrightarrow \\text{L'Hôpital}",
            edgeCasesAndBridge:
              "Breaking continuity on [a, b] or differentiability on (a, b) with a single sharp corner or endpoint jump destroys all three guarantees. Begin with Chapter 1.2.5a: Rolle's Theorem.",
          },
          labs: [],
        },
        {
          id: "1.2.5a",
          slug: "rolles-theorem",
          title: "Rolle's Theorem: Horizontal Tangents & Stationary Points",
          subtitle:
            "Locate points c ∈ (a, b) where f'(c) = 0 whenever f is continuous on [a, b], differentiable on (a, b), and returns to f(a) = f(b).",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["1.2.5"],
          dimensionBadge: "2D",
          accentHex: "#D35323",
          subParent: {
            slug: "mean-value-theorems",
            title: "The Mean Value Theorems",
            badge: "THEOREM FAMILY",
          },
          keyEquationsLatex: [
            "f \\in C([a,b]),\\; f \\text{ diff. on } (a,b),\\; f(a)=f(b) \\implies \\exists c \\in (a,b) : f'(c) = 0",
          ],
          engineeringContext:
            "Root separation in polynomials, zero-velocity turnaround detection, and stationary equilibrium proofs.",
          heroIntro: {
            questionToAsk:
              "If a smooth curve starts and ends at the exact same height $f(a) = f(b)$, why is it mathematically impossible to get from $a$ to $b$ without flattening out ($f'(c) = 0$) somewhere in between?",
            briefExplanation: [
              "Think of throwing a ball up from height $f(a)$ and catching it at the exact same height $f(b) = f(a)$. Unless the ball stayed completely flat the entire time, it had to reach a highest peak or lowest valley at some interior moment $c \\in (a, b)$.",
              "By the Extreme Value Theorem, a continuous curve on $[a, b]$ achieves an interior maximum or minimum at $c$; by Fermat's Theorem, if $f$ is differentiable at $c$, its slope there must vanish: $f'(c) = 0$. One sharp corner or one endpoint jump lets the curve turn around without a horizontal tangent.",
            ],
          },
          pedagogicalRhythm: {
            question:
              "Which three hypotheses guarantee a horizontal tangent f'(c) = 0, and how does dropping even one hypothesis produce an instant counterexample?",
            labInteraction:
              "Sweep probe x₀ across [a, b] in Lab 1.2.5a to inspect verified stationary points c_k, then switch to the corner (1 − |x|) and endpoint-jump presets to watch why differentiability on (a, b) and continuity on [a, b] are both essential.",
            symbolicFormalizationLatex:
              "f(a) = f(b),\\; f \\in C([a,b]) \\cap D((a,b)) \\implies \\exists\\, c \\in (a,b) : f'(c) = 0",
            edgeCasesAndBridge:
              "Rolle's Theorem only requires the chord between (a, f(a)) and (b, f(b)) to be flat; next, Chapter 1.2.5b tilts that chord to arbitrary height change f(b) − f(a) via Lagrange's Mean Value Theorem.",
          },
          labs: [
            {
              id: "lab-1-2-5a",
              slug: "rolles-horizontal-tangent",
              title: "Rolle's Theorem Horizontal Tangent & Hypothesis Verifier",
              componentKey: "RollesTheoremLab",
              summary:
                "Sweep tangent probe x₀ across [a, b], verify all 3 hypotheses, and inspect corner and endpoint-jump counterexamples.",
              formulaLatex: "f(a) = f(b) \\implies \\exists c \\in (a, b) : f'(c) = 0",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "1.2.5b",
          slug: "lagrange-mean-value-theorem",
          title: "Lagrange's Mean Value Theorem (LMVT): Parallel Tangents",
          subtitle:
            "Slide a secant chord parallel until it meets at least one interior point c ∈ (a, b) whose tangent slope equals the average rate of change.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["1.2.5a"],
          dimensionBadge: "2D",
          accentHex: "#D35323",
          subParent: {
            slug: "mean-value-theorems",
            title: "The Mean Value Theorems",
            badge: "THEOREM FAMILY",
          },
          keyEquationsLatex: [
            "f'(c) = \\frac{f(b) - f(a)}{b - a}",
          ],
          engineeringContext:
            "Average-speed enforcement guarantees, Lipschitz error estimates, and proving f'(x) > 0 implies strict monotonicity.",
          heroIntro: {
            questionToAsk:
              "If a car covers $120\\text{ km}$ in $2\\text{ hours}$ (average speed $60\\text{ km/h}$), why must its speedometer read $60\\text{ km/h}$ at least once—even if it constantly speeds up and slows down?",
            briefExplanation: [
              "Geometrically, connecting $(a, f(a))$ to $(b, f(b))$ draws a secant chord whose slope is the average rate of change $m_{\\text{sec}} = \\frac{f(b) - f(a)}{b - a}$. Lagrange's Mean Value Theorem states that if $f$ is continuous on $[a, b]$ and differentiable on $(a, b)$, at least one point $c \\in (a, b)$ has a tangent line strictly parallel to that chord: $f'(c) = m_{\\text{sec}}$.",
              "The proof reduces directly to Rolle's Theorem by subtracting the secant line from $f(x)$: the vertical gap $h(x) = f(x) - [f(a) + m_{\\text{sec}}(x - a)]$ satisfies $h(a) = h(b) = 0$, so $h'(c) = 0$ forces $f'(c) = m_{\\text{sec}}$.",
            ],
          },
          pedagogicalRhythm: {
            question:
              "How does subtracting the tilted secant line convert Lagrange's Mean Value Theorem into Rolle's Theorem on the gap function h(x)?",
            labInteraction:
              "Animate the parallel tangent sweep across [a, b] and toggle the synchronized auxiliary Rolle function h(x) in Lab 1.2.5b, then inspect a cusp failure on (x²)^(1/3).",
            symbolicFormalizationLatex:
              "h(x) = f(x) - \\left[f(a) + \\frac{f(b)-f(a)}{b-a}(x-a)\\right] \\implies h'(c) = 0 \\iff f'(c) = \\frac{f(b)-f(a)}{b-a}",
            edgeCasesAndBridge:
              "Lagrange compares f(x) against x itself (slope 1); next, Chapter 1.2.5c generalizes to comparing two curves f(t) and g(t) simultaneously via Cauchy's Mean Value Theorem.",
          },
          labs: [
            {
              id: "lab-1-2-5b",
              slug: "lagrange-parallel-tangent",
              title: "Lagrange's MVT Parallel Tangent & Auxiliary Rolle Function Lab",
              componentKey: "LagrangeMVTLab",
              summary:
                "Translate the secant chord parallel until it kisses the curve tangentially and inspect the auxiliary Rolle gap function h(x).",
              formulaLatex: "f'(c) = \\frac{f(b)-f(a)}{b-a}",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "1.2.5c",
          slug: "cauchy-mean-value-theorem",
          title: "Cauchy's Mean Value Theorem (CMVT): Parametric Tangents & L'Hôpital Bridge",
          subtitle:
            "Compare two curves f(t) and g(t) sharing one common parameter point c ∈ (a, b) where the parametric tangent vector aligns with the chord.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["1.2.5b"],
          dimensionBadge: "Dual 2D",
          accentHex: "#D35323",
          subParent: {
            slug: "mean-value-theorems",
            title: "The Mean Value Theorems",
            badge: "THEOREM FAMILY",
          },
          keyEquationsLatex: [
            "[f(b) - f(a)]\\,g'(c) = [g(b) - g(a)]\\,f'(c)",
            "\\frac{f'(c)}{g'(c)} = \\frac{f(b) - f(a)}{g(b) - g(a)} \\quad (g'(x) \\neq 0 \\text{ on } (a,b))",
          ],
          engineeringContext:
            "Parametric velocity alignment along planar trajectories and rigorous derivation of L'Hôpital's Rule for 0/0 limits.",
          heroIntro: {
            questionToAsk:
              "Why can't you prove $\\frac{f(b)-f(a)}{g(b)-g(a)} = \\frac{f'(c)}{g'(c)}$ by simply applying Lagrange's MVT separately to $f$ and $g$—and what geometric chord in the $(g(t), f(t))$-plane guarantees a single shared $c$?",
            briefExplanation: [
              "Applying Lagrange separately to $f$ and $g$ yields two generally different points $c_f$ and $c_g$, so $\\frac{f'(c_f)}{g'(c_g)}$ tells you nothing about a single shared instant $c$. Instead, plot $(g(t), f(t))$ as a parametric curve from $A = (g(a), f(a))$ to $B = (g(b), f(b))$: Cauchy's MVT guarantees one shared $c \\in (a, b)$ whose tangent velocity vector $(g'(c), f'(c))$ runs parallel to chord $\\overline{AB}$.",
              "The cross-multiplied form $[f(b)-f(a)]g'(c) = [g(b)-g(a)]f'(c)$ needs only continuity on $[a, b]$ and differentiability on $(a, b)$. Adding $g'(x) \\neq 0$ on $(a, b)$ guarantees $g(b) \\neq g(a)$ by Rolle's Theorem so you can divide safely into the ratio form—unlocking L'Hôpital's Rule.",
            ],
          },
          pedagogicalRhythm: {
            question:
              "How does parametric trajectory (g(t), f(t)) unite f'(c)/g'(c) at a single shared t = c instead of mismatched c_f and c_g?",
            labInteraction:
              "Inspect the parametric (g(t), f(t)) plane alongside separate f(t), g(t) plots in Lab 1.2.5c to see why c_f ≠ c_g ≠ c_Cauchy and test what fails when g'(t) hits zero.",
            symbolicFormalizationLatex:
              "H(t) = [f(b)-f(a)]\\,g(t) - [g(b)-g(a)]\\,f(t) \\implies H(a)=H(b) \\implies H'(c)=0",
            edgeCasesAndBridge:
              "Setting f(a) = g(a) = 0 and letting b = x → a turns Cauchy's ratio directly into L'Hôpital's Rule! Next, Module 1.3 reverses differentiation into Riemann accumulation.",
          },
          labs: [
            {
              id: "lab-1-2-5c",
              slug: "cauchy-parametric-tangent",
              title: "Cauchy's MVT Parametric Chord-Tangent & c_f ≠ c_g Lab",
              componentKey: "CauchyMVTLab",
              summary:
                "Visualize (g(t), f(t)) tangent vectors parallel to the endpoint chord and see why separate Lagrange points c_f and c_g rarely coincide.",
              formulaLatex: "\\frac{f'(c)}{g'(c)} = \\frac{f(b)-f(a)}{g(b)-g(a)}",
              dimensionBadge: "Dual 2D",
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
          heroActionLinks: [
            {
              label: "See Common Integral Formulas",
              href: "/formulas/integrals",
              description: "Definite properties, standard antiderivatives, IBP, trig sub & partial fractions",
            },
          ],
          heroIntro: {
            questionToAsk:
              "How do you compute the exact signed area beneath a curved graph when basic geometry only knows areas of flat rectangles and trapezoids?",
            briefExplanation: [
              "Slice the interval $[a, b]$ into $N$ thin vertical strips of width $\\Delta x = \\frac{b - a}{N}$, sample the height $f(x_i^*)$ inside each strip, and add up the signed strip areas $\\sum_{i=1}^{N} f(x_i^*)\\,\\Delta x$. Strips below the $x$-axis contribute negative area.",
              "Trapping the true curve between inscribed lower Darboux rectangles $L(f, P)$ and circumscribed upper rectangles $U(f, P)$ guarantees that whenever the gap $U(f, P) - L(f, P) \\to 0$ as $N \\to \\infty$, every choice of sample rule converges to one exact definite integral $\\int_a^b f(x)\\,dx$.",
            ],
          },
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
          heroIntro: {
            questionToAsk:
              "Why does accumulating area under a curve (integration) turn out to be the exact inverse of measuring tangent slopes (differentiation)?",
            briefExplanation: [
              "Let $A(x) = \\int_a^x f(t)\\,dt$ record the signed area gathered from fixed anchor $a$ up to a movable right boundary $x$. Nudging that right wall forward by $\\Delta x$ sweeps out one thin extra sliver of area $\\Delta A \\approx f(x)\\,\\Delta x$, so the rate at which area grows is simply the boundary height: $A'(x) = f(x)$.",
              "Because $A(x)$ and any other antiderivative $F(x)$ share the same derivative $f(x)$, they differ only by a constant—turning an infinite Riemann sum over $[a, b]$ into the clean endpoint difference $\\int_a^b f(x)\\,dx = F(b) - F(a)$.",
            ],
          },
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
          heroIntro: {
            questionToAsk:
              "When an integral doesn't match a basic antiderivative, how do stretching the horizontal axis or splitting a rectangle in the $(u, v)$-plane unlock an exact answer?",
            briefExplanation: [
              "In $u$-substitution, changing coordinates to $u = g(x)$ reverses the Chain Rule by stretching or compressing every tiny interval by $du = g'(x)\\,dx$, converting $\\int_a^b f(g(x))g'(x)\\,dx$ into a simpler integral $\\int_{g(a)}^{g(b)} f(u)\\,du$ on the transformed domain.",
              "Integration by Parts reverses the Product Rule geometrically: in the $(u, v)$-plane, a curve separates a net rectangle difference $u_2 v_2 - u_1 v_1$ into two complementary shaded areas, $\\int u\\,dv$ and $\\int v\\,du$, letting you trade a hard integral for its easier partner via $\\int u\\,dv = uv - \\int v\\,du$.",
            ],
          },
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
          heroIntro: {
            questionToAsk:
              "When you spin a 2D region $360^\\circ$ around an axis to form a 3D solid, when should you stack perpendicular washers versus unroll nested cylindrical shells?",
            briefExplanation: [
              "Slicing perpendicular to the rotation axis cuts flat circular disks or hollow washers whose cross-sectional area $\\pi(R^2 - r^2)$ and thickness $dx$ give element volume $dV = \\pi\\big([R(x)]^2 - [r(x)]^2\\big)\\,dx$.",
              "Slicing parallel to the rotation axis peels thin concentric cylindrical tubes that unroll into flat slabs of circumference $2\\pi r$, height $h(r)$, and thickness $dr$, giving $dV = 2\\pi r\\,h(r)\\,dr$. Both methods yield the exact same 3D volume, while shells spare you from inverting tricky curves.",
            ],
          },
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
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["1.3.1"],
          dimensionBadge: "2D",
          accentHex: "#D5658B",
          keyEquationsLatex: [
            "S_N = \\sum_{n=1}^{N} a_n, \\qquad \\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1-r}\\;(|r|<1)",
          ],
          engineeringContext:
            "Digital IIR filter impulse responses, compound annuity cashflows, and Monte Carlo asymptotic tail bounds.",
          heroIntro: {
            questionToAsk:
              "How can adding infinitely many nonzero numbers settle onto a finite sum—and why is $a_n \\to 0$ necessary yet not enough to guarantee convergence?",
            briefExplanation: [
              "An infinite series $\\sum_{n=1}^{\\infty} a_n$ converges to $S$ when its running partial sums $S_N = a_1 + a_2 + \\cdots + a_N$ level off toward a finite limit $S$. Geometric series $\\sum_{n=0}^{\\infty} a r^n$ shrink fast enough whenever $|r| < 1$, landing cleanly at $\\frac{a}{1 - r}$.",
              "Comparing the discrete bar heights $a_n = f(n)$ against a continuous curve shows that $\\sum_{n=1}^{\\infty} n^{-p}$ behaves just like $\\int_1^{\\infty} x^{-p}\\,dx$: it converges iff $p > 1$, explaining why the harmonic series $\\sum \\frac{1}{n}$ grows without bound even though its terms march toward zero.",
            ],
          },
          pedagogicalRhythm: {
            question:
              "When does an infinite sum of shrinking numbers settle onto a finite limit—and why does the harmonic series 1/n diverge even though its terms march cleanly to zero?",
            labInteraction:
              "Inspect sequence terms a_n alongside their continuous integral envelope f(x) and running partial-sum staircase S_N in Lab 1.4.1A across geometric, p-series, alternating harmonic, and telescoping sums.",
            symbolicFormalizationLatex:
              "\\int_1^N x^{-p}\\,dx \\le \\sum_{n=1}^N n^{-p} \\le 1 + \\int_1^N x^{-p}\\,dx \\implies \\text{converges} \\iff p > 1",
            edgeCasesAndBridge:
              "a_n → 0 is necessary but NOT sufficient for convergence (1/n diverges); alternating signs rescue 1/n to conditional convergence ln(2). Next, Chapter 1.4.2 turns numerical coefficients into power series functions f(x).",
          },
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
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["1.2.4", "1.4.1"],
          dimensionBadge: "2D",
          accentHex: "#D5658B",
          keyEquationsLatex: [
            "f(x) = \\sum_{n=0}^{\\infty} c_n(x-a)^n, \\qquad |x - a| < R",
          ],
          engineeringContext:
            "Frequency-domain Z-transforms, Chebyshev/Taylor firmware approximations, and complex pole stability margins.",
          heroIntro: {
            questionToAsk:
              "For which inputs $x$ does an infinite polynomial $\\sum_{n=0}^{\\infty} c_n(x - a)^n$ actually converge—and why can a smooth real curve still explode past a finite radius $R$?",
            briefExplanation: [
              "Every power series centered at $x = a$ has a symmetric radius of convergence $R \\ge 0$ (often computed via $R = \\lim_{n\\to\\infty} |c_n / c_{n+1}|$): it converges absolutely inside $(a - R, a + R)$, diverges for $|x - a| > R$, and requires separate testing at the two endpoints $x = a \\pm R$.",
              "Geometrically, $R$ equals the distance in the complex plane $\\mathbb{C}$ from $a$ to the nearest pole or singularity—which is why the completely smooth bell $f(x) = \\frac{1}{1 + x^2}$ stops converging past $|x| = 1$, right where its complex poles sit at $x = \\pm i$.",
            ],
          },
          pedagogicalRhythm: {
            question:
              "Why does the Maclaurin series of the completely smooth bell 1/(1+x²) abruptly explode past |x| > 1—and how do complex-plane singularities explain real convergence intervals?",
            labInteraction:
              "Scrub partial sum degree N and probe x₀ in Lab 1.4.2A while inspecting the complex convergence disk |z| < R and endpoint convergence vs. divergence.",
            symbolicFormalizationLatex:
              "R = \\lim_{n\\to\\infty}\\left|\\frac{c_n}{c_{n+1}}\\right| = \\text{distance in } \\mathbb{C} \\text{ to nearest singularity}",
            edgeCasesAndBridge:
              "Endpoints x = a ± R must always be tested individually (yielding open (-1,1), half-open (-1,1], or closed [-1,1]). With Chapter 1.4.2 published, all 17 chapters of Volume I are complete!",
          },
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
