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
            "Drop initial conditions (t₀, y₀) into a slope field dy/dt = f(t, y) to trace solution curves and isoclines.",
          status: "planned",
          estimatedMinutes: 25,
          prerequisites: ["1.2.1", "1.3.2"],
          dimensionBadge: "2D",
          accentHex: "#D35323",
          keyEquationsLatex: [
            "\\frac{dy}{dt} = f(t, y), \\qquad y(t_0) = y_0",
          ],
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
            "Analyze thermal cooling, mixing tanks, and logistic equilibria via 1D phase lines and integrating factors.",
          status: "planned",
          estimatedMinutes: 25,
          prerequisites: ["4.1.1"],
          dimensionBadge: "2D",
          accentHex: "#96B898",
          keyEquationsLatex: [
            "y' + P(t)y = Q(t) \\implies \\mu(t) = e^{\\int P(t)\\,dt}",
            "\\frac{dy}{dt} = r y\\left(1 - \\frac{y}{K}\\right)",
          ],
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
            "Couple the complex characteristic root plane s₁,₂ with live mass-spring-damper time responses.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["4.1.2"],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
          keyEquationsLatex: [
            "m\\ddot{x} + c\\dot{x} + kx = 0 \\implies ms^2 + cs + k = 0",
            "\\zeta = \\frac{c}{2\\sqrt{mk}}",
          ],
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
            "Sweep driving frequency ω against natural frequency ω_n to observe acoustic beats, phase lag, and resonant amplitude peaks.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["4.2.1"],
          dimensionBadge: "2D",
          accentHex: "#B95869",
          keyEquationsLatex: [
            "m\\ddot{x} + c\\dot{x} + kx = F_0\\cos(\\omega t)",
            "|H(i\\omega)| = \\frac{1/k}{\\sqrt{(1 - (\\omega/\\omega_n)^2)^2 + (2\\zeta\\omega/\\omega_n)^2}}",
          ],
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
