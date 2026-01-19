import { Vector3, Vector4 } from 'three';

import {
  uniformSample,
  uniformSampleMap,
} from '../helper/uniform-sample';

import { emptyCurve, insertPosition } from './curve';

function cubicBSpline(
  p0: Vector4,
  p1: Vector4,
  p2: Vector4,
  p3: Vector4,
  t: number,
): Vector3 {
  const t2 = t * t;
  const t3 = t2 * t;

  const b0 = (-t3 + 3 * t2 - 3 * t + 1) / 6;
  const b1 = (3 * t3 - 6 * t2 + 4) / 6;
  const b2 = (-3 * t3 + 3 * t2 + 3 * t + 1) / 6;
  const b3 = t3 / 6;

  const denominator = b0 * p0.w + b1 * p1.w + b2 * p2.w + b3 * p3.w;

  const num = new Vector4()
    .addScaledVector(p0, b0 * p0.w)
    .addScaledVector(p1, b1 * p1.w)
    .addScaledVector(p2, b2 * p2.w)
    .addScaledVector(p3, b3 * p3.w);

  return new Vector3(num.x, num.y, num.z).divideScalar(denominator);
}

export const estimateTotalArcLength = (
  p0: Vector4,
  p1: Vector4,
  p2: Vector4,
  p3: Vector4,
) => {
  const positions = uniformSampleMap(0, 8, 1, (at, t) =>
    cubicBSpline(p0, p1, p2, p3, t),
  );

  return positions
    .slice(1)
    .reduce(
      (arcLength, position, i) =>
        arcLength + position.distanceTo(positions[i]),
      0,
    );
};

export const fromPoints = (
  points: Vector4[],
  resolution: number = 20,
) => {
  const curve = emptyCurve();

  for (let i = 0; i < points.length - 3; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const p2 = points[i + 2];
    const p3 = points[i + 3];

    uniformSample(
      0,
      estimateTotalArcLength(p0, p1, p2, p3),
      resolution,
      (at, t) => {
        insertPosition(curve, cubicBSpline(p0, p1, p2, p3, t));
      },
    );
  }

  return curve;
};
