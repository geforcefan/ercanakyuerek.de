---
title: 'Curve orientation'
date: 2026-01-04T14:30:00+01:00
math: true
tags: ['writing a roller coaster simulation']
---

In earlier chapters, we already computed basic orientations along the
track, and for a while that worked reasonably well. The trouble starts
when we rely too much on a simple `lookAt` from **THREE.js** together
with a **fixed-up direction**.

The missing piece here is **roll**, also known as rotation around the
**forward direction**.

Whenever we use `lookAt`, we must provide an **up vector**. So far,
this has always been `Vector3(0, 1, 0)`. This is fine for **gentle
slopes**, but it starts to fall apart when the track approaches angles
close to **90 degrees**.

At that point, the **curve direction** points almost straight up. The
**up vector** also points up. Now both vectors look into the sky, and
the resulting **matrix** becomes unstable.

When the track points straight up, **roll** is no longer uniquely
defined. Rotating around that direction does not change where the
track is pointing, so `lookAt` has no stable orientation to choose
from.

Mathematically, this happens because `lookAt` constructs an
orientation using **cross-products**. When the **forward direction**
becomes parallel, or nearly parallel, to the **up vector**, the
cross-product between them approaches zero. Once that happens, the
remaining axes of the **matrix** cannot be built reliably anymore.

The visible result is **sudden flips**, **jitter**, or **strange
twisting** along the track, especially around slopes **close to 90
degrees**.

# Incremental orientation

To fix this, we need a slightly different approach. Instead of
computing each orientation in isolation, we build it
**incrementally**. We start from the transformation **matrix** of the
**previous node** and apply a small rotation that follows the **curve
direction**.

In other words, we still align the orientation with the curve, but we
do it **relative to the previous node’s orientation**, instead of
rebuilding everything from scratch.

This way, the **up direction** is not reset at every step. It slowly
rotates along the curve, preserving the existing **roll** instead of
fighting against it.

This technique is commonly called **parallel transport**, because the
orientation is transported along the curve with **as little rotation
as possible**.

Think of it like this: we add rotation step by step while respecting
the **previous orientation**.

The following interactive demo lets us switch between a **fixed-up
lookAt orientation** and an **incremental orientation based on the
previous node**. This helps visualize the problem.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/curve-orientation/LookAtExampleScene.tsx" width="100%" height="700px" description="**fixed-up lookAt orientation**: Roll becomes unstable near 90° slopes. **Incremental rotation**: Stable roll and smooth orientation along the curve." >}}

## Parallel transport

Now we can look at how to actually solve the **fixed-up `lookAt`
problem**.

We already know the key idea: instead of rebuilding the orientation at
every node, we rotate **incrementally**, relative to the **previous
node**.

For each **curve node step**, we compute a **transported frame** and
return a new transformation **matrix**.

The steps are:

- Compute the **direction** towards the **next curve node** from the
  **current position**.
- Extract the **current rotation** from the transformation **matrix**.
- Transform the direction using the **current local rotation** so it
  is expressed relative to the **orientation of the current node**.
- Apply **yaw and pitch** derived from the **relative direction** to
  the transformation **matrix**. The **relative direction itself**
  represents the **increment**.

The result is a function that **parallel-transports** a transformation
**matrix** and returns a new, transported transformation **matrix**:

{{< repository-code file="src/maths/matrix4.ts" type="variable" name="parallelTransportTransformation" >}}

We also need a small helper that extracts a **rotation matrix** from a
transformation **matrix**. This assumes there is **no scale**
involved. Since we never use scale for **curve transformation
matrices**, this simplification is acceptable and keeps things simple.

{{< repository-code file="src/maths/matrix4.ts" type="variable" name="toRotationMatrix" >}}

## Constructing a curve properly

Now that we can **parallel-transport** a transformation **matrix**, we
need to actually use it.

In earlier chapters, we built curves using a **temporary helper** that
simply connected points without caring about **orientation**. Now is
the point where we finally remove it.

We introduce two new methods:

- `insertTransformationMatrix`, which inserts a transformation
  **matrix** into the curve and **calculates arc length** and updates
  **segment offsets**.
- `insertPosition`, which inserts a **position** and computes the
  correct **orientation** using **parallel transport**.

We start with `insertTransformationMatrix`:

{{< repository-code file="src/maths/curve.ts" type="variable" name="insertTransformationMatrix" >}}

What happens here is fairly straightforward:

- We look up the **last node’s position** and compute the **distance**
  to the new **matrix**.
- We add that distance to the node’s **arc length**.
- If the distance is **zero**, we skip inserting the node.
- We compute the **segment index** and update the **segment offset
  list** accordingly.

> **Note:** **Segment offsets** are a fast lookup structure for
> segment lengths. For example, offsets like `[0, 20, 30]` tell us
> that **segment 1** spans arc lengths from **20 to 30**. This will
> become useful later.

Next, we implement `insertPosition`, which handles the **parallel
transport logic**. The approach is as follows:

- The **first point** is added with an **empty transformation matrix**
  that only contains a **position**.
- Once we have at least one node, we treat the **last node** as the
  **left side** and the new position as the **right side**.
- If the **distance** between them is **zero**, we skip the insertion.
- We parallel-transport the **left transformation matrix** toward the
  **right position**.
- The **very first node** needs to be transported **twice** to
  initialize its **orientation**.
- The **last node** always keeps the same **orientation** as its
  predecessor, since there is **no next point** to define a direction.

This is easier to understand once you look at the implementation:

{{< repository-code file="src/maths/curve.ts" type="variable" name="insertPosition" >}}

With that in place, we can now update `bezierSplineCurve`. In earlier
chapters, this function relied on a temporary `fromPoints` helper with
**no proper orientation**. We can now replace that with repeated calls
to `insertPosition`.

{{< repository-code file="src/maths/bezier.ts" type="variable" name="bezierSplineCurve" >}}

# What comes next?

At this point, we finally have a **stable orientation** along the
curve, without **jitter** near **steep slopes**. It would be tempting
to go straight into a proper **roll interpolation**, but before doing
that, we want to take a step back.

The next step will be the introduction of **NURBS curves**, which
allow much more freedom than **Bézier curves** and make
experimentation far more interesting.

The theory behind this, like **continuity**, **knot vectors**, and
**curve order**, can get confusing quickly. For now, we keep the
implementation **practical** and leave most of the theory for a
separate **spline-focused series**.

If you want an introduction in the meantime, the video
[The Continuity of Splines](https://www.youtube.com/watch?v=jvPPXbo87ds)
by [Ferya Holmèr](https://www.youtube.com/@acegikmo) is **gold**. It
is **perfect** and covers almost everything you need to understand
**splines in general**.

# Interactive demo

This chapter ends with a small interactive example. You can move the
control points of a **Bézier curve** and observe how the
**orientation** behaves. There should be **no sudden flips or jitter**
near **90 degree slopes**.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/curve-orientation/CurveOrientationDemoScene.tsx" width="100%" height="650px" >}}

# Demo code

{{< repository-code-with-clone file="src/content/posts/writing-a-roller-coaster-simulation/curve-orientation/CurveOrientationDemoScene.tsx" >}}
