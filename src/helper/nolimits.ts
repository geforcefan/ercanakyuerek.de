import { parse } from 'csv-parse/browser/esm';
import { MathUtils, Matrix4, Vector2, Vector4 } from 'three';

import { clampedCubicSplineCurve } from '../maths/cubic';
import {
  applyRollFromCurve,
  arcLengthAtOffset,
  CurveNode,
  insertMatrix,
  insertPosition,
  matrixAtArcLength,
  toSegmentOffsets,
} from '../maths/curve';
import { fromPoints, makeClampedKnots } from '../maths/nurbs';
import { fromMatrix4 } from '../maths/vector3';

import { readCustomTrack } from './nl2park/track/custom-track';
import { isRollPoint } from './nl2park/track/roll';

export const applyRollFromCustomTrack = (
  curve: CurveNode[],
  segmentOffsets: number[],
  customTrack: ReturnType<typeof readCustomTrack>,
) => {
  const rollPoints = customTrack?.points
    .filter(isRollPoint)
    .sort((a, b) => a.position - b.position);

  let lastRoll = 0;
  let offset = 0;

  const rollCurve = clampedCubicSplineCurve(
    rollPoints.reduce<Array<Vector2>>((points, p) => {
      const arcLength = arcLengthAtOffset(p.position, segmentOffsets);
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

      points.push(new Vector2(arcLength, roll));
      if (p.strict)
        points.push(
          new Vector2(arcLength + Number.EPSILON * 500, roll),
        );
      return points;
    }, []),
    0,
    0,
    20,
  );

  applyRollFromCurve(curve, rollCurve);
};

export const curveFromCustomTrack = (
  track: ReturnType<typeof readCustomTrack>,
) => {
  if (track?.vertices.length < 2) return [];

  const sections = track?.vertices.reduce<Array<number>>(
    (points, v, i) => {
      if (v.strict || i === track?.vertices.length - 1)
        points.push(i);
      return points;
    },
    [0],
  );

  const curve: CurveNode[] = [];
  const segmentOffsets: number[] = [];

  for (let i = 0; i < sections?.length - 1; i++) {
    const numberOfVertices = sections[i + 1] - sections[i] + 1;

    const vertices = Array.from(
      { length: numberOfVertices },
      (_, index) =>
        new Vector4().fromArray(
          track?.vertices[sections[i] + index].position,
        ),
    );

    const lastCurveNode = curve[curve.length - 1];
    const lastSegmentOffset =
      segmentOffsets[segmentOffsets.length - 1];

    const nurbsCurve = fromPoints(vertices, makeClampedKnots);

    toSegmentOffsets(nurbsCurve, vertices.length).forEach(
      (offset) => {
        const segmentOffset = (lastSegmentOffset ?? 0) + offset;
        if (segmentOffset - (lastSegmentOffset ?? 0) < Number.EPSILON)
          return;
        segmentOffsets.push(segmentOffset);
      },
    );

    nurbsCurve.forEach((node) => {
      insertPosition(
        curve,
        fromMatrix4(node.matrix),
        (lastCurveNode?.segmentIndex ?? 0) + node.segmentIndex,
      );
    });
  }

  segmentOffsets.unshift(0);

  applyRollFromCustomTrack(curve, segmentOffsets, track);

  return curve;
};

export const curveFromCSVUrl = async (
  url: string,
): Promise<CurveNode[]> => {
  const response = await fetch(url);
  const data = await response.text();

  return new Promise((resolve, reject) => {
    parse<{
      PosX: string;
      PosY: string;
      PosZ: string;
      FrontX: string;
      FrontY: string;
      FrontZ: string;
      LeftX: string;
      LeftY: string;
      LeftZ: string;
      UpX: string;
      UpY: string;
      UpZ: string;
    }>(
      data,
      {
        trim: true,
        columns: true,
        skip_empty_lines: true,
        delimiter: '\t',
      },
      (err, records) => {
        if (err) reject(err);
        const curve: CurveNode[] = [];
        for (const row of records) {
          insertMatrix(
            curve,
            new Matrix4().fromArray([
              parseFloat(row.LeftX),
              parseFloat(row.LeftY),
              parseFloat(row.LeftZ),
              0,
              parseFloat(row.UpX),
              parseFloat(row.UpY),
              parseFloat(row.UpZ),
              0,
              parseFloat(row.FrontX),
              parseFloat(row.FrontY),
              parseFloat(row.FrontZ),
              0,
              parseFloat(row.PosX),
              parseFloat(row.PosY),
              parseFloat(row.PosZ),
              1,
            ]),
          );
        }
        resolve(curve);
      },
    );
  });
};
