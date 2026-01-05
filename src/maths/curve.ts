import { first, uniq } from 'lodash';
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
  arcLength: number;
  segmentIndex: number;
};

export const totalArcLength = (curve: CurveNode[]) => {
  return last(curve)?.arcLength || 0;
};

export const matrixAtArcLength = (curve: CurveNode[], at: number) => {
  const nodes = findBoundingIndices(
    curve,
    at,
    (node) => node.arcLength,
  );
  if (!nodes) return new Matrix4();

  const left = curve[nodes[0]];
  const right = curve[nodes[1]];

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
  segmentIndex: number = 0,
): void => {
  const lastNode = last(curve);
  let arcLength = 0;

  if (lastNode) {
    const distanceToLastNode = distance(lastNode.matrix, matrix);
    if (distanceToLastNode < Number.EPSILON) return;

    arcLength =
      lastNode.arcLength + distance(lastNode.matrix, matrix);
  }

  curve.push({
    arcLength,
    matrix: matrix.clone(),
    segmentIndex,
  });
};

export const insertPosition = (
  curve: CurveNode[],
  position: Vector3,
  segmentIndex: number = 0,
) => {
  const lastNode = last(curve);

  if (lastNode) {
    if (
      position.distanceTo(fromMatrix4(lastNode.matrix)) <
      Number.EPSILON
    )
      return;

    if (curve.length === 1) {
      applyLookRelativeAt(lastNode.matrix, position);
    }
    applyLookRelativeAt(lastNode.matrix, position);

    insertMatrix(
      curve,
      lastNode.matrix.clone().setPosition(position),
      segmentIndex,
    );
    return;
  }

  insertMatrix(curve, new Matrix4().setPosition(position));
};

export const applyRollFromCurve = (
  curve: CurveNode[],
  rollCurve: CurveNode[],
) => {
  curve.forEach(({ matrix, arcLength }) => {
    return applyRotationZ(
      matrix,
      -positionAtX(rollCurve, arcLength).y,
    );
  });

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
  resolution: number = 20,
  positionFn: (at: number, t: number) => Vector3,
) => {
  const curve: CurveNode[] = [];

  uniformSample(from, to, resolution, (at, t) => {
    insertPosition(curve, positionFn(at, t));
  });

  return curve;
};

export const fromPointsWithBasicNormals = (points: Vector3[]) => {
  const curve: CurveNode[] = [];
  if (points.length < 2) return curve;

  let arcLength = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const left = points[i];
    const right = points[i + 1];
    const prevNode = curve[curve.length - 1];

    if (prevNode)
      curve.push({
        matrix: prevNode.matrix.clone().setPosition(left),
        arcLength,
        segmentIndex: 0,
      });

    curve.push({
      matrix: new Matrix4()
        .lookAt(right, left, new Vector3(0, 1, 0))
        .setPosition(left),
      arcLength,
      segmentIndex: 0,
    });

    arcLength += left.distanceTo(right);
  }

  const lastNode = last(curve)!;
  const lastPoint = last(points)!;

  curve.push({
    matrix: lastNode.matrix.clone().setPosition(lastPoint),
    arcLength,
    segmentIndex: 0,
  });

  return curve;
};

export const toPoints = (curve: CurveNode[]) => {
  return curve.map((node) => fromMatrix4(node.matrix));
};

export const arcLengthAtOffset = (
  u: number,
  segmentOffsets: number[],
) => {
  const i = Math.floor(u);
  const t = u - i;

  const left = segmentOffsets[i] ?? 0;
  const right = segmentOffsets[i + 1] ?? left;

  return MathUtils.lerp(left, right, t);
};

export const toSegmentOffsets = (
  curve: CurveNode[],
  numberOfVertices: number,
) => {
  if (curve.length < 1) return [];
  const numberOfSegments =
    last(curve)!.segmentIndex - first(curve)!.segmentIndex + 1;

  const segments: number[][] = Array.from(
    { length: numberOfSegments },
    () => [],
  );
  const lengths: number[] = [];

  curve.forEach((node, index) =>
    segments[node.segmentIndex].push(index),
  );

  segments.forEach((segment, index) => {
    const nextSegment = segments[index + 1];
    const leftNodeIndex = first(segment)!;
    const rightNodeIndex = nextSegment
      ? first(segments[index + 1])!
      : last(segment)!;

    const length =
      curve[rightNodeIndex].arcLength -
      curve[leftNodeIndex].arcLength;

    if (length < Number.EPSILON) return;
    lengths.push(length);
  });

  const splitIndices = uniq([lengths.length - 1, 0]);
  /*const numberOfNeededLengths = numberOfVertices - 1;
  const numberOfMissingLengths =
    numberOfNeededLengths - lengths.length;
  const numberOfSplitsNeeded =
    numberOfMissingLengths / splitIndices.length + 1;*/

  const numberOfSplitsNeeded =
    numberOfVertices <= 4 ? numberOfVertices - 1 : 2;

  uniq(splitIndices).forEach((index) =>
    lengths.splice(
      index,
      1,
      ...new Array(numberOfSplitsNeeded).fill(
        lengths[index] / numberOfSplitsNeeded,
      ),
    ),
  );

  const offsets: number[] = new Array(lengths.length + 1).fill(0);
  lengths.forEach((_, index) => {
    offsets[index + 1] = offsets[index] + lengths[index];
  });

  return offsets;
};
