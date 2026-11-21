# Complete Curriculum Catalog — Volumes I–VI

All **6 Volumes, 20 Modules, 72 Chapters, and 88 Interactive Laboratories** in **wanna math** (`v2.0`) are **`published`** and statically pre-rendered under `/[volume]/[module]/[chapter]` (plus **9 Dedicated Formula Reference Sheets** under `/formulas`).

---

## Executive Curriculum Matrix

| Volume | Route Base | Accent Hex | Modules | Chapters | Interactive Labs | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **Volume I: Single-Variable Calculus** | `/single-variable-calculus` | `#8D9FCE` (Periwinkle) | 4 | 17 | 17 *(+4 Formula Sheets)* | `published` |
| **Volume II: Linear Algebra & Space Geometry** | `/linear-algebra` | `#96B898` (Sage Green) | 3 | 9 | 9 | `published` |
| **Volume III: Multivariable & Vector Calculus** | `/multivariable-calculus` | `#029091` (Deep Teal) | 3 | 26 | 42 *(+5 Formula Sheets)* | `published` |
| **Volume IV: Differential Equations & Dynamical Systems** | `/differential-equations` | `#D35323` (Persimmon) | 4 | 8 | 8 | `published` |
| **Volume V: Transforms & Complex Analysis** | `/transforms-complex-analysis` | `#D5658B` (Dusty Rose) | 4 | 8 | 8 | `published` |
| **Volume VI: Probability, Statistics & Numerical Methods** | `/probability-numerical-methods` | `#AAA36D` (Olive Gold) | 2 | 4 | 4 | `published` |
| **Total** | **`/[volume]/[module]/[chapter]`** | **6-Volume Textbook** | **20** | **72** | **88** | **100% Live** |

---

## Volume I: Single-Variable Calculus (`/single-variable-calculus`)

- **Registry Source:** [`src/registry/vol1-single-variable.ts`](../src/registry/vol1-single-variable.ts)
- **Lab Directory:** `src/components/visualizations/single-variable/`
- **Formula Reference Index:** [`/formulas`](../src/app/formulas/page.tsx) (`/formulas/limits`, `/formulas/derivatives`, `/formulas/taylor-expansions`, `/formulas/integrals`)

### Module 1.1: Limits & Continuity (`/single-variable-calculus/limits-continuity`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `1.1.1` | `/single-variable-calculus/limits-continuity/limits` | Limits, Left-Hand & Right-Hand Approach (LHL & RHL) | 30 min | `2D` | `OneSidedLimitsExplorerLab`, `LimitsAtInfinityAndTechniquesLab` *(Hero Link: `/formulas/limits`)* |
| `1.1.2` | `/single-variable-calculus/limits-continuity/epsilon-delta-limits` | ε-δ Neighborhoods & Limit Convergence | 25 min | `2D` | `EpsilonDeltaCorridorLab` |
| `1.1.3` | `/single-variable-calculus/limits-continuity/continuity-ivt` | Continuity, Intermediate Value Theorem & Asymptotes | 20 min | `2D` | `IVTBisectionLab` |

