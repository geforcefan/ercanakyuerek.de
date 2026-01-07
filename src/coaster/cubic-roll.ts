import { MathUtils, Vector2 } from 'three';

import { clampedCubicSplineCurve } from '../maths/cubic';
import {
  arcLengthAtOffset,
  CurveNode,
  matrixAtArcLength,
  toSegmentOffsets,
} from '../maths/curve';
import { toLeftDirection, toUpDirection } from '../maths/matrix4';
import { splitPointsByStrict } from '../helper/strict-point';

export const fromRollPoints = (
  curve: CurveNode[],
  rollPoints: Array<{
    position: number;
    roll: number;
    strict: boolean;
    vertical: boolean;
  }>,
  resolution: number = 20,
) => {
  const segmentOffsets = toSegmentOffsets(curve);
  const rollSections = splitPointsByStrict(rollPoints);

  let lastRoll = 0;
  let offset = 0;

  const rollCurve: CurveNode[] = [];

  for (const sectionRollPoints of rollSections) {
    const points: Vector2[] = [];

    for (const p of sectionRollPoints) {
      const arcLength = arcLengthAtOffset(p.position, segmentOffsets);
      const matrix = matrixAtArcLength(curve, arcLength);

      let roll = MathUtils.degToRad(p.roll);

      const up = toUpDirection(matrix);
      const left = toLeftDirection(matrix);

      if (p.vertical) {
        roll += Math.atan2(left.z, up.z);
      } else {
        roll += Math.atan2(left.y, up.y);
      }

      const deltaRoll = roll - lastRoll;
      lastRoll = roll;

      if (Math.abs(deltaRoll) >= Math.PI) {
        offset += deltaRoll > 0 ? -Math.PI * 2 : Math.PI * 2;
      }

      roll += offset;

      points.push(new Vector2(arcLength, roll));
    }

    rollCurve.push(
      ...clampedCubicSplineCurve(points, 0, 0, resolution),
    );
  }

  return rollCurve;
};
