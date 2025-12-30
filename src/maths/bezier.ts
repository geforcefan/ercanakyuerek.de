import { Vector3 } from 'three';

import { uniformSampleMap } from '../helper/uniform-sample';

import { fromUniformSampledPositions } from './curve';

export const deCasteljau = (points: Vector3[], t: number) => {
  if (points.length < 1)
    throw new Error(`Expected control points, got ${points.length}`);

  const p = points.map((v) => v.clone());

  for (let k = points.length - 1; k > 0; k--) {
    for (let i = 0; i < k; i++) {
      p[i].lerp(p[i + 1], t);
    }
  }

  return p[0];
};

export const estimateLength = (points: Vector3[]) => {
  const positions = uniformSampleMap(0, 8, 1, (at, t) =>
    deCasteljau(points, t),
  );

  return positions
    .slice(1)
    .reduce(
      (totalLength, position, i) =>
        totalLength + position.distanceTo(positions[i]),
      0,
    );
};

export const bezierSplineCurve = (
  points: Vector3[],
  resolution: number = 20,
) =>
  fromUniformSampledPositions(
    0,
    estimateLength(points),
    resolution,
    (at, t) => deCasteljau(points, t),
  );
