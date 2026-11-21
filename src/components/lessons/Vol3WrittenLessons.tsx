import React from "react";
import Link from "next/link";
import { KaTeXMath } from "@/components/math/KaTeXMath";

export function SurfacesLevelCurvesLesson() {
  return (
    <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
            First-Principles Geometry &amp; Surface Classification
          </span>
          <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
            Reading 3D Surfaces <KaTeXMath math="z = f(x, y)" /> from Vertical Traces &amp; Contour Maps
          </h2>
        </div>
        <Link
          href="/multivariable-calculus/differential-calculus/partial-derivatives-tangent-planes"
          className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-y)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-y)] transition-colors shrink-0"
        >
          Continue to Ch. 3.1.2 (Partials &amp; Planes) →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
            1. VERTICAL TRACES (x = c OR y = c)
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="z = f(c, y) \quad \text{and} \quad z = f(x, c)"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Freezing <KaTeXMath math="x = c" /> or <KaTeXMath math="y = c" /> intersects{" "}
            <KaTeXMath math="S" /> with a vertical coordinate curtain, turning the 3D surface into
            1D profile curves whose tangent slopes later become the partial derivatives{" "}
            <KaTeXMath math="f_y" /> and <KaTeXMath math="f_x" />.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
            2. HORIZONTAL LEVEL CURVES &amp; STEEPNESS
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="C_k = \{(x, y) : f(x, y) = k\}, \quad \Delta s \approx \frac{\Delta k}{\|\nabla f\|}"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            For equal height steps <KaTeXMath math="\Delta k" />, horizontal distance{" "}
            <KaTeXMath math="\Delta s" /> between adjacent contours is inversely proportional to{" "}
            <KaTeXMath math="\|\nabla f\|" />: crowded rings signify steep cliffs while wide gaps
            indicate flat plateaus.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
            3. TOPOGRAPHIC PEAKS, BOWLS &amp; SADDLES
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="z = x^2 + y^2 \text{ (ellipses)} \quad \text{vs.} \quad z = x^2 - y^2 \text{ (hyperbolas)}"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Nested closed ellipses around a point signal a local bowl or dome, whereas level
            curves forming hyperbolic arms meeting at an X-shaped crossing indicate a saddle pass.
          </p>
        </div>
      </div>

      <div className="border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 overflow-x-auto space-y-2">
        <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--text-muted)] block">
          Standard Quadric Surface Reference
        </span>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--border-strong)] text-[var(--text-muted)] font-tabular-mono uppercase">
              <th scope="col" className="py-2 pr-4">Quadric Surface</th>
              <th scope="col" className="py-2 pr-4">Canonical Equation</th>
              <th scope="col" className="py-2 pr-4">Horizontal Contours (z = k)</th>
              <th scope="col" className="py-2">Vertical Traces</th>
            </tr>
          </thead>
          <tbody className="font-math-serif text-[var(--text-secondary)]">
            <tr className="border-b border-[var(--border-subtle)]">
              <td className="py-2 pr-4 font-medium text-[var(--text-primary)]">Elliptic Paraboloid</td>
              <td className="py-2 pr-4"><KaTeXMath math="\frac{z}{c} = \frac{x^2}{a^2} + \frac{y^2}{b^2}" /></td>
              <td className="py-2 pr-4">Ellipses for <KaTeXMath math="z/c > 0" />; point at origin</td>
              <td className="py-2">Upward/downward parabolas</td>
            </tr>
            <tr className="border-b border-[var(--border-subtle)]">
              <td className="py-2 pr-4 font-medium text-[var(--text-primary)]">Hyperbolic Paraboloid (Saddle)</td>
              <td className="py-2 pr-4"><KaTeXMath math="\frac{z}{c} = \frac{x^2}{a^2} - \frac{y^2}{b^2}" /></td>
              <td className="py-2 pr-4">Hyperbolas; crossing lines at <KaTeXMath math="z = 0" /></td>
              <td className="py-2">Parabolas opening oppositely</td>
            </tr>
            <tr className="border-b border-[var(--border-subtle)]">
              <td className="py-2 pr-4 font-medium text-[var(--text-primary)]">Elliptic Cone</td>
              <td className="py-2 pr-4"><KaTeXMath math="\frac{z^2}{c^2} = \frac{x^2}{a^2} + \frac{y^2}{b^2}" /></td>
              <td className="py-2 pr-4">Ellipses expanding linearly with <KaTeXMath math="|z|" /></td>
              <td className="py-2">V-shaped line pairs (<KaTeXMath math="x=0" /> or <KaTeXMath math="y=0" />)</td>
            </tr>
            <tr className="border-b border-[var(--border-subtle)]">
              <td className="py-2 pr-4 font-medium text-[var(--text-primary)]">Ellipsoid</td>
              <td className="py-2 pr-4"><KaTeXMath math="\frac{x^2}{a^2} + \frac{y^2}{b^2} + \frac{z^2}{c^2} = 1" /></td>
              <td className="py-2 pr-4">Bounded ellipses for <KaTeXMath math="|z| < c" /></td>
              <td className="py-2">Bounded ellipses on all coordinate planes</td>
            </tr>
            <tr className="border-b border-[var(--border-subtle)]">
              <td className="py-2 pr-4 font-medium text-[var(--text-primary)]">Hyperboloid of One Sheet</td>
              <td className="py-2 pr-4"><KaTeXMath math="\frac{x^2}{a^2} + \frac{y^2}{b^2} - \frac{z^2}{c^2} = 1" /></td>
              <td className="py-2 pr-4">Ellipses for every <KaTeXMath math="z \in \mathbb{R}" /> (waist at <KaTeXMath math="z=0" />)</td>
              <td className="py-2">Hyperbolas (connected single sheet)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-[var(--text-primary)]">Hyperboloid of Two Sheets</td>
              <td className="py-2 pr-4"><KaTeXMath math="\frac{z^2}{c^2} - \frac{x^2}{a^2} - \frac{y^2}{b^2} = 1" /></td>
              <td className="py-2 pr-4">Ellipses for <KaTeXMath math="|z| > c" />; empty for <KaTeXMath math="|z| < c" /></td>
              <td className="py-2">Hyperbolas separated across <KaTeXMath math="z = \pm c" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function PartialDerivativesTangentPlanesLesson() {
  return (
    <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-y)] block">
            First-Principles Derivation &amp; Mixed-Partial Rigor
          </span>
          <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
            Tangent Plane Spanning, Clairaut Symmetry &amp; Implicit Slopes
          </h2>
        </div>
        <Link
          href="/formulas/multivariable-derivatives"
          className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-y)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-y)] transition-colors shrink-0"
        >
          Open Multivariable Derivative Sheet →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
            1. SPANNING THE TANGENT PLANE
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\mathbf{T}_x \times \mathbf{T}_y = \langle 1, 0, f_x \rangle \times \langle 0, 1, f_y \rangle = \langle -f_x, -f_y, 1 \rangle"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Taking the cross product of the <KaTeXMath math="x" />-slice tangent and{" "}
            <KaTeXMath math="y" />-slice tangent directly yields the surface normal{" "}
            <KaTeXMath math="\mathbf{n} = \langle -f_x, -f_y, 1 \rangle" />, producing the tangent
            plane <KaTeXMath math="z - z_0 = f_x(x_0, y_0)(x - x_0) + f_y(x_0, y_0)(y - y_0)" />.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-upper)] block">
            2. CLAIRAUT SYMMETRY &amp; PEANO&apos;S TRAP
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="f_{xy}(0,0) = -1 \neq +1 = f_{yx}(0,0) \quad \text{for } \frac{xy(x^2 - y^2)}{x^2 + y^2}"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Clairaut&apos;s Theorem guarantees <KaTeXMath math="f_{xy} = f_{yx}" /> whenever both mixed
            second partials exist and are <strong>continuous</strong> at{" "}
            <KaTeXMath math="(x_0, y_0)" />. Without continuity at <KaTeXMath math="(0,0)" />,
            differentiation order can disagree!
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
            3. CHAIN RULE &amp; IMPLICIT SHORTCUT
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\frac{dz}{dt} = f_x x'(t) + f_y y'(t), \qquad \frac{\partial z}{\partial x} = -\frac{F_x}{F_z} \;(F_z \neq 0)"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Multiply derivatives down every path from <KaTeXMath math="z" /> to an independent
            variable and sum the branches. For an implicit level surface <KaTeXMath math="F(x,y,z)=0" />,
            setting <KaTeXMath math="dF = 0" /> with <KaTeXMath math="dy = 0" /> isolates{" "}
            <KaTeXMath math="\partial z / \partial x = -F_x / F_z" /> instantly.
          </p>
        </div>
      </div>
    </section>
  );
}

