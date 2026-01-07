import { arcLengthAtOffset, CurveNode, matrixAtArcLength, toSegmentOffsets } from '../maths/curve';
import { clampedCubicSplineCurve } from '../maths/cubic';
import { MathUtils, Vector2, Vector4 } from 'three';
import { splitPointsByStrict } from '../helper/strict-point';

export const fromRollPoints = (
  curve: CurveNode[],
  rollPoints: Array<{
    position: number;
    roll: number;
    strict: boolean;
    vertical: boolean;
  }>,
  resolution: number = 20
) => {
  const segmentOffsets = toSegmentOffsets(curve)
  const rollSections = splitPointsByStrict(rollPoints);

  let lastRoll = 0;
  let offset = 0;

  const rollCurve: CurveNode[] = [];

  for (const sectionRollPoints of rollSections) {
    const cubicSplineCurve = clampedCubicSplineCurve(
      sectionRollPoints.map((p) => {
        const arcLength = arcLengthAtOffset(
          p.position,
          segmentOffsets,
        );
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

        if (Math.abs(deltaRoll) >= Math.PI) {
          if (deltaRoll > 0.0) offset -= Math.PI * 2;
          else offset += Math.PI * 2;
        }

        roll += offset;

        return new Vector2(arcLength, roll);
      }),
      0,
      0,
      resolution,
    );

    rollCurve.push(...cubicSplineCurve);
  }

  return rollCurve;
};