---
title: 'Uniform Rational B-Spline curve'
date: 2026-01-18T14:30:00+01:00
math: true
tags: ['writing a roller coaster simulation']
---

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/b-spline-curve/BSplineClampedExampleScene.tsx" class="float-right" width="225px" height="285px" description="An interactive example of a clamped uniform rational B-spline curve, drag the controls around to see changes in shape" >}}

So far, we mostly used **Bézier curves**. They are easy to understand,
easy to code, and good enough to get something moving on screen. The
problem is **continuity**. When we connect multiple Bézier segments,
it is hard to keep everything smooth.

For a roller coaster track, we want position, direction, and curvature
to change smoothly along the whole track. In practice, this usually
means **C2 continuity**: the position, first derivative, and second
derivative are continuous.

With Bézier curves, this is possible, but only if we manually line up
control points across segments. That is simply very difficult to do.

This is where **B-splines** help. A B-spline is built from many small
curve segments that blend smoothly into each other, and it is **C2
continuous** across segment boundaries by design. Smoothness is built
in, instead of being enforced by hand.

In this chapter, we keep things simple. We do **not** start with full
**NURBS**, because that would mean dealing with knot vectors right
away. Instead, we focus on a small and practical variant: **uniform
rational B-splines**.

We will probably never go fully into NURBS in this series. Maybe we
will. Maybe we will not. We will see.

## Rational means weighted

The **rational** part means that each control point has a **weight**.
Instead of using `Vector3`, we use `Vector4`, where the `w` component
is the weight.

Intuitively, the weight controls how strongly the curve is pulled
toward a control point. A higher weight pulls the curve closer. A
lower weight lets the curve stay farther away.

Most of the time, all weights are simply set to `1`. We only change
them when we need more control.

> **More control**, without digging too deep into math, means that
> some shapes **cannot** be represented with a B-spline alone. A
> perfect **circle** is the classic example. There is a well-known
> trick where certain control points use a weight of (1 / \sqrt{2}) to
> produce an exact circle.

## A first look: open, clamped, and closed B-splines

Before looking at code, we need to understand how a B-spline behaves
at its boundaries.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/b-spline-curve/BSplineBoundaryExampleScene.tsx" width="100%" height="385px" >}}

### Open B-spline

By default, a B-spline is **open**. The curve does **not** pass
through the first or last control point. Instead, it smoothly
approaches them while keeping **C2 continuity** across all segments.

This is the natural behavior of a B-spline. Not touching the boundary
control points is what allows the curve to remain smooth everywhere.
This is not a mistake or a limitation. It is the reason B-splines are
useful in the first place.

### Clamped B-spline

Sometimes we want the curve to start and end exactly at specific
points. For example, an open roller coaster track should begin and end
at known locations.

A B-spline can be **clamped** using a simple trick: we repeat the
first and last control points so they appear three times in total.
Repeating a control point increases its influence at the boundary.
As a result, the curve is forced to pass through the first and last
points.

This relaxes continuity only at the very ends of the curve. All
interior segments remain smooth and **C2 continuous**.

### Closed B-spline

A **closed** B-spline has no start or end. The curve wraps around and
connects back to itself smoothly.

Closing a B-spline uses another small trick. Control points from the
end of the list are reused at the beginning, and control points from
the beginning are reused at the end. This overlap ensures that the
segments near the join see the same local neighborhood of control
points.

The result is a seamless loop with no visible seam and full continuity
at the connection.

## Cubic uniform rational B-spline evaluation

Each curve segment is evaluated from **four control points**. This is
similar to a cubic Bézier curve, but the basis functions are
different.

{{< repository-code file="src/maths/b-spline.ts" type="variable" name="cubicUniformRationalBSpline" >}}

The basis functions are fixed and assume uniform spacing. The rational
part only appears in the weighted sum and the final division by the
combined weight.

## Sampling and arc length estimation

Everything around evaluation works the same way as with Bézier curves.

We estimate arc length using uniform sampling:

{{< repository-code file="src/maths/b-spline.ts" type="variable" name="estimateTotalArcLength" >}}

## Building a curve from control points

Before building the curve segments, we first apply the boundary
behavior described above.

For a **clamped** curve, the first and last control points are
duplicated so that the curve starts and ends exactly at those points:

```ts
if (boundary === 'clamped') {
  const firstPoint = controlPoints[0];
  const lastPoint = controlPoints[controlPoints.length - 1];

  controlPoints.unshift(firstPoint, firstPoint);
  controlPoints.push(lastPoint, lastPoint);
}
```

For a **closed** curve, control points are overlapped so that the
curve wraps around smoothly:

```ts
if (boundary === 'closed' && controlPoints.length >= 4) {
  controlPoints.unshift(controlPoints[controlPoints.length - 1]);
  controlPoints.push(controlPoints[1]);
  controlPoints.push(controlPoints[2]);
}
```

Once the control point list has been prepared, the full curve is built
by sliding a window of four control points along the control polygon.
Each window produces one curve segment.

{{< repository-code file="src/maths/b-spline.ts" type="variable" name="fromPoints" >}}

## Interactive demo

Below is an interactive demo showing how **uniform rational
B-splines**, **weights**, and **boundary behavior** behave when
control points are moved.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/b-spline-curve/BSplineCurveDemoScene.tsx" width="100%" height="580px" >}}

## What comes next?

Next, we look at **curve roll**. How roll should be interpolated is
still open. We could reuse B-splines for roll, or use a simpler cubic
spline, similar to what is used in **NoLimits Coaster 2**.

We will start by choosing one approach and implementing it. Supporting
multiple roll interpolation methods can come later.

## Demo code

{{< repository-code-with-clone file="src/content/posts/writing-a-roller-coaster-simulation/b-spline-curve/BSplineCurveDemoScene.tsx" >}}
