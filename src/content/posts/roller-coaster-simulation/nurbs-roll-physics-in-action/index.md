---
title: 'NURBS, Roll, Physics in Action'
date: 2026-01-04T21:00:00+01:00
math: false
tags: ['roller coaster simulation']
---

Parallel to writing this series about building a [roller coaster
simulator in the
browser]({{< ref "/tags/writing-a-roller-coaster-simulation/" >}}), I
am also implementing and testing everything I write about in a real
project.

At this point, the simulator already supports **NURBS tracks**, **roll
interpolation**, and the full **physics simulation**. Most of the
ideas in the articles are no longer just sketches. They are running
code.

A large part of the work recently was, understanding how **NoLimits
Roller Coaster 2** handles track interpolation and roll. I spent quite
a few hours digging into this, because, well, I more or less
reimplemented its curve generation logic.

## Why do that?

First, it is a genuinely challenging problem. Second, it is a great
way to understand how a real coaster simulator works without having to
build a full editor and toolchain around it. You can test ideas
quickly, break things, and learn where your assumptions were wrong.

I plan to write a separate article that focuses only on how **NoLimits
Roller Coaster 2 style interpolation and track generation** works.
There is a lot going on there, and it deserves its own chapter. Stay
tuned for that.

One thing I have _not_ fully figured out yet is how to properly close
**NURBS curves**.

And no, this is not about not knowing how to compute knot vectors for
closed NURBS. The tricky bit is how the **curve parameter space maps
to actual arc length** once the curve is closed. For clamped curves,
this is straightforward. For closed curves, I have not figured out the
arc length mapping yet.

I will figure it out eventually. Probably.

# Interactive demo

Below is an interactive demo of the simulator.
You can play around with it and see how the track interpolation, roll,
and physics behave together.

As always, the full code is available below.

{{< embedded-content-component path="./posts/roller-coaster-simulation/nurbs-roll-physics-in-action/NurbsRollPhysicsInActionDemoScene.tsx" width="100%" height="650px">}}

# Code

{{< repository-code-with-clone file="src/content/posts/roller-coaster-simulation/nurbs-roll-physics-in-action/NurbsRollPhysicsInActionDemoScene.tsx" >}}
