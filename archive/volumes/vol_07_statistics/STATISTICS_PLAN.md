# Statistics Volume (`statistics`) — 6-Phase Master Plan & Workflow

> **Scope:** Build and publish a standalone, beginner-friendly-to-advanced **Statistics Volume** (**Volume S: Interactive Statistics — From Foundations to Advanced Inference**, route `/statistics`, Accent: `#8D9FCE` Periwinkle Slate) alongside the existing 6-Volume Engineering Mathematics textbook.
> **6-Volume TOC Invariant:** The existing **6-Volume TOC** (`TEXTBOOK_VOLUMES`: Volumes I–VI and `TextbookSidebar.tsx`) remains **100% untouched**. A dedicated **`StatisticsSidebar.tsx`** (`Statistics TOC`) button and `<dialog>` drawer sits right beside `6-Volume TOC` in `Navbar.tsx` and operates identically.
> **Registry Target:** `src/registry/vol-statistics.ts`
> **Visualization Directory:** `src/components/visualizations/statistics/`
> **Workflow Model:** **Argon (Orchestrator)** authors the phasewise plan; **Hydrogen** implements one phase at a time with full verification (`npx tsc --noEmit` + `npm run build`) and clean git commit/push per phase.
> **Status:** Phase 0 Blueprint Complete — Ready for **Phase 1 (Hydrogen)**.

---

## 1. Architectural Invariants & Navbar Integration

1. **6-Volume TOC Untouched:**
   - `TEXTBOOK_VOLUMES` (`VOL1_SINGLE_VARIABLE` through `VOL6_PROBABILITY_NUMERICAL`) and `getTocVolumes()` in `src/registry/index.ts` remain strictly the 6 Engineering Mathematics volumes (`I`–`VI`).
   - `src/components/layout/TextbookSidebar.tsx` (`6-Volume TOC` button, drawer header `"Engineering Mathematics Volumes I–VI"`, and footer count) remains **100% untouched**.
2. **Navbar Placement & Identical Drawer Behavior (`StatisticsSidebar.tsx`):**
   - Create `src/components/layout/StatisticsSidebar.tsx` modeled directly on `TextbookSidebar.tsx`:
     - Trigger button labeled **`Statistics TOC`** placed immediately beside `6-Volume TOC` inside `src/components/layout/Navbar.tsx` (using e.g. `BarChart3` or `TrendingUp` Lucide icon in `--math-ink-x` / `#8D9FCE`, matching the exact `min-h-[36px] px-2.5 sm:px-3 py-1.5 border border-[var(--border-strong)] bg-[var(--bg-canvas)]` styling).
     - Opens a native `<dialog>` slide-over sheet (`4-Tier Textbook Index • Vol → Mod → Ch → Lab`, header `"Interactive Statistics Volume (S.1–S.6)"`) with:
       - Volume header link to `/statistics` (`VOL. S` badge + live published count).
       - Collapsible/expanded module tree for Modules `S.1`–`S.6` linking to `/statistics/[module]` and every chapter `/statistics/[module]/[chapter]` with `LIVE` / `Clock` status indicators.
       - Footer showing module & chapter counts + link to `/statistics`.
   - Pass `statisticsVolume: TocVolumeItem` from `src/app/layout.tsx` (`getStatisticsTocVolume()`) into `<Navbar tocVolumes={tocVolumes} statisticsVolume={statisticsVolume} />`.
   - Keep the existing `Navbar.tsx` clean and responsive (on very narrow screens `< sm`, verify button wrapping/spacing never overflows horizontally).
