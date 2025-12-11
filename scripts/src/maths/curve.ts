import last from 'lodash/last';
import { MathUtils, Matrix4, Vector3 } from 'three';

import { lowerBound } from '../helper/lower-bound';
import {
  applyRotationZ,
  distance,
  interpolate as interpolateMatrix4,
  applyLookRelativeAt,
} from './matrix4';
import { fromMatrix4 } from './vector3';

export type CurveNode = {
  matrix: Matrix4;
  distanceAtCurve: number;
};

export const getLength = (curve: CurveNode[]) => {
  return last(curve)?.distanceAtCurve || 0;
};

export const findCurveNodeIndices = (
  curve: CurveNode[],
  findValue: number,
  findFn: (node: CurveNode) => number,
) => {
  if (curve.length < 2) return;

  // Binary search to find the first node
  const lowerNodeIndex = lowerBound(curve, findValue, findFn);

  let nextNodeIndex = lowerNodeIndex; // Node after the queried value
  let currentNodeIndex = lowerNodeIndex - 1; // Node before the queried value

  // Handle edge cases: if at the start or end of the curve
  const isFirst = nextNodeIndex === 0;
  const isLast = currentNodeIndex === curve.length - 1;

  if (isFirst) return [0, 1]; // If `value` is at the very beginning
  if (isLast) return [curve.length - 2, curve.length - 1]; // If `value` is at the very end

  // Return indices of the nodes that sandwich the value
  return [currentNodeIndex, nextNodeIndex];
};

export const getMatrixAtDistance = (curve: CurveNode[], at: number) => {
  const nodes = findCurveNodeIndices(curve, at, (node) => node.distanceAtCurve);
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

export const getPositionAtX = (curve: CurveNode[], at: number) => {
  const nodes = findCurveNodeIndices(curve, at, (node) => node.matrix.elements[12]);
  if (!nodes) return new Vector3();

  const [from, to] = nodes.map((index) => curve[index]);

  const fromPosition = fromMatrix4(from.matrix);
  const toPosition = fromMatrix4(to.matrix);

  const deltaXAtCurve = toPosition.x - fromPosition.x;

  if (deltaXAtCurve > Number.EPSILON) {
    const t = MathUtils.clamp((at - fromPosition.x) / deltaXAtCurve, 0.0, 1.0);
    return fromPosition.clone().lerp(toPosition, t);
  }

  return fromPosition;
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
      applyLookRelativeAt(lastNode.matrix, position);
    }
    applyLookRelativeAt(lastNode.matrix, position);

    insertMatrix(curve, lastNode.matrix.clone().setPosition(position));
    return;
  }

  insertMatrix(curve, new Matrix4().setPosition(position));
};

export const createFromUniformSample = (
  from: number = 0,
  to: number = 0,
  resolution: number = 8,
  positionFn: (at: number, t: number) => Vector3,
) => {
  const curve: CurveNode[] = [];

  const length = to - from;
  const numberOfNodes = Math.max(Math.floor(length * resolution), 2);

  for (let i = 0; i < numberOfNodes; i++) {
    const t = i / (numberOfNodes - 1);
    const at = from + t * length;
    insertPosition(curve, positionFn(at, t));
  }
  return curve;
};

export const applyRollCurve = (curve: CurveNode[], roll: CurveNode[]) => {
  curve.forEach(({ matrix, distanceAtCurve }) =>
    applyRotationZ(matrix, -getPositionAtX(roll, distanceAtCurve).y),
  );

  return curve;
};
