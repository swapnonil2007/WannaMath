import { VolumeMetadata } from "./types";

export const VOL_STATISTICS: VolumeMetadata = {
  id: "vol-stat",
  volumeNumber: "S",
  slug: "statistics",
  title: "Interactive Statistics: Foundations to Inference",
  shortTitle: "Statistics",
  accentToken: "--math-var-x",
  accentHex: "#8D9FCE",
  description:
    "A complete first-principles journey through statistics: from visualizing raw data, center, and spread to probability axioms, Bayes' theorem, the Central Limit Theorem, confidence intervals, hypothesis testing, ANOVA, regression, and Bayesian inference.",
  engineeringApplications: [
    "Exploratory Data Analysis (EDA), Quality Control & Anomaly Detection",
    "A/B Testing, Experimental Power & Clinical/Product Decision Theory",
    "Signal-to-Noise Decomposition (ANOVA), Regression & Regularization",
    "Bayesian Belief Updating & Nonparametric Bootstrap Uncertainty",
  ],
  modules: [
    {
      id: "mod-s-1",
      slug: "descriptive-statistics",
      numberLabel: "S.1",
      title: "Descriptive Statistics & Exploratory Data Analysis",
      description:
        "Learn how to see the story hidden in raw numbers: classifying data types, choosing honest histogram bins, balancing center against outliers, and measuring spread with IQR and Bessel-corrected variance.",
      accentHex: "#8D9FCE",
      chapters: [
        {
          id: "S.1.1",
          slug: "data-types-histograms-eda",
          title: "Data Types, Histograms, Binning & Empirical Distributions",
          subtitle:
            "Turn a messy list of raw measurements into a clear visual shape—and see how bin width and density scaling shape what your eyes notice.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: [],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
          engineeringContext:
            "Manufacturing tolerance histograms, web-latency distribution profiling, and identifying multimodal regimes before fitting any model.",
          pedagogicalRhythm: {
            question:
              "If someone hands you 100 raw test scores or response times, why does staring at a table fail—and how can changing a histogram's bin width either reveal a hidden second peak or create fake spikes?",
            labInteraction:
              "Switch among Symmetric, Skewed, Bimodal, and Outlier datasets (or click to add your own points), scrub bin count k and KDE bandwidth h, and toggle Frequency vs. Density scaling.",
            symbolicFormalizationLatex:
              "\\text{Density}_j = \\frac{n_j}{n \\cdot \\Delta x}, \\qquad \\sum_{j=1}^{k} \\text{Density}_j \\cdot \\Delta x = 1",
            edgeCasesAndBridge:
              "Very wide bins hide bimodal peaks, while ultra-narrow bins turn noise into jagged teeth. Once you can see a distribution's shape, Chapter S.1.2 asks: which single number best marks its center?",
          },
          keyEquationsLatex: [
            "\\text{Density}_j = \\frac{\\text{Count}_j}{n \\cdot \\Delta x}, \\qquad \\sum_{j=1}^{k} (\\text{Density}_j \\cdot \\Delta x) = 1",
            "\\hat{f}_h(x) = \\frac{1}{n h} \\sum_{i=1}^{n} K\\!\\left(\\frac{x - x_i}{h}\\right)",
          ],
          labs: [
            {
              id: "lab-s-1-1a",
              slug: "histogram-binning-kde-explorer",
              title: "Interactive Histogram Binning, Density & KDE Shape Explorer",
              componentKey: "HistogramBinningShapeLab",
              summary:
                "Add or inspect sample observations, scrub bin count k ∈ [3, 24] and KDE bandwidth h, and compare count histograms, area-1 density histograms, and cumulative ogives.",
              formulaLatex: "\\text{Area}_j = \\text{Density}_j \\cdot \\Delta x = \\frac{n_j}{n}",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "S.1.2",
          slug: "central-tendency-mean-median-mode",
          title: "Measures of Center: Mean, Median, Mode & Outlier Leverage",
          subtitle:
            "See the arithmetic mean as a physical balance fulcrum on a seesaw—and discover why a single extreme outlier drags the mean while leaving the median unmoved.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["S.1.1"],
          dimensionBadge: "2D",
          accentHex: "#029091",
          engineeringContext:
            "Why household income, housing prices, and server latency SLAs rely on medians and trimmed means instead of raw arithmetic averages.",
          pedagogicalRhythm: {
            question:
              "If a billionaire walks into a coffee shop of 20 students, everyone's 'average' net worth jumps into the millions—yet nobody got richer. Why is the mean so vulnerable, while the median stays calm?",
            labInteraction:
              "Click on the seesaw beam to drop weights, drag the Persimmon outlier across [0, 25], and watch the Mean fulcrum, Median marker, and squared-vs-absolute error curves respond live.",
            symbolicFormalizationLatex:
              "\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i = \\arg\\min_{c} \\sum_{i=1}^{n}(x_i - c)^2, \\qquad \\text{Med} = \\arg\\min_{c} \\sum_{i=1}^{n}|x_i - c|",
            edgeCasesAndBridge:
              "In right-skewed data, the tail pulls Mean > Median > Mode. Yet two neighborhoods can share the exact same Mean and Median while having wildly different spreads—leading directly to Chapter S.1.3.",
          },
          keyEquationsLatex: [
            "\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i \\quad\\Longleftrightarrow\\quad \\sum_{i=1}^{n}(x_i - \\bar{x}) = 0",
            "L_2(c) = \\sum_{i=1}^{n}(x_i - c)^2 \\;\\text{(Mean)}, \\qquad L_1(c) = \\sum_{i=1}^{n}|x_i - c| \\;\\text{(Median)}",
          ],
          labs: [
            {
              id: "lab-s-1-2a",
              slug: "mean-median-seesaw-balance",
              title: "Center-of-Mass Seesaw & L1/L2 Loss Minimizer Lab",
              componentKey: "MeanMedianSeesawLab",
              summary:
                "Drop weights onto a physical balance beam, drag an outlier to watch lever-arm torque shift the mean, and compare L2 squared error vs. L1 absolute error.",
              formulaLatex: "\\sum_{i=1}^{n} (x_i - \\bar{x}) = 0",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "S.1.3",
          slug: "dispersion-variance-iqr-boxplots",
          title: "Spread, Variance (n − 1 Bessel's Correction), Boxplots & Skewness",
          subtitle:
            "Measure consistency and risk with deviation squares, interquartile boxplots, and a live sampling simulator proving why sample variance divides by n − 1.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["S.1.1", "S.1.2"],
          dimensionBadge: "2D",
          accentHex: "#D35323",
          engineeringContext:
            "Six-Sigma process capability, sensor noise standard deviation, financial return volatility, and automated IQR outlier flagging.",
          pedagogicalRhythm: {
            question:
              "Why can't we just average the signed distances (xᵢ − x̄) to measure spread—and why do textbooks insist on dividing sample variance by n − 1 instead of n?",
            labInteraction:
              "Inspect literal geometric squares of side |xᵢ − x̄| above an aligned Tukey boxplot, then run the Bessel Bias Simulator to compare average n-divisor vs. (n−1)-divisor estimates across repeated small samples.",
            symbolicFormalizationLatex:
              "s^2 = \\frac{1}{n - 1}\\sum_{i=1}^{n}(x_i - \\bar{x})^2, \\qquad \\text{IQR} = Q_3 - Q_1",
            edgeCasesAndBridge:
              "Sample mean x̄ hugs its own sample slightly closer than the true population μ, shrinking ∑(xᵢ − x̄)² by (n−1)/n on average. With descriptive summaries mastered, Module S.2 builds the probability laws behind random data.",
          },
          keyEquationsLatex: [
            "s^2 = \\frac{1}{n-1}\\sum_{i=1}^{n}(x_i - \\bar{x})^2, \\qquad s = \\sqrt{s^2}",
            "\\text{Outliers}: \\; x < Q_1 - 1.5\\,\\text{IQR} \\;\\lor\\; x > Q_3 + 1.5\\,\\text{IQR}",
          ],
          labs: [
            {
              id: "lab-s-1-3a",
              slug: "spread-boxplot-bessel-simulator",
              title: "Deviation Squares, Tukey Boxplot & Bessel (n − 1) Simulator",
              componentKey: "SpreadBoxplotBesselLab",
              summary:
                "Visualize variance as literal average square area alongside a 1.5×IQR boxplot, then simulate repeated samples to watch 1/(n−1) eliminate bias.",
              formulaLatex: "\\mathbb{E}\\!\\left[\\frac{1}{n-1}\\sum_{i=1}^{n}(X_i - \\bar{X})^2\\right] = \\sigma^2",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-s-2",
      slug: "probability-foundations-discrete",
      numberLabel: "S.2",
      title: "Probability Foundations, Bayes' Theorem & Discrete Laws",
      description:
        "Build probability from visual area and set logic: Kolmogorov's axioms, why disjoint ≠ independent, Bayes' belief updating with frequency grids, and Binomial/Poisson counting laws.",
      accentHex: "#96B898",
      chapters: [
        {
          id: "S.2.1",
          slug: "sample-spaces-venn-axioms",
          title: "Sample Spaces, Events, Set Operations & Kolmogorov Axioms",
          subtitle:
            "See probability as normalized area inside a unit sample space—and resolve the classic confusion between mutually exclusive and independent events.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["S.1.1"],
          dimensionBadge: "2D",
          accentHex: "#96B898",
          engineeringContext:
            "Fault-tree reliability for redundant aircraft sensors and parallel vs. series system failure probabilities.",
          pedagogicalRhythm: {
            question:
              "If two events A and B can never happen at the same time (disjoint), does that make them independent—or maximally dependent?",
            labInteraction:
              "Adjust P(A), P(B), and overlap P(A ∩ B) inside a unit-area sample space, toggle Boolean set expressions, and verify Inclusion–Exclusion vs. Independence.",
            symbolicFormalizationLatex:
              "P(A \\cup B) = P(A) + P(B) - P(A \\cap B), \\qquad A \\perp B \\iff P(A \\cap B) = P(A)P(B)",
            edgeCasesAndBridge:
              "Whenever P(A) > 0 and P(B) > 0, disjointness forces P(A ∩ B) = 0 ≠ P(A)P(B): knowing A happened guarantees B did NOT! Next, Chapter S.2.2 formalizes how new evidence updates probability.",
          },
          keyEquationsLatex: [
            "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)",
            "P(A^c) = 1 - P(A), \\qquad P(\\Omega) = 1",
          ],
          labs: [
            {
              id: "lab-s-2-1a",
              slug: "venn-unit-area-axioms",
              title: "Unit-Area Venn Sample Space & Independence Lab",
              componentKey: "VennProbabilityAreaLab",
              summary:
                "Manipulate event areas and overlaps to test set algebra, Inclusion–Exclusion, and independence vs. disjointness.",
              formulaLatex: "P(A \\cap B) = P(A)P(B)",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "S.2.2",
          slug: "conditional-probability-bayes-theorem",
          title: "Conditional Probability, Tree Diagrams & Bayes' Theorem Intuition",
          subtitle:
            "Watch conditioning shrink the entire universe to what actually happened—and see why rare conditions make positive tests surprising.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["S.2.1"],
          dimensionBadge: "2D",
          accentHex: "#D5658B",
          engineeringContext:
            "Medical diagnostics, email spam classification, sensor anomaly filtering, and forensic evidence evaluation.",
          pedagogicalRhythm: {
            question:
              "If a medical test is 95% accurate and you test positive for a 1%-prevalence condition, why is your real chance of having it nowhere near 95%?",
            labInteraction:
              "Adjust disease prevalence P(H), sensitivity P(E|H), and false-positive rate P(E|Hᶜ) across a 1,000-person frequency mosaic and synchronized probability tree.",
            symbolicFormalizationLatex:
              "P(H \\mid E) = \\frac{P(E \\mid H)P(H)}{P(E \\mid H)P(H) + P(E \\mid H^c)P(H^c)}",
            edgeCasesAndBridge:
              "Base-rate neglect confuses P(E|H) with P(H|E). Next, Chapter S.2.3 tracks discrete counts and waiting times generated by repeated random trials.",
          },
          keyEquationsLatex: [
            "P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}, \\qquad P(H \\mid E) = \\frac{P(E \\mid H)P(H)}{P(E)}",
          ],
          labs: [
            {
              id: "lab-s-2-2a",
              slug: "bayes-frequency-mosaic-tree",
              title: "1,000-Person Frequency Grid & Bayes' Tree Explorer",
              componentKey: "BayesMosaicTreeLab",
              summary:
                "Visualize prior prevalence, true positives, and false positives as concrete counts in a unit square and probability tree.",
              formulaLatex: "P(H \\mid E) = \\frac{\\text{True Positives}}{\\text{All Positives}}",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "S.2.3",
          slug: "discrete-distributions-binomial-poisson",
          title: "Discrete Random Variables: Bernoulli, Binomial, Geometric & Poisson",
          subtitle:
            "Drop balls through a Galton pegboard to connect coin flips, waiting times, and rare-event Poisson arrivals.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["S.2.1", "S.2.2"],
          dimensionBadge: "2D",
          accentHex: "#029091",
          engineeringContext:
            "Packet loss bursts, manufacturing defect counts, radioactive decay arrivals, and A/B conversion counts.",
          pedagogicalRhythm: {
            question:
              "How do simple yes/no coin flips build the Binomial bell—and why does Binomial morph seamlessly into the Poisson law when trials are huge and events are rare?",
            labInteraction:
              "Simulate beads dropping through a Galton pegboard, adjust n and p (or arrival rate λ), and overlay Binomial(n, p) directly onto Poisson(np).",
            symbolicFormalizationLatex:
              "P(X = k) = \\binom{n}{k}p^k(1-p)^{n-k} \\xrightarrow{n\\to\\infty,\\; np=\\lambda} \\frac{\\lambda^k e^{-\\lambda}}{k!}",
            edgeCasesAndBridge:
              "Discrete PMFs assign probability to individual spikes; in Module S.3, smooth continuous measurements replace bars with curves and reveal the Central Limit Theorem.",
          },
          keyEquationsLatex: [
            "P(X = k) = \\binom{n}{k}p^k(1-p)^{n-k}, \\qquad P(Y = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}",
          ],
          labs: [
            {
              id: "lab-s-2-3a",
              slug: "galton-board-discrete-laws",
              title: "Galton Pegboard, Binomial & Poisson Limit Lab",
              componentKey: "GaltonBoardDiscreteLab",
              summary:
                "Animate Galton board drops and compare theoretical PMFs and step-CDFs across Bernoulli, Binomial, Geometric, and Poisson laws.",
              formulaLatex: "\\mathbb{E}[X] = np, \\quad \\operatorname{Var}(X) = np(1-p)",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-s-3",
      slug: "sampling-central-limit-theorem",
      numberLabel: "S.3",
      title: "Continuous Laws, Sampling & The Central Limit Theorem",
      description:
        "Bridge raw samples to universal sampling laws: Z-scores and Q-Q normality diagnostics, animated LLN and Central Limit Theorem convergence, and exact t, χ², and F distributions.",
      accentHex: "#029091",
      chapters: [
        {
          id: "S.3.1",
          slug: "normal-distribution-z-scores-68-95-997",
          title: "The Normal Bell Curve, Z-Scores, 68–95–99.7 Rule & Q-Q Plots",
          subtitle:
            "Turn any Normal measurement into unitless standard deviations from the mean—and learn to spot fat tails or skew on a Q-Q plot.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["S.1.3", "S.2.3"],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
          engineeringContext:
            "Standardized grading, sensor calibration tolerances, process capability indices, and normality residual diagnostics.",
          pedagogicalRhythm: {
            question:
              "How can one universal Z-table answer probabilities for SAT scores, bolt diameters, and human heights—and how do Q-Q plots warn us when data isn't Normal at all?",
            labInteraction:
              "Drag [a, b] bounds on X ~ N(μ, σ²), watch them map onto Z ~ N(0, 1), and test Normal vs. Skewed vs. Heavy-Tailed samples on a live Normal Q-Q plot.",
            symbolicFormalizationLatex:
              "Z = \\frac{X - \\mu}{\\sigma} \\sim \\mathcal{N}(0, 1), \\qquad P(|X-\\mu| \\le k\\sigma) \\approx 68.3\\%,\\; 95.4\\%,\\; 99.7\\%",
            edgeCasesAndBridge:
              "Real-world measurements are often skewed—yet Chapter S.3.2 reveals why their sample averages still converge to a Normal bell!",
          },
          keyEquationsLatex: [
            "Z = \\frac{X - \\mu}{\\sigma}, \\qquad f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{1}{2}((x-\\mu)/\\sigma)^2}",
          ],
          labs: [
            {
              id: "lab-s-3-1a",
              slug: "normal-z-score-qq-diagnostics",
              title: "Standardization (X ↔ Z) & Normal Q-Q Plot Lab",
              componentKey: "NormalZScoreQQPlotLab",
              summary:
                "Explore the 68-95-99.7 rule, map raw intervals to Z-scores, and read S-curves and bends on an interactive Normal Q-Q diagnostic plot.",
              formulaLatex: "Z = \\frac{X - \\mu}{\\sigma}",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "S.3.2",
          slug: "law-of-large-numbers-central-limit-theorem",
          title: "The Law of Large Numbers (LLN) & The Central Limit Theorem (CLT)",
          subtitle:
            "Watch sample averages from skewed, uniform, and U-shaped populations morph into a tight Gaussian bell at speed 1/√n.",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["S.1.2", "S.3.1"],
          dimensionBadge: "2D",
          accentHex: "#029091",
          engineeringContext:
            "Why Monte Carlo estimates converge, why election polling margins shrink with √n, and why sum-of-errors noise looks Gaussian.",
          pedagogicalRhythm: {
            question:
              "If individual wait times are heavily right-skewed, why do the averages of 30 wait times suddenly line up in a symmetric bell curve?",
            labInteraction:
              "Pick a non-normal parent (Exponential, Uniform, U-Shaped, Bimodal), adjust sample size n, click 'Draw 1' or 'Simulate 1,000', and track both LLN running-mean stability and the CLT bell.",
            symbolicFormalizationLatex:
              "\\bar{X}_n \\xrightarrow{p} \\mu \\;(\\text{LLN}), \\qquad \\frac{\\bar{X}_n - \\mu}{\\sigma/\\sqrt{n}} \\xrightarrow{d} \\mathcal{N}(0, 1) \\;(\\text{CLT})",
            edgeCasesAndBridge:
              "To cut Standard Error σ/√n in half, you must quadruple sample size n! Next, Chapter S.3.3 shows what happens when σ itself is unknown and must be estimated from the sample.",
          },
          keyEquationsLatex: [
            "\\operatorname{SE}(\\bar{X}) = \\frac{\\sigma}{\\sqrt{n}}, \\qquad \\bar{X}_n \\approx \\mathcal{N}\\!\\left(\\mu,\\; \\frac{\\sigma^2}{n}\\right)",
          ],
          labs: [
            {
              id: "lab-s-3-2a",
              slug: "central-limit-theorem-animator",
              title: "LLN Running Mean & Central Limit Theorem Sampling Animator",
              componentKey: "CentralLimitTheoremAnimatorLab",
              summary:
                "Draw single or batched samples of size n from skewed and bimodal populations and watch sampling means tighten into N(μ, σ²/n).",
              formulaLatex: "\\operatorname{Var}(\\bar{X}_n) = \\frac{\\sigma^2}{n}",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "S.3.3",
          slug: "sampling-distributions-student-t-chi2-f",
          title: "Exact Sampling Distributions: Student's t, Chi-Square (χ²) & Fisher's F",
          subtitle:
            "See how Student's t, χ², and F emerge naturally by combining standard Normal draws when estimating means and variances.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["S.1.3", "S.3.2"],
          dimensionBadge: "2D",
          accentHex: "#D35323",
          engineeringContext:
            "Small-sample calibration tests (t), goodness-of-fit & variance intervals (χ²), and ANOVA/regression F-ratios.",
          pedagogicalRhythm: {
            question:
              "Why did William Gosset ('Student') discover wider tails when dividing (x̄ − μ) by s/√n instead of σ/√n—and how do χ² and F arise from squaring Normal errors?",
            labInteraction:
              "Switch among χ²_k, Student's t_ν vs. N(0,1), and F_{d₁,d₂}, scrub degrees of freedom, and sample live Zᵢ draws to confirm empirical histograms match the exact PDFs.",
            symbolicFormalizationLatex:
              "\\chi^2_k = \\sum_{i=1}^{k} Z_i^2, \\qquad t_\\nu = \\frac{Z}{\\sqrt{\\chi^2_\\nu/\\nu}}, \\qquad F_{d_1,d_2} = \\frac{\\chi^2_{d_1}/d_1}{\\chi^2_{d_2}/d_2}",
            edgeCasesAndBridge:
              "As ν → ∞, sample s locks onto σ and Student's t merges seamlessly into N(0,1). With all sampling distributions in place, Module S.4 enters Statistical Inference.",
          },
          keyEquationsLatex: [
            "t_\\nu = \\frac{\\bar{X} - \\mu}{S/\\sqrt{n}}, \\qquad \\chi^2_{n-1} = \\frac{(n-1)S^2}{\\sigma^2}",
          ],
          labs: [
            {
              id: "lab-s-3-3a",
              slug: "sampling-distributions-t-chi2-f",
              title: "Student's t, Chi-Square (χ²) & Fisher's F Generator Lab",
              componentKey: "SamplingDistributionsTChi2FLab",
              summary:
                "Adjust degrees of freedom (ν, k, d₁, d₂) and generate live Normal draws to build empirical t, χ², and F sampling distributions.",
              formulaLatex: "t_\\nu \\xrightarrow{\\nu\\to\\infty} \\mathcal{N}(0,1)",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-s-4",
      slug: "statistical-inference",
      numberLabel: "S.4",
      title: "Statistical Inference: Estimation, Confidence Intervals & Hypothesis Testing",
      description:
        "Use partial sample data to reason backwards about unknown populations: Maximum Likelihood Estimation, Bias–Variance tradeoffs, Confidence Interval coverage, p-values, and Statistical Power.",
      accentHex: "#D35323",
      chapters: [
        {
          id: "S.4.1",
          slug: "point-estimation-mle-bias-variance",
          title: "Point Estimation, Maximum Likelihood (MLE) & The Bias–Variance Tradeoff",
          subtitle:
            "Flip probability around: hold the observed data fixed, slide candidate parameters, and climb the Log-Likelihood peak.",
          status: "published",
          estimatedMinutes: 30,
          prerequisites: ["S.3.2"],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
          engineeringContext:
            "Parameter fitting in reliability life testing, logistic/neural cross-entropy loss, and Kalman estimation.",
          pedagogicalRhythm: {
            question:
              "When data is already collected, what makes one guess for an unknown parameter better than another—and why can a slightly biased estimator beat an unbiased one?",
            labInteraction:
              "Drag candidate θ = (μ, σ) or p across observed dots, watch point likelihood needles multiply, maximize ℓ(θ), and explore the Bias² + Variance = MSE dartboard.",
            symbolicFormalizationLatex:
              "\\hat{\\theta}_{\\text{MLE}} = \\arg\\max_{\\theta} \\sum_{i=1}^{n} \\ln f(x_i \\mid \\theta), \\qquad \\operatorname{MSE}(\\hat{\\theta}) = \\operatorname{Bias}^2 + \\operatorname{Var}",
            edgeCasesAndBridge:
              "A single point estimate hides how uncertain it is. Chapter S.4.2 wraps every estimate in a calibrated Confidence Interval.",
          },
          keyEquationsLatex: [
            "\\ell(\\theta) = \\sum_{i=1}^{n}\\ln f(x_i \\mid \\theta), \\qquad \\operatorname{MSE}(\\hat{\\theta}) = \\operatorname{Bias}(\\hat{\\theta})^2 + \\operatorname{Var}(\\hat{\\theta})",
          ],
          labs: [
            {
              id: "lab-s-4-1a",
              slug: "mle-likelihood-bias-variance",
              title: "Interactive Likelihood Climber & Bias–Variance Dartboard",
              componentKey: "MaximumLikelihoodBiasVarianceLab",
              summary:
                "Slide model parameters to maximize log-likelihood ℓ(θ) over sample points and visualize MSE = Bias² + Variance.",
              formulaLatex: "\\ell(\\theta) = \\ln L(\\theta)",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "S.4.2",
          slug: "confidence-intervals-coverage",
          title: "Confidence Intervals: Z vs. t Intervals, Margin of Error & Coverage",
          subtitle:
            "Run 100 repeated experiments at once to see what '95% confidence' truly means—it is the intervals that dance around fixed μ, not vice versa.",
          status: "published",
          estimatedMinutes: 25,
          prerequisites: ["S.3.3", "S.4.1"],
          dimensionBadge: "2D",
          accentHex: "#FBEAA4",
          engineeringContext:
            "Polling error bars (±3%), manufacturing tolerance bounds, and A/B uplift uncertainty intervals.",
          pedagogicalRhythm: {
            question:
              "Does a 95% confidence interval mean there is a 95% probability that μ jumps inside your specific interval—or something subtly deeper about the sampling procedure?",
            labInteraction:
              "Click 'Generate 100 Samples' at 80%/90%/95%/99% confidence, watch random intervals stack against true μ (green hits vs. crimson misses), and toggle Z vs. t critical multipliers.",
            symbolicFormalizationLatex:
              "\\bar{x} \\pm t_{\\alpha/2,\\, n-1}\\frac{s}{\\sqrt{n}}",
            edgeCasesAndBridge:
              "Tight intervals estimate effects accurately; next, Chapter S.4.3 tests sharp yes/no scientific claims using p-values and Statistical Power.",
          },
          keyEquationsLatex: [
            "\\text{CI}_{1-\\alpha} = \\bar{x} \\pm t_{\\alpha/2,\\, n-1}\\frac{s}{\\sqrt{n}}",
          ],
          labs: [
            {
              id: "lab-s-4-2a",
              slug: "confidence-interval-100-coverage",
              title: "100-Sample Confidence Interval Coverage Simulator",
              componentKey: "ConfidenceIntervalCoverageLab",
              summary:
                "Simulate 100 random confidence intervals simultaneously to observe empirical coverage rate, Z vs. t width, and 1/√n scaling.",
              formulaLatex: "P(\\bar{X} - \\text{ME} \\le \\mu \\le \\bar{X} + \\text{ME}) = 1 - \\alpha",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "S.4.3",
          slug: "hypothesis-testing-p-values-power",
          title: "Hypothesis Testing, p-Values, Type I/II Errors & Statistical Power",
          subtitle:
            "Balance false alarms (α) against missed discoveries (β) on overlapping H₀ and H₁ bells—and cure the #1 p-value misconception forever.",
          status: "published",
          estimatedMinutes: 35,
          prerequisites: ["S.4.2"],
          dimensionBadge: "2D",
          accentHex: "#B95869",
          engineeringContext:
            "Clinical trial sample-size calculation, quality defect alarms, and digital experiment stopping rules.",
          pedagogicalRhythm: {
            question:
              "If you get p = 0.03, does that mean there is a 3% chance the null hypothesis is true—and why can an underpowered study miss a real cure half the time?",
            labInteraction:
              "Slide true effect δ = μ₁ − μ₀, sample size n, and threshold α between overlapping H₀ and H₁ curves, then click any observed x̄ to shade its live p-value tail and Power (1 − β).",
            symbolicFormalizationLatex:
              "p = P(|\\bar{X} - \\mu_0| \\ge |\\bar{x}_{\\text{obs}} - \\mu_0| \\mid H_0), \\qquad \\text{Power} = 1 - \\beta = P(\\text{Reject } H_0 \\mid H_1)",
            edgeCasesAndBridge:
              "Statistical significance (small p) ≠ large practical effect when n is huge. Module S.5 extends these tests to comparing two groups, tables, and multiple treatments.",
          },
          keyEquationsLatex: [
            "\\alpha = P(\\text{Type I Error}), \\qquad \\beta = P(\\text{Type II Error}), \\qquad \\text{Power} = 1 - \\beta",
          ],
          labs: [
            {
              id: "lab-s-4-3a",
              slug: "hypothesis-p-value-power-overlap",
              title: "Dual-Curve H₀ vs. H₁ p-Value & Statistical Power Lab",
              componentKey: "HypothesisPowerOverlapLab",
              summary:
                "Click observed statistics to shade exact one/two-tailed p-values and inspect Type I (α), Type II (β), and Power (1−β) dynamically.",
              formulaLatex: "\\text{Power} = 1 - \\beta",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-s-5",
      slug: "group-comparisons-anova",
      numberLabel: "S.5",
      title: "Comparing Groups, Categorical Tests, Simpson's Paradox & ANOVA",
      description:
        "Move from single samples to real comparative experiments: Paired vs. Welch's two-sample t-tests, Chi-Square tables, confounding reversals in Simpson's Paradox, and Variance Decomposition (ANOVA).",
      accentHex: "#D5658B",
      chapters: [
        {
          id: "S.5.1",
          slug: "two-sample-tests-paired-welch",
          title: "Comparing Two Groups: Paired vs. Independent Welch's t-Tests & Cohen's d",
          subtitle:
            "See how pairing before-and-after measurements cancels subject-to-subject noise—and why Welch's test outperforms equal-variance pooling.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["S.4.3"],
          dimensionBadge: "2D",
          accentHex: "#8D9FCE",
          engineeringContext:
            "A/B web conversion experiments, before/after medical treatments, and fuel-additive engine comparisons.",
          pedagogicalRhythm: {
            question:
              "Why can a before-and-after paired experiment detect a tiny treatment shift that an unpaired two-group test completely misses?",
            labInteraction:
              "Toggle Paired Slopegraph vs. Independent Welch two-group distributions, drag group separation and within-group spread, and compare t, Welch df, p-value, and Cohen's d.",
            symbolicFormalizationLatex:
              "t_{\\text{Welch}} = \\frac{\\bar{X}_1 - \\bar{X}_2}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}}, \\qquad d = \\frac{\\bar{X}_1 - \\bar{X}_2}{s_{\\text{pooled}}}",
            edgeCasesAndBridge:
              "When outcomes are counts/categories rather than continuous numbers, Chapter S.5.2 introduces Chi-Square tables and the mind-bending Simpson's Paradox.",
          },
          keyEquationsLatex: [
            "t_{\\text{paired}} = \\frac{\\bar{d}}{s_d/\\sqrt{n}}, \\qquad t_{\\text{Welch}} = \\frac{\\bar{X}_1 - \\bar{X}_2}{\\sqrt{s_1^2/n_1 + s_2^2/n_2}}",
          ],
          labs: [
            {
              id: "lab-s-5-1a",
              slug: "paired-vs-welch-two-sample",
              title: "Paired Slopegraph & Independent Welch's t-Test Lab",
              componentKey: "TwoSamplePairedWelchLab",
              summary:
                "Compare paired difference cancellation against unpooled Welch two-sample t-tests, confidence intervals, and Cohen's d effect size.",
              formulaLatex: "d = \\frac{\\bar{x}_1 - \\bar{x}_2}{s_p}",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "S.5.2",
          slug: "chi-square-goodness-of-fit-independence",
          title: "Chi-Square Goodness-of-Fit, Contingency Tables & Simpson's Paradox",
          subtitle:
            "Compare observed counts against expected independence—and witness how combining two departments can completely reverse a winning rate.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["S.2.2", "S.4.3"],
          dimensionBadge: "2D",
          accentHex: "#D5658B",
          engineeringContext:
            "Loaded die / Benford fraud checks, A/B categorical conversions, and confounding bias in observational studies.",
          pedagogicalRhythm: {
            question:
              "How can Treatment A beat Treatment B inside BOTH mild and severe patient subgroups, yet lose to Treatment B when the hospital combines everyone together?",
            labInteraction:
              "Edit Observed vs. Expected contingency bars to watch Pearson χ² residuals grow, then switch to the Simpson's Paradox Reverser and slide subgroup sizes to flip the aggregated winner.",
            symbolicFormalizationLatex:
              "\\chi^2 = \\sum_{i,j} \\frac{(O_{ij} - E_{ij})^2}{E_{ij}}, \\qquad E_{ij} = \\frac{R_i C_j}{N}",
            edgeCasesAndBridge:
              "Observational totals without stratification hide confounding variables! Next, Chapter S.5.3 compares 3 or more continuous groups at once via One-Way ANOVA.",
          },
          keyEquationsLatex: [
            "\\chi^2 = \\sum \\frac{(O - E)^2}{E}, \\qquad \\text{df} = (r-1)(c-1)",
          ],
          labs: [
            {
              id: "lab-s-5-2a",
              slug: "chi-square-simpsons-paradox",
              title: "Chi-Square Contingency Cells & Simpson's Paradox Reverser",
              componentKey: "ChiSquareContingencySimpsonLab",
              summary:
                "Inspect (O − E)²/E cell contributions and dynamically reverse aggregated rates in Simpson's Paradox via subgroup weighting.",
              formulaLatex: "\\chi^2 = \\sum \\frac{(O_{ij} - E_{ij})^2}{E_{ij}}",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "S.5.3",
          slug: "one-way-anova-f-test-variance-decomposition",
          title: "One-Way ANOVA: Between vs. Within Variance & Multiple Comparisons",
          subtitle:
            "Test whether 3+ group means differ by comparing signal variance between groups against background noise variance within groups.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["S.3.3", "S.5.1"],
          dimensionBadge: "2D",
          accentHex: "#96B898",
          engineeringContext:
            "Multi-variant design optimization, agricultural yield trials, and material alloy strength comparisons.",
          pedagogicalRhythm: {
            question:
              "Why shouldn't we just run ten separate t-tests to compare 5 drugs—and why is a test of means literally named 'Analysis of Variance'?",
            labInteraction:
              "Drag group means apart (increasing MSB) and widen within-group noise (increasing MSW) to watch SST = SSB + SSW, F = MSB/MSW, and the family-wise false-positive meter.",
            symbolicFormalizationLatex:
              "\\text{SST} = \\text{SSB} + \\text{SSW}, \\qquad F = \\frac{\\text{MSB}}{\\text{MSW}} = \\frac{\\text{SSB}/(k-1)}{\\text{SSW}/(N-k)}",
            edgeCasesAndBridge:
              "ANOVA detects group differences across discrete treatments; Module S.6 models continuous predictors with Regression, Regularization, and Bayesian updating.",
          },
          keyEquationsLatex: [
            "\\sum_{i,j}(y_{ij} - \\bar{y})^2 = \\sum_i n_i(\\bar{y}_i - \\bar{y})^2 + \\sum_{i,j}(y_{ij} - \\bar{y}_i)^2",
          ],
          labs: [
            {
              id: "lab-s-5-3a",
              slug: "anova-between-within-variance",
              title: "ANOVA Between-vs-Within Variance & Multiple Testing Lab",
              componentKey: "AnovaBetweenWithinLab",
              summary:
                "Manipulate group separation and within-group jitter to decompose SST = SSB + SSW and see why multiple t-tests inflate α.",
              formulaLatex: "F = \\frac{\\text{Between-Group Variance}}{\\text{Within-Group Variance}}",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-s-6",
      slug: "regression-bayesian-advanced",
      numberLabel: "S.6",
      title: "Regression, Regularization, Bayesian Updating & Resampling",
      description:
        "Connect classical statistics to modern data science: OLS geometric squared-residual fitting, Anscombe's warning, 3D multiple regression with Ridge/Lasso geometry, Bayesian conjugate updating, and Efron's Bootstrap.",
      accentHex: "#AAA36D",
      chapters: [
        {
          id: "S.6.1",
          slug: "correlation-ols-linear-regression",
          title: "Correlation (r), OLS Linear Regression, R² & Anscombe's Quartet",
          subtitle:
            "Draw literal squared residuals to see what Least Squares minimizes—and load Anscombe's Quartet to prove why summary numbers never replace plotting.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["S.1.3", "S.5.3"],
          dimensionBadge: "2D",
          accentHex: "#029091",
          engineeringContext:
            "Sensor calibration curves, trend forecasting, and diagnosing nonlinear patterns or high-leverage anomalies in residuals.",
          pedagogicalRhythm: {
            question:
              "What makes the OLS line the 'best' line through noisy points—and how can four wildly different scatterplots share the exact same mean, r, R², and regression equation?",
            labInteraction:
              "Click or drag scatter points with live squared-residual boxes ∑eᵢ², inspect the residual diagnostic panel, toggle 95% confidence vs. prediction bands, and cycle through Anscombe's Quartet.",
            symbolicFormalizationLatex:
              "\\hat{y} = b_0 + b_1 x, \\quad b_1 = r\\frac{s_y}{s_x}, \\quad R^2 = 1 - \\frac{\\text{SSE}}{\\text{SST}}",
            edgeCasesAndBridge:
              "One predictor is rarely enough in real engineering. Chapter S.6.2 lifts lines into 3D planes and reveals how Ridge and Lasso tame correlated predictors.",
          },
          keyEquationsLatex: [
            "b_1 = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2} = r\\frac{s_y}{s_x}, \\qquad R^2 = r^2",
          ],
          labs: [
            {
              id: "lab-s-6-1a",
              slug: "ols-squares-anscombe-quartet",
              title: "OLS Squared-Residual Fit, Residual Plot & Anscombe's Quartet Lab",
              componentKey: "OLSRegressionAnscombeLab",
              summary:
                "Click/drag points with visible squared residual boxes, compare confidence vs. prediction bands, and inspect all four Anscombe datasets.",
              formulaLatex: "\\min_{b_0,b_1} \\sum_{i=1}^{n}(y_i - (b_0 + b_1 x_i))^2",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "S.6.2",
          slug: "multiple-regression-diagnostics-regularization",
          title: "Multiple Linear Regression (3D), Diagnostics & Ridge/Lasso Shrinkage",
          subtitle:
            "Fit a 3D regression plane to two predictors and see geometrically why Lasso's L₁ diamond snaps coefficients to zero while Ridge's L₂ circle shrinks smoothly.",
          status: "planned",
          estimatedMinutes: 35,
          prerequisites: ["2.2.3", "S.6.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#D35323",
          engineeringContext:
            "Multivariable predictive modeling, multicollinearity prevention, feature selection, and preventing overfitting via cross-validation.",
          pedagogicalRhythm: {
            question:
              "Why does adding correlated features blow up OLS weights—and why does changing β₁² + β₂² to |β₁| + |β₂| suddenly perform automatic feature selection?",
            labInteraction:
              "Orbit the 3D regression plane ŷ = β₀ + β₁x₁ + β₂x₂ with residual drop-lines while scrubbing regularization λ to watch RSS ellipses hit Ridge's circle vs. Lasso's sharp diamond corners.",
            symbolicFormalizationLatex:
              "\\hat{\\boldsymbol{\\beta}}_{\\text{OLS}} = (X^T X)^{-1} X^T \\mathbf{y}, \\qquad \\min_{\\boldsymbol{\\beta}} \\|\\mathbf{y} - X\\boldsymbol{\\beta}\\|_2^2 + \\lambda \\|\\boldsymbol{\\beta}\\|_p^p",
            edgeCasesAndBridge:
              "Regularization shrinks noisy estimates toward stability; our final chapter S.6.3 unites Bayesian prior-to-posterior updating with computer-age Bootstrap resampling.",
          },
          keyEquationsLatex: [
            "\\hat{\\boldsymbol{\\beta}} = (X^T X)^{-1}X^T\\mathbf{y}, \\qquad \\text{Ridge } (L_2) \\text{ vs. Lasso } (L_1)",
          ],
          labs: [
            {
              id: "lab-s-6-2a",
              slug: "multiple-regression-3d-ridge-lasso",
              title: "3D Multiple Regression Plane & Ridge/Lasso Contour Lab",
              componentKey: "MultipleRegression3DRegularizationLab",
              summary:
                "Orbit a 3D OLS plane and watch elliptical RSS contours intersect L₂ circles (Ridge) vs. L₁ diamonds (Lasso) as λ grows.",
              formulaLatex: "\\|\\mathbf{y} - X\\boldsymbol{\\beta}\\|_2^2 + \\lambda\\|\\boldsymbol{\\beta}\\|_1",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "S.6.3",
          slug: "bayesian-updating-bootstrap-mcmc",
          title: "Bayesian Conjugate Updating (Prior → Posterior) & Bootstrap Resampling",
          subtitle:
            "Watch prior beliefs update smoothly into posteriors as new data arrives—and compute confidence intervals on messy data via computer resampling.",
          status: "planned",
          estimatedMinutes: 35,
          prerequisites: ["S.2.2", "S.4.2", "S.6.1"],
          dimensionBadge: "2D",
          accentHex: "#96B898",
          engineeringContext:
            "Bayesian A/B testing, adaptive robotics belief filtering, and nonparametric confidence bounds on non-Gaussian telemetry.",
          pedagogicalRhythm: {
            question:
              "How does Bayesian statistics treat parameters as evolving belief curves—and what do you do when you have a small skewed sample and zero closed-form formula for its standard error?",
            labInteraction:
              "Toggle Beta–Binomial Bayesian Updating (adjust prior α₀, β₀ and observe coin flips live) vs. Nonparametric Bootstrap (resample with replacement 1,000 times to build empirical CIs).",
            symbolicFormalizationLatex:
              "\\operatorname{Beta}(\\alpha_0, \\beta_0) \\xrightarrow{k \\text{ hits in } n} \\operatorname{Beta}(\\alpha_0 + k,\\; \\beta_0 + n - k)",
            edgeCasesAndBridge:
              "Today's posterior becomes tomorrow's prior! Together, Bayesian updating and Bootstrap resampling complete your interactive Statistics Volume journey.",
          },
          keyEquationsLatex: [
            "p(\\theta \\mid \\text{data}) \\propto p(\\text{data} \\mid \\theta)\\,p(\\theta), \\qquad \\hat{\\theta}^*_{(0.025)} \\le \\theta \\le \\hat{\\theta}^*_{(0.975)}",
          ],
          labs: [
            {
              id: "lab-s-6-3a",
              slug: "bayesian-updating-and-bootstrap",
              title: "Beta–Binomial Bayesian Updater & 1,000-Resample Bootstrap Lab",
              componentKey: "BayesianUpdatingAndBootstrapLab",
              summary:
                "Observe Prior × Likelihood → Posterior evolution alongside nonparametric Bootstrap resampling distributions and percentile intervals.",
              formulaLatex: "p(\\theta \\mid D) \\propto L(\\theta; D)\\,p(\\theta)",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
  ],
};
