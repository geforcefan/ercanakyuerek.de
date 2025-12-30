---
title: 'Matrices'
date: 2025-12-21T13:30:00+01:00
math: true
tags: ['writing a roller coaster simulation']
---

Right now, when we want to know the **position** and **forward direction** along a curve, we ask two separate functions. This works, but having two separate functions for the same **node** on the track is odd and adds more complexity than we actually need.

Earlier we mentioned that there is a better way to describe this kind of information. That better way is a **4x4 matrix**.

A matrix can hold **position** and **directions** at the same time. This is exactly what we need to describe a **node** along the track. Once we switch to **matrices**, the two existing functions `forwardDirectionAtDistance` and `positionAtDistance` naturally collapse into one. Instead of asking the track for separate pieces of data, we ask for a **matrix** at a distance along the curve and extract whatever information we need from it.

For that reason, we make a small but important change. From now on, we work with **matrices** and remove those two functions entirely.

If it helps, it is worth rereading the chapter on [linear roller coaster tracks]({{< ref "/posts/writing-a-roller-coaster-simulation/4-linear-track.md" >}}), where `forwardDirectionAtDistance` and `positionAtDistance` were introduced. Both are now replaced by a single function called `matrixAtDistance`.

For a linear track segment, this is straightforward. We compute the **position** exactly like before using linear interpolation. For orientation, we let **THREE.js** build a matrix that `lookAt`s from one control point to the other. This gives us a correct **forward direction** without any extra work.

> **Note:** At this stage, we only need a valid **forward direction**. There is no need to complicate things with **roll**, so we ignore it for now.

```ts
export const matrixAtDistance = (
  cp1: Vector3,
  cp2: Vector3,
  distance: number,
) => {
  const position = cp1.clone().lerp(cp2, distance / length(cp1, cp2));

  return new Matrix4()
    .lookAt(cp2, cp1, new Vector3(0, 1, 0))
    .setPosition(position);
};
```

With this change, we also need to adjust `evaluateMotion`. Instead of receiving a **forward direction** vector, it now receives a **matrix**. We then extract the **forward direction** from that matrix.

This is very straightforward. We take a vector pointing along the local Z axis and transform it by the matrix.

```ts
const forwardDirection = new Vector4(0, 0, 1, 0)
  .applyMatrix4(matrix)
  .normalize();
```

In other words, we define what **forward** means in local space and let the **matrix** tell us where that direction points in world space.

With that in place, the full updated `evaluateMotion` function looks like this:

```ts
export const evaluateMotion = (
  state: SimulationState,
  matrix: Matrix4,
  friction: number,
  airResistance: number,
  gravity: number,
  deltaTime: number,
): SimulationState => {
  const forwardDirection = new Vector4(0, 0, 1, 0)
    .applyMatrix4(matrix)
    .normalize();

  const velocityDirection = state.velocity < 0 ? -1 : 1;

  let energyLoss = airResistance * state.velocity * state.velocity;
  energyLoss += friction * gravity;
  energyLoss *= velocityDirection;

  let acceleration = forwardDirection.dot(
    new Vector4(0, -gravity, 0, 0),
  );
  acceleration -= energyLoss;

  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled =
    state.distanceTraveled + velocity * deltaTime;

  return { velocity, distanceTraveled, acceleration };
};
```

## What comes next?

These changes are mostly structural. Visually, nothing changes yet. Under the hood, however, the simulation now works entirely with **matrices**, which will make later changes easier.

[In the next chapter]({{< ref "/posts/writing-a-roller-coaster-simulation/7-curve-nodes.md" >}}), we move away from linear segments and introduce a more general way to describe **curves**. That will require a new implementation of `matrixAtDistance`, but the rest of the simulation can stay as it is.

This is the kind of refactor we want. We change how the track is described without rewriting everything built on top of it.

## Interactive demo and code

There is no visible difference in the demo. The train behaves exactly as before. The only change is that the simulation now uses `matrixAtDistance` internally.

For completeness, the full demo is shown below.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/6-matrices/MatricesDemoScene.tsx" width="100%" height="320px">}}

{{< show-content-script "posts/writing-a-roller-coaster-simulation/6-matrices/MatricesDemoScene.tsx" >}}
