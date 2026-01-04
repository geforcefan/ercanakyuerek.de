import { MathUtils, Vector2, Vector4 } from 'three';

import { clampedCubicSplineCurve } from '../maths/cubic';
import {
  applyRollFromCurve,
  CurveNode, arcLengthAtOffset,
  matrixAtArcLength, toSegmentOffsets,
} from '../maths/curve';

import { readCustomTrack } from './nl2park/track/custom-track';
import { isRollPoint } from './nl2park/track/roll';

export const applyRollFromCustomTrack = (
  curve: CurveNode[],
  customTrack: ReturnType<typeof readCustomTrack>,
) => {
  let lastRoll = 0;
  let offset = 0;

  const segmentOffsets = toSegmentOffsets(curve, customTrack.vertices.length)

  const rolls = customTrack?.points
    .filter(isRollPoint)
    .sort((a, b) => a.position - b.position)
    .map((p) => {
      const arcLength = arcLengthAtOffset(p.position, segmentOffsets)
      const matrix = matrixAtArcLength(curve, arcLength);

      let roll = MathUtils.degToRad(p.roll);

      const up = new Vector4(0, 1, 0, 0)
        .applyMatrix4(matrix)
        .normalize();

      const left = new Vector4(1, 0, 0, 0)
        .applyMatrix4(matrix)
        .normalize();

      if (p.vertical) roll += Math.atan2(left.z, up.z);
      else roll += Math.atan2(left.y, up.y);

      const deltaRoll = roll - lastRoll;
      lastRoll = roll;

      if (Math.abs(deltaRoll) > Math.PI) {
        if (deltaRoll > 0.0) offset -= Math.PI * 2;
        else offset += Math.PI * 2;
      }

      roll += offset;

      return new Vector2(arcLength, roll);
    });

  applyRollFromCurve(curve, clampedCubicSplineCurve(rolls, 0, 0, 20));
};
