import { Vector3, Vector4 } from 'three';

import {
  uniformSample,
  uniformSampleMap,
} from '../helper/uniform-sample';

import { emptyCurve, insertPosition } from './curve';

const cubicUniformRationalBSpline = (
  p0: Vector4,
  p1: Vector4,
  p2: Vector4,
  p3: Vector4,
  t: number,
) => {
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
};

export const estimateTotalArcLength = (
  p0: Vector4,
  p1: Vector4,
  p2: Vector4,
  p3: Vector4,
) => {
  const positions = uniformSampleMap(0, 8, 1, (at, t) =>
    cubicUniformRationalBSpline(p0, p1, p2, p3, t),
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
  boundary: 'clamped' | 'open' | 'closed' = 'clamped',
  resolution: number = 20,
) => {
  const controlPoints = [...points];
  const curve = emptyCurve();
  if (controlPoints.length < 4) return curve;

  if (boundary === 'clamped') {
    const firstPoint = controlPoints[0];
    const lastPoint = controlPoints[controlPoints.length - 1];

    controlPoints.unshift(firstPoint, firstPoint);
    controlPoints.push(lastPoint, lastPoint);
  }

  if (boundary === 'closed' && controlPoints.length >= 4) {
    controlPoints.unshift(controlPoints[controlPoints.length - 1]);
    controlPoints.push(controlPoints[1]);
    controlPoints.push(controlPoints[2]);
  }

  for (let i = 0; i < controlPoints.length - 3; i++) {
    const p0 = controlPoints[i];
    const p1 = controlPoints[i + 1];
    const p2 = controlPoints[i + 2];
    const p3 = controlPoints[i + 3];

    uniformSample(
      0,
      estimateTotalArcLength(p0, p1, p2, p3),
      resolution,
      (at, t) => {
        insertPosition(
          curve,
          cubicUniformRationalBSpline(p0, p1, p2, p3, t),
        );
      },
    );
  }

  return curve;
};
