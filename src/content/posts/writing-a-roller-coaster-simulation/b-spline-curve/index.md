---
title: 'Uniform Rational B-Spline curve [WIP]'
date: 2026-01-18T14:30:00+01:00
math: true
tags: ['writing a roller coaster simulation']
---
This chapter is still **work in progress**. The text is not finished yet.

That said, it felt useful to already show the result.

The interactive demo below is backed by a **Uniform Rational B-Spline curve** and already renders a full **3D track mesh** in real time. There is no heavy optimization involved at this stage. The geometry is generated directly from the curve and updated live as the control points change.

The goal here is simply to show that **real-time track generation** is possible with this approach using **web technologies**. Even without optimizations, the system is fast enough to experiment, iterate, and visualize track shapes interactively.

The following chapters will fill in the missing pieces step by step. For now, consider this a preview of where the system is heading.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/b-spline-curve/BSplineCurveDemoScene.tsx" width="100%" height="580px" >}}
