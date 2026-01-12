import { Vector3 } from 'three';

import {
  uniformSample,
  uniformSampleMap,
} from '../helper/uniform-sample';

import { emptyCurve, insertPosition } from './curve';

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

export const estimateTotalArcLength = (points: Vector3[]) => {
  const positions = uniformSampleMap(0, 8, 1, (at, t) =>
    deCasteljau(points, t),
  );

  return positions
    .slice(1)
    .reduce(
      (arcLength, position, i) =>
        arcLength + position.distanceTo(positions[i]),
      0,
    );
};

export const bezierSplineCurve = (
  points: Vector3[],
  resolution: number = 20,
) => {
  const curve = emptyCurve();

  uniformSample(
    0,
    estimateTotalArcLength(points),
    resolution,
    (at, t) => {
      insertPosition(curve, deCasteljau(points, t));
    },
  );

  return curve;
};
