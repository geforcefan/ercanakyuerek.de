---
title: 'Curve Nodes'
date: 2025-12-21T14:30:00+01:00
math: true
tags: ['writing a roller coaster simulation']
---

In this chapter, we try to make our lives a bit easier by using a more flexible way to describe **curves** in general.

This article is a bit longer than usual. The topic is hard to split into smaller pieces without losing context, so we keep everything in one place. I will try to keep things as simple as possible, but yes, there is a bit going on here.

Up to this point, everything was built around a very basic **linear track** with two control points. Functions like `matrixAtArcLength` only had to deal with a single segment. That worked fine for learning and experimenting, but it starts to feel limiting very quickly. A real roller coaster does not consist of exactly one straight line.

For now, we do not jump straight to **NURBS** or anything fancy. That will come later. We just want more segments. To do that, we need a way to describe curves that is not tied to a specific curve type, whether that is linear tracks, splines, geometric sections.

The solution is a very basic concept called **curve nodes**. A curve node stores where it is in **space**, its **orientation** as a **4x4 matrix**, and the **arc length** at which it appears along the curve. Nothing more than that.

# Curve Node

Before we write any code, we need to understand the idea first.

Imagine a linear track defined by four points. In that case, we also have four nodes. Nothing surprising so far. If we want to know the **position** at a certain distance along the track, we search for the two nodes between which that distance lies. One node on the left, one on the right. Everything in between is just interpolation.

This can be hard to visualize just by reading, so the example below shows four points and a slider. You can also move the control points to see what happens when the requested distance overshoots a segment.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/curve-nodes/BinarySearchDemoScene.tsx" width="100%" height="260px" description="As you move the slider, you request a distance along the track. You can immediately see between which two nodes that distance is sandwiched." >}}

# Find nodes sandwiching the requested distance

In the example above, we look for the two nodes that sandwich the requested distance and then linearly interpolate the **position** between them.

You may notice that, in principle, we can build almost any curve geometry this way. **NURBS**, for example, are basically just straight lines following a curve with many, many nodes. Compared to the simple example above, they are much denser, but the idea is exactly the same. More nodes, same logic.

**Curve nodes** form a clean and agnostic **interface** between the physics simulation and the actual curve geometry. The simulation does not really care how the curve was created. It just asks for matrices and keeps going.

With that in mind, we can start by defining what a **curve node** looks like:

{{< repository-code file="src/maths/curve.ts" type="type" name="CurveNode" >}}

That is it. A **matrix**, its **distance**, and the **segment number** along the curve. The segment number will not matter much for now, but it will become important later.

Of course, nodes do not exist on their own. They have to belong to something, and that something is the **curve** itself. To make this explicit, we also introduce a **Curve** type that groups the nodes together.

The **Curve** type looks like this:

{{< repository-code file="src/maths/curve.ts" type="type" name="Curve" >}}

> **Note:** The curve also stores **segment offsets**, which are accumulated **arc lengths** of the segments. They are not important right now. For the moment, we only deal with a single segment, so this will just be `[0, totalArcLength]`. We will come back to this later.

To go along with this, we add a small helper that simply creates an empty curve:

{{< repository-code file="src/maths/curve.ts" type="variable" name="emptyCurve" >}}

Next, we need a way to find the two nodes that sandwich any requested distance along the curve. There are many algorithms for this, but a simple binary search works very well here. It is fast, easy to implement, and more than good enough for what we need right now.

The only real requirement is that the nodes are sorted by `arcLength`, which we will make sure of.

