---
title: 'Introduction and Motion Dynamics'
date: 2025-12-06T08:30:00+01:00
tags: ['writing a roller coaster simulation']
---

You might have played around with JavaScript animations or small physics experiments before, but in this series we are going to take things a step further. We will build a simplified roller coaster simulation directly in the browser.

My goal here isn’t to build some engineering-grade physics engine. I just want to recreate the kind of coaster **physics** we all know from things like **NoLimits Roller Coaster or other coasters in games**.
Nothing overly scientific, just the kind of system that behaves the way we intuitively expect.
In the end, the physics model will end up pretty close to what **NoLimits Roller Coaster** does anyway, just without all the heavy engineering baggage.

We will use technologies that are easy to access and quick to experiment with. Throughout the series, we will rely on **TypeScript**, **React** and **THREE.js**. This combination gives us a clean developer experience and allows us to turn mathematical concepts into visual, interactive 3D scenes with very little overhead.

The idea behind this series is simple. Instead of reading theory first, we will learn by building something fun. Each chapter focuses on a single concept. By the end, you will understand how a small coaster car can move along a track, how the track itself is defined, and how everything is drawn in the browser.

## Setting up the project

Before we start, I’ll assume you already have **Node.js** installed. If not, go ahead and download it first.

Also, a quick heads-up: if some of the scripts or tools I’m covering here don’t work on Windows, I’m sorry. There are ways to get a similar environment on **Windows**, for example, using **WSL**, but I’m not a **Windows** user, so I can’t really help there. I’m focusing on **Linux** and **macOS**, where the toolchains are very similar.

We’ll keep things simple. You can set up your stack, however, you like, but for this series I’ll just use **Create React App** with **TypeScript** and won’t bother with any extra tooling. The goal here is to explain the concepts, not to demonstrate how to engineer a perfectly structured project. That’s a whole different topic.

If you want to overengineer it, go for it. But for now, something as basic as this is completely fine:

```bash
npx create-react-app roller-coaster-simulation --template typescript
```

Next, install a few useful dependencies. This is all we need for now. If I end up using another package later in the series and forgot to list it here, feel free to install it when you get to that part:

```bash
npm i leva three lodash @react-three/drei @react-three/fiber @types/three @types/lodash
```

> **Important note:** In every article, I show example code. These code files live in the **same repository** that powers this **blog**. The blog itself is a repository, and all chapters, demos, and examples live there together.
>
> The repository contains a **shared** collection of scripts used across multiple articles, such as **camera setup, wireframe helpers, and scene utilities**. Code that is specific to a chapter usually lives **close to that chapter**, while common pieces are shared.
>
> Because of this, you may occasionally see functionality being used before it is explicitly introduced in the text. **If something looks unfamiliar, clone the repository, run the examples, and follow the imports to see how things are implemented**.
> Some parts of the codebase intentionally exist a bit ahead of the articles to keep later iterations simpler.


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

> Acceleration → Velocity → Distance

Once we understand the acceleration acting on the coaster, the rest follows naturally.

In the next chapter, we will take the first real step of the simulation and answer the core question: [How do we determine the acceleration of the coaster?]({{< ref "/posts/writing-a-roller-coaster-simulation/gravity.md" >}})