### Module 1.2: Differential Calculus & Local Linearity (`/single-variable-calculus/differential-calculus`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `1.2.1` | `/single-variable-calculus/differential-calculus/secant-tangent-homotopy` | Secant-to-Tangent Homotopy & Instantaneous Rate | 25 min | `2D` | `SecantTangentLab` *(Hero Link: `/formulas/derivatives`)* |
| `1.2.2` | `/single-variable-calculus/differential-calculus/local-linearity-differentials` | Local Linearity, Differentials & Newton-Raphson | 25 min | `2D` | `NewtonRaphsonLab` |
| `1.2.3` | `/single-variable-calculus/differential-calculus/chain-rule-kinematics` | Chain Rule, Implicit Differentiation & Related Rates | 25 min | `2D` | `ChainRulePropagatorLab` |
| `1.2.4` | `/single-variable-calculus/differential-calculus/taylor-polynomials-curvature` | Taylor Polynomials & Curvature Osculating Circles | 30 min | `2D` | `TaylorCurvatureLab` *(Hero Link: `/formulas/taylor-expansions`)* |
| `1.2.5` | `/single-variable-calculus/differential-calculus/mean-value-theorems` | *Mean Value Theorems* — Rolle, Lagrange & Cauchy Overview | 20 min | `Overview` | *Theorem Family Overview (0 Labs)* |
| `1.2.5a` | `/single-variable-calculus/differential-calculus/rolles-theorem` | *Mean Value Theorems* — Rolle's Theorem: Horizontal Tangents & Stationary Points | 25 min | `2D` | `RollesTheoremLab` |
| `1.2.5b` | `/single-variable-calculus/differential-calculus/lagrange-mean-value-theorem` | *Mean Value Theorems* — Lagrange's Mean Value Theorem (LMVT): Parallel Tangents | 30 min | `2D` | `LagrangeMVTLab` |
| `1.2.5c` | `/single-variable-calculus/differential-calculus/cauchy-mean-value-theorem` | *Mean Value Theorems* — Cauchy's Mean Value Theorem (CMVT): Parametric Tangents & L'Hôpital Bridge | 30 min | `Dual 2D` | `CauchyMVTLab` |

### Module 1.3: Single-Variable Integration & Accumulation (`/single-variable-calculus/integral-calculus`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `1.3.1` | `/single-variable-calculus/integral-calculus/riemann-sums-1d` | 1D Riemann Sums, Darboux Bounds & Definite Area | 25 min | `2D` | `Riemann1DLab` *(Hero Link: `/formulas/integrals`)* |
| `1.3.2` | `/single-variable-calculus/integral-calculus/fundamental-theorem-calculus` | The Fundamental Theorem of Calculus: Accumulation vs. Slope | 30 min | `2D` | `FTCAccumulationLab` |
| `1.3.3` | `/single-variable-calculus/integral-calculus/substitution-integration-by-parts` | u-Substitution & Integration by Parts Geometry | 25 min | `2D` | `SubstitutionIBPLab` |
| `1.3.4` | `/single-variable-calculus/integral-calculus/solids-of-revolution` | Solids of Revolution: Disks, Washers & Cylindrical Shells | 30 min | `2D + 3D` | `SolidOfRevolutionLab` |

### Module 1.4: Infinite Series & Power Series Convergence (`/single-variable-calculus/infinite-series`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `1.4.1` | `/single-variable-calculus/infinite-series/sequences-partial-sums` | Sequences, Partial Sums & Geometric Convergence | 25 min | `2D` | `PartialSumSeriesLab` |
| `1.4.2` | `/single-variable-calculus/infinite-series/power-series-convergence` | Power Series, Radius of Convergence & Analytic Functions | 25 min | `2D` | `PowerSeriesConvergenceLab` |

### Volume I Formula Reference Sheets (`/formulas`)
| Sheet Slug | Canonical Route | Linked Hero Chapter | Scope & Special Verifications |
| :--- | :--- | :--- | :--- |
| `limits` | `/formulas/limits` | `1.1.1` (`limits`) | Limit laws, trig/exp limits, L'Hôpital caveats, even-root conditions |
| `derivatives` | `/formulas/derivatives` | `1.2.1` (`secant-tangent-homotopy`) | Differentiation rules, trig, inverse trig, hyperbolic, $a^x / \log_a x$ |
| `taylor-expansions` | `/formulas/taylor-expansions` | `1.2.4` (`taylor-polynomials-curvature`) | Maclaurin series for $e^x$, $\ln(1\pm x)$, trig, inverse trig, $(1+x)^\alpha$ & intervals $I$ |
| `integrals` | `/formulas/integrals` | `1.3.1` (`riemann-sums-1d`) | Standard antiderivatives, $\operatorname{sech} u \to \tan^{-1}(\sinh u)+C$, $\frac{1}{u\sqrt{u^2-a^2}} \to \frac{1}{a}\sec^{-1}(\|u\|/a)+C$ |