export function LagrangeMultipliersLesson() {
  return (
    <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
      <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
        Contour-Tangency Proof, Sensitivity <KaTeXMath math="\lambda" /> &amp; Cusp Pitfalls
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
            1. TANGENCY PROOF ALONG g(r(t)) = c
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\left.\frac{d}{dt}f\bigl(\mathbf{r}(t)\bigr)\right|_{t^*} = \nabla f(\mathbf{p}^*) \cdot \mathbf{r}'(t^*) = 0"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Any smooth curve <KaTeXMath math="\mathbf{r}(t)" /> on the constraint{" "}
            <KaTeXMath math="g = c" /> satisfies <KaTeXMath math="\nabla g \cdot \mathbf{r}' = 0" />. At
            a constrained extremum <KaTeXMath math="\mathbf{p}^*" />,{" "}
            <KaTeXMath math="\nabla f" /> is also orthogonal to every constraint tangent, forcing{" "}
            <KaTeXMath math="\nabla f(\mathbf{p}^*) = \lambda\nabla g(\mathbf{p}^*)" />.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
            2. ECONOMIC SHADOW PRICE λ = df*/dc
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\frac{df^*}{dc} = \nabla f \cdot \frac{d\mathbf{p}^*}{dc} = \lambda\left(\nabla g \cdot \frac{d\mathbf{p}^*}{dc}\right) = \lambda"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Because <KaTeXMath math="g(\mathbf{p}^*(c)) = c" /> gives{" "}
            <KaTeXMath math="\nabla g \cdot \frac{d\mathbf{p}^*}{dc} = 1" />, the multiplier{" "}
            <KaTeXMath math="\lambda" /> measures the exact marginal rate of change of the optimal
            objective when relaxing constraint <KaTeXMath math="c" />.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-upper)] block">
            3. REGULARITY GUARD (∇g ≠ 0) &amp; 2 CONSTRAINTS
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\nabla g(\mathbf{p}^*) = \mathbf{0} \text{ cusp trap}, \qquad \nabla f = \lambda\nabla g + \mu\nabla h"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            On <KaTeXMath math="g(x,y) = y^2 - x^3 = 0" />, minimizing <KaTeXMath math="f(x,y) = x" />{" "}
            hits <KaTeXMath math="(0,0)" /> where <KaTeXMath math="\nabla g(0,0) = \mathbf{0}" /> so no{" "}
            <KaTeXMath math="\lambda" /> solves <KaTeXMath math="\nabla f = \lambda\nabla g" />! Always
            check <KaTeXMath math="\nabla g = \mathbf{0}" /> points and boundary endpoints.
          </p>
        </div>
      </div>
    </section>
  );
}

