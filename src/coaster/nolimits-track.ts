import { Vector4 } from 'three';

import { Curve, emptyCurve } from '../maths/curve';
import { fromPoints, makeClampedKnots } from '../maths/nurbs';
import { splitPointsByStrict } from '../helper/strict-point';

export const fromVertices = (
  vertices: Array<{ position: Vector4; strict: boolean }>,
  closed: boolean = false,
  resolution: number = 20,
) => {
  if (vertices.length < 2) return emptyCurve();
  const nurbsVertices = [...vertices];

  if (closed) {
    nurbsVertices.push({
      position: vertices[0].position,
      strict: false,
    });
  }

  const curve: Curve = emptyCurve();
  const nurbsSections = splitPointsByStrict(nurbsVertices);

  for (let i = 0; i < nurbsSections.length; i += 1) {
    const vertices = nurbsSections[i];
    const lastCurveNode = curve.nodes[curve.nodes.length - 1];

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
