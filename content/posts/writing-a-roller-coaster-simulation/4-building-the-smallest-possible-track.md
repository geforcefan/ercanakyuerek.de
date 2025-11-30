---
title: "Writing a Roller Coaster Simulation – Building the Easiest Possible Track"
date: 2025-11-28T12:35:00+01:00
math: true
---

In the previous chapter, I said we were going to visualize the evaluated motion with a small demo. I kind of lied, because I realized we first need something different. To visualize motion properly, we need something for our object to move along. And that means we need a track.

In this article, we focus on an extremely simplified roller coaster track, specifically a plane. In other words, we use a purely linear track, also known as a first-order curve. This is the easiest possible form of track and perfect for introducing the core ideas before we move on to real curves.

From the last chapter, we know how motion evaluation works. The evaluation function receives an acceleration value and returns a new simulation state containing the updated velocity and the total distance traveled:

```js
evaluateMotion(state, acceleration, deltaTime)
```

It returns something like:

```json
{
  "velocity": 10,
  "distanceTraveled": 20
}
```

Now that we introduce a track, things become more complex, and it makes sense to adjust the evaluateMotion function. Previously, acceleration came from outside and was calculated using a fixed slope and gravity:

$$acceleration = gravity \cdot \sin(slopeAngle)$$

Since we are preparing for more advanced features, we remove the acceleration parameter and introduce two new ones:

- **forwardDirection**, a vector pointing forward along the track at the given distance
- **gravity**, the usual 9.81 m/s² on Earth

We will no longer use ``gravity * Math.sin(slopeAngle)``. There is a better way to compute acceleration once we have a forward direction.

> We simply define a gravity direction vector.

Gravity points downward, toward Earth, along the negative y‑axis:

$$\vec{gravityDirection} = \begin{bmatrix} 0 \\ -9.81 \end{bmatrix}$$

Now what do we do with ``forwardDirection`` and ``gravityDirection``?  
We compute their dot product:

$$acceleration = \vec{forwardDirection} \cdot \vec{gravityDirection}$$

This replaces:

$$acceleration = gravity \cdot \sin(slopeAngle)$$

In code, it becomes:

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

Once the evaluation step gives us a **distance traveled**, we need to convert that number into something the renderer can use.

Even the easiest possible track must answer **two important questions** that our physics and visualization depend on:

> Where is the position at a given distance along a curve?

The concept is the same whether the track is straight or twisted.

- After traveling **1 meter**, we need the **position at 1 meter**.
- After **5 meters**, we need the **position at 5 meters**.

So we need a function that returns the position at any distance:

```js
getPositionAtDistance(distance)
```

We also need the forward direction at that distance, so we need to answer:

> What is the forward direction at a given distance along a curve?

```js
getForwardDirectionAtDistance(distance)
```

Both of these operate purely on the curve geometry.

## getPositionAtDistance on Linear “Curves”

For linear curves, the process is simple. Later, we will build a spline system for real coaster geometry.

A linear curve uses two control points: `cp1` and `cp2`, both 2D vectors. We use THREE.js helpers for convenience.

### How do we get the 2D position at a distance?

We linearly interpolate between the two points:

$$ \vec{pos} = \vec{cp1} + (\vec{cp2} - \vec{cp1}) \cdot t $$

Where **t** is the traveled fraction:

- 0 → cp1
- 1 → cp2
- 0.5 → midpoint

To compute t, we divide the distance by the full segment length:

$$ t = \frac{distance}{length} $$

The length between two points is:

$$ length = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} $$

Putting everything together:

```js
const getPositionAtDistance = (cp1, cp2, distance) => {
    const length = Math.sqrt((cp2.x - cp1.x)**2 + (cp2.y - cp1.y)**2);
    const t = distance / length;
    return {
        x: cp1.x + (cp2.x - cp1.x) * t,
        y: cp1.y + (cp2.y - cp1.y) * t
    };
};
```

Or using THREE.js:

```js
const getPositionAtDistance = (cp1, cp2, distance) => {
    return cp1.clone().lerp(cp2, distance / cp1.distanceTo(cp2));
};
```

## How to Calculate Forward Direction Along the Curve

Since this is a linear curve, the slope is constant. The forward direction is simply the normalized difference between the points:

$$ \vec{forwardDirection} = \frac{\vec{cp2} - \vec{cp1}}{\lVert \vec{cp2} - \vec{cp1} \rVert} $$

This is simply a fancy way of describing the following in code:

```js
const getForwardDirectionAtDistance = (cp1, cp2, distance) => {
    return cp2.clone().sub(cp1).normalize();
};
```

## Small note

Later, the forward vector will be replaced by a **4x4 matrix**, which contains position, right, up and forward direction all at once. This becomes our single source of truth. But for now, ignore this.

## Adding Everything Up: Small Demo

The demo updates every 16 ms and displays:

- current velocity
- traveled distance
- current position on the track

{{< show-static-file-code "writing-a-roller-coaster-simulation/building-the-smallest-possible-track.html" >}}

In the next chapter, we will finally visualize everything using THREE.js, animate control points, and maybe add friction and air resistance, since both are very easy to implement.
