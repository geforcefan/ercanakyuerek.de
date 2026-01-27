---
title: 'NURBS, Roll, Physics in Action'
date: 2026-01-04T21:00:00+01:00
math: false
tags: ['roller coaster simulation']
---

Parallel to writing this series about building a [roller coaster
simulator in the
browser]({{< ref "/tags/writing-a-roller-coaster-simulation/" >}}), the
system itself has continued to evolve.

At this point, the simulator already supports **NURBS tracks**,
**roll interpolation**, and a complete **physics simulation** running
together. What started as isolated experiments in earlier chapters is
now a connected system. The ideas described in the articles are no
longer sketches. They are running code.

This post is not a deep technical explanation. It is a snapshot of the
current state of the simulator.

The track is generated from **NURBS curves**, orientation along the
curve is handled with **roll interpolation**, and a basic **3D track
model** is built directly from the curve data. Everything is evaluated
and rendered in real time, without any heavy optimization or offline
processing.

The goal here is simply to show how these pieces behave when combined:
curve interpolation, orientation, and physics acting on the same
representation of the track.

# Interactive demo

As always, the full code is available below.

{{< embedded-content-component path="./posts/roller-coaster-simulation/nurbs-roll-physics-in-action/NurbsRollPhysicsInActionDemoScene.tsx" width="100%" height="650px">}}

# Code

{{< repository-code-with-clone file="src/content/posts/roller-coaster-simulation/nurbs-roll-physics-in-action/NurbsRollPhysicsInActionDemoScene.tsx" >}}