3. **Registry & 4-Tier Routing (`/[volume]/[module]/[chapter]`):**
   - Author `VOL_STATISTICS: VolumeMetadata` in `src/registry/vol-statistics.ts`:
     - `id: "vol-stat"`, `volumeNumber: "S"`, `slug: "statistics"`, `title: "Interactive Statistics: Foundations to Inference"`, `shortTitle: "Statistics"`, `accentToken: "--math-var-x"`, `accentHex: "#8D9FCE"`.
   - In `src/registry/index.ts`:
     - `getTocVolumes()` returns strictly `TEXTBOOK_VOLUMES` (`VOL1`–`VOL6`) so `TextbookSidebar`, `HomePage` 6-Volume cards, and `Footer` 6-Volume index stay strictly 6-volume unless scoped appropriately.
     - Add `getStatisticsVolume(): VolumeMetadata` and `getStatisticsTocVolume(): TocVolumeItem`.
     - Include `VOL_STATISTICS` in `getAllVolumes()` (or `getAllSearchableVolumes()` used by `getVolumeBySlug`, `getModuleBySlugs`, `getChapterBySlugs`, `getChapterById`, `getAllResolvedChapters`, `sitemap.ts`, and `generateStaticParams` in `[volume]`, `[volume]/[module]`, `[volume]/[module]/[chapter]`).
     - **Important Scoping Check:** Verify `HomePage` (`src/app/page.tsx`), `Footer.tsx`, and `RoadmapPage` (`src/app/roadmap/page.tsx`) explicitly use `TEXTBOOK_VOLUMES` (or `getTextbookVolumes()`) for the `"6-Volume"` section so the 6-volume section/TOC stays untouched, while `[volume]`, `[volume]/[module]`, `[volume]/[module]/[chapter]`, `sitemap.ts`, and `llms-full.txt` resolve `/statistics/...` statically!
     - **Adjacent Chapter Chain (`getAdjacentChapters`):** Scope `getAdjacentChapters(chapterIdOrSlug)` so Chapters `1.1.1`–`6.2.2` chain sequentially within `TEXTBOOK_VOLUMES`, and Statistics chapters `S.1.1`–`S.6.3` chain sequentially within `VOL_STATISTICS` (never spilling from `6.2.2` into `S.1.1` or vice versa).
     - **TopicPageShell Footer Fallback:** When `next` is `null` inside `VOL_STATISTICS`, link cleanly back to `/statistics` (`Explore All Statistics Modules`) rather than `/roadmap`.
4. **Butterfly Palette & Visual Invariants (Zero Gradients):**
   - Strictly follow `archive/02_DESIGN_SYSTEM_TOKENS.md`: zero multi-stop gradients, flat elevated panels (`--bg-panel`, `--bg-canvas`, `1px` crisp `--border-subtle`/`--border-strong`), WCAG AA adaptive ink via `getAdaptiveAccentInk()`, `Newsreader` prose, `KaTeX` math, `IBM Plex Sans` UI, `JetBrains Mono` `tabular-nums` numerical telemetry, and `role="img"` / `aria-label` on every SVG chart.
   - **Semantic Color Assignment for Statistics:**
     - `#8D9FCE` (Periwinkle): Raw observed sample data, histograms, empirical dots, null distribution $H_0$, primary variable $X$.
     - `#96B898` (Sage Green): Theoretical model/PDF curve, alternative distribution $H_1$, explained variance (SSM / regression fit), posterior curve.
     - `#029091` (Deep Teal): Sample mean $\bar{x}$, test statistic readout, OLS line/plane, 3D likelihood/regression surface.
     - `#D35323` (Persimmon): Active dragged outlier/data point, rejection critical threshold ($\alpha$), pivot handle, residual spikes.
     - `#FBEAA4` (Buttermilk Cream): IQR box / confidence interval band, shaded $p$-value / probability area, coverage hit indicator.
     - `#B95869` / `#D5658B` (Crimson / Dusty Rose): Type I ($\alpha$) & Type II ($\beta$) error tails, missed confidence intervals, high-leverage/residual diagnostics.
     - `#AAA36D` (Olive Gold): Median, population ground-truth parameter ($\mu, \theta$), reference grid lines, prior distribution.

---

## 2. Pedagogical Standard ("First-Timer Friendly & Deep")

Every Statistics chapter (`S.1.1`–`S.6.3`) is written for a learner encountering the topic for the very first time *and* scales smoothly to mathematical rigor:

