import { Vector4 } from 'three';

import { fromPoints as bSplineFromPoints } from '../maths/b-spline';

export const fromPoints = (
  points: Vector4[],
  closed: boolean = false,
  resolution: number = 20,
) => {
  const bSplinePoints: Vector4[] = [...points];

  if (!closed) {
    const firstPoint = bSplinePoints[0];
    const lastPoint = bSplinePoints[bSplinePoints.length - 1];

    bSplinePoints.unshift(firstPoint, firstPoint);
    bSplinePoints.push(lastPoint, lastPoint);
  } else if (closed && bSplinePoints.length >= 4) {
    bSplinePoints.unshift(bSplinePoints[bSplinePoints.length - 1]);
    bSplinePoints.push(bSplinePoints[1]);
    bSplinePoints.push(bSplinePoints[2]);
  }

  return bSplineFromPoints(bSplinePoints, resolution);
};
