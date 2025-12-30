import { Matrix4, Vector2, Vector3, Vector4 } from 'three';

import {
  CurveNode,
  length,
  matrixAtDistance,
} from '../maths/curve';
import { uniformSampleMap } from '../helper/uniform-sample';

export const plotDataFromPoints = (
  nodes: (Vector2 | Vector3 | Vector4)[],
) => ({
  x: nodes.map((v) => v.x),
  y: nodes.map((v) => v.y),
});

export const plotDataFromCurve = (
  curve: CurveNode[],
  resolution: number = 8,
  fn: (m: Matrix4) => number,
) => {
  const points = uniformSampleMap(
    0,
    length(curve),
    resolution,
    (at: number) => new Vector2(at, fn(matrixAtDistance(curve, at))),
  );

  return plotDataFromPoints(points);
};
