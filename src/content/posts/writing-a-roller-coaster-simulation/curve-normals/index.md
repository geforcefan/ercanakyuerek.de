---
title: 'Curve normals'
date: 2026-01-04T14:30:00+01:00
math: true
tags: ['writing a roller coaster simulation']
---

# The lookAt problem

We already did some basic normal calculations in previous chapters,
and that mostly worked fine. However, there is a problem when we rely
too much on a simple `lookAt` from **THREE.js**.

The issue is **roll**, also known as rotation around the Z axis.

When we use `lookAt`, we have to provide an up vector. So far, we have
always used `(0, 1, 0)`. This works well for gentle slopes, but it
starts to break down when the track approaches angles close to 90
degrees.

At that point, the curve direction points almost straight up. The up
vector also points up. Now both vectors look into the sky, and the
matrix becomes unstable.

When the track points straight up, roll is no longer uniquely defined.
Rotating around that direction does not change where the track is
pointing, so `lookAt` has no stable orientation to choose.

Mathematically, this happens because `lookAt` builds an orientation
using cross products. When the forward direction becomes parallel, or
nearly parallel, to the up vector, the cross product between them
approaches zero. That means the remaining axes of the matrix cannot be
constructed reliably anymore.

The result is sudden flips, jitter, or strange twisting along the
track, especially around slopes close to 90 degrees.

# Solution

To fix this, we need a slightly different approach. Instead of
computing each orientation in isolation, we build it
**incrementally**. We start from the matrix of the previous node and
apply a small rotation that follows the curve direction. In other
words, we still use a `lookAt`-like idea, but we guide it using the
orientation from the previous node.

This way, the up direction is not reset every time. It slowly rotates
along with the curve, respecting the existing roll instead of fighting
against it.

The exact math and geometry behind this is not trivial, and explaining
it properly would easily double the length of this chapter. For now,
it is enough to think of it like this: _we incrementally add rotation
while respecting the orientation of the previous node_.

In this chapter, we will not go into mathematical details. Instead, we
focus on the implementation and simply compare the two approaches in
the following interactive demo by switching the lookAt method between
a fixed up direction and an incremental rotation based on the previous
node:

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/curve-normals/LookAtExampleScene.tsx" width="100%" height="500px" description="**Fixed up direction**: Roll becomes unstable near 90° slopes. **Incremental rotation**: Stable roll and smooth orientation along the curve." >}}
