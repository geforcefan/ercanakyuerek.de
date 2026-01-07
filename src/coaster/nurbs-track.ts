import { Vector4 } from 'three';

import { CurveNode } from '../maths/curve';
import { fromPoints, makeClampedKnots } from '../maths/nurbs';
import { splitPointsByStrict } from '../helper/strict-point';

export const fromVertices = (
  vertices: Array<{ position: Vector4; strict: boolean }>,
  resolution: number = 20,
) => {
  if (vertices.length < 2) return [];

  const curve: CurveNode[] = [];
  const nurbsSections = splitPointsByStrict(vertices);

  for (const vertices of nurbsSections) {
    const lastCurveNode = curve[curve.length - 1];

    fromPoints(
      vertices.map((v) => v.position),
      makeClampedKnots,
      curve,
      resolution,
      3,
      lastCurveNode?.segmentIndex ?? 0,
    );
  }

  return curve;
};
