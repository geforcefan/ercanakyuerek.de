---
title: 'Linear Roller Coaster Track'
date: 2025-12-06T11:30:00+01:00
math: true
tags: ['writing a roller coaster simulation']
---

To visualize motion properly, we need something for our little object to move along. And that means we need a track.

In this article, we focus on an extremely simplified roller coaster track. And when I say extremely simplified, I really mean it: it's just a plane. A straight line. A first-order curve. Basically the easiest form of track you can possibly build without accidentally creating a real coaster.

From the last chapter, we know how motion evaluation works. The evaluation function receives an acceleration value and returns a new simulation state containing the updated velocity and the total distance traveled:

```typescript
evaluateMotion(state, acceleration, deltaTime);
```

It returns something like:

```json
{
  "velocity": 10,
  "distanceTraveled": 20
}
```

Now that we introduce a track, things become a bit more interesting. The old `evaluateMotion` function worked with a fixed slope and gravity using this formula:

$$acceleration = gravity \cdot \sin(slopeAngle)$$

But we want to move toward real coaster geometry later, where slopes change every centimeter. So we replace the `acceleration` parameter and introduce two new parameters:

- **forwardDirection**, a vector pointing forward along the track at the given distance
- **gravity**, the classic 9.81 m/s² thing

We won't use `gravity * Math.sin(slopeAngle)` anymore, because once we have a forward direction, there is a cleaner way.

> We simply define a gravity direction vector.

Gravity always points downward to Earth, basically along the negative y-axis:

$$\vec{gravityDir} = \begin{bmatrix} 0 \\ -9.81 \end{bmatrix}$$

Now what do we do with `forwardDirection` and `gravityDirection`?
We take their dot product. That’s it. Really. That’s the whole trick:

$$acceleration = \vec{forwardDir} \times \vec{gravityDir}$$

This one line replaces the entire downhill-slope acceleration formula thing:

$$acceleration = gravity * sin(slopeAngle)$$

In code:

```typescript
const acceleration = forwardDirection.dot(new Vector2(0, -gravity));
```

And our updated evaluateMotion function becomes:

```typescript
type SimulationState = {
  velocity: number;
  distanceTraveled: number;
  acceleration: number;
};

const evaluateMotion = (
  state: SimulationState,
  forwardDirection: Vector3,
  gravity: number,
  deltaTime: number,
): SimulationState => {
  const acceleration = forwardDirection.dot(
    new Vector3(0, -gravity, 0),
  );
  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled =
    state.distanceTraveled + velocity * deltaTime;

  return { velocity, distanceTraveled, acceleration };
};
```

## Answering important questions

Once the motion step gives us a **distance traveled**, we need to convert this number into something the renderer can actually work with.

Even the easiest possible track must answer **two important questions** for physics and visualization:

> Where is the 2D or 3D position at a given distance along the curve?

Whether the track is straight or twisting like a crazy pretzel, the logic is the same.

- After traveling **1 meter**, we need the **position at 1 meter**.
- After **5 meters**, we need the **position at 5 meters**.

So we need a function that returns the position at any distance:

```typescript
positionAtDistance(distance);
```

We also need the forward direction at that distance, because the evaluation function requires it as an input, as we introduced just a few sentences above. So we must answer:

> What is the forward direction at a given distance along a curve?

```typescript
forwardDirectionAtDistance(distance);
```

Both functions work purely on the curve geometry.

## positionAtDistance on Linear “Curves”

For linear curves, this is as easy as it gets. Later, we will switch to proper splines for real coaster geometry.

A linear curve has two control points: `cp1` and `cp2`, both simple 2D vectors. We use THREE.js for convenience.

### How do we get the 2D position at a distance?

We linearly interpolate between the two points:

$$ \vec{pos} = \vec{cp1} + (\vec{cp2} - \vec{cp1}) \cdot t $$

Where **t** is the fraction of the segment we’ve traveled:

- 0 → cp1
- 1 → cp2
- 0.5 → halfway

`t` is computed by dividing the traveled distance by the segment length:

$$ t = \frac{distance}{length} $$

Distance between control points:

$$ length = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} $$

Putting it all together:

```typescript
const positionAtDistance = (
  cp1: Vector3,
  cp2: Vector3,
  distance: number,
) => {
  const length = Math.sqrt(
    (cp2.x - cp1.x) ** 2 + (cp2.y - cp1.y) ** 2,
  );
  const t = distance / length;
  return {
    x: cp1.x + (cp2.x - cp1.x) * t,
    y: cp1.y + (cp2.y - cp1.y) * t,
  };
};
```

Or using **THREE.js** to save yourself some sanity and avoid reinventing the wheel over and over again. I explained this part without THREE.js as well, but you may just forget it, the articles get way too big if I try to explain every concept of vectors and math in detail. For now we simply know: THREE.js is our friend:

```typescript
const positionAtDistance = (
  cp1: Vector3,
  cp2: Vector3,
  distance: number,
) => {
  return cp1.clone().lerp(cp2, distance / cp1.distanceTo(cp2));
};
```

## How to Calculate Forward Direction Along the Curve

Since this is a linear curve, the forward direction is constant everywhere. It doesn’t get easier than this.

Mathematically:

$$ \vec{forwardDir} = \frac{\vec{cp2} - \vec{cp1}}{\lVert \vec{cp2} - \vec{cp1} \rVert} $$

Translated into code:

```typescript
const forwardDirectionAtDistance = (
  cp1: Vector3,
  cp2: Vector3,
  distance: number,
) => {
  return cp2.clone().sub(cp1).normalize();
};
```

## Small note

Later the forward vector will be replaced by a **4×4 matrix**, which includes position, forward, right and up vectors all at once. That matrix will become our single source of truth, which makes it possible to reduce everything to just one method called `matrixAtDistance`. I know, yet again a change, but that’s future you’s problem. Ignore it for now.

Going forward, we will use **9.81665 m/s²** as the gravitational acceleration, since this is also the value used by **NoLimits Roller Coaster** and **openFVD++**.

## Adding Everything Up

Time for a small demo. I built a basic setup: a visible line segment with draggable control points so you can adjust the slope in real time. On the side, a small panel displays the live simulation state.

I switched the vectors to 3D instead of 2D, but only because it makes things more convenient in THREE.js. The actual calculations from this article are exactly the same.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/4-linear-roller-coaster-track/LinearRollerCoasterTrackDemoScene.tsx" width="100%" height="300px">}}

I’ve polished things a bit and moved the physics and linear interpolation logic into their own files instead of keeping everything as spaghetti code. The complete source code is available in my GitHub repo, feel free to explore and play around with it.

## What comes next?

[In the next chapter]({{< ref "/posts/writing-a-roller-coaster-simulation/5-friction-and-air-resistance.md" >}}) we will introduce friction and air resistance. You’ll be able to play with the parameters in a demo and compare both physics evaluations, with and without energy loss.

# Demo code

{{< show-content-script "posts/writing-a-roller-coaster-simulation/4-linear-roller-coaster-track/LinearRollerCoasterTrackDemoScene.tsx" >}}
