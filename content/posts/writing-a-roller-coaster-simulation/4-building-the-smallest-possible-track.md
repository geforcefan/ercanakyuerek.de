---
title: "Writing a Roller Coaster Simulation – Building the Smallest Possible Track"
date: 2025-11-28T12:35:00+01:00
math: true
---

In the previous chapter, I said we were going to visualize the evaluated motion with a small demo. Technically true, but also not entirely accurate. To visualize motion properly, we first need something for our object to move along. And that means we need a track.  
In this article, we focus on an extremely simplified roller coaster track.

Even the smallest possible track must answer two important questions that our physics and visualization rely on.

From the last chapter, we know how motion evaluation works: the evaluation function receives an acceleration value and returns a new simulation state containing the updated velocity and the total distance traveled along the track:

```js
evaluateMotion(state, acceleration, deltaTime)
```

It produces something like:

```json
{
  "velocity": 10,
  "distanceTraveled": 20
}
```

Once the physics evaluation step gives us a **distance traveled**, we must convert that number into something the renderer can interpret:

> Where is the position at any distance along a curve?

It makes no difference whether the track is straight or completely twisted. The computation is simpler on straight lines, but the concept is identical:

- If we’ve traveled **1 meter**, we need the **position at 1 meter**.
- If we’ve traveled **5 meters**, we need the **position at 5 meters**.

So for visualization we absolutely need a function that returns the position at any distance along the curve:

```js
getPositionAtDistance(distance)
```

Physics uses the same idea. The evaluation step needs to know how much of gravity acts **along the track direction** at a given distance. Previously, we used a fixed `slopeAngle` and calculated:

$$acceleration = gravity \cdot sin(slopeAngle)$$

Now that the track has actual geometry, we let the track define its own steepness:

```js
getDownhillAccelerationAtDistance(distance)
```

Both of these functions operate purely on the curve geometry. One returns a position. The other returns how gravity influences motion along the track. With these two components, the simulation behaves exactly as described in the previous chapter.


## getPositionAtDistance on Linear “Curves”

Let’s implement these two functions. For linear curves, the process is very straightforward. Later, in the full implementation, we’ll build a spline system to handle more complex track geometry.

A linear curve has exactly two control points, which we’ll call `cp1` and `cp2`. Both are simple 2D vectors for this demo. We’ll also rely on THREE.js math utilities because they come with many handy helper methods.

### How do we get the 2D position at a distance along the curve?

Conceptually, we need to **linearly interpolate** between the two control points:

$$ \vec{pos} = \vec{cp1} + (\vec{cp2} - \vec{cp1}) \cdot t $$

The only missing variable is **t**, which represents the fraction of the curve length we’ve traveled:

- **0** → 0% → exactly at `cp1`
- **1** → 100% → exactly at `cp2`
- **0.5** → 50% → halfway between them

Instead of passing a percentage, we want to pass a real **distance**, so we convert distance into a value between 0 and 1. To do this, we need the total **length** of the segment.

How do we compute the distance between two points?  
Using Pythagoras:

$$ a^2 + b^2 = c^2 $$

Solved for c:

$$ c = \sqrt{a^2 + b^2} $$

Substitute the x and y differences of the control points:

$$ length = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} $$

Now we can convert any distance into an interpolation factor:

$$ t = \frac{distance}{length} $$

Putting everything together:

```js
const getPositionAtDistance = (cp1, cp2, distance) => {
    const length = Math.sqrt((cp2.x - cp1.x) ** 2 + (cp2.y - cp1.y) ** 2);
    const t = distance / length;
    return {
        x: cp1.x + (cp2.x - cp1.x) * t,
        y: cp1.y + (cp2.y - cp1.y) * t
    };
};
```

Or you can just use the **THREE.js** helpers instead of reinventing the wheel again :):

```js
const getPositionAtDistance = (cp1, cp2, distance) => {
    return cp1.clone().lerp(cp2, distance / cp1.distanceTo(cp2));
};
```

Yes, I know, **if the distance is 0**, the universe will supposedly **collapse** due to **division by 0**, but for the sake of simplicity we ignore that here. Add a safety check in real code.


## How to Calculate Gravitational Acceleration Along the Curve

Previously we used a fixed slope angle:

$$acceleration = gravity \cdot sin(slopeAngle)$$

Now the track geometry itself determines how steep it is. Instead of a manual angle, we compute how much of gravity projects onto the track direction.

Gravity always points downward, so its vector is:

```js
const gravityDir = new THREE.Vector2(0, -1);
```

The forward direction of the track is:

```js
const forward = cp2.clone().sub(cp1).normalize();
```

The gravitational acceleration along the track is simply the **projection** of the gravity vector onto the forward vector.

$$acceleration = gravity \cdot \cos(forward \times gravityDir)$$

Full implementation:

```js
const getDownhillAccelerationAtDistance = (cp1, cp2, distance, gravity) => {
    const forward = cp2.clone().sub(cp1).normalize();
    const gravityDir = new THREE.Vector2(0, -1);
    return gravity * forward.dot(gravityDir);
};
```

Since this is a **linear** curve, the slope is constant throughout, meaning this function always returns the same acceleration regardless of the distance. But this prepares us for real roller coaster tracks later, where curves, slopes, and radii vary smoothly, then distance becomes essential.

## Running the simulation

For the first time, here’s a full HTML example that combines everything we’ve covered so far. It also includes the CDN build of **THREE.js**, so you can run it instantly.

The demo refreshes once every **16 ms** and displays the live state of the simulation: 

- the current velocity
- how many distance the coaster has already traveled
- its computed position on the track (both x and y)

The example uses a relatively flat segment: **over a distance of 10 meters, the track drops by only about 1 meter.**

{{< show-static-file-code "writing-a-roller-coaster-simulation/building-the-smallest-possible-track.html" >}}