---

## Volume II: Linear Algebra & Space Geometry (`/linear-algebra`)

- **Registry Source:** [`src/registry/vol2-linear-algebra.ts`](../src/registry/vol2-linear-algebra.ts)
- **Lab Directory:** `src/components/visualizations/linear-algebra/`

### Module 2.1: Vectors, Span & The Fundamental Subspaces (`/linear-algebra/vectors-subspaces`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `2.1.1` | `/linear-algebra/vectors-subspaces/vectors-linear-combinations` | Vectors, Linear Combinations & Span in 2D/3D | 25 min | `2D + 3D` | `VectorSpanExplorerLab` |
| `2.1.2` | `/linear-algebra/vectors-subspaces/basis-change-of-basis` | Linear Independence, Basis & Change of Basis | 25 min | `2D` | `ChangeOfBasisLab` |
| `2.1.3` | `/linear-algebra/vectors-subspaces/four-fundamental-subspaces` | The Four Fundamental Subspaces & Rank-Nullity | 30 min | `2D + 3D` | `FourSubspacesLab` |

### Module 2.2: Matrices as Linear Transformations & Determinants (`/linear-algebra/linear-transformations`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `2.2.1` | `/linear-algebra/linear-transformations/matrix-transformations-2d-3d` | Matrix Multiplication as Composition of Transformations | 25 min | `2D + 3D` | `MatrixTransformationLab` (`2D`) |
| `2.2.2` | `/linear-algebra/linear-transformations/determinants-volume-scaling` | Determinants as Oriented Area & Parallelepiped Volume Scaling | 25 min | `2D + 3D` | `DeterminantVolumeLab` |
| `2.2.3` | `/linear-algebra/linear-transformations/orthogonality-least-squares` | Orthogonality, Projections & Least-Squares Fitting | 30 min | `2D + 3D` | `LeastSquaresProjectionLab` |

### Module 2.3: Eigen-Systems, Diagonalization & SVD (`/linear-algebra/eigen-systems-svd`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `2.3.1` | `/linear-algebra/eigen-systems-svd/eigenvalues-eigenvectors` | Eigenvalues, Eigenvectors & Invariant Directions | 30 min | `2D` | `EigenvectorCompassLab` |
| `2.3.2` | `/linear-algebra/eigen-systems-svd/quadratic-forms-spectral` | Spectral Theorem, Quadratic Forms & Principal Axes | 25 min | `2D + 3D` | `QuadraticFormLab` |
| `2.3.3` | `/linear-algebra/eigen-systems-svd/singular-value-decomposition` | Singular Value Decomposition (SVD) Geometry | 30 min | `2D + 3D` | `SVDThreeStageLab` (`2D`) |

---

## Volume III: Multivariable & Vector Calculus (`/multivariable-calculus`)

- **Registry Source:** [`src/registry/vol3-multivariable.ts`](../src/registry/vol3-multivariable.ts)
- **Lab Directories:** `multivariable-differentiation/`, `integral-calculus/`, `double-integrals/`, `triple-integrals/`, `coordinate-systems/`, `jacobians/`, `vector-calculus/`

