---
title: 'Improved spline interpolation'
date: 2023-03-07T00:30:20+01:00
tags: ["roller coaster simulation"]
---

In the latest update, a number of bugs were discovered, particularly in the precision of floating point calculations when working with a web assembly module in a browser environment. It was found that the jitters mentioned earlier were actually caused by a bug in the roll interpolation process.

To give a brief overview, track interpolation involves estimating the length of a NURBS track by interpolating with a large step size and evaluating nodes based on the estimated length, resulting in a dense enough interpolation. After this, the normals are calculated and normal angles are applied on the y and x directions but not on the z direction yet, which is essentially the roll. These normals are then applied to the previous matrix and the process continues. A C2 continuous cubic spline is then constructed, and the z angle, which is the result of applying normals in the x and y directions, is applied on each roll point on top of its roll value. The next step is to iterate through all nodes again and apply rotation on the z direction. Finally, to obtain the matrix at any point, we perform a binary search for the minimum and maximum node whose distance lies between the two and interpolate linearly.

However, a problem arises when the roll is pre-applied, resulting in jitters due to precision issues. To solve this, the roll should not be applied on each node but only when requesting a matrix at a specific distance. Additionally, the performance was optimized by reducing the time for iterating through all nodes to only once.

# What's Next?

With a stable track interpolating method in place, work has started on coding multi-track support. Although it presents some challenges, they are not insurmountable. Once the multi-track support is completed, a basic block system will be developed to create a real simulation environment.

Lastly, the program has been updated to include another coaster from the NoLimits 2 Library inside the "Storm Valley" park.

{{< iframe src="roller-coaster-simulation/simulator-2.html" height="600px" >}}
