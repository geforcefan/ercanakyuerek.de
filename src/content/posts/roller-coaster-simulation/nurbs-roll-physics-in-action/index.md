---
title: 'NURBS, Roll, Physics in Action'
date: 2026-01-04T21:00:00+01:00
math: false
tags: ['roller coaster simulation']
---
While writing this series about building a [roller coaster simulation
in the
browser]({{< ref "/tags/writing-a-roller-coaster-simulation/" >}}),
the simulation itself has continued to evolve.

What started as small, separate experiments in earlier chapters has,
over time, come together into a runnable simulation with **NURBS
tracks**, **cubic roll interpolation**, a **physics simulation** and
**basic 3D track model generation** running in real time. The scene
includes basic **lighting** and **shadows**, so the track is rendered
as real geometry in a simple **3D environment**.

Below is a live demo using a track kindly provided by **Keltan Kemp**,
showing the current state of the simulation running in real time.

# Interactive demo

As always, the full code is available below.

{{< embedded-content-component path="./posts/roller-coaster-simulation/nurbs-roll-physics-in-action/NurbsRollPhysicsInActionDemoScene.tsx" width="100%" height="650px" description="Special thanks to **Keltan Kemp**, who kindly provided the track model used in this demo">}}

# Code

{{< repository-code-with-clone file="src/content/posts/roller-coaster-simulation/nurbs-roll-physics-in-action/NurbsRollPhysicsInActionDemoScene.tsx" >}}
