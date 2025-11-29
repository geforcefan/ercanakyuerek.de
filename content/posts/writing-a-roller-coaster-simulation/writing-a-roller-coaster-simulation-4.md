---
title: "Writing a Roller Coaster Simulation – Building the Smallest Possible Track"
date: 2025-11-28T12:35:00+01:00
math: true
---
In the last chapter I said we were going to visualize the evaluated motion with a small demo. Technically true, but it was a lie. To visualize motion properly we need something for our object to move on. And that means we need a track. So in this article we’re focusing on a very simplified roller coaster track.

We’re not building real coaster geometry yet. **No curves, no banking, no circuit.** Just the simplest possible version: a **straight line** defined by **two control points**. Start and end. That’s enough to get the idea across.

But even a minimal track has to answer two questions that our physics needs, because from the previous chaper we know how to evaluate motion:

```js
evaluateMotion(state, slopeAngle, gravity, tickInterval)
```
Which returns velocity and distance traveled (some example values which demonstrates the possible return from the evaulation function):

```json
{
  "velocity": 10,
  "distanceTraveled": 20
}
```

So we evaluate motion, we always need the **slope angle**. That tells us how gravity affects the coaster. So we need to know:

> What is the angle at any distance along a curve?

On a **straight line that angle never changes**, but I’m making a point here. The method we’re building now is the exact method we will use later for real coaster geometry, where the slope actually changes continuously along the curve.

The same goes for visualization. Once the physics evaluation step returns us a **distance traveled**, we need to turn that number into an actual **position in 2D or 3D space**. Which means:

> Where is the position at any distance along a curve?

It doesn’t matter if the track is straight or completely twisted. The calculation is of course more easy on straight lines, but the concept remains:

- If traveled **1 meter**, we need the **position in room** at **1 meter** along the track.
- If traveled **5 meters**, we need the **position in room** at **5 meters** along the track. 

So in code we need two methods which answers the both big and important questions.

```js
getAngleAtDistance(distance)
getPositionAtDistance(distance)
```

In later implementations these two methods can be replaced with a single method called `getMatrixAtDistance(distance)`, where we can extract all this information much more easily once we work with matrices. But more on that later. For now just forget it again :P

When we later swap our simple line for a real coaster track, this method will immediately work for other types of curves. The evaluation and visualization logic stays exactly the same. Physics still asks for angle at distance, rendering still asks for position at distance. Only the internal curve math changes.

That’s why we start tiny, but design it like the real deal.

## getPositionAtDistance on linear "curves"

So lets implement those two functions which are pretty straight forward, like mentioned, we will simplify everything for linear curves. Later on "real"
implementation of a curve, we will build an actual spline system around the track geometry creation. We know a linear curve have just two control points, lets 
call them cp1 and cp2. Both are 2D Vectors in our simple demo. We will also use THREE.js maths, they already include tons of usefull stuff.

### How to get the 3d position of a distance along the curve?
In simple terms, we need to **linear interpolate** between the **two control points**: 

$$ \vec{pos} = \vec{cp1} + (\vec{cp2} - \vec{cp1}) * t$$

The only missing variable is **t** in our case, which is an interval **between 0 and 1**, which means how many "percentage" is 
our point along the curve. 
- **0** means it is **0%** distance on the curve, which is just position of **cp1** 
- **1** means it is **100%** distance on the curve, which is just the position of **cp2** 
- **0.5** means it is **50%** distance on the curve, which is at the very middle of **both control points**

It is very simple and logical, right? So **t** accepts a "percentage" value between 0 and 1, but the need to pass a distance instead of
a factor, right? Yeah, thats why we transalte from **distance** to **factor** between 0 and 1, which is very simple. We need to know the total
distance between the two control points, in other words: **the length of the curve**. How to calculate the distance between two points?
Do you remember scool and a guy called pythagoras? Yeah, pythagorian theorem, this thing with 

$$a^2 + b^2 = c^2$$ 

It turns out, this is the perfect way to measure distance between to points with 

$$c = \sqrt{a^2 + b^2}$$
 
In our context:

```js
const length = sqrt((cp2.x - cp1.x) ** 2 + (cp2.y - cp1.y) ** 2)
```

Now as we know the total length of the track, we can translate the distance we´d like to know to a percent
amount along the curve via

$$t = distance / length$$ 

So this is how our function looks like at the end:

```js
const getPositionAtDistance = (cp1, cp2, distance) => {
    const length = sqrt((cp2.x - cp1.x) ** 2 + (cp2.y - cp1.y) ** 2)
    const t = distance / length;
    return new THREE.Vector2(
        cp1.x + (cp2.x - cp1.x) * t,
        cp1.y + (cp2.y - cp1.y) * t
    )
}
```

and of cource, THREE.js has lots of helper , I wanted to make a point, just make your like easier and use this or any other vektor and matrix library.

```js
const getPositionAtDistance = (cp1, cp2, distance) => {
    return cp1.lerp(cp2, distance / cp1.distanceTo(cp2));
}
```

I CLEARELY know, that if the distance is 0, our universe will disaper bevause of division by 0, but again, for simplicity reason, we just ignore it, I mean if you want, 