---
title: 'Bézier curve'
date: 2025-12-25T14:30:00+01:00
math: true
tags: ['writing a roller coaster simulation']
---

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/bezier-curve/BezierCurveExampleScene.tsx" class="float-right" width="225px" height="285px" description="An interactive example of a Bézier curve, drag the controls around to see changes in shape" >}}

So, now it is finally time to build an actual **Bézier curve** instead of only linear segments.

I do not think Bézier curves are particularly well suited for hand-building real roller coaster tracks. But they are simple to implement, easy to visualize, and most importantly, they finally give us _real curvature_ instead of straight lines everywhere. And honestly, we have been staring at straight lines long enough.

The nice part is that we already did the hard work earlier. Since we introduced an agnostic way to describe curves using **curve nodes**, all we need to do now is generate nodes that follow a Bézier curve and feed them into the simulation.

The physics simulation does not care where the shape comes from. It does not know whether the curve is **linear**, **Bézier**, **NURBS**, **FVD**, or built from **geometric shapes**. It really does not care. It just consumes curve nodes and keeps going. That was the whole point of the abstraction.

This time, I will first show you a demo with a Bézier curve, just to spoil the ending a bit:

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/bezier-curve/BezierCurveDemoScene.tsx" width="100%" height="380px" >}}

# Multiple algorithms

A Bézier curve can be evaluated in different ways. In practice, there are multiple algorithms to compute points on the curve.

A very common choice is the **de Casteljau** algorithm. It is known for its excellent numerical stability, but more importantly for us, it is much easier to reason about. You can almost see the curve being constructed step by step.

There are other options. Evaluating a Bézier curve via **Bernstein polynomials** is usually a bit faster and better suited when you want to evaluate many points per frame. The tradeoff is slightly worse numerical stability and, more importantly here, a less intuitive mental model.

We choose **de Casteljau** on purpose. Not because it is the fastest option, but because it makes it much clearer how a Bézier curve is actually constructed. For readability and understanding, this matters more right now than raw performance. We can always optimize later, once the idea is clear.

> **Important:** I will **not** go deep into the theory of Bézier curves, NURBS, or splines in general. That topic is a rabbit hole with no clear exit. Seriously. You will run into C0, C1, and C2 continuity, knot vectors, basis functions, and many strong opinions.
>
> If you want to dive into that world, go for it. It is interesting, but also confusing in equal parts. We will eventually implement NURBS in this series as well, but without getting lost in the math. For now, we keep things simple and practical. Your future self will thank you.

# Bézier evaluation via de Casteljau

I will explain very quickly how the **de Casteljau** algorithm works.

Assume we have **4 control points** and we want to know the **position** for a parameter `t` in the range `[0, 1]`. What we actually do is nothing more than repeated **linear interpolation**.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/bezier-curve/DeCasteljauVisualizationScene.tsx" class="float-right" width="355px" height="560px" description="Each animation loop shows one iteration of linear interpolations in the de Casteljau algorithm. After all three iterations described in the article, the Bézier curve is drawn. " >}}

First, we interpolate between the control points:

- `a` = interpolate between `p0` and `p1`
- `b` = interpolate between `p1` and `p2`
- `c` = interpolate between `p2` and `p3`

At this point, we have three new points lying on those straight lines.

Next, we connect these points. What happens? We now get two new straight lines, called `d` and `e`. And yes, we interpolate again:

- `d` = interpolate between `a` and `b`
- `e` = interpolate between `b` and `c`

Now we are left with two points. We connect them once more, which gives us a new line `f`, and interpolate again:

- `f` = interpolate between `d` and `e`

Now there is only **one point left** and nothing left to connect. That point is what we return. It is the evaluated position on the Bézier curve.

So in the end, the algorithm is really just linear interpolation over and over again until only a single point remains.

In code, this would look like this:

```typescript
const a = points[0].clone().lerp(points[1], t);
const b = points[1].clone().lerp(points[2], t);
const c = points[2].clone().lerp(points[3], t);
const d = a.lerp(b, t);
const e = b.lerp(c, t);
const f = d.lerp(e, t);

return f;
```

As you can see, the function itself is just a bunch of linear interpolations chained together. Nothing fancy.

Of course, this version is limited to exactly **4 control points**. If we had **3 control points**, the exact same logic would apply. Instead of three lines `a`, `b`, and `c`, we would only have two lines, `a` and `b`, and in the next iteration we would simply interpolate between those two. Same idea, fewer steps.

So instead of writing out every single `lerp` by hand for a fixed number of control points, we can just use loops and make the algorithm work for **any number of control points**:

```typescript
const p = points.map((v) => v.clone());

for (let k = points.length - 1; k > 0; k--) {
  for (let i = 0; i < k; i++) {
    p[i].lerp(p[i + 1], t);
  }
}
```

> **Note**: In practice, it usually makes sense to stop at **four** control points, because everything beyond that tends to get unstable pretty quickly. But the function itself does not limit stupidity. That part is still up to us 🙂

