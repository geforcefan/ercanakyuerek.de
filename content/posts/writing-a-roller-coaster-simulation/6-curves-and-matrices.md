---
title: 'Curves and Matrices'
date: 2025-12-06T13:30:00+01:00
math: true
draft: true
tags: ['writing a roller coaster simulation']
---

In the last chapters we built a small physics model with friction and air resistance, we added evaluation
functions, a linear track and a few interactive examples. Good progress so far.
Now we want to move closer to proper roller coaster geometry, **and before we deal with NURBS or
more advanced shapes, we need one clean foundation**.

Right now every curve type behaves differently. A **linear** track works one way, a **NURBS** another, an
**FVD** track another and a **CSV** import is basically just raw points. The physics system should not
care about any of this. It should ask for one thing only:

> Give me the **position and forward direction** for a **distance** along the track.

This already gives us a unified interface, but we can go one step further.

# Matrices

Till now, we treated position and forward direction as separate values.
A 4×4 matrix gives us a much nicer representation. It stores:

- position
- forward direction
- left direction
- up direction

All in one place. This will make track generation and other calculations much easier later.

So our interface becomes:

> Give me the **transformation matrix** for a **distance** along the track.

From that matrix, we can extract everything we need.

# Curve Nodes

The first step is to introduce a small abstraction I like to call Curve Nodes.
Think of a node as a tiny packet of matrices and at a certain position along the track.

A node will contain exactly two important things:

- the distance along the curve
- the matrix at that distance

We end up at the end with something like:

```typescript
type CurveNode = {
  matrix: Matrix4;
  distance: number;
};
```

We need a way to query a matrix at a given distance in our interface, like described above:

```typescript
const getMatrixAtDistance = (curve: CurveNode[], distance: number) => Matrix4;
```

Now we also need a way to add a node to a curve. We need a little utility function which creates a matrix
from a point and calculates the normals (direction vectors essentially) according to the previous node, everything
automatically in one utility function:

```typescript
const insertPoint = (curve : CurveNode[]) => CurveNode[]
```

of course we will also need to get the total length of a curve:

```typescript
const getLength = (curve: CurveNode[]) => double;
```

And that's pretty much it, for now. In the future, there will be other useful information needed in our nodes, but for now
this is all we need.

> **Note**: Keep in mind, we don't take **banking / roll** into account

{{< iframe src="writing-a-roller-coaster-simulation/curves-and-matrices.html" width="100%" height="300px" >}}