import { VolumeMetadata } from "./types";

export const VOL6_PROBABILITY_NUMERICAL: VolumeMetadata = {
  id: "vol-6",
  volumeNumber: "VI",
  slug: "probability-numerical-methods",
  title: "Probability, Statistics & Numerical Methods",
  shortTitle: "Probability & Numerical",
  accentToken: "--math-grid-accent",
  accentHex: "#AAA36D",
  description:
    "Stochastic modeling and computational engineering mathematics: continuous probability densities, bivariate joint distributions, covariance ellipses, Gauss-Legendre numerical quadrature, and Runge-Kutta ODE solvers.",
  engineeringApplications: [
    "Reliability Engineering, Sensor Noise & Kalman Filtering",
    "Monte Carlo Simulation & Uncertainty Quantification",
    "Gauss-Legendre Quadrature in Finite Element Stiffness Integration",
    "Runge-Kutta (RK4) Trajectory Simulation & Stability",
  ],
  modules: [
    {
      id: "mod-6-1",
      slug: "probability-distributions",
      numberLabel: "6.1",
      title: "Engineering Probability & Joint Distributions",
      description:
        "Continuous PDFs and CDFs as definite integrals, bivariate joint density surfaces f(x,y), marginal projections, and covariance ellipses.",
      accentHex: "#AAA36D",
      chapters: [
        {
          id: "6.1.1",
          slug: "continuous-pdfs-cdfs",
          title: "Continuous PDFs, CDFs & Expectation Integrals",
          subtitle:
            "Connect probability P(a ≤ X ≤ b) directly to the area under density f_X(x) and the height difference of F_X(x).",
          status: "planned",
          estimatedMinutes: 25,
          prerequisites: ["1.3.2"],
          dimensionBadge: "2D",
          accentHex: "#AAA36D",
          keyEquationsLatex: [
            "P(a \\le X \\le b) = \\int_{a}^{b} f_X(x)\\,dx = F_X(b) - F_X(a)",
            "\\mathbb{E}[X] = \\int_{-\\infty}^{\\infty} x\\,f_X(x)\\,dx",
          ],
          labs: [
            {
              id: "lab-6-1-1a",
              slug: "pdf-cdf-quantile-sweeper",
              title: "Synchronized PDF Area, CDF Curve & Moment Inspector",
              componentKey: "PDFCDFMomentLab",
              summary:
                "Explore Gaussian, Weibull, and Exponential distributions with live mean μ and variance σ².",
              formulaLatex: "F'_X(x) = f_X(x)",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "6.1.2",
          slug: "joint-bivariate-distributions",
          title: "Joint Bivariate Distributions, Marginalization & Covariance",
          subtitle:
            "Integrate 3D joint density surface f(x,y) along x or y to project marginal distributions onto coordinate walls and slice conditional densities.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["2.3.2", "3.2.1", "6.1.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#96B898",
          keyEquationsLatex: [
            "f_X(x) = \\int_{-\\infty}^{\\infty} f_{X,Y}(x,y)\\,dy, \\qquad f_{Y|X}(y|x) = \\frac{f_{X,Y}(x,y)}{f_X(x)}",
          ],
          labs: [
            {
              id: "lab-6-1-2a",
              slug: "bivariate-gaussian-marginal-3d",
              title: "3D Bivariate Gaussian Bell, Marginal Wall & Covariance Ellipse Lab",
              componentKey: "BivariateGaussianLab",
              summary:
                "Scrub correlation coefficient ρ ∈ (-1, 1) and slice conditional cross-sections.",
              formulaLatex: "\\Sigma = \\begin{bmatrix} \\sigma_x^2 & \\rho\\sigma_x\\sigma_y \\\\ \\rho\\sigma_x\\sigma_y & \\sigma_y^2 \\end{bmatrix}",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-6-2",
      slug: "numerical-methods",
      numberLabel: "6.2",
      title: "Numerical Quadrature, Root-Finding & ODE Solvers",
      description:
        "Trapezoidal, Simpson's, and Gauss-Legendre integration nodes, convergence order O(h^p), and Euler vs. RK4 trajectory stepping.",
      accentHex: "#D35323",
      chapters: [
        {
          id: "6.2.1",
          slug: "numerical-quadrature-error",
          title: "Trapezoidal, Simpson's & Gauss-Legendre Quadrature",
          subtitle:
            "Compare equispaced Newton-Cotes rules against optimal Gauss-Legendre nodes that integrate degree-(2n-1) polynomials exactly.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["1.2.4", "1.3.1"],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
          keyEquationsLatex: [
            "\\int_{-1}^{1} f(x)\\,dx \\approx \\sum_{i=1}^{n} w_i\\,f(x_i)",
          ],
          labs: [
            {
              id: "lab-6-2-1a",
              slug: "quadrature-node-comparator",
              title: "Midpoint, Trapezoidal, Simpson & Gauss-Legendre Error Lab",
              componentKey: "NumericalQuadratureLab",
              summary:
                "Compare piecewise linear, parabolic, and Legendre-node approximations and log-log error slope.",
              formulaLatex: "E_{\\text{Simpson}} = O(h^4), \\quad E_{\\text{Gauss}} = O(h^{2n})",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "6.2.2",
          slug: "runge-kutta-ode-solvers",
          title: "Euler, Heun & Runge-Kutta (RK4) Trajectory Stepping",
          subtitle:
            "Inspect the four intermediate slope probes (k₁, k₂, k₃, k₄) inside a single step h to see how RK4 achieves fourth-order accuracy.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["4.1.1", "6.2.1"],
          dimensionBadge: "2D",
          accentHex: "#D35323",
          keyEquationsLatex: [
            "y_{n+1} = y_n + \\frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)",
          ],
          labs: [
            {
              id: "lab-6-2-2a",
              slug: "rk4-four-slope-magnifying-glass",
              title: "Euler vs. Heun vs. RK4 Slope Probe Magnifier",
              componentKey: "RungeKuttaSlopeLab",
              summary:
                "Adjust step size h and zoom into a single time step [t_n, t_n + h] to compare k₁, k₂, k₃, k₄.",
              formulaLatex: "k_1 = f(t_n, y_n),\\; k_2 = f(t_n + \\tfrac{h}{2}, y_n + \\tfrac{h}{2}k_1)",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
  ],
};
