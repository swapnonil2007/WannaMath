import { VolumeMetadata } from "./types";

export const VOL2_LINEAR_ALGEBRA: VolumeMetadata = {
  id: "vol-2",
  volumeNumber: "II",
  slug: "linear-algebra",
  title: "Linear Algebra & Space Geometry",
  shortTitle: "Linear Algebra",
  accentToken: "--math-var-y",
  accentHex: "#96B898",
  description:
    "Matrices as geometric linear transformations of 2D and 3D space: vector span, basis changes, determinants as oriented volume scaling, the four fundamental subspaces, eigensystems, and Singular Value Decomposition (SVD).",
  engineeringApplications: [
    "Robotic Manipulator Kinematics & Coordinate Frames",
    "Structural Stiffness Matrices & Modal Vibration Analysis",
    "Principal Component Analysis (PCA) & Low-Rank SVD Compression",
    "Least-Squares Sensor Fusion & State Estimation",
  ],
  modules: [
    {
      id: "mod-2-1",
      slug: "vectors-subspaces",
      numberLabel: "2.1",
      title: "Vectors, Span & The Fundamental Subspaces",
      description:
        "Linear combinations, independence, basis coordinate grids, and the orthogonal geometry of column space and nullspace.",
      accentHex: "#96B898",
      chapters: [
        {
          id: "2.1.1",
          slug: "vectors-linear-combinations",
          title: "Vectors, Linear Combinations & Span in 2D/3D",
          subtitle:
            "Sweep scalar weights c₁v₁ + c₂v₂ to see when vectors span a line, a plane, or all of ℝ³.",
          status: "planned",
          estimatedMinutes: 25,
          prerequisites: [],
          dimensionBadge: "2D + 3D",
          accentHex: "#96B898",
          keyEquationsLatex: [
            "\\mathbf{w} = c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 + \\cdots + c_k\\mathbf{v}_k",
            "\\operatorname{span}\\{\\mathbf{v}_1, \\mathbf{v}_2\\}",
          ],
          labs: [
            {
              id: "lab-2-1-1a",
              slug: "vector-span-explorer",
              title: "2D/3D Linear Combination & Subspace Span Explorer",
              componentKey: "VectorSpanExplorerLab",
              summary:
                "Drag vectors v₁, v₂ and scalar sliders c₁, c₂ to inspect collinear collapse vs. planar span.",
              formulaLatex: "\\mathbf{b} = x_1\\mathbf{a}_1 + x_2\\mathbf{a}_2",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "2.1.2",
          slug: "basis-change-of-basis",
          title: "Linear Independence, Basis & Change of Basis",
          subtitle:
            "Translate coordinates of the same physical point between standard basis (î, ĵ) and a custom oblique basis (b₁, b₂).",
          status: "planned",
          estimatedMinutes: 25,
          prerequisites: ["2.1.1"],
          dimensionBadge: "2D",
          accentHex: "#96B898",
          keyEquationsLatex: [
            "[\\mathbf{x}]_{\\mathcal{B}} = P^{-1}\\mathbf{x}",
          ],
          labs: [
            {
              id: "lab-2-1-2a",
              slug: "change-of-basis-grid",
              title: "Dual-Grid Change of Basis Coordinate Translator",
              componentKey: "ChangeOfBasisLab",
              summary:
                "Overlay custom basis lattice B on standard Cartesian space.",
              formulaLatex: "\\mathbf{x} = P[\\mathbf{x}]_{\\mathcal{B}}",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "2.1.3",
          slug: "four-fundamental-subspaces",
          title: "The Four Fundamental Subspaces & Rank-Nullity",
          subtitle:
            "Visualize how matrix A maps Row Space bijectively to Column Space while collapsing Nullspace to the origin.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["2.1.2"],
          dimensionBadge: "2D + 3D",
          accentHex: "#96B898",
          keyEquationsLatex: [
            "\\mathcal{R}(A^T) \\perp \\mathcal{N}(A), \\qquad \\mathcal{C}(A) \\perp \\mathcal{N}(A^T)",
            "\\operatorname{rank}(A) + \\dim \\mathcal{N}(A) = n",
          ],
          labs: [
            {
              id: "lab-2-1-3a",
              slug: "fundamental-subspaces-strang",
              title: "Strang's Four Fundamental Subspaces Action Diagram",
              componentKey: "FourSubspacesLab",
              summary:
                "Decompose any vector x = x_row + x_null and watch A(x_row + x_null) = Ax_row.",
              formulaLatex: "A(\\mathbf{x}_r + \\mathbf{x}_n) = A\\mathbf{x}_r + \\mathbf{0}",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-2-2",
      slug: "linear-transformations",
      numberLabel: "2.2",
      title: "Matrices as Linear Transformations & Determinants",
      description:
        "Shear, rotation, reflection, projection, determinants as signed area/volume scaling, and orthogonal least-squares.",
      accentHex: "#D35323",
      chapters: [
        {
          id: "2.2.1",
          slug: "matrix-transformations-2d-3d",
          title: "Matrix Multiplication as Composition of Transformations",
          subtitle:
            "Follow where the basis columns [a₁ | a₂] land to read any 2×2 or 3×3 matrix geometrically.",
          status: "planned",
          estimatedMinutes: 25,
          prerequisites: ["2.1.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#D35323",
          keyEquationsLatex: [
            "A\\mathbf{x} = x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2",
            "(BA)\\mathbf{x} = B(A\\mathbf{x})",
          ],
          labs: [
            {
              id: "lab-2-2-1a",
              slug: "matrix-grid-homotopy",
              title: "Interactive Matrix Grid Homotopy & Composition Lab",
              componentKey: "MatrixTransformationLab",
              summary:
                "Drag matrix column tips a₁, a₂ and compare AB vs. BA non-commutativity.",
              formulaLatex: "T(\\mathbf{x}) = A\\mathbf{x}",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "2.2.2",
          slug: "determinants-volume-scaling",
          title: "Determinants as Oriented Area & Parallelepiped Volume Scaling",
          subtitle:
            "See det(A) as the signed scaling factor of any region's area/volume and why det(A) = 0 collapses dimension.",
          status: "planned",
          estimatedMinutes: 25,
          prerequisites: ["2.2.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#D35323",
          keyEquationsLatex: [
            "\\text{Area}(A(S)) = |\\det A|\\cdot\\text{Area}(S)",
            "\\det[\\mathbf{a}_1\\;\\mathbf{a}_2\\;\\mathbf{a}_3] = \\mathbf{a}_1 \\cdot (\\mathbf{a}_2 \\times \\mathbf{a}_3)",
          ],
          labs: [
            {
              id: "lab-2-2-2a",
              slug: "determinant-parallelepiped-lab",
              title: "2D Parallelogram & 3D Parallelepiped Determinant Inspector",
              componentKey: "DeterminantVolumeLab",
              summary:
                "Manipulate column vectors to observe area/volume scaling, orientation flip (det < 0), and singular collapse (det = 0).",
              formulaLatex: "\\det(AB) = (\\det A)(\\det B)",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "2.2.3",
          slug: "orthogonality-least-squares",
          title: "Orthogonality, Projections & Least-Squares Fitting",
          subtitle:
            "Project an unreachable vector b orthogonally onto Column Space C(A) so the residual e = b - Âx is perpendicular.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["2.1.3"],
          dimensionBadge: "2D + 3D",
          accentHex: "#8D9FCE",
          keyEquationsLatex: [
            "A^T A\\,\\hat{\\mathbf{x}} = A^T\\mathbf{b}",
            "P = A(A^T A)^{-1}A^T",
          ],
          labs: [
            {
              id: "lab-2-2-3a",
              slug: "least-squares-subspace-projection",
              title: "3D Subspace Orthogonal Projection & Regression Line Lab",
              componentKey: "LeastSquaresProjectionLab",
              summary:
                "Synchronize 3D column-space projection p = A x̂ with 2D least-squares data fitting.",
              formulaLatex: "\\|\\mathbf{b} - A\\hat{\\mathbf{x}}\\|_2 = \\min",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
      ],
    },
    {
      id: "mod-2-3",
      slug: "eigen-systems-svd",
      numberLabel: "2.3",
      title: "Eigen-Systems, Diagonalization & SVD",
      description:
        "Invariant eigenvector axes, coupled dynamical diagonalization, symmetric quadratic forms, and Singular Value Decomposition.",
      accentHex: "#029091",
      chapters: [
        {
          id: "2.3.1",
          slug: "eigenvalues-eigenvectors",
          title: "Eigenvalues, Eigenvectors & Invariant Directions",
          subtitle:
            "Sweep unit circle vector v until Av aligns collinearly with v, revealing the invariant axes of A.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["2.2.1", "2.2.2"],
          dimensionBadge: "2D",
          accentHex: "#029091",
          keyEquationsLatex: [
            "A\\mathbf{v} = \\lambda\\mathbf{v} \\iff \\det(A - \\lambda I) = 0",
            "A = P\\Lambda P^{-1}",
          ],
          labs: [
            {
              id: "lab-2-3-1a",
              slug: "eigen-clock-compass",
              title: "Interactive Eigenvector Compass & Characteristic Polynomial Lab",
              componentKey: "EigenvectorCompassLab",
              summary:
                "Rotate input vector v around the unit circle and track Av alignment.",
              formulaLatex: "(A - \\lambda I)\\mathbf{v} = \\mathbf{0}",
              dimensionBadge: "2D",
            },
          ],
        },
        {
          id: "2.3.2",
          slug: "quadratic-forms-spectral",
          title: "Spectral Theorem, Quadratic Forms & Principal Axes",
          subtitle:
            "Diagonalize symmetric matrices Q = Qᵀ via orthogonal eigenvectors to align ellipses/hyperboloids with principal axes.",
          status: "planned",
          estimatedMinutes: 25,
          prerequisites: ["2.3.1"],
          dimensionBadge: "2D + 3D",
          accentHex: "#029091",
          keyEquationsLatex: [
            "q(\\mathbf{x}) = \\mathbf{x}^T A \\mathbf{x} = \\lambda_1 y_1^2 + \\lambda_2 y_2^2",
            "A = Q\\Lambda Q^T",
          ],
          labs: [
            {
              id: "lab-2-3-2a",
              slug: "quadratic-form-bowl",
              title: "3D Quadratic Form Surface & Principal Axis Rotator",
              componentKey: "QuadraticFormLab",
              summary:
                "Inspect positive-definite bowls, indefinite saddles, and principal axis contours.",
              formulaLatex: "\\mathbf{x}^T A \\mathbf{x} = c",
              dimensionBadge: "2D + 3D",
            },
          ],
        },
        {
          id: "2.3.3",
          slug: "singular-value-decomposition",
          title: "Singular Value Decomposition (SVD) Geometry",
          subtitle:
            "Factor any matrix A = U Σ Vᵀ into an input rotation Vᵀ, principal axis stretch Σ, and output rotation U.",
          status: "planned",
          estimatedMinutes: 30,
          prerequisites: ["2.3.2"],
          dimensionBadge: "2D + 3D",
          accentHex: "#029091",
          keyEquationsLatex: [
            "A = U\\Sigma V^T = \\sum_{i=1}^{r} \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^T",
          ],
          labs: [
            {
              id: "lab-2-3-3a",
              slug: "svd-three-stage-stepper",
              title: "Three-Stage SVD Unit Circle → Hyperellipse Decomposition Lab",
              componentKey: "SVDThreeStageLab",
              summary:
                "Step through Vᵀ (rotate), Σ (stretch by σ₁, σ₂), and U (rotate).",
              formulaLatex: "A\\mathbf{v}_i = \\sigma_i\\mathbf{u}_i",
              dimensionBadge: "2D",
            },
          ],
        },
      ],
    },
  ],
};
