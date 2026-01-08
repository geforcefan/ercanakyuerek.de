import { Vector4 } from 'three';

import { Curve, empty } from '../maths/curve';
import {
  fromPoints,
  makeClampedKnots,
  makeClosedKnots,
  makeLeftClampedRightOpenKnots,
  makeLeftOpenRightClampedKnots,
} from '../maths/nurbs';
import { splitPointsByStrict } from '../helper/strict-point';

export const fromVertices = (
  vertices: Array<{ position: Vector4; strict: boolean }>,
  closed: boolean = false,
  resolution: number = 20,
) => {
  if (vertices.length < 2) return empty();
  const nurbsVertices = [...vertices];

  if (closed) {
    nurbsVertices.push({
      position: vertices[0].position,
      strict: false,
    });
    nurbsVertices.push({
      position: vertices[1].position,
      strict: false,
    });
    nurbsVertices.unshift({
      position: vertices[vertices.length - 1].position,
      strict: false,
    });
  }

  const curve: Curve = empty();
  const nurbsSections = splitPointsByStrict(nurbsVertices);
  const hasStrictVertices = nurbsSections.length > 1;

  for (let i = 0; i < nurbsSections.length; i += 1) {
    const vertices = nurbsSections[i];
    const lastCurveNode = curve.nodes[curve.nodes.length - 1];
    const isFirstSection = !i;
    const isLastSection = i === nurbsSections.length - 1;

    let knots = makeClampedKnots;

    if (closed) {
      if (hasStrictVertices && isFirstSection)
        knots = makeLeftOpenRightClampedKnots;
      else if (hasStrictVertices && isLastSection)
        knots = makeLeftClampedRightOpenKnots;
      else if (!hasStrictVertices) knots = makeClosedKnots;
    }

    fromPoints(
      vertices.map((v) => v.position),
      knots,
      curve,
      resolution,
      3,
      lastCurveNode?.segmentIndex ?? 0,
    );
  }

  return curve;
};
