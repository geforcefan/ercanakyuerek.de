import last from 'lodash/last';
import { MathUtils, Matrix4, Vector3 } from 'three';

import { findBoundingIndices } from '../helper/binary-search';
import { uniformSample } from '../helper/uniform-sample';

import {
  applyLookRelativeAt,
  applyRoll,
  distance,
  lerp,
  rollDirection,
  toFrontDirection,
  toPosition,
} from './matrix4';

export type CurveNode = {
  matrix: Matrix4;
  arcLength: number;
  segmentIndex: number;
};

export type Curve = {
  nodes: CurveNode[];
  segmentOffsets: number[];
};

export const totalArcLength = (curve: Curve) => {
  return last(curve.nodes)?.arcLength || 0;
};

export const matrixAtArcLength = (curve: Curve, at: number) => {
  const nodes = findBoundingIndices(
    curve.nodes,
    at,
    (node) => node.arcLength,
  );
  if (!nodes) return new Matrix4();

  const left = curve.nodes[nodes[0]];
  const right = curve.nodes[nodes[1]];

  const length = right.arcLength - left.arcLength;

  if (length > Number.EPSILON) {
    const t = MathUtils.clamp(
      (at - left.arcLength) / length,
      0.0,
      1.0,
    );
    return lerp(left.matrix, right.matrix, t);
  }

  return left.matrix.clone();
};

export const positionAtX = (curve: Curve, at: number) => {
  const nodes = findBoundingIndices(
    curve.nodes,
    at,
    (node) => node.matrix.elements[12],
  );
  if (!nodes) return new Vector3();

  const left = toPosition(curve.nodes[nodes[0]].matrix);
  const right = toPosition(curve.nodes[nodes[1]].matrix);

  const length = right.x - left.x;

  if (length > Number.EPSILON) {
    return left.lerp(
      right,
      MathUtils.clamp((at - left.x) / length, 0.0, 1.0),
    );
  }

  return left;
};

export const arcLengthAtOffset = (
  at: number,
  segmentOffsets: number[],
) => {
  const i = Math.floor(at);
  const t = at - i;

  const left = segmentOffsets[i] ?? 0;
  const right = segmentOffsets[i + 1] ?? left;

  return MathUtils.lerp(left, right, t);
};

export const insertMatrix = (
  curve: Curve,
  matrix: Matrix4,
  segmentIndex: number = 0,
) => {
  const lastNode = last(curve.nodes);
  const lastSegmentIndex = lastNode?.segmentIndex ?? 0;

  let arcLength = 0;

  if (lastNode) {
    const distanceToLastNode = distance(lastNode.matrix, matrix);
    if (distanceToLastNode < Number.EPSILON) return;

    arcLength =
      lastNode.arcLength + distance(lastNode.matrix, matrix);
  }

  const nodeMatrix = matrix.clone();

  if (lastSegmentIndex !== segmentIndex)
    curve.segmentOffsets[segmentIndex] = arcLength;
  else curve.segmentOffsets[segmentIndex + 1] = arcLength;

  curve.nodes.push({
    arcLength,
    matrix: nodeMatrix,
    segmentIndex,
  });

  return nodeMatrix;
};

export const insertPosition = (
  curve: Curve,
  position: Vector3,
  segmentIndex: number = 0,
) => {
  const lastNode = last(curve.nodes);

  if (lastNode) {
    if (
      position.distanceTo(toPosition(lastNode.matrix)) <
      Number.EPSILON
    )
      return;

    if (curve.nodes.length === 1) {
      applyLookRelativeAt(lastNode.matrix, position);
    }
    applyLookRelativeAt(lastNode.matrix, position);

    return insertMatrix(
      curve,
      lastNode.matrix.clone().setPosition(position),
      segmentIndex,
    );
  }

  return insertMatrix(curve, new Matrix4().setPosition(position));
};

export const applyRollCurve = (curve: Curve, rollCurve: Curve) => {
  curve.nodes.forEach(({ matrix, arcLength }) => {
    applyRoll(matrix, -positionAtX(rollCurve, arcLength).y);
  });

  return curve;
};

export const empty = (
  nodes: CurveNode[] = [],
  segmentOffsets: number[] = [0],
): Curve => {
  return {
    nodes,
    segmentOffsets,
  };
};

export const fromPoints = (points: Vector3[]) => {
  const curve = empty();

  points.forEach((point) => {
    insertPosition(curve, point);
  });

  return curve;
};

export const fromUniformSampledPositions = (
  from: number = 0,
  to: number = 0,
  resolution: number = 20,
  positionFn: (at: number, t: number) => Vector3,
) => {
  const curve = empty();

  uniformSample(from, to, resolution, (at, t) => {
    insertPosition(curve, positionFn(at, t));
  });

  return curve;
};

export const toPoints = (curve: Curve) => {
  return curve.nodes.map((node) => toPosition(node.matrix));
};

export const toLocalTransformed = (
  curve: Curve,
  translation: Vector3,
): Curve => {
  const transformedCurve = empty();

  curve.nodes.forEach((node) => {
    insertPosition(
      transformedCurve,
      toPosition(
        node.matrix
          .clone()
          .multiply(new Matrix4().makeTranslation(translation)),
      ),
      node.segmentIndex,
    );
  });

  transformedCurve.nodes.forEach((node, index) => {
    const position = toPosition(node.matrix);
    const originalRollDirection = rollDirection(
      curve.nodes[index].matrix,
    );

    const front = toFrontDirection(node.matrix);
    const left = originalRollDirection
      .sub(
        front
          .clone()
          .multiplyScalar(originalRollDirection.dot(front)),
      )
      .normalize();

    const up = new Vector3().crossVectors(front, left).normalize();

    node.matrix = new Matrix4()
      .makeBasis(left, up, front)
      .setPosition(position);
  });

  return transformedCurve;
};
