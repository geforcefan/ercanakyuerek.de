import { MathUtils, Vector3, Vector4 } from 'three';

import { lowerBound } from '../helper/binary-search';
import {
  uniformSample,
  uniformSampleMap,
} from '../helper/uniform-sample';

import { CurveNode, insertPosition } from './curve';

export const makeClampedKnots = (
  points: Vector4[],
  degree: number,
): number[] => {
  const n = points.length - 1;
  const knotCount = n + degree + 2;
  const knots = new Array<number>(knotCount);

  for (let i = 0; i <= degree; i++) {
    knots[i] = 0;
  }

  for (let i = 1; i <= n - degree; i++) {
    knots[degree + i] = i;
  }

  for (let i = knotCount - degree - 1; i < knotCount; i++) {
    knots[i] = n - degree + 1;
  }

  return knots;
};

export const makeClosedKnots = (
  points: Vector4[],
  degree: number,
): number[] => {
  const n = points.length - 1;
  const knotCount = n + degree + 2;

  const knots = new Array<number>(knotCount);

  for (let i = 0; i < knotCount; i++) {
    knots[i] = i - degree;
  }

  return knots;
};

export const knotIndexRange = (knots: number[], degree: number) => {
  return [degree, knots.length - degree - 1];
};

const deBoor = (
  points: Vector4[],
  knots: number[],
  degree: number,
  k: number,
  i: number,
  t: number,
): Vector4 => {
  if (k === 0) {
    const p = points[i];
    return new Vector4(p.x * p.w, p.y * p.w, p.z * p.w, p.w);
  }

  const alpha =
    (t - knots[i]) / (knots[i + degree + 1 - k] - knots[i]);

  const p0 = deBoor(points, knots, degree, k - 1, i - 1, t);
  const p1 = deBoor(points, knots, degree, k - 1, i, t);

  return p0.multiplyScalar(1 - alpha).add(p1.multiplyScalar(alpha));
};

export const nurbs = (
  points: Vector4[],
  knots: number[],
  degree: number,
  t: number,
) => {
  const knotIndex = MathUtils.clamp(
    lowerBound(knots, t, (v) => v) - 1,
    degree,
    knots.length - degree - 2,
  );

  const pos = deBoor(points, knots, degree, degree, knotIndex, t);
  return new Vector3(pos.x / pos.w, pos.y / pos.w, pos.z / pos.w);
};

export const estimateLength = (
  points: Vector4[],
  knots: number[],
  degree: number,
  min: number,
  max: number,
) => {
  const positions = uniformSampleMap(
    min,
    max,
    Math.ceil(max - min),
    (at, t) => nurbs(points, knots, degree, t),
  );

  return positions
    .slice(1)
    .reduce(
      (totalLength, position, i) =>
        totalLength + position.distanceTo(positions[i]),
      0,
    );
};

export const fromPoints = (
  points: Vector4[],
  knotVectorFactory: (points: Vector4[], degree: number) => number[],
  resolution: number = 20,
  maxDegree: number = 3,
) => {
  const numberOfPoints = points.length;
  const degree = Math.min(numberOfPoints - 1, maxDegree);
  const knots = knotVectorFactory(points, degree);
  const [minKnotIndex, maxKnotIndex] = knotIndexRange(knots, degree);

  const curve: CurveNode[] = [];

  for (
    let knotIndex = minKnotIndex;
    knotIndex < maxKnotIndex;
    knotIndex++
  ) {
    const min = knots[knotIndex];
    const max = knots[knotIndex + 1];

    uniformSample(
      min,
      max,
      estimateLength(points, knots, degree, min, max) * resolution,
      (at) => {
        insertPosition(
          curve,
          nurbs(points, knots, degree, at),
          Math.floor(at),
        );
      },
    );
  }

  return curve;
};