### Module 3.1: Differential Calculus (`/multivariable-calculus/differential-calculus`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Labs (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `3.1.1` | `/multivariable-calculus/differential-calculus/surfaces-level-curves` | Surfaces, Level Curves & Contour Maps | 25 min | `2D + 3D` | `SurfaceContourSlicerLab` (`2D + 3D`) |
| `3.1.2` | `/multivariable-calculus/differential-calculus/partial-derivatives-tangent-planes` | Partial Derivatives, Mixed Partials, Chain Rule & Tangent Planes | 40 min | `2D + 3D` | `PartialDerivativeTangentPlaneLab` (`2D + 3D`), `HigherOrderChainImplicitLab` (`2D + 3D`) |
| `3.1.3` | `/multivariable-calculus/differential-calculus/gradient-directional-derivatives` | The Gradient Vector & Directional Derivatives | 40 min | `2D + 3D` | `GradientDirectionalDerivativeLab` (`2D + 3D`), `GradientAscentAndLevelSurfaceLab` (`2D + 3D`) |
| `3.1.4` | `/multivariable-calculus/differential-calculus/lagrange-multipliers` | Lagrange Multipliers & Constrained Optimization | 30 min | `2D + 3D` | `LagrangeMultipliersLab` (`2D + 3D`) |
| `3.1.5` | `/multivariable-calculus/differential-calculus/limits-and-differentiability` | Multivariable Limits, Continuity & Differentiability | 35 min | `2D + 3D` | `MultivariableLimitsPathsLab` (`2D + 3D`), `DifferentiabilityErrorConeLab` (`2D + 3D`) |
| `3.1.6` | `/multivariable-calculus/differential-calculus/taylor-expansions` | Taylor Expansions: Single-Variable & Multivariable | 35 min | `2D + 3D` | `SingleVariableTaylorLab` (`2D`), `MultivariableTaylorHessianLab` (`3D`) |
| `3.1.7` | `/multivariable-calculus/differential-calculus/homogeneous-functions-eulers-theorem` | Homogeneous Functions & Euler's Theorems | 35 min | `2D + 3D` | `HomogeneousScalingRayLab` (`2D + 3D`), `EulersTheoremSecondOrderLab` (`2D`) |
| `3.1.8` | `/multivariable-calculus/differential-calculus/maxima-minima-extrema` | Maxima & Minima: General Method & Second Derivative Test | 35 min | `2D + 3D` | `HessianSecondDerivativeTestLab` (`2D + 3D`), `GeneralMethodDegenerateExtremaLab` (`2D + 3D`) |
| `3.1.9` | `/multivariable-calculus/differential-calculus/first-order-lde-bernoulli` | *Sub-Parent: Differential Equations* — First-Order ODEs: LDE, Integrating Factors & Bernoulli's Equation | 35 min | `Dual 2D` | `LinearOdeIntegratingFactorLab` (`2D`), `BernoulliReductionLab` (`Dual 2D`) |
| `3.1.10` | `/multivariable-calculus/differential-calculus/linear-odes-wronskian-roots` | *Sub-Parent: Differential Equations* — Linear ODEs: Linear Independence, Wronskian & Root Regimes | 40 min | `2D` | `WronskianPhaseAreaLab` (`2D`), `CharacteristicRootsSolutionLab` (`2D`) |
| `3.1.11` | `/multivariable-calculus/differential-calculus/operator-variation-cauchy-euler` | *Sub-Parent: Differential Equations* — Operator Method (D), Variation of Parameters & Cauchy-Euler Equations | 45 min | `2D` | `OperatorMethodTutorialLab` (`2D`), `VariationOfParametersCauchyEulerLab` (`2D`) |

### Module 3.2: Integral Calculus (`/multivariable-calculus/integral-calculus`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Labs (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `3.2.1` | `/multivariable-calculus/integral-calculus/double-integrals` | Double Integrals & Fubini's Theorem | 35 min | `2D + 3D` | `RiemannVolumeLab` (`2D + 3D`), `IteratedOrderChangeLab` (`2D + 3D`) |
| `3.2.2` | `/multivariable-calculus/integral-calculus/triple-integrals` | Triple Integrals, 6-Order Slicing & Density | 40 min | `3D + 2D Shadow` | `TripleIntegralOrderLab` (`2D + 3D`), `TripleVoxelDensityLab` (`3D`) |
| `3.2.3` | `/multivariable-calculus/integral-calculus/coordinate-systems` | Curvilinear Coordinates: Polar, Cylindrical & Spherical | 35 min | `2D & 3D` | `PolarCoordinateAreaLab` (`2D`), `Curvilinear3DSurfacesAndElementLab` (`3D`) |
| `3.2.4` | `/multivariable-calculus/integral-calculus/jacobians` | The Jacobian & Change of Variables Pullback | 40 min | `Dual 2D & 3D` | `DualGridMorphingAndTangentLab` (`Dual 2D`), `JacobianIntegralPullbackLab` (`2D + 3D`) |
| `3.2.5` | `/multivariable-calculus/integral-calculus/convergence-and-divergence` | Convergence & Divergence (Improper Integrals & Series Tests) | 45 min | `2D` | `ImproperIntegralConvergenceLab` (`2D`), `ConvergenceTestsTutorialLab` (`2D`) |
| `3.2.6` | `/multivariable-calculus/integral-calculus/gamma-and-beta-functions` | Gamma & Beta Functions (Eulerian Integrals) | 40 min | `2D + 3D` | `GammaFunctionLab` (`2D`), `BetaFunctionLab` (`2D + 3D`) |

