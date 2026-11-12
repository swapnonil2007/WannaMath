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
          status: "planned",
          estimatedMinutes: 25,
          prerequisites: ["1.4.2"],
          dimensionBadge: "2D + 3D",
          accentHex: "#D5658B",
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
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["3.2.4", "5.1.1"],
          dimensionBadge: "Dual 2D",
          accentHex: "#D5658B",
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
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["3.3.3", "5.1.2"],
          dimensionBadge: "2D",
          accentHex: "#B95869",
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
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["5.2.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#B95869",
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
          status: "planned",
          estimatedMinutes: 35,
          prerequisites: ["4.2.1", "5.1.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#029091",
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
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["5.3.1"],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
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
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["1.3.1", "5.1.1"],
          dimensionBadge: "2D",
          accentHex: "#96B898",
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
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["5.4.1"],
          dimensionBadge: "Dual 2D",
          accentHex: "#96B898",
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
