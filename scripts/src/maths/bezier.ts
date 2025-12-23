import { Vector3 } from 'three';

import {
  fromUniformSample,
  CurveNode,
  length,
  matrixAtDistance,
  insertMatrix,
} from './curve';

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
  let lastPosition = p0;
  let length = 0.0;

  for (let i = 0; i < 15; i += 2) {
    const t = i / 14.0;
    const position = bezierFast(p0, p1, p2, p3, t);
    length += position.distanceTo(lastPosition);
    lastPosition = position;
  }

  return length;
};

export const evaluateUniform = (
  p0: Vector3,
  p1: Vector3,
  p2: Vector3,
  p3: Vector3,
  resolution: number = 10,
) => {
  const curve: CurveNode[] = [];
  const nodes = bezierSplineCurve(p0, p1, p2, p3, 40);
  const splineLength = length(nodes);
  const numberOfNodes = Math.max(
    Math.floor(splineLength * resolution),
    2,
  );

  for (let i = 0; i < numberOfNodes; i++) {
    const at = (i / (numberOfNodes - 1)) * splineLength;
    insertMatrix(curve, matrixAtDistance(nodes, at));
  }

  return curve;
};

export const bezierSplineCurve = (
  p0: Vector3,
  p1: Vector3,
  p2: Vector3,
  p3: Vector3,
  resolution: number = 10,
) => {
  return fromUniformSample(
    0,
    estimateLength(p0, p1, p2, p3),
    resolution,
    (at, t) => bezierFast(p0, p1, p2, p3, t),
  );
};