So we end up with a general version that works for any number of control points. Add a small guard at the beginning and we are ready to use it:

{{< repository-code file="src/maths/bezier.ts" type="function" name="deCasteljau" >}}

## How many curve nodes do we need?

Now that we can evaluate a Bézier curve for a parameter `t` in the range `[0, 1]`, the next question is:
how many **curve nodes** do we actually want to generate along that curve?

More nodes mean better precision. Fewer nodes mean better performance. We do not need perfect precision here, so we need to find a reasonable **sweet spot**.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/bezier-curve/EstimateLengthScene.tsx" class="float-right" width="355px" height="485px" description="Interactive visualization of curve length estimation using uniformly sampled points. Try different sample counts and Bézier shapes to see when the estimate becomes good enough. This is how I settled on 8 points as a reasonable sweet spot." >}}

In practice, this is what I usually do:

- First, estimate the arc length of the Bézier curve by uniformly evaluating a small number of points on it. I normally pick **8 points** and sum up the distances between them.
- Then, use this estimated length to compute the number of curve nodes by multiplying it with a **resolution** value. I usually use something like `20`.
- **Example**: a roughly **20 meter** long curve multiplied by a resolution of `20` gives us **400 nodes**.
- We then evaluate the Bézier curve at those 400 positions and construct curve nodes from them.
- It will make sense to clamp the number of nodes in the **editor** in the future, where **performance matters while dragging control points around**. In the simulation, this is much less critical.

To make this easier, we start with a small helper that lets us **uniformly sample** a range with a given resolution. It gives us both the actual value and a normalized`t` in `[0, 1]`.

{{< repository-code file="src/helper/uniform-sample.ts" type="function" name="uniformSample" >}}

If this feels a bit abstract, here is a concrete example.

Assume we want to sample from `1` to `6` with a resolution of `1`. That means we will get **5 evenly distributed values**:

- actual values: `[1, 2.25, 3.5, 4.75, 6]`
- normalized values: `[0, 0.25, 0.5, 0.75, 1]`

## Estimating the Bézier curve length

Now that we have `uniformSample`, estimating the curve length is straightforward.

We simply pick **8 evenly distributed values** in the range `[0, 8]` and evaluate the Bézier curve at those normalized values:

```typescript
const positions = uniformSampleMap(0, 8, 1, (at, t) =>
  deCasteljau(points, t),
);
```

At this point, `positions` contains 8 points along the Bézier curve.

From here, it is extremely easy to iterate over these points and sum up the distances between positions to get an **estimated total arc length**.

```typescript
return positions
  .slice(1)
  .reduce(
    (arcLength, position, i) =>
      arcLength + position.distanceTo(positions[i]),
    0,
  );
```

Now we end up with this estimate function:

{{< repository-code file="src/maths/bezier.ts" type="function" name="estimateTotalArcLength" >}}

Here is the `uniformSampleMap` function.
It is a small convenience helper that wraps `uniformSample` and makes mapping the result easier,
instead of having to do it manually each time. It will show up here and there in later chapters.

{{< repository-code file="src/helper/uniform-sample.ts" type="function" name="uniformSampleMap" >}}

# Constructing a Bézier curve

This part is almost stupidly simple, so I will just paste the code and explain it briefly.

```typescript
export const bezierSplineCurve = (
  points: Vector3[],
  resolution: number = 20,
) => {
  const positions: Vector3[] = [];
  uniformSample(0, estimateLength(points), resolution, (at, t) => {
    positions.push(deCasteljau(points, t));
  });

  return fromPoints(positions);
};
```

> **Note:** In the repository, `bezierSplineCurve` has a slightly different implementation that calls utility functions for proper normal calculation. Do not worry about this for now. We will cover normals in the next chapters.


What happens here is straightforward:

- We sample from `0` to the **estimated length** of the Bézier curve.
- We use a default resolution of `20`.
- For each sample, we evaluate the curve using the **de Casteljau** algorithm with `t` in the range `[0, 1]`.
- The resulting positions are then turned into a curve using `fromPoints`, which we implemented earlier.

There is nothing more going on here. We sample the curve, evaluate it, and turn the result into curve nodes.

## What’s next?

In the next article, we will eventually and finally fix our normal problems and create a good `fromPoints` function that calculates normals in a way that nothing breaks on loopings or slopes close to 90°.

Right now, our `fromPoints` is a temporary junk implementation with hard transitions on the edges. That was fine while we only had linear segments, but now we actually have curvature, so the problems are much easier to see.

> **Note**: In the demo, I already intentionally use the correct way of inserting positions (by using `fromUniformSampledPositions` instead of `fromPoints` from the last chapter) on the curve with proper normal calculation, so the demo does not jitter. Do not be confused by this. I am basically taking things a bit ahead of time here.

# Demo code

{{< repository-code-with-clone file="src/content/posts/writing-a-roller-coaster-simulation/bezier-curve/BezierCurveDemoScene.tsx" >}}