export function HomogeneousEulerLesson() {
  return (
    <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
      <div className="border-b border-[var(--border-subtle)] pb-3">
        <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
          Chain-Rule Proof &amp; Disguised Composite Strategy
        </span>
        <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
          Proof of Euler&apos;s First- and Second-Order Theorems &amp; Composite Deductions
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
            1. PROOF OF 1ST &amp; 2ND ORDER EULER IDENTITIES
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto space-y-1.5">
            <KaTeXMath
              math="\frac{d}{dt}\bigl[f(tx, ty)\bigr] = x f_x(tx, ty) + y f_y(tx, ty) = n t^{n-1} f(x, y)"
              block
            />
            <KaTeXMath
              math="t = 1 \implies x f_x + y f_y = n f, \qquad \left(x\frac{\partial}{\partial x} + y\frac{\partial}{\partial y}\right)(x f_x + y f_y) = n(x f_x + y f_y)"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Applying <KaTeXMath math="x\partial_x + y\partial_y" /> again to{" "}
            <KaTeXMath math="x f_x + y f_y = nf" /> yields{" "}
            <KaTeXMath math="x f_x + x^2 f_{xx} + x y f_{xy} + y f_y + y x f_{yx} + y^2 f_{yy} = n^2 f" />;
            using Clairaut symmetry (<KaTeXMath math="f_{xy} = f_{yx}" />) and subtracting{" "}
            <KaTeXMath math="x f_x + y f_y = nf" /> isolates{" "}
            <KaTeXMath math="x^2 f_{xx} + 2xy f_{xy} + y^2 f_{yy} = n(n - 1)f" />.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
            2. COMPOSITE HOMOGENEOUS DEDUCTION g(u) = fₙ
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto space-y-1.5">
            <KaTeXMath
              math="g(u) \text{ homogeneous of degree } n \implies x u_x + y u_y = n\frac{g(u)}{g'(u)} =: \varphi(u)"
              block
            />
            <KaTeXMath
              math="x^2 u_{xx} + 2xy u_{xy} + y^2 u_{yy} = \varphi(u)\bigl(\varphi'(u) - 1\bigr)"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Example: <KaTeXMath math="u = \tan^{-1}\!\left(\frac{x^3 + y^3}{x - y}\right)" /> is not
            homogeneous directly, yet <KaTeXMath math="g(u) = \tan u = \frac{x^3+y^3}{x-y}" /> is
            homogeneous of degree <KaTeXMath math="n = 3 - 1 = 2" />! Hence{" "}
            <KaTeXMath math="\varphi(u) = 2\frac{\tan u}{\sec^2 u} = \sin(2u)" /> immediately gives{" "}
            <KaTeXMath math="x u_x + y u_y = \sin(2u)" /> and{" "}
            <KaTeXMath math="x^2 u_{xx} + 2xy u_{xy} + y^2 u_{yy} = \sin(2u)\bigl(2\cos(2u) - 1\bigr)" />.
          </p>
        </div>
      </div>
    </section>
  );
}

