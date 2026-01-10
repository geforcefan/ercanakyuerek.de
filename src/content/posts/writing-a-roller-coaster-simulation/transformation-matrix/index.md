---
title: 'Transformation Matrix'
date: 2025-12-21T13:30:00+01:00
math: true
tags: ['writing a roller coaster simulation']
---

Right now, when we want to know the **position** and **forward
direction** along a curve, we ask two separate functions. This works,
but having two separate functions for the same **node** on the track
is odd and adds more complexity than we actually need.

Earlier we mentioned that there is a better way to describe this kind
of information. That better way is a **4x4 transformation matrix**.

A transformation matrix can hold **position** and **directions** at
the same time. This is exactly what we need to describe a **node**
along the track. Once we switch to **transformation matrices**, the
two existing functions `forwardDirectionAtArcLength` and
`positionAtArcLength` naturally collapse into one. Instead of asking
the track for separate pieces of data, we ask for a **transformation
matrix** at a distance along the curve and extract whatever
information we need from it.

For that reason, we make a small but important change. From now on, we
work with **tranformation matrices** and remove those two functions
entirely.

If it helps, it is worth rereading the chapter on [linear roller
coaster
tracks]({{< ref "/posts/writing-a-roller-coaster-simulation/linear-track.md" >}}),
where `forwardDirectionAtArcLength` and `positionAtArcLength` were
introduced. Both are now replaced by a single function called
`transformationAtArcLength`.

For a linear track segment, this is straightforward. We compute the
**position** exactly like before using linear interpolation. For
orientation, we let **THREE.js** build a matrix that `lookAt`s from
one control point to the other. This gives us a correct **forward
direction** without any extra work.

> **Note:** At this stage, we only need a valid **forward direction**.
> There is no need to complicate things with **roll**, so we ignore it
> for now.

{{< repository-code file="src/maths/linear.ts" type="variable" name="transformationAtArcLength" >}}

With this change, we also need to adjust `evaluateMotion`. Instead of
receiving a **forward direction** vector, it now receives a
**transformation matrix**. We then extract the **forward direction**
from that transformation.

This is very straightforward. Here is a small helper to extract the
**forward direction** from a **transformation matrix**:

{{< repository-code file="src/maths/matrix4.ts" type="variable" name="toFrontDirection" >}}

Now we use this helper to extract the **forward direction**:

```ts
const forwardDirection = toFrontDirection(transformation);
```

With that in place, the full updated `evaluateMotion` function looks
like this:

{{< repository-code file="src/helper/physics.ts" type="variable" name="evaluateMotion" >}}

## What comes next?

These changes are mostly structural. Visually, nothing changes yet.
Under the hood, however, the simulation now works entirely with
**transformation matrices**, which will make later changes easier.

[In the next
chapter]({{< ref "/posts/writing-a-roller-coaster-simulation/curve-nodes.md" >}}),
we move away from linear segments and introduce a more general way to
describe **curves**. That will require a new implementation of
`transformationAtArcLength`, but the rest of the simulation can stay
as it is.

This is the kind of refactor we want. We change how the track is
described without rewriting everything built on top of it.

## Interactive demo and code

There is no visible difference in the demo. The train behaves exactly
as before. The only change is that the simulation now uses
`transformationAtArcLength` internally.

For completeness, the full demo is shown below.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/transformation-matrix/TransformationMatrixDemoScene.tsx" width="100%" height="380px">}}

{{< repository-code-with-clone file="src/content/posts/writing-a-roller-coaster-simulation/transformation-matrix/TransformationMatrixDemoScene.tsx" >}}
