---
title: "Writing a Roller Coaster Simulation – Introduction  and Motion Dynamics"
date: 2025-11-26T12:30:00+01:00
---

You might have played around with JavaScript animations or small physics experiments before, but in this series we are going to take things a step further. We will build a simplified roller coaster simulation directly in the browser. The goal is not to create a full physics engine or a hyper-realistic coaster model, but to understand the core ideas behind motion, acceleration, track geometry and visual rendering.

We will use technologies that are easy to access and quick to experiment with. Throughout the series, we will rely on **TypeScript**, **React** and **Three.js**. This combination gives us a clean developer experience and allows us to turn mathematical concepts into visual, interactive 3D scenes with very little overhead.

The idea behind this series is simple. Instead of reading theory first, we will learn by building something fun. Each chapter focuses on a single concept. By the end, you will understand how a small coaster car can move along a track, how the track itself is defined, and how everything is drawn in the browser.

## Motion Dynamics

At the end of the day, simulating a roller coaster comes down to one simple question:

**How much distance should the coaster travel in each simulation step?**

To keep things simple, let’s assume our simulation updates roughly every **16 ms**, which is what you would get at about 60 FPS. So the question becomes:

**How far does the coaster need to travel within these 16 ms?**

To answer this, we follow a very straightforward chain of logic:

- **To know the distance to travel, we first need the velocity**
- **To know the velocity, we first need the acceleration**

So everything begins with acceleration.
Acceleration changes the velocity, **velocity determines the distance to travel**, and the distance to travel tells us where the coaster ends up in the next 16 ms.

This gives us a simple structure:

Acceleration → Velocity → Distance

Once we understand the acceleration acting on the coaster, the rest follows naturally.

In the next chapter, we will take the first real step of the simulation and answer the core question:


[How do we determine the acceleration of the coaster?]({{< ref "/posts/writing-a-roller-coaster-simulation/writing-a-roller-coaster-simulation-2.md" >}})