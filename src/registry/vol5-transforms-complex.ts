import { VolumeMetadata } from "./types";

export const VOL5_TRANSFORMS_COMPLEX: VolumeMetadata = {
  id: "vol-5",
  volumeNumber: "V",
  slug: "transforms-complex-analysis",
  title: "Transforms & Complex Analysis",
  shortTitle: "Transforms & Complex",
  accentToken: "--math-bound-lower",
  accentHex: "#D5658B",
  description:
    "Complex analytic geometry and frequency-domain engineering: conformal mappings, Cauchy-Riemann orthogonality, contour residue integration, Laplace s-plane pole-zero surfaces, and Fourier harmonic analysis.",
  engineeringApplications: [
    "Control Theory Transfer Functions & s-Plane Root Stability",
    "Digital Signal Processing (DSP) & Spectral Filtering",
    "2D Airfoil Potential Flow via Joukowski Conformal Mapping",
    "Impedance Networks, Phasors & Diffraction Integrals",
  ],
  modules: [
    {
      id: "mod-5-1",
      slug: "complex-functions-conformal",
      numberLabel: "5.1",
      title: "Complex Numbers & Conformal Mappings",
      description:
        "Euler's formula phasors, complex mappings w = f(z), Cauchy-Riemann local angle preservation, and harmonic conjugates.",
      accentHex: "#D5658B",
      chapters: [
        {
          id: "5.1.1",
          slug: "euler-formula-complex-plane",
          title: "Complex Plane, Euler's Formula & Phasor Geometry",
          subtitle:
            "See multiplication by r e^(iθ) as simultaneous radial scaling and rotation in the Argand plane.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["1.4.2"],
          dimensionBadge: "2D + 3D",
          accentHex: "#D5658B",
          engineeringContext:
            "AC impedance phasor networks, quadrature RF I/Q modulation, quantum probability-amplitude phase evolution, and damping/oscillation envelopes.",
          pedagogicalRhythm: {
            question:
              "Why does imaginary exponentiation e^{iωt} produce circles and waves instead of blowing up like e^{σt}—and what does multiplying complex numbers look like geometrically?",
            labInteraction:
              "Play or scrub the 3D helix z(t) = A e^{(σ+iω)t} to see cosine and sine walls cast by a single rotating vector, then toggle Multiply z₁·z₂ in the 2D Argand plane.",
            symbolicFormalizationLatex:
              "e^{(\\sigma + i\\omega)t} = e^{\\sigma t}(\\color{#8D9FCE}{\\cos\\omega t} + i\\,\\color{#96B898}{\\sin\\omega t}), \\qquad z_1 z_2 = r_1 r_2 e^{i(\\theta_1 + \\theta_2)}",
            edgeCasesAndBridge:
              "Setting σ = 0 confines the spiral onto a constant cylinder; negative σ decays inward toward stability. Next, letting the full 2D plane transform under w = f(z) introduces Conformal Mappings in Chapter 5.1.2.",
          },
          keyEquationsLatex: [
            "e^{i\\theta} = \\cos\\theta + i\\sin\\theta",
            "z_1 z_2 = r_1 r_2 e^{i(\\theta_1 + \\theta_2)}",
          ],
          labs: [
            {
              id: "lab-5-1-1a",
              slug: "euler-helix-phasor",
              title: "3D Complex Exponential Helix (t, Re, Im) & Phasor Lab",
              componentKey: "EulerHelixPhasorLab",
              summary:
                "Project the 3D helix e^(iωt) onto real cos(ωt) and imaginary sin(ωt) walls.",
              formulaLatex: "e^{(\\sigma + i\\omega)t} = e^{\\sigma t}(\\cos\\omega t + i\\sin\\omega t)",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "5.1.2",
          slug: "cauchy-riemann-conformal",
          title: "Analyticity, Cauchy-Riemann Equations & Conformal Grids",
          subtitle:
            "Compare general 2D Jacobians against complex-differentiable mappings w = f(z) whose orthogonal grid curves preserve intersection angles.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["3.2.4", "5.1.1"],
          dimensionBadge: "Dual 2D",
          accentHex: "#D5658B",
          engineeringContext:
            "Joukowski airfoil aerodynamics, electrostatic Laplace boundary-value mapping, 2D incompressible potential flow streamlines, and microwave waveguide design.",
          pedagogicalRhythm: {
            question:
              "Out of all smooth 2D coordinate maps (u(x,y), v(x,y)), what extraordinary algebraic symmetry guarantees that infinitesimal squares map onto rotated, scaled squares without any shear distortion?",
            labInteraction:
              "Switch across z², e^z, 1/z, Joukowski Airfoil, and the non-analytic contrast 2x + i(y + 0.8x), clicking probes z₀ to verify 90° intersection angles and zero Cauchy–Riemann residual.",
            symbolicFormalizationLatex:
              "\\frac{\\partial u}{\\partial x} = \\frac{\\partial v}{\\partial y}, \\qquad \\frac{\\partial u}{\\partial y} = -\\frac{\\partial v}{\\partial x} \\;\\Longrightarrow\\; \\nabla u \\cdot \\nabla v = 0",
            edgeCasesAndBridge:
              "Conformality breaks at critical points where f'(z₀) = 0 (like z = 0 for z², where angles double!) or whenever Cauchy–Riemann fails. Analytic functions then power Contour Integration in Module 5.2.",
          },
          keyEquationsLatex: [
            "f(x+iy) = u(x,y) + i\\,v(x,y)",
            "\\frac{\\partial u}{\\partial x} = \\frac{\\partial v}{\\partial y}, \\qquad \\frac{\\partial u}{\\partial y} = -\\frac{\\partial v}{\\partial x}",
          ],
          labs: [
            {
              id: "lab-5-1-2a",
              slug: "conformal-grid-morpher",
              title: "Conformal Mapping Grid Morpher (z², e^z, 1/z, Joukowski)",
              componentKey: "ConformalMappingLab",
              summary:
                "Verify 90° angle preservation between level curves of u(x,y) and v(x,y).",
              formulaLatex: "f'(z) = u_x + i v_x \\ne 0",
              dimensionBadge: "Dual 2D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-5-2",
      slug: "contour-integration",
      numberLabel: "5.2",
      title: "Contour Integration & The Residue Theorem",
      description:
        "Complex path integrals ∮_C f(z) dz, homotopy path independence in punctured domains, and residue calculus around poles.",
      accentHex: "#B95869",
      chapters: [
        {
          id: "5.2.1",
          slug: "cauchy-integral-formula",
          title: "Complex Line Integrals & Cauchy's Integral Theorem",
          subtitle:
            "Deform closed contours C in the z-plane to see why ∮ f(z) dz = 0 in analytic domains but jumps by 2πi when enclosing a pole.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["3.3.5", "5.1.2"],
          dimensionBadge: "2D",
          accentHex: "#B95869",
          engineeringContext:
            "Nyquist stability criterion encirclement counts in feedback control, electromagnetic Biot–Savart complex potentials, and acoustic waveguide dispersion branches.",
          pedagogicalRhythm: {
            question:
              "Why can you stretch and wiggle a closed contour C arbitrarily in the complex plane without changing ∮ f(z) dz—unless the loop crosses a singularity?",
            labInteraction:
              "Click anywhere on the z-plane to drag contour C across poles, switch homotopy deformation or winding number (+1, +2, −1), and watch the numerical loop integral jump cleanly in multiples of 2πi f(z₀).",
            symbolicFormalizationLatex:
              "\\oint_{C} f(z)\\,dz = 0 \\;\\text{(analytic inside }C\\text{)}, \\qquad f(z_0) = \\frac{1}{2\\pi i}\\oint_{C} \\frac{f(z)}{z - z_0}\\,dz",
            edgeCasesAndBridge:
              "Enclosing two equal-and-opposite poles (±i for 1/(z²+1)) causes their residues to cancel back to zero! Next, Chapter 5.2.2 turns poles into systematic Residue Theorem calculators.",
          },
          keyEquationsLatex: [
            "\\oint_{C} f(z)\\,dz = 0, \\qquad f(z_0) = \\frac{1}{2\\pi i}\\oint_{C} \\frac{f(z)}{z - z_0}\\,dz",
          ],
          labs: [
            {
              id: "lab-5-2-1a",
              slug: "cauchy-contour-winding",
              title: "Interactive Contour Winding & Cauchy Integral Inspector",
              componentKey: "CauchyContourLab",
              summary:
                "Drag contour C across singularities and track real/imaginary parts of ∮ f(z) dz.",
              formulaLatex: "\\oint_C \\frac{dz}{z - z_0} = 2\\pi i \\cdot W(C, z_0)",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "5.2.2",
          slug: "poles-residue-theorem",
          title: "Poles, Laurent Series & The Residue Theorem",
          subtitle:
            "Sum local residues at enclosed poles inside a contour to evaluate improper real integrals effortlessly.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["5.2.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#B95869",
          engineeringContext:
            "Inverse Laplace Bromwich integration, quantum scattering amplitude poles, improper Fourier transform integrals, and signal-processing filter synthesis.",
          pedagogicalRhythm: {
            question:
              "How can a single coefficient a₋₁ in the Laurent expansion around each pole collapse an entire boundary integral ∮ f(z) dz—and even solve real improper integrals ∫_{-∞}^∞ f(x) dx?",
            labInteraction:
              "Orbit the 3D pole-chimney landscape |f(z)| while repositioning the 2D contour or toggling the Upper-Half-Plane semicircle to sum enclosed Laurent residues.",
            symbolicFormalizationLatex:
              "\\oint_{C} f(z)\\,dz = 2\\pi i \\sum_{z_k \\in \\operatorname{int}(C)} \\operatorname{Res}(f, z_k), \\qquad \\operatorname{Res}\\!\\left(f, z_0\\right) = a_{-1}",
            edgeCasesAndBridge:
              "For higher-order poles of order m, pure 1/(z−z₀)^m loops integrate to 0 unless lower-order terms exist via derivatives of (z−z₀)^m f(z). Module 5.3 applies these poles directly to Laplace Transforms.",
          },
          keyEquationsLatex: [
            "\\oint_{C} f(z)\\,dz = 2\\pi i \\sum_{k} \\operatorname{Res}(f, z_k)",
          ],
          labs: [
            {
              id: "lab-5-2-2a",
              slug: "residue-pole-summation",
              title: "Complex Modulus Pole Surface |f(z)| & Residue Summing Lab",
              componentKey: "ResidueTheoremLab",
              summary:
                "Inspect 3D pole chimneys |f(z)| and enclose subsets of poles with contour C.",
              formulaLatex: "\\operatorname{Res}(f, z_0) = a_{-1}",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-5-3",
      slug: "laplace-transforms",
      numberLabel: "5.3",
      title: "Laplace Transforms & s-Plane Poles/Zeros",
      description:
        "Complex frequency s = σ + iω, 3D transfer function magnitude surfaces |F(s)|, Regions of Convergence, and impulse/step dynamics.",
      accentHex: "#029091",
      chapters: [
        {
          id: "5.3.1",
          slug: "s-plane-poles-zeros",
          title: "The s-Plane Surface, Poles/Zeros & Region of Convergence",
          subtitle:
            "Slice the 3D surface |F(σ + iω)| along the imaginary axis σ = 0 to reveal how nearby poles sculpt the frequency response.",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["4.2.1", "5.1.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#029091",
          engineeringContext:
            "PID flight control root-locus tuning, analog/IIR Butterworth and Chebyshev filter synthesis, MEMS accelerometer damping, and RLC impedance analysis.",
          pedagogicalRhythm: {
            question:
              "Where does the Bode frequency-response curve |H(iω)| come from geometrically—and why does a single pole crossing Re(s) > 0 destabilize an LTI system?",
            labInteraction:
              "Click anywhere on the 2D s-plane to drag conjugate poles σ_p ± iω_p and toggle a real zero while watching the 3D |H(s)| tent, its gold σ = 0 Bode ridge, ROC shading, and h(t) morph instantaneously.",
            symbolicFormalizationLatex:
              "F(s) = \\mathcal{L}\\{f(t)\\} = \\int_{0}^{\\infty} f(t)e^{-(\\sigma + i\\omega)t}\\,dt, \\qquad \\text{Stable} \\iff \\text{ROC} \\supset i\\omega",
            edgeCasesAndBridge:
              "Pulling σ_p → 0⁻ causes a needle-sharp resonant spike on the jω slice; pushing σ_p > 0 excludes the imaginary axis from the ROC so h(t) blows up. Next, Chapter 5.3.2 reveals why multiplying H(s)X(s) equals time-domain convolution.",
          },
          keyEquationsLatex: [
            "F(s) = \\mathcal{L}\\{f(t)\\} = \\int_{0}^{\\infty} f(t)e^{-st}\\,dt, \\qquad s = \\sigma + i\\omega",
          ],
          labs: [
            {
              id: "lab-5-3-1a",
              slug: "s-plane-3d-pole-tent",
              title: "3D s-Plane Pole-Zero Tent Surface & jω Bode Slicer",
              componentKey: "LaplaceSPlane3DLab",
              summary:
                "Drag poles (×) and zeros (○) in the s-plane and inspect 3D |F(s)|, step response, and Bode plot.",
              formulaLatex: "H(s) = K\\frac{\\prod (s - z_i)}{\\prod (s - p_j)}",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "5.3.2",
          slug: "impulse-response-convolution",
          title: "Impulse Response, Step Response & Convolution Integral",
          subtitle:
            "Slide flipped kernel h(t - τ) across input x(τ) to visualize the convolution integral (x * h)(t) step by step.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["5.3.1"],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
          engineeringContext:
            "Audio room-impulse reverb, camera Gaussian optical blur, matched radar pulse detection, and LTI circuit zero-state transient response.",
          pedagogicalRhythm: {
            question:
              "Why do we flip the impulse kernel backward in dummy time τ and slide it past t to compute the causal output of a linear time-invariant filter?",
            labInteraction:
              "Animate or scrub evaluation time t to watch h(t − τ) sweep over x(τ), shade their instantaneous product overlap, and accumulate the output waveform y(t).",
            symbolicFormalizationLatex:
              "(x * h)(t) = \\int_{0}^{t} x(\\tau)\\,h(t - \\tau)\\,d\\tau \\;\\longleftrightarrow\\; Y(s) = X(s)H(s)",
            edgeCasesAndBridge:
              "When an input sharp step enters a first-order RC exponential kernel, corners smooth out cleanly into 1 − e^{-at}. Module 5.4 specializes this Laplace jω-axis slice into Fourier Series & Transforms.",
          },
          keyEquationsLatex: [
            "(x * h)(t) = \\int_{0}^{t} x(\\tau)\\,h(t - \\tau)\\,d\\tau \\;\\longleftrightarrow\\; X(s)H(s)",
          ],
          labs: [
            {
              id: "lab-5-3-2a",
              slug: "convolution-flip-slide",
              title: "Interactive Flip-and-Slide Convolution Accumulator",
              componentKey: "ConvolutionFlipSlideLab",
              summary:
                "Scrub time t to watch overlap area ∫ x(τ)h(t-τ) dτ trace the output waveform.",
              formulaLatex: "y(t) = \\int_0^t x(\\tau)h(t-\\tau)\\,d\\tau",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-5-4",
      slug: "fourier-analysis",
      numberLabel: "5.4",
      title: "Fourier Series & Fourier Transforms",
      description:
        "Orthogonal harmonic synthesis, Gibbs overshoot at discontinuities, and continuous time-frequency duality.",
      accentHex: "#96B898",
      chapters: [
        {
          id: "5.4.1",
          slug: "fourier-series-gibbs",
          title: "Orthogonal Harmonics, Epicycles & Gibbs Phenomenon",
          subtitle:
            "Build square, sawtooth, and triangle waves from N sinusoids and inspect the 9% Gibbs overshoot near jump discontinuities.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["1.3.1", "5.1.1"],
          dimensionBadge: "2D",
          accentHex: "#96B898",
          engineeringContext:
            "Digital audio harmonic synthesis, JPEG/MP3 spectral compression, JPEG blocking ringing artifacts, and structural harmonic resonance balancing.",
          pedagogicalRhythm: {
            question:
              "Why do sine and cosine harmonics form perpendicular basis axes for periodic signals—and why does a ~9% Gibbs spike refuse to vanish near sudden jumps?",
            labInteraction:
              "Scrub harmonic count N ∈ [1, 45] across Square, Sawtooth, Triangle, and 25% Duty Pulse waveforms while spinning the rotating epicycle chain.",
            symbolicFormalizationLatex:
              "f(t) \\sim \\frac{a_0}{2} + \\sum_{n=1}^{N} \\big(a_n\\cos(n\\omega_0 t) + b_n\\sin(n\\omega_0 t)\\big), \\qquad \\|f\\|_2^2 = \\text{Parseval}",
            edgeCasesAndBridge:
              "Notice that continuous Triangle waves decay at O(1/n²) with zero Gibbs overshoot, whereas jump-discontinuous Square waves decay at O(1/n) and lock at ~8.95% peak overshoot. Chapter 5.4.2 opens the period T → ∞ to reach the continuous Fourier Transform.",
          },
          keyEquationsLatex: [
            "f(t) \\sim \\frac{a_0}{2} + \\sum_{n=1}^{N} \\big(a_n\\cos(n\\omega_0 t) + b_n\\sin(n\\omega_0 t)\\big)",
          ],
          labs: [
            {
              id: "lab-5-4-1a",
              slug: "fourier-harmonic-synthesizer",
              title: "Fourier Harmonic Synthesizer, Spectrum & Gibbs Inspector",
              componentKey: "FourierSeriesGibbsLab",
              summary:
                "Scrub harmonic count N ∈ [1, 50] and inspect orthogonal inner-product coefficients.",
              formulaLatex: "c_n = \\frac{1}{T}\\int_0^T f(t)e^{-in\\omega_0 t}\\,dt",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "5.4.2",
          slug: "fourier-transform-spectra",
          title: "Continuous Fourier Transform & Time-Frequency Uncertainty",
          subtitle:
            "Wrap signal f(t) around the origin in the complex plane at winding frequency ω to see why narrow pulses have wide spectra.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["5.4.1"],
          dimensionBadge: "Dual 2D",
          accentHex: "#96B898",
          engineeringContext:
            "5G OFDM spectrum allocation, radar chirp Doppler resolution, MRI k-space image reconstruction, and quantum Heisenberg position-momentum duality.",
          pedagogicalRhythm: {
            question:
              "How does winding a continuous signal f(t) around the complex origin detect hidden frequencies—and why does squeezing a pulse narrower in time force its spectrum wider?",
            labInteraction:
              "Sweep winding frequency ω or click any peak in |f̂(ω)| to watch the winding coil's gold center of mass jump outward, then vary pulse width a to test Δt · Δω ≥ 1/2.",
            symbolicFormalizationLatex:
              "\\hat{f}(\\omega) = \\int_{-\\infty}^{\\infty} f(t)e^{-i\\omega t}\\,dt, \\qquad \\Delta t \\cdot \\Delta \\omega \\ge \\frac{1}{2}",
            edgeCasesAndBridge:
              "This completes Volume V (Transforms & Complex Analysis)! From Euler helices and Cauchy residues to Laplace s-planes and Fourier duality, time and frequency now form one unified lens.",
          },
          keyEquationsLatex: [
            "\\hat{f}(\\omega) = \\int_{-\\infty}^{\\infty} f(t)e^{-i\\omega t}\\,dt",
            "\\Delta t \\cdot \\Delta \\omega \\ge \\frac{1}{2}",
          ],
          labs: [
            {
              id: "lab-5-4-2a",
              slug: "fourier-winding-centroid",
              title: "Complex Winding Machine & Time-Bandwidth Duality Lab",
              componentKey: "FourierTransformWindingLab",
              summary:
                "Track center-of-mass of f(t)e^(-iωt) as winding frequency ω sweeps.",
              formulaLatex: "\\mathcal{F}\\{f(a t)\\} = \\frac{1}{|a|}\\hat{f}\\!\\left(\\frac{\\omega}{a}\\right)",
              dimensionBadge: "Dual 2D",
            },
          ],
        },
      ],
    },
  ],
};