### Module 3.3: Vector Calculus & Integral Theorems (`/multivariable-calculus/vector-calculus`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Labs (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `3.3.1` | `/multivariable-calculus/vector-calculus/gradient-of-scalar-fields` | The Gradient Operator (∇φ), Level Surfaces & Normals | 35 min | `2D + 3D` | `VectorGradientCalculatorLab` (`2D + 3D`) |
| `3.3.2` | `/multivariable-calculus/vector-calculus/directional-derivatives` | Directional Derivatives (D_û f = ∇f · û) & Rate of Change | 35 min | `2D + 3D` | `DirectionalDerivativeCalculatorLab` (`2D + 3D`) |
| `3.3.3` | `/multivariable-calculus/vector-calculus/vector-fields-divergence-curl` | Vector Fields, Divergence & Curl | 45 min | `2D + 3D` | `DivCurlProbeLab` (`2D + 3D`), `VectorFieldStreamlineExplorerLab` (`2D + 3D`), `DivCurlDecompositionLab` (`3D`) |
| `3.3.4` | `/multivariable-calculus/vector-calculus/line-integrals-work` | Line Integrals (Work & Circulation) | 30 min | `2D + 3D` | `LineIntegralWorkLab` (`2D + 3D`) |
| `3.3.5` | `/multivariable-calculus/vector-calculus/greens-theorem` | Green's Theorem | 30 min | `2D` | `GreensTheoremLab` (`2D`) |
| `3.3.6` | `/multivariable-calculus/vector-calculus/surface-integrals-flux` | Surface Integrals & Flux | 35 min | `3D` | `SurfaceFluxLab` (`3D`) |
| `3.3.7` | `/multivariable-calculus/vector-calculus/stokes-divergence-theorems` | *Vector Integral Theorems* — Green, Stokes & Gauss Overview | 20 min | `Overview` | *Theorem Family Overview (0 Labs)* *(Hero Link: `/formulas/vector-calculus`)* |
| `3.3.7a` | `/multivariable-calculus/vector-calculus/stokes-theorem` | *Vector Integral Theorems* — Stokes' Theorem: 3D Cap Surface Invariance & Boundary Rim Work | 35 min | `3D` | `StokesTheoremLab` *(Hero Link: `/formulas/vector-calculus`)* |
| `3.3.7b` | `/multivariable-calculus/vector-calculus/divergence-theorem` | *Vector Integral Theorems* — Gauss's Divergence Theorem: Closed-Shell Flux & Volume Divergence | 35 min | `3D` | `DivergenceTheoremLab` *(Hero Link: `/formulas/vector-calculus`)* |

