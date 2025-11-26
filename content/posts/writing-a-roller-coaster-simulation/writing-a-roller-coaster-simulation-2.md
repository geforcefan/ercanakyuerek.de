---
title: "Writing a Roller Coaster Simulation – Determining Acceleration"
date: 2025-11-26T12:35:00+01:00
math: true
---

## How do we determine the acceleration of the coaster?

To simplify things, we ignore air resistance, rolling friction and any other additional forces. We also assume Earth’s gravity is **9.81 m/s²**. This allows us to focus entirely on the fundamental idea:

> **Gravity is the primary source of acceleration.**

On Earth, gravity provides a constant acceleration of:

> g = 9.81 m/s²

What does this number actually mean?

> Every second, an object's downward speed increases by **9.81 m/s**.

Some quick examples:

- after **1 second** → 9.81 m/s
- after **2 seconds** → 19.62 m/s
- after **3 seconds** → 29.43 m/s

In short: **gravity continuously increases an object's speed toward Earth.**

---

## Acceleration on slopes

Gravity is always pointing straight down.  
But on a slope, only a part of that force helps the coaster move along the track.

To compute that portion, we use the **downhill-slope acceleration**:

> **acceleration = g × sin(angle)**

Where:

- **g** – Earth’s gravity (9.81 m/s²)
- **angle** – the tilt of the track
- **sin(angle)** – how much of gravity points *along* the track

### Why sine?

But for simplification, we only look at **downward slopes** at this point.  
Of course, in a real simulation we also have **negative angles** when the coaster travels uphill, but we will get to that later.

For these downhill angles, the relevant sine values lie between **0 and 1**:

- **sin = 0** → no gravity along the track
- **sin = 1** → full gravity along the track

### Examples

#### **Vertical drop (90°)**
Full gravity acts along the track, essentially free fall.

- sin(90°) = 1 (100% of **gravity**)
- acceleration = **9.81 m/s²**

Velocities:
- 1 s → **9.81 m/s**
- 2 s → **19.62 m/s**
- 3 s → **29.43 m/s**

---

#### **45° slope**
You probably expected to get **half of gravity** here, right? Nope, it's not linear at all :D It’s a sine function.

- sin(45°) ≈ 0.707 (≈ 70% of **gravity**)
- acceleration ≈ **6.93 m/s²**

Velocities:
- 1 s → **6.93 m/s**
- 2 s → **13.86 m/s**
- 3 s → **20.79 m/s**

---

#### **Flat track (0°)**
No slope → no downhill force.

- sin(0°) = 0 (0% of **gravity**)
- acceleration = **0 m/s²**

Velocities:
- 1 s → **0 m/s**
- 2 s → **0 m/s**
- 3 s → **0 m/s**

---

## Why this matters for simulation

As you can see, to simulate our coaster we only need to know:

> **the angle of the track at each point.**

- 0° → **0 m/s²**, no acceleration
- 45° → **6.93 m/s²**, about 70% of gravity
- 90° → **9.81 m/s²**, full gravity (free fall)

And the crucial insight is:

> **This relationship is not linear, it's governed by sine.**

This is why 45° does *not* give half of Earth's gravity, but roughly **70%**.

---

## What comes next?

In the next chapter, we’ll write a small piece of code that evaluates the physics and moves a simple object along a linear plane.  
We will set up a tiny example project and apply everything we have learned so far.
