"use client";

import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import { LabLoadingSkeleton } from "@/components/visualizations/LabLoadingSkeleton";

function lazyLab(
  loader: () => Promise<ComponentType>
): LazyExoticComponent<ComponentType> {
  return lazy(() => loader().then((Component) => ({ default: Component })));
}

const LAB_COMPONENTS = {
  // Volume I — Module 1.1
  OneSidedLimitsExplorerLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/OneSidedLimitsExplorerLab"
      ).then((m) => m.OneSidedLimitsExplorerLab)),
  LimitsAtInfinityAndTechniquesLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/LimitsAtInfinityAndTechniquesLab"
      ).then((m) => m.LimitsAtInfinityAndTechniquesLab)),
  EpsilonDeltaCorridorLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/EpsilonDeltaCorridorLab"
      ).then((m) => m.EpsilonDeltaCorridorLab)),
  IVTBisectionLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/IVTBisectionLab"
      ).then((m) => m.IVTBisectionLab)),

  // Volume I — Module 1.2
  SecantTangentLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/SecantTangentLab"
      ).then((m) => m.SecantTangentLab)),
  NewtonRaphsonLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/NewtonRaphsonLab"
      ).then((m) => m.NewtonRaphsonLab)),
  ChainRulePropagatorLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/ChainRulePropagatorLab"
      ).then((m) => m.ChainRulePropagatorLab)),
  TaylorCurvatureLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/TaylorCurvatureLab"
      ).then((m) => m.TaylorCurvatureLab)),
  RollesTheoremLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/RollesTheoremLab"
      ).then((m) => m.RollesTheoremLab)),
  LagrangeMVTLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/LagrangeMVTLab"
      ).then((m) => m.LagrangeMVTLab)),
  CauchyMVTLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/CauchyMVTLab"
      ).then((m) => m.CauchyMVTLab)),

  // Volume I — Module 1.3
  Riemann1DLab: lazyLab(() =>
      import("@/components/visualizations/single-variable/Riemann1DLab").then(
        (m) => m.Riemann1DLab
      )),
  FTCAccumulationLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/FTCAccumulationLab"
      ).then((m) => m.FTCAccumulationLab)),
  SubstitutionIBPLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/SubstitutionIBPLab"
      ).then((m) => m.SubstitutionIBPLab)),
  SolidOfRevolutionLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/SolidOfRevolutionLab"
      ).then((m) => m.SolidOfRevolutionLab)),

  // Volume I — Module 1.4
  PartialSumSeriesLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/PartialSumSeriesLab"
      ).then((m) => m.PartialSumSeriesLab)),
  PowerSeriesConvergenceLab: lazyLab(() =>
      import(
        "@/components/visualizations/single-variable/PowerSeriesConvergenceLab"
      ).then((m) => m.PowerSeriesConvergenceLab)),

  // Volume II — Modules 2.1–2.3
  VectorSpanExplorerLab: lazyLab(() =>
      import(
        "@/components/visualizations/linear-algebra/VectorSpanExplorerLab"
      ).then((m) => m.VectorSpanExplorerLab)),
  ChangeOfBasisLab: lazyLab(() =>
      import(
        "@/components/visualizations/linear-algebra/ChangeOfBasisLab"
      ).then((m) => m.ChangeOfBasisLab)),
  FourSubspacesLab: lazyLab(() =>
      import(
        "@/components/visualizations/linear-algebra/FourSubspacesLab"
      ).then((m) => m.FourSubspacesLab)),
  MatrixTransformationLab: lazyLab(() =>
      import(
        "@/components/visualizations/linear-algebra/MatrixTransformationLab"
      ).then((m) => m.MatrixTransformationLab)),
  DeterminantVolumeLab: lazyLab(() =>
      import(
        "@/components/visualizations/linear-algebra/DeterminantVolumeLab"
      ).then((m) => m.DeterminantVolumeLab)),
  LeastSquaresProjectionLab: lazyLab(() =>
      import(
        "@/components/visualizations/linear-algebra/LeastSquaresProjectionLab"
      ).then((m) => m.LeastSquaresProjectionLab)),
  EigenvectorCompassLab: lazyLab(() =>
      import(
        "@/components/visualizations/linear-algebra/EigenvectorCompassLab"
      ).then((m) => m.EigenvectorCompassLab)),
  QuadraticFormLab: lazyLab(() =>
      import(
        "@/components/visualizations/linear-algebra/QuadraticFormLab"
      ).then((m) => m.QuadraticFormLab)),
  SVDThreeStageLab: lazyLab(() =>
      import(
        "@/components/visualizations/linear-algebra/SVDThreeStageLab"
      ).then((m) => m.SVDThreeStageLab)),

  // Volume III — Module 3.1
  SurfaceContourSlicerLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/SurfaceContourSlicerLab"
      ).then((m) => m.SurfaceContourSlicerLab)),
  PartialDerivativeTangentPlaneLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/PartialDerivativeTangentPlaneLab"
      ).then((m) => m.PartialDerivativeTangentPlaneLab)),
  GradientDirectionalDerivativeLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/GradientDirectionalDerivativeLab"
      ).then((m) => m.GradientDirectionalDerivativeLab)),
  GradientAscentAndLevelSurfaceLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/GradientAscentAndLevelSurfaceLab"
      ).then((m) => m.GradientAscentAndLevelSurfaceLab)),
  LagrangeMultipliersLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/LagrangeMultipliersLab"
      ).then((m) => m.LagrangeMultipliersLab)),
  MultivariableLimitsPathsLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/MultivariableLimitsPathsLab"
      ).then((m) => m.MultivariableLimitsPathsLab)),
  DifferentiabilityErrorConeLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/DifferentiabilityErrorConeLab"
      ).then((m) => m.DifferentiabilityErrorConeLab)),
  HigherOrderChainImplicitLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/HigherOrderChainImplicitLab"
      ).then((m) => m.HigherOrderChainImplicitLab)),
  SingleVariableTaylorLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/SingleVariableTaylorLab"
      ).then((m) => m.SingleVariableTaylorLab)),
  MultivariableTaylorHessianLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/MultivariableTaylorHessianLab"
      ).then((m) => m.MultivariableTaylorHessianLab)),
  HomogeneousScalingRayLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/HomogeneousScalingRayLab"
      ).then((m) => m.HomogeneousScalingRayLab)),
  EulersTheoremSecondOrderLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/EulersTheoremSecondOrderLab"
      ).then((m) => m.EulersTheoremSecondOrderLab)),
  HessianSecondDerivativeTestLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/HessianSecondDerivativeTestLab"
      ).then((m) => m.HessianSecondDerivativeTestLab)),
  GeneralMethodDegenerateExtremaLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/GeneralMethodDegenerateExtremaLab"
      ).then((m) => m.GeneralMethodDegenerateExtremaLab)),
  LinearOdeIntegratingFactorLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/LinearOdeIntegratingFactorLab"
      ).then((m) => m.LinearOdeIntegratingFactorLab)),
  BernoulliReductionLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/BernoulliReductionLab"
      ).then((m) => m.BernoulliReductionLab)),
  WronskianPhaseAreaLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/WronskianPhaseAreaLab"
      ).then((m) => m.WronskianPhaseAreaLab)),
  CharacteristicRootsSolutionLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/CharacteristicRootsSolutionLab"
      ).then((m) => m.CharacteristicRootsSolutionLab)),
  OperatorMethodTutorialLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/OperatorMethodTutorialLab"
      ).then((m) => m.OperatorMethodTutorialLab)),
  VariationOfParametersCauchyEulerLab: lazyLab(() =>
      import(
        "@/components/visualizations/multivariable-differentiation/VariationOfParametersCauchyEulerLab"
      ).then((m) => m.VariationOfParametersCauchyEulerLab)),

  // Volume III — Module 3.2
  RiemannVolumeLab: lazyLab(() =>
      import("@/components/visualizations/double-integrals/RiemannVolumeLab").then(
        (m) => m.RiemannVolumeLab
      )),
  IteratedOrderChangeLab: lazyLab(() =>
      import(
        "@/components/visualizations/double-integrals/IteratedOrderChangeLab"
      ).then((m) => m.IteratedOrderChangeLab)),
  TripleIntegralOrderLab: lazyLab(() =>
      import(
        "@/components/visualizations/triple-integrals/TripleIntegralOrderLab"
      ).then((m) => m.TripleIntegralOrderLab)),
  TripleVoxelDensityLab: lazyLab(() =>
      import(
        "@/components/visualizations/triple-integrals/TripleVoxelDensityLab"
      ).then((m) => m.TripleVoxelDensityLab)),
  PolarCoordinateAreaLab: lazyLab(() =>
      import(
        "@/components/visualizations/coordinate-systems/PolarCoordinateAreaLab"
      ).then((m) => m.PolarCoordinateAreaLab)),
  Curvilinear3DSurfacesAndElementLab: lazyLab(() =>
      import(
        "@/components/visualizations/coordinate-systems/Curvilinear3DSurfacesAndElementLab"
      ).then((m) => m.Curvilinear3DSurfacesAndElementLab)),
  DualGridMorphingAndTangentLab: lazyLab(() =>
      import(
        "@/components/visualizations/jacobians/DualGridMorphingAndTangentLab"
      ).then((m) => m.DualGridMorphingAndTangentLab)),
  JacobianIntegralPullbackLab: lazyLab(() =>
      import(
        "@/components/visualizations/jacobians/JacobianIntegralPullbackLab"
      ).then((m) => m.JacobianIntegralPullbackLab)),
  ImproperIntegralConvergenceLab: lazyLab(() =>
      import(
        "@/components/visualizations/integral-calculus/ImproperIntegralConvergenceLab"
      ).then((m) => m.ImproperIntegralConvergenceLab)),
  ConvergenceTestsTutorialLab: lazyLab(() =>
      import(
        "@/components/visualizations/integral-calculus/ConvergenceTestsTutorialLab"
      ).then((m) => m.ConvergenceTestsTutorialLab)),
  GammaFunctionLab: lazyLab(() =>
      import(
        "@/components/visualizations/integral-calculus/GammaFunctionLab"
      ).then((m) => m.GammaFunctionLab)),
  BetaFunctionLab: lazyLab(() =>
      import(
        "@/components/visualizations/integral-calculus/BetaFunctionLab"
      ).then((m) => m.BetaFunctionLab)),

  // Volume III — Module 3.3
  VectorGradientCalculatorLab: lazyLab(() =>
      import(
        "@/components/visualizations/vector-calculus/VectorGradientCalculatorLab"
      ).then((m) => m.VectorGradientCalculatorLab)),
  DirectionalDerivativeCalculatorLab: lazyLab(() =>
      import(
        "@/components/visualizations/vector-calculus/DirectionalDerivativeCalculatorLab"
      ).then((m) => m.DirectionalDerivativeCalculatorLab)),
  DivCurlProbeLab: lazyLab(() =>
      import("@/components/visualizations/vector-calculus/DivCurlProbeLab").then(
        (m) => m.DivCurlProbeLab
      )),
  VectorFieldStreamlineExplorerLab: lazyLab(() =>
      import(
        "@/components/visualizations/vector-calculus/VectorFieldStreamlineExplorerLab"
      ).then((m) => m.VectorFieldStreamlineExplorerLab)),
  DivCurlDecompositionLab: lazyLab(() =>
      import(
        "@/components/visualizations/vector-calculus/DivCurlDecompositionLab"
      ).then((m) => m.DivCurlDecompositionLab)),
  LineIntegralWorkLab: lazyLab(() =>
      import(
        "@/components/visualizations/vector-calculus/LineIntegralWorkLab"
      ).then((m) => m.LineIntegralWorkLab)),
  GreensTheoremLab: lazyLab(() =>
      import(
        "@/components/visualizations/vector-calculus/GreensTheoremLab"
      ).then((m) => m.GreensTheoremLab)),
  SurfaceFluxLab: lazyLab(() =>
      import("@/components/visualizations/vector-calculus/SurfaceFluxLab").then(
        (m) => m.SurfaceFluxLab
      )),
  StokesTheoremLab: lazyLab(() =>
      import(
        "@/components/visualizations/vector-calculus/StokesTheoremLab"
      ).then((m) => m.StokesTheoremLab)),
  DivergenceTheoremLab: lazyLab(() =>
      import(
        "@/components/visualizations/vector-calculus/DivergenceTheoremLab"
      ).then((m) => m.DivergenceTheoremLab)),

  // Volume IV — Modules 4.1–4.4
  SlopeFieldTracerLab: lazyLab(() =>
      import(
        "@/components/visualizations/differential-equations/SlopeFieldTracerLab"
      ).then((m) => m.SlopeFieldTracerLab)),
  AutonomousPhaseLineLab: lazyLab(() =>
      import(
        "@/components/visualizations/differential-equations/AutonomousPhaseLineLab"
      ).then((m) => m.AutonomousPhaseLineLab)),
  HarmonicOscillatorLab: lazyLab(() =>
      import(
        "@/components/visualizations/differential-equations/HarmonicOscillatorLab"
      ).then((m) => m.HarmonicOscillatorLab)),
  ForcedResonanceLab: lazyLab(() =>
      import(
        "@/components/visualizations/differential-equations/ForcedResonanceLab"
      ).then((m) => m.ForcedResonanceLab)),
  TraceDeterminantPhaseLab: lazyLab(() =>
      import(
        "@/components/visualizations/differential-equations/TraceDeterminantPhaseLab"
      ).then((m) => m.TraceDeterminantPhaseLab)),
  NonlinearPhasePortraitLab: lazyLab(() =>
      import(
        "@/components/visualizations/differential-equations/NonlinearPhasePortraitLab"
      ).then((m) => m.NonlinearPhasePortraitLab)),
  HeatEquationDiffusionLab: lazyLab(() =>
      import(
        "@/components/visualizations/differential-equations/HeatEquationDiffusionLab"
      ).then((m) => m.HeatEquationDiffusionLab)),
  WaveEquationModesLab: lazyLab(() =>
      import(
        "@/components/visualizations/differential-equations/WaveEquationModesLab"
      ).then((m) => m.WaveEquationModesLab)),

  // Volume V — Modules 5.1–5.4
  EulerHelixPhasorLab: lazyLab(() =>
      import(
        "@/components/visualizations/transforms-complex/EulerHelixPhasorLab"
      ).then((m) => m.EulerHelixPhasorLab)),
  ConformalMappingLab: lazyLab(() =>
      import(
        "@/components/visualizations/transforms-complex/ConformalMappingLab"
      ).then((m) => m.ConformalMappingLab)),
  CauchyContourLab: lazyLab(() =>
      import(
        "@/components/visualizations/transforms-complex/CauchyContourLab"
      ).then((m) => m.CauchyContourLab)),
  ResidueTheoremLab: lazyLab(() =>
      import(
        "@/components/visualizations/transforms-complex/ResidueTheoremLab"
      ).then((m) => m.ResidueTheoremLab)),
  LaplaceSPlane3DLab: lazyLab(() =>
      import(
        "@/components/visualizations/transforms-complex/LaplaceSPlane3DLab"
      ).then((m) => m.LaplaceSPlane3DLab)),
  ConvolutionFlipSlideLab: lazyLab(() =>
      import(
        "@/components/visualizations/transforms-complex/ConvolutionFlipSlideLab"
      ).then((m) => m.ConvolutionFlipSlideLab)),
  FourierSeriesGibbsLab: lazyLab(() =>
      import(
        "@/components/visualizations/transforms-complex/FourierSeriesGibbsLab"
      ).then((m) => m.FourierSeriesGibbsLab)),
  FourierTransformWindingLab: lazyLab(() =>
      import(
        "@/components/visualizations/transforms-complex/FourierTransformWindingLab"
      ).then((m) => m.FourierTransformWindingLab)),

  // Volume VI — Modules 6.1–6.2
  PDFCDFMomentLab: lazyLab(() =>
      import(
        "@/components/visualizations/probability-numerical/PDFCDFMomentLab"
      ).then((m) => m.PDFCDFMomentLab)),
  BivariateGaussianLab: lazyLab(() =>
      import(
        "@/components/visualizations/probability-numerical/BivariateGaussianLab"
      ).then((m) => m.BivariateGaussianLab)),
  NumericalQuadratureLab: lazyLab(() =>
      import(
        "@/components/visualizations/probability-numerical/NumericalQuadratureLab"
      ).then((m) => m.NumericalQuadratureLab)),
  RungeKuttaSlopeLab: lazyLab(() =>
      import(
        "@/components/visualizations/probability-numerical/RungeKuttaSlopeLab"
      ).then((m) => m.RungeKuttaSlopeLab)),

  // Statistics Volume — Module S.1
  HistogramBinningShapeLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/HistogramBinningShapeLab"
      ).then((m) => m.HistogramBinningShapeLab)),
  MeanMedianSeesawLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/MeanMedianSeesawLab"
      ).then((m) => m.MeanMedianSeesawLab)),
  SpreadBoxplotBesselLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/SpreadBoxplotBesselLab"
      ).then((m) => m.SpreadBoxplotBesselLab)),

  // Statistics Volume — Module S.2
  VennProbabilityAreaLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/VennProbabilityAreaLab"
      ).then((m) => m.VennProbabilityAreaLab)),
  BayesMosaicTreeLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/BayesMosaicTreeLab"
      ).then((m) => m.BayesMosaicTreeLab)),
  GaltonBoardDiscreteLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/GaltonBoardDiscreteLab"
      ).then((m) => m.GaltonBoardDiscreteLab)),

  // Statistics Volume — Module S.3
  NormalZScoreQQPlotLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/NormalZScoreQQPlotLab"
      ).then((m) => m.NormalZScoreQQPlotLab)),
  CentralLimitTheoremAnimatorLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/CentralLimitTheoremAnimatorLab"
      ).then((m) => m.CentralLimitTheoremAnimatorLab)),
  SamplingDistributionsTChi2FLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/SamplingDistributionsTChi2FLab"
      ).then((m) => m.SamplingDistributionsTChi2FLab)),

  // Statistics Volume — Module S.4
  MaximumLikelihoodBiasVarianceLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/MaximumLikelihoodBiasVarianceLab"
      ).then((m) => m.MaximumLikelihoodBiasVarianceLab)),
  ConfidenceIntervalCoverageLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/ConfidenceIntervalCoverageLab"
      ).then((m) => m.ConfidenceIntervalCoverageLab)),
  HypothesisPowerOverlapLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/HypothesisPowerOverlapLab"
      ).then((m) => m.HypothesisPowerOverlapLab)),
  TwoSamplePairedWelchLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/TwoSamplePairedWelchLab"
      ).then((m) => m.TwoSamplePairedWelchLab)),
  ChiSquareContingencySimpsonLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/ChiSquareContingencySimpsonLab"
      ).then((m) => m.ChiSquareContingencySimpsonLab)),
  AnovaBetweenWithinLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/AnovaBetweenWithinLab"
      ).then((m) => m.AnovaBetweenWithinLab)),
  OLSRegressionAnscombeLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/OLSRegressionAnscombeLab"
      ).then((m) => m.OLSRegressionAnscombeLab)),
  MultipleRegression3DRegularizationLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/MultipleRegression3DRegularizationLab"
      ).then((m) => m.MultipleRegression3DRegularizationLab)),
  BayesianUpdatingAndBootstrapLab: lazyLab(() =>
      import(
        "@/components/visualizations/statistics/BayesianUpdatingAndBootstrapLab"
      ).then((m) => m.BayesianUpdatingAndBootstrapLab)),
  HowToUseInteractiveDemo: lazyLab(() =>
      import("@/components/visualizations/HowToUseInteractiveDemo").then(
        (m) => m.HowToUseInteractiveDemo
      )),
} satisfies Record<string, LazyExoticComponent<ComponentType>>;

export type LabComponentName = keyof typeof LAB_COMPONENTS;

export function DynamicLabRenderer({ name }: { name: LabComponentName }) {
  const LabComponent = LAB_COMPONENTS[name];
  return (
    <Suspense fallback={<LabLoadingSkeleton />}>
      <LabComponent />
    </Suspense>
  );
}
