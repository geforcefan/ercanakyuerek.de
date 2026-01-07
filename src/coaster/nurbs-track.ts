import { Vector4 } from 'three';

import { CurveNode } from '../maths/curve';
import { fromPoints, makeClampedKnots, makeClosedKnots } from '../maths/nurbs';
import { splitPointsByStrict } from '../helper/strict-point';

export const fromVertices = (
  vertices: Array<{ position: Vector4; strict: boolean }>,
  closed: boolean =  false,
  resolution: number = 20,
) => {
  if (vertices.length < 2) return [];
  const nurbsVertices = [...vertices];

  if(closed) {
    nurbsVertices.push({ position: vertices[0].position, strict: false });
    nurbsVertices.push({ position: vertices[1].position, strict: false });
    nurbsVertices.unshift({ position: vertices[vertices.length - 1].position, strict: false });
  }

  const curve: CurveNode[] = [];
  const nurbsSections = splitPointsByStrict(nurbsVertices);

  for (const vertices of nurbsSections) {
    const lastCurveNode = curve[curve.length - 1];

    fromPoints(
      vertices.map((v) => v.position),
      closed ? makeClosedKnots : makeClampedKnots,
      curve,
      resolution,
      3,
      lastCurveNode?.segmentIndex ?? 0,
    );
  }

  return curve;
};
