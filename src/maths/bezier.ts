import { Vector3 } from 'three';

import { uniformSampleMap } from '../helper/uniform-sample';

import { fromUniformSampledPositions } from './curve';

export const bezierFast = (
  p0: Vector3,
  p1: Vector3,
  p2: Vector3,
  p3: Vector3,
  t: number,
) => {
  const t1 = 1.0 - t;
  const b0 = t1 * t1 * t1;
  const b1 = 3 * t1 * t1 * t;
  const b2 = 3 * t1 * t * t;
  const b3 = t * t * t;

  return new Vector3(
    b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
    b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y,
    b0 * p0.z + b1 * p1.z + b2 * p2.z + b3 * p3.z,
  );
};

export const estimateLength = (
  p0: Vector3,
  p1: Vector3,
  p2: Vector3,
  p3: Vector3,
) => {
  const points = uniformSampleMap(0, 1, 8, (t) =>
    bezierFast(p0, p1, p2, p3, t),
  );

  return points
    .slice(1)
    .reduce(
      (totalLength, point, i) =>
        totalLength + point.distanceTo(points[i]),
      0,
    );
};

export const bezierSplineCurve = (
  p0: Vector3,
  p1: Vector3,
  p2: Vector3,
  p3: Vector3,
  resolution: number = 10,
) => {
  return fromUniformSampledPositions(
    0,
    estimateLength(p0, p1, p2, p3),
    resolution,
    (at, t) => bezierFast(p0, p1, p2, p3, t),
  );
};
