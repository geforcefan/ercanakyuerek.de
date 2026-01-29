---
title: 'Uniform Rational B-Spline curve'
date: 2026-01-18T14:30:00+01:00
math: true
tags: ['writing a roller coaster simulation']
---------------------------------------------

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

In this chapter, we keep things deliberately simple. We do **not**
start with full **NURBS**, because that would require dealing with
knot vectors right away. Instead, we focus on a minimal and practical
variant: **uniform rational B-splines**.

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
> some shapes **cannot** be represented with a B-spline alone. A perfect
> **circle** is the classic example. There is a well-known trick where
> certain control points use a weight of \(1 / \sqrt{2}\) to produce an
> exact circle.

## A first look: an unclamped B-spline

By default, a B-spline is **not clamped**. The curve does not pass
through the first or last control point. Instead, it smoothly
approaches them while keeping continuity across segments.

This behavior is intentional. Clamping a B-spline relaxes some
continuity guarantees, and continuity is one of the main reasons to
use B-splines in the first place. The default behavior is not a
mistake.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/b-spline-curve/BSplineBoundaryExampleScene.tsx" width="100%" height="385px" >}}

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

The full curve is built by sliding a window of four control points
along the control polygon. Each window produces one curve segment.

{{< repository-code file="src/maths/b-spline.ts" type="variable" name="fromPoints" >}}

## Clamping and closed tracks

Here we need to be precise. What we construct is a **track**, not just
a raw curve. Internally, the track uses a B-spline, but it adds extra
logic on top. We refer to this as a **B-spline track**.

By default, the track is not clamped. To create an **open track**, we
explicitly clamp it by duplicating the first and last control points.
This forces the track to start and end exactly at those points,
without changing the curve evaluation.

A **closed track** works differently. We extend the control point list
so that the curve wraps around and the first and last segments connect
smoothly.

{{< repository-code file="src/coaster/b-spline-track.ts" type="variable" name="fromPoints" >}}

An **open** track is a clamped track. A **closed** track relies on
control point overlap to stay smooth at the join.

## Interactive demo

Below is an interactive demo showing how **uniform rational
B-splines**, **weights**, and **clamping** behave when control points
are moved.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/b-spline-curve/BSplineCurveDemoScene.tsx" width="100%" height="580px" >}}

## What comes next?

Next, we look at **curve roll**. How roll should be interpolated is
still open. We could reuse B-splines for roll, or use a simpler cubic
spline, similar to what is used in **NoLimits Coaster 2**.

We will start by choosing one approach and implementing it. Supporting
multiple roll interpolation methods can come later.

## Demo code

{{< repository-code-with-clone file="src/content/posts/writing-a-roller-coaster-simulation/b-spline-curve/BSplineCurveDemoScene.tsx" >}}
