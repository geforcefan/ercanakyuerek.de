---
title: 'Bézier curve'
date: 2025-12-25T14:30:00+01:00
math: true
draft: true
tags: ['writing a roller coaster simulation']
---------------------------------------------

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/8-bezier-curve/BezierCurveExampleScene.tsx" class="float-right" width="225px" height="225px" description="An interactive example of a bezier curve, drag the controls around to see changes in shape" >}}

So, now its time to build an actual Bézier curve instead of linear segments. For our roller xoaster simulation I will not
use bezier curves to let the track shape made of it, in fact nurbs are more siutable in terms of smoothness and other
avantages. Bezier curves are very siple to implement and it acts perfectly as an example how to construct curve nodes from bezier curves.
You know Ive metnioned, that the pysiscy simulation dont care about the curve method? This is exaclt what we will do here.. instead of having couple of linear segments
with multiple control points, we wil sue the same method to construct a bezier curve.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/8-bezier-curve/BezierCurveDemoScene.tsx" width="100%" height="300px" >}}

# Demo code

{{< show-content-script "posts/writing-a-roller-coaster-simulation/8-bezier-curve/BezierCurveDemoScene.tsx" >}}
