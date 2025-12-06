---
title: 'First results and improved spline interpolation'
date: 2023-03-07T00:30:20+01:00
tags: ["roller coaster simulation"]
---

In the latest update I tracked down a couple of bugs that caused all those tiny jitters I 
mentioned earlier. At first I thought they were just floating-point problems coming from 
the WebAssembly module in the browser, but the real issue turned out to be the 
**roll interpolation**.

Let me give you a quick overview of what’s going on. When we interpolate a NURBS track, 
we first estimate the total track length using a pretty rough step size. Based on that 
 estimation, we generate a dense enough set of nodes. After that, we compute normals for 
e very node and apply the normal angles on the **x** and **y** axes, the **z** axis (the roll) 
comes later. These normals get applied to the previous matrix, so the whole orientation 
flows along the track. Once that’s done, we generate a **C2-continuous cubic spline**, and 
the z-rotation that results from applying the x/y normals is added to the roll value at 
each roll point.

The next step is to run through all nodes again and apply the actual roll (the z rotation). 
And finally, when we want the transformation matrix at some distance along the track, 
we simply binary-search for the two surrounding nodes and linearly interpolate between them.

This all works, but one thing caused trouble:  
I originally **pre-applied the roll on every node**, and that introduced precision errors 
which showed up as visible jitter. The fix was pretty simple: 
**don’t bake the roll into every node**. Instead, keep it separate and apply the roll 
only when someone asks for a matrix at a specific distance. That completely removes the jitter.

On top of that, I cleaned up the interpolation loop so we only iterate through 
the nodes **once**, which gave a nice performance boost.

## What's Next?

Now that the interpolation system is finally stable, I’ve 
started working on **multi-track support**. It’s a bit tricky, but nothing too dramatic. 
Once that’s in place, the next step will be to build a **basic block system**, which will 
finally bring us closer to a real, fully working roller coaster simulation.

{{< iframe src="roller-coaster-simulation/simulator-1.html" height="600px" >}}