### Volume III Formula Reference Sheets (`/formulas`)
| Sheet Slug | Canonical Route | Linked Volume III Chapters | Scope & Special Verifications |
| :--- | :--- | :--- | :--- |
| `multivariable-derivatives` | `/formulas/multivariable-derivatives` | `3.1.2`–`3.1.8` | Partials, Clairaut/Peano caveat, Chain Rule, Euler homogeneous identities, Hessian $D=0$ caveat, Lagrange regularity ($\nabla g \neq \mathbf{0}$) |
| `ode-methods` | `/formulas/ode-methods` | `3.1.9`–`3.1.11` | Integrating factors, Bernoulli ($y\equiv 0$ equilibrium caveat), Wronskian/Abel, $1/f(D)$ shortcuts & resonance, monic Variation of Parameters, Cauchy-Euler ($x>0$) |
| `multiple-integrals-jacobians` | `/formulas/multiple-integrals-jacobians` | `3.2.1`–`3.2.4` | Type I/II slicing, Fubini order-reversal rescue, 6-order shadow walls, Polar/Cylindrical/Spherical scale factors, 2D/3D Jacobians, mass & moments |
| `convergence-gamma-beta` | `/formulas/convergence-gamma-beta` | `3.2.5`, `3.2.6` | Flipped improper $p$-tests, 9-row infinite series convergence table, $\Gamma(z)$ reflection/duplication/poles, $\mathrm{B}(p,q)$ trig/Gamma unification, Wallis integrals |
| `vector-calculus` | `/formulas/vector-calculus` | `3.1.3`, `3.3.1`–`3.3.7b` | Del ($\nabla, \nabla\cdot, \nabla\times, \nabla^2$) in Cartesian/Cylindrical/Spherical, $C^2$ & product identities, directional derivatives, FTLI (simply connected caveat) & Big Four Theorems |

---

## Volume IV: Differential Equations & Dynamical Systems (`/differential-equations`)

- **Registry Source:** [`src/registry/vol4-differential-equations.ts`](../src/registry/vol4-differential-equations.ts)
- **Lab Directory:** `src/components/visualizations/differential-equations/`

### Module 4.1: First-Order ODEs & Slope Fields (`/differential-equations/first-order-odes`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `4.1.1` | `/differential-equations/first-order-odes/direction-fields-integral-curves` | Direction Fields, Integral Curves & Picard Existence | 30 min | `2D` | `SlopeFieldTracerLab` |
| `4.1.2` | `/differential-equations/first-order-odes/separable-linear-odes` | Separable, Linear & Autonomous Phase-Line Models | 30 min | `2D` | `AutonomousPhaseLineLab` |

### Module 4.2: Second-Order Linear ODEs & Oscillations (`/differential-equations/second-order-oscillations`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `4.2.1` | `/differential-equations/second-order-oscillations/damped-harmonic-oscillators` | Harmonic Oscillators: Undamped, Underdamped & Overdamped | 35 min | `2D` | `HarmonicOscillatorLab` |
| `4.2.2` | `/differential-equations/second-order-oscillations/forced-oscillations-resonance` | Forced Oscillations, Beats & Resonance Frequency Response | 35 min | `2D` | `ForcedResonanceLab` |

### Module 4.3: Systems of ODEs & Phase Plane Portraits (`/differential-equations/phase-plane-systems`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `4.3.1` | `/differential-equations/phase-plane-systems/linear-phase-portraits` | 2D Linear Phase Portraits: Nodes, Saddles, Spirals & Centers | 35 min | `Dual 2D` | `TraceDeterminantPhaseLab` |
| `4.3.2` | `/differential-equations/phase-plane-systems/nonlinear-nullclines-limit-cycles` | Nonlinear Stability, Nullclines & Limit Cycles | 35 min | `2D` | `NonlinearPhasePortraitLab` |

### Module 4.4: Partial Differential Equations (`/differential-equations/partial-differential-equations`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `4.4.1` | `/differential-equations/partial-differential-equations/heat-equation-diffusion` | The 1D/2D Heat Equation & Diffusive Smoothing | 35 min | `2D + 3D` | `HeatEquationDiffusionLab` |
| `4.4.2` | `/differential-equations/partial-differential-equations/wave-equation-normal-modes` | The Wave Equation, Normal Modes & D'Alembert's Solution | 35 min | `2D + 3D` | `WaveEquationModesLab` |

---

## Volume V: Transforms & Complex Analysis (`/transforms-complex-analysis`)

- **Registry Source:** [`src/registry/vol5-transforms-complex.ts`](../src/registry/vol5-transforms-complex.ts)
- **Lab Directory:** `src/components/visualizations/transforms-complex/`

