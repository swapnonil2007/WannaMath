# Statistics Volume — Interactive Statistics: Foundations to Advanced Inference (`statistics`)

> **Status:** `in-progress` (`12/18` Chapters Published — Phases 1–4 Complete; **Phase 5 Ready for Hydrogen**) — Full 6-Phase Plan in [`STATISTICS_PLAN.md`](./STATISTICS_PLAN.md)
> **Canonical Route Base:** `/statistics/[module]/[chapter]`
> **Navbar Placement:** Dedicated **`Statistics TOC`** drawer placed beside the untouched **`6-Volume TOC`** drawer in `src/components/layout/Navbar.tsx`.

## Module & Chapter Build Index (6 Modules • 18 Chapters • 18 Interactive Labs)

1. **Module S.1 (`descriptive-statistics`) — Descriptive Statistics & Exploratory Data Analysis** *(Phase 1 — Published)*
   - `S.1.1`: Data Types, Histograms, Binning & Empirical Distributions (`data-types-histograms-eda` → `HistogramBinningShapeLab`) *(Published)*
   - `S.1.2`: Measures of Center: Mean, Median, Mode & Outlier Leverage (`central-tendency-mean-median-mode` → `MeanMedianSeesawLab`) *(Published)*
   - `S.1.3`: Spread, Variance ($n-1$ Bessel's Correction), Boxplots & Z-Outliers (`dispersion-variance-iqr-boxplots` → `SpreadBoxplotBesselLab`) *(Published)*

2. **Module S.2 (`probability-foundations-discrete`) — Probability Foundations, Bayes' Theorem & Discrete Laws** *(Phase 2 — Published)*
   - `S.2.1`: Sample Spaces, Events, Set Operations & Kolmogorov Axioms (`sample-spaces-venn-axioms` → `VennProbabilityAreaLab`) *(Published)*
   - `S.2.2`: Conditional Probability, Tree Diagrams & Bayes' Theorem Intuition (`conditional-probability-bayes-theorem` → `BayesMosaicTreeLab`) *(Published)*
   - `S.2.3`: Discrete Random Variables: Bernoulli, Binomial, Geometric & Poisson (`discrete-distributions-binomial-poisson` → `GaltonBoardDiscreteLab`) *(Published)*

3. **Module S.3 (`sampling-central-limit-theorem`) — Continuous Laws, Sampling & The Central Limit Theorem** *(Phase 3 — Published)*
   - `S.3.1`: The Normal Bell Curve, $Z$-Scores, 68–95–99.7 Rule & Q-Q Plots (`normal-distribution-z-scores-68-95-997` → `NormalZScoreQQPlotLab`) *(Published)*
   - `S.3.2`: The Law of Large Numbers (LLN) & The Central Limit Theorem (CLT) (`law-of-large-numbers-central-limit-theorem` → `CentralLimitTheoremAnimatorLab`) *(Published)*
   - `S.3.3`: Exact Sampling Distributions: Student's $t$, Chi-Square ($\chi^2$) & Fisher's $F$ (`sampling-distributions-student-t-chi2-f` → `SamplingDistributionsTChi2FLab`) *(Published)*

4. **Module S.4 (`statistical-inference`) — Statistical Inference: Estimation, Confidence Intervals & Hypothesis Testing** *(Phase 4 — Published)*
   - `S.4.1`: Point Estimation, Maximum Likelihood (MLE) & The Bias–Variance Tradeoff (`point-estimation-mle-bias-variance` → `MaximumLikelihoodBiasVarianceLab`) *(Published)*
   - `S.4.2`: Confidence Intervals: $Z$ vs. $t$ Intervals, Margin of Error & Coverage Meaning (`confidence-intervals-coverage` → `ConfidenceIntervalCoverageLab`) *(Published)*
   - `S.4.3`: Hypothesis Testing, $p$-Values, Type I/II Errors & Statistical Power (`hypothesis-testing-p-values-power` → `HypothesisPowerOverlapLab`) *(Published)*

5. **Module S.5 (`group-comparisons-anova`) — Comparing Groups, Categorical Tests, Simpson's Paradox & ANOVA** *(Phase 5)*
   - `S.5.1`: Comparing Two Groups: Paired vs. Independent Welch's $t$-Tests & Cohen's $d$ (`two-sample-tests-paired-welch` → `TwoSamplePairedWelchLab`) *(Planned)*
   - `S.5.2`: Chi-Square Goodness-of-Fit, Contingency Tables & Simpson's Paradox (`chi-square-goodness-of-fit-independence` → `ChiSquareContingencySimpsonLab`) *(Planned)*
   - `S.5.3`: One-Way ANOVA: Between vs. Within Variance ($F$-Test) & Multiple Comparisons (`one-way-anova-f-test-variance-decomposition` → `AnovaBetweenWithinLab`) *(Planned)*

6. **Module S.6 (`regression-bayesian-advanced`) — Regression, Regularization, Bayesian Updating & Resampling** *(Phase 6)*
   - `S.6.1`: Correlation ($r$), OLS Linear Regression, $R^2$ & Anscombe's Quartet (`correlation-ols-linear-regression` → `OLSRegressionAnscombeLab`) *(Planned)*
   - `S.6.2`: Multiple Linear Regression (3D Plane), Diagnostics & Ridge/Lasso Shrinkage (`multiple-regression-diagnostics-regularization` → `MultipleRegression3DRegularizationLab`) *(Planned)*
   - `S.6.3`: Bayesian Conjugate Updating (Prior $\to$ Posterior) & Bootstrap Resampling (`bayesian-updating-bootstrap-mcmc` → `BayesianUpdatingAndBootstrapLab`) *(Planned)*
