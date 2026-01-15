import { MathUtils, Vector3, Vector4 } from 'three';

import { lowerBound } from '../helper/binary-search';
import {
  uniformSample,
  uniformSampleMap,
} from '../helper/uniform-sample';

import { Curve, emptyCurve, insertPosition } from './curve';

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

export const makeLeftClampedRightOpenKnots = (
  points: Vector4[],
  degree: number,
): number[] => {
  const n = points.length - 1;
  const knotCount = n + degree + 2;

  const knots = new Array<number>(knotCount);

  for (let i = 0; i <= degree; i++) {
    knots[i] = 0;
  }

  for (let i = degree + 1; i < knotCount; i++) {
    knots[i] = i - degree;
  }

  return knots;
};

export const makeLeftOpenRightClampedKnots = (
  points: Vector4[],
  degree: number,
): number[] => {
  const n = points.length - 1;
  const knotCount = n + degree + 2;
  const knots = new Array<number>(knotCount);

  for (let i = 0; i < knotCount - degree - 1; i++) {
    knots[i] = i - degree;
  }

  for (let i = knotCount - degree - 1; i < knotCount; i++) {
    knots[i] = n - degree + 1;
  }

  return knots;
};

export const knotIndexRange = (knots: number[], degree: number) => {
  return [degree, knots.length - degree - 1];
};

export const domain = (knots: number[], degree: number) => {
  return [knots[degree], knots[knots.length - degree - 1]];
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
    return new Vector4(
      points[i].x,
      points[i].y,
      points[i].z,
    ).multiplyScalar(points[i].w);
  }

  const alpha =
    (t - knots[i]) / (knots[i + degree + 1 - k] - knots[i]);

  const p0 = deBoor(points, knots, degree, k - 1, i - 1, t);
  const p1 = deBoor(points, knots, degree, k - 1, i, t);

  return p0.lerp(p1, alpha);
};

export const evaluate = (
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

  const p = deBoor(points, knots, degree, degree, knotIndex, t);
  return new Vector3(p.x, p.y, p.z).divideScalar(p.w);
};

export const makeKnots = (
  numberOfPoints: number,
  degree: number,
  method: 'uniform' | 'clamped',
): number[] => {
  const n = numberOfPoints - 1;
  const knotCount = n + degree + 2;

  const knots = new Array<number>(knotCount);

  if (method === 'uniform') {
    for (let i = 0; i < knotCount; i++) {
      knots[i] = i;
    }
  } else {
    for (let i = 0; i <= degree; i++) {
      knots[i] = 0;
    }

    for (let i = 1; i <= n - degree; i++) {
      knots[degree + i] = i;
    }

    for (let i = knotCount - degree - 1; i < knotCount; i++) {
      knots[i] = n - degree + 1;
    }
  }

  return knots;
};

export const intervals = (knots: number[], degree: number) => {
  return knots.slice(degree, knots.length - degree);
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
    (at, t) => evaluate(points, knots, degree, t),
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
  knotVectorFactory: (points: Vector4[], degree: number) => number[],
  out: Curve = emptyCurve(),
  resolution: number = 20,
  maxDegree: number = 3,
  minSegmentIndex: number = 0,
) => {
  const numberOfPoints = points.length;
  const degree = Math.min(numberOfPoints - 1, maxDegree);
  const knots = knotVectorFactory(points, degree);

  intervals(knots, degree).forEach((_, index, intervals) => {
    const min = intervals[index];
    const max = intervals[index + 1];
    if (!max) return;

    uniformSample(
      min,
      max,
      estimateLength(points, knots, degree, min, max) * resolution,
      (at) => {
        insertPosition(
          out,
          evaluate(points, knots, degree, at),
          minSegmentIndex + Math.floor(at),
        );
      },
    );
  });

  return out;
};
