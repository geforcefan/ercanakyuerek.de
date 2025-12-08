import last from 'lodash/last';
import { MathUtils, Matrix4, Vector3 } from 'three';

import { lowerBound } from './lower-bound';
import { distance, interpolate as interpolateMatrix4, lookRelativeAt } from './matrix4';

export type CurveNode = {
  matrix: Matrix4;
  distanceAtCurve: number;
};

export const getLength = (curve: CurveNode[]) => {
  return last(curve)?.distanceAtCurve || 0;
};

export const findCurveNodeIndicesAtDistance = (curve: CurveNode[], at: number) => {
  if (curve.length < 2) return undefined;

  // Binary search to find the first node where distanceAtCurve >= at
  const lowerNodeIndex = lowerBound(curve, at, (node) => node.distanceAtCurve);

  let nextNodeIndex = lowerNodeIndex; // Node after the queried distance
  let currentNodeIndex = lowerNodeIndex - 1; // Node before the queried distance

  // Handle edge cases: if at the start or end of the curve
  const isFirst = nextNodeIndex === 0;
  const isLast = currentNodeIndex === curve.length - 1;

  if (isFirst) return [0, 1]; // If `at` is at the very beginning
  if (isLast) return [curve.length - 2, curve.length - 1]; // If `at` is at the very end

  // Return indices of the nodes that sandwich the distance
  return [currentNodeIndex, nextNodeIndex];
};

export const getMatrixAtDistance = (curve: CurveNode[], at: number) => {
  const nodes = findCurveNodeIndicesAtDistance(curve, at);
  if (!nodes) return new Matrix4();

  const [from, to] = nodes.map((index) => curve[index]);

  const deltaDistanceAtCurve = to.distanceAtCurve - from.distanceAtCurve;

  // Calculate the interpolation factor `t` based on relative distance
  if (deltaDistanceAtCurve > Number.EPSILON) {
    const t = MathUtils.clamp((at - from.distanceAtCurve) / deltaDistanceAtCurve, 0.0, 1.0);
    return interpolateMatrix4(from.matrix, to.matrix, t);
  }

  return from.matrix.clone();
};

export const insertMatrix = (curve: CurveNode[], matrix: Matrix4): void => {
  const lastNode = last(curve);

  // Calculate distance between the new matrix and the last node's matrix
  const distanceToLastNode = lastNode ? distance(lastNode.matrix, matrix) : 0;
  const distanceAtCurve = (lastNode?.distanceAtCurve || 0) + distanceToLastNode;

  // Push the new node onto the curve
  curve.push({
    distanceAtCurve,
    matrix: matrix.clone(),
  });
};

export const insertPosition = (curve: CurveNode[], position: Vector3) => {
  const lastNode = last(curve);

  if (lastNode) {
    if (curve.length === 1) {
      lookRelativeAt(lastNode.matrix, position);
    }
    lookRelativeAt(lastNode.matrix, position);

    insertMatrix(curve, lastNode.matrix.clone().setPosition(position));
    return;
  }

  insertMatrix(curve, new Matrix4().setPosition(position));
};
