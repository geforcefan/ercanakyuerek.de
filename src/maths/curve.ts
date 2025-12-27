import last from 'lodash/last';
import { MathUtils, Matrix4, Vector3 } from 'three';

import { findBoundingIndices } from '../helper/binary-search';
import { uniformSample } from '../helper/uniform-sample';

import {
  applyLookRelativeAt,
  applyRotationZ,
  distance,
  lerp,
} from './matrix4';
import { fromMatrix4 } from './vector3';

export type CurveNode = {
  matrix: Matrix4;
  distanceAtCurve: number;
};

export const length = (curve: CurveNode[]) => {
  return last(curve)?.distanceAtCurve || 0;
};

export const matrixAtDistance = (curve: CurveNode[], at: number) => {
  const nodes = findBoundingIndices(
    curve,
    at,
    (node) => node.distanceAtCurve,
  );
  if (!nodes) return new Matrix4();

  const left = curve[nodes[0]];
  const right = curve[nodes[1]];

  const length = right.distanceAtCurve - left.distanceAtCurve;

  if (length > Number.EPSILON) {
    const t = MathUtils.clamp(
      (at - left.distanceAtCurve) / length,
      0.0,
      1.0,
    );
    return lerp(left.matrix, right.matrix, t);
  }

  return left.matrix.clone();
};

export const positionAtX = (curve: CurveNode[], at: number) => {
  const nodes = findBoundingIndices(
    curve,
    at,
    (node) => node.matrix.elements[12],
  );
  if (!nodes) return new Vector3();

  const left = fromMatrix4(curve[nodes[0]].matrix);
  const right = fromMatrix4(curve[nodes[1]].matrix);

  const length = right.x - left.x;

  if (length > Number.EPSILON) {
    return left.lerp(
      right,
      MathUtils.clamp((at - left.x) / length, 0.0, 1.0),
    );
  }

  return left;
};

export const insertMatrix = (
  curve: CurveNode[],
  matrix: Matrix4,
): void => {
  const lastNode = last(curve);
  let distanceAtCurve = 0;

  if (lastNode) {
    distanceAtCurve =
      lastNode.distanceAtCurve + distance(lastNode.matrix, matrix);
  }

  curve.push({
    distanceAtCurve,
    matrix: matrix.clone(),
  });
};

export const insertPosition = (
  curve: CurveNode[],
  position: Vector3,
) => {
  const lastNode = last(curve);

  if (lastNode) {
    if (curve.length === 1) {
      applyLookRelativeAt(lastNode.matrix, position);
    }
    applyLookRelativeAt(lastNode.matrix, position);

    insertMatrix(
      curve,
      lastNode.matrix.clone().setPosition(position),
    );
    return;
  }

  insertMatrix(curve, new Matrix4().setPosition(position));
};

export const applyRollFromCurve = (
  curve: CurveNode[],
  rollCurve: CurveNode[],
) => {
  curve.forEach(({ matrix, distanceAtCurve }) =>
    applyRotationZ(
      matrix,
      -positionAtX(rollCurve, distanceAtCurve).y,
    ),
  );

  return curve;
};

export const fromPoints = (points: Vector3[]) => {
  const curve: CurveNode[] = [];

  points.forEach((point) => {
    insertPosition(curve, point);
  });

  return curve;
};

export const fromUniformSampledPositions = (
  from: number = 0,
  to: number = 0,
  resolution: number = 8,
  positionFn: (at: number, t: number) => Vector3,
) => {
  const curve: CurveNode[] = [];

  uniformSample(from, to, resolution, (at, t) => {
    insertPosition(curve, positionFn(at, t));
  });

  return curve;
};

export const toPoints = (curve: CurveNode[]) => {
  return curve.map((node) => fromMatrix4(node.matrix));
};
