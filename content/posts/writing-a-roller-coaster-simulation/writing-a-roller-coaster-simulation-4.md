---
title: "Writing a Roller Coaster Simulation – Building the Smallest Possible Track"
date: 2025-11-28T12:35:00+01:00
math: true
---
In the last chapter I said we were going to visualize the evaluated motion with a small demo. Technically true, but it was a lie. To visualize motion properly we need something for our object to move on. And that means we need a track. So in this article we’re focusing on a very simplified roller coaster track.

We’re not building real coaster geometry yet. **No curves, no banking, no roll.** Just the simplest possible version: a **straight line** defined by two control points. Start and end. That’s enough to get the idea across.

But even a minimal track has to answer two questions that our physics needs.

When we evaluate motion, we always need the slope angle. That tells us how gravity affects the coaster. So we need to know:

> What is the angle at any distance along a curve?

On a straight line that angle never changes, but I’m making a point here. The method we’re building now is the exact method we will use later for real coaster geometry, where the slope actually changes continuously along the curve.

The same goes for visualization. Once the physics step gives us a distance traveled, we need to turn that number into an actual position in 2D or 3D space. Which means:

> Where is the position at any distance along a curve?

If the object has traveled 1 meter, we need the position at 1 meter. If it has traveled 12.4 meters, we need the position at 12.4 meters. It doesn’t matter if the track is straight or completely twisted.

So in code we need two methods.

```js
getAngleAtDistance(distance)
getPositionAtDistance(distance)
```

I’m splitting them here so the idea is clear. In later implementations these two methods can be replaced with a single method called `getMatrixAtDistance(distance)`, where we can extract all this information much more easily once we work with matrices. But more on that later. For now just forget it again :P

When we later swap our simple line for a real coaster track, this method will immediately work for other types of curves. The evaluation and visualization logic stays exactly the same. Physics still asks for angle at distance, rendering still asks for position at distance. Only the internal curve math changes.

That’s why we start tiny, but design it like the real deal. More coming soon.