If you want, you can read more about [binary search](https://en.wikipedia.org/wiki/Binary_search). To be honest, you do not need to understand every detail here.

We use a lower-bound variant of binary search, which looks like this:

{{< repository-code file="src/helper/binary-search.ts" type="variable" name="lowerBound" >}}

Now we use this binary search to find the node indices between which a requested distance along the curve lies. For that, we write a small helper:

{{< repository-code file="src/helper/binary-search.ts" type="variable" name="findBoundingIndices" >}}

This function needs a bit of explanation.

First, a small sanity check. Searching for a distance **between** nodes only makes sense if we actually have at least two nodes. Anything else would be suspicious:

```typescript
if (array.length < 2) return;
```

After that, we do the binary search. The lower-bound search gives us the index of the first node whose distance is **greater than or equal** to the value we ask for.

A small concrete example helps here. Assume we have these node distances:

```plain
[0, 10, 20, 30, 40]
```

If we request a distance:

- **10** → we get index `1`, because `10` exists exactly at index `1`
- **0** → we get index `0`, because the first node already matches
- **15** → we get index `2`, because `20` is the first value greater than `15`
- **45** → we get index `5`, which is past the last node. That is why clamping exists.

In all cases, the returned index represents the **right** node of the sandwich:

```typescript
const lowerNodeIndex = lowerBound(array, value, accessor);
```

Since the **left node index** is always the **right node index minus one**, we need to be careful with bounds.

We clamp the **right node index** to the range `1` to `array.length - 1`, because a **right** node cannot be the **first** node of the curve.

This guarantees that the **left node index** is always valid, and that the **right node index** never goes past the end of the array:

```typescript
const rightNodeIndex = MathUtils.clamp(
  lowerNodeIndex,
  1,
  array.length - 1,
);
const leftNodeIndex = rightNodeIndex - 1;
```

Finally, we return the two indices that sandwich the requested distance:

```typescript
return [leftNodeIndex, rightNodeIndex];
```

This is exactly what you were already seeing in the interactive example at the beginning of the chapter, just written down in code form.

# Interpolate between curve nodes

Now we move on to the more interesting part: **interpolation between the left and right curve nodes**.

To find the **left and right nodes**, we use the **binary search helper** we just built:

```typescript
const nodes = findBoundingIndices(
  curve.nodes,
  at,
  (node) => node.arcLength,
);
if (!nodes) return new Matrix4();
```

> **Note:** Returning an empty matrix here is just a lazy safety check. Architecture wise this may or may not be great, but that is not the point right now. We will clean this up later. Or not. Depends on future us.

Once we have the indices, we fetch the actual nodes:

```typescript
const left = curve.nodes[nodes[0]];
const right = curve.nodes[nodes[1]];
```

Lets now prepare for interpolation between the found nodes. Assume we have the following node distances: `[0, 10, 30, 50, 60]`

If we request `20`, it is clearly sandwiched between `10` and `30`. No surprises there. For linear interpolation, we need to know _how far_ `20` lies between those two values.

We do this step by step. Nothing fancy:

- Distance between **left** and **right** node: `30 - 10 = 20`
- Distance from **left** node to requested distance: `20 - 10 = 10`
- `10 / 20 = 0.5`, so we are **50%** between the two nodes

For safety, we clamp this value between `0` and `1`, because values outside that range are rarely what we want.

> **Note:** If the distance between left and right node is `0`, we would divide by zero. That usually ends badly. In that case, there is nothing to interpolate anyway, so we just return one of the matrices and move on with our lives.

In code, this looks like this:

```typescript
const length = right.arcLength - left.arcLength;
if (length > Number.EPSILON) {
  const t = MathUtils.clamp(
    (at - left.arcLength) / length,
    0.0,
    1.0,
  );
  // ...interpolation between left and right node goes here
}
```

We need a small utility function that interpolates between two matrices.

Unfortunately, there is no built-in helper for this in **THREE.js**. **THREE.js** does have helpers to interpolate **vectors** and **quaternions** though, which is exactly what we need here.

A matrix contains position and rotation. We extract those parts, interpolate them separately, and then build a new matrix again.
**Position** is interpolated **linearly**. **Rotation** is interpolated using **spherical linear interpolation** on **quaternions**.

If you already know what **quaternions** are, great. If not, also fine. This is not important at this point. I will write dedicated articles about **vectors, matrices, euler and quaternions** later.

The helper looks like this:

{{< repository-code file="src/maths/matrix4.ts" type="variable" name="lerp" >}}

Now we can use this to interpolate between the **left** and **right** matrix:

```typescript
return lerp(left.matrix, right.matrix, t);
```

If the distance between the nodes is `0`, things are easy. We just return a copy of the left node’s matrix:

```typescript
return left.matrix.clone();
```

Putting everything together, the full function looks like this:

{{< repository-code file="src/maths/curve.ts" type="variable" name="matrixAtArcLength" >}}

# Linear track with more segments

To actually see this in motion, we need a small helper that constructs curve nodes from a list of points. This is only here to make the demo work and will be improved later.

> **Note**: Points are duplicated to create hard transitions between segments. For linear track segments, smooth rotation transitions do not really make sense physically. Duplicating points is an easy way to fake the behavior we want.
>
> **Important**: This is temporary junk. It exists only to make the demo work quickly and will be replaced by a proper implementation with correct normals and roll handling.

{{< repository-code file="src/content/posts/writing-a-roller-coaster-simulation/curve-nodes/curve.ts" type="variable" name="fromPoints" >}}

This helper just turns points into curve nodes and keeps track of the distance along the curve. It is very naive, but good enough to demonstrate the idea.

## What comes next?

In the next chapter, we will build curve nodes from **Bezier splines**. The nice part is that we will not have to touch the simulation logic at all. Only the curve generation changes, which is exactly what we were aiming for from the beginning.

## Demo with linear track segments

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/curve-nodes/MotionEvaluationDemoScene.tsx" width="100%" height="380px" description="Move the control points around to get a feeling for building a roller coaster track with physics motion." >}}

# Demo code

{{< repository-code-with-clone file="src/content/posts/writing-a-roller-coaster-simulation/curve-nodes/MotionEvaluationDemoScene.tsx" >}}
