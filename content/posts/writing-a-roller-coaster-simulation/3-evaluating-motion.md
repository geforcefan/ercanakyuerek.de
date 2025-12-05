---
title: 'Evaluating Motion'
date: 2025-11-27T12:35:00+01:00
math: true
tags: ["writing a roller coaster simulation"]
---

## Evaluating Motion

Before we implement the function, there's one small simplification we need to mention:
In this chapter we will always evaluate the motion every **16 ms (0.016 seconds)**,
which corresponds to roughly **60 frames per second**.

Using a fixed time step makes the formulas easier to understand for this article.

In real simulations or game engines, you usually don’t assume a constant value. Instead, you take the actual delta time from the game loop, so that the motion stays consistent even if the frame rate changes.

But for the sake of clarity in this chapter:
We assume that every update happens exactly every **16 ms**.
This keeps the examples simple and lets us focus on the physics first.

Now that we know how acceleration works and how gravity affects the coaster depending on the slope, we can finally build the first real part of our simulation. The idea is simple. Every small time step we calculate how much the coaster changes its speed and how much distance it travels.

We start with a minimal simulation state.

```typescript
type SimulationState = {
  velocity: number;
  distanceTraveled: number;
};

const simulationState: SimulationState = {
  velocity: 0,
  distanceTraveled: 0,
};
```

In the beginning, the coaster does not move and has not traveled any distance.

## The evaluateMotion function

Our simulation works by creating a new state based on the previous state.
Think of it like this:

> initial state → evaluate → new state → evaluate → new state → ...

To calculate the acceleration along the slope, we now implement the downhill-slope acceleration formula from [Chapter 2]({{< ref "/posts/writing-a-roller-coaster-simulation/2-gravity.md" >}}). This formula tells us how much of gravity actually acts in the direction of the slope:

$$acceleration = gravity * sin(slopeAngle)$$

So we end up basically with:

```typescript
const acceleration = gravity * Math.sin(slopeAngle);

const evaluateMotion = (state: SimulationState, acceleration: number, deltaTime: number) => {
  /// ...
};
```

- slopeAngle controls how steep the slope is
- deltaTime is how much time passed since the last calculation (we use 16 ms)

## Calculating the velocity

Acceleration is measured in **m/s²**.
That means:

> **m/s²** tells us how much the velocity changes in one **full second**.

So if acceleration is **9.81 m/s²**:

- after **1 second**, velocity increases by **9.81 m/s**
- so after **0.016 seconds**, velocity increases by \\(9.81 \* 0.016\\)
  Just multiply it with **0.016** :) that does the trick

$$velocity = acceleration * deltaTime$$

We take the previous velocity and add the small increase for this frame.

```typescript
const velocity = state.velocity + acceleration * deltaTime;
```

## Calculating the distance traveled

Velocity is measured in **m/s**.
This means:

> velocity tells us how much **distance** is to travel in **one full second**.

Again we only want the part that matches our **0.016 seconds**.

$$distanceToTravel = velocity \cdot deltaTime$$

We take the previous distance traveled and add the small increase for this frame.

```typescript
const distanceTraveled = state.distanceTraveled + velocity * deltaTime;
```

So we end up with something like:

```typescript
const evaluateMotion = (
  state: SimulationState,
  acceleration: number,
  deltaTime: number,
): SimulationState => {
  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled = state.distanceTraveled + velocity * deltaTime;

  return { velocity, distanceTraveled };
};
```

This is already a complete physics step without friction or air resistance.

## Running the simulation

Now we run the simulation every 16 ms and log the values.

{{< show-file-code "static/writing-a-roller-coaster-simulation/evaluating-motion.html" >}}

## Next Chapter

[In the next chapter]({{< ref "/posts/writing-a-roller-coaster-simulation/4-building-the-smallest-possible-track.md" >}}) we’ll build a small interactive Three.js demo where we can watch the object’s position update in real time. Nothing fancy, just a simple page showing coordinates and velocity so we can finally see the simulation in action.
