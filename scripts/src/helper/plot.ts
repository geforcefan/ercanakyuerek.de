import { Matrix4, Vector2 } from 'three';

import { CurveNode, getLength, getMatrixAtDistance } from './curve';
import { uniformMap } from './uniform-map';

export const plotDataFromPoints = (nodes: Vector2[]) => ({
  x: nodes.map((v) => v.x),
  y: nodes.map((v) => v.y),
});

export const plotDataFromCurve = (
  curve: CurveNode[],
  resolution: number = 8,
  fn: (m: Matrix4) => number,
) => {
  const points = uniformMap(
    0,
    getLength(curve),
    resolution,
    (at) => new Vector2(at, fn(getMatrixAtDistance(curve, at))),
  );

  return plotDataFromPoints(points);
};
