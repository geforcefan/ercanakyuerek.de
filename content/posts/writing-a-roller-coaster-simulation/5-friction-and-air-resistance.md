---
title: 'Friction and Air Resistance'
date: 2025-12-06T12:30:00+01:00
math: true
tags: ["writing a roller coaster simulation"]
---

This chapter will be quite short and introduces two small but important parts of a more realistic roller coaster simulation:

- friction
- air resistance

Until now our coaster moved in a world without any energy loss. That works for understanding the basics but real coasters slow down over time. Wheels create friction, air pushes against the train, and both effects reduce the acceleration the train can achieve.

We will not create a complex physics model. Instead we introduce two simple parameters, very similar to what you may know from **NoLimits Roller Coaster**.  
Our physics simulation should behave almost identically, apart from a few edge cases.

Since both **friction** and **air resistance** represent energy loss, we simply subtract them from the acceleration we calculated from gravity. This is almost correct, but there is one detail to handle when the train moves backward.
More on that in the section **When riding backward, what happens?**.

## Friction

Friction is the permanent resistance between the train and the track. We apply it directly to the acceleration. The idea is very simple:
multiply the friction constant with gravity and subtract it from the current acceleration.

A typical friction value in is about **0.03 m/m** (height loss per meter).

$$friction \cdot gravity$$

## Air Resistance

Air resistance works differently. It **increases** with **velocity**. The faster the train moves, the more the air pushes back against it.

A typical air resistance value is around **0.0001 m/s²**.
We follow the same idea and use this value as the base for our simplified model. The **resistance** grows with **velocity²**, so we multiply it with **velocity²** and the air resistance constant:

$$airResistance \cdot velocity^2$$

This removes more energy when the train moves fast and almost none when it moves slowly.

# When riding backward, what happens?

There is one small detail we have to handle.
If the train moves **backward**, the velocity becomes negative. This also means our energy loss must flip direction. Otherwise we would accidentally add energy instead of removing it.

To put it simply:

- when riding **forward**, friction and air resistance **subtract** energy
- when riding **backward**, they must still subtract energy, but from the **opposite** direction

So we need a small multiplier that tells us whether the train is moving forward or backward:

- If the velocity is **negative**, the factor becomes **-1**
- If the velocity is **positive**, the factor is **1**

```typescript
const velocityDirection = state.velocity < 0 ? -1 : 1;
```

We can now apply this factor to the total energy loss

```typescript
const velocityDirection = state.velocity < 0 ? -1 : 1;

let energyLoss = airResistance * state.velocity * state.velocity;
energyLoss += friction * gravity;
energyLoss *= velocityDirection;
```

This flips the resistance forces to the correct direction depending on the current motion.
That is the whole trick.

Now subtract energy loss from acceleration:

```typescript
const acceleration = forwardDirection.dot(new Vector3(0, -gravity, 0)) - energyLoss;
```

## Updated evaluateMotion function

Putting everything together, the full motion evaluation now looks like this:

```typescript
const evaluateMotion = (
  state: SimulationState,
  forwardDirection: Vector3,
  friction: number,
  airResistance: number,
  gravity: number,
  deltaTime: number,
): SimulationState => {
  const velocityDirection = state.velocity < 0 ? -1 : 1;

  let energyLoss = airResistance * state.velocity * state.velocity;
  energyLoss += friction * gravity;
  energyLoss *= velocityDirection;

  let acceleration = forwardDirection.dot(new Vector3(0, -gravity, 0));
  acceleration -= energyLoss;

  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled = state.distanceTraveled + velocity * deltaTime;

  return { velocity, distanceTraveled, acceleration };
};
```

We still compute the gravity acceleration first. After that we subtract the energy losses from friction and air resistance. Even though this is a very simple model, the difference becomes immediately visible. The train will no longer accelerate forever or keep moving at impossible speeds.

## Demo with friction and air resistance

Just like in the previous chapter, here is a small interactive demo. This time it includes both friction and air resistance so you can see how the coaster behaves when energy loss is part of the simulation.

- The **orange** dot represents a train with friction and air resistance applied.
- The **white** dot shows the same motion without any energy loss.

Feel free to move the control points to experiment with the track shape and see how both trains react differently.

{{< iframe src="writing-a-roller-coaster-simulation/friction-and-air-resistance.html" width="100%" height="300px" >}}

## What comes next?

In the next chapter we will make a few changes to the track itself, preparing everything for an agnostic evaluation of physics.
No matter what the underlying geometry is in the end, **splines, imported tracks, FVD-based shapes or anything else, the evaluation should always work the same**.
The key step is replacing the two functions `getPositionAtDistance` and `getForwardDirectionAtDistance`
with a single `getMatrixAtDistance` function. Working with **matrices** is more convenient, because we can extract everything we need from them.
I will also introduce a **curve node** that stores a full matrix for a given distance along the track.
Any geometry system can “fill” these **curve nodes**, whether that system is based on splines, imported CSV data, FVD geometries or something entirely different.
While writing this, I realize it is probably best to introduce the concept first with a simple linear track. Stay tuned.

# Demo code

{{< show-script-code "/posts/writing-a-roller-coaster-simulation/FrictionAndAirResistanceScene.tsx" >}}
