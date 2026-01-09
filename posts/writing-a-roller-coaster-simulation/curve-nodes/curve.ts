import last from 'lodash/last';
import { Matrix4, Vector3 } from 'three';

import { emptyCurve } from '../../../../maths/curve';

export const fromPoints = (points: Vector3[]) => {
  const curve = emptyCurve();
  if (points.length < 2) return curve;

  let arcLength = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const left = points[i];
    const right = points[i + 1];
    const prevNode = curve.nodes[curve.nodes.length - 1];

    if (prevNode)
      curve.nodes.push({
        matrix: prevNode.matrix.clone().setPosition(left),
        arcLength,
        segmentIndex: 0,
      });

    curve.nodes.push({
      matrix: new Matrix4()
        .lookAt(right, left, new Vector3(0, 1, 0))
        .setPosition(left),
      arcLength,
      segmentIndex: 0,
    });

    arcLength += left.distanceTo(right);
  }

  const lastNode = last(curve.nodes)!;
  const lastPoint = last(points)!;

  curve.nodes.push({
    matrix: lastNode.matrix.clone().setPosition(lastPoint),
    arcLength,
    segmentIndex: 0,
  });

  curve.segmentOffsets.push(arcLength);

  return curve;
};