### Module 5.1: Complex Numbers & Conformal Mappings (`/transforms-complex-analysis/complex-functions-conformal`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `5.1.1` | `/transforms-complex-analysis/complex-functions-conformal/euler-formula-complex-plane` | Complex Plane, Euler's Formula & Phasor Geometry | 25 min | `2D + 3D` | `EulerHelixPhasorLab` |
| `5.1.2` | `/transforms-complex-analysis/complex-functions-conformal/cauchy-riemann-conformal` | Analyticity, Cauchy-Riemann Equations & Conformal Grids | 30 min | `Dual 2D` | `ConformalMappingLab` |

### Module 5.2: Contour Integration & The Residue Theorem (`/transforms-complex-analysis/contour-integration`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `5.2.1` | `/transforms-complex-analysis/contour-integration/cauchy-integral-formula` | Complex Line Integrals & Cauchy's Integral Theorem | 30 min | `2D` | `CauchyContourLab` |
| `5.2.2` | `/transforms-complex-analysis/contour-integration/poles-residue-theorem` | Poles, Laurent Series & The Residue Theorem | 30 min | `2D + 3D` | `ResidueTheoremLab` |

### Module 5.3: Laplace Transforms & s-Plane Poles/Zeros (`/transforms-complex-analysis/laplace-transforms`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `5.3.1` | `/transforms-complex-analysis/laplace-transforms/s-plane-poles-zeros` | The s-Plane Surface, Poles/Zeros & Region of Convergence | 35 min | `2D + 3D` | `LaplaceSPlane3DLab` |
| `5.3.2` | `/transforms-complex-analysis/laplace-transforms/impulse-response-convolution` | Impulse Response, Step Response & Convolution Integral | 30 min | `2D` | `ConvolutionFlipSlideLab` |

### Module 5.4: Fourier Series & Fourier Transforms (`/transforms-complex-analysis/fourier-analysis`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `5.4.1` | `/transforms-complex-analysis/fourier-analysis/fourier-series-gibbs` | Orthogonal Harmonics, Epicycles & Gibbs Phenomenon | 30 min | `2D` | `FourierSeriesGibbsLab` |
| `5.4.2` | `/transforms-complex-analysis/fourier-analysis/fourier-transform-spectra` | Continuous Fourier Transform & Time-Frequency Uncertainty | 30 min | `Dual 2D` | `FourierTransformWindingLab` |

---

## Volume VI: Probability, Statistics & Numerical Methods (`/probability-numerical-methods`)

- **Registry Source:** [`src/registry/vol6-probability-numerical.ts`](../src/registry/vol6-probability-numerical.ts)
- **Lab Directory:** `src/components/visualizations/probability-numerical/`

### Module 6.1: Engineering Probability & Joint Distributions (`/probability-numerical-methods/probability-distributions`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `6.1.1` | `/probability-numerical-methods/probability-distributions/continuous-pdfs-cdfs` | Continuous PDFs, CDFs & Expectation Integrals | 25 min | `2D` | `PDFCDFMomentLab` |
| `6.1.2` | `/probability-numerical-methods/probability-distributions/joint-bivariate-distributions` | Joint Bivariate Distributions, Marginalization & Covariance | 30 min | `2D + 3D` | `BivariateGaussianLab` |

### Module 6.2: Numerical Quadrature, Root-Finding & ODE Solvers (`/probability-numerical-methods/numerical-methods`)
| ID | Route | Chapter Title | Est. | Mode | Interactive Lab (`componentKey`) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `6.2.1` | `/probability-numerical-methods/numerical-methods/numerical-quadrature-error` | Trapezoidal, Simpson's & Gauss-Legendre Quadrature | 30 min | `2D` | `NumericalQuadratureLab` |
| `6.2.2` | `/probability-numerical-methods/numerical-methods/runge-kutta-ode-solvers` | Euler, Heun & Runge-Kutta (RK4) Trajectory Stepping | 30 min | `2D` | `RungeKuttaSlopeLab` |