1. **Step 1 — Plain-English Story & Real-World Hook:**
   - Start with an everyday intuition (e.g., home prices & billionaires for Mean vs. Median, medical screening tests for Bayes' Theorem, factory bolts or dice for CLT) before writing a single Greek letter.
2. **Step 2 — Interactive Animative Laboratory (`src/components/visualizations/statistics/`):**
   - Tactile, exploratory mechanics: click on the SVG axis to add/remove points, drag an outlier slider in real time, step through animated sampling (`Draw 1`, `Draw 25`, `Simulate 500`, `Reset`), and watch multiple linked views update simultaneously with zero layout jitter.
   - Reuse shared primitives (`SvgCoordinatePlane2D`, `ThreeOrbitViewport`, `demandRenderLoop`, `createParametricSurfaceMesh`, `gammaReal`, `KaTeXMath`) wherever applicable, plus build clean reusable statistical helper utilities in `src/components/visualizations/statistics/statMath.ts` (normal PDF/CDF/inverse-CDF, student-$t$, $\chi^2$, $F$, incomplete beta/gamma, PRNG seeded sampler, OLS/QR solver) as modules grow.
3. **Step 3 — "Why Does This Formula Work?" Unpacking & Worked Micro-Example:**
   - Dedicated structured tutorial section inside `src/app/[volume]/[module]/[chapter]/page.tsx` breaking down:
     - **Symbol-by-symbol translation** of the governing `<KaTeXMath />` formula in plain English.
     - **First-principles "Why?" explanation** (e.g., *Why square deviations instead of absolute values? Why divide sample variance by $n-1$? Why does Bayes flip conditional probabilities? Why does $\sigma/\sqrt{n}$ shrink with square root of $n$?*).
     - **Tiny Concrete Worked Example** (3–5 numbers computed step-by-step so a beginner can verify the lab readout by hand).
4. **Step 4 — Paradoxes, Common Traps & Bridge to Next Chapter:**
   - Explicitly warn against common statistical pitfalls (outlier pull, base-rate neglect, prosecutor's fallacy, $p$-value misinterpretation, Simpson's Paradox, Anscombe's Quartet, overfitting) and connect smoothly to the next chapter.

---

## 3. Complete 6-Phase Implementation Roadmap (6 Modules, 18 Chapters, 18 Labs)

### Phase 1 — Infrastructure + Module S.1: Descriptive Statistics & Exploratory Data Analysis (`descriptive-statistics`)
- **Infrastructure & Navbar:**
  - Create `src/registry/vol-statistics.ts` registering all 6 modules (`S.1`–`S.6`) and all 18 chapters (`S.1.1`–`S.1.3` `'published'`, `S.2.1`–`S.6.3` `'planned'`).
  - Create `src/components/layout/StatisticsSidebar.tsx` and mount it directly beside `<TextbookSidebar />` in `src/components/layout/Navbar.tsx`.
  - Wire `getStatisticsTocVolume()`, `getStatisticsVolume()`, and `/statistics` static generation in `src/registry/index.ts`, `src/app/layout.tsx`, `src/app/[volume]/page.tsx`, `src/app/[volume]/[module]/page.tsx`, `src/app/[volume]/[module]/[chapter]/page.tsx`, `src/components/layout/TopicPageShell.tsx`, and `src/app/sitemap.ts` while leaving the 6-Volume TOC untouched.
  - Add foundational `src/components/visualizations/statistics/statMath.ts` utilities.
- **Chapters & Interactive Labs:**
  1. **`S.1.1` (`data-types-histograms-eda`) — Data Types, Histograms, Binning & Distribution Shapes:**
     - **Lab (`HistogramBinningShapeLab.tsx`):** Preset datasets (Exam Scores, Skewed Household Income, Bimodal Commute Times, Symmetric Sensor Readings, plus click-to-add custom points); scrub histogram **bin width / bin count** ($k \in [3, 25]$) and **KDE bandwidth $h$** to see how bad binning hides bimodal peaks or invents noise; toggle rug plot & cumulative ogive.
     - **Guide:** Nominal/Ordinal/Discrete/Continuous taxonomy; Frequency vs. Density histograms ($\text{height} = \text{count}/(n \cdot \Delta x)$ so area $= 1$); Skewness & Modality visual taxonomy.
  2. **`S.1.2` (`central-tendency-mean-median-mode`) — Measures of Center: Mean, Median, Mode & Outlier Leverage:**
     - **Lab (`MeanMedianSeesawLab.tsx`):** Interactive **Center-of-Mass Balance Beam (Seesaw)** (`SvgCoordinatePlane2D`); click to drop/remove data weights on the beam, drag a single outlier weight dynamically, toggle **Trimmed Mean** ($10\%/20\%$), and compare **Mean** (balance fulcrum $\sum x_i / n$), **Median** (50th-percentile middle rank), and **Mode** (tallest peak) plus live L2 vs. L1 deviation bars showing why Mean minimizes $\sum (x_i - c)^2$ while Median minimizes $\sum |x_i - c|$.
     - **Guide:** Why Mean is a physical lever arm, why Median resists billionaires, Mean < Median vs. Mean > Median skewness sign rule, and 5-number worked calculation.
  3. **`S.1.3` (`dispersion-variance-iqr-boxplots`) — Spread, Variance ($n-1$ Bessel's Correction), Boxplots & Z-Outliers:**
     - **Lab (`SpreadBoxplotBesselLab.tsx`):** Synchronized dot plot + **1.5×IQR Whisker Boxplot** + **Deviation Squares Canvas** (literal squares of area $(x_i - \bar{x})^2$ around the mean); switch **Sample ($n-1$) vs. Population ($n$)** and run an animated **Bessel Bias Simulator** sampling groups of size $n$ from a known $\sigma^2$ population to visually prove why dividing by $n$ systematically underestimates variance while $n-1$ hits $\sigma^2$ on average!
     - **Guide:** Range & IQR vs. Variance & SD; why we square before averaging; crystal-clear degrees-of-freedom ($n-1$) explanation; $1.5\times\text{IQR}$ fence rule vs. $Z$-score outliers; Empirical Skewness & Excess Kurtosis.

---

### Phase 2 — Module S.2: Probability Foundations, Bayes' Theorem & Discrete Laws (`probability-foundations-discrete`)
- **Chapters & Interactive Labs:**
  1. **`S.2.1` (`sample-spaces-venn-axioms`) — Sample Spaces, Events, Set Operations & Kolmogorov Axioms:**
     - **Lab (`VennProbabilityAreaLab.tsx`):** Interactive **Unit-Area Sample Space & Venn Diagram** ($P(\Omega)=1$): drag circle sizes/overlap ($P(A), P(B), P(A \cap B)$), click Boolean operation buttons ($A \cup B$, $A \cap B$, $A^c$, $A \setminus B$, $(A \cup B)^c$), inspect **Inclusion–Exclusion** strip decomposition $P(A \cup B) = P(A) + P(B) - P(A \cap B)$, and test **Independent** vs. **Mutually Exclusive** presets to break the #1 beginner confusion ("Disjoint events with positive probability are maximally dependent!").
     - **Guide:** Outcomes vs. Events; Kolmogorov's 3 Axioms; De Morgan's Laws; Independence ($P(A \cap B)=P(A)P(B)$) vs. Disjointness ($P(A \cap B)=0$).
  2. **`S.2.2` (`conditional-probability-bayes-theorem`) — Conditional Probability, Tree Diagrams & Bayes' Theorem:**
     - **Lab (`BayesMosaicTreeLab.tsx`):** Dual **Frequency Grid (1,000-Person Icon Array / Unit-Square Mosaic)** + **Probability Tree**; presets for Medical Screening (1% prevalence, 95% sensitivity, 5% false positive), Spam Filtering, and Quality Control; adjust Prior $P(H)$, Sensitivity $P(E \mid H)$, and False-Positive Rate $P(E \mid H^c)$ to watch the sample space shrink to the conditioning row $E$ and highlight how rare priors create surprising false-positive shares!
     - **Guide:** Conditioning as "zooming into a new universe"; Law of Total Probability; step-by-step Bayes' rule derivation from $P(A \cap B) = P(A\mid B)P(B) = P(B\mid A)P(A)$; Base-Rate Fallacy & Prosecutor's Fallacy.
  3. **`S.2.3` (`discrete-distributions-binomial-poisson`) — Discrete Random Variables: Bernoulli, Binomial, Geometric & Poisson:**
     - **Lab (`GaltonBoardDiscreteLab.tsx`):** Animated **Galton Bean-Machine / PMF & CDF Simulator** across **Bernoulli($p$)**, **Binomial($n, p$)**, **Geometric($p$)** (waiting time to first success), and **Poisson($\lambda$)** (rare events limit); toggle **Binomial vs. Poisson Overlay** when $n$ is large and $p$ is small ($\lambda = np$); watch beads drop into histogram bins while empirical frequencies converge to theoretical PMF bars and step-function CDF.
     - **Guide:** PMF vs. step-CDF; Binomial coefficients $\binom{n}{k}$ as paths on Pascal's grid; Memorylessness of Geometric waiting; Law of Rare Events ($n\to\infty, np=\lambda$); Expected Value $\mathbb{E}[X]$ and Variance $\operatorname{Var}(X)$ formulas.

---

### Phase 3 — Module S.3: Continuous Laws, Sampling & The Central Limit Theorem (`sampling-central-limit-theorem`)
- **Chapters & Interactive Labs:**
  1. **`S.3.1` (`normal-distribution-z-scores-68-95-997`) — The Normal Bell Curve, Z-Scores, 68–95–99.7 Rule & Q-Q Plots:**
     - **Lab (`NormalZScoreQQPlotLab.tsx`):** Synchronized **Raw $X \sim \mathcal{N}(\mu, \sigma^2)$ Curve**, **Standardized $Z \sim \mathcal{N}(0,1)$ Curve**, and **Interactive Normal Q-Q Plot**; drag interval handles $[x_1, x_2]$ or toggle $1\sigma / 2\sigma / 3\sigma$ bands to see exact shaded mass (68.27%, 95.45%, 99.73%), and switch sample presets (Normal, Heavy-Tailed Cauchy/t, Right-Skewed Exponential, Bimodal) to learn how S-curves and upward/downward bends in a Q-Q plot diagnose non-normality!
     - **Guide:** Standardization $Z = (X - \mu)/\sigma$ as unit-free ruler; reading cumulative areas; diagnosing skewness & fat tails via Quantile–Quantile geometry.
  2. **`S.3.2` (`law-of-large-numbers-central-limit-theorem`) — Law of Large Numbers (LLN) & The Central Limit Theorem (CLT):**
     - **Lab (`CentralLimitTheoremAnimatorLab.tsx`):** Choose wildly non-normal **Parent Populations** (Uniform, Exponential Skewed, U-Shaped Arcsine, Bimodal Dice, Discrete Skewed); adjust sample size $n \in [1, 50]$ and click **Draw 1 Sample** (watching $n$ dots drop from the parent curve and their $\bar{x}$ fall into the lower histogram), **Draw 50**, or **Simulate 1,000**; overlay theoretical $\mathcal{N}(\mu, \sigma^2/n)$ to watch the sampling distribution tighten by $1/\sqrt{n}$ and morph into a Gaussian bell regardless of parent shape! Plus running-mean LLN path tracker.
     - **Guide:** Population Distribution vs. One Sample vs. Sampling Distribution of $\bar{X}$ (the #1 distinction in statistics); why Standard Error is $\sigma/\sqrt{n}$ (not $\sigma/n$); LLN vs. CLT; when CLT fails (infinite-variance Cauchy / extreme skew with tiny $n$).
  3. **`S.3.3` (`sampling-distributions-student-t-chi2-f`) — Exact Sampling Distributions: Student's t, Chi-Square ($\chi^2$) & Fisher's F:**
     - **Lab (`SamplingDistributionsTChi2FLab.tsx`):** Tabbed/overlay explorer showing how squaring, dividing, and estimating $\sigma$ from Gaussian draws $Z_i \sim \mathcal{N}(0,1)$ generates: (a) **$\chi^2_k = \sum_{i=1}^k Z_i^2$**, (b) **Student's $t_\nu = Z/\sqrt{\chi^2_\nu / \nu}$** overlaid against $\mathcal{N}(0,1)$ highlighting heavy tails at small $\nu$, and (c) **Fisher's $F_{d_1, d_2} = (\chi^2_{d_1}/d_1)/(\chi^2_{d_2}/d_2)$**; includes live empirical sampler generating $Z_i$ draws and plotting histograms right onto the analytic PDFs.
     - **Guide:** Why replacing known $\sigma$ with noisy sample $s$ widens tails from $Z$ to $t$; physical meaning of degrees of freedom ($\nu, d_1, d_2$); why $\chi^2$ and $F$ are strictly non-negative and right-skewed.

---

### Phase 4 — Module S.4: Statistical Inference: Estimation, Confidence Intervals & Hypothesis Testing (`statistical-inference`)
- **Chapters & Interactive Labs:**
  1. **`S.4.1` (`point-estimation-mle-bias-variance`) — Point Estimation, Maximum Likelihood (MLE) & Bias–Variance Tradeoff:**
     - **Lab (`MaximumLikelihoodBiasVarianceLab.tsx`):** Interactive **Likelihood Explorer + Dartboard Tradeoff**; place/generate data points and drag candidate parameter $(\hat{\mu}, \hat{\sigma})$ or Bernoulli $\hat{p}$ while watching data-point height needles $\prod f(x_i \mid \theta)$ and the live **Log-Likelihood Curve $\ell(\theta)$** peak directly at the MLE! Includes an interactive **Bias² + Variance = MSE Dartboard** showing why unbiased doesn't always beat low-variance.
     - **Guide:** Likelihood vs. Probability ("data fixed, parameter varies"); why we maximize $\ln L(\theta)$; Estimator properties (Unbiasedness, Consistency, Efficiency); Bias–Variance decomposition $\text{MSE} = \text{Bias}^2 + \text{Var}$.
  2. **`S.4.2` (`confidence-intervals-coverage`) — Confidence Intervals: Z vs. t Intervals, Margin of Error & Coverage:**
     - **Lab (`ConfidenceIntervalCoverageLab.tsx`):** Classic **100-Interval Coverage Simulator**: set true $\mu$, sample size $n$, confidence level ($80\%, 90\%, 95\%, 99\%$), and toggle $Z$ ($\sigma$ known) vs. $t$ ($s$ estimated); click **Generate 100 Samples** to watch 100 horizontal intervals stack vertically against the vertical true $\mu$ line—green/sage when capturing $\mu$, crimson when missing! Displays running empirical hit rate ($\approx 95\%$) and dynamic Margin of Error formula breakdown.
     - **Guide:** Anatomy $\text{Estimate} \pm (\text{Critical Value})(\text{SE})$; the crucial frequentist meaning ("95% of repeated intervals capture fixed $\mu$, NOT 95% probability $\mu$ moves"); width scaling ($n$ must quadruple to halve interval width!).
  3. **`S.4.3` (`hypothesis-testing-p-values-power`) — Hypothesis Testing, p-Values, Type I/II Errors & Statistical Power:**
     - **Lab (`HypothesisPowerOverlapLab.tsx`):** Synchronized **Dual-Distribution Overlap Canvas ($H_0$ vs. $H_1$)**: adjust true effect shift $\delta = \mu_1 - \mu_0$, sample size $n$, significance threshold $\alpha$, and one-tailed vs. two-tailed mode; click any observed $\bar{x}_{\text{obs}}$ directly on the axis to shade its **live $p$-value tail**, while watching **Type I Error ($\alpha$)**, **Type II Error ($\beta$)**, **Statistical Power ($1-\beta$)**, and decision verdict (`Reject H₀` vs. `Fail to Reject H₀`) update dynamically!
     - **Guide:** Innocent-until-proven-guilty logic; exact definition of $p$-value ($P(\text{data as extreme} \mid H_0)$ vs. the $P(H_0 \mid \text{data})$ fallacy); Statistical Significance vs. Practical Importance; Power planning & $p$-hacking trap.

---

### Phase 5 — Module S.5: Comparing Groups, Categorical Tests, Simpson's Paradox & ANOVA (`group-comparisons-anova`)
- **Chapters & Interactive Labs:**
  1. **`S.5.1` (`two-sample-tests-paired-welch`) — Comparing Two Groups: Paired vs. Independent Welch's t-Tests & Effect Size:**
     - **Lab (`TwoSamplePairedWelchLab.tsx`):** Interactive **Two-Group A/B Workbench**: toggle between **Paired Before–After** (slopegraph connecting individual subjects, showing how subject-level differences $d_i = Y_i - X_i$ erase baseline noise!) and **Independent Welch's $t$-test** (two draggable group boxes with unequal $n_1, n_2$ and $s_1, s_2$); live readouts for $t$, Welch–Satterthwaite degrees of freedom, $p$-value, 95% CI of $\mu_1 - \mu_2$, and **Cohen's $d$** overlap gauge.
     - **Guide:** Why pairing increases power; why Welch's unpooled $t$-test beats Student's equal-variance $t$-test by default; Effect Size (Cohen's $d$) vs. $p$-value under huge $n$.
  2. **`S.5.2` (`chi-square-goodness-of-fit-independence`) — Chi-Square Tests, Contingency Tables & Simpson's Paradox:**
     - **Lab (`ChiSquareContingencySimpsonLab.tsx`):** Dual-mode interactive tool: (a) **Goodness-of-Fit & $r \times c$ Contingency Cell Explorer** editing observed counts $O_{ij}$ next to expected bars $E_{ij}$ and standardized Pearson residuals contributing to $\chi^2 = \sum (O-E)^2/E$; (b) **Simpson's Paradox Reverser** (e.g., UC Berkeley admissions / medical treatment across Dept A & Dept B) where adjusting group sizes flips aggregated vs. stratified win rates right before the learner's eyes!
     - **Guide:** Observed vs. Expected intuition; why $\text{df} = (r-1)(c-1)$; Fisher's Exact small-cell caution ($E_{ij} < 5$); confounding variables & Simpson's Paradox.
  3. **`S.5.3` (`one-way-anova-f-test-variance-decomposition`) — One-Way ANOVA: Between vs. Within Variance & Multiple Comparisons:**
     - **Lab (`AnovaBetweenWithinLab.tsx`):** Interactive **3-to-4 Group Dot & Mean Explorer**; drag group means apart (**Between-Group Signal / MSB**) or widen within-group jitter sliders (**Within-Group Noise / MSW**) to watch the **Sum-of-Squares Decomposition Bar ($\text{SST} = \text{SSB} + \text{SSW}$)** and **$F = \text{MSB}/\text{MSW}$** shift along the skewed $F$-distribution curve; plus a **Bonferroni / Tukey Family-Wise Error Meter** proving why running 10 pairwise $t$-tests inflates false positives to $1 - 0.95^{10} \approx 40\%$!
     - **Guide:** Why ANOVA compares variances to test means; ANOVA identity $\text{SST} = \text{SSB} + \text{SSW}$; Assumptions (Independence, Normality, Homoscedasticity); Multiple Testing problem & post-hoc correction.

---

### Phase 6 — Module S.6: Regression, Regularization, Bayesian Updating & Resampling (`regression-bayesian-advanced`) + Completion Sync
- **Chapters & Interactive Labs:**
  1. **`S.6.1` (`correlation-ols-linear-regression`) — Correlation (r), OLS Linear Regression, R² & Anscombe's Quartet:**
     - **Lab (`OLSRegressionAnscombeLab.tsx`):** Interactive **Scatter + Residual Squares + Leverage Lab**: click to add/drag points, toggle **Squared Residual Boxes** (proving OLS minimizes total inked square area $\sum (y_i - \hat{y}_i)^2$), watch **Residual Plot ($e_i$ vs. $\hat{y}_i$)** update live, toggle **95% Confidence Band vs. Prediction Band**, and load all **4 Anscombe's Quartet** datasets (identical $\bar{x}, \bar{y}, r, R^2$, OLS line, completely different stories!).
     - **Guide:** Covariance vs. Pearson $r$ vs. Regression Slope $b_1 = r (s_y/s_x)$; Regression toward the mean; $R^2 = 1 - \text{SSE}/\text{SST}$; "Correlation $\neq$ Causation" & visual diagnostics.
  2. **`S.6.2` (`multiple-regression-diagnostics-regularization`) — Multiple Linear Regression (3D), Diagnostics & Ridge/Lasso Shrinkage:**
     - **Lab (`MultipleRegression3DRegularizationLab.tsx`):** Synchronized **3D Scatter + Best-Fit Regression Plane** (`ThreeOrbitViewport`: $\hat{y} = \beta_0 + \beta_1 x_1 + \beta_2 x_2$ with vertical residual drop-lines) paired with a **2D $(\beta_1, \beta_2)$ Regularization Geometry Plot** showing elliptical RSS contours intersecting either the **Ridge $L_2$ Circle ($\beta_1^2 + \beta_2^2 \le t$)** or **Lasso $L_1$ Diamond ($|\beta_1| + |\beta_2| \le t$)** as penalty $\lambda$ increases—visually proving why Lasso snaps correlated coefficients to exact zero!
     - **Guide:** Geometric projection onto $\operatorname{Col}(X)$ ($\hat{\boldsymbol{\beta}} = (X^T X)^{-1} X^T \mathbf{y}$); Multicollinearity instability; Adjusted $R^2$ & Train/Test Cross-Validation; Ridge vs. Lasso geometry.
  3. **`S.6.3` (`bayesian-updating-bootstrap-mcmc`) — Bayesian Conjugate Updating & Bootstrap Resampling:**
     - **Lab (`BayesianUpdatingAndBootstrapLab.tsx`):** Dual-panel modern inference workbench:
       - **Mode A — Beta–Binomial Bayesian Updater:** Pick prior belief $\operatorname{Beta}(\alpha_0, \beta_0)$, click **Flip Coin / Observe Trial** ($k$ successes in $n$ trials), and watch the **Prior** multiply smoothly by the **Likelihood** to form the **Posterior** $\operatorname{Beta}(\alpha_0+k, \beta_0+n-k)$ with 95% **Credible Interval** vs. Frequentist CI comparison!
       - **Mode B — Nonparametric Bootstrap Simulator:** Take a skewed small dataset, click **Resample with Replacement** (animated single resample + **1,000 Bootstrap Replicates**) to construct an empirical sampling distribution and percentile CI without assuming Gaussianity!
     - **Guide:** Frequentist vs. Bayesian philosophy; Bayes as sequential learning ("today's posterior is tomorrow's prior"); Credible Interval vs. Confidence Interval; Efron's Bootstrap intuition ("plug-in principle").
- **Final Volume Completion Sync:**
  - Update `archive/volumes/vol_07_statistics/README.md`, `archive/01_GLOBAL_STATUS.md`, `archive/01_CURRENT_STATUS.md`, `AGENTS.md`, `public/llms.txt`, and `public/llms-full.txt`.
  - Verify `npx tsc --noEmit` and full `npm run build` with zero errors/warnings.

---

## 4. Argon ↔ Hydrogen Handoff Protocol

- **Argon (Orchestrator):** Owns architectural blueprints, phase breakdowns, mathematical accuracy reviews, and cross-volume consistency (`Phase 0` complete; available for architectural mid-course corrections or final audit).
- **Hydrogen (Implementer):** Executes **one Phase at a time** (Phase 1 → Phase 2 → ... → Phase 6):
  1. Reads `AGENTS.md` + `archive/volumes/vol_07_statistics/STATISTICS_PLAN.md` for the target phase.
  2. Implements the registry entries, visualization labs (`src/components/visualizations/statistics/*.tsx`), `DynamicLabRenderer.tsx` mappings, and thorough first-timer chapter guides in `src/app/[volume]/[module]/[chapter]/page.tsx`.
  3. Runs `npx tsc --noEmit` and `npm run build`, verifies zero runtime/TypeScript/layout/a11y regressions (`role="img"`, `aria-label`, adaptive WCAG ink, zero gradients).
  4. Updates `archive/volumes/vol_07_statistics/README.md`, `archive/01_GLOBAL_STATUS.md`, `archive/01_CURRENT_STATUS.md`, and `AGENTS.md`, then commits and pushes cleanly to `origin/main` as `swapnonil2007 <swapnonil2007@gmail.com>`.
  5. Reports progress and tells the user whether to stay on Hydrogen for the next implementation phase or switch back to Argon for architecture review.