export function MaximaMinimaExtremaLesson() {
  return (
    <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-5">
      <div className="border-b border-[var(--border-subtle)] pb-3">
        <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-upper)] block">
          Completing the Square on T₂ &amp; Degenerate D = 0 Analysis
        </span>
        <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
          Why <KaTeXMath math="D = rt - s^2" /> Classifies Extrema &amp; How Peano&apos;s Saddle Breaks Lines
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
            1. QUADRATIC COMPLETING-THE-SQUARE
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\Delta f \approx \frac{1}{2r}\Bigl[(rh + sk)^2 + (rt - s^2)k^2\Bigr] \quad (r \neq 0)"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Since <KaTeXMath math="(rh + sk)^2 \ge 0" />, when <KaTeXMath math="D = rt - s^2 > 0" />{" "}
            the bracket stays strictly positive for all <KaTeXMath math="(h,k) \neq (0,0)" />—so{" "}
            <KaTeXMath math="\Delta f" /> carries the exact sign of <KaTeXMath math="r = f_{xx}" />. When{" "}
            <KaTeXMath math="D < 0" />, choosing <KaTeXMath math="rh + sk = 0" /> flips the sign relative
            to <KaTeXMath math="k = 0" />, proving a saddle!
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-upper)] block">
            2. PEANO&apos;S D = 0 COUNTEREXAMPLE
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="f(x, y) = (y - x^2)(y - 2x^2) \implies f\!\left(x, \tfrac{3}{2}x^2\right) = -\frac{1}{4}x^4 < 0"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Along every straight line <KaTeXMath math="y = mx" /> through <KaTeXMath math="(0,0)" />,{" "}
            <KaTeXMath math="f(x, mx)" /> has a strict local minimum at <KaTeXMath math="x = 0" />! Yet
            between the two zero parabolas along <KaTeXMath math="y = \frac{3}{2}x^2" />,{" "}
            <KaTeXMath math="f" /> dips strictly negative—proving lines alone can mislead when{" "}
            <KaTeXMath math="D = 0" />.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
            3. GLOBAL EXTREMA ON COMPACT REGIONS
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\max_{K} f = \max\bigl\{f(\mathbf{p}_{\text{int}}),\; f(\mathbf{p}_{\partial K})\bigr\}"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            By the Extreme Value Theorem, a continuous <KaTeXMath math="f" /> on a closed bounded
            domain <KaTeXMath math="K \subset \mathbb{R}^2" /> attains absolute extrema either at
            interior critical points (<KaTeXMath math="\nabla f = \mathbf{0}" /> or undefined) or on
            boundary curves and corners <KaTeXMath math="\partial K" />.
          </p>
        </div>
      </div>
    </section>
  );
}

