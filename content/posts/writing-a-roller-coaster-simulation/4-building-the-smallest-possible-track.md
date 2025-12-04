---
title: "Writing a Roller Coaster Simulation – Building the Easiest Possible Track"
date: 2025-11-28T12:35:00+01:00
math: true
---

In the previous chapter, I said we were going to visualize the evaluated motion with a small demo, but I realized we first need something else first. To visualize motion properly, we need something for our little object to move along. And that means we need a track.

In this article, we focus on an extremely simplified roller coaster track. And when I say extremely simplified, I really mean it: it's just a plane. A straight line. A first-order curve. Basically the easiest form of track you can possibly build without accidentally creating a real coaster.

From the last chapter, we know how motion evaluation works. The evaluation function receives an acceleration value and returns a new simulation state containing the updated velocity and the total distance traveled:

```js
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

$$\vec{gravityDirection} = \begin{bmatrix} 0 \\ -9.81 \end{bmatrix}$$

Now what do we do with `forwardDirection` and `gravityDirection`?
We take their dot product. That’s it. Really. That’s the whole trick:

$$acceleration = \vec{forwardDirection} \cdot \vec{gravityDirection}$$

This one line replaces the entire downhill-slope acceleration formula thing:

$$acceleration = gravity * sin(slopeAngle)$$

In code:

```js
const acceleration = forwardDirection.dot(new Vector2(0, -gravity));
```

And our updated evaluateMotion function becomes:

```js
const evaluateMotion = (state, forwardDirection, gravity, deltaTime) => {
  const acceleration = forwardDirection.dot(new Vector2(0, -gravity));
  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled = state.distanceTraveled + velocity * deltaTime;
  return { velocity, distanceTraveled };
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

```js
getPositionAtDistance(distance);
```

We also need the forward direction at that distance, because the evaluation function requires it as an input, as we introduced just a few sentences above. So we must answer:

> What is the forward direction at a given distance along a curve?

```js
getForwardDirectionAtDistance(distance);
```

Both functions work purely on the curve geometry.

## getPositionAtDistance on Linear “Curves”

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

```js
const getPositionAtDistance = (cp1, cp2, distance) => {
  const length = Math.sqrt((cp2.x - cp1.x) ** 2 + (cp2.y - cp1.y) ** 2);
  const t = distance / length;
  return {
    x: cp1.x + (cp2.x - cp1.x) * t,
    y: cp1.y + (cp2.y - cp1.y) * t,
  };
};
```

Or using **THREE.js** to save yourself some sanity and avoid reinventing the wheel over and over again. I explained this part without THREE.js as well, but you may just forget it, the articles get way too big if I try to explain every concept of vectors and math in detail. For now we simply know: THREE.js is our friend:

```js
const getPositionAtDistance = (cp1, cp2, distance) => {
  return cp1.clone().lerp(cp2, distance / cp1.distanceTo(cp2));
};
```

## How to Calculate Forward Direction Along the Curve

Since this is a linear curve, the forward direction is constant everywhere. It doesn’t get easier than this.

Mathematically:

$$ \vec{forwardDirection} = \frac{\vec{cp2} - \vec{cp1}}{\lVert \vec{cp2} - \vec{cp1} \rVert} $$

Translated into code:

```js
const getForwardDirectionAtDistance = (cp1, cp2, distance) => {
  return cp2.clone().sub(cp1).normalize();
};
```

## Small note

Later, the forward vector will be replaced by a **4×4 matrix**, which includes position, forward, right and up vectors all at once. That matrix will become our single source of truth, which makes it possible to reduce everything to just one method called ``getMatrixAtDistance``. I know, yet again a change, but that’s future you’s problem. Ignore it for now.

Going forward, we will use **9.81665 m/s²** as the gravitational acceleration, since this is also the value used by **NoLimits Roller Coaster** and **openFVD++**.

## Adding Everything Up: Small Demo
Time for a small demo. I built a very simple setup: a visible line segment with draggable control points so you can adjust the slope in real time. On the side, a small panel displays the live simulation state.

I switched the vectors to 3D instead of 2D, but only because it makes things more convenient in Three.js. The actual calculations from this article are exactly the same.

{{< iframe src="writing-a-roller-coaster-simulation/demo-linear-track.html" width="100%" height="300px" >}}

I’ve polished things a bit and moved the physics and linear interpolation logic into their own files instead of keeping everything as spaghetti code. The complete source code is available in my GitHub repo, feel free to explore and play around with it.

{{< show-file-code "scripts/scenes/DemoLinearTrackScene.tsx" >}}

[In the next chapter]({{< ref "/posts/writing-a-roller-coaster-simulation/5-friction-and-air-resistance.md" >}}) we will introduce friction and air resistance. Of course there will be a demo where you can play with the parameters and compare both physics evaluations, with and without energy loss.