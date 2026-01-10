---
title: 'Gravity'
date: 2025-12-06T09:30:00+01:00
math: true
tags: ['writing a roller coaster simulation']
---

## How do we determine the acceleration of the coaster?

To simplify things, we ignore air resistance, rolling friction and any
other additional forces. We also assume Earth’s gravity is **9.81
m/s²**. This allows us to focus entirely on the fundamental idea:

> **Gravity is the primary source of acceleration.**

On Earth, gravity provides a constant acceleration of roughly **9.81
m/s²**.

What does this number actually mean?

> Every **second**, an object's speed increases by **9.81 m/s**.

Some quick examples:

- after **1 second** → 9.81 m/s
- after **2 seconds** → 19.62 m/s
- after **3 seconds** → 29.43 m/s

In short: **acceleration continuously increases an object's speed.**

---

## Acceleration on slopes

Gravity is always pointing straight down.  
But on a slope, only a part of that force helps the coaster move along
the track.

To compute that portion, we use the **downhill-slope acceleration**:

$$acceleration = gravity \cdot sin(angle)$$

Where:

- **gravity**: Earth’s gravity (9.81 m/s²)
- **angle**: the tilt of the track
- **sin(angle)**: how much of gravity points **along** the track

### But why?

For simplification, we only look at **downward slopes** at this
point.  
Of course, in a real simulation we also have **negative angles** when
the coaster travels uphill, but we will get to that later.

For these downhill angles, the relevant sine values lie between **0
and 1**:

- **sin = 0** → no gravity along the track
- **sin = 1** → full gravity along the track

### Examples

#### **Vertical drop (90°)**

Full gravity acts along the track, essentially free fall.

- sin(90°) = 1 (100% of **gravity**)
- acceleration = **9.81 m/s²**

---

#### **45° slope**

You probably expected to get **half of gravity** here, right? Nope,
it's not linear at all. It’s a sine function.

- sin(45°) ≈ 0.707 (≈ 70% of **gravity**)
- acceleration ≈ **6.93 m/s²**

---

#### **Flat track (0°)**

No slope → no downhill force.

- sin(0°) = 0 (0% of **gravity**)
- acceleration = **0 m/s²**

---

## Why this matters for simulation

As you can see, to simulate our coaster we only need to know:

> **the angle of the track at each point.**

- 0° → **0 m/s²**, no acceleration
- 45° → **6.93 m/s²**, about 70% of gravity
- 90° → **9.81 m/s²**, full gravity (free fall)

And the crucial insight is:

> **This relationship is not linear, it's governed by sine.**

This is why 45° does _not_ give half of Earth's gravity, but roughly
**70%**.

## Interactive Example

When it comes to calculating the acceleration component along the
slope, the formula ultimately reduces to:

```typescript
const acceleration = gravity * Math.sin(slope);
```

> Keep in mind that `Math.sin` accepts **radians**, not **degrees**.
>
> A **radian** is simply another way of measuring angles, where angles
> are expressed as multiples of **π**.
>
> The range from **−π to π** corresponds to **−180° to 180°**.
>
> In code, we almost always work with **radians**, because most math
> functions expect them. Degrees are typically used only for user
> input, since they are more intuitive.
>
> When converting between the two, use:
>
> $$\text{radians} = \text{degrees} \cdot \frac{\pi}{180}$$ 
> 
> $$\text{degrees} = \text{radians} \cdot \frac{180}{\pi}$$

You can play around with **different slopes** and see how they affect
the percentage of **gravity applied** to the coaster. Having a visual
representation of written concepts really helps me reach that **I got
it** moment, so it might help you as well.

{{< embedded-content-component path="./posts/writing-a-roller-coaster-simulation/gravity/GravityDemoScene.tsx" width="100%" height="300px">}}

## What comes next?

[In the next
chapter]({{< ref "/posts/writing-a-roller-coaster-simulation/evaluating-motion.md" >}}),
we’ll add motion evaluation and move a simple object along a linear
plane.

# Demo code

{{< repository-code-with-clone file="src/content/posts/writing-a-roller-coaster-simulation/gravity/GravityDemoScene.tsx" >}}
