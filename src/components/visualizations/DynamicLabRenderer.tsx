"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { LabLoadingSkeleton } from "@/components/visualizations/LabLoadingSkeleton";

const renderLabLoading = () => <LabLoadingSkeleton />;

const LAB_COMPONENTS = {
  // Volume I — Module 1.1
  EpsilonDeltaCorridorLab: dynamic(
    () =>
      import(
        "@/components/visualizations/single-variable/EpsilonDeltaCorridorLab"
      ).then((m) => m.EpsilonDeltaCorridorLab),
    { loading: renderLabLoading }
  ),
  IVTBisectionLab: dynamic(
    () =>
      import(
        "@/components/visualizations/single-variable/IVTBisectionLab"
      ).then((m) => m.IVTBisectionLab),
    { loading: renderLabLoading }
  ),

  // Volume I — Module 1.2
  SecantTangentLab: dynamic(
    () =>
      import(
        "@/components/visualizations/single-variable/SecantTangentLab"
      ).then((m) => m.SecantTangentLab),
    { loading: renderLabLoading }
  ),
  NewtonRaphsonLab: dynamic(
    () =>
      import(
        "@/components/visualizations/single-variable/NewtonRaphsonLab"
      ).then((m) => m.NewtonRaphsonLab),
    { loading: renderLabLoading }
  ),
  ChainRulePropagatorLab: dynamic(
    () =>
      import(
        "@/components/visualizations/single-variable/ChainRulePropagatorLab"
      ).then((m) => m.ChainRulePropagatorLab),
    { loading: renderLabLoading }
  ),
  TaylorCurvatureLab: dynamic(
    () =>
      import(
        "@/components/visualizations/single-variable/TaylorCurvatureLab"
      ).then((m) => m.TaylorCurvatureLab),
    { loading: renderLabLoading }
  ),

  // Volume I — Module 1.3
  Riemann1DLab: dynamic(
    () =>
      import("@/components/visualizations/single-variable/Riemann1DLab").then(
        (m) => m.Riemann1DLab
      ),
    { loading: renderLabLoading }
  ),
  FTCAccumulationLab: dynamic(
    () =>
      import(
        "@/components/visualizations/single-variable/FTCAccumulationLab"
      ).then((m) => m.FTCAccumulationLab),
    { loading: renderLabLoading }
  ),
  SubstitutionIBPLab: dynamic(
    () =>
      import(
        "@/components/visualizations/single-variable/SubstitutionIBPLab"
      ).then((m) => m.SubstitutionIBPLab),
    { loading: renderLabLoading }
  ),
  SolidOfRevolutionLab: dynamic(
    () =>
      import(
        "@/components/visualizations/single-variable/SolidOfRevolutionLab"
      ).then((m) => m.SolidOfRevolutionLab),
    { loading: renderLabLoading }
  ),

  // Volume I — Module 1.4
  PartialSumSeriesLab: dynamic(
    () =>
      import(
        "@/components/visualizations/single-variable/PartialSumSeriesLab"
      ).then((m) => m.PartialSumSeriesLab),
    { loading: renderLabLoading }
  ),
  PowerSeriesConvergenceLab: dynamic(
    () =>
      import(
        "@/components/visualizations/single-variable/PowerSeriesConvergenceLab"
      ).then((m) => m.PowerSeriesConvergenceLab),
    { loading: renderLabLoading }
  ),

  // Volume II — Modules 2.1–2.3
  VectorSpanExplorerLab: dynamic(
    () =>
      import(
        "@/components/visualizations/linear-algebra/VectorSpanExplorerLab"
      ).then((m) => m.VectorSpanExplorerLab),
    { loading: renderLabLoading }
  ),
  ChangeOfBasisLab: dynamic(
    () =>
      import(
        "@/components/visualizations/linear-algebra/ChangeOfBasisLab"
      ).then((m) => m.ChangeOfBasisLab),
    { loading: renderLabLoading }
  ),
  FourSubspacesLab: dynamic(
    () =>
      import(
        "@/components/visualizations/linear-algebra/FourSubspacesLab"
      ).then((m) => m.FourSubspacesLab),
    { loading: renderLabLoading }
  ),
  MatrixTransformationLab: dynamic(
    () =>
      import(
        "@/components/visualizations/linear-algebra/MatrixTransformationLab"
      ).then((m) => m.MatrixTransformationLab),
    { loading: renderLabLoading }
  ),
  DeterminantVolumeLab: dynamic(
    () =>
      import(
        "@/components/visualizations/linear-algebra/DeterminantVolumeLab"
      ).then((m) => m.DeterminantVolumeLab),
    { loading: renderLabLoading }
  ),
  LeastSquaresProjectionLab: dynamic(
    () =>
      import(
        "@/components/visualizations/linear-algebra/LeastSquaresProjectionLab"
      ).then((m) => m.LeastSquaresProjectionLab),
    { loading: renderLabLoading }
  ),
  EigenvectorCompassLab: dynamic(
    () =>
      import(
        "@/components/visualizations/linear-algebra/EigenvectorCompassLab"
      ).then((m) => m.EigenvectorCompassLab),
    { loading: renderLabLoading }
  ),
  QuadraticFormLab: dynamic(
    () =>
      import(
        "@/components/visualizations/linear-algebra/QuadraticFormLab"
      ).then((m) => m.QuadraticFormLab),
    { loading: renderLabLoading }
  ),
  SVDThreeStageLab: dynamic(
    () =>
      import(
        "@/components/visualizations/linear-algebra/SVDThreeStageLab"
      ).then((m) => m.SVDThreeStageLab),
    { loading: renderLabLoading }
  ),

  // Volume III — Module 3.1
  SurfaceContourSlicerLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/SurfaceContourSlicerLab"
      ).then((m) => m.SurfaceContourSlicerLab),
    { loading: renderLabLoading }
  ),
  PartialDerivativeTangentPlaneLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/PartialDerivativeTangentPlaneLab"
      ).then((m) => m.PartialDerivativeTangentPlaneLab),
    { loading: renderLabLoading }
  ),
  GradientDirectionalDerivativeLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/GradientDirectionalDerivativeLab"
      ).then((m) => m.GradientDirectionalDerivativeLab),
    { loading: renderLabLoading }
  ),
  GradientAscentAndLevelSurfaceLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/GradientAscentAndLevelSurfaceLab"
      ).then((m) => m.GradientAscentAndLevelSurfaceLab),
    { loading: renderLabLoading }
  ),
  LagrangeMultipliersLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/LagrangeMultipliersLab"
      ).then((m) => m.LagrangeMultipliersLab),
    { loading: renderLabLoading }
  ),
  MultivariableLimitsPathsLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/MultivariableLimitsPathsLab"
      ).then((m) => m.MultivariableLimitsPathsLab),
    { loading: renderLabLoading }
  ),
  DifferentiabilityErrorConeLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/DifferentiabilityErrorConeLab"
      ).then((m) => m.DifferentiabilityErrorConeLab),
    { loading: renderLabLoading }
  ),
  HigherOrderChainImplicitLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/HigherOrderChainImplicitLab"
      ).then((m) => m.HigherOrderChainImplicitLab),
    { loading: renderLabLoading }
  ),
  SingleVariableTaylorLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/SingleVariableTaylorLab"
      ).then((m) => m.SingleVariableTaylorLab),
    { loading: renderLabLoading }
  ),
  MultivariableTaylorHessianLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/MultivariableTaylorHessianLab"
      ).then((m) => m.MultivariableTaylorHessianLab),
    { loading: renderLabLoading }
  ),
  HomogeneousScalingRayLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/HomogeneousScalingRayLab"
      ).then((m) => m.HomogeneousScalingRayLab),
    { loading: renderLabLoading }
  ),
  EulersTheoremSecondOrderLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/EulersTheoremSecondOrderLab"
      ).then((m) => m.EulersTheoremSecondOrderLab),
    { loading: renderLabLoading }
  ),
  HessianSecondDerivativeTestLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/HessianSecondDerivativeTestLab"
      ).then((m) => m.HessianSecondDerivativeTestLab),
    { loading: renderLabLoading }
  ),
  GeneralMethodDegenerateExtremaLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/GeneralMethodDegenerateExtremaLab"
      ).then((m) => m.GeneralMethodDegenerateExtremaLab),
    { loading: renderLabLoading }
  ),
  LinearOdeIntegratingFactorLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/LinearOdeIntegratingFactorLab"
      ).then((m) => m.LinearOdeIntegratingFactorLab),
    { loading: renderLabLoading }
  ),
  BernoulliReductionLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/BernoulliReductionLab"
      ).then((m) => m.BernoulliReductionLab),
    { loading: renderLabLoading }
  ),
  WronskianPhaseAreaLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/WronskianPhaseAreaLab"
      ).then((m) => m.WronskianPhaseAreaLab),
    { loading: renderLabLoading }
  ),
  CharacteristicRootsSolutionLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/CharacteristicRootsSolutionLab"
      ).then((m) => m.CharacteristicRootsSolutionLab),
    { loading: renderLabLoading }
  ),
  OperatorMethodTutorialLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/OperatorMethodTutorialLab"
      ).then((m) => m.OperatorMethodTutorialLab),
    { loading: renderLabLoading }
  ),
  VariationOfParametersCauchyEulerLab: dynamic(
    () =>
      import(
        "@/components/visualizations/multivariable-differentiation/VariationOfParametersCauchyEulerLab"
      ).then((m) => m.VariationOfParametersCauchyEulerLab),
    { loading: renderLabLoading }
  ),

  // Volume III — Module 3.2
  RiemannVolumeLab: dynamic(
    () =>
      import("@/components/visualizations/double-integrals/RiemannVolumeLab").then(
        (m) => m.RiemannVolumeLab
      ),
    { loading: renderLabLoading }
  ),
  IteratedOrderChangeLab: dynamic(
    () =>
      import(
        "@/components/visualizations/double-integrals/IteratedOrderChangeLab"
      ).then((m) => m.IteratedOrderChangeLab),
    { loading: renderLabLoading }
  ),
  TripleIntegralOrderLab: dynamic(
    () =>
      import(
        "@/components/visualizations/triple-integrals/TripleIntegralOrderLab"
      ).then((m) => m.TripleIntegralOrderLab),
    { loading: renderLabLoading }
  ),
  TripleVoxelDensityLab: dynamic(
    () =>
      import(
        "@/components/visualizations/triple-integrals/TripleVoxelDensityLab"
      ).then((m) => m.TripleVoxelDensityLab),
    { loading: renderLabLoading }
  ),
  PolarCoordinateAreaLab: dynamic(
    () =>
      import(
        "@/components/visualizations/coordinate-systems/PolarCoordinateAreaLab"
      ).then((m) => m.PolarCoordinateAreaLab),
    { loading: renderLabLoading }
  ),
  Curvilinear3DSurfacesAndElementLab: dynamic(
    () =>
      import(
        "@/components/visualizations/coordinate-systems/Curvilinear3DSurfacesAndElementLab"
      ).then((m) => m.Curvilinear3DSurfacesAndElementLab),
    { loading: renderLabLoading }
  ),
  DualGridMorphingAndTangentLab: dynamic(
    () =>
      import(
        "@/components/visualizations/jacobians/DualGridMorphingAndTangentLab"
      ).then((m) => m.DualGridMorphingAndTangentLab),
    { loading: renderLabLoading }
  ),
  JacobianIntegralPullbackLab: dynamic(
    () =>
      import(
        "@/components/visualizations/jacobians/JacobianIntegralPullbackLab"
      ).then((m) => m.JacobianIntegralPullbackLab),
    { loading: renderLabLoading }
  ),
  ImproperIntegralConvergenceLab: dynamic(
    () =>
      import(
        "@/components/visualizations/integral-calculus/ImproperIntegralConvergenceLab"
      ).then((m) => m.ImproperIntegralConvergenceLab),
    { loading: renderLabLoading }
  ),
  ConvergenceTestsTutorialLab: dynamic(
    () =>
      import(
        "@/components/visualizations/integral-calculus/ConvergenceTestsTutorialLab"
      ).then((m) => m.ConvergenceTestsTutorialLab),
    { loading: renderLabLoading }
  ),
  GammaFunctionLab: dynamic(
    () =>
      import(
        "@/components/visualizations/integral-calculus/GammaFunctionLab"
      ).then((m) => m.GammaFunctionLab),
    { loading: renderLabLoading }
  ),
  BetaFunctionLab: dynamic(
    () =>
      import(
        "@/components/visualizations/integral-calculus/BetaFunctionLab"
      ).then((m) => m.BetaFunctionLab),
    { loading: renderLabLoading }
  ),

  // Volume III — Module 3.3
  VectorGradientCalculatorLab: dynamic(
    () =>
      import(
        "@/components/visualizations/vector-calculus/VectorGradientCalculatorLab"
      ).then((m) => m.VectorGradientCalculatorLab),
    { loading: renderLabLoading }
  ),
  DirectionalDerivativeCalculatorLab: dynamic(
    () =>
      import(
        "@/components/visualizations/vector-calculus/DirectionalDerivativeCalculatorLab"
      ).then((m) => m.DirectionalDerivativeCalculatorLab),
    { loading: renderLabLoading }
  ),
  DivCurlProbeLab: dynamic(
    () =>
      import("@/components/visualizations/vector-calculus/DivCurlProbeLab").then(
        (m) => m.DivCurlProbeLab
      ),
    { loading: renderLabLoading }
  ),
  VectorFieldStreamlineExplorerLab: dynamic(
    () =>
      import(
        "@/components/visualizations/vector-calculus/VectorFieldStreamlineExplorerLab"
      ).then((m) => m.VectorFieldStreamlineExplorerLab),
    { loading: renderLabLoading }
  ),
  DivCurlDecompositionLab: dynamic(
    () =>
      import(
        "@/components/visualizations/vector-calculus/DivCurlDecompositionLab"
      ).then((m) => m.DivCurlDecompositionLab),
    { loading: renderLabLoading }
  ),
  LineIntegralWorkLab: dynamic(
    () =>
      import(
        "@/components/visualizations/vector-calculus/LineIntegralWorkLab"
      ).then((m) => m.LineIntegralWorkLab),
    { loading: renderLabLoading }
  ),
  GreensTheoremLab: dynamic(
    () =>
      import(
        "@/components/visualizations/vector-calculus/GreensTheoremLab"
      ).then((m) => m.GreensTheoremLab),
    { loading: renderLabLoading }
  ),
  SurfaceFluxLab: dynamic(
    () =>
      import("@/components/visualizations/vector-calculus/SurfaceFluxLab").then(
        (m) => m.SurfaceFluxLab
      ),
    { loading: renderLabLoading }
  ),
  StokesDivergenceLab: dynamic(
    () =>
      import(
        "@/components/visualizations/vector-calculus/StokesDivergenceLab"
      ).then((m) => m.StokesDivergenceLab),
    { loading: renderLabLoading }
  ),

  // Volume IV — Modules 4.1–4.4
  SlopeFieldTracerLab: dynamic(
    () =>
      import(
        "@/components/visualizations/differential-equations/SlopeFieldTracerLab"
      ).then((m) => m.SlopeFieldTracerLab),
    { loading: renderLabLoading }
  ),
  AutonomousPhaseLineLab: dynamic(
    () =>
      import(
        "@/components/visualizations/differential-equations/AutonomousPhaseLineLab"
      ).then((m) => m.AutonomousPhaseLineLab),
    { loading: renderLabLoading }
  ),
  HarmonicOscillatorLab: dynamic(
    () =>
      import(
        "@/components/visualizations/differential-equations/HarmonicOscillatorLab"
      ).then((m) => m.HarmonicOscillatorLab),
    { loading: renderLabLoading }
  ),
  ForcedResonanceLab: dynamic(
    () =>
      import(
        "@/components/visualizations/differential-equations/ForcedResonanceLab"
      ).then((m) => m.ForcedResonanceLab),
    { loading: renderLabLoading }
  ),
  TraceDeterminantPhaseLab: dynamic(
    () =>
      import(
        "@/components/visualizations/differential-equations/TraceDeterminantPhaseLab"
      ).then((m) => m.TraceDeterminantPhaseLab),
    { loading: renderLabLoading }
  ),
  NonlinearPhasePortraitLab: dynamic(
    () =>
      import(
        "@/components/visualizations/differential-equations/NonlinearPhasePortraitLab"
      ).then((m) => m.NonlinearPhasePortraitLab),
    { loading: renderLabLoading }
  ),
  HeatEquationDiffusionLab: dynamic(
    () =>
      import(
        "@/components/visualizations/differential-equations/HeatEquationDiffusionLab"
      ).then((m) => m.HeatEquationDiffusionLab),
    { loading: renderLabLoading }
  ),
  WaveEquationModesLab: dynamic(
    () =>
      import(
        "@/components/visualizations/differential-equations/WaveEquationModesLab"
      ).then((m) => m.WaveEquationModesLab),
    { loading: renderLabLoading }
  ),

  // Volume V — Modules 5.1–5.4
  EulerHelixPhasorLab: dynamic(
    () =>
      import(
        "@/components/visualizations/transforms-complex/EulerHelixPhasorLab"
      ).then((m) => m.EulerHelixPhasorLab),
    { loading: renderLabLoading }
  ),
  ConformalMappingLab: dynamic(
    () =>
      import(
        "@/components/visualizations/transforms-complex/ConformalMappingLab"
      ).then((m) => m.ConformalMappingLab),
    { loading: renderLabLoading }
  ),
  CauchyContourLab: dynamic(
    () =>
      import(
        "@/components/visualizations/transforms-complex/CauchyContourLab"
      ).then((m) => m.CauchyContourLab),
    { loading: renderLabLoading }
  ),
  ResidueTheoremLab: dynamic(
    () =>
      import(
        "@/components/visualizations/transforms-complex/ResidueTheoremLab"
      ).then((m) => m.ResidueTheoremLab),
    { loading: renderLabLoading }
  ),
  LaplaceSPlane3DLab: dynamic(
    () =>
      import(
        "@/components/visualizations/transforms-complex/LaplaceSPlane3DLab"
      ).then((m) => m.LaplaceSPlane3DLab),
    { loading: renderLabLoading }
  ),
  ConvolutionFlipSlideLab: dynamic(
    () =>
      import(
        "@/components/visualizations/transforms-complex/ConvolutionFlipSlideLab"
      ).then((m) => m.ConvolutionFlipSlideLab),
    { loading: renderLabLoading }
  ),
  FourierSeriesGibbsLab: dynamic(
    () =>
      import(
        "@/components/visualizations/transforms-complex/FourierSeriesGibbsLab"
      ).then((m) => m.FourierSeriesGibbsLab),
    { loading: renderLabLoading }
  ),
  FourierTransformWindingLab: dynamic(
    () =>
      import(
        "@/components/visualizations/transforms-complex/FourierTransformWindingLab"
      ).then((m) => m.FourierTransformWindingLab),
    { loading: renderLabLoading }
  ),

  // Volume VI — Modules 6.1–6.2
  PDFCDFMomentLab: dynamic(
    () =>
      import(
        "@/components/visualizations/probability-numerical/PDFCDFMomentLab"
      ).then((m) => m.PDFCDFMomentLab),
    { loading: renderLabLoading }
  ),
  BivariateGaussianLab: dynamic(
    () =>
      import(
        "@/components/visualizations/probability-numerical/BivariateGaussianLab"
      ).then((m) => m.BivariateGaussianLab),
    { loading: renderLabLoading }
  ),
  NumericalQuadratureLab: dynamic(
    () =>
      import(
        "@/components/visualizations/probability-numerical/NumericalQuadratureLab"
      ).then((m) => m.NumericalQuadratureLab),
    { loading: renderLabLoading }
  ),
  RungeKuttaSlopeLab: dynamic(
    () =>
      import(
        "@/components/visualizations/probability-numerical/RungeKuttaSlopeLab"
      ).then((m) => m.RungeKuttaSlopeLab),
    { loading: renderLabLoading }
  ),

  // Statistics Volume — Module S.1
  HistogramBinningShapeLab: dynamic(
    () =>
      import(
        "@/components/visualizations/statistics/HistogramBinningShapeLab"
      ).then((m) => m.HistogramBinningShapeLab),
    { loading: renderLabLoading }
  ),
  MeanMedianSeesawLab: dynamic(
    () =>
      import(
        "@/components/visualizations/statistics/MeanMedianSeesawLab"
      ).then((m) => m.MeanMedianSeesawLab),
    { loading: renderLabLoading }
  ),
  SpreadBoxplotBesselLab: dynamic(
    () =>
      import(
        "@/components/visualizations/statistics/SpreadBoxplotBesselLab"
      ).then((m) => m.SpreadBoxplotBesselLab),
    { loading: renderLabLoading }
  ),

  // Statistics Volume — Module S.2
  VennProbabilityAreaLab: dynamic(
    () =>
      import(
        "@/components/visualizations/statistics/VennProbabilityAreaLab"
      ).then((m) => m.VennProbabilityAreaLab),
    { loading: renderLabLoading }
  ),
  BayesMosaicTreeLab: dynamic(
    () =>
      import(
        "@/components/visualizations/statistics/BayesMosaicTreeLab"
      ).then((m) => m.BayesMosaicTreeLab),
    { loading: renderLabLoading }
  ),
  GaltonBoardDiscreteLab: dynamic(
    () =>
      import(
        "@/components/visualizations/statistics/GaltonBoardDiscreteLab"
      ).then((m) => m.GaltonBoardDiscreteLab),
    { loading: renderLabLoading }
  ),
} satisfies Record<string, ComponentType>;

export type LabComponentName = keyof typeof LAB_COMPONENTS;

export function DynamicLabRenderer({ name }: { name: LabComponentName }) {
  const LabComponent = LAB_COMPONENTS[name];
  return <LabComponent />;
}
