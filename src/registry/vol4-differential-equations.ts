import { VolumeMetadata } from "./types";

export const VOL4_DIFFERENTIAL_EQUATIONS: VolumeMetadata = {
  id: "vol-4",
  volumeNumber: "IV",
  slug: "differential-equations",
  title: "Differential Equations & Dynamical Systems",
  shortTitle: "Differential Equations",
  accentToken: "--math-active-sweep",
  accentHex: "#D35323",
  description:
    "Continuous-time dynamical systems and physical field equations: first-order direction fields, damped and forced harmonic oscillators, 2D nonlinear phase portraits, bifurcations, and the Heat and Wave partial differential equations.",
  engineeringApplications: [
    "Mechanical & Structural Vibration Isolation (Mass-Spring-Damper)",
    "RLC Circuit Transient & Frequency Response",
    "Nonlinear Control Systems, Phase-Locked Loops & Limit Cycles",
    "Transient Heat Conduction & Acoustic Wave Propagation",
  ],
  modules: [
    {
      id: "mod-4-1",
      slug: "first-order-odes",
      numberLabel: "4.1",
      title: "First-Order ODEs & Slope Fields",
      description:
        "Direction field geometry, existence and uniqueness of integral trajectories, autonomous equilibria, and separable/linear models.",
      accentHex: "#D35323",
      chapters: [
        {
          id: "4.1.1",
          slug: "direction-fields-integral-curves",
          title: "Direction Fields, Integral Curves & Picard Existence",
          subtitle:
            "Drop initial conditions (t₀, y₀) into a slope field dy/dt = f(t, y) to trace RK4 solution curves, inspect constant-slope isoclines, and spot Picard–Lindelöf uniqueness traps.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["1.2.1", "1.3.2"],
          dimensionBadge: "2D",
          accentHex: "#D35323",
          keyEquationsLatex: [
            "\\frac{dy}{dt} = f(t, y), \\qquad y(t_0) = y_0",
            "y_{n+1} = y_n + h f(t_n, y_n) \\quad (\\text{Euler}) \\;\\text{ vs. }\\; \\mathcal{O}(h^4)\\text{ RK4}",
          ],
          engineeringContext:
            "RC circuit transients under AC forcing, aerodynamic glide trajectories, Euler vs. Runge–Kutta flight simulation integrators, and singular boundary-layer uniqueness limits.",
          pedagogicalRhythm: {
            question:
              "Even when an ODE dy/dt = f(t, y) cannot be integrated in closed form, how can we determine every trajectory's shape directly from geometry?",
            labInteraction:
              "Click anywhere in the (t, y) plane to launch forward/backward RK4 integral curves, sweep constant-slope isoclines f(t, y) = c, and compare Euler step-size drift against true solutions.",
            symbolicFormalizationLatex:
              "\\mathbf{T}(t,y) = \\langle 1,\\; f(t,y) \\rangle \\quad \\text{with unique curves when } f,\\; \\frac{\\partial f}{\\partial y} \\text{ are continuous}",
            edgeCasesAndBridge:
              "When ∂f/∂y blows up (e.g., y' = 1.4|y|^(2/3) at y = 0), solution curves peel apart and violate uniqueness! Next, Chapter 4.1.2 collapses time-independent flows onto 1D phase lines and bifurcations.",
          },
          labs: [
            {
              id: "lab-4-1-1a",
              slug: "slope-field-particle-tracer",
              title: "Interactive Slope Field, Isocline & Trajectory Tracer",
              componentKey: "SlopeFieldTracerLab",
              summary:
                "Click anywhere in the (t, y) plane to launch forward/backward integral curves.",
              formulaLatex: "y'(t) = f(t, y(t))",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "4.1.2",
          slug: "separable-linear-odes",
          title: "Separable, Linear & Autonomous Phase-Line Models",
          subtitle:
            "Analyze logistic harvesting, thermal cooling, and parameter bifurcations via 1D phase lines, stability linearization f'(y*), and bifurcation diagrams.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["3.1.9", "4.1.1"],
          dimensionBadge: "2D",
          accentHex: "#96B898",
          keyEquationsLatex: [
            "\\frac{dy}{dt} = f(y; r), \\qquad f(y^*) = 0,\\; \\begin{cases} f'(y^*) < 0 & \\text{Sink (Stable)} \\\\ f'(y^*) > 0 & \\text{Source (Unstable)} \\end{cases}",
            "y' + P(t)y = Q(t) \\implies \\mu(t) = e^{\\int P(t)\\,dt}",
          ],
          engineeringContext:
            "Sustainable fishery & bioreactors harvesting thresholds, structural buckling (pitchfork bifurcation), population carrying capacity, and optical bistability.",
          pedagogicalRhythm: {
            question:
              "For an autonomous system dy/dt = f(y; r), how can we predict the long-term fate of every initial condition—and when does nudging parameter r trigger a sudden regime collapse?",
            labInteraction:
              "Scrub bifurcation parameter r across Saddle-Node, Transcritical, Pitchfork, and Harvesting models while watching equilibria collide on the 1D phase line, time trajectories y(t), and the bifurcation diagram.",
            symbolicFormalizationLatex:
              "\\dot{y} = f(y; r) \\approx f'(y^*)(y - y^*) \\implies y(t) - y^* \\sim C e^{f'(y^*)t}",
            edgeCasesAndBridge:
              "Whenever f'(y*) = 0, linear stability stalls—marking a non-hyperbolic bifurcation tipping point! In Module 4.2, second-order inertia turns monotonous phase lines into damped and resonant oscillations.",
          },
          labs: [
            {
              id: "lab-4-1-2a",
              slug: "autonomous-phase-line-bifurcation",
              title: "1D Autonomous Phase Line & Saddle-Node Bifurcation Lab",
              componentKey: "AutonomousPhaseLineLab",
              summary:
                "Identify stable attractors, unstable repellers, and semi-stable equilibria.",
              formulaLatex: "f(y^*) = 0,\\; f'(y^*) < 0",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-4-2",
      slug: "second-order-oscillations",
      numberLabel: "4.2",
      title: "Second-Order Linear ODEs & Oscillations",
      description:
        "Characteristic roots in the complex plane, underdamped/critically-damped/overdamped regimes, and forced resonance.",
      accentHex: "#8D9FCE",
      chapters: [
        {
          id: "4.2.1",
          slug: "damped-harmonic-oscillators",
          title: "Harmonic Oscillators: Undamped, Underdamped & Overdamped",
          subtitle:
            "Couple the complex characteristic root plane s₁,₂ with live mass-spring-damper time responses, decay envelopes, and (x, v) phase orbits.",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["3.1.10", "4.1.2"],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
          keyEquationsLatex: [
            "m\\ddot{x} + c\\dot{x} + kx = 0 \\implies s^2 + 2\\zeta\\omega_n s + \\omega_n^2 = 0",
            "\\zeta = \\frac{c}{2\\sqrt{mk}}, \\qquad s_{1,2} = -\\zeta\\omega_n \\pm \\omega_n\\sqrt{\\zeta^2 - 1}",
          ],
          engineeringContext:
            "Automotive suspension shock absorbers, MEMS accelerometer damping, seismic building isolators, and series/parallel RLC circuit transients (L, R, 1/C).",
          pedagogicalRhythm: {
            question:
              "How does the dimensionless damping ratio ζ steer characteristic roots s₁,₂ in the complex plane—turning perpetual oscillation into decaying ringing or fast non-overshooting return?",
            labInteraction:
              "Scrub mass m, damping c, and stiffness k across ζ < 1, ζ = 1, and ζ > 1 while watching the roots trace the semicircular arc |s| = ω_n, collide at -ω_n, and split along the negative real axis.",
            symbolicFormalizationLatex:
              "x(t) = \\begin{cases} e^{-\\zeta\\omega_n t}(A\\cos\\omega_d t + B\\sin\\omega_d t) & \\zeta < 1 \\\\ (c_1 + c_2 t)e^{-\\omega_n t} & \\zeta = 1 \\\\ c_1 e^{s_1 t} + c_2 e^{s_2 t} & \\zeta > 1 \\end{cases}",
            edgeCasesAndBridge:
              "At ζ = 1, the double root produces the secular factor t·e^(-ω_n t), giving fastest return without overshoot. Next, Chapter 4.2.2 adds periodic external forcing F₀cos(ωt) to unlock beats and resonance.",
          },
          labs: [
            {
              id: "lab-4-2-1a",
              slug: "damping-ratio-root-locus",
              title: "Damping Ratio ζ Scrubber & Characteristic Root Plane Lab",
              componentKey: "HarmonicOscillatorLab",
              summary:
                "Scrub damping ratio ζ across <1, =1, and >1 while watching roots move from imaginary axis to real axis.",
              formulaLatex: "s_{1,2} = -\\zeta\\omega_n \\pm \\omega_n\\sqrt{\\zeta^2 - 1}",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "4.2.2",
          slug: "forced-oscillations-resonance",
          title: "Forced Oscillations, Beats & Resonance Frequency Response",
          subtitle:
            "Sweep driving frequency ω against natural frequency ω_n to observe acoustic beats, secular blowup, 90° phase lag, and resonant amplitude peaks.",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["4.2.1"],
          dimensionBadge: "2D",
          accentHex: "#B95869",
          keyEquationsLatex: [
            "m\\ddot{x} + c\\dot{x} + kx = F_0\\cos(\\omega t), \\qquad |H(i\\omega)| = \\frac{1/k}{\\sqrt{(1 - (\\omega/\\omega_n)^2)^2 + (2\\zeta\\omega/\\omega_n)^2}}",
            "\\omega_{\\text{res}} = \\omega_n\\sqrt{1 - 2\\zeta^2} \\quad (\\zeta < 1/\\sqrt{2}), \\qquad \\phi(\\omega) = \\operatorname{atan2}(2\\zeta r,\\; 1 - r^2)",
          ],
          engineeringContext:
            "Bridge structural wind-load resonance (Tacoma Narrows), RF bandpass filter Q-factor tuning, vibration isolation mounts, and acoustic beats.",
          pedagogicalRhythm: {
            question:
              "When an oscillator is pushed periodically at frequency ω, why do small mismatches create slow beats while viscous friction shifts peak amplitude below ω_n?",
            labInteraction:
              "Click anywhere on the Bode amplitude curve or scrub ω and ζ to switch smoothly between acoustic beats, unbounded t·sin(ω_n t) resonance, sharp high-Q peaks, and flat damped isolation.",
            symbolicFormalizationLatex:
              "x(t) = x_h(t) + x_p(t), \\qquad x_p(t) = \\frac{F_0}{m}|H(i\\omega)|\\cos(\\omega t - \\phi(\\omega))",
            edgeCasesAndBridge:
              "When ζ ≥ 1/√2 ≈ 0.707, 1 - 2ζ² ≤ 0 eliminates the resonance peak completely! Next, Module 4.3 generalizes single oscillators to 2D coupled linear and nonlinear phase-plane systems.",
          },
          labs: [
            {
              id: "lab-4-2-2a",
              slug: "resonance-bode-amplitude",
              title: "Forced Resonance Gain & Phase Lag Inspector",
              componentKey: "ForcedResonanceLab",
              summary:
                "Synchronized time-domain waveform and steady-state amplitude-frequency response curve.",
              formulaLatex: "\\omega_{\\text{res}} = \\omega_n\\sqrt{1 - 2\\zeta^2}",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-4-3",
      slug: "phase-plane-systems",
      numberLabel: "4.3",
      title: "Systems of ODEs & Phase Plane Portraits",
      description:
        "Trace-determinant classification of 2D linear systems, eigenvector manifolds, nullclines, and nonlinear limit cycles.",
      accentHex: "#029091",
      chapters: [
        {
          id: "4.3.1",
          slug: "linear-phase-portraits",
          title: "2D Linear Phase Portraits: Nodes, Saddles, Spirals & Centers",
          subtitle:
            "Drag a point in the Trace-Determinant (τ, Δ) parabola diagram to morph the (x, y) phase portrait in real time.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["2.3.1", "4.2.1"],
          dimensionBadge: "Dual 2D",
          accentHex: "#029091",
          keyEquationsLatex: [
            "\\dot{\\mathbf{x}} = A\\mathbf{x}, \\qquad \\lambda^2 - \\tau\\lambda + \\Delta = 0",
            "\\tau = \\operatorname{tr}(A), \\quad \\Delta = \\det(A)",
          ],
          labs: [
            {
              id: "lab-4-3-1a",
              slug: "poincare-trace-det-explorer",
              title: "Poincaré Trace-Determinant Plane & Live Phase Portrait Lab",
              componentKey: "TraceDeterminantPhaseLab",
              summary:
                "Explore stable/unstable nodes, saddles, spirals, and centers across Δ = τ²/4.",
              formulaLatex: "\\lambda_{1,2} = \\frac{\\tau \\pm \\sqrt{\\tau^2 - 4\\Delta}}{2}",
              dimensionBadge: "Dual 2D",
            },
          ],
        },
        {
          id: "4.3.2",
          slug: "nonlinear-nullclines-limit-cycles",
          title: "Nonlinear Stability, Nullclines & Limit Cycles",
          subtitle:
            "Linearize nonlinear pendulum, Lotka-Volterra, and Van der Pol oscillators around equilibria using the Jacobian matrix.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["3.2.4", "4.3.1"],
          dimensionBadge: "2D",
          accentHex: "#D35323",
          keyEquationsLatex: [
            "\\dot{x} = f(x,y),\\; \\dot{y} = g(x,y) \\implies J(x^*,y^*) = \\frac{\\partial(f,g)}{\\partial(x,y)}",
          ],
          labs: [
            {
              id: "lab-4-3-2a",
              slug: "nullcline-limit-cycle-lab",
              title: "Nullcline Intersection & Van der Pol Limit Cycle Explorer",
              componentKey: "NonlinearPhasePortraitLab",
              summary:
                "Toggle x-nullclines (dx/dt = 0) and y-nullclines (dy/dt = 0) and inspect self-sustained oscillations.",
              formulaLatex: "\\ddot{x} - \\mu(1 - x^2)\\dot{x} + x = 0",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-4-4",
      slug: "partial-differential-equations",
      numberLabel: "4.4",
      title: "Partial Differential Equations (Heat & Wave Equations)",
      description:
        "Separation of variables, Fourier eigenmodes, diffusive curvature smoothing in the Heat Equation, and characteristic wave propagation.",
      accentHex: "#B95869",
      chapters: [
        {
          id: "4.4.1",
          slug: "heat-equation-diffusion",
          title: "The 1D/2D Heat Equation & Diffusive Smoothing",
          subtitle:
            "See why ∂u/∂t = α ∇²u damps high-frequency spatial jaggedness exponentially faster than fundamental modes.",
          status: "planned",
          estimatedMinutes: 35,
          prerequisites: ["3.1.2", "4.2.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#B95869",
          keyEquationsLatex: [
            "\\frac{\\partial u}{\\partial t} = \\alpha \\nabla^2 u",
            "u(x,t) = \\sum_{n=1}^{\\infty} b_n e^{-\\alpha (n\\pi/L)^2 t}\\sin\\!\\left(\\frac{n\\pi x}{L}\\right)",
          ],
          labs: [
            {
              id: "lab-4-4-1a",
              slug: "heat-diffusion-surface-3d",
              title: "3D Thermal Diffusion Evolution & Curvature Rate Inspector",
              componentKey: "HeatEquationDiffusionLab",
              summary:
                "Play time evolution t ≥ 0 from step, triangular, or custom initial temperature profiles.",
              formulaLatex: "u_t = \\alpha u_{xx}",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "4.4.2",
          slug: "wave-equation-normal-modes",
          title: "The Wave Equation, Normal Modes & D'Alembert's Solution",
          subtitle:
            "Compare standing-wave normal modes on strings and 2D membranes against traveling left/right D'Alembert pulses.",
          status: "planned",
          estimatedMinutes: 35,
          prerequisites: ["4.4.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#029091",
          keyEquationsLatex: [
            "\\frac{\\partial^2 u}{\\partial t^2} = c^2 \\nabla^2 u",
            "u(x,t) = \\frac{1}{2}\\big[f(x - ct) + f(x + ct)\\big]",
          ],
          labs: [
            {
              id: "lab-4-4-2a",
              slug: "wave-dalembert-membrane-3d",
              title: "D'Alembert Traveling Pulse & 3D Drumhead Chladni Mode Lab",
              componentKey: "WaveEquationModesLab",
              summary:
                "Inspect 1D pulse superposition and 2D rectangular/circular membrane eigenmodes (m, n).",
              formulaLatex: "u_{tt} = c^2(u_{xx} + u_{yy})",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
      ],
    },
  ],
};