export function DoubleIntegralsLesson() {
  return (
    <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-x)] block">
            Slicing Architecture &amp; Fubini Order Reversal
          </span>
          <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
            Type I vs. Type II Slicing, Fubini Hypotheses &amp; Order-Reversal Rescues
          </h2>
        </div>
        <Link
          href="/formulas/multiple-integrals-jacobians"
          className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-z)] transition-colors shrink-0"
        >
          Open Multiple Integrals Sheet →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
            1. CHOOSING TYPE I vs. TYPE II ORDER
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\text{Type I: } \int_a^b\!\int_{g_1(x)}^{g_2(x)} f\,dy\,dx \quad vs. \quad \text{Type II: } \int_c^d\!\int_{h_1(y)}^{h_2(y)} f\,dx\,dy"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Shoot vertical arrows bottom-to-top for Type I; if the top or bottom curve formula splits
            midway across <KaTeXMath math="x" />, switch to horizontal left-to-right Type II arrows so
            the region sweeps cleanly in a single integral.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-sweep)] block">
            2. ORDER REVERSAL WORKED EXAMPLE
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\int_0^1 \int_x^1 e^{y^2}\,dy\,dx = \int_0^1 \int_0^y e^{y^2}\,dx\,dy = \frac{e - 1}{2}"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            <KaTeXMath math="e^{y^2}" /> has no elementary antiderivative in <KaTeXMath math="y" />,
            yet describing the same upper triangle as <KaTeXMath math="0 \le x \le y \le 1" />{" "}
            produces an extra factor of <KaTeXMath math="y" /> from <KaTeXMath math="\int_0^y dx" />{" "}
            that unlocks direct <KaTeXMath math="u = y^2" /> substitution!
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-upper)] block">
            3. FUBINI HYPOTHESIS &amp; SINGULARITY GUARD
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\iint_R |f(x, y)|\,dA < \infty \implies \text{Iterated integrals agree}"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Swapping order fails if <KaTeXMath math="f" /> is not absolutely integrable—on{" "}
            <KaTeXMath math="[0,1]^2" />, <KaTeXMath math="\int_0^1\int_0^1 \frac{x^2-y^2}{(x^2+y^2)^2}\,dy\,dx = -\frac{\pi}{4}" />{" "}
            whereas swapping <KaTeXMath math="dx\,dy" /> yields <KaTeXMath math="+\frac{\pi}{4}" />!
          </p>
        </div>
      </div>
    </section>
  );
}

export function TripleIntegralsLesson() {
  return (
    <section className="border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <span className="text-xs font-tabular-mono uppercase tracking-wider text-[var(--math-ink-z)] block">
            3-Stage Geometric Collapse &amp; Physical Applications
          </span>
          <h2 className="text-xl font-math-serif font-semibold text-[var(--text-primary)]">
            Ray → Curtain → Solid Slicing, Coordinate-Wall Shadows &amp; Mass Moments
          </h2>
        </div>
        <Link
          href="/formulas/multiple-integrals-jacobians"
          className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--math-ink-z)] bg-[var(--bg-canvas)] text-xs font-tabular-mono text-[var(--math-ink-z)] transition-colors shrink-0"
        >
          View All 6 Orders &amp; Moment Formulas →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-z)] block">
            STAGE 1: INNER 1D ENTRY-TO-EXIT RAY
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="z_{\text{entry}}(x, y) \le z \le z_{\text{exit}}(x, y)"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Pick one axis (e.g., <KaTeXMath math="z" />) where a ray pierces solid{" "}
            <KaTeXMath math="E" /> cleanly through a single lower surface and exits through a single
            upper surface; those two surfaces become your inner limits.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-x)] block">
            STAGE 2: WALL SHADOWS FOR ALL 6 ORDERS
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="\pi_{xy}(E) \to dy\,dx \text{ or } dx\,dy, \quad \pi_{xz}(E), \quad \pi_{yz}(E)"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Collapse <KaTeXMath math="E" /> flat onto the coordinate plane perpendicular to your inner
            ray (setting the integrated variable to zero or intersecting entry/exit surfaces). Two 2D
            slicing orders on each of 3 walls generate all 6 permutations.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
          <span className="text-xs font-tabular-mono font-semibold text-[var(--math-ink-y)] block">
            STAGE 3: MASS, CENTROID &amp; INERTIA
          </span>
          <div className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-xs overflow-x-auto">
            <KaTeXMath
              math="M = \iiint_E \rho\,dV, \quad \bar{z} = \frac{1}{M}\iiint_E z\rho\,dV, \quad I_z = \iiint_E (x^2+y^2)\rho\,dV"
              block
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-math-serif leading-relaxed">
            Each tiny voxel contributes <KaTeXMath math="\Delta m = \rho(x,y,z)\,\Delta V" />; if
            spherical or cylindrical symmetry produces awkward square-root bounds in Cartesian, switch
            to Chapter 3.2.3 Curvilinear Coordinates!
          </p>
        </div>
      </div>
    </section>
  );
}
